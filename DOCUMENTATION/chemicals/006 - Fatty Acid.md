# 006 - Fatty Acid

Fatty Acid is the creature's **free-lipid energy currency** — the soluble, actively burnable form of fat that sits between the storage pool (Triglyceride / Adipose Tissue) and the core metabolic cycle (Pyruvate / ATP). Biologically it mirrors the real-world role of non-esterified fatty acids in vertebrates: a mid-density energy carrier that can be synthesised from surplus carbohydrate when the creature is overfed, released from fat stores when the creature is starving, and oxidised in a high-yield burn reaction when the body needs ATP. In the Creatures 3 biochemistry it is chemical **6**, born with a small starting concentration (16 / ≈6.3%), non-decaying, and fully regulated by downstream receptors on the lipid- and carbohydrate-handling reactions rather than by any direct drive or sensor.

Unlike Starch (which is a pure input substrate with no feedback) or Glucose (which is the main fuel), Fatty Acid occupies the *fat* branch of the metabolism and participates in four reactions at once: it is built up from carbohydrate via lipogenesis, broken down from stored fat via lipolysis, polymerised into Triglyceride for long-term storage, and burned via β-oxidation to yield a very large amount of Pyruvate and ATP. It also acts as a **regulatory sensor** — two reaction-rate receptors (id 37 on Starch digestion and id 47 on dietary-fat digestion) read the Fatty Acid pool and modulate how fast the creature processes incoming food, giving the genome a built-in satiety/energy-balance feedback loop that has no equivalent on the carbohydrate-only side. Finally, Fatty Acid is one of the two reactants of the **Prostaglandin cycle** (Amino Acid + Fatty Acid ↔ Prostaglandin), tying the lipid pathway directly into the creature's injury-repair, stress-response and inflammation systems.

In short: Starch is "food arriving", Glucose is "fuel in the blood", Glycogen is "short-term energy battery", and Fatty Acid is "unlocked fat — ready to either burn, re-store, or signal". It is the single busiest chemical in the lipid half of the biochemistry and the hinge on which both long-term fat balance and prostaglandin signalling swing.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | Gene 11, Baby onwards | Systemic | Newborn endowment | Amount 16 / concentration 0.0627 (≈6.27 %) at birth |
| 2 | Lipogenesis (reaction 7) | Gene 34, Baby onwards | Standard | `8× Pyruvate [2] + 6× ATP [35] → 1× Fatty Acid [6] + 6× ADP [36]` | Medium, half-life ~621 ticks (decay 0.99888) — consumes surplus carbohydrate energy to build new fatty-acid molecules |
| 3 | Lipolysis (reaction 14) | Gene 29, Baby onwards | Standard | `1× Triglyceride [8] → 3× Fatty Acid [6]` | Short, half-life ~47 ticks (decay 0.98549) — releases three Fatty Acids per Triglyceride when the body mobilises stored fat |
| 4 | Stress-driven prostaglandin breakdown (reaction 76) | Gene 83, Baby onwards | Standard | `1× Stress [128] + 1× Prostaglandin [94] → 1× Stress [128] + 1× Fatty Acid [6]` | Short, half-life ~16 ticks (decay 0.9575) — Stress catalyses the liberation of Fatty Acid from the Prostaglandin pool |
| 5 | Prostaglandin cleavage (reaction 100) | Gene 67, Baby onwards | Standard | `2× Prostaglandin [94] → 1× Amino Acid [13] + 1× Fatty Acid [6]` | Short, half-life ~18 ticks (decay 0.9614) — passive disassembly of Prostaglandin back into its two precursors |

