# 002 - Pyruvate

Pyruvate is the central **metabolic intermediate** of the creature's biochemistry — the hub through which almost all of the energy pathways flow. It is the crossroads where carbohydrate, fat, protein and energy metabolism meet: Glucose and Fatty Acid are broken down *into* Pyruvate, Pyruvate is burned with Oxygen to produce **Energy** (and the CO₂ waste that drives breathing), and Pyruvate is the carbon building block used to rebuild Glucose, Fatty Acid and Cholesterol when reserves need to be replenished. Biologically it mirrors real-world pyruvate, the pivotal three-carbon molecule produced by glycolysis and fed into the Krebs cycle.

Unlike signalling chemicals (e.g. Pain, Adrenalin) Pyruvate has no dedicated emitter gene and no non-reaction receptor: it is produced and consumed purely by metabolic reactions inside the body. Its half-life is effectively infinite (~9 × 10¹⁰ ticks, decay rate 1), so nothing vanishes to natural decay — every molecule of Pyruvate persists until a reaction consumes it. This makes Pyruvate a **stored currency**: the genome fills it up from the energy-rich chemicals (Glucose, Fatty Acid, Cholesterol) and then burns it, one ATP-and-Oxygen at a time, to keep the creature alive. The standard genome even seeds a new-born creature with a starting pool of 64/255 (~0.25 concentration) so that aerobic respiration can begin immediately at birth.

Three **reaction-rate receptors** (organ "Reaction", tissue "Somatic") read Pyruvate concentration and feed it back into the rate of specific metabolic reactions. This closes the feedback loops that keep the catabolic / anabolic balance stable: a high Pyruvate pool slows the reactions that produce more of it and/or accelerates the reactions that consume it, while a low pool does the opposite.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction 18 (glycolysis) | Gene 34, Baby onwards | Standard (genome-wide) | `1× Glucose [3] + 2× ADP [36] → 2× Pyruvate [2] + 2× ATP [35]` | Short half-life ~52 ticks (decay 0.987) — fast conversion of blood sugar into Pyruvate plus a small ATP payoff |
| 2 | Chemical reaction 17 (β-oxidation of fat) | Gene 31, Baby onwards | Standard (genome-wide) | `1× Fatty Acid [6] + 6× ADP [36] → 8× Pyruvate [2] + 6× ATP [35]` | Short half-life ~52 ticks (decay 0.987) — burning fat yields a large Pyruvate pulse plus significant ATP |
| 3 | Chemical reaction 11 (cholesterol breakdown) | Gene 60, Baby onwards | Standard (genome-wide) | `1× Cholesterol [7] → 1× Amino Acid [13] + 4× Pyruvate [2]` | Medium half-life ~116 ticks (decay 0.994) — last-resort catabolism that salvages stored cholesterol into carbon fuel |
| 4 | Initial concentration | Gene 9 | Standard (genome-wide) | — | Baby creatures spawn with 64/255 (~0.251) Pyruvate so aerobic respiration has fuel from tick 0 |

