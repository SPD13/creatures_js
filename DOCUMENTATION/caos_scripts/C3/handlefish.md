# Handle Fish (handlefish.cos)

This script implements the **Handle Fish** ecosystem in the Creatures 3 aquarium. It creates a population of six fish that exhibit complex lifecycle behaviors including growth through multiple stages, flocking, hunting, mating, egg-laying, and natural death with decomposition. The fish are aquatic agents that must remain in water (room type 9) and will gradually succumb to gravity and die if they leave aquatic rooms. They emit CA 6 (nutrient smell) to attract creatures and participate in the food chain by hunting smaller prey organisms.

The ecosystem features a full lifecycle: baby fish hatch from eggs, grow through four size stages, eventually reach maturity where they flock and can reproduce. Population is self-regulating through overcrowding checks during egg-laying. Fish can be eaten by creatures (providing stimulus 80) and will produce a dead fish corpse that visually decomposes before disappearing.

## Created Agents

| Classifier | Sprite | Description | Details |
|---|---|---|---|
| 2 15 16 | `graspit` | **Handle Fish** - The main fish agent with full lifecycle, AI behaviors (hunting, flocking, mating), and growth stages | [Details](#handle-fish-2-15-16) |
| 2 18 21 | `graspit` | **Fish Egg** - Eggs laid by adult fish that drift in water and eventually hatch into baby fish | [Details](#fish-egg-2-18-21) |
| 2 10 41 | `dead_fish` | **Dead Fish** - Corpse left when a fish dies naturally or is eaten, with a decomposition animation | [Details](#dead-fish-2-10-41) |

---

## Handle Fish (2 15 16)

The main fish agent. Six are spawned at world startup at position (3602, 1812). Each fish has zero gravity, full air resistance, full permeability, and slight elasticity, allowing it to float freely in aquatic rooms. The fish uses the `graspit` sprite sheet, with different frame offsets for each growth stage and swimming direction.

**Key Properties:**
- BHVR 48 (pickup + eat), attr 199 (carryable, mouseable, activatable)
- No gravity (accg 0), full air resistance (aero 1), perm 100, elas 20
- Emits CA 6 at intensity 0.15

**Agent Variables:**

| Variable | Purpose |
|---|---|
| ov00 | Behavior mode: 1=normal, 3=hunting, 4=front swim |
| ov01 | Age counter (incremented each tick) |
| ov02 | Energy/hunger counter (starts at 550, decremented each tick) |
| ov04 | Mating state: 0=none, 1=seeking mate, 2=ready to lay eggs |
| ov05 | Growth stage: 1 (baby) through 5 (fully mature) |
| ov08 | Number of eggs to lay (1-3) |
| ov10 | Horizontal facing direction: -1=left, 1=right |
| ov11 | Vertical facing direction: -1=up, 1=down |
| ov12 | Horizontal velocity component |
| ov13 | Vertical velocity component |
| ov70 | Mating readiness counter (triggers at 50) |
| ov75 | Prey family classifier |
| ov71 | Prey genus classifier |
| ov76 | Prey type selection (1-4) |
| ov86 | Out-of-water tick counter |
| ov87 | Gravity accumulator for out-of-water behavior |
| ov99 | Death flag (set to 5 when picked up by hand) |

**Prey Types** (randomly assigned at birth):

| Type | Family | Genus | Classifier |
|---|---|---|---|
| 1 | 13 | 8 | 2 13 8 |
| 2 | 3 | 6 | 2 3 6 |
| 3 | 3 | 7 | 2 3 7 |
| 4 | 3 | 8 | 2 3 8 |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main AI tick - lifecycle, behavior, movement |
| Eat | 12 | Creature eats the fish |

### Timer Event (9) - Main AI Loop

The timer fires every tick and drives the entire fish AI:

1. **Room Check (`roomtype`)**: Verifies the fish is in water (room type 9). If not, gravity gradually increases (0.03/tick for first 6 ticks, then 0.08/tick). After 100 ticks out of water, the fish dies.

2. **Aging**: Age counter (ov01) increments. Energy (ov02) decrements. Death occurs if ov99=5 (picked up by hand) or age exceeds 2000.

3. **Growth Stage Transitions**: The fish grows through stages based on age, but only when in water with sufficient space:
   - **Stage 1 → 2** (age 200-400): Creates new agent with sprite frame offset 50
   - **Stage 2 → 3** (age 401-1000): Creates new agent with sprite frame offset 100
   - **Stage 3 → 4** (age 1001-1800): Creates new agent with sprite frame offset 150
   - **Stage 4 → 5** (age 1801+): Marks as fully mature
   
   Each transition creates a new, larger agent at the same position, transfers all state variables, and kills the original.

4. **Hunger-Based Behavior Selection**:
   - Energy < 500: Hunting mode (ov00=3)
   - Energy >= 500: Normal mode (ov00=1)

5. **Mating Readiness**: At growth stage 4+, a counter (ov70) increments each tick. At 50, the fish enters mating-seeking state (ov04=1).

6. **Mating (`mate`)**: Scans within range 50 for other handle fish (2 15 16). If found, transitions to egg-laying state (ov04=2).

7. **Egg Laying (`eggs`)**: Counts nearby fish and eggs within range 1000. If combined population (multiplied by 1.5) is under 14, lays 1-3 eggs. If over 16, the parent dies from overcrowding. If it fails to lay eggs, the parent also dies.

8. **Behavior Dispatch** based on ov00:
   - **Mode 1 (Normal)**: Flocking (adults) or random movement + avoidance + swim animation + movement
   - **Mode 2**: Random movement + avoidance + swim animation + movement
   - **Mode 3 (Hunting)**: Hunt prey + avoidance + swim animation + movement + eating
   - **Mode 4 (Front Swim)**: Front swim animation + flocking/random + avoidance + swim animation + movement + eating

9. **Behavioral Subroutines**:
   - **`flocking`**: Calculates average position of nearby fish (range 200) and steers toward the group center
   - **`hunting`**: Scans for prey using the fish's assigned prey type. If no prey found, randomly switches prey type. Steers toward detected prey.
   - **`eating`**: Kills one nearby prey within range 50 and gains 7500 energy
   - **`random`**: 10% chance per tick to randomly reverse horizontal or vertical direction
   - **`avoidance`**: Detects obstacles within 45 pixels and reverses direction to avoid walls
   - **`movement`**: Applies the velocity vector (ov12, ov13) to the agent
   - **`swimanim`**: Sets animation base frame based on facing direction (0 for right, 40 for left)
   - **Turn animations**: `leftstartturn`, `rightstartturn` and their reversed variants play 10-frame turning sequences

10. **Death (`death`)**: Creates a dead fish corpse (2 10 41) with sprite frame selected by growth stage and facing direction. If in water, corpse has no gravity (attr 208); if on land, corpse has gravity (attr 209). If being carried by hand, sets death flag. If carried by another agent, kills self immediately.

### Eat Event (12) - Creature Consumption

When a creature eats the fish:
- Sends **stimulus 80** (food source) with strength 1 to the eating creature
- Creates a dead fish corpse (2 10 41) with 4-frame decomposition (ov77=8) at the fish's position
- Sprite frame offset varies by growth stage and facing direction
- Kills the original fish

**Stimulus Impact:**
- Stimulus 80: Rewards the creature for eating (standard food stimulus)

---

## Fish Egg (2 18 21)

Eggs laid by adult handle fish during reproduction. They drift slowly in water with slight gravity, high friction, and bounce. Each egg emits CA 6 at 0.25 intensity (stronger than adult fish). After a random incubation period (15,000-20,000 ticks), the egg hatches into a baby handle fish.

**Key Properties:**
- Sprite: `graspit`, 4 frames starting at frame 200, z-order 4000
- BHVR 48, attr 199, clac -1
- Gravity (accg 1), high air resistance (aero 7), perm 75, fric 99, elas 50
- Emits CA 6 at intensity 0.25

**Agent Variables:**

| Variable | Purpose |
|---|---|
| ov10 | Horizontal drift direction |
| ov11 | Vertical drift direction |
| ov60 | Incubation timer (random 15000-20000) |
| ov61 | Set to 30 at creation |
| ov66 | Delayed hatch flag (66 = needs delayed hatch) |
| ov67 | Hatch animation stage (0=not started, 1=complete) |
| ov80 | Behavior state: 0=drifting, 1=hatching |
| ov86 | Out-of-water tick counter |
| ov87 | Gravity accumulator for out-of-water |
| ov99 | Death flag (5 = picked up by hand) |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Drift behavior, room check, hatching |
| Eat | 12 | Creature eats the egg |

### Timer Event (9) - Drift and Hatch

1. **Room Check (`room`)**: Same water validation as adult fish. Gravity increases if out of water. Dies after 100 ticks outside water. In water, elasticity is 0 (no bouncing).

2. **Death Check**: If ov99=5, kills self (picked up by hand).

3. **Drift Behavior (`drft`)**: Random small movements - 10% chance each tick to change horizontal or vertical drift direction. Checks obstacles and reverses direction. If near the bottom (obstacle below < 20), increases gravity and transitions to hatching state.

4. **Hatching (`htch`)**:
   - Waits for incubation period (ov60, random 15,000-20,000 ticks)
   - Plays a shaking animation (100 loops of random velocity bursts)
   - Spawns a new baby handle fish (2 15 16) at the egg's position with default initialization
   - Randomly assigns prey type to the new fish
   - Kills the egg
   - If being carried when trying to hatch, sets delayed hatch flag (ov66=66)

### Eat Event (12) - Creature Consumption

- Sends **stimulus 80** with strength 1 to the eating creature
- Kills the egg immediately

**Stimulus Impact:**
- Stimulus 80: Rewards the creature for eating (standard food stimulus)

---

## Dead Fish (2 10 41)

A temporary corpse agent created when a handle fish dies (naturally or by being eaten). It displays a decomposition animation before removing itself. The sprite and frame count vary depending on whether the fish died naturally or was eaten by a creature.

**Key Properties:**
- Sprite: `dead_fish`, 3 or 4 frames depending on death type
- High permeability (perm 99), low elasticity (elas 15), high friction (fric 100)
- In water: no gravity (attr 208); On land: gravity enabled (attr 209)
- Initial velocity in the direction the fish was facing

**Agent Variables:**

| Variable | Purpose |
|---|---|
| ov77 | Death type: 5=natural death (3 decomposition frames), 8=eaten (4 decomposition frames) |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Decomposition animation and cleanup |

### Timer Event (9) - Decomposition

Plays a sequential pose animation representing decomposition:
- **Natural death (ov77=5)**: Pose 0 → wait → Pose 1 → wait → Pose 2 → kill self (3 stages)
- **Eaten death (ov77=8)**: Pose 0 → wait → Pose 1 → wait → Pose 2 → wait → Pose 3 → kill self (4 stages)

Each wait is 100 ticks between frames.

---

## Removal Script

The removal script (rscr) cleans up all fish ecosystem agents:
- Enumerates and kills all handle fish (2 15 16)
- Enumerates and kills all fish eggs (2 18 21)
- Enumerates and kills all dead fish (2 10 41)
- Removes all event scripts (scrx) for all three agent types

## Ecosystem Impact

- **CA Emission**: Fish emit CA 6 at 0.15 intensity; eggs at 0.25 intensity. This creates a nutrient smell gradient in aquatic rooms.
- **Population Self-Regulation**: The egg-laying subroutine counts nearby fish and eggs. Populations above 16 trigger parent death; populations below 14 allow reproduction of 1-3 eggs.
- **Food Chain Participation**: Fish hunt prey organisms (classifiers 2 13 8, 2 3 6, 2 3 7, 2 3 8) and can themselves be eaten by creatures, providing stimulus 80.
- **Aquatic Room Dependency**: All fish agents are strictly aquatic (room type 9). Leaving water triggers a gradual gravity increase simulating suffocation, leading to death after approximately 100 ticks.
