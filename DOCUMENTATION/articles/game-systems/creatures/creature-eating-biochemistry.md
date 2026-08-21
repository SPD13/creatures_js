# Creature Eating: From Action to Biochemistry

How does food actually nourish a creature? This article traces the complete pipeline from the moment a creature decides to eat, through the CAOS script execution, stimulus delivery, chemical injection, organ reactions, and the resulting drive reduction that closes the feedback loop.

## Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    EATING → BIOCHEMISTRY PIPELINE                       │
│                                                                         │
│  1. BRAIN DECIDES TO EAT                                                │
│     Decision lobe winner = neuron 12 (EAT)                              │
│          │                                                              │
│          ▼                                                              │
│  2. MOTOR FACULTY FIRES SCRIPT                                          │
│     scriptEvent = 12 + 16 = 28 (on IT agent)                           │
│          │                                                              │
│          ▼                                                              │
│  3. FOOD AGENT'S SCRIPT RUNS                                            │
│     e.g. apples.cos scrp 2 8 2 12                                      │
│     Executes: STIM WRIT from 78 1                                       │
│          │                                                              │
│          ▼                                                              │
│  4. STIMULUS DELIVERED TO CREATURE                                      │
│     Stimulus 78 (EATEN_FRUIT) → SensoryFaculty.stimulate()              │
│          │                                                              │
│          ├─── ORDR macro → sentence learning (if present)               │
│          ├─── URGE macro → noun/verb lobe nudges (if present)           │
│          └─── SWAY macro → chemical injection (up to 4 chemicals)       │
│                    │                                                    │
│                    ├── with learning → resp/prox lobe training           │
│                    └── without learning → raw chemical adjustment        │
│                              │                                          │
│                              ▼                                          │
│  5. BIOCHEMISTRY PROCESSES                                              │
│     Chemicals modified → Reactions cascade → Receptors sample           │
│          │                                                              │
│          ▼                                                              │
│  6. DRIVES CHANGE                                                       │
│     Hunger drive decreases → Brain less motivated to eat                │
│     Reward chemicals → Brain learns "eating X was good"                 │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Brain Decides to Eat

The eating pipeline begins in the brain's **decision lobe** (`decn`). When the creature's drives (hunger, etc.) build up, the neural network processes inputs through the drive, attention, stimulus, and combination lobes until the decision lobe produces a winning neuron.

The decision neuron IDs map to motor actions via `MotorAction` (defined in `MotorFaculty.js`):

| Neuron ID | Action | Description |
|-----------|--------|-------------|
| 0 | QUIESCENT | Stand and watch IT |
| 1 | ACTIVATE_1 | Touch/push IT |
| 2 | ACTIVATE_2 | Pull IT |
| 3 | DEACTIVATE | Stop touching IT |
| 4 | SEEK | Approach and look at IT |
| 5 | AVOID | Walk/run away from IT |
| 6 | PICKUP | Pick IT up |
| 7 | DROP | Drop anything carried |
| 8 | NEED | Express what's bothering you |
| 9 | REST | Rest or sleep |
| 10 | WEST | Walk idly west |
| 11 | EAST | Walk idly east |
| **12** | **EAT** | **Eat IT** |
| 13 | HIT | Hit IT |

When neuron 12 wins, the MotorFaculty picks up the decision.

**Source**: `MotorFaculty.js` lines 66-81

---

## Step 2: MotorFaculty Fires the Script

The MotorFaculty converts the decision neuron ID into a **CAOS script event number** and executes it on the IT (target) agent.

The script event number is calculated by adding an offset:

```
scriptEvent = actionId + SCRIPT_OFFSET

For regular objects: scriptEvent = 12 + 16 = 28
For creature targets: scriptEvent = 12 + 32 = 44
```

The MotorFaculty then calls:

```javascript
creature.executeScriptForEvent(scriptEvent, creature, 0, 0);
```

