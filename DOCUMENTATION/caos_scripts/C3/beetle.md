# Beetle Ecosystem

## Overview

This script implements a small beetle ecosystem in the Norn terrarium area. Four beetles are created at startup, each exhibiting autonomous behaviors including roaming on the ground, short bursts of flight, foraging for food when hungry, and dying when energy is fully depleted. Beetles are simple critters that serve as a food source for creatures - they can be eaten (hit event) providing nutritional stimulus, or pushed/activated providing a "hit critter" stimulus.

Beetles have a basic energy economy: they lose energy over time (faster in water rooms of type 8 or 9), and when hungry they search for nearby detritus (family 2, genus 10) to consume and recover energy. When a beetle's energy is exhausted or its state is set to 99, it dies and spawns a dead beetle carcass in its place. The script also contains unused subroutines for egg-laying (`layg`) and mating/reproduction (`matr`), suggesting these features were planned but not connected to the main behavior loop.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 2 14 3 | [Beetle](#beetle-2-14-3) | Ground-dwelling critter that roams, flies briefly, and forages for food |
| 2 10 29 | [Dead Beetle](#dead-beetle-2-10-29) | Beetle carcass created on death, serves as detritus |
| 2 18 8 | [Beetle Egg](#beetle-egg-2-18-8) | Egg laid by beetle (unused - `layg` subroutine is never called) |

---

## Beetle (2 14 3)

The beetle is a simple agent that roams the Norn terrarium floor, occasionally taking short flights, and searches for detritus to eat when hungry. It is interactive: creatures can push it (stimulus 88 - "hit critter") or eat it (stimulus 80 - "eaten animal"). Four beetles are spawned during installation, all at position (1700, 2050).

### Installation

Four beetles are created using `reps 4` with identical properties:
- Sprite: "beetle2", 36 images, starting at frame 0, z-order 2500
- Physics: `accg 2`, `perm 100`, `aero 0`, `elas 1`, `fric 20`
- `attr 195` (128+64+2+1 = physics + collisions + mouseable + carryable)
- `bhvr 17` (1+16 = push + eat)
- `tick 8`

### Beetle Variables

| Variable | Initial Value | Description |
|---|---|---|
| ov00 | 0 | Behavior state (0=roaming, 1=hungry/foraging, 99=dying) |
| ov01 | 2000 | Age counter (increments each tick) |
| ov02 | 600 | Energy level (decrements each tick) |
| ov05 | 2 | Species identifier |
| ov06 | rand 0 1 | Gender (0 or 1, randomly assigned) |
| ov10 | 1 | Horizontal direction (-1=left, 1=right) |
| ov11 | -1 | Vertical direction (-1=up, 1=down) |
| ov16 | null | Current food target agent |
| ov20 | 0 | Reproduction counter (incremented but never used) |
| ov30 | 0 | Animation base: walking left |
| ov31 | 11 | Animation base: walking right |
| ov32 | 22 | Animation base: flying left |
| ov33 | 29 | Animation base: flying right |
| ov34-36 | 0 | Unused animation bases |
| ov61 | 42 | Smell classifier |
| ov72 | 400 | Energy gained per food consumed |
| ov73 | 400 | Hunger threshold (foraging begins when energy < this) |
| ov74 | 800 | Full threshold (stops foraging when energy > this) |
| ov75 | 1 | Movement active flag |
| ov80 | 50 | Flight energy (decremented when flying, recharged when roaming) |

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | Beetle is pushed by a creature |
| Collision | 6 | Beetle bumps into a wall or obstacle |
| Timer | 9 | Main behavior loop (AI tick) |
| Eat | 12 | Beetle is eaten by a creature |

### Push (Event 1) - Creature Interaction

When a creature pushes the beetle, it sends stimulus 88 (`STIM_HIT_CRITTER`) with intensity 1 to the creature that pushed it. This provides sensory feedback to the creature for interacting with a small critter.

**Stimulus impact:**
- `stim writ from 88 1` - Sends "hit critter" stimulus to the pushing creature

### Collision (Event 6) - Wall Bounce

When the beetle collides with an obstacle, it reverses its horizontal direction based on the collision parameters:
- If `_p1_ > 0` and `_p2_ < -4`: sets direction to left (ov10 = -1)
- If `_p1_ <= 0` and `_p2_ < -4`: sets direction to right (ov10 = 1)
- Resets flight energy to 0 (ov80 = 0), preventing immediate re-flight after collision

### Timer (Event 9) - Main Behavior Loop

The timer script is the core AI loop that runs every 8 ticks. It processes aging, energy, state transitions, and behavior execution.

**Aging and energy:**
- Age (ov01) increments by 1 each tick
- Energy (ov02) decrements by 1 each tick
- If in a water room (rtyp 8 or 9) and not being carried, energy decreases by an additional 100 (beetles drown quickly in water)

**Reproduction counter (unused):**
- When age exceeds 2010, every 10 age ticks increments ov20 by 1
- This counter is never checked or used in the behavior loop, suggesting cut reproduction functionality

**State transitions:**
- If state is 99 → execute death subroutine
- If energy drops below hunger threshold (ov73=400) → set state to 1 (hungry)

**State-based behaviors:**
- **State 99 (dying):** Calls `die_` subroutine - spawns a dead beetle carcass and kills the beetle
- **State 1 (hungry):** Calls `gfod` subroutine - searches for and hunts nearby detritus
- **State 0 (idle):** If airborne (obstacle distance > 10) and has flight energy → calls `fly_`; otherwise calls `roam`

#### Roaming Behavior (`roam` subroutine)

The beetle randomly moves along the ground with occasional short flights:
- Random chance (1 in 6) to take flight if flight energy (ov80) > 0: plays takeoff animation then calls `fly_`
- Flight energy (ov80) recharges by 1 each roam tick, capped at 100
- Random direction changes: small chance to reverse horizontal or vertical direction
- Ensures horizontal direction is never 0 (always moving left or right)
- Sets movement velocity and animation, then stops script until next tick

#### Flying Behavior (`fly_` subroutine)

A short burst of erratic flight:
- Plays beetle sound effect ("btle")
- Decrements flight energy (ov80) by 1
- Sets random velocity: horizontal -5 to 5, vertical -5 to -15 (upward bias)
- Sets flying animation and applies movement

#### Food Finding (`gfod` subroutine)

When hungry, the beetle searches for and pursues nearby detritus:
1. If no current target (ov16 is null), calls `find` to locate nearest food
2. If target found, calls `hunt` to move toward it
3. On contact with target (`touc` check), consumes it:
   - Gains ov72 (400) energy
   - Sends message 12 (eat) to the food target, killing it
   - If energy exceeds full threshold (ov74=800), returns to idle state (ov00=0)
4. If no food found, returns to idle state

#### Food Search (`find` subroutine)

Searches for the nearest food agent using ESEE (enumerate seen agents):
- Searches for agents with family=2, genus=10, species=0 (detritus/food items)
- Calculates squared distance to each candidate
- Selects the nearest one and stores it as ov16 (food target)

#### Hunting (`hunt` subroutine)

Moves toward the current food target:
- Gets target position and adjusts beetle direction to face target
- If target has been destroyed, resets to idle state

#### Death (`die_` subroutine)

When a beetle dies, it spawns a dead beetle carcass:
- Creates a new agent (2 10 29) at the beetle's position, offset by (-20, -8)
- Sprite varies by age: if ov01 > 2000, uses frame 16 (8 images); otherwise frame 40 (8 images)
- The dead beetle inherits the direction (ov10) of the living beetle
- Physics: `accg 2`, `tick 4`, `attr 195`, `aero 0`
- Dead beetle variables: ov01=0, ov61=11 (dead beetle smell)
- The original beetle is killed

#### Animation (`anim` subroutine)

Sets the beetle's animation based on its state:
- **On ground** (obstacle distance <= 10):
  - Facing left: base ov30 (0), frames 0-10
  - Facing right: base ov31 (11), frames 0-10
- **In air** (obstacle distance > 10):
  - Facing left: base ov32 (22), frames 5-6 (looping)
  - Facing right: base ov33 (29), frames 5-6 (looping)
  - Vertical direction forced to -1 (upward)

### Eat (Event 12) - Being Eaten

When a creature eats the beetle:
- Sends stimulus 80 (`STIM_EATEN_ANIMAL`) with intensity 1 to the eating creature
- The beetle is killed (`kill ownr`)

**Stimulus impact:**
- `stim writ from 80 1` - Provides "eaten animal" nutritional stimulus to the creature

---

## Dead Beetle (2 10 29)

A simple detritus agent representing a beetle carcass. Created by the beetle's death subroutine. It has a tick rate of 4 and uses the "beetle2" sprite set. The dead beetle has smell classifier 11, making it identifiable as detritus by creatures and other agents that forage for food.

### Properties

- Sprite: "beetle2", 8 images, z-order 2000
- Starting frame varies: 16 (older beetle) or 40 (younger beetle)
- Physics: `accg 2`, `attr 195`, `aero 0`
- `tick 4`
- ov10: inherited direction from living beetle
- ov01: 0 (reset age)
- ov61: 11 (detritus smell classifier)

No event scripts are defined specifically for the dead beetle in this file. It serves as passive food/detritus for other agents that consume family 2, genus 10 items.

---

## Beetle Egg (2 18 8)

An egg agent defined in the `layg` subroutine but never actually spawned during normal gameplay, as the `layg` subroutine is never called from the timer loop or any event script. This appears to be a cut or incomplete reproduction feature.

### Properties (as defined in `layg`)

- Sprite: "beetle2", 4 images, starting at frame 48, z-order 4100
- Physics: `accg 2`, `attr 195`
- `tick 10`
- ov00: 0, ov01: 0 (fresh), ov02: 255 (full energy), ov70: 0, ov61: 20 (egg smell)

---

## Unused Subroutines

### Mating (`matr` subroutine)

Defined but never called. Would create a new beetle (2 14 3) near the current beetle's position at offset (-32, -12):
- New beetle starts with `accg 0` (no gravity initially)
- Inherits state (ov00) and gender (ov06) from parent
- Gets fresh energy (ov02=800) and reset age (ov01=2000)
- The parent beetle is killed after spawning the offspring

### Egg Laying (`layg` subroutine)

Defined but never called. Would create a beetle egg (2 18 8) near the beetle's position. The egg placement is offset based on the beetle's facing direction.

---

## Remove Script

The remove script (`rscr`) cleanly removes all beetles:
- Enumerates and kills all beetles (2 14 3)
- Removes event scripts: `scrx 2 14 3 9` (timer) and `scrx 2 14 3 6` (collision)
