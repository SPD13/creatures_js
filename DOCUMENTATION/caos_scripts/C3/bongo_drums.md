# Bongo Drums

## Overview

This script creates a set of bongo drums, a toy that creatures and the player can interact with. The bongo drums are a simple physics-enabled object placed in the Norn Terrarium area. When pushed or pulled (hit), they play a drum sound and animate — the side hit determines which drum sound is played (left or right). Interacting with the drums provides creatures with a play stimulus (stimulus 97) and sends an urge signal that satisfies their need for play while reducing boredom. The drums also wake up any nearby creatures when played.

## Created Agents

| Agent | Classifier | Description | Details |
|-------|-----------|-------------|---------|
| Bongo Drums | `2 21 10` | A pair of bongo drums that creatures can hit to play sounds | [Details](#bongo-drums-2-21-10) |

---

## Bongo Drums (2 21 10)

A simple interactive toy using the sprite `bongo_drums` with 11 frames. The drums are placed at coordinates (3000, 510) with full physics (gravity, friction, carryable). They respond to both push and pull actions with identical behavior — playing a drum animation and sound effect based on which side is hit.

**Agent Properties:**
- **Sprite**: `bongo_drums` (11 frames)
- **Attributes** (199): Carryable, mouse-clickable, activatable (1 and 2), physics, suffers physics
- **Behaviors** (3): Activate 1 (push) and Activate 2 (pull)
- **Permeability**: 60
- **Gravity**: 2
- **Friction**: 100
- **Elasticity**: 0
- **OV61**: 50 (unused in scripts, possibly reserved)

### Events

| Event | Script | Description |
|-------|--------|-------------|
| Timer | `2 21 10 101` | Idle wobble animation |
| Activate 1 (Push) | `2 21 10 1` | Hit the drums — plays sound and animation |
| Activate 2 (Pull) | `2 21 10 2` | Hit the drums — identical to push behavior |

### Event Details

#### Timer (101)

Plays a short idle wobble animation `[4 5 5 5 0]`, giving the drums a subtle visual presence when not being played.

#### Activate 1 — Push (1)

Runs instantly (`INST`). When a creature or the player hits the drums:

1. **Urge signal**: Sends an urge to the activating agent with need-for-play = 0.5 and boredom reduction = -1.
2. **Stimulus**: Applies stimulus 97 (play) with intensity 1 to the creature that activated the drums.
3. **Side detection**:
   - If the **player** (pointer) activated: checks whether the click position is to the left or right of the drums to determine which drum to hit.
   - If a **creature** activated: randomly picks left or right drum.
4. **Sound and animation**:
   - Right drum (va01 = 1): Plays sound `"drm2"`, animation `[1 2 3 4 5 0]`.
   - Left drum (va01 = 2): Plays sound `"drm1"`, animation `[6 7 8 9 10 0]`.
5. **Wake nearby creatures**: Iterates over all creatures (`4 0 0`) in line of sight and wakes them up (`ASLP 0`), simulating the drum noise startling or attracting nearby creatures.

#### Activate 2 — Pull (2)

Identical behavior to Activate 1 (Push). Both interactions produce the same drum-playing effect.

### Stimulus Impact

| Stimulus | Target | Description |
|----------|--------|-------------|
| 97 (Play) | Activating creature | Provides a play reward, reducing boredom drive |

### Creature Urge Impact

| Drive | Intensity | Effect |
|-------|-----------|--------|
| Need for play | 0.5 | Increases perceived play need slightly |
| Boredom | -1.0 | Strongly reduces boredom |

### Remove Script

The remove script (`rscr`) unregisters the push event script and kills all existing bongo drum agents.
