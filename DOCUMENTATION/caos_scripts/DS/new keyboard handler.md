# new keyboard handler.cos — Import/Export Hotkey Handler

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/new keyboard handler.cos`

## Overview

This script installs a small invisible **keyboard handler** (`1 2 42`) that provides hotkeys for **importing and exporting creatures** via the [Creature Menu](ds%20gui%20-%20creaturemenu.md) (`1 2 13`):

- **Ctrl + `-`** (minus) — **export** the currently-selected creature
- **Ctrl + `=`** (equals) — open the **import** dialog

It is a dedicated handler separate from the main DS keyboard handler, focused only on the creature import/export shortcuts.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 42 | Import/Export Hotkey Handler | `blnk` | Invisible key listener for the creature import/export shortcuts — see [detail](#agent-1-2-42-hotkey-handler) |

## Agent 1 2 42: Hotkey Handler

An invisible `new: simp` agent listening for raw key events (`imsk 3`).

### Events

| Event | Number | Description |
|---|---|---|
| Key Down | 73 | On **Ctrl+minus** export the selected creature; on **Ctrl+equals** open the import dialog |

### Event 73

When Ctrl (`keyd 17`) is held:
- **Key 189 (`-`)** → messages the Creature Menu (`1 2 13`) event 1003 to export the selected creature (buzzing if no creature is selected).
- **Key 187 (`=`)** → messages the Creature Menu event 1002 to open the import dialog.

## Removal Script

```
rscr
enum 1 2 42
    kill targ
next
scrx 1 2 42 73
```

Kills the handler and removes its key script.

## Impact on Stimulus / Room CA

None. This is a keyboard-shortcut handler that forwards import/export commands to the Creature Menu. It emits no creature stimuli and writes no Room CA. (The creature import/export it triggers — adding/removing creatures from the world — is performed by the [Creature Menu](ds%20gui%20-%20creaturemenu.md).)
