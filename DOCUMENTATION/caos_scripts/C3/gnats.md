# Gnats

This script creates a population of gnats — small flying insects that swarm around the Norn terrarium. Gnats exhibit autonomous wandering behavior with wall avoidance, react to room oxygen levels by flying upward, and actively hunt nearby creatures. The system includes population management through invisible spawner agents and a sound controller that plays a buzzing loop whenever gnats are visible on screen. Gnats serve as critters in the ecosystem: they can be pushed, picked up, and eaten by creatures, providing a `STIM_HIT_CRITTER` (stimulus 88) feedback each time.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| 1 1 128 | [Gnat Population Controller](#gnat-population-controller-1-1-128) | Invisible agent that monitors gnat and mosquito populations and creates spawners when needed |
| 2 14 5 | [Gnat](#gnat-2-14-5) | The visible flying gnat with wandering, hunting, and reproduction behaviors |
| 1 1 16 | [Gnat Sound Controller](#gnat-sound-controller-1-1-16) | Invisible screen-centered agent that plays buzzing sound when gnats are visible |
| 2 18 19 | [Gnat Spawner](#gnat-spawner-2-18-19) | Invisible temporary agent that spawns a single gnat then self-destructs |
| 2 18 20 | [Mosquito Spawner](#mosquito-spawner-2-18-20) | Invisible temporary agent created to replenish mosquito population (mosquito scripts defined elsewhere) |

---

## Gnat Population Controller (1 1 128)

Invisible blank agent positioned at (2000, 1500) that serves as the top-level population manager for both gnats and mosquitoes. It ticks very slowly (every 3600 ticks) and checks whether the gnat or mosquito populations have been wiped out, creating the appropriate spawner agent to replenish them.

### Events

| Event | Script | Description |
|---|---|---|
| Timer | `scrp 1 1 128 9` | Population check and spawner creation |

### Timer Behavior

On each timer tick, the controller checks:
1. If total gnat count (`totl 2 14 5`) is zero, creates a **Gnat Spawner** (2 18 19) at its own position.
2. Otherwise, if total mosquito count (`totl 2 14 4`) is zero, creates a **Mosquito Spawner** (2 18 20) at its own position.

Both spawner types are created as invisible (`attr 16`) blank agents with a slow tick (3600), placed at the controller's location using safe movement (`tmvt`/`mvsf` fallback).

---

## Gnat (2 14 5)

The main visible gnat agent, using the `"gnat"` sprite with 20 frames. Ten gnats are created initially at position (1866, 1658). Each gnat has a random initial direction and autonomous flight behavior driven by a fast timer (tick 5).

**Attributes**: 66 (carryable + suffers physics)
**Behaviors**: 49 (activatable + hittable + eatable)
**Nutriment value** (ov61): 40

### Agent Variables

| Variable | Purpose |
|---|---|
| ov00 | Hunting state: 0 = wandering, 1 = hunting a creature |
| ov01 | Life counter (incremented each tick, triggers reproduction at 100) |
| ov10 | Horizontal direction (-1 or 1) |
| ov11 | Vertical direction (-1 or 1) |
| ov12 | Current horizontal velocity |
| ov13 | Current vertical velocity |
| ov14 | Target horizontal speed |
| ov15 | Target vertical speed |
| ov61 | Nutriment/food value (40) |
| ov70, ov71 | Target creature position (when hunting) |
| ov90 | Direction change countdown |
| ov91 | Hunt check cooldown |

### Events

| Event | Script | Description |
|---|---|---|
| Timer | `scrp 2 14 5 9` | Core AI: wandering, hunting, wall avoidance, reproduction |
| Activate 1 (Push) | `scrp 2 14 5 1` | Gnat flies upward, creature receives stimulus |
| Activate 2 (Pickup) | `scrp 2 14 5 4` | Creature receives stimulus, gnat sends pickup message to self |
| Eat | `scrp 2 14 5 12` | Creature receives stimulus, gnat is killed |

### Timer Behavior (scrp 2 14 5 9)

The timer script is the main AI loop, executing every 5 ticks:

**Oxygen reaction**: If Room CA property 5 (Oxygen) in the gnat's current room is greater than 0.2, the gnat flies upward (`vely -10`) and stops further processing.

**Reproduction**: When the life counter (ov01) reaches 100 and the total gnat population is below 20, the gnat checks its local area (range 700). If 3 or fewer gnats are nearby and fewer than 3 gnat spawners exist, it creates a **Gnat Spawner** (2 18 19) at its position.

**Wandering mode** (ov00 = 0): The gnat moves with a target speed of 5 in both axes. A countdown timer (ov90) periodically randomizes the horizontal and vertical direction. The `wall` subroutine reverses direction when obstacles are detected within 50-100 pixels. The `velo` subroutine gradually adjusts actual velocity toward target speed. Periodically checks for nearby creatures via the `hunt` subroutine.

**Hunting mode** (ov00 = 1): The gnat actively steers toward a detected creature's position (ov70, ov71), reversing direction components to close distance. Uses a faster target speed of 4 in both axes. Continues wall avoidance while hunting. Reverts to wandering if no creature is found in the `hunt` subroutine scan.

**Subroutines**:
- `hunt`: Scans for creatures (family 4) within range 200. If found, records target position and switches to hunting mode. If none found, reverts to wandering.
- `velo`: Gradually adjusts current velocity (ov12, ov13) toward target speed (ov14, ov15) in increments of 2, then applies to agent velocity.
- `wall`: Checks obstacle distances in all four directions. Reverses the corresponding direction component when an obstacle is closer than 50-100 pixels.

### Stimulus Impact

| Event | Stimulus | Target | Description |
|---|---|---|---|
| Push (script 1) | 88 (`STIM_HIT_CRITTER`) | Interacting creature | Sent when a creature pushes the gnat |
| Pickup (script 4) | 88 (`STIM_HIT_CRITTER`) | Interacting creature | Sent when a creature picks up the gnat |
| Eat (script 12) | 88 (`STIM_HIT_CRITTER`) | Interacting creature | Sent when a creature eats the gnat |

---

## Gnat Sound Controller (1 1 16)

An invisible blank agent centered on the screen at a high plane (9000) that manages ambient gnat buzzing sounds. It ticks every 10 ticks and checks whether any gnats are currently visible on screen.

**Attributes**: 48 (invisible to creatures + suffers physics)

### Events

| Event | Script | Description |
|---|---|---|
| Timer | `scrp 1 1 16 9` | Checks gnat visibility and controls sound playback |

### Timer Behavior

Each tick, the controller iterates over all gnats (2 14 5) and checks their visibility (`visi 0`). Based on the result:
- If any gnat is visible and sound is not playing (ov00 = 0): starts the `"fly_"` sound loop (`sndl`) and sets ov00 to 1.
- If no gnats are visible and sound is playing (ov00 = 1): fades the sound out (`fade`) and sets ov00 to 0.

---

## Gnat Spawner (2 18 19)

An invisible temporary agent that serves as a delayed gnat egg. Created either by the Population Controller (1 1 128) or by gnats themselves during reproduction. It ticks once (every 3600 ticks) then spawns a new gnat and self-destructs.

**Attributes**: 16 (invisible to creatures)

### Events

| Event | Script | Description |
|---|---|---|
| Timer | `scrp 2 18 19 9` | Spawns a gnat if local population permits, then self-destructs |

### Timer Behavior

On its single timer tick, the spawner:
1. Records its own position.
2. Scans nearby gnats (range 700) and counts them.
3. If fewer than 20 gnats are nearby, creates a new **Gnat** (2 14 5) with full initialization (attributes, behaviors, animation, random direction, nutriment value).
4. Uses safe movement check (`tmvt`) — if the position is invalid, the new gnat is killed immediately.
5. Kills itself regardless of whether a gnat was spawned.

---

## Mosquito Spawner (2 18 20)

An invisible temporary agent created by the Population Controller to replenish the mosquito population. Its behavior mirrors the Gnat Spawner but for mosquitoes (2 14 4). The actual mosquito agent scripts are defined in a separate COS file.

**Attributes**: 16 (invisible to creatures)
**Tick**: 3600

---

## Removal Script

The `rscr` section cleanly removes all gnats and sound controllers:
- Kills all gnats (`enum 2 14 5`)
- Kills all gnat sound controllers (`enum 1 1 16`)
- Removes scripts: `scrx 1 1 16 9`, `scrx 2 14 5 9`, `scrx 2 14 5 1`, `scrx 2 14 5 4`, `scrx 2 14 5 12`
