# 211 - Brain chemical 14

**Brain chemical 14** is the **fifth and final slot** of the secondary "extended brain chemicals" placeholder block (`Assets/Catalogue/ChemicalNames.catalogue:289`) that the genome reserves immediately above the curated 198–206 brain-chemical bus. The extended block runs from chemical **207** ("Brain chemical 10") through chemical **211** ("Brain chemical 14") and is bounded above by the sleep chemistry pair at slots **212 ("Pre-REM sleep")** and **213 ("REM sleep")**. Where the 198–206 block carries seven functionally-aliased chemicals (the navigation drives **Up / Down / Exit / Enter / Wait** and the reinforcement signals **Reward / Punishment**) flanked by the two generic bookends **Brain chemical 1** and **Brain chemical 9**, the 207–211 block is *all generic placeholder*: every slot in it carries the anonymous `"Brain chemical N"` catalogue label, and **none of them have a producer or consumer in the stock C3 genome**.

Chemical 211 is, like its siblings 207, 208, 209, 210 and the closing bookend 206, a **genuinely unused reservation**. It is not consumed by any tract init rule, not written by any stimulus gene, not emitted by any receptor or organ, not produced by any reaction, not used as the reward or punishment chemical for any tract, and not given an initial concentration. Every Creature is born with chemical 211 = 0, every Creature dies with chemical 211 = 0, and at no point in normal play does any value other than 0 enter the slot. The chemical is wired into the catalogue and into the half-lives table — and that is everything the stock genome does with it.

The shape of the reservation is identical to chemicals 206, 207, 208, 209 and 210's: the halflives byte is set to **255**, the maximum possible value, which the original engine's biochemistry tick (`Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:269-278`) maps to a half-life of **2.2^255 ≈ 9.07 × 10¹⁰ ticks** with a decay rate of **1.0** (i.e. no measurable decay). Any pulse that does enter the slot stays there essentially forever — chemical 211 is therefore a **latched permanent flag** template, not a transient signalling channel. In the chemistry namespace's two-tier expansion design, slot 211 is the sixth and final latched-flag placeholder (along with 206, 207, 208, 209 and 210); chemical 198 is the only "instant decay" pulse template among the brain chemicals.

What distinguishes chemical 211 from its siblings is its **terminal position**: it is the *last* brain-chemical placeholder before the sleep chemistry begins at slot 212. It sits directly against the upper boundary of the brain-chemical reservation, with no further expansion room above it. A modder reading the catalogue from the bottom up encounters 211 as the last "free" brain slot before the chemistry namespace transitions into the sleep subsystem; a modder reading from the top down encounters it as the first available placeholder below the sleep boundary.

There is no engine-level constant, no `CHEM_BRAIN_CHEMICAL_14`, no dedicated faculty for chemical 211. The slot is data-driven entirely through the genome and the generic `Biochemistry → Brain.registerBiochemistry → SVRule.CHEMICAL_CODE` plumbing that every chemical uses. Its sole purpose in the stock game is to be available for future expansion — it sits *outside* the contiguous and architecturally-significant 198–206 cluster, which puts it one step further from the conventional "brain bus" identity even though the SVRule operand path treats it identically.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **None in the stock genome** | — | — | No `G_STIMULUS` gene lists chemical 211 in its `chemicalsToAdjust[4]` slots. No `G_REACTION` gene names chemical 211 as a product. No `G_RECEPTOR` or `G_EMITTER` gene targets chemical 211. The `extract-biochemistry.js` scan of the stock genome reports zero producers for this slot | — |
| 2 | **Direct CAOS injection** | `CHEM 211 …`, `ALTR`, `ADMN`, debug consoles, modder agents | Creature / bloodstream (systemic) — written via `Biochemistry.adjustChemicalLevel(211, amount)` | Any CAOS script, debug toy, or modded gene can write chemical 211 directly. Because the half-life is effectively infinite, an injected value persists for the rest of the Creature's life unless explicitly cleared | One-shot per injection, but persistent thereafter |
| 3 | **Modder-defined producers** (template) | New `G_STIMULUS`, `G_REACTION`, `G_EMITTER`, or `G_RECEPTOR` genes added to a modded genome | Whatever organ / tissue / locus the modder chooses | Chemical 211 is reserved precisely so modders can populate it. With halflives byte 255 it is suitable for permanent state markers — life-event flags, achievements, irreversible learning-mode switches — without any halflives gene mutation | Modder's choice |

