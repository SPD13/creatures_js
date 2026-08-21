# 007 - Cholesterol

Cholesterol is chemical **7** in the standard Creatures 3 biochemistry. Biologically it is the sterol precursor that vertebrate bodies both **make from scratch** (de-novo synthesis in the liver) and **liberate from dietary fat** (bile-acid / lipoprotein recovery); the Creatures genome models exactly those two source paths, plus a single catabolic path that takes it back apart into generic building-blocks. Unlike the main energy chemicals of the fat branch (Triglyceride, Fatty Acid, Adipose Tissue), Cholesterol is **not a fuel**: no reaction burns it for ATP, and no organ emits it directly. It exists in the biochemistry as a **nitrogen-free carbon reservoir** — a place where surplus Pyruvate and Amino Acid can be parked when the body has plenty of both, and pulled back out when either runs low.

Cholesterol is born at concentration **0** (there is no initial-concentration gene for chemical 7), does not decay passively (half-life 9.07 × 10¹⁰ ticks, decay 1.0), is produced as the one-molecule by-product of dietary-fat digestion and as the main product of an Amino-Acid / Pyruvate condensation reaction, and is consumed solely by the exact reverse of that condensation. It also acts as a **regulatory sensor**: two reaction-rate receptors (id 31 and id 43) read the current Cholesterol pool and modulate the rate of other reactions, giving the genome a two-ended feedback signal — one inverting (REDUCE + DIGITAL) and one straight — that lets cholesterol availability act as a "carbon-store full / carbon-store empty" indicator elsewhere in the body. Cholesterol has **no drive, brain, muscle, or scent receptors** and is completely invisible to the creature's behaviour; its entire role is internal metabolic bookkeeping.

In short: Triglyceride is "fat for energy", Adipose Tissue is "fat for storage", and Cholesterol is "fat-branch by-product that doubles as an amino-acid / pyruvate buffer". It is the smallest and most specialised of the lipid-branch chemicals, but it is the only one that bridges the fat pathway back into the amino-acid / carbohydrate pool.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Dietary-fat digestion (reaction 3) | Gene 25, Baby onwards | Standard | `1× Fat [10] → 3× Triglyceride [8] + 1× Cholesterol [7]` | Medium, half-life ~116 ticks (decay 0.99402) — every unit of dietary Fat digested yields exactly one Cholesterol alongside three Triglyceride |
| 2 | De-novo synthesis (reaction 4) | Gene 59, Baby onwards | Standard | `1× Amino Acid [13] + 4× Pyruvate [2] → 1× Cholesterol [7]` | Medium, half-life ~116 ticks (decay 0.99402) — condenses one Amino Acid with four Pyruvate into a single Cholesterol molecule when carbohydrate and protein are both plentiful |

There is **no initial concentration** for Cholesterol (chemical 7 does not appear in the genome's initial-concentrations block), **no organ emitter** that writes it directly, and **no dietary stim** that injects it as a raw stimulus. Every molecule of Cholesterol in a creature's body either came from the digestion of dietary Fat (stim 78 → chemical 10 → reaction 3) or from the condensation reaction that consumes surplus Amino Acid and Pyruvate. A newborn creature therefore starts with zero Cholesterol and only begins to accumulate it after its first meal or its first bout of metabolic surplus.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Catabolism (reaction 11) | Gene 60, Baby onwards | Standard | `1× Cholesterol [7] → 1× Amino Acid [13] + 4× Pyruvate [2]` | Medium, half-life ~116 ticks (decay 0.99402) — exact reverse of reaction 4; one Cholesterol releases one Amino Acid and four Pyruvate back into the pool |
| 2 | Reaction-rate feedback (receptor 31) | Gene 49, Baby onwards | Reaction organ, locus = reaction rate | DIGITAL + REDUCE (invert + all-or-nothing), threshold 16, nominal 230, gain 229 | Inverts Cholesterol: below ≈6.3 % the receptor output is high and drives the target reaction's rate up to the gain value; above the threshold the output collapses to 0, shutting that reaction off |
| 3 | Reaction-rate feedback (receptor 43) | Gene 51, Baby onwards | Reaction organ, locus = reaction rate | No flags (linear positive), threshold 25, nominal 184, gain 255 | Straight Cholesterol read: when Cholesterol rises above ≈10 % the receptor output climbs toward the gain value 255, accelerating its target reaction in direct proportion to Cholesterol availability |
| 4 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1.0) | Cholesterol does not decay naturally; any accumulated cholesterol remains until reaction 11 consumes it |

Cholesterol has **no drive receptors, no brain receptors, no muscle or neuron targets, and no scent role**. It never reaches the creature's awareness and never drives behaviour. All of its influence on the body is delivered via the single catabolic reaction (reaction 11) and the two reaction-rate receptors (31 and 43) that read its concentration.

## Role in Game Mechanics

### Position within the fat branch

