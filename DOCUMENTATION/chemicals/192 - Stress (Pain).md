# 192 - Stress (Pain)

**Stress (Pain)** is the per-cause Stress chemical that records *physical pain as a chronic source of suffering*. It is the dedicated bloodstream marker that says "this Norn has been hurting long enough that the body is treating the injury as a stressor". Chemical 192 occupies slot **192** of the 256-entry chemical table (`ChemicalNames.catalogue`), the sixth of the nine **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 192 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Pain (148)              ──[receptor 156, threshold 191]──▶  Circulatory locus 12
       Circulatory locus 12    ──[emitter 35, rate 14, gain 6]──▶  Stress (Pain) [192]
       Stress (Pain) [192]     ──[receptor 149, threshold 128]──▶  Circulatory locus 19
       Circulatory locus 19    ──[emitter 28, rate 24, gain 8]──▶ Stress [128]
```

Only when the **Pain drive climbs above 191/255** — the lowest Stage-1 gate in the entire per-cause Stress system — does the receptor fire and Stress (Pain) start accumulating. Once present, Stress (Pain) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **311-tick half-life** ("Medium" band). Like its hunger siblings Stress (H4P) (chemical 188) and Stress (H4F) (chemical 189), and like Stress (Fear) (chemical 191) and Stress (Anger) (chemical 190), Stress (Pain) decays at the standard rate shared by seven of the nine per-cause Stresses (188-195 except 187): pain leaves the body's stress memory at the same speed as fat hunger, protein hunger, sleepiness, tiredness, crowding, anger, and fear.

What sets Stress (Pain) apart from its eight siblings is the combination of its **lowest Stage-1 threshold (191)** — meaning Pain crosses into "this is now a stressor" territory before any other drive — and a **mid-tier Stage-2 gain of 8**. The Stage-1 receptor (id 156) latches at Pain ≥ 191, **13 units lower** than Fear's gate (204), Tired's gate (204), and **23 units lower** than the gate used by the three hunger types (214), Sleep (214), or Anger (214). Pain has the most sensitive trigger in the genome: the system is configured to treat physical injury as a chronic stressor much earlier than it treats other distresses. The Stage-2 emitter (id 28) that converts elevated Stress (Pain) into aggregate Stress (128) fires at gain **8** — **1.6× the baseline gain of 5** used by the three hunger Stresses, the Sleep / Tired / Crowded Stresses; **57% of the Fear Stress weight (gain 14)**; and **40% of the Anger Stress weight (gain 20)**. Pain is, by genome design, the *third most potent contributor* to aggregate Stress per tick of cause-time, behind Anger and Fear — but because its trigger threshold is the lowest, it is often the *first* per-cause cascade to begin contributing in any distress scenario.

Chemical 192 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "an injury was hurting recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 12** — the Stage-1 Pain cascade | Emitter gene **22** (`biochemistry.json`, emitter id 35) | Creature / Circulatory / Locus 12 | `chemical=192, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 12 is driven up to 255 by receptor id 156 (gene 56) which reads chemical **148 Pain** with threshold **191** (DIGITAL, gain 255). When the Norn's Pain exceeds 191/255, locus 12 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (Pain) per firing | ~6 units per 14-tick window while Pain ≥ 191 |
| 2 | Direct `CHEM 192 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 192 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push aggregate Stress at the Pain-cascade weight without actually injuring the Norn | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 192. The single Stage-1 emitter (id 35) is the only natural source, and it is gated entirely by the Pain drive via receptor 156. The Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (Pain), so an injured baby Norn will not contribute pain pressure to its mutation rate, even though the Pain drive itself is active in babies (and indeed Pain is one of the most active drives in baby life as Norns explore and bump into things).

Chemical 192 has **no `initialConcentrations` entry** — every Creature is born with Stress (Pain) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **76** (receptor id 149) | Creature / Circulatory / Locus 19 | `chemical=192, threshold=128, nominal=0, gain=255, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (Pain) climbs above 128/255, this receptor latches Circulatory locus 19 to ~255/255 | Locus 19 in turn drives emitter id 28 (gene 28) which produces aggregate **Stress (128)** at rate 24, **gain 8** — the third-highest per-cause gain of the nine cascades, behind Anger (20) and Fear (14). Pain above 128 contributes a moderate-strength flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry::GetChemical(192)` | Creature / bloodstream (systemic) | Chemical 192 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (Pain)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from physical pain?" becomes a first-class observable, useful for diagnosing chronic injury, repeated trauma, illness lineages, or hostile-environment exposure in colonies, and for Kits/CAOS mods that want per-cause breakdowns |
| 3 | **Passive decay** | Halflives byte 192 = **58** | Bloodstream (systemic) | `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, "Medium" decay band. Multiplies Stress (Pain) by ~0.99777 every biochem tick | A Stress (Pain) spike halves in ~311 ticks (~5-10 game seconds depending on tick rate). This matches seven of the eight other per-cause Stress chemicals — only Stress (H4C) (621 ticks) lingers longer. Pain stress is "remembered" for the standard duration |

