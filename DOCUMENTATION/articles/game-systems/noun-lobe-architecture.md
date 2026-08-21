# [noun] Noun Lobe Architecture

This article provides a deep-dive into the noun lobe (`noun`) — the **input mirror** for the attention lobe (`attn`). With 40 neurons (one per agent category), the noun lobe receives linguistic, stimulus, and instinct signals that bias which category of object the creature will focus on. It is one of the 9 engine-fed input lobes and plays a central role in the language-to-attention pipeline: when a creature hears "food", the noun lobe's food neuron activates, biasing the attention lobe toward the food category. The noun lobe also feeds into the stimulus source lobe (`stim`) via a gated tract, contributing to the multi-sensory saliency map that modulates the combination lobe.

## End-to-End Data Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│              NOUN LOBE DATA FLOW (END-TO-END)                          │
│                                                                       │
│   Engine writes to noun via setInput():                               │
│                                                                       │
│   ┌──────────────────────┐                                            │
│   │  LinguisticFaculty   │── hearSentence("push food")               │
│   │  .handleSentence     │   → noun neuron 11 (food) += 0.7×strength │
│   │   Semantics()        │                                            │
│   └──────────────────────┘                                            │
│                                                                       │
│   ┌──────────────────────┐                                            │
│   │  SensoryFaculty      │── URGE/STIM/SWAY commands                 │
│   │  .stimulate()        │   → noun neuron = nounIdToStim            │
│   └──────────────────────┘                                            │
│                                                                       │
│   ┌──────────────────────┐                                            │
│   │  Instinct.process()  │── REM sleep instinct wiring               │
│   │                      │   → specific noun neuron = 1.0            │
│   └──────────────────────┘   + visn = 0.1, smel = 1.0               │
│                                                                       │
│   ┌──────────────────────┐                                            │
│   │  Brain.knowledge()   │── Knowledge building during REM           │
│   │                      │   → ALL 40 noun neurons = 0.5             │
│   └──────────────────────┘                                            │
│                                                                       │
│                          ┌──────────┐                                 │
│   All writes ──────────► │   noun   │                                 │
│                          │ 40 neur  │                                 │
│                          │ (time 11)│                                 │
│                          └────┬─────┘                                 │
│                               │                                       │
│                ┌──────────────┼──────────────┐                        │
│                │  genome tracts              │  genome tract           │
│                ▼                              ▼                        │
│          ┌──────────┐                  ┌──────────┐                   │
│          │   attn   │                  │   stim   │                   │
│          │  (WTA)   │                  │ saliency │                   │
│          │ "what to │                  │   map    │                   │
│          │  focus?" │                  └────┬─────┘                   │
│          └──────────┘                       │                         │
│                                        ┌────▼─────┐                   │
│                                        │   comb   │                   │
│                                        │ decision │                   │
│                                        │  matrix  │                   │
│                                        └──────────┘                   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## The Noun-Attention Mirror Relationship

The noun lobe is the **input mirror** for the attention output lobe (`attn`), exactly as the verb lobe (`verb`) mirrors the decision lobe (`decn`):

| Output Lobe | Token | Function | Input Mirror | Mirror Token | Neurons |
|---|---|---|---|---|---|
| Attention | `attn` | "What to focus on?" | Noun | `noun` | 40 ("Agent Categories") |
| Decision | `decn` | "What action to do?" | Verb | `verb` | 14 ("Creature Actions") |

**Why mirrors exist**: Output lobes (`attn`, `decn`) run winner-takes-all — the engine reads the winning neuron but never writes directly to them. Input mirrors (`noun`, `verb`) provide the write pathway: external systems set noun inputs, genome-defined tracts propagate those signals into the attention lobe, and WTA competition selects the winning category.

### Instinct Remapping: attn → noun

Instinct genes in the genome encode lobe references by tissue ID. The genome editor uses `attn` to specify "which category should this instinct target?" But since `attn` is an output lobe (cannot receive `setInput` calls), the `Instinct` constructor remaps it:

**JS (Instinct.js:46-47)**:
```javascript
if (name === 'attn') name = 'noun';
```

