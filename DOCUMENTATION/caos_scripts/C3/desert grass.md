# desert grass.cos - Desert Grass Ecosystem

**Source**: `Assets/Bootstrap/001 World/desert grass.cos`

## Overview

This script implements a desert grass ecosystem for the Creatures 3 desert terrarium. It spawns 5 initial desert grass plants that grow through visual stages, absorb water and nutrients from their room's CA properties, and photosynthesize using heat. Once mature, plants flower and launch seeds into the environment. Seeds check environmental conditions (room type, heat, light, water) before germinating into new plants, ensuring the grass only spreads in suitable desert rooms (types 5–8). The ecosystem is self-regulating: seeds enforce a population cap of 30, check for nearby plant density before growing, and return small amounts of nutrients and water to the room CA upon death.

Plants interact with room CA in a feedback loop: they consume water (CA 3) and nutrients (CA 4) during growth, use heat (CA 1) for photosynthesis, lose water proportionally to heat (CA 2), and release nutrients back when they die. Seeds emit carbohydrate smell (CA 7) making them detectable by creatures, and can be eaten to provide a "plant eaten" stimulus. The grass can also be eaten by creatures in its grown state, which reduces its visual growth stage.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 6 4 | Desert Grass Plant | `desertgrass` frames 0–24 | Heat-tolerant grass that grows, absorbs water/nutrients, flowers, and produces seeds | [Detail](#desert-grass-plant-2-6-4) |
| 2 3 13 | Desert Grass Seed | `desertgrass` frames 25+ | Seed launched from flowering plants; germinates into new plants in suitable desert rooms | [Detail](#desert-grass-seed-2-3-13) |

---

## Desert Grass Plant (2 6 4)

A heat-tolerant strain of grass that grows in dry conditions. The plant progresses through a lifecycle of growth, maturity, flowering, and seed production. It absorbs water and nutrients from the room environment, photosynthesizes using heat, and dies if resources are depleted. Creatures can eat the plant to reduce its growth stage.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 192 | Physics (64) + Suffers Collisions (128) |
| `elas` | 0 | No bounce |
| `pose` | 3 | Starting visual stage |
| `tick` | 300 (ov80) | Timer interval |

### Key OV Variables

| Variable | Initial | Purpose |
|---|---|---|
| ov00 | 0 | Lifecycle state: 0=growing, 1=mature, 2=stressed, 3=flowering, 5=dying |
| ov30 | 6 | Max growth pose |
| ov31 | 20 | Wilting start pose |
| ov32 | 14 | Death pose threshold (dying stops here) |
| ov34 | 21 | Flowering start pose |
| ov35 | 24 | Max flowering pose |
| ov38 | 7 | Stressed/wilted base frame |
| ov50 | 0.1 | Current water stored |
| ov51 | 0.005 | Water uptake rate per tick |
| ov52 | 0.5 | Maximum water capacity |
| ov54 | 10 | Water stress threshold divisor |
| ov55 | 0.1 | Current nutrient stored |
| ov56 | 0.0001 | Nutrient uptake rate per tick |
| ov57 | 0.5 | Maximum nutrient capacity |
| ov58 | 0.001 | Heat threshold for photosynthesis |
| ov60 | 0 | Current growth level (tracks pose) |
| ov62 | 0.0002 | Photosynthesis nutrient gain rate |
| ov63 | 1000 | Water loss divisor (based on heat) |
| ov66 | 30 | Mature countdown (ticks until flowering) |
| ov67 | 30 | Flowering countdown (ticks until seed release) |
| ov70 | 0.0001 | Dormant tick rate (slow) |
| ov71 | 0.0002 | Dormant tick rate (slower) |
| ov73 | 40 | Stressed water threshold reset |
| ov74 | 10 | Stressed flower threshold reset |
| ov80 | 300 | Main tick interval |
| ov82 | 100 | Heat max threshold |
| ov99 | 0/1 | Has visible growth flag (1 = edible) |

### Initial Placement

5 plants are created at bootstrap, each placed at a random x-coordinate between 4792 and 5928, y=335, in the desert terrarium area. Each starts at pose 3 with a random plane between 200 and 500 for visual depth variety.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth cycle, resource uptake, flowering, and seed production |
| 12 | Eat | Creature eats the plant, reducing its growth stage |

#### Event 9 — Timer (Lifecycle)

The main lifecycle tick. Runs every 300 ticks.

1. **Dying state (ov00 = 5)**: Decrements pose each tick. When pose reaches the death threshold (ov32 = 14), kills the plant.

2. **Resource uptake** (`up_t` subroutine):
   - **Water absorption**: If stored water (ov50) is below capacity (ov52), takes water from room CA 3 at rate ov51, removing it from the room.
   - **Nutrient absorption**: If stored nutrients (ov55) are below capacity (ov57), takes nutrients from room CA 4 at rate ov56, removing half of it from the room. If heat (CA 1) is low, nutrient absorption is halved.
   - **Photosynthesis**: If heat (CA 1) is above the threshold (ov58), gains additional nutrients proportional to growth stage (ov60) and photosynthesis rate (ov62).

3. **Water loss** (`loss` subroutine): Loses water based on current heat (CA 2) divided by ov63, multiplied by growth stage. Returns half of the lost water back to the room as CA 3.

4. **Health check** (`what` subroutine):
   - If water or nutrients drop to 0: enters dying state (ov00 = 5, pose = ov31 = 20).
   - If water is critically low (below capacity / 10): enters stressed state (ov00 = 2, uses stressed base frame ov38 = 7), resets countdown timers.

5. **Growing (ov00 = 0)**: Advances pose by 1 each tick until reaching max growth pose (ov30 = 6), then transitions to mature (ov00 = 1). Tracks growth level in ov60.

6. **Mature (ov00 = 1)**: Counts down ov66. When it reaches 0, transitions to flowering (ov00 = 3, pose = ov34 = 21).

7. **Flowering (ov00 = 3)**: Advances pose to max flowering pose (ov35 = 24), then counts down ov67. When ov67 reaches 0:
   - **Seed creation**: Creates a Desert Grass Seed (2 3 13) at the plant's top position with random velocity (horizontal -5 to 5, vertical -10 to 0 — launched upward). The seed emits CA 7 (carbohydrate smell) at intensity 0.3.
   - **Post-flowering**: Enters dying state (ov00 = 5, pose = ov31).

### Impact on Room CA

| CA | Effect | Direction |
|---|---|---|
| CA 3 (Water) | Absorbed during growth, partially returned during water loss | Consumed / Partially returned |
| CA 4 (Nutrients) | Absorbed during growth (half removed from room) | Consumed |
| CA 1 (Heat) | Read for photosynthesis check | Read only |
| CA 2 (Heat) | Read for water loss calculation | Read only |

---

#### Event 12 — Eat

When a creature eats the desert grass:

1. If the plant has no visible growth (ov99 = 0), the eat action is ignored.
2. If in mature (ov00 = 1) or flowering (ov00 = 3) state: resets to growing state (ov00 = 0), reduces pose by 1 from the max growth pose.
3. If in growing state (ov00 = 0): reduces pose by 1.
4. Updates growth tracking (ov60) and edibility flag (ov99).

Eating does not destroy the plant — it reduces its growth, forcing it to regrow before it can flower again.

---

## Desert Grass Seed (2 3 13)

A seed launched from a flowering desert grass plant. Seeds are animated, bounce around the environment, and attempt to germinate on a timer. They check environmental conditions and nearby plant density before growing into new plants. Seeds can be picked up and eaten by creatures.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Carryable (1) + Mouseable (2) + Physics (64) + Suffers Collisions (128) |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `elas` | 0 | No bounce |
| `fric` | 50 | Moderate friction |
| `anim` | [0 1 2 3 255] | Spinning animation loop |
| `emit` | CA 7 at 0.3 | Emits carbohydrate smell |

### Key OV Variables

| Variable | Initial | Purpose |
|---|---|---|
| ov00 | 1 | Alive state (1 = alive) |
| ov02 | 100 | Health/lifespan counter |
| ov70 | 100 | Normal tick interval |
| ov71 | 600 | Dormant tick interval (slow) |
| ov72 | 50 | Dormancy counter |
| ov80 | 1 | Heat max threshold |
| ov81 | 0.01 | Heat min threshold |
| ov82 | 1 | Light max threshold |
| ov83 | 0.01 | Light min threshold |
| ov84 | 0.001 | Light mid threshold |
| ov85 | 1 | Water max threshold |
| ov86 | 0.01 | Water min threshold |

### Visual Variants

Seeds are created with a random sprite base offset (25, 29, 33, or 37) from the `desertgrass` sprite file, giving 4 visual variants with 4 animation frames each.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 5 | Drop | Restarts the spinning animation |
| 6 | Collision | Stops animation when hitting a surface |
| 9 | Timer | Germination check and environmental viability |
| 12 | Eat | Creature eats the seed for nutrients |

#### Event 5 — Drop

When dropped by a creature, the seed restarts its spinning animation `[0 1 2 3 255]`.

#### Event 6 — Collision

When the seed hits a wall or floor (`wall eq down`), its animation is cleared and it comes to rest.

#### Event 9 — Timer (Germination)

Fires every 100 ticks (or 600 when dormant). Only processes if the seed is alive (ov00 = 1), not carried, and not falling.

1. **Population cap**: If total seeds (2 3 13) exceed 30, the seed dies immediately.

2. **Room type check**: If the room type is not 5–8 (desert room types), the seed cannot grow — calls `nope` (decrements health, dies if depleted).

3. **Environmental checks** (in priority order):
   - **Heat** (CA 1): Must be between ov81 (0.01) and ov80 (1). Out of range → `nope`.
   - **Water** (CA 3): Must be between ov86 (0.01) and ov85 (1). Out of range → `nope`.
   - **Light** (CA 2): If between ov84 (0.001) and ov82 (1) → `nope` + `dorm` (goes dormant with reduced tick). If outside ov83 (0.01) to ov82 (1) range → `nope`.

4. **Density check**: If all environmental conditions pass, scans range 100 for other desert grass plants (2 6 4):
   - If 2 or more nearby plants found → enters dormancy (`dorm`).
   - Otherwise → germinates (`grow`).

5. **Germination** (`grow` subroutine): Creates a new Desert Grass Plant (2 6 4) at the seed's position with full default parameters, then kills the seed.

6. **Dormancy** (`dorm` subroutine): Decrements health (ov02) and dormancy counter (ov72). When dormancy counter depletes, switches to slower tick interval (ov71 = 600). If health reaches 0, dies.

7. **Death** (`dead` subroutine): Returns a small amount of nutrients (0.001) to room CA 3 and CA 4 before destroying itself.

### Impact on Room CA

| CA | Effect | Direction |
|---|---|---|
| CA 7 (Carbohydrate smell) | Emitted at 0.3 intensity | Emitted |
| CA 3 (Water) | Small amount returned on death (0.001) | Released on death |
| CA 4 (Nutrients) | Small amount returned on death (0.001) | Released on death |

### Impact on Stimulus

| Stimulus | Value | Trigger | Description |
|---|---|---|---|
| 77 (Eaten Plant) | Intensity 1 | Event 12 (Eat) | Sent to the eating creature via `stim writ from 77 1` |

#### Event 12 — Eat

When a creature eats the seed:
1. Sends stimulus 77 (Eaten Plant) with intensity 1 to the eating creature.
2. Waits 1 tick.
3. Destroys itself.

---

## Remove Script

The removal script (`rscr`) cleans up all desert grass ecosystem agents:
1. Kills all Desert Grass Seeds (2 3 13).
2. Kills all Desert Grass Plants (2 6 4).
3. Removes the timer scripts for both classifiers.