Pyruvate has **no emitter** in the standard genome. Every molecule either comes from one of the reactions above or is injected externally via CAOS (`CHEM`, `INJR`, consumables, etc.).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Chemical reaction 19 (aerobic respiration) | Gene 39, Baby onwards | Standard (genome-wide) | `1× Pyruvate [2] + 3× Oxygen [30] → 6× Energy [34] + 3× Dissolved carbon dioxide [24]` | Very-short half-life ~5 ticks (decay 0.879) — the primary fuel-burning reaction; every living tick this reaction pulls Pyruvate + O₂ and releases Energy (later turned into ATP) and CO₂ waste |
| 2 | Chemical reaction 8 (gluconeogenesis) | Gene 35, Baby onwards | Standard (genome-wide) | `2× Pyruvate [2] + 2× ATP [35] → 1× Glucose [3] + 2× ADP [36]` | Medium half-life ~621 ticks (decay 0.999) — ATP-powered rebuilding of blood sugar from Pyruvate when Glucose is low |
| 3 | Chemical reaction 7 (fatty-acid synthesis) | Gene 36, Baby onwards | Standard (genome-wide) | `8× Pyruvate [2] + 6× ATP [35] → 1× Fatty Acid [6] + 6× ADP [36]` | Medium half-life ~621 ticks (decay 0.999) — ATP-powered storage of excess Pyruvate as Fatty Acid (and downstream Triglyceride / Adipose Tissue) |
| 4 | Chemical reaction 4 (cholesterol synthesis) | Gene 59, Baby onwards | Standard (genome-wide) | `1× Amino Acid [13] + 4× Pyruvate [2] → 1× Cholesterol [7]` | Medium half-life ~116 ticks (decay 0.994) — builds Cholesterol from Amino Acid + Pyruvate for long-term carbon storage |
| 5 | Receptor 35 (reaction-rate feedback) | Gene 37, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 184 / threshold 32 / gain 255 / flags: none | Very strong positive feedback: once Pyruvate climbs past threshold, the linked reaction's rate is driven sharply upward — the dominant high-gain regulator of Pyruvate turnover |
| 6 | Receptor 36 (reaction-rate feedback) | Gene 29, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 191 / threshold 32 / gain 77 / flags: none | Moderate positive feedback: another reaction is nudged faster as Pyruvate accumulates |
| 7 | Receptor 53 (reaction-rate feedback, inverted) | Gene 27, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 233 / threshold 32 / gain 204 / flags: REDUCE (invert) | Strong *negative* feedback: high Pyruvate throttles another reaction *down*, balancing the two positive-feedback receptors above and preventing run-away synthesis |
| 8 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1) | Pyruvate does not decay naturally; any unburned Pyruvate sits in the bloodstream until a reaction consumes it or it is removed externally |

## Role in Game Mechanics

### The metabolic hub

Pyruvate is unique in the standard biochemistry because it touches *four* of the five energy-related chemicals (Glucose, Fatty Acid, Cholesterol, ATP/ADP, and Energy itself). Every other fuel is either one reaction away from Pyruvate or is made *from* Pyruvate. Diagrammatically:

```
    Glycogen ─► Glucose ──────► Pyruvate ──────► Energy (→ ATP)
                   ▲               │
                   │ gluconeogen.  │ respiration
                   │               │
               (reaction 8)    (reaction 19, with O2)
                   │
    Adipose ─► Triglyceride ─► Fatty Acid ───► Pyruvate  (β-oxidation, reaction 17)
                                     ▲            │
                                     │            ▼
                               (reaction 7)   Fatty-acid synthesis (reaction 7)
                                     │
    Amino Acid + Pyruvate ─► Cholesterol ─► Amino Acid + Pyruvate
              (reaction 4)                        (reaction 11)
```

This makes Pyruvate the **throughput currency** of the body: food (Starch → Glucose, Adipose → Fatty Acid) is converted through Pyruvate into ATP, and excess Pyruvate is pushed back out into Fatty Acid / Cholesterol for long-term storage. Anything that blocks Pyruvate turnover starves the creature of Energy, and anything that floods it risks uncontrolled fat synthesis.

### Aerobic respiration — the core life reaction

The only "fast" consumer of Pyruvate is reaction 19 (the aerobic-respiration analogue), with a very-short half-life of ~5 ticks. Every simulation tick, each unit of Pyruvate that meets 3 units of Oxygen is converted into 6 units of Energy and 3 units of Dissolved CO₂. Downstream, reaction 20 (`Energy + 6× ADP → 6× ATP`) converts that Energy into the ATP that other reactions spend. This is the creature's primary fuel-burning loop; without Pyruvate there is no Energy, without Energy there is no ATP, and without ATP every ATP-dependent reaction (fatty-acid synthesis, gluconeogenesis, muscle building, etc.) stalls.

