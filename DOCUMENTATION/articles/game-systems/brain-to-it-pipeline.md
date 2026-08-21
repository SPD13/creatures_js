# Brain → IT Object Pipeline

How does a creature decide **what to pay attention to**? The "IT" object — the creature's current focus of attention — is determined through a three-layer pipeline that flows from **visual perception** through **brain competition** to **motor faculty selection**. This article traces every step, from scanning the world for visible agents to the final `setItAgent()` call.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  BRAIN → IT OBJECT PIPELINE                     │
│                                                                 │
│   LAYER 1: PERCEPTION (SensoryFaculty)                         │
│   ┌─────────────────────────────────────────────────┐          │
│   │  For each of 40 agent categories:               │          │
│   │    Find visible agents → Pick representative    │          │
│   │    Store in myKnownAgents[category]              │          │
│   │    Feed (X, Y) position into visn/elvn lobes    │          │
│   └──────────────────────┬──────────────────────────┘          │
│                          ▼                                      │
│   LAYER 2: BRAIN COMPETITION                                   │
│   ┌─────────────────────────────────────────────────┐          │
│   │  Attention Lobe (attn): 40 neurons compete      │          │
│   │  Winner = category ID (0-39)                     │          │
│   └──────────────────────┬──────────────────────────┘          │
│                          ▼                                      │
│   LAYER 3: MOTOR SELECTION (MotorFaculty)                      │
│   ┌─────────────────────────────────────────────────┐          │
│   │  1. Get winning category from brain              │          │
│   │  2. Look up agent: sensory.getKnownAgent(catId) │          │
│   │  3. Validate: visn lobe must have signal         │          │
│   │  4. creature.setItAgent(winningAgent) → IT!      │          │
│   └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight**: The attention lobe winner is a **category ID** (0-39), not an agent. The actual IT agent comes from SensoryFaculty's known agents list — it's the representative agent for that category.

---

## Layer 1: Perception — Building the Known Agents List

### What SensoryFaculty Does

Every creature tick, `SensoryFaculty.update()` scans the world to find one representative agent per category. There are **40 categories** total (1-25 simple objects, 26-35 compounds, 36-39 creatures). The result is stored in `myKnownAgents[category]`.

```
┌──────────────────────────────────────────────────────────────┐
│                SENSORY FACULTY VISION UPDATE                  │
│                                                              │
│  For each category (0-39):                                   │
│    ┌──────────┐    ┌─────────────┐    ┌───────────────────┐ │
│    │ Find all │───►│ Filter by   │───►│ Pick one using    │ │
│    │ agents   │    │ visibility  │    │ category algorithm │ │
│    │ matching │    │ (CanSee)    │    │                   │ │
│    │ category │    │             │    │ → REPRESENTATIVE  │ │
│    └──────────┘    └─────────────┘    └────────┬──────────┘ │
│                                                │             │
│    ┌───────────────────────────────────────────▼───────────┐ │
│    │  myKnownAgents[category] = representative agent       │ │
│    │  brain.setInput('visn', category, normalizedX)        │ │
│    │  brain.setInput('elvn', category, normalizedY)        │ │
│    └───────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Category Representative Algorithms

Each category can use a different algorithm to select its representative agent. This is configured via the catalogue system.

| Algorithm | Name | Description |
|-----------|------|-------------|
| 0 | `PICK_NEAREST_IN_X_DIRECTION` | Smallest horizontal distance (default) |
| 1 | `PICK_A_RANDOM_ONE` | Random selection from visible agents |
| 2 | `PICK_NEAREST_IN_CURRENT_ROOM` | Closest agent in the same room |
| 3 | `PICK_NEAREST_TO_GROUND` | Closest to ground level |
| 4 | `PICK_RANDOM_NEAREST_IN_X_DIRECTION` | Random pick from up to 5 nearest in X |

### Persistence Rule

If the creature is **already attending** to an agent in a category (the noun lobe neuron for that category > 0.20), and the agent is still visible, the known agent is **kept unchanged**. This prevents flickering during conversations and sustained interactions.

```text
if myKnownAgents[genusId].IsValid()
   and creature.CanSee(myKnownAgents[genusId])
   and brain.GetNeuronState("noun", genusId, STATE_VAR) > 0.20:
       continue   // Keep the current known agent
