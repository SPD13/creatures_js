# Creature Perception System

Creatures perceive their world through a sophisticated multi-modal sensory system. This article explains how creatures see, smell, hear, and touch their environment, and how this perception data flows into the neural brain for decision-making.

## Perception Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERCEPTION ARCHITECTURE                        │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    World Environment                     │  │
│   │                                                         │  │
│   │   [Agents]    [CA Properties]    [Sounds]    [Contact] │  │
│   └───────┬───────────────┬─────────────┬───────────┬───────┘  │
│           │               │             │           │           │
│           ▼               ▼             ▼           ▼           │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                   SensoryFaculty                         │  │
│   │                                                         │  │
│   │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │  │
│   │   │ Vision  │ │  Smell  │ │ Hearing │ │  Touch  │      │  │
│   │   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │  │
│   │        │           │           │           │            │  │
│   │        ▼           ▼           ▼           ▼            │  │
│   │   ┌─────────────────────────────────────────────────┐  │  │
│   │   │              Brain Input Lobes                  │  │  │
│   │   │                                                 │  │  │
│   │   │  visn[80]  smll[40]  situ[9]  detl[11]  driv[20]│  │  │
│   │   └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Brain Processing                      │  │
│   │                          │                               │  │
│   │                          ▼                               │  │
│   │              Attention Lobe → IT Agent                   │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Vision System

Creatures detect agents through a **category-based vision system** with a default range of 512 pixels.

### Visual Range

```
┌─────────────────────────────────────────────────────────────────┐
│                       VISUAL RANGE                               │
│                                                                 │
│                         512 pixels                              │
│                    ◄─────────────────►                          │
│                                                                 │
│                           ┌───┐                                 │
│           ○               │ C │               ○                 │
│          food             └───┘              toy                │
│                          creature                               │
│                                                                 │
│   ○ = visible agents                                           │
│   Agents beyond 512px are not perceived                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visibility Rules

| Rule | Description |
|------|-------------|
| **Self exclusion** | Creatures cannot see themselves |
| **Dead exclusion** | Dead agents are not visible |
| **Range check** | Must be within 512 pixels |
| **Carried always visible** | Items being held are always perceived at position (0,0) |

### Vision Constants

```javascript
VISUAL_RANGE = 512              // Default creature vision range (pixels)
NEAR_RAND_VISUAL_RANGE = 200    // Range for "nearest random" algorithm
NO_RANDOM_NEAR_AGENTS = 5       // Number of agents to consider for random selection
```

---

## Category System

The vision system organizes perceived agents into **40 categories**. Each category represents a type of thing a creature can recognize (food, toys, other creatures, machines, etc.).

### Category Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CATEGORY SYSTEM                              │
│                                                                 │
│   Agent Classifier                Category                      │
│   ┌──────────────────┐           ┌──────────────────┐          │
│   │ family: 2        │           │ ID: 36           │          │
│   │ genus:  1        │  ──────►  │ Name: "Norn"     │          │
│   │ species: 0       │           │ Algorithm: 0     │          │
│   └──────────────────┘           └──────────────────┘          │
│                                                                 │
│   Wildcard Matching:                                           │
│   • 0 in any position = match any value                        │
│   • (2, 1, 0) matches all norns regardless of species          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Default Categories

| Category ID | Name | Classifier (F,G,S) |
|-------------|------|-------------------|
| 0-29 | Items, food, toys, machines | Various |
| 30 | Norn Home | Environment |
| 31 | Grendel Home | Environment |
| 32 | Ettin Home | Environment |
| 36 | Norn | (2, 1, 0) |
| 37 | Grendel | (2, 2, 0) |
| 38 | Ettin | (2, 3, 0) |
| 39 | Other creatures | (2, 0, 0) |

### Category Methods

```javascript
CategorySystem.getCategoryIdOfAgent(agent)         // Get category from agent
CategorySystem.getCategoryIdOfClassifier(f, g, s)  // Get category from classifier
CategorySystem.getCategoryName(categoryId)         // Get human-readable name
CategorySystem.getCategoryAlgorithm(categoryId)    // Get vision algorithm
CategorySystem.getNumCategories()                  // Returns 40
```

---

## Representative Selection Algorithms

For each category, the creature selects **one representative agent** to perceive. Five algorithms determine which agent is selected:

### Algorithm 0: PICK_NEAREST_IN_X_DIRECTION

```
┌─────────────────────────────────────────────────────────────────┐
│   Finds nearest agent in the creature's facing direction        │
│                                                                 │
│   Creature facing right (→):                                    │
│                                                                 │
│       ○          ┌───┐            ○                  ●          │
│      (A)         │ C │           (B)                (C)         │
│     behind       └───┘         selected           further       │
│                     →                                           │
│                                                                 │
│   Only considers X distance (horizontal)                        │
│   Agent B is selected (nearest in facing direction)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Algorithm 1: PICK_A_RANDOM_ONE

