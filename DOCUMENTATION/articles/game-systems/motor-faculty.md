# Motor Faculty

The **MotorFaculty** is the creature's action execution system — the bridge between neural decisions and physical behaviour. It reads the brain's attention and decision lobe outputs, determines the creature's focus of attention (the **IT object**), selects and fires the appropriate CAOS scripts for voluntary and involuntary actions, and supports the URGE macro override system that allows external stimuli to commandeer the creature's motor pipeline.

## Position in the Faculty System

MotorFaculty is **faculty index 2** — it updates after the SensoryFaculty (index 0) and the Brain (index 1). This ordering is architecturally critical: the brain needs fresh sensory data to produce decisions, and the MotorFaculty needs those decisions to act.

```
Tick Order:  SensoryFaculty → Brain → MotorFaculty → LinguisticFaculty → Biochemistry → ...
             (perceive)       (think)  (act)          (speak)             (metabolise)
```

When the creature is unconscious or in zombie state, the entire `update()` method returns immediately — no motor processing occurs. Sleeping creatures are handled differently: involuntary actions are blocked during sleep, but the attention pipeline still runs up to the alert check.

## The Update Cycle

Each creature tick, the MotorFaculty performs five sequential steps:

### Step 1: Consciousness Check

The first gate. If the creature is **unconscious** or a **zombie**, the update exits immediately. This prevents all motor activity for creatures that should not be moving or acting.

```
if (unconscious || zombie) → return immediately
```

### Step 2: Attention Pipeline — Setting the IT Object

The brain's **attention lobe** (`attn`) determines which category of agent the creature is focusing on. The MotorFaculty reads the winning attention neuron and resolves it to a concrete agent:

1. **Get winning attention ID**: Either from the URGE override (`myVoluntaryScriptOverrides.attentionScriptNo`) if active, or from the brain's attention lobe winner (`brain.getWinningId('attn')`)

2. **Resolve to known agent**: The winning attention ID is used as a category index into the SensoryFaculty's known agents array (`sensory.getKnownAgent(winningAttentionId)`)

