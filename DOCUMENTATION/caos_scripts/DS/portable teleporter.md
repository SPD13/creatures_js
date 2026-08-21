# portable teleporter.cos — The Teleporter System

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/portable teleporter.cos`

## Overview

This script builds the **teleporter** network: a fixed **teleporter base** in the Workshop with three coloured buttons (green / yellow / blue), and three matching **portable teleporter** pads scattered across the world. The base can summon creatures standing on it to any of the three coloured pads, and stepping a creature onto a coloured pad teleports it (and any touching companions) back to the base. Each teleport plays a warp animation and the `tele` sound. Pad positions differ depending on whether the world is docked with Creatures 3 (Bridge/Terrarium) or standalone (Hub/Comms).

A `name "teleport"` flag ("yes"/"no") on the base ensures only one teleport happens at a time.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 152 | Teleporter Base Animation | `ds teleporter base` | The animating teleporter pad graphic in the Workshop (classifier shared with [carrot pod](carrot%20pod.md)) |
| 3 2 2 | Teleporter Base | `ds teleporter base` | The control panel with the three colour buttons — see [detail](#agent-3-2-2-teleporter-base) |
| 3 2 3 | Portable Teleporter | `ds portable teleporter` | A coloured destination pad — see [detail](#agent-3-2-3-portable-teleporter) |
| 1 1 153 | Teleporter Effect | `ds portable teleporter` | The transient warp animation at each teleport |

The base stores a reference to the base animation (`1 1 152`) in `ov90`; each portable pad records its colour in `ov00` (1 green, 2 yellow, 3 blue).

## Agent 3 2 2: Teleporter Base

| Event | Number | Description |
|---|---|---|
| Push / Pull | 1 / 2 | Trigger a random colour button |
| Custom — green button | 1001 | Teleport base-standers to the **green** pad |
| Custom — yellow button | 1002 | Teleport base-standers to the **yellow** pad |
| Custom — blue button | 1003 | Teleport base-standers to the **blue** pad |
| Custom — incoming | 1000 | Play the arrival animation when a creature teleports in |

### Events 1001 / 1002 / 1003 — Send to a pad

Each (gated on `name "teleport" = "yes"`) plays the base's charge-up animation, finds the matching portable pad (`3 2 3` by `ov00`) — provided it isn't being carried or falling — spawns a **teleporter effect** (`1 1 153`) there, then teleports every creature it can see within range 200 of the base (`esee 4 0 0`, excluding the held creature) to that pad's location (`mvft`/`mvsf`). It then tears down the effect and resets the teleport flag. If the target pad is unavailable it buzzes.

## Agent 3 2 3: Portable Teleporter

| Event | Number | Description |
|---|---|---|
| Activate (push) | 1 | Teleport touching creatures to the base |
| Activate (pull) | 2 | Same as push |

### Event 1 — Send to base

If not being carried and the base is free, it marks the base busy, spawns a teleporter effect (`1 1 153`), and teleports every creature touching it (`etch 4 0 0`, excluding the held creature) to the base location in the Workshop, then resets.

## Removal Script

```
rscr
enum 3 2 3 / 1 1 153 / 3 2 2 / 1 1 152
    kill targ
next
```

Kills the pads, effects, base panel and base animation.

## Impact on Stimulus / Room CA

None. The teleporter moves creatures spatially between the base and the coloured pads (`mvft`/`mvsf`) with a warp animation and sound. It emits no creature stimuli and writes no Room CA.
