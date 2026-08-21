# arch.cos — Arch Scenery

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/arch.cos`

## Overview

This is a one-line scenery script that places a static **arch** decoration (`1 1 165`) in the Norn Meso. It is purely cosmetic — a fixed piece of set dressing with no behaviour.

```
new: simp 1 1 165 "arch" 1 0 8500
attr 16
mvto 986 9031
```

It creates `1 1 165` from the `arch` sprite on plane 8500 (drawn in front of the background) at (986, 9031), with `attr 16` so it is non-interactive.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 165 | Arch | `arch` | Static decorative arch in the Norn Meso |

## Removal Script

```
rscr
enum 1 1 165
    kill targ
next
```

Kills the arch.

## Impact on Stimulus / Room CA

None. It is static scenery with no event scripts; it emits no stimuli and does not affect Room CA.
