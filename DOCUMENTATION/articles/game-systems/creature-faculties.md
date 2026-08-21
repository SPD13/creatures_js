# Creature Faculties

Creatures in Creatures 3 are organized into **9 specialized subsystems called Faculties**. Each faculty manages a distinct aspect of creature behavior, from sensing the world to reproducing. This modular architecture enables complex emergent behaviors while maintaining organized, maintainable code.

## Faculty Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CREATURE FACULTY SYSTEM                      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Creature                              │  │
│   │  ┌─────────────────────────────────────────────────────┐│  │
│   │  │              myFaculties[9]                         ││  │
│   │  │                                                     ││  │
│   │  │  [0] SENSORY      [1] BRAIN       [2] MOTOR        ││  │
│   │  │  [3] LINGUISTIC   [4] BIOCHEMISTRY [5] REPRODUCTIVE││  │
│   │  │  [6] EXPRESSIVE   [7] MUSIC       [8] LIFE         ││  │
│   │  │                                                     ││  │
│   │  └─────────────────────────────────────────────────────┘│  │
│   │                          │                               │  │
│   │                          ▼                               │  │
│   │  ┌─────────────────────────────────────────────────────┐│  │
│   │  │              Locus System                           ││  │
│   │  │         (Inter-faculty Communication)               ││  │
│   │  └─────────────────────────────────────────────────────┘│  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Faculty Base Class

All faculties inherit from a common base class that provides core functionality:

```javascript
class Faculty {
    constructor(creature) {
        this.myCreature = creature;      // Reference to owning creature
        this.myLocusAddress = 0;         // Base address in locus system
        this.myBrain = null;             // Brain reference (if needed)
        this.myAge = 0;                  // Faculty-specific age tracking
    }

    // Core lifecycle methods
    readFromGenome(genome) { }           // Initialize from genetic data
    update() { }                         // Called each update cycle
    processInput(locus, value) { }       // Handle locus input
    getOutput(locus) { }                 // Provide locus output
}
```

### Key Methods

| Method | Purpose |
|--------|---------|
| `readFromGenome(genome)` | Initialize faculty from creature's genetic data |
| `update()` | Process one tick of faculty logic |
| `processInput(locus, value)` | Handle incoming signals via locus |
| `getOutput(locus)` | Provide output values to other faculties |

---

## The 9 Faculties

### 0. SENSORY Faculty

**Purpose:** Perceive the world and provide information to other faculties.

