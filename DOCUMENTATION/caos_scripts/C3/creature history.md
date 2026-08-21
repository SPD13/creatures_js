# Creature History

## Overview

This script implements the **Creature History** applet, a multi-tabbed UI panel that allows the player to view detailed information about a selected creature. It is one of the core applet panels accessible from the game's GUI system. The script sets the game variable `c3_after_shee_dates` to `0`, controlling whether dates are displayed in real-time format or in-game Shee calendar format.

The Creature History panel is a compound agent (`1 2 23`) that provides four distinct pages of information about a creature:

1. **Info Page** - Name (editable), user notes, birth date, age, life stage, and a live camera view of the creature
2. **Timeline Page** - A scrollable chronological list of significant life events (birth, aging, breeding, death, etc.) with timestamps and associated creatures
3. **Photo Album Page** - Browse, take, and delete photos of the creature with date stamps
4. **Genetics Page** - Displays the creature's moniker, crossover count, and mutation point count

The panel opens centered on screen and floats above other agents. It handles creature selection via message passing (receiving either an agent reference or a moniker string) and supports switching between creatures by clicking on creature references in the timeline.

## Created Agents

| Classifier | Description | Details |
|-----------|-------------|---------|
| `1 2 23` | Creature History applet - the main multi-tabbed UI panel | [Details](#agent-1-2-23-creature-history-applet) |
| `1 2 29` | Blank helper agent used as a transparent overlay for click detection | [Details](#agent-1-2-29-blank-helper) |

---

## Agent `1 2 23` — Creature History Applet

The main Creature History compound agent. It uses the `creature_history` sprite gallery for all its visual elements and creates multiple UI parts (buttons, text fields, camera views, dull parts) depending on which page is active. Parts are dynamically created and destroyed when switching between pages.

### Key Object Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `ov00` | Agent | Reference to the currently viewed creature agent |
| `ov01` | String | Moniker of the currently viewed creature |
| `ov02` | Integer | Current page number (1001=Info, 1002=Timeline, 1003=Photos, 1004=Genetics) |
| `ov03` | Agent | Reference to the blank helper agent (`1 2 29`) |
| `ov10` | Agent | Pending creature agent reference (for state change comparison) |
| `ov11` | String | Pending creature moniker |
| `ov12` | Integer | Pending page number |
| `ov20` | Integer | Timeline: cached history event count |
| `ov21` | Integer | Timeline: current scroll offset (page index) |
| `ov22` | Integer | Timeline: last rendered scroll offset |
| `ov23` | Integer | Timeline: scrollbar created flag |
| `ov30` | Integer | Photos: current photo event index |
| `ov31` | Integer | Photos: navigation direction flag (1=forward, -1=backward, 2=both) |

### Events

| Event | Script | Description |
|-------|--------|-------------|
| 1000 | `scrp 1 2 23 1000` | Activation / Create |
| 75 | `scrp 1 2 23 75` | Mouse hover (plane adjustment) |
| 123 | `scrp 1 2 23 123` | Window resize (recenters panel) |
| 2002 | `scrp 1 2 23 2002` | Close button pressed |
| 2003 | `scrp 1 2 23 2003` | Info tab button pressed |
| 2004 | `scrp 1 2 23 2004` | Timeline tab button pressed |
| 2005 | `scrp 1 2 23 2005` | Photos tab button pressed |
| 2006 | `scrp 1 2 23 2006` | Genetics tab button pressed |
| 999 | `scrp 1 2 23 999` | Creature selection (receives agent or moniker) |
| 120 | `scrp 1 2 23 120` | Click handler (forwards creature selection) |
| 998 | `scrp 1 2 23 998` | Moniker validation and creature resolution |
| 9 | `scrp 1 2 23 9` | Refresh header display (gender icon, name, genus, location) |
| 256 | `scrp 1 2 23 256` | State change handler (rebuilds current page when creature/page changes) |
| 1001 | `scrp 1 2 23 1001` | Render Info page |
| 3001 | `scrp 1 2 23 3001` | Calculate and display creature age |
| 2000 | `scrp 1 2 23 2000` | Name edit confirmation (saves edited name to history) |
| 2001 | `scrp 1 2 23 2001` | Focus removal (unfocuses text input) |
| 1002 | `scrp 1 2 23 1002` | Render Timeline page |
| 2010 | `scrp 1 2 23 2010` | Timeline update / pagination logic |
| 2011 | `scrp 1 2 23 2011` | Scroll up in timeline |
| 2012 | `scrp 1 2 23 2012` | Scroll down in timeline |
| 2013 | `scrp 1 2 23 2013` | Click creature moniker button 1 in timeline row |
| 2014 | `scrp 1 2 23 2014` | Click creature moniker button 2 in timeline row |
| 3002 | `scrp 1 2 23 3002` | Timeline auxiliary (empty) |
| 127 | `scrp 1 2 23 127` | External notification (history update from other agents) |
| 1003 | `scrp 1 2 23 1003` | Render Photo Album page |
| 2024 | `scrp 1 2 23 2024` | Photo navigation update |
| 2020 | `scrp 1 2 23 2020` | Take photo button |
| 2021 | `scrp 1 2 23 2021` | Delete photo button |
| 2022 | `scrp 1 2 23 2022` | Previous photo button |
| 2023 | `scrp 1 2 23 2023` | Next photo button |
| 3003 | `scrp 1 2 23 3003` | Photo auxiliary (empty) |
| 1004 | `scrp 1 2 23 1004` | Render Genetics page |
| 3004 | `scrp 1 2 23 3004` | Genetics auxiliary (empty) |

### Event Details

#### Event 1000 — Activation / Create

The main creation script. When activated, it first checks if another instance already exists (max 1 allowed) — if a duplicate is found, it transfers the caller's creature reference (`_p2_`) to the existing instance and kills itself. Otherwise it initializes all state variables, sets up the input mask for keyboard events (`imsk 4`), centers itself on screen, sets floating attributes (`attr 304`), and creates the persistent UI elements:
- **Part 101**: Close button
- **Part 102**: Gender icon (dull part)
- **Part 103-106**: Four tab buttons (Info, Timeline, Photos, Genetics)
- **Part 107**: Creature name/info text field (fixed text)
- **Part 108**: Location text field (right-aligned)

It also creates the blank helper agent (`1 2 29`) stored in `mv03`, sets a tick rate of 20 for periodic updates, and sends itself the initial creature selection message.

#### Event 75 — Mouse Hover

Adjusts the display plane of the panel. When the mouse is hovering over this agent, it raises to plane 8915; otherwise it drops to plane 8520. This ensures the panel appears above other UI elements when interacted with.

#### Event 123 — Window Resize

Recenters the panel on screen when the game window is resized by recalculating position based on current window dimensions.

#### Event 2002 — Close Button

Saves any pending edits from the Info page (creature name and user text), plays a button animation, sends close messages (`127`) to the Agent Help (`1 2 13`) and Creature Control (`1 2 14`) panels, restores default focus, then kills the helper agent and itself.

#### Events 2003-2006 — Tab Buttons

Each tab button plays a click sound (`cmc4`), sets `ov12` to the corresponding page number (1001-1004), and triggers the state change handler (message 256) which rebuilds the display for the selected page.

#### Event 999 — Creature Selection

Receives a creature reference. If the parameter is an agent (type 7), it extracts the moniker via `gtos` and forwards it. If it's a string (moniker), it validates it's not empty. In either case, it sends message 998 with the moniker for validation. If the creature reference is null or empty, it kills the panel.

#### Event 998 — Moniker Validation

Checks if the creature (identified by moniker) has any history data (`ooww` > 0). If not, it stops. Otherwise, it resolves the creature agent from the moniker (`mtoc`), stores the pending creature reference and moniker, and triggers a page rebuild via message 256.

#### Event 9 — Refresh Header

Updates the persistent header elements:
- **Part 102**: Sets gender icon pose (0=unknown, 2=male, 4=female)
- **Part 107**: Displays creature name, gender text, and genus (Norn/Grendel/Ettin/Geat)
- **Part 108**: Displays creature's current location (world name from `ooww`)

Then triggers the current page's sub-refresh by sending the page number + 2000 as a message.

#### Event 256 — State Change Handler

Compares current state (creature, moniker, page) with pending state. If nothing changed, stops. If the page is the Info page (1001), saves any pending name/text edits before switching. Destroys all dynamic parts (1-99) and rebuilds the page by updating state variables and sending the new page number as a message.

#### Event 1001 — Info Page

Renders the Info page with:
- Background pose 0
- **Part 1**: "Name:" label
- **Part 2**: Editable name text field (triggers message 2000 on edit)
- **Part 3**: "About:" label
- **Part 4**: Editable multi-line user text field (triggers message 2001)
- **Part 5**: Birth date display
- **Part 6**: "Born:" label
- **Part 8**: "Age:" label
- **Part 9**: Age display (updated via message 3001)
- **Part 10**: Live camera view of the creature (120x141 pixels)
- **Part 11**: Moniker display

Birth date can be shown in either real-time format or Shee calendar format depending on the `c3_after_shee_dates` game variable.

#### Event 3001 — Age Calculation

Calculates and displays the creature's age. If the creature agent exists, uses live `tage`/`cage` values. Otherwise, uses the last history entry's recorded age. Formats the age as "Xhrs Ymins" with appropriate singular/plural labels. Prepends the life stage name if available (Baby, Child, Adolescent, etc.).

#### Event 1002 — Timeline Page

Renders the Timeline/Events page with background pose 2. Creates 7 event rows, each containing:
- An event icon (dull part)
- Event description text
- Age/date text
- Two creature moniker buttons (for related creatures like parents or mates)
- Two additional text fields

Sets up pagination variables and triggers the timeline update (message 2010).

#### Event 2010 — Timeline Update

Complex pagination and event filtering logic. Iterates through the creature's history events, filtering for significant event types:
- Type 7: Death
- Type 12: Aged (life stage change)
- Type 3: Born/cloned
- Type 10: Became pregnant
- Type 8: Had offspring (laid egg)
- Type 6: Crossed into another world
- Type 5: Was exported
- Type 4 with cage=4: Reached adulthood

For each visible event, displays:
- Event icon (pose based on type)
- Event description from catalogue
- Age at time of event (formatted as hours/minutes)
- Date/time of event
- Related creature monikers (via clickable buttons)

Creates a scrollbar with up/down buttons if there are more than 7 events.

#### Events 2011/2012 — Timeline Scroll

Scroll up decrements `ov21`, scroll down increments it. Both play button animations and trigger a timeline refresh (message 2010).

#### Events 2013/2014 — Timeline Creature Buttons

When a creature moniker button is clicked in a timeline row, it sends the moniker stored in the helper agent's (`ov03`) corresponding part variable to message 998 for creature switching.

#### Event 127 — External Notification

Handles notifications from other agents (e.g., when history is updated). If viewing the Timeline page and the notification matches the current creature, refreshes the timeline. If viewing the Photos page, triggers a photo navigation update.

#### Event 1003 — Photo Album Page

Renders the Photo Album page with background pose 22. Creates:
- **Part 2**: Take photo button
- **Part 3**: Delete photo button
- **Part 4**: Previous photo button
- **Part 5**: Next photo button
- **Parts 10-12**: Three photo display panels (previous, current, next)
- **Part 13**: Photo date text
- **Part 1**: Camera view of the creature (120x139 pixels)

Initializes photo navigation and triggers the photo update (message 2024).

#### Event 2024 — Photo Navigation Update

Searches through the creature's history for photo events (type 13) that have associated photo files. Displays the current photo and loads the previous/next photos as thumbnails. Shows the date the photo was taken. Handles forward, backward, and bidirectional search based on `ov31`.

#### Event 2020 — Take Photo

Takes a snapshot of the creature using `snap` command, saves it to a file named `{moniker}-{eventcount}`, records a photo event in the creature's history, and navigates to show the new photo. Plays camera shutter sounds (`cmc1`, `cmc2`). If no creature is selected, plays a buzz sound.

#### Event 2021 — Delete Photo

Deletes the currently displayed photo by clearing its filename in the history record. Plays a delete sound (`cmc3`). Triggers navigation update to show remaining photos.

#### Events 2022/2023 — Photo Navigation

Previous (`2022`) sets `ov31` to -1, Next (`2023`) sets `ov31` to 1, then both trigger the photo update (message 2024) to navigate through available photos.

#### Event 1004 — Genetics Page

Renders the Genetics page with background pose 21. Displays:
- **Part 2**: "Genetics" label
- **Part 1**: Moniker string
- **Part 3**: Crossover point count (`hist cros`)
- **Part 4**: Mutation point count (`hist mute`)

### Remove Script

The remove script (`rscr`) kills all instances of `1 2 23` (Creature History) and `1 2 29` (blank helper) agents.

---

## Agent `1 2 29` — Blank Helper

A simple agent (`new: simp 1 2 29 "blnk" 0 0 0`) created as a helper/storage object by the Creature History applet. It uses a blank sprite and serves as a container for storing creature moniker strings in its part variables (`avar`), which are referenced when the player clicks creature buttons in the timeline view. The reference to this agent is stored in `mv03` of the parent Creature History agent.

This agent has no scripts of its own — it is entirely controlled by the Creature History applet.
