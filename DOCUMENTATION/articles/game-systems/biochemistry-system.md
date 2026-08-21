# Biochemistry System Architecture

## Overview

The Creatures 3 biochemistry system creates a feedback loop where **chemicals** flow through **organs** via **reactions**, influence **loci** (drives, organ states, brain neurons, etc.) through **receptors**, and loci emit chemicals back through **emitters**.

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                            BIOCHEMISTRY CYCLE                                  │
│                                                                               │
│   CHEMICALS (256 values)                                                      │
│       │                                                                       │
│       ├──→ REACTIONS ──→ transform chemicals (A + B → C + D)                  │
│       │                                                                       │
│       └──→ RECEPTORS ──→ write to LOCI (chemistry → creature state)           │
│                              │                                                │
│                              ├──→ Drives (20 loci) ──→ Brain decisions        │
│                              ├──→ Organ states (clock rate, injury, repair)   │
│                              ├──→ Brain neurons (direct neural input)         │
│                              ├──→ Sensorimotor (gaits, involuntary actions)   │
│                              └──→ Other (reproductive, immune, floating)      │
│                                                                               │
│   LOCI ──→ EMITTERS ──→ emit chemicals (creature state → chemistry)           │
│       │                                                                       │
│       └──← NEUROEMITTERS ←── Brain neurons emit chemicals                     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Chemicals

**File:** `Main_Game/src/engine/creature/biochemistry/Biochemistry.js` (lines 16-17)

### Storage
- 256 chemicals stored as `Float32Array`
- Values normalized to 0.0-1.0 range
- Each chemical has an associated decay rate (half-life)

### Special Chemicals
| ID | Name | Purpose |
|----|------|---------|
| 4 | Glycogen | Energy storage |
| 35 | ATP | Active energy currency |
| 36 | ADP | Energy byproduct |
| 127 | Injury | Damage indicator |
| 48 | Progesterone | Reproductive hormone |

### Access Methods (lines 136-171)
- `getChemical(index)` - Read concentration
- `setChemical(index, value)` - Set (clamped 0.0-1.0)
- `addChemical(index, amount)` - Increment
- `subChemical(index, amount)` - Decrement
- `getChemicalConcs()` - Get entire array reference

---

## 2. Organs

**File:** `Main_Game/src/engine/creature/biochemistry/Organ.js` (lines 12-56)

### Structure
Organs are containers that process biochemistry subsystems:
- Up to 128 organs per creature (`MAXORGANS`)
- Each organ contains: reactions, emitters, receptor groups
- `myReactions`: up to 128 reactions per organ
- `myEmitters`: up to 128 emitters per organ
- `myReceptorGroups`: up to 255 groups of receptors

### Clock System (lines 17-18)
```javascript
this.loc_ClockRate = 1.0;     // Internal ticks per update
this.myClock = 0;             // Accumulator (processes when >= 1.0)
```

### Life Force System (lines 20-31)
```javascript
this.loc_LifeForce = 0.5;                    // Locus value (0-1 normalized)
this.myInitialLifeForce = 0.5 * 1.0e6;       // Full health = 500,000
this.myShortTermLifeForce;                   // Current health
this.myLongTermLifeForce;                    // Permanent damage
this.myLongTermRateOfRepair = 0.01;          // Healing rate
```

### Energy System (lines 33-36)
```javascript
this.myEnergyCost = 0;                 // ATP cost per tick
this.myDamageDueToZeroEnergy = 0;     // Damage when ATP depleted
this.myEnergyAvailableFlag = true;     // Can afford energy?
```

### Processing Order and Energy Gating

The organ update is split into two phases with a critical **energy gate** between them:

```
Organ.Update()
│
├─ if organ has Failed() → skip everything (organ is dead)
│
├─ myClock += loc_ClockRate
│
├─ if myClock >= 1.0 (organ tick):
│   │
│   ├─ 1. ConsumeEnergy() → deduct ATP cost
│   │
│   ├─ if energy IS available:
│   │   ├─ 2. ProcessAll():
│   │   │   ├─ Emitters  → loci → chemicals
│   │   │   └─ Reactions → transform chemicals
│   │   │
│   │   └─ (organ functions normally)
│   │
│   ├─ if energy NOT available:
│   │   └─ Injure(myDamageDueToZeroEnergy)  → organ takes damage
│   │
│   ├─ 3. RepairInjury(energyAvailable)
│   ├─ 4. Apply receptor-driven injury (loc_InjuryToApply)
│   └─ 5. ProcessReceptors(all) → chemicals → loci  ← ALWAYS runs
│
└─ if myClock < 1.0 (between ticks):
    └─ ProcessReceptors(clock-rate only)  ← ALWAYS runs
```

### What Stops When ATP Runs Out

When an organ cannot consume its ATP energy cost, **only emitters and reactions stop**. Receptors continue unconditionally:

| Component | No ATP? | Reason |
|-----------|---------|--------|
| **Reactions** | **Stopped** | Inside `ProcessAll()`, gated by energy check |
| **Emitters** | **Stopped** | Inside `ProcessAll()`, gated by energy check |
| **Receptors** | **Keep running** | Called AFTER the energy gate, unconditionally |
| **Organ repair** | Limited | Long-term damage accumulates; short-term repair needs energy |
| **Organ injury** | **Increases** | `Injure(myDamageDueToZeroEnergy)` each tick without ATP |

**Consequences:**
- Receptors still write chemicals → loci (drives still update from chemistry)
- Emitters cannot read loci → chemistry (no chemical production from drive/locus states)
- Reactions cannot transform chemicals (no metabolism — including ATP production from glucose)
- The organ takes cumulative damage each tick, eventually **failing** entirely (`Failed()` returns true, skipping all processing)

### ATP Death Spiral

No ATP triggers a self-reinforcing failure cascade:

```
No ATP → organ can't process reactions
       → reactions that PRODUCE ATP from glucose can't run
       → ATP stays at zero
       → organ takes damage each tick (Injure)
       → organ life force drops
       → organ eventually fails (Failed() = true)
       → all processing stops (including receptors)
       → drives stop updating → creature becomes unresponsive
       → if enough organs fail → creature dies
```

This mirrors real biological organ failure: without energy, metabolic processes shut down, cells are damaged, and cascading organ failure leads to death. The design ensures that creatures must maintain energy (eat food → produce glucose → metabolize to ATP) or face progressive system shutdown.

---

## 3. Reactions

**JS File:** `Main_Game/src/engine/creature/biochemistry/Reaction.js`

Reactions are **spontaneous** chemical transformations that occur automatically every organ tick when reactants are present. They do not require external triggers.

### Structure

```javascript
// Reactants (A + B)
propR1, R1      // Reactant 1: proportion and chemical ID
propR2, R2      // Reactant 2: proportion and chemical ID

// Reaction rate (genome value)
Rate            // 0.0 (slow) to 1.0 (fast) - NOT the actual rate per tick!

// Products (C + D)
propP1, P1      // Product 1: proportion and chemical ID
propP2, P2      // Product 2: proportion and chemical ID
```

### Rate Calculation: The Half-Life Formula

**IMPORTANT:** The `Rate` value stored in the genome is NOT used directly. It is converted through a **half-life formula** to determine the actual fraction that reacts each tick.

```text
// Rate is 0 for slow, 1 for fast (reverse from when loaded!)
inputFloat = (1.0 - Rate) * 32.0
halfLifeInTicks = pow(2.2, inputFloat)
rate = 1.0 - pow(0.5, 1.0 / halfLifeInTicks)
```

**Formula breakdown:**

```
1. inputFloat = (1.0 - Rate) × 32.0

2. halfLifeInTicks = 2.2 ^ inputFloat

3. ratePerTick = 1.0 - 0.5 ^ (1.0 / halfLifeInTicks)
```

### Rate Conversion Table

| Genome Rate | inputFloat | Half-Life (ticks) | Rate/Tick | Description |
|-------------|------------|-------------------|-----------|-------------|
| **0.0** | 32.0 | 2.2³² ≈ 4.3 billion | ~0% | Practically never reacts |
| **0.25** | 24.0 | 2.2²⁴ ≈ 1 million | ~0.00007% | Extremely slow |
| **0.5** | 16.0 | 2.2¹⁶ ≈ 8,000 | ~0.009% | Very slow |
| **0.75** | 8.0 | 2.2⁸ ≈ 550 | ~0.13% | Slow |
| **0.875** | 4.0 | 2.2⁴ ≈ 23 | ~3% | Moderate |
| **0.9** | 3.2 | 2.2³·² ≈ 13 | ~5% | Moderate-fast |
| **0.95** | 1.6 | 2.2¹·⁶ ≈ 3.6 | ~18% | Fast |
| **1.0** | 0.0 | 2.2⁰ = 1 | **50%** | Maximum speed |

**Key insight:** The half-life formula creates an **exponential curve** where most of the rate range (0.0-0.9) produces very slow reactions, and only values close to 1.0 produce fast reactions. This gives genome designers fine control over slow biological processes.

### Algorithm per Tick

```
1. Calculate available moles from each reactant (limiting reagent):
   availR1 = chemicals[R1] / propR1    (or 1.0 if R1 = 0)
   availR2 = chemicals[R2] / propR2    (or 1.0 if R2 = 0)
   available = min(availR1, availR2)

2. If no reactants available (available ≤ 0), skip reaction

3. Calculate actual rate using half-life formula:
   inputFloat = (1.0 - Rate) × 32.0
   halfLifeInTicks = 2.2 ^ inputFloat
   ratePerTick = 1.0 - 0.5 ^ (1.0 / halfLifeInTicks)

4. Calculate reacting amount:
   reacting = available × ratePerTick

5. Consume reactants:
   chemicals[R1] -= reacting × propR1
   chemicals[R2] -= reacting × propR2

6. Produce products:
   chemicals[P1] += reacting × propP1
   chemicals[P2] += reacting × propP2
```

### Stoichiometry (Proportions)

The `prop` values define the stoichiometric ratios. For example:

```
Reaction: 2A + 1B → 1C + 3D
  propR1 = 2, R1 = chemical A
  propR2 = 1, R2 = chemical B
  propP1 = 1, P1 = chemical C
  propP2 = 3, P2 = chemical D
```

If you have 0.6 of A and 0.4 of B:
- Available from A: 0.6 / 2 = 0.3
- Available from B: 0.4 / 1 = 0.4
- Limiting reagent: A (0.3 moles available)
- At Rate=1.0 (50% per tick): 0.15 moles react
- A consumed: 0.15 × 2 = 0.3
- B consumed: 0.15 × 1 = 0.15
- C produced: 0.15 × 1 = 0.15
- D produced: 0.15 × 3 = 0.45

