# [resp] Response Lobe Architecture

This article provides a deep-dive into the response lobe (`resp`) — the brain's **reinforcement learning signal pathway**. With 20 neurons (one per creature drive), the response lobe encodes "what happened to my drives as a result of my last action." It is one of the 9 engine-fed input lobes and plays a central role in learning: when a creature eats food and its hunger decreases, the response lobe's hunger neuron receives a negative signal (drive reduced), which flows through tracts to modulate dendritic weights in the drive lobe, teaching the creature that eating reduces hunger. The response lobe has 2 engine write sources (instinct reinforcement and stimulus training) and 2 tract connections (inbound from `decn`, outbound to `driv`), making it a compact but critical learning hub.

## End-to-End Data Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│              RESPONSE LOBE DATA FLOW (END-TO-END)                      │
│                                                                       │
│   Engine writes to resp via setInput():                               │
│                                                                       │
│   ┌──────────────────────────┐                                        │
│   │  Instinct.process()      │── REM sleep reinforcement              │
│   │  (asleep, dreaming)      │   → resp neuron = 0.5 × amount        │
│   └──────────────────────────┘                                        │
│                                                                       │
│   ┌──────────────────────────┐                                        │
│   │  SensoryFaculty          │── Stimulus training (awake)            │
│   │  .adjustChemicalLevel    │   → resp neuron = drive adjustment     │
│   │   WithTraining()         │   (only when alert + learning valid)   │
│   └──────────────────────────┘                                        │
│                                                                       │
│   ┌──────────────────────────┐                                        │
│   │  SensoryFaculty          │── Stimulus training (asleep)           │
│   │  .adjustChemicalLevel    │   → prox neuron = drive adjustment     │
│   │   WithTraining()         │   (NOT resp — routes to prox instead)  │
│   └──────────────────────────┘                                        │
│                                                                       │
│               decn[11-12]                                             │
│                   │ decn→resp tract (time 2)                          │
│                   ▼                                                    │
│            ┌──────────┐                                               │
│            │   resp   │  20 neurons ("Creature Drives")               │
│            │ (time 1) │  Pass-through SVRule: input → state           │
│            └────┬─────┘                                               │
│                 │ resp→driv tract (time 3)                            │
│                 │ 1:1 mapping, writes to driv THIRD_VAR               │
│                 ▼                                                      │
│          ┌──────────┐                                                 │
│          │   driv   │  20 drive neurons                               │
│          │          │  THIRD_VAR carries response signal               │
│          │          │  → used in driv SVRule for learning              │
│          └──────────┘                                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## The Role of the Response Lobe in Learning

The response lobe is the brain's **credit assignment mechanism**. When a creature performs an action and experiences a consequence (reward or punishment), the response lobe carries the "what happened to my drives" signal from the stimulus system back into the drive lobe's neural circuitry:

1. **Creature eats food** → stimulus fires → hunger chemical decreases
2. **SensoryFaculty** detects drive chemical changed → writes adjustment to `resp` neuron for hunger
3. **resp→driv tract** carries the signal into the drive lobe's `THIRD_VAR`
4. **driv lobe SVRule** uses `THIRD_VAR` to modulate its processing — this is where the learning happens
5. **Downstream tracts** (driv→comb) have dendrite weights that are strengthened or weakened based on the reinforcement signal

The companion lobe is `prox` (proximity), which receives the same drive-change signal when the creature is **not alert** (asleep or unconscious). This separation ensures that learning from active decisions (resp) is distinct from passive proximity associations (prox).

---

## Lobe Properties (from norn.astro.48.gen)

| Property | Value | Notes |
|---|---|---|
| **Token** | `resp` | 4-character lobe identifier |
| **Full Name** | response | From Brain.catalogue index 9 |
| **Catalogue Position** | Lobes: 9, Input Lobes: 7, Quads: 9 | One of 9 input lobes |
| **Neuron Names** | "Creature Drives" | 20 drive names (shared with driv and prox) |
| **Dimensions** | 20 wide x 1 high | **20 neurons** |
| **Update Time** | 1 | Very early in the update cycle |
| **Switch-On Age** | 0 | Present from birth |
| **Winner Takes All** | No | Not a WTA lobe |
| **Tissue ID** | 255 | **No tissue** — no biochemical modulation |
| **Init Rule Always** | 0 | Init rule runs once only |

### Tissue ID 255: No Biochemical Link

