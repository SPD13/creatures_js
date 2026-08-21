# [stim] Stimulus Source Lobe Architecture

This article provides a deep-dive into the stimulus source lobe (`stim`) — a sensory integration layer that aggregates signals from vision, motion detection, smell, and language into a unified **per-category saliency map**. The stim lobe has 40 neurons (one per agent category) and occupies a unique position in the brain architecture: it is **catalogued** in `Brain.catalogue` (index 11, token `"stim"`, name `"stim source"`) but is classified as **neither an input lobe nor an output lobe** — the only lobe with this distinction. Despite being catalogued, the engine never directly writes to or reads from the stim lobe; all input arrives through 4 genome-defined inbound tracts and all output flows through 1 outbound tract to the combination lobe.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│            STIMULUS SOURCE LOBE DATA FLOW (END-TO-END)               │
│                                                                     │
│   Engine (SensoryFaculty) writes to upstream lobes:                 │
│   ├── setInput('visn', ...) → vision displacement                  │
│   ├── setInput('smel', ...) → smell intensity                      │
│   └── setInput('noun', ...) → spoken/thought object category       │
│                                                                     │
│   Genome-defined tracts feed into stim:                             │
│                                                                     │
│   ┌────────┐  visn→stim (time 12)                                  │
│   │  visn  │──── proximity inversion: (1-|displ|) × 0.5 ──┐       │
│   └────────┘                                                │       │
│   ┌────────┐  move→stim (time 13)                           │       │
│   │  move  │──── gated: only when motion detected ──────────┤       │
│   └────────┘                                                │       │
│   ┌────────┐  smel→stim (time 14, switch-on age 1)         │       │
│   │  smel  │──── gated: only when smell > 0 ───────────────┤       │
│   └────────┘                                                │       │
│   ┌────────┐  noun→stim (time 15)                           │       │
│   │  noun  │──── gated: only when stim already active ──────┤       │
│   └────────┘                                                │       │
│                                                     ┌───────▼──┐    │
│                                                     │   stim   │    │
│                                                     │ 40 neurons│    │
│                                                     │ (time 16) │    │
│                                                     └─────┬────┘    │
│                                                           │         │
│                                              stim→comb (time 18)    │
│                                              × 0.331 modulation     │
│                                                           │         │
│                                                     ┌─────▼────┐    │
│                                                     │   comb   │    │
│                                                     │ 440 neur │    │
│                                                     └──────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Unique Catalogue Position

The stim lobe occupies a singular position among the 12 catalogued lobes. It appears in all general catalogue arrays but is **excluded from both the input and output lobe lists**:

```
"Brain Lobes"           → index 11: "stim source"     ✓ Listed
"Brain Lobe Quads"      → index 11: "stim"            ✓ Listed
"Brain Lobe Neuron Names" → index 11: "Agent Categories" ✓ Listed
"Brain Input Lobes"     → (9 entries)                  ✗ NOT listed
"Brain Output Lobes"    → (2 entries: attn, decn)      ✗ NOT listed
```

### What This Means

- **Catalogued**: The stim lobe gets a human-readable name ("stim source"), a 4-character token (`"stim"`), and neuron names ("Agent Categories") — enabling debugging tools like the Brain Viewer and Genetics Kit to display it properly
- **Not an input lobe**: The engine never calls `SetInput("stim", ...)` — the lobe receives all input through genome-defined tracts from other lobes
- **Not an output lobe**: The engine never calls `GetWinningId("stim")` — the lobe is not winner-takes-all and has no direct behavioral output

The stim lobe is the **only one of the 12 catalogued lobes** that is neither input nor output. The remaining 9 catalogued lobes are input lobes (`verb`, `noun`, `visn`, `smel`, `driv`, `sitn`, `detl`, `resp`, `prox`) and 2 are output lobes (`attn`, `decn`).

---

## Relationship with the Stimulus System (STIM/SWAY/URGE/ORDR)

