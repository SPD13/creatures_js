# Creature Bubbles (creatureBubbles.cos)

This script defines the behavior for drowning bubble agents (classifier `1 2 41`). These bubble agents are visual effects that appear above a creature's head when it is drowning underwater. The bubbles are **not created by this script** — they are spawned by `creatureInvoluntary.cos` (Event 71, Involuntary Action Locus 7 — Drowning/Express Discomfort) using `new: simp 1 2 41 "bubs" 29 0 6000`.

When created, each bubble agent stores a reference to its owner creature in `ov00` and initializes an animation frame counter in `ov01` to 0. This script provides the timer-driven behavior that animates and positions the bubbles, and automatically removes them when they are no longer needed.

## Created Agents

This script does not create any agents. It only defines event scripts for the **Creature Bubble** agent (`1 2 41`) which is created by `creatureInvoluntary.cos`.

## Agent Details

### Creature Bubble (1 2 41)

Drowning bubble visual effect that tracks a creature's position and plays a short bubble animation above its head. The bubble self-destructs after its animation completes or when the owning creature is no longer in a drowning state.

**Sprite**: `bubs` (29 frames)

**Object Variables**:
| Variable | Type | Description |
|----------|------|-------------|
| `ov00` | Agent ref | Reference to the owner creature |
| `ov01` | Integer | Animation tick counter (0–10) |

#### Events

| Event Type | Event Number | Description |
|------------|--------------|-------------|
| Timer | 9 | Periodic update — reposition and animate the bubble |

#### Timer Event (9) — Bubble Update

This is the main behavior loop, driven by the agent's tick timer (set to 4 ticks by the creator script). Each tick, the script performs the following steps:

1. **Lifetime check**: If the animation counter (`ov01`) has reached 10, the bubble has completed its lifecycle and is killed.

2. **Owner validity check**: If the owner creature reference (`ov00`) is null (creature was removed from the world), the bubble is killed.

3. **Owner state check**: Targets the owner creature and checks if it is asleep (`aslp != 0`), dead (`dead == 1`), unconscious (`uncs == 1`), or no longer drowning (breathing locus `loci 1 1 4 9 != 0.0`). If any condition is true, the bubble is no longer relevant and is killed.

4. **Positioning**: The bubble repositions itself above the creature's head:
   - If the creature faces east (`dirn == 2`), the bubble is placed at the creature's right edge minus the bubble's width.
   - Otherwise (facing west), the bubble is placed at the creature's left edge.
   - Vertically, the bubble is placed at the creature's top minus 75% of the creature's height, creating the appearance of bubbles rising from above the head.

5. **Animation**: On the first tick (`ov01 == 0`), the frame rate is set to 2 and the full animation sequence is started (frames 0–9, then stop marker 255).

6. **Counter increment**: The animation counter `ov01` is incremented each tick.

#### Remove Script (rscr)

The remove script cleans up all existing creature bubble agents by enumerating all `1 2 41` agents and killing them, then unregisters the timer event script (`scrx 1 2 41 9`).

## Impact

- **No stimulus or Room CA impact** — this is a purely visual effect with no gameplay consequences.
- **Performance consideration** — bubbles are short-lived (10 ticks at most) and self-cleaning, preventing accumulation.