There are no reactions, no other receptors, and no consumers that read chemical 192. The Stage-2 receptor (id 149) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 192 is one node in the genome's nine-fold per-cause Stress system, paired one-to-one with the Pain drive:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| Hunger for carbohydrate | 150 | 162 → locus 5 (thr 214) | 41 (rate 14, gain 6) | 187 Stress (H4C) | 154 → locus 14 (thr 128) | 33 (rate 24, gain 5) |
| Hunger for protein | 149 | 161 → locus 6 (thr 214) | 40 (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| Hunger for fat | 151 | 160 → locus 7 (thr 214) | 39 (rate 14, gain 6) | 189 Stress (H4F) | 152 → locus 16 (thr 128) | 31 (rate 24, gain 5) |
| Anger | 160 | 155 → locus 13 (thr 214) | 34 (rate 14, gain 6) | 190 Stress (Anger) | 151 → locus 17 (thr 128) | 30 (rate 24, gain 20) |
| Fear | 158 | 157 → locus 11 (thr 204) | 36 (rate 14, gain 6) | 191 Stress (Fear) | 150 → locus 18 (thr 128) | 29 (rate 24, gain 14) |
| **Pain** | **148** | **156 → locus 12** (thr 191) | **35 (rate 14, gain 6)** | **192 Stress (Pain)** | **149 → locus 19** (thr 128) | **28 (rate 24, gain 8)** |
| Sleepiness | 155 | → locus 9 (thr 214) | (rate 14, gain 6) | 193 Stress (Sleep) | 147 → locus 21 (thr 128) | 26 (rate 24, gain 5) |
| Tiredness | 154 | → locus 10 (thr 204) | (rate 14, gain 6) | 194 Stress (Tired) | 148 → locus 20 (thr 128) | 27 (rate 24, gain 5) |
| Crowded | 157 | → locus 10 (thr 230, dual-use) | (rate 14, gain 6) | 195 Stress (Crowded) | 146 → locus 22 (thr 128) | 25 (rate 24, gain 5) |

Stress (Pain) sits as the **sixth** entry of this table because chemical 192 is the sixth per-cause Stress slot. Functionally it occupies a unique position:

1. **Standard half-life (311 ticks)** — the same as six of the other seven per-cause Stresses. Pain stress decays at the baseline rate; only carb-hunger stress (H4C) lingers ~2× as long. The "memory" of an injury is therefore short — within a few minutes of the wound healing or the painful situation ending, Stress (Pain) is back below the Stage-2 threshold.
2. **Lowest distress threshold (191)** — pain stress kicks in earlier than any other per-cause path. Sustained Pain in the 191-203 band already produces Stress (Pain), where the same level of Fear, Tired, Anger, or any hunger would not yet have triggered. This makes the Pain cascade the most sensitive to early/moderate suffering, mirroring the real-world observation that even moderate-but-persistent pain is corrosive and worth treating as a chronic stressor.
3. **Mid-tier Stage-2 gain (8)** — Stress (Pain) contributes **1.6 times** the per-source weight of any hunger Stress, **57%** that of Fear Stress, and **40%** that of Anger Stress to aggregate Stress (128). Pain is a moderate but real voice in the Stress chorus — louder than any physiological-need cascade, quieter than the two psychological ones above it.

### Why pain has the lowest Stage-1 threshold

The genome's Stage-1 threshold ladder is **191 (pain) → 204 (fear, tired) → 214 (hungers, sleep, anger) → 230 (crowded)**. Read as a hierarchy of "how readily this signal becomes a chronic stressor", it places pain ahead of every other cause. Three reasons this is consistent with the rest of the C3 chemistry:

1. **Pain is the most direct biological alarm signal.** Pain (148) is produced by the Injury locus — by a Norn that has actually been hurt, not merely uncomfortable. Where the hunger drives ramp slowly and continuously and the fear/anger drives can spike in response to perception alone, Pain reflects an event that is already physically damaging. Treating it as a stressor at a lower threshold encodes "if you hurt at all persistently, that is a real problem" into the genome.
2. **Pain has the lowest baseline level in a healthy Norn.** The Pain drive in a non-injured creature stays near 0; it rises only on injury and falls back through Pain Killer (146) consumption and through standard drive decay. Because the baseline is near zero, a low Stage-1 threshold (191) is *not* hyperactive — it does not fire on idle Norns. It fires only when something is genuinely wrong. Compare with Crowded (gate 230), where a high threshold is needed because the drive often runs high in a packed Norn community without that being a true emergency.
3. **The Stage-2 weight is moderate, not extreme.** With gain 8 — well below Fear's 14 and Anger's 20 — the lower threshold does not over-amplify pain into the dominant mutation driver. The genome encodes "pain is easy to register as a stressor, but not as heavy a contributor as the major psychological cascades". This balances "responsive to injury" with "pain alone shouldn't drive evolutionary pressure as hard as fear or anger".

The combination of "lowest threshold (191)" and "mid-tier weight (8)" gives Pain a distinctive profile: it is the **earliest contributor** in any distress scenario — often the first cascade to start accumulating its per-cause Stress — but its individual contribution to aggregate Stress is moderate. In a complex distress event (hurt + scared + angry), Stress (Pain) typically rises before Stress (Fear) and Stress (Anger), but once those join in their combined contribution dwarfs Pain's.

### Why have Stress (Pain) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Pain → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 192 in three concrete ways:

1. **Per-cause readability.** Because Stress (Pain) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn pain-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a colony can see at a glance whether the Stress comes from social problems (Anger / Crowded / Fear elevated) versus food shortage (H4C / H4P / H4F elevated) versus exhaustion (Sleep / Tired elevated) versus injury (Pain elevated). Stress (Pain) elevated alone is the signature of a Norn caught in a chronically-painful situation — repeated injury, untreated wounds, inflammation from disease antigens, or proximity to dangerous environmental agents.
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Stress (Pain) takes the standard 311-tick half-life, but a modder could lengthen it to model "pain memory" or shorten it to model "rapid recovery". A trauma-memory mod would make a Norn's painful encounters contribute to mutation pressure long after the wound has healed, turning Stress (Pain) into a long-term injury fingerprint.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains. The Pain path uses gain **8** — third-highest — making chemical 192 a notable but not dominant contributor to aggregate Stress (128). A Norn that is *only* in pain will accumulate Stress (128) faster than a Norn that is *only* hungry or sleepy, but slower than a Norn that is fearful or angry.

### Stress (Pain) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 149, threshold 128) is digital, Stress (Pain) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the Pain path. Above it, the Stage-2 emitter (id 28) fires at a fixed rate of 24 with **gain 8**, regardless of *how far above* 128 the Stress (Pain) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether Stress (Pain) is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of pain stress** between roughly 0 and 128 where Stress (Pain) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly hurts itself, recovers, and the wound subsides may register a small rise and fall in Stress (Pain) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained or repeated injury is required to push Stress (Pain) past 128 and start contributing to evolutionary pressure.

The combination of "lowest Stage-1 threshold (191)" and "moderate Stage-2 gain (8)" gives Pain a distinctive profile: it is *the easiest cascade to trigger* (lowest gate at the input) but only *moderately impactful once triggered* (mid weight at the output). Compare with Anger, which is harder to trigger (gate 214) but the strongest when it fires (weight 20); with Fear, which is easier (gate 204) and strong (weight 14); and with the hungers, which share Anger's gate (214) but have the weakest weight (5). Pain is the cascade most likely to be "first to fire" in any complex distress event.

### How Stress (Pain) propagates to the consumers of Stress (128)

Once Stress (Pain) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time in pain conceive more-mutated offspring — the genome encodes a selection signal against lineages whose physiology cannot avoid or resolve injury efficiently.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert the pain modulator Prostaglandin into Fatty Acid. There is a notable feedback here: **Pain produces Stress (Pain), which produces aggregate Stress, which then accelerates the depletion of Prostaglandin** — the very chemical that modulates the Pain signal. A persistently injured Norn therefore burns through its pain-management reserves faster, biochemically consistent with the classic observation that chronic pain is metabolically expensive.

Importantly, neither of these consumers reads chemical 192 *directly*. Stress (Pain) influences them only through Stage 2 of the cascade. This means:

- **Modders can mute the Pain contribution** by editing the Stage-2 emitter (id 28) to disable it without affecting the other per-cause Stresses — useful for "pain-tolerant" lineages where injury should hurt but should not select for evolution.
- **Modders can amplify the Pain contribution** by raising emitter 28's gain or by lowering the Stage-2 receptor's threshold (id 149) — useful for modelling chronic-pain conditions where injury history dominates evolutionary pressure.
- **Modders can give pain its own dedicated downstream effect** by adding a brand-new receptor on chemical 192 — for example, a receptor that elevates Pain Killer production directly, raises Antibody output, triggers a sustained-pain immune response, or makes the Norn passive/withdrawn while injured, without going through aggregate Stress at all.

### Stress (Pain) vs. Pain drive (148) vs. Injury locus

These signals form the pain stack but measure different things on different timescales:

- **Injury (somatic locus 2)** is the *event* — a per-tick read of "I am being hurt right now" produced by the body's somatic reception of damage. Drives several reactions including the production of Pain (148) itself and the gating of the stress-induced lipolysis reaction. This is the lowest-level, most immediate signal in the pain stack.
- **Pain (148)** is the *drive* — the brain's read of "I hurt right now". Rises when Injury fires and through downstream reactions; falls through Pain Killer (146) consumption and standard drive decay. Modulates the brain's instincts to retreat, withdraw, and seek comfort. This is a real-time signal — the Norn responds within seconds to onset and resolution.
- **Stress (Pain) (192)** is the *chronic-suffering marker* for pain. Only rises when the *drive* has been above 191 for long enough that the Stage-1 emitter has accumulated chemical 192 in the bloodstream. Decays at the standard 311 ticks. This is an "I have been hurting for a noticeable time" memory, used only for upstream long-term effects.
- **Aggregate Stress (128)** is the body-wide stress state — the sum across all nine cause paths. Elevated Stress (Pain) is *one* of the contributors, but a non-injured Norn can have elevated Stress (128) from any of the other eight causes; conversely, a briefly-hurt Norn whose Stress (Pain) never crosses 128 contributes nothing.

A useful mental model: **Injury is the "ouch this just happened" signal; Pain is the "I am hurting now" alarm; Stress (Pain) is the "I have been hurt too long" diary entry; aggregate Stress is the "this Norn is in poor shape" verdict drawn from all nine diary entries together — and the pain entry is written easily but in moderate-weight letters.**

### The pain/everything-else threshold asymmetry

A noteworthy structural detail: Pain's Stage-1 threshold is **191**, but every other cascade's gate is at least **204**. Because the Stage-1 rate (14) and gain (6) are identical across all nine cascades, the Pain path is *strictly easier to trigger* than every other path. In a Norn whose drives rise gradually together (a common pattern under prolonged distress — hurting from a wound, then afraid of more attacks, then angry at the attacker), Stress (Pain) starts accumulating *first*, ahead of all other per-cause Stresses. This means:

- In **mixed-distress crises**, the Pain cascade contributes to aggregate Stress *first*, then Fear/Tired join at 204, then everything else at 214+. Pain is the early-warning system of the per-cause Stress family.
- In **pure-pain crises** (chronic illness, untreated wounds, hostile-agent contact), the Pain cascade can run alone for extended periods, producing a *single-source* Stress signature that is unmistakable in the Kits — useful for diagnosing health problems versus social/environmental ones.
- Conversely, in **psychological-only distress** (frightening environment, social aggression) without physical injury, Stress (Pain) stays at zero — leaving a clean signal that distinguishes mental from physical suffering.

The asymmetry encodes a design preference: the genome treats *being in physical pain* as the most readily-flagged form of chronic suffering. A Norn whose body hurts is, in evolutionary terms, immediately a candidate for mutation pressure — although the per-tick pressure is moderate, allowing pain-prone lineages many generations of opportunity to evolve toward better injury tolerance without driving rapid mutation.

### Stress (Pain) and the Prostaglandin feedback loop

Because reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) is catalysed by aggregate Stress and gated by the Injury locus, there is a notable feedback between Stress (Pain) and the body's pain-management chemistry:

1. Injury fires and produces Pain (148) and Prostaglandin.
2. Pain ≥ 191 triggers the Stage-1 receptor (id 156), producing Stress (Pain).
3. Stress (Pain) ≥ 128 triggers the Stage-2 receptor (id 149), pushing aggregate Stress upward.
4. Aggregate Stress, now elevated, catalyses reaction 76 — *consuming Prostaglandin*.
5. Less Prostaglandin available → reduced pain modulation → Pain stays elevated → cycle continues.

This is one of the few feedback loops in the C3 chemistry where a per-cause Stress directly accelerates the depletion of a chemical that would otherwise help resolve the underlying drive. A Norn with chronic untreated injuries thus suffers a compounding effect: the longer Pain stays elevated, the less Prostaglandin remains to manage it, and the more aggregate Stress (and therefore mutation pressure) the lineage accumulates. The standard genome relies on Pain Killer (146) production, sleep healing, and player intervention to break this cycle.

### Comparison with the other "bold" per-cause Stresses

The Stage-2 gain ladder makes a clear hierarchy among the nine per-cause Stresses:

- **Stress (Anger) — gain 20.** The strongest single-cause Stress in the genome. Sustained anger drives mutation pressure faster than any other cause.
- **Stress (Fear) — gain 14.** The second-strongest. Sustained fear pushes mutation pressure ~70% as hard as anger does.
- **Stress (Pain) — gain 8.** The third-strongest, and the topic of this document. Sustained pain pushes mutation pressure ~57% as hard as fear and ~40% as hard as anger. *But* it is also the **easiest cascade to trigger** (gate 191 vs everything else ≥ 204), so it is often the first per-cause Stress to be running in a complex distress event.
- **Stress (H4C / H4P / H4F / Sleep / Tired / Crowded) — gain 5 each.** Baseline. Six of the nine Stresses share the lowest gain.

