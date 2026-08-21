# 212 - Pre-REM sleep

**Pre-REM sleep** (catalogue slot 212) is the **engine-level "preflight" signal** that the brain raises for *exactly one brain update* immediately before it switches into REM-dreaming / instinct-processing mode. It is one of two engine-reserved sleep chemicals — its companion is chemical **213 ("REM sleep")** — and the pair is wired into the engine's `Brain` constructor as the **`PREINSTINCT_CHEMICAL_NUMBER`** / **`INSTINCT_CHEMICAL_NUMBER`** parameters read from `Brain.catalogue`'s `"Brain Parameters"` array (slots `0` and `1`, values `213` and `212`). Unlike most chemicals, Pre-REM sleep is **not produced or consumed by the bloodstream biochemistry** — no `G_REACTION`, `G_RECEPTOR`, `G_EMITTER` or `G_STIMULUS` gene names it. Instead, the brain itself *writes* the chemical directly into `myChemicalConcs[212]` from engine code (`Brain.setWhetherToProcessInstincts()`), uses it as a one-shot trigger for SV-rule initialisation, and clears it again on the very next update.

The chemical's purpose is captured in the original engine comment:

> *"Prepare to process instincts. Firstly warn the brain by using a chemical signal, then update the brain once. This gives dendrites time to do any pre-instinct processing required."*

That single sentence is the entire semantics of the slot. Pre-REM sleep is the **dendrite-migration cue** that fires after a Norn falls asleep and just before the dreaming/REM phase begins — a one-tick window during which any tract whose init-rule reads `CHEMICAL_CODE[212]` can re-configure its short-term-to-long-term consolidation rate (or any other init-time parameter) to the values appropriate for the upcoming REM phase. The stock C3 brain uses this hook in exactly one place: the `driv→comb` tract's init rule at `brain-architecture.json:5588`. After the one-tick preflight, the brain clears chemical 212 and raises chemical 213 ("REM sleep") for the duration of the dream phase; when dreaming ends, both chemicals are cleared.

Pre-REM sleep is therefore a **transient, engine-managed neural signal** that lives entirely inside one brain tick. It has no concentration-curve dynamics, no half-life-driven decay path that the genome can rely on, and no producer/consumer pairing in the standard genome's reaction or emitter tables. Its lifecycle is bounded by the LifeFaculty state-machine transition into the `DREAMING` state and is invisible to any system that is not specifically polling for it via an SV-rule or `Brain.getPreInstinctChemicalLevel()`.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **Brain preflight write** (sole stock producer) | `Brain.setWhetherToProcessInstincts(true)` (JS port `Brain.js:473`) | Brain organ — direct write into the bloodstream chemicals array via `myPointerToChemicals[preInstinctChemicalNumber] = 1.0` | LifeFaculty enters `DREAMING` state → calls `Brain.setWhetherToProcessInstincts(true)` → sets `chem[212] = 1.0` and `chem[213] = 0.0`, runs `updateComponents()` once, then sets `chem[212] = 0.0` and `chem[213] = 1.0` | **One-shot pulse, one brain tick wide** |
| 2 | **Deferred biochemistry write** | `Brain.registerBiochemistry()` (`Brain.js:108-111`) | Brain organ | If `setWhetherToProcessInstincts(true)` is called *before* the biochemistry array is wired in (e.g. `DREA 1` on a freshly-spawned Norn), the brain remembers the pending state and writes `chem[212] = 0.0` / `chem[213] = 1.0` on the very next `registerBiochemistry()` call. Note: in this deferred path the preflight pulse on `chem[212]` is skipped — only the steady REM-active state is restored | One-shot, on biochemistry registration |
| 3 | **CAOS injection** (debug / modder use) | `CHEM 212 …`, `ALTR 212 …`, `ADMN 212 …` | Creature / bloodstream | Any CAOS script can write the slot directly via `Biochemistry.adjustChemicalLevel(212, amount)`. With halflives byte 255 (effectively no decay), an injected value persists for the Creature's lifetime unless explicitly cleared or overwritten by the brain's next REM transition | One-shot per injection, persistent thereafter |
| 4 | **Modder-defined producers** | New `G_STIMULUS`, `G_REACTION`, `G_EMITTER` or `G_RECEPTOR` genes added to a modded genome | Modder's choice of organ / tissue | The genome is free to add producers — for example, a stimulus gene that pulses chemical 212 directly when a sleep cycle begins. Any value written this way is overwritten by the next engine-driven `SetWhetherToProcessInstincts(true)` transition | Modder's choice |

