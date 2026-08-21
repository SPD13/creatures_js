# all Engineering airlock.cos - Engineering Airlock System

**Source**: `Assets/Bootstrap/001 World/all Engineering airlock.cos`

## Overview

This script implements the full Engineering Airlock system in the lower Engineering area of the Creatures 3 spaceship. It creates a multi-stage airlock consisting of two doors (an inner center door and an outer left door), a warning alarm/light indicator, a light control button, and a main airlock control panel with a countdown display.

The airlock simulates a pressurized chamber separating the ship interior from the vacuum of space. The system operates through an interconnected network of agents communicating via CAOS messages and output ports:

1. The player presses the **Airlock Control Panel** (2 12 11) to initiate the airlock cycle.
2. A **10-step countdown** begins, displayed on the control panel's digit display (part 1).
3. During countdown: the **alarm** (1 1 50) sounds, lighting changes, and the **center door** (2 2 15) opens.
4. When the countdown reaches zero, the **left/outer door** (2 2 14) opens. Agents near the alarm are ejected with velocity simulating decompression.
5. The player can press the control panel again to close. A **3-step countdown** runs, after which the left door closes (destroying anything caught in it), then the center door closes, and the alarm silences.

This script also references agents from `airlock agent.cos` — specifically the airlock hazard agents (1 1 39) whose timer scan rate is adjusted when the outer door opens or closes, and dust cloud/bone particle effects (1 1 46) spawned when agents are destroyed during door closure.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 2 14 | Left/Outer Airlock Door | `engineering airlock` (10 frames) | Outer door that opens to space; toggles room permeability and link | [Detail](#leftouter-airlock-door-2-2-14) |
| 1 1 50 | Alarm/Light Indicator | `engineering airlock` (2 frames, offset 10) | Warning light that loops alarm sound; handles agent ejection and destruction | [Detail](#alarmlight-indicator-1-1-50) |
| 2 2 15 | Center/Inner Airlock Door | `engineering airlock` (7 frames, offset 23) | Inner door separating airlock chamber from ship interior; links rooms on both sides | [Detail](#centerinner-airlock-door-2-2-15) |
| 2 12 10 | Light Button | `airlock buttons` (7 frames) | Simple button controlling airlock lighting and center door activation | [Detail](#light-button-2-12-10) |
| 2 12 11 | Airlock Control Panel | `airlock buttons` (compound, 18 frames) | Main control panel with countdown display and activation button for the full airlock cycle | [Detail](#airlock-control-panel-2-12-11) |

---

## Left/Outer Airlock Door (2 2 14)

The outer airlock door positioned at the left side of the airlock chamber. When activated, it opens to expose the airlock to space. It manages room door permeability and creature pathfinding links to control passage. On opening, it activates the airlock hazard agents (1 1 39) for frequent scanning; on closing, it slows them back down.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `engineering airlock` | 10 images, first image 0, 6 planes |
| Position | (5464, 4109) | Left side of the Engineering airlock |
| `attr` | 4 | Mouseclickable |
| `perm` | 60 | Moderate physical permeability |
| `clac` | 0 | Default click action |
| `elas` | 10 | Low elasticity |
| `aero` | 5 | Air resistance |
| `accg` | 4 | Gravitational acceleration |
| `ov70` | 255 | Light level (fully lit) |
| Animation | [0] | Initial closed frame |
| Room Link | Right side linked at permeability 100 | Creatures can initially pathfind through |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Door state: 0 = closed, 1 = open |
| `ov70` | Light level (255 = lit, 0 = dark) |

### Events

| Event | Number | Description |
|---|---|---|
| Custom (Toggle) | 1000 | Opens or closes the outer door; manages room links and airlock agent scanning |
| Custom (Hold Open) | 1001 | Waits for animation to complete, then displays the open frame |
| Timer | 9 | Periodically sends ov70 light level to the Airlock Control Panel (2 12 11) |

#### Event 1000 — Toggle Door

**Opening** (ov00 = 0):
1. Sets `ov00 = 1`, plays "dor1" sound.
2. Animates the door opening: frames [1 2 3 4 5 6 7 8].
3. Calculates room IDs using `grap` and `grid` for the right-side room boundary.
4. Sets `door` permeability to 100 (physically passable) and `link` to 0 (blocks creature pathfinding to prevent creatures from walking into space).
5. Sends message 1001 to the alarm (1 1 50) — triggers agent ejection.
6. Enables all airlock agents (1 1 39) with `tick 1` for rapid hazard scanning.
7. Waits for animation (`over`), then sets own `tick 60` to periodically send light level updates.

**Closing** (ov00 ≠ 0):
1. Sends message 1002 to the alarm (1 1 50) — triggers agent destruction of anything caught in the airlock.
2. Sets `ov00 = 0`, plays "dor1" sound.
3. Animates the door closing: frames [8 7 6 5 4 3 2 1 0].
4. Sets `door` permeability to 0 (physically blocked) and `link` to 100 (restores creature pathfinding).
5. Waits for animation (`over`).
6. Slows down airlock agents (1 1 39) with `tick 250`.

#### Event 1001 — Hold Open

Waits for any pending animation (`over`), then sets frame to [1] (open state).

#### Event 9 — Timer

Sends a message 1000 to the Airlock Control Panel (2 12 11) with the current `ov70` (light level) as parameter `_p1_`. This keeps the control panel synchronized with the door's light state.

---

## Alarm/Light Indicator (1 1 50)

A warning indicator positioned inside the airlock chamber. It toggles an alarm sound and visual state, and is also responsible for ejecting or destroying agents when the airlock doors operate. It uses the same `engineering airlock` sprite sheet (frames 10-11).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `engineering airlock` | 2 images, first image 10, 2 planes |
| Position | (5492, 4127) | Inside the airlock chamber |
| `attr` | 4 | Mouseclickable |
| `perm` | 60 | Moderate physical permeability |
| `ov70` | 255 | Light level |
| Animation | [1] | Initial frame (inactive) |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Alarm state: 0 = off, 1 = on |
| `ov01` | Counter incremented each time event 1002 fires |

### Events

| Event | Number | Description |
|---|---|---|
| Custom (Toggle Alarm) | 1000 | Toggles alarm sound and visual indicator on/off |
| Custom (Eject Agents) | 1001 | Ejects overlapping agents with velocity when outer door opens |
| Custom (Destroy Agents) | 1002 | Destroys agents caught in the airlock when outer door closes |

#### Event 1000 — Toggle Alarm

Toggles the alarm on or off:
- **Activating** (ov00 = 0): Plays looping "alrm" sound (`sndl`), shows frame [0] (active indicator), sets `ov00 = 1`.
- **Deactivating** (ov00 ≠ 0): Fades out sound (`fade`), shows frame [1] (inactive indicator), sets `ov00 = 0`.

#### Event 1001 — Eject Agents (Decompression)

Triggered when the outer door opens, simulating decompression:
1. Runs in `inst` mode. Plays "poyy" sound.
2. Enumerates all touching agents (`etch 0 0 0`).
3. For each overlapping agent (not null, not held by inventory):
   - **Creatures (family 4)**: Calls `dead` to trigger the death state.
   - **Other agents**: Checks `attr` bit 32 (invulnerable) — skips if set. Checks `attr` bits 0+1 (physics-enabled) — if set, ejects the agent with `velo -50 -20` (leftward and upward), setting `aero 0`, `fric 0`, `elas 100` to simulate being sucked into space.

#### Event 1002 — Destroy Agents (Door Closure)

Triggered when the outer door closes, crushing anything in the airlock:
1. Runs in `inst`/`lock` mode. Increments `ov01` counter.
2. Enumerates all touching agents (`etch 0 0 0`).
3. Filters:
   - Skips null targets and agents held by inventory.
   - Skips agents without physics (`attr` bits 0+1 = 0).
   - Skips self (`targ <> ownr`), agents being carried (`carr = null`).
   - Skips family 1 agents (scenery/GUI).
   - Skips family 2, genus 1 agents (simple critters/seeds).
4. **Creatures (family 4)**: Sets `velo 0 -10`, records position, calls `dead` then `kill targ`. Sets `va66 = 1` to flag bone particle creation.
5. **Other destroyable agents**: Records position, calls `kill targ`. Sets `va66 = 0`.
6. **Spawns dust cloud particles**: Creates 10 dust cloud agents (1 1 46, sprite "dust cloud") at the destroyed agent's position with random velocities, light gravity (0.1), full elasticity, 4-frame animation, self-destructing after 30-40 ticks.
7. **Spawns bone particles** (creatures only, va66 = 1): Creates 8 bone agents (1 1 46, sprite "bone") with no gravity, 12-frame tumbling animation, self-destructing after 50-60 ticks.

---

## Center/Inner Airlock Door (2 2 15)

The inner door of the airlock chamber, separating it from the ship interior. It manages room door permeability on both its left and right sides. When closing, it pushes overlapping agents to the right (back into the ship).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `engineering airlock` | 7 images, first image 23, 6 planes |
| Position | (5845, 4115) | Right/inner side of the airlock chamber |
| `attr` | 4 | Mouseclickable |
| `perm` | 0 | Physically impassable when closed |
| `ov70` | 255 | Light level |
| Animation | [0] | Initial closed frame |
| Room Links | Both left and right linked at permeability 100 | Creatures can initially pathfind through |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Door state: 0 = closed, 1 = open |

### Events

| Event | Number | Description |
|---|---|---|
| Custom (Toggle) | 1000 | Opens or closes the center door; manages both-side room links |
| Custom (Reset Closed) | 1002 | Resets door to closed animation frame |

#### Event 1000 — Toggle Door

**Opening** (ov00 = 0):
1. Plays "stm1" sound (steam/hydraulic).
2. Animates opening: frames [0 2 3 4 5].
3. Calculates room IDs for both left and right boundaries.
4. In `inst` mode: sets `door` permeability to 100 on both sides (physically passable), sets `link` to 0 on both sides (blocks creature pathfinding into the airlock).
5. Sets `ov00 = 1`.

**Closing** (ov00 ≠ 0):
1. Plays "stm1" sound.
2. Enumerates all touching agents (`etch 0 0 0`). For any with physics-enabled attributes (bits 0+1), applies velocity `velo 30 -10` to push them rightward (back into the ship interior).
3. Animates closing: frames [5 4 3 2 0].
4. In `inst` mode: sets `door` permeability to 0 on both sides, restores `link` to 100 on both sides.
5. Sets `ov00 = 0`.
6. Checks the Airlock Control Panel (2 12 11) — if it's still in active state (ov00 = 1), waits for animation and shows frame [1] (partially open/ready state).

#### Event 1002 — Reset Closed

Waits for any animation (`over`), then resets to frame [0] (fully closed).

---

## Light Button (2 12 10)

A simple button that controls the airlock area lighting and the center door. It has an input/output port system for integration with the wiring/CA network. When toggled, it activates or deactivates the center door (2 2 15).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `airlock buttons` | 7 images, first image 0, 4 planes |
| Position | (5917, 4204) | Near the airlock controls |
| `attr` | 4 | Mouseclickable |
| `ov70` | 255 | Light level (fully lit initially) |
| Animation | [0] | Initial state (lights on) |
| Input Port 0 | "light in" / "light setting" | Receives light signals |
| Output Port 0 | "light out" / "light setting" | Sends light signals |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Button state: 0 = lights on, 1 = lights off |
| `ov70` | Light level: 255 = on, 0 = off |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Player clicks — plays "map1" sound and sends self message 1000 |
| Custom (Toggle) | 1000 | Toggles light state; sends port signal and activates/deactivates center door |

#### Event 1 — Activate

Plays "map1" click sound, then sends message 1000 to self with current `ov70` as parameter.

#### Event 1000 — Toggle Light

**Turning lights off** (ov00 = 0 and ov70 ≠ 0):
1. Sets `ov00 = 1`, `ov70 = 0`, shows frame [1] (lights off).
2. Sends value 255 on output port 0 (signals lights-off to connected agents).
3. Sends message 1000 to the center door (2 2 15) to open it.

**Turning lights on** (ov00 ≠ 0 and ov70 = 0):
1. Sets `ov00 = 0`, `ov70 = 255`, shows frame [0] (lights on).
2. Sends value 0 on output port 0.
3. Sends message 1000 to the center door (2 2 15) to close it.

---

## Airlock Control Panel (2 12 11)

The main compound agent controlling the full airlock cycle. It features a multi-part display with a countdown digit, an activation button, and status indicators. The control panel orchestrates the entire airlock sequence by messaging the other agents in the correct order with timed delays.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `airlock buttons` | 18 images, first image 7, 4 planes |
| Position | (5790, 4154) | Near the airlock entrance |
| `attr` | 4 | Mouseclickable |
| `ov70` | 255 | Light level |
| `ov01` | -1 | Countdown value (negative = idle/ready) |
| Input Port 0 | "door activation" | Receives door activation signals |
| Output Port 0 | "throughput" | Sends throughput signals |

### Parts

| Part | Type | Sprite | Description |
|---|---|---|---|
| 0 | Main body | `airlock buttons` (frame 7) | Panel background |
| 1 | Dull display | `airlock buttons` (9 frames, offset 0) | Countdown digit display (0-9) |
| 2 | Button | `airlock buttons` (25 frames, offset 4) | Clickable activation button |
| 3 | Dull indicator | `airlock buttons` (frame 31) | Status indicator |
| 4 | Dull indicator | `airlock buttons` (frame 32) | Status indicator |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Panel state: 0 = inactive, 1 = active (airlock cycling) |
| `ov01` | Countdown value: 10 for activation, 3 for deactivation; negative = ready |
| `ov70` | Light level: 255 = lit, 0 = dark |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Player clicks — plays "map1" sound and sends self message 1000 |
| Custom (Toggle) | 1000 | Initiates activation or deactivation cycle with countdown |
| Timer | 9 | Countdown timer — decrements display and triggers end-of-countdown actions |
| Custom (Placeholder) | 2000 | Empty handler (reserved) |

#### Event 1 — Activate

Plays "map1" click sound, then sends message 1000 to self with current `ov70` as parameter `_p1_`.

#### Event 1000 — Toggle Airlock Cycle

Shows button pressed animation (part 2, frame [3]).

**Activation** (ov00 = 0, _p1_ ≠ 0, ov01 < 0):
1. Disables clicking (`clac -1`). Sets `ov00 = 1`, `ov70 = 0`, `ov01 = 10` (10-step countdown).
2. Sends 255 on output port 0.
3. Sends message 1000 to the Light Button (2 12 10) to toggle lights off (if it's currently on).
4. Sends message 1000 to the Alarm (1 1 50) to activate the alarm.
5. Sends message 1001 to the Left Door (2 2 14) to animate to open state.
6. Starts the timer with `tick 1` to begin the countdown.

**Deactivation** (ov00 ≠ 0, _p1_ = 0, ov01 < 0):
1. Locks the script. Disables clicking. Sets `ov00 = 0`, `ov70 = 255`, `ov01 = 3` (3-step countdown).
2. Sends 0 on output port 0.
3. Waits 5 ticks.
4. Sends message 1000 to the Left Door (2 2 14) to toggle it closed.
5. Starts the timer with `tick 1`.

#### Event 9 — Countdown Timer

Runs in `inst`/`lock` mode. Sets `tick 10` for each countdown step. Updates the digit display (part 1) with `pose ov01`, then decrements `ov01`.

**When countdown reaches zero** (ov01 < 0):

- **If activating** (ov00 = 1):
  1. Stops the timer (`tick 0`).
  2. Sends message 1000 to the Left Door (2 2 14) to open the outer door.
  3. Resets button appearance (part 2, frame [0]).

- **If deactivating** (ov00 = 0):
  1. Stops the timer (`tick 0`).
  2. Sends message 1000 to the Alarm (1 1 50) to toggle it off.
  3. Sends message 1002 to the Center Door (2 2 15) to reset it to closed.
  4. Sends message 1000 to the Light Button (2 12 10) with parameter 0 to reset it.
  5. Shows deactivated button (part 2, frame [1]).
  6. Waits 20 ticks, then re-enables clicking (`clac 0`).

---

## Agent Interaction Map

The following diagram shows how the agents communicate during the airlock cycle:

```
Airlock Control Panel (2 12 11)
    ├── msg 1000 → Light Button (2 12 10) → msg 1000 → Center Door (2 2 15)
    ├── msg 1000 → Alarm (1 1 50)
    ├── msg 1001 → Left Door (2 2 14) [hold open animation]
    └── msg 1000 → Left Door (2 2 14) [toggle open/close]
                        ├── msg 1001 → Alarm (1 1 50) [eject agents on open]
                        ├── msg 1002 → Alarm (1 1 50) [destroy agents on close]
                        └── tick → Airlock Agents (1 1 39) [adjust scan rate]
```

## Removal Script

The `rscr` block performs a complete cleanup:
1. Kills all Light Button agents (2 12 10) and removes their scripts (events 1, 2, 4, 5, 9, 1000, 2000).
2. Kills all Center Door agents (2 2 15).
3. Kills all Airlock Control Panel agents (2 12 11) and removes their scripts (events 1, 2, 4, 5, 9, 1000, 2000).
4. Kills all Alarm agents (1 1 50).
5. Kills all Left Door agents (2 2 14) and removes script for event 1000.
