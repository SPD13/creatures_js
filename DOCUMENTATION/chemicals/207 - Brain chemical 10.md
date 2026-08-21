# 207 - Brain chemical 10

**Brain chemical 10** is the first slot of the secondary "extended brain chemicals" placeholder block (`Assets/Catalogue/ChemicalNames.catalogue:285`) that the genome reserves immediately after the curated 198–206 brain-chemical bus. The extended block runs from chemical **207** ("Brain chemical 10") through chemical **211** ("Brain chemical 14") and is bounded above by the sleep chemistry pair at slots 212 ("Pre-REM sleep") and 213 ("REM sleep"). Where the 198–206 block carries seven functionally-aliased chemicals (the navigation drives **Up / Down / Exit / Enter / Wait** and the reinforcement signals **Reward / Punishment**) flanked by the two generic bookends **Brain chemical 1** and **Brain chemical 9**, the 207–211 block is *all generic placeholder*: every slot in it carries the anonymous `"Brain chemical N"` catalogue label and **none of them have a producer or consumer in the stock C3 genome**.

Chemical 207 is, like its siblings 208–211 and the closing bookend 206, a **genuinely unused reservation**. It is not consumed by any tract init rule, not written by any stimulus gene, not emitted by any receptor or organ, not produced by any reaction, not used as the reward or punishment chemical for any tract, and not given an initial concentration. Every Creature is born with chemical 207 = 0, every Creature dies with chemical 207 = 0, and at no point in normal play does any value other than 0 enter the slot. The chemical is wired into the catalogue and into the half-lives table — and that is everything the stock genome does with it.

The shape of the reservation is identical to chemical 206's: the halflives byte is set to **255**, the maximum possible value, which the original engine's biochemistry tick (`Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:269-278`) maps to a half-life of **2.2^255 ≈ 9.07 × 10¹⁰ ticks** with a decay rate of **1.0** (i.e. no measurable decay). Any pulse that does enter the slot stays there essentially forever — chemical 207 is therefore a **latched permanent flag** template, not a transient signalling channel. In the chemistry namespace's two-tier expansion design, slot 207 is the second of *six* such latched-flag placeholders (along with 206, 208, 209, 210, and 211); chemical 198 is the only "instant decay" pulse template. Modders adding latched state have a wide choice of where to put it; modders adding transient pulses have to either fall back to 198 or accept the cost of also tweaking a halflives gene.

There is no engine-level constant, no `CHEM_BRAIN_CHEMICAL_10`, no dedicated faculty for chemical 207. The slot is data-driven entirely through the genome and the generic `Biochemistry → Brain.registerBiochemistry → SVRule.CHEMICAL_CODE` plumbing that every chemical uses. Its sole purpose in the stock game is to be available for future expansion — though, unlike 206, it sits *outside* the contiguous and architecturally-significant 198–206 cluster, which puts it one step further from the conventional "brain bus" identity even though the SVRule operand path treats it identically.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **None in the stock genome** | — | — | No `G_STIMULUS` gene lists chemical 207 in its `chemicalsToAdjust[4]` slots. No `G_REACTION` gene names chemical 207 as a product. No `G_RECEPTOR` or `G_EMITTER` gene targets chemical 207. The `extract-biochemistry.js` scan of the stock genome reports zero producers for this slot | — |
| 2 | **Direct CAOS injection** | `CHEM 207 …`, `ALTR`, `ADMN`, debug consoles, modder agents | Creature / bloodstream (systemic) — written via `Biochemistry.adjustChemicalLevel(207, amount)` | Any CAOS script, debug toy, or modded gene can write chemical 207 directly. Because the half-life is effectively infinite, an injected value persists for the rest of the Creature's life unless explicitly cleared | One-shot per injection, but persistent thereafter |
| 3 | **Modder-defined producers** (template) | New `G_STIMULUS`, `G_REACTION`, `G_EMITTER`, or `G_RECEPTOR` genes added to a modded genome | Whatever organ / tissue / locus the modder chooses | Chemical 207 is reserved precisely so modders can populate it. With halflives byte 255 it is suitable for permanent state markers — life-event flags, achievements, irreversible learning-mode switches — without any halflives gene mutation | Modder's choice |