There are **no `G_REACTION`, `G_EMITTER`, `G_RECEPTOR` or `G_STIMULUS` genes in the stock C3 genome that name chemical 212**. The `extract-biochemistry.js` scan reports zero genome-level producers — every stock pulse on this slot originates from the engine's brain code. Likewise there is **no `initialConcentrations` entry**: every Creature is born with chemical 212 = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **`driv→comb` tract init-rule gate** (sole stock consumer) | Tract 5 init rule, `brain-architecture.json:5573-5605` | Brain — drives lobe → composer/decision lobe | Init rule reads: `DO_SET_ST_TO_LT_RATE ONE_CODE[0]`; **`IF_ZERO CHEMICAL_CODE[212]`**; `DO_SET_ST_TO_LT_RATE VALUE_TENTH_CODE[8]` (= 0.0322); …rest of init… . Per `SVRule.js:402-404`, `IF_ZERO operand` skips the *next* line when `operand !== 0`. So when chemical 212 = 0 (the normal awake / non-preflight case), the second `DO_SET_ST_TO_LT_RATE` runs and the tract uses its lower consolidation rate; when chemical 212 = 1 (the one-tick preflight pulse), the second instruction is skipped and the rate stays at the default established by the prior `DO_SET_ST_TO_LT_RATE ONE_CODE` line | Re-tunes the **short-term → long-term Hebbian consolidation rate** of the drives-to-decision tract for the upcoming REM phase. Effectively: "switch this tract into long-term-learning mode for dreaming" |
| 2 | **`Brain.getPreInstinctChemicalLevel()` query** | `Brain.js:181-186` | Brain organ — read-only public API | Returns `myChemicalConcs[preInstinctChemicalNumber]` (i.e. `chem[212]`). Available to faculty code, debug consoles, and any caller that needs to detect the one-tick preflight window | Diagnostic / introspection only — the stock engine does not branch on this value outside the brain itself |
| 3 | **Modder-defined SV-rule consumers** | New tract `G_TRACT` genes whose init-rule or update-rule references `CHEMICAL_CODE[212]` | Brain — any tract or lobe | Any modded init rule can branch on chemical 212 the same way the stock `driv→comb` rule does — this is the engine's **public extension point** for "do something different on the dendrite-migration tick before REM begins" | Modder's choice. Useful for any tract that wants pre-REM-specific synaptic re-configuration without conflating the preflight tick with the steady REM phase signalled by chemical 213 |
| 4 | **Passive decay** (effectively none) | Halflives byte 212 = **255** | Bloodstream (systemic) | `genomeValue = 255` → `calculateHalfLife()` returns `halfLifeInTicks ≈ 9.07 × 10¹⁰` with `decayRate ≈ 1.0` (`extract-biochemistry.js:265-278`) | The chemical does not naturally decay back to zero on a meaningful timescale. The slot is reset to 0 by the brain's *explicit* second write, not by half-life decay. If the brain failed to clear the slot, an injected value would linger essentially forever |

There are no emitters reading chemical 212 from the bloodstream into a neuron lobe, no receptors converting it into a faculty input, and no reactions consuming it.

## Role in Game Mechanics

### The sleep / dreaming / instinct cycle

Pre-REM sleep is meaningful only inside the broader sleep state-machine that the LifeFaculty drives. The relevant LifeState transitions (`Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:254-264`) are:

```
ALERT          — Creature is awake; chem[212] = 0, chem[213] = 0
   │
   │  Sleepiness chemistry pushes the Creature into ASLEEP, then
   │  eventually into DREAMING (REM) via the involuntary action system.
   ▼
ASLEEP         — Creature is asleep but not dreaming yet; chem[212] = 0, chem[213] = 0
   │
   │  Brain.setWhetherToProcessInstincts(true) is called when the LifeFaculty
   │  state transitions into DREAMING.
   ▼
DREAMING       — REM phase / instinct processing
   ↑   ↑
   │   └─── (steady state during REM)         chem[212] = 0,  chem[213] = 1
   │
   └─────── (one-tick preflight at entry)     chem[212] = 1,  chem[213] = 0
                            │
                            │  Brain.updateComponents() runs once with the preflight
                            │  values. Tract init rules reading CHEMICAL_CODE[212] see
                            │  the pulse and re-configure themselves for REM.
                            │
                            ▼
                  Steady REM state for as long as the Creature stays in DREAMING:
                  chem[212] = 0, chem[213] = 1. The brain processes one queued
                  instinct per update; when the instinct queue is exhausted (or the
                  Creature wakes), the LifeFaculty exits DREAMING and the brain
                  calls SetWhetherToProcessInstincts(false), zeroing both slots.
```

The one-tick preflight is a **deliberate engineering separation** between the *transition* into REM and the *steady-state* of REM. It exists because tract init rules and tract update rules are separate code paths in the SVRule VM:

- **Init rules** run when a tract is first created and whenever `runInitRuleAlways` is set, on every update. They are the natural place to *configure* a tract — set learning rates, set thresholds, set initial dendrite weights.
- **Update rules** run every brain tick to process the actual signal flowing through the tract. They are the natural place to *use* the configured values.

The `driv→comb` tract uses chemical 212 in its **init rule** (to set the long-term consolidation rate) and chemical 213 in its **update rule** (to gate the actual learning step). This is why the chemicals must be raised in two separate ticks: the preflight tick re-runs the init rule with `chem[212]=1`, then the steady-state tick runs the update rule with `chem[213]=1`. Combining them into a single chemical (or a single tick) would conflate "configure for REM" with "process a REM update" and force the SVRule programmer to choose one or the other.

### The `driv→comb` tract's pre-REM gate

The exact init-rule sequence that consumes chemical 212 in the stock genome is, with paraphrased operands:

```
brain-architecture.json:5573-5605  (Tract 5: driv→comb init rule)

  DO_SET_ST_TO_LT_RATE  ONE_CODE                  ; default rate ≈ 1.0
  IF_ZERO  CHEMICAL_CODE[212]                     ; Pre-REM sleep
  DO_SET_ST_TO_LT_RATE  VALUE_TENTH_CODE[8]       ; 0.032258  (~1/30)
  IF_NON_ZERO  CHEMICAL_CODE[198]                 ; Brain chemical 1
  IF_ZERO_STOP  NEURON_CODE[2]
  IF_ZERO_STOP  NEURON_CODE[3]
  …
```

Reading this with `SVRule.js:402-404`'s definition of `IF_ZERO` (skip next instruction if operand ≠ 0):

- **Awake or asleep-but-not-yet-REM** (`chem[212] = 0`): the conditional matches, the next line runs, the consolidation rate is set to **0.032** — short-term learning is discouraged from leaking into long-term memory at any meaningful rate.
- **One-tick REM preflight** (`chem[212] = 1`): the conditional fails, the next line is skipped, the consolidation rate stays at **1.0** — short-term memories are converted to long-term memories at the maximum rate. Combined with the matching update-rule branch on chemical 213, this is the engine-level mechanism by which **REM dreaming consolidates the short-term learning of the day into permanent dendrite weights** in the drives-to-decision tract.

This is the canonical "REM sleep performs memory consolidation" model from the original *Creatures 3* design, expressed entirely in genome data with chemical 212 acting as the configuration-side trigger and chemical 213 as the activity-side trigger.

### Why a separate chemical from REM sleep

The natural question is "why not just use chemical 213 in both the init rule and the update rule?" The engine's design splits them for three reasons:

1. **Atomicity of the configuration step.** The preflight pulse forces `updateComponents()` to run *exactly once* with the alternative configuration before the steady REM state begins. If the same chemical were used, the configuration would slide into effect on the same tick that the first REM update runs — fine in principle, but it means the very first dream tick uses the same dendrite-migration logic as every subsequent one, with no "settle in" window.
2. **Decoupling of init-rule and update-rule conditions.** Some tracts may want to re-init themselves only at the boundary, not throughout REM (e.g. to fix a configuration value that should not drift across a long dream phase). Using chemical 212 as the boundary marker and chemical 213 as the steady-state marker lets a modded init rule fire exactly once per REM episode without having to count ticks.
3. **Symmetry with the `instinctChemical` design.** The pair (`preInstinctChemicalNumber`, `instinctChemicalNumber`) reads cleanly as "warn, then process". Collapsing them into a single chemical would force every consumer to know about the timing of the brain's update sequence, breaking the abstraction that the SVRule VM is designed to maintain.

### Lifecycle inside `SetWhetherToProcessInstincts(true)`

The complete sequence the engine executes when entering REM (mirrored in `Brain.js:459-489`):

```
SetWhetherToProcessInstincts(true):
   1. myInstinctsAreBeingProcessed = true
   2. chem[preInstinctChemicalNumber=212] = 1.0       ← Pre-REM rises
   3. chem[instinctChemicalNumber=213]    = 0.0
   4. UpdateComponents()                              ← brain tick with Pre-REM=1
       │
       │  Every tract that reads CHEMICAL_CODE[212] in its init rule sees the
       │  pulse. The driv→comb tract switches its ST→LT rate to 1.0 (full
       │  consolidation). Modded tracts can do whatever they were genome-coded
       │  to do.
       │
       ▼
   5. chem[preInstinctChemicalNumber=212] = 0.0       ← Pre-REM falls
   6. chem[instinctChemicalNumber=213]    = 1.0       ← REM sleep rises (steady)
       │
       │  All subsequent UpdateComponents() calls (one per brain tick, called
       │  from Brain.update() while myInstinctsAreBeingProcessed is true) see
       │  chem[212]=0, chem[213]=1. The drives-to-decision tract's UPDATE rule
       │  branches on chem[213] and lets long-term weight changes happen.
       │
       │  The brain processes one queued instinct per tick — see
       │  Brain.update() at Brain.js:347-371.
       ▼
   (REM phase continues until LifeFaculty leaves DREAMING)
```

When dreaming ends (`SetWhetherToProcessInstincts(false)`):

```
   1. myInstinctsAreBeingProcessed = false
   2. chem[preInstinctChemicalNumber=212] = 0.0
   3. chem[instinctChemicalNumber=213]    = 0.0
   4. (no extra UpdateComponents() call — normal Brain.update() resumes)
```

The engine **does not pulse Pre-REM at the end** of REM. The exit transition is silent on chemical 212 — both sleep chemicals simply drop to zero. This is intentional: the post-REM tract reconfiguration is not a discrete event but a return to the default (chem[212]=0, chem[213]=0) state, which is the state that init rules implicitly assume in their first conditional branch (`DO_SET_ST_TO_LT_RATE` to 0.032 in the `driv→comb` example).

### The "Pre-REM" name

The catalogue name `"Pre-REM sleep"` is descriptive rather than technical: it names the chemical *by the moment it is raised*, not by the brain-internal role (`PREINSTINCT_CHEMICAL_NUMBER`) it actually plays. The two terms are interchangeable in the C3 design:

- **"Pre-REM sleep"**: the user-facing label seen in `Assets/Catalogue/ChemicalNames.catalogue:292`, the Science Kit's chemistry display, debug consoles and the chemical-name lookup for any kit reading the bloodstream array.
- **"PREINSTINCT_CHEMICAL_NUMBER"**: the engine-internal label, defined as the index `0` of `Brain.catalogue`'s `"Brain Parameters"` array, resolving to chemical `212` (`Brain.catalogue`). Used by `Brain.setWhetherToProcessInstincts()` to look up which chemical slot to write.

Both labels point to the same slot. The catalogue is rewriteable: a modded `Brain.catalogue` could move `PREINSTINCT_CHEMICAL_NUMBER` to any other chemical index, and the engine would dutifully pulse that slot instead of 212. The genome's `driv→comb` init rule, however, is hard-coded to read slot 212 — so a relocation would require a coordinated genome update too. In practice no shipped *Creatures 3* package has done this, and slot 212 is the de-facto canonical Pre-REM index.

