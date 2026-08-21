# Sprites & Display System

This article explains how agents are rendered in Creatures 3, including sprite formats, the gallery system, animation, and z-ordering.

## Sprite File Formats

Creatures 3 uses two sprite formats:

| Format | Extension | Description |
|--------|-----------|-------------|
| **S16** | `.s16` | Uncompressed 16-bit sprites |
| **C16** | `.c16` | Compressed 16-bit sprites (RLE) |

### S16 Format (Uncompressed)

```
┌─────────────────────────────────────────────────────────────┐
│                    S16 FILE STRUCTURE                        │
│                                                             │
│   Header:                                                   │
│   ├── pixelFormat (uint32) - 0 or 1 for 16-bit formats     │
│   └── imageCount (uint16) - number of sprites               │
│                                                             │
│   Bitmap Headers (one per image):                           │
│   ├── offset (uint32) - byte offset to pixel data          │
│   ├── width (uint16)                                        │
│   └── height (uint16)                                       │
│                                                             │
│   Pixel Data:                                               │
│   └── Raw pixels: width × height × 2 bytes per sprite       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### C16 Format (Compressed)

C16 uses RLE (Run-Length Encoding) compression:

```
┌─────────────────────────────────────────────────────────────┐
│                    C16 COMPRESSION                           │
│                                                             │
│   For each scanline:                                        │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  tag = read uint16                                  │  │
│   │  count = tag >> 1                                   │  │
│   │  isLiteral = tag & 1                                │  │
│   │                                                     │  │
│   │  if count == 0:                                     │  │
│   │      end of line                                    │  │
│   │  else if isLiteral:                                 │  │
│   │      read 'count' literal pixels                    │  │
│   │  else:                                              │  │
│   │      repeat transparent for 'count' pixels          │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Pixel Format Conversion

16-bit pixels are converted to 32-bit RGBA:

```javascript
// RGB565 format (most common)
const r = ((pixel >> 11) & 0x1F) << 3;  // 5 bits → 8 bits
const g = ((pixel >> 5) & 0x3F) << 2;   // 6 bits → 8 bits
const b = (pixel & 0x1F) << 3;          // 5 bits → 8 bits
const a = pixel === 0 ? 0 : 255;        // Transparent if black

// Result: RGBA array for canvas
```

---

## Gallery System

A **Gallery** is a container for parsed sprite data.

### Gallery Properties

```javascript
class Gallery {
    pixelFormat: number       // Color format (0=16-bit)
    imageCount: number        // Total sprites
    sprites: Array<Sprite>    // Parsed sprite objects
}
```

### Sprite Object

```javascript
{
    index: number,            // Sprite index in gallery
    width: number,            // Sprite width in pixels
    height: number,           // Sprite height in pixels
    pixelData: Uint8Array,    // RGBA pixel data
    imageData: ImageData,     // Cached for canvas (optional)
    canvas: HTMLCanvasElement // Cached canvas (optional)
}
```

### Gallery Methods

```javascript
// Get sprite by index
const sprite = gallery.getSprite(frameIndex);

// Get dimensions
const { width, height } = gallery.getSpriteDimensions(index);

// Get total count
const count = gallery.getSpriteCount();

// Validate index
if (gallery.isValidIndex(index)) {
    // Safe to use
}
```

---

## EntityImage

**EntityImage** manages sprite display for an agent, handling animation and rendering.

### Core Properties

```javascript
class EntityImage {
    gallery: Gallery          // Sprite source
    absoluteBaseImage: number // Original base (never changes)
    currentBaseImage: number  // Current base (can change)
    currentImage: number      // Absolute sprite index
    plane: number             // Z-depth for rendering
    position: { x, y }        // World coordinates
    imageCount: number        // Available frames
    visible: boolean          // Visibility flag
    mirrored: boolean         // Horizontal flip
    alpha: number             // Opacity (0.0-1.0)
}
```

### Base vs Current Image

```
┌─────────────────────────────────────────────────────────────┐
│                   IMAGE INDEXING                             │
│                                                             │
│   Gallery: [0] [1] [2] [3] [4] [5] [6] [7] [8] [9]         │
│                                                             │
│   Agent with:                                               │
│     absoluteBaseImage = 2                                   │
│     imageCount = 4                                          │
│                                                             │
│   Available frames: [2] [3] [4] [5]                        │
│                      0   1   2   3  ← relative index        │
│                                                             │
│   setPose(1) → currentImage = 2 + 1 = 3                    │
│   getPose() → currentImage - currentBaseImage = 1           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Animation Properties

```javascript
animationSequence: number[]   // Frame indices to animate
animationFrame: number        // Current frame in sequence
animationLength: number       // Total frames
frameRate: number             // Ticks per frame (1=every tick)
frameCounter: number          // Counter for timing
animationLoop: boolean        // Whether to loop
animationLoopRestartIndex: number  // Frame to restart at
```

---

## Animation Commands

### POSE - Set Current Frame

```caos
* Set pose (relative to base)
pose 2          * Display frame 2

