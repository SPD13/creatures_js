# Lifts.cos - Vertical Transport Lift System

**Source**: `Assets/Bootstrap/001 World/Lifts.cos`

## Overview

This script creates the complete vertical lift (elevator) transport system for the Creatures 3 spaceship. It establishes eight independent lift shafts distributed across the ship, each consisting of a set of call buttons and a lift car (vehicle). The lift system allows creatures and agents to travel vertically between different decks and levels within metarooms.

Each lift shaft is composed of:
- **Lift Call Buttons** (2 12 2): Simple agents placed at each stop along the shaft. When activated by a creature or the player, they summon the lift car to that level. Buttons are interconnected via input/output ports and linked via room permeability (`link` command) to provide creatures with pathfinding routes through the shaft.
- **Lift Car** (3 1 1): A vehicle agent with a cabin that can carry creatures. It has up and down buttons (parts 2 and 3), a door animation (part 1), and moves vertically between stops. The car automatically picks up nearby creatures when called, transports them, and releases them at the destination with appropriate stimulus feedback.

The lift system features variable speed based on distance to travel, door open/close animations, passenger loading/unloading with creature zombification during transit, and sound effects. Creatures receive stimulus 75 ("it is approaching") when they activate the lift and stimulus 94 ("it has arrived") upon reaching their destination. Call buttons use CAOS ports for inter-button communication.

## Created Agents

