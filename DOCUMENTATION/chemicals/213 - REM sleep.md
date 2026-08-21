# 213 - REM sleep

**REM sleep** (catalogue slot 213) is the **engine-level "we are dreaming"** signal that the brain raises for the entire duration of the REM / instinct-processing phase of a Norn's sleep cycle. It is the second of two engine-reserved sleep chemicals — its companion is chemical **212 ("Pre-REM sleep")** — and the pair is wired into the engine's `Brain` constructor as the **`INSTINCT_CHEMICAL_NUMBER`** / **`PREINSTINCT_CHEMICAL_NUMBER`** parameters read from `Brain.catalogue`'s `"Brain Parameters"` array (slots `0` and `1`, values `213` and `212`). Where chemical 212 is a one-tick *configuration pulse* fired immediately before REM begins, chemical 213 is the **steady-state activity flag** that stays at `1.0` for as long as the Creature is in the `DREAMING` state and gates every REM-specific computation in the brain's lobes and tracts.

The chemical's purpose, expressed from the original engine comment:

> *"When flagged the brain processes instincts every tick instead of its normal activity. When processing instincts two biochemicals are set to indicate to the brain's SV-Rules that all learning should be long-term, not short-term as normal."*

That sentence captures the entire semantics of the slot. **Chemical 213 is the "all learning is long-term" flag** that the SVRule VM reads from inside the lobe and tract update rules to decide whether the current brain tick is a normal awake tick or a memory-consolidation REM-dream tick. The stock C3 brain reads chemical 213 in three different SVRule sites:

1. The **`comb` lobe init rule** (top, `brain-architecture.json:1395-1404`) — early-out branch that bypasses the awake-mode neuron decay setup when REM is active.
2. The **`comb` lobe update rule** (line 1610-1615) — gates whether to use the awake-mode tend rate or the REM-mode tend rate when updating composer-lobe neurons.
3. The **`driv→comb` tract update rule** (line 5795-5810) — gates whether to perform the long-term-to-short-term weight convergence that consolidates the day's learning into the long-term weights of the drives-to-decision tract.

Together these three sites implement the canonical *Creatures 3* REM model: while chemical 213 is `1.0`, the composer (`comb`) lobe stops fighting the input from `driv` (the "awake" decay logic is skipped), and the `driv→comb` tract collapses its short-term weights into its long-term weights. This is the engine-level mechanism by which **dreaming consolidates the day's experience into long-term memory** in the drives-to-decision tract — the part of the brain that decides what to do given the current set of internal needs.

Like chemical 212, REM sleep is **not produced or consumed by the bloodstream biochemistry**: no `G_REACTION`, `G_RECEPTOR`, `G_EMITTER` or `G_STIMULUS` gene names it. The brain itself writes the slot directly via `Brain.setWhetherToProcessInstincts()`, and clears it again when the LifeFaculty leaves the `DREAMING` state. Its entire lifecycle is bounded by the LifeFaculty's sleep state-machine.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **Brain steady-state write** (sole stock producer) | `Brain.setWhetherToProcessInstincts(true)` (JS port `Brain.js:459-489`) | Brain organ — direct write into the bloodstream chemicals array via `myPointerToChemicals[instinctChemicalNumber] = 1.0` | LifeFaculty enters `DREAMING` state → `Brain.setWhetherToProcessInstincts(true)` → after the one-tick Pre-REM preflight, sets `chem[213] = 1.0` and holds it there for every subsequent brain tick | **Persistent `1.0` for the full REM phase** (typically dozens to hundreds of ticks depending on instinct queue length) |
| 2 | **Deferred biochemistry write** | `Brain.registerBiochemistry()` (`Brain.js:108-111`) | Brain organ | If `setWhetherToProcessInstincts(true)` is called *before* the biochemistry array is wired in (e.g. `DREA 1` on a freshly-spawned Norn), the brain remembers the pending state and writes `chem[212] = 0.0` / `chem[213] = 1.0` on the very next `registerBiochemistry()` call. The Pre-REM preflight is skipped on this path; only the steady REM-active state is restored | One-shot, on biochemistry registration |
| 3 | **CAOS injection** (debug / modder use) | `CHEM 213 …`, `ALTR 213 …`, `ADMN 213 …` | Creature / bloodstream | Any CAOS script can write the slot directly via `Biochemistry.adjustChemicalLevel(213, amount)`. With halflives byte 255 (effectively no decay), an injected value persists for the Creature's lifetime unless explicitly cleared or overwritten by the brain's next REM transition | One-shot per injection, persistent thereafter |
| 4 | **Modder-defined producers** | New `G_STIMULUS`, `G_REACTION`, `G_EMITTER` or `G_RECEPTOR` genes added to a modded genome | Modder's choice of organ / tissue | The genome is free to add producers — for example, a stimulus gene that pulses chemical 213 from a "dreaming machine" agent to force a Creature into the REM-learning regime without putting them to sleep. Any value written this way is overwritten by the next engine-driven `SetWhetherToProcessInstincts()` transition | Modder's choice |

