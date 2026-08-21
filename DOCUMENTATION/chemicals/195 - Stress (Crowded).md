# 195 - Stress (Crowded)

**Stress (Crowded)** is the per-cause Stress chemical that records *unmet need for personal space — the experience of being surrounded by too many other Creatures for too long as a chronic source of suffering*. It is the dedicated bloodstream marker that says "this Norn has been crowded long enough that the body is now treating proximity to peers as a stressor". Chemical 195 occupies slot **195** of the 256-entry chemical table (`Assets/Catalogue/ChemicalNames.catalogue:271`), and is the **ninth and last** of the **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 195 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Crowded (157)            ──[receptor 158, threshold 230]──▶  Circulatory locus 10
       Circulatory locus 10    ──[emitter 37, rate 14, gain 6]──▶  Stress (Crowded) [195]
       Stress (Crowded) [195]  ──[receptor 146, threshold 128]──▶  Circulatory locus 22
       Circulatory locus 22    ──[emitter 25, rate 24, gain 5]──▶ Stress [128]
```

Only when the **Crowded drive climbs above 230/255** — the highest Stage-1 gate in the entire nine-fold per-cause Stress system — does the receptor fire and Stress (Crowded) start accumulating. Once present, Stress (Crowded) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **311-tick half-life** ("Medium" band). Like Stress (H4P) (188), Stress (H4F) (189), Stress (Anger) (190), Stress (Fear) (191), Stress (Pain) (192), Stress (Sleep) (193), and Stress (Tired) (194), Stress (Crowded) decays at the standard rate shared by seven of the nine per-cause Stresses (188-195 except 187): crowded stress leaves the body's stress memory at the same speed as the hungers, pain, sleep, anger, fear, and tiredness.

What sets Stress (Crowded) apart from its eight siblings is the combination of its **uniquely high Stage-1 threshold (230)** — the body is the most reluctant to acknowledge crowding as a chronic stressor — and its **baseline Stage-2 gain of 5**, the lowest tier of contribution to aggregate Stress. The Stage-1 receptor (id 158, gene 54) latches at Crowded ≥ 230, **16 units above** the hunger/sleep/anger gates (214), **26 units above** Fear and Tired (204), and **39 units above** Pain (191). Crowded therefore registers as a chronic stressor only at a *severe* level of severity — substantially later than every other cascade in the per-cause Stress system. The Stage-2 emitter (id 25, gene 31) that converts elevated Stress (Crowded) into aggregate Stress (128) fires at gain **5** — the same baseline tier as the three hungers, Sleep, and Tired, and far below Pain (8), Fear (14), and Anger (20). Crowding is, by genome design, *the most reluctantly recognised* of all stressors but *individually mild* in its contribution to aggregate Stress per tick.

Chemical 195 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "this Norn has been heavily surrounded by others recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 10** — the Stage-1 Crowded cascade | Emitter gene **21** (`biochemistry.json`, emitter id 37) | Creature / Circulatory / Locus 10 | `chemical=195, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 10 is driven up to 255 by receptor id 158 (gene 54) which reads chemical **157 Crowded** with threshold **230** (DIGITAL, gain 255). When the Norn's Crowded drive exceeds 230/255, locus 10 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (Crowded) per firing | ~6 units per 14-tick window while Crowded ≥ 230 |
| 2 | **Indirect cross-firing via locus 10** | Tiredness receptor (id 163, gene 45, threshold 204) also drives locus 10 | Creature / Circulatory / Locus 10 | Locus 10 is **shared** between the Crowded Stage-1 receptor and the Tiredness Stage-1 receptor. Whenever **Tiredness ≥ 204** latches locus 10 to 255, emitter 37 also fires — producing Stress (Crowded) even on a non-crowded but exhausted Norn. This is a structural quirk of the bidirectional-locus design (see `GetLocusAddress()`) | Same ~6 units per 14-tick window while Tiredness ≥ 204 |
| 3 | Direct `CHEM 195 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 195 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push aggregate Stress at the Crowded-cascade weight without actually crowding the Norn | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 195. The Stage-1 emitter (id 37) is the only natural source. The genome's locus-sharing means Stress (Crowded) and Stress (Tired) are partially **entangled** — see *Locus 10 sharing* below — but the emitter is uniquely keyed to chemical 195. The Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (Crowded), so a crowded baby Norn will not contribute crowding pressure to its mutation rate.

Chemical 195 has **no `initialConcentrations` entry** — every Creature is born with Stress (Crowded) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **79** (receptor id 146) | Creature / Circulatory / Locus 22 | `chemical=195, threshold=128, nominal=0, gain=255, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (Crowded) climbs above 128/255, this receptor latches Circulatory locus 22 to ~255/255 | Locus 22 in turn drives emitter id 25 (gene 31) which produces aggregate **Stress (128)** at rate 24, **gain 5** — the baseline per-cause gain shared by six of the nine cascades. Crowded stress above 128 contributes a mild flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry::GetChemical(195)` | Creature / bloodstream (systemic) | Chemical 195 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (Crowded)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from being surrounded?" becomes a first-class observable, useful for diagnosing population-density problems, social pathologies, metaroom over-population, brain-state issues that interfere with social tolerance, or mod-induced drives that affect proximity perception |
| 3 | **Passive decay** | Halflives byte 195 = **58** | Bloodstream (systemic) | `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, "Medium" decay band. Multiplies Stress (Crowded) by ~0.99777 every biochem tick | A Stress (Crowded) spike halves in ~311 ticks. This matches seven of the eight other per-cause Stress chemicals — only Stress (H4C) (621 ticks) lingers longer. Crowded stress is "remembered" for the standard duration |

