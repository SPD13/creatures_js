# hlm_nerf.cos — Holistic Learning Machine Nerf

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/hlm_nerf.cos`

## Overview

This is a **patch** that "nerfs" the [Holistic Learning Machine](holistic%20learning%20machine.md) (`3 3 100`) so it can only be **fully used once per creature**. It **creates no new agents** — it modifies the existing HLM:

- The first time a creature uses it, the machine teaches it the whole vocabulary and makes it express happiness, as before.
- On any **subsequent** use, the creature is still stimmed (so it gets the feedback) but is then made to **ponder briefly and get tossed aside** rather than learning again — stopping creatures from endlessly farming the machine.

It tags each creature with a per-creature `cc_hlm_score`; the HLM also gets two tuning name-variables: `cc_hlm_pondering_time` (15 ticks a knowledgeable creature waits before being dropped) and `cc_hlm_rejection_velocity` (−15, how hard a rejected creature is thrown to the left).

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 3 3 100 | Holistic Learning Machine | Modification | Teach script (event 1000) replaced to limit it to once per creature |

## Behaviour

### Event 1000 — Teach (patched)

When the machine processes the lifted creature it stims it **90 (activate machinery)** and runs `vocb` (teach all words), then increments the creature's `cc_hlm_score`:

- **First use** (`cc_hlm_score` ≤ 1): the creature is un-zombified, driven to **express** its new contentment (urge), and set down normally.
- **Repeat use** (score > 1): the creature simply **waits** the pondering time and is then dropped and **flung aside** at the rejection velocity — it gets the stim but no further benefit.

The pickup agent (`1 1 174`) is still told to set the creature down afterwards.

## Removal Script

This patch only re-installs the HLM's teach script; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

No Room CA is written. The HLM still stims the creature with **90 (activate machinery)** and teaches the full vocabulary (`vocb`) on the **first** use, driving an **express** urge. The patch's change is to gate repeat uses — a second-time creature is stimmed but then ejected rather than re-taught — preventing players from over-using the machine on a single creature.
