# Light & Heat Emitters - Norn Terrarium

**File:** `001 World/light & heat emitters NT.cos`

## Overview

This script creates the environmental light and heat emission system for the **Norn Terrarium**, the main living area of the Creatures 3 spaceship. It establishes a realistic day/night and seasonal cycle by deploying a central controller agent and two rows of invisible emitters (one for light, one for heat) positioned along the ceiling of the terrarium.

The controller periodically reads base values from the global day/night controller (agent `3 3 55`), then scales light and heat emission rates according to the current **time of day** and **season**. This means creatures in the Norn Terrarium experience warmer, brighter afternoons and cooler, darker nights, with seasonal variation adding warmth in summer and cold in winter.

Additionally, the script spawns 100 grass/debris particles that fall through the terrarium under gravity. When these particles hit the ground, they decompose — adding small amounts of **Water** (CA 3) and **Nutrient** (CA 4) to the room, simulating natural organic matter enriching the environment.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `1 1 13` | Light & Heat Controller | Compound agent that calculates and distributes light/heat values based on time of day and season | [Details](#1-1-13-light--heat-controller) |
| `1 1 12` | Light Emitter (x15) | Invisible agents that emit Light (CA 1) into their room | [Details](#1-1-12-light-emitter) |
| `1 1 14` | Heat Emitter (x15) | Invisible agents that emit Heat (CA 2) into their room | [Details](#1-1-14-heat-emitter) |
| `2 10 37` | Grass Particle (x100) | Falling organic debris that decomposes on impact, adding Water and Nutrient to rooms | [Details](#2-10-37-grass-particle) |

---

## 1 1 13 — Light & Heat Controller

A compound agent with two visual indicator parts positioned at **(7300, 900)** in the Norn Terrarium. It acts as the brain of the light/heat system, periodically computing emission values and broadcasting them to all emitters.

**Attributes:** `22` (Invisible + Activateable + Mouseable)

### Parts

| Part | First Image | Offset | Purpose |
|---|---|---|---|
| 0 | 1 (from "targ") | — | Main body |
| 1 | 4 (from "targ") | (3, 9) | Time of day indicator (poses 0-4: Dawn to Night) |
| 2 | 9 (from "targ") | (44, 19) | Season indicator (poses 0-3: Spring to Winter) |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Enables floating (adds `attr 32`), sets clickable action to deactivate |
| Activate 2 | 2 | Disables floating (removes `attr 32`), sets clickable action to default |
| Timer | 9 | Main update cycle — calculates and distributes light/heat values |

### Timer Behavior (Event 9, every 300 ticks / ~15 seconds)

The timer script performs the following sequence:

1. **Read base values**: Targets the day/night controller (`3 3 55`) and reads its `ov01` (base light) and `ov02` (base heat). These are converted to float and divided by 4 to produce base emission rates.

2. **Scale by time of day**: The base rates are further scaled depending on the current time of day:

   | Time | Period | Light Scale | Heat Scale |
   |---|---|---|---|
   | 0 | Dawn | base / 3 (~33%) | base / 3 (~33%) |
   | 1 | Morning | base (100%) | base * 2/3 (~67%) |
   | 2 | Afternoon | base (100%) | base (100%) |
   | 3 | Evening | base * 2/3 (~67%) | base / 2 (50%) |
   | 4 | Night | base / 4 (25%) | base / 4 (25%) |

3. **Seasonal heat adjustment**: The heat value is further modified based on the current season:

   | Season | Effect on Heat |
   |---|---|
   | 0 — Spring | No change |
   | 1 — Summer | Randomly adds +0.1, +0.2, or +0.3 |
   | 2 — Autumn | Randomly subtracts -0.1 or -0.2 |
   | 3 — Winter | Randomly subtracts -0.1, -0.2, or -0.3 |

4. **Update visual indicators**: Part 1 pose is set to the time of day, Part 2 pose is set to the season.

5. **Broadcast to emitters**: Sends message `1000` with the computed light value to all `1 1 12` agents, and message `1000` with the computed heat value to all `1 1 14` agents.

### Impact on Room CA

Indirectly controls **CA 1 (Light)** and **CA 2 (Heat)** across the entire Norn Terrarium ceiling via the emitter agents.

---

## 1 1 12 — Light Emitter

Simple invisible agents placed at 15 positions along the Norn Terrarium ceiling. Each receives a light emission value from the controller and emits it as **CA 1 (Light)** into its room.

**Attributes:** `16` (Invisible)
**Sprite:** "targ", 2 images, plane 9000

### Positions

Distributed along the ceiling from x=529 to x=3991, with y-coordinates ranging from 11 to 401 (following the terrarium's arched ceiling line).

### Events

| Event | Number | Description |
|---|---|---|
| Message 1000 | 1000 | Sets light emission: `emit 1 _p1_` — emits CA 1 (Light) at the rate specified in parameter 1 |

### Impact on Room CA

Each emitter continuously emits **CA 1 (Light)** into its room at the rate set by the controller. The 15 emitters spread across the ceiling ensure even light distribution throughout the terrarium.

---

## 1 1 14 — Heat Emitter

Simple invisible agents placed at the same 15 positions as the light emitters. Each receives a heat emission value from the controller and emits it as **CA 2 (Heat)** into its room.

**Attributes:** `16` (Invisible) — except the emitter at position (878, 230) which has `attr 6` (Mouseable + Activateable), likely a debugging artifact.
**Sprite:** "targ", 2 images, plane 9000

### Events

| Event | Number | Description |
|---|---|---|
| Message 1000 | 1000 | Sets heat emission: `emit 2 _p1_` — emits CA 2 (Heat) at the rate specified in parameter 1 |

### Impact on Room CA

Each emitter continuously emits **CA 2 (Heat)** into its room at the rate set by the controller. Combined with the seasonal and time-of-day adjustments from the controller, this creates a natural temperature cycle in the Norn Terrarium.

---

## 2 10 37 — Grass Particle

100 small grass/debris particles that fall through the Norn Terrarium under gravity. They simulate organic matter floating down and decomposing when they reach the ground.

**Attributes:** `192` (SufferCollisions + SufferPhysics)
**Sprite:** "graz", 2 images, plane 3000
**Elasticity:** 0 (no bounce)

### Creation

Each particle is spawned with random properties:
- **Gravity**: Randomly set to 0.1, 0.3, or 0.4 (creating varying fall speeds)
- **Position**: Random x between 596 and 3860, y at 363
- **Permeability**: Random between 0 and 70

### Events

| Event | Number | Description |
|---|---|---|
| Collision | 6 | Triggered when the particle collides with a surface |

### Collision Behavior (Event 6)

When a grass particle hits the **ground** (`wall eq down`):
1. Changes to decomposition pose (pose 1)
2. Adds **+0.5 to CA 4 (Nutrient)** in the current room
3. Adds **+0.5 to CA 3 (Water)** in the current room
4. Waits 20 ticks (~1 second)
5. Kills itself

### Impact on Room CA

Each decomposing particle enriches the ground-level rooms with:
- **CA 3 (Water):** +0.5 per particle
- **CA 4 (Nutrient):** +0.5 per particle

With 100 particles falling at different rates, this creates a steady trickle of nutrients and moisture into the terrarium's lower rooms, supporting plant growth and ecological balance.

---

## Removal Script

The `rscr` section removes all agents created by this script:
- Kills all `1 1 12` (light emitters), `2 10 37` (grass particles), `1 1 13` (controller), and `1 1 14` (heat emitters)
- Removes all associated event scripts (`scrx`)
