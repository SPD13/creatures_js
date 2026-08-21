# Gait Selection System

How does a creature **choose its walking animation**? Creatures 3 uses a biochemistry-driven gait selection system where **chemical concentrations compete** across 16 gait slots. The gait with the strongest biochemical signal wins, and its animation string plays. This means a starving creature can walk differently from a happy one — the genome wires chemicals to gaits, making locomotion style an emergent property of internal state.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAIT SELECTION PIPELINE                       │
│                                                                 │
│   LAYER 1: GENOME (Birth/Growth)                               │
│   ┌─────────────────────────────────────────────────┐          │
│   │  Gait genes define 16 animation strings          │          │
│   │  Receptor genes bind chemicals → gait loci       │          │
│   └──────────────────────┬──────────────────────────┘          │
│                          ▼                                      │
│   LAYER 2: BIOCHEMISTRY (Every Tick)                           │
│   ┌─────────────────────────────────────────────────┐          │
│   │  Receptors read chemical concentrations          │          │
│   │  Apply threshold + gain filtering                │          │
│   │  Write result to myGaitLoci[0..15]               │          │
│   └──────────────────────┬──────────────────────────┘          │
│                          ▼                                      │
│   LAYER 3: SKELETON (Walk Command)                             │
│   ┌─────────────────────────────────────────────────┐          │
│   │  selectGait(): scan all 16 loci                  │          │
│   │  Pick index with highest value                   │          │
│   │  Play myGaitTable[winner] animation              │          │
│   └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight**: Gaits are not hardcoded behaviors. They are **emergent from biochemistry** — different chemical states produce different walking styles because the genome wires different chemicals to different gait loci via receptor genes.

---

## Layer 1: Genome — Defining Gaits and Wiring

### Gait Genes

Each creature's genome contains **gait genes** (type `G_GAIT`) that define up to 16 walking animations. Each gait gene specifies:

- **Gait number** (0-15): which slot this animation occupies
- **Up to 8 pose indices**: the sequence of body poses that form the walk cycle

The poses are encoded as 3-digit strings and terminated with `R` (repeat):

```
Gait 0: "013014015016R"     → poses 13→14→15→16→repeat (normal walk)
Gait 1: "014016R"           → poses 14→16→repeat (fast walk, fewer frames)
Gait 2: "013013014014R"     → doubled frames (slow walk)
```

#### Gait Gene Expression

```text
j = g2.GetCodon(0, MAX_GAITS-1)          // Which gait slot (0-15)?
for i in 0 .. 7:
    c = g2.GetCodon(0, MAX_POSES-1)       // Get pose number
    if c == 0: break                      // 0 = end of animation
    myGaitTable[j][3*i]   = (c/100) + '0' // Hundreds digit
    myGaitTable[j][3*i+1] = ((c/10)%10) + '0' // Tens digit
    myGaitTable[j][3*i+2] = (c%10) + '0'  // Units digit
myGaitTable[j][3*i]   = 'R'               // Repeat marker
myGaitTable[j][3*i+1] = end-of-string     // Terminator
```

### Receptor Genes

Separate **receptor genes** in the genome wire chemical concentrations to gait loci. Each receptor gene specifies:

- **Source chemical**: which of the 256 chemicals to monitor
- **Threshold**: minimum concentration before signal passes
- **Gain**: amplification factor
- **Destination locus**: `LOC_GAIT0` through `LOC_GAIT15` (indices 8-23 in `TISSUE_SENSORIMOTOR`)

This is the same receptor mechanism used throughout the biochemistry system — gaits are just another receptor destination, no different from how drive chemicals bind to brain loci.

---

## Layer 2: Biochemistry — Chemical Competition

### How Receptors Write to Gait Loci

Every organ clock tick, `Organ.processReceptors()` runs:

```
┌─────────────────────────────────────────────────────────────────┐
│                RECEPTOR → GAIT LOCUS WRITE                      │
│                                                                 │
│  1. Read chemical:  concentration = chemicals[receptor.Chem]    │
│  2. Apply threshold: signal = concentration - threshold         │
│  3. Apply gain:      signal = signal * gain                     │
│  4. Clamp to 0.0-1.0                                           │
│  5. Write to locus:  receptor.Dest.value = signal               │
│                       ↓                                         │
│                  myGaitLoci[n] updated                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Locus Address Resolution Chain

When an organ binds its receptors during initialization, the destination address is resolved through a chain:

```
Organ.bindToLoci()
    → Organ.getLocusAddress(RECEPTOR, ORGAN_CREATURE, TISSUE_SENSORIMOTOR, LOC_GAIT0)
        → Biochemistry.getCreatureLocusAddress()
            → Creature.getLocusAddress()
                → return _createArrayLocusRef(myGaitLoci, 0)
