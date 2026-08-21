# Agent Types

This article details each agent type in Creatures 3, their unique features, and when to use them.

## Type Hierarchy

```
Agent (Base)
├── SimpleAgent          ← Single sprite
│   └── PointerAgent     ← Mouse cursor
├── CompoundAgent        ← Multiple parts
│   └── Vehicle          ← Carries passengers
└── Skeleton             ← Articulated body
    └── Creature         ← Full AI
```

---

## SimpleAgent

The simplest agent type - a single sprite with basic physics.

### Features

| Feature | Description |
|---------|-------------|
| Single sprite | One EntityImage for display |
| Basic physics | Gravity, velocity, collision |
| Scripting | Full CAOS support |
| Lightweight | Minimal memory footprint |

### Properties

```javascript
class SimpleAgent extends Agent {
    myNormalPlane: number  // Z-depth for rendering
}
```

### Use Cases

- **Food items** - Fruit, seeds, cheese
- **Toys** - Balls, blocks
- **Decorations** - Plants, rocks
- **Pickups** - Items creatures can carry
- **Simple gadgets** - Single-piece machines

### Creating a SimpleAgent (CAOS)

```caos
* Create a simple agent
new: simp 2 1 1 "mysprite" 4 0 5000
* family=2, genus=1, species=1
* sprite="mysprite", imageCount=4
* firstImage=0, plane=5000
```

### Type Flags

```javascript
// SimpleAgent type mask
AGENT_NORMAL | AGENT_SIMPLE = 3

// Check type
agent.isSimpleAgent()  // true for SimpleAgent
```

---

## PointerAgent

The user's cursor - handles mouse/touch interaction with the game world.

### Features

| Feature | Description |
|---------|-------------|
| Mouse tracking | Follows cursor position |
| Agent pickup | Can pick up and carry agents |
| Hand-holding | Special interaction with creatures |
| UI priority | Always renders on top (plane 10000) |
| Port connections | Can connect agent ports |

### Special Properties

```javascript
class PointerAgent extends SimpleAgent {
    hotspot: { x, y }           // Click point offset
    carriedAgent: AgentHandle   // Currently held agent
    handHoldingCreature: AgentHandle  // Creature being guided
    connectionMode: boolean     // Port connection mode
}
```

### Pickup/Drop Mechanics

```
┌─────────────────────────────────────────────────┐
│              POINTER PICKUP FLOW                 │
│                                                 │
│   Click on Agent                                │
│        │                                        │
│        ▼                                        │
│   Check ATTR bit 2 (carryable?)                │
│        │                                        │
│        ├── No ──► Ignore click                  │
│        │                                        │
│        ▼ Yes                                    │
│   Fire pickup script (SCRP 6)                   │
│        │                                        │
│        ▼                                        │
│   Agent attached to pointer                     │
│   Movement status = CARRIED                     │
│        │                                        │
│        ▼                                        │
│   Agent follows mouse                           │
│        │                                        │
│        ▼                                        │
│   Click to drop                                 │
│        │                                        │
│        ▼                                        │
│   Fire drop script (SCRP 5)                     │
│   Movement status = FLOATING                    │
└─────────────────────────────────────────────────┘
```

### Hand-Holding (Creature Interaction)

When clicking on a creature:
1. Pointer "holds hand" with creature
2. Creature follows pointer direction
3. Releases when pointer moves too fast

### Type Flags

```javascript
// PointerAgent type mask
AGENT_NORMAL | AGENT_SIMPLE | AGENT_POINTER = 7

// Only one PointerAgent exists
world.getPointer()  // Returns the pointer
```

---

## CompoundAgent

Multi-part agents with synchronized rendering and UI support.

### Features

| Feature | Description |
|---------|-------------|
| Multiple parts | Up to 256 parts per agent |
| Part types | Plain, button, text, graph, camera |
| Synchronized | Parts move/render together |
| UI support | Clickable buttons, text input |
| Hotspots | Click regions per part |

### Part System

```
┌───────────────────────────────────────────────────────────┐
│                    COMPOUND AGENT                          │
│                                                           │
│   Part 0 (Base)                                           │
│   ┌─────────────┐                                         │
│   │   Sprite    │ ← Base position, base plane             │
│   │   Image     │                                         │
│   └─────────────┘                                         │
│         │                                                 │
│    ┌────┴────┐                                           │
│    │         │                                           │
│    ▼         ▼                                           │
│  Part 1    Part 2                                        │
│  ┌─────┐   ┌─────┐                                       │
│  │ +10 │   │ +20 │  ← Relative X offset                  │
│  │ +5  │   │ -10 │  ← Relative Y offset                  │
│  │ +1  │   │ +2  │  ← Relative plane offset              │
│  └─────┘   └─────┘                                       │
│                                                           │
│   All parts move when agent moves                        │
│   All parts share agent's scripts                        │
└───────────────────────────────────────────────────────────┘
```

### Part Types

| Type | Class | Purpose |
|------|-------|---------|
| **PLAIN** | CompoundPart | Basic visual part |
| **BUTTON** | UIButton | Clickable with hover state |
| **TEXT** | UIText | Editable text input |
| **FIXED_TEXT** | UIFixedText | Display-only text |
| **GRAPH** | UIGraph | Data visualization |
| **CAMERA** | CameraPart | Viewport camera |

