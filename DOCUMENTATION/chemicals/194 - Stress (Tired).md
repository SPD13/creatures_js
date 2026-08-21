# 194 - Stress (Tired)

**Stress (Tired)** is the per-cause Stress chemical that records *unmet need to rest physical exhaustion as a chronic source of suffering*. It is the dedicated bloodstream marker that says "this Norn has been physically exhausted long enough that the body is treating tiredness as a stressor". Chemical 194 occupies slot **194** of the 256-entry chemical table (`ChemicalNames.catalogue`), the eighth of the nine **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 194 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Tiredness (154)         ──[receptor 158, threshold 204]──▶  Circulatory locus 10
       Circulatory locus 10    ──[emitter 42, rate 14, gain 6]──▶  Stress (Tired) [194]
       Stress (Tired) [194]    ──[receptor 148, threshold 128]──▶  Circulatory locus 20
       Circulatory locus 20    ──[emitter 27, rate 24, gain 5]──▶ Stress [128]
```

Only when the **Tiredness drive climbs above 204/255** — the "moderate physiological stress" Stage-1 gate shared with Fear — does the receptor fire and Stress (Tired) start accumulating. Once present, Stress (Tired) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **311-tick half-life** ("Medium" band). Like Stress (H4P) (chemical 188), Stress (H4F) (189), Stress (Anger) (190), Stress (Fear) (191), Stress (Pain) (192), Stress (Sleep) (193), and Stress (Crowded) (195), Stress (Tired) decays at the standard rate shared by seven of the nine per-cause Stresses (188-195 except 187): tired stress leaves the body's stress memory at the same speed as fat hunger, protein hunger, pain, sleep, crowding, anger, and fear.

What sets Stress (Tired) apart from its eight siblings is the combination of its **moderate Stage-1 threshold (204)** and its **baseline Stage-2 gain of 5**. The Stage-1 receptor (id 158) latches at Tiredness ≥ 204, **13 units above** Pain's gate (191), the same as Fear (204), and **10 units below** the gates for the three hungers, Anger, and Sleep (214). Tiredness therefore registers as a chronic stressor at a *moderate* level of severity — earlier than the hunger-and-anger tier but later than Pain. The Stage-2 emitter (id 27) that converts elevated Stress (Tired) into aggregate Stress (128) fires at gain **5** — the same baseline tier as the three hungers, Sleep, and Crowded, and far below Pain (8), Fear (14), and Anger (20). Tiredness is, by genome design, *more readily recognised* as a stressor than hunger or sleep but *individually mild* in its contribution to aggregate Stress per tick.

Chemical 194 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "this Norn has been physically exhausted recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 10** — the Stage-1 Tiredness cascade | Emitter gene **9** (`biochemistry.json`, emitter id 42) | Creature / Circulatory / Locus 10 | `chemical=194, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 10 is driven up to 255 by receptor id 158 (gene 45) which reads chemical **154 Tiredness** with threshold **204** (DIGITAL, gain 255). When the Norn's Tiredness exceeds 204/255, locus 10 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (Tired) per firing | ~6 units per 14-tick window while Tiredness ≥ 204 |
| 2 | Direct `CHEM 194 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 194 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push aggregate Stress at the Tired-cascade weight without actually exhausting the Norn | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 194. The single Stage-1 emitter (id 42) is the only natural source, and it is gated entirely by the Tiredness drive via receptor 158. The Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (Tired), so an exhausted baby Norn will not contribute tiredness pressure to its mutation rate, even though Tiredness itself is one of the most active drives in baby life as Norns burn through energy with little stamina.

Chemical 194 has **no `initialConcentrations` entry** — every Creature is born with Stress (Tired) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **77** (receptor id 148) | Creature / Circulatory / Locus 20 | `chemical=194, threshold=128, nominal=0, gain=254, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (Tired) climbs above 128/255, this receptor latches Circulatory locus 20 to ~254/255 | Locus 20 in turn drives emitter id 27 (gene 30) which produces aggregate **Stress (128)** at rate 24, **gain 5** — the baseline per-cause gain shared by six of the nine cascades. Tired stress above 128 contributes a mild flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry::GetChemical(194)` | Creature / bloodstream (systemic) | Chemical 194 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (Tired)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from physical exhaustion?" becomes a first-class observable, useful for diagnosing over-activity, environmental obstacles to rest, brain-state pathologies that suppress rest behaviour, or mod-induced drives that interfere with the rest cycle |
| 3 | **Passive decay** | Halflives byte 194 = **58** | Bloodstream (systemic) | `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, "Medium" decay band. Multiplies Stress (Tired) by ~0.99777 every biochem tick | A Stress (Tired) spike halves in ~311 ticks. This matches seven of the eight other per-cause Stress chemicals — only Stress (H4C) (621 ticks) lingers longer. Tired stress is "remembered" for the standard duration |

