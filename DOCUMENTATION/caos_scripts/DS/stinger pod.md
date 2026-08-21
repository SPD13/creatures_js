# stinger pod.cos — The Stingers (Pest Ecology)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/stinger pod.cos`

## Overview

This script creates the **Stinger** ecology — a swarming insect **pest**. At game-start the stingers live in a **Stinger Pod** hanging from the roof of the lower Mesa. Activating the pod releases a handful of stingers; ordinary **Worker** stingers do little, but **Queen** stingers fly off and found **wild nests** around the world, which in turn breed more stingers — an infestation that can only be controlled by slapping them and by hungry **trapper plants** (`2 5 5`). Stingers **sting** creatures and the hand, are **toxic if eaten**, and stim creatures with the "danger animal" feeling. A central **SFX source** plays the swarm buzz so dozens of stingers don't each play their own sound.

```
Stinger Pod        2 17 8
Stinger            2 14 8   (Workers and Queens)
Wild Stinger Nest  2 17 7
Dead Stinger       2 10 55  (referenced; dead stingers just fade in place)
```

`game "Stinger_MaxPop_Global"` caps the global population at 200.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 14 8 | Stinger | `rotorfly` | The flying insect (Worker or Queen) — see [detail](#agent-2-14-8-stinger) |
| 2 17 8 | Stinger Pod | `ds stinger pod` | The roof nest that releases stingers — see [detail](#agent-2-17-8-stinger-pod) |
| 2 17 7 | Wild Stinger Nest | `rotorfly` | A nest a Queen founds in the wild — see [detail](#agent-2-17-7-wild-stinger-nest) |
| 1 1 194 | SFX Source | `blnk` | Plays the swarm buzz while any stinger is on screen |

## Agent 2 14 8: Stinger

State `ov00`: 0 nest worker, 1 worker following queen, 2 worker seeking queen, 3 annoyed (attacking), 4 nesting queen, 5 dead. Each stinger has an age, an "annoyance memory", a remembered Queen and nest, and flies with smooth turning/obstacle avoidance.

### Events

| Event | Number | Description |
|---|---|---|
| Push / Pull | 1 / 2 | Hand-slap → die (tumble); creature → stim **88** and rouse nearby stingers to attack |
| Hit | 3 | Die; **reduce the attacker's Pain/Fear/Anger drives**; rouse others |
| Pickup | 4 | Promote a worker to free-roaming; stim the creature **88** |
| Drop | 5 | Tumble and fall |
| Eat | 12 | Inject a toxic cocktail into the eater, stim **88**, rouse others, die |
| Custom — pointer slap | 101 | Make the hand do a slapping animation |
| Timer | 9 | The flight/behaviour state machine |

### Event 9 — Behaviour

Ages (dying naturally at ~450), dies if it ends up underwater, and acts by state: nest workers fly within their nest boundaries; lost workers seek a Queen; workers follow their Queen; **annoyed** stingers chase their annoyer and **sting** it when within ~20 px; **Queens** wander looking for a nest site and, finding none on suitable ground (soil/grass/sand), **found a wild nest** (`2 17 7`). Stinging a creature stims it **88 (play danger animal)** and injects **geddonase (chem 69)**; stinging the hand flashes it red.

### Event 12 — Eaten (toxic)

A creature that eats a stinger gets a "nasty chemical cocktail": a chance of **heavy metals (chem 66)** plus **geddonase (chem 69)**, and a **88** stim — eating stingers is harmful.

## Agent 2 17 8: Stinger Pod

| Event | Number | Description |
|---|---|---|
| Activate | 1 | Release 5–10 stingers (one Queen + workers), opening the bay door |
| Timer | 9 | Top the pod's nest workers back up if too few remain |

## Agent 2 17 7: Wild Stinger Nest

A nest founded by a roaming Queen; it breeds workers and releases swarms when disturbed.

| Event | Number | Description |
|---|---|---|
| Push / Pull | 1 / 2 | Randomly take damage or release an angry swarm |
| Hit | 3 | Reduce the attacker's Pain/Fear/Anger drives; damage the nest, destroying it when worn down |
| Timer | 9 | Grow and breed workers; **die if a trapper plant (`2 5 5`) is nearby** |
| Mouse Down | 76 | Right-click releases a swarm |
| Custom — make worker | 1000 | Spawn a nest worker |
| Custom — release swarm | 1001 | Release 5–10 angry stingers at the annoyer |
| Custom — pointer slap | 101 | Hand slap animation |

Hitting or destroying a nest (and killing/eating stingers) **reduces the creature's Pain/Fear/Anger drives** — culling the infestation is rewarding. Trapper plants are the natural predator that wipes out nests.

## Agent 1 1 194: SFX Source

| Event | Number | Description |
|---|---|---|
| Timer | 9 | If any stinger is on screen, loop the swarm buzz; otherwise fade it out |

## Removal Script

```
rscr
enum 2 14 8 / 2 17 7 / 2 17 8 / 2 10 55 / 1 1 194
    kill targ
next
```

Kills all stingers, nests, the pod, dead stingers and the SFX source.

## Impact on Stimulus / Room CA

**Stimuli:** stingers stim creatures with **88 (play danger animal)** when touched, eaten, or stung.

**Creature chemistry (harmful):** a sting injects **geddonase (chem 69)**; **eating** a stinger injects **heavy metals (chem 66)** + **geddonase (chem 69)** — stingers are toxic. Conversely, **hitting/killing** a stinger or wild nest **reduces the attacker's Pain (driv 0), Fear (driv 10) and Anger (driv 12)** drives, rewarding the creature for dealing with the pest.

**Room CA:** none — the stingers write no CA. Their ecological role is as a self-spreading pest (Queens found wild nests) kept in check by the player's slapping and by trapper plants.
