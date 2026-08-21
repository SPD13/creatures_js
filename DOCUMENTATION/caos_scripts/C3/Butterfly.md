# Butterfly.cos - Butterfly & Caterpillar Lifecycle Ecosystem

**Source**: `Assets/Bootstrap/001 World/Butterfly.cos`

## Overview

This script implements the complete butterfly lifecycle ecosystem for the Creatures 3 world. It creates caterpillars that find and climb plants to feed, metamorphose through a cocoon stage, and emerge as adult butterflies. Adult butterflies roam, feed on seeds, flock together during Summer, and lay eggs on plants — completing a full biological lifecycle.

The ecosystem serves as a critter-level ecological component: caterpillars consume plants (2 4 0), butterflies pollinate by seeking seeds (2 7 0) and laying eggs near plants (2 6 0), and dead specimens decompose to release water and nutrients back into the room environment. Creatures can interact with both caterpillars and butterflies, receiving "eaten animal" stimulus feedback.

At bootstrap, 8 caterpillars are created: 4 in cocoon state (near maturity, will quickly emerge as butterflies) and 4 as active young caterpillars. This seeds the world with both immediate butterflies and a growing caterpillar population.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 13 2 | Caterpillar | `caterpillar` frame 0 | Larval stage — finds plants, climbs, eats, morphs into cocoon, emerges as butterfly | [Detail](#caterpillar-2-13-2) |
| 2 13 1 | Butterfly | `caterpillar` frame 11 | Adult stage — roams, feeds on seeds, flocks in Summer, lays eggs on plants | [Detail](#butterfly-2-13-1) |
| 2 18 2 | Butterfly Egg | `caterpillar` frame 1 | Laid by butterflies on plants; hatches into new caterpillars | [Detail](#butterfly-egg-2-18-2) |
| 2 10 11 | Dead Butterfly | `caterpillar` frame 4 | Decomposing butterfly corpse; releases water and nutrients | [Detail](#dead-butterfly-2-10-11) |
| 2 10 12 | Dead Caterpillar | `caterpillar` frame 14 | Decomposing caterpillar corpse; releases water and nutrients | [Detail](#dead-caterpillar-2-10-12) |

---

## Caterpillar (2 13 2)

The caterpillar is the larval stage of the butterfly lifecycle. It walks along surfaces searching for plants to climb and eat, then metamorphoses through a cocoon stage before emerging as an adult butterfly. The caterpillar uses a complex state machine with 9 distinct behavioral states covering its entire lifecycle from hatching to metamorphosis.

### Bootstrap Configuration

Two groups of 4 caterpillars are created at startup with different configurations:

| Group | Count | Initial State | Age (`ov01`) | Energy (`ov02`) | Physics | Purpose |
|---|---|---|---|---|---|---|
| Cocoon Set | 4 | `ov00=6` (Cocoon) | 5990 (near maturity) | 600 | accg 3, fric 80, elas 5 | Will quickly emerge as butterflies |
| Active Set | 4 | `ov00=0` (Find Plant) | 10 (young) | 300 | accg 2, fric 0, aero 30, elas 80 | Active young caterpillars |

Both groups are placed at random positions (x: 1500-2000, y: 700) with random facing direction.

### Properties

| Property | Value (Cocoon Set) | Value (Active Set) | Notes |
|---|---|---|---|
| `attr` | 195 | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `perm` | 99 | 99 | Nearly impassable permeability |
| `accg` | 3 | 2 | Gravity |
| `fric` | 80 | 0 | Cocoons stick; active caterpillars slide |
| `aero` | (default) | 30 | Active caterpillars have air resistance |
| `elas` | 5 | 80 | Active caterpillars bounce more |
| `tick` | 8 | 8 | Timer interval |
| `bhvr` | 16 | 16 | Creatures can pick up |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0=Find Plant, 1=Climb Plant, 2=Eat, 3=Ready (descend), 4=Morph, 5=Transition, 6=Cocoon, 7=Select Plant, 99=Die |
| `ov01` | Age counter | Increments each tick |
| `ov02` | Energy level | Decrements each tick; gained by eating |
| `ov10` | X direction | -1=Left, 1=Right |
| `ov11` | Y direction | -1=Up, 0=None, 1=Down |
| `ov16` | Target agent | Reference to current plant target |
| `ov30`-`ov35` | Animation bases | Frame offsets for 6 directional walk animations |
| `ov36` | Animation offset | Added to ov30-ov35 for final frame index |
| `ov37` | Morph anim base (left) | 108 |
| `ov38` | Morph anim base (right) | 123 |
| `ov39` | Reserved animation base | 128 |
| `ov61` | CA smell emission | 40 (active) / 20 (egg-born) |
| `ov72` | Food threshold (full) | 200 (cocoon set) / 400 (active set) |
| `ov73` | Energy gain per eat | 250 |
| `ov74` | Upper energy threshold | 350 |
| `ov77` | Pickup flag | Set to 1 on pickup, cleared on drop |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: state machine for full caterpillar lifecycle |
| 4 | Pickup | Creature or agent picks up caterpillar |
| 5 | Drop | Caterpillar is dropped |
| 6 | Collision | Collision event handling |
| 12 | Eat | Caterpillar is consumed by another agent |
| 257 | Custom (No Plants) | Self-message when no plants exist; falls off and resets |

#### Event 9 — Timer (Main Behavior Loop)

The caterpillar's AI runs every 8 ticks through a multi-state lifecycle:

**Common logic (all states):**
1. Sets friction to 80 (reapplied each tick).
2. Increments age (`ov01 += 1`) and decrements energy (`ov02 -= 1`), except in Cocoon state (6) where energy is preserved.
3. **Water hazard**: In fresh water (room type 8) or salt water (room type 9) rooms, drains energy rapidly (`ov02 -= 100`).
4. **Death check**: If `ov00 = 99`, transitions to death subroutine.
5. **Elasticity adjustment**: Sets `elas 5` when ground is nearby (obst 3 > 4), otherwise `elas 80` for bouncing.

**State 0 — Find Plant** (subroutine `gplt`):
1. Searches for the nearest plant (2 4 0) within visual range using squared-distance comparison.
2. If found, moves toward it (`hunt` subroutine).
3. Upon touching the plant, transitions to State 1 (Climb Plant).
4. If no plants found, roams randomly.

**State 1 — Climb Plant** (subroutine `goup`):
1. Checks plant availability (`cplt` subroutine — counts all 2 4 0 and 2 5 0 agents; if none, sends message 257 to self).
2. Targets the plant and reads its top/bottom position.
3. Sets own plane above the plant's plane (`plne + 1`) so caterpillar renders in front.
4. Disables gravity (`accg 0`) and moves upward toward the plant's top.
5. When reaching the top (`post < plant top`), transitions to State 2 (Eat).

**State 2 — Eat** (subroutine `eat_`):
1. Remains at the plant, gaining `ov73` (250) energy each tick.
2. When energy exceeds `ov72` (food threshold), transitions to State 3 (Ready to descend).
3. If the plant disappears, transitions to State 7 (Select Plant) and restores gravity.

**State 3 — Ready / Descend** (subroutine `redy`):
1. Checks plant availability (`cplt`).
2. Moves downward along the plant, heading toward the plant's bottom position.
3. When reaching the base (`posy > plant top`), transitions to State 4 (Morph).

**State 4 — Morph** (subroutine `morf`):
1. Checks plant availability (`cplt`).
2. Plays the metamorphosis animation:
   - Facing left: base `ov37` (108), frames [0 1 2 3 4]
   - Facing right: base `ov38` (123), frames [0 1 2 3 4]
3. Waits for animation to complete (`over`).
4. Restores gravity (`accg 3`).
5. Transitions to State 6 (Cocoon).

**State 6 — Cocoon** (subroutine `bfly`):
1. Waits for age to exceed 500 ticks.
2. Checks butterfly population (`totl 2 13 1 < 25`).
3. Checks nearby butterfly count (`esee 2 13 1`, max 2 within range 600).
4. If conditions met, creates a new **Butterfly** (2 13 1) at the cocoon's position:
   - Initial state: `ov00=10` (Go Up — butterfly flies upward on emergence)
   - Energy: 600, Age: 500
   - Physics: elas 20, aero 10, perm 49
5. The caterpillar destroys itself (`kill targ`), completing the metamorphosis.

**State 7 — Select Plant** (subroutine `sele`):
1. Finds a random plant (2 4 0) using `rtar`.
2. Moves toward it.
3. Upon touching, transitions to State 1 (Climb Plant).
4. If no plant found, transitions to State 0 (Find Plant).

**State 99 — Die** (subroutine `die_`):
1. Records current position and facing direction.
2. Creates a **Dead Caterpillar** (2 10 12) at the current position.
3. Dead caterpillar faces left (pose 0) or right (pose 7) based on caterpillar's direction.
4. Destroys itself (`kill ownr`).

#### Event 4 — Pickup

When picked up by a creature or agent:
1. Sets pickup flag (`ov77 = 1`).
2. Stops timer (`tick 0`).
3. Increases gravity (`accg 6`) and removes air resistance (`aero 0`).

#### Event 5 — Drop

When dropped:
1. Restores gravity (`accg 3`).
2. If pickup flag is set (`ov77 = 1`): clears flag, restarts timer (`tick 8`), stops processing.
3. If in Cocoon state (6): shows cocoon pose based on facing direction.
4. If in any other state: shows resting pose, transitions to State 7 (Select Plant).

#### Event 6 — Collision

When colliding with something while in Cocoon state (6): displays the cocoon pose based on facing direction.

#### Event 12 — Eat

When consumed by another agent:
1. Sends **stimulus 80** (`STIM_EATEN_ANIMAL`) with intensity 1 to the consuming agent.
2. Destroys itself (`kill ownr`).

#### Event 257 — No Plants Available

Self-triggered when the `cplt` check finds no plants (2 4 0 or 2 5 0) in the world:
1. Restores gravity (`accg 3`), stops vertical velocity.
2. If in Cocoon state (6): shows cocoon pose.
3. If in any other state: shows resting pose, transitions to State 7 (Select Plant) to try again later.

---

## Butterfly (2 13 1)

The butterfly is the adult stage of the lifecycle, created when a caterpillar emerges from its cocoon. Butterflies fly around the world, feed on seeds, flock together during Summer, and lay eggs on plants to produce the next generation of caterpillars.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `perm` | 49 | Can pass through most barriers (flying) |
| `tick` | 15 | Timer interval |
| `aero` | 10 | Moderate air resistance |
| `elas` | 20 | Low-moderate bounce |
| `bhvr` | 16 | Creatures can pick up |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Get Food, 2=Flock, 3=Display, 4=Lay Eggs, 10=Go Up, 99=Die |
| `ov01` | Age counter | Starts at 500 (from cocoon) or 5990 (bootstrap); increments each tick |
| `ov02` | Energy level | Starts at 600; decrements each tick |
| `ov10` | X direction | -1=Left, 1=Right |
| `ov11` | Y direction | -1=Up, 0=None |
| `ov16` | Target agent | Current food source or plant for egg-laying |
| `ov30`-`ov36` | Animation bases | Frame offsets for directional flight animations |
| `ov37` | Animation base | 108 |
| `ov38` | Animation base | 123 |
| `ov39` | Animation base | 128 |
| `ov61` | CA smell emission | 50 |
| `ov70` | Mating state | 0=Unmated, 1=Found partner (ready to lay), 2=Has laid eggs |
| `ov72` | Hunger threshold | 200 — below this, seek food |
| `ov73` | Energy gain on feeding | 250 |
| `ov74` | Full energy threshold | 350 — above this, stop feeding |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: roaming, feeding, flocking, mating, egg-laying |
| 12 | Eat | Butterfly is consumed by another agent |

#### Event 9 — Timer (Main Behavior Loop)

The butterfly's AI runs every 15 ticks (set at creation; may vary) through a seasonal behavior cycle:

**Common logic (all states):**
1. Increments age (`ov01 += 1`) and decrements energy (`ov02 -= 1`).
2. **Water hazard**: In fresh water (room type 8) or salt water (room type 9) rooms and not carried, drains energy rapidly (`ov02 -= 100`).
3. **Obstacle avoidance**: Checks distances to walls in all 4 directions:
   - Left obstacle < 30: turns right (`ov10 = 1`), moves up (`ov11 = -1`)
   - Right obstacle < 30: turns left (`ov10 = -1`), moves up (`ov11 = -1`)
   - Ceiling < 30: stops upward movement (`ov11 = 0`)
   - Floor < 30: moves up (`ov11 = -1`)
4. **Water room escape**: In fresh water room (type 8) and not carried, drains extra energy (`ov02 -= 50`), forces upward movement with random upward velocity.
5. **Death check**: If age > 6000 or energy <= 0, sets state to Die (99).

**State 0 — Roam** (subroutine `roam`):
Wanders randomly. On a 1-in-30 chance, flips horizontal direction; on a 1-in-30 chance, flips vertical direction. Applies velocity and animation.

**State 1 — Get Food** (subroutine `gfod`):
1. Searches for the nearest seed/fruit agent (2 7 0) within visual range.
2. Moves toward target using `hunt` subroutine.
3. Upon touching the food:
   - Sends **message 303** to the food (feeding interaction).
   - Gains `ov73` (250) energy.
   - If energy exceeds `ov74` (350), returns to Roam state (0).
4. If target disappears, returns to Roam.

**State 2 — Flock** (subroutine `flok`):
Triggered when energy is above `ov73` (250), mating state is 0, and it is **Summer** (`sean = 1`).
1. Finds a random butterfly (2 13 1) and moves toward it.
2. Enumerates all nearby butterflies (2 13 1) using `etch`:
   - If other butterflies found (`va60 > 0`): adjusts direction to converge on the flock.
   - Sets mating state to 1 (`ov70 = 1`) — ready to reproduce.
3. Once mated (`ov70 = 1`), transitions to State 3 (Display).

**State 3 — Display** (subroutine `disp`):
Brief transition state. Clears target and transitions to State 4 (Lay Eggs).

**State 4 — Lay Eggs** (subroutine `layg`):
Only proceeds if mating state is 1 (`ov70 = 1`).
1. Searches for the nearest plant (2 6 0) within visual range.
2. If no plant found, roams instead.
3. Moves toward target plant.
4. Upon touching the plant:
   - Checks nearby egg count (`esee 2 18 2`, range 600).
   - If 2 or fewer eggs nearby, creates a **Butterfly Egg** (2 18 2) near the plant.
   - Sets mating state to 2 (`ov70 = 2`) — has laid eggs.
   - Returns to Roam state (0).
5. If the plant disappears, returns to Roam.

**State 10 — Go Up** (subroutine `goup`):
Initial state for newly emerged butterflies. Flies upward, randomly adjusting horizontal direction. When far enough from the ground (`obst down > 300`), transitions to State 2 (Flock) to begin normal behavior.

**State 99 — Die** (subroutine `die_`):
1. Records current position and facing direction.
2. Creates a **Dead Butterfly** (2 10 11) at the current position.
3. Dead butterfly physics: accg 3, fric 100, elas 0, aero 10, perm 99.
4. Destroys itself (`kill targ` / `kill ownr`).

#### Event 12 — Eat

When consumed by another agent:
1. Sends **stimulus 80** (`STIM_EATEN_ANIMAL`) with intensity 1 to the consuming agent.
2. Destroys itself (`kill ownr`).

---

## Butterfly Egg (2 18 2)

Butterfly eggs are laid by adult butterflies on or near plants. They remain dormant for a period, then hatch into a batch of new caterpillars. The egg regulates caterpillar population by spawning more when the population is low.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `accg` | 3 | Normal gravity |
| `elas` | 1 | Minimal bounce |
| `fric` | 100 | Maximum friction (stays put) |
| `perm` | 50 | Moderate permeability |
| `tick` | 4 | Fast timer (incubation counter) |
| `bhvr` | 0 | No creature interactions |
| `ov01` | 0 | Incubation counter |
| `ov61` | 20 | CA smell emission |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Incubation countdown and hatching |

#### Event 9 — Timer (Incubation & Hatching)

Each tick increments the incubation counter (`ov01`). When `ov01 > rand 80 300` (random incubation period of 80-300 ticks):

1. **Population check**: Counts existing caterpillars (`totl 2 13 2`).
   - If fewer than 8 caterpillars exist: spawns up to **5** new caterpillars.
   - If 8 or more exist: spawns up to **2** new caterpillars.
2. **Local density check**: For each spawn attempt, counts nearby caterpillars (`esee 2 13 2`, range 600). Only spawns if 4 or fewer are nearby.
3. **New caterpillars** (2 13 2) are created at the egg's position with:
   - State: `ov00=0` (Find Plant), Age: `ov01=500` (pre-aged), Energy: `ov02=600`
   - Physics: accg 3, perm 99, tick 8, attr 195, bhvr 16
   - Same animation frame setup as bootstrap caterpillars
4. The egg destroys itself after hatching (`kill targ`).

---

## Dead Butterfly (2 10 11)

A decomposing butterfly corpse created when a butterfly dies. It lies on the ground, plays a decay animation, releases environmental nutrients, and disappears.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `accg` | 3 | Gravity |
| `fric` | 100 | Maximum friction |
| `elas` | 0 | No bounce |
| `aero` | 10 | Some air resistance |
| `perm` | 99 | Nearly impassable |
| `tick` | 4 | Fast decomposition timer |
| `ov01` | 0 | Decomposition counter |
| `ov10` | inherited | Facing direction from parent butterfly |
| `ov61` | 10 | CA smell emission |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition countdown, nutrient release, self-destruction |

#### Event 9 — Timer (Decomposition)

Each tick increments the counter (`ov01`). After 50 ticks and if not being carried:

1. Plays decomposition animation (frames [0 1 2 3]) regardless of facing direction.
2. **Releases nutrients into the room** (if in a valid room and not carried):
   - `altr room targ 3 0.1` — Increases room **CA 3 (Water)** by 0.1
   - `altr room targ 4 0.1` — Increases room **CA 4 (Nutrient)** by 0.1
3. Waits for animation to complete (`over`).
4. Destroys itself (`kill ownr`).

---

## Dead Caterpillar (2 10 12)

A decomposing caterpillar corpse created when a caterpillar dies. Simpler than the dead butterfly — it decomposes immediately when its timer fires and it is not being carried.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `accg` | 3 | Gravity |
| `fric` | 100 | Maximum friction |
| `elas` | 0 | No bounce |
| `aero` | 10 | Some air resistance |
| `perm` | 50 | Moderate permeability |
| `tick` | 200 | Slow timer (long before decomposition) |
| `ov10` | inherited | Facing direction from parent caterpillar |
| `ov61` | 10 | CA smell emission |

### Sprite Variants

| Source Direction | Pose | Notes |
|---|---|---|
| Facing left (`ov10 <= 0`) | 0 | Left-facing dead caterpillar |
| Facing right (`ov10 > 0`) | 7 | Right-facing dead caterpillar |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Nutrient release and self-destruction |

#### Event 9 — Timer (Decomposition)

When the timer fires and the caterpillar is not being carried:

1. **Releases nutrients into the room** (if in a valid room and not carried):
   - `altr room targ 3 0.1` — Increases room **CA 3 (Water)** by 0.1
   - `altr room targ 4 0.1` — Increases room **CA 4 (Nutrient)** by 0.1
2. Destroys itself (`kill ownr`).

---

## Removal Script (rscr)

The removal script cleanly uninstalls the butterfly ecosystem:

1. Kills all existing butterflies (`enum 2 13 1 → kill targ`) and removes scripts.
2. Kills all dead butterflies (`enum 2 10 11 → kill targ`) and removes scripts.
3. Kills all dead caterpillars (`enum 2 10 12 → kill targ`) and removes scripts.
4. Kills all butterfly eggs (`enum 2 18 2 → kill targ`) and removes scripts.
5. Kills all caterpillars (`enum 2 13 2 → kill targ`) and removes all scripts (Timer 9, Collision 6, Custom 257).

---

## Lifecycle Diagram

```
 Bootstrap creates 8 caterpillars
 (4 cocoons + 4 active)
            │
            ▼
┌─────────────────────┐
│   Caterpillar       │
│   (2 13 2)          │
│                     │
│ Find Plant → Climb  │
│ → Eat → Descend →   │
│ Morph → Cocoon      │──── dies ────►┌──────────────────┐
│                     │               │ Dead Caterpillar  │
│ ov00: 0→1→2→3→4→6  │               │ (2 10 12)         │
└──────────┬──────────┘               │ +Water CA +0.1    │
           │ age > 500                │ +Nutrient CA +0.1 │
           │ (emerges from cocoon)    └──────────────────-┘
           ▼
┌─────────────────────┐
│   Butterfly         │
│   (2 13 1)          │
│                     │
│ Go Up → Roam →      │
│ Feed (seeds 2 7 0)  │──── dies ────►┌──────────────────┐
│         │           │               │ Dead Butterfly    │
│    Summer (sean=1)  │               │ (2 10 11)         │
│         │           │               │ +Water CA +0.1    │
│    Flock → Display  │               │ +Nutrient CA +0.1 │
│         │           │               └──────────────────-┘
│    Lay Eggs         │
│  (on plants 2 6 0)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Butterfly Egg     │
│   (2 18 2)          │
│                     │
│ Incubation:         │
│ 80-300 ticks        │
│                     │
│ Hatches 2-5 new     │───────► (back to Caterpillar)
│ caterpillars        │
└─────────────────────┘
```

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 80 | `STIM_EATEN_ANIMAL` | Butterfly is consumed (event 12) | Creature receives "eaten animal" biochemical feedback |
| 80 | `STIM_EATEN_ANIMAL` | Caterpillar is consumed (event 12) | Creature receives "eaten animal" biochemical feedback |

## Room CA Effects

| CA Index | Name | Source | Change | Ecological Role |
|---|---|---|---|---|
| 3 | Water | Dead butterfly/caterpillar decomposition | +0.1 | Returns moisture to the environment |
| 4 | Nutrient | Dead butterfly/caterpillar decomposition | +0.1 | Enriches soil for plant growth |

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 7 0 | Message 303 (feeding) | Butterfly feeds on seeds |
| 2 4 0 | Proximity (climbing/eating) | Caterpillar climbs and eats plants |
| 2 5 0 | Existence check | Caterpillar checks for plants (along with 2 4 0) |
| 2 6 0 | Proximity (egg-laying) | Butterfly lays eggs near these plants |

## Seasonal Behavior

| Season | `sean` Value | Butterfly Behavior |
|---|---|---|
| Spring | 0 | Roam and feed only |
| Summer | 1 | Flock, mate, and lay eggs |
| Autumn | 2 | Roam and feed only |
| Winter | 3 | Roam and feed only |

Reproduction only occurs during Summer, creating a seasonal population cycle where caterpillar numbers peak in late Summer/Autumn as eggs hatch, and butterfly numbers peak the following season as those caterpillars mature.
