# [verb] Verb Lobe Architecture

This article provides a deep-dive into the verb lobe (`verb`) — the **input mirror** for the decision lobe (`decn`). With 13 neurons (one per action), the verb lobe receives linguistic, stimulus, and instinct signals that bias which action the creature will perform. It is one of the 9 engine-fed input lobes and plays a central role in the language-to-action pipeline: when a creature hears "push", the verb lobe's push neuron activates, biasing the decision lobe toward the push action. The verb lobe feeds into the combination lobe (`comb`) through a row-mapping tract (each verb activates a full row of 40 comb neurons) and has a secondary direct connection from neurons 11-12 to the decision lobe for special bypass actions.

## End-to-End Data Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│              VERB LOBE DATA FLOW (END-TO-END)                          │
│                                                                       │
│   Engine writes to verb via setInput():                               │
│                                                                       │
│   ┌──────────────────────┐                                            │
│   │  LinguisticFaculty   │── hearSentence("push food")               │
│   │  .handleSentence     │   → verb neuron 1 (push) += 0.9×strength  │
│   │   Semantics()        │                                            │
│   └──────────────────────┘                                            │
│                                                                       │
│   ┌──────────────────────┐                                            │
│   │  SensoryFaculty      │── URGE/STIM/SWAY commands                 │
│   │  .stimulate()        │   → verb neuron = verbIdToStim            │
│   └──────────────────────┘   (script offset → neuron ID translation) │
│                                                                       │
│   ┌──────────────────────┐                                            │
│   │  Instinct.process()  │── REM sleep instinct wiring               │
│   │                      │   → specific verb neuron = 1.0            │
│   └──────────────────────┘                                            │
│                                                                       │
│                          ┌──────────┐                                 │
│   All writes ──────────► │   verb   │                                 │
│                          │ 13 neur  │                                 │
│                          │ (time 16)│                                 │
│                          └────┬─────┘                                 │
│                               │                                       │
│              ┌────────────────┼───────────────────┐                   │
│              │ verb→comb (time 17)                │ verb→decn (22)   │
│              │ neurons 0-10                       │ neurons 11-12    │
│              │ each → 40 comb neurons (one row)   │ direct bypass    │
│              ▼                                     ▼                   │
│        ┌──────────┐                          ┌──────────┐             │
│        │   comb   │                          │   decn   │             │
│        │  440 neur│─── comb→decn ──────────►│  (WTA)   │             │
│        │  decision│                          │ "do what?"│             │
│        │  matrix  │                          └──────────┘             │
│        └──────────┘                                                   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## The Verb-Decision Mirror Relationship

The verb lobe is the **input mirror** for the decision output lobe (`decn`), exactly as the noun lobe (`noun`) mirrors the attention lobe (`attn`):

| Output Lobe | Token | Function | Input Mirror | Mirror Token | Neurons |
|---|---|---|---|---|---|
| Decision | `decn` | "What action to do?" | Verb | `verb` | 13 ("Creature Actions") |
| Attention | `attn` | "What to focus on?" | Noun | `noun` | 40 ("Agent Categories") |

**Why mirrors exist**: Output lobes (`attn`, `decn`) run winner-takes-all — the engine reads the winning neuron but never writes directly to them. Input mirrors (`verb`, `noun`) provide the write pathway: external systems set verb inputs, genome-defined tracts propagate those signals into the decision matrix, and WTA competition selects the winning action.

### Instinct Remapping: decn → verb

Instinct genes in the genome encode lobe references by tissue ID. The genome editor uses `decn` to specify "which action should this instinct trigger?" But since `decn` is an output lobe (cannot receive `setInput` calls), the `Instinct` constructor remaps it:

**JS (Instinct.js:46)**:
```javascript
if (name === 'decn') name = 'verb';
```

This remapping is the definitive architectural proof that verb serves as the input channel for decision, just as noun serves as the input channel for attention.

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `verb` | 4-character lobe identifier |
| **Full Name** | verb | From Brain.catalogue index 2 |
| **Catalogue Position** | Lobes: 2, Input Lobes: 0 (first listed), Quads: 2 | One of 9 input lobes |
| **Neuron Names** | "Creature Actions" | 17 action names in catalogue |
| **Dimensions** | 1 wide x 13 high | **13 neurons** |
| **Update Time** | 16 | |
| **Switch-On Age** | 0 | Present from birth |
| **Winner Takes All** | No | Not a WTA lobe |
| **Tissue ID** | 1 | Has biochemical tissue linkage |
| **Init Rule Always** | 0 | Init rule runs once only |