There are no reactions that produce chemical 207, no emitters listed in the genome's emitters table, and no engine code paths that write to it outside the generic `adjustChemicalLevel` plumbing. Because the half-life is the maximum value (255), any pulse that does enter the slot stays there essentially forever — a single CAOS `CHEM 207 100` would leave that level present for the Creature's entire ageing curve.

Chemical 207 has no `initialConcentrations` entry — every Creature is born with Brain chemical 10 = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **None in the stock genome** | — | — | No tract init rule reads `CHEMICAL_CODE[207]`. No SVRule in `brain-architecture.json` references the slot. No tract has 207 registered as its reward or punishment chemical via opcodes 59 / 62 (`SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`, `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`). No faculty (Sensory, Motor, Life, Linguistic, Reproductive, Drive) reads it. The chemical is not consumed by any code path the engine ships with | — |
| 2 | **Readable via the Biochemistry faculty** | `Biochemistry::GetChemical(207)` | Creature / bloodstream (systemic) | Chemical 207 is an ordinary bloodstream slot. Kits, debug views, the Science Kit chemistry graphs, and CAOS scripts can all read it as `"Brain chemical 10"` from the chemical-name catalogue | Useful for debugging modded systems that have repurposed the slot, and for verifying that no stock pathway is silently raising it (it should always read zero in unmodded play) |
| 3 | **Passive decay** (effectively none) | Halflives byte 207 = **255** | Bloodstream (systemic) | `genomeValue = 255` → `calculateHalfLife()` returns `halfLifeInTicks = Math.pow(2.2, 255) ≈ 9.07 × 10¹⁰ ticks` with `decayRate ≈ 1.0` (`DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278`). The chemical is multiplied by ~1 every biochem tick | An injected value persists for the Creature's lifetime. There is no measurable exponential-decay curve. The slot acts as a latching register rather than a transient signal |

There are no reactions, no receptors, no emitters writing into it, and no consumers in the stock genome.

## Role in Game Mechanics

### Position in the chemistry namespace

The C3 chemistry catalogue groups the brain-relevant chemicals into two distinct clusters separated by the closing bookend at slot 206:

```
198 (Brain chemical 1)   ← curated bus, generic pulse-gate bookend (halflives = 0)
199 (Up)
200 (Down)
201 (Exit)               ← navigation drives, populated by SensoryFaculty.updateDriveLobe
202 (Enter)
203 (Wait)
204 (Reward)             ← reinforcement magnitude, read by Tract.processRewardAndPunishment
205 (Punishment)
206 (Brain chemical 9)   ← curated bus, generic latched-flag bookend (halflives = 255)
─────────────────────── boundary of the curated 198–206 "brain bus" ───
207 (Brain chemical 10)  ← extended placeholder block (halflives = 255, latched flags)
208 (Brain chemical 11)
209 (Brain chemical 12)
210 (Brain chemical 13)
211 (Brain chemical 14)
─────────────────────── boundary of the extended 207–211 block ───
212 (Pre-REM sleep)      ← sleep chemistry, read by sleep / dreaming pipelines
213 (REM sleep)
```

The architectural distinction matters more for documentation than for the engine: the SVRule operand `CHEMICAL_CODE[index]` reads `pointerToChemicals[arrayIndex % 256]` (`Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668`) for *any* chemical index, with no special-case routing for the 198–206 cluster. A modded init rule reading `CHEMICAL_CODE[207]` works exactly the same way as one reading `CHEMICAL_CODE[198]`. The difference is one of *convention*: the 198–206 block is the curated bus where stock systems write, where the generic placeholder bookends were chosen to stay clean of stock dependencies, and where future C3 community work has the strongest social precedent for clustering new brain chemistry. The 207–211 block is a second-tier expansion zone — equally usable, but without the same "this is the brain bus" social signal.

