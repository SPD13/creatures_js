# 206 - Brain chemical 9

**Brain chemical 9** is the final entry in the contiguous nine-chemical "brain chemistry block" (`Assets/Catalogue/ChemicalNames.catalogue:284`) that Steve Grand reserved as a private bus between the biochemistry simulation and the neural network. The block runs from chemical **198** ("Brain chemical 1") through **206** ("Brain chemical 9"), with the seven middle slots (199–205) carrying functional aliases — the five navigation drives **Up / Down / Exit / Enter / Wait** and the two reinforcement signals **Reward** and **Punishment**. Chemical 206 is the closing bookend of the block: like its sibling chemical 198, it keeps the generic `"Brain chemical N"` name rather than carrying a functional alias, and unlike chemical 198 it has **no producer and no consumer in the stock C3 genome at all**.

Chemical 206 is, in the shipping game, **a genuinely unused reservation**. It is not consumed by any tract init rule, not written by any stimulus gene, not emitted by any receptor or organ, not produced by any reaction, not used as the reward or punishment chemical for any tract, and not given an initial concentration. Every Creature is born with chemical 206 = 0, every Creature dies with chemical 206 = 0, and at no point in normal play does any value other than 0 enter the slot. The chemical is wired into the catalogue and into the half-lives table — and that is everything the stock genome does with it.

What makes chemical 206 architecturally interesting is the *shape* of that reservation. The chemical's halflives byte is set to **255**, the maximum possible value, which the original engine's biochemistry tick (`Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:269-278`) maps to a half-life of **2.2^255 ≈ 9.07 × 10¹⁰ ticks** with a decay rate of **1.0** (i.e. no measurable decay). In direct contrast to chemical 198 ("Brain chemical 1"), whose halflives byte of **0** means *instant decay* and produces a one-tick-wide impulse, chemical 206's halflives byte of **255** means *no decay* and produces a level that, once pulsed, persists effectively forever for the lifetime of the Creature. The two bookend slots of the brain-chemical block are therefore deliberately complementary templates: 198 is "the per-tick boolean gate" and 206 is "the latched permanent flag". A modder choosing between them is choosing between transient signalling and persistent state.

There is no engine-level constant, no `CHEM_BRAIN_CHEMICAL_9`, no `CHEM_BRAIN_RESERVED`, and no dedicated faculty for chemical 206. The slot is data-driven entirely through the genome and the generic `Biochemistry → Brain.registerBiochemistry → SVRule.CHEMICAL_CODE` plumbing that every chemical uses. Its sole purpose in the stock game is to be available — a clearly-labelled, pre-allocated, modder-friendly expansion slot inside the brain-chemical bus that has been kept intentionally clean of stock dependencies.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **None in the stock genome** | — | — | No `G_STIMULUS` gene lists chemical 206 in its `chemicalsToAdjust[4]` slots. No `G_REACTION` gene names chemical 206 as a product. No `G_RECEPTOR` or `G_EMITTER` gene targets chemical 206. The `extract-biochemistry.js` scan of the stock genome reports zero producers for this slot | — |
| 2 | **Direct CAOS injection** | `CHEM 206 …`, `ALTR`, `ADMN`, debug consoles, modder agents | Creature / bloodstream (systemic) — written via `Biochemistry.adjustChemicalLevel(206, amount)` | Any CAOS script, debug toy, or modded gene can write chemical 206 directly. Because the half-life is effectively infinite, an injected value persists for the rest of the Creature's life unless explicitly cleared | One-shot per injection, but persistent thereafter |
| 3 | **Modder-defined producers** (template) | New `G_STIMULUS`, `G_REACTION`, `G_EMITTER`, or `G_RECEPTOR` genes added to a modded genome | Whatever organ / tissue / locus the modder chooses | The chemical 206 slot is reserved precisely so modders can populate it. The recommended template is the same one chemical 198 follows for transient pulses — `G_STIMULUS` with a chemical-206 entry in `chemicalsToAdjust[4]` — except that 206 is also suitable for *permanent* state because of its 255 halflives byte | Modder's choice |

There are no reactions that produce chemical 206, no emitters listed in the genome's emitters table, and no engine code paths that write to it outside the generic `adjustChemicalLevel` plumbing. Because the half-life is the maximum value (255), any pulse that does enter the slot stays there essentially forever — a single CAOS `CHEM 206 100` would leave that level present for the Creature's entire ageing curve.

