# 012 - Protein

Protein is the creature's **dietary protein input chemical** — the raw, un-digested protein bolus that enters the bloodstream from food and nothing else. It is the single gateway by which protein-rich foods (meat, cheese, seeds, carrots, and anything else whose CAOS script writes `STIM WRIT from 79 …` when eaten) deliver nitrogen-bearing nutrients into the biochemistry. Unlike the two active protein-branch tiers that follow (Amino Acid, Muscle Tissue), Protein is not a metabolic intermediate and is not involved in any signalling, storage, or energy-release reaction: its role begins and ends with **digestion**. One unit of Protein is cleaved by reaction 1 into four units of Amino Acid, and that is the only thing the body ever does with it.

Protein has **no initial concentration at birth** (a newborn starts with zero Protein in its bloodstream), **no organ emitter**, **no receptors**, **no drive or brain coupling**, and an effectively **infinite passive half-life** (≈9.07 × 10¹⁰ ticks, decay rate 1.0). It is therefore a pure "flow-through" chemical — food injects it, reaction 1 consumes it, and nothing else touches it. The creature cannot sense its own Protein level directly; once the digestive reaction has run, Protein becomes indistinguishable from any other Amino Acid produced elsewhere in the body, and the rest of the protein pipeline (Amino Acid → Muscle Tissue, or Amino Acid → energy via reaction 6) takes over.

This narrow, single-purpose design makes Protein the **protein-branch counterpart of Fat [10]** — both are pure dietary inputs, both have zero at birth, both have no receptors and no emitters, and both are cleaved by a single Medium-rate digestive reaction into the circulating currency used by the rest of the body. Protein is the enzymatic border crossing for nitrogen-bearing nutrients the same way Fat is for lipids: everything upstream of reaction 1 is "protein in the stomach", everything downstream is "body chemistry".

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | — | — | Newborn endowment | **Amount 0 / concentration 0 %** — a newborn Norn has no Protein in its blood; the pool only fills when the creature eats |
| 2 | Dietary ingestion (food scripts) | — | — | Food agents run `STIM WRIT from 79 <amount>` on eat, which maps to chemical 12 (Protein) | Instantaneous injection — the amount written depends entirely on the food item (meat, cheese, seeds, carrots and similar protein-bearing edibles inject the largest doses; pure-sugar or pure-fat foods inject little or none) |

Protein has no organ-level emitter and no internal synthesis reaction — the body cannot make Protein, only consume it. Every molecule in the Protein pool was placed there by a food agent's stim. In the stock C3 bootstrap, stim 79 is written by protein-bearing food items such as the Carrot (`Carrot.cos`) and the Infinite Cheese Machine (`infinite_cheese_machine.cos`); custom agents (toys, injectors, drugged foods, metaroom feeders) are also free to write to chem 12 directly via `CHEM 12 <amount>` if they wish to simulate protein ingestion bypassing the stim pipeline.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Dietary-protein digestion (reaction 1) | Gene 24, Baby onwards | Standard | `1× Protein [12] → 4× Amino Acid [13]` | Medium, half-life ~209 ticks (decay 0.99669) — the sole consumer of Protein. Each unit digested produces four Amino Acids, which then feed either muscle synthesis (reaction 5, via Anabolic steroid) or energy release (reaction 6, via oxidation). This is the only reaction anywhere in the genome that reads or writes Protein |
| 2 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1.0) | Protein does not decay on its own; any un-digested Protein remains in the bloodstream until reaction 1 consumes it |

Protein has **no receptors at all** — no drive receptor, no brain receptor, no reaction-modulating receptor, no muscle or neuron target. The creature cannot feel "how much Protein is in the blood" directly; the only way Protein influences behaviour or physiology is indirectly, through the Amino Acid that reaction 1 produces. That downstream chemical (and the Muscle Tissue it eventually becomes) carries the actual signalling: the "Hunger for protein" drive [149] is driven by Amino-Acid-fed emitters, not by Protein itself, and the muscle-wasting alarm (receptor 86) watches Muscle Tissue, not Protein.

## Role in Game Mechanics

### The border between food and body chemistry

Creatures 3 models food in a two-layer system. The outer layer is the **stim layer**, where edible agents carry a set of "nutrition" stims (roughly 78 = Fat, 79 = Protein, 80 = Carbohydrate, and related) that are written on `eat` actions. The inner layer is the **chemical layer**, where the creature's own body runs 140+ named metabolites through dozens of reactions. Protein is one of only a handful of chemicals whose job is to **bridge these two layers** — its stim-layer name and its chemical-layer name refer to the same thing, unlike (for example) Amino Acid [13], which is a purely internal metabolite, or Hunger for protein [149], which is a purely behavioural drive.

When a Norn eats a carrot:

```
  Carrot agent's eat script
          │
          │   STIM WRIT from 79 <dose>
          ▼
  Stim → biochemistry mapping
          │
          │   stim 79 writes to chem 12
          ▼
  Protein [12] concentration rises
          │
          │   reaction 1 (HL ~209, gene 24)
          ▼
  4 × Amino Acid [13]     ← from here the normal protein pipeline runs
          │
          ├─► reaction 5  (HL 621, + Anabolic steroid) → Muscle Tissue [11]
          └─► reaction 6  (energy-release pathway)     → Pyruvate / ATP
```

Reaction 1 is therefore the **digestive checkpoint** for nitrogen-bearing food: until it runs, the protein a creature just swallowed is biochemically inert; the moment it runs, the protein has been absorbed and the body can treat its four Amino Acid fragments like any other circulating protein currency — some going to structural build-up (muscle), some to energy (via the glucogenic pathway).

### Why Protein has a half-life in reaction 1 but not in decay

Reaction 1 runs at HL ~209 ticks (Medium speed), about 1.8× slower than reaction 3's digestion of dietary Fat (HL ~116). That means a single meal's Protein bolus is roughly 50 % digested after ~20 seconds of real time (at 10 Hz) and essentially fully digested after ~100 seconds. This rate is fast enough that a creature's blood doesn't stay "full of raw Protein" for long (food gets absorbed in under two minutes of in-game time), but slow enough that overeating protein in one sitting does produce a measurable, temporary Protein spike — and therefore a sustained Amino Acid spike downstream, which in turn drives the satiety shuffle on receptor 48 (`Hunger for protein` reduction via Amino Acid/Triglyceride conjunction on the Reaction organ). The asymmetric design — **infinite passive persistence plus a Medium-rate enzymatic consumer** — guarantees that no molecule of ingested protein is ever "lost" but that the absorption process still produces realistic meal-timing effects.

Contrast this with Muscle Tissue (11), which has infinite passive persistence *and* no synthesis decay: Muscle Tissue is long-term storage, while Protein is a transient input. Giving Protein a passive decay would be nonsensical — a swallowed meal shouldn't evaporate on its own — and giving it a short enzymatic half-life *in addition* to decay would make dietary absorption unrealistically erratic.

### The 4 : 1 Protein-to-Amino-Acid stoichiometry

Reaction 1 produces **four Amino Acids per Protein**, which reflects the real-world chemistry of dietary proteins (they are long chains of amino-acid residues that proteolytic enzymes cleave into many individual amino acids). The number four is chosen for symmetry with the other two digestive-boundary reactions — reaction 2 (Starch → 4 Glucose) and reaction 4 (Glycogen → 4 Glucose) — so that every "one dietary unit → four body-currency units" conversion follows the same stoichiometry. This keeps the energy-economy arithmetic predictable: one protein stim-79 write is roughly equivalent in nutrient mass to one carbohydrate stim-80 write.

Because each Amino Acid can then follow either of two fates — muscle-building (reaction 5) or energy-release — the amplification chain for ingested protein depends on what the body needs at the time:

```
  1 Protein (stim 79)
    ── reaction 1 (HL 209) ──►  4 Amino Acid
                                      │
                                      ├── reaction 5 (HL 621, needs Anabolic steroid)
                                      │     4 AA + 1 Anabolic steroid → 1 Muscle Tissue
                                      │
                                      └── reaction 6 (HL ~, oxidation branch)
                                            → Pyruvate / ATP
```

So a single unit of ingested Protein can either lay down ¼ unit of Muscle Tissue (if the creature is actively exercising and producing Anabolic steroid) or feed the energy economy (if the creature is sedentary). Protein is therefore the **only macro-nutrient whose downstream fate is genuinely conditional on creature behaviour** — Fat always goes to Triglyceride, Carbohydrate always goes to Glucose, but Protein's fate splits depending on whether the `LOC_MUSCLES` emitter is firing.

### Why there is no Protein receptor

It might seem odd that the creature has no sensor for its own dietary-protein concentration given how many receptors monitor everything else (Glucose at locus 2, Triglyceride at locus 0, Amino Acid at locus 2 of the Reaction organ, Adipose at locus 0 and Muscle Tissue at locus 8 of Circulatory, etc.). The design reason is the same as for Fat: **Protein is transient**. Because reaction 1 consumes it quickly (HL 209), any given Protein molecule only exists in the blood for ~1–2 minutes. A receptor tuned to Protein would therefore report "I just ate" rather than "I am well-fed" — which is not a useful long-term signal. Instead, the biochemistry reads protein-satiety from the **downstream Amino Acid pool** (receptor 48 at Reaction/Somatic locus 2, and related circulatory readouts), which is much longer-lived and therefore a better integrator of "how protein-replete is this creature right now".

### The three parallel digestive-boundary reactions

Protein belongs to a tight family of three digestive reactions that form the boundary between food stims and body chemistry:

| Reaction | Gene | Formula | HL (ticks) | Stim | Downstream |
|---|---|---|---|---|---|
| 1 | 24 | 1× Protein [12] → 4× Amino Acid [13] | 209 | 79 | protein economy |
| 2 | 26 | 1× Starch [5] → 4× Glucose [3] | 255 | (via carbohydrate stims) | carbohydrate economy |
| 3 | 25 | 1× Fat [10] → 3× Triglyceride [8] + 1× Cholesterol [7] | 116 | 78 | lipid economy |

All three are Medium-speed, all three are switched on from Baby onwards, and all three have the same narrative role: convert a raw dietary input chemical into the circulating body currency. Of the three, Fat digests fastest (HL 116), Protein is in the middle (HL 209), and Starch is slowest (HL 255) — a rough ordering that matches real-world digestive timing (fats absorb quickly in the small intestine, proteins take longer to denature and cleave, and complex carbohydrates take longest of all to break down).

### Practical consequences for gameplay

- **A newborn has zero Protein but a meaningful Muscle Tissue reserve.** Protein [12] starts at 0, but Muscle Tissue [11] starts at amount 32 (~12.55 %). The creature is born with a bank of structural protein but no circulating dietary protein — it must eat before any new Amino Acid can flow in, but it has enough stored muscle to draw on (via reaction 13) for its early days.
- **Feeding protein-rich food alone will not build muscle.** Protein → Amino Acid is automatic, but Amino Acid → Muscle Tissue requires Anabolic steroid (emitted only when the creature actively uses its muscles via `LOC_MUSCLES`). A sedentary, well-fed Norn will simply burn its Amino Acid pool for energy rather than convert it to muscle. See `011 - Muscle Tissue.md` for the full exercise-gating mechanism.
- **One meal, one Protein pulse.** A single eat event spikes Protein once; the spike then decays exponentially at HL 209 as reaction 1 digests it. Testing a protein feeder by repeatedly eating is a good way to inspect Protein's impulse response in the debug console (`CHEM 12 <amount>` to inject, then watch the trace drain into Amino Acid).
- **Protein content of food matters as a food-item property.** Food authors choose the stim 79 dose their food writes per bite. Adjusting this value is the canonical way to tune "how protein-rich is this food" without touching the creature's biochemistry. The stock Carrot and Infinite Cheese Machine both write `stim writ from 79 1`, giving one unit per bite; community food mods routinely expose this as the main tuning knob for nutritional content.
- **Starving Norns still need Protein, not just calories.** Because Amino Acid is the only substrate for Muscle Tissue synthesis and one of the substrates feeding the body's nitrogen economy, a creature fed only on pure-fat or pure-carbohydrate food will eventually start losing muscle (reaction 13 burning Muscle Tissue into Amino Acid to keep the pool topped up). A balanced diet that regularly fires stim 79 is required for long-term structural health.
- **CAOS debugging.** `CHEM TARG 12` reads Protein concentration; `CHEM 12 <amount>` injects directly and will be digested by reaction 1 over the next ~2 minutes into 4× Amino Acid. This is a handy way to test Amino-Acid-mediated effects (muscle synthesis, protein-hunger shuffle) without authoring a food agent. Combine with `CHEM 112 <amount>` (Anabolic steroid) to simulate both eating *and* exercising simultaneously and watch reaction 5 convert the fresh Amino Acids into Muscle Tissue.
- **Protein cannot be destroyed or converted anywhere else.** There is no toxin (Geddonase, Cyanide, etc.) that consumes Protein, no emergency emitter that dumps Protein as a side product, and no decay. Reaction 1 is the only exit. This makes Protein one of the cleanest chemicals to reason about in the genome — its concentration is always exactly `∫(stim-79 inputs) − ∫(reaction-1 consumption)`.

### Summary of the Protein pipeline

```
  Food agent's eat script
       │
       │  STIM WRIT from 79 <dose>      (stim 79 → chem 12)
       ▼
  Protein (12)    [no decay, no receptors, no emitters]
       │
       │  reaction 1 (gene 24, HL 209, Medium)
       ▼
  4 × Amino Acid (13)       ← circulating protein currency
       │
       ├─► reaction 5 (gene 55, HL 621, + Anabolic steroid [112])
       │     4 AA + 1 Anabolic steroid → 1 Muscle Tissue [11]      [long-term structural store]
       │
       └─► reaction 6 / glucogenic oxidation branch
             → Pyruvate / ATP                                       [energy branch]

  (Hunger for protein [149] drive is driven by the Amino Acid side, not by Protein itself.)
```

Protein is therefore the **digestive-entry tier** of the creature's nitrogen economy: born at zero, topped up only by eating, silently invisible to every receptor in the body, and cleaved within roughly two minutes of in-game time into the Amino Acids that actually fuel muscle growth and metabolic repair. It is the first chemical a hungry Norn converts a meat-or-seed meal into, and the first step of every "protein in the blood" story in the biochemistry.
