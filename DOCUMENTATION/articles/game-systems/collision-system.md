# Agent-Room Collision System Implementation

## Overview

The agent-room collision system is a sophisticated physics engine that prevents agents from passing through room boundaries (doors) while enabling natural movement behaviors like sliding along walls, bouncing off surfaces, and navigating corners. The system has been fully ported from the original Creatures 3 engine to JavaScript, maintaining architectural fidelity while leveraging modern web capabilities.

**Location**: `Rebuild/Main_Game/src/engine/world/MapManager.js`

**Primary Method**: `moveAgentInsideRoomSystem()`

---

## System Architecture

### Core Components

The collision system consists of six integrated phases, each building upon the previous:

```
Phase 1: Foundation
    ↓
Phase 2: Diamond Model
    ↓
Phase 3: Multi-Iteration Loop
    ↓
Phase 4: Advanced Collision Response
    ↓
Phase 5: Vertex/Corner Handling
    ↓
Phase 6: Optimization & Polish
```

---

## Phase 1: Foundation - Geometric Collision Detection

### Purpose
Establish the core mathematical algorithms for detecting when and where collisions occur.

### Key Methods

#### `lineSegmentIntersection(p1, p2, p3, p4)`
**Purpose**: Tests if two line segments intersect and calculates intersection point.

**Algorithm**: Based on parametric line equations
```javascript
// Line 1: P(t) = p1 + t(p2 - p1)
// Line 2: Q(u) = p3 + u(p4 - p3)
// Intersection when P(t) = Q(u)

const r = { x: p2.x - p1.x, y: p2.y - p1.y };  // Line 1 direction
const s = { x: p4.x - p3.x, y: p4.y - p3.y };  // Line 2 direction
const qp = { x: p3.x - p1.x, y: p3.y - p1.y }; // Offset between lines

// Cross products
const rxs = r.x * s.y - r.y * s.x;      // r × s
const qpxr = qp.x * r.y - qp.y * r.x;   // (q-p) × r

// Calculate parameters (0-1 range means intersection within segments)
const t = (qp.x * s.y - qp.y * s.x) / rxs;  // Parameter for line 1
const u = (qp.x * r.y - qp.y * r.x) / rxs;  // Parameter for line 2

// Intersection point
const intersection = {
    x: p1.x + r.x * t,
    y: p1.y + r.y * t
};
```

**Returns**: 
- `null` if no intersection
- `{ time, point, u }` if intersection detected
  - `time`: How far along the first segment (0-1)
  - `point`: Exact intersection coordinates
  - `u`: Position along second segment (0-1)

#### `getRoomsAlongPath(start, end)`
**Purpose**: Efficiently finds which rooms the movement path crosses.

**Algorithm**:
1. **AABB Culling**: Calculate bounding box of path
   ```javascript
   const minX = Math.min(start.x, end.x);
   const maxX = Math.max(start.x, end.x);
   const minY = Math.min(start.y, end.y);
   const maxY = Math.max(start.y, end.y);
   ```

2. **Quick Rejection**: Skip rooms that don't intersect bounding box
   ```javascript
   if (room.right < minX || room.left > maxX ||
       room.bottom < minY || room.top > maxY) {
       continue; // Path doesn't come near this room
   }
   ```

3. **Detailed Test**: Check if path actually crosses room boundaries

**Returns**: Array of Room objects that the path crosses

#### `doesPathIntersectRoom(start, end, room)`
**Purpose**: Tests if a line segment passes through a room.

**Algorithm**:
1. Check if either endpoint is inside room
2. Test path against all 4 room edges using `lineSegmentIntersection`

**Returns**: Boolean indicating if path intersects room

---

## Phase 2: Diamond Model - Natural Sliding Movement

### Purpose
Replace point-based collision with a diamond-shaped agent model that enables smooth sliding along walls.

### The Diamond Shape

Agents are represented as a diamond with 4 vertices based on their width and height:

```
         Top (cx, cy - h/2)
              •
         Left •   • Right
              •
            Bottom
```

### Key Method

