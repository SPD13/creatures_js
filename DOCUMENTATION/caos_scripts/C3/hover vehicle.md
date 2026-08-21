# hover vehicle.cos - Hover Vehicle Transport System

**Source**: `Assets/Bootstrap/001 World/hover vehicle.cos`

## Overview

This script implements the hover vehicle transport system for the Creatures 3 world. The hover vehicle is a player-operated flying craft that can carry creatures inside its cabin. It features four directional control buttons (left, right, up, down), input/output ports for linking to other gadgets, and a separate recall button that teleports the vehicle back to its home position with a visual teleport animation.

The system consists of three agents: the main vehicle (a compound vehicle agent with a cabin and directional buttons), a visual overlay that floats relative to the vehicle and displays booster flame animations, and a stationary recall button placed near the vehicle's home position. The vehicle disables gravity when moving and uses velocity-based movement controlled by its directional buttons.

At bootstrap, one hover vehicle is created at position (1800, 400) with its recall button at (1776, 540).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 10 2 | Hover Vehicle | `hover vehicle` frame 0 | Main vehicle — carries creatures, directional buttons, port-linked | [Detail](#hover-vehicle-3-10-2) |
| 1 1 110 | Vehicle Overlay | `Hover vehicle` frame 0 | Floating visual overlay with booster flame animations | [Detail](#vehicle-overlay-1-1-110) |
| 2 12 20 | Recall Button | `hover vehicle` frame 2 | Stationary button — teleports vehicle back to home position | [Detail](#recall-button-2-12-20) |

---

## Hover Vehicle (3 10 2)

The hover vehicle is the primary transport agent. It is a compound vehicle (`vhcl`) with a cabin that can hold creatures, four directional button parts, and two sets of input/output ports. The vehicle moves by setting velocity in the direction of the pressed button, disabling gravity during flight. Creatures can enter/exit the cabin. The vehicle supports port-based linking, allowing external gadgets to send directional signals through its input ports.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Position | (1800, 400) | Starting location |
| Sprite | `hover vehicle` | Frame 0, plane 300 |
| `attr` | 716 | Suffers collisions + Carryable + Mouse clickable + Creature activate 1 & 2 |
| `bhvr` | 0 | No creature push/pull/hit behaviors |
| `clac` | -1 | Clink action: auto |
| `elas` | 0 | No elasticity (no bouncing) |
| `fric` | 100 | Maximum friction |
| `aero` | 10 | Moderate air resistance |
| `perm` | 60 | Moderate permeability |
| `cabn` | 0 0 166 106 | Cabin bounds (left, top, right, bottom) |

### Key Variables

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov00` | Movement state flag | 0 |
| `ov16` | Reference to vehicle overlay agent | Set during creation |
| `ov80` | General purpose flag | 0 |
| `ov89` | Movement speed magnitude | 10 |
| `ov90` | Timer tick interval for movement | 400 |
| `ov91` | Unknown parameter | 4 |
| `ov99` | Agent reference (unused) | null |

### Parts

| Part | Type | Sprite | Position | Description |
|---|---|---|---|---|
| 0 | Body | `hover vehicle` | — | Main vehicle body |
| 1 | Button | `hover vehicle` frame 1 | (49, 107) | Left button — sends message 2001 |
| 2 | Button | `hover vehicle` frame 3 | (104, 107) | Right button — sends message 2002 |
| 3 | Button | `hover vehicle` frame 5 | (77, 107) | Up button — sends message 2003 |
| 4 | Button | `hover vehicle` frame 7 | (77, 122) | Down button — sends message 2004 |

### Ports

| Port | Type | Index | Position | Message |
|---|---|---|---|---|
| Input 0 | `prt: inew` | 0 | (35, 117) | Triggers script 2000 (horizontal) |
| Output 0 | `prt: onew` | 0 | (132, 116) | — |
| Input 1 | `prt: inew` | 1 | (74, 144) | Triggers script 2010 (vertical) |
| Output 1 | `prt: onew` | 1 | (92, 144) | — |

### Events

| Event | Script | Description |
|---|---|---|
| 2000 | Port 0 Input | Horizontal port handler — routes negative values to left (2001), positive to right (2002) |
| 2010 | Port 1 Input | Vertical port handler — routes negative values to up (2003), positive to down (2004) |
| 2001 | Move Left | Activates left movement — sets negative horizontal velocity |
| 2002 | Move Right | Activates right movement — sets positive horizontal velocity |
| 2003 | Move Up | Activates upward movement — sets negative vertical velocity |
| 2004 | Move Down | Activates downward movement — sets positive vertical velocity |
| 124 | Drop | Drops passenger creature, starts downward velocity (gravity) |
| 125 | Pick Up | Begins upward movement to pick up |
| 9 | Timer | Stops the timer (tick 0), ending movement |

### Event Details

**Script 2000 — Horizontal Port Input**: Receives a signal value on input port 0 and forwards the output via `prt: send`. If the value is negative, triggers left movement (message 2001). If positive, triggers right movement (message 2002). This allows external gadgets linked to the vehicle's input port to control horizontal direction.

**Script 2010 — Vertical Port Input**: Receives a signal value on input port 1 and forwards the output via `prt: send`. If the value is negative, triggers upward movement (message 2003). If positive, triggers downward movement (message 2004). This allows external gadgets to control vertical direction.

**Script 2001 — Move Left**: Runs instantly (`inst`). Animates button 1 press, plays "beep" sound. Switches to the vehicle overlay and plays "bost" (booster) sound with flame animations on parts 1 and 3. Sets the timer to `ov90` (400 ticks) for auto-stop. Calculates speed as negative `ov89` (moving left), sets horizontal velocity, resets movement state, and disables gravity (`accg 0`).

**Script 2002 — Move Right**: Runs instantly. Animates button 2 press, plays "beep" sound. Activates booster animations on overlay parts 0 and 2. Sets timer, calculates speed as positive `ov89` (moving right), sets horizontal velocity, resets movement state, and disables gravity.

**Script 2003 — Move Up**: Runs instantly. Animates button 3 press, plays "beep" sound. Activates booster animations on overlay parts 0 and 1. Sets timer, calculates speed as negative `ov89` (moving up), sets vertical velocity, resets movement state, and disables gravity.

**Script 2004 — Move Down**: Runs instantly. Animates button 4 press, plays "beep" sound. Activates booster animations on overlay parts 2 and 3. Sets timer, calculates speed as positive `ov89` (moving down), sets vertical velocity, resets movement state, and disables gravity.

**Script 124 — Drop**: Runs instantly. Drops all passengers from the cabin (`dpas 4 0 0`). Sets timer to `ov90` and begins slow downward movement (`velo 0 2`) so the vehicle descends after dropping its occupant.

**Script 125 — Pick Up**: Sets timer to `ov90` and begins slow upward movement (`velo 0 -2`) to rise after a creature enters.

**Script 9 — Timer**: Stops the timer (`tick 0`), which halts the vehicle's movement after the movement duration expires.

---

## Vehicle Overlay (1 1 110)

The vehicle overlay is a compound agent that floats relative to the main hover vehicle. It provides visual booster flame animations that play when the vehicle moves in different directions. The overlay has four parts: the main body and three directional booster flame displays.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `Hover vehicle` | Frame 0, plane 200 |
| `perm` | 0 | Fully permeable (no collision) |
| `attr` | 32 | Floatable |
| `base` | 13 | Animation base frame offset |
| Float relative to | Hover vehicle (3 10 2) | Via `frel` command |
| Float offset | (28, 150) | Position relative to vehicle |

### Parts

| Part | Type | Sprite | Offset | Description |
|---|---|---|---|---|
| 0 | Dull | `Hover vehicle` frame 24 | (88, 0) | Right-side booster flame |
| 1 | Dull | `Hover vehicle` frame 35 | (-40, -36) | Left-side booster flame |
| 2 | Dull | `Hover vehicle` frame 46 | (120, -36) | Bottom booster flame |
| 3 | — | (main part) | (28, 150) | Overlay body |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov16` | Reference back to the main hover vehicle agent |

### Behavior

The overlay has no scripts of its own. Its parts are animated by the hover vehicle's movement scripts (2001-2004), which switch `targ` to the overlay via `ov16` and play booster flame animations on the appropriate parts depending on the direction of travel. The overlay automatically follows the vehicle's position due to the `frel` (float relative) linkage.

---

## Recall Button (2 12 20)

The recall button is a stationary simple agent placed near the hover vehicle's home position. When activated, it triggers a teleport sequence that returns the hover vehicle to its starting location with a visual teleport animation effect.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Position | (1776, 540) | Near vehicle home position |
| Sprite | `hover vehicle` frame 2 | 57 frames, plane 10 |
| `attr` | 4 | Creature can activate 1 |
| `clac` | 0 | No clink action |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov16` | Reference to the main hover vehicle agent |

### Events

| Event | Script | Description |
|---|---|---|
| 1 (Activate 1) | Recall | Teleports the hover vehicle back to home position |

### Event Details

**Script 1 — Activate 1 (Recall)**: Runs with lock. Animates the button press (`anim [1 1 1 0]`). Gets the hover vehicle's current position via `ov16`. Creates a temporary teleport animation agent (1 1 43, sprite "teleport") at the vehicle's current location, plays the teleport sound ("tele") and animation, waits for it to complete (`over`), then destroys the teleport effect (`kill targ`). Moves the hover vehicle back to home position (1800, 400), stops its velocity, then creates a second teleport animation at the destination to show the vehicle arriving. The teleport effect agent (1 1 43) is a temporary visual-only agent with no attributes, created and destroyed within this single script execution.

---

## Removal Script

The `rscr` section cleans up all agents created by this script:
- All hover vehicles (3 10 2)
- All vehicle overlays (1 1 110)
- All recall buttons (2 12 20)
- All teleport effect agents (1 1 43)
