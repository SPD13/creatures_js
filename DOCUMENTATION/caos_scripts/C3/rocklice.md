# rocklice.cos - Rocklice & Kobold Cave Ecosystem

**Source**: `Assets/Bootstrap/001 World/rocklice.cos`

## Overview

This script installs the rocklice / kobold cave ecosystem. At bootstrap, an invisible controller agent (classifier 1 1 127) is placed at (1888, 2070) to continuously monitor and repopulate the cave. The controller spawns 6 rocklice (2 16 6) at (1500, 2050) on installation. Each subsequent run of the controller's timer tops up the rocklice population to a minimum of 3 and the kobold (2 16 7) population to a minimum of 1 within an 800 unit range.

Rocklice are small ground-dwelling critters that roam, sleep, trap nearby critters to eat them, and periodically lay egg-like baby rocklice (2 18 13). When a rocklice dies it becomes a transient bone/corpse agent (2 10 32) that enriches the room's organic chemistry before disappearing. The kobold is installed here but its behaviour is defined elsewhere — this script only spawns one on demand with rocklice-compatible defaults.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 127 | Rocklice Population Controller | `blnk` frame 0 | Invisible repopulation spawner for rocklice and kobolds | [Detail](#rocklice-population-controller-1-1-127) |
| 2 16 6 | Rocklice | `rocklice` frame 94 | Roaming cave critter; sleeps, hunts, lays eggs | [Detail](#rocklice-2-16-6) |
| 2 16 7 | Kobold | `kobold` frame 0 | Spawn entry only — topped up by the controller (behaviour defined elsewhere) | [Detail](#kobold-2-16-7) |
| 2 18 13 | Baby Rocklice / Egg | `rocklice` frame 17 | Transient hatching agent — grows into a new rocklice or dies | [Detail](#baby-rocklice--egg-2-18-13) |
| 2 10 32 | Rocklice Corpse | `rocklice` frame 21 | Dead rocklice; enriches room CA then vanishes | [Detail](#rocklice-corpse-2-10-32) |

---

## Rocklice Population Controller (1 1 127)

An invisible anchor agent placed at (1888, 2070) whose only job is to keep the cave populated. It uses `rnge 800` to count nearby rocklice and kobolds, and spawns new ones on its timer (event 9) whenever counts fall below the thresholds (3 rocklice, 1 kobold).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `blnk` | 2 images, first image 0, plane 0 |
| Position | (1888, 2070) | Anchor in the cave room |
| `attr` | 0 | Invisible, non-interactive |
| `accg` | 0 | No gravity |
| `perm` | 0 | No collision permeability needed |
| `tick` | 400 | Repopulation check every 400 ticks |
| `ov72` | 2120 | Cached anchor x used by spawned rocklice |
| `ov73` | 550 | Cached anchor y used by spawned rocklice |

On installation, after placing the controller, the bootstrap script runs `reps 6` to immediately spawn 6 rocklice at (1500, 2050) with an initial scatter velocity.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Counts nearby rocklice and kobolds; creates new ones if below threshold |

#### Event 9 — Timer

1. `inst` + `rnge 800`; enumerate nearby rocklice (`esee 2 16 6`) into `va00`.
2. If `va00 < 3`: create a new **rocklice (2 16 6)** at (1888, 2070) with full default state (see [Rocklice](#rocklice-2-16-6)).
3. Reset `va00`; count nearby kobolds with `enum 2 16 7`.
4. If `va00 < 1`: create a new **kobold (2 16 7)** at (1888, 2050) with default state.

---

## Rocklice (2 16 6)

The main critter. Rocklice roam on the ground, randomly fall asleep and wake, and when they encounter small critters (genus 13 or 14 except their own species) they "trap" them — sending an Eat message and draining nutrition from the prey. Well-fed rocklice lay eggs (baby rocklice, 2 18 13) nearby after roaming long enough. They die if their life counter `ov01` exceeds 1100, producing a corpse.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `rocklice` | 94 images, first image 0, plane 2500 |
| Count | 6 (initial) + topped up by controller | |
| `attr` | 195 | Carryable + Mouseable + Activatable 1 + Suffers Collisions |
| `elas` | 10 | Low bounce |
| `accg` | 2 | Gravity |
| `aero` | 0 | |
| `fric` | 70 | High friction |
| `perm` | 60 | Wall permeability |
| `bhvr` | 17 | Activatable / grab / touch |
| `tick` | 8 | Fast per-tick behaviour |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Behaviour state | 0 = roam, 1 = bury egg, 2 = trapping prey, 97 = go to sleep, 98 = wake up |
| `ov01` | Age / life timer | Incremented each tick; death at > 1100 |
| `ov02` | Energy / fed counter | Decrements each tick; refilled by feeding |
| `ov05` | (unused flag) | 2 |
| `ov06` | Random init jitter | rand 0–1 |
| `ov10` | Horizontal direction | ±1 |
| `ov11` | Vertical direction | -1 |
| `ov16` | Current prey target (agent ref) | null when none |
| `ov20` | Roam timer | Reset when laying an egg |
| `ov30-ov41` | Base-frame lookup table for animations | Roam, sleep, wake, etc. |
| `ov61` | CA smell emission | 70 |
| `ov72` | Feed energy gain on bite | 400 |
| `ov73` | Trap energy gain | 400 |
| `ov74` | Full-up threshold | 800 |
| `ov75` | (unused) | 1 |
| `ov80` | Jump/leap flag | 1 when leaping |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Writes stim 88 value 1 to the activating agent |
| 12 | Eat | Writes stim 80 value 5 to the requestor (food-consumed stim) |
| 9 | Timer | Main behaviour loop — roam, sleep, trap, bury, die |
| 6 | Collision | Ground impact when leaping — plays landing animation and flips direction |

#### Event 1 — Activate 1

`stim writ from 88 1` — delivers stimulus 88 (value 1) to whoever activated the rocklice.

#### Event 12 — Eat

`stim writ from 80 5` — delivers stimulus 80 (value 5) to the source of the Eat message. This is the rocklice acknowledging being eaten / providing a food stim.

#### Event 9 — Timer (Main Behaviour)

Per-tick state machine. Key steps in order:

1. **Life tick (when not trapping, `ov00 ≠ 2`):** `ov01 += 1`, `ov02 -= 1`.
2. **Roam counter:** `ov20 += 1`.
3. **Death:** if `ov01 > 1100` call `die_` (destroys self and spawns a [Rocklice Corpse (2 10 32)](#rocklice-corpse-2-10-32)).
4. **Hunger transition:** if `ov02 < ov72` (400) and not trapping, enter state 1 (lay egg / bury — triggers when not carried).
5. **Random sleep:** 1-in-1001 chance per tick, set state 97.
6. State dispatch:
   - `ov00 = 97` → `slep` subroutine: plays burrow-down animation (bases 35, 36), sets `ov00 = 98`, reschedules `tick rand 50–500`, stops.
   - `ov00 = 98` → `wake` subroutine: plays emerge animation (base 38), resets `ov00 = 0`, `tick 8`, `attr 195`, stops.
7. **Roam state (`ov00 = 0`):**
   - If `ov20 > 800` and no downward obstacle → call `layg` (lay egg sequence).
   - Otherwise call `roam`.
8. **Trap state (`ov00 = 2`):** call `trap` (drain energy from nearby critters).
9. **Bury state (`ov00 = 1`) when not carried:** call `bury` (sink into the ground), else reset to state 0.

##### Subroutine `die_` — Death

1. Records current position (va50/va51) and direction (va52).
2. Creates a **Rocklice Corpse (2 10 32)** with `accg 2`, `elas 0`, `fric 80`, `tick 4`, `attr 192`, inheriting direction.
3. Sets corpse's animation based on its direction (base 0 or base 10 with frames 0–6).
4. Validates the corpse position with `tmvt`; if invalid, kills both the corpse and the original rocklice.
5. Moves corpse to position, zeros its vely, kills the original rocklice.

##### Subroutine `slep` — Sleep

`attr 192` (removes carryable), plays drill-down sound `"rdrl"`, plays base 35 (9-frame loop twice) then base 36 (10-frame). Sets state 98, `tick rand 50–500`, stops.

##### Subroutine `wake` — Wake Up

Plays base 38 (9 frames), sets state 0, `tick 8`, `attr 195`, stops.

##### Subroutine `layg` — Lay Egg

1. Computes spawn coords 32 units above current position.
2. Counts nearby rocklice (`esee 2 16 6`) within range 600.
3. If `va66 ≤ 3`: creates a **Baby Rocklice (2 18 13)** at computed coords with `attr 195`, `bhvr 16`, `tick 10`, plane 4100, and placement-validated via `tmvt`.
4. If `va66 = 0` (isolated): does a `reps 2` loop to spawn two babies.
5. Each failed placement (`tmvt ≠ 1`) kills the newly spawned baby.
6. Returns to roam: calls `vect` + `anim` + `move` subroutines, resets `ov70`, `ov00`, `ov20` to 0.

##### Subroutine `roam` — Roam

Runs only if `obst down < 10` (there is ground). With random chance:
- Occasional leap: sets `ov80 = 1`, base 32 jump animation, `velo rand -20..20, -30`.
- Random direction flip: `ov10 = rand -1..1` or force `-1` on the "right side" branch.
- If obstacle distance is modest (`< 5`), runs `vect` + `anim` + `move`; otherwise just flags a leap.

##### Subroutine `trap` — Trap Prey (state 2)

1. Uses `etch` (touching) to find agents of family 2 genus 13 or genus 14 (small critters).
2. On hit: plays base 37 attack animation, sends **message 12 (Eat)** to the victim with `wrt+` (passing the rocklice as sender), adds `ov73` (400) to `ov02` (energy), locks the script, `slow`s, then waits.
3. If `ov02 > ov74` (800) — well fed: plays base 38 emerge animation, resets state to 0, `attr 195`, stops.

##### Subroutine `bury` — Bury Into Ground (state 1 → state 2)

Locks script, `attr 192`, plays `"rdrl"` drill sound, burrow animations (bases 35, 36), sets state 2 (trap), unlocks. This puts the rocklice into its trap-mode underground.

##### Subroutine `gfod` — Get Food (hunting, currently unreferenced from dispatch)

Searches for genus 14 or 13 prey, calls `hunt` to chase, and `near` to detect contact. When in contact: sends **message 12 (Eat)** to the prey via `writ`, gains `ov72` energy; when full, returns to state 0.

##### Helper subroutines

- `vect` — randomises movement scalars `va10/va11`.
- `anim` — picks walk animation base (30 for left, 31 for right).
- `move` — applies direction × scalar to velx/vely.
- `find` — finds nearest agent of classifier (va47, va48, va49) using squared distance; stores in `ov16`.
- `hunt` — adjusts direction toward stored target `ov16`.
- `near` — sets `va40 = 1` if target is within a 10-unit box.
- `dril` — combined burrow-down + wait + burrow-up animation (not called by dispatch).

#### Event 6 — Collision

Runs only if `obst down ≤ 5` (landing on ground) and `_p2_ > 5` (significant impact). Plays `"rckl"` landing sound and reverse-direction animation (base 32 frames 4→0). Sets `ov10` toward the direction of impact based on `_p1_`. Clears `ov80`.

### Stimulus Impact

| Stimulus | Value | Trigger |
|---|---|---|
| 88 | 1 | Event 1 (Activate 1) — written to activator |
| 80 | 5 | Event 12 (Eat) — written to eater (positive food stim) |

---

## Kobold (2 16 7)

Spawn entry only. The controller creates one kobold on its timer when no kobold exists within range 800. This script defines **no** event scripts for the kobold — its behaviour is defined by another script file.

### Bootstrap Configuration (set by controller on spawn)

| Property | Value |
|---|---|
| Sprite | `kobold` (frame 0, plane 4000) |
| Position | (1888, 2050) |
| `attr` | 195 |
| `elas` | 5 |
| `accg` | 4 |
| `aero` | 5 |
| `fric` | 10 |
| `tick` | 4 |
| `ov02` | 401 |
| `ov61` | 95 (CA smell) |
| `ov30-ov39` | Animation base table (0, 12, 42, 52, 24, 33, 62, 74, 86, 99) |

### Events

No events are installed by this script for the kobold classifier.

---

## Baby Rocklice / Egg (2 18 13)

A transient hatching agent created by `layg`. It counts down a few ticks, optionally hatches into a new rocklice (2 16 6), and disappears.

### Bootstrap Configuration (set on creation by rocklice `layg`)

| Property | Value | Notes |
|---|---|---|
| Sprite | `rocklice` | First image 17, plane 4100 |
| `attr` | 195 | |
| `elas` | 5 | |
| `fric` | 20 | |
| `accg` | 2 | |
| `perm` | 60 | |
| `bhvr` | 16 | |
| `tick` | 10 | |
| `ov02` | 255 | Life counter |
| `ov61` | 30 | |
| `ov70` | 0 | |
| `ov90` | 0 | Hatched flag |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Hatching countdown; spawns a new rocklice and dies |
| 12 | Eat | Writes stim 80 value 2 to eater, then `kill ownr` |

#### Event 9 — Timer (Hatch)

1. If `posx < 0 or posy < 0` → `kill ownr` (stray off-map egg).
2. `ov01 += 1`. For the first 5 ticks, `pose ov01` (advance hatch animation).
3. Count nearby rocklice (`esee 2 16 6`) within range 600 → `va66`.
4. **Hatch (once, at `ov01 ≥ 20`):** if not carried, and `va66 < 3`, and `ov90 = 0`:
   - Plays base 6 crack animation [0..6].
   - Computes spawn coords 25 units above.
   - Creates a new **Rocklice (2 16 6)** with all default properties (attr 195, bhvr 17, plane 2500, tick 8, `ov02 = 600`, etc.).
   - Validates placement via `tmvt`; on failure `kill targ` on the new rocklice; on success `mvto` and sets `ov90 = 1` on the egg (prevents re-hatch).
5. **Final decay (`ov01 ≥ 60`, not carried):** plays base 12 closing animation [0 1 2], `kill targ`.

#### Event 12 — Eat

`stim writ from 80 2` (food reward of value 2 to eater) followed by `kill ownr` — the egg is consumed.

### Stimulus Impact

| Stimulus | Value | Trigger |
|---|---|---|
| 80 | 2 | Event 12 (Eat) — written to eater |

---

## Rocklice Corpse (2 10 32)

A short-lived corpse / debris agent created on rocklice death. It plays a brief animation, deposits organic matter to the room's chemistry, then vanishes.

### Bootstrap Configuration (set on creation by rocklice `die_`)

| Property | Value | Notes |
|---|---|---|
| Sprite | `rocklice` | First image 21, plane 2000 |
| `attr` | 192 | Non-carryable, Suffers Collisions |
| `elas` | 0 | |
| `fric` | 80 | |
| `accg` | 2 | |
| `aero` | 0 | |
| `tick` | 4 | |
| `ov10` | Inherited direction | -1 or +1 |
| `ov61` | 30 | |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Counts up; alters room CA; destroys self |

#### Event 9 — Timer

1. `ov01 += 1`.
2. If `ov01 > 40`:
   - Branches on `ov01 <= 0` / `ov01 > 0` (the first branch is unreachable given the ordering — effectively only the second applies).
   - Chooses base 0 vs 10 animation [7 8 9] for a quick end-frame.
   - If the corpse is in a valid room (`room targ ≠ -1`) and not carried:
     - `altr room targ 3 0.2` — deposits nutrient/organic (CA 3).
     - `altr room targ 4 0.2` — deposits organic/detritus (CA 4).
   - `kill targ` — removes the corpse.

### Room CA Impact

| CA Index | Change | Meaning |
|---|---|---|
| 3 | +0.2 | Nutrient / organic enrichment on decay |
| 4 | +0.2 | Organic / detritus enrichment on decay |

---

## Removal Script (rscr)

Cleanly uninstalls the ecosystem:

1. `enum 2 16 6 → kill targ` — removes all rocklice.
2. `scrx 2 16 6 9` and `scrx 2 16 6 6` — removes Timer and Collision scripts.
3. `enum 2 10 32 → kill targ` — removes all corpses.
4. `scrx 2 10 32 9` and `scrx 2 10 32 6`.
5. `enum 2 18 13 → kill targ` — removes all eggs.
6. `scrx 2 18 13 9` and `scrx 2 18 13 6`.
7. `enum 1 1 127 → kill targ` — removes the invisible controller.
8. `scrx 1 1 127 9` — removes the controller timer.

Note: the kobold (2 16 7) is **not** cleaned up by this script because its installation/removal is owned by a different script (kobold.cos).

---

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 13 0 / 2 14 0 (small critters) | `etch` in `trap` | Sends Eat (12) to prey, drains their energy |
| 2 16 7 (Kobold) | Spawn via controller | Controller tops up kobold count to ≥ 1 (behaviour defined elsewhere) |
| Room CA 3 / CA 4 | Altered by corpse decay | +0.2 each on death — completes the rocklice nutrient cycle |
