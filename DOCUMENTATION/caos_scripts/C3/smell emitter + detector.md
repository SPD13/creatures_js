# smell emitter + detector.cos - CA Smell Emitter and Detector Gadgets

**Source**: `Assets/Bootstrap/001 World/smell emitter + detector.cos`

## Overview

This script installs a pair of carryable gadgets that let the player inject or read CA (Cellular Automata / smell) values in the room they are standing in. They are the player-facing counterparts of the invisible Home smell emitters: rather than continuously broadcasting a fixed CA, these devices let a user pick a CA index (1–17, skipping 11 which does not exist in C3) and either emit it on demand or probe the current level in the room.

The **Smell Emitter** (3 8 14) is a compound agent with a selector button, a power/intensity dial and a main activation button. When activated it releases a puff animation on either side of the case, emits the selected CA at an intensity derived from the power dial, and sends the result to the wiring output port so it can drive other gadgets. It also accepts wiring input that either drives the intensity (negative value) or overrides the selected CA (positive value).

The **Smell Detector** (3 8 15) is the mirror of the emitter: instead of writing a CA value it reads one. Every time it is activated it samples the selected CA in its current room via `prop room targ ov71`, updates a numeric display part, and forwards the value (scaled to 0–255) out of its output port. Its input port can be wired to remotely change the CA being monitored.

