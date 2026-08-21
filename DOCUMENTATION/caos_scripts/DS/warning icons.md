# warning icons.cos — The Warning Icon System

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/warning icons.cos`

## Overview

This script builds the **warning-icon** notification system — the row of alert icons that appear to tell the player about online/world events. It creates the **"fat controller"** (`1 1 164`), the central agent every other system messages when something noteworthy happens (a creature arriving in containment, a message received, a friend coming online, a chat message, etc.). The fat controller checks whether that warning category is enabled (via the Comms Screen's options bitflag) and, if so, spawns a **warning icon** (`1 2 46`) in the stack. Clicking an icon opens a **warning dialog** (`1 1 179`) explaining the event (and often moves the camera to the relevant place), then removes the icon and shuffles the rest down.

> **Dependency:** needs `contact book.cos` (for resolving sender nicknames).

This is the primary definer of the `1 2 46` warning icons; the portal-traffic warnings are raised separately by [creature_warning](creature_warning.md).

Game variables: `ds_warnings` (current count / next slot), `ds_number_of_warnings` (max on screen, 10).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 164 | Warning Fat Controller | `blnk` | Central dispatcher that raises warning icons — see [detail](#agent-1-1-164-fat-controller) |
| 1 2 46 | Warning Icon | `warning` | A floating alert icon in the stack — see [detail](#agent-1-2-46-warning-icon) |
| 1 1 179 | Warning Dialog | `useful_screen` | The pop-up shown when an icon is clicked — see [detail](#agent-1-1-179-warning-dialog) |

Warning icon types (`ov00`): 1 containment, 2 portal arrival, 3 message, 4 contact online, 5 chat, 6 contact offline, 7 creature left through portal.

## Agent 1 1 164: Fat Controller

| Event | Number | Description |
|---|---|---|
| Custom — warning event | 1000 | Dispatch a warning by category (`_p1_`), if enabled and not already shown |
| Custom — create warnings | 1001–1006 | Build a specific warning icon (containment / message / contact-on / chat / contact-off) |

### Event 1000 — Dispatch

Routes by `_p1_` (1 containment, 3 message, 4 contact online, 5 chat, 6 contact offline; portal events were moved to [creature_warning](creature_warning.md)). For each it checks the matching bit of the Comms Screen's (`1 2 210`) options flag `ov02` — and only raises the warning if that category is enabled. It also **de-duplicates** (e.g. won't stack two "message" warnings) and reconciles online/offline contact warnings for the same user. A containment arrival also notifies the Workshop Screen (`1 2 208`).

### Events 1001–1006 — Create icon

Each plays a distinct warning sound, computes the next stack slot from `ds_warnings`, spawns a `1 2 46` icon with the right type/source/user/moniker, increments the count, and — if the stack exceeds `ds_number_of_warnings` — tells the icons to shuffle, dropping the oldest.

## Agent 1 2 46: Warning Icon

| Event | Number | Description |
|---|---|---|
| Custom — click | 1 | Act on the warning (open a dialog / move the camera), then remove and shuffle |
| Custom — shuffle | 1000 | Icons above the given ID slide down; the matching ID kills itself |
| Custom — remove N | 1001 | Remove the first `_p1_` warnings and shuffle the rest |

### Event 1 — Click

Behaviour depends on the icon type: **containment** moves the camera to the chamber contents; **portal arrival / creature left** open a dialog naming the creature and the other user's world; **message** shows an "unread messages" dialog and jumps to Comms; **contact online/offline** shows a friend status dialog; **chat** shows a chat-message dialog. Unknown contacts are added to the contact book (`1 1 157`) so the nickname can be shown. After acting, it broadcasts a shuffle so the stack closes up.

## Agent 1 1 179: Warning Dialog

| Event | Number | Description |
|---|---|---|
| Custom — close | 1000 | Close button dismisses the dialog |
| Push | 1 | Dismiss the dialog |
| Custom — pointer slap | 101 | Slap animation |
| World Resize | 123 | Re-centre on the window |

## Removal Script

```
rscr
enum 1 1 164
    kill targ
next
enum 1 2 46
    kill targ
next
```

Kills the fat controller and all warning icons.

## Impact on Stimulus / Room CA

None. The warning-icon system is a notification/UI layer: it raises alert icons, opens explanatory dialogs, and moves the camera to relevant locations. It emits no creature stimuli and writes no Room CA. (It reads/writes the `ds_warnings` / `ds_number_of_warnings` game variables and coordinates with the Comms Screen, Workshop Screen and contact book.)