### Why 207 is *also* unused

The 207–211 placeholder block was reserved at the same time as the 198–206 cluster but was never populated by the genome team. The most plausible reading is that the team carved out generous headroom for future brain-chemistry expansion that the shipping game did not need:

- The five navigation drives, two reinforcement signals, and one disappointment gate consumed eight of the nine 198–206 slots, leaving only chemical 206 as the explicit expansion bookend within the curated bus.
- The 207–211 block was preserved as a contiguous run of five additional latched-flag slots — enough room for a non-trivial extension to the brain-chemistry vocabulary without spilling into the unrelated chemistry namespace.
- The 212 / 213 sleep chemistry was placed *above* the placeholder block rather than adjacent to the navigation drives, isolating sleep state from the navigation/reinforcement bus and giving the placeholder block room to grow upward without colliding with sleep.

The five 207–211 slots are functionally identical: same halflives byte (255), same lack of producers, same lack of consumers, same generic catalogue name. The genome design did not differentiate them — there is no hint in the catalogue, the half-lives table, or the genome data that 207 was earmarked for any specific purpose distinct from 208 or 211. Modders are free to claim any subset of them.

### What it would *do* if used

Although chemical 207 is inert in the shipping game, the engine plumbing around it is fully live, and a modder can drop it into any of the standard chemical roles by adding the appropriate genome genes:

1. **As a tract init-rule gate (latched).** A modded init rule with `IF_NON_ZERO CHEMICAL_CODE[207]` followed by an `IF_ZERO_STOP` branch behaves identically to the chemical-198 disappointment gate at `brain-architecture.json:5604`, except that the gate latches: once chemical 207 is raised, the gate stays open for the rest of the Creature's life. This is suitable for permanent learning-mode switches that should not depend on the timing of a single tick.
2. **As a per-tract reward or punishment chemical.** The opcodes `SET_REWARD_CHEMICAL_INDEX` (59) and `SET_PUNISHMENT_CHEMICAL_INDEX` (62) take a chemical index and route a tract's Hebbian reinforcement through the named chemical (`Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`). A modded brain that wants a *second* reward channel — distinct from the stock 204 — can register a custom tract with reward chemical 207 and pulse 207 on the events it considers rewarding.
3. **As a milestone tracker for stimulus genes.** A `G_STIMULUS` gene firing on a life-changing event can pulse chemical 207 in its `chemicalsToAdjust[4]` slots. The lack of decay means the pulse becomes a permanent biographical marker, queryable from CAOS via `CHEM 207` for any agent that wants to react differently to "Norns who have ever experienced X."
4. **As a chemical-driven emitter.** A modded `G_EMITTER` gene reading chemical 207 from the bloodstream and writing into a neuron lobe gives the brain a persistent input proportional to the latched level — converting "Creature has experienced X" into a continuous neural signal for the rest of the lifespan.
5. **As one of several parallel latched flags.** Because 207, 208, 209, 210, and 211 are all five identically-shaped latched-flag slots, a modder can use the entire block to track up to five orthogonal life-events without any cross-contamination — a "social biography" of five independent permanent markers, each readable as `CHEMICAL_CODE[207..211]` from any future SVRule.

### Choosing 207 over 206 or vice versa

For a single new latched flag, chemical 206 is the conventional first choice: it sits inside the curated bus, has the same architectural status as the disappointment gate at chemical 198, and is the most likely place that other modders will look. Chemical 207 is the natural choice when:

- A modder needs **more than one** latched flag and wants 206 reserved as the canonical first slot.
- A modder is building a **complete subsystem** (e.g. a "social memory" suite) and prefers a contiguous range of five slots over a single bookend slot.
- A modder wants to leave 206 free for the wider community and confine their changes to the explicitly-secondary expansion block.