* Get current pose
setv va00 pose  * Returns relative frame index
```

### ANIM - Start Animation

```caos
* Simple animation: frames 0, 1, 2, 3
anim [0 1 2 3]

* Looping animation (255 = loop marker)
anim [0 1 2 3 255]

* Loop with restart index
anim [0 1 2 3 255 1]
* Plays 0,1,2,3 then loops back to frame 1
```

### BASE - Change Base Image

```caos
* Set base image (shifts available frames)
base 10         * Now frames start at index 10

* Get current base
setv va00 base  * Returns 10
```

### FRAT - Frame Rate

```caos
* Set frame rate (1 = normal, 2 = half speed)
frat 2          * Animation runs at half speed

* Slower animation
frat 10         * Updates every 10 ticks
```

### Animation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   ANIMATION UPDATE                           │
│                                                             │
│   Each tick:                                                │
│   ├── frameCounter++                                        │
│   │                                                         │
│   └── if frameCounter >= frameRate:                         │
│       ├── frameCounter = 0                                  │
│       ├── animationFrame++                                  │
│       │                                                     │
│       └── if animationFrame >= animationLength:             │
│           ├── if animationLoop:                             │
│           │   └── animationFrame = loopRestartIndex         │
│           └── else:                                         │
│               └── animation stops                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Z-Ordering (Plane System)

Agents are rendered by **plane** value - lower planes render first (back to front).

### Plane Ranges

| Plane Range | Usage |
|-------------|-------|
| 0-999 | Background elements |
| 1000-4999 | Back world objects |
| 5000-7999 | Main game objects |
| 8000-9000 | Foreground objects |
| 9001-9999 | UI elements (world-relative) |
| 10000+ | Screen-fixed UI (pointer) |

### Rendering Order

```
┌─────────────────────────────────────────────────────────────┐
│                   RENDER ORDER                               │
│                                                             │
│   Screen                                                    │
│   ┌─────────────────────────────────────┐                  │
│   │                                     │                  │
│   │  [Plane 10000] Pointer       ───┐   │                  │
│   │  [Plane 9500]  UI Panel      ───┤   │                  │
│   │  [Plane 6000]  Creature      ───┤   │ Render last     │
│   │  [Plane 5500]  Food          ───┤   │ (on top)        │
│   │  [Plane 5000]  Machine       ───┤   │                  │
│   │  [Plane 1000]  Background    ───┘   │ Render first    │
│   │                                     │ (behind)         │
│   └─────────────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Setting Plane (CAOS)

```caos
* Set agent's plane
plne 5500

* Get agent's plane
setv va00 plne
```

---

## DisplayManager

The DisplayManager handles all rendering operations.

### Entity Registration

```javascript
// Register agent for rendering
displayManager.registerEntity(entity, entityId);

// Unregister when done
displayManager.unregisterEntity(entityId);
```

### Render Loop

```
┌─────────────────────────────────────────────────────────────┐
│                   RENDER PIPELINE                            │
│                                                             │
│   1. Sort entities by plane (if dirty)                      │
│      entities.sort((a, b) => a.plane - b.plane)            │
│                                                             │
│   2. For each entity in sorted order:                       │
│      ├── Check visibility                                   │
│      ├── Check camera bounds (culling)                      │
│      ├── Get cached canvas from entity                      │
│      ├── Apply transformations:                             │
│      │   ├── Position (world → screen)                      │
│      │   ├── Zoom scaling                                   │
│      │   ├── Mirroring (if needed)                          │
│      │   └── Alpha blending                                 │
│      └── Draw to screen canvas                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Canvas Caching

Each EntityImage maintains its own cached canvas:

```javascript
getCachedCanvas() {
    if (this.canvasNeedsUpdate) {
        // Create ImageData from sprite pixels
        const imageData = new ImageData(
            new Uint8ClampedArray(sprite.pixelData),
            sprite.width,
            sprite.height
        );

        // Draw to canvas
        this.cachedCanvas.width = sprite.width;
        this.cachedCanvas.height = sprite.height;
        this.ctx.putImageData(imageData, 0, 0);

        // Composite overlays if enabled
        if (this.overlayEnabled) {
            this.compositeOverlays();
        }

        this.canvasNeedsUpdate = false;
    }
    return this.cachedCanvas;
}
```

---

## CompoundAgent Parts

CompoundAgents have multiple parts, each with its own EntityImage.

### Part Structure

```javascript
class CompoundPart {
    entity: EntityImage         // Sprite display
    relativePosition: { x, y }  // Offset from parent
    relativePlane: number       // Plane offset
    parent: CompoundAgent       // Owner
    creationIndex: number       // For render sorting
}
```

### Part Positioning

```
┌─────────────────────────────────────────────────────────────┐
│                   COMPOUND PART POSITIONING                  │
│                                                             │
│   Agent Position: (100, 200)                                │
│   Agent Plane: 5000                                         │
│                                                             │
│   Part 0 (base):                                            │
│     relativePosition: (0, 0)                                │
│     relativePlane: 0                                        │
│     → World: (100, 200), Plane: 5000                        │
│                                                             │
│   Part 1:                                                   │
│     relativePosition: (20, -10)                             │
│     relativePlane: 1                                        │
│     → World: (120, 190), Plane: 5001                        │
│                                                             │
│   Part 2:                                                   │
│     relativePosition: (40, 5)                               │
│     relativePlane: -1                                       │
│     → World: (140, 205), Plane: 4999                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Part Rendering Order