There are **no `G_REACTION`, `G_EMITTER`, `G_RECEPTOR` or `G_STIMULUS` genes in the stock C3 genome that name chemical 213**. Every stock pulse on this slot originates from the engine's brain code. There is no `initialConcentrations` entry — every Creature is born with chemical 213 = 0. The only `nominal: 213` values appearing in `biochemistry.json` (e.g. lines 6500, 6519, 6538) are **receptor sensitivity nominals on Vitamin C receptors**, not references to chemical 213; those genes target chemical `99` and merely use `213` as their tuning constant.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **`comb` lobe init-rule early-out** | Lobe 5 init rule, `brain-architecture.json:1395-1412` | Brain — composer / decision lobe (`comb`) | Top of init rule: `IF_NON_ZERO CHEMICAL_CODE[213]` → `GOTO_LINE 11`. When chemical 213 is non-zero (REM phase), the rule jumps past the awake-mode tend-rate setup (lines 2-10) and lands in the REM-mode tail of the rule (line 11 onward) | Skips the awake-mode neuron tend-rate configuration during REM. The composer lobe stops actively *deciding* during dreaming and instead lets long-term-weight changes drive its behaviour |
| 2 | **`comb` lobe update-rule branch** | Lobe 5 update rule, `brain-architecture.json:1610-1622` | Brain — composer lobe | `LOAD_ACCUMULATOR_FROM VALUE_CODE[199]` (≈0.802); `IF_NON_ZERO CHEMICAL_CODE[213]` → skip next; `LOAD_ACCUMULATOR_FROM ONE_CODE`. So awake mode loads `0.802` and keeps it, while REM mode skips the `0.802` load and replaces it with `1.0` | Switches the composer lobe's update accumulator between an awake-mode value (0.802) and a REM-mode value (1.0), changing the tend behaviour of the composer's neuron state during dreaming |
| 3 | **`driv→comb` tract update-rule gate** (the canonical "dream consolidation" site) | Tract 5 update rule, `brain-architecture.json:5795-5818` | Brain — drives → composer tract | Update rule sequence: `LOAD_ACCUMULATOR_FROM ONE_CODE`; `IF_ZERO CHEMICAL_CODE[213]`; `LOAD_ACCUMULATOR_FROM VALUE_TENTH_CODE[1]` (≈0.004); `DO_SET_LT_TO_ST_RATE_AND_DO_WEIGHT_ST_LT_WEIGHT_CONVERGENCE`. Per `SVRule.js:402-404`, `IF_ZERO operand` skips the next line when `operand !== 0`. So when chem[213] = 0 (awake), the rate is the small `0.004`; when chem[213] = 1 (REM), the small load is skipped and the rate stays at `1.0` | Switches the long-term-to-short-term **weight convergence rate** between an awake-mode value (≈0.004 — almost no consolidation) and a REM-mode value (1.0 — full convergence). This is the engine-level mechanism that **collapses the day's short-term Hebbian learning into long-term memory** during REM dreams |
| 4 | **`Brain.checkInstinctChemicals()` query** | `Brain.js:156-164` | Brain organ — read-only public API | `return this.myPointerToChemicals[this.instinctChemicalNumber] > 0.5` | Diagnostic / introspection — used internally by the JS port to detect "are we in REM right now" without round-tripping through `myInstinctsAreBeingProcessed` |
| 5 | **`Brain.getInstinctChemicalLevel()` query** | `Brain.js:170-175` | Brain organ — read-only public API | `return this.myPointerToChemicals[this.instinctChemicalNumber]` | Returns the raw concentration, available to faculty code, debug consoles, the Science Kit graph, and any caller that needs the floating-point value |
| 6 | **Modder-defined SV-rule consumers** | New tract `G_TRACT` or lobe `G_LOBE` genes whose init-rule or update-rule references `CHEMICAL_CODE[213]` | Brain — any tract or lobe | Any modded init or update rule can branch on chemical 213 the same way the stock `comb` and `driv→comb` rules do — this is the engine's **public extension point** for "do something different during REM" | Modder's choice. Useful for any tract that wants to apply REM-only learning, REM-only damping, REM-only decay, or any other dream-phase-specific behaviour |
| 7 | **Passive decay** (effectively none) | Halflives byte 213 = **255** | Bloodstream (systemic) | `genomeValue = 255` → `calculateHalfLife()` returns `halfLifeInTicks ≈ 9.07 × 10¹⁰` with `decayRate ≈ 1.0` (`extract-biochemistry.js:265-278`) | The chemical does not naturally decay back to zero on a meaningful timescale. The slot is reset to 0 by the brain's *explicit* clearing write at REM exit, not by half-life decay. If the brain failed to clear the slot, an injected value would linger essentially forever |

