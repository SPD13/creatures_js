# Creature Sleep

Sleep in Creatures 3 is not a single passive state but a **multi-phase process** orchestrated by CAOS scripts, the LifeFaculty state machine, the Brain's instinct processor, and the biochemistry system. A sleeping creature passes through distinct phases — falling asleep, dreaming (instinct processing), knowledge building, and waking — each with specific engine behaviours and neural consequences.

## The Life State Machine

All sleep states are managed by a single `myState` enum in the LifeFaculty:

| Value | State | Description |
|-------|-------|-------------|
| 0 | `zombieState` | Alive, no brain control (eyes open) |
| 1 | `alertState` | Normal conscious state |
| 2 | `asleepState` | Sleeping (NREM — no instinct processing) |
| 3 | `dreamingState` | Dreaming (REM — instinct processing active) |
| 4 | `unconsciousState` | Knocked out |
| 5 | `deadState` | Dead |

The state queries derive from this single value:
- `GetWhetherAsleep()` returns true for **both** `asleepState` and `dreamingState`
- `GetWhetherDreaming()` returns true **only** for `dreamingState`
- `GetWhetherAlert()` returns true **only** for `alertState`

## What Triggers Sleep

Sleep is triggered by the **involuntary action system**. The MotorFaculty maintains involuntary action loci bound to biochemistry receptors. When the sleepiness chemical (drive 7) reaches sufficient concentration, a receptor drives involuntary action locus 5 (sleep), causing the MotorFaculty to fire **script event 69** — the sleep script.

The sleep script can also be triggered by the creature's **voluntary decision system**: the `Rest` action (decision neuron 9 / script offset 9 in the decision lobe) fires the rest script (event 25), which checks sleepiness and may transition into the full sleep sequence.

## The Sleep Script — Phase by Phase

The sleep cycle is implemented in CAOS scripts (`creatureInvoluntary.cos` script 69, `creatureDecisions.cos` script 25), not in engine code. The engine provides the state machine; the scripts orchestrate the phases.

### Phase 1: Falling Asleep

```caos
lock                        * prevent interruption
pose 57                     * lying down pose
wait 25                     * brief pause
stim writ targ 21 1         * self-stimulus: "resting"
aslp 1                      * → asleepState (LifeFaculty)
```

The `ASLP 1` command calls `LifeFaculty.setWhetherAsleep(true)`, which transitions the creature to `asleepState` via `SetState()`. This:
- Stops the current voluntary action (`Motor()->StopCurrentAction()`)
- Sets the introspective flag (creature focuses on self, not world)
- Resets the animation string

The script then creates "zzz" bubble sprites above the creature to visually indicate sleep.

### Phase 2: Sleep/Dream Loop

```caos
setv va00 0                 * snore counter
loop
    drea 1                  * → dreamingState (triggers instinct processing)
    doif va00 eq 0
        snde "zzzz"         * play snoring sound every 10 ticks
    endi
    pose 58                 * sleeping pose
    wait 20                 * pause ~1 second
    stim writ targ 22 1     * self-stimulus: "sleeping" (reduces sleepiness)
    addv va00 1
    doif va00 >= 10
        setv va00 0         * reset snore counter
    endi
untl driv 7 lt 0.10 and driv 6 lt 0.10    * until not sleepy AND not tired
```

This is the core sleep loop. Each iteration:

1. **`DREA 1`** calls `LifeFaculty.setWhetherDreaming(true)`, which transitions from `asleepState` to `dreamingState`. The `SetState()` method detects the dreaming transition and calls:
   ```
   brain.setWhetherToProcessInstincts(true)
   ```
   This is the critical moment — the Brain switches from normal mode to instinct processing mode.

2. **`wait 20`** yields execution for ~20 ticks. During these ticks, the Brain's `update()` runs in instinct mode — processing one instinct (or one knowledge drive) per tick.

3. **`stim writ targ 22 1`** applies stimulus 22 ("sleeping") to reduce sleepiness and tiredness chemicals.

4. The loop continues until both sleepiness (drive 7) and tiredness (drive 6) drop below 0.10.

