# 189 - Stress (H4F)

**Stress (H4F)** is the per-cause Stress chemical that records *fat hunger as a chronic source of suffering*. The "H4F" suffix is the genome's shorthand for **H**unger **4** (i.e. *for*) **F**at — chemical **151 Hunger for fat** — and chemical 189 is the dedicated bloodstream marker that says "this Norn has been seriously hungry for fat long enough that the body is treating it as a stressor". It occupies slot **189** of the 256-entry chemical table, the third of the nine **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 189 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Hunger for fat (151)   ──[receptor 160, threshold 214]──▶  Circulatory locus 7
       Circulatory locus 7     ──[emitter 39, rate 14, gain 6]──▶  Stress (H4F) [189]
       Stress (H4F) [189]      ──[receptor 152, threshold 128]──▶  Circulatory locus 16
       Circulatory locus 16    ──[emitter 31, rate 24, gain 5]──▶  Stress [128]
```

Only when **fat hunger climbs above 214/255** (a deep, ignored hunger — not a casual peckishness) does the Stage-1 receptor fire and Stress (H4F) start accumulating. Once present, Stress (H4F) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **311-tick half-life** ("Medium" band). Like its protein-hunger sibling Stress (H4P) (chemical 188) and unlike the special-cased Stress (H4C) (621 ticks), Stress (H4F) decays at the standard rate shared by seven of the nine per-cause Stresses (188-195 except 187): fat hunger leaves the body's stress memory at the same speed as anger, fear, sleepiness, tiredness, crowding, and protein hunger.

Chemical 189 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "fat-hunger crisis was happening recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 7** — the Stage-1 H4F cascade | Emitter gene **6** (`biochemistry.json`, emitter id 39) | Creature / Circulatory / Locus 7 | `chemical=189, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 7 is driven up to 255 by receptor id 160 (gene 43) which reads chemical **151 Hunger for fat** with threshold **214** (DIGITAL, gain 255). When the Norn's fat hunger exceeds 214/255, locus 7 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (H4F) per firing | ~6 units per 14-tick window while fat hunger ≥ 214 |
| 2 | Direct `CHEM 189 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 189 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push Stress without actually starving the Norn of fat | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 189. The single Stage-1 emitter (id 39) is the only natural source, and it is gated entirely by fat hunger via receptor 160. Note that the Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (H4F), so a hungry baby Norn will not contribute fat-hunger pressure to its mutation rate.

Chemical 189 has **no `initialConcentrations` entry** — every Creature is born with Stress (H4F) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **61** (receptor id 152) | Creature / Circulatory / Locus 16 | `chemical=189, threshold=128, nominal=0, gain=254, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (H4F) climbs above 128/255, this receptor latches Circulatory locus 16 to ~254/255 | Locus 16 in turn drives emitter id 31 (gene 24) which produces aggregate **Stress (128)** at rate 24, gain 5. So Stress (H4F) above 128 contributes a steady flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry.GetChemical(189)` | Creature / bloodstream (systemic) | Chemical 189 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (H4F)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from fat hunger?" becomes a first-class observable, useful for diagnosing diet-related stress in colonies and for Kits/CAOS mods that want per-cause breakdowns |
| 3 | **Passive decay** | Halflives byte 189 = **58** | Bloodstream (systemic) | `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, "Medium" decay band. Multiplies Stress (H4F) by ~0.99777 every biochem tick | A Stress (H4F) spike halves in ~311 ticks (~5-10 game seconds depending on tick rate). This matches seven of the eight other per-cause Stress chemicals — only Stress (H4C) (621 ticks) lingers longer. Fat-hunger stress is "remembered" for half as long as carb-hunger stress |

