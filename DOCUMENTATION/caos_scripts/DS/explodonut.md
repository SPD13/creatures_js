# explodonut.cos — The Explodonut Plant

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/explodonut.cos`

## Overview

This script creates the **Explodonut**, a self-perpetuating fruiting plant in the Norn Meso. Four **flowers** grow on the vines; each opens, produces a **nut**, and is replaced by a fresh flower (so the patch never runs out). A grown nut can be **eaten** (it's seed food) — or, if left alone, it **matures, falls, and explodes**, scattering shell **detritus** and an explosion effect. The plant declares four classifiers:

| Role | Classifier |
|---|---|
| Flower | 2 7 7 |
| Explodonut (nut) | 2 3 18 |
| Detritus (shell bits) | 2 10 56 |
| Explosion (FX) | 1 1 176 |

At install it places four flowers at fixed vine positions (left / middle-low / middle-high / right), each with a random base pose and a staggered start tick.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 7 7 | Explodonut Flower | `explodonut` | The flower that opens and grows a nut — see [detail](#agent-2-7-7-flower) |
| 2 3 18 | Explodonut (Nut) | `explodonut` | The edible/exploding nut — see [detail](#agent-2-3-18-explodonut-nut) |
| 2 10 56 | Detritus | `explodonut` | Shell fragments flung out by an explosion |
| 1 1 176 | Explosion | `explodonut` | The transient explosion animation |

## Agent 2 7 7: Flower

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Age → open the flower; once open and matured, grow a nut and reseed a new flower |

The timer first **opens** the flower (`openflower`), then after maturing runs **`makenut`**: it sucks in its petals, spawns an Explodonut nut (`2 3 18`) at its position, then creates a **replacement flower** (`2 7 7`) at the same vine slot (flag `ov74 = 1` "naturally grown") and `kill`s itself — a continuous bloom→nut→bloom cycle. The flower tracks its spawned nut in `ov16` so it doesn't grow a new one until the previous nut is gone.

## Agent 2 3 18: Explodonut (Nut)

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Mature the nut; once mature and not carried, **explode** |
| Pickup | 4 | When picked up, become mature/falling (gravity, pose) |
| Eat | 12 | Eaten: play `reat`, stim the eater **77 (ate seed)**, bite down and (after 2 bites) vanish |
| Collision | 6 | Landing sound |

The **maturenut** subroutine turns the nut into a pickable, gravity-affected food. The **explode** subroutine (after it has sat around uneaten) plays the `expd` sound, spawns the **explosion** effect (`1 1 176`) and flings out **8 detritus** shells (`2 10 56`) with random velocities, then kills the nut.

## Agents 2 10 56 / 1 1 176: Detritus & Explosion

| Agent | Event | Number | Description |
|---|---|---|---|
| Detritus 2 10 56 | Timer | 9 | Once settled, fade out and die |
| Detritus 2 10 56 | Collision | 6 | Impact sound (`smit`) |
| Explosion 1 1 176 | Timer | 9 | Play the explosion animation once, then die |

## Removal Script

```
rscr
enum 2 3 18 / 2 7 7 / 2 10 56 / 1 1 176
    kill targ
next
```

Kills the nuts, flowers, detritus and explosions.

## Impact on Stimulus / Room CA

**Stimuli:** eating an Explodonut stims the eater with **77 (ate seed)** — its only nutritional reward (it injects no chemical directly). No other stimuli are emitted.

**Room CA:** none — the Explodonut emits no smell CA and writes no CA values. Its effect on the world is the self-sustaining food supply (flowers continually regrow nuts) and the cosmetic explosion/detritus when a nut is left to go off.
