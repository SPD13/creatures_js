# comms camera units.cos — Remote Camera Units

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/comms camera units.cos`

## Overview

This script creates the six **remote camera units** (`3 8 50`) that the [comms camera console](comms%20camera%20screens.md) (`3 3 104`) monitors. Each camera has an ID (`ov00`, 1–6) and can be **directed** (steered by the console's joystick) or **dropped onto a creature** to make it **follow** that creature like a film camera — smoothly tracking, and fading out/teleporting to a better vantage when the "star" gets too far away or changes metaroom.

At install it places six cameras: one in the corridor, three in the Norn Meso, and two in the Workshop. Each stores its home position in `name "x"`/`name "y"`.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 8 50 | Comms Camera Unit | `comms camera units` | A roving remote camera, directed or following a creature |

## Agent 3 8 50: Camera Unit

`name "status"` is "directed" or "follow"; `ov16` holds the followed creature; `ov71`/`ov72` are the follow velocities.

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Jiggle (random velocity) |
| Activate 2 / Hit | 2 / 3 | Message self 0 |
| Pickup | 4 | If following, revert to "directed" |
| Drop | 5 | If dropped near a creature, enter **follow** mode on it |
| Timer | 9 | Duplicate sanity-check, then follow or slow down by status |
| Custom | 1000–1003 | Joystick Up/Right/Down/Left — nudge velocity |
| Custom | 1010 | "Time to die" — fade out and kill (used to remove duplicates) |
| World Loaded | 128 | Jiggle (workaround for some graphics cards) |

### Event 5 — Drop (start following)

If not in the inventory, looks for a creature within range 100; if found, stores it as the "star" (`ov16`), sets status "follow", and begins tracking it.

### Event 9 — Timer (the follow logic)

First a **uniqueness check**: if two cameras share an ID, one is told to die (1010). Then:

- **Follow:** points toward the star (`ov16`), aiming for a comfortable framing offset. Within ~150 px it does a graded **smooth follow** (velocity scaled by distance); beyond ~200 px or across a metaroom boundary it **fades out, teleports to a good vantage, and fades back in**. If the star is lost it returns home and reverts to "directed".
- **Directed:** if stationary it slows its tick; otherwise it gradually decays its velocity to a stop.

(The follow code is shared with the HoverDoc, per the source comments.)

## Removal Script

```
rscr
enum 3 8 50
    kill targ
next
```

Kills all camera units.

## Impact on Stimulus / Room CA

None. The cameras only move and provide views (consumed by the console); they emit no stimuli and do not affect Room CA.
