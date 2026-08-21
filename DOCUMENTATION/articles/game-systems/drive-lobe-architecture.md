# [driv] Drive Lobe Architecture

This article provides a deep-dive into the drive lobe (`driv`) — the brain lobe responsible for encoding the creature's current motivational state. The drive lobe is the primary bridge between the biochemistry system and the neural network, translating chemical concentrations into neuron activations that influence decision-making. It covers the 20 drive neurons, their biochemical origins, and how the drive lobe feeds into the creature's action selection.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              DRIVE LOBE DATA FLOW (END-TO-END)                   │
│                                                                 │
│   Biochemistry System                                           │
│   ├── Reactions produce/consume chemicals                      │
│   ├── Emitters convert locus values → chemicals                │
│   └── Receptors convert chemicals → locus values               │
│       │                                                         │
│       ▼                                                         │
│   Drive Loci (myDriveLoci[20])                                  │
│   ├── Written by receptors monitoring drive chemicals           │
│   ├── Bidirectional: emitters also read from drive loci         │
│   └── Shared memory between receptor input and emitter output  │
│       │                                                         │
│       ▼                                                         │
│   Creature.getDriveLevel(i)                                     │
│   └── Returns myDriveLoci[i] (0.0 - 1.0)                      │
│       │                                                         │
│       ▼                                                         │
│   SensoryFaculty.updateDriveLobe()                              │
│   └── brain.setInput('driv', i, getDriveLevel(i)) × 20        │
│       │                                                         │
│       ▼                                                         │
│   Drive Lobe ("driv") — 20 neurons                              │
│   └── SVRule processes accumulated inputs                      │
│       │                                                         │
│       ▼                                                         │
│   Tracts propagate to downstream lobes                          │
│   └── Decision lobe (action selection based on motivation)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What the Drive Lobe Represents

Drives are the creature's **motivational signals** — internal states that push the creature toward actions that satisfy biological needs. A hungry creature has a high "hunger" drive that motivates it to seek food. A lonely creature has a high "loneliness" drive that motivates social interaction.

The drive lobe is unique among input lobes because its data comes from the **biochemistry system** rather than from direct world observation. While the vision lobe sees agents and the situation lobe reads physical state, the drive lobe reflects the creature's internal chemistry — the result of metabolic processes, receptor/emitter cascades, and chemical reactions.

---

## The Biochemistry-to-Brain Pipeline

Understanding the drive lobe requires understanding how chemical concentrations become neuron activations.

### Step 1: Drive Chemicals

Each drive has an associated **chemical** in the creature's bloodstream. These chemicals are defined in the `"drive_chemical_numbers"` catalogue array:

| Drive Index | Chemical ID | Chemical Name | Drive Name |
|------------|------------|---------------|------------|
| 0 | 148 | Pain | Hurt |
| 1 | 149 | Hunger for protein | Hungry for protein |
| 2 | 150 | Hunger for carbohydrate | Hungry for starch |
| 3 | 151 | Hunger for fat | Hungry for fat |
| 4 | 152 | Coldness | Cold |
| 5 | 153 | Hotness | Hot |
| 6 | 154 | Tiredness | Tired |
| 7 | 155 | Sleepiness | Sleepy |
| 8 | 156 | Loneliness | Lonely |
| 9 | 157 | Crowded | Crowded |
| 10 | 158 | Fear | Scared |
| 11 | 159 | Boredom | Bored |
| 12 | 160 | Anger | Angry |
| 13 | 161 | Sex drive | Friendly |
| 14 | 162 | Comfort | Homesick |
| 15 | 199 | Up | Low down |
| 16 | 200 | Down | High up |
| 17 | 201 | Exit | Trapped |
| 18 | 202 | Enter | Trapped |
| 19 | 203 | Wait | Patient |

> **Note**: Drives 0-14 are the core biological drives with chemicals in the 148-162 range. Drives 15-19 are **navigation drives** with chemicals in the 199-203 range, used for spatial behavior (wanting to go up, down, exit, enter, or wait).

### Step 2: Receptors Write to Drive Loci

Biochemical **receptors** monitor the drive chemicals and write their values to the creature's drive loci. The locus address for drives is `1/5/n` (Organ=Creature, Tissue=Drives, Locus=drive index):

