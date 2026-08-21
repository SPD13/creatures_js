# carrot pod.cos — Carrot Pod & Carrots

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/carrot pod.cos`

## Overview

This script implements the Docking Station **carrot** food system: a **pod** that ejects carrots when pushed, the **carrots** themselves (edible, and self-seeding into viable soil), and the **detritus** they rot into (returning nutrients to the room). It is part of the Norn Meso ecosystem.

It sets two population game variables:

| Variable | Value | Purpose |
|---|---|---|
| `Carrot_MaxPop_Local` | 20 | Max carrots allowed in a local area |
| `Carrot_LocalSphere` | 500 | Range used to count local carrots |

At install it creates the pod at (790, 9564) and scatters 15 initial carrots near it.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 23 4 | Carrot Pod | `ds carrot pod` | Machine that ejects carrots when pushed |
| 2 11 9 | Carrot | `carr` | Edible food item; grows, can be eaten, rots to detritus |
| 2 10 52 | Carrot Detritus | `carr` | Rotting carrot that returns nutrients to the soil, then dies |
| 1 1 152 | Dummy Carrot | `carr` | Short-lived visual carrot used in the pod's ejection animation |

## Agent 2 23 4: Carrot Pod

### Event 1 — Push (eject a carrot)

Stims the pusher (90), plays the plucker animation, spawns a **dummy carrot** (`1 1 152`) for the ejection visual (which is killed after a moment), then creates a real **carrot** (`2 11 9`) in front of the pod with physics, a random facing direction, the food smell (`emit 8 .5`), and a 1000-tick life.

## Agent 2 11 9: Carrot

State variable `ov00`: 0 = plucked/vended and edible, 1 = invisible growth mode (a seed), 2 = growing and visible.

| Event | Number | Description |
|---|---|---|
| Pickup | 4 | Pause growth |
| Timer | 9 | Rot into detritus (if dropped) or resolve seed growth (if seeding) |
| Custom | 1000 | Seed local-environment viability check |
| Drop | 5 | Set pose, or spew detritus |
| Collision | 6 | Landing sound |
| Eat | 12 | Eaten by a creature |

### Event 12 — Eat

Plays `ceat`, stims the eater with **79** (eaten-food) and injects **Sodium Thiosulphate** (chem 96, +0.05) into its bloodstream, then puts itself into invisible growth mode (so creatures can't keep eating the same carrot) on a fresh 1000-tick cycle.

### Event 1000 — Seed environment check

Reads room CA via `prop`: needs light (CA 1 > 0.3), heat (CA 2 > 0.3), water (CA 3 > 0.1) and nutrients (CA 4 > 0.1); the local carrot count (range `Carrot_LocalSphere`) must be below `Carrot_MaxPop_Local`; and the room type must be soil/grass/sand (5/6/7). If viable, it **consumes** water and nutrients (CA 3 and 4 each −0.1) and becomes a real carrot; the scattered initial carrots (`ov99 = 1`) skip the CA consumption once; otherwise the seed is killed.

## Agent 2 10 52: Carrot Detritus

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Animate rotting, **add nutrients/water to the room** (CA 3 +0.3, CA 4 +0.2), then die |

This closes the nutrient loop: uneaten carrots decompose and feed the soil.

## Removal Script

```
rscr
enum 2 23 4
    kill targ
next
enum 2 11 9
    kill targ
next
enum 2 10 52
    kill targ
next
scrx … (carrot/pod/detritus scripts)
```

Kills the pod, all carrots and detritus and removes their scripts.

## Impact on Stimulus / Room CA

- **Stimuli:** pushing the pod stims the creature with 90; eating a carrot gives **stim 79** (eaten-food).
- **Creature chemistry:** eating a carrot adds **Sodium Thiosulphate** (chem 96).
- **Room CA:** carrots emit the **food smell** (`emit 8`); growing seeds **consume** room water (CA 3) and nutrients (CA 4); rotting detritus **adds** water (+0.3) and nutrients (+0.2) back.
