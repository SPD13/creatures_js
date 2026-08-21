# Age and Lifecycle

The ageing system in Creatures 3 is an elegant biochemistry-driven clock that governs a creature's progression through seven life stages — from baby to senile — and ultimately to death. Rather than using a simple timer, the engine ties ageing to a decaying chemical substance called **Life** (Chemical 125), which is monitored by biochemistry receptors that trigger life stage transitions when concentration thresholds are crossed.

## The Seven Ages

Every creature passes through seven life stages, defined in the creature constants enum:

| Index | Stage | Constant | Description |
|---|---|---|---|
| 0 | Baby | `AGE_BABY` | Initial embryological phase. T=0 genes switch on to create the brain and body |
| 1 | Child | `AGE_CHILD` | Language instincts develop |
| 2 | Adolescent | `AGE_ADOLESCENT` | Response to opposite sex changes; ovulation starts |
| 3 | Youth | `AGE_YOUTH` | Pair-bonding and mating time |
| 4 | Adult | `AGE_ADULT` | More mature relationships |
| 5 | Old | `AGE_OLD` | No interest in opposite sex; failing faculties |
| 6 | Senile | `AGE_SENILE` | Slowly poisoning yourself to death |

When a creature moves past Senile (reaching `NUMAGES = 7`), it dies of old age — this is a forced death regardless of health.

## Chemical 125: The Life Chemical

The Life chemical (ID 125) is the master ageing clock. Its official description in the game's catalogue:

> *"Decays over time, switching on receptors to change the stage of life from embryo through to senile. Stage changes then switch on new genes."*

### How It Works

1. **Initial concentration**: When a creature is born (or advances to a new life stage), Chemical 125 is set to **1.0** (full concentration)
2. **Natural decay**: Like all chemicals, Life has a genome-defined **half-life** that determines how fast it decays each tick. The half-life gene controls the decay rate via the formula: `decayRate = 0.5 ^ (1.0 / halfLifeInTicks)`, where `halfLifeInTicks = 2.2 ^ (genomeValue * 32.0)`
3. **Threshold crossing**: As the Life chemical decays below certain thresholds, biochemistry **receptor genes** detect the drop and write a signal to the corresponding **ageing locus** on the LifeFaculty
4. **Stage transition**: When an ageing locus becomes non-zero, the LifeFaculty triggers a life stage advance

The key insight is that the LifeFaculty **never reads Chemical 125 directly**. The biochemistry receptor system is the intermediary — it monitors the chemical concentration and triggers the ageing loci when genome-defined thresholds are crossed. This decoupled design means that the ageing rate is entirely configurable through genome genes.

### Decay Rate and Lifespan

The creature's lifespan is determined by two genome-configured properties:

- **Half-life gene** for Chemical 125: Controls how fast the Life chemical decays. A longer half-life means slower ageing
- **Receptor threshold genes**: Control at what concentration level of Chemical 125 each age transition triggers

Different breeds can have dramatically different lifespans by tuning these genome values. A breed with a very long half-life for Chemical 125 will age slowly, while one with a short half-life will rush through life stages.

### Chemical Reset on Age Transition

When a life stage transition occurs, Chemical 125 is **reset to 1.0** (full). This restarts the decay clock for the next stage. Each stage effectively has its own countdown, and the time spent in each stage depends on the same half-life but may be perceived differently due to changing biochemistry and gene expression.

## The Ageing Loci

The LifeFaculty exposes 7 **receptor loci** to the biochemistry system — one for each life stage transition:

