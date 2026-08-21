# DS pointer.cos — Pointer Pick-Up Hotspots

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS pointer.cos`

## Overview

This short bootstrap script configures the engine **pointer** (`pntr`) by setting its pick-up hotspot for each of its poses. The hotspot is the pixel offset on the pointer sprite that counts as the "grab point" when picking agents up. It creates no agents; it only calls `pupt` on the existing pointer. It is the Docking Station counterpart of the Creatures 3 [pointer](../C3/pointer.md).

## No Created Agents

This script creates no agents. It targets the pointer (`targ pntr`) and configures it.

## Configuration

```
pupt <pose> <x> <y>
```

For poses 0 through 7, it sets the pick-up hotspot to **(15, 30)**:

```
pupt 0 15 30
pupt 1 15 30
…
pupt 7 15 30
```

So whichever pose the hand cursor is in, agents are picked up relative to the point 15 pixels right and 30 pixels down from the sprite's top-left — keeping the grab point consistent across all hand poses.

## Impact on Stimulus / Room CA

None. The script only configures the pointer's hotspot; it emits no stimuli and does not affect Room CA.
