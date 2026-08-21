# Water smell emitter.cos - Water Area Smell Emitters

**Source**: `Assets/Bootstrap/001 World/Water smell emitter.cos`

## Overview

This script places ten invisible smell emitters throughout the Ark to mark areas containing water. Each emitter continuously broadcasts CA 5 (Water) at a strong intensity of 1.0 into its surrounding room, allowing creatures to detect and navigate toward water sources using the CA-based smell system.

The emitters use the `targ` sprite and are invisible (`attr 16` = Invisible). They serve purely as environmental markers, providing navigable water smell gradients that creatures can follow when thirsty or seeking water.

The emitters are placed in three distinct water zones across the ship:
- **Marine Observation Area** (3 emitters, y~570): Upper-right section of the ship around x=6707-6919, likely corresponding to the marine/aquarium area.
- **Mid-Level Waterway** (5 emitters, y~1022-1040): Central section of the ship around x=3311-3960, covering a larger water feature or corridor water system.
- **Lower Deck Water Area** (2 emitters, y~2186): Lower section of the ship around x=2518-2700, marking a water source in the lower decks.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 15 | Water Smell Emitter | `targ` | Emits CA 5 (Water) at intensity 1.0 across water areas (10 instances) | [Detail](#water-smell-emitter-1-1-15) |

---

## Water Smell Emitter (1 1 15)

An invisible simple agent that emits CA 5 (Water smell) at full intensity. Ten instances are placed across the ship's three water zones to create strong water smell gradients that guide thirsty creatures toward water sources.

### Properties (All Instances)

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible — not visible to creatures or the player |
| `pose` | 0 | Static sprite |
| `emit` | CA 5 at 1.0 | Water smell — strong emission intensity |

### Instances

#### Marine Observation Area (Upper Ship)

| # | Position | Notes |
|---|---|---|
| 1 | (6707, 570) | Left side of marine area |
| 2 | (6809, 570) | Center of marine area |
| 3 | (6919, 574) | Right side of marine area |

#### Mid-Level Waterway (Central Ship)

| # | Position | Notes |
|---|---|---|
| 4 | (3763, 1029) | Central-right of waterway |
| 5 | (3468, 1040) | Central-left of waterway |
| 6 | (3311, 1040) | Left end of waterway |
| 7 | (3960, 1027) | Right end of waterway |
| 8 | (3866, 1022) | Central-right of waterway |

#### Lower Deck Water Area

| # | Position | Notes |
|---|---|---|
| 9 | (2518, 2186) | Left side of lower water area |
| 10 | (2700, 2186) | Right side of lower water area |

### Events

These agents have no event scripts. They exist solely to emit CA 5 continuously.

---

## Removal Script (rscr)

The removal script cleanly uninstalls all water smell emitters:

1. Enumerates all agents with classifier `1 1 15` (`enum 1 1 15`).
2. Kills each one (`kill targ`).

This removes all ten water smell emitter instances from the world.

---

## CA Emission Summary

| CA Index | CA Name | Emitter Classifier | Position | Intensity | Zone |
|---|---|---|---|---|---|
| 5 | Water | 1 1 15 | (6707, 570) | 1.0 | Marine Observation Area |
| 5 | Water | 1 1 15 | (6809, 570) | 1.0 | Marine Observation Area |
| 5 | Water | 1 1 15 | (6919, 574) | 1.0 | Marine Observation Area |
| 5 | Water | 1 1 15 | (3763, 1029) | 1.0 | Mid-Level Waterway |
| 5 | Water | 1 1 15 | (3468, 1040) | 1.0 | Mid-Level Waterway |
| 5 | Water | 1 1 15 | (3311, 1040) | 1.0 | Mid-Level Waterway |
| 5 | Water | 1 1 15 | (3960, 1027) | 1.0 | Mid-Level Waterway |
| 5 | Water | 1 1 15 | (3866, 1022) | 1.0 | Mid-Level Waterway |
| 5 | Water | 1 1 15 | (2518, 2186) | 1.0 | Lower Deck Water Area |
| 5 | Water | 1 1 15 | (2700, 2186) | 1.0 | Lower Deck Water Area |

CA 5 (Water) is a navigable CA (indices 0-9), meaning the water smell can diffuse through doors and links between rooms, creating broader scent gradients that creatures can follow across multiple rooms to locate water sources.
