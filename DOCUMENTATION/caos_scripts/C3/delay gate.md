# Delay Gate

**File**: `Bootstrap/001 World/delay gate.cos`

## Overview

This script creates a **delay gate** gadget (3 8 13) for the Ark's engineering wiring system. The delay gate is a signal-processing component that receives an input signal on its input port, waits for a configurable countdown period (1–20 ticks of delay), and then forwards the signal through its output port. The user or creatures can toggle the gate on/off by clicking it, and adjust the delay duration using increment/decrement buttons. While in standby (off) mode, the gate displays idle animations; when armed (on), it shows the current delay value on a numeric display. Upon receiving a signal, the gate performs a visible countdown animation before transmitting the delayed output.

One instance is created at position (6050, 3900) in the Engineering section of the Ark. The gate emits CA 18 (machinery smell) so creatures can find and interact with it.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| 3 8 13 | [Delay Gate](#delay-gate-3-8-13) | Receives a port signal, counts down a configurable delay, then forwards the signal |

## Agent Details

### Delay Gate (3 8 13)

A compound agent using the "delayer" sprite set. It consists of five visual parts: the base body (part 0), a decrement button, an increment button, a numeric delay display, and an animated status indicator. One instance is placed at (6050, 3900) in the Engineering area.

**Properties**:

| Property | Value | Description |
|---|---|---|
| `bhvr` | 41 | Activate 1, hit, and pickup behaviors enabled |
| `attr` | 198 | Carryable, mouseclickable, physics, port visible |
| `elas` | 0 | No elasticity |
| `accg` | 5 | Standard gravity |
| `perm` | 100 | Maximum permeability |
| `clac` | 1002 | Click action triggers message 1002 (toggle on/off) |
| `emit` | CA 18 at 0.25 | Machinery smell |

**Parts**:

| Part | Type | Sprite Index | Description |
|---|---|---|---|
| 0 | Base | 0 | Main body with idle animation |
| 1 | Button | 21 | Decrement (-) button, offset (0,15), triggers message 1000 |
| 2 | Button | 22 | Increment (+) button, offset (35,35), triggers message 1001 |
| 3 | Dull | 0 | Numeric display showing current delay value, offset (9,7) |
| 4 | Dull | 0 | Status indicator with spinning animation when off, offset (15,10) |

**Ports**:

| Port | Direction | ID | Name | Description |
|---|---|---|---|---|
| Input | `prt: inew` | 0 | "signal ear" | Receives input signals, triggers message 1003 |
| Output | `prt: onew` | 0 | "signal mouth" | Emits the delayed signal |

**Key Variables**:

| Variable | Initial Value | Description |
|---|---|---|
| `ov00` | 0 | Gate state: 0 = standby (off), 1 = armed (on) |
| `ov01` | 1 (when armed) | Current delay value (1–20), displayed on part 3 |
| `ov02` | 0 | Creature push direction toggle: 0 = sends decrement, 1 = sends increment |
| `ov61` | 100 | Stored default value |

**Events**:

| Event | Number | Description |
|---|---|---|
| Activate 1 (Push) | 1 | Creature pushes the gate — adjusts delay value |
| Activate 2 (Pull) | 2 | Creature pulls the gate — same behavior as push |
| Hit | 3 | Creature hits the gate |
| Pickup | 4 | Creature picks up the gate |
| Drop | 6 | Gate is dropped |
| Decrement Button | 1000 | Internal: decreases the delay value |
| Increment Button | 1001 | Internal: increases the delay value |
| Toggle On/Off | 1002 | Internal: toggles the gate between standby and armed states |
| Port Input | 1003 | Receives a signal on the input port and begins countdown |

---

#### Event 1000 — Decrement Button

Triggered when the decrement button (part 1) is clicked. Runs in locked (atomic) mode:

1. If the gate is armed (`ov00 = 1`):
   - If the delay value (`ov01`) is greater than 1, decrements it by 1, plays `"bep2"` sound, and animates the button press (part 1, pose 2 briefly).
   - If already at minimum (1), plays `"excl"` (error buzz) — cannot go lower.
   - Updates the numeric display (part 3) to show the new value. Resets button pose.
2. If the gate is in standby (`ov00 = 0`), plays `"excl"` — buttons are inactive when off.

#### Event 1001 — Increment Button

Triggered when the increment button (part 2) is clicked. Runs in locked (atomic) mode:

1. If the gate is armed (`ov00 = 1`):
   - If the delay value (`ov01`) is less than 20, increments it by 1, plays `"bep2"` sound, and animates the button press (part 2, pose 2 briefly).
   - If already at maximum (20), plays `"excl"` (error buzz) — cannot go higher.
   - Updates the numeric display (part 3) to show the new value. Resets button pose.
2. If the gate is in standby (`ov00 = 0`), plays `"excl"` — buttons are inactive when off.

#### Event 1002 — Toggle On/Off (Click Action)

Triggered when the user clicks on the gate body. Runs in locked mode:

1. Plays `"bep2"` sound.
2. **If currently off (`ov00 = 0`) — Arming**:
   - Stops the status indicator animation (part 4 set to pose 33, static).
   - Sets `ov00 = 1` (armed).
   - Stops the base idle animation (part 0 set to static frame 27).
   - Initializes delay value `ov01 = 1`.
   - Updates the numeric display (part 3) to show the delay value.
3. **If currently on (`ov00 = 1`) — Disarming**:
   - Sets `ov00 = 0` (standby).
   - Blanks the numeric display (part 3, pose 33).
   - Restarts the spinning idle animation on part 4 (frames 33,28,29,30,31,32,33,32,31,30,29 looping at frat 2).
   - Restarts the base idle animation on part 0 (frames 25,25,25,26,26,27,26,26 looping at frat 1).
   - Resets direction toggle `ov02 = 0`.

#### Event 1003 — Port Input (Signal Countdown)

The core logic of the delay gate. Runs in locked (atomic) mode. When a signal arrives on input port 0:

1. Reads the incoming signal value into `va00`.
2. If the gate is armed (`ov00 = 1`) and the signal value is non-zero:
   - Animates both buttons as pressed (parts 1 and 2, pose 2).
   - Begins a countdown loop from the current delay value (`ov01`) down to 0:
     - Each step: decrements the countdown display, plays `"spdn"` (spin down) sound, updates the numeric display (part 3), and waits 10 ticks.
     - When the countdown reaches 0, the display resets to show the original delay value.
   - Plays `"spup"` (spin up) sound to signal completion.
   - **Sends the original signal value** (`va00`) through output port 0 (`prt: send 0 va00`), forwarding it to any connected downstream gadget.
   - Resets both button poses back to default (pose 0).
3. If the gate is off or the signal value is 0, the signal is silently ignored.

#### Event 1 — Activate 1 (Push)

When a creature pushes (activates) the delay gate. Runs in locked instant mode:

1. Sends **stimulus 90** ("Activated machine") to the creature.
2. Uses an alternating direction system controlled by `ov02`:
   - If `ov02 = 0` and `ov01 != 20`: sends message 1000 (decrement) to self.
   - If `ov02 = 1` and `ov01 != 1`: sends message 1001 (increment) to self.
   - At boundaries (delay = 20 or delay = 1), toggles `ov02` to reverse direction, then sends the corresponding message.

This causes creatures pushing the gate to sweep the delay value back and forth between 1 and 20.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Activated machine | 90 | Creature that pushed | Biochemical feedback for activating a machine |

#### Event 2 — Activate 2 (Pull)

Identical behavior to Event 1 (Push). Creatures pulling the gate also adjust the delay value using the same alternating direction logic and receive stimulus 90.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Activated machine | 90 | Creature that pulled | Biochemical feedback for activating a machine |

#### Event 3 — Hit

When a creature hits the delay gate:

1. Plays sound `"hit_"`.
2. Applies a random upward velocity (between -5 and -10) to make the gate bounce.
3. Sends a random bang value (60–100) through output port 0 (`prt: bang`), triggering connected gadgets.
4. Sends **stimulus 92** ("Hit machine") to the creature.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Hit machine | 92 | Creature that hit | Biochemical feedback for hitting a machine |

#### Event 4 — Pickup

When a creature (family 4) picks up the delay gate, the script sends **stimulus 91** ("Got machine") to the creature, providing biochemical feedback reinforcing the action.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Got machine | 91 | Creature that picked up | Biochemical reward for picking up a machine |

#### Event 6 — Drop

When the delay gate is dropped, plays `"dr10"` sound effect.

## Removal Script

The removal script (`rscr`) iterates through all agents with classifier 3 8 13 and kills them, then removes all associated event scripts (1, 2, 3, 4, 6, 1000, 1001, 1002, 1003).

## Ecosystem Impact

- **CA System**: Emits CA 18 (machinery smell) at intensity 0.25 into its room, allowing creatures to detect and navigate toward it.
- **Wiring Network**: Functions as a programmable delay element in the Ark's gadget wiring system. It can be used to introduce a timed pause between an input event and a downstream action (e.g., delaying a door opening after a creature detection, or creating timed sequences by chaining multiple delay gates). The adjustable delay (1–20 countdown steps, each 10 ticks long) makes it versatile for various timing configurations.
- **Creature Interaction**: Provides biochemical stimuli for four types of interaction: pushing (stimulus 90), pulling (stimulus 90), hitting (stimulus 92), and picking up (stimulus 91). Creatures pushing or pulling the gate sweep the delay value back and forth, naturally exploring the full range.
