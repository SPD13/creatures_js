# [move] Move Lobe Architecture

This article provides a deep-dive into the move lobe (`move`) — a genome-defined intermediate processing lobe that detects **motion in the creature's visual field**. Unlike the engine-catalogued input lobes, the move lobe has no direct engine code interaction: it receives all its inputs through genome-defined tracts from the vision lobe (`visn`) and sends its outputs through a gated tract to the stimulus source lobe (`stim`). The move lobe gives creatures a persistent sense of which categories of objects are currently moving.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              MOVE LOBE DATA FLOW (END-TO-END)                    │
│                                                                 │
│   SensoryFaculty.updateVisionLobe()                             │
│   └── Writes X-displacement per category                       │
│       │                                                         │
│       ▼                                                         │
│   Vision Lobe ("visn") — 40 neurons                             │
│   └── STATE_VAR: signed X displacement (-1.0 to +1.0)         │
│       │                                                         │
│       │  Tract: visn→move (update time: 9)                     │
│       │  ├── Takes |displacement| (absolute value)             │
│       │  ├── Computes change from previous tick                │
│       │  └── Accumulates into move INPUT                       │
│       ▼                                                         │
│   Move Lobe ("move") — 40 neurons (update time: 11)            │
│   ├── Leaky integrator: INPUT × 0.935 + STATE                 │
│   ├── Tend toward zero at rate 0.048                           │
│   └── STATE_VAR: accumulated motion signal per category        │
│       │                                                         │
│       │  Tract: move→stim (update time: 13)                   │
│       │  ├── Gated: only fires when INPUT ≠ 0                 │
│       │  └── Passes STATE to stim lobe                         │
│       ▼                                                         │
│   Stimulus Source Lobe ("stim") — 40 neurons                    │
│   └── Feeds into combination lobe → attention/decision          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Genome-Only Lobe: No Engine Code References

The move lobe is **not listed in the Brain Lobe Quads catalogue** (`Assets/Catalogue/Brain.catalogue`), which defines the 12 standard lobes. It exists only as a **lobe gene in the genome binary** (e.g., `norn.astro.48.gen`, `ettn.final46e.gen.brain.gen`). This means:

- **No `SetInput("move", ...)`** calls in the original engine or `brain.setInput('move', ...)` in JS
- **No `GetWinningId("move")`** calls — the lobe is not winner-takes-all
- **No catalogue neuron names** — neurons are anonymous (unlike visn which gets "Agent Categories")
- **All connectivity is defined by tract genes** in the genome

This places `move` in the same category as other genome-only lobes like `forf` (friend-or-foe), `comb` (combination), `mood`, and `gend` (gender).

The Genetics Kit Manual explicitly references a "visn to move" tract as an SVRule example, confirming this lobe is part of the standard norn brain design.

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `move` | 4-character lobe identifier |
| **Dimensions** | 40 wide x 1 high | **40 neurons**, one per agent category |
| **Update Time** | 11 | Processes after visn→move tract (9), before move→stim tract (13) |
| **Switch-On Age** | 0 | Present from birth |
| **Winner Takes All** | No | Not a WTA lobe — all neurons active simultaneously |
| **Tissue ID** | 255 | No biochemical tissue linkage |
| **Init Rule Always** | 0 | Init rule runs once at creation only |

### Category Mapping

Each of the 40 neurons maps to one agent category — the same 40 categories used by the vision lobe, attention lobe, and the rest of the perception pipeline:

| Neurons | Categories |
|---|---|
| 0 | Self |
| 1 | Hand (pointer) |
| 2-9 | Door, Seed, Plant, Weed, Leaf, Flower, Fruit, Manky |
| 10-19 | Detritus, Food, Button, Bug, Pest, Critter, Beast, Nest, Animal Egg, Weather |
| 20-29 | Bad, Toy, Incubator, Dispenser, Tool, Potion, Elevator, Teleporter, Machinery, Creature Egg |
| 30-39 | Norn Home, Grendel Home, Ettin Home, Gadget, Something, ... |

---

## SVRule: Leaky Integrator

The move lobe uses a **leaky integrator** update rule — it accumulates incoming motion signals while slowly decaying toward zero. This provides **temporal persistence**: recently-moving objects still register in the creature's brain for several ticks after movement stops.

### Update Rule (pseudocode)