| Classifier | Name | Description | Detail |
|---|---|---|---|
| 2 12 2 | Lift Call Button | Call button placed at each lift stop; summons the lift car | [Detail](#lift-call-button-2-12-2) |
| 3 1 1 | Lift Car | Vehicle that transports creatures vertically between stops | [Detail](#lift-car-3-1-1) |

## Lift Shaft Layout

Eight independent lift shafts are created, each with its own set of call buttons and a lift car:

| Shaft | Call Button Positions | Lift Start Position | Stops | Link Permeability |
|---|---|---|---|---|
| 1 | (1450,1526), (1220,1710), (1220,1910), (1220,2095), (1450,2320), (1450,2520) | (1290,1460) | 6 | 100 |
| 2 | (4740,1980), (4500,2224), (4740,2368) | (4580,2185) | 3 | 100 |
| 3 | (6250,262), (6250,455), (6250,736) | (6305,400) | 3 | 80 |
| 4 | (5150,736), (5150,990) | (5226,666) | 2 | 50 |
| 5 | (2060,3298), (2060,3472), (2060,3719), (2060,3970) | (2115,3908) | 4 | 100 |
| 6 | (5950,3427), (5950,3643), (5950,3950), (6180,4234) | (6040,3365) | 4 | 100 |
| 7 | (1301,490), (1475,740), (1301,918) | (1351,674) | 3 | 100 |
| 8 | (2700,250), (2700,488), (2700,795) | (2780,724) | 3 | 100 |

Room links between adjacent call button positions are established via the `grap`/`link` commands, creating pathfinding routes through each shaft for creature navigation.

---

## Lift Call Button (2 12 2)

Simple agents placed at each stop in a lift shaft. Each button knows which lift car it belongs to (stored in `ov16`) and can summon the lift to its level. Buttons communicate with each other via CAOS ports to coordinate state. A total of 28 call buttons are created across all 8 shafts.

### Properties

| Property | Value | Notes |
|---|---|---|
| `bhvr` | 1 | Activatable by creatures |
| `attr` | 4 | Mouseclickable |
| `perm` | 10 | Low permeability |
| `clac` | 0 | No click action class |
| `elas` | 0 | No elasticity |
| Sprite | `lift` frame 2, 14 frames | 14-frame sprite gallery |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov00` | State flag: 0 = idle, 1 = active (waiting for lift) |
| `ov16` | Agent reference to the associated lift car (3 1 1) |
| `ov70` | Last received port value |
| `ov71` | Absolute value of ov70 |
| `ov88` | Button bracket type: 1 = bottom, 2 = top, 3 = middle |

### Ports

| Port | Direction | ID | Description |
|---|---|---|---|
| Input 0 | In | "lift call button in" | Receives data from connected buttons |
| Output 0 | Out | "lift call button out" | Outputs state to connected buttons |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Creature or player activates the button to summon the lift |
| 1000 | Port Input | Handles incoming port data from linked buttons |
| 1501 | Reset | Resets button state after lift arrives |
| 3 | Hit | Responds to being hit by an agent |

#### Event 1 - Activate 1 (Summon Lift)

1. Runs in INST/LOCK mode.
2. Gets the associated lift car reference from `ov16`.
3. Enumerates all call buttons assigned to the same lift, summing their `ov00` state and `pose` to determine if any button is already active.
4. Also adds the lift car's own `ov00` state to the sum.
5. Gets the lift car's Y position and calculates a tolerance range of +/-20 pixels.
6. If no button is currently active (`va66 = 0`):
   - If the lift is NOT near this button (outside the +/-20 pixel range):
     - Sends 0 on output port to signal other buttons.
     - Resets all other buttons on the same lift (pose 0, ov00 = 0).
     - Plays "but1" sound, sets own pose to 1 and ov00 to 1 (active).
     - Sends message 1500 to the lift car with this button's UNID as `_p1_`.
   - If the lift IS already at this button's level:
     - Plays a brief blink animation (cosmetic feedback, no action).

#### Event 1000 - Port Input

1. Stores the received port value in `ov70` and its absolute value in `ov71`.
2. Checks if any other button on the same lift is active (pose 1 or ov00 = 1).
3. If the received value is non-zero and no button is active: sends message 0 to self (re-trigger activation check).
4. If the received value is zero: resets button to idle (pose 0, ov00 = 0).

#### Event 1501 - Reset After Arrival

1. Runs in INST/LOCK mode.
2. If ov00 = 1: sends 255 on output port to signal connected buttons.
3. Sets animation to frame [0] and resets ov00 to 0.

#### Event 3 - Hit

1. Plays "hit_" sound effect.
2. Bangs port with a random value between 60-100.
3. Applies stimulus 92 to the hitting agent.

---

## Lift Car (3 1 1)

Vehicle agents that serve as the actual moving platforms. Each lift car has a cabin area for carrying creatures, up/down button parts, and a door animation. The car moves vertically with variable speed proportional to the distance to travel, picks up creatures automatically, and releases them at the destination.

### Properties

| Property | Value | Notes |
|---|---|---|
| `bhvr` | 3 | Activatable by creatures (1) + push/pull by hand (2) |
| `attr` | 12 | Mouseclickable (4) + activatable by other agents (8) |
| `clac` | -1 | Self-targeted click |
| `elas` | 0 | No elasticity |
| Sprite | `lift` frame 23 | Main vehicle sprite |

### Parts

| Part # | Type | Description |
|---|---|---|
| 0 | (Main body) | The lift car body, shows directional indicators |
| 1 | Dull | Door/gate overlay using `lift` frame 4, positioned at (0, 0) with plane 200 |
| 2 | Button | Up button using `lift` frame 16, at (52, 68), sends message 2000 |
| 3 | Button | Down button using `lift` frame 16, at (52, 82), sends message 2001 |

### Cabin

| Property | Value |
|---|---|
| `cabn` | 0 0 121 144 (left, top, right, bottom) |
| `cabw` | 5 (cabin wall width) |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov00` | Moving state: 0 = idle, 1 = in transit |
| `ov16` | Agent reference to the current destination call button |
| `ov70` | UNID of the call button that summoned this lift |
| `ov80` | Door state: 0 = open/idle, 1 = closed/moving |
| `ov99` | Agent reference to a creature passenger (for stimulus on arrival) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Creature or player pushes the up button |
| 2 | Activate 2 | Creature or player pushes the down button |
| 1500 | Called | Lift has been summoned by a call button |
| 9 | Timer | Core movement loop: loads passengers, moves lift, unloads |
| 2000 | Go Up | Finds nearest call button above and moves toward it |
| 2001 | Go Down | Finds nearest call button below and moves toward it |

#### Event 1 - Activate 1 (Up Button Pressed)

1. Runs in INST mode.
2. Checks if the activator (`from`) is a creature (family 4).
3. If a creature: applies stimulus 75 ("it is approaching", strength 0) and stores the creature reference.
4. Saves the creature reference to `ov99`.
5. Sends message 2000 to self to initiate upward travel.

#### Event 2 - Activate 2 (Down Button Pressed)

1. Identical to Event 1, but sends message 2001 to self for downward travel.

#### Event 1500 - Called by Call Button

1. Runs in INST/LOCK mode.
2. If the lift is not currently moving (`ov00 = 0`):
   - Sets `ov00` to 1 (moving).
   - Stores the calling button's UNID from `_p1_` into `ov70`.
   - Plays "clik" sound.
   - Sets tick to 1 to start the timer-based movement loop.

#### Event 9 - Timer (Core Movement Loop)

This is the main movement handler, called repeatedly via the tick timer.

**Phase 1 - Passenger Loading** (when `ov80 = 0`, doors open):
1. Locks the script.
2. Searches for nearby creatures using `etch 4 2 0`.
3. For each found creature: disables hand-holding (`nohh`), zombifies them (`zomb 1`), poses them to sitting position (pose 80, direction south), waits briefly, then forces them into the lift (`spas`). If no longer carried, un-zombifies.
4. Picks up all nearby creatures as passengers (`gpas 4 0 0 1`).
5. Plays door closing animation on part 1 (frames 7→0).
6. Sets `ov80` to 1 (doors closed, moving).

**Phase 2 - Movement Calculation**:
1. Finds the destination call button (matching `ov16 = ownr` and UNID = `ov70`).
2. Calculates relative Y distance between lift and destination button minus 20 pixels offset.
3. Sets movement speed and tick rate based on distance:
   - Distance > 200: speed 10, tick 6
   - Distance 100-200: speed 8, tick 4
   - Distance 50-100: speed 5, tick 2
   - Distance 10-50: speed 3, tick 1
   - Distance <= 10: speed 1, tick 1
4. Sets vertical velocity (`velo`) in the appropriate direction. Updates part 0 animation to show directional indicator and hides up/down buttons during travel.

**Phase 3 - Arrival** (when `va02 = 0`, distance reached):
1. Stops movement (`velo 0 0`), stops timer (`tick 0`), sets `ov80` to 0.
2. Plays door opening animation on part 1 (frames 0→7).
3. Ejects all creature passengers (`epas 4 0 0`), un-zombifies them.
4. Drops all passengers (`dpas 4 0 0`).
5. If a creature passenger was stored in `ov99`: applies stimulus 94 ("it has arrived", strength 1), then clears the reference.
6. Resets `ov00` to 0 (idle).
7. Sends message 1501 to the destination call button to reset it.
8. Plays "ding" sound effect.
9. Restores up/down button animations and re-enables creature activation (`bhvr 3`).

#### Event 2000 - Go Up

1. Runs in INST mode.
2. If activated by the pointer: plays hand animation.
3. Checks if any call buttons on this lift are already active (busy check).
4. If the lift is not busy:
   - Finds the nearest call button above the lift (negative `rely` value, closest distance > 10).
   - Sets part 0 animation to upward indicator.
   - Sends message 0 (activate) to that button to initiate the call sequence.

#### Event 2001 - Go Down

1. Runs in INST mode.
2. If activated by the pointer: plays hand animation.
3. Checks if any call buttons on this lift are already active (busy check).
4. If the lift is not busy:
   - Finds the nearest call button below the lift (positive `rely` value, closest distance > 20).
   - Sets part 0 animation to downward indicator.
   - Sends message 0 (activate) to that button to initiate the call sequence.

---

## Stimulus Effects

| Context | Stimulus # | Target | Strength | Description |
|---|---|---|---|---|
| Creature activates lift button (event 1, 3 1 1) | 75 | Activating creature | 0 | "It is approaching" |
| Lift arrives at destination (event 9) | 94 | Passenger creature | 1 | "It has arrived" |
| Call button is hit (event 3, 2 12 2) | 92 | Hitting agent | 1 | "Collision" |

## Removal Script

The `rscr` block performs a clean teardown:
1. Kills all lift cars (3 1 1) and removes their scripts (events 1, 2, 9, 1500, 2000, 2001).
2. Kills all call buttons (2 12 2) and removes their scripts (events 1, 2, 1500, 1501, 1000).
