# Reproductive Faculty

The **ReproductiveFaculty** handles breeding, pregnancy, and genetic inheritance. It is the interface between the biochemistry system and the creation of new creature genomes — controlling when a creature becomes fertile, whether fertilisation succeeds, how offspring genomes are constructed via crossover and mutation, and how multiple births (twins, triplets) are determined.

## Position in the Faculty System

ReproductiveFaculty is **faculty index 5** — it updates after the Biochemistry (index 4) and before the ExpressiveFaculty (index 6).

```
Faculty Update Order:
  0  SensoryFaculty     (perceive)
  1  Brain              (think)
  2  MotorFaculty       (act)
  3  LinguisticFaculty  (speak)
  4  Biochemistry       (metabolise)
  5  ReproductiveFaculty (reproduce)   ◀
  6  ExpressiveFaculty  (express)
  7  MusicFaculty       (music)
  8  LifeFaculty        (age/die)
```

The position after Biochemistry is architecturally significant: the biochemistry must process receptor outputs first so that the reproductive loci are up-to-date before the fertility/pregnancy logic runs.

## Core Concepts

### The Gamete

The central state variable is `myGamete` — a boolean indicating whether the creature currently has a viable egg (female) or sperm (male). When `myGamete` is true, the creature is **fertile** and can participate in reproduction.

The gamete state is not set directly. Instead, it is controlled by the biochemistry through a **hysteresis thermostat** — the `myOvulateLocus` receptor. This means fertility is an emergent property of chemistry, not a hard-coded state transition.

### Biochemical Loci

The ReproductiveFaculty communicates with the biochemistry system through six loci — variables that the receptor/emitter gene machinery reads from or writes to:

#### Receptor Loci (Biochemistry → Faculty)

| Locus | Index | Description |
|-------|-------|-------------|
| `myOvulateLocus` | 0 | Controls fertility via hysteresis thresholds |
| `myReceptiveLocus` | 1 | Probability of accepting sperm during mating |
| `myChanceOfMutationLocus` | 2 | Probability of gene mutation during crossover |
| `myDegreeOfMutationLocus` | 3 | Magnitude of mutation when one occurs |

#### Emitter Loci (Faculty → Biochemistry)

| Locus | Index | Description |
|-------|-------|-------------|
| `myFertileLocus` | 0 | 1.0 if gamete present, 0.0 otherwise |
| `myPregnancyLocus` | 1 | 1.0 if pregnant, 0.0 otherwise |

The emitter loci also mirror the four receptor loci at indices 2–5 (`LOC_E_OVULATE` through `LOC_E_DEGREEOFMUTATION`), allowing emitter genes to bind to the same variables that receptors write to. This enables complex feedback loops — for example, an emitter gene could broadcast the current mutation rate as a chemical.

### Default Values

```
myGamete                  = false
myFertileLocus            = 0.0
myPregnancyLocus          = 0.0
myOvulateLocus            = 0.0
myReceptiveLocus          = 0.0
myChanceOfMutationLocus   = 0.5    (50% base mutation probability)
myDegreeOfMutationLocus   = 0.5    (50% base mutation magnitude)
```

The mutation loci default to 0.5 rather than 0.0 — this provides a baseline mutation rate even before any biochemistry modifies them.

## The Update Cycle

Each creature tick, the `update()` method performs two jobs:

### Step 1: Hysteresis Fertility Control

The ovulate locus acts as a thermostat with two thresholds:

```
OVULATEOFF = 0.314    — become infertile when locus drops below this
OVULATEON  = 0.627    — become fertile when locus rises above this
```

The hysteresis gap (0.314 to 0.627) prevents rapid oscillation. The logic:

```
if (has gamete) AND (ovulateLocus < 0.314):
    → lose gamete (become infertile)

else if (no gamete) AND (ovulateLocus > 0.627):
    → gain gamete (become fertile)
```

This design enables **cyclic ovulation** in females. A typical biochemical cycle works like this:

1. Oestrogen rises, driving the ovulate receptor above 0.627 → egg appears
2. The `myFertileLocus` emitter turns on (value 1.0)
3. This emitter produces a chemical that causes oestrogen to decay
4. Oestrogen drops, ovulate receptor falls below 0.314 → egg removed
5. Without the fertile emitter, oestrogen can rise again → cycle repeats

