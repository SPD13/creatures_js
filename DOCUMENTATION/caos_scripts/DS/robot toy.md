# robot toy.cos — The Robot Toy

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/robot toy.cos`

## Overview

The **Robot Toy** (`2 21 20`) is a wind-up robot playmate in the Norn Meso. When a creature or the hand activates, hits or picks it up, it stims the player with **97 (fun/play)** and trundles off — walking, jumping or turning around. It tracks which way it's facing (`ov10`, −1 left / +1 right) and animates accordingly. It's a pure entertainment object to keep bored norns amused.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 21 20 | Robot Toy | `robot_toy` | The wind-up walking/jumping robot — see [detail](#agent-2-21-20-robot-toy) |

## Agent 2 21 20: Robot Toy

A physics object (`bhvr 43` = activate1/activate2/hit/pickup enabled) that starts facing a random direction.

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Stim **97**, then trigger a **jump** behaviour |
| Activate 2 | 2 | Stim **97**, then trigger a **walk** behaviour |
| Hit | 3 | Stim **97**, play a robot sound and recoil animation |
| Pickup | 4 | Stim **97**, set the carried pose |
| Drop | 6 | Landing sound, set the dropped pose |
| Custom — working | 1000 | Move the robot: jump (`_p1_=1`) or walk (`_p1_=2`), occasionally turning |

### Event 1000 — Movement

Picks randomly between turning and moving. The **turn** subroutine plays the turn animation and flips `ov10`. The **walk** and **jump** subroutines play the left- or right-facing animation (per `ov10`), set a horizontal velocity, and launch the robot across the floor — walking gently or jumping higher.

## Removal Script

```
rscr
enum 2 21 20
    kill targ
next
```

Kills the robot toy.

## Impact on Stimulus / Room CA

**Stimuli:** every interaction (activate/hit/pickup) stims the player with **97 (fun/play)** — its sole purpose is entertainment. It emits no other stimuli and writes no Room CA; the rest of its behaviour is locomotion (walking/jumping) and sound.
