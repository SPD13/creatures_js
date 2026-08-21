# [attn] Attention Lobe Architecture

This article provides a deep-dive into the attention lobe (`attn`) — one of the two **output lobes** of the creature's brain. While the decision lobe (`decn`) answers "what should I do?", the attention lobe answers the complementary question: **"what should I focus on?"** Its winning neuron selects a category of object from the world, which the MotorFaculty resolves to a specific agent — the "IT" agent — that becomes the target of the creature's actions.

This article covers the 40-neuron category-based architecture, the noun lobe as input mirror, the vision-to-attention pipeline, the category representative system, and how the winning attention neuron drives IT agent selection.

## End-to-End Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│            ATTENTION LOBE DATA FLOW (END-TO-END)                      │
│                                                                      │
│   World: Agents exist at various positions                           │
│       │                                                              │
│       ▼                                                              │
│   CategorySystem.getCategoryIdOfAgent(agent)                         │
│   └── Classifier matching → assigns each agent a category (0-39)    │
│       │                                                              │
│       ▼                                                              │
│   SensoryFaculty writes external inputs each tick:                   │
│   ├── updateVisionLobe()  → setInput('visn', cat, normalizedX)      │
│   ├── updateSmellLobe()   → setInput('smel', cat, caValue)          │
│   ├── updateDriveLobe()   → setInput('driv', i, driveLevel)         │
│   └── Stimulate()         → setInput('noun'/'verb', id, stim)       │
│       │                                                              │
│       ▼                                                              │
│   Genome-defined tracts propagate through 3 layers:                  │
│                                                                      │
│   visn ─► visn→stim ─┐                                              │
│   move ─► move→stim ─┤                                              │
│   smel ─► smel→stim ─┼─► stim ─► stim→comb ─┐                      │
│   noun ─► noun→stim ─┘                        │                      │
│                                    driv→comb ─┤                      │
│                                    verb→comb ─┼─► comb ─► comb→attn  │
│                                  forf→comb ×3─┘              │       │
│                                                              ▼       │
│   Attention Lobe ("attn") — 40 neurons, WINNER-TAKES-ALL            │
│   ├── SVRule processes each neuron                                   │
│   ├── Neurons compete: one category wins                             │
│   └── Winning neuron ID = category ID of focus                       │
│       │                                                              │
│       ▼                                                              │
│   MotorFaculty.processBrainAttention()                               │
│   ├── winningId = brain.getWinningId('attn')  → category ID         │
│   ├── agent = sensory.getKnownAgent(winningId) → representative     │
│   ├── Validate: visn neuron STATE_VAR ≠ 0.0 (still visible?)        │
│   └── creature.setItAgent(agent)  → IT agent set                    │
│       │                                                              │
│       ▼                                                              │
│   IT Agent — used by:                                                │
│   ├── Detail Lobe (updateDetailLobe reads IT properties)             │
│   ├── Decision Lobe (action executed ON the IT agent)                │
│   └── All creature behavior (approach, eat, hit, etc.)               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## The Two Output Lobes

The brain catalogue defines exactly two output lobes:

```
ARRAY "Brain Output Lobes" 2
"attention"     ← attn: WHAT to focus on (category ID 0-39)
"decision"      ← decn: WHAT to do (action ID 0-13)
```

Each has an **input mirror** lobe — a corresponding input lobe that feeds signals into the competitive output lobe via tracts:

| Output Lobe | Token | Input Mirror | Mirror Token | Neuron Names |
|-------------|-------|-------------|-------------|--------------|
| Attention | `attn` | Noun | `noun` | "Agent Categories" (40) |
| Decision | `decn` | Verb | `verb` | "Creature Actions" (14) |

The instinct system makes this relationship explicit — when an instinct gene references `attn`, the constructor remaps it to `noun` for input injection:

```text
// Instinct construction
if myInputs[i].name == "attn"
    myInputs[i].name = "noun"    // Output → input mirror
if myInputs[i].name == "decn"
    myInputs[i].name = "verb"    // Output → input mirror
```

---

## The 40 Category Neurons

The attention lobe has **40 neurons**, one per agent category. These categories are defined in the `"Agent Categories"` catalogue array and classify every agent in the game world:

```
┌──────────────────────────────────────────────────────────────────┐
│                 ATTENTION LOBE NEURONS (40 CATEGORIES)             │
│                                                                  │
│   ID  Category        ID  Category        ID  Category           │
│   ──  ────────────    ──  ────────────    ──  ────────────       │
│   0   self            14  pest            28  machinery          │
│   1   hand            15  critter         29  creature egg       │
│   2   door            16  beast           30  norn home          │
│   3   seed            17  nest            31  grendel home       │
│   4   plant           18  animal egg      32  ettin home         │
│   5   weed            19  weather         33  gadget             │
│   6   leaf            20  bad             34  something          │
│   7   flower          21  toy             35  vehicle            │
│   8   fruit           22  incubator       36  norn               │
│   9   manky           23  dispenser       37  grendel            │
│   10  detritus        24  tool            38  ettin              │
│   11  food            25  potion          39  something (error)  │
│   12  button          26  elevator                               │
│   13  bug             27  teleporter                             │
│                                                                  │
│   Categories 36-38 are creature types (norn, grendel, ettin)    │
│   Category 39 is the error/fallback category                    │
│   Category 0 (self) and 1 (hand/pointer) are special            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Each agent in the game world is assigned to exactly one category via `CategorySystem.getCategoryIdOfAgent()`, which matches the agent's classifier (family/genus/species) against the `"Agent Classifiers"` catalogue array using wildcard matching (0 = any).

---

## The Known Agents Array: Category Representatives

The attention lobe does not track individual agents — it tracks **categories**. The SensoryFaculty maintains a parallel `myKnownAgents` array (40 elements) that stores one **representative agent** per category:

```
┌──────────────────────────────────────────────────────────────────┐
│              KNOWN AGENTS ARRAY                                    │
│                                                                  │
│   Category: [0]      [1]       [2]     [11]     [36]    ...     │
│   Name:     self     hand      door    food     norn    ...     │
│   Agent:    null     Pointer   Door3   Apple2   NornA   ...     │
│                                                                  │
│   Updated each tick by updateVisionLobe():                       │
│   └── findCategoryRepresentative(category) → best visible agent │
│   └── setKnownAgent(category, agent) → stores in array          │
│                                                                  │
│   Read by MotorFaculty.processBrainAttention():                  │
│   └── sensory.getKnownAgent(winningCategoryId) → IT agent       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

The winning attention neuron's ID directly indexes into this array — if neuron 11 (food) wins, `getKnownAgent(11)` returns whichever food item the vision system selected as representative.

### Category Representative Algorithms

Each category has a configurable **selection algorithm** (from the `"Category Representative Algorithms"` catalogue) that determines how the "best" visible agent is chosen from all agents matching that category:

| Algorithm | ID | Description |
|-----------|------|-------------|
| `PICK_NEAREST_IN_X_DIRECTION` | 0 | Closest by X-axis distance (default, ignores Y) |
| `PICK_A_RANDOM_ONE` | 1 | Random selection from visible candidates |
| `PICK_NEAREST_IN_CURRENT_ROOM` | 2 | Closest agent within the creature's current room |
| `PICK_NEAREST_TO_GROUND` | 3 | Agent nearest to the floor surface |
| `PICK_RANDOM_NEAREST_IN_X_DIRECTION` | 4 | Random from the 5 nearest in X |

```javascript
// SensoryFaculty.js:465-507
findCategoryRepresentative(categoryId) {
    const algorithm = CategorySystem.getCategoryAlgorithm(categoryId);
    const classifier = CategorySystem.getCategoryClassifier(categoryId);

    // Get all agents matching this category's classifier (wildcard matching)
    const candidates = world.agentManager.getAgentsByClassifier(...);

    // Filter by visual range
    const visibleCandidates = this.filterByVisualRange(candidates);

    // Apply algorithm
    switch (algorithm) {
        case PICK_NEAREST_IN_X_DIRECTION:     return this.pickNearestInXDirection(visibleCandidates);
        case PICK_A_RANDOM_ONE:               return this.pickRandomAgent(visibleCandidates);
        case PICK_NEAREST_IN_CURRENT_ROOM:    return this.pickNearestInCurrentRoom(visibleCandidates);
        case PICK_NEAREST_TO_GROUND:          return this.pickNearestToGround(visibleCandidates);
        case PICK_RANDOM_NEAREST_IN_X_DIRECTION: return this.pickRandomNearestInXDirection(visibleCandidates);
    }
}
```

