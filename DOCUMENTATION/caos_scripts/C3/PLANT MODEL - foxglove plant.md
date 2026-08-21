# PLANT MODEL - foxglove plant.cos - Foxglove Plant Stem Lifecycle

**Source**: `Assets/Bootstrap/001 World/PLANT MODEL - foxglove plant.cos`

## Overview

This script defines the timer event handler for the foxglove **plant stem** agent (classifier 2 4 1). It implements the complete lifecycle of a foxglove plant — from stem growth through leaf production, flowering, seed release, and eventual decay. The plant stem is the central coordination agent in the foxglove ecosystem, managing resource uptake from the room environment, spawning child agents (leaves, flowers, seeds), and driving the entire reproductive cycle.

The plant stem is created by the **seed** agent (2 3 1) upon successful germination. Once alive, its timer script drives a 6-state lifecycle machine, absorbing nutrients (CA 3) and water (CA 4) from the room, converting sunlight (CA 1) into energy via leaves, and eventually producing new seeds to continue the cycle.

This script is one of four interdependent files that together implement the foxglove plant ecosystem:

| File | Agent | Classifier | Role |
|---|---|---|---|
| `PLANT MODEL - foxglove Seed.cos` | Seed | 2 3 1 | Bootstrap seed spawning, germination, environmental checks, removal script |
| **`PLANT MODEL - foxglove plant.cos`** | **Plant Stem** | **2 4 1** | **Main plant lifecycle: growth, flowering, fruiting, decay, nutrient uptake** |
| `PLANT MODEL - foxglove Leaf.cos` | Leaf | 2 6 2 | Leaf growth, wilting, and detachment events |
| `PLANT MODEL - foxglove Flower.cos` | Flower | 2 7 1 | Flower blooming, wilting, petal drop with seed dispersal |

**Sprite**: `fxgl.c16` — shared across all foxglove agents. The plant stem uses 12 frames starting at first image 0 (frames 0-4 for growth, frame 5 for mature, frames 6-11 for decay animation).

## Created Agents

The plant stem dynamically creates child agents during its lifecycle. These are not spawned at bootstrap — they are created by the timer script as the plant progresses through its growth stages.