Randomly selects from all visible agents in the category. Provides variety and exploration behavior.

### Algorithm 2: PICK_NEAREST_IN_CURRENT_ROOM

```
┌─────────────────────────────────────────────────────────────────┐
│   Only considers agents in the same room                        │
│                                                                 │
│   ┌─────────────────────┐   │   ┌─────────────────────┐        │
│   │      Room A         │   │   │      Room B         │        │
│   │                     │   │   │                     │        │
│   │   ┌───┐     ○       │   │   │   ○                 │        │
│   │   │ C │    (A)      │   │   │  (B)                │        │
│   │   └───┘  selected   │   │   │ ignored            │        │
│   │                     │   │   │                     │        │
│   └─────────────────────┘   │   └─────────────────────┘        │
│                                                                 │
│   Uses 2D Euclidean distance for "nearest"                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Algorithm 3: PICK_NEAREST_TO_GROUND

Finds the agent nearest to ground level (highest Y coordinate). Useful for finding food or toys on the floor.

### Algorithm 4: PICK_RANDOM_NEAREST_IN_X_DIRECTION

Balances proximity with variety:
1. Find 5 nearest agents in facing direction
2. Randomly select one from these 5

### Algorithm Selection by Category

```javascript
// Loaded from catalogue "Category Representative Algorithms"
const algorithm = CategorySystem.getCategoryAlgorithm(categoryId);

// Example configuration:
// Creatures (36-38): Algorithm 0 (nearest in direction)
// Food items:        Algorithm 3 (nearest to ground)
// Random machines:   Algorithm 1 (random selection)
```

---

## Attention System (IT Agent)

The **IT agent** is the creature's current focus of attention. The brain's attention lobe determines which category representative becomes IT.

### Attention Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ATTENTION FLOW                               │
│                                                                 │
│   Vision Lobe                                                   │
│   [cat 0][cat 1][cat 2]...[cat 39] ← Representative agents     │
│         │                                                       │
│         ▼                                                       │
│   Brain Processing                                              │
│         │                                                       │
│         ▼                                                       │
│   Attention Lobe                                                │
│   [   winner-takes-all competition   ]                          │
│         │                                                       │
│         ▼                                                       │
│   Winning Category ID                                           │
│         │                                                       │
│         ▼                                                       │
│   IT Agent = Representative of winning category                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### IT Agent Methods

```javascript
// Creature methods
creature.getItAgent()           // Returns currently attended agent
creature.setItAgent(agent)      // Set new attention target

// SensoryFaculty methods
sensory.getKnownAgent(categoryId)  // Get representative for category

// Motor Faculty processes attention
processBrainAttention(creature) {
    const winningId = brain.getWinningId('attn');
    const winningAgent = sensory.getKnownAgent(winningId);
    creature.setItAgent(winningAgent);
}
```

### Attention Override (URGE)

Scripts can force attention to a specific category:

```javascript
// URGE command forces attention
creature.setAttentionOverride(categoryId);

