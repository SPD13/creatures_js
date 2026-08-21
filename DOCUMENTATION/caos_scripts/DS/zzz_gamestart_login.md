# zzz_gamestart_login.cos — Game-Start Login

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/zzz_gamestart_login.cos`

## Overview

This is the **game-start login sequence**. At bootstrap it parks the camera on the Hub, **pauses the whole world**, and puts up the **Connect GUI** (`1 2 206`) asking the player for their nickname and password. The player can log in, skip, or click through to register online. On a successful login (or skip) it **unpauses everything**, records the user, builds the **Welcome Screen** (`1 2 26`) — which offers a starter family, eggs, or exit — and moves the camera to the Meso nest. This file defines all the Connect GUI's login scripts (the GUI is also created later by [ds gui - topleft](ds%20gui%20-%20topleft.md) for re-connecting).

It initialises the online state: `game "status"` = "offline", `game "user_of_this_world"` = "" , `game "engine_netbabel_save_passwords"` = 1.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 206 | Connect GUI | `connect gui` | The nickname/password login dialog — see [detail](#agent-1-2-206-connect-gui) |
| 1 2 26 | Welcome Screen | `ds welcome screen` | The post-login starter-family / eggs / exit menu (behaviour in [DS welcome screen](DS%20welcome%20screen.md)) |

## Agent 1 2 206: Connect GUI

Created at game start, parked centre-screen, listening for mouse events (`imsk 12`).

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | After a short delay, **pause the whole world** (leaving only the login GUI, welcome screen, tooltips and pointer running) |
| Mouse Move | 75 | Highlight the "get a nickname online" link on hover |
| World Resize | 123 | Re-centre the dialog |
| Custom — focus password | 1000 | Move focus to the password field |
| Custom — save-password toggle | 1010 | Toggle whether the password is remembered |
| Custom — connect (first) | 1020 | Attempt to log in with the entered nickname/password |
| Custom — tick (first) | 1021 | Trigger the first-login connect |
| Custom — cancel (first) | 1022 | Save and reload the Startup world |
| Custom — connect (return) | 1002 | Log in using the saved user |
| Custom — tick / cancel (return) | 1023 / 1024 | Trigger/abort a return login |
| Custom — get nickname link | 1050 | Open the online registration page (`webb`) |
| Custom — skip | 1051 | Skip login: unpause and go straight to the Welcome Screen |

### Event 1020 — Connect & succeed

Validates the fields, calls `net: pass` + `net: line 1`, and on success: **unpauses the world** (`wpau 0`, `paus 0` for all families), stores `user_of_this_world`, updates the hand name, builds the **Welcome Screen** (`1 2 26`), and moves the camera to the Meso (`2 22 4`). On failure it shows the matching `net: erra` error message (offline, bad password, already logged on, server full, etc.).

### Event 9 — Pause the world

Pauses (`wpau`/`paus`) every agent except the few that must keep running during login: the tooltips (`1 1 193`), the welcome screen (`1 2 26`), the connect GUI itself (`1 2 206`) and the pointer (`2 1 1`).

## Removal Script

```
rscr
enum 1 2 206 / 1 2 26
    kill targ
next
wpau 0   (+ paus 0 for all families)
net: line 0
```

Kills the login GUI and welcome screen, unpauses the world, and goes offline.

## Impact on Stimulus / Room CA

None. This is an online-login / onboarding flow. It emits no creature stimuli and writes no Room CA. Its notable side effects are **pausing and unpausing the entire world** (`wpau`/`paus`) around the login, connecting to the network (`net: pass` / `net: line`), setting the world's user, and launching the Welcome Screen and camera move into the Meso.
