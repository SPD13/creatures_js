# Creature Breeding

**Source file:** `Bootstrap/001 World/creatureBreeding.cos`

## Overview

This script implements the entire creature breeding lifecycle in Creatures 3: mating courtship, egg laying, egg incubation/hatching, and multiple-birth probability. It sets up global game variables controlling twin/multiple birth chances, defines timer-driven egg maturation for both fertilized and unfertilized eggs, and scripts the creature-to-creature mating interaction including compatibility checks, population caps, and kiss/mate animations. It also handles egg laying as an involuntary creature action, creating the appropriate egg type (Norn, Grendel, or Ettin) with genetic transfer.

## Game Variables Set

| Variable | Value | Description |
|---|---|---|
| `engine_multiple_birth_first_chance` | 0.04 | 4% chance of twins |
| `engine_multiple_birth_subsequent_chance` | 0.01 | 1% chance of each additional baby |
| `engine_multiple_birth_maximum` | 6 | Maximum babies per birth |
| `engine_multiple_birth_identical_chance` | 0.5 | 50% chance multiples are identical |

## Agents Involved

This script does not create new agents. It defines **behavior scripts** for existing egg and creature agents. The eggs (3 4 0, 3 4 1, 3 4 2, 3 4 3) are created by other scripts (Norn Egg layer, Grendel and Ettin Egg maker) and by the egg-laying behavior defined here. Creatures (4 0 0) are created by the hatching process.

