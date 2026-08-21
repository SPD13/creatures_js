# 128 - Stress

**Stress** is the Creature's aggregated "things are going badly" hormone: a slow-moving bloodstream reading that rises whenever *any* of the Creature's drives crosses a distress threshold, and falls back toward zero only over thousands of ticks. It occupies slot **128** of the 256-entry chemical table, immediately after **127 Injury** (the whole-body damage accumulator) and before **129 Sleepase** (the sleep-promoter). Where Injury tracks physical organ damage and Pain (148) tracks moment-to-moment perceived hurt, Stress tracks **how much chronic suffering the Norn has been carrying across its drives** — hunger that has gone unfed, sleep that has gone unslept, fear or anger that has gone unresolved, pain that has outlasted its cause. Its 2481-tick half-life (`biochemistry.json:8608-8615`, "Long" band) is deliberate: Stress is a **hormone**, not a sensor, and it is meant to persist long enough to colour the Norn's biochemistry for many minutes after its triggering drives subside.

Stress is produced by a distinctive **two-stage cascade** built entirely out of ordinary genome emitters and receptors — the engine itself does not touch chemical 128. In the first stage, the `DriveFaculty`'s drive-locus values are read by high-threshold receptors (155-163) that fire only when a drive is in acute crisis; each of those receptors writes to one of the 32 "floating loci" on the Creature's Circulatory tissue, and emitters on those floating loci then produce **one of nine per-cause Stress variants** (chemicals 187-195: Stress (H4C/H4P/H4F), Stress (Anger/Pain/Fear/Crowded/Sleep/Tired)). In the second stage, each per-cause Stress chemical is read back by its own DIGITAL receptor (146-154) that writes to *another* floating-loci bank, and emitters on *those* loci finally produce the generic **Stress (128)** chemical at a fixed rate per active source. The result is an aggregate signal: the more different drives a Norn is in crisis about, and the longer those crises last, the higher the Stress reading climbs.

