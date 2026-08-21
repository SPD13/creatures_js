# logicgate.cos - AND/OR Logic Gate Gadget

**Source**: `Assets/Bootstrap/001 World/logicgate.cos`

## Overview

This script creates two switchable AND/OR logic gates — part of the Ark's port-based wiring system. Each gate is a compound agent with two input ports and one output port. The gate operates in one of two modes:

- **AND mode** (default): Outputs 255 only when **both** inputs receive non-zero values.
- **OR mode**: Outputs 255 when **either** input receives a non-zero value.

Creatures can toggle between AND and OR mode by activating (pushing) the gate. A visual indicator on part 4 shows the current mode. The gates are placed randomly in the lower Ark section and emit CA 18 (Machinery) into their room, allowing creatures to detect them. Creatures can also interact by hitting or picking up the gates, each providing biochemical stimulus feedback.

The gates use a two-phase input system: each input port stores its value independently, and the output is only computed once both inputs have arrived (or immediately in OR mode if one input is non-zero). After output is computed, both inputs reset to an "unset" sentinel value (999).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 6 | AND/OR Logic Gate | `logicgates` | Switchable two-input logic gate that outputs the Boolean AND or OR of its input signals via the port system | [Detail](#andor-logic-gate-3-8-6) |

---

## AND/OR Logic Gate (3 8 6)

The logic gate is a compound agent with five parts: a main body (part 0), two input indicators (parts 1 and 2), an output indicator (part 3), and a mode indicator (part 4). It has two input ports and one output port. When signals arrive on both input ports, the gate evaluates them according to its current mode (AND or OR) and sends the result through the output port.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseclickable (2) + Activatable (4) + Suffers Collisions (64) + Suffers Physics (128) |
| `bhvr` | 41 | Creatures can Activate 1 (1) + Hit (8) + Pick Up (32) |
| `clac` | 0 | No clik action |
| `accg` | 3 | Light gravity |
| `perm` | 60 | Moderate permeability |
| `elas` | 0 | No bounce |
| `emit` | CA 18 at 0.2 | Emits CA 18 (Machinery) into the room |
| `ov61` | 100 | CA smell emission intensity |

### Initial Placement

Two logic gate instances are created at bootstrap:

| Instance | Position | Notes |
|---|---|---|
| 1 | (rand 770–1570, 3432) | Random x position in lower Ark |
| 2 | (rand 770–1570, 3432) | Random x position in lower Ark |

Both instances are created at plane 5000 (foreground).

### Compound Parts

| Part | Type | Sprite | First Image | Anim Frames | Relative Position | Purpose |
|---|---|---|---|---|---|---|
| 0 | Body | `logicgates` | 1 | 0 | (0, 0) | Main gate body |
| 1 | `pat: dull` | `logicgates` | 3 | 10 | (1, 1) | Input 1 indicator — lights up when input port 0 receives a signal |
| 2 | `pat: dull` | `logicgates` | 5 | 9 | (18, 1) | Input 2 indicator — lights up when input port 1 receives a signal |
| 3 | `pat: dull` | `logicgates` | 7 | 34 | (10, 1) | Output indicator — animates when the gate processes and sends output |
| 4 | `pat: dull` | `logicgates` | 1 | 16 | (5, 1) | Mode indicator — pose 0 for OR mode, pose 1 for AND mode |

### Port System

| Direction | Index | Name | Description | Position | Script |
|---|---|---|---|---|---|
| Input | 0 | "Logic input 1" | Receives the first input signal value | (2, 6) | Triggers script 1000 |
| Input | 1 | "Logic input 2" | Receives the second input signal value | (2, 20) | Triggers script 1001 |
| Output | 0 | "Logic Output" | Sends the computed output signal | (44, 12) | — |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 1 | Gate mode: **1** = AND mode, **-1** = OR mode |
| `ov01` | 999 | Input 1 stored value (999 = unset/no signal received) |
| `ov02` | 999 | Input 2 stored value (999 = unset/no signal received) |
| `ov61` | 100 | CA smell emission intensity |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Creature activates the gate — toggles AND/OR mode and sends stimulus |
| 3 | Hit | Creature hits the gate — physical knockback, port bang, and stimulus |
| 4 | Pickup | Creature picks up the gate — sends stimulus to creature |
| 1000 | Port Input 0 | Receives input signal on port 0 (Logic input 1) |
| 1001 | Port Input 1 | Receives input signal on port 1 (Logic input 2) |
| 1002 | Process Logic | Internal message — evaluates the gate logic and sends output |

---

#### Event 1 — Activate 1

When a creature activates the logic gate:
1. Plays the `"lg_1"` sound effect.
2. Sends **stimulus 90** (`ACTIVATE_MACHINE`) with intensity 1 to the activating creature.
3. Checks current mode (`ov00`) and updates part 4 (mode indicator):
   - If `ov00 < 0` (currently OR mode, about to switch to AND): sets part 4 pose to 0.
   - Otherwise (currently AND mode, about to switch to OR): sets part 4 pose to 1.
4. Negates `ov00` via `negv`, toggling between AND mode (1) and OR mode (-1).

#### Event 3 — Hit

When a creature hits the logic gate:
1. Plays the `"hit_"` sound effect.
2. Applies a random upward velocity (`velo 0, rand -5 to -10`) — the gate bounces upward when struck.
3. Applies a random port bang value (60–100) via `prt: bang`, sending a random signal burst through connected ports.
4. Sends **stimulus 92** (`HIT_MACHINE`) with intensity 1 to the hitting creature.

#### Event 4 — Pickup

When a creature picks up the logic gate:
1. Targets the picking-up creature (`from`).
2. If the creature is family 4 (a Creature), sends **stimulus 91** (`GOT_MACHINE`) with intensity 1 to it.

#### Event 1000 — Port Input 0 (Logic Input 1)

When a signal arrives on input port 0:
1. Stores the input value (`_p1_`) in `ov01`.
2. Sets part 1 (input 1 indicator) to pose 1 (lit up).
3. Checks if the gate is ready to evaluate:
   - If `ov02 ≠ 999` (input 2 already received) **or** `ov00 = -1` (OR mode): sends message 1002 to self to trigger logic evaluation.
   - Otherwise: waits 40 ticks for the second input, then resets — sets part 1 back to pose 0 and `ov01` back to 999 (timeout: input 1 expires if input 2 doesn't arrive in time).

#### Event 1001 — Port Input 1 (Logic Input 2)

When a signal arrives on input port 1:
1. Stores the input value (`_p1_`) in `ov02`.
2. Sets part 2 (input 2 indicator) to pose 1 (lit up).
3. Checks if the gate is ready to evaluate:
   - If `ov01 ≠ 999` (input 1 already received) **or** `ov00 = -1` (OR mode): sends message 1002 to self to trigger logic evaluation.
   - Otherwise: waits 40 ticks for the first input, then resets — sets part 2 back to pose 0 and `ov02` back to 999 (timeout: input 2 expires if input 1 doesn't arrive in time).

#### Event 1002 — Process Logic (Internal)

This is the core logic evaluation, triggered by message 1002 from the input port scripts:

1. Plays the `"lg_o"` sound effect.
2. Animates part 3 (output indicator) with a flashing sequence `[0 1 0 1 0 1 0 1 0]`.
3. Reads both input values into local variables (`va00 = ov01`, `va01 = ov02`).
4. Evaluates based on current mode:

**OR Mode** (`ov00 = -1`):
- If either input is non-zero and not 999: sends **255** through output port 0.
- If both inputs are 0: sends **0** through output port 0.

**AND Mode** (`ov00 = 1`):
- If both inputs are non-zero and not 999: sends **255** through output port 0.
- If both inputs are 0: sends **0** through output port 0.

5. Resets both inputs: sets `ov01` and `ov02` back to 999, and sets parts 1 and 2 (input indicators) back to pose 0.

> **Note**: In AND mode, the check for input 1 uses `va00 ne 99` (line 118 in the original script), which appears to be a typo for `999`. This means in AND mode, an input value of exactly 99 would be incorrectly treated as "unset". All other values work correctly.

### Logic Truth Tables

**AND Mode** (`ov00 = 1`):

| Input 1 | Input 2 | Output | Logic |
|---|---|---|---|
| 0 | 0 | 0 | Both zero → false |
| Non-zero | 0 | — | No output (only one non-zero) |
| 0 | Non-zero | — | No output (only one non-zero) |
| Non-zero | Non-zero | 255 | Both non-zero → true (max) |

**OR Mode** (`ov00 = -1`):

| Input 1 | Input 2 | Output | Logic |
|---|---|---|---|
| 0 | 0 | 0 | Both zero → false |
| Non-zero | 0 or unset | 255 | At least one non-zero → true (max) |
| 0 or unset | Non-zero | 255 | At least one non-zero → true (max) |
| Non-zero | Non-zero | 255 | Both non-zero → true (max) |

---

## Removal Script (rscr)

The removal script cleanly uninstalls all logic gates:

1. Kills all existing logic gate agents (`enum 3 8 6 → kill targ`).
2. Removes scripts 1000, 1001, and 1002 for classifier 3 8 6 (`scrx`).

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
| AND mode: both inputs non-zero | 255 | Both true → max signal |
| AND mode: one or no input non-zero | No output | Insufficient inputs |
| OR mode: at least one input non-zero | 255 | At least one true → max signal |
| Both inputs are 0 | 0 | Both false → no signal |
| Creature hit gate | rand 60–100 | Random burst via `prt: bang` |
| Input timeout (40 ticks) | No output | Single input expires without second input arriving |