There are no reactions, no other receptors, and no consumers that read chemical 189. The Stage-2 receptor (id 152) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 189 is one node in the genome's nine-fold per-cause Stress system, paired one-to-one with fat hunger:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| Hunger for carbohydrate | 150 | → locus 5 (thr 214) | 41 (rate 14, gain 6) | 187 Stress (H4C) | 154 → locus 14 (thr 128) | 33 (rate 24, gain 5) |
| Hunger for protein | 149 | 161 → locus 6 (thr 214) | 40 (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| **Hunger for fat** | **151** | **160 → locus 7** (thr 214) | **39 (rate 14, gain 6)** | **189 Stress (H4F)** | **152 → locus 16** (thr 128) | **31 (rate 24, gain 5)** |
| Anger | 160 | → locus 13 (thr 214) | (rate 14, gain 6) | 190 Stress (Anger) | 151 → locus 17 (thr 128) | 30 (rate 24, gain 20) |
| Fear | 153 | → locus 11 (thr 204) | (rate 14, gain 6) | 191 Stress (Fear) | 150 → locus 18 (thr 128) | 29 (rate 24, gain 14) |
| Pain | 148 | → locus 12 (thr 191) | (rate 14, gain 6) | 192 Stress (Pain) | 149 → locus 19 (thr 128) | 28 (rate 24, gain 8) |
| Sleepiness | 156 | → locus 9 (thr 214) | (rate 14, gain 6) | 193 Stress (Sleep) | 147 → locus 21 (thr 128) | 26 (rate 24, gain 5) |
| Tiredness | 154 | → locus 10 (thr 204) | (rate 14, gain 6) | 194 Stress (Tired) | 148 → locus 20 (thr 128) | 27 (rate 24, gain 5) |
| Crowded | 159 | → locus 10 (thr 230, dual-use) | (rate 14, gain 6) | 195 Stress (Crowded) | 146 → locus 22 (thr 128) | 25 (rate 24, gain 5) |

Stress (H4F) sits as the **third** entry of this table because chemical 189 is the third per-cause Stress slot. Functionally it is symmetric with the seven "standard" per-cause Stresses (everything except H4C, Pain, Fear, and Anger):

1. **Standard half-life** — 311 ticks, the same as the other six "standard" per-cause Stresses. Fat-hunger stress decays at the baseline rate; only carb-hunger stress (H4C) lingers ~2× as long.
2. **High distress threshold (214)** — only deep fat hunger triggers the Stage-1 cascade. Mild peckishness for fat (drive < 214) does not produce Stress (H4F) at all. This is the same threshold used for the other two hunger types and for sleepiness/anger; it is well above moderate-discomfort levels.
3. **Baseline Stage-2 gain (5)** — Stress (H4F) contributes the same per-source weight to aggregate Stress (128) as Stress (H4C), Stress (H4P), Stress (Sleep), Stress (Tired), and Stress (Crowded). Less than Pain (gain 8), Fear (gain 14), and Anger (gain 20).

### Why fat-hunger stress decays at the standard rate (and carb-hunger doesn't)

The 311-tick half-life used by Stress (H4F) is the genome's "default" half-life for per-cause Stresses. Stress (H4C) is the deliberate exception, given a doubled half-life of 621 ticks because **carbohydrates are the Norn's primary metabolic fuel** — glucose (chemical 3) is the substrate for nearly every ATP-producing reaction, so going hungry for carbs is the most metabolically threatening hunger type. Fat hunger affects long-term energy storage and lipid-membrane / steroid synthesis, not immediate energy supply — and unlike protein hunger, fat is not even structurally required to *build* most tissues, since the Norn's adipose store (chemical 9) and the carbohydrate→fat reaction chain (Glucose → Pyruvate → Acetyl-CoA → Fatty Acid in the standard genome) can backfill fat from other sources.

Setting Stress (H4F) at the standard 311 ticks is therefore an asymmetry statement that says "fat scarcity is a real stressor but not as fundamentally life-threatening as carb scarcity, so the body forgets it about twice as quickly". For a colony designer this matters because:

- **Stress (H4F) does not provide a long-tail mutation push.** A Norn briefly starved of fat recovers from the stress contribution within a few hundred ticks of being fed; the pressure on `LOC_CHANCEOFMUTATION` / `LOC_DEGREEOFMUTATION` does not linger.
- **To drive fat-specific evolutionary pressure, the Norn must be kept fat-hungry continuously.** Brief, intermittent fat scarcity translates poorly into mutation pressure compared with brief, intermittent carb scarcity, because Stress (H4F) decays back below the Stage-2 threshold before the next hunger spike refills it.
- **In the Kits, Stress (H4F) is more "responsive" to current state.** A flat-lined Stress (H4F) reading reliably means the Norn is *not* currently above the Stage-1 cascade threshold, whereas a flat-lined Stress (H4C) reading might still mean the Norn was carb-hungry up to ~10 minutes ago.

### Why have Stress (H4F) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Hunger for fat → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 189 in three concrete ways:

1. **Per-cause readability.** Because Stress (H4F) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn fat-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a colony can see at a glance whether the Stress comes from food shortage (H4C/H4P/H4F elevated) versus social problems (Crowded/Anger/Fear elevated) versus exhaustion (Sleep/Tired elevated). Stress (H4F) elevated alone is the signature of a "lean diet" — plenty of meat and starch, but no oily seeds, fatty fruits, or critter-fat.
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Stress (H4F) takes the standard 311-tick half-life, but a modder could lengthen it to model "fat-craving memory" — the same one-byte change that makes Stress (H4C) linger.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains: the H4F path uses gain **5**, the same as H4C, H4P, Sleep, Tired, Crowded; Pain uses 8; Fear uses 14; Anger uses 20. This means Stress (H4F) contributes the *baseline* per-source weight to aggregate Stress (128) — the same weight as the other two hunger types, less than Pain/Fear, and far less than Anger. A Norn that is *only* fat-hungry will accumulate Stress (128) more slowly than one that is *only* angry, even if both are at maximum on their respective drives.

### Stress (H4F) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 152, threshold 128) is digital, Stress (H4F) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the H4F path. Above it, the Stage-2 emitter (id 31) fires at a fixed rate of 24 with gain 5, regardless of *how far above* 128 the Stress (H4F) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether fat-hunger stress is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of fat-hunger stress** between roughly 0 and 128 where Stress (H4F) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly goes fat-hungry, eats a fat-containing food, and recovers may register a small rise and fall in Stress (H4F) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained or repeated fat hunger is required to push H4F past 128 and start contributing to evolutionary pressure.

### How Stress (H4F) propagates to the consumers of Stress (128)

Once Stress (H4F) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time fat-hungry conceive more-mutated offspring.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert the pain modulator Prostaglandin into Fatty Acid. A Norn that has been fat-hungry and is also injured will burn through circulating Prostaglandin into mobilisable fat faster — a small, biochemically consistent "stress mobilisation" effect, with the slightly ironic outcome that *stress about being short of fat* helps liberate a tiny amount of fatty acid via the very reaction that the Norn's limited fat reserve was hoping for.

Importantly, neither of these consumers reads chemical 189 *directly*. Stress (H4F) influences them only through Stage 2 of the cascade. This means:

- **Modders can mute the H4F contribution** by editing the Stage-2 emitter (id 31) to disable it without affecting the other per-cause Stresses.
- **Modders can amplify the H4F contribution** by raising emitter 31's gain or by lowering the Stage-2 receptor's threshold (id 152).
- **Modders can give fat-hunger its own dedicated downstream effect** by adding a brand-new receptor on chemical 189 — for example, a receptor that elevates an "appetite for fatty foods" instinct or modifies the carbohydrate→fat backfill reactions when fat-hunger stress is high, without going through aggregate Stress at all.

### Stress (H4F) vs. Hunger for fat (151) vs. Fatty Acid (6) / Fat (10) / Adipose Tissue (9)

These chemicals form the fat-availability stack but measure different things on different timescales:

- **Fatty Acid (6)** is the immediate metabolic substrate — circulating mobilisable fat used to make ATP via beta-oxidation, to form Triglyceride (8), and as a precursor for Cholesterol (7). Falls when the Norn burns fat for energy, rises when food is digested down or when adipose mobilisation occurs.
- **Adipose Tissue (9) / Fat (10)** are the long-term storage forms — body fat that the Norn can mobilise when hungry. The carbohydrate→fat reactions can backfill these from glucose, but they need fat in the diet to grow efficiently.
- **Hunger for fat (151)** is the *drive* — the brain's read of "I want fat". Rises when Fatty Acid/Adipose are low (and via reaction 58/68 from the Hunger for fat backup chemical 134), falls when the Norn eats and digests fat-rich food. Modulates the brain's instincts to seek fat. This is a real-time signal — the Norn responds to it within seconds.
- **Stress (H4F) (189)** is the *chronic-suffering marker* for fat hunger. Only rises when the *drive* has been above 214 for long enough that the Stage-1 emitter has accumulated chemical 189 in the bloodstream. Decays at the standard 311 ticks. This is an "I have been hungry for fat for a noticeable time" memory, used only for upstream long-term effects.

A useful mental model: **Fatty Acid is today's metabolic fuel, Adipose Tissue is the bank account, Hunger for fat is the dashboard light, and Stress (H4F) is the maintenance log of how often the dashboard light has been on — except, like the protein-hunger log entry and unlike the carb-hunger one, the H4F log entry fades away within a few minutes.**

### JS port notes

The Rebuild port treats chemical 189 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_H4F` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (H4F)"` appears only in `ChemicalNames.catalogue:263`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (H4F) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). Two additional points specific to chemical 189:

- **The 311-tick half-life is the genome's "default" for per-cause Stresses.** The halflives table stores byte 58 at index 189, the same value used at indices 188 and 190-195. This must be read per-chemical from the genome rather than hard-coded; mods that retune the H4F half-life must be picked up automatically by the biochemistry tick loop.
- **The Stage-1 receptor reads chemical 151 (Hunger for fat), not 149 or 150.** The chemical-name catalogue ordering is `149 = Hunger for protein, 150 = Hunger for carbohydrate, 151 = Hunger for fat`, which differs from the alphabetical mental order. Implementations that wire the cascade by chemical name rather than by chemical id must use the catalogue index 151 for the H4F path. A common bug is to assume the three-hunger triplet is laid out 149-150-151 in the order *carb / protein / fat* (alphabetical) when the actual genome order is *protein / carb / fat*.

### Practical consequences for gameplay

- **Fat starvation is a moderate evolutionary pressure.** Because Stress (H4F) decays at the standard 311 ticks, sustained fat scarcity drives mutation pressure on the colony only while the scarcity persists; brief gaps relax the pressure within a few minutes. This is in deliberate contrast to carb scarcity, which keeps pressing the mutation loci for ~2× as long after each crisis.
- **Stress (H4F) tracks its cause closely.** Feeding a starving Norn one piece of fat-rich food (fatty critter, oily seed, cheese) will quickly drop Hunger for fat (151) below the 214 cascade threshold, halting Stage-1 production of chemical 189. The existing Stress (H4F) in the bloodstream then decays at standard rate — within ~310 ticks of feeding, it is below the Stage-2 threshold of 128 and stops contributing to aggregate Stress.
- **Diagnosing fat-hunger stress in the Kits.** A Norn whose Stress (H4F) graph is rising while Hunger for fat is also high is in an active fat crisis. A Norn with elevated H4F and *low* H4C/H4P is suffering fat-specific scarcity, not a general food shortage — useful for diagnosing diets heavy in starch and meat but lacking oils or fats. Because H4F decays quickly, a flat-elevated H4F reading without ongoing high Hunger for fat is unusual (the chemical has no long-tail "memory" like H4C does).
- **Lean colonies show a characteristic H4F signature.** A Norn population fed exclusively on lean food — say, mushrooms and toy critters that produce mostly Starch and Protein on digestion — will show a sustained elevated Stress (H4F) baseline in all individuals, with H4C and H4P near zero. This is the unambiguous biochemical signature of a fat-deficient ecosystem and the cleanest in-game way to diagnose it.
- **Injecting Stress (H4F) is a valid mod lever.** `CHEM 189 150` raises Stress (H4F) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) for the next ~310 ticks without actually starving the Norn. Useful for testing the mutation pathway in isolation, or for mods that want to simulate a fat-craving without real hunger.

