# [detl] Detail Lobe Architecture

This article provides a deep-dive into the detail lobe (`detl`) — the brain lobe responsible for encoding detailed properties of the creature's current attention target (the "IT" agent). With 16 genome-defined neurons (11 engine-written), the detail lobe captures nearness, carry state, family relationships, size, smell, and motion of whatever the creature is currently focusing on. It is one of the 9 engine-fed input lobes but is unique in that the standard norn genome defines **zero tracts** connecting it to any other lobe — its neuron states are written by `SensoryFaculty.updateDetailLobe()` and processed by the SVRule but never propagated onward. This makes it a **latent capacity lobe**: the infrastructure exists for genome variants to wire detail information into decision-making, but the default norn genome does not use it.

## End-to-End Data Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│              DETAIL LOBE DATA FLOW (END-TO-END)                        │
│                                                                       │
│   Vision Lobe ("visn")                                                │
│   └── 40 neurons: X displacement per category                        │
│       │                                                               │
│       ▼                                                               │
│   Attention Lobe ("attn")                                             │
│   └── Winner-takes-all: selects winning category ID                  │
│       │                                                               │
│       ▼                                                               │
│   MotorFaculty.processBrainAttention()                                │
│   ├── Gets winning category ID from attn lobe                        │
│   ├── Looks up known agent for that category                         │
│   └── Sets creature.setItAgent(winningAgent)                         │
│       │                                                               │
│       ▼                                                               │
│   SensoryFaculty.updateDetailLobe()                                   │
│   ├── Reads creature.getItAgent()                                    │
│   ├── Computes 11 properties of the IT agent                        │
│   └── Writes to brain via setInput('detl', neuron, value)            │
│       │                                                               │
│       ▼                                                               │
│   Detail Lobe ("detl") — 16 neurons (11 written)                      │
│   └── Pass-through SVRule: input → state                             │
│       │                                                               │
│       ▼                                                               │
│   ╳ NO OUTBOUND TRACTS in standard norn genome                       │
│     (neuron states exist but are not propagated)                      │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## The IT Agent: What the Detail Lobe Describes

The detail lobe does not describe the world at large — it describes a **single agent** that the creature is currently paying attention to. This agent is called the "IT" agent and is selected by the attention system.

### How IT Is Selected

The IT agent is set by `MotorFaculty.processBrainAttention()` each brain tick:

1. The **attention lobe** (`attn`) runs winner-takes-all across all category inputs
2. The winning category ID identifies which type of object the creature is focusing on
3. The `SensoryFaculty.getKnownAgent(categoryId)` retrieves the representative agent for that category (previously determined by the vision system)
4. `creature.setItAgent(winningAgent)` makes this the IT agent

```text
// MotorFaculty update — attention handling
winningAttentionId = GetBrain().GetWinningId("attn")
winningAgent = Sensory().GetKnownAgent(winningAttentionId)

// Verify the vision lobe still has signal for this category
if GetBrain().GetNeuronState("visn", winningAttentionId, STATE_VAR) == 0.0
    winningAgent = NULLHANDLE

SetItAgent(winningAgent)
```

If no agent is visible for the winning category (vision neuron state is 0.0), the IT agent is cleared and the creature becomes **introspective** — focused on its own internal state rather than the external world.

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `detl` | 4-character lobe identifier |
| **Full Name** | detail | From Brain.catalogue index 9 |
| **Catalogue Position** | Lobes: 9, Input Lobes: 6, Quads: 8 | One of 9 input lobes |
| **Neuron Names** | "Detail Neurons" | 11 names in catalogue (neurons 0-10) |
| **Dimensions** | 1 wide x 16 high | **16 neurons** (11 engine-written, 5 unused) |
| **Update Time** | 1 | Very early in the update cycle |
| **Switch-On Age** | 0 | Present from birth (embryo) |
| **Winner Takes All** | No | Not a WTA lobe |
| **Tissue ID** | 7 | Has biochemical tissue linkage |
| **Init Rule Always** | 0 | Init rule runs once only |

### Genome vs Engine Neuron Count

The genome defines 16 neurons (1×16), but the engine only writes to neurons 0-10 (11 neurons), and the Brain.catalogue only defines 11 neuron names ("Detail Neurons"). Neurons 11-15 exist in the lobe data structure but are never activated — they represent reserved capacity in the genome design.

---

## SVRule: Pass-Through

The detail lobe uses a minimal **pass-through** update rule — whatever input the neuron receives directly becomes its state. There is no decay, no accumulation history, and no threshold.