```
┌─────────────────────────────────────────────────────────────────┐
│            RECEPTOR → DRIVE LOCUS PIPELINE                       │
│                                                                 │
│   Chemical 148 (Pain)                                           │
│       │                                                         │
│       ▼                                                         │
│   Receptor (monitors chemical 148)                              │
│   ├── Threshold: 0.0 (respond to any amount)                   │
│   ├── Gain: 1.0 (proportional response)                        │
│   └── Target: Locus 1/5/0 (Creature/Drives/Pain)              │
│       │                                                         │
│       ▼                                                         │
│   myDriveLoci[0] = receptor output                              │
│       │                                                         │
│       ▼                                                         │
│   getDriveLevel(0) → returns myDriveLoci[0]                    │
│       │                                                         │
│       ▼                                                         │
│   brain.setInput('driv', 0, value)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The drive loci are **bidirectional** — receptors write to them (chemistry → behavior) and emitters read from them (behavior → chemistry). This creates feedback loops where high drive levels can trigger chemical emissions that in turn affect other systems.

### Step 3: SensoryFaculty Copies to Brain

The `SensoryFaculty.updateDriveLobe()` simply copies each drive locus value into the corresponding brain neuron:

```text
// SensoryFaculty
// DRIVE LOBE:
// Copy current drive levels from receptors to DRIVE_LOBE neurons
for i = 0 to NUMDRIVES - 1
    brain.SetInput("driv", i, creature.GetDriveLevel(i))
```

```javascript
// JS SensoryFaculty.js:291-296
updateDriveLobe(brain) {
    for (let i = 0; i < this.myNumDrives; i++) {
        if (this.myCreature.getDriveLevel) {
            brain.setInput('driv', i, this.myCreature.getDriveLevel(i));
        }
    }
}
```

This is the simplest of all lobe update functions — a direct copy of 20 values from the creature's drive loci into the brain's drive lobe neurons.

---

## Neuron Layout: 20 Drive Neurons

The drive lobe has exactly **20 neurons**, each representing a distinct motivational state. These names come from the Brain catalogue's `"Creature Drives"` array.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DRIVE LOBE NEURONS                             │
│                                                                 │
│   ── Core Biological Drives (chemicals 148-162) ──              │
│                                                                 │
│   Index  Drive Name              Chemical           Category    │
│   ─────  ──────────────────────  ─────────────────  ──────────  │
│   0      Hurt (Pain)             148 Pain            Physical   │
│   1      Hungry for protein      149 Protein hunger   Hunger    │
│   2      Hungry for starch       150 Carb hunger      Hunger    │
│   3      Hungry for fat          151 Fat hunger        Hunger    │
│   4      Cold                    152 Coldness         Physical   │
│   5      Hot                     153 Hotness          Physical   │
│   6      Tired                   154 Tiredness        Physical   │
│   7      Sleepy                  155 Sleepiness       Physical   │
│   8      Lonely                  156 Loneliness       Social     │
│   9      Crowded                 157 Crowded          Social     │
│   10     Scared                  158 Fear             Emotional  │
│   11     Bored                   159 Boredom          Emotional  │
│   12     Angry                   160 Anger            Emotional  │
│   13     Friendly (Sex drive)    161 Sex drive        Social     │
│   14     Homesick (Comfort)      162 Comfort          Emotional  │
│                                                                 │
│   ── Navigation Drives (chemicals 199-203) ──                   │
│                                                                 │
│   15     Low down                199 Up               Navigation │
│   16     High up                 200 Down             Navigation │
│   17     Trapped                 201 Exit             Navigation │
│   18     Trapped                 202 Enter            Navigation │
│   19     Patient                 203 Wait             Navigation │
│                                                                 │
│   All values: 0.0 (no drive) to 1.0 (maximum urgency)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Drive Categories

### Physical Drives (0, 4-7)

These drives reflect the creature's physical wellbeing:

- **Hurt** (0): Increases when injury chemical (148) is present. Injury comes from collisions, illness, or toxins. Motivates the creature to avoid painful situations.
- **Cold** (4): Increases when the creature is in a cold environment. Room temperature affects chemical production via CA (Cellular Automata) interactions.
- **Hot** (5): The inverse — increases in hot environments.
- **Tired** (6): Accumulates over time through metabolic activity. Motivates resting.
- **Sleepy** (7): Distinct from tiredness — triggers the sleep cycle. When high enough, the creature falls asleep and enters REM for instinct processing.

### Hunger Drives (1-3)

Creatures have three separate hunger types reflecting different nutrient needs:

- **Hungry for protein** (1): Increases as protein stores deplete. Satisfied by eating protein-rich food.
- **Hungry for starch** (2): Increases as carbohydrate stores deplete. Satisfied by eating starchy food.
- **Hungry for fat** (3): Increases as fat stores deplete. Satisfied by eating fatty food.

The three-hunger system means creatures must eat a **balanced diet** — eating only one food type leaves the other hunger drives unsatisfied.

### Social Drives (8-9, 13)

- **Lonely** (8): Increases when the creature hasn't interacted with others. Motivates approaching other creatures.
- **Crowded** (9): Increases when too many creatures are nearby. Motivates moving away. Acts as the inverse of loneliness.
- **Friendly / Sex drive** (13): Increases with reproductive hormones (progesterone, testosterone). Motivates approaching opposite-sex creatures of the same species.

### Emotional Drives (10-12, 14)

- **Scared** (10): Increases from fear chemical, triggered by threatening situations (slaps, grendels, loud noises). Motivates retreating.
- **Bored** (11): Increases when the creature lacks stimulation. Motivates exploring and interacting with objects.
- **Angry** (12): Increases from anger chemical. Can trigger aggressive behaviors like hitting.
- **Homesick / Comfort** (14): Related to environmental comfort. Motivates returning to familiar or comfortable areas.

### Navigation Drives (15-19)

These drives control spatial movement preferences:

- **Low down** (15): Driven by "Up" chemical (199). Motivates moving upward.
- **High up** (16): Driven by "Down" chemical (200). Motivates moving downward.
- **Trapped** (17-18): Driven by "Exit" (201) and "Enter" (202) chemicals. Motivates leaving or entering enclosed areas.
- **Patient** (19): Driven by "Wait" chemical (203). Motivates staying in place.

---

## How Drives Influence Behavior

### Decision Lobe Integration

The drive lobe's primary downstream connection is to the **decision lobe** (`decn`). Tracts carry weighted drive signals that combine with attention (what the creature is looking at) and detail (properties of that object) to select an action.

```
┌─────────────────────────────────────────────────────────────────┐
│              DRIVE → DECISION PIPELINE                           │
│                                                                 │
│   Drive Lobe ("driv")                                           │
│   [0: pain][1: hunger_p][2: hunger_c]...[19: wait]             │
│      │                                                          │
│      ├──── Tract ────► Decision Lobe ("decn")                  │
│      │                 ├── Combines drives + attention + detail │
│      │                 └── Winner-takes-all → action selection  │
│      │                                                          │
│      ├──── Tract ────► Concept Lobe                            │
│      │                 └── Associates drives with outcomes      │
│      │                                                          │
│      └──── (Read by other systems) ───►                        │
│            ├── MusicFaculty → mood/threat from drives           │
│            ├── LinguisticFaculty → express highest drive        │
│            └── ExpressiveFaculty → facial expression            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Drive-Action Example

