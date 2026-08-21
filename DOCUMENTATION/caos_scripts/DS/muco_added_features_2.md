# muco_added_features_2.cos — Egg Layer Extra Features

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/muco_added_features_2.cos`

## Overview

This is a **patch** that adds features to the **Norn Egg Layer** ("Muco", `3 3 103`, created by [Norn Egg layer](Norn%20Egg%20layer.md)) — the device that lets the player choose a breed and lay an egg. It creates a small invisible **controller** (`1 1 301`) parked over the egg layer that adds:

- **Right-click to select the *previous* breed** in the egg list (the original only cycled forward on left-click).
- A **"random gender" button** that overlays the male and female egg glyphs so the chosen breed lays a random-gender egg.

## Created / Augmented Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 1 1 301 | Egg Layer Augmenter | Creation | Invisible controller adding right-click-previous and the random-gender button — see [detail](#agent-1-1-301-augmenter) |
| 3 3 103 | Norn Egg Layer | Modification | Gains the right-click-previous and random-gender behaviours (driven externally by `1 1 301`) |

## Agent 1 1 301: Augmenter

An invisible `new: comp` agent listening for mouse-downs (`imsk 8`), with a random-gender button (part 1).

### Events

| Event | Number | Description |
|---|---|---|
| Custom — random gender | 1000 | Toggle the random-gender overlay on the egg layer |
| Mouse Down | 76 | Within the egg-layer button area, advance (left-click) or **rewind (right-click)** the breed selection and refresh the display |

### Event 76 — Click / right-click

If the click falls in the egg layer's breed-button region, it drives the egg layer (`3 3 103`): a **left-click** advances to the next breed (message 1000); a **right-click** (`_p1_ = 2`) steps the PRAY `EGGS` index **back** (`pray prev "EGGS"`) before advancing, netting the previous breed. The `display` subroutines read the egg's `Egg Glyph File`/`Egg Gallery` PRAY tags to show the male/female sprites (overlaying both when random-gender is on). Clicking elsewhere de-selects the random-gender button.

## Removal Script

```
rscr
enum 1 1 301
    kill targ
next
```

Kills the augmenter.

## Impact on Stimulus / Room CA

None. This is a UI augmentation of the egg-laying device. It emits no creature stimuli and writes no Room CA. Its effect is to give the player more control over which breed (and now random gender) of egg the [Norn Egg Layer](Norn%20Egg%20layer.md) produces.
