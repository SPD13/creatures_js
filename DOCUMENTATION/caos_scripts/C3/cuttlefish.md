# Cuttlefish (cuttlefish.cos)

This script creates three cuttlefish that swim in the aquatic area of the Ark. Cuttlefish are aquatic critters that perform smooth figure-eight swimming patterns through the water, pausing occasionally to hover. They are capable of camouflage, changing their base sprite depending on the type of nearby creature or predator. If a cuttlefish leaves the water, it will attempt to return, but if it remains out of water for too long, it dies.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 2 15 20 | Cuttlefish | Aquatic critter that swims in figure-eight patterns with camouflage abilities | [Details](#cuttlefish-2-15-20) |

---

## Cuttlefish (2 15 20)

An aquatic critter placed at position (3800, 1964) in the underwater section of the Ark. Three instances are created at bootstrap. The cuttlefish uses a sprite sheet with 216 frames ("cuttlefish") containing animations for swimming left, swimming right, hovering, grabbing, fading out, and camouflage color variants. It renders at plane 5100.

**Attributes:** 198 (carryable, mouse-clickable, suffers physics, camera-shy)

**Physics:** No gravity (accg 0), no elasticity (elas 0) - the cuttlefish manages its own movement through velocity manipulation.

**Interaction range:** 200

### Agent Variables

| Variable | Initial Value | Purpose |
|---|---|---|
| ov10 | -1 or 1 (random) | Horizontal facing direction (-1 = left, 1 = right) |
| ov12 | 2 | Horizontal velocity component |
| ov13 | 0 | Vertical velocity component |
| ov61 | 50 | Unknown (possibly life/health value) |
| ov70 | 0 | Movement quadrant state (0-3), controls swimming direction |
| ov71 | -1 | Direction toggle, flipped during movement transitions |
| ov99 | 1 | Speed increment per tick |
| ov00 | 0 | Hover flag (1 = currently hovering, 0 = swimming) |
| ov86 | 0 | Out-of-water counter (ticks spent outside water room) |
| ov87 | 0 | Gravity accumulator (increases while out of water) |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main behavior loop, fires every tick |

### Timer Script (Event 9) - Main Behavior

The timer script drives all cuttlefish behavior each tick:

**1. Room Check (`gsub room`)**
Verifies the cuttlefish is in a water room (room type 9). If not:
- Increases an out-of-water counter (ov86) and gravity accumulator (ov87)
- Sets elasticity to 50 to bounce off surfaces
- If out of water for 100+ ticks, plays a fade-out animation and kills itself
- When back in water, resets counters and removes gravity/elasticity

**2. Swimming Animation (`gsub swim`)**
Sets the appropriate swimming animation based on facing direction (ov10):
- Facing right (ov10 > 0): base 0, frames 0-9
- Facing left (ov10 <= 0): base 10, frames 0-9

**3. Hover Pause**
If the hover flag (ov00) is set:
- Stops all velocity
- Plays a hover animation (4 frames, direction-dependent)
- Waits 20 ticks, then resumes swimming

**4. Camouflage System**
Checks for nearby entities using `esee` and changes base sprite accordingly:
- Near a Grendel Mother (2 16 3): base 54 (camouflage variant 1)
- Near a Grendel (2 16 4): base 108 (camouflage variant 2)
- Near a Creature (4 0 0): base 162 (camouflage variant 3)

This simulates the cuttlefish changing color to blend in or react to nearby creatures.

**5. Figure-Eight Swimming Pattern**
The core movement logic uses a state machine with four quadrant states (ov70 = 0-3) and a direction toggle (ov71). The cuttlefish accelerates in curves:

- **State 0:** Decelerates horizontally, accelerates downward (moving left-down arc)
- **State 1:** Decelerates horizontally, decelerates vertically (moving left-up arc)
- **State 2:** Accelerates horizontally, decelerates vertically (moving right-up arc)
- **State 3:** Accelerates horizontally, accelerates downward (moving right-down arc)

At each state transition (when velocity crosses zero in the relevant axis):
- 75% chance: transitions to the next movement state, possibly flipping ov71
- 25% chance: enters hover mode (ov00 = 1), causing a brief pause

Velocity is clamped to the range [-5, 5] in both axes. The facing direction (ov10) updates based on horizontal velocity sign.

### Subroutines

| Subroutine | Purpose |
|---|---|
| `room` | Water room validation - applies gravity and kills if out of water too long |
| `swim` | Sets swimming animation frames based on facing direction |
| `hovr` | Sets hovering animation frames based on facing direction |
| `grab` | Sets grab animation (11 frames) when picked up |
| `fout` | Fade-out death animation (4 frames) |
| `f_in` | Fade-in animation (4 frames, reverse of fade-out) |

### Removal Script

The removal script (`rscr`) kills all existing cuttlefish instances (2 15 20) and removes the timer script (scrx 2 15 20 9).
