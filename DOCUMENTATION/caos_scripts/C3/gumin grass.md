# gumin grass.cos - Gumin Grass Aquatic Ecosystem

**Source**: `Assets/Bootstrap/001 World/gumin grass.cos`

## Overview

This script implements the gumin grass ecosystem, an aquatic plant system for the Creatures 3 ocean/water areas. Seven gumin grass plants are created at fixed positions in the aquatic regions of the world. Each plant grows through four visual stages before reaching maturity, at which point it can produce gumin seeds. Seeds drift to nearby positions and grow into new plants if conditions allow. The gumin grass is restricted to salt water rooms (room type 9) — seeds that find themselves outside water rooms experience increasing gravity and eventually die.

The ecosystem is self-regulating through density checks: before a seed germinates, it scans for nearby opal sponges (2 4 8), orange sponges (2 4 7), and other gumin grass plants (2 4 10). If density is too high, germination is suppressed. Mature seeds that successfully germinate create a new gumin grass plant at their location before dying. The gumin grass lifecycle is driven entirely by a countdown timer (ov01) that decreases each tick, with different growth and seeding behaviors triggered at specific countdown thresholds.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 4 10 | Gumin Grass Plant | `gumin` frames 0–94 (5 stages of 19 frames) | Aquatic grass that grows through visual stages, matures, seeds, and dies | [Detail](#gumin-grass-plant-2-4-10) |
| 2 3 8 | Gumin Seed | `gumin` frames 0–8, plane 4201 | Seed produced by mature gumin grass; drifts and germinates in salt water rooms | [Detail](#gumin-seed-2-3-8) |

---

## Gumin Grass Plant (2 4 10)

An aquatic grass plant that grows in salt water rooms. The plant progresses through four visual growth stages controlled by a countdown timer (ov01). When the plant matures (ov01 drops to the 110–50 range), it produces seeds up to three times before entering a death animation and being destroyed. The entire lifecycle is driven by the ov01 countdown, with visual base frames advancing at specific thresholds.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 197 | Carryable (1) + Mouseable (4) + Physics (64) + Suffers Collisions (128) |
| `perm` | 100 | Fully permeable |
| `elas` | 20 | Slight bounce |
| `clac` | -1 | Not clickable by creatures |
| `accg` | 1 | Gravity enabled |
| `aero` | 5 | Moderate air resistance |
| `fric` | 100 | Maximum friction |
| Sprite | `"gumin"` | 95 images, plane 4200 |
| Instances | 7 | Number of plants created at bootstrap |

### Key OV Variables

| Variable | Initial | Purpose |
|---|---|---|
| ov01 | 150 | Lifecycle countdown timer — decreases by 1 each tick |
| ov30 | 0 | Animation base frame offset (advances through stages: 0, 19, 38, 57, 76) |
| ov61 | 50 | (Unused threshold, set at creation) |
| ov90 | 3 | Growth stage: 1=stage 1, 2=stage 2, 3=stage 3, 4=stage 4, 5=not used here |
| ov91 | 0 | Seeding lock flag (1 = currently seeding, reset after wait) |
| ov92 | 0 | Seed production count (max 3 seedings before lock) |

### Initial Placement

Seven plants are created at fixed positions in the aquatic areas:

| Instance | X | Y |
|---|---|---|
| 1 | 4035 | 2347 |
| 2 | 3821 | 2398 |
| 3 | 3716 | 2341 |
| 4 | 3619 | 2242 |
| 5 | 5893 | 2281 |
| 6 | 5631 | 2281 |
| 7 | 5290 | 2281 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth cycle, stage transitions, seed production, and death |

#### Event 9 — Timer (Lifecycle)

The main lifecycle tick. Fires every tick (tick 1). Decrements ov01 by 1 each call, then checks thresholds:

1. **Stage 1 transition (ov01 230–221, ov90 becomes 1)**: Sets growth stage to 1, base frame offset to 0. Plays the 19-frame growth animation with random waits.

2. **Stage 2 transition (ov01 220–201, ov90 = 1 → 2)**: Sets growth stage to 2, base frame offset to 19. Plays animation with random waits (30–60 ticks).

3. **Stage 3 transition (ov01 200–171, ov90 = 2 → 3)**: Sets growth stage to 3, base frame offset to 38. Plays animation with random waits (30–60 ticks).

4. **Stage 4 transition (ov01 170–121, ov90 = 3 → 4)**: Sets growth stage to 4, base frame offset to 57. Plays animation with random waits (30–60 ticks).

5. **Mature / Seeding phase (ov01 110–50, ov90 = 4)**: Sets base frame offset to 76. Plays animation, then attempts seed production:
   - If ov91 (seeding lock) is not set, calls the `seed` subroutine.
   - Seeds are produced with random waits (10–60 ticks) between attempts.

6. **Death (ov01 <= -50)**: Plays a reverse wilting animation from base 0 (frames 76, 57, 38, 19, 0 repeated), waits for it to complete, then kills itself.

##### Seed Subroutine

The `seed` subroutine handles seed production:

1. Sets ov91 = 1 (seeding lock).
2. Calculates a spawn area near the plant's position (left side + 4 to +9 pixels, top side - 20 to -50 pixels).
3. **Density check**: Scans range 500 for nearby gumin seeds (2 3 8) and gumin grass (2 4 10), counting total nearby plants (va50).
4. **Seed count decision** based on density:
   - 0–5 nearby: produces 2 seeds
   - 6–11 nearby: produces 1–2 seeds (random)
   - 12+: produces 0 seeds (effectively suppressed, though code has a dead branch that would kill the plant)
5. Creates gumin seeds (2 3 8) at random positions within the spawn area.
6. If the target position is invalid (tmvt check fails), the seed is killed and the parent plant dies.
7. Increments ov92 (seed production count). After waiting 100–300 ticks, resets ov91 to 0 if ov92 <= 2 (allowing up to 3 seeding cycles).

##### Animation Subroutine

Plays a 19-frame animation at the current base frame offset (ov30) with frame rate 3, using wait for random 1–5 ticks between calls.

---

## Gumin Seed (2 3 8)

A seed produced by mature gumin grass plants. Seeds are placed near the parent plant and grow through a sequence of visual poses before becoming mobile. Once mobile (stage 5), seeds drift around the aquatic environment with random velocity, checking for suitable germination spots. Seeds are restricted to salt water rooms (room type 9) — outside water, they experience increasing gravity and die. Seeds can be picked up by creatures.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 197 | Carryable (1) + Mouseable (4) + Physics (64) + Suffers Collisions (128) |
| `bhvr` | 32 | Creatures can Pick Up |
| `elas` | 20 | Slight bounce |
| `perm` | 99 | Nearly fully permeable |
| `accg` | 0 | No gravity initially (aquatic) |
| `aero` | 0 | No air resistance initially (aquatic) |
| `fric` | 100 | Maximum friction |
| `clac` | -1 | Not clickable by creatures |
| `puhl` | -1 15 60 | Pickup point at (-1, 15, 60) |
| Sprite | `"gumin"` | 9 frames, plane 4201 |

### Key OV Variables

| Variable | Initial | Purpose |
|---|---|---|
| ov01 | 230 | Lifecycle countdown timer — decreases by 1 each tick |
| ov10 | 0 | Horizontal velocity component (set by rndm subroutine) |
| ov11 | 0 | Vertical velocity component (set by rndm subroutine) |
| ov61 | 15 | (Unused threshold, set at creation) |
| ov86 | 0 | Out-of-water tick counter (increases when not in room type 9) |
| ov87 | 0 | Accumulated gravity value (increases when out of water) |
| ov90 | 0 | Growth/movement stage: 0–4 = sprouting poses, 5 = mobile |
| ov98 | 0 | (Set to 0 in grow subroutine) |
| ov99 | 0/99 | Death flag (99 = pending death when dropped) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth stages, movement, obstacle avoidance, germination check |
| 4 | Pickup (start) | No behavior (empty script) |
| 5 | Drop | Sets stage to 5 (mobile) immediately |

#### Event 9 — Timer (Lifecycle)

Fires every 2–5 ticks (random at creation). Decrements ov01 by 1, then checks lifecycle stage:

1. **Death check (ov01 <= 0)**: Calls `deth` subroutine — if not carried, kills the seed; if carried, sets ov99 = 99 for deferred death.

2. **Room type check** (`room` subroutine): If the seed is not in a salt water room (rtyp != 9), gradually increases gravity (ov87) to sink the seed. After 200 ticks outside water, the seed dies. Resets gravity to 0 when back in water.

3. **Sprouting stages (ov90 = 0 to 4)**: Advances through poses 1–5 with random waits (40–60 ticks) between each stage. At stage 4, pose 5, the seed becomes fully mobile (attr changes to 199, adding activatable).

4. **Mobile stage (ov90 = 5)**: The seed drifts around with random velocity:
   - Plays a 4-frame walking animation (base 5, frames 0–3).
   - Generates random movement direction (`rndm` subroutine).
   - Checks for obstacles (`obst` subroutine) and adjusts direction.
   - Applies velocity (`move` subroutine: `velo ov10 ov11`).
   - **Germination check (ov01 <= 300)**: If close to ground (obstruction down < 30), far from ceiling (up > 225), and not too close to walls (right > 20, left > 20):
     - Scans for nearby opal sponges (2 4 8), gumin grass (2 4 10), and orange sponges (2 4 7).
     - If none found AND in a salt water room (rtyp = 9) AND not carried: calls `grow` to germinate.

5. **Deferred death check**: If ov99 = 99 (set while carried), kills the seed.

##### Grow Subroutine

Creates a new gumin grass plant (2 4 10) at the seed's position with full default parameters (ov01 = 230, tick 3). If the seed is not carried, it kills itself. If carried, it defers death via the `deth` subroutine.

##### Room Subroutine

Enforces salt water room restriction:
- Outside room type 9: increments ov86 counter and gradually increases gravity (ov87) — slowly at first (+0.03 for first 6 ticks), then faster (+0.08).
- After 200 ticks outside water: dies.
- Back in room type 9: resets ov86 and ov87 to 0, restoring weightlessness.

##### Random Movement Subroutine (rndm)

Generates random horizontal velocity (ov10: -2 to 2, never 0) and vertical velocity (ov11: -1 to 1 near ground, -1 to 2 when high up, never 0).

##### Obstacle Avoidance Subroutine (obst)

Adjusts velocity direction based on proximity to obstacles:
- Close to left wall (< 50 pixels): force rightward movement.
- Close to right wall (< 50 pixels): force leftward movement.
- Close to ceiling (< 20 pixels): force downward movement.

---

## Remove Script

The removal script (`rscr`) cleans up all gumin grass ecosystem agents:
1. Kills all Gumin Grass Plants (2 4 10).
2. Kills all Gumin Seeds (2 3 8).
3. Removes the timer scripts for both classifiers (`scrx 2 3 8 9` and `scrx 2 4 10 9`).
