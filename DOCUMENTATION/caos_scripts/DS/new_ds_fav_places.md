# new_ds_fav_places.cos — Favourite Places Navigation

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/new_ds_fav_places.cos`

## Overview

This script builds Docking Station's revamped **Favourite Places** system — the row of location icons along the top of the screen that let the player jump the camera between metarooms. It places an invisible **signpost** at each notable location; when a signpost first comes on screen it spawns a clickable **icon** that flies up into the favourites bar. A **fat controller** tracks which metaroom the camera is in (highlighting the matching icon) and provides keyboard/mouse-wheel navigation through the list. When the world is docked with Creatures 3 it first kills the old C3 signposts (`1 1 31`–`37`, `1 1 107`) and old favourite-place icons (`1 2 15`–`20`, `1 2 38`).

Locations covered: the DS rooms (Meso, Workshop, Comms, Corridor) and the C3 outposts (Norn, Jungle, Desert, Marine, Engineering, Bridge, Learning) — each is a distinct **species** of signpost (`1 3 <species>`) with a matching icon (`1 4 <species>`).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 225 | Favourite-Places Fat Controller | `blnk` | Invisible manager: tracks the camera's metaroom and handles navigation — see [detail](#agent-1-1-225-fat-controller) |
| 1 3 x | Favourite-Place Signpost | `fav_place_*` | Invisible location marker that spawns its icon when seen — see [detail](#agent-1-3-x-signpost) |
| 1 4 x | Favourite-Place Icon | (signpost's gallery) | The clickable icon in the top bar — see [detail](#agent-1-4-x-icon) |

`game "ds_favourites"` counts how many favourite places exist; each icon stores its slot in `ov50` and its metaroom in `ov01`.

## Agent 1 1 225: Fat Controller

An invisible `new: simp` with `imsk 35` (key + mouse-wheel events).

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Detect the camera's current metaroom and highlight the matching icon |
| Key Down | 73 | **Home/End** jump to first/last favourite; **PageUp/PageDown** step through the list |
| Mouse Wheel | 78 | Scroll up/down through the favourites (when not holding anything) |

#### Event 9 — Track the camera

Reads the camera's metaroom (`meta`), finds the icon (`1 4 0`) whose `ov01` matches (with a special-case for the Bridge and Engineering sharing one metaroom, resolved by window X position), highlights it (message 1000), and broadcasts a **metaroom-changed** signal (event 900) to **all agents** (`enum 0 0 0`). In a roomless/icon-less view it clears all highlights.

## Agent 1 3 x: Signpost

| Event | Number | Description |
|---|---|---|
| Timer | 9 | When on screen and no icon exists yet, create the matching icon (`1 4 <species>`) and register it in the favourites list |

The signpost reads its own species/gallery/metaroom and spawns a `1 4 <species>` icon flying up from the screen centre, incrementing `game "ds_favourites"`.

## Agent 1 4 x: Icon

| Event | Number | Description |
|---|---|---|
| Custom — clicked | 1 | Jump the camera to the matching signpost's metaroom (`cmrt`) and broadcast metaroom-changed (900) |
| Timer | 9 | Fly up and settle into the icon's slot in the top bar |
| World Loaded | 123 | Re-run the positioning timer |
| Custom — highlight | 1000 | Highlight (pose 1) if `_p1_` matches this icon's slot, else un-highlight |

## Removal Script

```
rscr
enum 1 3 0 / 1 4 0 / 1 1 225
    kill targ
next
```

Kills all signposts, icons and the fat controller.

## Impact on Stimulus / Room CA

None. This is a camera-navigation UI: it moves the player's view between metarooms, highlights favourite-place icons, and broadcasts a "metaroom changed" message (event 900) so other agents can react to the view change. It emits no creature stimuli and writes no Room CA.
