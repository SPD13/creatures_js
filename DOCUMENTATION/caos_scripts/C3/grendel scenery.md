# grendel scenery.cos - Grendel Jungle Scenery

**Source**: `Assets/Bootstrap/001 World/grendel scenery.cos`

## Overview

This script places two static decorative scenery elements in the Grendel Jungle area of the Ark using the `grenscen` sprite set. These are purely visual background objects with no interactive behavior, scripts, or creature interactions. They serve as environmental decoration to enhance the visual atmosphere of the Grendel habitat.

Both agents use classifier **1 1 6** (SimpleObject, family 1, genus 1, species 6) and are created with `attr 16` (Camera Shy — they do not appear in the creature's visual field and cannot be interacted with).

The removal script (`rscr`) cleans up all instances of classifier 1 1 6 and removes the associated timer script (event 9).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 6 | Grendel Scenery (instance 1) | `grenscen` frame 0, plane 8100 | Static decoration placed in the Grendel Jungle lower area | [Detail](#grendel-scenery-1-1-6) |
| 1 1 6 | Grendel Scenery (instance 2) | `grenscen` frame 1, plane 8100 | Static decoration placed in the Grendel Jungle upper area | [Detail](#grendel-scenery-1-1-6) |

---

## Grendel Scenery (1 1 6)

Static decorative scenery objects placed in the Grendel Jungle habitat. These are non-interactive background elements using different frames of the `grenscen` sprite to provide visual variety.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Camera Shy — invisible to creatures |
| Sprite | `"grenscen"` | C16 compressed sprite |
| Plane | 8100 | Far background layer |

### Instances

| Instance | Frame | Position (x, y) | Location |
|---|---|---|---|
| 1 | 0 | 1803, 2383 | Grendel Jungle — lower area |
| 2 | 1 | 96, 1417 | Grendel Jungle — upper area |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Defined in removal script cleanup (`scrx 1 1 6 9`) but no timer script is installed by this file |

### Behavior

These agents have no behavior scripts. They are placed once during bootstrap and remain as static scenery. The `attr 16` (Camera Shy) flag means creatures cannot see or interact with these objects. The high plane value (8100) places them in the far background behind most other agents and interactive elements.

### Removal Script

The removal script (`rscr`) enumerates all agents with classifier 1 1 6 and kills them, then removes the timer script (event 9) for the classifier. This ensures clean removal when the script is uninstalled.