Despite sharing the word "stimulus", the **stim brain lobe** and the **CAOS stimulus system** are completely separate mechanisms. Understanding their distinction — and their indirect connection — is essential.

### What the Stimulus System Does (Not the Stim Lobe)

The CAOS stimulus commands (`STIM WRIT`, `STIM SIGN`, `STIM SHOU`, `STIM TACT`, `SWAY`, `URGE`, `ORDR`) trigger `SensoryFaculty.stimulate()` → `processStimulus()`, which executes three macros:

| Macro | Brain Lobes Written | Purpose |
|-------|---------------------|---------|
| ORDR | (none directly) | Sentence → LinguisticFaculty for word learning |
| URGE | `noun`, `verb` | Nudge attention toward a category, nudge decision toward an action |
| SWAY | `resp` (alert) or `prox` (asleep) | Chemical injection + reinforcement learning |

**None of these macros write to the `stim` brain lobe.** The stim lobe receives all its input exclusively through genome-defined tracts from other lobes.

### Indirect Connection Through the Noun Lobe

Although the stimulus system never writes to the stim lobe directly, the two systems interact through a shared upstream lobe — the **noun lobe**:

```
CAOS Stimulus System                         Stim Brain Lobe
─────────────────────                        ───────────────────
STIM/URGE command                            visn→stim (t=12)
    │                                        move→stim (t=13)
    ▼                                        smel→stim (t=14)
brain.setInput('noun', categoryId, amount)        │
    │                                             │
    ▼                                             ▼
┌──────────┐                               noun→stim (t=15)
│ noun lobe│──────────────────────────────► BUT only if stim
└──────────┘                                already has activity
                                            from vision, motion,
                                            or smell tracts
```

When a `STIM WRIT` or `URGE WRIT` nudges the noun lobe for a category, that noun activity can flow into the stim lobe via the **noun→stim tract** (update time 15). However, this tract is **gated on pre-existing stim activity** — it only fires when the stim neuron already has signal from the visn, move, or smel tracts. This means:

- A stimulus that nudges `noun` for "food" **will** amplify the food category's saliency in the stim lobe — but only if the creature can already see, smell, or detect motion for food
- A stimulus that nudges `noun` for "food" when no food is perceptible **has no effect** on the stim lobe — the noun→stim gate remains closed

### The Drive Pathway (Parallel, Not Through Stim)

The stimulus system's chemical injections (SWAY macro) affect drives, which feed the combination lobe through a **separate pathway** that bypasses the stim lobe entirely:

```
SWAY macro → Biochemistry.adjustChemical() → drive levels change
    → SensoryFaculty.updateDriveLobe() → brain.setInput('driv', ...)
    → driv→comb tract (t=17) → comb lobe

stim→comb tract (t=18) → comb lobe (multiplicative modulation)
```

The comb lobe receives **both** drive input (additive, from driv→comb) and stim modulation (multiplicative, from stim→comb). The stim lobe acts as a **perceptual grounding filter** — even if drives are strong (e.g., high hunger from a stimulus chemical injection), the combination lobe suppresses category-action pairs for objects the creature cannot currently perceive.

### Summary: Two Systems, One Brain

| Aspect | Stimulus System | Stim Brain Lobe |
|--------|----------------|-----------------|
| **Triggered by** | World events (CAOS commands, actions, speech) | Genome-defined tracts from other lobes |
| **Writes to** | `noun`, `verb`, `resp`, `prox` lobes + biochemistry | Nothing — only receives |
| **Read by** | Nothing (fire-and-forget into lobes/chemistry) | `comb` lobe via stim→comb tract |
| **Purpose** | Deliver external events to creature's brain/body | Integrate perception into a saliency filter |
| **Connection** | Writes to `noun` → noun feeds noun→stim (conditionally) | Modulates `comb` → affects what creature attends to |

