# Wolf Patch

**Source file:** `Assets/Bootstrap/001 World Patches/wolf_patch.cos`

## Overview

This is a **patch** bootstrap from the `001 World Patches` directory. It does not create any agents and does not modify the map. Its sole purpose is to **replace two scripts of the existing Wolf Control agent** (classifier `1 2 202`) — the per-tick Timer (event 9) and the display-rebuild handler (user message 1000) — to fix a divide-by-zero bug in the original frame-rate read-out, called out by the header comment:

> modifies the timer script of wolf control so it no longer tries to divide by zero.

The "Wolf Control" is the developer/admin overlay that exposes the engine's *Wolfing run* knobs — fast-ticks, autokill, render-suspend — and shows a small live status panel with world-time, frame-rate and the current state of those switches. The bug being fixed is in the frame-rate calculation: when the engine has not yet measured a render race time (`race = 0`, e.g. the very first tick after the panel opens or while ticks are paused), the original code would compute `1 / race` and crash. The new code guards the division and falls back to dividing by 1 so the displayed value reads as 1000 (effectively saying "no measurement yet") instead of throwing.

The Timer (event 9) is now a one-line dispatcher — it just sends user message 1000 to itself. All real work happens in the message-1000 handler. There is no `rscr` removal block — patches are sticky for the lifetime of the world.

## Modified Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 2 202 | Wolf Control (Timer event 9 + user message 1000) | Developer overlay for engine wolfing controls. Patch fixes a divide-by-zero in the frame-rate display. | [Details](#agent-1-2-202-wolf-control-patch) |

---

## Agent 1 2 202: Wolf Control (patch)

The Wolf Control agent (`1 2 202`) is the floating status/help panel installed by the original `wolf control` script. It provides keyboard shortcuts (`Shift+Ctrl+W` to toggle the panel, `Shift+Ctrl+F` for fast speed, `Shift+Ctrl+A` for autokill) and a multi-line text part that mirrors the engine's wolfing state. This patch only swaps its Timer event handler and the display-rebuild user message — every other script (key handlers, click handlers, install/removal) keeps whatever the original installed.

### Agent Variables Referenced by the Patch

| Variable | Purpose |
|---|---|
| `ov00` | Panel-visible flag. When `0`, the message-1000 handler bails immediately so no display work happens while the panel is hidden. |
| `va00` | Accumulator for the multi-line status string. |
| `va01` | Scratch — holds the current wolfing-bitmap (`wolf 15 0`) and is reused for time arithmetic and frame-rate computation. |
| `va02` | Scratch — bitmask test result and minutes component of the equivalent time. |
| `va03` | Scratch — seconds component of the equivalent time. |
| `va10` | Scratch — current `tick` rate in seconds (used when display update is throttled). |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Per-tick dispatcher — forwards to message 1000 |
| User message | 1000 | Rebuild and refresh the status text |

### Event 9 - Timer (the patched script)

```
mesg writ ownr 1000
```

The full body. The timer fires at whatever rate the original install set; on every fire it just enqueues message 1000 to itself. Splitting the work into a separate message makes the panel cheap to refresh on demand (the keyboard shortcuts that toggle states also hand-poke message 1000 to update the text immediately).

### Event 1000 - Display rebuild (the patched script)

The body runs as an atomic `inst` block:

1. **Visibility gate** — if `ov00 = 0` the panel is hidden, `stop` immediately. No string allocation, no part writes, no `wolf` poll.
2. **Title line** — start the accumulator with `"Wolf Control\n\n"`.
3. **World ticks** — append `"World ticks: " + vtos wtik + "\n"`.
4. **Equivalent time** — convert `wtik` (game ticks, 20 per game-second) into hours / minutes / seconds:
   - `va01 = wtik / 20` (total seconds)
   - `va03 = va01 mod 60` (seconds component, computed but not appended — the panel only shows hours and minutes)
   - `va01 = va01 / 60` (now total minutes)
   - `va02 = va01 mod 60` (minutes component)
   - `va01 = va01 / 60` (now total hours)
   - Append `"Equivalent time: <hours> hour[s] <minutes> minute[s]\n"`, with the trailing `s` only if the count is not 1.
5. **Frame rate (the bug fix)** —
   ```
   setv va01 itof 1
   doif race gt 0
       divv va01 race
   else
       divv va01 1
   endi
   mulv va01 1000
   ```
   `race` is the engine's most-recent measured "real seconds per game tick" value. Originally `divv va01 race` was unconditional, crashing on the boot-time / paused-state case where `race = 0`. The patch guards the division and substitutes a divide-by-`1` fallback so the displayed frame rate reads as `1000` (a sentinel "no measurement yet") instead of the agent dying with a div-by-zero exception.
6. **Wolfing-bit decoding** — read the engine's wolfing state once with `va01 = wolf 15 0` and bit-test each flag separately:
   - bit 0 (`andv va02 1 = 1`) — `"Rendering display"` vs `"Display update every <tick/20> secs equivalent"` (uses `va10 = tick`).
   - bit 1 (`andv va02 2 = 2`) — `"Fast ticks"` vs `"Normal ticks"`.
   - bit 3 (`andv va02 8 = 8`) — `"Autokill enabled"` vs `"Autokill disabled"`.
7. **Help footer** — append the static three-line shortcut reminder.
8. **Render** — `part 1` selects the text part of the compound agent and `ptxt va00` writes the rebuilt string.
9. **Refresh poke** — `setv va00 wolf 11 4` is read for its side effect: poking the wolfing subsystem's display refresh slot. The result lands in `va00` (which is about to go out of scope anyway, so the assignment is purely a vehicle for the call).

### Removal Script

This script intentionally has no `rscr` block. Patches are sticky — once injected they remain in the scriptorium for the lifetime of the world.

### Impact on Stimulus / Room CA

None. The Wolf Control panel is a developer/admin overlay. It does not write any stimuli, does not modify Room CA, and does not affect creatures or the ecosystem in any way. The patch's effect is restricted to the agent's own status read-out.