### Creating Parts (CAOS)

```caos
* Create compound agent (creates part 0)
new: comp 2 2 1 "panel" 10 0 5000

* Add button part at index 1
pat: butt 1 "button" 3 10 20 1 100 0
* index=1, sprite="button", imageCount=3
* relX=10, relY=20, relPlane=1
* hoverAnim=100, messageOnClick=0

* Add plain part at index 2
pat: dull 2 "display" 1 50 10 2
* index=2, sprite="display", imageCount=1
* relX=50, relY=10, relPlane=2

* Add text part at index 3
pat: text 3 "textbg" 1 10 50 0 101 "font"
* Editable text with message 101 on submit
```

### Rendering Order

Parts render in order of:
1. **Plane** (ascending - lower planes first)
2. **Creation index** (tiebreaker for same plane)

```javascript
// Sort algorithm
parts.sort((a, b) => {
    if (a.plane !== b.plane) {
        return a.plane - b.plane;  // Lower plane first
    }
    return a.creationIndex - b.creationIndex;
});
```

### Type Flags

```javascript
// CompoundAgent type mask
AGENT_NORMAL | AGENT_COMPOUND = 9

// Check for compound (includes Vehicle)
agent.isCompoundAgent()  // true for CompoundAgent and Vehicle
```

---

## Vehicle

A compound agent that can carry other agents as passengers.

### Features

| Feature | Description |
|---------|-------------|
| Cabin bounds | Rectangular passenger area |
| Passenger list | Tracks carried agents |
| Movement sync | Passengers move with vehicle |
| Capacity | Maximum passenger count |

### Cabin System

```
┌─────────────────────────────────────────────────────────────┐
│                       VEHICLE                                │
│                                                             │
│   ┌───────────────────────────────────────────┐             │
│   │              Vehicle Sprite               │             │
│   │                                           │             │
│   │    ┌─────────────────────────────┐       │             │
│   │    │         CABIN               │       │             │
│   │    │    (cabinLeft, cabinTop)    │       │             │
│   │    │            ┌───┐            │       │             │
│   │    │            │ P │ Passenger  │       │             │
│   │    │            └───┘            │       │             │
│   │    │   (cabinRight, cabinBottom) │       │             │
│   │    └─────────────────────────────┘       │             │
│   │                                           │             │
│   └───────────────────────────────────────────┘             │
│                                                             │
│   Passengers must fit within cabin bounds                   │
│   Passengers move when vehicle moves                        │
└─────────────────────────────────────────────────────────────┘
```

### Cabin Properties

```javascript
class Vehicle extends CompoundAgent {
    cabinLeft: number      // Left edge of cabin
    cabinTop: number       // Top edge of cabin
    cabinRight: number     // Right edge of cabin
    cabinBottom: number    // Bottom edge of cabin
    cabinCapacity: number  // Max passengers
    passengers: AgentHandle[]  // Current passengers
}
```

### Setting Cabin (CAOS)

```caos
* Create vehicle
new: vhcl 2 3 1 "lift" 5 0 5000

* Set cabin boundaries
cabv 10 20 90 80
* cabinLeft=10, cabinTop=20
* cabinRight=90, cabinBottom=80
```

### Passenger Management

```javascript
// When agent enters vehicle
vehicle.addPassenger(agent);
agent.myMovementStatus = MovementStatus.CARRIED_BY_VEHICLE;
agent.setCarrier(vehicle);

// When vehicle moves
vehicle.moveTo(newX, newY);
// Internally calls:
for (const passenger of passengers) {
    passenger.shift(deltaX, deltaY);
}

// When agent exits
vehicle.removePassenger(agent);
agent.myMovementStatus = MovementStatus.AUTONOMOUS;
```

### Type Flags

```javascript
// Vehicle type mask
AGENT_NORMAL | AGENT_COMPOUND | AGENT_VEHICLE = 25

// Check specifically for vehicle
agent.isVehicle()  // true only for Vehicle
```

---

## Skeleton (Creature Body)

Articulated body system for creatures with multiple connected body parts.

### Features

| Feature | Description |
|---------|-------------|
| 14 body parts | Head, body, limbs, tail |
| Joint angles | 4 angles per joint (0-3) |
| Directional | 4 directions (E, W, N, S) |
| Poses | 256 pose table entries |
| Gaits | 16 walking animations |

### Body Parts

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATURE BODY PARTS                       │
│                                                             │
│                         HEAD (a)                            │
│                           │                                 │
│              ┌────────────┴────────────┐                   │
│              │         BODY (b)        │                   │
│              └─┬──────────────────────┬┘                   │
│                │                      │                     │
│     ┌──────────┴──────────┐    ┌─────┴──────────┐         │
│     │                     │    │                │         │
│  L_HUMERUS (i)      R_HUMERUS (k)               │         │
│     │                     │                      │         │
│  L_RADIUS (j)       R_RADIUS (l)                │         │
│                                                  │         │
│     ┌──────────┬──────────┴──────────┬─────────┐          │
│     │          │                     │         │          │
│  L_THIGH (c) R_THIGH (f)        TAIL_ROOT (m) │          │
│     │          │                     │         │          │
│  L_SHIN (d)  R_SHIN (g)         TAIL_TIP (n)  │          │
│     │          │                               │          │
│  L_FOOT (e)  R_FOOT (h)                       │          │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Part Indices