### Summary

```
   Hunger for fat (151) — the brain's "I want fat" drive
                       │
                       ▼  (bloodstream chemical, drive locus 7 of Circulatory)
          Receptor 160 (gene 43, DIGITAL, threshold 214)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 7 (floating, latched ~255)
                       │
          Emitter 39 (gene 6, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                   STRESS (H4F) [189]
        - No initial concentration (starts at 0)
        - Half-life = 311 ticks ("Medium", standard per-cause Stress rate)
        - Genome halflives byte = 58
                       │
                       ▼
          Receptor 152 (gene 61, DIGITAL, threshold 128, gain 254)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 16 (floating, latched ~254)
                       │
          Emitter 31 (gene 24, DIGITAL, rate 24, gain 5)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst)

   Stress (H4F) is the chronic fat-hunger marker:
     - Produced only when Hunger for fat ≥ 214 sustains long enough
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Decays at the standard 311-tick half-life (vs H4C's special 621)
     - Specific fat-hunger contribution to evolutionary mutation pressure
     - Tracks its cause closely — fades within minutes of the Norn being fed
     - The signature stress chemical of "lean diet" colonies
```

## Key Source References

- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **160** (gene 43) — Stage-1 receptor reading **Hunger for fat (151)** ≥ 214 onto Circulatory locus 7
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **39** (gene 6) — Stage-1 emitter on Circulatory locus 7 producing **Stress (H4F) (189)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **152** (gene 61) — Stage-2 receptor reading **Stress (H4F) (189)** ≥ 128 onto Circulatory locus 16
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **31** (gene 24) — Stage-2 emitter on Circulatory locus 16 producing aggregate **Stress (128)** at rate 24, gain 5
- `DOCUMENTATION/CreaturesData/biochemistry.json:9056-9063` — Stress (H4F)'s halflives entry: genome byte 58, `halfLifeInTicks = 311`, `decayRate ≈ 0.99777`, speed "Medium"
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/187 - Stress (H4C).md` — sibling doc on the carb-hunger per-cause Stress, with the contrasting 621-tick half-life that motivates the asymmetric persistence design
- `DOCUMENTATION/chemicals/188 - Stress (H4P).md` — sibling doc on the protein-hunger per-cause Stress, with the same 311-tick standard half-life
- `DOCUMENTATION/chemicals/151 - Hunger for fat.md` — upstream context on what fat hunger actually measures and what produces/consumes it
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (H4F) constant (the chemical is handled by the generic biochemistry engine)
