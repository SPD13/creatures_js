# Grendel Upgrade C3 (zzz_grendel_upgrade)

**Source file:** `Assets/Bootstrap/001 World Patches/zzz_grendel_upgrade_c3.cos`

## Overview

This is a **patch** bootstrap from the `001 World Patches` directory. The `zzz_` prefix is intentional: alphabetical sort ordering puts this file at the very end of the patch directory, so all earlier patches and the original `001 World` install scripts have already registered their behaviours before this one runs and overwrites them.

Two things happen at install:

1. **Sets a GAME variable** `0kAy_GrEndELs_mAy-BE+_heR3` to `1`. This is a hand-recognisable flag (the name is deliberately oddly-cased so it cannot be confused with anything else) used by other code in the world — typically the female-grendel breeding/genome unlock — to detect that the female-grendel content pack is active. A second flag `Grettin` is mentioned in the comments but is left commented out (`* setv game "Grettin" 1`), so the Grettin pack is not enabled by this patch.
2. **Replaces nine creature behaviour scripts** in the scriptorium so that they pick a male or female grendel sound based on the species (`spcs`) of the running creature. The header comment is explicit about the assumption:

   > Updates C3 grendel scripts to use female grendel voices in scripts (snoring etc).
   > This assumes those sound files are there!

The replaced scripts cover both the generic creature classifier (`4 0 0`) and the grendel-specific classifier (`4 2 0`). For each "make a sound" branch, the existing male-only call is rewritten as `doif spcs = 1 / snde "<male sample>" / else / snde "<female sample>" / endi`. The male samples are unchanged (`gsnr`, `mgow`, `mgsn`, `gcof`, `gshv`); the female samples are the four-letter codes shipped by the female-grendel content (`fgsn`, `fgow`, `snfg`, `fgco`, `fgsh`).

The replaced scripts also reassert the rest of the original behaviour around the sound calls (the latency hint `ltcy`, the pose / animation / wait sequence, the `stim writ targ`/`stim writ ownr` self-stim, the `aslp 1`/`aslp 0` toggle, and the runtime spawn of a `1 2 28` "zzzz" sleep-particle agent for the rest and sleep loops). Those parts are not bug fixes — they ship with the patch because `scrp` replaces the entire script body, not a delta.

There is no `rscr` removal block — patches are sticky for the lifetime of the world.

