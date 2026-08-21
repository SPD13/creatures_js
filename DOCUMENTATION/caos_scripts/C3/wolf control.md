# wolf control.cos - Wolfling Run / Engine Control Debug Panel

**Source**: `Assets/Bootstrap/001 World/wolf control.cos`

## Overview

This script installs the **Wolf Control** overlay — a developer/debug GUI panel that exposes the engine's *Wolfling Run* mode (accelerated / unattended simulation) via the `wolf` CAOS command family. It lets the user toggle between normal and fast engine ticks, enable or disable autokill of elderly/ill creatures, and see live diagnostic readouts (world tick count, equivalent in-world time, actual frame rate, current rendering/tick/autokill modes).

The panel is a single `comp` agent created once at bootstrap. It is shown/hidden via global keyboard shortcuts and it polls itself every 60 seconds (`tick 1200`) to refresh the readouts when visible. It does **not** create or modify any creatures or ecosystem agents; it is purely a UI surface onto the `wolf` engine control command.

Keyboard shortcuts (all require Shift+Ctrl):
- **Shift+Ctrl+W** — Toggle the panel on/off. When turning on, it floats itself to the screen centre; when turning off it flings itself off-screen to `(-1000, -1000)` and resets the rendering/tick mode back to default via `wolf 12 1`.
- **Shift+Ctrl+F** — Toggle **Fast ticks** (Wolfling Run speed) via `wolf 15 3`, then force an immediate readout refresh.
- **Shift+Ctrl+A** — Toggle **Autokill** via `wolf 15 8`, then force an immediate readout refresh.

The removal script (`rscr`) kills every instance of the panel and calls `wolf 12 1` to make sure the engine is left in the default rendering/tick mode.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 202 | Wolf Control Panel | `wolf` | Debug GUI panel exposing the `wolf` engine control command (Wolfling Run toggles + diagnostics) | [Detail](#wolf-control-panel-1-2-202) |

---

## Wolf Control Panel (1 2 202)

The only agent created by this script. It is a `comp` (composite) agent with classifier `1 2 202`, base sprite `"wolf"`, plane `9000` (very high — renders above almost everything), and `attr 48` (floatable + invisible-to-creatures). A single fixed text part (`pat: fixd 1`) is attached using the `WhiteOnTransparentChars` bitmap font, formatted with 8/8/8/8 margins, left/top aligned. The panel is initially masked (`imsk 1`) and starts hidden with `ov00 = 0` and `tick 1200` (refresh period: 1200 ticks ≈ 60 seconds of world time at 20 ticks/sec).

The agent uses a single overlay variable as its visibility state:
- `ov00 = 0` → panel hidden (parked at -1000,-1000)
- `ov00 = 1` → panel visible (floated to the window centre)

### Events

| Event # | Event Name | Description |
|---|---|---|
| 73 | Key Down | Global keyboard shortcut handler (Shift+Ctrl + W / F / A) |
| 9 | Timer | Periodic refresh trigger — forwards to the readout builder via message 1000 |
| 1000 | User Message — "Refresh" | Rebuilds the diagnostic text into the fixed text part if the panel is visible |

#### Event 73 — Key Down (Shift+Ctrl + W/F/A)

Runs under `inst`. Only acts when both Shift (`keyd 16`) and Ctrl (`keyd 17`) are currently held. `_p1_` is the key code of the key that was just pressed.

- **`_p1_ = 'W'`** — Toggle panel visibility:
  - If currently hidden (`ov00 = 0`): flip `ov00 = 1`, compute `(wndw/2 - wdth/2, wndh/2 - hght/2)` and `flto` the panel there so it is centred in the game window, then `mesg writ ownr 1000` to force an immediate readout.
  - If currently visible: flip `ov00 = 0`, fling the panel to `(-1000, -1000)` (off-screen), and call `wolf 12 1` to reset the engine's rendering/tick mode to default. This ensures hiding the panel also restores a normal simulation state.
- **`_p1_ = 'F'`** — If the panel is visible, call `wolf 15 3` (toggle **Fast ticks** / Wolfling Run speed) and refresh via message `1000`.
- **`_p1_ = 'A'`** — If the panel is visible, call `wolf 15 8` (toggle **Autokill** of elderly / dying creatures) and refresh via message `1000`.

No stimulus, room CA, or creature state is touched — only the engine-wide `wolf` control command and the panel's own visibility.

#### Event 9 — Timer

Fires every 1200 ticks (`tick 1200`). The handler is a one-liner that forwards the work to the refresh handler:

```
mesg writ ownr 1000
```

While this fires unconditionally every 60 seconds, event 1000 short-circuits when the panel is hidden, so there is effectively no cost while invisible.

#### Event 1000 — Refresh Readout

Runs under `inst`. Immediately `stop`s if the panel is hidden (`ov00 = 0`). Otherwise it rebuilds a multi-line status string in `va00` and pushes it into part 1 via `part 1` + `ptxt va00`.

Contents of the readout:

1. Heading: `"Wolf Control\n\n"`.
2. **World ticks**: `wtik` printed via `vtos`.
3. **Equivalent time**: converts `wtik` into hours/minutes by dividing by 20 (ticks/sec), then by 60 repeatedly. Prints `"<h> hour(s) <m> minute(s)"` with correct singular/plural form for both fields.
4. **Frame rate**: `1 / race × 1000` — real-time frames per second computed from `race` (milliseconds per real frame).
5. **Rendering / tick mode flags** from `wolf 15 0` (bitfield read):
   - Bit 1 set → `"Rendering display"`, otherwise `"Display update every <tick/20> secs equivalent"` (where `tick` is the panel's own tick period, 1200 → 60s).
   - Bit 2 set → `"Fast ticks"`, otherwise `"Normal ticks"`.
   - Bit 8 set → `"Autokill enabled"`, otherwise `"Autokill disabled"`.
6. Footer describing the three shortcuts (Shift+Ctrl+W/F/A).
7. Finally, `setv va00 wolf 11 4` is executed — this issues another `wolf` subcommand (believed to request / acknowledge the current diagnostic state from the engine). The result is assigned into `va00` purely for side-effect; the printed text has already been written to the part above.

This event does not affect any agent, creature, stimulus or Room CA — it only reads engine state and writes into its own text part.

---

## Removal Script (rscr)

Invoked during bootstrap re-installation / world cleanup:

1. `enum 1 2 202 → kill targ` — removes every Wolf Control panel instance.
2. `setv va00 wolf 12 1` — resets the engine's rendering/tick mode to default, guaranteeing the simulation is not left stuck in Wolfling Run / non-rendering state after uninstall.

## External Interactions

| Target | Interaction | Context |
|---|---|---|
| Engine `wolf 12 1` | Reset command | Restore default rendering/tick mode on hide and on `rscr` |
| Engine `wolf 15 0` | Read flags | Bitfield query for rendering / fast-tick / autokill state |
| Engine `wolf 15 3` | Toggle command | Flip Fast-ticks (Wolfling Run speed) mode |
| Engine `wolf 15 8` | Toggle command | Flip Autokill of elderly / dying creatures |
| Engine `wolf 11 4` | Status command | Side-effect read at end of refresh (believed: diagnostic/ack) |
| Global keyboard | `keyd 16` / `keyd 17` / `_p1_` | Shift+Ctrl+W/F/A shortcut handling |
| Window metrics | `wndw` / `wndh` / `wdth` / `hght` | Centres the panel on the game window |
