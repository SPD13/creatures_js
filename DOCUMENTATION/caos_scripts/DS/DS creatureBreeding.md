# DS creatureBreeding.cos — Breeding, Egg Hatching & Mating

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creatureBreeding.cos`

## Overview

This script implements the creature breeding lifecycle for Docking Station: mating courtship, egg laying, egg incubation/hatching, and the creature/egg interaction scripts. It is the Docking Station counterpart of the Creatures 3 [creatureBreeding](../C3/creatureBreeding.md). It does not create new agent *types*; it defines **behaviour scripts** for the egg classifiers (`3 4 0/1/2/3`) and the creature classifier (`4 0 0`), and it spawns egg instances during the lay-egg action.

### Differences from Creatures 3

- **No game-variable setup.** The multiple-birth/twinning variables are not set here; in Docking Station they live in [!DS_game variables](!DS_game%20variables.md).
- **New population model.** Hatching and mating gate on `breeding_limit` (and `extra_eggs_allowed`) rather than C3's `c3_max_creatures` / `c3_max_norns` (whose checks are commented out).
- **Wolfling-run friendliness.** The mating script's population cap was removed so a full world can still produce eggs; instead it only checks the egg count against `breeding_limit + extra_eggs_allowed`.

## Agents Involved (behaviour scripts)

| Classifier | Agent | Role |
|---|---|---|
| 3 4 0 | Unfertilised / generic egg | Incubation, hatching (grendel/ettin), exception, pickup |
| 3 4 1 | Norn egg | Norn incubation & hatching with population caps |
| 3 4 2 | Grendel egg | Collision plane correction |
| 3 4 3 | Ettin egg | Collision plane correction |
| 4 0 0 | Creature (all species) | Mating courtship, sperm donation, egg laying |

---

## Egg scripts (3 4 x)

### Event 1000 (3 4 0) — Hatch by incubator

Creates the creature inside the egg (`newc 4 …`) with the default creature physics/behaviour/permeability game variables, emits the species home/egg smell (`emit 11+gnus`), puts it dreaming, and signals the hatchery (via `ov53`/`spas`) that it can pick the egg up, then waits for the hatchery to be idle before removing itself.

### Event 9 — Egg timer (hatch)

Norn (`3 4 1`) and grendel/ettin (`3 4 0`) timers grow the egg through poses and, when ready, gate hatching on:

- Not cracked, not in water (room type 8/9), not carried, not falling.
- **Breeding limit:** count live creatures (`enum 4 0 0`, `dead = 0`); if ≥ `breeding_limit`, wait (`tick 1200`).
- **One-at-a-time:** the `gonna_hatch` name flag ensures only one egg hatches at a time.

When safe it stops being carryable/mouseable, creates the creature (`newc 4`), plays the cracking animation/sound, moves the new creature to the egg position feet-level (`mvsf`), wakes it (`aslp 0`) and fires `born`.

### Events 255 / 6 / 4

- **255** (3 4 1 / 3 4 0) — agent-exception handler if the creature dies mid-hatch: set the cracked pose and reschedule.
- **6** (3 4 2 / 3 4 3) — egg collision: bring the egg to plane ≥ 1000 (so it draws in front when expelled from an egg layer).
- **4** (3 4 0) — egg picked up: set the carry handle; if a creature is carrying it, stimulate it (93) and, for a Norn, enforce the rule that the carrier's life stage must exceed the egg's size or it is forced to `drop`.

## Creature scripts (4 0 0)

### Events 33 / 34 — Mate (courtship)

33 forwards to 34. The mating script approaches the partner (`appr`), checks compatibility (different genus → disappointment; same sex → disappointment), and tallies hotness/age of both creatures (`driv 13`, `cage`). If both are old and horny enough (`va05 = 4`) and `byit`, it breeds: the male `mate`s (or the female tells the male to via message 200), both are stimulated with MATE (45), gated on the egg count being below `breeding_limit + extra_eggs_allowed`. Otherwise it's just a snog (activate stimulus 13).

### Event 200 — Give sperm

`mate` — the male passes on sperm (safe to run on a female too).

### Event 65 — Lay egg (involuntary)

If pregnant (`gtos 1 ≠ ""`), plays the laying poses and creates the appropriate egg type — Norn (`3 4 1 "eggs"`), Grendel (`3 4 2 "greneggmask"`) or Ettin (`3 4 3 "greneggmask"`) — with egg physics (`attr 195`, `bhvr 32`, gravity, etc.), moves the baby's gene into the egg (`gene move`), sets temperature-dependent gender (`ov01` from `sean`), records the laying life-events for embryo and mother (`hist evnt` types 11/12), emits the Norn egg smell (`emit 11`), and stimulates the mother (29). Involuntary latency is set via `ltcy 1 8 64`.

## Removal Script

```
rscr
enum 3 4 0
    kill targ
next
```

Kills all eggs.

## Impact on Stimulus / Room CA

- **Stimuli:** mating and laying drive creature stimuli (MATE 45, activate 13, disappointment 0, picked-up 93, just-laid 29).
- **Room CA:** newly hatched/laid Norn eggs emit the **egg smell** (`emit 11`) and hatchlings emit the species home smell (`emit 11+gnus`, e.g. 13 grendel / 14 ettin) into Room CA.