Unlike most lobes, the response lobe has tissue ID 255, meaning it has **no biochemical tissue linkage**. It cannot be modulated by chemicals through receptors/emitters. This makes architectural sense: the response lobe is a pure signal relay for learning, not a target for chemical influence.

### Neuron Names: "Creature Drives"

The 20 neurons map 1:1 to the 20 creature drives:

| Neuron | Drive Name | Neuron | Drive Name |
|---|---|---|---|
| 0 | hurt | 10 | scared |
| 1 | hungry for protein | 11 | bored |
| 2 | hungry for starch | 12 | angry |
| 3 | hungry for fat | 13 | friendly |
| 4 | cold | 14 | homesick |
| 5 | hot | 15 | low down |
| 6 | tired | 16 | high up |
| 7 | sleepy | 17 | trapped |
| 8 | lonely | 18 | trapped |
| 9 | crowded | 19 | patient |

---

## SVRule: Pass-Through

The response lobe uses a minimal **pass-through** update rule — whatever input the neuron receives directly becomes its state. There is no decay, no accumulation history, and no threshold.

### Update Rule (pseudocode)

```
STATE = accumulator;      // Input directly becomes state
stop;
```

### SVRule Bytecodes

```
0: store accumulator in neuron[0]     // Write input to STATE
1: stop immediately                    // Done
```

### Init Rule

Empty (`stop immediately`) — neurons initialize to zero.

### Behavioral Effect

The pass-through SVRule means the response lobe is a **pure signal relay** — it captures the drive adjustment signal for exactly one brain tick, then returns to zero. There is no memory, no persistence. The signal exists only long enough for the outbound tract to carry it to the drive lobe. This is by design: reinforcement should be an instantaneous pulse, not a lingering influence.

---

## Engine Input Sources: Who Writes to Resp

The response lobe has **2 engine write sources**, both carrying drive-change signals:

### Source 1: Instinct.process() — REM Sleep Reinforcement

During REM sleep (dreaming), instinct genes are processed. After the instinct's input lobes are stimulated and the brain runs `updateComponents()`, the system checks whether the decision lobe selected the instinct's expected action. If so, the reinforcement signal is sent:

**JS (Instinct.js:122-123)**:
```javascript
const reinforcementAmount = REINFORCEMENT_MODIFIER * this.myReinforcement.amount;
this.myBrain.setInput('resp', this.myReinforcement.driveId, reinforcementAmount);
```

**What is written**:
- **Neuron**: `myReinforcement.driveId` — the drive that this instinct gene encodes as the reinforcement target (0-19)
- **Value**: `REINFORCEMENT_MODIFIER (0.5) × myReinforcement.amount` — the genome-encoded signed reinforcement amount, halved

The `myReinforcement.amount` is a **signed float** from the genome:
- **Positive**: reward signal (e.g., "eating reduces hunger" → positive reinforcement for the eat action)
- **Negative**: punishment signal (e.g., "hitting causes hurt" → negative reinforcement for the hit action)

After writing to resp, `updateComponents()` is called immediately to propagate the signal through tracts within the same tick.

### Source 2: SensoryFaculty.adjustChemicalLevelWithTraining() — Stimulus Learning

When a stimulus changes a drive chemical (e.g., eating food decreases hunger chemical), the stimulus system adjusts the biochemistry AND writes a learning signal to the brain. The routing depends on the creature's alert state:

**Original engine logic**:
```text
if (creature.Life().getWhetherAlert()) {
    // Creature is AWAKE — route to resp for active learning
    learn = true
    if (engine_synchronous_learning == 1) {
        // Verify: creature's current decision matches the script event
        // Verify: creature still has attention on the triggering agent
        if (mismatch) learn = false
    }
    if (learn)
        brain.setInput("resp", drive, adjustment)
} else {
    // Creature is ASLEEP — route to prox for passive learning
    brain.setInput("prox", drive, adjustment)
}
```

