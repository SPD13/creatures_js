# Creature Action Pipeline

How does a creature go from "I want to eat" to actually eating something? The answer is a multi-stage pipeline that flows from **biochemistry** through the **brain's neural lobes** into the **MotorFaculty**, which fires the appropriate **CAOS decision script**. This article documents the complete pipeline from chemical drive to executed action.

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CREATURE ACTION PIPELINE                          │
│                                                                    │
│  BIOCHEMISTRY (drives, chemicals)                                  │
│       │                                                            │
│       ▼                                                            │
│  BRAIN LOBES                                                       │
│   ├── Drive lobe ──► what do I need?                               │
│   ├── Stimulus/Verb lobe ──► what actions are rewarding?           │
│   ├── Attention lobe (attn) ──► WHAT to focus on (category)       │
│   ├── Decision lobe (decn) ──► WHAT to do (action)                │
│   │                                                                │
│   ▼                                                                │
│  MOTOR FACULTY (MotorFaculty.update)                               │
│   ├── 1. Consciousness gate                                       │
│   ├── 2. Attention ──► IT object (from SensoryFaculty)            │
│   ├── 3. Involuntary actions (reflexes)                           │
│   ├── 4. Alert gate                                                │
│   └── 5. Decision ──► script execution                            │
│            │                                                       │
│            ▼                                                       │
│  CAOS SCRIPT (creatureDecisions.cos)                               │
│   ├── Validate: can IT be reached? does IT support this action?   │
│   ├── YES ──► perform action + positive stimulus                  │
│   └── NO  ──► Disappoint stimulus (negative reinforcement)        │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Biochemistry Builds Pressure

Everything starts with chemicals. The creature's biochemistry simulation runs continuously, processing reactions, emitters, and receptors. Key drive chemicals (hunger, pain, fear, boredom, etc.) accumulate over time.

These chemical concentrations are fed into the brain's **drive lobe** as input signals. High hunger drives the creature to seek food; high boredom drives it to seek toys; high fear drives it to flee.

---

## Step 2: Brain Lobes Choose Attention and Action

The brain processes inputs through multiple lobes to produce two critical outputs:

### Attention Lobe (`attn`)

The attention lobe determines **what category** the creature focuses on (food, toy, creature, machine, etc.). Its winning neuron ID corresponds to a category in the `CategorySystem`.

The SensoryFaculty maintains a "known agent" for each category — the most recently perceived concrete agent of that type. The winning attention category selects which known agent becomes the **IT object**.

### Decision Lobe (`decn`)

The decision lobe determines **what action** the creature performs. Its winning neuron maps to a script offset (0-13) through the `BrainScriptFunctions` mapping system:

| Neuron/Offset | Action | Event (regular) | Event (creature) |
|---------------|--------|-----------------|-------------------|
| 0 | Quiescent (idle) | 16 | 32 |
| 1 | Activate 1 | 17 | 33 |
| 2 | Activate 2 | 18 | 34 |
| 3 | Deactivate | 19 | 35 |
| 4 | Approach | 20 | 36 |
| 5 | Retreat | 21 | 37 |
| 6 | Pick Up | 22 | 38 |
| 7 | Drop | 23 | 39 |
| 8 | Express Need | 24 | 40 |
| 9 | Rest | 25 | 41 |
| 10 | Walk West | 26 | 42 |
| 11 | Walk East | 27 | 43 |
| 12 | Eat | 28 | 44 |
| 13 | Hit | 29 | 45 |

The mapping between neuron IDs and script offsets is configurable via catalogue data (`Action Script To Neuron Mappings`), allowing mods to remap the brain-to-action translation. The default is a 1:1 identity mapping.

---

## Step 3: MotorFaculty Pipeline

`MotorFaculty.update()` runs every creature tick and executes a strict 5-stage pipeline. Each stage can abort the pipeline early.

### Stage 1: Consciousness Gate

```
if unconscious or zombie → return (no actions at all)
```

Unconscious and zombie creatures cannot perform any actions.

### Stage 2: Attention → IT Object

```
winningAttentionId = override OR brain.getWinningId('attn')
winningAgent = sensoryFaculty.getKnownAgent(winningAttentionId)
```

1. Check if there's a CAOS override (`URGE` command sets `myVoluntaryScriptOverrides.attentionScriptNo`)
2. Otherwise, read the winning neuron from the attention lobe
3. Look up the concrete agent the SensoryFaculty has stored for that category
4. If the IT object changed and the creature was mid-script on the old target, stop the current script
5. Verify the vision lobe (`visn`) still has signal for this category — if not, clear the agent
6. Set the winning agent as the creature's IT object via `creature.setItAgent()`

If there's no valid agent, mark the creature as **introspective** (self-focused, not targeting an object).

### Stage 3: Involuntary Actions (Reflexes)

Before voluntary decisions are processed, the system checks 8 involuntary action loci. These are driven by biochemistry receptors — chemicals like sleepiness, pain, or nausea set the locus values.

```
for each involuntary action (0-7):
    if latency == 0 AND locus > random(0..1) AND locus > best_so_far:
        candidate = this action
    else if latency > 0:
        latency--  (count down cooldown)
```

The probabilistic comparison (`locus > random()`) means stronger chemical signals are more likely to trigger, but weak signals occasionally fire too. Each involuntary action can set a cooldown latency to prevent rapid repeats.