---

## Action Mapping: Script Offsets, Neuron IDs, and Catalogue Names

The verb lobe has a **non-trivial mapping** between three different numbering systems. Understanding this mapping is critical because the engine uses script offsets while the brain uses neuron IDs.

### The Three Systems

1. **Script Offsets** (0-13): Used by CAOS commands, stimulus definitions, and MotorFaculty. These are the `ActionOffsets` / `decisionoffsets` enum values.
2. **Neuron IDs** (0-12): Physical position in the verb/decn lobes. Used by `brain.setInput('verb', neuronId, value)`.
3. **Catalogue Names**: Human-readable action names from "Creature Actions" catalogue.

### Script Offset → Neuron ID Mapping

The mapping is defined by the **"Action Script To Neuron Mappings"** catalogue array. It is NOT a 1:1 identity mapping — the genome designers rearranged neuron positions to group related actions:

| Script Offset | Action Enum | Neuron ID | Catalogue Name |
|---|---|---|---|
| 0 | AC_DEFAULT (look) | 0 | look |
| 1 | AC_ACTIVATE1 (push) | 1 | push |
| 2 | AC_ACTIVATE2 (pull) | 6 | pull |
| 3 | AC_DEACTIVATE | 7 | deactivate |
| 4 | AC_APPROACH | 12 | approach |
| 5 | AC_RETREAT | 2 | retreat |
| 6 | AC_GET | 4 | get |
| 7 | AC_DROP | 13 | drop |
| 8 | AC_EXPRESSNEED | 5 | express |
| 9 | AC_REST | 8 | rest |
| 10 | AC_TRAVWEST (left) | 9 | left |
| 11 | AC_TRAVEAST (right) | 10 | right |
| 12 | AC_EAT | 11 | eat |
| 13 | AC_HIT | 3 | hit |

### The Translation Functions

Every call site that writes to the verb lobe using a script offset must translate via `getNeuronIdFromScriptOffset()`:

**JS (BrainScriptFunctions.js:85-95)**:
```javascript
function getNeuronIdFromScriptOffset(scriptOffset) {
    return scriptToNeuronMap[scriptOffset];  // Lookup from catalogue
}
```

And the reverse mapping is used when reading decisions from the decn lobe:
```javascript
function getScriptOffsetFromNeuronId(neuronId) {
    return neuronToScriptMap[neuronId];      // Reverse lookup
}
```

---

## SVRule: Leaky Integrator with Threshold

The verb lobe uses the same **leaky integrator** update rule as the noun lobe — signals accumulate but decay over time, with a minimum activation threshold:

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

Identical to the noun lobe's design:
- A single `setInput('verb', 1, 0.9)` call (hearing "push") creates an activation spike on neuron 1
- The activation persists for several brain ticks, slowly decaying
- Multiple inputs accumulate: hearing "push" while also receiving a push URGE strengthens the signal
- Below the 0.004 threshold, the neuron is effectively silent

The persistence ensures the verb signal survives long enough for genome tracts to propagate it through the combination lobe to the decision lobe.

---

## Engine Input Sources: Who Writes to Verb

The verb lobe is a **true input lobe** — the engine writes directly to it via `brain.setInput('verb', neuronId, value)`. There are **3 distinct write sources**:

### Source 1: LinguisticFaculty — Speech Processing

When a creature hears speech containing a recognized verb word, the LinguisticFaculty writes to the verb lobe.

**JS (LinguisticFaculty.js:1349-1353)**:
```javascript
if (verbToNudge !== -1) {
    amountToNudgeVerb *= this.myVocab[WordType.VERB][verbToNudge].learnedStrength;
    brain.setInput('verb', verbToNudge, amountToNudgeVerb);
}
```

**Critical**: The `verbToNudge` is **already a neuron ID** — the translation from script offset happens earlier in `handleCommandPattern()`:
```javascript
verbToNudge = getNeuronIdFromScriptOffset(wordsHeard[WordType.VERB]);
```

**What is written**:
- **Neuron**: `verbToNudge` — the neuron ID of the recognized verb action (0-12)
- **Value**: `amountToNudgeVerb × learnedStrength` — base nudge scaled by word knowledge

**Base nudge values** depend on the sentence pattern and speaker:

| Context | Base Nudge | Notes |
|---|---|---|
| Default verb command | 0.9 | Standard speech |
| Qualifier "maybe" / polite | 0.3 | Reduced influence |
| Qualifier "definitely" / pointer | 1.1 | Exceeds 1.0 → forced override |
| Creature-to-creature | 0.9 | Peer communication |

When the base nudge exceeds 1.0 after `learnedStrength` multiplication, the verb lobe is **bypassed** and `MotorFaculty.setDecisionOverride()` is called instead, forcing the action directly.

### Source 2: SensoryFaculty.stimulate() — URGE/STIM/SWAY Commands

All stimulus-related CAOS commands flow through `SensoryFaculty.stimulate()`:

```text
if s.verbStim > 1.0:
    Motor.SetDecisionOverride(s.verbIdToStim)    // Force override
else:
    if s.verbStim != 0.0:
        brain.SetInput("verb",
            GetNeuronIdFromScriptOffset(s.verbIdToStim), s.verbStim)
```

**Three-tier behavior based on verbStim magnitude**:

| verbStim Range | Behavior |
|---|---|
| `> 1.0` | **Bypass brain**: `SetDecisionOverride()` forces the action directly |
| `0.0 < v ≤ 1.0` | **Nudge brain**: `setInput('verb', neuronId, verbStim)` — brain decides |
| `== 0.0` | **No effect**: verb lobe not written |

**Critical translation**: `verbIdToStim` is a **script offset** (0-13), not a neuron ID. It must be converted via `GetNeuronIdFromScriptOffset()` before writing to the lobe.

**Asleep attenuation**: If the creature is asleep, `verbStim` is halved before processing.

**CAOS commands that trigger this**:

| Command Group | Commands | Verb Source |
|---|---|---|
| **URGE** | URGE WRIT, SIGN, SHOU, TACT | `verb_id` and `verb_stim` specified directly |
| **STIM** | STIM WRIT, SIGN, SHOU, TACT | `verbStim` from genome stimulus definition |
| **SWAY** | SWAY WRIT, SIGN, SHOU, TACT | `verbStim` from genome stimulus definition + chemistry |

### Source 3: Instinct.process() — Instinct Wiring During REM Sleep

When an instinct gene targets the verb lobe (after `decn→verb` remapping), the instinct system writes to it:

**JS (Instinct.js:93-112)**:
```javascript
// In the input loop (remapped from decn→verb):
if (lobeName === 'verb') {
    neuronId = getNeuronIdFromScriptOffset(neuronId);  // Translate
}
this.myBrain.setInput('verb', neuronId, 1.0);          // Full activation

// After all inputs set, force the target decision:
this.myBrain.setInput('verb', this.myDecisionId, 1.0);
```

**What is written**: The target verb neuron is set to **1.0** (full activation). The `myDecisionId` is also written at 1.0 to force the decision lobe to select the instinct's intended action.

**When**: During REM sleep (dreaming state), when the brain processes instinct genes from the genome. Each instinct is processed one per update tick. The brain then runs `updateComponents()` and checks if `getWinningId('decn')` matches the expected decision — if so, the instinct is considered "processed" and reinforcement is applied.

---

## Outbound Tracts: 2 Output Connections

The verb lobe has **two outbound tracts** with distinctly different roles:

### Tract 1: verb → comb (Row Activation, neurons 0-10)

The primary output tract — each verb neuron activates a **full row of 40 neurons** in the combination matrix.

| Property | Value |
|---|---|
| **Source Lobe** | `verb` (neurons 0-10, 11 of 13 neurons) |
| **Destination Lobe** | `comb` (neurons 0-439, all 440 neurons) |
| **Connections** | 1 per verb neuron → 40 per destination neuron |
| **Update Time** | 17 |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
acc = verb.STATE;                  // Read verb neuron output
acc = acc / 0.5;                   // Divide by 0.5 = double the signal
comb.INPUT += acc;                 // Add to comb neuron input
```

**What this means**: When verb neuron 1 (push) activates, all 40 neurons in comb row 1 receive the signal: "push self", "push hand", "push door", ..., "push [last category]". This creates a **linguistic bias toward the mentioned action** across all possible target objects. The division by 0.5 (effectively doubling) gives verb signals strong influence in the combination matrix.

The 11 verb neurons (0-10) map to the 11 rows of the comb lobe, matching the comb lobe's 40×11 = 440 neuron structure.

### Tract 2: verb → decn (Direct Bypass, neurons 11-12)

A secondary tract providing a **direct bypass** from the last two verb neurons to the decision lobe, skipping the combination matrix entirely.

| Property | Value |
|---|---|
| **Source Lobe** | `verb` (neurons 11-12 only) |
| **Destination Lobe** | `decn` (neurons 11-12) |
| **Connections** | 1:1 direct mapping |
| **Update Time** | 22 (after comb→decn at time 21) |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
acc = verb.STATE;                  // Read verb neuron output
acc = acc × 0.298;                 // Attenuate to ~30%
decn.INPUT = acc;                  // Write directly to decision neuron
```