There are no reactions, no other receptors, and no consumers that read chemical 194. The Stage-2 receptor (id 148) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 194 is one node in the genome's nine-fold per-cause Stress system, paired one-to-one with the Tiredness drive:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| Hunger for carbohydrate | 150 | 162 → locus 5 (thr 214) | 41 (rate 14, gain 6) | 187 Stress (H4C) | 154 → locus 14 (thr 128) | 33 (rate 24, gain 5) |
| Hunger for protein | 149 | 161 → locus 6 (thr 214) | 40 (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| Hunger for fat | 151 | 160 → locus 7 (thr 214) | 39 (rate 14, gain 6) | 189 Stress (H4F) | 152 → locus 16 (thr 128) | 31 (rate 24, gain 5) |
| Anger | 160 | 155 → locus 13 (thr 214) | 34 (rate 14, gain 6) | 190 Stress (Anger) | 151 → locus 17 (thr 128) | 30 (rate 24, gain 20) |
| Fear | 158 | 157 → locus 11 (thr 204) | 36 (rate 14, gain 6) | 191 Stress (Fear) | 150 → locus 18 (thr 128) | 29 (rate 24, gain 14) |
| Pain | 148 | 156 → locus 12 (thr 191) | 35 (rate 14, gain 6) | 192 Stress (Pain) | 149 → locus 19 (thr 128) | 28 (rate 24, gain 8) |
| Sleepiness | 155 | 159 → locus 9 (thr 214) | 38 (rate 14, gain 6) | 193 Stress (Sleep) | 147 → locus 21 (thr 128) | 26 (rate 24, gain 5) |
| **Tiredness** | **154** | **158 → locus 10** (thr 204) | **42 (rate 14, gain 6)** | **194 Stress (Tired)** | **148 → locus 20 (thr 128)** | **27 (rate 24, gain 5)** |
| Crowded | 157 | → locus 10 (thr 230, dual-use) | (rate 14, gain 6) | 195 Stress (Crowded) | 146 → locus 22 (thr 128) | 25 (rate 24, gain 5) |

Stress (Tired) sits as the **eighth** entry of this table because chemical 194 is the eighth per-cause Stress slot. Functionally it occupies a "moderate physiological need" position:

1. **Standard half-life (311 ticks)** — the same as six of the other seven per-cause Stresses. Tired stress decays at the baseline rate; only carb-hunger stress (H4C) lingers ~2× as long. The "memory" of physical exhaustion is therefore short — within a few minutes of the Norn finally getting to rest, Stress (Tired) is back below the Stage-2 threshold.
2. **Moderate distress threshold (204)** — tired stress kicks in earlier than the hungers, Sleep, or Anger but later than Pain. The genome encodes "ordinary tiredness from activity is not a stressor; sustained inability to recover is, and the body recognises it before it would recognise hunger or sleep deprivation". This puts Tired in the same trigger band as Fear, reflecting the genome's view that physical exhaustion is meaningfully debilitating once it sustains.
3. **Baseline Stage-2 gain (5)** — Stress (Tired) contributes the same per-source weight to aggregate Stress (128) as any of the three hungers, the Sleep path, or the Crowded path. Tired is the quietest tier of voice in the Stress chorus — alongside the other physiological-need cascades, and far below the three damage/psychological cascades (Pain 8, Fear 14, Anger 20).

### Why tiredness has a moderate Stage-1 threshold

The genome's Stage-1 threshold ladder is **191 (pain) → 204 (fear, tired) → 214 (hungers, sleep, anger) → 230 (crowded)**. Tired sits on the moderate-threshold tier shared with Fear. Three reasons this is consistent with the rest of the C3 chemistry:

1. **Tiredness is a normal, frequent drive but recovery is harder than for sleep.** Unlike Sleepiness (which a Norn can resolve in a few seconds of sleep), Tiredness recovers more slowly via the Tiredness-backup recovery reaction (reactions 25 and 75 — `Tiredness backup → Tiredness`, working in reverse to restore stamina). The genome therefore registers chronic tiredness as a stressor sooner than chronic sleepiness, because exhaustion that has not been resolved is a more reliable indicator of an actual problem.
2. **Physical exhaustion has direct behavioural consequences.** A tired Norn moves slowly, fights poorly, and may be unable to perform the physical actions needed to escape a threat. The genome encodes this real-world constraint by giving Tiredness an earlier Stage-1 gate than the food drives — the body recognises that chronic exhaustion compromises survival capability.
3. **The Stage-2 weight is the lowest tier.** With gain 5 — at the bottom of the per-cause weight ladder — the cascade does not over-amplify tiredness into a dominant mutation driver. The genome encodes "chronic exhaustion is genuinely bad, but not as evolutionarily corrosive as chronic pain, fear, or anger".

The combination of "moderate threshold (204)" and "low weight (5)" gives Tired a distinctive profile: it is **easier to trigger than the hungers, Sleep, Anger, or Crowded**, but its individual contribution to aggregate Stress is mild. In a complex distress event, Stress (Tired) typically rises before Stress (Sleep), Stress (Anger), or Stress (Hunger), and it contributes a small but real share to the aggregate.

### Why have Stress (Tired) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Tiredness → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 194 in three concrete ways:

1. **Per-cause readability.** Because Stress (Tired) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn exhausted-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a colony can see at a glance whether the Stress comes from social problems (Anger / Crowded / Fear elevated) versus food shortage (H4C / H4P / H4F elevated) versus injury (Pain elevated) versus rest-cycle disruption (Sleep / Tired elevated). Stress (Tired) elevated alone is the signature of a Norn who is being kept active beyond its capacity to recover stamina.
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Stress (Tired) takes the standard 311-tick half-life, but a modder could lengthen it to model "stamina debt" or shorten it to model "rapid recovery from exertion". A stamina-debt mod would make a Norn's overactivity contribute to mutation pressure even after they finally rest.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains. The Tired path uses gain **5** — baseline tier — making chemical 194 a mild contributor to aggregate Stress (128). A Norn that is *only* exhausted accumulates Stress (128) at the same modest rate as a Norn that is *only* hungry, and far slower than one in pain, fear, or anger.

### Stress (Tired) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 148, threshold 128) is digital, Stress (Tired) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the Tired path. Above it, the Stage-2 emitter (id 27) fires at a fixed rate of 24 with **gain 5**, regardless of *how far above* 128 the Stress (Tired) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether Stress (Tired) is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of tired stress** between roughly 0 and 128 where Stress (Tired) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly reaches high Tiredness, then rests, then resets the drive may register a small rise and fall in Stress (Tired) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained physical exhaustion, where Tiredness sits above 204 for an extended period, is required to push Stress (Tired) past 128 and start contributing to evolutionary pressure.

The combination of "moderate Stage-1 threshold (204)" and "low Stage-2 gain (5)" gives Tired a distinctive profile: it is *moderately easy to trigger* (mid-range gate at the input) and *mild once triggered* (low weight at the output). Compare with Pain, which is easy to trigger (gate 191) and moderate (weight 8); with Fear, which shares Tired's gate (204) but produces ~3× the aggregate Stress per tick (weight 14); and with the hungers, Sleep, and Crowded, which have higher gates (214-230) but the same baseline weight (5). Tired is firmly in the "common physiological state that becomes a stressor reasonably quickly when chronically unresolved, but contributes mildly" category.

### How Stress (Tired) propagates to the consumers of Stress (128)

Once Stress (Tired) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time exhausted conceive more-mutated offspring — but because Tired's Stage-2 weight is only 5, this contribution is mild relative to the upper-tier cascades. Exhausted lineages drift mutation pressure upward, but slowly.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert Prostaglandin into Fatty Acid. Stress (Tired) contributes to this only via its Stage-2 path; an uninjured but exhausted Norn whose only Stress source is the Tired cascade does not actually trigger reaction 76 (which is also gated by Injury). The Tired cascade's contribution to Stress-induced lipolysis is therefore primarily relevant in *combined* injury-plus-exhaustion scenarios.

Importantly, neither of these consumers reads chemical 194 *directly*. Stress (Tired) influences them only through Stage 2 of the cascade. This means:

- **Modders can mute the Tired contribution** by editing the Stage-2 emitter (id 27) to disable it without affecting the other per-cause Stresses — useful for "stamina-tolerant" lineages where chronic exhaustion should be uncomfortable but not select for evolution.
- **Modders can amplify the Tired contribution** by raising emitter 27's gain or by lowering the Stage-2 receptor's threshold (id 148) — useful for modelling species or breeds where physical exhaustion is rapidly debilitating, such as fragile sub-species or working breeds.
- **Modders can give tiredness its own dedicated downstream effect** by adding a brand-new receptor on chemical 194 — for example, a receptor that suppresses Glucose metabolism, depresses muscle output, reduces immune efficiency, or makes the Norn passive while exhausted, without going through aggregate Stress at all.

### Stress (Tired) vs. Tiredness drive (154) vs. Sleepiness drive (155)

These signals form the rest stack but measure different things on different timescales:

- **Tiredness (154)** is the *drive* — the brain's read of "I am physically exhausted". Rises with vigorous activity and falls when the Norn rests via the Tiredness-backup recovery reaction. Modulates the brain's instincts to slow down, lie down, and recover. This is a real-time signal — the Norn responds within seconds to onset (during exertion) and resolution (while resting).
- **Sleepiness (155)** is a *separate but related drive* — "I need to sleep". Has its own per-cause Stress (chemical 193 Stress (Sleep)) with its own cascade, threshold (214), and matching baseline gain (5). Tiredness and Sleepiness can be elevated independently — a Norn can be physically exhausted without being sleepy, and vice versa — though they often co-rise during prolonged activity.
- **Stress (Tired) (194)** is the *chronic-suffering marker* for unmet physical recovery. Only rises when the *Tiredness drive* has been above 204 for long enough that the Stage-1 emitter has accumulated chemical 194 in the bloodstream. Decays at the standard 311 ticks. This is an "I have been exhausted with no time to recover for a noticeable time" memory, used only for upstream long-term effects.
- **Aggregate Stress (128)** is the body-wide stress state — the sum across all nine cause paths. Elevated Stress (Tired) is *one* of the contributors, but a well-rested Norn can have elevated Stress (128) from any of the other eight causes; conversely, a briefly-exhausted Norn whose Stress (Tired) never crosses 128 contributes nothing.

A useful mental model: **Tiredness is the "I am physically exhausted" alarm; Stress (Tired) is the "I have been exhausted for too long without recovery" diary entry; aggregate Stress is the "this Norn is in poor shape" verdict drawn from all nine diary entries together — and the tired entry, like the hunger and sleep entries, is written in the smallest letters of the per-cause Stress family.**

### Stress (Tired) and the activity cycle

Of all the per-cause Stresses, Stress (Tired) is the one most tightly bound to physical activity in the simulation. In a normally-functioning Norn living in a normally-functioning environment:

- Tiredness rises during physical actions — running, fighting, climbing, hard work — and during sustained walking.
- The Norn slows down, lies down, or simply stands still, allowing the Tiredness-backup recovery reactions to run.
- Tiredness never sustains above 204 for long enough that the Stage-1 emitter accumulates meaningful Stress (Tired).
- Stress (Tired) therefore stays near 0 throughout the lifetime — invisible in the Kits, contributing nothing to mutation pressure.

When this cycle breaks — because the environment forces continual activity (e.g. a Norn being chased by a hostile agent), because brain pathology overrides the rest instinct, because mod content drives compulsive behaviour, because the Norn's stamina chemistry is impaired (low Tiredness-backup, broken recovery reactions), or because illness depletes recovery capacity — Tiredness ramps past 204 and stays there, and Stress (Tired) begins to accumulate. Elevated Stress (Tired) is therefore the unambiguous biochemical signature of a Norn whose physical-recovery cycle has been broken for an extended period.

### Comparison with Stress (Sleep)

Stress (Tired) and Stress (Sleep) are paired in the per-cause Stress system but encode different aspects of "the Norn needs to rest":

| Aspect | Stress (Tired) [194] | Stress (Sleep) [193] |
|--------|----------------------|----------------------|
| Source drive | Tiredness (154) | Sleepiness (155) |
| Stage-1 threshold | **204** | 214 |
| Stage-2 gain | 5 | 5 |
| Half-life | 311 ticks | 311 ticks |
| Triggering condition | Sustained physical *exhaustion* | Sustained inability to *sleep* |

The two cascades have the same baseline weight (5) and the same half-life (311) but different Stage-1 thresholds: Tired's gate is 204 (matching Fear), while Sleep's gate is 214 (matching the hungers and Anger). This means Tiredness is recognised as a chronic stressor at a moderate level, whereas Sleepiness must be quite severe before its cascade fires. The genome encodes "physical exhaustion is more readily acknowledged as a stressor than sleep deprivation per se".

In practice, Stress (Tired) often rises before Stress (Sleep) in distress events — a Norn pursued through a hostile environment becomes physically exhausted (and crosses Tired's 204 gate) before its sleep deprivation reaches the higher 214 gate. The two cascades together form the "rest deficit" portion of the per-cause Stress signal, and elevated Stress (Tired) plus Stress (Sleep) together is the distinctive signature of a Norn whose entire rest cycle has been broken.

### Comparison with the other "moderate-threshold" per-cause Stress

Stress (Tired) shares its Stage-1 threshold of 204 with exactly one other cascade:

- **Stress (Fear) — gate 204, gain 14.** Fear and Tired are both recognised at the same drive level, but Fear's Stage-2 weight is *almost three times* Tired's. The genome encodes "moderate fear and moderate exhaustion are both acknowledged early as stressors, but fear is a much more powerful contributor to chronic stress than tiredness is".

This pairing reveals the design philosophy: the threshold (204) marks "the body recognises this as a chronic stressor at a reasonable level of severity", while the gain (5 vs 14) marks "how much this kind of stressor matters to the long-term stress signal". Tired enters the cascade early (as Fear does) but contributes mildly (unlike Fear).

### Comparison with the other "baseline-weight" per-cause Stresses

Stress (Tired) shares the baseline Stage-2 gain of 5 with five other cascades:

- **Stress (H4C / H4P / H4F) — gain 5 each.** The three hunger Stresses. These differ from Tired in their higher Stage-1 thresholds (214) and (for H4C) in their longer half-life (621 vs 311 ticks). Hunger and tiredness are encoded as comparable mild physiological stressors, but tiredness fires earlier.
- **Stress (Sleep) — gain 5.** Closely related to Tired — see above.
- **Stress (Crowded) — gain 5.** The cascade for the Crowded drive. Differs from Tired in having the highest Stage-1 threshold of all (230) — crowding must be very persistent before it registers as chronic stress.
- **Stress (Tired) — gain 5.** The topic of this document.

Read together: the genome treats the *physiological-need* Stresses as equally weighted at the bottom of the per-cause hierarchy, distinguishing between them mainly via their Stage-1 thresholds (how quickly the drive triggers the cascade) and, for H4C, a longer half-life. Tired sits at the *low-threshold* end of this baseline tier, alongside Fear's matching gate but with one-third Fear's downstream weight.

### JS port notes

The Rebuild port treats chemical 194 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_TIRED` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (Tired)"` appears only in `ChemicalNames.catalogue`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (Tired) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). Two additional points specific to chemical 194:

- **The Stage-1 threshold of 204 is genome data, not engine-level magic.** The biochemistry tick loop must read the per-receptor threshold field from receptor id 158 rather than hard-coding "Tired stress triggers at 80%". Mods that retune the per-cause sensitivities — for example, lowering the tired gate to 191 to model a "frail" lineage, or raising it to 230 to model an "athletic" species — must be picked up automatically; baking the 191:204:214:230 threshold ladder into engine code would defeat the genome-driven design.
- **The Stage-1 receptor reads chemical 154 (Tiredness), not 155 (Sleepiness).** The two related drives sit in adjacent chemical slots and have parallel cascades (chemical 193 vs 194), but they are wired to different receptors (158 vs 159) and different loci (10 vs 9). Implementations that wire the cascades by chemical name rather than by chemical id must use the catalogue index 154 for the Tired path, and the corresponding Stage-1 receptor id 158 / Stage-1 emitter id 42 / Stage-2 receptor id 148 / Stage-2 emitter id 27. Note that the receptor/emitter ids do not run sequentially across the nine cascades: each path has its own id-pairs that must be looked up explicitly. Note also that locus 10 is *also* used by the Crowded receptor (with threshold 230); the bidirectional-locus design means Tired and Crowded share the same Stage-1 latch — though in practice the threshold separation (204 vs 230) and the much rarer occurrence of severe crowding mean the two rarely interfere.

### Practical consequences for gameplay

- **Stress (Tired) is uncommon in healthy Norns.** Because Tiredness is normally resolved by passive recovery and the Stage-1 gate is moderate (204), most Norns living in normally-functioning environments only briefly see Stress (Tired) elevated, after intense bursts of activity. Sustained elevation is therefore a strong signal of a problem.
- **Causes of elevated Stress (Tired).** Common scenarios include: an environment forcing continual activity (predators, bullies, hostile agents); brain pathology that drives compulsive movement or fighting; broken Tiredness-backup chemistry that prevents stamina recovery; chronic illness that depletes energy reserves; mod content that suppresses rest behaviour or accelerates Tiredness production.
- **Diagnosing tired stress in the Kits.** A Norn whose Stress (Tired) graph is rising while Tiredness is also high is in an active exhaustion state. A Norn with elevated Stress (Tired) and *low* Stress (Pain) / Stress (Fear) / Stress (Anger) is suffering specifically from inability to recover stamina, not from injury or psychological distress — useful for diagnosing over-activity, recovery-chemistry problems, or behavioural blocks. Elevated Stress (Tired) co-occurring with elevated Stress (Sleep) is the signature of a complete rest-cycle breakdown.
- **Over-activity colonies show a characteristic Stress (Tired) signature.** A Norn population in a metaroom designed for high-energy gameplay, or one being repeatedly harassed by aggressive agents, will show sustained elevated Stress (Tired) baselines. This is the unambiguous biochemical signature of a *physical-load problem* rather than a food, injury, or social-conflict problem.
- **Injecting Stress (Tired) is one of the gentlest mod levers for aggregate Stress.** `CHEM 194 150` raises Stress (Tired) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) at gain 5 for the next ~310 ticks without actually exhausting the Norn. This is one of the mildest per-cause injection options — useful for testing the mutation pathway in isolation when Pain (gain 8), Fear (gain 14), or Anger (gain 20) injections would be too strong. Hunger, Sleep, and Crowded injections produce similar gentle pushes.
- **Resolving tired stress is straightforward.** Letting the Norn finally rest — through removing the source of disturbance, allowing the Tiredness-backup recovery reactions to run, or directly setting Tiredness to zero — drops the drive below 204 and halts Stage-1 production. Existing Stress (Tired) decays at standard rate, falling below the Stage-2 threshold of 128 within ~310 ticks. A Norn that has just had a good rest no longer contributes tiredness-pressure to mutation within minutes.
- **Tired stress is one of the quietest cascades in the chorus.** Even sustained, chronic Stress (Tired) above 128 contributes only gain 5 to aggregate Stress per Stage-2 tick. A Norn whose only stress source is exhaustion drifts mutation pressure upward at the slowest rate — alongside pure-hunger, pure-sleeplessness, and pure-crowded scenarios. Significant evolutionary pressure from tiredness alone requires very long-term, very chronic over-activity; the genome is configured to treat the inability to recover stamina as a real but mild evolutionary signal, recognised earlier than hunger or sleep deprivation but contributing the same modest weight.