There are no reactions, no other receptors, and no consumers that read chemical 195. The Stage-2 receptor (id 146) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 195 is the final node in the genome's nine-fold per-cause Stress system, paired one-to-one with the Crowded drive:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| Hunger for carbohydrate | 150 | 162 → locus 5 (thr 214) | 41 (rate 14, gain 6) | 187 Stress (H4C) | 154 → locus 14 (thr 128) | 33 (rate 24, gain 5) |
| Hunger for protein | 149 | 161 → locus 6 (thr 214) | 40 (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| Hunger for fat | 151 | 160 → locus 7 (thr 214) | 39 (rate 14, gain 6) | 189 Stress (H4F) | 152 → locus 16 (thr 128) | 31 (rate 24, gain 5) |
| Anger | 160 | 155 → locus 13 (thr 214) | 34 (rate 14, gain 6) | 190 Stress (Anger) | 151 → locus 17 (thr 128) | 30 (rate 24, gain 20) |
| Fear | 158 | 157 → locus 11 (thr 204) | 36 (rate 14, gain 6) | 191 Stress (Fear) | 150 → locus 18 (thr 128) | 29 (rate 24, gain 14) |
| Pain | 148 | 156 → locus 12 (thr 191) | 35 (rate 14, gain 6) | 192 Stress (Pain) | 149 → locus 19 (thr 128) | 28 (rate 24, gain 8) |
| Sleepiness | 155 | 159 → locus 9 (thr 214) | 38 (rate 14, gain 6) | 193 Stress (Sleep) | 147 → locus 21 (thr 128) | 26 (rate 24, gain 5) |
| Tiredness | 154 | 163 → locus 10 (thr 204) | 42 (rate 14, gain 6) | 194 Stress (Tired) | 148 → locus 20 (thr 128) | 27 (rate 24, gain 5) |
| **Crowded** | **157** | **158 → locus 10** (thr 230) | **37 (rate 14, gain 6)** | **195 Stress (Crowded)** | **146 → locus 22 (thr 128)** | **25 (rate 24, gain 5)** |

Stress (Crowded) sits as the **ninth and last** entry of this table because chemical 195 is the final per-cause Stress slot. Functionally it occupies the *most-reluctant-to-trigger* position:

1. **Standard half-life (311 ticks)** — the same as six of the other seven per-cause Stresses. Crowded stress decays at the baseline rate; only carb-hunger stress (H4C) lingers ~2× as long. The "memory" of being crowded is therefore short — within a few minutes of the Norn finally finding personal space, Stress (Crowded) is back below the Stage-2 threshold.
2. **Highest distress threshold (230)** — crowded stress kicks in *later than every other cause*. The genome encodes "ordinary social proximity is not a stressor; only persistent, severe over-crowding counts". This puts Crowded in its own bracket, the highest gate in the entire system, reflecting the genome's view that Norns are normally a social species and routine company should not produce chronic stress.
3. **Baseline Stage-2 gain (5)** — Stress (Crowded) contributes the same per-source weight to aggregate Stress (128) as any of the three hungers, Sleep, or Tired. Crowded is among the quietest voices in the Stress chorus — alongside the other physiological-need cascades, and far below the three damage/psychological cascades (Pain 8, Fear 14, Anger 20).

### Why crowding has the highest Stage-1 threshold

The genome's Stage-1 threshold ladder is **191 (pain) → 204 (fear, tired) → 214 (hungers, sleep, anger) → 230 (crowded)**. Crowded sits alone on the highest tier — *39 units above Pain, 26 units above Fear and Tired, 16 units above the hungers, sleep, and anger*. Three reasons this is consistent with the rest of the C3 chemistry:

1. **Norns are designed to be social.** The genome treats casual social presence as positive (Loneliness drive falls when other Norns are nearby) and only registers crowding as harmful at very high densities. The Crowded Stage-2 receptor on `LOC_CROWDEDNESS` (locus 5) doesn't fire until Crowded crosses 230 either — meaning the *behavioural* response to crowding (avoiding others, withdrawing) only kicks in at the same severe level. Treating crowding as a chronic stressor at any lower threshold would conflict with the genome's design intent of a sociable species.
2. **The Crowded drive itself is naturally regulated by Loneliness.** Reaction 4 (`1x Crowded + 1x Loneliness → (nothing)`, rate ~311 ticks) actively cancels Crowded against Loneliness in the bloodstream. The two drives mutually consume each other, so a Norn surrounded by some peers but missing others typically settles at a moderate Crowded value. Only when the Norn is heavily surrounded *and* has no missing peers (no Loneliness pressure) does Crowded climb steeply enough to cross 230. The high Stage-1 gate matches the rarity of this situation.
3. **The Stage-2 weight is the lowest tier.** With gain 5 — at the bottom of the per-cause weight ladder — the cascade does not over-amplify crowding into a dominant mutation driver. Even if the gate is rarely crossed, when it is, the contribution is mild. The genome encodes "severe crowding is genuinely bad, but not as evolutionarily corrosive as chronic pain, fear, or anger".

The combination of "highest threshold (230)" and "lowest weight (5)" gives Crowded a distinctive profile: it is **the least likely cascade to fire at all**, but its individual contribution to aggregate Stress, when it does fire, is mild. In a complex distress event, Stress (Crowded) typically rises *last* (if at all), and contributes a small share to the aggregate.

### Locus 10 sharing — the Tired/Crowded entanglement

Stress (Crowded) is unusual among the per-cause Stresses in that **its Stage-1 cascade shares its latching locus (Circulatory locus 10) with the Tired cascade**. Each of the other seven per-cause Stresses has its own dedicated Stage-1 locus (5, 6, 7, 9, 11, 12, 13). The Crowded receptor (id 158, gene 54) and the Tiredness receptor (id 163, gene 45) both write to locus 10, and both Stage-1 emitters (id 37 → chemical 195, id 42 → chemical 194) read from locus 10.

The consequence of this design is direct: **whenever locus 10 is latched — regardless of which receptor latched it — both emitters fire, producing both Stress (Tired) and Stress (Crowded) simultaneously**. Concretely:

- A heavily exhausted Norn with Tiredness ≥ 204 will accumulate Stress (Crowded) even if it is alone in a room.
- A heavily crowded Norn with Crowded ≥ 230 will accumulate Stress (Tired) even if it has been resting all day.
- A Norn with both moderate exhaustion (e.g. Tiredness 220) and moderate crowding (e.g. Crowded 200) will *fire neither* — both must individually fall below their separate Stage-1 receptor thresholds, but only one needs to cross to latch the locus. Whichever crosses first activates both emitters until *both* drives fall below their thresholds.

This means the per-cause distinction between chemicals 194 and 195 is partly **leaky** in C3. Diagnosing a Norn solely from "Stress (Crowded) is elevated" is unreliable — the actual cause may be exhaustion, not crowding. To disambiguate, the Health Kit observer must read the source drives (Crowded 157 and Tiredness 154) directly, or compare both per-cause Stresses together and cross-reference against the drive levels.

The locus sharing is enabled by the *bidirectional* nature of floating loci 0-31 (`LOC_FLOATING_FIRST..LAST`): the same memory address is used both as the receptor's write target and as the emitter's read source. There is nothing in the engine preventing multiple receptors and emitters from binding to the same floating locus — and the C3 genome takes advantage of this for the Tired/Crowded pair. Whether this is intentional design (the genome treating exhaustion-or-crowding as a unified "physical-state stress" signal) or a genome implementation oversight is unclear from the data alone, but the resulting behaviour is unambiguous: *the two chemicals rise and fall together whenever locus 10 latches*.

A modder wishing to fully separate the two cascades can edit the genome to point either the Crowded Stage-1 receptor or the Tiredness Stage-1 receptor (or both) to a different floating locus. Locus 8 is unused in the standard genome and would be a natural target.

### Why have Stress (Crowded) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Crowded → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 195 in three concrete ways:

1. **Per-cause readability.** Because Stress (Crowded) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn crowd-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a population-density problem in a metaroom can see at a glance whether the colony's Stress comes from social problems (Anger / Crowded / Fear elevated) versus food shortage (H4C / H4P / H4F elevated) versus injury (Pain elevated) versus rest-cycle disruption (Sleep / Tired elevated). Stress (Crowded) elevated alone (or co-elevated with the Crowded drive itself) is the signature of an over-populated metaroom — caveat the locus 10 sharing with Tired.
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Stress (Crowded) takes the standard 311-tick half-life, but a modder could lengthen it to model lingering social anxiety or shorten it to model rapid recovery from social over-exposure.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains. The Crowded path uses gain **5** — baseline tier — making chemical 195 a mild contributor to aggregate Stress (128). A Norn that is *only* over-crowded accumulates Stress (128) at the same modest rate as a Norn that is *only* hungry, and far slower than one in pain, fear, or anger.

### Stress (Crowded) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 146, threshold 128) is digital, Stress (Crowded) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the Crowded path. Above it, the Stage-2 emitter (id 25) fires at a fixed rate of 24 with **gain 5**, regardless of *how far above* 128 the Stress (Crowded) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether Stress (Crowded) is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of crowded stress** between roughly 0 and 128 where Stress (Crowded) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly enters a crowded room, then leaves, then resets the drive may register a small rise and fall in Stress (Crowded) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained over-crowding, where Crowded sits above 230 for an extended period, is required to push Stress (Crowded) past 128 and start contributing to evolutionary pressure.

The combination of "highest Stage-1 threshold (230)" and "lowest Stage-2 gain (5)" gives Crowded the most-recessed profile of any per-cause Stress: it is *the hardest to trigger* (highest gate at the input) and *the mildest once triggered* (low weight at the output). Compare with Pain, which is easy to trigger (gate 191) and moderate (weight 8); with Anger, which has a mid gate (214) but produces *4× the aggregate Stress per tick* (weight 20); and with Fear (gate 204, weight 14) which sits at the high end of the contribution ladder. Crowded is firmly in the "uncommon physiological state that becomes a stressor only at extreme persistence, and contributes mildly even then" category.

### How Stress (Crowded) propagates to the consumers of Stress (128)

Once Stress (Crowded) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time over-crowded conceive more-mutated offspring — but because Crowded's Stage-2 weight is only 5, this contribution is mild relative to the upper-tier cascades. Over-crowded lineages drift mutation pressure upward, but slowly. In an over-populated metaroom this slow drift is partially offset by the fact that babies are still in the *Baby* life stage, before the cascade switches on, so the next generation only inherits over-crowding pressure once it itself is being over-crowded after Youth onset.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert Prostaglandin into Fatty Acid. Stress (Crowded) contributes to this only via its Stage-2 path; an uninjured but over-crowded Norn whose only Stress source is the Crowded cascade does not actually trigger reaction 76 (which is also gated by Injury). The Crowded cascade's contribution to Stress-induced lipolysis is therefore primarily relevant in *combined* injury-plus-over-crowding scenarios.

Importantly, neither of these consumers reads chemical 195 *directly*. Stress (Crowded) influences them only through Stage 2 of the cascade.

### Stress (Crowded) vs. Crowded drive (157) vs. Loneliness drive (156)

These signals form the social-proximity stack but measure different things on different timescales:

- **Crowded (157)** is the *drive* — the brain's read of "I am surrounded by too many other Creatures". Rises with social proximity (driven by sensorimotor input that registers nearby creatures) and falls via the Loneliness-cancellation reaction (`1x Crowded + 1x Loneliness → (nothing)`, rate ~311 ticks). Modulates the brain's instincts to withdraw, avoid others, and seek personal space. This is a real-time signal — the Norn responds within seconds to changes in local population density.
- **Loneliness (156)** is the *opposite drive* — "I am missing other Creatures' company". Rises with social isolation, falls via the same cancellation reaction. The two drives form a balanced pair: a Norn surrounded by some peers but missing others settles at moderate Crowded and moderate Loneliness; a Norn alone in a vast metaroom has high Loneliness and zero Crowded; a Norn deep in a herd of fifty Norns has high Crowded and zero Loneliness.
- **Stress (Crowded) (195)** is the *chronic-suffering marker* for unmet personal-space needs. Only rises when the *Crowded drive* has been above 230 for long enough that the Stage-1 emitter has accumulated chemical 195 in the bloodstream — *or* when the *Tiredness drive* has been above 204 long enough to latch the shared locus 10. Decays at the standard 311 ticks. This is an "I have been heavily surrounded for a noticeable time" memory, used only for upstream long-term effects.
- **Aggregate Stress (128)** is the body-wide stress state — the sum across all nine cause paths. Elevated Stress (Crowded) is *one* of the contributors, but a non-crowded Norn can have elevated Stress (128) from any of the other eight causes; conversely, a briefly-crowded Norn whose Stress (Crowded) never crosses 128 contributes nothing.

A useful mental model: **Crowded is the "I am surrounded" alarm; Stress (Crowded) is the "I have been deeply surrounded for too long" diary entry; aggregate Stress is the "this Norn is in poor shape" verdict drawn from all nine diary entries together — and the crowded entry, like the hunger and rest entries, is written in the smallest letters of the per-cause Stress family, and only ever written at all under the most severe sustained density**.

### Stress (Crowded) and the social-density cycle

Of all the per-cause Stresses, Stress (Crowded) is the one most tightly bound to the population-density of the Norn's environment. In a normally-functioning Norn living in a normally-populated environment:

- Crowded rises with proximity to other Creatures, and falls via Loneliness-cancellation in the bloodstream.
- The Norn moves away from peers if Crowded climbs uncomfortably high, and toward peers if Loneliness climbs uncomfortably high — a behavioural feedback loop that keeps both drives near the middle of their range.
- Crowded never sustains above 230 for long enough that the Stage-1 emitter accumulates meaningful Stress (Crowded).
- Stress (Crowded) therefore stays near 0 throughout the lifetime — invisible in the Kits, contributing nothing to mutation pressure.

When this cycle breaks — because the metaroom is over-populated and the Norn cannot move away from the herd, because brain pathology overrides the avoidance instinct, because mod content removes the ability to cancel Crowded against Loneliness, or because a hostile crowd of agents physically encloses the Norn — Crowded ramps past 230 and stays there, and Stress (Crowded) begins to accumulate. Elevated Stress (Crowded) is therefore the unambiguous biochemical signature of a Norn whose social-proximity cycle has been broken for an extended period — *with the caveat that the locus 10 sharing means severe exhaustion can also trigger Stress (Crowded) production*, and so the source drive Crowded must be cross-referenced for accurate diagnosis.

### Comparison with Stress (Tired) — the locus-10 partner

Stress (Crowded) and Stress (Tired) are paired in the per-cause Stress system not only by sharing Circulatory locus 10 but also by having the same baseline weight (5) and half-life (311). They differ only in Stage-1 threshold:

| Aspect | Stress (Crowded) [195] | Stress (Tired) [194] |
|--------|------------------------|----------------------|
| Source drive | Crowded (157) | Tiredness (154) |
| Stage-1 threshold | **230** (highest of all 9 cascades) | 204 (matches Fear) |
| Stage-1 receptor id | 158 (gene 54) | 163 (gene 45) |
| Stage-1 emitter id | 37 (gene 21) | 42 (gene 9) |
| Stage-1 latching locus | **Locus 10 (shared)** | **Locus 10 (shared)** |
| Stage-2 receptor → locus | 146 → locus 22 | 148 → locus 20 |
| Stage-2 gain | 5 | 5 |
| Half-life | 311 ticks | 311 ticks |
| Triggering condition | Sustained severe over-crowding | Sustained physical exhaustion |

The locus-10 entanglement means these two cascades are partially co-firing in practice. The genome encodes "physical-state distress (whether from exhaustion or from crowding) is a single category for Stage-1 latching purposes" — though each cascade does have its own dedicated emitter and produces its own dedicated chemical, so the per-cause chemical readout is still nominally separable. The high Crowded gate (230) in particular makes the "pure crowded" path rarely fire on its own; in practice, much of the Stress (Crowded) seen in a colony arises from Tiredness latching locus 10, not from the Crowded drive itself.

### Comparison with the other "baseline-weight" per-cause Stresses

Stress (Crowded) shares the baseline Stage-2 gain of 5 with five other cascades:

- **Stress (H4C / H4P / H4F) — gain 5 each.** The three hunger Stresses. These differ from Crowded in their lower Stage-1 thresholds (214) and (for H4C) in their longer half-life (621 vs 311 ticks). Hunger and crowding are encoded as comparable mild physiological stressors, but hunger fires earlier.
- **Stress (Sleep) — gain 5.** Sleep cascade with Stage-1 gate 214. Crowded fires later.
- **Stress (Tired) — gain 5.** Tired cascade with Stage-1 gate 204 — and shares Crowded's Stage-1 latching locus (10). See above.
- **Stress (Crowded) — gain 5.** The topic of this document — the highest Stage-1 gate (230).

Read together: the genome treats the *physiological-need* Stresses as equally weighted at the bottom of the per-cause hierarchy, distinguishing between them mainly via their Stage-1 thresholds (how quickly the drive triggers the cascade). Crowded sits at the *highest-threshold* end of this baseline tier — the cascade most reluctant to fire at all.

### JS port notes

The Rebuild port treats chemical 195 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_CROWDED` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (Crowded)"` appears only in `ChemicalNames.catalogue`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (Crowded) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). Three additional points specific to chemical 195:

- **The Stage-1 threshold of 230 is genome data, not engine-level magic.** The biochemistry tick loop must read the per-receptor threshold field from receptor id 158 rather than hard-coding "Crowded stress triggers at 90%". Mods that retune the per-cause sensitivities — for example, lowering the crowded gate to 191 to model an "introvert" lineage, or raising it to 250 to model a "highly-social" species — must be picked up automatically; baking the 191:204:214:230 threshold ladder into engine code would defeat the genome-driven design.
- **The locus 10 sharing must be preserved.** The port must not treat each per-cause cascade as having an isolated latching locus — emitters 37 and 42 both read locus 10, and the same is true for any other floating-locus collision the genome happens to encode. Implementations that pre-bake "one Stage-1 latching locus per cascade" will produce a port where Stress (Tired) and Stress (Crowded) decouple, breaking the C3 chemistry's behaviour and creating a faithfulness regression. The bidirectional-locus mechanism in `Creature::GetLocusAddress()` is the canonical reference.
- **The Stage-1 receptor reads chemical 157 (Crowded), not 156 (Loneliness).** The two related drives sit in adjacent chemical slots and have a balancing reaction (reaction 4, `Crowded + Loneliness → (nothing)`), but only Crowded has a Stress cascade. Loneliness has *no* per-cause Stress chemical — the genome encodes that being alone is tolerable but being heavily surrounded is not. Implementations that wire the cascades by chemical name rather than by chemical id must use the catalogue index 157 for the Crowded path, and the corresponding Stage-1 receptor id 158 / Stage-1 emitter id 37 / Stage-2 receptor id 146 / Stage-2 emitter id 25.

