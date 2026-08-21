# Dragonfly

## Overview

This script implements a complete dragonfly ecosystem with a full lifecycle: adult dragonflies fly, roam, hunt insects, seek mates, and lay eggs near water. Eggs hatch into aquatic nymphs that feed, climb plants, pupate in a cocoon, and emerge as new adult dragonflies. Dead dragonflies and nymphs decompose and release nutrients into the room's CA system. The script creates four initial populations — two groups of adults in different locations and two groups of nymphs — with alternating genders to enable breeding from the start.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 2 15 8 | [Adult Dragonfly](#adult-dragonfly-2-15-8) | Flying insect with full AI: roaming, hunting, mating, and egg-laying |
| 2 13 5 | [Dragonfly Nymph](#dragonfly-nymph-2-13-5) | Aquatic larval stage that feeds, climbs plants, and metamorphoses into an adult |
| 2 18 5 | [Dragonfly Egg](#dragonfly-egg-2-18-5) | Egg laid near water that hatches into nymphs |
| 2 10 9 | [Dead Adult Dragonfly](#dead-adult-dragonfly-2-10-9) | Decomposing adult body that releases nutrients |
| 2 10 10 | [Dead Nymph](#dead-nymph-2-10-10) | Decomposing nymph body that releases nutrients |

## Agent Variables Reference

The following OV variables are shared across adult dragonflies and nymphs:

| Variable | Purpose |
|---|---|
| `ov00` | Behavior state (0=roam, 1=seek food, 2=seek mate/plant, 3=mate/climb, 4=seek water/morph, 5=lay eggs/cocoon, 98=resting, 99=dying) |
| `ov01` | Age/tick counter (increments each timer tick) |
| `ov02` | Health/lifespan counter (decrements each tick; death at 0) |
| `ov06` | Gender (0 or 1; alternated during creation to ensure mixed populations) |
| `ov10` | Horizontal direction (-1=left, 1=right) |
| `ov11` | Vertical direction (-1=up, 1=down) |
| `ov16` | Target agent reference (food, mate, or plant) |
| `ov20` | Maturity counter (adults only; triggers mate-seeking at 50) |
| `ov61` | Stimulus intensity value |
| `ov70` | Pregnancy flag (1=pregnant, set on females after mating) |
| `ov72` | Energy gained per food item consumed |
| `ov73` | Hunger threshold (seek food when ov02 < ov73) |
| `ov74` | Full threshold (stop eating when ov02 > ov74) |

---

## Adult Dragonfly (2 15 8)

Flying insect with a complex AI behavior loop. Adults have zero gravity (`accg 0`) and high aerodynamic drag (`aero 30`), giving them a hovering flight pattern. They roam freely, hunt smaller insects for food, seek mates when mature, and — if female and pregnant — navigate toward water using CA gradients to lay eggs. Adults are pickupable and activatable by creatures (`bhvr 16`, `attr 199`).

Four initial groups are created:
- **Group 1** (5 adults): Positioned at x=3500, y=400 with lifespan 251
- **Group 2** (5 adults): Positioned at x=1800, y=1550 with lifespan 255
- **Group 3** (5 adults): Positioned at x=4000, y=1020 with lifespan 249 (gravity-affected variant, `accg 1`)
- **Group 4** (5 adults): Positioned at x=2644, y=2200 with lifespan 305 (gravity-affected variant, `accg 1`)

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main AI behavior loop |
| Collision | 6 | Wall bounce and death animation |
| Pick Up | 5 | Picked up by creature or hand |
| User Message | 256 | Receive health modification (adds `_p1_` to `ov02`) |
| Eat | 12 | Eaten by a creature |

### Timer (Event 9) — Main AI Loop

The timer fires every 4 ticks and drives the dragonfly's state machine:

**Aging and Health**: Each tick increments `ov01` (age) and decrements `ov02` (health). The maturity counter `ov20` increments unless pregnant.

**Obstacle Avoidance**: Checks `obst` in all 4 directions; if an obstacle is within 30 pixels, reverses direction.

**Water Detection**: If the dragonfly enters a room of type 8 (aquatic), it loses 20 health, flies upward, and — if pregnant — triggers egg laying (`ov00=5`).

**State Behaviors**:
- **State 0 (Roam)**: Random direction changes with velocity-based movement via `roam` subroutine.
- **State 1 (Seek Food)**: Activated when health drops below `ov73`. Hunts bugs (family 2, genus 14, species 0) first, then grasshoppers (family 2, genus 13, species 0 — filters out species 5 nymphs via `spcs` check). On contact, sends message 12 (eat) to prey and gains `ov72` energy. Stops hunting when health exceeds `ov74`.
- **State 2 (Seek Mate)**: Triggered when maturity counter exceeds 50. Uses `seek` subroutine to find nearest dragonfly of opposite gender (`ov06 ne va45`). Switches to state 3 on success.
- **State 3 (Mating)**: Approaches target mate. On contact, if gender is 1 (female), sets pregnancy flag `ov70=1` and transitions to seek water (state 4). Males return to roam.
- **State 4 (Seek Water)**: Follows CA property 5 gradients using `prop grid` to navigate toward water. Used by pregnant females to find egg-laying sites.
- **State 5 (Lay Eggs)**: Checks nearby egg count (`esee 2 18 5`); if fewer than 4 eggs exist nearby, lays a clutch of 5 eggs (classifier 2 18 5). Resets pregnancy flag and maturity counter.
- **State 98 (Resting)**: Random chance each tick to wake up and resume roaming.
- **State 99 (Death)**: Creates a dead adult body (2 10 9) at current position and kills self.

### Collision (Event 6)

If dying (`ov00=99`), plays death animation and kills self. Otherwise, reverses horizontal direction based on collision velocity and plays appropriate facing animation.

### Pick Up (Event 5)

Sets horizontal velocity to 30 and resets tick rate to 4.

### Eat (Event 12)

When eaten by a creature, applies stimulus 80 (critter nutrient) with intensity 2 to the creature, then kills self.

**Stimulus Impact**: `stim writ from 80 2` — delivers a "critter" nutrient stimulus of intensity 2 to the eating creature.

---

## Dragonfly Nymph (2 13 5)

Aquatic larval stage of the dragonfly. Nymphs have gravity (`accg 1–2`), moderate permeability (`perm 20–30`), and aerodynamic drag (`aero 10`). They live primarily in aquatic rooms (type 8 or 9) and lose health rapidly when outside water. Their lifecycle progresses from feeding to climbing a plant, pupating in a cocoon, and emerging as a new adult dragonfly.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main AI behavior loop |
| Pick Up | 5 | Adjusts permeability and gravity when picked up |
| Eat | 12 | Eaten by a creature |

### Timer (Event 9) — Main AI Loop

The timer fires every 8 ticks and drives the nymph state machine:

**Permeability Recovery**: If permeability is 99, checks if all four corners are in room type 8 (aquatic). If so, resets to full permeability (100) and normal gravity.

**Out-of-Water Penalty**: If not carried and not in room type 8 or 9, loses 50 health per tick. This strongly encourages nymphs to remain in water.

**Plant Check** (`cplt` subroutine): Before climbing or cocooning, verifies that plants (2 4 0) or flowers (2 5 0) still exist nearby. If none found, reverts to roaming and sends self message 257 to reset.

**State Behaviors**:
- **State 0 (Roam)**: Random movement in water with small velocities (6–12 horizontal, 8–10 vertical).
- **State 1 (Seek Food)**: Hunts food agents (family 2, genus 6, species 0) that have `ov99=1` (edible flag). On contact, eats them (message 12) and gains `ov72` energy.
- **State 2 (Go to Plant)**: Seeks nearest plant (2 4 0). On contact, transitions to climbing.
- **State 3 (Climb Plant)**: Moves upward along the plant, matching the plant's x-position. Sets gravity to 0 and adjusts plane above the plant. Transitions to morph when reaching the top.
- **State 4 (Morph/Cocoon)**: Plays cocoon animation (base 32 or 37 depending on direction). Transitions to state 5.
- **State 5 (Cocoon → Adult)**: Waits until `ov01 > 50`, then spawns a new adult dragonfly (2 15 8) via `dfly` subroutine if fewer than 8 adults exist nearby. The new adult inherits a random gender and full health (800). The nymph then kills itself.
- **State 99 (Death)**: Creates a dead nymph body (2 10 10) at current position and kills self.

### Pick Up (Event 5)

Resets permeability to 30 and gravity to 2 when picked up.

### Eat (Event 12)

When eaten by a creature, applies stimulus 80 (critter nutrient) with intensity 1 to the creature, then kills self.

**Stimulus Impact**: `stim writ from 80 1` — delivers a "critter" nutrient stimulus of intensity 1 to the eating creature.

---

## Dragonfly Egg (2 18 5)

Eggs are laid by pregnant adult dragonflies near water. They have gravity (`accg 1`), moderate permeability (`perm 50`), high elasticity (`elas 5`), full friction (`fric 100`), and play a hatching animation. Eggs are designed to sink and settle on surfaces in aquatic rooms.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Hatching lifecycle |

### Timer (Event 9) — Hatching Lifecycle

The timer fires every 10 ticks and drives a multi-phase hatching sequence:

**Phase 0 (Settling)**: Checks if the egg has reached the bottom (`obst 3 = 0`). Once grounded, transitions to phase 1 and resets tick counter. While still in water (room type 8), gives small random horizontal nudges.

**Phase 1 (Hatching Animation)**: Progresses through poses over ~50 ticks:
- Ticks 0–10: Rises slightly (moves up 22 pixels), sets pose 5
- Ticks 10–20: Pose 6
- Ticks 20–30: Pose 7
- Ticks 30–40: Pose 8
- Ticks 40–41: Pose 9 — **Spawns nymphs** via `nymf` subroutine if fewer than 12 nymphs exist nearby and fewer than 8 eggs exist nearby. Creates a new nymph (2 13 5) at the egg's position.
- Ticks 40–50: Pose 10 (empty shell)
- Beyond 50: Kills self

**Nymph Spawning** (`nymf` subroutine): Creates a new nymph (2 13 5) with gravity 2, permeability 30, tick rate 8, and initial health 300. The nymph is pickupable and activatable (`attr 195`, `bhvr 16`).

---

## Dead Adult Dragonfly (2 10 9)

Decomposing body of an adult dragonfly. Has high gravity (`accg 3`), aerodynamic drag (`aero 10`), and full elasticity (`elas 1`). Bounces and settles on the ground.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Decay animation and nutrient release |

### Timer (Event 9) — Decay

Ticks every 4 ticks. Increments `ov01` (decay counter). After 200 ticks, plays decomposition animation (direction-dependent) and, if in a valid room, releases nutrients:

**Room CA Impact**:
- `altr room targ 3 0.1` — Increases CA property 3 (nutrients) by 0.1
- `altr room targ 4 0.1` — Increases CA property 4 (nutrients) by 0.1

Then kills self.

---

## Dead Nymph (2 10 10)

Decomposing body of a dragonfly nymph. Behaves identically to the dead adult body but with slightly different sprite set and longer decay (50 ticks).

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Decay animation and nutrient release |

### Timer (Event 9) — Decay

Ticks every 20 ticks. Increments `ov01` (decay counter). After 50 ticks, plays decomposition animation and releases nutrients:

**Room CA Impact**:
- `altr room targ 3 0.1` — Increases CA property 3 (nutrients) by 0.1
- `altr room targ 4 0.1` — Increases CA property 4 (nutrients) by 0.1

Then kills self.

---

## Removal Script

The removal script (`rscr`) cleanly destroys all dragonfly-related agents and unregisters their event scripts:
- Kills all nymphs (2 13 5) and removes scripts 9, 257
- Kills all dead adult bodies (2 10 9) and removes script 9
- Kills all adult dragonflies (2 15 8) and removes scripts 9, 5, 6, 256
- Kills all eggs (2 18 5) and removes script 9
