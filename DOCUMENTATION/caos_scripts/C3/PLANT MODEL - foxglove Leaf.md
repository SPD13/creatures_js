# PLANT MODEL - foxglove Leaf.cos - Foxglove Leaf Scripts

**Source**: `Assets/Bootstrap/001 World/PLANT MODEL - foxglove Leaf.cos`

## Overview

This script defines the event handlers for the foxglove **leaf** agent (classifier 2 6 2). It is one of four interdependent files that together implement the foxglove plant ecosystem:

| File | Agent | Classifier | Role |
|---|---|---|---|
| `PLANT MODEL - foxglove Seed.cos` | Seed | 2 3 1 | Bootstrap seed spawning, germination, environmental checks, removal script |
| `PLANT MODEL - foxglove plant.cos` | Plant Stem | 2 4 1 | Main plant lifecycle: growth, flowering, fruiting, decay, nutrient uptake |
| **`PLANT MODEL - foxglove Leaf.cos`** | **Leaf** | **2 6 2** | **Leaf growth, seasonal appearance, wilting, and detachment** |
| `PLANT MODEL - foxglove Flower.cos` | Flower | 2 7 1 | Flower blooming, wilting, petal drop with seed dispersal |

The leaf agent is created by the **plant stem** (2 4 1) during its stem growth phase (state 0). Leaves respond to messages from the parent plant to grow, change seasonal appearance, and detach. The leaf also has a **timer script** that handles autonomous wilting and decay over time. Unlike the flower, the leaf combines both message-driven behavior and timer-driven autonomous wilting.

**Sprite**: `fxgl.c16` — shared across all foxglove agents.

## Agent Reference: Foxglove Leaf (2 6 2)

The leaf is a simple agent created by the plant stem. It does not have a bootstrap install script — it is created dynamically by the parent plant. It has both message-driven behavior (grow, season change, detach) and a timer-driven wilt cycle.

### Creation Context

The leaf is created by the plant stem during state 0 (stem growth) or state 1 (leaf growth). The parent plant sets several variables on the leaf at creation time to control its visual appearance across states.

### Key Variables

| Variable | Purpose | Notes |
|---|---|---|
| `ov00` | Leaf state | 0 = normal healthy, 1 = warm-wilted, 2 = cold/seasonal healthy, 3 = cold/seasonal wilted |
| `ov17` | Reference to parent plant stem (2 4 1) | Set at creation |
| `ov30` | Base frame for normal healthy appearance | Set by parent plant |
| `ov37` | Base frame for warm-wilted appearance | Set by parent plant |
| `ov38` | Base frame for cold/seasonal healthy appearance | Set by parent plant |
| `ov39` | Base frame for cold/seasonal wilted appearance | Used in season change (msg 301) |
| `ov51` | Leaf growth/size counter | Incremented by grow messages, decremented by timer |
| `ov60` | Leaf counter on parent plant (via `targ ov17`) | Tracks aggregate leaf growth across the plant |
| `ov99` | Leaf active flag | 0 = inactive/dead, 1 = active/alive |

### Leaf State Machine

The leaf has a 2-axis state system combining **health** (healthy vs. wilted) and **season** (warm vs. cold):

```
              Warm Season        Cold Season
            ┌──────────────┬──────────────────┐
  Healthy   │ ov00 = 0     │ ov00 = 2         │
            │ base = ov30  │ base = ov38       │
            ├──────────────┼──────────────────┤
  Wilted    │ ov00 = 1     │ ov00 = 3         │
            │ base = ov37  │ base = ov38/ov39  │
            └──────────────┴──────────────────┘
```

State transitions:
- **Grow (msg 300)**: If `ov51 > 5`, resets to healthy state (0 or 2 depending on current season axis)
- **Season change (msg 301)**: Switches between warm/cold axis while preserving health axis
- **Timer (event 12)**: When `ov51 <= 5`, transitions from healthy to wilted (0→1 or 2→3)

### Messages Handled

