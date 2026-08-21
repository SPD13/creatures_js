# lift_patch.cos — Lift Large-Creature Fix

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/lift_patch.cos`

## Overview

This is a **patch** for the [navigator lift](nav%20lift.md) (`3 1 3`). It **creates no new agents**; it replaces the lift's **go-up** (event 1) and **go-down** (event 2) scripts so that a creature stepping into the lift is briefly **posed into a smaller pose** before it's taken aboard. This helps **larger creatures fit** into the lift cabin. The rest of the lift behaviour (calling, animating, travelling, stimming passengers) is unchanged from the original.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 3 1 3 | Navigator Lift | Modification | Travel scripts (events 1 & 2) replaced to pose creatures smaller when boarding |

## Behaviour

### Events 1 / 2 — Travel up / down (patched)

When the lift grabs a creature (either the specific summoner or, with `_p2_ = 1`, all eligible creatures standing in the cabin), it now first **`zomb`s the creature, sets it to pose 0 facing forward (`dirn 1`)**, waits a moment, then `spas`-es it into the cabin and un-zombifies it. Posing the creature small avoids large creatures clipping out of the lift. Everything else — closing the doors, animating the rockets/feet, gliding to the called level, stimming passengers, and dropping them — is identical to the [navigator lift](nav%20lift.md).

## Removal Script

This patch only re-installs the lift's travel scripts; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

Same as the [navigator lift](nav%20lift.md): a creature that summons a lift is stimmed **75 (wait)** or **0 (disappointment)**, and arriving passengers are stimmed **94 (travelled in a lift)**. No Room CA is written. The only change is cosmetic/physical — creatures are momentarily posed small so larger ones fit in the cabin.
