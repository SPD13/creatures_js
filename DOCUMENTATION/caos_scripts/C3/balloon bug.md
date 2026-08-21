# balloon bug.cos - Balloon Bug Flying Insect

**Source**: `Assets/Bootstrap/001 World/balloon bug.cos`

## Overview

This script implements the balloon bug, a small flying insect that roams the Creatures 3 world. Balloon bugs fly around bouncing off walls, periodically rest by landing and jumping back into the air, and seek out nearby flowers (genus 7) to pollinate them. They also reproduce by spawning egg-like blank agents that hatch into new balloon bugs, maintaining a population cap.

When a creature activates (pushes) a balloon bug, it receives stimulus 85 ("Play bug"), providing sensory feedback. The balloon bugs serve as a minor ecological element: they pollinate flowers by sending message 303 on contact, and their population is self-regulating through reproduction caps and proximity checks.

At bootstrap, 10 balloon bugs are created and placed at position (5443, 281).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 13 9 | Balloon Bug | `balloonbug` frame 0 | Flying insect — roams, bounces off walls, rests, seeks flowers to pollinate, reproduces | [Detail](#balloon-bug-2-13-9) |
| 2 18 24 | Balloon Bug Egg | `blnk` frame 0 | Spawner agent — hatches a single new balloon bug then self-destructs | [Detail](#balloon-bug-egg-2-18-24) |

---

## Balloon Bug (2 13 9)

The balloon bug is a flying insect that alternates between wandering flight, resting, and flower-seeking behaviors. It uses a state machine driven by `ov00` with velocity smoothing for organic-looking movement. The bug bounces off walls and obstacles, periodically lands to rest, and actively seeks out nearby flowers to pollinate. Over time, it can also spawn new balloon bugs through egg agents.

### Bootstrap Configuration

10 balloon bugs are created at startup in a `reps` loop:

| Property | Value | Notes |
|---|---|---|
| Sprite | `balloonbug` | 42 frames, first image index 0, plane 3000 |
| Position | (5443, 281) | All 10 placed at same location, disperse via random movement |
| `attr` | 198 | Physics + Collisions + Mouseclickable + Carryable |
| `clac` | 0 | No creature activation classification |
| `elas` | 0 | No bounce elasticity |
| `ov61` | 40 | Vulnerability value |
| `tick` | 5 | Timer fires every 5 ticks |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Behavior state | 0=Flying/Wandering, 1=Resting (landed), 3=Seeking flower |
| `ov01` | Reproduction counter | Increments each timer tick; triggers spawn check at 100+ |
| `ov02` | Flower-seek cooldown | Decrements; when low enough, initiates flower search |
| `ov10` | X direction sign | -1=Left, 1=Right (randomized at creation) |
| `ov11` | Y direction sign | -1=Up, 1=Down (randomized at creation) |
| `ov12` | Current X velocity | Smoothly approaches target speed `ov14` |
| `ov13` | Current Y velocity | Smoothly approaches target speed `ov15` |
| `ov14` | Target X speed | Set based on behavior state (3 or 5) |
| `ov15` | Target Y speed | Set based on behavior state (3 or 5) |
| `ov16` | Target flower agent | Reference to the nearest flower (2 7 0) being approached |
| `ov90` | Wall bounce timer | Decremented each tick; when ≤0, checks for random direction change |
| `ov91` | State duration counter | Increments until random threshold reached, then transitions state |

### Events

| Event | Script | Description |
|---|---|---|
| Push / Activate 1 | `scrp 2 13 9 1` | Creature interaction — touched by a creature |
| Timer | `scrp 2 13 9 9` | Main behavior loop — movement, state transitions, reproduction |

### Event: Push / Activate 1 (Script 1)

When a creature touches or activates the balloon bug:

1. If `ov00` is 0 (flying state), sets `ov91` to 100 (resets state timer)
2. Checks if the activating agent (`from`) is family 4 (a creature)
3. If so, sends **stimulus 85 ("Play bug")** with intensity 1 to the creature

**Stimulus Impact**: The creature receives the "Play bug" sensory input, which can affect its drives and neurochemistry.

### Event: Timer (Script 9) — Main Behavior Loop

The timer script is the core behavior engine, executing every 5 ticks. It manages three behavioral states and a reproduction system.

#### Reproduction System (lines 56-85)

Every tick, `ov01` increments. When it reaches 100+:
- Checks global population: if fewer than 20 balloon bugs (`totl 2 13 9 < 20`)
- Scans within range 1000 for nearby balloon bugs; if 3 or fewer are nearby:
  - Checks if fewer than 3 balloon bug eggs (`2 18 24`) exist
  - If so, creates a new **Balloon Bug Egg** (2 18 24) at the bug's current position
  - The egg is a `blnk` sprite with `attr 16` (carryable) and `tick 3600` (long delay before hatching)
  - If the egg can't be placed at the position (collision), it is immediately killed

This creates a self-regulating population: bugs only reproduce when the total population is low and there aren't too many nearby, preventing overcrowding.

#### State 3: Seeking Flower (lines 128-145)

When the bug is seeking a flower (`ov00 = 3`):
- Sets movement speed to 3 in both axes
- Calls `home` subroutine to steer toward the target flower (`ov16`)
- Calls `velo` subroutine to smoothly adjust velocity
- On contact with the target flower (`touc ov16 ownr > 0`):
  - Sends **message 303** (pollinate) to the flower
  - Returns to flying state (`ov00 = 0`)
  - Adds 100 to `ov02` cooldown to delay next flower search

If the target flower becomes null (destroyed), returns to flying state.

**Ecosystem Impact**: Message 303 triggers pollination behavior in flower agents (genus 7), advancing their reproductive cycle.

#### State 1: Resting (lines 150-175)

When the bug is resting (`ov00 = 1`):
- `ov91` increments; when it exceeds a random threshold (30-50):
  - Plays a jump animation (frames depend on direction)
  - Sets vertical velocity to -10 (upward launch) with low gravity (0.3)
  - Waits for animation to complete (`over`)
  - Returns to flying state (`ov00 = 0`)
- While resting on the ground (not falling), plays walk-left or walk-right animation

This creates a pattern where the bug lands, sits briefly, then leaps back into the air.

#### State 0: Flying / Wandering (lines 179-226)

The default flying behavior:
- `ov91` increments; when it exceeds a random threshold (30-50):
  - Transitions to resting state (`ov00 = 1`) with high gravity (`accg 3`)
  - Sets pose based on direction and stops
- Otherwise, continues flying with speed 5 in both axes
- Decrements `ov90` (wall bounce timer)
- Calls `wall` subroutine to detect and bounce off obstacles
- When `ov90 ≤ 0`, may randomly reverse X direction and/or Y direction
- Calls `velo` to smooth velocity and `anim` to set appropriate animation

#### Flower Search Trigger (lines 88-125)

Embedded within the timer, `ov02` decrements each tick. When it drops below a random threshold (100-200) and the bug is not already seeking:
- If in resting state, resets `ov91` timer
- Scans for visible flowers (`esee 2 7 0`) within 100 vertical distance
- Finds the nearest flower by X distance
- If a flower is found within range, stores it in `ov16` and enters seeking state (`ov00 = 3`)
- If no flower is found, returns to flying state

### Subroutines

| Subroutine | Purpose |
|---|---|
| `left` | Play left-flying animation (frames 0-3), set velocity (-3, -5) |
| `rite` | Play right-flying animation (frames 4-7), set velocity (3, -5) |
| `velo` | Smoothly accelerate/decelerate current velocity (`ov12`/`ov13`) toward target speed (`ov14`/`ov15`) by ±2 per tick |
| `wall` | Check obstacle distance in 4 directions; if wall is closer than threshold (100 for left/right/down, 50 for up), reverse corresponding direction |
| `anim` | Set flying animation based on current X velocity: rightward = frames 31-35, leftward = frames 17-21 |
| `home` | Steer toward target flower: calculates relative X/Y position and adjusts direction signs (`ov10`/`ov11`) to head toward the target |

---

## Balloon Bug Egg (2 18 24)

The balloon bug egg is a transient spawner agent. It exists at a location for a long duration (tick 3600), and when its timer fires, it hatches a new balloon bug at its position and self-destructs.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `blnk` | 1 frame, invisible/minimal placeholder sprite |
| `attr` | 16 | Carryable only |
| `tick` | 3600 | Long delay before hatching |

### Events

| Event | Script | Description |
|---|---|---|
| Timer | `scrp 2 18 24 9` | Hatches a new balloon bug and self-destructs |

### Event: Timer (Script 9) — Hatching

When the egg's timer fires:
1. Records its own position (`posl`, `post`)
2. Creates a new balloon bug (2 13 9) at that position with identical properties to bootstrap bugs:
   - `attr 198`, `clac 0`, `elas 0`, `ov61 40`
   - Random X and Y direction signs
   - `tick 5`
3. Destroys itself (`kill ownr`)

This ensures the balloon bug population can slowly replenish over time.

---

## Remove Script

The remove script (`rscr`) cleans up all balloon bugs when the script is unloaded:
- Enumerates and kills all agents of classifier 2 13 9
- Unregisters the timer script (`scrx 2 13 9 9`)

Note: The egg agent (2 18 24) scripts are not explicitly removed, so any existing eggs will persist but fail to spawn new bugs if the balloon bug scripts have been unloaded.
