# Energy and Metabolism

The metabolism system in Creatures 3 models a complete energy chain from food intake through chemical conversion to organ function. Every organ in a creature's body requires ATP to operate — without it, organs take continuous damage and eventually fail, triggering death. All chemical conversions except ATP consumption are genome-defined, making metabolism fully evolvable.

## The Energy Chain

```
FOOD INTAKE                      STORAGE                    ORGAN FUEL
───────────                      ───────                    ──────────
Starch (5) ──→ Glucose (3) ←──→ Glycogen (4)
Fat (10) ──→ Fatty Acid (6)         │
Protein (12) ──→ Amino Acid (13)    │
                                    ↓
                              ATP (35) ──→ Organ Processing
                                    ↓
                              ADP (36) ──→ (recycled by genome reactions)
```

Food objects emit nutrient chemicals (Starch, Fat, Protein) when eaten. Genome-defined biochemistry reactions convert these through intermediate forms into ATP, the universal organ fuel. When ATP is consumed by an organ, it produces ADP as a byproduct. Further genome reactions recycle ADP back to ATP, completing the cycle.

## Chemicals

### Nutrient Chemicals (Food Sources)

| ID | Name | Description |
|----|------|-------------|
| 5 | Starch | Emitted by food objects. Converts to Glucose for energy. Does NOT decrease hunger directly — that's done by separate "Hunger--" chemicals (saccharin), so junk food can have high saccharin but low starch |
| 10 | Fat | Food source of Fatty Acid |
| 12 | Protein | Food source of Amino Acid |

### Building Blocks

| ID | Name | Description |
|----|------|-------------|
| 3 | Glucose | Primary energy source for muscles. Produced from Starch; reversible reaction with Glycogen |
| 6 | Fatty Acid | Building block from Fat |
| 13 | Amino Acid | Building block from Protein |
| 7 | Cholesterol | Vital steroid |

### Energy Storage

| ID | Name | Description |
|----|------|-------------|
| 4 | Glycogen | Short-term energy reserve. Reversible reaction with Glucose. **Defines creature Health** — `LifeFaculty::Health()` returns this chemical's concentration |
| 8 | Triglyceride | First step in forming Adipose Tissue (from Fatty Acid) |
| 9 | Adipose Tissue | High-density long-term carbon storage |
| 11 | Muscle Tissue | Amino Acid storage |

### Energy Currency

| ID | Name | Description |
|----|------|-------------|
| 34 | Energy | Phosphorylation cycle intermediate |
| 35 | ATP | High-energy phosphate. **Powers all organ processing** — the only chemical consumed by the hardcoded `ConsumeEnergy()` function |
| 36 | ADP | Low-energy phosphate. Byproduct of ATP consumption. Recycled back to ATP by genome reactions |

### Waste Products

| ID | Name | Description |
|----|------|-------------|
| 1 | Lactate | Product of Pyruvate fermentation. Causes "muscle burn" |
| 2 | Pyruvate | Intermediate product of anaerobic respiration |
| 24 | Dissolved CO2 | Waste from Glucose→energy conversion. May cause behaviour changes |
| 25 | Urea | Non-toxic waste product (from CO2 + Ammonia) |
| 26 | Ammonia | Toxic product of using Amino Acid as fuel |

### Respiratory Chemicals

| ID | Name | Description |
|----|------|-------------|
| 29 | Air | Signals breathable air. Set by receptor reading `myAirQualityLocus` (room-type dependent) |
| 30 | Oxygen | Required for aerobic respiration |
| 33 | Water | Vital fluid |

## Health

Health is defined as the concentration of **Glycogen (Chemical 4)**. This is the original definition:

```text
function LifeFaculty.Health():
    return creature.biochemistry.GetChemical(CHEM_GLYCOGEN)
```

