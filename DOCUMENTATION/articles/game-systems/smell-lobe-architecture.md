# [smel] Smell Lobe Architecture

This article provides a deep-dive into the smell lobe (`smel`) — the brain's interface to the Cellular Automata (CA) environmental system. With 40 neurons (one per agent category), the smell lobe encodes "how much of this category does the creature smell in its current room?" Unlike the vision lobe which detects agents by direct line-of-sight, the smell lobe senses the **diffused chemical presence** of agents through the room's CA properties — allowing creatures to smell things they cannot see, through walls, around corners, and across connected rooms.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                SMELL LOBE DATA FLOW (END-TO-END)                │
│                                                                 │
│   Agents in rooms                                               │
│       │                                                         │
│       ▼                                                         │
│   CA Emission (agent.caIndex + agent.caIncrease)                │
│   └── Each agent emits into its room's CA property              │
│       │                                                         │
│       ▼                                                         │
│   CA Diffusion (MapCA system)                                   │
│   └── Values propagate between connected rooms per tick         │
│       │                                                         │
│       ▼                                                         │
│   SensoryFaculty.updateSmellLobe()                              │
│   ├── Read all 20 CA properties from creature's room            │
│   ├── Map CA index → agent category via SmellCategoryMapper     │
│   ├── Subtract creature's own contribution (self-exclusion)     │
│   ├── Write to biochemistry chemicals 165–184                   │
│   └── brain.setInput('smel', categoryId, smellValue)            │
│       │                                                         │
│       ▼                                                         │
│   smel lobe (40 neurons, pass-through SVRule)                   │
│   └── STATE = input (no decay, no persistence)                  │
│       │                                                         │
│       ├───────────────────────┐                                 │
│       ▼                       ▼                                 │
│   smel → stim tract       visn ↔ smel tract                    │
│   (scaled signal to        (mutual reinforcement               │
│    stimulus source)         between vision & smell)             │
│                                                                 │
│   Additionally: APPR/FLEE CAOS commands use the CA              │
│   gradient directly (not through the brain) for                 │
│   navigating toward/away from smelled objects                   │
└─────────────────────────────────────────────────────────────────┘
```

## Lobe Properties (from `norn.astro.48.gen`)

| Property | Value | Notes |
|----------|-------|-------|
| **Token** | `smel` | 4-byte identifier |
| **Full Name** | "smell" | Brain.catalogue index 5 |
| **Catalogue Position** | Lobes 5 / Input Lobes 3 / Quads 5 | |
| **Neuron Names** | "Agent Categories" | 40 names shared with visn, noun, stim, move |
| **Dimensions** | 40 wide × 1 high = **40 neurons** | One per agent category |
| **Update Time** | 4 | Same tick as visn and driv |
| **Switch-On Age** | **1 (baby)** | Not embryo — newborns have no smell |
| **Winner Takes All** | No | Multiple smells can coexist |
| **Tissue ID** | 255 (no tissue) | No biochemical modulation of neurons |

### Switch-On at Baby Stage

Unlike most brain lobes which activate at age 0 (embryo), the smel lobe and all its connecting tracts activate at **age 1 (baby)**. This means newborn creatures are born without smell perception — it emerges during the baby life stage. This is a unique developmental property shared only with the smel lobe's own tracts.

## SVRule: Pass-Through

```
Line 0: storeAccumulatorInto STATE
Line 1: STOP
```

The accumulator begins pre-loaded with the neuron's input. Line 0 stores it directly into STATE. No decay, no persistence, no computation. The smel lobe is a pure relay — it takes the CA-derived smell value and makes it available for tract propagation. The smell value exists only long enough for the outbound tracts to carry it to downstream lobes.

## Engine Input Sources

### Source 1: SensoryFaculty — CA Room Properties (Every Tick)

**JS**: `SensoryFaculty.js:303-347`

This is the primary input source. Every tick during the creature's update:

```
for each CA property (index 0..19):
    smellValue = room.getCaProperty(caIndex)          // float 0.0–1.0
    biochemistry.setChemical(165 + caIndex, smellValue)  // chemicals 165–184
    categoryId = SmellCategoryMapper.getCategoryIdFromSmellId(caIndex)
    if categoryId == creature's own category:
        smellValue -= creature's own CA contribution   // self-exclusion
    brain.setInput('smel', categoryId, smellValue)
