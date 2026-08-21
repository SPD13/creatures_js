# babel_fast_info.cos — Fast Network-Status Overlay

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/babel_fast_info.cos`

## Overview

This script creates a fast-updating **network debugging overlay** (`1 1 58`) that displays the current Babel (online) network operation. It is the companion to [babel_connection_information](babel_connection_information.md) (`1 1 201`), which switches it on and off (messages 1000/1001) as part of its Shift+Ctrl+B cycle. While active it ticks every frame and shows `net: what` — the engine's current network activity string.

At install it creates `1 1 58` (compound `blank` sprite, `attr 32` floatable, floated relative to the pointer), hidden and off-screen.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 58 | Babel Fast Info | `blank` | Fast-ticking overlay of the current network operation |

## Agent 1 1 58: Babel Fast Info

### Events

| Event | Number | Description |
|---|---|---|
| Custom | 1000 | Turn on — `tick 1` (per-frame), show, float to (30, 30) |
| Custom | 1001 | Turn off — hide, float off-screen, `tick 0` |
| Timer | 9 | Update the text from `net: what` |

#### Event 9 — Update

Each tick (while on), reads `net: what` (the current network operation) and writes it to the text part, substituting a default string (`Babel Connection Info Text` catalogue entry 16) when there is no current operation. The fast tick is why this is a separate agent from `1 1 201` — raw-key events don't arrive reliably under a per-frame tick, so the connection-info overlay drives it via messages instead.

## Removal Script

```
rscr
enum 1 1 58
    kill targ
next
```

Kills the overlay.

## Impact on Stimulus / Room CA

None. It only reads and displays the network status; it emits no stimuli and does not affect Room CA.
