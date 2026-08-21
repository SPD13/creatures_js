# keycode displayer.cos — Keycode Displayer (Dev Tool)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/keycode displayer.cos`

## Overview

This script installs a small **developer tool** (`1 2 205`) that displays the **keycode** of whatever key is pressed, as a readout next to the pointer. It is toggled with **Shift+Ctrl+K** and is intended for developers working out which key codes to test for in keyboard scripts. On install it first kills any existing instance so re-injecting it doesn't stack duplicates.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 205 | Keycode Displayer | `blank` | Invisible key listener that shows pressed keycodes — see [detail](#agent-1-2-205-keycode-displayer) |

## Agent 1 2 205: Keycode Displayer

An invisible `new: comp` agent listening for raw key-down events (`imsk 1`). `ov00` tracks whether the readout is currently showing.

### Events

| Event | Number | Description |
|---|---|---|
| Key Down | 73 | **Shift+Ctrl+K** toggles the readout on/off; while on, displays the keycode of each key pressed |

### Event 73

When **Shift+Ctrl+K** is detected (`keyd 17` Ctrl + `keyd 16` Shift + `_p1_ = 'K'`), it toggles the display: creating a text part that follows the pointer (`frel pntr`) and switching `ov00` on, or killing the part and detaching when toggled off. While active, every key-down updates the part text to `Key:\n<keycode>`.

## Removal Script

```
rscr
enum 1 2 205
    kill targ
next
scrx 1 2 205 73
```

Kills the displayer and removes its key script.

## Impact on Stimulus / Room CA

None. This is a developer keyboard-inspection tool: it reads key-down events and displays text by the pointer. It emits no creature stimuli and writes no Room CA.
