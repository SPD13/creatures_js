# Reinforcement Learning Pipeline

This article details the complete **reinforcement learning pipeline** in the Creatures 3 brain — the mechanism by which creatures learn from experience. When a creature performs an action and its drives change as a result, the brain strengthens or weakens the neural connections that led to that action. This is how a creature learns "eating food reduces hunger" or "touching a hot thing causes pain."

The pipeline spans four systems: **stimulus delivery** (CAOS scripts), **sensory processing** (SensoryFaculty), **brain reinforcement** (resp lobe + reward/punishment chemicals), and **weight consolidation** (STW/LTW convergence). Three distinct learning modes operate on the same underlying dendrite weight mechanism: real-time stimulus learning (awake), instinct processing (dreaming), and proximal reinforcement (asleep).

## End-to-End Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│            REINFORCEMENT LEARNING PIPELINE (END-TO-END)             │
│                                                                     │
│  1. ACTION CONSEQUENCE                                              │
│     Agent script runs STIM command                                  │
│     → adjusts creature's drive chemical (e.g., hunger ↓)           │
│                                                                     │
│  2. STIMULUS PROCESSING (SensoryFaculty)                            │
│     processStimulus() → adjustChemicalLevelWithTraining()           │
│     → maps chemical to drive ID (getDriveNumberOfChemical)         │
│     → synchronous learning gate (script match + attention match)   │
│     → brain.setInput('resp', driveId, adjustment)                  │
│                                                                     │
│  3. BRAIN SIGNAL PROPAGATION                                        │
│     resp lobe → resp→driv tract → driv THIRD_VAR                  │
│     Brain updateComponents() propagates signal through all tracts  │
│                                                                     │
│  4. REWARD/PUNISHMENT CHEMICALS                                     │
│     resp signal → neuroemitters → biochemistry chemicals           │
│     → reward/punishment chemicals circulate                        │
│                                                                     │
│  5. DENDRITE WEIGHT MODIFICATION (Tract.processRewardAndPunishment)│
│     For each dendrite in reinforcement-enabled tracts:              │
│       Gate: dstNeuron OUTPUT_VAR ≠ 0 (winning neuron only)        │
│       Read: reward chemical level from biochemistry                │
│       Modify: STW += rate × (chemLevel - threshold)               │
│                                                                     │
│  6. WEIGHT CONSOLIDATION (SVRule opcode 44)                         │
│     STW → LTW convergence (permanent learning)                    │
│     LTW → STW convergence (forgetting/stability)                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Action Consequences (STIM Commands)

Learning begins when an action produces a consequence. In Creatures 3, this happens through **STIM** and **SWAY** CAOS commands embedded in agent scripts.

When a creature eats food, the food agent's script runs something like:

```
STIM WRIT targ 36 1 148 -0.5 0 0 0 0
```

This delivers stimulus 36 to the creature, adjusting chemical 148 (hunger for protein) by -0.5. The STIM command calls `SensoryFaculty.stimulate()` which processes the stimulus.

**STIM variants** deliver stimuli through different perception channels:
- `STIM WRIT` — direct delivery (writing/touching)
- `STIM TACT` — tactile (touch range)
- `STIM SIGN` — visual (sight range)
- `STIM SHOU` — auditory (hearing range)

**SWAY** commands create ad-hoc stimuli with explicit chemical adjustments. SWAY always sets `forceNoLearning = true`, so SWAY bypasses the reinforcement pipeline and only adjusts chemicals directly. In the stimulus dispatch, `Stimulate()` dispatches to `ProcessStimulus()`.

---

## Step 2: Sensory Processing and Learning Gate

The `SensoryFaculty.processStimulus()` method handles each stimulus. For each of the 4 chemical adjustment slots in the stimulus, it calls either `adjustChemicalLevel()` (no training) or `adjustChemicalLevelWithTraining()` (with training), depending on per-slot bit flags.

### adjustChemicalLevelWithTraining()

**Location**: `SensoryFaculty.js:1270`

This method is the gateway to reinforcement learning:

```
adjustChemicalLevelWithTraining(chemicalId, adjustment, fromScriptEventNo, fromAgent):
    1. adjustChemicalLevel(chemicalId, adjustment)     ← always applies chemical change
    2. driveId = getDriveNumberOfChemical(chemicalId)  ← map chemical → drive
       if driveId == -1: return                        ← not a drive chemical, no training
    3. if !fromAgent: return                           ← no source agent, can't train
    4. if creature is asleep:
         brain.setInput('prox', driveId, adjustment)   ← proximal reinforcement (dreams)
         return
    5. if synchronous learning enabled:
         check script match AND attention match         ← learning gate
    6. if learn:
         brain.setInput('resp', driveId, adjustment)   ← REINFORCEMENT SIGNAL
```

### Drive Chemical Mapping

The `getDriveNumberOfChemical()` method maps biochemistry chemical IDs to drive indices using the `drive_chemical_numbers` catalogue entry:

| Drive Index | Name | Chemical ID |
|-------------|------|-------------|
| 0 | Pain | 148 |
| 1 | Need for Pleasure | 149 |
| 2 | Hunger | 150 |
| 3 | Coldness | 151 |
| 4 | Hotness | 152 |
| 5 | Tiredness | 153 |
| 6 | Sleepiness | 154 |
| 7 | Loneliness | 155 |
| 8 | Crowdedness | 156 |
| 9 | Fear | 157 |
| 10 | Boredom | 158 |
| 11 | Anger | 159 |
| 12 | Sex Drive | 160 |
| 13 | Injury | 161 |
| 14 | Suffocation | 162 |
| 15-19 | Navigation drives | 199-203 |

If a stimulus adjusts a non-drive chemical (e.g., an enzyme), `getDriveNumberOfChemical()` returns -1 and no training occurs.

### Synchronous Learning Gate

When the `engine_synchronous_learning` game variable is enabled, the system applies two checks to prevent the creature from learning incorrect associations:

1. **Script Match**: The creature's current decision (from `MotorFaculty.getCurrentDecisionId()`) must correspond to the stimulus source's script event number. This ensures the creature only learns from the consequences of its own chosen action, not from unrelated events.

2. **Attention Match**: The creature's current IT agent (focus of attention) must be the stimulus source. This prevents learning from agents the creature isn't paying attention to.

Both checks must pass for `learn` to remain `true`. Self-stimulation (from the creature itself) and pointer-stimulation (from the player) bypass these checks.

---

## Step 3: The resp Lobe and Signal Propagation

When `brain.setInput('resp', driveId, adjustment)` fires, the signal enters the response lobe. The resp lobe has 20 neurons (one per drive), each with a pass-through SVRule (`STO neuron[0]`) that stores the input directly as its state.

The signal then propagates through two key tracts:

1. **resp→driv tract** (updateTime 3): Carries the response signal to the drive lobe's `THIRD_VAR` (neuron state index 3). This embeds the "what happened" signal alongside the current drive levels.

2. **Downstream propagation**: The drive lobe feeds into `driv→comb` tracts, which connect to the combination lobe — the 440-neuron decision matrix (40 categories x 11 actions). This is where reinforcement-enabled dendrite weights live.

---

## Step 4: Reward and Punishment Chemicals

The resp lobe signal is converted into biochemistry chemicals via **neuroemitters**. These neuroemitters read from resp lobe neuron states and inject corresponding chemicals into the biochemistry system. The reward and punishment chemicals then circulate and are read by tracts during their update cycle.

Each reinforcement-enabled tract monitors specific chemicals:
- **Reward chemical**: When present above threshold, strengthens dendrite weights (positive reinforcement)
- **Punishment chemical**: When present above threshold, weakens dendrite weights (negative reinforcement)

The chemical indices, thresholds, and rates are configured dynamically by SVRule opcodes during each tract update (see Step 5).

---

## Step 5: Dendrite Weight Modification

This is the core learning mechanism. During each tract update, after the SVRule processes each dendrite, `processRewardAndPunishment()` is called.

**Location**: `Tract.js:530`

### The Winner Gate

```javascript
const dstOutput = dendrite.dstNeuron.states[OUTPUT_VAR];
if (dstOutput === 0.0) {
    return;  // Only reinforce winning neurons
}
```