See the **[Stimulus System](stimulus-system.md)** article for full documentation of the CAOS stimulus pipeline.

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `stim` | 4-character lobe identifier |
| **Full Name** | stim source | From Brain.catalogue |
| **Dimensions** | 40 wide x 1 high | **40 neurons**, one per agent category |
| **Update Time** | 16 | After all 4 inbound tracts (12-15), before outbound tract (18) |
| **Switch-On Age** | 0 | Present from birth |
| **Winner Takes All** | No | All neurons active simultaneously |
| **Tissue ID** | 3 | Has biochemical tissue linkage (unlike genome-only lobes) |
| **Init Rule Always** | 0 | Init rule runs once at creation only |

### Category Mapping

Each of the 40 neurons maps to one agent category — the same mapping used by `visn`, `noun`, `smel`, `attn`, and `move`:

| Neurons | Categories |
|---|---|
| 0 | Self |
| 1 | Hand (pointer) |
| 2-9 | Door, Seed, Plant, Weed, Leaf, Flower, Fruit, Manky |
| 10-19 | Detritus, Food, Button, Bug, Pest, Critter, Beast, Nest, Animal Egg, Weather |
| 20-29 | Bad, Toy, Incubator, Dispenser, Tool, Potion, Elevator, Teleporter, Machinery, Creature Egg |
| 30-39 | Norn Home, Grendel Home, Ettin Home, Gadget, Something, ... |

---

## SVRule: Simple Relay with Negative Clamping

The stim lobe's update rule is intentionally minimal — it acts as a **relay** that passes accumulated input to output with negative value clamping:

### Update Rule (pseudocode)

```
acc = INPUT;                    // Read accumulated input from tracts
if (acc < 0) acc = 0;          // Clamp: no negative saliency
STATE = acc;                    // Store as output state
INPUT = 0;                      // Clear input for next cycle
```

### SVRule Bytecodes

```
0: load neuron[1] into accumulator       // Read INPUT_VAR
1: if less than zero                      // Check for negative
2: blank accumulator                      // Clamp to 0
3: store accumulator in neuron[0]         // Write to STATE_VAR
4: blank operand neuron[1]                // Clear INPUT_VAR
5: stop immediately
```

### Init Rule

Empty (`stop immediately`) — neurons initialize to zero with no special setup.

### Design Philosophy

The simplicity is deliberate. The stim lobe's role is **aggregation, not processing**. All the interesting computation happens in the inbound tracts (proximity inversion, motion gating, smell gating, linguistic gating). The lobe itself just accumulates those results, clamps negatives, and presents the combined signal for the outbound tract to read.

---

## Inbound Tracts: 4 Sensory Input Channels

The stim lobe integrates signals from 4 different perceptual sources, each arriving through a separate tract with its own processing logic. The tracts fire in sequence (update times 12-15) before the lobe's own update at time 16.

### Tract 1: visn → stim (Proximity Inversion)

Converts vision displacement into an **inverse proximity signal** — closer objects produce weaker stimulus, farther objects produce stronger stimulus.

| Property | Value |
|---|---|
| **Source Lobe** | `visn` (40 neurons) |
| **Destination Lobe** | `stim` (40 neurons) |
| **Connections** | 1:1, one per category |
| **Update Time** | 12 (earliest input) |
| **Switch-On Age** | 0 (from birth) |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
acc = |visn.STATE|;              // Absolute value of X-displacement
if (acc != 0) {                  // If object is visible
    acc = 1.0 - acc;             // Invert: close=large displacement → small result
}                                // If not visible (0), stays 0
acc = acc × 0.5;                 // Halve the signal
stim.INPUT = acc;                // Store as stim input
```

**What this computes**: The vision lobe stores signed X-displacement normalized to [-1.0, +1.0]. Taking the absolute value gives distance-from-center (0 = directly ahead or not visible, 1.0 = at visual range edge). Inverting produces a proximity signal where close objects (large |displacement|) get a **smaller** stimulus value and objects near visual range edge get a **larger** value. The halving attenuates the signal to prevent it from dominating other inputs.

**Behavioral effect**: This creates a "novelty bias" — objects at the edges of the creature's visual field contribute more stimulus than objects right in front. This encourages creatures to be aware of peripheral objects rather than fixating only on the closest ones.

### Tract 2: move → stim (Motion Gating)

Passes motion detection signals through a **gate** that only opens when movement is detected.

| Property | Value |
|---|---|
| **Source Lobe** | `move` (40 neurons) |
| **Destination Lobe** | `stim` (40 neurons) |
| **Connections** | 1:1, one per category |
| **Update Time** | 13 |
| **Switch-On Age** | 0 (from birth) |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
if (move.INPUT == 0) {
    stop;                        // Gate closed: no motion → no signal
}
// Gate open: motion detected → pass through move state
```

