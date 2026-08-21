# 191 - Stress (Fear)

**Stress (Fear)** is the per-cause Stress chemical that records *fear as a chronic source of suffering*. It is the dedicated bloodstream marker that says "this Norn has been seriously frightened long enough that the body is treating it as a stressor". Chemical 191 occupies slot **191** of the 256-entry chemical table, the fifth of the nine **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 191 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Fear (158)             ──[receptor 157, threshold 204]──▶  Circulatory locus 11
       Circulatory locus 11    ──[emitter 36, rate 14, gain 6]──▶  Stress (Fear) [191]
       Stress (Fear) [191]     ──[receptor 150, threshold 128]──▶  Circulatory locus 18
       Circulatory locus 18    ──[emitter 29, rate 24, gain 14]──▶ Stress [128]
```

Only when the **Fear drive climbs above 204/255** (a deep, sustained terror — not casual unease) does the Stage-1 receptor fire and Stress (Fear) start accumulating. Once present, Stress (Fear) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **311-tick half-life** ("Medium" band). Like its hunger siblings Stress (H4P) (chemical 188) and Stress (H4F) (chemical 189), and like Stress (Anger) (chemical 190), Stress (Fear) decays at the standard rate shared by seven of the nine per-cause Stresses (188-195 except 187): fear leaves the body's stress memory at the same speed as fat hunger, protein hunger, sleepiness, tiredness, crowding, anger, and pain.

What sets Stress (Fear) apart from its eight siblings is the combination of its **low Stage-1 threshold (204)** and its **second-highest Stage-2 gain (14)**. The Stage-1 receptor (id 157) latches at Fear ≥ 204, **ten units lower** than the threshold used by the three hunger types (214), Sleep (214), or Anger (214); it ties Tired (204) for the second-lowest gate among the nine, undercut only by Pain (191). And the Stage-2 emitter (id 29) that converts elevated Stress (Fear) into aggregate Stress (128) fires at gain **14** — **2.8× the baseline gain of 5** used by the three hunger Stresses, the Sleep / Tired / Crowded Stresses; **1.75× the Pain Stress weight (gain 8)**; and **70% of the Anger Stress weight (gain 20)**. Fear is, by genome design, the *second most potent contributor* to aggregate Stress per tick of cause-time, second only to Anger — and because its trigger threshold is lower, it begins contributing in situations where the angrier Norn would not yet have crossed its Stage-1 gate.

Chemical 191 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "a fear crisis was happening recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 11** — the Stage-1 Fear cascade | Emitter gene **15** (`biochemistry.json`, emitter id 36) | Creature / Circulatory / Locus 11 | `chemical=191, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 11 is driven up to 255 by receptor id 157 (gene 55) which reads chemical **158 Fear** with threshold **204** (DIGITAL, gain 255). When the Norn's Fear exceeds 204/255, locus 11 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (Fear) per firing | ~6 units per 14-tick window while Fear ≥ 204 |
| 2 | Direct `CHEM 191 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 191 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push aggregate Stress at a high per-source weight without actually frightening the Norn | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 191. The single Stage-1 emitter (id 36) is the only natural source, and it is gated entirely by the Fear drive via receptor 157. The Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (Fear), so a frightened baby Norn will not contribute fear pressure to its mutation rate, even though the Fear drive itself is active in babies.

Chemical 191 has **no `initialConcentrations` entry** — every Creature is born with Stress (Fear) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **75** (receptor id 150) | Creature / Circulatory / Locus 18 | `chemical=191, threshold=128, nominal=0, gain=255, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (Fear) climbs above 128/255, this receptor latches Circulatory locus 18 to ~255/255 | Locus 18 in turn drives emitter id 29 (gene 27) which produces aggregate **Stress (128)** at rate 24, **gain 14** — the second-highest per-cause gain of the nine cascades, beaten only by Anger's 20. Fear above 128 contributes a strong flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry.GetChemical(191)` | Creature / bloodstream (systemic) | Chemical 191 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (Fear)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from fear?" becomes a first-class observable, useful for diagnosing predator pressure, traumatic-event aftermaths, or chronic-anxiety lineages in colonies and for Kits/CAOS mods that want per-cause breakdowns |
| 3 | **Passive decay** | Halflives byte 191 = **58** | Bloodstream (systemic) | `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, "Medium" decay band. Multiplies Stress (Fear) by ~0.99777 every biochem tick | A Stress (Fear) spike halves in ~311 ticks (~5-10 game seconds depending on tick rate). This matches seven of the eight other per-cause Stress chemicals — only Stress (H4C) (621 ticks) lingers longer. Fear stress is "remembered" for the standard duration |

There are no reactions, no other receptors, and no consumers that read chemical 191. The Stage-2 receptor (id 150) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 191 is one node in the genome's nine-fold per-cause Stress system, paired one-to-one with the Fear drive:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| Hunger for carbohydrate | 150 | 162 → locus 5 (thr 214) | 41 (rate 14, gain 6) | 187 Stress (H4C) | 154 → locus 14 (thr 128) | 33 (rate 24, gain 5) |
| Hunger for protein | 149 | 161 → locus 6 (thr 214) | 40 (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| Hunger for fat | 151 | 160 → locus 7 (thr 214) | 39 (rate 14, gain 6) | 189 Stress (H4F) | 152 → locus 16 (thr 128) | 31 (rate 24, gain 5) |
| Anger | 160 | 155 → locus 13 (thr 214) | 34 (rate 14, gain 6) | 190 Stress (Anger) | 151 → locus 17 (thr 128) | 30 (rate 24, gain 20) |
| **Fear** | **158** | **157 → locus 11** (thr 204) | **36 (rate 14, gain 6)** | **191 Stress (Fear)** | **150 → locus 18** (thr 128) | **29 (rate 24, gain 14)** |
| Pain | 148 | 156 → locus 12 (thr 191) | (rate 14, gain 6) | 192 Stress (Pain) | 149 → locus 19 (thr 128) | 28 (rate 24, gain 8) |
| Sleepiness | 155 | → locus 9 (thr 214) | (rate 14, gain 6) | 193 Stress (Sleep) | 147 → locus 21 (thr 128) | 26 (rate 24, gain 5) |
| Tiredness | 154 | → locus 10 (thr 204) | (rate 14, gain 6) | 194 Stress (Tired) | 148 → locus 20 (thr 128) | 27 (rate 24, gain 5) |
| Crowded | 157 | → locus 10 (thr 230, dual-use) | (rate 14, gain 6) | 195 Stress (Crowded) | 146 → locus 22 (thr 128) | 25 (rate 24, gain 5) |

Stress (Fear) sits as the **fifth** entry of this table because chemical 191 is the fifth per-cause Stress slot. Functionally it occupies a unique position:

1. **Standard half-life (311 ticks)** — the same as six of the other seven per-cause Stresses. Fear stress decays at the baseline rate; only carb-hunger stress (H4C) lingers ~2× as long. The "memory" of a fear crisis is therefore short — within a few minutes of the Norn calming down (predator gone, dark room exited, safe room re-entered), Stress (Fear) is back below the Stage-2 threshold.
2. **Lower distress threshold (204)** — fear stress kicks in earlier than the hunger / sleep / anger paths. Sustained Fear in the 204-213 band already produces Stress (Fear), where the same level of Anger or Sleepiness would not yet have triggered. This makes the Fear cascade sensitive to terror that does not need to reach absolute maximum to register as a chronic stressor, mirroring the real-world observation that even moderate sustained fright is corrosive.
3. **Second-highest Stage-2 gain (14)** — Stress (Fear) contributes **2.8 times** the per-source weight of any hunger Stress, **1.75×** that of Pain Stress, and **70%** that of Anger Stress to aggregate Stress (128). Fear is the second-loudest single voice in the Stress chorus, a very strong contributor in its own right.

### Why fear has the second-highest Stage-2 weight

The genome's Stage-2 gain ladder is **5 (hungers / sleep / tired / crowded) → 8 (pain) → 14 (fear) → 20 (anger)**. Read as a hierarchy of "how worth getting stressed about this is", it places fear behind only anger — ahead of pain, ahead of every physiological need. Three reasons this is consistent with the rest of the C3 chemistry:

1. **Fear drives flight behaviour, and flight breaks colony cohesion almost as much as fight does.** A Norn whose Fear sits sustainedly above 204 will be repeatedly choosing avoidance instincts (run-from, retreat, hide); aggregating that into the second-strongest mutation pressure means the colony's evolutionary path bends quickly when sustained predation, environmental terror, or social phobia takes hold. The genome encodes a strong selection signal *against* lineages that cannot cope with their environment.
2. **Fear is, biochemically, the strongest catecholamine spike after anger.** The standard Norn genome's Fear drive is fed by Adrenaline (chemical 31) build-ups and by Pain — both of which represent acute physiological alarm. The 14-gain weighting on the per-cause Stress reflects that "frightened Norn = high adrenaline, high cortisol-equivalent state" deserves the second-heaviest mutation-rate push, after anger's full fight-response loading.
3. **Fear Stress is a chronic-environment marker.** Combined with the lower threshold (204) and the standard 311-tick half-life, a gain-14 Stage-2 emitter means that a Norn caught in a chronically-frightening environment (e.g. always near predators, always near hot zones, repeatedly grabbed by hostile Norns) will accumulate substantial aggregate Stress without ever needing the full intensity of an anger episode. Fear is the cascade most likely to *plateau* at elevated levels, where Anger more often *spikes*.

### Why have Stress (Fear) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Fear → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 191 in three concrete ways:

1. **Per-cause readability.** Because Stress (Fear) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn fear-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a colony can see at a glance whether the Stress comes from social problems (Anger / Crowded / Fear elevated) versus food shortage (H4C / H4P / H4F elevated) versus exhaustion (Sleep / Tired elevated). Stress (Fear) elevated alone is the signature of a Norn caught in a chronically-frightening situation — predator presence, hostile Grendel proximity, repeated injury contexts, or a phobia of a particular room or agent.
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Stress (Fear) takes the standard 311-tick half-life, but a modder could lengthen it to model "trauma memory" — the same one-byte change that makes Stress (H4C) linger. A trauma-memory mod would make a Norn's frightening encounters contribute to mutation pressure long after the immediate threat has passed, turning Stress (Fear) into a PTSD-equivalent biochemical fingerprint.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains. The Fear path uses gain **14** — the second-highest — making chemical 191 the per-cause Stress with the second-strongest single-source effect on aggregate Stress (128) after Anger. A Norn that is *only* fearful will accumulate Stress (128) faster than a Norn that is *only* in pain or starving, but slower than a Norn that is *only* angry.

### Stress (Fear) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 150, threshold 128) is digital, Stress (Fear) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the Fear path. Above it, the Stage-2 emitter (id 29) fires at a fixed rate of 24 with **gain 14**, regardless of *how far above* 128 the Stress (Fear) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether Stress (Fear) is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of fear stress** between roughly 0 and 128 where Stress (Fear) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly gets scared, escapes the threat, and calms down may register a small rise and fall in Stress (Fear) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained or repeated fear is required to push Stress (Fear) past 128 and start contributing to evolutionary pressure.

The combination of "lower Stage-1 threshold (204)" and "high Stage-2 gain (14)" gives Fear an interesting profile: it is *easy to trigger* (low gate at the input) and *strong once triggered* (heavy weight at the output). Compare with Anger, which is harder to trigger (gate 214) but stronger when it does fire (weight 20); and with the hungers, which share Anger's gate (214) but have the weakest weight (5). Fear is the cascade most likely to be "running" at any given moment in a wild colony.

### How Stress (Fear) propagates to the consumers of Stress (128)

Once Stress (Fear) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time afraid conceive more-mutated offspring — and because the Stage-2 gain is 14 (the second-highest), a frightened Norn is the second-fastest per-cause path to elevated mutation, behind only an angry Norn.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert the pain modulator Prostaglandin into Fatty Acid. A Norn that has been afraid and is also injured will burn through circulating Prostaglandin into mobilisable fat faster — biochemically consistent with the classic "fight-or-flight" response liberating energy stores, here on the *flight* side of the dichotomy.

Importantly, neither of these consumers reads chemical 191 *directly*. Stress (Fear) influences them only through Stage 2 of the cascade. This means:

- **Modders can mute the Fear contribution** by editing the Stage-2 emitter (id 29) to disable it without affecting the other per-cause Stresses — useful for "wilderness survival" colonies where fear should be a normal living condition rather than an evolutionary driver.
- **Modders can amplify the Fear contribution further** by raising emitter 29's gain even higher or by lowering the Stage-2 receptor's threshold (id 150) — useful for "anxiety-driven evolution" experiments where fear should select harder than anger.
- **Modders can give fear its own dedicated downstream effect** by adding a brand-new receptor on chemical 191 — for example, a receptor that elevates a "freeze" instinct, modifies adrenaline production, or triggers a sustained-fear hibernation response, without going through aggregate Stress at all.

### Stress (Fear) vs. Fear drive (158) vs. NFP signals

These chemicals form the fear stack but measure different things on different timescales:

- **Fear (158)** is the *drive* — the brain's read of "I am afraid right now". Rises through brain-language NFP (negative-feedback) signalling when the Norn perceives threats, suffers attacks, or encounters frightening agents/locations; falls through the brain's drive-decay and through reaching safe locations or comforting interactions. Modulates the brain's instincts to flee, retreat, and avoid. This is a real-time signal — the Norn responds to it within seconds.
- **Stress (Fear) (191)** is the *chronic-suffering marker* for fear. Only rises when the *drive* has been above 204 for long enough that the Stage-1 emitter has accumulated chemical 191 in the bloodstream. Decays at the standard 311 ticks. This is an "I have been afraid for a noticeable time" memory, used only for upstream long-term effects.
- **Aggregate Stress (128)** is the body-wide stress state — the sum across all nine cause paths. Elevated Stress (Fear) is *one* of the contributors, but a non-fearful Norn can have elevated Stress (128) from any of the other eight causes; conversely, a briefly-frightened Norn whose Stress (Fear) never crosses 128 contributes nothing.

A useful mental model: **Fear is the "I am scared now" alarm; Stress (Fear) is the "I have been scared too long" diary entry; aggregate Stress is the "this Norn is in poor shape" verdict drawn from all nine diary entries together — and the fear entry is written in heavy, second-only-to-anger letters.**

### Comparison with the other "bold" per-cause Stresses

The Stage-2 gain ladder makes a clear hierarchy among the nine per-cause Stresses:

- **Stress (Anger) — gain 20.** The strongest single-cause Stress in the genome. Sustained anger drives mutation pressure faster than any other cause.
- **Stress (Fear) — gain 14.** The second-strongest, and the topic of this document. Sustained fear pushes mutation pressure ~70% as hard as anger does. Useful comparison: a chronically-frightened Norn evolves nearly as fast as a chronically-angry one, but a chronically-hungry Norn evolves far slower. Combined with the lower Stage-1 threshold (204 vs anger's 214), fear is also *easier* to trigger than anger — meaning that in a wild colony where both anger and fear are common, the *fear* path is often the dominant driver of aggregate Stress despite anger having the higher per-tick weight.
- **Stress (Pain) — gain 8.** Mid-tier. Pain stress is a real contributor but ~1.75× weaker than fear. Reflects that physical injury is a signal worth selecting against, but less so than chronic fear.
- **Stress (H4C / H4P / H4F / Sleep / Tired / Crowded) — gain 5 each.** Baseline. Six of the nine Stresses share the lowest gain, reflecting that no single physical-need scarcity is, on its own, treated as severely as Pain, Fear, or Anger.

Read together: the genome treats the *psychological* Stresses (Anger, Fear, Pain) as more severe contributors to evolutionary pressure than the *physiological* ones (the three hungers, sleep, tired, crowded), and within the psychological group it ranks Anger > Fear > Pain. This is consistent with C3's "Norn society" theme: a population that lives in fear or fights constantly is a population whose lineage the genome strongly pushes to mutate.

### The fear/anger threshold asymmetry

A noteworthy structural detail: Fear's Stage-1 threshold is **204**, but Anger's is **214**. Because the two cascades use the same Stage-1 rate (14) and gain (6), the Fear path is *strictly easier to trigger* than the Anger path. In a Norn whose Fear and Anger drives both rise gradually together (a common pattern under prolonged threat — afraid of the Grendel approaching, then angry at the Grendel attacking), Stress (Fear) starts accumulating ~10 drive-units earlier than Stress (Anger). This means:

- In **mixed-emotion crises**, the Fear cascade contributes to aggregate Stress *first*, then Anger joins it, then both contribute together until the situation resolves.
- In **pure-fear crises** (predator avoidance, traumatic-room phobia), the Fear cascade can run alone for extended periods, producing a *single-source* Stress signature that is unmistakable in the Kits.
- In **pure-anger crises** without fear (e.g. Norn-on-Norn aggression with no perceived danger), the Anger cascade runs alone and produces its own characteristic signature — but the Fear cascade is more often the "running solo" cause because so many environmental threats produce fear without anger.

The asymmetry encodes a design preference: the genome is more sensitive to *being scared of the world* than to *being angry at the world*. A young Norn cataloguing its environment as full of frightening things will mutate its lineage faster than one cataloguing it as full of frustrating things, even at equal drive levels.

### JS port notes

The Rebuild port treats chemical 191 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_FEAR` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (Fear)"` appears only in `ChemicalNames.catalogue:267`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (Fear) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). Two additional points specific to chemical 191:

- **The Stage-1 threshold of 204 is genome data, not engine-level magic.** The biochemistry tick loop must read the per-receptor threshold field from receptor id 157 rather than hard-coding "Fear stress triggers at 80%". Mods that retune the per-cause sensitivities — for example, lowering the fear gate to 150 to model a "skittish" lineage — must be picked up automatically; baking the 204:214:191:230 threshold ladder into engine code would defeat the genome-driven design.
- **The Stage-1 receptor reads chemical 158 (Fear), not 153 (Hotness) or 159 (Boredom).** The chemical-name catalogue ordering puts Hotness at 153, Tiredness at 154, Sleepiness at 155, Loneliness at 156, Crowded at 157, Fear at 158, Boredom at 159, Anger at 160 — easy to misread when wiring receptors by name. Implementations that wire the cascade by chemical name rather than by chemical id must use the catalogue index 158 for the Fear path, and the corresponding Stage-1 receptor id 157 / Stage-1 emitter id 36 / Stage-2 receptor id 150 / Stage-2 emitter id 29. A common bug is to assume parallel structure with the hunger triplet (where receptor and emitter ids run sequentially in tidy blocks): the fear cascade uses non-sequential ids that must be looked up explicitly.

### Practical consequences for gameplay

- **Fear is the easiest path to colony-wide mutation pressure.** Because the Stage-1 gate is the second-lowest in the genome (204, tied with Tired and undercut only by Pain at 191) and the Stage-2 gain is the second-highest (14, behind only Anger at 20), sustained environmental threat drives the colony's mutation rate efficiently. A colony living near a Grendel spawn point, in a hot or cold biome, or in repeated proximity to dangerous machines will mutate noticeably faster than a peaceful colony, even without any inter-Norn aggression.
- **Stress (Fear) tracks its cause closely.** Resolving the threat — moving the Norn to a safe room, removing the predator, providing Comfort interactions — will quickly drop Fear (158) below the 204 cascade threshold, halting Stage-1 production of chemical 191. The existing Stress (Fear) in the bloodstream then decays at standard rate — within ~310 ticks of the resolution, it is below the Stage-2 threshold of 128 and stops contributing to aggregate Stress.
- **Diagnosing fear stress in the Kits.** A Norn whose Stress (Fear) graph is rising while Fear drive is also high is in an active fear crisis. A Norn with elevated Stress (Fear) and *low* Stress (Anger) / Stress (Pain) is suffering specifically from environmental or social fear, not from generalised psychological distress — useful for diagnosing predator pressure, room phobias, or chronic-anxiety lineages. Because Stress (Fear) decays at the standard rate, a flat-elevated reading without ongoing high Fear is unusual and may indicate a phobic agent or a frightening room the Norn is intermittently entering.
- **Frightened colonies show a characteristic Stress (Fear) signature.** A Norn population with chronic Grendel exposure, repeated injury experiences, or proximity to dangerous environmental agents will show sustained elevated Stress (Fear) baselines in all individuals, often with Stress (Pain) co-elevated (because frightening environments often hurt) and Stress (Crowded) low (because frightened Norns scatter). This is the unambiguous biochemical signature of an unsafe environment and the cleanest in-game way to diagnose it.
- **Injecting Stress (Fear) is a strong mod lever.** `CHEM 191 150` raises Stress (Fear) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) at the second-highest per-cause weight (gain 14) for the next ~310 ticks without actually frightening the Norn. This is the second-most-efficient way to push aggregate Stress through CAOS without using `CHEM 128` directly (after Stress (Anger) injection) — useful for testing the mutation pathway in isolation or for mods that want to simulate environmental anxiety without triggering flight instincts.
- **The "skittish baseline" pattern.** Because Stress (Fear) decays in 311 ticks but the Stage-1 threshold is the second-lowest in the genome, a Norn that experiences brief, frequent fear episodes (e.g. repeatedly walking past a frightening agent) can sustain a low-grade Stress (Fear) plateau that pushes aggregate Stress consistently above its consumer thresholds without ever spiking dramatically. This produces the biochemical signature of a "nervous Norn" — a creature whose fear stress is always running, always contributing to mutation, and always elevated even when the immediate environment seems calm.

