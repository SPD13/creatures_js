# opal sponge.cos - Opal Sponge Underwater Plant

**Source**: `Assets/Bootstrap/001 World/opal sponge.cos`

## Overview

This script implements the **opal sponge** (classifier `2 4 8`), an underwater sessile plant that lives in water rooms (room type 9). At bootstrap three opal sponges are placed at fixed positions in the marine area: `(5925, 2298)`, `(5521, 2298)` and `(5282, 2298)`. Each sponge progresses through a staged growth cycle -- first a visual pose growth (poses 4 → 8), then a base-swap animation sequence (bases 9 → 49) -- and, once mature, releases drifting **seeds** (classifier `2 3 7`) that float through the water, avoid obstacles and eventually settle to become new opal sponges.

The population is self-regulating:
- A sponge dies if it drifts outside water (`rtyp <> 9`).
- A sponge dies if it lives too long (`ov01 > 700`).
- A sponge dies if it is overcrowded: more than 7 other sponges within 500 px, or 2+ sponges touching it.
- A seed dies if it has been drifting too long (`ov01 > 1500`), if it lands in a crowded area (> 10 existing seeds within 500 px), or if it cannot be placed on valid terrain.
- A mature sponge only seeds occasionally (1/20 random chance per tick at full maturity).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 4 8 | Opal Sponge | `opalsponge` | Sessile underwater plant that grows through visual stages and releases seeds when mature | [Detail](#opal-sponge-2-4-8) |
| 2 3 7 | Opal Sponge Seed | `opalsponge` | Drifting seed released by a mature sponge; settles onto terrain to become a new opal sponge | [Detail](#opal-sponge-seed-2-3-7) |

---

## Opal Sponge (2 4 8)

Sessile underwater plant. Three are spawned at bootstrap in the marine area. Each opal sponge grows through visual stages over ~450 timer ticks, becomes mature (ov05 = 9) and then, while mature, has a random chance each tick to release seeds that drift away and grow into new opal sponges.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Command | `new: simp 2 4 8 "opalsponge" 59 0 4200` | 3 repetitions (`reps 3`) -- different `mvto` per iteration |
| Sprite | `opalsponge` | First image 59, plane 4200 |
| `attr` | 197 | Carryable + Mouseable + Activateable + Suffers Physics |
| `perm` | 100 | Fully permeable (no collision blocking) |
| `elas` | 0 | No elasticity |
| `clac` | -1 | Disable default click action |
| `accg` | 1 | Slight downward gravity |
| `aero` | 5 | Mild aerodynamic drag |
| `fric` | 100 | Max friction |
| `pose` | 4 | Initial seedling pose |
| `tick` | 10 | Timer interval |
| `ov61` | 55 | CA smell range |
| `ov01` | 399 | Age initialised near the start of the mature base-swap phase (so sponges spawn visually mature) |
| `ov05` | 8 | Growth stage -- set to 8 so the base-swap progression picks up immediately |
| Position 1 | `mvto 5925 2298` | First instance |
| Position 2 | `mvto 5521 2298` | Second instance |
| Position 3 | `mvto 5282 2298` | Third instance |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Life / age counter | Increments each tick; thresholds drive pose & base progression; `> 700` triggers death |
| `ov05` | Growth stage | 0 = pose 4 seedling, 1 = pose 5, 2 = pose 6, 3 = pose 7, 4 = pose 8, 5..9 = base-swap anim stages (bases 9, 19, 29, 39, 49), 9 = fully mature (may seed), 10 = post-seed refractory period |
| `ov40` | Post-seed refractory counter | Increments each tick while `ov05 = 10`; on reaching 20, returns `ov05` to 9 |
| `ov61` | CA smell range | 55 |
| `ov99` | Pointer-carry death flag | Set to 99 when carried; triggers `deth` on next tick |
| `va00` | Overcrowding check index | 0 = range-500 scan, 1 = touch scan |
| `va01` | Instance counter (install) | 1..3 -- picks placement coords |
| `va02` / `va03` | Install placement coords | `mvto` target for each of the three instances |
| `va40` | Crowding counter | Count of nearby / touching opal sponges |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main life cycle: age, visual growth, maturity check, crowding check, seeding |

#### Event 9 -- Timer

Runs every 10 ticks. Drives the sponge's life cycle.

1. **Age**: `addv ov01 1`.
2. **Out-of-water death**: if `rtyp room ownr <> 9`, `gsub deth`.
3. **Old-age death**: if `ov01 > 700`, `gsub deth`.
4. **Visual growth (pose phase, stages 0-4)**: staged by `ov01` thresholds. Each threshold sets a new pose and advances `ov05`:
   - `ov01 ≤ 25` and fresh: `pose 4`, `ov05 = 0`
   - `25 < ov01 < 75` and `ov05 = 0`: `pose 5`, `ov05 = 1`
   - `75 ≤ ov01 < 100` and `ov05 = 1`: `pose 6`, `ov05 = 2`
   - `100 ≤ ov01 < 150` and `ov05 = 2`: `pose 7`, `ov05 = 3`
   - `150 ≤ ov01 < 200` and `ov05 = 3`: `pose 8`, `ov05 = 4`
5. **Base-swap growth (anim phase, stages 5-9)**: at further thresholds swap the animation base and advance `ov05`:
   - `200 ≤ ov01 < 250` and `ov05 = 4`: `base 9`, `ov05 = 5`
   - `250 ≤ ov01 < 300` and `ov05 = 5`: `base 19`, `ov05 = 6`
   - `300 ≤ ov01 < 350` and `ov05 = 6`: `base 29`, `ov05 = 7`
   - `350 ≤ ov01 < 400` and `ov05 = 7`: `base 39`, `ov05 = 8`
   - `400 ≤ ov01 < 450` and `ov05 = 8`: `base 49`, `ov05 = 9` (fully mature)
   - `ov01 ≥ 700`: `gsub deth`
6. **Animate while in base-swap phase**: if `ov05 ≥ 5 and ≤ 10`, `gsub anim` to play animation `[0..9 255]` on the current base.
7. **Early-life crowding check**: if `ov05 = 0 or ov05 = 1`, `gsub chek` -- verify the neighbourhood is not already saturated.
8. **Post-seed refractory**: if `ov05 = 10`, increment `ov40`; after 20 ticks, return `ov05 = 9` (mature, eligible to seed again).
9. **Seeding**: if `ov05 = 9`, roll `va00 = rand 1 20`; on `va00 = 10`, `gsub seed` -- release drifting seeds nearby.

### Subroutines

#### `subr chek`
Early-life overcrowding check (runs only when `ov05 = 0` or `1`):
- **Range scan (`rnge 500`, `esee 2 4 8`)**: count nearby opal sponges into `va40`. If `> 7`, `gsub deth`.
- **Touch scan (`etch 2 4 8`)**: count opal sponges physically touching. If `≥ 2`, `gsub deth`.

#### `subr anim`
Plays `anim [0 1 2 3 4 5 6 7 8 9 255]` -- a single 10-frame animation run then stop (`255` = stop) on the current base.

#### `subr seed`
Mature-sponge seeding routine.
1. Compute a nearby placement offset: `va60 = posl - 5`, `va61 = post - 80` (slightly left and well above the sponge).
2. **Seed-population scan (`rnge 500`, `esee 2 3 7`)**: count existing seeds within range 500 into `va50`.
3. **Seed count by crowding (`va51`)**:
   - `va50 ≤ 4`: `va51 = rand 1 3` (release 1-3 seeds)
   - `5 ≤ va50 ≤ 7`: `va51 = rand 1 2` (release 1-2 seeds)
   - `8 ≤ va50`: `va51 = 1` (release 1 seed)
   - `va50 > 10`: `va51 = 0`, `gsub deth`, `stop` (too many seeds -- parent dies)

   (Note: the `>= 8 or <= 10` branch as written always matches the 8+ case before the `> 10` branch is evaluated, so the crowding-death path requires the `va50 > 10` elif to win a strict read -- in practice the first matching branch triggers first.)
4. **Spawn loop (`reps va51`)**: for each seed to release:
   - `inst` (atomic creation block).
   - `new: simp 2 3 7 "opalsponge" 4 0 500` -- plane 500, first image 4.
   - Physics: `attr 199`, `bhvr 32`, `accg 0`, `aero 0`, `perm 100`, `elas 0`, `fric 100`.
   - `puhl -1 15 85` -- set pickup handle.
   - `tmvt` check: if the computed spot (`va60`, `va61`) is a valid location, `mvto` it; otherwise `targ va16` (back to the seed), `kill targ`, `stop`.
   - Initial drift: `velo rand -1 1 -1` (small leftward/random horizontal, slight upward).
   - Seed state: `ov00 = 0` (drifting), `ov61 = 20`, `ov01 = 0`, `tick 3`, `slow`.
5. After the spawn loop, `targ ownr` back to the parent and set `ov05 = 10` (post-seed refractory).

#### `subr deth`
Staged death animation, depending on current growth stage:
- Only if `carr = null` (not carried):
  - `ov05 = 0`: `base 0`, `frat 3`, `anim [4]` (early seedling).
  - `ov05 = 1`: `base 0`, `frat 3`, `anim [5 4]`.
  - `ov05 = 9 or 10` (mature): `base 0`, `frat 5`, `anim [49 39 29 19 9 8 7 6 5 4]` -- visually collapse through all growth stages in reverse.
  - Then `over` (wait for animation to finish) and `kill targ`.
- If `carr <> null` (carried): set `ov99 = 99` so the death sequence runs on the next tick once dropped.

### Sounds

No sound is emitted by the opal sponge plant itself.

### Stimulus / Room CA Impact

The opal sponge does not write stimuli onto creatures and does not modify Room CA values directly. Its ecological role is:
- **Underwater plant population**: provides a self-sustaining population of marine plants in water rooms, bounded by spatial crowding (max ~7 in range 500 before auto-death).
- **Dispersal via seeds**: mature sponges periodically emit drifting seeds (classifier `2 3 7`) that are themselves subject to separate drift, crowding and placement checks (see below).
- **Water-dependent**: immediate death outside a water room (room type 9) confines the species to marine areas.

---

## Opal Sponge Seed (2 3 7)

Drifting seed released by a mature opal sponge. A seed has two phases controlled by `ov00`:
- **Phase 0 (drifting, `ov00 = 0`)**: floats through the water with random direction changes, obstacle avoidance, and stays roughly buoyant. After ~1000-1500 ticks, gravity is enabled and the seed is allowed to settle.
- **Phase 1 (grown, `ov00 = 1`)**: as soon as the seed lands (set via the obstacle subroutine) and is not being carried, it germinates into a new opal sponge (classifier `2 4 8`) at its landing spot, then self-destructs.

### Spawn Configuration (inherited from parent `subr seed`)

| Property | Value |
|---|---|
| Command | `new: simp 2 3 7 "opalsponge" 4 0 500` |
| `attr` | 199 |
| `bhvr` | 32 |
| `accg` | 0 (initially weightless) |
| `aero` | 0 |
| `perm` | 100 |
| `elas` | 0 |
| `fric` | 100 |
| `puhl` | `-1 15 85` (pickup handle) |
| `tick` | 3 |
| `velo` | `rand -1 1 -1` (slight upward drift) |
| `ov00` | 0 (drifting phase) |
| `ov01` | 0 (life counter) |
| `ov61` | 20 (CA smell range) |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Phase | 0 = drifting, 1 = landed/ready to germinate |
| `ov01` | Age counter | +2 per tick while drifting; `> 1500` = death; `> 1000` triggers settling (enables gravity) |
| `ov10` | Horizontal velocity | `rand -2 2`, non-zero |
| `ov11` | Vertical velocity | `rand -1 1` or `rand -1 2` depending on floor distance, non-zero |
| `ov61` | CA smell range | 20 |
| `ov86` | Out-of-water tick counter | Increments in `subr room` while outside water |
| `ov87` | Dynamic gravity | Built up in `subr room` while outside water; applied via `accg` |
| `ov99` | Pointer-carry death flag | Set to 99 when picked up; triggers `deth` on next tick |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Drift, obstacle avoidance, settling, and germination |

#### Event 9 -- Timer

Every 3 ticks.

**If `ov00 = 0` (drifting):**
1. `gsub room` -- out-of-water gravity build-up (same pattern as adult: `+0.03` for first 6 ticks, `+0.08` thereafter up to 200). Once counter reaches 200, waits `rand 100 400` and calls `deth`. In water, resets counters.
2. `addv ov01 2` -- age faster than the parent.
3. If `ov99 = 99` (picked up), `gsub deth`.
4. If `ov01 > 1500`, `gsub deth` (timeout).
5. If `1000 < ov01 < 1500`: enable gravity (`accg .05`), `wait 75`, then set `ov00 = 1` (ready to germinate once landed).
6. `gsub anim`, `gsub rndm`, `gsub obst`, `gsub move` -- drift with random direction and obstacle avoidance.

**If `ov00 = 1` and not carried:**
- `gsub grow` -- germinate into a new opal sponge at the seed's position.

#### Subroutines

##### `subr deth`
- `carr = null`: `kill targ` immediately.
- `carr <> null`: set `ov99 = 99` (defer death until dropped).

##### `subr grow`
Germinate into a new opal sponge:
1. Save current position: `va00 = posl`, `va01 = post`.
2. `inst`, then `new: simp 2 4 8 "opalsponge" 59 0 4200` with full fresh adult configuration: `attr 197`, `perm 100`, `elas 20`, `clac -1`, `accg 1`, `aero 5`, `fric 100`, `pose 4`, fresh `ov01 = 0`, `ov05 = 0`, `ov61 = 55`, `tick 10`, `slow`.
3. Validate the spawn position with `tmvt`: if valid, `mvto`; otherwise, back to the seed (`targ va16`) and `kill targ` / `stop`.
4. `targ ownr` (back to the seed) and `gsub deth` -- seed self-destructs after spawning its plant.

##### `subr rndm`
Random direction roll, biased by floor distance:
- Horizontal: loop `ov10 = rand -2 2` until non-zero.
- Vertical:
  - If `obst down < 500`: `ov11 = rand -1 1` non-zero (mostly horizontal drift near the floor).
  - Else (`obst down >= 500`): `ov11 = rand -1 2` non-zero (can drift further down when high up).

##### `subr anim`
Plays `anim [0 1 2 3 255]` -- a 4-frame drift animation then stop.

##### `subr obst`
Obstacle avoidance / settling:
- `obst down < 20` and `obst _up_ > 200`: landed on the sea floor with headroom -- set `accg 3`, `ov00 = 1` (ready to germinate), `wait 10`, `stop` (exits this timer tick; germination happens next tick via the `ov00 = 1` branch in the main event).
- `obst down < 20` and `obst _up_ ≤ 20`: ceiling directly above -- push downward (`ov11 = -1`).
- `obst left < 50`: push right (`ov10 = rand 1 2`).
- `obst rght < 50`: push left (`ov10 = rand -2 -1`).
- `obst _up_ < 20`: push down (`ov11 = 1`).

##### `subr room`
Out-of-water handling (same two-phase gravity build-up as the adult sponge): while outside water, increments `ov86` and builds `ov87`; once `ov86 ≥ 200`, waits then calls `deth`. In water, resets.

##### `subr move`
`velo ov10 ov11` -- apply the computed drift velocity.

### Stimulus / Room CA Impact

Seeds do not write stimuli and do not modify Room CA. Their ecological role is purely dispersal:
- **Drift then settle**: the seed floats upward and sideways through the water, bouncing off walls and ceilings, and eventually sinks once aged past 1000 ticks.
- **Germination gate**: only grows into a new opal sponge if it successfully lands on valid terrain (`obst down < 20` with enough vertical headroom) and is not being carried.
- **Water-dependent**: dies if outside water for too long (matches parent).

---

## Remove Script (rscr)

1. Enumerates all `2 4 8` opal sponges and kills them (`kill targ`).
2. Enumerates all `2 3 7` seeds and kills them (`kill targ`).
3. Removes the timer event scripts: `scrx 2 4 8 9` and `scrx 2 3 7 9`.
