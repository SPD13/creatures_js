# 193 - Stress (Sleep)

**Stress (Sleep)** is the per-cause Stress chemical that records *unmet need for sleep as a chronic source of suffering*. It is the dedicated bloodstream marker that says "this Norn has been tired-and-unable-to-rest long enough that the body is treating sleeplessness as a stressor". Chemical 193 occupies slot **193** of the 256-entry chemical table (`ChemicalNames.catalogue`), the seventh of the nine **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 193 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Sleepiness (155)        ──[receptor 159, threshold 214]──▶  Circulatory locus 9
       Circulatory locus 9     ──[emitter 38, rate 14, gain 6]──▶  Stress (Sleep) [193]
       Stress (Sleep) [193]    ──[receptor 147, threshold 128]──▶  Circulatory locus 21
       Circulatory locus 21    ──[emitter 26, rate 24, gain 5]──▶ Stress [128]
```

Only when the **Sleepiness drive climbs above 214/255** — the standard "physiological need" Stage-1 gate shared with the three hunger drives and Anger — does the receptor fire and Stress (Sleep) start accumulating. Once present, Stress (Sleep) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **311-tick half-life** ("Medium" band). Like its hunger siblings Stress (H4P) (chemical 188) and Stress (H4F) (chemical 189), and like Stress (Pain) (192), Stress (Anger) (190), Stress (Fear) (191), Stress (Tired) (194), and Stress (Crowded) (195), Stress (Sleep) decays at the standard rate shared by seven of the nine per-cause Stresses (188-195 except 187): sleep stress leaves the body's stress memory at the same speed as fat hunger, protein hunger, pain, tiredness, crowding, anger, and fear.

What sets Stress (Sleep) apart from its eight siblings is its **baseline Stage-2 gain of 5**, the lowest tier shared with the three hungers and the Tired and Crowded paths. The Stage-1 receptor (id 159) latches at Sleepiness ≥ 214, **23 units higher** than Pain's gate (191) and **10 units higher** than Fear's gate (204) or Tired's gate (204) — sleeplessness must be quite severe before the cascade fires. The Stage-2 emitter (id 26) that converts elevated Stress (Sleep) into aggregate Stress (128) fires at gain **5** — **38% the weight of Stress (Pain)'s 8**, **36% of Fear's 14**, and **25% of Anger's 20**. Sleep is, by genome design, one of the *weakest* contributors to aggregate Stress per tick of cause-time, alongside the three hungers and the Tired and Crowded cascades. The genome treats unmet sleep need as a real but mild form of chronic suffering — comparable to mild hunger or feeling crowded, and far less corrosive than pain, fear, or anger.

Chemical 193 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "this Norn has been unable to sleep recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 9** — the Stage-1 Sleepiness cascade | Emitter gene **20** (`biochemistry.json`, emitter id 38) | Creature / Circulatory / Locus 9 | `chemical=193, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 9 is driven up to 255 by receptor id 159 (gene 46) which reads chemical **155 Sleepiness** with threshold **214** (DIGITAL, gain 255). When the Norn's Sleepiness exceeds 214/255, locus 9 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (Sleep) per firing | ~6 units per 14-tick window while Sleepiness ≥ 214 |
| 2 | Direct `CHEM 193 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 193 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push aggregate Stress at the Sleep-cascade weight without actually keeping the Norn awake | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 193. The single Stage-1 emitter (id 38) is the only natural source, and it is gated entirely by the Sleepiness drive via receptor 159. The Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (Sleep), so a sleep-deprived baby Norn will not contribute sleep pressure to its mutation rate, even though Sleepiness itself is one of the most active drives in baby life as Norns burn through energy and need frequent naps.

Chemical 193 has **no `initialConcentrations` entry** — every Creature is born with Stress (Sleep) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **78** (receptor id 147) | Creature / Circulatory / Locus 21 | `chemical=193, threshold=128, nominal=0, gain=255, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (Sleep) climbs above 128/255, this receptor latches Circulatory locus 21 to ~255/255 | Locus 21 in turn drives emitter id 26 (gene 33) which produces aggregate **Stress (128)** at rate 24, **gain 5** — the baseline per-cause gain shared by six of the nine cascades. Sleep stress above 128 contributes a mild flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry::GetChemical(193)` | Creature / bloodstream (systemic) | Chemical 193 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (Sleep)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from unmet sleep need?" becomes a first-class observable, useful for diagnosing sleep-cycle disruption, environmental over-stimulation that prevents resting, brain-state pathologies that suppress the sleep instinct, or mod-induced drives that interfere with the rest cycle |
| 3 | **Passive decay** | Halflives byte 193 = **58** | Bloodstream (systemic) | `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, "Medium" decay band. Multiplies Stress (Sleep) by ~0.99777 every biochem tick | A Stress (Sleep) spike halves in ~311 ticks. This matches seven of the eight other per-cause Stress chemicals — only Stress (H4C) (621 ticks) lingers longer. Sleep stress is "remembered" for the standard duration |

