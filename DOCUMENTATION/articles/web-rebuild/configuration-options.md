# Configuration Options (GlobalConfig)

The Web Rebuild centralises every development and tuning setting in a single
system called **GlobalConfig**. Instead of scattering flags across modules,
each system reads the values it cares about from `window.GlobalConfig` at
runtime. This article explains what that system is, the role of the
`config.dev.js` file, the three ways to set a value, and then gives a complete
reference for **every** configurable option, its default, its URL parameter (if
any), and what it actually does.

## What GlobalConfig is

`GlobalConfig` is a small singleton defined in
`Main_Game/src/engine/core/GlobalConfig.js`. It is a plain (non-module) script
that attaches itself to `window` so that any code — ES6 modules, non-module
libraries, or the browser console — can read it without import gymnastics:

```javascript
// Anywhere in the codebase or the console
window.GlobalConfig.get('physics.enabled');        // → true
window.GlobalConfig.set('debug.enabled', true);    // change at runtime
window.GlobalConfig.toggle('rendering.showFPS');   // flip a boolean
```

The object holds one big nested `config` object. The whole tree of defaults
lives in the `GlobalConfig.js` constructor; those defaults are the lowest
priority and are what you get if you set nothing.

> **Always read settings through optional chaining.** GlobalConfig loads very
> early, but defensive code should still tolerate its absence:
> `window.GlobalConfig?.get('physics.enabled') ?? true`. Read settings *at
> runtime* (each time you need them) rather than caching them once in a
> constructor, so a console `set()` takes effect immediately.

## Priority order

A setting can come from three places. Higher priority wins:

1. **URL parameters** — highest priority, ideal for one-off testing
   (`?physics=false`). They override everything for that page load.
2. **The config file** (`config.dev.js`) — your persistent, file-based
   overrides.
3. **Fallback defaults** — baked into `GlobalConfig.js`.

```
URL parameters  >  config.dev.js  >  GlobalConfig.js defaults
```

This order is implemented in the `GlobalConfig.js` constructor: it first builds
the defaults, then merges `window.devConfig` (the config file), then applies URL
parameters last so they win.

## The config file: role and usage

### What it is for

`config.dev.js` is where you keep development settings that you want to persist
across page loads without editing engine code. It defines a single global,
`window.devConfig`, whose shape mirrors the GlobalConfig tree. Anything you put
there is deep-merged over the defaults; anything you omit keeps its default.

```javascript
// config.dev.js — override only what you need
window.devConfig = {
    physics: { enabled: false },   // everything else stays at default
    debug:   { enabled: true }
};
```

### Where it lives and how it loads

The root `index.html` loads the file **before** `GlobalConfig.js`, which is why
`GlobalConfig` can pick it up during construction:

```html
<!-- index.html (load order matters) -->
<script src="Main_Game/config.dev.js"></script>           <!-- defines window.devConfig -->
<script src="Main_Game/src/engine/core/GlobalConfig.js"></script>  <!-- reads it -->
```

There are up to three file locations, by directory. **None are tracked in git**
— each is a personal, local override:

| Path | Loaded by |
|------|-----------|
| `Main_Game/config.dev.js` | the main game page (`index.html`) |
| `Main_Game/src/config.dev.js` | `src/` test pages |
| `Main_Game/Test/config.dev.js` | `Test/` pages |

All three are gitignored, so your settings stay local. The first time you set up
the project, create `Main_Game/config.dev.js` by copying the template (see
below); if the file is absent the engine simply runs on the `GlobalConfig.js`
defaults. For one-off experiments you don't want to persist at all, prefer URL
parameters.

### The template

`Main_Game/src/config.dev.template.js` is a generated reference that enumerates
**every** GlobalConfig key set to its default value, with inline comments. It is
the one file in this set that *is* tracked, and it is kept in sync with the
`this.config` object in `GlobalConfig.js`. To bootstrap your own config, copy it
to the gitignored `config.dev.js` for the page you run, delete the blocks you
don't care about, and edit the rest:

