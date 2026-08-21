# norn indicator.cos - Selected Norn Indicator

**Source**: `Assets/Bootstrap/001 World/norn indicator.cos`

## Overview

This script creates a single invisible-by-default marker agent that tracks the currently selected Norn (the "norn of interest" returned by the `NORN` command). While a Norn is selected, the indicator attaches itself at a small offset above the creature and plays a looping animation to visually highlight it on screen. When no Norn is selected, the indicator hides itself by switching to a blank static pose.

The indicator is purely a UI/feedback gadget: it has no physical interaction, no stimulus, no port wiring, and no effect on room CA. Its sole responsibility is to visually identify which Norn is currently the user's focus.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 1 | Norn Indicator | `indicator` | Floating marker that follows and highlights the currently selected Norn | [Detail](#norn-indicator-1-2-1) |

---

## Norn Indicator (1 2 1)

A simple (non-compound) agent created at bootstrap that continuously polls (every tick) for the currently selected Norn. When a Norn is selected it attaches to the creature via `frel`/`flto` at a fixed offset and plays a looping sprite animation. When the selection is lost it resets to a static, blank pose.

### Properties

| Property | Value | Notes |
|---|---|---|
| Classifier | 1 2 1 | family 1, genus 2, species 1 |
| Sprite | `indicator` | 11 images, plane 8300 (drawn above most of the world) |
| `attr` | 272 | Invisible (16) + Camera Shy (256) — not clickable and excluded from creature perception |
| `tick` | 1 | Timer fires every world tick |
| Initial position | (100, 100) | Overridden by `flto` once a Norn is selected |
| Initial pose | 10 | Blank/hidden frame used when no Norn is selected |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | Animation latch — `0` = animation not yet started this selection, `1` = animation already running (prevents restarting the animation on every tick) |
| `va00` | — | Scratch variable holding the currently selected Norn agent reference inside the timer script |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Every tick, follows the selected Norn and shows/hides the indicator |

---

#### Event 9 — Timer

Runs every world tick. Determines behavior based on whether a Norn is currently selected:

**When a Norn is selected (`NORN ne null`):**
1. Targets the selected Norn and stores it in `va00`.
2. Retargets self (`targ ownr`).
3. Attaches the indicator to the selected Norn using `frel va00` (follow relative).
4. Positions itself at offset (10, -20) relative to the Norn via `flto` — i.e. slightly to the right of and above the creature's origin.
5. If `ov00 = 0` (animation not yet running for this selection):
   - Sets `ov00 = 1` to latch the state.
   - Starts the looping animation `[0 1 2 3 4 5 6 7 8 9 255]` — frames 0–9 played in sequence then looped back to frame 0 (the trailing `255` is the CAOS animation-loop marker).

**When no Norn is selected (`NORN eq null`):**
1. Switches to pose 10 (the blank/hidden frame).
2. Resets `ov00 = 0` so that the animation will restart fresh the next time a Norn becomes selected.

Note: the `frel` relationship re-issued every tick is effectively idempotent — the indicator stays anchored to whichever Norn `NORN` currently returns, so selecting a different Norn seamlessly moves the indicator to the new target.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the norn indicator:

1. Enumerates all agents with classifier `1 2 1` and kills them.
2. Removes script 9 (Timer) for classifier 1 2 1.

---

## Stimulus Summary

This script does not send any stimuli.

## Room CA Effects

This script does not emit or modify any room CA.
