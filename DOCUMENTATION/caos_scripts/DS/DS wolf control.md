# DS wolf control.cos — Wolfling-Run Control

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS wolf control.cos`

## Overview

This script creates the **Wolf Control** (`1 2 202`) — the developer/power-user panel for "wolfling runs", where the world is run at accelerated speed (rendering off, fast ticks) so creature populations can evolve quickly. It is toggled with **Shift+Ctrl+W** and shows live world stats and the wolf-run flag states. It is the Docking Station counterpart of the Creatures 3 [wolf control](../C3/wolf%20control.md).

At install it creates `1 2 202` (`wolf` sprite with a text part, `attr 48`, `imsk 1`, `tick 1200`).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 202 | Wolf Control | `wolf` | Toggleable panel controlling the engine's wolfling-run mode |

## Agent 1 2 202: Wolf Control

The engine's wolfling state is read/written with the `WOLF and_mask eor_mask` command; the flag bits are: **bit 0** render display, **bit 1** fast ticks, **bit 3** autokill.

### Events

| Event | Number | Description |
|---|---|---|
| Raw Key Down | 73 | Shift+Ctrl+ W / F / A shortcuts |
| Timer | 9 | Refresh the display (message 1000) |
| Custom | 1000 | Build the live stats / status text |

#### Event 73 — Shortcuts (Shift+Ctrl held)

| Key | Action |
|---|---|
| W | Toggle the control window (centre it / hide it); on hide, restore normal rendering (`wolf 12 1`) |
| F | Toggle **fast speed** (flip render + fast-tick bits, `wolf 15 3`) |
| A | Toggle **autokill** (flip bit 3, `wolf 15 8`) |

#### Event 1000 — Status display

Builds and shows: **World ticks** (`wtik`), the **equivalent in-game time** (h/m/s), the **frame rate** (from `race`), and the current wolf flags — *"Rendering display"* vs *"Display update every N secs equivalent"*, *"Fast ticks"* vs *"Normal ticks"*, and *"Autokill enabled/disabled"* — followed by the keyboard-shortcut help. It refreshes the engine display state with `wolf 11 4`.

### Removal Script

```
rscr
enum 1 2 202
    kill targ
next
setv va00 wolf 12 1
```

Kills the control and resets the engine to normal rendering.

## Impact on Stimulus / Room CA

None directly. The control changes how fast the simulation runs and whether it renders; it emits no stimuli and does not write Room CA. (Running faster does accelerate all creature/ecosystem processes, but that's the engine's wolfling mode, not a stimulus.)
