# DS bacteria.cos - Bacterium Disease Simulation

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS bacteria.cos`

## Overview

This script implements the bacterium disease simulation for Docking Station, adapted from the Creatures 3 [bacteria](../C3/bacteria.md). It seeds the world with microscopic pathogen agents (classifier `2 32 23`) that drift around, attach to creatures, infect them by injecting antigens and toxins into their bloodstream, reproduce by splitting (with mutation), and spread by contact and sneezing. Each bacterium is born with randomised "genetic" parameters, producing a diverse, evolving pathogen population.

Bacteria interact with the creature immune system: each injects an antigen (chemicals 82–89), which triggers antibody production (chemicals 102–109). When antibody level rises above the bacterium's uninfect threshold it goes dormant; when it falls below the infect threshold it resumes, injecting a toxin (chemicals 70–81). A population cap regulates total numbers; bacteria that exhaust their lifespan die.

### Docking-Station seeding (two batches)

1. **When docked with C3** (`eame "engine_no_auxiliary_bootstrap_1" = 0`): the C3 bacteria — killed by [!kill duplicate Creatures 3 agents](!kill%20duplicate%20Creatures%203%20agents.md) — are recreated. 50 bacteria are placed across the C3 Ark (Grendel 65%, Ettin 5%, Norn 10%, main ship 10% excluding medlab rooms 362–367/374/377–380, Aquatic 10%), with population cap `ov30 = 60` / floor `ov31 = 40`.
2. **Always**: 10 bacteria are seeded in the Capillata — Workshop area 90%, corridor 10% — with a smaller population cap `ov30 = 30` / floor `ov31 = 10`.

Each bacterium gets a randomised tick (13–17) so the initial batch doesn't all update on the same frame.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 32 23 | Bacterium | `bacteria` (2 frames) | Invisible pathogen that infects creatures, injects antigens/toxins, reproduces and mutates |

## Bacterium (2 32 23)

`new: simp 2 32 23 "bacteria" 2 0 6999`, `attr 144` (invisible 16 + has-boundaries 128), `accg 0` (no gravity). Physics/collision are enabled only once the timer validates the spawn position.

### Genetic & state variables

| Var | Meaning |
|---|---|
| ov00 / ov01 | Agent currently attached to / last attached-or-copied (avoids bouncing back) |
| ov02 | Wall-collision flag (0 off until position validated, 1 on) |
| ov03 | Status: 0 = inactive, 1 = infective |
| ov04 | Time attached to the current agent |
| ov10 / ov11 | Default life force / current life force (lifespan ~10–30 min) |
| ov12 | Life-force % required to reproduce |
| ov13 / ov14 | Uninfect / infect antibody thresholds |
| ov15 | Antigen released (82–89) |
| ov16 / ov17 | Toxin 1 id (70–81) / amount (0.005–0.05) |
| ov18 / ov19 | Toxin 2 id (69 = none) / amount |
| ov30 / ov31 | Max / min bacteria population |
| ov32 | Visibility (0 invisible, -1 visible, >0 visible for N ticks) |
| ov33–ov38 | Transfer odds: copy/jump/release/sneeze chances (relative to ov33) |
| ov37 | Max time attached before considering release |
| ov40 | Child count |
| ov97 / ov98 / ov99 | Sneeze flag / copy-target pointer / sneeze direction |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Core processing: decay, infect, move, copy/jump/attach/release |
| Custom | 100 | Duplicate (reproduce) — copy genes, mutate, place offspring |
| Custom | 101 | Expel by sneeze — copy/eject bacteria in a direction |
| Custom | 255 | No-op (catches pointer errors without an error box) |

#### Event 9 — Timer (core processing)

1. **Life force:** decay `ov11`; if ≤ 0, `kill ownr`. Update visibility from `ov32`.
2. **Infecting:** if attached to a creature (`ov00`, `fmly = 4`): read the host's antibody chem (`ov15 + 20`) and decay accordingly (plus a flat −1). Toggle infectious state against the uninfect/infect thresholds. While infectious, inject the antigen (`chem ov15 0.02`) and toxin(s) (`chem ov16 ov17`, and `ov18`/`ov19` if `ov18 ≠ 69`) into the host's bloodstream. If not attached to a creature, just decay.
3. **Movement:** follow the attached agent (clamped velocity, re-validating collision after room changes via the `coll` subroutine); if unattached, try to enable collision.
4. **Spread (only ~1 in 32 updates, and not mid-sneeze):** roll transfer odds (`ov33`). After validating the room (rejecting -1 and medlab rooms 362–367/374/377–380), it may **attach** to a touching world object, **copy into the air** when below the population floor, or **release** from a host it has clung to for too long. The `tran` subroutine biases odds depending on whether the host is a Grendel (×0.8) or Norn-genus (×1.1).

#### Event 100 — Duplicate (reproduce)

Creates a new `2 32 23`, copies the parent's genetic data and constants, sets the offspring uninfectious, refreshes life force (re-randomising when the population is low), and **mutates** with a 1-in-3 chance (one randomly chosen gene: life force, reproductive age, thresholds, antigen, or a toxin — toxin 2 mutates only 1-in-20 to limit pathogen variety). Positions the child at `_p1_,_p2_`, sets velocity (random, or directional if sneezed), and ticks 15.

#### Event 101 — Sneeze expel

When a host sneezes, doubles the jump odds and either copies a bacterium out (message 100 with the sneeze flag/direction) when the population allows, or — if this bacterium is non-infective — detaches and ejects itself in the sneeze direction (`ov99`: 2 = right, 3 = left, else down).

### Subroutines (within event 9)

- **`tran`** — decide copy vs jump vs release based on odds and host genus.
- **`copy`** — population-checked, life-force-gated duplication (area-weighted chance, boosted when infective) via message 100.
- **`atch`** — attach to a target agent (resetting life force when attaching to a creature) and record the previous host.
- **`coll`** — when the bacterium is clear of obstacles, in a valid room and can move (`tmvt`), snap it to a safe floor position (`mvsf`), set `attr 208` (collisions on) and `ov02 = 1`.

### Removal Script

```
rscr
enum 2 32 23
    kill targ
next
```

Kills every bacterium.

## Impact on Stimulus / Room CA

No Room CA. The bacteria act on **creature biochemistry**: while infecting a host they inject antigens (82–89) and toxins (70–81) into the creature's bloodstream via `chem`, driving the infection/immune-response loop. They emit no room stimuli and do not alter Room CA.
