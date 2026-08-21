# Environmental Controls

**File**: `Bootstrap/001 World/environmental controls.cos`

## Overview

This script creates four **environmental control panels** (3 3 55 through 3 3 58) placed at different locations throughout the Ark. These panels are interactive compound agents that serve as user-facing interfaces for adjusting environmental parameters in different sections of the ship. Each panel can be opened and closed by clicking, and when open, exposes buttons to cycle through settings on two dial displays, a toggle switch to alternate between two parameter modes, and input/output ports for integration with the Ark's engineering wiring system.

The four panels are placed in distinct areas of the Ark, each initialized with different default dial settings. They share identical behavior scripts, differing only in initial variable values and position.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| 3 3 55 | [Environmental Control — Upper Left](#environmental-control--upper-left-3-3-55) | Control panel at (938, 869), default settings ov01=2, ov02=2, ov03=2 |
| 3 3 56 | [Environmental Control — Left Middle](#environmental-control--left-middle-3-3-56) | Control panel at (761, 2048), default settings ov01=1, ov02=3, ov03=3 |
| 3 3 57 | [Environmental Control — Upper Right](#environmental-control--upper-right-3-3-57) | Control panel at (5364, 929), default settings ov01=4, ov02=4, ov03=0 |
| 3 3 58 | [Environmental Control — Middle](#environmental-control--middle-3-3-58) | Control panel at (4305, 2316), default settings ov01=2, ov02=2, ov03=2 |

## Agent Details

All four environmental control panels share identical behavior scripts and compound agent structure. They differ only in classifier, world position, and initial dial values. The shared behavior is documented once below, with per-agent specifics noted in each section.

### Shared Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 20 | Activatable (4) + invisible to creatures (16) |
| `clac` | 0 | Click action triggers message 0 (no default click), set to -1 when open |
| Sprite | "env_con" | Shared sprite set for all panels, 16 frames base |

### Shared Parts (When Open)

| Part | Type | Sprite | Description |
|---|---|---|---|
| 0 | Base | "env_con" frame 0 | Main body with open/close animation (frames 0–15) |
| 1 | Button | "env_con" frame 16 | First dial display, offset (25, 25), triggers message 1000 |
| 2 | Button | "env_con" frame 21 | Second dial display, offset (84, 26), triggers message 1001 |
| 3 | Button | "env_con" frame 28 | Left internal button, offset (71, 38), triggers message 1000 |
| 4 | Button | "env_con" frame 26 | Right internal button, offset (53, 63), triggers message 1001 |
| 5 | Button | "env_con" frame 30 | Toggle switch, offset (50, 37), triggers message 1002 |

### Shared Ports

| Port | Direction | ID | Name | Description |
|---|---|---|---|---|
| Input | `prt: inew` | 0 | "input" | Receives input signals, triggers message 1010 |
| Output | `prt: onew` | 0 | "output" | Forwards signals to connected gadgets |

### Shared Key Variables

| Variable | Description |
|---|---|
| `ov00` | Panel state: 0 = closed, 1 = open |
| `ov01` | First dial value (0–4), displayed on part 1 when toggle is off |
| `ov02` | Second dial value (0–4), displayed on part 2 |
| `ov03` | Alternate first dial value (0–4), displayed on part 1 when toggle is on |
| `ov99` | Toggle switch state: 0 = normal mode (ov01 shown), 1 = alternate mode (ov03 shown) |

### Shared Events

| Event | Number | Description |
|---|---|---|
| Activate 1 (Push) | 1 | Toggle the panel open or closed |
| Cycle First Dial | 1000 | Internal: cycles ov01 or ov03 depending on toggle state |
| Cycle Second Dial | 1001 | Internal: cycles ov02 |
| Toggle Switch | 1002 | Internal: switches between normal and alternate parameter mode |
| Port Input | 1010 | Receives a wired signal and routes it to dial cycling |

---

#### Event 1 — Activate 1 (Push / Toggle Panel)

Triggered when the user clicks the panel. Runs in locked (atomic) mode:

1. Disables further click actions (`clac -1`) while animating.
2. **If the panel is closed (`ov00 = 0`) — Opening**:
   - Plays `"env1"` sound effect.
   - Animates the base part opening (frames 0 through 15) and waits for completion.
   - Creates five button parts (dials, internal buttons, toggle switch) and the input/output ports.
   - Sets dial displays to their current stored values (`ov01` on part 1, `ov02` on part 2).
   - Sets `ov00 = 1` (open).
3. **If the panel is open (`ov00 = 1`) — Closing**:
   - Plays `"env2"` sound effect.
   - Sends a bang signal (value 100) through the output port (`prt: bang 100`).
   - Destroys the input port (`prt: izap 0`), output port (`prt: ozap 0`), and all five button parts (`pat: kill 1–5`).
   - Animates the base part closing (frames 15 through 0) and waits for completion.
   - Sets `ov00 = 0` (closed).
4. Re-enables click actions (`clac 0`).

#### Event 1000 — Cycle First Dial

Triggered by clicking button part 1 (the first dial display), button part 3 (left internal button), or via the port input handler. Plays `"beep"` sound and animates part 3 (button press flash):

1. **If toggle is off (`ov99 = 0`)**:
   - Increments `ov01` by 1. If it exceeds 4, wraps to 0.
   - Updates part 1 display to show the new `ov01` value.
2. **If toggle is on (`ov99 = 1`)**:
   - Increments `ov03` by 1. If it exceeds 4, wraps to 0.
   - Updates part 1 display to show the new `ov03` value.

#### Event 1001 — Cycle Second Dial

Triggered by clicking button part 2 (the second dial display) or button part 4 (right internal button), or via the port input handler. Plays `"beep"` sound and animates part 4 (button press flash):

1. Increments `ov02` by 1. If it exceeds 4, wraps to 0.
2. Updates part 2 display to show the new `ov02` value.

#### Event 1002 — Toggle Switch

Triggered by clicking button part 5 (the toggle switch). Runs in instant mode:

1. Plays `"beep"` sound.
2. **If toggle is off (`ov99 = 0`) — Switching to alternate mode**:
   - Sets part 5 to pose 1 (toggle on indicator).
   - Changes part 1 display to show `ov03` (alternate value).
   - Sets `ov99 = 1`.
3. **If toggle is on (`ov99 = 1`) — Switching to normal mode**:
   - Sets part 5 to pose 0 (toggle off indicator).
   - Changes part 1 display to show `ov01` (normal value).
   - Sets `ov99 = 0`.

#### Event 1010 — Port Input

Triggered when a signal arrives on the input port. Routes the incoming signal to the appropriate dial:

1. If the input value (`_p1_`) is negative: sends message 1000 to self (cycles the first dial).
2. If the input value (`_p1_`) is positive: sends message 1001 to self (cycles the second dial).
3. Forwards the signal value through output port 0 (`prt: send 0 _p1_`), passing it downstream to any connected gadgets.

---

### Environmental Control — Upper Left (3 3 55)

Control panel placed at position **(938, 869)** in the upper left area of the Ark.

**Initial Settings**: ov01=2, ov02=2, ov03=2

All events are identical to the shared behavior documented above.

### Environmental Control — Left Middle (3 3 56)

Control panel placed at position **(761, 2048)** in the left middle area of the Ark.

**Initial Settings**: ov01=1, ov02=3, ov03=3

All events are identical to the shared behavior documented above.

### Environmental Control — Upper Right (3 3 57)

Control panel placed at position **(5364, 929)** in the upper right area of the Ark.

**Initial Settings**: ov01=4, ov02=4, ov03=0

All events are identical to the shared behavior documented above.

### Environmental Control — Middle (3 3 58)

Control panel placed at position **(4305, 2316)** in the middle area of the Ark.

**Initial Settings**: ov01=2, ov02=2, ov03=2

All events are identical to the shared behavior documented above.

## Removal Script

The removal script (`rscr`) iterates through all agents with classifiers 3 3 55, 3 3 56, 3 3 57, and 3 3 58, killing each instance to clean up all four environmental control panels.

## Ecosystem Impact

- **Wiring Network**: Each panel provides an input and output port, allowing it to be integrated into the Ark's engineering wiring system. Negative input signals cycle the first dial, positive signals cycle the second dial, and all signals are forwarded to the output port. When closing, the panel sends a bang signal (100) through the output port before destroying it.
- **No Creature Interaction**: With `attr 20`, the panels are activatable by the user but invisible to creatures. Creatures cannot detect, push, pull, or interact with these panels directly. No biochemical stimuli are emitted.
- **No CA Emission**: The panels do not emit any chemical attractants (CA values) into the room system.
- **Environmental Parameters**: The three configurable dial values per panel (ov01, ov02, ov03 cycling 0–4) with a toggle switch likely control environmental properties (such as temperature, light, or humidity settings) for the Ark section where each panel is located. The toggle switch allows switching the first dial between two modes, effectively giving each panel control over three independent parameters.
