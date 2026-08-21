# ant.cos - Ant Colony Ecosystem

**Source**: `Assets/Bootstrap/001 World/ant.cos`

## Overview

This script implements a complete ant colony ecosystem for the Creatures 3 world. It creates multiple ant nests scattered across the Ark, which produce worker ants and queen ants. Worker ants forage for detritus (organic waste), carry it back to their home nest to feed the colony, and eventually die — decomposing into nutrients that enrich the local room environment. Queen ants are spawned by thriving colonies and fly to other nests to boost them, enabling a self-sustaining inter-colony network.

The ant ecosystem serves as a critter-level food web component: it recycles detritus into room nutrients (water and nutrient CA), provides stimulus-based interactions for creatures (dangerous animal play, eaten animal), and creates a dynamic population that rises and falls based on available food.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 17 6 | Ant's Nest | `ant` frame 9 | Stationary colony that tracks food reserves, grows visually, and spawns worker/queen ants | [Detail](#ants-nest-2-17-6) |
| 2 14 2 | Ant (Worker/Queen) | `ant` frame 51 | Mobile ant that forages for detritus (worker) or boosts other colonies (queen) | [Detail](#ant-worker--queen-2-14-2) |
| 2 10 24 | Dead Ant | `ant` frame 12/56 | Decomposing ant corpse that releases water and nutrients into the room | [Detail](#dead-ant-2-10-24) |

---

## Ant's Nest (2 17 6)

The ant's nest is the central hub of the colony. It is a stationary simple agent that maintains a food reserve (`ov02`), visually changes appearance based on food levels, and periodically spawns new ants when the colony is healthy. Five nests are placed at fixed positions during bootstrap, plus one additional nest with an active timer.

**Catalogue Description**: *"Where the Ants live. Ants will bring detritus back to the nest and eventually the nest will grow and produce a queen."*

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 192 | Suffers physics + collisions (not interactable by creatures) |
| `perm` | 99 | Nearly impassable permeability |
| `aero` | 0 | No air resistance |
| `accg` | 1 | Minimal gravity |
| `elas` | 10 | Low elasticity |
| `fric` | 80 | High friction (stays in place) |
| `ov02` | 0 (initial) / 420 (ticking nest) | Colony food reserve |
| `ov61` | 15 | CA smell emission intensity |
| `ov72` | 200 | Minimum food to spawn a worker ant |
| `ov73` | 150 | Food cost for nest operations |
| `ov74` | 800 | Upper food threshold |

### Nest Placement Coordinates

| Nest # | Position (x, y) | Timer Active |
|---|---|---|
| 1 | 570, 470 | No |
| 2 | 4850, 1940 | No |
| 3 | 5000, 440 | No |
| 4 | 2050, 2030 | No |
| 5 | 2700, 3420 | No |
| 6 | 2240, 770 | Yes (`tick 30`) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Colony lifecycle: food management, visual updates, ant spawning |
| 500 | Custom (Food Delivery) | Receives food from returning worker ants |

#### Event 9 — Timer (Colony Lifecycle)

The colony timer is the core lifecycle loop. Each tick it:

1. **Decrements food** (`ov02`) by 1, slowly draining the colony.
2. **Updates visual appearance** based on food level across 6 growth stages:
   - 0-420: Frame 1 (small colony)
   - 421-600: Frame 2
   - 601-800: Frame 3
   - 1001-1500: Frame 4
   - 1501-2000: Frame 5
   - 2000+: Frame 6 (thriving colony)
3. **Counts existing ants** by enumerating all 2 14 2 agents linked to this nest (`ov19 = ownr`).
4. **Spawns a worker ant** (2 14 2) when food is above the threshold (`ov72` = 200) and below 2000, and fewer than 10 ants exist. Deducts `ov73` (150) food.
5. **Spawns a queen ant** (2 14 2 with `ov07 = 1`) when food reaches 2000+, and fewer than 10 ants exist. Deducts 1800 food — queens are expensive.
6. **Recovery mechanism**: If food drops below 0 and no ants exist at all (`totl 2 14 2 = 0`), adds 200 food to prevent permanent colony death.

**Worker vs Queen Spawning Differences**:

| Property | Worker (`ov07=0`) | Queen (`ov07=1`) |
|---|---|---|
| Initial frame | 51 (frame 0) | 51 (frame 30) |
| `perm` | 99 | 50 |
| `accg` (gravity) | 1 | 0 (flies) |
| `ov61` (CA smell) | 40 | 41 |
| `ov73` (energy gain) | 40 | 400 |
| Food cost to nest | 150 (`ov73`) | 1800 |
| Behavior | Forages for detritus | Flies to boost other colonies |

#### Event 500 — Food Delivery

When a worker ant successfully returns to its home nest and touches it, it sends message 500. The nest adds `ov72` (200) to its food reserve (`ov02`). This is how worker ants feed the colony.

---

## Ant (Worker / Queen) (2 14 2)

The ant is a mobile simple agent spawned by ant nests. It comes in two variants determined by `ov07`: worker ants (`ov07 = 0`) forage for detritus and return it to the nest, while queen ants (`ov07 = 1`) fly to other colonies to boost their food reserves. Both variants use the same classifier and share most of the same code, branching behavior based on the queen flag.

**Catalogue Description**: *"An Ant. This busy soul will go out and find food (detritus) and bring it back to the nest to feed the colony. Norns and Creatures beware, Ants can bite if picked on. Queen ants are larger and fly about looking for a new nest site."*

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `perm` | 99 (worker) / 50 (queen) | Worker walks on surfaces; queen can pass through more |
| `bhvr` | 17 | Creatures can push (activate 1) and pick up |
| `tick` | 8 | Timer fires every 8 ticks |
| `aero` | 0 | No air resistance |
| `accg` | 1 (worker) / 0 (queen) | Workers walk; queens fly |
| `elas` | 1 | Very low bounce |
| `fric` | 0 | No friction (movement via velocity) |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Get Food, 2=Return Home, 99=Die |
| `ov01` | Age counter | Starts at 2000, increments each tick |
| `ov02` | Energy level | Starts at 405, decrements each tick |
| `ov07` | Ant type | 0=Worker, 1=Queen |
| `ov10` | X direction | -1=Left, 1=Right |
| `ov11` | Y direction | -1=Up, 1=Down |
| `ov16` | Target agent | Food source or target colony (agent ref) |
| `ov18` | Carried food | Reference to picked-up detritus |
| `ov19` | Home colony | Reference to spawning nest (agent ref) |
| `ov20` | Reproduction counter | Increments with age, triggers nest spawning |
| `ov30-ov33` | Animation bases | Walk-left, walk-right, fly-left, fly-right frame offsets |
| `ov72` | Hunger threshold | 400 — below this, switch to food-seeking |
| `ov73` | Energy gain on delivery | 40 (worker) / 400 (queen) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (Push) | Creature interaction — sends stimulus to creature |
| 9 | Timer | Main behavior loop: roam, forage, return home, or die |
| 12 | Eat | Ant is consumed by another agent |

#### Event 1 — Activate 1 (Push)

When a creature pushes or interacts with an ant, the ant sends **stimulus 88** (`STIM_PLAY_DANGER_ANIMAL`) with intensity 1 to the creature. This teaches creatures that ants are dangerous to interact with — they can "bite".

#### Event 9 — Timer (Main Behavior Loop)

The timer is the ant's AI loop, running every 8 ticks with randomized variance (`tick rand 5 12`). The behavior follows a state machine:

**Common logic (all states):**
1. Increments age (`ov01 += 1`) and decrements energy (`ov02 -= 1`).
2. **Water hazard**: If in a fresh water (room type 8) or salt water (room type 9) room and not being carried, drains energy rapidly (`ov02 -= 100`). Ants drown quickly.
3. **Death check**: If energy reaches 0, sets state to Die (99).
4. **Queen check**: If `ov07 = 1`, branches to queen-specific behavior (subroutine `quen`).
5. **Reproduction**: When age exceeds 2010 and is divisible by 10, increments reproduction counter (`ov20`).
6. **Hunger**: If energy falls below `ov72` (400), switches to Get Food state (1).
7. **Obstacle avoidance**: Checks distances to walls in all 4 directions and adjusts movement direction accordingly.

**State 0 — Roam** (subroutine `roam`):
The ant wanders randomly. Randomly flips horizontal direction, occasionally adjusts vertical direction, then moves with a randomized velocity vector. Uses walking animation facing the current direction.

**State 1 — Get Food** (subroutine `gfod`):
1. If no target food (`ov16 = null`), calls `find` to locate the nearest detritus agent (family 2, genus 10, species 0) within visual range using squared-distance comparison.
2. If a target exists, calls `hunt` to orient toward it and move in its direction.
3. Upon touching the food (`touc ov16 ownr <> 0`):
   - Sends message 4 (Pickup/Deactivate) to the food.
   - Stores the food reference in `ov18`.
   - Switches to Return Home state (2).
4. If the food target disappears (null), resets to Roam state (0).

**State 2 — Return Home** (subroutine `home`):
1. Sets target to home colony (`ov19`).
2. Calls `hunt` to move toward the colony.
3. Upon touching the colony:
   - Sends message 12 (Eat) to the carried food (`ov18`), consuming it.
   - Sends message 500 (Food Delivery) to the colony, feeding it.
   - Resets to Roam state (0) and restores `ov73` (40) energy.
4. If the colony has been destroyed, resets to Roam.

**State 99 — Die** (subroutine `die_`):
1. Records current position and direction.
2. Creates a **Dead Ant** (2 10 24) at the current position. Uses frame 12 for workers, frame 56 for queens.
3. Destroys itself (`kill ownr`).

**Queen-specific behavior** (subroutine `quen`):
Queens use a parallel set of movement subroutines (`vec2`, `ani2`, `mov2`, `rom2`) that provide smoother, flying movement with velocity interpolation instead of the jerky walking movement of workers.

1. Calls `fnd2` to find the nearest ant colony (2 17 6) that is NOT the home colony (`ov19`).
2. Calls `hunt` to fly toward the target colony.
3. Upon touching the colony, calls `bnst` (Boost Nest):
   - Iterates all colonies (2 17 6), finds the target.
   - Reactivates its timer (`tick 30`).
   - If the colony is at pose 0 (empty/dormant), adds 450 food and advances its animation.
   - **The queen then sacrifices itself** (`kill targ` where targ = queen), dying to boost the other colony.
4. If no other colony is found, roams randomly using queen movement.

#### Event 12 — Eat

When another agent sends message 12 to this ant (the ant is being eaten/consumed), the ant:
1. Sends **stimulus 80** (`STIM_EATEN_ANIMAL`) with intensity 1 to the consuming agent.
2. Destroys itself (`kill ownr`).

---

## Dead Ant (2 10 24)

A dead ant is a decomposing corpse created when a worker or queen ant dies. It lies on the ground for a short period, then plays a decomposition animation, releases nutrients into the room environment, and disappears.

**Catalogue Description**: *"Dead Ant, Dead Ant. Deadantdeadantdeant dead annnnt."*

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `accg` | 2 | Gravity (falls to ground) |
| `elas` | 0 | No bounce |
| `fric` | 60 | Moderate friction |
| `tick` | 4 | Fast timer (decomposition counter) |
| `ov01` | 0 | Decomposition counter (increments each tick) |
| `ov10` | inherited | Facing direction from parent ant |
| `ov61` | 10 | CA smell emission intensity |

### Sprite Variants

| Source Ant | Base Frame | Notes |
|---|---|---|
| Worker (`ov07 = 0`) | 12 | Smaller dead ant sprite |
| Queen (`ov07 = 1`) | 56 | Larger dead ant sprite |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition countdown, nutrient release, self-destruction |

#### Event 9 — Timer (Decomposition)

Each tick increments the counter (`ov01`). After 50 ticks:

1. Selects decomposition animation based on facing direction:
   - Facing left (`ov10 <= 0`): base 0, frames [0 1 2 3 4 5]
   - Facing right (`ov10 > 0`): base 6, frames [0 1 2 3 4 5]
2. **Releases nutrients into the room** (if in a valid room and not carried):
   - `altr room targ 3 0.1` — Increases room **CA 3 (Water)** by 0.1
   - `altr room targ 4 0.1` — Increases room **CA 4 (Nutrient)** by 0.1
3. Waits for the decomposition animation to complete (`over`).
4. Destroys itself (`kill targ`).

This creates a nutrient cycle: ants forage detritus, live and die, and their corpses return water and nutrients to the local room environment, which in turn supports plant growth and other ecological systems.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the ant ecosystem:

1. Kills all existing worker/queen ants (`enum 2 14 2 → kill targ`).
2. Removes ant scripts: Timer (9) and Collision (6) for classifier 2 14 2.
3. Kills all existing ant nests (`enum 2 17 6 → kill targ`).
4. Removes nest scripts: Timer (9) and Collision (6) for classifier 2 17 6.

---

## Ecosystem Diagram

```
                    ┌─────────────────┐
                    │   Detritus      │
                    │  (2 10 0)       │
                    │ Organic waste   │
                    └────────┬────────┘
                             │ found by worker (esee)
                             │ message 4 (pickup)
                             ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  Ant's Nest │◄───│   Worker Ant    │───►│  Dead Ant   │
│  (2 17 6)   │ msg│   (2 14 2)     │die │  (2 10 24)  │
│             │ 500│   ov07=0       │    │             │
│ Food store  │    │ Roam→Forage→   │    │ Decomposes  │
│ Spawns ants │    │ Return→Roam    │    │ +Water CA   │
│ Grows       │    └────────┬────────┘    │ +Nutrient CA│
└──────┬──────┘             │              └─────────────┘
       │                    │ stimulus 88
       │ spawns when        │ (if pushed by creature)
       │ food >= 2000       │
       ▼                    │
┌─────────────────┐         │
│   Queen Ant     │         │
│   (2 14 2)      │         │
│   ov07=1        │         │
│                 │         │
│ Flies to other  │         │
│ colony, boosts  │         │
│ it, sacrifices  │         │
│ self            │         │
└─────────────────┘
```

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 80 | `STIM_EATEN_ANIMAL` | Ant is consumed (event 12) | Creature receives "eaten animal" biochemical feedback |
| 88 | `STIM_PLAY_DANGER_ANIMAL` | Ant is pushed (event 1) | Creature learns ants are dangerous to interact with |

## Room CA Effects

| CA Index | Name | Source | Change | Ecological Role |
|---|---|---|---|---|
| 3 | Water | Dead ant decomposition | +0.1 | Returns moisture to the environment |
| 4 | Nutrient | Dead ant decomposition | +0.1 | Enriches soil for plant growth |
