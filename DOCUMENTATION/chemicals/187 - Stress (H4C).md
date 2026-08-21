# 187 - Stress (H4C)

**Stress (H4C)** is the per-cause Stress chemical that records *carbohydrate hunger as a chronic source of suffering*. The "H4C" suffix is the genome's shorthand for **H**unger **4** (i.e. *for*) **C**arbohydrate — chemical **150 Hunger for carbohydrate** — and chemical 187 is the dedicated bloodstream marker that says "this Norn has been seriously hungry for carbs long enough that the body is treating it as a stressor". It occupies slot **187** of the 256-entry chemical table, as the first of the nine **per-cause Stress chemicals** (187-195) that sit between the unused slots 185-186 and the Brain-language chemicals starting at 198.

Chemical 187 is the **Stage-1 product** of the two-stage drive→Stress cascade documented in detail in `128 - Stress.md`. The full chain is:

```
Hunger for carbohydrate (150)  ──[receptor 162, threshold 214]──▶  Circulatory locus 5
       Circulatory locus 5     ──[emitter 41, rate 14, gain 6]──▶  Stress (H4C) [187]
       Stress (H4C) [187]      ──[receptor 154, threshold 128]──▶  Circulatory locus 14
       Circulatory locus 14    ──[emitter 33, rate 24, gain 5]──▶  Stress [128]
```

Only when **carbohydrate hunger climbs above 214/255** (a deep, ignored hunger — not a casual peckishness) does the Stage-1 receptor fire and Stress (H4C) start accumulating. Once present, Stress (H4C) is read by exactly one consumer — the Stage-2 receptor that funnels it into the aggregate Stress (128) — and otherwise persists in the bloodstream with a **621-tick half-life** ("Medium" band, but **roughly twice as long as the other eight per-cause Stress chemicals**, which all decay at 311 ticks). That extra persistence is the genome's deliberate way of modelling **carb craving**: long after the Norn has finally found a carrot, the "I went hungry for carbs" memory still colours its biochemistry, keeps Stress (128) elevated, and continues to push the mutation-rate loci through Stage 2.

Chemical 187 has **no initial concentration**, takes part in **no reactions**, has **no engine-level handling** in the original engine, and has no dedicated constant in the Rebuild port. It is purely the data-driven output of one emitter and the input of one receptor, and its job is to be a *time-extended marker* that "carbohydrate-hunger crisis was happening recently".

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Emitter on **Circulatory locus 5** — the Stage-1 H4C cascade | Emitter gene **8** (`biochemistry.json`, emitter id 41) | Creature / Circulatory / Locus 5 | `chemical=187, threshold=128, rate=14, gain=6, flags=DIGITAL`, switches on at `AGE_YOUTH`. Locus 5 is driven up to 255 by receptor id 162 (gene 18) which reads chemical **150 Hunger for carbohydrate** with threshold **214** (DIGITAL, gain 255). When the Norn's carbohydrate hunger exceeds 214/255, locus 5 latches above the emitter's threshold (128) and the emitter fires every 14 ticks, adding 6 units of Stress (H4C) per firing | ~6 units per 14-tick window while carb hunger ≥ 214 |
| 2 | Direct `CHEM 187 …` CAOS injection | `CHEM`, `ALTR`, `ADMN`, debug toys, modder agents | Creature / bloodstream (systemic) | Any CAOS script can write chemical 187 directly into the bloodstream without invoking the cascade. Used by the debug console's chemistry dump, by Shee debug toys that want to stress-test the mutation pathway, and by mods that want to push Stress without actually starving the Norn | One-shot per injection |

There are no other emitters, no reactions, and no engine code paths that produce chemical 187. The single Stage-1 emitter (id 41) is the only natural source, and it is gated entirely by carbohydrate hunger via receptor 162. Note that the Stage-1 cascade switches on at the **Youth** life stage — babies do not produce Stress (H4C), so a hungry baby Norn will not contribute carb-hunger pressure to its mutation rate.

