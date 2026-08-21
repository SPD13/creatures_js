# agent help.cos — In-Game Agent Help System

**Source**: `Assets/Bootstrap/001 World/agent help.cos`

## Overview

This script implements the in-game agent help system — an interactive tool that allows the player to inspect any agent in the world and view contextual help information. The system is toggled by pressing **F1** (key code 112). When activated, the pointer cursor changes to a help icon and clicking on agents displays information about them:

- **Left-click** on an agent shows a speech bubble with the agent's category name (via the speech bubble factory agent 1 2 10).
- **Right-click** on a non-creature agent opens a paginated help panel displaying the agent's title and description from the `"Agent Help"` catalogue entries.
- **Right-click** on a creature (family 4) opens the Creature History panel instead.

The help panel also includes a **Blueprint export** button that can create a physical pick-up object representing the inspected agent's blueprint, provided the agent has connections.

The system integrates with the GUI icons bar (1 2 14) to visually indicate when help mode is active, and with the speech bubble factory (1 2 10) to display agent names as floating bubbles.

**Catalogue Entries Used**: `"Agent Help <family> <genus> <species>"` (per-agent help), `"Agent Help Something"` (fallback text), `"Blueprint"` (blueprint export status messages)

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 4 | Agent Help Controller | `blnk` (blank) | Invisible controller that manages help mode toggling and dispatches help requests | [Detail](#agent-help-controller-1-2-4) |
| 1 2 5 | Agent Help Panel | `new_agent_help` | Paginated compound panel displaying agent title, description, and blueprint export button | [Detail](#agent-help-panel-1-2-5) |
| 1 2 23 | Creature History Panel | `creature_history` | Compound panel for viewing creature details and history (created when right-clicking a creature) | [Detail](#creature-history-panel-1-2-23) |
| 1 1 100 | Blueprint Pick-up | `pick-ups` | Physical object created by blueprint export, spawned at the inspected agent's position | [Detail](#blueprint-pick-up-1-1-100) |

---

## Agent Help Controller (1 2 4)

The Agent Help Controller is an invisible agent that listens for keyboard and mouse input to manage the entire help system. It tracks whether help mode is active via the `pure` flag, keeps a reference to the currently open help panel, and dispatches help requests based on what the player clicks.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 272 | Camera-shy (256) + Invisible to creatures (16) |
| `imsk` | 1 (off) / 9 (on) | Raw Key Down (1) when help mode is off; Raw Key Down (1) + Raw Mouse Down (8) when active |
| `pure` | 0 / 1 | Help mode state: 0 = inactive, 1 = active |
| `ov00` | agent / null | Reference to the currently open Agent Help Panel (1 2 5), null if none |
| `ov01` | 0 | Unused state variable (initialized to 0) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 73 | Raw Key Down | Toggles help mode on/off when F1 is pressed |
| 76 | Raw Mouse Down | Forwards mouse clicks to the help dispatch handler (event 1000) |
| 1000 | Custom (Help Dispatch) | Identifies the clicked agent and shows appropriate help |

#### Event 73 — Raw Key Down (Toggle Help Mode)

Triggered on every key press. Checks if the key is F1 (`_p1_ = 112`). If so:

**If the pointer is holding an agent** (`held ne null`):
- Plays the `"buzz"` sound effect and stops — help mode cannot be toggled while holding something.

**Toggling help mode OFF** (when `pure = 1`):
1. Resets the pointer cursor to pose 0 (normal).
2. Finds a random GUI icons agent (1 2 14) and resets its part 1 pose to 0 (deactivates visual indicator).
3. Sets `pure 0` to deactivate help mode.
4. Sets `imsk 1` — only listens for Raw Key Down (no more mouse clicks).
5. If a help panel is open (`ov00 <> null`), kills it and clears the reference.

**Toggling help mode ON** (when `pure = 0`):
1. Drops whatever the pointer's held agent target is holding (`nohh`).
2. Sets the pointer cursor to pose 18 (help cursor icon).
3. Finds a random GUI icons agent (1 2 14) and sets its part 1 pose to 1 (activates visual indicator).
4. Sets `pure 1` to activate help mode.
5. Sets `imsk 9` — listens for Raw Key Down (1) + Raw Mouse Down (8).

#### Event 76 — Raw Mouse Down (Forward Click)

When a mouse button is clicked while help mode is active, this event forwards the click to the help dispatch handler:

- Sends message 1000 to self with `_p1_` (mouse button: 1 = left, 2 = right) and `hots` (the agent under the mouse cursor).

#### Event 1000 — Help Dispatch

The main help logic. Receives `_p1_` (button type) and `_p2_` (clicked agent). Only acts if `_p2_` is not null (clicked on an actual agent).

**Left-click** (`_p1_ = 1` — Quick Identify):

1. Gets the clicked agent's category index via `cati fmly gnus spcs` and the category text via `catx`.
2. **Special case — GUI Icons (1 2 14)**: Sends message 73 with `_p1_ = 112` to self, effectively pressing F1 again to toggle help mode off. Clicking the help icon in the toolbar deactivates help mode.
3. **Special case — Agent Help Panel (1 2 5)**: Sends message 2006 to the pointer for all existing 1 2 5 agents (notifies pointer of panel interaction).
4. **Default case** (if category index is not 39): Finds a random speech bubble factory (1 2 10) and sends it message 126 (`_MAKE_SPEECH_BUBBLE`) with the category text and the target agent. Also orders the target agent to shout (`shou`) the category text.

**Right-click** (`_p1_ = 2` — Detailed Help):

1. **If target is a creature** (family = 4):
   - Creates a Creature History Panel (1 2 23) using `"creature_history"` sprite at plane 8520.
   - Sends it message 1000 with the creature reference and value 1001.
   - Toggles help mode off (sends self message 73 with F1 key code).
   - Stops execution.

2. **If target is a non-creature agent** and no help panel is currently open (`ov00 = null`):
   - Creates a new Agent Help Panel (1 2 5) — see [detail below](#agent-help-panel-1-2-5).
   - Centers the panel on the screen.
   - Stores the target agent in the panel's `ov02`.

3. Loads the agent's help text from the catalogue:
   - Title: `wild fmly gnus spcs "Agent Help" 0`
   - Description: `wild fmly gnus spcs "Agent Help" 1`
   - If description is `"***"` (no help available), uses the fallback text from `"Agent Help Something"` with the agent's classifier appended.

4. Sets the title (part 3) and description (part 1) on the help panel.
5. Stores the panel reference in `ov00` and sends message 1003 to update page navigation.

---

## Agent Help Panel (1 2 5)

A compound agent that displays a paginated help window with the agent's title, description text, navigation buttons, a page counter, and a blueprint export button. Created on demand when the player right-clicks an agent in help mode.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 304 | Camera-shy (256) + Floatable (32) + Invisible to creatures (16) |
| `ov02` | agent | Reference to the agent being inspected |

### Compound Parts

| Part | Type | Gallery | Purpose |
|---|---|---|---|
| 0 | Base | `new_agent_help` frame 0 | Background frame of the panel |
| 1 | Fixed Text (`pat: fixd`) | `new_agent_help` frame 1 | Main help description text (paginated, uses `WhiteOnTransparentChars` font) |
| 2 | Button (`pat: butt`) | `new_agent_help` frame 2 | Close button — sends message 1000 |
| 3 | Fixed Text (`pat: fixd`) | `new_agent_help` frame 12 | Title text area (uses `WhiteOnTransparentChars` font) |
| 4 | Button (`pat: butt`) | `new_agent_help` frame 9 | Next page button — sends message 1001 |
| 5 | Button (`pat: butt`) | `new_agent_help` frame 6 | Previous page button — sends message 1002 |
| 6 | Fixed Text (`pat: fixd`) | `new_agent_help` frame 15 | Page counter display (e.g., "1/3", uses `WhiteOnTransparentChars` font) |
| 7 | Button (`pat: butt`) | `new_agent_help` frame 4 | Blueprint export button — sends message 2000 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Custom (Close) | Closes and destroys the help panel |
| 1001 | Custom (Next Page) | Advances to the next page of help text |
| 1002 | Custom (Previous Page) | Goes back to the previous page of help text |
| 1003 | Custom (Update Page Counter) | Updates the page counter and navigation button states |
| 2000 | Custom (Blueprint Export) | Creates a blueprint pick-up object from the inspected agent |

#### Event 1000 — Close Panel

1. Animates the close button (part 2) with frames `[0 1]`.
2. Finds the Agent Help Controller (1 2 4) and clears its `ov00` reference.
3. Waits 10 ticks, then kills self (`kill ownr`).

#### Event 1001 — Next Page

1. Gets the current page number and total page count from part 1.
2. If not on the last page:
   - Animates the next page button (part 4) with frames `[2 2 2]` and waits for completion.
   - Advances part 1 to the next page.
3. Sends message 1003 to update the page counter display.

#### Event 1002 — Previous Page

1. Gets the current page number from part 1.
2. If not on the first page (page > 0):
   - Animates the previous page button (part 5) with frames `[2 2 2]` and waits for completion.
   - Moves part 1 back one page.
3. Sends message 1003 to update the page counter display.

#### Event 1003 — Update Page Counter

Updates the visual state of the navigation UI:

1. Reads total pages (`npgs`) and current page from part 1.
2. Formats the page counter string as `"current/total"` (1-indexed) and sets it on part 6.
3. **Previous button** (part 5): Sets to disabled frame (0) if on first page, enabled frame (1) otherwise.
4. **Next button** (part 4): Sets to disabled frame (0) if on last page, enabled frame (1) otherwise.

#### Event 2000 — Blueprint Export

Creates a physical blueprint pick-up object from the inspected agent. Runs with `inst` + `lock` to prevent interruption.

1. Animates the blueprint button (part 7) with frames `[0 1]`.
2. Counts the connections on the inspected agent (`ov02`) using `econ`/`next`.
3. Checks the last character of the current help text to see if a blueprint was already created (ends with `"-"`).
4. **If the agent has more than one connection, text doesn't end with "-", and the agent exists**:
   - Creates a Blueprint Pick-up (1 1 100) at the inspected agent's position using the `"pick-ups"` sprite.
   - Sets physics: permeability 60, elasticity 10, friction 90, gravity 2.
   - Validates the target position with `tmvt`; if invalid, tries 20 pixels higher; if still invalid, kills the pick-up.
   - If placement succeeds, moves the pick-up and sends it message 1000 with the inspected agent reference.
   - Appends `"Blueprint created"` text (Blueprint catalogue entry 4) to the help description.
5. **If blueprint cannot be created** (no connections, already exported, or agent doesn't exist):
   - Appends `"Blueprint not available"` text (Blueprint catalogue entry 5) to the help description.
6. Animates the button back with frames `[1 0]`.

---

## Creature History Panel (1 2 23)

A compound agent created when the player right-clicks on a creature (family 4) while in help mode. Uses the `"creature_history"` sprite gallery. This panel provides creature naming, heritage tracking, and photography features.

The panel is created at plane 8520 and immediately receives message 1000 with the creature reference and value 1001. Its detailed behavior is defined elsewhere (likely in a separate creature history script). This script only handles its creation and cleanup.

---

## Blueprint Pick-up (1 1 100)

A simple physical agent created by the blueprint export feature. It uses the `"pick-ups"` sprite and is spawned at the inspected agent's position with full physics properties (gravity, friction, elasticity, permeability). The pick-up represents a portable blueprint of the agent that can be carried and potentially exported.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activatable (4) + Floatable (32) + Suffering collision (64) + Open air (128) — note: actual flag interpretation may vary |
| `perm` | 60 | Permeability |
| `elas` | 10 | Elasticity |
| `fric` | 90 | Friction |
| `accg` | 2 | Gravity acceleration |
| `ov98` | "" | Blueprint data string (empty on creation) |
| `ov61` | 1 | Blueprint state flag |

Created at plane 5000. Receives message 1000 with the reference to the source agent for further initialization.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the agent help system:

1. Kills all Agent Help Controller agents (`enum 1 2 4 → kill targ`).
2. Kills all Agent Help Panel agents (`enum 1 2 5 → kill targ`).
3. Kills all Creature History Panel agents (`enum 1 2 23 → kill targ`).
4. Removes the Raw Mouse Down script for the controller (`scrx 1 2 4 76`).
5. Removes the Close script for the help panel (`scrx 1 2 5 1000`).

Note: Not all event scripts are explicitly removed — scripts 1 2 4 event 73/1000 and scripts 1 2 5 events 1001/1002/1003/2000 are not individually unregistered.
