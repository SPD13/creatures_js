# wasp.cos - Wasp Swarm Ecosystem

**Source**: `Assets/Bootstrap/001 World/wasp.cos`

## Overview

This script creates a swarm of 10 wasps that fly through the Norn Meso / Jungle terrain, feed on food (classifier 2 8 0) and seeds (classifier 2 9 0), roam and dodge obstacles, and sting creatures that attack them. Wasps are highly aggressive defenders: when stung or otherwise hit, a wasp alerts nearby wasps (through line-of-sight) who will also pursue and sting the attacker, producing classic swarm retaliation behaviour.

When a wasp dies of old age (`ov01 > 2000`) or starvation, it is replaced by a **Dead Wasp** (2 10 28) which decomposes shortly afterwards, releasing **Water (CA 3)** and **Nutrient (CA 4)** back to the room at +0.1 each — feeding the ecosystem's plant growth loop.

At bootstrap the wasps are scattered randomly in the range (x: 1800–2300, y: 1900–2050).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 14 6 | Wasp | `wasp` frame 0 | Flying insect — roams, hunts food, swarms, stings attackers | [Detail](#wasp-2-14-6) |
| 2 10 28 | Dead Wasp | `wasp` frame 1 | Decomposing wasp corpse; releases water and nutrients | [Detail](#dead-wasp-2-10-28) |

---

## Wasp (2 14 6)

The wasp is a flying critter that roams the air space of its spawn area, feeds on food / seed agents, and aggressively defends itself and its swarm-mates by stinging attackers. Its AI uses a compact state machine driven by `ov00` (state) and a secondary `ov17` / `ov88` pair that tracks an aggressor and the remaining time spent in attack mode.

### Bootstrap Configuration

10 wasps are created at startup with these common properties:

| Property | Value | Notes |
|---|---|---|
| `perm` | 100 | Fully permeable barriers |
| `tick` | 6 | Fast timer interval |
| `attr` | 199 | Physics + Collisions + Mouseclickable + Carryable + Suffer Collisions |
| `aero` | 5 | Light air resistance |
| `accg` | 0 | No gravity (flying) |
| `clac` | 0 | No click action |
| `elas` | 10 | Low bounce |
| `bhvr` | 17 | Creatures can pick up / activate |

Placement: `mvto rand 1800 2300 rand 1900 2050`, initial velocity 0, idle animation `[5 7]`.

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0 = Roam, 1 = Get Food, 99 = Die |
| `ov01` | Age counter | Starts at 2000; increments each tick |
| `ov02` | Energy level | Starts at 800; decrements each tick |
| `ov05` | Reserved | 2 |
| `ov06` | Random init seed | `rand 0 1` |
| `ov10` | X direction | -1 = Left, 1 = Right (starts 1) |
| `ov11` | Y direction | -1 = Up, 1 = Down (starts -1) |
| `ov12` | Current X velocity vector | Updated by `vect` subroutine |
| `ov13` | Current Y velocity vector | Updated by `vect` subroutine |
| `ov16` | Food target | Current food/seed target |
| `ov17` | Attacker target | Creature that stung / alerted the wasp |
| `ov20` | Tick counter since spawn | Incremented each timer |
| `ov61` | CA smell emission | 45 |
| `ov72` | Energy gain on feeding | 400 |
| `ov73` | Low-energy threshold | 400 (triggers hunt below this) |
| `ov74` | Upper energy threshold | 800 (stop feeding above this) |
| `ov75` | Reserved | 1 |
| `ov88` | Attack timer | 80 when aggressor set; counts down each tick |
| `ov89` | Attack flag | 1 when targeted |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: roam / hunt / swarm / attack / die |
| 6 | Collision | Resets the velocity vector (`ov12 = ov13 = 0`) |
| 1 | Activate 1 | Wasp is stung/poked — records attacker and stings back (stim 88) |
| 12 | Eat | Wasp is consumed by another agent (stim 80) |

#### Event 9 — Timer (Main Behavior Loop)

Runs every 6 ticks:

**Common logic (all states):**
1. Ages the wasp (`ov01 += 1`) and decrements energy (`ov02 -= 1`).
2. Increments spawn-age counter (`ov20 += 1`).
3. **Starvation check**: if `ov02 < ov73` (energy below 400), sets state to 1 (Get Food).
4. **Death check (age)**: placeholder — `doif ov00 eq 99` with empty body (likely a disabled death-on-age path); actual death only routes through `ov00 = 99` set elsewhere and then calls `die_`.
5. **Attack handling**: if an attacker is set (`ov17 <> null`) and attack timer `ov88 > 0`:
   - Decrements `ov88`.
   - While `ov88 > 40` (first 40 ticks): runs `atak` subroutine (chase and sting attacker, recruit nearby wasps to the swarm).
   - When `ov88 = 0`: clears the attacker (`ov17 = null`).
6. **State dispatch**:
   - State 1 → `gfod` (hunt food).
   - State 0 → `roam` (wander).

**Subroutine `die_` (death)**:
1. Records current position and facing direction.
2. Spawns a **Dead Wasp** (2 10 28) at the wasp's position using sprite `wasp`:
   - If `ov01 > 2000` (died of old age): pose `0` (collapsed on back).
   - Otherwise (died of starvation): pose `1`.
3. Configures the corpse: `accg 2`, `tick 4`, `attr 195`, `aero 0`, facing inherited.
4. If the target position is unreachable (`tmvt va50 va51 <> 1`): kills both targ and ownr and stops.
5. Otherwise moves the corpse, sets `ov61 = 18` (CA emission), and kills the wasp.

**Subroutine `gfod` (hunt food)**:
1. Searches for the nearest **food** agent `2 8 0` via `find` (squared-distance comparison, stored in `ov16`).
2. If no food found, searches `2 9 0` (seeds).
3. If a target was found:
   - Runs `hunt` to drive directions toward the target's position.
   - On touch: gains `ov72` (400) energy, sends **message 12 (Eat)** to the target, and if full (`ov02 > ov74`), returns to Roam.
4. Otherwise: returns to Roam (`ov00 = 0`) and runs `roam`.
5. Applies `vect` → `anim` → `move` to update velocity and animation each tick.

**Subroutine `atak` (sting attacker + recruit swarm)**:
1. Plays the **"wasp"** sound effect.
2. Enumerates all other wasps (`esee 2 14 6`); for each wasp with no current attacker (`ov17 = null`) and no cooldown (`ov88 = 0`), copies the attacker and sets `ov88 = 80` — this is how a single sting recruits the whole nearby swarm.
3. Aims at `ov17` (the attacker):
   - If touching the attacker **and** the attacker's family is 4 (a Creature): delivers **stimulus 88** with intensity 1 (the sting).
   - If not touching: goes back to Roam.
4. Applies `vect` → `anim` → `move`.

**Subroutine `swrm` (flocking; defined but unused by main dispatch)**:
Accumulates the average relative position of all nearby wasps and steers toward it. Present in the script but not invoked by any state — likely a legacy or future-use subroutine.

**Subroutine `roam` (wander)**:
1. With probability 5/13 each tick, optionally plays the **"wasp"** sound if ground is close (`obst down > 5`) and flips X or Y direction (1/13 chance each).
2. Runs `obst` for obstacle avoidance.
3. Applies `vect` → `anim` → `move`.

**Subroutine `obst` (obstacle avoidance)**:
- Left obstacle closer than 120: flip to `ov10 = 1`.
- Right obstacle closer than 120: flip to `ov10 = -1`.
- Ceiling closer than 60: flip to `ov11 = 1` (move down).

**Subroutine `vect` (smooth steering)**:
Target velocity is `rand 8 14` (X) and `rand 4 8` (Y) multiplied by current X/Y direction signs. The current vector `ov12`/`ov13` is nudged by ±4 per tick toward that target, producing smooth acceleration and direction changes.

**Subroutine `anim` (direction-aware animation)**:
- Ensures `ov12 ≠ 0` (re-rolls direction if zero).
- If ground is close (`obst down > 0`): uses walking-on-ground anim `[18 19 255]` (left) or `[20 21 255]` (right).
- Otherwise (flying): uses full flap animation `[0 1 2 3 4 5 6 7 8]` (left) or `[9 10 11 12 13 14 15 16 17]` (right).

**Subroutine `move`**: simply copies the smoothed vector to `velx`/`vely`.

**Subroutine `find` (nearest target by squared distance)**:
Enumerates all agents of classifier `va47 va48 va49`, computes the squared distance `dx² + dy²`, and stores the closest as `ov16`. Runs `slow` at the end to yield execution.

**Subroutine `hunt` (aim at target)**:
Sets X/Y direction so the wasp moves toward the target's position. Clears the target if unreachable (`ov16 = null`).

#### Event 6 — Collision

Resets the smoothed velocity vector (`ov12 = 0`, `ov13 = 0`) so the wasp's steering re-initialises on the next `vect` pass.

#### Event 1 — Activate 1 (Stung / Poked)

Fired when a creature pokes or otherwise activates the wasp:
1. Records the aggressor (`ov17 = from`).
2. Arms the attack timer (`ov88 = 80`, `ov89 = 1`).
3. **Stings back immediately**: sends **stimulus 88** with intensity 1 to the aggressor.

#### Event 12 — Eat

When consumed by another agent:
1. Sends **stimulus 80** (`STIM_EATEN_ANIMAL`) with intensity 1 to the consumer.
2. Destroys itself (`kill ownr`).

---

## Dead Wasp (2 10 28)

The decomposing corpse of a dead wasp. It briefly persists at the death position, then releases water and nutrients into the room and removes itself.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `accg` | 2 | Gravity |
| `aero` | 0 | No air resistance |
| `tick` | 4 | Fast decomposition timer |
| `ov10` | inherited | Facing direction from parent wasp |
| `ov61` | 18 | CA smell emission |
| Pose | 0 (old age) / 1 (starved) | Inherited at creation time |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Nutrient release and self-destruction |

#### Event 9 — Timer (Decomposition)

When the timer fires and the corpse is not being carried (`carr = null`):
1. **Releases nutrients into the room** (if `room targ <> -1` and not carried):
   - `altr room targ 3 0.1` — Increases room **CA 3 (Water)** by 0.1.
   - `altr room targ 4 0.1` — Increases room **CA 4 (Nutrient)** by 0.1.
2. Destroys itself (`kill targ`).

---

## Removal Script (rscr)

Cleanly uninstalls the wasp ecosystem:
1. Kills all living wasps (`enum 2 14 6 → kill targ`) and removes scripts 9 (Timer) and 6 (Collision).
2. Kills all dead wasps (`enum 2 10 28 → kill targ`) and removes scripts 9 (Timer) and 6 (Collision).

---

## Stimulus Summary

| Stimulus # | Context | Effect |
|---|---|---|
| 80 | Wasp is eaten (event 12) | Consumer receives `STIM_EATEN_ANIMAL` feedback |
| 88 | Creature stung by wasp (event 1 immediate + `atak` subroutine) | Pain / sting biochemical feedback on the creature |

## Room CA Effects

| CA Index | Name | Source | Change | Ecological Role |
|---|---|---|---|---|
| 3 | Water | Dead wasp decomposition | +0.1 | Returns moisture to the environment |
| 4 | Nutrient | Dead wasp decomposition | +0.1 | Enriches soil for plant growth |

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 8 0 | Hunt + message 12 | Wasp eats the food agent |
| 2 9 0 | Hunt + message 12 | Wasp eats seeds when food is unavailable |
| Family 4 (Creatures) | Stimulus 88 | Stung on contact while in attack mode |
| Other wasps (2 14 6) | Swarm recruitment | A single sting propagates to nearby idle wasps via `esee` |
