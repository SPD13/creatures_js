# Dragonfly Patch

**Source file:** `Assets/Bootstrap/001 World Patches/dragonfly_patch.cos`

## Overview

This is a **patch** bootstrap from the `001 World Patches` directory. It does not create any agents and does not modify the map. Its sole purpose is to **replace two scripts of the existing adult dragonfly agent** (classifier `2 15 8`) — the per-tick Timer (event 9) and the Collision handler (event 6) — to fix a population-extinction bug introduced by the original AI.

The header comment in the script summarises the situation:

> Alters the dragonflies so they no longer accidentally eat their mates, resulting in rapid extinction of the less populous gender as soon as one began dominating.

In the original Timer script the dragonfly's "find food" routine could return another dragonfly (a `2 13 5` critter) as a valid prey target. Once one gender out-numbered the other, every adult started eating its potential mates, collapsing the population almost immediately. The fix is a small addition inside the `find` subroutine: when the search is the food sweep (`va48 = 13`) and the candidate's species is `5`, the candidate is silently skipped (`va88 = 1` flags it as "not eligible") so the closest-target accumulator never sees it. The mate-search (`seek`) is unchanged.

The Collision handler (event 6) is replaced too. It changes facing on the bounce, plays the dying animation if `ov00 = 99`, and otherwise re-arms the standard flying animation. This is essentially the original event 6 logic re-shipped so that the patch can be applied as a single bootstrap unit — it is included to keep both scripts in sync after the fix.

The patch ships as two `scrp 2 15 8 …` blocks. When executed, each `scrp` directive replaces the corresponding event handler for `2 15 8` in the scriptorium; **all already-spawned dragonflies will pick up the new behaviour the next time their tick fires**. There is no `rscr` removal block — patches are sticky for the lifetime of the world.

This document does **not** describe the dragonfly agent as a whole — that agent is created by the original `dragonfly` script (which also installs scripts for `2 18 5`, the dragonfly egg/larva). Only the patched event-9 and event-6 handlers are described below.

## Modified Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 2 15 8 | Adult dragonfly (events 6 and 9 only) | Flying critter that hunts food, drinks water, finds mates, and lays eggs. Patch fixes a bug where it ate its own mates. | [Details](#agent-2-15-8-adult-dragonfly-patch) |

---

## Agent 2 15 8: Adult dragonfly (patch)

The adult dragonfly (`2 15 8`) is the flying form created by `dragonfly.cos`. It cycles through a set of behavioural states stored in `ov00`, looking for food (state 1), mating (states 2/3), drinking (state 4), egg-laying (state 5), idling after sleep (state 98), and dying (state 99). Movement uses two signed direction variables `ov10` (horizontal) / `ov11` (vertical) plus per-tick random magnitudes `va10`/`va11`. The patched scripts are the per-tick Timer (the master state machine) and the Collision handler.

### Agent Variables Referenced by the Patch

| Variable | Purpose |
|---|---|
| `ov00` | Behavioural state. 0 = roam, 1 = hunt food, 2 = look for mate, 3 = mating, 4 = drink water, 5 = lay eggs, 98 = idle after sleep, 99 = dying. |
| `ov01` | Lifetime tick counter (incremented every tick). |
| `ov02` | Energy / hunger gauge. Topped up when food is eaten, drained over time. Death triggers when `ov02 ≤ 0`. |
| `ov06` | Gender flag (used as `va45` to exclude same-gender targets when seeking a mate). |
| `ov10` | Horizontal facing/velocity sign (-1 / 0 / +1). |
| `ov11` | Vertical facing/velocity sign. |
| `ov16` | Cached agent reference of the current target (food / mate / water source). |
| `ov20` | Maturity / mating-readiness counter (advances toward egg-laying when `ov70 = 1`). |
| `ov61` | Sound channel (set during death). |
| `ov70` | Female flag (1 = female, 0 = male). Females switch to drinking (`ov00 = 4`) on tick and to egg-laying when in water rooms. |
| `ov72` | Energy gain per food eaten. |
| `ov73` | Hunger threshold (when `ov02 < ov73`, switch to hunting). |
| `ov74` | Satiation threshold (when `ov02 > ov74`, exit hunting state). |
| `va10` / `va11` | Per-tick random velocity magnitudes (signed by `ov10`/`ov11` in `mov_`). |
| `va45` | Gender exclusion filter for `seek` (`= ov06`). |
| `va47` / `va48` / `va49` | Search filter (family / genus / species) for `find` and `seek`. |
| `va50` / `va51` | Target/anchor coordinates used by `mate`, `slep`, `die_`, `layg` and `hunt`. |
| `va58` | Closest matching candidate accumulator inside `find` and `seek`. |
| `va60`–`va63` | Property-grid samples used by `gwtr` to gradient-walk toward water. |
| `va66` | Random roll (0–10) for roaming behaviour and used as a counter of nearby larvae in `layg`. |
| `va88` | **The new "skip" flag added by the patch**, set to 1 inside `find` when the candidate is a `2 13 5` (dragonfly food search returning another dragonfly). |
| `va99` | Closest-distance accumulator for `find` / `seek`. |

