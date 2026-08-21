# PLANT MODEL - foxglove Seed.cos - Foxglove Seed Bootstrap & Germination

**Source**: `Assets/Bootstrap/001 World/PLANT MODEL - foxglove Seed.cos`

## Overview

This script bootstraps the foxglove plant ecosystem by spawning 10 initial seed agents (2 3 1) into the world and defining their behavior scripts. It is the entry point for the foxglove lifecycle — seeds are scattered with random velocity from a central position, settle on surfaces, and then periodically evaluate their environment to decide whether to germinate into a plant stem (2 4 1), go dormant, or die.

The script is one of four interdependent files that together implement the foxglove plant ecosystem:

| File | Agent | Classifier | Role |
|---|---|---|---|
| **`PLANT MODEL - foxglove Seed.cos`** | **Seed** | **2 3 1** | **Bootstrap seed spawning, germination, environmental checks, removal script** |
| `PLANT MODEL - foxglove plant.cos` | Plant Stem | 2 4 1 | Main plant lifecycle: growth, flowering, fruiting, decay, nutrient uptake |
| `PLANT MODEL - foxglove Leaf.cos` | Leaf | 2 6 2 | Leaf growth, wilting, and detachment events |
| `PLANT MODEL - foxglove Flower.cos` | Flower | 2 7 1 | Flower blooming, wilting, petal drop with seed dispersal |

Seeds serve as the ecosystem's dispersal and environmental sensing mechanism. They check room conditions (heat, radiation, nutrients, room type) and local plant density before germinating. When conditions are unfavorable, seeds enter dormancy or slowly die, returning trace nutrients to the room. When eaten by creatures, seeds provide a hunger-reducing stimulus.

This file also contains the **removal script** (`rscr`) that cleans up the entire foxglove ecosystem — all seeds, plants, leaves, and flowers — and removes their associated event scripts.

