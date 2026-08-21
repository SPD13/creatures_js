# [decn] Decision Lobe Architecture

This article provides a deep-dive into the decision lobe (`decn`) — one of the two **output lobes** of the creature's brain. While input lobes (visn, detl, situ, driv, smll) encode sensory data from the world, the decision lobe is where the brain's neural competition produces a single behavioral choice: **what should the creature do?** Its partner output lobe, the attention lobe (`attn`), independently answers the complementary question: **what should the creature focus on?** Together, they drive the creature's motor behavior.

This article covers the decision lobe's winner-takes-all mechanism, its relationship to the verb lobe, the 13 action neurons (mapped from 14 action constants), the neuron-to-script mapping pipeline, and how the MotorFaculty translates the winning neuron into CAOS script execution.

## End-to-End Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│            DECISION LOBE DATA FLOW (END-TO-END)                       │
│                                                                      │
│   Input Lobes (written by SensoryFaculty each brain tick):           │
│   ├── driv  — 20 drive neurons (hunger, pain, fear, etc.)           │
│   ├── visn  — 40 vision neurons (X displacement per category)       │
│   ├── smll  — 40 smell neurons (CA emission per category)           │
│   ├── situ  — 9 situation neurons (creature's own state)            │
│   ├── detl  — 11 detail neurons (IT agent properties)               │
│   ├── resp  — response neurons (reinforcement signals)              │
│   └── prox  — proximity neurons (distance information)              │
│       │                                                              │
│       ▼                                                              │
│   Genome-defined Tracts (dendrite connections)                       │
│   └── Weighted signals flow from input lobes → intermediate lobes    │
│       │                                                              │
│       ▼                                                              │
│   Verb Lobe ("verb") — input mirror of decision lobe                │
│   └── 13 neurons matching action categories                         │
│   │   Receives tract inputs from drives, concepts, learning         │
│   │   The verb lobe is the INPUT side; decn is the OUTPUT side      │
│   │                                                                  │
│   │   Tract: verb → decn                                            │
│   │                                                                  │
│   ▼                                                                  │
│   Decision Lobe ("decn") — 13 neurons, WINNER-TAKES-ALL             │
│   ├── SVRule processes each neuron                                   │
│   ├── Neurons compete: strongest signals "setSpareNeuronToCurrent"  │
│   └── One winning neuron ID emerges                                  │
│       │                                                              │
│       ▼                                                              │
│   Brain.getWinningId('decn') → winning neuron ID (0-12)             │
│       │                                                              │
│       ▼                                                              │
│   BrainScriptFunctions.getScriptOffsetFromNeuronId()                │
│   └── Neuron ID → script offset (0-13), remappable via catalogue    │
│       │                                                              │
│       ▼                                                              │
│   MotorFaculty.processBrainDecision()                                │
│   ├── scriptOffset + 16 → object interaction script event           │
│   ├── scriptOffset + 32 → creature-creature script event            │
│   └── creature.executeScriptForEvent(event, creature, 0, 0)        │
│       │                                                              │
│       ▼                                                              │
│   CAOS Script Execution                                              │
│   └── Creature performs the selected behavior (eat, approach, etc.) │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## The Two Output Lobes: Decision + Attention

The brain has exactly two **output lobes**, identified in the Brain catalogue:

```
ARRAY "Brain Output Lobes" 2
"attention"     ← attn: WHAT to focus on (category ID)
"decision"      ← decn: WHAT to do (action ID)
```

These are independent winner-takes-all competitions running in parallel:

| Output Lobe | Token | Question Answered | Consumer |
|-------------|-------|------------------|----------|
| Attention | `attn` | "Which object should I pay attention to?" | `MotorFaculty.processBrainAttention()` → sets IT agent |
| Decision | `decn` | "What action should I perform?" | `MotorFaculty.processBrainDecision()` → executes script |

The MotorFaculty reads both winners each tick to determine the creature's complete behavior: perform action X on object Y.

```text
// MotorFaculty Update()
winningAttentionId = GetBrain().GetWinningId("attn")            // WHAT
scriptAction = GetScriptOffsetFromNeuronId(
    GetBrain().GetWinningId("decn"))                            // DO
```

---

## The Verb/Decision Lobe Pair

The Brain catalogue defines both `verb` and `decn` with identical neuron names:

```
ARRAY "Brain Lobe Neuron Names" 12
  Index 1 (decn): "Creature Actions"
  Index 2 (verb): "Creature Actions"
```

The **verb lobe** is the input-side counterpart to the decision lobe. It is listed among the 9 "Brain Input Lobes" while decn is an output lobe. The architecture works as follows:

1. **Verb lobe** (`verb`) receives weighted inputs from tracts connecting drives, concepts, and other input lobes
2. **Tracts** carry verb lobe signals to the decision lobe
3. **Decision lobe** (`decn`) runs winner-takes-all SVRule competition
4. The winning neuron becomes the creature's chosen action

This separation allows the genome to define different SVRules for the input accumulation stage (verb) and the competitive selection stage (decn), giving evolution fine-grained control over decision-making behavior.

### Instinct System Remapping

The instinct system reveals the verb↔decn relationship explicitly. During instinct gene loading, the genome encodes lobe references using tissue IDs. When the reference points to the decision lobe, the instinct constructor remaps it to the verb lobe — because instincts need to **inject input**, not read output:

```text
// Instinct input remapping
if myInputs[i].name == "decn":
    myInputs[i].name = "verb"     // Remap: inject into verb (input side)
if myInputs[i].name == "attn":
    myInputs[i].name = "noun"     // Remap: inject into noun (input side)
```

During instinct processing, the desired action is forced into the verb lobe, the brain updates, and then the code checks whether the decision lobe selected that action:

```text
// Instinct processing
myBrain.SetInput("verb", myDecisionId, 1.0)   // Force desired action
myBrain.UpdateComponents()                      // Run brain update

if myBrain.GetWinningId("decn") != myDecisionId:
    return true   // Brain didn't select this action — skip instinct

// Otherwise apply reinforcement to learn the association
myBrain.SetInput("resp", myReinforcement.driveId, amount)
myBrain.UpdateComponents()
```

This mechanism hardwires innate behaviors during REM sleep by creating reinforced tract connections between specific input patterns and decision neurons.

---

## The 13 Action Neurons

The decision lobe has **13 neurons** (1×13 grid as defined by the standard norn genome), each corresponding to a specific voluntary behavior the creature can perform. The engine defines 14 action constants (`NUMACTIONS=14`, indices 0-13), but the genome only allocates 13 neurons (indices 0-12), meaning action 13 (`AC_HIT`) has no dedicated neuron in the standard genome. The action constants are defined in both the `"Creature Actions"` catalogue array and the `ActionOffsets` constants:

```
┌──────────────────────────────────────────────────────────────────┐
│                   DECISION LOBE NEURONS                           │
│                                                                  │
│   Neuron  Action          Catalogue Name   Requires IT?          │
│   ──────  ──────────────  ──────────────   ────────────          │
│   0       Default/Look    "look"           No                    │
│   1       Activate1       "push"           Yes                   │
│   2       Activate2       "pull"           Yes                   │
│   3       Deactivate      "deactivate"     Yes                   │
│   4       Approach        "approach"       Yes                   │
│   5       Retreat         "retreat"        Yes                   │
│   6       Get (pick up)   "get"            Yes                   │
│   7       Drop            "drop"           No                    │
│   8       Express need    "express"        No                    │
│   9       Rest            "rest"           No                    │
│   10      Travel west     "left"           No                    │
│   11      Travel east     "right"          No                    │
│   12      Eat             "eat"            Yes                   │
│                                                                  │
│   Note: engine defines AC_HIT=13 (NUMACTIONS=14), but standard │
│   genome allocates only 13 neurons (0-12). Action 13 exists as   │
│   a script offset but has no dedicated neuron in the genome.     │
│                                                                  │
│   "Requires IT" means the action needs a valid IT agent.         │
│   If IT is null and the action requires it, the MotorFaculty     │
│   cancels execution (unless a smell trail exists).               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Actions Requiring an IT Object

```javascript
// BrainScriptFunctions.js:142-161
export function doesThisScriptRequireAnItObject(event) {
    return event === AC_ACTIVATE1 ||    // 1
           event === AC_ACTIVATE2 ||    // 2
           event === AC_DEACTIVATE ||   // 3
           event === AC_APPROACH ||     // 4
           event === AC_RETREAT ||      // 5
           event === AC_EAT ||          // 12
           event === AC_HIT ||          // 13
           event === AC_GET;            // 6
}
```

Actions 0 (look), 7 (drop), 8 (express), 9 (rest), 10 (travel west), and 11 (travel east) are **introspective** — they don't require an IT agent and can be performed when the creature has nothing to focus on.

---

## Winner-Takes-All Mechanism

The decision lobe's core function is **competitive selection**: all 13 neurons receive accumulated inputs, and exactly one neuron wins.

### How Neurons Compete

The competition happens inside `Lobe.doUpdate()`, which processes every neuron through SVRules (State-Variable Rules) — small programs encoded in the genome:

```
┌──────────────────────────────────────────────────────────────────┐
│              WINNER-TAKES-ALL UPDATE CYCLE                         │
│                                                                  │
│   1. Initialize dummy spare neuron (prevents first-neuron bias)  │
│   2. winningNeuronId = 0 (default)                               │
│                                                                  │
│   3. For each neuron i = 0..12:                                  │
│      a. Load external input → invalidVariables[0]                │
│      b. Reset neuron input accumulator to 0.0                    │
│      c. Run initRule SVRule (if runInitRuleAlways)                │
│      d. Run updateRule SVRule                                    │
│      e. If SVRule returns "setSpareNeuronToCurrent":             │
│         └── This neuron wins: spareNeuronVariables = neuron.states│
│             winningNeuronId = i                                  │
│                                                                  │
│   4. If dummy spare is still winner → default to neuron 0        │
│                                                                  │
│   Result: winningNeuronId = the action the creature wants to do  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

The SVRule's `setSpareNeuronToCurrent` return code is the key mechanism. Each neuron's update rule evaluates its input strength against the current winner (via the spare neuron's state variables). If the current neuron's signal is stronger, it replaces the spare and becomes the new winner. This creates a single-pass competitive selection without requiring a separate comparison step.

### The Spare Neuron Pattern

The "spare neuron" is a critical architectural detail:

- The spare neuron's state array is shared across all neuron SVRule evaluations
- When a neuron wins, its state array becomes the spare
- Subsequent neurons compare themselves against the current winner via spare neuron variables
- A dummy spare is initialized at the start to prevent the first neuron from automatically winning (since its states would otherwise be compared against itself)

```javascript
// JS Lobe.js:162-164
const dummySpare = new Neuron(-1);
this.spareNeuronVariables = dummySpare.states;
this.winningNeuronId = 0;
```

---

## Neuron-to-Script Mapping Pipeline

The winning neuron ID must be translated into a CAOS script event number. This happens through a three-stage mapping system:

```
┌──────────────────────────────────────────────────────────────────┐
│              NEURON → SCRIPT MAPPING PIPELINE                     │
│                                                                  │
│   Stage 1: Neuron ID → Script Offset                             │
│   ──────────────────────────────────                             │
│   getScriptOffsetFromNeuronId(neuronId)                          │
│   Default: 1:1 mapping (neuron 0 → offset 0, etc.)              │
│   Remappable via "Action Script To Neuron Mappings" catalogue    │
│                                                                  │
│   Stage 2: Script Offset → Event Number                          │
│   ──────────────────────────────────────                         │
│   If IT is a creature:  event = offset + 32                     │
│   If IT is an object:   event = offset + 16                     │
│   Involuntary actions:  event = index + 64                      │
│                                                                  │
│   Stage 3: Event Number → Script Lookup                          │
│   ────────────────────────────────────                           │
│   Scriptorium looks up: creature classifier + event number      │
│   Falls back: creature-creature (32+) → regular (16+)           │
│                                                                  │
│   Examples:                                                      │
│   Neuron 12 (eat) + object IT  → event 28 → "eat object" script │
│   Neuron 4 (approach) + creature IT → event 36 → "approach       │
│     creature" script, fallback to event 20 "approach object"     │
│   Neuron 13 (hit) + creature IT → event 45 → "hit creature"     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Catalogue-Driven Remapping

The default mapping is 1:1 (neuron N = script offset N), but the catalogue system allows genomes and mods to rearrange which neurons map to which actions:

```javascript
// BrainScriptFunctions.js:31-42
export function initBrainMappingsFromCatalogues(catalogueData = null) {
    for (let i = 0; i < NUMACTIONS; i++) {
        scriptMappings[i] = i;           // Default 1:1
        neuronMappings.set(i, i);        // Reverse lookup
        agentScriptMappings[i] = i;      // Agent script also 1:1
    }
    // Override with catalogue data if provided
}
```

---

## MotorFaculty Decision Processing

The `MotorFaculty.processBrainDecision()` method is the primary consumer of the decision lobe's output. It runs each brain tick after `processBrainAttention()`:

### Step 1: Get Winning Action

```javascript
// MotorFaculty.js:301-309
if (this.myVoluntaryScriptOverrides.decisionScriptNo >= 0) {
    scriptAction = this.myVoluntaryScriptOverrides.decisionScriptNo;  // URGE override
} else {
    decisionNeuronId = brain.getWinningId('decn');                    // Brain decision
    scriptAction = this.getScriptOffsetFromNeuronId(decisionNeuronId);
}
```

The `myVoluntaryScriptOverrides` mechanism allows CAOS commands like `URGE` to temporarily override the brain's decision with a forced action.

### Step 2: Check Execution Conditions

A new script is only started if one of three conditions is met:

```javascript
// MotorFaculty.js:318-321
const shouldExecuteScript =
    scriptAction !== this.myCurrentAction ||       // Decision changed
    (newIt !== oldIt && !isIntrospective) ||       // IT object changed (and not introspective)
    !vmRunning;                                     // VM finished previous script
```

This prevents the creature from restarting the same script every tick — it only re-executes when something changes.

### Step 3: Determine Script Event

```javascript
// MotorFaculty.js:341-342
const isCreatureTarget = newIt?.isCreature?.() || false;
const scriptEvent = scriptAction +
    (isCreatureTarget ? SCRIPT_OFFSET_CREATURE : SCRIPT_OFFSET_REGULAR);
    // SCRIPT_OFFSET_REGULAR = 16, SCRIPT_OFFSET_CREATURE = 32
```

### Step 4: Execute with Fallback

```javascript
// MotorFaculty.js:364-374
scriptStarted = creature.executeScriptForEvent(scriptEvent, creature, 0, 0);

// If creature-creature script not found, try regular script
if (!scriptStarted && isCreatureTarget) {
    const regularEvent = scriptAction + SCRIPT_OFFSET_REGULAR;
    scriptStarted = creature.executeScriptForEvent(regularEvent, creature, 0, 0);
}
```

The creature-creature fallback ensures that creatures can interact with each other even if species-specific interaction scripts aren't defined — the generic object interaction script runs instead.

---

## Knowledge Building During REM Sleep

During REM sleep, after instinct processing completes, the brain enters a **knowledge building** phase. This probes each drive to discover what actions the brain would choose when that drive is dominant:

```javascript
// Brain.js:335-406 — knowledge building loop
for each drive index (0..19):
    1. clearActivity()
    2. Stimulate noun lobe (all neurons = 0.5)
    3. Stimulate vision lobe (all neurons = 0.1)
    4. Stimulate the current drive neuron (= 1.0)
    5. updateComponents()  // Run full brain update
    6. Record: {
         attentionId: getWinningId('attn'),    // What was attended to?
         decisionId:  getWinningId('decn'),    // What action was chosen?
         strength:    decn neuron STATE_VAR     // How confident?
       }
```

This produces a **knowledge table** (`myAssistanceKnowledge`) with 20 entries — one per drive — that maps each motivation to the brain's preferred action and attention target. This table is used for teaching assistance and creature monitoring.

---

## Involuntary Actions (Bypassing Decision Lobe)

Not all actions go through the decision lobe. **Involuntary actions** (reflexes) are driven by biochemical receptor loci and bypass the brain entirely:

```
┌──────────────────────────────────────────────────────────────────┐
│              VOLUNTARY vs INVOLUNTARY ACTIONS                     │
│                                                                  │
│   Voluntary (Decision Lobe):                                     │
│   Brain → decn winner → script offset + 16/32 → CAOS script     │
│   Examples: eat, approach, hit, get, rest, travel                │
│                                                                  │
│   Involuntary (Biochemical Receptors):                           │
│   Receptor loci → random probability gate → script offset + 64   │
│   Examples: flinch (0), lay egg (1), sneeze (2), cough (3),     │
│             shiver (4), sleep (5), faint (6)                     │
│                                                                  │
│   Priority: Involuntary actions take precedence. If one is       │
│   executing (myCurrentInvoluntaryAction > -1), voluntary         │
│   decisions are deferred until it completes.                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

```text
// Involuntary selection
for i = 0 to NUMINVOL-1:
    if a.latency == 0 and            // Not in cooldown
       a.locus > RndFloat() and      // Probabilistic gate
       a.locus > strongestSoFar:     // Strongest candidate
        bestInvoluntaryActionId = i
```

Involuntary actions have latency timers to prevent repetition and use probabilistic activation — the stronger the biochemical signal, the higher the chance of triggering.

---

## The DECN CAOS Command

The `DECN` CAOS command returns the creature's current decision ID — the action the creature is currently performing:

```
DECN → integer (0-12, or -1 if no action)
```

This reads `MotorFaculty.myCurrentAction`, which is set each time a new voluntary action begins. It returns the **script offset** (not the neuron ID), matching the `ActionOffsets` enumeration.

---

## Comparison: Decision Lobe vs Attention Lobe

| Aspect | Decision Lobe (`decn`) | Attention Lobe (`attn`) |
|--------|----------------------|------------------------|
| **Question** | "What should I do?" | "What should I focus on?" |
| **Neurons** | 13 (action types, genome) | 40 (object categories) |
| **Input mirror** | Verb lobe (`verb`) | Noun lobe (`noun`) |
| **Consumer** | `processBrainDecision()` | `processBrainAttention()` |
| **Output** | Script offset (0-12) | Category ID (0-39) |
| **Script mapping** | offset + 16/32 → event | Category → `getKnownAgent()` → IT agent |
| **Override** | `URGE` CAOS command | `URGE` CAOS command |
| **Catalogue name** | "Creature Actions" | "Agent Categories" |

Both lobes share identical winner-takes-all mechanics via `Lobe.doUpdate()` — the only difference is what their neurons represent and how their output is consumed.

---

## Key Constants

```javascript
// CreatureConstants.js
export const NUMACTIONS = 14;   // engine constant; genome allocates 13 neurons (0-12)

export const ActionOffsets = {
    AC_DEFAULT: 0,        // Look / do nothing
    AC_ACTIVATE1: 1,      // Push / touch
    AC_ACTIVATE2: 2,      // Pull
    AC_DEACTIVATE: 3,     // Deactivate
    AC_APPROACH: 4,       // Walk toward IT
    AC_RETREAT: 5,        // Walk away from IT
    AC_GET: 6,            // Pick up IT
    AC_DROP: 7,           // Drop held object
    AC_EXPRESSNEED: 8,    // Express highest drive
    AC_REST: 9,           // Rest / sleep
    AC_TRAVWEST: 10,      // Travel left
    AC_TRAVEAST: 11,      // Travel right
    AC_EAT: 12,           // Eat IT
    AC_HIT: 13            // Hit IT
};

// MotorFaculty.js
const SCRIPT_OFFSET_REGULAR = 16;     // Object interaction events (16-29)
const SCRIPT_OFFSET_CREATURE = 32;    // Creature interaction events (32-45)
const SCRIPT_INVOLUNTARY_BASE = 64;   // Involuntary events (64-71)
const NUMINVOL = 8;                   // Number of involuntary actions
```

---

## Key Source Files

### JavaScript (Rebuild)

| File | Purpose |
|------|---------|
| `MotorFaculty.js:287-385` | `processBrainDecision()` — decision to script execution pipeline |
| `MotorFaculty.js:223-279` | `processBrainAttention()` — attention lobe processing (companion) |
| `Lobe.js:157-240` | `doUpdate()` — winner-takes-all mechanism with dummy spare neuron |
| `Brain.js:497-500` | `getWinningId('decn')` → winning neuron ID |
| `Brain.js:335-406` | Knowledge building phase — probes decn output for each drive |
| `BrainScriptFunctions.js:85-114` | `getNeuronIdFromScriptOffset()` / `getScriptOffsetFromNeuronId()` |
| `BrainScriptFunctions.js:142-161` | `doesThisScriptRequireAnItObject()` — IT requirement check |
| `CreatureConstants.js:13-28` | `ActionOffsets` enum — 14 action constants (NUMACTIONS=14, genome uses 13) |
| `DECN.js` | CAOS `DECN` command — returns current decision ID |

---

## Related Articles

- [Vision Lobe Architecture](#/article/vision-lobe-architecture) - Visual input that feeds into the attention and decision pipeline
- [Drive Lobe Architecture](#/article/drive-lobe-architecture) - Motivational inputs that bias decision neuron selection
- [Detail Lobe Architecture](#/article/detail-lobe-architecture) - IT agent properties influencing action choice
- [Friend-or-Foe Lobe Architecture](#/article/friendorfoe-lobe-architecture) - Social opinion outputs that interact with decision-making
- [Brain & Neural Networks](#/article/brain-system) - Lobe architecture, SVRules, tracts, and winner-takes-all
- [Creature Faculties](#/article/creature-faculties) - MotorFaculty and SensoryFaculty within the faculty system