There are no reactions that produce chemical 211, no emitters listed in the genome's emitters table, and no engine code paths that write to it outside the generic `adjustChemicalLevel` plumbing. Because the half-life is the maximum value (255), any pulse that does enter the slot stays there essentially forever — a single CAOS `CHEM 211 100` would leave that level present for the Creature's entire ageing curve.

Chemical 211 has no `initialConcentrations` entry — every Creature is born with Brain chemical 14 = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **None in the stock genome** | — | — | No tract init rule reads `CHEMICAL_CODE[211]`. No SVRule in `brain-architecture.json` references the slot. No tract has 211 registered as its reward or punishment chemical via opcodes 59 / 62 (`SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`, `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`). No faculty (Sensory, Motor, Life, Linguistic, Reproductive, Drive) reads it. The chemical is not consumed by any code path the engine ships with | — |
| 2 | **Readable via the Biochemistry faculty** | `Biochemistry::GetChemical(211)` | Creature / bloodstream (systemic) | Chemical 211 is an ordinary bloodstream slot. Kits, debug views, the Science Kit chemistry graphs, and CAOS scripts can all read it as `"Brain chemical 14"` from the chemical-name catalogue | Useful for debugging modded systems that have repurposed the slot, and for verifying that no stock pathway is silently raising it (it should always read zero in unmodded play) |
| 3 | **Passive decay** (effectively none) | Halflives byte 211 = **255** | Bloodstream (systemic) | `genomeValue = 255` → `calculateHalfLife()` returns `halfLifeInTicks = Math.pow(2.2, 255) ≈ 9.07 × 10¹⁰ ticks` with `decayRate ≈ 1.0` (`DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278`). The chemical is multiplied by ~1 every biochem tick | An injected value persists for the Creature's lifetime. There is no measurable exponential-decay curve. The slot acts as a latching register rather than a transient signal |

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
211 (Brain chemical 14)  ← ← this chemical (terminal slot of the extended block)
─────────────────────── boundary of the extended 207–211 block ───
212 (Pre-REM sleep)      ← sleep chemistry, read by sleep / dreaming pipelines
213 (REM sleep)
```

The architectural distinction matters more for documentation than for the engine: the SVRule operand `CHEMICAL_CODE[index]` reads `pointerToChemicals[arrayIndex % 256]` (`Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668`) for *any* chemical index, with no special-case routing for the 198–206 cluster. A modded init rule reading `CHEMICAL_CODE[211]` works exactly the same way as one reading `CHEMICAL_CODE[198]`. The difference is one of *convention*: the 198–206 block is the curated bus where stock systems write, where the generic placeholder bookends were chosen to stay clean of stock dependencies, and where future C3 community work has the strongest social precedent for clustering new brain chemistry. The 207–211 block is a second-tier expansion zone — equally usable, but without the same "this is the brain bus" social signal.

### Why 211 is *also* unused

The 207–211 placeholder block was reserved at the same time as the 198–206 cluster but was never populated by the genome team. The most plausible reading is that the team carved out generous headroom for future brain-chemistry expansion that the shipping game did not need:

- The five navigation drives, two reinforcement signals, and one disappointment gate consumed eight of the nine 198–206 slots, leaving only chemical 206 as the explicit expansion bookend within the curated bus.
- The 207–211 block was preserved as a contiguous run of five additional latched-flag slots — enough room for a non-trivial extension to the brain-chemistry vocabulary without spilling into the unrelated chemistry namespace.
- The 212 / 213 sleep chemistry was placed *above* the placeholder block rather than adjacent to the navigation drives, isolating sleep state from the navigation/reinforcement bus and giving the placeholder block room to grow upward without colliding with sleep — and chemical 211 sits exactly on that upper boundary.

The five 207–211 slots are functionally identical: same halflives byte (255), same lack of producers, same lack of consumers, same generic catalogue name. The genome design did not differentiate them — there is no hint in the catalogue, the half-lives table, or the genome data that 211 was earmarked for any specific purpose distinct from 207, 208, 209 or 210. Modders are free to claim any subset of them.

### What it would *do* if used

Although chemical 211 is inert in the shipping game, the engine plumbing around it is fully live, and a modder can drop it into any of the standard chemical roles by adding the appropriate genome genes:

1. **As a tract init-rule gate (latched).** A modded init rule with `IF_NON_ZERO CHEMICAL_CODE[211]` followed by an `IF_ZERO_STOP` branch behaves identically to the chemical-198 disappointment gate at `brain-architecture.json:5604`, except that the gate latches: once chemical 211 is raised, the gate stays open for the rest of the Creature's life. This is suitable for permanent learning-mode switches that should not depend on the timing of a single tick.
2. **As a per-tract reward or punishment chemical.** The opcodes `SET_REWARD_CHEMICAL_INDEX` (59) and `SET_PUNISHMENT_CHEMICAL_INDEX` (62) take a chemical index and route a tract's Hebbian reinforcement through the named chemical (`Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531`). A modded brain that wants an additional reward channel — distinct from the stock 204 — can register a custom tract with reward chemical 211 and pulse 211 on the events it considers rewarding.
3. **As a milestone tracker for stimulus genes.** A `G_STIMULUS` gene firing on a life-changing event can pulse chemical 211 in its `chemicalsToAdjust[4]` slots. The lack of decay means the pulse becomes a permanent biographical marker, queryable from CAOS via `CHEM 211` for any agent that wants to react differently to "Norns who have ever experienced X."
4. **As a chemical-driven emitter.** A modded `G_EMITTER` gene reading chemical 211 from the bloodstream and writing into a neuron lobe gives the brain a persistent input proportional to the latched level — converting "Creature has experienced X" into a continuous neural signal for the rest of the lifespan.
5. **As one of several parallel latched flags.** Because 207, 208, 209, 210 and 211 are all five identically-shaped latched-flag slots, a modder can use the entire block to track up to five orthogonal life-events without any cross-contamination — a "social biography" of five independent permanent markers, each readable as `CHEMICAL_CODE[207..211]` from any future SVRule.

### Choosing 211 over its siblings

For a single new latched flag, chemical 206 is the conventional first choice, followed by 207 as the first slot of the extended block and 208 as the second. Chemical 211 is the natural choice when:

- A modder needs **all five** latched flags and 211 is the **terminal slot** that closes the extended block.
- A modder is building a **boundary-anchored subsystem** that wants to sit immediately adjacent to the sleep chemistry — for example, a "wakefulness biography" flag that conceptually belongs near the sleep slots without actually participating in the sleep faculty's reads.
- A modder wants the **upper-paired anchor** of the extended block: 210 and 211 form a natural two-slot pair at the top edge of the 207–211 block, and 211 is the higher of the two — suitable for a binary-state system (e.g. two mutually-exclusive life-mode flags) where 211 holds the "second" or "later" state.
- A modder is **packing modded subsystems against the upper boundary** of the placeholder block to keep the lower extended slots free for unrelated future work — using 211 (and 210) preserves 207/208/209 for the broader community.

There is no engine-level penalty for any of these choices. The cost of using 211 over 207, 208, 209 or 210 is purely social — future tooling and mod managers may inspect the lower slots first when looking for "first extended brain chemical" usage. The 207–211 slots are otherwise interchangeable.

### The terminal-slot consideration

Chemical 211 has one architectural property its four siblings in the extended block do not: it is **immediately adjacent to the sleep chemistry**. This has no engine-level implication — the SVRule path is the same, the halflives byte is the same, the Biochemistry plumbing is the same — but it has two practical consequences for modders:

1. **No room to grow upward.** A modded subsystem that pulses chemical 211 cannot expand into 212 without colliding with the Pre-REM sleep chemistry that is actively read by the sleep faculty. Subsystems likely to grow should start lower in the block (207 or 208) and grow upward; subsystems that are intentionally bounded fit cleanly into 211.
2. **Off-by-one sensitivity in chemistry-graph rendering.** Kits and the Science Kit chemistry display read consecutive slots and render them as a column. A pulse on chemical 211 displays directly above the sleep chemistry on the graph, making any cross-talk between a modded 211 producer and the sleep system visually obvious. Conversely, modders should be aware that visualisations of the "sleep band" may include slot 211 by accident; debug views should be checked against the catalogue index rather than against the visual position.

### Producer and consumer chains

The producer and consumer chains for chemical 211 are *exactly the same plumbing* as for chemicals 198, 206, 207, 208, 209 and 210, with the only difference being which genes are populated:

```
(modded) STIM_X stimulus event
                 │
        SensoryFaculty.stimulate()
                 │
   StimulusLibrary.getStimulus(STIM_X)
                 │
   chemicalsToAdjust[4] contains (211, +pulse)
                 │
                 ▼
  Biochemistry: myChemicalConcs[211] += pulse
                 │
                 ▼ (every brain tick from now until death)
  Brain: any tract or lobe whose SVRule reads
         CHEMICAL_CODE[211] sees the latched value
                 │
                 ▼ (biochem tick)
  Biochemistry: myChemicalConcs[211] *= ~1.0  ← no measurable decay