```

**What this does**:
1. Reads all 20 CA property values from the creature's current room
2. Copies raw CA values to biochemistry chemicals 165–184 (used by receptors/emitters)
3. Maps each CA index to an agent category via the `SmellCategoryMapper`
4. Subtracts the creature's own emission so a Norn doesn't smell itself in its own room
5. Sets the smel neuron for that category to the CA value

**Values written**: Float 0.0 to 1.0, directly from the CA system. Already normalized. The neuron index is the **agent category ID** (0–39), NOT the CA property index.

### Source 2: Instinct System — During REM Sleep

**JS**: `Instinct.js:102-106`

When processing instincts during REM sleep, if an instinct input references the `noun` lobe (agent categories), the brain **also** sets:
- `visn` neuron for that category = `0.1` (faint visibility)
- `smel` neuron for that category = **`1.0`** (full smell)

```javascript
if (lobeName === 'noun') {
    this.myBrain.setInput('visn', this.myInputs[i].neuronId, 0.1);
    this.myBrain.setInput('smel', this.myInputs[i].neuronId, 1.0);  // max smell
}
```

This ensures the creature "imagines" smelling the target object during dream learning, reinforcing smell-category associations. The smell signal is set to maximum (1.0) while vision is only 0.1 — in dream instincts, smell is the dominant sense.

## The CA-to-Category Mapping System

The mapping between CA property indices and agent category neuron IDs is not hardcoded — it is established dynamically through the `CACL` CAOS command, typically in bootstrap scripts.

In the original engine the smell-id-to-category table holds 20 entries, all initialized to -1 (unmapped).
**JS**: `SmellCategoryMapper` — has hardcoded defaults for CA 12–17, rest via CACL

### Standard Mappings (from `z_agent smells.cos`)

| CA Index | CA Name | Agent Category | Category Name |
|----------|---------|----------------|---------------|
| 6 | protein | genus 8 simple | food-related |
| 7 | carbohydrate | genus 3 simple | food-related |
| 8 | fat | genus 11 simple | food-related |
| 10 | machinery | genus 3 compound | machinery |
| 11 | eggs | genus 4 compound species 1 | creature eggs |
| 12 | norn | category 36 | norn |
| 13 | grendel | category 37 | grendel |
| 14 | ettin | category 38 | ettin |
| 15 | norn home | category 30 | norn home |
| 16 | grendel home | category 31 | grendel home |
| 17 | ettin home | category 32 | ettin home |
| 18 | gadget | genus 8 compound | gadget |

**Unmapped CA properties** (indices 0–5, 9, 19): These include sound, light, heat, water, nutrient, water, flowers, and an unused slot. They are read into biochemistry chemicals but do NOT fire any smel neuron (categoryId = -1, skipped).

### Self-Exclusion

When the mapped category matches the creature's own category (e.g., a Norn mapping to category 36 from CA index 12), the engine calls `GetRoomPropertyMinusMyContribution()` to subtract the creature's own CA emission. This prevents creatures from overwhelming their own smell neuron with self-smell.

## Biochemistry Integration

In the original engine: `SetChemical(FIRST_SMELL_CHEMICAL + caIndex, smellValue)` — chemicals 165–184

Unlike most input lobes, the smel lobe has a **dual output path**:
1. **Brain pathway**: CA values → smel neuron → tracts → downstream processing
2. **Biochemistry pathway**: CA values → chemicals 165–184 → receptor/emitter system

The biochemistry chemicals allow genome-defined receptors to respond to environmental CA concentrations. For example, a receptor bound to chemical 165 (CA 0 = sound) could trigger a chemical cascade when a room is noisy, entirely separate from the brain's neural processing.

## Outbound Tracts (2)

### Tract 1: smel → stim (Smell Gating to Stimulus Source)

| Property | Value |
|----------|-------|
| Update Time | 14 |
| Switch-On Age | 1 (baby) |
| Source | smel[0..39] → stim[0..39], 1:1, 1 dendrite each |

**Update SVRule**:
```
Line 0: acc = src.STATE (smel neuron state)
Line 1: if acc == 0, skip to line 2
Line 2: STOP  (no smell → no output)
Line 3: acc *= 0.6653
Line 4: acc += 0.3347
Line 5: acc *= 0.5
Line 6: dst.INPUT += acc
```

**Behavior**: If the smel neuron is zero (no smell), nothing reaches stim — the tract exits early. If nonzero, the smell signal is transformed to a range of approximately **[0.167, 0.5]** and added to the stim neuron's input. The transformation `(state × 0.6653 + 0.3347) × 0.5` compresses smell intensity into a moderate saliency band, preventing strong smells from dominating the stimulus source lobe.

This tract is analogous to the visn→stim tract (proximity inversion) — both feed the stim lobe with per-category saliency signals, but through different sensory modalities.

### Tract 2: smel → visn (Specific Neuron Override)

| Property | Value |
|----------|-------|
| Update Time | 6 |
| Switch-On Age | 1 (baby) |
| Source | smel[32] → visn[33], single neuron, 1 dendrite |

**Update SVRule**:
```
Line 0: if chemical[119] == 0, STOP  (biochemical gate)
Line 1: acc = src.STATE (smel[32] state)
Line 2: if acc > 0.1008, skip line 3
Line 3: dst.STATE = 0  (blank the visn neuron)
```

**Behavior**: This narrow tract connects a single pair: smel neuron 32 (ettin home) to visn neuron 33 (gadget). It is **gated by chemical 119** — the tract only fires when that chemical is present. When active, if the smell of ettin home exceeds ~0.10, the vision neuron for gadget is blanked (zeroed). This is a smell-overrides-vision mechanism for a specific category pair, likely a gameplay-specific genome tweak where strong ettin-home smell suppresses gadget visibility.

## Inbound Tracts (1)

### Tract: visn → smel (Mutual Signal Blending)

| Property | Value |
|----------|-------|
| Update Time | 10 |
| Switch-On Age | 1 (baby) |
| Source | visn[0..39] → smel[0..39], 1:1, 1 dendrite each |

**Update SVRule** (bidirectional — modifies BOTH source and destination):
```
Line 0: acc = visn.STATE (vision neuron state)
Line 1: if smel.STATE != 0, skip line 2
Line 2: acc *= 0.5  (halve vision signal when smel is inactive)
Line 4: visn.STATE = acc  (write back to vision neuron)
Line 5: acc = smel.STATE (smell neuron state)
Line 6: if visn.STATE != 0, skip line 7
Line 7: acc *= 0.5  (halve smell signal when visn is inactive)
Line 9: smel.STATE = acc  (write back to smell neuron)
```

**Behavior**: This is a **bidirectional mutual reinforcement** tract. It implements cross-modal sensory integration:
- When BOTH vision and smell detect the same category: signals pass at **full strength**
- When ONLY vision detects it (no smell): vision signal is **halved**
- When ONLY smell detects it (no vision): smell signal is **halved**
- When BOTH are active: mutual reinforcement — seeing something you can also smell produces a stronger combined signal

This creates a perceptual synergy: agents that are both visible and smellable are perceived more strongly than agents detected through only one modality. The tract fires at time 10, after both visn (time 4) and smel (time 4) have updated but before the smel→stim tract (time 14).

## Tract Timing Sequence

```
Time  4: smel lobe update (pass-through: input → STATE)
Time  4: visn lobe update (pass-through: input → STATE)
Time  6: smel[32] → visn[33] (specific neuron override, chemical-gated)
Time 10: visn ↔ smel (mutual signal blending, bidirectional)
Time 12: visn → stim (proximity inversion)
Time 14: smel → stim (smell gating, scaled to [0.167, 0.5])
Time 16: stim lobe update + noun → stim (language amplification)
```

Both visn and smel feed the stimulus source lobe (stim), but through different transformations: vision is proximity-inverted (closer = stronger) while smell is compressed into a moderate saliency band. The mutual reinforcement tract (time 10) runs between the two lobe updates and the stim feeding, ensuring cross-modal integration before downstream processing.

## Downstream Consumer: APPR/FLEE Navigation

The smell system has a **second consumer path** that bypasses the brain entirely. When the `APPR` (approach) or `FLEE` (flee) CAOS commands execute and there is no visible IT agent:

```
1. Get creature's current attention category (from attn lobe winner)
2. Look up CA index for that category via SmellCategoryMapper
3. Query map for WhichDirectionToFollowCA()
   — examines neighboring rooms for highest (APPR) or lowest (FLEE) CA value
