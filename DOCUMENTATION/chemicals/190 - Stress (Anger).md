# 190 - Stress (Anger)

**Stress (Anger)** is the per-cause Stress chemical that records *anger as a chronic source of suffering*. It is the dedicated bloodstream marker that says "this Norn has been seriously angry long enough that the body is treating it as a stressor". Chemical 190 occupies slot **190** of the 256-entry chemical table, the fourth of the nine **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 190 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Anger (160)            ──[receptor 155, threshold 214]──▶  Circulatory locus 13
       Circulatory locus 13    ──[emitter 34, rate 14, gain 6]──▶  Stress (Anger) [190]
       Stress (Anger) [190]    ──[receptor 151, threshold 128]──▶  Circulatory locus 17
       Circulatory locus 17    ──[emitter 30, rate 24, gain 20]──▶ Stress [128]
```

Only when the **Anger drive climbs above 214/255** (a deep, sustained rage — not casual irritation) does the Stage-1 receptor fire and Stress (Anger) start accumulating. Once present, Stress (Anger) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **311-tick half-life** ("Medium" band). Like its hunger siblings Stress (H4P) (chemical 188) and Stress (H4F) (chemical 189), and unlike the special-cased Stress (H4C) (621 ticks), Stress (Anger) decays at the standard rate shared by seven of the nine per-cause Stresses (188-195 except 187): anger leaves the body's stress memory at the same speed as fat hunger, protein hunger, sleepiness, tiredness, crowding, fear (191), and pain (192).

What sets Stress (Anger) apart from its eight siblings is the **Stage-2 weighting**. The Stage-2 emitter (id 30) that converts elevated Stress (Anger) into aggregate Stress (128) fires at gain **20** — **four times the baseline gain of 5** used by the three hunger Stresses, the Sleep / Tired / Crowded Stresses; **2.5× the Pain Stress weight (gain 8)**; and **~1.4× the Fear Stress weight (gain 14)**. Anger is, by genome design, the *single most potent contributor* to aggregate Stress per tick of cause-time — a 255-anger Norn pushes the mutation-rate loci and the stress-induced lipolysis reaction substantially harder than a 255-painful or 255-fearful one.

Chemical 190 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "an anger crisis was happening recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 13** — the Stage-1 Anger cascade | Emitter gene **14** (`biochemistry.json`, emitter id 34) | Creature / Circulatory / Locus 13 | `chemical=190, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 13 is driven up to 255 by receptor id 155 (gene 57) which reads chemical **160 Anger** with threshold **214** (DIGITAL, gain 255). When the Norn's Anger exceeds 214/255, locus 13 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (Anger) per firing | ~6 units per 14-tick window while Anger ≥ 214 |
| 2 | Direct `CHEM 190 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 190 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push aggregate Stress at the highest per-source weight without actually angering the Norn | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 190. The single Stage-1 emitter (id 34) is the only natural source, and it is gated entirely by the Anger drive via receptor 155. The Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (Anger), so an angry baby Norn will not contribute anger pressure to its mutation rate.

Chemical 190 has **no `initialConcentrations` entry** — every Creature is born with Stress (Anger) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **74** (receptor id 151) | Creature / Circulatory / Locus 17 | `chemical=190, threshold=128, nominal=0, gain=254, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (Anger) climbs above 128/255, this receptor latches Circulatory locus 17 to ~254/255 | Locus 17 in turn drives emitter id 30 (gene 26) which produces aggregate **Stress (128)** at rate 24, **gain 20** — the highest per-cause gain of the nine cascades. Anger above 128 contributes a strong flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry.GetChemical(190)` | Creature / bloodstream (systemic) | Chemical 190 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (Anger)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from anger?" becomes a first-class observable, useful for diagnosing social or aggression-driven stress in colonies and for Kits/CAOS mods that want per-cause breakdowns |
| 3 | **Passive decay** | Halflives byte 190 = **58** | Bloodstream (systemic) | `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, "Medium" decay band. Multiplies Stress (Anger) by ~0.99777 every biochem tick | A Stress (Anger) spike halves in ~311 ticks (~5-10 game seconds depending on tick rate). This matches seven of the eight other per-cause Stress chemicals — only Stress (H4C) (621 ticks) lingers longer. Anger stress is "remembered" for the standard duration |

