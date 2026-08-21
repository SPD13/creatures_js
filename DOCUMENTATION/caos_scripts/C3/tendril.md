# tendril.cos - Tendril Plant Ecosystem

**Source**: `Assets/Bootstrap/001 World/tendril.cos`

## Overview

This script installs a self-propagating tendril plant ecosystem into the world. Two related agents are created:

- **Tendril Seeds** (classifier `2 5 4`): dormant seeds that fall to the ground and, on their timer, run through a multi-stage animated growth cycle that spawns two new active tendrils on top of themselves before dying.
- **Active Tendrils** (classifier `2 3 11`): the living, animated tendril plants that check their local environment (room CA properties and overcrowding), and either grow a new seed (propagation), go dormant, kill themselves, or alter the room's CA values.

At install time, 5 seeds are placed at `(1800, 2000)`, 10 active tendrils at `(1800, 1700)` with long-lived timers (30k–60k ticks), and 10 more active tendrils at `(1800, 2000)` with shorter timers (3k–6k ticks). All are given randomized velocities and permeability, so they scatter on spawn and behave independently.

The ecosystem's behavior is driven by **room CA properties** (light/property 1, heat/property 2, nutrients/property 4): active tendrils only propagate when the room's light and heat are below their comfort threshold and nutrients are above theirs. Overcrowding (more than 20 tendrils globally, or more than 5 seeds within 500 pixels) forces them to die or go dormant, and dying tendrils give back `0.1–0.2` to the room's properties 3 and 4 as "fertilizer". Getting eaten delivers stimulus 77 to the creature.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 5 4 | Tendril Seed | `tendril` | Dormant seed that grows into two active tendrils | [Detail](#tendril-seed-2-5-4) |
| 2 3 11 | Active Tendril | `tendril` | Living animated tendril plant that propagates or dies based on room CA | [Detail](#active-tendril-2-3-11) |

---

## Tendril Seed (2 5 4)

A small passive agent that suffers gravity and collisions, waits on a timer, and then runs a four-stage growth animation. Stage 3 spawns two new active tendrils above the seed's position; the seed then plays a withering animation and kills itself, leaving behind fertilizer on the room.

### Properties

| Property | Value | Notes |
|---|---|---|
| `simp` | 2 5 4 "tendril" 32 0 500 | Simple agent, 32 sprite frames, image base 0, plane 500 |
| `attr` | 192 | Suffer Collisions + Suffer Physics |
| `elas` | 0 | No bounce |
| `fric` | 100 | Full friction — sticks where it lands |
| `perm` | 60 | Permeability 60 |
| `accg` | 2 | Gravitational acceleration 2 (seeds fall) |
| `cmrt` | 0 | Disables automatic camera tracking |
| `tick` | rand 600 1200 | Randomized timer (600–1200 ticks) |
| `velo` | rand -10 10, 0 | Random initial horizontal velocity, zero vertical |
| Position | `mvto 1800 2000` | All 5 seeds spawn at (1800, 2000) then scatter via velocity |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Multi-stage growth cycle: animate pose progression, spawn tendrils, then die |

#### Event 9 — Timer (Growth Cycle)

The timer script uses `ov00` as a stage counter (0 → 3) and `ov01` as a tick counter, driving a four-stage growth:

**Stage 0 (initial growth)**: advances `pose` by 1 each tick while it is below 8. Once pose reaches 8, advances stage counter `ov00` to 1.

**Stage 1 (continued growth)**: continues to advance `pose` until it reaches 13, then moves to stage 2.

**Stage 2 (spawn)**:
1. Plays the `[14 15 16 17 18]` animation and calls `over` to wait for it to finish.
2. Stores the seed's own position (`va00=posx`, `va01=posy`).
3. Loops twice (`reps 2`) to spawn two new active tendrils (`2 3 11`):
   - Each new tendril gets `attr 195` (suffer collision + physics + floatable), `bhvr 16` (creature can eat), `elas 30`, `fric 100`, random `perm 30–70`, and a random short-lived `tick 3000–6000`.
   - Initializes CA comfort thresholds: `ov80=1` (light), `ov82=1` (heat), `ov87=0` (nutrients), plus `ov72=rand 10 40` as a dormancy countdown.
   - Uses `tmvt` to test whether the new tendril can be placed at the seed's position; if not, the new tendril is killed, the script targets back to the seed, sets stage to 3, and stops (skipping the remaining spawn).
4. Re-targets `ownr` (the seed), plays the withering animation `[19 20 21 22]`, and sets stage to 3.

**Stage 3 (die)**:
1. Continues advancing `pose` until it reaches 31.
2. Once finished, if the seed is in a valid room and not being carried (`room targ <> -1 and carr = null`), adds `0.1` to the room's CA property 3 and 0.2… actually `0.2` to properties 3 and 4 (fertilizer donation).
3. Kills itself (`kill ownr`).

**Note on stim:** The seed does not emit any stimulus itself; only the active tendril (below) does.

---

## Active Tendril (2 3 11)

The mobile, animated tendril plant. It is floatable (`attr 195`) and edible by creatures (`bhvr 16`). Each tick it checks for global overcrowding, local room CA suitability, and whether it is being carried or falling. Based on these checks it either spawns a new seed (propagation), goes dormant, alters the room properties, or kills itself.

### Properties

| Property | Value | Notes |
|---|---|---|
| `simp` | 2 3 11 "tendril" 10 32 500 | Simple agent, 10 sprite frames, image base 32, plane 500 |
| `attr` | 195 | Suffer Collision + Suffer Physics + Floatable (+ carryable) |
| `bhvr` | 16 | Creature can eat |
| `elas` | 30 | Small bounce |
| `fric` | 100 | Full friction |
| `anim` | [0 1 2 3 4 5 255] | Default looping life animation (5-frame loop) |
| `perm` | rand 30 70 | Random permeability |
| `tick` | rand 3000 6000 (short) or rand 30000 60000 (long) | Two populations: fast-cycling and slow-cycling |
| `ov72` | rand 10 40 | Dormancy countdown (ticks remaining before self-kill if dormant) |
| `ov80` | 1 | Light comfort threshold — room property 1 must be ≤ this |
| `ov82` | 1 | Heat comfort threshold — room property 2 must be ≤ this |
| `ov87` | 0 | Nutrient comfort threshold — room property 4 must be ≥ this |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 4 | Pickup | Creature/agent picks up the tendril — clears the animation |
| 5 | Drop | Tendril is dropped — restarts its life animation loop |
| 6 | Collision | On collision with the `down` wall (floor), stops the animation (settled) |
| 9 | Timer | Main life logic: overcrowd check, environment check, grow, or go dormant |
| 12 | Eat | Creature eats the tendril — fires stimulus 77, kills self |

#### Event 4 — Pickup (Deactivate animation)

Sets `anim []`, clearing any running animation so the tendril is frozen while held.

#### Event 5 — Drop (Re-activate animation)

Sets `anim [0 1 2 3 4 5 255]`, restarting the 5-frame looping life animation.

#### Event 6 — Collision (Settled on floor)

When the tendril collides with a wall and that wall is `down` (the floor), it sets `anim []` and stops animating — the tendril has "landed" and waits for its timer rather than visibly swaying.

#### Event 9 — Timer (Main Life Logic)

Marked `inst` so the whole block runs atomically. It performs three main checks and dispatches to the subroutines `envi`, `grow`, and `dorm`:

1. **Unsuitable biome / escape-room check**: If the current room's type is 8 or 9 (`rtyp room targ eq 8 or eq 9`), the tendril cannot live there. If it is in a valid room and not carried, it deposits `0.1` to room CA properties 3 and 4 (fertilizer), then kills itself.
2. **Global overcrowding**: If the total tendril count exceeds 20 (`totl 2 3 11 gt 20`), the tendril deposits `0.1` to room CA 3 and 4 (if validly roomed and not carried), then kills itself either way.
3. **Active path**: If the tendril is not falling and not carried (`fall eq 0 and carr eq null`), it calls `gsub envi` to evaluate its environment and potentially `gsub dorm` afterward.

**subr envi** — environment evaluation:
- If room property 1 (light) ≤ `ov80`, sets `va00=1`.
- If room property 2 (heat) ≤ `ov82`, sets `va01=1`.
- If room property 4 (nutrients) ≥ `ov87`, sets `va02=1`.
- Counts seeds (`2 5 4`) within range 500; if ≥ 5, local area is over-seeded: goes dormant (`gsub dorm`) and stops.
- If all three environmental flags are set (`va00=1 and va01=1 and va02=1`), calls `gsub grow` to spawn a new seed.

**subr grow** — spawn a new seed:
- Computes spawn position slightly up and left of the tendril (`posl - 12`, `post - 37`).
- Stores current `perm` into `va90` to inherit permeability.
- Creates a new seed (`2 5 4 "tendril"`) with the same physical properties as the install-time seeds: `attr 192`, `elas 0`, `fric 100`, `perm va90`, `accg 2`, `tick rand 600 1200`.
- Uses `tmvt` to verify the spawn position is valid; if not, both the new seed and the parent tendril are killed.
- Otherwise `mvto` places the seed and kills the parent tendril (`kill ownr`). The tendril "spends itself" to create a seed.

**subr dorm** — go dormant:
- If the current pose is below 9, switches `attr` to 16 (no longer suffering physics/collisions — frozen in place) and plays the dormant animation `[6 7 8 9]` via `over`.
- Decrements the dormancy counter `ov72` by 1.
- When `ov72 ≤ 0`, deposits `0.1` to room CA 3 and 4 (if validly roomed and uncarried) and kills itself. Dormant tendrils eventually die and fertilize the room.

#### Event 12 — Eat

When a creature eats the tendril:
1. `stim writ from 77 1` — sends stimulus 77 (intensity 1) to the eating creature.
2. `kill ownr` — the tendril is consumed and removed.

### Impact on Room CA

| CA Property | Effect | When |
|---|---|---|
| Property 3 | +0.1 (or +0.2 at stage-3 seed death) | Tendril/seed dies in a valid uncarried room |
| Property 4 | +0.1 (or +0.2 at stage-3 seed death) | Tendril/seed dies in a valid uncarried room |

Dying tendrils and finished seeds enrich the soil. Active tendrils read properties 1, 2, and 4 to decide whether to propagate.

### Stimulus Summary

| Stimulus # | Context | Effect on Creature |
|---|---|---|
| 77 | Active tendril is eaten (event 12) | Creature receives the tendril's eat/nutrition stimulus |

---

## Removal Script (rscr)

The removal script cleanly uninstalls all tendril-ecosystem agents:

1. Enumerates all tendril seeds (`enum 2 5 4`) and kills each.
2. Enumerates all active tendrils (`enum 2 3 11`) and kills each.