Chemical 187 has **no `initialConcentrations` entry** — every Creature is born with Stress (H4C) = 0.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Stage-2 input to aggregate **Stress (128)** | Receptor gene **58** (receptor id 154) | Creature / Circulatory / Locus 14 | `chemical=187, threshold=128, nominal=0, gain=254, flags=DIGITAL`, switches on at `AGE_YOUTH`. When Stress (H4C) climbs above 128/255, this receptor latches Circulatory locus 14 to ~254/255 | Locus 14 in turn drives emitter id 33 (gene 23) which produces aggregate **Stress (128)** at rate 24, gain 5. So Stress (H4C) above 128 contributes a steady flow of generic Stress upstream of the mutation pathway and the stress-induced lipolysis reaction (see `128 - Stress.md`) |
| 2 | **Readable for the brain via Biochemistry faculty** | `Biochemistry.GetChemical(187)` | Creature / bloodstream (systemic) | Chemical 187 is a normal bloodstream chemical: every faculty, debug view, and Kit can read it as `"Stress (H4C)"`. The Health Kit, Science Kit chemical graphs, Observation Kit history graph, and Shee Starship Chemical Analysis Screen all display it independently of the eight other per-cause Stress chemicals | "How much of this Norn's stress is coming specifically from carbohydrate hunger?" becomes a first-class observable, useful for diagnosing diet-related stress in colonies and for Kits/CAOS mods that want per-cause breakdowns |
| 3 | **Passive decay** | Halflives byte 187 = **65** | Bloodstream (systemic) | `halfLifeInTicks = 621`, `decayRate ≈ 0.99888`, "Medium" decay band. Multiplies Stress (H4C) by ~0.99888 every biochem tick | A Stress (H4C) spike halves in ~621 ticks (~10-20 game seconds depending on tick rate). This is **noticeably longer than the 311-tick half-life shared by all eight other per-cause Stress chemicals** (188-195), making carb-hunger stress the most persistent of the per-cause stresses — a deliberate modelling of carb-craving memory |

There are no reactions, no other receptors, and no consumers that read chemical 187. The Stage-2 receptor (id 154) is its sole purpose-built reader.

## Role in Game Mechanics

### Position in the drive→Stress cascade

Chemical 187 is one node in the genome's nine-fold per-cause Stress system, paired one-to-one with carbohydrate hunger:

| Drive | Drive chemical | Stage-1 receptor → locus | Stage-1 emitter | Per-cause Stress | Stage-2 receptor → locus | Stage-2 emitter |
|-------|----------------|--------------------------|-----------------|-------------------|--------------------------|-----------------|
| **Hunger for carbohydrate** | **150** | **162 → locus 5** (thr 214) | **41 (rate 14, gain 6)** | **187 Stress (H4C)** | **154 → locus 14** (thr 128) | **33 (rate 24, gain 5)** |
| Hunger for protein | 151 | → locus 6 (thr 214) | (rate 14, gain 6) | 188 Stress (H4P) | 153 → locus 15 (thr 128) | 32 (rate 24, gain 5) |
| Hunger for fat | 152 | → locus 7 (thr 214) | (rate 14, gain 6) | 189 Stress (H4F) | 152 → locus 16 (thr 128) | 31 (rate 24, gain 5) |
| Anger | 160 | 155 → locus 13 (thr 214) | (rate 14, gain 6) | 190 Stress (Anger) | 151 → locus 17 (thr 128) | 30 (rate 24, gain 20) |
| Fear | 153 | → locus 11 (thr 204) | (rate 14, gain 6) | 191 Stress (Fear) | 150 → locus 18 (thr 128) | 29 (rate 24, gain 14) |
| Pain | 148 | 156 → locus 12 (thr 191) | (rate 14, gain 6) | 192 Stress (Pain) | 149 → locus 19 (thr 128) | 28 (rate 24, gain 8) |
| Sleepiness | 156 | → locus 9 (thr 214) | (rate 14, gain 6) | 193 Stress (Sleep) | 147 → locus 21 (thr 128) | 26 (rate 24, gain 5) |
| Tiredness | 154 | 163 → locus 10 (thr 204) | 42 (rate 14, gain 6) | 194 Stress (Tired) | 148 → locus 20 (thr 128) | 27 (rate 24, gain 5) |
| Crowded | 159 | → locus 10 (thr 230, dual-use) | (rate 14, gain 6) | 195 Stress (Crowded) | 146 → locus 22 (thr 128) | 25 (rate 24, gain 5) |

Stress (H4C) sits at the **top** of this table because chemical 187 is the lowest-numbered per-cause Stress slot. Functionally it is symmetric with the other eight, except for two points:

1. **Longer half-life** — 621 ticks vs. 311 for the other eight. Carb-hunger stress lingers ~2× as long after the cause subsides.
2. **High distress threshold (214)** — only deep carb hunger triggers the Stage-1 cascade. Mild peckishness for carbs (drive < 214) does not produce Stress (H4C) at all. This is the same threshold used for the other two hunger types and for sleepiness/anger; it is well above moderate-discomfort levels.

### Why carb-hunger stress lingers longer

The 621-tick half-life is unique to Stress (H4C) among the per-cause Stress chemicals. The other two hunger stresses (H4P and H4F, for protein and fat) decay at the standard 311 ticks. The asymmetry is a small but deliberate biochemical statement:

- **Carbohydrates are the Norn's primary fuel.** Glucose (chemical 3) is the substrate for nearly every metabolic ATP-producing reaction in the genome. Going hungry for carbs is therefore the most metabolically threatening of the three hunger types — protein and fat hunger affect growth and storage, but carb hunger affects *immediate* energy supply.
- A longer Stress (H4C) half-life means the body keeps "remembering" carb-hunger crises for longer, which keeps aggregate Stress (128) elevated for longer, which keeps the **mutation-rate loci** (`LOC_CHANCEOFMUTATION` / `LOC_DEGREEOFMUTATION`) elevated for longer.
- The evolutionary interpretation: a population that is repeatedly starved of its primary fuel source faces stronger mutation pressure than a population that occasionally lacks fat or protein. Lineages that survive a carb-scarce environment accumulate genetic exploration faster — which is the engine's biochem analogue of real-world dietary-stress-driven adaptation.

### Why have Stress (H4C) at all instead of going straight to Stress (128)?

The two-stage cascade is structurally more complex than a direct "Hunger for carb → Stress (128)" emitter would have been. The benefit, explained in detail in `128 - Stress.md`, applies to chemical 187 in three concrete ways:

1. **Per-cause readability.** Because Stress (H4C) is its own bloodstream chemical, the Health Kit, Science Kit graphs, Observation Kit history, and CAOS scripts can all read "is this Norn carbohydrate-stressed specifically?" separately from "is this Norn stressed in general?". A breeder diagnosing a colony can see at a glance whether the Stress comes from food shortage (H4C/H4P/H4F elevated) versus social problems (Crowded/Anger/Fear elevated) versus exhaustion (Sleep/Tired elevated).
2. **Per-cause tunable persistence.** The genome can give each per-cause Stress its own half-life. Setting H4C to 621 ticks while leaving the others at 311 is a one-byte change in the halflives table — far simpler than modelling per-cause memory in any other way.
3. **Per-cause Stage-2 weighting.** The Stage-2 emitters (25-33) all read different per-cause Stresses with different gains: the H4C path uses gain **5**, the same as H4P, H4F, Sleep, Tired, Crowded; Pain uses 8; Fear uses 14; Anger uses 20. This means Stress (H4C) contributes the *baseline* per-source weight to aggregate Stress (128) — the same weight as the other two hunger types, less than Pain/Fear, and far less than Anger. A Norn that is *only* carb-hungry will accumulate Stress (128) more slowly than one that is *only* angry, even if both are at maximum on their respective drives.

### Stress (H4C) and aggregate Stress (128) interaction

Because the Stage-2 receptor (id 154, threshold 128) is digital, Stress (H4C) only contributes to aggregate Stress (128) **once it crosses 128/255**. Below that, aggregate Stress is unaffected by the H4C path. Above it, the Stage-2 emitter (id 33) fires at a fixed rate of 24 with gain 5, regardless of *how far above* 128 the Stress (H4C) reading is. This is a deliberate "all-or-nothing" design: the Stage-2 cascade does not care whether carb-hunger stress is 130 or 250, only whether it has crossed the "yes, this is a stressor" line.

The threshold-128 design also means there is a **window of carb-hunger stress** between roughly 0 and 128 where Stress (H4C) accumulates and decays *without* ever touching aggregate Stress. A Norn that briefly goes hungry, eats a carrot, and recovers may register a small rise and slow fall in Stress (H4C) without ever pushing aggregate Stress (128) — and therefore without ever pushing the mutation-rate loci. Sustained or repeated carb hunger is required to push H4C past 128 and start contributing to evolutionary pressure.

