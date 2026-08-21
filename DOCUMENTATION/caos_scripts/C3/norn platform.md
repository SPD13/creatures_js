# norn platform.cos - Norn Terrarium Platform

**Source**: `Assets/Bootstrap/001 World/norn platform.cos`

## Overview

This script creates a single invisible platform agent used as a physical surface inside the Norn terrarium. The platform is placed high on the rendering plane (plane 8100) at world position (2521, 0) and uses the `"norn platform"` sprite (1 frame, base image 0).

Its sole purpose is to provide a static collision/standing surface in the Norn terrarium that is not visible to the player — it relies on attribute `16` (Invisible) so it renders nothing but still participates in the map's physical structure for agents and creatures that interact with it.

The script also registers a removal script (`rscr`) that cleans up any existing `1 1 98` instances from the world, and then unregisters its own script (`scrx 1 1 98 9`) to keep the scriptorium clean after install.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 98 | Norn Platform | `norn platform` frame 0 | Invisible static platform placed in the Norn terrarium; provides a collision/standing surface | [Detail](#norn-platform-1-1-98) |

---

## Norn Platform (1 1 98)

The Norn platform is an invisible, static simple agent (`simp`) used as a physical surface inside the Norn terrarium area. It is positioned at world coordinates (2521, 0) on rendering plane 8100.

### Properties

| Property | Value | Notes |
|---|---|---|
| Type | `simp` | Simple agent |
| Classifier | 1 1 98 | |
| Sprite | `norn platform` | 1 image, base image 0 |
| Plane | 8100 | High rendering plane |
| `attr` | 16 | Invisible |
| Position | (2521, 0) | Moved via `mvto` |

### Events

This agent has no event scripts of its own defined in this bootstrap — it is a purely passive, invisible prop that exists only to occupy map space.

### Removal Script (`rscr`)

When this bootstrap's removal script runs, it enumerates all `1 1 98` agents in the world and kills each of them, then unregisters script 9 for `1 1 98` from the scriptorium (`scrx 1 1 98 9`), ensuring a clean uninstall.
