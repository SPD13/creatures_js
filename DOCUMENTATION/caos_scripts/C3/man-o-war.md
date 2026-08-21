# man-o-war.cos - Man-o-War Jellyfish Ecosystem

**Source**: `Assets/Bootstrap/001 World/man-o-war.cos`

## Overview

This script implements a man-o-war jellyfish ecosystem for the Creatures 3 world. It creates floating jellyfish that drift through aquatic rooms (room types 8 and 9), hunt for critters to eat, and reproduce by laying juvenile offspring. The ecosystem features a complete lifecycle with three distinct agent types: adult jellyfish, dead jellyfish remains, and juveniles that mature into adults.

Man-o-war jellyfish are aquatic predators that roam water rooms, actively seek and hunt prey (other critters from family 2), consume them to restore energy, and lay juvenile offspring when they have lived long enough. They die when they leave water rooms or when their energy is fully depleted. Dead jellyfish decompose and release nutrients (raising room CA properties 3 and 4 — likely nutrients and light/heat). Juveniles are smaller, simpler creatures that grow until they mature into full adult jellyfish.

At bootstrap, 2 adult jellyfish are created at position (5600, 2200), both pre-aged with 2000 ticks of life and starting energy of 400.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 17 | Man-o-War (Adult) | `man-o-war` frame 0 | Adult jellyfish — roams water, hunts critters, eats prey, lays juveniles | [Detail](#man-o-war-adult-2-15-17) |
| 2 10 38 | Dead Man-o-War | `man-o-war` frame 27 | Decomposing jellyfish remains — sinks and releases nutrients into room | [Detail](#dead-man-o-war-2-10-38) |
| 2 18 23 | Man-o-War Juvenile | `man-o-war` frame 82 | Young jellyfish — drifts in water, grows, matures into adult | [Detail](#man-o-war-juvenile-2-18-23) |

---

## Man-o-War Adult (2 15 17)

The adult man-o-war is a free-floating aquatic predator. It uses a state machine to cycle between roaming, hunting prey, eating, laying juveniles, and dying. It navigates by setting horizontal direction and vertical velocity, checking for obstacles, and staying within water rooms (room types 8 and 9). If it drifts out of water, it dies immediately.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Count | 2 | Two adults created at startup |
| Position | (5600, 2200) | Starting location in water |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `accg` | 0 | No gravity (floats) |
| `perm` | 80 | High permeability |
| `tick` | 8 | Timer interval |
| `aero` | 1 | Minimal air resistance |
| `elas` | 1 | Minimal elasticity |
| `fric` | 90 | High friction |
| `bhvr` | 17 | Creatures can push and pull |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Find Food, 2=Eating, 6=Lay Juvenile, 99=Die |
| `ov01` | Age counter | Starts at 2000; increments each tick |
| `ov02` | Energy level | Starts at 400; decrements each tick, restored by eating |
| `ov05` | Depth offset flag | 2=adult (adds 20 to depth check position) |
| `ov06` | Random variant | 0 or 1 (random at creation) |
| `ov10` | X direction | -1=Left, 1=Right |
| `ov11` | Y direction | Vertical movement component |
| `ov16` | Target prey agent | Agent reference to current food target |
| `ov17` | Captured prey agent | Agent reference to prey being consumed |
| `ov20` | Reproduction counter | Increments each tick; triggers laying at >400 |
| `ov30`-`ov40` | Animation bases | Frame offsets for directional swim animations |
| `ov61` | CA smell emission | 60 |
| `ov72` | Energy gain from eating | 600 |
| `ov73` | Hunger threshold | 600 (triggers food-seeking when energy drops below) |
| `ov74` | Satiation threshold | 800 (stops food-seeking when energy exceeds) |
| `ov75` | Reproduction enabled | 1 |
| `ov80` | Bounce cooldown | 50 (reset on wall bounce) |
| `ov88` | Eating animation counter | 100; decrements during eating; prey consumed at <50 |

### Animation Bases

| Variable | Base Frame | Description |
|---|---|---|
| `ov30` | 0 | Swim animation set 1 |
| `ov31` | 11 | Swim animation set 2 |
| `ov32` | 22 | Turn animation |
| `ov33` | 27 | Additional animation set |
| `ov34` | 34 | Additional animation set |
| `ov35` | 41 | Additional animation set |
| `ov36` | 52 | Additional animation set |
| `ov37` | 63 | Additional animation set |
| `ov38` | 68 | Additional animation set |
| `ov39` | 75 | Additional animation set |
| `ov40` | 82 | Juvenile/small animation base |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: state machine, movement, hunting, reproduction |
| 12 | Eat | Creature eats the jellyfish: provides stimulus and self-destructs |
| 5 | Drop | Dropped: applies gravity (accg 4) so it falls |
| 1 | Activate 1 | Pushed by creature: sends stimulus 88 (hit critter) |
| 6 | Collision | Wall bounce: reverses horizontal direction based on collision angle |

### Event Details

#### Timer (Event 9) - Main Behavior Loop

The timer event drives the entire jellyfish AI through a state machine. Each tick:

1. **Age and energy update**: Age (`ov01`) increments, energy (`ov02`) decrements, reproduction counter (`ov20`) increments.
2. **Water room check**: If not carried, checks if current position is in a water room (room types 8 or 9). If outside water on all four corners, the jellyfish dies immediately via `die_` subroutine.
3. **Gravity adjustment**: Sets `accg 0.3` when outside water rooms at the check point, `accg 0` when in water (floating).
4. **State transitions**: Checks energy and age thresholds to update state:
   - Energy < `ov73` (600) → state 1 (Find Food)
   - Reproduction counter > 400 → state 6 (Lay Juvenile)
   - Energy <= 0 → state 99 (Die)
5. **State execution**: Runs the appropriate subroutine for the current state.

**State Machine Subroutines:**

- **`roam` (state 0)**: Random movement — occasionally changes horizontal direction, checks obstacles, sets animation and velocity. The jellyfish drifts aimlessly through water.
- **`gfod` (state 1)**: Food seeking — uses `find` subroutine to locate nearest visible critter (family 2, genus 15, species 0) from species 14, 15, 19, or 16. Hunts toward the target using `hunt` subroutine. On contact, sends message 4 (Pickup) to prey, captures it in `ov17`, and transitions to eating state.
- **`eat_` (state 2)**: Eating — decrements `ov88` (eating counter). When counter drops below 50, kills the captured prey, restores energy by `ov72` (600), and returns to roaming or food-seeking based on current energy level. During eating, the pickup point animates to show prey being consumed.
- **`layg` (state 6)**: Reproduction — counts nearby juveniles (2 18 23) within range 600. If fewer than 4 exist, creates a new juvenile at the jellyfish's position. Resets reproduction counter.
- **`die_`**: Death — creates a Dead Man-o-War (2 10 38) at the current position, preserving direction (`ov10`), then kills itself.

**Helper Subroutines:**

- **`find`**: Scans visible critters (family 2 genus 15 species 0) filtering by species 14, 15, 19, or 16. Selects the nearest one by squared distance.
- **`hunt`**: Faces toward target prey by comparing positions.
- **`obst`**: Obstacle avoidance — reverses horizontal direction when walls are within 20 pixels.
- **`vect`**: Sets random speed values for movement (1-3 horizontal, 1 vertical).
- **`anim`**: Sets swim animation based on direction (uses `ov30` or `ov31` base).
- **`move`**: Applies velocity using direction and speed values.

#### Eat (Event 12) - Eaten by Creature

When a creature eats the jellyfish:
- **Stimulus**: `stim writ from 80 3` — sends "eaten critter" stimulus of intensity 3 to the eating creature.
- Self-destructs (`kill ownr`).

#### Drop (Event 5) - Dropped

When dropped by a creature or agent:
- Sets `accg 4` — applies strong gravity so the jellyfish falls quickly.

#### Activate 1 (Event 1) - Pushed

When pushed by a creature:
- **Stimulus**: `stim writ from 88 1` — sends "hit critter" stimulus of intensity 1 to the pushing creature.

#### Collision (Event 6) - Wall Bounce

When colliding with a wall:
- If moving right (`_p1_ > 0`) and bouncing upward (`_p2_ < -4`): reverses to face left.
- If moving left (`_p1_ <= 0`) and bouncing upward (`_p2_ < -4`): reverses to face right.
- Resets bounce cooldown (`ov80 = 0`).

---

## Dead Man-o-War (2 10 38)

The dead man-o-war is a decomposing jellyfish corpse that sinks and eventually disappears while releasing nutrients into the room environment. It is created when an adult jellyfish dies (leaves water or runs out of energy).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `man-o-war` frame 27 (base) | 16 frames, death animation |
| `accg` | 2 | Moderate gravity (sinks) |
| `tick` | 4 | Fast timer for decomposition |
| `elas` | 0 | No bounce |
| `fric` | 60 | Moderate friction |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 0 | No air resistance |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Decomposition counter | Starts at 0; increments each tick |
| `ov10` | Direction (inherited) | -1=Left, 1=Right (from parent jellyfish) |
| `ov61` | CA smell emission | 10 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition animation and nutrient release |

### Event Details

#### Timer (Event 9) - Decomposition

Each tick increments the decomposition counter (`ov01`). When counter exceeds 0 (immediately on second tick):
- Plays a 6-frame death animation (direction-dependent: base 0 for left, base 8 for right).
- **Room CA Impact**: If in a valid room and not carried, increases room CA properties 3 and 4 by 0.1 each (nutrients and organic waste).
- After animation completes, self-destructs.

---

## Man-o-War Juvenile (2 18 23)

The juvenile man-o-war is a young jellyfish that drifts through water rooms, growing until it matures into a full adult. It has simpler behavior than the adult — no hunting or eating, just movement and obstacle avoidance. When mature enough, it transforms into an adult jellyfish.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `man-o-war` frame 82 (base, via `ov40`) | 88 total frames |
| `accg` | 0 | No gravity (floats) |
| `perm` | 100 | Full permeability |
| `tick` | 8 | Timer interval |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 1 | Minimal air resistance |
| `elas` | 1 | Minimal elasticity |
| `fric` | 90 | High friction |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Behavior state | 0 (always roaming) |
| `ov01` | Age counter | Starts at 0; increments each tick; matures at >500 |
| `ov02` | Energy level | Starts at 400; decrements each tick |
| `ov05` | Depth flag | 0 (no depth offset for water check) |
| `ov10` | X direction | -1=Left, 1=Right |
| `ov11` | Y direction | Vertical movement component |
| `ov20` | Reproduction counter | Starts at 0 (not used until adult) |
| `ov30`-`ov40` | Animation bases | Same values as adult |
| `ov61` | CA smell emission | 50 |
| `ov72` | Energy gain (adult value) | 400 |
| `ov73` | Hunger threshold (adult value) | 400 |
| `ov74` | Satiation threshold (adult value) | 800 |
| `ov80` | Bounce cooldown | 50 |
| `ov88` | Eating counter (adult value) | 100 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Movement, water check, growth, and maturation |

### Event Details

#### Timer (Event 9) - Growth and Movement

Each tick:
1. **Age and energy**: Age increments, energy decrements.
2. **Water room check**: Same as adult — if outside water rooms (types 8 and 9), applies slight gravity; if fully outside water on all corners, dies immediately.
3. **Movement**: Random direction changes with obstacle avoidance. Uses a looping animation (`[0 1 2 3 4 5 4 3 2 1 255]`) at the juvenile animation base (`ov40 = 82`).
4. **Maturation check**: When age exceeds 500, calls `matr` subroutine.

**Maturation Subroutine (`matr`):**
- Counts nearby adult jellyfish (2 15 17) within visual range. If more than 3 adults already exist, aborts maturation.
- Creates a new adult Man-o-War (2 15 17) at the juvenile's position with full adult configuration:
  - Pre-aged at 500 ticks, energy 400
  - `ov05 = 2` (adult depth flag), `ov20 = 430` (near reproduction threshold)
  - All standard adult properties and animation bases
- If the adult can be placed at the position (`tmvt` check), places it and kills the juvenile.
- If placement fails, kills the new adult and resets the juvenile's age counter.

**Death Subroutine (`die_`):**
- Simple self-destruct — no dead body is created for juveniles.

**Helper Subroutines (same logic as adult):**
- `obst`: Obstacle avoidance including vertical (`down`) check.
- `vect`: Random speed (1-3 horizontal, 1-2 vertical — slightly more vertical range than adult).
- `move`: Applies velocity using direction and speed.

---

## Removal Script

The removal script (`rscr`) cleans up all man-o-war agents:
- Enumerates and kills all adult jellyfish (2 15 17) and all juveniles (2 18 23).
- Removes all scripts for both classifiers (events 9 and 6).
