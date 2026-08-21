# DS Home smell emitters.cos - Creature Home Territory Smell Emitters

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS Home smell emitters.cos`

## Overview

This script places invisible smell emitters that define the home territories for each creature species by broadcasting a species-specific "home smell" CA into the surrounding rooms. Creatures follow these CA gradients to find and identify their home areas. It is the Docking Station counterpart of the Creatures 3 [Home smell emitters](../C3/Home%20smell%20emitters.md), with two Docking-Station-specific changes:

1. **The Creatures 3 emitters are conditional.** Before placing the Ark emitters, the script checks `gmap 100 100 ne -1` — i.e. whether a room exists at the C3 Ark coordinates (only true when a C3 world is docked). The Norn/Grendel/Ettin emitters are placed only in that case.
2. **A Docking-Station Norn home emitter is always placed** in the Norn Meso (the Capillata terrarium), regardless of docking, so Docking-Station-only worlds still have a Norn home smell.

The emitters use the `blnk` sprite and `attr 18` (Invisible + Mouseable); `pose va00` (0 = invisible, a debug switch can set it to 1). Each is removed and recreated on install (the script first kills any existing `3 5 0` / `3 6 0` / `3 7 0` emitters).

## Created Agents

| Classifier | Name | Sprite | Description | Details |
|---|---|---|---|---|
| 3 5 1 | Norn Home Emitter | `blnk` | Emits CA 15 (Norn Home) — Ark nursery (docked) and the Norn Meso incubator | [Details](#norn-home-emitters-3-5-1-3-5-2) |
| 3 5 2 | Norn Home Emitter (treehouse) | `blnk` | Emits CA 15 (Norn Home) in the C3 treehouse (docked only) | [Details](#norn-home-emitters-3-5-1-3-5-2) |
| 3 6 1 | Grendel Home Emitter | `blnk` | Emits CA 16 (Grendel Home) in the C3 Grendel jungle (docked only) | [Details](#grendel-home-emitter-3-6-1) |
| 3 7 1 | Ettin Home Emitter | `blnk` | Emits CA 17 (Ettin Home) across the C3 Ettin desert (docked only, 3 instances) | [Details](#ettin-home-emitters-3-7-1) |

---

## C3-rooms check

```caos
doif gmap 100 100 ne -1
    ... place the Ark Norn / Grendel / Ettin emitters ...
endi
```

`gmap 100 100` returns the metaroom at C3 world coordinate (100, 100); `ne -1` means a metaroom is present there, i.e. the Creatures 3 Ark is docked. The block below runs only when docked.

## Norn Home Emitters (3 5 1, 3 5 2)

| Classifier | Position | Emit | Placement | Condition |
|---|---|---|---|---|
| 3 5 1 | (780, 712) | CA 15 @ 0.025 | C3 Ark — near nursery | docked only |
| 3 5 2 | (2360, 467) | CA 15 @ 0.01 | C3 Ark — tree house | docked only |
| 3 5 1 | (450, 9330) | CA 15 @ 0.025 | **DS Norn Meso — incubator area** | **always** |

The always-placed Meso emitter (3 5 1) is what gives a Docking-Station-only world its Norn home smell.

## Grendel Home Emitter (3 6 1)

| Position | Emit | Placement | Condition |
|---|---|---|---|
| (1948, 2310) | CA 16 @ 0.01 | C3 Grendel jungle | docked only |

## Ettin Home Emitters (3 7 1)

Three instances across the C3 Ettin desert (docked only):

| # | Position | Emit | Notes |
|---|---|---|---|
| 1 | (4872, 704) | CA 17 @ 0.004 | weak — left of the desert |
| 2 | (6200, 704) | CA 17 @ 0.007 | strongest — centre |
| 3 | (6363, 704) | CA 17 @ 0.000 | inactive (placeholder / boundary) |

None of these emitters have event scripts; each exists solely to emit its home CA continuously.

## Removal Script

```
rscr
enum 3 5 0
    kill targ
next
enum 3 6 1
    kill targ
next
enum 3 7 1
    kill targ
next
```

Kills all Norn (genus-wildcard `3 5 0`, covering species 1 and 2), Grendel (`3 6 1`) and Ettin (`3 7 1`) home emitters.

## Impact on Stimulus / Room CA

Direct Room CA. Each emitter continuously injects its species home smell:

| CA | Smell | Emitter |
|---|---|---|
| 15 | Norn Home | 3 5 1 / 3 5 2 |
| 16 | Grendel Home | 3 6 1 |
| 17 | Ettin Home | 3 7 1 |

These CA indices (15–17) are non-navigable (they stay within their room rather than diffusing through doors); creatures detect them via the CA-to-category perception mapping and use them to navigate home.