| Message # | Name | Sent By | Description |
|---|---|---|---|
| 300 | Grow | Plant stem (2 4 1) | Advance leaf growth |
| 301 | Season Change | Plant stem (2 4 1) | Switch leaf appearance between warm and cold season |
| 302 | Detach | Plant stem (2 4 1) | Detach leaf from plant |
| 12 | Timer | Self (autonomous) | Autonomous wilt and decay cycle |

---

### Message 300 — Grow

```
scrp 2 6 2 300
```

Advances the leaf's growth by incrementing the size counter and potentially resetting its visual state to healthy.

**Execution**: Instant (`inst`)

**Logic**:
1. Increments `ov51` (leaf size counter) by 1.
2. If `ov51 > 5` (leaf has grown past the healthy threshold):
   - If in a warm state (`ov00 = 0` or `ov00 = 1`): resets to normal healthy state (`ov00 = 0`), sets `base` to `ov30`, resets `pose` to 0.
   - If in a cold state (`ov00 = 2` or `ov00 = 3`): resets to cold healthy state (`ov00 = 2`), sets `base` to `ov38`, resets `pose` to 0.
3. Sets `ov99 = 1` (marks leaf as active).
4. Targets parent plant (`targ ov17`) and increments parent's `ov60` (aggregate leaf counter) by 1.

**Design**: Growth messages from the parent not only increase the size counter but can also reverse wilting. If the leaf has wilted (states 1 or 3) but receives enough growth, it recovers to a healthy state while preserving the current seasonal appearance.

---

### Message 301 — Season Change

```
scrp 2 6 2 301
```

Changes the leaf's visual appearance to reflect the current season. The season is communicated via the first parameter (`_p1_`).

**Execution**: Instant (`inst`)

**Logic**:

**If `_p1_ = 0` (warm season — spring/summer)**:
- If healthy (`ov00 = 0` or `ov00 = 2`): sets `base` to `ov30` (normal healthy). If was in cold state (`ov00 = 2`), transitions to warm healthy (`ov00 = 0`).
- If wilted (`ov00 = 1` or `ov00 = 3`): sets `base` to `ov37` (warm wilted). If was in cold wilted state (`ov00 = 3`), transitions to warm wilted (`ov00 = 1`).

**If `_p1_ != 0` (cold season — autumn/winter)**:
- If warm healthy (`ov00 = 0`): sets `base` to `ov38` (cold healthy appearance). State `ov00` is **not** explicitly updated here — the visual change is applied immediately but the state transition to `ov00 = 2` would occur on the next grow message.
- If warm wilted (`ov00 = 1`): sets `base` to `ov39` (cold wilted appearance). Similarly, `ov00` is not explicitly updated.

**Design**: The season change message is a visual-first system. When switching to cold season, the sprite base is updated immediately but the state variable is not explicitly changed. This means the leaf's `ov00` state is updated lazily — either by a subsequent grow message (which checks current state) or by a subsequent timer tick. The warm-to-cold transition is purely cosmetic until the next state-changing event.

---

### Message 302 — Detach

```
scrp 2 6 2 302
```

Detaches the leaf from the parent plant, marking it as dead.

**Execution**: Instant (`inst`)

**Logic**:
1. Decrements `ov51` (leaf size counter) by 1.
2. Sets `ov99 = 0` (marks leaf as inactive/dead).
3. Targets parent plant (`targ ov17`) and decrements parent's `ov60` (leaf counter) by 1.

**Design**: This is a cleanup message sent by the parent plant during its decay phase (state 5). It does not kill the leaf agent — it only marks it as inactive and disconnects it from the parent's tracking. The parent plant handles the actual `kill` of the leaf agent separately.

---

### Event 12 — Timer (Autonomous Wilt)

```
scrp 2 6 2 12
```

The leaf's timer script handles autonomous wilting and decay independently of the parent plant's messages.

**Execution**: Instant (`inst`)

**Logic**:
1. **Guard**: If `ov99 = 0` (leaf is inactive), immediately `stop` — no processing.
2. Decrements `ov51` (leaf size) by 1.
3. If `ov51 <= 1`: sets `ov99 = 0` (marks leaf as dead — size has reached minimum).
4. If `ov51 <= 5` (leaf has shrunk below healthy threshold):
   - If warm healthy (`ov00 = 0`): transitions to warm wilted (`ov00 = 1`), sets `base` to `ov37`.
   - If cold healthy (`ov00 = 2`): transitions to cold wilted (`ov00 = 3`), sets `base` to `ov38`.
