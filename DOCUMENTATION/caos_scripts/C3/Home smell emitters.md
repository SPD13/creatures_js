# Home smell emitters.cos - Creature Home Territory Smell Emitters

**Source**: `Assets/Bootstrap/001 World/Home smell emitters.cos`

## Overview

This script places invisible smell emitters throughout the Ark to define the home territories for each of the three creature species: Norns, Grendels, and Ettins. Each emitter continuously broadcasts a species-specific "home smell" CA into its surrounding room, allowing creatures to navigate toward and identify their home areas using the CA-based smell system.

The emitters use the `blnk` (blank) sprite and are invisible to creatures (`attr 18` = Invisible + Mouseable). They serve purely as environmental markers. The CA values they emit (CA 15 for Norn Home, CA 16 for Grendel Home, CA 17 for Ettin Home) diffuse through adjacent rooms, creating scent gradients that creatures can follow to locate their home territory.

Norn home smell is concentrated in the main Ark corridor area (two emitters at different intensities), the Grendel home smell is placed in the Grendel jungle terrarium, and the Ettin home smell has three emitters in the Ettin desert area (though one emits at intensity 0, effectively acting as a placeholder).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 5 1 | Norn Home Emitter (Primary) | `blnk` | Emits CA 15 (Norn Home) at 0.025 in the main Norn living area | [Detail](#norn-home-emitter-primary-3-5-1) |
| 3 5 2 | Norn Home Emitter (Secondary) | `blnk` | Emits CA 15 (Norn Home) at 0.01 in a secondary Norn area | [Detail](#norn-home-emitter-secondary-3-5-2) |
| 3 6 1 | Grendel Home Emitter | `blnk` | Emits CA 16 (Grendel Home) at 0.01 in the Grendel jungle terrarium | [Detail](#grendel-home-emitter-3-6-1) |
| 3 7 1 | Ettin Home Emitter | `blnk` | Emits CA 17 (Ettin Home) at varying intensities across the Ettin desert area (3 instances) | [Detail](#ettin-home-emitters-3-7-1) |

---

## Norn Home Emitter — Primary (3 5 1)

An invisible agent placed in the main Norn living area of the Ark. It emits CA 15 (Norn Home) at a relatively strong intensity of 0.025, making this the primary beacon for Norns seeking their home territory.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 18 | Invisible (16) + Mouseable (2) — invisible to creatures |
| `pose` | 0 | Static blank sprite |
| Position | (780, 712) | Main Norn corridor area |
| `emit` | CA 15 at 0.025 | Norn Home smell — strongest emitter |

### Events

This agent has no event scripts. It exists solely to emit CA 15 continuously.

---

## Norn Home Emitter — Secondary (3 5 2)

A second Norn Home smell emitter placed further along the Ark. It emits at a lower intensity (0.01) than the primary emitter, creating a gentle gradient that guides Norns through a broader area while the primary emitter marks the core home zone.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 18 | Invisible (16) + Mouseable (2) — invisible to creatures |
| `pose` | 0 | Static blank sprite |
| Position | (2360, 467) | Secondary Norn area |
| `emit` | CA 15 at 0.01 | Norn Home smell — weaker secondary beacon |

### Events

This agent has no event scripts. It exists solely to emit CA 15 continuously.

---

## Grendel Home Emitter (3 6 1)

An invisible agent placed in the Grendel jungle terrarium. It emits CA 16 (Grendel Home), marking the jungle as Grendel territory. Combined with the environmental systems in the Grendel Area environment script, this creates a complete home zone for Grendels.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 18 | Invisible (16) + Mouseable (2) — invisible to creatures |
| `pose` | 0 | Static blank sprite |
| Position | (1948, 2310) | Grendel jungle terrarium |
| `emit` | CA 16 at 0.01 | Grendel Home smell |

### Events

This agent has no event scripts. It exists solely to emit CA 16 continuously.

---

## Ettin Home Emitters (3 7 1)

Three invisible agents placed across the Ettin desert area. They emit CA 17 (Ettin Home) at varying intensities, creating a home smell gradient across the Ettin terrarium. Note that the third emitter has an intensity of 0.000, effectively emitting nothing — it may serve as a placeholder for future use or mark a boundary of the Ettin territory.

### Instances

| # | Position | Emit Intensity | Notes |
|---|---|---|---|
| 1 | (4872, 704) | 0.004 | Weak emitter — left side of Ettin area |
| 2 | (6200, 704) | 0.007 | Strongest emitter — center of Ettin area |
| 3 | (6363, 704) | 0.000 | Inactive — placeholder or boundary marker |

### Properties (All Instances)

| Property | Value | Notes |
|---|---|---|
| `attr` | 18 | Invisible (16) + Mouseable (2) — invisible to creatures |
| `pose` | 0 | Static blank sprite |
| `emit` | CA 17 at varying | Ettin Home smell |

### Events

These agents have no event scripts. They exist solely to emit CA 17 continuously.

---

## Removal Script (rscr)

The removal script cleanly uninstalls all home smell emitters:

1. Kills all Norn Home emitters (`enum 3 5 0 → kill targ`) — uses genus wildcard (species 0) to remove both species 1 and 2.
2. Kills all Grendel Home emitters (`enum 3 6 1 → kill targ`).
3. Kills all Ettin Home emitters (`enum 3 7 1 → kill targ`).

---

## CA Emission Summary

| CA Index | CA Name | Emitter Classifier | Position | Intensity | Territory |
|---|---|---|---|---|---|
| 15 | Norn Home | 3 5 1 | (780, 712) | 0.025 | Primary Norn area |
| 15 | Norn Home | 3 5 2 | (2360, 467) | 0.01 | Secondary Norn area |
| 16 | Grendel Home | 3 6 1 | (1948, 2310) | 0.01 | Grendel jungle |
| 17 | Ettin Home | 3 7 1 | (4872, 704) | 0.004 | Ettin desert (left) |
| 17 | Ettin Home | 3 7 1 | (6200, 704) | 0.007 | Ettin desert (center) |
| 17 | Ettin Home | 3 7 1 | (6363, 704) | 0.000 | Ettin desert (right, inactive) |

These CA values are non-navigable (indices 15-17 are in the 10-19 range), meaning they stay within their room and do not diffuse through doors. Creatures detect these smells through the CA-to-category mapping system (CA 15 → Category 30, CA 16 → Category 31, CA 17 → Category 32), which drives navigation decisions via the creature perception system.
