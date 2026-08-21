# Stimulus System

## Overview

The stimulus system is the primary bridge between **world events** and **creature brains/bodies**. When something happens in the game world (an agent is activated, a creature is patted, a word is spoken), it is translated into a **stimulus** — a structured data packet that can nudge the creature's attention, influence its decisions, inject chemicals into its bloodstream, and trigger reinforcement learning.

Each creature carries a personal **Stimulus Library** of 256 entries loaded from its genome. The same stimulus number can produce different biochemical responses in different creatures, making the system genome-driven and evolvable.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STIMULUS SYSTEM OVERVIEW                        │
│                                                                        │
│   WORLD EVENT                                                          │
│       │                                                                │
│       ▼                                                                │
│   TRIGGER (CAOS command, faculty, or internal code)                    │
│       │                                                                │
│       ├──→ WRIT (direct to one creature)                               │
│       ├──→ SHOU (hearing range broadcast)                              │
│       ├──→ SIGN (visual range broadcast)                               │
│       └──→ TACT (touch/overlap broadcast)                              │
│               │                                                        │
│               ▼                                                        │
│       PERCEPTION CHECK (range, visibility, overlap)                    │
│               │                                                        │
│               ▼                                                        │
│       SensoryFaculty.stimulate()                                       │
│               │                                                        │
│               ▼                                                        │
│       processStimulus()                                                │
│           ├── ORDR macro → LinguisticFaculty (sentence learning)       │
│           ├── URGE macro → Brain noun/verb lobes (attention/decision)  │
│           └── SWAY macro → Biochemistry (chemical injection)           │
│                   │                                                    │
│                   └──→ Reinforcement learning (resp/prox lobes)        │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Not to Be Confused with the Stim Brain Lobe

Despite sharing the word "stimulus", the **stimulus system** documented here and the **stim brain lobe** (`stim` / "stim source") are completely separate mechanisms.

| | Stimulus System (this article) | Stim Brain Lobe |
|---|---|---|
| **What it is** | Event delivery pipeline from world to creature | A 40-neuron sensory integration lobe in the brain |
| **Triggered by** | CAOS commands (`STIM`, `SWAY`, `URGE`, `ORDR`), faculty code, scripts | Genome-defined tracts from visn, move, smel, noun lobes |
| **Writes to** | `noun`, `verb`, `resp`, `prox` lobes + biochemistry | Nothing — only receives input, outputs to `comb` |
| **Purpose** | Deliver external events to the creature's brain and body | Build a per-category saliency map filtering what the creature can perceive |

The stimulus system **never writes to the `stim` brain lobe**. However, the two connect indirectly: when a stimulus nudges the `noun` lobe (via the URGE macro), that noun activity can flow into the stim lobe through the **noun→stim tract** — but only if the creature already has visual, motion, or smell perception of that category. The stim lobe acts as a perceptual grounding filter, preventing the brain from considering actions on imperceptible objects regardless of what the stimulus system injects.

See **[Stimulus Source Lobe Architecture](stimulus-lobe-architecture.md)** for full documentation of the `stim` brain lobe.

---

## Stimulus Definitions

### The Stimulus Object

Each stimulus is represented by a `Stimulus` object containing:

| Field | Type | Description |
|-------|------|-------------|
| `fromAgent` | Agent | The agent that caused the stimulus |
| `toCreature` | Creature | The target creature |
| `fromScriptEventNo` | int | Which CAOS script event triggered this |
| `strengthMultiplier` | float | Effect multiplier (default 1.0) |
| `forceNoLearning` | bool | Skip reinforcement learning if true |
| `stimulusType` | enum | SHOU, SIGN, TACT, WRIT, or INVALID |
| `nounIdToStim` | int | Category ID for attention nudge |
| `nounStim` | float | Attention nudge strength |
| `verbIdToStim` | int | Action/verb ID for decision nudge |
| `verbStim` | float | Decision nudge strength |
| `chemicalsToAdjust[4]` | int[] | Up to 4 chemical IDs to inject |
| `adjustments[4]` | float[] | Signed adjustment amounts per chemical |
| `bitFlags` | byte | Modulation and training flags |
| `incomingSentence` | string | Sentence for ORDR (speech) stimuli |

### Built-In Stimulus Numbers (0-98)

