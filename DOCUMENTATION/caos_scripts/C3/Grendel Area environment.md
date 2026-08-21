# Grendel Area environment.cos - Grendel Jungle Environmental System

**Source**: `Assets/Bootstrap/001 World/Grendel Area environment.cos`

## Overview

This script implements the environmental simulation for the Grendel jungle area (the Grendel Terrarium) aboard the Ark. It creates two interconnected systems: a visual atmosphere made of decorative particles and an environmental control system that dynamically adjusts room **Light** (CA 1) and **Heat** (CA 2) emissions across the jungle.

The CA emission system reads its base intensity values from the Grendel Mother (3 3 56), then modulates them based on **time of day** and **season**. The jungle environment differs from the Ettin desert in important ways: morning light is dimmer (filtered by canopy), the jungle retains more heat at night (tropical heat retention), and winter has a milder cooling effect. These ecological differences reflect the dense, humid character of the Grendel jungle versus the open Ettin desert. The emitted CA values diffuse through adjacent rooms, creating a dynamic thermal and lighting gradient that influences creature behavior and plant growth.

A separate particle spawner periodically generates atmospheric particles ("nornatmos") whose spawn frequency scales with the Grendel Mother's activity level (ov03). The Grendel spawner can produce significantly more particles per burst (up to 1000 vs 100 in the Ettin desert), creating a thicker, more humid atmosphere consistent with a jungle biome.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 114 | Atmospheric Particle Spawner | `blnk` | Invisible agent that periodically spawns atmospheric particles based on Grendel Mother activity level | [Detail](#atmospheric-particle-spawner-1-1-114) |
| 2 10 37 | Grazing Particles | `graz` | 100 decorative particles scattered across the jungle floor for visual ambience | [Detail](#grazing-particles-2-10-37) |
| 1 1 102 | Light & Heat Controller | `targ` | Master controller that reads Grendel Mother settings and broadcasts time/season-adjusted light and heat emission values | [Detail](#light--heat-controller-1-1-102) |
| 1 1 103 | Light Emitter | `targ` | Emits CA 1 (Light) into the room at the intensity received from the controller (19 instances) | [Detail](#light-emitter-1-1-103) |
| 1 1 104 | Heat Emitter | `targ` | Emits CA 2 (Heat) into the room at the intensity received from the controller (11 instances) | [Detail](#heat-emitter-1-1-104) |

---

## Atmospheric Particle Spawner (1 1 114)

An invisible agent that acts as a timed spawner for atmospheric particles in the Grendel jungle. The spawn frequency dynamically adjusts based on the Grendel Mother's ov03 value — higher activity levels produce more frequent and abundant particle bursts, giving the jungle a thick, humid, hazy atmosphere. Compared to the Ettin desert spawner, the Grendel version can produce up to 1000 particles per burst (vs 100), reflecting the denser jungle atmosphere.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | — | Default (no special attributes) |
| `tick` | 9 | Initial tick; dynamically adjusted by timer script |
| Sprite | `blnk` | Invisible 1-frame sprite (spawner anchor) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Calculates spawn frequency and creates atmospheric particles |

#### Event 9 — Timer (Particle Spawning)

Runs as a locked (atomic) operation:

1. **Frequency calculation** based on Grendel Mother (3 3 56):
   - Reads `ov03` from a random 3 3 56 agent (defaults to 3 if none found)
   - Formula: `tick = 1800 - (ov03 + 1)^2 * 50`
   - Higher ov03 = shorter tick interval = more frequent spawning

   | ov03 Value | Tick Interval | Spawn Frequency |
   |---|---|---|
   | 0 | 1750 | Very slow |
   | 1 | 1600 | Slow |
   | 2 | 1350 | Moderate |
   | 3 | 1000 | Fast |
   | 4 | 550 | Very fast |
   | 5 | 0 | Continuous |

2. **Particle creation**: Spawns 10–1000 atmospheric particles (2 19 2, sprite `nornatmos`) at random positions across the Grendel jungle (x: 366–2588, y: 1505):
   - `attr 192` — Physics + Suffers Collisions (particles fall and interact with surfaces)
   - `elas 0` — No bounce
   - Random gravity (0.3–0.7) per particle for varied fall speeds
   - Random permeability (0–70)

---

## Grazing Particles (2 10 37)

100 decorative floating particles scattered across the Grendel jungle floor at bootstrap. They provide visual ambience — small motes drifting in the humid jungle air. Each particle has randomized gravity, creating a gentle, varied floating effect. These are static visual agents with no event scripts.

**Note**: This same classifier (2 10 37) is also created by the Ettin area environment script to populate the Ettin desert. Both scripts share the "graz" sprite but place particles in different areas of the Ark.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 192 | Physics + Suffers Collisions |
| `elas` | 0 | No bounce |
| `accg` | 0.1, 0.3, or 0.4 | Random gravity per particle (1/3 chance each) |
| `perm` | 0–70 | Random permeability |
| Sprite | `graz` | 2-frame grazing particle sprite |
| Count | 100 | Created in a loop |

### Initial Placement

All 100 particles are placed at random X positions between 217 and 2787, at Y = 1840 (Grendel jungle floor area), plane 3000.

### Events

None — these are purely visual, physics-driven particles with no behavior scripts.

---

## Light & Heat Controller (1 1 102)

The master environmental controller for the Grendel jungle area. It periodically reads the current light and heat settings from the Grendel Mother (3 3 56), applies time-of-day and seasonal modifiers, then broadcasts the adjusted values to all Light Emitters (1 1 103) and Heat Emitters (1 1 104) in the area. This creates a day/night cycle and seasonal variation in the jungle's environmental conditions.

The Grendel controller produces a distinct environmental profile compared to the Ettin desert: mornings are dimmer (canopy filtering), nights retain more heat (tropical retention), and winters are milder.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Camera shy |
| `tick` | 10 | Initial tick (overridden to 300 by timer script) |
| Sprite | `targ` | Minimal sprite for positioning |
| Position | 377, 1475 | Grendel jungle area |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Reads Grendel Mother settings, applies time/season modifiers, broadcasts to emitters |

#### Event 9 — Timer (Environmental Control Loop)

Fires every 300 ticks. This is the core environmental update cycle:

**Step 1 — Read base values from Grendel Mother (3 3 56):**
- Finds a random 3 3 56 agent and reads `ov01` (light setting, 0–4) and `ov02` (heat setting, 0–4)
- Converts to float and divides by 4, normalizing to a 0.0–1.0 range

**Step 2 — Apply time-of-day modifiers:**

| Time | Period | Light Modifier | Heat Modifier |
|---|---|---|---|
| 0 | Dawn | base / 3 | base / 3 |
| 1 | Morning | base / 2 | base * 2/3 |
| 2 | Afternoon | full | full |
| 3 | Evening | base * 2/3 | base / 2 |
| 4 | Night | base / 4 | base / 2 |

**Comparison with Ettin desert:**

| Time | Grendel Light | Ettin Light | Grendel Heat | Ettin Heat |
|---|---|---|---|---|
| Dawn | 1/3 | 1/3 | 1/3 | 1/3 |
| Morning | **1/2** | full | **2/3** | full |
| Afternoon | full | full | full | full |
| Evening | 2/3 | 2/3 | **1/2** | 2/3 |
| Night | 1/4 | 1/4 | **1/2** | 1/4 |

Key ecological differences:
- **Mornings**: Less light and heat reach through the jungle canopy
- **Nights**: The jungle retains significantly more heat (1/2 vs 1/4) — tropical heat retention
- **Evenings**: Less heat than the Ettin desert's lingering warmth

**Step 3 — Apply seasonal modifiers (heat only):**

| Season | Modifier |
|---|---|
| 0 (Spring) | No change (waits 1 tick) |
| 1 (Summer) | 50% chance: heat + 0.1 |
| 2 (Autumn) | 50% chance: heat - 0.1 or heat - 0.2 |
| 3 (Winter) | 50% chance: heat - 0.1 (milder than Ettin) |

**Note**: The Grendel winter modifier is milder than the Ettin desert's (maximum -0.1 vs -0.2), consistent with tropical jungle heat retention.

**Step 4 — Clamp and broadcast:**
- Both light and heat values are capped at maximum 1.0
- Sends light value to all 1 1 103 agents via message 1000
- Sends heat value to all 1 1 104 agents via message 1000

**Example values** (with default Grendel Mother settings ov01=4, ov02=4):

| Time of Day | Season | Light | Heat |
|---|---|---|---|
| Afternoon | Spring | 1.0 | 1.0 |
| Morning | Summer | 0.5 | 0.67–0.77 |
| Dawn | Spring | 0.33 | 0.33 |
| Night | Winter | 0.25 | 0.40–0.50 |
| Evening | Autumn | 0.67 | 0.30–0.50 |

---

## Light Emitter (1 1 103)

Simple agents positioned across the Grendel jungle that emit **CA 1 (Light)** into their rooms. They receive their emission intensity from the Light & Heat Controller (1 1 102) via message 1000. 19 instances are distributed broadly across the jungle at multiple elevations, providing wide light coverage across the canopy, mid-level, and ground areas.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Camera shy |
| Sprite | `targ` | Minimal sprite |
| Plane | 9000 | Far background layer |

### Initial Placement

| Instance | Position | Area |
|---|---|---|
| 1 | 377, 1475 | Upper jungle |
| 2 | 544, 1410 | Upper jungle |
| 3 | 784, 1410 | Upper jungle |
| 4 | 982, 1410 | Upper jungle |
| 5 | 1198, 1410 | Upper jungle |
| 6 | 1475, 1410 | Upper jungle |
| 7 | 1716, 1410 | Upper jungle |
| 8 | 1912, 1410 | Upper jungle |
| 9 | 2135, 1410 | Upper jungle |
| 10 | 2314, 1410 | Upper jungle |
| 11 | 2529, 1471 | Upper jungle |
| 12 | 2675, 2190 | Mid-level jungle |
| 13 | 2549, 2190 | Mid-level jungle |
| 14 | 2344, 2520 | Lower jungle |
| 15 | 2193, 2520 | Lower jungle |
| 16 | 2035, 2520 | Lower jungle |
| 17 | 1888, 2520 | Lower jungle |
| 18 | 190, 2079 | Mid-level jungle (west) |
| 19 | 185, 1859 | Mid-level jungle (west) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Message | Emit Light at the received intensity |

#### Event 1000 — Message (Emit Light)

Receives the light intensity value as `_p1_` from the controller and calls `emit 1 _p1_` to emit CA 1 (Light) into the room at that intensity.

### Room CA Effects

| CA Index | Name | Change | Source |
|---|---|---|---|
| 1 | Light | _p1_ (0.0–1.0) | Continuous emission at controller-calculated intensity |

---

## Heat Emitter (1 1 104)

Simple agents positioned across the upper Grendel jungle that emit **CA 2 (Heat)** into their rooms. They receive their emission intensity from the Light & Heat Controller (1 1 102) via message 1000. 11 instances are distributed along the upper jungle canopy level, with heat diffusing downward to lower areas through the room CA system.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Camera shy |
| Sprite | `targ` | Minimal sprite |
| Plane | 9000 | Far background layer |

### Initial Placement

| Instance | Position |
|---|---|
| 1 | 377, 1475 |
| 2 | 544, 1410 |
| 3 | 784, 1410 |
| 4 | 982, 1410 |
| 5 | 1198, 1410 |
| 6 | 1475, 1410 |
| 7 | 1716, 1410 |
| 8 | 1912, 1410 |
| 9 | 2135, 1410 |
| 10 | 2314, 1410 |
| 11 | 2529, 1471 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Message | Emit Heat at the received intensity |

#### Event 1000 — Message (Emit Heat)

Receives the heat intensity value as `_p1_` from the controller and calls `emit 2 _p1_` to emit CA 2 (Heat) into the room at that intensity.

### Room CA Effects

| CA Index | Name | Change | Source |
|---|---|---|---|
| 2 | Heat | _p1_ (0.0–1.0) | Continuous emission at controller-calculated intensity |

---

## Removal Script (rscr)

The removal script cleans up the CA emission infrastructure:

1. Kills all Light & Heat Controllers (`enum 1 1 102 -> kill targ`)
2. Kills all Light Emitters (`enum 1 1 103 -> kill targ`)
3. Kills all Heat Emitters (`enum 1 1 104 -> kill targ`)

**Note**: The removal script does not clean up the Atmospheric Particle Spawner (1 1 114), Grazing Particles (2 10 37), or any spawned atmospheric particles (2 19 2). These visual elements persist independently.

---

## System Diagram

```
+---------------------------------+
|  Grendel Mother                 |
|  (3 3 56) - Creature-based     |
|                                 |
|  ov01 = Light setting (0-4)    |
|  ov02 = Heat setting (0-4)     |
|  ov03 = Activity level (0-4)   |
+--------+-----------+-----------+
         |           |
    read ov01/02     | read ov03
         |           |
         v           v
+--------------+  +------------------------+
| Controller   |  | Particle Spawner       |
| (1 1 102)    |  | (1 1 114)              |
|              |  |                        |
| Applies:     |  | tick = 1800 -          |
| - Time of    |  |   (ov03+1)^2 * 50     |
|   day        |  |                        |
| - Season     |  | Spawns 10-1000         |
|              |  | "nornatmos" (2 19 2)   |
| Clamps 0-1   |  | atmospheric particles  |
+--+-------+---+  +------------------------+
   |       |
   | msg   | msg
   | 1000  | 1000
   v       v
+------+ +----------+
|1 1   | |  1 1     |
|103   | |  104     |
|(x19) | |  (x11)   |
|      | |          |
|emit 1| | emit 2   |
|Light | | Heat     |
+------+ +----------+
   |          |
   v          v
+---------------------+
|   Room CA System    |
|                     |
| CA 1 (Light) ------>|  Diffuses through
| CA 2 (Heat)  ------>|  Grendel jungle rooms
+---------------------+
```

## Room CA Effects

| CA Index | Name | Source | Intensity | Ecological Role |
|---|---|---|---|---|
| 1 | Light | Light Emitters (1 1 103) | 0.0–1.0, varies by time of day and season | Illumination for the Grendel jungle; filtered by canopy (dimmer mornings than desert), affects plant growth and creature perception |
| 2 | Heat | Heat Emitters (1 1 104) | 0.0–1.0, varies by time of day and season | Thermal conditions for the jungle; retains more heat at night than the desert, influences creature comfort, plant viability, and ecosystem health |

## Dependencies

| Agent | Classifier | Role | Script |
|---|---|---|---|
| Grendel Mother | 3 3 56 | Provides base light/heat/activity settings (ov01, ov02, ov03) | `Grendel mother.cos` |
