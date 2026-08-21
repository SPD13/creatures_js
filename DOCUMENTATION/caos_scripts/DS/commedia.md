# commedia.cos — The Commedia (Imitating Toy)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/commedia.cos`

## Overview

The **Commedia** is a whimsical creature-toy/playmate. It lives in a **pod** (with a "trainer" that periodically shows it props); when released it wanders the world, and — inspired by a nearby creature — it **imitates** whatever object happens to be near it, taking on that object's appearance, before reverting to its true form when the creature leaves. Creatures (and the hand) can push/pull/hit/pick it up for fun.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 23 8 | Commedia Pod | `commedia` | The hut/stage the Commedia emerges from, with an animating trainer |
| 2 21 18 | Commedia | (varies) | The roaming toy that imitates nearby objects |
| 1 1 172 | Training Object | `commedia` | A prop (ball / ufo / cheese / rabbit) the trainer shows the Commedia |

## Agent 2 23 8: Commedia Pod

| Event | Number | Description |
|---|---|---|
| Activate | 1 | Release the Commedia (`2 21 18`) from the pod |
| Custom | 1000 | Receive the Commedia back into the hutch |
| Timer | 9 | Pod idle: occasionally the trainer "trains" the Commedia with a prop |

The trainer animation (event 9, `ov70` state machine) randomly spawns a **training object** (`1 1 172`) — a ball, ufo, cheese, or rabbit — and the Commedia mimics it, then both reset. The pod tracks the live Commedia in `name "MyCommedia"`.

## Agent 2 21 18: Commedia

State `ov00`: 0 = "moving and grooving", 1 = "imitating".

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Self-check, creature check, and wandering movement |
| Push / Pull / Hit / Pickup | 1 / 2 / 3 / 4 | Fling about and stim the player with **97** (fun) |
| Drop | 5 | If it isn't the pod's real Commedia, fade and die; else flag return to the pod |
| Collision | 6 | Landing sound |
| Deactivate | 0 | Darken tint, jump, then revert tint; stim 97 |

### Event 9 — Behaviour (subroutines)

- **`mycommedia`** — fades out and dies if it isn't the pod's registered Commedia (kills duplicates).
- **`creaturecheck`** — if a creature is within range 300 and it's idle → `inspiration`; if no creature and it's imitating → `bethyself`.
- **`moveit`** — random rest/move with obstacle avoidance (`obst` left/right), shuffling left/right.
- **`inspiration`** — looks (`star`) for a nearby non-creature, non-system, non-pickup object, captures its gallery/pose/base/pickup-points (special-casing the tuba), then `imitation`.
- **`imitation`** — recreates itself using the captured object's sprite/pose (tinted greenish) so it *looks like* that object; sets state imitating.
- **`bethyself`** — recreates itself in its true Commedia form.

## Removal Script

```
rscr
enum 2 23 8
    kill targ
next
enum 2 21 18
    kill targ
next
enum 1 1 172
    kill targ
next
```

Kills the pod, the Commedia and any training objects.

## Impact on Stimulus / Room CA

**Stimuli:** playing with the Commedia (push/pull/hit/pickup/deactivate) stims the interacting creature/player with **97** (a fun/play stimulus). It writes no Room CA.
