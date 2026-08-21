# pumperspikel.cos - Pumperspikel Falling Fruit Plant

**Source**: `Assets/Bootstrap/001 World/pumperspikel.cos`

## Overview

This script installs the **Pumperspikel**, an aerial "fruit" plant that grows in mid-air near the ceiling of a room, ripens, falls, and bursts into bouncy seeds when it hits the ground. Five pumperspikel fruits are spawned at bootstrap high in the upper part of the world (x 2820–3320, y 130–200). Each fruit cycles through a growth animation, eventually becoming ripe and edible. Gravity (`accg 4`) is applied from the start, but a low permeability (normally `perm 10`, occasionally `perm 60` for a "bouncier" variant) keeps them pinned to the ceiling/wall structure until they detach.

When a fruit finally lands on the ground (`wall eq 3` — collision with the floor), it plays a splat sound, animates an impact, and spawns 2 or 5 small **seed** agents (classifier `2 3 5`) that scatter with random velocity and gravity. The parent plant then respawns a new fruit at a random ceiling location (consuming the original fruit). Each seed bounces around, accumulates a time counter, and once "aged" (counter ≥ 20) it fertilises the room by increasing Room CA 3 and CA 4 by 0.01, then removes itself. Seeds can also be eaten by creatures (family 4), delivering stimulus 77 with intensity 3 (nutrition/satisfaction).

