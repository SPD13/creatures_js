# lightbox.cos — Light Boxes

## Overview

This script creates four light box gadgets — interactive machinery agents that creatures can push, pick up, and hit. Each lightbox has an input and output port, making it part of the Ark's gadget wiring network. The lightbox receives a signal value through its input port and responds with a light animation whose intensity depends on the absolute value of the signal. It emits CA 18 (machinery smell) at intensity 0.2 so creatures can detect and navigate to it.

Four instances are created at different positions across the Ark:
- First pair: (670, 460) and (2600, 3200)
- Second pair: (1452, 3925) and (1900, 1600)

When a signal is received on the input port, the lightbox displays a flickering light animation at one of three intensity levels based on the signal magnitude. When the signal drops to zero, the lightbox resets to its idle state.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `3 8 4` | Light Box | A port-connected light gadget that displays intensity-based light animations in response to input signals | [Details](#agent-3-8-4-light-box) |

---

## Agent `3 8 4` — Light Box

A simple agent that acts as a visual light indicator within the Ark's gadget wiring network. It receives a numeric signal on its input port and displays a flickering animation at an intensity proportional to the absolute value of the signal. The lightbox can be interacted with by creatures and provides appropriate biochemical stimuli for push, pickup, and hit actions.

### Ports

| Port | Type | Name | Description | Position |
|---|---|---|---|---|
| Input 0 | `prt: inew` | "light in" / "light setting" | Receives a signal value; triggers light animation based on magnitude | (14, 36) |
| Output 0 | `prt: onew` | "light out" / "light setting" | Forwards the received signal value to connected agents | (40, 36) |

### Agent Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activateable (4) + Greedy Cabin (64) + Suffers Physics (128) |
| `bhvr` | 41 | Activate 1 / Push (1) + Hit (8) + Pickup (32) |
| `perm` | 60 | Moderate permeability |
| `clac` | 0 | No click action |
| `elas` | 10 | Low elasticity |
| `aero` | 5 | Moderate aerodynamic drag |
| `accg` | 4 | Moderate gravity |
| `tick` | 0 | Timer disabled initially |
| `ov61` | 100 | Smell intensity (strong machinery smell) |
| `ov70` | — | Stores the raw signal value received from the input port |
| `ov71` | — | Stores the absolute value of the signal for intensity comparison |
| `emit` | CA 18 at 0.2 | Machinery smell — allows creatures to detect and navigate to the lightbox |

### Events

| Event | Script Number | Description |
|---|---|---|
| Push (Activate 1) | 1 | Creature pushes the lightbox — sends stimulus and triggers full brightness |
| Pickup | 4 | Creature picks up the lightbox — sends stimulus to the creature |
| Hit | 3 | Creature hits the lightbox — sound, fling, and stimulus |
| Port Signal (Custom) | 1000 | Input port receives a signal — displays light animation based on signal magnitude |
| Reset (Custom) | 2000 | Signal drops to zero — resets lightbox to idle state |

### Event Details

#### Script 1 — Push (Activate 1)

When a creature pushes the lightbox:
1. Sends **stimulus 90** ("Activated machine") with intensity 1 to the pushing creature.
2. Sends message 1000 to itself with a value of 255, triggering the maximum brightness light animation.

#### Script 4 — Pickup

When a creature (family 4) picks up the lightbox:
1. Sends **stimulus 91** ("Got machine") with intensity 1 to the picking creature.

#### Script 3 — Hit

When a creature hits the lightbox:
1. Plays the `"hit_"` sound effect.
2. Applies a random upward velocity (between -5 and -10).
3. Sends a random force (60–100) via `prt: bang` to connected ports.
4. Sends **stimulus 92** ("Hit machine") with intensity 1 to the hitting creature.

#### Script 1000 — Port Signal (Input Received)

This is the core behavior of the lightbox. When a signal arrives on the input port:
1. Stores the raw signal value in `ov70` and its absolute value in `ov71`.
2. Waits for any current animation to complete (`over`).
3. Forwards the signal value to the output port via `prt: send`.
4. Selects a light animation intensity based on the absolute signal magnitude:

| Signal Range (absolute) | Animation | Tick | Click Action |
|---|---|---|---|
| 1–85 (low) | Flickering dim light `[1 0 1 0 1 0 1 0 1 0]` | 20 | 0 (disabled) |
| 86–170 (medium) | Flickering medium light `[2 0 2 0 2 0 2 0 2 0]` | 20 | 1 (positive: enabled) / 0 (negative: disabled) |
| 171–255 (high) | Flickering bright light `[3 0 3 0 3 0 3 0 3 0]` | 20 | 0 (disabled) |
| 0 | No animation — sends message 2000 to self to reset | — | — |

The lightbox responds identically to positive and negative signal values (using absolute value), except that at medium intensity (86–170), a positive signal sets `clac 1` (enabling click action) while a negative signal keeps it at `clac 0`.

The tick value of 20 keeps the flickering animation cycling. The signal is forwarded through the output port at each intensity level, allowing daisy-chaining of lightboxes.

#### Script 2000 — Reset (Signal Zero)

When the signal drops to zero, the lightbox resets:
1. Sets animation to idle frame `[0]`.
2. Disables the timer (`tick 0`).
3. Disables click action (`clac 0`).
4. Sends zero through the output port (`prt: send 0 0`).

### Room CA Impact

| CA Property | Value | Effect |
|---|---|---|
| CA 18 (Machinery) | 0.2 | Emits machinery smell into the room, allowing creatures to navigate toward the lightbox |

### Removal Script

The `rscr` block removes all lightbox instances and cleans up their event scripts (1, 2, 4, 5, 9, 1000, 2000).
