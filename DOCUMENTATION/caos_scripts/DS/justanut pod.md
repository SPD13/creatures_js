# justanut pod.cos — The Justanut (Nut) Pod

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/justanut pod.cos`

## Overview

This script creates the **Justanut Pod** (`2 23 5`), the nut-dispensing food pod — the "Nut Pod" that the [Empathic Vendor](empathic%20vendor.md) calls on to grow **starch** food. When pushed (and the area isn't already littered with nuts), it shakes its tree and spits out a **justanut** (`2 3 17`). Uneaten justanuts rot into **detritus** (`2 10 53`) that **fertilises the soil** — adding water and nutrients to the room's CA — closing a little nutrient cycle.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 23 5 | Justanut Pod | `justanut pod` | The nut tree/dispenser — see [detail](#agent-2-23-5-justanut-pod) |
| 2 3 17 | Justanut | `justanut pod` | The starch nut food — see [detail](#agent-2-3-17-justanut) |
| 2 10 53 | Justanut Detritus | `justanut pod` | The rotting nut that fertilises the soil — see [detail](#agent-2-10-53-justanut-detritus) |

## Agent 2 23 5: Justanut Pod

| Event | Number | Description |
|---|---|---|
| Push | 1 | Reward the pusher (stim 90) and, if fewer than 10 nuts are nearby, shake the tree and vend a justanut |

### Event 1 — Push

Stims the pusher with **90 (activate machinery)**, counts justanuts within range 300 (`esee 2 3 17`), and — only if fewer than 10 — animates the tree shaking and spawns a new justanut (`2 3 17`) at the dispenser mouth, emitting starch smell (`emit 7`). The nearby-nut cap stops the pod from flooding the area.

## Agent 2 3 17: Justanut

A small physics food object that emits the starch smell.

| Event | Number | Description |
|---|---|---|
| Eat | 12 | Eaten: play `reat`, stim the eater **77 (ate seed)**, and vanish |
| Collision | 6 | Landing sound |
| Pickup | 4 | Switch to the carried pose |
| Drop | 5 | Switch to the dropped pose |
| Timer | 9 | After ~5 ticks, if not carried, **rot** into detritus (`2 10 53`) and die |

## Agent 2 10 53: Justanut Detritus

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Play the rot animation, then **add to the room's CA** (water +0.3, nutrients +0.2) and die |

The detritus is where the ecological payoff happens: when a justanut is left to rot, it briefly appears and then fertilises the soil beneath it before vanishing.

## Removal Script

```
rscr
enum 2 23 5 / 2 3 17 / 2 10 53
    kill targ
next
scrx … (removes the pod, nut and detritus scripts)
```

Kills the pod, all justanuts and any detritus.

## Impact on Stimulus / Room CA

**Stimuli:** pushing the pod stims the creature with **90 (activate machinery)**; eating a justanut stims the eater with **77 (ate seed)**.

**Room CA:** justanuts continuously `emit` **CA 7 (starch smell)** so hungry creatures can find them. When a justanut rots, its detritus raises the room's **CA 3 (water, +0.3)** and **CA 4 (nutrients, +0.2)** via `prop`, fertilising the soil — a small self-sustaining nutrient loop.
