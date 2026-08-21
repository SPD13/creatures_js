# woodpigeon2.cos - Woodpigeon Ecosystem

**Source**: `Assets/Bootstrap/001 World/woodpigeon2.cos`

## Overview

This script implements a complete woodpigeon ecosystem for the Creatures 3 world, including adult birds, dead bodies, chicks, eggs, droppings, and eggshell fragments. It is structurally very similar to the hummingbird ecosystem: a multi-state AI drives roaming, feeding, mating, nesting, sleeping, and dying, with a full lifecycle from egg to chick to adult.

At bootstrap, if fewer than 18 woodpigeons (2 15 11) currently exist, six adults are spawned. Gender (`ov06`) cycles through three values 0, 1, 2 (the spawn loop increments then resets the counter at 3), producing a mixed gender population. Adults start as mature birds (age counter = 3000) with 800 energy points.

Woodpigeons rely on **external nest agents** (classifier `2 17 1`), which are expected to be present in the world (created by another script). They search for nests to claim, deposit resources into them, and leave eggs near them. Eggs (2 18 12) hatch into chicks (2 15 13), and chicks mature into new adult woodpigeons (2 15 11) through a rebirth mechanism. Dead woodpigeons decompose and eventually disappear (no Room CA emission unlike other birds in the game).