**Important**: `DREA 1` is called **every iteration** of the loop, not just once. Since `setWhetherDreaming(true)` is a no-op when already in `dreamingState`, this is safe — but it means the loop is designed to tolerate being awakened mid-sleep and re-entering dreaming.

### Phase 3: Waking Up

```caos
aslp 0                      * → alertState (LifeFaculty)
pose 58                     * transition pose
wait 25                     * brief pause
unlk                        * release lock
```

`ASLP 0` calls `LifeFaculty.setWhetherAsleep(false)`, which only works if the creature is in `asleepState` or `dreamingState`. The transition to `alertState` via `SetState()`:
- If leaving `dreamingState`: calls `brain.setWhetherToProcessInstincts(false)` — stops instinct processing and clears chemical signals
- Stops involuntary actions (`Motor()->StopCurrentInvoluntaryAction()`)
- Stops any running scripts

## What Happens Inside the Brain During Sleep

### The Chemical Signalling Sequence

When `setWhetherToProcessInstincts(true)` is called:

```
Tick 0: chemical[212] = 1.0, chemical[213] = 0.0    — pre-instinct warning
        updateComponents()                            — dendrites prepare
Tick 1: chemical[212] = 0.0, chemical[213] = 1.0    — instinct mode active
```

Chemical 212 (pre-instinct) gives dendrite SVRules one preparatory tick to switch from short-term to long-term learning mode. Chemical 213 (instinct) signals that all subsequent learning should write directly into permanent long-term weights.

When `setWhetherToProcessInstincts(false)` is called:

```
chemical[212] = 0.0, chemical[213] = 0.0             — both cleared
```

### Instinct Processing Phase

While `dreamingState` is active and instincts remain in the queue, each Brain `update()` tick processes **one instinct**:

```
1. Clear all neuron activity
2. Stimulate 3 input neurons (lobe + neuron pairs from the instinct gene)
   - noun inputs also stimulate visn (0.1) and smel (1.0) for cross-modal learning
3. Force the target decision neuron
4. updateComponents() — full brain pipeline runs
5. Verify the decision won (skip instinct if brain rejects it)
6. Apply reinforcement: resp[drive] = 0.5 × amount
7. updateComponents() — learning occurs via reinforcement pathway
8. Pop instinct from queue and delete it
```

Each instinct fires exactly once and is permanently destroyed. The dendritic weight changes it creates are the lasting legacy.

### Knowledge Building Phase

After the instinct queue is empty, the Brain enters a **knowledge extraction phase** — one drive per tick:

```
For each of 20 drives:
    1. Clear all neuron activity
    2. Set all noun neurons to 0.5 (generic objects)
    3. Set all visn neurons to 0.1 (faint visibility)
    4. Set driv[current] to 1.0 (hypothetical maximal drive)
    5. updateComponents()
    6. Record: what attention category won? what decision won? how strong?
    7. Store in myAssistanceKnowledge[drive]
```

This builds a lookup table answering "for each drive, what would this creature focus on and do?". The LinguisticFaculty reads this via `brain.GetKnowledge(drive)` to enable creature-to-creature concept teaching.

After all 20 drives are simulated:

```
myInstinctsAreBeingProcessed = false
myLastKnowledgeUpdated = 0         — reset for next dream
```

The Brain automatically exits instinct mode. The creature remains in `dreamingState` at the LifeFaculty level until the CAOS sleep script's loop condition is met.

### What Happens in Subsequent Sleep Sessions

| Sleep Session | Instincts Remaining | What Happens |
|---|---|---|
| 1st (newborn) | ~40 (Baby-stage genes) | Process all instincts → knowledge building → done |
| 2nd | 0 | Skip to knowledge building (re-extracts with updated weights) |
| After ageing to Child | Child-stage genes added | Process new instincts → knowledge building |
| All subsequent | 0 (unless newly aged) | Knowledge building only |

Knowledge extraction **repeats every sleep session** — this is useful because the brain's dendrite weights change through waking experience, so the extracted knowledge updates to reflect current learning.

## State Transition Safety

The LifeFaculty enforces strict transition rules:

| From | To | Allowed? | Method |
|------|----|----------|--------|
| `alert` | `asleep` | Yes | `setWhetherAsleep(true)` |
| `asleep` | `dreaming` | Yes | `setWhetherDreaming(true)` |
| `dreaming` | `asleep` | Yes | `setWhetherDreaming(false)` |
| `asleep` / `dreaming` | `alert` | Yes | `setWhetherAsleep(false)` |
| `alert` | `dreaming` | Yes | `setWhetherDreaming(true)` — direct entry allowed |
| `dead` | any | No | Dead creatures cannot change state |
| `zombie` | `asleep` / `dreaming` | No | Zombies cannot sleep |
| `alert` | `asleep` (if not asleep) | — | `setWhetherAsleep(false)` is a no-op |
| `alert` | `asleep` (if not dreaming) | — | `setWhetherDreaming(false)` is a no-op |

The `SetState()` method handles side effects for each transition:
- **Entering `asleep`**: stops voluntary action, sets introspective mode
- **Entering `dreaming`**: activates instinct processing
- **Leaving `dreaming`**: deactivates instinct processing
- **Leaving sleep (→ `alert`)**: stops involuntary actions and scripts

## MotorFaculty Safety During Sleep

The MotorFaculty checks `GetWhetherAlert()` before executing involuntary actions. The original engine flags this check with the comment "CAUSES TROUBLE!" — involuntary actions during sleep can conflict with the sleep script's locked execution flow.

## The Asleep Locus

The LifeFaculty exposes `myAsleepLocus` to the biochemistry emitter system:

```text
myAsleepLocus = (myState == asleepState) ? 1.0 : 0.0
```

Note: this only reports `asleepState`, **not** `dreamingState`. A dreaming creature's asleep locus is 0.0. This is a subtle design detail — the biochemistry sees "asleep" and "dreaming" as distinct states, even though `GetWhetherAsleep()` returns true for both.

## CAOS Commands

### ASLP (Command / Integer RV)

```caos
aslp 1          * put creature to sleep (→ asleepState)
aslp 0          * wake creature up (→ alertState)
setv va00 aslp  * returns 1 if asleep or dreaming, 0 if awake
```

### DREA (Command / Integer RV)

```caos
drea 1          * start dreaming (→ dreamingState, activates instinct processing)
drea 0          * stop dreaming (→ asleepState, deactivates instinct processing)
setv va00 drea  * returns 1 if dreaming, 0 otherwise
```

The CAOS documentation states: *"Set to 1 to make the creature fall asleep and dream, 0 to stop the creature dreaming. When dreaming, a creature's instincts are processed."*

## No Automatic Sleep Cycles

The engine does **not** implement automatic REM/NREM sleep cycles. There is no internal timer that alternates between sleeping and dreaming. The state transitions are entirely driven by:

1. **CAOS scripts** — the sleep loop explicitly calls `DREA 1` each iteration
2. **Biochemistry receptors** — genome-defined receptors can bind chemicals to the `setWhetherAsleep()` / `setWhetherDreaming()` methods
3. **External CAOS commands** — debug tools or other agents can force sleep/dream states

The distinction between "sleeping" (NREM) and "dreaming" (REM) exists purely because the engine supports both states, but in practice the standard sleep scripts immediately enter dreaming and stay there for the entire sleep session. A creature in `asleepState` without dreaming is essentially in a holding state where no instinct processing occurs and the brain runs in normal mode (though sensory inputs are inactive because the creature isn't alert).

## Source Files

| File | Description |
|------|-------------|
| `Assets/Bootstrap/001 World/creatureInvoluntary.cos:205-253` | CAOS — involuntary sleep script (event 69) |
| `Assets/Bootstrap/001 World/creatureDecisions.cos:462-509` | CAOS — voluntary rest→sleep script (event 25) |
| `Assets/Catalogue/Brain.catalogue:159-161` | Catalogue — instinct chemicals 213/212 |
| `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js` | JS — LifeFaculty state machine |
| `Rebuild/Main_Game/src/engine/creature/brain/Brain.js` | JS — Brain instinct processing |
