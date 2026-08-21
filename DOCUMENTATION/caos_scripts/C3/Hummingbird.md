# Hummingbird.cos - Hummingbird Ecosystem

**Source**: `Assets/Bootstrap/001 World/Hummingbird.cos`

## Overview

This script implements a complete hummingbird ecosystem for the Creatures 3 world, including adult birds, nests, eggs, chicks, droppings, and dead bodies. It is one of the most complex critter scripts in the game, featuring a full lifecycle with birth, growth, maturation, mating, reproduction, feeding, sleeping, and death.

At bootstrap, 10 nests (2 17 2) are created and placed at fixed positions around the world using a slot-claiming system. Six adult hummingbirds (2 15 3) are spawned with alternating genders (3 male, 3 female). Adults start as mature birds (age counter = 3000) with 20,000 energy points.

The hummingbirds have a rich behavioral repertoire driven by a multi-state AI. They roam the world, search for food (classifier 2 7 0), find mates of the opposite gender, claim nests, deposit resources into nests, lay eggs, sleep when light levels drop, and eventually die when their energy runs out. Juveniles (age < 3000) can steal energy from their own nest when food is scarce. Dead hummingbirds decompose and emit nutrients into the surrounding room.

Reproduction follows a multi-step chain: mating sets a flag on the nest, which triggers egg laying. Eggs hatch into chicks, and chicks mature into new adult hummingbirds. A population cap (max 4 visible adults) prevents eggs from hatching when too many birds exist.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 17 2 | Hummingbird Nest | `hummingbird` frame 34 | Static nest that stores resources, lays eggs, and anchors bird behavior | [Detail](#hummingbird-nest-2-17-2) |
| 2 15 3 | Adult Hummingbird | `hummingbird` frame 0 | Main flying bird with complex AI: roaming, feeding, mating, nesting, sleeping | [Detail](#adult-hummingbird-2-15-3) |
| 2 10 34 | Dead Hummingbird | `hummingbird` frame 10/48 | Decomposing corpse that emits nutrients into the room | [Detail](#dead-hummingbird-2-10-34) |
| 2 10 5 | Hummingbird Droppings | `hummingbird` frame 78 | Waste dropped periodically by flying birds | [Detail](#hummingbird-droppings-2-10-5) |
| 2 18 3 | Hummingbird Egg | `hummingbird` frame 72 | Egg laid in nest; hatches into a chick after growth period | [Detail](#hummingbird-egg-2-18-3) |
| 2 15 7 | Hummingbird Chick | `hummingbird` frame 72 | Young bird hatched from egg; matures into an adult hummingbird | [Detail](#hummingbird-chick-2-15-7) |
| 2 10 4 | Eggshell Fragment | `hummingbird` frame 73 | Debris from hatched eggs; self-destructs on timer | [Detail](#eggshell-fragment-2-10-4) |

---

## Hummingbird Nest (2 17 2)

Static nests that serve as home bases for the hummingbird ecosystem. Each nest claims a unique slot position from 10 predefined world locations. Nests store resources deposited by their resident bird, visually change pose based on resource level, and lay eggs when the mating flag is set.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `hummingbird` | 4 images, first image 34 |
| Plane | 50 | Background layer |
| `attr` | 0 | No interactions |
| `tick` | Staggered (1, 12, 23...) | Each nest has an offset tick to distribute processing |
| Position | (3020, 400) initially | Moves to claimed slot position via `put_` subroutine |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | State | General state tracker |
| `ov01` | Decay counter | Increments when resources are empty; nest becomes abandoned at 20 |
| `ov02` | Stored resources | Amount of food/energy stored by birds |
| `ov61` | CA smell range | 15 |
| `ov70` | Mating flag | 0=No, 1=Ready to lay egg (set by mating bird) |
| `ov71` | Bird present flag | 0=Available, 1=Claimed by a bird |
| `ov72` | Sprite X offset | 2120 (used for nest position calculation) |
| `ov73` | Sprite Y offset | 550 (used for nest position calculation) |
| `ov80` | Nest slot ID | 1-10, determines world position; 0=unplaced |
| `ov98` | Resource deposit tracker | Tracks deposits from birds |

### Nest Slot Positions

| Slot | World Position (X, Y) |
|---|---|
| 1 | (1194, 376) |
| 2 | (956, 341) |
| 3 | (3460, 597) |
| 4 | (3080, 120) |
| 5 | (3480, 703) |
| 6 | (2093, 414) |
| 7 | (1896, 241) |
| 8 | (2342, 142) |
| 9 | (1812, 299) |
| 10 | (1082, 345) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Resource management, visual state, egg laying |
| 256 | User 1 | Add resources (`_p1_` added to `ov02`) |
| 257 | User 2 | Set bird-present flag (`ov71 = _p1_`) |
| 258 | User 3 | Subtract resources (`_p1_` subtracted from `ov02`) |
| 260 | User 5 | Set mating flag (`ov70 = _p1_`) |

#### Event 9 -- Timer

1. **Slot Placement (`put_`)**: If `ov80` is 0, the nest scans all existing nests to find an unclaimed slot number (1-10) and moves to that slot's predefined position.
2. **Resource Decay**: If resources (`ov02`) are empty, the decay counter (`ov01`) increments. When `ov01` exceeds 20, the nest becomes abandoned (`ov71` set to 0).
3. **Visual State**: Pose changes based on resource level -- pose 0 (empty), pose 1 (>60 resources), pose 2 (>120), pose 3 (>180, full).
4. **Egg Laying**: When pose reaches 3 (full resources) and the mating flag (`ov70`) is set, the nest creates an egg (2 18 3) if 4 or fewer adult hummingbirds exist. The mating flag is then cleared.

---

## Adult Hummingbird (2 15 3)

The main agent of the ecosystem. A flying bird with a complex multi-state AI governing its behavior through roaming, feeding, mating, nesting, sleeping, and death. Hummingbirds have two life stages: juvenile (age < 3000 ticks) and adult (age >= 3000). Adults can find mates and reproduce. Gender is stored in `ov06` (0 or 1).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `hummingbird` | 10 images, first image 0 |
| Plane | 2200 | Foreground layer |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Collisions |
| `accg` | 0 | No gravity (flying) |
| `aero` | 30 | High air resistance |
| `elas` | 5 | Low bounce |
| `fric` | 80 | High friction |
| `tick` | 4 | Fast timer |
| `bhvr` | 16 | Hittable |
| Position | Random (1500-2000, 300) | Spread across the world |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Nest, 2=Get Food, 3=Mate, 4=Get Mating Material, 5=Go to Bed, 6=Steal from Nest, 98=Sleeping, 99=Dying |
| `ov01` | Age counter | Increments each tick; >= 3000 = mature adult |
| `ov02` | Energy/HP | Starts at 20000; decrements each tick; death at 0 |
| `ov06` | Gender | 0 or 1 (alternating at creation) |
| `ov10` | Horizontal direction | -1=Left, 1=Right |
| `ov11` | Vertical direction | -1=Up, 1=Down |
| `ov15` | Altitude urgency | 0-15 range; increased near walls, decreased near ceiling |
| `ov16` | Current target agent | Reference to food, nest, or mate being pursued |
| `ov17` | Mate reference | Another hummingbird of opposite gender |
| `ov19` | Nest reference | The nest (2 17 2) claimed by this bird |
| `ov20` | Maturity counter | Increments every 10 ticks after maturation; triggers mating at 50+ |
| `ov30`-`ov34` | Animation bases | 2=fly left, 6=fly right, 0=idle left, 1=idle right, 10=special |
| `ov61` | CA smell range | 60 |
| `ov70` | Mating success flag | 1=Has mated, triggers egg at nest |
| `ov72` | Food value per eat | 800 (energy gained when eating food) |
| `ov73` | Hunger threshold | 650 (seeks food when energy below this) |
| `ov74` | Satiation threshold | 1850 (stops eating above this) |
| `ov75` | Energy steal amount | 20 (drained from nest per steal action) |
| `ov98` | Nest resource deposit | Amount to deliver to nest on next visit |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main AI behavior loop |
| 5 | Pickup | Reset state, disable gravity |
| 6 | Collision | Update facing direction from velocity |
| 12 | Eat | Provide food stimulus to eater, die |
| 256 | User 1 | Add energy (`_p1_` added to `ov02`) |
| 257 | User 2 | Add nest resources (`_p1_` added to `ov98`) |
| 266 | User 11 | Empty handler (no-op) |

#### Event 9 -- Timer (Main AI Loop)

The timer runs every 4 ticks and drives all hummingbird behavior through a complex decision tree:

**Age and Energy Tracking:**
- Age (`ov01`) increments by 1 each tick.
- Energy (`ov02`) decrements by 1 each tick.
- After maturation (ov01 > 3000), the maturity counter (`ov20`) increments every 10 ticks.

**Obstacle Avoidance:**
- If left wall (`obst 0`) is close (< 100px): reverse to fly right, increase altitude urgency.
- If right wall (`obst 1`) is close (< 100px): reverse to fly left, increase altitude urgency.
- If ceiling (`obst 2`) is close (< 50px): push downward, decrease altitude urgency.

**Water Room Escape:**
- If in a water room (room type 8) and not dying: rapidly drain energy, push upward, and flee.

**Death Check:**
- When energy reaches 0: set state to 99 (dying).
- Dying mature birds (ov01 > 3000) trigger `die_` (creates adult dead body).
- Dying juvenile birds trigger `die2` (creates juvenile dead body).

**Sensing Range:**
- Mature birds (ov01 > 3000): sensing range = 800.
- Juvenile birds (ov01 < 3000): sensing range = 100.

**Sleep Decision:**
- If room light (CA 1) < 0.5 and bird has a nest: enter state 5 (go to bed).

**Wake Up (State 98):**
- If room light (CA 1) > 0.5: reset to state 0 (roam), restore gravity and tick rate.

**Dropping Waste:**
- 1-in-500 chance each tick to produce droppings (2 10 5) via `crap` subroutine.

**Hunger Decision:**
- When energy < hunger threshold (650): switch to state 2 (get food).
- Juveniles with fewer than 2 visible food sources switch to state 6 (steal from nest) instead.

**Mating Check (Mature Adults Only):**
- Check that mate and nest references are still valid (`chek`).
- If no mate found: search for one (`fmte`) -- finds a different-gender hummingbird.
- If no nest found: search for one (`fnst`) -- finds an unclaimed nest.
- If nest exists: share nest logic (`snst`).
- When maturity counter exceeds 50, and both mate and nest exist: enter state 3 (mate).

**Juvenile Maturation (ov01 = 3000):**
- Triggers `matr`: creates a new adult hummingbird (2 15 3) at current position, then the parent self-destructs. This effectively "rebirth" resets the bird as a fresh adult.

**State Behaviors:**

| State | Name | Behavior |
|---|---|---|
| 0 | Roam | Random flying with occasional direction changes (1-in-20 chance each tick) |
| 1 | Nest | Navigate to own nest, deposit resources via message 256, trigger egg if mated (message 260) |
| 2 | Get Food | Find nearest food (2 7 0), approach it, eat it (message 12); stop eating above satiation |
| 3 | Mate | Navigate toward mate; if male (ov06=1), set mating flag and transition to nesting |
| 4 | Get Mating Material | Find nest material (2 6 1), approach and collect; gain 100 nest resources |
| 5 | Go to Bed | Navigate to nest and sleep |
| 6 | Steal from Nest | Approach own nest, drain 20 resources (message 256 with -20), gain 200 energy |
| 98 | Sleeping | Resting on nest; reduced tick rate (250); pose changes to idle |
| 99 | Dying | Triggers death and dead body creation |

#### Event 12 -- Eat

When eaten by a creature, the hummingbird sends a food stimulus to the eater:
- **Stimulus**: `stim writ from 80 4` (stimulus type 80, intensity 4)
- The hummingbird is then killed.

#### Event 5 -- Pickup

Resets state to 0, disables gravity, sets fast tick rate (4).

#### Event 6 -- Collision

Updates facing direction (`ov10`) based on current velocity. Plays flying animation if not on the ground.

---

## Dead Hummingbird (2 10 34)

A decomposing hummingbird corpse created when a bird dies. Mature birds produce a body with base frame 10 (24 animation frames), while juvenile birds use base frame 48. The body decays over time, emitting nutrients into the room, and eventually disappears.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hummingbird` | 24 images, first image 10 (mature) or 48 (juvenile) |
| Plane | 49 | Ground level |
| `accg` | 4 | Falls to ground |
| `elas` | 1 | Minimal bounce |
| `fric` | 80 | High friction |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Collisions |
| `perm` | 99 | Can pass through almost all barriers |
| `tick` | 20 | Slow timer for decay |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov02` | Decay countdown | Starts at 30; decrements each tick |
| `ov10` | Facing direction | -1=Left, 1=Right (inherited from the bird) |
| `ov61` | CA smell range | 25-30 |
| `ov70` | Picked up flag | 0=Normal decay, 1=Has been picked up (changes animation) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decay animation and nutrient emission |
| 6 | Collision | Sets picked-up flag (`ov70 = 1`) |

#### Event 9 -- Timer

- While `ov02 > 0`: plays walking/twitching decay animation (8-frame cycle). If in a valid room and not carried, **emits Room CA nutrients** (CA 3 +0.2, CA 4 +0.2) each tick.
- If picked up (`ov70 = 1`): shows a single static pose instead of animation.
- When `ov02` reaches 0: plays final death animation (4 frames), waits 10 ticks, then self-destructs.

**Room CA Impact**: `altr room targ 3 0.2` and `altr room targ 4 0.2` -- enriches the room with organic and inorganic nutrients during decomposition.

---

## Hummingbird Droppings (2 10 5)

Waste particles dropped by flying hummingbirds approximately once every 500 ticks. The pose depends on whether a specific food source (2 1 10) exists: pose 0 if none exists, pose 2 otherwise.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hummingbird` | 4 images, first image 78 |
| Plane | 49 | Ground level |
| `accg` | 3 | Falls to ground |
| `elas` | 1 | Minimal bounce |
| `fric` | 80 | High friction |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Collisions |
| `perm` | 99 | Can pass through almost all barriers |
| `tick` | 10 | Self-destruct timer |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Dropping type | 0=Standard pose (2), nonzero=Alternative pose (0) |
| `ov61` | CA smell range | 10 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Self-destructs immediately |

---

## Hummingbird Egg (2 18 3)

An egg laid by a nest when the mating flag is set and resources are sufficient. The egg sits near the nest and grows over time. After 20+ ticks, it hatches into a chick (2 15 7). The egg also monitors the hummingbird population and can trigger nest replenishment if all nests are empty.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hummingbird` | 1 image, first image 72 |
| Plane | 49 | Ground level |
| `accg` | 0 | No gravity (sitting in nest) |
| `perm` | 99 | Can pass through barriers |
| `attr` | 199 | Full interactions + Physics + Collisions |
| `tick` | 30 | Growth timer |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Growth counter | Increments each tick; hatches when > 20 |
| `ov19` | Parent nest reference | The nest that laid this egg |
| `ov61` | CA smell range | 30 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth and hatching |
| 1 | Push | Enable gravity and fall |
| 6 | Collision | Drop eggshell, die |

#### Event 9 -- Timer

1. Growth counter (`ov01`) increments each tick.
2. When `ov01 > 20`: creates a chick (2 15 7) at the egg's position, inheriting the parent nest reference. The egg then self-destructs.
3. **Population monitoring**: After growth check, scans all nests (2 17 2). If no nests have resources, sends message 0 (activate) to trigger nest replenishment.

---

## Hummingbird Chick (2 15 7)

A young bird hatched from an egg. The chick sits in the nest and grows over time. After 20+ ticks of growth, it matures into a full adult hummingbird (2 15 3) with starting energy of 200. The chick inherits its parent nest reference and randomly assigns a gender.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hummingbird` | 6 images, first image 72 |
| Plane | 2200 | Foreground (same as adults) |
| `accg` | 0 | No gravity (in nest) |
| `perm` | 99 | Can pass through barriers |
| `attr` | 198 | Mouseclickable + Activatable + Suffers Physics + Collisions |
| `tick` | 30 | Growth timer |
| `bhvr` | 16 | Hittable |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Growth counter | Increments each tick; matures when > 20 |
| `ov19` | Parent nest reference | Inherited from egg |
| `ov61` | CA smell range | 55 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth, animation, maturation into adult |
| 1 | Push | Enable gravity and fall |
| 6 | Collision | Drop eggshell fragment, die |
| 12 | Eat | Provide food stimulus to eater, die |

#### Event 9 -- Timer

1. Plays pecking animation (frames 2-5) and sends message 258 (subtract 1 resource) to parent nest.
2. Growth counter (`ov01`) increments.
3. When `ov01 > 20`: creates a new adult hummingbird (2 15 3) at the chick's position with starting energy 200, random gender, and inherited nest reference. Standard adult properties are applied. The chick then self-destructs.

#### Event 12 -- Eat

Same as adult: sends `stim writ from 80 4` (food stimulus, intensity 4) to the eater, then self-destructs.

---

## Eggshell Fragment (2 10 4)

A small debris particle created when an egg or chick collides with something (falls from the nest). Purely cosmetic; self-destructs immediately on its timer tick.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hummingbird` | 1 image, first image 73 |
| Plane | 49 | Ground level |
| `accg` | 4 | Falls to ground |
| `elas` | 0 | No bounce |
| `perm` | 99 | Can pass through barriers |
| `attr` | 195 | Carryable + Suffers Physics + Collisions |
| `tick` | 30 | Self-destruct timer |
| `bhvr` | 16 | Hittable |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Self-destructs (`kill ownr`) |

---

## Lifecycle Summary

```
Nest (2 17 2) --[egg_ when mated + full]--> Egg (2 18 3)
    Egg --[growth > 20]--> Chick (2 15 7)
        Chick --[growth > 20]--> Adult Hummingbird (2 15 3)
            Adult --[age = 3000]--> New Adult (rebirth via matr)
            Adult --[energy = 0]--> Dead Hummingbird (2 10 34)
                Dead Body --[decay = 0]--> Removed (nutrients emitted)
```

## Room CA Impact

| Agent | CA Channel | Change | Condition |
|---|---|---|---|
| Dead Hummingbird (2 10 34) | CA 3 (Nutrients) | +0.2 per tick | While decaying and in valid room |
| Dead Hummingbird (2 10 34) | CA 4 (Water/Inorganic) | +0.2 per tick | While decaying and in valid room |

## Stimulus Effects

| Agent | Event | Stimulus | Intensity | Target |
|---|---|---|---|---|
| Adult Hummingbird (2 15 3) | 12 (Eat) | 80 | 4 | Creature that ate it |
| Hummingbird Chick (2 15 7) | 12 (Eat) | 80 | 4 | Creature that ate it |

## Remove Script (rscr)

The remove script cleans up the entire hummingbird ecosystem:
1. Kills all instances of each agent type (2 15 3, 2 15 7, 2 17 2, 2 10 34, 2 10 5, 2 18 3, 2 10 4)
2. Removes all associated event scripts using `scrx`
