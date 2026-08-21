# Ettin Muscle Paralyser

## Overview

This script creates a set of invisible sentinel agents placed throughout the tunnel rooms of the Ettin Desert area. Their purpose is to prevent ettins from carrying gadgets (category 33) through these tunnels. Ettins are notorious for stealing gadgets from the Engineering section and hoarding them in their desert. These sentinels periodically scan for ettins in their room and, if an ettin old enough to carry items is holding a gadget, force it to drop the item after a short random delay.

This is a gameplay balancing mechanism that limits ettin kleptomania specifically in the tunnel passages connecting different parts of the desert.

## Created Agents

| Classifier | Sprite | Description | Detail |
|---|---|---|---|
| 1 1 125 | `blnk` (invisible) | Ettin Muscle Paralyser Sentinel | [Detail](#agent-1-1-125-ettin-muscle-paralyser-sentinel) |

Seven instances are created at different positions along the Ettin Desert tunnel2 rooms at y=745:
- (4850, 745), (5090, 745), (5680, 745), (5850, 745), (5090, 745), (6030, 745), (6200, 745)

All instances share `attr 0` (no special attributes) and `tick 10` (timer fires every 10 game ticks).

## Agent Detail

### Agent 1 1 125 — Ettin Muscle Paralyser Sentinel

Invisible agents that monitor tunnel rooms in the Ettin Desert. They scan for ettins carrying gadgets and force them to drop the items, preventing ettins from hoarding stolen machinery.

#### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Scan for ettins holding gadgets and force drop |

#### Event 9 — Timer (every 10 ticks)

**Behavior:**

1. Gets the room ID of the sentinel agent (`room ownr`).
2. Enters instant execution mode (`inst`) to prevent interruption.
3. Enumerates all ettins in the world (classifier `4 3 0`).
4. For each ettin, checks two conditions:
   - The ettin is in the **same room** as the sentinel.
   - The ettin's **life stage** (`cage`) is greater than 0 (i.e., not an embryo — the ettin must be old enough to carry items).
5. If the ettin is **holding something** (`held ne null`):
   - Checks whether the held item's **category** is 33 ("gadget") using `cati fmly gnus spcs`.
   - If the held item is a gadget, sends a **DROP message** (event 5) to the held item with parameters (0, 0) and a **random delay of 1–25 ticks**.
6. The random delay staggers the forced drops so multiple ettins in the same room don't all drop simultaneously.

**Impact:**
- No direct stimulus or Room CA effects.
- Indirectly affects gameplay by limiting ettin gadget theft in tunnel areas, helping preserve the distribution of gadgets across the ship.

#### Removal Script

The removal script (`rscr`) enumerates all agents with classifier `1 1 125` and kills them, cleaning up all sentinel instances.
