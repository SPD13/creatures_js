# Toilet Control.cos - Ark Toilet

**Source**: `Assets/Bootstrap/001 World/Toilet Control.cos`

## Overview

This script creates a simple interactive toilet prop on the Ark. The toilet is a decorative/functional agent placed in the upper section of the ship (Norn terrarium area) that can be clicked by the player to toggle its lid open and closed. It has no direct impact on creatures, the environment, or Room CA values — it is purely a clickable world prop with a two-state animation (lid closed / lid open).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 11 | Toilet | `loo_` | Interactive toilet with a togglable lid | [Detail](#toilet-1-1-11) |

---

## Toilet (1 1 11)

A simple agent representing a toilet on the Ark. When the player clicks on it, the lid toggles between open and closed. The agent uses `ov00` to track the current lid state and `clac` to prevent rapid re-clicking during the toggle.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 6 | Mouseable (2) + Activateable (4) — player can click to activate |
| `clac` | 0 | Default click action (activate 1) |
| Sprite | `loo_` | 3 images (frame 0 = lid closed, frame 1 = lid open) |
| Plane | 9000 | Rendered in foreground |

### Initial Placement

| Instance | Position | Notes |
|---|---|---|
| 1 | (7300, 1000) | Upper area of the Ark (Norn terrarium region) |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | Lid state: 0 = closed, 1 = open |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Player clicks the toilet — toggles the lid open/closed |

---

#### Event 1 — Activate 1

When the player clicks the toilet:

1. Sets `clac -1` to temporarily disable further clicks during the toggle (prevents rapid re-activation).
2. Checks the current lid state (`ov00`):
   - **If closed (`ov00 = 0`)**: Sets `ov00` to 1 and changes to `pose 1` (lid open).
   - **If open (`ov00 = 1`)**: Sets `ov00` to 0 and changes to `pose 0` (lid closed).
3. Restores `clac 0` to re-enable clicking.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the toilet:

1. Kills all existing toilet agents (`enum 1 1 11 → kill targ`).
2. Removes script 1 for classifier 1 1 11 (`scrx 1 1 11 1`).

---

## Stimulus Summary

No stimuli are sent to creatures by this agent.

## Room CA Effects

This agent does not emit or modify any Room CA values.
