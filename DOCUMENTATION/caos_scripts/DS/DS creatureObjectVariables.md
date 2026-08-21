# DS creatureObjectVariables.cos — Creature Object Variable Reservations

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creatureObjectVariables.cos`

## Overview

This file contains **no executable code** — it is a comment block that documents (reserves) the creature object variables used as cross-script signals, so other creature scripts don't reuse those slots for conflicting purposes. It is the Docking Station counterpart of the Creatures 3 [creatureObjectVariables](../C3/creatureObjectVariables.md).

It creates no agents, sets no game variables, and defines no event scripts.

## Reserved Creature Object Variables

| Variable | Purpose |
|---|---|
| `ov53` | Signal for the hatchery — set during hatching to tell the hatchery agent it may pick up the egg (see [DS creatureBreeding](DS%20creatureBreeding.md), event 3 4 0 1000) |
| `ov81` | Signal to make the body decompose — used by the death sequence (see [DS creatureInvoluntary](DS%20creatureInvoluntary.md), the die action) |

## Impact on Stimulus / Room CA

None. This is a documentation-only file.
