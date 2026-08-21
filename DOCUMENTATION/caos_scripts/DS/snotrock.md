# snotrock.cos — The Snotrock

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/snotrock.cos`

## Overview

The **Snotrock** (`2 15 24`) is a small autonomous, creature-like organism that lives in the Mesa with its own simple **life cycle**: it grows up, wanders looking for food (tuba, `2 11 8`), eats to restore energy, reproduces when healthy, and eventually dies when its energy runs out. A hidden **Snotrock Pod** (`1 1 163`) acts as an anti-extinction safety net — if every snotrock dies, it grows two new ones. Creatures and the hand can poke/pick up snotrocks (they recoil and hide), but the snotrock is an ambient organism rather than a reward toy.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 15 24 | Snotrock | `snotrock` | The autonomous organism — see [detail](#agent-2-15-24-snotrock) |
| 1 1 163 | Snotrock Pod | `blnk` | Invisible anti-extinction respawner — see [detail](#agent-1-1-163-snotrock-pod) |

Two snotrocks are placed at install; each tracks state in `ov00` (0 growing, 1 adult, 2 seeking food, 3 approaching food, 4 birthing, 9 dying), age in `ov01`, energy in `ov02`, its food target in `ov16`, and facing/birth flags in `ov10`/`ov90`.

## Agent 2 15 24: Snotrock

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 / 2 | 1 / 2 | Hide (retract) when poked, unless dying |
| Hit | 3 | Get knocked along |
| Pickup | 4 | Hide (retract) |
| Collision | 6 | Turn around at left/right walls |
| Timer | 9 | The life-cycle state machine |
| Custom — turn around | 1000 | Play the turn animation and reverse direction |

### Event 9 — Life cycle

Each tick ages the snotrock and drains 1 energy, then advances its state:

- **Grow (0)** — animate through the growth poses until adult.
- **Adult (1)** — wait; if energy is high (> 80) and old enough (age > 100) and it hasn't bred, **erupt and have a baby**; if energy is low (< 50) or at random, go **looking for food**.
- **Seeking food (2)** — search within range 200 for an edible tuba (`2 11 8`, roughly level with it); if found, approach it, else walk in a straight line.
- **Approaching (3)** — walk toward the food target, turning if facing the wrong way, and **eat** when touching it.
- **Birthing (4)** — bounce, then spawn a baby snotrock (`2 15 24`) and mark itself as having bred.
- **Dying (9)** — when energy hits 0, animate the death sequence and `kill` itself.

The **eat** subroutine messages the tuba (`2 11 8`, event 12) and restores **+50 energy**; reproduction costs energy. The population is self-limiting (it won't breed past a small number).

## Agent 1 1 163: Snotrock Pod

| Event | Number | Description |
|---|---|---|
| Timer | 9 | If no snotrocks exist at all, grow two new ones |

A long-tick (~20 min) invisible watchdog that prevents the snotrock species from going extinct.

## Removal Script

```
rscr
enum 2 15 24 / 1 1 163
    kill targ
next
```

Kills all snotrocks and the pod.

## Impact on Stimulus / Room CA

None. The snotrock emits no creature stimuli and writes no Room CA. Its place in the ecology is as an autonomous organism that **eats tuba** (`2 11 8`, restoring its own energy) and reproduces — a self-sustaining bit of background life rather than something that rewards or affects creatures directly.