This is the critical **credit assignment** mechanism. Only dendrites connected to the **winning neuron** (the one selected by `DO_WINNER_TAKES_ALL`) have their weights modified. The `OUTPUT_VAR` (neuron state index 2) is non-zero only for the neuron that won the winner-takes-all competition.

This ensures that only the neural pathway that led to the chosen action gets reinforced — the creature learns about the consequences of what it actually did, not what it could have done.

### Weight Modification Formula

For each winning dendrite:

```
if rewardChemicalLevel > rewardThreshold:
    modifier = rewardChemicalLevel - rewardThreshold
    STW = clamp(STW + rewardRate * modifier, -1, 1)

if punishmentChemicalLevel > punishmentThreshold:
    modifier = punishmentChemicalLevel - punishmentThreshold
    STW = clamp(STW + punishmentRate * modifier, -1, 1)
```

Key properties:
- **Only STW (short-term weight) is modified** — not LTW (long-term weight) directly
- Reward and punishment are **independent** — both can be active on the same dendrite
- The `rate` parameter controls magnitude; positive rates strengthen, negative rates weaken
- All weights are bounded to [-1, 1]

### SVRule Configuration Opcodes

The reinforcement parameters are set dynamically by the tract's SVRule during each dendrite update:

| Opcode | Code | Function |
|--------|------|----------|
| `SET_REWARD_THRESHOLD` | 57 | Minimum chemical level to trigger reward |
| `SET_REWARD_RATE` | 58 | Magnitude of reward weight change |
| `SET_REWARD_CHEMICAL_INDEX` | 59 | Which chemical triggers reward (also enables reinforcement) |
| `SET_PUNISHMENT_THRESHOLD` | 60 | Minimum chemical level to trigger punishment |
| `SET_PUNISHMENT_RATE` | 61 | Magnitude of punishment weight change |
| `SET_PUNISHMENT_CHEMICAL_INDEX` | 62 | Which chemical triggers punishment (also enables reinforcement) |

Setting a chemical index (opcodes 59 or 62) automatically sets the `dendritesSupportReinforcement` flag to `true`, enabling the reinforcement system for that tract.

---

## Step 6: Weight Consolidation (STW/LTW Convergence)

Dendrites have two weight channels:
- **STW** (Short-Term Weight, index 0): Changes rapidly during learning. Modified by reward/punishment.
- **LTW** (Long-Term Weight, index 1): Changes slowly. Represents permanent, consolidated learning.

Two SVRule opcodes manage the bidirectional convergence:

### DO_SET_ST_TO_LT_RATE (opcode 43)

Sets the rate at which STW tends toward LTW. This is the **forgetting** direction — without ongoing reinforcement, short-term learning fades back to the long-term baseline.

```
stToLTRate = abs(operand)
```

### DO_SET_LT_TO_ST_RATE_AND_DO_WEIGHT_ST_LT_WEIGHT_CONVERGENCE (opcode 44)

Sets the LTW→STW rate AND performs the convergence calculation:

```
ltToSTRate = operand

// Bidirectional convergence
STW += (LTW - STW) * stToLTRate    // STW tends toward LTW (forgetting)
LTW += (STW - LTW) * ltToSTRate    // LTW tends toward STW (consolidation)
```

This creates a memory system with distinct dynamics:
- **Fast learning**: STW changes immediately from reward/punishment
- **Slow consolidation**: LTW gradually absorbs STW changes over many ticks
- **Graceful forgetting**: Without reinforcement, STW drifts back toward LTW
- **Stability**: LTW only changes slowly, preserving long-term knowledge

### clearActivity() and Instinct Processing

During instinct processing, `Tract.clearActivity()` resets all dendrites:

```
STW = LTW  // Short-term reset to long-term baseline
```

This prepares the brain for instinct training by clearing any recent transient weight changes. After instinct processing applies its forced reinforcement, the resulting STW changes are then consolidated into LTW through the normal convergence mechanism.

---

## The Three Learning Modes

### 1. Stimulus Learning (Awake)

The primary learning mode during waking life.

