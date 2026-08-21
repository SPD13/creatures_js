# !map.cos - World Map Definition

**Source**: `Assets/Bootstrap/001 World/!map.cos`

## Overview

This is the foundational bootstrap script that defines the entire physical layout of the Creatures 3 Ark spaceship. It does not create any agents — instead, it constructs the world map from scratch by defining all 10 metarooms, 512 rooms, 883 inter-room doors, and the Cellular Automata (CA) diffusion rates that govern environmental propagation.

The script executes the following sequence:
1. **Clears any existing map** (`mapk`) and sets the world dimensions to 10,000 x 10,000 pixels (`mapd`).
2. **Creates 10 metarooms** (`addm`), each backed by a BLK background image, positioned at non-overlapping coordinates within the world space.
3. **Populates each metaroom with rooms** (`addr`), each defined by a trapezoidal boundary (left/right X coordinates, left/right ceiling Y, left/right floor Y). Each room is assigned a type (`rtyp`) and optional localized music (`rmsc`).
4. **Connects rooms with doors** (`door`), setting permeability values (0 = sealed, 50 = partially open, 100 = fully open) that control creature navigation between adjacent rooms.
5. **Configures CA diffusion rates** (`rate`) for all 16 room types across 20 CA channels, governing how temperature, light, nutrients, smells, and other environmental properties propagate.
6. **Sets the initial camera** (`meta`) to MetaRoom 0 (Norn Vivarium).

The Ark is a generation ship containing distinct biomes for different creature species (Norns, Ettins, Grendels) connected by corridors, engineering sections, and specialized utility rooms.

---

## MetaRoom Summary

| ID | Name | Background | Position (x, y) | Size (w × h) | Rooms | Main Music |
|---|---|---|---|---|---|---|
| 0 | Norn Vivarium | `norn3.0` | (0, 0) | 4112 × 1300 | 116 | `main.mng\vivariumgarden` |
| 1 | Ettin Desert | `ettin1.8` | (4215, 0) | 2968 × 1200 | 68 | `desert.mng\main` |
| 2 | Aquarium | `aqua2.6` | (3270, 1569) | 2924 × 1168 | 77 | `main.mng\aquariumbeach` |
| 3 | Grendel Jungle | `gren3.4` | (14, 1363) | 3000 × 1400 | 101 | `grendel.mng\swamp` |
| 4 | Bridge & Engineering | `main3.0` | (76, 2866) | 6868 × 1652 | 81 | `main.mng\corridor` |
| 5 | Pinball Machine | `pinball2` | (7220, 670) | 796 × 596 | 63 | *(none)* |
| 6 | Space (exterior) | `space` | (7210, 29) | 800 × 600 | 1 | *(none)* |
| 7 | Learning Room | `Learning_room1.8` | (8209, 46) | 800 × 600 | 3 | `main.mng\vivariumlearning` |
| 8 | Crypt | `crypt1.5` | (8206, 688) | 800 × 600 | 1 | *(none)* |
| 9 | Comms Room | `blank` | (4145, 1252) | 400 × 300 | 1 | *(none)* |

**Total**: 512 rooms across 10 metarooms.

---

## MetaRoom Details

### MetaRoom 0 — Norn Vivarium

The primary habitat for Norns. A large, multi-level biome spanning the upper-left portion of the world. Contains lush garden areas, a hatchery for egg incubation, a nursery, an orchard with fruit trees, a treehouse canopy, and a pond ecosystem. Connected to the lower decks via corridors.

**Room Types Used**: Outdoor (0), Wooden Walkway (1), Indoor Corridor (3), Soil (5), Underwater (8)

**Music Zones** (8 distinct tracks):

| Zone | Music Track | Description |
|---|---|---|
| Garden | `main.mng\vivariumgarden` | Open garden areas — the default biome music |
| Hatchery | `main.mng\vivariumhatchery` | Egg incubation area |
| Nursery | `main.mng\vivariumnursery` | Young creature nurturing area |
| Orchard | `main.mng\vivariumorchard` | Fruit-bearing tree area |
| Treehouse | `main.mng\vivariumtreehouse` | Elevated canopy platforms spanning the upper level |
| Pond | `main.mng\vivariumpond` | Water body with underwater rooms |
| Corridor | `main.mng\vivariumcorridor` | Internal connecting hallways |
| Main Corridor | `main.mng\corridor` | Ship corridor linking to other areas |

