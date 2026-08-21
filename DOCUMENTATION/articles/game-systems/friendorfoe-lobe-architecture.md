# [forf] Friend-or-Foe Lobe Architecture

This article provides a deep-dive into the friend-or-foe lobe (`forf`) — the brain lobe responsible for tracking the creature's relationships with individual creatures and pointer agents. Unlike the other input lobes (visn, detl, situ, driv, smll), the forf lobe does not encode categorical or world-state data. Instead, each neuron represents a **specific individual** — a remembered acquaintance — and its neuron state variables encode the creature's social opinion of that individual. This article covers the lobe's unique architecture, kinship-based initialization, per-tick visibility updates, interaction flagging, dendrite migration, and how downstream systems read the lobe's output.

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│           FRIEND-OR-FOE LOBE DATA FLOW (END-TO-END)                 │
│                                                                     │
│   Vision Loop (SensoryFaculty.updateVisionLobe)                     │
│   ├── For each visible creature/pointer:                            │
│   │   └── setSeenFriendOrFoe(agent)                                │
│   │       ├── Already known? → set FIFTH_VAR = 1.0 (visible)       │
│   │       └── Unknown? → addFriendOrFoe(agent)                     │
│   │           ├── Find empty/oldest slot                            │
│   │           ├── Kinship detection → set STATE_VAR (affection)     │
│   │           ├── Set NGF_VAR = 1.0 (migration flag)               │
│   │           └── flagConceptNeuronsForMigration()                  │
│   │               └── Flag "comb" lobe neurons for dendrite growth  │
│   └── clearSeenFriendsOrFoes() at start of each tick               │
│       └── Reset FIFTH_VAR and NGF_VAR to 0.0 for all slots         │
│                                                                     │
│   CAOS FORF Command (from action scripts)                           │
│   └── setCreatureActingUponMe(fromAgent)                            │
│       └── Set THIRD_VAR = 1.0 for matching slot                    │
│                                                                     │
│           ┌─────────────────────────┐                               │
│           │   Friend-or-Foe Lobe    │                               │
│           │   ("forf")              │                               │
│           │                         │                               │
│           │   Neuron per individual: │                               │
│           │   STATE_VAR  = affection│                               │
│           │   THIRD_VAR  = acting   │                               │
│           │   FOURTH_VAR = stranger │                               │
│           │   FIFTH_VAR  = visible  │                               │
│           │   NGF_VAR    = migrate  │                               │
│           │                         │                               │
│           │   SVRule processes →     │                               │
│           │   OUTPUT_VAR = mood     │                               │
│           └────────────┬────────────┘                               │
│                        │                                            │
│                        ▼                                            │
│   Downstream Consumers:                                             │
│   ├── LinguisticFaculty.getOpinionOfCreature()                     │
│   │   └── Reads STATE_VAR (affection) + OUTPUT_VAR (mood opinion)  │
│   ├── Concept Lobe ("comb") via dendrite migration                 │
│   │   └── Learns good/bad action associations for individuals      │
│   └── Tracts to downstream decision lobes (genome-defined)         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Makes the Forf Lobe Unique

The forf lobe differs from all other input lobes in several fundamental ways:

| Aspect | Other Input Lobes (visn, detl, situ, driv, smll) | Friend-or-Foe Lobe (forf) |
|--------|--------------------------------------------------|--------------------------|
| **Neuron mapping** | Each neuron = a category or property | Each neuron = a specific individual creature/pointer |
| **Input method** | `brain.setInput('token', n, value)` | Direct `brain.setNeuronState('forf', n, VAR, value)` |
| **Size source** | Fixed by genome lobe definition | Dynamic: `getLobeSize('forf') - 1` (one spare for migration) |
| **Catalogue entry** | Listed in "Brain Lobe Quads" | **Not in catalogue** — genome-defined only |
| **Update pattern** | Overwrite inputs each tick | Persistent state across ticks; only visibility flags reset |
| **Parallel tracking** | None | Handle array + moniker array + timestamp array |

### Not in the Brain Catalogue

The 12 lobes listed in `Brain.catalogue` ("Brain Lobe Quads" array) are: `attn`, `decn`, `verb`, `noun`, `visn`, `smel`, `driv`, `sitn`, `detl`, `resp`, `prox`, `stim`. The forf lobe is **not among them**. It is defined entirely in the creature's genome, which means its size, SVRule, and initial state can vary between species and genetic variants.

---

## Parallel Tracking Arrays

Each forf neuron is backed by three parallel arrays maintained by the SensoryFaculty:

```
┌──────────────────────────────────────────────────────────────────┐
│              PARALLEL TRACKING ARRAYS                              │
│                                                                  │
│   Slot:              [0]         [1]         [2]      ...        │
│                                                                  │
│   myFriendsAndFoeHandles:                                        │
│   ├── Agent ref      NornA       Pointer     GrendelB  ...       │
│   │   (null if dead/exported or never used)                      │
│                                                                  │
│   myFriendsAndFoeMonikers:                                       │
│   ├── Moniker str    "abc123"    "world_uid" "def456"  ...       │
│   │   (persists across save/load for handle reconnection)        │
│                                                                  │
│   myFriendsAndFoeLastEncounters:                                 │
│   ├── Tick age       4520        1200        8831      ...       │
│   │   (used for LRU eviction when slots are full)                │
│                                                                  │
│   Brain forf neuron: [0]         [1]         [2]      ...        │
│   ├── STATE_VAR      0.8         -1.0        0.225    ...        │
│   ├── THIRD_VAR      0.0         1.0         0.0      ...        │
│   ├── FOURTH_VAR     0.0         -1.0        0.0      ...        │
│   ├── FIFTH_VAR      1.0         0.0         1.0      ...        │
│   └── NGF_VAR        0.0         0.0         0.0      ...        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

The arrays are sized during `postInit()`:

```text
// SensoryFaculty.PostInit()
forfSize = creature.brain.GetLobeSize("forf") - 1  // -1 for migration spare
```

```javascript
// JS SensoryFaculty.postInit() — SensoryFaculty.js:79
const forfSize = brain.getLobeSize('forf') - 1;  // -1 for migration spare
```

The spare neuron (the last one in the genome-defined lobe) is reserved for dendrite migration — new tract connections can grow to this neuron before being redirected.

---

## Neuron State Variables

Unlike the other input lobes which use `setInput()` (which maps to `INPUT_VAR`), the forf lobe is written to via direct `setNeuronState()` calls on specific state variables:

```
┌─────────────────────────────────────────────────────────────────┐
│              FORF NEURON STATE VARIABLES                          │
│                                                                 │
│   Variable      Index   Meaning                    Set By       │
│   ──────────    ─────   ───────────────────────    ────────     │
│   STATE_VAR     0       Affection / opinion        addFriend    │
│   INPUT_VAR     1       (SVRule input)             SVRule       │
│   OUTPUT_VAR    2       Mood-based opinion          SVRule       │
│   THIRD_VAR     3       "Acting upon me" flag      FORF cmd     │
│   FOURTH_VAR    4       Stranger flag (-1.0)       addFriend    │
│   FIFTH_VAR     5       Currently visible flag     vision loop  │
│   SIXTH_VAR     6       (unused / SVRule)          —            │
│   NGF_VAR       7       Dendrite migration flag    addFriend    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### STATE_VAR (0) — Affection

The primary opinion value. Set during `addFriendOrFoe()` based on kinship detection, then modified over time by the SVRule as the creature interacts with this individual. Positive values indicate friendship, negative values indicate hostility.

### OUTPUT_VAR (2) — Mood Opinion

Produced by the SVRule each brain tick. Represents the creature's current mood-influenced opinion of this individual — combining the base affection (STATE_VAR) with the creature's current emotional state.

### THIRD_VAR (3) — Acting Upon Me

Set to `1.0` by `setCreatureActingUponMe()` when another creature or the pointer performs an action on this creature. This is triggered by the CAOS `FORF` command in action scripts (e.g., hitting, activating). The SVRule uses this flag to modulate the affection update — if someone is currently acting on the creature, the reinforcement signal from the stimulus system has a target.

### FOURTH_VAR (4) — Stranger Flag

Set to `-1.0` for strangers (creatures with no kinship relationship and pointer agents). This signals the SVRule to treat this individual as unknown, allowing the opinion to be built entirely from learned experience rather than innate kinship.

### FIFTH_VAR (5) — Currently Visible

Set to `1.0` each tick when the creature can see this individual (via the vision loop). Reset to `0.0` at the start of each tick by `clearSeenFriendsOrFoes()`. The SVRule uses this to weight recent interactions more heavily — you can't change your opinion of someone you can't see.

### NGF_VAR (7) — Nerve Growth Factor (Migration Flag)

Set to `1.0` when a new friend/foe is added. This triggers dendrite migration in tracts that connect the forf lobe to downstream lobes (like the concept lobe). The flag is cleared at the start of each tick by `clearSeenFriendsOrFoes()`.

---

## Adding a Friend or Foe: Kinship-Based Initialization

When a creature encounters a new individual (creature or pointer), `addFriendOrFoe()` assigns it to a slot and initializes the neuron based on kinship:

```
┌──────────────────────────────────────────────────────────────────┐
│              KINSHIP-BASED INITIALIZATION                          │
│                                                                  │
│   Relationship          STATE_VAR    FOURTH_VAR    Meaning       │
│   ──────────────        ─────────    ──────────    ────────      │
│   Parent / Child        0.8          (default)     Strong love   │
│   Sibling               0.225        (default)     Mild affinity │
│   Same genus, ≠ Grendel 0.175        (default)     Slight bond  │
│   Stranger / Grendel    (default)    -1.0          Unknown       │
│   Pointer agent         (default)    -1.0          Unknown       │
│                                                                  │
│   Grendels are excluded from the "same genus" bonus — genus 2   │
│   creatures never receive the 0.175 initial affection.           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Kinship Detection Logic

The kinship check uses **moniker comparison** (the same mechanism as the detail lobe's family neurons):

```text
// simplified
if moniker == myMotherMoniker or moniker == myFatherMoniker or
   agentMotherMoniker == myMoniker or agentFatherMoniker == myMoniker:
    // Parent or child → STATE_VAR = 0.8
    brain.SetNeuronState("forf", slot, STATE_VAR, 0.8)
else if agentMotherMoniker == myMotherMoniker or agentFatherMoniker == myFatherMoniker:
    // Sibling → STATE_VAR = 0.225
    brain.SetNeuronState("forf", slot, STATE_VAR, 0.225)
else if sameFamily and sameGenus and genus != GRENDEL:
    // Same species, not grendel → STATE_VAR = 0.175
    brain.SetNeuronState("forf", slot, STATE_VAR, 0.175)
else:
    // Stranger → FOURTH_VAR = -1.0 (signals "clear and relearn")
    brain.SetNeuronState("forf", slot, FOURTH_VAR, -1.0)
```

### Slot Selection (LRU Eviction)

When all slots are occupied, the system evicts the **oldest** entry (by `myFriendsAndFoeLastEncounters` timestamp). Never-used slots (null handle AND empty moniker) are preferred:

1. Scan for a never-used slot → use immediately
2. If none, find the slot with the oldest `lastEncounter` among dead/exported entries (null handle)
3. If all slots have live handles → return -1 (cannot add)

### One-Per-Update Throttle

Only one new friend/foe can be added per brain update cycle (`myAddedAFriendOnThisUpdate` flag). This prevents a sudden crowd of new creatures from flooding the system in a single tick.

---

## Per-Tick Visibility Update

The vision loop integrates with the friend/foe system on every brain tick:

```
┌──────────────────────────────────────────────────────────────────┐
│              PER-TICK VISIBILITY CYCLE                             │
│                                                                  │
│   1. clearSeenFriendsOrFoes()                                    │
│      └── For ALL slots: FIFTH_VAR = 0.0, NGF_VAR = 0.0          │
│                                                                  │
│   2. Vision loop processes each visible agent:                   │
│      ├── Is it a creature or pointer?                            │
│      │   ├── Yes: setSeenFriendOrFoe(agent)                     │
│      │   │   ├── Already in list? → FIFTH_VAR = 1.0             │
│      │   │   └── Not in list? → addFriendOrFoe(agent)           │
│      │   │       └── Then FIFTH_VAR = 1.0                       │
│      │   └── No: skip (inanimate objects are not tracked)        │
│                                                                  │
│   3. Brain.doUpdate() runs SVRule on each forf neuron            │
│      └── SVRule reads STATE_VAR, THIRD_VAR, FOURTH_VAR,         │
│          FIFTH_VAR, NGF_VAR → produces OUTPUT_VAR                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Interaction Flagging: The FORF CAOS Command

When one creature performs an action on another (hitting, pushing, activating), the action script uses the `FORF` CAOS command to flag which creature is acting:

```caos
* Example: a creature script that recognizes who is pushing it
* FORF sets THIRD_VAR = 1.0 on the forf neuron matching FROM agent
FORF FROM
```

The `FORF` command calls `sensory.setCreatureActingUponMe(fromAgent)`, which searches the `myFriendsAndFoeHandles` array for the acting agent and sets its `THIRD_VAR` to `1.0`:

```text
function SensoryFaculty.SetCreatureActingUponMe(creatureOrPointer):
    for i in 0 .. myFriendsAndFoeHandles.size()-1:
        if myFriendsAndFoeHandles[i] == creatureOrPointer:
            creature.brain.SetNeuronState("forf", i, THIRD_VAR, 1.0)
            break
```

