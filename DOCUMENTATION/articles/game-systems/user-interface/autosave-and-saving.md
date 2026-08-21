# Auto-Save and World Saving

## Overview

Creatures 3 auto-saves the world every **30 minutes of running game time**. Surprisingly, this is not engine code: the engine itself contains no save timer. Auto-save is implemented as an **invisible CAOS agent** installed by the bootstrap scripts, which periodically issues the `SAVE` command. The engine's only job is to honour that command by serializing the world at the start of the next tick.

The save system therefore has two layers:

1. **The auto-save agent** (game content, a `.cos` bootstrap script) decides *when* to save.
2. **The engine save pipeline** (`SAVE` command → deferred flag → `World::Save()`) decides *how* the save happens.

Both layers are present and functional in the web rebuild.

## The Auto-Save Agent (classifier 1 2 7)

The agent is installed by the bootstrap scripts of both game packs:

| Pack | Script |
|------|--------|
| Creatures 3 | `Assets/Creatures 3/Bootstrap/001 World/autosave.cos` |
| Docking Station | `Assets/Docking Station/Bootstrap/010 Docking Station/DS autosave.cos` |

The two scripts are functionally identical (the DS version just adds comments). The full script:

```caos
new: simp 1 2 7 "blnk" 0 1 0
attr 16
imsk 1

* set to about every 30 minutes
* (20 ticks/sec * 60 secs * 30 mins)
tick 36000

scrp 1 2 7 9
    save
endm

* when the world has just loaded, reset
* the timer so we don't save straight away
scrp 1 2 7 128
    tick tick
endm

* raw key down
scrp 1 2 7 73
    inst
    doif _p1_ = 'R'
* control but not shift
        doif keyd 17 = 1 and keyd 16 = 0
            save
            tick tick
        endi
    endi
endm

rscr
enum 1 2 7
    kill targ
next
scrx 1 2 7 9
scrx 1 2 7 128
```

### Installation

`new: simp 1 2 7 "blnk" 0 1 0` creates a simple agent with classifier **family 1, genus 2, species 7** using the `blnk` (blank) sprite gallery, so it has no visible appearance. It is one of several invisible "watcher" agents the bootstrap installs with the same pattern (agent help is 1 2 4, the keyboard handler is 1 2 6, the speech bubble factory is 1 2 10).

- `attr 16` sets the **Invisible** attribute — creatures cannot see or interact with the agent.
- `imsk 1` sets the input event mask to **raw key down**, subscribing the agent to script 73.

### The timer: 36,000 ticks = 30 minutes

`tick 36000` arms the agent's timer. The world runs at **20 ticks per second** (50 ms tick interval), so:

```
36,000 ticks ÷ 20 ticks/sec = 1,800 seconds = 30 minutes
```

Each time the timer fires, the agent's **Timer script** (event 9) runs, and it is a single command:

```caos
scrp 1 2 7 9
    save
endm
```

### No save immediately after loading

Script **128** is the `_WORLD_LOADED` event, broadcast when a world has just been loaded. The agent responds with `tick tick` — re-arming the timer with its current rate (`tick` as an rvalue returns the current timer rate). Re-arming resets the countdown, so after loading a world you always get a full 30 minutes before the first auto-save rather than inheriting whatever remained on the counter when the world was saved.

### Manual save: Ctrl+R

Script **73** is the `RAWKEYDOWN` event (`_p1_` carries the virtual key code). The handler checks for the **R** key with **Ctrl held** (`keyd 17`, VK_CONTROL) **and Shift not held** (`keyd 16`, VK_SHIFT). When Ctrl+R is pressed it saves immediately and resets the 30-minute countdown:

```caos
doif _p1_ = 'R'
    doif keyd 17 = 1 and keyd 16 = 0
        save
        tick tick
    endi
endi
```

So the effective behaviour is: **the world saves 30 minutes after the last world load or manual Ctrl+R save, and every 30 minutes thereafter.**

### Timing caveats

- The timer counts **world ticks**, not wall-clock time. If the world is paused (or the debugger is holding the tick loop), the countdown pauses with it.
- In the web rebuild, with `engine.runInBackground` enabled (the default), the simulation keeps ticking at full pace in hidden browser tabs — so auto-saves continue to fire every 30 real minutes even while the tab is not visible.

## How a Save Is Triggered: the SAVE Command

The `SAVE` CAOS command does not save the world immediately. It only sets a flag:

```cpp
// Legacy_Code/engine/Caos/GeneralHandlers.cpp:1093
void GeneralHandlers::Command_SAVE( CAOSMachine& vm )
{
    theApp.mySaveNextTick = true;
}
```

The application's main loop checks the flag at the start of the next tick and performs the actual save there:

```cpp
// Legacy_Code/engine/App.cpp:309
if (mySaveNextTick)
{
    myWorld->Save();
    mySaveNextTick = false;
}
```

This deferred pattern lets the script that issued `SAVE` finish executing before the world is serialized. Scripts that combine saving with quitting or world switching must wrap the sequence in `INST` (e.g. `INST SAVE QUIT SLOW`) so no other instruction interleaves between the scheduled operations.

The web rebuild mirrors this exactly:

