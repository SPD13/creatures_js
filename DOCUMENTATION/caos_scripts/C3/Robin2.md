# Robin2.cos - Robin Ecosystem

**Source**: `Assets/Bootstrap/001 World/Robin2.cos`

## Overview

This script implements a complete robin bird ecosystem for the Creatures 3 world, including adult birds, nests, eggs, chicks, droppings, and dead bodies. It closely mirrors the structure of the hummingbird ecosystem but with ground-based behavior. Robins walk, hop, and fly between the ground and the air, unlike the purely airborne hummingbird.

At bootstrap, 7 nests (2 17 1) are created and distributed across predefined slot positions in the world. Four adult robins (2 15 1) are spawned with alternating genders (2 female, 2 male). Adults start as mature birds (age counter = 3000) with 800 energy points.

The robins have a rich behavioral repertoire driven by a multi-state AI. They roam the world, search for food (classifiers 2 14 0, 2 13 0, 2 8 0, 2 9 0, 2 3 0), find mates of the opposite gender, claim nests, deposit resources into nests, lay eggs, sleep when light levels drop below 0.25, and eventually die when their energy runs out. Juveniles (age < 3000) can steal energy from their own nest when food is scarce. Dead robins decompose over time.

Reproduction follows a multi-step chain: mating sets a flag on the male, who then visits the nest and deposits the mating signal. The nest lays an egg when resources are sufficient. Eggs hatch into chicks, which mature into new adult robins. A population cap (max 3 visible adults near the nest) prevents excessive breeding. The nest can lay either robin eggs or woodpigeon eggs depending on the egg type parameter.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 17 1 | Robin Nest | `robin` frame 80 | Static nest that stores resources, lays eggs, and anchors bird behavior | [Detail](#robin-nest-2-17-1) |
| 2 15 1 | Adult Robin | `robin` frame 0 | Main bird with complex AI: roaming, feeding, mating, nesting, sleeping | [Detail](#adult-robin-2-15-1) |
| 2 10 1 | Dead Robin | `robin` frame 54/138 | Decomposing corpse that decays over time | [Detail](#dead-robin-2-10-1) |
| 2 10 2 | Robin Droppings | `robin` frame 168 | Waste dropped periodically by birds | [Detail](#robin-droppings-2-10-2) |
| 2 18 1 | Robin Egg | `robin` frame 162 | Egg laid in nest; hatches into a chick after growth period | [Detail](#robin-egg-2-18-1) |
| 2 15 4 | Robin Chick | `robin` frame 162 | Young bird hatched from egg; matures into an adult robin | [Detail](#robin-chick-2-15-4) |
| 2 10 3 | Eggshell Fragment | `robin` frame 163 | Debris from hatched eggs; self-destructs on timer | [Detail](#eggshell-fragment-2-10-3) |

---

## Robin Nest (2 17 1)

Static nests that serve as home bases for the robin ecosystem. Each nest claims a unique slot position from 10 predefined world locations using a slot-claiming system. Nests store resources deposited by their resident bird, visually change pose based on resource level, and lay eggs when the mating flag is set and resources are full.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `robin` | 4 images, first image 80 |
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
| `ov72` | Sprite X offset | 2120 (used for slot position calculation on slots 1-7) |
| `ov73` | Sprite Y offset | 550 (used for slot position calculation on slots 1-7) |
| `ov80` | Nest slot ID | 1-10, determines world position; 0=unplaced |
| `ov88` | Egg type | 0=Robin egg, 1=Woodpigeon egg |
| `ov98` | Resource deposit tracker | Tracks deposits from birds |

### Nest Slot Positions

| Slot | World Position (X, Y) |
|---|---|
| 1 | (3295, 178) |
| 2 | (3250, 470) |
| 3 | (3020, 390) |
| 4 | (2603, 620) |
| 5 | (2320, 217) |
| 6 | (2042, 429) |
| 7 | (2678, 198) |
| 8 | (2250, 1471) |
| 9 | (790, 1450) |
| 10 | (1077, 1414) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Resource management, visual state, egg laying |
| 256 | User 1 | Add resources (`_p1_` added to `ov02`) |
| 257 | User 2 | Set bird-present flag (`ov71 = _p1_`) |
| 258 | User 3 | Subtract resources (`_p1_` subtracted from `ov02`) |
| 260 | User 5 | Set mating flag and egg type (`ov70 = _p1_`, `ov88 = _p2_`) |

#### Event 9 -- Timer

1. **Slot Placement (`put_`)**: If `ov80` is 0, the nest scans all existing nests to find an unclaimed slot number (1-10) and moves to that slot's predefined position. Slots 1-7 apply X/Y offsets (subtracting `ov72`/`ov73`), while slots 8-10 use direct coordinates.
2. **Resource Decay**: If resources (`ov02`) are empty, the decay counter (`ov01`) increments. When `ov01` exceeds 20, the nest becomes abandoned (`ov71` set to 0).
3. **Visual State**: Pose changes based on resource level -- pose 0 (empty), pose 1 (>60 resources), pose 2 (>120), pose 3 (>180, full).
4. **Egg Laying**: When pose reaches 3 (full resources) and the mating flag (`ov70`) is set, the nest creates an egg. If `ov88` is 0, a robin egg (2 18 1) is created; if `ov88` is 1, a woodpigeon egg (2 18 12) is created. A population check ensures 4 or fewer adult robins exist before laying. The egg is placed slightly above and to the side of the nest. The mating flag is then cleared.

---

## Adult Robin (2 15 1)

The main agent of the ecosystem. A bird with a complex multi-state AI governing its behavior through roaming, feeding, mating, nesting, sleeping, and death. Robins have two life stages: juvenile (age < 3000 ticks) and adult (age >= 3000). Adults can find mates and reproduce. Gender is stored in `ov06` (0=female, 1=male). Unlike hummingbirds, robins are affected by gravity and alternate between walking on the ground and flying.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `robin` | 79 images, first image 0 |
| Plane | 2200 | Foreground layer |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Collisions |
| `accg` | 1.5 | Light gravity (can fly) |
| `elas` | 5 | Low bounce |
| `fric` | 80 | High friction |
| `tick` | 4 | Fast timer |
| Position | Random (1500-2000, 300) | Spread across the world |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Nest, 2=Get Food, 3=Mate, 4=Go to Mate, 5=Go to Bed, 6=Steal from Nest, 98=Sleeping, 99=Dying |
| `ov01` | Age counter | Increments each tick; >= 3000 = mature adult |
| `ov02` | Energy/HP | Starts at 800; decrements each tick; death at 0 |
| `ov06` | Gender | 0=Female, 1=Male (alternating at creation) |
| `ov10` | Horizontal direction | -1=Left, 1=Right |
| `ov11` | Vertical direction | -1=Up, 0=Level |
| `ov15` | Altitude urgency | 0-15 range; increased near walls, decreased each tick |
| `ov16` | Current target agent | Reference to food, nest, or mate being pursued |
| `ov17` | Mate reference | Another robin of opposite gender |
| `ov19` | Nest reference | The nest (2 17 1) claimed by this bird |
| `ov20` | Maturity counter | Increments every 10 ticks after maturation; triggers mating at 50+ |
| `ov30`-`ov43` | Animation bases | Frame offsets for different animations (see table below) |
| `ov61` | CA smell range | 65 |
| `ov70` | Mating success flag | 1=Has mated, triggers egg at nest |
| `ov72` | Food value per eat | 800 (energy gained when eating food) |
| `ov73` | Hunger threshold | 650 (seeks food when energy below this) |
| `ov74` | Satiation threshold | 1850 (stops eating above this) |
| `ov75` | Nest food contribution | 20 (energy deposited into nest per visit) |
| `ov98` | Nest resource deposit | Amount to deliver to nest on next visit |

### Animation Bases

| Variable | Frame Offset | Animation |
|---|---|---|
| `ov30` | 0 | Walk/fly left |
| `ov31` | 6 | Walk/fly right |
| `ov32` | 12 | Peck left |
| `ov33` | 17 | Peck right |
| `ov34` | 22 | Sing left |
| `ov35` | 30 | Sing right |
| `ov36` | 38 | Land/glide left |
| `ov37` | 45 | Land/glide right |
| `ov38` | 52 | Sleep left pose |
| `ov39` | 53 | Sleep right pose |
| `ov40` | 54 | Additional animation 1 |
| `ov41` | 62 | Additional animation 2 |
| `ov42` | 70 | Additional animation 3 |
| `ov43` | 74 | Additional animation 4 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main AI behavior loop |
| 5 | Pickup | Reset state, restore gravity |
| 6 | Collision | Update facing direction from velocity |
| 256 | User 1 | Add energy (`_p1_` added to `ov02`) |
| 257 | User 2 | Add nest resources (`_p1_` added to `ov98`) |
| 266 | User 11 | Empty handler (no-op) |

#### Event 9 -- Timer (Main AI Loop)

The timer runs every 4 ticks and drives all robin behavior through a complex decision tree:

**Age and Energy Tracking:**
- Age (`ov01`) increments by 1 each tick.
- Energy (`ov02`) decrements by 1 each tick.
- After maturation (ov01 > 3000), the maturity counter (`ov20`) increments every 10 ticks.

**Obstacle Avoidance:**
- If left wall (`obst 0`) is close (< 100px): reverse to fly right, increase altitude urgency by 2.
- If right wall (`obst 1`) is close (< 100px): reverse to fly left, increase altitude urgency by 2.
- Altitude urgency is clamped between 0 and 15, and decremented by 1 each tick.

**Water Room Escape:**
- If in a water room (room type 8) and not dying: rapidly drain energy (subtract 10 per tick), push upward, increase altitude urgency to 20, apply upward velocity, and animate flight.

**Death Check:**
- When energy (`ov02`) reaches 0: set state to 99 (dying).
- Dying mature birds (ov01 > 3000) trigger `die_` (creates adult-sized dead body at frame 54).
- Dying juvenile birds (ov01 <= 3000) trigger `die2` (creates juvenile-sized dead body at frame 138).

**Sensing Range:**
- Mature birds (ov01 > 3000): sensing range = 800.
- Juvenile birds (ov01 < 3000): sensing range = 100.

**Sleep Decision:**
- If room light (Room CA property 1) < 0.25 and bird has a nest (`ov19`): enter state 5 (go to bed).

**Wake Up (State 98):**
- If room light (Room CA property 1) > 0.25: reset to state 0 (roam), restore plane to 2200, restore gravity (1.5), and fast tick rate (4).

**Hunger Decision:**
- When energy < hunger threshold (`ov73` = 650) and not already in a high state: switch to state 2 (get food).
- Juveniles (ov01 < 3000) scan for food agents (2 14 0). If fewer than 2 food sources are visible, switch to state 6 (steal from nest) instead of state 2.

**Nest Stealing (State 6 -- `enst`):**
- Navigate to own nest, approach it.
- When close enough, steal energy: send message 256 with negative `ov75` (drain 20) to the nest, gain 200 energy.

**Mating Check (Mature Adults Only):**
- Validate that mate and nest references are still valid (`chek` subroutine).
- If no mate found: search for one (`fmte`) -- finds a different-gender robin using `ov06`.
- If no nest found: search for one (`fnst`) -- finds an unclaimed nest (one with `ov71` = 0).
- If nest claimed: share nest logic (`snst`) -- manages nest reference passing between mates.
- When maturity counter exceeds 50, and both mate and nest exist: enter state 3 (mate).

**Go to Mate (State 4 -- `gmat`):**
- If nest's energy (`ov02`) is < 180: find nest material (2 6 1), approach it.
- When touching the material and it has `ov99` = 1: gain 100 nest resources, peck, enter state 1 (nesting).

**Mating (State 3 -- `mate`):**
- Navigate toward mate.
- When touching: count nearby adult robins. If male (`ov06` = 1) and 3 or fewer adults visible, set mating flag (`ov70` = 1) and transition to state 1 (nesting). Otherwise, return to roaming.

**Nesting (State 1 -- `nest`):**
- Navigate to own nest, deposit resources via message 256 with `ov98`, reset deposit counter.
- If male and mating flag is set: send message 260 to nest to trigger egg laying, clear flag.

**Juvenile Maturation (ov01 = 3000):**
- Triggers `matr`: creates a new adult robin (2 15 1) at current position with starting energy 200. The parent self-destructs. This effectively "rebirth" resets the bird as a fresh adult.

**State Behaviors:**

| State | Name | Behavior |
|---|---|---|
| 0 | Roam | Random walking/flying with 1-in-20 chance of direction change; occasional pecking and singing |
| 1 | Nest | Navigate to own nest, deposit resources (message 256), trigger egg if mated (message 260) |
| 2 | Get Food | Find nearest food (2 14 0, then 2 13 0, 2 8 0, 2 9 0, 2 3 0), approach and eat (message 12) |
| 3 | Mate | Navigate toward mate; if male and few adults, set mating flag and go to nest |
| 4 | Get Mating Material | Find nest material (2 6 1), collect it; gain 100 nest resources |
| 5 | Go to Bed | Navigate to nest and sleep |
| 6 | Steal from Nest | Approach own nest, drain 20 resources, gain 200 energy |
| 98 | Sleeping | Resting on nest; no gravity; reduced tick rate (250); static sleep pose |
| 99 | Dying | Triggers death and dead body creation |

**Movement Subroutines:**
- **`vect`**: Calculates velocity vector based on proximity to ground. Near ground: shorter horizontal movement, moderate vertical. In air: longer horizontal movement, higher vertical.
- **`move`**: Applies velocity using `ov10` (direction), `ov11` (vertical), and `ov15` (altitude urgency).
- **`anim`**: Selects animation based on ground proximity. Near ground: landing animation (`ov36`/`ov37`). In air: flying animation (`ov30`/`ov31`).

#### Event 5 -- Pickup

Resets state to 0, restores gravity (`accg` 1.5), sets fast tick rate (4).

#### Event 6 -- Collision

Updates facing direction (`ov10`) based on current velocity. Selects appropriate landing or flying animation based on ground proximity.

---

## Dead Robin (2 10 1)

A decomposing robin corpse created when a bird dies. Mature birds produce a body starting at frame 54 (24 animation frames), while juvenile birds use frame 138. The body decays over time and eventually disappears.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `robin` | 24 images, first image 54 (mature) or 138 (juvenile) |
| Plane | 2000 | High foreground |
| `accg` | 4 | Falls to ground |
| `elas` | 1 | Minimal bounce |
| `fric` | 80 | High friction |
| `attr` | 192 | Suffers Physics + Collisions (not carryable by default) |
| `perm` | 99 | Can pass through almost all barriers |
| `tick` | 20 | Slow timer for decay |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov02` | Decay countdown | Starts at 30; decrements each tick |
| `ov10` | Facing direction | -1=Left, 1=Right (inherited from the bird) |
| `ov61` | CA smell range | 14 |
| `ov70` | Picked up flag | 0=Normal decay, 1=Has been picked up (changes animation) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decay animation and self-destruction |
| 6 | Collision | Sets picked-up flag (`ov70 = 1`) |

#### Event 9 -- Timer

- While `ov02 > 0` and not picked up (`ov70 = 0`): plays twitching decay animation (8-frame cycle), direction-dependent (base 0 for left, base 8 for right).
- If picked up (`ov70 = 1`): shows a single static pose (pose 16 for left, pose 20 for right).
- When `ov02` reaches 0: plays final decay animation (4 frames from base 16/20), waits 10 ticks, then self-destructs.

---

## Robin Droppings (2 10 2)

Waste particles created by the `crap` subroutine in the adult robin's behavior. The initial pose depends on whether a specific detritus agent (2 1 10) exists in the world.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `robin` | 4 images, first image 168 |
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
| `ov00` | Dropping type | Inherited from detritus state; affects initial pose |
| `ov01` | Counter | Starts at 0 |
| `ov61` | CA smell range | 10 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Self-destructs (`kill ownr`) |

---

## Robin Egg (2 18 1)

An egg laid by a nest when the mating flag is set and resources are sufficient. The egg sits near the nest and grows over time. After 20+ ticks, it hatches into a robin chick (2 15 4). The egg also monitors the nest population and can trigger nest activation if no nests are found.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `robin` | 2 images, first image 162 |
| Plane | 49 | Ground level |
| `accg` | 0 | No gravity (sitting in nest) |
| `bhvr` | 17 | Pushable + Pullable + Hittable |
| `perm` | 99 | Can pass through barriers |
| `attr` | 199 | Full interactions + Physics + Collisions |
| `tick` | 30 | Growth timer |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Growth counter | Increments each tick; hatches when > 20 |
| `ov19` | Parent nest reference | The nest that laid this egg |
| `ov61` | CA smell range | 25 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth and hatching |
| 1 | Push | Enable gravity and fall |
| 6 | Collision | Drop eggshell, die |
| 12 | Eat | Provide food stimulus to eater, die |

#### Event 9 -- Timer

1. Growth counter (`ov01`) increments each tick.
2. When `ov01 > 20`: creates a robin chick (2 15 4) at the egg's position, inheriting the parent nest reference (`ov19`). The chick is configured with no gravity, hittable behavior, and a 30-tick timer. The egg then self-destructs.
3. **Nest population monitoring**: After the growth check, scans all nests (2 17 1) using `etch`. If no nests are found, sends message 0 (activate) to trigger nest replenishment.

#### Event 12 -- Eat

When eaten by a creature, the egg sends a food stimulus to the eater:
- **Stimulus**: `stim writ from 80 2` (stimulus type 80, intensity 2)
- The egg is then killed.

---

## Robin Chick (2 15 4)

A young bird hatched from an egg. The chick sits in or near the nest and grows over time, consuming 1 resource from the parent nest per tick. After 20+ ticks of growth, it matures into a full adult robin (2 15 1) with starting energy of 200. The chick inherits its parent nest reference and is randomly assigned a gender.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `robin` | 6 images, first image 162 |
| Plane | 49 | Ground level |
| `accg` | 0 | No gravity (in nest) |
| `clac` | 0 | No click activation |
| `perm` | 99 | Can pass through barriers |
| `attr` | 198 | Mouseclickable + Activatable + Suffers Physics + Collisions |
| `tick` | 30 | Growth timer |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Growth counter | Increments each tick; matures when > 20 |
| `ov19` | Parent nest reference | Inherited from egg |
| `ov61` | CA smell range | 60 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth, animation, maturation into adult |
| 1 | Push | Enable gravity and fall |
| 6 | Collision | Drop eggshell fragment, die |

#### Event 9 -- Timer

1. Plays pecking animation (base 0, frames 2-5 looping) and sends message 258 (subtract 1 resource) to parent nest (`ov19`).
2. Growth counter (`ov01`) increments.
3. When `ov01 > 20`: creates a new adult robin (2 15 1) at the chick's position with starting energy 200, random gender, and inherited nest reference. All standard adult properties and animation bases are applied. The chick then self-destructs.

#### Event 6 -- Collision

Creates an eggshell fragment (2 10 3) at the chick's position. The chick then self-destructs, simulating the egg breaking when knocked from the nest.

---

## Eggshell Fragment (2 10 3)

A small debris particle created when an egg or chick collides with something (falls from the nest). Purely cosmetic; self-destructs immediately on its timer tick.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `robin` | 1 image, first image 163 |
| Plane | 49 | Ground level |
| `accg` | 4 | Falls to ground |
| `elas` | 0 | No bounce |
| `perm` | 99 | Can pass through barriers |
| `attr` | 195 | Carryable + Suffers Physics + Collisions |
| `tick` | 30 | Self-destruct timer |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Counter | Set to 1 at creation |
| `ov61` | CA smell range | 12 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Self-destructs (`kill ownr`) |

---

## Lifecycle Summary

```
Nest (2 17 1) --[egg_ when mated + full]--> Egg (2 18 1) or Woodpigeon Egg (2 18 12)
    Egg --[growth > 20]--> Chick (2 15 4)
        Chick --[growth > 20]--> Adult Robin (2 15 1)
            Adult --[age = 3000]--> New Adult (rebirth via matr)
            Adult --[energy = 0]--> Dead Robin (2 10 1)
                Dead Body --[decay = 0]--> Removed
```

## Stimulus Effects

| Agent | Event | Stimulus | Intensity | Target |
|---|---|---|---|---|
| Robin Egg (2 18 1) | 12 (Eat) | 80 | 2 | Creature that ate it |

## Remove Script (rscr)

The remove script cleans up the entire robin ecosystem:
1. Kills all instances of each agent type (2 15 1, 2 15 4, 2 17 1, 2 10 1, 2 10 2, 2 18 1, 2 10 3)
2. Removes all associated event scripts using `scrx`