This runs **script event 12** on the food agent (the creature's current IT object), with the creature as `FROM`.

**Source**: `MotorFaculty.js` lines 333-359

---

## Step 3: Food Agent's Script Runs

Each food type defines its own **eat script** (event 12) in its COS bootstrap file. The script is responsible for:
1. Delivering a stimulus to the eating creature
2. Playing sound effects
3. Removing or transforming the food object

### Example: Apple (apples.cos)

```caos
scrp 2 8 2 12                          *eat script for apple*
    setv va00 posl                      *save creature position*
    setv va01 post

    stim writ from 78 1                 *stimulus 78 = EATEN_FRUIT, strength 1.0*

    wait 10
    snde "eat1"                         *play eating sound*
    inst
    new: simp 2 10 27 "apple" 1 14 20  *spawn partially-eaten apple sprite*
    ...
    kill ownr                           *destroy the original apple*
endm
```

### Stimulus Numbers by Food Type

Different food categories use different built-in stimulus numbers (defined in `PerceptionConstants.js`):

| Stimulus # | Name | Typical Use |
|------------|------|-------------|
| 26 | EAT | Generic eating action |
| 77 | EATEN_PLANT | Ate a plant or herb |
| 78 | EATEN_FRUIT | Ate fruit (apples, etc.) |
| 79 | EATEN_FOOD | Ate prepared/processed food |
| 80 | EATEN_ANIMAL | Ate an animal (bees, bugs) |
| 81 | EATEN_DETRITUS | Ate detritus/waste |

The food agent chooses the appropriate stimulus number. This is important because each creature's **genome** defines different chemical responses for each stimulus number, allowing creatures to evolve different dietary preferences.

**Source**: `PerceptionConstants.js` lines 158-163, `Assets/Bootstrap/001 World/apples.cos`

---

## Step 4: Stimulus Delivered to Creature

The `STIM WRIT` command (in `STIM_WRIT.js`) delivers the stimulus to the eating creature's SensoryFaculty:

```javascript
sensory.stimulate(
    stimulusNumber,      // 78 (EATEN_FRUIT)
    fromAgent,           // The apple object
    fromScriptEventNo,   // 12 (eat event)
    strengthMultiplier,  // 1.0
    forceNoLearning      // false (strength != 0 enables learning)
);
```

### Strength Parameter

The strength parameter in `STIM WRIT from <stim> <strength>` has special semantics:
- **strength = 0**: Deliver stimulus with strength 1.0 but **disable learning** (raw chemical adjustment only)
- **strength != 0**: Use the given strength as a multiplier and **enable learning**

**Source**: `STIM_WRIT.js` lines 73-146

---

## Step 5: SensoryFaculty Processes the Stimulus

The `SensoryFaculty.processStimulus()` method is the core stimulus handler. It runs three macros in sequence:

### 5a. Gate Checks

Before processing:
- **Dead check**: If creature is dead, stimulus is discarded entirely
- **Sleep attenuation**: If creature is asleep (not zombie), the stimulus strength is halved unless the stimulus has the `IFASLEEP` flag

### 5b. ORDR Macro (Sentence Learning)

If the stimulus carries linguistic data, the creature processes it through the LinguisticFaculty. Most eating stimuli don't carry linguistic data.

### 5c. URGE Macro (Attention/Decision Nudges)

If the stimulus has `nounIdToStim` or `verbIdToStim` set, it nudges the brain's noun lobe (what to pay attention to) and verb lobe (what to do). These nudges subtly influence the creature's next decision.

### 5d. SWAY Macro (Chemical Injection)

This is the core biochemical effect. Each stimulus gene in the creature's genome defines up to **4 chemical adjustments**:

```javascript
for (let i = 0; i < 4; i++) {
    const chemicalId = stimulus.chemicalsToAdjust[i];
    if (chemicalId === 0) continue;

    let adjustment = stimulus.adjustments[i] * stimulus.strengthMultiplier;
    adjustment = Math.max(-1.0, Math.min(1.0, adjustment));

    if (trainingOff || forceNoLearning) {
        // Direct chemical adjustment (no brain learning)
        this.adjustChemicalLevel(chemicalId, adjustment);
    } else {
        // Chemical adjustment WITH brain training
        this.adjustChemicalLevelWithTraining(
            chemicalId, adjustment,
            stimulus.fromScriptEventNo,  // 12 (eat event)
            stimulus.fromAgent           // The apple
        );
    }
}
```

For a typical EATEN_FRUIT stimulus, the genome might define:
- Chemical X +0.8 (inject starch/protein/fat nutrient)
- Chemical Y -0.5 (reduce hunger chemical)
- Chemical Z +0.2 (inject small reward)
- Chemical W +0.0 (unused slot)

The exact chemicals and amounts are **genome-defined** and vary between creatures, making dietary response an evolvable trait.

**Source**: `SensoryFaculty.js` lines 996-1087

---

## Step 6: Chemical Injection with Learning

When learning is enabled (the default for eating), `adjustChemicalLevelWithTraining()` does two things:

### 6a. Direct Chemical Modification

The chemical concentration is immediately adjusted in the biochemistry:

```javascript
biochemistry.adjustChemical(chemicalId, adjustment);
// Modifies myChemicalConcs[chemicalId] directly
```

### 6b. Reinforcement Learning (resp/prox Lobes)

The chemical adjustment is also used to train the brain's **response** (`resp`) and **proximity** (`prox`) lobes, creating learned associations.

The learning pathway depends on the creature's state:

#### If Asleep/Dreaming (Proximal Learning)

```javascript
brain.setInput('prox', driveId, adjustment);
```

During sleep, stimuli reinforce the proximity lobe, which processes instinctual/innate associations.

#### If Alert (Synchronous Learning)

Two conditions must be met for learning to occur:

1. **Decision match**: The creature's current motor decision must match the script event that triggered the stimulus. This ensures the creature learns "I did X and got Y" rather than learning from coincidental stimuli.

2. **Attention match**: The creature must still be paying attention to the source agent (IT == fromAgent). This prevents learning from stimuli that arrive after the creature has shifted focus.

If both conditions pass:

```javascript
brain.setInput('resp', driveId, adjustment);
```

This trains the **response lobe** — the creature learns that performing action X on category Y produces this chemical result. Over time, this strengthens or weakens the association between specific actions and specific object categories.

**Source**: `SensoryFaculty.js` lines 1212-1265

---

## Step 7: Biochemistry Cascade

Once chemicals are injected, the normal biochemistry tick cycle takes over:

### 7a. Organ Reactions

Every creature tick (every 4th game tick), each organ processes its reactions:

```
Nutrient Chemical + Enzyme → Energy (ATP) + Byproducts
```

Reactions follow **half-life kinetics**: the reaction rate depends on the concentration of reactants and the reaction's rate constant. Higher nutrient concentrations drive faster energy production.

### 7b. Receptor Sampling

Receptors continuously sample chemical concentrations and write to loci:

```
Chemical Concentration → Receptor → Drive Locus
```

For hunger:
- Hunger chemical rises naturally over time (hunger increases)
- Eating injects satiation chemicals that reduce hunger chemical
- The hunger receptor reads the chemical level and writes to the drive locus
- Lower drive locus → lower drive signal to brain

### 7c. Natural Decay

All chemicals naturally decay each tick according to their decay rate:

```javascript
myChemicalConcs[i] *= myChemicalDecayRates[i];  // 0.0 to 1.0
```

This means injected nutrients are gradually consumed, and the creature will need to eat again.

**Source**: `Biochemistry.js` lines 95-114, `Organ.js` lines 138-182

---

## Step 8: Drive Reduction Closes the Loop

The final effect: the creature's hunger drive decreases.

```
Eating injected satiation chemical
    → hunger chemical level drops
    → hunger receptor reads lower level
    → hunger drive locus updated (lower value)
    → SensoryFaculty feeds lower value to driv lobe
    → brain less motivated to choose EAT
    → creature shifts to other needs
```

This is the fundamental feedback loop of the Creatures biochemistry: **needs create drives, drives motivate actions, actions modify chemistry, chemistry reduces drives**.

---

## Genome-Driven Variation

A critical design principle: the **food agent** only decides *which stimulus number* to send. The **creature's genome** determines the biochemical response. This means:

- Different creatures can respond differently to the same food
- Mutations in stimulus genes create dietary variation
- A creature might evolve to get more energy from fruit than from meat
- Allergic reactions can emerge from negative chemical adjustments
- The learning system reinforces food preferences over a creature's lifetime

The stimulus gene structure (from `Stimulus.js`):

```
Per stimulus entry (256 total in genome):
  - nounStim: float        (attention nudge strength)
  - verbIdToStim: byte     (decision neuron nudge target)
  - bitFlags: byte         (IFASLEEP, TRAINING_OFF per chemical)
  - 4x chemical slots:
      - chemicalId: byte   (which chemical to adjust, in stimulus-space)
      - adjustment: float  (how much, -1.0 to +1.0)
```

**Source**: `Stimulus.js` lines 45-67, `StimulusLibrary.js`

---

## Stimulus-Space vs Biochemistry-Space

Chemical IDs in stimulus genes use a different numbering scheme from the biochemistry's 256-chemical array. The conversion is:

```javascript
static stimChemToBioChem(stimChem) {
    if (stimChem === 255) return 0;           // 255 = no chemical
    else if (stimChem <= 148) return stimChem + 148;  // Low range → high biochem
    else return stimChem - 107;               // High range → low biochem
}
```

This historical quirk comes from the original engine and must be preserved for genome compatibility.

**Source**: `Stimulus.js`

---

## Related Articles

- [Creature Action Pipeline](creature-action-pipeline.md) — How brain decisions become actions
- [Stimulus System](../stimulus-system.md) — Complete stimulus delivery architecture
- [Biochemistry System](../biochemistry-system.md) — Chemical reactions, receptors, and emitters
- [Sensory Faculty](../sensory-faculty.md) — Perception and stimulus processing
- [Motor Faculty](../motor-faculty.md) — Decision execution and action sequencing
- [Drive Lobe Architecture](../drive-lobe-architecture.md) — How drives feed into the brain
