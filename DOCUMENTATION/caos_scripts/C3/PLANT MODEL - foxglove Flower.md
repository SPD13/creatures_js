# PLANT MODEL - foxglove Flower.cos - Foxglove Flower Scripts

**Source**: `Assets/Bootstrap/001 World/PLANT MODEL - foxglove Flower.cos`

## Overview

This script defines the event handlers for the foxglove **flower** agent (classifier 2 7 1). It is one of four interdependent files that together implement the foxglove plant ecosystem:

| File | Agent | Classifier | Role |
|---|---|---|---|
| `PLANT MODEL - foxglove Seed.cos` | Seed | 2 3 1 | Bootstrap seed spawning, germination, environmental checks, removal script |
| `PLANT MODEL - foxglove plant.cos` | Plant Stem | 2 4 1 | Main plant lifecycle: growth, flowering, fruiting, decay, nutrient uptake |
| `PLANT MODEL - foxglove Leaf.cos` | Leaf | 2 6 2 | Leaf growth, wilting, and detachment events |
| **`PLANT MODEL - foxglove Flower.cos`** | **Flower** | **2 7 1** | **Flower blooming, wilting, petal drop with seed dispersal** |

The flower agent is created by the **plant stem** (2 4 1) during its flowering phase (state 2). Flowers respond to messages from the parent plant to grow, wilt, and ultimately drop their petals — at which point they spawn a new **seed** (2 3 1) to continue the lifecycle. The flower does not have its own timer; all its behavior is driven by messages received from the parent plant.

**Sprite**: `fxgl.c16` — shared across all foxglove agents.

## Agent Reference: Foxglove Flower (2 7 1)

The flower is a simple agent created by the plant stem. It does not have a bootstrap install script or timer — it is entirely message-driven.

### Creation Context

The flower is created by the plant stem's timer script (`scrp 2 4 1 9`, state 2) with the following properties:

| Property | Value | Notes |
|---|---|---|
| Sprite | `fxgl` | 9 frames starting at first image 12 |
| Plane | Parent plant plane + 2 | Renders in front of the plant stem |
| Position | Parent `posl + 35`, `post - 38` | Offset to top-right of plant stem |
| `ov17` | Reference to parent plant (2 4 1) | Back-reference via `seta ov17 ownr` in creation code |

### Key Variables (Set by Parent Plant)

| Variable | Purpose | Initial Value |
|---|---|---|
| `ov17` | Reference to parent plant stem (2 4 1) | Set at creation |
| `ov30` | Closed bud base frame | 0 |
| `ov31` | Minimum open frame (transition threshold) | 2 |
| `ov32` | Wilted bud offset | 3 |
| `ov33` | Mid-open frame | 5 |
| `ov34` | Fully open frame | 6 |
| `ov35` | Max open frame | 8 |
| `ov70` | Flower maturity flag (checked by parent for fruiting) | 0, set to 1 when mature |

### Messages Handled

| Message # | Name | Sent By | Description |
|---|---|---|---|
| 300 | Grow | Plant stem (2 4 1) | Advance flower bloom by one frame |
| 301 | Wilt | Plant stem (2 4 1) | Reverse flower bloom / wilt by one frame |
| 302 | Drop Petals | Plant stem (2 4 1) | Shed petals (close flower) and spawn a seed |
| 303 | Check Maturity | Plant stem (2 4 1) | Signal parent if flower has reached fruiting stage |

---

### Message 300 — Grow (Bloom Advancement)

```
scrp 2 7 1 300
```

Advances the flower's visual bloom by one frame.

**Execution**: Instant (`inst`)

**Logic**:
1. Gets current pose, increments by 1, sets the new pose.
2. Switches target to parent plant (`targ ov17`).
3. Increments parent's `ov69` (active flower frame counter) by 1.

**Visual Effect**: The flower opens gradually from closed bud (frame 0) through intermediate stages toward fully open (frame 8).

---

### Message 301 — Wilt (Bloom Reversal)

```
scrp 2 7 1 301
```