There is no engine-level penalty for either choice. The cost of using 207 over 206 is purely social — future tooling and mod managers may inspect the 198–206 range first when looking for "brain bus" usage, and may not surface the 207–211 placeholders as prominently. The cost of using 206 over 207 is the equally social one of consuming the conventional first-choice slot.

### Producer and consumer chains

The producer and consumer chains for chemical 207 are *exactly the same plumbing* as for chemicals 198 and 206, with the only difference being which genes are populated:

```
(modded) STIM_X stimulus event
                 │
        SensoryFaculty.stimulate()
                 │
   StimulusLibrary.getStimulus(STIM_X)
                 │
   chemicalsToAdjust[4] contains (207, +pulse)
                 │
                 ▼
  Biochemistry: myChemicalConcs[207] += pulse
                 │
                 ▼ (every brain tick from now until death)
  Brain: any tract or lobe whose SVRule reads
         CHEMICAL_CODE[207] sees the latched value
                 │
                 ▼ (biochem tick)
  Biochemistry: myChemicalConcs[207] *= ~1.0  ← no measurable decay
```

All the correctness requirements that apply to chemicals 198 and 206 (live `myChemicalConcs` reference, `pointerToChemicals` propagation through `Brain.registerBiochemistry`, `runInitRuleAlways` semantics on the consuming tract) apply identically to chemical 207. A correctly-ported brain that handles 198 will handle 207 with no additional engine work — the only thing missing is the genome-level wiring that names the slot in some gene's data block.

### What Brain chemical 10 is *not*

A few clarifications, given the chemical's anonymous catalogue name and proximity to systems that *do* have meaning at nearby slot numbers:

- **It is not part of the sleep chemistry.** Despite sitting only five slots below "Pre-REM sleep" (212) and "REM sleep" (213), chemical 207 is not read by any sleep / dreaming code path. The sleep chemistry uses slots 212 and 213 specifically; chemical 207 is in a different (and earlier) reservation block.
- **It is not a hidden navigation drive.** The five navigation drives occupy slots 199–203 inclusive. The drive lobe (`SensoryFaculty.updateDriveLobe()`) reads only those five and the legacy drive chemicals 148–162. Chemical 207 has no `driv` lobe neuron mapping.
- **It is not a hidden Reward or Punishment.** The stock per-tract reinforcement is wired to chemicals 204 and 205. Chemical 207 is not registered as a default reward or punishment chemical for any stock tract.
- **It is not any kind of "tier 10" brain chemical with special semantics.** The "10" in "Brain chemical 10" is a catalogue ordinal — slot 10 of the brain-chemical naming sequence (which started at slot 1 = chemical 198). It does not encode priority, intensity, or a level number that the engine reads.
- **It is not "always 255".** The `255` figure is the *halflives byte*, which controls decay rate, not the chemical's value. The chemical's actual concentration starts at 0 and remains at 0 unless something pulses it.

### Practical consequences for gameplay

- **Vanilla play never raises chemical 207.** A Norn, Grendel, or Ettin running purely from the stock genome will read 0 from chemical 207 for its entire life. Anyone observing a non-zero value in a Kit or debug view is looking at either an injected CAOS pulse, a modded stimulus gene firing, or an engine-level bug.
- **Chemical 207 is a clean diagnostic baseline.** Because the stock value is invariably zero, the slot is a useful canary for chemistry-graph rendering and Kit testing: any non-zero reading during stock play indicates either a mistuned plotting offset or an unintended cross-write into the slot.
- **CAOS injection produces persistent state.** `CHEM 207 100` on a creature will, with no further intervention, leave that creature with Brain chemical 10 ≈ 100 for its remaining lifetime. The slot is therefore suitable for test fixtures that need a permanent flag and want to observe long-term consequences without re-injection.
- **No stock consumers means no stock side-effects.** Because no SVRule reads chemical 207, an injected pulse does not cause any change in brain behaviour by itself. A modder must explicitly add a consumer for the pulse to do anything observable.

### JS port notes

