---
name: Space Toy
description: Bootstrap script that installs two Space Toy agents in the world. Space Toys are simple novelty toy agents that creatures can activate; when poked, the toy emits a sound, performs a launch animation, shoots upward with a random horizontal drift, and eventually fades out.
type: Bootstrap Installation Script
---

# Space Toy

## Overview

This bootstrap script installs the **Space Toy**, a simple decorative/novelty toy in the Creatures 3 world. It is registered as a creature-facing object (carryable, activatable toy) that responds to ACTIVATE 1 by launching upward with a playful animation and sound effect, before drifting sideways and fading out once its lifetime counter expires.

Two instances of the toy are placed in the world at fixed coordinates on installation. A companion removal script (`rscr`) is provided that cleans up all Space Toy agents in the world, allowing the bootstrap to be re-run cleanly.

## Created Agents

| Family | Genus | Species | Agent | High level function | Link |
|---|---|---|---|---|---|
| 2 | 21 | 9 | Space Toy | A carryable toy that launches upward with a sound/animation when activated, drifts horizontally with randomized velocity, then fades away. | [Details](#space-toy-2-21-9) |

## Space Toy (2 21 9)

A simple physical toy agent created from a single-part SIMP agent using the `spacetoy` sprite gallery. It is a creature-interactable toy (bhvr 35 = activate1 + activate2 + deactivate + push + pull, pickupable) placed at two fixed points in the world. When a creature activates it, the toy performs a launch behaviour: upward velocity, a brief rocketing animation, a sound effect, a randomized direction/lifetime, and then fades out.

### Agent Setup

- **Classifier:** family 2, genus 21, species 9
- **Type:** `simp` (single-part simple agent), sprite gallery `spacetoy`, 18 images, plane 4998
- **attr 199** — carryable, mouseable, activateable, suffers collisions, suffers physics (attr 1+2+4+16+64+128 = 199)
- **bhvr 35** — reacts to activate1 / deactivate / push (bhvr 1+2+32 = 35)
- **clac 0** — activate1 maps to script 1 (default)
- **elas 0 / fric 100 / perm 60** — non-bouncy, high friction, moderately permeable
- **Instances placed:** `(1500, 700)` and `(700, 1869)`
- **ov61 = 100** — presumed initial "charge" / intact-state flag for the toy

### Events

| Event | Number | Description | Behaviour |
|---|---|---|---|
| scrp | 1 | Activate 1 (first toy instance) | Triggers launch sequence: writes a stimulus to the activator creature, plays `st_1` sound, signs a strong urge against this action (urge sign 0.5 -1 0.0), runs launch animation frames 0–7, sets vertical velocity to -10 (upward), then yields via `over`. After yielding it sets random lifetime (ov99 = 30–60), picks a random horizontal direction (ov10 = +1 or -1), plays looping rocket animation with sound `st_2`, and sets a tick rate of 2 so the timer script runs frequently. |
| scrp | 9 | Timer | Executes once per tick (every 2 ticks due to `tick 2`). Computes a horizontal velocity component from ov10 scaled by a random 2–4 factor and applies `velo` with a small vertical jitter (-1 to +1). Decrements the lifetime counter ov99. When ov99 reaches ≤ 0, fades the agent out, plays the `st_3` sound, zeros vertical velocity, stops the ticker (`tick 0`), and plays the shutdown animation (reverse of launch frames). |
| scrp | 2 | Activate 1 (duplicate) | Identical behaviour to script 1. Present to cover both installed instances / alternate activation paths; body is the same launch sequence. |

### Stimulus & Environmental Impact

- **stim writ from 97 1** — sends stimulus 97 (strength 1) to the activator (FROM). Stimulus 97 is the designated stimulus for "toy activation" / novelty reinforcement, giving the creature a small learning signal when playing with the toy.
- **urge sign 0.5 -1 0.0** — applies a signed urge modifier to the creature's current action (strength 0.5, negative reinforcement -1, decay 0) to discourage immediate re-activation and encourage alternative behaviours.
- **Sounds:** `st_1` on activation (launch), `st_2` looping while airborne, `st_3` on shutdown/fade.
- **No Room CA changes.** The agent operates purely through physics (velocity) and creature stimulation.

### Removal Script

The bootstrap file ends with an `rscr` block that enumerates all agents of classifier `2 21 9` and kills them, enabling clean re-installation.
