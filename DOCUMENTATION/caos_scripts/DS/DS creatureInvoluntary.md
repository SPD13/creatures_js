# DS creatureInvoluntary.cos — Creature Involuntary Actions

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creatureInvoluntary.cos`

## Overview

This script defines the **involuntary actions** of creatures (classifier `4 0 0`, with Grendel `4 2 0` and Ettin `4 3 0` variants for some) — reflexive reactions driven by the creature's biochemistry: being hurt, sneezing, coughing, shivering, sleeping, falling ill, drowning, and dying. It also includes the sleep "zzzz" timer (`1 2 28` event 9) and the general **bacteria-expel** script (`4 0 0 300`, fired by sneezing/coughing). It is the Docking Station counterpart of the Creatures 3 [creatureInvoluntary](../C3/creatureInvoluntary.md), with Docking-Station additions for the online warping system (clearing warp variables on death) and the bacteria disease system.

Each involuntary action sets a latency (`ltcy <type> <min> <max>`) so it can't re-fire immediately, plays an animation/sound, and stims the creature with the matching involuntary stimulus.

## Behaviour Scripts

| Event | Action [invol] | Species | Stim | Notes |
|---|---|---|---|---|
| 64 | Hurt by something [0] | 4 0 0, 4 2 0 | 28 | "ow" / Grendel slap sound |
| 65 | Lay egg [1] | — | — | Defined in [DS creatureBreeding](DS%20creatureBreeding.md) |
| 66 | Sneeze [2] | 4 0 0, 4 2 0 | 30 | Then expels bacteria (message 300) |
| 67 | Cough [3] | 4 0 0, 4 2 0, 4 3 0 | 31 | Then expels bacteria (message 300) |
| 68 | Shiver [4] | 4 0 0, 4 2 0, 4 3 0 | 32 | Cold reflex |
| 69 | Sleep [5] | 4 0 0 | 21, 33 | Sleep + create zzzz, dream loop |
| 70 | Ill / near-death [6] | 4 0 0, 4 2 0, 4 3 0 | 22 | Weak collapse + death-rattle sound |
| 71 | Drowning [7] | 4 0 0 | 35 | Create drowning bubbles when underwater |
| 72 | Die [8] | 4 0 0 | — | Full death sequence |
| 300 | Expel bacteria | 4 0 0 | — | Sneeze/cough ejects an attached bacterium |

### Event 69 — Sleep

Locks, drops what it's carrying, sleeps (`aslp 1`), and **creates the zzzz agent** (`new: simp 1 2 28 "zzzz" …`, owner in `ov00`). It then loops dreaming (`drea 1`), snoring (Grendel `gsnr`, else `zzzz`) and stimming SLEEP (33) until tiredness/sleep drives drop below 0.10, then wakes. (Mirrors the rest action in [DS creatureDecisions](DS%20creatureDecisions.md).)

### Event 71 — Drowning

When the creature is underwater (breathing locus `loci 1 1 4 9 = 0.0`), plays a bubble sound and **creates the drowning bubble** (`new: simp 1 2 41 "bubs" …`, owner in `ov00`) if one isn't already present. The bubble's own animation/cleanup is defined in [DS creatureBubbles](DS%20creatureBubbles.md). Stims DROWNING (35).

### Event 72 — Die

Locks first (so a fatal slap can't interrupt it). Releases from the hand (`nohh`), makes itself non-pickable/activatable (`attr 192`), poses dead, and **clears its warp variables** (`<moniker>_travel`, `<moniker>_quarantine` — Docking-Station online-warp state). It alters the room's water (CA 3) and nutrient (CA 4) by +0.5 (the body decomposing), plays the species death sound, waits (only after the creature is on-screen for selectable creatures), then creates the **death overlay** agent (`1 1 56`, `death_cloud` for Norns/Ettins or `death_sludge` for Grendels) and messages it (100).

### Event 300 — Expel bacteria

Counts the bacteria (`2 32 23`) attached to this creature; if any, picks one at random and tells it to expel itself (message 101) near the creature's head in the facing direction. This is how sneezing/coughing spreads infection.

## zzzz Timer (1 2 28)

The sleep-bubble timer (`scrp 1 2 28 9`): kills the bubble when the owner (`ov00`) wakes (`aslp 0`), dies, or goes unconscious; otherwise repositions it above the creature's head (tracking movement) and, on the first tick (`ov01 = 0`), starts the zzzz animation.

## Created Agents

| Classifier | Name | Sprite | Where |
|---|---|---|---|
| 1 2 28 | Sleep "zzzz" | `zzzz` | Sleep action (event 69) |
| 1 2 41 | Drowning bubbles | `bubs` | Drowning action (event 71) |
| 1 1 56 | Death overlay | `death_cloud` / `death_sludge` | Die action (event 72) |

## Impact on Stimulus / Room CA

- **Stimuli:** every involuntary action self-stims the creature (hurt 28, sneeze 30, cough 31, shiver 32, sleep 33/rest 21, ill 22, drowning 35) for biochemical feedback.
- **Room CA:** the die action (72) raises the room's **water (CA 3)** and **nutrient (CA 4)** by +0.5 as the body decomposes.
- It also drives bacterial spread (expelling `2 32 23` on sneeze/cough) and clears the dead creature's warp game variables.