**JS (SensoryFaculty.js:1257-1310)**:
```javascript
adjustChemicalLevelWithTraining(chemicalId, adjustment, fromScriptEventNo, fromAgent) {
    this.adjustChemicalLevel(chemicalId, adjustment);

    const driveId = this.getDriveNumberOfChemical(chemicalId);
    if (driveId === -1) return;
    if (!fromAgent) return;

    const creature = this.myCreature;
    const brain = creature.getBrain();
    if (!brain) return;

    if (!creature.Life || !creature.Life().getWhetherAlert()) {
        brain.setInput('prox', driveId, adjustment);
        return;
    }

    let learn = true;
    const world = creature.getWorld ? creature.getWorld() : null;
    const syncLearning = world && world.getGameVar ?
        world.getGameVar('engine_synchronous_learning') : null;

    if (syncLearning && (syncLearning === 1 || syncLearning === '1')) {
        const pointer = world ? world.pointerAgent : null;
        if (fromAgent !== creature && fromAgent !== pointer) {
            if (creature.Motor && creature.Motor().getCurrentDecisionId) {
                const decisionOffset = creature.Motor().getCurrentDecisionId();
                const expectedScript = getExpectedAgentScriptFromDecisionOffset(decisionOffset);
                if (expectedScript === -1 || fromScriptEventNo === -1) learn = false;
                else if (fromScriptEventNo !== expectedScript) learn = false;
            }
            const itAgent = creature.getItAgent ? creature.getItAgent() : null;
            if (itAgent !== fromAgent) learn = false;
        }
    }

    if (learn) brain.setInput('resp', driveId, adjustment);
}
```

**What is written**:
- **Neuron**: `driveId` — the drive whose chemical was adjusted (0-19), determined by `getDriveNumberOfChemical()`
- **Value**: `adjustment` — the signed chemical change amount (positive = drive increased, negative = drive decreased)

### Alert-State Routing: resp vs prox

This routing is the key architectural distinction between active and passive learning:

| Creature State | Target Lobe | Learning Type | When |
|---|---|---|---|
| **Alert** (awake, conscious) | `resp` (response) | Active learning — "I did something and this happened" | During normal gameplay |
| **Not alert** (asleep, unconscious) | `prox` (proximity) | Passive learning — "something happened near me" | During sleep, unconsciousness |

### Synchronous Learning

The original engine has an additional **synchronous learning** check when `engine_synchronous_learning` is enabled (game variable):

1. If the stimulus came from an external agent (not self or pointer), verify:
   - The creature's **current decision** matches the script event that triggered the stimulus
   - The creature's **IT agent** is still the stimulus source
2. If either check fails, `learn = false` and resp is NOT written

This ensures the creature only learns from actions it actually performed on the object it was attending to, preventing spurious associations. The JS rebuild implements the **full** synchronous-learning check at `SensoryFaculty.js:1275-1309`, mirroring the original logic step-for-step (game-var gate, self/pointer bypass, decision-offset → expected-script comparison, and IT-agent match). The `getExpectedAgentScriptFromDecisionOffset` helper lives at `BrainScriptFunctions.js:141` and reads the same `Decision Offsets to Expected Agent Script` catalogue array as the original engine.

---

## Outbound Tracts: 1 Output Connection

### Tract: resp → driv (Drive Modulation)

The response lobe's sole outbound tract feeds directly into the drive lobe, carrying reinforcement signals.

| Property | Value |
|---|---|
| **Source Lobe** | `resp` (neurons 0-19, all 20) |
| **Destination Lobe** | `driv` (neurons 0-19, all 20) |
| **Connections** | 1:1 direct mapping (1 dendrite per neuron) |
| **Update Time** | 3 |
| **Switch-On Age** | 0 |
| **Migrates** | No (fixed mapping) |

**Tract SVRule (pseudocode)**:
```
acc = source.STATE;                    // Read resp neuron's STATE
dest.THIRD_VAR = acc;                  // Write to driv neuron's THIRD variable
dest.NGF_VAR = |acc|;                  // Write absolute value to NGF
stop;
```

**What this means**: Each resp neuron's state value is deposited into the corresponding driv neuron's `THIRD_VAR` (third variable slot). The absolute value is also written to `NGF_VAR`. This is how the drive lobe's SVRule can detect "a reinforcement signal was received" and use its magnitude and sign to modulate its processing — the drive SVRule reads `THIRD_VAR` as part of its update computation.

The `NGF_VAR` write provides the **unsigned magnitude** of the reinforcement, which may be used by the drive lobe or downstream tracts for dendrite migration or weight adjustment calculations.

---

## Inbound Tracts: 1 Input Connection

### Tract: decn → resp (Decision Feedback)

The response lobe receives input from the decision lobe, providing information about which action the creature is currently performing.

