# object of attention indicator.cos - Object of Attention Indicator

**Source**: `Assets/Bootstrap/001 World/object of attention indicator.cos`

## Overview

This script creates a single marker agent that visually highlights the object the currently selected Norn is paying attention to (its "item of interest", as returned by the `IITT` command on the selected Norn). Every tick, the indicator reads the selected Norn's current `IITT` target, reads that target's position (top-edge Y via `POST`, left-edge X via `POSX`), and repositions itself slightly up and to the left of that object so it visually tags it on screen. When either no Norn is selected or the selected Norn has no object of attention, the indicator hides itself by switching to a blank pose.

The indicator is a purely visual UI gadget: invisible to clicks, excluded from creature perception, with no stimulus, no port wiring, and no effect on room CA.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 2 | Object of Attention Indicator | `attention` | Marker tag that follows the object the selected Norn is currently attending to | [Detail](#object-of-attention-indicator-1-2-2) |

---

## Object of Attention Indicator (1 2 2)

A simple (non-compound) agent created at bootstrap that polls every tick for the currently selected Norn (`NORN`) and that Norn's current object of attention (`IITT`). When both are present, the indicator repositions itself using absolute coordinates (via `mvto`) at offset `(-10, -20)` from the target object's top-left reference point and starts a looping animation. When either reference is missing, it hides by switching to pose 10.

### Properties

| Property | Value | Notes |
|---|---|---|
| Classifier | 1 2 2 | family 1, genus 2, species 2 |
| Sprite | `attention` | 11 images, plane 8300 (drawn above most of the world) |
| `attr` | 272 | Invisible (16) + Camera Shy (256) — not clickable and excluded from creature perception |
| `tick` | 1 | Timer fires every world tick |
| Initial position | (100, 100) | Overridden by `mvto` once a target object is resolved |
| Initial pose | 10 | Blank/hidden frame used when no target is selected |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | Animation latch — `0` = animation not yet started for the current target, `1` = animation already running (prevents restarting the animation on every tick) |
| `va00` | — | Scratch variable: target object's `POSX` minus 10 (final X position for the indicator) |
| `va01` | — | Scratch variable: target object's `POST` minus 20 (final Y position for the indicator) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Every tick, follows the selected Norn's object of attention and shows/hides the indicator |

---

#### Event 9 — Timer

Runs every world tick. Behaviour depends on whether a Norn is selected and whether that Norn currently has an object of attention:

**When a Norn is selected AND that Norn has an object of attention (`NORN ne null` AND `IITT ne null`):**
1. Targets the selected Norn (`targ norn`).
2. Targets that Norn's object of attention (`targ iitt`).
3. Reads the object's top-edge Y into `va01` (`va01 = post`).
4. Reads the object's left-edge X into `va00` (`va00 = posx`).
5. Subtracts 10 from `va00` and 20 from `va01` — offsetting the indicator slightly up and to the left of the target's top-left corner.
6. Retargets self (`targ ownr`) and moves to the computed absolute position via `mvto va00 va01`.
7. If `ov00 = 0` (animation not yet running for the current target):
   - Sets `ov00 = 1` to latch the state.
   - Starts the looping animation `[0 1 2 3 4 5 6 7 8 9 255]` — frames 0–9 played in sequence then looped (the trailing `255` is the CAOS animation-loop marker).

**When the selected Norn has no object of attention (`IITT eq null`):**
1. Retargets self (`targ ownr`).
2. Switches to pose 10 (the blank/hidden frame).
3. Resets `ov00 = 0` so the animation will restart the next time an object of attention is acquired.

**When no Norn is selected (`NORN eq null`):**
1. Targets self (`targ ownr`).
2. Switches to pose 10 (the blank/hidden frame).
3. Resets `ov00 = 0` so the animation will restart the next time a selection + object of attention is available.

The script ends with `slow` which yields execution back to the scheduler until the next timer tick.

Note: unlike the sibling *norn indicator* (1 2 1), this agent does **not** use `frel`/`flto` to attach to the tracked object. Instead it re-computes and applies an absolute `mvto` every tick. This means the indicator is a free-floating agent that merely mirrors the target's position each frame; if the target moves between ticks the indicator will briefly lag by one tick.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the object of attention indicator:

1. Enumerates all agents with classifier `1 2 2` and kills them.
2. Removes script 9 (Timer) for classifier 1 2 2.

---

## Stimulus Summary

This script does not send any stimuli.

## Room CA Effects

This script does not emit or modify any room CA.
