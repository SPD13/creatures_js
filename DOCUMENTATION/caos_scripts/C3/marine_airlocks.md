# marine_airlocks.cos - Marine Terrarium Airlock Doors

**Source**: `Assets/Bootstrap/001 World/marine_airlocks.cos`

## Overview

This script creates three airlock doors in the Marine Terrarium that separate dry/surface areas from water-filled sections. Each airlock is a two-stage door: opening it first unlocks room permeability and unseals water flow, and a second activation pushes any objects or creatures that have drifted in through the airlock chamber, teleporting them to the correct side. This allows non-swimming creatures and agents to pass between dry and submerged portions of the Marine Terrarium without mixing water across rooms.

Each airlock uses three rooms looked up via `grap`:
- `ov70` — outer room on one side of the airlock.
- `ov71` — the airlock chamber itself (middle).
- `ov72` — outer room on the other side.

When closed (`ov00 = 0`), the airlock seals the chamber by breaking door permeability between `ov71`↔`ov70` and `ov71`↔`ov72` and sets the room links to `100`. When open (`ov00 = 1`), door permeability is raised to `100` and the room links drop to `0`, allowing path flow through the chamber. The airlock then pushes any objects inside the chamber with a directional velocity, waits, and teleports them to the destination side while playing a teleport sound.

