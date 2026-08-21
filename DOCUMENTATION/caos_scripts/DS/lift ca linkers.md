# lift ca linkers.cos — Lift CA Links

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/lift ca linkers.cos`

## Overview

This is a **map/CA setup script**. Lifts physically separate the floors of the Meso and Workshop into distinct rooms, which would otherwise break the flow of Room CA (smells, heat, chemicals) between those floors. To fix that, this script drops inert invisible marker agents (`1 1 203`) at each lift landing, reads the room ID under each one, and issues `link` commands so the connected rooms **share their CA** across the lift shaft.

It creates the following links (each weight 100):

- **Meso:** Lower Meso ↔ Mid Meso ↔ Upper Meso
- **Workshop:** Upper Workshop ↔ Lower Workshop

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 203 | CA-Link Marker | `blnk` | Inert invisible marker used only to read a room ID for the `link` commands |

The `1 1 203` agents have **no events or behaviour** — five are placed (three in the Meso, two in the Workshop) purely so the script can read the room IDs at the lift landings (`grap`) before linking. They are killed by the removal script.

## Removal Script

```
rscr
enum 1 1 203
    kill targ
next
```

Removes the marker agents. (The CA links themselves persist as part of the room graph.)

## Impact on Stimulus / Room CA

**Room CA only.** This script's entire purpose is to `link` the rooms either side of the Meso and Workshop lifts (weight 100), so that CA propagates between floors that the lifts would otherwise isolate. It emits no stimuli and writes no CA values — it modifies the world's CA-link graph so smells/heat/chemicals can travel up and down the lift shafts.