// In CAOS:
// urge writ targ 36 1.5 0.0 0.0  * Force attention to norns (category 36)
```

### Conversation Stability

To prevent attention flickering during interactions, the system implements **conversation stability**:

```javascript
// If an agent is no longer nearest but is still visible,
// it remains tracked to maintain conversation focus
if (currentRepresentative !== oldRepresentative) {
    if (isStillVisible(oldRepresentative)) {
        // Keep tracking old agent for stability
        return oldRepresentative;
    }
}
```

---

## Brain Input Lobes

The SensoryFaculty updates five brain input lobes with perception data:

### Situation Lobe (situ) - 9 Neurons

Information about the creature's own state:

| Neuron | Name | Value Range |
|--------|------|-------------|
| 0 | AGE_LEVEL | 0.0-1.0 (normalized by NUMAGES) |
| 1 | IN_VEHICLE | 1.0 if in vehicle, else 0.0 |
| 2 | CARRYING_SOMETHING | 1.0 if holding object |
| 3 | BEING_CARRIED | 1.0 if being carried |
| 4 | FALLING | 1.0 if not on ground |
| 5 | NEAR_OPPOSITE_SEX | Distance normalized (0.0-1.0) |
| 6 | MUSIC_MOOD | From music system |
| 7 | MUSIC_THREAT | Threat level from music |
| 8 | SELECTED_CREATURE | 1.0 if user selected |

### Detail Lobe (detl) - 11 Neurons

Information about the **IT agent** (current attention focus):

| Neuron | Name | Description |
|--------|------|-------------|
| 0 | IT_IS_BEING_CARRIED_BY_ME | 1.0 if creature is carrying IT |
| 1 | IT_IS_BEING_CARRIED_BY_SOMEONE_ELSE | 1.0 if another agent carries IT |
| 2 | IT_NEARNESS | Distance: (255-dist*2)/255, max 128px |
| 3 | IT_IS_CREATURE | 1.0 if IT is a creature |
| 4 | IT_IS_MYSIBLING | 1.0 if IT is sibling |
| 5 | IT_IS_MYPARENT | 1.0 if IT is parent |
| 6 | IT_IS_MYCHILD | 1.0 if IT is child |
| 7 | IT_IS_OPPOSITESEX | 1.0 if opposite sex, same species |
| 8 | IT_IS_OF_THIS_SIZE | (width + height) / 500.0 |
| 9 | IT_IS_SMELLING_THIS_MUCH | CA emission value |
| 10 | IT_IS_FALLING | 1.0 if IT is falling |

### Drive Lobe (driv) - 20 Neurons

One neuron per drive, normalized 0.0-1.0:

| Neuron | Drive |
|--------|-------|
| 0 | Pain |
| 1 | Hunger for protein |
| 2 | Hunger for carbs |
| 3 | Hunger for fat |
| 4 | Coldness |
| 5 | Hotness |
| 6 | Tiredness |
| 7 | Sleepiness |
| 8 | Loneliness |
| 9 | Overcrowded |
| 10-19 | Additional drives |

### Smell Lobe (smll) - 40 Neurons

One neuron per category, representing CA (cellular automata) smell values:

```
┌─────────────────────────────────────────────────────────────────┐
│                      SMELL LOBE                                  │
│                                                                 │
│   [cat 0][cat 1][cat 2]...[cat 39]                             │
│      │                                                          │
│      └── CA property value for this category (0.0-1.0)         │
│                                                                 │
│   CRITICAL: Self-smell correction                               │
│   ─────────────────────────────                                 │
│   If creature's own category, subtract own emission:           │
│                                                                 │
│   caValue = getRoomPropertyMinusContribution(roomId, ca, self) │
│                                                                 │
│   This prevents creatures from being overwhelmed by their      │
│   own smell signature                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Vision Lobe (visn) - 80 Neurons

Two neurons per category (X and Y displacement to representative):

```
┌─────────────────────────────────────────────────────────────────┐
│                      VISION LOBE                                 │
│                                                                 │
│   Neurons 0-39:  X displacement (normalized -1.0 to 1.0)       │
│   Neurons 40-79: Y displacement (normalized -1.0 to 1.0)       │
│                                                                 │
│   Calculation:                                                  │
│   ────────────                                                  │
│   normalizedX = (agentX - creatureX) / VISUAL_RANGE            │
│   normalizedY = (agentY - creatureY) / VISUAL_RANGE            │
│   clamped to [-1.0, 1.0]                                       │
│                                                                 │
│   Example:                                                      │
│   Agent at (600, 300), Creature at (400, 300)                  │
│   X = (600-400)/512 = 0.39  (agent is to the right)           │
│   Y = (300-300)/512 = 0.0   (same height)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Smell System

Creatures detect environmental odors through the **Cellular Automata (CA) system**.

### CA Property Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                    CA TO SMELL MAPPING                           │
│                                                                 │
│   Room CA Properties (20 total)                                │
│   ├── CA 0-11:  Environmental (nutrients, temperature, etc.)  │
│   └── CA 12-19: Creature smells                                │
│                                                                 │
│   Default Creature Smell Mapping:                              │
│   ──────────────────────────────                               │
│   CA 12 → Category 36 (Norn smell)                            │
│   CA 13 → Category 37 (Grendel smell)                         │
│   CA 14 → Category 38 (Ettin smell)                           │
│   CA 15 → Category 30 (Norn home)                             │
│   CA 16 → Category 31 (Grendel home)                          │
│   CA 17 → Category 32 (Ettin home)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### SMAP Command

Configure CA-to-category mappings via CAOS:

```caos
* Map CA index 12 to norn smell (family 2, genus 1, species 0)
smap 12 2 1 0

