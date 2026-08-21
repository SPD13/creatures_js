# zzzz_CreatureHasBeenDropped.cos — Creature Drop → Chamber Interaction

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/zzzz_CreatureHasBeenDropped.cos`

## Overview

This script **creates no agents** — it installs a wildcard **creature Drop** behaviour (`4 0 0`, event 5) that makes **dropping a creature onto the containment chamber** interact with the Workshop Screen. When a creature is let go while touching the chamber (`1 1 154`), it tells the [Workshop Screen](workshop%20screen.md) (`1 2 208`) to either refresh its display (if the chamber is already closed) or **close the chamber** around the dropped creature. The logic was originally part of `DS creatureDoneTo.cos` and has been split out here (the `zzzz` prefix runs it last in the bootstrap).

## Behaviour Installed (`4 0 0`)

| Event | Number | Description |
|---|---|---|
| Drop | 5 | If the dropped creature is touching the containment chamber, refresh or close it via the Workshop Screen |

### Event 5 — Drop

On being dropped, the creature checks for the containment chamber (`1 1 154`); if it's touching it, it messages the Workshop Screen (`1 2 208`): **1065** (refresh) when the chamber is closed, or **1004** (close the chamber) otherwise — so dropping a creature into the open chamber seals it in.

## Impact on Stimulus / Room CA

None. This is a creature interaction behaviour. It emits no creature stimuli and writes no Room CA; its effect is to drive the containment chamber / Workshop Screen when a creature is dropped onto the chamber.
