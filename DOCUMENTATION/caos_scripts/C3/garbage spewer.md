# garbage spewer.cos - Waste Spewer Pipes

**Source**: `Assets/Bootstrap/001 World/garbage spewer.cos`

## Overview

This script creates four waste spewer pipe agents positioned along the bottom of the ship (the waste processing/sewage area at y=2485). Each spewer periodically plays a spewing animation and sound effect, creating ambient visual activity in the waste management section of the Ark.

The spewers also have an interactive element: when pushed by a creature or the player, they count activations. After being pushed 5 times, the spewer triggers the toilet control system (1 1 11) by sending it an Activate 1 message, effectively causing a toilet flush. This links the waste spewers to the broader plumbing infrastructure of the ship.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 30 | Garbage Spewer | `spew` (4 variants: frames 0, 16, 32, 48) | Ambient waste pipe that periodically spews and can trigger toilet flushes when pushed repeatedly | [Detail](#garbage-spewer-1-1-30) |

---

## Garbage Spewer (1 1 30)

Decorative/interactive pipe agents that create ambient waste-spewing activity in the ship's lower sewage area. Four instances are created at bootstrap, each using a different section of the `spew` sprite sheet and staggered tick intervals to avoid synchronized animations.

### Bootstrap Configuration

| Instance | Position | First Image | Tick Rate | Notes |
|---|---|---|---|---|
| 1 | (1863, 2485) | 0 | 10 | Leftmost spewer |
| 2 | (1978, 2485) | 16 | 20 | Second from left |
| 3 | (2138, 2485) | 32 | 30 | Third from left |
| 4 | (2296, 2485) | 48 | 40 | Rightmost spewer |

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `clac` | 0 | No click action classification |
| Sprite | `spew` | 16 frames per variant, 1 plane |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Push counter | 0 = idle, 1-5 = push count, resets to 0 after reaching 6 |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Periodic spew animation and sound |
| Activate 1 (Push) | 1 | Creature/player pushes the spewer |

### Timer (Event 9)

The timer fires periodically based on each spewer's tick rate. On each fire:

1. Plays the `"spew"` sound effect
2. Runs a full animation cycle through frames 0-15 then back to 0
3. If the push counter (`ov00`) is non-zero, increments it by 1
4. If the push counter reaches 6, resets it to 0 (the interaction window expires)
5. Waits for the animation to complete (`OVER`)
6. Sets the next tick to a random interval between 20-100 ticks

The staggered initial tick values (10, 20, 30, 40) ensure the four spewers don't all animate simultaneously at startup, creating a more natural asynchronous pattern.

### Activate 1 / Push (Event 1)

When a creature or the player pushes the spewer:

- If `ov00` is 0 (idle), starts counting by setting `ov00` to 1
- If `ov00` reaches 5 (pushed 5 times within the timer cycle window):
  - Plays the `"glaf"` sound effect (a flushing/gurgling sound)
  - Targets a random Toilet Control agent (1 1 11)
  - If a toilet control is found, sends it an Activate 1 message (`mesg writ targ 0`), triggering a toilet flush

This creates an interactive mechanic where repeatedly pushing a waste spewer triggers the connected toilet system, linking the waste pipes to the ship's plumbing infrastructure.

### Interaction with Other Systems

| Target | Classifier | Interaction |
|---|---|---|
| Toilet Control | 1 1 11 | Sends Activate 1 message after 5 pushes, triggering a flush |

### Remove Script

The remove script (`rscr`) cleans up all garbage spewer instances by enumerating and killing all agents with classifier 1 1 30, then removes the event scripts (1 and 9).