### Summary

```
   Fear (158) — the brain's "I am scared" drive
                       │
                       ▼  (bloodstream chemical, drive locus 11 of Circulatory)
          Receptor 157 (gene 55, DIGITAL, threshold 204)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 11 (floating, latched ~255)
                       │
          Emitter 36 (gene 15, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                  STRESS (Fear) [191]
        - No initial concentration (starts at 0)
        - Half-life = 311 ticks ("Medium", standard per-cause Stress rate)
        - Genome halflives byte = 58
                       │
                       ▼
          Receptor 150 (gene 75, DIGITAL, threshold 128, gain 255)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 18 (floating, latched ~255)
                       │
          Emitter 29 (gene 27, DIGITAL, rate 24, GAIN 14 — second-highest of the nine)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst)

   Stress (Fear) is the chronic fear marker:
     - Produced when Fear ≥ 204 sustains long enough (LOWER threshold than the hungers/anger)
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Decays at the standard 311-tick half-life
     - SECOND-HIGHEST per-cause Stage-2 gain in the genome (14 vs 5/8/20)
     - The second-strongest single-source contributor to aggregate Stress
     - Easier to trigger than Anger Stress (gate 204 vs 214) but weaker per tick (gain 14 vs 20)
     - Tracks its cause closely — fades within minutes of the Norn reaching safety
     - The signature stress chemical of frightening / unsafe environments
```