**Structure**: The metaroom is organized vertically with the treehouse canopy at the top (y ≈ 0–340), the orchard and open areas in the middle (y ≈ 340–640), the garden and nursery at ground level (y ≈ 560–880), corridors below (y ≈ 840–1080), and the pond underwater zone at the bottom (y ≈ 1017–1090).

---

### MetaRoom 1 — Ettin Desert

A hot, arid biome designed for Ettins. Features an open desert landscape, a quarry, a volcanic region, a small forest at the eastern edge, and deep tunnel systems running beneath the surface.

**Room Types Used**: Outdoor (0), Indoor Corridor (3), Soil (5), Sand/Desert (7), Underwater (8), Tunnel (10)

**Music Zones** (6 distinct tracks):

| Zone | Music Track | Description |
|---|---|---|
| Main Desert | `desert.mng\main` | Open desert landscape |
| Forest | `desert.mng\forest` | Eastern forest border with submerged areas |
| Quarry | `desert.mng\quarry` | Mining/excavation area at the upper level |
| Volcano | `desert.mng\volcano` | Volcanic region in the western portion |
| Tunnel 1 | `desert.mng\tunnel1` | Primary underground tunnel network |
| Tunnel 2 | `desert.mng\tunnel2` | Secondary deep tunnel system |

**Structure**: The upper level (y ≈ 0–400) contains the quarry, open desert, and forest canopy. The middle level (y ≈ 350–605) has the main habitable desert floor. The lower level (y ≈ 605–1070) contains the extensive tunnel system running beneath the entire biome.

---

### MetaRoom 2 — Aquarium

An aquatic biome featuring both surface beaches and deep underwater environments. Contains cave systems, airlock doors for water containment, and a large beach area. The deepest rooms reach near the bottom of the metaroom.

**Room Types Used**: Outdoor (0), Indoor Corridor (3), Airlock/Door (4), Sand/Beach (7), Deep Water (9)

**Music Zones** (4 distinct tracks):

| Zone | Music Track | Description |
|---|---|---|
| Beach | `main.mng\aquariumbeach` | Surface beach and shallow water areas |
| Underwater | `main.mng\aquariumunderwater` | Deep water zones with full submersion |
| Caves | `main.mng\aquariumcaves` | Underground cave system beneath the water |
| Door Area | `main.mng\aquariumdoor` | Airlock/transition areas between wet and dry zones |

**Structure**: The upper section contains dry beach areas and door/airlock rooms. The middle section has the main water body. The lower section features deep underwater caves and passages. Several rooms use type 4 (Airlock) to mark the boundary between air and water.

---

### MetaRoom 3 — Grendel Jungle

A dense, multilayered jungle biome for Grendels. Features swampy ground level, an upper canopy walkway, cryogenics chambers, a sewer system below, and a pond. This is the most vertically complex biome with 7 different room types.

**Room Types Used**: Outdoor (0), Wooden Walkway (1), Concrete (2), Indoor Corridor (3), Soil (5), Grass (6), Underwater (8)

**Music Zones** (6 distinct tracks):

| Zone | Music Track | Description |
|---|---|---|
| Swamp | `grendel.mng\swamp` | Marshy ground level — the default biome music |
| Ground | `grendel.mng\ground` | Solid ground walkways |
| Upper | `grendel.mng\upper` | Upper canopy and elevated platforms |
| Sewer | `grendel.mng\sewer` | Underground sewer passages |
| Cryogenics | `grendel.mng\cryogenics` | Cold storage/laboratory area |
| Pond | `grendel.mng\pond` | Freshwater pond area |

**Structure**: The upper level (y ≈ 1363–1635) contains elevated walkways and canopy access. The middle level (y ≈ 1605–1998) has the main ground, grass, and cryogenics areas. The lower level (y ≈ 1983–2270) contains the sewer network and swamp/pond areas. A small concrete outdoor section (type 2) connects to the lowest point.

---

### MetaRoom 4 — Bridge & Engineering

The Ark's main operational deck, stretching nearly the full width of the world. Contains the bridge, laboratories, engineering bays, and the central corridor that ties the entire ship together. This is the largest metaroom by area.

