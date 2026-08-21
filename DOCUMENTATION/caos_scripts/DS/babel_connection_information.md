# babel_connection_information.cos — Online Connection Info Overlay

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/babel_connection_information.cos`

## Overview

This script creates a developer/diagnostic overlay (`1 1 201`) that displays the status of the Docking Station online connection — the **"Babel"** network server. Toggled with **Shift+Ctrl+B**, it shows the player's UserID and nickname, the connected server, how many people are online, and network statistics, all read from the `net:` command family.

At install it creates `1 1 201` (compound `babel` sprite, `attr 48`, `imsk 1`, `tick 100`), hidden and off-screen.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 201 | Babel Connection Info | `babel` | Toggleable overlay showing online connection status |

## Agent 1 1 201: Babel Connection Info

`ov00` is the display state, cycled 0 → 1 → 2 → 3 → 0 by repeated Shift+Ctrl+B.

### Events

| Event | Number | Description |
|---|---|---|
| Raw Key Down | 73 | Shift+Ctrl+B cycles the info states |
| Timer | 9 | Refresh the display while shown (states 2/3) |
| Custom | 1000 | Build and write the connection-info text |

#### Event 73 — Toggle (Shift+Ctrl+B)

Steps through four states: **0→1** trigger the fast-info network agent (`1 1 58`, message 1000); **1→2** also show the full info panel centred on screen; **2→3** dismiss the fast info (`1 1 58`, message 1001); **3→0** hide everything.

#### Event 1000 — Update display

Builds the panel text from the `Babel Connection Info Text` catalogue. **When online** (`net: line = 1`): UserID (`net: user`), nickname (`game "user_of_this_world"`), server host (`net: host`), and live statistics via `net: stat` (people connected, sent/received counts, and a time figure). **When offline** (`net: line = 0`): the same layout with "not connected" placeholders and zeroed stats.

## Removal Script

```
rscr
enum 1 1 201
    kill targ
next
```

Kills the overlay.

## Impact on Stimulus / Room CA

None. The overlay only reads and displays network status; it emits no stimuli and does not affect Room CA.
