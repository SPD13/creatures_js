# tuba.cos — The Tuba Plant

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/tuba.cos`

## Overview

The **Tuba** (`2 11 8`) is a self-seeding food plant that grows in the Mesa — the staple the [Snotrock](snotrock.md) eats and a food source for creatures. It has a full plant life cycle: floating **seeds** (`2 3 16`) land on fertile soil and grow into Tubas, which mature, **seed** themselves, and eventually die. A grown Tuba can be **picked** (turning into a portable fruit that leaves a leaf stub, `2 10 51`) and **eaten**. A hidden **Tuba Pod** (`1 1 162`) reseeds the species if it ever dies out. Seeds emit a seed smell and grown Tubas emit a food smell, so creatures can find them; the population is self-limiting by how many Tubas are already nearby.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 11 8 | Tuba | `tuba` | The food plant — see [detail](#agent-2-11-8-tuba) |
| 2 3 16 | Tuba Seed | `tuba` | The floating, edible seed — see [detail](#agent-2-3-16-tuba-seed) |
| 2 10 51 | Tuba Waste | `tuba` | The leaf stub left when a Tuba is picked |
| 1 1 162 | Tuba Pod | `blnk` | Invisible anti-extinction reseeder — see [detail](#agent-1-1-162-tuba-pod) |

## Agent 2 11 8: Tuba

State `ov00`: 0 growing, 1 adult, 2 seeding, 3 dying, 4 picked. Lifestage `ov05` controls edibility (only the adult stage can be eaten). `ov99` records large/small.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Grow → mature → seed → die life cycle (also handles the picked-fruit state) |
| Pickup | 4 | Become a portable fruit, leaving a leaf stub (`2 10 51`) behind |
| Eat | 12 | Eaten: stim the eater **79 (ate food)**, inject nutrient **chem 95**, maybe drop a seed, and vanish |
| Collision | 6 | Landing sound |

### Event 9 — Life cycle

It grows through poses to adult (becoming edible), ages, then **seeds** — spawning one or two Tuba seeds (`2 3 16`) depending on how crowded it is — and finally **dies** off. A picked Tuba, once put down, finishes its fruit animation and may drop a final seed before vanishing. Grown Tubas continuously `emit` the food smell.

## Agent 2 3 16: Tuba Seed

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Once settled, die unless on fertile soil; if the area isn't overcrowded, **grow into a Tuba** (large if isolated, small if crowded) |
| Eat | 12 | Eaten: stim the eater **77 (ate seed)** and vanish |
| Collision | 6 | Bounce/land animation |

Seeds only germinate on a soil/grass/sand floor and won't grow where five or more Tubas are already within range — keeping the patch from overrunning.

## Agent 1 1 162: Tuba Pod

| Event | Number | Description |
|---|---|---|
| Timer | 9 | If both Tubas and seeds have run out, scatter a couple of fresh seeds |

A long-tick invisible watchdog that prevents the Tuba from going extinct.

## Removal Script

```
rscr
enum 1 1 162 / 2 3 16 / 2 11 8 / 2 10 51
    kill targ
next
```

Kills the pod, seeds, Tubas and leaf stubs.

## Impact on Stimulus / Room CA

**Stimuli:** eating a Tuba seed stims the eater **77 (ate seed)**; eating a grown Tuba stims **79 (ate food)** and injects nutrient **chem 95**.

**Room CA:** Tuba seeds `emit` **CA 7 (seed/starch smell)** and grown Tubas `emit` **CA 8 (food smell)** so creatures (and snotrocks) can find them. Seeds read the **floor type** before germinating (soil/grass/sand only). The Tuba writes no CA values directly; its ecological role is a self-sustaining food crop.