```
┌─────────────────────────────────────────────────────────────────┐
│                      SENSORY FACULTY                             │
│                                                                 │
│   Environment ──► Perception ──► Brain (Stimulus Lobe)         │
│                                                                 │
│   Detects:                                                      │
│   • Visible agents (creatures, food, toys, etc.)               │
│   • Environmental conditions (temperature, light)              │
│   • Auditory stimuli (creature vocalizations)                  │
│   • Tactile information (what's being touched)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Scan environment for nearby agents
- Classify detected objects by category
- Feed perception data to the brain's stimulus lobe
- Track attention (what creature is currently focused on)

**Key Properties:**
- `myAttentionId` - Currently focused agent
- `myVisibleAgents[]` - Agents in perception range
- `mySensoryData{}` - Categorized perception data

---

### 1. BRAIN Faculty

**Purpose:** Neural network processing for decision-making and learning.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BRAIN FACULTY                             │
│                                                                 │
│   Inputs:                        Outputs:                       │
│   • Sensory data           ──►   • Decisions (actions)         │
│   • Drive levels           ──►   • Attention focus             │
│   • Chemical signals       ──►   • Learning updates            │
│                                                                 │
│   Contains:                                                     │
│   • Multiple neural lobes (Stimulus, Concept, Decision, etc.) │
│   • Dendrite connections                                       │
│   • SVRule processing                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Process neural lobe updates
- Execute SVRules for dendrite learning
- Determine winning decisions via winner-takes-all
- Manage attention and focus

**Key Components:**
- `myLobes[]` - Array of neural lobes
- `myNeurons[]` - Individual neuron states
- `myDendrites[]` - Connections between neurons

See also: [Brain & Neural Networks](#/article/brain-system)

---

### 2. MOTOR Faculty

**Purpose:** Control physical movement and actions.

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOTOR FACULTY                             │
│                                                                 │
│   Brain Decision ──► Motor Processing ──► Physical Movement    │
│                                                                 │
│   Actions:                                                      │
│   • Walking (direction, gait)                                  │
│   • Approaching targets                                        │
│   • Activating agents                                          │
│   • Eating, pushing, pulling, hitting                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Execute movement decisions from brain
- Control walking direction and speed
- Manage gait (walking animation style)
- Trigger action scripts (eat, push, pull, hit, etc.)

**Key Properties:**
- `myGait` - Current walking animation style
- `myDirection` - Facing direction (left/right)
- `myWalking` - Whether currently walking
- `myActionInProgress` - Current action being performed

**Motor Actions:**
| Action | Description |
|--------|-------------|
| `WALK` | Move in current direction |
| `APPROACH` | Walk toward target |
| `RETREAT` | Walk away from target |
| `ACTIVATE1/2` | Push/Pull target |
| `EAT` | Consume food item |
| `HIT` | Attack target |

---

### 3. LINGUISTIC Faculty

**Purpose:** Process and generate language.

```
┌─────────────────────────────────────────────────────────────────┐
│                     LINGUISTIC FACULTY                           │
│                                                                 │
│   Input:                          Output:                       │
│   • Heard words           ──►     • Spoken words               │
│   • Learning events       ──►     • Vocabulary updates         │
│                                                                 │
│   Vocabulary Structure:                                         │
│   • Word ↔ Concept mappings                                    │
│   • Category associations                                      │
│   • Sentence fragments                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Maintain vocabulary (word ↔ concept mappings)
- Process heard speech
- Generate spoken output
- Learn new words through association

**Key Properties:**
- `myVocabulary[]` - Known word/concept pairs
- `myLastHeard` - Most recently heard word
- `mySpeechQueue[]` - Words to speak

---

### 4. BIOCHEMISTRY Faculty

**Purpose:** Simulate internal chemistry and metabolism.

```
┌─────────────────────────────────────────────────────────────────┐
│                    BIOCHEMISTRY FACULTY                          │
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │   Organs    │───►│  Reactions  │───►│  Chemicals  │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│          │                  │                   │               │
│          ▼                  ▼                   ▼               │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │  Receptors  │◄──►│   Emitters  │◄──►│    Loci     │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Process chemical reactions in organs
- Manage 256 chemical concentrations
- Handle receptors (chemicals → loci)
- Handle emitters (loci → chemicals)
- Maintain homeostasis

**Key Properties:**
- `myChemicals[256]` - Chemical concentrations
- `myOrgans[]` - Organ instances
- `myReactions[]` - Active reactions
- `myReceptors[]` - Chemical receptors
- `myEmitters[]` - Chemical emitters

See also: [Biochemistry System](#/article/biochemistry-system)

---

### 5. REPRODUCTIVE Faculty

**Purpose:** Handle reproduction and genetic inheritance.

```
┌─────────────────────────────────────────────────────────────────┐
│                    REPRODUCTIVE FACULTY                          │
│                                                                 │
│   Pregnancy Cycle:                                              │
│   1. Fertilization (egg + sperm genes combine)                 │
│   2. Pregnancy period (chemical-driven)                        │
│   3. Birth (new creature created)                              │
│                                                                 │
│   Genetic Operations:                                           │
│   • Gene crossing                                              │
│   • Mutation                                                   │
│   • Gender determination                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Track fertility/pregnancy state
- Manage genetic combination during conception
- Handle pregnancy duration
- Trigger birth events
- Pass genetic mutations

**Key Properties:**
- `myPregnant` - Pregnancy state
- `myPregnancyProgress` - Time until birth
- `myMateGenome` - Partner's genetic data
- `myFertility` - Current fertility level

---

### 6. EXPRESSIVE Faculty