This agent contributes to the world ecosystem as a slow but steady source of **Room CA 3 and CA 4** (nutrient/food-chain chemicals) in the areas where the fruits fall.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 8 3 | Pumperspikel Fruit | `pumperspikel` 21 images, plane 25 | Aerial fruit that grows, ripens, falls and shatters on landing | [Detail](#pumperspikel-fruit-2-8-3) |
| 2 3 5 | Pumperspikel Seed | `pumperspikel` 9 images from 21, plane 10 | Bouncy seed scattered on landing; fertilises Room CA 3 & 4, edible by creatures | [Detail](#pumperspikel-seed-2-3-5) |

---

## Pumperspikel Fruit (2 8 3)

The main plant agent. Each fruit starts at `pose 0`–`10` (random) near the ceiling and progresses its pose by one frame each timer tick until it reaches pose 11 (ripe/fallen form). At pose 10 the attribute flags are changed to `83` (adds carryable/mouseable bits so creatures can pick it up); at pose 11 the attribute becomes `195` adding full physics behaviour so it responds to gravity and falls.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `pumperspikel` | 21 images, first image 0, plane 25 |
| Count | 5 | Spawned in a `reps 5` bootstrap loop |
| Position | `mvto rand 2820 3320 rand 130 200` | Upper region of the world |
| `attr` | 80 | Suffer Collisions + Suffer Physics (base flags; amended on growth) |
| `accg` | 4 | Low gravity |
| `elas` | 0 | No bounce |
| `perm` | 10, or 60 if `ov30 = 5` | 1-in-5 fruits get `perm 60`, matching a rarer "seed type" (see `ov30`) |
| `pose` | rand 0 10 | Randomised starting growth frame |
| `tick` | rand 200 800 | Timer interval for growth |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Ripe/fallen flag | 0 = still growing, 1 = reached pose 11 (fallen form, growth stops) |
| `ov30` | Fruit sub-type | `rand 1 5`; value 5 marks the rarer high-permeability variant, passed on to seeds as `va30` |
| `ov70` | Scratch register used to compute next pose | — |
| `ov61` (on seeds) | Seed plane offset | Set to 20 |
| `ov99` (on seeds) | Age counter | Increments each timer tick; at ≥ 20 the seed fertilises room and dies |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 4 | Pickup | Forces attribute bit 128 (suffer physics) on when the fruit is picked up |
| 6 | Collision | Fires on `wall eq 3` (landing on the floor): plays splat, spawns 2 or 5 seeds, respawns a new fruit at the ceiling, destroys itself |
| 9 | Timer | Growth state machine: advances pose until 11; updates `attr` at pose 10 and pose 11 |

#### Event 4 — Pickup

When a creature (or the pointer) picks up the fruit, the script reads the current `attr`, ORs in bit `128` (suffer physics), and writes it back. This ensures the fruit will obey physics and fall properly once released, even if it had not yet ripened to pose 11.

#### Event 9 — Timer (Growth)

Only runs while `ov00 = 0` (fruit has not yet fallen):

1. If current `pose < 11`: increment pose by 1 (`ov70 = pose + 1; pose ov70`).
2. If the new pose equals 10 and `attr = 80`: change `attr` to `83` — the fruit becomes ripe (gains carryable/mouseable bits so a creature or the hand can grab it).
3. Otherwise (pose already ≥ 11): force pose to 11, change `attr` to `195` (full physics flags) if not already, and set `ov00 = 1` so the growth logic stops firing.

The end result is a gradual grow-in animation (0 → 10 while hanging), a ripe state at pose 10, and a final "dropped" state at pose 11 where the fruit is now subject to physics and will fall under gravity.

#### Event 6 — Collision (Landing)

Triggered on `wall eq 3` (the floor). The fruit shatters:

1. Plays sound `splt` and animation `[12 13 14]`.
2. Uses `over` to wait for the animation to complete.
3. Saves current position to `va00`/`va01` and fruit sub-type to `va30`.
4. Switches to `inst` (instant execution) to atomically spawn seeds.
5. Counts existing seeds in the world: if `totl 2 3 5 < 10`, spawns 5 seeds; otherwise only 2. This caps the total seed population to keep the world manageable.
6. For each seed spawned:
   - `new: simp 2 3 5 "pumperspikel" 9 21 10` — 9 sprite frames starting at image 21, plane 10.
   - `attr 199` (carryable, mouseable, activate1, activate2, suffer collisions, suffer physics), `accg 5`, `bhvr 48`, `elas 50`, `fric 90`.
   - `perm 10` by default, or `perm 60` if the parent had `ov30 = 1`.
   - Positions the seed at the parent's location (`mvsf`/`mvto` depending on `tmvt` safety check).
   - Applies scatter velocity: `vely rand -20 -5` (upward), `velx rand -10 10` (horizontal).
   - Randomised `tick rand 200 600`, plays animation `[0 1 2 3 4 5 6 7 8]`, sets `ov61 = 20`.
   - Emits **CA 7** at intensity 0.5 into the room (see stimulus summary).
7. Plays `slow` then animation `[15 16 17 18 19 20]` on the original fruit, `over` waits.
8. Spawns a brand-new fruit at a random ceiling position via the same logic as the bootstrap loop:
   - `new: simp 2 8 3 … 21 0 25`, `attr 80`, `accg 4`, `elas 0`, new `ov30`, adjusted `perm`, `mvto rand 2820 3320 rand 130 200`.
   - If `tmvt` reports the target spot is invalid, `kill targ` is called instead (no respawn).
   - Otherwise if the replacement is successfully placed and is inside a valid room (and not carried), it increases **Room CA 3** and **Room CA 4** by `0.01` via `altr`.
9. Finally, `kill ownr` destroys the original fruit.

---

## Pumperspikel Seed (2 3 5)

Short-lived bouncy seeds scattered by a falling fruit. Each seed accumulates a life counter; once old enough it fertilises the room and expires. Seeds can be eaten by creatures (family 4), giving them stimulus 77 at intensity 3. They also play a small impact sound on collision.

### Properties (set by the fruit's collision script)

| Property | Value | Notes |
|---|---|---|
| Sprite | `pumperspikel` | 9 images starting at image 21, plane 10 |
| `attr` | 199 | Carryable + Mouseable + Activate1 + Activate2 + Suffer Collisions + Suffer Physics |
| `bhvr` | 48 | Creatures may push & pull |
| `accg` | 5 | Gravity |
| `elas` | 50 | Moderate bounce |
| `fric` | 90 | High friction |
| `perm` | 10 (or 60 if parent fruit had `ov30 = 1`) | Wall-passage permeability |
| `velx` | rand -10 10 | Horizontal scatter |
| `vely` | rand -20 -5 | Upward impulse |
| `tick` | rand 200 600 | Life-tick interval |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov99` | Age counter | Incremented every timer fire; at ≥ 20 the seed fertilises the room and dies |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6 | Collision | Plays a small `clak` sound |
| 9 | Timer | Increments age, dies in rooms of type 8 or 9, and on expiry alters Room CA 3 & 4 |
| 12 | Eaten | Creature ate the seed: plays `chwp`, delivers stimulus 77 intensity 3 to the eater, then dies after 10 ticks |

#### Event 6 — Collision

Plays sound `clak` on every bounce against walls or floor. Provides audible feedback as seeds scatter.

#### Event 9 — Timer (Aging & Fertilisation)

Each timer fire:

1. If the seed is in a room of type **8 or 9** (e.g. ocean/air where the seed cannot germinate), it is destroyed immediately.
2. Otherwise `ov99` is incremented.
3. When `ov99 ≥ 20` and the seed is in a valid room (`room targ ≠ -1`) and not being carried, the script raises **Room CA 3** and **Room CA 4** by `0.01` via `altr`, then destroys the seed (`kill ownr`).

This turns the seed into a slow nutrient source: seeds that fall in suitable ground rooms enrich them, while seeds that fall into water or air dissolve harmlessly.

#### Event 12 — Eaten

When a creature (or the pointer) consumes the seed:

1. Plays the `chwp` chewing sound (`sndc` — controlled sound, follows the target).
2. Targets `from` (the eater).
3. If `fmly eq 4` (a creature), writes stimulus **77** with intensity **3** (food/ingestion reward) to the eater via `stim writ`.
4. Waits 10 ticks, then destroys the seed.

---

## Removal Script (rscr)

The removal script cleans up everything installed by this bootstrap file:

1. `enum 2 3 5` → `kill targ` for every existing seed.
2. `enum 2 8 3` → `kill targ` for every existing fruit.
3. `scrx 2 8 3 9` and `scrx 2 8 3 6` explicitly remove the fruit's Timer and Collision scripts.

(Seed event scripts 6/9/12 and fruit event 4 are not explicitly removed with `scrx`; only the two scripts that keep the fruits actively reproducing are stripped.)

## Stimulus / Room CA Summary

| Effect | Context | Amount | Target |
|---|---|---|---|
| Room CA 3 += 0.01 | Fruit respawn successful (on collision) | 0.01 | Room where the new fruit was placed |
| Room CA 4 += 0.01 | Fruit respawn successful (on collision) | 0.01 | Room where the new fruit was placed |
| Room CA 3 += 0.01 | Seed reaches age 20 (timer) | 0.01 | Room where the seed expired |
| Room CA 4 += 0.01 | Seed reaches age 20 (timer) | 0.01 | Room where the seed expired |
| CA 7 emit 0.5 | Each seed spawned on fruit impact | 0.5 (emit) | Room of the impact (via `emit`) |
| Stimulus 77 (intensity 3) | Creature eats a seed | 3 | The eating creature (via `stim writ`) |