**Sprite**: `fxgl.c16` — shared across all foxglove agents. Seeds use frames 25-28 (random visual variety per seed).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 3 1 | Foxglove Seed | `fxgl` frames 25-28 | Dispersible seed that evaluates environment and germinates into a plant stem | [Detail](#foxglove-seed-2-3-1) |
| 2 4 1 | Foxglove Plant Stem | `fxgl` frames 0-11 | Growing plant created by germination; the main lifecycle agent for the foxglove | [Detail](#foxglove-plant-stem-2-4-1) |

---

## Foxglove Seed (2 3 1)

The seed is a small, physics-enabled agent that drifts to the ground after being created (either at bootstrap or by a flower dropping petals). Once settled, its timer script periodically evaluates the local environment. If conditions are suitable and plant density is low, the seed germinates by creating a plant stem (2 4 1) and killing itself. If conditions are poor, the seed loses viability and health until it dies, releasing trace nutrients back into the room.

### Bootstrap Installation

10 seeds are created at position (1360, 480) with random scatter velocities during the install script. Each seed is given a random initial velocity (`velo rand -10 10 rand -10 0`) to disperse across the nearby area.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 193 | Carryable + Floatable + Suffers Collisions |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `elas` | 50 | Moderate bounce on landing |
| `fric` | 100 | High friction (stops quickly on ground) |
| `accg` | 1 | Light gravity (drifts down slowly) |
| Sprite | `fxgl` | 1 frame, random first image 25-28 (visual variety) |
| Plane | 200 | Rendering depth |
| Position | (1360, 480) | Bootstrap spawn point |

### Key Variables

| Variable | Value | Purpose |
|---|---|---|
| `ov00` | 1 | Seed state: active/landed (ready for environmental checks) |
| `ov02` | 100 | Seed health/lifespan — decremented each failed check; death at 0 |
| `ov70` | 100 | Normal timer interval (ticks between environmental checks) |
| `ov71` | 1000 | Dormant timer interval (much slower checks when dormant) |
| `ov72` | 50 | Viability countdown — decremented each failed check; triggers dormancy at 0 |
| `ov80` | 1 | Maximum heat threshold (room CA 1) |
| `ov81` | 0.1 | Minimum heat threshold (room CA 1) |
| `ov82` | 1 | Maximum radiation threshold (room CA 2) |
| `ov83` | 0.01 | Minimum radiation threshold (room CA 2) |
| `ov84` | 0.001 | Radiation lower dormancy bound (room CA 2) |
| `ov85` | 1 | Maximum nutrient threshold (room CA 3) |
| `ov86` | 0.1 | Minimum nutrient threshold (room CA 3) |

**Note**: Seeds created by flower petal drop (in `PLANT MODEL - foxglove Flower.cos`, message 302) use different timer intervals: `ov70 = 10` and `ov71 = 100` — ten times faster than bootstrap seeds. This means second-generation seeds germinate more quickly, reflecting the idea that seeds dropped in an already-viable environment should establish faster.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Environmental evaluation, germination, dormancy, or death |
| 12 | Eat | Creature eats the seed — provides hunger stimulus, seed is destroyed |

---

#### Event 9 — Timer (Environmental Evaluation & Germination)

```
scrp 2 3 1 9
```

The timer is the seed's core decision loop. Each tick, it evaluates whether conditions are suitable for germination.

**Guard Conditions**: The timer only runs if all three conditions are met:
- `ov00 eq 1` — seed is in active state
- `carr eq null` — seed is not being carried by a creature
- `fall eq 0` — seed is not currently falling

If any guard fails, the timer does nothing this tick.

**Environmental Check Cascade**:

The seed evaluates the environment through a priority-ordered cascade. The first failing check triggers its consequence, and no further checks are made:

| Priority | Check | Condition | Result |
|---|---|---|---|
| 1 | Room type | `rtyp < 5` or `rtyp = 8` or `rtyp = 9` | `nope` — unfavorable room (corridor, water) |
| 2 | Heat | `prop room targ 1 > ov80` or `< ov81` | `nope` — temperature out of range (0.1–1.0) |
| 3 | Nutrients | `prop room targ 3 > ov85` or `< ov86` | `nope` — nutrient level out of range (0.1–1.0) |
| 4 | Radiation (dormancy) | `prop room targ 2 > ov84` and `< ov83` | `nope` + `dorm` — marginal radiation, go dormant |
| 5 | Radiation | `prop room targ 2 > ov82` or `< ov83` | `nope` — radiation out of range (0.01–1.0) |
| 6 | Plant density | `esee 2 4 1` counts ≥ 4 visible plants within range 300 | `dorm` — too crowded, go dormant |
| 7 | All checks pass | — | `grow` — germinate into plant stem |

**Subroutine `grow` — Germination**:

When all environmental checks pass and fewer than 4 plants are visible within range 300, the seed germinates:

1. Records own position and dimensions.
2. Creates a new plant stem agent (2 4 1) — see [detail below](#foxglove-plant-stem-2-4-1).
3. Positions the plant at the seed's location, adjusted for the size difference between seed and plant sprites.
4. Sets the plant's timer to `ov80` (300 ticks).
5. Kills itself (`kill ownr`) — the seed is consumed by germination.

**Subroutine `dorm` — Dormancy**:

When the seed enters dormancy (due to crowding or marginal radiation):
- If `ov72 <= 0` (viability depleted): sets timer to `ov71` (1000 — very slow checks).
- Otherwise: sets timer to `ov70` (100 — normal check rate).

This creates a two-speed dormancy system: seeds with remaining viability check relatively frequently, while depleted seeds enter deep dormancy with very infrequent checks.

**Subroutine `nope` — Failed Check**:

Each failed environmental check:
1. Decrements `ov72` (viability) by 1.
2. Decrements `ov02` (health) by 1.
3. If `ov02 <= 0`: triggers `dead` subroutine.

**Subroutine `dead` — Seed Death**:

When seed health reaches zero:
1. Adds trace nutrients to the room: `altr room targ 3 0.0001` (nutrient CA).
2. Adds trace water to the room: `altr room targ 4 0.0001` (water CA).
3. Kills the seed (`kill targ`).

**Impact on Room CA**: Dead seeds contribute small amounts of nutrient (CA 3) and water (CA 4) back to the room environment, creating a minor nutrient recycling loop.

---

#### Event 12 — Eat (Creature Consumption)

```
scrp 2 3 1 12
```

When a creature eats the seed.

**Execution**: Locked (`lock`) to prevent interruption.

**Logic**:
1. Sends stimulus 77 with intensity 1 to the eating creature (`stim writ from 77 1`).
2. Waits 1 tick.
3. Kills the seed (`kill ownr`).

**Stimulus Impact**: Stimulus 77 reduces hunger in the eating creature. Seeds are a minor food source for creatures.

---

## Foxglove Plant Stem (2 4 1)

The plant stem is created by the seed's `grow` subroutine upon successful germination. It is the central lifecycle agent for the foxglove plant — managing growth stages, creating leaves and flowers, absorbing nutrients, and eventually decaying. The plant's event scripts are defined in the separate file `PLANT MODEL - foxglove plant.cos`.

This section documents the initial variables set on the plant at creation time by the seed script.

### Creation Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `fxgl` | 12 frames, first image 0 |
| Plane | Random 200-500 | Varied depth for visual layering |
| Position | Seed position adjusted for size difference | Stem base aligns with seed location |
| Timer | 300 ticks (`ov80`) | Initial tick rate |

### Initial Variables (Set by Seed)

| Variable | Value | Purpose |
|---|---|---|
| `ov17` | `null` | Reference to flower agent (set later by plant) |
| `ov18` | `null` | Reference to leaf agent (set later by plant) |
| `ov30` | 5 | Leaf base frame (normal healthy) |
| `ov31` | 11 | Leaf frame count / max frame |
| `ov32` | 6 | Leaf wilted frame offset |
| `ov50` | 0.1 | Nutrient absorption rate from room |
| `ov51` | 0.005 | Water absorption rate from room |
| `ov52` | 0.5 | Energy gained from nutrient absorption |
| `ov53` | 1 | Max energy capacity |
| `ov54` | 10 | Energy threshold for growth transitions |
| `ov55` | 0.1 | Energy drain per tick |
| `ov56` | 0.0001 | Minimum nutrient requirement |
| `ov57` | 0.5 | Radiation sensitivity threshold |
| `ov58` | 0.001 | Water minimum threshold |
| `ov60` | 0 | Aggregate leaf growth counter (modified by leaves) |
| `ov61` | 10 | Leaf growth target |
| `ov62` | 0.0002 | Nutrient output on death |
| `ov63` | 500 | Decay timer interval |
| `ov65` | 1 | Plant lifecycle state (0-5) |
| `ov66` | 30 | Flower growth timer duration |
| `ov67` | 30 | Flower wilt timer duration |
| `ov68` | 3 | Maximum number of flowers |
| `ov69` | 0 | Flower frame counter (modified by flowers) |
| `ov70` | 0.0001 | Nutrient CA contribution on death |
| `ov71` | 0.001 | Water CA contribution on death |
| `ov72` | 0.001 | Environmental sensitivity |
| `ov73` | 30 | Growth stage duration |
| `ov74` | 30 | Additional growth timer |
| `ov80` | 300 | Main timer interval |
| `ov82` | 100 | Viability counter |

---

## Removal Script (rscr)

The removal script cleans up the entire foxglove ecosystem. It is defined in this file and executes when the seed agent type is removed from the game.

**Agents killed**:
| Classifier | Agent |
|---|---|
| 2 3 1 | All seeds |
| 2 4 1 | All plant stems |
| 2 6 2 | All leaves |
| 2 7 1 | All flowers |

**Scripts removed** (`scrx`):
| Classifier | Event # | Description |
|---|---|---|
| 2 6 2 | 300 | Leaf grow message |
| 2 6 2 | 301 | Leaf season change message |
| 2 6 2 | 12 | Leaf timer |
| 2 4 1 | 9 | Plant stem timer |
| 2 3 1 | 9 | Seed timer |

**Note**: The removal script does not remove flower scripts (2 7 1: 300, 301, 302, 303) or the seed eat script (2 3 1: 12). These are presumably handled by their respective files' removal scripts or are simply orphaned when the agents are killed.

---

## Foxglove Plant Lifecycle (Cross-File Context)

```
  Bootstrap spawns 10 Seeds (2 3 1) at (1360, 480)
            |
            v
  [Seed] Timer checks environment:
  - Heat between 0.1 and 1.0
  - Radiation between 0.01 and 1.0
  - Nutrients between 0.1 and 1.0
  - Room type >= 5 (not corridor/water rooms)
  - Max 4 plants visible in range
            |
            | (conditions met)
            v
  [Seed] → grows → creates Plant Stem (2 4 1)
            |       Seed kills itself (kill ownr)
            |
            v
  [Plant] State 0: Stem Growth
  - Stem frame increments each tick
  - When fully grown: creates Leaf (2 6 2)
  - Transitions to State 1
            |
            v
  [Plant] State 1: Leaf Growth
  - Sends message 300 to Leaf → grows leaf
  - Energy cost per tick
  - When leaf timer expires → State 2
            |
            v
  [Plant] State 2: Flowering
  - Creates Flower (2 7 1)
  - Sends message 300 to Flower → bloom grows
  - Multiple flowers can bloom (up to ov68 = 3)
  - When mature → State 4
            |
            v
  [Plant] State 3/4: Seed Release & Petal Drop
  - Sends message 301/302 to Flower (wilt/drop petals)
  - Flower spawns new Seed (2 3 1) — lifecycle restarts
            |
            v
  [Plant] State 5: Decay
  - Kills child agents (leaves, flowers)
  - Stem frame decrements (visual shrinking)
  - Adds trace nutrients/water to room on death
```

## Environmental Integration

| Agent | CA Interaction | Direction | Detail |
|---|---|---|---|
| Seed (2 3 1) | Heat (CA 1) | Read | Checks range 0.1–1.0 for germination |
| Seed (2 3 1) | Radiation (CA 2) | Read | Checks range 0.01–1.0 for germination |
| Seed (2 3 1) | Nutrients (CA 3) | Read / Write | Checks range 0.1–1.0; adds 0.0001 on death |
| Seed (2 3 1) | Water (CA 4) | Write | Adds 0.0001 on death |

## Stimulus Impact

| Event | Stimulus # | Target | Effect |
|---|---|---|---|
| Eat (event 12) | 77 | Eating creature (`from`) | Hunger reduction (intensity 1) |

## CAOS Commands Used

| Command | Usage in This File |
|---|---|
| `inst` | Instant execution mode (install and grow subroutine) |
| `reps` / `repe` | Repeat loop (create 10 seeds) |
| `new: simp` | Create new simple agent (seed and plant) |
| `attr` | Set agent attributes |
| `bhvr` | Set creature interaction permissions |
| `elas` / `fric` / `accg` | Physics properties |
| `setv` | Set agent and local variables |
| `mvto` | Move agent to position |
| `velo` | Set velocity (seed scatter) |
| `tick` | Set timer interval |
| `rand` | Random number generation |
| `scrp` / `endm` | Define event scripts |
| `doif` / `elif` / `else` / `endi` | Conditional logic |
| `and` / `or` / `eq` / `gt` / `lt` / `le` / `ge` | Comparison and logical operators |
| `rtyp` | Get room type |
| `prop` | Read room CA properties |
| `carr` / `fall` | Agent state checks (carried, falling) |
| `rnge` | Set signal range (for `esee`) |
| `esee` / `next` | Enumerate visible agents of classifier |
| `gsub` / `subr` / `retn` | Subroutine calls |
| `posl` / `post` / `wdth` / `hght` | Agent position and dimension getters |
| `addv` / `subv` / `divv` | Arithmetic operations |
| `altr` | Alter room CA property |
| `lock` / `wait` | Execution control |
| `stim writ` | Send stimulus to creature |
| `kill` | Kill agent (`ownr` or `targ`) |
| `seta` | Set agent reference variable |
| `rscr` | Removal script block |
| `enum` / `next` | Enumerate agents by classifier |
| `scrx` | Remove event script |

## Web Rebuild Implementation Status

**All CAOS commands used in this file are implemented in the web rebuild.** No missing commands.

## Notes

- Bootstrap seeds use slower timer intervals (`ov70 = 100`, `ov71 = 1000`) compared to seeds spawned by flowers (`ov70 = 10`, `ov71 = 100`), reflecting different dispersal strategies.
- The environmental check cascade is ordered by priority: room type → heat → nutrients → radiation (with dormancy) → radiation → density → germinate.
- The radiation check has a special "marginal zone" (`ov84` to `ov83`) that triggers dormancy rather than a simple pass/fail, allowing seeds to wait for improving conditions.
- The `grow` subroutine uses `inst` to ensure atomic creation of the plant stem — the seed records its own dimensions, creates the plant, adjusts position, and kills itself in a single uninterruptible block.
- The removal script is the ecosystem-wide cleanup handler for all four foxglove agent types, making the seed file the authoritative removal point for the entire foxglove system.
