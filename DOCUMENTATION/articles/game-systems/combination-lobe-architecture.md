# [comb] Combination Lobe Architecture

This article provides a deep-dive into the combination lobe (`comb`) — the central decision matrix of the creature's brain. Also known as the "concept lobe", the comb lobe is a 2D grid of **440 neurons** (40 columns x 11 rows) where each neuron represents a specific **(action, object-category) pair** — for example, "eat food", "hit Grendel", or "approach Norn". It integrates drive signals, spoken language, stimulus sources, and social relationships through 6 inbound tracts, and outputs to both the attention and decision lobes through 2 outbound tracts. Reinforcement learning occurs at the dendritic connections, enabling creatures to learn which actions satisfy which drives for which objects.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│            COMBINATION LOBE DATA FLOW (END-TO-END)                   │
│                                                                     │
│   Input Lobes (engine-fed)                                          │
│   ├── driv (20 neurons) ──── 4 migratory dendrites each ──┐        │
│   ├── verb (11 neurons) ──── 1 per row (40 comb neurons) ─┤        │
│   ├── stim (40 neurons) ──── 1:1 scaled mapping ──────────┤        │
│   └── forf (36 neurons) ──── migratory to 3 specific rows ┤        │
│                                                            │        │
│                                         ┌──────────────────┘        │
│                                         ▼                           │
│                              ┌─────────────────────┐                │
│                              │   comb (40 x 11)    │                │
│                              │   = 440 neurons      │                │
│                              │                     │                │
│                              │  Columns: 40 agent  │                │
│                              │  categories         │                │
│                              │                     │                │
│                              │  Rows: 11 actions   │                │
│                              │  (verb types)       │                │
│                              │                     │                │
│                              │  Each neuron:       │                │
│                              │  (action, category) │                │
│                              └──────┬──────┬───────┘                │
│                                     │      │                        │
│                          ┌──────────┘      └──────────┐             │
│                          ▼                            ▼             │
│                    ┌───────────┐              ┌────────────┐        │
│                    │   attn    │              │    decn     │        │
│                    │ (40 WTA)  │              │  (11 WTA)  │        │
│                    │ "focus on │              │ "do what?" │        │
│                    │  what?"   │              │            │        │
│                    └───────────┘              └────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The 2D Decision Matrix

The comb lobe's 440 neurons are arranged as a 2D grid that maps every possible **(action, object-category)** combination:

```
             Category 0    Category 1    Category 2  ...  Category 39
             (Self)        (Hand)        (Door)           (last cat)
           ┌─────────────┬─────────────┬─────────────┬───┬─────────────┐
  Row 0    │  neuron 0   │  neuron 1   │  neuron 2   │...│  neuron 39  │
  (look)   │  look self  │  look hand  │  look door  │   │  look X     │
           ├─────────────┼─────────────┼─────────────┼───┼─────────────┤
  Row 1    │  neuron 40  │  neuron 41  │  neuron 42  │...│  neuron 79  │
  (push)   │  push self  │  push hand  │  push door  │   │  push X     │
           ├─────────────┼─────────────┼─────────────┼───┼─────────────┤
  Row 2    │  neuron 80  │  neuron 81  │  neuron 82  │...│  neuron 119 │
  (pull)   │  pull self  │  pull hand  │  pull door  │   │  pull X     │
           ├─────────────┼─────────────┼─────────────┼───┼─────────────┤
  ...      │    ...      │    ...      │    ...      │   │    ...      │
           ├─────────────┼─────────────┼─────────────┼───┼─────────────┤
  Row 10   │  neuron 400 │  neuron 401 │  neuron 402 │...│  neuron 439 │
  (eat)    │  eat self   │  eat hand   │  eat door   │   │  eat X      │
           └─────────────┴─────────────┴─────────────┴───┴─────────────┘
```

### Neuron Index Formula

The neuron index for a given (action, category) pair follows the original engine's convention:

```
conceptNeuron = (numCategories × decisionNeuron) + categoryId
```

