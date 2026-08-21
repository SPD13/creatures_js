# DS creature history.cos — Creature History Panel

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creature history.cos`

## Overview

This script defines the **Creature History** panel (`1 2 23`) — the multi-page window shown when the player right-clicks a creature in [agent help](DS%20agent%20help.md) (or opens it from other UI). It reads a creature's life-event record from the engine's history database (the `hist` command family) by **moniker** and presents it across four pages: a main summary, a scrollable life-events list, a photo album, and a genome/pigment page. It also creates a small invisible **array agent** (`1 2 29`) used to stash event-related monikers for button clicks.

At install it sets one game variable:

| Variable | Value | Meaning |
|---|---|---|
| `c3_after_shee_dates` | 0 | Date display mode: 0 = real-world dates, 1 = in-game "after Shee" dates |

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 23 | Creature History Panel | `ds_creature_history` | Four-page compound window showing a creature's history, photos and genome |
| 1 2 29 | History Array Agent | `blnk` | Invisible data holder storing event monikers for the event-page buttons |

## Agent 1 2 23: Creature History Panel

`attr 304` (camera-shy + floatable + invisible), `imsk 12` (mouse move + mouse down), centred on screen. Pages are selected by `ov02` (and pending page `ov12`): **1001** = main, **1002** = events, **1003** = photos, **1004** = extra/genome. The page buttons (parts 103–106) send messages 2003–2006.

### Object Variables

| Var | Meaning |
|---|---|
| ov00 / ov01 / ov02 | Watched creature / its moniker / current page |
| ov03 | Array agent (`1 2 29`) for event-button monikers |
| ov10 / ov11 / ov12 | Pending creature / moniker / page (applied by refresh 256) |
| ov20–ov23 | Event page: total events last refresh, pending/shown page, scrollbar state |
| ov30 / ov31 | Photo page: photo being shown / pending scroll direction |

### Core / shared events

| Event | Number | Description |
|---|---|---|
| Setup | 1000 | Build the frame (close, gender icon, page buttons, title) + array agent, then watch a creature |
| Watch-in-world | 999 | Resolve a passed agent/moniker and forward to 998 |
| Selected changed | 120 | Re-watch when the selected creature changes |
| Watch moniker | 998 | Resolve a moniker (`mtoc`), set pending, trigger refresh |
| Refresh | 256 | If pending differs, save edits, wipe parts, apply pending creature/moniker/page, build that page |
| Timer | 9 | Update gender icon, title bar (name/gender/genus), whereabouts, then call the current page's refresh |
| Mouse move | 75 | Plane-raise on hover; highlight the "browse on web" link |
| Mouse down | 76 | On the name box, block renaming if the player isn't the creature's original breeder (shows "restricted") |
| Window resized | 123 | Re-centre the panel |
| Close | 2002 | Save name/description, notify toolbars (`1 2 13/14/208`), kill the array agent and self |
| Page buttons | 2003–2006 | Switch to page 1001/1002/1003/1004 (`cmc4` sound + refresh 256) |
| New life event | 127 | If watching the affected moniker, refresh the events or photo page |

### Page 1 — Main (1001)

Shows: editable **name** (part 2) and **description** (part 4) fields written back via `hist name` / `hist utxt`; **birthday** (from the birth event, formatted by date mode); **age** (live `tage`/`cage` for a living creature, or the death/last-event age otherwise, updated by the 3001 timer); **generation**; a **remote camera** (`pat: cmra`, tracking the live creature); and a **"Browse this creature on Docking Station Central"** link when the history is web-vetted (`hist wvet`). Event 2000 commits the name field.

### Page 2 — Events (1002)

Builds 7 event rows and a scrollbar. The refresh (2010) walks the creature's events (`hist type`/`hist coun`), counting only displayable types — death (7), new egg (12), born (3), child born (10), pregnant (8), import/warp-in (6/17), export/warp-out (5/16), starter-family (100), cloned (14), adult (4 at life-stage 4) — and paginates them. Each row shows an icon (gravestone, egg, etc.), the event name (from `creature_history_event_names`), the age, the date, and up to two **related-moniker buttons** (2013/2014) that jump the panel to a parent/child creature (monikers stashed in the `1 2 29` array). Scroll buttons send 2011/2012.

### Page 3 — Photos (1003)

A three-thumbnail photo album over the creature-history record. The refresh (2024) scans photo events (`hist find/finr` type 13, `hist foto`) and shows the previous/current/next photo (with a fade-in). **Take photo** (2020) uses `snap` to capture the live creature into a journal image and records a `hist evnt` type-13 photo event; **erase** (2021) clears it; arrows (2022/2023) scroll. Photos are tinted neutrally (`tint 128 128 128 128 128`) to force cloning.

### Page 4 — Extra / Genome (1004)

Displays genome information from the history record: **moniker**, **crossovers** (`hist cros`), **mutations** (`hist mute`), and the creature's **pigment** and **pigment-bleed** gene values (read live from the creature's `tint 1–5` when alive, else from the catalogue). Event **1064** opens the creature's page on Docking Station Central in a browser (`webb`).

## Agent 1 2 29: History Array Agent

An invisible `blnk` simple agent created by event 1000 and stored in `ov03`. Its object variables hold the monikers associated with each event-row button, so clicking a related-creature button (events 2013/2014) can look up which creature to jump to. It is killed when the panel closes.

## Removal Script

```
rscr
enum 1 2 23
    kill targ
next
enum 1 2 29
    kill targ
next
```

Kills the history panel and its array agent.

## Impact on Stimulus / Room CA

None. This is a read/annotate UI over the creature-history database. It writes names, descriptions and photos into the history record and can briefly track the camera onto a creature, but it emits no stimuli and does not affect Room CA.