**Room Types Used**: Outdoor/Atmosphere (0) — all rooms

**Music Zones** (6 distinct tracks):

| Zone | Music Track | Description |
|---|---|---|
| Bridge | `bridge.mng\main` | Main bridge and command area |
| Laboratory 1 | `bridge.mng\labs1` | Science lab section 1 |
| Laboratory 2 | `bridge.mng\labs2` | Science lab section 2 |
| Corridor | `main.mng\corridor` | Central connecting corridor |
| Engineering 1 | `engineering.mng\engineering1` | Engineering bay section 1 |
| Engineering 2 | `engineering.mng\engineering2` | Engineering bay section 2 |

**Structure**: The upper portion contains the bridge and its sweeping approach from the west. The central corridor runs horizontally across the middle. Below the corridor, labs and engineering sections extend downward. The engineering sections on the east side are the deepest, with a large multi-level engineering bay reaching the bottom of the metaroom.

---

### MetaRoom 5 — Pinball Machine

A small, self-contained entertainment area shaped as a pinball machine. Contains 63 intricately arranged rooms forming bumpers, ramps, channels, and scoring zones. No music is assigned.

**Room Types Used**: Outdoor/Atmosphere (0) — all rooms

**Structure**: A dense network of small, irregularly shaped rooms within a 796×596 pixel space. Rooms are arranged to create pinball-like physics pathways with narrow channels, curved paths, and dead-end pockets.

---

### MetaRoom 6 — Space (Exterior)

The exterior view of space outside the Ark. A single large room with no music, representing the void.

**Room Types Used**: Outdoor/Atmosphere (0)

**Structure**: One room spanning nearly the entire 800×600 metaroom (coordinates 7297–8006, y 67–626).

---

### MetaRoom 7 — Learning Room

An educational area for teaching creatures. Contains 3 rooms with learning-themed music.

**Room Types Used**: Outdoor/Atmosphere (0)

**Structure**: A main room spanning most of the space, with two smaller rooms on the east side (one upper, one lower).

---

### MetaRoom 8 — Crypt

A single-room space, likely used for creature storage or memorial purposes. No music.

**Room Types Used**: Outdoor/Atmosphere (0)

**Structure**: One room spanning the entire metaroom.

---

### MetaRoom 9 — Comms Room

A small utility room with a blank background. Used for the communications interface or as a holding area. The smallest metaroom at 400×300 pixels.

**Room Types Used**: Outdoor/Atmosphere (0)

**Structure**: One room spanning the entire metaroom.

---

## Room Types

The `rtyp` command assigns a type to each room, which affects creature behavior, CA propagation rates, and environmental properties.

| Type ID | Name | Used In | Description |
|---|---|---|---|
| 0 | Outdoor/Atmosphere | All metarooms | Default room type; standard atmosphere |
| 1 | Wooden Walkway | Vivarium, Jungle | Elevated wooden platforms and catwalks |
| 2 | Concrete | Jungle | Hard industrial flooring |
| 3 | Indoor Corridor | Vivarium, Desert, Aquarium, Jungle | Enclosed passageways |
| 4 | Airlock/Door | Aquarium | Pressure doors between wet/dry zones |
| 5 | Soil | Vivarium, Desert, Jungle | Dirt/earth ground |
| 6 | Grass | Jungle | Grassy ground surfaces |
| 7 | Sand/Desert | Desert, Aquarium | Sandy surfaces, desert floors, beaches |
| 8 | Underwater | Vivarium, Desert, Jungle | Submerged areas |
| 9 | Deep Water | Aquarium | Fully submerged aquatic zones |
| 10 | Tunnel | Desert | Enclosed underground passages |

---

## Door Connectivity

The script defines **883 door connections** between rooms using the `door` command:

```
door <room1_id> <room2_id> <permeability>
```

Permeability values control how easily creatures can pass between rooms:

| Value | Meaning | Usage |
|---|---|---|
| 0 | Sealed | Permanently blocked passages (used in Bridge/Space areas) |
| 50 | Partially open | Semi-restricted access (tunnel entrances, vertical transitions) |
| 100 | Fully open | Unrestricted passage (most common) |