A typical decision cycle:

1. Protein hunger chemical (149) rises as protein is consumed by metabolism
2. Receptor writes hunger level to `myDriveLoci[1]`
3. `updateDriveLobe()` copies `myDriveLoci[1]` → `brain.setInput('driv', 1, value)`
4. Drive lobe neuron 1 activates with the hunger value
5. Tract propagates hunger signal to decision lobe
6. Decision lobe combines hunger + "food is visible" (attention) + "food is nearby" (detail)
7. Winner-takes-all selects "approach" or "eat" action
8. MotorFaculty executes the chosen action script

### Drives Beyond the Brain

Drive levels are also read directly by several faculties without going through the brain:

- **MusicFaculty**: Computes `mood()` from a weighted sum of the first 14 drives. Computes `threat()` directly from `getDriveLevel(FEAR)`.
- **LinguisticFaculty**: Finds the highest drive to express in speech ("me hungry", "me scared").
- **ExpressiveFaculty**: Selects facial expressions based on weighted drive combinations (smiling when comfortable, frowning when in pain).

---

## The Biochemical Feedback Loop

Drives participate in a **closed-loop feedback** system:

```
┌─────────────────────────────────────────────────────────────────┐
│               DRIVE FEEDBACK LOOP                                │
│                                                                 │
│   1. Reactions produce drive chemicals                          │
│      (e.g., metabolism depletes glucose → hunger chemical ↑)   │
│                                                                 │
│   2. Receptors convert chemicals → drive loci                  │
│      (hunger chemical → myDriveLoci[1])                        │
│                                                                 │
│   3. SensoryFaculty copies drive loci → brain neurons          │
│      (myDriveLoci[1] → driv neuron 1)                          │
│                                                                 │
│   4. Brain selects action via decision lobe                    │
│      (high hunger + food visible → "eat")                      │
│                                                                 │
│   5. Action script runs, applying stimulus                     │
│      (eating food → stimulus adds nutrients)                   │
│                                                                 │
│   6. Nutrients satisfy hunger via reactions                     │
│      (protein consumed → hunger chemical ↓)                    │
│                                                                 │
│   7. Lower chemical → lower drive → less motivation to eat     │
│      (feedback loop completes)                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This feedback loop is what gives creatures their **emergent behavior** — they don't have hardcoded "eat when hungry" logic. Instead, biochemical processes naturally raise hunger chemicals, which raise drive levels, which bias the brain toward food-seeking actions, which trigger stimuli that add nutrients, which reduce the hunger chemical. The creature "learns" that eating reduces hunger through reinforcement.

---

## Learning Integration

When a stimulus adjusts a drive chemical, the SensoryFaculty also writes to learning lobes to enable association:

```text
// SensoryFaculty
// If the adjusted chemical is a drive chemical:
drive = GetDriveNumberOfChemical(whichChemical)
if drive != -1
    // Write to response lobe (what happened) or proximity lobe (what was nearby)
    brain.SetInput("resp", drive, adjustment)  // or "prox"
