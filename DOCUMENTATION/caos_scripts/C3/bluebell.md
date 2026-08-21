# bluebell.cos — Bluebell Flowers

## Overview

This script creates 20 decorative bluebell flower agents scattered across the Norn Terrarium area of the Creatures 3 world. The bluebells are simple animated plants that slowly bloom and unbloom on a timer cycle, providing visual life to the environment. Creatures can interact with them by pushing, which triggers stimulus 62 (`IT IS A FLOWER`) on the activating creature, satisfying their need to smell flowers. The flowers are physics-enabled but have zero elasticity, so they remain stationary once placed.

Each bluebell is randomly assigned one of three visual variants (sprite offsets 0, 11, or 22 within the "bluebell" sprite file) and placed at a random X position between 1740 and 2740 at Y coordinate 674 in the Norn Terrarium.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `2 4 6` | Bluebell | An animated decorative flower that creatures can push to smell | [Details](#agent-2-4-6-bluebell) |

---

## Agent `2 4 6` — Bluebell

A simple decorative plant agent that animates through a bloom/unbloom cycle on a timer. Creatures can push (activate 1) the flower to receive the "smelled flower" stimulus. Twenty instances are created at random positions along the Norn Terrarium floor.

### Agent Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 192 | Greedy Cabin (64) + Suffers Physics (128) |
| `bhvr` | 1 | Activate 1 / Push only |
| `elas` | 0 | No elasticity — flower stays in place |
| `tick` | 20–100 (random) | Timer interval for bloom animation updates |
| Sprite | `"bluebell"` | 11 frames per variant, 3 variants (offsets 0, 11, 22) |
| Plane | 200 | Rendering depth |
| Instances | 20 | Number of flowers created |
| Position | X: 1740–2740, Y: 674 | Random placement along the Norn Terrarium floor |

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Animation direction flag: 0 = blooming (frames increasing), 1 = unblooming (frames decreasing) |
| `ov99` | Pause counter — counts timer ticks at full bloom before reversing |

### Events

| Event | Script Number | Description |
|---|---|---|
| Push (Activate 1) | 1 | Creature pushes/smells the flower |
| Timer | 9 | Periodic bloom/unbloom animation cycle |

### Event Details

#### Push (Event 1) — Activate 1

When a creature pushes the bluebell, the script sets `TARG` to `FROM` (the activating creature) and sends stimulus 62 (`IT IS A FLOWER`) at intensity 1 to the creature. This satisfies the creature's drive to interact with flowers.

**Stimulus impact:**
- `stim writ from 62 1` — Sends stimulus 62 (`IT_IS_A_FLOWER`) to the activating creature at intensity 1

#### Timer (Event 9) — Bloom/Unbloom Animation

The timer event drives a two-phase animation cycle:

**Phase 1 — Blooming (`ov00 = 0`):**
The flower's pose increments by 1 each timer tick, progressing through the bloom animation frames. Once the pose reaches 10 (fully bloomed), the flower pauses: `ov99` increments each tick until it reaches 100, at which point `ov00` is set to 1 to begin unblooming.

**Phase 2 — Unblooming (`ov00 = 1`):**
The flower's pose decrements by 1 each timer tick, reversing the bloom animation. Once the pose reaches 0 (fully closed), both `ov99` and `ov00` are reset to 0, and the cycle begins again.

The random timer interval (20–100 ticks) means each flower blooms at its own pace, creating a natural staggered appearance across the terrarium.

### Removal Script

The removal script (`rscr`) enumerates all agents with classifier `2 4 6`, kills them, and removes the timer event script (9) using `scrx`.
