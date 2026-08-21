# piranha.cos - Piranha Aquatic Predators

**Source**: `Assets/Bootstrap/001 World/piranha.cos`

## Overview

This script implements the piranha predator ecosystem for the aquatic sections of the Creatures 3 world. At bootstrap, 10 piranhas are spawned in a water pool at (2600, 2200). Piranhas swim back and forth, avoid walls, and aggressively feed on any animal, plant, or small critter they encounter — including creatures (family 4). When one piranha bites prey, it sends an alert message to all nearby piranhas that enter a brief feeding frenzy, chasing the victim with high velocity and releasing a toxin cloud (bubbles). A piranha that lands out of water will flop briefly, suffer gravity, and die if stranded for more than ~20 ticks.

Piranhas also slowly reproduce: with a small probability each tick, a piranha will spawn a transient "egg" agent (2 18 22) nearby that hatches into a new piranha, capped at 8 total piranhas + eggs within range. When a piranha consumes a creature, bones (2 10 30) are scattered at the bite location.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 16 3 | Piranha | `jaws` frame 53 | Aquatic predator; hunts and eats most nearby agents | [Detail](#piranha-2-16-3) |
| 1 1 24 | Piranha Bubbles | `pirbubbs` frame 0 | Toxic bubble cloud released when a piranha bites prey; damages creatures and scatters bones | [Detail](#piranha-bubbles-1-1-24) |
| 2 18 22 | Piranha Egg | `jaws` frame 53 (4 images) | Transient reproduction agent; hatches into a new piranha | [Detail](#piranha-egg-2-18-22) |
| 2 10 30 | Bone Fragment | `bone` frame 0 | Leftover debris from consumed prey (shared with Hawk — see Hawk.md) | [Detail](#bone-fragment-2-10-30) |

---

## Piranha (2 16 3)

The main predator agent. Piranhas swim horizontally through water, reverse on wall contact, and continuously scan for edible agents. When they find food they send a message to themselves (1000) to create a bite-bubble cloud at the target and notify neighbouring piranhas.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `jaws` | 53 images, first image 0, plane 1000 |
| Count | 10 | Spawned in a `reps 10` bootstrap loop |
| Position | (2600, 2200) | Underwater spawn location |
| `attr` | 195 | Carryable + Mouseable + Activatable 1 + Activatable 2 + Suffers Collisions |
| `elas` | 50 | Moderate bounce |
| `accg` | 0 | No gravity (water) |
| `aero` | 0 | No air resistance (water) |
| `perm` | 60 | Permeability for wall/room boundary passage |
| `tick` | rand 8–15 | Initial timer interval |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov02` | Life/hunger timer; decrements each tick; death at 0 | 100 at start, +50 on feeding |
| `ov10` | Horizontal swim direction | -1 = left, +1 = right (random non-zero) |
| `ov61` | CA smell emission strength | 50 |
| `ov99` | Out-of-water stranded counter / agitation flag | 0 = in water, ≥1 counts ticks out, set to 20 during frenzy |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main per-tick behaviour (water check, movement, feeding, reproduction) |
| 1000 | User message | Triggered by self on feeding — spawns bubbles and alerts nearby piranhas |
| 1001 | User message | Feeding frenzy — received by nearby piranhas when one of them bites |
| 4 | Hit | Sets agitation flag (`ov99 = 1`) |
| 5 | Pickup | Clears agitation flag (`ov99 = 0`) |

#### Event 9 — Timer (Main Behaviour Loop)

**Out-of-water stranded handling:**
1. If the current room's type is neither 8 (fresh water) nor 9 (salt water):
   - Increments `ov99` (stranded counter), sets `accg 4`, `aero 10`, `vely 3` (sink).
   - Waits 10 ticks, re-checks the room type.
   - If still stranded: plays `"fish"` sound, runs a flopping animation (frames 48–51), waits until `fall` is 0 (hit ground), then applies a small random twitch velocity (velx -5..5, vely -10..-5).
   - If `ov99 ≥ 20`: stops sound, clears animation, waits 30 ticks, destroys self (`kill ownr`).
2. If in a water room: resets `ov99 = 0`, `accg 0`, `aero 0`.

**Reproduction (1 in 20 chance, when not carried):**
1. Counts nearby piranhas (`esee 2 16 3`) and piranha eggs (`esee 2 18 22`).
2. If total ≤ 7: creates a piranha egg (2 18 22) at the current position using `tmvt` to verify the move is valid. The egg will hatch into a new piranha (see [Piranha Egg](#piranha-egg-2-18-22)).

**Wall avoidance:**
- If left obstacle distance < 40 and moving left: reverse direction.
- If right obstacle distance < 40 and moving right: reverse direction.

**Swim animation:**
- Moving left (`ov10 < 0`): velx rand -3 to -2, animation [0..7 loop].
- Moving right (`ov10 > 0`): velx rand 2 to 3, animation [8..15 loop].
- Vertical drift: vely rand -1 to 1.

**Life/hunger countdown:**
- Subtracts 1 from `ov02` each tick. When `ov02 ≤ 0`:
  - Stops movement, plays death animation (frames 48–52).
  - Alters the current room's CA 3 and CA 4 by +0.1 (deposits organic/pollutant).
  - Destroys self.

**Feeding scan (when not carried, if `ov02 < 100` or 1-in-6 chance):**
Uses `etch` (touching enumeration, range 4) to find edible agents. For each category it calls the `feed` subroutine on a hit:

| Target | Filter | Action |
|---|---|---|
| 4 0 0 | Creatures (any species) | Feed |
| 2 13 0 | Any critter except species 5 | Feed |
| 2 14 0 | Any critter | Feed |
| 2 15 0 | Any critter except species 8 | Feed |
| 2 16 0 | Any critter except own species (spcs ≠ 3) | Feed |

**`feed` subroutine:**
1. Clears carry-related attribute bits (`attr &= 829` → strips carryable/collisions on the target).
2. Stops target movement (`stpt`), zero velocity, disables timer.
3. Sends **message 1000** back to the piranha with the target's x-position and reference, plus a random stim count 1–5.

On success the piranha's own 1000 event (below) plays out the bite.

#### Event 1000 — Bite Reaction

Triggered by the piranha's own feeding subroutine. `_p1_` is the bite x-position and `_p2_` is the victim reference.

1. Calculates bubble x slightly left of bite (`va00 = _p1_ - 130`).
2. Selects bubble y:
   - In global map room (posx,posy) 3 → fixed y = 2135 (water surface anchor).
   - Otherwise → current `post - 50` (just above the piranha).
3. Creates a **bubble cloud (1 1 24)** at (va00, va79) — see [Piranha Bubbles](#piranha-bubbles-1-1-24).
4. Sends **message 0** (Activate 1) to the bubble cloud with the victim reference as `_p1_`.
5. Back on the piranha: scans within range 500 for all piranhas (`esee 2 16 3`) and sends each **message 1001** with the bite coordinates — triggering a feeding frenzy in the pack.
6. Sends message 1001 to itself as well (so it also frenzies on its own kill).

#### Event 1001 — Feeding Frenzy

Only runs if `ov99 = 0` (not already frenzying).

1. Sets frenzy timer `va99 = 50` iterations.
2. Adds +50 to `ov02` (feeding extends lifetime).
3. Each iteration rapidly chases target coords (`_p1_`, `_p2_`):
   - If target is to the left: velx rand -12 to -8, attack animation [32..39].
   - If target is to the right: velx rand 8 to 12, attack animation [40..47].
   - Adjusts direction flag `ov10` as needed.
   - Vertical: vely -1 if above target, +1 if below.
4. After 50 iterations: sets `ov99 = 20` (prevents re-entry for a cooldown period — decremented via the normal per-tick logic or by pickup/hit reset).
5. `unlk` releases the script lock so other events can run.

#### Event 4 — Hit

`setv ov99 1` — marks the piranha as agitated / stranded state, disabling frenzy re-entry.

#### Event 5 — Pickup

`setv ov99 0` — clears agitation; allows frenzy and resets out-of-water counter.

---

## Piranha Bubbles (1 1 24)

A short-lived bubble/toxin cloud released whenever a piranha bites prey. The cloud damages nearby creatures, produces bone debris from the victim, and plays feeding sound effects.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `pirbubbs` | 21 images, first image 0 |
| Plane | 8000 | Far background overlay |
| Creator | Spawned by piranha Event 1000 | Carries victim reference via `_p1_` |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Plays bite effect, damages victim, scatters bones, fades away |

#### Event 1 — Activate 1

1. Plays looping sound `"pir2"`.
2. Emits chemical 117 (value 0.5) to every creature (`esee 4 1 0`) within range — this is the piranha bite pain/toxin chemical.
3. Plays a 6-frame "bubble grow" animation [0 0 1 1 2 2 3 3 4 4 5 5], then a 15-frame expansion [6..20].
4. Determines bone count `va80` based on victim (`_p1_`):
   - Family 4 (Creature) → 10 bones.
   - Genus 15 or 16 (large fauna) → 5 bones.
   - Otherwise → 2 bones.
5. Spawns `va80` **bone fragments (2 10 30)** at the bubble position with:
   - sprite `bone`, 12 frames, first image 0, plane 100, attr 199, elas 20, accg 1.
   - velx rand -7..7, vely rand -10..0 (scatter upward and outward).
   - Tumbling animation [0..11].
   - If `tmvt` fails at that location the spawned bone is immediately killed.
6. If the victim is a creature (family 4): calls `dead` on it then `kill targ` — fatal.
7. If the victim is a non-creature agent: just `kill targ`.
8. Waits 50 ticks, plays fade animation [5 4 3 2 1 0], fades out, plays `"burp"` sound, `kill ownr`.

### Stimulus / Chemical Impact

| Chemical | Value | Target | Meaning |
|---|---|---|---|
| 117 | 0.5 | All creatures in range | Pain / bite toxin emitted by the bubble cloud |

---

## Piranha Egg (2 18 22)

A transient reproduction agent. Created by an existing piranha, it plays a hatch sequence via its timer and then creates a new piranha before destroying itself. This is the mechanism by which the piranha population regrows after losses.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `jaws` | 4 images, first image 53 |
| Base/pose | 10 base, pose 3 | Display state |
| `attr` | 192 | Suffers Physics + Collisions |
| `elas` | 0 | No bounce |
| `fric` | 100 | High friction |
| `tick` | 600 | One hatch step every 600 ticks |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Hatching sequence — decrements pose each tick; on pose 0 spawns a new piranha |

#### Event 9 — Timer (Hatch)

1. If `pose > 0`: decrement pose by 1 (advances hatch animation).
2. If `pose == 0`:
   - Calculates nearby spawn coords (`va00 = posl - 16`, `va01 = post - 20`).
   - Uses a loop with `tmvt` to find a valid adjacent cell (shifts +1 in x until movable, up to 32 tries).
   - If a valid slot is found: creates a new **piranha (2 16 3)** with the same configuration as bootstrap (attr 195, elas 50, perm 60, ov10 rand ±1, ov02 100, ov61 50, tick rand 8–15) at the found coordinates.
   - If no valid slot: `kill targ` (new piranha killed immediately).
   - Destroys self (`kill ownr`) in either case.

---

## Bone Fragment (2 10 30)

Bone debris scattered when a piranha bites a large victim. This classifier is shared with other scripts (see `Hawk.md`). The piranha script contributes its own timer behaviour for bones that land on a surface.

### Scripts Defined Here

| Event # | Event Name | Description |
|---|---|---|
| 6 | Collision | Fires on `wall eq down`: picks a random pose (0–2) and sets a long tick (300–600) |
| 9 | Timer | Decay logic — after resting, deposits organic matter into the room CA and destroys self |

#### Event 6 — Collision

When the bone hits a downward wall (ground):
1. Sets a random pose 0–2 for visual variety.
2. Sets `tick` to a random value 300–600 (bone rests for several seconds before decaying).

#### Event 9 — Timer (Decay)

Two-stage decomposition:

1. **Stage 0 (`ov00 = 0`, just landed):**
   - If the bone is no longer falling (`fall eq 0`): set `ov00 = 1`, tick rand 300–600, pose rand 0–2.
2. **Stage 1 (`ov00 = 1`, decaying):**
   - If the bone is in a valid room (`room ≠ -1`) and not carried:
     - Alter room CA 3 by +0.01 (nutrient / organic matter).
     - Alter room CA 4 by +0.1 (organic deposit).
     - `kill ownr`.

### Room CA Impact

| CA Index | Change | Meaning |
|---|---|---|
| 3 | +0.01 | Nutrient/organic increase on decay |
| 4 | +0.1 | Organic/detritus increase on decay |

---

## Removal Script (rscr)

The removal script cleanly uninstalls the piranha ecosystem:

1. Kills all piranhas (`enum 2 16 3 → kill targ`).
2. Kills all active bubble clouds (`enum 1 1 24 → kill targ`).
3. Kills all unhatched piranha eggs (`enum 2 18 22 → kill targ`).
4. Removes scripts: `scrx 1 1 24 1` (bubbles Activate), `scrx 2 16 3 9` (piranha Timer), `scrx 2 16 3 6` (legacy), and `scrx 2 10 30 6` (bone collision defined here).
5. Kills any bone fragments left (`enum 2 10 30 → kill targ`) — this is defensive cleanup of the shared bone classifier.

Note: the piranha removal script only uninstalls scripts it defined (or that overlap with its creations). Bones are a shared classifier (also created by the Hawk script); removing piranha.cos will delete bones currently in the world but the Hawk ecosystem can recreate them.

---

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 4 0 0 (Creatures) | Feed via `etch`, bite via bubble | Piranhas attack and kill creatures; bubble emits chemical 117 (pain) |
| 2 13 0 / 2 14 0 / 2 15 0 / 2 16 0 | Feed via `etch` | Piranhas eat most small critters (except their own species) |
| 1 1 24 (Bubbles) | Spawn on bite | Created by piranha Event 1000 to damage prey and scatter bones |
| 2 10 30 (Bones) | Spawn on creature kill | Created by bubbles when a creature is consumed |
| 2 18 22 (Eggs) | Spawn on reproduction | Created by piranha Timer to regrow population |