### Events

| Event | Number | Description |
|---|---|---|
| Collision | 6 | Bounce handling and death animation |
| Timer | 9 | Per-tick state machine (food / water / mate / egg-lay / roam / die) |

### Event 9 - Timer (the patched script)

The timer is the dragonfly's main "tick". It runs once per agent tick and cycles through the state machine. High-level flow:

1. **Counters & gender drift** — increment `ov01`, decrement `ov02`. For males (`ov70 ≠ 1`) advance the maturity counter `ov20`. For females (`ov70 = 1`) force `ov00 = 4` (go drink water).
2. **Death gate** — if `ov02 ≤ 0` (out of energy) set `ov00 = 99`.
3. **Wall avoidance** — if obstacle distances `obst 0..3` are below 30, force `ov10`/`ov11` to push away from the obstruction (the four ifs cover left/right/down/up bounces).
4. **Water-room handling** — if not being carried (`carr = null`) and the current room is water (`rtyp room ownr = 8`):
   - Force `ov11 = -1` (push up).
   - Drain energy fast (`subv ov02 20`).
   - For females, switch to lay-eggs state (`ov00 = 5`).
   - Apply a strong upward kick (`vely -40`) so the dragonfly resurfaces.
5. **State dispatch:**
   - `ov00 = 99` → `gsub die_` (death sequence).
   - `ov00 = 5` → `gsub layg` (lay eggs).
6. **Hunger trigger** — if `ov02 < ov73` and the state is not already 1, clear `ov16` and switch to hunting (`ov00 = 1`).
7. **Hunt food** — `ov00 = 1` → `gsub gfod`.
8. **Idle-after-sleep wake-up** — `ov00 = 98` → 1-in-6 chance per tick of returning to roam (`ov00 = 0`, `tick 4`).
9. **Drink water** — `ov00 = 4` → `gsub gwtr` (gradient-walk toward water using `prop grid`).
10. **Mate-readiness** — once `ov20 > 50` and male (`ov70 = 0`), switch to "look for mate" (`ov00 = 2`).
11. **Mate search** — `ov00 = 2` → call `seek` for `2 15 8` (other dragonflies) excluding same gender (`va45 = ov06`). If a candidate is found, switch to `ov00 = 3` (mating); otherwise return to roaming.
12. **Mating** — `ov00 = 3` → `gsub mate`.
13. **Default** — `ov00 = 0` → `gsub roam`.

The script ends with `stop`. The remainder of the file is the subroutine library.

#### Subroutines

