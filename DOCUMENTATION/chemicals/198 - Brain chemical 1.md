# 198 - Brain chemical 1

**Brain chemical 1** is the first slot of the contiguous nine-chemical "brain chemistry block" (`ChemicalNames.catalogue`) that Steve Grand reserved as a private bus between the biochemistry simulation and the neural network. The block is bounded below by the unused slots 196 and 197 and runs from chemical **198** through **206**, after which the catalogue moves into other systems. The seven middle slots (199–205) carry functional aliases — the five navigation drives **Up / Down / Exit / Enter / Wait** and the two reinforcement signals **Reward** and **Punishment** — but the bookend slots (198 and 206) keep the generic `"Brain chemical N"` names. Despite that anonymous label, **chemical 198 is not unused**: in the stock C3 genome it has exactly one producer and exactly one consumer, and the role it plays is the single most surgical piece of biochemical signalling in the brain.

Chemical 198 is the **blame-assignment gate** for the `driv→comb` (drive → combination/concept) tract. Whenever a creature attempts an action and that action fails to complete — the classic example is `push` issued without a target object selected — the genome's `STIM_DISAPPOINT` stimulus gene fires `SensoryFaculty.stimulate()`, which walks the gene's `chemicalsToAdjust[4]` slots and injects a positive pulse of chemical 198 directly into the bloodstream alongside its companion pulse of chemical 205 (Punishment). On the very next brain tick, the `driv→comb` tract's init rule reads `CHEMICAL_CODE[198]` via an `IF_NON_ZERO` test (`brain-architecture.json:5599-5605`) and conditionally turns on a tighter dendrite-eligibility check: instead of allowing learning to proceed whenever the *destination* concept neuron is firing, it now requires that the *source* drive neuron itself is firing as well. The Hebbian punishment that follows (Reward and Punishment lines further down in the same init rule) therefore lands only on the dendrite that connects the drive that is *actively driving the failing action* to the concept the creature is *currently attending to*. In one tick, the genome has narrowed "what should I learn from this disappointment?" from "anything correlated with the failure" down to "the specific drive that made me try this".

The chemical's behaviour outside that one moment is exactly what its half-life makes it: nothing. The genome's halflives byte for chemical 198 is **0**, which the original engine's biochemistry tick reads as **instant decay** — the value is multiplied by zero every biochemistry update. Brain chemical 1 is therefore a true *per-tick impulse* rather than a level: it can only be raised within the same tick that it is going to be read, and it cannot accumulate, persist, or fade gradually. This makes it a textbook digital gate. Combined with the fact that it appears nowhere else in the genome — no reactions, no other receptors, no emitters, no faculties read it directly — chemical 198 is the cleanest example in C3 of a chemical used purely as a **boolean coupling between a stimulus delivery and a single SVRule branch**.

There is no engine-level constant, no special-case handling, and no dedicated faculty for chemical 198. It is data-driven entirely through the genome and the generic `Biochemistry → Brain.registerBiochemistry → SVRule.CHEMICAL_CODE` plumbing that every chemical uses. The chemical is one of two slots in the nine-chemical brain block that are genuinely available for modders to repurpose without clashing with stock systems (the other being chemical 206, "Brain chemical 9").

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **`STIM_DISAPPOINT` stimulus gene** — the only natural source in the stock genome | `G_STIMULUS` gene for stimulus id `STIM_DISAPPOINT`, with chemical 198 listed in its `chemicalsToAdjust[4]` slots alongside chemical 205 (Punishment) | Creature / bloodstream (systemic) — written via `SensoryFaculty.stimulate()` (`Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:1060+`) which walks the four chemical-adjustment slots and calls `Biochemistry.adjustChemicalLevel()` for each | Fired whenever an action attempt fails to bind to a target — e.g. the engine tries to execute a verb script (`push`, `eat`, `get`, …) but the IT slot is empty, the target is out of reach, or the script aborts without progressing. The stimulus delivery raises chemical 198 by the gene-specified amount in a single tick | One-shot pulse per disappointment event |
| 2 | **Direct CAOS injection** | `CHEM 198 …`, `ALTR`, `ADMN`, debug consoles, modder agents, custom stimulus genes | Creature / bloodstream (systemic) | Any CAOS script, debug toy, or modded stimulus gene can write chemical 198 directly. The stock genome only uses it from `STIM_DISAPPOINT`, but mods are free to add additional triggers — for example, a "near-miss" pseudo-disappointment when a creature reaches for food and the food is consumed by a sibling first | One-shot per injection |

