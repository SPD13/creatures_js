# mosquito.cos - Mosquito Critter

**Source**: `Assets/Bootstrap/001 World/mosquito.cos`

## Overview

This script implements the mosquito critter (classifier `2 14 4`) -- a small flying insect that roams the world, avoids water, and seeks out Norns to harass. Mosquitos are spawned in two ways: (1) at bootstrap, 20 mosquitos are placed at random positions in the upper world area, and (2) dynamically at runtime via a "blank" spawner agent (classifier `2 18 20`, shared with the gnats script) that creates a new mosquito at its own position when triggered.

The mosquito has a simple two-state AI:
- **Roam (state 0)**: random flight with periodic direction changes and obstacle avoidance.
- **Hunt (state 1)**: when a Norn (`2 1 1`) is detected within range 200, the mosquito tracks toward the Norn's last known position.

When the mosquito enters a water room (room type 8 or 9) or a room with high water content (CA 5 > 0.2), it forces an upward escape velocity. When picked up or hit by a creature of family 4 (Norns), the mosquito writes stimulus 88 (intensity 1) onto that creature -- the in-game "annoyance" stimulus that makes Norns dislike being bitten by bugs. Eating a mosquito kills it.

The mosquito also acts as its own propagator: every 100 timer ticks, if the population is below 20 and the local area has 3 or fewer mosquitos and fewer than 3 spawners, it creates a `2 18 20` blank spawner with a 1-hour (3600 tick) lifespan, which then produces another mosquito.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 14 4 | Mosquito | `mossie` frame 0 | Flying insect that roams, hunts Norns, and avoids water | [Detail](#mosquito-2-14-4) |
| 2 18 20 | Mosquito Spawner (Blank) | `blnk` frame 0 | Invisible/blank propagator agent that spawns a new mosquito when its timer fires | [Detail](#mosquito-spawner-2-18-20) |

---

## Mosquito (2 14 4)

The main critter agent. A small flying mosquito with a two-state AI: roaming and hunting Norns. It reacts to water (forced escape), to creatures (annoyance stimulus on contact/hit), and self-propagates by spawning blank spawners when its area is sparsely populated.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `mossie` | 24 images, first image 0 |
| Plane | 300 | Foreground layer |
| `attr` | 66 | Mouseclickable + Suffers Collisions |
| `bhvr` | 49 | Activatable + Hittable + Eatable |
| `tick` | 5 | Fast timer |
| Position | Random (1800-2200, 1800-2000) | Upper roaming area |
| Initial direction | Random (`ov10`, `ov11` = -1 or 1 each) | Flight direction |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Behavior state | 0=Roam, 1=Hunt |
| `ov01` | Spawner trigger counter | Increments each tick; triggers spawner check at 100 |
| `ov10` | Horizontal direction | -1=Left, 1=Right |
| `ov11` | Vertical direction | -1=Up, 1=Down |
| `ov12` | Current X velocity | Smoothly approaches `±ov14` |
| `ov13` | Current Y velocity | Smoothly approaches `±ov15` |
| `ov14` | Max X velocity | 5 (roam) / 4 (hunt) |
| `ov15` | Max Y velocity | 5 (roam) / 4 (hunt) |
| `ov61` | CA smell range | 40 |
| `ov70` | Hunt target X | Norn's last known X position |
| `ov71` | Hunt target Y | Norn's last known Y position |
| `ov90` | Direction-change cooldown | Decrements each tick; randomises direction at 0 |
| `ov91` | Hunt scan cooldown | Decrements each tick; runs `hunt` subroutine at 0 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main AI loop (roam/hunt, water escape, self-propagation) |
| 1 | Activate1 | Pushed/picked up: jump upward, sting Norn that touched it |
| 4 | Hit | Hit by an agent: sting Norn attacker, then kill via message 5 |
| 12 | Eat | Eaten by a creature: sting eater, self-destruct |

#### Event 9 -- Timer

Runs every 5 ticks. Drives all mosquito behavior.

**Spawn-Trigger Counter:** `ov01` increments every tick.

**Water Escape (highest priority):**
- If room type is 8 or 9 (water rooms): force `vely -5` and stop -- escape upward.
- If room CA 5 (water content) > 0.2: force `vely -10` and stop -- stronger upward push.

**Self-Propagation (when `ov01 >= 100`):**
- Only triggers if total mosquitos (`totl 2 14 4`) is below 20.
- Within range 1000, count visible mosquitos (`va99`). If 3 or fewer:
  - Within range 1000, count visible spawners (`va98 = totl 2 18 20`). If fewer than 3:
    - Create a new spawner (`2 18 20` "blnk") at the mosquito's current position with `attr 16` (Hittable) and `tick 3600` (1 hour lifespan). If `tmvt` validates the position, place it via `mvto`; otherwise, kill it.

After this block, `targ` is restored to `ownr`.

**State 0 -- Roam:**
1. Set max velocity to 5/5 (`ov14`, `ov15`).
2. Decrement direction-change counter `ov90`.
3. Run `wall` subroutine (obstacle avoidance against the four walls).
4. When `ov90 <= 0`: with 1-in-3 chance, flip horizontal direction (`negv ov10`). Always flip vertical direction (`negv ov11`). Reset `ov90` to a random value (1-3 if no horizontal wall hit, plus 2-5 if no vertical wall hit). The wall subroutine pre-sets `va00`/`va01` flags to suppress reversal on a side that just bounced.
5. Run `velo` subroutine (smoothly accelerate `ov12`/`ov13` toward target velocity).
6. Run `anim` subroutine (play flying animation based on horizontal velocity).
7. **Hunt scan**: When `ov91 <= 0`, run `hunt` subroutine. Otherwise decrement `ov91`.

**State 1 -- Hunt:**
1. Run `hunt` subroutine to refresh target position.
2. Adjust direction (`ov10`, `ov11`) to steer toward the stored target (`ov70`, `ov71`).
3. Set max velocity to 4/4 (slower, more controlled flight).
4. Run `velo`, `wall`, and `anim` subroutines.

### Subroutines

#### `subr hunt`
Within range 200, scan for Norns (`esee 2 1 1`). If a Norn is found, store its position (`va00`, `va01`), switch to state 1 (`ov00 = 1`), and store target position in `ov70`/`ov71`. If none found, revert to state 0 (roam).

#### `subr velo`
Smoothly accelerate current velocity (`ov12`, `ov13`) toward the directional target (`±ov14`, `±ov15`) by 2 per tick. Apply final values to `velx`/`vely`.

#### `subr wall`
Four-direction obstacle check (`obst 0`-`3`):
- Left wall < 100: flip `ov10`, set `va00 = 1`.
- Right wall < 100: flip `ov10`, set `va00 = 1`.
- Ceiling < 50: flip `ov11`, set `va01 = 1`.
- Floor < 100: flip `ov11`, set `va01 = 1`.

The `va00`/`va01` flags tell the roam logic that this axis just bounced, suppressing the random direction change for that axis.

#### `subr anim`
Plays directional flying animation:
- `ov12 > 0` (moving right): `anim [2 3 255]` (looping frames 2-3).
- `ov12 < 0` (moving left): `anim [8 9 255]` (looping frames 8-9).

#### Event 1 -- Activate1 (Push/Pickup)

1. Force `vely -20` -- jumps strongly upward.
2. Switch `targ` to `from`. If the activator is a Norn (`fmly == 4`): write **stimulus 88, intensity 1** onto the Norn (the "bug bite" annoyance stimulus).

#### Event 4 -- Hit

1. Switch `targ` to `from`. If hitter is a Norn (`fmly == 4`): write **stimulus 88, intensity 1** onto the Norn.
2. `mesg writ targ 5` -- sends message 5 (typically "Drop") to the hitter.

#### Event 12 -- Eat

1. Switch `targ` to `from`. If eater is a Norn (`fmly == 4`): write **stimulus 88, intensity 1** onto the Norn.
2. `kill ownr` -- the mosquito self-destructs.

### Stimulus Effects

| Trigger | Stimulus | Intensity | Target |
|---|---|---|---|
| Push/Pickup (event 1) | 88 (Annoyance) | 1 | Norn that pushed/picked up |
| Hit (event 4) | 88 (Annoyance) | 1 | Norn that hit |
| Eat (event 12) | 88 (Annoyance) | 1 | Norn that ate |

---

## Mosquito Spawner (2 18 20)

A blank/invisible propagator agent spawned by mature mosquitos when their local area is sparsely populated. The same classifier (`2 18 20`) is shared with the gnats script. When this spawner's timer fires, it creates a fresh mosquito at its position (subject to a population check) and continues to exist until its 3600-tick lifespan expires.

### Bootstrap Configuration (when spawned by a mosquito)

| Property | Value | Notes |
|---|---|---|
| Sprite | `blnk` | 1 image, first image 0 |
| Plane | 0 | Background |
| `attr` | 16 | Hittable |
| `tick` | 3600 | One-hour lifespan |
| Position | Inherited from creator mosquito | |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Spawn a new mosquito at this position (population-gated) |

#### Event 9 -- Timer

1. Save current position to `va00`/`va01`.
2. Within range 700, count visible gnats (`esee 2 14 5` -> `va66`).
3. If `va66 < 20` (gnat population low):
   - Create a new mosquito (`2 14 4` "mossie") with `attr 66`.
   - If `tmvt` validates the saved position, apply standard mosquito setup (`bhvr 49`, `tick 5`, `ov61 40`, random `ov10`/`ov11`) and `mvto` it into place.
   - If position is invalid, `kill targ` and stop.

Note: This spawner shares its classifier with gnats and uses gnat population (`2 14 5`) as the gating signal -- this couples mosquito and gnat propagation through the same blank-spawner ecosystem.

---

## Remove Script (rscr)

1. Enumerates all `2 14 4` mosquitos and kills them.
2. Removes event scripts 9, 1, 4, and 12 for `2 14 4` via `scrx`.

Note: The script does **not** remove the `2 18 20` spawner script (that is owned/cleaned by the gnats script).
