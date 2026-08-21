# Kingfisher

**Script file**: `Bootstrap/001 World/kingfisher.cos`
**Sprite file**: `king.c16` (50 frames for the kingfisher, 8 frames for feathers; 2 frames for blank perch `blnk`)

## Overview

The kingfisher is a complex flying predator that inhabits the aquatic region of the ship. It hunts fish (classifier 2 15 9), dives to catch them, returns to a branch perch to eat, and rests at its nest when energy is full. The script implements a full behavioural state machine with roaming, hunting, fishing, eating, sleeping, and death states. When a kingfisher dies, it produces decomposing feathers that release nutrients and heat into the room's CA system.

A spawner agent (2 17 3) ensures population continuity by creating a new kingfisher whenever none exist. The kingfisher can be eaten by creatures (providing stimulus 80 — "eaten critter"). The bird is aware of obstacles and walls, uses wind CA to influence its roaming direction, and transitions between water rooms (where it gains buoyancy) and air rooms (where gravity applies normally).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 5 | Branch Perch | `blnk` (2 frames) | An invisible perch the kingfisher sits on to eat caught fish | [Detail](#branch-perch-1-1-5) |
| 2 17 3 | Kingfisher Spawner | `king` (1 frame at index 59) | Population controller that spawns a new kingfisher when none exist | [Detail](#kingfisher-spawner-2-17-3) |
| 2 15 10 | Kingfisher | `king` (50 frames) | The main kingfisher bird — a flying predator that hunts fish | [Detail](#kingfisher-2-15-10) |
| 2 10 8 | Kingfisher Feathers | `king` (8 frames at index 16) | Death remnant that decomposes and releases CA nutrients/heat | [Detail](#kingfisher-feathers-2-10-8) |

---

## Branch Perch (1 1 5)

An invisible static perch placed at position (3745, 805). The kingfisher uses this as a landing spot when it wants to eat a caught fish. It has no gravity, full permeability, zero attributes (not pickable, not clickable), and no timer — it simply exists as a spatial reference point.

| Property | Value |
|---|---|
| Gravity | 0 |
| Permeability | 100 |
| Attributes | 0 (non-interactive) |
| Position | (3745, 805) |
| ov72 | 2120 (unused x-reference) |
| ov73 | 550 (unused y-reference) |

Only one perch is created (checked with `totl 1 1 5 lt 1`).

### Events

This agent has no scripted events.

---

## Kingfisher Spawner (2 17 3)

A population controller placed in the aquatic area at approximately (3400, 900). It checks on a timer (tick 400) whether any kingfishers (2 15 10) exist. If not, it creates a new one with full initialization, passing itself as the kingfisher's nest reference (`seta ov19 ownr`).

| Property | Value |
|---|---|
| Gravity | 0 |
| Permeability | 49 |
| Tick rate | 400 |
| Position | ~(3400, 900) |
| ov61 | 12 |
| ov02 | 200 |

Only one spawner is created (checked with `totl 2 17 3 lt 1`).

### Events

| Event | Script | Description |
|---|---|---|
| Timer (9) | `scrp 2 17 3 9` | Population check — spawns a new kingfisher if none exist |

#### Timer (Event 9)

Checks `totl 2 15 10 <= 0`. If no kingfishers exist, creates a new kingfisher (2 15 10) with full initialization:
- Sets all animation base frames (ov30–ov37)
- Sets energy to 402 (ov02), max energy to 1200 (ov74), hunger threshold to 600 (ov73)
- Sets energy gain from eating to 800 (ov72)
- Passes itself as the nest reference (`seta ov19 ownr`)
- Places the new kingfisher at a random position around (3400, 900)

---

## Kingfisher (2 15 10)

The main kingfisher agent — a flying bird with a complex state machine governing its behaviour. It uses the `king.c16` sprite with 50 frames and is affected by gravity (accg 3), aerodynamics (aero 10), and permeability (49). It has attributes 195 (carriable, activatable, physics-enabled).

### State Machine

The kingfisher's behaviour is driven by `ov00` (current state):

| State | Name | Description |
|---|---|---|
| 0 | Roaming | Random flight influenced by obstacles and wind CA |
| 1 | Go to Branch | Fly towards the branch perch (ov17); roam if not visible |
| 2 | Go to Fish | Search for nearest fish (2 15 9) to hunt |
| 3 | Fishing | Actively diving at targeted fish |
| 4 | Go to Bed | Fly towards the nest/spawner (ov19) to rest |
| 5 | Eating Fish | Consuming a caught fish at the perch |
| 98 | Sleeping | Resting at nest, reduced tick rate (20) |
| 99 | Dying | Death sequence — spawns feathers and kills self |

### Key Variables

| Variable | Purpose |
|---|---|
| ov00 | Current state |
| ov01 | Age counter (increments each tick) |
| ov02 | Energy (starts 402, decreases each tick, death at < 0) |
| ov05 | Behaviour type (1 = energy-conservative, 2 = standard) |
| ov06 | Random flag (0 or 1) |
| ov10 | Horizontal direction (-1 = left, 1 = right) |
| ov11 | Vertical direction (-1 = up, 0 = none, 1 = down) |
| ov16 | Current target agent (fish or branch) |
| ov17 | Branch perch reference (1 1 5) |
| ov18 | Held fish reference |
| ov19 | Nest/spawner reference (2 17 3) |
| ov30–ov37 | Animation base frames for different directions/actions |
| ov61 | Tick counter threshold |
| ov72 | Energy gained from eating (600) |
| ov73 | Hunger threshold — seek food below this (600) |
| ov74 | Maximum energy (1200) |
| ov75 | Has-fish flag (0 = no, 1 = yes) |

### Animation Bases

| Variable | Value | Animation |
|---|---|---|
| ov30 | 2 | Flying left |
| ov31 | 10 | Flying right |
| ov32 | 18 | Diving left |
| ov33 | 22 | Diving right |
| ov34 | 26 | Rising left |
| ov35 | 31 | Rising right |
| ov36 | 36 | Eating left |
| ov37 | 38 | Eating right |

### Events

| Event | Script | Description |
|---|---|---|
| Timer (9) | `scrp 2 15 10 9` | Main behaviour loop — state machine tick |
| Eat (12) | `scrp 2 15 10 12` | Creature eats the kingfisher |
| Drop (5) | `scrp 2 15 10 5` | Dropped by a creature — resets to roaming |

#### Timer (Event 9) — Main Behaviour Loop

The timer fires every 6 ticks and executes the full state machine:

1. **Energy decay**: Energy (ov02) decreases by 1 each tick. Age (ov01) increases. If energy drops below 0, state becomes 99 (dying).

2. **Branch discovery**: If no branch is known (ov17 = null), searches for one using `rtar 1 1 5`.

3. **Obstacle avoidance**: Checks distances to obstacles in all four directions. Reverses horizontal direction if walls are close (< 30 pixels). Adjusts vertical direction near floors/ceilings.

4. **Light-based sleep/wake**: If room light (CA property 1) drops to ≤ 0.1 and the bird knows a nest, it transitions to state 4 (go to bed). If light returns above 0.1 and the bird is sleeping (state 98), it wakes up.

5. **Hunger check**: If energy drops below the hunger threshold (ov73) while roaming, transitions to state 1 (go to branch) or state 4 (go to bed) depending on behaviour type.

6. **Water buoyancy**: In water rooms (type 8), gravity becomes -1 (floats up). In air rooms, gravity is 3.

7. **State handlers**:
   - **State 0 (Roam)**: Random movement with obstacle avoidance. Uses wind CA (property 5) to influence horizontal direction — moves towards lower-wind areas.
   - **State 1 (Go to Branch)**: If the branch is visible, hunts towards it. On contact, stops movement, disables gravity, and perches. If holding a fish, calls the eating subroutine (gobl). Otherwise roams.
   - **State 2 (Go to Fish)**: Uses the `find` subroutine to locate the nearest fish (2 15 9). Checks fish density with `ner2` — only approaches if more than 4 fish are nearby. Sets velocity to match and overtake the fish.
   - **State 3 (Fishing)**: Actively chasing a targeted fish. On contact, sends message 4 to the fish (hit/kill), sets has-fish flag, and transitions to state 1. If the bird starts rising (negative velocity), returns to state 1.
   - **State 4 (Go to Bed)**: Hunts towards the nest. On contact, stops movement, disables gravity, and rests (pose 40). If behaviour type 1, slowly regenerates energy (+2 per tick). Transitions to state 98 (sleeping).
   - **State 5 (Eating Fish)**: If has-fish flag is set, plays eating animation, kills the held fish, adds energy (ov72), and transitions based on energy level — roam if full, hunt if still hungry.
   - **State 98 (Sleeping)**: Reduces tick rate to 20. Wakes when light returns.
   - **State 99 (Dying)**: Calls the `die_` subroutine.

#### Eat (Event 12)

When a creature eats the kingfisher:
- Sends **stimulus 80** (eaten critter) with intensity **4** to the eating creature.
- Kills the kingfisher.

#### Drop (Event 5)

When dropped by a creature:
- Resets state to 0 (roaming) and re-enables gravity (accg 3).

### Subroutines

| Subroutine | Description |
|---|---|
| `die_` | Death sequence: creates feather remnant (2 10 8) at current position, kills self |
| `roam` | Random movement with obstacle avoidance and wind CA influence |
| `gbrh` | Go to branch — hunt branch, perch on contact, eat fish if holding one |
| `gfsh` | Go to fish — find nearest fish, approach if fish density > 4 |
| `fish` | Active fishing — chase fish, send hit message on contact |
| `gbed` | Go to bed — hunt nest, rest on contact, regenerate energy |
| `gobl` | Gobble fish — play eating animation, destroy held fish, gain energy |
| `slep` | Enter sleep — set state 98, reduce tick to 20 |
| `find` | Find nearest agent of specified classifier using distance calculation |
| `hunt` | Set direction towards target agent |
| `hun2` | Variant of hunt (no null check) |
| `ner2` | Check if more than 4 fish (2 15 9) are near the target; only hunt if school is large enough |
| `vect` | Generate random velocity values (6–20 horizontal, 15–20 vertical) |
| `anim` | Set flying animation based on horizontal direction |
| `ani2` | Set diving/rising animation based on velocity direction |
| `move` | Apply direction multipliers to velocity |

### Impact on Room CA

- The kingfisher reads **CA property 1 (Light)** to determine day/night for sleep behaviour.
- The kingfisher reads **CA property 5 (Wind)** during roaming to bias flight direction.
- No direct CA emission from the living kingfisher.

### Stimulus Impact

| Event | Stimulus | Intensity | Description |
|---|---|---|---|
| Eat (12) | 80 (eaten critter) | 4 | Nutritional reward for the eating creature |

---

## Kingfisher Feathers (2 10 8)

A death remnant created by the `die_` subroutine when a kingfisher dies. It uses the `king.c16` sprite starting at frame 16 with 8 frames. The feathers are affected by gravity (accg 2), have high permeability (99), zero elasticity, friction 50, and no aerodynamics. They play a decomposition animation over several ticks before dying.

| Property | Value |
|---|---|
| Gravity | 2 |
| Permeability | 99 |
| Elasticity | 0 |
| Friction | 50 |
| Aerodynamics | 0 |
| Tick rate | 4 |
| Attributes | 195 (carriable, activatable, physics-enabled) |
| ov10 | Inherited direction from the kingfisher |
| ov01 | Decomposition counter (starts 0) |
| ov61 | 30 |

### Events

| Event | Script | Description |
|---|---|---|
| Timer (9) | `scrp 2 10 8 9` | Decomposition animation and CA release |

#### Timer (Event 9)

Each tick increments the counter (ov01). After 10 ticks, if not being carried:
- Plays decomposition animation (frames 0–3 left or 4–7 right based on ov10 direction).
- If in a valid room and not carried: releases **+0.1 to CA property 3 (inorganic nutrients)** and **+0.2 to CA property 4 (organic nutrients)** into the room.
- After the animation completes (`over`), kills itself.

### Impact on Room CA

| CA Property | Change | Description |
|---|---|---|
| 3 (Inorganic Nutrients) | +0.1 | Released during decomposition |
| 4 (Organic Nutrients) | +0.2 | Released during decomposition |

---

## Removal Script

The `rscr` (remove script) section cleanly removes all kingfisher-related agents and their event scripts:

1. Kills all kingfishers (2 15 10) and removes timer script
2. Kills all spawners (2 17 3) and removes timer script
3. Kills all feather remnants (2 10 8) and removes timer script
4. Kills all branch perches (1 1 5) and removes any scripts

## Ecosystem Interactions

- **Prey**: Hunts fish (classifier 2 15 9) — sends message 4 (hit) to caught fish
- **Predator**: Can be eaten by creatures (stimulus 80, intensity 4)
- **Environment**: Responds to room light (CA 1) for day/night cycle and wind (CA 5) for flight direction
- **Nutrient cycling**: Death feathers release inorganic nutrients and organic nutrients back into the environment
- **Population control**: Spawner (2 17 3) ensures exactly one kingfisher exists at all times
- **Water interaction**: Gains buoyancy (negative gravity) in water rooms (type 8)
