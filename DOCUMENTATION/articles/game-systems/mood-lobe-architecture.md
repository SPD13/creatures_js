# [mood] Mood Lobe Architecture

This article provides a deep-dive into the mood lobe (`mood`) — a **single-neuron genome-only aggregation lobe** that computes the creature's overall emotional valence from four social/threat drives. With just 1 neuron, the mood lobe is the smallest lobe in the brain. It receives 4 inbound tracts from specific drive neurons (scared, angry, lonely, friendly), aggregates them into a positive/negative emotional signal with temporal smoothing, and broadcasts the result to all 36 friend-or-foe neurons — but only when the mood is strong enough (|mood| > 0.5). The mood lobe is not in the Brain.catalogue, has zero direct engine interaction, and is entirely genome-driven through tract connections.

## End-to-End Data Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│              MOOD LOBE DATA FLOW (END-TO-END)                          │
│                                                                       │
│   Drive Lobe ("driv")                                                 │
│                                                                       │
│   NEGATIVE contributors (stored in FIFTH, worst-wins):                │
│   ┌──────────────────────┐                                            │
│   │  driv[10] = scared   │── threshold 0.20, negate → FIFTH          │
│   │  driv[12] = angry    │── threshold 0.20, negate → FIFTH          │
│   └──────────────────────┘                                            │
│                                                                       │
│   POSITIVE contributors (stored in SIXTH, best-wins):                 │
│   ┌──────────────────────┐                                            │
│   │  driv[8]  = lonely   │── no threshold, direct → SIXTH            │
│   │  driv[13] = friendly │── no threshold, direct → SIXTH            │
│   └──────────────────────┘                                            │
│                                                                       │
│              All 4 tracts fire at update time 5                       │
│                          │                                             │
│                          ▼                                             │
│                   ┌──────────┐                                        │
│                   │   mood   │  1 neuron                              │
│                   │ (time 15)│  THIRD = FIFTH + SIXTH                 │
│                   │          │  STATE tends toward THIRD at ~0.20     │
│                   └────┬─────┘                                        │
│                        │                                               │
│                        │ mood→forf tract (time 16)                    │
│                        │ only fires when |mood| > 0.5                 │
│                        │ writes signed mood to all forf SIXTH_VAR     │
│                        ▼                                               │
│                 ┌──────────┐                                          │
│                 │   forf   │  36 neurons (individual relationships)   │
│                 │          │  SIXTH_VAR = global mood modulation      │
│                 └──────────┘                                          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Not in Brain.catalogue — Genome-Only Lobe

The mood lobe is **not listed** in any Brain.catalogue array:

- Not in "Brain Lobes" (12 entries)
- Not in "Brain Lobe Quads" (12 entries)
- Not in "Brain Input Lobes" (9 entries)
- Not in "Brain Output Lobes" (2 entries)

This places `mood` in the same category as other genome-only lobes like `forf` (friend-or-foe), `move` (motion detection), `comb` (combination matrix), and `gend` (gender). These lobes are created by `Brain.readFromGenome()` when it encounters lobe genes in the genome binary, but they have no engine-facing catalogue entry. The mood lobe exists entirely because the genome encodes a lobe gene with the 4-character quad code `mood`.

### Distinct from "Music Mood"

The mood lobe must not be confused with two other "mood" concepts in the engine:

| Concept | What It Is | Where |
|---|---|---|
| **mood lobe** (`mood`) | Genome-only brain lobe, 1 neuron, emotional valence | Genome lobe gene |
| **Music Mood** (`IP_MUSIC_MOOD`) | Situation lobe neuron 6, written by `MusicFaculty.mood()` | `situ` lobe, engine-driven |
| **moodOpinion** | `forf` lobe OUTPUT_VAR, used by LinguisticFaculty for speech | `forf` lobe, engine-read |

The Music Mood is a drive-weighted happiness calculation that feeds the situation lobe and the game's dynamic music system. The moodOpinion is the forf lobe's output variable used when a creature expresses its opinion of another creature. Neither has any direct connection to the mood lobe.

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `mood` | 4-character lobe identifier |
| **Full Name** | (none — not catalogued) | No Brain.catalogue entry |
| **Dimensions** | 1 wide x 1 high | **1 neuron** — smallest lobe in the brain |
| **Update Time** | 15 | After drive tracts (time 5), before mood→forf (time 16) |
| **Switch-On Age** | 0 | Present from birth |
| **Winner Takes All** | No | Only 1 neuron anyway |
| **Tissue ID** | 255 | **No tissue** — no biochemical modulation |
| **Init Rule Always** | 0 | Init rule runs once only |
| **Visualization Color** | RGB (0, 255, 0) | Bright green |

