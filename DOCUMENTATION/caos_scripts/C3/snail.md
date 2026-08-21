# snail.cos - Snail Critter

**Source**: `Assets/Bootstrap/001 World/snail.cos`

## Overview

This script introduces snails as a small critter in the world. At bootstrap, two snails are spawned at random positions in the meso (x: 2000-2800, y: 700). Snails roam slowly, hunt for food, and when their energy runs out they transform into a trail of slime that decays into the environment, releasing water and nutrients back into the room. Creatures that eat a snail receive the "eaten animal" stimulus.

The snail is a minimal ecosystem component: it wanders, can be picked up (bhvr 16), can be eaten by creatures, and — on death — leaves slime (2 10 20) that feeds room CA values before vanishing.

## Created Agents

| Classifier | Name | Description | Detail |
|---|---|---|---|
| 2 13 7 | Snail | Roaming critter that hunts for food and eventually dies into slime | [Detail](#snail-2-13-7) |
| 2 10 20 | Snail Slime | Decaying slime left behind when a snail dies; releases water and nutrients | [Detail](#snail-slime-2-10-20) |

---

## Snail (2 13 7)

Two snails are created at bootstrap with `new: simp` (sprite `snail`, image 101, plane 2500). Each snail is small, picks up easily, bounces slightly, and uses a simple state machine to roam, hide, hunt food, and die.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `perm` | 99 | Nearly impassable permeability |
| `accg` | 1 | Light gravity |
| `aero` | 0 | No air resistance |
| `elas` | 5 | Minimal bounce |
| `fric` | 0 | Reset to 100 each tick inside the timer |
| `tick` | 8 | Fast timer |
| `bhvr` | 16 | Creatures can pick up |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Hunting food (via `gfod`), 99=Die |
| `ov01` | Age counter | Starts at 2000; increments each tick |
| `ov02` | Energy level | Starts at 800; decrements each tick |
| `ov05` | (unused marker) | 2 |
| `ov06` | Random seed flag | `rand 0 1` |
| `ov10` | X direction | -1=Left, 1=Right |
| `ov11` | Y direction | -1=Up, 1=Down |
| `ov16` | Target agent | Current food target |
| `ov20` | Tick counter | Increments each tick |
| `ov30`-`ov44` | Animation bases | Frame offsets for walking / hiding / etc. |
| `ov61` | CA smell emission | 45 (12 on slime) |
| `ov72` | Food gain on eat | 400 |
| `ov73` | Low energy threshold | 400 — below this, seek food (`ov00=1`) |
| `ov74` | Full energy threshold | 800 — above this, stop eating |
| `ov75` | Roam flag | 1 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: roaming, obstacle handling, food hunting, death |
| 12 | Eat | Snail is consumed by another agent |

#### Event 9 — Timer (Main Behavior Loop)

Runs every 8 ticks:

**Common logic (all states):**
1. Sets `fric 100` (reapplied each tick).
2. Increments age (`ov01 += 1`), decrements energy (`ov02 -= 1`), and increments tick counter (`ov20 += 1`).
3. **Low energy check**: If `ov02 < ov73` (400), transitions to hunger state (`ov00 = 1`).
4. **Obstacle avoidance**:
   - Left obstacle < 30: set `ov10=1`, `ov11=-1` (turn right, move up).
   - Right obstacle < 30: set `ov10=-1`, `ov11=-1` (turn left, move up).
   - Ceiling < 30: `ov11=1` (move down).
   - Floor < 30: `ov11=-1` (move up).
5. **Death check**: If `ov02 <= 0`, sets state to Die (99).

**State 0 — Roam** (subroutine `roam`):
1. 1-in-20 chance to call `hide` (plays a peek-out/tuck-in hide animation based on facing direction).
2. 1-in-10 chance to flip horizontal direction (`ov10 *= -1`).
3. Forces downward `ov11 = 1`.
4. Runs `vect` (random velocity magnitude), `anim` (selects left/right walk base), and `move` (applies velocity).

**State 1 — Get Food** (subroutine `gfod`):
1. If no target, runs `find` to locate the nearest visible agent within visual range (params `va47=2, va48=10, va49=0` — family 2, genus 10, species 0; i.e. dead/decaying organic matter).
2. Targets the food and runs `hunt`, which adjusts `ov10`/`ov11` to move toward it.
3. On contact (`touc ov16 ownr`):
   - Gains `ov72` (400) energy.
   - Sends **message 12** (`MSG_EAT`) to the food.
   - If energy exceeds `ov74` (800), returns to Roam (`ov00 = 0`).
   - Otherwise stays in hunting mode (`ov00 = 1`).
4. If the target disappears, clears the target and returns to Roam.
5. Runs `vect`, `anim`, `move`.

**State 99 — Die** (subroutine `die_`):
1. Records the snail's position and facing direction.
2. Creates a **Snail Slime** (2 10 20) at the death location using `new: simp` (sprite `snail`, image 0, plane 2000).
3. Configures the slime: `accg 2`, `tick 90`, `attr 195`, `aero 0`, `ov10` inherited, energy reset, `ov61 = 12`.
4. Attempts to move the slime to the recorded spot (`tmvt` validation); if invalid, both slime and snail are killed immediately.
5. Otherwise `mvto` places the slime, zeros its velocity, and the original snail is destroyed (`kill targ`).

#### Event 12 — Eat

When consumed by another agent:
1. Sends **stimulus 80** (`STIM_EATEN_ANIMAL`) with intensity 1 to the consuming agent (`from`).
2. Destroys itself (`kill ownr`).

### Subroutine Summary

| Subroutine | Purpose |
|---|---|
| `roam` | Random wander with occasional hide and direction flip |
| `gfod` | Seek, hunt, and eat organic food (family 2 genus 10) |
| `hunt` | Adjust `ov10`/`ov11` to move toward `ov16` target |
| `find` | Nearest-target search using squared distance (`esee`) |
| `hide` | Play tuck-in / peek-out hide animation |
| `vect` | Set random velocity magnitude (`va10=rand 1 3`, `va11=6`) |
| `anim` | Choose left or right walk base (`ov30` / `ov31`) |
| `move` | Multiply velocity by direction signs and apply `velo` |
| `die_` | Transform into a Snail Slime at death position |

---

## Snail Slime (2 10 20)

The slime left behind when a snail dies. It lies in place, slowly decays, and releases moisture and nutrients into the room before disappearing. Its appearance depends on which way the snail was facing.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Physics + Collisions + Mouseclickable + Carryable |
| `accg` | 2 | Gravity |
| `aero` | 0 | No air resistance |
| `tick` | 90 | Slow decay timer |
| `ov10` | inherited | Facing direction from parent snail |
| `ov61` | 12 | CA smell emission |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Plays decay animation, releases CA to room, destroys itself |

#### Event 9 — Timer (Decomposition)

When the timer fires, the slime decays only if it is not being carried (`carr = null`):

1. **Facing left** (`ov10 <= 0`): plays animation `base 0` with frames `[0 1 2]`.
2. **Facing right** (`ov10 > 0`): plays animation `base 3` with frames `[0 1 2]`.
3. **Releases nutrients into the room** (if in a valid room and not carried):
   - `altr room targ 3 0.1` — Increases room **CA 3 (Water)** by 0.1.
   - `altr room targ 4 0.1` — Increases room **CA 4 (Nutrient)** by 0.1.
4. Waits for the animation to finish (`over`).
5. Destroys itself (`kill targ`).

If the slime is being carried, it does nothing — it will only decay once set down.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the snail ecosystem:

1. Enumerates all snails (`enum 2 13 7`) and kills them (`kill targ`).
2. Removes the Timer script (`scrx 2 13 7 9`).
3. Removes script 6 (`scrx 2 13 7 6`) — declared but never installed by this bootstrap; present defensively.

Note: the slime's Timer script (`2 10 20 9`) is not explicitly removed — existing slime patches will continue to decay naturally on their own timers and then `kill targ` themselves.

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 80 | `STIM_EATEN_ANIMAL` | Snail is consumed (event 12) | Creature receives "eaten animal" biochemical feedback |

## Room CA Effects

| CA Index | Name | Source | Change | Ecological Role |
|---|---|---|---|---|
| 3 | Water | Snail slime decay | +0.1 | Returns moisture to the environment |
| 4 | Nutrient | Snail slime decay | +0.1 | Enriches soil for plant growth |

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 10 0 | Proximity + message 12 | Snail seeks and consumes any family-2/genus-10 organic matter as food |