Reverses the flower's bloom — either jumping to wilted state or decrementing one frame.

**Execution**: Instant (`inst`)

**Logic**:
- **If `pose <= ov31` (frame <= 2, still mostly closed)**:
  - Calculates wilted pose: `ov31 + ov32` (frame 2 + 3 = 5).
  - Sets pose to this wilted position (jumps to mid-wilted appearance).
  - Decrements parent's `ov69` by 1.
- **Else (flower is open beyond threshold)**:
  - Decrements pose by 1 (gradual closing).
  - Decrements parent's `ov69` by 1.

**Design**: Young buds that haven't fully opened skip straight to a wilted appearance rather than slowly closing. Open flowers wilt gradually frame by frame.

---

### Message 302 — Drop Petals (Seed Dispersal)

```
scrp 2 7 1 302
```

The flower sheds its petals and spawns a new seed agent. This is the key reproductive event in the foxglove lifecycle.

**Execution**: Instant (`inst`)

**Logic**:
1. **If `pose == ov31` (frame 2, wilted closed state)**:
   - Sets pose to `ov34` (frame 6 — petal-drop visual).
   - Decrements parent's `ov69` by 1.
2. **Else (flower is still partially open)**:
   - Increments pose by 1 (continues closing animation).
   - Decrements parent's `ov69` by 1.

3. **Spawns a new seed** (2 3 1) at the flower's position:

| Property | Value | Notes |
|---|---|---|
| Sprite | `fxgl` | 1 frame, random first image 25-28 (visual variety) |
| Plane | Flower's plane - 1 | Slightly behind the flower |
| Position | Flower's `posx`, `posy` | Drops from flower location |
| `attr` | 195 | Carryable + Mouseclickable + Physics + Collisions |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `elas` | 50 | Moderate bounce |
| `fric` | 100 | High friction (stops quickly on ground) |
| `accg` | 1 | Light gravity (drifts down slowly) |
| `velo` | x: rand -10 to 10, y: rand -5 to 0 | Random scatter on release |

4. **Seed variables initialized**:

| Variable | Value | Purpose |
|---|---|---|
| `ov00` | 1 | Seed state: landed/active (ready for environmental checks) |
| `ov70` | 10 | Normal timer interval |
| `ov71` | 100 | Dormant timer interval (slower when conditions are bad) |
| `ov72` | 50 | Initial viability countdown |
| `ov02` | 100 | Seed health/lifespan |
| `ov80` | 1 | Max heat threshold |
| `ov81` | 0.1 | Min heat threshold |
| `ov82` | 1 | Max radiation threshold |
| `ov83` | 0.01 | Min radiation threshold |
| `ov84` | 0.001 | Radiation lower bound |
| `ov85` | 1 | Max nutrient threshold |
| `ov86` | 0.1 | Min nutrient threshold |

5. Sets seed timer to `ov70` (10 ticks).

**Lifecycle Significance**: This message completes the plant's reproductive cycle. The flower drops petals and releases a seed that will drift to the ground, check environmental conditions, and potentially grow into a new plant.

---

### Message 303 — Check Maturity (Fruiting Signal)

```
scrp 2 7 1 303
```

The parent plant sends this message to check if the flower has matured enough to begin the fruiting/seed-release phase.

**Execution**: Instant (`inst`)

**Logic**:
1. Sets target to parent plant (`targ ov17`).
2. If parent exists (`targ ne null`):
   - If parent is in state 2 (flowering phase, `ov00 eq 2`):
     - Sets parent's state to 4 (transition to petal-drop/decay phase).

**Design**: The flower acts as a trigger for the parent plant's lifecycle transition. When the parent queries the flower's maturity (message 303), the flower responds by advancing the parent to the next lifecycle stage, initiating the petal-drop and eventual seed-release sequence.

---

## Foxglove Plant Lifecycle (Cross-File Context)

The flower's behavior only makes sense within the broader foxglove lifecycle managed across all four COS files:

```
  Bootstrap spawns 10 Seeds (2 3 1) at (1360, 480)
            |
            v
  [Seed] Timer checks environment:
  - Heat between 0.1 and 1.0
  - Radiation between 0.001 and 1.0
  - Nutrients between 0.1 and 1.0
  - Room type >= 5 (not water rooms 8/9)
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
  - Creates Flower (2 7 1) ← THIS FILE
  - Sends message 300 to Flower → bloom grows
  - Multiple flowers can bloom (up to ov68 = 3)
  - Sends message 303 to check flower maturity
  - When mature → State 4
            |
            v
  [Plant] State 3: Seed Release
  - Sends message 301 to Flower (wilt)
  - If all flowers wilted: sends message 302 (drop petals + spawn seed)
  - OR spawns seed directly from plant if no flowers
  - Transitions to State 5
            |
            v
  [Plant] State 4: Petal Drop / Wilt
  - Sends message 302 to Flower (close + spawn seed)
  - Kills flower reference
  - Transitions to State 5
            |
            v
  [Plant] State 5: Decay
  - Sends wilt messages to remaining flowers/leaves
  - Kills child agents (leaves, flowers)
  - Stem frame decrements (visual shrinking)
  - When fully decayed: kills self
```

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 4 1 (Plant Stem) | Message target via `ov17` | Flower modifies parent's `ov69` (flower counter) and `ov00` (lifecycle state) |
| 2 3 1 (Seed) | Created by message 302 | Flower spawns seed during petal drop — reproductive dispersal |

## Environmental Integration

The flower itself does not interact with room CAs (Chemical Agents) directly. However, it is a critical link in the foxglove ecosystem's environmental feedback loop:

- **Seeds** check room heat, radiation, and nutrients before germinating.
- **Plant stems** absorb nutrients (CA 3) and water (CA 4) from rooms, and benefit from light (CA 1).
- **Flowers** trigger seed creation, which re-enters the environmental check cycle.
- **Seeds** on death contribute small amounts of nutrients (CA 3 and CA 4) back to the room.

## CAOS Commands Used

| Command | Usage in This File |
|---|---|
| `scrp` | Define event scripts for classifier 2 7 1 |
| `inst` | Instant execution mode (all messages execute atomically) |
| `setv` | Set local and agent variables |
| `pose` | Get/set sprite frame (used as both getter and setter) |
| `addv` / `subv` | Increment/decrement variables |
| `targ` | Switch target agent (to parent plant or new seed) |
| `doif` / `else` / `endi` | Conditional logic |
| `le` / `eq` / `ne` | Comparison operators |
| `plne` | Get current drawing plane (used as rvalue) |
| `posx` / `posy` | Get center position (used as rvalue for seed placement) |
| `rand` | Random number generation (seed sprite variety, scatter velocity) |
| `new: simp` | Create new simple agent (seed) |
| `attr` | Set agent attributes |
| `bhvr` | Set creature interaction permissions |
| `elas` / `fric` / `accg` | Physics properties |
| `mvto` | Move agent to position |
| `velo` | Set velocity (seed scatter) |
| `tick` | Set timer interval on seed |
| `endm` | End message handler |

## Web Rebuild Implementation Status

**All CAOS commands used in this file are implemented in the web rebuild.** No missing commands.

## Notes

- This file contains **no install script** (`inst` block at file start) and **no removal script** (`rscr`). The flower agent's creation and cleanup are handled by the plant stem file and the seed file's removal script respectively.
- The seed file (`PLANT MODEL - foxglove Seed.cos`) contains the `rscr` removal script that cleans up all foxglove agents: seeds (2 3 1), plants (2 4 1), leaves (2 6 2), and flowers (2 7 1).
- The flower is entirely **message-driven** — it has no timer and no autonomous behavior.
- Frame numbering is relative to the `base` set by the parent; the flower uses 9 frames starting from first image 12 in `fxgl.c16`.
- The `ov69` variable on the parent plant tracks the cumulative flower frame state, used by the parent to coordinate multi-flower lifecycle progression.