* Map CA index 15 to food items (family 2, genus 5, species 0)
smap 15 2 5 0
```

### Smell Detection Process

```javascript
updateSmellLobe() {
    const roomId = creature.getCurrentRoomId();

    for (let catId = 0; catId < 40; catId++) {
        const caIndex = getCaIndexForCategory(catId);

        // Get room's CA value for this smell
        let caValue = mapManager.getRoomProperty(roomId, caIndex);

        // CRITICAL: Subtract own contribution to avoid self-smell
        if (catId === creature.myCategoryId) {
            caValue = mapManager.getRoomPropertyMinusContribution(
                roomId, caIndex, creature
            );
        }

        // Set smell lobe neuron
        brain.setInput('smll', catId, caValue);
    }
}
```

---

## Hearing System

Creatures detect sounds within their **hearing range** (default 800 pixels).

### Hearing Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HEARING SYSTEM                               │
│                                                                 │
│   Sound Source                                                  │
│       │                                                         │
│       ▼                                                         │
│   Distance Check (800px range)                                 │
│       │                                                         │
│       ▼                                                         │
│   Sound Type Classification                                    │
│   ├── CREATURE_SPEECH  → Language processing                   │
│   ├── IMPACT           → Stimulus trigger                      │
│   ├── MACHINERY        → Machine awareness                     │
│   ├── MUSIC            → Mood effects                          │
│   └── AMBIENT          → Environmental awareness               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Hearing Constants

```javascript
DEFAULT_HEARING_RANGE = 800    // Pixels
```

### Sound Processing

```javascript
updateAuditoryPerception() {
    const activeSounds = world.soundManager.getActiveSounds();

    for (const sound of activeSounds) {
        const distance = calculateDistance(creature, sound.position);

        if (distance <= DEFAULT_HEARING_RANGE) {
            this.processAuditoryStimulus(sound);
        }
    }
}
```

---

## Touch System

Creatures detect physical contact through **bounding box collision**.

### Touch Detection

```
┌─────────────────────────────────────────────────────────────────┐
│                      TOUCH DETECTION                             │
│                                                                 │
│   ┌─────────┐                                                   │
│   │         │                                                   │
│   │ Creature│                                                   │
│   │    ┌────┼────┐                                              │
│   │    │OVER│    │ Agent                                       │
│   └────┼────┘    │                                              │
│        │  LAP   │                                              │
│        └─────────┘                                              │
│                                                                 │
│   Touch = Bounding boxes overlap (AABB collision)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Touch Properties

```javascript
myTouchSensitivity = 1.0     // Configurable sensitivity
myTouchCooldown = 10         // Ticks between touch detections
TOUCH_COOLDOWN_TICKS = 10    // Default cooldown
```

### STIM TACT Command

Broadcast stimuli to creatures touching the agent:

```caos
* Send stimulus 50 to all creatures touching OWNR
stim tact 50 1.0
```

---

## Stimulus System

External events trigger **stimuli** that creatures perceive and process.

### Stimulus Structure

```javascript
{
    fromAgent: agentRef,           // Source of stimulus
    toCreature: creatureRef,       // Target creature
    stimulusType: StimulusType,    // SHOU, SIGN, TACT, WRIT
    strengthMultiplier: 1.0,

    // Language learning (ORDR)
    incomingSentence: '',
    verbIdToStim: -1,
    nounIdToStim: -1,

    // Attention/decision nudges (URGE)
    verbStim: 0.0,                 // Push toward action
    nounStim: 0.0,                 // Push toward attention

    // Chemical adjustments (SWAY)
    chemicalsToAdjust: Int32Array(4),
    adjustments: Float32Array(4)
}
```

### Stimulus Types

| Type | Range | Description |
|------|-------|-------------|
| `SHOU` | 800 pixels | Shouted stimulus (hearing range) |
| `SIGN` | 512 pixels | Visual stimulus (visible creatures) |
| `TACT` | Contact | Touch stimulus (overlapping) |
| `WRIT` | Direct | Written directly to specific creature |

### Built-in Stimuli (256 total)

| ID | Name | Trigger |
|----|------|---------|
| 0 | DISAPPOINT | User shows disappointment |
| 1 | POINTERPAT | User pets creature |
| 2 | CREATUREPAT | Creature pats creature |
| 3 | POINTERSLAP | User slaps creature |
| 4 | CREATURESLAP | Creature slaps creature |
| 7 | BUMP | Collision with wall |
| 16 | APPROACH | Approaching something |
| 17 | RETREAT | Retreating from something |
| 18 | GET | Picking up object |
| 19 | DROP | Dropping object |
| 80-82 | EATEN_* | Eating plant/fruit/food |
| 97 | PLAYED_WITH_TOY | Playing with toy |

