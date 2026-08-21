# life_events_update.cos — Life Events Script Repair

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/life_events_update.cos`

## Overview

This is a **patch** that repairs the **Life Event Factory** (`1 2 24`, created by [DS life event factory - PHOTOGRAPHS THE DEAD](DS%20life%20event%20factory%20-%20PHOTOGRAPHS%20THE%20DEAD.md)). The original life-events handler occasionally set the **death-photographer** agents' tick to 0, so they never took their photo or self-destructed — leaking agents. This patch **creates no new agent classes**; it replaces the factory's life-event event (`1 2 24`, event 127) with a corrected version.

The repaired event handles the four life events (born, laid, pregnant, died), spawns the **photographer** (`1 2 37`) and the on-screen **life-event icon** (`1 2 25`) with the right ticks and tooltips, plays a music sting, and keeps the icon stack within `game "ds_number_of_life_events"`.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 1 2 24 | Life Event Factory | Modification | Event 127 (life event) replaced to fix the photographer tick bug |
| 1 2 37 | Life Event Photographer | Creation | Spawned by the patched event to photograph a birth/death |
| 1 2 25 | Life Event Icon | Creation | The on-screen event marker the patched event creates |

## Behaviour

### Event 127 — Life event (patched)

On a creature life event (`hist type`):

- **Born (3):** create a **birth photographer** (`1 2 37`) that snaps a photo after ~5 seconds, and play the birth music sting (`strk … Bleep`).
- **Died (7):** create a **death photographer** that snaps quickly, and play the death sting (`strk … MetallicChords`); non-norn deaths (in a non-grendel/ettin world) are marked "don't register".
- **Laid / Pregnant (11 / 8):** handled as icon events.

In all cases it creates a **life-event icon** (`1 2 25`) positioned in the on-screen stack, sets its tooltip (creature name + event, naming the mother for an egg-laid event), stores the subject's camera position, and — if too many icons exist — shuffles the oldest off (capped by `ds_number_of_life_events`).

## Removal Script

This patch only re-installs the factory's event 127; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

None. The life-event system emits no creature stimuli and writes no Room CA. Its effects are presentation: on-screen event icons, music stings, and **photographs of births and deaths** (the death photographer being the bug this patch fixes).