---

## SVRule: Smoothed Aggregation with Dual Accumulators

The mood lobe's SVRule is the most sophisticated single-neuron rule in the brain. It uses the neuron's FIFTH and SIXTH variables as dual accumulators (populated by inbound tracts each tick), sums them, and smoothly tends STATE toward the result.

### Update Rule (pseudocode)

```
THIRD = FIFTH + SIXTH;           // Sum negative + positive contributions
STATE = tend(STATE, THIRD, 0.20); // Smooth toward target at rate ~0.20
OUTPUT = STATE;                    // Copy to output for tract propagation
FIFTH = 0;                        // Clear negative accumulator
SIXTH = 0;                        // Clear positive accumulator
stop;
```

### SVRule Bytecodes

```
 0: load accumulator from neuron[5] (FIFTH)       // Load negative accumulator
 1: add neuron[6] (SIXTH)                          // Add positive accumulator
 2: store accumulator into neuron[3] (THIRD)       // Store sum as target
 3: load accumulator from neuron[0] (STATE)        // Load current mood state
 4: set tend rate 0.2016 (byte 50/248)             // Configure smoothing rate
 5: tend accumulator toward neuron[3] (THIRD)      // Smooth toward target
 6: store accumulator into neuron[0] (STATE)       // Update state
 7-11: NOP                                          // (padding)
12: store accumulator into neuron[2] (OUTPUT)      // Copy state to output
13: clear neuron[5] (FIFTH)                        // Reset negative accumulator
14: clear neuron[6] (SIXTH)                        // Reset positive accumulator
15: stop immediately
```

### Init Rule

Empty (`stop immediately`) — the mood neuron initializes to zero (neutral mood).

### Behavioral Effect

The dual-accumulator design with temporal smoothing produces a **slowly-changing emotional signal**:

- Each tick, inbound tracts deposit the worst negative drive signal into FIFTH and the strongest positive drive signal into SIXTH
- The SVRule sums them into THIRD (the target mood)
- STATE smoothly tends toward the target at rate ~0.20 per tick, providing **emotional inertia** — the creature's mood doesn't swing wildly but drifts gradually
- When drives are stable, mood converges to a steady-state reflecting the balance between threat/hostility (scared, angry) and social/openness (lonely, friendly)

The smoothing rate of ~0.20 means roughly 5 ticks to converge halfway to the target, giving mood a noticeable temporal lag behind rapid drive changes.

---

## Inbound Tracts: 4 Drive Inputs

The mood lobe receives input from **4 specific drive neurons** through 4 separate tracts, all firing at update time 5. The tracts use a dual-channel architecture: two write to FIFTH (negative contributions) and two write to SIXTH (positive contributions).

### Negative Channel: FIFTH (Threat/Hostility)

These tracts fire when the drive exceeds a threshold (~0.20), negate the signal, and compete for FIFTH using a "worst wins" pattern — only the most negative value survives.

#### Tract 1: driv[10] (scared) → mood[0]

| Property | Value |
|---|---|
| **Source** | `driv` neuron 10 (scared) |
| **Destination** | `mood` neuron 0 |
| **Update Time** | 5 |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
acc = scared.STATE;                    // Load scared drive level
acc = acc - 0.2016;                    // Subtract threshold
if (acc < 0) stop;                     // Below threshold = no contribution
acc = acc × (-0.8024);                 // Negate and scale
if (acc < mood.FIFTH)                  // If more negative than current worst...
    mood.FIFTH = acc;                  // ...replace as new worst negative
stop;
```

#### Tract 2: driv[12] (angry) → mood[0]

| Property | Value |
|---|---|
| **Source** | `driv` neuron 12 (angry) |
| **Destination** | `mood` neuron 0 |
| **Update Time** | 5 |
| **Migrates** | No |

**Tract SVRule**: Same structure as the scared tract — threshold at ~0.20, negate, worst-wins into FIFTH.

**What this means**: When the creature is scared or angry above the 0.20 threshold, the stronger of the two produces a negative contribution to mood. Fear and anger compete — only the dominant negative emotion influences mood.

### Positive Channel: SIXTH (Social/Openness)

These tracts have no threshold and compete for SIXTH using a "best wins" pattern — only the highest positive value survives.

#### Tract 3: driv[8] (lonely) → mood[0]

| Property | Value |
|---|---|
| **Source** | `driv` neuron 8 (lonely) |
| **Destination** | `mood` neuron 0 |
| **Update Time** | 5 |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
acc = lonely.STATE;                    // Load lonely drive level
if (acc <= 0) stop;                    // Zero = no contribution
if (acc > mood.SIXTH)                  // If greater than current best...
    mood.SIXTH = acc;                  // ...replace as new best positive
stop;
```

