# Brain Chemicals (1–9)

Creatures 3's biochemistry reserves a **contiguous block of chemistry indices** specifically for brain-to-body and brain-internal signalling. The `ChemicalNames.catalogue` labels this block "Brain chemical 1" through "Brain chemical 14", with seven slots in the middle given functional aliases (navigation drives + Reward + Punishment). The first nine slots — chemicals **198 through 206** — are what players, documentation and genetics engineers usually mean when they say **"brain chemicals 1 to 9"**.

This article walks through each of those nine chemicals: what it is named in the catalogue, where the game *produces* it, where the brain *consumes* it, and what it actually does inside the neural network.

## The Block at a Glance

From `ChemicalNames.catalogue`:

| "Brain chemical #" | Chemistry index | Catalogue name | Functional role |
|---|---|---|---|
| **1** | 198 | Brain chemical 1 | Reinforcement gate for the `driv→comb` tract |
| **2** | 199 | Up | Navigation drive (drive slot 15) |
| **3** | 200 | Down | Navigation drive (drive slot 16) |
| **4** | 201 | Exit | Navigation drive (drive slot 17) |
| **5** | 202 | Enter | Navigation drive (drive slot 18) |
| **6** | 203 | Wait | Navigation drive (drive slot 19) |
| **7** | 204 | Reward | Generic positive reinforcement signal |
| **8** | 205 | Punishment | Generic negative reinforcement signal |
| **9** | 206 | Brain chemical 9 | Reserved / unused slot |

The block is deliberately designed by Steve Grand as an **internal bus** between the biochemistry simulation and the neural network. Nothing else in the creature's metabolism touches chemicals 198–206 unless a gene specifically wires them. That makes them a clean, mod-friendly namespace for the brain.

---

## The Two Consumption Pathways

Before diving into each chemical, it helps to know how a brain chemical can actually *reach* the neural network. There are exactly two routes in the Creatures 3 engine:

### 1. `CHEMICAL_CODE` operand inside an SVRule

Lobe init/update rules and tract init/update rules can read any of the 256 chemicals via the `CHEMICAL_CODE` operand (operand variable 7). See `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668`:

```javascript
case SVOperand.CHEMICAL_CODE:
    if (this.pointerToChemicals) {
        return this.pointerToChemicals[entry.arrayIndex % 256];
    }
    return 0.0;
```

`pointerToChemicals` is a **live reference** to `Biochemistry.myChemicalConcs` handed in via `Brain.registerBiochemistry()` at creature construction (`Creature.js:788`). So a brain chemical raised in biochemistry is visible to SVRules on the next tick they run.

### 2. Per-tract reward/punishment reinforcement system

Tracts can register a **reward chemical index** and a **punishment chemical index** via the SVRule opcodes `SET_REWARD_CHEMICAL_INDEX` (59) and `SET_PUNISHMENT_CHEMICAL_INDEX` (62). Once registered, the tract calls `Tract.processRewardAndPunishment()` every tick on every dendrite whose destination neuron won its winner-takes-all contest. See `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`:

```javascript
processRewardAndPunishment(dendrite) {
    if (!this.reward.isSupported() && !this.punishment.isSupported()) return;
    const dstOutput = dendrite.dstNeuron.states[NeuronVar.OUTPUT_VAR];
    if (dstOutput === 0.0) return;
    if (!this.pointerToChemicals) return;

    if (this.reward.isSupported()) {
        const rewardLevel = this.pointerToChemicals[this.reward.getChemicalIndex()];
        const currentSTW = dendrite.weights[DendriteVar.WEIGHT_SHORTTERM_VAR];
        dendrite.weights[DendriteVar.WEIGHT_SHORTTERM_VAR] =
            this.reward.reinforceAVariable(rewardLevel, currentSTW);
    }
    // ... punishment same with opposite sign ...
}
```

