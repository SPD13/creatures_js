---
name: stickleback
description: Bootstrap script for the stickleback fish ecosystem - creates live sticklebacks, their carcasses and eggs
type: project
---

# Stickleback

## Overview

This bootstrap script seeds the world with an initial population of stickleback fish and registers the behaviors that drive their full life-cycle (swimming, hunting food, mating, egg laying, dying and decomposing). Six adult sticklebacks are spawned at world coordinate `(4000, 1020)` with alternating sexes (`ov06`) to ensure a viable breeding population. Three agent classifiers cooperate to form the stickleback ecosystem:

- `2 15 9` – live stickleback (adult)
- `2 10 7` – dead stickleback carcass (food for other creatures, boosts room nutrient / protein CA)
- `2 18 6` – stickleback egg

Sticklebacks only behave while they are in an `rtyp` 8 (sea) or 9 (shore) room; outside those, gravity pulls them and they lose health until they die. Eggs hatch after a short incubation into new live sticklebacks.

## Created Agents

| Classifier | Name | Description | Details |
|------------|------|-------------|---------|
| 2 15 9 | Stickleback (live) | Swimming fish with hunger, mating and roaming AI | [details](#2-15-9--stickleback-live) |
| 2 10 7 | Stickleback (dead) | Floating carcass; decays and fertilises its room | [details](#2-10-7--stickleback-dead) |
| 2 18 6 | Stickleback (egg) | Sessile egg that hatches into a new stickleback | [details](#2-18-6--stickleback-egg) |

## Install Script

The install block (`iscr`) repeats six times, creating a stickleback at `(4000, 1020)` with:
- Sprite `trout`, base image 23, behaviour 16 (edible/food-ish), plane 4000
- `accg 0` (weightless – fish float), `perm 30`, `aero 10`, `elas 10`
- `ov00`=state, `ov01`=life timer, `ov02`=health/hunger (3000), `ov05`=species/variant (2), `ov06`=sex (alternates via global `va66`), `ov10/ov11`=x/y direction, `ov16`=target mate/food
- Thresholds `ov72`=400 food gain, `ov73`=400 hunger trigger, `ov74`=800 satiation cap

## Remove Script (rscr)

Kills every `2 15 9`, `2 10 7` and `2 18 6` agent in the world and removes the timer script (`scrp 9`) for each classifier, cleanly tearing down the stickleback ecosystem.

---

### 2 15 9 – Stickleback (live)

Adult fish with state-driven AI. State `ov00` drives which subroutine runs each tick:
- `0` – roam, `1` – seek food (gfod), `2` – seek mate (seek/mate), `3` – mate, `4` – lay egg, `99` – die.

Every tick it ages (`ov01++`), starves (`ov02--`) and runs physics/animation. When it matures (`ov01 > 1500`) with `ov05=1` it may mature / transform (`matr` subroutine – rebuilds a full adult agent). When outside a sea/shore room it loses 40 health per tick and is pulled down by gravity (`accg 4`).

| Event | # | Name | Behavior |
|-------|---|------|----------|
| scrp | 5 | Pickup | Sets `accg 4` so the held fish falls naturally when released by the hand/pointer. |
| scrp | 12 | Message 12 (Eaten) | Emits `stim writ from 80 4` (pleasure/feeding stimulus to the eater) and kills itself – used by predators via `mesg writ ov16 12`. |
| scrp | 9 | Timer | Main AI tick (see below). |

**Timer (event 9) behavior summary:**

1. Ages and starves; dies when `ov02<=0` or `ov01>8000`.
2. Updates gravity based on whether `rtyp` room is water (8) or shore (9).
3. Obstacle avoidance via `obst` on the four sides flips `ov10/ov11` direction.
4. When `ov01>1500` and `ov05=1`, calls `matr` to attempt maturation/replacement.
5. If not carried and outside water: drains 40 health, sets upward swim `ov11=1`, `vely 4` – a distressed flop.
6. Hunger (`ov02 < ov73`) → state 1 (seek food). Maturity (`ov20>100`) → state 2 (seek mate).
7. Subroutines:
   - `gfod`: find nearest `2 14 0` (food) or `2 13 0` (fallback), hunt toward it, on touch gain `ov72` health and send message 12 to the food.
   - `seek/chsx`: find nearest opposite-sex stickleback (uses `ov06` sex flag), elect mate.
   - `mate`: approach target; if nearby (`near` subroutine) and this fish is sex `0`, count living sticklebacks – if population ≤ 16 proceed to lay egg, otherwise abort (population cap).
   - `layg`: count eggs via `esee 2 18 6`; if fewer than 3 existing eggs, spawn a new `2 18 6` at a slightly offset position.
   - `matr`: when sufficient open space exists, spawn a replacement `2 15 9` with fully reset stats at the current position and kill the old instance (maturation/refresh).
   - `roam`: randomly pick new direction vector.
   - `vect/anim/move`: compute velocity, play swim animation (base 0 left / base 8 right), apply `velo` only while in water rooms. Coast avoidance: `gmap` checks steer the fish away from beach edges.

**Stimulus / CA impact:** When eaten (event 12) it emits stim 80 (pleasure from food) strength 4 to the eater. No direct CA alteration while alive.

---

### 2 10 7 – Stickleback (dead)

Carcass created by the die subroutine of a living stickleback. Larger (2000) if the fish was mature, smaller if juvenile. `accg 2`, `fric 70`, `elas 0`, `attr 192` – sinks and rests on the floor, pickable.

| Event | # | Name | Behavior |
|-------|---|------|----------|
| scrp | 9 | Timer | Decomposes and fertilises the room. |

**Timer behavior:** increments `ov01` every tick. After 200 ticks it plays a short decomposition animation (direction dependent) and while not carried, alters the current room's CAs: CA 3 (protein/food) +0.2 and CA 4 (starch/nutrient) +0.1 – feeding the ecosystem. The `over` command waits for animation completion then the script kills the carcass. If the decomposition is triggered repeatedly (no direction state), the final `kill targ` removes it.

**CA impact:** `altr room 3 +0.2`, `altr room 4 +0.1` per decomposition cycle.

---

### 2 18 6 – Stickleback (egg)

Laid by mating sticklebacks on the seabed. `accg 2`, `fric 80`, `elas 0`, base 48 of the trout sprite. Sits still until it hatches.

| Event | # | Name | Behavior |
|-------|---|------|----------|
| scrp | 9 | Timer | Incubates and hatches into a live stickleback. |

**Timer behavior:** Increments `ov01`; counts nearby eggs via `esee 2 18 6`. When `ov01 > 20` and fewer than 5 eggs are in the vicinity, spawns a new `2 15 9` stickleback 10 pixels up/left using `tmvt` to validate the destination (fallback: jiggle the egg with random velocity if the hatch spot is blocked). On successful spawn, the egg is killed. This caps local density and drives population replenishment.

**CA impact:** none directly – regulates the population via the 5-egg local cap.
