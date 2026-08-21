# magic profiler.cos - Agent Performance Profiler Tool

**Source**: `Assets/Bootstrap/001 World/magic profiler.cos`

## Overview

This script implements a developer-facing performance profiling tool that measures and records how much time each agent classifier spends in its update and message-handling code. It is a hidden debug utility with no gameplay impact — it creates an invisible on-screen text display that can be toggled with a keyboard shortcut (Ctrl+Shift+M).

When activated, the profiler starts a countdown (configured via the game variable `c3_magic_delay`, default 1200 ticks). During this period, the engine accumulates timing data per agent classifier. Once the countdown expires, the profiler dumps all collected data to a CSV file in the journal directory (named `{worldname}.{worldtick}.csv`), provides a visual flash on the pointer agent to confirm completion, and deactivates itself.

This script also initializes the game variable `c3_magic_delay` (default: 1200 ticks) which controls the profiling duration.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 500 | Magic Profiler | `smalltextbox` | Hidden debug HUD — activated by Ctrl+Shift+M, counts down then dumps agent timing data to CSV | [Detail](#magic-profiler-1-2-500) |

---

## Magic Profiler (1 2 500)

A compound agent that acts as an invisible, keyboard-activated performance profiler. It sits off-screen at (-1000, -1000) until activated, then appears at the bottom of the screen showing a countdown. On completion it writes profiler output to a CSV file and returns off-screen.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| `attr` | 288 | Camera-shy (256) + Sufficiently high (32) — invisible to creatures, non-interactive |
| `plne` | 9999 | Renders on top of all other agents |
| `imsk` | 1 | Receives raw keyboard input events |
| `ov00` | 0 | Initial state: inactive |
| Game var `c3_magic_delay` | 1200 | Number of ticks the profiler collects data before dumping |

### Compound Parts

| Part | Type | Sprite | Font | Description |
|---|---|---|---|---|
| 1 | FIXD (fixed text) | `smalltextbox` frame 1 | `BlackOnTransparentChars` | Displays countdown text showing ticks remaining before profile dump |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Active state | 0 = inactive (off-screen), 1 = actively profiling |
| `ov30` | Start tick | World tick (`wtik`) when profiling was activated — used to compute elapsed time |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Countdown display and profile dump logic |
| Raw Key Down | 73 | Keyboard shortcut handler (Ctrl+Shift+M toggle) |
| Window Resized | 123 | Repositions the HUD to the bottom of the screen when the window is resized |

### Event Details

#### Timer (Event 9)

Runs every tick while profiling is active. Calculates remaining ticks by subtracting elapsed time from `c3_magic_delay` and displays the countdown on the text part.

When the countdown reaches zero or below:
1. Opens an output file in the journal directory named `{world_name}.{world_tick}.csv`
2. Calls `dbg: prof` to dump all accumulated agent profiler data into the file
3. Flushes and closes the file
4. Stops the timer (`tick 0`) and moves off-screen
5. Resets `ov00` to 0 (inactive)
6. Provides visual feedback: flashes the pointer agent with 10 random tint colors (one per tick), then resets to neutral tint (128, 128, 128, 128, 128)

#### Raw Key Down (Event 73)

Listens for the **M** key (`_p1_ = 'M'`) while both **Ctrl** (keycode 17) and **Shift** (keycode 16) are held down.

- **If inactive** (`ov00 = 0`): Records the current world tick in `ov30`, starts the timer (`tick 1`), positions the text display at the bottom-left of the screen, sets `ov00 = 1`, and calls `dbg: cpro` to clear/reset the profiler counters so the new measurement starts from zero.
- **If active** (`ov00 = 1`): Stops the timer, moves off-screen, and resets `ov00` to 0 — cancelling the current profiling session without dumping data.

#### Window Resized (Event 123)

If the profiler is currently active (`ov00 = 1`), repositions the text display to the bottom-left of the screen to account for the new window dimensions.

### Remove Script

The remove script (`rscr`) destroys all existing Magic Profiler agents (`enum 1 2 500 → kill targ`) and removes the timer script (`scrx 1 2 500 9`), ensuring clean teardown on world reload or script re-injection.
