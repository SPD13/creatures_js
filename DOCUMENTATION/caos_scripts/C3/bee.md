# Bee Ecosystem

## Overview

This script implements a complete bee ecosystem consisting of beehives, worker bees, queen bees, and dead bee remains. The beehives act as population centers that periodically spawn worker bees and, when sufficiently resourced, queen bees. Bees exhibit autonomous behaviors including roaming, foraging for food, returning resources to their hive, defending the hive from aggressors, and dying when energy is depleted. Dead bees leave behind decaying remains that release nutrients (Room CA) into the environment before disappearing.

The ecosystem features a resource-based economy: hives accumulate honey (ov02) which is spent to spawn new bees. Worker bees forage for food (family 2, genus 7 agents) and return it to the hive. Queen bees seek out other hives to colonize them. The system self-regulates through population caps, resource costs, and natural attrition.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 2 17 5 | [Bee Hive](#bee-hive-2-17-5) | Stationary hive that spawns and manages bee populations |
| 2 14 1 | [Bee (Worker/Queen)](#bee-workerqueen-2-14-1) | Flying insect that roams, forages, attacks, and returns resources to the hive |
| 2 10 21 | [Dead Bee](#dead-bee-2-10-21) | Decaying bee remains that release nutrients into the room |

---

## Bee Hive (2 17 5)

The bee hive is a stationary simple agent that serves as the population center for bees. It stores honey resources (ov02) and periodically spawns new bees when conditions are met. Four hives are created during installation at different locations across the world, though only the first one is initially active (has a non-zero tick rate).

### Installation

Four hives are created at positions:
1. (1860, 650) - Active (tick 10), animated
2. (2360, 650) - Dormant (tick 0)
3. (2660, 700) - Dormant (tick 0)
4. (3100, 700) - Dormant (tick 0)

All hives share: `perm 100`, `attr 4` (carryable), `aero 5`, `elas 20`, `clac 0` (not clickable), sprite "bee" with 2 images starting at frame 72.

### Hive Variables

| Variable | Initial Value | Description |
|---|---|---|
| ov00 | 0 | State (unused in hive context) |
| ov01 | 2000 | Age counter |
| ov02 | 500 | Honey/resource level |
| ov61 | 40 | Smell classifier (bee) |
| ov80 | 100 | Honey cost per worker bee spawn |
| ov81 | 10 | Additional spawn cost |
| ov82 | 120 | Honey transferred to each new bee (ov80) |

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | Hive is pushed/attacked by another agent |
| Timer | 9 | Periodic update for bee spawning and resource management |
| Message 500 | 500 | External resource injection (adds _p1_ to ov02) |

### Push (Event 1) - Defensive Bee Spawning

When an agent pushes the hive, it spawns up to 4 defensive worker bees near its position, provided the local bee population (2 14 1) is below 12. Each spawned bee:
- Is assigned the pusher as its attack target (ov17)
- Has an attack timer (ov88) set to 90 ticks
- Is set to kamikaze mode (ov89 = 1, meaning it dies after attacking)
- References the hive as its parent (ov19 = ownr)

If a bee cannot be placed at the target position (tmvt check fails), it is immediately killed.

### Timer (Event 9) - Population Management

The hive timer manages bee spawning based on resource levels:

- **Resource decay**: ov02 decreases by 1 each tick
- **Population check**: Counts nearby bees (2 14 1) within range 600
- **Worker bee spawning** (ov02 between 100-3500, population < 10): Spawns a single worker bee. Costs ov81 + ov80 honey. Worker gets ov07=0 (worker flag), ov61=40 (worker smell).
- **Queen bee spawning** (ov02 >= 3500, population < 10): Spawns a single queen bee. Costs 3000 + ov80 honey. Queen gets ov07=1 (queen flag), ov61=41 (queen smell), ov75=1, initial attack timer ov88=75.
- **Resource recovery**: If ov02 drops below 0 and no bees exist in the world, adds 200 to ov02 (prevents total extinction).

### Message 500 - Resource Addition

Adds the value of parameter 1 (_p1_) to the hive's honey reserves (ov02). This is used by external agents to feed resources into the hive.

---

## Bee (Worker/Queen) (2 14 1)

Individual bees are flying simple agents with autonomous AI driven by a state machine. They can roam freely, search for food, attack threats, and return resources to their parent hive. Bees use the sprite "bee" with 72 frames and elaborate animation base tables stored in ov30-ov43.

### Bee Properties

- `perm 50`, `accg 0` (no gravity - flying), `tick 4` (worker) or `tick 6` (queen)
- `bhvr 17` (can be pushed and picked up)
- `attr 199` (carryable, visible, etc.), `aero 5`, `elas 20`, `clac 0`

### Bee Variables

| Variable | Initial Value | Description |
|---|---|---|
| ov00 | 0 | Behavior state: 0=roam, 1=get food, 2=nest (return to hive), 99=die |
| ov01 | 2000 | Age counter (increases over time) |
| ov02 | 300 | Energy/health (decreases over time) |
| ov05 | 1 | Unknown flag |
| ov06 | rand 0 1 | Random initial direction bias |
| ov07 | 0 or 1 | Type flag: 0=worker, 1=queen |
| ov10 | 1 | Horizontal direction: 1=right, -1=left |
| ov11 | -1 | Vertical direction: 1=down, -1=up |
| ov12 | 0 | Current horizontal velocity component |
| ov13 | 0 | Current vertical velocity component |
| ov16 | null | Current target agent (food, hive, or attack target) |
| ov17 | null | Attacker reference (who to attack) |
| ov19 | ownr (hive) | Parent hive reference |
| ov20 | 0 | Egg counter (incremented when age > 2010) |
| ov61 | 40 or 41 | Smell: 40=worker bee, 41=queen bee |
| ov72 | 400 | Food energy gained when eating |
| ov73 | 400 | Hunger threshold (below this: seek food) |
| ov74 | 800 | Full threshold (above this: return to hive) |
| ov80 | ov82 from hive | Honey amount delivered to hive on return |
| ov88 | 0 or 90 | Attack timer (counts down, attacks when > 80) |
| ov89 | 0 or 1 | Kamikaze flag (1 = die after attacking) |

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | Bee is pushed by another agent |
| Timer | 9 | Main AI behavior loop |
| Collision | 6 | Bee collides with a wall or object |
| Eat | 12 | Bee is eaten by a creature |

### Push (Event 1) - Aggression Propagation

When a bee is pushed, it:
- Sets the pusher as its attack target (ov17)
- Starts an attack timer (ov88 = 90)
- Sets kamikaze flag (ov89 = 1)
- Sends stimulus 88 to the pusher (pain/sting)

### Timer (Event 9) - Main AI Loop

The timer script is the core behavior engine for bees. Each tick:

1. **Aging**: ov01 increases by 1, ov02 decreases by 1
2. **Drowning check**: If not carried and in an aquatic room (rtyp 8 or 9), loses 100 extra energy
3. **Sound**: 1 in 251 chance of playing "beez" sound
4. **Queen behavior**: If ov07=1, executes queen-specific behavior (seeking other hives to colonize)
5. **Egg production**: When age > 2010, increments ov20 every 10 ticks
6. **Hunger check**: If ov02 < ov74, set state to nest (2). If ov02 < ov73, set state to get food (1)
7. **Death check**: If ov00 = 99, execute death subroutine
8. **Attack behavior**: If ov17 is set and ov88 > 0, counts down attack timer. When ov88 > 80, actively attacks. When ov88 reaches 0, clears attacker reference.
9. **State machine execution**:
   - **State 0 (roam)**: Random movement with obstacle avoidance
   - **State 1 (get food)**: Seeks nearest food (family 2, genus 7, species 0), eats it on contact (sends message 303), transitions to nest if full
   - **State 2 (nest)**: Returns to parent hive. On contact, delivers ov80 honey to hive's ov02, then self-destructs (kill targ)
   - **State 99 (die)**: Creates a dead bee remain (2 10 21) and kills self

#### Subroutines

| Subroutine | Description |
|---|---|
| `roam` | Random direction changes with obstacle avoidance |
| `gfod` | Find and pursue nearest food source (2 7 0) |
| `nest` | Return to parent hive and deliver honey |
| `atak` | Attack mode - pursue attacker, propagate alarm to nearby bees from same hive |
| `quen` | Queen behavior - seek other hives (2 17 5) to colonize |
| `bnst` | Queen colonization - reactivates a dormant hive (sets tick 30) and self-destructs |
| `die_` | Death sequence - spawns dead bee remain (2 10 21) and kills self |
| `obst` | Obstacle avoidance - checks distances to walls and adjusts direction |
| `vect` | Velocity calculation - smoothly adjusts velocity toward target direction |
| `anim` | Animation selection based on horizontal movement direction |
| `move` | Apply calculated velocity to the bee |
| `find` | Find nearest agent of specified classifier (uses distance squared comparison) |
| `fnd2` | Find nearest agent of specified classifier, excluding own hive |
| `swm2` | Swarm behavior - adjusts movement based on nearby bee positions |
| `hunt` | Pursue a target agent by adjusting direction toward it |
| `near` | Proximity check against target agent |

### Collision (Event 6)

Resets velocity components (ov12, ov13) to 0 when the bee hits an obstacle.

### Eat (Event 12)

When eaten by a creature:
- Delivers **stimulus 80** to the eater (bee sting - likely pain/injury)
- Kills the bee (kill ownr)

**Stimulus Impact**: Eating a bee is harmful to creatures due to the sting stimulus.

---

## Dead Bee (2 10 21)

Dead bee remains are created when a bee dies. They are simple agents using the "bee" sprite with 26 frames, subject to gravity (accg 2) and friction (fric 100). They have a limited lifespan and decay into nutrients.

### Properties

- `accg 2` (affected by gravity), `aero 0`, `elas 0`, `fric 100`
- `attr 195` (visible, carryable), `tick 50`
- ov02 starts at 50 (decay timer)
- ov61 = 10 (smell: dead animal/detritus)
- ov10: preserves the direction the bee was facing when it died

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Decay countdown |
| Collision | 6 | Update animation on bounce |

### Timer (Event 9) - Decay

Each tick, ov02 decreases by 1. When ov02 reaches 0 or below:
- If not carried and in a valid room, releases nutrients into the room:
  - **Room CA 3** (nutrient): +0.1
  - **Room CA 4** (nutrient): +0.1
- Kills itself

**Room CA Impact**: Dead bees enrich the local environment with nutrients (CA 3 and CA 4), supporting the ecosystem cycle.

### Collision (Event 6)

Decrements ov02 by 1 and updates the death animation based on the stored direction (ov10): uses base frame ov33 (facing left) or ov44 (facing right).

---

## Removal Script

The removal script (rscr) cleans up all bee ecosystem agents:
1. Kills all bees (2 14 1) and removes their scripts (events 9, 6)
2. Kills all dead bees (2 10 21) and removes their scripts (events 9, 6)
3. Kills all bee hives (2 17 5) and removes their scripts (events 9, 6)