| Classifier | Name | Sprite | Created In | Description | Detail |
|---|---|---|---|---|---|
| 2 6 2 | Foxglove Leaf | `fxgl` frames 21-24 | State 0 (Stem Growth) | Photosynthesis organ; grows and wilts based on plant health | [Detail](#foxglove-leaf-2-6-2-creation) |
| 2 7 1 | Foxglove Flower | `fxgl` frames 12-20 | State 2 (Flowering) | Reproductive organ; blooms, wilts, and drops petals to release seeds | [Detail](#foxglove-flower-2-7-1-creation) |
| 2 3 1 | Foxglove Seed | `fxgl` | State 3 (Seed Release) | Fallback seed creation when plant has no flowers | [Detail](#foxglove-seed-2-3-1-creation) |

---

## Foxglove Plant Stem (2 4 1)

The plant stem is the central lifecycle agent for the foxglove. It is created by the seed's germination subroutine and runs its entire lifecycle through a single timer event (event 9). Each timer tick, the plant performs resource uptake, nutrient loss, health evaluation, and then advances its lifecycle state machine.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Complete lifecycle management: resource uptake, state machine, child agent coordination |

---

### Event 9 — Timer (Lifecycle Management)

```
scrp 2 4 1 9
```

The timer is the plant's core logic loop. Each tick follows this sequence:

1. **`gsub up_t`** — Absorb nutrients and water from the room; gain energy from sunlight via leaves
2. **`gsub loss`** — Lose nutrients proportional to leaf count and room radiation; return some to room
3. **`gsub what`** — Check plant health; trigger death if resources depleted; signal stress to leaves
4. **State machine** — Execute behavior for the current lifecycle state (ov00)

### Key Variables

**Internal Resources:**

| Variable | Initial | Purpose |
|---|---|---|
| `ov50` | 0.1 | Internal nutrient store (absorbed from room CA 3) |
| `ov51` | 0.005 | Nutrient absorption rate per tick |
| `ov52` | 0.5 | Maximum nutrient capacity |
| `ov55` | 0.1 | Internal energy store (absorbed from room CA 4 + sunlight) |
| `ov56` | 0.0001 | Water absorption rate per tick from room CA 4 |
| `ov57` | 0.5 | Maximum energy capacity |
| `ov58` | 0.001 | Heat threshold — water absorption halved when room heat (CA 1) is below this |

**Growth and Lifecycle:**

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | Lifecycle state (0-5, see state machine below) |
| `ov30` | 5 | Stem growth frame count (growth animation: frames 0 to ov30-1) |
| `ov31` | 11 | Decay animation start frame |
| `ov32` | 6 | Death frame — plant dies when pose reaches this during decay |
| `ov54` | 10 | Nutrient stress divisor (stress threshold = ov52 / ov54 = 0.05) |
| `ov62` | 0.0002 | Sunlight energy bonus rate per leaf |
| `ov63` | 500 | Radiation loss divisor (nutrient loss = radiation / ov63) |
| `ov64` | 0 | Stress flag (0=normal, 1=low nutrients — sent to leaves as season signal) |
| `ov65` | 1 | Fertility flag (1=can produce seeds; controls seed release in state 3) |

**Child Agent Tracking:**

| Variable | Initial | Purpose |
|---|---|---|
| `ov17` | null | Reference to leaf agent (2 6 2) |
| `ov18` | null | Reference to flower agent (2 7 1) |
| `ov60` | 0 | Current leaf frame counter (incremented by leaf grow messages) |
| `ov61` | 10 | Target leaf growth count |
| `ov66` | 30 | Leaf growth countdown — ticks remaining before transition to flowering |
| `ov67` | 30 | Flower wilt countdown — ticks remaining before transition to seed release |
| `ov68` | 3 | Maximum number of flowers |
| `ov69` | 0 | Flower frame counter (tracked across flower grow/wilt messages) |
| `ov73` | 30 | Flower growth timer reset value (used when cycling back from state 4) |
| `ov74` | 30 | Flower wilt timer reset value (used when cycling back from state 4) |

**Energy Costs:**

| Variable | Initial | Purpose |
|---|---|---|
| `ov70` | 0.0001 | Energy drain per tick during stem growth (state 0) |
| `ov71` | 0.001 | Energy cost per flower operation (creation/grow message) |
| `ov72` | 0.001 | Energy cost per leaf operation (creation/grow message) |

**Timer Settings:**

| Variable | Initial | Purpose |
|---|---|---|
| `ov80` | 300 | Main timer interval (set by seed at germination) |
| `ov82` | 100 | Decay timer interval (faster ticks during state 5) |

---

### Lifecycle State Machine

The plant progresses through 6 states (ov00 = 0 through 5). Each state is an independent `doif` block evaluated per tick.

```
State 0: Stem Growth
    |
    v
State 1: Leaf Growth
    |
    v
State 2: Flowering
   / \
  v   v
State 3: Seed Release    State 4: Wilt / Cleanup
  \   /
   v v
State 5: Decay → Death
```

---

#### State 0 — Stem Growth

The stem visually grows by advancing its sprite pose one frame per tick, from frame 0 to frame `ov30 - 1` (= 4).

**Each tick**:
- If `pose < ov30 - 1`: increment pose by 1 (stem grows taller)
- If pose has reached maximum (stem fully grown):
  - If `ov61 > 0` and `ov60 == 0` (leaf target set but no leaf exists): create a leaf agent (2 6 2)
  - Set pose to `ov30` (frame 5 — mature stem appearance)
  - Transition to **State 1**

**Energy cost**: `ov72` per leaf creation + `ov70` per tick

**Leaf creation** (see [detail below](#foxglove-leaf-2-6-2-creation)):
- Creates leaf at plant's position with plane + 1
- Sets leaf visual frame variables (ov30, ov37, ov38, ov39)
- Stores leaf reference in plant's `ov17`
- Increments plant's `ov60` (leaf counter)

---

#### State 1 — Leaf Growth

The plant sends grow messages to its leaf, building up the leaf's size counter. A countdown timer (`ov66`) controls how long this phase lasts.

**Each tick**:
- If `ov60 < ov61` (leaf needs growth): send message 300 (grow) to leaf via `ov17`, costs `ov72` energy
- Decrement `ov66` (leaf growth countdown)
- When `ov66 <= 0`: transition to **State 2**

**Sunlight bonus**: During this state, the `up_t` subroutine provides extra energy from sunlight proportional to leaf count (`ov62 * ov60`), but only when room heat exceeds `ov58`.

---

#### State 2 — Flowering

The plant creates a flower and sends it grow messages to bloom. A wilt countdown (`ov67`) runs once all flowers have been created.

**Each tick**:
- If `ov60 < ov61`: continue sending grow messages to leaf (costs `ov72`)
- **Flower creation**: If `ov68 != 0` and `ov69 == 0` (flowers needed, none exist):
  - Create flower agent (2 7 1) at offset position (`posl + 35`, `post - 38`)
  - Set flower frame variables (ov30-ov35)
  - Store flower reference in plant's `ov18`
  - Increment `ov69`, costs `ov71` energy
- **Flower growth**: If `ov68 != ov69` (more flower frames needed): send message 300 (grow) to flower, costs `ov71`
- **Maturity check**: When `ov68 == ov69` (all flower frames reached): decrement `ov67` (wilt countdown)
- **Flower maturity trigger**: Check flower's `ov70` flag — if 1 (mature), transition to **State 4**
- When `ov67 <= 0`: transition to **State 3**

---

#### State 3 — Seed Release

The plant attempts to release seeds. If flowers exist, they are wilted first. If no flowers exist and the plant is fertile (`ov65 == 1`), it spawns a seed directly.

**Each tick**:
- If `ov60 < ov61`: continue sending grow messages to leaf
- **If fertile (`ov65 == 1`)**:
  - If flowers exist (`ov69 != 0`): send message 301 (wilt) to flower
  - If no flowers:
    - 1-in-6 chance (`rand 0 5 eq 0`): create a new seed agent (2 3 1) at plant's position with random scatter velocity
    - Kill flower reference, transition to **State 5**
- **If not fertile (`ov65 != 1`)**: transition to **State 4**

**Seed creation** (see [detail below](#foxglove-seed-2-3-1-creation)):
Seeds created here use the same initial variables as flower-spawned seeds (timer 10, dormant 100, viability 50, health 100).

---

#### State 4 — Wilt / Cleanup

A transitional state that closes out flowering before entering decay. If flowers exist, they receive petal-drop messages. If no flowers remain, the plant resets timers and transitions to decay.

**Each tick**:
- If flowers exist (`ov69 != 0`): send message 302 (drop petals) to flower — this spawns a seed from the flower
- If no flowers:
  - Kill flower agent reference
  - Reset `ov66` to `ov73` (flower growth timer) and `ov67` to `ov74` (flower wilt timer)
  - Transition to **State 5**

---

#### State 5 — Decay

The plant progressively cleans up its child agents and shrinks visually until it dies. The timer is changed to `ov82` (100 ticks) for faster decay.

**Decay sequence** (priority-ordered per tick):
1. **Death check**: If `pose == ov32` (frame 6): `kill targ` — plant dies
2. **Flower cleanup**: If flowers exist (`ov69 > 0`): send message 301 (wilt) to flower
3. **Flower kill**: If flower reference exists but no flower frames: kill flower agent
4. **Leaf cleanup**: If leaves exist (`ov60 > 0`): send message 302 (detach) to leaf
5. **Stem decay animation**: If no leaves remain:
   - If `pose == ov30` (frame 5, mature): kill leaf agent, jump to frame `ov31` (11)
   - Decrement pose by 1 each tick (visual shrinking: 11 → 10 → 9 → 8 → 7 → 6)
   - When pose reaches `ov32` (6): plant dies (step 1 on next tick)

**Decay visual**: The stem animates through frames 11 down to 6, representing progressive wilting and shrinking before death.

---

### Subroutine: `up_t` (Resource Uptake)

Called every tick. Absorbs nutrients and water from the room environment and converts sunlight into energy.

**Nutrient Uptake (from Room CA 3)**:
- Only absorbs when internal store (`ov50`) is below maximum capacity (`ov52`)
- Absorbs at rate `ov51` (0.005) per tick, or all available room nutrients if less
- Removes absorbed amount from room CA 3 via `altr`
- Adds absorbed amount to internal nutrient store (`ov50`)

**Water/Energy Uptake (from Room CA 4)**:
- Only absorbs when energy (`ov55`) is below maximum (`ov57`)
- Absorbs at rate `ov56` (0.0001) per tick, or all available room water if less
- Removes **half** the absorbed amount from room CA 4 (plants only drain half the water they take)
- **Cold penalty**: If room heat (CA 1) is below `ov58` (0.001), absorption rate is halved
- Adds absorbed amount to internal energy store (`ov55`)

**Sunlight Bonus (from Room CA 1)**:
- Only active during State 1 (leaf growth) when leaves exist (`ov60 > 0`)
- Only when room heat (CA 1) exceeds `ov58` (warm conditions)
- Energy gained = `ov62` (0.0002) x leaf count (`ov60`)
- More leaves = more energy from sunlight — incentivizes leaf growth

---

### Subroutine: `loss` (Nutrient Loss)

Called every tick. The plant loses nutrients proportional to its size (leaf count) and ambient radiation.

**Calculation**:
- Loss = `(ov60 + 1) * (room_radiation / ov63)`
- Where `ov60` = leaf count, `ov63` = 500 (divisor)
- More leaves and higher radiation = faster nutrient depletion

**Nutrient recycling**: Half of the lost nutrients are returned to the room (CA 3) via `altr`. This represents organic matter decomposition — the plant returns some nutrients to the soil as it metabolizes.

---

### Subroutine: `what` (Health Check)

Called every tick. Evaluates plant health and communicates stress to leaves.

**Death trigger**: If nutrients (`ov50`) or energy (`ov55`) reach zero → immediate transition to State 5 (decay).

**Stress detection**: If nutrients are below 5% of capacity (`ov50 < ov52 / ov54` = 0.05):
- Sets `ov64 = 1` (stressed)
- Otherwise sets `ov64 = 0` (healthy)

**Leaf communication**: Sends message 301 (season change) to leaf with `ov64` as the first parameter. When stressed (`ov64 = 1`), leaves switch to a wilted/cold-season appearance. This creates a visual feedback loop — a struggling plant's leaves visibly wilt.

---

## Foxglove Leaf (2 6 2) Creation

Created in **State 0** when the stem reaches full growth.

| Property | Value | Notes |
|---|---|---|
| Sprite | `fxgl` | 4 frames, first image 21 |
| Plane | Parent plant plane + 1 | Renders in front of stem |
| Position | Parent `posl`, `post` | Aligned to plant's left-top |

**Variables set on leaf by plant:**

| Variable | Value | Purpose |
|---|---|---|
| `ov17` | Plant reference | Back-reference to parent stem |
| `ov30` | 0 | Normal healthy base frame |
| `ov37` | 1 | Warm-wilted base frame |
| `ov38` | 2 | Cold/seasonal healthy base frame |
| `ov39` | 3 | Cold/seasonal wilted base frame |
| `ov50` | Plant's `ov61` (10) | Target leaf count (unused by leaf scripts) |
| `ov51` | Plant's `ov60` (0) | Initial leaf size counter |

The leaf's behavior scripts are defined in `PLANT MODEL - foxglove Leaf.cos`.

---

## Foxglove Flower (2 7 1) Creation

Created in **State 2** when the plant begins flowering.

| Property | Value | Notes |
|---|---|---|
| Sprite | `fxgl` | 9 frames, first image 12 |
| Plane | Parent plant plane + 1 | Renders in front of stem |
| Position | Parent `posl + 35`, `post - 38` | Offset to upper-right of plant |

**Variables set on flower by plant:**

| Variable | Value | Purpose |
|---|---|---|
| `ov17` | Plant reference | Back-reference to parent stem |
| `ov30` | 0 | Closed bud base frame |
| `ov31` | 2 | Minimum open frame (transition threshold) |
| `ov32` | 3 | Wilted bud offset |
| `ov33` | 5 | Mid-open frame |
| `ov34` | 6 | Fully open frame |
| `ov35` | 8 | Max open frame |

The flower's behavior scripts are defined in `PLANT MODEL - foxglove Flower.cos`.

---

## Foxglove Seed (2 3 1) Creation

Created in **State 3** as a fallback when no flowers exist. This is a direct seed-drop from the plant itself, bypassing the normal flower → petal drop → seed path.

| Property | Value | Notes |
|---|---|---|
| Sprite | `fxgl` | 1 frame |
| `attr` | 195 | Carryable + Mouseclickable + Physics + Collisions |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `elas` | 50 | Moderate bounce |
| `fric` | 100 | High friction |
| `accg` | 1 | Light gravity |
| `velo` | x: rand -10 to 10, y: rand -5 to 0 | Random scatter |
| Position | Plant's `posx`, `post` | Drops from plant position |
| Timer | 10 ticks | Fast germination checks |

**Seed variables initialized:**

| Variable | Value | Purpose |
|---|---|---|
| `ov00` | 1 | Seed state: active |
| `ov70` | 10 | Normal timer interval |
| `ov71` | 100 | Dormant timer interval |
| `ov72` | 50 | Viability countdown |
| `ov02` | 100 | Seed health |
| `ov80` | 1 | Max heat threshold |
| `ov81` | 0.1 | Min heat threshold |
| `ov82` | 1 | Max radiation threshold |
| `ov83` | 0.01 | Min radiation threshold |
| `ov84` | 0.001 | Radiation lower bound |
| `ov85` | 1 | Max nutrient threshold |
| `ov86` | 0.1 | Min nutrient threshold |

**Note**: Seeds created directly by the plant (state 3) inherit `va00` and `va01` from prior subroutine calculations as the `new: simp` first-image and plane parameters, resulting in near-zero values (truncated floats). This differs from seeds created by the flower's petal drop (message 302 in `foxglove Flower.cos`), which correctly use `rand 25 28` for the sprite frame. In practice, this code path is a rare fallback — the normal reproductive path goes through the flower.

---

## Foxglove Plant Lifecycle (Cross-File Context)

```
  Bootstrap spawns 10 Seeds (2 3 1) at (1360, 480)
            |
            v
  [Seed] Timer checks environment → germinates →
            |
            v
  [Plant] State 0: Stem Growth (this script)
  - Stem frame increments each tick (0 → 4)
  - When fully grown (frame 4): creates Leaf (2 6 2)
  - Sets pose to mature frame (5)
  - Transitions to State 1
            |
            v
  [Plant] State 1: Leaf Growth
  - Sends message 300 to Leaf → leaf grows (ov51 increases)
  - Sunlight bonus: more leaves = more energy from room heat
  - Countdown timer (ov66 = 30) ticks down
  - When ov66 = 0 → State 2
            |
            v
  [Plant] State 2: Flowering
  - Creates Flower (2 7 1) at offset position
  - Sends message 300 to Flower → bloom advances
  - When all flower frames filled (ov68 = ov69): wilt countdown (ov67) starts
  - If flower signals maturity (ov70 = 1) → State 4
  - When ov67 = 0 → State 3
            |
            v
  [Plant] State 3: Seed Release
  - If flowers exist: sends wilt messages (301)
  - If no flowers: 1-in-6 chance to create seed directly
  - Kills flower, transitions to State 5
            |
  [Plant] State 4: Wilt / Cleanup (alternate path from State 2)
  - Sends petal-drop (302) to flower → flower spawns seed
  - Resets timers, transitions to State 5
            |
            v
  [Plant] State 5: Decay
  - Faster timer (100 ticks)
  - Wilts remaining flowers (301)
  - Detaches leaves (302)
  - Kills child agents
  - Stem shrinks: frames 11 → 10 → 9 → 8 → 7 → 6
  - Dies at frame 6 (kill targ)
```

## Environmental Integration

| Agent | CA | Direction | Detail |
|---|---|---|---|
| Plant (2 4 1) | Heat (CA 1) | Read | Sunlight bonus for energy (in `up_t`); cold penalty halves water absorption |
| Plant (2 4 1) | Radiation (CA 2) | Read | Drives nutrient loss in `loss` subroutine |
| Plant (2 4 1) | Nutrients (CA 3) | Read / Write | Absorbs nutrients (in `up_t`); returns half of metabolic loss (in `loss`) |
| Plant (2 4 1) | Water (CA 4) | Read | Absorbs water for energy (in `up_t`); only removes half from room |

**Resource flow summary**:
- **Input**: Nutrients (CA 3) and Water (CA 4) are absorbed from the room each tick
- **Conversion**: Water + Sunlight (CA 1) → Energy; Nutrients → Internal nutrient store
- **Output**: Half of metabolic nutrient loss returns to room CA 3 (nutrient recycling)
- **Stress signal**: Low nutrients trigger visual wilting in leaves via message 301

## CAOS Commands Used

| Command | Usage in This File |
|---|---|
| `scrp` / `endm` | Define timer event script for classifier 2 4 1 |
| `gsub` / `subr` / `retn` | Subroutine calls (up_t, loss, what) |
| `doif` / `elif` / `else` / `endi` | Conditional logic (state machine, resource checks) |
| `eq` / `ne` / `gt` / `lt` / `le` / `and` / `or` | Comparison and logical operators |
| `setv` / `seta` | Set value and agent reference variables |
| `addv` / `subv` / `divv` / `mulv` / `negv` | Arithmetic operations |
| `inst` / `slow` | Instant execution mode / return to normal |
| `new: simp` | Create new simple agent (leaf, flower, seed) |
| `mvto` / `mvsf` / `tmvt` | Move agent to position / safe move / test move |
| `velo` | Set velocity (seed scatter) |
| `pose` | Get/set sprite frame |
| `tick` | Set timer interval |
| `rand` | Random number generation |
| `kill` | Kill agent (targ, ov17, ov18) |
| `prop` | Read room CA properties |
| `altr` | Alter room CA property (nutrient uptake/return) |
| `mesg writ` / `mesg wrt+` | Send message to agent / send message with parameters |
| `targ` / `ownr` | Switch/reference target agent |
| `plne` / `posl` / `post` / `posx` | Agent position and plane getters |
| `attr` / `bhvr` / `elas` / `fric` / `accg` | Agent physics and interaction properties |
| `room` | Get room ID for agent |

## Web Rebuild Implementation Status

**All CAOS commands used in this file are implemented in the web rebuild.** No missing commands.

## Notes

- This file contains **no install script** — the plant stem is created by the seed's germination subroutine in `PLANT MODEL - foxglove Seed.cos`.
- This file contains **no removal script** — cleanup is handled by the seed file's `rscr` block.
- The `what` subroutine repurposes the leaf's "season change" message (301) as a stress indicator. When the plant is low on nutrients, leaves receive `_p1_ = 1` and switch to a wilted appearance, creating visual feedback of plant health.
- The sunlight energy bonus in `up_t` only applies during State 1 (leaf growth), creating a biological incentive: more leaves → more energy → faster growth, but more leaves also → more nutrient loss (in `loss`).
- The `loss` subroutine returns half of metabolic nutrient loss to the room (CA 3), simulating organic decomposition and creating a nutrient recycling loop in the ecosystem.
- Water absorption from the room is conservative — the plant only removes half the water it absorbs from room CA 4, reflecting that plants return moisture through transpiration.
- Seeds created directly by the plant in State 3 use leftover local variable values for sprite frame and plane parameters, unlike seeds created by the flower's petal drop which correctly use `rand 25 28`. This is likely a minor oversight in the original script, as the flower path is the primary reproductive mechanism.
- The state machine uses separate `doif` blocks (not elif), so state transitions within a tick could theoretically cause multiple state blocks to execute. In practice, transitions are to higher-numbered states and only the matching block runs per tick.
