# neon fish.cos - Neon Fish Ecosystem

**Source**: `Assets/Bootstrap/001 World/neon fish.cos`

## Overview

This script installs the behavior scripts for the **neon fish** aquatic food-chain: fish eggs (classifier `2 18 17`), adult neon fish (`2 15 19`), and dead fish (`2 10 42`). It does **not** create any agents at install time -- the eggs themselves are placed into the world by other bootstrap scripts (e.g. `aquatic_launcher` and `fixed position fish egg launcher`). Those egg agents carry this script file's behaviors, which drive the egg->adult->corpse lifecycle.

High level behaviors installed:

- **Fish egg (`2 18 17`)** timer drifts the egg around the water, avoids obstacles, hatches into an adult fish when conditions are right, and handles death (drowning out of water). When hatched, it spawns the adult `simp 2 15 19 "neon"` agent at its position and kills itself.
- **Adult neon fish (`2 15 19`)** timer is the main AI: it grows through 4 size/life stages based on its age counter `ov01`, flocks with other neon fish, hunts smaller prey, eats plants/prey, mates when adult, lays eggs (spawning more `2 18 17` eggs), drowns if out of water, and dies of old age or starvation. On death it spawns a `dead_fish` corpse agent (`2 10 42`) with a death animation matched to its stage.
- **Dead fish (`2 10 42`)** timer plays a 3- or 4-frame sinking/floating decay animation and self-destructs.

The three populations self-sustain through a full reproductive loop: eggs hatch into fish, fish flock and hunt, mated pairs produce new eggs in the water, eggs hatch, and so on. When the population density is too high (>16 adult fish plus eggs within range 500 during laying), new eggs are suppressed.

