# Camera Unit

**Source:** `Bootstrap/001 World/camera unit.cos`

## Overview

This script creates the camera surveillance system for the Creatures 3 spaceship. It sets up pairs of flying camera bugs and camera screen monitors that allow the player to remotely observe different areas of the ship. The system consists of small animated bugs that fly around autonomously and compound screen agents that display a live camera feed from the bug's perspective. Two complete camera pairs are created: one pair monitoring the lower/main areas and another monitoring the upper/peripheral areas. Camera bugs can be picked up by creatures, causing the bug to follow that creature around, effectively creating a creature-tracking camera.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 3 3 34 | [Camera Bug](#camera-bug-3-3-34) | Small flying bug that acts as a mobile camera, hovering autonomously and trackable by the camera screen |
| 3 3 33 | [Camera Screen](#camera-screen-3-3-33) | Compound monitor agent that displays a live remote view from a camera bug's position |

---

## Camera Bug (3 3 34)

A small animated flying agent that serves as a mobile camera unit. Four camera bugs are created at various locations across the ship. Each bug flies autonomously using physics-based movement, bouncing between floor and ceiling boundaries. When picked up by a creature, the bug enters a "follow" mode where it tracks the creature's position, allowing the camera screen to monitor the creature.

### Agent Properties

- **Sprite:** `cameraunit` (frames 0-11 looping animation)
- **Attributes (86):** Carryable, mouse-clickable, physics-enabled
- **Permeability:** 60
- **Timer:** Every 10 ticks

### Instance Variables

| Variable | Purpose |
|---|---|
| `ov00` | State: 0 = inactive, 1 = normal flying, 2 = following a creature |
| `ov16` | Agent reference to the creature carrying this bug (when in follow mode) |
| `ov90` | Lower floor-distance threshold for flight behavior |
| `ov91` | Upper floor-distance threshold for flight behavior |

### Initial Placements

| Bug | Position | Associated Screen |
|---|---|---|
| 1 | (5114, 1950) | Screen 1 (as `ov16` / camera A) |
| 2 | (3933, 190) | Screen 1 (as `ov17` / camera B) |
| 3 | (6678, 214) | Screen 2 (as `ov16` / camera A) |
| 4 | (2285, 2511) | Screen 2 (as `ov17` / camera B) |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 (Push) | 1 | Bug is clicked/activated |
| Activate 2 (Pull) | 2 | Bug is deactivated |
| Pickup | 5 | Bug is picked up by a creature |
| Timer | 9 | Autonomous flight behavior tick |

#### Event 1 — Activate 1 (Push)

When activated, the bug checks if any creatures exist in the world (`totl 1 2 17`). If no creatures are present, it plays a "buzz" sound and stops. Otherwise, it plays a sound effect, waits briefly, then searches all camera screens (3 3 33) to find any screen that references this bug. If found, it sends a message (event 0) to the screen to activate the camera view, and calls `cmrt 0` to reset the camera tracking on the screen.

#### Event 2 — Activate 2 (Pull)

Deactivates the bug by resetting its pose to frame 0, setting `ov00` to 0 (inactive), and clearing the click action.

#### Event 5 — Pickup

When picked up by a creature, the bug checks if a creature is currently holding it using `etch 4 0 0` (enumerating creatures in the carry range). If a creature is holding it, the bug enters follow mode (`ov00 = 2`), stores a reference to the creature in `ov16`, and widens its flight boundaries (`ov90 = 80, ov91 = 100`). If no creature is holding it, the bug returns to normal flying mode (`ov00 = 1`) with tighter boundaries (`ov90 = 40, ov91 = 60`).

#### Event 9 — Timer (Flight Behavior)

Controls the bug's autonomous flying movement:

1. **Horizontal deceleration** (non-follow mode): Gradually reduces horizontal velocity toward zero.
2. **Vertical bouncing**: Checks distance to the floor below. If too close to the floor (`obst down <= ov90`), the bug bounces upward with a random velocity of -4 to -2. If too far from the floor (`obst down >= ov91`), it gently descends with a random velocity of 1-2. If too close to the ceiling (`obst up <= 50`), it bounces downward.
3. **Creature following** (when `ov00 = 2`): The bug adjusts its horizontal velocity to stay near the creature stored in `ov16`. If the bug is left of the creature's left edge, it moves right (velocity 3-6). If right of the creature's right edge, it moves left (velocity -6 to -3). If the creature reference becomes null, the bug reverts to normal flying mode.

**Sound:** Plays a looping "cam2" sound effect during flight.

---

## Camera Screen (3 3 33)

A compound agent serving as a wall-mounted monitor that displays a live remote camera feed from one of its two associated camera bugs. The screen has a camera view part, a toggle button, and input/output ports for wiring to other agents. It alternates between two camera bug sources when the button is clicked.

### Agent Properties

- **Sprite:** `cameraunit` (shared sprite file)
- **Attributes (4):** Mouse-clickable
- **Behavior (8):** Activatable
- **Timer:** Every 2 ticks

### Compound Parts

| Part | Type | Description |
|---|---|---|
| 0 | Base | Main body of the screen agent |
| 1 | Camera (`pat: cmra`) | Camera view showing remote feed (position 88,53, size 195x159, source offset 65,53) |
| 2 | Button (`pat: butt`) | Toggle button to switch between camera bugs (position 21,117, animated) |

### Ports

| Port | Direction | Name | Description |
|---|---|---|---|
| 0 | Input | Camera Screen input | Receives messages from wired agents |
| 0 | Output | Camera Screen output | Sends messages to wired agents |

### Instance Variables

| Variable | Purpose |
|---|---|
| `ov00` | Current camera selection: 1 = viewing camera bug A (`ov16`), -1 = viewing camera bug B (`ov17`) |
| `ov16` | Agent reference to camera bug A |
| `ov17` | Agent reference to camera bug B |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 (Push) | 1 | Toggle the camera view on/off |
| Hit | 3 | Screen is hit by something |
| Timer | 9 | Update camera position to track the active bug |
| Button Click | 1000 | Switch between camera bug A and B |
| Port Input | 1001 | Handle incoming port messages |

#### Event 1 — Activate 1 (Push)

Plays a "cam1" sound, locks execution, kills the camera view part (part 1), plays a transition animation on the base part (frames 0-9), then negates `ov00` to switch the active camera (toggles between 1 and -1). Finally recreates the camera view part with the same parameters.

#### Event 3 — Hit

Plays a "hit_" sound effect, applies a random physical bang force (60-100), and sends a pain stimulus (stimulus 92, intensity 1) to the creature that hit it.

**Stimulus Impact:**
- Stimulus 92 with intensity 1 applied to the hitting creature (pain response)

#### Event 9 — Timer (Camera Tracking)

Updates the camera view position every 2 ticks to follow the currently active camera bug:

- If `ov00 = 1`: Targets camera bug A (`ov16`)
- If `ov00 = -1`: Targets camera bug B (`ov17`)

For the active bug, it reads its position, adds 50 pixels vertically to center the view, verifies the position is in a valid map room (`gmap`), and moves the camera view to that position using `cmrp`. Uses `scam` to set the camera source and `slow` to release execution.

#### Event 1000 — Button Click

Toggles between the two camera bugs. Plays a "sc_1" sound and animates the button. Based on `ov00`:
- If `ov00 = 1`: Shows camera bug A's view via `cmrt 0`
- If `ov00 = -1`: Shows camera bug B's view via `cmrt 0`

If the target camera bug no longer exists (null reference), the screen creates a replacement camera bug at its own position with default properties, then updates its reference (`ov16` or `ov17`).

#### Event 1001 — Port Input

Handles messages received through the input port. If the input value is non-zero, sends message 0 (activate) to itself. Forwards the input value through the output port using `prt: send`.

## Removal Script

The removal section (`rscr`) cleans up all camera system agents:
- Kills all camera screens (3 3 33)
- Kills all camera bugs (3 3 34)
- Removes event scripts: bug activate 1 (3 3 34 1), bug deactivate (3 3 34 2), and screen timer (3 3 33 9)