Only two stock-genome receptors actually read chemical 128 — both on the Reproductive tissue, both pumping Stress into the **mutation machinery** (`biochemistry.json`, receptor ids 122 and 123, `LOC_CHANCEOFMUTATION` and `LOC_DEGREEOFMUTATION`, threshold 70). A stressed Norn that conceives therefore passes on **more mutations, of larger magnitude**, to its offspring. Stress also serves as a **catalyst** in reaction id 76 — `1x Stress + 1x Prostaglandin → 1x Stress + 1x Fatty Acid` (`biochemistry.json:2491-2522`) — a classic "stress-induced lipolysis" rule that pulls the pain-modulator Prostaglandin apart into metabolic fuel whenever Stress is present. Together these two consumers make Stress the game's **long-term evolutionary pressure hormone**: stressed lineages mutate faster and burn more fat, which is biologically consistent with real-world stress biochemistry.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **floating locus 14** — Stress (Anger) cascade | Emitter gene **23** (`biochemistry.json`, emitter id 33) | Creature / Circulatory / Locus 14 | `chemical=128, threshold=128, rate=24, gain=5, flags=DIGITAL`. Floating locus 14 is driven by receptor id 146 (reads chemical **187 Stress (H4C)** ≥128), but the stock genome wiring chains Anger → Stress (Anger) → this locus. When the locus is ≥128, emit Stress at gain 5 per firing | ~5/255 of locus value per 24-tick window while active |
| 2 | Emitter on **floating locus 15** — Stress (H4P) cascade | Emitter gene **25** (emitter id 32) | Creature / Circulatory / Locus 15 | `chemical=128, threshold=128, rate=24, gain=5, flags=DIGITAL`. Driven by receptor id 153 (Stress (H4P) ≥128). When active, emit Stress at gain 5 | ~5/255 per 24-tick window |
| 3 | Emitter on **floating locus 16** — Stress (H4F) cascade | Emitter gene **24** (emitter id 31) | Creature / Circulatory / Locus 16 | `chemical=128, threshold=128, rate=24, gain=5, flags=DIGITAL`. Driven by receptor id 152 (Stress (H4F) ≥128) | ~5/255 per 24-tick window |
| 4 | Emitter on **floating locus 17** — Stress (Anger) backup | Emitter gene **26** (emitter id 30) | Creature / Circulatory / Locus 17 | `chemical=128, threshold=128, rate=24, gain=20, flags=DIGITAL`. Driven by receptor id 151 (Stress (Anger) ≥128). High gain (20) makes Anger-driven stress the strongest contributor | ~20/255 per 24-tick window |
| 5 | Emitter on **floating locus 18** — Stress (Fear) cascade | Emitter gene **27** (emitter id 29) | Creature / Circulatory / Locus 18 | `chemical=128, threshold=128, rate=24, gain=14, flags=DIGITAL`. Driven by receptor id 150 (Stress (Fear) ≥128) | ~14/255 per 24-tick window |
| 6 | Emitter on **floating locus 19** — Stress (Pain) cascade | Emitter gene **28** (emitter id 28) | Creature / Circulatory / Locus 19 | `chemical=128, threshold=128, rate=24, gain=8, flags=DIGITAL`. Driven by receptor id 149 (Stress (Pain) ≥128). Lower gain than Anger/Fear — Pain is acute-first, not chronic-stress-first | ~8/255 per 24-tick window |
| 7 | Emitter on **floating locus 20** — Stress (Tired) cascade | Emitter gene **30** (emitter id 27) | Creature / Circulatory / Locus 20 | `chemical=128, threshold=128, rate=24, gain=5, flags=DIGITAL`. Driven by receptor id 148 (Stress (Tired) ≥128). Emits only for youth+ (`switchOnStage=Youth`) | ~5/255 per 24-tick window, from Youth |
| 8 | Emitter on **floating locus 21** — Stress (Sleep) cascade | Emitter gene **33** (emitter id 26) | Creature / Circulatory / Locus 21 | `chemical=128, threshold=128, rate=24, gain=5, flags=DIGITAL`. Driven by receptor id 147 (Stress (Sleep) ≥128) | ~5/255 per 24-tick window |
| 9 | Emitter on **floating locus 22** — Stress (Crowded) cascade | Emitter gene **31** (emitter id 25) | Creature / Circulatory / Locus 22 | `chemical=128, threshold=128, rate=24, gain=5, flags=DIGITAL`. Driven by receptor id 146 (Stress (Crowded) ≥128). Youth+ only | ~5/255 per 24-tick window, from Youth |
| 10 | **Reaction id 76** regenerates Stress as a catalyst | Reaction gene **98** (`biochemistry.json:2491-2522`) | Somatic / Reaction-organ | `1x Stress [128] + 1x Prostaglandin [94] → 1x Stress [128] + 1x Fatty Acid [6]`, half-life **16 ticks** (Short). Stress appears on both sides: it is not consumed, only required as a catalyst. Gated by receptor id 177 on Injury (see `127 - Injury.md`) — the reaction only runs when the Creature is injured | Stress level unchanged by this reaction, but the equation counts Stress as a "product" so biochem bookkeeping lists it as a source. Net production = 0 |
| 11 | Direct `CHEM 128 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, consumable-agent chemical injectors | Creature / bloodstream (systemic) | A CAOS script or agent writes chemical 128 into the bloodstream without any upstream drive or cascade. Used by the debug console's chemistry dump, the Stress-injecting Shee debug toys, and mods that want to artificially stress a Creature for testing | One-shot per injection |

Note that Stress has **no `initialConcentrations` entry** — every Creature is born with Stress = 0. The 2481-tick "Long" half-life means Stress falls by only ~0.028% per biochem tick, so once it is raised it persists for many in-game minutes even after every triggering drive has decayed away.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **Mutation chance multiplier** | Receptor gene **161** (receptor id 122) | Creature / Reproductive / **LOC_CHANCEOFMUTATION** | `chemical=128, threshold=70, nominal=0, gain=38, flags=none` (analog, non-inverted), switches on at `AGE_BABY` | When Stress climbs above **70** (out of 255), `LOC_CHANCEOFMUTATION` rises analogically up to ~0.149 (`gain/255 * saturation`). At gamete formation the Reproductive tissue uses this locus as the per-gene probability of a mutation event. A chronically stressed Norn therefore conceives offspring with measurably elevated mutation rates compared to a relaxed one |
| 2 | **Mutation magnitude multiplier** | Receptor gene **162** (receptor id 123) | Creature / Reproductive / **LOC_DEGREEOFMUTATION** | `chemical=128, threshold=70, nominal=0, gain=54, flags=none` (analog, non-inverted), switches on at `AGE_BABY` | Same threshold as #1 but a higher gain (54/255 ≈ 0.212). `LOC_DEGREEOFMUTATION` controls how *far* each mutation moves a gene parameter; Stress therefore both *triggers* more mutations **and** makes each mutation *bigger*. The two together make Stress the genome's primary "evolutionary pressure" knob |
| 3 | **Stress-induced lipolysis** (catalyst) | Reaction gene **98** (reaction id 76) | Somatic / Reaction-organ | `1x Stress [128] + 1x Prostaglandin [94] → 1x Stress [128] + 1x Fatty Acid [6]`, half-life 16 ticks. Gated by receptor id 177 on chemical 127 Injury (analog, threshold 16) — so this only runs when the Creature is both stressed **and** injured | Converts the pain-modulator Prostaglandin into usable fuel (Fatty Acid) at a rate that scales with Injury. Stress is catalytic (unchanged), so it is the *gating presence* — no Stress means no lipolysis from this pathway. A stressed, wounded Norn therefore mobilises fat reserves faster than a calm, wounded one |
| 4 | **Readable for the brain via Biochemistry faculty** | `Biochemistry::GetChemical(128)` | Creature / bloodstream (systemic) | Chemical 128 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it | "How stressed is this Creature, summed across all drive causes?" becomes a first-class observable for both in-game UI and external tools |
| 5 | **Passive decay** | Halflives byte 128 = **79** | Bloodstream (systemic) | `halfLifeInTicks = 2481`, `decayRate ≈ 0.99972`, "Long" decay band. Multiplies Stress by ~0.99972 every biochem tick | Very slow. A Stress spike takes roughly **2500 ticks to halve**, ~5000 ticks to quarter. Stress is a chronic-state hormone, not a real-time signal |

## Role in Game Mechanics

### The two-stage drive-to-Stress cascade

Stress (128) is not written by any engine code. It exists entirely as the emergent output of a **gene-defined two-stage cascade** that funnels drive-level information into a single summary hormone. Understanding this cascade is the key to understanding what Stress actually measures.

**Stage 1 — Drive → per-cause Stress.** The nine "hot" drives each have a matching dedicated Stress chemical:

| Drive | Drive chemical (→ drive locus) | Distress threshold | Per-cause Stress | Stress halflife |
|-------|--------------------------------|--------------------|-------------------|-----------------|
| Hunger for carbohydrate | drive locus 5 | 214 | **187 Stress (H4C)** | 621 (Medium) |
| Hunger for protein | drive locus 6 | 214 | **188 Stress (H4P)** | 311 (Medium) |
| Hunger for fat | drive locus 7 | 214 | **189 Stress (H4F)** | 311 (Medium) |
| Sleepiness | drive locus 9 | 214 | **193 Stress (Sleep)** | 311 (Medium) |
| Tiredness | drive locus 10 | 204 | **194 Stress (Tired)** | 311 (Medium) |
| Crowded | drive locus 10 (dual-use) | 230 | **195 Stress (Crowded)** | 311 (Medium) |
| Fear | drive locus 11 | 204 | **191 Stress (Fear)** | 311 (Medium) |
| Pain | drive locus 12 | 191 | **192 Stress (Pain)** | 311 (Medium) |
| Anger | drive locus 13 | 214 | **190 Stress (Anger)** | 311 (Medium) |

Each row is implemented by a matched pair — a DIGITAL receptor (ids 155-163) that reads the drive chemical and fires a **floating locus** when the drive crosses the distress threshold, plus an emitter (ids 34-42) on that same floating locus that produces the per-cause Stress chemical at rate 14, gain 6. The thresholds are high (191-230 on a 0-255 scale), meaning *only really bad* drive states fire the stress cascade — a slightly hungry or slightly angry Norn does not produce Stress.

**Stage 2 — per-cause Stress → aggregate Stress (128).** The nine per-cause Stress chemicals are in turn read by nine DIGITAL receptors (ids 146-154, all threshold 128) that drive **a second set of floating loci** (14-22), which in turn have emitters (ids 25-33) producing the aggregate chemical 128 Stress at rate 24. This second stage does two things: (a) it **integrates** across all nine causes — every per-cause Stress chemical that is above 128 contributes simultaneously; and (b) it **re-weights** them with different emitter gains (Anger 20 > Fear 14 > Pain 8 > everything else 5). So in the final Stress (128) reading, Anger-driven stress counts ~4× as much as hunger-driven or sleep-driven stress, and Fear is second-heaviest.

### Why the cascade exists at all

A simpler design would have been to emit Stress (128) *directly* from the drive loci. The two-stage cascade looks baroque, but it gives the genome three things that a direct emitter could not:

1. **Different decay timescales per cause.** Each per-cause Stress chemical (187-195) has its own half-life entry — most are 311 ticks (Medium), but Stress (H4C) is 621 ticks (longer). This lets the genome tune how long each type of drive crisis "lingers" in the biochem *before* aggregation. Hunger-for-carb stress persists longer than the others, modelling a kind of carb-craving memory.
2. **Genomic accessibility.** Because each per-cause Stress is its own bloodstream chemical, a modder or a CAOS script can read "how much Stress (Pain)" separately from "how much Stress (Hunger)" — useful for Kits, for instincts, and for fine-grained mods. A pure direct-drive → Stress emitter would collapse all nine causes into an uninterpretable scalar.
3. **Stackable per-source gain.** The nine sources combine in Stage 2 with *different* gains (5/8/14/20), so the final Stress reading weights the causes differently without needing per-drive logic at the drive layer.

The Stage-1 per-cause Stress chemicals are themselves readable and emit-able, so the ecosystem is fully modifiable: a modder can, say, add a "Stress (Loneliness)" chemical by wiring a tenth pair of receptor/emitter genes and plumbing it into a tenth floating locus. The engine treats Stress (128) as unremarkable and does not hard-code the cascade at all.

### The two consumers: mutation and lipolysis

Only two stock-genome consumers read Stress (128):

**Consumer 1 — mutation pressure.** Receptors 122 and 123 on the Reproductive tissue read Stress ≥70 and drive `LOC_CHANCEOFMUTATION` / `LOC_DEGREEOFMUTATION` respectively. At gamete formation (ovulation for females, sperm production for males), those loci control per-gene mutation probability and per-mutation step size. The practical consequence is that **stressed lineages evolve faster**:

- A Norn that has gone hungry, cold, scared, and in pain across its life reaches reproductive age with elevated Stress and conceives offspring with noticeably more mutations.
- A Norn living a pampered life in a well-stocked world with no predators keeps Stress near zero, and conceives offspring almost identical to itself.
- Over generations, this is an **adaptive pressure mechanism**: environments that stress their inhabitants push the species to mutate faster in search of a better-fit genotype, while comfortable environments let a well-adapted genotype stabilise.

This is, by design, Creatures' equivalent of the real-world phenomenon where stress-induced gene regulation increases somatic mutation rates. It is also the reason serious Norn-breeding programmes take Stress readings seriously: a breeder who wants a stable, conservative line keeps Stress low; a breeder aiming for genetic exploration gives the Norns some hardship.

**Consumer 2 — stress-induced lipolysis.** Reaction 76 converts Prostaglandin → Fatty Acid at a rate scaling with Injury and *requires* Stress as a catalyst. Prostaglandin is produced by pain receptors and is itself a pain modulator (see `DOCUMENTATION/chemicals/094 - Prostaglandin.md`); Fatty Acid is directly usable metabolic fuel. The biochem interpretation is: "when a Norn is simultaneously injured and stressed, convert its circulating pain modulators into emergency energy." This is the biochem analogue of the real "fight-or-flight" lipolysis response. Without Stress, the reaction does not run — so a wounded but calm Norn keeps Prostaglandin in circulation, while a wounded and stressed Norn rapidly burns through it into Fatty Acid.

### The long half-life

Stress's half-life of 2481 biochem ticks is deliberately long:

- A one-off crisis (a Norn gets slapped once, bringing its Anger drive above 214 for a few seconds) raises Stress a little, and that little bit takes ~40 game minutes to halve.
- Sustained crisis (a Norn trapped in a hostile environment with chronic hunger and fear) accumulates Stress toward saturation over a similar timescale — hours of game time.
- Once Stress is elevated past the 70 mutation threshold, it *stays* there across many drive cycles: even if the Norn briefly eats and stops being hungry, Stress does not drop below 70 for a long time.

This is how Stress becomes a **state hormone** rather than a moment-to-moment sensor. A new player can meaningfully say "my colony is stressed" as a persistent diagnosis, not a momentary blip.

### Stress vs. Injury vs. Pain

The three "how is the body doing?" chemicals are often confused but measure distinct things:

- **Injury (127)** — organ-level physical damage accumulator. Fed by 45 toxin receptors on `RLOCUS_INJURY` plus starvation and `INJR` CAOS; consumed only by organ repair + decay. Drives the limping gait. Medium decay (209 ticks). See `127 - Injury.md`.
- **Pain (148)** — real-time perceived pain drive. Fed by external pain stimuli (pokes, burns, bites) via pain-receptor genes; consumed by drive-satisfaction reactions. Drives brain behaviour ("seek comfort, seek medic"). Short decay.
- **Stress (128)** — chronic drive-crisis aggregator. Fed by the nine-drive cascade described above; consumed by mutation-locus receptors and the stress-prostaglandin reaction. Drives evolutionary pressure and stress-lipolysis. Long decay (2481 ticks).

A useful mental model: **Injury is "how broken is the body right now?"**, **Pain is "how much does the brain think it hurts right now?"**, and **Stress is "how bad has the week been?"** A Norn can be injured without being in pain (painkiller dosed), in pain without being injured (psychological pain from isolation), stressed without being in pain (chronic hunger that is distressing but not acutely hurting), and so on.

### JS port notes

The Rebuild port treats chemical 128 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The entire cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. This mirrors the original engine: the string `"Stress"` appears only in `ChemicalNames.catalogue:190`, not anywhere in the original engine's creature or biochemistry code.

Three facts the port must get right to reproduce Stress correctly:
1. **Floating loci are bidirectional.** Circulatory loci 0-31 (`LOC_FLOATING_FIRST..LAST`) must return the same pointer for both receptor and emitter calls. The two-stage cascade depends on a receptor writing to a floating locus and an emitter on the *same* locus reading that value back.
2. **DIGITAL emitter rate-gating is correct.** The nine Stress-128 emitters use `flags=DIGITAL (fixed gain)` and `rate=24`, meaning they fire at a fixed interval and only emit if the locus is above threshold 128.
3. **Per-cause Stress halflives differ.** The genome's halflives table stores a distinct byte for chemicals 187-195; Stress (H4C) at 621 ticks is outside the 311 uniform value for the others, and the Biochemistry tick loop must apply the correct decay factor per chemical.

### Practical consequences for gameplay

- **Stress is the evolutionary pressure knob.** A world designer who wants creatures to evolve must provide moderate hardship — predators, food scarcity, crowded quarters — to push Stress above the 70 mutation threshold. A pacifist sandbox with unlimited food produces a stable, slow-evolving population.
- **Stress is sticky.** Relieving the drives (feeding the hungry Norn, removing the crowding) does *not* immediately drop Stress. Per-cause Stress chemicals decay at 311-621 ticks, and the aggregate chemical 128 decays at 2481 ticks. A breeder "resetting" a stressed Norn's environment must wait many in-game minutes before Stress reads low again.
- **Anger dominates the Stress reading.** Because the Anger-driven emitter (locus 17) has gain 20 — four times the baseline — an angry Norn produces more Stress per tick than a hungry, sleepy, or crowded one. Aggressive Grendels and Ettins therefore accumulate Stress much faster than docile Norns under the same world conditions.
- **Injecting Stress is a valid mod lever.** `CHEM 128 150` into a Norn raises Stress above the mutation threshold and keeps it there for a long time (because of the long half-life). This is used by breeding mods that want to force mutation pressure without actually stressing the Creature with real hardship.
- **Diagnosing stress in the Kits.** A Norn in the Health/Science Kit with a flat, elevated Stress line but *normal* drive readings has recently come off a bad patch — Stress outlasts its causes. A Norn with rising Stress and currently-high drives is in an active crisis.

### Summary

```
   Drive chemicals (9 drives): Hunger{C,P,F}, Sleep, Tired, Crowded, Fear, Pain, Anger
                                 │
                                 ▼  Drive loci 5-13 on Circulatory tissue
                    Receptors 155-163 (DIGITAL, thr 191-230)
                                 │
                                 ▼
                    Floating loci 5-13 (Circulatory, gene-defined)
                                 │
                    Emitters 34-42 (DIGITAL, rate 14, gain 6)
                                 │
                                 ▼
           9 per-cause Stress chemicals (187-195):
           Stress (H4C) / (H4P) / (H4F) / (Anger) / (Fear) /
           (Pain) / (Sleep) / (Tired) / (Crowded)
           Half-lives 311 ticks (311 for most, 621 for H4C)
                                 │
                    Receptors 146-154 (DIGITAL, thr 128)
                                 │
                                 ▼
                    Floating loci 14-22 (Circulatory)
                                 │
                    Emitters 25-33 (DIGITAL, rate 24,
                                    gain 5-20 per source)
                                 │
                                 ▼
                      CHEM_STRESS [128] in bloodstream
                       • No initial concentration (starts at 0)
                       • Half-life ≈ 2481 ticks ("Long" decay)
                                 │
                 ┌───────────────┼─────────────────────┐
                 │               │                     │
                 ▼               ▼                     ▼
         LOC_CHANCEOF-   LOC_DEGREEOF-           Reaction 76
         MUTATION        MUTATION                (gated by Injury,
         (thr 70,        (thr 70,                 Stress is catalyst):
          gain 38)       gain 54)                 Prostaglandin → Fatty Acid
         Stressed Norns evolve faster            Wounded + stressed Norns
         and with bigger mutations                burn fat faster

   Stress is the chronic drive-crisis hormone:
     - Produced only via a 2-stage gene-defined cascade from the 9 hot drives
     - Consumed only by mutation-rate receptors + catalytic lipolysis
     - Long half-life (2481 ticks) — sticks around long after causes subside
     - Upstream of the evolutionary pressure on the genome
     - Distinct from Pain (drive) and Injury (damage accumulator)