### Conversation Stability

If the algorithm doesn't find a representative this tick but a previous agent is still within visual range, the system keeps tracking the previous agent. This prevents attention "flickering" during interactions:

```javascript
// SensoryFaculty.js:396-432
const previousAgent = this.getKnownAgent(category);
if (previousAgent && previousAgent.isAlive()) {
    const distance = /* calculate distance */;
    if (distance <= visualRange) {
        // Still visible — keep tracking previous agent
        brain.setInput('visn', category, normalizedX);
        continue;
    }
}
```

### Carried Objects Always Visible

If the creature is carrying an agent, that agent is always treated as visible at position (0, 0) — "right here":

```javascript
// SensoryFaculty.js:436-451
const carried = creature.getCarried();
if (carried && CategorySystem.getCategoryIdOfAgent(carried) === category) {
    brain.setInput('visn', category, 0.0);  // Right here
    this.setKnownAgent(category, carried);
}
```

---

## Genome-Defined Tract Architecture

The attention lobe does **not** receive direct input from `setInput('attn', ...)`. Its inputs arrive exclusively through genome-defined **tracts** (dendritic connections). The full wiring, extracted from the default Norn genome (`brain-architecture.json`), reveals a **three-layer pipeline**:

```
                ATTENTION LOBE INPUT ARCHITECTURE
                (from genome-defined tracts)

  LAYER 1: External Inputs               LAYER 2: Integration              LAYER 3: Output
  ─────────────────────────               ─────────────────────             ──────────────────

  SensoryFaculty writes:
    brain.setInput('visn', ...)
    brain.setInput('smel', ...)
    brain.setInput('driv', ...)
    brain.setInput('noun', ...)
    brain.setInput('verb', ...)

  visn (40n, t=4)──► visn->stim (40d, t=12)──┐
  move (40n, t=11)─► move->stim (40d, t=13)──┤
  smel (40n, t=4)──► smel->stim (40d, t=14)──┼──► stim (40n, t=16)
  noun (40n, t=11)─► noun->stim (40d, t=15)──┘       │
                                                       │
                                             stim->comb (440d, t=18)──┐
  driv (20n, t=4)──► driv->comb (80d, t=17)───────────────────────────┤
  verb (13n, t=16)─► verb->comb (440d, t=17)──────────────────────────┼──► comb (440n, t=20)
  forf (36n, t=17)─► forf->comb ×3 (108d, t=19)──────────────────────┘       │
                                                                               │
                                                                     comb->attn (440d, t=21)
                                                                               │
                                                                               ▼
                                                                        attn (40n, t=25)
                                                                     Winner-takes-all
                                                                               │
                                                                               ▼
                                                                  MotorFaculty → setItAgent()

  Legend: n=neurons, d=dendrites, t=updateAtTime
```

### Tract Details

| # | Tract | Src Lobe | Dst Lobe | Dendrites | Update Time | Role |
|---|-------|----------|----------|-----------|-------------|------|
| 0 | `visn->stim` | visn (40n) | stim (40n) | 40 | 12 | Vision saliency |
| 2 | `move->stim` | move (40n) | stim (40n) | 40 | 13 | Motion detection saliency |
| 24 | `smel->stim` | smel (40n) | stim (40n) | 40 | 14 | Smell saliency |
| 8 | `noun->stim` | noun (40n) | stim (40n) | 40 | 15 | Linguistic/command saliency |
| 5 | `driv->comb` | driv (20n) | comb (440n) | 80 | 17 | Drive motivation |
| 7 | `verb->comb` | verb (13n) | comb (440n) | 440 | 17 | Action context |
| 6 | `stim->comb` | stim (40n) | comb (440n) | 440 | 18 | Multi-sensory saliency |
| 12-14 | `forf->comb` ×3 | forf (36n) | comb (440n) | 3×36 | 19 | Social relationships |
| 3 | `comb->attn` | comb (440n) | attn (40n) | 440 | 21 | Decision matrix → attention |

### Processing Order (by updateAtTime)

The brain processes components in strict `updateAtTime` order:

| Time | Component | Type | Description |
|------|-----------|------|-------------|
| 4 | driv, visn, smel | Lobes | External inputs written by SensoryFaculty |
| 11 | move, noun | Lobes | Motion detection, linguistic input |
| 12 | visn→stim | Tract | Vision feeds stimulus lobe |
| 13 | move→stim | Tract | Motion feeds stimulus lobe |
| 14 | smel→stim | Tract | Smell feeds stimulus lobe |
| 15 | noun→stim | Tract | Noun feeds stimulus lobe |
| 16 | stim, verb | Lobes | Stimulus integration, verb input |
| 17 | driv→comb, verb→comb | Tracts | Drives and verbs feed combination |
| 18 | stim→comb | Tract | Stimulus saliency feeds combination |
| 19 | forf→comb ×3 | Tracts | Friend/foe social bias feeds combination |
| 20 | **comb** | **Lobe** | **Combination lobe integrates all inputs (440 neurons = 40 categories × 11 actions)** |
| 21 | **comb→attn** | **Tract** | **Combination output propagates to attention** |
| 25 | **attn** | **Lobe** | **Attention lobe runs winner-takes-all (40 neurons)** |

### What Each Input Represents

| Input Source | What it Encodes | Effect on Attention |
|-------------|-----------------|---------------------|
| **visn** (vision) | X-displacement to visible agents per category | "I can see a food item to my right" |
| **move** (motion) | Rate of visual change per category | "That creature is moving" |
| **smel** (smell) | Room CA chemical concentration per category | "I can smell food in this room" |
| **noun** (linguistic) | Speech/command directing attention to a category | "Someone said 'food'" |
| **driv** (drives) | Current biochemical need levels | "I am hungry" biases toward food categories |
| **verb** (actions) | Current action context | "I was eating" biases toward food-related categories |
| **forf** (friend/foe) | Social opinion of known creatures | "I like that norn" / "I fear that grendel" |

### The Combination Lobe as Decision Matrix

The `comb` lobe (440 neurons = 40 categories × 11 actions) is the critical integration point. It combines **what is available** (from `stim`, which integrates vision, motion, smell, and language) with **what is needed** (from `driv`, drives) and **what was being done** (from `verb`, actions) and **social context** (from `forf`, friend/foe relationships).

The `comb→attn` tract then projects this 440-neuron matrix down to 40 attention neurons — effectively asking "across all possible actions, which category has the strongest overall signal?"

> **Note**: The tract wiring shown here is from the default Norn genome (`norn.astro.48.gen`). Different genomes can wire different source lobes with different dendrite counts and update times. The architecture is genome-defined, not hardcoded.

---

## The Per-Tick Attention Cycle

With the tract architecture in mind, here is the complete per-tick cycle:

```
┌──────────────────────────────────────────────────────────────────┐
│              PER-TICK ATTENTION CYCLE                              │
│                                                                  │
│   1. SensoryFaculty writes external inputs                       │
│      ├── updateVisionLobe() → setInput('visn', cat, normalizedX) │
│      ├── updateSmellLobe()  → setInput('smel', cat, caValue)     │
│      ├── updateDriveLobe()  → setInput('driv', i, driveLevel)    │
│      └── Stimulate()        → setInput('noun'/'verb', id, stim)  │
│                                                                  │
│   2. Brain.updateComponents() processes by updateAtTime order    │
│      ├── t=4:  driv, visn, smel lobes update                    │
│      ├── t=11: move, noun lobes update                           │
│      ├── t=12-15: visn/move/smel/noun → stim tracts propagate   │
│      ├── t=16: stim, verb lobes update                           │
│      ├── t=17: driv→comb, verb→comb tracts propagate             │
│      ├── t=18: stim→comb tract propagates                        │
│      ├── t=19: forf→comb ×3 tracts propagate                    │
│      ├── t=20: comb lobe updates (integrates all)                │
│      ├── t=21: comb→attn tract propagates                        │
│      └── t=25: attn lobe runs winner-takes-all                   │
│                                                                  │
│   3. MotorFaculty.processBrainAttention()                        │
│      ├── winningId = brain.getWinningId('attn')                 │
│      ├── agent = sensory.getKnownAgent(winningId)               │
│      ├── Validate: visn[winningId].STATE_VAR ≠ 0.0              │
│      │   └── If 0.0: agent = null (no longer visible)           │
│      ├── creature.setItAgent(agent)                              │
│      └── myCurrentFocusOfAttention = winningId                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## MotorFaculty: Attention to IT Agent

The `MotorFaculty.processBrainAttention()` method translates the attention lobe's output into the creature's focus:

### Step 1: Get Winning Category

```javascript
// MotorFaculty.js:236-238
const winningAttentionId = (this.myVoluntaryScriptOverrides.attentionScriptNo >= 0) ?
    this.myVoluntaryScriptOverrides.attentionScriptNo :
    brain.getWinningId('attn');