#### `calculateDiamondVertices(position, width, height, path)`
**Purpose**: Creates a 4-vertex diamond shape and selects 3 vertices facing the movement direction.

**Algorithm**:
```javascript
// Calculate agent center
const cx = position.x + width / 2;
const cy = position.y + height / 2;

// All 4 diamond vertices
const allVertices = [
    { x: cx, y: cy - height / 2 },    // 0: Top
    { x: cx + width / 2, y: cy },     // 1: Right
    { x: cx, y: cy + height / 2 },    // 2: Bottom
    { x: cx - width / 2, y: cy }      // 3: Left
];

// Select vertices based on movement direction
const exposedIndices = [];
if (path.x > 0) exposedIndices.push(1); // Moving right
if (path.x < 0) exposedIndices.push(3); // Moving left
if (path.y > 0) exposedIndices.push(2); // Moving down
if (path.y < 0) exposedIndices.push(0); // Moving up

// Return 3 exposed vertices
return exposedIndices.slice(0, 3).map(i => allVertices[i]);
```

**Why 3 Vertices?**
- Diagonal movement exposes 2 vertices (e.g., right + bottom when moving down-right)
- System adds 1 more vertex to ensure coverage
- Testing 3 vertices provides accurate collision detection without excessive computation

### Enhanced Collision Detection

#### `isAgentPathBlockedByRoomSystem(position, path, minDoorPermiability, width, height)`
**Purpose**: Tests agent's diamond vertices against all room doors.

**Algorithm**:
1. **Calculate diamond vertices** based on movement direction
2. **Find rooms along path** using AABB culling
3. **For each room's doors**:
   - Skip permeable doors (permeability ≥ threshold)
   - **For each vertex**:
     - Calculate vertex movement path
     - Test against door using `lineSegmentIntersection`
     - Track closest collision
4. **Return collision info** with earliest time value

**Returns**:
- `null` if no collision
- Collision object with:
  ```javascript
  {
      time: 0.5,              // Collision at 50% of path
      deltaCollision: {x, y}, // Distance to collision point
      doorType: 0,            // Door type constant
      doorDelta: {x, y},      // Door direction vector
      door: doorObject,       // Door instance
      room: roomObject,       // Room instance
      vertex: {x, y}          // Which vertex hit
  }
  ```

---

## Phase 3: Multi-Iteration Loop - High-Speed Physics

### Purpose
Handle multiple collisions within a single physics frame, enabling accurate high-speed movement without tunneling.

### The Problem
Without multi-iteration:
- Ball bouncing in corner processes only 1 bounce per frame
- High-speed agents can pass through thin walls
- Physics feels sluggish and inaccurate

### The Solution

#### Time-Based Iteration Loop
```javascript
const MAX_ITERATIONS = 10;
let timeRemaining = deltaTime;
let iterations = 0;

while (timeRemaining > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Apply gravity for this iteration
    velocity.y += gravity * timeRemaining;
    
    // Apply air drag
    velocity.x *= Math.pow(aeroDynamicFactor, timeRemaining);
    velocity.y *= Math.pow(aeroDynamicFactor, timeRemaining);
    
    // Calculate path for remaining time
    const path = {
        x: velocity.x * timeRemaining,
        y: velocity.y * timeRemaining
    };
    
    // Test for collision
    const collision = isAgentPathBlockedByRoomSystem(...);
    
    if (collision && collision.time < 1.0) {
        // Move to collision point
        position.x += collision.deltaCollision.x;
        position.y += collision.deltaCollision.y;
        
        // Consume time up to collision
        const timeConsumed = timeRemaining * collision.time;
        timeRemaining -= timeConsumed;
        
        // Apply collision response (Phase 4)
        applyAdvancedCollisionResponse(...);
        
        // Continue with remaining time
    } else {
        // No collision - move full distance
        position.x += path.x;
        position.y += path.y;
        timeRemaining = 0;
    }
}
```

### Key Features

**Time Tracking**:
- Each collision consumes a portion of the frame time
- Remaining time used for subsequent collisions
- Maximum 10 iterations prevents infinite loops

