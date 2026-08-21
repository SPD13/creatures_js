# tooltips.cos — The ToolTips System

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/tooltips.cos`

## Overview

This script creates the **ToolTips** agent (`1 1 193`), a small text bubble that floats by the pointer and shows a context-sensitive tip for whatever (non-creature) agent the mouse is hovering over. It looks the tip up from the `ToolTip` catalogue, keyed by the hovered agent's classifier (and optionally its part and pose), so third parties can supply tooltips for their own agents. It also includes a **developer mode** (toggled with **Ctrl+Shift+D**, `game "ToolTipDev"`) that displays the hovered agent's classifier / part / pose, making it easy to author new tooltip catalogue entries.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 193 | ToolTips | `tooltips` | Pointer-following tooltip bubble — see [detail](#agent-1-1-193-tooltips) |

## Agent 1 1 193: ToolTips

An invisible-until-needed `new: comp` agent that floats relative to the pointer (`frel pntr`) and ticks every 3.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Resolve and show/hide the tooltip for the hovered agent |
| Key Down | 73 | **Ctrl+Shift+D** toggles ToolTip developer mode |

### Event 9 — Resolve the tooltip

After a short hover delay (and only over a non-creature `hots` agent that is still hovered):

1. **Special cases:** a portal (`3 9 1`) shows a portal-specific tip; the HUD connect button (`1 2 14` part 8) shows an online/offline status tip.
2. **`name "tooltip"`** — if the hovered agent carries its own tooltip name-variable, show that.
3. **Catalogue lookup**, most-specific first: `ToolTip <fmly> <gnus> <spcs> <part> <pose>` → `… <part>` → `<fmly> <gnus> <spcs>`. The first matching catalogue entry's text is shown.
4. If nothing is found and **developer mode** is on, display the classifier/part/pose string (to help write a new tip); otherwise hide the bubble.

The `display` subroutine positions the bubble near the hand (nudging it away from the screen edges) and shows the text; `reset` clears and hides it.

## Removal Script

```
rscr
enum 1 1 193
    kill targ
next
```

Kills the ToolTips agent.

## Impact on Stimulus / Room CA

None. The ToolTips agent is a pointer-following UI helper that reads the hovered agent's classifier and displays catalogue text. It emits no creature stimuli and writes no Room CA.
