# hoppity.cos - Hoppity (Frog) Lifecycle Ecosystem

**Source**: `Assets/Bootstrap/001 World/hoppity.cos`

## Overview

This script implements the hoppity lifecycle ecosystem for the Creatures 3 world. Hoppities are small hopping critters (frog-like) that bounce around the environment using a hop-land-rest cycle driven by physics and collision detection. They search for food across multiple genera, reproduce by laying eggs when the local population is low, and progress through a three-stage lifecycle: egg, juvenile, and adult.

Hoppities navigate by hopping — they launch themselves into the air with upward velocity, land via gravity and collision, rest briefly, then hop again. They avoid obstacles by reversing direction when walls are detected. In hostile rooms (types 8 and 9, typically engineering/machine rooms), they skip resting and lose energy rapidly, encouraging them to flee.

The ecosystem involves two distinct agent forms: living hoppities (2 15 12) that are the active hopping form with egg, juvenile, and adult life stages, and dead hoppity corpses (2 10 22) that decompose and release nutrients back into the room.

At bootstrap, 2 adult hoppities are created at position (1900, 600).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 12 | Hoppity | `hoppity` frame 0 | Active form — hops, feeds, reproduces, progresses through egg/juvenile/adult stages | [Detail](#hoppity-2-15-12) |
| 2 10 22 | Dead Hoppity | `hoppity` frame 108/248 | Decomposing hoppity corpse; releases nutrients and water into room | [Detail](#dead-hoppity-2-10-22) |

---

## Hoppity (2 15 12)

The hoppity is the primary active form of the lifecycle. It moves by hopping — launching into the air, landing via gravity, resting briefly between hops, then repeating. The collision event (script 6) triggers grounding and the rest state, creating the characteristic hop-land-rest cycle. Hoppities search for food when hungry, reproduce when mature and population is low, and die from starvation or prolonged exposure to hostile rooms.

### Bootstrap Configuration

2 adult hoppities are created at startup:

| Property | Value | Notes |
|---|---|---|
| Count | 2 | Created in a `reps 2` loop |
| Position | (1900, 600) | Fixed position |
| Sprite | `hoppity` | 140 images, starting at frame 0, plane 2000 |
| `accg` | 4 | Moderate gravity (makes hops arc quickly) |
| `perm` | 60 | Moderate permeability |
| `tick` | 4 | Fast timer interval |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 5 | Moderate air resistance |
| `elas` | 5 | Low elasticity |
| `fric` | 90 | High friction (stops quickly on landing) |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov00` | Behavior state | 0 (Roam) |
| `ov01` | Age counter (ticks lived) | 2000 |
| `ov02` | Energy level | 401 |
| `ov05` | Life stage (0=egg, 1=juvenile, 2=adult) | 2 (bootstrap adults) |
| `ov06` | Gender (0 or 1, random) | rand 0 1 |
| `ov10` | X direction (-1=left, 1=right) | -1 |
| `ov11` | Y direction (-1=up, 1=down) | -1 |
| `ov16` | Target agent reference (food) | null |
| `ov20` | Maturity/reproduction counter | 0 |
| `ov30` | Anim base: hop left | 0 |
| `ov31` | Anim base: hop right | 10 |
| `ov32` | Anim base: eat left | 20 |
| `ov33` | Anim base: eat right | 30 |
| `ov34` | Anim base: jump left | 40 |
| `ov35` | Anim base: jump right | 48 |
| `ov36` | Anim base: rest/sleep left | 56 |
| `ov37` | Anim base: rest/sleep right | 69 |
| `ov38` | Anim base: wake left | 83 |
| `ov39` | Anim base: wake right | 96 |
| `ov61` | CA smell emission value | 90 |
| `ov72` | Energy gained per food eaten | 600 |
| `ov73` | Hunger threshold (seek food) | 600 |
| `ov74` | Max energy capacity | 1000 |
| `ov75` | Airborne flag (0=grounded, 1=airborne) | 1 |

### Behavior States (`ov00`)

| State | Name | Description |
|---|---|---|
| 0 | Roam | Default — hops around randomly, avoids obstacles, reverses direction occasionally |
| 1 | Seek Food | Energy below hunger threshold — finds nearest food agent and pursues it |
| 2 | Rest | Triggered on landing — plays rest/sleep animation, pauses 50-200 ticks, then transitions to Wake. Skipped in hostile rooms (type 8/9) |
| 3 | Wake | Plays wake-up animation, then returns to Roam (state 0) |
| 6 | Reproduce | Maturity counter > 400 — spawns a baby hoppity (egg) if population is low |
| 99 | Die | Energy depleted — transforms into dead hoppity corpse |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop — state machine, obstacle avoidance, energy/age management, lifecycle progression |
| 6 | Collision | Landing detection — sets grounded flag, triggers rest state, plays landing animation |

### Timer Event (Script 9) — Detailed Behavior

Each timer tick:

1. **Age and energy**: Increments age (`ov01 += 1`), decrements energy (`ov02 -= 1`). If carried by a creature, resets state to 0 (Roam).

2. **Maturity advancement**: If life stage is adult (`ov05 = 2`), increments maturity counter (`ov20 += 1`). Additionally, after age > 2010, every 10 ticks the maturity counter increments again (accelerating maturity).

3. **Mating/cloning check**: If age > 500, state is 0, and life stage is juvenile (`ov05 = 1`), calls `matr` subroutine to mature into an adult (replaces self with adult copy).

4. **Hostile room drain**: If in room type 8 or 9 (engineering rooms) and not being carried, energy drains rapidly (-40 per tick on top of the normal -1).

5. **Egg hatching**: If life stage is egg (`ov05 = 0`), plays hatching animation based on direction (base 140 for left, base 146 for right, frames [0-5]), then transitions to juvenile (`ov05 = 1`).

6. **State transitions**:
   - If maturity counter > 400 and state is 0 -> transition to Reproduce (state 6)
   - If energy < hunger threshold (`ov73` = 600) -> transition to Seek Food (state 1)
   - If energy <= 0 -> transition to Die (state 99)

7. **Obstacle avoidance**: Checks distances to obstacles in all 4 directions (`obst 0-3`). If too close to a wall (< 30 pixels):
   - `obst 0` (left) < 30: reverse to rightward (`ov10 = 1`)
   - `obst 1` (right) < 30: reverse to leftward (`ov10 = -1`)
   - `obst 2` (below) < 30: set upward (`ov11 = 1`)
   - `obst 3` (above) < 30: set downward (`ov11 = -1`)

8. **State execution**:
   - **Die (99)**: Calls `die_` subroutine — creates a dead hoppity corpse (2 10 22) at current position, plays death animation, kills the living hoppity.
   - **Wake (3)**: Plays wake-up animation (13 frames from `ov38`/`ov39` based on direction), restores attr to 195 (physics + collisions), returns to Roam (state 0).
   - **Rest (2)**: Only if not carried and not in hostile room (type 8/9). Plays rest animation (13 frames from `ov36`/`ov37`), sets attr to 192 (disables physics/collisions during rest), waits 50-200 random ticks, then transitions to Wake (state 3).
   - **Seek Food (1)**: Calls `gfod` subroutine — searches for food, pursues and eats it.
   - **Reproduce (6)**: Calls `baby` subroutine — spawns new egg if population allows.
   - **Roam (0)**: Calls `roam` subroutine — hops around with random direction changes.

### Hop-Land-Rest Cycle

The hoppity's signature movement pattern:

1. **Hop** (roam subroutine, `ov75 = 0` grounded):
   - Random chance to stop and reverse X direction (va66 < 5)
   - Otherwise: sets `ov11 = -1` (upward), `ov75 = 1` (airborne), high friction (90)
   - Sets random velocity (horizontal 8-14, vertical 15-20) and launches

2. **Airborne** (roam subroutine, `ov75 = 1`):
   - While falling (`vely > 0`): displays falling frame (frame 6 from hop base)
   - Gravity (`accg 4`) pulls the hoppity back down

3. **Land** (collision event 6):
   - Sets `ov75 = 0` (grounded)
   - Triggers rest state (`ov00 = 2`) if not carried
   - If landed on ground (`wall = down`): plays landing animation [8 0]

4. **Rest** (state 2): Pauses 50-200 ticks with rest animation, then wakes

5. **Wake** (state 3): Plays wake animation, returns to Roam, cycle repeats

### Food Seeking System

The `gfod` subroutine searches for food agents in priority order:

| Priority | Classifier | Description |
|---|---|---|
| 1 | 2 11 0 | First food preference (genus 11 — plants) |
| 2 | 2 8 0 | Second food preference (genus 8 — seeds/fruit) |

Each classifier is searched using `esee` via the `find` subroutine, which selects the nearest visible agent by squared distance. On contact with the food target (`touc`), the hoppity:
- Stops (friction 100)
- Plays eating animation (18 frames with repeated eating motion from `ov32`/`ov33`)
- Gains `ov72` (600) energy
- Returns to Roam (state 0)

If no food is found, returns to Roam immediately.

### Reproduction System

**Reproduction** (`baby` subroutine, triggered when `ov20 > 400` and state is 0):
- Counts nearby hoppities within range 600 using `esee 2 15 12`
- If population <= 4, creates one baby hoppity egg at current position
- Baby starts as egg (`ov05 = 0`) with sprite offset at frame 140 (160 images)
- Baby has reduced stats: `ov61` = 85 (smell), `ov72` = 400 (food energy), `ov73` = 400 (hunger threshold), `ov74` = 800 (max energy)
- Resets parent's maturity counter (`ov20 = 0`) and state to 0

**Maturation** (`matr` subroutine, triggered when `ov01 > 500` and `ov05 = 1`):
- Creates a new adult hoppity (2 15 12) at the juvenile's position with full adult properties
- New adult starts with `ov05 = 2` (adult stage), full stats (`ov72` = 600, `ov73` = 600, `ov74` = 1000)
- Kills the juvenile form

**Lifecycle progression**: Egg (`ov05 = 0`) -> hatches via timer animation -> Juvenile (`ov05 = 1`) -> matures via `matr` at age > 500 -> Adult (`ov05 = 2`)

### Movement System

The hoppity moves by hopping rather than walking:
- **Hop launch**: Sets velocity using `velo va10 va11` where va10 = random 8-14 * direction, va11 = random 15-20 * vertical direction
- **Hop animation**: Uses 6 frames [0 1 2 3 4 5] from base `ov30` (left) or `ov31` (right) when on ground or ascending
- **Fall animation**: Single frame [6] from hop base when `vely > 0`
- **Landing animation**: Frames [8 0] from hop base on ground collision
- **Jump animation**: 8 frames [0 1 2 3 4 5 6 7 255] from base `ov34`/`ov35` when `ov11 = 1` (jumping upward)
- **Direction**: `ov10 <= 0` = facing/moving left, `ov10 > 0` = facing/moving right

### Collision Event (Script 6) — Landing

When the hoppity collides with something:
- Instantly sets `ov75 = 0` (grounded)
- Sets state to 2 (Rest) if not being carried (100% chance)
- If landed on ground (`wall = down`): clears current animation and plays landing sequence [8 0] from walk base

---

## Dead Hoppity (2 10 22)

The dead hoppity is a decomposing corpse created when a living hoppity dies (state 99). It displays a death pose and eventually decomposes, releasing nutrients and water back into the room before disappearing. The sprite frame range depends on whether the hoppity died as an adult (108 images from frame 0) or juvenile (248 images from frame 0).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hoppity` | Adult: 108 images from frame 0; Juvenile: 248 images from frame 0; plane 2000 |
| `accg` | 2 | Gravity |
| `tick` | 800 | Very long timer — long delay before decomposition |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 0 | No air resistance |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov10` | Facing direction (inherited from living hoppity) | From parent |
| `ov61` | CA smell emission value | 40 |
| `ov01` | Reset to 0 at creation | 0 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition — plays decay animation, releases nutrients and water, then disappears |

### Timer Event (Script 9) — Decomposition

When the timer fires (after 800 ticks of the initial death animation):
1. If not being carried (`carr = null`):
   - **Left-facing** (`ov10 <= 0`): Base 0, plays decomposition animation [13 14 15]
   - **Right-facing** (`ov10 > 0`): Base 16, plays decomposition animation [13 14 15]
2. Waits for animation to complete (`over`)
3. **Room CA impact**: If in a valid room and not carried, increases the room's nutrient protein (CA 3) by 0.4 and water (CA 4) by 0.4 via `altr`
4. Kills itself (`kill targ`)

### Impact on Room CA

| CA Property | Change | Description |
|---|---|---|
| 3 (Nutrient/Protein) | +0.4 | Releases nutrients into the room during decomposition |
| 4 (Water) | +0.4 | Releases water into the room during decomposition |

---

## Removal Script

The removal script (`rscr`) cleans up all hoppity-related agents and scripts:
- Kills all living hoppities (`enum 2 15 12`, `kill targ`)
- Removes hoppity scripts: events 9 (timer) and 6 (collision) via `scrx 2 15 12 9` and `scrx 2 15 12 6`