There is **no organ emitter** that produces Fatty Acid directly and **no dietary pathway** that injects Fatty Acid as a raw stim. Every molecule of Fatty Acid in a creature's body either came from the initial concentration or was produced by one of the four reactions above. Dietary fat (stim 78) works *indirectly*: it writes chemical **10 (Fat)**, which reaction 3 then digests into Triglyceride + Cholesterol, and only after reaction 14 splits that Triglyceride does Fatty Acid finally appear in the bloodstream. This two-step delay is deliberate and gives the creature a smoother, slower fat-loading curve than it has for carbohydrate loading.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Triglyceride synthesis (reaction 9) | Gene 30, Baby onwards | Standard | `3× Fatty Acid [6] → 1× Triglyceride [8]` | Medium, half-life ~621 ticks — packs three free Fatty Acids into one Triglyceride for long-term storage (which is then further condensed into Adipose Tissue by reaction 10) |
| 2 | β-oxidation / fatty-acid burning (reaction 17) | Gene 31, Baby onwards | Standard | `1× Fatty Acid [6] + 6× ADP [36] → 8× Pyruvate [2] + 6× ATP [35]` | Short, half-life ~52 ticks — the opposite of lipogenesis: one Fatty Acid is burned for a large yield of eight Pyruvate + six ATP, the most energy-dense single reaction in the standard biochemistry |
| 3 | Prostaglandin synthesis (reaction 101) | Gene 68, Baby onwards | Standard | `1× Amino Acid [13] + 1× Fatty Acid [6] → 2× Prostaglandin [94]` | Short, half-life ~21 ticks — combines one Fatty Acid with one Amino Acid to produce two Prostaglandin molecules used in injury repair and stress signalling |
| 4 | Starch-digestion feedback (receptor 37) | Gene 26, Baby onwards | Reaction organ, Somatic tissue, locus 0 | DIGITAL (all-or-nothing), threshold 26, nominal 184, gain 77 | Above ≈10 % Fatty Acid the receptor drives the Starch → Glucose reaction rate to the gain value 77 (a moderate setting), coupling starch digestion to the current fat-availability state |
| 5 | Dietary-fat digestion feedback (receptor 47) | Gene 25, Baby onwards | Reaction organ, Somatic tissue, locus 0 | REDUCE (inverted), threshold 25, nominal 222, gain 255 | Inverts Fatty Acid: when FA is high the output is low, suppressing the Fat → Triglyceride + Cholesterol digestion reaction; when FA is low, digestion runs at full rate — a direct negative-feedback brake on over-digesting dietary fat |
| 6 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1.0) | Fatty Acid does not decay naturally; any unused molecules remain until a reaction consumes them |

Fatty Acid has **no drive receptors, no brain receptors, and no muscle/neuron targets** — it never acts directly on behaviour. All of its influence on the creature's body is delivered via:

- the four reactions that consume it (storage, burning, prostaglandin synthesis), and
- the two rate-modulator receptors (37 and 47) that let it steer food digestion.

Hunger-for-fat (chemical **151**) and CA smell 8 (chemical **172**) are *separate* drive/scent chemicals that run the eating-behaviour loop; Fatty Acid itself does not participate in them.

## Role in Game Mechanics

### The fat half of the metabolism

The biochemistry has two parallel energy pathways that share a single hub (Pyruvate):

```
        ┌───────── Starch (5) ──► Glucose (3) ──► Glycogen (4)
        │                              │
  FOOD ─┤                              ▼
        │                          Pyruvate (2) ◄──┐
        │                              │           │
        │                              ▼           │
        │                          ATP / Energy    │
        │                              ▲           │
        │                              │           │
        └─ Fat (10) ──► Triglyceride ──► Fatty Acid (6) ◄──► Adipose Tissue (9)
                        (8)                ▲
                                            │
                                Amino Acid + FA ◄──► Prostaglandin (94)
```

Fatty Acid sits at the nexus of the lower (fat) branch. Every path into or out of the fat pool — dietary ingestion, fat storage, fat mobilisation, fat burning, prostaglandin synthesis — has to pass through Fatty Acid. This makes it the single most-connected chemical in the lipid half of the chemistry: four reactions name it as reactant or product, and two receptors use its concentration as a regulatory signal.

### Lipogenesis: turning excess carbohydrate into fat

