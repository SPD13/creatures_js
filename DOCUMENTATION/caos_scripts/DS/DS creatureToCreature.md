# DS creatureToCreature.cos — Creature-on-Creature Actions

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creatureToCreature.cos`

## Overview

This script defines the "special override" scripts a creature runs when acting **on another creature** (classifier `4 0 0`, events 32+). These override the generic decision scripts so creature-vs-creature interactions behave appropriately. The mating overrides (events 33/34) live in [DS creatureBreeding](DS%20creatureBreeding.md); this file covers the quiescent override and the creature-on-creature **hit**. It is the Docking Station counterpart of the Creatures 3 [creatureToCreature](../C3/creatureToCreature.md).

It provides behaviour scripts on `4 0 0`; it creates no agents.

## Behaviour Scripts (4 0 0)

| Event | Action | Description |
|---|---|---|
| 32 | Intro quiescent [0] | Loops idle fidget poses, self-stimming quiescent (12) — used when "introducing" to another creature |
| 45 | Hit [13] | Hit another creature, with life-stage-scaled damage |

### Event 45 — Hit another creature

Approaches and touches the target; on failure or if the target is dead, stims disappointment (0) and stops. Otherwise:

1. Wakes the target (stop dreaming via `drea 0`, else `aslp 0`) and makes it stop holding hands (`nohh`).
2. Plays the punch animation and species sound (`spnk`, or Grendel `punc`).
3. Self-stims **AGGRESSION (44)** and messages the target "I've been hit" (message 3).
4. **Damage scaling by life stage** (`cage`): Baby 0.0, Child 0.25, Adolescent 0.5, Youth 0.75, Adult 1.0, Old 0.5, Senile 0.0 — then `+1.0` (the base value).
5. **Same-species penalty:** if attacker and target share a genus, the strength is multiplied by 0.25.
6. If the resulting strength is non-zero, applies the **creature-slap stim (4)** to the target at that strength.

## Impact on Stimulus / Room CA

A source of **creature stimuli** for aggression: the attacker self-stims AGGRESSION (44) and applies a life-stage-scaled creature-slap (4) to the victim (plus disappointment (0) on failure). No Room CA effect.