```

The result is a **live reference object** with getter/setter that reads and writes directly to `Skeleton.myGaitLoci[n]`. This means receptor processing updates the skeleton's gait loci in real-time without any explicit synchronization step.

### The Competition

Multiple receptor genes can target the same gait locus (accumulating signals), and different gait loci compete by magnitude. The biochemistry system doesn't know about gaits — it just writes numbers to loci. The competition happens downstream in the skeleton.

---

## Layer 3: Skeleton — Selecting and Playing Gaits

### The Selection Algorithm

When the creature walks, `Skeleton.Walk()` calls `selectGait()`:

```text
function Skeleton.Walk():
    Strength = 0.0
    Choice = 0                          // Default to gait 0

    for i in 0 .. MAX_GAITS-1:
        if myGaitTable[i][0]:             // Gait defined?
            if myGaitLoci[i] > Strength:  // Strongest signal?
                Strength = myGaitLoci[i]
                Choice = i
    SetAnimationString(myGaitTable[Choice]) // Play winner
```

The algorithm is simple:
1. Scan all 16 gait slots
2. Skip undefined gaits (empty animation string)
3. Pick the one with the highest locus value
4. If all loci are zero, **gait 0 wins by default** (it's the initial `Choice`)
5. Apply that gait's animation string

### Default Gait Table

All 16 gait slots are initialized to the same default walk cycle:

```
"013014015016R"   (poses 13→14→15→16→repeat)
```

Genome expression then overwrites specific slots with different animations. The default ensures a creature always has a valid walk animation even if no gait genes are expressed.

---

## Data Structures

### Storage

| Structure | Original | JS | Size |
|-----------|-----|-----|------|
| Gait animations | `myGaitTable[16][92]` (chars) | `string[] myGaitTable` | 16 slots |
| Gait strengths | `myGaitLoci[16]` (floats) | `Array(16)` | 16 floats |
| Current gait | (implicit in Walk()) | `myCurrentGait` | 1 int |

Both arrays live in the **Skeleton** class. In the original engine, `Creature` inherits from `Skeleton`, so they're directly accessible. In JS, `Creature` has a `skeleton` property.

### Locus Constants

```javascript
// BiochemistryConstants.js
LOC_GAIT0  = 8    // First gait receptor locus
LOC_GAIT15 = 23   // Last gait receptor locus
// Tissue: TISSUE_SENSORIMOTOR
// Organ: ORGAN_CREATURE
```

Emitter loci (`LOC_E_GAIT0` through `LOC_E_GAIT15`) also exist, mapping to the same `myGaitLoci` array. These allow the biochemistry system to read gait state back as chemical emissions — creating feedback loops where gait selection can influence chemistry.

---

## Serialization

Gait data is serialized in `.family` files as part of the Skeleton data:

| Field | Format | Size |
|-------|--------|------|
| Gait table | 16 fixed-length strings (92 bytes each) | 1,472 bytes |
| Gait loci | 16 float32 values | 64 bytes |

The family-parser extracts gait tables by pattern-matching for valid gait strings (digits and 'R' characters), followed by 16 float32 loci values.

---

## Why Gait Loci Are Often Zero

In practice, gait loci frequently remain at zero for imported creatures. This happens because:

1. **Receptor genes must exist**: The genome must contain receptor genes that target `LOC_GAIT0-15`. Not all genomes include these.
2. **Source chemicals must be present**: The chemicals referenced by those receptors must have non-zero concentrations.
3. **Threshold must be exceeded**: The chemical level must exceed the receptor's threshold before any signal passes.
4. **Default gait still works**: When all loci are zero, `selectGait()` returns gait 0 — the creature walks normally. The system degrades gracefully.

The gait loci system is designed for **genetic variation** — genome engineers can wire different chemicals to different gaits, creating creatures that limp when injured, shuffle when tired, or bounce when happy. But the stock genome may not utilize all 16 slots.

---

## Complete Data Flow

```
    Genome                    Biochemistry              Skeleton
    ──────                    ────────────              ────────

  Gait genes ──► myGaitTable[0..15]
                 (animation strings)

  Receptor       chemicals[n]
  genes ──────►  read concentration ──► threshold+gain ──► myGaitLoci[n]
                                                                │
                                                                ▼
                                                          selectGait()
                                                          scan all 16
                                                          pick highest
                                                                │
                                                                ▼
                                                    setAnimationString()
                                                    (play walk cycle)
```

---

## Key Files

| Component | JS |
|-----------|-----|
| Gait data & selection | `Skeleton.js:1977-2014` |
| Gait gene expression | `Creature.js:900-934` |
| Locus address binding | `Creature.js:227-231` |
| Receptor processing | `Organ.js:707-723` |
| Locus constants | `BiochemistryConstants.js` |
| Family file parsing | `family-parser.js:3119-3213` |

---

## Key Insights

1. **Gaits are biochemistry-driven, not code-driven.** There is no `if (tired) useSlowWalk()` logic. Chemical concentrations compete through receptor loci, and the strongest signal wins. This makes gait selection an emergent behavior.

2. **16 slots, but typically few used.** The system supports 16 gaits, but stock Norn genomes only define 2-3 variations. The remaining slots are available for genome engineers to create custom walking styles.

3. **Gait 0 is the failsafe.** When all loci are zero (no biochemical signal), the selection algorithm defaults to gait 0. This ensures creatures always have a valid walk animation.

4. **Same mechanism as drives.** Gait loci use the exact same receptor/locus architecture as drive loci, involuntary action loci, and every other biochemistry output. There's nothing special about gaits from the biochemistry's perspective.

5. **Bidirectional.** Emitter loci can read gait state back into chemistry, allowing feedback loops where the act of walking in a particular gait produces chemicals that influence future gait selection.