Dendrites attached to a firing destination neuron have their **short-term weight** (STW) pushed up (reward) or pulled down (punishment) in proportion to the chemical's concentration. STW is later consolidated into long-term weight (LTW) via opcode 44.

---

## Chemical 1 (198) — "Brain chemical 1"

### Who consumes it

**Exactly one place in the stock brain**: the `driv→comb` tract's init rule, at `brain-architecture.json:5604`.

The relevant excerpt (stripped to the essential lines):

```
line  2:  IF_ZERO      CHEMICAL[212]          ; skip next if Pre-REM sleep = 0
line  3:  DO_SET_ST_TO_LT_RATE  0.08          ; damp learning rate while awake
line  4:  IF_NON_ZERO  CHEMICAL[198] ← chem 1 ; if chem 198 == 0, skip next line
line  5:    IF_ZERO_STOP NEURON_STATE[2]      ; (only checked when chem 1 is live)
line  6:  IF_ZERO_STOP NEURON_STATE[3]        ; stop unless source neuron active
line  7:  LOAD_ACC  CHEMICAL[205]             ; Punishment
line  8:  SUBTRACT  VALUE[~0.10]
line 10:  MULTIPLY_BY  -0.70
line 11:  ADD_AND_STORE_IN  DENDRITE_WEIGHT[0]
line 12:  LOAD_ACC  CHEMICAL[204]             ; Reward
line 15:  MULTIPLY_BY  +0.70
line 16:  ADD_AND_STORE_IN  DENDRITE_WEIGHT[0]
```

Per SVRule semantics (`SVRule.js:404`), `IF_NON_ZERO operand` skips the very next instruction if the operand is zero; otherwise it falls through. So:

- **Chem 1 == 0 (resting state)**: line 5 is skipped. Line 6 runs. If source neuron state[3] is non-zero, the rule applies Reward (204) and Punishment (205) to the dendrite weight. This is the normal, permanent learning pass.
- **Chem 1 != 0 (just pulsed)**: line 5 runs *in addition*. Now **both** source neuron state[2] *and* state[3] must be non-zero for learning to proceed, sharpening blame assignment to the single drive neuron that is actually firing right now.

### Who produces it

**The `STIM_DISAPPOINT` stimulus** — fired whenever a creature attempts an action that cannot complete (for example, `push` with no target selected). The default genome's G_STIMULUS gene for STIM_DISAPPOINT assigns a positive adjustment to chemical 198 in its `chemicalsToAdjust[4]` slots. On stimulation, `SensoryFaculty.stimulate()` (`SensoryFaculty.js:1060+`) walks those slots and calls `adjustChemicalLevel()` for each, raising chemical 1 in biochemistry.

### What it actually does

Brain chemical 1 is a **short-lived "reinforce now" gate** on the drive→concept associative pathway. When a disappointment happens, the genome briefly tightens the filter on which dendrites are allowed to adjust their weights, so that only the drive neuron that is *actively* driving the failed action gets its association to the current concept rewritten. In other words: *"I just tried something and it didn't work — the drive that caused me to try should take the blame, nothing else."*

Because chemical 1 decays back to zero within a few ticks via normal biochemistry half-life, the effect is an impulse, not a level.

---

## Chemicals 2–6 (199–203) — Navigation Drives

Despite their position in the "brain chemical" block, **chemicals 199 through 203 are actually drive chemicals**, not brain-private signals. They occupy a second drive chemistry block (drives 15 through 19) that extends the main drive block at 148–162:

| Chem | Drive slot | Name |
|---|---|---|
| 199 | 15 | Up — "I want to move up" |
| 200 | 16 | Down — "I want to move down" |
| 201 | 17 | Exit — "I want to leave this room" |
| 202 | 18 | Enter — "I want to enter that room" |
| 203 | 19 | Wait — "I want to stay put / rest" |

### Who consumes them

Every tick, `SensoryFaculty.updateDriveLobe()` pushes all 20 drive levels into the `driv` lobe as neuron inputs (`SensoryFaculty.js:350`):