| Locus | Constant | Tissue | Transition |
|---|---|---|---|
| `myAgeingLoci[0]` | `LOC_AGE0` | `TISSUE_SOMATIC` | Baby → Child |
| `myAgeingLoci[1]` | `LOC_AGE1` | `TISSUE_SOMATIC` | Child → Adolescent |
| `myAgeingLoci[2]` | `LOC_AGE2` | `TISSUE_SOMATIC` | Adolescent → Youth |
| `myAgeingLoci[3]` | `LOC_AGE3` | `TISSUE_SOMATIC` | Youth → Adult |
| `myAgeingLoci[4]` | `LOC_AGE4` | `TISSUE_SOMATIC` | Adult → Old |
| `myAgeingLoci[5]` | `LOC_AGE5` | `TISSUE_SOMATIC` | Old → Senile |
| `myAgeingLoci[6]` | `LOC_AGE6` | `TISSUE_SOMATIC` | Die immediately of old age |

A receptor gene in the creature's genome monitors Chemical 125 and writes to the appropriate `LOC_AGE` locus when the chemical falls below a threshold. The LifeFaculty checks `myAgeingLoci[myAge]` each tick — when it becomes non-zero, `forceAgeing()` is called.

The final locus (`LOC_AGE6`) is special: it is documented as *"if on DIE IMMEDIATELY of old age (only implement receptor if death needs to be forced to occur)"*. It provides a safety net to ensure creatures don't live forever if other death mechanisms fail.

### Sequential Guarantee

The system guarantees that stages are entered **in order and only once**. The LifeFaculty checks `myAgeingLoci[myAge]` — always the locus for the *current* age, not any future age. When a transition occurs, `myAge` increments and the check moves to the next locus. Even if multiple loci are activated simultaneously, the creature advances one stage per tick at most.

## The Update Cycle

Each creature tick, the LifeFaculty's `Update()` performs:

```
1. if (properlyBorn && !dead) → myAgeInTicks += 4
2. myAsleepLocus = (asleep ? 1.0 : 0.0)
3. Process any pending forced-ageing requests
4. if (myAge >= NUMAGES) → die of old age
5. if (myAgeingLoci[myAge] is non-zero) → forceAgeing()
6. if (myDeathTriggerLocus > 0) → die
```

### Step 1: Tick Counter

The creature's total age in ticks (`myAgeInTicks`) increments by 4 each update (since creature ticks run every 4 game ticks). This counter only advances if the creature has been **properly born** (the `BORN` CAOS command was called) and is not dead. It provides a monotonic lifetime measurement independent of the biochemistry-driven stage system.

### Step 3: Pending Force-Ageing Requests

Ageing requires visual preparation (loading new body sprites via `PrepareForAgeing()`). If the sprites aren't ready yet, the ageing request is queued in `myNumberOfForceAgeingRequestsPending` and retried each tick. This prevents visual glitches when multiple age advances are requested rapidly (e.g., via CAOS debugging commands).

### Step 5: Normal Ageing

The core ageing check. When the receptor for the current age writes a non-zero value, `forceAgeing()` is called:

1. Call `PrepareForAgeing(myNextAge)` — load new body part sprites for the next life stage
2. Increment `myAge`
3. Call `ExpressGenes()` — search the genome for genes tagged for the new age and activate them
4. Increment `myNextAge`
5. Call `SendAgeEvent()` — record the life stage transition in the history store

## Gene Expression

When a creature advances to a new life stage, `ExpressGenes()` scans the entire genome and activates any genes whose **switch-on age** matches the new stage. This is how creatures change over their lifetime:

- **Baby**: Core brain structure genes, initial biochemistry
- **Child**: Language learning instincts
- **Adolescent**: Reproductive system genes, attraction genes
- **Youth**: Mating behaviour genes
- **Adult**: Mature relationship genes
- **Old**: Degenerative genes, weakened faculties
- **Senile**: Toxin-producing genes, further degeneration

Each gene in the genome has a switch-on age field. A gene tagged with `AGE_ADOLESCENT` will only be expressed when the creature reaches adolescence, allowing time-delayed biological changes.

## Birth

A creature starts as an embryo (stage 0, Baby) with `myProperlyBorn = false`. During this phase:
- The tick counter does not advance
- The creature exists but hasn't been placed in the world

