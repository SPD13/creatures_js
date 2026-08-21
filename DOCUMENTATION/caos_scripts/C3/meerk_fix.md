# Meerk Fix

**Source file:** `Assets/Bootstrap/001 World Patches/meerk_fix.cos`

## Overview

This is a **patch** bootstrap from the `001 World Patches` directory. It does not create any agents at install time and does not modify the map. It replaces the **Timer event (script 9)** of the existing meerk agent (classifier `2 15 23`) to fix two issues called out by the header comment:

> Fixes a bug where meerks could be picked up mid-burrow and moves their burrow spot to less visible coordinates.

The two practical changes baked into the new timer are:

1. **Burrow is now atomic and unpickable.** The `dig_` subroutine starts with `lock`, immediately bails (`stop`) if the meerk is mid-fall or already being carried (`carr ne null`), and clears the agent attributes (`attr 0`) for the duration of the burrow. Together these guarantee the burrow animation runs to completion without being interrupted by pickup, drop, or fall events.
2. **Hidden burrow rendezvous coordinates.** While the meerk plays its disappear-into-the-ground animation, a placeholder simp `1 1 8` is spawned at the burrow site as a re-emergence marker, and the meerk itself is teleported to `(4145, 1252)` — an out-of-the-way world location chosen to be off the player's normal viewing area. When the timer next fires in state 5, the meerk reads back the placeholder's position, jumps back, restores its attributes, plays the rise animation, and the placeholder is killed.

The script also retains the meerk's full state-machine: idle/random behaviour (`ov00 = 0`), resurfacing (`ov00 = 5`), dying (`ov00 = 9`), foliage eating (via `etch 2 13 9`) and energy regeneration. Those parts are not bug fixes — they ship with the patch because `scrp` replaces the entire script body, not a delta.

There is no `rscr` removal block — patches are sticky for the lifetime of the world.

> Note: the script header line is `scrp 2 15 23 9"` — the trailing double-quote is a stray character in the original script. CAOS parsers tolerate it because the rest of the line still parses as a `scrp` directive for classifier `2 15 23`, event `9`.

## Modified Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 2 15 23 | Meerk (Timer event 9 only) | A small mammal critter that wanders the desert, eats foliage, burrows, and dies leaving CA imprints. Patch makes burrowing safe from pickup and relocates the burrow rendezvous off-screen. | [Details](#agent-2-15-23-meerk-timer-patch) |

---

## Agent 2 15 23: Meerk (Timer patch)

The meerk (`2 15 23`) is a desert critter installed by `meerk.cos` (under "Norn Meadow" / "Ettin Desert" content). It walks, sits, runs, burrows underground, occasionally eats nearby foliage, and eventually dies — at which point it adds organic matter and a smell signature to the room CA. This patch only swaps its Timer event handler.

### Agent Variables Referenced by the Patch

| Variable | Purpose |
|---|---|
| `ov00` | Behavioural state. `0` = idle/random, `5` = resurfacing from a burrow, `9` = dying. |
| `ov02` | Energy / lifetime counter (decremented every tick). When `≤ 0` the meerk transitions to dying (`ov00 = 9`). |
| `ov10` | Facing sign (-1 = left, otherwise right). Used to pick the matching animation row. |
| `ov17` | Cached agent reference of the burrow placeholder (`1 1 8`) created during `dig_`. |
| `ov90` | Aging / decay flag — when non-zero the meerk does **not** transition into dying even if `ov02` runs out (handled outside this patch). |
| `va00` / `va01` / `va02` | Scratch values — pose/anim selectors and position snapshots. |
| `va99` | Cached `targ` reference, used for the food (`etch 2 13 9`) and the placeholder (`1 1 8`). |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Per-tick state machine (random behaviour, eating, burrow, resurface, dying) |

### Event 9 - Timer (the patched script)

The script reasserts a constant tick rate (`tick 8`) and then runs through a cascade of guards and state branches.

