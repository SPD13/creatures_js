# Uglee.cos - Uglee Predator Bird

**Source**: `Assets/Bootstrap/001 World/Uglee.cos`

## Overview

This script implements the Uglee, a bat-like predatory bird that inhabits the upper regions of the Creatures 3 ship (around x:6130–6900, y:220). Two Uglees are created at bootstrap, and they serve as pest control agents in the ecosystem by hunting ground-dwelling volcano bugs (2 21 4) and flying gnarlers (2 18 18).

The Uglee alternates between resting on the ground, walking and chasing ground bugs, and flying patrols where it scans for gnarlers below. When it spots enough gnarlers, it dives to catch one, carries it back to its home territory, drops it, and eats it. Periodically, the Uglee drops waste particles (2 10 6 "graz"), whose appearance depends on the current state of the ship's Toilet Control system (1 1 11).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 16 8 | Uglee | `uglee` frame 0 | Predatory bat-bird that hunts bugs on the ground and by diving from the air | [Detail](#uglee-2-16-8) |
| 2 10 6 | Uglee Dropping | `graz` frame 216/218 | Waste particle dropped periodically; sprite frame varies by Toilet Control state | [Detail](#uglee-dropping-2-10-6) |

---

## Uglee (2 16 8)

The Uglee is a bat-like predator with a complex state machine covering idle behavior, ground hunting, flying patrols, dive attacks, and prey carrying. It operates within a defined home territory and always returns there after foraging flights.

### Bootstrap Configuration

Two Uglees are created at startup via `reps 2`:

| Property | Value | Notes |
|---|---|---|
| `attr` | 194 | Physics + Collisions + Carryable |
| `perm` | 80 | Fairly impermeable |
| `elas` | 0 | No bounce |
| `fric` | 5 | Very low friction |
| `accg` | 2 | Moderate gravity |
| `pupt` | -1 38 40 | Pickup point at offset (38, 40) |
| `tick` | 9 | Timer interval |
| Position | (6201, 220) | Upper ship area |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0=Wait, 1=Walk/Hunt, 2=Fly Home, 3=Patrol/Fly, 4=Dive Attack |
| `ov10` | X direction | -1=Left, 1=Right |
| `ov12` | Vertical velocity offset | -12 (near ground) or -8/-9 (airborne) |
| `ov16` | Held target agent | Reference to caught gnarler |
| `ov61` | CA smell emission | 50 |
| `ov69` | Y altitude reference | 230 (home), 320 (patrol) |
| `ov70` | Left boundary X | 6130 |
| `ov71` | Right boundary X | 6900 |
| `ov72` | Wait/patrol counter | Increments each tick |
| `ov73` | Wait/patrol target | Random 50–150 ticks |
| `ov74` | Dive check interval | Counts down from 5 |
| `ov80` | Carrying flag | 0=Empty, 1=Carrying prey |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: state machine for waiting, hunting, flying, diving, and carrying |

#### Event 9 — Timer (Main Behavior Loop)

The Uglee's AI runs every 9 ticks through a multi-state behavior cycle.

**Common logic (all states):**
1. Resets timer to 9 ticks.
2. **Dropping waste**: With a 1-in-6 chance (`rand 0 5 eq 0`) and when not carried:
   - Checks a random Toilet Control agent (1 1 11) for its `ov00` state.
   - If Toilet `ov00 = 0`: creates a dropping (2 10 6 "graz") at frame 216.
   - If Toilet `ov00 ≠ 0`: creates a dropping at frame 218.
   - The dropping has `attr 192`, `aero 5`, `accg 5`, `elas 0` and simply falls to the ground.

**State 0 — Wait:**
1. Calls `wait` subroutine: zero velocity, idle animation.
2. Increments `ov72` each tick.
3. When `ov72 >= ov73` (random 50–150 ticks): transitions to State 1 (Walk/Hunt), resets counter.

**State 1 — Walk/Hunt (ground bugs):**
1. Checks if within home territory boundaries (`posl >= ov70` and `posr <= ov71`).
2. If at boundary edges: reverses direction (`negv ov10`), slows tick to 20.
3. With 1-in-4 chance: searches for touching volcano bugs (2 21 4) using `etch`:
   - Evaluates whether the bug is ahead in the Uglee's facing direction.
   - If a bug is found: launches it upward (`velo va99 -30`) and calls `eat_` subroutine.
4. If no bug found: calls `walk` subroutine (walk animation with velocity ±10).
5. If outside boundaries: calls `fly_`, transitions to State 3 (Patrol), resets direction to left.

**State 2 — Fly Home:**
1. Adjusts vertical velocity (`ov12`) based on altitude: -12 near ground, -9 otherwise.
2. If not carrying (`ov80 = 0`): calls `fly_` subroutine.
3. If carrying (`ov80 = 1`): calls `cary` subroutine (carrying flight animation).
4. Boundary corrections: turns right if past left boundary, turns left if past right boundary.
5. When back within home territory:
   - Transitions to State 0 (Wait).
   - If carrying prey (`ov80 = 1`):
     - Sends message 5 (drop) to carried target (`ov16`).
     - Waits until landing (`fall eq 0`).
     - Calls `eat_` subroutine.
     - If target is a gnarler (`gnus 18, spcs 18`): sets its pose to 9 (dead).
     - Clears carrying state, calls `chew`, waits 50 ticks.

**State 3 — Patrol/Fly:**
1. Increments `ov72`; when `>= ov73`: transitions to State 2 (Fly Home), resets counter.
2. Obstacle avoidance: reverses direction if wall within 50 pixels.
3. Sets horizontal velocity: `ov10 * rand(3, 6)`.
4. Adjusts vertical velocity based on altitude (ceiling target at 320).
5. Calls `fly_` subroutine.
6. Decrements `ov74`; every 5 ticks:
   - Counts visible gnarlers (2 18 18) using `esee`.
   - If 3+ gnarlers visible: calls `dive` subroutine.

**State 4 — Dive Attack:**
1. Waits until landing (`fall eq 0`).
2. Searches nearby gnarlers (2 18 18) using `etch`:
   - Finds one not in pose 9 (not already caught/dead).
   - Stores target in `ov16`, sends message 4 (pickup) to it.
   - Sets `ov80 = 1` (carrying).
3. Bounces upward (`vely = -20`).
4. Transitions to State 2 (Fly Home) to deliver prey.

### Subroutines

| Subroutine | Purpose | Animation Frames |
|---|---|---|
| `walk` | Walking with directional animation | Left: 0–7, Right: 8–15 |
| `wait` | Idle with zero velocity | Left: 16–23, Right: 24–31 |
| `fly_` | Flying animation + vertical velocity + sound | Left: 36–39,32–35; Right: 44–47,40–43 |
| `cary` | Flying while carrying prey | Left: 48–55, Right: 56–63 |
| `eat_` | Eating animation (blocking) | Left: 64–71, Right: 72–79 |
| `chew` | Chewing animation | Left: 80–87, Right: 88–95 |
| `dive` | Checks for gnarler below, initiates dive | N/A (uses `fly_` then sets state) |

#### Subroutine `dive` (Detail)

1. Stops horizontal movement, calls `fly_`.
2. Checks if any gnarlers (2 18 18) are directly below (between `posl` and `posr`) using `esee`.
3. If a gnarler is found below: sets `vely = 5` (dive downward), transitions to State 4.

---

## Uglee Dropping (2 10 6)

A cosmetic waste particle dropped by the Uglee during its timer event. The dropping simply falls to the ground and remains as a passive object. Its sprite frame depends on the ship's Toilet Control state.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 192 | Physics + Collisions (not carryable, not mouseclickable) |
| `aero` | 5 | Air resistance while falling |
| `accg` | 5 | Moderate-high gravity |
| `elas` | 0 | No bounce |
| Sprite | `graz` frame 216 or 218 | Depends on Toilet Control (1 1 11) `ov00` state |
| `tick` | None | No timer — purely cosmetic |

Note: This is the same classifier (2 10 6) as hawk droppings created by the Hawk script, using different sprite frames from the same "graz" sprite sheet.

---

## Removal Script (rscr)

The removal script kills all Uglee agents:
1. Enumerates all Uglees (`enum 2 16 8 → kill targ`).

---

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 21 4 | Touch detection (`etch`) | Uglee hunts volcano bugs on the ground (State 1) |
| 2 18 18 | Visual scan (`esee`) + touch (`etch`) | Uglee patrols for gnarlers and dive-attacks them (States 3, 4) |
| 1 1 11 | Read `ov00` (`rtar`) | Toilet Control state determines dropping sprite frame |
| 2 10 6 | Creation | Waste droppings created periodically |

## Behavior Diagram

```
Bootstrap creates 2 Uglees at (6201, 220)
              │
              ▼
┌─────────────────────────┐
│   State 0: Wait         │ ◄────────────────────────┐
│   (idle animation)      │                          │
│   ov72 counts to ov73   │                          │
└──────────┬──────────────┘                          │
           │ counter reached                         │
           ▼                                         │
┌─────────────────────────┐                          │
│   State 1: Walk/Hunt    │                          │
│   (hunts ground bugs    │                          │
│    2 21 4 on territory) │                          │
│                         │                          │
│   Found bug → eat_      │                          │
└──────────┬──────────────┘                          │
           │ outside territory                       │
           ▼                                         │
┌─────────────────────────┐    arrived home          │
│   State 3: Patrol/Fly   │───────────────────►──────┤
│   (flies around area)   │    (via State 2)         │
│                         │                          │
│   3+ gnarlers → dive    │                          │
└──────────┬──────────────┘                          │
           │ dive triggered                          │
           ▼                                         │
┌─────────────────────────┐                          │
│   State 4: Dive Attack  │                          │
│   (lands, grabs gnarler)│                          │
│   sends msg 4 to prey   │                          │
└──────────┬──────────────┘                          │
           │ bounce up (vely=-20)                    │
           ▼                                         │
┌─────────────────────────┐                          │
│   State 2: Fly Home     │                          │
│   (carries prey back)   │                          │
│   drops, eats, chews    │──────────────────────────┘
└─────────────────────────┘
```