The door network creates a connected graph that enables creature pathfinding across the entire Ark. Most doors within biomes are fully open (100), while inter-level transitions and restricted areas use partial (50) or sealed (0) permeability. Sealed doors (permeability 0) are used strategically for certain Bridge and Space areas that are initially inaccessible and may be opened by gameplay scripts.

---

## Cellular Automata (CA) Diffusion Rates

The script configures CA rates for **16 room types** (0–15) across **20 CA channels** (0–19) using:

```
rate <room_type> <ca_index> <gain> <loss> <diffusion>
```

Where:
- **gain**: Rate at which the CA value increases toward emitter sources (0.0–1.0)
- **loss**: Rate at which the CA value decays over time (0.0–1.0)
- **diffusion**: Rate at which the CA value spreads to neighboring rooms (0.0–1.0)

### CA Channel Reference

| Index | Property | Description |
|---|---|---|
| 0 | Temperature | Heat level in the room |
| 1 | Radiation | Light/radiation exposure |
| 2 | Heat Source | Proximity to heat-emitting objects |
| 3 | Pressure | Atmospheric pressure |
| 4 | Wind | Air movement |
| 5 | Nutrients | Organic nutrient concentration |
| 6–14 | Smell Channels | Various creature/object scent trails |
| 15–17 | Extended Smells | Additional scent propagation channels |
| 18–19 | Special | Additional environmental properties |

### Notable CA Configurations by Room Type

**Type 0 (Outdoor/Atmosphere)** — The baseline environment:
- Full temperature gain (1.0), no loss, full diffusion
- Strong radiation gain (1.0) with slow loss (0.001)
- Moderate heat source gain (0.8) with moderate diffusion (0.7)
- High pressure response (0.9) with fast loss (0.05)
- No wind propagation
- Full nutrient gain with moderate loss (0.1)
- Standard smell propagation (0.99 gain, 0.001 loss, 0.8 diffusion)

**Types 5–7 (Soil/Grass/Sand)** — Natural ground surfaces:
- Reduced smell diffusion (0.4 vs 0.8 for corridors), meaning scents dissipate more in natural environments
- Higher heat source gain (1.0) for soil
- Low special channel (19) diffusion (0.01), limiting propagation of certain properties

**Types 8–9 (Underwater/Deep Water)** — Aquatic environments:
- No heat source propagation (0.0 gain for type 8)
- Very slow pressure response (0.0001 loss)
- No wind at all
- Reduced nutrient loss (0.001) — nutrients persist longer underwater
- Standard smell propagation (0.99 gain) — creatures can still detect scents

**Types 11–15 (Inert)** — These room types have CA channels set to zero across the board (except radiation at index 1). They function as environmentally dead zones where no CA properties propagate.

---

## Initialization Commands

| Line | Command | Description |
|---|---|---|
| 1 | `mapk` | Kills/clears any existing map data |
| 2 | `brmi 0 0` | Resets the brain map index to (0, 0) |
| 3 | `mapd 10000 10000` | Sets world dimensions to 10,000 × 10,000 pixels |
| 1995 | `meta 0 -1 -1 0` | Sets the initial camera view to MetaRoom 0 (Norn Vivarium) |

---

## World Layout Diagram

```
Y=0     ┌──────────────────┬─────────────────┐  ┌────┐ ┌────┐
        │                  │                  │  │ 6  │ │ 7  │
        │   0: Vivarium    │   1: Ettin       │  │Spce│ │Lrn │
        │   (4112×1300)    │   Desert         │  └────┘ ├────┤
        │                  │   (2968×1200)    │         │ 8  │
Y≈1300  ├───────────┐      │                  │  ┌────┐ │Crpt│
        │ 3: Grendel│      └──────────────────┘  │ 5  │ └────┘
        │  Jungle   │  ┌──┐                      │Pnbl│
        │(3000×1400)│  │9 │                      │    │
        │           │  └──┘                      └────┘
Y≈2763  └───────────┘
Y≈2866  ┌─────────────────────────────────────────┐
        │          4: Bridge & Engineering         │
        │               (6868×1652)                │
Y≈4518  └─────────────────────────────────────────┘
                         X=0 ──────────────── X=10000
```

*(Positions are approximate; diagram is not to scale)*