Where:
- `numCategories` = 40 (from "Agent Categories" catalogue)
- `decisionNeuron` = action row index (0-10)
- `categoryId` = agent category (0-39)

For example: "eat food" = (40 × 10) + 11 = neuron 411 (row 10 = eat, column 11 = food).

### Row-to-Action Mapping

The 11 rows correspond to the first 11 actions from the "Creature Actions" catalogue:

| Row | Action | Description |
|---|---|---|
| 0 | Look | Observe an object |
| 1 | Push / Activate1 | Push or primary activation |
| 2 | Pull / Activate2 | Pull or secondary activation |
| 3 | Deactivate | Turn off or stop interacting |
| 4 | Approach | Move toward an object |
| 5 | Retreat | Move away from an object |
| 6 | Get | Pick up an object |
| 7 | Drop | Release a held object |
| 8 | Express Need | Vocalize a drive |
| 9 | Rest | Stop and rest |
| 10 | Eat | Consume an object |

Note: The full `NUMACTIONS` constant is 14 (includes left, right, hit), but the genome defines only 11 rows in the comb lobe.

---

## Genome-Only Lobe: Limited Engine Interaction

The comb lobe is **not listed in the Brain Lobe Quads catalogue** (`Assets/Catalogue/Brain.catalogue`), which defines the 12 standard lobes. It exists only as a **lobe gene in the genome binary** (e.g., `norn.astro.48.gen`). This means:

- **No `SetInput("comb", ...)` calls** — all input arrives through genome-defined tracts
- **No `GetWinningId("comb")` calls** — the lobe is not winner-takes-all; output flows to `attn` and `decn` which perform WTA
- **One direct engine interaction**: `SetNeuronState("comb", neuronId, NGF_VAR, 1.0)` — used only for dendrite migration flagging during friend-or-foe registration

This places `comb` in the same category as other genome-only lobes like `forf`, `move`, `mood`, and `gend`.

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `comb` | 4-character lobe identifier |
| **Dimensions** | 40 wide x 11 high | **440 neurons** |
| **Update Time** | 20 | Processes after all inbound tracts (17-19) |
| **Switch-On Age** | 0 | Present from birth |
| **Winner Takes All** | No | All neurons active simultaneously |
| **Tissue ID** | 255 | No biochemical tissue linkage |
| **Init Rule Always** | 1 | Init rule re-runs every update (unusual — enables chemical sensitivity) |

---

## SVRules

### Init Rule: Chemical-Sensitive Persistence

The init rule is unusual in that it re-runs every tick (`initRuleAlways = 1`). It manages a **persistence mechanism** controlled by chemical 213 (a sleep/dream-related chemical):

```
// Pseudocode:
if (chemical[213] != 0) {        // During sleep/dreaming
    neuron[2] = 0;                // Clear "total" variable
    neuron[3] = 0;                // Clear persistence flag
} else {                          // While awake
    tendRate = neuron[2] == 0 ? 0.802 : 0.266;
    target = neuron[2] == 0 ? 0 : 1;
    neuron[3] = tend(neuron[3], target, tendRate);
}
if (neuron[3] < 0.198) {
    neuron[3] = 0;                // Snap to zero if below threshold
}
```

This creates a **memory gating** effect:
- While **awake**: neuron[3] (persistence flag) slowly tends toward 1 when the neuron has been activated (neuron[2] ≠ 0), creating persistent concept memory
- During **sleep/dreaming**: both neuron[2] and neuron[3] are cleared, allowing the brain to reset and process instincts without interference from waking memories
- The 0.198 threshold prevents very weak activations from creating lasting persistence

### Update Rule: Core Combination Processing

The update rule performs the central combination computation:

```
// Pseudocode:
tendRate = 0.815;
STATE = tend(STATE, INPUT, tendRate);    // Tend STATE toward INPUT
INPUT = 0;                               // Clear input for next cycle

// Manage "total" tracking
if (STATE < spare.STATE) {               // Compare with spare neuron
    spare.neuron[2] = 0;                 // Clear spare total
}
neuron[2] = STATE;                        // Store current state as "total"

// Persistence with chemical sensitivity
preserve(neuron[3]);                      // Save persistence value
threshold = chemical[213] != 0 ? 1.0 : 0.802;
if (threshold > neuron[3]) {
    neuron[3] = threshold;               // Update persistence flag
}
restore(spare.neuron[3]);                 // Restore spare persistence
setSpareNeuronToCurrent;                 // Copy to spare for next comparison
```

Key behaviors:
- **Tend rate 0.815**: STATE converges quickly toward INPUT, making the lobe responsive to current inputs
- **Chemical 213 sensitivity**: During dreaming, persistence reaches maximum (1.0), enabling instinct processing
- The spare neuron mechanism tracks which neurons have been recently active

---

## Inbound Tracts: 6 Input Connections

The comb lobe receives input from 4 different source lobes through 6 tracts. These are processed before the comb lobe's own update (update times 17-19 vs comb's 20).

### Tract 1: driv → comb (Drive-to-Combination)

The most important tract — it encodes the creature's **learned beliefs** about which actions satisfy which drives.

| Property | Value |
|---|---|
| **Source Lobe** | `driv` (20 neurons) |
| **Destination Lobe** | `comb` (440 neurons) |
| **Connections** | 4 per drive neuron, fan-out to comb neurons |
| **Update Time** | 17 |
| **Migrates** | **Yes** — dendrites can grow to new comb neurons |

**Tract Update Rule (pseudocode)**:
```
acc = driveState × dendriteWeight;    // Scale drive by learned weight
combInput += acc / 0.5;              // Add weighted drive to comb input

// Reinforcement learning:
if (neuron[3] != 0) {                // If persistence flag active
    adjustedRate = 1 - neuron[3];    // Higher persistence = slower change
    dendrite[0] = tend(dendrite[0],  // Adjust weight toward input
                       -inputNeuron[3], adjustedRate);
}

// Long-term ↔ short-term weight convergence (chemical 213 sensitive):
if (chemical[213] == 0) {            // While awake
    doSetLTtoST();                   // Update long-term from short-term
}
dendrite[7] = |dendrite[1]|;         // Store absolute weight for comparison
```

**What this means**: Each drive neuron (hunger, fear, boredom, etc.) has 4 weighted connections to comb neurons. The weights encode "how much does this action-on-this-object alleviate this drive?" — learned through reinforcement. When a creature eats food and hunger decreases, the weight from the hunger drive to the "eat-food" comb neuron strengthens.

**Init Rule**: Uses chemicals 198 (reinforcement), 204 (reward), 205 (punishment), and 212 to initialize and adjust dendrite weights. This implements the **biochemical reinforcement learning** cycle.

### Tract 2: verb → comb (Verb-to-Combination)

Activates an entire **row** of the combination matrix based on spoken or thought actions.

| Property | Value |
|---|---|
| **Source Lobe** | `verb` (11 neurons) |
| **Destination Lobe** | `comb` (440 neurons) |
| **Connections** | Each verb neuron → 40 comb neurons (one full row) |
| **Update Time** | 17 |
| **Migrates** | No |

**Tract Update Rule**:
```
combInput += verbState / 0.5;     // Double the verb signal and add to comb input
```

**What this means**: When the creature hears or thinks the verb "eat", all 40 neurons in row 10 (eat-self, eat-hand, eat-door, ..., eat-lastCategory) receive activation. This creates a linguistic bias toward the mentioned action across all possible target objects.

### Tract 3: stim → comb (Stimulus-to-Combination)

Provides scaled stimulus source signals as contextual input.

| Property | Value |
|---|---|
| **Source Lobe** | `stim` (40 neurons) |
| **Destination Lobe** | `comb` (440 neurons) |
| **Connections** | 1:1 mapping |
| **Update Time** | 18 |
| **Migrates** | No |

**Tract Update Rule**:
```
combInput = stimState × 0.331 × combInput;   // Multiplicative modulation
```

