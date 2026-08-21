# aquamites.cos - Aquamite Lifecycle and Behavior

**Source**: `Assets/Bootstrap/001 World/aquamites.cos`

## Overview

This script defines the complete lifecycle behavior for aquamites (2 13 8) — small floating aquatic organisms that inhabit the salt water areas of the Creatures 3 world. The install section seeds the environment with 2 initial aquamites placed at two marine locations, while the timer script implements their ongoing behavior: drifting through water, obstacle avoidance, water dependency (death if stranded on land), self-replication when population is low, and overcrowding-based population control.

Aquamites are ambient marine life — not directly interactive by creatures or the player (`clac -1`). They serve as prey for angel fish (2 15 14, prey type 1) and as visual atmosphere in the aquatic ecosystem. Additional aquamites can be spawned by the Aquamite Maker (3 8 21) defined in `aquamite_maker.cos`.

The population self-regulates: aquamites reproduce when few neighbors are nearby, and randomly die off when the local density is too high. They are entirely water-dependent — leaving a salt water room (type 9) causes gradually increasing gravity, and staying out of water for 100+ ticks is fatal.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 13 8 | Aquamite | `aquamites` frame 0 | Small floating aquatic organism that drifts, reproduces, and dies based on population density | [Detail](#aquamite-2-13-8) |

---

## Aquamite (2 13 8)

Small ambient aquatic organisms placed in the marine areas of the Ark. They drift passively through salt water rooms with gentle random movements, avoid walls, reproduce when the local population is sparse, and die from overcrowding or being stranded outside water.

### Properties (set at install)

| Property | Value | Notes |
|---|---|---|
| `attr` | 197 | Carryable + Activatable + Wall-bound + Camera-shy (NOT mouse-clickable) |
| `elas` | 50 | Medium bounce |
| `accg` | 0 | No gravity (floating in water) |
| `aero` | 7 | High air resistance — slow, floaty movement |
| `perm` | 75 | Moderate wall permeability |
| `fric` | 99 | Very high friction |
| `clac` | -1 | Not clickable by creatures |
| `tick` | 20 | Timer fires every 20 ticks |

### Key Variables

| Variable | Initial Value | Purpose |
|---|---|---|
| `ov01` | 500 | Health/energy — checked for death (<=0) and reproduction eligibility (>=75). Not decremented by this script; remains static unless modified externally. |
| `ov10` | 0 | Horizontal velocity component (-1=left, 1=right) |
| `ov11` | 0 | Vertical velocity component (-1=up, 1=down) |
| `ov20` | 0 | Tint red component (set by aquamite_maker; offspring from reproduction inherit 0) |
| `ov21` | 0 | Tint green component (set by aquamite_maker; offspring from reproduction inherit 0) |
| `ov22` | 0 | Tint blue component (set by aquamite_maker; offspring from reproduction inherit 0) |
| `ov61` | 10 | Initialized but not referenced by this script |
| `ov86` | 0 | Out-of-water tick counter — death at 100 |
| `ov87` | 0.0 | Accumulated gravity when outside water |
| `ov90` | — | Offspring count for reproduction (set to 1 before calling `repr`) |
| `ov99` | 0 | Death flag — 99 = marked for deferred death (when carried) |

### Initial Placement

The install script seeds 2 aquamites at fixed marine locations:

| Instance | Position | Area |
|---|---|---|
| 1 | (3879, 2192) | Marine terrarium (Norn area water) |
| 2 | (5585, 2299) | Marine terrarium (deeper water section) |

### Animation

Looping swim animation that cycles forward and reverse through all 10 frames:
`[0 1 2 3 4 5 6 7 8 9 8 7 6 5 4 3 2 1 255]`

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior: water check, drift, reproduction, overcrowding death |

#### Event 9 - Timer (Main Behavior Loop)

The timer fires every 20 ticks. All behavior is guarded by `carr = null` — aquamites do nothing while being carried.

**Execution flow each tick:**

1. **Water room check** (`room` subroutine):
   - If NOT in salt water room (type 9): enter a survival loop that gradually increases gravity. The out-of-water counter (`ov86`) increments each iteration, and gravity (`ov87`) increases slowly (+0.03/iteration for the first 6 ticks, +0.08/iteration thereafter). If `ov86` reaches 100, the aquamite dies. This simulates the aquamite struggling and sinking when stranded on land.
   - If in salt water room (type 9): resets `ov86` and `ov87` to 0 (full recovery) and calls the drift subroutine for random movement.
   - Gravity is set to the accumulated `ov87` value.

2. **Deferred death check**: If `ov99 = 99` (death was scheduled while carried), die now.

3. **Energy/population check**:
   - If `ov01 <= 0`: die (energy depleted — though this script never decrements ov01, so this only triggers if modified externally).
   - If `ov01 >= 75` (always true at default 500): run population logic:
     - Count all aquamites (2 13 8) within range 500 (`esee` scan).
     - Double the count (`mulv va33 2`) if any neighbors found.
     - **Low population** (`va33 < 5`, i.e., 0-2 neighbors): reproduce — spawn 1 offspring.
     - **High population** (`va33 > 10`, i.e., 6+ neighbors) AND 50% random chance: overcrowding death — kill self immediately.

### Behavior Subroutines

#### `drft` — Random Drift

Picks one of four random directions each tick:
| Random Value | Effect |
|---|---|
| 1 | `ov11 = -1` (drift up) |
| 2 | `ov11 = 1` (drift down) |
| 3 | `ov10 = -1` (drift left) |
| 4 | `ov10 = 1` (drift right) |

After choosing a direction, calls `obst` (obstacle avoidance) then `move` (apply velocity).

#### `obst` — Obstacle Avoidance

Checks distance to walls in all four directions and reverses velocity components to avoid collisions:

| Direction | Threshold | Response |
|---|---|---|
| Left (`obst 0`) | < 50 px | Set `ov10 = 1` (move right) |
| Right (`obst 1`) | < 50 px | Set `ov10 = -1` (move left) |
| Up (`obst 2`) | < 50 px | Set `ov11 = 1` (move down) |
| Down (`obst 3`) | < 10 px | Set `ov11 = -1` (move up) |

The down threshold is much tighter (10px vs 50px), allowing aquamites to drift close to the bottom before turning upward.

#### `move` — Apply Velocity

Sets velocity to `(ov10, ov11)` via the `velo` command. Since values are -1/0/+1, aquamites move at 1 pixel per tick — a very slow, ambient drift.

#### `repr` — Reproduction

Only runs if not being carried. Creates `ov90` offspring (always 1) at the parent's position:

Each offspring receives:
- Identical properties to the install script (attr 197, elas 50, accg 0, aero 7, perm 75, fric 99, clac -1)
- Same looping swim animation
- Default variable values (ov01=500, ov61=10, ov99=0, ov86=0, ov87=0)
- Copies `va20`/`va21`/`va22` into offspring's ov20/ov21/ov22 — however, these local variables are not set from the parent's values in the timer script, so reproduced aquamites receive tint values of 0 (untinted)
- Tick rate of 1 (starts fast, unlike parent's 20)
- Created atomically with `INST`/`SLOW` to ensure full initialization

#### `room` — Water Dependency Check

Implements a gradual drowning-in-air mechanic:

| Condition | Gravity Increase Rate | Outcome |
|---|---|---|
| In water (rtyp = 9) | Reset to 0 | Normal drift behavior |
| Out of water, 0-6 ticks | +0.03 per tick | Gentle sinking begins |
| Out of water, 7-99 ticks | +0.08 per tick | Accelerating fall |
| Out of water, 100+ ticks | — | Death |

The loop structure means all gravity accumulation happens within a single timer call when the aquamite finds itself outside water, rapidly applying the full gravity ramp.

#### `deth` — Death

| Condition | Action |
|---|---|
| Not being carried | `kill ownr` — immediate destruction |
| Being carried | Set `ov99 = 99` — deferred death, checked next timer tick |

---

## Removal Script (rscr)

Cleanly uninstalls the aquamite system:

1. Kills all aquamite agents (`enum 2 13 8 → kill targ`).
2. Removes the timer script (`scrx 2 13 8 9`).

Note: The Aquamite Maker (3 8 21) is cleaned up separately by the removal script in `aquamite_maker.cos`.

---

## Population Dynamics

Aquamite population is self-regulating through two opposing forces:

```
Low density (0-2 neighbors within 500px)
  → Reproduce (1 offspring per tick)
  → Population grows

High density (6+ neighbors within 500px, 50% chance)
  → Overcrowding death
  → Population shrinks

Medium density (3-5 neighbors)
  → Neither reproduce nor die
  → Population stable
```

The population count uses `esee` (enumerate visible agents) with range 500, which excludes the counting agent itself. The count is doubled before comparison, creating these effective thresholds:

| Neighbor Count | Doubled Value | Outcome |
|---|---|---|
| 0 | 0 | Reproduce (0 < 5) |
| 1 | 4 | Reproduce (4 < 5) |
| 2 | 4 | Reproduce (4 < 5) |
| 3+ with none found | 0 | Reproduce (0 < 5, count stays 0 if no esee targets) |
| 3-5 | 6-10 | Stable (not < 5, not > 10) |
| 6+ | 12+ | 50% chance of death (> 10) |

## Ecological Role

| Interaction | Description |
|---|---|
| **Prey for Angel Fish** | Aquamites (2 13 8) are prey type 1 for angel fish (2 15 14). Angel fish hunt and eat them, gaining 5000 energy per kill. |
| **Spawned by Aquamite Maker** | The Aquamite Maker (3 8 21) produces batches of 7-12 aquamites when activated. |
| **Ambient Marine Life** | Non-interactive visual organisms that populate the marine terrarium. |

## Stimulus Summary

This script does not emit any creature stimuli. Aquamites have no direct biochemical effect on creatures.

## Room CA Effects

This script does not emit or modify any CA (Chemical Atmosphere) values. Aquamites are purely passive environmental agents.

## Water Dependency

| Condition | Behavior |
|---|---|
| In salt water room (type 9) | Normal drift behavior; gravity = 0 |
| Outside water room | Gravity increases gradually (ov87 accumulator); out-of-water counter (ov86) increments |
| Out of water 100+ ticks | Death |

## Dependencies

- **aquamite_maker.cos**: Creates additional aquamites with color tinting via the Aquamite Maker (3 8 21)
- **angel fish.cos**: Angel fish hunt aquamites as prey type 1
- **Sprite**: `aquamites.c16` — 10 frames of swim animation
- **Room system**: Requires salt water rooms (type 9) for survival

## Notes

- Aquamites are **not clickable** (`clac -1`) — they are ambient marine life, not interactive objects for creatures or the player.
- The `ov01` energy variable is initialized to 500 but **never decremented** by this script. The energy depletion check (`ov01 <= 0`) would only trigger if another script modifies the value externally (e.g., an angel fish eating it). In practice, the reproduction check (`ov01 >= 75`) always passes.
- Reproduced aquamites do **not inherit parent color tints**. The `repr` subroutine copies `va20`/`va21`/`va22` to offspring ov20-22, but these local variables are never populated from the parent's ov values. Only aquamites spawned by the Aquamite Maker receive random purple/pink tinting.
- The `room` subroutine uses a `loop`/`untl` construct that processes the entire gravity ramp in a single timer tick, making the transition from "just left water" to "falling with significant gravity" nearly instantaneous rather than gradual over multiple ticks.
- Offspring start with `tick 1` (very fast timer) compared to the parent's `tick 20`, which means newly born aquamites process their first few behavior ticks very quickly before settling into the standard rhythm.