There are no emitters reading chemical 213 from the bloodstream into a neuron lobe (in the receptor sense), no receptors converting it into a faculty input, and no genome-level reactions consuming it. Every stock consumer is an SVRule branch test inside a brain component.

## Role in Game Mechanics

### The sleep / dreaming / instinct cycle

REM sleep is meaningful only inside the broader sleep state-machine that the LifeFaculty drives. The relevant LifeState transitions (`Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:254-264`) are:

```
ALERT          — Creature is awake; chem[212] = 0, chem[213] = 0
   │
   │  Sleepiness chemistry (chemicals 154/155, plus toxin 71) builds up,
   │  the involuntary action system pushes the Creature into ASLEEP.
   ▼
ASLEEP         — Creature is asleep but not yet dreaming; chem[212] = 0, chem[213] = 0
   │
   │  Eventually the Creature transitions to DREAMING — the LifeFaculty's
   │  setState() handler at LifeFaculty.js:255-258 calls
   │  Brain.setWhetherToProcessInstincts(true).
   ▼
DREAMING       — REM phase / instinct processing
   ↑   ↑
   │   ├── (one-tick preflight at entry)        chem[212] = 1, chem[213] = 0
   │   │       Brain.updateComponents() runs once with the preflight values.
   │   │       Tract init rules reading chem[212] reconfigure for REM.
   │   │
   │   └── (steady REM state)                   chem[212] = 0, chem[213] = 1
   │           Held for every subsequent brain tick. Lobe and tract update
   │           rules reading chem[213] take their REM-mode branches.
   │
   │  When dreaming ends (instinct queue exhausted, or Creature wakes):
   │  LifeFaculty.js:260-264 calls Brain.setWhetherToProcessInstincts(false).
   ▼
ALERT          — Both chemicals zeroed in a single write; no exit pulse
                 chem[212] = 0, chem[213] = 0
```

The two chemicals are deliberately separated:

- **Chemical 212 (Pre-REM sleep)** is the **configuration tick**. It pulses for exactly one brain update so that *init rules* can re-configure tracts for REM.
- **Chemical 213 (REM sleep)** is the **activity flag**. It stays high for the full REM phase so that *update rules* can take their REM-mode branches every tick.

This separation is the engine's split between configuration code (init rules) and processing code (update rules) — see the chemical-212 documentation for the architectural rationale.

### REM consolidates `driv→comb` long-term memory

The single most important consumer of chemical 213 is the **`driv→comb` tract's update rule**. This tract carries signal from the drives lobe (the Norn's hunger, fear, loneliness, etc.) into the composer lobe (the decision-making layer that selects the next action verb). Its update-rule gate on chemical 213 implements the full *Creatures 3* REM-consolidation model:

```
brain-architecture.json:5705-5836  (Tract 5: driv→comb update rule)

  ;  …earlier lines compute the dendrite-input contribution…
  TEND_TO_AND_STORE_IN  DENDRITE_CODE[0]
  LOAD_ACCUMULATOR_FROM ONE_CODE                  ; default rate ≈ 1.0
  IF_ZERO CHEMICAL_CODE[213]                      ; REM sleep flag
  LOAD_ACCUMULATOR_FROM VALUE_TENTH_CODE[1]       ; 0.004032 (~1/250)
  DO_SET_LT_TO_ST_RATE_AND_DO_WEIGHT_ST_LT_WEIGHT_CONVERGENCE
  …
```

