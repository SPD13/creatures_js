# Rock cutaway Norn terrarium.cos - Norn Terrarium Rock Scenery

**Source**: `Assets/Bootstrap/001 World/Rock cutaway Norn terrarium.cos`

## Overview

This script creates a static decorative scenery element for the Norn terrarium area. It places a rock cutaway overlay sprite (`rockcut1`) at a fixed position in the world, serving as a visual foreground element that gives depth to the terrarium environment. The agent has no interactivity, no events, and no behavior -- it is purely cosmetic scenery rendered at a high plane (8100) to appear in front of most other agents and background elements.

The script does not affect creatures, the ecosystem, or game variables in any way.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 1 | Rock Cutaway | `rockcut1` frame 0 | Static decorative rock overlay for the Norn terrarium | [Detail](#rock-cutaway-1-1-1) |

---

## Rock Cutaway (1 1 1)

A static, non-interactive scenery sprite placed in the Norn terrarium area. The rock cutaway provides visual depth by overlaying a rock texture in the foreground (plane 8100), making it appear as though the player is viewing the terrarium through a rocky opening. It has no timer, no events, and no agent variables of note.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `rockcut1` | 1 image, first image 0 |
| Plane | 8100 | Very high foreground -- renders in front of most agents |
| Position | (3170, 840) | Fixed position in the Norn terrarium area |
| `attr` | 0 (default) | No interactions, not carryable, no physics |

### Events

| Event # | Event Name | Description |
|---|---|---|
| *(none)* | -- | This agent has no event scripts |

## Remove Script (rscr)

The remove script cleans up all rock cutaway agents by enumerating every instance of classifier 1 1 1 and killing them:

```
rscr
enum 1 1 1
    kill targ
next
```
