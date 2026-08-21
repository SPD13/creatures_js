# DS object of attention indicator.cos — "IT" Indicator

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS object of attention indicator.cos`

## Overview

This script creates the **object-of-attention indicator** (`1 2 2`) — the floating marker that hovers over whatever the currently selected creature is paying attention to (its "IT"). It lets the player see what the creature is focused on. When no creature is selected, or the creature isn't attending to anything, it hides. It is the Docking Station counterpart of the Creatures 3 [object of attention indicator](../C3/object%20of%20attention%20indicator.md), and is the companion to the [norn indicator](DS%20norn%20indicator.md).

At install it creates `1 2 2` (`attention` sprite, `attr 272` = camera-shy + invisible-to-creatures, plane 8300, `tick 1`) parked at (100, 100), pose 10.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 2 | Object-of-Attention ("IT") Indicator | `attention` | Floating marker over the selected creature's current object of attention |

## Agent 1 2 2: "IT" Indicator

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Track the selected creature's attention target, or hide |

#### Event 9 — Timer

Every tick: if a creature is selected (`norn ne null`) and that creature has an object of attention (`iitt ne null`), it moves itself over that target (offset -10, -20) and, on first appearing (`ov00 = 0 → 1`), plays its reveal animation `[0…9 255]`. If there is no selected creature or no attention target, it shows the hidden pose (10) and resets.

### Removal Script

```
rscr
enum 1 2 2
    kill targ
next
scrx 1 2 2 9
```

Kills the indicator and removes its timer script.

## Impact on Stimulus / Room CA

None. It is a UI marker that tracks the selected creature's attention target; it emits no stimuli and does not affect Room CA.