Read together: the genome treats the *psychological / damage* Stresses (Anger, Fear, Pain) as more severe contributors to evolutionary pressure than the *physiological-need* ones (the three hungers, sleep, tired, crowded), and within the upper tier it ranks Anger > Fear > Pain. This is consistent with C3's "Norn society" theme: a population that lives in violence (Anger), fear, or constant injury (Pain) is a population whose lineage the genome strongly pushes to mutate — but injury alone weighs less than the social-stress signals.

### JS port notes

The Rebuild port treats chemical 192 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_PAIN` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (Pain)"` appears only in `ChemicalNames.catalogue`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (Pain) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). Two additional points specific to chemical 192:

- **The Stage-1 threshold of 191 is genome data, not engine-level magic.** The biochemistry tick loop must read the per-receptor threshold field from receptor id 156 rather than hard-coding "Pain stress triggers at 75%". Mods that retune the per-cause sensitivities — for example, raising the pain gate to 230 to model a "stoic" lineage — must be picked up automatically; baking the 191:204:214:230 threshold ladder into engine code would defeat the genome-driven design.
- **The Stage-1 receptor reads chemical 148 (Pain), not 153 (Hotness) or 158 (Fear).** The chemical-name catalogue ordering puts Pain at 148 — earlier than the cluster of "social / physiological" drives at 153-160. Implementations that wire the cascade by chemical name rather than by chemical id must use the catalogue index 148 for the Pain path, and the corresponding Stage-1 receptor id 156 / Stage-1 emitter id 35 / Stage-2 receptor id 149 / Stage-2 emitter id 28. Note that the receptor/emitter ids do not run sequentially across the nine cascades: the fear, pain, anger, and hunger paths each have their own id-pairs that must be looked up explicitly.