```
Agent script → STIM → SensoryFaculty.processStimulus()
  → adjustChemicalLevelWithTraining()
  → synchronous learning gate (script + attention match)
  → brain.setInput('resp', driveId, adjustment)
  → reward/punishment chemicals → dendrite STW modification
```

**Characteristics**: Gated by synchronous learning, only trains relevant pathways, requires the creature to actively interact with objects.

### 2. Instinct Processing (Dreaming/REM)

Hardwired behaviour patterns from the genome, processed during REM sleep.

```
LifeFaculty → dreaming state → brain.setWhetherToProcessInstincts(true)
  → Brain.update() enters instinct mode
  → for each instinct:
      clearActivity() → force inputs → force decision → updateComponents()
      → if decision accepted:
          brain.setInput('resp', driveId, 0.5 * amount)
          → updateComponents() → dendrite weight changes
```

**Characteristics**: Bypasses all gating, forces specific stimulus-response-reinforcement triplets, creates foundational behavioural associations. Each instinct processes exactly once and is removed from the queue.

### 3. Proximal Reinforcement (Asleep, non-dreaming)

A simplified learning mode for sleeping creatures.

```
Stimulus arrives while asleep
  → adjustChemicalLevelWithTraining()
  → creature not alert → brain.setInput('prox', driveId, adjustment)
```

**Characteristics**: Routes to the `prox` (proximity) lobe instead of `resp`, bypasses synchronous learning checks, operates during non-REM sleep.

---

## Dendrite Weight Structure

Each dendrite maintains 8 weight variables:

| Index | Name | Role |
|-------|------|------|
| 0 | WEIGHT_SHORTTERM_VAR | Recent learning (modified by reinforcement) |
| 1 | WEIGHT_LONGTERM_VAR | Permanent learning (consolidated from STW) |
| 2 | SECOND_DENDRITE_VAR | Available to SVRules |
| 3 | THIRD_DENDRITE_VAR | Available to SVRules |
| 4 | FOURTH_DENDRITE_VAR | Available to SVRules (used by visn→move for memory) |
| 5 | FIFTH_DENDRITE_VAR | Available to SVRules |
| 6 | SIXTH_DENDRITE_VAR | Available to SVRules |
| 7 | STRENGTH_VAR | Migration resistance (NGF-based dendrite migration) |

The SVRule for each tract determines how these weights are used during neural processing. For example, the visn→move tract uses `FOURTH_DENDRITE_VAR` (index 4) to store the previous vision value for motion detection.

---

## Conditions and Gates Summary

| Gate | Location | Condition | Effect |
|------|----------|-----------|--------|
| Drive mapping | SensoryFaculty | `getDriveNumberOfChemical() != -1` | Only drive chemicals trigger training |
| Source agent | SensoryFaculty | `fromAgent != null` | Must have identifiable source |
| Alert state | SensoryFaculty | `creature.Life().getWhetherAlert()` | Routes to resp (alert) or prox (asleep) |
| Synchronous learning | SensoryFaculty | Script match AND attention match | Prevents false conditioning |
| Reinforcement support | Tract | `supportReinforcementFlag == true` | Tract must enable reinforcement |
| Chemical index set | SVRule 59/62 | Chemical index configured | Dendrites must be configured for reinforcement |
| Winner neuron | processRewardAndPunishment | `dstNeuron.OUTPUT_VAR != 0` | Only winning pathway gets reinforced |
| Chemical threshold | reinforceAVariable | `chemLevel > threshold` | Chemical must exceed minimum level |
| Instinct decision | Instinct.process() | `getWinningId('decn') == myDecisionId` | Instinct aborts if forced decision not accepted |

---

## Key Source Files

| File | Role |
|------|------|
| `SensoryFaculty.js` | Stimulus processing, learning gate, resp/prox input |
| `Tract.js` | processRewardAndPunishment(), ReinforcementDetails, clearActivity() |
| `SVRule.js` | Reinforcement opcodes (43, 44, 57-62), weight convergence |
| `Instinct.js` | Instinct processing during REM sleep |
| `Brain.js` | update() mode switching, instinct/knowledge building |
| `Dendrite.js` | Weight variable storage (STW, LTW, strength) |
| `BrainConstants.js` | NeuronVar and DendriteVar enums |