```

## Key Source References

- `ChemicalNames.catalogue:190` — the string `"Stress"` as the 128th entry in the chemical-names table
- `LOC_FLOATING_FIRST..LAST` and `NUM_FLOATING_LOCI` — the 32 bidirectional loci on which the two-stage cascade runs
- `LOC_DRIVE0..LOC_DRIVE19` — drive loci whose emitters can "produce a 'stress' chemical whenever certain drives exceed a threshold"
- `GetLocusAddress()` — floating loci are bidirectional (same pointer for receptor and emitter), the mechanism the cascade relies on
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptors **155-163** — Stage-1 receptors reading drive chemicals (Anger, Pain, Fear, Crowded, Sleepiness, Hunger-{C,P,F}, Tiredness) onto floating loci 5-13
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitters **34-42** — Stage-1 emitters producing the nine per-cause Stress chemicals (187-195) from floating loci 5-13
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptors **146-154** — Stage-2 receptors reading the per-cause Stress chemicals onto floating loci 14-22
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitters **25-33** — Stage-2 emitters producing aggregate Stress (128) from floating loci 14-22
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptors **122, 123** — the two consumers: `LOC_CHANCEOFMUTATION` and `LOC_DEGREEOFMUTATION` on the Reproductive tissue, threshold 70
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reaction **76** (gene 98) — `1x Stress + 1x Prostaglandin → 1x Stress + 1x Fatty Acid`, the stress-induced lipolysis pathway
- `DOCUMENTATION/CreaturesData/biochemistry.json:8608-8615` — Stress's halflives entry: genome byte 79, `halfLifeInTicks = 2481`, `decayRate ≈ 0.99972`, speed "Long"
- `DOCUMENTATION/CreaturesData/biochemistry.json:9040-9111` — halflives for the nine per-cause Stress chemicals 187-195 (311 ticks for most, 621 for Stress (H4C))
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress constant (the chemical is handled by the generic biochemistry engine)
