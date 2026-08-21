# NEW portals.cos — Warp Portal Behaviour

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/NEW portals.cos`

## Overview

This is **new Docking Station content** defining the behaviour of the **warp portal** (`3 9 1`) — the agent at the centre of Docking Station's online creature-sharing feature. A portal connects to the online network ("Warp Welcome Register"), opens a wormhole when one of its configured contacts is online, and **sends creatures that step into it to another player's world**. Portals are dispensed and programmed by the [portal dispensor](NEW%20portal%20dispensor.md) (`3 3 101`) and the workshop screen (`1 2 208`); incoming creatures are vetted by the immigrant checker.

The portal instances are created by the dispensor; this script defines all their scripts.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 9 1 | Warp Portal | `ds portals` | Online warp gateway: sends creatures to / receives them from other worlds |

## Agent 3 9 1: Warp Portal

| Variable | Meaning |
|---|---|
| ov00 | Portal ID (0–9) |
| ov01 | Portal name |
| ov03 | State: 0 = closed, 1 = open, 2 = open and connected (wormhole) |

The portal's send/receive targets are stored as game variables named `<userID>_portal<N>[send]`; the friends/groups are `<userID>_group` variables (value 2 = friend). It uses the `net:` family (`net: line`, `net: ulin`, `net: expo`, `net: ruso`, `net: whon`/`whoz`) to talk to the network and `gamn` to enumerate those game variables.

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 0 | **Open** the device; if online and a contact is on, open the wormhole |
| Activate 2 | 2 | **Close** the device |
| Activate (creature) | 1 | A creature entered — **warp it** to a contact's world |
| Drop | 5 | Check whether dropped on the dispensor (→ 1007) |
| Custom | 1007 | Dropped-on-dispensor — hand off to the dispensor (`3 3 101`) for programming |
| Custom | 1000 / 1001 | Wormhole **appear / disappear** animation |
| Custom | 1002 | Receive a name change from the dispensor |
| Custom | 1003 | Brief animation when a creature is waiting but the user is offline |
| Custom | 1004 | Immigrant-arriving — notify the warning/"fat controller" icons (`1 1 300`) |
| Custom | 1005 / 1006 | Add to / clear the "who's wanted" network register |
| World Loaded | 128 | Re-evaluate connection (→ 137) |
| Network | 137 / 138 / 135 | WWR user online / offline / user-online — open or close the wormhole accordingly |

### Event 0 — Open

Plays the opening animation and sets `ov03 = 1`. If the machine is online (`net: line = 1`), it scans the portal's `_portal<ID>` game variables for the configured users and checks whether any are online (`net: ulin`), including the special `!net: ruso` (random user) and `!friend` (any online friend, via a subroutine over `_group` variables). If a contact is online it opens the wormhole (message 1000). It then enables interaction (`bhvr 1`, `clac 1`).

### Event 1 — Creature warp (the send)

When a creature activates the open portal (online only): it verifies the creature is allowed to travel (no `<moniker>_travel` game variable already set), plays the warp sound, then counts the online recipients in its send list and **picks one at random**. It stimulates the creature (27, 75), exports it with `net: expo "warp" <userID>` and triggers the warning icons (`1 1 300`, message 1000) and — for a never-before-seen random user — the contact handler (`1 1 157`). For the `!net: ruso` case it resolves an actual random online user first (`net: ruso`).

### Event 137 — Connection re-evaluation

The core "is anyone online?" check (also reached from world-load and the 138/135 network events): scans the send/receive lists and friends; if a contact is online and the portal is merely open (`ov03 = 1`) it opens the wormhole (1000); if no one is online and the wormhole is up (`ov03 = 2`) it closes it (1001). Keeps the portal interactive.

### Events 2 / 5 / 1007 — Close / drop / dock

`2` closes the device (animation, `ov03 = 0`, restores carryable attributes). `5` (drop) routes to `1007`, which — if the portal is touching the dispensor (`3 3 101`) and is portal 0 — hands itself to the dispensor (message 1000) and goes invisible so it can be programmed.

## Removal Script

```
rscr
enum 3 9 1
    kill targ
next
```

Kills all portals.

## Impact on Stimulus / Room CA

It stimulates a warping creature (stims 27 and 75) as it is sent, and exports/imports creatures across the online network. It writes no Room CA. (Its main effect is the online transport of creatures between worlds, mediated by the `net:` system.)
