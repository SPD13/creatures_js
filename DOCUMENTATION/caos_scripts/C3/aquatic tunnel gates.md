# aquatic tunnel gates.cos - Aquatic Tunnel Gate System

**Source**: `Assets/Bootstrap/001 World/aquatic tunnel gates.cos`

## Overview

This script creates two animated gates in the aquatic (marine) tunnel area of the Creatures 3 spaceship. These gates control passage through underwater tunnels by toggling door permeability between connected rooms. When a gate is closed, creatures cannot pathfind through it; when opened, the door permeability is set to 100, allowing passage.

Each gate consists of two functional parts:
- A **main gate agent** (3 3 46 or 3 3 47) that displays the gate animation and handles the initial toggle.
- A **clickable overlay agent** (3 3 48 or 3 3 49) that is created at a high plane (5000) when the gate opens, providing a click target to close the gate again.

The gates also enforce spatial safety: when toggling, they enumerate all overlapping agents and safely relocate any carryable/activatable non-pointer agents out of the gate area to prevent them from becoming stuck inside the gate geometry.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 46 | Aquatic Gate 1 (Left) | `aquatic tunnel gates` frames 0-29 | Main gate controlling passage between three rooms in the left tunnel area | [Detail](#aquatic-gate-1-left-3-3-46) |
| 3 3 47 | Aquatic Gate 2 (Right) | `aquatic tunnel gates` frames 30-59 | Main gate controlling passage between two rooms in the right tunnel area | [Detail](#aquatic-gate-2-right-3-3-47) |
| 3 3 48 | Gate 1 Overlay | `aquatic tunnel gates` frame 29 | Temporary overlay created when Gate 1 is open; clicking it closes the gate | [Detail](#gate-1-overlay-3-3-48) |
| 3 3 49 | Gate 2 Overlay | `aquatic tunnel gates` frame 59 | Temporary overlay created when Gate 2 is open; clicking it closes the gate | [Detail](#gate-2-overlay-3-3-49) |

## Door Connectivity

| Gate | Position | Connected Rooms | Room Coordinates |
|---|---|---|---|
| Gate 1 (3 3 46) | (4145, 2418) | ov70 ↔ ov71, ov70 ↔ ov72 | grap(4165,2458), grap(4106,2458), grap(4196,2390) |
| Gate 2 (3 3 47) | (5145, 2407) | ov70 ↔ ov71 | grap(5159,2447), grap(5169,2375) |

Room IDs are resolved at bootstrap time using `grap` (Get Room At Point) and stored in agent OVxx variables.

---

## Aquatic Gate 1 — Left (3 3 46)

Main gate in the left aquatic tunnel area. Controls door permeability between three rooms: the room at (4165, 2458), the room at (4106, 2458), and the room at (4196, 2390). Positioned at (4145, 2418).

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Greedy Cabin (agent acts as a cabin) |
| `tran` | 0 0 | Pixel at (0,0) defines transparency colour |
| Sprite | `aquatic tunnel gates` 30 images, first image 0 | Frames 0-14: idle loop; 15-21: opening; 22-28: closing; 29: open overlay |
| Plane | 4 | Background layer |
| `ov00` | 0 or 1 | Gate state: 0 = closed, 1 = open |
| `ov70` | Room ID | Primary room (from grap 4165 2458) |
| `ov71` | Room ID | Secondary room (from grap 4106 2458) |
| `ov72` | Room ID | Tertiary room (from grap 4196 2390) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Toggle the gate open or closed |

#### Event 1 — Activate 1 (Toggle Gate)

The script is locked (`lock`) to prevent re-entry during the animation sequence.

**When closed (ov00 = 0) — Opening sequence:**
1. Plays the "gate" sound effect.
2. Plays the opening animation (frames 15-21).
3. Creates a temporary overlay agent **3 3 48** at position (4145, 2418) with plane 5000, making it the topmost clickable element. The overlay copies the room IDs (ov70, ov71, ov72) from the parent gate.
4. Sets `ov00 = 1` (gate now open).
5. Sets door permeability to 100 between rooms ov70↔ov71 and ov70↔ov72, allowing creature passage.
6. Enumerates all agents overlapping with the gate (`etch 0 0 0`). For each overlapping agent that does NOT suffer collisions (attr bit 5 unset), IS carryable or mouseclickable (attr bits 0-1 set), and is NOT a pointer agent (family != 4): safely moves it to (4058, 2431) and plays a "move" sound. This clears the gate area.

**When open (ov00 = 1) — Closing sequence:**
1. Plays the "gate" sound effect.
2. Kills all overlay agents of type 3 3 48 (`etch 3 3 48` + `kill targ`).
3. Plays the closing animation (frames 22-28).
4. Enumerates all overlapping agents with the same safety relocation logic, moving them to (4058, 2431).
5. Waits 5 ticks.
6. Sets `ov00 = 0` (gate now closed).
7. Sets door permeability to 0 between rooms ov70↔ov71 and ov70↔ov72, blocking creature passage.

---

## Aquatic Gate 2 — Right (3 3 47)

Main gate in the right aquatic tunnel area. Controls door permeability between two rooms: the room at (5159, 2447) and the room at (5169, 2375). Positioned at (5145, 2407).

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Greedy Cabin |
| `tran` | 0 0 | Pixel at (0,0) defines transparency colour |
| Sprite | `aquatic tunnel gates` 30 images, first image 30 | Frames 0-10: idle loop; 15-21: opening; 22-28: closing; 59: open overlay |
| Plane | 4 | Background layer |
| `ov00` | 0 or 1 | Gate state: 0 = closed, 1 = open |
| `ov70` | Room ID | Primary room (from grap 5159 2447) |
| `ov71` | Room ID | Secondary room (from grap 5169 2375) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Toggle the gate open or closed |

#### Event 1 — Activate 1 (Toggle Gate)

The script is locked (`lock`) to prevent re-entry during the animation sequence.

**When closed (ov00 = 0) — Opening sequence:**
1. Plays the "gate" sound effect.
2. Plays the opening animation (frames 15-21).
3. Creates a temporary overlay agent **3 3 49** at position (5145, 2407) with plane 5000. The overlay copies room IDs (ov70, ov71) from the parent gate.
4. Sets `ov00 = 1` (gate now open).
5. Sets door permeability to 100 between rooms ov70↔ov71, allowing creature passage.
6. Enumerates all overlapping agents and safely relocates carryable/activatable non-pointer agents to (5252, 2400).

**When open (ov00 = 1) — Closing sequence:**
1. Plays the "gate" sound effect.
2. Kills all overlay agents of type 3 3 49.
3. Plays the closing animation (frames 22-28).
4. Sets `ov00 = 0` (gate now closed).
5. Enumerates all overlapping agents and safely relocates them to (5252, 2400).
6. Waits 5 ticks.
7. Sets door permeability to 0 between rooms 241↔243 (hardcoded room IDs).

**Note:** The closing sequence for Gate 2 uses hardcoded room IDs (`door 241 243 0`) on line 162 rather than the stored `ov70`/`ov71` variables used elsewhere. This appears to be an inconsistency in the original script compared to Gate 1's pattern of using stored variables.

---

## Gate 1 Overlay (3 3 48)

Temporary agent created when Aquatic Gate 1 (3 3 46) opens. Provides an alternate click target at a very high plane (5000) so the player can close the gate by clicking on it. Destroyed when the gate closes.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Greedy Cabin |
| `tran` | 0 0 | Pixel at (0,0) defines transparency colour |
| Sprite | `aquatic tunnel gates` 1 image, first image 29 | Single frame showing the open gate state |
| Plane | 5000 | Very high plane — renders on top of everything |
| `ov70-ov72` | Room IDs | Copied from parent gate 3 3 46 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Close the parent gate and destroy self |

#### Event 1 — Activate 1 (Close Gate)

1. Locks the script.
2. Plays the "gate" sound effect.
3. Targets a random instance of the parent gate 3 3 46 (`rtar 3 3 46`).
4. On the parent gate, plays closing animation (frames 22-28) and waits for it to finish (`over`).
5. Sets parent `ov00 = 0` (gate now closed).
6. Plays the idle loop animation on the parent (frames 0-14).
7. Enumerates all overlapping agents and safely relocates carryable/activatable non-pointer agents to (4058, 2431).
8. Waits 2 ticks.
9. Sets door permeability to 0 between rooms ov70↔ov71 and ov70↔ov72.
10. Kills all instances of 3 3 48 (including self).

---

## Gate 2 Overlay (3 3 49)

Temporary agent created when Aquatic Gate 2 (3 3 47) opens. Provides an alternate click target at a very high plane (5000) to close the gate. Destroyed when the gate closes.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Greedy Cabin |
| `tran` | 0 0 | Pixel at (0,0) defines transparency colour |
| Sprite | `aquatic tunnel gates` 1 image, first image 59 | Single frame showing the open gate state |
| Plane | 5000 | Very high plane — renders on top of everything |
| `ov70-ov71` | Room IDs | Copied from parent gate 3 3 47 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Close the parent gate and destroy self |

#### Event 1 — Activate 1 (Close Gate)

1. Locks the script.
2. Plays the "gate" sound effect.
3. Targets a random instance of the parent gate 3 3 47 (`rtar 3 3 47`).
4. On the parent gate, plays closing animation (frames 22-28) and waits for it to finish (`over`).
5. Sets parent `ov00 = 0` (gate now closed).
6. Plays the idle loop animation on the parent (frames 0-10).
7. Enumerates all overlapping agents and safely relocates carryable/activatable non-pointer agents to (5252, 2400).
8. Waits 5 ticks.
9. Sets door permeability to 0 between rooms ov70↔ov71.
10. Kills all instances of 3 3 49 (including self).

---

## Removal Script

The `rscr` section cleanly removes the entire gate system:
1. Kills all instances of agents 3 3 46, 3 3 47, 3 3 48, and 3 3 49.
2. Removes all event scripts (`scrx`) for all four classifiers' Activate 1 events.

## Agent Safety Relocation Logic

Both gates share the same agent safety check when toggling. The enumeration (`etch 0 0 0`) iterates over all agents whose bounding boxes overlap with the gate, then applies the following filter:

1. **Skip collision-enabled agents**: If `attr` bit 5 (value 32, "Suffer Collisions") is set, skip the agent.
2. **Must be interactive**: If `attr` bits 0-1 (value 3, "Carryable" or "Mouseclickable") are both zero, skip the agent.
3. **Must not be a pointer**: If `fmly = 4` (pointer/system agent), skip.
4. If all conditions pass, the agent is safely moved (`mvsf`) to the designated safe location and a "move" sound plays.

This prevents creatures and small objects from being trapped inside the gate geometry during open/close transitions.
