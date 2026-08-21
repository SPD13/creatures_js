# NOT gate.cos - Logic NOT Gate Gadget

**Source**: `Assets/Bootstrap/001 World/NOT gate.cos`

## Overview

This script creates two NOT gate gadgets — simple logic inverters that are part of the Ark's port-based wiring system. Each NOT gate is a compound agent with one input port and one output port. When a signal arrives on the input port, the gate inverts it: a zero input produces a maximum (255) output, and any non-zero input produces a zero output. This is the fundamental Boolean NOT operation.

The NOT gates are placed in the lower section of the Ark and emit CA 18 (Machinery) into their room. Creatures can interact with them by activating, hitting, or picking them up, each triggering a biochemical stimulus. They are designed to be connected to other gadgets (detectors, AND gates, etc.) via the port wiring system to build complex logic circuits.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 7 | NOT Gate | `logicgates` | Logic inverter gadget that outputs the Boolean NOT of its input signal via the port system | [Detail](#not-gate-3-8-7) |

---

## NOT Gate (3 8 7)

The NOT gate is a compound agent with two parts: a main body (part 0) and an indicator display (part 1) that animates when the gate processes a signal. It has a single input port and a single output port. When a value arrives on the input port, the gate inverts it and sends the result through the output port.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Carryable (1) + Mouseclickable (2) + Activatable 1 (64) + Activatable 2 (128) |
| `bhvr` | 41 | Creatures can Activate 1 (1) + Hit (8) + Pick Up (32) |
| `accg` | 5 | Moderate gravity |
| `aero` | 10 | Aerodynamic factor |
| `perm` | 60 | Moderate permeability |
| `elas` | 10 | Slight bounce |
| `emit` | CA 18 at 0.2 | Emits CA 18 (Machinery) into the room |
| `ov61` | 100 | CA smell emission intensity |

### Initial Placement

Two NOT gate instances are created at bootstrap:

| Instance | Position | Notes |
|---|---|---|
| 1 | (rand 770–1570, 3432) | Random x position in lower Ark |
| 2 | (rand 770–1570, 3432) | Random x position in lower Ark |

Both instances are created at plane 5000 (foreground). The variable `va50` is incremented by 40 between each instance but is not used for positioning.

### Compound Parts

| Part | Type | Sprite | First Image | Relative Position | Purpose |
|---|---|---|---|---|---|
| 0 | Body | `logicgates` | 1 | (0, 0) | Main gate body |
| 1 | `pat: dull` | `logicgates` | 10 | (32, 1) | Indicator display — animates when processing a signal |

### Port System

| Direction | Index | Name | Description | Position | Range | Script |
|---|---|---|---|---|---|---|
| Input | 0 | "NOT gate input" | Receives a signal value to be inverted | (2, 13) | 1000 | Triggers script 1000 |
| Output | 0 | "NOT output" | Sends the inverted signal | (45, 13) | — | — |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov61` | 100 | CA smell emission intensity |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Creature activates the gate — sends stimulus and triggers logic processing |
| 3 | Hit | Creature hits the gate — physical knockback, port bang, and stimulus |
| 4 | Pickup | Creature picks up the gate — sends stimulus to creature |
| 1000 | Port Input (port 0) | Receives input signal and outputs the inverted value |

---

#### Event 1 — Activate 1

When a creature activates the NOT gate:
1. Sends **stimulus 90** (`ACTIVATE_MACHINE`) with intensity 1 to the activating creature.
2. Sends message 1000 to self with parameter 255, which triggers the NOT logic processing with a maximum input value (resulting in output 0).

#### Event 3 — Hit

When a creature hits the NOT gate:
1. Plays the `"hit_"` sound effect.
2. Applies a random upward velocity (`velo 0, rand -5 to -10`) — the gate bounces upward when struck.
3. Applies a random port bang value (60–100) via `prt: bang`, sending a random signal burst through connected ports.
4. Sends **stimulus 92** (`HIT_MACHINE`) with intensity 1 to the hitting creature.

#### Event 4 — Pickup

When a creature picks up the NOT gate:
1. Targets the picking-up creature.
2. If the creature is family 4 (a Creature), sends **stimulus 91** (`GOT_MACHINE`) with intensity 1 to it.

#### Event 1000 — Port Input (Input Port 0)

This is the core NOT logic, triggered when a signal arrives on input port 0 or when the gate is activated (event 1):

1. Selects part 1 (indicator display).
2. Plays a brief flashing animation (`[0 1 0 1 0 1 0]`) on the indicator to show signal processing.
3. Reads the input value from `_p1_`:
   - **If input is 0**: sets output to **255** (logical NOT — false becomes true/max).
   - **If input is non-zero**: sets output to **0** (logical NOT — true becomes false/zero).
4. Sends the computed output value through **output port 0** via `prt: send`.

### NOT Gate Truth Table

| Input (`_p1_`) | Output (port 0) | Logic |
|---|---|---|
| 0 | 255 | NOT false = true (max) |
| Non-zero (1–255) | 0 | NOT true = false |

---

## Removal Script (rscr)

The removal script cleanly uninstalls all NOT gates:

1. Kills all existing NOT gate agents (`enum 3 8 7 → kill targ`).
2. Removes script 100 for classifier 3 8 7 (`scrx 3 8 7 100`).

---

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 90 | `ACTIVATE_MACHINE` | Creature activates the gate (event 1) | Biochemical feedback for interacting with machinery |
| 91 | `GOT_MACHINE` | Creature picks up the gate (event 4) | Biochemical feedback for obtaining a machine |
| 92 | `HIT_MACHINE` | Creature hits the gate (event 3) | Biochemical feedback for hitting machinery |

## Room CA Effects

| CA Index | Name | Source | Amount | Ecological Role |
|---|---|---|---|---|
| 18 | Machinery | Gate emission (`emit`) | 0.2 (continuous) | Marks the room as containing machinery, potentially influencing creature navigation |

## Port Signal Behavior

| Condition | Output Port 0 Value | Meaning |
|---|---|---|
| No input signal | No output | Gate is idle |
| Input = 0 | 255 | Inverted: no signal → max signal |
| Input = 1–255 | 0 | Inverted: any signal → no signal |
| Creature hit gate | rand 60–100 | Random burst via `prt: bang` |
