# Creature detector.cos - Creature Proximity Detector Gadget

**Source**: `Assets/Bootstrap/001 World/Creature detector.cos`

## Overview

This script creates four creature detector gadgets placed throughout the Ark. Each detector is a compound agent with an on/off power button, a creature-type cycle button, and a radar display. When powered on, the detector periodically scans for nearby creatures of a selected type (Norn, Grendel, or Ettin) and outputs a proximity signal through its output port. The signal intensity is proportional to the creature's distance, allowing connected machinery to respond to creature presence.

The detectors are part of the Ark's gadget infrastructure. They emit CA 18 into their room and interact with the port-based wiring system: they accept an activation signal through an input port (which can toggle them on/off remotely) and broadcast a distance-based detection value through an output port. Creatures can interact with the detectors by activating, hitting, or picking them up, each producing a specific biochemical stimulus.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 1 | Creature Detector | `detector` | Gadget that scans for nearby creatures by type and outputs a proximity signal via its port system | [Detail](#creature-detector-3-8-1) |

---

## Creature Detector (3 8 1)

The creature detector is a compound agent with four parts: a main body with a radar-style display (part 0), a creature-type indicator panel (part 1), a power toggle button (part 2), and a creature-type cycle button (part 3). When activated, it uses the timer event to scan for visible creatures within its range and sends a proximity value through its output port.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable + Mouseable + Activatable + Suffers Collisions + Camera Shy |
| `bhvr` | 41 | Creatures can Activate 1 (1) + Hit (8) + Pick Up (32) |
| `accg` | 4 | Light gravity |
| `perm` | 60 | Moderate permeability |
| `elas` | 0 | No bounce |
| `fric` | 80 | High friction |
| `emit` | CA 18 at 0.2 | Emits CA 18 (Machinery) into the room |
| `ov90` | 500 | Detection range in pixels |
| `ov01` | 0 | Power state: 0 = off, 1 = on |
| `ov02` | 0 | Last value received on input port |
| `ov00` | 0 | Creature type filter: 0 = Ettin, 1 = Grendel, 2 = Norn |
| `ov61` | 100 | CA smell emission intensity |

### Initial Placement

Four detector instances are created at bootstrap:

| Instance | Position | `clac` | Notes |
|---|---|---|---|
| 1 | (2185, 450) | -1 | Fixed position, no hand click action |
| 2 | (rand 770-1570, 3432) | -1 | Random x position, no hand click action |
| 3 | (6096, 3630) | 0 | Fixed position, hand click triggers Activate 1 |
| 4 | (2414, 1700) | -1 | Fixed position, no hand click action |

All instances are created at plane 5000 (foreground).

### Compound Parts

| Part | Type | Sprite | Frames | Relative Position | Purpose |
|---|---|---|---|---|---|
| 0 | Body | `detector` | 18 frames | (0, 0) | Main body and radar animation display |
| 1 | `pat: dull` | `detector` | frame 8 onwards | (19, 25) | Creature-type indicator panel (shows Ettin/Grendel/Norn icon) |
| 2 | `pat: butt` | `detector` | frames 14-15 | (0, 47) | Power toggle button (sends message 2000) |
| 3 | `pat: butt` | `detector` | frames 16-17 | (35, 47) | Creature-type cycle button (sends message 2002) |

### Port System

| Direction | Index | Name | Description | Position | Script |
|---|---|---|---|---|---|
| Input | 0 | "detect in" | Activation value — non-zero turns on, zero turns off | (5, 32) | Triggers script 1000 |
| Output | 0 | "detect out" | Creature proximity signal (0-255, proportional to distance) | (4, 48) | — |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | Creature type filter: 0 = Ettin (genus 3), 1 = Grendel (genus 2), 2 = Norn (genus 1) |
| `ov01` | 0 | Power state: 0 = off, 1 = on |
| `ov02` | 0 | Last value received on input port 0 |
| `ov61` | 100 | CA smell emission intensity |
| `ov90` | 500 | Detection range (also set via `rnge`) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Creature activates the detector — toggles power and sends stimulus |
| 2 | Activate 2 | Creature performs secondary activation — sends message 2001 |
| 3 | Hit | Creature hits the detector — physical knockback and stimulus |
| 4 | Pickup | Creature picks up the detector — sends stimulus to creature |
| 9 | Timer | Periodic creature scan — detects creatures and outputs proximity signal |
| 1000 | Port Input (port 0) | Receives activation value from connected agent — toggles power accordingly |
| 2000 | Custom: Toggle Power | Internal message — switches detector between on and off states |
| 2002 | Custom: Cycle Type | Internal message — cycles the creature type filter (Ettin → Grendel → Norn) |

---

#### Event 1 — Activate 1

When a creature activates the detector:
1. Sends **stimulus 90** (`ACTIVATE_MACHINE`) with intensity 1 to the activating creature.
2. Sends message 2000 to self, toggling the detector's power state.

#### Event 2 — Activate 2

When a creature performs secondary activation:
1. Sends message 2001 to self (no handler is defined for 2001, so this has no effect in practice).

#### Event 3 — Hit

