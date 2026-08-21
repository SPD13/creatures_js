# lift_cutaway.cos — Lift Cutaway Graphics

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/lift_cutaway.cos`

## Overview

This script places two **static decorative cutaway graphics** (`1 1 178`) over the Meso lift shaft, so the lift appears cut away to reveal the cabin. They are purely cosmetic overlay agents with no behaviour — one at the top level (high plane) and one at the mid level (low plane) so the lift cabin renders correctly between them.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 178 | Lift Cutaway | `lift_cutaway` | Static decorative cutaway overlay for the lift shaft (no events) |

Two instances are created: a top-level overlay (plane 300) and a mid-level overlay (plane 8000). Neither has any event scripts.

## Removal Script

```
rscr
enum 1 1 178
    kill targ
next
```

Removes the cutaway graphics.

## Impact on Stimulus / Room CA

None. These are inert decorative sprites. They emit no creature stimuli and write no Room CA.
