# Agent System Overview

## Introduction

In Creatures 3, an **Agent** is any interactive object in the game world. Everything from simple background decorations to complex machines and the creatures themselves are implemented as agents. The agent system provides a unified framework for:

- **Positioning and physics** - Movement, gravity, collision
- **Rendering** - Sprite display, animation, z-ordering
- **Scripting** - CAOS scripts for behavior
- **Communication** - Messaging between agents
- **Persistence** - Saving and loading world state

### What Can Be an Agent?

| Agent Type | Examples |
|------------|----------|
| Simple objects | Food, toys, plants, decorations |
| Machines | Lifts, doors, dispensers |
| UI elements | Buttons, panels, graphs |
| Vehicles | Elevators, submarines, carts |
| Creatures | Norns, Grendels, Ettins, Geats |
| System | Pointer (mouse cursor) |

---

## Agent Lifecycle

Every agent goes through a defined lifecycle from creation to destruction:

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT LIFECYCLE                           │
│                                                             │
│   ┌──────────┐    initialize()    ┌─────────────┐          │
│   │ CREATED  │ ─────────────────► │ INITIALIZED │          │
│   └──────────┘                    └──────┬──────┘          │
│        │                                 │                  │
│        │ (skip init)                     │ activate()       │
│        │                                 ▼                  │
│        │                          ┌──────────┐             │
│        └─────────────────────────►│  ACTIVE  │◄────┐       │
│                                   └─────┬────┘     │       │
│                                         │          │       │
│                          deactivate()   │          │       │
│                                         ▼          │       │
│                                   ┌──────────┐     │       │
│                                   │ INACTIVE │─────┘       │
│                                   └─────┬────┘  activate() │
│                                         │                   │
│                            kill/destroy │                   │
│                                         ▼                   │
│                                   ┌──────────┐             │
│                                   │ GARBAGE  │             │
│                                   └──────────┘             │
│                                         │                   │
│                                         │ cleanup           │
│                                         ▼                   │
│                                   ┌──────────┐             │
│                                   │ DELETED  │             │
│                                   └──────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Lifecycle States

| State | Description |
|-------|-------------|
| **CREATED** | Agent instantiated but not yet initialized |
| **INITIALIZED** | `initialize()` called, ready to activate |
| **ACTIVE** | `activate()` called, processing updates |
| **INACTIVE** | `deactivate()` called, paused |
| **GARBAGE** | Marked for deletion, no longer valid |
| **DELETED** | Memory freed |

---

## Class Hierarchy

The agent system uses inheritance to provide specialized behavior for different agent types:

```
Agent (Base Class)
├── SimpleAgent
│   └── PointerAgent
├── CompoundAgent
│   └── Vehicle
└── Skeleton
    └── Creature
```

### Inheritance Chain

| Class | Extends | Purpose |
|-------|---------|---------|
| **Agent** | - | Base class with physics, messaging, scripting |
| **SimpleAgent** | Agent | Single-sprite agent |
| **PointerAgent** | SimpleAgent | User cursor with pickup/drop |
| **CompoundAgent** | Agent | Multi-part agent with UI support |
| **Vehicle** | CompoundAgent | Carries passengers |
| **Skeleton** | Agent | Articulated body (creatures) |
| **Creature** | Skeleton | Full AI with brain, biochemistry |

---

## Agent Type Flags

Each agent has a type bitmask for efficient type checking. These flags match the original engine:

```javascript
const AgentType = {
    AGENT_NORMAL:   1,   // All agents have this
    AGENT_SIMPLE:   2,   // SimpleAgent and subclasses
    AGENT_POINTER:  4,   // PointerAgent only
    AGENT_COMPOUND: 8,   // CompoundAgent and subclasses
    AGENT_VEHICLE:  16,  // Vehicle only
    AGENT_SKELETON: 32,  // Skeleton and subclasses
    AGENT_CREATURE: 64   // Creature only
};
```

### Type Flag Combinations

| Agent Class | Type Flags | Bitmask |
|-------------|------------|---------|
| SimpleAgent | NORMAL \| SIMPLE | 3 |
| PointerAgent | NORMAL \| SIMPLE \| POINTER | 7 |
| CompoundAgent | NORMAL \| COMPOUND | 9 |
| Vehicle | NORMAL \| COMPOUND \| VEHICLE | 25 |
| Skeleton | NORMAL \| SKELETON | 33 |
| Creature | NORMAL \| SKELETON \| CREATURE | 97 |

### Type Checking

```javascript
// Check if agent is a vehicle
if (agent.isVehicle()) {
    // Vehicle-specific code
}

// Check compound agent (includes vehicles)
if (agent.isCompoundAgent()) {
    // Works for CompoundAgent and Vehicle
}
```

---

## Core Agent Properties

Every agent has these fundamental properties:

### Identity