Reaction 7 (`8× Pyruvate + 6× ATP → 1× Fatty Acid + 6× ADP`) is the creature's *lipogenesis* path. It only runs at a meaningful rate when both Pyruvate and ATP are abundant — i.e. when the creature has more carbohydrate energy than it can currently use. The 8 : 1 stoichiometry is intentionally expensive: you need eight Pyruvate and six ATP to make a single Fatty Acid, so lipogenesis is only worthwhile when Pyruvate is well above Fatty Acid in relative concentration. Combined with the medium half-life (~621 ticks) this gives the body a slow, thermodynamically sensible "if you've been overfed for a while, start laying down fat" behaviour, exactly analogous to real metabolism.

From there, reaction 9 (`3× Fatty Acid → 1× Triglyceride`) packs three Fatty Acids into one Triglyceride, and reaction 10 then packs eight Triglycerides into one unit of Adipose Tissue. The overall compression factor from the carbohydrate side to Adipose Tissue is therefore:

```
8 Pyruvate + 6 ATP → 1 FA → ⅓ Trig → 1/24 Adipose
```

which means it takes roughly 192 Pyruvate and 144 ATP to build one unit of Adipose Tissue — a deliberately heavy cost that prevents creatures from becoming obese simply from moderate over-eating.

### Lipolysis: mobilising stored fat

When the creature is short on carbohydrate, reaction 14 (`1× Triglyceride → 3× Fatty Acid`) breaks down stored Triglyceride into three free Fatty Acids. Its half-life (~47 ticks) is short — roughly 13× faster than lipogenesis — so the body can rapidly release stored fat into the usable Fatty Acid pool when it needs energy. In combination with reaction 16 (Adipose → 8 Triglyceride) this forms the canonical starvation cascade:

```
Adipose Tissue ──► 8 Triglyceride ──► 24 Fatty Acid ──► 192 Pyruvate + 144 ATP
```

A single unit of Adipose can, in principle, yield ~192 Pyruvate and ~144 ATP — enough to keep a creature alive through a long hungry patch, which is exactly what body fat is *for* biologically.

### β-oxidation: the highest-yield burn reaction

Reaction 17 (`1× Fatty Acid + 6× ADP → 8× Pyruvate + 6× ATP`) is the β-oxidation path — the reverse of lipogenesis in stoichiometry, but running on a much shorter half-life (~52 ticks vs. 621). Each Fatty Acid burned yields eight Pyruvate and six ATP; this is more than any other single reaction in the core metabolism, and it is specifically why fat is the body's high-density energy reserve.

Because reaction 17 is fast and reaction 7 (the reverse) is slow, the system is thermodynamically biased *toward burning* fat when Fatty Acid is present — you build it up slowly under surplus and spend it rapidly under demand. This asymmetry is what stops creatures from oscillating between lipogenesis and β-oxidation and gives the fat pool its characteristic "ratchet" behaviour: easy to mobilise, hard to lay down.

### Digestion-rate feedback: receptors 37 and 47

Fatty Acid is one of the very few metabolites in the genome that has **reaction-rate receptors** placed on *other* reactions. These receptors let the current Fatty Acid pool steer the speed of incoming food processing:

- **Receptor 37 (gene 26, Starch digestion)**: DIGITAL, threshold 26/255, gain 77. When Fatty Acid rises above ≈10 %, the Starch → Glucose reaction rate is driven to the gain value 77. In practice this ties starch digestion to the current fat-energy level — if the creature already has ample free fatty acids available to burn, starch digestion runs at a moderate, controlled rate rather than the genome's raw default.
- **Receptor 47 (gene 25, dietary-fat digestion)**: REDUCE (inverted), threshold 25/255, gain 255. This is a direct negative-feedback brake on the Fat → Triglyceride + Cholesterol digestion reaction: when Fatty Acid is high the inverted receptor output is low, slowing the creature's ability to digest *more* dietary fat while it still has plenty of free fatty acids unused. When Fatty Acid drops, the brake releases and dietary fat digestion proceeds at full rate.

Together, these two receptors implement a simple but effective **energy-balance controller** on the digestive side:

```
FA high ──► digest less incoming fat, moderate the digestion of starch
FA low  ──► digest fat aggressively, digestion runs at default rate
```

This is the biochemistry's answer to satiety: rather than having a brain-level "I am full" signal, the digestion itself physically slows down when the body is already well-supplied, sparing the rest of the metabolism from being flooded.