**What this computes**: When no motion is detected in a category (move.INPUT == 0), the tract does nothing. When motion is detected, the move lobe's accumulated state flows into the stim lobe. This is the primary pathway documented in the [move] lobe article — moving objects generate stimulus, static objects do not.

**Behavioral effect**: Moving objects become salient to the creature. A bug crawling across the room generates stim signal; a stationary plant does not. This draws the creature's attention (via stim→comb→attn) toward active, dynamic agents.

### Tract 3: smel → stim (Smell Gating)

Passes olfactory perception signals, gated on non-zero smell, with a **delayed switch-on age**.

| Property | Value |
|---|---|
| **Source Lobe** | `smel` (40 neurons) |
| **Destination Lobe** | `stim` (40 neurons) |
| **Connections** | 1:1, one per category |
| **Update Time** | 14 |
| **Switch-On Age** | **1 (childhood)** — not active at birth |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
acc = smel.STATE;                // Read smell neuron output
if (acc == 0) {
    stop;                        // No smell detected → no signal
}
// Smell detected: process with scaling
acc = acc × 0.665;              // Primary attenuation
acc = acc × 0.331;              // Further scaling (combined: × 0.220)
acc = acc × 0.5;                // Final halving (combined: × 0.110)
stim.INPUT += acc;              // Add to stim input
```

**What this computes**: When the creature can smell an object category, a heavily attenuated signal (~11% of original smell intensity) is added to the stim lobe. The triple scaling prevents smell from overwhelming the other sensory channels.

**Behavioral effect**: Smelly objects (food, other creatures) generate a persistent background stimulus even when not visible. The delayed switch-on at age 1 (childhood) means newborn creatures rely purely on vision and motion — smell-based saliency develops later, modeling sensory maturation.

### Tract 4: noun → stim (Linguistic Gating)

Passes spoken/thought object category signals, gated on **pre-existing stim activity**.

| Property | Value |
|---|---|
| **Source Lobe** | `noun` (40 neurons) |
| **Destination Lobe** | `stim` (40 neurons) |
| **Connections** | 1:1, one per category |
| **Update Time** | 15 (last input) |
| **Switch-On Age** | 0 (from birth) |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
if (stim.INPUT == 0) {
    stop;                        // Gate closed: only fires if stim already active
}
// Stim already has signal from other tracts — boost with noun data
acc = noun.STATE × 0.843;       // Scale noun signal
stim.INPUT += acc;              // Add to stim input
```

**What this computes**: The noun tract only fires when the stim neuron **already has activity** from the visn, move, or smel tracts. If a category has no visual, motion, or olfactory signal, linguistic input alone cannot activate its stim neuron. When the category is already salient, hearing its name reinforces the stimulus.

**Behavioral effect**: Saying "food" to a creature that can already see or smell food **amplifies** the food category's stimulus, making it more likely to attract attention. But saying "food" when no food is perceptible has no effect — language enhances existing saliency rather than creating it from nothing. This prevents creatures from becoming fixated on abstract concepts with no environmental grounding.

---

## Outbound Tract: stim → comb (Multiplicative Modulation)

The single outbound tract feeds the stim lobe's integrated saliency signal into the combination lobe's decision matrix.

