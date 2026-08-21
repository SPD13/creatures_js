# norn cutaways 01.cos - Norn Terrarium Cutaway Markers

**Source**: `Assets/Bootstrap/001 World/norn cutaways 01.cos`

## Overview

This script installs three invisible simple agents at fixed world coordinates in the Norn terrarium area. Each agent uses a different frame of the `norncut01` sprite gallery and is placed on the high foreground plane (8100). They are stateless markers — no events or behaviors are defined, so the agents simply sit at their coordinates and can be targeted/killed by other systems.

The agents act as passive scene dressing / cutaway placeholders for the Norn terrarium. The removal script (`rscr`) cleanly uninstalls them by enumerating and killing every agent of the three classifiers.

## Created Agents

| Classifier | Name | Sprite | Position | Description | Detail |
|---|---|---|---|---|---|
| 1 1 2 | Norn Cutaway A | `norncut01` frame 0 | (1166, 638) | Invisible cutaway marker (frame 0) | [Detail](#norn-cutaway-a-1-1-2) |
| 1 1 3 | Norn Cutaway B | `norncut01` frame 1 | (2723, 812) | Invisible cutaway marker (frame 1) | [Detail](#norn-cutaway-b-1-1-3) |
| 1 1 4 | Norn Cutaway C | `norncut01` frame 2 | (1128, 554) | Invisible cutaway marker (frame 2) | [Detail](#norn-cutaway-c-1-1-4) |

---

## Norn Cutaway A (1 1 2)

An invisible simple agent placed at (1166, 638) in the Norn terrarium, using frame 0 of the `norncut01` sprite on plane 8100.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible |
| `plane` | 8100 | High foreground plane |
| Sprite base | 0 | `norncut01` first frame |
| Image count | 1 | Single-frame simple agent |

### Events

No event scripts are defined. The agent has no timer, no collision handler, and no interaction scripts — it exists purely as a static marker.

---

## Norn Cutaway B (1 1 3)

An invisible simple agent placed at (2723, 812), using frame 1 of the `norncut01` sprite on plane 8100.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible |
| `plane` | 8100 | High foreground plane |
| Sprite base | 1 | `norncut01` second frame |
| Image count | 1 | Single-frame simple agent |

### Events

No event scripts are defined.

---

## Norn Cutaway C (1 1 4)

An invisible simple agent placed at (1128, 554), using frame 2 of the `norncut01` sprite on plane 8100.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible |
| `plane` | 8100 | High foreground plane |
| Sprite base | 2 | `norncut01` third frame |
| Image count | 1 | Single-frame simple agent |

### Events

No event scripts are defined.

---

## Removal Script (rscr)

Cleanly uninstalls the cutaway markers:

1. `enum 1 1 2 → kill targ` — removes all Norn Cutaway A agents.
2. `enum 1 1 3 → kill targ` — removes all Norn Cutaway B agents.
3. `enum 1 1 4 → kill targ` — removes all Norn Cutaway C agents.
