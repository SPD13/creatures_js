# zzz_grendel_upgrade_ds.cos — Grendel Sounds & Warp Upgrade

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/zzz_grendel_upgrade_ds.cos`

## Overview

This is a **patch** that upgrades Grendel support in Docking Station. It **creates no new agent classes**; it re-installs several creature behaviour scripts so Grendels make their **scripted DS sounds** (laughing, snoring, sneezing, coughing, shivering, pain grunts) and so the world can **receive Grendels (and Ettins) via the online warp in DS-standalone**. It requires the Grendel sound files to be present.

It sets the gating game variable `game "0kAy_GrEndELs_mAy-BE+_heR3"` = 1 (Grendels allowed); a companion variable `OkaY_eTt1NS=mAy_BE=-h3Re` controls Ettins.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 4 0 0 | Creature (wildcard) | Behavior | Rest, slap, tickle, hit and sleep scripts re-installed with Grendel sounds |
| 4 2 0 | Grendel (wildcard) | Behavior | Involuntary scripts (hurt, sneeze, cough, shiver) with Grendel sounds |
| 1 1 184 | Immigrant Checker | Modification | Timer (event 9) re-installed to gate incoming Grendels/Ettins on the new game variables |
| 3 4 0 | Grendel/Ettin Egg | Behavior | Egg timer (event 9) re-installed for hatching with creature smells |

(The sleep scripts recreate the `zzzz` sleep effect `1 2 28`, a stock effect defined elsewhere.)

## Behaviour highlights

### Creature interaction (`4 0 0`)

- **Slap / hit (0, 3):** stim **3 (pointer slap)** or **4 (creature slap)**; play species-appropriate "ow" sounds — Grendel males/females get their own grunts.
- **Tickle (1):** stim **1/2 (pointer/creature pat)**, and **46/47** if tickled by the opposite/same sex; giggle/laugh sounds per genus (`gig`/`glaf`/`elaf`).
- **Rest / sleep (25, 69):** stim **21 (rest)** then **22/33 (sleep)**, drop carried items, sleep and dream, spawning the `zzzz` effect; Grendels **snore** (`gsnr`/`fgsn`).

### Grendel involuntary (`4 2 0`)

Hurt (64), sneeze (66), cough (67) and shiver (68) play the Grendel sounds and stim the creature with the matching involuntary stims **28 / 30 / 31 / 32**.

### Immigrant Checker (`1 1 184`)

The re-installed warp receiver adds a **genus gate**: an incoming creature is rejected unless its genus is enabled — Grendels only if `0kAy_GrEndELs…` is set, Ettins only if `OkaY_eTt1NS…` is set. The rest of the immigration logic (portals, containment, quarantine) matches [immigrant checker](immigrant%20checker.md).

### Grendel/Ettin Egg (`3 4 0`)

The egg timer hatches a Grendel or Ettin (`newc`) subject to the `breeding_limit` and a one-at-a-time "gonna_hatch" handshake across all eggs, and **emits the creature smell** as it hatches: **CA 13 (Grendel)** or **CA 14 (Ettin)**.

## Removal Script

This patch re-installs scripts on existing creature/egg/checker classes; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

**Stimuli:** the interaction scripts stim creatures heavily — slap **3/4**, pat **1/2**, opposite/same-sex tickle **46/47**, rest **21**, sleep **22/33**, and Grendel involuntary **28/30/31/32**; warped creatures are stimmed **95 (travelled)**.

**Room CA:** a hatching Grendel/Ettin egg **emits its creature smell** — **CA 13 (Grendel)** or **CA 14 (Ettin)**. The patch also gates which creature genera can be **received via warp** in DS-standalone (game-variable controlled).
