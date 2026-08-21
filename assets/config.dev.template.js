/**
 * Developer Configuration Template
 *
 * Copy this file to config.dev.js and customize your development settings.
 * config.dev.js is gitignored so your personal settings won't be committed.
 *
 * Priority: URL parameters > config.dev.js > GlobalConfig.js defaults
 *
 * EVERY configurable key is listed below, COMMENTED OUT, at its engine
 * default (the `this.config` object in Main_Game/src/engine/core/
 * GlobalConfig.js). Leave a line commented to inherit the engine default —
 * including future changes to it. Uncomment a line ONLY to override it.
 *
 * Merge semantics: objects merge per-key, but ARRAYS (and scalars) REPLACE
 * the engine default wholesale. Uncommenting an array pins your copy
 * forever — it will shadow any entries later added to the engine default.
 */

// Define developer configuration (empty sections inherit all engine defaults)
window.devConfig = {
    physics: {
        // enabled: true,
        // gravity: 9.8,
        // debugVisualization: false,
        // roomIndexEnabled: true,  // Spatial room index for physics containment queries
        //                          // (?room_index=false to fall back to linear scans)
        // roomIndexVerify: false   // Run index AND linear scan, log mismatches (slow;
        //                          // validation only — ?room_index_verify=true)
    },
    debug: {
        // enabled: false,
        // stepDebug: false,
        // verboseLogging: false,
        // autoOpenConsole: false,
        // enableDebugKeys: true,            // F3 debug overlay, F12 console, pause/step keys.
        //                                   // Set false to disable the hotkeys entirely
        //                                   // (prevents accidentally toggling the green
        //                                   // debug overlay with F3)
    },
    caos: {
        // stepDebugEnabled: false,
        // breakpointsEnabled: true,
        // executionQuanta: 5,
        // showExecutionTrace: false,
        // quantizeEvents: true,  // Use tick-based quantized execution for agent events (original engine behavior)
        // debugLogging: false,   // Enable verbose CAOS debug logging (impacts performance)
        // stepDebugRenderFrames: 3,  // Number of render frames to run after each step debug pause (0 to disable)
        // vmPoolSize: 500,       // Max recycled temporary VMs kept in pool (0 to disable pooling)
        // pauseOnError: true     // true (default) = pause ALL CAOS execution on the first script
        //                        // error and take over the debug console for inspection.
        //                        // false = C++ semantics: a script runtime error kills only that
        //                        // script; the world keeps running (DS autokill).
        //                        // URL param: ?pause_on_error=false
    },
    rendering: {
        // showAgentIDs: false,
        // showRoomBoundaries: false,
        // showBoundingBoxes: false,
        // showFPS: false,
        // pixelPerfect: true,
        // maxPixelRatio: 1.5,      // Cap on devicePixelRatio for the canvas backing store
        //                          // (0 = uncapped). Fill cost scales with DPR², so capping
        //                          // is the main FPS lever on high-DPR low-end devices.
        //                          // Effective ratio is floored to an INTEGER (fractional
        //                          // ratios cause 1px antialiased seams between bg tiles),
        //                          // so 1.5 = 1× on Retina; set 2 for full sharpness.
        //                          // URL override: ?max_pixel_ratio=2
        // ignoreFullscreen: true,  // When true (default), the WDOW CAOS command does NOT enter
        //                          // fullscreen — it logs an info entry instead. Fullscreen on the
        //                          // game canvas hides DOM overlays (e.g. the CAOS debugger panel),
        //                          // so this is on by default. Set false / ?ignore_fullscreen=false
        //                          // to allow scripts to take the game fullscreen via WDOW.
        // hideInactiveMetaRooms: true,  // Skip drawing inactive metaroom placeholders and agents in inactive metarooms (processing/collision still applies)

        // Agents excluded from zoom scaling (sprite size stays 1:1) and from
        // zoom positioning (screen position not scaled by zoom). The engine
        // ships working lists in GlobalConfig.js — leave these UNSET to use
        // them. Defining a list here REPLACES the engine default wholesale
        // (entries are not merged), so only uncomment to fully override.
        // Each entry is {family, genus, species} — use 0 as wildcard.
        // floatingZoomScaleExclusions: [
        //     { family: 2, genus: 1, species: 1 },   // Hand pointer
        //     { family: 1, genus: 2, species: 12 },  // GUI toolbar
        // ],
        // floatingZoomPositionExclusions: [
        //     { family: 1, genus: 2, species: 12 },  // GUI toolbar
        // ]
    },
    loading: {
        // loadBootstrap: true,
        // loadCatalogue: true,
        // showLoadingProgress: true,
        // loadAuxiliaryC3: true,  // When the active pack is Docking Station and a sibling
        //                         // "Creatures 3" pack exists, merge C3's catalogue and load
        //                         // C3's bootstrap folders for DOCKED worlds. Set false to
        //                         // force pure Docking-Station behaviour.
        // List of bootstrap COS files to skip when loading. Each entry must
        // include the directory name to disambiguate (e.g. "001 World/welcome screen.cos").
        // Matched case-sensitively against the combined "directory/filename" path.
        // filteredBootstrap: []
    },
    assets: {
        // Active asset pack — a subdirectory name under Assets/ (e.g.
        // "Creatures 3"). Empty string => offer the pack chooser at startup
        // (auto-selecting when only one valid pack exists). A non-empty value
        // matching a valid pack skips the chooser and uses that pack.
        // Override at runtime with the URL param ?asset_dir=<name>.
        // pack: ''
    },
    localisation: {
        // Game language as an RFC-1766 tag ("en", "de", "fr", "en-GB"), used to pick
        // localised catalogue files and PRAY resource files (.agent/.family/.creature).
        // Empty string (default) => auto-detect from the browser; a non-empty value
        // overrides that detection. Override at runtime with ?lang=<tag>.
        // Check what's in effect with GlobalConfig.getLanguageDetail().
        // language: ''
    },
    world: {
        // defaultWorldWidth: 8000,
        // defaultWorldHeight: 8000,
        // ignoreQuitCommand: true,  // If true, CAOS QUIT command is a no-op (keeps engine running)

        // Rolling CA-value history behind the Map debugger's per-room trend
        // arrows (Map tab -> select a room -> CA Properties). Every window is
        // measured in WORLD TICKS, not seconds, so a paused game neither ages
        // nor flushes the history. At the default 20 TPS: 1200 ticks = 1 min,
        // 24000 ticks = 20 min = one game day.
        //
        // BEWARE DAY ALIASING when changing longIntervalTicks. Light and heat
        // are emitted on the 5-step time-of-day, so a long window that is not a
        // whole multiple of a game day (tickRate * 60 * dayLengthInMinutes =
        // 24000 ticks by default) beats against that cycle. Half a day (12000)
        // is the worst case: it compares a room to the opposite phase of its own
        // diurnal rhythm, so the arrow sits pinned up or down and flips twice a
        // day on a world that is actually steady.
        // caTrends: {
        //     enabled: true,              // Master toggle. URL param: ?ca_trends=false
        //     sampleIntervalTicks: 1200,  // Ticks between whole-map CA snapshots. Keep it equal to
        //                                 // shortIntervalTicks (and a divisor of longIntervalTicks) so
        //                                 // both windows land on an exact snapshot. Lowering it buys
        //                                 // finer alignment at the cost of memory and sidecar size.
        //                                 // URL param: ?ca_trend_sample=600
        //     shortIntervalTicks: 1200,   // Short ("1 min") window.  URL param: ?ca_trend_short=1200
        //     longIntervalTicks: 24000,   // Long (one game day) window.  URL param: ?ca_trend_long=24000
        //     stableThreshold: 0.1,       // |now - then| at or below this shows "=" instead of an arrow.
        //                                 // URL param: ?ca_trend_threshold=0.1
        //     persist: true               // Write the snapshots into the world's JSON companion sidecar
        //                                 // so trends survive save/load. The ring is long/sample + 2
        //                                 // snapshots (22 by default, ~31 KB each on a 512-room C3 map).
        //                                 // URL param: ?ca_trend_persist=false
        // }
    },
    ui: {
        // minimapWidth: 240,      // Width in pixels of the floating minimap window
        // undockedExcludedBackgrounds: ['c3_splash', 'DS_splash'],  // Background name prefixes that hide all floating windows
        // closeConfirmExcludedBackgrounds: ['c3_splash', 'DS_splash'],  // Background name prefixes that skip the tab-close "world will be lost" confirmation
        // persistSettingsToServer: true   // Mirror floating-menu / popout / spacer / volume settings to the backend
        //                                 // sidecar at Rebuild/Assets/Rebuild/ui-settings.json. localStorage remains
        //                                 // primary; the server file lets settings survive a localStorage reset.
    },
    audio: {
        // muteOnFocusLoss: true   // Mute all game audio while the tab/window is unfocused, unmute
        //                         // automatically when focus returns. The game keeps running — only
        //                         // the audio output is silenced. URL param: ?mute_on_focus_loss=false
    },
    engine: {
        // tickRate: 20,           // Ticks per second (original engine default: 20 = 50ms per tick)
        // timeScale: 1.0,         // Time multiplier (1.0 = normal speed)
        // maxTicksPerFrame: 4,    // Safety limit to prevent spiral of death
        // runInBackground: true   // Keep the simulation ticking at full speed while the browser
        //                         // tab is hidden (worker-driven clock; rendering is skipped).
        //                         // Set false for the old behavior — the game effectively
        //                         // freezes while hidden. URL param: ?run_in_background=false
    },
    profiling: {
        // enabled: false,         // Master toggle for performance profiler
        // perAgentTracking: false, // Track per-agent CAOS execution time
        // perCommandTracking: false, // Track per-CAOS-command execution time
        // historySize: 60,        // Frames of history to keep (1 second at 60fps)
        // warnThreshold: 50,      // Warn if frame time > 50ms
        // criticalThreshold: 100  // Critical if frame time > 100ms
    },
    logging: {
        // forwardErrors: false    // Forward error-level logs to native console.error for full stack traces
    },
    analytics: {
        // enabled: true,          // Anonymous usage statistics (Google Analytics); false = opt out.
        //                         // URL param: ?analytics=false. Release builds carry the GA4
        //                         // measurement ID as a build stamp (BuildTool "Analytics" field);
        //                         // dev has no ID by default, so nothing reports.
        // gaMeasurementId: ''     // GA4 Measurement ID (G-XXXXXXXXXX); empty disables analytics
        //                         // entirely. Set ONLY to test against your own property.
    },
    bytecode: {
        // enabled: true,          // Master toggle for bytecode compilation
        // format: 'cpp',          // 'js' for stack-based VM, 'cpp' for the engine-compatible inline-eval VM with full CAOSVar typing
        // cacheSize: 1000,        // Maximum number of compiled scripts to cache
        // fallbackOnError: true,  // Fall back to interpreter if compilation fails
        // haltOnCompileError: true, // When true (default), a bytecode compilation failure throws a
        //                           // blocking error with the compiler diagnostics instead of silently
        //                           // falling back to the interpreter VM (which can mask the real cause
        //                           // with an unrelated runtime error). Set false to fall back instead.
        // debugMapping: true      // Generate source maps for debugging
    },
    serialization: {
        // writeCompanionFile: true,  // Write the JS-only companion JSON sidecar (friendly CAOS
        //                            // source + debug metadata) next to the .wld save. Disable
        //                            // for byte-parity tests or to keep the save directory minimal.
        // reconstructCompanionFromBootstrap: true  // When loading a save that has no companion
        //                                          // sidecar, scan the bootstrap .cos files and
        //                                          // attach friendly source to any saved script
        //                                          // whose canonical bytes still match. Disable
        //                                          // to skip this scan (e.g. when bootstrap is
        //                                          // unavailable or you want raw canonical text).
    },
    // Nornai (Norn + AI) — LLM-driven creature variant. When
    // `enabled` is false (default) the entire subsystem is a
    // no-op; NEW: NRNA refuses, no triggers fire, no prompts are
    // built. See DOCUMENTATION/Plans/nornai_phase1_implementation_plan.md.
    nornai: {
        // enabled: false,
        // transport: 'cli',                          // 'cli' or 'sdk' — backend resolves & overrides per-request
        // endpoint: '/api/nornai/query',
        // remoteEndpoint: '',                        // Static (no-backend) builds only: absolute http(s) URL of a
        //                                            // machine running the Node backend (e.g. 'http://localhost:8000';
        //                                            // '/api/nornai' may be included or omitted). Empty = NornAI off.
        //                                            // Ignored by the Node backend. When the static build is served
        //                                            // from a DIFFERENT origin than that backend, its page origin must
        //                                            // be listed in the backend's LLM allowed origins (Launcher field /
        //                                            // env NORNAI_ALLOWED_ORIGINS) or the browser blocks the requests.
        // model: 'claude-sonnet-4-6',
        // Active NornAI species — the subdirectory name under
        // Rebuild/NornAI/ whose config.json (genome) and prompt.md a
        // freshly-spawned Nornai uses. The debugger's species
        // dropdown writes here; NEW: NRNA reads it at spawn time.
        // species: 'adam',
        // Initial life stage for the next spawn. The debugger's
        // life-stage dropdown writes here; `_spawnNornai`
        // appends `AGES <n>` after `BORN` to advance the
        // freshly-created baby by N stages.
        //   0 = BABY (no aging)
        //   1 = CHILD
        //   2 = ADOLESCENT
        //   3 = YOUTH
        //   4 = ADULT
        //   5 = OLD
        //   6 = SENILE
        // spawnLifeStage: 0,
        // Frontend-side fetch timeout for the LLM round-trip.
        // Large prompts (with [MAP] + [BIOCHEMISTRY] + full dynamic
        // context) commonly take 30-90s for the CLI to return, so
        // 30s was too aggressive. Keep this STRICTLY LARGER than
        // the backend's `NornaiService` timeout so the backend
        // errors first with a precise message instead of the
        // browser aborting with a generic "timeout".
        // timeoutMs: 300000,                         // 5 minutes
        // maxConcurrent: 4,                          // honoured by the backend semaphore
        // When true, the pipeline builds the prompt and records it
        // in the Prompts debug tab BUT does not auto-send to Claude.
        // The user clicks a per-entry "Send" button to dispatch
        // (or "Discard" to drop). Useful for iterating on the
        // prompt template without burning tokens.
        // pausePrompts: false,
        // When true (default), `_fireScheduledQuery` defers
        // dispatching the LLM prompt while the game is paused
        // (`gameEngine.paused`). The trigger keeps polling every
        // ~250 ms and fires as soon as the game unpauses, so a
        // burst of triggers during pause coalesces into one
        // prompt the moment play resumes. `forceQueryNow`
        // (debug button / cold-start direct call) ignores this
        // gate — explicit user actions still go through.
        // respectGamePause: true,
        triggers: {
            // driveThreshold: 0.15,                  // a drive moving this far from its last-prompt baseline fires a drive trigger
            // audioRange: 800,                       // speech trigger: max distance (px) a speaker can be heard from
            // visionThreshold: 2,                    // # of new agents that must enter view since the last prompt to fire the vision trigger
            // minQueryIntervalMs: 20000,             // global floor between successive queries (20s)
            // Every per-trigger debounce defaults to 20s — bursts
            // of the same event collapse to one query per 20s.
            debounce: {
                // rewardPunishMs: 20000,
                // speechMs:       20000,
                // driveMs:        20000,
                // handlingMs:     20000,
                // attentionMs:    20000,
                // roomMs:         20000,
                // visionMs:       20000,
            },
            // coldStartDelayMs: 1000,                // one-shot first-thought delay — not a debounce
            // noPromptTimeoutMs: 300000,             // idle heartbeat: fire one query if no prompt has been sent for this long (ms — 5 min; 0 disables)
            // enableVision: true,
            // enableSpeech: true,
            // enableRewardPunish: true,
            // enableRoomChange: true,
            // enableLifeStage: true,
        },
        prompt: {
            // chemicalsIncludeZeros: false,
            // maxMemoryEntries: 64,
            // maxVisionAgents:  40,
            // maxNearbyCreatures: 20,        // cap on the [NEARBY_CREATURES] list
            // speechWindowTicks:  100,       // a creature counts as "speaking" if it spoke within this many ticks
            // maxHeardSentences:  20,        // cap on the [HEARD] rolling log of sentences this creature has heard
            // maxHeardSounds:     20,        // cap on the [HEARD_SOUNDS] rolling log of world sounds this creature has heard
            // Gradual map discovery: the [MAP] section shows only the
            // rooms/metarooms this Nornai has entered or seen. Turn
            // off to fall back to the full-map (legacy) behaviour.
            // gradualMapDiscovery:     true,
            // mapDiscoveryScanInterval: 10,  // ticks between line-of-sight room scans
            // When true (default), the discovery scan requires a
            // candidate room to be reachable from the creature's
            // current room via a chain of doors whose
            // permeability the creature can physically pass.
            // mapDiscoveryRequireReachability: true,
        },
        debug: {
            // logPrompt:          false,             // chatty — only enable when debugging the template
            // logResponse:        true,
            // promptHistoryCap:   50,
            // triggerHistoryCap:  50,
            // commandHistoryCap: 200,
        },
        // Command-program executor. A Nornai response is a set of
        // parallel tracks of sequential steps; the executor runs
        // them over many ticks (see NornaiProgram.js).
        program: {
            // graceTicks:        3,    // ticks after dispatch before a durative step's completion is checked
            // stepTimeoutTicks:  600,  // hard per-step safety cap (~30s at 20 tps)
            // driverStepTimeoutTicks: 6000, // larger absolute cap for GOTO_ROOM / TAKE_ELEVATOR (long-running navigation)
            // walkDurationTicks: 20,   // default duration for LEFT/RIGHT/WAIT when the LLM omits durationTicks
            // maxTracks:         8,    // parser cap on parallel tracks per response
            // maxStepsPerTrack:  20,   // parser cap on TOTAL nodes per track (counted recursively)
            // interruptPriority: 99,   // trigger priority >= this aborts a running program.
            //                          //   Default 99 is above every trigger (max 10), so NOTHING
            //                          //   interrupts: a program always runs to completion and
            //                          //   intermediate triggers are punted until it finishes
            //                          //   (the `program-complete` trigger then carries them all
            //                          //   into one query). Lower to e.g. 9 to let reward/punish
            //                          //   abort a running program.
            // enableFlowControl: true, // accept IF/WHILE/REPEAT/WAIT_UNTIL flow nodes in programs
            flow: {
                // maxNestingDepth:              6,    // max flow-node nesting depth (parser)
                // maxWhileIterations:           1000, // per-WHILE iteration cap (runtime, persists across ticks)
                // maxRepeatTimes:               1000, // cap on a REPEAT's `times`
                // defaultWaitUntilTimeoutTicks: 600,  // WAIT_UNTIL timeout when the LLM omits it
                // maxWaitUntilTimeoutTicks:     6000, // hard cap on a WAIT_UNTIL timeout
                // maxNodeVisitsPerTick:         4096, // per-tick instant-work guard for the executor
            },
        },
        // Hooks — deferred {trigger, program} rules the LLM authors
        // (HOOK_SET / HOOK_DELETE) that run autonomously to fill the
        // idle gap between LLM queries.
        hooks: {
            // enabled:           true,
            // maxHooks:          30,   // cap on the persistent hook bank (shipped instincts + LLM HOOK_SETs combined)
            // evalIntervalTicks: 10,   // ticks between hook-trigger scans (~0.5s at 20 tps)
            // cooldownTicks:     40,   // after a hook program ends, that hook can't re-fire for this long
            // Hooks at/above this priority are "vital" and may INTERRUPT a
            // running LLM prompt-program (abort it + re-plan afterward);
            // hooks below it defer entirely so exploration/curiosity never
            // derails a deliberate plan. Default 6 → flee(9)/sleep(8)/
            // seek-food(7)/retreat(6) interrupt; curiosity/explore(≤4) don't.
            // interruptPriority: 6,
        },
        // Spontaneous babble. Matches the original engine's linguistic faculty
        // update loop (1-in-120 per tick when alert → SayWhatDoing /
        // ExpressNeed / ExpressOpinion). NornAI owns this loop on its
        // own tick so it yields to LLM SPEAK and is debug-visible.
        // Lifestage does NOT affect frequency — only pronunciation,
        // via the existing Vocab infant-speak path.
        babble: {
            // enabled:   true,   // master toggle for spontaneous NornAI babble
            // oddsDenom: 120,    // 1-in-N chance per NornAI tick (original engine used 120)
        },
        // LLM SPEAK output. The shared CAOS bubble factory gives every
        // speech bubble a fixed ~20-tick life — fine for short babble
        // but too brief for longer LLM sentences. NornAI re-times the
        // bubble of its own SPEAK sentences (in JS, no bootstrap CAOS
        // change) to a length-scaled lifetime.
        speak: {
            // bubbleExtend:    true,  // extend LLM SPEAK bubbles past the default ~20 ticks
            // bubbleBaseTicks: 50,    // min lifetime for an LLM sentence (~2.5s)
            // bubbleCharDivisor: 1,   // +1 tick of life per this many characters (lower = longer)
            // bubbleMaxTicks:  320,   // cap on bubble lifetime (~16s)
        },
        // SPEAK_TO directed-speech driver: walk the speaker into hearing
        // range of a target creature, then deliver the bubble. Reception
        // rides the existing speech path (triggers.audioRange governs
        // earshot); these knobs only tune the approach.
        speakto: {
            // hearingBufferPx:            250,  // arrive this far INSIDE earshot (deliver tolerance =
            //                                   // triggers.audioRange - this) so the message still
            //                                   // lands if the target is moving
            // approachTimeoutTicks:       400,  // cap on the close-in APPROACH phase
            // approachSlipMarginPx:        40,  // give up if target moves this far past best-seen...
            // approachSlipPatienceTicks:   60,  // ...for this many ticks (→ target-moving-away)
        },
        // GOTO_ROOM autonomous pathfinding.
        goto: {
            // routeMaxRooms:     128,  // BFS node cap when resolving a route (128 covers cross-metaroom routes)
            // Gravity gate on door-walking BFS: a creature
            // can drop DOWN through a permeable floor-door but
            // cannot walk UP through a permeable ceiling-door
            // (gravity wins, no climb / no jump). Lifts /
            // learned mapLinks are exempt — they're the
            // mechanisms that DO defeat gravity. Disable for
            // unusual worlds with climbable ladders or
            // wall-walking creatures.
            // gravityGate:       true,
            // Max upward step (world px) at a door still treated as
            // walkable by the gravity gate. A continuous wall-door
            // boundary is ≈0 px; a real floor change is a full room
            // height, so 32 cleanly separates "walk through" from
            // "ride the elevator up".
            // maxStepUpPx:       32,
            // stuckTimeoutTicks: 600,  // no room-progress for this long → GOTO_ROOM gives up
            //                          // (600 accommodates the C3 gait speed of ~0.3-1 px/tick;
            //                          // the distance-progress detector still fails fast when
            //                          // the creature makes no progress at all)
            // speculativeLifts:  true, // route through a discovered lift even if never ridden
            // maxWalkableSlope:  1.0,  // max |rise/run| the creature can walk; 1.0 ≈ 45° (stock C3 default)
            // maxRouteRefinementAttempts: 8, // retries after floor-walkability rejections before returning no-route
            // Exploration priority for un-ridden lift shafts. When
            // true, GOTO_ROOM CLOSEST_UNEXPLORED_ROOM picks the
            // closest reachable button-room of a discovered shaft
            // never ridden, over a plain walking frontier — one
            // ride teaches the whole shaft.
            // prioritizeLiftExploration: true,
        },
        // TAKE_ELEVATOR ride sequence.
        elevator: {
            // approachTimeoutTicks: 900, // walking-phase cap (approach button / enter cabin) — generous: a creature may cross a room
            // phaseTimeoutTicks: 400,  // non-walking-phase stall cap (wait-cabin / exit-cabin)
            // rideTimeoutTicks:  1200, // cap on the whole multi-floor RIDE phase
            // rideStepTicks:     30,   // interval between cabin up/down activations during RIDE
        },
        // NornAI companion-file persistence. The world binary save
        // (TheWorldAndEverythingInIt) is byte-for-byte compatible with the original engine;
        // the controller layer (memory, goals, plans, agentKnowledge,
        // affinities, hooks, programBank, in-flight programs/drivers,
        // debug history) lives in a parallel JSON sidecar named
        // TheWorldAndEverythingInIt.nornai.json. Companion-absent
        // load → creatures load as plain Creatures driven by their
        // genetic brain.
        persistence: {
            // writeSidecar:        true,        // gate save-side sidecar write
            // applyOnLoad:         true,        // gate load-side promote/apply
            // includeDebugHistory: true,        // include promptHistory / triggerHistory / commandHistory in the sidecar
            // maxSidecarBytes:     8388608,     // soft cap (8 MB); if exceeded the codec drops debug history and re-serialises once
        },
        // Agent-classifier filter lists. Each entry is a
        // "FAMILY.GENUS.SPECIES" pattern; `*` is a per-component
        // wildcard (e.g. "2.19.*" = the whole rain family). Empty by
        // default — populate to silence noisy agent types (e.g. rain).
        // NOTE: arrays replace the engine default wholesale.
        filters: {
            // triggerIgnoredClassifiers: [],  // agents matching these never fire a Nornai trigger (speech / attention / vision)
            // visionIgnoredClassifiers: [],   // agents matching these are omitted from [VISION] and [NEARBY_CREATURES]
        },
    },

    // === Help Chat ===
    // The player-facing LLM assistant opened from the Floating Menu
    // ("💬 Ask Claude"). It shares NornAI's transport and backend credentials
    // (backend/nornai.credentials.js), so configuring one configures both.
    // See DOCUMENTATION/Tech/Help_Chat.md and the wiki article
    // "Configuring the LLM Connection".
    help: {
        // enabled: true,
        // model: '',                    // '' = inherit nornai.model
        // transport: '',                // '' = inherit nornai.transport ('cli' | 'sdk')
        // contextDetail: 'tiered',      // 'full' | 'tiered' | 'selected'
        //                               // Every creature always appears; this only picks who gets
        //                               // the expensive full dump vs a one-line summary.
        //                               //   full     — every creature fully dumped (big prompts)
        //                               //   tiered   — full for selected/held/on-screen, summary for the rest
        //                               //   selected — full for the selected/held creature only
        // maxConversationTurns: 10,     // prior Q&A pairs replayed into [CONVERSATION]
        // historyCap: 100,              // exchanges kept in memory / listed in Home → Help
        //                               // (in-memory only — history is cleared on world load
        //                               // and does not survive a page reload)
        // eventLogCap: 200,             // recent life events kept for the [EVENTS] slot
        // includeDocIndex: true,        // send the wiki/chemical/script table of contents (~26KB, chemicals
        //                               // listed with their one-line role) so the
        //                               // assistant knows what documentation exists and can link to it;
        //                               // turning it off does not disable links, only the catalogue
        // maxSensoryAgents: 40,        // cap on the hearing list in the selected creature's sensory block
        // maxOrganWiringLines: 800,     // cap on the organ reactions/receptors/emitters listed for the
        //                               // selected creature (~340 on the standard genome). Every detailed
        //                               // creature still gets organ vitals; 0 drops the wiring only.
        // maxRoomContentAgents: 1000,   // safety cap on [ROOM_CONTENTS], in distinct
        //                               // room/classifier pairs (~700 on a stock C3 world)
        // pointerProximityRadius: 200,  // world px searched around the hand for [POINTER]
        debug: {
            // logPrompt: true,          // dump the assembled prompt to the console
            // logResponse: true,        // dump the raw LLM response to the console
        },
    },
};

// Example configurations for common development scenarios:

// === Testing Agents Without Physics ===
// window.devConfig = {
//     physics: { enabled: false },
//     debug: { enabled: true },
//     rendering: { showAgentIDs: true }
// };

// === CAOS Script Development ===
// window.devConfig = {
//     caos: {
//         stepDebugEnabled: true,
//         executionQuanta: 1
//     },
//     debug: {
//         enabled: true,
//         autoOpenConsole: true
//     }
// };

// === Performance Testing ===
// window.devConfig = {
//     debug: { verboseLogging: false },
//     rendering: {
//         showFPS: true,
//         pixelPerfect: false
//     }
// };

// === Map/Room Development ===
// window.devConfig = {
//     rendering: {
//         showRoomBoundaries: true,
//         showAgentIDs: true
//     },
//     physics: { debugVisualization: true }
// };

// === Slow Motion Testing ===
// window.devConfig = {
//     engine: {
//         timeScale: 0.1    // 10% speed for debugging
//     },
//     debug: { enabled: true }
// };

// === Fast Forward Testing ===
// window.devConfig = {
//     engine: {
//         timeScale: 5.0    // 5x speed to test long-term behavior
//     }
// };
