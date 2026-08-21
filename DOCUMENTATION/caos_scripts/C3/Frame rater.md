# Frame Rater

**Source file:** `Assets/Bootstrap/001 World/Frame rater.cos`

## Overview

The Frame Rater is a developer/debug overlay agent that displays real-time performance information on screen. It shows the current game speed (PACE) and the total number of agents in the world. The overlay is hidden by default and toggled on or off with the **Ctrl+Shift+P** keyboard shortcut. When visible, it anchors itself to the bottom-left corner of the game window and updates every 10 ticks.

This is a utility agent intended for development and debugging purposes. It has no interaction with creatures or the ecosystem.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 2 201 | Frame Rater | On-screen performance overlay showing game pace and agent count | [Details](#agent-1-2-201-frame-rater) |

---

## Agent 1 2 201: Frame Rater

A compound agent using the `smalltextbox` sprite with a text display part. It is invisible to creatures and camera-shy, placed on a very high display plane (9999) so it always renders on top of everything else. It starts hidden off-screen at position (-1000, -1000) and listens for keyboard input events.

**Attributes:** 288 (Invisible to creatures + Camera shy)
**Plane:** 9999 (topmost)
**Input mask:** 1 (Key down events)

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Visibility toggle state: 0 = hidden, 1 = visible |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Periodic display update |
| Raw Key Down | 73 | Keyboard shortcut handler |
| Window Resized | 123 | Reposition on window resize |

### Event 9 - Timer

Updates the text display with current performance data. Builds a string containing:

1. **Game pace** (`pace`) with the last character trimmed (removes trailing newline/space from the string conversion).
2. **Total agent count** (`totl 0 0 0`) - the number of all agents in the world.

The resulting two-line string is written to the text part (part 1) of the compound agent.

This event only fires when the agent is visible (tick rate is set to 10 when shown, 0 when hidden).

### Event 73 - Raw Key Down

Handles the **Ctrl+Shift+P** toggle shortcut:

- Checks that the pressed key is `'P'` (`_p1_ = 'P'`).
- Checks that both Ctrl (key code 17) and Shift (key code 16) are held down.
- If currently hidden (`ov00 = 0`): activates the timer (tick 10), positions the agent at the bottom-left of the window (`0, wndh - hght`), and sets `ov00` to 1.
- If currently visible (`ov00 = 1`): stops the timer (tick 0), moves the agent off-screen (-1000, -1000), and sets `ov00` to 0.

Uses `lock` to ensure the entire toggle operation completes atomically.

### Event 123 - Window Resized

When the game window is resized and the overlay is visible (`ov00 = 1`), repositions the agent to remain anchored at the bottom-left of the window (`0, wndh - hght`).

### Removal Script

The removal script (`rscr`) cleans up all existing Frame Rater agents and removes their event scripts (9, 73, 123).

### Impact on Stimulus / Room CA

None. This is a pure UI/debug overlay with no effect on creatures, stimuli, or room chemical atmospheres.
