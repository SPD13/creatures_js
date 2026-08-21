# Ettin area environment.cos - Ettin Desert Environmental System

**Source**: `Assets/Bootstrap/001 World/Ettin area environment.cos`

## Overview

This script implements the environmental simulation for the Ettin desert area (also called the Ettin Terrarium) aboard the Ark. It creates two interconnected systems: a visual atmosphere made of decorative particles and an environmental control system that dynamically adjusts room **Light** (CA 1) and **Heat** (CA 2) emissions across the desert.

The CA emission system reads its base intensity values from the Environmental Control gadget (3 3 57) placed in the Ettin area, then modulates them based on **time of day** and **season**. During morning and afternoon, light and heat are at their peak. At dawn, evening, and night, values are progressively reduced. Seasonal variation adds further realism: summer can increase heat slightly, while autumn and winter can reduce it. These emitted CA values diffuse through adjacent rooms, creating a dynamic thermal and lighting gradient across the Ettin area that influences creature behavior and plant growth.

A separate particle spawner periodically generates atmospheric dust particles ("nornatmos") whose spawn frequency scales with the environmental control gadget's activity level (ov03), creating a visual feedback loop where higher gadget settings produce more visible atmospheric activity.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 113 | Atmospheric Particle Spawner | `blnk` | Invisible agent that periodically spawns atmospheric dust particles based on environmental control activity level | [Detail](#atmospheric-particle-spawner-1-1-113) |
| 2 10 37 | Grazing Particles | `graz` | 100 decorative particles scattered across the desert floor for visual ambience | [Detail](#grazing-particles-2-10-37) |
| 1 1 40 | Light & Heat Controller | `targ` | Master controller that reads environmental control settings and broadcasts time/season-adjusted light and heat emission values | [Detail](#light--heat-controller-1-1-40) |
| 1 1 41 | Light Emitter | `targ` | Emits CA 1 (Light) into the room at the intensity received from the controller (2 instances) | [Detail](#light-emitter-1-1-41) |
| 1 1 42 | Heat Emitter | `targ` | Emits CA 2 (Heat) into the room at the intensity received from the controller (7 instances) | [Detail](#heat-emitter-1-1-42) |

---

## Atmospheric Particle Spawner (1 1 113)

An invisible agent that acts as a timed spawner for atmospheric dust/haze particles in the Ettin desert. The spawn frequency dynamically adjusts based on the Environmental Control gadget's ov03 value — higher activity levels produce more frequent and abundant particle bursts, giving the desert a more active, hazy appearance.

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

1. **Frequency calculation** based on Environmental Control gadget (3 3 57):
   - Reads `ov03` from a random 3 3 57 agent (defaults to 3 if none found)
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

2. **Particle creation**: Spawns 10–100 atmospheric particles (2 19 2, sprite `nornatmos`) at random positions across the Ettin area (x: 4955–6800, y: 197):
   - `attr 192` — Physics + Suffers Collisions (particles fall and interact with surfaces)
   - `elas 0` — No bounce
   - Random gravity (0.3–0.7) per particle for varied fall speeds
   - Random permeability (0–70)

---

## Grazing Particles (2 10 37)

100 decorative floating particles scattered across the Ettin desert floor at bootstrap. They provide visual ambience — small motes drifting in the desert air. Each particle has randomized gravity, creating a gentle, varied floating effect. These are static visual agents with no event scripts.

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

All 100 particles are placed at random X positions between 4630 and 6900, at Y = 300 (Ettin desert floor area), plane 3000.

### Events

None — these are purely visual, physics-driven particles with no behavior scripts.

---

## Light & Heat Controller (1 1 40)

The master environmental controller for the Ettin area. It periodically reads the current light and heat settings from the Environmental Control gadget (3 3 57), applies time-of-day and seasonal modifiers, then broadcasts the adjusted values to all Light Emitters (1 1 41) and Heat Emitters (1 1 42) in the area. This creates a day/night cycle and seasonal variation in the Ettin desert's environmental conditions.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Creature visible |
| `tick` | 10 | Initial tick (overridden to 300 by timer script) |
| Sprite | `targ` | Minimal sprite for positioning |
| Position | 4869, 26 | Ettin area, top-left |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Reads gadget settings, applies time/season modifiers, broadcasts to emitters |

#### Event 9 — Timer (Environmental Control Loop)

Fires every 300 ticks. This is the core environmental update cycle:

**Step 1 — Read base values from Environmental Control gadget (3 3 57):**
- Finds a random 3 3 57 agent and reads `ov01` (light setting, 0–4) and `ov02` (heat setting, 0–4)
- Converts to float and divides by 4, normalizing to a 0.0–1.0 range

**Step 2 — Apply time-of-day modifiers:**

| Time | Period | Light Modifier | Heat Modifier |
|---|---|---|---|
| 0 | Dawn | base / 3 | base / 3 |
| 1 | Morning | full | full |
| 2 | Afternoon | full | full |
| 3 | Evening | base * 2/3 | base * 2/3 |
| 4 | Night | base / 4 | base / 4 |

**Step 3 — Apply seasonal modifiers (heat only):**

| Season | Modifier |
|---|---|
| 0 (Spring) | No change (waits 1 tick) |
| 1 (Summer) | 50% chance: heat + 0.1 |
| 2 (Autumn) | 50% chance: heat - 0.1 or heat - 0.2 |
| 3 (Winter) | 50% chance: heat - 0.1 or heat - 0.2 |

**Step 4 — Clamp and broadcast:**
- Both light and heat values are capped at maximum 1.0
- Sends light value to all 1 1 41 agents via message 1000
- Sends heat value to all 1 1 42 agents via message 1000

**Example values** (with default gadget settings ov01=4, ov02=4):

| Time of Day | Season | Light | Heat |
|---|---|---|---|
| Morning | Spring | 1.0 | 1.0 |
| Morning | Summer | 1.0 | 1.0 (up to 1.0, capped) |
| Dawn | Spring | 0.33 | 0.33 |
| Night | Winter | 0.25 | 0.05–0.25 |
| Evening | Autumn | 0.67 | 0.47–0.67 |

---

## Light Emitter (1 1 41)

Simple agents positioned in the Ettin area that emit **CA 1 (Light)** into their rooms. They receive their emission intensity from the Light & Heat Controller (1 1 40) via message 1000. Two instances are placed at different locations to distribute light across the desert.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Creature visible |
| Sprite | `targ` | Minimal sprite |
| Plane | 9000 | Far background layer |

### Initial Placement

| Instance | Position |
|---|---|
| 1 | 6607, 443 |
| 2 | 5989, 85 |

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

## Heat Emitter (1 1 42)

Simple agents positioned across the Ettin desert that emit **CA 2 (Heat)** into their rooms. They receive their emission intensity from the Light & Heat Controller (1 1 40) via message 1000. Seven instances are distributed widely across the desert to create a broad heat gradient.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Creature visible |
| Sprite | `targ` | Minimal sprite |
| Plane | 9000 | Far background layer |

### Initial Placement

| Instance | Position |
|---|---|
| 1 | 5989, 85 |
| 2 | 6707, 142 |
| 3 | 5817, 90 |
| 4 | 5175, 153 |
| 5 | 4567, 352 |
| 6 | 5476, 119 |
| 7 | 5675, 125 |

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

1. Kills all Light & Heat Controllers (`enum 1 1 40 → kill targ`)
2. Kills all Light Emitters (`enum 1 1 41 → kill targ`)
3. Kills all Heat Emitters (`enum 1 1 42 → kill targ`)

**Note**: The removal script does not clean up the Atmospheric Particle Spawner (1 1 113), Grazing Particles (2 10 37), or any spawned atmospheric particles (2 19 2). These visual elements persist independently.

---

## System Diagram

```
┌─────────────────────────────────┐
│  Environmental Control Gadget   │
│  (3 3 57) - Player-adjustable   │
│                                 │
│  ov01 = Light setting (0-4)     │
│  ov02 = Heat setting (0-4)      │
│  ov03 = Activity level (0-4)    │
└────────┬───────────┬────────────┘
         │           │
    read ov01/02     │ read ov03
         │           │
         ▼           ▼
┌─────────────┐  ┌──────────────────────┐
│ Controller  │  │ Particle Spawner     │
│ (1 1 40)    │  │ (1 1 113)            │
│             │  │                      │
│ Applies:    │  │ tick = 1800 -        │
│ - Time of   │  │   (ov03+1)^2 * 50   │
│   day       │  │                      │
│ - Season    │  │ Spawns 10-100        │
│             │  │ "nornatmos" (2 19 2) │
│ Clamps 0-1  │  │ atmospheric particles│
└──┬──────┬───┘  └──────────────────────┘
   │      │
   │ msg  │ msg
   │ 1000 │ 1000
   ▼      ▼
┌──────┐ ┌──────────┐
│1 1 41│ │  1 1 42  │
│(x2)  │ │  (x7)    │
│      │ │          │
│emit 1│ │ emit 2   │
│Light │ │ Heat     │
└──────┘ └──────────┘
   │          │
   ▼          ▼
┌─────────────────────┐
│   Room CA System    │
│                     │
│ CA 1 (Light) ──────►│  Diffuses through
│ CA 2 (Heat)  ──────►│  Ettin area rooms
└─────────────────────┘
```

## Room CA Effects

| CA Index | Name | Source | Intensity | Ecological Role |
|---|---|---|---|---|
| 1 | Light | Light Emitters (1 1 41) | 0.0–1.0, varies by time of day and season | Illumination for the Ettin desert; affects plant growth and creature perception |
| 2 | Heat | Heat Emitters (1 1 42) | 0.0–1.0, varies by time of day and season | Thermal conditions for the desert; influences creature comfort, plant viability, and ecosystem health |

## Dependencies

| Agent | Classifier | Role | Script |
|---|---|---|---|
| Environmental Control | 3 3 57 | Provides base light/heat/activity settings (ov01, ov02, ov03) | `environmental controls.cos` |
