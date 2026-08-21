# Favourite Places

**Source**: `Bootstrap/001 World/favourite places.cos`

## Overview

This script implements the **Favourite Places** quick-navigation system, which allows the player to instantly teleport the camera to key locations on the Ark ship. Seven invisible marker agents are placed at strategic positions throughout the world. Each marker has a periodic timer that checks if it is visible on screen; when visible, it spawns a floating popup panel that slides upward into view. Clicking a popup panel teleports the camera to the associated location.

One of the marker agents (the Desert/Engineering Left marker, `1 1 33`) also acts as a **master location indicator controller**: on every tick, it checks which metaroom the camera is currently viewing and highlights the corresponding popup panel while unhighlighting the others. This gives the player visual feedback about which area of the ship they are currently in.

The popup panels use sprite sheet `favouriteplaces` with alternating poses (highlighted/unhighlighted) and are rendered at plane 8505 (high UI overlay layer). They are activatable, suffer physics (for the slide-up animation via velocity), and suffer collision.

## Created Agents

### Marker Agents (Invisible World Anchors)

| Classifier | Name | Location | Details |
|---|---|---|---|
| `1 1 31` | Norn Terrarium Marker | (5282, 608) | [Details](#1-1-31-norn-terrarium-marker) |
| `1 1 32` | Jungle Terrarium Marker | (4625, 1721) | [Details](#1-1-32-jungle-terrarium-marker) |
| `1 1 33` | Desert/Engineering Left Marker | (1298, 3226) | [Details](#1-1-33-desertengineering-left-marker) |
| `1 1 34` | Desert/Engineering Right Marker | (5586, 3334) | [Details](#1-1-34-desertengineering-right-marker) |
| `1 1 35` | Marine Terrarium Marker | (426, 1745) | [Details](#1-1-35-marine-terrarium-marker) |
| `1 1 36` | Bridge Marker | (1109, 733) | [Details](#1-1-36-bridge-marker) |
| `1 1 107` | Learning Room Marker | (8892, 145) | [Details](#1-1-107-learning-room-marker) |

### Popup Panel Agents (Floating Navigation Buttons)

| Classifier | Name | Associated Marker | Details |
|---|---|---|---|
| `1 2 15` | Norn Terrarium Popup | `1 1 31` | [Details](#1-2-15-norn-terrarium-popup) |
| `1 2 16` | Jungle Terrarium Popup | `1 1 32` | [Details](#1-2-16-jungle-terrarium-popup) |
| `1 2 17` | Desert/Engineering Left Popup | `1 1 33` | [Details](#1-2-17-desertengineering-left-popup) |
| `1 2 18` | Desert/Engineering Right Popup | `1 1 34` | [Details](#1-2-18-desertengineering-right-popup) |
| `1 2 19` | Marine Terrarium Popup | `1 1 35` | [Details](#1-2-19-marine-terrarium-popup) |
| `1 2 20` | Bridge Popup | `1 1 36` | [Details](#1-2-20-bridge-popup) |
| `1 2 38` | Learning Room Popup | `1 1 107` | [Details](#1-2-38-learning-room-popup) |

---

## Marker Agent Details

All marker agents share the same fundamental behavior: they are invisible (`attr 16`) simple agents using the `favouriteplaces` sprite sheet, placed at fixed world coordinates. They run on a periodic timer (`tick 10`, except `1 1 33` which uses `tick 1`) and spawn their corresponding popup panel when visible on screen.

### Marker Metaroom Mapping

The master controller (`1 1 33` timer event) maps metarooms to popups:

| Metaroom ID | Area | Highlighted Popup |
|---|---|---|
| 0 | Bridge | `1 2 20` |
| 1 | Norn Terrarium | `1 2 15` |
| 2 | Jungle Terrarium | `1 2 16` |
| 3 | Marine/Aquatic Terrarium | `1 2 19` |
| 4 (camera x <= 3674) | Desert/Engineering Left | `1 2 17` |
| 4 (camera x > 3674) | Desert/Engineering Right | `1 2 18` |
| 7 | Learning Room | `1 2 38` |

---

### `1 1 31` — Norn Terrarium Marker

Invisible marker placed at (5282, 608) in the Norn Terrarium area. Sprite base image 24. Timer tick: 10.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Checks visibility; if visible on screen and not already triggered (`ov00 == 0`), plays sound `fp_2`, creates popup `1 2 15`, and sets cooldown (`ov00 = 5`) |

**Timer Behavior**: When the marker becomes visible in the camera viewport (`visi 0 eq 1`), it creates the Norn Terrarium popup panel centered on screen, gives it upward velocity (-10), and sets a tick of 2 on the popup to start its animation. Uses `ov00` as a cooldown/state flag to prevent re-triggering.

---

### `1 1 32` — Jungle Terrarium Marker

Invisible marker placed at (4625, 1721) in the Jungle Terrarium area. Sprite base image 25. Timer tick: 10.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Checks visibility; if visible, plays `fp_2`, creates popup `1 2 16`, sets cooldown |

**Timer Behavior**: Same pattern as `1 1 31`. The popup is offset horizontally by +50 pixels from center.

---

### `1 1 33` — Desert/Engineering Left Marker

Invisible marker placed at (1298, 3226) in the left section of the Desert/Engineering area. Sprite base image 26. Timer tick: 1 (fastest of all markers).

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Creates popup `1 2 17` when visible; also acts as **master location indicator controller** |

**Timer Behavior**: In addition to the standard popup creation (with -150 pixel horizontal offset), this agent has a second major role. On every tick, it determines which metaroom the camera center is in (`meta` command) and sends message 1000 to the appropriate popup panel to highlight it (pose 1). It also unhighlights panels for areas the player is NOT currently viewing (pose 0). This is the only marker that performs this cross-popup coordination, and its faster tick rate (1 vs 10) ensures responsive location indication updates.

The camera center X position (`wndl + 400`) is compared against threshold 3674 to distinguish between the left and right halves of metaroom 4 (Desert/Engineering area).

---

### `1 1 34` — Desert/Engineering Right Marker

Invisible marker placed at (5586, 3334) in the right section of the Desert/Engineering area. Sprite base image 27. Timer tick: 10.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Checks visibility; if visible, plays `fp_2`, creates popup `1 2 18`, sets cooldown |

**Timer Behavior**: Same pattern as others. Popup offset: -100 pixels from center.

---

### `1 1 35` — Marine Terrarium Marker

Invisible marker placed at (426, 1745) in the Marine/Aquatic Terrarium area. Sprite base image 28. Timer tick: 10.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Checks visibility; if visible, plays `fp_2`, creates popup `1 2 19`, sets cooldown |

**Timer Behavior**: Same pattern. Popup offset: -50 pixels from center.

---

### `1 1 36` — Bridge Marker

Invisible marker placed at (1109, 733) on the Bridge. Sprite base image 29. Timer tick: 10.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Checks visibility; if visible, plays `fp_2`, creates popup `1 2 20`, sets cooldown |

**Timer Behavior**: Same pattern. Popup offset: -200 pixels from center.

---

### `1 1 107` — Learning Room Marker

Invisible marker placed at (8892, 145) in the Learning Room. Sprite base image 30. Timer tick: 10.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Checks visibility; if visible, plays `fp_2`, creates popup `1 2 38`, sets cooldown |

**Timer Behavior**: Same pattern. Popup offset: -250 pixels from center.

---

## Popup Panel Agent Details

All popup panels share common behavior. They are created dynamically by their associated marker agent using the `favouriteplaces` sprite sheet at plane 8505 (high UI overlay). They have `attr 52` (Activatable + Suffers Collision + Suffers Physics) and `clac 0` (click action = Activate1).

### Common Popup Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Vertical velocity state (oscillates with `negv`) |
| `ov99` | Current highlight state: 0 = unhighlighted (pose 0), 1 = highlighted (pose 1) |

---

### `1 2 15` — Norn Terrarium Popup

Floating popup panel for the Norn Terrarium. Sprite base image 6, 2 frames. Horizontal stop position: center + 20px.

| Event | Number | Description |
|---|---|---|
| Activate1 | 1 | Plays `fp_1` sound, teleports camera to `1 1 31` marker position via `cmrt 0` |
| Timer | 9 | Manages vertical scrolling animation; stops panel when it reaches near the top of the window |
| Key Down | 123 | Sends message 9 to self (triggers timer behavior) |
| Custom (Toggle) | 1000 | Toggles between highlighted (pose 1) and unhighlighted (pose 0) states |

**Activate1 Behavior**: Plays the `fp_1` click sound, finds the Norn Terrarium marker agent (`rtar 1 1 31`), and teleports the main camera to that agent's room (`cmrt 0`).

**Timer Behavior**: Checks if the popup has scrolled near the top of the window (within 30 pixels of the window top edge). If so, stops movement, resets state, positions the panel at its final horizontal position, and disables the timer. Otherwise, continues the upward float with alternating velocity (using `negv ov00` for oscillation).

---

### `1 2 16` — Jungle Terrarium Popup

Floating popup panel for the Jungle Terrarium. Sprite base image 8. Horizontal stop position: center + 70px.

| Event | Number | Description |
|---|---|---|
| Activate1 | 1 | Plays `fp_1`, teleports camera to `1 1 32` marker |
| Timer | 9 | Vertical scrolling animation to top of window |
| Key Down | 123 | Triggers timer behavior |
| Custom (Toggle) | 1000 | Toggles highlight state |

---

### `1 2 17` — Desert/Engineering Left Popup

Floating popup panel for the left Desert/Engineering area. Sprite base image 10. Horizontal stop position: center - 130px.

| Event | Number | Description |
|---|---|---|
| Activate1 | 1 | Plays `fp_1`, teleports camera to `1 1 33` marker |
| Timer | 9 | Vertical scrolling animation to top of window |
| Key Down | 123 | Triggers timer behavior |
| Custom (Toggle) | 1000 | Toggles highlight state |

---

### `1 2 18` — Desert/Engineering Right Popup

Floating popup panel for the right Desert/Engineering area. Sprite base image 12. Horizontal stop position: center - 80px.

| Event | Number | Description |
|---|---|---|
| Activate1 | 1 | Plays `fp_1`, teleports camera to `1 1 34` marker |
| Timer | 9 | Vertical scrolling animation to top of window |
| Key Down | 123 | Triggers timer behavior |
| Custom (Toggle) | 1000 | Toggles highlight state |

---

### `1 2 19` — Marine Terrarium Popup

Floating popup panel for the Marine/Aquatic Terrarium. Sprite base image 14. Horizontal stop position: center - 30px.

| Event | Number | Description |
|---|---|---|
| Activate1 | 1 | Plays `fp_1`, teleports camera to `1 1 35` marker |
| Timer | 9 | Vertical scrolling animation to top of window |
| Key Down | 123 | Triggers timer behavior |
| Custom (Toggle) | 1000 | Toggles highlight state |

---

### `1 2 20` — Bridge Popup

Floating popup panel for the Bridge. Sprite base image 16. Horizontal stop position: center - 180px.

| Event | Number | Description |
|---|---|---|
| Activate1 | 1 | Plays `fp_1`, teleports camera to `1 1 36` marker |
| Timer | 9 | Vertical scrolling animation to top of window |
| Key Down | 123 | Triggers timer behavior |
| Custom (Toggle) | 1000 | Toggles highlight state |

---

### `1 2 38` — Learning Room Popup

Floating popup panel for the Learning Room. Sprite base image 18. Horizontal stop position: center - 230px.

| Event | Number | Description |
|---|---|---|
| Activate1 | 1 | Plays `fp_1`, teleports camera to `1 1 107` marker |
| Timer | 9 | Vertical scrolling animation to top of window |
| Key Down | 123 | Triggers timer behavior |
| Custom (Toggle) | 1000 | Toggles highlight state |

---

## Sound Effects

| Sound ID | Trigger |
|---|---|
| `fp_2` | Played when a marker detects screen visibility and spawns its popup |
| `fp_1` | Played when a popup panel is clicked to teleport the camera |

## Removal Script

The removal section (`rscr`) kills all marker and popup agents and removes their timer scripts (`scrx`) to ensure clean uninstallation.