This remapping is the definitive architectural proof that noun serves as the input channel for attention.

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `noun` | 4-character lobe identifier |
| **Full Name** | noun | From Brain.catalogue index 3 |
| **Catalogue Position** | Lobes: 3, Input Lobes: 1, Quads: 3 | One of 9 input lobes |
| **Neuron Names** | "Agent Categories" | Same 40 categories as visn, attn, stim |
| **Dimensions** | 40 wide x 1 high | **40 neurons**, one per agent category |
| **Update Time** | 11 | |
| **Switch-On Age** | 0 | Present from birth |
| **Winner Takes All** | No | Not a WTA lobe |
| **Tissue ID** | 2 | Has biochemical tissue linkage |
| **Init Rule Always** | 0 | Init rule runs once only |

### Category Mapping

Each of the 40 neurons represents one agent category — the same mapping used by `visn`, `attn`, `stim`, `smel`, and `move`:

| Neurons | Categories |
|---|---|
| 0 | Self |
| 1 | Hand (pointer) |
| 2-9 | Door, Seed, Plant, Weed, Leaf, Flower, Fruit, Manky |
| 10-19 | Detritus, Food, Button, Bug, Pest, Critter, Beast, Nest, Animal Egg, Weather |
| 20-29 | Bad, Toy, Incubator, Dispenser, Tool, Potion, Elevator, Teleporter, Machinery, Creature Egg |
| 30-39 | Norn Home, Grendel Home, Ettin Home, Gadget, Something, ... |

---

## SVRule: Leaky Integrator with Threshold

The noun lobe uses a **leaky integrator** update rule — signals accumulate but decay over time, with a minimum activation threshold:

### Update Rule (pseudocode)

```
acc = INPUT × 0.637;              // Decay new input by ~36%
acc = acc + STATE;                 // Add existing accumulated state
acc = tend(acc, 0, 0.048);        // Slowly tend toward zero
STATE = acc;                       // Store result
if (STATE <= 0.004) stop;         // Below threshold = effectively zero
```

### SVRule Bytecodes

```
0: no operation (NOP)
1: multiply accumulator by 0.637          // Decay factor on input
2: add neuron[0] to accumulator           // Add current STATE
3: set tend rate 0.048                     // Configure slow decay
4: tend accumulator toward zero            // Apply decay
5: store accumulator in neuron[0]          // Write back to STATE
6: if greater than 0.004                   // Threshold check
7: stop immediately                        // Below threshold = inactive
```

### Init Rule

Empty (`stop immediately`) — neurons initialize to zero.

### Behavioral Effect

The leaky integrator creates **temporal persistence with decay**:
- A single `setInput('noun', 11, 0.7)` call (hearing "food") creates an activation spike on neuron 11
- The activation persists for several brain ticks, slowly decaying via the 0.637 multiplier and 0.048 tend rate
- Multiple inputs accumulate: hearing "food" while also receiving a STIM targeting food strengthens the signal
- Below the 0.004 threshold, the neuron is effectively silent

This persistence is critical for language processing — the creature needs to "remember" what noun was spoken for several ticks while the brain processes the information and selects a behavioral response.

---

## Engine Input Sources: Who Writes to Noun

Unlike genome-only lobes that receive input exclusively through tracts, the noun lobe is a **true input lobe** — the engine writes directly to it via `brain.setInput('noun', neuronId, value)`. There are **4 distinct write sources**:

### Source 1: LinguisticFaculty — Speech Processing

When a creature hears speech containing a recognized noun word, the LinguisticFaculty writes to the noun lobe.

**JS (LinguisticFaculty.js:1345-1347)**:
```javascript
if (nounToNudge !== -1) {
    amountToNudgeNoun *= this.myVocab[WordType.NOUN][nounToNudge].learnedStrength;
    brain.setInput('noun', nounToNudge, amountToNudgeNoun);
}
```

**What is written**:
- **Neuron**: `nounToNudge` — the category ID of the recognized noun word (0-39)
- **Value**: `amountToNudgeNoun × learnedStrength` — base nudge scaled by word knowledge

**Base nudge values** depend on the sentence pattern:

| Sentence Pattern | Example | Base Nudge | Notes |
|---|---|---|---|
| Simple noun (`"n"`) | "food" | 0.7 | Default |
| Verb + noun (`"vn"`) | "push food" | 0.7 | Default |
| Qualifier + verb + noun (`"qvn"`) | "please push food" | 0.3 | Reduced (polite request) |
| Pointer command | Hand says "push food" | 1.1 | Exceeds 1.0 → forced override |
| Creature-to-creature | Norn says "push food" | 0.9 | Strong peer influence |

