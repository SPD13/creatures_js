# palmplant.cos - Animated Palm Plant Decoration

**Source**: `Assets/Bootstrap/001 World/palmplant.cos`

## Overview

This script installs five decorative palm plant agents (classifier `2 4 4`) at ground level in the world. The palms are static plants with a continuously looping sway animation: each palm slowly cycles its sprite pose from frame 0 up to frame 14, pauses at the top of the sway for 50 tick intervals, then cycles back down to frame 0 and repeats. When a creature pushes or activates a palm, it delivers stimulus 62 to that creature as tactile biochemical feedback.

Palms are placed randomly along the horizontal axis within the range x=1000–2200 at y=2030 (ground level). They participate in the ecosystem under the plant family (family 2, genus 4 — "plants/flora") and can serve as environmental props for creatures to interact with.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 4 4 | Palm Plant | `palmplant` | Decorative swaying palm plant, reacts to creature activation | [Detail](#palm-plant-2-4-4) |

---

## Palm Plant (2 4 4)

A static palm plant rooted at ground level that plays a continuous sway animation. It is a simple plant decoration that creatures can bump into or activate, producing a stimulus response. Five palms are spawned at bootstrap, scattered across x=1000–2200.

### Properties

| Property | Value | Notes |
|---|---|---|
| `simp` | 2 4 4 "palmplant" 15 0 140 | Simple agent, 15 sprite frames, image base 0, plane 140 |
| `attr` | 192 | Suffer Collisions + Suffer Physics |
| `bhvr` | 1 | Creature can activate 1 (push) |
| `elas` | 0 | No bounce |
| `tick` | rand 200 1000 | Randomized timer interval (200–1000 ticks) to desynchronize sway animations |
| Position | `mvto rand 1000 2200 2030` | Random x in 1000–2200, fixed y at 2030 (ground) |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Sway direction flag | 0 = animating up (pose 0→14), 1 = animating down (pose 14→0) |
| `ov99` | Hold counter at top of sway | Increments each tick while paused at pose 14; resets to 0 on cycle restart |
| `va00` | Temporary pose register | Used to read/increment/decrement the current pose |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (push) | Creature pushes/activates the palm; delivers stimulus 62 to the activator |
| 9 | Timer | Sway animation state machine (pose cycling) |

#### Event 1 — Activate 1

When a creature activates (pushes) the palm:
1. Targets the activating agent (`targ from`).
2. Sends **stimulus 62** with intensity 1 (`stim writ from 62 1`) to the creature, giving biochemical feedback for touching/pushing the plant.

#### Event 9 — Timer (Sway Animation)

Each timer fire advances the palm through its sway cycle:

**Sway Up Phase** (`ov00 = 0`):
1. If current pose < 14: increment pose by 1 (`va00 = pose + 1; pose va00`).
2. If current pose has reached 14 (top of sway): increment the hold counter (`ov99 += 1`) instead of advancing.
3. When hold counter reaches 50 (`ov99 = 50`): flip direction flag (`ov00 = 1`) to begin the descent.

**Sway Down Phase** (`ov00 = 1`):
1. If current pose > 0: decrement pose by 1 (`va00 = pose - 1; pose va00`).
2. When pose reaches 0 (bottom of sway): reset hold counter (`ov99 = 0`) and flip direction flag back to 0 (`ov00 = 0`), restarting the cycle.

The net effect is a smooth oscillating animation: 15 frames up, a 50-tick hold at the apex, 15 frames back down, looped indefinitely. The randomized `tick` interval (200–1000) means each of the five palms sways at its own independent rate.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the palm plant agents:

1. Enumerates all palm plants (`enum 2 4 4`) and kills each (`kill targ`).
2. Removes the Timer 9 script (`scrx 2 4 4 9`).

Note: the Activate 1 script (event 1) is not explicitly removed — only event 9 is stripped via `scrx`.

## Stimulus Summary

| Stimulus # | Context | Effect on Creature |
|---|---|---|
| 62 | Palm is pushed/activated (event 1) | Creature receives biochemical feedback for activating the plant |