1. **Carry / fall guards** — if `carr ≠ null` (something is holding the meerk) or `fall ≠ 0` (it is mid-fall), `stop` immediately. No state changes occur until physics settles.
2. **Energy drain** — `subv ov02 1`.
3. **Dying state (`ov00 = 9`)** — if the death pose hasn't fully advanced (`pose < 9`) bump the timer to `tick 600` so the death sequence plays slowly, call `dead`, and `stop`. The `dead` subroutine handles the per-tick pose advance and the room-CA effect (see *Impact* below).
4. **Trigger death** — if `ov02 ≤ 0` and `ov90 = 0` (not the special longevity flag), zero the velocity, play the appropriate face-up dying animation (rows 70–78 left, 82–90 right), set `ov00 = 9` and switch to the slow death tick.
5. **Idle / random branch (`ov00 = 0`)**:
   - **Hunger / opportunistic eat** (when `ov02 ≤ 200`) — `etch 2 13 9` (find any 2 13 9 plant inside the touch volume). If one exists, freeze it (`tick 0`, `velo 0 0`), call `eat_` (eat animation), `kill va99` to consume the plant, add 50 energy (`addv ov02 50`), and play the `rise` animation.
   - **Random behaviour** — roll `va00 = rand 0 5`:
     - `0` → if not being carried, `dig_` (burrow); otherwise `sit_`.
     - `1` → `sit_`.
     - `2` → flip facing (`negv ov10`).
     - `3` → `run_`.
     - `4` → run `push` three times (a charging bounce).
     - any other → `walk`.
6. **Resurface (`ov00 = 5`)** — handles the back-from-burrow transition. Read the cached placeholder (`ov17`); if it is null, `kill ownr` (the meerk had no rendezvous and is removed). Otherwise:
   - Snapshot the placeholder's `posl/post`, `mvto` back there.
   - Apply a small upward kick (`velo 0 -10`), restore the foreground plane (`plne 2000`) and the visible attribute set (`attr 194`), then return to idle (`ov00 = 0`).
   - Play the rise animation (`58–63` if facing left, `64–69` if right), `over` (wait for it to finish), and finally `kill ov17` to clean up the placeholder. End with a `run_` to scoot away from the burrow site.

### Subroutine notes

- **`walk` / `run_`** — apply the matching animation row and a velocity (`-5 / +5` for walk, `-9 / +9` for run). Both bail out if `fall = 1`.
- **`sit_` / `stnd`** — zero velocity and play the sit / stand animation. `stnd` is currently dead code (never called by the dispatcher in the patched script) but is kept for parity with the original.
- **`dead`** — bails on `fall`. Kills the placeholder if any, then `altr room targ 4 0.4` and `altr room targ 3 0.2` — modifies the room CA channels 4 (food / organic matter) by +0.4 and 3 (probably stink / decay smell) by +0.2 per dying tick. Advances the death pose by one each tick until `pose ≥ 11`, at which point the meerk is removed (`kill ownr`).
- **`eat_` / `rise` / `push`** — animation-only helpers played by the eating branch.
- **`dig_` (the patched fix)** — wraps the burrow sequence in `lock`, bails on `fall = 1` or being carried, sets `attr 0` (untouchable), drops to plane 10 (foreground), plays the burrow animation (`114–128` left, `129–143` right), and `over`s to wait. Inside an `inst` block it captures the meerk's current position, spawns the placeholder `new: simp 1 1 8 "meerk" 1 va00 11` exactly there (`mvto va01 va02` on the new agent), stores the placeholder reference in `ov17`, sets `ov00 = 5` (resurface state), pose 144 (the underground pose), and finally `mvto 4145 1252` — the off-screen burrow rendezvous coordinates. The timer is randomised between 100 and 300 ticks before the next resurface attempt.
- **`b_up`** — reverse-burrow animation; not called from the dispatcher in the patched script but kept for parity.

### Removal Script

This script intentionally has no `rscr` block. Patches are sticky — once injected they remain in the scriptorium for the lifetime of the world.

### Impact on Stimulus / Room CA

Two CA effects, both inherited from the original meerk behaviour but reasserted by this patch (because the whole event-9 body is replaced):

- On every dying tick, the meerk's current room receives `+0.4` to CA channel `4` and `+0.2` to CA channel `3` via `altr room targ 4 0.4` / `altr room targ 3 0.2`. These typically correspond to the "food / organic matter" and "stink" channels; the result is a small, sustained smell-and-fuel deposit at the meerk's death location until the body fully decays.
- The patch itself does not write any stimuli. Standard creature stimulation around the meerk (eat, see, smell) flows through the meerk's other scripts (registered by the original `meerk.cos`).
