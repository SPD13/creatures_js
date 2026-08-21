# lemon pod.cos — The Lemon Pod

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/lemon pod.cos`

## Overview

This script creates the **Lemon Pod** (`2 23 6`), the lemon-dispensing food pod — the "Lemon Pod" the [Empathic Vendor](empathic%20vendor.md) calls on for **protein/fruit** food. When pushed it dispenses a **lemon** (`2 8 7`) from a limited store (regrowing the bush when empty). Lemons are not only fruit but **medicinal** — eating one injects antihistamine and antibodies into the creature. Uneaten lemons rot into **detritus** (`2 10 54`) that fertilises the soil (water + nutrients), and the amount of fertiliser depends on whether the lemon was whole or half-eaten.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 23 6 | Lemon Pod | `ds lemon pod` | The lemon bush/dispenser — see [detail](#agent-2-23-6-lemon-pod) |
| 2 8 7 | Lemon | `ds lemon pod` | The medicinal fruit — see [detail](#agent-2-8-7-lemon) |
| 2 10 54 | Lemon Detritus | `ds lemon pod` | The rotting lemon that fertilises the soil — see [detail](#agent-2-10-54-lemon-detritus) |

## Agent 2 23 6: Lemon Pod

`ov70` is the number of lemons left in the bush (starts at 7).

| Event | Number | Description |
|---|---|---|
| Push | 1 | Reward the pusher (stim 90) and dispense a lemon; regrow the bush when the store runs out |
| Pull | 2 | Same as push |
| Custom — dispense | 1000 | Animate the dispenser and spawn a lemon emitting fruit smell |

When the store empties (`ov70 < 0`) the pod blocks creatures (`bhvr 0`), animates the picker harvesting, dispenses a final lemon, regrows the bush, and resets the count.

## Agent 2 8 7: Lemon

A physics fruit emitting the fruit smell. `name "eaten"` tracks whether it's whole or half-eaten.

| Event | Number | Description |
|---|---|---|
| Eat | 12 | Eaten: inject medicinal chemicals + stim **78 (ate fruit)**; first bite → half pose, second bite → vanish |
| Collision | 6 | Landing sound (only while whole) |
| Timer | 9 | If not carried, rot into detritus (`2 10 54`) carrying its eaten state, and die |

### Event 12 — Eat (`benechems`)

On each bite it runs `benechems`, which targets the eater and injects:
- **Antihistamine** — `chem 100` (a random small dose)
- **Antibodies** — `chem 102`–`109` (small random doses to each)

then stims the eater **78 (ate fruit)**. So the lemon doubles as a remedy that boosts the immune system.

## Agent 2 10 54: Lemon Detritus

| Event | Number | Description |
|---|---|---|
| Timer | 9 | If not carried, play the rot animation and **fertilise the room** (water + nutrients) by an amount based on how much lemon was left, then die |

A whole lemon's detritus adds **+0.4** to both CA 3 (water) and CA 4 (nutrients); a half-eaten one adds **+0.2** each — a partly-eaten lemon returns less to the soil.

## Removal Script

```
rscr
enum 2 23 6 / 2 8 7 / 2 10 54
    kill targ
next
scrx … (removes the pod, lemon and detritus scripts)
```

Kills the pod, all lemons and any detritus.

## Impact on Stimulus / Room CA

**Stimuli:** pushing/pulling the pod stims the creature with **90 (activate machinery)**; eating a lemon stims the eater with **78 (ate fruit)**.

**Creature chemistry:** eating a lemon injects **antihistamine (chem 100)** and **antibodies (chems 102–109)** — a medicinal/immune boost.

**Room CA:** lemons `emit` **CA 6 (fruit/protein smell)** so creatures can find them. When a lemon rots, its detritus raises the room's **CA 3 (water)** and **CA 4 (nutrients)** via `prop` (whole +0.4, half-eaten +0.2 each), fertilising the soil.