```javascript
updateDriveLobe(brain) {
    for (let i = 0; i < this.myNumDrives; i++) {
        brain.setInput('driv', i, this.myCreature.getDriveLevel(i));
    }
}
```

So neurons 15–19 of the drive lobe are directly driven by chemicals 199–203. From there, the `driv→comb`, `driv→forf`, `driv→mood`, and `driv→driv` tracts propagate the navigation drive signal into the concept, friend/foe, mood, and drive-self-feedback lobes. The concept lobe mixes it with verb/noun/stimulus input to form situations like *"the room I'm in is bad, I want to leave"* and the decision lobe picks an appropriate action.

### Who produces them

Navigation drives are **not** directly modulated by biochemistry receptors the way Pain or Hunger are. They are written via:

- **Agent behaviour CAOS scripts** issuing `STIM SWAY` commands that adjust the drive via the stimulus chemical-adjustment array.
- **Instincts** (G_INSTINCT genes) stimulated during REM sleep, which can raise these drives as part of a hard-wired behaviour pattern such as "when near a door and exit-hungry, push it".
- **The drive decay system**, which gradually bleeds each drive toward its neutral value every tick.

### Crucially, SVRules do not read them

A full grep of the stock brain architecture finds **zero `CHEMICAL_CODE` references** to indices 199–203 in any lobe or tract init/update rule. The navigation drives reach the brain exclusively through the `SensoryFaculty → driv lobe input` path, not through SVRule chemical reads.

---

## Chemical 7 (204) — "Reward"

### Who consumes it

Two distinct consumers:

**A. Directly by the `driv→comb` init rule**, at `brain-architecture.json:5668`:

```
LOAD_ACCUMULATOR_FROM  CHEMICAL[204]    ; Reward
SUBTRACT VALUE[~0.10]                   ; threshold
IF_LESS_THAN_STOP  0                    ; don't learn unless above threshold
MULTIPLY_BY  +0.70                      ; positive learning rate
ADD_AND_STORE_IN DENDRITE_WEIGHT[0]     ; strengthen dendrite
```

This is the explicit reinforcement block discussed under Chemical 1. It runs every time the init rule runs (every tick when `runInitRuleAlways=true`), adjusting the STW of the drive→concept dendrite for the current drive neuron when Reward exceeds the threshold.

**B. By the generic tract reward/punishment system**, on any tract whose genome init rule uses opcode 59 (`SET_REWARD_CHEMICAL_INDEX`) to register chemical 204 as its reward source. Once registered, `Tract.processRewardAndPunishment()` (`Tract.js:531`) reads `pointerToChemicals[204]` every tick and applies the reward scaling to winning dendrites' STW.

### Who produces it

The `STIM SWAY` macro in CAOS, invoked by agent scripts or by `SensoryFaculty::stimulate()` during stimulus delivery. Stimulus genes that represent success — food reducing hunger, a pat from the pointer, completing a taught command — are typically configured to raise chemical 204 in their `chemicalsToAdjust` block.

### What it actually does

Reward is the **positive half of Hebbian temporal-difference learning**. When it spikes, the brain treats whichever dendrites are currently "winning" (output_var != 0) as responsible for the success and strengthens their STW. STW is then migrated into LTW on a slow timescale (opcode 44 convergence), meaning good associations become permanent.

---

## Chemical 8 (205) — "Punishment"

Punishment is the mirror image of Reward. Same consumption paths (direct reference in `driv→comb` init rule at line 5628; generic tract reinforcement via `SET_PUNISHMENT_CHEMICAL_INDEX` / opcode 62), same threshold logic, but with a **negative rate** so winning dendrites are *weakened* rather than strengthened.

Punishment is the chemical that **`STIM_DISAPPOINT` primarily targets in the standard genome**. When a creature fails an action:

1. `SensoryFaculty.stimulate(STIM_DISAPPOINT, ...)` fires.
2. The genome's STIM_DISAPPOINT entry raises chemical 198 (Brain chemical 1) AND chemical 205 (Punishment).
3. On the next brain tick, the `driv→comb` init rule sees chem 198 != 0, so the tight blame-assignment gate activates.
4. Inside the gate, Reward (204) is near zero but Punishment (205) is elevated, so the dendrite from the currently firing drive neuron to the active concept neuron has its STW **decreased**.
5. Over several repetitions, the LTW converges downward: the creature learns "in this situation, the drive that made me try that doesn't actually solve the problem".

That is the core reinforcement loop for aversive learning in Creatures 3.

---

## Chemical 9 (206) — "Brain chemical 9"

Chemical 206 is **reserved in the default genome**. A grep of `brain-architecture.json` finds no `CHEMICAL_CODE` operand pointing at index 206, and no tract registers it as a reward/punishment source via opcode 59/62. It is a genuine free slot.

It exists for the same reason chemicals 198 and 206–211 exist: Steve Grand wanted genetic engineers and breeders to have **guaranteed-unused brain chemistry slots** they could wire up for custom behaviours — a second disappoint-like gate, a novel reinforcement signal, a secondary reward bus, etc. — without clashing with existing systems. Creating a new brain chemical in a modded genome is as simple as:

1. Edit a stimulus gene to raise chemical 206 on some trigger.
2. Add a `CHEMICAL_CODE[206]` read inside a tract or lobe SVRule that uses the signal to gate or drive learning.

Nothing in the stock engine blocks or uses that index.

---

## Summary Table: Production → Consumption Map

| # | Idx | Name | Primarily produced by | Primarily consumed by | Effect |
|---|---|---|---|---|---|
| 1 | 198 | Brain chemical 1 | STIM_DISAPPOINT gene | `driv→comb` init rule, line 5604 | Tightens blame assignment for aversive learning |
| 2 | 199 | Up | STIM SWAY, instincts, drive decay | `driv` lobe neuron 15 (via SensoryFaculty) | Motivation to move up |
| 3 | 200 | Down | STIM SWAY, instincts, drive decay | `driv` lobe neuron 16 | Motivation to move down |
| 4 | 201 | Exit | STIM SWAY, instincts, drive decay | `driv` lobe neuron 17 | Motivation to leave room |
| 5 | 202 | Enter | STIM SWAY, instincts, drive decay | `driv` lobe neuron 18 | Motivation to enter room |
| 6 | 203 | Wait | STIM SWAY, instincts, drive decay | `driv` lobe neuron 19 | Motivation to stop and rest |
| 7 | 204 | Reward | Success stimuli (pat, eat, complete task) | `driv→comb` init rule + any tract with `SET_REWARD_CHEMICAL_INDEX` | Strengthens winning dendrites |
| 8 | 205 | Punishment | Failure stimuli (slap, disappoint) | `driv→comb` init rule + any tract with `SET_PUNISHMENT_CHEMICAL_INDEX` | Weakens winning dendrites |
| 9 | 206 | Brain chemical 9 | Nothing (reserved) | Nothing (reserved) | Available for custom genomes |

---

## JS Rebuild Alignment

