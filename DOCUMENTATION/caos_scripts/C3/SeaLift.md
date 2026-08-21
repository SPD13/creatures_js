# SeaLift.cos - Sea Area Vertical Lift

**Source**: `Assets/Bootstrap/001 World/SeaLift.cos`

## Overview

This script creates a single vertical lift vehicle in the sea/ocean area of the Creatures 3 spaceship. The sea lift is a simple two-state elevator that transports creatures and agents between an upper deck (y~2045) and a lower deck (y~2228) at world x-position 6000. Unlike the main lift system (Lifts.cos) which uses call buttons and complex pathfinding, the sea lift is a self-contained vehicle that toggles between two positions when clicked by the player.

The lift follows a slightly diagonal path during transit: when descending, it shifts slightly left near the bottom of travel; when ascending, it shifts slightly right near the top before straightening out vertically. This gives the movement a natural curved trajectory matching the physical environment. The lift grabs creature passengers before moving, carries them in its open-air cabin, and drops them at the destination. Sound effects loop during transit and fade when the lift arrives.

The click action alternates between Activate 1 (descend) and Activate 2 (ascend) based on the lift's current position, tracked by `ov00`.

## Created Agents

| Classifier | Name | Description | Detail |
|---|---|---|---|
| 3 1 2 | Sea Lift | Vehicle that transports creatures vertically between upper and lower sea area decks | [Detail](#sea-lift-3-1-2) |

---

## Sea Lift (3 1 2)

A vehicle agent positioned in the sea area of the ship at (6000, 2045). It operates as a simple two-stop elevator with an open-air cabin that can carry creatures between the upper and lower levels.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 524 | Activateable (4) + Greedy cabin (8) + Open air cabin (512) |
| `clac` | 0 (initial) | Click triggers Activate 1 (descend); toggles to 1 after descent |
| Sprite | `sealift`, 2 frames | Frame 0 and frame 1, plane 100 |
| Position | (6000, 2045) | Sea area of the spaceship |

### Cabin

| Property | Value |
|---|---|
| `cabn` | -20 0 110 135 (left, top, right, bottom relative to agent) |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov00` | Position state: 0 = at top, 1 = at bottom |

### Idle Animation

The lift plays a slow looping idle animation cycling between frame 0 (10 repetitions) and frame 1 (10 repetitions), creating a gentle pulsing visual effect while stationary.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Player clicks to send the lift down from the upper deck |
| 2 | Activate 2 | Player clicks to send the lift up from the lower deck |

#### Event 1 - Activate 1 (Descend)

1. Runs in LOCK mode to prevent interruption.
2. Checks that `ov00 = 0` (lift is at the top); does nothing otherwise.
3. Plays transition animation (frames 0 to 1) and starts looping sound "sl_1".
4. Grabs all creature passengers in the cabin (`gpas 4 0 0 0`).
5. Disables clicking (`clac -1`) during transit.
6. Sets downward velocity (`velo 0 4`).
7. **Movement loop**: Continuously checks position; when `post` (top Y) exceeds 2190, adjusts to diagonal velocity (`velo -1 3`) to shift the lift slightly left as it approaches the bottom.
8. Loop ends when `post >= 2228` (arrived at lower deck).
9. Stops movement (`velo 0 0`).
10. Drops all passengers (`dpas 0 0 0`).
11. Sets `ov00` to 1 (at bottom) and `clac` to 1 (next click triggers Activate 2).
12. Fades out the transit sound and resumes idle animation.

#### Event 2 - Activate 2 (Ascend)

1. Runs in LOCK mode to prevent interruption.
2. Checks that `ov00 = 1` (lift is at the bottom); does nothing otherwise.
3. Plays transition animation (frames 0 to 1) and starts looping sound "sl_1".
4. Grabs all creature passengers in the cabin (`gpas 4 0 0 0`).
5. Disables clicking (`clac -1`) during transit.
6. Sets upward-right velocity (`velo 1 -3`), shifting the lift slightly right as it departs the bottom.
7. **Movement loop**: Continuously checks position; when `post` (top Y) drops to 2190 or below, adjusts to straight upward velocity (`velo 0 -4`).
8. Loop ends when `post <= 2044` (arrived at upper deck).
9. Stops movement (`velo 0 0`).
10. Drops all passengers (`dpas 0 0 0`).
11. Sets `ov00` to 0 (at top) and `clac` to 0 (next click triggers Activate 1).
12. Fades out the transit sound and resumes idle animation.

---

## Removal Script

The `rscr` block enumerates all sea lift agents (3 1 2) and kills each one, performing a clean teardown.