Reading this with `SVRule.js:402-404`'s `IF_ZERO` semantics (skip next instruction if operand ≠ 0):

- **Awake** (`chem[213] = 0`): the conditional matches, the next line runs, and the convergence rate is set to **0.004**. The long-term weights barely move; the tract effectively retains its existing long-term decision-making policy and the day's experiences accumulate as transient short-term weights only.
- **REM dreaming** (`chem[213] = 1`): the conditional fails, the next line is skipped, and the convergence rate stays at **1.0**. The long-term weights converge fully toward the short-term weights in a single tick. The day's short-term Hebbian learning is collapsed into the long-term memory of the tract.

Combined with the matching **Pre-REM init-rule branch** (which sets the short-term-to-long-term *forward* rate to 1.0 for one configuration tick before REM begins), this is the engine-level mechanism by which **REM sleep performs memory consolidation in the drives-to-decision tract**. It is the literal implementation of the design phrase "all learning is long-term" from the original engine comment.

### REM relaxes the `comb` lobe's awake-mode logic

The other site that reads chemical 213 is the `comb` lobe itself, in both its init rule and its update rule. The init rule check at line 1402:

```
brain-architecture.json:1395-1412 (comb lobe init rule)

  IF_NON_ZERO CHEMICAL_CODE[213]                  ; REM sleep
  GOTO_LINE   VALUE_INT_CODE[11]                  ; jump past awake setup
  SET_TEND_RATE VALUE_CODE[66]                    ; awake tend rate
  IF_ZERO NEURON_CODE[2]                          ; …awake-mode init…
  …
```

With `IF_NON_ZERO operand` semantics (skip next instruction if operand = 0): when chem[213] is non-zero (REM), the conditional matches and the GOTO fires, jumping the rule to its REM-tail. The awake-mode tend-rate setup is bypassed.

The update rule check at line 1614 follows the same pattern: it picks one of two accumulator values (≈0.802 awake, 1.0 REM) and uses that as the input to the composer's neuron-state tend operation. The combined effect of these two checks is that during REM the composer lobe stops *fighting* the input from `driv→comb` — its neurons tend toward whatever the dreaming drive lobe is signalling rather than damping back to a homeostatic awake-mode value. This is what makes the consolidation in the `driv→comb` tract actually *take hold* in the composer's neuron weights: the lobe is in "receptive" mode rather than "active decision" mode.

### Why two chemicals instead of one

The design splits the REM signal into a one-tick *configuration* pulse (chem 212) and a sustained *activity* flag (chem 213) for three reasons, all of which are consequences of the SVRule VM's separation between init rules and update rules:

1. **Init rules are reconfiguration code; update rules are processing code.** Init rules naturally belong to chemical 212 (run once at REM entry to set learning rates and dendrite parameters). Update rules naturally belong to chemical 213 (run every tick to carry out the actual REM-mode processing). Mixing the two would force every consumer to know whether a given tick is the entry tick or a steady-state tick.
2. **The configuration step needs to be atomic.** The Pre-REM tick must run `updateComponents()` exactly once with a fully-configured "REM mode" before any REM update starts. If a single chemical were used, the very first dream tick would be both reconfiguring and running, and the "REM behaviour" would not match the second and subsequent ticks.
3. **Symmetry with the `instinctChemical` design.** The pair (`preInstinctChemicalNumber`, `instinctChemicalNumber`) reads cleanly as "warn, then process". The names map directly to the two engine enum slots. A modded brain catalogue can relocate either chemical independently while preserving the pair semantics.

### Lifecycle inside `SetWhetherToProcessInstincts(true)`

The complete sequence the engine executes when entering REM (mirrored in `Brain.js:459-489`):