### Genome Loading

When loaded from genome, the Rate is inverted:

```text
Rate = 1.0 - genome.GetFloat()
```

This means a genome byte of 0 → Rate = 1.0 (fast), and genome byte 255 → Rate ≈ 0.0 (slow).

### Example: Glycolysis (Glucose → Energy)

```
Reaction: Glucose + Glycolase → Pyruvate + Energy
  R1 = 3 (Glucose)
  R2 = 115 (Glycolase enzyme)
  P1 = 2 (Pyruvate)
  P2 = 34 (Energy)
  Rate = 0.9 (moderate-fast, ~5% per tick)
```

When glucose and glycolase are both present, ~5% of available glucose is converted to pyruvate and energy each organ tick.

### Reaction Rate Loci: Chemical Control of Reaction Speed (Enzyme Mechanism)

**JS Source:** `Organ.js` lines 742-751

Beyond the static rate set by the genome, reaction rates can be **dynamically modulated at runtime** through the locus system. This is the engine's **enzyme mechanism** — chemicals can speed up or slow down specific reactions by writing to their rate locus through receptors.

#### How It Works

A receptor with `IDOrgan = 3` (`ORGAN_REACTION`) targets a reaction's `Rate` property:

| Field | Meaning |
|-------|---------|
| `IDOrgan` | `3` (ORGAN_REACTION) |
| `IDTissue` | Reaction index within the organ (0–127). During gene reading, this is **overwritten** to `thisReactionNo` — the index of the reaction being defined in the current organ (`Organ.js` line 559-560). |
| `IDLocus` | `0` (Rate — the only locus available for reactions) |

The receptor monitors a chemical and writes its processed signal (nominal + gain-adjusted concentration) directly to `organ.myReactions[tissue].Rate`. This means the reaction's speed changes in real-time based on chemical concentrations.

#### Addressing: Internal to the Organ

Unlike `ORGAN_CREATURE` or `ORGAN_BRAIN` loci which are global (any organ's receptor can target them), reaction rate loci are **resolved internally** — a receptor can only modulate reactions within its own organ. When `GetLocusAddress()` encounters `ORGAN_REACTION`, it looks up `this.myReactions[tissue]` on the organ instance that contains the receptor.

```javascript
// Organ.js GetLocusAddress() — ORGAN_REACTION case
case OrganIDs.ORGAN_REACTION:
    if (tissue < 0 || tissue >= this.myNoOfReactions) {
        return this.getInvalidLocusAddress();
    }
    const reaction = this.myReactions[tissue];
    return {
        get value() { return reaction.Rate; },
        set value(v) { reaction.Rate = v; }
    };
```

#### IDTissue Override During Gene Reading

When receptor genes are read from the genome, `IDTissue` is a raw genome byte. But for `ORGAN_REACTION` receptors, the engine **overwrites** this value with the current reaction index being defined:

```javascript
// Organ.js line 559-560 — during gene reading
if (r.IDOrgan === OrganIDs.ORGAN_REACTION) {
    r.IDTissue = thisReactionNo;
}
```

This ensures the receptor always targets the reaction it was genetically defined alongside, regardless of what byte the genome originally contained in the tissue field.

#### Example: Enzyme-Controlled Digestion

```
Organ #5 contains:
  Reaction #0: Starch + Amylase → Glucose + Glucose (Rate = 0.1, slow)
  Receptor: IDOrgan=3, IDTissue=0, IDLocus=0, Chem=Amylase, Gain=0.8

Signal flow:
  Amylase concentration rises → receptor detects it
  → receptor writes (nominal + signal) to Reaction #0's Rate
  → Rate increases → starch digests faster
  → as Amylase is consumed by the reaction, Rate decreases again
```

This creates a natural **enzyme feedback loop**: the enzyme chemical both participates in the reaction (as a reactant) and controls its speed (through the rate locus). When the enzyme is abundant, the reaction runs fast; as it's consumed, the reaction slows down.

#### Receptor-Only

Reaction rate loci are **receptor-only** — there is no emitter equivalent. Emitters cannot read from reaction rates. This makes biological sense: chemicals control reaction speeds (enzymes), but reaction speeds don't directly emit chemicals (that's what the reaction products are for).

---

## 4. Receptors (Chemistry → Loci)

**File:** `Main_Game/src/engine/creature/biochemistry/Receptor.js` (lines 53-86)

### Structure (lines 8-25)
```javascript
// Target identification
IDOrgan, IDTissue, IDLocus    // Target locus location
Chem                          // Chemical to monitor (0 = none)

// Signal processing
Threshold                      // Minimum level to respond
Nominal                        // Base output
Gain                          // Multiplication factor
Effect                        // Flags (RE_REDUCE, RE_DIGITAL)

// Runtime binding
Dest                          // Locus reference object
isClockRateReceptor           // Clock-affecting receptor?
```

### Algorithm
```
1. Check if chemical level > threshold
2. Calculate signal:
   - Analog mode:  signal = nominal + (chemLevel - threshold) × gain
   - Digital mode: signal = nominal + gain (fixed output)
3. Apply RE_REDUCE flag: invert signal if set
4. Clamp to 0.0-1.0
5. Write to destination locus
```

### Effect Flags
| Flag | Value | Behavior |
|------|-------|----------|
| RE_DIGITAL | 1 | Fixed output instead of proportional |
| RE_REDUCE | 2 | Invert the effect |

### Receptor Target Loci

Receptors can write to **all types of loci**, not just drives. The target is specified by the `IDOrgan/IDTissue/IDLocus` address:

| IDOrgan | Target System | Common Tissues/Loci |
|---------|---------------|---------------------|
| **0** (ORGAN_BRAIN) | Brain lobes | Neuron states in specific lobes |
| **1** (ORGAN_CREATURE) | Creature body | Tissue 0: Somatic (age), Tissue 1: Circulatory (floating), Tissue 2: Reproductive, Tissue 3: Immune (die), Tissue 4: Sensorimotor (gaits, involuntary), **Tissue 5: Drives** |
| **2** (ORGAN_ORGAN) | Physical organ | Locus 0: ClockRate, Locus 1: RateOfRepair, Locus 2: Injury |
| **3** (ORGAN_REACTION) | Reaction organs | Reaction rate loci |

**Example: Pain chemical (148) has receptors with different targets:**

| Physical Organ | Locus Target | Effect |
|----------------|--------------|--------|
| Organ #0 | `1/5/0` (Creature/Drives/Pain) | Increases Pain drive → affects behavior |
| Organ #1 | `1/5/0` (Creature/Drives/Pain) | Also increases Pain drive |
| Organ #2 | `2/2/2` (Organ/Injury) | Affects organ's internal injury state |
| Organ #3 | `2/2/2` (Organ/Injury) | Affects this organ's injury state |

This means when you filter by "Pain" in the debugger, you see all receptors monitoring Pain chemical, but they may write to **different loci** (drives vs organ injury vs other targets).

### Example: Drive Modulation
- Monitor: Hunger chemical (e.g., chem 100)
- Target: Drive 1 locus (`1/5/1` = Creature/Drives/Hunger)
- Threshold: 0.3 (respond only if significant)
- Gain: 2.0 (amplify hunger signal)
- Result: Chemical level is amplified and written to drive locus

### Multiple Receptors for Non-Linear Response

The same chemical can have **multiple receptors with different thresholds and gains**. This creates a non-linear (stepped/accelerating) response curve.