| Index | Letter | Part |
|-------|--------|------|
| 0 | a | Head |
| 1 | b | Body |
| 2 | c | Left Thigh |
| 3 | d | Left Shin |
| 4 | e | Left Foot |
| 5 | f | Right Thigh |
| 6 | g | Right Shin |
| 7 | h | Right Foot |
| 8 | i | Left Humerus (upper arm) |
| 9 | j | Left Radius (lower arm) |
| 10 | k | Right Humerus |
| 11 | l | Right Radius |
| 12 | m | Tail Root |
| 13 | n | Tail Tip |

### Pose System

```javascript
// Pose encodes direction + angles for all parts
const pose = skeleton.getPose();

// Pose table has 256 entries
// Each entry defines positions for all body parts

// Set pose
skeleton.setPose(42);  // Use pose table entry 42
```

### Direction-Based Rendering

Body parts have different Z-offsets based on direction:

| Direction | Effect |
|-----------|--------|
| EAST | Right limbs in front |
| WEST | Left limbs in front |
| NORTH | All limbs behind body |
| SOUTH | Mixed layering |

### Type Flags

```javascript
// Skeleton type mask
AGENT_NORMAL | AGENT_SKELETON = 33

// Check for skeleton
agent.isSkeleton()  // true for Skeleton and Creature
```

---

## Creature

Full AI entity with brain, biochemistry, genetics, and 9 faculties.

### Features

| Feature | Description |
|---------|-------------|
| Neural brain | Lobes, neurons, decisions |
| Biochemistry | 256 chemicals, organs, reactions |
| Genome | DNA defining traits |
| 9 Faculties | Specialized subsystems |
| Learning | Reinforcement and instincts |

### Faculty System

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATURE FACULTIES                        │
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│   │    Life     │    │    Motor    │    │   Brain     │   │
│   │  (survival) │    │ (movement)  │    │ (decisions) │   │
│   └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│   │ Biochem     │    │  Sensory    │    │ Linguistic  │   │
│   │ (chemicals) │    │ (perception)│    │ (language)  │   │
│   └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│   │Reproductive │    │   Music     │    │ Expressive  │   │
│   │ (breeding)  │    │  (hearing)  │    │ (emotions)  │   │
│   └─────────────┘    └─────────────┘    └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Drives

Creatures have 20 internal drives that motivate behavior:

| ID | Drive | Description |
|----|-------|-------------|
| 0 | Pain | Physical discomfort |
| 1-3 | Hunger (protein/carb/fat) | Need for food |
| 4-5 | Coldness/Hotness | Temperature |
| 6-7 | Tiredness/Sleepiness | Rest needs |
| 8-9 | Loneliness/Crowdedness | Social needs |
| 10-12 | Fear/Boredom/Anger | Emotional state |
| 13 | Sex Drive | Reproduction urge |
| 14-19 | Navigation drives | Movement goals |

### Type Flags

```javascript
// Creature type mask
AGENT_NORMAL | AGENT_SKELETON | AGENT_CREATURE = 97

// Check specifically for creature
agent.isCreature()  // true only for Creature
```

---

## Type Checking Summary

| Method | True For |
|--------|----------|
| `isSimpleAgent()` | SimpleAgent, PointerAgent |
| `isPointerAgent()` | PointerAgent |
| `isCompoundAgent()` | CompoundAgent, Vehicle |
| `isVehicle()` | Vehicle |
| `isSkeleton()` | Skeleton, Creature |
| `isCreature()` | Creature |

### Safe Type Access

```javascript
// Get typed reference (throws if wrong type)
const vehicle = handle.getVehicleReference();
const creature = handle.getCreatureReference();

// Check before access
if (handle.isValid() && handle.get().isVehicle()) {
    const vehicle = handle.getVehicleReference();
    // Safe to use
}
```

---

## Key Files

| Agent Type | File |
|------------|------|
| Base | `Main_Game/src/engine/agents/Agent.js` |
| SimpleAgent | `Main_Game/src/engine/agents/SimpleAgent.js` |
| PointerAgent | `Main_Game/src/engine/agents/PointerAgent.js` |
| CompoundAgent | `Main_Game/src/engine/agents/CompoundAgent.js` |
| CompoundPart | `Main_Game/src/engine/agents/CompoundPart.js` |
| Vehicle | `Main_Game/src/engine/agents/Vehicle.js` |
| Skeleton | `Main_Game/src/engine/creature/skeleton/Skeleton.js` |
| Creature | `Main_Game/src/engine/creature/Creature.js` |

---

## Related Articles

- [Agent System Overview](#/article/agents-overview) - Agent basics
- [Input & Output Ports](#/article/agent-ports) - Agent communication
- [Sprites & Display System](#/article/agent-sprites) - Rendering
