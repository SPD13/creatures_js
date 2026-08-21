# c3_incubator_recreator.cos — Docked C3 Incubator Fix

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/c3_incubator_recreator.cos`

## Overview

This script adapts the Creatures 3 **Heatpan Incubator** for Docking Station by **replacing its timer script** so it gates on the new population variables — `breeding_limit` / `total_population` — instead of C3's `c3_max_creatures` / `c3_max_norns`. When running as a **docked** world (`eame "engine_no_auxiliary_bootstrap_1" = 0`), it also kills and recreates the three incubator agents so the new behaviour takes effect (with a small risk that a half-hatched creature is spat out during the swap).

The C3 incubator itself is Creatures 3 content; here it is recreated (when docked) and its timer is re-pointed.

## Created / Modified Agents

| Classifier | Name | Type | Description |
|---|---|---|---|
| 2 22 1 | C3 Incubator (cabin) | Creation / Modification | The incubator vehicle (cabin) — recreated when docked, timer replaced |
| 2 22 2 | Incubator part | Creation | Recreated incubator sub-agent (docked only) |
| 2 22 3 | Incubator part | Creation | Recreated incubator sub-agent (docked only) |

### Recreation (docked only)

If docked, it kills any existing `2 22 1/2/3` and recreates them:

- `2 22 1` — a `hatch` **vehicle** with a cabin (`cabn 30 0 180 135`), placed at (451, 701), emitting heat (`emit 2 0.1`).
- `2 22 3` — a `hatch` simp at (401, 573).
- `2 22 2` — a `hatch` simp at (406, 601).

## Agent 2 22 1: Incubator Timer

### Event 9 — Timer

Skips if disabled (`ov99 = 1`). Otherwise it **drops all passengers** (`dpas`), counts the live creature population (`enum 4 0 0`, `dead = 0`), and compares it to `breeding_limit`. It then messages itself **3002** if the population is at/over the limit, or **3003** if under — switching the incubator between its "full" and "available" states. Re-arms with a random tick (10–30).

## Impact on Stimulus / Room CA

The recreated incubator emits **heat** (CA 2) into its room (`emit 2 0.1`). The timer logic itself only manages passengers and population state; it emits no creature stimuli.