## Key Source References

- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **157** (gene 55) — Stage-1 receptor reading **Fear (158)** ≥ 204 onto Circulatory locus 11
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **36** (gene 15) — Stage-1 emitter on Circulatory locus 11 producing **Stress (Fear) (191)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **150** (gene 75) — Stage-2 receptor reading **Stress (Fear) (191)** ≥ 128 onto Circulatory locus 18
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **29** (gene 27) — Stage-2 emitter on Circulatory locus 18 producing aggregate **Stress (128)** at rate 24, **gain 14** (the second-highest of the nine per-cause cascades, behind only Anger's 20)
- `DOCUMENTATION/CreaturesData/biochemistry.json:9072-9078` — Stress (Fear)'s halflives entry: genome byte 58, `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, speed "Medium"
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/187 - Stress (H4C).md` — sibling doc on the carb-hunger per-cause Stress, with the contrasting 621-tick half-life
- `DOCUMENTATION/chemicals/188 - Stress (H4P).md` — sibling doc on the protein-hunger per-cause Stress
- `DOCUMENTATION/chemicals/189 - Stress (H4F).md` — sibling doc on the fat-hunger per-cause Stress, with the same 311-tick standard half-life
- `DOCUMENTATION/chemicals/190 - Stress (Anger).md` — sibling doc on the anger per-cause Stress, with the highest Stage-2 gain (20) and the contrasting 214 Stage-1 threshold
- `DOCUMENTATION/chemicals/158 - Fear.md` — upstream context on what Fear actually measures and what produces/consumes it (if present)
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (Fear) constant (the chemical is handled by the generic biochemistry engine)