```
// Each brain tick:
acc = INPUT × 0.935          // Scale new input by ~93.5%
acc = acc + STATE             // Add existing accumulated state
acc = tend(acc, 0, 0.048)    // Slowly tend toward zero (4.8% rate)
STATE = acc                   // Store result
INPUT = 0                     // Clear input for next cycle
```

### SVRule Bytecodes

```
0: load neuron[1] into accumulator       // Load INPUT_VAR
1: multiply by 0.935                      // Decay factor on new input
2: add neuron[0] to accumulator           // Add current STATE_VAR
3: set tend rate 0.048                    // Configure slow decay
4: tend accumulator to zero               // Apply decay
5: store accumulator in neuron[0]         // Write back to STATE_VAR
6: blank operand neuron[1]                // Clear INPUT_VAR
7: stop immediately
```

### Behavioral Effect

The leaky integrator means:
- **Rapid motion** produces strong, sustained activation
- **Brief motion** produces a spike that decays over several ticks
- **Static objects** produce zero activation (no motion = no change in displacement)
- **Persistence** allows the creature to "remember" recent motion for a few brain cycles

---

## Input Tract: visn → move

The single input tract converts vision displacement into a **motion detection signal** by computing the rate of change of the visual displacement.

### Tract Properties

| Property | Value |
|---|---|
| **Source Lobe** | `visn` (vision) |
| **Destination Lobe** | `move` |
| **Source Range** | Neurons 0-39, 1 connection per neuron |
| **Dest Range** | Neurons 0-39, 1 connection per neuron |
| **Source Variable** | STATE_VAR (neuron[0]) |
| **Dest Variable** | STATE_VAR (neuron[0]) |
| **Update Time** | 9 (before move lobe update at 11) |
| **Migrates** | No |

### Tract SVRule (pseudocode)

```
// For each visn→move dendrite connection:
acc = |visn.STATE|               // Absolute value of vision displacement
change = distance(acc, dendrite[4])  // Compare to previous |displacement|
acc = change × 0.851            // Scale the rate of change
acc = acc + move.INPUT           // Accumulate into existing input
move.INPUT = acc                 // Write to move neuron input
dendrite[4] = |visn.STATE|      // Store current as "previous" for next tick
```

### Tract SVRule Bytecodes

```
0: load absolute value of input neuron[0] into acc  // |visn STATE|
1: get distance to dendrite[4]                       // Change from previous
2: multiply by 0.851                                 // Scale factor
3: add neuron[1] to accumulator                      // Add existing INPUT
4: store accumulator in neuron[1]                    // Store as move INPUT
5: load absolute value of input neuron[0] into acc  // |visn STATE| again
6: store accumulator in dendrite[4]                  // Save for next tick
7: stop immediately
```

### What This Computes

The vision lobe stores **signed X-displacement** (negative = left, positive = right) as its STATE_VAR. This tract:

1. Takes the **absolute value** — direction doesn't matter, only magnitude of position
2. Computes the **distance** from the previous tick's absolute displacement — this is the rate of change
3. Scales by 0.851 and accumulates into the move neuron's INPUT

**Result**: A stationary object produces zero change (no motion detected). A moving object produces a signal proportional to how fast its displacement is changing — effectively detecting **visual motion** in each category.

---

## Output Tract: move → stim

The output tract is a **gated connection** that only passes signals when active motion has been detected.

### Tract Properties

| Property | Value |
|---|---|
| **Source Lobe** | `move` |
| **Destination Lobe** | `stim` (stimulus source) |
| **Source Range** | Neurons 0-39, 1 connection per neuron |
| **Dest Range** | Neurons 0-39, 1 connection per neuron |
| **Source Variable** | STATE_VAR (neuron[0]) |
| **Dest Variable** | STATE_VAR (neuron[0]) |
| **Update Time** | 13 (after move lobe update at 11) |
| **Migrates** | No |

### Tract SVRule (pseudocode)

```
// For each move→stim dendrite connection:
if (move.INPUT == 0) {
    stop;  // No motion detected — do nothing
}
// Otherwise: default behavior passes move.STATE to stim.STATE
```

### Tract SVRule Bytecodes

```
0: if zero neuron[1]    // If move INPUT is zero...
1: stop immediately     // ...gate closed, do nothing
```

### Gating Behavior