There are no reactions, no other receptors, and no consumers that read chemical 193. The Stage-2 receptor (id 147) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 193 is one node in the genome's nine-fold per-cause Stress system, paired one-to-one with the Sleepiness drive:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| Hunger for carbohydrate | 150 | 162 → locus 5 (thr 214) | 41 (rate 14, gain 6) | 187 Stress (H4C) | 154 → locus 14 (thr 128) | 33 (rate 24, gain 5) |
| Hunger for protein | 149 | 161 → locus 6 (thr 214) | 40 (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| Hunger for fat | 151 | 160 → locus 7 (thr 214) | 39 (rate 14, gain 6) | 189 Stress (H4F) | 152 → locus 16 (thr 128) | 31 (rate 24, gain 5) |
| Anger | 160 | 155 → locus 13 (thr 214) | 34 (rate 14, gain 6) | 190 Stress (Anger) | 151 → locus 17 (thr 128) | 30 (rate 24, gain 20) |
| Fear | 158 | 157 → locus 11 (thr 204) | 36 (rate 14, gain 6) | 191 Stress (Fear) | 150 → locus 18 (thr 128) | 29 (rate 24, gain 14) |
| Pain | 148 | 156 → locus 12 (thr 191) | 35 (rate 14, gain 6) | 192 Stress (Pain) | 149 → locus 19 (thr 128) | 28 (rate 24, gain 8) |
| **Sleepiness** | **155** | **159 → locus 9** (thr 214) | **38 (rate 14, gain 6)** | **193 Stress (Sleep)** | **147 → locus 21** (thr 128) | **26 (rate 24, gain 5)** |
| Tiredness | 154 | → locus 10 (thr 204) | (rate 14, gain 6) | 194 Stress (Tired) | 148 → locus 20 (thr 128) | 27 (rate 24, gain 5) |
| Crowded | 157 | → locus 10 (thr 230, dual-use) | (rate 14, gain 6) | 195 Stress (Crowded) | 146 → locus 22 (thr 128) | 25 (rate 24, gain 5) |

Stress (Sleep) sits as the **seventh** entry of this table because chemical 193 is the seventh per-cause Stress slot. Functionally it occupies a "baseline physiological need" position:

1. **Standard half-life (311 ticks)** — the same as six of the other seven per-cause Stresses. Sleep stress decays at the baseline rate; only carb-hunger stress (H4C) lingers ~2× as long. The "memory" of sleep deprivation is therefore short — within a few minutes of the Norn finally getting to rest, Stress (Sleep) is back below the Stage-2 threshold.
2. **High distress threshold (214)** — sleep stress kicks in only when Sleepiness has been quite high for some time. Sustained Sleepiness in the 214-255 band is required to trigger the cascade, putting Sleep at the same trigger sensitivity as Anger and the three hunger drives, and 23 units higher than Pain's gate (191). The genome encodes "occasional missed naps are not a stressor; chronic insomnia is".
3. **Baseline Stage-2 gain (5)** — Stress (Sleep) contributes the same per-source weight to aggregate Stress (128) as any of the three hungers, the Tired path, or the Crowded path. Sleep is the quietest tier of voice in the Stress chorus — alongside the other physiological-need cascades, and far below the three damage/psychological cascades (Pain 8, Fear 14, Anger 20).

### Why sleep has a high Stage-1 threshold

The genome's Stage-1 threshold ladder is **191 (pain) → 204 (fear, tired) → 214 (hungers, sleep, anger) → 230 (crowded)**. Sleep sits on the high-threshold tier shared with the hungers and Anger. Three reasons this is consistent with the rest of the C3 chemistry:

1. **Sleepiness is a normal, frequent drive.** Unlike Pain (which a healthy Norn experiences only on injury), Sleepiness rises and falls naturally in every Norn over the course of normal life — every Norn becomes sleepy, sleeps, and resets the drive multiple times in a lifetime. A low Stage-1 threshold would have the Pain cascade triggering on every ordinary sleepy episode, polluting the chronic-stress signal with normal physiological rhythm. The high gate (214) ensures the cascade only fires when Sleepiness has *failed* to be resolved by sleep over a long period — i.e., when sleep is actually being prevented.
2. **Sleep deprivation is rarely catastrophic in the short term.** A Norn whose Sleepiness is briefly high but who then sleeps experiences no lasting harm, biochemically or otherwise. The genome models this by setting the per-cause Stress threshold high enough that brief peaks do not register as chronic stress, only sustained inability to rest does.
3. **The Stage-2 weight is the lowest tier.** With gain 5 — at the bottom of the per-cause weight ladder — the cascade does not over-amplify sleep deprivation into a dominant mutation driver. The genome encodes "chronic sleeplessness is genuinely bad, but not as evolutionarily corrosive as chronic pain, fear, or anger".

The combination of "high threshold (214)" and "low weight (5)" gives Sleep a distinctive profile: it is **one of the harder cascades to trigger** (only Crowded has a higher gate at 230), and its individual contribution to aggregate Stress is mild. In a complex distress event, Stress (Sleep) typically rises after Stress (Pain), Stress (Fear), and Stress (Tired), and it contributes a small but real share to the aggregate.

### Why have Stress (Sleep) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Sleepiness → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 193 in three concrete ways:

1. **Per-cause readability.** Because Stress (Sleep) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn sleep-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a colony can see at a glance whether the Stress comes from social problems (Anger / Crowded / Fear elevated) versus food shortage (H4C / H4P / H4F elevated) versus injury (Pain elevated) versus sleep cycle disruption (Sleep / Tired elevated). Stress (Sleep) elevated alone is the signature of a Norn who cannot get to sleep — whether due to over-stimulating environments, social pressure preventing rest, or brain pathology suppressing the sleep instinct.
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Stress (Sleep) takes the standard 311-tick half-life, but a modder could lengthen it to model "sleep debt" or shorten it to model "rapid recovery". A sleep-debt mod would make a Norn's missed nights contribute to mutation pressure even after they finally rest, turning Stress (Sleep) into a long-term sleep-deprivation fingerprint.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains. The Sleep path uses gain **5** — baseline tier — making chemical 193 a mild contributor to aggregate Stress (128). A Norn that is *only* sleepless-but-unable-to-sleep accumulates Stress (128) at the same modest rate as a Norn that is *only* hungry, and far slower than one in pain, fear, or anger.

### Stress (Sleep) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 147, threshold 128) is digital, Stress (Sleep) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the Sleep path. Above it, the Stage-2 emitter (id 26) fires at a fixed rate of 24 with **gain 5**, regardless of *how far above* 128 the Stress (Sleep) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether Stress (Sleep) is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of sleep stress** between roughly 0 and 128 where Stress (Sleep) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly experiences high Sleepiness, then falls asleep, then resets the drive may register a small rise and fall in Stress (Sleep) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained sleep deprivation, where Sleepiness sits above 214 for an extended period, is required to push Stress (Sleep) past 128 and start contributing to evolutionary pressure.

The combination of "high Stage-1 threshold (214)" and "low Stage-2 gain (5)" gives Sleep a distinctive profile: it is *hard to trigger* (high gate at the input) and *mild once triggered* (low weight at the output). Compare with Pain, which is easy to trigger (gate 191) and moderate (weight 8); with Anger, which shares Sleep's gate (214) but produces 4× the aggregate Stress per tick (weight 20); and with Crowded, which is the only cascade with a higher gate (230) but the same baseline weight (5). Sleep is firmly in the "common physiological need that becomes a stressor only when chronically unresolved" category.

### How Stress (Sleep) propagates to the consumers of Stress (128)

Once Stress (Sleep) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time sleep-deprived conceive more-mutated offspring — but because Sleep's Stage-2 weight is only 5, this contribution is mild relative to the upper-tier cascades. Sleep-disrupted lineages drift mutation pressure upward, but slowly.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert Prostaglandin into Fatty Acid. Stress (Sleep) contributes to this only via its Stage-2 path; an uninjured but sleepless Norn whose only Stress source is the Sleep cascade does not actually trigger reaction 76 (which is also gated by Injury). The Sleep cascade's contribution to Stress-induced lipolysis is therefore primarily relevant in *combined* injury-plus-sleeplessness scenarios.

Importantly, neither of these consumers reads chemical 193 *directly*. Stress (Sleep) influences them only through Stage 2 of the cascade. This means:

- **Modders can mute the Sleep contribution** by editing the Stage-2 emitter (id 26) to disable it without affecting the other per-cause Stresses — useful for "sleep-tolerant" lineages where chronic insomnia should be uncomfortable but not select for evolution.
- **Modders can amplify the Sleep contribution** by raising emitter 26's gain or by lowering the Stage-2 receptor's threshold (id 147) — useful for modelling species or breeds where sleep deprivation is rapidly debilitating.
- **Modders can give sleep its own dedicated downstream effect** by adding a brand-new receptor on chemical 193 — for example, a receptor that elevates Tiredness production, suppresses focus, reduces immune efficiency, or makes the Norn passive while sleep-deprived, without going through aggregate Stress at all.

### Stress (Sleep) vs. Sleepiness drive (155) vs. Tiredness drive (154)

These signals form the rest stack but measure different things on different timescales:

- **Sleepiness (155)** is the *drive* — the brain's read of "I need to sleep". Rises continuously through normal life as a function of awake-time; falls when the Norn actually sleeps via the Sleep instinct. Modulates the brain's instincts to seek a safe spot, lie down, and enter sleep state. This is a real-time signal — the Norn responds within seconds to onset (when conditions for sleep are met) and resolution (when sleep restores the drive to baseline).
- **Tiredness (154)** is a *separate but related drive* — "I am physically exhausted". Has its own per-cause Stress (chemical 194 Stress (Tired)) with its own cascade, threshold (204), and matching baseline gain (5). Tiredness and Sleepiness can be elevated independently — a Norn can be physically exhausted without being sleepy, and vice versa — though they often co-rise during prolonged activity.
- **Stress (Sleep) (193)** is the *chronic-suffering marker* for unmet sleep need. Only rises when the *Sleepiness drive* has been above 214 for long enough that the Stage-1 emitter has accumulated chemical 193 in the bloodstream. Decays at the standard 311 ticks. This is an "I have been trying to sleep but unable to do so for a noticeable time" memory, used only for upstream long-term effects.
- **Aggregate Stress (128)** is the body-wide stress state — the sum across all nine cause paths. Elevated Stress (Sleep) is *one* of the contributors, but a well-rested Norn can have elevated Stress (128) from any of the other eight causes; conversely, a briefly-sleepless Norn whose Stress (Sleep) never crosses 128 contributes nothing.

A useful mental model: **Sleepiness is the "I need to sleep" alarm; Stress (Sleep) is the "I have been unable to sleep for too long" diary entry; aggregate Stress is the "this Norn is in poor shape" verdict drawn from all nine diary entries together — and the sleep entry, like the hunger entries, is written in the smallest letters of the per-cause Stress family.**

### Stress (Sleep) and the diurnal cycle

Of all the per-cause Stresses, Stress (Sleep) is the one most tightly bound to the natural rhythm of the simulation. In a normally-functioning Norn living in a normally-functioning environment:

- Sleepiness rises through waking activity, eventually crossing the brain's sleep instinct threshold.
- The Norn lies down and sleeps, restoring Sleepiness toward zero.
- Sleepiness never sustains above 214 for long enough that the Stage-1 emitter accumulates meaningful Stress (Sleep).
- Stress (Sleep) therefore stays near 0 throughout the lifetime — invisible in the Kits, contributing nothing to mutation pressure.

When this cycle breaks — because the environment is too stimulating, because social interaction prevents rest, because brain pathology suppresses the sleep instinct, because mod content interferes with the sleep cycle, or because the Norn is being pursued by something dangerous — Sleepiness ramps past 214 and stays there, and Stress (Sleep) begins to accumulate. Elevated Stress (Sleep) is therefore the unambiguous biochemical signature of a Norn whose sleep cycle has been broken for an extended period. It is a diagnostic chemical for environmental and behavioural problems that prevent rest, not for normal sleepiness.

### Comparison with Stress (Tired)

Stress (Sleep) and Stress (Tired) are paired in the per-cause Stress system but encode different aspects of "the Norn needs to rest":

| Aspect | Stress (Sleep) [193] | Stress (Tired) [194] |
|--------|----------------------|----------------------|
| Source drive | Sleepiness (155) | Tiredness (154) |
| Stage-1 threshold | 214 | 204 |
| Stage-2 gain | 5 | 5 |
| Half-life | 311 ticks | 311 ticks |
| Triggering condition | Sustained inability to *sleep* | Sustained physical *exhaustion* |

The two cascades have the same baseline weight (5) and the same half-life (311) but different Stage-1 thresholds: Tired's gate is 204 (matching Fear), while Sleep's gate is 214 (matching the hungers and Anger). This means Tiredness is recognised as a chronic stressor at a moderate level, whereas Sleepiness must be quite severe before its cascade fires. The genome encodes "physical exhaustion is more readily acknowledged as a stressor than sleep deprivation per se".

In practice, Stress (Tired) often rises before Stress (Sleep) in distress events — a Norn pursued through a hostile environment becomes physically exhausted (and crosses Tired's 204 gate) before its sleep deprivation reaches the higher 214 gate. The two cascades together form the "rest deficit" portion of the per-cause Stress signal, and elevated Stress (Sleep) plus Stress (Tired) together is the distinctive signature of a Norn whose entire rest cycle has been broken.

### Comparison with the other "baseline-weight" per-cause Stresses

Stress (Sleep) shares the baseline Stage-2 gain of 5 with five other cascades:

- **Stress (H4C / H4P / H4F) — gain 5 each.** The three hunger Stresses. These differ from Sleep only in their source drive and (for H4C) in their longer half-life (621 vs 311 ticks). Hunger and sleep are encoded as comparable mild physiological stressors.
- **Stress (Tired) — gain 5.** Closely related to Sleep — see above.
- **Stress (Crowded) — gain 5.** The cascade for the Crowded drive. Differs from Sleep in having the highest Stage-1 threshold of all (230) — crowding must be very persistent before it registers as chronic stress.
- **Stress (Sleep) — gain 5.** The topic of this document.

Read together: the genome treats the *physiological-need* Stresses as equally weighted at the bottom of the per-cause hierarchy, distinguishing between them mainly via their Stage-1 thresholds (how quickly the drive triggers the cascade) and, for H4C, a longer half-life. Sleep sits at the high-threshold end of this baseline tier, requiring sustained drive elevation before it begins to contribute.

### JS port notes

The Rebuild port treats chemical 193 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_SLEEP` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (Sleep)"` appears only in `ChemicalNames.catalogue`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (Sleep) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). Two additional points specific to chemical 193:

- **The Stage-1 threshold of 214 is genome data, not engine-level magic.** The biochemistry tick loop must read the per-receptor threshold field from receptor id 159 rather than hard-coding "Sleep stress triggers at 84%". Mods that retune the per-cause sensitivities — for example, lowering the sleep gate to 191 to model an "insomnia-prone" lineage, or raising it to 240 to model a "stoic" species — must be picked up automatically; baking the 191:204:214:230 threshold ladder into engine code would defeat the genome-driven design.
- **The Stage-1 receptor reads chemical 155 (Sleepiness), not 154 (Tiredness).** The two related drives sit in adjacent chemical slots and have parallel cascades (chemical 193 vs 194), but they are wired to different receptors (159 vs 158-equivalent for Tired) and different loci (9 vs 10). Implementations that wire the cascades by chemical name rather than by chemical id must use the catalogue index 155 for the Sleep path, and the corresponding Stage-1 receptor id 159 / Stage-1 emitter id 38 / Stage-2 receptor id 147 / Stage-2 emitter id 26. Note that the receptor/emitter ids do not run sequentially across the nine cascades: each path has its own id-pairs that must be looked up explicitly.

### Practical consequences for gameplay

- **Stress (Sleep) is rare in healthy Norns.** Because Sleepiness is normally resolved by the sleep cycle and the Stage-1 gate is high (214), most Norns living in normally-functioning environments never see Stress (Sleep) elevated. Its appearance is therefore a strong signal of a problem.
- **Causes of elevated Stress (Sleep).** Common scenarios include: an over-stimulating environment that the Norn cannot get away from; brain pathology (low Sleep instinct response, broken IT lobe pathways) that prevents the sleep behaviour from firing; social pressure or pursuit by another agent that prevents lying down; mod content that suppresses or interrupts the sleep cycle; chronic illness or poisoning that interferes with the sleep behaviour.
- **Diagnosing sleep stress in the Kits.** A Norn whose Stress (Sleep) graph is rising while Sleepiness is also high is in an active sleep-deprivation state. A Norn with elevated Stress (Sleep) and *low* Stress (Pain) / Stress (Fear) / Stress (Anger) is suffering specifically from inability to rest, not from injury or psychological distress — useful for diagnosing environmental over-stimulation, sleep-cycle pathology, or behavioural blocks. Because Stress (Sleep) decays at the standard rate, a flat-elevated reading without recent Sleepiness peaks may indicate ongoing brain dysfunction in the sleep instinct.
- **Sleep-disrupted colonies show a characteristic Stress (Sleep) signature.** A Norn population in a perpetually busy environment, or under repeated agent harassment, or in a metaroom whose layout offers no quiet rest spots, will show sustained elevated Stress (Sleep) baselines, often with Stress (Tired) co-elevated (because exhaustion accompanies the sleeplessness). This is the unambiguous biochemical signature of a *lifestyle problem* rather than an injury or social-conflict problem.
- **Injecting Stress (Sleep) is the gentlest mod lever for aggregate Stress.** `CHEM 193 150` raises Stress (Sleep) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) at gain 5 for the next ~310 ticks without actually preventing the Norn from sleeping. This is the mildest of the per-cause injection options — useful for testing the mutation pathway in isolation when Pain (gain 8), Fear (gain 14), or Anger (gain 20) injections would be too strong. Hunger, Tired, and Crowded injections produce similar gentle pushes.
- **Resolving sleep stress is straightforward.** Letting the Norn finally sleep — through removing the source of disturbance, allowing the sleep instinct to fire, or directly setting Sleepiness to zero — drops the drive below 214 and halts Stage-1 production. Existing Stress (Sleep) decays at standard rate, falling below the Stage-2 threshold of 128 within ~310 ticks. A Norn that has just had a good sleep no longer contributes sleep-pressure to mutation within minutes.
- **Sleep stress is the quietest cascade in the chorus.** Even sustained, chronic Stress (Sleep) above 128 contributes only gain 5 to aggregate Stress per Stage-2 tick. A Norn whose only stress source is sleeplessness drifts mutation pressure upward at the slowest rate — alongside pure-hunger and pure-crowded scenarios. Significant evolutionary pressure from sleep alone requires very long-term, very chronic deprivation; the genome is configured to treat the inability to rest as a real but mild evolutionary signal.