| Property | Value |
|---|---|
| **Source Lobe** | `stim` (40 neurons) |
| **Destination Lobe** | `comb` (440 neurons) |
| **Connections** | 1:1 mapping |
| **Update Time** | 18 |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
acc = stim.STATE × 0.331;       // Scale stim signal to ~1/3
acc = acc × comb.INPUT;          // Multiply by existing comb input
comb.INPUT = acc;                // Store modulated result
```

**What this computes**: This is a **multiplicative modulation** — it doesn't add to comb input, it **scales** it. Categories with high stim signal get their existing comb activity amplified (up to ~33% of original); categories with zero stim signal get their comb activity multiplied by zero, effectively suppressing them.

**Behavioral effect**: The stim lobe acts as a **saliency filter** for the decision matrix. Only categories that are perceptually salient (visible, moving, smelled, or linguistically referenced) survive into the combination lobe's decision process. This prevents the creature from considering actions on objects that aren't actually perceivable in the current environment.

---

## Multi-Sensory Integration

The stim lobe's 4 inbound tracts create a layered integration where each sense contributes differently:

```
┌──────────────────────────────────────────────────────────────┐
│                MULTI-SENSORY INTEGRATION                      │
│                                                              │
│   Layer 1 (time 12): VISION                                 │
│   ├── visn→stim: proximity-inverted, attenuated             │
│   └── Provides baseline spatial awareness                   │
│                                                              │
│   Layer 2 (time 13): MOTION                                  │
│   ├── move→stim: gated on detected motion                   │
│   └── Adds saliency for moving objects                      │
│                                                              │
│   Layer 3 (time 14): SMELL                                   │
│   ├── smel→stim: gated on non-zero smell, switch-on age 1  │
│   └── Adds background awareness for smelly objects          │
│                                                              │
│   Layer 4 (time 15): LANGUAGE                                │
│   ├── noun→stim: gated on pre-existing stim activity        │
│   └── Amplifies already-salient categories when named       │
│                                                              │
│   stim lobe (time 16): ACCUMULATION                          │
│   ├── Sums all contributions                                │
│   ├── Clamps negatives to zero                              │
│   └── Presents unified saliency map                         │
│                                                              │
│   stim→comb (time 18): FILTERING                             │
│   ├── Multiplicative modulation of decision matrix          │
│   └── Suppresses non-salient categories in comb             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Sensory Contribution Strengths

| Sense | Scaling | Gating | Available |
|---|---|---|---|
| Vision | × 0.5 (inverted proximity) | Always fires when object visible | From birth |
| Motion | Pass-through | Only when motion detected | From birth |
| Smell | × 0.110 (triple attenuation) | Only when smell > 0 | From childhood (age 1) |
| Language | × 0.843 | Only when stim already active | From birth |

Vision provides the broadest baseline signal, motion adds dynamic object tracking, smell adds ambient awareness (at reduced strength), and language reinforces objects already noticed through other senses.

### Per-Neuron Computation Detail

For each of the 40 category neurons, the stim output is computed by accumulating the 4 tract contributions in sequence, then clamping. The tracts execute in strict order (update times 12→15), each writing to `stim.INPUT`, before the lobe relays `INPUT → STATE` at time 16.

#### Step-by-step formula

```
Given raw lobe values for category i:
    visn = brain.getNeuronState('visn', i, 0)    // signed X-displacement [-1, +1]
    move = brain.getNeuronState('move', i, 0)    // motion detection signal
    smel = brain.getNeuronState('smel', i, 0)    // smell intensity [0, 1]
    noun = brain.getNeuronState('noun', i, 0)    // linguistic attention signal

Step 1 — visn→stim (time 12): Proximity inversion
    if visn ≠ 0:
        visnContrib = (1.0 - |visn|) × 0.5
    else:
        visnContrib = 0
    stim.INPUT = visnContrib

Step 2 — move→stim (time 13): Gated pass-through
    if move.INPUT ≠ 0:              // gate: was motion detected this tick?
        moveContrib = move.STATE    // pass through accumulated motion
    else:
        moveContrib = 0             // no motion → no signal
    stim.INPUT += moveContrib

Step 3 — smel→stim (time 14): Triple attenuation (only from age 1)
    if smel ≠ 0:
        smelContrib = smel × 0.665 × 0.331 × 0.5    // ≈ smel × 0.110
    else:
        smelContrib = 0
    stim.INPUT += smelContrib

Step 4 — noun→stim (time 15): Linguistically gated
    if stim.INPUT > 0:              // gate: only if prior tracts produced activity
        nounContrib = noun × 0.843
    else:
        nounContrib = 0             // no perceptual grounding → language ignored
    stim.INPUT += nounContrib

Step 5 — stim lobe update (time 16): Relay with negative clamping
    stim.STATE = max(0, stim.INPUT)
    stim.INPUT = 0                  // clear for next tick
```