```

Like the decision lobe, the attention lobe supports `URGE` command overrides. If no override is active, the brain's winner-takes-all result is used.

### Step 2: Resolve Category to Agent

```javascript
// MotorFaculty.js:242
let winningAgent = sensory.getKnownAgent(winningAttentionId);
```

The winning neuron ID (0-39) directly indexes the `myKnownAgents` array. This is why the known agents array must be updated every tick — it provides the bridge between the brain's categorical attention and the world's concrete agents.

### Step 3: Validate Vision Signal

```javascript
// MotorFaculty.js:259-262
const visnState = brain.getNeuronState('visn', winningAttentionId, 0);  // STATE_VAR
if (visnState === 0.0) {
    winningAgent = null;  // Brain selected it but creature can't see it
}
```

Even if the attention lobe picks a category, the MotorFaculty verifies that the vision lobe still has a signal for that category. If the vision neuron's STATE_VAR is 0.0 (nothing visible in that category), the agent is cleared. This prevents the creature from acting on objects that disappeared between brain ticks.

### Step 4: Set IT Agent

```javascript
// MotorFaculty.js:265-272
creature.setItAgent(winningAgent);
if (!winningAgent) {
    creature.setIntrospective(true);  // No focus → introspective mode
}
```

If no valid agent was found, the creature becomes **introspective** — it has no external focus and can only perform introspective actions (rest, travel, express need, etc.).

### Step 5: Script Interruption on Focus Change

```javascript
// MotorFaculty.js:248-254
if (!isIntrospective && winningAttentionId !== this.myCurrentFocusOfAttention) {
    vm.stopScriptExecuting();
}
```

When the attention category changes (not just the specific agent, but the entire category), the current script is interrupted. This ensures the creature re-evaluates its behavior for the new focus.

---

## Instinct Processing: Noun Lobe Stimulation

During REM sleep, instincts teach the creature associations between objects and actions. When an instinct gene references the noun lobe, the system also stimulates the corresponding vision and smell neurons to simulate multi-sensory perception:

```text
// Instinct input injection
if lobeName == "noun":
    brain.SetInput("visn", myInputs[i].neuronId, 0.1)  // See this object
    brain.SetInput("smel", myInputs[i].neuronId, 1.0)  // Smell it too
