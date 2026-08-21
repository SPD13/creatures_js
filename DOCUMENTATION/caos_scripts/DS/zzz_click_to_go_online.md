# zzz_click_to_go_online.cos — "Click to Go Online" Hint

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/zzz_click_to_go_online.cos`

## Overview

This script creates a one-time **"click here to go online"** hint (`1 1 224`) that points the player at the connect button after they've finished the welcome sequence. It floats next to the top-left HUD (`game "ds_gui_topleft"`), and once the player has been welcomed (and isn't already online) it fades in, animates a short "click here to go online" message (from the `CWRTGO` catalogue), and fades back out. It only ever shows once (guarded by `game "shown_where_to_click"`).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 224 | Go-Online Hint | `click_this` | The floating "click to go online" prompt — see [detail](#agent-1-1-224-go-online-hint) |

## Agent 1 1 224: Go-Online Hint

A `new: comp` agent that floats relative to the top-left HUD (parked off-screen until shown).

### Events

| Event | Number | Description |
|---|---|---|
| World Loaded | 128 | Wait until the player is welcomed and hasn't seen this hint; if offline, show it |
| Custom — show | 1000 | Fade in, cycle the "click to go online" text, then fade out (or stop once online) |
| Push | 1 | Dismiss the hint |
| Custom — pointer slap | 101 | Slap animation |

### Event 128 — Trigger

Waits until `game "user_has_been_welcomed"` is set and `game "shown_where_to_click"` is still 0, then — if the player is still **offline** — messages itself 1000 to display the hint, and marks `shown_where_to_click` so it never appears again.

## Removal Script

```
rscr
enum 1 1 224
    kill targ
next
```

Kills the hint.

## Impact on Stimulus / Room CA

None. This is a one-time onboarding UI hint that points to the connect button. It emits no creature stimuli and writes no Room CA (it only reads/sets the `user_has_been_welcomed` / `shown_where_to_click` / `status` game variables).
