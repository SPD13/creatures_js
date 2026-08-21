# angel fish.cos - Angel Fish Aquatic Ecosystem

**Source**: `Assets/Bootstrap/001 World/angel fish.cos`

## Overview

This script implements the angel fish ecosystem for the aquatic areas of the Creatures 3 world. It defines the behavior for angel fish eggs that drift and hatch in water, juvenile-to-adult fish with hunting, flocking, and mating behaviors, and decomposing dead fish corpses. The entire lifecycle is water-dependent: all agents require salt water rooms (room type 9) to survive and will die if stranded outside water for too long.

This script contains **only event scripts** (no bootstrap install section). Angel fish eggs are created externally by other scripts (e.g., the Norn seed launcher). When an egg hatches, it spawns an adult fish; adult fish that mate produce new eggs, sustaining the population. Fish hunt small critters (multiple prey types randomly assigned at birth), flock together, and grow through three life stages. Dead fish play a decomposition animation before disappearing.

The ecosystem includes population control: when mating triggers egg-laying, the script counts nearby fish and eggs and limits spawning to prevent overcrowding (kills the parent if population exceeds 16).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 18 14 | Angel Fish Egg | `angel` frame 153 | Drifts in water, hatches into a juvenile angel fish when it settles | [Detail](#angel-fish-egg-2-18-14) |
| 2 15 14 | Angel Fish | `angel` frame 0/30 | Swims, hunts prey, flocks, grows through 3 life stages, mates to lay eggs | [Detail](#angel-fish-2-15-14) |
| 2 10 40 | Dead Angel Fish | `dead_fish` | Decomposing fish corpse; plays decay animation then self-destructs | [Detail](#dead-angel-fish-2-10-40) |

---

## Angel Fish Egg (2 18 14)

Angel fish eggs drift passively in water with gentle random movements. When an egg sinks to the bottom of a water room, it transitions to hatching mode. After a random incubation period (15,000-20,000 ticks), the egg bounces vigorously 25 times, then spawns a new juvenile angel fish at its position and destroys itself. Eggs die if stranded outside water for too long.

### Properties (set at creation by the egg-laying subroutine)

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Physics + Collisions + Mouseclickable + Carryable + Activatable |
| `bhvr` | 48 | Creatures can pick up and hit |
| `clac` | -1 | No creature activation click |
| `elas` | 50 | Moderate bounce |
| `accg` | 1 | Light gravity |
| `aero` | 7 | Air resistance |
| `perm` | 75 | Moderate permeability |
| `fric` | 99 | High friction |
| `tick` | 10 | Timer interval |
| `emit 6` | 0.15 | Emits CA 6 (fish smell) |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov10` | Horizontal drift direction | -1=left, 1=right |
| `ov11` | Vertical drift direction | -1=up, 1=down |
| `ov60` | Hatch wait time | Random 15000-20000 (set once on first hatch attempt) |
| `ov61` | Initial wait value | 30 (set at egg creation) |
| `ov66` | Hatch-while-carried flag | 66 = egg was carried during hatch, retry next tick |
| `ov67` | Hatch animation completed | 0=not started, 9=animation done |
| `ov80` | Egg state | 0=drifting, 1=hatching (triggered by hitting bottom) |
| `ov86` | Out-of-water tick counter | Increments when not in water room; death at 100 |
| `ov87` | Gravity accumulator | Increases gradually when outside water |
| `ov99` | Death flag | 5=die next tick |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior: drifting, room checks, hatching |
| 12 | Eat | Egg is consumed by another agent |

#### Event 9 - Timer (Drift & Hatch)

Each timer tick runs the following logic:

1. **Room check** (`room` subroutine): Verifies the egg is in a salt water room (type 9). If not, gradually increases gravity (`ov87` accumulator) to simulate sinking/struggling. If out of water for 100+ ticks, the egg dies.
2. **Carry-hatch check**: If `ov66 = 66` (was carried when hatching was attempted), retries hatching.
3. **State dispatch**:
   - `ov80 = 0` (Drifting): Random small velocity changes with 10% chance per direction. Checks obstacles; if near the bottom (`obst down < 20`), switches to hatching state and enables gravity.
   - `ov80 = 1` (Hatching): Runs the hatch subroutine.
4. **Death check**: If `ov99 = 5`, kills the egg (deferred death for when carried).

**Hatching behavior** (`htch` subroutine):
1. If hatch animation hasn't played (`ov67 = 0`): sets random incubation wait (15,000-20,000 ticks if not already set), waits, then bounces the egg 25 times with random velocities and animations. Sets `ov67 = 9`.
2. If not being carried: Creates a new **Angel Fish** (2 15 14) at egg position, configures its properties and initial state, then destroys the egg.
3. If being carried: Sets `ov66 = 66` to retry hatching next tick.

**New fish configuration at hatching**:
- Randomly assigns one of 4 prey types (determines what food the fish hunts)
- Sets animation base frames for the baby life stage
- Random initial facing direction (left or right)
- Timer set to 2 (fast updates)

#### Event 12 - Eat

When consumed by a creature:
1. Sends **stimulus 80** (`STIM_EATEN_ANIMAL`) with intensity 1 to the consuming creature.
2. Destroys itself.

---

## Angel Fish (2 15 14)

The angel fish is the main agent of this ecosystem. It lives in water, hunts prey, flocks with other angel fish, and reproduces. Fish grow through three life stages (baby, juvenile, adult), with each stage unlocking new animation frames. Adults can mate when nearby, triggering egg-laying. Fish have an energy system that decreases over time; they must hunt and eat to survive. If energy runs out or age exceeds 1500, the fish dies.

### Properties (set at hatching)

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Physics + Collisions + Mouseclickable + Carryable + Activatable |
| `bhvr` | 48 | Creatures can pick up and hit |
| `clac` | -1 | No creature activation click |
| `elas` | 20 | Low bounce |
| `aero` | 1 | Minimal air resistance |
| `accg` | 0 | No gravity (floating in water) |
| `perm` | 100 | Full permeability |
| `tick` | 2 | Fast timer interval |
| `emit 6` | 0.15 | Emits CA 6 (fish smell) |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov01` | Age counter | Increments by 2 per tick; death at 1500 |
| `ov02` | Energy/hunger | Starts at 550; decrements by 3 per tick; +5000 on eating prey; death at 0 |
| `ov05` | Life stage | 0=baby, 1=juvenile, 2=adult |
| `ov08` | Number of eggs to lay | Random 1-3 or 0 depending on population |
| `ov10` | Horizontal direction | -1=left, 1=right |
| `ov11` | Vertical direction tracking | -1=up, 1=down |
| `ov12` | Horizontal velocity | Set by movement subroutines |
| `ov13` | Vertical velocity | Set by movement subroutines |
| `ov16` | Agent reference | (unused in this script) |
| `ov30`-`ov34` | Animation base frames | Stage-dependent swim/turn/tail-flap frame offsets |
| `ov61` | Initial value | 50 (set at hatching) |
| `ov70` | Mate/egg-laying flag | 1=ready to lay eggs |
| `ov71` | Prey species | 6, 7, or 8 (randomly assigned at birth) |
| `ov72` | (Mating condition check) | Checked as 0 for mating eligibility |
| `ov73` | Growth stage tracker | 1=baby, 2=juvenile transition done, 3=adult transition done |
| `ov74` | Mating attempt counter | Increments each tick when adult; mate at 100 |
| `ov75` | Prey genus | 13 or 3 (randomly assigned at birth) |
| `ov76` | Prey type identifier | 1-4 (determines prey classifier combination) |
| `ov86` | Out-of-water counter | Increments when not in water; death at 100 |
| `ov87` | Gravity accumulator | Increases outside water |
| `ov92` | Movement initialized flag | 0=needs init, 1=initialized |
| `ov99` | Death flag | 5=deferred death (when carried) |

### Prey Types

Each fish is randomly assigned one of four prey types at birth:

| Type (`ov76`) | Prey Classifier | Genus (`ov75`) | Species (`ov71`) |
|---|---|---|---|
| 1 | 2 13 8 | 13 | 8 |
| 2 | 2 3 6 | 3 | 6 |
| 3 | 2 3 7 | 3 | 7 |
| 4 | 2 3 8 | 3 | 8 |

When hunting fails to find the assigned prey, the fish randomly switches to a different prey type and tries again (up to 7 attempts).

### Life Stages

| Stage | `ov05` | Age Range | Animation Bases (ov30-ov34) | Trigger |
|---|---|---|---|---|
| Baby | 0 | 0-199 | 0, 10, 20, 30, 41 | Birth |
| Juvenile | 1 | 200-400 | 51, 61, 71, 81, 92 | Age 200, sufficient space, in water |
| Adult | 2 | 401+ | 102, 112, 122, 132, 143 | Age 401, sufficient space, in water |

Growth requires the fish to be in a water room with at least 40px clearance in all four directions. During growth transitions, the fish performs a turning animation and reverses direction.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior: aging, growth, hunting, flocking, mating, movement |
| 12 | Eat | Fish is consumed by another agent |

#### Event 9 - Timer (Main Behavior Loop)

Each timer tick (every 2 game ticks) runs the following:

**Common logic (all ticks):**
1. **Room check** (`room` subroutine): Verifies fish is in salt water (type 9). If not, increases gravity gradually. Death if out of water for 100+ ticks. Resets gravity to 0 when back in water.
2. **Death check**: If `ov99 = 5`, executes death.
3. **Old age check**: If `ov01 >= 1500`, executes death.
4. **Age increment**: `ov01 += 2` each tick.
5. **Energy decrement**: `ov02 -= 3` each tick.
6. **Mate check**: If `ov70 = 1` (mate flag set), lay eggs and die.
7. **Hunger check**: If `ov02 < 2500`, attempt to eat nearby prey.

**Growth transitions** (executed instantly):
- When `ov73 = 1` and age 200-400 with space and in water: Grow to juvenile, update animation frames, reverse direction with turn animation.
- When `ov73 = 2` and age 401+ with space and in water: Grow to adult, update animation frames, reverse direction with turn animation.

**Behavior based on energy level:**

| Energy Range | Behavior | Description |
|---|---|---|
| >= 1500 | Leisure swimming | 10% chance of turning; otherwise flocking + obstacle avoidance + swimming |
| 500-1499 | Standard swimming | First tick initializes random movement; subsequent ticks use flocking + obstacle avoidance |
| 1-499 | Hunting | Actively hunts prey, moves toward detected targets |
| <= 0 | Death | Starvation |

**Mating behavior** (`mate` subroutine):
- Only triggers for adults (`ov05 = 2`) with `ov72 = 0`.
- Increments `ov74` each tick; at 100+, scans for other adult fish within range 50.
- If another adult is found, both set `ov70 = 1` (mate flag).

**Egg-laying behavior** (`eggs` subroutine):
- Counts nearby fish (2 15 14) and eggs (2 18 14) within range 500.
- Population < 14: lays 1-3 eggs.
- Population > 16: parent dies immediately (overcrowding control).
- Population 14-16: lays 0 eggs.
- Each egg is created as (2 18 14) with `attr 199`, `elas 50`, `accg 1`, `aero 7`, `perm 75`, `fric 99`.
- Parent dies after laying.

**Movement subroutines:**

| Subroutine | Purpose |
|---|---|
| `obst` | Obstacle avoidance: reverses direction near walls, includes turning animations |
| `flok` | Flocking: calculates average position of nearby fish (range 200), steers toward flock center |
| `hunt` | Hunting: scans for prey (range 500), steers toward detected prey; switches prey type if none found |
| `eat_` | Eating: kills first prey within range 50, gains 5000 energy |
| `inim` | Initializes random movement velocities based on facing direction |
| `rndm` | Random direction changes (10% chance horizontal, 10% chance vertical) |
| `swim` | Swimming animation based on current direction |
| `move` | Applies velocity from ov12/ov13 |
| `lstn`/`rstn` | Left/right stop animation (turn-to-stop transitions) |
| `lstr`/`rstr` | Left/right start animation (turn-to-start transitions) |
| `ftsw` | Fancy tail swim: decorative fin-flapping animation with small velocity oscillations |

#### Event 12 - Eat

When consumed by a creature:
1. Sends **stimulus 80** (`STIM_EATEN_ANIMAL`) with intensity 1 to the consuming creature.
2. Creates a **Dead Angel Fish** (2 10 40) at the fish's position.
   - Sprite frame depends on life stage (`ov05`) and facing direction (`ov10`).
   - In water room: `attr 208`, no gravity. Out of water: `attr 209`, gravity enabled.
   - Sets `ov77 = 8` (eaten death mode, 4-pose decomposition).
3. Destroys itself.

**Death behavior** (`deth` subroutine, also triggered internally):
- If not carried: Creates Dead Angel Fish with `ov77 = 5` (normal death, 3-pose decomposition). Sprite frame varies by life stage and direction.
- If carried by pointer: Sets `ov99 = 5` (deferred death, handled next tick).
- If carried by non-pointer agent: Kills itself immediately.

### Dead Fish Sprite Frames by Life Stage

**Normal death (from `deth` subroutine, ov77=5, 3-frame sprite):**

| Life Stage | Direction | Sprite | First Frame |
|---|---|---|---|
| Baby (0) | Left | `dead_fish` | 18 |
| Baby (0) | Right | `dead_fish` | 21 |
| Juvenile (1) | Left | `dead_fish` | 12 |
| Juvenile (1) | Right | `dead_fish` | 15 |
| Adult (2) | Left | `dead_fish` | 6 |
| Adult (2) | Right | `dead_fish` | 9 |

**Eaten death (from event 12, ov77=8, 4-frame sprite):**

| Life Stage | Direction | Sprite | First Frame |
|---|---|---|---|
| Baby (0) | Left | `dead_fish` | 48 |
| Baby (0) | Right | `dead_fish` | 52 |
| Juvenile (1) | Left | `dead_fish` | 40 |
| Juvenile (1) | Right | `dead_fish` | 44 |
| Adult (2) | Left | `dead_fish` | 32 |
| Adult (2) | Right | `dead_fish` | 36 |

---

## Dead Angel Fish (2 10 40)

A decomposing angel fish corpse. Created when a live fish dies (naturally, by starvation, or by being eaten). Plays a brief decomposition animation and then self-destructs. Two death modes determine the number of decomposition frames.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 208 (water) / 209 (land) | Depends on room type at death |
| `perm` | 99 | Nearly impassable |
| `accg` | 0 (water) / 1 (land) | No gravity in water |
| `elas` | 15 | Low bounce |
| `aero` | 1 or 10 | Air resistance (varies) |
| `fric` | 100 | Maximum friction |
| `tick` | 10 | Timer interval |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov77` | Death type | 5=normal death (3-pose decay), 8=eaten death (4-pose decay) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition animation and self-destruction |

#### Event 9 - Timer (Decomposition)

Based on death type:

**Normal death (`ov77 = 5`)**:
1. Wait 100 ticks.
2. Pose 1 (first decay frame), wait 100 ticks.
3. Pose 2 (second decay frame), wait 100 ticks.
4. Destroy self.

**Eaten death (`ov77 = 8`)**:
1. Wait 100 ticks.
2. Pose 1, wait 100 ticks.
3. Pose 2, wait 100 ticks.
4. Pose 3, wait 100 ticks.
5. Destroy self.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the angel fish ecosystem:

1. Kills all angel fish eggs (`enum 2 18 14 -> kill targ`).
2. Kills all live angel fish (`enum 2 15 14 -> kill targ`).
3. Kills all dead angel fish (`enum 2 10 40 -> kill targ`).
4. Removes all scripts: `scrx 2 10 40 9`, `scrx 2 15 14 12`, `scrx 2 15 14 9`, `scrx 2 18 14 9`.

---

## Lifecycle Diagram

```
 External creation (e.g., seed launcher)
            |
            v
+-----------------------+
|   Angel Fish Egg      |
|   (2 18 14)           |
|                       |
| Drift in water        |
| Hit bottom -> hatch   |
| Wait 15k-20k ticks    |
| Bounce 25x then spawn |---- eaten ---->  stimulus 80 + kill
|                       |
+----------+------------+
           | hatches
           v
+-----------------------+
|   Angel Fish          |
|   (2 15 14)           |
|                       |
| Baby (age 0-199)      |
|   v                   |
| Juvenile (age 200-400)|
|   v                   |
| Adult (age 401+)      |---- eaten ---->+-----------------------+
|                       |               | Dead Angel Fish       |
| Hunt prey (4 types)   |               | (2 10 40)             |
| Flock with others     |---- dies ---->| ov77=5: 3-pose decay  |
| Mate at adult stage   |               | ov77=8: 4-pose decay  |
|                       |               | then self-destructs   |
+----------+------------+               +-----------------------+
           | mates (ov74 >= 100)
           v
  Population check:
  < 14: lay 1-3 eggs ------> (new Angel Fish Eggs)
  14-16: lay 0 eggs
  > 16: parent dies (overcrowding)
```

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 80 | `STIM_EATEN_ANIMAL` | Egg is consumed (event 12) | Creature receives "eaten animal" biochemical feedback |
| 80 | `STIM_EATEN_ANIMAL` | Fish is consumed (event 12) | Creature receives "eaten animal" biochemical feedback |

## Room CA Effects

| CA Index | Name | Source | Change | Ecological Role |
|---|---|---|---|---|
| 6 | Fish Smell | Eggs and fish (`emit 6 .15`) | +0.15 continuous | Marks aquatic areas with fish presence |

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 13 8 | Prey (hunt + eat) | Prey type 1 - hunted and consumed by angel fish |
| 2 3 6 | Prey (hunt + eat) | Prey type 2 - hunted and consumed by angel fish |
| 2 3 7 | Prey (hunt + eat) | Prey type 3 - hunted and consumed by angel fish |
| 2 3 8 | Prey (hunt + eat) | Prey type 4 - hunted and consumed by angel fish |
| 2 15 14 | Flocking + Mating | Fish flock together and adults mate with nearby adults |
| 2 18 14 | Population count | Eggs counted during population check before spawning |

## Water Dependency

All agents in this ecosystem are water-dependent:

| Condition | Behavior |
|---|---|
| In salt water room (type 9) | Normal behavior; gravity reset to 0 |
| Outside water room | Gravity increases gradually (ov87 accumulator); tick counter (ov86) increments |
| Out of water 100+ ticks | Fish/egg dies |
| Elasticity in water | 0 (eggs: reset via `elas 0` in room sub) |