#### Tract 4: driv[13] (friendly) → mood[0]

| Property | Value |
|---|---|
| **Source** | `driv` neuron 13 (friendly) |
| **Destination** | `mood` neuron 0 |
| **Update Time** | 5 |
| **Migrates** | No |

**Tract SVRule**: Same structure as the lonely tract — no threshold, best-wins into SIXTH.

**What this means**: When the creature is lonely or friendly, the stronger of the two produces a positive contribution to mood. Loneliness and friendliness compete — only the dominant social drive influences mood.

### Drive Selection Rationale

The four drives feeding the mood lobe represent two emotional axes:

| Axis | Drives | Channel | Effect |
|---|---|---|---|
| **Threat/Hostility** | scared (10), angry (12) | FIFTH (negative) | Mood decreases |
| **Social/Openness** | lonely (8), friendly (13) | SIXTH (positive) | Mood increases |

The asymmetry is notable:
- **Negative channel** has a threshold (~0.20) — mild fear or anger doesn't affect mood
- **Positive channel** has no threshold — any loneliness or friendliness immediately contributes
- **Negative channel** scales and negates — the magnitude is transformed
- **Positive channel** uses raw drive values — direct pass-through

This design means **positive mood is easier to achieve** than negative mood. The creature needs to be noticeably scared or angry (above 0.20) for mood to drop, but any amount of social drive pushes mood up. Combined with the temporal smoothing, this creates a naturally optimistic baseline with occasional dips during threatening or hostile situations.

---

## Outbound Tract: 1 Output Connection

### Tract: mood → forf (Global Emotional Modulation)

The mood lobe's sole outbound tract broadcasts the emotional valence to **all 36 friend-or-foe neurons**, creating a global mood overlay on the creature's social perception.

| Property | Value |
|---|---|
| **Source Lobe** | `mood` (neuron 0) |
| **Destination Lobe** | `forf` (neurons 0-35, all) |
| **Connections** | 1:36 fan-out (1 dendrite per forf neuron) |
| **Update Time** | 16 (after mood SVRule at time 15) |
| **Migrates** | No |

**Tract SVRule (pseudocode)**:
```
forf.SIXTH = 0;                        // Clear destination SIXTH first
acc = |mood.OUTPUT|;                   // Read absolute mood value
if (acc < 0.5) stop;                   // Below threshold = no contribution
acc = mood.OUTPUT;                     // Read signed mood value
forf.SIXTH = acc;                      // Write signed mood to all forf neurons
stop;
```

**What this means**:

1. **Threshold gate**: Only strong moods (|mood| > 0.5) propagate — mild emotional states don't color social perception
2. **Global broadcast**: When the gate opens, **every** forf neuron receives the same mood value in its SIXTH_VAR — this is not per-individual, it's a blanket emotional overlay
3. **Signed value**: Positive mood → positive SIXTH in forf; negative mood → negative SIXTH in forf

The forf lobe's SVRule then incorporates SIXTH_VAR into its per-individual relationship processing. This means:
- A creature in a **strongly positive mood** (friendly outweighing scared/angry by > 0.5) will perceive all known creatures more favorably
- A creature in a **strongly negative mood** (scared/angry outweighing social by > 0.5) will perceive all known creatures more negatively
- A creature in a **mild mood** (|mood| < 0.5) has no mood modulation — forf operates purely on individual relationship data

This is the "rose-tinted glasses" / "everything looks hostile" effect — strong emotions bias the creature's opinion of everyone, not just the source of the emotion.

---

## The Dual-Pathway Architecture

The mood lobe participates in a **dual-pathway** design where the same drives influence the forf lobe through two separate channels:

```
┌─────────────────────────────────────────────────────────────────────┐
│            DUAL PATHWAY: DRIVES → FORF                               │
│                                                                     │
│   Direct pathway (individual, per-drive):                           │
│   ┌────────┐                                                        │
│   │  driv  │──── driv[0]  (hurt)     ──── direct ────► forf[0-35]  │
│   │        │──── driv[8]  (lonely)   ──── direct ────► forf[0-35]  │
│   │        │──── driv[10] (scared)   ──── direct ────► forf[0-35]  │
│   │        │──── driv[12] (angry)    ──┬─ direct ────► forf[0-35]  │
│   │        │──── driv[13] (friendly) ──┘                            │
│   └────────┘                                                        │
│                                                                     │
│   Mood pathway (aggregated, global):                                │
│   ┌────────┐     ┌──────┐                                           │
│   │  driv  │──── │ mood │──── mood→forf ────► forf[0-35] SIXTH     │
│   │  [8,10,│     │(1 n) │     (only if |mood| > 0.5)               │
│   │  12,13]│     └──────┘                                           │
│   └────────┘                                                        │
│                                                                     │
│   5 drives feed forf directly (per-neuron, individual influence)    │
│   4 of those same drives also feed through mood (global scalar)     │
│   The mood pathway adds emotional "coloring" on top of direct data  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

The direct driv→forf tracts carry individual drive signals that modulate per-relationship processing. The mood pathway aggregates 4 of those drives into a single emotional valence and broadcasts it as a global overlay. This dual architecture means a creature's opinion of another creature is influenced by both the specific drives active at that moment AND the creature's overall emotional state.

---

## Engine Interaction: None

The mood lobe has **zero direct engine interaction**:

- **No SetInput calls**: No faculty ever writes to `mood` via `brain.setInput('mood', ...)`
- **No GetNeuronState calls**: No code ever reads from `mood` via `brain.getNeuronState('mood', ...)`
- **No instinct targeting**: No standard instinct genes target tissue ID 255 for the mood lobe
- **No knowledge building**: The mood lobe is not involved in `processInstinctsAndKnowledge()`

All input comes from genome-defined tracts (driv→mood), all output goes through genome-defined tracts (mood→forf), and all processing is handled by the genome-defined SVRule. The engine creates the lobe when parsing the genome but never interacts with it directly.

---

## Update Timing in the Brain Circuit

The mood lobe's position in the update sequence is carefully ordered:

| Time | Component | Role |
|---|---|---|
| 4 | `driv` lobe update | Drive neurons process biochemical input |
| 5 | `driv→mood` tracts (×4) | Scared, angry, lonely, friendly → mood FIFTH/SIXTH |
| 5 | `driv→forf` tracts (×5) | Direct drive signals → forf (parallel with mood input) |
| **15** | **`mood` lobe update** | **Sum FIFTH+SIXTH, tend STATE, output, clear** |
| **16** | **`mood→forf` tract** | **Broadcast mood to all forf SIXTH_VAR (if |mood|>0.5)** |
| 17 | `forf` lobe update | Process relationships with mood modulation |
| 19 | `forf→comb` tracts (×3) | Social signals feed combination matrix |

The 10-tick gap between drive input (time 5) and mood processing (time 15) ensures all 4 drive tracts have deposited their values into FIFTH/SIXTH before the SVRule runs. The mood→forf tract at time 16 fires just before forf updates at time 17, ensuring the mood signal is available when forf processes its relationships.

---

## Implementation Notes

Since the mood lobe is entirely genome-driven with zero engine code references, the original engine and the JS rebuild are **identical by construction** — both parse the same genome binary, create the same lobe/tract structures, and execute the same SVRule bytecodes. There is no implementation to diverge.

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Genetics/norn.astro.48.gen` | Genome binary containing mood lobe gene and 5 associated tract genes |
| `Main_Game/src/engine/creature/brain/Brain.js` | `readFromGenome()` creates mood lobe from genome data |
| `Main_Game/src/engine/creature/brain/Lobe.js` | SVRule processing for the mood neuron |
| `Main_Game/src/engine/creature/brain/Tract.js` | Tract SVRule processing for all 5 mood-connected tracts |
| `Assets/Catalogue/Brain.catalogue` | Does NOT contain mood (genome-only lobe) |

---

## Related Articles

- **[forf] Friend-or-Foe Lobe Architecture** — Downstream target receiving the global mood broadcast in SIXTH_VAR; the mood lobe modulates all 36 individual relationship neurons
- **[driv] Drive Lobe Architecture** — Upstream source providing the 4 social/threat drives (scared, angry, lonely, friendly) that feed the mood calculation
- **[comb] Combination Lobe Architecture** — Indirect downstream target via forf→comb tracts; mood ultimately influences the decision matrix through social relationship modulation
- **[move] Move Lobe Architecture** — Fellow genome-only lobe with no Brain.catalogue entry
- **Brain & Neural Networks** — Overview of the complete brain architecture including genome-only lobes