**What this means**: The stimulus source lobe (which receives signals from the move lobe's motion detection pipeline) provides a **multiplicative modulation** — it amplifies comb neurons for categories that have active stimuli and suppresses those without. Objects that are moving or otherwise salient get boosted.

### Tracts 4-6: forf → comb (Friend-or-Foe to Combination)

Three separate tracts connect the forf lobe to **specific rows** of the comb matrix, enabling social relationships to bias action selection.

| Tract | Dest Neurons | Comb Row | Action |
|---|---|---|---|
| forf→comb #1 | 40-79 | Row 1 | Push / Activate1 |
| forf→comb #2 | 200-239 | Row 5 | Retreat |
| forf→comb #3 | 280-319 | Row 7 | Drop |

All three share these properties:

| Property | Value |
|---|---|
| **Source Lobe** | `forf` (36 neurons) |
| **Connections** | 1 per forf neuron, migratory, 255 random initial connections |
| **Update Time** | 19 |
| **Migrates** | **Yes** — dendrites migrate based on NGF flagging |

**Tract Update Rule (shared)**:
```
if (forfNeuron[5] == 0) stop;        // Skip if forf not visible this tick
if (dendrite[0] == 0) stop;          // Skip if no connection established
combInput = combInput × dendrite[7]; // Modulate comb input by friend/foe weight
```

**Init Rules**: The init rules differ slightly between the three tracts:
- **Tracts 4-5** (rows 1 and 5): Set `dendrite[7]` based on whether `forfNeuron[2]` (affection) exceeds a threshold — friends get one weight, foes get another
- **Tract 6** (row 7): Additionally checks `chemical[118]` and uses an inverted threshold, storing the absolute value — this creates a different friend/foe classification for the "drop" action

**What this means**: When a creature sees a friend, the forf neurons modulate the comb neurons for "push friend" (activate — friendly interaction), "retreat from friend" (social response), and "drop near friend" (sharing). The dendrite weights encode whether the creature likes or dislikes each individual, biasing these social actions accordingly. The migratory connections allow new social bonds to form when NGF is flagged during friend-or-foe registration.

---

## Outbound Tracts: 2 Output Connections

The comb lobe outputs to both behavioral output lobes. Both tracts fire at update time 21, after the comb lobe processes at time 20.

### Tract 7: comb → attn (Combination-to-Attention)

Feeds **column-aggregated** comb activity into the attention lobe.

| Property | Value |
|---|---|
| **Source Lobe** | `comb` (440 neurons) |
| **Destination Lobe** | `attn` (40 neurons) |
| **Connections** | 1:1 (each comb neuron to 1 attn neuron, each attn neuron from 1 comb neuron) |
| **Update Time** | 21 |
| **Migrates** | No |

**Tract Update Rule**:
```
attnInput += combNeuron[2];    // Add comb "total" to attention input
```

**What this means**: Each column of 11 comb neurons (representing all possible actions on a single category) sums into one attention neuron. The attention neuron for "food" receives contributions from "look-food", "push-food", "eat-food", etc. Categories with many high-activation action possibilities bubble up as strong attention candidates.

### Tract 8: comb → decn (Combination-to-Decision)

Feeds **row-aggregated** comb activity into the decision lobe.

| Property | Value |
|---|---|
| **Source Lobe** | `comb` (440 neurons) |
| **Destination Lobe** | `decn` (11 neurons) |
| **Connections** | Each comb neuron fans out to 40 decn connections, each decn neuron receives 1 |
| **Update Time** | 21 |
| **Migrates** | No |

**Tract Update Rule**:
```
decnInput += combNeuron[2];    // Add comb "total" to decision input
```

**What this means**: Each row of 40 comb neurons (representing one action across all categories) sums into one decision neuron. The decision neuron for "eat" receives contributions from "eat-self", "eat-hand", "eat-food", "eat-door", etc. Actions with many high-activation object targets become strong decision candidates.

---

## Dendrite Migration: Social Learning

The only **direct engine interaction** with the comb lobe is setting NGF_VAR (Neural Growth Factor) on specific neurons to trigger dendrite migration. This happens in `SensoryFaculty.flagConceptNeuronsForMigration()`, which mirrors the original engine's friend-or-foe registration routine.

### How It Works

When a new creature or pointer agent is registered in the friend-or-foe system:

1. **SensoryFaculty** looks up "Bad Action Script" catalogue entries (Hit = script offset 13) and "Good Action Script" entries (Activate1 = offset 1, Activate2 = offset 2)
2. For each bad/good action, it computes the **concept neuron index**: `numCategories × decisionNeuron + categoryId`
3. It sets `NGF_VAR = 1.0` on those specific comb neurons
4. The forf→comb migratory tracts detect the NGF flag and grow new dendrite connections to those neurons

### Source (SensoryFaculty.js:1538-1590)

```javascript
flagConceptNeuronsForMigration(forfSlot, agent) {
    const numCategories = CategorySystem.getNumCategories();

    // Flag BAD action concepts (e.g., "hit this creature")
    for (const scriptOffset of this.getBadActionScripts()) {
        const decisionNeuron = this.getNeuronIdFromScriptOffset(scriptOffset);
        const conceptNeuron = numCategories * decisionNeuron + categoryId;
        brain.setNeuronState('comb', conceptNeuron, 'NGF_VAR', 1.0);
    }

    // Flag GOOD action concepts (e.g., "activate1 this creature")
    for (const scriptOffset of this.getGoodActionScripts()) {
        const decisionNeuron = this.getNeuronIdFromScriptOffset(scriptOffset);
        const conceptNeuron = numCategories * decisionNeuron + categoryId;
        brain.setNeuronState('comb', conceptNeuron, 'NGF_VAR', 1.0);
    }
}
```

**Result**: When a Norn meets a Grendel, NGF is set on "hit-Grendel" (bad action) and "activate1-Grendel" / "activate2-Grendel" (good actions) comb neurons. The forf→comb migratory tracts can then grow connections to these neurons, enabling the creature's opinion of that individual to influence whether it hits or interacts with Grendels.

---

## Reinforcement Learning Cycle

The comb lobe is the **primary site of learning** in the Creatures 3 brain. The learning cycle works as follows:

```
┌──────────────────────────────────────────────────────────┐
│              REINFORCEMENT LEARNING CYCLE                  │
│                                                          │
│  1. Creature performs action on object                   │
│     (MotorFaculty executes script)                       │
│                                                          │
│  2. Script triggers stimulus (SWAY/STIM)                 │
│     → biochemistry produces reward/punishment chemicals  │
│                                                          │
│  3. Chemicals 204 (reward) / 205 (punishment) activate   │
│     → driv→comb tract init rule detects reinforcement    │
│                                                          │
│  4. Dendrite weights adjust:                             │
│     - Reward: strengthens weight from current drive      │
│       to the (action, category) comb neuron              │
│     - Punishment: weakens weight                         │
│                                                          │
│  5. Next time creature is hungry + sees food:            │
│     - Hunger drive sends strong signal through           │
│       strengthened weight to "eat-food" comb neuron      │
│     - "eat-food" neuron activates strongly               │
│     - comb→attn makes creature focus on food category    │
│     - comb→decn makes creature choose "eat" action       │
│                                                          │
│  6. Creature eats food → reward → cycle repeats          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Chemical Involvement

| Chemical | Role |
|---|---|
| 198 | Reinforcement signal — triggers weight adjustment |
| 204 | Reward signal — strengthens dendrite weights |
| 205 | Punishment signal — weakens dendrite weights |
| 212 | Learning gate — controls when learning can occur |
| 213 | Sleep/dream chemical — enables instinct processing, resets persistence |

---

## Update Time Ordering

The complete processing sequence each brain tick:

| Update Time | Component | Action |
|---|---|---|
| 17 | driv→comb tract | Weighted drive signals flow into comb matrix |
| 17 | verb→comb tract | Verb activation flows into comb rows |
| 18 | stim→comb tract | Stimulus modulates comb neurons |
| 19 | forf→comb tracts (×3) | Social relationship weights modulate specific rows |
| 20 | **comb lobe update** | Leaky integration, persistence management, chemical sensitivity |
| 21 | comb→attn tract | Column sums flow to attention neurons |
| 21 | comb→decn tract | Row sums flow to decision neurons |

---

## Role in the Brain Architecture

The comb lobe is the **convergence point** where all sensory, motivational, linguistic, and social information combines into a unified decision space:

```
  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │  driv   │  │  verb   │  │  stim   │  │  forf   │
  │(drives) │  │(actions)│  │(stimuli)│  │(social) │
  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
       │            │            │            │
       │  weighted  │  row       │  scaled    │  migratory
       │  fan-out   │  mapping   │  multiply  │  to 3 rows
       │            │            │            │
       └────────────┴────────┬───┴────────────┘
                             ▼
                    ┌─────────────────┐
                    │   comb (40×11)  │
                    │  440 neurons    │
                    │  decision matrix│
                    └────────┬────────┘
                             │
                   ┌─────────┴──────────┐
                   ▼                    ▼
            ┌───────────┐        ┌───────────┐
            │   attn    │        │   decn    │
            │ column    │        │  row      │
            │ sums      │        │  sums     │
            │→ "what?"  │        │→ "do?"    │
            └───────────┘        └───────────┘
```

### Dual Output: Attention and Decision

The comb lobe's architecture creates a natural decomposition of behavior into two independent questions:

1. **What should I focus on?** — Column sums (across all actions for each category) feed the attention lobe. Categories where many different actions are desirable attract attention.

2. **What should I do?** — Row sums (across all categories for each action) feed the decision lobe. Actions that are desirable across many object types become strong candidates.

The attention lobe's WTA selects one category; the decision lobe's WTA selects one action. Together they produce a complete behavioral intention: "eat food" or "retreat from Grendel".

---

## Implementation Notes

- Created by `Lobe.js` from parsed genome data
- Found by `Brain.js:getLobeFromTokenString("comb")`
- Only direct engine interaction: `brain.setNeuronState('comb', neuronId, 'NGF_VAR', 1.0)` in `SensoryFaculty.flagConceptNeuronsForMigration()`
- All tract processing handled by general-purpose `Tract.js:doUpdate()`

Since the only engine reference is the NGF flagging, and all other behavior is genome-driven, the rebuild stays inherently aligned with the original game.

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Genetics/norn.astro.48.gen` | Genome defining the comb lobe gene and its 8 tract genes |
| `Assets/Catalogue/Brain.catalogue` | Lists 12 standard lobes — comb is **not** among them |
| `Assets/Catalogue/Creatures 3.catalogue` | "Bad Action Script" and "Good Action Script" entries used for NGF flagging |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | `flagConceptNeuronsForMigration()` — only direct comb interaction |
| `Main_Game/src/engine/creature/brain/Lobe.js` | General lobe processing (doUpdate, SVRule execution) |
| `Main_Game/src/engine/creature/brain/Tract.js` | General tract processing including dendrite migration |
| `Main_Game/src/engine/creature/brain/Brain.js` | Brain update loop, `getLobeFromTokenString()` |

---

## Related Articles

- **[attn] Attention Lobe Architecture** — Downstream output lobe that receives column-aggregated comb activity
- **[decn] Decision Lobe Architecture** — Downstream output lobe that receives row-aggregated comb activity
- **[driv] Drive Lobe Architecture** — Primary input: weighted drive signals with reinforcement learning
- **[forf] Friend-or-Foe Lobe Architecture** — Social input via migratory tracts + NGF dendrite migration
- **[move] Move Lobe Architecture** — Upstream motion detection feeding through stim into comb
- **[visn] Vision Lobe Architecture** — Upstream vision data feeding through move→stim into comb
- **Brain & Neural Networks** — Overview of the complete brain architecture
