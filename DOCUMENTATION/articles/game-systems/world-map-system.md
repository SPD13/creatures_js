# World Map System

The Creatures 3 world is organized into a hierarchical spatial system of **metarooms** containing **rooms** connected by **doors**. This architecture enables complex environments with varied terrain, environmental properties, and controlled agent movement.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORLD MAP HIERARCHY                           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                        World                             │  │
│   │                                                         │  │
│   │   ┌─────────────────┐    ┌─────────────────┐           │  │
│   │   │   MetaRoom 0    │    │   MetaRoom 1    │    ...    │  │
│   │   │   (Norn Ship)   │    │   (Jungle)      │           │  │
│   │   │                 │    │                 │           │  │
│   │   │ ┌─────┬─────┐  │    │ ┌─────┬─────┐  │           │  │
│   │   │ │ R0  │ R1  │  │    │ │ R5  │ R6  │  │           │  │
│   │   │ ├─────┼─────┤  │    │ ├─────┼─────┤  │           │  │
│   │   │ │ R2  │ R3  │  │    │ │ R7  │ R8  │  │           │  │
│   │   │ └─────┴─────┘  │    │ └─────┴─────┘  │           │  │
│   │   └─────────────────┘    └─────────────────┘           │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Max 200 MetaRooms, Max 2000 Rooms total                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Metarooms

Metarooms are the **top-level spatial containers** that group related rooms together. They represent distinct areas of the world like the Norn Ship, Jungle, or Desert.

### Metaroom Properties

```javascript
{
    id: number,                    // Unique metaroom ID
    x: number,                     // World X position (top-left)
    y: number,                     // World Y position (top-left)
    width: number,                 // Width in pixels
    height: number,                // Height in pixels
    rooms: Set<roomId>,            // Room IDs contained within

    // Display properties
    currentBackground: string,     // Active background sprite
    backgroundOffset: {x, y},      // Background positioning

    // Camera constraints
    cameraConstraints: {
        minX, minY, maxX, maxY     // Camera movement limits
    },

    // Audio
    music: string,                 // Music track name
    ambientSound: string           // Ambient sound file
}
```

### Metaroom Limits

| Property | Limit |
|----------|-------|
| Maximum metarooms | 200 |
| Maximum rooms per world | 2000 |

### Creating Metarooms (CAOS)

```caos
* Add a new metaroom
* ADDM x y width height background
addm 0 0 3000 2000 "jungle_background"
* Returns: metaroom ID

* Example: Create ship metaroom at position (0,0), 2000x1500 pixels
setv va00 addm 0 0 2000 1500 "norn_ship_bg"
```

---

## Rooms

Rooms are individual spatial areas within metarooms. They define boundaries, contain agents, and have environmental properties.

### Room Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROOM STRUCTURE                              │
│                                                                 │
│   Standard Room (Rectangular):                                  │
│   ┌─────────────────────────────┐                              │
│   │          CEILING            │ ← Ceiling boundary           │
│   │                             │                              │
│   │  LEFT                 RIGHT │ ← Wall boundaries           │
│   │  WALL                 WALL  │                              │
│   │                             │                              │
│   │           FLOOR             │ ← Floor boundary            │
│   └─────────────────────────────┘                              │
│                                                                 │
│   Complex Room (Sloped):                                        │
│   ┌─────────────────────────────┐                              │
│   │ topLeft          topRight   │ ← Variable ceiling heights  │
│   │  ╲                    ╱     │                              │
│   │   ╲                  ╱      │                              │
│   │    ╲                ╱       │                              │
│   │     ╲______________╱        │ ← Sloped floor              │
│   │  bottomLeft    bottomRight  │                              │
│   └─────────────────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Room Boundaries (Vector2D)

```javascript
{
    // Floor line
    startFloor: Vector2D,       // Floor start point
    endFloor: Vector2D,         // Floor end point
    deltaFloor: Vector2D,       // Floor direction vector

    // Ceiling line
    startCeiling: Vector2D,     // Ceiling start point
    endCeiling: Vector2D,       // Ceiling end point
    deltaCeiling: Vector2D,     // Ceiling direction vector

    // Bounding box
    positionMin: Vector2D,      // Top-left corner
    positionMax: Vector2D,      // Bottom-right corner
    centre: Vector2D,           // Room center point

    // Corner heights (for sloped rooms)
    topLeft: number,            // Ceiling height at left
    topRight: number,           // Ceiling height at right
    bottomLeft: number,         // Floor height at left
    bottomRight: number         // Floor height at right
}
```

### Room Properties

