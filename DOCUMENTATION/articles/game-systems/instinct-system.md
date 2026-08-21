# Instinct System

Instincts are **hardwired behaviour patterns** encoded as genes in the creature's genome. They are the only mechanism by which a creature acquires knowledge without direct experience — wiring permanent neural pathways during REM sleep that associate specific sensory inputs with specific actions and reinforcement signals.

Unlike stimuli (which are processed in real-time during waking), instincts are **queued** at gene expression time and **consumed destructively** during dreaming. Each instinct processes exactly once, creating lasting dendritic weight changes that persist for the creature's lifetime. The system is owned by the Brain (faculty index 1) but triggered by the LifeFaculty's sleep state machine.

## Lifecycle: From Genome to Neural Pathway

The complete instinct pipeline has five stages:

```
1. GENOME           G_INSTINCT genes stored in .gen file (static, evolvable)
       │
       ▼  gene expression (age-filtered)
2. QUEUE            Instinct objects in brain.instincts[] (runtime, destructive)
       │
       ▼  LifeFaculty enters dreaming state
3. PROCESSING       One instinct per tick during REM sleep
       │
       ▼  dendrite weight changes via reinforcement learning
4. NEURAL PATHWAY   Permanent connection in brain tracts (weights)
       │
       ▼  brain extracts per-drive knowledge
5. KNOWLEDGE        myAssistanceKnowledge[] for creature-to-creature teaching
```

### Stage 1: Genome Storage

Instincts are `CREATUREGENE` genes with subtype `G_INSTINCT` (5). They sit alongside stimulus, appearance, pose, gait, and expression genes in the genome. Each instinct gene has a `switchOnTime` field controlling which life stage it activates at.

A typical Norn genome contains ~40 instinct genes spread across life stages — most at Baby (stage 0), with additional ones at Child, Adolescent, and Youth stages for behaviours that should only emerge at maturity (e.g., mating instincts at Adolescent).

### Stage 2: Queue Loading

When `Creature.expressGenes()` is called (at birth and at each ageing event), the Brain's `readFromGenome()` method performs three genome passes. The third pass reads instinct genes:

```
genome.reset()
while genome.getGeneType(CREATUREGENE, G_INSTINCT):
    if instincts.length < MAX_INSTINCTS (255):
        instincts.push(new Instinct(genome, brain))
```

The `getGeneType()` call uses `SWITCH_AGE` filtering — only genes whose `switchOnTime` matches the creature's **current** age are returned. This means:

- At birth (age 0): only Baby-stage instinct genes are loaded
- At ageing to Child (age 1): only Child-stage instinct genes are appended
- At ageing to Adolescent (age 2): only Adolescent-stage instinct genes are appended

The queue is **accumulative** — `readFromGenome()` never clears existing instincts. New ones are pushed onto the end of the existing array. If a creature ages faster than it dreams, instincts from multiple life stages may accumulate in the queue before the next REM sleep period processes them.

### Stage 3: Processing During REM Sleep

When the LifeFaculty transitions the creature to dreaming state, it calls:

```
brain.setWhetherToProcessInstincts(true)
```

This switches the Brain's `update()` from normal mode to instinct mode. Each tick, one instinct is popped from the end of the queue, processed via `Instinct.process()`, and deleted. Processing continues until the queue is empty.

### Stage 4: Neural Pathway Formation

Each processed instinct creates dendritic weight changes via the reinforcement learning system. The dendrites connecting the stimulated input neurons to the forced decision neuron are strengthened, creating a permanent association that persists after the creature wakes.

### Stage 5: Knowledge Extraction

After all instincts are consumed, the Brain runs one more phase — **knowledge building**. For each of the 20 drive neurons, it simulates: "if this drive were maximal, what would I attend to and what would I do?" The results are stored in `myAssistanceKnowledge[]` and read by the LinguisticFaculty when a creature teaches concepts to other creatures.

## Gene Format

### Gene Header

Standard 12-byte creature gene header:

| Offset | Field | Description |
|--------|-------|-------------|
| 4 | Type | `2` (CREATUREGENE) |
| 5 | Subtype | `5` (G_INSTINCT) |
| 6 | ID | Gene ID for tracking |
| 7 | Generation | Clone generation counter |
| 8 | SwitchOnTime | Life stage to activate (0=Baby through 6=Senile) |
| 9 | Flags | Sex linkage and mutability flags |
| 10 | Mutability | Mutation breadth |
| 11 | Variant | Behaviour variant (0=all, 1-8=specific) |

### Gene Data

The instinct payload is read sequentially by the `Instinct` constructor:

```
3× input pairs (6 bytes):
    tissueId    — GetByte() - 1  (254 means invalid; 255-1 = lobe not specified)
    neuronId    — GetByte()      (neuron index within that lobe)

decision        — GetByte()      (script offset 0-13, mapped to neuron ID)

reinforcement:
    driveId     — GetCodon(0,255) (which drive to reinforce)
    amount      — GetSignedFloat() (strength: -1.0 to +1.0)
```

Total gene data: 9 bytes (6 for inputs + 1 for decision + 1 for drive + 1 for amount codon).

### Tissue ID to Lobe Resolution

Each input's `tissueId` byte is resolved to a lobe name at construction time via `brain.getLobeNameFromTissueId(tissueId)`. The tissue ID comes from the genome's lobe gene definitions — each lobe has a unique tissue ID assigned during brain construction.

Two special remappings are applied after resolution:

```
"decn" → "verb"    (instincts target the input mirror, not the output lobe)
"attn" → "noun"    (same reason — stimulate input, let pipeline propagate)
```

This is architecturally important: instincts should stimulate the **input** lobes (noun, verb) so the brain's normal processing pipeline propagates the signal through combination and stimulus lobes to reach the output lobes (attn, decn). Directly stimulating output lobes would bypass the learning tracts.

## The Process() Execution Sequence

Each instinct processes in a single `process()` call with **two brain update passes**:

### Pass 1: Stimulate and Decide

```
1. brain.clearActivity()                    — zero all neuron states
2. For each of 3 inputs:
   a. If lobe is "verb": remap neuronId via GetNeuronIdFromScriptOffset()
   b. If lobe is "noun": also set visn[neuronId]=0.1 and smel[neuronId]=1.0
   c. brain.setInput(lobe, neuronId, 1.0)   — stimulate the input
3. brain.setInput("verb", decisionId, 1.0)   — force the target decision
4. brain.updateComponents()                   — run the full brain pipeline
5. If getWinningId("decn") != decisionId:     — verify the decision won
   → return true (instinct invalid for this brain, skip it)
```

The `noun` input receives special multi-sensory treatment: when a noun (category) input is specified, the instinct also stimulates `visn` (vision) at strength 0.1 and `smel` (smell) at strength 1.0 for the same neuron index. This creates a cross-modal association — the creature "imagines" seeing and smelling the target category, not just hearing its name.

The validation at step 5 is a safety check: if the forced decision doesn't actually win after the full pipeline runs, the instinct is incompatible with this brain's structure and is silently discarded. This can happen when the brain's genome doesn't have the expected lobe configuration.

### Pass 2: Reinforce

```
6. reinforcementAmount = REINFORCEMENT_MODIFIER × amount
   (REINFORCEMENT_MODIFIER = 0.5)
7. brain.setInput("resp", driveId, reinforcementAmount)
8. brain.updateComponents()                   — learn from the reward/punishment
9. return true                                — instinct complete
```

The response lobe receives the reinforcement signal at the specified drive neuron. This triggers the brain's standard reinforcement learning pathway: the `resp→driv` tract propagates the signal, strengthening dendrites in the combination lobe (`comb`) that connect the stimulated inputs to the forced decision.

The `REINFORCEMENT_MODIFIER = 0.5` halves the genome-specified amount, preventing instincts from overwhelming learned behaviours.

## Chemical Signalling

Two chemicals coordinate the instinct processing state, defined in `Brain.catalogue`:

| Chemical | Number | Purpose |
|----------|-------------|---------|
| Instinct chemical | 213 | Set to 1.0 during active instinct processing |
| Pre-instinct chemical | 212 | Set to 1.0 for one preparatory tick before instincts begin |

### The Transition Sequence

When `setWhetherToProcessInstincts(true)` is called:

```
Step 1: chemical[212] = 1.0, chemical[213] = 0.0   — pre-instinct warning
Step 2: updateComponents()                           — dendrites prepare (one tick)
Step 3: chemical[212] = 0.0, chemical[213] = 1.0   — activate instinct mode
```

When `setWhetherToProcessInstincts(false)` is called:

```
Step 4: chemical[212] = 0.0, chemical[213] = 0.0   — clear both signals
```

The pre-instinct chemical (212) gives dendrite SVRules one tick to prepare for instinct-mode learning. During normal processing, dendrites learn into **short-term weights** (STW). The instinct chemical (213) signals dendrite SVRules to switch to **long-term weight** (LTW) learning — bypassing the normal STW→LTW convergence and writing directly into permanent weights.

This is why instinct learning is permanent: it goes directly into long-term weights, unlike experiential learning which must gradually converge from short-term to long-term through repeated reinforcement.

## Why Only During Sleep

Instincts completely replace normal brain activity — `clearActivity()` zeros all neuron states before each instinct. If processed while awake, the creature would:

1. Lose all current perceptual state (what it's seeing, hearing, smelling)
2. Lose its current decision context (what it was doing)
3. Experience random action firing from the forced decisions

By restricting instinct processing to REM sleep (when the creature is already unconscious and not interacting with the world), the brain can safely rehearse hypothetical scenarios without interfering with real-time behaviour.

The original engine also notes that tracts are intentionally **not** cleared during `clearActivity()`: if the tracts are cleared then STWs will be set to LTW, i.e. the creature will forget all recently learned weightings stored in STWs.

This preserves learned dendrite weights while resetting neural firing patterns.

## Sleep/Dream Coordination

The Brain does not manage its own sleep state — it is driven by the LifeFaculty state machine:

```
LifeFaculty enters dreaming state:
    → brain.setWhetherToProcessInstincts(true)

LifeFaculty exits dreaming state:
    → brain.setWhetherToProcessInstincts(false)
```

A creature that never sleeps (or is kept permanently alert by biochemistry) will never process its instincts. The instincts remain queued indefinitely, accumulating as new ones are added at each life stage.

## Knowledge Building

After all instincts are consumed, the Brain runs a **knowledge extraction phase** — one drive per tick — before exiting instinct mode:

```
For each drive neuron d (0 to NUMDRIVES-1):
    1. clearActivity()
    2. Set ALL noun neurons to 0.5          — generic object context
    3. Set ALL visn neurons to 0.1           — low visibility
    4. Set driv[d] to 1.0                    — "what if this drive were maximal?"
    5. updateComponents()                    — run brain pipeline
    6. Record:
       attentionId = getWinningId("attn")    — what would I focus on?
       decisionId  = getWinningId("decn")    — what would I do?
       strength    = decn[decisionId].STATE   — how strongly?
    7. Store in myAssistanceKnowledge[d]
```

After all 20 drives are simulated:

```
    8. myInstinctsAreBeingProcessed = false   — exit instinct mode
    9. myLastKnowledgeUpdated = 0             — reset for next dream
```

The `GetKnowledge(drive)` method returns the extracted knowledge for a given drive. The LinguisticFaculty reads this when a creature attempts to teach another creature — if creature A is hungry, its knowledge says "attend to food, action: eat", which it can communicate to creature B.

## Decision Mapping

The decision byte in the gene is a **script offset** (0-13), converted to a decision lobe neuron ID via `GetNeuronIdFromScriptOffset()`. The mapping is defined in the `Action Script To Neuron Mappings` catalogue:

| Script Offset | Action | Description |
|---------------|--------|-------------|
| 0 | Default | No specific action |
| 1 | Activate1 | Push/touch IT |
| 2 | Activate2 | Pull IT |
| 3 | Deactivate | Stop interacting |
| 4 | Approach | Walk toward IT |
| 5 | Retreat | Walk away from IT |
| 6 | Get | Pick up IT |
| 7 | Drop | Drop carried object |
| 8 | Express Need | Display emotion |
| 9 | Rest | Sleep/rest |
| 10 | Travel West | Walk west |
| 11 | Travel East | Walk east |
| 12 | Eat | Eat IT |
| 13 | Hit | Attack IT |

## Reinforcement Drives

| Drive ID | Name | Typical Instinct Use |
|----------|------|---------------------|
| 0 | Pain | Retreat from danger |
| 1 | Hunger for Protein | Eat food |
| 2 | Hunger for Carbohydrate | Eat starchy food |
| 3 | Hunger for Fat | Eat fatty food |
| 4 | Coldness | Approach heat sources |
| 5 | Hotness | Retreat from heat |
| 6 | Tiredness | Rest |
| 7 | Sleepiness | Rest/sleep |
| 8 | Loneliness | Approach other creatures |
| 9 | Crowdedness | Retreat from crowds |
| 10 | Fear | Retreat from threats |
| 11 | Boredom | Activate objects |
| 12 | Anger | Hit/attack |
| 13 | Sex Drive | Approach opposite sex |
| 14-19 | Comfort, Up, Down, Exit, Enter, Wait | Navigation drives |

## Example: Eating Instinct

A typical Baby-stage instinct gene for eating:

```
SwitchOnTime: 0 (Baby)
Input 1: noun [5]        — category 5 (food plants)
Input 2: driv [1]        — drive 1 (hunger for protein)
Input 3: ****            — unused
Decision: 12             — AC_EAT (script offset → neuron ID)
Reinforcement: drive 1, amount +0.5
```

During REM sleep processing:

```
1. Clear brain
2. Set noun[5]=1.0, visn[5]=0.1, smel[5]=1.0   — "imagine seeing/smelling food"
3. Set driv[1]=1.0                                — "imagine being hungry"
4. Set verb[eat_neuron]=1.0                       — "force eat decision"
5. updateComponents() → decn winner = eat         — pipeline confirms eat
6. Set resp[1] = 0.5 × 0.5 = 0.25               — reward hunger drive
7. updateComponents() → dendrites strengthen       — learn association
```

**Result**: The combination lobe dendrites connecting "see food + hungry" → "eat" are permanently strengthened. When awake, if the creature sees food and is hungry, the "eat" decision neuron receives stronger input and is more likely to win.

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_INSTINCTS` | 255 | Maximum pending instincts in queue |
| `MAX_INSTINCT_INPUTS` | 3 | Input stimuli per instinct gene |
| `REINFORCEMENT_MODIFIER` | 0.5 | Scaling factor for reinforcement amount |
| `NUMACTIONS` | 14 | Possible decision actions (0-13) |
| `NUMDRIVES` | 20 | Possible reinforcement drives (0-19) |
| Instinct chemical | 213 | Signals active instinct processing |
| Pre-instinct chemical | 212 | One-tick warning before instinct mode |

## Source Files

| File | Description |
|------|-------------|
| `Assets/Catalogue/Brain.catalogue:159-161` | Catalogue — instinct chemical 213, pre-instinct chemical 212 |
| `Rebuild/Main_Game/src/engine/creature/brain/Instinct.js` | JS rebuild — Instinct class |
| `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:287-296` | JS — instinct gene reading |
| `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:313-333` | JS — instinct processing during update |
| `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:425-446` | JS — SetWhetherToProcessInstincts() |
| `Rebuild/Main_Game/src/engine/creature/brain/BrainScriptFunctions.js` | JS — script offset ↔ neuron ID |
| `Rebuild/Main_Game/src/engine/creature/genome/GenomeConstants.js:60` | JS — G_INSTINCT = 5 |