### How Stress (H4C) propagates to the consumers of Stress (128)

Once Stress (H4C) drives aggregate Stress (128) above the consumers' thresholds, the downstream effects are exactly those documented in `128 - Stress.md`:

- **Mutation-rate elevation.** `LOC_CHANCEOFMUTATION` (receptor 122) and `LOC_DEGREEOFMUTATION` (receptor 123) read aggregate Stress ≥70 and increase the per-gene mutation probability and step size at gamete formation. Norns that have spent significant time carb-hungry conceive more-mutated offspring.
- **Stress-induced lipolysis.** Reaction 76 (`Stress + Prostaglandin → Stress + Fatty Acid`, gated by Injury) uses aggregate Stress as a catalyst to convert the pain modulator Prostaglandin into Fatty Acid. A Norn that has been carb-hungry and is also injured will burn through circulating Prostaglandin into mobilisable fat faster — a small, biochemically consistent "stress mobilisation" effect.

Importantly, neither of these consumers reads chemical 187 *directly*. Stress (H4C) influences them only through Stage 2 of the cascade. This means:

- **Modders can mute the H4C contribution** by editing the Stage-2 emitter (id 33) to disable it without affecting the other per-cause Stresses.
- **Modders can amplify the H4C contribution** by raising emitter 33's gain or by lowering the Stage-2 receptor's threshold (id 154).
- **Modders can give carb-hunger its own dedicated downstream effect** by adding a brand-new receptor on chemical 187 — for example, a receptor that elevates a "hunger-fatigue" locus or modifies metabolic rate when carb-hunger stress is high, without going through aggregate Stress at all.

### Stress (H4C) vs. Hunger for carbohydrate (150) vs. Glucose (3)

These three chemicals form the carbohydrate-availability stack but measure different things on different timescales:

- **Glucose (3)** is the immediate metabolic substrate. Falls when the Norn burns ATP, rises when food is digested. Half-life governed by the metabolism reactions, not a halflives byte.
- **Hunger for carbohydrate (150)** is the *drive* — the brain's read of "I want carbs". Rises when Glucose is low, falls when the Norn eats and digests carbs. Modulates the brain's instincts to seek food. This is a real-time signal — the Norn responds to it within seconds.
- **Stress (H4C) (187)** is the *chronic-suffering marker* for carb hunger. Only rises when the *drive* has been above 214 for long enough that the Stage-1 emitter has accumulated chemical 187 in the bloodstream. Decays slowly (621 ticks). This is an "I have been hungry for carbs for a noticeable time" memory, used only for upstream long-term effects.

A useful mental model: **Glucose is the fuel gauge, Hunger for carbohydrate is the dashboard light, and Stress (H4C) is the maintenance log of how often the dashboard light has been on.**

### JS port notes

The Rebuild port treats chemical 187 as an ordinary bloodstream chemical — there is no engine-level handling, no `CHEM_STRESS_H4C` constant in `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`. The cascade is data-driven from the genome's receptor and emitter genes applied by the generic biochemistry engine. The string `"Stress (H4C)"` appears only in `ChemicalNames.catalogue:261`, not anywhere in the original engine's creature or biochemistry code.

For the port to reproduce Stress (H4C) correctly, the same three correctness requirements as the parent Stress (128) cascade apply (see `128 - Stress.md`, "JS port notes"). One additional point specific to chemical 187:

- **The 621-tick half-life must be applied per-chemical.** The genome's halflives table stores byte 65 at index 187, distinct from the value 58 stored at indices 188-195. The Biochemistry tick loop must look up the per-chemical decay factor rather than applying a uniform decay across the per-cause Stress range. Getting this wrong by, say, applying 311 ticks to all per-cause Stresses would erase the carb-craving-memory mechanic and make Stress (H4C) behaviour identical to H4P and H4F.

### Practical consequences for gameplay