This `THIRD_VAR = 1.0` flag tells the SVRule "this is the creature that just did something to me." Combined with the stimulus system's reinforcement signal, the brain can update its opinion of the acting creature — learning to like those who help and dislike those who harm.

### Good and Bad Action Scripts

The catalogue defines which scripts are considered good or bad:

| Catalogue Entry | Script Numbers | Actions |
|----------------|---------------|---------|
| `"Bad Action Script"` | `["13"]` | Hit (script 13) |
| `"Good Action Script"` | `["1", "2"]` | Activate1 (script 1), Activate2 (script 2) |

These are used by `flagConceptNeuronsForMigration()` to determine which action-category combinations in the concept lobe should grow dendrite connections toward the new friend/foe neuron.

---

## Dendrite Migration to the Concept Lobe

When a new friend/foe is added, the system triggers **dendrite migration** — a neural growth mechanism that creates new synaptic connections between the forf lobe and the concept lobe (`comb`):

```
┌──────────────────────────────────────────────────────────────────┐
│              DENDRITE MIGRATION FLOW                               │
│                                                                  │
│   addFriendOrFoe(agent)                                          │
│   ├── Set NGF_VAR = 1.0 on forf neuron [slot]                   │
│   └── flagConceptNeuronsForMigration(slot, agent)                │
│       │                                                          │
│       ├── Get categoryId of agent                                │
│       ├── For each BAD action script (hit = 13):                 │
│       │   ├── Convert script offset → decision neuron ID         │
│       │   ├── Concept neuron = numCategories * decNeuron + catId │
│       │   └── Set NGF_VAR = 1.0 on comb neuron                  │
│       │                                                          │
│       └── For each GOOD action script (activate1=1, activate2=2):│
│           ├── Convert script offset → decision neuron ID         │
│           ├── Concept neuron = numCategories * decNeuron + catId │
│           └── Set NGF_VAR = 1.0 on comb neuron                  │
│                                                                  │
│   Result: Tracts with migration enabled will grow dendrites      │
│   between the flagged comb neurons and the new forf neuron,      │
│   enabling the creature to learn friend-specific action          │
│   preferences.                                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

The concept lobe (`comb`) uses a 2D neuron layout: `rows = decision neurons × columns = categories`. The flagged neurons are the intersections of good/bad actions with the new friend's category — enabling the creature to learn, for example, "hitting a Norn is bad" or "activating food near this friend is good."

---

## Output: Reading Opinions

The forf lobe's primary output is consumed by `getOpinionOfCreature()`, which is called by the LinguisticFaculty when the creature expresses opinions about other creatures:

```javascript
// JS SensoryFaculty.js:1304-1339
getOpinionOfCreature(creatureOrPointer) {
    let opinion = 0.0;
    let moodOpinion = 0.0;

    for (let i = 0; i < this.myFriendsAndFoeHandles.length; i++) {
        if (this.myFriendsAndFoeHandles[i] === creatureOrPointer) {
            const brain = this.myCreature.Brain();
            if (brain) {
                opinion = brain.getNeuronState('forf', i, 'state');       // STATE_VAR
                moodOpinion = brain.getNeuronState('forf', i, 'output');  // OUTPUT_VAR
            }
            return { opinion, moodOpinion };
        }
    }

    return { opinion, moodOpinion };  // Not found → neutral (0.0, 0.0)
}
```

| Return Value | Source | Meaning |
|-------------|--------|---------|
| `opinion` | STATE_VAR (0) | Base affection level — persistent, modified by learning |
| `moodOpinion` | OUTPUT_VAR (2) | Current mood-influenced opinion — varies with creature's emotional state |

The `opinion` value determines what the creature "says" about another creature (via the linguistic system), and the `moodOpinion` captures the creature's current emotional coloring of that opinion.

---

## Slot Management

### Slot Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│              SLOT LIFECYCLE                                        │
│                                                                  │
│   1. EMPTY (null handle, empty moniker)                          │
│      ↓ addFriendOrFoe()                                         │
│   2. ACTIVE (valid handle, moniker set, timestamp recorded)      │
│      ↓ creature dies/exported                                    │
│   3. STALE (null handle, moniker retained, timestamp retained)   │
│      ↓ LRU eviction when new creature encountered                │
│   4. RECYCLED → back to state 2 with new creature                │
│                                                                  │
│   removeFriendAndFoe():                                          │
│      └── Clears handle, moniker, AND timestamp → back to EMPTY   │
│                                                                  │
│   removeFromAllFriendAndFoe():                                   │
│      └── Iterates ALL creatures in world, calls                  │
│          removeFriendAndFoe() on each — used when creature       │
│          dies or is exported                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Moniker Persistence

Monikers are stored alongside handles to support **save/load** scenarios. When a world is reloaded, agent handles become invalid but monikers persist. The social memory restoration system (`restoreSocialMemory()`) reconnects monikers to live agent references after loading.

### Handle Cleanup

`cleanUpInvalidFriendAgentHandles()` periodically checks for handles that have become invalid (agent was destroyed) and nullifies them, leaving the moniker and timestamp intact for potential reconnection.

---

## Comparison: Forf Lobe vs Other Input Lobes

| Aspect | Forf Lobe | Detail/Situation/Drive/Vision Lobes |
|--------|-----------|--------------------------------------|
| **Tracks** | Individual creatures + pointer | Categories, properties, states |
| **Persistence** | State persists across ticks | Reset each tick via setInput |
| **Input method** | `setNeuronState()` on specific vars | `setInput()` → INPUT_VAR accumulation |
| **Kinship awareness** | Yes — uses moniker comparison | Detail lobe also checks kinship, but per-tick |
| **Learning** | SVRule modifies STATE_VAR over time | SVRule processes fresh input each tick |
| **Migration** | NGF_VAR triggers dendrite growth | No migration system |
| **Output consumers** | LinguisticFaculty, concept lobe | Decision lobe, attention lobe |
| **Slot eviction** | LRU by encounter timestamp | N/A — fixed neuron indices |

---

## Key Constants

```javascript
// Neuron state variable indices (BrainConstants.js)
STATE_VAR  = 0   // Affection / base opinion
INPUT_VAR  = 1   // SVRule input
OUTPUT_VAR = 2   // SVRule output (mood opinion)
THIRD_VAR  = 3   // "Acting upon me" flag
FOURTH_VAR = 4   // Stranger flag (-1.0)
FIFTH_VAR  = 5   // Currently visible flag
SIXTH_VAR  = 6   // (unused)
NGF_VAR    = 7   // Dendrite migration flag

