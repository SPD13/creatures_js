# Cacbana (cacbana.cos)

The Cacbana script implements a complete botanical lifecycle system for the Cacbana plant — a tropical weed species native to the Creatures 3 ship. The script manages three distinct agent types (seeds, plants, and flowers) that together form a self-sustaining plant ecosystem with growth, reproduction, dormancy, and decomposition mechanics.

Seeds bounce around the world and, when conditions are right (sufficient water and not too many nearby plants), germinate into weed plants. Plants grow through multiple stages driven by room nutrients, eventually producing flowers when light is low. Flowers can be pollinated (by external agents such as bees or balloon bugs sending message 303), after which they produce new seeds — completing the lifecycle. When plants die, they decompose and release nutrients and water back into the room, enriching the ecosystem for future growth.

The Cacbana is edible at the seed stage, providing creatures with an "Eaten Plant" stimulus.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 2 3 9 | [Cacbana Seed](#cacbana-seed-2-3-9) | Bouncing seed that germinates into a plant or goes dormant; edible by creatures |
| 2 5 2 | [Cacbana Plant (Weed)](#cacbana-plant-2-5-2) | Multi-stage growing plant with nutrient/water uptake and flower production |
| 2 7 3 | [Cacbana Flower](#cacbana-flower-2-7-3) | Flower produced by mature plants; when pollinated, produces a new seed |

---

## Cacbana Seed (2 3 9)

Seeds are the reproductive and dispersal unit of the Cacbana. Ten seeds are created at installation, scattered across x=5200–5500, y=400 with random upward velocities. They bounce off surfaces and attempt to germinate when they come to rest in a suitable location. Seeds are edible by creatures.

**Attributes:** Physics-enabled (attr 195), edible (bhvr 16), elasticity 40, friction 50, aero drag 5, gravity 1, perception range 500.

**Key Variables:**
- `ov00`: State (0=active/bouncing, 1=dormant)
- `ov80`: Bounce counter (incremented on wall collisions)
- `ov81`: Growth threshold — random value 8–15; seed must bounce this many times before attempting germination
- `ov82`: Dormancy timer (10–100 ticks when dormant)

### Events

| Event | Number | Description |
|---|---|---|
| Eat | 12 | Creature eats the seed |
| Collision | 6 | Seed hits a wall or surface |
| Timer | 9 | Periodic tick for dormancy and germination |

### Event 12 — Eat

When a creature eats the seed, it sends **stimulus 77 (Eaten Plant)** with strength 3 to the eating creature, waits 1 tick, then destroys itself.

**Stimulus impact:** Stimulus 77 triggers the creature's genome-defined biochemical response for eating a plant (typically increases starch/carbohydrate satiation).

### Event 6 — Collision

When the seed hits a wall (not ceiling):

- **Active state (ov00=0):** Increments the bounce counter. If it exceeds the growth threshold:
  - Checks if room water (CA 2) >= 0.1
  - Counts nearby Cacbana plants (2 5 2) within range
  - If fewer than 5 plants nearby: **germinates** — creates a new Cacbana Plant at its location, then destroys itself
  - If 5 or more nearby: **goes dormant** to prevent overcrowding
  - If insufficient water: goes dormant
- If below growth threshold: resets animation and bounces with new random velocity.

### Event 9 — Timer (tick 15 active, tick 200 dormant)

- **Active state (ov00=0):** If the seed has stopped bouncing (not falling, not carried) and hasn't reached its growth threshold, transitions to dormant.
- **Dormant state (ov00=1):** Decrements the dormancy timer. When it expires:
  - **Decomposes:** Adds +0.5 to room Water (CA 3) and +0.5 to room Nutrient (CA 4), then destroys itself.
  - Before decomposing, makes one last germination attempt if water conditions allow.

**Room CA impact on decomposition:** Water (CA 3) +0.5, Nutrient (CA 4) +0.5.

---

## Cacbana Plant (2 5 2)

The Cacbana plant (classified as a weed) is the main growing body of the organism. It grows through multiple visual stages driven by room nutrients, produces flowers under low-light conditions, and eventually dies, returning resources to the ecosystem.

**Attributes:** Stationary (attr 192), no elasticity, full friction, permeability 80, tick 100.

**Key Variables:**
- `ov00`: Growth state (0=growing, 1=mature, 2=flowering, 3=fruiting/seeding, 9=dying)
- `ov30` (=4): Number of growing poses
- `ov31` (=23): Variant pose offset (for alternative plant appearances)
- `ov32` (=16): Wilting stage pose
- `ov33` (=11): Flower-bearing stage pose
- `ov34` (=10): Pre-flower stage pose
- `ov55`: Plant health/hydration level (starts 0.01, max 0.5)
- `ov56` (=0.01): Water uptake rate per tick
- `ov57` (=0.5): Maximum health
- `ov64`: Plant variant flag (0=normal, 1=alternate with +23 pose offset)
- `ov66` (=100): Lifecycle counter (decremented each tick in mature states)
- `ov69`: Has-flowers flag (0=no, 1=yes)
- `ov70` (=0.2): Nutrient uptake threshold
- `ov16`/`ov17`: Agent references to the two flowers

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main lifecycle tick — growth, flowering, death |

### Event 9 — Timer (tick 100)

The timer drives the entire plant lifecycle through a state machine:

**Water Uptake (every tick):** Absorbs water from room Nutrient CA (CA 4) into plant health (ov55) at rate ov56, as long as room nutrient >= ov56 and plant health < max. Reduces room CA 4 accordingly.

**Health Decay:** Plant health decreases by 0.005 each tick. If health reaches 0, the plant enters the dying state.

#### State 0 — Growing

The plant advances its visual pose (grows) each tick, consuming room Nutrient (CA 4) in the process. Growth requires CA 4 >= 0.2. Once the plant reaches its full growth pose, it transitions to **State 1 (Mature)**.

**Room CA impact:** Nutrient (CA 4) reduced by 0.2 per growth step.

#### State 1 — Mature

The lifecycle counter (ov66) decrements each tick. When room Light (CA 1) drops to <= 0.4 (simulating night or shade), the plant enters **State 2 (Flowering)** and may produce flowers.

**Flower creation:** If the lifecycle counter has expired (ov66 <= 0) and the plant has no flowers yet, and room Water (CA 3) >= 0.3, the plant creates two Cacbana Flowers (2 7 3) at calculated positions along the plant body. The plant and flowers maintain bidirectional references (ov16/ov17).

#### State 2 — Flowering

The plant continues advancing its pose. Flowers are positioned along the plant body and move as the plant grows. When room Light (CA 1) rises above 0.4, the plant transitions to **State 3 (Fruiting)**.

#### State 3 — Fruiting/Seeding

The plant begins to retract (decrement pose), moving flowers accordingly. Eventually returns to the mature growth pose and cycles back to **State 1**.

#### State 9 — Dying

The plant notifies its flowers (message 301) to self-destruct, then progressively wilts (advances pose through wilting frames). When fully wilted, it decomposes:

**Room CA impact on decomposition:** Water (CA 3) +0.05, Nutrient (CA 4) +0.1.

---

## Cacbana Flower (2 7 3)

Flowers are produced in pairs by mature Cacbana plants. They grow through visual stages and await pollination from external agents (e.g., bees, balloon bugs). Once pollinated, they produce a new Cacbana Seed, completing the plant's reproductive cycle.

**Key Variables:**
- `ov16`: Agent reference to parent plant
- `ov70`: Pollination flag (0=not pollinated, 1=pollinated — set by message 303)

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Flower growth and seed production |
| Message 303 | 303 | Pollination signal from external agent |
| Message 301 | 301 | Cleanup signal from dying parent plant |

### Event 9 — Timer (tick 600)

- **Unpollinated:** Flower grows through poses 0–4, then waits.
- **Pollinated (ov70=1):** Flower continues growing through poses 4–8 (fruit development). At pose 8 (fully fruited), it:
  - Creates a new Cacbana Seed (2 3 9) at the flower's position with random velocity
  - Notifies the parent plant to clear its flower reference
  - If both flowers have been released, resets the parent plant's lifecycle counter (ov66=100) so the plant can flower again
  - Destroys itself

### Event 303 — Pollination

Sets ov70=1, marking the flower as pollinated. This message is sent by pollinating agents such as bees or balloon bugs that interact with flowers.

### Event 301 — Parent Plant Dying

When the parent plant dies, it sends message 301 to its flowers. The flower unlinks itself from the parent's ov16/ov17 reference and destroys itself.

---

## Ecosystem Interactions

### Nutrient Cycling
The Cacbana participates in a closed nutrient loop:
- **Growing plants** consume Nutrient (CA 4) from the room
- **Dying plants** return Water (CA 3) and Nutrient (CA 4) to the room
- **Decomposing seeds** return Water (CA 3) and Nutrient (CA 4) to the room
- **Water uptake** continuously draws from room Nutrient (CA 4) into plant health

### Population Control
- Seeds check for nearby plant count (< 5) before germinating
- Overcrowded areas cause seeds to go dormant instead of growing
- Water availability (CA 2 >= 0.1) is required for germination

### Pollination Dependency
Flowers require pollination (message 303) from external agents to produce seeds. Without pollinating creatures, the Cacbana cannot reproduce through the flower pathway, though dormant seeds provide a secondary dispersal mechanism.

## Removal Script

The removal script destroys all Cacbana plants (2 5 2), flowers (2 7 3), and seeds (2 3 9), and unregisters the plant timer script (scrx 2 5 2 9).