There are no reactions that produce chemical 198, no other emitters listed in the genome's emitters table, and no engine code paths that write to it outside the generic `adjustChemicalLevel` plumbing. Because the half-life is zero, the bloodstream level is **always either freshly injected or zero** — there is no carry-over from previous ticks.

Chemical 198 has no `initialConcentrations` entry — every Creature is born with Brain chemical 1 = 0, and the level returns to 0 after every tick where no stimulus injects a fresh pulse.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **`driv→comb` tract init rule, line 5604** — the only consumer in the stock brain | Genome's tract gene for `driv→comb`, init rule entries 4–6 | Brain / `driv→comb` tract — runs every tick because `runInitRuleAlways=true` on this tract | The init rule executes `IF_NON_ZERO CHEMICAL_CODE[198]` followed by `IF_ZERO_STOP NEURON_STATE[2]`. Per SVRule semantics (`Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:404`), `IF_NON_ZERO` skips the *next* instruction when the operand is zero. So when chem 198 = 0 (the resting state), the source-neuron-state-2 check is skipped and only the destination-state-3 check (line 6) gates learning. When chem 198 != 0, *both* checks must pass: the source drive neuron must be firing AND the destination concept neuron must be firing for the dendrite to receive Reward (204) and Punishment (205) reinforcement | Tightens dendrite eligibility from "destination active" to "source AND destination active" — the gate that turns coarse Hebbian learning into sharp blame assignment for the single tick after a disappointment |
| 2 | **Readable via the Biochemistry faculty** | `Biochemistry::GetChemical(198)` | Creature / bloodstream (systemic) | Chemical 198 is an ordinary bloodstream slot. Kits, debug views, the Science Kit chemistry graphs, and CAOS scripts can all read it as `"Brain chemical 1"` from the chemical-name catalogue | Useful for debugging the disappointment pipeline — a Norn that "should" be learning from failures should show momentary spikes here whenever an action aborts. A flat-zero trace during repeated failures is the classic symptom of a broken `STIM_DISAPPOINT` gene load |
| 3 | **Passive decay** (degenerate) | Halflives byte 198 = **0** | Bloodstream (systemic) | `genomeValue = 0` → the original engine's biochemistry `calculateHalfLife()` returns "Instant decay" (`DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278`). The chemical is multiplied by 0 every biochem tick | The level is reset to 0 every tick — chemical 198 can only ever be non-zero on the *same tick* it was injected. There is no exponential-decay curve, no half-life timeline. The pulse is exactly one tick wide |

There are no reactions, no receptors outside the `driv→comb` init rule, no emitters writing into it, and no other consumers in the stock genome. The chemical's purpose-built reader at `brain-architecture.json:5604` is its sole use.

## Role in Game Mechanics

### The reinforcement learning pipeline

Brain chemical 1 sits inside one of the most carefully orchestrated tick-aligned sequences in C3:

```
TICK N (an action-failure event happens)
    Engine: verb script aborts (push w/o target, eat w/o food, etc.)
        ↓
    Engine: SensoryFaculty.stimulate(STIM_DISAPPOINT, ...)
        ↓
    StimulusLibrary: look up the loaded G_STIMULUS gene for STIM_DISAPPOINT
        ↓
    Walk chemicalsToAdjust[4]:
        slot A → adjustChemicalLevel(198, +Δ)   ← Brain chemical 1 pulses ON
        slot B → adjustChemicalLevel(205, +Δ)   ← Punishment pulses ON
        ↓
    Biochemistry: myChemicalConcs[198] := pulseAmount
                  myChemicalConcs[205] := pulseAmount

TICK N + 1 (one brain tick later, Reward/Punishment still elevated, chem 198 still elevated)
    Brain: driv→comb tract runs init rule (runInitRuleAlways = true)
        line 4:  IF_NON_ZERO CHEMICAL[198]   → chem 198 != 0, fall through
        line 5:    IF_ZERO_STOP NEURON_STATE[2]   → require source neuron state[2]
        line 6:  IF_ZERO_STOP NEURON_STATE[3]     → require destination state[3]
        line 7:  LOAD_ACC CHEMICAL[205]           → Punishment level
        ...      apply -0.70 × (Punishment - 0.10) to dendrite weight
        line 12: LOAD_ACC CHEMICAL[204]           → Reward level
        ...      apply +0.70 × (Reward - 0.10)   to dendrite weight
    Result: only the dendrite from the firing drive neuron to the
            currently-winning concept neuron has its STW pushed down.

    Biochemistry tick: chem 198 *= 0       → reset to zero
                       chem 205 decays      → very-short half-life (1 tick)
                       chem 204 decays      → very-short half-life (1 tick)

TICK N + 2 (back to resting state)
    chem 198 = 0
        line 4:  IF_NON_ZERO CHEMICAL[198]   → chem 198 == 0, skip line 5
        line 5:  (skipped — the source-state-2 check is bypassed)
        line 6:  IF_ZERO_STOP NEURON_STATE[3] → only require destination state[3]
        ...      Reward/Punishment paths still run, but Reward and Punishment
                 are now near zero, so STW changes are tiny.
    Result: normal, permanent, broad Hebbian pass — destination-only eligibility,
            but no significant chemical drive.
```

Two tick-aligned mechanisms make this work:

1. **Both Brain chemical 1 and Punishment must still be elevated when the brain reads them.** Because biochemistry runs first and brain runs after, and because chemicals 198/204/205 all decay extremely fast (chem 198 instantly, Reward and Punishment with very-short half-lives), the genome relies on the stimulus pulse being delivered on the same tick (or one tick before) the brain reads them. The `runInitRuleAlways` flag on `driv→comb` (`Rebuild/Main_Game/src/engine/creature/brain/Tract.js:485`) is what guarantees the consumer fires every tick rather than only on dendrite migration.

2. **The pulse is a gate, not a value.** Chemical 198's actual *concentration* is irrelevant — only whether it is non-zero matters for the `IF_NON_ZERO` test. The genome could pulse it to 1, to 100, or to 255; the gate behaviour is identical. This is why the chemical has zero half-life: there is no need for it to have a magnitude-vs-time curve. It is a flag, biochemically expressed.

### Why a gate at all? The blame-assignment problem

Without chemical 198, the `driv→comb` init rule's reinforcement block would gate purely on `NEURON_STATE[3]` of the *destination* concept neuron. Reward (204) and Punishment (205) would then be applied to **every** dendrite whose destination concept neuron is currently firing — meaning every drive neuron's edge into the active concept would be reinforced, regardless of which drive actually motivated the failed action.

That is the standard "credit-assignment problem" of associative learning: when many signals are simultaneously active and one of them produces a bad outcome, which one should be blamed? Stock C3 solves it by adding a *second* eligibility check that fires only on disappointment ticks: the source drive neuron's state[2] must also be non-zero. Source state[2] is, by convention, the drive neuron's winner-takes-all victory output for that tick — it is non-zero only on the single drive neuron whose drive level made it the dominant motivator. So the disappointment gate is, in effect: *"of all the drives that were active during this failure, blame only the one that won the WTA contest."*