### Practical consequences for gameplay

- **Stress (Crowded) is the rarest of the per-cause Stresses in healthy colonies.** Because Crowded is normally cancelled against Loneliness, and the Stage-1 gate is exceptionally high (230), most Norns living in normally-populated environments never see Stress (Crowded) elevated at all. Sustained elevation is therefore an extremely strong signal of an over-population problem.
- **Causes of elevated Stress (Crowded).** Common scenarios include: an over-populated metaroom (more than ~10-15 Norns in a single room); a hostile herd of agents (e.g. Grendels surrounding a Norn); brain pathology that drives towards the herd despite the avoidance instinct; chronic exhaustion (Tiredness ≥ 204), which spuriously triggers chemical 195 production via the locus 10 sharing without the Norn actually being crowded; mod content that suppresses the avoidance instinct or removes the Loneliness-cancellation reaction.
- **Diagnosing crowded stress in the Kits.** A Norn whose Stress (Crowded) graph is rising while Crowded drive (157) is *also* high is in an active over-crowding state. A Norn with elevated Stress (Crowded) but *zero* Crowded drive is most likely suffering from sustained Tiredness — the locus 10 sharing has triggered the cascade without the social cause. Cross-referencing the source drives is essential. Elevated Stress (Crowded) co-occurring with elevated Stress (Tired) is the most likely scenario in practice, because the shared locus 10 means both chemicals usually rise together.
- **Over-populated metaroom colonies show a characteristic Stress (Crowded) signature.** A Norn population in a metaroom with insufficient spawn distribution, or one being repeatedly herded by aggressive agents, will show sustained elevated Stress (Crowded) baselines with elevated Crowded drive — distinguishable from the Tired-induced false positive by the drive readout. This is the unambiguous biochemical signature of a *population-density problem* rather than an exhaustion, food, injury, or social-conflict problem.
- **Injecting Stress (Crowded) is one of the gentlest mod levers for aggregate Stress.** `CHEM 195 150` raises Stress (Crowded) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) at gain 5 for the next ~310 ticks without actually crowding the Norn. This is one of the mildest per-cause injection options — useful for testing the mutation pathway in isolation when Pain (gain 8), Fear (gain 14), or Anger (gain 20) injections would be too strong. Hunger, Sleep, and Tired injections produce similar gentle pushes.
- **Resolving crowded stress is straightforward.** Letting the Norn finally find personal space — by removing or moving peers, by spawning a Loneliness chemical bolus to neutralize Crowded via the cancellation reaction, or by directly setting Crowded to zero — drops the drive below 230 and halts Stage-1 production *for this cascade*. Existing Stress (Crowded) decays at standard rate, falling below the Stage-2 threshold of 128 within ~310 ticks. *However*, if Tiredness is also elevated, locus 10 may stay latched and Stress (Crowded) will continue accumulating despite the social fix — a counterintuitive effect of the locus-sharing design that breeders should be aware of.
- **Crowded stress is one of the quietest cascades in the chorus.** Even sustained, chronic Stress (Crowded) above 128 contributes only gain 5 to aggregate Stress per Stage-2 tick. A Norn whose only stress source is over-crowding drifts mutation pressure upward at the slowest rate — alongside pure-hunger, pure-sleeplessness, pure-exhaustion scenarios. Significant evolutionary pressure from crowding alone requires very long-term, very chronic herd life; the genome is configured to treat severe over-crowding as a real but mild evolutionary signal, recognised reluctantly later than every other cause and contributing the same modest weight as the rest of the bottom tier.

