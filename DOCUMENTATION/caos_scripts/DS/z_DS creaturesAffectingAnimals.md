# z_DS creaturesAffectingAnimals.cos — Make Objects/Animals Hittable

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/z_DS creaturesAffectingAnimals.cos`

## Overview

This script **creates no agents** — it installs a **wildcard behaviour** on all simple objects and animals (family 2, `2 0 0`) so that creatures can **hit** them and they react by bouncing. At install it scans every family-2 agent and, for any that the hand can already pick up, adds the "creature can hit" permission to its `bhvr`. It also installs a shared **hit** script that makes any such object recoil with a random velocity when struck. This lets creatures bat objects and animals around the world.

## Behaviour Installed (`2 0 0`)

| Event | Number | Description |
|---|---|---|
| Install (iscr) | — | For every pickupable family-2 agent, OR the "creature can hit" bit (8) into its `bhvr` |
| Hit | 3 | When hit, fling the object/animal with a random recoil velocity |

The install script (`iscr`) runs once over the existing population; the removal script (`rscr`) removes the hit script (`scrx 2 0 0 3`).

## Impact on Stimulus / Room CA

None. This script emits no creature stimuli and writes no Room CA. Its effect is on **interaction permissions and physics**: it makes pickupable family-2 objects/animals **hittable by creatures**, and gives them a bounce response when hit — broadening how creatures can play with the world's objects.