### The Prostaglandin cycle

Fatty Acid is the non-protein half of the Prostaglandin (94) cycle:

- **Reaction 101** (`Amino Acid + Fatty Acid → 2 Prostaglandin`) is the synthesis direction, at a short half-life of ~21 ticks.
- **Reaction 100** (`2 Prostaglandin → Amino Acid + Fatty Acid`) is the passive disassembly, at ~18 ticks.
- **Reaction 76** (`Stress + Prostaglandin → Stress + Fatty Acid`) is the stress-catalysed cleavage, at ~16 ticks, where Stress acts as a catalyst that is not consumed: under stress, the body preferentially breaks Prostaglandin back down into Fatty Acid (which can be burned for quick energy) without regenerating the Amino Acid.

Prostaglandin itself is the key locus on the **rate-of-repair** receptor on every organ (receptor 39 and 49 set gain values based on Prostaglandin concentration at RLOCUS_RATEOFREPAIR). This makes Fatty Acid an *upstream precursor of injury repair*: a creature with plenty of Amino Acid and Fatty Acid can synthesise Prostaglandin, which then speeds up organ repair, while stress tips the balance back toward Fatty Acid at the expense of repair.

The full Prostaglandin triangle looks like this:

```
         reaction 101 (HL 21)
  AA + FA ─────────────────► 2 Prostaglandin
         ◄───────────────── reaction 100 (HL 18)
                │
                │  (Stress catalyses one-sided cleavage)
                ▼
  reaction 76:  Prostaglandin + Stress → Fatty Acid + Stress   (HL 16)
```

In plain terms: when the creature is calm and well-fed, Prostaglandin accumulates and organ repair is efficient; when the creature is stressed, Prostaglandin is drained back into Fatty Acid (which can then be burned for fight-or-flight energy via β-oxidation), but at the cost of repair capacity. This is a direct biochemical trade-off between *healing* and *running away*.

### Relation to Fat-Hunger (chem 151) and Fat-Smell (chem 172)

Fatty Acid is purely metabolic — it has no drive or sensor function — but the chemistry still provides a complete behavioural loop for fat on the *outside* of the Fatty Acid pathway:

- **Hunger for fat (chem 151)** is the drive chemical that rises over time and that the brain reads to generate the "eat something fatty" urge. It is born with a small initial concentration (33) and is consumed by the stim 78 eating pathway (apples, fungi, cheese) and by reactions 45 and 71 that shuffle it against a backup chemical (134). The drive never reads Fatty Acid directly.
- **CA smell 8 (fat) (chem 172)** is a room-scale scent map written by fatty food agents; the creature's sensory system smells it and walks toward the source.
- **Stim 78** is the "I just ate something fatty" stimulus that food agents fire in their `eat me` script; it writes chemical 10 (Fat), **not** Fatty Acid directly. Reaction 3 then digests that Fat into Triglyceride + Cholesterol, and reaction 14 eventually liberates Fatty Acid from the Triglyceride.

So the full eating-to-burning loop for fat is:

```
fat-smelling food ──► Hunger for fat rises (drive)
                          │
                          ▼
                creature finds food via CA smell 8 (fat)
                          │
                          ▼
                eats food ──► stim 78 writes Fat (10)
                                      │
                              (reaction 3, HL 116)
                                      ▼
                          Triglyceride (8) + Cholesterol (7)
                                      │
                              (reaction 14, HL 47)
                                      ▼
                                Fatty Acid (6)
                                      │
                     ┌────────────────┼────────────────┬──────────────────┐
                     ▼                ▼                ▼                  ▼
          reaction 9 (store)   reaction 17 (burn)   reaction 101       receptors 37/47
             (→ Triglyceride)   (→ 8 Pyr + 6 ATP)   (→ Prostaglandin)   (feedback on digestion)
```

### Why Fatty Acid has a non-zero initial concentration

