# map display.cos - Interactive Map Display Panel

**Source**: `Assets/Bootstrap/001 World/map display.cos`

## Overview

This script implements the interactive map display panel for the Creatures 3 ship. The map display is a compound agent that provides the player with a visual overview of the ship's different areas (metarooms) and the ability to track creature positions within them. The panel features an open/close toggle button, six navigable area views, and three creature-type filter toggles (Norns, Grendels, Ettins).

When the player opens the map display and selects an area, the panel shows a zoomed-in schematic of that metaroom. If creature tracking toggles are active, the panel periodically refreshes (via timer tick) to display small dot markers representing the positions of Norns, Grendels, and/or Ettins within the selected area. The creature positions are translated from world coordinates to the panel's local coordinate space using area-specific scaling factors and offsets.

The map display supports two levels of zoom: an overview mode (ov00 = 0) that shows all metarooms grouped by region, and individual area views (ov00 = 1-6) that show a single metaroom at larger scale. The overview mode groups creatures by metaroom into columns on the panel rather than plotting exact positions.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 21 | Map Display Panel | `mapdisplay` frame 13 | Compound agent — the main map display with buttons and area views | [Detail](#map-display-panel-1-2-21) |
| 2 12 6 | Map Open/Close Button | `mapdisplay` frame 38 | Simple agent — toggles the map panel open and closed | [Detail](#map-openclose-button-2-12-6) |
| 1 2 36 | Creature Dot Marker | `mapdisplay` frame 21/22/23 | Simple agent — represents a creature's position on the map | [Detail](#creature-dot-marker-1-2-36) |

---

## Map Display Panel (1 2 21)

The main map display is a compound agent that serves as the interactive map interface. It starts in a closed state and is opened/closed by the companion button agent (2 12 6). When open, it presents six area selection buttons and three creature-type toggle buttons. Selecting an area switches the panel's background to show that area's schematic, and the timer script periodically plots creature positions.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `mapdisplay` | 13 images, first image 13 |
| Plane | 0 | Default plane |
| Position | (853, 3265) | Located in the ship |

### OV Variables

| Variable | Purpose |
|---|---|
| ov00 | Current area view: 0 = overview, 1 = Ettin Desert, 2 = Aquarium (surface), 3 = Grendel Jungle (upper), 4 = Bridge East, 5 = Norn Vivarium, 6 = Norn Vivarium (alt view) |
| ov01 | Norn tracking toggle: 0 = off, 1 = on |
| ov02 | Grendel tracking toggle: 0 = off, 1 = on |
| ov03 | Ettin tracking toggle: 0 = off, 1 = on |

### Button Parts (Created on Open)

| Part | Sprite | Position (relative) | Message | Purpose |
|---|---|---|---|---|
| 1 | `mapdisplay` frame 24 | (187, 27) | 1002 | Area 1: Ettin Desert |
| 2 | `mapdisplay` frame 26 | (271, 27) | 1003 | Area 2: Aquarium |
| 3 | `mapdisplay` frame 28 | (106, 82) | 1004 | Area 3: Grendel Jungle |
| 4 | `mapdisplay` frame 30 | (322, 82) | 1005 | Area 4: Bridge East |
| 5 | `mapdisplay` frame 32 | (187, 143) | 1006 | Area 5: Norn Vivarium |
| 6 | `mapdisplay` frame 34 | (271, 143) | 1007 | Area 6: Norn Vivarium (alt) |
| 7 | `mapdisplay` frame 13 | (26, 143) | 1009 | Toggle: Norn tracking |
| 8 | `mapdisplay` frame 15 | (63, 143) | 1010 | Toggle: Grendel tracking |
| 9 | `mapdisplay` frame 17 | (103, 143) | 1011 | Toggle: Ettin tracking |

### Events

| Event | Number | Description |
|---|---|---|
| Message | 1000 | Open the map panel (sent by the open/close button) |
| Message | 1001 | Close the map panel (sent by the open/close button) |
| Message | 1002 | Select Area 1: Ettin Desert |
| Message | 1003 | Select Area 2: Aquarium |
| Message | 1004 | Select Area 3: Grendel Jungle |
| Message | 1005 | Select Area 4: Bridge East |
| Message | 1006 | Select Area 5: Norn Vivarium |
| Message | 1007 | Select Area 6: Norn Vivarium (alt) |
| Message | 1008 | Back to overview (from area detail view) |
| Message | 1009 | Toggle Norn creature tracking |
| Message | 1010 | Toggle Grendel creature tracking |
| Message | 1011 | Toggle Ettin creature tracking |
| Timer | 9 | Refresh creature position dots on the map |

### Event Behaviors

**Message 1000 — Open Panel**: Plays the "map1" sound and runs an opening animation (frames 0-6). Creates all button parts (area buttons 1-6 and creature toggle buttons 7-9). Sets ov00 to 0 (overview mode).

**Message 1001 — Close Panel**: Plays the "map3" sound. Kills all creature dot markers (1 2 36). Destroys all button parts (1-9). Resets all tracking toggles (ov01, ov02, ov03) to 0. Plays closing animation (frames 6-0). Stops the timer.

**Messages 1002-1007 — Select Area**: Each plays the "map4" sound, kills existing dot markers, sets ov00 to the corresponding area number (1-6), destroys the six area buttons (1-6), changes the panel's background pose to show that area's schematic, and creates a single "back" button (part 1, sprite frame 19) that sends message 1008.

**Message 1008 — Back to Overview**: Plays the "map4" sound, kills existing dot markers, resets ov00 to 0, destroys the back button, sets the panel pose to the overview frame (6), and recreates all six area buttons and six area selection buttons.

**Messages 1009-1011 — Toggle Creature Tracking**: Each toggles the respective tracking variable (ov01/ov02/ov03) between 0 and 1, plays the "map2" sound, and updates the toggle button's visual state. When a toggle is turned off, existing dot markers of that type are killed. When any toggle is active and no other toggles were already active, the timer is started (tick 10). When all toggles are off, the timer is stopped (tick 0).

**Timer 9 — Refresh Creature Positions**: This is the core creature-tracking logic. First, all existing dot markers (1 2 36) are killed. Then, based on the current area view (ov00) and active toggles, the script iterates through all creatures of each enabled type using `enum 4 [genus] 0`:

- **Norns** (4 1 0) — shown if ov01 = 1, displayed as sprite frame 22
- **Grendels** (4 2 0) — shown if ov02 = 1, displayed as sprite frame 21 (note: despite toggle order, Grendels use frame 21)
- **Ettins** (4 3 0) — shown if ov03 = 1, displayed as sprite frame 23

For each creature, its world position is checked against the currently viewed metaroom using `gmap`. If the creature is in the displayed metaroom, its world coordinates are transformed to panel-relative coordinates using area-specific offsets and scale factors, then a dot marker is created and positioned there.

**Area-specific coordinate transforms:**

| Area (ov00) | Metaroom ID | X Offset | Y Offset | X Scale | Y Scale | Extra Offset |
|---|---|---|---|---|---|---|
| 1 (Ettin Desert) | 1 | -4325 | -120 | /9.7 | /8.3 | +127, +45 for Norns/Ettins |
| 2 (Aquarium surface) | 2 | — | — | — | — | (not directly mapped — uses metaroom 2 check in area 5) |
| 3 (Grendel Jungle) | 4 (x < 3220) | -122 | -2915 | /10.8 | /10.2 | +115, +46 |
| 4 (Bridge East) | 4 (x > 4485) | -4485 | -3082 | /10.1 | /9.7 | +146, +41 |
| 5 (Norn Vivarium) | 3 | -60 | -1373 | /10 | /10.2 | +115, +40 |
| 5 (Norn Vivarium) | 2 | -3266 | -1580 | /9.8 | /10.3 | +117, +40 |
| 6 (Norn Vivarium alt) | 0 | -140 | 0 | /13.4 | /11.4 | +120, +40 |
| 0 (Overview) | 0-4 | — | — | — | — | Column layout by metaroom |

In overview mode (ov00 = 0), creatures are not plotted at exact positions but instead grouped into columns by metaroom, stacked vertically with 5px spacing between dots.

---

## Map Open/Close Button (2 12 6)

A simple agent that acts as the toggle button to open and close the map display panel. It pulses with a slow animation when idle and sends messages to the map display panel to trigger open/close.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `mapdisplay` | 2 images, first image 38 |
| Attributes | 4 | Activatable |
| Click action | 0 | CLAC 0 = activate 1 |
| Position | (1421, 3386) | Near the map display panel |
| Animation | [0 0...1 1... 255] | Slow pulse between frames 0 and 1 |

### OV Variables

| Variable | Purpose |
|---|---|
| ov16 | Reference to the parent map display panel agent (1 2 21) |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Open the map (first click) |
| Activate 2 | 2 | Close the map (second click) |

### Event Behaviors

**Activate 1 — Open Map**: Locks execution. Disables further clicks temporarily (clac -1). Plays a rapid flashing animation. Sends message 1000 to the map display panel (ov16) to open it. Waits for animation to finish (over), then restores the idle pulse animation and sets click action to 1 (so next click triggers Activate 2).

**Activate 2 — Close Map**: Locks execution. Disables further clicks temporarily (clac -1). Plays a rapid flashing animation. Sends message 1001 to the map display panel (ov16) to close it. Waits for animation to finish (over), then restores the idle pulse animation and sets click action to 0 (so next click triggers Activate 1).

---

## Creature Dot Marker (1 2 36)

Temporary simple agents created by the map display's timer script to represent creature positions on the map. Each dot corresponds to a single creature and uses a different sprite frame depending on the creature type. These markers are ephemeral — they are killed and recreated every timer tick (10 ticks) to reflect current creature positions.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `mapdisplay` | 1 image per variant |
| First image | 21 (Grendel), 22 (Norn), 23 (Ettin) | Color-coded by creature type |
| Attributes | 32 | Invisible to creatures |
| Relationship | `frel ownr` | Floats relative to the map display panel |

### Lifecycle

Dot markers have no event scripts. They are created by the map display's timer script (event 9), positioned relative to the panel using `flto`, and destroyed at the start of the next timer tick or when the map is closed / area is changed. They exist solely as visual indicators.

---

## Removal Script

The removal script (`rscr`) cleans up all agents created by this script:
- Kills all map open/close buttons (2 12 6)
- Kills all map display panels (1 2 21)
- Kills all creature dot markers (1 2 36)
