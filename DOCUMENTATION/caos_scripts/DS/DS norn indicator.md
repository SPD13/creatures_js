# DS norn indicator.cos — Selected-Creature Indicator

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS norn indicator.cos`

## Overview

This script creates the **Norn indicator** (`1 2 1`) — the floating icon that hovers above the currently selected creature (the "Norn") to show which creature the camera/UI is focused on. When no creature is selected it hides itself. It is the Docking Station counterpart of the Creatures 3 [norn indicator](../C3/norn%20indicator.md).

At install it creates `1 2 1` (`indicator` sprite, `attr 272` = camera-shy + invisible-to-creatures, plane 8300, `tick 1`) parked at (100, 100), pose 10.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 1 | Norn Indicator | `indicator` | Floating marker above the currently selected creature |

## Agent 1 2 1: Norn Indicator

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Track the selected creature, or hide if none |

#### Event 9 — Timer

Every tick: if a creature is selected (`norn ne null`), it floats relative to that creature (`frel`, offset 10, -20) and, on first appearing (`ov00 = 0 → 1`), plays its reveal animation `[0…9 255]`. If no creature is selected, it shows the hidden pose (10) and resets `ov00`.

### Removal Script

```
rscr
enum 1 2 1
    kill targ
next
scrx 1 2 1 9
```

Kills the indicator and removes its timer script.

## Impact on Stimulus / Room CA

None. The indicator is a UI marker that tracks the selected creature; it emits no stimuli and does not affect Room CA.
