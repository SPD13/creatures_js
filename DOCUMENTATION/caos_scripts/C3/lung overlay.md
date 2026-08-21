# Lung Overlay

## Overview

This script creates two purely decorative overlay agents placed in the **Engineering (Lung)** area of the Ark spaceship. The overlays use different poses of the `lung overlay.c16` sprite and are positioned to add visual detail to the lung machinery environment. They have no interactivity (`attr 0`), no event scripts, and no gameplay effect — they serve solely as static scenery elements layered on top of the background.

The removal script destroys all agents with classifier `1 1 96`. Note that this classifier is shared with the recycler overlay, meaning the removal script will also clean up recycler overlay agents.

## Created Agents

| Classifier | Sprite | Description | Details |
|---|---|---|---|
| 1 1 96 | `lung overlay` (pose 0) | Static decorative overlay placed at (6602, 3854) in the lung area | [Details](#lung-overlay-agent-pose-0) |
| 1 1 96 | `lung overlay` (pose 1) | Static decorative overlay placed at (6117, 4307) in the lung area | [Details](#lung-overlay-agent-pose-1) |

## Agent Details

### Lung Overlay Agent (Pose 0)

A simple agent (`simp`) created with sprite `lung overlay.c16` at pose 0. Positioned at coordinates (6602, 3854) in the Engineering/Lung section of the Ark. The agent has no attributes set (`attr 0`), making it completely non-interactive — it cannot be picked up, clicked, or activated by creatures or the hand.

| Event | Number | Description |
|---|---|---|
| — | — | No events defined |

**Behavior:** None. This is a static decorative element with no scripts or interactions.

### Lung Overlay Agent (Pose 1)

A simple agent (`simp`) created with sprite `lung overlay.c16` at pose 1, showing a different frame of the overlay artwork. Positioned at coordinates (6117, 4307), lower and to the left of the first overlay. Like the first instance, it has `attr 0` and is entirely non-interactive.

| Event | Number | Description |
|---|---|---|
| — | — | No events defined |

**Behavior:** None. This is a static decorative element with no scripts or interactions.
