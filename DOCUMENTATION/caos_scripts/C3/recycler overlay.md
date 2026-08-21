---
title: recycler overlay
type: CAOS Script Documentation
---

# recycler overlay.cos

**Source**: `Assets/Bootstrap/001 World/recycler overlay.cos`

## Overview

This bootstrap script installs a single decorative overlay sprite on top of the Recycler machine. It is a pure visual prop: a simple agent (classifier `1 1 96`) positioned at world coordinates `(2381, 1044)` on rendering plane `52`, with no collision, no physics, no behaviour, and no event handlers. Its sole purpose is to provide a fixed piece of artwork that sits as part of the Recycler's visual composition.

The script also defines a **Remove Script (rscr)** that enumerates every agent with the same classifier and kills it, so that re-running the install cleanly tears down the previously-installed overlay before a fresh copy is placed.

This script does not modify the map, does not set game variables, and does not define any runtime event handlers on the agent itself.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 96 | Recycler Overlay | (sprite index 0, base 0, plane 52) | Static decorative overlay placed over the Recycler at `(2381, 1044)` | [Detail](#recycler-overlay-1-1-96) |

---

## Recycler Overlay (1 1 96)

A single static simple agent placed at a fixed world position as a visual component of the Recycler. It has no interactive behaviour — creatures cannot activate it, it does not collide, and it is not affected by physics.

### Properties

| Property | Value | Notes |
|---|---|---|
| `simp` | 1 1 96 "recycler overlay" 0 0 52 | Simple agent, classifier `1 1 96`, 0 sprite frames declared, image base 0, plane 52 |
| `attr` | 0 | No attributes — not carryable, no collision, no physics, not activatable |
| Position | `mvto 2381 1044` | Fixed world coordinates |

### Events

This agent installs **no event handlers**. It is purely a visual, static overlay with no runtime behaviour.

### Remove Script

The script-level `rscr` block enumerates all agents of classifier `1 1 96` and kills each one. This ensures a clean reinstall of the overlay when the bootstrap script is re-run.

> Note: The classifier `1 1 96` is shared with the `lung overlay` bootstrap script. Since the `rscr` enumerates the entire `1 1 96` class without filtering, running either script's remove would also remove the other overlay's agent — this is consistent with how the original engine treats classifier-scoped enumeration in bootstrap install/remove pairs.