For males, the same mechanism controls sperm regeneration — testosterone drives the ovulate receptor up, and after mating, the chemistry provides a recovery period before new sperm appears.

### Step 2: Emitter Updates

After the gamete check, the two emitter loci are refreshed:

```
myFertileLocus   = (myGamete)     ? 1.0 : 0.0
myPregnancyLocus = (isPregnant()) ? 1.0 : 0.0
```

These values are picked up by emitter genes during the biochemistry tick, injecting chemicals based on fertility and pregnancy status.

## Pregnancy Detection

A creature is considered pregnant when offspring genomes exist in storage. In the original engine, this checks whether GenomeStore slot 1 contains a non-empty moniker string:

```text
// GenomeStore slot-based
IsPregnant():
    return not (GetCreatureOwner().GetGenomeStore().MonikerAsString(1).empty())
```

The JS rebuild uses an equivalent mechanism — an `offspringGenomes` array:

```javascript
// JS — array-based
isPregnant() {
    return this.offspringGenomes.length > 0;
}
```

Slot 0 is always the creature's own genome. Slots 1, 2, 3, ... hold offspring genomes (first child, twin, triplet, etc.).

## Pregnancy Visualisation

Each creature tick, the Creature class calls `SetPregnancyStage()` on the skeleton body, passing the current progesterone chemical level:

```text
// Called in Creature.Update() after all faculties
base.SetPregnancyStage(Reproductive().GetProgesteroneLevel())
```

Progesterone (chemical 48) rises during pregnancy and maps to one of 4 pregnancy sprite stages:

```text
myPregnancyStage = FastFloatToInteger(progesteroneLevel * (NUMBER_OF_PREGNANCY_SPRITES - 1))
// NUMBER_OF_PREGNANCY_SPRITES = 4
// Stages: 0 (not showing), 1, 2, 3 (full term)
```

The sprite system uses this stage to select the appropriate body part sprite, making the creature visually swell during pregnancy.

## The Mating Process

Mating is a two-step process initiated by the `MATE` CAOS command, which triggers the male's `DonateSperm()` method.

### Step 1: DonateSperm() — Male Side

The male attempts to inseminate the current IT object:

```
1. Build target classifier: (male's family, male's genus, FEMALE)
2. Get IT agent
3. Validate: IT must exist AND match the target classifier
   (i.e., must be a female creature of the same genus)
4. Call IT's AcceptSperm(self, myChanceOfMutation, myDegreeOfMutation)
5. Set myGamete = false  ("shot your bolt")
```

Key design detail: the male's gamete is consumed unconditionally at step 5, regardless of whether fertilisation actually succeeds inside `AcceptSperm()`. The male always loses his sperm in the attempt.

The male does **not** check whether he has a gamete before calling. If `myGamete` is already false, the call still proceeds to `AcceptSperm()`, which will fail at its own gamete check. The male's `myGamete` is then set to false again (a no-op).

### Step 2: AcceptSperm() — Female Side

The female receives the mating attempt and decides whether fertilisation occurs:

```
Preconditions (ALL must be true):
  1. Female has an egg         (myGamete == true)
  2. Male has sperm            (dad.myGamete == true)
  3. Female is not pregnant    (isPregnant() == false)

Probabilistic gate:
  4. Random float < myReceptiveLocus
     (higher receptive locus = higher chance of conception)
```

If all four checks pass, fertilisation is successful and offspring genome creation begins.

**Important**: The female's egg is **not** consumed by `AcceptSperm()`. Unlike the male (who loses his gamete unconditionally), the female retains her egg after fertilisation. The egg is only removed when the biochemistry naturally reduces the `myOvulateLocus` below the `OVULATEOFF` threshold (0.314) during a subsequent `update()` tick. This is by design in the original engine — it allows the biochemistry system to fully control the female fertility cycle.

### The Receptive Locus

The `myReceptiveLocus` receptor gives the female biochemical control over whether fertilisation succeeds. A value of 0.0 prevents all conception; 1.0 guarantees it (assuming other preconditions are met).

