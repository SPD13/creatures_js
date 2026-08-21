# marine room cutout.cos - Marine Terrarium Room Cutout

**Source**: `Assets/Bootstrap/001 World/marine room cutout.cos`

## Overview

This script creates a single static decorative cutout element for the Marine Terrarium area of the Ark. The agent uses the `marine room cutout` sprite and is placed in the far background to provide visual framing or architectural detail to the marine habitat.

The agent is entirely non-interactive with `attr 0` (no attributes set), meaning it cannot be picked up, activated, or seen by creatures. It serves purely as a visual element in the world background.

A pointer script (`scrp 2 1 1 117`) is defined in `Pointer scripts.cos`, which handles click interactions on this agent by toggling the hand cursor agent (1 1 95). On left-click (`_p1_ eq 1`), the hand switches to pose 1 and follows the pointer; on right-click (`_p1_ eq 2`), it switches to pose 0; on release (`_p1_ eq 0`), the hand detaches and moves off-screen.

The removal script (`rscr`) cleans up all instances of classifier 1 1 117.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 117 | Marine Room Cutout | `marine room cutout` frame 0, plane 8100 | Static background cutout for the Marine Terrarium | [Detail](#marine-room-cutout-1-1-117) |

---

## Marine Room Cutout (1 1 117)

A static background cutout placed in the Marine Terrarium area of the Ark. This is a non-interactive visual element that provides architectural or scenic detail to the marine habitat environment.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 0 | No attributes — fully non-interactive |
| Sprite | `"marine room cutout"` | Background cutout sprite |
| Image count | 1 | Single frame |
| Plane | 8100 | Far background layer |
| Position | (4314, 2312) | Marine Terrarium area |

### Events

| Event | Number | Description |
|---|---|---|
| Pointer Click | Script `2 1 1 117` | Defined in `Pointer scripts.cos` — toggles hand cursor (1 1 95) on click/release |

### Behavior

This agent has no behavior scripts defined in this file. It is placed once during bootstrap and remains as static scenery. The `attr 0` setting means creatures cannot see or interact with it.

The pointer interaction script (defined externally in `Pointer scripts.cos`) responds to mouse events on this agent by manipulating the hand cursor agent (1 1 95): showing it on click and hiding it on release.

### Removal Script

The removal script (`rscr`) enumerates all agents with classifier 1 1 117 and kills them, ensuring clean removal when the script is uninstalled.
