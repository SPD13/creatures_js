# scroll settings.cos - Camera Scroll Configuration

**Source**: `Assets/Bootstrap/001 World/scroll settings.cos`

## Overview

This bootstrap script is a single-line configuration file that installs the world's camera scrolling behavior. It does not create any agents, rooms, or game variables; it only calls the `SCOL` CAOS command to configure the engine's `InputScrollController` (the subsystem that drives camera panning in response to mouse and keyboard input).

Concretely, the script enables all four scrolling input methods and replaces the default linear-ish speed ramp with a **quadratic acceleration curve**, so that the camera starts slow and accelerates smoothly the longer the user holds the input. The returned scrolling mask is captured into the local variable `va00` but is never read, so the assignment is only there to satisfy the fact that `SCOL` returns an integer.

## Script Body

```caos
setv va00 scol 15 0 [1 4 9 16 25 36 49] [0 1 4 9 16 25 36]
```

## No Created Agents

This script does not create or modify any agents. It only reconfigures the engine's scrolling input handler.

---

## SCOL Parameter Breakdown

`SCOL and_mask eor_mask up_speeds down_speeds` computes the new scrolling mask as `(current & and_mask) ^ eor_mask` and optionally replaces the two acceleration curves.

### Scrolling Mask

| Parameter | Value | Effect |
|---|---|---|
| `and_mask` | `15` (binary `1111`) | Keeps the lower 4 bits of the current mask; clears any spurious high bits. |
| `eor_mask` | `0` | No bits flipped after masking. |

With both the default engine mask and this configuration, all four scrolling input methods end up enabled:

| Bit | Value | Scrolling Method |
|---|---|---|
| 0 | 1 | Screen-edge **nudgy** scrolling (mouse near the window border) |
| 1 | 2 | **Keyboard** scrolling (arrow keys) |
| 2 | 4 | **Middle mouse button** screen dragging |
| 3 | 8 | **Mouse wheel** screen scrolling |

Final scrolling mask: `(current & 15) ^ 0 = 15` — every scrolling method is active.

### Acceleration Curves

Both speed arrays replace the engine defaults (`[1 2 4 8 16 32 64]` / `[0 1 2 4 8 16 32]`, which ramp geometrically). The new curves are **perfect squares**, giving a quadratic ramp used for nudgy and keyboard scrolling. Each successive tick of held input advances to the next entry, so the pixels-per-tick speed grows as 1, 4, 9, 16, 25, 36, 49.

| Parameter | Value | Purpose |
|---|---|---|
| `up_speeds` | `[1, 4, 9, 16, 25, 36, 49]` | Pixels per tick for **upward / leftward** scrolling (`1²` … `7²`). Maxes out at 49 px/tick. |
| `down_speeds` | `[0, 1, 4, 9, 16, 25, 36]` | Pixels per tick for **downward / rightward** scrolling (`0²` … `6²`). Starts from 0 (one tick of no movement) and maxes out at 36 px/tick. |

The asymmetry (down starts at 0 and peaks lower than up) gives the downward/rightward scroll a very slight one-tick deadzone and a gentler top speed than the upward/leftward direction.

---

## Execution Context

This script runs during the `001 World` bootstrap phase, after `!map.cos` has built the world geometry and before agent-spawning scripts execute. The configuration it writes lives on the engine's `InputScrollController` and persists for the lifetime of the world; no other bootstrap script in the startup folder overrides these values, so these are the effective scrolling settings the player experiences throughout the game.