### Practical consequences for gameplay

- **Pain is the earliest contributor to mutation pressure.** Because the Stage-1 gate is the lowest in the genome (191), even moderate sustained injury — say, a Norn repeatedly bumping into a hot zone, or one slowly poisoned by an antigen — will start producing Stress (Pain) before any other per-cause cascade. A colony exposed to repeated low-grade injury will see Pain be the first cascade to elevate aggregate Stress, even before fear or anger have begun to cross their thresholds.
- **Stress (Pain) tracks injury closely.** Resolving the wound — administering Pain Killer (146), allowing the Norn to sleep, removing the source of injury — will quickly drop Pain (148) below the 191 cascade threshold, halting Stage-1 production of chemical 192. The existing Stress (Pain) in the bloodstream then decays at standard rate — within ~310 ticks of healing, it is below the Stage-2 threshold of 128 and stops contributing to aggregate Stress.
- **Diagnosing pain stress in the Kits.** A Norn whose Stress (Pain) graph is rising while Pain drive is also high is in an active injury state. A Norn with elevated Stress (Pain) and *low* Stress (Fear) / Stress (Anger) is suffering specifically from physical injury or illness, not from psychological distress — useful for diagnosing chronic disease, untreated wounds, repeated environmental injury (hot/cold zones, dangerous machines), or antigen-driven inflammation. Because Stress (Pain) decays at the standard rate, a flat-elevated reading without recent injury history may indicate ongoing inflammation from antigens or auto-immune dysfunction.
- **Injured colonies show a characteristic Stress (Pain) signature.** A Norn population with chronic disease, repeated injuries from environmental hazards, or proximity to dangerous machinery will show sustained elevated Stress (Pain) baselines, often with Stress (Fear) co-elevated (because injurious environments are also frightening) and Stress (H4P) co-depressed (because injured Norns sometimes lose appetite). This is the unambiguous biochemical signature of physical-suffering rather than social-suffering.
- **Injecting Stress (Pain) is a moderate mod lever.** `CHEM 192 150` raises Stress (Pain) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) at gain 8 for the next ~310 ticks without actually injuring the Norn. This is a useful CAOS technique for testing the mutation pathway in isolation when "Stress (Anger) injection" or "Stress (Fear) injection" would be too strong (those produce gains 20 and 14 respectively, while Stress (Pain) injection produces a gentler gain-8 push).
- **The "early-warning" pattern.** Because Stress (Pain) decays in 311 ticks but the Stage-1 threshold is the lowest in the genome, a Norn that experiences brief but frequent injury episodes (e.g. repeatedly walking through a hot zone) can sustain a low-grade Stress (Pain) plateau that pushes aggregate Stress consistently above its consumer thresholds without ever spiking dramatically. This produces the biochemical signature of an "unhealthy environment" — a Norn whose pain stress is always running, always contributing to mutation, even when no individual injury has been severe enough to register a prominent Pain spike.
- **Pain is the canary cascade.** In any complex distress scenario, watching Stress (Pain) is the most sensitive way to detect the *onset* of chronic suffering, because it crosses its threshold first. A breeder watching the Kits for early signs of a colony in trouble should look for Stress (Pain) rising before any other per-cause Stress — that is the genome's earliest signal that something needs intervention.