When the `BORN` CAOS command fires, `setProperlyBorn()` is called, which:
1. Sets `myProperlyBorn = true`
2. Records a birth event in the history store for the child
3. Records child-born events for both the mother and father (by moniker lookup)

Only after being properly born does the creature's lifetime clock start ticking.

## Death

Creatures can die through three mechanisms:

### 1. Old Age (Ageing Past Senile)

When `myAge >= NUMAGES` (i.e., the creature has passed through all 7 stages), `SetWhetherDead(true)` is called automatically. This is an unconditional death — *"force creature to die of old age regardless of health"*.

### 2. Death Trigger Locus

The `myDeathTriggerLocus` receptor (in `TISSUE_IMMUNE`, locus `LOC_DIE`) allows the biochemistry to kill a creature. If any receptor writes a value > 0.0 to this locus, the creature dies. This mechanism handles death from:
- Ill health (glycogen depletion)
- Poisoning (toxin buildup)
- Starvation (prolonged lack of nutrients)
- Disease (immune system failure)

This locus is documented as *"if on, creature dies (ill health, poison, starvation...)"*

### 3. Direct CAOS Commands

The `DEAD` CAOS command directly calls `SetWhetherDead(true)`, killing the creature immediately.

### Death Sequence

When `SetWhetherDead(true)` is called (by any mechanism), the following sequence executes:

1. **Drop carried items** — anything the creature is holding is released
2. **Remove from all friend/foe lists** — iterates every creature in the world and removes this creature from their social memory
3. **Set state to dead** — `setState(deadState)`, which also stops the current motor action, sets introspective, and resets animation
4. **Stop script execution** — halt the current CAOS VM
5. **Execute DIE script** (event 72) — runs the creature's death animation/behaviour script
6. **Close eyes** — `setEyeState(0)` for visual feedback
7. **Record history event** — adds a "typeDied" event to the creature's history

Death is irreversible — the code explicitly checks `if (d != true) return;`, meaning you cannot rejuvenate a dead creature.

## Consciousness States

The LifeFaculty manages 6 consciousness states through a single enum, which controls what other faculties can do:

| State | Value | Triggers | Effect on Other Faculties |
|---|---|---|---|
| **Zombie** | 0 | CAOS `ZOMB 1`, or `Creature::SetZombie()` (internal engine call) | MotorFaculty skipped entirely. Brain not controlled by creature. No voluntary or involuntary actions |
| **Alert** | 1 | Default state. Restored automatically when leaving zombie, unconscious, or asleep | Normal state — all faculties operate normally |
| **Asleep** | 2 | CAOS `ASLP 1`, or brain decision system (creature decides to sleep). Woken by: CAOS `ASLP 0`, or hearing its own name (SensoryFaculty) | SensoryFaculty skipped. Involuntary actions blocked. Voluntary actions blocked. Asleep locus = 1.0 |
| **Dreaming** | 3 | CAOS `DREA 1` (must already be asleep) | Same as asleep, but brain processes instincts (reinforcement learning during sleep) |
| **Unconscious** | 4 | CAOS `UNCS 1` | MotorFaculty skipped. VM stopped. Creature posed in unconscious position (pose 58) |
| **Dead** | 5 | `myDeathTriggerLocus > 0` (biochemistry receptor on TISSUE_IMMUNE, driven by ill health/poison/starvation), ageing past Senile (`myAge >= NUMAGES`), or CAOS `DEAD` command. **Irreversible** | All processing stops. Death is permanent |

### State Transition Rules

The state machine enforces strict transition rules:

- **Dead state is terminal** — no transitions out of dead
- **Zombie blocks most transitions** — can only go zombie → alert
- **Asleep → Alert** stops involuntary actions and VM
- **Alert → Any non-alert** stops current motor action, resets animation, sets introspective
- **Unconscious/Zombie** triggers unconscious pose (58)
- **Dreaming** enables brain instinct processing; leaving dreaming disables it
- **Waking up** (`setWhetherAsleep(false)`) only works if currently asleep or dreaming

