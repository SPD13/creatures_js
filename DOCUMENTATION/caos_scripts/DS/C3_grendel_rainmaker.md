# C3_grendel_rainmaker.cos - Docked Grendel Jungle Rain

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/C3_grendel_rainmaker.cos`

## Overview

When a Creatures 3 world is docked, the C3 **grendel rainmaker** (classifier `1 1 114`) is present but was stopped by [!kill duplicate Creatures 3 agents](!kill%20duplicate%20Creatures%203%20agents.md). This script injects a **replacement timer script** for it so the Grendel Jungle gets rain whose frequency is driven by the C3 **ET environment control** (classifier `3 3 56`).

It installs one event script — `scrp 1 1 114 9` (Timer). Each time it fires it recomputes its own tick interval from the environment-control water setting, re-arms the timer, and spawns a burst of falling water droplets over the jungle.

This modifies the C3 grendel rainmaker; the rainmaker agent itself is part of the Creatures 3 content. The droplets it spawns are the Norn-atmosphere rain agent (`2 19 2`, gallery `nornatmos`), which is defined elsewhere.

## Modified Agents

| Classifier | Name | Type | Description | Details |
|---|---|---|---|---|
| 1 1 114 | Grendel Rainmaker (C3) | Modification | Replaces its timer script with a docked, env-control-driven version | [Details](#agent-1-1-114-grendel-rainmaker) |

---

## Agent 1 1 114: Grendel Rainmaker

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Recompute rain frequency, re-arm timer, and spawn a rain burst |

### Event 9 — Timer

**1. Compute the tick interval from the environment control.** Starting from a baseline of 1800, it retargets the ET environment control (`3 3 56`) and reads its water setting from `ov03` (defaulting to 3 if the control is absent). The interval is reduced by `((water + 1)²) × 50`, so a higher water setting rains more often:

| Water setting | Resulting `tick` | Approx. interval |
|---|---|---|
| 0 | 1750 | just under 3 minutes |
| 1 | 1600 | 2 min 40 s |
| 2 | 1350 | 2 min 15 s |
| 3 | 1000 | 1 min 40 s |
| 4 | 1150* | ~1 minute |

(*The comment block lists these intended values; the formula is what actually runs.)

**2. Re-arm** the timer with the computed `tick`.

**3. Spawn rain.** A `reps rand 10 100` loop creates between 10 and 100 droplets:

```caos
new: simp 2 19 2 "nornatmos" 5 21 6999
attr 192          ** SufferCollisions + SufferPhysics
elas 0            ** no bounce
accg <0.3–0.7>    ** random gravity per droplet
mvto rand 366 2588 1505
perm rand 0 70
```

Each droplet is a physics object with a random gravity (0.3–0.7, chosen by a `rand 0 5` bucket), dropped at a random x (366–2588) near the top of the Grendel Jungle (y = 1505 in C3 world coordinates) with a random permeability (0–70) so it falls through floors of matching permeability. The droplets' own falling/landing behaviour is defined by the Norn-atmosphere rain agent type.

## Impact on Stimulus / Room CA

Indirect. This script does not write Room CA itself, but it continuously produces `2 19 2` water droplets over the Grendel Jungle; those droplets (per their own scripts) are what wet the environment. Rain frequency is coupled to the ET environment control's water setting.