The birds exhibit a broad behavioral repertoire: obstacle avoidance (walls, ceiling), escape from water rooms (room type 8), a sleep/wake cycle based on room light (CA 1), hunger-driven food foraging, mating with opposite-gender individuals, and population-aware mating suppression (population cap of 4 nearby birds prevents additional reproduction).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 11 | Adult Woodpigeon | `woodpigeon` frame 86 | Main flying bird with complex AI: roaming, feeding, mating, nesting, sleeping | [Detail](#adult-woodpigeon-2-15-11) |
| 2 10 18 | Dead Woodpigeon | `woodpigeon` frame 24 | Corpse that animates through decay then self-destructs | [Detail](#dead-woodpigeon-2-10-18) |
| 2 15 13 | Woodpigeon Chick | `woodpigeon` frame 7 | Young bird hatched from egg; matures into an adult woodpigeon | [Detail](#woodpigeon-chick-2-15-13) |
| 2 18 12 | Woodpigeon Egg | `woodpigeon` frame 1 | Egg that hatches into a chick after growth period | [Detail](#woodpigeon-egg-2-18-12) |
| 2 10 35 | Woodpigeon Droppings | `woodpigeon` frame 4 | Waste dropped periodically by flying birds | [Detail](#woodpigeon-droppings-2-10-35) |
| 2 10 36 | Eggshell Fragment | `woodpigeon` frame 1 | Debris from hatched/dropped eggs | [Detail](#eggshell-fragment-2-10-36) |

---

## Adult Woodpigeon (2 15 11)

The main agent of the ecosystem. A flying bird with a complex multi-state AI governing roaming, feeding, mating, nesting, sleeping, and death. Woodpigeons have two life stages: juvenile (age < 3000 ticks) and adult (age >= 3000). Adults can find mates and reproduce via external nests (2 17 1). Gender is stored in `ov06` (0, 1, or 2 -- cycled at spawn).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `woodpigeon` | 86 images, first image 0 |
| Plane | 2200 | Foreground layer |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Collisions |
| `accg` | 1.5 | Low gravity (flying) |
| `elas` | 5 | Low bounce |
| `fric` | 80 | High friction |
| `tick` | 4 | Fast timer |
| `bhvr` | 16 | Hittable |
| Position | Random X (1500-2000), Y = 300 | Spread horizontally across the world |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Nest, 2=Get Food, 3=Mate, 4=Get Mating Material, 5=Go to Bed, 6=Steal from Nest, 98=Sleeping, 99=Dying |
| `ov01` | Age counter | Starts at 3000 for spawned adults; >=3000 = mature; increments each tick |
| `ov02` | Energy/HP | Starts at 800; decrements each tick; death at 0 |
| `ov06` | Gender | 0, 1 or 2 (cycled across spawn) |
| `ov09` | (reserved) | 0 |
| `ov10` | Horizontal direction | -1=Left, 1=Right |
| `ov11` | Vertical direction | -1=Up, 0=Level, 1=Down |
| `ov15` | Altitude urgency | 0-15 range; increased near walls, decreased near ceiling |
| `ov16` | Current target agent | Reference to food, nest, or mate being pursued |
| `ov17` | Mate reference | Another woodpigeon of different gender |
| `ov18` | (reserved) | null |
| `ov19` | Nest reference | The nest (2 17 1) claimed by this bird |
| `ov20` | Maturity counter | Increments every 10 ticks after maturation; triggers mating at > 50 |
| `ov30`-`ov43` | Animation bases | Flying/idle/peck/turn frames (0, 8, 36, 40, 22, 30, 20, 28, 16, 17, 44, 52, 62, 66) |
| `ov61` | CA smell range | 65 |
| `ov70` | Mating success flag | 1=Has mated, triggers egg at nest |
| `ov71` | Nest claim helper | Flag used when claiming a nest |
| `ov72` | Food value per eat | 800 (energy gained when eating food) |
| `ov73` | Hunger threshold | 650 (seeks food when energy below this) |
| `ov74` | Satiation threshold | 1850 (stops eating above this) |
| `ov75` | Energy steal amount | 20 (drained from nest per steal action) |
| `ov98` | Nest resource deposit | Amount to deliver to nest on next visit |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main AI behavior loop |
| 5 | Pickup | Reset state, reset gravity and tick |
| 6 | Collision | Update facing direction from velocity, play flight animation |
| 12 | Eat | Provide food stimulus (80, intensity 4) to eater, die |
| 256 | User 1 | Add energy (`_p1_` added to `ov02`) |
| 257 | User 2 | Add nest resource deposit (`_p1_` added to `ov98`) |
| 266 | User 11 | Empty handler (no-op) |

#### Event 9 -- Timer (Main AI Loop)

The timer runs every 4 ticks and drives all woodpigeon behavior through a decision tree:

**Age and Energy Tracking:**
- Age (`ov01`) increments by 1 each tick.
- Energy (`ov02`) decrements by 1 each tick.
- After maturation (ov01 > 3000), the maturity counter (`ov20`) increments every 10 ticks.

**Obstacle Avoidance:**
- Left wall close (`obst 0` < 100): reverse to fly right, raise altitude urgency.
- Right wall close (`obst 1` < 100): reverse to fly left, raise altitude urgency.
- Ceiling close (`obst 2` < 50): push downward, lower altitude urgency.

**Water Room Escape:**
- If in a water room (room type 8) and not dying (`ov00 != 99`): rapidly drain energy (-10), push upward, and flee.

**Death Check:**
- When energy (`ov02`) reaches 0: set state to 99 (dying).
- Mature dying birds (ov01 > 3000) trigger `die_` subroutine (creates adult dead body at base frame 62).
- Juvenile dying birds (ov01 <= 3000) trigger `die2` subroutine (creates juvenile dead body at base frame 162).

**Sensing Range:**
- Mature birds (ov01 > 3000): range = 800.
- Juvenile birds (ov01 < 3000): range = 100.

**Sleep Decision:**
- If room humidity/light (CA 1) < 0.25 and bird has a nest: enter state 5 (go to bed).

**Wake Up (State 98):**
- If CA 1 > 0.25: reset to state 0 (roam), restore gravity (1.5) and tick rate (4).

**Hunger Decision:**
- When energy < hunger threshold (`ov73` = 650): switch to state 2 (get food).
- Juveniles with fewer than 2 visible food sources switch to state 6 (steal from nest) instead.

**Mating Check (Mature Adults Only):**
- `chek`: Validate mate and nest references; null them if targets are gone.
- `fmte`: Find a mate -- an opposite-gender woodpigeon (different `ov06` value).
- `fnst`: Find a nest (2 17 1) that has not been claimed (`ov71 == 0`), then mark it claimed.
- `snst`: Share nest logic with gender 1 birds (transfers nest to mate in some cases).
- When maturity counter exceeds 50 with both mate and nest set, enter state 3 (mate).

**Juvenile Maturation (ov01 == 3000):**
- Triggers `matr`: creates a new adult woodpigeon (2 15 11) at current position, inheriting the previous gender and state, then the parent self-destructs. This "rebirth" resets the bird as a fresh adult at ov02 = 200.

**State Behaviors:**

| State | Name | Behavior |
|---|---|---|
| 0 | Roam | Random flying with occasional direction flip (1-in-20 chance). At low obstacles, 1-in-5 chance to peck. |
| 1 | Nest | Navigate to own nest, deposit resources via message 256 (with `ov98`), optionally trigger egg (message 260 if gender=1 and `ov70`=1) |
| 2 | Get Food | Find nearest food among types (2 14 0), (2 13 0), (2 8 0), (2 9 0), (2 3 0); approach, touch, send eat message (12); stop above satiation |
| 3 | Mate | Navigate toward mate; if gender=1, check population cap (<=4 nearby woodpigeons), set `ov70`=1 and transition to nesting; reset maturity counter |
| 4 | Get Mating Material | Find mating material (2 6 1), approach; if `ov99`=1 on the material, peck it and transition to state 1 (nest); gain 100 nest resources |
| 5 | Go to Bed | Navigate to nest, enter sleep (state 98). Moves slightly behind (plane-1) and tick 250 |
| 6 | Steal from Nest | Approach own nest, drain 20 resources (message 256 with -20), gain 200 energy |
| 98 | Sleeping | Resting on nest; reduced tick (250); gravity disabled; pose 18 or 19 based on facing |
| 99 | Dying | Triggers death sequence and dead body creation |

**Waste Dropping:**
- The `crap` subroutine is referenced (produces droppings 2 10 35) -- note: the subroutine is defined but the adult timer does not explicitly call `gsub crap`; it would be invoked from other state branches if enabled. Droppings inherit their pose from the presence/state of a (2 1 10) reference agent.

#### Event 5 -- Pickup

Resets state to 0 (roam), restores gravity (accg 1.5) and tick rate (4).

#### Event 6 -- Collision

Updates facing direction (`ov10`) based on velocity sign. Plays directional flight animation (turning or flight-cycle) based on whether on ground (`obst 3`) or airborne.

#### Event 12 -- Eat

- **Stimulus**: `stim writ from 80 4` (stimulus type 80, intensity 4).
- Self-destructs (`kill ownr`).

---

## Dead Woodpigeon (2 10 18)

A woodpigeon corpse created when a bird dies. Mature birds produce a body at base frame 62 (`die_`), while juveniles use base frame 162 (`die2`). The body plays a 'decay' animation and self-destructs when the countdown reaches zero. Unlike hummingbirds, this dead body does **not** emit Room CA nutrients.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `woodpigeon` | 24 images, first image 62 (mature) or 162 (juvenile) |
| Plane | 49 | Ground level |
| `accg` | 4 | Falls to ground |
| `elas` | 1 | Minimal bounce |
| `fric` | 80 | High friction |
| `attr` | 192 | Carryable + Mouseclickable |
| `perm` | 99 | Can pass through almost all barriers |
| `tick` | 20 | Slow timer for decay |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov02` | Decay countdown | Starts at 30; decrements each tick |
| `ov10` | Facing direction | Inherited from the bird |
| `ov61` | CA smell range | 25-30 |
| `ov70` | Picked up flag | 0=Normal decay, 1=Has been picked up (changes animation) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decay animation sequence |
| 6 | Collision | Sets picked-up flag (`ov70 = 1`) |

#### Event 9 -- Timer

- While `ov02 > 0` and not picked up: plays 8-frame decay animation looping (base 0 or base 8 depending on facing direction).
- While `ov02 > 0` and picked up: displays a single static pose (pose 16 or pose 20).
- When `ov02 <= 0`: plays final death-snapshot animation (3 frames, base 16 or 20), waits 10 ticks, then self-destructs.

---

## Woodpigeon Chick (2 15 13)

A young bird hatched from an egg. The chick sits in the nest, pecking and drawing resources from its parent nest, until it matures into a full adult woodpigeon (2 15 11).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `woodpigeon` | 7 images, first image 86 |
| Plane | 49 | Ground level |
| `accg` | 1.5 | Low gravity |
| `elas` | 5 | Low bounce |
| `perm` | 50 | Standard permeability |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Collisions |
| `tick` | 4 | Growth timer |
| `bhvr` | 16 | Hittable |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Growth counter | Increments each tick; matures when > 20 |
| `ov19` | Parent nest reference | Inherited from egg |
| `ov61` | CA smell range | 60 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth, pecking animation, deposit to nest, maturation into adult |
| 1 | Push | Enable gravity (accg 4), zero vertical velocity |
| 6 | Collision | Create eggshell fragment (2 10 36), self-destruct |
| 12 | Eat | Provide food stimulus (80, intensity 3), die |

#### Event 9 -- Timer

1. Plays pecking animation (base 0, frames [2 3 4 5 255]).
2. Sends message 258 (`wrt+ ov19 258 1`) to the parent nest (drain 1 resource).
3. Growth counter (`ov01`) increments.
4. When `ov01 > 20`: creates a new adult woodpigeon (2 15 11) at the chick's position with full configuration (all `ov30`-`ov43` animation bases, random gender via `ov06 = rand 0 1`, starting energy 200). The chick then self-destructs.

#### Event 6 -- Collision

Creates an eggshell fragment (2 10 36) and self-destructs the chick.

#### Event 12 -- Eat

- **Stimulus**: `stim writ from 80 3` (stimulus type 80, intensity 3).
- Self-destructs (`kill ownr`).

---

## Woodpigeon Egg (2 18 12)

An egg laid near a nest. The egg grows over time and hatches into a chick (2 15 13). It also monitors the nest population: if no nests (2 17 1) are present, it sends a wake-up message to activate nest generation elsewhere.

Note: The egg is not created within this script file -- its creation is triggered by an external agent, presumably the nest (2 17 1) responding to a mating message. Its scripts are defined here.

### Properties (as applied after hatching)

| Property | Value | Notes |
|---|---|---|
| Sprite | `woodpigeon` | 7 images, first image 86 (chick frame range) |
| Plane | 49 | Ground level |
| `accg` | 0 | No gravity (sitting in nest) |
| `clac` | 0 | No collision actions |
| `elas` | 0 | No bounce |
| `perm` | 99 | Can pass through barriers |
| `attr` | 198 | Mouseclickable + Activatable + Suffers Physics + Collisions |
| `tick` | 30 | Growth timer |
| `bhvr` | 16 | Hittable |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Growth counter | Increments each tick; hatches when > 20 |
| `ov19` | Parent nest reference | Inherited from parent bird |
| `ov61` | CA smell range | 55 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth and hatching; nest existence check |
| 1 | Push | Enable gravity (accg 4), zero vertical velocity |
| 6 | Collision | Create eggshell fragment (2 10 36), die |

#### Event 9 -- Timer

1. Growth counter (`ov01`) increments.
2. When `ov01 > 20`: creates a chick (2 15 13) at the egg's position (offset by random value), inheriting the parent nest reference. The egg then self-destructs.
3. **Population monitoring**: After growth check, scans all candidate nests (2 17 1). If none exist, sends message 0 to the last `targ` to activate nest generation.

#### Event 6 -- Collision

Creates an eggshell fragment (2 10 36) and self-destructs the egg.

---

## Woodpigeon Droppings (2 10 35)

Waste particles dropped by flying woodpigeons. The pose depends on the existence and state of a (2 1 10) reference agent (likely a world-managing sentinel): pose 2 if none exists, pose 0 otherwise.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `woodpigeon` | 4 images, first image 182 |
| Plane | 49 | Ground level |
| `accg` | 3 | Falls to ground |
| `elas` | 1 | Minimal bounce |
| `fric` | 80 | High friction |
| `attr` | 195 | Carryable + Mouseclickable + Suffers Physics + Collisions |
| `perm` | 99 | Can pass through almost all barriers |
| `tick` | 10 | Timer |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Dropping type | Inherited from reference agent's state |
| `ov01` | (reserved) | 0 |
| `ov61` | CA smell range | 10 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Empty handler -- the dropping persists until physically destroyed |

---

## Eggshell Fragment (2 10 36)

A small debris particle created when an egg or chick collides with something. Purely cosmetic; has an empty timer and persists until physically destroyed.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `woodpigeon` | 1 image, first image 87 |
| Plane | 49 | Ground level |
| `accg` | 4 | Falls to ground |
| `elas` | 0 | No bounce |
| `perm` | 99 | Can pass through barriers |
| `attr` | 195 | Carryable + Suffers Physics + Collisions |
| `tick` | 30 | Timer |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Empty handler |

---

## External Dependencies

- **Nest agents (2 17 1)**: Not created in this script. Woodpigeons search for, claim, and deposit resources into nests of this classifier, and eggs monitor their existence. These nests must be provided by another script/bootstrap file.
- **Food agents**: Woodpigeons forage for food of classifiers (2 14 0), (2 13 0), (2 8 0), (2 9 0), and (2 3 0).
- **Mating material (2 6 1)**: Used in the `gmat` subroutine as material to trigger mating.
- **Reference agent (2 1 10)**: Queried in the droppings creation subroutine to set the dropping pose.

## Stimulus Effects

| Agent | Event | Stimulus | Intensity | Target |
|---|---|---|---|---|
| Adult Woodpigeon (2 15 11) | 12 (Eat) | 80 | 4 | Creature that ate it |
| Woodpigeon Chick (2 15 13) | 12 (Eat) | 80 | 3 | Creature that ate it |
| Woodpigeon Egg (2 18 12) | 12 (Eat) | 80 | 2 | Creature that ate it |

## Lifecycle Summary

```
External Nest (2 17 1) --[mated + resources]--> Egg (2 18 12)
    Egg --[growth > 20]--> Chick (2 15 13)
        Chick --[growth > 20]--> Adult Woodpigeon (2 15 11)
            Adult --[age = 3000]--> New Adult (rebirth via matr)
            Adult --[energy = 0]--> Dead Woodpigeon (2 10 18)
                Dead Body --[decay = 0]--> Removed
```

## Remove Script (rscr)

The remove script cleans up the entire woodpigeon ecosystem:
1. Kills all instances of each agent type (2 15 11, 2 15 13, 2 10 18, 2 10 35, 2 18 12, 2 10 36).
2. Removes all associated event scripts using `scrx`.
