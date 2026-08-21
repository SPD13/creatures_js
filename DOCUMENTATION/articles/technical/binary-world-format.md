# Creatures 3 Binary World Format Specification

## Overview

This document describes the binary format used for Creatures 3 world save files (`.sfc` files). The format is designed to serialize the complete game state including all agents, creatures, map data, scripts, and world settings.

## File Structure

### Compression Layer

The world file uses zlib compression with a custom header:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COMPRESSED FILE                              │
├─────────────────────────────────────────────────────────────────────┤
│ Header: "Creatures Evolution Engine - Archived information file.    │
│          zLib 1.13 compressed." + 0x1A + 0x04                       │
├─────────────────────────────────────────────────────────────────────┤
│ Version: int32 (value: 12)                                          │
├─────────────────────────────────────────────────────────────────────┤
│ Compressed Data (zlib deflate)                                      │
│   └── Decompresses to: World Data Stream                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Types Reference

| Type | Size | Description |
|------|------|-------------|
| int8 | 1 byte | Signed 8-bit integer |
| uint8 | 1 byte | Unsigned 8-bit integer |
| int16 | 2 bytes | Signed 16-bit integer (little-endian) |
| uint16 | 2 bytes | Unsigned 16-bit integer (little-endian) |
| int32 | 4 bytes | Signed 32-bit integer (little-endian) |
| uint32 | 4 bytes | Unsigned 32-bit integer (little-endian) |
| float32 | 4 bytes | IEEE 754 single-precision float |
| float64 | 8 bytes | IEEE 754 double-precision float |
| bool | 1 byte | Boolean (0 = false, non-zero = true) |
| string | 4 + n bytes | Length-prefixed string (int32 length + chars) |

---

## World Data Stream Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WORLD DATA STREAM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 1. PASSWORD                                                   │   │
│  │    └── string                                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 2. MUSIC EVENT                                                │   │
│  │    └── int32                                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 3. SCRIPTORIUM                                                │   │
│  │    ├── reserved: int32                                        │   │
│  │    ├── count: int32                                           │   │
│  │    └── scripts[count]: MacroScript objects                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 4. MAP                                                        │   │
│  │    ├── MetaRooms                                              │   │
│  │    ├── Rooms                                                  │   │
│  │    ├── Doors                                                  │   │
│  │    └── Links                                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 5. TIME VARIABLES                                             │   │
│  │    ├── seasonCount: uint32                                    │   │
│  │    ├── seasonLengthInDays: uint32                             │   │
│  │    ├── dayLengthInMinutes: uint32                             │   │
│  │    ├── yearLengthInDays: uint32                               │   │
│  │    ├── worldTick: uint32                                      │   │
│  │    └── pausedWorldTick: uint32                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 6. AGENT HANDLES                                              │   │
│  │    ├── selectedCreature: AgentHandle                          │   │
│  │    ├── birthdayAgent: AgentHandle                             │   │
│  │    └── countDownClock: AgentHandle                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 7. GAME VARIABLES                                             │   │
│  │    ├── count: uint32                                          │   │
│  │    └── entries[count]:                                        │   │
│  │        ├── key: string                                        │   │
│  │        └── value: CAOSVar                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 8. BOOTSTRAP FOLDERS                                          │   │
│  │    ├── count: uint32                                          │   │
│  │    └── folders[count]: string                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 9. SYSTEM TIME                                                │   │
│  │    ├── gameEndTime: SYSTEMTIME (16 bytes)                     │   │
│  │    └── lastPlayLength: SYSTEMTIME (16 bytes)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 10. MESSAGE QUEUE                                             │   │
│  │    ├── count: uint32                                          │   │
│  │    └── messages[count]: Message                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 11. PIXEL FORMAT                                              │   │
│  │    └── format: int32                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 12. FILE LISTS                                                │   │
│  │    ├── filesForAtticDelayed: FilePathList                     │   │
│  │    ├── filesForAtticNextTime: FilePathList                    │   │
│  │    ├── filesJustCreated: FilePathList                         │   │
│  │    └── filesInThePorch: StringList                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 13. UNIQUE IDENTIFIER                                         │   │
│  │    └── identifier: string                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 14. HISTORY STORE                                             │   │
│  │    ├── count: uint32                                          │   │
│  │    └── entries[count]:                                        │   │
│  │        ├── moniker: string                                    │   │
│  │        └── history: CreatureHistory                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 15. AGENT MANAGER                                             │   │
│  │    ├── agentCount: int32                                      │   │
│  │    ├── agents[count]: (uniqueID + Agent object)               │   │
│  │    ├── categoryIds[20]: int32                                 │   │
│  │    ├── creatureCollection: AgentHandle[]                      │   │
│  │    ├── baseUniqueID: int32                                    │   │
│  │    └── deferredScripts: DeferredScript[]                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 16. MAIN VIEW                                                 │   │
│  │    ├── x: float32                                             │   │
│  │    ├── y: float32                                             │   │
│  │    ├── zoom: float32                                          │   │
│  │    └── metaRoomId: int32                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 17. TINTS                                                     │   │
│  │    ├── count: int32                                           │   │
│  │    └── tints[count]: Tint (5 x int32)                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Object Serialization Protocol (OBST/OBEN)