## Modified Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 4 0 0 | Creature (generic) — events 0, 1, 3, 25, 69 | Generic creature scripts (slap / tickle / hit / rest / sleep). Patch makes them branch female-grendel sounds when the runner is a grendel. | [Details](#agent-4-0-0-creature-generic-patch) |
| 4 2 0 | Grendel — events 64, 66, 67, 68 | Grendel-specific involuntary scripts (hurt / sneeze / cough / shiver). Patch branches male vs female sound samples by `spcs`. | [Details](#agent-4-2-0-grendel-patch) |

---

## Agent 4 0 0: Creature (generic) — patch

`4 0 0` is the catch-all classifier for *any* creature (norn, ettin, grendel, geat, etc.). Scripts registered here run on every creature unless a more specific classifier (`4 1 0` norn, `4 2 0` grendel, `4 3 0` ettin, `4 4 0` geat) overrides the same event number. The patch overwrites five events. All five also assert female-grendel branches via the same idiom: `doif gnus eq 2 / doif spcs = 1 / male-sample / else / female-sample / endi / else / non-grendel-sample / endi`.

### Events

| Event | Number | Description |
|---|---|---|
| Deactivate | 0 | "Slap" / poke received |
| Activate1 | 1 | "Tickle" received |
| Hit | 3 | The creature has been physically hit |
| Extra Action 9 (Rest) | 25 | The creature was told to rest by another agent / the player |
| Involuntary 5 (Sleep) | 69 | The creature is going to sleep autonomously |

### Event 0 - Deactivate (slap)

A `forf from` records the source agent (so subsequent `like from` can adjust the creature's friendship rating). If `dead ≠ 0` the script exits — dead creatures don't react. The script then stims the creature with either `3` (POINTERSLAP) when `from = pntr` or `4` (CREATURESLAP) otherwise. If the creature is unconscious (`uncs ≠ 0`) it stops; if asleep (`aslp ≠ 0`) it wakes up. Sound selection:

- `gnus ≠ 2` (norn / ettin / geat): pick one of `ow!1` / `ow!2` / `ow!3` from a 0–4 random roll (60 % `ow!1`, 20 % `ow!2`, 20 % `ow!3`).
- `gnus = 2` (grendel): `doif spcs = 1 / snde "mgow" / else / snde "fgow"` — male vs female grendel "ow" sample.

Finishes with a 1-in-5 `like from` to nudge the friendship rating.

### Event 1 - Activate1 (tickle)

Same skeleton as event 0: dead-check, stim 1 (POINTERPAT) or 2 (CREATUREPAT), unconscious bail-out, and a wake-up. An additional inst block tests whether the tickling agent is the same family + genus but **different species** (i.e. opposite-sex grendel-on-grendel) and writes either `46` (opposite-sex tickle) or `47` (same-sex tickle) to the creature's stim channels. Then, only when `driv 0` (pain) and `driv 12` (anger) are both below 0.1, the creature turns toward the camera (`dirn 1 / pose 0 / face 4`) and giggles. Sound selection:

- `gnus = 1` (ettin): random roll for `gig1` / `gig2` / `gig3`.
- `gnus = 2` (grendel): `doif spcs = 1 / snde "glaf" / else / snde "fglf"` — male vs female grendel laugh.
- otherwise (norn / geat): `snde "elaf"`.

A 1-in-5 `like from` to nudge friendship closes the script.

### Event 3 - Hit

Mirrors event 0 almost exactly. The differences:

- The CREATURESLAP stim from another creature is intentionally left to the *attacker*'s hit script (the comment in the source explicitly notes this), so this script only stims POINTERSLAP when `from = pntr`.
- Sound selection is the same `ow!1/2/3` for non-grendels; for grendels, `mgow` vs `fgow` based on `spcs`.

The wake-from-sleep behaviour and the 1-in-5 `like from` are the same.

### Event 25 - Extra Action 9 (Rest)

Triggered when another agent (or the player) explicitly tells the creature to rest. Branch on the sleepiness drive (`driv 7`):

- **Sleepy (`driv 7 > 0.6`)**: the creature actually goes to sleep. `lock` plus a latency hint (`ltcy 5 90 190`) are issued, the rest pose `pose 57` is taken, the creature self-stims with `21` (REST), then `aslp 1` switches it into the sleep state. A `new: simp 1 2 28 "zzzz" 17 0 6000` spawns a sleep-particle agent linked to the creature (`seta ov00 ownr`). The dream loop runs `drea 1` (one tick of dream), plays a snore every tenth iteration:
  - non-grendel (`gnus ≠ 2`): `snde "zzzz"`.
  - grendel (`gnus = 2`): `mgsn`/`mgow` male vs `fgsn` female. (The actual `snde` calls in this branch are `gsnr` for male, `fgsn` for female — see source.)
  
  Stim with `22` (SLEEP). Loop until both sleepiness `driv 7` and tiredness `driv 6` drop below 0.10, then `aslp 0` and `unlk`.
- **Not sleepy enough**: a tighter loop just plays the rest pose (`pose 58 / wait 20 / stim writ targ 21 1 / wait 20`) until tiredness `driv 6` falls below 0.10.

### Event 69 - Involuntary 5 (Sleep)

The autonomous-sleep version of event 25. Skips the sleepiness gate (because this is the involuntary trigger). Identical body to the sleepy branch of event 25, but with `stim writ targ 33 1` (SLEEP) inside the loop instead of `stim writ targ 22 1` (the variant 22 is "asleep starting", 33 is "while asleep"). The dream loop, sound branching (with `gsnr` / `fgsn` for grendels, `zzzz` otherwise), and exit conditions are the same.

### Removal Script

This script intentionally has no `rscr` block. Patches are sticky — once injected they remain in the scriptorium for the lifetime of the world.

### Impact on Stimulus / Room CA

These five scripts are also where the bulk of the creature's social/physical-feedback stimuli are written. The patch reasserts (and does not change) the following self-stims:

- Event 0 — `3` (POINTERSLAP) or `4` (CREATURESLAP).
- Event 1 — `1` (POINTERPAT) or `2` (CREATUREPAT); plus `46` (opposite-sex tickle) or `47` (same-sex tickle) on the recipient.
- Event 3 — `3` (POINTERSLAP) when from the pointer; the CREATURESLAP equivalent is intentionally sourced from the attacker's script.
- Event 25 — `21` (REST) before sleep, `22` (SLEEP) inside the dream loop.
- Event 69 — `21` (REST) before sleep, `33` (SLEEP) inside the dream loop.

Room CA is not touched.

---

## Agent 4 2 0: Grendel — patch

`4 2 0` is the grendel-specific classifier — events registered here run only on creatures of family 4 / genus 2. Because every script in this section is already grendel-only, none of them include the `gnus eq 2` outer branch — they go straight into the `doif spcs = 1` male/female test.

### Events

| Event | Number | Description |
|---|---|---|
| Involuntary 0 | 64 | The grendel was hurt by something |
| Involuntary 2 | 66 | Sneeze |
| Involuntary 3 | 67 | Cough |
| Involuntary 4 | 68 | Shiver |

### Event 64 - Involuntary 0 (hurt)

Issues a latency hint (`ltcy 0 25 50`), takes pose `75` (the hurt pose), plays `mgow` (male) or `fgow` (female), waits 10 ticks, and self-stims with channel `28` (INVOL_0).

### Event 66 - Involuntary 2 (sneeze)

`ltcy 2 25 35`, plays the sneeze animation `[071 071 072 072 072]`, sound `mgsn` male / `snfg` female, self-stims `30` (INVOL_2), `over` waits for the animation to finish, and `mesg wrt+ ownr 300 0 0 0` schedules itself to message-300 with delay 0 — 300 is the standard "go back to default behaviour" reset message used by the creature behaviour stack.

### Event 67 - Involuntary 3 (cough)

`ltcy 3 25 35`, animation `[071 071 072 072]`, sound `gcof` male / `fgco` female, `over`, `mesg wrt+ ownr 300 0 0 0`, then self-stim `31` (INVOL_3) and `wait 5`.

### Event 68 - Involuntary 4 (shiver)

`ltcy 4 30 90`, animation `[046 047 046 047 046 047 047 046 255]` (seven shiver poses with the trailing `255` "hold the last frame"), sound `gshv` male / `fgsh` female, self-stim `32` (INVOL_4), waits a randomised 50–150 ticks, then settles on pose 46.

### Removal Script

This script intentionally has no `rscr` block. Patches are sticky — once injected they remain in the scriptorium for the lifetime of the world.

### Impact on Stimulus / Room CA

The grendel involuntary scripts each write a self-stim on a known channel and play a latency hint, but do not touch Room CA:

- Event 64 — `28` (INVOL_0).
- Event 66 — `30` (INVOL_2).
- Event 67 — `31` (INVOL_3).
- Event 68 — `32` (INVOL_4).

The female-grendel sound files (`fgsn`, `fgow`, `snfg`, `fgco`, `fgsh`) must be present in the world's `Sounds` directory — the header comment explicitly warns of this assumption.