```
SetWhetherToProcessInstincts(true):
   1. myInstinctsAreBeingProcessed = true
   2. chem[preInstinctChemicalNumber=212] = 1.0       ← Pre-REM rises
   3. chem[instinctChemicalNumber=213]    = 0.0
   4. UpdateComponents()                              ← brain tick with Pre-REM=1
       │
       │  Tract init rules reading chem[212] reconfigure for REM.
       │  In stock C3, the driv→comb tract sets its ST→LT rate to 1.0.
       │
       ▼
   5. chem[preInstinctChemicalNumber=212] = 0.0       ← Pre-REM falls
   6. chem[instinctChemicalNumber=213]    = 1.0       ← REM sleep rises
       │
       │  All subsequent UpdateComponents() calls (one per brain tick, called
       │  from Brain.update() while myInstinctsAreBeingProcessed is true) see
       │  chem[212]=0, chem[213]=1. The comb lobe takes its REM init-tail
       │  branch and its REM-mode update branch; the driv→comb tract's update
       │  rule applies full LT↔ST weight convergence.
       │
       │  The brain processes one queued instinct per tick (Brain.update() at
       │  Brain.js:347-371). Each instinct is a pre-stored stimulus pattern
       │  that gets driven into the brain so the day's "innate associations"
       │  become learned long-term weights.
       ▼
   (REM phase continues until LifeFaculty leaves DREAMING, which happens when
    the instinct queue empties and the help-knowledge-update phase finishes.)
```

When dreaming ends (`SetWhetherToProcessInstincts(false)`):

```
   1. myInstinctsAreBeingProcessed = false
   2. chem[preInstinctChemicalNumber=212] = 0.0
   3. chem[instinctChemicalNumber=213]    = 0.0
   4. (no extra UpdateComponents() call — normal Brain.update() resumes)
```

The exit transition is **silent**: both chemicals drop to zero in the same tick, no preflight pulse fires, no extra brain update runs. The post-REM tract behaviour is simply the default (awake-mode) branches reasserting themselves on the next regular update.

### The "REM sleep" name

The catalogue name `"REM sleep"` is chosen for player-facing fidelity to the *Creatures 3* "the Norn is dreaming" concept. The two terms are interchangeable in the C3 design:

- **"REM sleep"**: the user-facing label seen in `Assets/Catalogue/ChemicalNames.catalogue:293`, the Science Kit's chemistry display, debug consoles and the chemical-name lookup for any kit reading the bloodstream array.
- **"INSTINCT_CHEMICAL_NUMBER"**: the engine-internal label, defined as the index `0` of `Brain.catalogue`'s `"Brain Parameters"` array, resolving to chemical `213` (`Brain.catalogue`). Used by `Brain.setWhetherToProcessInstincts()` to look up which chemical slot to write.

Both labels point to the same slot. The catalogue is rewriteable: a modded `Brain.catalogue` could move `INSTINCT_CHEMICAL_NUMBER` to any other chemical index, and the engine would dutifully pulse that slot instead of 213. The genome's `comb` and `driv→comb` rules, however, are hard-coded to read slot 213 — so a relocation would require a coordinated genome update too. In practice no shipped *Creatures 3* package has done this, and slot 213 is the de-facto canonical REM-sleep index.

### Decay characteristics

REM sleep is registered with **halflives byte 255**, the maximum possible value, which `extract-biochemistry.js:265-278` maps to a half-life of `Math.pow(2.2, 255) ≈ 9.07 × 10¹⁰` ticks (`decayRate ≈ 1.0`, no measurable decay). The chemical therefore behaves as a **latched register**: any value written to it persists until something explicitly clears it.

This is significant because the brain's reset-to-zero in `SetWhetherToProcessInstincts(false)` is the **only** thing that ends the REM-mode SVRule branches. There is no biochemistry safety net that would naturally decay an out-of-band write away. The implications:

- A CAOS-injected `CHEM 213 1.0` on an awake Creature stays at 1.0 indefinitely. Every brain update will then see `chem[213] = 1.0` and run the REM-mode branches in `comb` and `driv→comb`, even though the Creature is not actually dreaming. The result is that long-term weights converge to short-term weights at the maximum rate, and the composer lobe stops its awake-mode decay — effectively the Creature "dreams while awake". This is the most powerful CAOS-driven brain manipulation in C3 and is occasionally used by experimental modders to force fast learning, at the cost of breaking the normal awake-mode decision making.
- A Creature whose LifeFaculty fails to call `setWhetherToProcessInstincts(false)` on REM exit (e.g. a JS port bug) would be left with `chem[213] = 1.0` indefinitely, with the same effect as the CAOS injection above.
- The engine's deferred-biochemistry recovery path (`Brain.js:108-111`) writes `chem[213] = 1.0` if a `DREA 1` was issued before biochemistry was wired up. This is correct because the deferred state is "we are dreaming now" — but it does highlight that the brain considers chem[213] = 1 the canonical "currently dreaming" mark, not just an ephemeral SVRule trigger.