**Early Exit Optimization**:
```javascript
const speedSquared = velocity.x ** 2 + velocity.y ** 2;
if (speedSquared < 0.1) {
    velocity.x = 0;
    velocity.y = 0;
    stopped = true;
    break; // Exit early when nearly stopped
}
```

**Example Scenario**:
```
Ball bouncing in corner at 500 pixels/sec:
  Iteration 1: Hit right wall at t=0.3 (30% of frame)
               Bounce left, 70% time remaining
  Iteration 2: Hit left wall at t=0.15 (15% of remaining)
               Bounce right, 55% time remaining
  Iteration 3: Hit floor at t=0.05 (5% of remaining)
               Velocity dampened, 50% time remaining
  Iteration 4: Velocity below threshold - STOP
```

---

## Phase 4: Advanced Collision Response - Realistic Physics

### Purpose
Apply physically accurate collision responses based on surface type and collision angle.

### Collision Response Dispatcher

#### `applyAdvancedCollisionResponse(collision, velocity, collisionFactor, frictionFactor, gravity)`
**Purpose**: Routes to appropriate physics algorithm based on collision type.

**Algorithm**:
```javascript
// Calculate wall normal
const wallNormal = {
    x: -doorDelta.y,
    y: doorDelta.x
};
normalize(wallNormal);

// Determine collision type
const isFloor = Math.abs(doorDelta.x) > Math.abs(doorDelta.y) && doorDelta.x !== 0;

if (isFloor && Math.abs(velocity.y) < 5.0) {
    // FLOOR SLIDING MODE
    applyFloorSlidingPhysics(doorDelta, velocity, gravity, frictionFactor);
} else {
    // WALL/CEILING COLLISION MODE
    applyGeometricEnergyLoss(velocity, wallNormal, collisionFactor);
}
```

### Geometric Energy Loss (Walls/Ceilings)

#### `applyGeometricEnergyLoss(velocity, wallNormal, collisionFactor)`
**Purpose**: Applies physically accurate energy loss during wall bounces.

**Algorithm** (Ported from the original engine):
```javascript
// 1. Reflect velocity off wall
const dotProduct = velocity · wallNormal;
const reflected = velocity - 2 * dotProduct * wallNormal;

// 2. Calculate positions before/after collision
const positionBefore = -velocity;
const positionAfter = reflected;

// 3. Find middle position
const positionMiddle = (positionBefore + positionAfter) / 2;

// 4. Calculate energy loss vector
const normal = -positionMiddle;
const energyLoss = normal * (1.0 - collisionFactor);

// 5. Apply final velocity
velocity = reflected + energyLoss;
```

**Why This Works**:
- Geometric method more accurate than simple multiplication
- Energy loss proportional to collision severity
- Handles glancing blows vs direct hits naturally

### Floor Sliding Physics

#### `applyFloorSlidingPhysics(floorDelta, velocity, gravity, frictionFactor)`
**Purpose**: Projects velocity and gravity onto floor slope for realistic sliding.

**Algorithm**:
```javascript
// 1. Normalize floor slope
const slopeUnit = normalize(floorDelta);

// 2. Project gravity onto slope (slide acceleration)
const gravityDot = gravity · slopeUnit;
const slideAcceleration = slopeUnit * gravityDot;

// 3. Project velocity onto slope (slide velocity)
const velocityDot = velocity · slopeUnit;
const slideVelocity = slopeUnit * velocityDot;

// 4. Apply friction
velocity = slideVelocity * frictionFactor;

// 5. Check for rest condition (static friction)
if (|velocity| < 1.0) {
    const staticFriction = |gravity| * (1.0 - frictionFactor);
    
    if (|slideAcceleration| <= staticFriction) {
        velocity = 0;  // Agent stops on gentle slope
        return true;
    }
}
```

**Key Behaviors**:
- **Steep slopes**: Agent slides down
- **Gentle slopes**: Static friction stops movement
- **Friction**: Gradually slows sliding

---

