# orange sponge.cos - Orange Sponge Ecosystem

**Source**: `Assets/Bootstrap/001 World/orange sponge.cos`

## Overview

This script installs an underwater orange sponge ecosystem in the ocean biome of the Ark. Three adult orange sponge plants are placed at fixed locations on the ocean floor. Each adult sponge grows through a series of visual poses (from a small bud to a fully branched, animated sponge), and once mature it periodically spawns floating seeds that drift upwards through the water. Seeds navigate randomly until they land on a suitable ocean floor, at which point they transform into a new adult sponge, keeping the population self-sustaining.

The ecosystem is gated by room type 9 (the ocean/underwater room type): sponges that find themselves outside an ocean room die off, and seeds that drift into non-ocean rooms are slowly dragged down by increasing gravity until they die. Seeds also perform population control — if too many adult sponges already exist within detection range, the germinating seed simply dies instead of sprouting. Adults self-thin the same way: an adult that senses more than 7 siblings nearby (or 2+ currently carried) will die.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 4 7 | Orange Sponge (adult) | `oraponge` frames 4-58 | Stationary underwater plant that grows through visual stages and periodically releases floating seeds | [Detail](#orange-sponge-adult-2-4-7) |
| 2 3 6 | Orange Sponge Seed | `oraponge` frames 0-3 | Floating seedling that drifts underwater and germinates into a new adult sponge on the ocean floor | [Detail](#orange-sponge-seed-2-3-6) |

---

## Orange Sponge (adult) (2 4 7)

The adult orange sponge is a stationary, carryable underwater plant placed on the ocean floor. Three are created at bootstrap at hardcoded positions. Each sponge tracks its age (`ov01`) and its growth stage (`ov05`), visually progressing from a small bud (pose 4) through several intermediate poses, and finally into a fully animated branched sponge that cycles through frames 4-9 on bases 9/19/29/39/49. Once fully grown, it periodically attempts to seed, creating floating seedlings nearby. Sponges die if they drift out of the ocean, exceed max age, are over-populated, or are picked up in groups.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 197 | Carryable + Mouseable + Suffers Collisions + Camera Shy |
| `perm` | 100 | Fully permeable (water) |
| `elas` | 0 | No bounce |
| `accg` | 1 | Very light gravity (settles on floor) |
| `aero` | 5 | Light drag |
| `fric` | 100 | Maximum friction |
| `clac` | -1 | No activation click script |
| `pose` | 4 | Initial pose (small bud) |
| `ov01` | age counter (0 → 700) | Dies when > 700 |
| `ov05` | growth stage (0 → 10) | Drives pose/base progression |
| `ov61` | 50 | CA smell emission intensity |
| `tick` | 10 | Main update period |

### Initial Placement

| Index | Position (x, y) | Notes |
|---|---|---|
| 1 | (3565, 2108) | Ocean floor |
| 2 | (3955, 2368) | Ocean floor |
| 3 | (4270, 2225) | Ocean floor |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth progression, animation, population check, and seeding |

#### Event 9 — Timer (Growth, Survival, Seeding)

Fires every 10 ticks. The handler is driven by an age counter `ov01` and a growth-stage counter `ov05`:

1. **Age increment**: `ov01 += 1` each tick.
2. **Environment check**: If the current room type is not 9 (ocean), call `deth` — sponges only survive underwater.
3. **Max age**: If `ov01 > 700`, call `deth`.
4. **Growth progression** (based on `ov01`):
   - `0-25`: pose 4, stage 0
   - `26-74`: pose 5, stage 1
   - `75-99`: pose 6, stage 2
   - `100-149`: pose 7, stage 3
   - `150-199`: pose 8, stage 4
   - `200-249`: base 9, stage 5
   - `250-299`: base 19, stage 6
   - `300-349`: base 29, stage 7
   - `350-399`: base 39, stage 8
   - `400-449`: base 49, stage 9 (fully mature)
   - `≥ 700`: calls `deth`
5. **Animation**: For stages 5-10, calls `anim` subroutine which plays `[0 1 2 3 4 5 6 7 8 9 255]` (loops back to 0) — gives mature sponges a gently swaying/pulsing look.
6. **Population check** (`chek` subroutine, run during early stages 0-1):
   - Counts adult sponges within range 500: if more than 7 nearby, die.
   - Counts currently-carried adult sponges: if 2 or more, die.
   - Enforces natural thinning of clustered sponges.
7. **Seeding cooldown** (stage 10): `ov40` increments each tick; after 20 ticks at stage 10, reverts `ov05` back to 9, allowing another seeding attempt.
8. **Seeding attempt** (stage 9): Each tick, a random roll `rand 1 30` triggers the `seed` subroutine with ~1/30 probability.

#### Subroutine: `seed` (reproduction)

1. Records seed origin offset from the sponge (`posl+2`, `post-58` — slightly above/left of the sponge).
2. Counts adult sponges within 500 range via `esee 2 3 6` (note: enumerating seed classifier as a population metric of nearby seed children):
   - `≤ 4`: creates `rand 1 3` seeds
   - `5-7`: creates `rand 1 2` seeds
   - `8-10`: creates 1 seed
   - `> 10`: creates no seed, and the parent sponge dies (overcrowded)
3. For each new seed, creates a seed agent (2 3 6) with:
   - `attr 199`, `bhvr 32` (push-only), `accg 0`, `aero 0`, `perm 100`, `elas 0`, `fric 100`
   - `puhl -1 7 67` (pickup handle)
   - Placed at the origin offset via `mvto`; if placement fails (`tmvt = 0`), the seed is killed and the subroutine stops.
   - Initial velocity `velo rand -1 1 -1` (slight leftward/rightward drift with upward component — seeds float up underwater).
   - `ov61 20`, `tick 3` (fast update), `slow` (performance hint).
4. Sets parent's `ov05 = 10` (enters seeding cooldown).

#### Subroutine: `deth` (death)

- If not being carried:
  - Plays a stage-appropriate death animation:
    - Stage 0: `base 0`, `frat 3`, `anim [4]`
    - Stage 1: `base 0`, `frat 3`, `anim [5 4]`
    - Stage 9-10: `base 0`, `frat 5`, `anim [49 39 29 19 9 8 7 6 5 4]` (full de-growth)
  - Releases any held agent (`over`) and kills itself.
- If carried: sets `ov99 = 99` (flagged for delayed death; actual kill handled by holder).

---

## Orange Sponge Seed (2 3 6)

The seed is a small floating agent produced by an adult sponge. Seeds drift underwater with randomized velocity, perform obstacle avoidance, and attempt to land on the ocean floor. Once landed (or after a safe fall), the seed germinates into a new adult orange sponge at its final position. Seeds that drift out of the ocean are slowly dragged down by increasing gravity until they die. Seeds live at most 1500 ticks.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable + Mouseable + Activatable 1 + Suffers Collisions + Camera Shy |
| `bhvr` | 32 | Creatures can Pick Up only |
| `accg` | 0 | No gravity in water (overridden when outside ocean) |
| `aero` | 0 | No drag |
| `perm` | 100 | Fully permeable |
| `elas` | 0 | No bounce |
| `fric` | 100 | Max friction |
| `ov00` | 0 = flying, 1 = landed | State flag |
| `ov01` | age counter (0 → 1500) | Max lifetime |
| `ov61` | 20 | CA smell emission |
| `tick` | 3 | Fast update period |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Movement, obstacle avoidance, descent trigger, germination |

#### Event 9 — Timer (Flight & Germination)

The handler has two branches driven by `ov00`:

**Flying phase (`ov00 = 0`)**:

1. **Room check** (`room` subroutine): If the seed is outside room type 9 (ocean):
   - Incrementally builds up an "out of water" counter `ov86` and applies increasing gravity (`ov87` += 0.03 for the first 6 ticks, then += 0.08 per tick).
   - Loops until the seed re-enters ocean or `ov86 ≥ 200`.
   - If `ov86 ≥ 200` (too long outside the ocean), waits `rand 100 400` then calls `deth`.
   - Back in ocean: resets counters and gravity to 0.
2. **Age increment**: `ov01 += 1`.
3. **Carry-triggered death**: If `ov99 = 99` (flagged by being carried/killed by parent), call `deth`.
4. **Max age**: If `ov01 > 1500`, call `deth`.
5. **Descent trigger**: If `1000 < ov01 < 1500`: sets `accg = 0.05`, waits 75 ticks, then sets `ov00 = 1` (switches to landed/grow phase).
6. **Animation**: plays `anim [0 1 2 3 255]` (looping flutter).
7. **Random drift** (`rndm` subroutine):
   - `ov10` (x velocity): `rand -2 2` (non-zero).
   - `ov11` (y velocity): `rand -1 1` normally, but `rand -1 2` when far from the floor (`obst down >= 500`) — seeds far from the floor tend to drift down slightly, while those near the floor drift more freely.
8. **Obstacle avoidance** (`obst` subroutine):
   - Floor very close (`obst down < 20`) and ceiling far (`obst _up_ > 200`): applies hard gravity (`accg 3`), sets `ov00 = 1` (land), waits 10 ticks and stops — seed commits to landing.
   - Floor close but ceiling also close: forces upward velocity (`ov11 = -1`).
   - Wall on left (`obst left < 50`): forces rightward velocity (`ov10 = rand 1 2`).
   - Wall on right (`obst rght < 50`): forces leftward velocity (`ov10 = rand -2 -1`).
   - Ceiling close (`obst _up_ < 20`): forces downward velocity (`ov11 = 1`).
9. **Apply movement** (`move` subroutine): `velo ov10 ov11`.

**Germination phase (`ov00 = 1` and not carried)**: Calls `grow` subroutine.

#### Subroutine: `grow` (germination)

1. Records current position (`posl`, `post`).
2. Creates a new adult orange sponge (2 4 7) at that position with standard adult properties (`attr 197`, `perm 100`, `elas 20`, `clac -1`, `accg 1`, `aero 5`, `fric 100`, `pose 4`, `ov01 0`, `ov05 0`, `ov61 50`, `tick 10`).
3. If `mvto` fails, the new sponge is killed and the subroutine stops.
4. Calls `deth` on the seed (destroys it).

#### Subroutine: `deth` (seed death)

- If not carried: `kill targ`.
- If carried: sets `ov99 = 99` for delayed death handling.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the orange sponge ecosystem:

1. Enumerates and kills all orange sponge adults (`enum 2 4 7`).
2. Enumerates and kills all orange sponge seeds (`enum 2 3 6`).
3. Removes timer scripts (`scrx 2 4 7 9`, `scrx 2 3 6 9`).

---

## Ecosystem Diagram

```
                ┌─────────────────────────┐
                │   Orange Sponge (adult) │
                │   (2 4 7)               │
                │                         │
                │ Grows through poses/    │
                │ bases over ~450 ticks   │
                │ Requires room type 9    │
                └────────────┬────────────┘
                             │
                  Mature (stage 9)
                  ~1/30 chance per tick
                             │
                             ▼
                ┌─────────────────────────┐
                │   Orange Sponge Seed    │
                │   (2 3 6)               │
                │                         │
                │ Floats up with random   │
                │ velocity, obstacle      │
                │ avoidance, dies after   │
                │ 1500 ticks or outside   │
                │ the ocean               │
                └────────────┬────────────┘
                             │
               Lands (floor detected or aged past 1000)
                             │
                             ▼
                    New Orange Sponge
                    (2 4 7) at landing pos
                    Cycle continues
```

## Environmental Requirements

Orange sponges are strictly underwater organisms:

| Condition | Requirement | Behavior if failed |
|---|---|---|
| Room type | 9 (ocean) | Adults die immediately; seeds accumulate gravity and eventually die |
| Population density (adults) | ≤ 7 within range 500 | Excess adults die (natural thinning) |
| Carried count | < 2 simultaneous | If 2+ adults carried, young adults die |
| Seed density at spawn time | ≤ 10 | Over-density → parent sponge dies instead of seeding |

## Stimulus and Chemical Effects

This script does not emit stimuli or inject chemicals into creatures. It is a passive underwater plant ecosystem, carryable by creatures but without direct biochemical consequences on consumption.

## Room CA Effects

This script does not alter room CA values. The sponges rely on room type 9 (ocean) as a hard gate but do not enrich or deplete environmental CAs.