Chemical 198 is the chemical-side switch that turns this stricter gate on. Outside disappointment events, the gate is off, the source-state[2] check is bypassed, and the broad Hebbian pass runs as normal. On disappointment events, the gate is on, only the actively-driving drive's dendrite is eligible, and the Punishment pulse lands precisely where it should.

### Why a chemical, rather than a flag in the brain?

A reasonable question: if all this happens over two ticks and is fully internal to the brain, why use a *chemical* — a bloodstream entity — rather than a brain-private state bit? Three structural reasons:

1. **Stimulus delivery is the genome's universal lever.** All `G_STIMULUS` genes write into biochemistry through the same `chemicalsToAdjust[4]` array. By making the gate a chemical, the genome can use the existing stimulus pipeline — no new opcode, no new neural state, no new engine plumbing. Modders who want to add their own disappointment-like events do so by writing a new `G_STIMULUS` gene that pulses chemical 198, and the existing `driv→comb` tract picks it up automatically.
2. **The biochemistry → brain bus is the only single-source-of-truth bus the brain has.** Drive neurons are written by `SensoryFaculty.updateDriveLobe` from the chemical drive levels (148–162, 199–203). Reward and Punishment are read from chemicals 204/205. By using chemical 198 the genome keeps the entire reinforcement system on the same bus, which makes it observable in Kits, dump-able to debug screens, and adjustable from CAOS — qualities that brain-internal flags would not have.
3. **It is a clean place to add new gates.** Chemical 206 ("Brain chemical 9") is the explicitly-reserved expansion slot, but the same template — short-lived chemical, written by a stimulus gene, read by an `IF_NON_ZERO CHEMICAL_CODE[…]` line in a tract init rule — is what any modder would use to add a new gate. Chemical 198 is, in effect, the *first deployed instance* of that template, and chemical 206 is the *blank instance* waiting for a second use.

### Producer chain in detail

The exact path from "creature attempts an action that aborts" to "chemical 198 is non-zero" runs through several systems:

1. **Verb script aborts.** A creature's brain has selected a verb (e.g. `push`) and an `IT` target. The verb script is invoked by the Decision lobe pipeline. If the script cannot complete — no target, target moved, action denied by the script's own logic — the script ends without success.
2. **Engine fires `STIM_DISAPPOINT`.** The engine paths that detect aborted actions call the creature's stimulate routine or equivalent with the disappointment stimulus id. In the JS rebuild, the analogous call lands on `SensoryFaculty.stimulate()` (`Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js`).
3. **`StimulusLibrary` resolves the gene.** `myStimulusLib.getStimulus(STIM_DISAPPOINT)` returns the loaded `Stimulus` object, including its `chemicalsToAdjust[4]` array. Each slot is a `(chemicalId, amount)` pair packed from the genome's `G_STIMULUS` entry.
4. **`SensoryFaculty.stimulate` walks the slots.** For each non-zero pair, it calls `Biochemistry.adjustChemicalLevel(chemId, amount)`. In the stock genome, the disappointment entry packs (chem 198, +pulse) into one slot and (chem 205, +pulse) into another.
5. **Biochemistry registers the pulse.** `myChemicalConcs[198]` is set; `myChemicalConcs[205]` is set. The brain holds a *live reference* to `myChemicalConcs` (handed in via `Brain.registerBiochemistry()` at construction, see the Brain Chemicals article) so the rise is visible to SVRules on the next brain update.

Critically, the stimulus gene's `chemicalsToAdjust[4]` array is the **only** mechanism that wires a stimulus event to a chemical pulse in the stock genome. There is no hardcoded "if disappointed, raise chem 198" line anywhere in the engine — the binding is purely genome-data, which is why a broken gene-load (the `d10b477` bug fixed in the JS port, see "JS port notes" of the brain-chemicals article) silently disables chemical 198 entirely.

### Consumer in detail: the `driv→comb` init rule