The CO₂ by-product of this reaction also drives the breathing receptor chain, so Pyruvate is indirectly responsible for the **respiration rate** of the creature.

### Storage vs. burning — the three-way feedback

The three reaction-rate receptors (35, 36 and 53) on the Somatic "Reaction" organ are the balancing mechanism that keeps Pyruvate in a sensible working range:

- Receptors 35 and 36 (flags = none) act as **positive feedback** on two separate reactions — as Pyruvate rises past threshold 32, those reactions speed up. In combination with the reactions feeding Pyruvate from Glucose and Fatty Acid this is what keeps respiration responsive: plenty of Pyruvate around means burn faster, make more Energy.
- Receptor 53 (flags = REDUCE) acts as **inverted feedback**: as Pyruvate rises, the associated reaction is *suppressed*. This is the brake that prevents the body from synthesising more fuel (Fatty Acid, Cholesterol) when it already has abundant Pyruvate.

The net effect is a self-regulating pool: low Pyruvate → storage pathways slow down and mobilisation (β-oxidation, glycogen breakdown) dominates; high Pyruvate → respiration and anabolism (Fatty Acid / Cholesterol synthesis) ramp up to absorb the excess.

### Why Pyruvate persists forever

The "Very long" half-life (genome value 255 → decay rate 1) is deliberate: Pyruvate is not a *signal* that needs to time out, it is a **substrate** that should only disappear when a chemical reaction consumes it. If Pyruvate had a natural decay the creature would slowly starve even while full of fuel. By making it effectively non-decaying, the designers guarantee that every unit of Glucose / Fatty Acid / Cholesterol the creature eats eventually converts either into ATP (via respiration) or back into storage — none of it is simply lost to biochemical background noise.

### Practical consequences for gameplay

- **Starvation** in the base genome manifests first as falling Glucose, then falling Pyruvate, then falling ATP — the last one starves every ATP-dependent process in the body. Feeding a hungry creature raises Glucose, which reaction 18 pumps into Pyruvate within ~50 ticks, which reaction 19 burns into Energy within ~5 ticks, restoring ATP supply.
- **Overfeeding** pushes Pyruvate above threshold, which (via receptors 35/36) triggers storage reactions 7 and 4, converting Pyruvate into Fatty Acid and Cholesterol; the downstream reactions eventually build Adipose Tissue, making the creature fatter.
- **Suffocation / low Oxygen** leaves Pyruvate building up (reaction 19 is O₂-limited). Because Pyruvate does not decay, a creature deprived of oxygen accumulates a large Pyruvate reservoir which will be burned very fast once oxygen returns.
- **CAOS-level tweaks** can inject or drain Pyruvate directly with `CHEM`, which will effectively add or remove stored energy without having to balance Glucose / Fatty Acid — a useful cheat for debugging metabolic genomes.

### Summary of the Pyruvate loop

```
          Glucose ─(glycolysis, r18)──┐
          Fatty Acid ─(β-ox, r17)─────┤
          Cholesterol ─(r11)──────────┤
                                      ▼
                                 Pyruvate  (persistent; initial 0.251)
                                      │
                   ┌──────────────────┼───────────────────────┐
                   │                  │                       │
            (r19) +O2               (r8) +ATP              (r7) +ATP
                   │                  │                       │
                   ▼                  ▼                       ▼
              Energy + CO2          Glucose                Fatty Acid
            (→ ATP via r20)      (sugar refill)          (→ Triglyceride → Adipose)
                                                            (r4): +Amino Acid → Cholesterol

 Feedback: Pyruvate concentration drives three reaction-rate receptors (35/36 positive, 53 inverted)
 that keep catabolism and anabolism in balance.
```

Pyruvate therefore sits at the exact centre of the creature's metabolism: every carbohydrate, fat and cholesterol movement passes through it, every ATP produced depends on it, and an intricate three-receptor feedback network keeps it in a healthy working range without ever letting it decay on its own.