### Summary

```
   Tiredness (154) — the brain's "I am physically exhausted" drive
                       │  (rises with vigorous activity, recovers via Tiredness-backup reactions)
                       ▼  (bloodstream chemical, drive locus 10 of Circulatory)
          Receptor 158 (gene 45, DIGITAL, threshold 204)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 10 (floating, latched ~255)
                       │   (also shared with Crowded receptor, threshold 230)
          Emitter 42 (gene 9, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                  STRESS (Tired) [194]
        - No initial concentration (starts at 0)
        - Half-life = 311 ticks ("Medium", standard per-cause Stress rate)
        - Genome halflives byte = 58
                       │
                       ▼
          Receptor 148 (gene 77, DIGITAL, threshold 128, gain 254)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 20 (floating, latched ~254)
                       │
          Emitter 27 (gene 30, DIGITAL, rate 24, GAIN 5 — baseline tier)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst — Tired contributes only
                                in injury+exhaustion combined scenarios)

   Stress (Tired) is the chronic exhaustion marker:
     - Produced when Tiredness ≥ 204 sustains long enough
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Decays at the standard 311-tick half-life
     - BASELINE per-cause Stage-2 gain (5, shared with H4C/H4P/H4F/Sleep/Crowded)
     - The mildest tier of contributor to aggregate Stress
     - MODERATE Stage-1 gate (204) — recognised earlier than the hungers, Sleep,
       Anger, or Crowded; tied with Fear; later than Pain
     - Often co-elevated with Stress (Sleep) in broken-rest-cycle scenarios
     - Often co-elevated with Stress (Fear) in pursued-by-predator scenarios
     - The signature stress chemical of disrupted physical-recovery cycles
```

