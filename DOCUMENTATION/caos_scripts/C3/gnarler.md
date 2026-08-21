# gnarler.cos - Gnarler Ecosystem

**Source**: `Assets/Bootstrap/001 World/gnarler.cos`

## Overview

This script implements the Gnarler ecosystem for the Creatures 3 world. The Gnarler (known by its ancient Albian name "Hungarius Oscari") is a unique lifeform that feeds on inorganic matter — specifically rocks and minerals (classifier 2 21 4). Gnarlers roam the ship, seeking out rocks to eat, resting when food is scarce or light is low, and reproducing by laying eggs when population and food conditions are favorable.

A population controller agent (1 1 9) monitors rock and gnarler counts and spawns new gnarler eggs near rocks when the ecosystem can support more individuals. Adults produce grazing droppings (2 10 6) that decompose and release nutrients and heat into the room's CA system. Gnarlers are influenced by room wind CA (property 5), which can redirect their movement, and suffer accelerated hunger in desert rooms (room types 8 and 9).

The gnarler lifecycle includes baby and adult stages. Babies age through a tick counter and eventually reproduce by splitting — the parent dies and a new adult spawns at its location. Adults can reproduce sexually by laying eggs near rocks when the rock-to-gnarler ratio is favorable. Gnarlers also serve as prey for Uglees (2 16 8), which hunt flying gnarler eggs as part of the ship's pest control ecosystem.