The Rebuild port treats chemical 207 as an ordinary bloodstream chemical — there is no `CHEM_BRAIN_CHEMICAL_10` constant, no special-case path, no engine-level handling. The same two correctness requirements that apply to chemical 206 apply identically here:

- **The half-life calculation must round genomeValue 255 correctly.** A naive port that overflows or returns NaN for `Math.pow(2.2, 255)` will silently reset chemical 207 every tick, breaking any modded system that depends on its persistence.
- **The chemical must propagate through `Brain.registerBiochemistry` like any other.** Even though the stock genome has no consumer, modded genomes will. The same plumbing that makes chemicals 198 and 206 readable from any tract makes chemical 207 readable too.

The port has no obligation to populate chemical 207, fire any stock event into it, or treat it differently from chemicals 208–211, which are similarly named placeholders in the same block. Chemical 207's significance is purely architectural: it is the first slot of the secondary brain-chemical placeholder block, and is one of six interchangeable latched-flag templates available to modders.

### Summary

```
   Stock C3 producers of chemical 207:    NONE
   Stock C3 consumers of chemical 207:    NONE
   Stock C3 initial concentration:        0
   Halflives byte (genomeValue):          255
   Effective half-life:                   ~9.07 × 10^10 ticks (no measurable decay)
   Catalogue name:                        "Brain chemical 10"
   Position:                              First slot of the 207–211 extended
                                          brain-chemical placeholder block
                                          (outside the curated 198–206 bus)
   Architectural role:                    Reserved expansion slot — latched flag template
   Sibling latched-flag slots:            206, 208, 209, 210, 211
   Sibling pulse-gate slot:               198 (the only halflives-0 brain chemical)

   Brain chemical 10 is the first of five interchangeable latched-flag
   placeholders sitting just above the curated brain-chemical bus:
     - Same SVRule plumbing, same Biochemistry path as chemicals 198/206
     - Halflives byte 255 → values latch indefinitely, identical to 206
     - Sole purpose: provide additional clean expansion slots for modders
       beyond the single bookend at 206, useful when more than one
       latched flag is needed or when an entire contiguous range of
       slots is wanted for a multi-flag subsystem
     - Should always read zero in unmodded play
     - Outside the curated 198–206 bus — same engine semantics, but
       slightly less conventional as a first-choice modder slot
```

## Key Source References

- `Assets/Catalogue/ChemicalNames.catalogue:285` — the string `"Brain chemical 10"` as the 207th entry in the chemical-names table
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9176-9183` — the half-lives table entry showing `chemical: 207`, `genomeValue: 255`, `halfLifeInTicks: 90682980616`, `decayRate: 1`, `speed: "Very long"`
- `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278` — `calculateHalfLife()` showing how the 255-byte halflives value maps to an effectively-infinite half-life
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json` — searched for any reference to chemical 207; **none found**, confirming the slot has no stock consumer in the brain
- `Rebuild/DOCUMENTATION/chemicals/198 - Brain chemical 1.md` — the in-use sibling that establishes the brain-chemical-block pattern with halflives byte 0 (transient pulse template)
- `Rebuild/DOCUMENTATION/chemicals/206 - Brain chemical 9.md` — the closing bookend of the curated 198–206 bus that establishes the latched-flag template with halflives byte 255; chemical 207 follows the same template outside the curated bus
- `Rebuild/Main_Game/src/engine/creature/biochemistry/Biochemistry.js:202` — `getChemicalConcs()` returns the live reference to `myChemicalConcs` that any future modded SVRule reading chemical 207 would use
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:86` — `registerBiochemistry()` distributes the chemical-array reference to every lobe and tract; chemical 207 is reachable from any SVRule via this path
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668` — `CHEMICAL_CODE` operand handler reads `pointerToChemicals[arrayIndex % 256]`; the path through which chemical 207 would reach any modded init rule
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531` — `processRewardAndPunishment()`, the generic reinforcement system that reads chemicals registered via opcodes 59 / 62; chemical 207 is *not* registered for any stock tract but is a valid candidate for a modded one
