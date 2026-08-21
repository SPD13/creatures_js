# Fungi

## Overview

This script implements a fungi ecosystem consisting of spores and fruiting bodies. Fungi spores (2 3 10) drift through the air and settle on surfaces, where they evaluate environmental conditions — temperature, light, and nutrients — to decide whether to germinate into a fruiting body (2 8 5). Fruiting bodies grow through visual stages, eventually releasing new spores before dying and enriching the room's nutrient and light CA properties. Creatures can eat both spores and fruiting bodies for nourishment. The system creates 30 initial spores scattered around the world, establishing a self-sustaining fungal lifecycle.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 2 3 10 | [Fungi Spore](#fungi-spore-2-3-10) | Airborne seed that drifts, settles, and germinates into a fruiting body under favorable conditions |
| 2 8 5 | [Fungi Fruiting Body](#fungi-fruiting-body-2-8-5) | Mature fungi that grows through visual stages, releases spores, and decomposes |

## Agent Variables Reference

### Fungi Spore (2 3 10)

| Variable | Purpose |
|---|---|
| `ov72` | Lifespan counter (decremented each timer tick; spore dies at 0) |
| `ov80` | Minimum temperature threshold for germination |
| `ov82` | Minimum light threshold for germination |
| `ov87` | Maximum nutrient threshold for germination (germinates when nutrients are at or above this value) |

### Fungi Fruiting Body (2 8 5)

| Variable | Purpose |
|---|---|
| `ov00` | Growth state (0=growing, 1=mature/sprouting, 2=decaying, 3=picked/decaying variant) |
| `ov01` | Age counter (increments each timer tick) |
| `ov99` | Decay animation variant (-1 or 1, randomly chosen when picked up) |

---

## Fungi Spore (2 3 10)

Airborne spore agent that drifts through the world using random initial velocity. Each spore is created with the "fungi" sprite (7 frames, frame 110, plane 600), set to carryable and activatable by creatures (`bhvr 16`, `attr 195`). Spores have no elasticity (`elas 0`), full friction (`fric 100`), and random permeability (`perm 30-70`). Their animated appearance cycles through frames 0-3.

Thirty spores are created at initialization, positioned at (1500, 1700) with random horizontal velocity (-10 to 10) and slight downward velocity (-10 to 0), simulating dispersal from a central source.

### Events

| Event | Number | Description |
|---|---|---|
| Pick Up | 4 | Stops animation when picked up |
| Drop | 5 | Resumes animation when dropped |
| Collision | 6 | Stops animation when hitting the ground |
| Timer | 9 | Main lifecycle: environmental check, germination, and aging |
| Eat | 12 | Eaten by a creature; provides stimulus 77 (seed consumption) |

### Pick Up (Event 4)

Stops the spore's animation, displaying it as a static sprite while held.

### Drop (Event 5)

Resumes the cycling animation (frames 0-3) when the spore is released.

### Collision (Event 6)

When the spore hits the ground (`wall eq down`), stops animation. This visually indicates the spore has landed and settled.

### Timer (Event 9) — Main Lifecycle

The timer fires every 300-600 ticks and drives the spore's lifecycle:

**Population Control**: If more than 70 fungi fruiting bodies (2 8 5) exist in the world, the spore kills itself to prevent overpopulation.

**State Requirements**: The spore only processes its lifecycle when it has landed (not falling) and is not being carried.

**Hostile Room Check**: If the spore is in a room of type 8 or 9 (aquatic/marine rooms), it kills itself immediately as fungi cannot grow in water.

**Environmental Evaluation** (`envi` subroutine): The spore checks three room CA properties against its thresholds:
- Temperature (CA property 1) must be at or below `ov80` (threshold: 1)
- Light (CA property 2) must be at or below `ov82` (threshold: 1)
- Nutrients (CA property 4) must be at or above `ov87` (threshold: 0)

If all three conditions are met, the spore germinates.

**Germination** (`grow` subroutine): The spore creates a new fungi fruiting body (2 8 5) at its position (offset 8 pixels left, 20 pixels up). The new fruiting body inherits the spore's permeability, has slight gravity (`accg 2`), and a longer timer interval (600-1200 ticks). If the fruiting body cannot be placed at the target position (`tmvt` fails), both the fruiting body and the spore are destroyed. Otherwise, the spore is consumed in the process.

**Dormancy and Aging** (`dorm` subroutine): If conditions are not met for germination:
- If the spore hasn't completed its settling animation (pose < 4), it becomes non-physical (`attr 16`) and plays a wilting animation (frames 4-6), then waits for it to complete.
- The lifespan counter `ov72` is decremented each tick.
- When `ov72` reaches 0, the spore dies: it enriches the room by adding 0.1 to CA property 3 (inorganic nutrients) and 0.1 to CA property 4 (organic nutrients), then kills itself. If the spore is not in a valid room, it simply kills itself without enrichment.

### Eat (Event 12)

When eaten by a creature, the spore emits stimulus 77 (seed consumption) to the eating creature with intensity 1, then destroys itself.

**Stimulus Impact**: Stimulus 77 — provides nutritional value to the creature eating the spore.

---

## Fungi Fruiting Body (2 8 5)

The mature stage of the fungi lifecycle. Fruiting bodies grow through visual stages, eventually reaching full maturity where they produce new spores before decomposing. They use the "fungi" sprite (22 frames per stage, plane 600) and share the same physical properties as spores: carryable, activatable (`bhvr 16`, `attr 195`), no elasticity, full friction.

### Events

| Event | Number | Description |
|---|---|---|
| Pick Up | 4 | Interrupts growth; triggers decay animation variant |
| Timer | 9 | Main growth state machine: growing, maturing, spawning spores, and decaying |
| Eat | 12 | Eaten by a creature; spawns a replacement spore and provides stimulus 78 (fruit consumption) |

### Timer (Event 9) — Growth State Machine

The timer drives the fruiting body through its lifecycle states:

**Age Counter**: `ov01` increments each tick, tracking the fruiting body's age.

**State 0 — Growing**: The fruiting body advances through its initial growth poses (0-3), one frame per timer tick. Once fully grown (pose reaches 3), it waits until age reaches 20 ticks before transitioning to state 1 (mature).

**State 1 — Mature/Sprouting**: The fruiting body advances through its mature poses (4-7). Upon reaching full maturity (pose 7), it spawns a new fungi spore (2 3 10) at its current position with the same properties as the initial spores (random velocity, animation, random permeability 40-70, lifespan 10-40 ticks, same environmental thresholds). If the spore cannot be placed (`tmvt` fails), the spore is destroyed and the fruiting body transitions to state 2 without producing offspring. Otherwise, it transitions to state 2.

**State 2 — Decaying**: The fruiting body advances through decay poses (8-11). Upon completing the decay animation, it enriches the room by adding 0.2 to both CA property 3 (inorganic nutrients) and CA property 4 (organic nutrients), then kills itself.

**State 3 — Picked Decay**: An alternative decay state triggered when the fruiting body is picked up (via event 4). The animation depends on the randomly chosen variant `ov99`:
- Variant -1: Advances through poses 17-21
- Variant 1: Advances through poses 12-16

When the decay animation completes and the fruiting body is on the ground and not being carried, it enriches the room (0.2 to CA properties 3 and 4) and kills itself.

### Pick Up (Event 4)

When picked up by a creature or the hand:
- Sets state to 3 (picked decay)
- Randomly selects a decay variant (`ov99` = -1 or 1) if not already set
- Sets the appropriate starting pose for the chosen decay variant (pose 17 for variant -1, pose 12 for variant 1)

This means picking up a fruiting body interrupts its natural lifecycle and causes it to begin decaying.

### Eat (Event 12)

When eaten by a creature:
- Creates a new fungi spore (2 3 10) at the fruiting body's position with standard spore properties (random permeability 30-70, lifespan 10-40 ticks, standard environmental thresholds)
- If the spore can be placed successfully, it is given random velocity and a timer
- If placement fails, the replacement spore is destroyed
- Emits stimulus 78 (fruit consumption) to the eating creature with intensity 1
- Kills itself

**Stimulus Impact**: Stimulus 78 — provides nutritional value to the creature eating the fruiting body (higher protein content than spores based on catalogue description).

## Room CA Impact

The fungi ecosystem has a notable impact on room CA properties:

| Event | CA Property 3 (Inorganic Nutrients) | CA Property 4 (Organic Nutrients) |
|---|---|---|
| Spore death (lifespan expired) | +0.1 | +0.1 |
| Fruiting body decay (state 2) | +0.2 | +0.2 |
| Fruiting body picked decay (state 3) | +0.2 | +0.2 |

This creates a nutrient cycle: fungi consume nutrients from the environment (checked via germination thresholds) and release them back when they die, enriching the soil for future growth and other plant life.

## Removal Script

The removal script (`rscr`) cleans up all fungi agents by enumerating and killing all spores (2 3 10) and fruiting bodies (2 8 5).
