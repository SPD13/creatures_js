# pointer activate stimming norns.cos — Pointer-Click Attention Broadcaster

**Source**: `Assets/Bootstrap/001 World/pointer activate stimming norns.cos`

## Overview

This tiny bootstrap script installs an invisible utility agent that nudges creature attention whenever the player clicks on anything in the world. Each time the user presses a mouse button, the agent finds whatever is currently under the pointer's hotspot and broadcasts a `URGE SHOU` from that agent — effectively shouting "look at this!" to every creature within hearing range that shares the same metaroom.

The practical effect is that player clicks act as an implicit attention cue: clicking on a norn, a toy, food, or any agent suggests to nearby creatures that *that* classifier is worth attending to. This helps the player gently direct creature focus without issuing explicit verbal commands, and is especially useful for drawing wandering norns toward an object of interest.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 123 | Pointer Attention Broadcaster | `blnk` (invisible) | Invisible mouse-down listener that fires an attention nudge at whatever the pointer is over | [Detail](#pointer-attention-broadcaster-1-1-123) |

---

## Pointer Attention Broadcaster (1 1 123)

An invisible simple agent that exists solely to receive global raw mouse-down events and turn them into creature-attention broadcasts. It has no visible representation, no physics, and no behaviour of its own — it is a pure input hook.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `blnk` frame 0 | Blank/invisible sprite |
| Position | (0, 0, 0) | Off-world — agent is never positioned visually |
| `attr` | 16 | Invisible |
| `imsk` | 8 | Raw Mouse Down input events — enables dispatch of event 76 to this agent |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 76 | Raw Mouse Down | Fires on every mouse button press; broadcasts a SHOU urge from the clicked agent to nearby creatures |

#### Event 76 — Raw Mouse Down

Executed each time any mouse button is pressed (with `imsk 8` set, the engine dispatches raw mouse events to this agent). `_P1_` holds the button that was pressed (1 = left, 2 = right, 4 = middle), although this script ignores it and treats all buttons identically.

1. `inst` — run uninterrupted to completion.
2. `seta va00 hots` — fetch the agent under the pointer's hotspot (frontmost hit).
3. If an agent is found (`va00 ne null`):
   - `targ va00` — target the clicked agent.
   - `urge shou 0.5 -1 -1.0` — broadcast an attention nudge from the clicked agent to every creature that can hear it (same metaroom, within hearing range).

**URGE SHOU parameters**:
- `noun_stim = 0.5` — moderate positive attention toward TARG's noun category (the category is derived automatically from TARG's classifier).
- `verb_id = -1` — no verb suggestion.
- `verb_stim = -1.0` — reset/no verb stimulus.

In other words: clicking on anything says to surrounding creatures "pay more attention to this kind of thing," without suggesting any specific action.

### Notes

- If the click is over empty space (no agent under the pointer), the script does nothing.
- The nudge only reaches creatures that are in the same metaroom as the clicked agent and within `URGE SHOU`'s audible range (800 px default).
- Because `imsk 8` is the only bit set, this agent ignores keyboard input, mouse movement, mouse up, wheel, and translated-char events.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the broadcaster:

1. `scrx 1 1 123 76` — remove the Raw Mouse Down event script.
2. `rtar 1 1 123` — target a random instance of the broadcaster agent.
3. `kill targ` — destroy it.

Since only one broadcaster is created at bootstrap, `rtar` picks that single instance.
