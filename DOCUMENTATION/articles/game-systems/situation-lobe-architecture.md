# [situ] Situation Lobe Architecture

This article provides a deep-dive into the situation lobe (`situ`) — the brain lobe responsible for encoding the creature's own internal and environmental state. Unlike the detail lobe which describes an external object, the situation lobe tells the brain "what is happening to me right now". It covers the 9 input neurons, their data sources in the world and creature systems, and the lobe's unusual status as a fully functional but **unconnected** lobe in the standard genome.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│          SITUATION LOBE DATA FLOW (END-TO-END)                   │
│                                                                 │
│   Creature Internal State                                       │
│   ├── LifeFaculty → age                                        │
│   ├── Agent system → carrier, carried, movement status         │
│   └── Music faculty → mood, threat                             │
│       │                                                         │
│   World State                                                   │
│   ├── AgentManager → nearest opposite-sex creature             │
│   └── Selected creature tracking                               │
│       │                                                         │
│       ▼                                                         │
│   SensoryFaculty.updateSituationLobe()                          │
│   ├── Reads creature state (age, carrying, falling, etc.)      │
│   ├── Queries world (nearest mate, selection status)           │
│   └── Writes to brain via setInput('situ', neuron, value)      │
│       │                                                         │
│       ▼                                                         │
│   Situation Lobe ("situ") — 16 neurons (9 written)              │
│   └── SVRule processes accumulated inputs                      │
│       │                                                         │
│       ▼                                                         │
│   ✗ No tracts in standard genome                                │
│   └── Data is stored but never read by other lobes             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What the Situation Lobe Describes

The situation lobe captures the creature's **own circumstances** — its age, physical state, and environmental context. This information is always available regardless of whether the creature has an attention target (IT agent). Where the detail lobe answers "what is that thing?", the situation lobe answers "what is happening to me?".

