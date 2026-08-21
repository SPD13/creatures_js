# DS scroll settings

**Source file:** `Assets/Docking Station/Bootstrap/000 Switcher/DS scroll settings.cos`

## Overview

This bootstrap script installs Docking Station's camera scrolling behaviour. It does not create any agents, rooms, or game variables; it only calls the `SCOL` CAOS command to configure the engine's `InputScrollController` (the subsystem that drives camera panning in response to mouse and keyboard input).

The script's own comments explain why it exists in this exact place:

> Scroll settings are not saved with a world, they are application global, so they need setting every time the game loads (i.e. in the world switcher). However, Creatures 3 also sets them incorrectly during world load, so we have to reset them for a new world as well.

Because of that, the same `SCOL` call appears both here (the splash/switcher world) and in the main gameplay-world bootstrap — and the comment warns that if you change one you must change both.

## Script Body

```caos
setv va00 scol 0 7 [1 4 9 16 25 36 49] [0 1 4 9 16 25 36]
```

The returned scrolling mask is captured into the local variable `va00` but never read — the assignment only exists because `SCOL` returns an integer.

## No Created Agents

This script does not create or modify any agents. It only reconfigures the engine's scrolling input handler.

---

## SCOL Parameter Breakdown

`SCOL and_mask eor_mask up_speeds down_speeds` computes the new scrolling mask as `(current & and_mask) ^ eor_mask` and replaces the two acceleration curves.

### Scrolling Mask

| Parameter | Value | Effect |
|---|---|---|
| `and_mask` | `0` | Discards the current mask entirely (`current & 0 = 0`). |
| `eor_mask` | `7` (binary `0111`) | Sets the resulting mask to exactly `0 ^ 7 = 7`. |

Final scrolling mask: `7` → bits 0, 1, 2 enabled, bit 3 disabled:

| Bit | Value | Scrolling Method | Enabled? |
|---|---|---|---|
| 0 | 1 | Screen-edge **nudgy** scrolling (mouse near the window border) | Yes |
| 1 | 2 | **Keyboard** scrolling (arrow keys) | Yes |
| 2 | 4 | **Middle mouse button** screen dragging | Yes |
| 3 | 8 | **Mouse wheel** screen scrolling | **No** |

This is the key difference from the Creatures 3 `scroll settings.cos`, which uses `scol 15 0 …` and leaves all four methods enabled. Docking Station deterministically rebuilds the mask as `7`, switching **off** mouse-wheel screen scrolling (the wheel is left free for other use) while keeping edge, keyboard, and middle-mouse-drag panning.

### Acceleration Curves

Both speed arrays replace the engine defaults with **perfect squares**, giving a quadratic ramp for nudgy and keyboard scrolling. Each successive tick of held input advances to the next entry, so pixels-per-tick grows as the squares.

| Parameter | Value | Purpose |
|---|---|---|
| `up_speeds` | `[1, 4, 9, 16, 25, 36, 49]` | Pixels per tick for **upward / leftward** scrolling (`1²` … `7²`). Maxes out at 49 px/tick. |
| `down_speeds` | `[0, 1, 4, 9, 16, 25, 36]` | Pixels per tick for **downward / rightward** scrolling (`0²` … `6²`). Starts from 0 (one tick of no movement) and maxes out at 36 px/tick. |

The asymmetry (down starts at 0 and peaks lower than up) gives the downward/rightward scroll a slight one-tick deadzone and a gentler top speed than the upward/leftward direction.

## Impact on Stimulus / Room CA

None. The script only reconfigures the engine's global scrolling input handler.