| Classifier | Agent | Role |
|---|---|---|
| [3 4 0](#unfertilized-egg-3-4-0) | Unfertilized Egg | Egg incubation, hatching, pickup behavior |
| [3 4 1](#fertilized-norn-egg-3-4-1) | Fertilized Norn Egg | Norn egg incubation, hatching with population caps |
| [3 4 2](#grendel-egg-3-4-2) | Grendel Egg | Collision plane correction |
| [3 4 3](#ettin-egg-3-4-3) | Ettin Egg | Collision plane correction |
| [4 0 0](#creature-4-0-0) | Creature (all species) | Mating courtship, mating, egg laying |

---

## Unfertilized Egg (3 4 0)

Unfertilized eggs are laid by Grendel and Ettin mothers. They incubate over time through a growth cycle and eventually hatch into a new creature.

### Events

| Event | Type | Description |
|---|---|---|
| 1000 | Custom message | Hatch trigger from external system |
| 9 | TIMER | Egg incubation and growth cycle |
| 255 | AGENTEXCEPTION | Death/cleanup - sets final pose and schedules removal |
| 4 | PICKUP | Picked up by creature - adjusts hotspot and sends stimulus |

### Event 1000 - External Hatch Trigger

Creates a new creature from the egg using `newc`. The new creature inherits genetics from the egg, is set to dreaming state, and is placed into the carrier's hands via `spas`. After a wait period, the carrier reference is cleared, and the script waits for the carrier to finish its current action before sending message 3001 and destroying itself.

- Sets creature physics: `accg`, `bhvr`, `perm` from game variables
- Emits CA smell (11 + genus number) at intensity 0.5
- New creature starts in dreaming state (`drea 1`)

### Event 9 - Timer (Incubation Cycle)

Manages the egg growth and hatching process:

1. **Death check**: If pose is 6 (empty shell), kills the egg
2. **Environment check**: Stops timer if in room type 8 or 9 (space/airlock) - eggs don't develop in vacuum
3. **Carried/falling check**: Pauses development if being carried or falling
4. **Growth phase** (pose < 3): Increments pose by 1 each timer tick (pose 0 → 1 → 2 → 3), timer every 100 ticks
5. **Hatching phase** (pose >= 3): Requires `ov99 >= 2` (two timer cycles at maturity) before hatching:
   - Checks total creature population against `c3_max_creatures`
   - Disables carryability during hatch
   - Creates creature with `new: crea 4`
   - Plays cracking animation and sound
   - Emits CA smell 13 (Grendel) or 14 (Ettin) based on genus
   - Positions creature at egg location, calls `born`
   - Sets egg to empty shell pose (6)

### Event 255 - Agent Exception/Cleanup

Sets pose to 6 (empty shell) and schedules removal timer of 200 ticks.

### Event 4 - Pickup

When picked up by a non-pointer agent:
- Adjusts the pickup hotspot position based on current pose
- If picked up by a creature (family 4), sends **stimulus 93** to the creature

---

## Fertilized Norn Egg (3 4 1)

Fertilized Norn eggs have a more elaborate hatching sequence with cracking animations, population checks for both Norns specifically and creatures overall, and a multi-stage cracking animation with sound effects.

### Events

| Event | Type | Description |
|---|---|---|
| 9 | TIMER | Egg incubation with population-controlled hatching |
| 255 | AGENTEXCEPTION | Death/cleanup - sets final pose and schedules removal |

### Event 9 - Timer (Incubation Cycle)

More elaborate than unfertilized eggs:

1. **Assertions**: Debug checks that `c3_max_norns > 0`, `c3_max_creatures > 0`, and `c3_max_norns <= c3_max_creatures`
2. **Death check**: If pose is 7 (empty shell), kills the egg
3. **Environment check**: Pauses in room types 8/9 (space/airlock)
4. **Carried/falling check**: Pauses if being carried or falling
5. **Growth phase** (pose < 3): Increments pose each tick; at pose 3, plays wobbling animation sequence
6. **Population checks**: Separately checks:
   - Live Norns (genus 1) against `c3_max_norns` - rechecks every 1200 ticks if at cap
   - Live creatures (all) against `c3_max_creatures` - rechecks every 1200 ticks if at cap
7. **Hatching sequence** (when population allows):
   - Disables egg carryability
   - Creates creature with `new: crea 4` using egg's genetics
   - New creature starts in dreaming state
   - Plays 5 rounds of cracking animation (`anim`) with "crak" sound effects and varying wait times
   - Records egg position, sets egg to empty shell pose (7), fades egg out
   - Moves newborn to egg position, sets pose 75 (newborn), wakes from sleep, calls `born`
   - Egg schedules self for delayed removal (tick 200)

**Stimulus impact**: Stimulus 45 (mated) applied during mating, not hatching.

### Event 255 - Agent Exception/Cleanup

Sets pose to 7 (empty shell) and schedules removal timer of 200 ticks.

---

## Grendel Egg (3 4 2)

### Events

| Event | Type | Description |
|---|---|---|
| 6 | COLLISION | Ensures rendering plane is at least 1000 |

### Event 6 - Collision

When the egg collides with something, ensures its rendering plane (`plne`) is at least 1000. This prevents the egg from rendering behind background elements after bouncing.

---

## Ettin Egg (3 4 3)

### Events

| Event | Type | Description |
|---|---|---|
| 6 | COLLISION | Ensures rendering plane is at least 1000 |

### Event 6 - Collision

Identical behavior to Grendel egg - ensures rendering plane is at least 1000 on collision.

---

## Creature (4 0 0)

Defines the mating courtship, copulation, and egg-laying behaviors for all creature species.

### Events

| Event | Type | Description |
|---|---|---|
| 33 | INTROACT1 | Mating approach trigger - forwards to event 34 |
| 34 | INTROACT2 | Full mating courtship and copulation logic |
| 200 | DONATESPERM | Receive mate request from partner |
| 65 | INVOLUNTARY1 | Egg laying (involuntary action) |

### Event 33 - Mating Approach Trigger

Simple forwarding script: sends message 34 to self to begin the mating courtship sequence.

### Event 34 - Mating Courtship and Copulation

The core mating behavior, triggered when a creature decides to mate with `_it_` (the target creature):

1. **Approach**: Creature approaches the target (`appr`)
2. **Null check**: Stops if target is null
3. **Gender display**: Sets pose 37 (mating display)
4. **Species compatibility**:
   - If different genus (e.g., Norn vs Grendel): rejected, **stimulus 0** (pain), random rejection pose (39 or 45)
   - If same species (same `spcs` value): rejected (inbreeding prevention), **stimulus 0** (pain)
5. **Readiness scoring** (va05, max 4):
   - Target sex drive (`driv 13`) > 0.15: +1
   - Target sexually mature (`cage >= 2`): +1
   - Self sex drive > 0.15: +1
   - Self sexually mature: +1
6. **Fertility check**: `byit` must be non-zero (creature can reproduce)
7. **Target state**: Target must not be dead or asleep
8. **Full readiness** (va05 == 4):
   - Plays "kis2" sound (passionate kiss)
   - Sends message 0 to target (deactivate/acknowledge)
   - **Population cap check**: Checks total live creatures against `c3_max_creatures` and live Norns against `c3_max_norns`
   - If under cap and species == 1 (Norn female): calls `mate` directly
   - If under cap and other species: plays mating animation, sends message 200 (DONATESPERM) to target
   - **Stimulus 45** (mated successfully) applied to both creatures
9. **Partial readiness** (va05 < 4):
   - Plays "kis1" sound (light kiss)
   - **Stimulus 13** (start hold hands / partial arousal) applied to self
10. **Cooldown**: Wait 15 ticks, pose 12 (standing), wait 20 ticks

### Event 200 - Donate Sperm

Simple response to a mate request from the partner creature. Calls `mate` to complete fertilization.

### Event 65 - Egg Laying (Involuntary Action)

Triggered as an involuntary creature action when a pregnant creature is ready to lay an egg:

1. **Latency**: Sets latency of 8 ticks, category 64 (prevents rapid re-triggering)
2. **Movement check**: Stops if creature is currently moving
3. **Genome check**: Verifies creature has egg genome data available (`gtos 1 != ""`)
4. **Laying animation**: Poses 108 → 109 (laying poses)
5. **Egg creation** based on genus:
   - Genus 2 (Grendel): Creates `3 4 2` using "greneggmask" sprite, 7 images, 1 frame offset
   - Genus 3 (Ettin): Creates `3 4 3` using "greneggmask" sprite, 7 images, 8 frame offset
   - Genus 1 (Norn): Creates `3 4 1` using "eggs" sprite, 8 images, season-based frame offset
6. **Egg properties**: elas 10, fric 100, attr 195 (carryable/mouseable/physics), bhvr 32, aero 10, accg 4, perm 60
7. **Norn smell**: Norn eggs emit CA smell 11 at intensity 0.65
8. **Genetic transfer**: `gene move` transfers genes from mother to egg
9. **Season-based appearance** (ov01): Determines egg appearance based on current season (`sean`):
   - Spring (0): Random 0 or 2
   - Autumn (2): Random 0 or 1
   - Winter (1/3): 0
10. **History events**: Records egg-laid event (11) and was-laid event (12) in creature history
11. **Stimulus 29** (egg laid) applied to mother
12. **Post-laying**: Mother plays pose 110, waits 60 ticks

## Remove Script

The remove script (`rscr`) kills all unfertilized eggs (3 4 0) when this COS file is unloaded.
