# plusminus switch.cos - Plus/Minus Signal Generator Gadget

**Source**: `Assets/Bootstrap/001 World/plusminus switch.cos`

## Overview

This script creates two plus/minus switch gadgets — compound agents with two buttons (a "+" button and a "–" button) that generate signed output signals into the Ark's port-based wiring system. Pressing the "+" button emits a +255 signal through the output port, and pressing the "–" button emits a –255 signal. The switch also acts as an inline sign inverter: when an external signal arrives on its input port, the switch re-emits the sign-flipped equivalent (+255 for any negative input, –255 for any positive input).

Two switch instances are installed at y=3300 in the lower section of the Ark, horizontally spaced starting at x=1740. Each switch emits CA 10 (Machinery) into its room at a rate of 0.2. Creatures can interact physically by pressing buttons, hitting the device, or picking it up, each producing a biochemical stimulus.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 14 | Plus/Minus Switch | `plusminus` | Two-button signal generator and sign-inverting signal repeater | [Detail](#plusminus-switch-3-3-14) |

---

## Plus/Minus Switch (3 3 14)

A compound device with one main body part, two clickable buttons (the "+" button on top and the "–" button below), one input port, and one output port. Pressing either button generates a signed signal (+255 or –255) on the output port along with a visual flash and an audio cue. When a signal comes in on the input port, the switch outputs the opposite sign, acting as an inline sign inverter for the wiring system.

### Properties

| Property | Value | Notes |
|---|---|---|
| `new: comp` | 3 3 14 "plusminus" 4 0 5000 | Compound agent, 4 sprite frames, image base 0, plane 5000 |
| `attr` | 194 | Mouseable (2) + Floatable (64) + Suffer Collisions (128) |
| `bhvr` | 41 | Activate 1 (1) + Hit (8) + Pick Up (32) (set after an initial `bhvr 40` override) |
| `elas` | 0 | No bounce |
| `perm` | 60 | Moderate permeability |
| `fric` | 100 | High friction |
| `accg` | 3 | Low gravity |
| `emit` | CA 10 at 0.2 | Emits Machinery CA into the room continuously |
| `ov61` | 100 | CA smell emission intensity |

### Initial Placement

Two switch instances are created at bootstrap starting from `va50 = 1740`, each offset by +70 in x:

| Instance | Position | Notes |
|---|---|---|
| 1 | (1740, 3300) | Lower Ark, left |
| 2 | (1810, 3300) | Lower Ark, right |

### Compound Parts

| Part | Type | Sprite | First Image | Relative Position | Msg ID | Purpose |
|---|---|---|---|---|---|---|
| 0 | Body (main) | `plusminus` | 0 | (0, 0) | — | Main body; plays flash animation when buttons are pressed or when port signals arrive |
| 1 | `pat: butt` (button) | `plusminus` | 3 | (20, 13) | 0 | "+" button — sends message 0 (Activate 1) on click |
| 2 | `pat: butt` (button) | `plusminus` | 3 | (20, 34) | 1 | "–" button — sends message 1 (Activate 2) on click |

### Port System

| Direction | Index | Name | Description | Position | Message Range | Triggers |
|---|---|---|---|---|---|---|
| Input | 0 | " " | Incoming signal, re-emitted with opposite sign | (41, 31) | 1000 | Script 1000 |
| Output | 0 | " " | Generated signal (±255) sent to connected input ports | (41, 47) | — | — |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov61` | 100 | CA smell emission intensity |
| `va50` | 1740 | Install-time x position counter (incremented by 70 per instance) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 ("+" button click) | Generates a +255 signal, plays "pl_2" sound, flashes indicator |
| 2 | Activate 2 ("–" button click) | Generates a –255 signal, plays "pl_1" sound, flashes indicator |
| 3 | Hit | Creature hits the switch — bounce, random port bang, stimulus |
| 4 | Pickup | Creature picks up the switch — stimulus to creature (if family 4) |
| 1000 | Port Input (port 0) | Incoming signal is sign-inverted and re-emitted on output port 0 |

---

#### Event 1 — Activate 1 ("+" button)

Triggered when the "+" button part (msgid 0) is clicked:
1. Plays the `"pl_2"` sound effect.
2. Sends **stimulus 68** with intensity 1 to the activator (`from`) — biochemical feedback for pressing the plus button.
3. Selects part 0 (main body) and plays the flash animation `[0 1 0 1 0 1 0 1 0 1 0]` (alternates base/flash-up frames).
4. Sends **+255** through output port 0 (`prt: send 0 255`).

#### Event 2 — Activate 2 ("–" button)

Triggered when the "–" button part (msgid 1) is clicked:
1. Plays the `"pl_1"` sound effect.
2. Selects part 0 and plays the flash animation `[0 2 0 2 0 2 0 2 0 2 0]` (alternates base/flash-down frames).
3. Sends **–255** through output port 0 (`prt: send 0 -255`).

Note: unlike event 1, event 2 does **not** send a creature stimulus.

#### Event 3 — Hit

Triggered when a creature hits the switch:
1. Plays the `"hit_"` sound effect.
2. Applies a random upward velocity (`velo 0, rand -5 to -10`) — the switch bounces upward.
3. Applies a random port bang value (rand 60–100) via `prt: bang`, sending a random signal burst through connected ports.
4. Sends **stimulus 92** (`HIT_MACHINE`) with intensity 1 to the hitting creature (`from`).

#### Event 4 — Pickup

Triggered when a creature picks up the switch:
1. Targets the picking-up creature (`targ from`).
2. If the creature is family 4 (a Creature), sends **stimulus 91** (`GOT_MACHINE`) with intensity 1.

#### Event 1000 — Port Input (Input Port 0)

Triggered when a signal arrives on input port 0. This implements a sign-inverting repeater:

| Incoming `_p1_` | Action |
|---|---|
| `_p1_ < 0` | Send **+255** on output port 0 |
| `_p1_ > 0` | Send **–255** on output port 0 |
| `_p1_ = 0` | No output (neither branch matches) |

This makes the plus/minus switch usable as an inline logic inverter when wired between two gadgets: any negative upstream signal becomes a positive downstream signal, and vice versa.

### Signal Summary

| Source | Output Port 0 Value |
|---|---|
| "+" button pressed (event 1) | +255 |
| "–" button pressed (event 2) | –255 |
| Hit by creature (event 3) | rand 60–100 (via `prt: bang`) |
| Port input < 0 (event 1000) | +255 |
| Port input > 0 (event 1000) | –255 |

---

## Removal Script (rscr)

The removal script cleanly uninstalls the switches:

1. Enumerates all plus/minus switches (`enum 3 3 14`) and kills each (`kill targ`).

The event scripts (1, 2, 3, 4, 1000) are not explicitly stripped via `scrx`.

---

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 68 | — | "+" button pressed (event 1) | Biochemical feedback for pressing the plus button |
| 91 | `GOT_MACHINE` | Switch picked up (event 4, family 4 only) | Biochemical feedback for obtaining a machine |
| 92 | `HIT_MACHINE` | Switch hit (event 3) | Biochemical feedback for hitting machinery |

## Room CA Effects

| CA Index | Name | Source | Amount | Ecological Role |
|---|---|---|---|---|
| 10 | Machinery | Switch emission (`emit`) | 0.2 (continuous) | Marks the room as containing machinery, potentially influencing creature navigation |