The system supports 256 stimulus slots (`NUMSTIMULI = 256`). Indices 0-98 are named built-in stimuli defined in `PerceptionConstants.js`:

| Range | Category | Stimuli |
|-------|----------|---------|
| 0 | Disappointment | DISAPPOINT |
| 1-4 | Social Touch | POINTERPAT, CREATUREPAT, POINTERSLAP, CREATURESLAP |
| 7 | Collision | BUMP |
| 9-11 | Speech | GOBBLEDYGOOK, POINTERWORD, CREATUREWORD |
| 12 | Idle | QUIESCENT |
| 13-15 | Activation | ACTIVATE1, ACTIVATE2, DEACTIVATE |
| 16-17 | Navigation | APPROACH, RETREAT |
| 18-19 | Object Manipulation | GET, DROP |
| 20-27 | Actions | EXPRESSNEED, REST, SLEEP, TRAVWESTEAST, PUSH, HIT, EAT, AC6 |
| 28-35 | Involuntary | INVOL0 through INVOL7 |
| 39 | Collision | IMPACT |
| 40-43 | Pointer Feedback | POINTERYES, CREATUREYES, POINTERNO, CREATURENO |
| 44-47 | Combat/Mating | AGGRESSION, MATE, OPPSEX_TICKLE, SAMESEX_TICKLE |
| 48-54 | Go Direction | GO_NOWHERE through GO_RIGHT |
| 55-74 | Smell Peaks | REACHED_PEAK_OF_SMELL0 through REACHED_PEAK_OF_SMELL19 |
| 75-98 | Miscellaneous | WAIT, DISCOMFORT, EATEN_PLANT, ... DROP_ALL |

Indices 99-255 are available for custom stimuli defined by genome authors.

### Stimulus Bit Flags

| Flag | Value | Effect |
|------|-------|--------|
| `MODULATE` | 1 | Modulate chemical effect |
| `IFASLEEP` | 4 | Stimulus works even while creature is asleep |
| `TRAINING_OFF_FOR_0` | 16 | Disable learning for chemical slot 0 |
| `TRAINING_OFF_FOR_1` | 32 | Disable learning for chemical slot 1 |
| `TRAINING_OFF_FOR_2` | 64 | Disable learning for chemical slot 2 |
| `TRAINING_OFF_FOR_3` | 128 | Disable learning for chemical slot 3 |

---

## The Stimulus Library (Genome-Defined)

Each creature has its own `StimulusLibrary` containing 256 `Stimulus` entries, loaded from the creature's genome during gene expression. This means the same stimulus number can produce different biochemical responses in different creatures or species.

### Genome Source

Stimulus genes are `G_STIMULUS` genes (GenomeConstants subtype 0 of CREATUREGENE type 2). Each gene specifies:
- A **stimulus ID** (0-255) — which slot to define
- **Chemical responses** — up to 4 chemical adjustments
- **Brain nudges** — verb and noun IDs for attention/decision
- **Bit flags** — modulation and training control

### Stimulus-to-Biochemistry Chemical Mapping

Chemical IDs in stimulus genes are stored in **stimulus space**, which is offset from biochemistry space by `STIM_TO_BIOCHEM_OFFSET = 148`:

```
Stimulus Chemical 0-107   →  Biochemistry Chemical 148-255  (drive chemicals and higher)
Stimulus Chemical 108-254 →  Biochemistry Chemical 1-147    (lower chemicals)
Stimulus Chemical 255     →  Biochemistry Chemical 0        (unused/null)
```

This offset means stimulus genes primarily target **drive chemicals** (starting at biochemistry position 148) by default, which is where drives like hunger, pain, tiredness, and fear are managed.

### Genome Reading Pipeline

```
.gen file → creatures-file-formats.js (parser)
         → GenomeStore (storage)
         → Genome.js (sequential reader)
         → StimulusLibrary.readFromGenome()
         → For each G_STIMULUS gene:
              stimulus[geneId].initFromGenome(genomeData)
```

---

## Trigger Sources

### CAOS Command Triggers

#### STIM Commands (Standard Stimulus)

| Command | Delivery | Description |
|---------|----------|-------------|
| `STIM WRIT creature stim strength` | WRIT (direct) | Deliver stimulus to a specific creature |
| `STIM SHOU stim strength` | SHOU (hearing) | Broadcast to all creatures in hearing range |
| `STIM SIGN stim strength` | SIGN (visual) | Broadcast to all creatures in visual range |
| `STIM TACT stim strength` | TACT (touch) | Broadcast to all creatures in touch range |

