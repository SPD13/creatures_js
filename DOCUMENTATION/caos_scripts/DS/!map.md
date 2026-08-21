# !map.cos - World Map Definition (Docking Station)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/!map.cos`

## Overview

This is the foundational bootstrap script that defines the physical layout of the Docking Station ship — the **Capillata**. It does not create any agents; instead it builds the world map from scratch: 5 metarooms, 118 rooms, 172 inter-room doors, per-room music and types, and the Cellular Automata (CA) diffusion/loss rates that govern environmental propagation.

It is the Docking Station counterpart of the Creatures 3 [!map (001 World)](../C3/!map%20\(001%20World\).md). Compared with the sprawling C3 Ark (10 metarooms / 512 rooms spread across the whole world), the Capillata is a single compact ship: every metaroom sits in the lower-right region of the 10 000 × 10 000 world space (y ≈ 8 669 – 9 983).

The script executes the following sequence:

1. **Sets the base indices** (`brmi 10 600`) — new metarooms are numbered from **10** and new rooms from **600**. (Unlike C3's `!map`, this script does **not** call `mapk`; the splash-world map was a separate world, and the gameplay world starts clean.)
2. **Sets the world dimensions** to 10 000 × 10 000 pixels (`mapd 10000 10000`).
3. **Creates 5 metarooms** (`addm`), each backed by a sprite/BLK background, and assigns each a metaroom-wide music track (`mmsc`).
4. **Populates each metaroom with rooms** (`addr`), each a trapezoid (left/right X, left/right ceiling Y, left/right floor Y). Each room gets a type (`rtyp`) and optional localised music (`rmsc`). The room id returned by `addr` is echoed via `outv`/`outs " "` (debug output only).
5. **Connects rooms with doors** (`door`), setting permeability (50 = partially open, 100 = fully open). No sealed (0) doors are used.
6. **Configures CA rates** (`rate`) for 16 room types (0–15) across 20 CA channels (0–19).
7. **Sets the initial camera** (`meta 0 -1 -1 0`).

---

## MetaRoom Summary

| ID | Name | Background | Position (x, y) | Size (w × h) | Rooms | Metaroom Music |
|---|---|---|---|---|---|---|
| 10 | Docking Corridor | `SPRITE_CorridorBackdrop004` | (2071, 8732) | 1124 × 832 | 18 | `ds_music.mng\MetallicChords` |
| 11 | Norn Meso | `NornMeso039` | (281, 8736) | 1600 × 1012 | 73 | `ds_music.mng\StringsFull` |
| 12 | Workshop | `WorkshopBMP046` | (4277, 8669) | 1540 × 960 | 16 | `ds_music.mng\Tremelo` |
| 13 | Comms Room | `CommsV4_001` | (5909, 8678) | 800 × 600 | 10 | `ds_music.mng\TremeloBleep` |
| 14 | Space (exterior) | `space` | (3208, 9388) | 800 × 600 | 1 | *(none)* |

**Total:** 118 rooms across 5 metarooms.

---

## MetaRoom Details

### MetaRoom 10 — Docking Corridor

The connecting corridor of the Capillata, used as the docking/transition area. 18 small rooms forming a looped passage, all room type 0 (atmosphere). Most rooms inherit the metaroom music (`MetallicChords`); two rooms set local tracks (`Tremelo`, `TremeloBleep`).

**Room types used:** 0 (Outdoor/Atmosphere).

### MetaRoom 11 — Norn Meso

The main creature habitat — the Capillata's terrarium "meso". By far the largest metaroom (73 rooms) and the only one with a varied environment: a multi-level layout with corridors, soil and grass ground, sand, and an airlock/water boundary.

**Room types used:** 0 (Outdoor), 3 (Indoor Corridor), 4 (Airlock/Door), 5 (Soil), 6 (Grass), 7 (Sand).

**Room music zones:** `Bleep`, `StringChords`, `StringSolo` (plus the metaroom default `StringsFull`).

### MetaRoom 12 — Workshop

A utility/workshop area of the ship (16 rooms, all type 0). Several rooms set the `StringSolo` track; the rest use the metaroom default `Tremelo`.

**Room types used:** 0 (Outdoor/Atmosphere).

### MetaRoom 13 — Comms Room

The communications room (10 rooms), home to the online-docking comms equipment. Uses room types 0 and 3 (corridor). All rooms inherit the metaroom music (`TremeloBleep`).

**Room types used:** 0 (Outdoor), 3 (Indoor Corridor).

### MetaRoom 14 — Space (exterior)

The exterior view of space outside the ship — a single large room (type 0) with no music, representing the void/airlock destination.

**Room types used:** 0 (Outdoor/Atmosphere).

---

## Room Types

`rtyp` assigns a type to each room, affecting creature behaviour, CA propagation, and environmental properties. Only these types appear in the Docking Station map:

| Type ID | Name | Used In | Description |
|---|---|---|---|
| 0 | Outdoor/Atmosphere | All metarooms | Default room type; standard atmosphere |
| 3 | Indoor Corridor | Norn Meso, Comms | Enclosed passageways |
| 4 | Airlock/Door | Norn Meso | Pressure/airlock boundary |
| 5 | Soil | Norn Meso | Dirt/earth ground |
| 6 | Grass | Norn Meso | Grassy ground surfaces |
| 7 | Sand | Norn Meso | Sandy surfaces |

(CA rates are still configured for all 16 room types 0–15, even though only the six above are assigned to rooms here.)

---

## Door Connectivity

The script defines **172 door connections** between rooms:

```
door <room1_id> <room2_id> <permeability>
```

| Value | Meaning | Usage |
|---|---|---|
| 50 | Partially open | Semi-restricted transitions (a handful of doors) |
| 100 | Fully open | Unrestricted passage (the large majority) |

No sealed (0) doors are used — every room is reachable, forming a connected graph for creature pathfinding across the ship.

---

## Cellular Automata (CA) Diffusion Rates

CA rates are configured for **16 room types** (0–15) across **20 CA channels** (0–19):

```
rate <room_type> <ca_index> <gain> <loss> <diffusion>
```

- **gain** — rate the CA value rises toward emitter sources (0.0–1.0)
- **loss** — rate the CA value decays over time (0.0–1.0)
- **diffusion** — rate the CA value spreads to neighbouring rooms (0.0–1.0)

### CA Channel Reference

| Index | Property |
|---|---|
| 0 | Temperature |
| 1 | Radiation / light |
| 2 | Heat source |
| 3 | Pressure |
| 4 | Wind |
| 5 | Nutrients |
| 6–17 | Smell / scent channels |
| 18–19 | Special / additional properties |

### Notable configurations

- **Type 0 (Outdoor/Atmosphere)** — the baseline: full temperature gain, strong radiation with slow loss, moderate heat-source and pressure response, no wind, full nutrient gain, standard smell propagation (≈0.99 gain / 0.001 loss / 0.8 diffusion).
- **Types 5–7 (Soil/Grass/Sand)** — reduced smell diffusion (≈0.4) so scents dissipate faster on natural ground.
- **Types 8–9 (Underwater/Deep Water)** — no heat-source propagation, very slow pressure response, no wind, nutrients persist longer; smells still propagate. (Defined for completeness even though no rooms use them here.)
- **Types 11–15 (inert)** — all channels set to zero except radiation (index 1); environmentally dead zones.

---

## Initialization Commands

| Command | Description |
|---|---|
| `brmi 10 600` | Base metaroom index = 10, base room index = 600 for everything created below. |
| `mapd 10000 10000` | World dimensions: 10 000 × 10 000 pixels. |
| `meta 0 -1 -1 0` | Sets the camera (metaroom 0, natural centre `-1 -1`, no transition). The gameplay metarooms created here are 10–14. |

## No Created Agents

This script creates no agents; it only builds map geometry, doors and CA rates.

## Impact on Stimulus / Room CA

This script **defines** the CA substrate for the whole ship: the `rate` table fixes how every CA channel gains, loses and diffuses per room type, and the room types assigned via `rtyp` determine which profile each room uses. It emits no stimuli itself, but every later environmental emitter/diffusion behaviour in Docking Station operates on the rates established here.
