# life_events_update_2.cos — Life Event Icon Corpse-Removal Fix

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/life_events_update_2.cos`

## Overview

This is a **patch** that fixes a bug in the **life-event icons** (`1 2 25`, created by [DS life event factory - PHOTOGRAPHS THE DEAD](DS%20life%20event%20factory%20-%20PHOTOGRAPHS%20THE%20DEAD.md)). The logic that flags a **dead creature for corpse removal** — when its death-event icon is clicked or scrolls off screen — was mistakenly wired to fire on **birth** event icons instead of **death** ones. This patch **creates no new agents**; it replaces two scripts on `1 2 25` (the click event 1000 and the scroll/timer event 9) so the "death cloud" corpse-removal signal only fires for actual death events.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 1 2 25 | Life Event Icon | Modification | Events 1000 (click) and 9 (scroll) replaced to fire corpse removal on death events only |

## Behaviour

### Event 1000 — Click (patched)

Shuffles the other icons along, then **moves the camera** to the event's creature (`cmrt`/`cmrp`), selecting it (`norn`) if still alive. If this is a **death** event (`ov03 = 7`) and the creature still exists, it sets `ov81 = 1` on the creature to **signal the death cloud to fire**, so the corpse doesn't linger. The icon then removes itself.

### Event 9 — Scroll (patched)

Slides the icon along the stack; when it scrolls off screen, if it was a **death** event it likewise signals the creature's death cloud before the icon dies.

## Removal Script

This patch only re-installs the icon's event scripts; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

None. This is a UI/cleanup fix. It emits no creature stimuli and writes no Room CA. Its functional effect is to correctly trigger **corpse removal** (the "death cloud") when a death-event icon is dismissed, so dead bodies don't accumulate, and to move the camera to the relevant creature when an event icon is clicked.
