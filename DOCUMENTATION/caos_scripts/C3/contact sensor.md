# Contact Sensor

**File**: `Bootstrap/001 World/contact sensor.cos`

## Overview

This script creates a **contact sensor** gadget (3 8 23) for the Ark's engineering system. The contact sensor detects when a creature is physically touching it and outputs a signal accordingly. When a creature makes contact, the sensor activates (animates, plays a sound, and sends a value of 255 through its output port). When no creature is touching it, the sensor deactivates (reverses its animation and sends 0). This allows it to serve as a creature-presence trigger in wired gadget chains.

The sensor is part of the port-based wiring infrastructure: it has one input port (for receiving signals to forward) and one output port (for broadcasting its detection state or forwarded values). It emits CA 18 (machinery smell) so creatures can detect and navigate to it.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| 3 8 23 | [Contact Sensor](#contact-sensor-3-8-23) | Detects creature contact and outputs an on/off signal through the port wiring system |

## Agent Details

### Contact Sensor (3 8 23)

A simple gadget agent that uses the "contactsensor" sprite (7 frames). It is positioned in the Engineering section of the Ark at coordinates (2708, 3679). The sensor periodically checks for touching creatures via its timer script and broadcasts its state through its output port.

**Properties**:

| Property | Value | Description |
|---|---|---|
| `attr` | 195 | Activatable, carryable, mouseclickable, physics |
| `bhvr` | 40 | Hit and pickup behaviors enabled |
| `elas` | 0 | No elasticity |
| `fric` | 100 | Full friction |
| `accg` | 3 | Standard gravity |
| `perm` | 60 | Medium permeability |
| `emit` | CA 18 at 0.2 | Machinery smell |
| `ov61` | 100 | Stored value (used by output port) |
| `tick` | 10 | Timer fires every 10 ticks |

**Ports**:

| Port | Direction | ID | Name | Description |
|---|---|---|---|---|
| Input | `prt: inew` | 0 | "contact sensor input" | Receives values from other gadgets |
| Output | `prt: onew` | 0 | "contact sensor output" | Sends detection state (0 or 255) or forwarded input values |

**Events**:

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Periodic creature contact detection |
| Port Input | 1000 | Forwards received port values to output |
| Pickup | 4 | Creature picks up the sensor |
| Hit | 3 | Creature hits/activates the sensor |

---

#### Event 9 — Timer (Creature Contact Detection)

The core behavior of the contact sensor. On each tick, the script iterates through all agents of family 4 (creatures) using `etch 4 0 0` to determine if any creature is currently touching the sensor.

- **Creature detected** (`va00 == 1`):
  - If the sensor was previously inactive (`ov00 == 0`): plays sound `"cs_1"`, animates through frames 0→6 (activation animation), and sets `ov00` to 1 (now active).
  - Sends value **255** through output port 0 (ON signal).
- **No creature detected** (`va00 == 0`):
  - If the sensor was previously active (`ov00 == 1`): animates through frames 6→0 (deactivation animation) and sets `ov00` to 0 (now inactive).
  - Sends value **0** through output port 0 (OFF signal).

The `ov00` variable acts as state memory to prevent repeated activation sounds and animations when a creature remains in contact across multiple ticks.

#### Event 1000 — Port Input (Signal Forwarding)

When the sensor receives a value on its input port (port 0), it immediately forwards that value (`_p1_`) to its output port (port 0). This allows the contact sensor to act as a pass-through in a wired gadget chain, relaying signals from upstream gadgets to downstream ones.

#### Event 4 — Pickup

When a creature (family 4) picks up the contact sensor, the script sends **stimulus 91** ("Got machine") to the creature. This provides biochemical feedback to the creature's brain, reinforcing the action of picking up a gadget.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Got machine | 91 | Creature that picked up | Biochemical reward for picking up a machine |

#### Event 3 — Hit

When a creature hits the contact sensor, the script:

1. Plays sound `"hit_"`.
2. Applies a random upward velocity (`vely` between -5 and -10) to make the sensor bounce.
3. Sends a random value (60–100) as a bang signal through output port 0 (`prt: bang`), triggering connected gadgets.
4. Sends **stimulus 92** ("Hit machine") to the creature that hit it, providing biochemical feedback.

**Stimulus impact**:

| Stimulus | Number | Target | Description |
|---|---|---|---|
| Hit machine | 92 | Creature that hit | Biochemical feedback for hitting a machine |

## Removal Script

The removal script (`rscr`) iterates through all agents with classifier 3 8 23 and kills them, cleaning up all contact sensor instances from the world.

## Ecosystem Impact

- **CA System**: Emits CA 18 (machinery smell) at intensity 0.2 into its room, allowing creatures to navigate toward it.
- **Wiring Network**: Functions as both a creature-presence detector and a signal pass-through in the Ark's gadget wiring system. Outputs binary on/off (255/0) based on creature contact, and can also forward input port values or send random bang values when hit.
- **Creature Interaction**: Provides biochemical stimuli to creatures that interact with it (stimulus 91 for pickup, stimulus 92 for hitting), reinforcing learning about machine interactions.
