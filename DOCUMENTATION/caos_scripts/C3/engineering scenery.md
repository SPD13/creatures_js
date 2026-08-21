# Engineering Scenery

## Overview

This bootstrap script creates a single decorative scenery element in the **Engineering section** of the Ark. The scenery agent is a purely visual, non-interactive background decoration placed at a fixed position. It uses the `engscen` sprite (a C16 compressed sprite file) and is rendered at a high plane value (8100), placing it behind interactive agents but as part of the visible environment.

The agent has no attributes (`attr 0`), meaning it is invisible to creatures, not clickable by the player, and does not interact with the physics system. It serves solely as a static visual element to enhance the appearance of the Engineering area.

**Note:** The removal script (`rscr`) contains what appears to be a bug from the original game — it enumerates and kills agents with classifier `1 1 640` instead of the created agent's classifier `1 1 7`. This means the removal script would not actually clean up the scenery agent it creates.

## Created Agents

| Classifier | Sprite | Description | Details |
|---|---|---|---|
| 1 1 7 | `engscen.c16` | Engineering scenery decoration | [Details](#agent-1-1-7-engineering-scenery) |

## Agent Details

### Agent 1 1 7 — Engineering Scenery

A static, non-interactive scenery decoration placed in the Engineering section of the Ark at position (1762, 3559). It uses a single frame from the `engscen.c16` sprite file, rendered at plane 8100.

**Properties:**
- **Attributes:** `0` (no interaction — invisible to creatures, not clickable)
- **Plane:** 8100 (deep background layer)
- **Position:** (1762, 3559) — Engineering section

#### Events

This agent has no event scripts. It is a purely static decoration with no behavior.

#### Impact

- **Stimulus:** None
- **Room CA:** None
- **Ecosystem:** None — purely visual decoration