Chemical 206 has no `initialConcentrations` entry — every Creature is born with Brain chemical 9 = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **None in the stock genome** | — | — | No tract init rule reads `CHEMICAL_CODE[206]`. No SVRule in `brain-architecture.json` references the slot. No tract has 206 registered as its reward or punishment chemical via opcodes 59 / 62 (`SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`, `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`). No faculty (Sensory, Motor, Life, Linguistic, Reproductive, Drive) reads it. The chemical is not consumed by any code path the engine ships with | — |
| 2 | **Readable via the Biochemistry faculty** | `Biochemistry::GetChemical(206)` | Creature / bloodstream (systemic) | Chemical 206 is an ordinary bloodstream slot. Kits, debug views, the Science Kit chemistry graphs, and CAOS scripts can all read it as `"Brain chemical 9"` from the chemical-name catalogue | Useful for debugging modded systems that have repurposed the slot, and for verifying that no stock pathway is silently raising it (it should always read zero in unmodded play) |
| 3 | **Passive decay** (effectively none) | Halflives byte 206 = **255** | Bloodstream (systemic) | `genomeValue = 255` → `calculateHalfLife()` returns `halfLifeInTicks = Math.pow(2.2, 255) ≈ 9.07 × 10¹⁰ ticks` with `decayRate ≈ 1.0` (`DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278`). The chemical is multiplied by ~1 every biochem tick | An injected value persists for the Creature's lifetime. There is no measurable exponential-decay curve. The slot acts as a latching register rather than a transient signal |

There are no reactions, no receptors, no emitters writing into it, and no consumers in the stock genome.

## Role in Game Mechanics

### The "expansion slot" architecture

The brain-chemical block 198–206 was carved out of the chemistry namespace specifically to give the genome a private bus into the brain. Steve Grand's design splits the nine slots into three categories:

```
198 (Brain chemical 1)   ← bookend / general-purpose pulse gate
199 (Up)
200 (Down)
201 (Exit)               ← five navigation drives, populated by SensoryFaculty.updateDriveLobe
202 (Enter)
203 (Wait)
204 (Reward)             ← reinforcement magnitude, read by Tract.processRewardAndPunishment
205 (Punishment)
206 (Brain chemical 9)   ← bookend / general-purpose latched flag
```

The seven middle slots are claimed by the engine's stock systems and cannot be repurposed without rewiring the navigation lobe or the reinforcement plumbing. The two bookends — 198 and 206 — are the *only* chemicals in the entire 256-slot chemistry namespace that are simultaneously (a) inside the brain bus, (b) catalogued with a generic name suggesting they are reserved, and (c) not used by any stock genome rule. They are the architectural escape hatches.

The choice of half-lives makes the two bookends complementary rather than redundant:

| Slot | Halflives byte | Effective behaviour | Modder use case |
|---|---|---|---|
| 198 (Brain chemical 1) | 0 | Instant decay — pulse is exactly 1 tick wide | Per-tick boolean gates, like the `STIM_DISAPPOINT → driv→comb` blame-assignment switch in stock C3 |
| 206 (Brain chemical 9) | 255 | No decay — once raised, stays raised | Latched permanent flags: lifetime achievements, irreversible state changes, milestone markers |

Chemical 198 is in active use by the stock genome; chemical 206 is **the blank instance of the same template**, waiting to be populated by a community mod or a downstream genome.

### What it would *do* if used

Although chemical 206 is inert in the shipping game, the engine plumbing around it is fully live, and a modder can drop it into any of the standard chemical roles by adding the appropriate genome genes:

1. **As a tract init-rule gate.** A modded init rule with `IF_NON_ZERO CHEMICAL_CODE[206]` followed by an `IF_ZERO_STOP` branch behaves identically to the chemical-198 gate at `brain-architecture.json:5604`, except that the gate latches: once chemical 206 is raised, the gate stays open for the rest of the Creature's life. This is suitable for permanent learning-mode switches — for example, a "this Creature has been imprinted on its keeper" flag that, once set, permanently changes how the `driv→comb` tract processes reinforcement.
2. **As a per-tract reward or punishment chemical.** The opcodes `SET_REWARD_CHEMICAL_INDEX` (59) and `SET_PUNISHMENT_CHEMICAL_INDEX` (62) take a chemical index and route a tract's Hebbian reinforcement through the named chemical. Setting either to 206 would mean the tract's STW updates depend on the latched value, producing learning that is dialled up or down for the Creature's lifetime by a single pulse.
3. **As a milestone tracker for stimulus genes.** A `G_STIMULUS` gene firing on an event the modder considers life-changing — a first kiss, a parent's death, a successful escape — can pulse chemical 206 in its `chemicalsToAdjust[4]` slots. The lack of decay means the pulse becomes a permanent biographical marker, queryable from CAOS via `CHEM 206` for any agent that wants to react differently to "Norns who have ever experienced X."
4. **As a chemical-driven emitter.** A modded `G_EMITTER` gene reading chemical 206 from the bloodstream and writing into a neuron lobe gives the brain a persistent input proportional to the latched level. This is the cleanest way to convert "Creature has experienced X" into "Creature has X-flavoured neural activity for life" without burning a non-brain-bus chemical slot.