brain.SetInput(lobeName, myInputs[i].neuronId, 1.0)
```

This ensures that when an instinct teaches "when hungry, eat food (category 11)", the vision and smell lobes also activate for that category — creating a complete multi-sensory association.

### Knowledge Building

After instinct processing, the brain builds a knowledge table by probing what the attention and decision lobes choose for each drive:

```javascript
// Brain.js:359-385
// Stimulate noun neurons (all = 0.5) and vision (all = 0.1)
// Stimulate one drive neuron (= 1.0)
// Run brain update
// Record: { attentionId: getWinningId('attn'), decisionId: getWinningId('decn') }
```

This produces 20 entries mapping each drive to the brain's preferred attention target and action.

---

## PayAttentionToCreature: Forced Focus

The CAOS command system can force a creature to pay attention to a specific creature via `payAttentionToCreature()`:

```javascript
// SensoryFaculty.js:905-928
payAttentionToCreature(lookAtCreature) {
    if (!creature.canSee(lookAtCreature)) return -1;
    if (!creature.Life().getWhetherAlert()) return -1;

    const id = CategorySystem.getCategoryIdOfAgent(lookAtCreature);
    this.setKnownAgent(id, lookAtCreature);
    brain.clearNeuronActivity('noun', id);  // Reset noun for fresh attention
    return id;
}
```

This overrides the vision system's representative selection for that category, placing the specified creature as the known agent. The noun neuron is cleared to allow fresh input.

---

## Comparison: Attention Lobe vs Decision Lobe

| Aspect | Attention Lobe (`attn`) | Decision Lobe (`decn`) |
|--------|------------------------|----------------------|
| **Question** | "What should I focus on?" | "What should I do?" |
| **Neurons** | 40 (object categories) | 14 (action types) |
| **Input mirror** | Noun lobe (`noun`) | Verb lobe (`verb`) |
| **Neuron names** | "Agent Categories" | "Creature Actions" |
| **Winner meaning** | Category ID (0-39) | Action ID (0-13) |
| **Resolution** | Category → `getKnownAgent()` → IT agent | Neuron → `getScriptOffsetFromNeuronId()` → script |
| **Validation** | Check visn STATE_VAR ≠ 0.0 | Check `doesThisScriptRequireAnItObject()` |
| **Consumer** | `processBrainAttention()` | `processBrainDecision()` |
| **Override** | `URGE` CAOS command | `URGE` CAOS command |
| **Catalogue name** | "Agent Categories" | "Creature Actions" |

Both lobes use identical `Lobe.doUpdate()` winner-takes-all mechanics — they differ only in what their neurons represent and how their output is consumed. The MotorFaculty processes attention first, then decision, each tick.

---

## Key Constants

```javascript
// PerceptionConstants.js
export const NUMCATEGORIES = 40;
export const VISUAL_RANGE = 512;              // Default visual range in pixels
export const NO_RANDOM_NEAR_AGENTS = 5;       // For PICK_RANDOM_NEAREST algorithm
export const NEAR_RAND_VISUAL_RANGE = 200;    // Range for random-nearest

export const CategoryRepAlgorithm = {
    PICK_NEAREST_IN_X_DIRECTION: 0,           // Default
    PICK_A_RANDOM_ONE: 1,
    PICK_NEAREST_IN_CURRENT_ROOM: 2,
    PICK_NEAREST_TO_GROUND: 3,
    PICK_RANDOM_NEAREST_IN_X_DIRECTION: 4
};
```

---

## Key Source Files

### JavaScript (Rebuild)

| File | Purpose |
|------|---------|
| `MotorFaculty.js:223-279` | `processBrainAttention()` — attention winner to IT agent pipeline |
| `SensoryFaculty.js:46` | `myKnownAgents` array — 40 elements, one representative per category |
| `SensoryFaculty.js:357-459` | `updateVisionLobe()` — representative selection, visn input, edge cases |
| `SensoryFaculty.js:465-507` | `findCategoryRepresentative()` — configurable selection algorithms |
| `SensoryFaculty.js:882-897` | `getKnownAgent()` / `setKnownAgent()` — array access |
| `SensoryFaculty.js:905-928` | `payAttentionToCreature()` — forced focus via CAOS |
| `Brain.js:497-500` | `getWinningId('attn')` — returns winning neuron ID |
| `Brain.js:359-385` | Knowledge building — records attention + decision for each drive |
| `Lobe.js:157-240` | `doUpdate()` — winner-takes-all mechanism (shared with decn) |
| `PerceptionConstants.js:9-29` | `NUMCATEGORIES`, `VISUAL_RANGE`, `CategoryRepAlgorithm` |
| `CategorySystem.js` | Static category management — classifiers, algorithms, names |

---

## Related Articles

- [Decision Lobe Architecture](#/article/decision-lobe-architecture) - The companion output lobe that selects actions to perform on the IT agent
- [Vision Lobe Architecture](#/article/vision-lobe-architecture) - The vision lobe whose per-category X-displacement feeds into the attention pipeline
- [Detail Lobe Architecture](#/article/detail-lobe-architecture) - Encodes 11 properties of the IT agent selected by attention
- [Drive Lobe Architecture](#/article/drive-lobe-architecture) - Drive signals that bias attention toward categories that satisfy needs
- [Creature Perception](#/article/creature-perception) - Overview of all sensory modalities including the category system
- [Brain & Neural Networks](#/article/brain-system) - Lobe architecture, SVRules, tracts, and winner-takes-all