// Kinship initialization values
PARENT_CHILD_AFFECTION = 0.8
SIBLING_AFFECTION      = 0.225
SAME_GENUS_AFFECTION   = 0.175  // excludes genus 2 (Grendel)
STRANGER_FOURTH_VAR    = -1.0

// Catalogue entries (Creatures 3.catalogue)
BAD_ACTION_SCRIPTS  = ["13"]       // Hit
GOOD_ACTION_SCRIPTS = ["1", "2"]   // Activate1, Activate2
```

---

## Key Source Files

### JavaScript (Rebuild)

| File | Purpose |
|------|---------|
| `SensoryFaculty.js:55-87` | `postInit()` — sizes parallel arrays from `getLobeSize('forf') - 1` |
| `SensoryFaculty.js:938-1043` | `addFriendOrFoe()` — kinship detection and neuron initialization |
| `SensoryFaculty.js:1050-1059` | `clearSeenFriendsOrFoes()` — per-tick FIFTH_VAR/NGF_VAR reset |
| `SensoryFaculty.js:1067-1095` | `setSeenFriendOrFoe()` — marks visible individuals |
| `SensoryFaculty.js:1102-1112` | `removeFriendAndFoe()` — slot cleanup |
| `SensoryFaculty.js:1304-1339` | `getOpinionOfCreature()` — reads STATE_VAR and OUTPUT_VAR |
| `SensoryFaculty.js:1365-1399` | `setCreatureActingUponMe()` — THIRD_VAR interaction flagging |
| `SensoryFaculty.js:1538-1590` | `flagConceptNeuronsForMigration()` — concept lobe dendrite flagging |
| `FORF.js` | CAOS `FORF` command — calls `setCreatureActingUponMe()` |
| `Brain.js` | `setNeuronState()`, `getNeuronState()`, `getLobeSize()` |
| `BrainConstants.js` | `STATE_VAR`, `THIRD_VAR`, `FOURTH_VAR`, `FIFTH_VAR`, `NGF_VAR` indices |

---

## Related Articles

- [Vision Lobe Architecture](#/article/vision-lobe-architecture) - The vision loop that drives per-tick friend/foe visibility updates
- [Detail Lobe Architecture](#/article/detail-lobe-architecture) - Also uses kinship detection (for IT agent), but per-tick rather than persistent
- [Creature Perception](#/article/creature-perception) - Overview of all sensory modalities including friend/foe tracking
- [Brain & Neural Networks](#/article/brain-system) - Lobe architecture, SVRules, dendrite migration, and tract processing
- [Creature Faculties](#/article/creature-faculties) - SensoryFaculty and LinguisticFaculty within the faculty system
