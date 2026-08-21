# Brain Faculty

The **Brain** is faculty index 1 — the creature's central decision-making system. While its core responsibility is neural network processing (lobes, tracts, neurons, dendrites, SVRules), the Brain class is far more than a pure neural network. It also owns the **instinct system** for hardwired REM-sleep learning, provides **knowledge extraction** for the LinguisticFaculty's creature-to-creature teaching, maintains a **bidirectional biochemistry coupling** through chemical pointers and locus addresses, and coordinates **sleep/dream state** transitions that switch between normal operation and instinct processing.

## Position in the Faculty System

Brain is **faculty index 1** — it updates after the SensoryFaculty (index 0) and before the MotorFaculty (index 2).

```
Faculty Update Order:
  0  SensoryFaculty     (perceive)
  1  Brain              (think)       ◀
  2  MotorFaculty       (act)
  3  LinguisticFaculty  (speak)
  4  Biochemistry       (metabolise)
  5  ReproductiveFaculty (reproduce)
  6  ExpressiveFaculty  (express)
  7  MusicFaculty       (music)
  8  LifeFaculty        (age/die)
```

The position between SensoryFaculty and MotorFaculty is architecturally critical: sensory inputs must be written to input lobes before the brain processes them, and the brain's output (winning attention and decision neurons) must be available before the MotorFaculty reads them to select actions.

## Core Architecture

### Structural Components

The Brain owns three collections of objects, all created from the genome:

```
myLobes           — neural clusters, each with a 4-character token (e.g. "visn", "attn", "decn")
myTracts          — inter-lobe wiring, connecting source dendrites to destination neurons
myBrainComponents — unified list of all lobes + tracts, sorted by updateAtTime for execution order
```

Additionally, it owns the instinct and knowledge systems:

```
myInstincts              — pending instinct genes waiting to be processed during REM sleep
myAssistanceKnowledge    — extracted knowledge for creature-to-creature teaching
myPointerToChemicals     — pointer to the creature's 256-element chemical concentration array
```

### Limits

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_LOBES` | 255 | Maximum lobe count |
| `MAX_TRACTS` | 255 | Maximum tract count |
| `MAX_NEURONS_PER_LOBE` | 65025 | Maximum neurons in a single lobe |
| `MAX_DENDRITES_PER_TRACT` | 65025 | Maximum dendrites in a single tract |
| `MAX_INSTINCTS` | 255 | Maximum pending instinct genes |
| `MAX_INSTINCT_INPUTS` | 3 | Inputs per instinct gene |

### The Dummy Lobe

When a lobe token string is not found (e.g. a misspelled name or a lobe that doesn't exist in this genome), `GetLobeFromTokenString()` returns `ourDummyLobe` — a static empty Lobe instance. This prevents null pointer crashes and silently discards writes to nonexistent lobes.

## Genome Integration

`ReadFromGenome()` performs three sequential genome passes:

### Pass 1: Lobe Creation

```
genome.Reset()
while getGeneType(BRAINGENE, G_LOBE):
    create Lobe from genome data
    add to myLobes and myBrainComponents
    if lobe token is "driv":
        resize myAssistanceKnowledge to match neuron count
```

Each lobe gene defines: token string (4 chars), tissue ID, neuron count, threshold, initial SVRule, update SVRule, and update timing.

The special handling of the `"driv"` lobe is important — when the drive lobe is created, the knowledge vector is sized to match its neuron count (typically 20). This vector will later hold one `KnowledgeAction` per drive for the teaching system.

### Pass 2: Tract Creation

```
genome.Reset()
while getGeneType(BRAINGENE, G_TRACT):
    create Tract from genome data (with lobe references)
    add to myTracts and myBrainComponents
```

Each tract gene defines: source lobe, destination lobe, dendrite fan-out pattern, init SVRule, update SVRule, reinforcement details, and update timing.

### Post-Creation: Sort and Initialise

```
sort myBrainComponents by updateAtTime
for each component:
    registerBiochemistry(myPointerToChemicals)
    initialise()
```

The `updateAtTime` sort is critical — it determines execution order within `UpdateComponents()`. Different genome-defined timing values control which lobes and tracts process first, enabling pipeline-style processing where input lobes update before combination lobes, which update before output lobes.

### Pass 3: Instinct Creation

```
genome.Reset()
while getGeneType(CREATUREGENE, G_INSTINCT):
    create Instinct from genome data
    add to myInstincts
