# grasshopper.cos - Grasshopper Lifecycle Ecosystem

**Source**: `Assets/Bootstrap/001 World/grasshopper.cos`

## Overview

This script implements the grasshopper lifecycle ecosystem for the Creatures 3 world. It creates adult grasshoppers that roam the environment by hopping, search for food (seeds from genus 6), and lay eggs when mature. Grasshoppers have a full lifecycle: adults hop around, feed to maintain energy, reproduce by laying eggs, and eventually die of old age or starvation — leaving behind a decomposing corpse that releases nutrients back into the room.

The grasshopper ecosystem involves three distinct agent forms: adult grasshoppers (2 13 6) that are the active roaming form, grasshopper eggs (2 18 10) that hatch into new adults, and dead grasshopper corpses (2 10 19) that decompose and enrich the local environment. Grasshoppers navigate using obstacle detection, prefer to move toward areas with higher nutrient concentration (CA property 5), and avoid room boundaries. They can be picked up by creatures and provide "eaten critter" stimulus when consumed (script 12).

At bootstrap, 6 adult grasshoppers are created at random positions in the mid-world area (x: 1700-2300, y: 700).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 13 6 | Grasshopper | `grasshopper` frame 0 | Adult form — hops around, feeds on seeds, lays eggs, dies of age/starvation | [Detail](#grasshopper-2-13-6) |
| 2 18 10 | Grasshopper Egg | `grasshopper` frame 48 | Laid by adult grasshoppers; hatches into a new adult grasshopper | [Detail](#grasshopper-egg-2-18-10) |
| 2 10 19 | Dead Grasshopper | `grasshopper` frame 18 | Decomposing grasshopper corpse; releases nutrients and water into room | [Detail](#dead-grasshopper-2-10-19) |

---

## Grasshopper (2 13 6)

The adult grasshopper is the primary active form of the lifecycle. It hops around the world searching for food, avoids obstacles, and reproduces by laying eggs when it has lived long enough. The grasshopper uses a state machine driven by its timer event, with directional sprite animations for left and right facing movement. It navigates using obstacle detection (`obst`) and follows nutrient gradients (CA property 5) to find food-rich areas.

### Bootstrap Configuration

6 adult grasshoppers are created at startup:

| Property | Value | Notes |
|---|---|---|
| Count | 6 | Created in a `reps 6` loop |
| Position | x: 1700-2300, y: 700 | Random horizontal placement |
| Sprite | `grasshopper` | 48 frames, starting at frame 0, plane 2500 |
| `accg` | 2 | Gravity |
| `perm` | 99 | Nearly impassable permeability |
| `tick` | 8 | Timer interval |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 5 | Air resistance |
| `elas` | 1 | Very low elasticity |
| `bhvr` | 16 | Creatures can pick up |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov00` | Behavior state | 0 (Roam) |
| `ov01` | Age counter (ticks lived) | 0 |
| `ov02` | Energy level | 800 |
| `ov05` | Unknown parameter | 2 |
| `ov06` | Random flag | rand 0 1 |
| `ov10` | X direction (-1=left, 1=right) | -1 |
| `ov11` | Y direction (-1=up, 1=down) | -1 |
| `ov16` | Target food agent reference | null |
| `ov20` | Maturity counter | 0 |
| `ov30` | Anim base: jump left | 0 |
| `ov31` | Anim base: jump right | 11 |
| `ov32` | Anim base: chirp left | 22 |
| `ov33` | Anim base: chirp right | 26 |
| `ov34` | Anim base: reserved left | 30 |
| `ov35` | Anim base: reserved right | 39 |
| `ov36` | Anim base: additional | 0 |
| `ov61` | CA smell emission value | 42 |
| `ov72` | Energy gained per food eaten | 400 |
| `ov73` | Hunger threshold (seek food) | 400 |
| `ov74` | Satiated threshold (stop eating) | 800 |
| `ov75` | Jump lock flag (prevents double jump) | 0 |

### Behavior States (`ov00`)

| State | Name | Description |
|---|---|---|
| 0 | Roam | Default — hops around randomly, occasionally chirps, may reverse direction |
| 1 | Seek Food | Energy below hunger threshold — finds nearest seed (2 6 0) and pursues it |
| 6 | Lay Eggs | Maturity counter exceeded 800 — creates a grasshopper egg at current position |
| 99 | Die | Energy depleted or age exceeded — transforms into dead grasshopper corpse |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop — state machine, obstacle avoidance, energy/age management |
| 6 | Collision | Resets jump lock; sets idle pose facing current direction |
| 12 | Eat | Consumed by a creature — provides "eaten critter" stimulus, then dies |

### Timer Event (Script 9) — Detailed Behavior

Each timer tick:

1. **Age and energy update**: Age (`ov01`) increments by 1, energy (`ov02`) decrements by 1, maturity counter (`ov20`) increments by 1.

2. **State transitions**:
   - If maturity > 800 and currently roaming (state 0) → transition to Lay Eggs (state 6)
   - If energy < hunger threshold (`ov73` = 400) → transition to Seek Food (state 1)
   - If energy <= 0 or age > 1000 → transition to Die (state 99)
   - Final death check: energy <= 0 or age > 2500 → forced Die (state 99)

3. **Nutrient gradient navigation**: Compares CA property 5 (nutrients) on left vs right side of current position using `prop grid`. Moves toward the side with higher nutrient concentration.

4. **Hostile room check**: If current room type is 8 (engineering/machine room), energy is rapidly drained (-50 per tick).

5. **Obstacle avoidance**: Checks distances to obstacles in all 4 directions (`obst 0-3`). If too close to a wall (< 30 pixels), reverses the corresponding movement direction.

6. **State execution**:
   - **Die (99)**: Calls `die_` subroutine — creates a dead grasshopper corpse (2 10 19) at current position, plays death animation, kills the adult.
   - **Seek Food (1)**: Calls `gfod` subroutine — uses `esee` to scan for nearest seed agent (2 6 0), moves toward it, and on contact sends message 12 (eat) to the food and gains energy (`ov72` = 400). Returns to roaming when satiated.
   - **Lay Eggs (6)**: Calls `layg` subroutine — creates a grasshopper egg (2 18 10) at current position, resets maturity counter, returns to roaming.
   - **Roam (0)**: Calls `roam` subroutine — randomly reverses horizontal direction, occasionally chirps (plays sound "ghop" with chirp animation), then jumps.

### Movement System

The grasshopper moves by hopping:
- **Jump**: Sets velocity based on direction (`ov10` for X, `ov11` for Y) with fixed magnitudes (va10=8 horizontal, va11=20 vertical).
- **Jump lock** (`ov75`): Prevents consecutive jumps; reset on collision event (script 6).
- **Ascending animation**: Uses frames 0-5 from the appropriate directional base.
- **Descending animation**: Uses frames 6-10 from the appropriate directional base.
- **Direction**: `ov10 <= 0` = facing/moving left, `ov10 > 0` = facing/moving right.

### Food Seeking System

The `gfod` subroutine searches for food agents (classifier 2 6 0 — seeds):
- Uses `esee` to enumerate visible agents matching the food classifier.
- Calculates squared distance to each candidate and selects the nearest one.
- Stores food target in `ov16` and pursues it via the `hunt` subroutine.
- On contact (`touc`), sends message 12 to the food (consuming it) and gains `ov72` (400) energy.
- Returns to roaming when energy exceeds satiated threshold (`ov74` = 800).

### Collision Event (Script 6)

When the grasshopper collides with a surface:
- Resets jump lock (`ov75 = 0`), allowing the next jump.
- Sets idle pose facing the current direction (base `ov30` for left, `ov31` for right, frame 0).

### Eat Event (Script 12) — Stimulus

When a creature eats the grasshopper:
- Sends stimulus 80 (eaten critter) to the creature that ate it.
- The grasshopper is killed (`kill ownr`).

---

## Grasshopper Egg (2 18 10)

The grasshopper egg is laid by adult grasshoppers when they reach maturity. The egg sits in place and gradually develops over several timer ticks, displaying an incubation animation. After 5 ticks, it hatches into a new adult grasshopper at the same position.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `grasshopper` | 12 frames, starting at frame 48, plane 2000 |
| `accg` | 2 | Gravity |
| `elas` | 5 | Low elasticity |
| `fric` | 80 | High friction (stays in place) |
| `bhvr` | 16 | Creatures can pick up |
| `tick` | 80 | Slow timer — long incubation period |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov00` | Behavior state | 0 |
| `ov01` | Incubation counter | 0 |
| `ov70` | Reserved | 0 |
| `ov61` | CA smell emission value | 20 |
| `ov02` | Energy | 255 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Incubation cycle — increments counter, hatches after 5 ticks |
| 12 | Eat | Consumed by a creature — provides "eaten critter" stimulus, then dies |

### Timer Event (Script 9) — Hatching

Each timer tick:
1. Incubation counter (`ov01`) increments by 1.
2. If counter <= 5: advances pose to show development (frames 1-5).
3. If counter > 5: **hatches** — creates a new adult grasshopper (2 13 6) at the egg's position with full adult properties and variables (identical to bootstrap configuration). The egg is then killed. If the position is invalid for the new agent (`tmvt` check fails), both the new agent and the egg are killed.

### Eat Event (Script 12) — Stimulus

When a creature eats the egg:
- Sends stimulus 80 (eaten critter) to the creature.
- The egg is killed.

---

## Dead Grasshopper (2 10 19)

The dead grasshopper is a decomposing corpse created when an adult grasshopper dies (state 99). It plays a death animation and gradually decomposes, releasing nutrients and water back into the room before disappearing.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `grasshopper` | 18 frames, starting at frame 30, plane 2000 |
| `accg` | 2 | Gravity |
| `elas` | 5 | Low elasticity |
| `fric` | 80 | High friction |
| `tick` | 4 | Fast timer for decomposition |
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `aero` | 0 | No air resistance |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov10` | Facing direction (inherited from adult) | From parent |
| `ov61` | CA smell emission value | 12 |
| `ov01` | Decomposition counter | 0 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition cycle — plays decay animation, releases nutrients, then disappears |

### Timer Event (Script 9) — Decomposition

Each timer tick:
1. Decomposition counter (`ov01`) increments by 1.
2. If counter > 50 and not being carried (`carr = null`):
   - Plays decomposition animation (frames 6-8) based on facing direction.
   - **Room CA impact**: Increases the room's nutrient protein (CA 3) by 0.1 and water (CA 4) by 0.1 via `altr`.
   - After the animation completes (`over`), the corpse is killed.

### Impact on Room CA

| CA Property | Change | Description |
|---|---|---|
| 3 (Nutrient/Protein) | +0.1 | Releases nutrients into the room during decomposition |
| 4 (Water) | +0.1 | Releases water into the room during decomposition |

---

## Removal Script

The removal script (`rscr`) cleans up all grasshopper-related agents:
- Kills all adult grasshoppers (2 13 6) and removes their scripts (events 9 and 6).
- Kills all grasshopper eggs (2 18 10) and removes their timer script (event 9).
- Kills all dead grasshoppers (2 10 19) and removes their timer script (event 9).
