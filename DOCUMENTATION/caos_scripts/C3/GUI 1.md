# GUI 1

**Source file:** `Assets/Bootstrap/001 World/GUI 1.cos`

## Overview

The GUI 1 script creates the primary user interface system for Creatures 3. It builds the right-side toolbar panels that slide in and out from the right edge of the game window, giving the player access to creature management, game options, inventory, and creature import/export functionality. Each main panel uses a velocity-based slide animation when opening and closing, and all panels reposition automatically when the game window is resized.

The interface is organised around the current creature (the `norn` target). The Creature Status Bar always shows the selected creature's portrait, name, and gender. The Creature Selection Panel provides a paginated grid of up to six creature portraits per page, allowing the player to switch between creatures. The Options Panel offers pause, sound control, and an about screen. The Inventory is a vehicle agent that can hold items carried by the player's hand.

When the Docking Station expansion is installed (`game "Grettin" = 1`), the creature panels enumerate all creature genera (genus 0). In standard Creatures 3 (`game "Grettin" = 0`), only Norns (genus 1) are shown.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 2 13 | Creature Selection Panel | Paginated grid of creature portraits with import/export controls | [Details](#agent-1-2-13-creature-selection-panel) |
| 1 2 12 | Options Panel | Game settings: pause, sound mute toggles, about box, and creature name entry | [Details](#agent-1-2-12-options-panel) |
| 1 2 11 | Inventory | Vehicle agent used as the player's inventory for carried items | [Details](#agent-1-2-11-inventory) |
| 1 2 14 | Creature Status Bar | Always-visible bar showing current creature portrait, name, and gender | [Details](#agent-1-2-14-creature-status-bar) |
| 1 2 35 | Creature Selection Indicator | Animated indicator showing which portrait is the currently selected creature | [Details](#agent-1-2-35-creature-selection-indicator) |
| 1 2 34 | About Box | Multi-page dialog showing game version and help text (created on demand) | [Details](#agent-1-2-34-about-box) |
| 1 2 32 | Import Creature Browser | PRAY-based browser for importing exported creatures (created on demand) | [Details](#agent-1-2-32-import-creature-browser) |
| 1 2 39 | Import Retry Dialog | Confirmation dialog shown when creature import partially fails (created on demand) | [Details](#agent-1-2-39-import-retry-dialog) |
| 1 2 40 | Warning Dialog | Generic warning popup for creature limits and export failures (created on demand) | [Details](#agent-1-2-40-warning-dialog) |
| 1 1 43 | Teleport Effect | Visual teleportation animation played during creature import/export (created on demand) | [Details](#agent-1-1-43-teleport-effect) |

---

## Agent 1 2 13: Creature Selection Panel

A compound agent that serves as the main creature management panel. It displays up to six creature portraits in a 3x2 grid with text names beneath each portrait. The panel slides in from the right when activated and slides back when deactivated. It includes navigation arrows for pagination, an import button, an export button, and a close/open tab.

**Sprite:** `gui1`
**Attributes:** 288 (Invisible to creatures + Camera shy)
**Plane:** 8900

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Current page number for creature pagination |
| `ov10` | Horizontal offset from window right edge (28 pixels) |
| `ov11` | Vertical offset from window top (0 pixels) |
| `ov16`-`ov21` | Agent references to the six creatures displayed in slots 1-6 |
| `ov99` | Panel state: -1 = closed/docked, 1 = open |

### Parts

| Part | Type | Description |
|---|---|---|
| 1 | Button | Previous page arrow |
| 2 | Button | Next page arrow |
| 3 | Button | Export creature button |
| 4 | Button | Import/Send button (shows active state when a creature is selected) |
| 5-10 | Button | Creature portrait slots (6 slots in 3x2 grid), using `blnk` sprite when empty |
| 11-16 | Fixed text | Creature name labels beneath each portrait slot |
| 17 | Button | Close/open tab handle on the panel edge |
| 18-19 | Fixed text | Import/Export label text (read from catalogue "Import Text") |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Slide panel open and populate creature grid |
| Activate 2 | 2 | Slide panel closed |
| Window Resized | 123 | Reposition panel to right edge |
| Creature Selection Changed | 120 | Refresh creature portraits and indicator |
| Creature Life Event | 127 | Refresh creature display on life events |
| Button 1000 | 1000 | Previous page of creatures |
| Button 1001 | 1001 | Next page of creatures |
| Button 1002 | 1002 | Open import creature browser |
| Button 1003 | 1003 | Export current creature |
| Button 1004-1009 | 1004-1009 | Select creature from slot 1-6 |

### Event 1 - Activate 1 (Slide Open)

Clears all six portrait slots (replacing sprites with `blnk` and text with spaces) and nulls out the creature references (`ov16`-`ov21`). Then enumerates all creatures of the appropriate genus, skipping creatures that are not owned by the world (`ooww` check equals 3). For each valid creature up to six, it:

1. Stores the creature reference in `ov16`-`ov21`
2. Sets the portrait slot sprite to the creature's face (`face` command)
3. Sets the name label to the creature's history name (`hist name`)

If more than six creatures exist, the next-page arrow (part 2) is activated. The panel then slides in from the right using decreasing velocity steps (`velo -20 0` -> `-10` -> `-5` -> `0`) with `lock`/`slow` to ensure the animation completes atomically.

### Event 2 - Activate 2 (Slide Closed)

Slides the panel back to its docked position using increasing velocity steps in the opposite direction. Repositions to the right edge of the window.

### Event 120 - Creature Selection Changed

Refreshes the creature grid for the current page. Recalculates which creatures to display based on `ov00` (page number) and updates portrait sprites and name labels. Also triggers the selection indicator (1 2 35) to update its position via message 120.

### Event 127 - Creature Life Event

Similar to event 120 but also resets the page to 1 and rebuilds the creature list. Handles cases where creatures may have been born or died.

### Events 1000-1001 - Page Navigation

Event 1000 decrements `ov00` (previous page) and event 1001 increments it (next page). Both clear the current grid and repopulate it with the appropriate page of creatures using the same enumeration logic.

### Events 1004-1009 - Creature Slot Selection

Each button corresponds to a portrait slot. When clicked, sets the stored creature reference (`ov16`-`ov21`) as the current `norn` target.

### Event 1002 - Import Creature

Refreshes the PRAY resource list (`pray refr`), counts available exported creature files (`pray coun "EXPC"`), and if any exist, creates the Import Creature Browser dialog (1 2 32).

### Event 1003 - Export Current Creature

Exports the currently selected creature using `pray expo "EXPC"`. Creates a teleportation visual effect (1 1 43) at the creature's location with animation and sound. If export fails, displays a warning dialog (1 2 40). On success, closes any open creature history windows, triggers a teleport animation, and refreshes the creature display.

---

## Agent 1 2 12: Options Panel

A compound agent providing game settings. It includes pause, mute toggles for sound effects and music, a creature name text entry field, and an about/help button.

**Sprite:** `gui1`
**Attributes:** 308 (Invisible to creatures + Camera shy + Activatable)
**Plane:** 8900
**Permeability:** 60

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Pause state: 0 = unpaused, 1 = paused |
| `ov10` | Horizontal offset from window right edge (28 pixels) |
| `ov11` | Vertical offset from window top (200 pixels) |
| `ov99` | Panel state: -1 = closed/docked, 1 = open |

### Parts

| Part | Type | Description |
|---|---|---|
| 1 | Button | Quit/Save button |
| 2 | Button | Pause toggle (pose 0 = unpaused, pose 1 = paused) |
| 3 | Button | SFX mute toggle |
| 4 | Button | Music mute toggle |
| 5 | Button | About/Help button |
| 6-10 | Fixed text | Setting labels (read from catalogue "Option Text") |
| 11 | Text entry | Creature name text input field |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Slide panel open |
| Activate 2 | 2 | Slide panel closed and restore focus |
| Window Resized | 123 | Reposition and synchronize mute button states |
| Button 1000 | 1000 | Quit: sends message to quit handler (1 2 6) |
| Button 1001 | 1001 | Toggle pause |
| Button 1002 | 1002 | Toggle SFX mute |
| Button 1003 | 1003 | Toggle music mute |
| Button 1004 | 1004 | Open About Box |
| Text Submit 1005 | 1005 | Name entry: sets hand name and restores focus |

### Event 1001 - Toggle Pause

When pausing (`ov00` = 0 -> 1):
- Calls `wpau 1` to pause world processing
- Freezes all agents except GUI components: `paus 1` for all agents of families 1-4, except agents with genus 2 species 12 (Options panel itself) and genus 1 species 1 (certain toolbar agents) and the quit handler (1 2 6)

When unpausing (`ov00` = 1 -> 0):
- Calls `wpau 0` to resume world processing
- Unfreezes all agents: `paus 0` for all agents of families 1-4

### Event 1002 - Toggle SFX Mute

Toggles the SFX mute state using `mute 3 1`. Updates the button pose and label text from catalogue "Option Text" (entries 4/5 for unmuted/muted).

### Event 1003 - Toggle Music Mute

Toggles the music mute state using `mute 3 2`. Updates the button pose and label text from catalogue "Option Text" (entries 6/7 for unmuted/muted).

### Event 123 - Window Resized

Reads the current mute state (`mute 3 0`) and synchronises the button poses and label text to match. Uses three subroutines: `sfx_` (ensure SFX shown as muted), `musi` (ensure music shown as muted), and `none` (ensure both shown as unmuted). Then repositions the panel.

### Event 1004 - Open About Box

Creates the About Box dialog (1 2 34) if one doesn't already exist. The About Box shows the game version number and help text.

---

## Agent 1 2 11: Inventory

A vehicle agent that serves as the player's inventory container. Items picked up and placed into the inventory are carried inside this vehicle's cabin area. The game engine stores a reference to this agent in `game "c3_inventory"`.

**Sprite:** `GUI1` (frame 4)
**Attributes:** 316 (Invisible to creatures + Camera shy + Activatable + Carriable)
**Plane:** 8900
**Permeability:** 60
**Cabin:** defined region (25, 15) to (355, 192) with cabin view 4392x1434 and cabin width 64

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov10` | Horizontal offset from window right edge (28 pixels) |
| `ov11` | Vertical offset from window top (395 pixels) |
| `ov99` | Panel state: -1 = closed/docked, 1 = open |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Slide panel open |
| Activate 2 | 2 | Slide panel closed |
| Window Resized | 123 | Reposition panel to right edge |

### Event 1 / Event 2 - Slide Open / Closed

Same slide animation pattern as other panels using decreasing velocity steps.

---

## Agent 1 2 14: Creature Status Bar

A compact compound agent positioned at the top-left of the screen showing the currently selected creature's portrait, name, and gender icon. It responds to creature selection changes and provides buttons for toggling creature history and centering the camera on the creature.

**Sprite:** `GUI1`
**Attributes:** 308 (Invisible to creatures + Camera shy + Activatable)
**Plane:** 8900
**Permeability:** 60
**Input mask:** 8 (Mouse move events)

### Parts

| Part | Type | Description |
|---|---|---|
| 1 | Button | Toggle creature history panel (1 2 23) |
| 2 | Button | Invisible hit area for camera centering |
| 3 | Fixed text | Creature name display |
| 4 | Dull | Gender icon (`gender` sprite) |
| 5 | Button | Additional control area |

### Events

| Event | Number | Description |
|---|---|---|
| Right Click | 76 | Open quit dialog when hovering with nothing held |
| Creature Changed | 120 | Update portrait, name, and gender display |
| Creature Life Event | 127 | Refresh display and update creature panel |
| Deactivate | 8 | Refresh display |
| Button 1000 | 1000 | Toggle open/close creature history |
| Button 1001 | 1001 | Center camera on current creature |
| Button 1002 | 1002 | Open creature history dialog |

### Event 120 - Creature Changed

If a creature is selected (`norn ne null`):
1. Centers the camera on the creature using `trck` and optionally `cmrt`
2. Sets part 2 to the creature's face sprite
3. Sets part 3 to the creature's name
4. Sets part 4 to the creature's species (gender icon pose)
5. Triggers the selection indicator (1 2 35) to update via message 120

If no creature is selected, clears the portrait, name, and gender display.

### Event 127 - Creature Life Event

Refreshes the display similar to event 120, and also updates the creature selection panel (1 2 13) by checking if the creature's gender icon needs updating and the creature panel's `ov16`-`ov21` references.

### Event 76 - Right Click

When the player right-clicks with nothing held and is hovering over this agent in non-pure mode, sends a message to the quit handler (1 2 6) to open the quit dialog.

### Event 1001 - Center Camera

If a creature is selected, centers the camera on it using `cmrt 0`, provided the creature is in a valid room and not in the inventory.

### Event 1002 - View Creature History

If a creature is selected, creates a creature history dialog agent (1 2 23) and passes the creature reference to it.

---

## Agent 1 2 35: Creature Selection Indicator

A simple agent using the `indicator` sprite that shows an animated highlight on the creature portrait slot that matches the currently selected creature. It floats to the correct position within the creature selection panel.

**Sprite:** `indicator`
**Attributes:** 32 (Camera shy)
**Plane:** 8910

### Events

| Event | Number | Description |
|---|---|---|
| Update Position | 120 | Move indicator to the selected creature's portrait slot |

### Event 120 - Update Position

Compares the current `norn` against each creature reference stored in the selection panel's `ov16`-`ov21`. When a match is found, positions the indicator sprite at the corresponding grid slot coordinates and plays a pulsing animation. If no match is found (creature not on current page), the indicator is hidden off-screen at (-10000, -10000).

---

## Agent 1 2 34: About Box

A compound agent dialog created on demand from the Options Panel's help button. Displays the game title with version number (`vmjr.vmnr` and optional patch level) and multi-page help text from the "About Box" catalogue. Includes next/previous page navigation and a page counter.

**Sprite:** `new_agent_help`
**Attributes:** 304 (Invisible to creatures + Camera shy + Floating)
**Plane:** 9045
**Centred on screen**

### Events

| Event | Number | Description |
|---|---|---|
| Button 1000 | 1000 | Close dialog (animated close, then kill) |
| Button 1001 | 1001 | Next page |
| Button 1002 | 1002 | Previous page |
| Update Display | 1003 | Refresh page counter and navigation button states |

---

## Agent 1 2 32: Import Creature Browser

A compound agent dialog created on demand from the Creature Selection Panel's import button. Browses exported creature files using the PRAY system (`"EXPC"` chunk type). Displays creature details including name, source world, export time, life stage, and age.

**Sprite:** `new_agent_help`
**Attributes:** 304 (Invisible to creatures + Camera shy + Floating)
**Plane:** 9025
**Centred on screen**

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov99` | Name of the currently displayed PRAY chunk |

### Events

| Event | Number | Description |
|---|---|---|
| Button 1000 | 1000 | Close dialog |
| Button 1001 | 1001 | Next exported creature |
| Button 1002 | 1002 | Previous exported creature |
| Button 1003 | 1003 | Import the displayed creature |
| Update Display | 1004 | Refresh creature info display |

### Event 1003 - Import Creature

Performs creature population checks before importing:
1. Counts all living creatures; blocks import if at `game "c3_max_creatures"` limit
2. If importing a Norn (genus 1), also checks against `game "c3_max_norns"` limit
3. If over limit, displays a warning dialog (1 2 40) with the "too many creatures" message
4. Otherwise, moves dialog off-screen and calls `pray impo` with flag 0 (first attempt)
5. If import partially fails (returns non-zero), creates the retry dialog (1 2 39)
6. On success, plays teleport animation at the destination point (1065, 772), moves the creature with `mvft`, sets it as current `norn`, plays import sound `"cmc3"`, and applies `like pntr`

---

## Agent 1 2 39: Import Retry Dialog

A compound agent dialog shown when the initial creature import partially fails. Offers the player a choice to retry the import (using flag 1 for the second attempt) or cancel.

**Sprite:** `new_agent_help`
**Attributes:** 304 (Invisible to creatures + Camera shy + Floating)
**Plane:** 9030
**Centred on screen**

### Events

| Event | Number | Description |
|---|---|---|
| Button 1000 | 1000 | Cancel: close dialog |
| Button 1001 | 1001 | Retry: re-attempt import with `pray impo ov99 1 0` and teleport animation |

---

## Agent 1 2 40: Warning Dialog

A generic compound agent popup used to display warning messages (creature limit exceeded, export failure). It uses the `pick-ups` sprite for the close button and `new_agent_help` for the text area.

**Sprite:** `pick-ups` (frame 24)
**Attributes:** 304 (Invisible to creatures + Camera shy + Floating)
**Plane:** 9030
**Centred on screen**

### Events

| Event | Number | Description |
|---|---|---|
| Button 1000 | 1000 | Close: animated close, then kill |

---

## Agent 1 1 43: Teleport Effect

A simple agent that plays a teleportation visual effect during creature import and export. It is positioned at the creature's location, plays a sparkle animation sequence with the `"tele"` sound effect, then reverses the animation and is destroyed.

**Sprite:** `teleport` (11 frames)
**Plane:** 5001

This agent has no persistent event scripts. It is created inline, animated with `anim`/`over`, and destroyed immediately after the animation completes.

---

## Additional Script Definitions

This script also defines event handlers for classifier **1 2 200** (events 123, 1, 2) without creating the agent. Agent 1 2 200 is the main toolbar connector/handle created in another bootstrap script. The handlers here manage its window-resize repositioning and open/close slide behaviour.

### Removal Script

The removal script (`rscr`) destroys all GUI agents created or managed by this script: 1 2 200, 1 2 11, 1 2 12, 1 2 13, 1 2 14, 1 2 34, 1 2 32, and 1 2 35. It also removes event scripts for 1 2 11, 1 2 12, 1 2 13, 1 2 200, and 1 2 34.

### Impact on Stimulus / Room CA

None. This is a pure UI system with no effect on creatures, stimuli, or room chemical atmospheres. However, the pause functionality (event 1001 on 1 2 12) freezes all non-GUI agents and pauses world processing, which indirectly halts all stimulus and CA updates.