When a creature hits the detector:
1. Plays the `"hit_"` sound effect.
2. Applies a random upward velocity (`velo 0, rand -5 to -10`) — the detector bounces up when struck.
3. Applies a random port bang value (60-100) via `prt: bang`, sending a random signal burst through connected ports.
4. Sends **stimulus 92** (`HIT_MACHINE`) with intensity 1 to the hitting creature.

#### Event 4 — Pickup

When a creature picks up the detector:
1. Targets the picking-up creature.
2. If the creature is family 4 (a Creature), sends **stimulus 91** (`GOT_MACHINE`) with intensity 1 to it.

#### Event 9 — Timer (Creature Scan)

This is the core detection logic, running periodically while the detector is powered on (tick interval 5):

1. **Select creature type**: Based on `ov00`, determines which creature genus to scan for:
   - `ov00 = 0`: Scans for **Ettins** (family 4, genus 3) — display shows frame 3
   - `ov00 = 1`: Scans for **Grendels** (family 4, genus 2) — display shows frame 4
   - `ov00 = 2`: Scans for **Norns** (family 4, genus 1) — display shows frame 5

2. **Scan for creatures**: Uses `esee` to enumerate all visible creatures of the selected type within range.

3. **For each detected creature** (that is alive):
   - Calculates the relative X distance (`relx`) between detector and creature.
   - Plays the `"radr"` radar ping sound.
   - Computes a proximity value: `signal = 255 / (range / distance)` — values close to 0 indicate nearby creatures, values close to 255 indicate creatures near the detection range limit.
   - If distance is 0 (creature directly on top), sends signal value 1.
   - Sends the computed signal through **output port 0** via `prt: send`.
   - Animates the radar display to show detection activity.

4. **No creature found**: Sends 0 through the output port, indicating no detection.

#### Event 1000 — Port Input (Input Port 0)

Receives a value from a connected agent through input port 0:

1. Stores the received value (`_p1_`) in `ov02`.
2. **If detector is OFF** (`ov01 = 0`) and received value is non-zero: sends message 2000 to toggle power ON.
3. **If detector is ON** (`ov01 = 1`) and received value is zero: sends message 2000 to toggle power OFF.

This allows external agents connected via the port system to remotely control the detector.

#### Event 2000 — Toggle Power

Internal toggle message, called by Activate 1 (event 1) or port input (event 1000). Uses `lock` for atomic execution:

**Turning ON** (from `ov01 = 0`):
1. Sets `ov01 = 1` (powered on).
2. Animates the power button press (part 2, frame 1).
3. Plays the `"beep"` sound.
4. Runs a power-up animation sequence on the main display (part 0).
5. Waits for animation to complete (`over`), then starts the radar sweep animation.
6. Animates the type indicator (part 1) showing the current creature type.
7. Starts the timer at interval 5 (`tick 5`) to begin scanning.

**Turning OFF** (from `ov01 = 1`):
1. Sets `ov01 = 0` (powered off).
2. Animates the power button press (part 2, frame 1).
3. Plays the `"beep"` sound.
4. Runs a power-down animation sequence on the main display (part 0).
5. Waits for animation to complete.
6. Resets all parts to their idle frames.
7. Stops the timer (`tick 0`) — scanning ceases.

#### Event 2002 — Cycle Creature Type

Only active when the detector is powered on (`ov01 = 1`):

1. Animates the cycle button press (part 3, frame 1).
2. Plays the `"beep"` sound.
3. Increments `ov00` by 1 and wraps around at 3 → 0.
4. Updates the type indicator display (part 1):
   - `ov00 = 0`: frame 3 (Ettin)
   - `ov00 = 1`: frame 4 (Grendel)
   - `ov00 = 2`: frame 5 (Norn)
5. Waits for button animation to complete, then resets button to idle frame.

---

## Removal Script (rscr)

The removal script cleanly uninstalls all creature detectors:

1. Kills all existing detectors (`enum 3 8 1 → kill targ`).
2. Removes scripts: Activate 1 (1), Activate 2 (2), Timer (9), Port Input (1000), Toggle (2000), and Cycle Type (2001) for classifier 3 8 1.

---

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 90 | `ACTIVATE_MACHINE` | Creature activates the detector (event 1) | Biochemical feedback for interacting with machinery |
| 91 | `GOT_MACHINE` | Creature picks up the detector (event 4) | Biochemical feedback for obtaining a machine |
| 92 | `HIT_MACHINE` | Creature hits the detector (event 3) | Biochemical feedback for hitting machinery |

## Room CA Effects

| CA Index | Name | Source | Amount | Ecological Role |
|---|---|---|---|---|
| 18 | Machinery | Detector emission (`emit`) | 0.2 (continuous) | Marks the room as containing machinery, potentially influencing creature navigation |

## Port Signal Behavior

| Condition | Output Port 0 Value | Meaning |
|---|---|---|
| Detector OFF | No signal | Detector is inactive |
| No creature detected | 0 | No creature of selected type within range |
| Creature at distance 0 | 1 | Creature directly at detector position |
| Creature at distance d | `255 * d / range` | Proportional to distance (low = close, high = far) |
| Creature hit detector | rand 60-100 | Random burst via `prt: bang` |
