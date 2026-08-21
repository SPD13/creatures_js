# Aquatic Patches

**Source file:** `Assets/Bootstrap/001 World Patches/aquatic_patches.cos`

## Overview

This is a **patch** bootstrap from the `001 World Patches` directory. It does not create any agents and does not modify the map. Its sole purpose is to **replace the Timer (event 9) script of the existing Man-O-War spore agent** (classifier `2 18 23`) in the world's scriptorium, fixing a long-standing spawning bug where new Man-O-War creatures (`2 15 17`) could be created at invalid positions.

The header comment in the script summarises the situation:

> Fixes a bug in the Man-O-War spores wherein they would fail to spawn due to invalid spawn position.
>
> NOTE: This script will only work on brand-new worlds with no existing spores. To patch a world with existing spores, first run `enum 2 18 23 stpt tick 0 next`, THEN inject this script, then run `enum 2 18 23 tick 8 next`. This is because the script will not inject while an agent is currently running it.

The fix lives in the `matr` (maturation/spawning) subroutine: the spore now calls `tmvt va50 va51` to test whether the candidate position is reachable **before** calling `mvto`. If the position is invalid, the freshly-created Man-O-War is killed and the spore retries shortly afterwards (by reducing its lifetime counter `ov01` by 10). Without this validation, spores could `mvto` to a non-traversable point, leaving the new Man-O-War in an inconsistent state.

The patch ships as a single `scrp 2 18 23 9` block. When executed, the `scrp` directive replaces the current event-9 script for that classifier in the scriptorium; **all already-spawned spores will pick up the new behaviour the next time their tick fires**. There is no `rscr` removal block — the patch is a one-way upgrade for the duration of the world's lifetime.

This document does **not** describe the Man-O-War spore agent as a whole — that agent is created by the original `man-o-war` script. Only the patched timer behaviour is described below.

## Modified Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 2 18 23 | Man-O-War spore (timer event 9 only) | Drifts in water; matures into a full Man-O-War. Patch fixes a bug in the spawn-position validation. | [Details](#agent-2-18-23-man-o-war-spore-timer-patch) |

---

## Agent 2 18 23: Man-O-War spore (timer patch)

The Man-O-War spore (`2 18 23`) is a small drifting "seed" agent that wanders in water rooms and eventually spawns a full Man-O-War (`2 15 17`). This patch overrides only its **Timer** event handler (script number 9). All other scripts (creation, removal, collision, etc.) remain whatever the original `man-o-war` install script registered.

### Agent Variables Used by the Patched Script

