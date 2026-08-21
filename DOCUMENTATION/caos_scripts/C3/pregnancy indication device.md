# pregnancy indication device.cos - Pregnancy Detection Tool

**Source**: `Assets/Bootstrap/001 World/pregnancy indication device.cos`

## Overview

This script creates a "pregnancy indication device" — a wired tool gadget that, when activated, continuously scans for a nearby creature and reports that creature's Pregnancy chemical (chem 48) level. The device has an input port (for remote activation from the wiring system) and an output port that sends the detected pregnancy chemical value to any downstream wired device.

While active, the main device monitors its surroundings through `etch 4 0 0` (a 4-unit-wide scan for family 4 agents — creatures) and, if exactly one creature is detected, it instantiates a small secondary display agent (1 1 116) floated next to the creature. The display agent's pose reflects three pregnancy intensity bands (low / medium / high) by showing pose 16, 17, or 18 respectively, provided the target creature's gender locus (`loci 1 1 2 1`) evaluates to 1 (female). If the tracked creature changes or leaves, the old display agent is killed and recreated against the new target.

A single instance is installed at (1699, 3664) in the Ark. Creatures can hit or pick up the device, producing the standard machine stimuli.

## Created Agents

| Classifier | Name | Description | Detail |
|---|---|---|---|
| 3 8 17 | Pregnancy Indication Device | Main wired tool body with input/output ports that detects nearby creatures and reads their pregnancy chemical level | [Detail](#pregnancy-indication-device-3-8-17) |
| 1 1 116 | Pregnancy Display | Small floating display agent attached to a tracked creature that visually indicates the pregnancy chemical level via pose | [Detail](#pregnancy-display-1-1-116) |

---

## Pregnancy Indication Device (3 8 17)

The main body of the gadget. It is a simple (`simp`) agent with 8 sprite frames on image base 17. It is installed once at (1699, 3664) and acts as a wired tool: it has one input port (msg 2000) used to switch it on remotely, and one output port used to broadcast the detected pregnancy chemical value.

### Properties

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 3 8 17 "pregnancy indication device" 0 0 5004 | Simple agent, 8 sprite frames, image base 0, plane 5004 |
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activateable (4) + Greedy Cabin (64) + Suffer Collisions (128) |
| `bhvr` | 41 | Activate 1 (1) + Hit (8) + Pick Up (32) |
| `elas` | 20 | Low bounce |
| `perm` | 64 | Moderate permeability |
| `accg` | 20 | Gravity |
| `aero` | 20 | Air resistance |
| `emit` | CA 18 at 0.35 | Continuously emits CA 18 (Detector-class scent) into the room |
| `ov61` | 100 | CA smell emission intensity |

### Ports

| Direction | Index | Name | Description | Msg Range |
|---|---|---|---|---|
| Input | 0 | "input" | "numeric output tool input" at (58, 54) | 2000 |
| Output | 0 | "output" | "numeric output tool output" at (12, 54) | — |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | Active flag (0 = off/idle, 1 = on/scanning) |
| `ov16` | null | Handle to the currently-active Pregnancy Display child agent (1 1 116) |
| `ov17` | null | Handle to the creature currently being tracked (used to detect target changes) |
| `ov61` | 100 | CA smell emission intensity |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Toggles the device on or off (plays fold/unfold animation, starts or stops the scan timer) |
| 9 | Timer | Periodic scan: finds a nearby creature, creates/updates a Pregnancy Display agent, reports chem 48 on the output port |
| 2000 | Port Input | Remote activation via the input port (turns the device on if the signal is positive and the device is currently off) |
| 3 | Collision / Hit | Creature hits the device — bounce, random port bang, creature receives HIT_MACHINE stimulus |
| 4 | Pickup | Creature picks up the device — creature receives GOT_MACHINE stimulus (family 4 only) |

---

#### Event 1 — Activate 1 (toggle)

Clicking the device toggles it between off and on states.

- **If `ov00 = 0` (currently off):**
  1. Plays the `"pi_1"` sound effect.
  2. Plays the unfold animation `[0..15]` and then holds on the last frame (`over`).
  3. Starts the scan timer with `tick 1` (timer fires every tick).
  4. Sets `ov00 = 1` (device now on).

- **If `ov00 = 1` (currently on):**
  1. Plays the `"pi_1"` sound effect.
  2. Plays the fold-up animation `[19..26, 0]` and holds (`over`), returning to the idle pose.
  3. Sets `ov00 = 0` (device now off).
  4. If a Pregnancy Display child (`ov16`) exists, kills it and clears the handle.
  5. Stops the scan timer with `tick 0`.

The activating creature is also written **stimulus 90** with intensity 1 (sent at the top of the handler, before the `doif`).

#### Event 9 — Timer (per-tick scan)

Fires every tick while the device is on. Implements the core detection and reporting loop.

1. Initializes locals: `va00 = 0` (creature count), `va50 = 0` (pregnancy chem value), `va16 = null` (first detected creature).
2. `inst` — runs atomically without yielding to the scheduler.
3. `etch 4 0 0` — enumerates touching agents of family 4 (creatures) within the device's own bounds:
   - Increments `va00`.
   - On the first one found, stores its handle in `va16`.
4. `slow` — allows the scheduler to yield again.
5. Back on `ownr`:
   - If the tracked target has changed (`ov17 <> va16`) **and** a display child already exists, the old display is killed (`targ ov16` → `kill targ`).
   - `ov17` is updated to the newly-found creature (or `null` if none).
6. Branches by creature count and current display state:
   - **`va00 = 1` and `ov16 = null`** (one creature, no display yet): creates a new Pregnancy Display child agent (1 1 116), attaches it to the creature via `frel va16`, plays its spawn animation `[0..9, 255]`, positions it with `flto -5 -5`, then reads the creature's `loci 1 1 2 1` (gender / female flag) into `va49` and chem 48 into `va50`. If female (`va49 = 1`), chooses the display pose based on pregnancy intensity:

     | `va50` (chem 48) | Pose |
     |---|---|
     | 0.01 – 0.33 | 16 (low) |
     | 0.33 – 0.66 | 17 (medium) |
     | 0.66 – 1.00 | 18 (high) |

     Finally `prt: send 0 va50` broadcasts the chemical value to the output port.
   - **`va00 = 1` and `ov16 <> null`** (one creature, display already exists): just re-reads `loci` and `chem 48`, updates the display pose using the same bands, and re-sends the chemical value on the output port.
   - **`va00 = 0`** (no creature touching): if a display exists, kills it, clears `ov16`, and sets the main device pose back to 15 (neutral / "no target").

#### Event 2000 — Port Input

Triggered when a signal arrives on input port 0 (`_p1_` holds the incoming value).

- If `_p1_ > 0` **and** the device is currently off (`ov00 = 0`):
  1. Plays the `"pi_1"` sound.
  2. Plays the unfold animation `[0..15]` and holds (`over`).
  3. Starts the scan timer (`tick 1`).
  4. Sets `ov00 = 1`.

Negative or zero signals do nothing, and the port cannot turn the device off — it is a one-way "turn on" signal.

#### Event 3 — Collision / Hit

Triggered when something collides with / a creature hits the device:
1. Plays the `"hit_"` sound.
2. Applies a random upward velocity (`velo 0, rand -5 -10`) — the device bounces up.
3. `prt: bang rand 60 100` — sends a random port burst.
4. Writes **stimulus 92** (`HIT_MACHINE`) with intensity 1 to the hitting agent (`from`).

#### Event 4 — Pickup

Triggered when an agent picks up the device:
1. `targ from` — target the picking-up agent.
2. If it belongs to family 4 (a creature), writes **stimulus 91** (`GOT_MACHINE`) with intensity 1.

---

## Pregnancy Display (1 1 116)

A small simple agent created and destroyed dynamically by the Pregnancy Indication Device's timer script. It is not a tool itself; it is a purely cosmetic indicator attached to a tracked creature, visualizing the creature's pregnancy chemical level through its pose.

### Properties

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 1 1 116 "pregnancy indication device" 11 27 1000 | Simple agent, 11 sprite frames, image base 27, plane 1000 |
| `attr` | 48 | Invisible (16) + Floatable (32) — floats relative to a parent and is not directly interactable |
| `frel` | (tracked creature) | Floats relative to the detected creature |
| `flto` | (-5, -5) | Positioned with a small offset from the relative anchor |

### Events

The display agent has **no event scripts of its own** — it has no `scrp` blocks with classifier `1 1 116`. All of its behavior (creation, pose updates, destruction) is driven externally by the parent device's timer script (event 9) and activate handler (event 1).

| Behavior | Driven By | Description |
|---|---|---|
| Creation + spawn animation | Device event 9 (first-detection branch) | Plays animation `[0..9]` and holds on frame 9, then is posed 16 / 17 / 18 depending on the creature's chem 48 |
| Ongoing pose updates | Device event 9 (re-scan branch) | Pose is updated each tick based on the creature's current chem 48 value |
| Destruction | Device event 1 (toggle-off), device event 9 (creature lost or changed) | The display is `kill`-ed when the device is turned off, the creature leaves, or a different creature becomes the target |

### Removal Script

The bootstrap `rscr` block at the end of the file enumerates every `1 1 116` instance and kills it, ensuring any orphaned display agents are cleaned up alongside the main device.

---

## Removal Script (rscr)

The removal script cleanly uninstalls both agent types created by this bootstrap:

1. `enum 3 8 17` → `kill targ` — removes every Pregnancy Indication Device instance.
2. `enum 1 1 116` → `kill targ` — removes every Pregnancy Display instance (in case any are still alive).

The event scripts themselves are not explicitly stripped with `scrx`.

---

## Stimulus Summary

| Stimulus # | Context | Effect |
|---|---|---|
| 90 | Device activated (event 1) | Biochemical feedback written to the activator for pressing the device |
| 91 | `GOT_MACHINE` — device picked up (event 4, family 4 only) | Standard "got a machine" feedback |
| 92 | `HIT_MACHINE` — device hit (event 3) | Standard "hit a machine" feedback |

## Room CA Effects

| CA Index | Source | Amount | Ecological Role |
|---|---|---|---|
| 18 | Device `emit` | 0.35 (continuous) | Marks the room as containing this scent type (used by creatures for navigation / detection of this device class) |

## Wiring Summary

| Source | Output Port 0 Value |
|---|---|
| Timer scan with one creature detected (event 9) | The creature's current chem 48 (Pregnancy) value in [0, 1] |
| Port input `_p1_ > 0` while off (event 2000) | (turns the device on; no output is sent by this handler directly) |
| Hit (event 3) | `prt: bang` random burst in 60–100 |
