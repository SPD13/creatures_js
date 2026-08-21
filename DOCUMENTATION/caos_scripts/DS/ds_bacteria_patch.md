# ds_bacteria_patch.cos — Bacteria Reproduction Patch

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/ds_bacteria_patch.cos`

## Overview

This is a **patch** that fixes the **bacteria** (`2 32 23`, created by [DS bacteria](DS%20bacteria.md)). It **creates no new agent classes** — it modifies the existing bacteria in two ways:

1. **On install**, it re-rolls the toxin genes (`ov16`/`ov18`) of every existing bacterium so that **none emit the "ATP decoupler" toxin** (toxin number 78) — a fix for an overly-harmful toxin.
2. It **replaces the bacteria duplicate/copy script** (`2 32 23`, event 100) with a corrected version that handles reproduction, copies the genetic data to the child, applies mutation, and — crucially — re-rolls any toxin roll that lands on 78 so children also never carry the ATP decoupler.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 2 32 23 | Bacteria | Modification | Toxin genes sanitised; the reproduction script (event 100) is replaced |

## Behaviour

### Install — toxin sanitisation

Enumerates all bacteria and, for each, re-rolls `ov16` and `ov18` (its two toxin genes) within 70–81 until they are not 78, removing the ATP decoupler from the live population.

### Event 100 — Duplicate (reproduce)

When a bacterium copies itself it spawns a new `2 32 23`, copies across its genetic data and constants, resets the child's state, and then **mutates** with a 1-in-3 chance — varying one of: life force, reproductive age, infect/uninfect levels, antigen, or the two toxins and their amounts. Toxin mutations (`ov16`, and the rarer `ov18`) always **re-roll away from 78**. It also boosts life force if the global bacteria count is running low, positions and launches the child (handling the "sneezed out" case with a directional velocity), and counts the new offspring.

Genes governed: `ov10/ov11` life force, `ov12` reproductive age, `ov13` uninfect level, `ov14` infect level, `ov15` antigen, `ov16/ov17` toxin 1 + amount, `ov18/ov19` toxin 2 + amount.

## Removal Script

This patch installs only scripts on the existing bacteria class and has no agents of its own to remove.

## Impact on Stimulus / Room CA

No stimuli or Room CA are written by the patch. Its effect is on **bacterial genetics and the toxins they carry** — the bacteria infect creatures and inject their toxin chemicals, and this patch ensures no bacterium (existing or newly bred) emits the ATP-decoupler toxin (78), while preserving the mutation that keeps the bacterial population genetically varied.