All three airlocks share a common activation classifier `6464` (set via `clac`) but have distinct destination coordinates and push directions appropriate to their geometry.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 38 | airlock_left | `airlock_left` 10 0 | Left marine airlock at (4296, 2190); pushes objects westward | [Detail](#airlock_left-3-3-38) |
| 3 3 39 | airlock_mid | `airlock_mid` 10 0 | Middle marine airlock at (4654, 2182); pushes objects in a random direction | [Detail](#airlock_mid-3-3-39) |
| 3 3 40 | airlock_right | `airlock_right` 10 0 | Right marine airlock at (5013, 2169); pushes objects eastward | [Detail](#airlock_right-3-3-40) |

## Common Properties

All three airlocks share the same base properties:

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `clac` | 6464 | Custom activation event |
| `elas` | 10 | Elasticity |
| `fric` | 10 | Friction |
| `perm` | 100 | Permeability |
| `accg` | 2 | Gravity acceleration |
| `aero` | 0 | No air resistance |
| `tick` | 1 | Ticks every game tick |
| Family/Genus/Species | 3 / 3 / 38-40 | Door family |

### Object Variables

| OV | Meaning |
|---|---|
| `ov00` | Airlock state (0 = closed, 1 = open/ready-to-flush) |
| `ov70` | Room ID on one side of airlock |
| `ov71` | Airlock chamber (middle room) |
| `ov72` | Room ID on the other side |

---

## airlock_left (3 3 38)

Left marine airlock at world position (4296, 2190). Rooms sampled from (4290, 2245), (4337, 2236), (4379, 2237). Objects pushed westward when the airlock cycles.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6464 | Custom (Activate Airlock) | Two-stage activation: first opens chamber, second flushes and teleports contents |

#### Event 6464 — Activate Airlock

1. Locks the script; plays "copn" (chamber open) sound.
2. **Stage 1 — Opening** (if `ov00 = 0`):
   - Plays opening animation `[0..9]` doubled (each frame held 2 ticks).
   - Sets door permeability `ov71`→`ov70` and `ov71`→`ov72` to `100` (opens doors).
   - Sets room links `ov70`↔`ov71` and `ov72`↔`ov71` to `0` (disables pathfinding through chamber).
   - Sets `ov00 = 1` (chamber open, awaiting flush).
   - Retargets to a random nearby agent in 1-1-90 range via `rtar`; ticks briefly if found; restores `targ` to `ownr`.
3. **Stage 2 — Flushing** (if `ov00 = 1`):
   - Enumerates all agents in touch (`etch 0 0 0`) and for each agent that is not suspended (`attr & 32 = 0`) and is physical (`attr & 3 <> 0`):
     - Non-creatures (`fmly <> 4`): velocity set to `velo -20, rand -1 1` (pushed westward, slight vertical jitter).
     - Creatures (`fmly = 4`): velocity set to `velo 100, 0` (pushed eastward fast).
   - Waits 10 ticks for the push to take effect.
   - Enumerates touching agents again and teleports any physical, uncarried agent:
     - **Non-creatures** (`fmly <> 4`): Teleports to `(4159, 2268)` using `mvto` (or `mvsf` fallback), velocity zeroed, plays "tele" sound.
     - **Creatures** (`fmly = 4`): Teleports to `(4531, 2293)` using `mvft` (foot-anchored), velocity zeroed, plays "tele" sound.
   - Sets door permeability `ov71`→`ov70` and `ov71`→`ov72` back to `0` (seals doors).
   - Sets room links `ov70`↔`ov71` and `ov72`↔`ov71` back to `100` (restores pathfinding).
   - Sets `ov00 = 0` (fully closed).
   - Retargets to nearby agent for potential chained activation; restores `targ` to `ownr`.
   - Plays closing animation `[9..0]` doubled.
   - `over` — waits for animation completion.

---

## airlock_mid (3 3 39)

Middle marine airlock at world position (4654, 2182). Rooms sampled from (4666, 2253), (4702, 2253), (4765, 2216). Objects pushed in a random horizontal direction during flush.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6464 | Custom (Activate Airlock) | Two-stage activation like airlock_left, but with randomized push direction |

#### Event 6464 — Activate Airlock

Identical structure to airlock_left (opens doors, breaks links on stage 1; flushes, restores links, seals on stage 2) with the following differences:

- **Stage 2 push direction** for non-creatures (`fmly <> 4`): a random choice via `rand 1 2` chooses between `velo -20, rand -1 1` (west) and `velo 20, rand -1 1` (east). Creatures get `velo -100, 0` (pushed west fast).
- **Teleport destinations**:
  - Non-creatures: `(4537, 2176)` via `mvto`/`mvsf`.
  - Creatures: `(4531, 2293)` via `mvft`/`mvsf`.
- Plays "tele" sound on successful teleport.

---

## airlock_right (3 3 40)

Right marine airlock at world position (5013, 2169). Rooms sampled from (5002, 2219), (5065, 2219), (5116, 2221). Objects pushed eastward when the airlock cycles.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6464 | Custom (Activate Airlock) | Two-stage activation; push direction is eastward |

#### Event 6464 — Activate Airlock

Identical structure to airlock_left with the following differences:

- **Stage 2 push direction**:
  - Non-creatures (`fmly <> 4`): `velo 20, rand -1 1` (east, slight vertical jitter).
  - Creatures (`fmly = 4`): `velo 100, 0` (east fast).
- **Teleport destinations**:
  - Non-creatures: `(5218, 2280)` via `mvto`/`mvsf`.
  - Creatures: `(4860, 2280)` via `mvft`/`mvsf`.
- Plays "tele" sound on successful teleport.

---

## Airlock Behavior Summary

| Airlock | Push (non-creature) | Push (creature) | Non-creature Teleport | Creature Teleport |
|---|---|---|---|---|
| 3 3 38 (left)  | `velo -20, rand` (west) | `velo 100, 0` (east) | (4159, 2268) | (4531, 2293) |
| 3 3 39 (mid)   | `velo ±20, rand` (random) | `velo -100, 0` (west) | (4537, 2176) | (4531, 2293) |
| 3 3 40 (right) | `velo 20, rand` (east) | `velo 100, 0` (east) | (5218, 2280) | (4860, 2280) |

## Stimulus Impact

This script does not issue any `stim writ` stimuli to creatures. Creatures that transit the airlock experience only the velocity push and teleport.

## Room CA Impact

No direct `ca` properties are modified. The airlock's only environmental effect is toggling door permeability and room-link values between the three associated rooms (`ov70`, `ov71`, `ov72`), which alters pathfinding and physical passage but not CA properties like temperature or gas concentration.

---

## Removal Script

The `rscr` section cleanly removes all agents created by this script:
1. Enumerates and kills all `3 3 39` (airlock_mid).
2. Enumerates and kills all `3 3 40` (airlock_right).
3. Enumerates and kills all `3 3 38` (airlock_left).
4. Removes the event scripts `3 3 40 6464`, `3 3 38 6464`, `3 3 39 6464` via `scrx`.