#### Summary formula (simplified)

```
visnContrib = visn ≠ 0 ? (1 - |visn|) × 0.5 : 0
moveContrib = move (when active)
smelContrib = smel ≠ 0 ? smel × 0.110 : 0
nounContrib = (visnContrib + moveContrib + smelContrib) > 0 ? noun × 0.843 : 0

stim.STATE = max(0, visnContrib + moveContrib + smelContrib + nounContrib)
```

#### Worked example: Creature sees food nearby, smells it, hears "food"

```
Raw lobe values for category 11 (Food):
    visn = 0.300    (food is 30% of visual range away, to the right)
    move = 0.000    (food is stationary)
    smel = 0.800    (strong food smell in room)
    noun = 0.500    (someone just said "food")

Step 1 — visn→stim:
    visnContrib = (1.0 - |0.300|) × 0.5 = 0.700 × 0.5 = 0.350
    stim.INPUT = 0.350

Step 2 — move→stim:
    moveContrib = 0 (no motion detected)
    stim.INPUT = 0.350

Step 3 — smel→stim:
    smelContrib = 0.800 × 0.665 × 0.331 × 0.5 = 0.088
    stim.INPUT = 0.350 + 0.088 = 0.438

Step 4 — noun→stim:
    stim.INPUT = 0.438 > 0 → gate OPEN
    nounContrib = 0.500 × 0.843 = 0.422
    stim.INPUT = 0.438 + 0.422 = 0.860

Step 5 — stim lobe:
    stim.STATE = max(0, 0.860) = 0.860
```

The food category gets a strong saliency signal (0.860) from the combination of vision (dominant), smell (minor), and language (significant amplification because the category was already perceptually active).

#### Counterexample: Creature hears "toy" but can't see or smell any toy

```
Raw lobe values for category 21 (Toy):
    visn = 0.000    (no toy visible)
    move = 0.000    (no toy moving)
    smel = 0.000    (no toy smell)
    noun = 0.700    (someone just said "toy")

Step 1: visnContrib = 0 (visn is 0)
Step 2: moveContrib = 0
Step 3: smelContrib = 0
Step 4: stim.INPUT = 0 → gate CLOSED → nounContrib = 0
Step 5: stim.STATE = 0
```

Despite a strong linguistic signal, the toy category gets zero saliency — language alone cannot create perceptual awareness without environmental grounding.

---

## Update Time Ordering

The complete processing sequence involving the stim lobe each brain tick:

| Update Time | Component | Action |
|---|---|---|
| 9 | visn→move tract | Computes motion from vision displacement change |
| 11 | move lobe | Leaky integrator accumulates motion signal |
| **12** | **visn→stim tract** | **Proximity-inverted vision → stim input** |
| **13** | **move→stim tract** | **Gated motion → stim input** |
| **14** | **smel→stim tract** | **Gated smell → stim input** |
| **15** | **noun→stim tract** | **Gated language → stim input** |
| **16** | **stim lobe update** | **Clamp negatives, relay INPUT→STATE** |
| 17 | driv→comb, verb→comb tracts | Drive and verb signals enter comb |
| **18** | **stim→comb tract** | **Multiplicative modulation of comb matrix** |
| 19 | forf→comb tracts | Social relationship weights enter comb |
| 20 | comb lobe update | Core combination processing |
| 21 | comb→attn, comb→decn tracts | Output to attention and decision |