```

### Carried Object Priority

If the creature is carrying an object, that object **always** becomes the known agent for its category. This ensures the creature always perceives what it's holding.

### Vision Lobe Inputs

For each category with a known agent, the SensoryFaculty normalizes the agent's position relative to the creature and feeds it into two brain lobes:

- **visn** (vision): Normalized X displacement (-1.0 to 1.0)
- **elvn** (elevation): Normalized Y displacement (-1.0 to 1.0)
- If no agent is visible: both inputs are set to **0.0**

### Key Files

| Component | JS |
|-----------|-----|
| Vision update | `SensoryFaculty.js:updateVisionLobe()` |
| Known agents | `SensoryFaculty.js:myKnownAgents[]` |
| Representative selection | `SensoryFaculty.js:findCategoryRepresentative()` |

---

## Layer 2: Brain — Attention Lobe Competition

### How the Attention Lobe Works

The attention lobe (`attn`) contains **40 neurons**, one per agent category. Contrary to what one might assume, the attention lobe receives input from a **single tract**: `comb->attn`. The combination lobe (`comb`) is the sole integration point that merges all perceptual and motivational signals before feeding them to attention.

```
┌─────────────────────────────────────────────────────────────────┐
│              ATTENTION LOBE INPUT PATHWAY                        │
│                                                                 │
│   visn ──► stim ──┐                                            │
│   visn ──► move ──► stim ──┐                                   │
│   visn ──► smel ──► stim ──┤                                   │
│   noun ──► stim ──────────►├──► comb ──► attn ──► Winner       │
│                            │    (440      (40       (category   │
│   driv ───────────────────►│    neurons)  neurons    ID 0-39)  │
│   verb ───────────────────►│    combine   compete               │
│   driv ──► forf ──────────►┘    signals)  via WTA)             │
│   driv ──► mood ──► forf ──┘                                   │
│                                                                 │
│   Only ONE tract feeds attn: comb->attn (440 dendrites)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The neuron with the **highest output** wins the competition (**Winner Takes All**). Its index IS the category ID.

### Attention Lobe Update Rule (from genome)

The `attn` lobe update rule implements a simple WTA pattern:

```
Line 0: LOAD_ACCUMULATOR_FROM  NEURON[1]         // Load INPUT into accumulator
Line 3: STORE_ACCUMULATOR_INTO NEURON[0]          // Store to STATE
Line 4: BLANK_OPERAND          NEURON[1]          // Clear INPUT (consumed)
Line 5: IF_GREATER_THAN        SPARE_NEURON[0]    // If acc > current max...
Line 6: SET_TO_SPARE_NEURON                       // ...track this neuron as winner
```

The `comb->attn` tract update rule accumulates source neuron output into destination neuron input:

```
Line 0: LOAD_ACCUMULATOR_FROM  INPUT_NEURON[2]    // Load src neuron OUTPUT
Line 1: ADD_AND_STORE_IN       NEURON[1]          // Add to dst neuron INPUT
```

This means each attention neuron receives the sum of all connected comb neuron outputs, then the WTA selects the strongest.

### Brain Output

```javascript
brain.getWinningId('attn')  // Returns 0-39 (category ID)
```

This value represents **which category the creature is paying attention to**, NOT which specific agent. The specific agent is resolved in the next layer.

### Key Files

| Component | JS |
|-----------|-----|
| Winning neuron | `Brain.js:getWinningId()` |
| Attention lobe | Genome-defined (norn.astro.48.gen) |
| Architecture data | `DOCUMENTATION/CreaturesData/brain-architecture.json` |

For a deep-dive into the attention lobe architecture, see the **[attn] Attention Lobe Architecture** article.

---

## Layer 3: Motor Selection — Setting IT

### The Complete IT Selection Logic

`MotorFaculty.processBrainAttention()` runs every creature tick (after brain update) and performs these steps:

```
┌─────────────────────────────────────────────────────────────────┐
│              MOTOR FACULTY: IT SELECTION                         │
│                                                                 │
│  1. GET WINNING ATTENTION ID                                    │
│     ┌─────────────────────────────────────────┐                │
│     │ Has URGE override?                       │                │
│     │   YES → use override.attentionScriptNo   │                │
│     │   NO  → brain.getWinningId('attn')       │                │
│     └──────────────────┬──────────────────────┘                │
│                        ▼                                        │
│  2. LOOK UP AGENT FROM SENSORY                                  │
│     ┌─────────────────────────────────────────┐                │
│     │ sensory.getKnownAgent(winningAttentionId)│                │
│     │ → Returns actual Agent or null           │                │
│     └──────────────────┬──────────────────────┘                │
│                        ▼                                        │
│  3. IS THIS A NEW IT? (different from current)                  │
│     ┌─────────────────────────────────────────┐                │
│     │ YES:                                     │                │
│     │   a. Stop running script if focus changed│                │
│     │   b. Check visn lobe has signal          │                │
│     │      (if visn == 0.0 → agent = null)     │                │
│     │   c. creature.setItAgent(winningAgent)   │                │
│     │   d. If null → creature.setIntrospective │                │
│     │ NO:                                      │                │
│     │   Keep current IT, no change             │                │
│     └──────────────────┬──────────────────────┘                │
│                        ▼                                        │
│  4. UPDATE FOCUS TRACKING                                       │
│     myCurrentFocusOfAttention = winningAttentionId              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Validation Gate

Even if the attention neuron "wins" the competition, the IT object is only set if the **visn lobe has a non-zero signal** for that category. This ensures the creature cannot attend to something it doesn't actually see.

```javascript
const visnState = brain.getNeuronState('visn', winningAttentionId, 0);
if (visnState === 0.0) {
    winningAgent = null;  // No visual input = no IT
}
```

### Introspection

When the IT object becomes **null** (no valid attention target), the creature enters **introspective mode** — it shifts from external focus (interacting with the world) to internal focus (thinking). In introspective mode, decision scripts that require an IT object are not executed.

### URGE Override

The CAOS `URGE` command can override the attention ID via `myVoluntaryScriptOverrides.attentionScriptNo`. When set to a value >= 0, it bypasses the brain's attention lobe winner and forces the creature to attend to a specific category.

```
URGE WRIT <creature> <noun_id> <verb_id> <urgency>
```

This sets both the attention override (noun_id) and the decision override (verb_id), allowing CAOS scripts to directly control what the creature pays attention to and what action it takes.

### Key Files

| Component | JS |
|-----------|-----|
| IT selection | `MotorFaculty.js:processBrainAttention()` |
| Set IT agent | `Creature.js:setItAgent()` |
| Script override | `MotorFaculty.js:myVoluntaryScriptOverrides` |

---

## What Happens After IT Is Set

Once the IT object is established, the **decision pipeline** takes over to determine what the creature does with IT:

```
┌─────────────────────────────────────────────────────────────────┐
│              FROM IT TO ACTION                                   │
│                                                                 │
│  IT object set ──► Decision lobe (decn) picks action            │
│                         │                                       │
│                         ▼                                       │
│                    Script event = action + offset                │
│                    ┌────────────────────────────┐               │
│                    │ IT is a Creature? +32      │               │
│                    │ IT is an Object?  +16      │               │
│                    └────────────┬───────────────┘               │
│                                 ▼                               │
│                    ExecuteScriptForClassifier()                  │
│                    (runs CAOS script for that action)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The decision lobe (`decn`) is a separate winner-takes-all competition with 14 neurons (one per voluntary action: NONE, MOVE_LEFT, MOVE_RIGHT, ..., APPROACH, RETREAT). The winning action combined with the IT type determines which CAOS script event fires.

For the full action execution chain, see the **Movement Decision Chain** article.

---

## Complete Data Flow Summary

```
                     SensoryFaculty                   Brain                    MotorFaculty
                     ──────────────                   ─────                    ────────────

  World agents ──►  findCategoryRepresentative()
                           │
                           ▼
                    myKnownAgents[cat] = agent  ──►  visn/elvn lobe inputs
                                                           │
                                                           ▼
                                                     Attention lobe (attn)
                                                     40 neurons compete
                                                           │
                                                           ▼
                                                     Winner = category ID  ──►  getWinningId('attn')
                                                                                      │
                                                                                      ▼
                    getKnownAgent(categoryId)  ◄──────────────────────────  Look up actual agent
                           │
                           ▼
                    Return Agent or null        ──►  Validate visn signal
                                                           │
                                                           ▼
                                                     creature.setItAgent()
                                                           │
                                                           ▼
                                                        IT OBJECT
                                                     (attention target)
```

---

## Key Insights

1. **IT is not the attention lobe winner itself.** The attention winner is a category ID (0-39). IT is the actual agent that SensoryFaculty selected as the representative for that category.

2. **Three systems must agree.** SensoryFaculty must see an agent, the brain's attention lobe must select that category, AND the vision lobe must still have signal — only then is IT set.

3. **Perception reaches attention indirectly.** There is no direct visn→attn or noun→attn tract. Instead, perception flows through intermediate lobes (visn→stim→comb→attn). The **combination lobe** (`comb`, 440 neurons) is the sole gateway to attention, integrating vision, drives, verbs, and learned associations. If no agent is visible for a category, the visn signal is 0.0, which propagates through stim→comb as a weak or zero signal, making it unlikely that category wins.

4. **Persistence prevents flickering.** The noun-lobe-based persistence rule (> 0.20 threshold) keeps a known agent stable during sustained interactions and conversations.

5. **URGE bypasses the brain.** CAOS scripts can force attention to a specific category via the URGE override system, useful for scripted behaviors and quests.

6. **Introspection is the null state.** When no valid IT exists, the creature becomes introspective — it can only execute scripts that don't require an external target.

7. **Carried objects always win.** If the creature is holding something, that object always becomes the known agent for its category, ensuring the creature perceives what it carries.