- **Carb starvation is the most evolutionarily aggressive food-shortage type.** Because Stress (H4C) lingers ~2× longer than the protein and fat per-cause stresses, sustained carbohydrate scarcity drives more mutation pressure on the colony than equivalent protein or fat scarcity. World designers wanting to evolve carb-tolerant Norns should starve them of carbs specifically, not generally.
- **Stress (H4C) outlasts its cause.** Feeding a starving Norn one carrot will quickly drop Hunger for carbohydrate (150) below the 214 cascade threshold, halting Stage-1 production of chemical 187. But the existing Stress (H4C) in the bloodstream will keep contributing to aggregate Stress (128) for ~620 more ticks (until it falls below the Stage-2 threshold of 128). The Norn remembers being hungry.
- **Diagnosing carb-hunger stress in the Kits.** A Norn whose Stress (H4C) graph is flat and elevated while Hunger for carbohydrate is normal has recently come off a carb-shortage event. A Norn with both elevated is in an active carb crisis. A Norn with elevated H4C and *low* H4P/H4F is suffering carb-specific scarcity, not a general food shortage — useful for diagnosing diets heavy in fat/protein but lacking starch.
- **Injecting Stress (H4C) is a valid mod lever.** `CHEM 187 150` raises Stress (H4C) above the Stage-2 threshold immediately, contributing to aggregate Stress (128) for the next ~620 ticks without actually starving the Norn. Useful for testing the mutation pathway in isolation, or for mods that want to simulate a carb-craving without real hunger.

### Summary

```
   Hunger for carbohydrate (150) — the brain's "I want carbs" drive
                       │
                       ▼  (bloodstream chemical, drive locus 5 of Circulatory)
          Receptor 162 (gene 18, DIGITAL, threshold 214)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 5 (floating, latched ~255)
                       │
          Emitter 41 (gene 8, DIGITAL, rate 14, gain 6)
                       │
                       ▼
                   STRESS (H4C) [187]
        - No initial concentration (starts at 0)
        - Half-life = 621 ticks ("Medium", but ~2× the other 8 per-cause Stresses)
        - Genome halflives byte = 65
                       │
                       ▼
          Receptor 154 (gene 58, DIGITAL, threshold 128, gain 254)
          Switches on at AGE_YOUTH
                       │
                       ▼
                Circulatory locus 14 (floating, latched ~254)
                       │
          Emitter 33 (gene 23, DIGITAL, rate 24, gain 5)
                       │
                       ▼
              Aggregate STRESS [128]
                       │
              ┌────────┴────────┐
              ▼                 ▼
     Mutation-rate loci    Stress + Prostaglandin → Stress + Fatty Acid
     (LOC_CHANCEOFMUTATION,    (Reaction 76, gated by Injury,
      LOC_DEGREEOFMUTATION)     Stress is catalyst)

   Stress (H4C) is the chronic carb-hunger marker:
     - Produced only when Hunger for carbohydrate ≥ 214 sustains long enough
     - Consumed only by the Stage-2 receptor that funnels into Stress (128)
     - Lingers ~2× as long as other per-cause Stresses (621 vs 311 tick half-life)
     - Models carb-craving memory: the body remembers carb crises for a long time
     - Specific carb-hunger contribution to evolutionary mutation pressure
```

## Key Source References

- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **162** (gene 18) — Stage-1 receptor reading **Hunger for carbohydrate (150)** ≥ 214 onto Circulatory locus 5
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **41** (gene 8) — Stage-1 emitter on Circulatory locus 5 producing **Stress (H4C) (187)** at rate 14, gain 6, DIGITAL
- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor **154** (gene 58) — Stage-2 receptor reading **Stress (H4C) (187)** ≥ 128 onto Circulatory locus 14
- `DOCUMENTATION/CreaturesData/biochemistry.json`, emitter **33** (gene 23) — Stage-2 emitter on Circulatory locus 14 producing aggregate **Stress (128)** at rate 24, gain 5
- `DOCUMENTATION/CreaturesData/biochemistry.json:9040-9047` — Stress (H4C)'s halflives entry: genome byte 65, `halfLifeInTicks = 621`, `decayRate ≈ 0.99888`, speed "Medium"
- `DOCUMENTATION/chemicals/128 - Stress.md` — the parent doc on the aggregate Stress chemical, including the full nine-fold per-cause cascade table and the consumers of Stress (128)
- `DOCUMENTATION/chemicals/003 - Glucose.md` and `DOCUMENTATION/chemicals/150 - Hunger for carbohydrate.md` (if present) — upstream context on what carbohydrate hunger actually measures
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — JS port, no dedicated Stress (H4C) constant (the chemical is handled by the generic biochemistry engine)