### Producer / consumer chain summary

```
LifeFaculty.setState(DREAMING)                                       ← state machine trigger
        │
        ▼
LifeFaculty.js:255-258  →  creature.Brain().setWhetherToProcessInstincts(true)
        │
        ▼
Brain.js:469-481  →  myChemicalConcs[212] = 1.0 ; updateComponents() ; chem[212]=0 ; chem[213]=1.0
        │
        ▼
For every subsequent Brain.update() tick (REM steady state):
   tract.doUpdate()
        │
        ├─ comb lobe init rule (runInitRuleAlways) →
        │       IF_NON_ZERO CHEMICAL[213] → GOTO past awake-setup
        │
        ├─ comb lobe update rule →
        │       IF_NON_ZERO CHEMICAL[213] → use REM-mode tend value
        │
        └─ driv→comb tract update rule →
                IF_ZERO CHEMICAL[213] → (skipped during REM) →
                LT↔ST weight convergence at rate 1.0  ← THE consolidation step

Brain.update() also processes one queued instinct per tick during REM
(Brain.js:347-371). Each instinct is replayed into the brain as a stimulus
pattern, and the high LT↔ST convergence rate locks the resulting weight
changes into long-term memory.

When the instinct queue empties and the help-knowledge phase finishes:
   Brain.js sets myInstinctsAreBeingProcessed = false
   LifeFaculty exits DREAMING → setWhetherToProcessInstincts(false)
   chem[212] = 0, chem[213] = 0  → normal awake-mode branches resume
```

Every step in this chain is engine code. The genome appears only at the SVRule level — the lobe and tract init / update rules. REM sleep is never visible to the genome's reaction / receptor / emitter system.

### What REM sleep is *not*

A few clarifications, since the catalogue name and slot proximity invite confusion:

- **It is not a "sleep duration" or "sleep accumulation" chemical.** Sleepiness chemistry — the slow build-up that triggers sleep behaviourally — is carried by chemicals **154 ("Tiredness")** and **155 ("Sleepiness")**, with backing reactions at slots **138 ("Sleepiness backup")** and **129 ("Sleepase")** and the toxin pathway at slot **71 ("Sleep toxin")**. REM sleep is *downstream* of this entire system: it is raised only after sleep has begun and the LifeFaculty has transitioned into the DREAMING substate.
- **It is not a behavioural drive.** The drive lobe is fed by chemicals 199–203 (Up/Down/Exit/Enter/Wait). REM sleep does not appear in the `driv` lobe's neuron mappings.
- **It does not affect the LifeFaculty's sleep state.** The state machine writes the chemical; the chemical does not write the state. Setting `chem[213]` from CAOS does not push a Creature into DREAMING — only `setState(DREAMING)` does that. CAOS's `DREA 1` works because it calls `setWhetherToProcessInstincts(true)` directly, not because of the chemical write.
- **It is not produced by any organ.** Despite the bloodstream-chemical naming, no organ tissue emits REM sleep. The only writer is the brain itself, via direct pointer access to the chemicals array.
- **It is not the same as Pre-REM sleep (212).** They are paired but distinct: 212 is the one-tick configuration pulse; 213 is the steady REM-phase signal. A consumer reading 213 sees a sustained 1.0 for the whole REM phase; a consumer reading 212 sees a single positive tick at REM entry only.
- **It is not a "wake-up override".** Setting chem[213] from CAOS does not force a sleeping Norn to start dreaming — the LifeFaculty's instinct-processing code path is gated on `myInstinctsAreBeingProcessed` (set by the brain's flag), not on the chemical itself. The chemical is the *broadcast* of that state to the SVRule VM, not its source of truth.

### Practical consequences for gameplay