**What this means**: Verb neurons 11 and 12 connect directly to decision neurons 11 and 12, bypassing the combination lobe. These correspond to actions that don't need object-category evaluation through the comb matrix — they are likely **eat** (neuron 11, script offset 12) and **approach** (neuron 12, script offset 4) based on the neuron ID mapping.

The signal is attenuated (×0.298) to prevent these direct inputs from overwhelming the comb→decn signals that arrive at update time 21 (one tick earlier). The verb→decn bypass at time 22 adds supplementary influence after the main decision pipeline has processed.

---

## Inbound Tracts: None

The verb lobe has **zero inbound tract connections** from other brain lobes. This is characteristic of **pure input lobes** — they receive all their activation directly from engine `setInput()` calls, not from other neural lobe outputs.

---

## The Stimulus Structure: verbIdToStim vs verbStim

The Stimulus object has two verb-related fields:

```javascript
// Stimulus.js
this.verbIdToStim = -1;    // Script offset (NOT neuron ID!) — set at runtime
this.verbStim = 0.0;       // Activation strength — from genome or CAOS params
```

**Critical distinction**:
- `verbIdToStim` is a **script offset** (0-13, from the `ActionOffsets` enum). It is NOT a neuron ID. Before writing to the verb lobe, it must be translated via `getNeuronIdFromScriptOffset()`.
- `verbStim` is the activation strength. For genome-defined stimuli (STIM/SWAY), it comes from the stimulus gene. For URGE commands, it is specified directly in the CAOS parameters.

---

## Role in the Brain Architecture

The verb lobe sits at the intersection of **language, stimuli, instincts, and action selection**:

```
                 ┌──────────────────────────────┐
                 │     External Input Sources     │
                 │                                │
                 │  LinguisticFaculty (speech)    │──── "push" → neuron 1
                 │  SensoryFaculty (STIM/URGE)   │──── stimulus → action neuron
                 │  Instinct (REM dreams)         │──── instinct → action = 1.0
                 │                                │
                 └──────────────┬─────────────────┘
                                │  setInput('verb', id, value)
                                │  (script offset → neuron ID translation)
                                ▼
                         ┌──────────┐
                         │   verb   │  13 neurons (leaky integrator)
                         │ (time 16)│  Input mirror for decn
                         └────┬─────┘
                              │
              ┌───────────────┼──────────────────┐
              │  verb→comb (time 17)             │  verb→decn (time 22)
              │  neurons 0-10                    │  neurons 11-12
              │  each → 40 comb neurons          │  direct bypass
              ▼                                   ▼
        ┌──────────┐                        ┌──────────┐
        │   comb   │──── comb→decn ────────►│   decn   │
        │  440 neur│     (time 21)          │  13 WTA  │
        │  decision│                        │ "do what?"│
        │  matrix  │                        └──────────┘
        └──────────┘
```

### The Language-to-Action Pipeline

The verb lobe enables a complete pipeline from spoken actions to creature behavior:

1. **Player says "push food"** → LinguisticFaculty parses sentence
2. **LinguisticFaculty** translates verb word to neuron ID via `getNeuronIdFromScriptOffset()`, writes `verb` neuron 1 (push) = 0.9 × learnedStrength
3. **verb→comb tract** (time 17): Push neuron doubles and fans out to all 40 neurons in comb row 1 ("push self", "push hand", "push food", ...) — linguistic bias toward pushing
4. **Simultaneously**, noun→stim→comb pathway provides object saliency, and driv→comb provides motivational weighting
5. **comb→decn tract** (time 21): Row sums feed decision lobe — "push" row accumulates across all categories
6. **Decision WTA** selects push action → MotorFaculty executes push script on the IT agent
7. **Creature pushes food**

### Verb + Noun = Complete Command