At bootstrap, one population controller is placed at (4924, 400) and one adult gnarler is created at (5211, 402) facing a random direction.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 9 | Population Controller | `blnk` frame 1 | Invisible timer that monitors rock/gnarler populations and spawns eggs | [Detail](#population-controller-1-1-9) |
| 2 15 22 | Gnarler (Adult) | `gnarl` frame 0 | Rock-eating critter that roams, eats, rests, and reproduces | [Detail](#gnarler-adult-2-15-22) |
| 2 18 18 | Gnarler Egg | `gnarl` frame 176/186 | Egg that hatches into a baby gnarler after a timed delay | [Detail](#gnarler-egg-2-18-18) |
| 2 10 6 | Grazing Dropping | `graz` frame 216/218 | Food droppings that decompose and release CA nutrients/heat | [Detail](#grazing-dropping-2-10-6) |

---

## Population Controller (1 1 9)

An invisible agent that periodically checks the rock (2 21 4) and gnarler (2 15 22) populations in its vicinity and spawns new gnarler eggs when conditions allow. It acts as the ecosystem's reproduction regulator, ensuring gnarlers don't overpopulate but can grow when food is abundant.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `blnk` | 1 image, invisible |
| `attr` | 16 | Invisible/non-interactive |
| Position | (4924, 400) | Near the gnarler's initial area |
| `rnge` | 1000 | Large sensing range for population checks |
| `tick` | 100 | Timer interval (initial), then 3000 after first fire |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Population check and egg spawning |

### Timer Behavior (Event 9)

The controller sets its tick to 3000 (slow cycle) and performs two population counts:

1. **Gnarler count** (`esee 2 15 22`): If 5 or more gnarlers are visible, the controller stops — no new spawning needed.
2. **Rock count** (`esee 2 21 4`): Based on the number of visible rocks:
   - 30+ rocks: Spawn 3 gnarler eggs
   - 20-29 rocks: Spawn 2 gnarler eggs
   - 10-19 rocks: Spawn 1 gnarler egg
   - < 10 rocks: No spawning

The `make` subroutine iterates over visible rocks looking for one with `ov00 == 1` (a rock that is ready/available). When found, it creates a gnarler egg (2 18 18) at the rock's position with a random facing direction and a long hatching timer (600-1800 ticks).

---

## Gnarler Adult (2 15 22)

The main critter agent. Gnarlers walk around seeking rocks to eat, rest when food is low or light is dim, produce grazing droppings, and reproduce when mature. They have two life stages: baby (`ov05 = 0`) and adult (`ov05 = 2`).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `gnarl` | 88 images, first image 0 |
| Plane | 4100 | Render depth |
| `attr` | 198 | Physics + Carryable + Mouseclickable + Suffers Collisions |
| `clac` | 0 | No click action |
| `fric` | 10 | Friction |
| `elas` | 30 | Elasticity |
| `perm` | 80 | Permeability |
| `accg` | 2 | Gravity |
| `tick` | 8 | Fast timer interval for walking |
| Position | (5211, 402) | Initial spawn location |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Behavior state | 0=Walking, 1=Eating, 2=Resting, 3=Reproducing, 9=Dead |
| `ov01` | Age counter (baby only) | Increments each tick; ages at 100 |
| `ov02` | Hunger/life counter | Starts 100-600; decrements each tick; death at 0 |
| `ov05` | Life stage | 0=Baby, 2=Adult |
| `ov10` | Facing direction | -1=Left, 1=Right (negative=left, positive=right) |
| `ov61` | CA smell emission | 75 |
| `ov90` | Death lock flag | 0=alive (used to prevent re-triggering death) |

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | Reverses horizontal direction |
| Bump/Wall | 6 | Reverses direction on wall collision |
| Timer | 9 | Main behavior state machine |

### Push (Event 1)

Simply reverses the gnarler's facing direction (`negv ov10`).

### Bump/Wall (Event 6)

When the gnarler collides with a left or right wall, it reverses direction (`negv ov10`).

### Timer Behavior (Event 9) — Main State Machine

The timer event drives the gnarler's entire behavioral loop. Each tick the gnarler processes the following logic in order:

**1. Death Check (ov00 == 9)**
Calls the `dead` subroutine: raises plane to 100, releases nutrients (+0.1 to CA property 4) and heat (+0.1 to CA property 3) into the room. Cycles through decomposition poses (incrementing pose each tick) until pose exceeds 11, then kills itself.

**2. Desert Room Penalty**
If the gnarler is in a desert room (room type 8 or 9), hunger depletes 100x faster (`subv ov02 100`).

**3. Resting State (ov00 == 2)**
- If adult (`ov05 == 2`): Performs a population/food assessment:
  - Counts nearby rocks (2 21 4) and gnarlers+eggs (2 15 22 + 2 18 18)
  - If rocks >= 20 and gnarlers+eggs < 10: transitions to Reproducing (ov00=3)
  - If hunger counter (`ov02`) <= 5: transitions to Reproducing (ov00=3)
  - Otherwise: returns to Walking (ov00=0)
- If baby (`ov05 != 2`): Returns to Walking immediately.

**4. Baby Aging (ov05 == 0)**
Increments `ov01` each tick. When `ov01` reaches 100, calls the `age_` subroutine:
- Plays a standing/sitting animation sequence
- Jumps upward (`vely -20`)
- Spawns a new adult gnarler (2 15 22) at its position with `ov05 = 2` (adult) and a short hunger counter (10-20)
- If the new position is invalid (`tmvt` fails), aborts spawning and reduces age counter
- Original baby kills itself after successful reproduction

**5. Reproducing State (ov00 == 3)**
Creates a gnarler egg (2 18 18) at the adult's position with a long hatching timer (1800-5400 ticks). The egg inherits the parent's facing direction. Returns to Walking state.

**6. Hunger Depletion**
`ov02` decrements by 1 each tick. When it reaches 0 (and `ov90 == 0`):
- Plays a death animation (base 64 for left-facing, base 76 for right-facing, frames 0-8)
- Sets `attr` to 192 (non-interactive)
- Transitions to Dead state (ov00=9) with a slow tick (600)

**7. Low Hunger Warning**
When `ov02` falls to a random threshold (50-150), transitions to Eating state (ov00=1).

**8. Grazing Dropping Production**
When `ov02 >= 150` (well-fed), not being carried, and a 1-in-6 random chance:
- Checks for a Grendel nest (1 1 11): if present, creates a "contaminated" dropping (`graz` frame 218); otherwise creates a normal dropping (`graz` frame 216)
- Dropping is placed at the gnarler's position, slightly above

**9. Wind Influence**
If in a valid room, checks wind CA (property 5). If wind blows in the opposite direction to the gnarler's facing, the gnarler reverses direction to follow the wind.

**10. Walking Animation**
Left-facing: frames 0-7 (looping). Right-facing: frames 8-15 (looping). Velocity set to -8 (left) or +8 (right).

**11. Idle/Rest Transition (ov00 == 0)**
If room light (CA property 1) is very low (< 0.2) or a 1-in-20 random chance: plays resting animation (frames 16-19 left, 20-23 right), stops velocity, sets a long tick (600-1800), and transitions to Resting (ov00=2).

### Eating Behavior (ov00 == 1)

The gnarler searches for rocks (2 21 4) in the direction it's facing:
- Uses `etch 2 21 4` to enumerate nearby rocks
- Left-facing: targets rocks to its left. Right-facing: targets rocks to its right
- Sets animation frame rate to 6 (faster) while approaching

When a rock is found in the correct direction:
- Plays a random eating sound (1-in-7 chance): "gna1", "gna2", or "gna3"
- **Left-facing eat**: Bite animation (24-30), launches rock upward-left (`velo -10 -45`), chew animation (31-35), swallow animation (48-55)
- **Right-facing eat**: Bite animation (36-42), launches rock upward-right (`velo 10 -45`), chew animation (43-47), swallow animation (56-63)
- Adds 20 to hunger counter after eating
- Returns to Walking state (ov00=0)

### Room CA Impact

| Trigger | CA Property | Change | Description |
|---|---|---|---|
| Death decomposition | 3 (Heat) | +0.1 per tick | Dying gnarler releases heat |
| Death decomposition | 4 (Nutrients) | +0.1 per tick | Dying gnarler releases nutrients |

---

## Gnarler Egg (2 18 18)

A small egg that hatches into a baby gnarler after a timed delay. Eggs can be picked up and carried; while carried, hatching is delayed. The egg sprite varies based on the parent's facing direction (frame 176 for one direction, 186 for the other).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `gnarl` | 10 images, first image 176 or 186 |
| Plane | 1000 (from controller) or 4000 (from adult) | Render depth |
| `attr` | 195 | Carryable + Activatable + Mouseclickable + Physics |
| `bhvr` | 32 | Pickup allowed |
| `accg` | 5 | Gravity |
| `aero` | 20 | High air resistance |
| `elas` | 0 | No bounce |
| `tick` | 600-1800 (controller) or 1800-5400 (adult) | Hatching timer |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov10` | Parent's facing direction | 0=left-origin, 1=right-origin |
| `ov61` | CA smell emission | 20 |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Hatching sequence |

### Timer Behavior (Event 9)

1. If being carried (`carr ne null`): delays hatching by 300 ticks and stops
2. If already hatched (`pose == 9`): kills self (cleanup)
3. Plays hatching animation (frames 0-8) then becomes invisible (`attr 0`)
4. Determines baby direction from `ov10`: 0 maps to -1 (left), 1 maps to +1 (right)
5. Creates a new baby gnarler (2 15 22) at its position with:
   - `ov05 = 0` (baby stage)
   - `ov02` = 20-50 (short hunger counter)
   - `ov61` = 75 (smell emission)
   - Starting sprite image 88 (baby appearance)
   - Uses `tmvt`/`mvsf` for safe positioning
6. Sets own pose to 9, waits 300 ticks, then kills self

---

## Grazing Dropping (2 10 6)

A small food item dropped by well-fed gnarlers. The dropping sits where it lands, decomposes over time, and releases heat and nutrients into the room's CA system. The sprite frame depends on whether a Grendel nest is present in the world (frame 216 = normal, frame 218 = contaminated/Grendel-influenced).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `graz` | 2 images, first image 216 or 218 |
| Plane | 1999 | Render depth |
| `attr` | 192 | Non-interactive, physics |
| `aero` | 5 | Air resistance |
| `accg` | 5 | Gravity |
| `elas` | 0 | No bounce |

### Events

| Event | Number | Description |
|---|---|---|
| Bump/Wall | 6 | Sets pose to 1 (landed appearance) |
| Timer | 9 | Decomposition |

### Bump (Event 6)

Sets the dropping's pose to 1, giving it a "landed" appearance. Tick set to 400 for decomposition timer.

### Timer (Event 9) — Decomposition

Releases nutrients and heat into the room's CA system, then removes itself:

| CA Property | Change | Description |
|---|---|---|
| 3 (Heat) | +0.1 | Slight heat release |
| 4 (Nutrients) | +0.3 | Significant nutrient release |

After altering the room CA, the dropping kills itself.

---

## Removal Script

The removal script (`rscr`) cleans up all gnarler ecosystem agents:
- Kills all adult gnarlers (2 15 22)
- Kills all gnarler eggs (2 18 18)
- Kills all population controllers (1 1 9)
- Removes event scripts: 2 15 22 events 9 and 6, 2 18 18 event 9
