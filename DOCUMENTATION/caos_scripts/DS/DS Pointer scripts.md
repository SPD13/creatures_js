# DS Pointer scripts

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS Pointer scripts.cos`

## Overview

This bootstrap script creates the visual "hand" indicator agent and defines the default pointer-interaction scripts for all four agent families (Simple, Compound, Vehicle, Creature). It establishes how agents visually respond when clicked, picked up or dropped, how the floating hand cursor appears near interactive objects, and the classic **tickle/slap** mechanic for creatures. It is the Docking Station counterpart of the Creatures 3 [Pointer scripts](../C3/Pointer%20scripts.md) and behaves the same way.

## Created Agents

| Classifier | Name | Sprite | Description | Details |
|---|---|---|---|---|
| 1 1 95 | Hand Indicator | `hand` | Floating hand cursor overlay shown near the pointer when interacting with agents | [Details](#hand-indicator-1-1-95) |

---

## Hand Indicator (1 1 95)

`new: simp 1 1 95 "hand" 2 15 8000` — a 2-frame hand sprite on plane 8000, `attr 32` (floatable), parked off-screen at (-1000, -1000) until shown. Poses: 0 = open hand, 1 = closed/pointing. It has no event scripts of its own; its visibility/pose is driven entirely by the Pointer agent's event 117.

## Pointer Agent Scripts (2 1 1)

| Event | Number | Description |
|---|---|---|
| POINTERACTIONDISPATCH | 117 | Show/hide and pose the hand indicator based on pointer context |
| Custom | 1000 | Send a Pickup (message 4) to a target agent |

### Event 117 — POINTERACTIONDISPATCH

Runs in `inst`. Based on `_p1_`: `1` → hand pose 1, float relative to the pointer at (10, -20); `2` → hand pose 0, float relative to the pointer; `0` → detach (`frel null`) and move the hand off-screen.

### Event 1000 — Click Action (Pickup)

In `inst`: if `pure = 0` and `_p1_ <> null`, sends message 4 (Pickup) to the agent in `_p1_`.

## Default Pointer Interaction Scripts by Family

The standard per-family visual feedback (fired on the target agent when interacted with):

### Family 1 — Simple (1 0 0) & Family 3 — Vehicles (3 0 0)

| Event | Anim | Meaning |
|---|---|---|
| 101 | `[1 0]` | Act 1 (left-click) flash |
| 102 | `[0 1 0]` | Act 2 (right-click) blink |
| 103 | `[0 1 0]` | Deactivate blink |
| 104 | `[7 7 6]` | Pickup shake |
| 105 | `[6 7 7 7 0]` | Drop bounce |

### Family 2 — Compound (2 0 0)

Same 101–105 animations as above, plus default `[1 0]` flash handlers for port inputs (1000–1005) and custom messages (2000–2005). **Event 2006** is special: instead of animating, it forwards message 92 (UI mouse-down) to `_p1_` (`mesg writ _p1_ 92`) — used by compound agents to relay UI events (e.g. to agent help).

### Family 4 — Creatures (4 0 0) — Tickle / Slap

Creature interactions check modifier keys and send behavioural messages rather than just animating.

#### Event 101 — Left-click

- **Default → Tickle:** anim `[2 3 2 3 2 3 2 3 0]`, send message 0 (Activate 1 / reward) to `from`, play `tckl`.
- **With Delete held (`keyd 46`) → Spank:** wakes the creature (stop dreaming via `drea 0`, else `aslp 0`), anim `[4 5 5 0]`, send message 2 (Deactivate / punish), play `spnk`.

#### Event 103 — Right-click (inverse of 101)

- **Default → Spank:** wakes the creature, anim `[4 5 5 0]`, message 2, `spnk`.
- **With Insert held (`keyd 45`) → Tickle:** anim `[2 3 2 3 2 3 2 3 0]`, message 0, `tckl`.

#### Events 104 / 105

Pickup shake `[7 7 6]` and drop bounce `[6 7 7 7 0]`.

## Removal Script

```
rscr
enum 1 1 95
    kill targ
next
```

Kills the hand indicator. The default family scripts (1 0 0, 2 0 0, 3 0 0, 4 0 0) and pointer scripts (2 1 1) are not explicitly removed.

## Impact on Stimulus / Room CA

None directly. The script defines visual feedback and pointer behaviour. The creature tickle/slap messages (0 and 2) are handled by the creature's own Activate 1 / Deactivate scripts, which may apply stimuli — but that is defined elsewhere.
