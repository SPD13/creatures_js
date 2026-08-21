# trapper.cos — The Trapper Plant

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/trapper.cos`

## Overview

The **Trapper** (`2 5 5`) is a carnivorous plant that is the natural predator of the [Stingers](stinger%20pod.md) — it catches and eats the insect pests (`2 14 x`), keeping their infestation in check. It has a full plant life cycle: it grows from a seed, opens its mouth when hungry, **eats touching insects** for energy, **flowers**, and then disperses floating **seeds** (`2 3 12`). The seeds are environment-aware — they only germinate into a new Trapper where the soil, warmth, light, nutrients and water are right — so the Trapper population self-regulates and ties into the room's CA. A population governed by global/local caps stops them from over- or under-running the world.

Population game variables: `Trapper_MaxPop_Global` (100), `Trapper_MinPop_Global` (5), `Trapper_MaxPop_Local` (10), `Trapper_LocalSphere` (500).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 5 5 | Trapper Plant | `trapper` | The carnivorous, insect-eating plant — see [detail](#agent-2-5-5-trapper-plant) |
| 2 3 12 | Trapper Seed | `trapper` | The floating, environment-checking seed — see [detail](#agent-2-3-12-trapper-seed) |

Four trappers are placed at install. Each tracks state in `ov00` (0 closed/hungry, 1 open/hungry, 2 flowering, 3 seeding, 4 dormant), lifestage in `ov05`, age in `ov01`, and energy in `ov02`.

## Agent 2 5 5: Trapper Plant

| Event | Number | Description |
|---|---|---|
| Timer | 9 | The growth/feed/flower/seed/death life-cycle state machine |
| Custom — growth | 1001 | Advance the lifestage poses up to adulthood |
| Custom — hunger check | 1002 | If low on energy, open the mouth (hungry); else flower |

### Event 9 — Life cycle

After growing to adult, an adult Trapper:

- **Hungry, mouth open (state 1):** detects a touching insect (`etch 2 14 0`), **kills and eats it** (chewing animation and sounds), gaining **+0.15 energy**; then re-checks hunger.
- **Flowering (state 2):** blooms once enough energy is stored.
- **Seeding (state 3):** if the global/local Trapper population isn't exceeded, spawns several floating **seeds** (`2 3 12`), spending energy.
- **Dormant (state 4):** waits, then either resets (if the population is low) or **dies, returning its stored energy as nutrients to the room** (`altr -1 4 ov02`).

A starving old Trapper dies the same way, fertilising the soil beneath it.

## Agent 2 3 12: Trapper Seed

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Age, fall, periodically check the local environment; grow into a Trapper if suitable, or die (fertilising the soil) |
| Collision | 6 | Landing sound |
| Custom — environment check | 1000 | Test the local room's suitability for a new Trapper |

### Event 1000 — Environment check

The seed reads its room's CA and only germinates where conditions suit a Trapper: a fertile floor type (soil/grass/sand), **temperature** (CA 2 > 0.3), **light** (CA 1 > 0.1), **nutrients** (CA 4 > 0.4) and **water** (CA 3 > 0.3). If it passes (and no Trapper is already touching), it consumes a little **water and nutrients** from the room and grows a new Trapper; otherwise it returns to dormancy. A seed that dies of old age adds nutrients back to the room.

## Removal Script

```
rscr
enum 2 5 5 / 2 3 12
    kill targ
next
scrx … (removes the trapper and seed scripts)
```

Kills all trappers and seeds.

## Impact on Stimulus / Room CA

No creature stimuli are emitted. The Trapper's ecological roles are:

- **Pest control:** it eats Stinger insects (`2 14 x`), the counterpart to the [stinger ecology](stinger%20pod.md) (whose wild nests die when a Trapper is near).
- **Room CA:** it both **reads** CA (seeds check temperature/light/nutrients/water before germinating) and **writes** CA — growing seeds draw down **water (CA 3)** and **nutrients (CA 4)**, while dying Trappers and seeds **return nutrients (CA 4)** to the soil — a self-regulating nutrient cycle.