### Summary

```
   Crowded (157) — the brain's "I am surrounded by too many peers" drive
                       │  (rises with proximity to other Creatures via Sensorimotor input,
                       │   falls via reaction 4: Crowded + Loneliness → nothing)
                       ▼  (bloodstream chemical, drive locus 9 of Drives)
          Receptor 158 (gene 54, DIGITAL, threshold 230 — HIGHEST GATE OF ALL)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 10 (floating, latched ~255)
                       │   (SHARED with Tiredness receptor, threshold 204 — both
                       │    cascades latch the same locus, partial entanglement)
          Emitter 37 (gene 21, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                  STRESS (Crowded) [195]
        - No initial concentration (starts at 0)
        - Half-life = 311 ticks ("Medium", standard per-cause Stress rate)
        - Genome halflives byte = 58
                       │
                       ▼
          Receptor 146 (gene 79, DIGITAL, threshold 128, gain 255)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 22 (floating, latched ~255)
                       │
          Emitter 25 (gene 31, DIGITAL, rate 24, GAIN 5 — baseline tier)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst — Crowded contributes only
                                in injury+crowding combined scenarios)

   Stress (Crowded) is the chronic over-crowding marker:
     - Produced when Crowded ≥ 230 sustains long enough
     - Also produced incidentally when Tiredness ≥ 204 (shared locus 10)
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Decays at the standard 311-tick half-life
     - BASELINE per-cause Stage-2 gain (5, shared with H4C/H4P/H4F/Sleep/Tired)
     - The mildest tier of contributor to aggregate Stress
     - HIGHEST Stage-1 gate (230) of any cascade — fires last, fires least
     - Most often co-elevated with Stress (Tired) due to locus 10 sharing
     - The signature stress chemical of over-populated metarooms
     - The ninth and final per-cause Stress chemical
```

