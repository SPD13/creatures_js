# import_dialog_patch.cos — Import Dialog Face Fix

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/import_dialog_patch.cos`

## Overview

This is a small **patch** that fixes a display bug in the **Import Dialog** (`1 2 32`, created by [ds gui - creaturemenu](ds%20gui%20-%20creaturemenu.md)) — the creature's **head/face would sometimes render incorrectly** in the import preview. It **creates no agents**; it replaces the dialog's "show current import candidate" event (`1 2 32`, event 1004) with a corrected version.

The fix derives the head's **genus and breed variant from the creature's `Head Gallery` PRAY tag** (parsing the gallery filename's breed letter) instead of relying on the separately-stored `Genus` tag, so the `gall limb` head sprite always matches the actual creature.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 1 2 32 | Import Dialog | Modification | Event 1004 (show candidate) replaced to compute the head sprite correctly |

## Behaviour

### Event 1004 — Show candidate (patched)

For the currently-selected exported creature it reads the `Head Gallery` tag (e.g. `a00a`), extracts the **genus** from the gallery's genus digit (adjusting for grendel/ettin/geat ranges) and the **breed variant** from the trailing breed letter, then draws the head via `gall limb 0 <genus> <gender> <age> <variant> 9`. It then fills in the candidate's name, origin world, export time, life stage and age from the PRAY tags (unchanged from the original dialog).

## Removal Script

This patch only re-installs the dialog's event script; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

None. This is a UI bug fix for the creature-import preview. It emits no creature stimuli and writes no Room CA.