5. Targets parent plant (`targ ov17`). If parent still exists (`targ ne null`), decrements parent's `ov60` by 1.

**Design**: The timer creates a natural decay cycle for the leaf. Each tick shrinks the leaf, and when it drops below threshold 5, the visual changes to a wilted appearance. When it reaches 1, the leaf dies. The parent plant can counteract this by sending grow messages (msg 300) that increment `ov51` and potentially restore the healthy appearance.

**Note**: When transitioning cold healthy (state 2) to cold wilted (state 3), the base is set to `ov38` (cold healthy base) rather than `ov39` (cold wilted base as used in message 301). This may be an intentional design choice — during autonomous wilting in cold season, the leaf uses the cold base frame rather than the distinct cold-wilted sprite — or it may be a minor inconsistency in the original script.

---

## Lifecycle Integration

The leaf's behavior fits into the broader foxglove lifecycle:

```
  [Plant] State 0: Stem Growth
  - When fully grown → creates Leaf (2 6 2)
  - Transitions to State 1
          |
          v
  [Plant] State 1: Leaf Growth
  - Sends message 300 to Leaf → leaf grows (ov51 increases)
  - Energy cost per tick
  - When leaf timer expires → State 2 (Flowering)
          |
          v
  [Leaf] Timer (event 12) runs autonomously:
  - Each tick decrements ov51
  - When ov51 <= 5 → leaf wilts visually
  - When ov51 <= 1 → leaf dies (ov99 = 0)
  - Parent grow messages (300) counteract this decay
          |
          v
  [Plant] State 5: Decay
  - Sends message 302 to Leaf → leaf detached
  - Parent kills leaf agent
```

The tension between the plant's grow messages (300) increasing `ov51` and the timer's autonomous decay decreasing `ov51` creates a natural growth/decay cycle. A healthy, well-nourished plant sends enough grow messages to keep leaves green; a struggling plant's leaves gradually wilt and die.

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 2 4 1 (Plant Stem) | Parent reference via `ov17` | Leaf modifies parent's `ov60` (leaf counter) in grow, detach, and timer events |

## Environmental Integration

The leaf does not directly interact with room CAs (Chemical Agents). Its health is indirectly driven by the parent plant's ability to send grow messages, which depends on the plant's nutrient and water uptake from the room environment.

## CAOS Commands Used

| Command | Usage in This File |
|---|---|
| `scrp` | Define event scripts for classifier 2 6 2 |
| `inst` | Instant execution mode (all messages execute atomically) |
| `addv` / `subv` | Increment/decrement variables (`ov51`, `ov60`) |
| `setv` | Set agent variables (`ov00`, `ov99`) |
| `doif` / `elif` / `else` / `endi` | Conditional logic |
| `eq` / `gt` / `le` / `ne` / `or` | Comparison and logical operators |
| `base` | Set sprite base frame for appearance changes |
| `pose` | Set sprite pose within current base |
| `targ` | Switch target agent (to parent plant) |
| `stop` | Stop script execution (guard clause in timer) |
| `_p1_` | Read first message parameter (season indicator in msg 301) |
| `null` | Null agent comparison (parent existence check) |
| `endm` | End message handler |

## Web Rebuild Implementation Status

**All CAOS commands used in this file are implemented in the web rebuild.** No missing commands.

## Notes

- This file contains **no install script** and **no removal script** (`rscr`). The leaf's creation and cleanup are handled by the plant stem file and the seed file's removal script respectively.
- The leaf combines **message-driven** behavior (grow, season, detach) with **timer-driven** autonomous decay, unlike the flower which is purely message-driven.
- The 4-state system (warm/cold x healthy/wilted) creates seasonal visual variety while maintaining simple state logic.
- The `ov60` variable on the parent plant tracks aggregate leaf growth across all the plant's leaves, used by the parent to coordinate the overall plant lifecycle.
- The cold season transition in message 301 applies visual changes without explicitly updating `ov00`, creating a lazy state update pattern.