The relevant excerpt of `brain-architecture.json:5599-5705` (the `driv→comb` tract's init rule, lines numbered as they appear in the rule body):

```
line  2: IF_ZERO        CHEMICAL[212]            ; if Pre-REM sleep == 0, skip line 3
line  3:   DO_SET_ST_TO_LT_RATE  0.032           ;   damp learning rate while awake
line  4: IF_NON_ZERO    CHEMICAL[198]            ; if chem 198 == 0, skip line 5
line  5:   IF_ZERO_STOP NEURON_STATE[2]          ;   require source state[2] != 0
line  6: IF_ZERO_STOP   NEURON_STATE[3]          ; require destination state[3] != 0
line  7: LOAD_ACC       CHEMICAL[205]            ; load Punishment
line  8: SUBTRACT       VALUE[~0.10]             ; threshold
line  9: IF_NEGATIVE_GOTO line 12                ; below threshold? skip the punishment branch
line 10: MULTIPLY_BY    -0.70                    ; negative learning rate
line 11: ADD_AND_STORE_IN DENDRITE_WEIGHT[0]     ; weaken the dendrite STW
line 12: LOAD_ACC       CHEMICAL[204]            ; load Reward
line 13: SUBTRACT       VALUE[~0.10]             ; threshold
line 14: IF_NEGATIVE_GOTO end                    ; below threshold? we're done
line 15: MULTIPLY_BY    +0.70                    ; positive learning rate
line 16: ADD_AND_STORE_IN DENDRITE_WEIGHT[0]     ; strengthen the dendrite STW
```

The key behaviour of the four chemical-198-related lines (4–6):

- **chem 198 = 0:** line 4's `IF_NON_ZERO` test is false → skip line 5. Line 6 runs, requiring only destination state[3]. **Learning is gated only by "is the destination concept active?"** This is the normal, ongoing Hebbian pass: every dendrite ending at a firing concept neuron gets its STW adjusted by Reward and Punishment, regardless of which source drive is firing.
- **chem 198 != 0:** line 4's test is true → fall through. Line 5 runs, requiring source state[2]. Line 6 still runs, requiring destination state[3]. **Learning is gated by "is the source drive AND destination concept BOTH active?"** This is the disappointment pass: only the dendrite from the actively-driving drive neuron to the current concept neuron is eligible.

The remaining lines (7–16) compute Punishment- and Reward-driven weight changes whose magnitude depends on the chemical levels of 204 and 205 *at this same tick*. The disappointment gate is in chemical 198; the disappointment *signal* is in chemical 205. Both are pulsed simultaneously by the same `STIM_DISAPPOINT` gene.

### What Brain chemical 1 is *not*

A few clarifications, because the chemical's anonymous catalogue name invites speculation:

- **It is not a generic "brain activity" indicator.** Despite the name suggesting "brain chemical number 1 of N", chemical 198 has a specific role and is read by exactly one rule. There is no global brain-level monitor that polls it.
- **It is not part of the navigation drives.** The navigation drives (Up, Down, Exit, Enter, Wait) live at chemicals 199–203, immediately after chemical 198 in the catalogue. They are functionally unrelated — they reach the brain through `SensoryFaculty.updateDriveLobe()` driving the `driv` lobe's neurons 15–19, not through any SVRule chemical read.
- **It is not Reward or Punishment.** Reward (204) and Punishment (205) carry the *magnitude* of the reinforcement; chemical 198 carries only the *blame-assignment gate*. A creature can receive Reward or Punishment without chemical 198 being raised (and routinely does — every successful action delivers Reward without disappointment).
- **It does not stack or accumulate.** Two disappointments in two consecutive ticks produce two separate pulses, but each tick the chemical is reset to zero. There is no "I have been disappointed many times" memory in chemical 198 itself — that role, if it existed, would be played by a longer-lived chemical (such as one of the per-cause Stress chemicals if a `Stress (Disappoint)` cascade were ever wired).
- **It is not used by the per-tract reward/punishment system.** That system (opcodes 59 / 62, `SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`, processed by `Tract.processRewardAndPunishment()` in `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`) reads chemicals 204 and 205 from registered slots — not chemical 198. Chemical 198's gate is hand-coded into the `driv→comb` init rule directly via the `CHEMICAL_CODE` operand, not via the generic reinforcement plumbing.

### Modding affordances

Because chemical 198 is wired entirely through genome data and lives on the standard stimulus → chemical → SVRule pipeline, modders can repurpose or extend it cleanly:

- **Replicate the gate for other tracts.** A modded `driv→forf` (drive → friend/foe) or `driv→mood` tract that wants to apply the same blame-assignment trick can borrow the exact `IF_NON_ZERO CHEMICAL[198]` / `IF_ZERO_STOP NEURON_STATE[2]` / `IF_ZERO_STOP NEURON_STATE[3]` pattern. The disappointment pulse is already being delivered every time `STIM_DISAPPOINT` fires; new tracts simply need to read the chemical too.
- **Add a second producer.** A modded stimulus gene for a finer-grained failure event (e.g. `STIM_NEAR_MISS`, `STIM_REJECTED_BY_PEER`) can pulse chemical 198 in its `chemicalsToAdjust[4]` array. The existing `driv→comb` consumer will treat the new pulse identically to the stock disappointment pulse.
- **Combine with chemical 206.** Genetic engineers wanting a *second* independent gate (e.g. one for "social failure" and one for "physical failure") can pulse chemical 198 from one stimulus and chemical 206 (the reserved Brain chemical 9 slot) from another, then have different tracts gate on the appropriate chemical.
- **Tune the pulse magnitude.** Because the gate is `IF_NON_ZERO` and not "if above threshold N", the pulse magnitude does not affect gate behaviour — but it *can* affect detection by other consumers a modder might add. A modder who adds a `CHEMICAL_CODE[198]` read with `SUBTRACT VALUE[…]` and a threshold check can use the magnitude of the pulse as a "severity of disappointment" axis without breaking the existing gate semantics.

### Practical consequences for gameplay

- **Disappointed Norns learn the right lesson.** A Norn that pushes an empty space, sees no result, and is stimulated with `STIM_DISAPPOINT` will reduce the strength of the *exact* drive→concept association that motivated the failed push — not the entire concept's drive eligibility. Over repeated failures, the Norn stops pushing in that situation specifically because its dominant drive in that situation no longer associates strongly with the concept. The blame-assignment narrowing is what makes this learning sharp rather than diffuse.
- **A broken `STIM_DISAPPOINT` gene-load disables aversive learning.** If `StimulusLibrary.readFromGenome` fails to populate the `chemicalsToAdjust[4]` array for the disappointment stimulus, chemical 198 stays at zero forever. The `driv→comb` init rule then runs without ever entering its tight-gate branch — but it still runs the Reward/Punishment path with destination-only eligibility. The broad Hebbian pass continues to work, but the precision is gone: when a creature fails an action, the punishment lands smeared across every drive that happened to be co-active. The classic JS-port symptom (fixed in commit `d10b477`) was Norns failing to learn from explicit "no!" patting and disappointment events because all stimulus-driven chemical pulses, including the chem 198 pulse, were silently dropped.
- **Watching chemical 198 in Kits diagnoses the disappointment pipeline.** The Science Kit's chemistry graph will show chemical 198 as flat-zero in resting Norns (correct) and as brief upticks at disappointment moments (correct). A flat trace during repeated action-failures is a red-flag for a stimulus library load problem; a permanently-elevated trace would indicate a stuck stimulus or a bug in the half-life loop (since the genome value is zero, the chemical *must* return to zero every tick).
- **CAOS injection bypasses the gate.** `CHEM 198 100` on a creature inside a CAOS script will, on the next brain tick, force the `driv→comb` init rule into its tight-gate branch even if no actual disappointment occurred. This is occasionally useful for test fixtures: a pre-conditioned chemical-198 pulse just before delivering a Punishment pulse (`CHEM 205 100`) will produce a clean, narrow learning event without needing to engineer a real action-failure scenario. It is also useful for stress-testing the consumer: with chemical 198 forced high every tick, the brain runs the tight gate continuously and the user can observe how that affects long-running learning curves.

### JS port notes

The Rebuild port treats chemical 198 as an ordinary bloodstream chemical — there is no `CHEM_BRAIN_CHEMICAL_1` or `CHEM_DISAPPOINT_GATE` constant, no special-case path, no engine-level handling. Three correctness requirements specifically apply to its behaviour:

- **Stimulus library must populate `chemicalsToAdjust` from the genome.** `Rebuild/Main_Game/src/engine/creature/perception/StimulusLibrary.js:29` was the bug fixed in commit `d10b477` — the previous code called `genome.getGeneType` with string literals that did not match the genome's gene-type enumeration, so all `G_STIMULUS` genes silently failed to load. After the fix, the chem-198 binding is correctly read from the genome and pulses arrive at the brain on stimulation.
- **The brain must hold a live reference to `myChemicalConcs`.** `Biochemistry.getChemicalConcs()` (`Rebuild/Main_Game/src/engine/creature/biochemistry/Biochemistry.js:202`) must return the underlying typed array, not a copy. `Brain.registerBiochemistry()` and the per-tract `pointerToChemicals` field must propagate that reference unchanged. SVRule's `CHEMICAL_CODE` operand path (`Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668`) reads `pointerToChemicals[arrayIndex % 256]` — for chemical 198, an out-of-sync copy would silently miss the pulse because it would always read the previous tick's zero.
- **`runInitRuleAlways` on the `driv→comb` tract must be loaded as `true` from the genome.** `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:159` parses this flag from the tract gene; line 485 uses it to decide whether to invoke the init rule on every tick. If the flag loads as false, the init rule fires only on dendrite migration and the chem 198 / Reward / Punishment reinforcement path is inert outside migration moments. Asserting this flag at runtime for `driv→comb` is a recommended sanity-check during port validation.

The half-life calculation (`DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278`) shows that genomeValue 0 maps to "Instant decay" — multiplied by 0 every tick. The JS biochemistry tick must implement this branch; a naive `level *= decayRate` with `decayRate=0` works correctly (multiplying by zero produces zero), but a port that special-cases very-fast decay or skips zero-genome-value chemicals from the tick loop must ensure the level is still reset to zero each tick. Otherwise, an injected chemical-198 pulse would persist across multiple brain ticks, and the "tight gate" branch would stay activated for longer than intended.

### Summary

```
   STIM_DISAPPOINT stimulus event (action attempt aborts)
                       │
            SensoryFaculty.stimulate()
                       │
        StimulusLibrary.getStimulus(STIM_DISAPPOINT)
                       │
        chemicalsToAdjust[4]: pulse chem 198, pulse chem 205
                       │
                       ▼
       Biochemistry: myChemicalConcs[198] := pulse
                     myChemicalConcs[205] := pulse
                       │
                       ▼ (next brain tick)
  Brain: driv→comb tract init rule (runInitRuleAlways = true)
       line 4: IF_NON_ZERO CHEMICAL[198]      ← gate read
       line 5:   IF_ZERO_STOP NEURON_STATE[2] ← source-drive eligibility
       line 6: IF_ZERO_STOP NEURON_STATE[3]   ← destination-concept eligibility
       line 7+: Punishment from CHEMICAL[205] applied to dendrite STW
       line 12+: Reward from CHEMICAL[204] applied to dendrite STW
                       │
                       ▼ (same tick, biochem update)
       Biochemistry: myChemicalConcs[198] *= 0  ← instant decay back to zero
                       │
                       ▼ (resting state, next tick)
       chem 198 = 0 → tight gate disabled, broad Hebbian pass resumes

   Brain chemical 1 is the disappointment blame-assignment gate:
     - Pulsed exclusively by STIM_DISAPPOINT in the stock genome
     - Read exclusively by the driv→comb tract init rule (line 5604)
     - Half-life = 0 ticks (instant decay) — pulse is exactly 1 tick wide
     - Sole purpose: tighten dendrite eligibility from
       "destination concept neuron firing" to
       "source drive neuron AND destination concept neuron firing"
     - Required for sharp blame assignment in aversive learning
     - Modder-friendly: free to repurpose for any tract, any stimulus
     - One of two genuinely-available expansion slots in the brain-chemical block
       (the other being chemical 206 / "Brain chemical 9")
```

## Key Source References

- `ChemicalNames.catalogue` — the string `"Brain chemical 1"` as the 198th entry in the chemical-names table
- `DOCUMENTATION/CreaturesData/brain-architecture.json:5599-5605` — the `driv→comb` tract init rule entries for `IF_NON_ZERO CHEMICAL_CODE[198]`, the only stock consumer of chemical 198
- `DOCUMENTATION/CreaturesData/brain-architecture.json:5558` — the `driv→comb` tract definition where the init rule is registered (with `runInitRuleAlways=true` required for the gate to fire every tick)
- `DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278` — `calculateHalfLife()` showing that `genomeValue=0` maps to "Instant decay", which is why the chemical 198 entry is omitted from the half-lives table in `biochemistry.json` (see line 465 of the same script: `if (value === 0) continue`)
- `DOCUMENTATION/articles/game-systems/brain-chemicals.md` — the deep-dive article on the entire 198–206 brain-chemical block, with full discussion of chemical 198's role alongside Reward, Punishment, and the navigation drives
- `DOCUMENTATION/articles/game-systems/reinforcement-learning-pipeline.md` — end-to-end flow from stimulus delivery to dendrite weight consolidation, including the Reward/Punishment/STW/LTW pipeline that chemical 198 gates
- `Rebuild/Main_Game/src/engine/creature/perception/StimulusLibrary.js:29` — `readFromGenome()` populates `chemicalsToAdjust` from `G_STIMULUS` genes; the `d10b477` fix that made chemical 198 actually rise on disappointment events
- `Rebuild/Main_Game/src/engine/creature/perception/Stimulus.js:73` — `stimChemToBioChem` mapping that translates stimulus chemical slot ids to chemistry indices
- `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:1060+` — `stimulate()` walks the stimulus's `chemicalsToAdjust[4]` and calls `Biochemistry.adjustChemicalLevel()` for each
- `Rebuild/Main_Game/src/engine/creature/biochemistry/Biochemistry.js:202` — `getChemicalConcs()` returns the live reference to `myChemicalConcs` that the brain uses to read chemical 198
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:86` — `registerBiochemistry()` distributes the chemical-array reference to every lobe and tract
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668` — `CHEMICAL_CODE` operand handler reads `pointerToChemicals[arrayIndex % 256]`; the path through which chemical 198 reaches the `driv→comb` init rule
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:404` — `IF_NON_ZERO` opcode semantics ("skip next instruction if operand is zero"), the basis of the chemical 198 gate
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:159` (load) and `:485` (use) — `runInitRuleAlways` parsing and enforcement, the flag that makes the `driv→comb` init rule (and therefore chemical 198's consumer) fire every tick rather than only on dendrite migration
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531` — `processRewardAndPunishment()`, the *generic* reinforcement system that reads chemicals 204/205 via opcodes 59/62; chemical 198 is *not* used by this system, only by the `driv→comb` init rule directly
- `DOCUMENTATION/chemicals/204 - Reward.md` — sibling doc on the Reward chemical that chemical 198 gates the application of (if present)
- `DOCUMENTATION/chemicals/205 - Punishment.md` — sibling doc on the Punishment chemical, the partner pulse that `STIM_DISAPPOINT` raises alongside chemical 198 (if present)
- `DOCUMENTATION/chemicals/206 - Brain chemical 9.md` — sibling doc on the explicitly-reserved expansion slot in the brain-chemical block (if present)
