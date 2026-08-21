# Hawk.cos - Hawk Predator Ecosystem

**Source**: `Assets/Bootstrap/001 World/Hawk.cos`

## Overview

This script implements the hawk predator system for the Creatures 3 world. A hawk is created on a perch at the top of the ship, where it rests for long periods before taking flight to hunt small critters. The hawk follows a complex state machine that governs perching, flying, hunting, diving at prey, returning home, and landing behaviors.

The hawk serves as a top predator in the ecosystem: it scans for small animals (classifier 2 15 2), dives to catch them, and carries prey back to its nest where it consumes them, scattering bone fragments. While perched, the hawk periodically drops grazing material (2 10 6) which varies depending on whether a Grendel nest (1 1 11) is present. The hawk also has self-preservation behaviors including wall-trap detection, obstacle avoidance, and automatic teleportation when it enters water rooms.

At bootstrap, one hawk is created on a single perch at position (1152, 321), with a random facing direction and a long perch timer (1200-2400 ticks) before its first flight.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 17 4 | Hawk Perch | `hawk` frame 132 | Static perch/nest where the hawk rests between hunts | [Detail](#hawk-perch-2-17-4) |
| 2 16 1 | Hawk | `hawk` frame 62 | Predatory bird — hunts critters, catches prey, returns to perch | [Detail](#hawk-2-16-1) |
| 2 10 6 | Grazing Dropping | `graz` frame 216/218 | Food droppings created by the hawk while perched | [Detail](#grazing-dropping-2-10-6) |
| 1 1 21 | Feather | `hawk` frame 124 | Particle effect created when hawk swoops near the ground | [Detail](#feather-1-1-21) |
| 2 10 17 | Dead Hawk Body | `hawk` frame 54/58 | Decomposing hawk corpse; cycles through decay poses | [Detail](#dead-hawk-body-2-10-17) |
| 2 10 30 | Bone Fragment | `bone` frame 0 | Bone debris scattered when hawk consumes prey at the nest | [Detail](#bone-fragment-2-10-30) |
| 1 1 43 | Teleport Effect | `teleport` frame 11 | Visual effect when hawk teleports out of water rooms (also created by GUI 1) | [Detail](#teleport-effect-1-1-43) |

---

## Hawk Perch (2 17 4)

A static decorative agent placed at position (1152, 341) that serves as the hawk's home base. The hawk references the perch via `ov17` and navigates back to it after hunting. The perch has no behavior scripts — it is purely a spatial anchor.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hawk` | 3 images, first image 132 |
| Plane | 200 | Behind the hawk (190) |
| Pose | 2 | Display pose |
| Position | (1152, 341) | Top area of the ship |

---

## Hawk (2 16 1)

The hawk is the main predatory agent. It uses a 7-state behavior machine that governs its lifecycle from resting on its perch to hunting, diving, and returning home with prey.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `hawk` | 62 images, first image 62 |
| Plane | 190 | Slightly in front of perch |
| Position | (1152, 321) | On the perch (20px above perch position) |
| `attr` | 71 | Carryable + Mouseclickable + Activatable 1 + Suffers Physics |
| `elas` | 20 | Moderate bounce |
| `accg` | 1 | Light gravity while perched |
| `aero` | 5 | Air resistance |
| `tick` | 5 | Timer interval |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0=Perched, 1=Flying, 2=Diving, 3=Returning Home, 4=Swooping, 5=Landing, 6=Trapped |
| `ov10` | Horizontal direction | -1=Left, 1=Right |
| `ov11` | Vertical direction | -1=Up, 0=None, 1=Down |
| `ov17` | Perch agent reference | Always set to the hawk perch (2 17 4) |
| `ov18` | Target prey reference | Agent being hunted/carried; null when no target |
| `ov30`-`ov43` | Animation base frames | See table below |
| `ov61` | CA smell emission | 80 |
| `ov70` | Primary timer | Countdown for state transitions |
| `ov71` | Secondary timer | Sub-behavior countdown within states |
| `ov72` | Carrying prey flag | 0=Empty, 1=Carrying prey |
| `ov73` | Saved state | Previous state saved before entering Trapped state |

### Animation Base Frames

| Variable | Value | Animation |
|---|---|---|
| `ov30` | 0 | Perched facing left |
| `ov31` | 1 | Perched facing right |
| `ov32` | 2 | Swooping/trapped facing left |
| `ov33` | 10 | Swooping/trapped facing right |
| `ov34` | 18 | Diving facing left |
| `ov35` | 19 | Diving facing right |
| `ov36` | 20 | Flying facing left |
| `ov37` | 28 | Flying facing right |
| `ov38` | 36 | Flying with prey / attacking facing left |
| `ov39` | 44 | Flying with prey / attacking facing right |
| `ov40` | 52 | Ground attack facing left |
| `ov41` | 53 | Ground attack facing right |
| `ov42` | 54 | Dead hawk sprite offset (left) |
| `ov43` | 58 | Dead hawk sprite offset (right) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: state machine for all hawk behaviors |
| 4 | Hit | Hawk is hit — triggers death sequence |
| 5 | Pickup | Hawk is picked up — becomes airborne |

#### Event 9 — Timer (Main Behavior Loop)

The hawk's AI runs every 5 ticks through a multi-state hunting cycle.

**Teleport Safety Check (all states):**
If the hawk is in a fresh water room (type 8) or salt water room (type 9), it teleports back to (1152, 341) near its perch. A teleport visual effect (1 1 43 "teleport") is created at the hawk's old position with sound "tele" and a flash animation.

**Grazing Behavior (all states, when not carrying):**
If the hawk is not carrying anything, there is a 1-in-11 chance it drops grazing material:
1. Checks for a Grendel nest agent (1 1 11) and reads its `ov00` value.
2. If the Grendel nest's `ov00` is 0 (no Grendels active): creates grazing (2 10 6) with sprite offset 216.
3. If the Grendel nest's `ov00` is non-zero (Grendels active): creates grazing (2 10 6) with sprite offset 218.
4. The grazing has attr 192 (Suffers Physics + Collisions), aero 5, accg 5, elas 0.

**State 0 — Perched:**
The hawk rests on its perch and performs idle animations:
1. Counts down `ov70` (primary timer, initially 1200-2400).
2. When `ov70` reaches 0: sets direction to right (`ov10=1`), transitions to State 1 (Flying), resets `ov70` to 50-100, increases gravity to 2.
3. While perched, uses secondary timer `ov71` to control random behaviors:
   - 1-in-4 chance: **Preen** — plays preening animation (8 frames) using attack base frames (ov38/ov39 based on direction).
   - 1-in-4 chance: **Turn** — reverses direction (`negv ov10`).
   - 1-in-4 chance: **Bob** — moves up 9px then back down 9px (3 repetitions of mvby 0 -3 then mvby 0 3).
4. After any animation, resets to perched pose using ov30 (left) or ov31 (right).

**State 1 — Flying/Hunting:**
The hawk takes flight and searches for prey:
1. If not being carried, sets plane to 8200 (far background layer).
2. Adds floatable attribute (`attr |= 128`).
3. Counts down `ov70`; when 0, transitions to State 3 (Returning Home).
4. Calls `levl` subroutine for altitude control and `fly_` for flight mechanics.
5. Scans for prey (2 15 2) within range 1000, counting nearby targets.
6. If 7 or more prey nearby: narrows range to 400, selects one target, stores in `ov18`.
7. Calculates relative position to prey and adjusts direction.
8. Sets diving animation base (ov34/ov35) and calculates dive velocity:
   - Distance < 100: velx = 7 * direction
   - Distance < 200: velx = 9 * direction
   - Distance >= 200: velx = 11 * direction
   - vely = 30 (downward dive)
9. Transitions to State 2 (Diving).

**State 2 — Diving at Prey:**
The hawk dives toward its selected prey:
1. **If touching prey** (`touc ov18 ownr > 0`):
   - Plays "hawk" attack sound.
   - Shows attack animation (ov38/ov39 base, 8 frames).
   - Sets upward velocity (`vely = -30`).
   - Sends **message 4** (Hit/Pickup) to the prey.
   - Sets carrying flag (`ov72 = 1`).
   - Transitions to State 3 (Returning Home).
2. **If near ground** (`obst down <= 10`):
   - Shows ground attack pose (ov40/ov41 base).
   - Sets forward velocity (`velx = 20 * direction`).
   - Creates **6 feather particles** (1 1 21) in a horizontal line with staggered activation delays.
   - Transitions to State 4 (Swooping) with `ov71` = 4-10 bounces.
   - Increases gravity to 2.

**State 3 — Returning Home:**
Calls the `home` subroutine which navigates the hawk back toward its perch.

**State 4 — Swooping (Missed Prey):**
The hawk bounces near the ground after a missed dive:
1. For `ov71` repetitions:
   - When near ground: plays swooping animation (ov32/ov33 base, 8 frames), bounces up (`vely = -10`, `velx = 10 * direction`).
   - Randomly changes direction.
2. After bouncing complete: plays takeoff animation (ov36/ov37 base), transitions to State 3 with upward velocity (`vely = -30`).

**State 5 — Landing on Perch:**
The hawk slowly descends onto its perch:
1. Reduces plane to 190 (foreground).
2. Reduces gravity to 0.1 and stops horizontal velocity.
3. Enters a loop that navigates toward the perch agent's position:
   - Reads perch position (ov17), adjusts velocity to converge.
   - Uses attack base animation (ov38/ov39) while approaching.
4. When aligned with perch: exits loop, resets to State 0 (Perched).
5. Restores normal attributes (`attr 71`), clears velocity, resets `ov70` to 1200-2400.
6. **If carrying prey** (`ov72 = 1`):
   - Clears carrying flag.
   - Kills the prey agent (`kill ov18`).
   - Waits 10 ticks.
   - Creates **5 bone fragments** (2 10 30) at the perch with random scatter velocities (velx: -7 to 7, vely: -10 to 0).
   - Bone fragments have: attr 199, elas 20, accg 1, decomposition animation, tick 10.

**State 6 — Trapped:**
Emergency behavior when the hawk is stuck between walls:
1. For `ov71` repetitions:
   - When near ground: plays swooping animation, bounces up with directional velocity.
   - Randomly changes direction (1-in-6 chance).
   - **Wall escape**: If left wall < 200 and facing left, reverses direction. If right wall < 200 and facing right, reverses direction.
2. After bouncing complete: plays takeoff animation, returns to saved state (`ov73`) with upward velocity (`vely = -20`).

#### Subroutine: `home` — Return to Perch

1. Reads perch position (from ov17) with ±20px tolerance zone.
2. Sets target altitude (`ov90`-`ov92`) and computes vertical direction.
3. Calls `trap` subroutine to check for wall traps.
4. Calls `fly_` subroutine for flight.
5. If touching the perch and positioned above it: transitions to State 5 (Landing).

#### Subroutine: `fly_` — Flight Mechanics

1. Plays "flap" wing sound.
2. **Wall avoidance**: If left wall < 100 or right wall < 100, reverses direction.
3. **Animation**: Selects flying base frames based on carrying flag (`ov72`) and direction:
   - Not carrying: ov36/ov37 (normal flight)
   - Carrying prey: ov38/ov39 (flight with prey)
4. Plays 8-frame wing flap animation.
5. Sets horizontal velocity to ±15 based on direction.
6. Sets vertical velocity: base -13, adjusted by `ov11 * 6` for altitude corrections.

#### Subroutine: `levl` — Altitude Control

1. If floor distance < 450: sets `ov11 = -1` (fly up).
2. If floor distance > 500: sets `ov11 = 1` (fly down).
3. If ceiling distance < 150 and already flying up: reverses to fly down.
4. Calls `trap` check after altitude adjustment.

#### Subroutine: `die_` — Death Sequence

1. Increases gravity to 7.
2. Sets death pose (base 0, pose 18 left / pose 19 right).
3. Sets horizontal death velocity (±20).
4. Falls until hitting the ground (`obst down <= 1`).
5. Creates a **Dead Hawk Body** (2 10 17) at current position.
6. Kills self (`kill ownr`).

#### Subroutine: `trap` — Wall Trap Detection

Checks if both left wall (`obst 2`) ≤ 150 and floor (`obst 3`) ≤ 100:
1. Saves current state to `ov73`.
2. Transitions to State 6 (Trapped) with `ov71` = 4-8 bounces.
3. Shows swooping pose (ov32/ov33 base).
4. Stops current processing.

#### Event 4 — Hit

When the hawk is hit:
1. Stops all animation (`anim []`).
2. Stops timer (`tick 0`).
3. Plays death animation using flying-with-prey base (ov39, right-facing), 8 frames.

#### Event 5 — Pickup

When the hawk is picked up:
1. Sets direction to right (`ov10 = 1`).
2. Transitions to State 1 (Flying).
3. Sets `ov70` to 50-100 (flight timer).
4. Increases gravity to 2.
5. Restarts timer (`tick 5`).

---

## Grazing Dropping (2 10 6)

A food item dropped by the hawk while perched. The sprite variant changes depending on whether Grendels are present in the world (checked via the Grendel nest agent 1 1 11).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `graz` | 2 images |
| First Image | 216 (no Grendels) / 218 (Grendels present) | Varies based on Grendel nest state |
| Plane | 1999 | Far foreground |
| `attr` | 192 | Suffers Physics + Collisions |
| `aero` | 5 | Air resistance |
| `accg` | 5 | Normal gravity |
| `elas` | 0 | No bounce |

No behavior scripts are defined for this agent. It is a passive physics object that falls and rests on surfaces.

---

## Feather (1 1 21)

A particle effect created when the hawk swoops near the ground during a missed dive. Six feathers are spawned in a horizontal line with staggered activation delays, creating a scatter effect.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hawk` | 8 images, first image 124 |
| Plane | 8000 | Very far background |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Plays feather floating animation, then self-destructs |

#### Event 1 — Activate 1

1. Plays a slow feather animation: each frame shown twice for a gentle floating effect (frames [0 0 1 1 2 2 3 3 4 4 5 5 6 6 7 7]).
2. Waits for animation to complete (`over`).
3. Destroys itself (`kill targ`).

---

## Dead Hawk Body (2 10 17)

A decomposing hawk corpse created by the `die_` subroutine when the hawk is killed. It cycles through 4 decay poses before disappearing.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hawk` | 4 images, first image 54 (left) or 58 (right) |
| Plane | 6001 | Foreground |
| `attr` | 192 | Suffers Physics + Collisions |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition — advances pose, then self-destructs |

#### Event 9 — Timer (Decomposition)

1. If current pose < 3: advances pose by 1.
2. If pose reaches 3: destroys itself (`kill ownr`).

The timer rate is set to 100 ticks per frame, so the dead body persists for approximately 400 ticks total before disappearing.

---

## Bone Fragment (2 10 30)

Bone debris scattered when the hawk consumes its prey at the nest. Five bone fragments are created with random scatter velocities, each playing a tumbling animation before disappearing.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `bone` | 12 images, first image 0 |
| Plane | 100 | Background layer |
| `attr` | 199 | Carryable + Mouseclickable + Activatable 1 + Suffers Physics + Collisions |
| `elas` | 20 | Moderate bounce |
| `accg` | 1 | Light gravity |
| `tick` | 10 | Timer for self-destruction |
| Initial velx | Random -7 to 7 | Random horizontal scatter |
| Initial vely | Random -10 to 0 | Upward/neutral scatter |

### Behavior

Each bone fragment plays a 12-frame tumbling animation ([0 1 2 3 4 5 6 7 8 9 10 11 255]) and is destroyed when the animation completes or when its timer fires. No explicit timer script is defined — the `255` animation terminator and tick-based lifecycle handle cleanup.

---

## Teleport Effect (1 1 43)

A visual flash effect created when the hawk teleports out of water rooms back to its perch. This agent is also created by other scripts (notably GUI 1). The hawk creates it at the hawk's pre-teleport position with a sparkle animation and "tele" sound effect.

### Properties (as created by Hawk)

| Property | Value | Notes |
|---|---|---|
| Sprite | `teleport` | 9 images, first image 11 |
| Plane | 5001 | Foreground overlay |
| Animation | [0 1 2 3 4 5 6 5 4 3 2 1 0] | Flash in and out |
| Sound | "tele" | Teleport sound effect |

The effect self-destructs after its animation completes (`over` then `kill targ`).

---

## Removal Script (rscr)

The removal script cleanly uninstalls the hawk ecosystem:

1. Kills all hawks (`enum 2 16 1 → kill targ`).
2. Kills all hawk perches (`enum 2 17 4 → kill targ`).
3. Kills all dead hawk bodies (`enum 2 10 17 → kill targ`).
4. Kills all feathers (`enum 1 1 21 → kill targ`).
5. Removes scripts: `scrx 2 16 1 9` (Timer), `scrx 2 16 1 4` (Hit), `scrx 2 16 1 5` (Pickup), `scrx 2 16 1 104` (unused/legacy).

---

## State Machine Diagram

```
Bootstrap creates 1 hawk on 1 perch
            │
            ▼
┌───────────────────────┐
│  State 0 — Perched    │
│  (ov70: 1200-2400)    │
│                       │
│  Idle: preen, turn,   │
│  bob head             │
│  Drops grazing (1/11) │
└───────────┬───────────┘
            │ ov70 reaches 0
            ▼
┌───────────────────────┐         ┌────────────────────┐
│  State 1 — Flying     │────────►│  State 3 — Return  │
│  (ov70: 50-100)       │ timeout │  Home               │
│                       │         │  (calls home subr)  │
│  Altitude control     │         │                     │
│  Wall avoidance       │         │  Navigate to perch  │
│  Scan for prey 2 15 2 │         └──────────┬─────────┘
└───────────┬───────────┘                    │
            │ 7+ prey found                  │ touching perch
            ▼                                ▼
┌───────────────────────┐         ┌────────────────────┐
│  State 2 — Diving     │         │  State 5 — Landing │
│                       │         │                     │
│  Chase prey with      │         │  Slow descent       │
│  calculated velocity  │         │  Align with perch   │
│                       │         │  If carrying prey:  │
│  ┌──── Hits prey ────►│─ set ──►│  kill prey, drop    │
│  │  ov72=1, msg 4     │ ov00=3  │  5 bones (2 10 30) │
│  │                    │         └──────────┬─────────┘
│  │  Hits ground ─────►│─ set ──►┌──────────┘
│  │  6 feathers        │ ov00=4  │ reset to State 0
│  └────────────────────┘         ▼
            │                 (back to Perched)
            ▼
┌───────────────────────┐
│  State 4 — Swooping   │
│  (ov71: 4-10 bounces) │
│                       │
│  Bounce near ground   │
│  Random direction     │
│  changes              │
└───────────┬───────────┘
            │ bounces done
            ▼
        State 3 (Return Home)


┌───────────────────────┐
│  State 6 — Trapped    │   Entered from trap subroutine
│  (ov71: 4-8 bounces)  │   when walls detected on both
│                       │   sides (obst 2 ≤ 150 and
│  Panic bounce         │   obst 3 ≤ 100)
│  Wall escape logic    │
│  Returns to ov73      │──► Saved previous state
└───────────────────────┘
```

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 15 2 | Prey scanning (`esee`) | Hawk hunts these small critters; dives when 7+ nearby |
| 1 1 11 | State check (`ov00`) | Grendel nest — affects grazing type dropped by hawk |
| 2 17 4 | Navigation target | Hawk perch — hawk returns here after hunting |

## Prey Interaction Flow

When the hawk catches prey (2 15 2):
1. **Dive** — Hawk dives at prey in State 2 with calculated velocity.
2. **Catch** — On contact, sends message 4 (Pickup/Hit) to prey, sets carrying flag.
3. **Return** — Hawk returns to perch (State 3 → 5) carrying the prey reference.
4. **Consume** — On landing, kills the prey agent and scatters 5 bone fragments.