4. Move creature in that direction (left, right, up, down)
5. If at peak (GO_NOWHERE): trigger STIM_REACHED_PEAK_OF_SMELL stimulus
```

**JS**: `APPR.js:109-160`, `FLEE.js:114-158`

This allows creatures to navigate toward food, other creatures, or homes by following CA gradients — even when the target is not visible. The smell gradient acts as a pathfinding mechanism.

## No Direct Engine Read Sites

No engine code calls `getNeuronState('smel', ...)` or `getOutput('smel', ...)`. The smel lobe is a pure input lobe:
- Neuron states propagate exclusively through genome-defined tracts (smel→stim, smel→visn)
- APPR/FLEE navigation reads the CA system directly, not the smel lobe neurons
- No involvement in knowledge building (`Brain.knowledge()` does NOT stimulate smel)

## Known Divergences from the Original Engine

### BUG: Wrong Lobe Token (`"smll"` vs `"smel"`)

The original engine uses `"smel"` consistently (including in `Brain.catalogue:70`)
**JS SensoryFaculty.js** uses `"smll"` (lines 304, 344) — a typo with double-L instead of E-L
**JS Instinct.js** correctly uses `"smel"` (line 105)

`SensoryFaculty.js:304` calls `brain.getLobeByName('smll')` which:
1. Uses a method name (`getLobeByName`) that doesn't exist on Brain.js (correct method: `getLobeFromTokenString`)
2. Uses the wrong token (`'smll'` instead of `'smel'`)

The guard `brain.getLobeByName ? brain.getLobeByName('smll') : null` always evaluates to `null`, causing `updateSmellLobe()` to return immediately. **The entire smell perception system is non-functional in the JS rebuild** — CA values never reach the smel brain neurons from SensoryFaculty. Only Instinct.js (which correctly uses `'smel'`) can write to this lobe during dream sleep.

### BUG: Missing Biochemistry Chemical Updates

In the original engine: `creature.GetBiochemistry().SetChemical(FIRST_SMELL_CHEMICAL + i, smellValue)` — writes CA values to chemicals 165–184 every tick.

**JS**: `updateSmellLobe()` has no equivalent `setChemical()` call. Biochemistry chemicals 165–184 are never updated with CA values.

### BUG: Conflicting `FIRST_SMELL_CHEMICAL` Constants

- `PerceptionConstants.js:19`: `FIRST_SMELL_CHEMICAL = 160` (wrong)
- `BiochemistryConstants.js:23`: `FIRST_SMELL_CHEMICAL = 165` (correct, matches the original engine)
- SensoryFaculty.js imports from PerceptionConstants.js (the wrong value)

### BUG: Wrong `CA_PROPERTY_COUNT`

- `PerceptionConstants.js:11`: `CA_PROPERTY_COUNT = 16` (wrong)
- The original engine: `CA_PROPERTY_COUNT = 20` (correct)
- JS `CASystem.js` and `SmellCategoryMapper.js`: use 20 internally (correct)
- SensoryFaculty.js imports from PerceptionConstants.js (the wrong value of 16)

Even if the token were fixed, the loop would only process 16 of 20 CA properties, missing indices 16–19 (grendel home, ettin home, gadget, unused).

## Summary

The smel lobe is the creature's **environmental scent perception system**, bridging the CA room simulation and the neural brain. Its 40 neurons mirror the 40 agent categories, with values derived from CA diffusion rather than direct visibility. It activates at baby stage (not embryo), uses a pass-through SVRule, and feeds downstream through a mutual reinforcement tract with vision (cross-modal integration) and a scaled gating tract to the stimulus source lobe. The CA-to-category mapping is dynamic, established by bootstrap CACL commands. The smel lobe also maintains a parallel biochemistry pathway (chemicals 165–184) for genome-defined receptor responses. Currently non-functional in JS due to a token typo and missing method.
