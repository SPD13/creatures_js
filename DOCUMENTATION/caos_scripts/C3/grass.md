# grass.cos - Grass Ecosystem

**Source**: `Assets/Bootstrap/001 World/grass.cos`

## Overview

This script implements a self-sustaining grass ecosystem for the Creatures 3 Norn Terrarium. It spawns 15 initial grass plants that grow through visual stages, absorb water and nutrients from their room's CA properties, and photosynthesize using heat. Once mature, plants flower and launch seeds into the environment. Seeds check environmental conditions (room type, heat, light, water) and nearby plant density before germinating into new plants, ensuring the grass only spreads in suitable non-desert, non-aquatic rooms (types 5, 6, 7, and above 9). The ecosystem is self-regulating: seeds enforce a population cap of 20, check for nearby plant density (max 4 nearby) before growing, and return small amounts of nutrients and water to the room CA upon death.

Plants interact with room CA in a feedback loop: they consume water (CA 3) and nutrients (CA 4) during growth, use heat (CA 1) for photosynthesis, lose water proportionally to heat (CA 2), and release nutrients back when they die. Seeds emit carbohydrate smell (CA 7) making them detectable by creatures, and can be eaten to provide a "plant eaten" stimulus. The grass can also be eaten by creatures in its grown state, which reduces its visual growth stage.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 6 1 | Grass Plant | `grass` frames 0–20 | Temperate grass that grows, absorbs water/nutrients, flowers, and produces seeds | [Detail](#grass-plant-2-6-1) |
| 2 3 4 | Grass Seed | `grass` frame 0, 22 images, plane 100 | Seed launched from flowering plants; germinates into new plants in suitable rooms | [Detail](#grass-seed-2-3-4) |

---

## Grass Plant (2 6 1)

A temperate grass plant that grows in the Norn Terrarium. The plant progresses through a lifecycle of growth, maturity, flowering, and seed production. It absorbs water and nutrients from the room environment, photosynthesizes using heat, and dies if resources are depleted. Creatures can eat the plant to reduce its growth stage.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 192 | Physics (64) + Suffers Collisions (128) |
| `elas` | 0 | No bounce |
| `pose` | 3 | Starting visual stage |
| `tick` | 300 (ov80) | Timer interval |
| Sprite | `"grass"` | 22 images, random plane 200–500 |
| Instances | 15 | Number of plants created at bootstrap |

### Key OV Variables

| Variable | Initial | Purpose |
|---|---|---|
| ov00 | 0 | Lifecycle state: 0=growing, 1=mature, 2=stressed, 3=flowering, 5=dying |
| ov17 | null | Agent reference (unused, cleared) |
| ov18 | null | Agent reference (unused, cleared) |
| ov30 | 5 | Max growth pose |
| ov31 | 17 | Wilting start pose |
| ov32 | 12 | Death pose threshold (dying stops here) |
| ov34 | 18 | Flowering start pose |
| ov35 | 20 | Max flowering pose |
| ov38 | 6 | Stressed/wilted base frame |
| ov50 | 0.1 | Current water stored |
| ov51 | 0.005 | Water uptake rate per tick |
| ov52 | 0.5 | Maximum water capacity |
| ov53 | 1 | (Unused threshold) |
| ov54 | 10 | Water stress threshold divisor |
| ov55 | 0.1 | Current nutrient stored |
| ov56 | 0.0001 | Nutrient uptake rate per tick |
| ov57 | 0.5 | Maximum nutrient capacity |
| ov58 | 0.001 | Heat threshold for photosynthesis |
| ov60 | 0 | Current growth level (tracks pose) |
| ov61 | 5 | (Growth-related threshold) |
| ov62 | 0.0002 | Photosynthesis nutrient gain rate |
| ov63 | 1000 | Water loss divisor (based on heat) |
| ov65 | 0 | (Unused counter) |
| ov66 | 30 | Mature countdown (ticks until flowering) |
| ov67 | 30 | Flowering countdown (ticks until seed release) |
| ov68 | 0 | (Unused) |
| ov69 | 0 | (Unused) |
| ov70 | 0.0001 | Seed dormant tick rate (slow) |
| ov71 | 0.0002 | Seed dormant tick rate (slower) |
| ov72 | 0.0002 | Seed dormancy counter |
| ov73 | 40 | Stressed water threshold reset |
| ov74 | 10 | Stressed flower threshold reset |
| ov80 | 300 | Main tick interval |
| ov82 | 100 | Heat max threshold for seed viability |
| ov99 | 0/1 | Has visible growth flag (1 = edible) |

### Initial Placement

15 plants are created at bootstrap, each placed at a random x-coordinate between 1800 and 2700, y=600, in the Norn Terrarium area. Each starts at pose 3 with a random plane between 200 and 500 for visual depth variety.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth cycle, resource uptake, flowering, and seed production |
| 12 | Eat | Creature eats the plant, reducing its growth stage |

#### Event 9 — Timer (Lifecycle)

The main lifecycle tick. Runs every 300 ticks.

1. **Dying state (ov00 = 5)**: Decrements pose each tick. When pose reaches the death threshold (ov32 = 12), kills the plant.

2. **Resource uptake** (`up_t` subroutine):
   - **Water absorption**: If stored water (ov50) is below capacity (ov52), takes water from room CA 3 at rate ov51, removing it from the room.
   - **Nutrient absorption**: If stored nutrients (ov55) are below capacity (ov57), takes nutrients from room CA 4 at rate ov56, removing half of it from the room. If heat (CA 1) is low, nutrient absorption is halved.
   - **Photosynthesis**: If heat (CA 1) is above the threshold (ov58), gains additional nutrients proportional to growth stage (ov60) and photosynthesis rate (ov62).

3. **Water loss** (`loss` subroutine): Loses water based on current heat (CA 2) divided by ov63, multiplied by growth stage plus 1. Returns half of the lost water back to the room as CA 3.

4. **Health check** (`what` subroutine):
   - If water or nutrients drop to 0: enters dying state (ov00 = 5, pose = ov31 = 17).
   - If water is critically low (below capacity / 10): enters stressed state (ov00 = 2, uses stressed base frame ov38 = 6), resets countdown timers (ov66 = ov73 = 40, ov67 = ov74 = 10).

5. **Growing (ov00 = 0)**: Advances pose by 1 each tick until reaching max growth pose (ov30 = 5), then transitions to mature (ov00 = 1). Tracks growth level in ov60.

6. **Mature (ov00 = 1)**: Counts down ov66. When it reaches 0, transitions to flowering (ov00 = 3, pose = ov34 = 18).

7. **Flowering (ov00 = 3)**: Advances pose to max flowering pose (ov35 = 20), then counts down ov67. When ov67 reaches 0:
   - **Seed creation**: Creates a Grass Seed (2 3 4) at the plant's top position with random velocity (horizontal -5 to 5, vertical -10 to 0 — launched upward). The seed emits CA 7 (carbohydrate smell) at intensity 0.3.
   - **Post-flowering**: Enters dying state (ov00 = 5, pose = ov31 = 17).

### Impact on Room CA

| CA | Effect | Direction |
|---|---|---|
| CA 3 (Water) | Absorbed during growth, partially returned during water loss | Consumed / Partially returned |
| CA 4 (Nutrients) | Absorbed during growth (half removed from room) | Consumed |
| CA 1 (Heat) | Read for photosynthesis check | Read only |
| CA 2 (Heat) | Read for water loss calculation | Read only |

---

#### Event 12 — Eat

When a creature eats the grass:

1. If the plant has no visible growth (ov99 = 0), the eat action is ignored.
2. If in mature (ov00 = 1) or flowering (ov00 = 3) state: resets to growing state (ov00 = 0), reduces pose by 1 from the max growth pose.
3. If in growing state (ov00 = 0): reduces pose by 1.
4. Updates growth tracking (ov60) and edibility flag (ov99).

Eating does not destroy the plant — it reduces its growth, forcing it to regrow before it can flower again.

---

## Grass Seed (2 3 4)

A seed launched from a flowering grass plant. Seeds check environmental conditions before germinating into new plants. They can be picked up and eaten by creatures. Unlike desert grass seeds, grass seeds do not have a spinning animation.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Carryable (1) + Mouseable (2) + Physics (64) + Suffers Collisions (128) |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `elas` | 0 | No bounce |
| `fric` | 50 | Moderate friction |
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
| ov84 | 0.001 | Light mid threshold (dormancy range) |
| ov85 | 1 | Water max threshold |
| ov86 | 0.01 | Water min threshold |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Germination check and environmental viability |
| 12 | Eat | Creature eats the seed for nutrients |

#### Event 9 — Timer (Germination)

Fires every 100 ticks (or 600 when dormant). Only processes if the seed is alive (ov00 = 1), not carried, and not falling.

1. **Population cap**: If total seeds (2 3 4) exceed 20, the seed dies immediately.

2. **Room type check**: If the room type is less than 5, or equals 8, or equals 9, the seed cannot grow — calls `nope` (decrements health, dies if depleted). This restricts growth to temperate room types (5, 6, 7, 10+), excluding desert (8) and aquatic (9) rooms.

3. **Environmental checks** (in priority order):
   - **Heat** (CA 1): Must be between ov81 (0.01) and ov80 (1). Out of range -> `nope`.
   - **Water** (CA 3): Must be between ov86 (0.01) and ov85 (1). Out of range -> `nope`.
   - **Light** (CA 2): If between ov84 (0.001) and ov83 (0.01) -> `nope` + `dorm` (goes dormant). If outside ov83 (0.01) to ov82 (1) range -> `nope`.

4. **Density check**: If all environmental conditions pass, scans range 100 for other grass plants (2 6 1):
   - If 4 or more nearby plants found -> enters dormancy (`dorm`).
   - Otherwise -> germinates (`grow`).

5. **Germination** (`grow` subroutine): Creates a new Grass Plant (2 6 1) at the seed's position with full default parameters, then kills the seed.

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
| 77 (Eaten Plant) | Intensity 3 | Event 12 (Eat) | Sent to the eating creature via `stim writ from 77 3` |

#### Event 12 — Eat

When a creature eats the seed:
1. Sends stimulus 77 (Eaten Plant) with intensity 3 to the eating creature.
2. Waits 1 tick.
3. Destroys itself.

---

## Remove Script

The removal script (`rscr`) cleans up all grass ecosystem agents:
1. Kills all Grass Seeds (2 3 4).
2. Kills all Grass Plants (2 6 1).
3. Removes the timer scripts for both classifiers.
