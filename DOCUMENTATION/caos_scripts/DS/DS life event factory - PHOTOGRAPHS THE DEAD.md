# DS life event factory - PHOTOGRAPHS THE DEAD.cos — Life-Event Notifications

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS life event factory - PHOTOGRAPHS THE DEAD.cos`

## Overview

This script creates the **life-event factory** (`1 2 24`) — an invisible controller that watches for creature life events (birth, death, egg-laid, pregnancy) and, for each, pops up a scrolling **notification icon** (`1 2 25`) and spawns a **photographer** (`1 2 37`) that automatically snaps a photo of the creature into its history. It is the Docking Station counterpart of the Creatures 3 [life event factory](../C3/life%20event%20factory.md); the "PHOTOGRAPHS THE DEAD" in the filename refers to the Docking-Station addition of also photographing a creature at the moment of death.

At install it creates `1 2 24` and sets `game "ds_number_of_life_events" = 10` (the maximum number of notification icons shown at once).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 24 | Life Event Factory | `blnk` | Controller listening for life events; spawns icons and photographers |
| 1 2 25 | Life Event Icon | `ds_life_events` | Scrolling on-screen notification for one life event |
| 1 2 37 | Birth/Death Photographer | `blnk` | Transient agent that snaps the creature and records a photo event |

## Agent 1 2 24: Life Event Factory

### Event 127 — New life event

Receives `_p1_` (moniker) and `_p2_` (event index). It reads the event type (`hist type`) and only acts on **died (7)**, **laid (11)**, **born (3)** or **pregnant (8)**; otherwise it stops.

- **Photographers:** for a **birth**, spawns a photographer (`1 2 37`) that fires after ~5 s (`tick rand 90 120`); for a **death**, spawns one that fires almost immediately (`tick rand 0 30`).
- **Selectability:** if `Grettin = 0` and the creature isn't a Norn, it skips (and marks death events "don't register").
- **Music:** births play `Bleep`, deaths play `MetallicChords` (via `strk`).
- **Icon:** creates a `1 2 25` notification icon at the right of the row (offsetting past existing icons), with a tooltip built from the creature's name/genus and the event type (for egg-laid, naming the mother via `hist mon1`), and stores the creature's camera position. If the icon count exceeds `ds_number_of_life_events`, the oldest icons are scrolled off.

## Agent 1 2 37: Photographer

### Event 9 — Timer (take photo)

Targets the creature (`ov00`), takes a snapshot image (`snap`) named `<moniker>-<event-count>`, records a photo life event (`hist evnt … 13`) and stores the image against it (`hist foto`), then kills itself. This is what fills the creature-history photo album automatically at birth and death.

## Agent 1 2 25: Life Event Icon

A clickable on-screen icon that scrolls along the top of the screen.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Scroll left; self-destruct when off-screen (signals the death cloud for death events) |
| Custom | 1000 | Clicked — pan the camera to the creature (or stored position), select it, then self-destruct |

For death events, both the click handler and the off-screen handler set the creature's `ov81 = 1` to **signal the death cloud to fire**, so old bodies don't linger.

## Removal Script

```
rscr
enum 1 2 24
    kill targ
next
enum 1 2 25
    kill targ
next
enum 1 2 37
    kill targ
next
```

Kills the factory, all icons and any photographers.

## Impact on Stimulus / Room CA

None. The factory shows notifications, photographs creatures into their history, plays music, and can trigger the death-cloud cleanup. It emits no stimuli and does not affect Room CA.
