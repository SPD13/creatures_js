# hedgehog.cos - Hedgehog Lifecycle Ecosystem

**Source**: `Assets/Bootstrap/001 World/hedgehog.cos`

## Overview

This script implements the hedgehog lifecycle ecosystem for the Creatures 3 world. It creates hedgehogs that roam the environment, search for food across multiple genera, reproduce sexually via a mating and pregnancy system, and eventually die of old age or starvation. Hedgehogs feature a gendered reproduction model: one gender (ov06=0) can become pregnant and give birth, while the other (ov06=1) cannot. Hedgehogs have a full lifecycle progressing from juvenile to adult, with a defensive curling-up behavior when threatened.

The hedgehog ecosystem involves two distinct agent forms: living hedgehogs (2 15 5) that are the active roaming form with both juvenile and adult life stages, and dead hedgehog corpses (2 10 15) that decompose and release nutrients back into the room. Hedgehogs navigate using obstacle detection, can be picked up by creatures, and provide an "eaten critter" stimulus when consumed (script 12).

At bootstrap, 2 adult hedgehogs are created at random positions (x: 2000-2800, y: 700), one of each gender.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 5 | Hedgehog | `hedgehog` frame 0 | Active form — roams, feeds, mates, reproduces, curls up defensively | [Detail](#hedgehog-2-15-5) |
| 2 10 15 | Dead Hedgehog | `hedgehog` frame 50 | Decomposing hedgehog corpse; releases nutrients and water into room | [Detail](#dead-hedgehog-2-10-15) |

---

## Hedgehog (2 15 5)

The hedgehog is the primary active form of the lifecycle. It walks around the world searching for food, avoids obstacles, seeks mates when mature, and reproduces through a pregnancy system. The hedgehog uses a state machine driven by its timer event, with directional sprite animations for left and right facing movement. It has a distinctive defensive behavior where it curls into a ball. Hedgehogs progress from juvenile (ov05=1) to adult (ov05=2) life stages via the maturation subroutine.

### Bootstrap Configuration

2 adult hedgehogs are created at startup:

| Property | Value | Notes |
|---|---|---|
| Count | 2 | Created in a `reps 2` loop |
| Position | x: 2000-2800, y: 700 | Random horizontal placement |
| Sprite | `hedgehog` | 50 frames, starting at frame 0, plane 2500 |
| `accg` | 1 | Light gravity |
| `perm` | 99 | Nearly impassable permeability |
| `tick` | 8 | Timer interval |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 0 | No air resistance |
| `elas` | 5 | Low elasticity |
| `bhvr` | 16 | Creatures can pick up |
| `fric` | 20 | Low friction |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov00` | Behavior state | 0 (Roam) |
| `ov01` | Age counter (ticks lived) | 1000 (adult) / 1 (juvenile) |
| `ov02` | Energy level | 800 |
| `ov05` | Life stage (1=juvenile, 2=adult) | 2 (bootstrap adults) |
| `ov06` | Gender (0=can become pregnant, 1=cannot) | Alternating per hedgehog |
| `ov10` | X direction (-1=left, 1=right) | 1 |
| `ov11` | Y direction (-1=up, 1=down) | 1 |
| `ov16` | Target agent reference | null |
| `ov20` | Maturity counter | 0 |
| `ov30` | Anim base: walk left | 0 |
| `ov31` | Anim base: walk right | 8 |
| `ov32` | Anim base: reserved left | 16 |
| `ov33` | Anim base: reserved right | 20 |
| `ov34` | Anim base: death/decompose left | 24 |
| `ov35` | Anim base: death/decompose right | 27 |
| `ov36` | Anim base: reserved | 30 |
| `ov37` | Anim base: reserved | 34 |
| `ov38` | Anim base: curl up left | 38 |
| `ov39` | Anim base: curl up right | 44 |
| `ov61` | CA smell emission value | 60 |
| `ov70` | Pregnancy counter (0=not pregnant) | 0 |
| `ov72` | Energy gained per food eaten | 400 |
| `ov73` | Hunger threshold (seek food) | 400 |
| `ov74` | Satiated threshold (stop eating) | 800 |
| `ov75` | Movement flag | 1 |

### Behavior States (`ov00`)

| State | Name | Description |
|---|---|---|
| 0 | Roam | Default — walks around randomly, occasionally curls up defensively, may reverse direction |
| 1 | Seek Food | Energy below hunger threshold — finds nearest food agent and pursues it |
| 2 | Seek Mate | Age > 1000 and maturity > 200 — searches for another hedgehog to mate with |
| 4 | Pregnant Idle | Set after successful mating (gender 0 only) — pregnancy counter advances |
| 6 | Pursue Mate | Mate target found — actively moving toward mate |
| 7 | Lay Young | Pregnancy counter > 10 — gives birth to baby hedgehogs |
| 99 | Die | Energy depleted or age exceeded 2000 — transforms into dead hedgehog corpse |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop — state machine, obstacle avoidance, energy/age/pregnancy management |
| 12 | Eat | Consumed by a creature — provides "eaten critter" stimulus (80, intensity 4), then dies |

### Timer Event (Script 9) — Detailed Behavior

Each timer tick:

1. **Friction and counters**: Sets friction to 100, increments age (`ov01`), decrements energy (`ov02`). If age > 1000, increments maturity counter (`ov20`).

2. **Hostile room check**: If in room type 8 or 9 (engineering/machine rooms) and not being carried, energy is rapidly drained (-100 per tick).

3. **Pregnancy advancement**: If `ov70` > 0 (pregnant), increments pregnancy counter.

4. **Maturation**: If age > 1000 and life stage is juvenile (`ov05` == 1), calls `matr` subroutine to mature into an adult hedgehog (creates new adult, kills juvenile).

5. **State transitions**:
   - If age > 1000, maturity > 200, and state != 3 -> transition to Seek Mate (state 2)
   - If pregnancy counter > 10 -> transition to Lay Young (state 7)
   - If energy < hunger threshold (`ov73` = 400) -> transition to Seek Food (state 1)
   - If energy <= 0 or age > 2000 -> transition to Die (state 99)

6. **Obstacle avoidance**: Checks distances to obstacles in all 4 directions (`obst 0-3`). If too close to a wall (< 30 pixels), reverses the corresponding movement direction.

7. **State execution**:
   - **Die (99)**: Calls `die_` subroutine — creates a dead hedgehog corpse (2 10 15) at current position, plays death/curl animation, kills the living hedgehog.
   - **Seek Food (1)**: Calls `gfod` subroutine — searches for nearest food agent across multiple genera, moves toward it, and on contact gains energy and sends eat message to the food.
   - **Seek Mate (2)**: Uses `find` subroutine to locate nearest hedgehog (2 15 5), transitions to Pursue Mate (state 6) if found, otherwise returns to Roam.
   - **Pursue Mate (6)**: Calls `mate` subroutine — hunts toward mate target, on contact: gender 0 becomes pregnant (`ov70`=1, state=4), gender 1 returns to roaming. Maturity counter resets.
   - **Lay Young (7)**: Calls `layg` subroutine — if population < 4, creates 2 baby hedgehogs at current position, resets pregnancy state.
   - **Roam (0)**: Calls `roam` subroutine — randomly reverses direction, occasionally curls up defensively (1 in 20 chance), then walks.

### Food Seeking System

The `gfod` subroutine searches for food agents in priority order:

| Priority | Classifier | Description |
|---|---|---|
| 1 | 2 14 0 | First food preference (genus 14) |
| 2 | 2 13 0 | Second food preference (genus 13) |
| 3 | 2 8 0 | Third food preference (genus 8) |
| 4 | 2 9 0 | Fourth food preference (genus 9) |
| 5 | 2 3 0 | Last resort food (genus 3) |

Each classifier is searched using `esee` via the `find` subroutine, which selects the nearest visible agent by squared distance. On contact with the food target (`touc`), the hedgehog gains `ov72` (400) energy and sends message 12 (eat) to the food, consuming it. Returns to roaming when energy exceeds the satiated threshold (`ov74` = 800).

### Defensive Curling Behavior

The `hide` subroutine plays a curling-up animation:
- Uses animation base `ov39` (right-facing) or `ov38` (left-facing) depending on direction.
- Plays curl-up frames [0 1 2 3 4], waits 80 ticks, then plays uncurl frames [4 3 2 1 0].
- Triggered randomly during roaming (1 in 20 chance per tick).

### Reproduction System

**Mating**: When two hedgehogs meet (state 6, `mate` subroutine):
- The hedgehog hunts toward its mate target using directional movement.
- On contact: if gender 0, pregnancy begins (`ov70`=1) and state changes to 4 (Pregnant Idle). If gender 1, returns to roaming (state 0). Maturity counter resets to 0 for both outcomes.

**Maturation** (`matr` subroutine): When a juvenile (ov05=1) reaches age > 1000:
- Creates a new adult hedgehog (2 15 5) at the juvenile's position with adult properties (ov01=1000, ov05=2).
- Inherits gender and direction from the juvenile.
- Kills the juvenile.

**Birth** (`layg` subroutine): When pregnancy counter > 10:
- Counts existing hedgehogs; if population < 4, creates 2 baby hedgehogs at current position.
- Babies start with ov01=1 (newborn age), ov05=1 (juvenile life stage), and alternating genders.
- Resets pregnancy counter (`ov70`=0), maturity counter (`ov20`=0), and returns to roaming.

### Movement System

The hedgehog moves by walking:
- **Walk**: Sets velocity based on direction (`ov10` for X, `ov11` for Y) with magnitudes va10=8 horizontal, va11=6 vertical.
- **Walk animation**: Uses 8 frames [0 1 2 3 4 5 6 7] from base `ov30` (left) or `ov31` (right).
- **Direction**: `ov10 <= 0` = facing/moving left, `ov10 > 0` = facing/moving right.
- Vertical velocity is zeroed after positioning (`setv vely 0`).

### Eat Event (Script 12) — Stimulus

When a creature eats the hedgehog:
- Sends stimulus 80 (eaten critter) with intensity 4 to the creature that ate it (`stim writ from 80 4`).
- The hedgehog is killed (`kill ownr`).

---

## Dead Hedgehog (2 10 15)

The dead hedgehog is a decomposing corpse created when a living hedgehog dies (state 99). It displays a death pose and gradually decomposes, releasing nutrients and water back into the room before disappearing. The sprite frame used depends on whether the hedgehog died as an adult (frame 0) or juvenile (frame 50).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hedgehog` | Starting at frame 0 (adult) or 50 (juvenile), plane 2000 |
| `accg` | 2 | Gravity |
| `elas` | 1 | Very low elasticity |
| `fric` | 80 | High friction (stays in place) |
| `tick` | 4 | Fast timer for decomposition |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 0 | No air resistance |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov10` | Facing direction (inherited from living hedgehog) | From parent |
| `ov34` | Anim base: decompose left | 24 |
| `ov35` | Anim base: decompose right | 27 |
| `ov61` | CA smell emission value | 20 |
| `ov01` | Decomposition counter | 0 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition cycle — displays death pose, plays decay animation, releases nutrients, then disappears |

### Timer Event (Script 9) — Decomposition

Each timer tick:
1. Sets elasticity to 1 and friction to 80, increments decomposition counter (`ov01`), applies heavy gravity (`accg` 3).
2. If not being carried (`carr = null`):
   - **Left-facing** (`ov10 <= 0`): Sets base 0, pose 0 (left death pose).
   - **Right-facing** (`ov10 > 0`): Sets base `ov35` (27), pose 4 (right death pose).
3. If decomposition counter > 200:
   - Plays decomposition animation [0 1 2] from the appropriate directional base (`ov34` for left, `ov35` for right).
   - **Room CA impact**: If in a valid room and not carried, increases the room's nutrient protein (CA 3) by 0.2 and water (CA 4) by 0.2 via `altr`.
   - After the animation completes (`over`), the corpse is killed.

### Impact on Room CA

| CA Property | Change | Description |
|---|---|---|
| 3 (Nutrient/Protein) | +0.2 | Releases nutrients into the room during decomposition |
| 4 (Water) | +0.2 | Releases water into the room during decomposition |

---

## Removal Script

The removal script (`rscr`) cleans up all hedgehog-related agents:
- Kills all living hedgehogs (2 15 5).
- Removes hedgehog scripts: events 9 (timer) and 6 (collision — referenced but not defined in this file).