- `SAVE` (`Main_Game/src/engine/caos/commands/world/SAVE.js`) calls `gameEngine.scheduleWorldSave()`, which sets `GameEngine.saveNextTick = true`.
- The game loop's scheduled-operation processing (`GameEngine.js`, `processScheduledOperations`) performs the save at the start of the next tick and clears the flag.
- One rebuild-specific addition: scheduled saves/loads are deferred while any CAOS VM is suspended at a step-debug breakpoint, since destroying a paused VM mid-script would wipe the world during debugging.

## What Happens During the Save: World::Save()

The original engine's `World::Save()` (`Legacy_Code/engine/World.cpp:1425`) performs a crash-safe, backed-up write:

1. **Record session metadata** — the game end time and total length of play are stored.
2. **Resolve file paths** inside the world's directory (`My Worlds/<WorldName>/`):
   - main save file (see naming below)
   - `<name>.bak` — backup
   - `<name>.tmp` — temporary write target
3. **Back up the previous save** — if `myNeedToBackUp` is set (it is set only after an archive has been *successfully loaded*), the current save file is renamed to `.bak`. This guarantees the `.bak` file is always a version known to load correctly.
4. **Write to a temp file** — the whole world is serialized through `CreaturesArchive` into the `.tmp` file.
5. **Atomically swap** — only after a successful write is the old file deleted and the `.tmp` renamed into place. A crash mid-save can never destroy the existing save.

### Save file naming

The main save file name is pack-dependent:

| Variant | Save file |
|---------|-----------|
| Creatures 3 | `TheWorldAndEverythingInIt` |
| Docking Station | `SpaceAndAllThatIsOutThere` |

The single archive file contains the entire world state: the map, all agents and their VMs, creatures (genetics, biochemistry, brain, skeleton), game variables, message queues, and clock state.

### The web rebuild's saveWorld()

`World.saveWorld()` (`Main_Game/src/engine/world/World.js`) follows the same sequence with web-specific plumbing:

- **Concurrency guard** — a `_saveInProgress` flag rejects overlapping saves.
- **Zoom reset** — the camera zoom (a JS-only feature; the C++ engine has no zoom) is temporarily reset to 1:1 so camera and floating-agent positions are written in a form the original engine can load.
- **Backup** — mirrors the C++ `.bak` logic via the world file API.
- **Serialization** — `World.save()` produces the binary archive buffer, byte-compatible with the original format.
- **Storage backend** — the buffer is written through `ClientWorldAPI`: the Express backend writes it to `Assets/<pack>/My Worlds/<world>/` on disk; the static (serverless) build writes to the browser's Origin Private File System (OPFS) instead.
- **Progress display** — like the C++ `StartProgressBar(8)`, the last presented frame is snapshotted and frozen behind the save progress popup.

### JS-only sidecar files

Alongside the binary archive, the rebuild writes two optional JSON sidecars (both best-effort — a sidecar failure never fails the world save):

| File | Contents | Config gate |
|------|----------|-------------|
| `<save name>.companion.json` | Engine version stamp, friendly CAOS script source, and debug metadata | `serialization.writeCompanionFile` (default true) |
| `<save name>.nornai.json` | NornAI controller state — program banks, in-flight programs/drivers, debug history | `nornai.persistence.writeSidecar` (default true) |

The original engine ignores unknown files in the world directory, so saves remain loadable in real Creatures 3 / Docking Station.

#### Engine version stamp

Every companion file carries an `engine` block recording the build that wrote the save, taken from the same `GET /api/version` metadata the in-app version display uses:

```json
"engine": {
  "version": "1.0.29",
  "mode": "dev",
  "commit": "56bb4dbc",
  "commitDate": "2026-08-15T09:12:00Z",
  "buildTime": null,
  "savedAt": "2026-08-15T14:03:21.812Z"
}
```

On load the block is logged and stored on `world.savedEngineInfo`. Saves written before this stamp existed simply have no `engine` key (`world.savedEngineInfo` is `null`), and a failed version lookup stamps `"unknown"` rather than blocking the save.

## Summary of Save Triggers

| Trigger | Mechanism |
|---------|-----------|
| Every 30 minutes of running time | Auto-save agent timer script (`scrp 1 2 7 9`) issues `SAVE` |
| Ctrl+R (Ctrl held, Shift not) | Auto-save agent raw-key script (`scrp 1 2 7 73`) issues `SAVE` and resets the timer |
| World just loaded | Auto-save agent (`scrp 1 2 7 128`) resets the timer — no save, prevents saving right after load |
| Any CAOS script | The `SAVE` command schedules a save for the start of the next tick |

## Related Files

**Game content:**
- `Assets/Creatures 3/Bootstrap/001 World/autosave.cos`
- `Assets/Docking Station/Bootstrap/010 Docking Station/DS autosave.cos`

**Original engine:**
- `Legacy_Code/engine/Caos/GeneralHandlers.cpp` — `Command_SAVE`
- `Legacy_Code/engine/App.cpp` — `mySaveNextTick` handling in `UpdateApp()`
- `Legacy_Code/engine/World.cpp` — `World::Save()`

**Web rebuild:**
- `Main_Game/src/engine/caos/commands/world/SAVE.js` — the `SAVE` command
- `Main_Game/src/engine/core/GameEngine.js` — `scheduleWorldSave()` and scheduled-operation processing
- `Main_Game/src/engine/world/World.js` — `saveWorld()` and the binary serializer