There are no reactions, no other receptors, and no consumers that read chemical 190. The Stage-2 receptor (id 151) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 190 is one node in the genome's nine-fold per-cause Stress system, paired one-to-one with the Anger drive:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| Hunger for carbohydrate | 150 | → locus 5 (thr 214) | 41 (rate 14, gain 6) | 187 Stress (H4C) | 154 → locus 14 (thr 128) | 33 (rate 24, gain 5) |
| Hunger for protein | 149 | 161 → locus 6 (thr 214) | 40 (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| Hunger for fat | 151 | 160 → locus 7 (thr 214) | 39 (rate 14, gain 6) | 189 Stress (H4F) | 152 → locus 16 (thr 128) | 31 (rate 24, gain 5) |
| **Anger** | **160** | **155 → locus 13** (thr 214) | **34 (rate 14, gain 6)** | **190 Stress (Anger)** | **151 → locus 17** (thr 128) | **30 (rate 24, gain 20)** |
| Fear | 153 | → locus 11 (thr 204) | (rate 14, gain 6) | 191 Stress (Fear) | 150 → locus 18 (thr 128) | 29 (rate 24, gain 14) |
| Pain | 148 | → locus 12 (thr 191) | (rate 14, gain 6) | 192 Stress (Pain) | 149 → locus 19 (thr 128) | 28 (rate 24, gain 8) |
| Sleepiness | 156 | → locus 9 (thr 214) | (rate 14, gain 6) | 193 Stress (Sleep) | 147 → locus 21 (thr 128) | 26 (rate 24, gain 5) |
| Tiredness | 154 | → locus 10 (thr 204) | (rate 14, gain 6) | 194 Stress (Tired) | 148 → locus 20 (thr 128) | 27 (rate 24, gain 5) |
| Crowded | 159 | → locus 10 (thr 230, dual-use) | (rate 14, gain 6) | 195 Stress (Crowded) | 146 → locus 22 (thr 128) | 25 (rate 24, gain 5) |

Stress (Anger) sits as the **fourth** entry of this table because chemical 190 is the fourth per-cause Stress slot. Functionally it occupies a unique position:

1. **Standard half-life (311 ticks)** — the same as six of the other seven per-cause Stresses. Anger stress decays at the baseline rate; only carb-hunger stress (H4C) lingers ~2× as long. The "memory" of an anger crisis is therefore short — within a few minutes of the Norn calming down, Stress (Anger) is back below the Stage-2 threshold.
2. **High distress threshold (214)** — only deep anger triggers the Stage-1 cascade. Mild irritation (drive < 214) does not produce Stress (Anger) at all. This is the same threshold used for the three hunger types and for sleepiness; it is well above moderate-discomfort levels.
3. **Maximum Stage-2 gain (20)** — Stress (Anger) contributes **four times** the per-source weight of any hunger Stress, **2.5×** that of Pain Stress, and **~1.4×** that of Fear Stress to aggregate Stress (128). Anger is, by genome design, the loudest single voice in the Stress chorus.

### Why anger has the highest Stage-2 weight

The genome's Stage-2 gain ladder is **5 (hungers / sleep / tired / crowded) → 8 (pain) → 14 (fear) → 20 (anger)**. Read as a hierarchy of "how worth getting stressed about this is", it puts anger ahead of every other cause — even pain, even fear. Three reasons this is consistent with the rest of the C3 chemistry:

1. **Anger drives violent behaviour, and violent behaviour breaks colony cohesion.** A Norn whose Anger sits sustainedly above 214 will be repeatedly choosing aggressive instincts (slap, push, retreat-from); aggregating that into the strongest mutation pressure means the colony's evolutionary path bends quickly when sustained inter-Norn aggression takes hold. The genome encodes a strong selection signal *against* persistently angry lineages.
2. **Anger is, biochemically, the strongest catecholamine spike.** The standard Norn genome's Anger drive is fed (via its own receptors and Adrenaline interactions) by Adrenaline (chemical 31) and Glycotoxin (chemical 5) build-ups — both of which represent acute physiological alarm. The 20-gain weighting on the per-cause Stress reflects that "angry Norn = high adrenaline, high glycotoxin, high cortisol-equivalent state" deserves the heaviest mutation-rate push.
3. **Anger Stress saturates fast.** Combined with the standard 311-tick half-life, a gain-20 Stage-2 emitter means that a Norn whose Anger crosses 214 even briefly will push aggregate Stress (128) up by a noticeable amount. The ratio (gain 20 : decay constant) is far higher than for any other cause, which means Stress (Anger) is the per-cause path that most easily *spikes* aggregate Stress, even from short anger episodes.

### Why have Stress (Anger) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Anger → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 190 in three concrete ways:

1. **Per-cause readability.** Because Stress (Anger) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn anger-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a colony can see at a glance whether the Stress comes from social problems (Anger / Crowded / Fear elevated) versus food shortage (H4C / H4P / H4F elevated) versus exhaustion (Sleep / Tired elevated). Stress (Anger) elevated alone is the signature of a Norn locked in sustained aggression — the in-game biochemical fingerprint of a "fighter" or of a Norn caught in repeated negative social interactions.
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Stress (Anger) takes the standard 311-tick half-life, but a modder could lengthen it to model "grudge memory" — the same one-byte change that makes Stress (H4C) linger. A grudge-memory mod would make a Norn's anger episodes contribute to mutation pressure long after the Norn has visibly calmed down.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains. The Anger path uses gain **20** — the highest — making chemical 190 the per-cause Stress with the strongest single-source effect on aggregate Stress (128). A Norn that is *only* angry will accumulate Stress (128) faster than a Norn that is *only* fearful, in pain, or starving on any single nutrient.

### Stress (Anger) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 151, threshold 128) is digital, Stress (Anger) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the Anger path. Above it, the Stage-2 emitter (id 30) fires at a fixed rate of 24 with **gain 20**, regardless of *how far above* 128 the Stress (Anger) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether Stress (Anger) is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of anger stress** between roughly 0 and 128 where Stress (Anger) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly gets angry, has the conflict resolved, and calms down may register a small rise and fall in Stress (Anger) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained or repeated anger is required to push Stress (Anger) past 128 and start contributing to evolutionary pressure.

The combination of "high Stage-2 gain (20)" and "threshold-128 gate" means anger has the largest *binary* effect of the nine cascades: when the gate flips, it flips harder than any other cause. Below 128 → no contribution at all; above 128 → the strongest single-source push to aggregate Stress in the genome.

### How Stress (Anger) propagates to the consumers of Stress (128)

Once Stress (Anger) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time angry conceive more-mutated offspring — and because the Stage-2 gain is 20 (the highest), an angry Norn is the *fastest* per-cause path to elevated mutation.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert the pain modulator Prostaglandin into Fatty Acid. A Norn that has been angry and is also injured will burn through circulating Prostaglandin into mobilisable fat faster — biochemically consistent with the classic "fight-or-flight" response liberating energy stores.

Importantly, neither of these consumers reads chemical 190 *directly*. Stress (Anger) influences them only through Stage 2 of the cascade. This means:

- **Modders can mute the Anger contribution** by editing the Stage-2 emitter (id 30) to disable it without affecting the other per-cause Stresses — useful for "pacifist" colonies where aggression should not drive evolution.
- **Modders can amplify the Anger contribution further** by raising emitter 30's gain even higher or by lowering the Stage-2 receptor's threshold (id 151) — but note that gain 20 already exceeds every other path, so this is rarely needed.
- **Modders can give anger its own dedicated downstream effect** by adding a brand-new receptor on chemical 190 — for example, a receptor that elevates an "aggression" instinct, modifies adrenaline production, or triggers a stress-aggression feedback loop, without going through aggregate Stress at all.

### Stress (Anger) vs. Anger drive (160) vs. NFP signals

These chemicals form the anger stack but measure different things on different timescales:

- **Anger (160)** is the *drive* — the brain's read of "I am angry right now". Rises through brain-language NFP (negative-feedback) signalling when the Norn experiences punishment, repeated thwarting, or aggressive interactions; falls through the brain's drive-decay and through positive social interactions. Modulates the brain's instincts to slap, push, and retreat. This is a real-time signal — the Norn responds to it within seconds.
- **Stress (Anger) (190)** is the *chronic-suffering marker* for anger. Only rises when the *drive* has been above 214 for long enough that the Stage-1 emitter has accumulated chemical 190 in the bloodstream. Decays at the standard 311 ticks. This is an "I have been angry for a noticeable time" memory, used only for upstream long-term effects.
- **Aggregate Stress (128)** is the body-wide stress state — the sum across all nine cause paths. Elevated Stress (Anger) is *one* of the contributors, but a non-angry Norn can have elevated Stress (128) from any of the other eight causes; conversely, a briefly-angry Norn whose Stress (Anger) never crosses 128 contributes nothing.

A useful mental model: **Anger is the "I am angry now" shouting; Stress (Anger) is the "I have been shouting too long" diary entry; aggregate Stress is the "this Norn is in poor shape" verdict drawn from all nine diary entries together — and the anger entry is written in the boldest letters.**

### Comparison with the other "bold" per-cause Stresses

The Stage-2 gain ladder makes a clear hierarchy among the nine per-cause Stresses:

- **Stress (Anger) — gain 20.** The strongest single-cause Stress in the genome. Sustained anger drives mutation pressure faster than any other cause and is the dominant signal for "this lineage needs to change".
- **Stress (Fear) — gain 14.** The second-strongest. Sustained fear pushes mutation pressure ~70% as hard as anger does. Useful comparison: a chronically-frightened Norn evolves nearly as fast as a chronically-angry one, but a chronically-hungry Norn evolves far slower.
- **Stress (Pain) — gain 8.** Mid-tier. Pain stress is a real contributor but ~2.5× weaker than anger. Reflects that physical injury is a signal worth selecting against, but less so than chronic emotional dysregulation.
- **Stress (H4C / H4P / H4F / Sleep / Tired / Crowded) — gain 5 each.** Baseline. Six of the nine Stresses share the lowest gain, reflecting that no single physical-need scarcity is, on its own, treated as severely as Pain, Fear, or Anger.

Read together: the genome treats the *psychological* Stresses (Anger, Fear, Pain) as more severe contributors to evolutionary pressure than the *physiological* ones (the three hungers, sleep, tired, crowded), and within the psychological group it ranks Anger > Fear > Pain. This is consistent with C3's "Norn society" theme: a population that fights or fears constantly is a population whose lineage the genome strongly pushes to mutate.

### JS port notes

The Rebuild port treats chemical 190 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_ANGER` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (Anger)"` appears only in `ChemicalNames.catalogue:264`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (Anger) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). Two additional points specific to chemical 190:

- **The Stage-2 gain of 20 is genome data, not engine-level magic.** The biochemistry tick loop must read the per-emitter gain field from emitter id 30 rather than hard-coding "Anger contribution = 4× hunger contribution". Mods that retune the relative weighting of the nine Stress causes must be picked up automatically; baking the 20:14:8:5 ladder into engine code would defeat the genome-driven design.
- **The Stage-1 receptor reads chemical 160 (Anger), not 159 or 161.** The chemical-name catalogue ordering puts Anger at 160, Crowded at 159, NFP at 161 — easy to misread when wiring receptors by name. Implementations that wire the cascade by chemical name rather than by chemical id must use the catalogue index 160 for the Anger path, and the corresponding Stage-1 receptor id 155 / Stage-1 emitter id 34 / Stage-2 receptor id 151 / Stage-2 emitter id 30. A common bug is to assume parallel structure with the hunger triplet (where receptor and emitter ids run sequentially): the anger cascade uses non-sequential ids that must be looked up explicitly.

### Practical consequences for gameplay

- **Anger is the fastest path to colony-wide mutation pressure.** Because Stage-2 gain on the Anger path is 20 — four times any hunger path — sustained inter-Norn aggression drives the colony's mutation rate faster than any other single cause. A "war" between Norn factions, where both sides sit at high Anger drive for long periods, will cause both lineages to mutate notably faster than a peaceful but underfed colony.
- **Stress (Anger) tracks its cause closely.** Resolving the conflict — separating the Norns, removing the threat, providing positive interactions — will quickly drop Anger (160) below the 214 cascade threshold, halting Stage-1 production of chemical 190. The existing Stress (Anger) in the bloodstream then decays at standard rate — within ~310 ticks of the resolution, it is below the Stage-2 threshold of 128 and stops contributing to aggregate Stress.
- **Diagnosing anger stress in the Kits.** A Norn whose Stress (Anger) graph is rising while Anger drive is also high is in an active anger crisis. A Norn with elevated Stress (Anger) and *low* Stress (Fear) / Stress (Pain) is suffering specifically from aggression-driven stress, not from generalised psychological distress — useful for diagnosing dominance disputes, mate competition, or repeated thwarting. Because Stress (Anger) decays at the standard rate, a flat-elevated reading without ongoing high Anger is unusual.
- **Aggressive colonies show a characteristic Stress (Anger) signature.** A Norn population locked in repeated fights — say, two factions in close quarters with limited resources — will show sustained elevated Stress (Anger) baselines in all individuals, with hunger Stresses possibly low (because they steal each other's food efficiently) but Stress (Fear) and Stress (Crowded) often co-elevated. This is the unambiguous biochemical signature of social dysfunction and the cleanest in-game way to diagnose it.
- **Injecting Stress (Anger) is a strong mod lever.** `CHEM 190 150` raises Stress (Anger) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) at the highest per-cause weight (gain 20) for the next ~310 ticks without actually angering the Norn. This is the single most efficient way to push aggregate Stress through CAOS without using `CHEM 128` directly — useful for testing the mutation pathway in isolation, or for mods that want to simulate the systemic effect of anger without triggering aggressive instincts.
- **The "calm fighter" paradox.** Because Stress (Anger) decays in 311 ticks, a Norn that goes through brief, intense anger episodes (e.g. resolved fights) will have repeated Stress (Anger) spikes that push aggregate Stress hard during each spike but quickly fade. A Norn locked in *sustained* low-grade anger (drive 215-220 continuously) will have a flat-elevated Stress (Anger) plateau and a flat-elevated mutation-rate contribution. The two profiles look similar on aggregate Stress but very different on Stress (Anger) graphs — a useful diagnostic distinction.