| Step | File | Status |
|---|---|---|
| Stimulus genes load `chemicalsToAdjust` from genome | `perception/StimulusLibrary.js:29` | **Fixed in commit `d10b477`** — previously called `genome.getGeneType` with string literals, so all stimulus genes silently failed to load and every brain chemical stayed at zero regardless of stimulation. |
| `Stimulus.stimChemToBioChem` maps stim IDs 0–255 to chem indices | `perception/Stimulus.js:73` | Matches the original offset of 148. |
| `SensoryFaculty.stimulate` injects chemicals into biochemistry | `faculties/SensoryFaculty.js:1060` | OK |
| Biochemistry hands live chemical array to brain | `biochemistry/Biochemistry.js:202` — `getChemicalConcs()` returns the live `myChemicalConcs` reference | OK |
| Brain distributes that reference to every lobe/tract/SVRule | `brain/Brain.js:86`, `brain/BrainComponent.js:51` | OK |
| SVRules read it via `CHEMICAL_CODE` operand | `brain/SVRule.js:668` | OK |
| `Tract.processRewardAndPunishment` reads reward/punishment chemicals | `brain/Tract.js:531` | OK — but only when a genome gene registers the chemical indices via opcodes 59/62. |
| `runInitRuleAlways` flag controls whether init rule runs every tick (needed for chem 1 / Reward / Punishment in `driv→comb`) | `brain/Tract.js:159` (load), `:485` (use) | **Worth asserting at runtime** — if the loaded `driv→comb` tract does not have this flag set, the chemical 1 / reward / punishment reinforcement path in the standard genome is inert. |

### Known related quirks in the JS rebuild

- **Instinct chemical numbers** *(fixed)*: `brain/Brain.js` previously hard-coded `instinctChemicalNumber = 119` and `preInstinctChemicalNumber = 120` — those indices are actually "Hotness backup" and "Tiredness backup" in the C3 catalogue, completely unrelated to sleep. The original engine's Brain constructor reads both values from `Brain.catalogue` `"Brain Parameters"` slots 0 and 1, which resolve to 213 (REM sleep) and 212 (Pre-REM sleep). The JS now mirrors this: the defaults are set to 213/212 and `loadInstinctChemicalNumbersFromCatalogue()` overrides them from `window.catalogue` if the "Brain Parameters" tag is present, matching the original lazy-read pattern.

---

## Debugging Checklist

If a creature does not appear to be learning from reinforcement, work down this list in order:

1. **Is the stimulus gene loaded?** Call `myStimulusLib.getStimulus(STIM_DISAPPOINT).chemicalsToAdjust` and confirm it contains non-zero chemical IDs. If all four slots are zero, the G_STIMULUS gene did not bind — verify `StimulusLibrary.readFromGenome` ran and matched genes.
2. **Is the chemical actually rising in biochemistry?** Watch `myChemicalConcs[198]`, `[204]`, `[205]` after the triggering event. They should spike then decay on a few-tick timescale.
3. **Does the brain see the rise?** In a debug breakpoint inside `SVRule.getOperandValue`, confirm that a `CHEMICAL_CODE` operand with `arrayIndex=198` returns the expected level.
4. **Is the `driv→comb` tract running its init rule every tick?** Inspect `tract.runInitRuleAlways`. If false on this tract, the stock reinforcement path will never fire — either fix the genome load or switch to the `processRewardAndPunishment` path via opcodes 59/62.
5. **Are dendrites' destination neurons actually winning?** `processRewardAndPunishment` gates on `dstNeuron.states[OUTPUT_VAR] != 0`. If the concept neuron the drive is pointing at is not the winning-takes-all victor this tick, no learning happens regardless of chemical levels.
6. **Is the STW → LTW consolidation enabled?** Without opcode 44, dendrite STW changes are ephemeral and decay back. Verify the update rule contains `DO_SET_LT_TO_ST_RATE_AND_DO_WEIGHT_ST_LT_WEIGHT_CONVERGENCE`.

---

## See Also

- [Reinforcement Learning Pipeline](reinforcement-learning-pipeline.md) — end-to-end flow from stimulus delivery to dendrite weight consolidation.
- [Drive Lobe Architecture](drive-lobe-architecture.md) — how chemicals 148–162 and 199–203 become the 20 drive neurons.
- [Combination Lobe Architecture](combination-lobe-architecture.md) — the concept lobe where drive associations are actually stored and learned.
- [Stimulus System](stimulus-system.md) — how STIM / SWAY / URGE / ORDR macros deliver stimuli to the brain.
- [Instinct System](instinct-system.md) — how hard-wired behaviours inject brain-chemical pulses during REM sleep.
