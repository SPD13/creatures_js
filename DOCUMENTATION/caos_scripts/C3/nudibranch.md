# nudibranch.cos - Nudibranch Critter

**Source**: `Assets/Bootstrap/001 World/nudibranch.cos`

## Overview

This script implements the nudibranch critter (classifier `2 15 21`) -- a sea-slug-like underwater creature that lives in aquatic rooms (room type 9). Three nudibranchs are placed at bootstrap at fixed position `(3879, 2192)` (in the underwater area). Each has a two-stage life cycle controlled by timers: it roams and drifts with gravity tuned to sea drift, eats small prey (other sea critters), and eventually matures to spawn two offspring before dying.

The nudibranch:
- **Drifts** in aquatic rooms using random direction changes and obstacle avoidance (`subr drft`/`obst`/`move`).
- **Sinks** when outside water: a per-tick counter (`ov86`) progressively increases gravity (`accg`) and, after 200 ticks out of water, triggers the death subroutine.
- **Feeds** on small prey within range 75 (classifiers `2 13 8`, `2 15 18`, `2 3 8`) once its feed timer (`ov02`) drops below 500, killing the prey and replenishing its life timer (`ov01`).
- **Breeds** when `ov01` passes staged thresholds (1500 then 1000): it stops, plays animation sequences on two poses (`ov30`/`ov31`) and eventually enters breeding state (`ov05 = 2`). When triggered, if local population is ≤ 3, it plays a `nudi` sound and spawns two identical nudibranchs nearby, then dies.
- **Dies** when its lifespan (`ov01`/`ov02`) runs out, when picked up by the pointer (`ov99 = 99`), or after long exposure to non-water. Death plays `ndid` sound and `kill ownr` (unless held by a non-pointer carrier -- then waits to be dropped).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 21 | Nudibranch | `nudibranch` sprite, pose 46 | Underwater sea-slug critter that drifts, feeds on small prey, and breeds into two offspring before dying | [Detail](#nudibranch-2-15-21) |

---

## Nudibranch (2 15 21)

Underwater sea-slug critter. Three are spawned at bootstrap in the marine area at `(3879, 2192)`. The nudibranch drifts in water rooms, hunts small prey, matures through visual stages (via `ov30`/`ov31` pose bases) and eventually spawns two offspring before expiring.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Command | `new: simp 2 15 21 "nudibranch" 0 0 2000` | 3 repetitions (`reps 3`) |
| Sprite | `nudibranch` | First image 0, plane 2000 |
| `attr` | 192 | Floatable + Suffers Physics |
| `elas` | 50 | Elasticity |
| `accg` | 0 | No gravity initially (adjusted dynamically in water vs. air) |
| `aero` | 7 | Aerodynamics (slow drift) |
| `perm` | 75 | Permeability |
| `fric` | 99 | High friction |
| `clac` | -1 | Disable default click action |
| `tick` | 10 | Timer interval |
| Position | `mvto 3879 2192` | Marine area |
| Initial pose | `pose 46` | Idle pose |
| Animation | `base ov30` `frat 2` `anim [0..12..0 255]` | Undulating idle animation, pose base 46, stop |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov01` | Main life/health timer | Starts `rand 2000 2100`; decrements each tick; thresholds 1500 and 1000 trigger maturation; ≤0 triggers death. Topped up by +5000 on successful feed. |
| `ov02` | Hunger timer | Starts `rand 2000 2100`; decrements each tick; ≤500 triggers feed behaviour; ≤0 triggers death. |
| `ov05` | Maturation stage | 0=juvenile, 1=sub-adult (first stage reached when `ov01 ≤ 1500`), 2=adult breeder (reached when `ov01 ≤ 1000`) |
| `ov10` | Horizontal drift direction | -1 / 1 (set by `drft`) |
| `ov11` | Vertical drift direction | -1 / 1 (set by `drft`) |
| `ov30` | Idle pose-base (by stage) | 46 (juvenile), 23 (sub-adult), 0 (adult) |
| `ov31` | Grab/feed pose-base (by stage) | 59 (juvenile), 36 (sub-adult), 13 (adult) |
| `ov61` | CA smell range | 60 |
| `ov86` | Out-of-water timer | Increments each tick when room type ≠ 9; reset to 0 when back in water; ≥200 triggers death |
| `ov87` | Dynamic gravity | Built up while out of water (fast growth first 6 ticks, slower thereafter); applied via `accg` |
| `ov99` | Pointer-carry death flag | Set to 99 when picked up by pointer -- triggers death on next tick |
| `va00` | Local population counter | Used in breed subroutine (`esee 2 15 21`) |
| `va01`/`va02` | Saved spawn position | Parent's `posl`/`post` used to place offspring |
| `va09`/`va10` | Feed scan counters | `va09` counts prey seen, `va10` = 99 means prey was killed |
| `va70` | Drift direction roll | 1-4 -> assigns `ov10`/`ov11` |
| `va77` | Random init flag | `rand 0 1` (unused further in this script) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main AI tick: room check, hunger decrement, age decrement, death check, feed, maturation, breed |

#### Event 9 -- Timer

Runs every 10 ticks. Drives the entire nudibranch life cycle.

1. **Room/drift pass (`gsub room`)**: if not in a water room (type ≠ 9), increase gravity counter `ov86` and build `ov87` upward; apply `accg ov87`; after 200 ticks out of water, `gsub death`. If back in water, reset counters and run `drft` -- randomise direction and run `obst` + `move` to avoid walls and apply velocity.
2. **Age counters**: `subv ov02 1` (hunger), `subv ov01 1` (life).
3. **Death check**: if `ov01 ≤ 0`, `ov99 = 99`, or `ov02 ≤ 0`, run `death` subroutine.
4. **Feed**: if `ov02 ≤ 500`, run `feed` subroutine (scans and kills small prey within range 75, tops up `ov01` by 5000).
5. **Maturation -- Sub-adult (`ov01 ≤ 1500` and `ov05 = 0`)**: scan within range 200 for clear space on all four sides (>150 px), ensure not carried, confirm room type 9. If all conditions met, stop movement (`velo 0 0`), switch pose bases to `ov30 = 23` / `ov31 = 36`, restart idle animation, set `ov05 = 1`.
6. **Maturation -- Adult (`ov01 ≤ 1000` and `ov05 = 1`)**: same spatial/room checks. If met, stop, switch pose bases to `ov30 = 0` / `ov31 = 13`, `ov05 = 2`, restart idle animation.
7. **Breed**: if `ov05 = 2`, run `breed` subroutine.

### Subroutines

#### `subr room`
Out-of-water handling and drift dispatch.
- If `rtyp room ownr <> 9` (not water): loop while still out of water and `ov86 < 200`, incrementing `ov86` and building `ov87` (gravity) -- `+0.03` per tick for the first 7 ticks, then `+0.08` per tick up to tick 200. Apply `accg ov87`. If `ov86 ≥ 200`, wait `rand 100 400`, then `gsub death`.
- If `rtyp room ownr = 9` (water): reset `ov86`/`ov87` and call `drft`.

#### `subr drft`
Randomise drift direction: `va70 = rand 1 4` chooses one of four moves -- `ov11 = -1`, `ov11 = 1`, `ov10 = -1`, or `ov10 = 1`. Then calls `obst` and `move`.

#### `subr obst`
Per-side obstacle avoidance (nudibranch is large relative to room details):
- `obst 0 < 50`: left wall near -> `ov10 = 1`
- `obst 1 < 50`: right wall near -> `ov10 = -1`
- `obst 2 < 50`: ceiling near -> `ov11 = 1`
- `obst 3 < 20`: floor near -> `ov11 = -1`

#### `subr move`
`velo ov10 ov11` -- apply drift direction as velocity.

#### `subr anim`
Unused in the main event flow (defined but not called in script 9). Plays the 0-12-0 undulation animation on base `ov30`.

#### `subr feed`
Three-pass predation scan in order within range 75. The nudibranch preys on (in priority order):
- **`2 13 8`** -- small fish / marine prey
- **`2 15 18`** -- additional sea critter
- **`2 3 8`** -- small insect / surface prey that strayed underwater

Each pass uses `esee <fam gen spe>` with `inst`; if a target is found, `kill targ` and set `va10 = 99` (stops further passes). After a successful kill, `gsub grab` plays the feeding animation and tops up life, then `stop`.

#### `subr grab`
Plays the feed animation sequence:
- Clear current animation (`anim []`).
- Set `base ov31`, play `anim [0..9]`, then `over` (wait until animation finishes).
- Switch to `base ov30`, `frat 2`, play idle undulation `anim [0..12..0 255]`.
- `addv ov01 5000` -- replenish life timer by 5000.

#### `subr breed`
Adult breeding routine. Requires not carried (`CARR = null`) and current room type 9.
1. Within range 1000, count nearby nudibranchs via `esee 2 15 21` into `va00`.
2. If `va00 ≤ 3` (population is low enough):
   - Play sound `"nudi"`.
   - **Repeat 2 times**: save parent position (`va01`/`va02`), `new: simp 2 15 21 "nudibranch"` (full fresh setup: `attr 192`, `elas 50`, `accg 0`, `aero 7`, `perm 75`, `fric 99`, `clac -1`, fresh `ov01`/`ov02`/`ov61` values, `pose 46`, `tick 10`, idle animation). Use `tmvt` to validate the parent's position; if valid, `mvto`, otherwise `mvsf`.
   - After both offspring are created, `targ ownr` and `gsub death` -- the parent dies immediately after spawning.

#### `subr death`
Handles expiry. If the nudibranch is an adult (`ov05 = 2`), attempts `gsub breed` one last time -- an adult always tries to reproduce before dying, which allows a lone adult that was about to die to spawn its offspring.
- **Not carried (`carr = null`)**: `velo 0 0`, `wait 200`, play `ndid` sound, `wait 10`, `kill ownr`.
- **Carried by pointer (`carr = pntr`)**: set `ov99 = 99` so the death check runs on the next timer (delayed death while the player holds it).
- **Carried by something else**: stop, wait 200, play `ndid`, wait 10, `kill ownr`.

### Sounds

| Sound | Trigger |
|---|---|
| `nudi` | Start of breeding (before spawning offspring) |
| `ndid` | Death |

### Stimulus / Room CA Impact

The nudibranch does not write stimuli onto creatures and does not modify Room CA values. Its ecological impact is:
- **Predation**: culls populations of `2 13 8`, `2 15 18`, and `2 3 8` within its range.
- **Self-propagation**: adults spawn two offspring before dying, keeping a stable population (gated at ≤3 within range 1000).
- **Habitat-bound**: dies if it stays out of water too long (≥200 ticks), reinforcing it as a marine-area critter.

---

## Remove Script (rscr)

1. Enumerates all `2 15 21` nudibranchs and kills them (`kill targ`).
2. Removes the timer event script (`scrx 2 15 21 9`).