### Summary

```
   Sleepiness (155) — the brain's "I need to sleep" drive (rises with awake-time)
                       │
                       ▼  (bloodstream chemical, drive locus 9 of Circulatory)
          Receptor 159 (gene 46, DIGITAL, threshold 214)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 9 (floating, latched ~255)
                       │
          Emitter 38 (gene 20, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                  STRESS (Sleep) [193]
        - No initial concentration (starts at 0)
        - Half-life = 311 ticks ("Medium", standard per-cause Stress rate)
        - Genome halflives byte = 58
                       │
                       ▼
          Receptor 147 (gene 78, DIGITAL, threshold 128, gain 255)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 21 (floating, latched ~255)
                       │
          Emitter 26 (gene 33, DIGITAL, rate 24, GAIN 5 — baseline tier)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst — Sleep contributes only
                                in injury+sleeplessness combined scenarios)

   Stress (Sleep) is the chronic sleep-deprivation marker:
     - Produced when Sleepiness ≥ 214 sustains long enough
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Decays at the standard 311-tick half-life
     - BASELINE per-cause Stage-2 gain (5, shared with H4C/H4P/H4F/Tired/Crowded)
     - The mildest tier of contributor to aggregate Stress
     - Hard to trigger in healthy Norns (high gate, normal sleep cycle resolves Sleepiness)
     - Rare in well-functioning environments — its appearance signals a problem
     - Often co-elevated with Stress (Tired) in broken-rest-cycle scenarios
     - The signature stress chemical of disrupted sleep cycles, not normal sleepiness
```

