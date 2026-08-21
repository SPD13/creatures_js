# bramboo.cos — Bramboo Plant

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/bramboo.cos`

## Overview

This script implements the **Bramboo** — a tall, procedurally-grown plant with a small genetic system covering cane height and petal/fruit colour. A Bramboo grows from a seed into a multi-section cane, crowns itself, flowers, fruits, scatters falling petals, and finally withers; its fruit can be eaten by creatures or fall and regrow into a new Bramboo, subject to a local-environment viability check. It is a Docking-Station ecosystem plant (its Norn Meso flora).

It sets three tuning game variables:

| Variable | Value | Purpose |
|---|---|---|
| `Bramboo_LocalSphere` | 350 | Range used to count local Bramboo population for seeds |
| `Bramboo_MaxPop_Local` | 8 | Max Bramboo allowed in a local area |
| `Bramboo_Genetic_RotnSwap` | 0 | Whether the genetic tint rotation/swap is expressed (0 = mutates but not shown) |

At install it creates 4 initial Bramboo canes near (950, 9605).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 4 13 | Bramboo Cane | `bramboo` | The growing plant: sections, crown, flowers, fruit |
| 2 8 8 | Bramboo Fruit / Berry | `bramboo` | Edible fruit; falls and can regrow into a new Bramboo |
| 2 7 6 | Bramboo Petal | `bramboo` | Short-lived falling petal particle |

## Genetics

Each cane carries genetic object variables that are inherited (averaged with a random parent) and mutated when seeds regrow:

| Var | Gene |
|---|---|
| ov40 | Cane height (1–40; `ov08` is the dynamic, space-adjusted working height) |
| ov41–ov43 / ov44–ov45 | Petal RGB / rotation+swap |
| ov46–ov48 / ov49–ov50 | Fruit RGB / rotation+swap |

## Agent 2 4 13: Bramboo Cane

### Event 9 — Timer (life cycle)

Drives the whole plant via subroutines, keyed off life stage `ov05`:

- **`growth`** — ages the plant through life stages 0–9 by tick count, posing/animating each.
- **`sectioncheck` / `sectionmaker`** — once grown, checks the **headroom above** (via `grap` samples) and either makes another trunk **section** (if ≥30 of 35 samples are clear) or stops growing taller (`ov08 = 1`).
- **`coronation`** — when finished growing, adds the **crown** part and advances to the mature stage (can flower).
- **`flowers_and_fruit`** — at maturity: places flower buds along the cane (tinted with the petal genes), opens them, then spawns a **fruit** (`2 8 8`) per flower (tinted with the fruit genes, emitting protein smell). After a while unpicked fruit are auto-dropped and the plant moves to withering.
- **`witherdown`** — repeals the crown and sections one by one (with sounds), **frightens nearby creatures** (raises fear drive 10 within range 350), and finally kills the cane. The last surviving Bramboo re-seeds 4 new canes from its genetics.

## Agent 2 8 8: Bramboo Fruit / Berry

| Event | Number | Description |
|---|---|---|
| Pickup | 4 | Set plane and route to windfall (1000) |
| Custom | 1000 | Windfall/pickup — drop with physics, shed petals (`2 7 6`), kill the parent flower |
| Eat | 12 | Eaten by a creature → `reat` sound, **stim 78** (eaten-food), die |
| Timer | 9 | Spawn petals; once dropped, age, rot, run the environment check, and possibly **regrow** into a new cane |
| Custom | 1001 | Seed local-environment viability check (see below) |
| Collision | 6 | Landing sound |

### Event 1001 — Seed environment check

Reads the room's CA via `prop`: it needs **light** (CA 1 > 0.1), **heat** (CA 2 > 0.2), **water** (CA 3 > 0.1) and **nutrients** (CA 4 > 0.3); it must not be touching another Bramboo cane or fruit; the local Bramboo count (range `Bramboo_LocalSphere`) must be below `Bramboo_MaxPop_Local`; and the room type must be soil/grass/sand (5/6/7). If all hold, it **consumes** some water and nutrients (`prop` CA 3 and 4 each −0.1) and flags `goodtogrow`; otherwise it slows its tick and eventually dies if it never finds a spot.

When good to grow, the fruit mutates its genes (height ±, and each colour gene nudged toward a random target) and spawns a fresh `2 4 13` cane in its place.

## Agent 2 7 6: Bramboo Petal

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Once fallen, fade out and die |

## Removal Script

```
rscr
enum 2 4 13
    kill targ
next
enum 2 8 8
    kill targ
next
enum 2 7 6
    kill targ
next
```

Kills all canes, fruit and petals.

## Impact on Stimulus / Room CA

- **Room CA:** Bramboo fruit emit the **protein smell** (`emit 6`); growing seeds **consume** room water (CA 3) and nutrients (CA 4); seed viability is gated on room light/heat/water/nutrients.
- **Stimuli:** eating a fruit gives the creature **stim 78** (eaten-food); a withering cane raises nearby creatures' **fear drive** (drive 10).