**Purpose:** Control facial expressions and emotional display.

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESSIVE FACULTY                           │
│                                                                 │
│   Drive Levels ──► Expression Selection ──► Facial Animation   │
│                                                                 │
│   Expressions:                                                  │
│   • Normal    • Happy     • Sad                                │
│   • Angry     • Scared    • Tired                              │
│   • Sleepy    • Ill       • Dreamy                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Select appropriate facial expression based on emotional state
- Animate expression transitions
- Reflect internal drive states visually
- Handle special expressions (eating, speaking)

**Key Properties:**
- `myCurrentExpression` - Active expression ID
- `myExpressionTimer` - Duration of current expression
- `myDriveInfluences[]` - How drives affect expression

---

### 7. MUSIC Faculty

**Purpose:** Generate and respond to musical sounds.

```
┌─────────────────────────────────────────────────────────────────┐
│                        MUSIC FACULTY                             │
│                                                                 │
│   Functions:                                                    │
│   • Vocalization sounds (happy chirps, sad moans)              │
│   • Response to music in environment                           │
│   • Musical instrument interaction                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Generate creature vocalizations
- Process heard music/sounds
- Trigger audio feedback for emotional states
- Handle musical instrument interactions

---

### 8. LIFE Faculty

**Purpose:** Manage lifecycle, aging, and death.

```
┌─────────────────────────────────────────────────────────────────┐
│                         LIFE FACULTY                             │
│                                                                 │
│   Lifecycle Stages:                                             │
│   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐            │
│   │  Baby  │──►│ Child  │──►│ Adolesc│──►│ Youth  │            │
│   └────────┘   └────────┘   └────────┘   └────────┘            │
│                                              │                  │
│                                              ▼                  │
│   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐            │
│   │Ancient │◄──│Senile  │◄──│  Old   │◄──│ Adult  │            │
│   └────────┘   └────────┘   └────────┘   └────────┘            │
│       │                                                         │
│       ▼                                                         │
│   ┌────────┐                                                    │
│   │ Death  │                                                    │
│   └────────┘                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Track creature age
- Manage lifecycle stage transitions
- Handle death conditions
- Control aging effects on other faculties
- Manage lifespan genetics

**Lifecycle Stages:**
| Stage | ID | Description |
|-------|------|-------------|
| Baby | 0 | Newborn, limited mobility |
| Child | 1 | Learning phase |
| Adolescent | 2 | Growing, developing |
| Youth | 3 | Nearly mature |
| Adult | 4 | Fully mature, can reproduce |
| Old | 5 | Aging effects begin |
| Senile | 6 | Significant aging effects; ageing past this stage is death by old age |

There are seven stages, not eight: `NUMAGES = 7`, and advancing beyond Senile kills the creature
outright. See [Age and Lifecycle](age-and-lifecycle.md).

**Key Properties:**
- `myAge` - Current age in ticks
- `myLifeStage` - Current lifecycle stage
- `myAgingRate` - How fast creature ages
- `myDeathThreshold` - Age at which death occurs

---

## Locus System

The **Locus System** is the central communication hub between faculties. It provides a standardized way for faculties to read and write shared state.

### Locus Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       LOCUS SYSTEM                               │
│                                                                 │
│   ┌─────────────┐         ┌─────────────┐                      │
│   │  Faculty A  │──write──►   Locus    │◄──read──│  Faculty B │
│   └─────────────┘         │   Array    │         └─────────────┘
│                           │  [0..255]  │                        │
│                           └─────────────┘                        │
│                                 │                                │
│                     ┌───────────┼───────────┐                   │
│                     ▼           ▼           ▼                   │
│               ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│               │Receptors│ │Emitters │ │ Neurons │              │
│               └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Locus Categories

| Category | Locus Range | Purpose |
|----------|-------------|---------|
| Drives | 0-19 | Hunger, tiredness, boredom, etc. |
| Organs | 20-39 | Organ health and function |
| Receptors | 40-79 | Chemical receptor outputs |
| Emitters | 80-119 | Chemical emitter inputs |
| Brain | 120-159 | Neural lobe I/O |
| Creature | 160-199 | General creature state |
| Actions | 200-239 | Motor action states |
| Stimulus | 240-255 | External stimulus inputs |