When `nounStim > 1.0` (pointer commands), the noun lobe is bypassed entirely and `MotorFaculty.setAttentionOverride()` is called instead, forcing the creature to attend to the specified category.

The `learnedStrength` multiplier starts low for unfamiliar words and increases as the creature learns vocabulary. A newborn creature hearing "food" gets minimal noun activation because it doesn't know the word yet. An adult that has learned the word "food" receives the full nudge.

### Source 2: SensoryFaculty.stimulate() — URGE/STIM/SWAY Commands

All stimulus-related CAOS commands ultimately flow through `SensoryFaculty.stimulate()`, which writes to noun:

```text
if (nounStim > 1.0) {
    Motor.setAttentionOverride(nounIdToStim)   // Force override
} else {
    if (nounStim != 0.0)
        brain.setInput("noun", nounIdToStim, nounStim)
}
```

**What is written**:
- **Neuron**: `nounIdToStim` — the category ID of the agent that triggered the stimulus (determined at runtime, not from genome)
- **Value**: `nounStim` — activation strength from the stimulus definition

**CAOS commands that trigger this**:

| Command Group | Commands | Noun Source |
|---|---|---|
| **URGE** | URGE WRIT, SIGN, SHOU, TACT | `noun_id` and `noun_stim` specified directly in CAOS |
| **STIM** | STIM WRIT, SIGN, SHOU, TACT | `nounStim` from genome stimulus definition |
| **SWAY** | SWAY WRIT, SIGN, SHOU, TACT | `nounStim` from genome stimulus definition + chemistry |

**Asleep attenuation**: If the creature is asleep and the stimulus has the `IFASLEEP` flag, `nounStim` is halved before being applied.

### Source 3: Brain.processInstinctsAndKnowledge() — Knowledge Building

During REM sleep, after instinct processing, the brain runs a **knowledge discovery** phase that stimulates all noun neurons uniformly:

**JS (Brain.js:359-365)**:
```javascript
const noNounNeurons = nounLobe.getNoOfNeurons();
for (let s = 0; s < noNounNeurons; s++) {
    this.setInput('noun', s, 0.5);
}
```

**What is written**: All 40 noun neurons set to **0.5** simultaneously.

**When**: For each of the 20 drives (hunger, pain, fear, etc.), the brain:
1. Stimulates all noun neurons to 0.5 (equal bias for all categories)
2. Stimulates all vision neurons to 0.1 (weak visual presence)
3. Stimulates the target drive neuron to 1.0 (maximum drive)
4. Runs a full brain update cycle (`updateComponents()`)
5. Records the winning `attn` and `decn` neurons → `myAssistanceKnowledge[drive]`

This builds a lookup table: "when hungry, the brain selects food (attn) and eat (decn)" — used by the LinguisticFaculty to express needs and by the MotorFaculty as a behavioral fallback.

### Source 4: Instinct.process() — Instinct Wiring During REM Sleep

When an instinct gene targets the noun lobe, the instinct system writes to it with **additional multi-sensory stimulation**:

**JS (Instinct.js:102-108)**:
```javascript
if (lobeName === 'noun') {
    this.myBrain.setInput('visn', neuronId, 0.1);    // Simulate seeing it
    this.myBrain.setInput('smel', neuronId, 1.0);    // Simulate smelling it
}
this.myBrain.setInput('noun', neuronId, 1.0);        // Full activation
```

**What is written**: The target noun neuron is set to **1.0** (full activation). Additionally:
- The corresponding `visn` neuron is set to 0.1 (weak vision signal — "seeing" the object in the dream)
- The corresponding `smel` neuron is set to 1.0 (full smell signal)

**Why the extra stimulation**: Instincts wire the brain during REM sleep. For the instinct to create proper neural pathways, the brain needs to simulate a complete sensory experience — not just "thinking about food" (noun) but also "seeing food" (visn) and "smelling food" (smel). This multi-sensory context ensures the instinct creates associations that will fire correctly during waking experience.

---

## Engine Read Sites: Who Reads from Noun

### Conversation Stability (Original Engine Only)

In the original engine, `SensoryFaculty::UpdateVisionLobe()` reads the noun neuron state to implement **conversation stability** — keeping the creature's attention on an object it is "thinking about":