```bash
# Main game page (index.html):
cp Main_Game/src/config.dev.template.js Main_Game/config.dev.js

# (Optionally, for test pages under src/ or Test/:)
# cp Main_Game/src/config.dev.template.js Main_Game/src/config.dev.js
```

### One important override on the main page

The root `index.html` *force-enables* three loading flags immediately after
`config.dev.js` loads, regardless of what your config file says:

```javascript
window.devConfig.loading.loadBootstrap   = true;
window.devConfig.loading.loadCatalogue   = true;
window.devConfig.loading.initializeWorld = true;
```

So on the **main game page** these three flags are always `true` — the
`loading.loadBootstrap = false` style overrides only take effect on the
lightweight test pages that don't apply this guard. Keep this in mind when a
`loadBootstrap: false` in your config file appears to be ignored on the main
page; that is by design.

## How to set an option

You have three interchangeable mechanisms.

### 1. URL parameter (one-off, highest priority)

```
http://localhost:8000/?physics=false&debug=true&ignore_fullscreen=false
```

Boolean params expect the literal strings `true` / `false`. Numeric params are
parsed with `parseInt`/`parseFloat`. Only the parameters listed in the reference
below are recognised.

### 2. Config file (persistent)

Edit `config.dev.js` as shown above. Survives reloads, no code changes to the
engine.

### 3. Browser console (runtime, this session only)

```javascript
GlobalConfig.set('engine.timeScale', 0.25);   // slow motion right now
GlobalConfig.toggle('debug.enabled');
GlobalConfig.get('caos.executionQuanta');
```

### Console API reference

| Call | Effect |
|------|--------|
| `GlobalConfig.get(path, default?)` | Read a value by dot-path; returns `default` if absent. |
| `GlobalConfig.set(path, value)` | Set a value by dot-path (creates intermediate objects). |
| `GlobalConfig.toggle(path)` | Flip a boolean and return the new value. |
| `GlobalConfig.getAll()` | Deep clone of the entire current config. |
| `GlobalConfig.reset()` | Restore all settings to the baked-in defaults. |
| `GlobalConfig.getChangedSettings()` | List settings that differ from defaults. |
| `GlobalConfig.exportAsURLParams()` | Build a `?…` query string for the current non-default settings. |
| `GlobalConfig.getHelp()` | Print a quick usage cheatsheet. |

---

# Configuration reference

Every option below is addressed by its dot-path (e.g. `physics.enabled`). The
**Default** column is the value from `GlobalConfig.js`. The **URL** column gives
the URL parameter where one exists (blank means the option can only be set via
config file or console).

## physics

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `physics.enabled` | `true` | `physics` | Master switch for the physics simulation. When `false`, agents and creatures ignore gravity/velocity integration and collision response — useful for isolating agent or CAOS behaviour from movement. |
| `physics.gravity` | `9.8` | `gravity` | Gravitational acceleration applied to agents that have gravity enabled. Lower it (e.g. `4.9`) for slow falls during testing. |
| `physics.debugVisualization` | `false` | — | Draw physics debug overlays (velocity/forces/contact info) where supported. |

## debug

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `debug.enabled` | `false` | `debug` (also legacy `caos_debug`) | Master debug mode. Enables verbose engine diagnostics and the debug overlays; the CAOS error debugger is most useful with this on. |
| `debug.stepDebug` | `false` | — | Generic step-debug flag (see also `caos.stepDebugEnabled`, which is the CAOS-specific one wired to the URL). |
| `debug.verboseLogging` | `false` | `verbose` | Turn on extra-detailed logging across systems. Noisy; enable only when chasing a specific issue. |
| `debug.autoOpenConsole` | `false` | — (set automatically by `caos_step_debug=true`) | Automatically open the debug console on load. |

