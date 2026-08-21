# comms camera screens.cos — Security Camera Console

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/comms camera screens.cos`

## Overview

This script builds the **security-camera console** (`3 3 104`) in the Comms room — a panel with one large main screen and six small screens, each rendering the view from a placed **remote camera** (classifier `3 8 50`). A joystick steers the currently-selected camera, screen-overlay buttons switch the main screen between cameras, and "go-to" buttons teleport the player's main view to a camera's location. It also installs two cosmetic **mask** agents to stop accidental clicks/overlaps.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 3 104 | Comms Cameras Console | `comms cameras` | The multi-screen camera-monitoring panel |
| 1 1 190 | Door Mask | `blnk` | Invisible bit masking the door so it isn't pressed by accident |
| 1 1 198 | Screen Mask | `comms mask` | Masks the top of the large screen |

The remote cameras themselves (`3 8 50`) are placed elsewhere; each stores its camera number in `ov00` (1–6) and the console reads the per-camera positions from `game "camera N X/Y"`.

## Agent 3 3 104: Camera Console

State: `ov00` (0 = default view, 1 = creator-camera mode), `ov01` (which camera the main screen shows, 1–6), `ov02` (zoom factor). The console is built from `pat: cmra` camera-parts (one per screen) plus overlay buttons and a joystick.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Bind the 6 remote cameras to the screens and track them |
| Custom | 1000–1005 | Switch the **main screen** to camera 1–6 (joystick flash + `cam1` sound) |
| Custom | 1006–1009 | Joystick **Up / Right / Down / Left** — move the selected remote camera |
| Custom | 1010 | Creator-camera mode — focus the main camera on the Space metaroom |
| Custom | 1011 | Return the camera to normal mode (reset zoom) |
| Custom | 1012 | Zoom the camera (`_p1_` = zoom factor) |
| Custom | 1013–1018 | "Go to" — teleport the player's main view to camera 1–6's location |

#### Event 9 — Track cameras

Enumerates the remote cameras (`3 8 50`), assigns each (by its `ov00` number) to a local variable, and points each screen part's camera (`scam`) at the corresponding camera with hard tracking (`trck`). The main screen tracks whichever camera `ov01` selects.

#### Events 1006–1009 — Joystick

Each forwards a directional message (1000–1003) to the remote camera whose number matches the currently-selected `ov01`, so the joystick pans that camera.

#### Events 1013–1018 — Go to camera

Plays `cmov` and, for the matching remote camera, transports the player's view to that camera's room (`cmrt`, if the location is a valid room).

## Removal Script

```
rscr
enum 3 3 104
    kill targ
next
enum 1 1 190
    kill targ
next
enum 1 1 198
    kill targ
next
```

Kills the console and the two mask agents.

## Impact on Stimulus / Room CA

None. The console is a camera-monitoring UI; it moves cameras and the player's view. It emits no stimuli and does not affect Room CA.
