# grazer2.cos - Grazer Ecosystem

**Source**: `Assets/Bootstrap/001 World/grazer2.cos`

## Overview

This script implements the Grazer ecosystem for the Creatures 3 world. Grazers are small herbivorous creatures that feed on seeds (classifiers 2 6 0 and 2 6 1), roam the ship in loose flocks, and have a three-stage lifecycle progressing from baby to juvenile to adult. They are an important part of the ship's food web, converting seeds into droppings that release nutrients and heat into the room CA system.

Grazers exhibit complex social behaviors including flocking, panic responses that spread through nearby individuals, avoidance of pests (2 2 10), and wind-influenced movement via room CA property 5. Adults reproduce sexually through a courtship ritual: they search for mates, approach and court them, and one partner becomes pregnant, eventually giving birth to a litter of new babies. Each lifecycle stage transitions by the parent dying and spawning the next stage form, while adult reproduction creates entirely new baby grazers.

At bootstrap, 5 adult grazers and 5 baby grazers are placed at random positions in the x range 1800-2700 at y=600. Grazers die rapidly in desert rooms (types 8 and 9). When they die, their bodies decompose over several ticks, releasing nutrients (CA property 3) and heat (CA property 4) into the room before disappearing. Adults also periodically produce droppings that decompose in a similar fashion.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 2 | Grazer | `graz` frame 0/72/144 | Seed-eating herbivore with three lifecycle stages and flocking behavior | [Detail](#grazer-2-15-2) |
| 2 10 6 | Grazing Dropping | `graz` frame 216/218 | Organic dropping that decomposes and releases nutrients and heat into room CA | [Detail](#grazing-dropping-2-10-6) |

---

## Grazer (2 15 2)

A small herbivorous creature that roams the ship eating seeds, avoiding pests, and reproducing through a three-stage lifecycle. Grazers have complex AI with idle wandering, food seeking, mate seeking, courting, fleeing, and flocking behaviors. They are influenced by room wind and avoid desert environments.

### Bootstrap Configuration

Two groups of 5 grazers are created:

| Group | First Image | Life Stage (`ov05`) | Notes |
|---|---|---|---|
| Adults | 72 | 2 | Full-size adult grazers |
| Babies | 144 | 0 (default) | Smallest baby stage |

| Property | Value | Notes |
|---|---|---|
| Sprite | `graz` | 72 images per stage |
| `attr` | 199 | Physics + Carryable + Mouseclickable + Suffers Collisions + Gravity |
| `bhvr` | 1 | Activatable (push) |
| `clac` | 0 | No click action |
| `accg` | 5 | Gravity |
| `aero` | 10 | Air resistance |
| `fric` | 50 | Friction |
| `elas` | 10 | Elasticity |
| `perm` | 60 | Permeability |
| `tick` | 7 | Timer interval |
| Plane | Random 2000-5000 | Random depth sorting |
| Position | Random x 1800-2700, y 600 | Initial spawn area |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov00` | Behavior state machine | 0 |
| `ov01` | Reproduction counter (increments each tick) | 0 |
| `ov02` | Health/energy | 250 |
| `ov05` | Life stage: 0=baby1, 1=baby2, 2=adult | 0 or 2 |
| `ov10` | Facing direction: -1=left, 1=right | Random -1 or 1 |
| `ov16` | Target agent reference (food or mate) | null |
| `ov30`-`ov44` | Animation base frames (see below) | Various |
| `ov61` | Unknown | 60 |
| `ov70` | Flee/panic state: 0=normal, 1=start flee, 2=fleeing | 0 |
| `ov91` | Death animation started flag | 0 |
| `ov93` | Courting countdown | - |
| `ov94` | Pregnancy/mating countdown | - |
| `ov95` | Pregnant flag: 0=no, 1=yes | 0 |
| `ov96` | Collision counter | 0 |
| `ov97` | Panic countdown | - |
| `ov98` | Movement speed: 0=none, 1=walk, 2=run | 0 |

### Animation Base Frames

| Variable | Animation | Base Frame |
|---|---|---|
| `ov30` | Walk left | 0 |
| `ov31` | Walk right | 8 |
| `ov32` | Run left | 16 |
| `ov33` | Run right | 23 |
| `ov34` | Head down left | 30 |
| `ov35` | Head up left | 33 |
| `ov36` | Head down right | 36 |
| `ov37` | Head up right | 39 |
| `ov38` | Chomp left | 42 |
| `ov39` | Chomp right | 46 |
| `ov40` | Chew left | 50 |
| `ov41` | Chew right | 56 |
| `ov42` | Die left | 62 |
| `ov43` | Die right | 66 |
| `ov44` | Lay/rest | 70 |

### Behavior State Machine (`ov00`)

| State | Name | Description |
|---|---|---|
| 0 | Idle | Wanders, flocks, head bobs, chews, lays down at random |
| 1 | Search Food | Scans for nearest edible seed (2 6 1 preferred, then 2 6 0) |
| 2 | Approach Food | Moves toward target seed; eats on contact (+50 health) |
| 3 | Search Mate | Looks for another adult grazer (ov05=2) that is not pregnant (ov95=0) |
| 4 | Approach Mate | Moves toward mate; initiates courting on contact |
| 5 | Courting | Follows mate with head bobs for several ticks |
| 6 | Post-Courtship | 50% chance either partner becomes pregnant (ov95=1, ov94=150-300) |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main AI behavior loop |
| Collision | 6 | Wall and floor collision handling |
| Activate 1 | 1 | Pushed/hit reaction with panic spread |
| Message 1000 | 1000 | Mating request from another grazer |
| Message 1001 | 1001 | Flock panic signal |
| Message 1003 | 1003 | Give birth |
| Pickup | 4 | Picked up by hand; spreads panic to flock |

### Timer Behavior (Event 9)

The main AI loop executes every 7 ticks and handles all grazer behavior:

**1. Sound and Environment Checks**
- Randomly plays grazer sounds (`gr_1`, `gr_2`) with ~22% chance
- Checks room type: desert rooms (types 8, 9) set health to -10 (rapid death)
- Resets collision counter and movement speed

**2. Health and Death**
- Decrements health (`ov02`) by 1 each tick
- If health reaches 0: triggers death subroutine (decomposition animation, CA release, eventual removal)

**3. Lifecycle Transitions** (when `ov01` >= 500 and not fleeing)
- **Baby stage 0** (`ov05=0`): Parent dies, spawns a baby stage 1 (first image 0, `ov05=1`) at its position
- **Baby stage 1** (`ov05=1`): Parent dies, spawns an adult (first image 72, `ov05=2`) at its position
- **Adult** (`ov05=2`): If health reaches 0, dies normally (no stage transition)

**4. Dropping Production** (adults with health >= 120)
- ~33% chance per tick when not carried
- Checks for nearby Norns (1 1 11): if a Norn with `ov00=0` is found, creates dropping at frame 218; otherwise frame 216
- Dropping placed slightly above the grazer's position

**5. Adult Mating** (`ov05=2`, not fleeing)
- Pregnancy countdown (`ov94`) decrements each tick
- When expired: if not pregnant, transitions to mate search state (ov00=3); if pregnant, sends birth message (1003)

**6. Food Search Trigger** (health < 100, not fleeing)
- Searches for seeds (2 6 0) nearby
- If no seeds found and health < 50: enters panic mode
- If no seeds found and health >= 50: resets to idle
- If seeds found: enters food search state (ov00=1)

**7. Panic/Flee Behavior** (`ov70`)
- Stage 1: Sets run speed, random panic duration (8-20 ticks)
- Stage 2: Counts down, then returns to normal behavior

**8. Idle Behavior** (state 0, not fleeing)
- **Wind influence**: Checks room CA property 5 (wind); adjusts facing direction toward wind source
- **Pest avoidance**: Detects pests (2 2 10) and adjusts direction away from them
- Random action selection (0-9):
  - 0-1: Turn around or flock, walk speed
  - 2: Turn around or flock, run speed
  - 3: Stand still, head bob or wait
  - 4: Chew animation, randomized tick delay
  - 5-9: Lay down animation (rest)

**9. Food Search** (state 1)
- Scans visible seeds: prefers ripe seeds (2 6 1) within 100 vertical units, then unripe seeds (2 6 0)
- Selects the closest seed by horizontal distance
- If found: stores target in `ov16`, transitions to approach (state 2)
- If none found: enters panic

**10. Food Approach** (state 2)
- Uses `home` subroutine to orient toward target
- On contact: plays chomp animation and sound (`gr_e`)
- If seed's `ov99=1` (edible): sends message 12 to seed, gains 50 health, returns to idle
- If seed not edible or gone: resets to idle

**11. Mate Search** (state 3)
- Scans for nearby grazers with `ov05=2` (adult) and `ov95=0` (not pregnant)
- If found: stores mate reference, transitions to approach mate (state 4)
- If none: runs in random direction

**12. Mate Approach** (state 4)
- Moves toward mate; on contact sends message 1000 (mating request), head bobs
- Sets courting countdown (`ov93` = 3-10 ticks), transitions to courting (state 5)

**13. Courting** (state 5)
- Follows mate, head bobs for countdown duration
- When countdown expires: transitions to post-courtship (state 6)

**14. Post-Courtship** (state 6)
- 50% chance assigns pregnancy to self or partner
- Pregnant individual gets `ov95=1` and `ov94=150-300` countdown

**15. Movement Execution**
- Walk (`ov98=1`): velocity x=8, y=-5 with walking animation
- Run (`ov98=2`): velocity x=13, y=-6 with running animation

### Collision Behavior (Event 6)

- Tracks collisions via `ov96`; stops responding after 10 consecutive collisions (prevents stuck loops)
- Wall types 0, 1 (left/right walls): reverses direction
- Wall type 3 (floor): attempts to jump over obstacle with increased velocity

### Activate 1 Behavior (Event 1) - Push/Hit

- Plays panic sound (`gr_p`)
- If pushed by a creature (family 4): applies stimulus 86 to the creature (pain/fear response)
- Flees away from the pushing agent
- Broadcasts panic message (1001) to all nearby grazers with direction and random delay

### Message 1001 - Flock Panic

- Plays panic sound (`gr_p`)
- Aligns direction based on parameter (follow flock direction) or picks random direction
- Enters flee mode (`ov70=1`)

### Message 1000 - Mating Request

- If not pregnant (`ov95=0`) and mating countdown nearly expired (`ov94 <= 20`): accepts courtship (sets state 5, stores mate)
- Otherwise: sends self a panic message (flee from unwanted advance)

### Message 1003 - Give Birth

- Plays laying animation while stationary
- Counts existing baby grazers (ov05=0) in the world
- If 5+ babies exist: spawns 2 new babies; otherwise spawns 4
- New babies: first image 144, health 50, random direction
- Resets pregnancy state (`ov95=0`, `ov94=150`)

### Pickup Behavior (Event 4)

- When picked up by the hand, broadcasts panic message (1001) to all nearby grazers

### Subroutines

| Subroutine | Description |
|---|---|
| `home` | Orients toward target agent (`ov16`), sets walk speed and direction |
| `hedd` | Head down animation (direction-aware) |
| `hedu` | Head up animation (direction-aware) |
| `chmp` | Chomp/bite animation (direction-aware) |
| `chew` | Chewing animation (direction-aware) |
| `die_` | Death sequence: disables physics, decomposition animation over 3 poses, releases CA nutrients/heat per pose, then kills self |
| `flok` | Flocking: scans nearby grazers and adjusts direction to match the majority |
| `lay_` | Lay down: checks if other grazers are in earshot, plays resting animation with random duration |

### Stimulus Effects

| Trigger | Stimulus | Target | Description |
|---|---|---|---|
| Pushed by creature | 86 | The creature that pushed | Pain/fear stimulus to discourage creatures from pushing grazers |

### Room CA Effects

| Source | CA Property 3 (Nutrients) | CA Property 4 (Heat) |
|---|---|---|
| Death decomposition (per pose) | +0.1 | +0.1 |
| Desert room (types 8, 9) | - | - |

**Desert rooms**: Health instantly set to -10 (rapid death). Grazers cannot survive in desert environments.

---

## Grazing Dropping (2 10 6)

Organic droppings produced by adult grazers. These small objects fall to the ground and slowly decompose, releasing nutrients and heat into the room's CA system. Two visual variants exist depending on whether Norns are present nearby when the dropping is produced.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `graz` | Frame 216 (no Norns) or 218 (Norns present) |
| `attr` | 192 | Physics + Suffers Collisions |
| `accg` | 5 | Gravity |
| `aero` | 5 | Air resistance |
| `elas` | 0 | No bounce |
| Plane | 1999 | Behind most agents |

### Events

| Event | Number | Description |
|---|---|---|
| Collision | 6 | Lands on surface, sets decomposition timer |
| Timer | 9 | Decomposition: releases CA, then removes self |

### Collision Behavior (Event 6)

When the dropping hits the ground, it changes to pose 1 (flattened appearance) and sets a long decomposition timer of 400 ticks.

### Timer Behavior (Event 9)

When the decomposition timer fires:
- If in a valid room and not carried: releases +0.1 nutrients (CA property 3) and +0.1 heat (CA property 4) into the room
- Kills itself after releasing nutrients

---

## Removal Script

The removal script (`rscr`) cleans up all grazers and droppings:
- Kills all grazer agents (2 15 2)
- Kills all grazing droppings (2 10 6)
- Removes scripts for grazer events 9, 6, and 1