This receptor can be driven by various chemicals:
- **Sex drive pheromones**: A male emitting courtship pheromones could raise the female's receptive locus
- **Self-excitation**: The female's own mating behaviour could raise her receptive locus, requiring both partners to be actively mating for conception to occur
- **Hormonal cycles**: The receptive locus can track the ovulation cycle, creating a fertility window

## Multiple Births

When fertilisation succeeds, the engine determines how many offspring to create using four GAME variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `engine_multiple_birth_maximum` | 4 | Hard cap on offspring count |
| `engine_multiple_birth_first_chance` | 0.05 | Probability of twins (5%) |
| `engine_multiple_birth_subsequent_chance` | 0.01 | Probability of each additional offspring (1%) |
| `engine_multiple_birth_identical_chance` | 0.5 | Probability that multiples are identical (50%) |

### Birth Count Algorithm

```
birthCount = 1

if maxBirths < 1:
    maxBirths = 1

if random() < first_chance:
    birthCount = 2
    while birthCount < maxBirths AND random() < subsequent_chance:
        birthCount++

if birthCount > maxBirths:
    birthCount = maxBirths
```

With default values, typical probabilities are:
- **Single birth**: ~95%
- **Twins**: ~4.95% (5% first chance × ~99% no third)
- **Triplets**: ~0.0495% (5% × 1%)
- **Quadruplets**: ~0.000495% (5% × 1% × 1%)

### Identical vs Non-Identical

After determining the birth count, one random check decides whether **all** multiples are identical:

```
identical = random() < engine_multiple_birth_identical_chance
```

If identical is true, the first offspring genome is created via crossover, and all subsequent offspring are cloned from it (same genes, new moniker). If false, each offspring gets an independent crossover.

## Genetic Crossover

Each non-identical offspring is created by `CrossoverFrom()` on the GenomeStore. This method:

1. Takes the mother's genome (slot 0) and father's genome (slot 0)
2. Performs gene-by-gene crossover (randomly selecting from each parent)
3. Applies mutations based on four parameters:
   - Mother's chance of mutation (`myChanceOfMutationLocus`)
   - Mother's degree of mutation (`myDegreeOfMutationLocus`)
   - Father's chance of mutation (passed from `DonateSperm`)
   - Father's degree of mutation (passed from `DonateSperm`)
4. Generates a unique moniker for the offspring
5. Stores the new genome in the specified slot
6. Registers a conception life event in the creature history

### Mutation Parameters

The mutation loci control two aspects:
- **Chance**: Probability that any individual gene undergoes mutation (0.0 = never, 1.0 = always)
- **Degree**: Magnitude of the mutation when it occurs (0.0 = tiny, 1.0 = large)

Both parents contribute mutation parameters independently, allowing asymmetric mutation rates. A creature with high `myChanceOfMutationLocus` will tend to produce more mutated offspring regardless of the partner's mutation rate.

### Type Quirk

In the original code, `DonateSperm()` passes the father's mutation loci (which are floating-point values in 0.0–1.0 range) to `AcceptSperm()`, which declares them as byte parameters. This implicit float-to-byte truncation means the father's mutation values would typically be 0 after conversion. `CrossoverFrom()` itself takes integer parameters for mutation, compounding the issue. The mother's values are also passed as floats but undergo the same float-to-int truncation. The JS rebuild handles this differently by preserving float precision and explicitly scaling to 0–255 range.

## Identical Twins

When identical multiples are requested, `IdenticalTwinFrom()` creates a genetic clone:

1. Takes the first offspring's moniker as a reference
2. Copies the genome data exactly
3. Generates a new unique moniker (so twins can be distinguished)
4. Stores the clone in the next GenomeStore slot

Identical twins share the same genes but have different monikers and separate life histories.

## Connection to Egg Laying

The ReproductiveFaculty creates and stores offspring genomes but does not itself trigger birth. The actual egg-laying is handled by the **MotorFaculty's involuntary action system**:

```
Involuntary Action 1 (Script Event 65) = "Lay Egg"
```

The pregnancy cycle works as follows:

1. Fertilisation creates offspring genome(s) in GenomeStore
2. `myPregnancyLocus` emitter activates (value 1.0)
3. This drives progesterone production in the biochemistry
4. Progesterone drives the visual pregnancy stages on the skeleton (4 stages)
5. A receptor connected to involuntary action locus 1 triggers when progesterone reaches a threshold
6. The MotorFaculty fires the "Lay Egg" script (event 65)
7. The CAOS egg-laying script creates a new egg agent containing the offspring genome
8. The GenomeStore slot is cleared, `isPregnant()` returns false
9. `myPregnancyLocus` emitter deactivates (value 0.0)

This separation of concerns means the ReproductiveFaculty handles only the *genetic* side of reproduction, while the biochemistry handles *timing* and the MotorFaculty handles the *physical act* of egg-laying.

## GetLocusAddress — Biochemistry Binding

The `GetLocusAddress()` method allows the biochemistry's receptor and emitter genes to bind to reproductive loci. It returns an accessor object for the specified locus.

### Routing Logic

```
if organ != ORGAN_CREATURE → null
if tissue != TISSUE_REPRODUCTIVE → null

if type == RECEPTOR:
    locus 0 → myOvulateLocus
    locus 1 → myReceptiveLocus
    locus 2 → myChanceOfMutationLocus
    locus 3 → myDegreeOfMutationLocus

if type == EMITTER:
    locus 0 → myFertileLocus
    locus 1 → myPregnancyLocus
    locus 2 → myOvulateLocus         (shared with receptor)
    locus 3 → myReceptiveLocus       (shared with receptor)
    locus 4 → myChanceOfMutationLocus (shared with receptor)
    locus 5 → myDegreeOfMutationLocus (shared with receptor)
```

Note that emitter loci 2–5 share the same variables as receptor loci 0–3. This allows both receptor and emitter genes to bind to the same underlying value, enabling bidirectional biochemical feedback.

### Constant Values

```
ORGAN_CREATURE       = 1
TISSUE_REPRODUCTIVE  = 2
RECEPTOR             = 0
EMITTER              = 1
```

## CAOS Interface

### MATE Command

The sole CAOS command for reproduction:

```caos
MATE
```

- **TARG** must be a creature (the male)
- **IT** must be a female creature of the same genus
- Calls `TARG.Reproductive().DonateSperm()`
- All validation (gamete checks, species matching, receptive probability) happens inside the faculty methods

Typical usage in a mating script:

```caos
scrp 4 0 1 65   * Male norn, script 65 (lay egg involuntary - but typically mate script)
  lock
  setv va00 ownr
  targ va00
  mate             * Attempt mating with IT
  unlk
endm
```

## Serialisation

### Binary Format (Archive)

The Write/Read methods serialise the faculty state in this order:

```
1. base::Write/Read    (Faculty base class)
2. myGamete            (bool)
3. myFertileLocus      (float, as FloatRefTarget)
4. myPregnancyLocus    (float, as FloatRefTarget)
5. myOvulateLocus      (float, as FloatRefTarget)
6. myReceptiveLocus    (float, as FloatRefTarget)
7. myChanceOfMutationLocus  (float, as FloatRefTarget)
8. myDegreeOfMutationLocus  (float, as FloatRefTarget)
```

The `FloatRefTarget` format includes reference tracking metadata used by the archive system for pointer resolution. Offspring genomes are not stored here — they are serialised separately through the GenomeStore's own archive operators.

### PRAY/CREA Import

When importing a creature from a `.creature` file (PRAY format), the reproductive state is extracted from the serialised binary data by the family-parser library, which pattern-matches after the "ReproductiveFaculty" marker string to extract the gamete boolean and six float loci values. These are restored via `restoreReproductiveState()`.

## Source Files

| File | Description |
|------|-------------|
| `Rebuild/Main_Game/src/engine/creature/faculties/ReproductiveFaculty.js` | JS rebuild implementation |
| `Rebuild/Main_Game/src/engine/creature/genome/GenomeStore.js` | JS — crossover and cloning |
| `Rebuild/Main_Game/src/engine/caos/commands/creatures/MATE.js` | JS — MATE CAOS command |