| Variable | Purpose |
|---|---|
| `ov01` | Lifetime counter — incremented every tick. Spawning is attempted once it exceeds 500. |
| `ov02` | Down-counter (decremented every tick). Set up by the original spore install script. |
| `ov10` | Horizontal velocity sign (-1 / 0 / +1). Reseeded if random low value, flipped near walls. |
| `ov11` | Vertical velocity sign. Flipped if obstructed below or by random pick. |
| `ov40` | Animation base for the body. |
| `ov68` | Snapshot of `ov10` taken before randomisation (used elsewhere in the agent's other scripts). |
| `va10` / `va11` | Per-tick random velocity components (1–3 horizontally, 1–2 vertically) before being signed by `ov10`/`ov11`. |
| `va50` / `va51` | Candidate spawn position for the new Man-O-War (`posl`, `post − hght`). |
| `va66` | Random roll (0–5) used to gate direction reseeding; later reused as a counter of nearby Man-O-Wars. |
| `va67` | Random roll (0–5), unused after assignment in the patch. |
| `va88` | Snapshot of `wtik` (world tick), kept for diagnostics. |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Per-tick drift, water-room check, and (after 500 ticks) Man-O-War spawn attempt |

### Event 9 - Timer (the patched script)

The body of the patched timer runs every spore tick. Its high-level flow:

1. **Diagnostics & counters** — snapshot `wtik` into `va88`, increment `ov01`, decrement `ov02`.
2. **Buoyancy & water check** (only when not being carried, `carr = null`):
   - Look at the room type above the spore (`rtyp grap posx va51`). If it is `8` or `9` (the two water-room types) the spore is treated as floating: `accg 0` (no gravity). Otherwise apply a gentle gravity (`accg 0.3`) so it sinks back into water if it accidentally drifted out.
   - Sample the room types under all four corners of the spore's bounding box (`posl/post`, `posr/post`, `posl/posb`, `posr/posb`). If **none** of them is room type 8 or 9, the spore has fully left water and `gsub die_` (`kill targ`) — the spore self-destructs.
3. **Random direction tweaks** — roll `va67` (unused) and `va66` (0–5). With probability `va66 < 2`, reseed `ov10` to a random sign in `[-1, 1]`; with probability `va66 > 4`, flip `ov11` (`mulv ov11 -1`). Snapshot the previous `ov10` into `ov68`.
4. **Wall avoidance** (`subr obst`) — read the obstacle distances. If a wall is within 20 pixels on the right, force `ov10 = -1`; on the left, force `ov10 = 1`; below, force `ov11 = -1`. (Note: the upper edge is intentionally not handled — the spore should be free to drift up.)
5. **Random velocity magnitude** (`subr vect`) — roll `va10` in `[1, 3]` and `va11` in `[1, 2]`.
6. **Apply velocity** (`subr move`) — multiply `va10`/`va11` by the signed `ov10`/`ov11` and call `velo`.
7. **Animation refresh** — clear the current animation and re-arm a 0–5 / 5–0 ping-pong loop based at `ov40`.
8. **Maturation gate** — if `ov01 > 500`, call `subr matr` to attempt spawning a Man-O-War.

### `matr` subroutine — the actual fix

This is where the patched logic lives. Within `inst` (atomic block):

1. Capture the spore's anchor position (`va50 = posl`, `va51 = post`).
2. Use `esee 2 15 17 … next` to count Man-O-War creatures within sight; bump `va66` for each.
3. **Density cap** — if more than three Man-O-Wars are already nearby (`va66 > 3`), set `ov00 = 0` and `stop`. The spore stays alive but won't try again this tick.
4. **Spawn** the Man-O-War with `new: simp 2 15 17 "man-o-war" 44 0 4000`. The new agent is `targ` for the rest of the subroutine.
5. **Configure the new Man-O-War** — disables gravity (`accg 0`), permeability 80 (`perm 80`), 8-tick timer (`tick 8`), attribute mask 195 (visible + mouseable + non-physical defaults), aerodynamics/elasticity/friction tuned for water, behaviour mask 17, and a full set of `ov00`–`ov88` counters / animation offsets that the proper Man-O-War scripts expect (sets up the body-segment animation bases `ov30..ov40`, the lifetime/regen counters, and various behaviour parameters).
6. **The bug fix.** Subtract the new Man-O-War's height from `va51` so the spawn anchor is the top of the body, then test the candidate position with `tmvt va50 va51`:
   - **Position is valid** (`tmvt = 1`) — `mvto va50 va51`, zero out `vely`, and `kill ownr` (the spore is consumed and replaced by the Man-O-War).
   - **Position is invalid** (`tmvt = 0`) — `kill targ` (destroy the just-created, unplaced Man-O-War), reset `targ` back to the spore (`targ ownr`), and reduce its lifetime counter by 10 (`subv ov01 10`). The spore will then retry the maturation a few ticks later instead of leaving a stranded carcass behind.

The other subroutines (`die_`, `obst`, `vect`, `move`) are straight helpers and are unchanged from the original script's intent.

### Removal Script

This script intentionally has no `rscr` block. Patches are sticky — once injected they remain in the scriptorium for the lifetime of the world.

### Impact on Stimulus / Room CA

None directly. The patch only changes movement and spawn logic; it does not write stimuli, modify Room CA, or affect any global game variable. The indirect ecological effect is that Man-O-Wars now actually appear in worlds where the original script silently failed, so any downstream stimulus / CA effects produced by the Man-O-War itself (handled by its own scripts in `man-o-war.cos`) start to occur reliably.
