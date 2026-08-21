# Count Gate

**File**: `Bootstrap/001 World/count gate.cos`

## Overview

This script creates a **count gate** gadget (3 8 12) for the Ark's engineering wiring system. The count gate is a logic component that counts incoming port signals and only fires its output after receiving a configurable number of inputs. It features two buttons (increment/decrement) that allow the user or creatures to adjust the required count threshold from 0 to 19. Once the gate has received the required number of signals, it forwards the most recent input value through its output port and resets its internal counter.

Two instances are created at random positions within the Engineering section of the Ark. The gate emits CA 18 (machinery smell) so creatures can find and interact with it.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| 3 8 12 | [Count Gate](#count-gate-3-8-12) | Counts incoming port signals and outputs after a configurable threshold is reached |

## Agent Details

### Count Gate (3 8 12)

A compound agent using the "counter" sprite set (15 images). It consists of three visual parts: an increment button, a decrement button, and a numeric display showing the current threshold. Two instances are placed at random X positions (770–1570) at Y=3432 in the Engineering area.

**Properties**:

| Property | Value | Description |
|---|---|---|
| `bhvr` | 41 | Activate 1, hit, and pickup behaviors enabled |
| `attr` | 198 | Activatable, carryable, mouseclickable, physics, port visible |
| `elas` | 55 | Medium elasticity |
| `accg` | 5 | Standard gravity |
| `aero` | 10 | Air resistance |
| `perm` | 100 | Maximum permeability |
| `fric` | 50 | Medium friction |
| `clac` | -1 | No carrying capacity limit |
| `emit` | CA 18 at 0.25 | Machinery smell |
| `tick` | 0 | No periodic timer |

**Parts**:

| Part | Type | Sprite Index | Description |
|---|---|---|---|
| 1 | Button | 21 | Increment (+) button, triggers message 1064 |
| 2 | Button | 22 | Decrement (-) button, triggers message 1164 |
| 3 | Dull | 1 | Numeric display showing current threshold (poses 0–19) |

**Ports**:

| Port | Direction | ID | Name | Description |
|---|---|---|---|---|
| Input | `prt: inew` | 0 | "input counter" | Receives input signals to count, triggers message 1264 |
| Output | `prt: onew` | 0 | "input outputer" | Fires the accumulated value when count threshold is reached |

**Key Variables**:

| Variable | Initial Value | Description |
|---|---|---|
| `ov01` | 0 | Current threshold display value (0–19) |
| `ov02` | 10 | Threshold value (ov78 * 10), used externally |
| `ov61` | 100 | Stored default value |
| `ov70` | -1 | Current input signal count (starts at -1 so first signal initializes to 0) |
| `ov75` | 255 | Most recently received input value (sent on output when threshold met) |
| `ov78` | 1 | Required number of input signals before firing (ov01 + 1) |
| `ov91` | 1 | Flag (gate active) |

**Events**:

| Event | Number | Description |
|---|---|---|
| Activate 1 (Push) | 1 | Creature pushes the gate — triggers increment |
| Hit | 3 | Creature hits the gate |
| Pickup | 4 | Creature picks up the gate |
| Increment Button | 1064 | Internal: increases the count threshold display |
| Decrement Button | 1164 | Internal: decreases the count threshold display |
| Port Input | 1264 | Receives a signal on the input port and counts it |

---

#### Event 1 — Activate 1 (Push)

When a creature pushes (activates) the count gate:

1. Sends **stimulus 90** ("Activated machine") to the creature.
2. Sends internal message 1064 to itself (the increment button handler), which increases the displayed threshold by one.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Activated machine | 90 | Creature that pushed | Biochemical feedback for activating a machine |

#### Event 3 — Hit

When a creature hits the count gate:

1. Plays sound `"hit_"`.
2. Applies a random upward velocity (between -5 and -10) to make the gate bounce.
3. Sends a random bang value (60–100) through output port 0 (`prt: bang`), triggering connected gadgets.
4. Sends **stimulus 92** ("Hit machine") to the creature.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Hit machine | 92 | Creature that hit | Biochemical feedback for hitting a machine |

#### Event 4 — Pickup

When a creature (family 4) picks up the count gate, the script sends **stimulus 91** ("Got machine") to the creature, providing biochemical feedback reinforcing the action.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Got machine | 91 | Creature that picked up | Biochemical reward for picking up a machine |

#### Event 1064 — Increment Button

Triggered when the increment button (part 1) is clicked or when a creature pushes the gate (via event 1):

1. Sends message 107 to the pointer (user feedback acknowledgment).
2. Plays sound `"bep2"`.
3. Animates the increment button (part 1) through a brief press animation (frames 2,2,2,2,0).
4. If the display value (`ov01`) is less than 19, increments it by 1.
5. Updates the numeric display (part 3) pose to show the new value.
6. Recalculates the threshold: `ov78 = ov01 + 1` (required signal count) and `ov02 = (ov01 + 1) * 10`.

The maximum displayable threshold is 19, corresponding to a required count of 20 input signals before the gate fires.

#### Event 1164 — Decrement Button

Triggered when the decrement button (part 2) is clicked:

1. Sends message 107 to the pointer (user feedback acknowledgment).
2. Plays sound `"bep2"`.
3. Animates the decrement button (part 2) through a brief press animation (frames 2,2,2,2,0).
4. If the display value (`ov01`) is greater than 0, decrements it by 1.
5. Updates the numeric display (part 3) pose to show the new value.
6. Recalculates the threshold: `ov78 = ov01 + 1` and `ov02 = (ov01 + 1) * 10`.

The minimum displayable threshold is 0, corresponding to a required count of 1 input signal.

#### Event 1264 — Port Input (Signal Counting)

The core logic of the count gate. This script runs in locked (atomic) mode to prevent interruption during counting. When a signal arrives on input port 0:

1. **If the internal counter (`ov70`) is below the threshold (`ov78`)**:
   - Stores the incoming value (`_p1_`) in `ov75` for later output.
   - Increments the counter (`ov70`).
   - If the counter now meets or exceeds the threshold, calls the `send` subroutine.
2. **If the counter already meets or exceeds the threshold**: calls the `send` subroutine immediately (handles edge case of threshold being lowered while counter is already full).

**Subroutine `send`**:
- Resets the counter (`ov70`) to 0.
- Sends the stored value (`ov75`) through output port 0, forwarding it to any connected downstream gadgets.

This means the gate accumulates signals silently until the configured number is reached, then fires once and resets. The output value is the most recently received input value.

## Removal Script

The removal script (`rscr`) iterates through all agents with classifier 3 8 12 and kills them, then removes all associated event scripts (1064, 1164, 1264, 3, 1).

## Ecosystem Impact

- **CA System**: Emits CA 18 (machinery smell) at intensity 0.25 into its room, allowing creatures to detect and navigate toward it.
- **Wiring Network**: Functions as a programmable counter/divider in the Ark's gadget wiring system. It can be used to require multiple input triggers before activating a downstream device (e.g., requiring 5 creature detections before opening a door). The adjustable threshold (1–20 signals) makes it versatile for various logic configurations.
- **Creature Interaction**: Provides biochemical stimuli for three types of interaction: pushing (stimulus 90), hitting (stimulus 92), and picking up (stimulus 91). Creatures pushing the gate also increment the threshold display.
