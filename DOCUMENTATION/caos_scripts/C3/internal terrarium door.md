# internal terrarium door.cos - Internal Terrarium Door with Wired Switch

**Source**: `Assets/Bootstrap/001 World/internal terrarium door.cos`

## Overview

This script creates a single internal door within the Norn Terrarium that separates two adjacent rooms. Unlike the corridor-to-terrarium doors (documented in `Corridor Doors.md`), this door exists entirely within one terrarium and controls passage between two side-by-side rooms.

The system consists of three agents working together:
1. A **door switch panel** (2 12 1) — a compound agent with a clickable button and CAOS wiring ports, allowing integration with the port-based wiring system.
2. A **visible door** (2 2 9) — the actual door that opens and closes with animation, controlling room permeability and creature navigation links.
3. An **invisible trigger** (also 2 2 9, using the "blnk" sprite) — positioned near the door on one side, it acts as a one-way creature sensor that detects creatures approaching from that direction and relays their activation to the real door.

The door starts in the **open** state (ov00 = 1) with full room permeability (100). When creatures push the invisible trigger from the correct side, they receive stimulus 96 as they pass through. The switch panel can be activated directly (click) or driven remotely via its input port, and it passes through signals on its output port for daisy-chaining.

Room permeability (`door` command) and creature navigation links (`link` command) are updated inversely: when the door is physically open, the navigation link is set to 0 (creatures don't need to specifically pathfind through an open door); when physically closed, the link is set to 100 (creatures know they can path through by activating the door).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 12 1 | Door Switch Panel | `nidoor` frames 4-10 | Compound agent with clickable button and input/output wiring ports | [Detail](#door-switch-panel-2-12-1) |
| 2 2 9 | Internal Terrarium Door | `nidoor` frames 0-6 | Visible door that controls room permeability between two adjacent rooms | [Detail](#internal-terrarium-door-2-2-9) |
| 2 2 9 | Invisible Door Trigger | `blnk` frame 0 | Invisible agent positioned near the door to detect creature approaches from one side | [Detail](#invisible-door-trigger-2-2-9-blnk) |

---

## Door Switch Panel (2 12 1)

A compound agent that serves as the control interface for the internal door. It features a clickable button (part 1) with animated indicator states and two CAOS wiring ports for integration with other gadgets.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| Sprite (body) | `nidoor` first_image=4, 7 images | Switch panel body |
| Sprite (button, part 1) | `nidoor` first_image=8, 3 images | Animated button with 3 states (idle, open-blink, close-blink) |
| Position | (1269, 710) | In the Norn Terrarium |
| Input Port 0 | "Door switch activate" | Range 12-23, message 1000 |
| Output Port 0 | "Door switch throughport" | Range 12-36, pass-through signal |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Button clicked — plays sound and forwards activation to door |
| 1000 | Custom (Port Input / Relay) | Receives input signal and conditionally toggles the door state |

#### Event 1 — Activate 1 (Button Click)

1. Plays the "bp_1" (button press) sound effect.
2. Finds a random Internal Terrarium Door agent (2 2 9) using `rtar`.
3. If found, sends message 1000 to it to trigger its state evaluation.

#### Event 1000 — Port Input / Relay

Handles input from the wiring system or relayed messages. Evaluates the door's current state against the input signal to decide whether to toggle:

1. Reads `_p1_` (input signal value) into va00.
2. Finds a random 2 2 9 agent.
3. **If signal is non-zero AND door is closed** (ov00 = 0): sends message 0 (Deactivate) to the door.
4. **If signal is zero AND door is open** (ov00 = 1): sends message 1 (Activate 1) to the door, triggering the open sequence.
5. Passes the signal value through on output port 0 via `prt: send`.

### Button Animation States

The button (part 1) uses three poses from the `nidoor` sprite to indicate door state:
- **Pose 0**: Idle/neutral indicator
- **Pose 1**: Door-open indicator
- **Pose 2**: Door-closed indicator

Animation patterns:
- **Door opening**: Blinks `[0 1 0 1 0 1]` then settles to slow alternation between 0 and 1
- **Door closing**: Blinks `[0 2 0 2 0 2]` then settles to slow alternation between 0 and 2

---

## Internal Terrarium Door (2 2 9)

The visible door agent that physically separates two adjacent rooms within the Norn Terrarium. It controls room permeability via the `door` command and creature navigation via the `link` command.

### Properties

| Property | Value | Notes |
|---|---|---|
| `bhvr` | 1 | Activatable by creatures |
| Sprite | `nidoor` 7 frames, plane 8000 | 7-frame open/close animation |
| Position | (1208, 714) | In the Norn Terrarium |
| `ov00` | 1 (initial) | Door state: 1 = open, 0 = closed |
| `ov10` | null | Linked door reference (null = this is the real door, not the relay) |
| `ov20` | ref to invisible trigger | Reference to the paired invisible trigger agent |

### Room Permeability Logic

On creation, the door identifies two rooms:
- `va02` = the room the door is in (`room targ`)
- `va03` = the room to the right of the door (`grid targ rght`)

These two rooms are managed inversely:

| Door State | `door` Permeability | `link` Permeability | Meaning |
|---|---|---|---|
| Open (ov00 = 1) | 100 (passable) | 0 (no pathfinding link) | Creatures can walk through freely; no need to pathfind specifically |
| Closed (ov00 = 0) | 0 (blocked) | 100 (pathfinding link active) | Physically blocked but creatures know they can activate to pass through |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Door is activated — opens the door with animation and updates room permeability |
| 2 | Activate 2 | Closes the door, pushes nearby agents away, updates room permeability |
| 1000 | Custom (State Toggle) | Evaluates current state and sends self the appropriate open/close message |

#### Event 1 — Activate 1 (Open Door)

Only executes on the real door (ov10 = null). If the invisible trigger receives this event, it relays to the real door instead.

1. Plays the "dr_o" (door open) sound effect.
2. Animates the door opening: `[6 5 4 3 2 1 0]`.
3. Sets `ov00 = 1` (open state).
4. **Creature stimulus**: If the activation came from the invisible trigger (`from` = ov20) and the activator (`_p1_`) is a creature (family 4), applies **stimulus 96** with strength 1 to the creature.
5. Sets room door permeability to 100 (open passage).
6. Sets room navigation link to 0 (no explicit pathfinding link needed while open).
7. Finds the switch panel (2 12 1) and animates its button: blink pattern `[0 1 0 1 0 1]`, then steady indicator `[0 0...0 1 1...1 255]`.

**Stimulus Impact**:
| Stimulus | ID | Strength | Description |
|---|---|---|---|
| Stimulus 96 | 96 | 1 | Applied to creatures passing through via the invisible trigger side |

#### Event 2 — Activate 2 (Close Door)

Closes the door and pushes away any nearby agents to prevent trapping.

1. Plays the "dr_c" (door close) sound effect.
2. **Agent push-away**: Generates a random horizontal velocity (±30 pixels/sec). Enumerates all touching agents and applies velocity:
   - **Family 2** (simple/compound objects, excluding self): horizontal ±30, vertical -10
   - **Family 3** (pointer/vehicle agents): horizontal ±30, vertical -10
   - **Family 4** (creatures): horizontal ±30, vertical **-100** (much stronger upward push to clear the doorway)
3. Animates the door closing: `[0 1 2 3 4 5 6]`.
4. Sets `ov00 = 0` (closed state).
5. Finds the switch panel (2 12 1) and animates its button: blink pattern `[0 2 0 2 0 2]`, then steady indicator `[0 0...0 2 2...2 255]`.
6. Sets room door permeability to 0 (blocked passage).
7. Sets room navigation link to 100 (creatures can pathfind through by activating).

#### Event 1000 — State Toggle

Handles relay from the switch or other sources. Blank agents forward this message to the real door.

1. If `ov10` is not null (this is the invisible trigger): forwards message 1000 to the real door via `mesg writ`, then stops.
2. If `ov00 = 0` (closed): sends message 0 (Deactivate) to self.
3. If `ov00 = 1` (open): sends message 1 (Activate 1) to self, re-triggering the open sequence.

---

## Invisible Door Trigger (2 2 9, "blnk")

An invisible simple agent placed near the visible door. It shares the same classifier (2 2 9) as the real door, so it shares the same event scripts. The `ov10` flag distinguishes it: if `ov10` is not null, the agent acts as a relay rather than a door.

### Properties

| Property | Value | Notes |
|---|---|---|
| `bhvr` | 1 | Activatable by creatures |
| Sprite | `blnk` 0 0, plane 8000 | Invisible (blank sprite) |
| Position | (1220, 750) | Slightly offset from the visible door |
| `ov10` | ref to real door | Reference to the paired visible door agent |

### Purpose

The invisible trigger serves as a **one-way creature sensor**. When a creature activates it (pushes it), the trigger's Activate 1 handler detects that `ov10` is set and relays the activation to the real door as `mesg wrt+ ov10 0 from 0 0`. The `from` parameter carries the creature reference, allowing the real door's handler to identify the activator.

Similarly, when message 1000 arrives (from the switch panel finding a random 2 2 9), the trigger forwards it to the real door.

This design allows the door to detect creatures approaching from a specific direction and apply the appropriate stimulus when they pass through.

---

## Removal Script

The removal script (`rscr`) cleans up all agents and scripts:

1. Enumerates and kills all 2 2 9 agents (door + invisible trigger).
2. Enumerates and kills all 2 12 1 agents (switch panel).
3. Removes scripts: `scrx 2 12 1 1` and `scrx 2 12 1 2`.
