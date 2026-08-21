# ettin accessways.cos - Ettin Area Inter-Terrarium Transport Doors

**Source**: `Assets/Bootstrap/001 World/ettin accessways.cos`

## Overview

This script creates a set of four transport doors that provide direct pathways between the Jungle Terrarium (Ettin home, metaroom 1) and two adjacent terrariums: the Desert Terrarium (metaroom 3) and the Marine Terrarium (metaroom 2). Unlike the main Corridor Doors system which routes all travel through the Engineering Corridor (metaroom 4), these Ettin accessways offer shortcut passages specifically through the Ettin living areas, allowing Ettins and other creatures to move between terrariums without traversing the central corridor.

The doors are organized into two linked pairs. Each pair connects two doors in different metarooms with a room link (`link`) that enables creature pathfinding between them. When activated, a door plays an opening animation on both itself and its paired door, teleports any carried or nearby creatures to the destination, transitions the camera to the destination metaroom (when the player activates the door), and provides stimulus feedback to creatures passing through.

## Created Agents

| Classifier | Name | Sprite | Position | Description | Detail |
|---|---|---|---|---|---|
| 2 2 16 | Ettin Door 16 | `ettin_doors` frame 4 | (1598, 2476) | Desert Terrarium side door, linked to Door 18 in Jungle | [Detail](#ettin-door-16-2-2-16) |
| 2 2 18 | Ettin Door 18 | `ettin_doors` frame 8 | (6130, 705) | Jungle Terrarium side door, linked to Door 16 in Desert | [Detail](#ettin-door-18-2-2-18) |
| 2 2 19 | Ettin Door 19 | `ettin_doors` frame 12 | (5584, 955) | Jungle Terrarium side door, linked to Door 17 in Marine | [Detail](#ettin-door-19-2-2-19) |
| 2 2 17 | Ettin Door 17 | `ettin_doors` frame 0 | (4481, 2335) | Marine Terrarium side door, linked to Door 19 in Jungle | [Detail](#ettin-door-17-2-2-17) |

## Door Pair Connectivity Map

| Pair | Door A | Door B | Connects | Room Link Permeability |
|---|---|---|---|---|
| 1 | 2 2 16 at (1598, 2476) | 2 2 18 at (6130, 705) | Desert Terrarium (metaroom 3) ↔ Jungle Terrarium (metaroom 1) | 80 |
| 2 | 2 2 19 at (5584, 955) | 2 2 17 at (4481, 2335) | Jungle Terrarium (metaroom 1) ↔ Marine Terrarium (metaroom 2) | 100 |

---

## Ettin Door 16 (2 2 16)

Desert Terrarium side of the Desert–Jungle passage. Located at (1598, 2476). When activated, teleports entities to (6155, 803) near its paired Door 18 in the Jungle Terrarium and transitions the camera to metaroom 1.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures (activate 1) |
| `clac` | 0 | No click redirect |
| Sprite | `ettin_doors` 4 4 3 | First image 4, 4 frames, plane 3 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Main door activation — opens, teleports to Jungle Terrarium |

#### Event 1 — Activate 1

1. Locks the script to prevent re-entry.
2. If the activator is a creature (family 4), applies **stimulus 75** (approaching/waiting, strength 1) then waits 10 ticks.
3. Plays "open" sound effect and disables click action (`clac -1`).
4. Animates door opening (frames 0→3).
5. Finds paired Door 18 (`rtar 2 2 18`) and plays its closing animation (frames 3→0).
6. Records own position (va00, va01) and paired door position (va12, va13).
7. **If activated by the player (pointer)**:
   - Calculates camera offset from half window size.
   - Enumerates all carried creatures (`etch 4 0 0`): drops each, attempts `mvft` then `mvsf` to (6155, 803), zeros velocity.
   - Drops any held creature (`hhld`).
   - Transitions camera to **metaroom 1** (Jungle Terrarium) using the `c3_meta_transition` game variable for transition style.
8. **If activated by a creature**:
   - Drops the creature, teleports it to (6155, 803) via `mvft`/`mvsf`, zeros velocity.
9. Plays closing animation on paired Door 18 and on itself (frames 3→0).
10. Re-enables click action (`clac 0`).
11. If the activator is a creature, applies **stimulus 95** (travelled through meta door, strength 1) then waits 10 ticks.

### Stimulus Impact

| Stimulus | When | Effect |
|---|---|---|
| 75 (Wait/Approaching) | Before teleport | Reinforces approaching door behavior |
| 95 (Travelled Through Meta Door) | After teleport | Reinforces door-travel behavior |

---

## Ettin Door 18 (2 2 18)

Jungle Terrarium side of the Desert–Jungle passage. Located at (6130, 705). When activated, teleports entities to (1629, 2587) near its paired Door 16 in the Desert Terrarium and transitions the camera to metaroom 3.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures (activate 1) |
| `clac` | 0 | No click redirect |
| Sprite | `ettin_doors` 4 8 3 | First image 8, 4 frames, plane 3 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Main door activation — opens, teleports to Desert Terrarium |

#### Event 1 — Activate 1

1. Locks the script to prevent re-entry.
2. If the activator is a creature (family 4), applies **stimulus 75** (strength 1) then waits 10 ticks.
3. Plays "open" sound effect and disables click action (`clac -1`).
4. Animates door opening (frames 0→3), waits for animation to complete (`over`).
5. Finds paired Door 16 (`rtar 2 2 16`) and plays its closing animation (frames 3→0).
6. Records own position (va00, va01) and paired door position (va12, va13).
7. **If activated by the player (pointer)**:
   - Calculates camera offset from half window size.
   - Enumerates all carried creatures: drops each, teleports to (1629, 2587), zeros velocity.
   - Drops any held creature.
   - Transitions camera to **metaroom 3** (Desert Terrarium) using `c3_meta_transition`.
8. **If activated by a creature**:
   - Drops the creature, teleports to (1629, 2587), zeros velocity.
9. Plays closing animation on paired Door 16 and on itself (frames 3→0).
10. Re-enables click action (`clac 0`).
11. If the activator is a creature, applies **stimulus 95** (strength 1) then waits 10 ticks.

### Stimulus Impact

| Stimulus | When | Effect |
|---|---|---|
| 75 (Wait/Approaching) | Before teleport | Reinforces approaching door behavior |
| 95 (Travelled Through Meta Door) | After teleport | Reinforces door-travel behavior |

---

## Ettin Door 19 (2 2 19)

Jungle Terrarium side of the Jungle–Marine passage. Located at (5584, 955). When activated, teleports entities to (4508, 2438) near its paired Door 17 in the Marine Terrarium and transitions the camera to metaroom 2.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures (activate 1) |
| `clac` | 0 | No click redirect |
| Sprite | `ettin_doors` 4 12 3 | First image 12, 4 frames, plane 3 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Main door activation — opens, teleports to Marine Terrarium |

#### Event 1 — Activate 1

1. Locks the script to prevent re-entry.
2. If the activator is a creature (family 4), applies **stimulus 75** (strength 1) then waits 10 ticks.
3. Plays "open" sound effect and disables click action (`clac -1`).
4. Animates door opening (frames 0→3).
5. Finds paired Door 17 (`rtar 2 2 17`) and plays its closing animation (frames 3→0).
6. Records own position (va00, va01) and paired door position (va12, va13, with 50 added to va13).
7. **If activated by the player (pointer)**:
   - Calculates camera offset from half window size.
   - Enumerates all carried creatures: drops each, teleports to (4508, 2438), zeros velocity.
   - Drops any held creature.
   - Transitions camera to **metaroom 2** (Marine Terrarium) using `c3_meta_transition`.
8. **If activated by a creature**:
   - Drops the creature, offsets Y by 50 pixels, teleports to (4508, 2438), zeros velocity.
9. Plays closing animation on paired Door 17 and on itself (frames 3→0).
10. Re-enables click action (`clac 0`).
11. If the activator is a creature, applies **stimulus 95** (strength 1) then waits 10 ticks.

### Stimulus Impact

| Stimulus | When | Effect |
|---|---|---|
| 75 (Wait/Approaching) | Before teleport | Reinforces approaching door behavior |
| 95 (Travelled Through Meta Door) | After teleport | Reinforces door-travel behavior |

---

## Ettin Door 17 (2 2 17)

Marine Terrarium side of the Jungle–Marine passage. Located at (4481, 2335). When activated, teleports entities to (5609, 1054) near its paired Door 19 in the Jungle Terrarium and transitions the camera to metaroom 1.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable by creatures (activate 1) |
| `clac` | 0 | No click redirect |
| Sprite | `ettin_doors` 4 0 3 | First image 0, 4 frames, plane 3 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Main door activation — opens, teleports to Jungle Terrarium |

#### Event 1 — Activate 1

1. Locks the script to prevent re-entry.
2. If the activator is a creature (family 4), applies **stimulus 75** (strength 1) then waits 10 ticks.
3. Plays "open" sound effect and disables click action (`clac -1`).
4. Animates door opening (frames 0→3).
5. Finds paired Door 19 (`rtar 2 2 19`) and plays its closing animation (frames 3→0).
6. Records own position (va00, va01) and paired door position (va12, va13).
7. **If activated by the player (pointer)**:
   - Calculates camera offset from half window size.
   - Enumerates all carried creatures: drops each, teleports to (5609, 1054), zeros velocity.
   - Drops any held creature.
   - Transitions camera to **metaroom 1** (Jungle Terrarium) using `c3_meta_transition`.
8. **If activated by a creature**:
   - Drops the creature, teleports to (5609, 1054), zeros velocity.
9. Plays closing animation on paired Door 19 and on itself (frames 3→0).
10. Re-enables click action (`clac 0`).
11. If the activator is a creature, applies **stimulus 95** (strength 1) then waits 10 ticks.

### Stimulus Impact

| Stimulus | When | Effect |
|---|---|---|
| 75 (Wait/Approaching) | Before teleport | Reinforces approaching door behavior |
| 95 (Travelled Through Meta Door) | After teleport | Reinforces door-travel behavior |

---

## Removal Script

The `rscr` section cleanly removes all four Ettin accessway doors (`enum 2 2 16/17/18/19` → `kill targ`) and unregisters their event scripts (`scrx 2 2 16/17/18/19 1`).
