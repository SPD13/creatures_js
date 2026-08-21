# Rooms — Construction, Geometry, and System Integration

A **room** is the fundamental spatial unit of the Creatures 3 world. Every metaroom is built out of rooms; every door connects exactly one or two rooms; every CA value lives in a room; every agent lives in (or floats above) a room; and almost every navigation, perception, and physics decision the engine makes ultimately bottoms out at "which room is this?".

This article is a deep-dive on the room object itself — how it gets built, what fields it carries, how it connects to its neighbours, and how those connections feed both the map system (creature navigation, doors, links) and the cellular-automata system (proteins, smells, home markers, environmental conditions).

For the broader hierarchical context of metarooms, see [World Map System](#/article/world-map-system). For the rules governing CA values themselves, see [Cellular Automata System](#/article/cellular-automata).

---

## What a Room Is

In the JS rebuild a room is a single instance of `engine/world/Room.js::Room`. Its identity is just a numeric `id`; everything else is data attached to that id. Rooms live in `MapManager.rooms` (a `Map<id, Room>`) and additionally belong to exactly one parent metaroom via `room.metaRoomId`.

Conceptually, a room is **four edges and a slab of CA**:

```
                  startCeiling.y      endCeiling.y
                       │                    │
                       ▼                    ▼
        startCeiling ●─────── ceiling ──────● endCeiling
                    │                       │
                    │                       │
                    │  caValues[0..19]      │     ← per-room
                    │  caInput              │       CA state
                    │  caTotalDoorage       │
                    │  agents (Set)         │
                    │  doorCollection       │
                    │  linkCollection       │
                    │                       │
        startFloor  ●───────  floor   ──────● endFloor
                       ▲                    ▲
                       │                    │
                  startFloor.y         endFloor.y
```

A room is *not* a fixed-size grid cell. The constructor seeds defaults from a 144×150 grid bucket (`Room.js:89-94`) but those values are overwritten almost immediately by `setBoundaries` or `setComplexShape` once the actual coordinates from the `ADDR` CAOS command are known. The grid coordinates linger as `room.gridX` / `room.gridY` and are used for spatial bucketing, not for geometry.

---

## Construction Lifecycle

Rooms are created exclusively through `MapManager.addRoom(metaRoomId, left, right, topLeft, topRight, bottomLeft, bottomRight)` (`MapManager.js:213-282`). This is the JS equivalent of the original engine's room-creation routine and is invoked by the `ADDR` CAOS command, which in turn is invoked from bootstrap scripts like `!map.cos`.

The full sequence of an `addRoom` call is:

1. **Bounds check.** `MAX_ROOMS = 2000` is enforced (`MapManager.js:214-216`). The metaroom must already exist (`:218-221`).

2. **`Room` construction.** A new `Room` object is allocated with sequential id `this.rooms.size`. The constructor populates default `Vector2D` boundaries from the grid bucket and zero-fills 20 CA values (`Room.js:78-178`).

3. **Geometry application.** If the room is rectangular (all four corner Y values are equal) `setBoundaries(left, right, top, bottom)` is called; otherwise — for sloped floors or ceilings — `setComplexShape(left, right, topLeft, topRight, bottomLeft, bottomRight)` is called instead (`MapManager.js:234-243`). Both methods rebuild the four `Vector2D` corner points (`startFloor`, `endFloor`, `startCeiling`, `endCeiling`) and recompute `perimeterLength`. See [Room Geometry](#room-geometry).

4. **Activation.** `room.activate()` and `room.isLoaded = true` mark the room ready for simulation (`MapManager.js:245-246`).

5. **Storage.** The room is inserted into `this.rooms` and registered with its parent metaroom (`MapManager.js:248-253`).

6. **Display registration.** `renderNewRoomToPlanes(roomId)` adds the room to the rendering planes if a `DisplayManager` is attached (`MapManager.js:256-258`).

7. **Door creation.** `createDoorsForRoom(room)` (`MapManager.js:267, 1407-1424`) walks the four edges of the new room and finds overlaps with existing sibling rooms in the same metaroom. For each overlap it either creates a brand-new shared `Door` or mutates an existing sibling's external door into a shared one. This is where the door segmentation pipeline runs — see [Door Segmentation](#door-segmentation).

8. **Navigable-door computation for the new room.** `calculateNeighbourInformationForRoom(room)` (`MapManager.js:271, 813-861`) walks `room.doorCollection` and promotes at most one door to `room.leftNavigableDoor` and at most one to `room.rightNavigableDoor`. See [Navigable Door Promotion](#navigable-door-promotion).

9. **Refresh of affected siblings.** `refreshNavigableInfoForNeighbours(room)` (`MapManager.js:280, 292-312`) iterates the new room's horizontal shared doors and re-runs the promotion pass on every sibling whose door was just upgraded from external (`parentCount=1`) to shared (`parentCount=2`). Without this step a sibling's `leftNavigableDoor` / `rightNavigableDoor` would still reflect its pre-merge state and would never see the new connection. Mirrors the explicit left/right neighbour refresh loops in the original engine.

The complete call chain for steps 7–9:

```
MapManager.addRoom
 ├─ createDoorsForRoom(newRoom)
 │   ├─ addRoomEdge(newRoom, DIRECTION_LEFT)
 │   ├─ addRoomEdge(newRoom, DIRECTION_RIGHT)
 │   ├─ addRoomEdge(newRoom, DIRECTION_UP)
 │   └─ addRoomEdge(newRoom, DIRECTION_DOWN)
 │        └─ for each sibling door overlapping this edge:
 │            ├─ getOverlapInformation → 1–3 segments
 │            └─ for each segment:
 │                ├─ if i==0: mutate existing door in place
 │                └─ else:    recreateDoorForSegment (new Door)
 ├─ calculateNeighbourInformationForRoom(newRoom)
 └─ refreshNavigableInfoForNeighbours(newRoom)
      └─ for each sibling sharing a horizontal door:
           └─ calculateNeighbourInformationForRoom(sibling)
```

> **Order matters.** Rooms can be added in any geometric order (right-of, left-of, top-of, etc.), and the segmentation pipeline must produce identical world topology regardless. The previous JS implementation didn't always honour that — see [Parent Ordering Convention](#parent-ordering-convention) for the convention that makes order-independence work.

---

## Room Geometry

A room's footprint is described by **four `Vector2D` corner points** plus their deltas. Both rectangular and sloped rooms use the same four-point representation; rectangular rooms simply have horizontal `startFloor → endFloor` and `startCeiling → endCeiling` lines.

### Vector fields

```js
room.startFloor    // Vector2D — bottom-left corner of the floor
room.endFloor      // Vector2D — bottom-right corner of the floor
room.deltaFloor    // endFloor - startFloor (cached)

room.startCeiling  // Vector2D — top-left corner of the ceiling
room.endCeiling    // Vector2D — top-right corner of the ceiling
room.deltaCeiling  // endCeiling - startCeiling (cached)

room.positionMin   // Vector2D — axis-aligned bounding box min
room.positionMax   // Vector2D — axis-aligned bounding box max
room.centre        // Vector2D — midpoint of the AABB
```

The legacy scalar accessors `room.left`, `room.right`, `room.top`, `room.bottom`, `room.topLeft`, `room.topRight`, `room.bottomLeft`, `room.bottomRight` (`Room.js:113-122`, `:254-265`, `:303-314`) are kept in sync for backward compatibility but should be considered derived state — write through `setBoundaries` / `setComplexShape`, not by hand.

### Rectangular vs sloped rooms

- **Rectangular** — all four corner Y values are equal pairs (`topLeft == topRight`, `bottomLeft == bottomRight`). Created by `setBoundaries(left, right, top, bottom)` (`Room.js:237-271`). The floor and ceiling lines are exactly horizontal.
- **Sloped** — at least one of `topLeft != topRight` or `bottomLeft != bottomRight`. Created by `setComplexShape(left, right, topLeft, topRight, bottomLeft, bottomRight)` (`Room.js:282-320`). The floor and/or ceiling line carries a slope; the AABB is computed from the min/max of all four corner Y values.

`addRoom` picks the right method automatically based on whether `topLeft != topRight || bottomLeft != bottomRight` (`MapManager.js:235-243`).

### Perimeter length

Used as the denominator in the door doorage formula (see [Permeability](#permeability)):

```
perimeterLength = |deltaFloor| + |deltaCeiling|
                + (startFloor.y - startCeiling.y)
                + (endFloor.y - endCeiling.y)
```

Computed by `calculatePerimeterLength()` (`Room.js:185-190`) and re-run automatically inside `setBoundaries` / `setComplexShape`. Mirrors the original engine's perimeter computation.

For a rectangular 100×50 room this collapses to `100 + 100 + 50 + 50 = 300`. Sloped rooms contribute the actual slanted lengths via `Vector2D.length()`.

---

## Room Types

Every room has a `roomType` (and equivalent alias `type`) in the range `0..15` (`ROOM_TYPE_COUNT = 16` in `CASystem.js:47`). Types are assigned via the `RTYP` CAOS command, almost always immediately after the corresponding `ADDR`:

```caos
setv va00 addr 0 1003 1159 593 669 816 816   * create room, capture id in va00
rtyp va00 3                                  * mark it as room type 3
```

Room type is not geometry — it's a **selector into the CA rates table**. `CASystem.myCARates[roomType][caProperty]` returns a `CARates(gain, loss, diffusion)` triple (`CASystem.js:268-275`), and that triple is what governs how each CA evolves in this room. Different room types (e.g. "outdoor jungle floor" vs "norn home" vs "vehicle interior") get different rate profiles loaded by `RATE` commands during bootstrap, so the same CA index can behave very differently depending on which physical region of the world you're in.

Two room types in the standard `!map.cos` rate table are particularly notable for navigable CAs:

- **Types 11–15** have `gain = 0, diffusion = 0` for CA15 (Norn Home) and friends — they're CA-opaque dead zones. Vehicle interiors and sealed regions live here.
- **Types 5–7** have `gain = 0.40` (vs `0.99` for normal indoor types). They still propagate but with reduced source strength.

A complete CA15 rate table is included in the [Cellular Automata System](#/article/cellular-automata) article.

---

## Door Collections

A room's connections to the rest of the world are stored in **five collections**, of which only three are routinely used by the map and CA systems:

```js
room.doorCollection      // ALL doors touching this room (any direction, any state)
room.linkCollection      // Manual room-to-room links (LINK CAOS command)
room.leftNavigableDoor   // Single-door pointer — see "Navigable Door Promotion"
room.rightNavigableDoor  // Single-door pointer — see "Navigable Door Promotion"

room.floorCollection     // Filtered view of doorCollection (floor doors only)
room.ceilingCollection   // Filtered view (ceiling doors only)
room.leftCollection      // Filtered view (left wall doors only)
room.rightCollection     // Filtered view (right wall doors only)
```

`doorCollection` is the source of truth. `leftNavigableDoor` and `rightNavigableDoor` are *promoted* references — they always point at members of `doorCollection`, never at independent objects. The four directional sub-collections (`floor/ceiling/left/right`) are convenience filters maintained by `MapManager.calculateDoorCollections` and friends.

### Door anatomy

A `Door` (`engine/world/Door.js`) carries the following state:

```js
{
    id:           number,            // monotonically allocated
    doorType:     0 | 1,              // 0 = DOOR_LEFT_RIGHT (horizontal),
                                      // 1 = DOOR_CEILING_FLOOR (vertical)
    permeability: 0..100,             // 0 = sealed, 100 = wide open
    parentCount:  1 | 2,              // 1 = external edge, 2 = shared
    parent1:      roomId | -1,        // by convention, the LEFT/TOP room
    parent2:      roomId | -1,        // by convention, the RIGHT/BOTTOM room
    start:        Vector2D,           // door endpoint A in world space
    end:          Vector2D,           // door endpoint B in world space
    delta:        Vector2D,           // end - start (cached)
    length:       number,             // |delta|
    doorage1:     number,             // CA flow rate as seen from room A
    doorage2:     number,             // CA flow rate as seen from room B
}
```

Two of these fields are subtle and worth their own sections: `doorType` (which decides whether the door can ever become navigable) and `parent1`/`parent2` (which encode a *geometric ordering convention* the rest of the engine depends on).

### `doorType`

`DOOR_LEFT_RIGHT = 0` is for **horizontal walking doors** — the primary mechanism by which a creature walks from one room to another along the floor chain. `DOOR_CEILING_FLOOR = 1` is for **vertical doors** — ceiling doors, floor doors, hatches, ladder mouths, etc. Only `DOOR_LEFT_RIGHT` doors are eligible for promotion to `leftNavigableDoor` / `rightNavigableDoor`. Vertical doors live in `doorCollection` and participate in non-navigable CA diffusion, but they never carry navigable CAs and they never become navigable for creature pathing.

### Parent ordering convention

The engine — both the original and the JS rebuild — enforces this rule for every shared door (`parentCount === 2`):

> **`parent1` is the geometrically LEFT room** (for horizontal doors) **or TOP room** (for vertical doors). **`parent2` is the geometrically RIGHT or BOTTOM room.**

This is not a soft suggestion. Multiple downstream systems read `parent1` to mean "the room on this door's left/top side":

- `CalculateNeighbourInformationForRoom` checks `room.endFloor == otherRoom.startFloor` only when the current room is `parent1`, and `room.startFloor == otherRoom.endFloor` only when the current room is `parent2`. If parents are in the wrong order, neither branch matches and the door silently fails promotion.
- `CASystem._alterCAEmissionRecursive` literally treats `leftDoor.parent1` as "the room to the left" when iterating navigable CA propagation along the room chain.
- The pathfinding/floor-chain code at `Room.leftFloorRoomID` / `rightFloorRoomID` is computed from the same parent-order assumption.

The JS door-creation pipeline enforces the convention through a dedicated helper `MapManager._orderParentsForSharedDoor(thisRoomId, otherRoomId, edgeType)` (`MapManager.js:~2288`):

```js
if (edgeType === DIRECTION_LEFT || edgeType === DIRECTION_UP) {
    return [otherRoomId, thisRoomId];  // other is to the left/top → other is parent1
}
return [thisRoomId, otherRoomId];      // this is to the left/top → this is parent1
```

It's invoked from the two real shared-door creation sites: `createSharedDoorSegment` and `getOverlapInformation`'s overlap-segment construction. Mirrors the original engine's room-edge routine, which has the same branching inline.

A door created without honouring this convention will look perfectly fine in the door inspector — same parents, same coordinates, same permeability — but will be invisible to navigable CA propagation and to floor-chain navigation. This was a long-lived bug in the JS rebuild before being fixed; see [Common Pitfalls](#common-pitfalls-and-debugging).

---

## Door Segmentation

When a new room is added to a metaroom that already contains rooms, its edges may *partially* overlap existing rooms' external doors. The engine handles this with a one-pass segmentation algorithm in `addRoomEdge` + `getOverlapInformation` (`MapManager.js:1433-1543`, `:2788-2952`). This is the JS equivalent of the original engine's room-edge routine.

For each sibling door that overlaps the new room's edge, `getOverlapInformation` produces 1, 2, or 3 segments:

```
Existing door:     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New room's edge:           ▓▓▓▓▓▓▓▓▓▓▓▓
                  ↓
Segment 1 (before): ━━━━━━━                       (unshared, original parents)
Segment 2 (overlap):        ▓▓▓▓▓▓▓▓▓▓▓▓          (SHARED, parent1=left, parent2=right)
Segment 3 (after):                       ━━━━━━━  (unshared, original parents)
```

The first segment **mutates the existing door object in place** (`addRoomEdge:1492-1526`). Subsequent segments call `recreateDoorForSegment` (`MapManager.js:3006-3097`) to allocate brand-new doors. After the loop, `fillEdgeGaps` (`:1553-1588`) creates unshared external doors for any portion of the new room's edge that wasn't covered by any sibling.

The shared overlap segment is the one that needs the parent-ordering convention applied. Before applying parents, the segment is built like this:

```js
// MapManager.js getOverlapInformation, segment2Parents
const segment2Parents = otherRoomId !== -1
    ? this._orderParentsForSharedDoor(newRoom.id, otherRoomId, direction)
    : [newRoom.id];
```

`direction` here is the edge of the *new* room being processed (not the sibling). The helper resolves which of the two ids should be `parent1` based on whether the new room is on the left/top side or the right/bottom side of the resulting door.

### Segments 1 and 3 inherit parent ordering

Segments 1 and 3 (the non-overlapping leftover bits of the existing door) preserve `existingDoor.parent1` / `parent2`. As long as the existing door was created via the fixed shared-door path or as an external door (which is a different convention; see below), the leftover segments inherit a coherent ordering automatically.

### Unshared (external) doors

Unshared doors (`parentCount === 1`) sit in exactly one room. They are created by `createUnsharedDoorSegment` (`MapManager.js:2373-2432`) or `fillEdgeGaps` and use the JS-internal convention `parent1 = room.id, parent2 = -1` for all directions — *not* the geometric convention used for shared doors. This divergence from the original engine is intentional and harmless: external doors have `parentCount=1`, which fails the very first filter in `CalculateNeighbourInformationForRoom`, so they never get inspected for navigability and their parent slots are never read by anything that cares about the convention.

If an unshared door is later upgraded into a shared door via `getOverlapInformation`, the segmentation code overwrites `parent1` and `parent2` with the correctly-ordered helper output — so the internal convention for unshared doors never leaks into a shared door.

---

## Permeability

Every door has an integer `permeability` in `[0, 100]`, set initially by door creation (shared doors default to `PERMIABLE = 100`, unshared/external doors default to `0`) and modifiable at runtime by the `DOOR` CAOS command:

```caos
door 5 6 50    * set the door between rooms 5 and 6 to half-open
door 5 6       * read it back
```

Permeability has **two completely different effective formulas**, one for each CA update path. See [Cellular Automata System](#/article/cellular-automata) for the full picture; the room-side summary is:

### Non-navigable doorage (cached)

For non-navigable CAs (sound, light, heat, water, …) the per-tick equilibrium pipeline uses a **squared, length-weighted, perimeter-normalised** doorage value, computed once per door by `preCalculateAllDoorages` (`CASystem.js:453-498`) and stored on the door as `doorage1` (as seen from room A) and `doorage2` (as seen from room B):

```
normPerm   = permeability / 100
doorage    = length × normPerm²
doorage_A  = doorage / room_A.perimeterLength
doorage_B  = doorage / room_B.perimeterLength
```

This is also where `room.caTotalDoorage` comes from — the sum over all doors and links touching the room of *that side's* doorage, clamped to 1 (`updateRoomTotalDoorageOptimized`, `:506+`). `caTotalDoorage` enters the per-tick update at `CASystem.js:368-371`:

```js
room.caValues[currentProperty] += room.caTempValue * (1 - room.caTotalDoorage);
```

i.e. a room with leaky walls keeps less of its own equilibrium temp value because more of it leaked out through doors during phase 2. The squared `normPerm` term means a door at permeability 50 transmits only 25% as much non-navigable CA as one at permeability 100.

### Navigable per-hop attenuation

For navigable CAs (proteins, smells, home markers, …) the recursive walk in `_alterCAEmissionRecursive` uses a **raw, per-hop** factor:

```
hopFactor = (perm / 100) × diffusion(prevRoom) × diffusion(nextRoom)
```

Length and perimeter don't enter at all. There's no squaring. A single hop through a door at permeability 50 with diffusion 0.9 on both sides gives `0.5 × 0.9 × 0.9 = 0.405` of the source's contribution at that hop.

### Practical consequences for room authoring

- A non-navigable CA care about how *long* the door is and how big the receiving room is. Big rooms with small doors retain more of their own CA.
- A navigable CA only cares about permeability and the two diffusion rates, and it travels recursively up to `CA_DISTANCE = 30` hops in a single propagation pass.
- Setting `door perm 0` cuts both CA paths instantly.
- Setting `door perm 100` is the maximum; there is no "more open than wide open".

---

## Navigable Door Promotion

This is the most easily misunderstood aspect of the room system, and it's the source of most "my CA value is mysteriously zero in the next room" bugs.

A door becomes a **navigable door** for a particular room only if `MapManager.calculateNeighbourInformationForRoom(room)` decides to promote it. The function walks `room.doorCollection` and applies three filters to each door:

1. **`door.parentCount === 2`** — external (`parentCount=1`) doors are never navigable.
2. **`door.doorType === 0`** (`DOOR_LEFT_RIGHT`) — vertical doors and hatches are never navigable.
3. **Floor-edge alignment.** The room's floor endpoint must coincide with the neighbour's floor endpoint within 2.0 units in both x and y:
   - `rightNavigableDoor` is set when `|room.endFloor − otherRoom.startFloor| < 2` in both axes (and `room === parent1`).
   - `leftNavigableDoor` is set when `|room.startFloor − otherRoom.endFloor| < 2` in both axes (and `room === parent2`).

> The 2.0-unit tolerance is a JS-side relaxation of the original engine's exact `Vector2D` equality. Anything the original engine considers floor-aligned, JS also accepts.

The check **depends on the parent-ordering convention** described earlier: it asks "if I'm parent1, does my right floor corner touch the other room's left floor corner?" — which is only a meaningful question when `parent1` is actually the left room. Get the parent ordering wrong and both branches fail the geometry test no matter how perfectly the rooms are aligned.

### What "navigable" means downstream

A door pointed at by `leftNavigableDoor` / `rightNavigableDoor` is the only door type that:

- Carries **navigable CA propagation** (proteins, smells, home markers) via `CASystem._alterCAEmissionRecursive`. Doors that live only in `doorCollection` are completely ignored by navigable CAs even at permeability 100.
- Defines the **horizontal floor chain** that creatures walk along when traversing a metaroom. The Room fields `leftFloorRoomID` / `rightFloorRoomID` are derived from the same scan.

If you want a navigable CA to flow across a connection that *isn't* a horizontal floor-aligned door — a vertical hatch between two metarooms, a teleporter, a vehicle dock, anything where the floor endpoints don't touch — the answer is to add a `LINK`, not to fight the navigable-door promotion. Links live in `room.linkCollection`, are walked unconditionally by phase A of `_alterCAEmissionRecursive`, and don't care about floor geometry — they only care about their own permeability and the two rooms' diffusion rates.

### Refresh after `addRoom`

`calculateNeighbourInformationForRoom` is called on the newly-added room from inside `addRoom`. But that's not enough on its own: when a new room overlaps an existing room's external door, the existing door is **mutated in place** to become a shared door, and *the existing room's* navigable pointers were computed back when its door was still external (and was rejected by filter #1). Without an explicit refresh, the existing room would never re-see the upgraded connection.

`refreshNavigableInfoForNeighbours(room)` (`MapManager.js:292-312`) closes this loop. After `addRoom` finishes building the new room, it walks the new room's horizontal shared doors, dedupes the other-room ids, and re-runs `calculateNeighbourInformationForRoom` on each affected sibling. Mirrors the explicit left/right neighbour refresh loops in the original engine.

There's also a **fallback recompute** in the deserialisation path (`MapManager.js:~7262`):

```js
if ((!room.leftNavigableDoor || !room.rightNavigableDoor) && room.doorCollection?.length > 0) {
    this.calculateNeighbourInformationForRoom(room);
}
```

It fires when restoring a room from a saved world if either pointer is missing, repairing half-restored states. (An older form of this guard tested `&&` instead of `||`, which silently skipped recompute on rooms with one resolved pointer and one missing one — a latent bug that's been corrected.)

---

## Cellular Automata Storage on the Room

Every room carries its own slab of CA state, all of it allocated in the constructor (`Room.js:163-176, 214-228`):

```js
room.caValues       // Array(20) — current frame
room.caOldValues    // Array(20) — previous frame      (history for non-navigable smoothing)
room.caOlderValues  // Array(20) — two frames ago
room.caTempValue    // scalar — phase-2 buffer for the current CA index
room.caInput        // scalar — accumulated agent input for the current CA index
room.caTotalDoorage // scalar — sum of own-side doorage across doors and links, clamped to 1
```

`caValues[i]` is the public observable for CA index `i` and is what every reader (`PROP`, `SensoryFaculty.updateSmellLobe`, the room debugger, etc.) consults. Everything else is internal scratch state for the CA update pipeline.

Two important invariants:

- **`caValues[i]` is never decayed for navigable indices.** For navigable CAs the value is a persistent accumulating sum maintained by `alterCAEmission`. There is no per-tick equilibrium loop touching it. Removing or killing every emitter for a navigable index leaves all reachable rooms at whatever delta the emitters last pushed in, until something else mutates it.
- **`caValues[i]` is recomputed every tick for non-navigable indices** by the round-robin equilibrium loop. Specifically, each call to `CASystem.updateCurrentCAProperty` selects one CA index, runs `UpdateRoomCA` to derive a new `caTempValue` from `(caInput, gain, loss, prev caValues[i])`, sets `caValues[i] = 0`, then phase 2 redistributes between rooms via `UpdateDoorCA`, and phase 3 finally adds back `caTempValue * (1 - caTotalDoorage)`.

The full algorithm — and the navigable / non-navigable split — is documented in [Cellular Automata System](#/article/cellular-automata).

### Where agent emissions land

Emissions enter rooms from two `Agent.handleCA` paths (`Agent.js:3551-3625`):

- **Non-navigable** emissions call `caSystem.increaseCAInput(roomId, amount)` (`CASystem.js:989-1003`) which adds to the room's `caInput` *only on the CA's turn in the round-robin*. Off-cycle ticks do nothing.
- **Navigable** emissions call `caSystem.alterCAEmission(roomId, caIndex, amount)` (`CASystem.js:105-117`) which propagates a delta through the link/navigable-door network from the source room out to a maximum of 30 hops. Each room visited gets its `caValues[caIndex]` incremented by the attenuated delta. The agent re-runs this only when it changes room (one negative call from the old room, one positive call from the new one).

Either way, the room is the deposit target. Nothing in the CA system writes to a "world" or a "metaroom" — everything is per-room.

---

## Connection With the Map System

Beyond CA storage, a room is the unit of:

### Agent containment

`room.agents` is a `Set<agentId>` of every agent currently inside the room (`Room.js:140`). Agents are assigned by `World`/`MapManager` during their physics update based on which room contains the agent's position. Most engine queries that need "what's in this room" go through this set.

### Neighbour tracking

Two parallel structures track room-to-room adjacency:

```js
room.neighbourRoomIds            // Set<roomId>  — flat set of all neighbours
room.neighboursByDirection       // { 0..3: Set<roomId> } — bucketed by direction
```

Direction constants for the buckets are `0=UP/CEILING, 1=DOWN/FLOOR, 2=LEFT, 3=RIGHT` (`Room.js:151-156`). Doors maintain these via `room.addNeighbor(otherId, direction)` whenever a shared door is created or mutated.

Note that the navigable system (`leftFloorRoomID` / `rightFloorRoomID`, `leftNavigableDoor` / `rightNavigableDoor`) is **separate** from the directional neighbour buckets. A room can have multiple horizontal neighbours in `neighboursByDirection[2]` / `[3]` while only one of them is the floor-aligned navigable neighbour. Pathfinding and navigable CAs use the navigable pointers; vision casts and bulk neighbour queries use the buckets.

### Room-pair lookups

`MapManager.doorsByRoomPair` is a `Map<"a-b", Door[]>` (`MapManager.js:doorsByRoomPair`) indexed by sorted room id pair. It lets `getDoorBetween(a, b)` answer "which doors connect these two rooms?" in O(1). Maintained by `createSharedDoorSegment`, `addRoomEdge`, and the deserialisation path.

### Links — the escape hatch

`room.linkCollection` is the home of explicitly-created `Link` objects (`engine/world/Link.js`), one of which can join two rooms regardless of their geometric relationship. Created by the `LINK` CAOS command, populated from PRAY data, and walked by phase A of `_alterCAEmissionRecursive`. Use links when:

- Two rooms need to exchange navigable CAs but their floors don't touch (separate metarooms, vertical shafts, teleporters).
- Two rooms need to be navigation-equivalent for some specific subsystem without forcing a full geometric merge.

Links have their own `permeability` field and respect both rooms' `diffusion` rates during navigable CA propagation, identically to navigable doors.

---

## Common Pitfalls and Debugging

A short cheat sheet for the most common room-system confusions.

### "My CA value is zero in this room"

Walk the seven-step checklist in [Cellular Automata System → Debugging Zero Values](#/article/cellular-automata). The most common causes, in order:

1. The bootstrap script that emits this CA never ran (or its agents got killed).
2. The source room's `gain` for this CA is 0 — the room type at the emitter's position has no `RATE` line covering this index.
3. The path between the source room and the destination is broken — check for any `permeability == 0` link or door, or any room with `diffusion == 0`, along the way.
4. **The relevant door isn't promoted to navigable** even though the rooms are floor-aligned — see next item.

### "The door connecting these rooms shows `permeability = 100` but the navigable indicator is `No`"

That door is in `doorCollection` but failed promotion to `leftNavigableDoor` / `rightNavigableDoor`. The Map debugger (`MapDebuggerModule`) shows the precise reason in the **Navigable** row tooltip; it will be one of:

- `external edge (parentCount=1)` — the door isn't shared. Should have been merged with a sibling at room-creation time but wasn't.
- `doorType=N (not LEFT_RIGHT)` — the door is vertical. Use a `LINK` if you need navigable CA flow across this connection.
- `floor endpoints do not match` — the floor corners aren't within 2.0 units of each other. Either the rooms genuinely aren't floor-aligned (in which case use a `LINK`), or the geometry data is off by a small numeric error.

### "The door is navigable on one side but not the other"

The Map debugger labels this **`⚠ asymmetric`**. It means `room A.rightNavigableDoor === door` but `room B.leftNavigableDoor !== door` (or vice versa). In a freshly built world this should be impossible — the promotion code is symmetric — but it can occur in:

- Saved worlds restored before the fallback guard was widened from `&&` to `||`.
- Old rooms whose siblings were added by an `addRoom` that didn't run `refreshNavigableInfoForNeighbours`.

Force-reloading the world or calling `MapManager.calculateNeighbourInformationForRoom(room)` on the half-wired side fixes it.

### "I changed `door.permeability` at runtime but the CA didn't change"

For navigable CAs, the cached propagation deltas don't recompute when permeability changes — they were applied at the moment the emitter started emitting and are now sitting as raw `+=` deposits in `caValues`. The standard approach is to re-emit (toggle the emitter off and back on, or move the emitter through a room cycle) to force `alterCAEmission` to recalculate the chain. For non-navigable CAs the change takes effect on the next round-robin pass for that CA index.

### "I added a room and now a different room's `leftNavigableDoor` is wrong"

Make sure `addRoom` is calling `refreshNavigableInfoForNeighbours` for the new room. If you're wiring up rooms via a custom path (test harness, manual instantiation, world deserialisation), you must mirror what `addRoom` does in steps 7–9 — `createDoorsForRoom`, then `calculateNeighbourInformationForRoom` on the new room, then the same on every sibling now sharing a horizontal door with it.

### "ADDR returns a room id but the room isn't visible"

`room.activate()` and `room.isLoaded = true` are called from `addRoom` (`MapManager.js:245-246`) — verify both are true. `room.setVisible(true)` is the display flag (`Room.js:setVisible`); check `room.getVisible()` if rendering looks empty. Note that `DEBUG_ROOMS` and `DEBUG_SELECTED_ROOM_ID` (`Room.js:renderToPlanes`) gate the room overlay independently of the room being active.

---

## Key Files

| File | Purpose |
|---|---|
| `engine/world/Room.js` | `Room` class, `Vector2D`, `setBoundaries`, `setComplexShape`, `calculatePerimeterLength`, CA storage init |
| `engine/world/MapManager.js` | `addRoom`, `createDoorsForRoom`, `addRoomEdge`, `getOverlapInformation`, `createSharedDoorSegment`, `createUnsharedDoorSegment`, `_orderParentsForSharedDoor`, `calculateNeighbourInformationForRoom`, `refreshNavigableInfoForNeighbours` |
| `engine/world/Door.js` | `Door` class, `DOOR_LEFT_RIGHT`/`DOOR_CEILING_FLOOR`, `DIRECTION_*` constants, `IMPERMIABLE`/`PERMIABLE` |
| `engine/world/Link.js` | `Link` class — the escape hatch for non-floor-aligned navigable CA flow |
| `engine/world/CASystem.js` | Both CA update paths; `alterCAEmission`, `_alterCAEmissionRecursive`, `updateCurrentCAProperty`, `preCalculateAllDoorages`, `increaseCAInput` |
| `engine/world/CARates.js` | `CARates`, `UpdateRoomCA`, `UpdateDoorCA` |
| `engine/caos/commands/map/ADDR.js` | `ADDR` CAOS command — the public entry point |
| `engine/caos/commands/map/RTYP.js` | `RTYP` CAOS command — assigns room type |
| `engine/caos/commands/map/DOOR.js` | `DOOR` CAOS command — read/write door permeability |
| `engine/caos/commands/map/LINK.js` | `LINK` CAOS command — create a manual room-to-room link |
| `Assets/Bootstrap/001 World/!map.cos` | The bootstrap script that builds the entire Ark — `ADDR`/`RTYP`/`DOOR`/`RATE` commands in order |

---

## Related Articles

- [World Map System](#/article/world-map-system) — metaroom hierarchy, coordinate system, display rendering, `MAX_ROOMS` and other system limits
- [Cellular Automata System](#/article/cellular-automata) — the two CA update algorithms, navigable vs non-navigable, doorage formulas, debugging zero values
- [Collision & Physics](#/article/collision-system) — how agent positions translate into "current room" assignments and how the floor chain is walked