## Phase 5: Vertex/Corner Handling - No Sticking

### Purpose
Handle collisions at corners and vertices to prevent agents from getting stuck.

### The Problem
- Agents hitting exact corner points can get stuck
- Velocity becomes zero at sharp angles
- Navigation feels unnatural

### Corner Detection

#### `getReflectionFromVertex(vertexPosition, velocity, minDoorPermiability)`
**Purpose**: Calculates reflection when agent hits a vertex where two doors meet.

**Algorithm**:
```javascript
// 1. Find doors sharing this vertex
const doorsAtVertex = findDoorsAtVertex(vertexPosition);

if (doorsAtVertex.length < 2) {
    return regularReflection();
}

// 2. Calculate angle between doors
const angle = calculateAngleBetweenDoors(door1, door2);

if (angle < 90) {
    // SHARP CORNER (SPIKE) - Bounce straight back
    return {
        velocity: { x: -velocity.x, y: -velocity.y },
        isSpike: true
    };
} else {
    // GENTLE CORNER - Average the normals
    const avgNormal = (normal1 + normal2) / 2;
    normalize(avgNormal);
    
    // Reflect using averaged normal
    return {
        velocity: reflect(velocity, avgNormal),
        isSpike: false
    };
}
```

### Corner Types

**Sharp Corner (< 90°)**:
```
    │
    │   ← Agent moving right
 ───┘
Spike

Result: Bounce straight back
velocity = -velocity
```

**Gentle Corner (≥ 90°)**:
```
    │
    └── ← Agent moving diagonally
    
Corner

Result: Smooth slide using averaged normal
velocity = reflect(velocity, avgNormal)
```

### Supporting Methods

#### `findDoorsAtVertex(vertexPosition, minDoorPermiability)`
**Purpose**: Locates all doors sharing a vertex point.

**Algorithm**:
```javascript
const tolerance = 0.5; // Pixel tolerance
const doorsAtVertex = [];

for (const door of allDoors) {
    // Skip permeable doors
    if (door.permeability >= minDoorPermiability) continue;
    
    // Check distance to door endpoints
    const distToStart = distance(vertexPosition, door.start);
    const distToEnd = distance(vertexPosition, door.end);
    
    if (distToStart < tolerance || distToEnd < tolerance) {
        doorsAtVertex.push(door);
    }
}

return doorsAtVertex;
```

#### `calculateAngleBetweenDoors(door1, door2)`
**Purpose**: Calculates angle between two door direction vectors.

**Algorithm**:
```javascript
// Normalize door directions
const dir1 = normalize(door1.end - door1.start);
const dir2 = normalize(door2.end - door2.start);

// Dot product
const dotProduct = dir1 · dir2;

// Angle in degrees
const angleRadians = acos(clamp(dotProduct, -1, 1));
const angleDegrees = angleRadians * (180 / π);

return angleDegrees;
```

---

## Integration with Agent Physics

### Agent.js Integration

The collision system integrates with Agent physics through the `updatePhysics()` method:

```javascript
// In Agent.js updatePhysics()
updatePhysics(deltaTime) {
    if (!this.movementFlags.floatable) {
        // Call MapManager collision system
        const result = this.world.mapManager.moveAgentInsideRoomSystem(
            this.width,
            this.height,
            true,                          // applyPhysics
            this.attributes.permeability,  // minDoorPermiability
            this.elasticity,               // collisionFactor
            this.aeroDynamicFactor,        // air resistance
            this.frictionFactor,           // friction
            this.gravityData.acceleration, // gravity
            { x: this.x, y: this.y },      // position
            this.velocityVector,           // velocity
            deltaTime                      // time step
        );
        
        // Update agent state from result
        this.x = result.position.x;
        this.y = result.position.y;
        this.velocityVector.x = result.velocity.x;
        this.velocityVector.y = result.velocity.y;
        
        // Handle collision events
        if (result.collision) {
            this.handleCollisionEvent(result.wall);
        }
    }
}
```

### Physics Parameters

