# !world_tints.cos - World Tint Table

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/!world_tints.cos`

## Overview

This bootstrap script populates the **world tint table** for Docking Station. It does not create any agents; it only registers a set of named, numbered colour tints with the `wtnt` command. Once registered, any agent can recolour its sprites by referencing a tint index (e.g. via the `tint` command) instead of specifying raw colour values, keeping a consistent shared palette across the world.

The `!` prefix makes it run early in the `010 Docking Station` bootstrap folder, so the tint table is available before the agents that use it are installed.

## No Created Agents

This script creates no agents. It exclusively defines entries in the world tint table.

## Tint Table

```
wtnt <index> <red> <green> <blue> <rotation> <swap>
```

`red`/`green`/`blue` set the tint's colour balance (0–255); `rotation` and `swap` are the hue-rotation and channel-swap parameters, with **128** as the neutral midpoint (no rotation, no swap). All seven tints below use neutral rotation/swap, so they are pure colour tints.

| Index | Name | R | G | B | Rotation | Swap |
|---|---|---|---|---|---|---|
| 1 | Pure red | 255 | 0 | 0 | 128 | 128 |
| 2 | Pure green | 0 | 255 | 0 | 128 | 128 |
| 3 | Pure blue | 0 | 0 | 255 | 128 | 128 |
| 4 | Shocking magenta | 255 | 0 | 255 | 128 | 128 |
| 5 | Dull purple | 128 | 0 | 128 | 128 | 128 |
| 6 | Mid grey | 128 | 128 | 128 | 128 | 128 |
| 7 | Salmon | 255 | 128 | 128 | 128 | 128 |

These indices form a reusable palette that other Docking Station agents reference when they need to tint their appearance (status colours, highlights, etc.).

## Impact on Stimulus / Room CA

None. The script only registers colour tints; it has no effect on agents, stimuli, or Room CA.
