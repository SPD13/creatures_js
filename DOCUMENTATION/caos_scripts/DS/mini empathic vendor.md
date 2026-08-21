# mini empathic vendor.cos — The Mini Empathic Vendor

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/mini empathic vendor.cos`

## Overview

This script creates the **Mini Empathic Vendor** (`2 23 9`), a compact version of the [Empathic Vendor](empathic%20vendor.md) that is placed **inside the containment chamber** (`1 1 154`) so a quarantined creature can be fed. Like its big sibling it has an "Ear" that listens to creature speech and dispenses the food the creature craves — Star Seed (`2 3 15`), Yarn Fruit (`2 8 6`) or Peaking Pie (`2 11 7`). The key difference is that when it's inside a vehicle (the chamber cabin), it `spas`-es the dispensed food **into that vehicle too**, so the food lands with the contained creature rather than falling out. It is simpler than the full vendor — it has no food-pod delegation and only vends when it can actually see the speaker.

(The three foods reuse the agent classes and behaviour defined by [empathic vendor](empathic%20vendor.md) — Star Seed = starch/CA 7, Yarn Fruit = protein/CA 6, Peaking Pie = fat/CA 8.)

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 23 9 | Mini Empathic Vendor | `mini_vendor` | The compact in-chamber food dispenser — see [detail](#agent-2-23-9-mini-empathic-vendor) |
| 2 3 15 | Star Seed | `ds empathic vendor` | Starch food (defined by [empathic vendor](empathic%20vendor.md)) |
| 2 8 6 | Yarn Fruit | `ds empathic vendor` | Protein food (defined by [empathic vendor](empathic%20vendor.md)) |
| 2 11 7 | Peaking Pie | `ds empathic vendor` | Fat food (defined by [empathic vendor](empathic%20vendor.md)) |

At install it tries to `spas` itself into the containment chamber (`1 1 154`); if there's no chamber it moves to a Workshop position instead.

## Agent 2 23 9: Mini Empathic Vendor

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | Reward the pusher (stim 90) and vend a random food |
| Pull | 2 | Same as push |
| Custom — Ear (heard speech) | 126 | A creature spoke nearby (`_p1_` sentence, `_p2_` speaker) → vend the food it craves, **if visible** |
| Custom — vend Star Seed | 1001 | Animate and spawn a Star Seed (`2 3 15`, emit 7) |
| Custom — vend Yarn Fruit | 1002 | Animate and spawn a Yarn Fruit (`2 8 6`, emit 6) |
| Custom — vend Peaking Pie | 1003 | Animate and spawn a Peaking Pie (`2 11 7`, emit 8) |

### Vending into the chamber

Each vend script checks whether the vendor is being carried by a **vehicle** (`carr`, `type … = 6`); if so it `spas`-es the new food into that same vehicle (the containment chamber cabin) so the food stays with the contained creature, otherwise it drops the food at its own position (`mvsf`).

### Event 126 — The Ear

With a hearing range of 1000, it only acts if it can **see** the speaker (`seee`). It scans the spoken sentence for the Protein / Starch / Fat hunger phrases (`Creature Drives` catalogue) and vends the matching food directly. Unlike the full vendor it never delegates to food pods — if it can't see the creature, it does nothing.

## Removal Script

```
rscr
enum 2 23 9 / 2 3 15 / 2 8 6 / 2 11 7
    kill targ
next
```

Kills the mini vendor and all dispensed food.

## Impact on Stimulus / Room CA

**Stimuli:** pushing/pulling stims the creature with **90 (activate machinery)**; the dispensed foods stim their eater (77/78/79) per the [empathic vendor](empathic%20vendor.md) food scripts.

**Room CA:** the dispensed foods `emit` their smell CAs — **6 (protein)**, **7 (starch)**, **8 (food)** — so the contained creature can smell them. The vendor itself writes no CA.