Glycogen sits at the center of the energy chain — it's the short-term reserve that buffers between food intake and ATP production. When Glycogen reaches zero, downstream ATP production stops, organs begin failing, and the creature enters a death spiral.

## Organ Energy System

### ConsumeEnergy()

Every organ tick, the organ attempts to consume ATP. This is the **only hardcoded biochemistry reaction** in the engine — all other chemical transformations are genome-defined.

```text
function Organ.ConsumeEnergy():
    isSuccess = false
    if biochemistryOwner.GetChemical(CHEM_ATP) >= myEnergyCost:
        biochemistryOwner.SubChemical(CHEM_ATP, myEnergyCost)
        biochemistryOwner.AddChemical(CHEM_ADP, myEnergyCost)
        isSuccess = true
    return isSuccess
```

Each organ has an energy cost calculated as:

```
myEnergyCost = myBaseOrganADPCost + (receptors + emitters + reactions) / 2550.0
```

Where `myBaseOrganADPCost = 0.0078` is the minimum per-organ baseline. More complex organs (with more receptors, emitters, and reactions) cost more ATP to run.

### Organ Clock Rate

Organs don't process every game tick. Each organ has a clock rate that accumulates:

```text
myClock += loc_ClockRate          // Default: 0.5 (ticks every 2 game ticks)
if myClock >= 1.0:
    myClock -= 1.0

    myEnergyAvailableFlag = ConsumeEnergy()
    if myEnergyAvailableFlag:
        workWasDone = ProcessAll()       // Process emitters + reactions
    else:
        Injure(myDamageDueToZeroEnergy)  // Damage organ!
    workWasDone = workWasDone OR RepairInjury(myEnergyAvailableFlag)

    if loc_InjuryToApply:              // External injury locus
        Injure(LOC_TO_LF(loc_InjuryToApply) / 10.0)
        loc_InjuryToApply = 0.0
    ProcessReceptors(false)              // Process ALL receptors
else:
    ProcessReceptors(true)               // Process only clock-rate receptors

if workWasDone: DecayLifeForce()        // Natural wear
```

The clock rate is modifiable via a receptor locus (`RLOCUS_CLOCKRATE`), allowing genome reactions to speed up or slow down individual organs.

### What Happens Without ATP

When `ConsumeEnergy()` fails:

1. **No processing** — emitters and reactions are skipped entirely
2. **Organ damage** — `Injure(myDamageDueToZeroEnergy)` is called immediately
3. **No healing** — `RepairInjury()` still runs but cannot heal without energy
4. **Cascade** — the organ can't produce chemicals that other organs depend on

The damage per tick without energy is:

```
myDamageDueToZeroEnergy = (myInitialLifeForce * damageDueToZeroEnergy) / 255.0
```

Default: approximately `myInitialLifeForce / 128`, meaning an organ dies after roughly 128 activations without energy.

## Organ Life Force

Each organ has a **two-level life force system** that separates recoverable damage from permanent degradation.

### Short-Term vs Long-Term

```
myShortTermLifeForce  ← Current health. Can recover if energy is available.
        ↕ (delta)
myLongTermLifeForce   ← Permanent damage floor. NEVER recovers. Only gets worse.
```

- **Short-term** drops immediately on injury and recovers when energy is available
- **Long-term** tracks the moving average of damage — it always degrades, never heals
- The gap between them (`delta = Long - Short`) represents current repairable damage

### Injure()

```text
function Organ.Injure(damage):
    myShortTermLifeForce = BoundedSub(myShortTermLifeForce, damage)
    loc_LifeForce = myShortTermLifeForce / myInitialLifeForce
    biochemistryOwner.AddChemical(CHEM_INJURY, LF_TO_LOC(damage))
```

When an organ is injured:
1. Short-term life force is reduced by the damage amount
2. The organ's life force locus is updated (normalized 0.0–1.0)
3. **Chemical 127 (Injury)** is emitted proportionally to the damage

### RepairInjury()