### Summary

```
   Anger (160) — the brain's "I am angry" drive
                       │
                       ▼  (bloodstream chemical, drive locus 13 of Circulatory)
          Receptor 155 (gene 57, DIGITAL, threshold 214)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 13 (floating, latched ~255)
                       │
          Emitter 34 (gene 14, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                  STRESS (Anger) [190]
        - No initial concentration (starts at 0)
        - Half-life = 311 ticks ("Medium", standard per-cause Stress rate)
        - Genome halflives byte = 58
                       │
                       ▼
          Receptor 151 (gene 74, DIGITAL, threshold 128, gain 254)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 17 (floating, latched ~254)
                       │
          Emitter 30 (gene 26, DIGITAL, rate 24, GAIN 20 — highest of the nine)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst)

   Stress (Anger) is the chronic anger marker:
     - Produced only when Anger ≥ 214 sustains long enough
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Decays at the standard 311-tick half-life
     - HIGHEST per-cause Stage-2 gain in the genome (20 vs 5/8/14)
     - The dominant single-source contributor to aggregate Stress
     - Tracks its cause closely — fades within minutes of the Norn calming
     - The signature stress chemical of aggressive / fighting colonies
```

## Key Source References

- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **155** (gene 57) — Stage-1 receptor reading **Anger (160)** ≥ 214 onto Circulatory locus 13
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **34** (gene 14) — Stage-1 emitter on Circulatory locus 13 producing **Stress (Anger) (190)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **151** (gene 74) — Stage-2 receptor reading **Stress (Anger) (190)** ≥ 128 onto Circulatory locus 17
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **30** (gene 26) — Stage-2 emitter on Circulatory locus 17 producing aggregate **Stress (128)** at rate 24, **gain 20** (the highest of the nine per-cause cascades)
- `DOCUMENTATION/CreaturesData/biochemistry.json:9064-9071` — Stress (Anger)'s halflives entry: genome byte 58, `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, speed "Medium"
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/187 - Stress (H4C).md` — sibling doc on the carb-hunger per-cause Stress, with the contrasting 621-tick half-life
- `DOCUMENTATION/chemicals/188 - Stress (H4P).md` — sibling doc on the protein-hunger per-cause Stress
- `DOCUMENTATION/chemicals/189 - Stress (H4F).md` — sibling doc on the fat-hunger per-cause Stress, with the same 311-tick standard half-life
- `DOCUMENTATION/chemicals/160 - Anger.md` — upstream context on what Anger actually measures and what produces/consumes it (if present)
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (Anger) constant (the chemical is handled by the generic biochemistry engine)
