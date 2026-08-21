# ds gui - options.cos — Options Menu GUI

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/ds gui - options.cos`

## Overview

This script builds the **Options Menu** (`1 2 12`), the slide-out HUD panel that holds the game's settings. Most of its logic is carried over from Creatures 3, with new sections for Docking Station. It groups together:

- **Audio** — SFX and music volume sliders, mute toggles, and the **Norn Burble** (creature voices) on/off toggle.
- **Population** — editable **Total Population** and **Breeding Limit** caps (the DS ecology controls).
- **General** — Quit, Pause, About, and windowed/full-screen toggle.
- **Hand** — rename the hand, and a normal/custom hand with RGB tint adjustment.

It registers itself as `game "ds_gui_options"` and listens for mouse-down events (`imsk 8`). It also creates the **About box** (`1 2 34`), a paged info dialog.

Settings are persisted as game/engine variables: `sfx_volume`, `music_volume`, `engine_dumb_creatures` (1 = voices off), `total_population`, `breeding_limit`, and `pntr_Red`/`pntr_Green`/`pntr_Blue` (custom hand colour). Name-vars track UI state: `name "vol"` (which slider is shown), `name "hand"` (normal/custom), `name "screen"` (windowed/full).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 12 | Options Menu | `ds gui` | The slide-out settings panel — see [detail](#agent-1-2-12-options-menu) |
| 1 2 34 | About Box | `useful_screen` | A paged dialog showing the engine version and credits — see [detail](#agent-1-2-34-about-box) |

## Agent 1 2 12: Options Menu

A `new: comp` panel parked off the right edge of the window. `ov99` is the in/out slide flag, `ov00` the pause state.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Refresh the windowed/full-screen label (in case it changed externally) |
| Mouse Down | 76 | Begin editing the Total Population / Breeding Limit text fields |
| World Loaded/Resize | 123 | Re-sync mute/volume button states and re-dock the panel |
| Custom — quit | 1000 | Trigger the quit dialog (via the keyboard handler `1 2 6`, ESC) |
| Custom — pause | 1001 | Toggle the world pause — `wpau`, and `paus` most creatures/agents (leaving the hand and a few systems running) |
| Custom — SFX toggle | 1002 | Mute/unmute sound effects (also forces `engine_dumb_creatures` on) |
| Custom — music toggle | 1003 | Mute/unmute music |
| Custom — about | 1004 | Open the About box (`1 2 34`) |
| Custom — rename hand | 1005 | Set the hand's name (`hand`) from the text box |
| Custom — hand red/green/blue | 1011/1012/1013 | Step the custom hand's R/G/B tint and re-tint the pointer |
| Custom — screen toggle | 1014 | Switch between windowed and full-screen (`wdow`) |
| Custom — norn burble | 1015 | Toggle creature voices (`engine_dumb_creatures`) |
| Custom — volume control | 1016 | Step the shown volume slider (music or SFX) through its levels |
| Custom — hand normal/custom | 1017 | Switch the hand between the normal grey and the custom tinted hand |
| Custom — options open/close | 1020 | Slide the panel in/out; on close, commit the population limits and hand name |
| Custom — set total population | 1024 | Validate and store `total_population` (keeps it ≥ breeding limit + 2), then `rgam` |
| Custom — set breeding limit | 1025 | Validate and store `breeding_limit` (keeps it ≤ total − 2), then `rgam` |
| Custom — volume toggle | 1026 | Switch the slider between controlling music and SFX |

### Pause (event 1001) and Population (1024/1025)

**Pause** freezes the world (`wpau 1`) and pauses creatures and most agents (`paus 1`), with a few exceptions kept running; toggling again unpauses everything. **Population** edits cross-clamp each other so the breeding limit always stays at least 2 below the total population, and call `rgam` to apply the new ecology caps.

## Agent 1 2 34: About Box

A paged `useful_screen` dialog created by event 1004; shows the engine version (`vmjr.vmnr` plus build/patch) and credits text.

| Event | Number | Description |
|---|---|---|
| Custom — close | 1000 | Dismiss the dialog |
| Custom — page down | 1001 | Next page of text |
| Custom — page up | 1002 | Previous page |
| Custom — set page counter | 1003 | Update the "n/total" page label and enable/disable arrows |

## Removal Script

```
rscr
enum 1 2 12
    kill targ
next
enum 1 2 34
    kill targ
next
```

Kills the options panel and the About box.

## Impact on Stimulus / Room CA

None directly. The Options Menu emits no creature stimuli and writes no Room CA. Its world-affecting actions are configuration: it sets audio volume/mute and the `engine_dumb_creatures` voice flag, toggles screen mode, tints the pointer/hand, pauses the world, and — most significantly for the ecology — sets the **`total_population`** and **`breeding_limit`** caps that govern how many creatures the world allows and breeds.
