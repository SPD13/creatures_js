# NEW portal dispensor.cos — Warp Portal Dispensor

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/NEW portal dispensor.cos`

## Overview

This is **new Docking Station content** (no Creatures 3 equivalent) implementing the **portal dispensor** (`3 3 101`) — the Workshop machine that creates, names, programs and releases **warp portals** (`3 9 1`). Warp portals are part of Docking Station's online feature: a programmed portal can send creatures/agents to other players' worlds. The dispensor works together with the related `portals` script (the portal's own behaviour) and the **workshop screen** (`1 2 208`, the programming UI).

It is installed in the Workshop metaroom at (4497, 8970).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 3 101 | Portal Dispensor | `ds portal dispensor` | Workshop machine to create / program / release portals |
| 3 9 1 | Warp Portal | `ds portals` | A carryable portal that can be programmed to warp things to another world |

## Agent 3 3 101: Portal Dispensor

A compound machine with **Create** (part 1 → 1005), **Program** (part 2 → 1003) and **Release** (part 3 → 1002) buttons, plus a naming text box (part 4 → 1004) and labels. State is in `ov00` (0 = free, 1 = a portal is being programmed); `ov16`/`ov15` hold the portal being programmed and its ID; `ov50` counts portals created.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Update the naming-box display from the current state |
| Raw Mouse Down | 76 | Clicking the naming box clears it for input |
| Metaroom changed | 900 | Restore default focus when leaving |
| Custom | 1000 | A portal was dropped on the dispensor — begin programming it |
| Custom | 1002 | Release — return the programmed portal to the world |
| Custom | 1003 | Program — scroll to the workshop screen and start the programmer |
| Custom | 1004 | Change name — write the typed name onto the portal |
| Custom | 1005 | Create — dispense a new portal |

#### Event 1005 — Create a new portal

Limited to **10 portals** (`ov50 < 9`, else shows "Only 10 portals allowed"). Increments `ov50` and creates a `3 9 1` warp portal as a carryable physics object (`attr 199`, `clac 2`, gravity/elas/aero/perm set, `puhl` carry handles) just outside the dispensor, assigns it an ID (`ov00`) and a default unnamed name, and messages it (1007).

#### Event 1000 — Portal dropped (begin programming)

Stops the timer, sets `ov00 = 1`, stores the dropped portal (`ov16`) and its ID (`ov15`), plays the open animation, swaps the Create button/label for the **Configure** and **Release** buttons, and shows the portal's name.

#### Event 1003 — Program

Plays the button animation, scrolls the camera to the **workshop screen** (`1 2 208`) and triggers its programmer (message 1040 with the portal ID) — where the destination is actually configured.

#### Event 1004 — Change name

Reads the naming box and forwards the new name to the held portal (message 1002), then restores focus. Shows "No portal to name" if nothing is loaded.

#### Event 1002 — Release

Returns the programmed portal to the world (moving it back out, making it visible), tells the workshop screen to stop (`1 2 208`, message 1053), resets the dispensor to its free state, and restarts the idle timer.

## Removal Script

```
rscr
enum 3 3 101
    kill targ
next
enum 3 9 1
    kill targ
next
```

Kills the dispensor and all portals.

## Impact on Stimulus / Room CA

None. The dispensor and portals are interactive machines/objects; they emit no stimuli and do not affect Room CA. (Programmed portals warp agents between worlds — an online-transport effect, not a Room CA one.)