All complex objects are serialized using the OBST/OBEN marker protocol for handling circular references and object identity.

### Object Format

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SERIALIZED OBJECT                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CASE 1: NULL Object                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ objectId: int32 = -2 (NULL_ARCHIVE_OBJECT)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  CASE 2: Back-Reference (previously written object)                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ objectId: int32 (index into objectVector, 0 to N-1)           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  CASE 3: New Object (first occurrence)                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ objectId: int32 (new index, >= current objectVector.length)   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ classId: int32 (index into classVector, or new class)         │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ [IF classId >= classVector.length]                            │   │
│  │   className: string (e.g., "Agent", "CompoundAgent")          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ startMarker: string = "OBST" (Object Start)                   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                                │   │
│  │   ┌──────────────────────────────────────────────────────┐   │   │
│  │   │            OBJECT-SPECIFIC DATA                       │   │   │
│  │   │  (defined by the object's write() method)             │   │   │
│  │   └──────────────────────────────────────────────────────┘   │   │
│  │                                                                │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ endMarker: string = "OBEN" (Object End)                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Special Object IDs

| ID | Constant | Description |
|----|----------|-------------|
| -2 | NULL_ARCHIVE_OBJECT | Null/undefined object reference |
| -1 | NOT_IN_ARCHIVE | Object not yet written to archive |
| -3 | RAW_POINTER | Raw pointer (not managed) |
| -4 | FIRST_AGENT | First agent marker |
| >= 0 | Back-reference or new object | Index into objectVector |

---

## Detailed Section Formats

### 3. Scriptorium

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SCRIPTORIUM                                  │
├─────────────────────────────────────────────────────────────────────┤
│ reserved: int32 (always 0)                                          │
├─────────────────────────────────────────────────────────────────────┤
│ scriptCount: int32                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ FOR each script (scriptCount times):                                │
│   └── MacroScript object (OBST/OBEN format)                         │
│       ├── family: int32                                             │
│       ├── genus: int32                                              │
│       ├── species: int32                                            │
│       ├── eventNumber: int32                                        │
│       ├── content: string                                           │
│       └── executionCount: int32                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Map Manager

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MAP MANAGER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ META ROOMS                                                    │   │
│  │ ├── count: int32                                              │   │
│  │ └── metaRooms[count]: MetaRoom object                         │   │
│  │     ├── id: int32                                             │   │
│  │     ├── x: int32                                              │   │
│  │     ├── y: int32                                              │   │
│  │     ├── width: int32                                          │   │
│  │     ├── height: int32                                         │   │
│  │     └── backgroundName: string                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ROOMS                                                         │   │
│  │ ├── count: int32                                              │   │
│  │ └── rooms[count]: Room object                                 │   │
│  │     ├── id: int32                                             │   │
│  │     ├── metaRoomId: int32                                     │   │
│  │     ├── left: int32                                           │   │
│  │     ├── top: int32                                            │   │
│  │     ├── right: int32                                          │   │
│  │     ├── bottom: int32                                         │   │
│  │     ├── type: int32                                           │   │
│  │     └── caValues[20]: float32                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ DOORS                                                         │   │
│  │ ├── count: int32                                              │   │
│  │ └── doors[count]: Door object                                 │   │
│  │     ├── room1Id: int32                                        │   │
│  │     ├── room2Id: int32                                        │   │
│  │     ├── permeability: int32                                   │   │
│  │     └── position: (x1, y1, x2, y2) 4 x int32                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ LINKS                                                         │   │
│  │ ├── count: int32                                              │   │
│  │ └── links[count]: Link object                                 │   │
│  │     ├── room1Id: int32                                        │   │
│  │     └── room2Id: int32                                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7. CAOSVar (Game Variable Value)

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CAOS VAR                                   │
├─────────────────────────────────────────────────────────────────────┤
│ type: int32                                                         │
│   0 = Integer                                                        │
│   1 = Float                                                          │
│   2 = String                                                         │
│   3 = Agent                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ value:                                                               │
│   ├── [type=0] intValue: int32                                      │
│   ├── [type=1] floatValue: float32                                  │
│   ├── [type=2] stringValue: string                                  │
│   └── [type=3] agentValue: AgentHandle (OBST/OBEN object)           │
├─────────────────────────────────────────────────────────────────────┤
│ becomeZero: int32 (bool flag)                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 9. SYSTEMTIME Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEMTIME (16 bytes)                        │
├─────────────────────────────────────────────────────────────────────┤
│ wDay: uint16                                                        │
│ wDayOfWeek: uint16                                                  │
│ wHour: uint16                                                       │
│ wMilliseconds: uint16                                               │
│ wMinute: uint16                                                     │
│ wMonth: uint16                                                      │
│ wSecond: uint16                                                     │
│ wYear: uint16                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 10. Message

```
┌─────────────────────────────────────────────────────────────────────┐
│                            MESSAGE                                   │
├─────────────────────────────────────────────────────────────────────┤
│ from: int32 (agent ID)                                              │
│ to: int32 (agent ID)                                                │
│ action: int32 (message type)                                        │
│ param1: int32                                                       │
│ param2: int32                                                       │
│ delay: uint32 (ticks until delivery)                                │
└─────────────────────────────────────────────────────────────────────┘
```

### 14. Creature History

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CREATURE HISTORY                               │
├─────────────────────────────────────────────────────────────────────┤
│ moniker: string                                                     │
│ name: string                                                        │
│ gender: int32                                                       │
│ genus: int32                                                        │
│ variant: int32                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ lifeEventCount: uint32                                              │
│ FOR each event (lifeEventCount times):                              │
│   └── LifeEvent:                                                    │
│       ├── eventType: int32                                          │
│       ├── worldTick: uint32                                         │
│       ├── ageInTicks: uint32                                        │
│       ├── realWorldTime: uint32 (Unix timestamp)                    │
│       ├── lifeStage: int32                                          │
│       ├── relatedMoniker1: string                                   │
│       ├── relatedMoniker2: string                                   │
│       ├── userText: string                                          │
│       ├── photo: string                                             │
│       ├── worldName: string                                         │
│       └── worldUniqueIdentifier: string                             │
├─────────────────────────────────────────────────────────────────────┤
│ crossoverMutationCount: int32                                       │
│ crossoverCrossCount: int32                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent Hierarchy

```
                           ┌─────────────┐
                           │   Agent     │
                           │  (Base)     │
                           └──────┬──────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
   │ SimpleAgent  │       │ CompoundAgent│       │   Vehicle    │
   │              │       │              │       │              │
   └──────┬───────┘       └──────┬───────┘       └──────────────┘
          │                      │
          ▼                      │ contains
   ┌──────────────┐              ▼
   │PointerAgent  │       ┌──────────────┐
   │              │       │ CompoundPart │
   └──────────────┘       └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │  UIPart  │ │EntityImage│ │UIButton │
             └──────────┘ └──────────┘ └──────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
             ┌───────────┐ ┌──────────┐ ┌────────────────────────┐
             │ClonedEntity│ │RemoteCamera│ │EntityImageWithEmbedded│
             │   Image   │ │          │ │       Camera           │
             └───────────┘ └──────────┘ └────────────────────────┘
```

### Agent Serialization Format

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AGENT DATA                                  │
├─────────────────────────────────────────────────────────────────────┤
│ reserved: int32 (version hack)                                      │
├─────────────────────────────────────────────────────────────────────┤
│ CORE IDENTITY                                                       │
│ ├── myID: int32                                                     │
│ ├── myUpdateTicks: int32                                            │
│ ├── classifier.family: int32                                        │
│ ├── classifier.genus: int32                                         │
│ ├── classifier.species: int32                                       │
│ └── eventNumber: int32                                              │
├─────────────────────────────────────────────────────────────────────┤
│ ATTRIBUTES                                                          │
│ ├── myAttributes: int32 (bitmask)                                   │
│ └── myCreaturePermissions: int32                                    │
├─────────────────────────────────────────────────────────────────────┤
│ STATE                                                               │
│ ├── myMovementStatus: int32                                         │
│ ├── myGarbaged: bool                                                │
│ ├── myRunning: bool                                                 │
│ ├── myInputMask: int32                                              │
│ ├── myTimer: int32                                                  │
│ ├── myTimerRate: int32                                              │
│ └── myClickAction: int32                                            │
├─────────────────────────────────────────────────────────────────────┤
│ ENTITY IMAGE                                                        │
│ └── [See EntityImage format below]                                  │
├─────────────────────────────────────────────────────────────────────┤
│ AGENT HANDLES                                                       │
│ ├── myCarriedAgent: AgentHandle (OBST/OBEN)                         │
│ └── myCarrierAgent: AgentHandle (OBST/OBEN)                         │
├─────────────────────────────────────────────────────────────────────┤
│ POSITION                                                            │
│ ├── myGeneralRange: float32                                         │
│ ├── myInvalidPosition: bool                                         │
│ ├── myHighlightColour: (r, g, b) 3 x int32                          │
│ ├── myEmitCaIndex: int32                                            │
│ ├── myEmitCaValue: float32                                          │
│ ├── myNormalPlane: int32                                            │
│ └── positionVector: (x, y) 2 x float32                              │
├─────────────────────────────────────────────────────────────────────┤
│ PHYSICS                                                             │
│ ├── myVelocity: (x, y) 2 x float32                                  │
│ ├── myAcceleration: float32                                         │
│ ├── myAeroDynamicFactor: float32                                    │
│ ├── myGravitationalAccel: float32                                   │
│ ├── myFriction: float32                                             │
│ └── myElasticity: float32                                           │
├─────────────────────────────────────────────────────────────────────┤
│ CAOS MACHINE                                                        │
│ └── virtualMachine: CAOSMachine (OBST/OBEN)                         │
├─────────────────────────────────────────────────────────────────────┤
│ PORTS (Input/Output)                                                │
│ └── myPorts: PortBundle object                                      │
├─────────────────────────────────────────────────────────────────────┤
│ VARIABLES                                                           │
│ ├── count: int32 (100)                                              │
│ └── myGlobalVariables[100]: CAOSVar                                 │
├─────────────────────────────────────────────────────────────────────┤
│ GENOME STORE                                                        │
│ └── genomeStore: GenomeStore                                        │
├─────────────────────────────────────────────────────────────────────┤
│ MISC                                                                │
│ ├── myAgentType: int32                                              │
│ ├── myVoice: Voice                                                  │
│ ├── myImpendingDoom: bool                                           │
│ ├── myCurrentWidth: float32                                         │
│ ├── myCurrentHeight: float32                                        │
│ ├── myResetLines: bool                                              │
│ ├── myDrawMirroredFlag: bool                                        │
│ ├── mySoundName: int32                                              │
│ ├── mySoundLooping: bool                                            │
│ ├── myWidthTemp: float32                                            │
│ ├── myHeightTemp: float32                                           │
│ └── reserved: int32                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### EntityImage Format

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ENTITY IMAGE                                  │
├─────────────────────────────────────────────────────────────────────┤
│ myPlane: int32                                                      │
│ myWorldPosition: (x, y) 2 x int32                                   │
│ mySpriteIsCameraShy: bool                                           │
│ myGalleryName: string                                               │
├─────────────────────────────────────────────────────────────────────┤
│ ANIMATION                                                           │
│ └── animationString[100]: uint32 (frame indices)                    │
├─────────────────────────────────────────────────────────────────────┤
│ myAbsoluteBaseImage: int32                                          │
│ myCurrentImageIndex: int32                                          │
│ myCurrentBaseImageIndex: int32                                      │
│ myNumberOfImages: int32                                             │
│ mySavedImageIndexState: int32                                       │
│ myFrameRate: uint8                                                  │
│ myAnimationLength: int32                                            │
│ myCurrentFrameIndex: int32                                          │
│ myOverrideBaseIndex: int32                                          │
│ myAnimationState: uint8                                             │
│ myAnimationCount: int32                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Creature-Specific Data

Creatures extend SimpleAgent and add extensive biological simulation data:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CREATURE DATA                                │
│                   (extends SimpleAgent)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ SKELETON                                                      │   │
│  │ ├── Body                                                      │   │
│  │ │   ├── BodyParts[] (head, body, limbs)                      │   │
│  │ │   └── BodyPartOverlays[]                                   │   │
│  │ └── Limbs[]                                                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ BRAIN                                                         │   │
│  │ ├── lobeCount: int32                                          │   │
│  │ ├── lobes[]: Lobe                                             │   │
│  │ │   ├── neurons[]                                             │   │
│  │ │   └── dendrites[]                                           │   │
│  │ ├── tractCount: int32                                         │   │
│  │ ├── tracts[]: Tract                                           │   │
│  │ ├── instinctCount: int32                                      │   │
│  │ └── instincts[]: Instinct                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ BIOCHEMISTRY                                                  │   │
│  │ ├── chemicalDecayRates[256]: float32                          │   │
│  │ ├── chemicalConcs[256]: float32                               │   │
│  │ ├── neuroEmitterCount: int32                                  │   │
│  │ ├── neuroEmitters[]: NeuroEmitter                             │   │
│  │ ├── organCount: int32                                         │   │
│  │ └── organs[]: Organ                                           │   │
│  │     ├── reactions[]                                           │   │
│  │     ├── receptors[]                                           │   │
│  │     └── emitters[]                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ FACULTIES                                                     │   │
│  │ ├── SensoryFaculty                                            │   │
│  │ │   └── myKnownAgents[]: AgentHandle                          │   │
│  │ ├── MotorFaculty                                              │   │
│  │ │   └── myInvoluntaryActions[]                                │   │
│  │ ├── LinguisticFaculty                                         │   │
│  │ │   └── vocabulary                                            │   │
│  │ ├── ReproductiveFaculty                                       │   │
│  │ ├── ExpressiveFaculty                                         │   │
│  │ ├── MusicFaculty                                              │   │
│  │ └── LifeFaculty                                               │   │
│  │     ├── mySex: int32                                          │   │
│  │     ├── myAge: int32                                          │   │
│  │     ├── myVariant: int32                                      │   │
│  │     └── myAgeingLoci[7]: float32                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Complete File Layout Sequence Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CREATURES 3 WORLD FILE (.sfc)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    FILE HEADER (82 bytes + 5)                        │   │
│  │  "Creatures Evolution Engine - Archived information file..."         │   │
│  │  + 0x1A + 0x04 + Version(12)                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                        ┌───────────┴───────────┐                           │
│                        │   ZLIB DECOMPRESS     │                           │
│                        └───────────┬───────────┘                           │
│                                    │                                        │
│                                    ▼                                        │
│  ╔═════════════════════════════════════════════════════════════════════╗   │
│  ║                    DECOMPRESSED WORLD DATA                           ║   │
│  ╠═════════════════════════════════════════════════════════════════════╣   │
│  ║                                                                      ║   │
│  ║  OFFSET   SECTION                                                    ║   │
│  ║  ───────────────────────────────────────────────                     ║   │
│  ║  0        Password (string)                                          ║   │
│  ║  +n       Music Event (int32)                                        ║   │
│  ║  +4       Scriptorium (reserved + count + objects)                   ║   │
│  ║  +n       Map Manager (metarooms + rooms + doors + links)            ║   │
│  ║  +n       Time Variables (6 x uint32 = 24 bytes)                     ║   │
│  ║  +24      Agent Handles (3 x OBST/OBEN objects)                      ║   │
│  ║  +n       Game Variables (count + key-value pairs)                   ║   │
│  ║  +n       Bootstrap Folders (count + strings)                        ║   │
│  ║  +n       System Time (2 x SYSTEMTIME = 32 bytes)                    ║   │
│  ║  +32      Message Queue (count + messages)                           ║   │
│  ║  +n       Pixel Format (int32)                                       ║   │
│  ║  +4       File Lists (4 lists)                                       ║   │
│  ║  +n       Unique Identifier (string)                                 ║   │
│  ║  +n       History Store (count + entries)                            ║   │
│  ║  +n       Agent Manager (agents + metadata)                          ║   │
│  ║  +n       Main View (16 bytes: x,y,zoom,metaRoomId)                  ║   │
│  ║  +16      Tints (count + tint data)                                  ║   │
│  ║  +n       [EOF]                                                      ║   │
│  ║                                                                      ║   │
│  ╚═════════════════════════════════════════════════════════════════════╝   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Object Reference Resolution

The archive maintains two vectors for object identity:

1. **objectVector[]** - Maps objectId (int32) to the actual object instance
2. **classVector[]** - Maps classId (int32) to the class name string

### Resolution Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                     OBJECT REFERENCE FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  WRITING:                                                            │
│  ┌───────────────┐                                                   │
│  │ Object to     │──►  Check objectMap.has(object)?                  │
│  │   write       │          │                                        │
│  └───────────────┘          │                                        │
│                       ┌─────┴─────┐                                  │
│                       │           │                                  │
│                       ▼           ▼                                  │
│                 [YES: Exists]  [NO: New]                             │
│                       │           │                                  │
│                       ▼           ▼                                  │
│            Write back-ref   Write new object                         │
│            (objectId only)  (id + classId + className + OBST...OBEN) │
│                       │           │                                  │
│                       │           └──► Add to objectMap              │
│                       │                                              │
│                       └──────────►┘                                  │
│                                                                      │
│  READING:                                                            │
│  ┌───────────────┐                                                   │
│  │ Read objectId │──►  Check objectId value                          │
│  │   (int32)     │          │                                        │
│  └───────────────┘          │                                        │
│                    ┌────────┼────────┐                               │
│                    │        │        │                               │
│                    ▼        ▼        ▼                               │
│               [id = -2]  [id < len] [id >= len]                      │
│                    │        │        │                               │
│                    ▼        ▼        ▼                               │
│              return null  Back-ref  New object                       │
│                       objectVector[id]  Create & read                │
│                             │        │                               │
│                             │        └──► Add to objectVector        │
│                             │                                        │
│                             └──────────►┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Example: Typical World File Statistics

A typical Creatures 3 world file contains:

| Component | Typical Count |
|-----------|---------------|
| Compressed Size | ~1 MB |
| Decompressed Size | ~8-9 MB |
| Scripts | 1,200+ |
| MetaRooms | 4-8 |
| Rooms | 200-400 |
| Agents | 1,000+ |
| Creatures | 1-10 |
| Game Variables | 50-100 |

---

## Version History

- **Version 12**: Current format used by Creatures 3 and Docking Station
- Header includes compression library version info
- Full support for all agent types and creature biology

---

## Implementation Notes

### Endianness
All multi-byte values are stored in **little-endian** byte order.

### String Encoding
Strings are stored as length-prefixed with ASCII/Latin-1 encoding:
```
length: int32 (4 bytes)
chars: byte[length]
```

### Floating Point
IEEE 754 format is used for all floating-point values.

### Compression
zlib deflate compression is applied to the entire data stream after the header.

---

## Related Files

- `CreaturesArchive.js` - Binary read/write framework
- `World.js` - World serialization
- `AgentManager.js` - Agent collection management
- `Agent.js` - Base agent serialization
- `Scriptorium.js` - Script storage
- `MapManager.js` - Map data serialization

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Based on: analysis of the original Creatures 3 engine*
