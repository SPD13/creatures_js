# [visn] Vision Lobe Architecture

This article provides a deep-dive into how the vision lobe connects to the SensoryFaculty and how visual perception data flows from the game world into the creature's brain. It covers the complete pipeline from world-level agent visibility checks through to neuron activation and downstream tract propagation.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              VISION LOBE DATA FLOW (END-TO-END)                  │
│                                                                 │
│   World (Agent positions)                                       │
│       │                                                         │
│       ▼                                                         │
│   Agent::CanSee()                                               │
│   ├── Distance check (512px visual range)                      │
│   ├── Line-of-sight through Map (wall permeability)            │
│   └── Self-exclusion (can't see self)                          │
│       │                                                         │
│       ▼                                                         │
│   Creature::CanSee() (additional filters)                       │
│   ├── Invisible attribute check                                │
│   ├── Height constraints (Y-axis bounds)                       │
│   └── Vehicle enclosure matching                               │
│       │                                                         │
│       ▼                                                         │
│   AgentManager.findBySightAndFGS()                              │
│   └── Filter visible agents by classifier (family/genus/species)│
│       │                                                         │
│       ▼                                                         │
│   SensoryFaculty.findCategoryRepresentative()                   │
│   └── Pick ONE agent per category (algorithm-dependent)        │
│       │                                                         │
│       ▼                                                         │
│   SensoryFaculty.updateVisionLobe()                             │
│   └── Normalize position to [-1.0, +1.0]                      │
│       │                                                         │
│       ▼                                                         │
│   Brain.setInput('visn', neuronId, value)                       │
│       │                                                         │
│       ▼                                                         │
│   Lobe.setNeuronInput() → accumulates input                    │
│       │                                                         │
│       ▼                                                         │
│   Lobe.doUpdate() → SVRule processes neuron                    │
│       │                                                         │
│       ▼                                                         │
│   Tract.doUpdate() → weighted dendrites propagate signal       │
│   └── Feeds attention lobe, decision lobe, etc.                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: World-Level Visibility

Before any perception data reaches the brain, the engine determines which agents a creature can physically see.

### Agent::CanSee() (Base Visibility)

The base `Agent.CanSee()` performs three checks:

```text
function CanSee(self, other):
    // 1. Self exclusion
    if self == other: return false

    // 2. Visual range check (squared distance)
    visualRange = GetVisualRange()
    if SquareDistanceTo(v1, v2) > visualRange * visualRange:
        return false

    // 3. Line-of-sight through walls
    canSee = Map.CanPointSeePoint(v1, v2, perm)
    return canSee
```

| Check | Description |
|-------|-------------|
| **Self exclusion** | Agents cannot see themselves |
| **Range check** | Euclidean distance must be within `VISUAL_RANGE` (512px) |
| **Line-of-sight** | Map checks wall permeability between the two points |

### Creature::CanSee() (Extended Visibility)

Creatures add additional constraints on top of `Agent.CanSee()`:

```text
function CanSee(self, other):    // creature override
    if not baseCanSee(self, other): return false

    // Invisible agents are not visible
    if TestAttributes(other, attrInvisible): return false

    // Y-position constraints (height range)
    if pressed.y < myPosition.y - myHeight: return false      // too high
    if pressed.y > myPosition.y + 2*myHeight: return false    // too low

    // Vehicle enclosure: both must be in same root vehicle
    return true
```

| Check | Description |
|-------|-------------|
| **Invisible attribute** | Agents with `attrInvisible` are hidden |
| **Height range** | Target must be within 1x height above to 2x height below creature |
| **Vehicle enclosure** | Both creatures must share the same root vehicle (or both be outside) |

---

## Stage 2: Category-Based Agent Grouping

Visible agents are organized into **40 categories**, each defined by a classifier pattern (family, genus, species). A `0` in any classifier field acts as a wildcard.

### Category Layout

| Category Range | Type | Example |
|---------------|------|---------|
| 0-25 | Simple objects | Food, toys, machines |
| 26-35 | Compound objects / environments | Norn Home, Grendel Home |
| 36-39 | Creatures | Norn (36), Grendel (37), Ettin (38), Other (39) |

### One Representative Per Category

The vision lobe has exactly **one neuron per category**. When multiple agents of the same type are visible, only one is selected as the "representative" using a configurable algorithm.

```
┌─────────────────────────────────────────────────────────────────┐
│           ONE REPRESENTATIVE PER CATEGORY                        │
│                                                                 │
│   Category 36 "Norn":                                           │
│                                                                 │
│       ○ Norn A (300px away)                                     │
│       ○ Norn B (150px away)  ←── SELECTED (nearest)            │
│       ○ Norn C (400px away)                                     │
│                                                                 │
│   Only Norn B's position is encoded in the vision lobe          │
│   The creature is aware of ONE norn at a time per category      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Representative Selection Algorithms

Each category has a configurable algorithm loaded from the catalogue's `"Category Representative Algorithms"` entry:

| Algorithm ID | Name | Behavior |
|-------------|------|----------|
| 0 | `PICK_NEAREST_IN_X_DIRECTION` | Nearest horizontal distance in facing direction |
| 1 | `PICK_A_RANDOM_ONE` | Random selection from all visible |
| 2 | `PICK_NEAREST_IN_CURRENT_ROOM` | Nearest using 2D Euclidean distance, same room only |
| 3 | `PICK_NEAREST_TO_GROUND` | Agent with highest Y coordinate (closest to floor) |
| 4 | `PICK_RANDOM_NEAREST_IN_X_DIRECTION` | Random from 5 nearest in facing direction |

---

## Stage 3: SensoryFaculty Sets Vision Lobe Inputs

The `SensoryFaculty.updateVisionLobe()` method is called each brain tick. It iterates all 40 categories and sets the brain inputs.

### Position Normalization

For each category with a visible representative, the displacement from creature to agent is calculated and normalized:

```javascript
// Horizontal displacement
const dx = agentPosition.x - creaturePosition.x;
const normalizedX = Math.max(-1.0, Math.min(1.0, dx / VISUAL_RANGE));

// Vertical displacement
const dy = agentPosition.y - creaturePosition.y;
const normalizedY = Math.max(-1.0, Math.min(1.0, dy / VISUAL_RANGE));

// Set brain inputs — X to visn lobe, Y to elvn lobe (matches the original engine)
// Note: elvn lobe doesn't exist in any genome, so Y data is silently discarded
brain.setInput('visn', category, normalizedX);        // X displacement → visn lobe
brain.setInput('elvn', category, normalizedY);         // Y displacement → elvn dummy lobe
```

### Normalized Value Interpretation

| Value | Meaning |
|-------|---------|
| `-1.0` | Agent is at maximum range to the left (X) or above (Y) |
| `0.0` | Agent is at the same position, or no agent visible |
| `+1.0` | Agent is at maximum range to the right (X) or below (Y) |

### Worked Example

```
┌─────────────────────────────────────────────────────────────────┐
│                  NORMALIZATION EXAMPLE                            │
│                                                                 │
│   Creature at (400, 300), Agent at (600, 200)                   │
│   VISUAL_RANGE = 512                                            │
│                                                                 │
│   X = (600 - 400) / 512 = +0.39  (agent is to the right)      │
│   Y = (200 - 300) / 512 = -0.20  (agent is above)             │
│                                                                 │
│   Creature at (400, 300), Agent at (100, 800)                   │
│                                                                 │
│   X = (100 - 400) / 512 = -0.59  (agent is to the left)       │
│   Y = (800 - 300) / 512 = +0.98  (agent is far below)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stage 4: Vision Lobe Neuron Layout

### Architecture: visn and elvn Lobes

Both the original engine and JavaScript use the same architecture — `SensoryFaculty` writes X-displacement to the `"visn"` lobe and Y-displacement to the `"elvn"` (elevation) lobe:

```
┌─────────────────────────────────────────────────────────────────┐
│         VISION LOBE ARCHITECTURE (ORIGINAL AND REBUILD)         │
│                                                                 │
│   "visn" lobe: 40 neurons (defined in genome)                   │
│   [cat0_X][cat1_X][cat2_X]...[cat39_X]                         │
│   └── X displacement, processed by visn SVRule                  │
│                                                                 │
│   "elvn" lobe: NOT DEFINED IN ANY GENOME                        │
│   [cat0_Y][cat1_Y][cat2_Y]...[cat39_Y]  ← silently discarded  │
│   └── Y displacement, resolves to dummy/null lobe               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key discovery**: The `"elvn"` lobe token is referenced by the sensory faculty via `SetInput("elvn", ...)`, but **no genome** (neither Norn, Grendel, nor Ettin) defines a lobe with this token. The "Brain Lobe Quads" catalogue (`Brain.catalogue:64-76`) lists exactly 12 lobes, and `"elvn"` is not among them. In both the original engine and the rebuild, `Brain.getLobeFromTokenString("elvn")` resolves to a dummy lobe whose `setNeuronInput()` is a no-op. The Y-displacement data is **silently discarded**.

This means creatures in the original Creatures 3 never actually processed elevation/vertical displacement data in their brains — only horizontal (X) displacement influenced attention and decision-making.

> **Future enhancement**: A modder or future genome could define an `"elvn"` lobe with 40 neurons, at which point Y-displacement data would automatically be processed. The SensoryFaculty code already writes the correct values.

### Neuron Index Mapping (visn lobe only — 40 neurons)

| Neuron Index | Content | Example |
|-------------|---------|---------|
| 0 | X displacement for category 0 | Food item horizontal position |
| 1 | X displacement for category 1 | Toy horizontal position |
| ... | ... | ... |
| 36 | X displacement for category 36 | Norn horizontal position |
| 39 | X displacement for category 39 | Other creature horizontal position |

---

## Stage 5: Brain Processing (SetInput → Neuron Update)

### Input Accumulation

When `Brain.setInput()` is called, the value is **accumulated** in the neuron's input buffer — not immediately processed:

```javascript
// Brain.js
setInput(lobeTokenString, whichNeuron, toWhat) {
    const lobe = this.getLobeFromTokenString(lobeTokenString);
    lobe.setNeuronInput(whichNeuron, toWhat);
}

// Lobe.js
setNeuronInput(whichNeuron, toWhat) {
    this.myNeuronInput[whichNeuron] += toWhat;  // ACCUMULATES
}
```

This accumulation is important: multiple inputs can be applied to the same neuron before the lobe updates. All inputs are summed and processed as a batch during `Lobe.doUpdate()`.

### Lobe Update Cycle

During each brain tick, `Lobe.doUpdate()` processes all accumulated inputs through the neuron's genetic SVRule:

```
┌─────────────────────────────────────────────────────────────────┐
│                  LOBE UPDATE CYCLE                                │
│                                                                 │
│   For each neuron in the vision lobe:                           │
│                                                                 │
│   1. Read accumulated input → SVRule.invalidVariables[0]        │
│   2. Reset input accumulator to 0.0                             │
│   3. Execute SVRule (genetic program):                          │
│      ├── Reads INPUT_VAR (accumulated sensory data)             │
│      ├── Reads STATE_VAR (neuron's previous state)              │
│      ├── Applies genetic operations (add, multiply, threshold)  │
│      ├── Updates STATE_VAR (new neuron activation)              │
│      └── Calculates OUTPUT_VAR (signal for tracts)              │
│   4. Neuron is ready for tract propagation                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Neuron State Variables

Each vision lobe neuron maintains these state variables:

| Variable | Index | Purpose |
|----------|-------|---------|
| `STATE_VAR` | 0 | Current activation level of the neuron |
| `INPUT_VAR` | 1 | Accumulated input from SensoryFaculty |
| `OUTPUT_VAR` | 2 | Output signal sent through tracts |
| Additional vars | 3+ | Used by SVRule for learning, decay, etc. |

---

## Stage 6: Tract Propagation

After the vision lobe updates its neurons, **tracts** carry the output signals to downstream lobes.

### Tract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRACT CONNECTIONS                              │
│                                                                 │
│   Vision Lobe (visn)                                            │
│   [cat0][cat1]...[cat39]                                        │
│      │     │         │                                          │
│      └─────┴────┬────┘                                          │
│                 │  weighted dendrites                            │
│                 ▼                                                │
│   Attention Lobe (attn)                                         │
│   [   winner-takes-all competition   ]                          │
│                 │                                                │
│                 ▼                                                │
│   Winning Category ID → sets IT Agent                           │
│                                                                 │
│   Also connects to:                                             │
│   ├── Noun Lobe (noun) → object classification                 │
│   ├── Decision Lobe (detn) → action selection                  │
│   └── Concept Lobe → stimulus association                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dendrite Variables

Each tract connection has its own learning state:

| Variable | Purpose |
|----------|---------|
| `WEIGHT_SHORTTERM_VAR` | Immediate synaptic strength (current session) |
| `WEIGHT_LONGTERM_VAR` | Long-term memory (persists across learning) |
| `STRENGTH_VAR` | Connection permanence (resistance to dendrite migration) |

### How Vision Influences Decisions

The flow from vision to action is:

1. **Vision lobe** neurons activate based on what is visible
2. **Tracts** carry weighted signals to the **attention lobe**
3. **Attention lobe** runs winner-takes-all: strongest category wins
4. Winning category's representative becomes the **IT agent**
5. Detail lobe receives properties of the IT agent
6. **Decision lobe** combines attention, drives, and detail to choose an action

---

## Edge Cases and Special Behaviors

### Carried Objects Are Always Visible

If the creature is carrying an object, that object's vision input is always set to `(0.0, 0.0)` — meaning "right here at my position":

```javascript
const carried = creature.getCarried();
if (carried) {
    const carriedCategory = CategorySystem.getCategoryIdOfAgent(carried);
    brain.setInput('visn', carriedCategory, 0.0);        // X = center
    brain.setInput('elvn', carriedCategory, 0.0);         // Y = center (discarded by dummy lobe)
}
```

### Conversation Stability

To prevent attention flickering during interactions, the system implements tracking persistence:

```javascript
// If a previously-tracked agent is still visible, keep tracking it
// even if a different agent would be selected by the algorithm
const previousAgent = this.getKnownAgent(category);
if (previousAgent && previousAgent.isAlive()) {
    const distance = calculateDistance(creature, previousAgent);
    if (distance <= VISUAL_RANGE) {
        // Keep tracking previous agent for stability
        return previousAgent;
    }
}
```

### No Agent Visible

When no agent is visible for a category, both X and Y inputs are set to `0.0`. This is the neutral/silent value — the neuron receives no stimulation and its state decays according to its SVRule.

### Sleeping Creatures

The vision update is skipped entirely when the creature is asleep or unconscious. The vision lobe receives no new input, and existing neuron states decay naturally.

---

## Key Constants

```javascript
VISUAL_RANGE = 512                // Default creature vision range (pixels)
NEAR_RAND_VISUAL_RANGE = 200      // Range for algorithm 4 (random nearest)
NO_RANDOM_NEAR_AGENTS = 5         // Number of agents to consider for algorithm 4
NUM_CATEGORIES = 40               // Total vision categories
```

---

## Key Source Files

### JavaScript (Rebuild)

| File | Purpose |
|------|---------|
| `SensoryFaculty.js` | `updateVisionLobe()`, representative selection, normalization |
| `CategorySystem.js` | Category definitions, classifier matching |
| `PerceptionConstants.js` | Vision range, category count, algorithm IDs |
| `Brain.js` | `setInput()`, lobe lookup by token string |
| `Lobe.js` | Neuron input accumulation, `doUpdate()` with SVRule |
| `Creature.js` | Faculty integration, update coordination |
| `Agent.js` | Base visibility checks |

---

## Related Articles

- [Creature Perception](#/article/creature-perception) - Overview of all sensory modalities
- [Brain & Neural Networks](#/article/brain-system) - Lobe architecture, SVRules, and tract processing
- [Creature Faculties](#/article/creature-faculties) - SensoryFaculty within the faculty system
