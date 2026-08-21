# Norn Egg layer.cos — Egg Layer Machine ("Muco")

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/Norn Egg layer.cos`

## Overview

This script builds the **egg layer** ("Muco") — the Workshop machine that lets the player pick an **egg variant** (from the PRAY `EGGS` agents) and a **sex**, then lay a Norn egg with that variant's genetics. It is the Docking Station counterpart of the Creatures 3 [Norn Egg layer](../C3/Norn%20Egg%20layer.md). The machine is built from three cooperating agents plus the eggs it produces.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 161 | Egg-Layer Infobar | `muco` | Text display showing the selected variant / status |
| 3 3 102 | Egg Layer (body) | `muco` | The animated "Muco" body that physically lays the egg |
| 3 3 103 | Egg Layer Display | `muco` / variant glyph | The control panel: variant selector, sex buttons, lay button |
| 3 4 1 | Norn Egg | `eggs` | The egg produced (life-cycle behaviour in [DS creatureBreeding](DS%20creatureBreeding.md)) |

## Agent 3 3 103: Display / Control Panel

Holds the selection state: `ov00` = sex to lay (1 = male, 2 = female), `ov90` = the current `EGGS` PRAY variant name, `ov91` = its genetics file. It shows the variant's egg glyph (male/female gallery from the PRAY tags) and the variant name (forwarded to the infobar `1 1 161`).

| Event | Number | Description |
|---|---|---|
| Custom | 1000 | **Change variant** — advance to the next `EGGS` PRAY resource and update the glyph |
| Custom | 1003 | **Male** button — set sex 1, show the male glyph |
| Custom | 1004 | **Female** button — set sex 2, show the female glyph |
| Custom | 1001 | **Lay** (green) button — tell the layer body to lay the egg |

When choosing a variant it resolves the genetics: a single "Genetics File", a "Mother Genetics File" only (→ virgin birth), or both mother+father (→ loads genome slots 9/10 and flags `ov91 = "crossing"` so the layer crosses them).

## Agent 3 3 102: Layer Body

| Event | Number | Description |
|---|---|---|
| Custom | 1000 | Lay an egg of the requested sex |
| Timer | 9 | Idle leg/snout animations + "muco" sounds |

### Event 1000 — Lay an egg

Refreshes PRAY, validates the chosen variant exists and its dependencies unpack (`pray deps`; buzzes on failure), plays the laying animation, then creates a **Norn egg** (`new: simp 3 4 1 "eggs"`) at the layer's mouth with a random base image. It applies the genetics — `gene load` for a normal/virgin birth, or `gene cros` (crossing genome slots 9/10 from the display) when `ov91 = "crossing"` — sets the egg's physics (`attr 195`, `bhvr 32`, gravity/friction/perm), emits the egg smell (`emit 11 0.65`), gives it a tiny launch velocity, and sets a 900-tick incubation and 100 bioenergy.

## Agent 3 4 1: Norn Egg (collision)

| Event | Number | Description |
|---|---|---|
| Collision | 6 | When not carried, set plane 5000 (draw correctly once expelled) |

## Removal Script

```
rscr
enum 3 3 102
    kill targ
next
enum 3 3 103
    kill targ
next
enum 1 1 161
    kill targ
next
scrx 3 4 1 6
```

Kills the three machine agents and removes the egg-collision script (eggs themselves persist).

## Impact on Stimulus / Room CA

The laid Norn egg emits the **egg smell** (`emit 11`) into Room CA. The machine UI itself emits no stimuli.