The lipid half of the biochemistry has two parallel products of Fat (chemical 10) digestion, and Cholesterol is the minor one:

```
         Dietary Fat (10)
               │
               │  reaction 3 (HL 116)
               ▼
     ┌─── Triglyceride (8) ── (reaction 14) ──► Fatty Acid (6) ──► β-oxidation / storage
     │
     └─── Cholesterol (7)
               │
               │  reaction 11 (HL 116)
               ▼
          Amino Acid (13) + 4× Pyruvate (2)
```

Reaction 3 is the only dietary source of Cholesterol: for every one molecule of Fat the creature digests, it produces three Triglyceride (which feeds the Fatty Acid / Adipose energy chain) and one Cholesterol (which enters its own little sub-cycle). The 3 : 1 stoichiometry reflects Cholesterol's real-world status — a *by-product* of lipid handling rather than the main nutritional payload.

Because reaction 11 cleanly reverses reaction 4, the Amino-Acid / Pyruvate pool and the Cholesterol pool together form a **four-reactant buffer**:

```
       reaction 4  (HL 116)
  1× AA + 4× Pyr ─────────────────► 1× Cholesterol
                ◄───────────────── reaction 11 (HL 116)
```

Both reactions run at identical half-lives (~116 ticks) and identical stoichiometry, so the equilibrium between Cholesterol and (AA + 4 Pyr) is driven purely by their relative concentrations. This makes Cholesterol a neutral storage slot: if Amino Acid and Pyruvate are both high, reaction 4 dominates and Cholesterol accumulates; if either one runs low, reaction 11 dominates and Cholesterol is cannibalised back into its components. There is no thermodynamic asymmetry, no ATP cost, and no preferred direction — Cholesterol simply sloshes back and forth with the AA / Pyruvate supply.

### Why Cholesterol exists as a buffer

At first glance, a reaction and its exact reverse running at the same rate looks useless. Its value only becomes clear when you notice that dietary Fat **also** feeds into the Cholesterol pool via reaction 3. So Cholesterol has *one input the reverse reaction does not know about*: digestion of fatty food.

```
      reaction 4 (slow, symmetric)
 AA + 4 Pyr ◄──────────────────────► Cholesterol ──(consumed by recept 31 / 43 targets)
                                           ▲
                                           │  reaction 3 (fat digestion)
                                           │
                                      Dietary Fat
```

When the creature eats fatty food, Cholesterol rises without Amino Acid or Pyruvate being spent. Reaction 11 can then cleave that "free" Cholesterol back into Amino Acid + Pyruvate, effectively turning dietary fat into amino-acid and carbohydrate precursors without needing to eat protein or starch. This is the biochemistry's simulated version of **gluconeogenesis plus transamination from a lipid substrate**: fat → cholesterol → amino-acid + pyruvate. It is a slow trickle (HL 116 at each step), but over a long lifespan it gives a fat-eating creature a small steady drip of amino-acid and pyruvate input that a purely carbohydrate-eating creature would not have.

Conversely, when the creature is protein- and carbohydrate-rich but light on fat, reaction 4 dominates: surplus AA and Pyruvate are packaged into Cholesterol, which just sits there non-decaying until something pulls it back out. Cholesterol thus also behaves as a **non-decaying carbon+nitrogen sink** that prevents AA and Pyruvate from piling up indefinitely when the creature is over-fed on protein and starch.

### Reaction-rate feedback: receptors 31 and 43

Cholesterol has two rate-modulator receptors attached to reactions elsewhere in the biochemistry. Both receptors live in the Reaction organ where (per the organ locus-addressing routine) the receptor's output writes directly into a reaction's `Rate` slot — that is, they physically set how fast the target reaction runs, regardless of the receptor's specific locus number.

- **Receptor 31 (gene 49, REDUCE + DIGITAL, threshold 16/255, nominal 230, gain 229)** — inverted all-or-nothing brake. While Cholesterol stays below the ~6.3 % threshold the receptor output is driven to the gain value (229, almost the maximum), pushing its target reaction to full speed; as soon as Cholesterol crosses the threshold the DIGITAL flag snaps the output off and the reaction rate collapses to 0. This is a classic "starve-and-spike" negative feedback: the target reaction runs hard only while the cholesterol buffer is empty, and is silenced the moment cholesterol starts building up.
- **Receptor 43 (gene 51, no flags, threshold 25/255, nominal 184, gain 255)** — straight positive proportional read. Once Cholesterol rises above ≈10 %, the receptor output climbs toward the maximum gain (255), accelerating its target reaction in direct proportion to cholesterol availability. It is the mirror image of receptor 31: the reaction it regulates runs harder the *more* cholesterol the creature has.

Together, the two receptors let a single Cholesterol reading drive two different reactions in opposite directions: one reaction is suppressed when cholesterol is plentiful (recept 31) and one reaction is boosted when cholesterol is plentiful (recept 43). This is how the genome uses Cholesterol as a two-state metabolic signal — "empty" vs. "stocked" — without needing a drive or brain system to interpret it.

