# 025 - Urea

Urea is the creature's **nitrogen-excretion waste chemical** — the biochemical endpoint of protein catabolism. In the standard Norn/Grendel/Ettin genome there is no reaction that produces Ammonia without it going on to produce Urea: every time the creature burns Amino Acid for energy (reaction 21), Ammonia is generated, and that Ammonia is detoxified by combining it with Dissolved carbon dioxide into Urea (reaction 30). Urea thus sits at the *downstream* end of the nitrogen pipeline, where Ammonia's short-term, highly-toxic signal has been converted into a stable, less-toxic long-term waste.

Unlike most core metabolites, Urea has an effectively infinite passive half-life (~9 × 10¹⁰ ticks, decay rate 1), so it never disappears on its own. The creature must actively destroy it through a dedicated excretion reaction (reaction 28) that pairs Urea with **Pistle** — a short-lived "kidney-enzyme" chemical whose release is itself gated by a Urea-high alarm. This gives Urea a feedback-loop architecture that is rare among the standard chemicals: a high-urea receptor fires, a Pistle emitter responds by flooding the body with enzyme, Pistle reacts with Urea to destroy both, and the loop quiets down once Urea falls back below threshold. Urea is therefore the *trigger* for its own clearance rather than something that decays passively or is consumed by general metabolism.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction (id 30) — urea synthesis (nitrogen-disposal loop) | Gene 46, Baby onwards | Standard (genome-wide) | `2× Ammonia [26] + 1× Dissolved carbon dioxide [24] → 1× Urea [25] + 1× Water [33]` | Short half-life (~24 ticks, decay 0.971) — fires whenever both reactants are present; binds Ammonia detoxification to CO₂ disposal |

Urea has no dedicated emitter in the standard genome. Every molecule of Urea in a healthy creature's body comes from reaction 30, and indirectly from reaction 21 (`2 Amino Acid → 1 Glucose + 1 Ammonia`) upstream of it. External sources are possible (injected via CAOS `CHEM` / `INJR`, or placed in a creature by food/drug agents), but are not part of the normal metabolic design.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction (id 28) — Pistle-catalysed excretion | Gene 51, Baby onwards | Standard (genome-wide) | `1× Urea [25] + 1× Pistle [113] → (nothing)` | Medium half-life (~116 ticks, decay 0.994) — requires Pistle, which is only released while Urea is above the toxicity threshold |
| 2 | Receptor 84 — body-wide high-urea toxicity alarm | Gene 44, Baby onwards | Creature / Circulatory / Locus 1 | Threshold **192 / 256 ≈ 75 %**, gain 255, nominal 0, DIGITAL (all-or-nothing) — output snaps to full strength whenever Urea exceeds ~75 % of its maximum | Read each tick |
| 3 | Passive accumulation | — | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1) — Urea does not decay on its own; it is only removed by reaction 28 |

## Role in Game Mechanics

### The nitrogen pipeline

Urea is the final stop in the creature's nitrogen-disposal chain:

```
 (food → digestion → Protein → Amino Acid)
                                   │
                                   ▼
                    Amino Acid [13]  (reaction 21: "burn protein for energy")
                                   │
                                   ▼
                    Glucose [3]  +  Ammonia [26]    ← toxic intermediate
                                   │
                                   ▼
           Ammonia [26]  +  Dissolved CO₂ [24]     (reaction 30)
                                   │
                                   ▼
                    Urea [25]  +  Water [33]       ← stable waste
                                   │
                                   ▼
                    Urea [25]  +  Pistle [113]     (reaction 28)
                                   │
                                   ▼
                            (nothing)               ← excreted
```

Every time a creature consumes Amino Acid for energy, it produces Ammonia; every unit of Ammonia that the body detoxifies becomes Urea. Urea is the *safe form* of the creature's nitrogen burden: it is not directly toxic (there is no emergency drive attached to it), but because nothing breaks it down except the Pistle pathway, it will accumulate steadily in any creature that eats protein.