```text
function Organ.RepairInjury(isEnergyAvailable):
    delta = myLongTermLifeForce - myShortTermLifeForce

    // ALWAYS degrade long-term (regardless of energy!)
    myLongTermLifeForce -= delta * myLongTermRateOfRepair

    // Only repair short-term if energy available
    if isEnergyAvailable:
        repair = delta * loc_LongTermRateOfRepair
        myShortTermLifeForce += repair
        biochemistryOwner.SubChemical(CHEM_INJURY, LF_TO_LOC(repair))

    loc_LifeForce = myShortTermLifeForce / myInitialLifeForce
    return (delta > 0.5 and isEnergyAvailable)
```

Critical behaviour:
- Long-term life force **always** degrades toward short-term — this is permanent, cumulative damage
- Short-term life force **only** heals when energy is available
- Healing reduces the Injury chemical (Chemical 127) proportionally
- Without energy, short-term can't heal and long-term continues to degrade

### DecayLifeForce()

```text
function Organ.DecayLifeForce():
    myShortTermLifeForce -= myShortTermLifeForce * myRateOfDecay
    myLongTermLifeForce  -= myLongTermLifeForce * myRateOfDecay
    loc_LifeForce = myShortTermLifeForce / myInitialLifeForce
```

Natural wear with `myRateOfDecay = 0.00001` (very slow). Only applied when the organ actually does work (processes reactions/emitters). This ensures even well-fed creatures experience gradual organ degradation over a very long lifespan.

### Organ Failure

```text
function Failed():
    return (myLongTermLifeForce <= myMinLifeForce)  // myMinLifeForce = 0.5
```

When `myLongTermLifeForce` drops to 0.5 or below, the organ **permanently fails**. Since long-term damage never heals, organ failure is irreversible. A failed organ stops all processing — no reactions, no emitters, no receptors.

## Life Force Unit Conversion

The engine uses two scales: **locus values** (0.0–1.0 normalized) and **life force units** (absolute, typically ~500,000 for default organs). Two macros convert between them:

```text
LOC_TO_LF(f) = myInitialLifeForce * f     // Locus → Life force
LF_TO_LOC(f) = f / myInitialLifeForce     // Life force → Locus
```

For example, with `myInitialLifeForce = 500,000`:
- Injury locus 0.02 → `LOC_TO_LF(0.02) = 10,000` life force units of damage
- 10,000 units of damage → `LF_TO_LOC(10,000) = 0.02` Injury chemical emitted

## Chemical Decay (Half-Lives)

All chemicals decay every tick according to genome-configured half-lives:

```text
// Applied each tick:
for i in 0 .. NUMCHEM-1:
    myChemicalConcs[i] *= myChemicalDecayRates[i]
```

The decay rate is calculated from the genome's half-life gene:

```
halfLifeInTicks = 2.2 ^ (genomeValue * 32.0)
decayRate = 0.5 ^ (1.0 / halfLifeInTicks)
```

A chemical with a genome value of 0 has instant decay (disappears immediately). Higher values give longer persistence. For example, if `halfLifeInTicks = 60`, the chemical halves every 60 ticks.

## Genome-Defined Reactions

All chemical conversions (except ATP→ADP in `ConsumeEnergy()`) are defined by **reaction genes** in the creature's genome. Each reaction specifies:

```
Reactant1 (proportion) + Reactant2 (proportion) → Product1 (proportion) + Product2 (proportion)
```

With a rate parameter controlling how fast the reaction proceeds (using the same half-life formula as chemical decay).

**Reaction processing** follows limiting-reagent chemistry:

```text
avail = GetChemical(rn.R1) / rn.propR1
avail2 = GetChemical(rn.R2) / rn.propR2
if avail2 < avail: avail = avail2    // Limiting reagent

avail *= rate                          // Apply reaction rate
SubChemical(rn.R1, avail * rn.propR1)
SubChemical(rn.R2, avail * rn.propR2)
AddChemical(rn.P1, avail * rn.propP1)
AddChemical(rn.P2, avail * rn.propP2)
```

