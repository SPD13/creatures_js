# pick-ups.cos - Scattered Collectible Pick-Up Items

**Source**: `Assets/Bootstrap/001 World/pick-ups.cos`

## Overview

This bootstrap script installs 14 collectible "pick-up" simple agents (classifier `2 24 4` — family 2 "plants/organic", genus 24, species 4) scattered across fixed positions throughout the world map. Each pick-up is a small carryable item displayed from the shared `pick-ups` sprite file, with a different image base selecting its visual variant. All pick-ups share the same physical behavior (gravity-affected, collidable, push-activatable) and a looping 8-frame idle animation.

The `ov01` script variable on each agent encodes the pick-up "type" (1, 2, 3, 4, 7, or 9), grouping the visual variants into logical categories. When a creature (family 4 genus 1) pushes a pick-up of types 1, 2, or 3, the pick-up sends a custom message `12345` to itself with parameters, which is the hook other scripts in the world use to react to creature interactions (e.g., consumption, carrying, or biochemical feedback).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 24 4 | Pick-up | `pick-ups` | Scattered collectible items of multiple visual variants, push-reactive to creatures | [Detail](#pick-up-2-24-4) |

---

## Pick-up (2 24 4)

Simple gravity-affected pick-up items placed at fixed locations around the world. Each instance is a visual variant of the shared `pick-ups` sprite (selected by image base) and carries a `type` tag in `ov01`. They loop an 8-frame idle animation indefinitely.

### Placement and Variants

Fourteen pick-ups are spawned at boot with the following image-base / `ov01` groupings:

| Variant | Image Base | `ov01` Type | Instances | Positions (`mvto` x y) |
|---|---|---|---|---|
| A | 8 | 1 | 4 | (2320, 2333), (6880, 500), (2820, 252), (2880, 3990) |
| B | 16 | 2 | 4 | (3800, 20), (1650, 2520), (4600, 440), (4380, 2200) |
| C | 43 | 3 | 4 | (5600, 933), (4933, 2390), (4800, 700), (4000, 1000) |
| D | 0 | 4 | 1 | (2860, 2024) |
| E | 35 | 7 | 1 | (2700, 1700) |
| F | 67 | 9 | 1 | (5930, 2330) |

### Properties

| Property | Value | Notes |
|---|---|---|
| `simp` | 2 24 4 "pick-ups" 8 \<base\> 6000 | Simple agent, 8-frame gallery, varying image base, plane 6000 |
| `attr` | 196 | SufferPhysics (128) + SufferCollisions (64) + Activatable (4) |
| `accg` | 4 | Affected by gravity |
| `perm` | 80 | Permeability (passes through walls of permeability ≤ 80) |
| `elas` | 10 | Low bounciness |
| `fric` | 80 | High friction |
| `clac` | 0 | Collision action: none special |
| `bhvr` | 1 | Creature interaction: Activate 1 (push) only |
| `anim` | [0 1 2 3 4 5 6 7 255] | 8-frame looping idle animation |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov01` | Pick-up type tag (1, 2, 3, 4, 7, or 9) — categorizes the visual variant |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (push) | If a creature pushed it, dispatch custom message 12345 back to itself |
| 2 | Activate 2 (pull) | Same as event 1 |
| 3 | Deactivate | Same as event 1 |

#### Events 1, 2, 3 — Creature Interaction

All three interaction scripts share identical behavior:

1. Target the activator (`targ from`).
2. If the activator is a creature (`fmly = 4 and gnus = 1`):
   - Retarget the pick-up itself (`targ ownr`).
   - Send custom message `12345` to the pick-up (`mesg wrt+ ownr 12345 40 5 0`) with parameters `40` and `5` and zero delay.
3. Restore targeting to the pick-up (`targ ownr`).

The message `12345` is a custom (non-system) identifier reserved for this agent family; handlers elsewhere in the world (or other bootstrap scripts) are expected to listen for it to implement the actual pick-up reaction (e.g., stimulus delivery, carrying, or consumption). Without a matching handler in the pick-up's own script set, the message has no direct local effect.

Non-creature activators (e.g., the hand pointer, other agents) trigger the script but produce no action beyond retargeting.

---

## Removal Script (rscr)

The removal script cleanly uninstalls pick-ups:

1. Enumerates all pick-ups (`enum 2 24 4`) and kills each (`kill targ`).
2. Removes the Activate 1 script (`scrx 2 24 4 1`).

Note: only event 1 is explicitly stripped via `scrx`; events 2 and 3 are not individually removed by this script.

## Stimulus Summary

This script does not directly deliver stimuli to creatures. Biochemical effects, if any, would be driven by whichever external handler reacts to message `12345`.