### Update Rule (pseudocode)

```
STATE = accumulator;      // Input directly becomes state
stop;
```

### SVRule Bytecodes

```
0: store accumulator in neuron[0]     // Write input to STATE
1: stop immediately                    // Done
```

### Init Rule

Empty (`stop immediately`) — neurons initialize to zero.

### Behavioral Effect

The pass-through SVRule means the detail lobe is a **pure real-time snapshot** — each brain tick, the neuron states directly reflect the current properties of the IT agent with no temporal smoothing or persistence. When the IT agent changes or disappears, the detail neurons immediately drop to zero (since no new input is written and the pass-through rule sets STATE = INPUT = 0).

This contrasts sharply with the noun and verb lobes (leaky integrators with slow decay) and the vision lobe (accumulator with persistence). The detail lobe provides **instantaneous** rather than **temporally smoothed** information.

---

## Neuron Layout: 11 Engine-Written Neurons

The detail lobe's 11 active neurons each encode a specific property of the IT agent. These are defined by the `detailLobeOffsets` enum in the original engine and `DetailLobeInput` constants in JavaScript.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DETAIL LOBE NEURONS                            │
│                                                                 │
│   Index  Name                              Type      Range      │
│   ─────  ──────────────────────────────    ──────    ─────      │
│   0      Carried by me                     Binary    0 / 1      │
│   1      Carried by someone else           Binary    0 / 1      │
│   2      Nearness                          Analog    0.0 - 1.0  │
│   3      Is a creature                     Binary    0 / 1      │
│   4      Is my sibling                     Binary    0 / 1      │
│   5      Is my parent                      Binary    0 / 1      │
│   6      Is my child                       Binary    0 / 1      │
│   7      Is opposite sex (same species)    Binary    0 / 1      │
│   8      Size                              Analog    0.0 - 2.0+ │
│   9      Smell amount                      Analog    0.0 - 1.0  │
│   10     Is falling / moving               Binary    0 / 1      │
│   11-15  (unused / reserved)               —         —          │
│                                                                 │
│   Binary: fires 1.0 when condition is true, 0.0 otherwise      │
│   Analog: continuous value encoding magnitude                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Catalogue label note**: Neuron 10 is labelled "It is stopped" in the Brain.catalogue, but the engine writes `1.0` when `!a.IsStopped()` — i.e., when the IT agent is **moving/falling**, not stopped. The label is inverted relative to the code behavior.

---

## Neuron Details

### Neuron 0: IT Is Being Carried By Me

**Condition**: The IT agent has `MovementStatus.CARRIED` **and** it is the same agent the creature is holding (`creature.getCarried()`).

```text
// SensoryFaculty
if it == creature.GetCarried()
    brain.SetInput("detl", IP_IT_IS_BEING_CARRIED_BY_ME, 1.0)
```

This tells the brain "I am holding this object" — enabling the creature to reason about what it is carrying.

### Neuron 1: IT Is Being Carried By Someone Else

**Condition**: The IT agent has `MovementStatus.CARRIED` but it is **not** the agent the creature is holding.

```text
// SensoryFaculty
else
    brain.SetInput("detl", IP_IT_IS_BEING_CARRIED_BY_SOMEONE_ELSE, 1.0)
```

Neurons 0 and 1 are **mutually exclusive** — at most one fires. If the IT agent is not being carried at all, neither fires.

### Neuron 2: Nearness

**Calculation**: Horizontal (X-axis only) distance between the creature and the IT agent, normalized to [0.0, 1.0]. Only fires when the IT agent is within **128 pixels**.

```text
// SensoryFaculty
f = abs(creature.GetPosition().x - a.GetPosition().x)
if f < 128.0
    brain.SetInput("detl", IP_IT_NEARNESS, (255.0 - f - f) / 255.0)
```

| Distance (px) | Nearness Value | Meaning |
|---|---|---|
| 0 | 1.0 | IT is at the same X position |
| 32 | 0.75 | IT is nearby |
| 64 | 0.50 | IT is at moderate distance |
| 96 | 0.25 | IT is getting far |
| 127 | ~0.004 | IT is at the edge of nearness range |
| 128+ | 0.0 (no input) | Too far — neuron receives no input |

The formula `(255 - 2*distance) / 255` produces a value that drops linearly from 1.0 at distance 0 to approximately 0.0 at distance 127.5.

**Important**: This uses only X-axis distance (absolute value), not 2D Euclidean distance. Vertical separation is ignored for nearness calculation.

