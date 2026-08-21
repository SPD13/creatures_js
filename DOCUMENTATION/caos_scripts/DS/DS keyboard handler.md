# DS keyboard handler.cos — Global Keyboard Shortcuts

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS keyboard handler.cos`

## Overview

This script creates the invisible **keyboard handler** agent (`1 2 6`) that listens for global key presses and maps them to game actions — hand slap/tickle modes, creature cycling, pause, inventory management, the quit dialog, and the F2–F12 favourite-place/shortcut slots. It also creates the **quit-confirmation dialog** (`1 2 8`) shown on Escape. It is the Docking Station counterpart of the Creatures 3 [keyboard handler](../C3/keyboard%20handler.md).

At install it creates `1 2 6` (invisible, `imsk 3` = key down + key up) and initialises the function-key game variables `c3_function_key_113` … `c3_function_key_123` to -1 (empty slots).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 6 | Keyboard Handler | `blnk` | Invisible global key listener / shortcut dispatcher |
| 1 2 8 | Quit Confirmation Dialog | `small_useful_screen` | "Quit?" dialog created on Escape |

## Agent 1 2 6: Keyboard Handler

### Events

| Event | Number | Description |
|---|---|---|
| Raw Key Up | 74 | Insert/Delete released → hide the hand indicator |
| Raw Key Down | 73 | The shortcut dispatcher (below) |

### Key bindings (event 73)

| Key | Modifier | Action |
|---|---|---|
| Insert (45) | — | Hand indicator (`1 1 95`) to slap pose, float by the pointer |
| Delete (46) | — | Hand indicator to tickle pose, float by the pointer |
| Escape (27) | — | Drop hand-hold, exit help mode, toggle the **quit dialog** (`1 2 8`) |
| Tab (9) | — / Shift | Select the **next / previous** creature (`pcls`/`ncls`, skipping out-of-world ones; respects `Grettin` selectability) |
| Pause (19) | — | Toggle pause (message to `1 2 12`) |
| 1 | Ctrl | Toggle speech display (`1 2 13`) |
| 2 | Ctrl | Pause toggle (`1 2 12`, message 1020) |
| 3 | Ctrl | Inventory toggle (`1 2 11`) |
| Right (39) | Ctrl | Cycle the next inventory item **out** into the hand (by `unid` order) |
| Left (37) | Ctrl | Cycle the previous inventory item **into** the hand |
| I / Num0 (96) | Ctrl | Put the held item into the inventory (`1 2 11`) |
| F2–F12 (113–123) | (see below) | Favourite-place / shortcut slots |

### F2–F12 slots (favourite places & shortcuts)

Each function key maps to a `c3_function_key_<N>` game variable:

- **Plain press — recall:** if the slot holds a string, send it to the text-entry agent (`1 2 3`) to "say"; if a creature, select it (`norn`); if an integer favourite-place index, retarget that toolbar/map agent (`1 2 <index>`); if -1, open agent help.
- **Shift — record speech:** store what you last said (from the text-entry agent) into the slot.
- **Ctrl — record creature:** store the current Norn into the slot.
- **Shift+Ctrl — record favourite place:** store the currently-highlighted favourite-place button's species into the slot.

(A `set_game_if_valid` subroutine reads the highlighted favourite-place agents `1 2 38 / 15–20`.)

## Agent 1 2 8: Quit Confirmation Dialog

A `small_useful_screen` panel with two buttons.

| Event | Number | Action |
|---|---|---|
| Custom | 1000 | "Don't quit" — play sound and kill the dialog |
| Custom | 1001 | "Quit" — hide, **save the world**, then `load "Startup"` (return to the World Switcher) |

## Removal Script

```
rscr
enum 1 2 6
    kill targ
next
enum 1 2 8
    kill targ
next
scrx 1 2 8 1000
scrx 1 2 8 1001
scrx 1 2 6 73
```

Kills the keyboard handler and any quit dialog and removes their scripts.

## Impact on Stimulus / Room CA

None. The handler dispatches keyboard input to UI/agent actions (and can save/reload the world); it emits no stimuli and does not affect Room CA.