## caos

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `caos.stepDebugEnabled` | `false` | `caos_step_debug` | Pause at the very first CAOS instruction and step through bootstrap scripts line by line. Setting the URL param also flips `debug.autoOpenConsole` on. |
| `caos.breakpointsEnabled` | `true` | `breakpoints` | Honour CAOS breakpoints set in the debugger. Disable to run straight through. |
| `caos.executionQuanta` | `5` | `quanta` | Instructions executed per agent per tick — mirrors the original engine's per-tick instruction budget. Set to `1` for fine-grained stepping; higher values run scripts faster but less evenly. |
| `caos.showExecutionTrace` | `false` | — | Emit a per-instruction execution trace (very verbose). |
| `caos.quantizeEvents` | `true` | — | Use tick-based quantized execution for agent events, matching the original engine's behaviour. Turning this off makes events run more eagerly and diverges from the original engine timing. |
| `caos.debugLogging` | `false` | `caos_debug_logging` | Verbose CAOS VM logging. Significant performance cost — leave off unless debugging the VM. |
| `caos.stepDebugRenderFrames` | `3` | `step_render_frames` | Number of render frames to run after each step-debug pause so the screen updates between steps. `0` disables the extra rendering. |
| `caos.vmPoolSize` | `500` | `vm_pool_size` | Maximum number of recycled temporary VMs kept in the pool. `0` disables pooling (slower, but simpler to reason about). |

## rendering

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `rendering.showAgentIDs` | `false` | `show_agents` | Overlay each agent's numeric ID — handy for matching on-screen agents to debugger entries. |
| `rendering.showRoomBoundaries` | `false` | `show_rooms` | Draw room/metaroom outlines. |
| `rendering.showBoundingBoxes` | `false` | — | Draw agent bounding boxes. |
| `rendering.showFPS` | `false` | `show_fps` | Show the FPS counter. |
| `rendering.pixelPerfect` | `true` | — | Pixel-perfect (nearest-neighbour) rendering. Disable for smoothed scaling. |
| `rendering.ignoreFullscreen` | `true` | `ignore_fullscreen` | When `true`, the `WDOW` CAOS command does **not** put the game canvas into fullscreen — it logs an info entry instead. Fullscreen on the canvas hides DOM overlays such as the CAOS debugger panel, so this is on by default. Set `false` to let scripts go fullscreen. |
| `rendering.hideInactiveMetaRooms` | `true` | — | Skip drawing placeholder graphics for inactive metarooms and the agents inside them. Processing and collisions still run; this is purely a draw optimisation. |
| `rendering.floatingZoomScaleExclusions` | *(list)* | — | Agent classifiers (`{family, genus, species}`, `0` = wildcard) whose sprite size is **not** scaled by camera zoom — e.g. speech bubbles and GUI bars that must stay 1:1. |
| `rendering.floatingZoomPositionExclusions` | *(list)* | — | Agent classifiers whose screen **position** is not scaled by camera zoom — GUI elements that must stay pinned regardless of zoom. |

## loading

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `loading.loadBootstrap` | `true` | `load_bootstrap` | Load and run the bootstrap CAOS scripts. *(Forced `true` on the main page — see the note above.)* |
| `loading.loadCatalogue` | `true` | `load_catalogue` | Load `.catalogue` localisation files. *(Forced `true` on the main page.)* |
| `loading.showLoadingProgress` | `true` | — | Show the loading progress UI during startup. |
| `loading.filteredBootstrap` | `[]` | — | List of bootstrap `.cos` files to skip, written as `"directory/filename.cos"` (e.g. `"001 World/welcome screen.cos"`). Matched case-sensitively against the combined `directory/filename` path. |

> `loading.initializeWorld` is read by the test pages and is also force-enabled
> on the main page; it gates world initialization for lightweight test harnesses.