## Key Source References

- `Assets/Catalogue/ChemicalNames.catalogue:271` — the string `"Stress (Crowded)"` as the 195th entry (zero-indexed slot 195) in the chemical-names table
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **158** (gene 54) — Stage-1 receptor reading **Crowded (157)** ≥ 230 onto Circulatory locus 10
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **163** (gene 45) — Tiredness Stage-1 receptor *also* reading Tiredness ≥ 204 onto the same Circulatory locus 10 (the source of the entanglement)
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **37** (gene 21) — Stage-1 emitter on Circulatory locus 10 producing **Stress (Crowded) (195)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **42** (gene 9) — Stage-1 emitter on Circulatory locus 10 producing **Stress (Tired) (194)** at the same rate, also reading from locus 10 (the co-firing partner)
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **146** (gene 79) — Stage-2 receptor reading **Stress (Crowded) (195)** ≥ 128 onto Circulatory locus 22
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **25** (gene 31) — Stage-2 emitter on Circulatory locus 22 producing aggregate **Stress (128)** at rate 24, **gain 5** (the baseline per-cause Stage-2 gain shared by six of the nine cascades)
- `DOCUMENTATION/CreaturesData/biochemistry.json` — Stress (Crowded)'s halflives entry: genome byte 58, `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, speed "Medium"
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reaction 4 — `Crowded + Loneliness → (nothing)`, the cancellation reaction that normally keeps the Crowded drive in check
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reactions 38 and 60 — `Crowded backup → Crowded` and `Crowded → Crowded backup`, the standard backup-pair mechanism for the Crowded drive
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reaction 76 — `Stress + Prostaglandin → Stress + Fatty Acid` (gated by Injury), the consumer of aggregate Stress that Crowded stress contributes to indirectly
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/187 - Stress (H4C).md` — sibling doc on the carb-hunger per-cause Stress, with the contrasting 621-tick half-life
- `DOCUMENTATION/chemicals/188 - Stress (H4P).md` — sibling doc on the protein-hunger per-cause Stress
- `DOCUMENTATION/chemicals/189 - Stress (H4F).md` — sibling doc on the fat-hunger per-cause Stress
- `DOCUMENTATION/chemicals/190 - Stress (Anger).md` — sibling doc on the anger per-cause Stress, with the highest Stage-2 gain (20)
- `DOCUMENTATION/chemicals/191 - Stress (Fear).md` — sibling doc on the fear per-cause Stress, gain 14
- `DOCUMENTATION/chemicals/192 - Stress (Pain).md` — sibling doc on the pain per-cause Stress, gain 8 with the lowest Stage-1 gate (191)
- `DOCUMENTATION/chemicals/193 - Stress (Sleep).md` — sibling doc on the sleep per-cause Stress, gate 214
- `DOCUMENTATION/chemicals/194 - Stress (Tired).md` — sibling doc on the tired per-cause Stress — the locus-10 partner with which Stress (Crowded) is entangled
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (Crowded) constant (the chemical is handled by the generic biochemistry engine)