### Summary

```
   Pain (148) — the brain's "I hurt" drive (produced by Injury locus + reactions)
                       │
                       ▼  (bloodstream chemical, drive locus 12 of Circulatory)
          Receptor 156 (gene 56, DIGITAL, threshold 191 — LOWEST in the genome)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 12 (floating, latched ~255)
                       │
          Emitter 35 (gene 22, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                  STRESS (Pain) [192]
        - No initial concentration (starts at 0)
        - Half-life = 311 ticks ("Medium", standard per-cause Stress rate)
        - Genome halflives byte = 58
                       │
                       ▼
          Receptor 149 (gene 76, DIGITAL, threshold 128, gain 255)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 19 (floating, latched ~255)
                       │
          Emitter 28 (gene 28, DIGITAL, rate 24, GAIN 8 — third-highest of the nine)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst — feedback loop with Pain)

   Stress (Pain) is the chronic injury marker:
     - Produced when Pain ≥ 191 sustains long enough (LOWEST threshold in the genome)
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Decays at the standard 311-tick half-life
     - THIRD-HIGHEST per-cause Stage-2 gain in the genome (8 vs 5/14/20)
     - The third-strongest single-source contributor to aggregate Stress
     - Easiest of the nine cascades to trigger (gate 191 vs 204/214/230)
     - Often the FIRST per-cause Stress to begin contributing in a distress event
     - Tracks injury closely — fades within minutes of healing
     - Forms a feedback loop with Prostaglandin via reaction 76
     - The signature stress chemical of chronic physical suffering / unhealthy environments
```