Typical genome reactions in the energy chain include:
- Starch → Glucose (food absorption)
- Glucose ↔ Glycogen (energy storage/release)
- Glucose + Oxygen → ATP + CO2 (aerobic respiration)
- ADP → ATP (energy recycling)
- Glucose → Pyruvate → Lactate (anaerobic respiration, produces muscle burn)
- Amino Acid → Energy + Ammonia (protein as emergency fuel, produces toxic waste)

## The Death Spiral

Energy starvation creates a fatal positive feedback loop:

```
1. No food intake
   └→ Starch/Fat/Protein levels drop
      └→ Glucose production stops
         └→ Glycogen reserves deplete (Health drops)
            └→ ATP production stops
               └→ Organs can't ConsumeEnergy()
                  ├→ Organs take damage each tick
                  ├→ Organs can't process reactions (no energy)
                  │  └→ Can't produce ATP even if chemicals arrive
                  ├→ Organs can't repair (no energy)
                  │  └→ Injury chemical accumulates
                  └→ Long-term life force permanently degrades
                     └→ Organ failure (myLongTermLifeForce ≤ 0.5)
                        └→ Cascading failures across organs
                           └→ LOC_DIE receptor fires
                              └→ LifeFaculty.setWhetherDead(true)
                                 └→ Death
```

The death trigger locus (`LOC_DIE`) uses special OR logic in its receptor processing:

```text
if r.IDOrgan == ORGAN_CREATURE and r.IDTissue == TISSUE_IMMUNE and r.IDLocus == LOC_DIE:
    // Special OR: if ANY death receptor term is positive → result = 1.0
    result = (totalOfAllNominals + termToAddSoFar - termToSubSoFar) > 0.0 ? 1.0 : 0.0
```

If **any** contributing term to the death receptor is positive, the creature dies. This ensures multiple independent death conditions (starvation, poisoning, organ failure) all funnel through the same mechanism.

## Biochemistry Update Sequence

Each creature tick, the complete biochemistry processes in this order:

```
1. NeuroEmitters      — Brain neurons emit chemicals
2. Organ Updates      — Each organ:
   a. Clock accumulate
   b. ConsumeEnergy() (if clock ticked)
   c. ProcessAll() or Injure() (energy dependent)
   d. RepairInjury()
   e. ProcessReceptors()
   f. DecayLifeForce() (if work was done)
3. Chemical Decay     — All 256 chemicals multiplied by their decay rate
```

## Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `CHEM_GLYCOGEN` | 4 | Health indicator chemical |
| `CHEM_ATP` | 35 | Organ energy currency |
| `CHEM_ADP` | 36 | Spent energy byproduct |
| `CHEM_INJURY` | 127 | Organ damage indicator |
| `myBaseOrganADPCost` | 0.0078 | Minimum ATP cost per organ |
| `myRateOfDecay` | 0.00001 | Natural organ wear rate |
| `myMinLifeForce` | 0.5 | Organ failure threshold |
| Default clock rate | 0.5 | Organ ticks every 2 game ticks |

## File Locations

| File | Description |
|------|-------------|
| `ChemicalNames.catalogue` | All 256 chemical names |
| `Rebuild/Main_Game/src/engine/creature/biochemistry/Biochemistry.js` | JS biochemistry implementation |
| `Rebuild/Libraries/creatures-chemicals.js` | JS chemical names and descriptions |

## Related Articles

- [Biochemistry System](biochemistry-system.md) — Architecture overview of chemicals, organs, reactions, receptors, and emitters
- [Age and Lifecycle](age-and-lifecycle.md) — Life stages, health definition, death mechanisms, consciousness states
- [Creature Faculties](creature-faculties.md) — Overview of all 9 faculty subsystems