```javascript
// Classifier - Unique type identifier
myClassifier: {
    family: number,   // Broad category (1-65535)
    genus: number,    // Sub-category (1-65535)
    species: number   // Specific type (1-65535)
}

// Unique ID - Assigned by AgentManager
myID: number
```

### Position and Physics

```javascript
// World position
myPositionVector: { x: number, y: number }

// Velocity for movement
myVelocityVector: { x: number, y: number }

// Physics properties
myGravitationalAcceleration: 0.3  // Default gravity
myElasticity: 0-100               // Bounce factor
myFrictionPercentage: 0-100       // Ground friction
myAeroDynamicPercentage: 0-100    // Air resistance
```

### Rendering

```javascript
// Sprite management
myEntityImage: EntityImage  // Sprite display object
myNormalPlane: number       // Z-depth for rendering
visible: boolean            // Visibility flag

// Dimensions (updated from sprite)
myCurrentWidth: number
myCurrentHeight: number
```

### CAOS Variables

```javascript
// 100 agent-local variables (OV00-OV99)
myGlobalVariables: Map<string, number|string>

// Access via CAOS
setv ov00 42    // Set variable
outv ov00       // Output: 42
```

### Carrying System

```javascript
// This agent is carried by...
_myCarrierHandle: AgentHandle

// This agent is carrying...
_myCarriedHandle: AgentHandle

// Movement status
myMovementStatus: MovementStatus  // AUTONOMOUS, CARRIED, etc.
```

---

## The Classifier System

Every agent carries a **Classifier** — the type identifier the engine uses to find scripts, look up agents, and route messages. It is the agent's "address" in the game's type space.

### The Four Numbers

In the original engine the classifier is four unsigned integers:

```text
Classifier:
    myFamily     // Broad category
    myGenus      // Sub-category within the family
    mySpecies    // Specific type within the genus
    myEvent      // Script/event number (only used for script lookup)
```

| Field | Meaning | Example |
|-------|---------|---------|
| **Family** | Broadest grouping. Family `4` is reserved for **all creatures**. | `4` = creature, `2` = food, `3` = plant… |
| **Genus** | Subdivision of a family. For creatures: `1`=Norn, `2`=Grendel, `3`=Ettin (`G_NORN`/`G_GRENDEL`/`G_ETTIN`). | Norn = `1` |
| **Species** | The most specific identifier — a unique agent kind. For creatures this carries the sex (`1`=male, `2`=female). | A specific toy, or male = `1` |
| **Event** | The script number to run (e.g. 1=activate1, 2=activate2). Only meaningful during script lookup, not stored on a live agent's identity. | `1` |

A classifier is read **left to right, broad to narrow**: Family narrows to Genus, which narrows to Species. A complete agent type is the triple `family genus species` (e.g. a male Norn is `4 1 1`).

> Creature classifiers are built at birth as `Classifier(family, genome.GetGenus() + 1, sex)` — which is why genus is 1-based (Norn=1) even though the genome stores it 0-based.

### The Catch-All Placeholder: 0

The value **`0` is never a real type** — no agent is ever family 0, genus 0, or species 0. Instead, **`0` is a wildcard meaning "any value at this level."** It exists so that a single generic script can serve many agents without having to be registered for every specific type.

When the engine looks up a script for an agent, it does **not** require an exact match. It uses `Scriptorium.FindScript` (mirrored in `Rebuild/Main_Game/src/engine/world/Scriptorium.js:450`), which falls back by progressively replacing the narrowest field with `0`:

```
Lookup for agent (Family F, Genus G, Species S), event E:

  1. Try  F  G  S  E      ← exact match
  2. Try  F  G  0  E      ← any species in this genus
  3. Try  F  0  0  E      ← any genus in this family
  4. Try  0  0  0  E      ← any agent at all (global default)

  First hit wins; NULL if none of the four exist.
```

Each step blanks the next field to the **left**, so the search only ever widens — it never tries `F 0 S` or `0 G S`. Species is generalised first, then genus, then family.

```text
// The fallback in full
returnValue = FindScriptExact(d)              // F G S E
if returnValue: return returnValue
d.mySpecies = 0; returnValue = FindScriptExact(d)  // F G 0 E
if returnValue: return returnValue
d.myGenus   = 0; returnValue = FindScriptExact(d)  // F 0 0 E
if returnValue: return returnValue
d.myFamily  = 0; returnValue = FindScriptExact(d)  // 0 0 0 E
return returnValue
```

### Why This Matters

