# ds gui - topleft.cos — Top-Left HUD (Selected Creature + Connect)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/ds gui - topleft.cos`

## Overview

This script builds the **Top-Left HUD** (`1 2 14`) — the cluster of controls in the top-left corner that shows the **currently-selected creature** (face portrait, name, gender), with buttons to open its Creature History, toggle **Agent Help** mode, jump the camera to it, and **connect to the Creature Labs server** (the online button + network-status light). The connect button drives the login flow, creating a **Connect GUI** (`1 2 206`) password dialog when needed (the login scripts themselves live in `zzz_gamestart_login.cos`).

It registers itself as `game "ds_gui_topleft"` and tracks the online state in `game "status"` (offline / pending / online).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 14 | Top-Left HUD | `ds gui` | Selected-creature display + help/connect controls — see [detail](#agent-1-2-14-top-left-hud) |
| 1 2 206 | Connect GUI | `connect gui` | Nickname/password login dialog (scripts in `zzz_gamestart_login.cos`) |

It also spawns a **Creature History window** (`1 2 23`, defined by [DS creature history](DS%20creature%20history.md)) when the player opens the selected creature's history.

## Agent 1 2 14: Top-Left HUD

A `new: comp` panel docked top-left, listening for mouse-downs (`imsk 8`). `ov00` tracks Agent-Help mode.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — enter scope | 8 | On becoming visible, refresh the selected-creature display (message 127) |
| Custom — creature data change | 127 | Redraw the selected creature's face/name/gender, or clear if none |
| Custom — selected changed | 120 | Camera-track the newly-selected creature (`trck`/`cmrt`) and redraw the display |
| Mouse Down | 76 | Right-click on the panel forwards a key event to the keyboard handler (`1 2 6`) |
| World online | 135 | Set status online and light the network button |
| World offline | 136 | Set status offline; kill all open/minimised chat windows |
| Custom — agent help | 1000 | Toggle Agent-Help mode (notify the help watcher `1 2 4`); buzzes if the hand is holding something |
| Custom — creature face | 1001 | Jump the camera to the selected creature (`cmrt`) |
| Custom — creature history | 1002 | Open a Creature History window (`1 2 23`) for the selected creature |
| Custom — connect | 1003 | Connect/disconnect from the Creature Labs server (login flow) |
| Custom — creature arriving | 1004 | Animate the network-status icon (an online arrival) |
| Custom — cancel arriving | 1005 | Reset the network-status icon |

### Event 1003 — Connect / disconnect

Toggles on `game "status"`:

- **offline → connecting:** requires the world to already have a `user_of_this_world`. If passwords are saved (`engine_netbabel_save_passwords`) it fetches the stored one (`net: pass`) and goes online (`net: line 1`); otherwise it opens the **Connect GUI** (`1 2 206`) to prompt for the password.
- **online → offline:** `net: line 0`, drop the status light, and kill all chat windows (`1 1 210` / `1 1 217`).
- **pending → cancel:** tear down any half-built Connect GUI (`1 2 206`).

The `password` subroutine builds the Connect GUI: a nickname label, password text field, "save password" toggle, and tick/cancel buttons.

## Removal Script

```
rscr
enum 1 2 14
    kill targ
next
enum 1 2 206
    kill targ
next
net: line 0
```

Kills the HUD and any Connect GUI, and goes offline.

## Impact on Stimulus / Room CA

None. The Top-Left HUD emits no creature stimuli and writes no Room CA. Its effects are UI and networking: it moves/tracks the camera on the selected creature, toggles Agent-Help mode, sets `game "status"`, manages the online session (`net:`), and opens the creature-history and login dialogs.
