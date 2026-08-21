# workshop liftmask.cos — Workshop Lift Mask

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/workshop liftmask.cos`

## Overview

This script places a single static **decorative mask** (`1 1 221`) over the Workshop lift area, so the lift renders correctly behind the workshop scenery. It is a purely cosmetic overlay agent with no behaviour.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 221 | Workshop Lift Mask | `workshop mask` | A static decorative overlay (high plane) in the Workshop; no events |

A single instance is created at a fixed position on plane 8500.

## Removal Script

```
rscr
enum 1 1 221
    kill targ
next
```

Removes the mask.

## Impact on Stimulus / Room CA

None. This is an inert decorative sprite. It emits no creature stimuli and writes no Room CA.
