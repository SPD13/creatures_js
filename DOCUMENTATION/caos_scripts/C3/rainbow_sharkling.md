# Rainbow Sharkling

## Overview

This install script populates the world with a small shoal of decorative "rainbow sharkling" fish. Between 3 and 5 sharklings are spawned at a fixed underwater location (`3879, 2192`) with random RGB tints, giving each one a unique rainbow hue. The sharklings are simple (non-creature) agents that swim, flock, hunt smaller prey, mate with each other, reproduce, and eventually die of old age or by leaving the water. Because they reproduce (inheriting blended colours from their parents), they behave as a small self-sustaining ecosystem of prey-eating fish.

The removal script (`rscr`) enumerates and kills all agents of the `2 16 4` classifier and removes the timer script, cleanly uninstalling the species.

## Created Agents

| Classifier | Agent | Role | Details |
|---|---|---|---|
| 2 16 4 | Rainbow Sharkling | Autonomous underwater fish that swims, flocks, hunts prey, mates and reproduces | [Details](#rainbow-sharkling-2-16-4) |

## Rainbow Sharkling (2 16 4)

A simple agent (`simp`) using the `shark` sprite gallery, base image 153, 4 image planes, absolute plane 4100. Attributes 199 (suffer collisions, physics, activatable, greedy cabin, mouseable combinations), elasticity 20, `aero 1`, `accg 0` (neutral buoyancy in water), permeability 64. Each newborn is randomly tinted with RGB in the range 60–255 per channel (128 rotation, 128 swap).

Key object variables:
- `ov01` – age counter (incremented each tick; death at 3000)
- `ov02` – hunger / life energy (decremented each tick, triggers hunting below 500, death at 0)
- `ov05` – reproductive readiness flag (set to 2 once mature)
- `ov10` / `ov11` – horizontal / vertical facing (−1 left / +1 right, etc.)
- `ov12` / `ov13` – horizontal / vertical velocity components
- `ov19` – "has matured" latch
- `ov20`/`ov21`/`ov22` – this sharkling's own RGB genes
- `ov23`/`ov24`/`ov25` – mate's RGB genes (captured during mate event)
- `ov61` – reproduction/mating range value (stored, not actively used in this script)
- `ov70` – "ready to reproduce now" flag
- `ov71` – prey species number picked from {14, 15, 16, 19} (family 2 genus 15)
- `ov72` – mated-this-cycle flag
- `ov73`/`ov74` – unused reproductive/state flags
- `ov80` – "marked for death after reproduction" flag
- `ov81` – post-reproduction countdown to death (dies at 15)
- `ov86`/`ov87` – out-of-water suffocation counter and `accg` ramp
- `ov92` – behaviour-mode latch (0 = first-tick init, 1 = normal wandering)
- `ov99` – special death code (5 = death when not held by pointer)

### Events

| Event | # | Description | Behaviour |
|---|---|---|---|
| Timer | 9 | Per-tick update (tick 1) | Master AI loop — drives movement, hunting, mating, aging and death |

#### Timer (9) – AI tick

Every game tick the sharkling runs its full AI cycle:

1. **Room check (`room` subroutine)** – If the current room is not of type 9 (underwater), `accg` is gradually increased (the fish falls faster out of water) using `ov86`/`ov87` ramps. After 100 ticks out of water the sharkling dies. Back in water, gravity is reset to 0.
2. **Death checks** – Dies if `ov99 = 5` (special death flag) or if `ov01 >= 3000` (old age).
3. **Aging** – `ov01` increments, `ov02` (life energy) decrements.
4. **Maturity** – Once `ov01 > 1200` the sharkling becomes reproductively active (`ov05 = 2`).
5. **Reproduction** – If `ov70 = 1` (mated), calls `repr` to spawn 0–20 offspring within `rnge 1000`, blending parent colours with random mutation, then flags the parent with `ov80 = 1` so it dies 15 ticks later (reproductive death).
6. **Mating (`mate` subroutine)** – With `rnge 100`, uses `esee 2 16 4` to find another sharkling; captures mate's RGB and triggers reproduction next tick.
7. **Behaviour selection based on `ov02`:**
   - `ov02 >= 500` – normal life: initializes direction on first tick (`inim`), then alternates between flocking (`flok` — averages positions of other sharklings within 1000 and moves toward them) and random wandering (`rndm`), always followed by obstacle avoidance (`obst`), swim animation (`swim`) and applying velocity (`move`).
   - `0 < ov02 < 500` – hungry: executes `hunt` which uses `esee 2 15 ov71` to locate prey (family 2 genus 15, species in {14,15,16,19} — small fish), averages relative positions and turns toward them; if no prey found, falls back to `rndm`/`flok`. Then `obst`, `swim`, `move`, and `eat_` (kills a prey within `rnge 50` and adds 4000 to `ov02`).
   - `ov02 <= 0` – starvation: dies (`deth`).
8. **Swim animation** – Alternates between two animation strips (0–7 left-facing, 8–15 right-facing) with `frat 2` after a 1–7 tick wait.
9. **Turning** – `gort` / `golt` subroutines play full turn animations (sprites 16–30 for right-turn, 31–45 for left-turn) and set `velo` accordingly.

**Death (`deth`)**: If not currently carried by anything other than the pointer, `kill targ` destroys the agent; otherwise sets `ov99 = 5` to defer death until released.

**Impact on world / ecosystem**:
- Consumes agents of family 2 genus 15 (small fish prey — pufferfish, minnow and similar species at species numbers 14/15/16/19) via `kill targ` in `eat_`.
- Self-reproducing population with colour inheritance.
- No CA emissions or stimulus changes; purely a visual/ecosystem prey-eater.

## Uninstall (rscr)

Enumerates all `2 16 4` agents and kills them, then removes the timer script via `scrx 2 16 4 9`.