- **Shared behaviour with one script.** A script installed as `2 0 0` (family 2 = food, any genus, any species) runs for *every* food agent unless a more specific script overrides it. This is how whole categories share `eat`/`activate` behaviour.
- **Global defaults.** A script installed as `0 0 0 E` is a last-resort handler that fires for any agent with no more specific script for event `E`.
- **Specificity wins.** Because exact matches are tried first, a per-species script always overrides the genus- or family-level fallback. To specialise one agent kind, register a script at its full `F G S` classifier; to cover the rest, register the broad `F 0 0` or `F G 0` variant.
- **Same rule for resource lookup.** The identical species → genus → family widening is used for catalogue "Agent Help" tags (`Scriptorium.js:277`) and the CAOS `WILD` command, so wildcard `0` behaves consistently across scripts and resources.

> **Pitfall:** `0` is *only* a wildcard in **lookup/registration**. A live agent's own `myClassifier` always holds concrete non-zero values — you will never find a running agent whose family is `0`.

---

## AgentHandle Reference System

AgentHandles are **smart pointers** that safely reference agents. They use reference counting to prevent dangling pointers when agents are deleted.

### Why AgentHandles?

```
Problem: Agent A stores pointer to Agent B
         Agent B is deleted
         Agent A's pointer is now invalid (crash!)

Solution: AgentHandle tracks validity
          When Agent B is deleted, handle becomes invalid
          Agent A can check before using
```

### Reference Counting

```javascript
// When AgentHandle acquires agent:
agent.incrementReferenceCount();

// When AgentHandle releases agent:
agent.decrementReferenceCount();

// When count reaches 0 and agent is garbage:
// Agent can be safely deleted
```

### Safe Accessors

```javascript
// Get agent (returns null if invalid)
const agent = handle.get();
if (agent) {
    // Safe to use
}

// Get with type check (throws if wrong type)
try {
    const vehicle = handle.getVehicleReference();
} catch (e) {
    // Not a vehicle or invalid
}

// Check validity
if (handle.isValid()) {
    // Handle points to valid agent
}
```

### Exception Codes

| Code | Meaning |
|------|---------|
| AHE0001 | Null agent access |
| AHE0002 | Garbage agent access |
| AHE0004-06 | SimpleAgent type errors |
| AHE0010-12 | CompoundAgent type errors |
| AHE0013-15 | Vehicle type errors |
| AHE0019-21 | Creature type errors |

---

## Agent Manager

The AgentManager is the central registry for all agents in the world.

### Responsibilities

| Function | Description |
|----------|-------------|
| **Registration** | Track all active agents |
| **ID Assignment** | Generate unique agent IDs |
| **Lookup** | Find agents by ID, classifier, or position |
| **Update Loop** | Call agent updates each tick |
| **Garbage Collection** | Clean up deleted agents |
| **Spatial Queries** | Find agents in an area |

### Agent Registration

```javascript
// Create and register agent
const agent = agentManager.createAgent({
    type: 'CompoundAgent',
    classifier: { family: 2, genus: 1, species: 1 },
    position: { x: 100, y: 200 },
    gallery: 'mysprite.c16',
    plane: 5000
});

// Agent is now tracked and updated
```

### Spatial Queries

```javascript
// Find agents near a point
const nearby = agentManager.getAgentsInRange(x, y, radius);

// Find agents in rectangle
const inArea = agentManager.getAgentsInRect(left, top, right, bottom);

// Find by classifier
const food = agentManager.getAgentsByClassifier(2, 5, 0);
```

### Update Loop

```
Each Game Tick:
  ├── For each active agent:
  │   ├── Update physics (position, velocity)
  │   ├── Update animation (EntityImage)
  │   ├── Process timer scripts
  │   └── Handle pending messages
  │
  └── Garbage collection pass
      └── Delete agents with refcount=0 and GARBAGE state
```

---

## Agent Serialization

Agents can be saved and loaded in binary format matching the original engine.

### Save Format

```
Agent Binary Data:
├── Classifier (family, genus, species)
├── ID
├── Position, velocity, last position
├── Physics properties
├── Attributes, permissions
├── CAOS variables (OV00-OV99)
├── Timer state
├── Rendering properties
└── EntityImage state
```

### Type-Specific Data

Each agent subclass adds its own data:

- **SimpleAgent**: `myNormalPlane`
- **CompoundAgent**: Parts array, base plane
- **Vehicle**: Cabin bounds, passengers
- **Creature**: Genome, brain, biochemistry

---

## Key Files

| File | Purpose |
|------|---------|
| `Agent.js` | Base agent class (171 KB) |
| `AgentHandle.js` | Smart pointer system (16 KB) |
| `AgentManager.js` | Agent registry (70 KB) |
| `SimpleAgent.js` | Single-sprite agent |
| `CompoundAgent.js` | Multi-part agent (31 KB) |
| `Vehicle.js` | Passenger transport (12 KB) |

---

## Related Articles

- [Agent Types](#/article/agent-types) - Detailed type documentation
- [Input & Output Ports](#/article/agent-ports) - Agent communication
- [Sprites & Display System](#/article/agent-sprites) - Rendering and animation
