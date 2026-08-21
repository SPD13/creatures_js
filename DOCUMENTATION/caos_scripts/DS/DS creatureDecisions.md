# DS creatureDecisions.cos — Creature Voluntary Actions

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creatureDecisions.cos`

## Overview

This script defines the **voluntary action** repertoire for creatures (classifier `4 0 0`, events 16–29) — what a creature physically does when its brain decides on an action: approach, activate, eat, hit, retreat, rest, walk, etc. It is the Docking Station counterpart of the Creatures 3 [creatureDecisions](../C3/creatureDecisions.md) (based in turn on the C2 scripts). It does not create a new creature type; it provides behaviour scripts on `4 0 0`. It also spawns the sleep "zzzz" effect agent (`1 2 28`) during the rest action.

Each action typically: approaches the target (`appr`) and touches it (`touc`); checks the target's `bhvr` permission bits and `byit` (within reach); on success **stimulates the creature** with the matching involuntary stimulus (so it learns) and **messages the target agent** to perform the corresponding reaction; on failure plays a "disappointment" pose and stims itself with stimulus 0. Whether the self-stim drives learning depends on `sorq` (skip learning if a dedicated script will handle it).

## Behaviour Scripts (4 0 0)

| Event | Action | Target msg | Self-stim | Notes |
|---|---|---|---|---|
| 16 | Quiescent [0] | — | 12 (quiescent) | Idle fidget pose |
| 17 | Activate 1 [1] | 0 | 13 | Needs `bhvr & 1` |
| 18 | Activate 2 [2] | 1 | 14 | Needs `bhvr & 2` |
| 19 | Deactivate [3] | 2 | 15 | Needs `bhvr & 4` |
| 20 | Approach [4] | — | 0 if not reached | Walk toward IT |
| 21 | Retreat [5] | — | 17 (retreat) | Flee / pain-run / back-off, chosen by drives 10/0/9 |
| 22 | Pickup [6] | 4 | 18 (get) | Needs `bhvr & 32`; drops current item first |
| 23 | Drop [7] | 5 | 19 (drop) | Drops held item |
| 24 | Need [8] | — | 20 (express need) | Checks antigen 82–89 for illness; else poses the strongest drive and `sayn` |
| 25 | Rest [9] | — | 21 (rest), 22 (sleep) | If sleepiness (drive 7) high → sleep + spawn zzzz |
| 26 | West [10] | — | 23 (travelling) | `dirn 3`, `walk` |
| 27 | East [11] | — | 23 (travelling) | `dirn 2`, `walk` |
| 28 | Eat [12] | 4 then 12 | 26 (eat) | Needs `bhvr & 16`; picks up then eats |
| 29 | Hit [13] | 3 | 44 (aggression) | Needs `bhvr & 8` |

### Event 24 — Need (express need)

Scans antigen chemicals 82–89; if any exceeds 0.2 the creature is ill. Otherwise it finds its strongest drive (0–12) and, if that drive is significant (≥ 0.25), strikes a need-specific pose (e.g. hunger, cold, loneliness, etc.); finally it speaks its need (`sayn`) and stims itself with EXPRESSNEED (20).

### Event 25 — Rest / Sleep

If sleepiness (drive 7) > 0.6: locks, sets involuntary latency, drops what it's carrying, sleeps (`aslp 1`), and **creates the zzzz agent** (`new: simp 1 2 28 "zzzz" …`, storing the sleeper in `ov00`). It then loops dreaming (`drea 1`), playing a snore (`gsnr` for Grendels, else `zzzz`) and stimming SLEEP (22), until tiredness/sleep drives fall below 0.10, then wakes. If not very sleepy, it simply rests (stim 21) until the rest drive subsides.

## Created Agents

| Classifier | Name | Sprite | Where |
|---|---|---|---|
| 1 2 28 | Sleep "zzzz" effect | `zzzz` | Spawned in the Rest action (event 25) above a sleeping creature |

## Impact on Stimulus / Room CA

This script is a major source of **creature stimuli**: every action self-stimulates the creature with its corresponding involuntary stimulus (quiescent 12, activate 13/14/15, retreat 17, get 18, drop 19, need 20, rest 21, sleep 22, travelling 23, eat 26, aggression 44, disappointment 0) to drive chemical/learning feedback, and messages target agents to react. It does not write Room CA directly.
