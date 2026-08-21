# creature_warning.cos — Portal Creature Warning Controller

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/creature_warning.cos`

## Overview

This script creates the **Portal Creature Warning Controller** (`1 1 300`), an invisible agent (parked in the Comms room) that raises an on-screen **warning icon** whenever a creature **leaves** your world through a portal (to another player) or **arrives** into your world from another player. It is the portal-traffic counterpart to the other warning sources (containment, messaging, contacts) that all feed the shared warning-icon stack (`1 2 46`).

Warnings are only raised if the player has **portal warnings enabled** — the controller checks bit 2 of the Comms Screen's options bitflag (`ov02` on `1 2 210`) before creating an icon. The number of simultaneously-visible warnings is capped by `game "ds_number_of_warnings"`; when the running count (`game "ds_warnings"`) exceeds it, the oldest icon is shuffled off.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 300 | Portal Warning Controller | `blnk` | Invisible agent that raises portal in/out warning icons — see [detail](#agent-1-1-300-portal-warning-controller) |
| 1 2 46 | Warning Icon | `warning` | A floating warning icon (instantiated here; its own behaviour/shuffle scripts live elsewhere) |

## Agent 1 1 300: Portal Warning Controller

A single invisible `new: simp` agent. Both of its events take a creature moniker (`_p1_`) and a UserID (`_p2_`) and behave identically except for the warning **type** and animation.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — outgoing warning | 1000 | A creature **left** through a portal to user `_p2_` → raise a "creature left" warning (type 7) |
| Custom — incoming warning | 1001 | A creature **arrived** from user `_p2_` → raise a "creature arrived" warning (type 2) |

### Both events

1. Type-check that `_p1_` and `_p2_` are strings.
2. Read the Comms Screen (`1 2 210`) `ov02` bitflag and `andv … 2` — if portal warnings are off, stop.
3. Compute the icon's vertical slot from `game "ds_warnings"` (×50 + 145).
4. `new: simp` a **warning icon** (`1 2 46`, sprite `warning`) as a floating + activatable agent (`attr 292`, `flto`), play its appearing animation, and store on it: type (`ov00` = 7 left / 2 arrived), slot (`ov02`), the other user (`ov03`), and the creature moniker (`ov04`).
5. Increment `game "ds_warnings"`.
6. If the count now exceeds `game "ds_number_of_warnings"`, message every warning icon (`enum 1 2 46`, `mesg 1000` with id 0) to shuffle and drop the oldest.

## Removal Script

```
rscr
enum 1 1 300
    kill targ
next
```

Kills the controller. (The warning icons themselves are managed/removed by their own scripts.)

## Impact on Stimulus / Room CA

None. This is a notification agent: it reads the Comms Screen options and the `ds_warnings` / `ds_number_of_warnings` game variables, and spawns floating UI warning icons. It emits no creature stimuli and writes no Room CA.