```

Note that instincts use `CREATUREGENE` (not `BRAINGENE`) with subtype `G_INSTINCT`. They are creature-level genes that happen to be owned by the Brain. Each instinct gene defines up to 3 input stimulations, one target decision, and a reinforcement drive with amount.

## The Dual-Mode Update

The `Update()` method operates in one of two modes, controlled by `myInstinctsAreBeingProcessed`:

### Normal Mode (Awake)

```
if NOT processing instincts:
    UpdateComponents()      — run all lobes and tracts in sorted order
    return
```

This is the standard per-tick update. All brain components execute their SVRules in the order determined by `updateAtTime`. Input lobes receive values from SensoryFaculty (already written before Brain::Update is called), intermediate lobes process signals, and output lobes (`attn`, `decn`) produce winning neuron IDs for the MotorFaculty to read.

### Instinct Mode (REM Sleep)

When the creature enters dreaming state, the Brain switches to instinct processing. Each tick processes **one** item — either an instinct or a knowledge extraction — before returning:

```
if processing instincts:
    if instincts remain:
        process ONE instinct (Instinct::Process())
        if complete: remove from list
        return

    // After all instincts: extract knowledge
    if knowledge slots remain:
        extract knowledge for ONE drive
        if all drives done:
            myInstinctsAreBeingProcessed = false
        return
```

The one-at-a-time processing is a deliberate performance strategy — processing all instincts in a single tick would cause a massive frame spike.

## Instinct Processing

### The Instinct Gene Format

Each `G_INSTINCT` gene encodes a hardwired association:

```
3× input pairs:
    tissueId    — GetByte()-1 (255-1 means invalid/unused)
    neuronId    — GetByte() (neuron index within that lobe)

decisionId      — GetByte() → remapped via GetNeuronIdFromScriptOffset()
driveId         — GetCodon(0,255) (reinforcement chemical)
amount          — GetSignedFloat() (reinforcement strength, -1.0 to +1.0)
```

### Lobe Name Remapping

During instinct construction, two special lobe remappings occur:

```
if input lobe is "decn" → remap to "verb"
if input lobe is "attn" → remap to "noun"
```

This reflects the brain's architecture: instincts should stimulate the **input** lobes (noun, verb) rather than the **output** lobes (attn, decn), allowing the brain's normal processing pipeline to propagate the signal.

### Instinct::Process() — The Execution Sequence

Each instinct processes in a single call with two brain update passes:

```
Pass 1 — Stimulate and Decide:
    1. ClearActivity()                              — zero all neuron states
    2. For each of 3 inputs:
       - If lobe is "verb": remap neuronId via GetNeuronIdFromScriptOffset()
       - If lobe is "noun": also set visn[neuronId]=0.1 and smel[neuronId]=1.0
       - SetInput(lobe, neuronId, 1.0)              — stimulate the input
    3. SetInput("verb", decisionId, 1.0)             — force the target decision
    4. UpdateComponents()                            — run the full brain pipeline
    5. If GetWinningId("decn") != decisionId:        — verify the decision won
       → return true (instinct invalid for this brain, skip it)

Pass 2 — Reinforce:
    6. SetInput("resp", driveId, 0.5 * amount)       — apply reinforcement
    7. UpdateComponents()                            — learn from the reward/punishment
    8. return true                                   — instinct complete
```

The `REINFORCEMENT_MODIFIER = 0.5` scales the reinforcement amount. The response lobe receives the drive signal, which propagates through the brain's learning tracts, strengthening the association between the stimulated inputs and the forced decision.

The `noun` input stimulation is notable — it also sets `visn` (vision) and `smel` (smell) for the same neuron. This ensures the brain "imagines" seeing and smelling the target category, creating a multi-sensory association rather than a purely linguistic one.

### Why Instincts Only During Sleep

Instincts completely replace normal brain activity — `ClearActivity()` zeros all neurons before each instinct. If processed while awake, the creature would lose all current perceptual state and real-world context. By processing during REM sleep (when the creature is already unconscious), the brain can safely rehearse instinct scenarios without interfering with real-time behaviour.

## Knowledge Extraction

After all instincts are processed, the Brain enters a knowledge extraction phase that runs during the remaining dream ticks. This system builds a lookup table that the LinguisticFaculty uses for creature-to-creature teaching.

### The Algorithm

For each drive neuron (0 to NUMDRIVES-1), one per tick:

```
1. ClearActivity()
2. Set ALL noun neurons to 0.5        — generic object context
3. Set ALL visn neurons to 0.1         — low visibility background
4. Set driv[currentDrive] to 1.0       — hypothetical: "what if this drive were maximal?"
5. UpdateComponents()                  — run brain pipeline
6. Record:
   attentionId = GetWinningId("attn")  — what category would I focus on?
   decisionId  = GetWinningId("decn")  — what action would I take?
   strength    = decn[decisionId].STATE_VAR  — how strongly?