```text
if (myKnownAgents[genusId].isValid() and
    creature.canSee(myKnownAgents[genusId]) and
    creature.getBrain().getNeuronState("noun", genusId, STATE_VAR) > 0.20) {
    // Keep tracking this agent — creature is engaged with this category
    continue
}
```

When noun neuron activation exceeds 0.20 for a category, the creature is considered to be "engaged" with objects of that type. The vision update preserves the existing known agent rather than searching for a new representative, preventing attention from flickering away during conversation.

**JS divergence**: The JS rebuild at `SensoryFaculty.js:396-432` implements conversation stability differently — it only checks if the previous agent is still within visual range, **without** reading the noun neuron state. This may cause creatures to be less stable in their attention during language interaction.

### Attention Override Clearing

When a creature is forced to pay attention to a new creature (e.g., during speech processing), the noun neuron for that category is cleared:

**JS (SensoryFaculty.js:922-923)**:
```javascript
brain.clearNeuronActivity('noun', id);
```

This prevents stale noun signals from competing with the new forced attention target.

---

## Outbound Tract: noun → stim (Gated)

The noun lobe has exactly **one genome-defined outbound tract**, connecting to the stimulus source lobe:

| Property | Value |
|---|---|
| **Source Lobe** | `noun` (40 neurons) |
| **Destination Lobe** | `stim` (40 neurons) |
| **Connections** | 1:1, one per category |
| **Update Time** | 15 |
| **Switch-On Age** | 0 (from birth) |
| **Migrates** | No |

### Tract SVRule (pseudocode)

```
if (stim.INPUT == 0) {
    stop;                          // Gate closed: only fires if stim already active
}
// Stim already has signal from visn/move/smel tracts — boost with noun data
acc = noun.STATE × 0.843;         // Scale noun signal
stim.INPUT += acc;                 // Add to stim input
```

### What This Means

The noun→stim tract is **conditionally gated**: it only fires when the stim neuron already has activity from other sensory channels (vision, motion, smell). This means:
- Hearing "food" when food is **visible** → noun amplifies the food stim neuron → stronger saliency in the decision matrix
- Hearing "food" when food is **not perceptible** → stim neuron has no baseline activity → noun signal is gated out → no effect

Language amplifies existing perception rather than creating phantom perception. This grounds the creature's language understanding in sensory experience.

---

## Inbound Tracts: None

The noun lobe has **zero inbound tract connections** from other brain lobes. This is characteristic of **pure input lobes** — they receive all their activation directly from engine `setInput()` calls, not from other neural lobe outputs.

This distinguishes input lobes from intermediate processing lobes (like `move`, `comb`) which receive all their input through genome-defined tracts. The complete set of 9 input lobes all share this pattern: the engine writes to them, and they feed downstream through tracts.

---

## Role in the Brain Architecture

The noun lobe sits at the intersection of **language, stimuli, and attention**:

```
                 ┌──────────────────────────────┐
                 │     External Input Sources     │
                 │                                │
                 │  LinguisticFaculty (speech)    │──── "food" → neuron 11
                 │  SensoryFaculty (STIM/URGE)   │──── stimulus → target category
                 │  Instinct (REM dreams)         │──── instinct → category = 1.0
                 │  Brain (knowledge building)    │──── all neurons = 0.5
                 │                                │
                 └──────────────┬─────────────────┘
                                │  setInput('noun', id, value)
                                ▼
                         ┌──────────┐
                         │   noun   │  40 neurons (leaky integrator)
                         │ (time 11)│  Input mirror for attn
                         └────┬─────┘
                              │
               ┌──────────────┼──────────────┐
               │  genome tracts              │  genome tract
               ▼                              ▼
         ┌──────────┐                  ┌──────────┐
         │   attn   │                  │   stim   │
         │ 40 WTA   │                  │ saliency │
         │ "what?"  │                  └────┬─────┘
         └──────────┘                       ▼
                                      ┌──────────┐
                                      │   comb   │
                                      │ 440 neur │
                                      └──────────┘
```

### The Language-to-Behavior Pipeline

The noun lobe enables a complete pipeline from spoken words to creature behavior:

1. **Player says "push food"** → LinguisticFaculty parses sentence
2. **LinguisticFaculty** writes `noun` neuron 11 (food) = 0.7 × learnedStrength, `verb` neuron 1 (push) = value
3. **noun→stim tract** amplifies food saliency in the stim lobe (if food is visible)
4. **Genome tracts** propagate noun signal to `attn` lobe, verb signal to `decn` lobe
5. **Attention WTA** selects food category → MotorFaculty resolves to nearest food agent
6. **Decision WTA** selects push action → MotorFaculty executes push script on IT agent
7. **Creature pushes the food**

### Why Noun Activation Must Persist

The leaky integrator design (0.637 decay, 0.048 tend rate) is critical because:
- The language processing happens in one brain tick
- The attention/decision resolution happens in subsequent ticks
- The noun activation must persist long enough for genome tracts to propagate it to attn
- But it must also decay eventually to prevent the creature from being permanently fixated

---

## CAOS Commands That Affect the Noun Lobe

All stimulus commands flow through `SensoryFaculty.stimulate()`:

| Command | Parameters | Noun Write |
|---|---|---|
| **URGE WRIT** | noun_id, noun_stim (explicit) | Direct: setInput('noun', noun_id, noun_stim) |
| **URGE SIGN/SHOU/TACT** | noun_stim (auto noun_id from TARG) | Derived: category of triggering agent |
| **STIM WRIT/SIGN/SHOU/TACT** | stimulus_number | Genome-defined: nounStim from stimulus gene |
| **SWAY WRIT/SIGN/SHOU/TACT** | stimulus_number | Genome-defined: nounStim + chemistry |
| **ORDR WRIT** | sentence string | Linguistic: parsed noun word → nounToNudge |

### URGE Override Mechanism

When `nounStim > 1.0` (typically pointer/player commands), the noun lobe is **bypassed entirely**:

```javascript
if (stimulus.nounStim > 1.0) {
    creature.Motor().setAttentionOverride(stimulus.nounIdToStim);
    // Noun lobe NOT written — direct motor override
}
```

This ensures player commands are obeyed immediately without waiting for the brain's neural competition to resolve. The creature's attention is forced to the specified category regardless of what the brain would have selected.

---

## Original Engine vs JavaScript Implementation

### Aligned

- Both write to noun from the same 4 sources (LinguisticFaculty, SensoryFaculty, Brain knowledge, Instinct)
- Both implement the attn→noun instinct remapping
- Both clear noun activity in payAttentionToCreature()
- The noun→stim outbound tract is genome-driven and identical in both

### Divergence: Conversation Stability

The original engine reads `GetNeuronState("noun", genusId, STATE_VAR) > 0.20` during vision updates to preserve attention on categories the creature is "thinking about". The JS rebuild does **not** implement this check — it only verifies that the previous known agent is still within visual range. This may cause JS creatures to be less attentionally stable during conversations.

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Catalogue/Brain.catalogue` | Defines noun at index 3 — one of 9 input lobes |
| `Main_Game/src/engine/creature/faculties/LinguisticFaculty.js` | Speech processing: writes nounToNudge × learnedStrength |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | Stimulus processing: writes nounIdToStim; payAttentionToCreature clears noun |
| `Main_Game/src/engine/creature/brain/Brain.js` | Knowledge building: all 40 neurons = 0.5 |
| `Main_Game/src/engine/creature/brain/Instinct.js` | attn→noun remapping; instinct wiring: noun=1.0, visn=0.1, smel=1.0 |
| `Main_Game/src/engine/creature/brain/Lobe.js` | General lobe processing (leaky integrator SVRule) |
| `Main_Game/src/engine/creature/brain/Tract.js` | noun→stim tract processing |

---

## Related Articles

- **[attn] Attention Lobe Architecture** — Downstream output lobe that noun mirrors; receives noun signals through genome tracts
- **[verb] Verb Lobe Architecture** — Parallel input mirror for the decision lobe (verb↔decn as noun↔attn)
- **[stim] Stimulus Source Lobe Architecture** — Receives noun signals through the gated noun→stim tract
- **[comb] Combination Lobe Architecture** — Receives noun influence indirectly via stim→comb
- **[decn] Decision Lobe Architecture** — Partner output lobe; noun+verb together drive attention+decision
- **[driv] Drive Lobe Architecture** — Knowledge building stimulates noun and drive simultaneously
- **Brain & Neural Networks** — Overview of the complete brain architecture