## Key Source References

- `ChemicalNames.catalogue` — the string `"Stress (Pain)"` as the 192nd entry in the chemical-names table
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **156** (gene 56) — Stage-1 receptor reading **Pain (148)** ≥ 191 onto Circulatory locus 12 (the lowest Stage-1 threshold of all nine per-cause cascades)
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **35** (gene 22) — Stage-1 emitter on Circulatory locus 12 producing **Stress (Pain) (192)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **149** (gene 76) — Stage-2 receptor reading **Stress (Pain) (192)** ≥ 128 onto Circulatory locus 19
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **28** (gene 28) — Stage-2 emitter on Circulatory locus 19 producing aggregate **Stress (128)** at rate 24, **gain 8** (the third-highest of the nine per-cause cascades, behind Anger's 20 and Fear's 14)
- `DOCUMENTATION/CreaturesData/biochemistry.json:9080-9087` — Stress (Pain)'s halflives entry: genome byte 58, `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, speed "Medium"
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reaction 76 — `Stress + Prostaglandin → Stress + Fatty Acid` (gated by Injury), the feedback loop that connects Stress (Pain) to the depletion of pain-modulator Prostaglandin
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/187 - Stress (H4C).md` — sibling doc on the carb-hunger per-cause Stress, with the contrasting 621-tick half-life
- `DOCUMENTATION/chemicals/188 - Stress (H4P).md` — sibling doc on the protein-hunger per-cause Stress
- `DOCUMENTATION/chemicals/189 - Stress (H4F).md` — sibling doc on the fat-hunger per-cause Stress
- `DOCUMENTATION/chemicals/190 - Stress (Anger).md` — sibling doc on the anger per-cause Stress, with the highest Stage-2 gain (20) and the contrasting 214 Stage-1 threshold
- `DOCUMENTATION/chemicals/191 - Stress (Fear).md` — sibling doc on the fear per-cause Stress, with Stage-2 gain 14 and threshold 204
- `DOCUMENTATION/chemicals/148 - Pain.md` — upstream context on what Pain actually measures and what produces/consumes it (if present)
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (Pain) constant (the chemical is handled by the generic biochemistry engine)