Unlike Starch (born at 0) and Glycogen (born at 0), Fatty Acid is born with a small pool (~6.3 %). This matters because β-oxidation (reaction 17) is the creature's fastest high-yield burn reaction, and newborns need an immediately available source of ATP to power their first muscle twitches, first breaths, and first brain activity before they have eaten anything. The initial 16 units of Fatty Acid, plus the initial 70 units of Adipose Tissue (which can be mobilised via the Adipose → Triglyceride → Fatty Acid cascade), give a baby creature roughly enough energy capital to survive its first several minutes of life without any food input at all.

### Why Fatty Acid doesn't decay

Like all the core metabolites (Glucose, Glycogen, Triglyceride, Starch, Pyruvate, etc.), Fatty Acid's passive half-life is effectively infinite (9.07 × 10¹⁰ ticks, decay 1.0). If it decayed naturally, free fatty acids would "spoil" inside the body whenever the creature was resting — leaking energy out of the system for no reason. Instead, the chemical is non-decaying and only disappears when one of the four consumer reactions (storage, burning, Prostaglandin synthesis) pulls it out of the pool.

### Practical consequences for gameplay

- **Starvation timeline**: when a creature stops eating, Starch drains first, then Glucose, then Glycogen. After Glycogen is gone, the body falls back on Adipose → Triglyceride → Fatty Acid → β-oxidation to keep ATP flowing. A well-fed creature with high Adipose can survive *much* longer without food than a lean one, because the fat branch is a genuinely large energy reservoir funnelled through Fatty Acid.
- **Overfeeding**: continually feeding a creature high-energy food eventually raises Pyruvate enough that lipogenesis (reaction 7) starts running, converting surplus Pyruvate into Fatty Acid, which then condenses into Triglyceride and then Adipose Tissue. In-game this is visible as creatures slowly getting fatter when over-fed — exactly the same mechanism as real biology.
- **Stress and repair**: a chronically stressed creature burns its Prostaglandin pool back into Fatty Acid (reaction 76), depriving its organs of the rate-of-repair signal. This is why stressed creatures heal more slowly and why reducing stress accelerates recovery — the biochemistry implements it directly.
- **Debugging / CAOS feeding**: calling `CHEM 6 amount` directly injects Fatty Acid without going through the Fat → Triglyceride → Fatty Acid digestive cascade, which is useful for testing β-oxidation or lipogenesis in isolation. For a more realistic "I just ate something fatty" simulation, fire `stim writ targ 78 N` (apples/cheese path) or write chemical 10 (Fat) directly and let the reactions do the rest.
- **Food-agent tuning**: the two digestion-rate receptors (37 and 47) mean that food agents should think of their stim-78 value as the *long-term* fat contribution rather than the instantaneous energy delivered. A creature with already-high Fatty Acid will digest the incoming Fat slowly (receptor 47 brake), so a single large fatty meal does not immediately translate into a huge Fatty Acid spike — it loads gradually over hundreds of ticks.

### Summary of the Fatty Acid pipeline

```
  Dietary Fat (stim 78 → chem 10)
           │
           │  reaction 3 (HL 116)
           ▼
    Triglyceride (8) ◄──── reaction 16 ──── Adipose Tissue (9)
           │                                       ▲
           │  reaction 14 (HL 47)                  │ reaction 10
           ▼                                       │
   ┌─► Fatty Acid (6) ──► reaction 9 ──► Triglyceride ─┘
   │        │
   │        ├──► reaction 17 (β-oxidation, HL 52) ──► 8 Pyruvate + 6 ATP
   │        │
   │        ├──► reaction 101 (+ Amino Acid) ──► 2 Prostaglandin
   │        │                                        │
   │        │                          reaction 100 / 76 ── AA + FA  or  Stress + FA
   │        │                                        │
   │        ◄────────────────────────────────────────┘
   │
   │  reaction 7 (lipogenesis, HL 621)
   │
   8 Pyruvate + 6 ATP
```

Fatty Acid is therefore the **pivot chemical of the lipid metabolism** — the only chemical where dietary input, stored reserves, active burning, regulatory feedback, and stress/repair signalling all meet. Every fat-related decision the body makes (store, mobilise, burn, signal) passes through the Fatty Acid pool, and the genome deliberately uses it as both a substrate *and* a regulatory input so that the creature's fat balance is self-correcting without ever having to involve the brain.