## assets

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `assets.pack` | `''` | `asset_dir` | Active [asset pack](#/article/asset-packs) — a subdirectory name under `Assets/` (e.g. `"Creatures 3"`). Empty string offers the pack chooser at startup (auto-selecting when only one valid pack exists); a non-empty value that matches a valid pack skips the chooser. |

## world

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `world.defaultWorldWidth` | `8000` | — | World width in pixels for a fresh world (the original C3 default). |
| `world.defaultWorldHeight` | `8000` | — | World height in pixels for a fresh world. |
| `world.ignoreQuitCommand` | `true` | — | When `true`, the CAOS `QUIT` command is a no-op so the engine keeps running instead of shutting down — convenient during development. |

## ui

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `ui.minimapWidth` | `240` | `minimap_width` | Width in pixels of the floating minimap window. |
| `ui.undockedExcludedBackgrounds` | `[]` | `undocked_exclude` (comma-separated) | Background name prefixes on which all floating windows are hidden — e.g. `['c3_splash', 'DS_splash']` to hide the menus on the startup screen. |
| `ui.persistSettingsToServer` | `true` | `persist_ui_settings` | Mirror floating-menu / popout / spacer / volume settings to the backend sidecar at `Assets/Rebuild/ui-settings.json`. `localStorage` stays the primary store; the server copy lets settings survive a `localStorage` reset. |

## engine

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `engine.tickRate` | `20` | `tick_rate` | World ticks per second. The original engine default is 20 (a 50 ms tick interval). Changing this alters simulation speed and timing fidelity. |
| `engine.timeScale` | `1.0` | `time_scale` | Time multiplier. `0.1` = 10% speed (slow-mo for debugging), `5.0` = 5× for fast-forwarding long-term behaviour. |
| `engine.maxTicksPerFrame` | `10` | — | Safety cap on how many world ticks may run in a single frame, preventing a "spiral of death" when the tab falls behind. |

## profiling

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `profiling.enabled` | `false` | `profiler` | Master switch for the performance profiler (Profiler debug tab). |
| `profiling.perAgentTracking` | `false` | `profiler_per_agent` | Track per-agent CAOS execution time. More overhead. |
| `profiling.perCommandTracking` | `false` | — | Track per-CAOS-command execution time. Highest overhead. |
| `profiling.historySize` | `60` | — | Frames of history retained (≈1 second at 60 fps). |
| `profiling.warnThreshold` | `50` | — | Warn when a frame exceeds this many milliseconds. |
| `profiling.criticalThreshold` | `100` | — | Flag a frame as critical above this many milliseconds. |

## logging

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `logging.forwardErrors` | `false` | `forward_errors` | Forward error-level logs to the native `console.error`, giving full stack traces in the browser console (in addition to the in-app debug console). |

## bytecode

The CAOS bytecode compiler.

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `bytecode.enabled` | `true` | `bytecode` | Master toggle for compiling CAOS scripts to bytecode (faster than tree-walking the interpreter). |
| `bytecode.format` | `'cpp'` | `bytecode_format` (`js`/`cpp`) | VM flavour: `'cpp'` is the compatibility inline-eval VM with full `CAOSVar` typing; `'js'` is the stack-based VM. |
| `bytecode.cacheSize` | `1000` | — | Maximum number of compiled scripts cached. |
| `bytecode.fallbackOnError` | `true` | — | Fall back to the interpreter if compilation fails (rather than aborting). Interacts with `haltOnCompileError`. |
| `bytecode.haltOnCompileError` | `true` | `bytecode_halt_on_compile_error` | When `true`, a compilation failure throws a **blocking** error with the compiler diagnostics instead of silently falling back to the interpreter (which can mask the real cause with an unrelated runtime error). Set `false` to fall back instead. |
| `bytecode.debugMapping` | `true` | — | Generate source maps so the debugger can map bytecode back to CAOS source lines. |

## serialization

Controls the optional JS-only companion sidecar written next to a `.wld` save.
The binary world save itself is always byte-compatible with the original engine; the
companion file only adds friendly CAOS source and debug metadata.

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `serialization.writeCompanionFile` | `true` | `write_companion_file` | Write the companion JSON sidecar (friendly CAOS source + debug metadata) next to the save. Disable for byte-parity tests against the original engine, or to keep the save directory minimal. |
| `serialization.reconstructCompanionFromBootstrap` | `true` | `reconstruct_companion_from_bootstrap` | When loading a save that has no companion sidecar, scan the bootstrap `.cos` files and re-attach friendly source to any saved script whose canonical bytes still match. Disable to skip the scan. |

## nornai

The **NornAI** subsystem is an LLM-driven creature variant. When
`nornai.enabled` is `false` (the default) the whole subsystem is a no-op: the
`NRNA` CAOS command refuses, no triggers fire, and no prompts are built. Only
turn it on if you have the backend transport configured (see
`backend/nornai.credentials.js`). The settings below are grouped by sub-object.

### Top level

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `nornai.enabled` | `false` | `nornai_enabled` | Master switch for the entire NornAI pipeline. |
| `nornai.transport` | `'cli'` | `nornai_transport` | How the backend reaches the model: `'cli'` (local `claude` CLI, no API key) or `'sdk'`. |
| `nornai.endpoint` | `'/api/nornai/query'` | `nornai_endpoint` | Backend route the frontend posts prompts to. |
| `nornai.model` | `'claude-sonnet-4-6'` | `nornai_model` | Model id passed to the backend. |
| `nornai.species` | `'adam'` | `nornai_species` | Active NornAI species — the subdirectory under `NornAI/` whose genome/prompt a freshly spawned NornAI uses. |
| `nornai.spawnLifeStage` | `0` | `nornai_spawn_lifestage` | Life stage for the next spawn (0=baby … 6=senile); the baby is aged up by N stages after birth. |
| `nornai.timeoutMs` | `300000` | `nornai_timeout` | Frontend fetch timeout for the LLM round-trip (5 min). Keep it larger than the backend timeout so the backend errors first with a precise message. |
| `nornai.maxConcurrent` | `4` | `nornai_max_concurrent` | Maximum simultaneous LLM calls (backend semaphore). |
| `nornai.pausePrompts` | `false` | `nornai_pause_prompts` | Build prompts and record them in the debug tab, but wait for a manual "Send" click before contacting the model (saves tokens while iterating on the prompt template). |
| `nornai.respectGamePause` | `true` | `nornai_respect_pause` | Defer dispatching prompts while the game is paused; queued triggers coalesce and fire on resume. |

### nornai.triggers

What causes a new LLM query to fire.

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `triggers.driveThreshold` | `0.15` | `nornai_drive_threshold` | A drive moving this far from its last-prompt baseline fires a drive trigger. |
| `triggers.audioRange` | `800` | `nornai_audio_range` | Max distance (px) a speaker can be heard from for the speech trigger. |
| `triggers.visionThreshold` | `2` | `nornai_vision_threshold` | Number of new agents that must enter view since the last prompt to fire the vision trigger. |
| `triggers.minQueryIntervalMs` | `20000` | `nornai_min_query_interval_ms` | Global floor between successive queries. |
| `triggers.debounce.rewardPunishMs` | `20000` | `nornai_debounce_rp_ms` | Debounce window collapsing bursts of reward/punish events into one query. |
| `triggers.debounce.speechMs` | `20000` | `nornai_debounce_speech_ms` | Speech-event debounce window. |
| `triggers.debounce.driveMs` | `20000` | `nornai_debounce_drive_ms` | Drive-event debounce window. |
| `triggers.debounce.handlingMs` | `20000` | `nornai_debounce_handling_ms` | Handling-event debounce window. |
| `triggers.debounce.attentionMs` | `20000` | `nornai_debounce_attention_ms` | Attention-shift debounce window. |
| `triggers.debounce.roomMs` | `20000` | `nornai_debounce_room_ms` | Room-change debounce window. |
| `triggers.debounce.visionMs` | `20000` | `nornai_debounce_vision_ms` | Vision-event debounce window. |
| `triggers.coldStartDelayMs` | `1000` | `nornai_cold_start_ms` | One-shot "first thought" delay after spawn. |
| `triggers.enableVision` | `true` | `nornai_trigger_vision` | Enable the vision trigger source. |
| `triggers.enableSpeech` | `true` | `nornai_trigger_speech` | Enable the speech trigger source. |
| `triggers.enableRewardPunish` | `true` | `nornai_trigger_rp` | Enable the reward/punish trigger source. |
| `triggers.enableRoomChange` | `true` | `nornai_trigger_room` | Enable the room-change trigger source. |
| `triggers.enableLifeStage` | `true` | `nornai_trigger_life` | Enable the life-stage trigger source. |

### nornai.prompt

How much context is packed into each prompt.

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `prompt.chemicalsIncludeZeros` | `false` | `nornai_chems_zeros` | Include zero-valued chemicals in the `[CHEMICALS]` section. |
| `prompt.maxMemoryEntries` | `64` | `nornai_max_mem` | Cap on the `[MEMORY]` list. |
| `prompt.maxVisionAgents` | `40` | `nornai_max_vision` | Cap on the `[VISION]` list. |
| `prompt.maxNearbyCreatures` | `20` | `nornai_max_nearby` | Cap on the `[NEARBY_CREATURES]` list. |
| `prompt.speechWindowTicks` | `100` | `nornai_speech_window` | A creature counts as "speaking" if it spoke within this many ticks. |
| `prompt.gradualMapDiscovery` | `true` | `nornai_gradual_map` | `[MAP]` shows only rooms/metarooms the creature has entered or seen (off = full map). |
| `prompt.mapDiscoveryScanInterval` | `10` | `nornai_map_scan_interval` | Ticks between line-of-sight room-discovery scans. |
| `prompt.mapDiscoveryRequireReachability` | `true` | `nornai_map_reachability` | Require a discovered room to be physically reachable through passable doors, filtering out "rooms below the floor" false positives. |

### nornai.debug

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `debug.logPrompt` | `false` | `nornai_log_prompt` | Log the full prompt text (chatty — only for template debugging). |
| `debug.logResponse` | `true` | `nornai_log_response` | Log the raw LLM response. |
| `debug.promptHistoryCap` | `50` | `nornai_prompt_hist_cap` | Ring-buffer size for the Prompts debug tab. |
| `debug.triggerHistoryCap` | `50` | `nornai_trigger_hist_cap` | Ring-buffer size for the Triggers debug tab. |
| `debug.commandHistoryCap` | `200` | `nornai_command_hist_cap` | Ring-buffer size for command history. |

### nornai.program

The executor that runs the LLM's parallel command tracks over many ticks.

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `program.graceTicks` | `3` | `nornai_program_grace_ticks` | Ticks after dispatch before a durative step's completion is checked. |
| `program.stepTimeoutTicks` | `600` | `nornai_program_step_timeout` | Hard per-step safety cap (~30 s at 20 tps). |
| `program.driverStepTimeoutTicks` | `6000` | `nornai_program_driver_step_timeout` | Larger absolute cap for long-running navigation steps (`GOTO_ROOM` / `TAKE_ELEVATOR`). |
| `program.walkDurationTicks` | `20` | `nornai_program_walk_ticks` | Default duration for `LEFT`/`RIGHT`/`WAIT` when the LLM omits `durationTicks`. |
| `program.maxTracks` | `8` | `nornai_program_max_tracks` | Parser cap on parallel tracks per response. |
| `program.maxStepsPerTrack` | `20` | `nornai_program_max_steps` | Parser cap on total nodes per track. |
| `program.interruptPriority` | `99` | `nornai_program_interrupt_priority` | A trigger priority ≥ this aborts a running program. `99` (above every trigger) means programs always run to completion; lower it (e.g. `9`) to let reward/punish interrupt. |
| `program.enableFlowControl` | `true` | `nornai_flow_control` | Accept `IF`/`WHILE`/`REPEAT`/`WAIT_UNTIL` flow nodes in programs. |
| `program.flow.maxNestingDepth` | `6` | — | Max flow-node nesting depth (parser). |
| `program.flow.maxWhileIterations` | `1000` | — | Per-`WHILE` iteration cap (runtime). |
| `program.flow.maxRepeatTimes` | `1000` | — | Cap on a `REPEAT`'s `times`. |
| `program.flow.defaultWaitUntilTimeoutTicks` | `600` | — | `WAIT_UNTIL` timeout when the LLM omits it. |
| `program.flow.maxWaitUntilTimeoutTicks` | `6000` | — | Hard cap on a `WAIT_UNTIL` timeout. |
| `program.flow.maxNodeVisitsPerTick` | `4096` | — | Per-tick instant-work guard for the executor. |

### nornai.hooks

Deferred `{trigger, program}` rules the LLM authors that run autonomously
between queries.

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `hooks.enabled` | `true` | `nornai_hooks_enabled` | Master switch for hooks. |
| `hooks.maxHooks` | `30` | `nornai_hooks_max` | Cap on the persistent hook bank. |
| `hooks.evalIntervalTicks` | `10` | `nornai_hooks_eval_interval` | Ticks between hook-trigger scans (~0.5 s at 20 tps). |
| `hooks.cooldownTicks` | `40` | `nornai_hooks_cooldown` | After a hook program ends, that hook can't re-fire for this long. |
| `hooks.interruptPriority` | `6` | — | Hooks at/above this priority may interrupt a running LLM prompt-program; below it they defer. |

### nornai.babble & nornai.speak

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `babble.enabled` | `true` | `nornai_babble` | Master toggle for spontaneous NornAI babble (ported from the original engine's LinguisticFaculty). |
| `babble.oddsDenom` | `120` | `nornai_babble_odds` | 1-in-N chance per NornAI tick to babble. |
| `speak.bubbleExtend` | `true` | `nornai_speak_bubble_extend` | Extend LLM `SPEAK` bubbles past the default ~20 ticks so longer sentences stay readable. |
| `speak.bubbleBaseTicks` | `30` | `nornai_speak_bubble_base` | Minimum bubble lifetime for an LLM sentence. |
| `speak.bubbleCharDivisor` | `2` | `nornai_speak_bubble_div` | +1 tick of life per this many characters. |
| `speak.bubbleMaxTicks` | `200` | `nornai_speak_bubble_max` | Cap on bubble lifetime. |

### nornai.goto & nornai.elevator

Autonomous navigation.

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `goto.routeMaxRooms` | `128` | `nornai_goto_max_rooms` | BFS node cap when resolving a route (high enough for cross-metaroom routes). |
| `goto.gravityGate` | `true` | `nornai_goto_gravity` | A creature may drop down through a permeable floor-door but not walk up through a ceiling-door; lifts and learned links are exempt. |
| `goto.maxStepUpPx` | `32` | — | Max upward step (px) at a door still treated as walkable; larger means a floor change that needs a lift. |
| `goto.stuckTimeoutTicks` | `600` | `nornai_goto_stuck` | No room-progress for this long → `GOTO_ROOM` gives up. The distance-progress detector resets it on genuine forward motion. |
| `goto.speculativeLifts` | `true` | `nornai_goto_speculative_lifts` | Route through a discovered lift even if it has never been ridden. |
| `goto.maxWalkableSlope` | `1.0` | — | Max `|rise/run|` the creature can walk; `1.0` ≈ 45°. |
| `goto.maxRouteRefinementAttempts` | `8` | `nornai_goto_max_refinement` | Retries after floor-walkability rejections before returning no-route. |
| `goto.prioritizeLiftExploration` | `true` | `nornai_goto_prioritize_lifts` | Prefer the closest un-ridden lift shaft when exploring (one ride teaches the whole shaft). |
| `elevator.approachTimeoutTicks` | `900` | `nornai_elevator_approach_timeout` | Walking-phase cap (approach button / enter cabin). |
| `elevator.phaseTimeoutTicks` | `400` | `nornai_elevator_phase_timeout` | Non-walking-phase stall cap (wait-cabin / exit-cabin). |
| `elevator.rideTimeoutTicks` | `1200` | `nornai_elevator_ride_timeout` | Cap on the whole multi-floor RIDE phase. |
| `elevator.rideStepTicks` | `30` | `nornai_elevator_ride_step` | Interval between cabin up/down activations during RIDE. |

### nornai.persistence & nornai.filters

| Key | Default | URL | Effect |
|-----|---------|-----|--------|
| `persistence.writeSidecar` | `true` | `nornai_persist_write` | Gate the save-side NornAI companion sidecar (`…​.nornai.json`) write. |
| `persistence.applyOnLoad` | `true` | `nornai_persist_apply` | Gate the load-side promote/apply of the sidecar. Absent sidecar → creatures load as plain genetic-brain Creatures. |
| `persistence.includeDebugHistory` | `true` | `nornai_persist_debug_history` | Include prompt/trigger/command history in the sidecar. |
| `persistence.maxSidecarBytes` | `8388608` (8 MB) | `nornai_persist_max_bytes` | Soft cap; if exceeded, the codec drops debug history and re-serialises once. |
| `filters.triggerIgnoredClassifiers` | `[]` | — | `"FAMILY.GENUS.SPECIES"` patterns (`*` = wildcard) whose agents never fire a NornAI trigger — silence noisy agent types (e.g. `"2.19.*"` for rain). |
| `filters.visionIgnoredClassifiers` | `[]` | — | Patterns whose agents are omitted from the `[VISION]` and `[NEARBY_CREATURES]` prompt sections. |

---

## URL parameter quick reference

The most commonly used parameters, for copy-paste:

```
?physics=false            disable physics
?gravity=4.9              half gravity
?debug=true               debug mode
?verbose=true             verbose logging
?caos_step_debug=true     step through CAOS from the first instruction
?caos_debug_logging=true  verbose CAOS VM logging (slow)
?quanta=1                 single-step CAOS execution budget
?ignore_fullscreen=false  allow WDOW to go fullscreen
?show_agents=true         show agent IDs
?show_rooms=true          show room boundaries
?show_fps=true            show FPS counter
?tick_rate=20             world ticks/second
?time_scale=0.1           10% speed (slow motion)
?load_bootstrap=false     skip bootstrap (test pages only)
?asset_dir=Creatures 3    pick an asset pack, skip the chooser
?bytecode=false           disable bytecode compilation
?forward_errors=true      forward errors to console.error
```

NornAI exposes a large additional set of `nornai_*` parameters — see the
nornai tables above for the full list.

## Adding a new option

When you add a feature that needs a setting, register it in three places so it
stays discoverable and documented:

1. **`GlobalConfig.js`** — add the key (with its default) to the `this.config`
   object, and add URL-parameter parsing in `applyURLParameters()` if it should
   be settable from the URL.
2. **`config.dev.template.js`** — the template is a default-valued mirror of
   `GlobalConfig.js`; keep it in sync (it is regenerated from that object).
3. **This article** — add a row to the relevant category table.

Read the value with optional chaining and a default, at runtime:

```javascript
const enabled = window.GlobalConfig?.get('myFeature.enabled') ?? true;
```

## Troubleshooting

```javascript
console.log(window.GlobalConfig);              // is it loaded?
GlobalConfig.getAll();                          // full current config
GlobalConfig.getChangedSettings();              // what differs from defaults
GlobalConfig.exportAsURLParams();               // shareable URL of current state
GlobalConfig.getHelp();                         // cheatsheet
```

- **A config-file change has no effect.** Confirm `config.dev.js` defines
  `window.devConfig` and loads *before* `GlobalConfig.js`. Remember the
  priority order: a URL parameter for the same key will override it.
- **`loadBootstrap: false` is ignored on the main page.** Expected — the main
  page force-enables `loadBootstrap`, `loadCatalogue`, and `initializeWorld`.
  Use a test page for that override.
- **Editing the wrong file.** The main game page loads
  `Main_Game/config.dev.js`; `src/` and `Test/` pages load their own
  `config.dev.js` in those directories. All are gitignored — if none exists, the
  engine runs on defaults, which is expected on a fresh checkout until you create
  one from the template.