```javascript
{
    id: number,                 // Unique room ID
    metaRoomId: number,         // Parent metaroom
    roomType: number,           // Type (0-15)

    // Environmental properties (0.0-1.0)
    temperature: float,
    pressure: float,
    lightLevel: float,
    radiation: float,

    // Wind
    windDirection: number,
    windSpeed: number,

    // Audio
    music: number,              // Music track ID

    // State
    isActive: boolean,
    isLoaded: boolean
}
```

### Standard Room Dimensions

```javascript
ROOM_PIXEL_WIDTH = 144      // Standard room width
ROOM_PIXEL_HEIGHT = 150     // Standard room height
```

### Creating Rooms (CAOS)

```caos
* Add a rectangular room
* ADDR metaroom x_left x_right y_top_left y_top_right y_bottom_left y_bottom_right
addr 0 100 244 50 50 200 200
* Returns: room ID

* Add a room with sloped floor (ramp going down to the right)
addr 0 100 244 50 50 150 200
*                        ↑   ↑
*              left floor    right floor (lower = higher Y)

* Add a room with sloped ceiling
addr 0 100 244 50 80 200 200
*                 ↑   ↑
*     left ceiling    right ceiling (lower at right)
```

---

## Room Types

A room's type says what its **surface and medium** are, and through that how **Cellular Automata
(CA) properties** behave inside it: the type is a selector into the CA rates table, where
`myCARates[roomType][caProperty]` gives the gain / loss / diffusion triple that governs how each
CA evolves in that room (see [Rooms](#/article/rooms) and
[Cellular Automata System](#/article/cellular-automata)).

### Standard Room Types

The eleven named types, from the `RTYP` command's own documentation
(`caos/commands/map/RTYP.js`):

| Type | Name | Notes |
|------|------|-------|
| 0 | Atmosphere | Open air — nothing to stand on |
| 1 | Wooden walkway | |
| 2 | Concrete walkway | |
| 3 | Indoor concrete | |
| 4 | Outdoor concrete | |
| 5 | Normal soil | Plants grow here |
| 6 | Boggy soil | |
| 7 | Drained soil | |
| 8 | Fresh water | **Drowns a creature whose head is in it** |
| 9 | Salt water | **Drowns a creature whose head is in it** |
| 10 | Ettin home | |

`ROOM_TYPE_COUNT` is 16, so types **11–15** are valid but unnamed; the stock `!map.cos` rate table
uses them for CA-opaque regions (`gain = 0, diffusion = 0`), which is where vehicle interiors and
sealed areas live.

Types 8 and 9 are not merely descriptive: `Creature.js` checks them by number
(`WATER_ROOM_TYPE_1 = 8`, `WATER_ROOM_TYPE_2 = 9`) to set a creature's air-quality locus to zero
when its head enters one, which is what makes it drown.

### Setting Room Type (CAOS)

```caos
* Get room type at position
setv va00 rtyp posx posy

* Set room type by room ID
rtyp room_id 5    * Set to normal soil
```

---

## Doors

Doors are the **boundaries between and around rooms**. They control agent movement and CA diffusion.

### Door Types

```
┌─────────────────────────────────────────────────────────────────┐
│                       DOOR TYPES                                 │
│                                                                 │
│   DOOR_LEFT_RIGHT (0): Vertical boundaries                     │
│   ┌─────┐│┌─────┐                                              │
│   │     ││     │                                               │
│   │  R1 ││  R2 │   ← Door between rooms                       │
│   │     ││     │                                               │
│   └─────┘│└─────┘                                              │
│                                                                 │
│   DOOR_CEILING_FLOOR (1): Horizontal boundaries                │
│   ┌───────────┐                                                │
│   │    R1     │                                                │
│   ├───────────┤ ← Floor/ceiling door                          │
│   │    R2     │                                                │
│   └───────────┘                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Door Structure

```javascript
{
    id: number,                  // Unique door ID
    doorType: number,            // 0=LEFT_RIGHT, 1=CEILING_FLOOR
    permeability: number,        // 0-100 (0=blocked, 100=open)

    // Room connections
    parentCount: number,         // 1=wall, 2=shared door
    parent1: number,             // First room ID
    parent2: number,             // Second room ID (-1 if wall)

    // Spatial definition
    start: Vector2D,             // Door edge start point
    end: Vector2D,               // Door edge end point
    delta: Vector2D,             // Direction vector
    length: number,              // Door edge length

    // CA properties
    doorage1: float,             // CA flow rate for room 1
    doorage2: float              // CA flow rate for room 2
}
```

### Door Categories in Rooms

Rooms organize their doors into collections for fast lookup:

```javascript
{
    doorCollection: Door[],      // All doors
    floorCollection: Door[],     // Floor doors (walk on)
    ceilingCollection: Door[],   // Ceiling doors (jump through)
    leftCollection: Door[],      // Left wall doors
    rightCollection: Door[]      // Right wall doors
}
```

### Shared vs Unshared Doors

```
┌─────────────────────────────────────────────────────────────────┐
│                  DOOR SHARING                                    │
│                                                                 │
│   UNSHARED (parentCount = 1):                                  │
│   External boundaries - room walls that don't connect          │
│   to other rooms                                                │
│   ┌─────────┐                                                   │
│   │         │ ← Wall (unshared door, parent2 = -1)             │
│   │   R1    │                                                   │
│   │         │                                                   │
│   └─────────┘                                                   │
│                                                                 │
│   SHARED (parentCount = 2):                                    │
│   Internal connections - doors between two rooms               │
│   ┌─────────┬─────────┐                                        │
│   │         │         │                                        │
│   │   R1    │   R2    │ ← Shared door (connects R1 and R2)    │
│   │         │         │                                        │
│   └─────────┴─────────┘                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Permeability System

Permeability controls what can pass through doors. Both doors and agents have permeability values.

### How Permeability Works

```
┌─────────────────────────────────────────────────────────────────┐
│                  PERMEABILITY SYSTEM                             │
│                                                                 │
│   Door Permeability (0-100):                                   │
│   • 0 = IMPERMEABLE (completely blocked)                       │
│   • 100 = PERMEABLE (fully open)                               │
│                                                                 │
│   Agent Permeability (1-100):                                  │
│   • 1 = Most permeable (can pass through almost anything)     │
│   • 100 = Least permeable (needs fully open doors)            │
│                                                                 │
│   Movement Rule:                                                │
│   ┌─────────────────────────────────────────────────────┐      │
│   │ Agent can pass if: door.permeability >= agent.perm  │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
│   Examples:                                                     │
│   Door=100, Agent=50  → PASS (100 >= 50)                       │
│   Door=50, Agent=50   → PASS (50 >= 50)                        │
│   Door=49, Agent=50   → BLOCKED (49 < 50)                      │
│   Door=0, Agent=1     → BLOCKED (0 < 1)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Permeability CAOS Commands

```caos
* Set door permeability between two rooms
door room1_id room2_id 75    * 75% permeable

* Get door permeability
setv va00 door room1_id room2_id

* Set agent permeability (on TARG)
perm 50    * Agent needs doors with perm >= 50

* Get agent permeability
setv va00 perm
```

### Common Permeability Values

| Value | Use Case |
|-------|----------|
| 0 | Solid wall, completely blocked |
| 25 | Heavy door, most agents blocked |
| 50 | Normal door, medium agents pass |
| 75 | Light barrier, most agents pass |
| 100 | Open passage, all agents pass |

---

## Floors, Ceilings, and Walls

Room boundaries are defined by four edge types, each capable of being sloped.

### Floor System

```
┌─────────────────────────────────────────────────────────────────┐
│                       FLOOR SYSTEM                               │
│                                                                 │
│   Flat Floor:                                                   │
│   ┌─────────────────────────────┐                              │
│   │                             │                              │
│   │                             │                              │
│   └─────────────────────────────┘                              │
│     bottomLeft = bottomRight (same Y)                          │
│                                                                 │
│   Sloped Floor (Ramp Down):                                    │
│   ┌─────────────────────────────┐                              │
│   │                         ╲   │                              │
│   │                      ╲      │                              │
│   │                   ╲         │                              │
│   └────────────────╲────────────┘                              │
│     bottomLeft < bottomRight (Y increases = lower)             │
│                                                                 │
│   Sloped Floor (Ramp Up):                                      │
│   ┌─────────────────────────────┐                              │
│   │   ╱                         │                              │
│   │      ╱                      │                              │
│   │         ╱                   │                              │
│   └────────────╱────────────────┘                              │
│     bottomLeft > bottomRight                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Floor Height Calculation

For sloped floors, the Y position is interpolated:

```javascript
getFloorY(xPosition) {
    const t = (xPosition - startFloor.x) / (endFloor.x - startFloor.x);
    return startFloor.y + t * (endFloor.y - startFloor.y);
}
```

### Ceiling System

Ceilings work identically to floors but define the upper boundary:

```caos
* Room with sloped ceiling (lower on right)
addr 0 100 244 50 100 200 200
*                 ↑    ↑
*     topLeft=50  topRight=100 (right ceiling is lower)
```

### Wall System

Left and right walls are vertical boundaries that can connect rooms horizontally:

```
┌─────────────────────────────────────────────────────────────────┐
│                       WALL SYSTEM                                │
│                                                                 │
│   ┌─────────┐   ┌─────────┐                                    │
│   │         │   │         │                                    │
│   │   R1    │ D │   R2    │   D = Door (shared wall)          │
│   │         │   │         │                                    │
│   └─────────┘   └─────────┘                                    │
│             ↑                                                   │
│       Shared door allows movement between R1 and R2            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Neighbor System

Rooms track their neighbors by direction for efficient navigation and CA propagation.

### Neighbor Directions

```javascript
{
    neighboursByDirection: {
        0: Set<roomId>,    // UP (through ceiling)
        1: Set<roomId>,    // DOWN (through floor)
        2: Set<roomId>,    // LEFT
        3: Set<roomId>     // RIGHT
    },
    neighbourRoomIds: Set<roomId>    // All neighbors combined
}
```

### Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEIGHBOR NAVIGATION                           │
│                                                                 │
│                    ┌─────┐                                      │
│                    │ R0  │ ← UP neighbor                       │
│                    └──┬──┘                                      │
│                       │                                         │
│   ┌─────┐        ┌────┴────┐        ┌─────┐                    │
│   │ R2  │←──LEFT─│   R1    │─RIGHT──│ R3  │                    │
│   └─────┘        └────┬────┘        └─────┘                    │
│                       │                                         │
│                    ┌──┴──┐                                      │
│                    │ R4  │ ← DOWN neighbor                     │
│                    └─────┘                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cellular Automata (CA) System

Each room maintains **20 environmental properties** that diffuse through doors over time.

### CA Properties

| Index | Property | Description |
|-------|----------|-------------|
| 0-4 | Atmospheric | Temperature, pressure, humidity, wind, light |
| 5-9 | Chemical | Oxygen, CO2, nutrients, toxins, pheromones |
| 10-14 | Physical | Radiation, sound, vibration, magnetism, electricity |
| 15-19 | Biological | Bacteria, plants, food, water, custom |

### Room CA Structure

```javascript
{
    caValues: float[20],        // Current values (0.0-1.0)
    caOldValues: float[20],     // Previous frame
    caOlderValues: float[20],   // Two frames ago
    caTempValue: float,         // Temp calculation storage
    caInput: float,             // Input from agents
    caTotalDoorage: float,      // Total door permeability
    perimeterLength: float      // Room perimeter
}
```

### CA Rates (per room type)

```javascript
{
    gain: float,        // Rate toward equilibrium
    loss: float,        // Rate away from equilibrium
    diffusion: float    // Rate through doors
}
```

### CA Update Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    CA UPDATE CYCLE                               │
│                                                                 │
│   1. HISTORY SHIFT                                              │
│      caOlderValues ← caOldValues ← caValues                    │
│                                                                 │
│   2. ROOM EQUILIBRIUM                                           │
│      For each CA property:                                      │
│      • If below target: apply gain rate                        │
│      • If above target: apply loss rate                        │
│                                                                 │
│   3. DOOR DIFFUSION                                             │
│      For each shared door:                                      │
│      • Calculate flow based on:                                │
│        - CA difference between rooms                           │
│        - Door permeability                                     │
│        - Diffusion rate                                        │
│      • Transfer CA between connected rooms                     │
│                                                                 │
│   4. AGENT INPUT                                                │
│      • Add contributions from emitting agents                  │
│      • Creatures emit smell, machines emit heat, etc.         │
│                                                                 │
│   5. VALUE CLAMPING                                             │
│      • Clamp final values to 0.0-1.0 range                    │
│                                                                 │
│   Note: Only ONE CA property updates per frame (cycles 0-19)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### CA Rate Configuration (CAOS)

```caos
* Set CA rates for a room type
* RATE room_type ca_index gain loss diffusion
rate 1 0 0.01 0.005 0.1
*    ↑ ↑  ↑     ↑     ↑
*    │ │  │     │     └── Diffusion rate
*    │ │  │     └── Loss rate
*    │ │  └── Gain rate
*    │ └── CA property 0 (temperature)
*    └── Room type 1 (garden)
```

---

## Link System

Links provide **CA propagation between non-adjacent rooms** (like ventilation shafts).

### Link Structure

```javascript
{
    parent1: number,        // First room ID
    parent2: number,        // Second room ID
    permeability: number,   // Connection strength (0-100)
    length: number,         // Connection distance
    doorage1: float,        // CA flow factor for room 1
    doorage2: float         // CA flow factor for room 2
}
```

---

## Coordinate System

### World Coordinates

All positions use a global 2D coordinate system:

```
┌─────────────────────────────────────────────────────────────────┐
│   (0,0) ────────────────────────────────────► X+               │
│     │                                                           │
│     │    ┌─────────────┐                                       │
│     │    │  MetaRoom   │                                       │
│     │    │   (x, y)    │                                       │
│     │    └─────────────┘                                       │
│     │                                                           │
│     ▼                                                           │
│    Y+                                                           │
│                                                                 │
│   Note: Y increases downward (screen coordinates)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Grid Coordinates

Rooms can be addressed by grid position:

```javascript
// Convert world to grid
gridX = floor(worldX / ROOM_PIXEL_WIDTH)   // 144
gridY = floor(worldY / ROOM_PIXEL_HEIGHT)  // 150

// Convert grid to world (top-left corner)
worldX = gridX * ROOM_PIXEL_WIDTH
worldY = gridY * ROOM_PIXEL_HEIGHT
```

### Local Room Coordinates

Relative to room's top-left corner:

```javascript
localX = worldX - room.positionMin.x
localY = worldY - room.positionMin.y
```

---

## Map Manager

The `MapManager` class orchestrates all map operations.

### Core Data Structures

```javascript
{
    rooms: Map<roomId, Room>,
    metaRooms: Map<metaRoomId, MetaRoom>,
    allDoors: Map<doorId, Door>,
    doorsByRoomPair: Map<"r1-r2", Door[]>,
    currentMetaRoomId: number,

    // Integration
    movementValidator: MovementValidator,
    caSystem: CASystem,
    displayManager: DisplayManager
}
```

### Key Operations

| Operation | Method |
|-----------|--------|
| Find room at position | `getRoomAt(x, y)` |
| Find metaroom at position | `getMetaRoomAt(x, y)` |
| Get room by ID | `getRoom(roomId)` |
| Get door between rooms | `getDoor(room1, room2)` |
| Get CA value | `getRoomProperty(roomId, caIndex)` |
| Set CA value | `setRoomProperty(roomId, caIndex, value)` |

---

## CAOS Map Commands Reference

### Metaroom Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `ADDM` | `addm x y w h bg` | Create metaroom, returns ID |
| `DELM` | `delm metaroom_id` | Delete metaroom |
| `META` | `meta` | Get metaroom at TARG position |
| `CMRA` | `cmra x y` | Set camera to metaroom at position |

### Room Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `ADDR` | `addr meta xl xr ytl ytr ybl ybr` | Create room, returns ID |
| `DELR` | `delr room_id` | Delete room |
| `ROOM` | `room targ` | Get room ID at TARG position |
| `RTYP` | `rtyp room_id` / `rtyp room_id type` | Get/set room type |
| `GRAP` | `grap x y` | Get room at position |

### Door Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `DOOR` | `door r1 r2` / `door r1 r2 perm` | Get/set door permeability |

### Agent Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `PERM` | `perm` / `perm value` | Get/set agent permeability |
| `RTYP` | `rtyp x y` | Get room type at position |

### CA Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `RATE` | `rate type ca gain loss diff` | Set CA rates |
| `PROP` | `prop room_id ca_index` | Get room CA value |
| `EMIT` | `emit ca_index value` | Agent emits CA |

---

## Display Rendering

### Plane System

| Plane Range | Content |
|-------------|---------|
| 0 | Metaroom backgrounds |
| 1-50 | Room visualizations |
| 50-600 | Agent sprites (Y-sorted) |
| 600+ | Debug overlays, UI |

### Room Rendering

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROOM RENDERING                                │
│                                                                 │
│   1. Draw polygon fill (room color by type)                    │
│   2. Draw boundaries:                                           │
│      • Floor line (with slope indicator)                       │
│      • Ceiling line (with slope indicator)                     │
│      • Left/Right walls                                        │
│   3. Draw doors with permeability colors:                      │
│      • Red = blocked (perm 0)                                  │
│      • Yellow = partial (perm 50)                              │
│      • Green = open (perm 100)                                 │
│   4. Draw room ID label at center                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `MapManager.js` | Central map management |
| `MetaRoom.js` | Metaroom class |
| `Room.js` | Room class with boundaries |
| `Door.js` | Door class with permeability |
| `Link.js` | Inter-room CA links |
| `CASystem.js` | Cellular automata processing |
| `Vector2D.js` | 2D vector mathematics |

---

## Related Articles

- [Collision & Physics](#/article/collision-system) - Agent movement and physics
- [Day/Night Cycle](#/article/day-night-cycle) - Environmental cycles
- [Creature Perception](#/article/creature-perception) - How creatures perceive rooms
