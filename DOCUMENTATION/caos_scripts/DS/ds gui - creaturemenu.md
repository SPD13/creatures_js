# ds gui - creaturemenu.cos — Creature Menu GUI (Import / Export)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/ds gui - creaturemenu.cos`

## Overview

This script builds the **Creature Menu** — the slide-out HUD panel that shows the world's creatures as a grid of face portraits and lets the player **select**, **import** and **export** creatures. Most of its logic is carried over unchanged from Creatures 3. It also installs the import/export workflow: scanning exported-creature PRAY files (`EXPC` / `DSEX`), previewing a candidate, and importing it (with the cloning/Creature-History reconciliation that DS adds), plus exporting the currently-selected creature to a `.creature` file.

It sets `game "creature_hud_tint"` to 0 by default (tinting the HUD faces to match each creature's body tint is supported but slow).

| Var (on 1 2 13) | Meaning |
|---|---|
| `ov00` | Current page of the face grid (1 = first 6 creatures) |
| `ov99` | In/out slide flag (−1 in, +1 out) |
| `ov16`–`ov21` | The six creature handles shown on the current page |
| `game "ds_gui_creaturemenu"` | Handle to the menu agent |
| `game "Grettin"` | Selects whether the grid enumerates norns or grendels/ettins |

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 13 | Creature Menu | `ds gui` | The slide-out face grid + import/export bar — see [detail](#agent-1-2-13-creature-menu) |
| 1 2 35 | Selection Indicator | `indicator` | Highlight that floats over the currently-selected creature's face — see [detail](#agent-1-2-35-selection-indicator) |
| 1 2 32 | Import Dialog | `useful_screen` | Browse and import an exported creature — see [detail](#agent-1-2-32-import-dialog) |
| 1 2 39 | Clone-on-Import Dialog | `useful_screen` | Confirm cloning when a creature can't be imported as the original |
| 1 2 40 | Notice Dialog | `pick-ups` | "World full" / "export failed" message box |
| 1 1 43 | Teleport FX | `teleport` | Transient warp animation accompanying import/export (also created by [DS welcome screen](DS%20welcome%20screen.md)) |

## Agent 1 2 13: Creature Menu

The face grid: six portrait buttons (parts 5–10) + name labels (11–16), previous/next page buttons, import/export buttons, and an open/close tab. Faces are drawn with `gall limb`/`face`; names from `hist name`. Only **born** creatures (`ooww = 3`) appear.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — open menu | 1 | Refresh and slide the panel out, populating the six face slots from the first page |
| Custom — close menu | 2 | Slide the panel back in |
| World Loaded | 123 | Reposition the panel (or re-open it) after a load |
| Custom — life-event update | 127 | Rebuild the grid after a birth/death |
| Custom — selected changed | 120 | Rebuild the grid for the newly-selected creature |
| Custom — previous page | 1000 | Page back through the creature list; tell the indicator to update |
| Custom — next page | 1001 | Page forward |
| Custom — import | 1002 | Open the Import Dialog (`1 2 32`) if exported creatures exist |
| Custom — export | 1003 | Export the currently-selected creature (`norn`) to a `DSEX` file |
| Custom — select slot 1–6 | 1004–1009 | Make the creature in that slot the **selected** creature (`norn targ`) |

### Event 1003 — Export creature

Targets the selected creature, freezes it (`zomb 1`), plays a teleport effect (`1 1 43`), stamps its moniker into the per-user **export log** file, then `pray expo "DSEX"`. On success the creature leaves the world; on failure a Notice Dialog (`1 2 40`) is shown.

## Agent 1 2 35: Selection Indicator

| Event | Number | Description |
|---|---|---|
| Custom — selected changed | 120 | Float the highlight onto whichever of the six face slots holds the currently-selected creature (`norn`), or hide it if off-page |

## Agent 1 2 32: Import Dialog

Browses exported-creature PRAY chunks across both the `EXPC` (Creatures 3) and `DSEX` (Docking Station) groups.

| Event | Number | Description |
|---|---|---|
| Custom — close | 1000 | Close the dialog |
| Custom — next candidate | 1001 | Step forward through `EXPC`/`DSEX`, wrapping between groups |
| Custom — previous candidate | 1002 | Step back through the candidates |
| Custom — import | 1003 | Import the selected creature into the world |
| Custom — show candidate | 1004 | Render the candidate's head, name, origin world, life stage and age from its PRAY tags |

### Event 1003 — Import

Refuses if the world is already at `game "total_population"` living creatures (showing a Notice Dialog). It reconciles the creature's moniker against the user's export log to decide whether it can be imported as the **original** (`engine_clone_upon_import 0`) or must be **cloned**; if Creature-History reconciliation fails (`pray impo` returns 1) or the original isn't in the log, it opens the Clone-on-Import Dialog (`1 2 39`). A successful import teleports the new creature into the Meso nest, wakes it, selects it (`norn`) and makes it `like pntr`.

## Agent 1 2 39: Clone-on-Import Dialog

| Event | Number | Description |
|---|---|---|
| Custom — no | 1000 | Cancel the import |
| Custom — yes | 1001 | Import as a clone (teleport in, select, `like pntr`) |

## Agent 1 2 40: Notice Dialog

| Event | Number | Description |
|---|---|---|
| Custom — close | 1000 | Dismiss the message box |

## Removal Script

```
rscr
enum 1 2 13 / 1 2 32 / 1 1 43 / 1 2 39 / 1 2 40
    kill targ
next
```

Kills the menu, its dialogs and any teleport effects.

## Impact on Stimulus / Room CA

No creature stimuli are emitted and no Room CA is written. The script's significant world effect is **adding and removing creatures**: importing `pray impo`s a creature into the world (capped by `total_population`, optionally cloned), and exporting `pray expo`s the selected creature out of it. Imported creatures are placed in the Meso nest, woken, selected and made to `like` the hand. The teleport FX (`1 1 43`) is purely cosmetic.