### The Pistle feedback loop

What makes Urea distinctive among the core metabolites is that it drives its own clearance through a **closed feedback loop** rather than a constant passive drain. Three elements make this loop work:

1. **Receptor 84** (Creature / Circulatory / Locus 1) reads Urea concentration. With threshold 192 and DIGITAL flags, it is silent while Urea sits below ~75 % of scale and then **snaps fully on** once Urea crosses that line. Its output is written to Locus 1 of the Circulatory signal bus.

2. **Emitter 14** (the companion to receptor 84, Gene 8, same Creature / Circulatory / Locus 1) reads that Locus 1 signal and, whenever it is high, emits **Pistle** (chemical 113) into the body at gain 255. Pistle has a short half-life of only 13 ticks — it is a transient enzyme, not a persistent chemical.

3. **Reaction 28** (`1 Urea + 1 Pistle → nothing`) is the actual excretion step: once Pistle is circulating, it destroys Urea one-for-one, with both reactants consumed.

Put together, these three pieces form a closed servo: Urea climbs, the alarm fires above 75 %, Pistle floods in, reaction 28 burns Urea and Pistle together until Urea drops below threshold, the alarm switches off, Pistle stops being emitted and rapidly decays away (HL 13), the reaction halts, and the system idles until the next accumulation. This is why a healthy creature's Urea level shows a characteristic **saw-tooth pattern** rather than a smooth steady-state: it slowly ramps upward as reaction 30 produces it, then gets clipped back below 75 % when the Pistle burst fires.

### Why this architecture?

The Urea / Pistle design has two notable gameplay consequences:

- **It is fuel-efficient.** Because Pistle is only emitted while Urea is actually above threshold, the creature does not pay an ongoing "excretion tax" when it is not eating protein. A Norn that subsists on Glucose / Starch / fat-rich food produces very little Ammonia (and therefore very little Urea), and its Pistle pathway stays dormant. Contrast this with a constant-drain model (e.g. if Urea had a finite passive half-life), which would force the same clearance cost regardless of load.
- **It is resistant to Ammonia spikes.** Protein-heavy meals generate Ammonia fast, which reaction 30 rapidly converts into Urea faster than the Pistle loop would otherwise clear it. The Urea buffer soaks up the nitrogen load and spreads the actual excretion across many ticks, rather than asking the creature to dispose of raw Ammonia (which has its own, more aggressive toxicity receptors) at the same rate it was produced. In short, Urea acts as a **capacitor** that decouples the rate of Ammonia production from the rate of physical excretion.

### Dependence on Dissolved CO₂

Reaction 30 has two reactants — Ammonia and CO₂ — and therefore the **entire nitrogen-disposal pipeline is coupled to the respiration pipeline**. If a creature stops burning Pyruvate (through starvation, unconsciousness, or a mutation to reaction 19), CO₂ production throttles, reaction 30 stalls, and Ammonia can no longer be converted to Urea. Urea levels then *fall* (because the Pistle loop keeps clearing the existing pool with no new input), while Ammonia rises unchecked and triggers its own toxicity responses. The chain of consequences from "no energy metabolism" to "creature poisoned by its own Ammonia" passes directly through Urea as the missing intermediate.

Conversely, a creature that is over-respiring but not eating protein will have plenty of CO₂ but no Ammonia, and reaction 30 will also not fire. In that case, CO₂ is instead consumed by reaction 25 (`3 CO₂ → 1 Water`, the "exhalation" pathway), and Urea stays at zero.

### Interaction with water balance

