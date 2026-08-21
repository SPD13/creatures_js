# starplant.cos - Star Plant Decoration

**Source**: `Assets/Bootstrap/001 World/starplant.cos`

## Overview

This script installs five decorative star plant agents (classifier `2 4 5`) in the world. Each starplant plays a one-shot blooming animation: on successive timer ticks its sprite pose advances from frame 0 up to frame 9 and then stops, leaving the plant in its fully-bloomed state. When a creature pushes (activates) a starplant, it delivers stimulus 62 (`IT IS A FLOWER`) to that creature as biochemical feedback.

Starplants are placed at random locations within `x = 1740–2740` at `y = 674`, scattered across the upper terrarium area. They participate in the ecosystem under the plant family (family 2, genus 4 — "plants/flora").

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 4 5 | Star Plant | `starplant` | Decorative blooming star plant, reacts to creature activation | [Detail](#star-plant-2-4-5) |

---

## Star Plant (2 4 5)

A static star plant that plays a one-time blooming animation driven by its timer script, ending at pose 9 and remaining fully bloomed. Creatures can push the plant to receive a flower stimulus. Five plants are spawned at bootstrap.

### Properties

| Property | Value | Notes |
|---|---|---|
| `simp` | 2 4 5 "starplant" 10 0 100 | Simple agent, 10 sprite frames, image base 0, plane 100 |
| `attr` | 192 | Suffer Collisions + Suffer Physics |
| `bhvr` | 1 | Creature can activate 1 (push) |
| `elas` | 0 | No bounce |
| `tick` | rand 20 80 | Randomized timer interval (20–80 ticks) to desynchronize blooming animations |
| Position | `mvto rand 1740 2740 674` | Random x in 1740–2740, fixed y at 674 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (push) | Creature pushes/activates the plant; delivers stimulus 62 to the activator |
| 9 | Timer | Advances the blooming animation (pose 0 → 9) |

#### Event 1 — Activate 1

When a creature activates (pushes) the starplant:
1. Targets the activating agent (`targ from`).
2. Sends **stimulus 62** (`IT IS A FLOWER`) with intensity 1 to the creature (`stim writ from 62 1`), satisfying the creature's drive to interact with flowers.

#### Event 9 — Timer (Bloom Animation)

Each timer fire advances the bloom:
1. If the current pose is less than 9 (`doif pose lt 9`), read the pose into `va00`, increment it by 1, and set the new pose (`pose va00`).
2. Once the pose reaches 9, the condition fails and the pose is no longer changed, leaving the plant in its fully-bloomed final frame.

Because each of the five plants has an independent randomized timer interval (20–80 ticks), they bloom asynchronously at their own rates.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the starplants:

1. Enumerates all starplants (`enum 2 4 5`) and kills each (`kill targ`).
2. Removes the Timer 9 script (`scrx 2 4 5 9`).

Note: the Activate 1 script (event 1) is not explicitly removed — only event 9 is stripped via `scrx`.

## Stimulus Summary

| Stimulus # | Context | Effect on Creature |
|---|---|---|
| 62 | Plant is pushed/activated (event 1) | Creature receives `IT IS A FLOWER` biochemical feedback |
