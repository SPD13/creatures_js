# Corridor Doors.cos - Inter-Area Transport Door System

**Source**: `Assets/Bootstrap/001 World/Corridor Doors.cos`

## Overview

This script creates the entire corridor door transport system for the Creatures 3 spaceship. It establishes a network of paired doors that connect the lower Engineering Corridor to each of the main terrariums and other ship areas, allowing creatures, the player, and other agents to travel between metarooms.

The system consists of four main corridor door pairs, one special airlock-style door pair, and a crypt door. Each main corridor door pair links a bottom-corridor door to an upper-area door leading to a specific terrarium. Doors are activated either by direct clicking (which triggers a paired switch panel) or by creatures. When activated, a door plays an opening animation, teleports entities to the paired door's location, transitions the camera to the destination metaroom, and then closes. Creatures receive stimulus feedback when approaching and passing through doors, reinforcing the behavior of using them.

Room links (`link` command) are established between paired door rooms, giving creatures a pathfinding route through the doors with appropriate permeability values.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 2 1 | Corridor Door 1 | `door` frame 14 | Bottom corridor door linking to Norn Terrarium | [Detail](#corridor-door-1-2-2-1) |
| 2 2 5 | Upper Door 5 | `door` frame 11 | Norn Terrarium-side door linked to Door 1 | [Detail](#upper-door-5-2-2-5) |
| 2 2 2 | Corridor Door 2 | `door` frame 14 | Bottom corridor door linking to Marine Terrarium | [Detail](#corridor-door-2-2-2-2) |
| 2 2 6 | Upper Door 6 | `door` frame 11 | Marine Terrarium-side door linked to Door 2 | [Detail](#upper-door-6-2-2-6) |
| 2 2 3 | Corridor Door 3 | `door` frame 14 | Bottom corridor door linking to Jungle Terrarium | [Detail](#corridor-door-3-2-2-3) |
| 2 2 7 | Upper Door 7 | `door` frame 11 | Jungle Terrarium-side door linked to Door 3 | [Detail](#upper-door-7-2-2-7) |
| 2 2 4 | Corridor Door 4 | `door` frame 14 | Bottom corridor door linking to Desert Terrarium | [Detail](#corridor-door-4-2-2-4) |
| 2 2 8 | Upper Door 8 | `door` frame 14 | Desert Terrarium-side door linked to Door 4 | [Detail](#upper-door-8-2-2-8) |
| 2 2 10 | Upper Airlock Door | `door` frame 12 | Upper corridor door linking to Crypt entrance | [Detail](#upper-airlock-door-2-2-10) |
| 2 2 65 | Crypt Entrance Door | `door` frame 5 | Crypt-side door linked to Upper Airlock Door | [Detail](#crypt-entrance-door-2-2-65) |
| 2 2 13 | Crypt Door | `crypt door` | Crypt area door linking to Norn Terrarium airlock | [Detail](#crypt-door-2-2-13) |
| 2 12 12 | Door Switch 12 | `door_ports` | Button panel for Corridor Door 1, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |
| 2 12 13 | Door Switch 13 | `door_ports` | Button panel for Corridor Door 2, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |
| 2 12 14 | Door Switch 14 | `door_ports` | Button panel for Corridor Door 3, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |
| 2 12 15 | Door Switch 15 | `door_ports` | Button panel for Corridor Door 4, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |
| 2 12 16 | Door Switch 16 | `nidoor` | Button panel for Upper Door 5, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |
| 2 12 17 | Door Switch 17 | `nidoor` | Button panel for Upper Door 6, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |
| 2 12 18 | Door Switch 18 | `nidoor` | Button panel for Upper Door 7, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |
| 2 12 19 | Door Switch 19 | `nidoor` | Button panel for Upper Door 8, with input/output ports | [Detail](#door-switches-2-12-12-through-2-12-19) |

## Door Pair Connectivity Map

| Pair | Corridor Door | Upper Door | Destination Metaroom | Room Link Permeability |
|---|---|---|---|---|
| 1 | 2 2 1 at (2911, 3369) | 2 2 5 at (2786, 922) | Metaroom 0 (Norn Terrarium) | 100 |
| 2 | 2 2 2 at (3254, 3369) | 2 2 6 at (354, 1830) | Metaroom 3 (Marine Terrarium) | 100 |
| 3 | 2 2 3 at (3943, 3369) | 2 2 7 at (5231, 608) | Metaroom 1 (Jungle Terrarium) | 80 |
| 4 | 2 2 4 at (4635, 3369) | 2 2 8 at (4415, 1860) | Metaroom 2 (Desert Terrarium) | 100 |
| Special | 2 2 10 at (891, 698) | 2 2 65 at (8950, 464) | Metaroom 7 (Crypt/Genetics) | 100 |
| Crypt Exit | 2 2 13 at (8948, 1070) | via 1 1 27 (Airlock) | Metaroom 0 (Norn Terrarium) | N/A |

All corridor doors (2 2 1-4) are in the lower Engineering Corridor (metaroom 4). When activated from the corridor side, the camera transitions to the destination terrarium metaroom. When activated from the terrarium side, the camera transitions back to metaroom 4.

---

## Corridor Door 1 (2 2 1)

Bottom corridor door connecting to the Norn Terrarium via Upper Door 5 (2 2 5). Positioned at (2911, 3369) in the Engineering Corridor.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures |
| `clac` | 1111 | Custom click redirects to switch |
| Sprite | `door` 14 0 | 14-frame opening animation |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Main door activation — opens, teleports, transitions to metaroom 0 |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing (reverse) |
| 1111 | Custom (Click) | Redirects click to Door Switch 12 (2 12 12) |

#### Event 1 — Activate 1 (Main Activation)

1. Locks the script to prevent re-entry.
2. Plays "open" sound effect.
3. Determines the activator type: creature (family 4) gets `stim writ 75` ("it is approaching" stimulus, strength 1).
4. Finds paired Upper Door 5 (2 2 5), saves its position as camera target (va00, va01) and teleport destination (va10, va11).
5. Tells Door 5 to open (message 1000) and tells own switch (2 12 12) to send output (message 1002).
6. Animates door opening (frames 0-13) and calculates camera center offsets.
7. Adjusts teleport destination Y by +50 pixels for ground clearance.
8. Waits for animation to complete (`over`).
9. Teleports based on activator type:
   - **Creature** (`va99=1`): Moves creature to destination with `mvft`, stops velocity. Only if creature is not carried and not held.
   - **User/Pointer** (`_p1_=0`): Enumerates all creatures (family 4) in the room via `etch`, moves uncarried/unheld ones to destination. Drops any held creature. Transitions camera to metaroom 0 via `meta 0`.
   - **Other agent** (`_p1_=1 or 2`): Moves all creatures in room to destination without camera transition.
10. Tells Door 5 to close (message 1001).
11. Gives activating creature `stim writ 95` ("it has gone through a door" stimulus, strength 1).
12. Unlocks and sends self close message (1001).

### Stimulus Impact

| Stimulus | ID | When | Effect |
|---|---|---|---|
| Approaching door | 75 | Before transport | Encourages door-using behavior |
| Gone through door | 95 | After transport | Rewards successful door use |

---

## Upper Door 5 (2 2 5)

Norn Terrarium-side door linked to Corridor Door 1. Positioned at (2786, 922). Identical behavior pattern to Door 1 but in reverse direction.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures |
| `clac` | 1111 | Custom click redirects to switch |
| Sprite | `door` 11 56 | 11-frame opening animation |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Main activation — opens, teleports, transitions to metaroom 4 (corridor) |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing (reverse) |
| 1111 | Custom (Click) | Redirects click to Door Switch 16 (2 12 16) |

#### Event 1 — Activate 1

Same pattern as Corridor Door 1 but in reverse: finds Door 1's position, teleports entities there, and transitions camera to metaroom 4 (Engineering Corridor). Uses `hhld ne from` check instead of `hhld ne targ` for creature movement validation.

---

## Corridor Door 2 (2 2 2)

Bottom corridor door connecting to the Marine Terrarium via Upper Door 6 (2 2 6). Positioned at (3254, 3369).

### Properties

Same as Door 1: `attr 4`, `bhvr 1`, `clac 1111`, sprite `door` 14 14.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens, teleports, transitions to metaroom 3 (Marine Terrarium) |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing |
| 1111 | Custom (Click) | Redirects click to Door Switch 13 (2 12 13) |

#### Event 1 — Activate 1

Identical pattern to Door 1. Teleports to Door 6's position. Camera transitions to metaroom 3 for user activation.

---

## Upper Door 6 (2 2 6)

Marine Terrarium-side door linked to Corridor Door 2. Positioned at (354, 1830).

### Properties

Same as Door 5: `attr 4`, `bhvr 1`, `clac 1111`, sprite `door` 11 56.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens, teleports, transitions to metaroom 4 (corridor) |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing |
| 1111 | Custom (Click) | Redirects click to Door Switch 17 (2 12 17) |

#### Event 1 — Activate 1

Reverse of Door 2. Teleports to Door 2's position. Camera transitions to metaroom 4. Note: references Door Switch 16 (2 12 16) for output signal rather than its own switch 17 — this appears to be a minor inconsistency in the original script.

---

## Corridor Door 3 (2 2 3)

Bottom corridor door connecting to the Jungle Terrarium via Upper Door 7 (2 2 7). Positioned at (3943, 3369).

### Properties

Same as Door 1: `attr 4`, `bhvr 1`, `clac 1111`, sprite `door` 14 28.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens, teleports, transitions to metaroom 1 (Jungle Terrarium) |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing |
| 1111 | Custom (Click) | Redirects click to Door Switch 14 (2 12 14) |

---

## Upper Door 7 (2 2 7)

Jungle Terrarium-side door linked to Corridor Door 3. Positioned at (5231, 608). This pair has a lower room link permeability of 80 (vs 100 for other pairs).

### Properties

Same pattern: `attr 4`, `bhvr 1`, `clac 1111`, sprite `door` 11 106.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens, teleports, transitions to metaroom 4 (corridor) |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing |
| 1111 | Custom (Click) | Redirects click to Door Switch 18 (2 12 18) |

#### Event 1 — Activate 1

Note: This door's script starts with `inst` before `lock`, unlike the other doors which `lock` first. Functionally the same but executes the lock atomically.

---

## Corridor Door 4 (2 2 4)

Bottom corridor door connecting to the Desert Terrarium via Upper Door 8 (2 2 8). Positioned at (4635, 3369).

### Properties

Same as Door 1: `attr 4`, `bhvr 1`, `clac 1111`, sprite `door` 14 42.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens, teleports, transitions to metaroom 2 (Desert Terrarium) |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing |
| 1111 | Custom (Click) | Redirects click to Door Switch 15 (2 12 15) |

---

## Upper Door 8 (2 2 8)

Desert Terrarium-side door linked to Corridor Door 4. Positioned at (4415, 1860).

### Properties

Same pattern: `attr 4`, `bhvr 1`, `clac 1111`, sprite `door` 14 75.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens, teleports, transitions to metaroom 4 (corridor) |
| 1000 | Custom (Remote Open) | Plays "open" sound, animates opening, triggers switch output |
| 1001 | Custom (Close) | Animates door closing |
| 1111 | Custom (Click) | Redirects click to Door Switch 19 (2 12 19) |

---

## Upper Airlock Door (2 2 10)

Special airlock-style door in the upper corridor area at (891, 698). Unlike the standard corridor doors, this door has a unique visual sequence: it opens, waits, then shows the paired door (2 2 65) opening before teleporting. Uses sprite `door` with frame offset 12/89, starting at pose 11.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures |
| `clac` | 0 | Direct click activation (no redirect to switch) |
| Sprite | `door` 12 89 | Starting pose 11 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens self, animates paired door, teleports to (8929, 581), transitions to metaroom 7 |

#### Event 1 — Activate 1

1. Locks script, plays "open" sound, disables click (`clac -1`).
2. Animates own door opening in reverse (frames 11→0, revealing passage).
3. If activator is a creature, applies `stim writ 75` (approaching stimulus) and waits 10 ticks.
4. Waits 20 ticks for visual effect.
5. Animates own door closing (frames 0→11) while opening paired door 2 2 65 (frames 0→4).
6. Saves paired door's position for camera centering.
7. Teleports entities to hardcoded destination **(8929, 581)** near the Crypt area:
   - Uses `tmvf` to test if target position is valid before `mvft`; falls back to `mvsf` if blocked.
   - User activation: moves all creatures in room, drops held creature, transitions to **metaroom 7**.
   - Creature activation: moves creature directly.
8. Closes paired door 2 2 65 (frames 4→0), re-enables click (`clac 0`).
9. Applies `stim writ 95` (gone through door stimulus) to creature activators.

---

## Crypt Entrance Door (2 2 65)

Crypt-side door paired with Upper Airlock Door (2 2 10). Positioned at (8950, 464). Uses sprite `door` with frame offset 5/101. Same airlock-style visual pattern as Door 10.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures |
| `clac` | 0 | Direct click activation |
| Sprite | `door` 5 101 | 5-frame opening animation |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens self, animates paired door 10, teleports to (938, 804), transitions to metaroom 0 |

#### Event 1 — Activate 1

Mirror of Door 10's behavior. Opens self (frames 0→4), applies creature stimulus, waits, then opens Door 10 (frames 11→0). Teleports to hardcoded **(938, 804)** near the upper corridor. User activation transitions to **metaroom 0** (Norn Terrarium area). Closes Door 10 and self, re-enables click.

---

## Crypt Door (2 2 13)

A unique door in the Crypt area at (8948, 1070) that connects directly to the Norn Terrarium via the airlock agent (1 1 27). Uses a distinct "crypt door" sprite and "cd_1" sound effect. Unlike other doors, this one does not have a direct paired door — instead it animates the Norn Terrarium airlock (1 1 27) and teleports entities to its location.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures |
| `clac` | 0 | Direct click activation |
| Sprite | `crypt door` 0 0 | 6-frame animation |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Opens crypt door, opens Norn Terrarium airlock (1 1 27), teleports to terrarium |

#### Event 1 — Activate 1

1. Locks script, plays "cd_1" sound, disables click (`clac -1`).
2. Animates crypt door opening (frames 0→5).
3. Creature activators receive `stim writ 75` (approaching stimulus).
4. Waits 10 ticks, then animates door closing (frames 4→0).
5. Targets airlock agent **1 1 27**: animates part 0 (background, frame 1) and part 1 (iris opening, frames 0→9).
6. Saves airlock position as both camera target and teleport destination.
7. Teleports based on activator:
   - **User/Pointer**: Moves all creatures in room to airlock position, drops held creature, transitions to **metaroom 0**, then focuses camera on `game "c3_default_focus"` with `game "c3_default_focus_part"`.
   - **Creature**: Moves creature directly to airlock position.
8. Closes airlock: animates part 1 closing (frames 9→0) with `frat 4` (frame rate 4), waits, resets part 0 (frame 0).
9. Re-enables click (`clac 0`).
10. Creature activators receive `stim writ 95` (gone through door stimulus).

---

## Door Switches (2 12 12 through 2 12 19)

Door switches are compound agents that act as button panels adjacent to each door. They provide visual feedback when activated and integrate with the CAOS port system for wiring to other gadgets.

There are two visual types:
- **`door_ports`** (2 12 12-15): Switches in the bottom corridor, paired with doors 2 2 1-4.
- **`nidoor`** (2 12 16-19): Switches in the upper terrarium areas, paired with doors 2 2 5-8.

### Switch-to-Door Mapping

| Switch | Sprite | Position | Paired Door | Door Position |
|---|---|---|---|---|
| 2 12 12 | `door_ports` | (3073, 3428) | 2 2 1 | (2911, 3369) |
| 2 12 13 | `door_ports` | (3416, 3428) | 2 2 2 | (3254, 3369) |
| 2 12 14 | `door_ports` | (4105, 3428) | 2 2 3 | (3943, 3369) |
| 2 12 15 | `door_ports` | (4797, 3428) | 2 2 4 | (4635, 3369) |
| 2 12 16 | `nidoor` | (3085, 998) | 2 2 5 | (2786, 922) |
| 2 12 17 | `nidoor` | (617, 1902) | 2 2 6 | (354, 1830) |
| 2 12 18 | `nidoor` | (5585, 701) | 2 2 7 | (5231, 608) |
| 2 12 19 | `nidoor` | (4365, 1929) | 2 2 8 | (4415, 1860) |

### Port System

Each door switch has one input port and one output port:

| Port | Type | Name | Description |
|---|---|---|---|
| Input 0 | Input (1001) | "Activate Door" / "Door switch activate" | Receives signal to activate paired door |
| Output 0 | Output | "Door output" / "Door switch throughport" | Sends high signal (255) when door opens |

### Events (Common to all switches)

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Button pressed — determines activator type, sends activate to paired door |
| 1000 | Custom (Reset) | Resets button animation to idle loop |
| 1001 | Custom (Input Port) | Input port triggered — if signal >= 128, activates paired door |
| 1002 | Custom (Output Send) | Sends value 255 (high) on output port 0 |

#### Event 1 — Activate 1 (Button Press)

1. Locks script.
2. Animates button part 1 (frames 0→1, looping via 255 terminator).
3. Determines activator type by checking `from`:
   - `from eq pntr` (or `targ = from`): User click → `va00 = 0`
   - `from` is creature (family 4): → `va00 = 1`
   - `from` is other agent: → `va00 = 2`
4. Sends `mesg wrt+ [paired door] 0 va00 0 0` — activates the paired door with `_p1_` set to the activator type.
5. Sends self message 1000 to reset the button animation.

#### Event 1001 — Input Port Trigger

Receives input from a connected port. If the signal value (`_p1_`) is >= 128 (high), activates the paired door with the same activator-type detection logic as Event 1.

#### Event 1002 — Output Port Send

Sends value 255 (high signal) on output port 0. This is triggered by the paired door when it opens, allowing daisy-chaining with other gadgets.

---

## Removal Script

The `rscr` section cleanly removes all agents created by this script by enumerating and killing each classifier: all doors (2 2 1-8, 10, 13, 65), all switches (2 12 12-19).
