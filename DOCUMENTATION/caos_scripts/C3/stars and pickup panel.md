# stars and pickup panel.cos - Pick-Up Reward Visual Feedback

**Source**: `Assets/Bootstrap/001 World/stars and pickup panel.cos`

## Overview

This bootstrap script wires the visual and UI feedback triggered when a pick-up (classifier `2 24 4`, installed by `pick-ups.cos`) receives the custom "collected" message `12345` (typically sent when a creature pushes it). The handler does two things:

1. **Star burst** — spawns a configurable number of short-lived gravity-affected "star" simple agents (`1 1 46`) at the activator's position, launching them upward at a velocity tier controlled by the message's second parameter. This gives the classic sparkle/reward effect.
2. **Pick-up status panel** — if (and only if) the receiving agent is actually a pick-up (`fmly=2 gnus=24 spcs=4`), constructs a floating compound UI window (`1 2 22`) that reports the creature's progress for that pick-up type. The panel composes a text message from the catalogue `Pick-ups` entries, measures progress (for types 1–4) by walking the live creature population (`2 1 0`), and for special types (7, 8, 9) toggles world-level `game` variables that alter engine behavior (max norns, Grettin flag, creature pick-up status with `rgam`). It closes itself on button click or after a 120-tick timer.

The script also serves as the destructor hook for stars and panels, and its `rscr` cleans up any of either kind left in the world.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 46 | Star | `andtheworldexplodedintostars` | Short-lived gravity "sparkle" launched upward during the reward burst | [Detail](#star-1-1-46) |
| 1 2 22 | Pick-up Status Panel | `pick-ups2` | Floating compound UI window showing the progress message for the collected pick-up | [Detail](#pick-up-status-panel-1-2-22) |

The script *also* attaches new event handlers to the pick-up classifier `2 24 4` via `scrp 2 0 0 12345` (the wildcard family-2 handler), but does not create pick-up agents itself — those come from `pick-ups.cos`.

---

## Star (1 1 46)

Very short-lived particle agents spawned in bursts to form the visual "sparkle" reward. They are given a random upward velocity, gravity, moderate elasticity, and a random tick timer so that they scatter, bounce once or twice, and then expire.

### Properties

| Property | Value | Notes |
|---|---|---|
| `simp` | 1 1 46 "andtheworldexplodedintostars" 5 40 9000 | 5-frame gallery starting at image base 40, draw plane 9000 (foreground) |
| `attr` | 192 | SufferPhysics (128) + SufferCollisions (64) — bounces off scenery but is not clickable |
| `accg` | 8 | Fairly strong downward gravity |
| `elas` | 40 | Moderate bounciness |
| `pose` | random 0–4 | Each star picks a random sprite frame for visual variety |
| `tick` | random 30–40 | Timer script fires after ~1 s to destroy the agent |
| Velocity | tier-dependent | See table below; set via `vely`/`velx` before physics takes over |

Stars are always spawned at `va00,va01` (the activator's `posx,post` captured before the loop). Before applying movement and velocity, the script validates that the position is a legal move via `tmvt`; if not, the star kills itself immediately (`kill targ` + `stop`).

### Velocity Tiers (selected by `_p2_` of the triggering `12345` message)

| `_p2_` | `vely` (upward) | `velx` (spread) |
|---|---|---|
| 1 | rand -5 … -15 | rand -5 … 5 |
| 2 | rand -10 … -25 | rand -10 … 10 |
| 3 | rand -15 … -35 | rand -20 … 20 |
| 4 | rand -25 … -40 | rand -30 … 30 |
| 5 | rand -35 … -55 | rand -40 … 40 |
| other / default | rand -20 … -30 | rand -30 … 30 |

`pick-ups.cos` currently sends tier `5`, producing the most energetic burst.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Kill self when the per-star tick fires |

#### Event 9 — Timer

`kill targ` — the star removes itself after its randomised 30–40 tick lifespan, so the burst fades out naturally.

### Stimulus / Room CA

Stars do not deliver stimulus and do not modify any room CA. They are pure visual feedback.

---

## Pick-up Status Panel (1 2 22)

A floating compound UI window assembled from three parts (background, text, dismiss button). Shown once per `12345` collection event on a pick-up, it composes a localised status message from the `Pick-ups` catalogue file and positions itself centred on the user's screen using `wndw`/`wndh`.

### Construction

| Part | Role | Agent / Pose / Geometry |
|---|---|---|
| 0 (base) | `comp 1 2 22 "pick-ups2" 6 24 8500` | Draw plane 8500, 6-frame gallery, image base 24 |
| 1 | Background panel (`pat: dull`) | Gallery `pick-ups2` image 30, at rel (80,0), pose = pick-up's `ov01` type (overridden to pose 10 when type == 4) |
| 2 | Text label (`pat: fixd`) | Gallery `pick-ups2` image 110, at rel (60,0), font `WhiteOnTransparentChars`, text = `va44` (built below) |
| 3 | Dismiss button (`pat: butt`) | Gallery `pick-ups2` image 2, at rel (295,19), message = `2002`, animated `[0]` idle |

Whole-agent properties:

| Property | Value | Notes |
|---|---|---|
| `attr` | 308 | InvisibleToCreatures (256) + SufferCollisions (64) + Mouseable (4) |  
| `clac` | 0 | No collision action |
| `tick` | 120 | Auto-dismiss after ~4 s |
| Positioning | `flto va50 va51` | Centred using `(wndw/2 - 150, wndh/2 - 70)` |

Before constructing, the script enumerates any existing `1 2 22` (`totl … > 0`) and kills them, guaranteeing a single panel at a time.

### Message Composition (`va44`)

`va01` is read from the pick-up's `ov01` (pick-up "type" 1–9). The resulting progress string is assembled from indexed lines of catalogue `Pick-ups`:

- **Types 1–4 (progress pick-ups)**
  1. `va44 = Pick-ups[va01]`  (type-specific prefix)
  2. Append `Pick-ups[0]` (shared preamble)
  3. Enumerate all creatures (`enum 1 1 91` — wildcard; script is targeting creatures via `fmly/gnus/spcs`) and find the one whose `ov00 == va01`, read its `ov02` into `va66`.
  4. `va66 += 25` — coarse progress bump.
  5. If type == 4, clamp `va66` to `100` (max achievement).
  6. Append `vtos(va66) + "% " + Pick-ups[5]` — produces e.g. "…75% …".
- **Type 7 (Grettin + max-norns unlock)**
  - `setv game "Grettin" 1`
  - `setv game "c3_max_norns" 14`
  - `va44 = Pick-ups[7]`
- **Type 8 (plain message)**
  - `va44 = Pick-ups[8]`
- **Type 9 (creature pick-up status + engine refresh)**
  - `setv game "engine_creature_pickup_status" 3`
  - `rgam` — force re-read of engine game variables so the change takes effect now.
  - `va44 = Pick-ups[9]`

After the panel is built and positioned, the script `kill ownr`s the pick-up itself — collected pick-ups disappear from the world.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 123 | (Window resize / reposition) | Recenter the panel on the current window size |
| 2002 | Button custom message | Dismiss button pressed — play button-down animation and destroy the panel |
| 9 | Timer | Self-destruct when the 120-tick timer expires |

#### Event 123 — Reposition

Recomputes `(wndw/2 - 150, wndh/2 - 70)` and `flto`s the panel back to the centre. Used when the game window is resized so the panel stays anchored.

#### Event 2002 — Dismiss Button

1. `part 3 / anim [1]` — swap the button to its "pressed" frame.
2. `over` — wait for that one-frame animation to finish.
3. `kill ownr` — remove the whole panel.

#### Event 9 — Timer

`kill targ` — same cleanup used by the 120-tick auto-dismiss, leaving no trailing UI if the player never clicked.

### Stimulus / Room CA

The panel is a UI overlay and delivers no stimulus. It is marked `InvisibleToCreatures`, so creatures neither react to nor perceive it. Room CA is unaffected.

---

## Pick-up Collection Handler (scrp 2 0 0 12345)

This is the wildcard family-2 handler the script installs on classifier `2 24 4` (pick-ups). It is also the core behaviour of this file.

| Parameter | Source | Meaning |
|---|---|---|
| `_p1_` | First `mesg` param (40 from pick-ups.cos) | Number of stars to spawn |
| `_p2_` | Second `mesg` param (5 from pick-ups.cos) | Velocity tier for the star burst |

Flow:

1. `inst` — disable timeslicing while the visual burst is built.
2. `snde "pkup"` — play the "pick-up" sound on the activator.
3. Capture the activator's current `posx,post` into `va00,va01`.
4. Loop `_p1_` times spawning stars (see [Star](#star-1-1-46)).
5. `targ ownr` — return targeting to the pick-up that received the message.
6. If this agent is actually `fmly=2 gnus=24 spcs=4`, build and show the status panel (see [Pick-up Status Panel](#pick-up-status-panel-1-2-22)) and `kill ownr`.

Because the script is registered under the family-2 wildcard `2 0 0`, it is the only handler responsible for the sparkle burst whenever anything in family 2 receives message `12345`; the panel / `kill ownr` branch is gated to the pick-up classifier so unrelated family-2 agents are unaffected.

### Stimulus / Room CA

The handler itself delivers no stimulus and modifies no Room CA. The `kill ownr` of the pick-up removes that agent instance, which in turn removes any environmental role it was playing.

---

## Removal Script (rscr)

The removal script fires when the world is torn down:

1. `enum 1 1 46` → `kill targ` — destroy every remaining star.
2. `enum 1 2 22` → `kill targ` — destroy any lingering pick-up status panel.

It does not explicitly `scrx` the registered scripts (`2 0 0 12345`, `1 2 22 2002`, `1 2 22 123`, `1 1 46 9`, `1 2 22 9`); they remain registered in the scriptorium but have no instances to act on after cleanup.