```

This means drive changes are recorded in the brain's learning lobes, allowing the creature to build associations: "when I ate that food (attention), my hunger went down (drive change) → eating food is good".

---

## Update Timing

The drive lobe is updated by `SensoryFaculty.updateDriveLobe()`, which runs as the **third** lobe update in the sensory cycle.

### Update Sequence

1. `updateSituationLobe()` — creature's own state (9 neurons)
2. `updateDetailLobe()` — IT agent properties (11 neurons)
3. **`updateDriveLobe()`** — biochemical drive levels (20 neurons)
4. `updateSmellLobe()` — CA smell values per category (40 neurons)
5. `updateVisionLobe()` — X displacement per category (40 neurons)

### Timing Considerations

Drive levels change continuously as the biochemistry system processes reactions and receptor outputs each organ tick. The drive lobe captures a **snapshot** of these levels each brain tick, providing the brain with the most recent motivational state.

Because the biochemistry runs at a different rate than the brain (organ ticks vs brain ticks), drive levels may have changed multiple times between brain updates. The brain always sees the latest value.

---

## Comparison: Drive Lobe vs Other Input Lobes

| Aspect | Drive Lobe (`driv`) | Vision Lobe (`visn`) | Situation Lobe (`situ`) | Detail Lobe (`detl`) |
|--------|--------------------|--------------------|------------------------|---------------------|
| **Neurons** | 20 | 40 | 9 | 11 |
| **Data source** | Biochemistry (chemicals) | World (agent positions) | Creature state + world | IT agent properties |
| **Update complexity** | Simple copy | Complex (visibility, categories) | Mixed queries | IT-dependent |
| **Always active** | Yes (when alert) | Yes (when alert) | Yes (when alert) | Only with IT agent |
| **Purpose** | "What do I need?" | "What can I see?" | "What is my situation?" | "What is that thing?" |

---

## Key Constants

```javascript
// PerceptionConstants.js
export const NUMDRIVES = 20;

// Drive chemical mapping (from ChemicalNames.catalogue)
// Drives 0-14:  chemicals 148-162 (core biological drives)
// Drives 15-19: chemicals 199-203 (navigation drives)
```

```javascript
// BiochemistryConstants.js
TISSUE_DRIVES: 5        // Tissue ID for drive loci
LOC_DRIVE0: 0           // First drive locus index
```

---

## Key Source Files

### JavaScript (Rebuild)

| File | Purpose |
|------|---------|
| `SensoryFaculty.js:291-297` | `updateDriveLobe()` — copies drive levels to brain |
| `Creature.js:1439-1444` | `getDriveLevel()` — reads from `myDriveLoci[]` |
| `Creature.js:109` | `myDriveLoci = new Float32Array(NUM_DRIVES)` — drive storage |
| `Creature.js:235-238` | Drive locus address resolution for receptors |
| `BiochemistryConstants.js:48,182` | `TISSUE_DRIVES`, `LOC_DRIVE0` constants |

### Catalogue Files

| File | Purpose |
|------|---------|
| `ChemicalNames.catalogue:8-32` | `"drive_chemical_numbers"` — maps drive index to chemical ID |
| `Brain.catalogue:79-99` | `"Creature Drives"` — drive display names |
| `Brain.catalogue:71` | `"driv"` — lobe token string |

---

## Related Articles

- [Biochemistry System](#/article/biochemistry-system) - Chemical reactions, receptors, and emitters that produce drive levels
- [Drive Inhibition Tracts (driv→driv)](#/article/driv-to-driv-inhibition) - The two self-loop tracts that suppress biological drives when navigation drives (Up/Down/Exit/Enter/Wait) fire above 0.1, with the lift activation example
- [Detail Lobe Architecture](#/article/detail-lobe-architecture) - IT agent properties (companion input lobe)
- [Situation Lobe Architecture](#/article/situation-lobe-architecture) - Creature's own state (companion input lobe)
- [Vision Lobe Architecture](#/article/vision-lobe-architecture) - Visual perception feeding attention
- [Brain & Neural Networks](#/article/brain-system) - Lobe architecture, SVRules, and tract processing
- [Creature Faculties](#/article/creature-faculties) - SensoryFaculty within the faculty system
