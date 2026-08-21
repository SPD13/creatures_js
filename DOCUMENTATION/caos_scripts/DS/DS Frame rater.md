# DS Frame rater.cos - Frame Rate / Pace Overlay

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS Frame rater.cos`

## Overview

This script creates the Docking Station **frame rater** — a small developer overlay, toggled with **Shift+Ctrl+P**, that displays the engine's current frame **pace** and the total number of agents in the world. It is the Docking Station counterpart of the Creatures 3 [Frame rater](../C3/Frame%20rater.md) and is a pure diagnostic tool with no gameplay effect.

When toggled on, a small black-on-transparent text box appears at the bottom-left of the window and updates every tick; toggling off floats it off-screen and stops its timer.

## Created Agents

| Classifier | Name | Sprite | Description | Details |
|---|---|---|---|---|
| 1 2 201 | Frame Rater | `smalltextbox` | Invisible-until-toggled overlay showing frame pace and total agent count | [Details](#agent-1-2-201-frame-rater) |

---

## Agent 1 2 201: Frame Rater

Created with `new: comp 1 2 201 "smalltextbox" 1 0 9000`, with a fixed-text part (part 1, `BlackOnTransparentChars`). Properties: `attr 288` (camera-shy 256 + floatable 32), `imsk 1` (Raw Key Down), `plne 9999` (near-top), floated off-screen, `ov00 = 0` (hidden).

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Refresh the displayed pace + agent count |
| Raw Key Down | 73 | Shift+Ctrl+P toggles the overlay |
| Window Resized | 123 | Re-anchor to the bottom-left when visible |

#### Event 9 — Timer (refresh)

Builds the display string and writes it to part 1:

- `vtos pace` — the engine **pace** (how the actual tick time compares to the ideal; the trailing character is trimmed for display).
- a newline, then `vtos totl 0 0 0` — the **total agent count** (all family/genus/species).

The timer runs only while the overlay is visible (started/stopped by event 73).

#### Event 73 — Toggle (Shift+Ctrl+P)

Acts only when `_p1_ = 'P'` with Ctrl (`keyd 17`) and Shift (`keyd 16`) held:

- **Show** (`ov00 = 0`): `tick 10` starts the refresh timer, the box floats to the bottom-left (`flto 0 (wndh - hght)`), and `ov00 = 1`.
- **Hide** (`ov00 ≠ 0`): `tick 0` stops the timer, the box floats off-screen, and `ov00 = 0`.

#### Event 123 — Window Resized

While visible, re-floats the box to `(0, wndh - hght)` so it stays pinned to the bottom-left after a resize.

### Removal Script

```
rscr
enum 1 2 201
    kill targ
next
scrx 1 2 201 9
scrx 1 2 201 73
scrx 1 2 201 123
```

Kills the overlay and removes its timer (9), toggle (73) and resize (123) scripts.

## Impact on Stimulus / Room CA

None. The frame rater only reads engine metrics and draws text; it emits no stimuli and does not affect Room CA.
