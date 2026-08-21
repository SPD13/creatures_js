# wysts.cos - Wyst Aquatic Plant Ecosystem

**Source**: `Assets/Bootstrap/001 World/wysts.cos`

## Overview

This script populates the underwater environment with **wysts**, an aquatic plant-like organism that anchors itself on the seafloor, ages through growth stages, and reproduces by releasing drifting **seeds** (spores) that settle, hatch, and spawn a new wyst. Wysts only survive in water rooms (`rtyp = 9`): outside of water they progressively sink (increasing gravity) and eventually die. Their seeds are non-viable on dry land and self-destruct.

At bootstrap, **6 wysts** are spawned at position `(4037, 2060)` and spread via their own movement/obstacle-avoidance logic. Wyst seeds are created dynamically by adult wysts during reproduction — the number (1–3) depends on the local population density (adaptive, anti-overcrowding).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 15 18 | Wyst | `wysts` frame 0 (growing) → 22/44/66 (settled stages) | Aquatic sessile plant; ages, settles, reproduces, dies | [Detail](#wyst-2-15-18) |
| 2 18 16 | Wyst Seed | `wysts` frame 88 | Drifting spore released by adult wysts; hatches into a new wyst on landing | [Detail](#wyst-seed-2-18-16) |

---

## Wyst (2 15 18)

The wyst is an underwater plant-like organism. When young, it drifts around looking for a sheltered spot; once fully surrounded by obstacles (anchored to seabed terrain) it settles permanently and goes through three visible growth stages as it ages. After it is old and mature, it spawns new drifting seeds to propagate, then dies.

### Bootstrap Configuration

6 wysts are created at startup with these common properties:

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Physics + Collisions + Mouseclickable + Carryable + Suffer Collisions |
| `bhvr` | 48 | Creatures can push / pull |
| `elas` | 30 | Moderate bounce |
| `perm` | 100 | Permeable boundaries |
| `accg` | 0 | No gravity (buoyant in water) |
| `aero` | 0 | No air resistance |
| `fric` | 99 | High friction |
| `clac` | -1 | No click action |
| `tick` | 10 | Timer interval |
| Position | `mvto 4037 2060` | All 6 spawned at same point |
| Image count | 92 | Sprite atlas size |
| First image | 0 | Initial pose |
| Plane | `rand 100 5000` | Randomised render plane |

Defaults set at creation:
- `ov01 = 0` (age)
- `ov61 = 30` (CA smell emission)
- `ov70 = 0` (birth trigger flag)

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov01` | Age counter (ticks) | 0 at birth; increments each timer |
| `ov05` | Settlement stage | 0 = juvenile, 1/2/3 = growth stages |
| `ov08` | Seed count at birth | 1–3, based on local density |
| `ov10` | X direction | -3…3 (drift) |
| `ov11` | Y direction | -3…3 (drift) |
| `ov30` | Animation base frame | 0 / 22 / 44 / 66 per growth stage |
| `ov61` | CA smell emission | 30 |
| `ov70` | Birth trigger flag | 0 idle, 1 = spawn seeds this tick |
| `ov86` | Out-of-water age | Counts ticks spent outside rtyp 9 |
| `ov87` | Current gravity value | Increases the longer out of water |
| `ov99` | Carried-death flag | 99 = queued to die once dropped |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 4 | Hit | Empty (no reaction) |
| 9 | Timer | Main behaviour loop: age, settle, drift, reproduce, die |
| 12 | Eaten | Sends stimulus 80 to consumer and destroys itself |

#### Event 9 — Timer (Main Behaviour Loop)

Runs every 10 ticks. Does nothing while carried (`carr <> null`, except when flagged for delayed death).

Top-level flow each tick:
1. `gsub base` — growth-stage state machine.
2. `addv ov01 1` — age up.
3. `gsub room` — water-room check and gravity adjustment.
4. `gsub rndm` — reroll random drift directions.
5. `gsub obst` — obstacle-aware steering.
6. `gsub anim` — direction-aware animation.
7. `gsub move` — apply current velocity.
8. If `ov01 > 700`: `gsub deth` (old age).
9. If `ov01 > 300`: 5% chance (`rand 0 20 = 5`) to set `ov70 = 1` (ready to breed).
10. If `ov99 = 99`: `gsub deth` (carry-delayed death trigger).
11. If `ov70 = 1`: `gsub brth` (reproduce).

**Subroutine `base` (growth stages):**
- `ov01 ≤ 100`: juvenile (`ov05=0`, `ov30=0`).
- `101–200`: if surrounded on all sides (`obst left/rght/_up_/down > 50`), stop (`velo 0 0`), advance to stage 1, set `ov30 = 22`, play anim.
- `201–300`: same surround check, advance to stage 2, `ov30 = 44`.
- `301–400`: same surround check, advance to stage 3, `ov30 = 66`.
Each settlement transition calls `slow` to yield.

**Subroutine `anim` (direction-aware animation):**
- If `ov10 < 0`: set `base ov30`, `frat 5`, play `[0 1 2 3 4 5 6 7 8 9 10 255]` (looping sway).
- If `ov10 > 0`: play `[15 14 13 12 19 18 17 16 22 21 20 15 255]` (opposite sway).

**Subroutine `rndm` (random direction):** rerolls `ov10` and `ov11` uniformly in `-3..3`, ensuring non-zero.

**Subroutine `obst` (obstacle avoidance):**
- Left <50 → `ov10 = rand 1 2`; Right <50 → `ov10 = rand -2 -1`.
- Ceiling <20 → `ov11 = 1`; Floor <20 → `ov11 = -1`.

**Subroutine `move`:** `velo ov10 ov11`.

**Subroutine `deth` (death):** if not carried, `kill ownr`; if carried, set `ov99 = 99` so it dies the next tick when the carry check is re-evaluated.

**Subroutine `brth` (reproduction):**
If fully surrounded (all four `obst` directions > 30):
1. Enumerate other wysts (`esee 2 15 18`) within range 500, counting into `va89`.
2. **Density-based seed count `ov08`**:
   - `va89 > 5` (crowded) → 1 seed.
   - `va89 = 2..5` → `rand 1 2` seeds.
   - `va89 < 2` (sparse) → `rand 1 3` seeds.
3. Record current position (`va80 = posl`, `va81 = post`).
4. Spawn `ov08` wyst seeds (classifier **2 18 16**) at the parent's position: sprite `wysts` frame 88, plane 3000. Each seed is positioned via `tmvt`-tested `mvto`/`mvsf`, with `tick 1`.
5. Retarget self (`targ ownr`) and call `deth` — **the parent wyst dies after reproducing** (monocarpic life cycle).

**Subroutine `vent` (unused):** defined but never invoked. Detects nearby vents (`2 23 11`) within range 500 and steers away (biases `ov10`/`ov11` based on relative position). Appears to be dead / legacy code.

**Subroutine `room` (water-environment check / sinking):**
- If current room type is **not** 9 (water), enter a sinking loop:
  - Increment `ov86` (out-of-water counter).
  - For the first 6 ticks: gravity ramps up `+0.03` per tick.
  - Then ramps `+0.08` per tick up to 200 ticks.
  - `accg ov87` each iteration.
  - Exit loop when back in water (`rtyp = 9`) or `ov86 >= 200`.
- If still dry after 200 ticks: `wait rand 100 400` then `gsub deth` (dies from desiccation).
- If in water (`rtyp = 9`): reset `ov86 = 0`, `ov87 = 0` (buoyant again).

#### Event 4 — Hit

Empty script (`scrp 2 15 18 4 endm`). Wysts do not react to being hit.

#### Event 12 — Eaten

When consumed (fired by another agent targeting the wyst with `mesg writ ... 12`):
1. `targ from` — retarget the consumer.
2. `stim writ from 80 1` — send **stimulus 80** (`STIM_EATEN_PLANT` / palatability feedback) to the consumer.
3. `kill ownr` — destroy self.

---

## Wyst Seed (2 18 16)

Drifting spore released by an adult wyst during reproduction. Floats in water until it touches the seabed, then "hatches" into a full new wyst and removes itself.

> **Note**: Classifier `2 18 16` is shared with other aquatic-launcher scripts (e.g. fish eggs). Script ownership is disambiguated at runtime by the script family/genus/species and the origin of `new: simp`.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Physics + Collisions + Mouseclickable + Carryable + Suffer Collisions |
| `bhvr` | 32 | Activate-2 only |
| `accg` | 1 | Slight gravity (sinks slowly) |
| `aero` | 7 | Moderate drag |
| `elas` | 50 | Moderate bounce |
| `fric` | 99 | High friction |
| `perm` | 75 | Moderately permeable |
| `clac` | -1 | No click action |
| `ov61` | 30 | CA smell emission |
| Image count | 4 | Sprite atlas |
| First image | 88 | Seed sprite |
| Plane | 3000 | Render plane |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Drift / hatch / die-if-dry logic |

#### Event 9 — Timer

1. **Water check**: if `rtyp room ownr <> 9`, `kill targ` (seed dies outside water).
2. In water (`rtyp = 9`): `accg 1` (sinks slowly).
3. **State dispatch on `ov80`**:
   - `ov80 = 0` → `gsub drft` (drifting).
   - `ov80 = 1` → landing sequence:
     - Try up to 40 times to find a spot with `obst left > 15` and `obst rght > 15` (sheltered anchor) while jittering velocity `rand -2..2`.
     - If no spot found within 40 attempts → `kill ownr` (seed fails to settle).
     - Otherwise → `gsub htch`.

**Subroutine `drft` (drift):**
- 1/10 chance each tick to pick one random direction adjustment: `ov11 = -1`/`+1` or `ov10 = -1`/`+1`.
- Then `obst` → `anim` → `move`.

**Subroutine `obst`:**
- `obst 0 < 50` (left) → `ov10 = 1`.
- `obst 1 < 50` (right) → `ov10 = -1`.
- `obst 2 < 50` (up) → `ov11 = 1`.
- `obst 3 < 20` (down / ground contact): `accg 2` and set `ov80 = 1` — **transition from drifting to landing**.

**Subroutine `anim`:** plays `[0 1 2 3 255]`.

**Subroutine `move`:** `velo ov10 ov11`.

**Subroutine `htch` (hatch into new wyst):**
1. Rises for 25 ticks: jitter velocity `rand -3..3` (x) and `rand -1..-5` (y, upward drift), playing the drift animation with `wait 10` between iterations.
2. Records landing position (`va90 = posl`, `va91 = post`).
3. Spawns a new **Wyst (2 15 18)** at `(va90, va91)` with the standard wyst properties (same bootstrap config: attr 199, bhvr 48, elas 30, perm 100, accg 0, aero 0, fric 99; sprite `wysts` 92/0/rand 100 5000).
4. Stores the new wyst reference in `va16` for cleanup.
5. If `tmvt` says the destination is reachable: move the new wyst there, set `ov61 = 30`, `ov01 = 0`, `tick 1`, `slow`, then `kill ownr` (seed consumed).
6. If the destination is unreachable: kill both the new wyst (`targ va16 → kill targ`) and the seed (`kill ownr`), then `stop`.

---

## Removal Script (rscr)

Cleanly uninstalls the wyst ecosystem:
1. `enum 2 15 18 → kill targ` — removes all living wysts.
2. `enum 2 18 16 → kill targ` — removes all wyst seeds.
3. `scrx 2 15 18 9` / `scrx 2 15 18 12` — unregisters wyst Timer and Eaten scripts.
4. `scrx 2 18 16 9` — unregisters wyst-seed Timer script.

*Note: the empty event 4 on wysts is declared but not removed by `scrx` — likely an oversight.*

---

## Stimulus Summary

| Stimulus # | Context | Effect |
|---|---|---|
| 80 | Wyst is eaten (event 12) | Consumer receives plant-eaten feedback |

## Room CA Effects

The wyst script does not directly alter room CA values via `altr`. Its only environmental interaction is reading `rtyp` (room type) to detect whether it is in water (rtyp 9). Its CA smell contribution `ov61 = 30` is emitted by the engine based on the agent's own ambient smell, not via script-driven room modification.

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| Wysts (2 15 18) | `esee` enumeration | Local density check during reproduction (adaptive seed count) |
| Vents (2 23 11) | `esee` in unused `vent` subroutine | Dead code — not currently invoked |
| Any consumer (via `mesg writ … 12`) | Stimulus 80 | Plant-eaten feedback to the eater |
