# meerk.cos - Meerkat Critter Ecosystem

**Source**: `Assets/Bootstrap/001 World/meerk.cos`

## Overview

This script installs the meerkat ecosystem for the Creatures 3 world. Three meerkats (classifier 2 15 23) are spawned in the Ettin desert area (around x=5700-5800, y=415). Meerkats are small critters that wander around, sit, dig, push, run and preen randomly. They hunt and eat very small prey (classifier 2 13 9 — baby ettin-area critters), periodically go underground by digging a hole (classifier 1 1 8) and emerge again later. When their hunger counter runs out and they are not already in a special state, they freeze, fall over, decompose by advancing their pose, and alter their room's CA smells (CA 3 and CA 4) — turning into food/decay smell sources for the ecosystem — before dying.

Meerkats share their classifier (2 15 23) with agents created by the Ettin Seed Bank script; both scripts register creation entries for the same family/genus/species.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 23 | Meerkat | `meerk` 145 images, first image 0 | Small desert critter that wanders, hunts, digs, and dies in the Ettin area | [Detail](#meerkat-2-15-23) |
| 1 1 8 | Meerkat Hole | `meerk` 1 image, first image depends on direction | Temporary hole created by a meerkat while it is underground | [Detail](#meerkat-hole-1-1-8) |

---

## Meerkat (2 15 23)

A small critter living in the ship's Ettin/desert area. It uses an `ov00` behavior-state variable and a hunger-like timer `ov02` to drive a simple random action loop and eventual death. Three meerkats are created at bootstrap with randomized facing direction and randomized hunger counter.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `meerk` | 145 images, first image 0 |
| Plane | 2500 | Mid-ground layer |
| `attr` | 194 | Mouseclickable + Suffers Physics + Collisions |
| `elas` | 0 | No bounce |
| `fric` | 10 | Ground friction |
| `accg` | 2 | Normal gravity |
| Position | (rand 5700..5800, 415) | Ettin desert area |
| `tick` | 8 | Timer interval |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behavior state | 0 = Normal wandering, 5 = Underground (in hole), 9 = Dying/decomposing |
| `ov02` | Hunger / life counter | Initial rand 100..500; decremented each tick |
| `ov10` | Horizontal facing direction | -1 = Left, 1 = Right |
| `ov17` | Reference to the current meerkat hole agent (1 1 8) while underground | Set in `dig_`, cleared when emerging |
| `ov90` | Suppress-death flag | When non-zero, the meerkat will not enter the death state even if hunger runs out |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main AI loop: hunger decrement, eating, random actions, dig/emerge, death sequence |

#### Event 9 — Timer (Main AI Loop)

The timer runs every 8 ticks (normally) and implements the meerkat's entire behavior. Execution order:

1. **Carried / falling short-circuit**: If the meerkat is being carried (`carr ne null`) or currently airborne (`fall ne 0`), the script stops immediately — no AI, no hunger decrement.
2. **Hunger decrement**: `subv ov02 1` — hunger counter decreases each tick.
3. **Already dying (ov00 = 9)**: Sets tick to 600 (slow decay cadence), calls the `dead` subroutine (advance decomposition pose / alter room CAs / kill self when fully decayed), and stops.
4. **Death entry**: If `ov02 <= 0` and `ov90 = 0` (no suppression), the meerkat freezes and falls over:
   - Zeroes horizontal velocity and clears any running animation.
   - Plays the fall-over animation (bases 70/82 depending on direction, 9 frames).
   - Waits for the animation to complete (`over`).
   - Sets `ov00 = 9`, tick 600, and stops. From now on, only the decay branch runs.
5. **Normal state (ov00 = 0)**:
   1. **Hunting**: When hunger is low (`ov02 <= 200`), enumerates all prey of classifier 2 13 9 within reach. If at least one is found:
      - Targets the prey, zeroes its timer and velocity (freezes it).
      - Returns to self, runs the `eat_` animation subroutine.
      - Kills the prey.
      - Adds 50 to hunger (`ov02 += 50`), then plays the `rise` animation.
   2. **Random action**: Picks a random integer 0..5 and performs one of:
      - 0: `dig_` (go underground) if not carrying anything, otherwise `sit_`.
      - 1: `sit_`.
      - 2: Flip facing direction (`negv ov10`).
      - 3: `run_`.
      - 4: Three `push` animations in a row.
      - 5 (else): `walk`.
6. **Emerging from hole (ov00 = 5)**: When in the underground state, this branch handles surfacing:
   - Reads the hole's (ov17) position.
   - If the hole reference is `null` (hole was destroyed), the meerkat kills itself — it has nowhere to emerge.
   - Teleports itself to the hole's position, nudges upward (`velo 0 -10`), resets plane to 2000 and attr 194.
   - Plays the stand-up animation (bases 58/64 depending on direction) and waits for it to complete.
   - Kills the hole (1 1 8) if still present.
   - Sets `ov00 = 0` and calls `run_` to dart away.

### Subroutines (animation / behavior fragments)

All subroutines short-circuit with `stop` if the meerkat is airborne (`fall eq 1`).

| Subroutine | Purpose | Direction-dependent animation |
|---|---|---|
| `walk` | Walk horizontally | Left: anim [0..10 255], velx -5 / Right: anim [11..21 255], velx +5 |
| `run_` | Run (faster) | Left: anim [22..33 255], velx -9 / Right: anim [34..45 255], velx +9 |
| `sit_` | Sit idle | velx 0, anim [46..51] or [52..57], `over` |
| `stnd` | Stand up | velx 0, anim [58..63] or [64..69], `over` |
| `eat_` | Two-phase eat animation | [94..97]+`over`+[98..101 255] or [102..105]+`over`+[106..109 255] |
| `rise` | Rise after eating | [110..111] or [112..113], `over` |
| `push` | Push (stretch / reach) | [94..97 110 111 255] or [102..105 112 113 255] |
| `dig_` | Go underground (see below) | See detailed behavior |
| `b_up` | Reverse dig (defined but unused) | Dig frames played in reverse, `over` |
| `dead` | Decompose / die (see below) | See detailed behavior |

#### Subroutine `dig_` — Go Underground

Plays the digging animation and then hides the meerkat in a temporary hole agent:

1. Sets plane to 10 so the dig visual is drawn in front of the background.
2. Plays the dig animation (bases 114/129 depending on direction, 15 frames), saving the last frame index into `va00` (128 for left, 143 for right).
3. Waits for the animation to complete (`over`).
4. Reads own position into `va01`/`va02`.
5. **Creates a Meerkat Hole** (1 1 8 `"meerk"` 1 va00 11) at the meerkat's position — using the final dig-frame pose, so the hole visually matches the direction the meerkat was facing.
6. Stores the hole reference in `ov17`, sets `ov00 = 5` (Underground).
7. Hides the meerkat itself: `attr 0` (no physics, no collision), `pose 144` (blank/hide pose), `mvto 0 0` (moves off-screen).
8. Sets a long timer (`tick rand 100..300`) before the emerge branch fires.

#### Subroutine `dead` — Decomposition

Runs while `ov00 = 9`. Each call:

1. If the meerkat is still in a valid room (`room targ ne -1`), it alters the room's CA concentrations:
   - **Room CA 4 += 0.4** — a strong increase in one room smell channel (food/meat smell).
   - **Room CA 3 += 0.2** — a smaller increase in another smell channel (generic decay/food smell).
2. If the current pose is less than 11, increments the pose by 1 (advancing the death/decomposition visual).
3. Otherwise, the corpse has fully decomposed and the meerkat kills itself (`kill ownr`).

This makes a dying meerkat a persistent short-term source of two smells that other agents and creatures can react to.

---

## Meerkat Hole (1 1 8)

A temporary static agent created by a meerkat's `dig_` subroutine to represent the hole the meerkat is hiding in. It has no scripts of its own — it simply acts as a visual marker and as a navigation/teleport anchor that the meerkat references via `ov17`.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `meerk` | 1 image; first image is the final dig frame (128 for left, 143 for right) |
| Plane | 11 | Slightly in front of the world background |
| Position | Meerkat's position at dig time | Set via `mvto` right after creation |

### Behavior

No events or scripts are defined for the hole. It persists until the meerkat emerges: the meerkat's timer script teleports itself back onto the hole, plays the stand-up animation, and then explicitly kills the hole (`kill ov17`). If the hole is destroyed externally while a meerkat is still underground (ov17 becomes null on the emerge branch), that meerkat immediately kills itself — a hole is therefore mandatory for safe emergence.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the meerkat ecosystem:

1. `enum 2 15 23 → kill targ` — kills all meerkats.
2. `enum 1 1 8 → kill targ` — kills any lingering meerkat holes.
3. `scrx 2 15 23 9` — removes the meerkat Timer script.

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 13 9 | Prey hunting (`etch` + `kill`) | Meerkats eat these small agents when hungry, restoring hunger |
| Room CA 3 | `altr room targ 3 0.2` | Dying meerkats raise this CA smell while decomposing |
| Room CA 4 | `altr room targ 4 0.4` | Dying meerkats raise this CA smell more strongly while decomposing |