### Usage Example

```javascript
// Faculty writes to locus
this.myCreature.setLocus(LOCUS_HUNGER_DRIVE, hungerLevel);

// Other faculty reads from locus
const hunger = this.myCreature.getLocus(LOCUS_HUNGER_DRIVE);

// Biochemistry receptors read from loci
receptor.inputValue = creature.getLocus(receptor.locusAddress);

// Biochemistry emitters write to loci
creature.setLocus(emitter.locusAddress, emitter.outputValue);
```

---

## Update Cycle

Every creature runs its faculties **on a 4-tick gate**, not on a per-faculty rota: on the one tick
in four that matches the creature's own offset, all nine faculties update in order, and on the
other three the creature does nothing but hold hands with the pointer if it is being carried.

### The 4-tick gate

```
if ((myUpdateTicks % 4) !== myUpdateTickOffset) → hold hands, return
if the creature is dead                        → return (a dead creature freezes entirely)
otherwise → update all nine faculties in order:
    SENSORY → BRAIN → MOTOR → LINGUISTIC → BIOCHEMISTRY
            → REPRODUCTIVE → EXPRESSIVE → MUSIC → LIFE
```

Two details follow from this:

- **The offset is per creature**, assigned at construction, so a population's creature updates are
  spread evenly across the four ticks rather than all landing on the same one. That is where the
  load-spreading comes from — not from splitting one creature's faculties across ticks.
- **Each faculty is handed `deltaTime * 4`**, compensating for the three ticks it sat out. This is
  also why `myAgeInTicks` advances by 4 per creature update.

The order matters: perception runs before the brain that consumes it, the brain before the motor
system that executes its decision, and LIFE last, so a death detected this tick takes effect with
every other faculty already updated.

Faculties can be individually disabled at runtime (Docking Station's `SOUL`, `MIND`, `MOTR`); a
disabled faculty is skipped by this loop and everything else still runs.

---

## Faculty Interactions

### Example: Seeing Food and Eating

```
┌─────────────────────────────────────────────────────────────────┐
│              FACULTY INTERACTION EXAMPLE                         │
│                                                                 │
│   1. SENSORY detects food agent                                │
│      └──► Sets stimulus locus for "food visible"               │
│                                                                 │
│   2. BRAIN processes stimulus                                  │
│      ├──► Stimulus lobe activates "food" concept               │
│      ├──► Decision lobe considers "eat" action                 │
│      └──► Winning decision: "eat"                              │
│                                                                 │
│   3. MOTOR receives decision                                   │
│      ├──► Approaches food agent                                │
│      └──► Executes "eat" action script                         │
│                                                                 │
│   4. BIOCHEMISTRY receives stimulus                            │
│      ├──► Hunger drive decreases                               │
│      ├──► Nutrition chemicals injected                         │
│      └──► Satisfaction chemical released                       │
│                                                                 │
│   5. EXPRESSIVE updates                                        │
│      └──► Changes to "happy" expression                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `Faculty.js` | Base faculty class |
| `SensoryFaculty.js` | Environmental perception |
| `BrainFaculty.js` | Neural processing (see Brain.js) |
| `MotorFaculty.js` | Movement and actions |
| `LinguisticFaculty.js` | Language processing |
| `BiochemistryFaculty.js` | Chemistry simulation |
| `ReproductiveFaculty.js` | Reproduction handling |
| `ExpressiveFaculty.js` | Facial expressions |
| `MusicFaculty.js` | Sound/music handling |
| `LifeFaculty.js` | Aging and lifecycle |
| `Creature.js` | Faculty container and coordination |

---

## Related Articles

- [Brain & Neural Networks](#/article/brain-system) - Detailed brain architecture
- [Biochemistry System](#/article/biochemistry-system) - Chemistry simulation
- [Instinct System](#/article/instinct-system) - Hardwired behaviors