### Decay characteristics

Pre-REM sleep is registered with **halflives byte 255**, the maximum possible value, which `extract-biochemistry.js:265-278` maps to a half-life of `Math.pow(2.2, 255) ≈ 9.07 × 10¹⁰` ticks (`decayRate ≈ 1.0`, no measurable decay). The chemical therefore behaves as a **latched register**: any value written to it persists until something explicitly clears it.

This is significant because the brain's reset-to-zero in `SetWhetherToProcessInstincts` is the **only** thing keeping the pulse one-tick wide. There is no biochemistry safety net that would naturally decay an out-of-band write away. The implications:

- A CAOS-injected `CHEM 212 1.0` on an awake Creature stays at 1.0 until either the next REM transition (at which point the brain's logic explicitly clears it after one preflight tick) or another explicit write.
- A Creature that gets stuck partway through `SetWhetherToProcessInstincts(true)` (e.g. a JS port that throws between the two writes) would be left with `chem[212] = 1.0` indefinitely, causing every `driv→comb` init-rule re-execution to use the long-term consolidation rate. This is a real porting hazard and one of the reasons the JS port wraps the writes in a deferred-state safety check at `Brain.js:108-111`.
- Modders who add new chemical-212 producers should be aware that they are writing into a latched slot. If they want a transient pulse, they must add a matching clearing write on a subsequent tick, mimicking the engine's two-step pattern.

### Producer / consumer chain summary

```
LifeFaculty.setState(DREAMING)                                       ← state machine trigger
        │
        ▼
LifeFaculty.js:255-258  →  creature.Brain().setWhetherToProcessInstincts(true)
        │
        ▼
Brain.js:469-481  →  myChemicalConcs[212] = 1.0  ;  myChemicalConcs[213] = 0.0
        │
        ▼
Brain.js:475  →  updateComponents()
        │
        ▼
For every tract in brainComponents:
   tract.doUpdate()
        │
        ├─ if runInitRuleAlways → tract.runInitRule() → SVRule reads CHEMICAL_CODE[212]
        │       │
        │       ▼
        │  (driv→comb): switches ST→LT rate to 1.0 — consolidation enabled
        │
        └─ tract.runUpdateRule() → SVRule reads CHEMICAL_CODE[213] (still 0 here)
                ▼
           (driv→comb): no learning yet; this update is the dendrite-migration tick

Brain.js:478-479  →  myChemicalConcs[212] = 0.0  ;  myChemicalConcs[213] = 1.0
        │
        ▼
Subsequent Brain.update() calls (REM steady state):
   driv→comb update rule sees CHEMICAL_CODE[213] = 1 → applies long-term weight changes
```

Every step in this chain is engine code. The genome appears only at the SVRule level — the tract's init and update rules. Pre-REM sleep is never visible to the genome's reaction / receptor / emitter system.

### What Pre-REM sleep is *not*

A few clarifications, since the catalogue name and slot proximity invite confusion:

- **It is not a "sleep duration" or "sleep accumulation" chemical.** Sleepiness chemistry — the slow build-up that triggers sleep behaviourally — is carried by chemicals **154 ("Tiredness")** and **155 ("Sleepiness")**, with backing reactions at slots **138 ("Sleepiness backup")** and **129 ("Sleepase")** and the toxin pathway at slot **71 ("Sleep toxin")**. Pre-REM sleep is *downstream* of this entire system: it fires only after sleep has already begun and only at the boundary into REM.
- **It is not a behavioural drive.** The drive lobe is fed by chemicals 199–203 (Up/Down/Exit/Enter/Wait). Pre-REM does not appear in the `driv` lobe's neuron mappings.
- **It does not affect the LifeFaculty's sleep state.** The state machine writes the chemical; the chemical does not write the state. Setting `chem[212]` from CAOS does not push a Creature into DREAMING — only `setState(DREAMING)` does that.
- **It is not produced by any organ.** Despite the bloodstream-chemical naming, no organ tissue emits Pre-REM sleep. The only writer is the brain itself, via direct pointer access to the chemicals array.
- **It is not the same as REM sleep (213).** They are paired but distinct: 212 is the one-tick configuration pulse; 213 is the steady REM-phase signal. A consumer reading 212 sees a single positive tick at REM entry; a consumer reading 213 sees a sustained 1.0 for the whole REM phase.
- **It is not a kit-monitorable behavioural indicator.** The Science Kit's chemistry graph can plot it, but in practice the slot is at 0.0 for 99.9999% of the Creature's life — the one-tick pulse at REM entry is too brief to register on the smoothed graph display. To detect REM entry from a kit, watching chemical 213 is far more reliable than watching chemical 212.

### Practical consequences for gameplay

- **Stock players never see Pre-REM sleep.** A monitor pegged to chemical 212 reads 0.0 at all times the player can sample. The one-tick preflight is not visible at the kit's update rate.
- **A sleeping Norn that never enters REM never pulses Pre-REM.** If the Creature's instinct queue is empty *and* the LifeFaculty does not transition into DREAMING, no preflight ever fires. Brain consolidation simply does not occur. This is a subtle but real consequence: a Norn whose dreaming state is suppressed (e.g. by a CAOS script that pins the LifeFaculty to ASLEEP) loses the long-term memory consolidation that the `driv→comb` tract relies on.
- **Modders adding REM-sensitive tracts should hook chemical 212 for setup.** Anything that needs to "switch modes" for REM (changing learning rates, dendrite weights, threshold values) belongs in an init rule reading `CHEMICAL_CODE[212]`. The Pre-REM tick is the engine-supplied moment for this.
- **CAOS injection into chemical 212 is mostly inert.** Writing a non-zero value to chem[212] does nothing observable unless either (a) a tract init rule fires while the value is non-zero, or (b) the brain transitions into REM (in which case the brain's own write overwrites the injected value within one tick). This makes the slot a poor target for CAOS-driven mod tricks compared to its sibling chemical 213.
- **Save / load preserves the slot's value alongside every other chemical.** The slot is part of the bloodstream chemical array that is serialised by the standard creature save path. Because the typical saved value is 0.0 (the one-tick pulse is unlikely to be captured at exactly the right tick), the slot has effectively no save-state semantics beyond the general "every chemical is preserved" guarantee.

### JS port notes

The Rebuild port treats Pre-REM sleep as an ordinary bloodstream chemical for biochemistry purposes — there is no `CHEM_PRE_REM_SLEEP` constant, no special-case decay path. The non-trivial port concerns are:

1. **The brain's two-step write must be atomic with respect to brain updates.** The engine's contract is that `updateComponents()` runs *exactly once* with `chem[212]=1, chem[213]=0` before the second write happens. A port that reorders these (e.g. by deferring `updateComponents()` to a subsequent macrotick) breaks the dendrite-migration semantics and the `driv→comb` tract will never see its init-rule alternate branch. The current JS port at `Brain.js:469-481` mirrors the engine's `Brain.setWhetherToProcessInstincts` step-for-step.
2. **The deferred-biochemistry path skips the preflight.** When `setWhetherToProcessInstincts(true)` is called before biochemistry is wired in (e.g. `DREA 1` on a freshly-spawned Norn pre-gene-expression), the JS port's `Brain.js:108-111` recovery path writes only the *steady REM* state (`chem[212]=0, chem[213]=1`) and skips the preflight tick. This is a deliberate compromise: there is no `updateComponents()` to run yet because the brain has no components, so the preflight pulse would be vacuous. A port that also writes the pulse here would leave the slot latched at 1.0 (because there is no second write following it), breaking the chemical 212 invariant.
3. **The catalogue lookup must succeed before the slot is reachable from CAOS by name.** The JS port loads `instinctChemicalNumber` and `preInstinctChemicalNumber` from `Brain.catalogue` at brain-construction time (`Brain.js:46`, `loadInstinctChemicalNumbersFromCatalogue()`). If the catalogue is not yet available the port falls back to the C3 defaults (213, 212), preserving the slot's identity. Tests should verify both paths.
4. **The sleep-chemistry boundary at slot 211/212 is a frequent off-by-one site.** Brain chemical 14 (slot 211) is immediately below Pre-REM. A loop iterating "all brain-chemical placeholders" or "all sleep chemicals" must be careful about the boundary: the placeholders end at 211, the sleep chemicals start at 212. See `211 - Brain chemical 14.md` for the canary-slot strategy.
5. **Serialisation must round-trip the value.** Although the typical saved value is 0.0, a save captured exactly during the preflight tick would store 1.0. The standard chemical-array serialisation path handles this correctly; no special-case is needed.

### Summary

```
   Stock C3 producers of chemical 212:    Brain.setWhetherToProcessInstincts(true) — engine only
   Stock C3 consumers of chemical 212:    Tract 5 (driv→comb) init rule — sole consumer
   Stock C3 initial concentration:        0
   Halflives byte (genomeValue):          255
   Effective half-life:                   ~9.07 × 10^10 ticks (no measurable decay; a latched register)
   Catalogue name:                        "Pre-REM sleep"
   Engine alias:                          PREINSTINCT_CHEMICAL_NUMBER (Brain Parameters slot 0 → 212)
   Position:                              First slot of the sleep-chemistry pair (212/213); immediately
                                          above the brain-chemical placeholder block (198–211)
   Architectural role:                    One-tick "warn the brain" pulse fired immediately before the
                                          REM/instinct-processing phase begins. The brain raises it,
                                          runs UpdateComponents() exactly once so tract init rules can
                                          re-configure for REM, then clears it and raises chemical 213
                                          for the steady REM phase.
   Companion chemical:                    213 ("REM sleep") — the steady REM-phase signal

   Pre-REM sleep is the engine's dendrite-migration cue:
     - Written only by Brain.setWhetherToProcessInstincts(true), in two atomic steps
     - Read only by SVRule init rules looking for the REM-entry boundary
     - In stock C3: switches the driv→comb tract's short-term-to-long-term consolidation
       rate to 1.0 for the duration of the preflight tick, enabling memory consolidation
       during the upcoming REM dream phase
     - Should always read 0.0 in any sample taken outside the one-tick preflight window
     - Latched (halflives 255) — relies on the brain's explicit clearing write, not on
       biochemistry decay, to return to zero
```

## Key Source References

- `Assets/Catalogue/ChemicalNames.catalogue:292` — the string `"Pre-REM sleep"` as the 212th entry in the chemical-names table
- `Brain.catalogue` — `ARRAY "Brain Parameters" 2` with values `"213"` (instinct) and `"212"` (pre-instinct)
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:36-46` — JS-port instinct-chemical-number initialisation with fallback defaults
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:181-186` — `getPreInstinctChemicalLevel()` query
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:195-208` — `loadInstinctChemicalNumbersFromCatalogue()`
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:459-489` — `setWhetherToProcessInstincts()` JS port of the engine producer
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:108-111` — deferred-biochemistry recovery path
- `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:254-264` — LifeFaculty hook that fires `setWhetherToProcessInstincts(true/false)` on entry/exit of the `DREAMING` state
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:402-404` — `IF_ZERO` opcode semantics: skip next instruction if operand ≠ 0
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json:5556-5605` — Tract 5 (`driv→comb`) init rule, the sole stock consumer of chemical 212
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json:5800` — Tract 5 update rule, gating on chemical 213 (REM sleep) — the companion consumer
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9216-9223` — half-lives table entry for chemical 212 (`genomeValue: 255`, `halfLifeInTicks: 90682980616`, `decayRate: 1`, `speed: "Very long"`)
- `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278` — `calculateHalfLife()` mapping for halflives byte 255
- `Rebuild/DOCUMENTATION/chemicals/211 - Brain chemical 14.md` — the placeholder slot immediately below Pre-REM, useful as a boundary canary
- `Rebuild/DOCUMENTATION/chemicals/154 - Tiredness.md` / `155 - Sleepiness.md` (if present) — the upstream sleep-accumulation chemistry that triggers the LifeFaculty's transition into ASLEEP / DREAMING