7. Increment to next drive
8. If all drives done: exit instinct mode
```

### How It's Used

The `GetKnowledge(drive)` method returns the `KnowledgeAction` for a given drive. The LinguisticFaculty calls this when a creature attempts to teach another creature. For example, if a creature is hungry (drive 1 = HUNGER_PROTEIN), `GetKnowledge(1)` might return `{attentionId: 12, decisionId: 5, strength: 0.8}` — meaning "when hungry, attend to category 12 (food plants) and perform action 5 (eat)".

This extracted knowledge represents the creature's **learned** response to each drive, accumulated through instinct processing and reinforcement learning. Different creatures with different instincts and learning histories will produce different knowledge.

## Biochemistry Coupling

### Chemical Array Access

`RegisterBiochemistry(float* chemicals)` gives the Brain a direct pointer to the creature's 256-element chemical concentration array. This pointer is propagated to all brain components (lobes and tracts), enabling SVRules to read and write arbitrary chemical values.

### Instinct Signalling Chemicals

Two chemicals, defined in `Brain.catalogue`, signal instinct processing state:

| Chemical | Number | Purpose |
|----------|--------|---------|
| Instinct chemical | 213 | Set to 1.0 during active instinct processing |
| Pre-instinct chemical | 212 | Set to 1.0 for one tick before instincts begin |

The transition sequence when entering instinct mode:

```
1. Set chemical 212 = 1.0, chemical 213 = 0.0     — warn dendrites
2. UpdateComponents()                               — let dendrites prepare (pre-instinct processing)
3. Set chemical 212 = 0.0, chemical 213 = 1.0     — activate instinct mode
```

When exiting instinct mode:

```
4. Set chemical 212 = 0.0, chemical 213 = 0.0     — clear both signals
```

SVRules in tract dendrites can test these chemicals to switch between short-term and long-term learning modes. During instinct processing, the instinct chemical (213) signals dendrites to learn directly into long-term weights, bypassing the normal short-term-to-long-term convergence.

### GetLocusAddress — Neuron Binding

The biochemistry receptor/emitter system can bind to individual neuron state variables:

```
GetLocusAddress(type, organ=ORGAN_BRAIN, tissue, locus):
    find lobe where tissueId == tissue
    neuronIndex = locus / 4        (noOfVariablesAvailableAsLoci = 4)
    stateVariable = locus % 4
    return pointer to neuron[neuronIndex].state[stateVariable]
```

This means biochemical receptors can write to specific neuron states (injecting chemical signals into the neural network), and emitters can read neuron states (broadcasting neural activity as chemicals). The 4 accessible state variables per neuron correspond to INPUT_VAR, STATE_VAR, OUTPUT_VAR, and THIRD_VAR.

## Sleep/Dream Coordination

The Brain does not manage its own sleep state — it is driven by LifeFaculty:

```
LifeFaculty::SetState(dreamingState):
    creature.GetBrain()->SetWhetherToProcessInstincts(true)

LifeFaculty::SetState(exitDreaming):
    creature.GetBrain()->SetWhetherToProcessInstincts(false)