| Index | Action | Trigger Chemical |
|-------|--------|-----------------|
| 0 | Flinch | Pain |
| 1 | Lay Egg | Progesterone/Testosterone |
| 2 | Sneeze | Histamine A |
| 3 | Cough | Histamine B |
| 4 | Shiver | Coldness |
| 5 | Sleep | Sleepiness |
| 6 | Fainting | Injury |
| 7 | (Reserved) | - |

If an involuntary action fires (event 64+), it **completely skips** voluntary decision processing. The creature cannot choose what to do while sneezing.

### Stage 4: Alert Gate

```
if not alert (asleep) → return (no voluntary actions during sleep)
```

Involuntary actions are also blocked during sleep (checked in Stage 3).

### Stage 5: Decision → Script Execution

This is the core of voluntary action triggering:

```
scriptAction = override OR getScriptOffsetFromNeuronId(brain.getWinningId('decn'))
```

A new script fires when **any** of these conditions is true:

| Condition | Meaning |
|-----------|---------|
| `scriptAction != myCurrentAction` | Brain changed its mind — different action |
| `newIt != oldIt && !introspective` | Same action but on a different object |
| `!vm.isRunning()` | Previous script finished — restart the action |

The third condition is what creates the **continuous behavior loop**. When a decision script reaches `endm` and the VM stops, the very next tick detects `!vm.isRunning()` and fires the same decision again. The creature keeps retrying the same action on the same object until the brain selects a different winner.

#### Script Event Number Calculation

```
event = scriptAction + (isCreatureTarget ? 32 : 16)
```

- **Event 16-29**: Regular actions on non-creature agents (machines, food, toys)
- **Event 32-45**: Creature-to-creature actions (patting, slapping, mating)

If the creature-creature script (32+) doesn't exist, the system falls back to the regular script (16+).

#### No IT Object Handling

If the creature has no IT object and the chosen action requires one (is "extraspective"):

```
if no IT object AND action requires IT AND no smell for this category:
    reset animation
    stop VM
    return  (can't act on nothing)
```

Actions that don't require an IT object (quiescent, retreat) are **introspective** and always run.

---

## Step 4: CAOS Script Execution

The fired script event corresponds to a handler in `creatureDecisions.cos`. See the [Creature Decisions Script](creature-decisions-script.md) article for full details on how each script validates the action and issues success/failure stimuli.

---

## Override System (URGE Command)

The CAOS `URGE` command can override both attention and decision:

```caos
urge writ targ 5 1.0 10 1.0    * Force attention to category 5, decision to action 10
```

This sets `myVoluntaryScriptOverrides`:
- `attentionScriptNo`: Forces the attention lobe winner (bypasses brain)
- `decisionScriptNo`: Forces the decision lobe winner (bypasses brain)

Setting either to -1 restores brain control for that component. Overrides are consumed on the next `update()` tick.

---

## The Continuous Behavior Loop

A common question: why does the creature keep doing the same thing over and over?

```
Tick 1: Brain decides "eat", IT = apple
        → fire event 28 (eat script)
        → script runs: approach, touch, check bhvr, eat apple, endm

Tick N: Script finished (VM not running)
        → Brain still says "eat", IT still = apple
        → !vm.isRunning() triggers re-execution
        → fire event 28 again
        → script runs again...
```

The loop breaks when:
1. **Brain changes decision** — different `decn` winner (e.g., switches from eat to retreat)
2. **Brain changes attention** — different `attn` winner (e.g., shifts focus from food to toy)
3. **IT object disappears** — the apple was eaten/destroyed, `getKnownAgent()` returns null
4. **Involuntary action fires** — a reflex interrupts voluntary behavior
5. **Creature loses consciousness** — falls asleep, faints, or dies

This is by design. The original engine works identically — creatures are persistent actors that continuously attempt their current intention until something changes.

---

## Introspective vs Extraspective

Actions are classified as requiring an IT object or not:

| Introspective (no IT needed) | Extraspective (IT required) |
|-----------------------------|-----------------------------|
| Quiescent (idle) | Activate 1, 2 |
| Retreat | Deactivate |
| Express Need | Approach |
| Rest / Sleep | Pick Up |
| Walk West / East | Eat, Hit |

When the creature's chosen action is extraspective but there's no IT object and no smell to follow, the MotorFaculty stops the VM rather than running a script that would immediately fail.

---

## Timing and Tick Budget

- `MotorFaculty.update()` runs on **creature ticks** (every 4th game tick, staggered per creature)
- The brain processes on the same tick, just before the MotorFaculty in the faculty update order
- Script execution after `executeScriptForEvent()` runs only 1 instruction immediately (a single `UpdateVM(1)`)
- Subsequent instructions execute at **5 per agent tick** via the agent's VM tick budget
- A typical decision script takes multiple ticks to complete (approach, touch, wait, etc.)

---

## Source Files

| File | Purpose |
|------|---------|
| `Main_Game/src/engine/creature/faculties/MotorFaculty.js` | The MotorFaculty pipeline implementation |
| `Main_Game/src/engine/creature/brain/BrainScriptFunctions.js` | Neuron-to-script mapping system |
| `Assets/C3_Bootstrap_V2/creatureDecisions.cos` | CAOS decision scripts |

## Related Articles

- [Creature Decisions Script](creature-decisions-script.md) — How each action script validates and executes
- [Creature Movement Decision Chain](../creature-movement-chain.md) — Focus on movement-specific pipeline
- [Brain Overview](../brain-overview.md) — How the brain lobes work
- [Sensory Faculty](../sensory-faculty.md) — How attention targets are selected
