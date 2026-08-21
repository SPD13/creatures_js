# XY Tool

**Source file:** `Assets/Bootstrap/001 World/XY tool.cos`

## Overview

The XY Tool is a developer debugging utility that provides real-time coordinate and room information overlays at the mouse cursor position. It creates an invisible key listener agent that responds to keyboard shortcuts, toggling two mutually exclusive display modes:

- **Ctrl+Shift+X**: Displays the current mouse pointer X,Y coordinates as a floating text label.
- **Ctrl+Shift+R**: Displays the room ID at the current mouse pointer position as a floating text label.

Only one display mode can be active at a time. Activating one mode automatically deactivates the other. Both modes use a compound agent with a text part rendered in white-on-transparent characters that floats relative to the pointer agent, updating every tick.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 1 121 | XY Tool Controller | Invisible key listener that toggles display modes | [Details](#agent-1-1-121-xy-tool-controller) |
| 1 1 59 | XY Coordinate Display | Floating text showing pointer X,Y coordinates | [Details](#agent-1-1-59-xy-coordinate-display) |
| 1 1 18 | Room ID Display | Floating text showing room ID at pointer position | [Details](#agent-1-1-18-room-id-display) |

---

## Agent 1 1 121: XY Tool Controller

An invisible simple agent created with the `"blnk"` (blank) sprite, positioned at (0, 0). Its input mask is set to 1 (`imsk 1`) so it receives raw keyboard events. This agent acts as the controller for the XY Tool system, listening for key combinations and creating/destroying the display agents as needed.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | XY coordinate display state (0 = off, 1 = on) |
| `ov01` | Room ID display state (0 = off, 1 = on) |

### Events

| Event | Number | Description |
|---|---|---|
| Raw Key Down | 73 | Keyboard input handler for toggling display modes |

### Event 73 - Raw Key Down

Fires on every raw keyboard key press. The handler checks that both Ctrl (keycode 17) and Shift (keycode 16) are held down using `keyd`. The `_p1_` parameter contains the key character:

- **'X' pressed (Ctrl+Shift+X):** Toggles the XY coordinate display (1 1 59).
  - If the room display (1 1 18) is currently active (`ov01 = 1`), it is killed first and `ov01` is reset to 0.
  - If `ov00 = 0`: Creates a new 1 1 59 compound agent floating relative to the pointer, sets `ov00 = 1`.
  - If `ov00 = 1`: Kills the existing 1 1 59 agent, sets `ov00 = 0`.

- **'R' pressed (Ctrl+Shift+R):** Toggles the room ID display (1 1 18).
  - If the XY display (1 1 59) is currently active (`ov00 = 1`), it is killed first and `ov00` is reset to 0.
  - If `ov01 = 0`: Creates a new 1 1 18 compound agent floating relative to the pointer, sets `ov01 = 1`.
  - If `ov01 = 1`: Kills the existing 1 1 18 agent, sets `ov01 = 0`.

This ensures mutual exclusivity between the two display modes.

---

## Agent 1 1 59: XY Coordinate Display

A compound agent created on demand by the controller (1 1 121) when Ctrl+Shift+X is pressed. Uses the `"blank"` sprite with `attr 32` (camera shy). Floats relative to the pointer agent (`frel pntr`) and has a fixed text part at slot 1 using the `"whiteontransparentchars"` font, positioned at offset (30, 30) via `flto`. Timer is set to 1 tick for continuous updates.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Update coordinate text display |

### Event 9 - Timer

Fires every tick. Targets the pointer agent and reads its left edge (`posl`) as X and top edge (`post`) as Y. Formats the coordinates as a string `"X Y"` (e.g., `"1234 5678"`) and writes it to the text part using `ptxt`.

---

## Agent 1 1 18: Room ID Display

A compound agent created on demand by the controller (1 1 121) when Ctrl+Shift+R is pressed. Identical structure to the XY display (1 1 59): uses `"blank"` sprite, `attr 32` (camera shy), floats relative to the pointer, and has a fixed text part at slot 1 with `"whiteontransparentchars"` font at offset (30, 30). Timer is set to 1 tick.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Update room ID text display |

### Event 9 - Timer

Fires every tick. Targets the pointer agent and reads its left edge (`posl`) as X and top edge (`post`) as Y. Uses `grap` (Get Room At Point) to determine which room contains the pointer's coordinates. Displays the room ID number as text in the text part using `ptxt`.

---

## Removal Script

The removal script (`rscr`) cleans up all agents created by this script:
1. Enumerates and kills all 1 1 59 (XY coordinate display) agents.
2. Enumerates and kills all 1 1 121 (controller) agents.
3. Enumerates and kills all 1 1 18 (room ID display) agents.

## Impact on Stimulus / Room CA

None. This is a purely informational developer tool with no effect on creatures, stimuli, or room chemical atmospheres.