```

This is the **only** mechanism that triggers instinct processing. The Brain never enters instinct mode on its own. A creature that never sleeps (or never dreams) will never process its instincts, retaining them indefinitely in the pending queue.

The `GetNoOfInstinctsLeftToProcess()` method allows external systems to query how many instincts remain. Late-switching genes (expressed at later life stages) add new instincts to the queue, which are processed during subsequent dream periods.

## BrainComponent and SVRules

### The Update Pipeline

All brain components (lobes and tracts) inherit from `BrainComponent`, which provides:

```
myInitRule        — SVRule executed on creation, migration, or every tick (if myRunInitRuleAlwaysFlag)
myUpdateRule      — SVRule executed every update tick
myUpdateAtTime    — integer determining execution order (lower = earlier)
myPointerToChemicals — shared chemical array pointer
```

`UpdateComponents()` iterates through `myBrainComponents` (pre-sorted by `updateAtTime`) and calls `DoUpdate()` on each. This sorted execution ensures a deterministic pipeline: input lobes process before intermediate lobes, which process before output lobes.

### SVRules — The Algebraic Engine

SVRules are the computational substrate of the brain. Each rule is a sequence of opcodes that operate on neuron state variables, dendrite weights, and chemical concentrations. The 40+ opcodes include:

- **Arithmetic**: add, subtract, multiply, divide, absolute value
- **Conditionals**: if-equal, if-greater-than, if-zero, if-positive, if-negative
- **State access**: read/write INPUT_VAR, STATE_VAR, OUTPUT_VAR, and 5 additional variables (THIRD through SEVENTH)
- **Biochemical**: read/write chemical concentrations from the shared array
- **Learning**: set short-term weight, tend short-term toward long-term, set learning rate
- **Neural**: winner-takes-all selection, set spare neuron, accumulate with bounds
- **Goal-seeking**: tend toward operand, get distance to operand

SVRules execute identically in lobes (operating on neuron states) and tracts (operating on dendrite weights), with the same opcode set adapting to different contexts.

## ClearActivity

`ClearActivity()` zeros all neuron activity across all lobes but intentionally **does not** clear tract weights:

```text
// Tracts are NOT cleared:
// If the tracts are cleared then STWs will be set to LTW, i.e. the creature
// will forget all recently learned weightings stored in STWs.
```

This preserves learned dendrite weights while resetting neural firing patterns. It is called before each instinct and knowledge extraction to provide a clean slate for the hypothetical simulation.

## I/O Interface

### Inputs

| Method | Description |
|--------|-------------|
| `SetInput(lobe, neuron, value)` | Set one neuron's input (0.0–1.0) |
| `SetLobeWideInput(lobe, value)` | Set all neurons in a lobe to the same value |
| `SetNeuronState(lobe, neuron, var, value)` | Set any state variable directly |
| `ClearNeuronActivity(lobe, neuron)` | Zero a specific neuron |

`SetInput` is by far the most used — SensoryFaculty calls it dozens of times per tick to write vision, smell, drive, detail, situation, and other sensory data into the appropriate input lobes.

### Outputs

| Method | Description |
|--------|-------------|
| `GetWinningId(lobe)` | Winner-takes-all: which neuron won in this lobe |
| `GetNeuronState(lobe, neuron, state)` | Read any neuron state variable |
| `GetKnowledge(drive)` | Get extracted knowledge for teaching |
| `GetNoOfInstinctsLeftToProcess()` | Query pending instinct count |
| `GetLobeSize(lobe)` | Number of neurons in a lobe |

`GetWinningId` is the primary output — MotorFaculty calls `GetWinningId("attn")` and `GetWinningId("decn")` to determine what the creature focuses on and what action it takes.

## Serialisation

### Binary Format (Archive)

```
1. base::Write/Read             (Faculty base class)
2. myLobes                      (vector of Lobe objects)
3. myTracts                     (vector of Tract objects)
4. myBrainComponents            (vector of BrainComponent pointers)
5. myInstinctsAreBeingProcessed (bool)
6. myInstincts                  (vector of Instinct objects)
7. myLastKnowledgeUpdated       (int)
8. myAssistanceKnowledge.size() (int)
9. For each knowledge entry:
   a. attentionId               (int)
   b. decisionId                (int)
   c. strength                  (float)
```

Each Instinct serialises:

```
1. myBrain                      (pointer/reference)
2. 3× { neuronId (int), name (string) }
3. myDecisionId                 (int)
4. myReinforcement.driveId      (int)
5. myReinforcement.amount       (float)
6. myInstinctTick               (int)
```

## Vat Kit Integration

The Brain exposes several methods for the Vat Kit (the original game's external brain debugging tool):

- `DumpSpec()` — outputs lobe/tract counts and sizes
- `DumpLobe()` / `DumpTract()` — binary dump of component state
- `DumpNeuron()` / `DumpDendrite()` — binary dump of individual elements
- `SetDendriteWeight()` / `SetNeuronState()` — remote state manipulation
- `SetLobeSVFloat()` / `SetTractSVFloat()` — modify SVRule variables

These are exposed through CAOS commands and communicate via binary output streams.

## Source Files

| File | Description |
|------|-------------|
| `Assets/Catalogue/Brain.catalogue:159-161` | Catalogue — instinct chemical 213, pre-instinct chemical 212 |
| `Rebuild/Main_Game/src/engine/creature/brain/Brain.js` | JS rebuild implementation |