When `strength = 0.0`, the stimulus is delivered with `forceNoLearning = true` and an actual multiplier of 1.0.

#### URGE Commands (Brain Nudge)

| Command | Delivery | Description |
|---------|----------|-------------|
| `URGE WRIT creature noun_id noun_stim verb_id verb_stim` | WRIT | Direct attention/decision nudge |
| `URGE SHOU noun_id noun_stim verb_id verb_stim` | SHOU | Broadcast attention/decision nudge |
| `URGE SIGN ...` | SIGN | Visual range nudge |
| `URGE TACT ...` | TACT | Touch range nudge |

URGE creates a `Stimulus` with `nounIdToStim`, `nounStim`, `verbIdToStim`, `verbStim` set, then calls `processStimulus()` directly.

#### SWAY Commands (Chemical Injection)

| Command | Delivery | Description |
|---------|----------|-------------|
| `SWAY WRIT creature chem1 adj1 chem2 adj2 chem3 adj3 chem4 adj4` | WRIT | Direct chemical injection |
| `SWAY SHOU chem1 adj1 chem2 adj2 chem3 adj3 chem4 adj4` | SHOU | Broadcast chemical injection |
| `SWAY SIGN ...` | SIGN | Visual range injection |
| `SWAY TACT ...` | TACT | Touch range injection |

SWAY sets `forceNoLearning = true` — chemical injections from SWAY bypass reinforcement learning.

#### ORDR Commands (Sentence/Speech)

| Command | Delivery | Description |
|---------|----------|-------------|
| `ORDR SHOU sentence` | SHOU | Broadcast a sentence to nearby creatures |
| `ORDR SIGN sentence` | SIGN | Visual range sentence |
| `ORDR TACT sentence` | TACT | Touch range sentence |

ORDR creates a `Stimulus` with `incomingSentence` set, processed through the ORDR macro for word learning.

### Internal Code Triggers

| Source | Stimulus | When |
|--------|----------|------|
| `SensoryFaculty.handleCreatureTouch('pat')` | CREATUREPAT (2) | Creature is patted by another creature |
| `SensoryFaculty.handleCreatureTouch('slap')` | CREATURESLAP (4) | Creature is slapped by another creature |
| `SensoryFaculty.triggerDisappointment()` | DISAPPOINT (0) | Creature's action fails |
| `LinguisticFaculty` (speech processing) | CREATUREWORD (11) | Creature hears another creature speak |
| `LinguisticFaculty` (unrecognized) | GOBBLEDYGOOK (9) | Creature hears unintelligible speech |
| `LinguisticFaculty` (pointer yes/no) | POINTERYES (40), POINTERNO (42) | Pointer agent says yes/no |
| `APPR.js` (approach navigation) | GO_NOWHERE+dir (48-54) | Creature navigates in a direction |
| `APPR.js` (smell peak reached) | REACHED_PEAK_OF_SMELL+n (55-74) | Creature reaches peak of a smell |
| `FLEE.js` (flee navigation) | GO_NOWHERE+dir (48-54) | Creature flees in a direction |

---

## Delivery & Perception

### Delivery Types

For broadcast delivery (SHOU, SIGN, TACT), the system iterates all agents and applies perception checks:

| Type | Perception Check | Range/Condition |
|------|-----------------|-----------------|
| **WRIT** | None — direct delivery | Always succeeds |
| **SHOU** | `canCreatureHear()` | Same metaroom + distance <= 800px |
| **SIGN** | `canCreatureSee()` | Distance <= 512px + not invisible |
| **TACT** | `canCreatureTouch()` | AABB bounding box overlap (or within 50px fallback) |

### Broadcast Flow

```
broadcastStimulus(fromAgent, stimulusNumber, strength, stimulusType):
    for each agent in world:
        skip if not a creature
        skip if dead
        skip if self (fromAgent === creature)

        switch (stimulusType):
            SHOU: if !canCreatureHear(fromAgent, creature) → skip
            SIGN: if !canCreatureSee(fromAgent, creature)  → skip
            TACT: if !canCreatureTouch(fromAgent, creature) → skip

        creature.sensory.stimulate(stimulusNumber, fromAgent, ...)
```