Stimulus 80 intensity 1 ("writ") is emitted from both the egg and the adult fish when eaten (event 12) -- this is the "food eaten" feedback stimulus.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 18 17 | Neon Fish Egg | `neon` frame 188 (from launcher) / 4 (laid) | Drifts in water; hatches into an adult neon fish | [Detail](#neon-fish-egg-2-18-17) |
| 2 15 19 | Adult Neon Fish | `neon` (various bases by stage) | Aquatic creature with flock/hunt/mate/age/die AI | [Detail](#adult-neon-fish-2-15-19) |
| 2 10 42 | Dead Fish | `dead_fish` (various bases by stage/direction) | Short-lived corpse that sinks/floats and decays | [Detail](#dead-fish-2-10-42) |

---

## Neon Fish Egg (2 18 17)

A small floating egg placed in the water by launcher agents. It drifts randomly, bumps off walls, and hatches into an adult neon fish after an incubation timer. If it ends up outside a water room (room type != 9) it slowly accumulates air pressure (`ov87`) that eventually kills it. Carrying the egg triggers a delayed death (`ov99 = 5`).

### Key Variables

| Variable | Purpose |
|---|---|
| `ov10`, `ov11` | Drift direction components (-1/0/1) |
| `ov60` | Randomised incubation time (15000-20000 ticks), set once |
| `ov66` | Forced-hatch flag (66 = hatch immediately) |
| `ov67` | Hatching-in-progress flag |
| `ov80` | Egg state (0 = drifting, 1 = ready to hatch / sinking) |
| `ov86` | Out-of-water tick counter (drowning) |
| `ov87` | Accumulated gravity (increases while out of water) |
| `ov99` | Death request flag (5 = carried-death pending) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main drift/hatch/death AI |
| 12 | Eat | Eaten by a creature -- emit stimulus 80, self-destruct |

#### Event 9 -- Timer

1. `gsub room` -- handles out-of-water punishment (see below).
2. If `ov66 = 66` -> force immediate hatch (`gsub htch`).
3. If `ov80 = 0` -> drift (`gsub drft`). If `ov80 = 1` -> hatch (`gsub htch`).
4. If `ov99 = 5` -> run death (`gsub deth`).

#### Subroutine `drft`
Randomises direction (`ov10`/`ov11`) with low probability (~1/10 each axis), then runs `obst`, `anim`, `move`. Drift is a slow random walk.

#### Subroutine `obst`
Obstacle reflection:
- `obst 0` (left) < 50 -> push right (`ov10 = 1`).
- `obst 1` (right) < 50 -> push left (`ov10 = -1`).
- `obst 2` (up) < 50 -> push down (`ov11 = 1`).
- `obst 3` (down) < 20 -> `accg 5` (heavy gravity) and set `ov80 = 1` (ready to hatch / sink).

#### Subroutine `anim`
Plays one of three wiggle animations (frames 0-3) randomly each tick.

#### Subroutine `move`
`velo ov10 ov11` -- applies current drift velocity.

#### Subroutine `room`
If the egg is **not** in a water room (`rtyp room ownr <> 9`):
- Sets elasticity 50 and loops each tick incrementing `ov86` and building `ov87` (+0.03 per tick up to tick 6, then +0.08 per tick) until back in water or `ov86 >= 100` (drown threshold).
- If `ov86 >= 100`: `gsub deth` (death by drowning/air-exposure).

If the egg **is** in a water room (`rtyp = 9`): resets `ov86 = 0`, `ov87 = 1`, elasticity 0. Always calls `accg ov87` to apply current gravity.

#### Subroutine `deth`
If not carried: `kill ownr`.
If carried: `setv ov99 5` -- defers the kill to the next non-carried tick.

#### Subroutine `htch`
Waits a randomised time (`wait ov60`, 15000-20000 ticks) if not already hatching, then for 25 iterations applies a random upward jitter velocity (`velo rand -3 3 rand -1 -5`) with wiggle animations every 10 ticks -- simulating the egg rising to the surface.

Then, if not carried:
- Stores position in `va90`/`va91`.
- Creates a new `simp 2 15 19 "neon" 188 0 4100` (**adult neon fish**) with:
  - `attr 199` (All physics flags -- Mouseclickable/Suffers Collisions/Invisible/Floatable/Eatable + Movable)
  - `clac -1` (no click activation)
  - `elas 20`, `aero 1`, `accg 0`, `perm 100`
  - `mvto`/`mvsf` to the parent egg position
  - Initial state: `ov01 = 0` (age), `ov02 = 550` (food/energy), `ov05 = 0`, `ov16 = null`
  - Prey selector: randomly picks one of four `(ov75, ov71, ov76)` prey combinations:
    - 1: `(13, 8, 1)` -- prey family 13 genus 8 (e.g. vegetation)
    - 2: `(3, 6, 2)` -- prey family 3 genus 6 (e.g. other critter)
    - 3: `(3, 7, 3)`
    - 4: `(3, 8, 4)`
  - Growth-stage animation bases: `ov30=0`, `ov31=10`, `ov32=20`, `ov33=30`, `ov34=41`.
  - `ov61 = 50` (range stat), `ov73 = 0` (growth stage 0), `ov74 = 0` (mate-proximity counter).
  - Random initial facing (`ov10 = -1 pose 0` or `ov10 = 1 pose 30`).
  - `velo 0 0`, `tick 2`, `slow`, then `kill ownr` (the egg is consumed).

If the egg is carried when hatch would fire, sets `ov66 = 66` -- next non-carried tick will force-hatch.

#### Event 12 -- Eat
```
stim writ from 80 1
kill ownr
```
Writes stimulus 80 intensity 1 onto the eater, then self-destructs.

### Stimulus Effects

| Trigger | Stimulus | Intensity | Target |
|---|---|---|---|
| Eaten (event 12) | 80 | 1 | Eater |

---

## Adult Neon Fish (2 15 19)

Spawned from a hatched egg with `simp 2 15 19 "neon"` at `plane 4100`, `attr 199`. The adult is the core of the ecosystem: it grows through four life stages, flocks, hunts, eats, mates, lays eggs, drowns outside water, and dies of old age, starvation, or violence.

### Key Variables

| Variable | Purpose |
|---|---|
| `ov01` | Age (increments +2/tick). Crosses stage thresholds 100, 201, 401 |
| `ov02` | Energy/food (decrements -3/tick; `>=500` triggers eat at `<500`; `>=1500` triggers old age at 1500; `<=0` triggers starvation death) |
| `ov05` | Growth stage (0=juvenile, 1..4 = adult stages) |
| `ov08` | Number of eggs to lay this mating cycle (0/1/2/3) |
| `ov10` | Horizontal facing (-1 = left, 1 = right) |
| `ov11` | Vertical facing preference |
| `ov12`, `ov13` | Current X/Y velocity targets |
| `ov30`..`ov34` | Animation base pose offsets for the current stage (updated on each growth) |
| `ov70` | Mated flag (1 = ready to lay) |
| `ov71` | Currently-hunted prey genus |
| `ov72` | Mate-block flag |
| `ov73` | Growth stage counter (0->1->2->3) |
| `ov74` | Mate-proximity counter (raises to trigger mating scan) |
| `ov75` | Currently-hunted prey family |
| `ov76` | Prey profile id (1..4) |
| `ov77` | Death-animation id (written onto `dead_fish`) |
| `ov86`, `ov87` | Out-of-water counter and accumulated gravity (drowning) |
| `ov92` | Flock-init flag (0 -> run `inim` once) |
| `ov99` | Death-request flag (5) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main AI (age/growth/flock/hunt/eat/mate/lay/die) |
| 12 | Eat | Eaten -- emit stimulus 80, self-destruct |

#### Event 12 -- Eat
```
stim writ from 80 1
kill ownr
```

#### Event 9 -- Timer

Runs every 2 ticks (see egg-hatch `tick 2`). High-level flow:

1. `gsub room` -- out-of-water drowning check (same logic as egg, minus elasticity changes).
2. If `ov99 = 5` -> `gsub deth`.
3. If `ov01 >= 1500` -> `gsub deth` (old age).
4. If `ov70 = 1` -> `gsub eggs`, reset `ov70`, then `gsub deth` (lay-and-die mating cycle).
5. `addv ov01 2` -- age.
6. `subv ov02 3` -- consume energy.
7. If `ov02 < 2500` -> `gsub eat_` (try to eat any prey within range 50).
8. If `ov05 = 2 and ov72 = 0` -> increment mate-proximity counter `ov74`; at `ov74 >= 64` run `gsub mate`.
9. **Growth transitions** (when age crosses thresholds and all four walls are > 40 away AND in water):
   - Stage 0 -> 1 at `ov01` in [100, 200]: sets `ov05 = 1`, `ov73 = 1`, new pose bases 47/57/67/75/82, plays a half-turn + swim animation.
   - Stage 1 -> 2 at `ov01` in [201, 400]: `ov05 = 1`, `ov73 = 2`, bases 94/104/114/122/129.
   - Stage 2 -> 3 at `ov01 >= 401`: `ov05 = 2`, `ov73 = 3`, bases 141/151/161/169/178.
10. **Behavior selection by energy `ov02`:**
    - `ov02 in [500, 1499]` (satiated): first tick runs `inim` (initial flock direction), subsequent ticks run `flok`/`obst`/`swim`/`move` -- flocking behavior.
    - `ov02 >= 1500` (overfed): 1-in-10 chance each tick to play a fin-swish animation (`ftsw`) with direction flip; otherwise `flok`/`obst`/`swim`/`move`.
    - `ov02 in (0, 500)` (hungry): `hunt`/`obst`/`swim`/`move`/`eat_` -- actively chase prey.
    - `ov02 <= 0`: `gsub deth` (starved).

#### Subroutine `deth` (Adult Fish)

If not carried: spawns a **dead fish** (`2 10 42 "dead_fish"`) at the current position whose sprite base depends on `ov05` (stage) and `ov10` (facing):

| `ov05` | `ov10` | Base frame | Velocity |
|---|---|---|---|
| 1 | -1 | 172 | `velo -1 0` |
| 1 | 1 | 175 | `velo 1 0` |
| 2 | -1 | 166 | `velo -1 0` |
| 2 | 1 | 169 | `velo 1 0` |
| 3 | -1 | 160 | `velo -1 0` |
| 3 | 1 | 163 | `velo 1 0` |
| 4 | -1 | 154 | `velo -1 0` |
| 4 | 1 | 160 | `velo 1 0` |

The corpse is spawned with:
- `attr va70` = 208 if dying in water, 209 if dying out of water
- `perm 99`, `accg va60` (va60 = 0 in water, 1 out of water), `elas 15`, `aero 1`/`aero 10`, `fric 100`
- `ov77 = 5` on the corpse -- selects the 3-pose decay sequence
- `tick 10` and position via `mvto` (fallback: `kill` if `tmvt` invalid)
- Both `ownr` (old adult) and `targ` (newly created corpse) are processed; `ownr` kills itself at the end of each branch.

Carried-fish special cases:
- Carried by `pntr` (hand): defer death via `ov99 = 5`.
- Carried by anything else: `targ ownr; kill targ` directly.

#### Subroutine `room`
Same as egg: out-of-water accumulates `ov86`/`ov87` (gravity ramp), 0-6 ticks +0.03, 6-100 ticks +0.08. Over 100 ticks -> `gsub deth`. In water resets. Always applies `accg ov87`.

#### Subroutine `obst`
If close to a wall (< 45) on any side, flip facing and play appropriate stand/start-swim animation (see anim subs below). Also adjusts `ov12`/`ov13` velocity targets.

#### Subroutine `mate`
Within range 50, scan for other adult neon fish (`esee 2 15 19`). If one is found **and this fish is stage `ov05 = 2`**, set `ov70 = 1` (triggers `eggs` on the next tick's top-level check).

#### Subroutine `eggs`
1. Within range 500, count nearby neon fish (`esee 2 15 19`) and eggs (`esee 2 18 17`) into `va34`.
2. If `va34 < 14`: lay 1-3 eggs (`ov08 = rand 1 3`).
3. If `va34 > 16`: suppress reproduction entirely -- `kill ownr; stop` (population cap).
4. Otherwise lay 0 eggs.
5. For each egg (`reps ov08`): create a new `simp 2 18 17 "neon" 4 188 4000` at `(va80, va81)` = current position with:
   - `attr 199`, `bhvr 48`
   - `clac -1`, `elas 50`, `accg 1`, `aero 7`, `perm 75`, `fric 99`
   - `emit 6 .15` -- emits CA 6 intensity 0.15 into the room (likely the "fish pheromone" or "food" CA)
   - `tick 10`
   - Position validated via `tmvt`; fallback `kill targ` if invalid.
6. Then `targ ownr`, reset `ov70 = 0`, and `gsub deth` -- lays-and-dies.

#### Subroutine `inim`
Sets initial flock velocity `ov12`/`ov13` to small random components (+-1 to +-2 in each axis) depending on current `ov10`.

#### Subroutine `hunt`
Loop up to 7 times:
1. Within range 500, scan for current-target prey (`esee 2 ov75 ov71`). Accumulate relative positions (`relx`, `rely`) into `va51`, `va52`.
2. If no prey found: randomly reroll prey profile `(ov75, ov71, ov76)` from the same 4-option table as the egg-hatch, and retry.
3. If prey found (`va53 = 1`): average the relative position and steer `ov10`/`ov11`/`ov12`/`ov13` toward the prey (with `rstn`/`lstn`/`rstr`/`lstr` turn animations if direction flips).
4. If never found after 7 tries: fall back to `rndm` (random walk).

Note: there's a `sets va00 "Prey has been targetted, it's classifier is: 2 "` debug log line kept in the source.

#### Subroutine `eat_`
Within range 50, scan for prey (`esee 2 ov75 ov71`). If any prey is found, `kill targ` on that prey and add 7500 to `ov02` (energy restored).

#### Subroutine `flok`
Flocking/averaging steering:
1. Within range 200, scan for other neon fish (`esee 2 15 19`), averaging their relative positions into `va51`, `va52`.
2. Steer `ov10`/`ov11`/`ov12`/`ov13` toward the flock centroid (with turn animations on direction flips).
3. If no flock (alone): fall back to `rndm`.

#### Subroutine `move`
`velo ov12 ov13` -- applies current velocity target.

#### Subroutine `rndm`
Random walk: 1-in-10 chance each axis to flip horizontal direction (with turn animations) and 1-in-10 chance each axis to flip vertical direction.

#### Turn/swim animation subroutines

| Sub | Base | Animation | Use |
|---|---|---|---|
| `lstn` | `ov32` | `[0..8]` + `over` | Left turn start |
| `rstn` | `ov33` | `[8..0]` + `over` | Right turn start |
| `lstr` | `ov32` | `[8..0]` + `over` | Left turn return |
| `rstr` | `ov33` | `[0..8]` + `over` | Right turn return |
| `ftsw` | `ov34` | `[0..9]` + velocity jitter | Fin swish idle |
| `swim` | `ov30` (left) or `ov31` (right) | `[0..9 255]` | Swim loop |

All pose bases `ov30`..`ov34` are rewritten on each growth transition so the animations track the fish's current size.

### Stimulus / CA Effects

| Trigger | Effect | Intensity | Target / CA |
|---|---|---|---|
| Eaten (event 12) | stim writ | 80 / 1 | Eater |
| Laying egg (subr eggs) | `emit 6` | 0.15 | Room CA 6 (food/pheromone) |

---

## Dead Fish (2 10 42)

A short-lived corpse spawned by an adult neon fish on death. Plays a sinking/floating decay animation and self-destructs.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decay animation |

#### Event 9 -- Timer

Reads `ov77` (death style) set by the spawning fish:
- `ov77 = 5`: wait 100, `pose 1`, wait 100, `pose 2`, wait 100, `kill ownr` (3-pose decay).
- `ov77 = 8`: wait 100, `pose 1`, wait 100, `pose 2`, wait 100, `pose 3`, wait 100, `kill ownr` (4-pose decay).

Only `ov77 = 5` is actually written by the adult-fish death subroutine in this script; `ov77 = 8` is presumably reserved for other users of the shared `2 10 42` corpse agent (e.g. other aquatic critters).

---

## Removal Script (rscr)

1. `enum 2 18 17 kill targ next` -- removes all neon fish eggs from the world.
2. `enum 2 15 19 kill targ next` -- removes all adult neon fish.
3. `enum 2 10 42 kill targ next` -- removes all dead fish corpses.
4. `scrx 2 10 42 9` -- removes dead-fish timer script.
5. `scrx 2 15 19 9` -- removes adult-fish timer script.
6. `scrx 2 18 17 9` -- removes egg timer script.
7. `scrx 2 18 17 12` -- removes egg eat script.

Note: the removal script does **not** explicitly `scrx 2 15 19 12` (the adult-fish eat script). This appears to be an oversight in the original script.