| Property | Value |
|---|---|
| **Source Lobe** | `decn` (neurons 11-12 only) |
| **Destination Lobe** | `resp` (neurons 0-14) |
| **Connections** | 2 source → 15 destination (15 dendrites per resp neuron) |
| **Update Time** | 2 (before resp→driv at time 3) |
| **Switch-On Age** | 0 |
| **Migrates** | No (fixed mapping) |

**Tract SVRule (pseudocode)**:
```
if source.FIFTH_VAR != 0 then continue; else stop;
// (minimal processing)
stop;
```

**What this means**: This tract connects decision neurons 11 and 12 (which correspond to actions "eat" and "approach" — the verb→decn bypass neurons) to response neurons 0-14. The SVRule checks the source neuron's `FIFTH_VAR` before proceeding, acting as a gate. This provides the response lobe with information about what decision was active, enabling it to correlate reinforcement signals with the action that caused them.

The update ordering is critical: decn→resp fires at time 2, then resp→driv fires at time 3, ensuring decision context arrives in resp before the reinforcement signal is relayed to driv.

---

## The Learning Pipeline

The response lobe is part of a multi-step learning pipeline:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LEARNING PIPELINE                                  │
│                                                                     │
│   1. STIMULUS EVENT                                                 │
│      Creature eats food → stimulus gene fires                       │
│      → chemical 1 (hunger) decreases by -0.3                       │
│                                                                     │
│   2. DRIVE CHEMICAL ADJUSTMENT                                      │
│      SensoryFaculty.adjustChemicalLevelWithTraining()               │
│      → biochemistry.adjustChemical(1, -0.3)                        │
│                                                                     │
│   3. ALERT-STATE ROUTING                                            │
│      Creature is awake? → YES → write to resp                      │
│      brain.setInput('resp', 1, -0.3)  // hunger drive, negative    │
│                                                                     │
│   4. RESP LOBE PROCESSING                                           │
│      Pass-through SVRule: STATE = -0.3                              │
│                                                                     │
│   5. RESP→DRIV TRACT (time 3)                                      │
│      driv neuron 1 (hunger) THIRD_VAR = -0.3                       │
│      driv neuron 1 (hunger) NGF_VAR = 0.3                          │
│                                                                     │
│   6. DRIV LOBE SVRule                                               │
│      Drive SVRule reads THIRD_VAR                                   │
│      Uses reinforcement signal to modulate drive processing         │
│                                                                     │
│   7. DOWNSTREAM TRACTS (driv→comb, etc.)                           │
│      Dendrite weights on driv→comb tract are adjusted:             │
│      "hunger" column in comb matrix learns that "eat" action       │
│      reduces hunger → strengthen eat-when-hungry connections        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Instinct Reinforcement (During REM Sleep)

The same pipeline operates during instinct processing, but the signal originates from the genome rather than from a real-time stimulus:

1. Instinct gene says: "When hungry, look at food, eat → hunger decreases (reinforcement amount = -0.5)"
2. Instinct system forces the brain state: noun=food, verb=eat, driv=hunger
3. Brain runs `updateComponents()` → decision lobe selects "eat"
4. If decision matches expectation: `resp` neuron 1 (hunger) = 0.5 × (-0.5) = -0.25
5. `updateComponents()` again → resp→driv tract fires → driv THIRD_VAR = -0.25
6. Dendritic learning occurs: connections from hunger→eat are strengthened

---

## Comparison: resp vs prox

The response and proximity lobes are **identical in structure** but serve different learning contexts:

| Aspect | Response (`resp`) | Proximity (`prox`) |
|---|---|---|
| **Token** | `resp` | `prox` |
| **Full Name** | response | proximity |
| **Neurons** | 20 ("Creature Drives") | 20 ("Creature Drives") |
| **Catalogue Index** | Lobes: 9, Quads: 9 | Lobes: 10, Quads: 10 |
| **Input Lobe Index** | 7 | 8 |
| **Tissue ID** | 255 (no tissue) | 255 (no tissue) |
| **Written When** | Creature is **alert** (awake) | Creature is **not alert** (asleep) |
| **Learning Type** | Active — "I did X and Y happened" | Passive — "Y happened near me" |
| **Purpose** | Credit assignment for intentional actions | Associative learning from proximity |

Both lobes use the same neuron naming ("Creature Drives") and receive the same type of signal (drive chemical adjustments). The routing decision in `adjustChemicalLevelWithTraining()` is the only difference.

---