### Guard Checks in processStimulus()

Before processing, stimuli are filtered:

1. **Dead creature** → stimulus is silently discarded
2. **Asleep creature without IFASLEEP flag** → discarded (exception: if the sentence contains the creature's name, it wakes up)
3. **Asleep creature with IFASLEEP flag** → processed, but `verbStim` and `nounStim` are attenuated by 50%

---

## Processing Pipeline

`processStimulus()` is the heart of the stimulus system. It executes three sequential "macros":

### ORDR Macro (Sentence Learning)

If the stimulus carries an `incomingSentence`:

```
stimulus.incomingSentence is non-empty?
    → LinguisticFaculty.hearSentence(fromAgent, sentence, verbId, nounId)
        → Word learning, syntax parsing, semantic handling
        → May trigger follow-up stimuli:
            - GOBBLEDYGOOK (9) if speech is unintelligible
            - POINTERWORD (10) if speaker is pointer
            - CREATUREWORD (11) if speaker is creature
            - POINTERYES (40) / POINTERNO (42) for pointer feedback
```

### URGE Macro (Attention & Decision Brain Inputs)

The URGE macro writes directly to brain input lobes to influence the creature's focus and actions:

```
NOUN (attention) processing:
    nounStim > 1.0  → MotorFaculty.setAttentionOverride(nounIdToStim)
                       (HARD override — forces IT to this category)
    nounStim != 0   → brain.setInput('noun', nounIdToStim, nounStim)
                       (SOFT nudge — competes with other inputs)

VERB (decision) processing:
    verbStim > 1.0  → MotorFaculty.setDecisionOverride(verbIdToStim)
                       (HARD override — forces this action)
    verbStim != 0   → neuronId = getNeuronIdFromScriptOffset(verbIdToStim)
                       brain.setInput('verb', neuronId, verbStim)
                       (SOFT nudge — competes with other inputs)
```

The threshold of `> 1.0` distinguishes between:
- **Soft nudge** (0.0-1.0): Adds weight to a brain lobe neuron, which competes with other inputs during the next brain tick
- **Hard override** (> 1.0): Bypasses brain processing entirely and forces the MotorFaculty to adopt this attention/decision immediately

### SWAY Macro (Chemical Injection)

The SWAY macro injects up to 4 chemicals into the creature's biochemistry:

```
for each chemical slot (0-3):
    skip if chemicalId == 0 (unused slot)

    adjustment = adjustments[i] * strengthMultiplier
    clamp adjustment to [-1.0, +1.0]

    check TRAINING_OFF_FOR_N bit flag for this slot

    if trainingOff OR forceNoLearning:
        → Biochemistry.adjustChemical(chemicalId, adjustment)
          (simple injection, no learning side effects)

    else (learning enabled):
        → adjustChemicalLevelWithTraining(chemicalId, adjustment, ...)
          (injection + reinforcement learning pathway)
```

---

## Brain Wiring

### Direct Brain Inputs from Stimuli

| Lobe | Token | Written By | Purpose |
|------|-------|------------|---------|
| Noun | `noun` | URGE macro | Nudge attention toward a category (40 neurons) |
| Verb | `verb` | URGE macro | Nudge decision toward an action |
| Response | `resp` | SWAY + learning (alert) | Reinforcement signal for waking learning |
| Proximity | `prox` | SWAY + learning (asleep) | Reinforcement signal for dream learning |

### Continuous Brain Inputs (Not Stimulus-Triggered)

These are written by `SensoryFaculty.update()` every tick, independent of stimuli:

| Lobe | Token | Source | Inputs |
|------|-------|--------|--------|
| Situation | `situ` | `updateSituationLobe()` | 9 inputs: age, vehicle, carried, falling, opposite sex, music, selected |
| Detail | `detl` | `updateDetailLobe()` | 11 inputs: IT nearness, carried, creature, kin, size, smell, falling |
| Drive | `driv` | `updateDriveLobe()` | 20 inputs: hunger, pain, fear, tiredness, etc. |
| Smell | `smel` | `updateSmellLobe()` | Up to 40 inputs from room cellular automata |
| Vision | `visn` | `updateVisionLobe()` | 40 inputs: X-displacement per category representative |
| Friend/Foe | `forf` | `addFriendOrFoe()` | Social memory of creature interactions |

### How Stimuli Reach the Decision System

Stimulus inputs flow through a multi-layer brain pipeline before influencing behavior:

```
Stimulus-triggered inputs:            Continuous sensory inputs:
    noun ─────────┐                       visn ──┐
    verb ─────┐   │                       move ──┤
              │   │                       smel ──┤
              ▼   ▼                       noun ──┘
          ┌────────────┐              ┌────────────┐
          │  verb lobe │              │  stim lobe │  (sensory integration)
          └─────┬──────┘              └─────┬──────┘
                │                           │
          ┌─────▼───────────────────────────▼──────┐
          │           comb lobe (440 neurons)       │  ← also receives driv, forf
          │         40 categories × 11 actions      │
          └─────────────────┬──────────────────────┘
                            │
                      ┌─────▼──────┐
                      │  attn lobe │  → winner = IT category
                      └────────────┘
                      ┌─────▼──────┐
                      │  decn lobe │  → winner = chosen action
                      └────────────┘
```

---

## Reinforcement Learning Pathway

When a stimulus injects a chemical that corresponds to a **drive chemical** and learning is not disabled, the reinforcement learning pathway is activated.

### adjustChemicalLevelWithTraining()

```
1. Inject chemical → Biochemistry.adjustChemical(chemicalId, adjustment)

2. Map chemical → drive via getDriveNumberOfChemical(chemicalId)
   (reverse lookup from the myDriveChemicals[20] array)

3. If no matching drive found → stop (no learning)

4. If creature is ASLEEP/DREAMING:
   → brain.setInput('prox', driveId, adjustment)
     (proximal reinforcement — dream learning)

5. If creature is ALERT:
   → Check synchronous learning conditions:
     a. Is engine_synchronous_learning game variable enabled?
     b. Does current decision match the stimulus script event?
     c. Does attention target (IT agent) match the stimulus source?
   → If conditions pass:
     brain.setInput('resp', driveId, adjustment)
     (waking reinforcement — teaches that current action + target
      caused this drive change)
```

### What Reinforcement Does

The `resp` and `prox` lobe inputs trigger **dendritic plasticity** in the brain's tract system:

1. Dendrites connected to the **winning decision neuron** are strengthened or weakened
2. **Positive adjustment** (drive decrease, e.g., hunger reduced): reward signal — strengthens the action-target association
3. **Negative adjustment** (drive increase, e.g., pain increased): punishment signal — weakens the association
4. Over time, short-term weight changes become permanent long-term weights
5. Future similar situations will more easily (or less easily) activate that action

### Synchronous Learning

When `engine_synchronous_learning` is enabled (game variable), the system performs **credit assignment** — it only applies reinforcement when:
- The creature's **current action** (from MotorFaculty decision) matches the script event that triggered the stimulus
- The creature's **attention target** (IT agent) matches the stimulus source agent
- The stimulus comes from an **external agent** (not self, not pointer)

This prevents the creature from learning spurious associations (e.g., being rewarded for eating while the actual reward came from a temperature change).

---

## Biochemistry Effects

### Direct Chemical Injection

```
SensoryFaculty.adjustChemicalLevel(chemicalId, adjustment)
    → Biochemistry.adjustChemical(chemicalId, adjustment)
        → if adjustment >= 0: addChemical(id, adjustment)  // clamped to [0.0, 1.0]
        → if adjustment < 0:  subChemical(id, -adjustment) // clamped to [0.0, 1.0]
```

Chemical concentrations are stored as floats in the [0.0, 1.0] range in a 256-element array.

### Cascade Effects

Chemical injections from stimuli cascade through the creature's biochemistry on subsequent ticks:

1. **Reactions** transform chemicals (A + B → C + D) — stimulus-injected chemicals participate in reactions
2. **Receptors** read chemical levels and write to loci (drives, organ states, brain neurons, gaits)
3. **Emitters** read from loci and emit chemicals back into the bloodstream
4. **Half-lives** cause chemicals to decay over time

This creates a feedback loop: stimulus → chemical injection → drive level change → brain `driv` lobe input change → different decision next tick.

### Smell Chemicals

The SensoryFaculty also writes environmental data directly to biochemistry every tick (not stimulus-triggered):

```
for each CA property (0-15) in creature's room:
    Biochemistry.setChemical(FIRST_SMELL_CHEMICAL + caIndex, caValue)
```

Where `FIRST_SMELL_CHEMICAL = 160`. This allows receptor genes and chemical reactions to respond to environmental conditions like temperature, toxins, or nutrient concentrations.

---

## Example: Complete Stimulus Flow

### Scenario: Creature Eats Food

1. **Trigger**: Creature's EAT action script runs on a food agent, calling `STIM WRIT targ 26 1.0` (stimulus 26 = EAT)

2. **Library Lookup**: The creature's `StimulusLibrary[26]` is consulted. For a typical Norn, this gene might define:
   - Chemical slot 0: Reduce hunger for protein (drive decrease)
   - Chemical slot 1: Reduce hunger for carbohydrate (drive decrease)
   - nounStim: 0 (no attention nudge)
   - verbStim: 0 (no decision nudge)
   - bitFlags: 0 (training enabled for all slots)

3. **Processing (processStimulus)**:
   - ORDR macro: No sentence → skipped
   - URGE macro: nounStim=0, verbStim=0 → skipped
   - SWAY macro:
     - Slot 0: `adjustChemicalLevelWithTraining(proteinChemical, -0.5, EAT_SCRIPT, foodAgent)`
     - Slot 1: `adjustChemicalLevelWithTraining(carbChemical, -0.3, EAT_SCRIPT, foodAgent)`

4. **Biochemistry**: Hunger chemicals decrease → drive levels drop

5. **Reinforcement Learning**:
   - `getDriveNumberOfChemical(proteinChemical)` → drive 1 (Hunger for Protein)
   - Synchronous learning check: creature is eating (matches script), IT is food (matches source) → pass
   - `brain.setInput('resp', 1, -0.5)` — negative adjustment to hunger drive = **reward signal**
   - Dendritic connections strengthened: "when I see food + I'm hungry → eat" pathway reinforced

6. **Next tick**: Lower hunger drive → `driv` lobe neuron 1 decreases → less motivation to eat → brain decides to do something else

---

## Key Source Files

| File | Purpose |
|------|---------|
| `creature/perception/Stimulus.js` | Stimulus data structure and genome initialization |
| `creature/perception/StimulusLibrary.js` | Per-creature library of 256 stimulus definitions |
| `creature/perception/PerceptionConstants.js` | Built-in stimulus numbers, bit flags, constants |
| `creature/faculties/SensoryFaculty.js` | `stimulate()`, `processStimulus()`, reinforcement learning |
| `caos/commands/creatures/StimulusBroadcast.js` | Broadcast functions for SHOU/SIGN/TACT delivery |
| `caos/commands/creatures/STIM_WRIT.js` | Direct stimulus CAOS command |
| `caos/commands/creatures/STIM_SHOU.js` | Hearing broadcast CAOS command |
| `caos/commands/creatures/STIM_SIGN.js` | Visual broadcast CAOS command |
| `caos/commands/creatures/STIM_TACT.js` | Touch broadcast CAOS command |
| `creature/biochemistry/Biochemistry.js` | Chemical injection and concentration management |
| `creature/brain/Brain.js` | `setInput()` for writing to brain lobes |

---

## Related Articles

- **[Biochemistry System](biochemistry-system.md)** — Chemical reactions, receptors, emitters, and loci
- **[Sensory Faculty](sensory-faculty.md)** — The perceptual gateway including stimulus processing
- **[Instinct System](instinct-system.md)** — Hardwired brain pathways that simulate stimuli during REM sleep
- **[Hearing System](hearing-system.md)** — SHOU delivery perception and speech processing
- **[Touch System](touch-system.md)** — TACT delivery perception and physical interaction
- **[Vision System](vision-system.md)** — Visual perception and category representatives
- **[Brain Overview](brain-overview.md)** — Neural architecture and lobe processing
- **[Response Lobe](response-lobe-architecture.md)** — Reinforcement learning lobe details
- **[Attention Lobe](attention-lobe-architecture.md)** — Winner-takes-all attention selection
- **[Stimulus Source Lobe](stimulus-lobe-architecture.md)** — The `stim` brain lobe (not to be confused with this system) — a sensory integration layer that indirectly receives noun input from stimuli
