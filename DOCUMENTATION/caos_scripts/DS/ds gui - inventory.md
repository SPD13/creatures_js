# ds gui - inventory.cos — Inventory GUI

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/ds gui - inventory.cos`

## Overview

This script creates the **Inventory** (`1 2 11`), the slide-out HUD panel that stores agents the player has picked up. It is a **vehicle with a cabin** — the hand drops agents into it and they are carried inside (`cabn` cabin region, `clac`/`cabv`/`cabw` capture settings). Most of the logic is carried over unchanged from Creatures 3. The agent registers itself as both `game "c3_inventory"` and `game "ds_gui_inventory"`.

`ov99` is the in/out slide flag (−1 in, +1 out); `ov10`/`ov11` are the parked-position offsets used to dock the panel against the window edge.

There is a commented-out script (event 75) that would auto-pop the inventory out when the hand hovers over it holding an agent — disabled because playtesting found it annoying.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 11 | Inventory | `ds gui` | The slide-out cabin vehicle that stores carried agents — see [detail](#agent-1-2-11-inventory) |

## Agent 1 2 11: Inventory

A `new: vhcl` with a cabin, parked off the right edge of the window.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — open | 1 | Play `gui1`, slide the panel out, and enable cabin capture (`clac`) |
| Custom — close | 2 | Play `gui3`, slide the panel back in and re-dock it |
| World Resize | 123 | Re-dock the panel to the new window edge (or re-open it if it was out) |

The open/close events toggle `ov99` and ramp the vehicle's velocity to slide it on/off screen; `clac` is toggled so the cabin only captures dropped agents while the panel is out.

## Removal Script

```
rscr
enum 1 2 11
    kill targ
next
seta game "c3_inventory" null
seta game "ds_gui_inventory" null
```

Kills the inventory and clears its game-variable handles.

## Impact on Stimulus / Room CA

None. The inventory is a storage vehicle: it carries dropped agents in its cabin and slides on/off screen. It emits no creature stimuli and writes no Room CA.
