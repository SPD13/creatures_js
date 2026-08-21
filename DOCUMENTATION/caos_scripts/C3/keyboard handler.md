# Keyboard Handler

**Source**: `Bootstrap/001 World/keyboard handler.cos`

## Overview

This script creates the global keyboard handler agent that intercepts all keyboard input and routes it to the appropriate game systems. It acts as the central input dispatcher for the entire game, mapping key presses to actions such as cycling through creatures, toggling GUI applets, opening the help/restart popup, managing favourite places shortcuts, and providing a function key assignment system (F2-F12) that can store references to applets, creatures, or CAOS command strings.

The script also creates a temporary help/restart popup agent (1 2 8) that displays in-game help text and provides a button to save the game and reload the "Startup" world.

On removal (`rscr`), the script cleans up both the keyboard handler and any active help popup, and removes their associated event scripts.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| 1 2 6 | [Keyboard Handler](#keyboard-handler-1-2-6) | Invisible agent that receives all keyboard events and dispatches actions to game systems |
| 1 2 8 | [Help / Restart Popup](#help--restart-popup-1-2-8) | Modal popup displaying in-game help text with close and restart buttons |

## Game Variables Initialized

| Variable | Initial Value | Description |
|---|---|---|
| `c3_function_key_113` to `c3_function_key_123` | -1 | Storage slots for F2-F12 key assignments. Can hold applet species numbers (integer), creature references (agent), or CAOS command strings (string) |

---

## Keyboard Handler (1 2 6)

Invisible simple agent using the "blnk" (blank) sprite. Created with `imsk 3` (receives key down and key up input events) and `attr 16` (invisible). This agent is always present in the world and acts as the central keyboard input dispatcher.

### Events

| Event | Script | Description |
|---|---|---|
| Key Up | 73 | Handles key release actions |
| Key Down | 74 | Handles key press actions |

Note: In CAOS, event 73 is Raw Key Down and event 74 is Raw Key Up. The parameter `_p1_` contains the virtual key code.

### Key Down (Event 73) Behavior

This is the primary input handler. All key bindings are listed below:

#### Insert (45) / Delete (46) - Favourite Places Display
- **Insert**: Finds the favourite places pointer overlay (1 1 95), sets it to pose 0 (add mode), attaches it to the pointer, and positions it nearby.
- **Delete**: Same behavior but sets pose 1 (go-to mode).
- Only activates when Shift is not held.

#### Escape (27) - Help Popup / Cancel
1. Drops any held object (`nohh`).
2. Checks for the status bar agent (1 2 14): if its `ov00` equals 1, sends message 1000 to close it and purges the action queue.
3. If a help popup (1 2 8) already exists, kills it and stops.
4. Otherwise, creates a new help/restart popup (1 2 8) as a compound agent:
   - Button 1 (part 1): Close button, sends message 1000 to self.
   - Button 2 (part 2): Restart button, sends message 1001 to self.
   - Text part (part 3): Displays text from catalogue "In-Game Strings" entry 0.
   - The popup is centered on screen using window dimensions.

#### Tab (9) - Cycle Creatures
- **Without Shift**: Cycles forward through creatures using `pcls` (previous classifier search) with genus 4 (creature family). Selects creatures whose ownership word (`ooww`) equals 3 (owned by the current player). Sets the found creature as the selected norn.
- **With Shift**: Cycles backward through creatures using `ncls` (next classifier search) with the same filtering logic.
- The `Grettin` game variable determines whether to search for Grendels (genus 0) or Norns (genus 1).

#### Home (36) - Toggle Favourite Places Overlay
- Sends message 0 to the favourite places overlay agent (1 2 20).
- Only activates when Shift is not held.

#### End (35) - Toggle Favourite Places Overlay
- Sends message 0 to the favourite places overlay agent (1 2 19).
- Only activates when Shift is not held.

#### Pause (19) - Toggle Creator
- Sends message 1001 to the Creator applet (1 2 12), then checks its state (`ov00` and `clac`) to determine whether to send message 0 (open) or message 1 (close).
- Only activates when Shift is not held.

#### Ctrl+1 - Toggle Breeder's Kit
- Sends message 0 or 1 to the Breeder's Kit (1 2 13) based on its `ov99` state.
- Only activates with Ctrl held.

#### Ctrl+2 - Toggle Creator
- Sends message 0 or 1 to the Creator (1 2 12) based on its `clac` state.
- Only activates with Ctrl held.

#### Ctrl+3 - Toggle Agent Injector
- Sends message 0 or 1 to the Agent Injector (1 2 11) based on its `clac` state.
- Only activates with Ctrl held.

#### Ctrl+Right Arrow (39) - Cycle Agent Injector Items Forward
- Iterates through all agents in the Agent Injector's (1 2 11) payload using `epas`.
- Finds the next agent with a UNID greater than the currently held agent's UNID.
- Wraps around to the first agent if at the end.
- Picks up the found agent via `mesg wrt+ pntr 1000`.

#### Ctrl+Left Arrow (37) - Cycle Agent Injector Items Backward
- Same logic as Ctrl+Right Arrow but searches for agents with lower UNIDs.
- Wraps around to the last agent if at the beginning.

#### PageUp (33) / PageDown (34) - Navigate Applets
- Scans all applet agents (1 2 38, 1 2 15 through 1 2 20) that are currently in pose 1 (active/visible).
- **PageDown (34)**: Finds the next applet to the right (by x-position) and sends message 0 to activate it.
- **PageUp (33)**: Finds the next applet to the left (by x-position) and sends message 0 to activate it.

#### F2-F12 (113-123) - Function Key System
The function keys provide a flexible shortcut system with different behaviors depending on modifier keys:

- **Ctrl+Shift+F-key**: Assigns the current active applet (any of 1 2 38, 1 2 15-20 in pose 1) to the function key by storing its species number.
- **Shift+F-key**: Assigns the current CAOS command line (1 2 3) text or `ov00` value to the function key.
- **Ctrl+F-key**: Assigns the currently selected norn to the function key.
- **F-key alone (no modifiers)**: Executes the stored assignment:
  - If a **string**: Sends the text to the CAOS command line (1 2 3) for execution. Multi-line strings (ending with newline) are pasted into the command line text field; single-line strings are sent as message 1000 for immediate execution.
  - If an **agent reference**: Selects that creature as the active norn.
  - If an **integer** (not -1): Opens the corresponding applet (1 2 [number]) by sending message 0. If -1 (unassigned), sends message 1000 to the Agent Help agent (1 2 4) with parameter 2.

A confirmation sound "excl" plays when assignments are made.

### Subroutines

| Subroutine | Purpose |
|---|---|
| `set_game_if_valid` | For Ctrl+Shift+F-key: if the current applet target is in pose 1, stores its species number in the function key game variable |
| `set_va01_if_valid` | For PageUp/PageDown: if the current applet target is in pose 1, records its species and x-position |
| `find_next_along` | For PageUp/PageDown: finds the next/previous applet by comparing x-positions |

### Key Up (Event 74) Behavior

#### Insert (45) / Delete (46) - Hide Favourite Places Display
- Finds the favourite places pointer overlay (1 1 95), releases it from the pointer, and moves it offscreen (-10000, -10000) to hide it.

---

## Help / Restart Popup (1 2 8)

Compound agent using the "new_agent_help" sprite with `attr 304` (invisible + camera-shy). Created on-demand when the player presses Escape and no popup is already showing. Displays in-game help text centered on screen.

### Parts

| Part | Type | Description |
|---|---|---|
| 1 | Button | Close button ("new_agent_help" frame 18), sends message 1000 |
| 2 | Button | Restart button ("new_agent_help" frame 16), sends message 1001 |
| 3 | Fixed Text | Displays text from catalogue "In-Game Strings" entry 0, using "WhiteOnTransparentChars" font |

### Events

| Event | Number | Description |
|---|---|---|
| Message | 1000 | Close: destroys the popup |
| Message | 1001 | Restart: moves popup offscreen, waits 1 tick, saves the game, loads the "Startup" world, then destroys itself |

### Event 1000 - Close
Immediately kills the popup agent (`kill ownr`).

### Event 1001 - Restart Game
1. Locks execution to prevent interruption.
2. Moves the popup offscreen (-1000, -1000).
3. Waits 1 tick for the screen to update.
4. Saves the current game state (`save`).
5. Loads the "Startup" world (`load "Startup"`), which effectively restarts the game.
6. Kills the popup agent.

---

## Removal Script (rscr)

When the script is uninstalled:
1. Kills all keyboard handler agents (1 2 6).
2. Kills all help popup agents (1 2 8).
3. Removes event scripts: 1 2 8 event 1000, 1 2 8 event 1001, and 1 2 6 event 73.

## Referenced Agents

| Classifier | Name | Role in this script |
|---|---|---|
| 1 1 95 | Favourite Places Pointer Overlay | Shown/hidden on Insert/Delete keys |
| 1 2 3 | CAOS Command Line | Text source/target for F-key assignments |
| 1 2 4 | Agent Help | Receives fallback F-key message when unassigned |
| 1 2 11 | Agent Injector | Toggled with Ctrl+3, item cycling with Ctrl+Arrow keys |
| 1 2 12 | Creator | Toggled with Ctrl+2 and Pause key |
| 1 2 13 | Breeder's Kit | Toggled with Ctrl+1 |
| 1 2 14 | Status Bar | Checked/closed on Escape |
| 1 2 15-20 | Favourite Places Buttons | Navigated with PageUp/PageDown |
| 1 2 38 | Favourite Places (Main) | Navigated with PageUp/PageDown |