---

## Role in the Brain Architecture

The stim lobe sits between the first-level perceptual lobes and the central decision matrix:

```
     Engine-Written                    Genome-Driven
     Input Lobes                       Integration
   ┌──────────────┐
   │     visn     │─── visn→stim ──┐
   └──────────────┘                │
                                   │    ┌──────────┐      ┌──────────┐
   ┌──────────────┐                ├──► │   stim   │─────►│   comb   │
   │  move (from  │─── move→stim ──┤    │ saliency │      │ decision │
   │  visn tract) │                │    │   map    │      │  matrix  │
   └──────────────┘                │    └──────────┘      └──────────┘
                                   │
   ┌──────────────┐                │
   │     smel     │─── smel→stim ──┤
   └──────────────┘  (from age 1)  │
                                   │
   ┌──────────────┐                │
   │     noun     │─── noun→stim ──┘
   └──────────────┘  (conditional)
```

### What the Stim Lobe Enables

By integrating multiple sensory channels into a single saliency map, the stim lobe allows the creature's brain to:

- **Focus on perceivable objects**: The multiplicative stim→comb modulation suppresses categories that the creature cannot currently see, smell, or hear about, preventing decisions about imperceptible objects
- **Prioritize dynamic agents**: Motion detection through the move lobe gives moving objects extra saliency, making creatures reactive to environmental changes
- **Develop sensory complexity with age**: The smell→stim tract's switch-on at childhood creates a developmental progression — newborns are vision-dominated, older creatures integrate smell
- **Use language as a saliency amplifier**: Hearing an object's name boosts its saliency only if the creature can already perceive it, grounding language in sensory experience

---

## Original Engine vs JavaScript Implementation

### Original Engine Behavior

- Stim lobe created from genome lobe gene data by the `Lobe` class
- Resolved via `Brain.getLobeFromTokenString("stim")` (finds it in the catalogue at index 11)
- No `SetInput("stim", ...)`, `GetWinningId("stim")`, or `SetNeuronState("stim", ...)` calls anywhere in the engine
- All input/output through genome-defined tract processing

### JS Behavior

- Created by `Lobe.js` from parsed genome data
- Found by `Brain.js:getLobeFromTokenString("stim")` which searches both catalogue and genome lobes
- Zero direct engine references — no `brain.setInput('stim', ...)` anywhere in JS code
- All tract processing handled by general-purpose `Tract.js:doUpdate()`

Since there is no engine code that directly references the stim lobe, the original engine and the JS implementation are inherently aligned — the lobe's behavior is entirely determined by the genome data and the general-purpose lobe/tract processing code.

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Catalogue/Brain.catalogue` | Lists stim at index 11 — catalogued but not input or output |
| `Assets/Genetics/norn.astro.48.gen` | Genome defining the stim lobe gene and its 5 tract genes |
| `Main_Game/src/engine/creature/brain/Lobe.js` | General lobe processing (doUpdate, SVRule execution) |
| `Main_Game/src/engine/creature/brain/Tract.js` | General tract processing for all 5 stim-related tracts |
| `Main_Game/src/engine/creature/brain/Brain.js` | `getLobeFromTokenString("stim")` resolves from catalogue |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | Writes to visn, smel, noun (upstream) — never to stim |

---

## Related Articles

- **[visn] Vision Lobe Architecture** — Upstream: provides proximity-inverted vision signal via visn→stim tract
- **[move] Move Lobe Architecture** — Upstream: provides gated motion signal via move→stim tract
- **[comb] Combination Lobe Architecture** — Downstream: receives multiplicative modulation via stim→comb tract
- **[driv] Drive Lobe Architecture** — Parallel input to comb alongside stim
- **[attn] Attention Lobe Architecture** — Final output: stim influences attention through comb→attn
- **Brain & Neural Networks** — Overview of the complete brain architecture