### STIM Commands

```caos
* Broadcast stimulus to creatures in hearing range
stim shou 50 1.0

* Broadcast stimulus to visible creatures
stim sign 50 1.0

* Broadcast stimulus to touching creatures
stim tact 50 1.0

* Direct stimulus to specific creature
stim writ targ 50 1.0
```

---

## Friend/Foe System (Social Perception)

Creatures track social relationships with other creatures.

### Social Memory

```javascript
myFriendsAndFoeHandles[]        // Agent references (limited slots)
myFriendsAndFoeMonikers[]       // Creature unique identifiers
myFriendsAndFoeLastEncounters[] // Tick numbers of last meeting
```

### Kinship-Based Initial Values

```
┌─────────────────────────────────────────────────────────────────┐
│               KINSHIP INITIAL RELATIONSHIP VALUES                │
│                                                                 │
│   Relationship          Initial STATE_VAR                       │
│   ─────────────         ─────────────────                       │
│   Parent/Child          0.80  (instant love)                   │
│   Sibling               0.225 (moderate affection)             │
│   Same Species          0.175 (mild affection)                 │
│   Different Species    -1.0   (learning mode)                  │
│                                                                 │
│   Positive values = friend                                     │
│   Negative values = foe                                        │
│   -1.0 = unlearned (will form opinion through interaction)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Friend/Foe Lobe (forf)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRIEND/FOE LOBE                               │
│                                                                 │
│   One neuron per tracked creature                              │
│   Value: -1.0 (enemy) to 1.0 (friend)                         │
│                                                                 │
│   Affects decision making:                                     │
│   • High friend value → less likely to hit                    │
│   • Low friend value → more aggressive                        │
│   • Dendrite migration strengthens friend→decision links      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Perception Update Cycle

The SensoryFaculty updates all perception channels each tick:

```javascript
update() {
    // Update brain input lobes
    this.updateSituationLobe();    // Creature state
    this.updateDetailLobe();       // IT agent properties
    this.updateDriveLobe();        // 20 drive levels
    this.updateSmellLobe();        // CA properties (40 categories)
    this.updateVisionLobe();       // X,Y displacement (80 neurons)
    this.updateFriendFoeLobe();    // Social relationships

    // Process incoming stimuli
    this.updateAuditoryPerception();
    this.updateTouchPerception();
}
```

---

## Perception Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPLETE PERCEPTION DATA FLOW                       │
│                                                                 │
│   WORLD                                                         │
│   ├── Agents (positions, properties)                           │
│   ├── CA Properties (room smells)                              │
│   ├── Sounds (position, type)                                  │
│   └── Collisions (touch detection)                             │
│         │                                                       │
│         ▼                                                       │
│   SENSORY FACULTY                                              │
│   ├── Vision: Filter by range → Categorize → Select reps      │
│   ├── Smell: Read CA → Subtract self → Normalize              │
│   ├── Hearing: Filter by range → Classify sound               │
│   └── Touch: AABB collision → Trigger stimulus                │
│         │                                                       │
│         ▼                                                       │
│   BRAIN INPUT LOBES (160 total neurons)                        │
│   ├── visn[80]:  Category X,Y displacements                   │
│   ├── smll[40]:  Category smell values                        │
│   ├── driv[20]:  Drive levels                                 │
│   ├── detl[11]:  IT agent properties                          │
│   └── situ[9]:   Creature state                               │
│         │                                                       │
│         ▼                                                       │
│   BRAIN PROCESSING                                             │
│   ├── Stimulus lobe activation                                 │
│   ├── Concept formation                                        │
│   └── Decision/Attention competition                           │
│         │                                                       │
│         ▼                                                       │
│   OUTPUT                                                        │
│   ├── IT Agent (attention focus)                              │
│   └── Decision (action to take)                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `SensoryFaculty.js` | Main perception processing (2,148 lines) |
| `CategorySystem.js` | Agent category classification |
| `RepresentativeSelector.js` | Vision algorithm implementations |
| `PerceptionConstants.js` | Range, count, and timing constants |
| `Stimulus.js` | Stimulus data structure |
| `MotorFaculty.js` | Attention processing (IT agent) |

---

## Related Articles

- [Creature Faculties](#/article/creature-faculties) - Overview of all 9 faculties
- [Brain & Neural Networks](#/article/brain-system) - How perception feeds into decisions
- [Biochemistry System](#/article/biochemistry-system) - Drive system that influences attention