In theory, the brain could combine situation inputs with detail inputs and drive inputs to make contextual decisions. However, no shipped genome defines tracts connecting the situ lobe to other lobes — making it a **latent capability**. The engine faithfully writes all 9 neurons every tick, but the data is never consumed by the neural network in the standard game. See [Connectivity](#connectivity-zero-tracts-in-standard-genome) below for full analysis.

---

## Neuron Layout: 9 Input Neurons

The genome allocates **16 neurons** for the situation lobe, but only **9 are written** by the engine. The 7 unused slots (neurons 9-15) represent planned capacity that was never implemented. The 9 active neurons are defined by the `situationLobeOffsets` enum in the original engine and `SituationLobeInput` constants in JavaScript.

```
┌─────────────────────────────────────────────────────────────────┐
│                  SITUATION LOBE NEURONS                           │
│                                                                 │
│   Index  Name                        Type      Range             │
│   ─────  ────────────────────────    ──────    ─────             │
│   0      Age level                   Analog    0.0 - 1.0        │
│   1      In vehicle                  Binary    0 / 1             │
│   2      Carrying something          Binary    0 / 1             │
│   3      Being carried               Binary    0 / 1             │
│   4      Falling                     Binary    0 / 1             │
│   5      Near opposite sex           Analog    0.0 - 1.0        │
│   6      Music mood                  Analog    0.0 - 1.0        │
│   7      Music threat                Analog    0.0 - 1.0        │
│   8      Selected creature           Binary    0 / 1             │
│                                                                 │
│   Binary: fires 1.0 when condition is true, 0.0 otherwise      │
│   Analog: continuous value encoding magnitude                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The Brain catalogue (`Brain.catalogue`) names these neurons:

| Index | Catalogue Name |
|-------|---------------|
| 0 | "I am this old" |
| 1 | "I am inside a vehicle" |
| 2 | "I am carrying something" |
| 3 | "I am being carried" |
| 4 | "I am falling" |
| 5 | "I am near a creature of the opposite sex and my genus" |
| 6 | "I am musically at this mood" |
| 7 | "I am musically at this threat level" |
| 8 | "I am the selected norn" |

---

## Neuron Details

### Neuron 0: Age Level

**Source**: `LifeFaculty.getAge()` divided by `NUMAGES` (7).

```text
brain.SetInput("situ", IP_AGE_LEVEL, creature.Life().GetAge() / NUMAGES)
```

The creature's age is an integer representing its current life stage. Dividing by NUMAGES normalizes it to a 0.0-1.0 range:

| Age Stage | Value | Age Name | Description |
|-----------|-------|----------|-------------|
| 0 | 0.00 | Baby | Initial embryological phase |
| 1 | 0.14 | Child | Instincts for language, etc. |
| 2 | 0.29 | Adolescent | Response to opposite sex begins |
| 3 | 0.43 | Youth | Pair-bonding and mating time |
| 4 | 0.57 | Adult | More mature relationships |
| 5 | 0.71 | Old | Failing faculties, reduced interest |
| 6 | 0.86 | Senile | Slowly dying of old age |

This allows the brain to make age-dependent decisions — for example, adolescent creatures may start responding to opposite-sex signals, while senile creatures may reduce activity.

### Neuron 1: In Vehicle

**Condition**: `1.0` if the creature has a carrier (is inside a vehicle agent), `0.0` otherwise.

```text
brain.SetInput("situ", IP_IN_VEHICLE, creature.GetCarrier().IsValid() ? 1.0 : 0.0)
```

In Creatures 3, vehicles are agents that can contain other agents (e.g., lifts, boats, the hand). When a creature enters a vehicle, `creature.getCarrier()` returns the vehicle agent. This neuron tells the brain the creature is enclosed in something.

### Neuron 2: Carrying Something

**Condition**: `1.0` if the creature is holding/carrying another agent, `0.0` otherwise.

```text
brain.SetInput("situ", IP_CARRYING_SOMETHING, creature.GetCarried() != NULLHANDLE ? 1.0 : 0.0)
```

This checks `creature.getCarried()` — the agent the creature has picked up. This neuron tells the brain "my hands are full", which can influence decisions about whether to pick up more items or put something down.

### Neuron 3: Being Carried

**Condition**: `1.0` if the creature's movement status is `CARRIED`, `0.0` otherwise.

```text
brain.SetInput("situ", IP_BEING_CARRIED, creature.GetMovementStatus() == Agent.CARRIED ? 1.0 : 0.0)
```

This fires when the creature itself is being carried by another agent (typically the player's hand or another creature). Note the distinction from neuron 1: **In Vehicle** means enclosed in a vehicle agent, while **Being Carried** means physically held by the `CARR` system.

### Neuron 4: Falling

**Condition**: `1.0` if the creature is not stopped (in motion / not resting on a surface), `0.0` if stationary.

```text
brain.SetInput("situ", IP_FALLING, !creature.IsStopped() ? 1.0 : 0.0)
```

Despite the name "falling", this neuron indicates any non-stationary state — a creature that is falling through the air, being thrown, bouncing, or sliding will all trigger this neuron. The original engine's comment reads: "if not stopped you're falling".

### Neuron 5: Near Opposite Sex

**Source**: Inverse distance to the nearest visible creature of the same genus and opposite sex, normalized to [0.0, 1.0].

```text
f = DistanceToNearestCreature(
    creature.Life().GetSex() == 1 ? 2 : 1,                  // opposite sex
    myCreature.GetAgentReference().GetClassifier().Genus())  // same genus
vr = myCreature.GetCreatureReference().GetVisualRange()
if f < vr
    brain.SetInput("situ", IP_NEAR_OPPOSITE_SEX, (vr - f) / vr)
```

This neuron acts as a **proximity pheromone sensor**. The original engine's comment describes its purpose: "to fill in the situation neuron which tracks norns of opposite sex, to use for 'pheromones' etc."

| Distance to Nearest Mate | Neuron Value | Meaning |
|--------------------------|-------------|---------|
| 0 px | 1.0 | Right next to a potential mate |
| 128 px | 0.75 | Mate is nearby |
| 256 px | 0.50 | Mate is at moderate distance |
| 384 px | 0.25 | Mate is far |
| 512 px (visual range) | ~0.0 | Mate at edge of perception |
| > visual range | 0.0 (no input) | No mate detected |

**Important details**:
- Only creatures of the **same genus** are considered (a Norn won't detect a Grendel)
- Only creatures of the **opposite sex** are considered
- The search uses `CanSee()` — the creature must be able to physically see the potential mate (line-of-sight, not invisible, etc.)
- The original engine uses **X-axis only** distance (the absolute value of `creature.x - other.x`)
- The formula `(vr - f) / vr` produces a value that increases as the mate gets closer

### Neuron 6: Music Mood

**Source**: The creature's `MusicFaculty.mood()` value.

```text
brain.SetInput("situ", IP_MUSIC_MOOD, creature.Music().Mood())
```

The music system in Creatures 3 tracks the emotional tone of the background music the creature is hearing. The mood value ranges from 0.0 (negative/sad mood) to 1.0 (positive/happy mood). This allows the brain to be influenced by the ambient musical environment.

### Neuron 7: Music Threat

**Source**: The creature's `MusicFaculty.threat()` value.

```text
brain.SetInput("situ", IP_MUSIC_THREAT, creature.Music().Threat())
```

The threat value from the music system ranges from 0.0 (calm/safe) to 1.0 (dangerous/threatening). Tense or dramatic music in the game environment can make creatures feel threatened, influencing fight-or-flight decisions.

### Neuron 8: Selected Creature

**Condition**: `1.0` if this creature is the currently player-selected creature, `0.0` otherwise.

```text
brain.SetInput("situ", IP_SELECTED_CREATURE,
    creature == world.selectedCreature ? 1.0 : 0.0)
```

The player can select one creature at a time to interact with. When a creature is selected, this neuron fires, allowing the brain to know "the player is paying attention to me". This can influence behaviors like responsiveness to player commands or attention-seeking.

---

## Historical Note: IP_NEARWALL

A tenth situation neuron, `IP_NEARWALL`, was designed but cut before release. It would have told the creature how close it was to a wall, mapping the wall-distance signal as `(127 − wallDistanceSignal) × 2 / 255`. The enum slot was removed and the 9 remaining neurons were renumbered.

---

## Data Source Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│               SITUATION LOBE DATA SOURCES                        │
│                                                                 │
│   ┌──────────────┐                                              │
│   │  LifeFaculty  │──── getAge() / NUMAGES ────► [0] Age Level │
│   └──────────────┘                                              │
│                                                                 │
│   ┌──────────────┐                                              │
│   │  Agent System │──── getCarrier() ──────────► [1] In Vehicle │
│   │              │──── getCarried() ──────────► [2] Carrying    │
│   │              │──── getMovementStatus() ───► [3] Carried     │
│   │              │──── isStopped() ───────────► [4] Falling     │
│   └──────────────┘                                              │
│                                                                 │
│   ┌──────────────┐                                              │
│   │ AgentManager  │                                              │
│   │ + CanSee()   │──── DistanceToNearest() ──► [5] Near Mate   │
│   └──────────────┘                                              │
│                                                                 │
│   ┌──────────────┐                                              │
│   │ MusicFaculty │──── mood() ────────────────► [6] Music Mood  │
│   │              │──── threat() ──────────────► [7] Music Threat│
│   └──────────────┘                                              │
│                                                                 │
│   ┌──────────────┐                                              │
│   │    World     │──── getSelectedCreature() ─► [8] Selected    │
│   └──────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Update Timing

The situation lobe is updated by `SensoryFaculty.updateSituationLobe()`, which is the **first** lobe update in the sensory cycle each brain tick.

### Update Sequence

The SensoryFaculty updates all input lobes in this order:

1. **`updateSituationLobe()`** — creature's own state (9 neurons)
2. `updateDetailLobe()` — IT agent properties (11 neurons)
3. `updateDriveLobe()` — biochemical drive levels (20 neurons)
4. `updateSmellLobe()` — CA smell values per category (40 neurons)
5. `updateVisionLobe()` — X displacement per category (40 neurons)

### Alert Gate

The entire SensoryFaculty update (including the situation lobe) is gated by the creature's alert state:

```text
if !creature.Life().GetWhetherAlert()
    return
```

If the creature is not alert (asleep, unconscious, or dead), no situation inputs are updated. All neuron states decay naturally according to the lobe's SVRule.

### Always Active When Alert

Unlike the detail lobe which requires a valid IT agent, the situation lobe **always produces meaningful inputs** when the creature is alert. Every neuron has a well-defined value based on the creature's current state — there is no early-return for missing data (except for optional faculty checks like Music).

---

## Connectivity: Zero Tracts in Standard Genome

Despite receiving 9 meaningful inputs every tick, the situation lobe has **no tract connections** in any shipped genome (Norn, Grendel, or Ettin). It is a fully functional input lobe that is completely isolated from the neural network.

### Verified: No Tracts Reference "situ"

The complete tract list from a standard Norn genome (`brain-architecture.json`) includes these source→destination pairs:

```
visn→stim    visn→move    visn→smel    move→stim    comb→attn
comb→decn    driv→comb    stim→comb    verb→comb    noun→stim
resp→driv    verb→decn    decn→resp    forf→comb    driv→forf
driv→mood    mood→forf    smel→stim    driv→driv    smel→visn
```

**"situ" appears zero times** — neither as source nor destination. No genome-defined tract reads from or writes to the situation lobe.

### Engine-Side: Write-Only, No Hardcoded Reads

A comprehensive search of the engine codebase confirms that the engine only **writes to** the situ lobe and never **reads from** it. The entire engine reference to "situ" consists of 9 `SetInput` calls in the situation-lobe update routine. There are:

- **Zero** `GetNeuronState("situ", ...)` calls anywhere in the engine
- **Zero** `GetWinningId("situ")` calls
- **Zero** `GetLobeFromTokenString("situ")` calls (beyond the implicit ones inside `SetInput`)
- **Zero** hardcoded tract or connection setup

This contrasts with other lobes that **do** have hardcoded reads:

| Lobe | Hardcoded Read |
|------|---------------|
| `attn` | `GetWinningId("attn")` — selects IT agent |
| `decn` | `GetWinningId("decn")` — selects action script |
| `visn` | `GetNeuronState("visn", id)` — checks visibility |
| `noun` | `GetNeuronState("noun", id) > 0.20` — persistence check |
| `forf` | `GetNeuronState("forf", id)` — reads social opinions |
| `driv` | `GetLobeFromTokenString("driv")` — knowledge system |
| **`situ`** | **None** |

The situ lobe's connectivity is **100% genome-defined** — the engine provides the input data, but all downstream wiring depends entirely on tract genes. Since no shipped genome defines those tracts, the lobe is a data sink.

### Why It Was Likely Disconnected

The situation lobe was almost certainly **planned** to connect to downstream lobes but was left unwired before shipping. Evidence:

- The genome allocates **16 neurons** for the lobe (brain-architecture.json shows `"neurons": 16`), but only 9 are written — suggesting additional situation inputs were planned
- The engine-side write logic is complete, correct, and runs every tick
- The commented-out `IP_NEARWALL` neuron (see Historical Note above) confirms other inputs were considered and cut
- The lobe has a proper update SVRule (`STORE_ACCUMULATOR_INTO NEURON[0]` — passes input through)

Possible reasons for leaving it unwired match the [elvn lobe](elevation-lobe-architecture) pattern:
- The standard genome's decision-making worked well enough without situational context
- Adding tracts would increase brain complexity and 1999-era CPU cost
- The information was partially redundant with biochemistry-driven behaviors (drives already encode similar state)

### Modding Potential

A modder can activate the situation lobe by adding **tract genes** in a custom genome. No engine changes needed — the `SetInput("situ", ...)` calls already populate all 9 neurons:

1. Add a **tract gene** with `srcLobe = "situ"` and `dstLobe = "comb"` (concept lobe) — lets situational context influence concept formation
2. Or `srcLobe = "situ"`, `dstLobe = "decn"` — directly affects decision-making
3. Or `srcLobe = "situ"`, `dstLobe = "stim"` — creates situation-dependent stimulus responses
4. Define appropriate SVRules for the tract's dendrites

This would enable behaviours like:
- A creature that is **falling** (neuron 4) expressing fear or bracing for impact
- A creature **near an opposite-sex mate** (neuron 5) at **adolescent age** (neuron 0) approaching for social interaction
- A creature that is the **selected creature** (neuron 8) being more responsive to player input
- A creature **inside a vehicle** (neuron 1) suppressing walking behaviors

The 7 unused neuron slots (9-15) provide additional headroom for custom situational inputs via engine modifications.

---

## Comparison: Situation Lobe vs Detail Lobe

The situation lobe works in tandem with the **detail lobe** (`detl`), but they describe different perspectives:

| Aspect | Situation Lobe (`situ`) | Detail Lobe (`detl`) |
|--------|------------------------|---------------------|
| **Describes** | The creature itself (internal state) | The IT agent (external focus) |
| **Neurons** | 9 | 11 |
| **Depends on** | Always active when alert | Requires valid IT agent |
| **Example inputs** | Age, carrying, falling, near mate | Nearness, carried, family ties |
| **Perspective** | "What is my situation?" | "What is this thing I'm looking at?" |
| **Data sources** | LifeFaculty, Agent state, MusicFaculty, World | IT agent properties, moniker matching |

Together, these two lobes give the brain a complete sensory snapshot: what the creature is experiencing internally (situation) and what it knows about the object of its attention (detail).

---

## Token Discrepancy: "situ" vs "sitn"

The situation lobe has an unusual token mismatch between the genome and the catalogue:

| Source | Token | Purpose |
|--------|-------|---------|
| Genome binary (lobe gene) | `"situ"` | Actual lobe token stored in creature file |
| `Brain.catalogue` line 72 | `"sitn"` | Display name for Neuroscience Kit tool |
| Engine SetInput calls | `"situ"` | Engine writes using genome token |

This causes no functional problem. `Brain::SetInput("situ")` calls `Tokenize("situ")` internally and matches against the lobe's `myToken` field — which was read from the genome binary via `genome.GetToken()`. The catalogue string `"sitn"` is only used by the Neuroscience Kit UI for display purposes and is never used for functional token lookup.

The JS rebuild uses `"situ"` consistently in both `SensoryFaculty.js` and `Brain.js`, matching the genome token.

---

## Key Constants

```javascript
// PerceptionConstants.js
export const SituationLobeInput = {
    AGE_LEVEL: 0,
    IN_VEHICLE: 1,
    CARRYING_SOMETHING: 2,
    BEING_CARRIED: 3,
    FALLING: 4,
    NEAR_OPPOSITE_SEX: 5,
    MUSIC_MOOD: 6,
    MUSIC_THREAT: 7,
    SELECTED_CREATURE: 8
};
```

**Age stages**: 7 (NUMAGES) — Baby(0) through Senile(6)
**Visual range**: 512 pixels (default, used for opposite-sex distance normalization)

---

## Key Source Files

### JavaScript (Rebuild)

| File | Purpose |
|------|---------|
| `PerceptionConstants.js:47-57` | `SituationLobeInput` constants matching the original engine's enum |
| `SensoryFaculty.js:152-207` | `updateSituationLobe()` — complete update implementation |
| `SensoryFaculty.js:1176-1221` | `distanceToNearestCreature()` — mate proximity search |
| `CreatureConstants.js:76-89` | Age stages enum and NUMAGES constant |
| `Brain.js` | `setInput()`, `getLobeFromTokenString('situ')` |

---

## Related Articles

- [Detail Lobe Architecture](#/article/detail-lobe-architecture) - The companion lobe describing the IT agent (external focus)
- [Vision Lobe Architecture](#/article/vision-lobe-architecture) - How visual perception feeds the attention system
- [Creature Perception](#/article/creature-perception) - Overview of all sensory modalities
- [Elevation Lobe Architecture](#/article/elevation-lobe-architecture) - Another planned-but-unwired lobe (elvn) with a similar pattern
- [Brain & Neural Networks](#/article/brain-system) - Lobe architecture, SVRules, and tract processing
- [Creature Faculties](#/article/creature-faculties) - SensoryFaculty and other faculties
