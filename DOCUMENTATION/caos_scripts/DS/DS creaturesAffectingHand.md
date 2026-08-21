# DS creaturesAffectingHand.cos — Hand Reactions to Creatures

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creaturesAffectingHand.cos`

## Overview

This script lets the player's **hand** (the pointer, classifier `2 1 1`) react when a creature acts on it — poking (activate 1 / 2) or hitting it. It makes the hand react-animate, but only when it isn't busy holding or wiring something. It is the Docking Station counterpart of the Creatures 3 [creaturesAffectingHand](../C3/creaturesAffectingHand.md).

It creates no agents; it sets the pointer's permissions and defines its react scripts.

## Installer

```
iscr
targ pntr
setv va00 bhvr
orrv va00 11        ** enable activate1 (1) + activate2 (2) + hit (8)
bhvr va00
```

The install script (`iscr`, run once) ORs bits `11` into the pointer's `bhvr`, so creatures are allowed to activate-1, activate-2 and hit the hand.

## Behaviour Scripts (2 1 1)

Each reaction plays only when the hand is **not** holding an agent (`held = null`), not hand-holding a creature (`hhld = null`), and not in agent-help mode (`pure = 0`) — so the hand returns to its holding pose afterwards rather than interrupting a carry.

| Event | Number | Reaction |
|---|---|---|
| Activate 1 | 1 | Poke animation `[0 22 22 23 23 23 22 22 0]` |
| Activate 2 | 2 | Poke animation `[0 20 20 21 21 21 20 20 0]` |
| Hit | 3 | Hit-reaction animation `[0 24 25 24 0]` |

## Impact on Stimulus / Room CA

None. The script only changes the pointer's permissions and plays reaction animations; it emits no stimuli and does not affect Room CA.