## Engine Read Sites: None

No code in either the original engine or the JS rebuild explicitly reads response lobe neuron states via `GetNeuronState("resp", ...)` / `getNeuronState('resp', ...)`. The response lobe is **write-only** from the engine's perspective. Its neuron states are consumed exclusively by the outbound resp→driv tract.

---

## Instinct / Knowledge Interactions

### Instinct Processing

The response lobe is a **hardcoded reinforcement target** in instinct processing — not a configurable input. After the instinct's input lobes (noun, verb, driv) are stimulated and the brain produces a matching decision, `setInput('resp', driveId, 0.5 × amount)` is called at line 123 of `Instinct.js`.

The instinct gene's reinforcement section encodes:
- `driveId` (0-19): which resp neuron to write
- `amount` (signed float): positive for reward, negative for punishment
- These are multiplied by `REINFORCEMENT_MODIFIER = 0.5` before writing

### Knowledge Building

The response lobe is **not involved** in knowledge building (`Brain.processInstinctsAndKnowledge()`). Knowledge building stimulates only `noun`, `visn`, and `driv` lobes to discover default attention/decision preferences for each drive.

---

## Original Engine vs JavaScript Implementation

### Aligned

- Both write to resp from the same 2 sources (Instinct, SensoryFaculty)
- Both use `REINFORCEMENT_MODIFIER = 0.5` for instinct reinforcement
- Both implement alert-state routing (awake → resp, asleep → prox)
- Both outbound tracts (resp→driv) are genome-driven and identical
- **Synchronous learning is fully aligned**. The JS rebuild implements the complete `AdjustChemicalLevelWithTraining` flow at `SensoryFaculty.js:1257-1310`:
  1. `adjustChemicalLevel` applied first (chemical always changes, independent of learning)
  2. Drive-mapping lookup via `getDriveNumberOfChemical` — return if not a drive chemical
  3. Invalid-`fromAgent` guard (no training from null source)
  4. Alert check → asleep path writes to `prox`, awake path continues
  5. `engine_synchronous_learning` game-var gate
  6. Self / pointer bypass (always learn from self- or pointer-sourced stimuli)
  7. Decision-offset lookup → expected-script comparison via `getExpectedAgentScriptFromDecisionOffset` (`BrainScriptFunctions.js:141`, reading the `Decision Offsets to Expected Agent Script` catalogue)
  8. IT-agent match check
  9. `setInput('resp', drive, adjustment)` only if all checks pass

### Minor non-behavioral differences

- The original engine's `_ASSERT(IsThisAnIveBeenScript(fromScriptEventNo))` debug assertion is not wired in the JS path. `isThisAnIveBeenScript` is ported (`BrainScriptFunctions.js:191`) but, like the original, it is never consulted at runtime — it is a debug-build assert only.
- `STIM_TEST_TRACE` diagnostic output blocks in the original path are omitted from JS (development tracing only, no gameplay effect).

---

## Key Source Files

| File | Relevance |
|---|---|
| `Assets/Catalogue/Brain.catalogue` | Defines resp at index 9 — one of 9 input lobes, neuron names = "Creature Drives" (20 names) |
| `Main_Game/src/engine/creature/brain/Instinct.js` | Source 1: REM sleep reinforcement → `setInput('resp', driveId, 0.5×amount)` |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | Source 2: Stimulus training → `setInput('resp', driveId, adjustment)` when alert |
| `Main_Game/src/engine/creature/brain/Brain.js` | `setInput()` routing to lobe neurons |
| `Main_Game/src/engine/creature/brain/Lobe.js` | SVRule processing (pass-through for resp) |
| `Main_Game/src/engine/creature/brain/Tract.js` | resp→driv and decn→resp tract processing |

---

## Related Articles

- **[driv] Drive Lobe Architecture** — Downstream target receiving reinforcement via resp→driv tract's THIRD_VAR write
- **[decn] Decision Lobe Architecture** — Upstream source providing decision context via decn→resp tract
- **[comb] Combination Lobe Architecture** — Ultimate learning target where driv→comb dendrite weights encode "which actions satisfy which drives"
- **Instinct System** — Instinct processing writes reinforcement to resp during REM sleep
- **Creature Perception** — SensoryFaculty.adjustChemicalLevelWithTraining() is the primary awake-learning write path
- **Brain & Neural Networks** — Overview of the complete brain architecture including tract-based signal propagation