**Example: Pain (chemical #148) has 3 receptors:**
```
Receptor 1: Threshold=0.1, Gain=0.5  → Responds to low pain
Receptor 2: Threshold=0.4, Gain=0.8  → Responds to medium pain
Receptor 3: Threshold=0.7, Gain=1.2  → Responds to high pain
```

**Effect on response:**
| Chemical Level | Active Receptors | Total Response |
|----------------|------------------|----------------|
| 0.0 - 0.1 | None | Minimal |
| 0.1 - 0.4 | Receptor 1 only | Low |
| 0.4 - 0.7 | Receptors 1 + 2 | Medium |
| 0.7 - 1.0 | Receptors 1 + 2 + 3 | High (stacked) |

**Why this design?**
1. **Non-linear sensitivity**: Low levels have gentle effects, high levels trigger strong responses
2. **Biological realism**: Real nervous systems have multiple receptor types with different sensitivities
3. **Behavioral nuance**: Creatures tolerate minor discomfort but react strongly to severe conditions

### Receptor Groups and Locus Writing

Within a single physical organ, receptors that share the same target locus (same `IDOrgan/IDTissue/IDLocus`) are grouped together. The signals from all receptors in a group are **averaged**, not simply added:

```text
// For each receptor group (sharing same locus):
result = average(all nominals)
result += average(all additive signals)
result -= average(all subtractive signals)
locus = result
```

**Key behavior:**
- **Same physical organ, same locus**: Signals are averaged together
- **Different physical organs, same locus**: Each organ writes independently; **last organ to process wins** (overwrites previous value)

**Example:**
```
Physical Organ #0:
  - Receptor A: monitors Chemical X → writes to 1/5/0 (Pain)
  - Receptor B: monitors Chemical Y → writes to 1/5/0 (Pain)
  → A and B are GROUPED, their signals are AVERAGED

Physical Organ #1:
  - Receptor C: monitors Chemical Z → writes to 1/5/0 (Pain)
  → C is in a different organ, so it OVERWRITES whatever Organ #0 wrote
```

This means if you want multiple chemicals to contribute to the same drive with averaged effects, they should be receptors in the **same physical organ**. Receptors in different organs targeting the same locus will overwrite each other.

---

## 5. Drives

**File:** `Main_Game/src/engine/creature/Creature.js` (lines 99, 224-227, 270-271)

### Storage
```javascript
this.myDriveLoci = new Float32Array(NUM_DRIVES);  // 20 drives (0-19)
```

### Drive Indices
| ID | Name | Description |
|----|------|-------------|
| 0 | Pain | Physical discomfort from injury or illness |
| 1 | Hunger for Protein | Need for protein-rich food |
| 2 | Hunger for Carbohydrate | Need for carb-rich food |
| 3 | Hunger for Fat | Need for fatty food |
| 4 | Coldness | Feeling too cold |
| 5 | Hotness | Feeling too hot |
| 6 | Tiredness | Physical exhaustion |
| 7 | Sleepiness | Need for sleep |
| 8 | Loneliness | Desire for social interaction |
| 9 | Crowdedness | Overwhelmed by too many creatures |
| 10 | Fear | Anxiety from perceived threats |
| 11 | Boredom | Lack of stimulation |
| 12 | Anger | Frustration and aggression |
| 13 | Sex Drive | Reproductive urge |
| 14 | Comfort | General sense of wellbeing |
| 15 | Up | Drive to move upward |
| 16 | Down | Drive to move downward |
| 17 | Exit | Drive to leave current location |
| 18 | Enter | Drive to enter a new location |
| 19 | Wait | Drive to stay in place |

### Bidirectional Nature
Drives are **bidirectional loci**:
- **Receptors** write TO drives (chemistry → behavior)
- **Emitters** read FROM drives (behavior → chemistry)

---

## 6. Locus Addressing System

A locus address like **"1/4/0"** is a three-part identifier used by receptors and emitters to target specific variables in the creature.

### Important: Two Different "Organ" Concepts

There are **two distinct meanings of "organ"** in the biochemistry system:

1. **Physical Organ Index** (e.g., "Organ #0", "Organ #1", "Organ #2")
   - The array index of an organ in `Biochemistry.myOrgans[]`
   - Each creature has multiple physical organs (typically 5+)
   - Each organ processes its own reactions, emitters, and receptors independently

2. **IDOrgan in Locus Address** (the first number in "1/5/0")
   - The **target organ system type** that a receptor writes to or emitter reads from
   - This is NOT the same as the physical organ index
   - Values: 0=Brain, 1=Creature, 2=Organ, 3=Reaction

**Example of the distinction:**
```
Physical Organ #0 has a receptor with Locus: 1/5/0
Physical Organ #1 has a receptor with Locus: 1/5/0
```
Both receptors target the **same global locus** (Creature/Drives/Pain), but they exist in **different physical organs**. This allows multiple chemicals from different organs to influence the same drive.

### Format: `IDOrgan / IDTissue / IDLocus`

| Part | Meaning | Example Values |
|------|---------|----------------|
| **IDOrgan** | Which organ system TYPE | 0=Brain, 1=Creature, 2=Organ |
| **IDTissue** | Which tissue on that organ | Depends on organ type |
| **IDLocus** | Which specific variable | Index within that tissue |

### IDOrgan Values (first number in locus address)
| ID | Name | Description |
|----|------|-------------|
| 0 | ORGAN_BRAIN | Brain lobes/neurons |
| 1 | ORGAN_CREATURE | Creature body (drives, gaits, etc.) |
| 2 | ORGAN_ORGAN | The physical organ's own loci (clock rate, life force) |
| 3 | ORGAN_REACTION | Reaction rate loci |

### Creature Tissue IDs (second number, when Organ=1)
| ID | Name | Description |
|----|------|-------------|
| 0 | TISSUE_SOMATIC | Body/appearance (age loci) |
| 1 | TISSUE_CIRCULATORY | Floating loci (32 general-purpose) |
| 2 | TISSUE_REPRODUCTIVE | Fertility, pregnancy |
| 3 | TISSUE_IMMUNE | Death, antigens |
| 4 | TISSUE_SENSORIMOTOR | Sensors, gaits, involuntary actions |
| 5 | TISSUE_DRIVES | The 20 drive loci |

### Common Locus Examples

| Locus | Meaning |
|-------|---------|
| 1/5/0 | Creature / Drives / Pain drive |
| 1/5/1 | Creature / Drives / Hunger for Protein drive |
| 1/4/0 | Creature / Sensorimotor / Involuntary Action 0 |
| 1/4/8 | Creature / Sensorimotor / Gait 0 |
| 1/2/0 | Creature / Reproductive / Ovulate |
| 1/1/0 | Creature / Circulatory / Floating locus 0 |
| 2/0/0 | Organ / ClockRate |

### Decoding Example: "1/4/0"

- **1** = `ORGAN_CREATURE` (the creature itself)
- **4** = `TISSUE_SENSORIMOTOR` (sensors and motors)
- **0** = `LOC_INVOLUNTARY0` (first involuntary action locus)

Result: **Creature's Sensorimotor tissue, Involuntary Action 0**

### Locus Reference Implementation (Creature.js lines 287-307)
Locus references are dynamic getter/setter objects:
```javascript
{
    container: array,
    index: index,
    get value() { return this.container[this.index]; },
    set value(v) { this.container[this.index] = v; }
}
```

This hierarchical addressing allows receptors and emitters to target any variable in the creature's body - drives, gaits, organ settings, environmental sensors, etc.

### Locus Definition: Static, Not Dynamic

The locus system is **statically defined in code**, not loaded from configuration files or genome data. Each component provides its loci via hardcoded `getLocusAddress()` methods:

#### 1. Creature Loci (`Creature.js` lines 204-280)
Hardcoded switch statements providing:

| Tissue | Loci | Storage |
|--------|------|---------|
| TISSUE_CIRCULATORY | 32 floating loci (0-31) | `myFloatingLoci` array |
| TISSUE_SENSORIMOTOR | 16 gait loci + environmental sensors | `myGaitLoci` array + individual properties |
| TISSUE_DRIVES | 20 drive loci (0-19) | `myDriveLoci` array |
| TISSUE_SOMATIC | Muscles locus | `myMusclesLocus` property |

Environmental sensors (emitter-only):
- `myConstantLocus`, `myUpslopeLocus`, `myDownslopeLocus`, `myAirQualityLocus`, `myCrowdedLocus`

#### 2. Organ Loci (`Organ.js` lines 649-671)
Each physical organ provides its own internal loci:

| Type | Loci Available |
|------|----------------|
| Receptor | ClockRate, RateOfRepair, Injury |
| Emitter | ClockRate, RateOfRepair, LifeForce |

#### 3. Brain Loci (`Brain.js` lines 574-591)
Semi-dynamic based on genome-defined lobes:
- Tissue ID = Lobe ID (from genome)
- Locus = encoded as `(neuronId × 8) + stateVar`
- Provides access to individual neuron state variables

#### 4. Faculty Loci
Each faculty can provide custom loci via `getLocusAddress()`:
- Most faculties return `null` (no loci)
- Extensible for custom behavior

#### Resolution Order
When resolving a locus address, the system checks in order:
1. All faculties (including Brain)
2. Creature-specific loci
3. Returns invalid locus reference if not found

**Key Insight**: The constants in `BiochemistryConstants.js` define the **ID values** used in addresses, but the actual locus storage and resolution logic is hardcoded. Adding new loci requires code changes, not configuration.

---

## 6a. Floating Loci (General-Purpose Signal Buses)

**Floating loci** are **32 general-purpose signal buses** (loci 0-31) in the `TISSUE_CIRCULATORY` tissue that allow genome designers to create **custom chemical-to-chemical relationships** more complex than simple reactions can handle.

### Definition

The floating loci constants define the range:

```text
// circulatory
LOC_FLOATING_FIRST = 0     // These IDs are both receptor AND emitter loci.
                           // They allow a receptor to be attached directly to an emitter
                           // and therefore make one chemical respond to the
                           // existence or non-existence of another in a more
                           // complex way than Reactions can handle. For instance
LOC_FLOATING_LAST = 31     // "produce chem B when chem A exceeds threshold"
NUM_FLOATING_LOCI          // = 32
```

### Storage Structure

```text
myFloatingLoci[NUM_FLOATING_LOCI]  // 32 floating loci (indices 0-31)
```

### Shared Receptor/Emitter Architecture

Like involuntary and gait loci, floating loci use the **same shared memory** for both receptors and emitters:

```text
case TISSUE_CIRCULATORY:
    if locus >= LOC_FLOATING_FIRST and locus <= LOC_FLOATING_LAST:
        return myFloatingLoci[locus - LOC_FLOATING_FIRST]
    // Same address returned for both RECEPTOR and EMITTER types
```

### Purpose: Custom Chemical Relationships

Floating loci act as **signal buses** enabling complex conditional chemical relationships:

```
┌─────────────────────────────────────────────────────────────────┐
│           FLOATING LOCUS AS SIGNAL BUS                          │
│                                                                 │
│  Chemical A                     Floating Locus 0                │
│  (e.g. Toxin)                   (shared float)                  │
│       │                              │                          │
│       ▼                              │                          │
│  ┌─────────────┐                     │                          │
│  │  RECEPTOR   │  Threshold: 0.5     │                          │
│  │  monitors A │  ──────────────────►│                          │
│  │  Gain: 1.0  │  writes to locus    │                          │
│  └─────────────┘                     │                          │
│                                      │                          │
│                                      ▼                          │
│                              ┌─────────────┐                    │
│                              │   EMITTER   │  reads locus       │
│                              │   emits B   │◄─────────────────  │
│                              │  Gain: 0.5  │                    │
│                              └─────────────┘                    │
│                                      │                          │
│                                      ▼                          │
│                               Chemical B                        │
│                               (e.g. Antidote)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Why Not Just Use Reactions?

Reactions are limited to simple stoichiometry: `A + B → C + D`

Floating loci enable more complex behaviors that reactions cannot express:

| Behavior | Reaction Limitation | Floating Locus Solution |
|----------|---------------------|-------------------------|
| **Thresholded response** | Reactions always proceed proportionally | Receptor threshold blocks until chemical reaches level |
| **Non-linear gain** | Reactions are linear | Multiple receptors with different thresholds/gains |
| **Digital (on/off)** | Reactions are continuous | RE_DIGITAL flag for fixed output |
| **Inverted response** | Not possible | EM_INVERT flag to emit when source is LOW |
| **Conditional emission** | Not possible | Receptor writes 0 below threshold, emitter doesn't fire |

### Example Use Cases

#### 1. "Produce antidote when toxin exceeds threshold"

```
RECEPTOR GENE:
  Locus: 1/1/0 (Creature/Circulatory/Floating 0)
  Chemical: Glycotoxin (70)
  Threshold: 0.5
  Gain: 1.0
  → Only writes to locus when toxin > 0.5

EMITTER GENE:
  Locus: 1/1/0 (Creature/Circulatory/Floating 0)
  Chemical: Anti-oxidant (93)
  Threshold: 0.1
  Gain: 0.5
  → Emits antidote when locus > 0.1
```

#### 2. "Emit stress hormone when multiple drives are high"

```
RECEPTOR 1:
  Locus: 1/1/5 (Floating 5)
  Chemical: Pain (148)
  Threshold: 0.3, Gain: 0.5

RECEPTOR 2:
  Locus: 1/1/5 (Floating 5)
  Chemical: Fear (158)
  Threshold: 0.3, Gain: 0.5
  → Receptors in same organ are AVERAGED

EMITTER:
  Locus: 1/1/5 (Floating 5)
  Chemical: Adrenalin (117)
  → Emits based on averaged pain+fear signal
```

#### 3. "Inhibit reproduction when stressed"

```
RECEPTOR:
  Locus: 1/1/10 (Floating 10)
  Chemical: Stress (128)
  Threshold: 0.4, Gain: 1.0
  Flag: RE_REDUCE (subtracts from nominal)

EMITTER:
  Locus: 1/1/10 (Floating 10)
  Chemical: Oestrogen (46)
  Threshold: 0.0
  Flag: EM_INVERT
  → When stress HIGH, receptor reduces locus, inverted emitter produces LESS oestrogen
```

### Locus Addresses

| Address | Meaning |
|---------|---------|
| 1/1/0 | Creature / Circulatory / Floating Locus 0 |
| 1/1/1 | Creature / Circulatory / Floating Locus 1 |
| ... | ... |
| 1/1/31 | Creature / Circulatory / Floating Locus 31 |

### Floating Loci Summary

| Aspect | Description |
|--------|-------------|
| **What** | 32 general-purpose signal buses |
| **Location** | TISSUE_CIRCULATORY (ID 1), Loci 0-31 |
| **Storage** | `myFloatingLoci[32]` array in Creature |
| **Architecture** | Shared receptor/emitter (same as involuntary/gait) |
| **Purpose** | Complex chemical-to-chemical relationships beyond reactions |
| **Key advantage** | Thresholds, gains, digital mode, inversion - none possible with reactions |
| **Genome design** | Pair a receptor and emitter on same floating locus to create custom chemical logic |

Floating loci give genome designers flexibility to create sophisticated biochemical feedback loops without requiring code changes. They act as programmable "glue logic" between the fixed chemical reaction system and the behavioral outputs.

---

## 6b. Sensorimotor Loci (Involuntary Actions & Gaits)

The Sensorimotor tissue (`TISSUE_SENSORIMOTOR`, ID=4) contains specialized loci for controlling involuntary actions and gaits. These loci have a unique **shared memory architecture** where receptors and emitters access the same underlying value.

### Involuntary Action Loci (0-7)

There are 8 involuntary action loci controlling reflexes like flinching, sneezing, and fainting:

| Locus ID | Name | Script Event | Behavior |
|----------|------|--------------|----------|
| 0 | Involuntary 0 | 64 | Flinch |
| 1 | Involuntary 1 | 65 | Lay Egg |
| 2 | Involuntary 2 | 66 | Sneeze |
| 3 | Involuntary 3 | 67 | Cough |
| 4 | Involuntary 4 | 68 | Shiver |
| 5 | Involuntary 5 | 69 | Sleep |
| 6 | Involuntary 6 | 70 | Fainting |
| 7 | Involuntary 7 | 71 | Unassigned |

### Storage Structure

Each involuntary action is stored in `MotorFaculty.myInvoluntaryActions[]`:

```text
InvoluntaryAction {
    locus      // Receptor/emitter locus (recommendation strength)
    latency    // Counter to prevent instant reactivation
}
```

### Shared Locus Architecture

**Key Insight:** Receptors and emitters targeting the same involuntary locus **share the same memory location**.

```
┌─────────────────────────────────────────────────────────────────┐
│              myInvoluntaryActions[0].locus                      │
│                    (single float value)                         │
└─────────────────────────────────────────────────────────────────┘
        ▲                                           │
        │ WRITES                                    │ READS
        │                                           ▼
┌───────────────────┐                    ┌───────────────────────┐
│     RECEPTOR      │                    │       EMITTER         │
│  Locus: 1/4/0     │                    │  Locus: 1/4/14        │
│  (LOC_INVOLUNTARY0)│                   │  (LOC_E_INVOLUNTARY0) │
│                   │                    │                       │
│  Monitors:        │                    │  Emits:               │
│  Chemical X       │                    │  Chemical Y           │
│  (e.g. Histamine) │                    │  (e.g. Adrenalin)     │
└───────────────────┘                    └───────────────────────┘
```

The `GetLocusAddress()` function returns the same address for both receptor and emitter locus IDs:

```text
if tissue == TISSUE_SENSORIMOTOR:
    if type == RECEPTOR:
        if locus >= LOC_INVOLUNTARY0 and locus <= LOC_INVOLUNTARY7:
            return myInvoluntaryActions[locus - LOC_INVOLUNTARY0].locus
    else if type == EMITTER:
        if locus >= LOC_E_INVOLUNTARY0 and locus <= LOC_E_INVOLUNTARY7:
            return myInvoluntaryActions[locus - LOC_E_INVOLUNTARY0].locus
```

### Signal Flow: Receptor → Locus → Emitter

This shared architecture creates a signal bus pattern:

```
Step 1: RECEPTOR monitors a chemical
        ┌──────────────────────────────────────────┐
        │ Chemical: Histamine A (ID 73)            │
        │ Threshold: 0.5                           │
        │ Gain: 1.0                                │
        │ Target: Creature/Sensorimotor/Invol 2    │
        └──────────────────────────────────────────┘
                         │
                         │ When Histamine > 0.5:
                         │ signal = (histamine - 0.5) × 1.0
                         ▼
Step 2: Value written to shared LOCUS
        ┌──────────────────────────────────────────┐
        │ myInvoluntaryActions[2].locus = 0.3      │
        └──────────────────────────────────────────┘
                         │
                         │ Emitter reads this value
                         ▼
Step 3: EMITTER reads locus and emits chemical
        ┌──────────────────────────────────────────┐
        │ Source: Creature/Sensorimotor/Invol 2    │
        │ Threshold: 0.1                           │
        │ Gain: 0.5                                │
        │ Target Chemical: Adrenalin (ID 117)      │
        │                                          │
        │ Emission: (0.3 - 0.1) × 0.5 = 0.1        │
        └──────────────────────────────────────────┘
```

**Result:** Histamine A → Sneeze reflex strength → Adrenalin emission

### Where the Involuntary Signal Comes From

When you see an **emitter** on `Creature/Sensorimotor/Involuntary 0`, the signal it reads comes from **receptors** attached to that same locus. The receptors monitor chemicals and write their calculated signal to the shared locus value.

| Source | How Signal is Generated |
|--------|-------------------------|
| **Receptor on same locus** | Monitors chemical concentration, writes to locus when above threshold |
| **Multiple receptors** | Signals are combined (averaged within same organ) |
| **No receptors** | Locus remains at 0.0 (or previous value) |

### Winner-Takes-All Selection

The Motor Faculty uses winner-takes-all to select which involuntary action to execute:

```text
for i in 0 .. NUMINVOL:
    a = myInvoluntaryActions[i]
    if a.latency == 0:  // Not in cooldown
        if a.locus > strongestSoFar:
            strongestSoFar = a.locus
            strongestIndex = i
    else:
        a.latency--  // Count down cooldown

// Fire script event for strongest action
if strongestIndex >= 0:
    fireInvoluntaryEvent(SCRIPTINVOLUNTARY0 + strongestIndex)
```

### Typical Genome Pattern: Chemical → Reflex → Side Effect

A creature's genome typically defines paired receptor/emitter genes:

**Example: Sneezing from Histamine A**

```
RECEPTOR GENE:
  Organ: Brain Organ
  Locus: 1/4/2 (Creature/Sensorimotor/Involuntary 2 - Sneeze)
  Chemical: 73 (Histamine A)
  Threshold: 0.5
  Gain: 1.0
  → When histamine high, increases sneeze reflex strength

EMITTER GENE:
  Organ: Brain Organ
  Locus: 1/4/16 (Creature/Sensorimotor/Involuntary 2 - Sneeze, emitter ID)
  Chemical: 117 (Adrenalin)
  Threshold: 0.2
  Gain: 0.3
  → When sneezing, releases adrenalin
```

This creates the chain: **Bacteria → Histamine A → Sneeze Reflex → Adrenalin Release**

### Gait Loci (8-24)

A **gait** is a walking animation sequence defined by a series of poses. Each creature can have up to **16 different gaits** (Gait 0-15), representing different ways of moving (normal walk, drunk stagger, tired plod, injured limp, etc.).

#### Gait Storage Structure

```text
MAX_GAITS = 16

myGaitTable[MAX_GAITS][MAX_SKELETON_ANIMATION_STRING_LENGTH]
// Animation strings like "013014015016R" (poses 13,14,15,16 repeating)

myGaitLoci[MAX_GAITS]  // Receptor/emitter loci for gait selection
```

Each gait animation string contains:
- Up to **8 pose numbers** (3 digits each, e.g., "013" = pose 13)
- An **"R" suffix** indicating the animation should loop/repeat

#### Examples of Gaits

| Gait | Typical Use | Triggered By |
|------|-------------|--------------|
| **Gait 0** | Normal walk | Default (no chemical trigger) |
| **Gait 1** | Drunk/stagger | High Alcohol (chem 75) |
| **Gait 2** | Tired walk | High Tiredness (chem 154) |
| **Gait 3** | Limp | High Injury (chem 127) |
| **Gait 4** | Run/hurry | High Adrenalin (chem 117) |
| **Gait 5-15** | Custom | Genome-defined |

#### Gait Selection: Winner-Takes-All

Like involuntary actions, gaits use winner-takes-all selection based on locus values:

```text
Skeleton.Walk():
    Strength = 0.0
    Choice = 0  // Default to gait[0]

    for i in 0 .. MAX_GAITS:
        if myGaitTable[i][0]:           // If gait is defined
            if myGaitLoci[i] > Strength: // And has strongest signal
                Strength = myGaitLoci[i]
                Choice = i

    SetAnimationString(myGaitTable[Choice])  // Use strongest gait
```

#### Chemical Control via Receptors

Gaits are controlled by receptors that write to gait loci based on chemical levels:

```
┌─────────────────────────────────────────────────────────────────┐
│                    BIOCHEMISTRY → GAIT FLOW                     │
│                                                                 │
│  Chemical Level                                                 │
│  (e.g. Alcohol = 0.7)                                          │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │    RECEPTOR     │  Monitors: Alcohol (chem 75)              │
│  │  Threshold: 0.3 │  Target: Gait 1 locus                     │
│  │  Gain: 1.0      │  Signal: (0.7 - 0.3) × 1.0 = 0.4          │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │  myGaitLoci[1]  │  Value: 0.4                               │
│  │  (Gait 1 locus) │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Winner-Takes-All│  Gait 0: 0.0, Gait 1: 0.4, Gait 2: 0.1   │
│  │   Selection     │  → Gait 1 wins (strongest)                │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ SetAnimation    │  myGaitTable[1] = "045046047048R"         │
│  │ (drunk stagger) │  → Creature staggers                      │
│  └─────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

#### Genome Definition (GAIT Genes)

Gait genes (`G_GAIT`) define which poses make up each gait animation:

```
GAIT GENE:
  Gait Number: 1 (drunk gait)
  Pose Sequence: [45, 46, 47, 48, 0, 0, 0, 0]  (0 = end of sequence)
  → Animation string: "045046047048R"
```

The genome reader:
```text
while g2.GetGeneType(CREATUREGENE, G_GAIT, NUMCREATURESUBTYPES):
    j = g2.GetCodon(0, MAX_GAITS-1)  // Which gait to define (0-15)
    for i in 0 .. 8:
        c = g2.GetCodon(0, MAX_POSES-1)  // Get pose number
        if c:
            // Store as 3-digit string: "045"
            myGaitTable[j][base] = (c/100) + '0'
            myGaitTable[j][base+1] = ((c/10)%10) + '0'
            myGaitTable[j][base+2] = (c%10) + '0'
        else:
            break  // 0 = end of animation
    myGaitTable[j][base] = 'R'  // Add repeat marker
```

#### Shared Locus Architecture (Same as Involuntary)

Gaits use the same shared receptor/emitter architecture as involuntary actions:

```text
case TISSUE_SENSORIMOTOR:
    if type == RECEPTOR:
        if locus >= LOC_GAIT0 and locus <= LOC_GAIT15:
            return myGaitLoci[locus - LOC_GAIT0]
    else if type == EMITTER:
        if locus >= LOC_E_GAIT0 and locus <= LOC_E_GAIT15:
            return myGaitLoci[locus - LOC_E_GAIT0]
```

This allows:
- **Receptors** to write gait strength based on chemicals (e.g., alcohol → drunk gait)
- **Emitters** to emit chemicals when a gait is active (e.g., running → emit activase)

#### Gait Summary

| Aspect | Description |
|--------|-------------|
| **What** | Walking animation sequence (series of poses) |
| **How many** | 16 gaits per creature (0-15) |
| **Storage** | `myGaitTable[]` (animation strings), `myGaitLoci[]` (signal strength) |
| **Selection** | Winner-takes-all based on gait loci values |
| **Default** | Gait 0 when no other gait has a signal |
| **Definition** | GAIT genes in genome define pose sequences |
| **Control** | Receptors monitor chemicals → write to gait loci |
| **Purpose** | Visual expression of internal state (drunk, tired, injured, etc.) |

### Locus Address Summary

| Locus Address | Receptor ID | Emitter ID | Purpose |
|---------------|-------------|------------|---------|
| 1/4/0 | LOC_INVOLUNTARY0 (0) | LOC_E_INVOLUNTARY0 (14) | Flinch |
| 1/4/1 | LOC_INVOLUNTARY1 (1) | LOC_E_INVOLUNTARY1 (15) | Lay Egg |
| 1/4/2 | LOC_INVOLUNTARY2 (2) | LOC_E_INVOLUNTARY2 (16) | Sneeze |
| 1/4/3 | LOC_INVOLUNTARY3 (3) | LOC_E_INVOLUNTARY3 (17) | Cough |
| 1/4/4 | LOC_INVOLUNTARY4 (4) | LOC_E_INVOLUNTARY4 (18) | Shiver |
| 1/4/5 | LOC_INVOLUNTARY5 (5) | LOC_E_INVOLUNTARY5 (19) | Sleep |
| 1/4/6 | LOC_INVOLUNTARY6 (6) | LOC_E_INVOLUNTARY6 (20) | Fainting |
| 1/4/7 | LOC_INVOLUNTARY7 (7) | LOC_E_INVOLUNTARY7 (21) | Unassigned |
| 1/4/8+ | LOC_GAIT0+ (8+) | LOC_E_GAIT0+ (22+) | Gaits |

---

## 6c. Complete Locus Destination Reference

This section consolidates every locus destination in the system into a single reference. When a chemical triggers a **receptor**, the receptor writes its signal to one of these loci. When an **emitter** reads a locus, it reads from the same set.

### Master Locus Table by Organ/Tissue

#### Organ 0: Brain (`ORGAN_BRAIN`)

| Tissue | Locus | Receptor | Emitter | Description |
|--------|-------|----------|---------|-------------|
| Lobe ID (from genome) | `(neuronId × 8) + stateVar` | Yes | Yes | Direct access to individual neuron state variables within genome-defined brain lobes |

Brain loci are semi-dynamic: the tissue ID corresponds to a lobe defined in the genome, and the locus encodes both the neuron index and which state variable to access.

#### Organ 1: Creature (`ORGAN_CREATURE`)

##### Tissue 0: Somatic (`TISSUE_SOMATIC`)

| Locus ID | Constant | Receptor | Emitter | Storage | Description |
|----------|----------|----------|---------|---------|-------------|
| 0 | `LOC_AGE0` | Yes | — | `LifeFaculty.myAgeingLoci[0]` | If on and currently BABY → become CHILD |
| 1 | `LOC_AGE1` | Yes | — | `LifeFaculty.myAgeingLoci[1]` | If on and currently CHILD → become ADOLESCENT |
| 2 | `LOC_AGE2` | Yes | — | `LifeFaculty.myAgeingLoci[2]` | ADOLESCENT → YOUTH |
| 3 | `LOC_AGE3` | Yes | — | `LifeFaculty.myAgeingLoci[3]` | YOUTH → ADULT |
| 4 | `LOC_AGE4` | Yes | — | `LifeFaculty.myAgeingLoci[4]` | ADULT → OLD |
| 5 | `LOC_AGE5` | Yes | — | `LifeFaculty.myAgeingLoci[5]` | OLD → SENILE |
| 6 | `LOC_AGE6` | Yes | — | `LifeFaculty.myAgeingLoci[6]` | If on → DIE of old age |
| 0 | `LOC_MUSCLES` | — | Yes | `Creature.myMusclesLocus` | Energy expended on movement this tick |

Note: Age loci are receptor-only (chemistry triggers aging). Muscles locus is emitter-only (movement energy → chemistry).

##### Tissue 1: Circulatory (`TISSUE_CIRCULATORY`) — Floating Loci

| Locus ID | Constant | Receptor | Emitter | Storage | Description |
|----------|----------|----------|---------|---------|-------------|
| 0 | `LOC_FLOATING_FIRST` | Yes | Yes | `Creature.myFloatingLoci[0]` | General-purpose signal bus 0 |
| 1 | | Yes | Yes | `Creature.myFloatingLoci[1]` | General-purpose signal bus 1 |
| ... | | Yes | Yes | `Creature.myFloatingLoci[...]` | ... |
| 31 | `LOC_FLOATING_LAST` | Yes | Yes | `Creature.myFloatingLoci[31]` | General-purpose signal bus 31 |

All 32 floating loci are **shared** — receptors and emitters target the same memory. See [Section 6a](#6a-floating-loci-general-purpose-signal-buses) for detailed usage.

##### Tissue 2: Reproductive (`TISSUE_REPRODUCTIVE`)

| Locus ID | Constant | Receptor | Emitter | Storage | Description |
|----------|----------|----------|---------|---------|-------------|
| 0 (R) | `LOC_OVULATE` | Yes | — | `ReproductiveFaculty.myOvulateLocus` | If low, remove gamete; if high, add one |
| 1 (R) | `LOC_RECEPTIVE` | Yes | — | `ReproductiveFaculty.myReceptiveLocus` | If >0, female accepts incoming sperm |
| 2 (R) | `LOC_CHANCEOFMUTATION` | Yes | — | `ReproductiveFaculty.myChanceOfMutationLocus` | Mutation probability |
| 3 (R) | `LOC_DEGREEOFMUTATION` | Yes | — | `ReproductiveFaculty.myDegreeOfMutationLocus` | Mutation magnitude |
| 0 (E) | `LOC_FERTILE` | — | Yes | `ReproductiveFaculty.myFertileLocus` | 1.0 if gamete available |
| 1 (E) | `LOC_PREGNANT` | — | Yes | `ReproductiveFaculty.myPregnancyLocus` | 1.0 if pregnant |
| 2 (E) | `LOC_E_OVULATE` | — | Yes | `ReproductiveFaculty.myOvulateLocus` | Ovulation status (shared with receptor) |
| 3 (E) | `LOC_E_RECEPTIVE` | — | Yes | `ReproductiveFaculty.myReceptiveLocus` | Receptiveness (shared with receptor) |
| 4 (E) | `LOC_E_CHANCEOFMUTATION` | — | Yes | `ReproductiveFaculty.myChanceOfMutationLocus` | Mutation chance (shared with receptor) |
| 5 (E) | `LOC_E_DEGREEOFMUTATION` | — | Yes | `ReproductiveFaculty.myDegreeOfMutationLocus` | Mutation degree (shared with receptor) |

Note: `LOC_OVULATE`/`LOC_E_OVULATE`, `LOC_RECEPTIVE`/`LOC_E_RECEPTIVE`, `LOC_CHANCEOFMUTATION`/`LOC_E_CHANCEOFMUTATION`, and `LOC_DEGREEOFMUTATION`/`LOC_E_DEGREEOFMUTATION` share the same underlying storage. `LOC_FERTILE` and `LOC_PREGNANT` are emitter-only (read by emitters to produce hormones).

##### Tissue 3: Immune (`TISSUE_IMMUNE`)

| Locus ID | Constant | Receptor | Emitter | Storage | Description |
|----------|----------|----------|---------|---------|-------------|
| 0 (R) | `LOC_DIE` | Yes | — | `LifeFaculty.myDeathTriggerLocus` | If on → creature dies (poison, starvation, etc.) |
| 0 (E) | `LOC_DEAD` | — | Yes | `LifeFaculty` (static float) | >0 if creature is dead (allows post-mortem chemistry) |

##### Tissue 4: Sensorimotor (`TISSUE_SENSORIMOTOR`)

**Receptor loci** (chemistry → creature state):

| Locus ID | Constant | Storage | Description |
|----------|----------|---------|-------------|
| 0 | `LOC_INVOLUNTARY0` | `MotorFaculty.myInvoluntaryActions[0].locus` | Flinch reflex strength |
| 1 | `LOC_INVOLUNTARY1` | `MotorFaculty.myInvoluntaryActions[1].locus` | Lay Egg reflex strength |
| 2 | `LOC_INVOLUNTARY2` | `MotorFaculty.myInvoluntaryActions[2].locus` | Sneeze reflex strength |
| 3 | `LOC_INVOLUNTARY3` | `MotorFaculty.myInvoluntaryActions[3].locus` | Cough reflex strength |
| 4 | `LOC_INVOLUNTARY4` | `MotorFaculty.myInvoluntaryActions[4].locus` | Shiver reflex strength |
| 5 | `LOC_INVOLUNTARY5` | `MotorFaculty.myInvoluntaryActions[5].locus` | Sleep reflex strength |
| 6 | `LOC_INVOLUNTARY6` | `MotorFaculty.myInvoluntaryActions[6].locus` | Fainting reflex strength |
| 7 | `LOC_INVOLUNTARY7` | `MotorFaculty.myInvoluntaryActions[7].locus` | Unassigned |
| 8 | `LOC_GAIT0` | `Creature.myGaitLoci[0]` | Normal walk gait strength |
| 9-23 | `LOC_GAIT1`–`LOC_GAIT15` | `Creature.myGaitLoci[1-15]` | Custom gait strengths |

**Emitter loci** (creature state → chemistry):

| Locus ID | Constant | Storage | Description |
|----------|----------|---------|-------------|
| 0 | `LOC_CONST` | `Creature.myConstantLocus` | Always 1.0 (for regular emitters / gene testing) |
| 1 | `LOC_ASLEEP` | `LifeFaculty.myAsleepLocus` | 1.0 if asleep, else 0 |
| 2 | `LOC_COLDNESS` | *(environmental sensor)* | How far air temp is below blood temp |
| 3 | `LOC_HOTNESS` | *(environmental sensor)* | How far air temp is above blood temp |
| 4 | `LOC_LIGHTLEVEL` | *(environmental sensor)* | Sky brightness level |
| 5 | `LOC_CROWDEDNESS` | `Creature.myCrowdedLocus` | Number and proximity of conspecifics |
| 6 | `LOC_RADIATION` | *(environmental sensor)* | Radiation level in current room |
| 7 | `LOC_TIMEOFDAY` | *(environmental sensor)* | Current time of day |
| 8 | `LOC_SEASON` | *(environmental sensor)* | Current season |
| 9 | `LOC_AIRQUALITY` | `Creature.myAirQualityLocus` | Breathability of air |
| 10 | `LOC_UPSLOPE` | `Creature.myUpslopeLocus` | Slope steepness going up |
| 11 | `LOC_DOWNSLOPE` | `Creature.myDownslopeLocus` | Slope steepness going down |
| 12 | `LOC_HEADWIND` | *(environmental sensor)* | Wind speed coming toward creature |
| 13 | `LOC_TAILWIND` | *(environmental sensor)* | Wind speed from behind creature |
| 14-21 | `LOC_E_INVOLUNTARY0`–`LOC_E_INVOLUNTARY7` | `MotorFaculty.myInvoluntaryActions[0-7].locus` | Shared with receptor involuntary loci |
| 22-37 | `LOC_E_GAIT0`–`LOC_E_GAIT15` | `Creature.myGaitLoci[0-15]` | Shared with receptor gait loci |

Note: Only `LOC_CONST`, `LOC_ASLEEP`, `LOC_CROWDEDNESS`, `LOC_AIRQUALITY`, `LOC_UPSLOPE`, and `LOC_DOWNSLOPE` are resolved by the `GetLocusAddress()` switch. The other environmental sensors (`LOC_COLDNESS`, `LOC_HOTNESS`, `LOC_LIGHTLEVEL`, `LOC_RADIATION`, `LOC_TIMEOFDAY`, `LOC_SEASON`, `LOC_HEADWIND`, `LOC_TAILWIND`) are defined as constants but their `GetLocusAddress()` handling depends on faculty implementations that may update them via other mechanisms.

##### Tissue 5: Drives (`TISSUE_DRIVES`)

| Locus ID | Constant | Receptor | Emitter | Storage | Drive Name |
|----------|----------|----------|---------|---------|------------|
| 0 | `LOC_DRIVE0` | Yes | Yes | `Creature.myDriveLoci[0]` | Pain |
| 1 | `LOC_DRIVE1` | Yes | Yes | `Creature.myDriveLoci[1]` | Hunger for Protein |
| 2 | `LOC_DRIVE2` | Yes | Yes | `Creature.myDriveLoci[2]` | Hunger for Carbohydrate |
| 3 | `LOC_DRIVE3` | Yes | Yes | `Creature.myDriveLoci[3]` | Hunger for Fat |
| 4 | `LOC_DRIVE4` | Yes | Yes | `Creature.myDriveLoci[4]` | Coldness |
| 5 | `LOC_DRIVE5` | Yes | Yes | `Creature.myDriveLoci[5]` | Hotness |
| 6 | `LOC_DRIVE6` | Yes | Yes | `Creature.myDriveLoci[6]` | Tiredness |
| 7 | `LOC_DRIVE7` | Yes | Yes | `Creature.myDriveLoci[7]` | Sleepiness |
| 8 | `LOC_DRIVE8` | Yes | Yes | `Creature.myDriveLoci[8]` | Loneliness |
| 9 | `LOC_DRIVE9` | Yes | Yes | `Creature.myDriveLoci[9]` | Crowdedness |
| 10 | `LOC_DRIVE10` | Yes | Yes | `Creature.myDriveLoci[10]` | Fear |
| 11 | `LOC_DRIVE11` | Yes | Yes | `Creature.myDriveLoci[11]` | Boredom |
| 12 | `LOC_DRIVE12` | Yes | Yes | `Creature.myDriveLoci[12]` | Anger |
| 13 | `LOC_DRIVE13` | Yes | Yes | `Creature.myDriveLoci[13]` | Sex Drive |
| 14 | `LOC_DRIVE14` | Yes | Yes | `Creature.myDriveLoci[14]` | Comfort |
| 15 | `LOC_DRIVE15` | Yes | Yes | `Creature.myDriveLoci[15]` | Up |
| 16 | `LOC_DRIVE16` | Yes | Yes | `Creature.myDriveLoci[16]` | Down |
| 17 | `LOC_DRIVE17` | Yes | Yes | `Creature.myDriveLoci[17]` | Exit |
| 18 | `LOC_DRIVE18` | Yes | Yes | `Creature.myDriveLoci[18]` | Enter |
| 19 | `LOC_DRIVE19` | Yes | Yes | `Creature.myDriveLoci[19]` | Wait |

All 20 drive loci are **shared** — receptors write drive levels from chemical concentrations, emitters read drive levels back into chemistry. Drive data is also transferred to the brain's DRIVE_LOBE before brain updates.

#### Organ 2: Physical Organ (`ORGAN_ORGAN`)

Each physical organ in the biochemistry has its own internal loci:

| Locus ID | Constant | Receptor | Emitter | Storage | Description |
|----------|----------|----------|---------|---------|-------------|
| 0 | `RLOCUS_CLOCKRATE` / `ELOCUS_CLOCKRATE` | Yes | Yes | `Organ.loc_ClockRate` | Organ tick rate (shared) |
| 1 | `RLOCUS_RATEOFREPAIR` / `ELOCUS_RATEOFREPAIR` | Yes | Yes | `Organ.loc_LongTermRateOfRepair` | Healing speed (shared) |
| 2 (R) | `RLOCUS_INJURY` | Yes | — | `Organ.loc_InjuryToApply` | Incoming injury amount |
| 2 (E) | `ELOCUS_LIFEFORCE` | — | Yes | `Organ.loc_LifeForce` | Current organ health (0.0–1.0) |

ClockRate and RateOfRepair are shared between receptor and emitter (same memory). Injury is receptor-only, LifeForce is emitter-only.

#### Organ 3: Reaction (`ORGAN_REACTION`)

| Tissue | Locus | Receptor | Emitter | Storage | Description |
|--------|-------|----------|---------|---------|-------------|
| Reaction index (0–127) | 0 (Rate) | Yes | No | `Organ.myReactions[tissue].Rate` | Enzyme mechanism: receptors write to a reaction's rate, dynamically modulating speed based on chemical concentrations. IDTissue is overwritten during gene reading to `thisReactionNo`. Resolved internally — receptors can only target reactions within their own organ. See [Reaction Rate Loci](#reaction-rate-loci-chemical-control-of-reaction-speed-enzyme-mechanism) for full details. |

### Signal Flow Summary

```
                    ┌──────────────────────────────────────────────────────────┐
                    │                  LOCUS DESTINATIONS                       │
                    │                                                          │
  CHEMICALS ──→ RECEPTORS write to:                                           │
                    │                                                          │
                    │  ORGAN_BRAIN (0)                                         │
                    │    └─ Neuron states in brain lobes                       │
                    │                                                          │
                    │  ORGAN_CREATURE (1)                                      │
                    │    ├─ Somatic:        7 age loci (receptor-only)         │
                    │    ├─ Circulatory:    32 floating loci (shared)          │
                    │    ├─ Reproductive:   4 loci (ovulate, receptive, mut.)  │
                    │    ├─ Immune:         1 death trigger (receptor-only)    │
                    │    ├─ Sensorimotor:   8 involuntary + 16 gaits (shared) │
                    │    └─ Drives:         20 drive loci (shared)            │
                    │                                                          │
                    │  ORGAN_ORGAN (2)                                         │
                    │    └─ ClockRate, RateOfRepair, Injury                    │
                    │                                                          │
                    │  ORGAN_REACTION (3)                                      │
                    │    └─ Reaction Rate                                      │
                    │                                                          │
                    │                          │                               │
                    │                          ▼                               │
                    │                                                          │
                    │  EMITTERS read from:                                     │
                    │    ├─ Shared loci (drives, floating, gaits, involuntary) │
                    │    ├─ Environmental sensors (14 read-only loci)          │
                    │    ├─ Muscles, Fertile, Pregnant, Dead                   │
                    │    └─ Organ ClockRate, RateOfRepair, LifeForce          │
                    │                                                          │
                    │                          │                               │
                    │                          ▼                               │
                    │                      CHEMICALS                           │
                    └──────────────────────────────────────────────────────────┘
```

### Resolution Order

When `GetLocusAddress()` is called, the system checks in this order:

1. **All faculties** (LifeFaculty, MotorFaculty, ReproductiveFaculty, Brain) — each faculty handles its own loci
2. **Creature-level loci** (floating, gaits, drives, muscles, environmental sensors) — handled by `Creature.GetLocusAddress()`
3. **Returns invalid locus** if no match found

This means faculties have priority: MotorFaculty handles involuntary action loci before Creature's general switch statement is reached.

### Quick Lookup: Locus Address → Destination

| Address | Meaning | Shared? |
|---------|---------|---------|
| `0/lobeId/neuronEncoded` | Brain neuron state | No |
| `1/0/0–6` | Somatic / Age 0–6 | No (receptor-only) |
| `1/0/0` (emitter) | Somatic / Muscles | No (emitter-only) |
| `1/1/0–31` | Circulatory / Floating 0–31 | Yes |
| `1/2/0–3` (receptor) | Reproductive / Ovulate, Receptive, Mutation | Partially (ovulate/receptive shared with emitter 2-3) |
| `1/2/0–5` (emitter) | Reproductive / Fertile, Pregnant, Ovulate, Receptive, Mutation | See above |
| `1/3/0` (receptor) | Immune / Die trigger | No |
| `1/3/0` (emitter) | Immune / Dead flag | No |
| `1/4/0–7` (receptor) | Sensorimotor / Involuntary 0–7 | Yes (shared with emitter 14–21) |
| `1/4/8–23` (receptor) | Sensorimotor / Gait 0–15 | Yes (shared with emitter 22–37) |
| `1/4/0–13` (emitter) | Sensorimotor / Environmental sensors | No (emitter-only) |
| `1/4/14–21` (emitter) | Sensorimotor / Involuntary 0–7 | Yes (shared with receptor 0–7) |
| `1/4/22–37` (emitter) | Sensorimotor / Gait 0–15 | Yes (shared with receptor 8–23) |
| `1/5/0–19` | Drives / Pain through Wait | Yes |
| `2/*/0` | Organ / ClockRate | Yes |
| `2/*/1` | Organ / RateOfRepair or Injury | Receptor: Injury; Emitter: RateOfRepair (shared with receptor 1) |
| `2/*/2` | Organ / Injury (R) or LifeForce (E) | No |
| `3/reactionIdx/*` | Reaction / Rate | No (receptor-only) |

---

## 7. Emitters (Loci → Chemistry)

**File:** `Main_Game/src/engine/creature/biochemistry/Emitter.js` (lines 56-101)

### Structure (lines 9-26)
```javascript
// Source identification
IDOrgan, IDTissue, IDLocus     // Source locus location
Chem                           // Chemical to emit (0 = none)

// Emission parameters
Threshold                       // Minimum locus value to respond
Gain                           // Production rate
Effect                         // Flags (EM_REMOVE, EM_DIGITAL, EM_INVERT)

// Sampling system
bioTickRate                     // Ticks between samples
bioTick                         // Tick counter

// Runtime binding
Source                          // Locus reference object
```

### Emitter Decision Logic

An emitter produces a chemical only when **all** of the following conditions are met:

#### Decision Flow

```
┌─────────────────┐
│  Source Locus   │  Read the locus value (e.g., 0.7)
│   (e.g. 0.7)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 1. Apply Invert │  If EM_INVERT flag set: value = 1.0 - value
│   (EM_INVERT?)  │  Example: 0.7 → 0.3
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Timing Check │  bioTick += bioTickRate
│   (bioTick)     │  Fire only when bioTick > 1.0
└────────┬────────┘  Then: bioTick -= 1.0 (keep remainder)
         │
         │ bioTick > 1.0?
         ▼
┌─────────────────┐
│ 3. Signal > 0?  │  The (possibly inverted) signal must be non-zero
└────────┬────────┘
         │
         │ Yes
         ▼
┌─────────────────┐
│ 4. Above        │  Signal must exceed threshold
│   Threshold?    │  conc = signal - threshold
└────────┬────────┘
         │
         │ conc > 0?
         ▼
┌─────────────────────────────────┐
│ 5. Calculate Emission Amount    │
│                                 │
│  Digital mode (EM_DIGITAL):     │
│    amount = Gain                │
│    (fixed output)               │
│                                 │
│  Analog mode (default):         │
│    amount = conc × Gain         │
│    (proportional to signal)     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ 6. ADD to       │  chemicals[Chem] += amount
│   Chemical      │  (bounded to 0.0-1.0)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Clear Source │  If EM_REMOVE flag set:
│   (EM_REMOVE?)  │  Source.value = 0
└─────────────────┘
```

#### Timing System (bioTick)

The emitter uses float accumulation for precise timing:

```javascript
// Each update cycle:
bioTick += bioTickRate;     // Accumulate (e.g., 0.0 → 0.5 → 1.0 → 1.5)

if (bioTick > 1.0) {
    bioTick -= 1.0;         // Keep remainder (1.5 → 0.5)
    // ... process emission
}
```

| bioTickRate | Behavior |
|-------------|----------|
| 1.0 | Emit every update cycle |
| 0.5 | Emit every 2 update cycles |
| 2.0 | Emit twice per update cycle |
| 0.33 | Emit every ~3 update cycles |

#### Output Modes

| Mode | Condition | Formula | Use Case |
|------|-----------|---------|----------|
| **Analog** | Default | `(signal - threshold) × gain` | Proportional response (hunger scales with nutrient depletion) |
| **Digital** | `EM_DIGITAL` flag | `gain` (fixed) | Binary trigger (on/off signals) |

### Effect Flags
| Flag | Value | Behavior |
|------|-------|----------|
| EM_DIGITAL | 1 | Fixed output instead of proportional |
| EM_INVERT | 2 | Invert the locus value before processing |
| EM_REMOVE | 4 | Clear source locus after emission |

### Example: How "Hunger for Protein" Increases

The **EM_INVERT** flag enables an elegant pattern for generating hunger signals when nutrients are depleted:

**Setup:**
```
Source: Amino Acid level (nutrient locus)
Target: Hunger for protein (chemical #149)
Flag: EM_INVERT = true
```

**When Amino Acid is HIGH (creature is well-fed):**
```
Locus value = 0.8 (high)
EM_INVERT flips it: 1.0 - 0.8 = 0.2
0.2 is below threshold → No hunger emitted
```

**When Amino Acid is LOW (creature is hungry):**
```
Locus value = 0.2 (low)
EM_INVERT flips it: 1.0 - 0.2 = 0.8
0.8 is above threshold → Hunger chemical emitted!
```

**Complete flow:**
```
Low Amino Acid → EM_INVERT → High inverted value → Emitter fires
                                                        ↓
                                            Hunger for protein chemical ↑
                                                        ↓
                                            Receptor detects chemical
                                                        ↓
                                            Hunger Drive ↑
                                                        ↓
                                            Creature seeks food
```

This design eliminates the need for explicit "hunger detection" logic - the biochemistry naturally creates hunger signals when nutrients are depleted through the inverted emitter pattern.

### Key Difference: Emitters ADD, Receptors COMBINE then OVERWRITE

A critical architectural difference between emitters and receptors:

| Component | Operation | Code Reference | Implication |
|-----------|-----------|----------------|-------------|
| **Emitters** | **ADD** to chemicals | `chemicals[Chem] += amount` | Multiple emitters all contribute additively to their target chemicals |
| **Receptors** | **COMBINE within organ, OVERWRITE across organs** | `Organ.js:204-285` | Two-level behavior (see below) |

#### Emitter Behavior (Additive)

All emitters contribute additively to their target chemicals:

```
Organ #0 emitter: reads Pain locus → emits +0.2 to Chemical 100
Organ #1 emitter: reads Pain locus → emits +0.3 to Chemical 101
Organ #2 emitter: reads Pain locus → emits +0.1 to Chemical 100
→ Chemical 100 gets +0.3 total (0.2 + 0.1)
→ Chemical 101 gets +0.3
→ All emitters contribute
```

#### Receptor Behavior (Two-Level)

Receptors have two distinct behaviors depending on scope:

**1. Within a Single Organ - Receptors are COMBINED (Averaged)**

When multiple receptors **within the same organ** target the same locus, they are grouped and their signals are averaged before writing:

```
Organ #0 has 2 receptors for Pain locus:
  - Receptor A: monitors Chem 100, Nominal=0.0, Gain=1.0 → signal 0.3
  - Receptor B: monitors Chem 101, Nominal=0.0, Gain=1.0 → signal 0.5
  → Combined result: avg(0.3, 0.5) = 0.4 written to Pain
```

The combination formula (matching the original engine):
```
result = avg(nominals) + avg(add_signals) - avg(reduce_signals)
```

Where:
- `nominals` = base output values from each receptor
- `add_signals` = signal contributions from receptors without RE_REDUCE flag
- `reduce_signals` = signal contributions from receptors with RE_REDUCE flag

**2. Across Different Organs - Last Organ OVERWRITES**

Organs are processed sequentially (Organ #0, #1, #2, ...). Each organ writes its combined result to the locus, **overwriting** the previous organ's value:

```
Organ #0 receptors for Pain: combined result = 0.4 → writes to Pain
Organ #1 receptors for Pain: combined result = 0.7 → overwrites Pain
→ Final Pain locus = 0.7 (Organ #1's result wins)
→ Organ #0's work is lost
```

#### Summary Table

| Scenario | Behavior | Formula |
|----------|----------|---------|
| Multiple receptors **within same organ** targeting same locus | **COMBINED** (averaged) | `avg(nominals) + avg(adds) - avg(subs)` |
| Multiple receptors **across different organs** targeting same locus | **OVERWRITTEN** (last organ wins) | Last organ's combined result |

This is why the Locus Map debugger shows "ACTIVE" and "OVERWRITTEN" badges for organ receptor groups:
- **ACTIVE**: Highest organ index (last to write) - its value is the effective locus value
- **OVERWRITTEN**: Lower organ indices - their values were replaced by later organs

---

## 7b. NeuroEmitters (Brain → Chemistry)

**File:** `Main_Game/src/engine/creature/biochemistry/NeuroEmitter.js` (lines 39-65)

### Structure (lines 9-30)
```javascript
// Neuronal inputs (3 neurons from brain)
myNeuronalInputs[3]            // Neuron locus references
myNeuronAddresses[3]           // Addressing info

// Chemical emissions (4 chemicals)
myChemicalEmissions[4]         // { chemicalId, amount }

// Timing
bioTickRate                     // Sampling frequency
bioTick                         // Accumulator
```

### Algorithm
```
1. Accumulate bioTick += bioTickRate
2. When bioTick > 1.0:
   - Reset bioTick -= 1.0
   - Multiply all 3 neuron activations:
     product = neuron[0] × neuron[1] × neuron[2]
   - Emit 4 chemicals based on product:
     chemicals[chemicalId] += amount × product
```

### Purpose
NeuroEmitters allow brain activity to directly influence chemistry:
- Decision neurons from prefrontal lobe
- Emotional responses (reward/punishment chemicals)
- Creates brain → chemistry feedback

---

## 8. Stimuli (External Events → Biochemistry)

**Files:**
- `Main_Game/src/engine/creature/perception/Stimulus.js` - Core stimulus data structure
- `Main_Game/src/engine/creature/perception/StimulusLibrary.js` - Collection of 256 stimuli per creature
- `Main_Game/src/engine/creature/perception/PerceptionConstants.js` - Built-in stimuli definitions

### What Are Stimuli?

**Stimuli** are predefined sensory/behavioral response packages that translate external events (touch, eating, hearing speech) into creature reactions. Each creature has a library of **256 personal stimuli** defined by their genome.

Unlike receptors and emitters which operate on continuous chemical concentrations, stimuli are **discrete events** that can:
1. Instantly adjust chemical levels (SWAY)
2. Influence brain decisions (URGE)
3. Enable language learning (ORDR)

### Stimulus Structure

Each stimulus contains three main components:

#### 1. SWAY (Chemical Adjustments)
```javascript
chemicalsToAdjust[4]    // IDs of up to 4 chemicals to modify (already converted to biochem IDs)
adjustments[4]          // Adjustment magnitudes (-1.0 to +1.0)
```
Directly modifies creature biochemistry when the stimulus fires.

#### 2. URGE (Behavioral Nudges)
```javascript
nounStim                // Influence on object attention (0.0-1.0, or >1.0 to force)
verbIdToStim            // Target verb/action ID (0-254, or -1 if unused)
// Note: verbStim is unused in the original engine (always 0.0)
// Note: nounIdToStim is NOT stored in genome - set at runtime from triggering agent
```
- `nounStim` 0.0-1.0: Gentle nudge to brain's noun decision lobe
- `nounStim` > 1.0: Force attention to the triggering object
- `verbIdToStim`: Specifies which verb/action to influence

**Important:** The `nounIdToStim` (object category) is determined **at runtime** based on which agent triggered the stimulus, not stored in the genome. This allows the same stimulus definition to work with any object type.

#### 3. ORDR (Linguistic)
```javascript
incomingSentence       // Sentence being spoken (used for language learning)
```
Enables creatures to learn language associations from speech.

### Genome Format

Stimulus genes are read in the following order (from `Stimulus.InitFromGenome()`):

```
1. nounStim        - float (0.0-1.0 attention strength)
2. verbIdToStim    - byte (0-254 = verb ID, 255 = invalid/-1)
3. [verbStim]      - float (read but UNUSED, always set to 0.0)
4. bitFlags        - byte (configuration flags)
5. For each of 4 chemical slots:
   a. chemicalId   - byte (converted from stimulus space to biochem space)
   b. adjustment   - signed float (-1.0 to +1.0)
```

**Key insight:** The genome does NOT store `nounIdToStim`. This value is set dynamically at runtime based on the agent that triggered the stimulus (via `SensoryFaculty.GetCategoryIdOfAgent()`).

### How Stimuli Interact with Biochemistry

#### Chemical Mapping

Stimulus chemical IDs use a different numbering than biochemistry. Conversion happens during genome loading via `Stimulus.stimChemToBioChem()`:

```javascript
// Stimulus chem 0-107   → Biochemistry chem 148-255 (drives region)
// Stimulus chem 108-254 → Biochemistry chem 1-147
// Stimulus chem 255     → Biochemistry chem 0 (none/invalid)
```

The offset (`STIM_TO_BIOCHEM_OFFSET = 148`) places stimulus chemical 0 at the start of the drives region, allowing stimuli to easily target drive-related chemicals.

#### Integration Flow

```
External Event (touch, eat, hear speech)
        ↓
    STIMULUS triggered
        ↓
    nounIdToStim = GetCategoryIdOfAgent(triggeringAgent)
        ↓
┌───────────────────────────────────────────────┐
│  ORDR: linguistic.hearSentence(...)           │
│        (enables language learning)            │
│                                               │
│  URGE: if nounStim > 1.0:                     │
│          setAttentionOverride(nounId)         │
│        else:                                  │
│          brain.setInput('noun', nounId, str)  │
│                                               │
│  SWAY: chemicals[id] += adjustment            │
│        (directly modifies biochemistry)       │
│        (with optional learning)               │
└───────────────────────────────────────────────┘
        ↓
    Creature learns & responds
```

### Processing Pipeline

When a stimulus is applied via `SensoryFaculty.processStimulus()`:

1. **State Checks**
   - Abort if creature is dead
   - If asleep: abort unless `IFASLEEP` flag set (then attenuate nounStim by 50%)

2. **Runtime ID Assignment**
   - `nounIdToStim` is set from the triggering agent's category (not from genome)

3. **Linguistic Processing** (ORDR)
   - Pass sentence to linguistic faculty for language learning

4. **Decision Influence** (URGE)
   - If `nounStim > 1.0`: Force attention override to `nounIdToStim`
   - Otherwise if `nounStim != 0`: Nudge brain's noun lobe with `nounIdToStim` at strength `nounStim`
   - Note: `verbStim` is unused in the original implementation

5. **Chemical Adjustment** (SWAY)
   - For each of 4 possible chemicals:
     - Apply adjustment × strengthMultiplier
     - If learning enabled (flag not set): create brain associations via training

### Built-In Stimuli (99 Total)

Common built-in stimuli defined in `PerceptionConstants.js`:

| ID | Name | Description |
|----|------|-------------|
| 0 | DISAPPOINT | Failure/disappointment |
| 1 | POINTERPAT | User touches creature gently |
| 3 | POINTERSLAP | User hits creature |
| 7 | BUMP | Soft collision |
| 25 | HIT | Hard impact |
| 26 | EAT | Eating something |
| 45 | MATE | Mating opportunity |

**Smell Detection (20 stimuli):**
| ID | Name |
|----|------|
| 55-74 | REACHED_PEAK_OF_SMELL0-19 |

**Consumption (5 stimuli):**
| ID | Name |
|----|------|
| 77 | EATEN_PLANT |
| 78 | EATEN_FRUIT |
| 79 | EATEN_FOOD |
| 80 | EATEN_ANIMAL |
| 81 | EATEN_DETRITUS |

### Triggering Stimuli

#### Automatic (Engine Events)
- Touch/collision → `POINTERPAT`, `BUMP`, `HIT`
- Eating → `EAT`, `EATEN_*`
- Smell detection → `REACHED_PEAK_OF_SMELL*`

#### Script-Based (CAOS)
```
STIM WRIT creature stimulus_number strength
```

#### Genome-Defined
Each creature reads stimulus definitions from STIMULUS genes during initialization.

### Learning Integration

When a stimulus includes chemical adjustments **without** the `TRAINING_OFF` flag:

1. Chemical level is adjusted
2. Brain's "prox" (proximity) or "resp" (response) lobes record the association
3. Creature learns: "this action → this chemical change"

This enables creatures to learn which actions lead to positive or negative outcomes.

### Configuration Flags

| Flag | Effect |
|------|--------|
| `MODULATE` | Enable modulation |
| `IFASLEEP` | Allow stimulus to affect sleeping creatures |
| `TRAINING_OFF_FOR_0-3` | Disable learning for specific chemical adjustments |

### Stimulus vs Receptor/Emitter

| Aspect | Receptors/Emitters | Stimuli |
|--------|-------------------|---------|
| **Trigger** | Continuous chemical levels | Discrete events |
| **Frequency** | Every organ tick | On-demand |
| **Scope** | Per-organ | Per-creature (256 library) |
| **Learning** | No | Yes (when enabled) |
| **Brain Impact** | Via drive loci only | Direct decision nudges |

---

## 9. Complete Update Cycle

**File:** `Biochemistry.js` (lines 87-110)

### Main Loop
```
Every tick:
├─ NeuroEmitters: brain neurons → chemicals
│
├─ For each organ:
│   ├─ Increment clock by clockRate
│   │
│   └─ When clock >= 1.0:
│       ├─ Process reactions: transform chemicals
│       ├─ Process clock-rate receptors
│       ├─ Process other receptors: chemicals → loci
│       ├─ Process emitters: loci → chemicals
│       ├─ Consume ATP energy
│       ├─ Repair injury
│       └─ Decay life force
│
└─ Apply natural decay to all chemicals
```

### Creature Update Integration
**File:** `Creature.js` (lines 356-387)

```
Creature.updateAgent(deltaTime)
├─ Skeleton update
└─ Every 4th tick (staggered for performance):
    └─ For each faculty:
        ├─ Biochemistry updates
        ├─ Brain reads drive loci
        ├─ Brain makes decisions
        └─ Motor updates gait/muscle loci
```

---

## 10. Genome Integration

**File:** `Biochemistry.js` (lines 221-470)

The biochemistry system is built from genome data:

### Gene Types
1. **NeuroEmitter Genes** (lines 236-322)
   - Define 3 neuronal inputs per emitter
   - Define 4 chemical emissions per emitter

2. **HalfLife Genes** (lines 328-351)
   - Set decay rates for chemicals
   - Formula: `decayRate = 0.5^(1/halfLifeInTicks)`

3. **Inject Genes** (lines 354-369)
   - Set initial chemical concentrations at birth

4. **Organ Genes** (lines 372-466)
   - Create organs by generation number
   - Define reactions, receptors, emitters per organ
   - Bind receptors and emitters to loci

---

## 11. Key File Reference

| Component | File | Key Lines |
|-----------|------|-----------|
| Biochemistry | `biochemistry/Biochemistry.js` | 16-17, 87-110, 136-171 |
| Constants | `biochemistry/BiochemistryConstants.js` | 6-12, 14-24, 181-201 |
| Organ | `biochemistry/Organ.js` | 12-56, 126-155, 160-184 |
| Reaction | `biochemistry/Reaction.js` | 8-21, 43-94 |
| Receptor | `biochemistry/Receptor.js` | 8-25, 53-86 |
| Emitter | `biochemistry/Emitter.js` | 9-26, 56-101 |
| NeuroEmitter | `biochemistry/NeuroEmitter.js` | 9-30, 39-65 |
| Creature/Drives | `Creature.js` | 99, 192-281, 356-387 |

---

## 12. Design Patterns

1. **Locus References**: Dynamic getter/setter objects allow flexible binding to arrays or properties

2. **Staggered Updates**: 4-tick distribution reduces CPU load while maintaining biochemistry fidelity

3. **Limiting Reagent Chemistry**: Reactions use stoichiometry where proportions matter

4. **Bidirectional Drives**: Same loci serve both receptors (input) and emitters (output)

5. **Clock-Based Processing**: Organs tick at configurable rates, only process when clock >= 1.0

6. **Natural Decay**: Exponential decay of chemicals mimics real biochemistry half-lives

---

## 13. Summary

The biochemistry system creates a complete feedback loop:

```
Brain Activity
     ↓
NeuroEmitters emit chemicals
     ↓
Chemicals react (transform)
     ↓
Receptors read chemicals → write to drives
     ↓
Brain reads drives → makes decisions
     ↓
Emitters read loci → emit chemicals
     ↓
(cycle repeats)
```

This architecture enables emergent creature behavior where brain activity drives chemistry, chemistry drives motivation (drives), and drives influence behavior and back to chemistry again.