- **Stock players see REM sleep as a bell curve in the chemistry graph.** Unlike chemical 212 (which is too brief to register on the Science Kit's smoothed display), chemical 213 spends the full REM phase at 1.0. The kit's plot of the slot reads 0.0 for awake/non-dreaming time and 1.0 for the duration of each dream. This makes chemical 213 the **observable proxy** for "the Norn is currently dreaming".
- **A sleeping Norn that never enters REM never raises chemical 213.** If the LifeFaculty is held in ASLEEP without transitioning to DREAMING (e.g. by a CAOS script that pins the state, or by a defective involuntary action that fails to escalate), no REM consolidation occurs and the day's short-term learning never makes it into long-term memory in the `driv→comb` tract.
- **Modders can build "REM-only" tracts.** A new tract whose update rule is gated on chemical 213 will run its full logic only during dreaming. This is a clean way to add dream-only computation (e.g. a "rehearse what happened today" tract that only fires while the Norn is in REM) without polluting awake-mode brain ticks.
- **CAOS injection into chemical 213 is far more potent than into chemical 212.** Writing a non-zero value to chem[213] forces every subsequent brain update into REM-mode SVRule branches until something clears the slot. This causes immediate and dramatic weight changes in the `driv→comb` tract (the tract's long-term weights start chasing its short-term weights at full rate every tick) and disables the composer lobe's awake-mode decay. Because the slot is latched (halflives 255), this state persists indefinitely. Combined with `CHEM 213 0.0` to clear it, this is the standard CAOS technique for triggering on-demand brain consolidation outside the normal sleep cycle.
- **`DREA` CAOS commands route through the brain, not the chemical.** Although chemical 213 is the visible "we are dreaming" mark, the CAOS commands that toggle dreaming (`DREA 1` / `DREA 0`) call `Brain.setWhetherToProcessInstincts()` directly. The chemical write happens as a side effect of that call, ensuring the SVRule VM sees the correct value.
- **Save / load preserves the slot's value alongside every other chemical.** A save captured during REM (chem[213] = 1.0) will restore the chemical correctly. The brain's `myInstinctsAreBeingProcessed` flag is also serialised separately (`Brain.js:980-984`) so the post-load Creature resumes the dream from exactly the right point.

### JS port notes

The Rebuild port treats REM sleep as an ordinary bloodstream chemical for biochemistry purposes — there is no `CHEM_REM_SLEEP` constant, no special-case decay path. The non-trivial port concerns are:

1. **The brain's two-step write must remain atomic with respect to brain updates.** The engine's contract is that `updateComponents()` runs *exactly once* with `chem[212]=1, chem[213]=0` before the second write happens. A port that reorders these (e.g. by deferring `updateComponents()` to a subsequent macrotick, or by running it twice) breaks the dendrite-migration semantics and the `driv→comb` tract will either never see its init-rule alternate branch or will see it twice. The current JS port at `Brain.js:469-481` mirrors the engine's `Brain.setWhetherToProcessInstincts` step-for-step.
2. **The deferred-biochemistry path must write chem[213] = 1, not 0.** When `setWhetherToProcessInstincts(true)` is called before biochemistry is wired in, the port's `Brain.js:108-111` recovery path writes `chem[212] = 0, chem[213] = 1` on biochemistry registration — the **steady REM state**, not the preflight state. This is correct because there were no brain components to process the preflight pulse against, so writing it would be vacuous. The Creature comes online already in REM steady state and the very next brain update runs the REM-mode branches.
3. **Save / load must round-trip both `myInstinctsAreBeingProcessed` and the chemical value.** A save captured during REM steady state has chem[213] = 1.0 in the bloodstream array AND `myInstinctsAreBeingProcessed = true` in the brain object. A defective port that restores only the chemical would have a Creature whose chemicals say "dreaming" but whose `Brain.update()` runs the awake-mode branch (line 347 of `Brain.js`), stalling instinct processing. A defective port that restores only the flag would have the opposite problem. The current JS port serialises the flag explicitly at `Brain.js:980-984` and the chemicals array via the standard biochemistry save path.
4. **Catalogue lookup must succeed before the slot is reachable from CAOS by name.** The JS port loads `instinctChemicalNumber` and `preInstinctChemicalNumber` from `Brain.catalogue` at brain-construction time (`Brain.js:46`, `loadInstinctChemicalNumbersFromCatalogue()`). If the catalogue is not yet available the port falls back to the C3 defaults (213, 212), preserving the slot's identity. Tests should verify both paths.
5. **`checkInstinctChemicals()` is not the same as `myInstinctsAreBeingProcessed`.** The former (`Brain.js:156-164`) reads the live chemical concentration; the latter is the brain's internal flag. They are normally in lock-step but can diverge if CAOS writes the chemical directly. Code that needs to know "should the brain process an instinct this tick" should check the flag; code that needs to know "should SVRules take REM-mode branches" should read the chemical.

### Summary

```
   Stock C3 producers of chemical 213:    Brain.setWhetherToProcessInstincts(true) — engine only
   Stock C3 consumers of chemical 213:    comb lobe init rule (early-out)
                                          comb lobe update rule (tend-rate branch)
                                          driv→comb tract update rule (consolidation gate)
   Stock C3 initial concentration:        0
   Halflives byte (genomeValue):          255
   Effective half-life:                   ~9.07 × 10^10 ticks (no measurable decay; a latched register)
   Catalogue name:                        "REM sleep"
   Engine alias:                          INSTINCT_CHEMICAL_NUMBER (Brain Parameters slot 0 → 213)
   Position:                              Second slot of the sleep-chemistry pair (212/213); immediately
                                          above the brain-chemical placeholder block (198–211); paired
                                          with chemical 212 (Pre-REM sleep)
   Architectural role:                    Steady-state "we are dreaming" flag held at 1.0 for the full
                                          REM phase. Read by the comb lobe and the driv→comb tract's
                                          SVRule update rules to switch into REM-mode behaviour. The
                                          driv→comb tract uses the flag to gate its long-term-to-
                                          short-term weight convergence — the engine's mechanism for
                                          consolidating the day's short-term learning into long-term
                                          memory during dreams.
   Companion chemical:                    212 ("Pre-REM sleep") — the one-tick configuration pulse

   REM sleep is the engine's "all learning is long-term" flag:
     - Written only by Brain.setWhetherToProcessInstincts(true), held until REM exit
     - Read only by SVRule update rules in the comb lobe and driv→comb tract
     - In stock C3: gates full LT↔ST weight convergence in the drives-to-decision tract,
       turning each REM tick into a memory-consolidation step that locks the day's
       short-term Hebbian learning into the long-term decision-making policy
     - Held at 1.0 for the full REM phase; readable as the "is the Norn dreaming" indicator
     - Latched (halflives 255) — relies on the brain's explicit clearing write at REM exit,
       not on biochemistry decay, to return to zero
```

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:293` — the string `"REM sleep"` as the 213th entry in the chemical-names table
- `Brain.catalogue` — `ARRAY "Brain Parameters" 2` with values `"213"` (instinct) and `"212"` (pre-instinct)
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:36-46` — JS-port instinct-chemical-number initialisation with fallback defaults (213/212)
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:108-111` — deferred-biochemistry recovery path (writes chem[213]=1 if REM was requested before biochemistry was wired)
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:156-164` — `checkInstinctChemicals()`, REM-presence query
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:170-175` — `getInstinctChemicalLevel()`, raw concentration query
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:195-208` — `loadInstinctChemicalNumbersFromCatalogue()`
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:346-371` — `update()`, the JS port of the per-tick instinct-processing loop
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:459-489` — `setWhetherToProcessInstincts()` JS port of the engine producer
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:980-984` — REM-state save / restore path
- `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:254-264` — LifeFaculty hook that fires `setWhetherToProcessInstincts(true/false)` on entry/exit of the `DREAMING` state
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:402-404` — `IF_ZERO` / `IF_NON_ZERO` opcode semantics: skip next instruction if operand ≠ 0 (resp. = 0)
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json:1395-1412` — `comb` lobe init rule, top-of-rule REM gate (chem 213 IF_NON_ZERO → GOTO past awake setup)
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json:1610-1622` — `comb` lobe update rule, REM tend-rate branch
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json:5705-5836` — Tract 5 (`driv→comb`) update rule, the canonical consolidation site (chem 213 IF_ZERO gates LT↔ST convergence rate)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9224-9231` — half-lives table entry for chemical 213 (`genomeValue: 255`, `halfLifeInTicks: 90682980616`, `decayRate: 1`, `speed: "Very long"`)
- `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278` — `calculateHalfLife()` mapping for halflives byte 255
- `Rebuild/DOCUMENTATION/chemicals/212 - Pre-REM sleep.md` — the companion configuration-pulse chemical that fires for one tick immediately before REM begins
- `Rebuild/DOCUMENTATION/chemicals/154 - Tiredness.md` / `155 - Sleepiness.md` (if present) — the upstream sleep-accumulation chemistry that triggers the LifeFaculty's transition into ASLEEP / DREAMING