- **`die_`** — captures the current position, spawns a `2 10 9` corpse (`new: simp 2 10 9 "dragonfly" 8 18 2000`), validates the position with `tmvt`, places the corpse if valid, otherwise destroys it. Then kills the dragonfly.
- **`gfod`** — food acquisition. Searches for `2 14 *` (primary food) first; falls back to `2 13 *` if nothing was found. Once a target is in `ov16`: home in via `hunt`, on contact, top up energy by `ov72`, send the target the EAT message (`mesg writ ov16 12`), clear `ov16`, and exit hunting if satiated. If no food is found at all, fall through to `roam`. Animation (`ani_`) and movement (`mov_`) are applied at the end.
- **`rst_`** — rest behaviour (currently unreferenced by the dispatcher in the patched script but kept for completeness).
- **`gwtr`** — water-gradient walk. Samples `prop grid` 5 in all four directions and steers `ov10`/`ov11` toward the highest gradient. If all samples are equal, falls back to `roam`.
- **`layg`** — egg laying. Snaps the body pose, snapshots the position, counts nearby larvae (`esee 2 18 5`), and if fewer than four are visible, attempts to spawn five `2 18 5` eggs (`new: simp 2 18 5 "dragonfly" 12 68 2050`) at the spore site. Each spawn validates with `tmvt` and is rolled back (`kill targ`) on failure. Resets `ov70`, `ov00`, `ov20` to zero and replays the body animation.
- **`slep`** — go to sleep at the rest target. Slows the tick to 30 and plays the sleep pose, validates a position 40 pixels above the target, moves there, and switches to `ov00 = 98` (idle-after-sleep).
- **`seek`** — closest-other-of-same-classifier scan with same-gender exclusion (`doif ov06 ne va45`). Used by the mate-search path.
- **`mate`** — verifies `ov16` is alive, homes in, and on contact: if female (`ov06 = 1`) flag the agent as fertilised (`ov70 = 1`, `ov00 = 4`); if male return to roam. Always resets `ov20 = 0`.
- **`roam`** — randomised meandering: 50/50 toggle of the horizontal direction, occasional vertical-direction flip, then `vect`/`ani_`/`mov_`.
- **`vect`** — fresh random per-tick magnitudes (`va10` 0–60, `va11` 0–20).
- **`vec2`** — closer-target version of `vect` used while hunting; keeps the velocity magnitudes proportional to the relative distance to `ov16` so the dragonfly slows as it approaches food.
- **`ani_`** — selects the wing-flap animation row (`base 0` west, `base 4` east) according to `ov10`. Also reseeds `ov10` if it ever becomes 0.
- **`mov_`** — applies the signed velocity (`velo`).
- **`find`** — same as `seek` but **with the patch**. The new addition is:

  ```
  setv va88 0
  doif va48 eq 13
      doif spcs eq 5
          setv va88 1
      endi
  endi
  doif va88 eq 0
      ... existing distance-comparison ...
  endi
  ```

  When the food sweep is over genus 13 and the candidate's `spcs` is `5`, `va88` is raised and the candidate is **excluded from the closest-target accumulator** (`va58`). This prevents `find` from ever returning species `5` of genus `13` as food — closing the loophole that let dragonflies hunt their own mates.
- **`hunt`** — homes in on the cached target by setting `ov10` / `ov11` toward `posx`/`posy` of `ov16`. If the target died/became `null`, clear the state (`ov00 = 0`).

### Event 6 - Collision (the patched script)

The collision handler keeps the dragonfly bouncing off solid surfaces and gracefully handles the death pose:

- **Death case**: if `ov00 = 99`, the patch suspends the agent's interactive attributes (`attr 0`), clears the active animation, plays the appropriate death animation row (`base 18` if facing left/up, `base 22` otherwise), waits with `over`, and then `kill targ`. This makes the death visible at the point of collision.
- **Live case**: pick a new direction by reflecting the current velocity (`velx ≤ 0` → `ov10 = 1`, otherwise `-1`), then re-arm the standard flying animation row (`base 0` west, `base 4` east) with `anim [1 3 255]`. `slow` yields back to the engine's collision pipeline.

### Removal Script

This script intentionally has no `rscr` block. Patches are sticky — once injected they remain in the scriptorium for the lifetime of the world.

### Impact on Stimulus / Room CA

None directly. The patch only changes the dragonfly's per-tick behaviour and collision response; it does not write stimuli, modify Room CA, or alter any global game variable. The indirect ecological effect is significant, however: dragonflies no longer cull their own breeding population, so worlds where the original script silently drove them to extinction will now sustain a stable dragonfly + larva population, which feeds back into any creature behaviours and CA emissions tied to that population (handled by the original `dragonfly` script).