The verb and noun lobes work in concert to translate language into behavior:
- **Noun** biases the **attention** lobe toward a category ("what to focus on")
- **Verb** biases the **decision** lobe toward an action ("what to do")
- Together, they produce a complete behavioral intention: "push food" = attn→food + decn→push

The combination lobe (`comb`) is where verb and noun signals merge — verb activates a row (action), while noun (via stim) modulates columns (categories). The intersection point — e.g., comb neuron "push-food" — receives both verb and noun/stim influence.

---

## CAOS Commands That Affect the Verb Lobe

All stimulus commands flow through `SensoryFaculty.stimulate()`:

| Command | Parameters | Verb Write |
|---|---|---|
| **URGE WRIT** | verb_id, verb_stim (explicit) | Direct: setInput('verb', neuronId, verbStim) |
| **URGE SIGN/SHOU/TACT** | verb_stim | `verbIdToStim` from triggering event |
| **STIM WRIT/SIGN/SHOU/TACT** | stimulus_number | Genome-defined: verbStim from stimulus gene |
| **SWAY WRIT/SIGN/SHOU/TACT** | stimulus_number | Genome-defined: verbStim + chemistry |
| **ORDR WRIT** | sentence string | Linguistic: parsed verb word → verbToNudge |

### Decision Override Mechanism

When `verbStim > 1.0` (typically pointer/player definitive commands), the verb lobe is **bypassed entirely**:

```javascript
if (stimulus.verbStim > 1.0) {
    creature.Motor().setDecisionOverride(stimulus.verbIdToStim);
    // Verb lobe NOT written — direct motor override
}
```

This ensures strong commands are obeyed immediately without waiting for neural competition. The creature's decision is forced regardless of what the brain would have selected.

---

## Original Engine vs JavaScript Implementation

### Aligned

- Both write to verb from the same 3 sources (LinguisticFaculty, SensoryFaculty, Instinct)
- Both implement the decn→verb instinct remapping
- Both apply `getNeuronIdFromScriptOffset()` translation at all call sites
- Both implement the three-tier verbStim logic (>1.0 override, 0-1.0 nudge, 0.0 skip)
- Both outbound tracts (verb→comb, verb→decn) are genome-driven and identical

### No Known Divergence

Unlike the noun lobe (which has an original-engine-only conversation stability check), the verb lobe implementation appears fully aligned between the original engine and the JS rebuild.

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Catalogue/Brain.catalogue` | Defines verb at index 2 — one of 9 input lobes, neuron names = "Creature Actions" |
| `Assets/Catalogue/Creatures 3.catalogue` | "Action Script To Neuron Mappings" — script offset ↔ neuron ID translation |
| `Main_Game/src/engine/creature/faculties/LinguisticFaculty.js` | Speech processing: writes verbToNudge × learnedStrength |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | Stimulus processing: writes verbIdToStim with verbStim |
| `Main_Game/src/engine/creature/brain/Instinct.js` | decn→verb remapping; instinct wiring: verb=1.0 |
| `Main_Game/src/engine/creature/brain/BrainScriptFunctions.js` | `getNeuronIdFromScriptOffset()` / `getScriptOffsetFromNeuronId()` |
| `Main_Game/src/engine/creature/brain/Lobe.js` | General lobe processing (leaky integrator SVRule) |
| `Main_Game/src/engine/creature/brain/Tract.js` | verb→comb and verb→decn tract processing |
| `Main_Game/src/engine/creature/CreatureConstants.js` | `ActionOffsets` enum, `NUMACTIONS = 14` |
| `Main_Game/src/engine/creature/faculties/MotorFaculty.js` | `setDecisionOverride()` — bypass when verbStim > 1.0 |

---

## Related Articles

- **[decn] Decision Lobe Architecture** — Downstream output lobe that verb mirrors; receives verb signals through comb→decn and verb→decn tracts
- **[noun] Noun Lobe Architecture** — Parallel input mirror for the attention lobe (noun↔attn as verb↔decn)
- **[comb] Combination Lobe Architecture** — Receives verb signals through verb→comb tract; verb activates a full row of 40 comb neurons
- **[attn] Attention Lobe Architecture** — Partner output lobe; verb+noun together drive decision+attention
- **[stim] Stimulus Source Lobe Architecture** — Noun feeds stim which modulates comb alongside verb
- **Brain & Neural Networks** — Overview of the complete brain architecture
