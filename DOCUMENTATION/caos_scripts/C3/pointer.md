---
title: pointer
type: CAOS Script Documentation
---

# pointer.cos

## Overview

This bootstrap script configures the pointer (cursor) agent's hot spot coordinates. The pointer agent (`pntr`) is the system-managed mouse cursor and is not created by this script — it already exists as part of the engine. This script only sets the hot spot offset (the pixel within the cursor image that represents the "click" position) for each of its 8 cursor poses.

The `PUPT pose x y` command sets the hot spot of the specified pose to the given `(x, y)` offset relative to the cursor image. All 8 poses (0–7) are configured with a hot spot at `(15, 30)`, which corresponds to the tip/base of the pointer graphic.

This script does not create agents, define events, modify the map, or set game variables. It is purely a one-time configuration of the system pointer's interaction hot spot.

## Created Agents

None. This script only configures the existing system pointer agent.
