# sludge gun.cos - Sludge Gun Turret

**Source**: `Assets/Bootstrap/001 World/sludge gun.cos`

## Overview

This script installs a single **sludge gun** turret into the Ark's wiring network at (2000, 448). The sludge gun is a signal-driven projectile launcher: when it receives a non-zero signal on its input port (from a connected upstream gadget, a creature clicking it, or the mouse clicking it), it optionally turns to face left or right, then fires a ballistic **sludge blob** projectile. The projectile's horizontal launch speed is proportional to the magnitude of the input signal (`velo = _p1_/9`). The incoming signal is also forwarded unchanged on the turret's output port.

The projectile (family/genus/species `2 10 25`) is a short-lived ballistic object that:
- Falls under gravity and splats when it collides with terrain.
- Stims any creature it touches (family 4) with stim 25 (intensity 0), wakes the creature, and then splats itself.

Creatures interacting with the gun receive standard machine stimuli: stim 67 when activated by the creature itself, stim 91 (`GOT_MACHINE`) on pickup, and stim 92 (`HIT_MACHINE`) on hit. The turret continuously emits CA 18 (alarm/alert) at intensity 0.2 into its room.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 2 | Sludge Gun | `sludgegun` frames 0–19 | Signal-driven wired turret that forwards its input signal and fires a ballistic sludge projectile whose speed scales with the signal magnitude | [Detail](#sludge-gun-3-8-2) |
| 2 10 25 | Sludge Blob | `sludgegun` frames 24–49 | Ballistic splat projectile fired by the sludge gun; stims/wakes any creature it touches | [Detail](#sludge-blob-2-10-25) |

---

## Sludge Gun (3 8 2)

The turret agent. It has one input port and one output port and sits permanently in its installed position (it is carryable but normally wired into a circuit). Clicking/receiving a positive signal aims right; clicking/receiving a negative signal aims left; the sign flips the turret between its left-facing and right-facing orientations via `ov10`. After aiming, it fires a projectile whose horizontal velocity is proportional to `|signal|/9`, so stronger input signals yield faster projectiles.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 3 8 2 "sludgegun" 30 0 5000 | Simple agent, sprite `sludgegun`, 30 frames, first image 0, plane 5000 |
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activateable 1 (4) + Floatable (64) + Suffer Collisions (128) |
| `bhvr` | 11 | Activate 1 (1) + Activate 2 (2) + Hit (8) |
| `elas` | 0 | No bounce |
| `accg` | 7 | Strong gravity (will fall if dropped) |
| `perm` | 60 | Medium permeability |
| `clac` | 0 | Click maps to Activate 1 |
| `emit` | CA 18 at 0.2 | Continuous emission into the room (alarm/alert zone) |
| Position | (2000, 448) | Installed in the Ark |
| `ov10` | -1 | Initial facing direction (-1 = left, +1 = right) |
| `ov61` | 100 | CA smell emission intensity |

### Ports

Defined with `prt: inew` / `prt: onew`:

| Direction | Index | Name | Sprite | First Image | Relative Position | Input Msg ID | Purpose |
|---|---|---|---|---|---|---|---|
| Input | 0 | "Sludgegun Input" | (space) | 64 | (64, —) | 1000 | Receives firing signal; fires event 1000 |
| Output | 0 | "Sludgegun throughport" | (space) | 44 | (64, —) | — | Re-emits received input signal |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov10` | -1 | Facing direction: -1 = left, +1 = right |
| `ov61` | 100 | CA smell intensity |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Click / activate — chooses a direction and self-sends message 1000 to fire |
| 2 | Activate 2 | Click / deactivate — reverses direction and self-sends message 1000; also issues drive commands |
| 3 | Hit | Creature hits the gun — bounce, random port-bang, stim 92 |
| 4 | Pickup | Creature picks up the gun — stim 91 to creature (family 4 only) |
| 1000 | Input Port Signal | Incoming wire signal — turns the gun, fires a projectile, and forwards the signal on the output port |

---

#### Event 1 — Activate 1

Triggered when the gun is activated (by the pointer or a creature). The script determines a signal value (`va00 = ±200`) based on who activated it and, for the pointer, which side of the gun was clicked:

1. `clac -1` — clear the click-action binding.
2. If the activator is the **pointer** (`from eq pntr`):
   - If click X-offset `_p2_ < 40` (clicked on the left side of the gun):
     - If already facing right (`ov10 > 0`) → `va00 = 200`; else `va00 = -200`.
   - Else (clicked on the right side):
     - If already facing right → `va00 = -200`; else `va00 = 200`.
3. Else (activator is a creature):
   - If facing right → `va00 = 200`; else `va00 = -200`.
   - Write **stim 67** (intensity 1) to the creature (`from`).
4. Self-send message **1000** with `_p1_ = va00` to fire the gun.

Effectively the pointer-click variant toggles the facing direction (clicking the side opposite the current aim triggers a turn), while a creature activation always fires in the current heading.

#### Event 2 — Activate 2

Triggered on the alternate click action (after the gun has been activated at least once):

1. `clac -1` — clear the click binding.
2. Compute `va00` with the opposite sign of the current facing (`ov10 > 0 → va00 = -200`, else `va00 = 200`).
3. `driv 11 -0.1` and `driv 8 0.1` — drive adjustments (would apply to `targ`, which here is the gun itself).
4. Self-send message **1000** with `_p1_ = va00` to fire in the opposite direction.

#### Event 3 — Hit

Triggered when a creature hits the gun:
1. Plays the `"hit_"` sound.
2. Applies a random upward velocity (`velo 0, rand -5 -10`) — the gun bounces.
3. Fires a random signal through connected ports via `prt: bang rand 60 100`.
4. Writes **stim 92** (`HIT_MACHINE`) with intensity 1 to the hitting creature (`from`).

#### Event 4 — Pickup

Triggered when an agent picks up the gun:
1. Targets the picker (`targ from`).
2. If the picker is family 4 (a Creature) → writes **stim 91** (`GOT_MACHINE`) with intensity 1.

#### Event 1000 — Input Port Signal (Fire Sequence)

Fired whenever a signal arrives on input port 0 (from a wire, from an activate self-message, or from the mouse/creature click path). This is the core firing logic:

1. `clac 0` — reset the click binding.
2. `prt: send 0 _p1_` — forward the incoming signal unchanged to output port 0.
3. **Aim**: based on sign of `_p1_` vs current facing `ov10`:
   - If `_p1_ < 0` and currently facing right (`ov10 > 0`) → call `gsub left` (turn to face left).
   - Else if `_p1_ > 0` and currently facing left (`ov10 < 0`) → call `gsub rite` (turn to face right).
   - Else if `_p1_ = 0` → `stop` (no fire, no turn).
4. Compute projectile horizontal speed: `va09 = _p1_ / 9`.
5. Call `gsub fire` to spawn a projectile.
6. `unlk`.

**Subroutine `left`**: play `"sgtn"` sound, play turn-to-left animation `[10 11 12 13 14 15 16 17 18 19 0]`, set `ov10 = -1`, wait (`over`), then `fade`.

**Subroutine `rite`**: play `"sgtn"` sound, play turn-to-right animation `[0 1 2 3 4 5 6 7 8 9 10]`, set `ov10 = 1`, wait (`over`), then `fade`.

**Subroutine `fire`**:
1. If the gun is being carried by the `c3_inventory` game agent → `stop` (prevent firing from inventory).
2. Play `"sgfr"` sound.
3. Compute spawn plane `va80 = plne - 1` (one plane in front of the gun).
4. Branch on facing (`ov10`):
   - **Left (`ov10 < 0`)**: play muzzle animation `[20 21 22 23 24]`, spawn point `(va00, va01) = (posl, posy - 30)`.
   - **Right**: play muzzle animation `[25 26 27 28 29]`, spawn point `(va00, va01) = (posr - 40, posy - 30)`.
5. Create a projectile (see [Sludge Blob](#sludge-blob-2-10-25) for details): `new: simp 2 10 25 "sludgegun" 24 30 va80`, `attr 195`, `accg 1`, `elas 20`, `perm 60`, `tick 1`, `ov61 = 10`.
6. `velo va09 -5` — horizontal speed scaled from input signal; initial upward nudge of 5.
7. Play flight animation (left: `[0..7 255]`; right: `[8..15 255]` — frame 255 is a terminator).
8. If the spawn point is valid (`tmvt va00 va01 = 1`) → `mvto va00 va01`; else → `kill targ` (cannot spawn here, abort).
9. `slow` — reduce physics update frequency for the projectile.

### Signal Summary

| Source | Output Port 0 Value |
|---|---|
| Input signal `_p1_` on event 1000 | `_p1_` (forwarded unchanged before firing) |
| Hit (event 3) | rand 60–100 (via `prt: bang`) |

### Projectile Speed vs Signal

| Input signal `_p1_` | Projectile horizontal velocity `va09 = _p1_ / 9` |
|---|---|
| ±9 | ±1 px/tick |
| ±90 | ±10 px/tick |
| ±200 (from clicks) | ±22.2 px/tick |
| 0 | No fire |

---

## Sludge Blob (2 10 25)

The ballistic projectile fired by the sludge gun. It is created by the gun's `fire` subroutine and is short-lived: it falls under light gravity, flies in the direction set by its initial velocity, and terminates either when it hits a wall (collision event 6) or when it touches a creature (tick event 9).

### Bootstrap Configuration (at spawn)

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 2 10 25 "sludgegun" 24 30 va80 | Simple agent, shares sprite `sludgegun`, first image 24, 30 total frames, plane = gun's plane − 1 |
| `attr` | 195 | Carryable (1) + Mouseable (2) + Floatable (64) + Suffer Collisions (128) |
| `accg` | 1 | Very light gravity |
| `elas` | 20 | Low bounce |
| `perm` | 60 | Medium permeability |
| `tick` | 1 | Timer tick every 1 engine tick — drives event 9 |
| `ov61` | 10 | CA smell intensity |
| Initial velocity | `(va09, -5)` | Horizontal scaled from input signal, small upward nudge |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov61` | 10 | CA smell intensity |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6 | Collision | Projectile hits a wall / solid surface — splat and die |
| 9 | Timer (Tick) | Each tick, check for touching creatures — stim/wake them and splat-die on contact |

---

#### Event 6 — Collision

Triggered when the projectile collides with the environment:
1. `attr 0` — strip all attributes (disables further collisions / interactions).
2. Play `"splt"` sound.
3. Play splat animation `[16 17 18 19 20 21 22 23]`, wait (`over`).
4. `kill targ` — despawn.

#### Event 9 — Timer (Tick)

Fired every engine tick (because `tick 1` was set). It scans for nearby creatures using `etch 4 0 0` (enumerate **touching** agents of family 4 with any genus/species):

For each touching creature:
1. `stim writ targ 25 0` — writes **stim 25** to the creature with intensity 0 (pure stimulus signal without biochemical strength).
2. `aslp 0` — wake the creature (sets its sleep state to awake).
3. Switch back to the projectile (`targ ownr`).
4. `attr 128` — change attributes to only "Suffer Collisions" (no longer carryable/mouseable).
5. `velo 0 0` — stop motion.
6. Play splat animation `[16 17 18 19 20 21 22 23]`, wait (`over`).
7. `kill targ` — despawn the projectile.

Because the splat/kill runs inside the enumeration body after a match, the projectile self-destructs on first contact with a creature. If no creature is touching, the enumeration is empty and the projectile continues flying.

---

## Removal Script (rscr)

The removal script cleanly uninstalls both the gun and any live projectiles:

1. Enumerate all sludge guns (`enum 3 8 2`) → `kill targ` each.
2. Enumerate all sludge blobs (`enum 2 10 25`) → `kill targ` each.
3. Remove scripts: `scrx 3 8 2 1` (Activate 1) and `scrx 2 10 25 6` (projectile collision).

Note: the other event scripts (`3 8 2 2`, `3 8 2 3`, `3 8 2 4`, `3 8 2 1000`, and `2 10 25 9`) are not explicitly stripped via `scrx`.

---

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 25 | — | Sludge blob touches a creature (projectile event 9) | Pure stimulus signal (intensity 0) plus forced wake-up (`aslp 0`) |
| 67 | — | Creature activates the gun (event 1, non-pointer) | Biochemical feedback for firing the turret |
| 91 | `GOT_MACHINE` | Gun picked up (event 4, family 4 only) | Biochemical feedback for obtaining a machine |
| 92 | `HIT_MACHINE` | Gun hit (event 3) | Biochemical feedback for hitting machinery |

## Room CA Effects

| CA Index | Source | Amount | Ecological Role |
|---|---|---|---|
| 18 | Sludge gun continuous emission (`emit`) | 0.2 | Marks the room as an alarm/alert zone (same CA as the siren) |
