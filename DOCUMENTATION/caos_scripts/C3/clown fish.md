# Clown Fish

## Overview

This script implements the **Clown Fish** ecosystem for the aquatic areas of Creatures 3. It creates a population of clown fish that swim, hunt prey, flock together, reproduce by laying eggs, and eventually die. The clown fish go through a full lifecycle with three maturity stages (juvenile, sub-adult, adult), each with distinct sprite sets and behaviors. When hungry, adult clown fish hunt smaller aquatic creatures; when mature, they flock with other clown fish and seek mates. Dead fish leave behind decomposing corpses. The system includes population control through egg-laying limits based on local fish density.

The fish emit CA smell 6 (animal smell) at intensity 0.15, contributing to the aquatic ecosystem's scent landscape.

Two groups of 6 clown fish are spawned at bootstrap: one group near coordinates (3879, 1992) and the other near (5734, 2292), seeding the aquatic areas of the ship.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| `2 15 15` | [Clown Fish (Adult)](#clown-fish-adult-2-15-15) | A swimming fish with full lifecycle, hunting, flocking, and reproduction behaviors |
| `2 18 15` | [Clown Fish Egg](#clown-fish-egg-2-18-15) | An egg that hatches into a new clown fish after a random delay |
| `2 10 39` | [Dead Clown Fish](#dead-clown-fish-2-10-39) | A decomposing fish corpse that plays a decay animation then disappears |

---

## Clown Fish (Adult) — `2 15 15`

The main clown fish agent. A simple agent using the "clown" sprite gallery with 4 frames. It swims freely in aquatic rooms (room type 9), hunts prey when hungry, flocks with other clown fish when mature, and reproduces by laying eggs. It has three life stages controlled by `ov05`: juvenile (0), sub-adult (1), and adult (2), each with different sprite base offsets for swimming animations.

**Agent Properties:**
- Sprite: "clown", 153 frames, first image 0, plane 4100
- BHVR: 48 (activatable)
- ATTR: 199 (carryable, mouseable, physics-active)
- Emits CA 6 at 0.15 (animal smell)
- PERM: 100 (can pass through all doors)
- Zero gravity (accg 0), aero 1, elas 20

### Key Variables

| Variable | Purpose |
|---|---|
| `ov01` | Age counter (incremented each tick) |
| `ov02` | Hunger/energy (starts 550, decremented each tick; eating adds 5000) |
| `ov05` | Life stage: 0=juvenile, 1=sub-adult, 2=adult |
| `ov10` | Horizontal direction: -1=left, 1=right |
| `ov11` | Vertical direction: -1=up, 1=down |
| `ov12` | Horizontal velocity for movement |
| `ov13` | Vertical velocity for movement |
| `ov30-34` | Sprite base offsets for animations (left swim, right swim, left turn, right turn, fin swim) |
| `ov61` | Sensing range (50 for adults, 30 for eggs) |
| `ov70` | Mating flag (1=ready to lay eggs) |
| `ov71` | Prey species |
| `ov73` | Maturity progression tracker |
| `ov74` | Mating readiness counter (mate when >= 20) |
| `ov75` | Prey genus |
| `ov76` | Current prey type index (1-4) |
| `ov80` | Egg behavior mode: 0=drifting, 1=hatching |
| `ov86` | Out-of-water tick counter |
| `ov87` | Gravity accumulator when out of water |
| `ov92` | Initial movement flag |
| `ov99` | Death flag (5=pending death) |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main lifecycle tick (runs every 2 ticks) |
| Eat/Hit | 12 | Fish is eaten by a creature or hit |

### Timer (Event 9) — Main Lifecycle

The timer script drives the entire fish lifecycle:

1. **Room Check**: Verifies the fish is in an aquatic room (type 9). If not, gravity increases progressively. If out of water for 100+ ticks, the fish dies.

2. **Death Check**: If `ov99` = 5 (pending death from being carried), executes death.

3. **Age Death**: If age (`ov01`) exceeds 1500, the fish dies of old age.

4. **Age & Hunger Tracking**: Age increments, energy decrements each tick.

5. **Egg Laying**: If `ov70` = 1 (mating triggered), lays eggs and dies (parent sacrifice).

6. **Hunger Response**: When energy drops below 500, enters hunting mode.

7. **Mating Readiness**: Adult fish (`ov05` = 2) accumulate mating readiness (`ov74`); when >= 20, attempt to mate.

8. **Maturity Progression**:
   - At age 200-400 with clear surroundings in water: transitions to sub-adult (stage 1), updates sprite bases, reverses direction, plays turn/swim animations.
   - At age 401+ with clear surroundings in water: transitions to adult (stage 2), updates sprite bases, reverses direction.

9. **Movement Behaviors** (based on energy level):
   - **Energy >= 1500**: Occasional fin swimming display (1 in 10 chance), otherwise random or flocking movement.
   - **Energy 500-1499**: Normal swimming with random movement or flocking (adults), obstacle avoidance.
   - **Energy < 500**: Active hunting mode — searches for prey, turns toward it.
   - **Energy <= 0**: Death by starvation.

### Timer — Subroutines

- **`hunt`**: Searches for prey (genus/species stored in `ov75`/`ov71`) within range 500. If no prey found, switches to a different prey type randomly. Turns toward detected prey.
- **`eat_`**: At close range (50), kills a prey agent and gains 5000 energy.
- **`flok`**: Flocking behavior — calculates average relative position of nearby clown fish (range 200) and moves toward the center of the group.
- **`rndm`**: Random direction changes (1 in 10 chance for horizontal, 1 in 10 for vertical).
- **`obst`**: Obstacle avoidance — checks distances to walls on all four sides and reverses direction if too close (< 45 pixels). On low ceiling clearance (< 45), reverses vertical. Plays turn animations.
- **`swim`**: Plays the appropriate swimming animation based on direction and life stage.
- **`move`**: Applies velocity from `ov12`/`ov13`.
- **`room`**: Checks if fish is in water (room type 9). If not, progressively increases gravity to simulate suffocation. Kills fish after 100 ticks out of water. Resets gravity when back in water.
- **`mate`**: Searches for other adult clown fish within range 50. If a mate is found, sets `ov70` = 1 (triggers egg laying next tick).
- **`eggs`**: Population control and reproduction. Counts all nearby fish and eggs (range 500), multiplies by 1.5. If population < 14, lays 1-3 eggs. If population > 16, the parent dies without laying (overpopulation control). Eggs are classifier `2 18 15`.
- **`deth`**: Death handler — creates a dead fish corpse (`2 10 39`) at the fish's position with the appropriate sprite for life stage and direction. If in water, zero gravity; if out of water, gravity 1. Different sprite offsets for each life stage (juvenile: 124/127, sub-adult: 118/121, adult: 112/115 for left/right). If being carried by pointer, defers death.
- **`inim`**: Initializes movement velocities based on current direction.
- **Animation subroutines**: `lstn` (left-start turn), `rstn` (right-start turn), `lstr` (left-stop turn), `rstr` (right-stop turn), `ftsw` (fin swimming display with velocity wiggle).

### Prey Types

The clown fish randomly selects one of four prey types to hunt:

| Index | Genus | Species | Likely Prey |
|---|---|---|---|
| 1 | 13 | 8 | Aquamites |
| 2 | 3 | 6 | Aquatic plant/seed |
| 3 | 3 | 7 | Aquatic plant/seed |
| 4 | 3 | 8 | Aquatic plant/seed |

### Eat/Hit (Event 12)

When a clown fish is eaten or hit by a creature:
- Sends **stimulus 80** (pain) with intensity 1 to the creature that hit it.
- Creates a dead fish corpse (`2 10 39`) at the fish's position with appropriate life-stage sprite (juvenile: 146/150, sub-adult: 138/142, adult: 130/134 for left/right). Dead fish created from eating have 4 sprite frames and use `ov77 = 8` for the longer decomposition animation.
- Kills the original fish.

**Stimulus Impact:**
- Stimulus 80 to the hitting creature (pain signal).

---

## Clown Fish Egg — `2 18 15`

An egg that drifts in water and eventually hatches into a new clown fish. Uses the "clown" sprite gallery with 4 frames, starting at image 150, plane 4000.

**Agent Properties:**
- Sprite: "clown", 4 frames, first image 150, plane 4000
- BHVR: 48 (activatable)
- ATTR: 199 (carryable, mouseable, physics-active)
- Emits CA 6 at 0.15 (animal smell)
- PERM: 75, accg 1, aero 7, elas 0, fric 99
- Sensing range: 30

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Egg drift and hatch behavior |
| Eat/Hit | 12 | Egg is eaten by a creature |

### Timer (Event 9) — Drift and Hatch

1. **Room Check**: Same water detection as adult fish. Gravity increases progressively when out of water. Dies after 100 ticks out of water.

2. **Hatch Check** (`ov66 = 66`): If flagged for hatching after being carried, waits 200 ticks then proceeds.

3. **Behavior Modes**:
   - **Drifting** (`ov80 = 0`): Random movement with obstacle avoidance. Changes direction randomly, checks wall distances, and adjusts. Low ceiling (< 20) triggers gravity increase and switches to hatch mode.
   - **Hatching** (`ov80 = 1`): Executes the hatching subroutine.

4. **Death Check**: If `ov99` = 5, dies (deferred death from being carried).

### Hatching Subroutine (`htch`)

- Waits a random delay (15000-20000 ticks on first hatch attempt via `ov60`).
- Performs a "bouncing" animation: 25 cycles of random velocity bursts and animation changes.
- If not being carried: creates a new adult clown fish (`2 15 15`) at the egg's position with full initialization (random prey type, direction, all variables). The egg then kills itself.
- If being carried: defers hatching by setting `ov66 = 66`.

### Eat/Hit (Event 12)

- Sends **stimulus 80** (pain) with intensity 1 to the creature.
- Kills the egg.

**Stimulus Impact:**
- Stimulus 80 to the hitting creature (pain signal).

---

## Dead Clown Fish — `2 10 39`

A purely visual decomposition agent. Created when a clown fish dies (either naturally, from starvation, or from being eaten). Uses the "dead_fish" sprite gallery.

**Agent Properties:**
- Sprite: "dead_fish", 3 or 4 frames depending on death cause
- ATTR: 208 (in water) or 209 (out of water)
- PERM: 99, elas 15, aero 1-10, fric 100
- Gravity: 0 in water, 1 out of water

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Decomposition animation then removal |

### Timer (Event 9) — Decomposition

Two decomposition sequences based on `ov77`:

- **`ov77 = 5`** (natural death): Waits 100 ticks, advances through 3 poses (0 -> 1 -> 2) with 100-tick pauses between each, then removes itself.
- **`ov77 = 8`** (eaten death): Waits 100 ticks, advances through 4 poses (0 -> 1 -> 2 -> 3) with 100-tick pauses between each, then removes itself.

---

## Remove Script

The remove script (`rscr`) cleans up all clown fish ecosystem agents:
1. Kills all clown fish eggs (`2 18 15`)
2. Kills all adult clown fish (`2 15 15`)
3. Kills all dead fish corpses (`2 10 39`)
4. Removes all event scripts for these classifiers