### SetState Side Effects

The central `setState()` method (matching the original engine's `LifeFaculty.SetState()`) handles all side effects of state transitions:

```
Leaving Alert:
  → Motor.StopCurrentAction()
  → setIntrospective(true)
  → resetAnimationString()

Entering Unconscious or Zombie:
  → VM.StopScriptExecuting()
  → showPose(58, 0)  // unconscious pose

Leaving Sleep → Alert:
  → Motor.StopCurrentInvoluntaryAction()
  → VM.StopScriptExecuting()

Entering Dreaming:
  → Brain.SetWhetherToProcessInstincts(true)

Leaving Dreaming:
  → Brain.SetWhetherToProcessInstincts(false)
```

## Health

The `Health()` function returns the creature's current health level, defined as the concentration of **Glycogen** (Chemical 4). Glycogen is the creature's primary energy store — when it reaches zero, the creature is critically ill and may die (via biochemistry reactions that trigger the death locus).

```text
Health() returns the biochemistry concentration of CHEM_GLYCOGEN
```

## Other Biochemistry Loci

Beyond the ageing loci, the LifeFaculty exposes additional loci for biochemistry binding:

| Locus | Type | Tissue | Purpose |
|---|---|---|---|
| `myDeathTriggerLocus` | Receptor | `TISSUE_IMMUNE` | Kills the creature when > 0.0 |
| Dead flag | Emitter | `TISSUE_IMMUNE` | Emits 1.0 if dead, 0.0 if alive (allows post-mortem chemistry) |
| `myAsleepLocus` | Emitter | `TISSUE_SENSORIMOTOR` | Emits 1.0 if asleep, 0.0 if awake |

The dead flag emitter has a notable bug in the original engine: it uses a single shared static variable, meaning all creatures share the same value. The JS implementation corrects this to be per-instance.

## Serialisation

The LifeFaculty serialises in this order (matching the original `Write()`/`Read()` format):

1. Base Faculty data (creature handle)
2. `myAsleepLocus` — float (WriteFloatRefTarget)
3. `myDeathTriggerLocus` — float (WriteFloatRefTarget)
4. `myAgeingLoci[0..6]` — 7 floats (WriteFloatRefTarget each)
5. `mySex` — int32
6. `myAge` — int32
7. `myVariant` — int32
8. `myAgeInTicks` — int32
9. `myState` — int16 (cast to LifeState enum on read)
10. `myProperlyBorn` — bool

Note: `myNumberOfForceAgeingRequestsPending` is deliberately **not serialised** — the creature is recreated at the correct age during deserialization, so pending requests are irrelevant.

On read, `myNextAge` is reconstructed as `myAge + 1`, and `myState` is directly assigned (not passed through `setState()`) to avoid triggering side effects during deserialization.

## Key Constants

| Constant | Value | Purpose |
|---|---|---|
| `NUMAGES` | 7 | Number of life stages (0–6) |
| Chemical 125 | "Life" | Master ageing clock chemical |
| Chemical 4 | "Glycogen" | Health indicator |
| Chemical 127 | "Injury" | Organ damage indicator |
| `SCRIPTDIE` | 72 | Death script event number |
| Pose 58 | — | Unconscious body pose |

## File Locations

| File | Description |
|---|---|
| `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js` | JS implementation |
| `Rebuild/Libraries/creatures-chemicals.js` | Chemical names and descriptions (including Chemical 125) |

## Related Articles

- [Creature Faculties](creature-faculties.md) — Overview of all 9 faculty subsystems
- [Biochemistry System](biochemistry-system.md) — Chemicals, organs, receptors, and half-life decay
- [Motor Faculty](motor-faculty.md) — Action execution system (affected by consciousness state)
- [Sensory Faculty](sensory-faculty.md) — Perception system (skipped when asleep/unconscious)