```

All the correctness requirements that apply to chemicals 198, 206, 207, 208, 209 and 210 (live `myChemicalConcs` reference, `pointerToChemicals` propagation through `Brain.registerBiochemistry`, `runInitRuleAlways` semantics on the consuming tract) apply identically to chemical 211. A correctly-ported brain that handles 198 will handle 211 with no additional engine work — the only thing missing is the genome-level wiring that names the slot in some gene's data block.

### What Brain chemical 14 is *not*

A few clarifications, given the chemical's anonymous catalogue name and proximity to systems that *do* have meaning at adjacent slot numbers:

- **It is not part of the sleep chemistry.** Despite sitting immediately below "Pre-REM sleep" (212), chemical 211 is not read by any sleep / dreaming code path. The sleep chemistry uses slots 212 and 213 specifically; chemical 211 is the last slot of the *prior* (brain-chemical) reservation block. There is no "off by one" in the sleep faculty — it reads 212 and 213 only.
- **It is not a hidden navigation drive.** The five navigation drives occupy slots 199–203 inclusive. The drive lobe (`SensoryFaculty.updateDriveLobe()`) reads only those five and the legacy drive chemicals 148–162. Chemical 211 has no `driv` lobe neuron mapping.
- **It is not a hidden Reward or Punishment.** The stock per-tract reinforcement is wired to chemicals 204 and 205. Chemical 211 is not registered as a default reward or punishment chemical for any stock tract.
- **It is not any kind of "tier 14" brain chemical with special semantics.** The "14" in "Brain chemical 14" is a catalogue ordinal — slot 14 of the brain-chemical naming sequence (which started at slot 1 = chemical 198). It does not encode priority, intensity, or a level number that the engine reads.
- **It is not "always 255".** The `255` figure is the *halflives byte*, which controls decay rate, not the chemical's value. The chemical's actual concentration starts at 0 and remains at 0 unless something pulses it.
- **It is not a "sleep precursor" or "pre-sleep buffer".** Its proximity to the sleep chemistry is a layout coincidence of the catalogue, not a semantic relationship. The sleep faculty does not read 211 as an input, and no stock pathway raises 211 in conjunction with sleep state changes.

### Practical consequences for gameplay

- **Vanilla play never raises chemical 211.** A Norn, Grendel, or Ettin running purely from the stock genome will read 0 from chemical 211 for its entire life. Anyone observing a non-zero value in a Kit or debug view is looking at either an injected CAOS pulse, a modded stimulus gene firing, or an engine-level bug.
- **Chemical 211 is a clean diagnostic baseline.** Because the stock value is invariably zero, the slot is a useful canary for chemistry-graph rendering and Kit testing: any non-zero reading during stock play indicates either a mistuned plotting offset or an unintended cross-write into the slot.
- **Particularly useful canary for sleep-system testing.** Because chemical 211 sits immediately below the sleep chemistry slots, it is the natural "guard" slot for verifying that a sleep-system fix or modification has not accidentally written one slot too low. A test harness that pulses 211 to a known sentinel value before a sleep-state transition can detect off-by-one writes that would otherwise corrupt the sleep faculty's input.
- **CAOS injection produces persistent state.** `CHEM 211 100` on a creature will, with no further intervention, leave that creature with Brain chemical 14 ≈ 100 for its remaining lifetime. The slot is therefore suitable for test fixtures that need a permanent flag and want to observe long-term consequences without re-injection.
- **No stock consumers means no stock side-effects.** Because no SVRule reads chemical 211, an injected pulse does not cause any change in brain behaviour by itself. A modder must explicitly add a consumer for the pulse to do anything observable.

### JS port notes

The Rebuild port treats chemical 211 as an ordinary bloodstream chemical — there is no `CHEM_BRAIN_CHEMICAL_14` constant, no special-case path, no engine-level handling. The same two correctness requirements that apply to chemicals 206, 207, 208, 209 and 210 apply identically here:

- **The half-life calculation must round genomeValue 255 correctly.** A naive port that overflows or returns NaN for `Math.pow(2.2, 255)` will silently reset chemical 211 every tick, breaking any modded system that depends on its persistence.
- **The chemical must propagate through `Brain.registerBiochemistry` like any other.** Even though the stock genome has no consumer, modded genomes will. The same plumbing that makes chemicals 198 and 206 readable from any tract makes chemical 211 readable too.
- **Boundary check with the sleep slots.** Any port-time array indexing (or off-by-one) bug between the brain-chemical block and the sleep-chemistry block will manifest first at the 211/212 boundary. A port-validation test that pulses 211 to a sentinel and then reads the sleep slots is a cheap way to catch this regression.

The port has no obligation to populate chemical 211, fire any stock event into it, or treat it differently from chemicals 207, 208, 209 or 210, which are similarly named placeholders in the same block. Chemical 211's significance is purely architectural: it is the fifth and final slot of the secondary brain-chemical placeholder block, sitting against the upper boundary with the sleep chemistry, and is one of six interchangeable latched-flag templates available to modders.

### Summary

```
   Stock C3 producers of chemical 211:    NONE
   Stock C3 consumers of chemical 211:    NONE
   Stock C3 initial concentration:        0
   Halflives byte (genomeValue):          255
   Effective half-life:                   ~9.07 × 10^10 ticks (no measurable decay)
   Catalogue name:                        "Brain chemical 14"
   Position:                              Fifth and terminal slot of the 207–211
                                          extended brain-chemical placeholder
                                          block (outside the curated 198–206 bus);
                                          upper half of the upper-edge pair 210/211;
                                          immediately adjacent to the sleep
                                          chemistry boundary at slot 212
   Architectural role:                    Reserved expansion slot — latched flag template
                                          and natural boundary canary against the
                                          sleep chemistry
   Sibling latched-flag slots:            206, 207, 208, 209, 210
   Sibling pulse-gate slot:               198 (the only halflives-0 brain chemical)

   Brain chemical 14 is the fifth and final of five interchangeable
   latched-flag placeholders sitting just above the curated brain-chemical bus:
     - Same SVRule plumbing, same Biochemistry path as chemicals 198/206/207/208/209/210
     - Halflives byte 255 → values latch indefinitely, identical to 206/207/208/209/210
     - Sole purpose: provide a final clean expansion slot for modders, anchored
       against the sleep-chemistry boundary
     - Useful as a top-edge anchor when modding the upper pair 210/211, as a
       canary for sleep-system off-by-one bugs, or simply as the fifth latched
       flag when a modded subsystem needs the entire extended block
     - Should always read zero in unmodded play
     - Outside the curated 198–206 bus — same engine semantics, but the most
       boundary-sensitive of the placeholders due to its adjacency to slot 212
