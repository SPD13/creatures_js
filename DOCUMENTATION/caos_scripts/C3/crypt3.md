# crypt3.cos - Crypt (Death Memorial) System

## Overview

This script creates the **Crypt** system, a memorial area on the Creatures 3 spaceship where the player can view, register, and commemorate dead creatures. The system provides two viewing modes:

- **Death Registration Screen** (`ov02 = 0`): Allows the player to browse recently deceased creatures, write epitaphs, and formally register their deaths. Unregistered creatures can also be dismissed from the crypt with the "Don't Register" button.
- **Tombstone Viewer Screen** (`ov02 = 1`): A read-only mode for reviewing previously registered deaths, viewing epitaphs and creature photos.

The crypt relies heavily on the **creature history (HIST)** system to retrieve creature names, birth/death times, photos, user text (epitaphs), and genus information. The game variable `"Grettin"` controls a filter: when set to 0, creatures of genus other than 1 (i.e. non-Norns such as Grendels and Ettins) are skipped during navigation.

The script also creates decorative fire agents in the crypt area and a view selector machine that toggles between the two modes.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 1 48 | Crypt Fire | Decorative animated flames placed around the crypt room | [Detail](#1-1-48---crypt-fire) |
| 2 12 8 | Crypt View Selector | Machine with buttons to choose between death registration and tombstone viewing | [Detail](#2-12-8---crypt-view-selector) |
| 1 2 31 | Crypt Screen | Main compound display panel showing creature death information, photos, and epitaph entry | [Detail](#1-2-31---crypt-screen) |

## Agent Details

---

### 1 1 48 - Crypt Fire

Decorative fire agents placed at six positions in the crypt room. Each fire uses the "crypt2" sprite gallery with 10 animation frames, started at different offsets to create a staggered, natural-looking effect. They are non-interactive (`attr 0`, `clac 0`) background decorations.

Six instances are created at positions: (8337, 901), (8432, 882), (8551, 854), (8653, 854), (8766, 880), (8859, 901).

| Event | Number | Description |
|---|---|---|
| — | — | No events defined for this agent |

---

### 2 12 8 - Crypt View Selector

A compound agent that serves as the activation machine for the crypt system. It has a central egg-shaped toggle button (part 3) and two mode selection buttons that appear when powered on.

The machine stores a reference to the crypt screen agent (1 2 31) in `ov17`, set during initialization.

#### Events

| Event | Number | Description |
|---|---|---|
| Message | 1001 | Left button pressed - Open Death Registration Screen |
| Message | 1002 | Right button pressed - Open Tombstone Viewer Screen |
| Message | 1003 | Central button pressed - Toggle power on/off |

**1001 - Open Death Registration Screen**: Plays a button press sound and animation on part 1. Sets `ov02` of the crypt screen (via `avar ov17 2`) to 0 (registration mode), then sends message 1000 to the crypt screen to activate it.

**1002 - Open Tombstone Viewer Screen**: Plays a button press sound and animation on part 2. Sets `ov02` of the crypt screen to 1 (tombstone viewing mode), then sends message 1000 to the crypt screen to activate it.

**1003 - Toggle Power**: Toggles the machine between powered-on (`ov00 = 1`) and powered-off (`ov00 = 0`) states. When powering on, plays an opening animation on part 0 (base changes from closed to open) and creates two button parts (part 1 for registration, part 2 for tombstone viewing). When powering off, removes the buttons and plays the closing animation.

---

### 1 2 31 - Crypt Screen

The main crypt display, a complex compound agent with up to 16 parts. It displays creature name, birth/death dates, a photo, an epitaph text entry field, and navigation controls. The viewing mode is determined by `ov02` (0 = registration, 1 = tombstone viewer).

**Key OVxx variables:**
- `ov00`: Current history event index for the displayed creature
- `ov01`: Screen active flag (1 = open, 0 = closed)
- `ov02`: Viewing mode (0 = death registration, 1 = tombstone viewer)
- `ov60`: Current creature moniker being displayed
- `ov96`: Current photo event index for photo navigation

**Parts layout:**
- Part 0: Background/base
- Part 1: Fixed text - creature name display
- Part 2: Close button
- Part 3: Toggle button (from view selector)
- Part 4: "Don't Register" button
- Part 5: "Register" button
- Part 6: Text input field (for epitaph entry) or fixed text (tombstone mode)
- Part 7: Previous creature button
- Part 8: Next creature button
- Part 9: Previous photo button
- Part 10: Next photo button
- Part 11: Creature History button
- Part 12: Photo display (dull part)
- Part 13: Fixed text - birth/death date display
- Part 14: "Don't Register" label (registration mode only)
- Part 15: "Register Deaths" / "View Tombstones" label
- Part 16: "Register" label (registration mode only)

#### Events

| Event | Number | Description |
|---|---|---|
| Message | 1000 | Activate - Open and populate the crypt screen |
| Message | 1002 | Close - Shut down the crypt screen and restore focus |
| Message | 1003 | "Don't Register" button - Mark creature as unregistered |
| Message | 1005 | Register / Save epitaph |
| Message | 1007 | Navigate to previous creature |
| Message | 1008 | Navigate to next creature |
| Message | 1009 | Navigate to previous photo |
| Message | 1010 | Navigate to next photo |
| Message | 1011 | Open Creature History viewer |
| Message | 2000 | Internal: Display creature info (registration mode) |
| Message | 2001 | Internal: Display "no creature found" message |
| Message | 2002 | Internal: Display creature info (tombstone mode) |
| Message | 2003 | Internal: Display "no registered deaths" message |
| Message | 2004 | Internal: Switch to "Don't Register" confirmation UI |
| Message | 2005 | Internal: Switch to "Register" confirmation UI |

**1000 - Activate**: Opens the crypt screen. Plays opening animation, creates all UI parts (text displays, buttons, photo area, text input). In registration mode (`ov02 = 0`), creates an editable text part (part 6) and shows "Don't Register" / "Register" labels. In tombstone mode (`ov02 = 1`), shows a read-only text area and omits registration-specific labels. After setup, triggers message 1008 (next creature) to load the first creature.

**1002 - Close**: Closes the screen. Plays button and closing animations, restores camera focus to the default focus target (`game "c3_default_focus"`), removes all dynamic parts (1-16), and plays the closing base animation.

**1003 - "Don't Register"**: Marks the current creature's death event user text as `"don't register"` in the history system, effectively hiding it from the registration queue. Then navigates to the previous creature (message 1007).

**1005 - Register / Save epitaph**: Saves the text from the epitaph input field (part 6) into the creature's history as user text. If the text field is empty, writes the default "No Epitaph" string (from catalogue `"Crypt"` index 12). Restores camera focus, then navigates to the previous creature.

**1007 - Navigate to previous creature**: Uses `hist prev` to move backward through the creature history. In registration mode, skips creatures that: already have user text set (epitaph exists), have an invalid death event (`ov00 = -1`), or are filtered by genus (non-Norn when `"Grettin" = 0`). In tombstone mode, skips creatures whose user text is empty or set to `"don't register"`. When a valid creature is found, sends message 2000 (registration) or 2002 (tombstone) to display it. If none found, sends 2001 or 2003.

**1008 - Navigate to next creature**: Same logic as 1007 but uses `hist next` to move forward through history.

**1009 - Previous photo**: Uses `hist finr` with event type 13 (photo events) to find photos associated with the current creature. Searches backward from `ov96`, skipping entries with empty photo data. Displays the found photo as a dull sprite part (part 12) with grey tinting.

**1010 - Next photo**: Same as 1009 but searches forward using `hist find`.

**1011 - Open Creature History**: Creates a creature history viewer agent (1 2 23) and passes the current creature's moniker via message parameters.

**2000 - Display creature info (registration mode)**: Populates the screen with the creature's name (or "Creature" if unnamed), birth date (from history event type 3), and death date (from the current event `ov00`). Dates are formatted using `rtif` with the `"creature_history"` catalogue date format. Creates a text input field for epitaph entry. Resets photo index and triggers photo display (message 1009).

**2001 - No creature found**: Clears the display and shows the "No recent Deaths found." message from catalogue `"Crypt"` index 3.

**2002 - Display creature info (tombstone mode)**: Similar to 2000 but creates a read-only fixed text part for the epitaph instead of an editable field, and pre-fills it with the existing user text (epitaph). Removes the "Don't Register" and "Register" buttons since they are not applicable.

**2003 - No registered deaths**: If the screen is not freshly opened (`ov01 <> 1`), re-activates the screen via message 1000 (effectively returning to the previous state). Otherwise shows "No registered Deaths found." from catalogue `"Crypt"` index 2.

**2004 - "Don't Register" confirmation**: Triggered when the player presses the "Don't Register" button. Switches the UI to show a confirmation state: removes navigation and epitaph parts, shows a text input area, and sends message 1001 to the `2 12 7` agent (external crypt control).

**2005 - "Register" confirmation**: Similar to 2004 but for the registration action. Shows a fixed text display with dull image parts, and sends message 1001 to the `2 12 7` agent.

---

### 1 1 49 - Related Agent (Script Only)

This file defines event script 1000 for agent 1 1 49, which plays a short animation sequence (`[0 1 2 3 4]`). The agent itself is not created in this script and is likely a decorative element in the crypt area created elsewhere.

| Event | Number | Description |
|---|---|---|
| Message | 1000 | Play animation sequence |

---

## External Agent References

- **2 12 7**: A crypt control agent referenced in events 2004 and 2005 (receives message 1001). Also cleaned up in the removal script. Created in a separate script file.
- **1 2 23**: Creature History viewer, created dynamically when the "Creature History" button is pressed (event 1011).
- **game "c3_default_focus"**: The default camera focus target, restored when the crypt screen closes.
- **game "Grettin"**: Game variable controlling whether non-Norn creatures are shown (0 = Norns only, non-zero = all species).

## Removal Script

The `rscr` section cleans up all crypt-related agents:
- Kills all 1 1 48 (crypt fires), 1 1 49, 2 12 7, 2 12 8 (view selector), and 1 2 31 (crypt screen) agents
- Removes scripts: 2 12 7 events 1001/1002, 2 12 8 events 1001/1002/1003
