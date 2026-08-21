# umbilical_fix.cos — Capillata Umbilical Door Fix

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/umbilical_fix.cos`

## Overview

This is a **patch** for the **Capillata Umbilical** (`3 1 4` = C3-Starship side, `3 1 5` = Docking-Station side, created by [capillata umbilical](capillata%20umbilical.md)) — the link that warps creatures between the Creatures 3 Starship and Docking Station. The fix makes creatures **navigate the umbilical as a door rather than a lift**, so they path to it correctly. It **creates no new agents**; it re-categorises both umbilical agents (`bhvr 3`, `cato 2` = door) and replaces their push/pull scripts.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 3 1 4 | Capillata Umbilical (C3 side) | Modification | Set to door category; push/pull (events 1 & 2) replaced |
| 3 1 5 | Capillata Umbilical (DS side) | Modification | Set to door category; push/pull (events 1 & 2) replaced |

The destination positions are tracked via `game "CUdsDE"` / `game "CUc3DE"` (the destination energiser agents on each side).

## Behaviour

### Events 1 / 2 — Push / Pull (both sides, patched)

When activated (and not already busy, `name "status"`), the umbilical: plays sounds, stims the activator **75 (wait)**, lights up its electro-lift/energiser animations and the **destination energiser**, then warps creatures to the other side (`mvft`) — all touching creatures if the **pointer** triggered it (within range, `esee 4 0 0`), or just the activating creature otherwise (skipping dead/asleep/carried/held ones). Each warped creature is stimmed **95 (travelled through a door)**. If the pointer triggered it, the camera is moved (`meta`) to the destination metaroom. It then powers everything down and returns to idle.

## Removal Script

This patch only re-installs the umbilical scripts; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

**Stimuli:** activating the umbilical stims the activator **75 (wait)**, and each creature it warps across is stimmed **95 (travelled through a door)**. No Room CA is written. The key fix is the **`cato 2` door categorisation** plus `bhvr 3`, which lets creatures recognise and path to the umbilical as a door, so they can travel between the C3 Starship and Docking Station under their own steam.