3. **Handle IT change**: If the winning agent differs from the current IT object:
   - If the creature is **not introspective** and the attention category has changed, the current script is stopped (prevents stale scripts from continuing with a new target)
   - A **vision signal check** is performed: if the `visn` lobe neuron for this category has zero activity, the agent is discarded (the creature can't actually see anything there)
   - The IT agent is set on the creature
   - If no valid agent was found, the creature becomes **introspective** (thinking about itself rather than an external target)

4. **Update focus tracking**: `myCurrentFocusOfAttention` records the current attention category ID

### Step 3: Involuntary Action Processing

Involuntary actions are reflex behaviours triggered by biochemistry — they override voluntary decisions when strong enough.

**Prerequisite checks:**
- If the VM has finished running (no script active), reset `myCurrentInvoluntaryAction` to -1
- If an involuntary action is still in progress (`myCurrentInvoluntaryAction > -1`), skip all further processing — the reflex must complete first

**Selection algorithm** (matching the original engine exactly):

For each of the 8 involuntary action loci:

1. If the action's **latency** is zero (not in cooldown) AND the **locus value** exceeds a random float (0.0–1.0) AND the locus value is the strongest seen so far → this action becomes the candidate
2. If the action's latency is non-zero → decrement the latency counter

This probabilistic selection means higher locus values have a higher chance of triggering, but even weak signals occasionally fire. The random comparison also prevents deterministic lock-in.

**Execution conditions** (all must be true):
- `strongestSoFar > 0` — at least one candidate was found
- The creature is **alert** (awake) — involuntary actions during sleep cause problems
- The candidate differs from the current involuntary action — prevents re-triggering

**On execution:**
- The involuntary script event is fired: event number = `64 + actionIndex`
- If the script started successfully: `myCurrentAction` is reset to -1 (pretend voluntary action is quiescent), the creature becomes introspective, and the update returns
- If the script was not found: `myCurrentInvoluntaryAction` is reset to -1, and processing falls through to voluntary decision

### Step 4: Alert Check

If the creature is **not alert** (asleep or dreaming), the update returns here. This means sleeping creatures can still have their IT object updated (step 2) and involuntary action loci decremented (step 3), but they cannot perform voluntary actions.

### Step 5: Voluntary Decision Pipeline

The brain's **decision lobe** (`decn`) determines what action the creature wants to perform.

**Get script action:**
- If URGE override is active (`myVoluntaryScriptOverrides.decisionScriptNo >= 0`), use the override value
- Otherwise, read the decision lobe winner and convert via `getScriptOffsetFromNeuronId()` (supports catalogue-defined remapping)

**Script execution conditions** (any triggers re-execution):
- The action changed (`scriptAction !== myCurrentAction`)
- The IT object changed AND the creature is not introspective
- The VM is no longer running (script finished)

**Script execution sequence:**

1. Record the new `myCurrentAction` and reset `myCurrentInvoluntaryAction`
2. Determine **introspective vs extraspective**: `doesThisScriptRequireAnItObject()` checks whether this action needs a target
3. Calculate the **script event number**:
   - If the IT object is a creature: `scriptAction + 32` (creature-creature interaction)
   - Otherwise: `scriptAction + 16` (regular interaction)
4. **No-target safety check**: If there's no IT object, the creature is extraspective, and there's no smell trail for this category → reset animation and stop the VM
5. **Try creature-creature script first** (event `scriptAction + 32`): If it starts, done
6. **Fallback to regular script** (event `scriptAction + 16`): If it starts, done
7. **Both failed**: Reset animation string and stop VM execution. No disappointment stimulus is fired — the creature simply stops

## Script Event Number System

The MotorFaculty uses three offset ranges to distinguish script types:

| Range | Offset | Formula | Purpose |
|---|---|---|---|
| 16–31 | +16 | `scriptAction + 16` | Regular interaction with agent |
| 32–47 | +32 | `scriptAction + 32` | Creature-creature interaction |
| 64–71 | +64 | `64 + involuntaryIndex` | Involuntary action scripts |

The creature-creature range takes priority: the motor first tries the +32 event, and only falls back to the +16 event if no creature-creature script exists. This allows genome designers to define special behaviours when creatures interact with each other (e.g., mating, fighting) while sharing the same base action scripts for interacting with objects.

## Voluntary Action Names

The decision lobe output maps to these action script offsets (default 1:1 mapping via `BrainScriptFunctions`):

| Script Offset | Action | Requires IT | Description |
|---|---|---|---|
| 0 | Quiescent | No | Idle / do nothing |
| 1 | Activate 1 | Yes | Touch / push the IT object |
| 2 | Activate 2 | Yes | Pull the IT object |
| 3 | Deactivate | Yes | Stop interacting with IT |
| 4 | Approach | Yes | Walk towards IT |
| 5 | Retreat | No | Run away |
| 6 | Eat | Yes | Eat the IT object |
| 7 | Hit | Yes | Hit / attack the IT object |
| 8–13 | Extended | Varies | Additional actions (modding) |

The `doesThisScriptRequireAnItObject()` function determines whether the creature is **introspective** (actions 0 and 5, which don't need a target) or **extraspective** (all others, which require an IT object).

The mapping between decision lobe neurons and script offsets is configurable through the "Action Script To Neuron Mappings" catalogue entry, allowing mods to remap the brain-to-behaviour translation.

## Involuntary Actions

Eight biochemistry-driven reflex slots:

| Index | Action | Script Event | Description |
|---|---|---|---|
| 0 | Flinch | 64 | Pain response |
| 1 | Lay Egg | 65 | Reproductive reflex |
| 2 | Sneeze | 66 | Respiratory irritant |
| 3 | Cough | 67 | Respiratory irritant |
| 4 | Shiver | 68 | Cold response |
| 5 | Sleep | 69 | Exhaustion response |
| 6 | Fainting | 70 | Consciousness loss |
| 7 | Reflex 7 | 71 | Unassigned (available for mods) |

Each involuntary action has two properties:
- **locus** (`float`, 0.0–1.0): Signal strength, written by biochemistry receptors. Higher values increase the probability of triggering.
- **latency** (`byte`): Cooldown counter in creature ticks. After an involuntary action fires, its script can set a latency value to prevent immediate re-triggering. Decremented by 1 each tick until reaching 0.

Note: Action 8 ("die") is listed in the original engine's comments but handled separately by the LifeFaculty death sequence, not by the MotorFaculty.

## The URGE Override System

The URGE macro (delivered through the stimulus system) allows CAOS scripts and other creatures to override the brain's decisions. Two independent overrides exist:

| Override | Field | Effect |
|---|---|---|
| Attention | `attentionScriptNo` | Forces the creature to focus on a specific agent category (bypasses attention lobe) |
| Decision | `decisionScriptNo` | Forces the creature to perform a specific action (bypasses decision lobe) |

**Setting overrides:**
- `nounStim > 1.0` in a stimulus → `setAttentionOverride(categoryId)` — the creature MUST look at this category
- `verbStim > 1.0` in a stimulus → `setDecisionOverride(scriptOffset)` — the creature MUST perform this action
- Both can be active simultaneously (e.g., "eat the food" = attention override to food category + decision override to eat action)
- Value of -1 means no override (use brain output)

**Override history:** All override changes are recorded in `overrideHistory` (50 entries) for debugging, with tick and delta timing.

## Biochemistry Locus Binding

The MotorFaculty exposes its involuntary action loci to the biochemistry system through `getLocusAddress()`:

| Type | Organ | Tissue | Locus Range | Target |
|---|---|---|---|---|
| Receptor | `ORGAN_CREATURE` | `TISSUE_SENSORIMOTOR` | `LOC_INVOLUNTARY0` – `LOC_INVOLUNTARY7` | `myInvoluntaryActions[i].locus` |
| Emitter | `ORGAN_CREATURE` | `TISSUE_SENSORIMOTOR` | `LOC_E_INVOLUNTARY0` – `LOC_E_INVOLUNTARY7` | `myInvoluntaryActions[i].locus` |

This allows genome-defined receptor genes to write biochemistry signals directly into the involuntary action loci. For example, a receptor gene might wire high pain chemical to the flinch locus, or high progesterone to the lay-egg locus.

Emitter loci allow the involuntary action signal strength to be read back into the biochemistry, enabling feedback loops (e.g., an involuntary action that depletes the chemical that caused it).

## Introspective vs Extraspective

A creature is **introspective** when thinking about itself (no external target needed) and **extraspective** when interacting with the world (needs an IT object).

The MotorFaculty sets this flag based on the current action:
- **Introspective** actions (quiescent, retreat): `setIntrospective(true)` — the creature doesn't need to approach anything
- **Extraspective** actions (activate, eat, hit, approach): `setIntrospective(false)` — the creature needs an IT target
- When IT becomes null: automatically set to introspective
- During involuntary actions: always set to introspective (reflexes don't target external agents)

This flag affects the SensoryFaculty's visual persistence check (introspective creatures don't hold onto category representatives as strongly) and the decision pipeline's script restart logic.

## Failed Action Behaviour

When a voluntary action script is not found (neither creature-creature nor regular variant exists):
1. The creature's animation string is reset (`resetAnimationString()`)
2. The VM script execution is stopped (`stopScriptExecuting()`)

No disappointment stimulus (stimulus 0) is fired. The creature simply stops its current animation and waits for the next brain decision cycle. This is a deliberate design choice in the original engine: failed actions are silent failures, not punished events.

## Key Constants

| Constant | Value | Purpose |
|---|---|---|
| `NUMINVOL` | 8 | Number of involuntary action slots |
| `SCRIPT_OFFSET_REGULAR` | 16 | Base event offset for regular interaction scripts |
| `SCRIPT_OFFSET_CREATURE` | 32 | Base event offset for creature-creature scripts |
| `SCRIPT_INVOLUNTARY_BASE` | 64 | Base event offset for involuntary scripts |
| `NUMACTIONS` | 14 | Number of voluntary action types |

## Serialisation

The MotorFaculty serialises in this order (matching the original `Write()`/`Read()` format):

1. Base Faculty data (creature handle)
2. `myCurrentFocusOfAttention` — int32
3. `myCurrentAction` — int32
4. `myCurrentInvoluntaryAction` — int32
5. `myVoluntaryScriptOverrides.attentionScriptNo` — int32
6. `myVoluntaryScriptOverrides.decisionScriptNo` — int32
7. For each involuntary action (NUMINVOL iterations):
   - `latency` — byte
   - `locus` — float (via `ReadFloatRefTarget`/`WriteFloatRefTarget`)

Note: Older save files may serialise only 5 involuntary actions (`NUMINVOL_SERIALIZED = 5`); the JS implementation handles both formats.

## File Locations

| File | Description |
|---|---|
| `Rebuild/Main_Game/src/engine/creature/faculties/MotorFaculty.js` | JS implementation |
| `Rebuild/Main_Game/src/engine/creature/brain/BrainScriptFunctions.js` | Script offset ↔ neuron ID mapping |

## Related Articles

- [Creature Faculties](creature-faculties.md) — Overview of all 9 faculty subsystems
- [Sensory Faculty](sensory-faculty.md) — Perception, known agents, and the attention source
- [Biochemistry System](biochemistry-system.md) — Drive chemicals and locus binding
- [Stimulus System](stimulus-system.md) — URGE/SWAY/ORDR delivery and the stimulus pipeline