## Key Source References

- `ChemicalNames.catalogue` — the string `"Stress (Tired)"` as the 194th entry in the chemical-names table
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **158** (gene 45) — Stage-1 receptor reading **Tiredness (154)** ≥ 204 onto Circulatory locus 10
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **42** (gene 9) — Stage-1 emitter on Circulatory locus 10 producing **Stress (Tired) (194)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **148** (gene 77) — Stage-2 receptor reading **Stress (Tired) (194)** ≥ 128 onto Circulatory locus 20
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **27** (gene 30) — Stage-2 emitter on Circulatory locus 20 producing aggregate **Stress (128)** at rate 24, **gain 5** (the baseline per-cause Stage-2 gain shared by six of the nine cascades)
- `DOCUMENTATION/CreaturesData/biochemistry.json` — Stress (Tired)'s halflives entry: genome byte 58, `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, speed "Medium"
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reactions 25 and 75 — `Tiredness backup → Tiredness` recovery reactions that the Tired cascade depends on for normal resolution (when the Norn rests)
- `DOCUMENTATION/CreaturesData/biochemistry.json`, reaction 76 — `Stress + Prostaglandin → Stress + Fatty Acid` (gated by Injury), the consumer of aggregate Stress that Tired stress contributes to indirectly
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/187 - Stress (H4C).md` — sibling doc on the carb-hunger per-cause Stress, with the contrasting 621-tick half-life
- `DOCUMENTATION/chemicals/188 - Stress (H4P).md` — sibling doc on the protein-hunger per-cause Stress
- `DOCUMENTATION/chemicals/189 - Stress (H4F).md` — sibling doc on the fat-hunger per-cause Stress
- `DOCUMENTATION/chemicals/190 - Stress (Anger).md` — sibling doc on the anger per-cause Stress, with the highest Stage-2 gain (20)
- `DOCUMENTATION/chemicals/191 - Stress (Fear).md` — sibling doc on the fear per-cause Stress, sharing Tired's Stage-1 gate of 204 but with Stage-2 gain 14
- `DOCUMENTATION/chemicals/192 - Stress (Pain).md` — sibling doc on the pain per-cause Stress, Stage-2 gain 8 with the lowest Stage-1 gate (191)
- `DOCUMENTATION/chemicals/193 - Stress (Sleep).md` — sibling doc on the sleep per-cause Stress, the closest analogue to Tired with the higher Stage-1 gate of 214
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (Tired) constant (the chemical is handled by the generic biochemistry engine)