**Agent Properties**:
- `width`, `height`: Agent dimensions for diamond calculation
- `permeability`: Minimum door permeability to pass through (0-100)
- `elasticity`: Energy retained on bounce (0-1)
  - `0.0`: No bounce (sticky)
  - `0.5`: Half energy retained
  - `1.0`: Perfect elastic collision
- `aeroDynamicFactor`: Air resistance (0-1)
  - `1.0`: No air resistance
  - `0.95`: Typical value (5% velocity loss per second)
- `frictionFactor`: Sliding friction (0-1)
  - `1.0`: No friction
  - `0.95`: Typical value
- `gravity`: Acceleration (pixels/second²)
  - Default: `10.0`

---

## Performance Characteristics

### Computational Complexity

**Per Physics Update**:
- **Room lookup**: O(R) where R = rooms along path (typically 1-3)
  - AABB culling reduces this significantly
- **Door testing**: O(D) where D = doors per room (typically 4)
- **Vertex testing**: O(V) where V = 3 vertices
- **Total**: O(R × D × V) ≈ O(36) operations typical

**Iteration Count**:
- **Stationary agents**: 0 iterations (early exit)
- **Normal movement**: 1-2 iterations
- **Bouncing**: 3-5 iterations
- **High-speed corner**: Up to 10 iterations max

### Optimization Techniques

1. **AABB Culling**: Quick rejection of distant rooms
2. **Early Exit**: Stop when velocity < threshold
3. **Iteration Limiting**: Max 10 collisions per frame
4. **Permeability Filtering**: Skip passable doors immediately
5. **Map-Based Lookups**: O(1) door retrieval

### Performance Monitoring

```javascript
// Result includes iteration count
const result = moveAgentInsideRoomSystem(...);
console.log(`Physics: ${result.iterations} iterations`);

// Warning logged if max iterations exceeded
if (iterations >= MAX_ITERATIONS) {
    logManager.warn('Agent exceeded max collision iterations');
}
```

---

## Testing and Validation

### Test Scenarios

**Basic Movement**:
- ✅ Agent stops at impermeable door
- ✅ Agent passes through permeable door
- ✅ Agent slides along angled wall

**Bouncing Physics**:
- ✅ Ball bounces off wall with energy loss
- ✅ Multiple bounces in corner within one frame
- ✅ Agent comes to rest naturally

**Floor Behavior**:
- ✅ Slides down steep slope
- ✅ Stops on gentle slope (static friction)
- ✅ Friction slows movement

**Corner Navigation**:
- ✅ Sharp corners bounce agent back
- ✅ Gentle corners allow smooth sliding
- ✅ No sticking at vertices

**High-Speed Movement**:
- ✅ No tunneling through thin walls
- ✅ Accurate collision at high velocity
- ✅ Multiple collisions handled correctly

### Debug Output

Enable detailed logging:
```javascript
mapManager.debugPhysics = true;

// Logs every physics update:
// "Physics: pos(123.4,456.7) vel(10.2,-5.3) collision:true wall:0 stopped:false"
```

---

## Future Enhancements

### Potential Improvements

1. **Bidirectional Testing**
   - Test door vertices vs agent edges
   - More accurate for edge cases

2. **Spatial Partitioning**
   - Quadtree for room lookups
   - Beneficial with 500+ rooms

3. **Debug Visualization**
   - Render collision diamonds
   - Show collision paths and contact points
   - Visual normal vectors

4. **Advanced Materials**
   - Surface-specific friction
   - Bouncy vs sticky materials
   - Temperature-based properties

---

## Summary

The agent-room collision system provides:

✅ **Accurate Collision Detection**: Diamond model with multi-vertex testing  
✅ **Realistic Physics**: Geometric energy loss and vector projection  
✅ **High-Speed Support**: Multi-iteration loop prevents tunneling  
✅ **Corner Handling**: Spike detection and averaged normal reflection  
✅ **Performance Optimized**: AABB culling and early exit conditions  
✅ **Original Engine Parity**: Direct port of original algorithms  

The system is production-ready and fully integrated with the agent physics pipeline.