This is a remarkably simple gating mechanism:
- **When motion is detected** (INPUT ≠ 0): The tract's default behavior passes the move lobe's accumulated state into the stim lobe
- **When no motion** (INPUT == 0): The tract short-circuits and the stim lobe receives nothing from the move lobe

This prevents static background objects from generating noise in the stimulus pipeline — only actively moving objects contribute to the creature's decision-making through this pathway.

---

## Role in the Brain Architecture

The move lobe occupies a specific position in the brain's processing pipeline:

```
                    ┌──────────┐
 Engine writes →    │   visn   │  40 neurons: X-displacement per category
                    └────┬─────┘
                         │ (tract: motion detection)
                    ┌────▼─────┐
                    │   move   │  40 neurons: accumulated motion per category
                    └────┬─────┘
                         │ (tract: gated output)
                    ┌────▼─────┐
                    │   stim   │  40 neurons: stimulus source
                    └────┬─────┘
                         │ (tract: feeds combination)
                    ┌────▼─────┐
                    │   comb   │  440 neurons: combination matrix
                    └────┬─────┘
                         │ (tracts: output lobes)
                  ┌──────┴───────┐
             ┌────▼─────┐  ┌────▼─────┐
             │   attn   │  │   decn   │
             └──────────┘  └──────────┘
```

### Update Time Ordering

The brain processes lobes and tracts in a specific order each tick, defined by "update time" values in the genome:

| Update Time | Component | Action |
|---|---|---|
| 9 | visn→move tract | Computes motion from vision displacement change |
| 11 | move lobe | Leaky integrator accumulates motion signal |
| 13 | move→stim tract | Gates output to stim lobe |

This ordering ensures the move lobe always processes fresh vision data and produces its output before the stim lobe needs it.

### What Motion Detection Enables

By detecting which categories of objects are moving, the move lobe allows creatures to:

- **Notice approaching predators** — a Grendel moving toward the creature generates motion signal in that category
- **Track moving food** — bugs or critters that move catch the creature's attention through the stim→comb→attn pipeline
- **React to environmental changes** — elevators, machinery, or other agents that become active produce motion signals
- **Ignore static scenery** — stationary objects produce zero motion and are gated out of the stim pipeline

---

## Implementation Notes

### Original Engine Behavior

In the original engine, the move lobe:
- Is created by the `Lobe` class from the genome's lobe gene data
- Has no direct `SetInput()` or `GetWinningId()` calls — purely tract-driven
- Is processed by the standard brain update loop that iterates all lobes and tracts by update time
- Resolves through the `getLobeFromTokenString("move")` method which finds it in the genome-defined lobe list

### JS Behavior

In the JS rebuild, the move lobe:
- Is created by `Lobe.js` from parsed genome lobe gene data
- Is found by `Brain.js:getLobeFromTokenString("move")` which searches the lobe array
- Has no `brain.setInput('move', ...)` calls — all input comes through tracts
- Tracts are processed by `Tract.js:doUpdate()` which runs the tract SVRule for each dendrite connection

Since there is no engine code that directly references the move lobe, the original engine and the JS rebuild are inherently aligned — the lobe's behavior is entirely determined by the genome data and the general-purpose lobe/tract processing code.

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Genetics/norn.astro.48.gen` | Genome defining the move lobe gene and its tract genes |
| `Main_Game/src/engine/creature/brain/Lobe.js` | General lobe processing (doUpdate, SVRule execution) |
| `Main_Game/src/engine/creature/brain/Tract.js` | General tract processing (dendrite SVRule execution) |
| `Main_Game/src/engine/creature/brain/Brain.js` | Brain update loop, `getLobeFromTokenString()` |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | Writes vision displacement to visn lobe (indirect input source) |
| `Assets/Catalogue/Brain.catalogue` | Lists 12 catalogued lobes — move is **not** among them |

---

## Related Articles

- **[visn] Vision Lobe Architecture** — The upstream lobe that feeds displacement data into the move lobe via the visn→move tract
- **[attn] Attention Lobe Architecture** — Downstream output lobe that selects which category the creature focuses on
- **[decn] Decision Lobe Architecture** — Downstream output lobe that selects which action the creature performs
- **[forf] Friend-or-Foe Lobe Architecture** — Another genome-only lobe with no catalogue entry
- **Brain & Neural Networks** — Overview of the complete brain architecture
