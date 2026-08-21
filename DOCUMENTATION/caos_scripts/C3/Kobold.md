# Kobold.cos - Kobold Lizard Ecosystem

**Source**: `Assets/Bootstrap/001 World/Kobold.cos`

## Overview

This script implements the Kobold, a small aggressive lizard-like creature that roams the Creatures 3 ship. One Kobold is spawned at bootstrap at position (1730, 2000). The Kobold operates on a simple AI state machine with three primary behaviors: idle roaming, food seeking, and attacking nearby animals.

The Kobold has a finite lifespan governed by an age counter and a health/satiation value that decreases each tick. When hungry, it searches for food (plants, critters, butterflies, bugs) and eats on contact, restoring health. When feeling aggressive (random chance), it attacks any nearby creatures by swiping at them and applying knockback. Entering water rooms (types 8 or 9) causes rapid health depletion, effectively killing the Kobold.

When a Kobold dies, it spawns a death remnant that plays a decomposition animation. The remnant slightly increases room CA properties 3 and 4 (contributing nutrients back to the environment) before disappearing.

Over time, the Kobold also tracks a maturity counter that increments periodically after a certain age, though no breeding behavior is implemented in this script.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 16 7 | Kobold | `kobold` frame 0 | Aggressive lizard — roams, hunts food, attacks nearby animals | [Detail](#kobold-2-16-7) |
| 2 10 43 | Kobold Death Remnant | `kobold` frame 86 | Decomposing kobold corpse; increases room nutrients then disappears | [Detail](#kobold-death-remnant-2-10-43) |

---

## Kobold (2 16 7)

The Kobold is a physics-enabled simple agent that wanders the ship, forages for food, and attacks other small creatures. It uses a state machine driven by its timer script.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `kobold` | First image 0, plane 4000 |
| Position | (1730, 2000) | Initial spawn location |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Suffers Collisions |
| `accg` | 4 | Gravity |
| `perm` | 60 | Wall permeability |
| `aero` | 5 | Air resistance |
| `elas` | 5 | Elasticity |
| `fric` | 10 | Friction |
| `tick` | 4 | Timer interval |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov00` | Behavior state | 0 (Idle/Roaming) |
| `ov01` | Age counter (increments each tick) | 2000 |
| `ov02` | Health/satiation (decrements each tick) | 401 |
| `ov05` | Unknown | 2 |
| `ov06` | Random seed | rand 0 1 |
| `ov10` | Horizontal direction | -1 (Left) |
| `ov11` | Vertical direction | -1 (Up) |
| `ov16` | Target agent reference | null |
| `ov20` | Maturity counter | 0 |
| `ov61` | View/smell range | 95 |
| `ov72` | Food health recovery amount | 400 |
| `ov73` | Hunger threshold (seek food when health < this) | 400 |
| `ov74` | Unknown | 800 |
| `ov75` | Collision handling flag | 1 |

### Animation Base Frames

| Variable | Value | Animation |
|---|---|---|
| `ov30` | 0 | Run/move facing left |
| `ov31` | 12 | Run/move facing right |
| `ov32` | 42 | Eat facing left |
| `ov33` | 52 | Eat facing right |
| `ov34` | 24 | Walk facing left |
| `ov35` | 33 | Walk facing right |
| `ov36` | 62 | Attack facing left |
| `ov37` | 74 | Attack facing right |
| `ov38` | 86 | Death/decomposition base |
| `ov39` | 99 | Unused in visible code |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: AI state machine, aging, health |
| 6 | Collision | Wall collision response: reverses direction |

#### Event 9 — Timer (Main Behavior Loop)

The Kobold's AI runs every 4 ticks through a state-based behavior cycle.

**Aging and Health:**
1. Increments `ov01` (age) by 1.
2. Decrements `ov02` (health) by 1.
3. **Water room check**: If not carried and in room type 8 (fresh water) or 9 (salt water), sets health to -10 (rapid death).
4. If health reaches 0 or below, sets state to 99 (dying) and calls `die_` subroutine.

**Maturity Tracking:**
- After age exceeds 2010, every 10 ticks the maturity counter `ov20` increments by 1.

**State Transitions:**
- **State 0 (Idle)**: 1-in-6 random chance each tick to switch to State 2 (Aggressive).
- **Hunger check**: If health drops below `ov73` (400), switches to State 1 (Food Seeking), overriding other states.

**State Execution:**
- **State 2**: Calls `gmad` — attack nearby creatures.
- **State 1**: Calls `gfod` — search for and eat food.
- **State 0**: Calls `roam` — wander randomly.

#### Event 6 — Collision (Wall Response)

Handles wall collisions with instant execution:
- **Left wall**: Reverses to face right (`ov10 = 1`), plays right-facing walk animation.
- **Right wall**: Reverses to face left (`ov10 = -1`), plays left-facing walk animation.
- **Floor**: Plays walk animation matching current facing direction.
- Sets `ov75 = 0` (collision flag cleared).
- Increases friction to 50 during collision response.

### Subroutine: `die_` — Death Sequence

1. Saves current position and direction.
2. Creates a **Kobold Death Remnant** (2 10 43) at the Kobold's position (offset 20px left, 8px up).
3. The remnant inherits the Kobold's facing direction via `ov10`.
4. Kills the Kobold (`kill targ` on `ownr`).

### Subroutine: `roam` — Idle Wandering

1. Sets friction to 10 and elasticity to 0.
2. Sets vertical direction `ov11 = 1` (walking).
3. Random direction changes:
   - 50% chance to reverse horizontal direction (`negv ov10`).
   - 20% chance to reverse vertical direction (`negv ov11`), causing a leap.
4. Sound effects: 1-in-81 chance each of playing "grl1" or "grl2" (growl sounds).
5. Calls `vect` (set velocity), `anim` (set animation), `move` (apply movement).

### Subroutine: `gfod` — Food Seeking

Searches for food using the `find` subroutine in priority order:

| Priority | Classifier | Target Type |
|---|---|---|
| 1 | 2 11 0 | Food plants (e.g. carrots) |
| 2 | 2 8 0 | Critters |
| 3 | 2 13 0 | Butterflies |
| 4 | 2 14 0 | Bugs |

**If food found:**
1. Calls `hunt` to orient toward the target.
2. If touching the target:
   - Plays eat animation (base `ov32`/`ov33` depending on direction, 10-frame sequence).
   - Recovers health by `ov72` (400 points).
   - Returns to State 0 (Idle).
3. If not touching: sets direction/animation and moves toward target.

**If no food found:** Falls back to `roam` behavior.

### Subroutine: `gmad` — Aggressive Attack

Searches for nearby creatures to attack using `ETCH` (enumerate touching) in order:

| Classifier | Target Type |
|---|---|
| 2 15 0 | Small animals |
| 2 16 0 | Other kobolds/bugs |
| 2 13 0 | Butterflies |
| 2 14 0 | Bugs |

**For each target found:**
1. Plays attack animation (base `ov36`/`ov37` depending on direction, 12 frames: wind-up [0-6] then follow-through [7-11]).
2. Plays "spnk" (hit) sound effect.
3. Applies knockback velocity to the target: `velx = 30 * direction`, `vely = -25` (upward).
4. Returns to State 0 (Idle) and resumes roaming.

If no targets found nearby, falls back to `roam`.

### Subroutine: `vect` — Set Velocity Parameters

Sets base velocity values:
- Horizontal: `va10 = 12` (constant).
- Vertical: `va11 = rand 15 20`.

### Subroutine: `anim` — Set Animation

Selects animation based on direction and movement type:

- **Leaping** (`ov11 = -1`):
  - Left (`ov10 <= 0`): base `ov30` (0), 12-frame run cycle [5 6 7 8 9 10 11 0 1 2 3 4 255].
  - Right (`ov10 > 0`): base `ov31` (12), same cycle.
  - Increases horizontal speed by 14, sets vertical speed to 10.

- **Walking** (`ov11 != -1`):
  - Left: base `ov34` (24), 9-frame walk cycle [0 1 2 3 4 5 6 7 8 255].
  - Right: base `ov35` (33), same cycle.

### Subroutine: `move` — Apply Movement

Multiplies velocity by direction and applies:
- `velx = va10 * ov10` (horizontal speed * direction).
- `vely = va11 * ov11` (vertical speed * direction).

### Subroutine: `hunt` — Chase Target

1. Reads target position from `ov16`.
2. If target exists:
   - Sets `ov10` toward target (1 if target is to the right, -1 if to the left).
   - Sets `ov11` toward target (1 if target is below, -1 if above).
3. If target is null: clears target reference and returns to State 0 (Idle).

### Subroutine: `find` — Find Nearest Agent

1. Uses `ESEE` (enumerate visible agents) to search for agents matching the specified classifier (va47, va48, va49).
2. For each visible agent, calculates squared distance.
3. Stores the closest agent found in `ov16`.
4. If none found, sets `ov16` to null.

---

## Kobold Death Remnant (2 10 43)

A decomposing Kobold corpse created by the `die_` subroutine when a Kobold dies. The remnant plays a decomposition animation, contributes nutrients to the room, and then disappears.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `kobold` | First image offset varies (pose 86) |
| Plane | 4000 | Same depth as living Kobold |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Suffers Collisions |
| `accg` | 2 | Lighter gravity than living Kobold |
| `aero` | 0 | No air resistance |
| `tick` | 4 | Timer interval |
| `ov10` | Inherited | Direction copied from the dying Kobold |
| `ov01` | 0 | Age reset |
| `ov61` | 45 | Reduced view range |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition: contributes to room CAs, plays decay animation, self-destructs |

#### Event 9 — Timer (Decomposition)

1. **Room CA contribution** (if not carried and in a valid room):
   - Increases room CA 3 by 0.1.
   - Increases room CA 4 by 0.1.
2. **Decomposition animation** (direction-dependent):
   - Left facing (`ov10 <= -1`): base 86, 16-frame animation [0 1 2 3 4 5 6 7 8 9 10 11 12 26 27 28].
   - Right facing: base 86, 16-frame animation [13 14 15 16 17 18 19 20 21 22 23 24 25 29 30 31].
3. After animation completes (`over`), destroys itself (`kill targ`).

### Impact on Room CA

The death remnant slowly enriches the room environment:
- **CA 3**: Increased by 0.1 per tick while decomposing.
- **CA 4**: Increased by 0.1 per tick while decomposing.

This provides a small nutrient contribution to the local ecosystem before the remains disappear.

---

## State Machine Diagram

```
Bootstrap creates 1 Kobold at (1730, 2000)
            |
            v
+-------------------------+
|  State 0 -- Idle/Roam   |
|                         |
|  Random wandering       |
|  Growl sounds (1/81)    |
|  Direction changes      |
+----------+--------------+
           |
     +-----+----------+
     |                 |
     | 1/6 chance      | health < 400
     v                 v
+----------------+  +------------------+
| State 2 --    |  | State 1 --       |
| Aggressive    |  | Food Seeking     |
|               |  |                  |
| ETCH for      |  | ESEE for food:   |
| nearby agents:|  |  2 11 0 (plants) |
|  2 15 0       |  |  2 8 0 (critters)|
|  2 16 0       |  |  2 13 0 (flies)  |
|  2 13 0       |  |  2 14 0 (bugs)   |
|  2 14 0       |  |                  |
|               |  | Hunt + eat       |
| Attack:       |  | Recover 400 HP   |
|  "spnk" sound |  +--------+---------+
|  Knockback    |           |
+-------+--------+          |
        |                   |
        +-------+-----------+
                |
                v
          Back to State 0


+-------------------------+
| State 99 -- Dying       |  Triggered when health <= 0
|                         |  (natural or water room)
| Creates death remnant   |
| (2 10 43) at position   |
| Kills self              |
+-------------------------+
```

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 11 0 | Food search (`ESEE`) | Plants/food — Kobold eats these for health recovery |
| 2 8 0 | Food search (`ESEE`) | Critters — secondary food source |
| 2 13 0 | Food search (`ESEE`) / Attack (`ETCH`) | Butterflies — food source and attack target |
| 2 14 0 | Food search (`ESEE`) / Attack (`ETCH`) | Bugs — food source and attack target |
| 2 15 0 | Attack (`ETCH`) | Small animals — attack target with knockback |
| 2 16 0 | Attack (`ETCH`) | Other kobolds/bugs — attack target (excluding self) |

---

## Removal Script (rscr)

The removal script cleanly uninstalls the Kobold ecosystem:

1. Kills all Kobolds (`enum 2 16 7 -> kill targ`).
2. Removes scripts: `scrx 2 16 7 9` (Timer), `scrx 2 16 7 6` (Collision).