Parts render by:
1. **Plane** (ascending)
2. **Creation index** (tiebreaker)

```javascript
// Sort parts for rendering
parts.sort((a, b) => {
    const planeA = basePlane + a.relativePlane;
    const planeB = basePlane + b.relativePlane;
    if (planeA !== planeB) {
        return planeA - planeB;
    }
    return a.creationIndex - b.creationIndex;
});
```

---

## Creature Body Parts

Creatures have 14 articulated body parts with special rendering rules.

### Body Part Sprites

Each part has its own sprite gallery:

```
Assets/Images/
├── a00a.c16   ← Head, age 0, variant a
├── b00a.c16   ← Body, age 0, variant a
├── c00a.c16   ← Left thigh
├── d00a.c16   ← Left shin
├── ...
└── n00a.c16   ← Tail tip
```

### Direction-Based Z-Ordering

Body parts have different plane offsets based on creature direction:

```javascript
// Plane offsets by direction and body part
const PLANE_OFFSETS = {
    EAST: {
        HEAD: 2, BODY: 0,
        L_THIGH: -1, L_SHIN: -2, L_FOOT: -1,
        R_THIGH: 1, R_SHIN: 2, R_FOOT: 3,
        // Right limbs in front when facing east
    },
    WEST: {
        HEAD: 2, BODY: 0,
        L_THIGH: 1, L_SHIN: 2, L_FOOT: 3,
        R_THIGH: -1, R_SHIN: -2, R_FOOT: -1,
        // Left limbs in front when facing west
    }
};
```

### Mirroring Rules

Some parts are mirrored, others never mirror:

| Part | Mirrors? |
|------|----------|
| Head | Yes |
| Body | Yes |
| Left/Right Thigh | Yes |
| Left/Right Shin | Yes |
| Left/Right Foot | Yes |
| Left Arm (Humerus/Radius) | **Never** |
| Right Arm (Humerus/Radius) | **Never** |
| Tail | Yes |

Arms don't mirror because they use different sprite frames for each direction.

---

## Overlay System

Creatures can have overlay sprites (clothing, accessories):

```javascript
// Overlay properties
overlayEnabled: boolean
overlayGallery: Gallery
overlaySprites: Array<Sprite>  // Up to 4 layers
overlayIndices: Array<number>  // Current frame per layer
```

### Overlay Composition

```
┌─────────────────────────────────────────────────────────────┐
│                   OVERLAY COMPOSITION                        │
│                                                             │
│   Layer 0 (base sprite)                                     │
│       ↓                                                     │
│   Layer 1 (overlay 0)                                       │
│       ↓                                                     │
│   Layer 2 (overlay 1)                                       │
│       ↓                                                     │
│   Layer 3 (overlay 2)                                       │
│       ↓                                                     │
│   Layer 4 (overlay 3)                                       │
│       ↓                                                     │
│   Final composite canvas                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## CAOS Sprite Commands

### Gallery and Image

```caos
* Create agent with sprite
new: simp 2 1 1 "mysprite" 10 0 5000
*                   ^        ^  ^  ^
*              gallery  count base plane

* Change gallery at runtime
gall "newsprite" 0
* Changes gallery, keeps base=0

* Get gallery name
setv va00 gall
```

### Visibility

```caos
* Hide agent
visi 0

* Show agent
visi 1

* Check visibility
setv va00 visi
```

### Mirroring

```caos
* Mirror horizontally
mira 1

* Unmirror
mira 0
```

### Alpha/Transparency

```caos
* Set alpha (0-256, 256=opaque)
alph 128 1
* 50% transparent, enabled

* Disable alpha
alph 256 0
```

---

## Key Files

| File | Purpose |
|------|---------|
| `Gallery.js` | Sprite gallery wrapper |
| `EntityImage.js` | Sprite display manager |
| `DisplayManager.js` | Rendering pipeline |
| `CompoundPart.js` | Compound agent parts |
| `BodyPart.js` | Creature body parts |
| `creatures-file-formats.js` | S16/C16 parsers |
| `SpriteLoader.js` | Sprite loading utility |

---

## Related Articles

- [Agent System Overview](#/article/agents-overview) - Agent basics
- [Agent Types](#/article/agent-types) - Different agent types
- [Input & Output Ports](#/article/agent-ports) - Agent communication