### Neuron 3: IT Is a Creature

**Condition**: `1.0` if the IT agent is a creature (Norn, Grendel, Ettin, or other creature type), `0.0` if it is an inanimate object.

```text
// SensoryFaculty
brain.SetInput("detl", IP_IT_IS_CREATURE, 1.0)
```

This neuron gates the family relationship neurons (4-7) — those are only set when this neuron is active.

### Neurons 4-6: Family Relationships

These neurons fire based on **moniker comparison**. Every creature has a unique moniker (identifier string) and knows the monikers of its mother and father. Relationships are determined by checking whether monikers match.

#### Neuron 4: IT Is My Sibling

**Condition**: The IT creature shares at least one parent with this creature.

```text
// SensoryFaculty
brain.SetInput("detl", IP_IT_IS_MYSIBLING,
    (c.GetMotherMoniker() == creature.GetMotherMoniker() ||
     c.GetFatherMoniker() == creature.GetFatherMoniker()) ? 1.0 : 0.0)
```

Checks if the IT creature's mother moniker matches this creature's mother moniker **or** the IT creature's father moniker matches this creature's father moniker. Half-siblings are included.

#### Neuron 5: IT Is My Parent

**Condition**: The IT creature's moniker matches this creature's mother **or** father moniker.

```text
// SensoryFaculty
brain.SetInput("detl", IP_IT_IS_MYPARENT,
    (c.GetMoniker() == creature.GetMotherMoniker() ||
     c.GetMoniker() == creature.GetFatherMoniker()) ? 1.0 : 0.0)
```

#### Neuron 6: IT Is My Child

**Condition**: This creature's moniker matches the IT creature's mother **or** father moniker.

```text
// SensoryFaculty
brain.SetInput("detl", IP_IT_IS_MYCHILD,
    (c.GetMotherMoniker() == creature.GetMoniker() ||
     c.GetFatherMoniker() == creature.GetMoniker()) ? 1.0 : 0.0)
```

Note the reversed comparison direction compared to neuron 5 — here we check if *we* are listed as the IT creature's parent, rather than checking if the IT creature is listed as our parent.

### Neuron 7: IT Is Opposite Sex (Same Species)

**Condition**: The IT creature is the same species (matching family AND genus) but a different sex.

```text
// SensoryFaculty
brain.SetInput("detl", IP_IT_IS_OPPOSITESEX,
    (c.GetFamily() == creature.GetFamily() &&
     c.GetGenus() == creature.GetGenus() &&
     c.Life().GetSex() != creature.Life().GetSex()) ? 1.0 : 0.0)
```

This neuron is critical for reproductive behavior — it only fires for potential mates. A male Norn looking at a female Grendel will **not** trigger this neuron because they have different genus values.

### Neuron 8: Size

**Calculation**: The IT agent's dimensions normalized by dividing by 500.

```text
// SensoryFaculty
size = (a.GetWidth() + a.GetHeight()) / 500.0
brain.SetInput("detl", IP_IT_IS_OF_THIS_SIZE, size)
```

| Agent Dimensions | Size Value |
|---|---|
| 50w x 50h | 0.20 |
| 100w x 100h | 0.40 |
| 150w x 200h | 0.70 |
| 250w x 250h | 1.00 |

This value is **not clamped** — very large agents can produce values above 1.0. The SVRule will handle overflow according to its genetic program.

### Neuron 9: Smell Amount

**Source**: The IT agent's CA (Cellular Automata) emission rate — how much "smell" it emits into the environment.

```text
// SensoryFaculty
brain.SetInput("detl", IP_IT_IS_SMELLING_THIS_MUCH, a.GetCAIncrease())
```

This value comes from the agent's `CA increase` property (set via CAOS command `EMIT`). Food items typically have high CA emission; machinery may have none.

### Neuron 10: Is Falling / Moving

**Condition**: `1.0` if the IT agent is in motion (not stopped / not resting on a surface), `0.0` if it is stationary.

```text
// SensoryFaculty
brain.SetInput("detl", IP_IT_IS_FALLING, !a.IsStopped() ? 1.0 : 0.0)
```

Despite the catalogue label "It is stopped", the code writes `1.0` when the agent is **not** stopped — i.e., when it is falling, being thrown, bouncing, or sliding. The label and code are inverted.

---

## Update Timing and Lobe Processing

### SensoryFaculty Update Order

The SensoryFaculty updates all input lobes in this order each brain tick:

1. `updateSituationLobe()` — creature's own state (9 neurons)
2. **`updateDetailLobe()`** — IT agent properties (11 neurons)
3. `updateDriveLobe()` — biochemical drive levels (20 neurons)
4. `updateSmellLobe()` — CA smell values per category (40 neurons)
5. `updateVisionLobe()` — X displacement per category (40 neurons)

### No IT Agent = No Input

If the creature has no IT agent (`creature.getItAgent()` returns null), `updateDetailLobe()` returns immediately without setting any inputs. Since the SVRule is pass-through (STATE = INPUT), all neurons will be set to 0.0 on the next `Lobe.doUpdate()` call — the detail snapshot is instantly cleared.

### Input Accumulation

Like all brain lobes, detail lobe inputs are **accumulated** — `setNeuronInput()` adds to the current input buffer rather than replacing it. The accumulated input is processed during the next `Lobe.doUpdate()` call, then the input buffer is reset to zero.

```
┌─────────────────────────────────────────────────────────────────┐
│                 DETAIL LOBE UPDATE CYCLE                         │
│                                                                 │
│   1. SensoryFaculty calls brain.setInput('detl', n, value)     │
│      └── Lobe.setNeuronInput(n, value) accumulates input       │
│                                                                 │
│   2. Lobe.doUpdate() processes each neuron:                    │
│      ├── Read accumulated input → SVRule INPUT_VAR              │
│      ├── Reset input buffer to 0.0                             │
│      ├── Execute SVRule: STATE = INPUT (pass-through)          │
│      └── STATE_VAR reflects current IT agent properties        │
│                                                                 │
│   3. No tracts carry output to downstream lobes                │
│      (standard norn genome has zero detl tracts)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Outbound Tracts: None (Standard Norn Genome)

Genome parsing of `norn.astro.48.gen` confirms that the detail lobe has **zero outbound tracts**. No tract gene in the standard norn genome references `detl` as either source or destination.

This means the detail lobe's neuron states are **computed but never consumed** by any downstream neural processing. The engine writes 11 properties of the IT agent per brain tick, the SVRule stores them as neuron states, but no tract carries those states to any other lobe (not the combination lobe, not the decision lobe, not any other lobe).

### Why Does It Exist?

The detail lobe represents **latent neural infrastructure**. Several possible explanations:

1. **Genome extensibility**: The Creatures 3 genome system was designed for evolution. A genome mutation could add tracts from `detl` to `comb` or `decn`, allowing evolved creatures to use detail information in their decision-making. The lobe exists as a ready-to-wire substrate.

2. **Cross-species variation**: While the standard norn genome (`norn.astro.48.gen`) has no detl tracts, other species (Grendel, Ettin, or custom breeds) could have different tract configurations that do utilize detl information.

3. **Design intent vs. shipping genome**: The engine infrastructure (the enum, the catalogue entries, the update function) suggests the designers intended detl to feed into decision-making. The shipping genome may have dropped the tracts during balancing or debugging.

4. **Debug / modding utility**: Even without neural tracts, the detail lobe's neuron states can be read externally by CAOS scripts or debug tools, providing a standardized API for querying IT agent properties through the brain interface.

### Comparison with situ (Situation Lobe)

The situation lobe (`situ`) has an identical architecture: 1×16 neurons, update time 1, pass-through SVRule, tissue ID 6, and **zero tracts** in the standard norn genome. Both perception snapshot lobes (detl = external, situ = internal) share the same "latent capacity" pattern.

---

## Inbound Tracts: None

The detail lobe has **zero inbound tract connections** from other brain lobes. This is characteristic of **pure input lobes** — they receive all their activation directly from engine `setInput()` calls, not from other neural lobe outputs.

---

## Instinct / Knowledge Interactions: None

The detail lobe is **not referenced** during instinct processing or knowledge building:

- **Instinct.process()**: Writes to lobes specified by genome tissue IDs. Standard instinct genes target `noun` (remapped from `attn`), `verb` (remapped from `decn`), and `driv`. No instinct genes in the standard genome target tissue ID 7 (`detl`).
- **Brain.processInstinctsAndKnowledge()**: Knowledge building stimulates only `noun` (all at 0.5), `visn` (all at 0.1), and `driv` (one at 1.0). `detl` is not involved.

However, a genome could theoretically encode instinct genes targeting tissue ID 7, which would cause instinct processing to write to detl during REM sleep. This would be an unusual genome configuration.

---

## Engine Read Sites: None

No code in either the original engine or the JS rebuild explicitly reads detail lobe neuron states via `GetNeuronState("detl", ...)` / `getNeuronState('detl', ...)`. The detail lobe is **write-only** from the engine's perspective. In the standard norn genome, the neuron states are also not consumed by tracts, making the detl lobe entirely self-contained.

---

## Comparison: Detail Lobe vs Situation Lobe

The detail lobe works in tandem with the **situation lobe** (`situ`), sharing an identical lobe architecture:

| Aspect | Detail Lobe (`detl`) | Situation Lobe (`situ`) |
|---|---|---|
| **Describes** | The IT agent (external focus) | The creature itself (internal state) |
| **Genome Neurons** | 16 (11 used) | 16 (9 used) |
| **Update Time** | 1 | 1 |
| **Tissue ID** | 7 | 6 |
| **SVRule** | Pass-through (input → state) | Pass-through (input → state) |
| **Outbound Tracts** | None (standard norn) | None (standard norn) |
| **Inbound Tracts** | None | None |
| **Example inputs** | Nearness, carried, family ties | Age, carrying something, falling |
| **Depends on** | IT agent being valid | Always active |
| **Purpose** | "What is this thing I'm looking at?" | "What is my current situation?" |

Together, these two lobes provide the brain with a real-time sensory snapshot: what the creature knows about the object of its attention (detail) and what it knows about its own state (situation). Both are latent capacity lobes in the standard norn genome.

---

## Original Engine vs JavaScript Implementation

### Aligned

- Both write to detl from the same single source (`SensoryFaculty.updateDetailLobe()`)
- All 11 neuron computations are functionally identical
- Both use the same guard pattern (check IT agent validity before computing)
- Both clear all inputs when no IT agent is available
- Nearness formula: original `(255.0 - f - f) / 255.0` vs JS `(255 - distance * 2) / 255` — functionally identical
- Family relationship checks use identical moniker comparison logic
- Opposite sex check uses identical family + genus + sex comparison

### No Known Divergence

The JS implementation is a faithful port of the original logic with no behavioral differences.

---

## Key Constants

```javascript
// PerceptionConstants.js
export const DetailLobeInput = {
    IT_IS_BEING_CARRIED_BY_ME: 0,
    IT_IS_BEING_CARRIED_BY_SOMEONE_ELSE: 1,
    IT_NEARNESS: 2,
    IT_IS_CREATURE: 3,
    IT_IS_MYSIBLING: 4,
    IT_IS_MYPARENT: 5,
    IT_IS_MYCHILD: 6,
    IT_IS_OPPOSITESEX: 7,
    IT_IS_OF_THIS_SIZE: 8,
    IT_IS_SMELLING_THIS_MUCH: 9,
    IT_IS_FALLING: 10
};
```

**Nearness threshold**: 128 pixels (X-axis only)
**Size normalization divisor**: 500.0 (width + height)
**Genome dimensions**: 1 × 16 (16 neurons, 11 used)
**Update time**: 1

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Catalogue/Brain.catalogue` | Defines detl at index 9 (Lobes), 6 (Input Lobes), 8 (Quads); neuron names = "Detail Neurons" (11 names) |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | `updateDetailLobe()` — sole writer of all 11 neurons |
| `Main_Game/src/engine/creature/faculties/MotorFaculty.js` | `processBrainAttention()` — IT agent selection that drives detail input |
| `Main_Game/src/engine/creature/perception/PerceptionConstants.js` | `DetailLobeInput` enum — neuron index constants |
| `Main_Game/src/engine/creature/brain/Brain.js` | `setInput()` routing to lobe neurons, `getLobeFromTokenString('detl')` |
| `Main_Game/src/engine/creature/brain/Lobe.js` | SVRule processing, `setNeuronInput()` accumulation |
| `Main_Game/src/engine/creature/Creature.js` | `getItAgent()`, `setItAgent()` — IT agent storage |

---

## Related Articles

- **[attn] Attention Lobe Architecture** — Upstream output lobe whose winning neuron determines the IT agent that the detail lobe describes
- **[situ] Situation Lobe Architecture** — Partner perception lobe encoding the creature's own state (same latent-capacity architecture)
- **[visn] Vision Lobe Architecture** — Vision perception that feeds the attention system selecting IT
- **[comb] Combination Lobe Architecture** — Central decision matrix; a genome-added detl→comb tract would allow detail information to influence decisions
- **Brain & Neural Networks** — Overview of the complete brain architecture
- **Creature Perception** — Overview of all sensory modalities including the detail lobe
