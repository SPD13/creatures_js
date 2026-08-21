# DS magic profiler.cos — CPU Profiler Tool

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS magic profiler.cos`

## Overview

This script creates a developer **CPU profiler** (`1 2 500`), toggled with **Shift+Ctrl+M**. When started it runs a profiling capture for a fixed number of ticks and then writes the collected profile data to a CSV file in the journal directory. It is a pure diagnostic tool with no gameplay effect, and is the Docking Station counterpart of the Creatures 3 [magic profiler](../C3/magic%20profiler.md).

At install it creates `1 2 500` (a small black-on-transparent text box, `attr 288`, `imsk 1`, plane 9999, off-screen) and sets `game "c3_magic_delay" = 1200` (the profiling duration in ticks, ~1 minute at 20 fps).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 500 | Magic Profiler | `smalltextbox` | Toggleable CPU-profiling overlay that dumps a CSV report |

## Agent 1 2 500: Magic Profiler

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Count down the capture, then write the CSV profile |
| Raw Key Down | 73 | Shift+Ctrl+M toggles profiling on/off |
| Window Resized | 123 | Re-anchor the overlay when visible |

#### Event 73 — Toggle (Shift+Ctrl+M)

When `_p1_ = 'M'` with Ctrl+Shift held: **start** (`ov00 = 0`) records the start tick (`ov30 = wtik`), begins the capture (`tick 1`, `dbg: cpro`) and shows the box at the bottom-left; **stop** hides it and resets.

#### Event 9 — Timer (countdown & dump)

Each tick it displays the remaining time (`c3_magic_delay − elapsed`). When the countdown reaches zero it opens `<worldname>.<tick>.csv`, writes the profile (`dbg: prof`), flushes and closes the file, stops the timer, hides the box, and flashes a short rainbow `tint` on the pointer to signal completion.

### Removal Script

```
rscr
enum 1 2 500
    kill targ
next
scrx 1 2 500 9
```

Kills the profiler and removes its timer script.

## Impact on Stimulus / Room CA

None. The profiler only captures and writes engine performance data; it emits no stimuli and does not affect Room CA.