Both the synthesis and the excretion legs of the Urea cycle produce Water as a by-product (reaction 30 directly; reaction 28 via Pistle's side reaction 29 `Water + Pistle → 3 Coldness + Pistle`, which catalyses cooling using Water). Urea is therefore one of the quiet contributors to the creature's water supply — a protein-heavy diet produces a slow trickle of Water into the body even if the creature never drinks, and also contributes to its cooling capacity, because Pistle's presence during a Urea clearance burst converts Water into Coldness.

### The locus-1 "toxicity alarm" channel

Receptor 84 sits on the same Creature / Circulatory signal bus as several other "vital-sign" receptors:

- Locus 0 (Adipose Tissue, threshold 8, REDUCE + DIGITAL): fat-depletion alarm
- **Locus 1 (Urea, threshold 192, DIGITAL): high-urea toxicity alarm**
- Locus 2 (Amino Acid, threshold 16, DIGITAL): protein-starvation alarm
- Locus 4 (Energy, threshold 128): low-energy fatigue alarm
- Locus 8 (Muscle Tissue, threshold 26): muscle-wasting alarm

Each of these is a body-wide, all-or-nothing "life-critical channel" that other genes can subscribe to. The Urea channel is unusual among them in that it is the only one driving its own clearance emitter directly (receptor + emitter share the same locus), rather than being read purely by downstream behaviour / phenotype / life-state genes. It is the body's "self-cleaning" servo, not a hunger-style drive.

That said, the locus-1 signal is still a bus — *any* gene can read it. In the stock C3 genome only the Pistle emitter picks it up, but a genetic engineer can attach further consequences (e.g. forcing a rest pose, raising a "discomfort" drive, or pushing the creature toward water) by adding new receptors / emitters tied to Locus 1 of Creature / Circulatory.

### Balancing and scripter notes

- **Receptor 84's high threshold (192 / 256 ≈ 75 %)** means a creature has to be substantially "full of urea" before the clearance loop fires. This is intentional — the Pistle burst is not cheap (it also consumes Water via the Coldness side-reaction), so the body tolerates a moderate Urea load before engaging excretion. A creature that eats protein only occasionally may never see the alarm fire at all.
- **Reaction 28's medium half-life (~116 ticks)** is slow on purpose: even when Pistle is available, Urea is cleared steadily rather than instantly, which is what gives the Pistle-dependent excretion its saw-tooth character.
- **Food / drug agents** that inject Amino Acid or Ammonia directly will trickle Urea into the body via reaction 30; agents injecting Urea directly (via `CHEM`) are mostly used for debugging the Pistle loop or to test the alarm's hysteresis behaviour.
- **Mutations on gene 46 (reaction 30)** can prevent a creature from detoxifying Ammonia at all, leaving Urea artificially low while Ammonia builds up and poisons the creature through its own receptors. Mutations on gene 51 (reaction 28) or gene 8 (Pistle emitter 14) break the *clearance* side instead, leaving Urea to ratchet toward saturation with no way to clear it — effectively slow nitrogen poisoning via the high-urea alarm's downstream connections.

### Summary of the Urea loop

```
                         Amino Acid [13]  (protein catabolism, reaction 21)
                                │
                                ▼
                     Glucose [3]  +  Ammonia [26]
                                           │
                                           ▼
                          Ammonia [26]  +  CO₂ [24]       (reaction 30)
                                           │
                                           ▼
                                      Urea [25]  +  Water [33]
                                           │
                                           │    receptor 84 (Circ/Locus 1, threshold 192)
                                           ▼
                                  locus 1 signal "on"  ─────►  emitter 14 (Pistle release)
                                                                           │
                                                                           ▼
                                                                       Pistle [113]
                                           │
                                           ▼
                               Urea [25]  +  Pistle [113]          (reaction 28)
                                           │
                                           ▼
                                       (nothing)  — nitrogen excreted
```

Urea therefore sits at the centre of a self-regulating nitrogen-disposal system: it is the stable carrier for the toxicity that Ammonia represents, it drives its own clearance via a tightly-coupled receptor / emitter / reaction triad, and it quietly ties protein metabolism to the respiration and water-balance pipelines through its shared reactants and by-products.
