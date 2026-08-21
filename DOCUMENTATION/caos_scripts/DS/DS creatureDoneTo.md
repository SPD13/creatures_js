# DS creatureDoneTo.cos — Things Done To Creatures

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creatureDoneTo.cos`

## Overview

This script defines how a creature **reacts** when something is done to it (classifier `4 0 0`, events 0–7) — being slapped, tickled, hit, picked up, dropped, colliding with a wall, or bumped. It is the Docking Station counterpart of the Creatures 3 [creatureDoneTo](../C3/creatureDoneTo.md), with one Docking-Station-specific addition: picking a creature up clears its **immigration / quarantine** status (part of the online creature-warping/importing system).

It provides behaviour scripts on `4 0 0`; it creates no agents.

## Behaviour Scripts (4 0 0)

| Event | Done-to action | Behaviour |
|---|---|---|
| 0 | Slap / deactivate | Pointer-slap → stim 3 (POINTERSLAP), else creature-slap → stim 4; wake if asleep; "ow" sounds (Grendel laugh for genus 2); small chance to `like` the slapper |
| 1 | Tickle / activate 1 | Pointer-pat → stim 1, else creature-pat → stim 2; if tickled by the opposite sex stim 46, same sex stim 47; if not in pain/anger, turn to camera and giggle; chance to `like` |
| 2 | Activate 2 | Should never fire (the doing scripts send message 1); asserts as a safety net so BHVR doesn't error |
| 3 | Has been hit | Pointer-slap → stim 3 (creature-hit stim is applied by the hitter's script); wake; "ow" sounds; chance to `like` |
| 4 | Picked up | Unzombify + make the NORN (if from pointer); **clear immigration/quarantine state**; refresh the import chamber if touching it |
| 5 | Dropped | Refresh the import chamber if the creature is touching it |
| 6 | Collision with wall | Impact stims + bounce based on collision speed |
| 7 | Bump | If stationary, stim 0 (disappointment) to discourage |

### Event 4 — Picked up (immigration handling)

When picked up by the pointer the creature is unzombified (`zomb 0`) and set as the current Norn. Then, regardless of source, it clears its immigration markers: the `Pray Extra reject` / `Pray Extra foe` name variables, and the `<moniker>_immigrant` / `<moniker>_quarantine` game variables (`delg`). It scans the warning-icon agents (`1 2 46`) for one matching this moniker and tells them to shuffle (message 1000). Finally, if the creature is touching the import chamber (`1 1 154`), it messages the chamber's status display (`1 2 208`, message 1065) to refresh.

### Event 6 — Collision with wall

Computes a collision speed from the larger of `_p1_`/`_p2_` (÷50, capped at 10). On a hard landing (≥0.5): wakes the creature if asleep, and applies that many IMPACT stims (39) when the speed ≥ 1.0. It also gives a small upward bounce when the vertical component (`_p2_`) is significant.

## Impact on Stimulus / Room CA

A source of **creature stimuli** for social/physical interactions: POINTERSLAP/PAT (1/3), CREATURESLAP/PAT (2/4), opposite/same-sex tickle (46/47), IMPACT (39) and disappointment (0). It also clears immigration game variables and notifies the import chamber UI. It does not write Room CA.