## Key Source References

- `ChemicalNames.catalogue` — the string `"Stress (Sleep)"` as the 193rd entry in the chemical-names table
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **159** (gene 46) — Stage-1 receptor reading **Sleepiness (155)** ≥ 214 onto Circulatory locus 9
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **38** (gene 20) — Stage-1 emitter on Circulatory locus 9 producing **Stress (Sleep) (193)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **147** (gene 78) — Stage-2 receptor reading **Stress (Sleep) (193)** ≥ 128 onto Circulatory locus 21
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **26** (gene 33) — Stage-2 emitter on Circulatory locus 21 producing aggregate **Stress (128)** at rate 24, **gain 5** (the baseline per-cause Stage-2 gain shared by six of the nine cascades)
- `DOCUMENTATION/CreaturesData/biochemistry.json` — Stress (Sleep)'s halflives entry: genome byte 58, `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, speed "Medium"
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reaction 76 — `Stress + Prostaglandin → Stress + Fatty Acid` (gated by Injury), the consumer of aggregate Stress that Sleep stress contributes to indirectly
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/187 - Stress (H4C).md` — sibling doc on the carb-hunger per-cause Stress, with the contrasting 621-tick half-life
- `DOCUMENTATION/chemicals/188 - Stress (H4P).md` — sibling doc on the protein-hunger per-cause Stress
- `DOCUMENTATION/chemicals/189 - Stress (H4F).md` — sibling doc on the fat-hunger per-cause Stress
- `DOCUMENTATION/chemicals/190 - Stress (Anger).md` — sibling doc on the anger per-cause Stress, with the highest Stage-2 gain (20)
- `DOCUMENTATION/chemicals/191 - Stress (Fear).md` — sibling doc on the fear per-cause Stress, Stage-2 gain 14
- `DOCUMENTATION/chemicals/192 - Stress (Pain).md` — sibling doc on the pain per-cause Stress, Stage-2 gain 8 with the lowest Stage-1 gate (191)
- `DOCUMENTATION/chemicals/155 - Sleepiness.md` — upstream context on what Sleepiness actually measures and what produces/consumes it (if present)
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (Sleep) constant (the chemical is handled by the generic biochemistry engine)