In every case, the architectural appeal of using 206 over an arbitrary unused chemical (e.g. chemicals 1–7, the catalogue's "1" through "7" placeholders) is that 206 sits *inside the brain-chemical bus* — same `myChemicalConcs` array, same `pointerToChemicals` reference held by every lobe and tract, same SVRule operand path. SVRules can read it with `CHEMICAL_CODE[206]` exactly as they read 198, 204, or 205, with no special bus translation. Chemicals outside the brain block (e.g. the metabolic chemicals 1–95 or the stress chemicals 187–195) are equally readable from SVRules in principle, but the brain-block clustering is what signals architectural intent: *this slot is designed to carry brain-relevant signals.*

### Why it was left empty

The historical reason chemical 206 ships unused was never documented, but the structural pattern is clear from comparing it to chemical 198. The genome team filled exactly enough of the block to ship the navigation drives, Reward, Punishment, and the disappointment gate. The two end-slots were left as labelled gaps:

- **Chemical 198** is the *demonstration* of how the block can be extended — a single working example showing the `G_STIMULUS → chemicalsToAdjust → SVRule.IF_NON_ZERO CHEMICAL_CODE` pipeline in action.
- **Chemical 206** is the *invitation* — a clean slot with the same plumbing in place, ready for the next gate, latched flag, or per-tract reward chemical that a community modder or future expansion wants to add.

Leaving the slot at halflives byte 255 (rather than 0) was a deliberate choice: it ensures that whatever a modder writes there, the value will be retained across ticks. This makes the slot useful out of the box for state-tracking applications without requiring the modder to also add a halflives gene mutation. The matching pair of bookends (one transient, one persistent) covers both common modding use cases without any genome edit beyond adding the producer / consumer genes themselves.

### Producer and consumer chains

Both the producer and consumer chains for chemical 206 are *exactly the same plumbing* as for chemical 198, with the only difference being which genes are populated. There is no special path:

```
(modded) STIM_X stimulus event
                 │
        SensoryFaculty.stimulate()
                 │
   StimulusLibrary.getStimulus(STIM_X)
                 │
   chemicalsToAdjust[4] contains (206, +pulse)
                 │
                 ▼
  Biochemistry: myChemicalConcs[206] += pulse
                 │
                 ▼ (every brain tick from now until death)
  Brain: any tract or lobe whose SVRule reads
         CHEMICAL_CODE[206] sees the latched value
                 │
                 ▼ (biochem tick)
  Biochemistry: myChemicalConcs[206] *= ~1.0  ← no measurable decay
```

Because the plumbing is shared with the rest of the brain-chemical block, all of the correctness requirements that apply to chemical 198 (live `myChemicalConcs` reference, `pointerToChemicals` propagation through `Brain.registerBiochemistry`, `runInitRuleAlways` semantics on the consuming tract) apply identically to chemical 206. A correctly-ported brain that handles 198 will handle 206 with no additional engine work — the only thing missing is the genome-level wiring that names the slot in some gene's data block.

### What Brain chemical 9 is *not*

A few clarifications, given the chemical's anonymous catalogue name:

- **It is not the ninth navigation drive or a hidden drive.** Despite being literally the ninth slot in the brain-chemistry block, chemical 206 is not read by `SensoryFaculty.updateDriveLobe()`, which only knows about chemicals 199–203 (Up, Down, Exit, Enter, Wait) and the legacy drive chemicals 148–162. There is no `driv` lobe neuron 24 that maps to chemical 206.
- **It is not a hidden Reward or Punishment.** The per-tract reinforcement system (`Tract.processRewardAndPunishment()`, `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`) reads only the chemicals registered via `SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`, which in the stock genome are always 204 and 205 respectively. Chemical 206 is not registered as a default reward or punishment chemical for any stock tract.
- **It is not an aging or generation marker.** The `LifeFaculty` ages a creature based on the dedicated age chemicals (Embryonic, Child, Adolescent, Youth, Adult, Old, Senile) at chemicals 96–102 in the chemistry block — not chemical 206. There is no mechanism in the stock engine that ticks chemical 206 up over time.
- **It is not used by debug or save infrastructure.** The save/load PRAY pipeline serialises all 256 chemical slots uniformly via `Biochemistry::Read` / `Biochemistry::Write`. Chemical 206 is saved like any other chemical, but no save format flag, world variable, or debug command treats it specially.
- **It is not "always 255".** The `255` figure is the *halflives byte*, which controls decay rate, not the chemical's value. The chemical's actual concentration starts at 0 and remains at 0 unless something pulses it.

### Modding affordances

Chemical 206's reserved-slot status makes it the cleanest target for modders adding new brain-relevant chemistry:

- **Adding a permanent learning-mode flag.** A modded `G_STIMULUS` gene can pulse chemical 206 once on a defining life event; a modded tract init rule can then permanently alter its dendrite eligibility, learning rate, or activation threshold by reading `CHEMICAL_CODE[206]`. Because the half-life is effectively infinite, the flag never needs refreshing.
- **Adding a second disappointment-style gate.** A modder wanting two independent gate chemicals — for example, "physical failure" and "social failure" — can leave chemical 198 wired to the existing `STIM_DISAPPOINT` and add a new `STIM_REJECTED_BY_PEER` (or similar) that pulses chemical 206 instead. Different tracts then read different gates without sharing state.
- **Adding a chemical-driven irreversible state change.** Pulsing chemical 206 to mark a Creature as "has reproduced", "has been bitten by a Grendel", or "has tasted Detritus" gives every other system in the bloodstream a permanent, queryable record. Receptors, emitters, reactions, and even non-brain SVRules can all read the latched value.
- **Combining 198 and 206 for a two-tier gate.** A tract init rule can use chemical 198 as a "this tick" gate and chemical 206 as a "this lifetime" gate, allowing learning patterns that are conditional on both an immediate event *and* a permanent biographical fact. This is the maximum-resolution use of the two bookend slots and would be hard to replicate without burning two non-bus chemical slots and two halflives genes.

The cost of using chemical 206 over an unused non-brain chemical (e.g. chemical 1, "Lactate"-adjacent slots, or the `196` / `197` placeholders just before the brain block) is essentially zero: the slot has a clean catalogue name, no risk of conflicting with an existing system, and natively lives on the brain bus. The benefit is that future C3 community work converges on a small set of well-known modder slots rather than every mod inventing its own chemistry namespace.

### Practical consequences for gameplay

- **Vanilla play never raises chemical 206.** A Norn, Grendel, or Ettin running purely from the stock genome will read 0 from chemical 206 for its entire life. Anyone observing a non-zero value in a Kit or debug view is looking at either an injected CAOS pulse, a modded stimulus gene firing, or an engine-level bug.
- **Chemical 206 is a clean diagnostic baseline.** Because the stock value is invariably zero, the slot is a useful canary for Kit and debug-graph testing: any chemistry-graph rendering that shows chemical 206 with non-zero value during stock play indicates either a mistuned plotting offset or an unintended cross-write into the slot. The Science Kit's chemistry display can use chemical 206 as a "this should always read flat zero" sanity check.
- **CAOS injection produces persistent state.** `CHEM 206 100` on a creature will, with no further intervention, leave that creature with Brain chemical 9 ≈ 100 for its remaining lifetime (modulo the negligible decay from the 255-byte half-life). This makes the slot suitable for test fixtures that need to set a permanent flag — "this creature was injected with substance X" — and observe long-term consequences without re-injection.
- **No stock consumers means no stock side-effects.** Because no SVRule reads chemical 206, an injected pulse does not cause any change in brain behaviour by itself. A modder must explicitly add a consumer (tract init rule, reward/punishment chemical, receptor, etc.) for the pulse to do anything observable. This is the inverse of the chemical 198 case, where injecting a pulse immediately changes `driv→comb` learning the very next tick.

### JS port notes

The Rebuild port treats chemical 206 as an ordinary bloodstream chemical — there is no `CHEM_BRAIN_CHEMICAL_9` constant, no special-case path, no engine-level handling. Two correctness requirements specifically apply:

- **The half-life calculation must round genomeValue 255 correctly.** `DOCUMENTATION/CreaturesData/extract-biochemistry.js:269` computes `halfLifeInTicks = Math.pow(2.2, inputFloat)`, where `inputFloat` is derived from the byte value 255. The result (~9.07 × 10¹⁰ ticks) is well beyond the typical Creature lifespan, but the *decay rate* (`Math.pow(0.5, 1.0/halfLifeInTicks)`) must still evaluate as a finite double very close to 1.0. A naive port that special-cases byte 255 to "infinite half-life, multiply by 1.0 exactly" is fine; a port that overflows or returns NaN for that calculation will silently reset chemical 206 every tick, breaking modded systems that depend on its persistence.
- **The chemical must propagate through `Brain.registerBiochemistry` like any other.** Even though the stock genome has no consumer, modded genomes will. `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:86` distributes the live chemical-array reference to every lobe and tract. The same plumbing that makes chemical 198 readable from `driv→comb` makes chemical 206 readable from any future tract init rule. Asserting this at runtime — for example, by writing a modded SVRule that reads `CHEMICAL_CODE[206]` and verifying the pulse arrives — is a useful port-validation check.

The port has no obligation to populate chemical 206, fire any stock event into it, or treat it differently from chemicals 207 ("Brain chemical 10") through 211 ("Brain chemical 14"), which are similarly named placeholders elsewhere in the catalogue but lie *outside* the dedicated brain-chemical bus block. Chemical 206's significance is purely architectural: it is the closing bookend of the brain bus and the natural first choice for any modder adding new brain-relevant chemistry.

### Summary

```
   Stock C3 producers of chemical 206:    NONE
   Stock C3 consumers of chemical 206:    NONE
   Stock C3 initial concentration:        0
   Halflives byte (genomeValue):          255
   Effective half-life:                   ~9.07 × 10^10 ticks (no measurable decay)
   Catalogue name:                        "Brain chemical 9"
   Position in brain-chemical block:      9 of 9 (closing bookend, mirrors chemical 198)
   Architectural role:                    Reserved expansion slot — latched flag template
   Complementary slot:                    Chemical 198 (transient pulse template, halflives = 0)

   Brain chemical 9 is the empty-by-design counterpart to Brain chemical 1:
     - Same brain bus, same SVRule plumbing, same Biochemistry path
     - Halflives byte deliberately set to 255 → values latch indefinitely
     - Sole purpose: provide a clean expansion slot for modders adding
       new brain-relevant chemistry, especially permanent state flags
       and life-event markers
     - Should always read zero in unmodded play (useful as a Kit / debug baseline)
     - Together with chemical 198, the two bookends cover both
       transient-pulse and latched-flag use cases without any genome
       edits beyond adding the producer / consumer genes themselves
```

## Key Source References

- `Assets/Catalogue/ChemicalNames.catalogue:284` — the string `"Brain chemical 9"` as the 206th entry in the chemical-names table
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9169-9175` — the half-lives table entry showing `chemical: 206`, `genomeValue: 255`, `halfLifeInTicks: 90682980616`, `decayRate: 1`, `speed: "Very long"`
- `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278` — `calculateHalfLife()` showing how the 255-byte halflives value maps to an effectively-infinite half-life
- `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:460-478` — the genome-extraction loop that produces the half-lives table; chemical 206 appears with `genomeValue=255` while chemicals like 198 are omitted because their value is 0 (instant decay)
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json` — searched for any reference to chemical 206; **none found**, confirming the slot has no stock consumer in the brain
- `Rebuild/DOCUMENTATION/chemicals/198 - Brain chemical 1.md` — the sibling bookend doc that establishes the brain-chemical-block pattern and explicitly identifies chemical 206 as the reserved expansion slot
- `Rebuild/DOCUMENTATION/articles/game-systems/brain-chemicals.md` — the deep-dive article on the entire 198–206 brain-chemical block, with discussion of the two bookend slots' complementary half-life templates
- `Rebuild/Main_Game/src/engine/creature/biochemistry/Biochemistry.js:202` — `getChemicalConcs()` returns the live reference to `myChemicalConcs` that any future modded SVRule reading chemical 206 would use
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:86` — `registerBiochemistry()` distributes the chemical-array reference to every lobe and tract; chemical 206 is reachable from any SVRule via this path
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668` — `CHEMICAL_CODE` operand handler reads `pointerToChemicals[arrayIndex % 256]`; the path through which chemical 206 would reach any modded init rule
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531` — `processRewardAndPunishment()`, the generic reinforcement system that reads chemicals registered via opcodes 59 / 62; chemical 206 is *not* registered for any stock tract but is a valid candidate for a modded one
- `Rebuild/DOCUMENTATION/chemicals/204 - Reward.md` and `205 - Punishment.md` — sibling reinforcement-chemical docs that describe the opcodes 59 / 62 pathway chemical 206 would use if registered
