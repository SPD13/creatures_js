# z_creaturesAffectingAnimals.cos - Creatures Can Hit Simple Agents

**Source**: `Assets/Bootstrap/001 World/z_creaturesAffectingAnimals.cos`

## Overview

This script does not create any new agents. Instead, it retrofits **all existing family 2 (simple) agents** in the world so that creatures can physically hit them, and installs a generic global "hit by creature" response that launches the agent with a random impulse — producing the visual/tactile feedback of a creature punching or swatting animals, fruits, and other simple objects.

The script performs two actions at bootstrap:

1. **Behaviour patch** — iterates every existing family 2 agent; if the agent is mouseable (`attr` bit 2 set), it adds bit 8 to its `bhvr` flags. Bit 8 is the "creature can hit" behaviour, which allows creatures to select the `hit` action on the agent and triggers the event 3 (Hit by creature) script.
2. **Global hit-response script** — installs a `scrp 2 0 0 3` (event 3 "Hit by creature") that applies to **every** family 2 agent regardless of genus or species (0 0 wildcard). When a creature hits any such agent, it is knocked with a random horizontal velocity (`velx` in range −10..10) and a random upward velocity (`vely` in range −10..−1), simulating being struck.

Because this is installed at world bootstrap after all other agents have been created, it effectively acts as a post-install patch that standardises hit-interaction behaviour across the entire ecosystem. Agents that later install their own more specific event 3 script (by matching their own family/genus/species) will override this generic response.

## Created Agents

*None — this script only patches existing family 2 agents and installs a global event handler.*

## Modified Agents

| Classifier | Modification | Condition |
|---|---|---|
| 2 * * | `bhvr` bit 8 enabled (creature can hit) | Only if `attr` bit 2 (mouseable) is set |
| 2 0 0 (wildcard for all family 2) | Installs event 3 (Hit by creature) script | Always |

## Event 3 — Hit by Creature (Global, all family 2)

Triggered when a creature performs the `hit` action on any family 2 agent that has the `bhvr` hit bit enabled.

Behaviour:
1. `velx` ← random integer in range [−10, 10] — random horizontal knock direction and magnitude.
2. `vely` ← random integer in range [−10, −1] — always upward (negative y is up), giving a small "pop" into the air.

The agent is thus launched on a random ballistic arc. Gravity and friction (controlled by the agent's own `accg`, `fric`, `aero`, `elas` properties) will then take over and return it to rest.

### Impact on Stimulus and Room CA

None. This script only applies physical velocity changes; it does not emit stimuli, alter room CAs, send messages, or modify any game variables.

## Removal Script (rscr)

```
scrx 2 0 0 3
```

Removes only the installed global event 3 (Hit by creature) script for family 2. The `bhvr` flag modifications applied to individual agents at bootstrap are **not** reverted by removal — they persist on each agent until those agents are themselves destroyed or their `bhvr` is otherwise reset.