```

## Key Source References

- `Assets/Catalogue/ChemicalNames.catalogue:289` — the string `"Brain chemical 14"` as the 211th entry in the chemical-names table
- `Assets/Catalogue/ChemicalNames.catalogue:290-291` — the immediately following sleep-chemistry strings `"Pre-REM sleep"` (212) and `"REM sleep"` (213) that bound chemical 211 from above
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — the half-lives table entry showing `chemical: 211`, `genomeValue: 255`, `halfLifeInTicks: 90682980616`, `decayRate: 1`, `speed: "Very long"`
- `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js:265-278` — `calculateHalfLife()` showing how the 255-byte halflives value maps to an effectively-infinite half-life
- `Rebuild/DOCUMENTATION/CreaturesData/brain-architecture.json` — searched for any reference to chemical 211; **none found**, confirming the slot has no stock consumer in the brain
- `Rebuild/DOCUMENTATION/chemicals/198 - Brain chemical 1.md` — the in-use sibling that establishes the brain-chemical-block pattern with halflives byte 0 (transient pulse template)
- `Rebuild/DOCUMENTATION/chemicals/206 - Brain chemical 9.md` — the closing bookend of the curated 198–206 bus that establishes the latched-flag template with halflives byte 255
- `Rebuild/DOCUMENTATION/chemicals/207 - Brain chemical 10.md` — the first slot of the extended 207–211 block
- `Rebuild/DOCUMENTATION/chemicals/208 - Brain chemical 11.md` — the second slot of the extended block
- `Rebuild/DOCUMENTATION/chemicals/209 - Brain chemical 12.md` — the third slot of the extended block
- `Rebuild/DOCUMENTATION/chemicals/210 - Brain chemical 13.md` — the immediate prior sibling and fourth slot of the extended block; chemical 211 follows the same template at the terminal position
- `Rebuild/Main_Game/src/engine/creature/biochemistry/Biochemistry.js:202` — `getChemicalConcs()` returns the live reference to `myChemicalConcs` that any future modded SVRule reading chemical 211 would use
- `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:86` — `registerBiochemistry()` distributes the chemical-array reference to every lobe and tract; chemical 211 is reachable from any SVRule via this path
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:668` — `CHEMICAL_CODE` operand handler reads `pointerToChemicals[arrayIndex % 256]`; the path through which chemical 211 would reach any modded init rule
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:531` — `processRewardAndPunishment()`, the generic reinforcement system that reads chemicals registered via opcodes 59 / 62; chemical 211 is *not* registered for any stock tract but is a valid candidate for a modded one