Both devices share the same button graphics and the same CA selector behaviour (`scrp … 1001`). They are part of the engineering / wiring kit the player can use to build custom biomes, and they react to being hit (stim 92) and to being touched by a creature (stim 91, family 4).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 14 | Smell Emitter | `smell_machines` | Carryable wired gadget that emits a selected CA in the current room at a selectable intensity | [Detail](#smell-emitter-3-8-14) |
| 3 8 15 | Smell Detector | `smell_machines` | Carryable wired gadget that reads the selected CA value in the current room and outputs it | [Detail](#smell-detector-3-8-15) |
| 1 1 37 | Smell Puff | `smell_machines` | Short-lived sprite spawned on each side of the Emitter when it fires, then auto-killed | [Detail](#smell-puff-1-1-37) |

---

## Smell Emitter (3 8 14)

A carryable compound agent built from 4 parts (base sprite + 3 buttons) and with 1 input and 1 output port. It lets the player emit any CA index (1–17, skipping 11) in the current room, with an intensity controlled by a 5-step power dial. The same device can also be driven from the wiring system.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `smell_machines` image 8, base image 0, plane 5000 | `new: comp` |
| `bhvr` | 40 | Activate1 (8) + Pickup (32) — can be picked up and clicked |
| `attr` | 195 | Carryable (1) + Mouseable (2) + SufferPhysics (64) + SufferCollisions (128) |
| `perm` | 60 | Moderate permittivity (can pass most walls but not all) |
| `elas` | 0 | No bounce |
| `accg` | 3 | Falls under gravity |
| Position | (6000, 4170) | Dropped near the workshop |
| Initial emit | `emit 18 0.2` | Briefly announces "new gadget dropped" on CA 18 (workshop/alert smell) |
| `ov00` | 0 → 1 | On/off state (off when installed) |
| `ov61` | 100 | Stored data slot (unused at runtime, probably originally a label/value) |
| `ov70` | 1 | Power dial position, 1..5 (also updated by wiring input) |
| `ov71` | 1 | Selected CA index, 1..17 (skipping 11) |
| Parts | 0: base sprite · 1: power dial button · 2: toggle button · 3: CA selector button · port in 0 · port out 0 | |
| Port in 0 | "Emitter input" at (68, 60), on-message 1002 | |
| Port out 0 | "Emitter output" at (13, 60) | Sends the last emitted intensity |

### Events

| Event | Number | Description | Behaviour |
|---|---|---|---|
| Activate 1 | 1 | Player / script activation (toggle on/off) | Plays `sc_2`, acquires `lock`. Toggles `ov00`. Turning on: part 2 → pose 1, part 0 stays, `tick 5` starts the firing timer, `ov00 = 1`. Turning off: `ov00 = 0`, `tick 0` (stop timer), part 2 → pose 0, part 0 plays reverse animation `[7 6 5 4 3 2 1 0]` then `over`, finally `emit 10 0.2` (CA 10 = "Machinery" smell) to signal shutdown and `emit ov71 0` to clear the currently emitted CA. |
| Hit | 3 | Agent has been hit / thrown | Plays `hit_`, bounces (`velo 0 rand -5 -10`), spawns a generic `prt: bang` particle effect, writes stim 92 to `from` (the agent that hit it — typically a creature, giving "pain from being hit"). |
| Mesg Action 1 (Hit by creature body) | 4 | Creature body touched us | `targ from`; if `fmly eq 4` (creature), writes stim 91 (soft touch / interest) to `from`. |
| Timer | 9 | Fired every `tick 5` while the emitter is on | Plays `sce1`, animates part 0 `[0 1 2 3]` then `over`, `tick 8`. Spawns two `Smell Puff` agents (1 1 37) at (posl-51, post-10) and (posl+70, post-10) that play their own animation. Emits the selected CA (`ov71`) at intensity `ov70/5` (i.e. 0.2, 0.4, 0.6, 0.8, 1.0). Sends `ov70 * 50` out of output port 0 so downstream wiring sees the current strength. |
| Wiring input (port 1002) | 1002 | Value arrived on the input port | Branches on the sign of `_p1_`. Negative value: `ov70 = abs(_p1_)/52` sets the power dial and `part 1 / pose ov70` updates the graphic. Zero: stop. Positive value: integer-casts `_p1_`, divides by 15 to get a CA index, skips index 11 (remapped to 12), stores into `ov71` and updates the CA selector graphic on part 3. |
| Power dial button | 1000 | Click on the power dial part | Plays `clak`. While `ov70 < 5` increments `ov70` and advances part 1's pose. When the dial hits 5 it wraps to pose 0 / `ov70 = 1`. |
| CA selector button | 1001 | Click on the CA selector part | Plays `sc_1`. `ov71 += 1`; wraps back to 1 past 17; skips 11 (remapped to 12). Updates part 3's pose to `ov71 - 1`. |

### Effects on Stimulus and Room CA

- **Room CA**: Writes the selected CA (any of 1–17, skipping 11) into the current room at a user-chosen intensity 0.2–1.0 on every timer tick while running. This is the main gameplay effect — the emitter is the only way the player can inject CAs such as food smells, home smells or fear into a specific room at will.
- **Stimuli**: Sends stim 91 (touched) to any creature that brushes against it and stim 92 (hit) to whatever hits it.
- **Side CAs**: Emits a short CA 18 pulse when installed, and CA 10 (Machinery) at 0.2 when switched off.

---

## Smell Detector (3 8 15)

A carryable compound agent with 4 parts (base sprite + numeric display + 2 buttons) and 1 input / 1 output port. Reads the selected CA's level in the room it currently occupies and reports it both on a local 5-level display (part 1) and on its wiring output port.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `smell_machines` image 6, base image 29, plane 5000 | `new: comp` |
| `bhvr` | 40 | Activate1 + Pickup |
| `attr` | 195 | Carryable + Mouseable + Physics + Collisions |
| `perm` | 60 | |
| `elas` | 0 | |
| `accg` | 3 | |
| Position | (5400, 2000) | Dropped near the workshop |
| `ov00` | 0 → 1 | On/off toggle |
| `ov61` | 100 | Stored data slot (unused at runtime) |
| `ov71` | 1 | Selected CA index, 1..17 (skipping 11) |
| Parts | 0: base sprite · 1: numeric/bar display (`pat: dull`) · 2: toggle button · 3: CA selector button · port in 0 · port out 0 | Part 1 is a `pat: dull` (static display) with 12 frames, updated by event 9 |
| Port in 0 | "Detector input" at (80, 65), on-message 1002 | |
| Port out 0 | "Detector output" at (24, 65) | Sends the current measured CA value (0–255) |

### Events

| Event | Number | Description | Behaviour |
|---|---|---|---|
| Activate 1 | 1 | Player / script activation (toggle on/off) | Plays `sc_2`, locks. Toggles `ov00`. Turning on: part 2 → pose 1, part 0 plays `[0 1 2 3 4 5 255]` (open animation, holds on last frame), `tick 5` starts the sampling timer, `ov00 = 1`. Turning off: `ov00 = 0`, `tick 0`, part 2 → pose 0, part 0 plays `[5 4 3 2 1]`, `over`, and plays CA 10 (`emit 10 0.2`) to signal shutdown. |
| Hit | 3 | Thrown / hit | Plays `hit_`, bounces, spawns `prt: bang`, writes stim 92 to `from`. |
| Mesg Action 1 (Hit by creature body) | 4 | Creature body touched | If `from.fmly == 4`, writes stim 91 to `from`. |
| Timer | 9 | Fired every `tick 5` while the detector is on | Plays `scd1`. If held by a creature (`carr ne null`) it aborts — only measures while at rest. Reads `prop room targ ov71` (the CA value of the selected index in the agent's current room). Quantises the value into 5 brackets (<0.2, <0.4, <0.6, <0.8, <1) and sets part 1 / pose accordingly (0..4), giving a coarse level indicator. Multiplies the raw value by 255 and sends it out of output port 0. |
| Wiring input (port 1002) | 1002 | Value arrived on the input port | Negative → ignored after writing back 0 to the caller (`mesg writ ownr 0`). Zero → stop. Positive → divides by 15 to pick a CA index, skipping 11, stores into `ov71` and updates the CA selector graphic on part 3. |
| CA selector button | 1001 | Click on the CA selector part | Plays `sc_1`. `ov71 += 1`, wraps past 17, skips 11. Updates part 3's pose. |

### Effects on Stimulus and Room CA

- **Room CA**: Read-only — samples `prop room targ ov71` once per timer tick. The only CA it writes is the `emit 10 0.2` pulse (Machinery) when switched off.
- **Stimuli**: Same 91 / 92 behaviour as the emitter when touched or hit by creatures.

---

## Smell Puff (1 1 37)

A short-lived visual particle spawned by the Emitter's timer event (scrp 3 8 14 9). Two instances are spawned per firing — one slightly to the left of the emitter and one to the right — to give the impression that the gadget is venting a cloud of scent on both sides.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `smell_machines` image 7, base image 15 or 22, plane 5001 | Two separate images used for left / right puff |
| `attr` | 16 | Invisible-to-creatures only; still rendered visually |
| Animation | `anim [0 1 2 3 4 5 6]`, `tick 1` | Plays forward then stops |

### Events

| Event | Number | Description | Behaviour |
|---|---|---|---|
| Timer | 9 | Ticking while the puff animates | Waits until the sprite reaches `pose eq 6` (the last animation frame), then `kill ownr` — the puff self-destructs. |

### Effects on Stimulus and Room CA

None — this is a purely cosmetic agent.

---

## Removal Script (rscr)

Cleanly uninstalls the gadgets and their in-flight particles:

1. `enum 3 8 14 / kill targ` — removes every Smell Emitter instance.
2. `enum 3 8 15 / kill targ` — removes every Smell Detector instance.
3. `scrx 3 8 14 1` — removes the Emitter's Activate 1 script from the scriptorium (note: the other scripts are left in the scriptorium, consistent with partial-uninstall patterns seen elsewhere in the bootstrap).
4. `scrx 1 1 37 1000` — removes an obsolete/legacy Smell Puff "message 1000" script from the scriptorium (there is no matching `scrp` in this file, likely a leftover from an earlier revision).

---

## Notes on CA Numbering

The CA selector of both gadgets iterates 1..17 but explicitly skips index 11. In C3's CA layout index 11 is reserved (unused), so the dial remaps 11 → 12 both when clicked and when driven by the wiring input. The effective set of selectable CAs is therefore: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17 — which covers every meaningful smell in the game (food, drink, hazards, mating, home smells, etc.).
