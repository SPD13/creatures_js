# dev tool.cos — Developer Debug Tool

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/dev tool.cos`

## Overview

This script installs a hidden **developer debug tool** (`1 1 121`) — an invisible agent that listens for **Ctrl+Shift+\<key\>** combinations and toggles a set of on-screen readout overlays that follow the pointer, plus a food-spawning shortcut. It is a development aid, not part of normal gameplay.

| Hotkey | Action |
|---|---|
| **Ctrl+Shift+X** | Toggle the **XY position** tool (`1 1 59`) — shows the pointer's world coordinates |
| **Ctrl+Shift+R** | Toggle the **Room ID** tool (`1 1 18`) — shows the room ID under the pointer |
| **Ctrl+Shift+T** | Toggle the **Taxonomy/classifier** tool (`1 1 143`) — shows the family/genus/species of the hovered agent |
| **Ctrl+Shift+E** | Spawn a burst of debug **food** (carrots, nuts, lemons) at the mouse |

The three readout tools are mutually exclusive — toggling one closes the others. Each floats by the pointer (`flto`, `frel pntr`) and refreshes on a 1-tick timer.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 121 | Dev Tool Controller | `blnk` | Invisible keyboard listener that toggles the debug overlays — see [detail](#agent-1-1-121-dev-tool-controller) |
| 1 1 59 | XY Position Tool | `blank` | Floating readout of the pointer's X/Y — see [detail](#agent-1-1-59-xy-position-tool) |
| 1 1 18 | Room ID Tool | `blank` | Floating readout of the room ID under the pointer — see [detail](#agent-1-1-18-room-id-tool) |
| 1 1 143 | Taxonomy Tool | `blank` | Floating readout of the hovered agent's classifier — see [detail](#agent-1-1-143-taxonomy-tool) |

The **Ctrl+Shift+E** shortcut also spawns 10 each of three stock food agents (carrot `2 11 9`, nut `2 3 17`, lemon `2 8 7`); these are instances of food defined by other scripts, not new classes, so they are not registered as created here.

## Agent 1 1 121: Dev Tool Controller

An invisible `new: simp` with `imsk 1` (raw key-down events enabled), parked at (0,0). `ov00`/`ov01`/`ov02` track whether the XY / room / taxonomy tools are currently out.

### Events

| Event | Number | Description |
|---|---|---|
| Key Down | 73 | If Ctrl (`keyd 17`) **and** Shift (`keyd 16`) are held, dispatch on the key in `_p1_` |

#### Event 73 — Hotkey dispatch

- **`X` / `R` / `T`** — closes the other two readout tools, then creates the requested tool (`new: comp`) if it's not already out, or kills it if it is (a toggle).
- **`E`** — at the mouse position (`mopx`/`mopy`), spawns 10 carrots, 10 nuts and 10 lemons with physics (`accg`/`elas`/`fric`/`velo`) and a random launch. Each food emits its smell CA: carrot `emit 8` (food), nut `emit 7`, lemon `emit 6` (fruit/protein).

## Agent 1 1 59: XY Position Tool

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Read the pointer's `posl`/`post` and display them as text |

## Agent 1 1 18: Room ID Tool

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Read the room ID at the pointer (`grap`) and display it |

## Agent 1 1 143: Taxonomy Tool

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Read the hovered agent (`hots`) and display its `fmly gnus spcs`, or a blank if nothing is hovered |

## Removal Script

```
rscr
enum 1 1 59
    kill targ
next
enum 1 1 121
    kill targ
next
enum 1 1 18
    kill targ
next
enum 1 1 143
    kill targ
next
```

Kills the controller and all three readout tools.

## Impact on Stimulus / Room CA

The debug overlays themselves emit no stimuli and write no Room CA — they only read pointer/room/agent state and display text. The **Ctrl+Shift+E** food spawn does introduce food agents that emit smell CAs (food/fruit smells, CA 6/7/8) into the world, but that is the spawned food's behaviour, used here purely as a developer convenience.
