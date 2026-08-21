# ball.cos — Bouncy Ball Toy

## Overview

This script creates two bouncy balls in the Creatures 3 world — simple toy agents that creatures can interact with for entertainment. The balls are fully physics-enabled with high elasticity and friction, allowing them to bounce realistically around rooms when pushed or pulled by creatures. Interacting with the ball sends stimulus 97 (`PLAYED_WITH_TOY`) to the creature, satisfying their play drive. When the ball bounces (collision event), it broadcasts an `urge sign` to nearby creatures, drawing their attention to the toy.

Two instances are created:
- **Ball 1** at position (8513, 515) — in the Norn Terrarium area
- **Ball 2** at position (1070, 755) — in the upper level of the ship

Both balls share the same sprite ("ball", 17 frames) and identical physics properties: high elasticity (90), high friction (90), moderate permeability (60), low gravity (2), and slight air resistance (10).

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `2 21 6` | Bouncy Ball | A physics-enabled toy ball that creatures can push, pull, pick up and drop | [Details](#agent-2-21-6-bouncy-ball) |

---

## Agent `2 21 6` — Bouncy Ball

A simple toy agent designed for creature entertainment. The ball uses the full physics engine (gravity, elasticity, friction, air resistance) and responds to creature interactions by bouncing in the appropriate direction. It plays a rolling animation while in motion and stops when at rest.

### Agent Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activateable (4) + Greedy Cabin (64) + Suffers Physics (128) |
| `bhvr` | 35 | Activate 1 / Push (1) + Activate 2 / Pull (2) + Drop (32) |
| `aero` | 10 | Low air resistance — ball travels far through air |
| `perm` | 60 | Moderate permeability — can pass through some walls |
| `accg` | 2 | Low gravity — ball floats slightly longer than normal |
| `elas` | 90 | Very high elasticity — ball bounces strongly off surfaces |
| `fric` | 90 | High friction — ball decelerates on surfaces |
| `ov61` | 10 | Toy smell intensity |

### Events

| Event | Script Number | Description |
|---|---|---|
| Push (Activate 1) | 1 | Creature pushes the ball — launches it upward |
| Pull (Activate 2) | 2 | Creature pulls the ball — launches it downward |
| Pickup | 4 | Creature picks up the ball |
| Drop | 5 | Creature drops the ball |
| Collision (Bump) | 6 | Ball collides with a wall or floor |

### Event Details

#### Push (Event 1) — Activate 1

When a creature pushes the ball, the script sends the `PLAYED_WITH_TOY` stimulus (97) to the creature with intensity 1. It then calculates the ball's center X position and compares it to the creature's position. If the creature is to the left of the ball, the ball is launched rightward (X velocity 15–25); if the creature is to the right, the ball is launched leftward (X velocity -25 to -15). The ball is given an upward Y velocity (between -70 and -20, negative = upward), causing it to arc through the air. The rolling animation plays during flight.

**Stimulus impact:**
- `stim writ from 97 1` — Sends stimulus 97 (`PLAYED_WITH_TOY`) to the activating creature at intensity 1

#### Pull (Event 2) — Activate 2

Identical to Push in direction logic and stimulus delivery, but the ball is launched downward instead of upward. The Y velocity is set to a positive value (20 to 70, positive = downward). This makes pulling the ball bounce it along the ground rather than arcing it into the air.

**Stimulus impact:**
- `stim writ from 97 1` — Sends stimulus 97 (`PLAYED_WITH_TOY`) to the activating creature at intensity 1

#### Pickup (Event 4)

Stops the ball's rolling animation immediately (`anim []`). The ball becomes visually still while being carried.

#### Drop (Event 5)

Restarts the rolling animation (`anim [0 1 2 3 ... 14 255]`) when the ball is dropped, showing it tumbling as it falls under gravity.

#### Collision / Bump (Event 6)

When the ball collides with a surface, three things happen:

1. **Urge Signal**: `urge sign 0.5 -1 0.0` broadcasts to nearby creatures — the noun stimulus of 0.5 gently draws creature attention toward the ball as a toy, while verb ID -1 and verb stimulus 0.0 make no specific action suggestion.

2. **Bounce Sound**: If the ball's vertical velocity magnitude exceeds 1, the bounce sound effect `"boi2"` is played via `snde`.

3. **Rest Detection**: The collision parameters `_p1_` (X velocity change) and `_p2_` (Y velocity change) are checked. If both have magnitude less than 3, the ball has effectively stopped moving, and the animation is halted (`anim []`).

### Removal Script

The removal script (`rscr`) enumerates all agents with classifier `2 21 6`, kills them, and removes all event scripts (1, 2, 4, 5, 6) using `scrx`.