The JSON's receptor records list both receptors with `tissue = 0, locus = 0`, which in the engine's Reaction-organ addressing means "write to the Rate slot of the reaction stored at slot 0 of this receptor's parent organ". The concrete target reaction therefore depends on how the genome's Reaction-organ genes are paired with their rate receptors at load time; the observable effect, however, is always the same — one reaction is gated off and another is gated on by the current cholesterol level.

### Why Cholesterol does not decay

Cholesterol shares the "very long" passive half-life (9.07 × 10¹⁰ ticks, decay 1.0) with every other core metabolite in the fat branch. If it decayed naturally, the system would leak Amino Acid and Pyruvate equivalents out of the body whenever the creature was resting: each decayed Cholesterol would represent one permanently-lost amino acid and four permanently-lost pyruvates. By making Cholesterol non-decaying the genome guarantees that any carbon and nitrogen locked into the cholesterol pool can always be recovered later via reaction 11, preserving the law-of-conservation feel of the metabolism.

### Why Cholesterol starts at zero

Unlike Fatty Acid (initial 16), Adipose Tissue (70), Glucose (48), and Triglyceride (16), Cholesterol has no initial concentration. A baby creature is born with a **completely empty cholesterol pool** and only fills it through its first meals. This matters for two reasons:

- Receptor 31's target reaction runs full-blast from birth (cholesterol is below the threshold), and only shuts off once the creature has eaten enough fat or metabolised enough AA+Pyruvate to cross ≈6.3 %. This gives newborns a "starter mode" where one specific reaction fires aggressively for the first few minutes of life.
- Receptor 43's target reaction is silent at birth and only ramps up after the creature has accumulated cholesterol — so the "stocked" behaviour is earned through feeding, not baked in.

The fat branch is already energy-rich at birth (16 Triglyceride, 70 Adipose, 16 Fatty Acid), so the baby does not need Cholesterol for survival; the zero starting pool simply acts as a biochemical milestone the creature must reach before certain downstream behaviours unlock.

### Practical consequences for gameplay

- **Dietary fat leaves a cholesterol trail**: every Fat item a creature eats deposits Cholesterol in a 3 : 1 ratio with Triglyceride. A purely fat-fed creature will slowly build cholesterol and, over time, cross the two receptor thresholds that rewire its reaction rates.
- **Protein + starch feeding also raises cholesterol**: via reaction 4, surplus Amino Acid and Pyruvate are condensed into Cholesterol. This means a creature eating protein and starch in excess will eventually hit the same receptor thresholds even without touching a fatty food.
- **Cholesterol is a hidden starvation reserve**: when a creature runs out of protein intake, reaction 11 will liberate 1 AA + 4 Pyruvate per Cholesterol. This supplements the Adipose → Triglyceride → Fatty Acid → Pyruvate cascade with a small but direct amino-acid contribution, which is particularly useful because no other reaction in the standard genome produces Amino Acid endogenously.
- **Debugging / CAOS**: `CHEM 7 amount` injects Cholesterol directly, skipping both source reactions. This is the cleanest way to test the two receptor-driven behaviours (observe which reactions change rate as Cholesterol crosses the 16/255 and 25/255 thresholds). Writing chemical 10 (Fat) and letting reaction 3 run is the most faithful way to simulate a fatty meal's cholesterol contribution.

### Summary of the Cholesterol pipeline

```
     Dietary Fat (10)            Surplus metabolism
          │                           │
          │ reaction 3                │ reaction 4
          │  (HL 116, 3:1 with Trig)  │  (HL 116, AA + 4 Pyr → Chol)
          ▼                           ▼
          └────────────► Cholesterol (7) ◄────────────┐
                              │                        │
                              │ reaction 11            │
                              │  (HL 116, Chol →       │
                              │   AA + 4 Pyr)          │
                              ▼                        │
                    Amino Acid (13) + 4× Pyruvate (2)──┘

                      ┌─── Receptor 31 (REDUCE+DIGITAL, thr 6.3 %)
   Cholesterol read ──┤        → gates reaction rate OFF above threshold
                      └─── Receptor 43 (linear, thr 10 %)
                               → gates reaction rate ON above threshold
```

Cholesterol is therefore the **metabolic bridge between the fat branch and the amino-acid / pyruvate pool**: a non-decaying, zero-at-birth by-product of both dietary fat digestion and AA-Pyruvate condensation, which can be cleaved back into its components on demand and whose concentration doubles as a two-threshold regulatory signal for two other reactions in the body. It does no direct work — it burns nothing, signals no drive, emits nothing to the brain — but it is the chemistry's most elegant implementation of a reversible carbon-store that ties three otherwise-separate pools (dietary fat, dietary protein, dietary starch) together through a single shared buffer.
