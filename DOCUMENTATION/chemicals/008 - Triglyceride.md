# 008 - Triglyceride

Triglyceride is the creature's **mid-density fat-storage intermediate** — the chemical that sits between the free, actively burnable Fatty Acid pool (chemical 6) and the long-term, highly compressed Adipose Tissue reserve (chemical 9). Biologically it mirrors the real-world role of triglycerides in vertebrates: three fatty-acid chains packed into a single storage molecule that can be built up when the creature is well-fed, shuttled into body-fat for the long haul, or broken back down into free fatty acids the moment the body needs to mobilise energy. In the Creatures 3 biochemistry it is chemical **8**, born with a small starting concentration (16 / ≈6.3 %), non-decaying, and entirely regulated by the surrounding reactions and by three reaction-rate receptors that use its concentration as a regulatory signal for carbohydrate-hunger, fat-hunger and protein digestion.

Unlike Fatty Acid — which is both a substrate and a reactive fuel — Triglyceride is a **pure storage buffer**. It has no direct burn reaction (you cannot β-oxidise a Triglyceride; you must first cleave it into three Fatty Acids), no drive or brain receptor, and no emitter: every molecule in the body is produced by one of the two synthesis reactions (dietary-fat digestion or Fatty-Acid condensation) and every molecule leaves via one of the two consumer reactions (Adipose condensation or lipolysis). This narrow, well-defined position makes Triglyceride the **single load-balancing node** between incoming dietary fat, intra-body fatty-acid flux, and long-term Adipose storage.

Where Fatty Acid is "fat ready to burn", Triglyceride is "fat in transit" — the holding pattern between the creature's three fat pools (dietary Fat → Triglyceride → Fatty Acid / Adipose). It is also the creature's principal **satiety-signal carrier on the fat side**: the three receptors that read its concentration couple fat-store level to hunger regulation and protein digestion, giving the genome a body-composition-aware way to modulate the creature's appetites without ever involving the brain.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | Gene 10, Baby onwards | Systemic | Newborn endowment | Amount 16 / concentration 0.0627 (≈6.27 %) at birth |
| 2 | Dietary-fat digestion (reaction 3) | Gene 25, Baby onwards | Standard | `1× Fat [10] → 3× Triglyceride [8] + 1× Cholesterol [7]` | Medium, half-life ~116 ticks (decay 0.99402) — each ingested unit of Fat yields three Triglycerides plus one Cholesterol, the main route by which food becomes body-fat |
| 3 | Fatty-Acid condensation (reaction 9) | Gene 30, Baby onwards | Standard | `3× Fatty Acid [6] → 1× Triglyceride [8]` | Medium, half-life ~621 ticks (decay 0.99888) — packs three free Fatty Acids back into one Triglyceride molecule for re-storage after burning has slowed |
| 4 | Adipose mobilisation (reaction 16) | Gene 28, Baby onwards | Standard | `1× Adipose Tissue [9] → 8× Triglyceride [8]` | Short, half-life ~47 ticks (decay 0.98549) — unpacks one unit of Adipose into eight Triglycerides when body-fat is being tapped for energy |

There is **no organ emitter** that produces Triglyceride directly and **no dietary stim** that writes it as a raw input — everything reaches the Triglyceride pool either at birth, from digested dietary Fat, from re-condensed free Fatty Acids, or from unpacked Adipose Tissue. Notably, the dietary pathway (reaction 3) is the only source that also co-produces Cholesterol (7); the other two sources are lipid-internal and produce Triglyceride alone.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Adipose synthesis (reaction 10) | Gene 27, Baby onwards | Standard | `8× Triglyceride [8] → 1× Adipose Tissue [9]` | Medium, half-life ~621 ticks — condenses eight Triglycerides into one unit of Adipose Tissue for long-term storage; the heavy 8 : 1 stoichiometry makes Adipose loading deliberately slow and expensive |
| 2 | Lipolysis (reaction 15) | Gene 29, Baby onwards | Standard | `1× Triglyceride [8] → 3× Fatty Acid [6]` | Short, half-life ~47 ticks — cleaves one Triglyceride into three free Fatty Acids, the only route by which body-fat re-enters the burnable Fatty Acid pool |
| 3 | Carbohydrate-hunger-shuffle feedback (receptor 26) | Gene 21, Baby onwards | Reaction organ, Somatic tissue, locus 0 | REDUCE (inverted), threshold 16, nominal 225, gain 26 | Modulates reaction 57 (`Hunger for carbohydrate → Hunger for carb backup`): when Triglyceride rises above ≈6.3 %, the inverted output is low, slowing the hunger-shuffle so carb-hunger accumulates; when Triglyceride is low, the shuffle runs faster, letting carb-hunger drain into its backup |
| 4 | Fat-hunger-shuffle feedback (receptor 38) | Gene 22, Baby onwards | Reaction organ, Somatic tissue, locus 0 | DIGITAL (all-or-nothing), threshold 26, nominal 191, gain 153 | Modulates reaction 58 (`Hunger for fat → Hunger for fat backup`): when Triglyceride rises above ≈10 %, the hunger-shuffle runs at the higher gain 153 — a well-fed body drains fat-hunger into its backup faster, i.e. the creature signals "I'm full of fat" more quickly |
| 5 | Protein-digestion feedback (receptor 48) | Gene 24, Baby onwards | Reaction organ, Somatic tissue, locus 0 | REDUCE (inverted), threshold 25, nominal 221, gain 204 | Modulates reaction 1 (`Protein → Amino Acid`): when Triglyceride is high the inverted output is low, slowing protein digestion; when Triglyceride is low, digestion runs at full rate — a well-fed fat body digests protein more slowly, a starving body breaks protein down faster |
| 6 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1.0) | Triglyceride does not decay naturally; any unused molecules remain until a reaction consumes them |

Triglyceride has **no drive receptors, no brain receptors, and no muscle/neuron targets** — like Fatty Acid it never acts directly on behaviour. Its influence is delivered entirely via the four reactions that consume or produce it and the three receptors (26, 38, 48) that let its concentration steer hunger-regulation and protein digestion.

## Role in Game Mechanics

### Position in the fat pipeline

The fat branch of the biochemistry is a three-level storage hierarchy — from most-compressed (longest-term) to most-reactive (most-burnable):

```
        Adipose Tissue (9) ◄─────────┐   long-term reserve (8:1 compression)
              ▲                      │
              │ reaction 10          │ reaction 16
              │ (HL 621, build)      │ (HL 47, mobilise)
              │                      ▼
        Triglyceride (8) ◄──────┐    Triglyceride (8)   mid-term storage (3:1 compression)
              ▲                 │
              │ reaction 9      │ reaction 15
              │ (HL 621, build) │ (HL 47, mobilise)
              │                 ▼
        Fatty Acid (6)            Fatty Acid (6)        free / burnable
```

Triglyceride is the **exact middle tier** of this hierarchy, both in compression factor (3 : 1 vs. 8 : 1) and in reaction speed (medium synthesis, short mobilisation). Every molecule of fat in the body — whether it came from dietary Fat or from lipogenesis — must pass through Triglyceride at least once on its way to long-term storage, and must pass through it again on its way back out.

This "bottleneck" design has two important consequences for gameplay:

1. **Dietary fat never reaches the burnable pool directly.** Reaction 3 converts Fat (10) into Triglyceride, not Fatty Acid. The creature must then run reaction 15 (lipolysis) to unlock the Fatty Acid it can actually burn. This introduces a ~163-tick digestion delay (half-life 116 + half-life 47) between eating a fatty food and gaining usable ATP from it — exactly the kind of "slow release" behaviour you'd expect from real fat digestion.
2. **Adipose is a buffered reserve, not an active fuel.** Because Adipose must first be split into 8 Triglycerides (reaction 16) before those can be split into Fatty Acids (reaction 15), the creature cannot "flash-burn" body fat — it has to unpack two layers of storage first. This protects the body from losing its entire fat reserve in a single burst of high demand.

### Dietary fat digestion and the 3 : 1 : 1 yield

Reaction 3 (`1× Fat → 3× Triglyceride + 1× Cholesterol`) is the creature's only digestive route for chemical 10 (Fat). The 3 : 1 stoichiometry on Triglyceride is deliberate — it encodes the fact that a real dietary triglyceride *is* three fatty-acid chains. Each unit of ingested Fat therefore eventually releases:

```
1 Fat → 3 Triglyceride → 9 Fatty Acid  (if all of it is lipolysed)
1 Fat → 3 Triglyceride → 3/8 Adipose   (if all of it is stored long-term)
```

The accompanying Cholesterol (7) is a side-product that goes into its own much smaller pool (cholesterol is consumed very slowly and its concentration therefore tracks cumulative dietary-fat intake — a built-in "you've been eating fat for a while" signal).

Reaction 3's medium speed (HL ~116) is much faster than the downstream lipolysis reaction (HL ~47 is actually faster, but compounds after it). In practice this means the creature's Triglyceride pool spikes rapidly after a fatty meal and then slowly drains into either Adipose (slow) or Fatty Acid (fast) depending on demand.

### Lipogenesis re-storage: reaction 9

Reaction 9 (`3× Fatty Acid → 1× Triglyceride`) is the body's mechanism for *re-packaging* free Fatty Acids back into Triglyceride when the β-oxidation pathway is saturated or when the creature has burned enough and now has surplus FA in circulation. Its half-life (~621 ticks) is identical to reactions 7 (Pyruvate → FA) and 10 (Triglyceride → Adipose), forming a tightly coupled "slow build-up" triad that collectively implements the creature's **fat-deposition cycle**:

```
8 Pyruvate + 6 ATP ──(r7, HL 621)──► 1 Fatty Acid
3 Fatty Acid       ──(r9, HL 621)──► 1 Triglyceride
8 Triglyceride     ──(r10, HL 621)──► 1 Adipose Tissue
```

Each step in this chain is slow and expensive, which is why creatures in Creatures 3 do not become obese from single meals — they have to be consistently overfed for many thousands of ticks before Adipose fills up significantly. The Triglyceride pool buffers the middle of this chain: it absorbs surplus Fatty Acid and releases it to Adipose at a matched rate, acting as a shock absorber that smooths out the carbohydrate-to-body-fat conversion curve.

### Lipolysis: reaction 15 and the starvation cascade

Reaction 15 (`1× Triglyceride → 3× Fatty Acid`) is the direct inverse of reaction 9, but running much faster (HL ~47 vs. ~621 — about 13× quicker). Combined with the matching reaction 16 (`Adipose → 8 Triglyceride`, also HL ~47), this gives the body a rapid starvation-response cascade:

```
  1 Adipose ──(r16, HL 47)──► 8 Triglyceride ──(r15, HL 47)──► 24 Fatty Acid
                                                          │
                                              (r17, HL 52) │
                                                          ▼
                                         192 Pyruvate + 144 ATP
```

The full mobilisation from one unit of Adipose to burnable ATP involves three sequential fast reactions (HL ≈ 47, 47, 52) plus the ATP-producing β-oxidation — a total effective half-life of roughly 150 ticks. A starving creature can therefore unlock the equivalent of ~192 Pyruvate / ~144 ATP per unit of Adipose in a couple of minutes of real time, which is enough to keep the organism alive through extended food droughts.

The asymmetry between the build-up chain (all HL ≈ 621) and the mobilisation chain (all HL ≈ 47) gives the fat system its characteristic **ratchet**: fat is cheap to burn, expensive to lay down. This is exactly why creatures lose weight faster than they gain it, and why a neglected population will slim down quickly while a coddled one will only slowly plump up.

### Satiety signalling: the three Triglyceride receptors

Triglyceride is the **busiest regulatory chemical** in the fat branch, carrying three separate reaction-rate receptors that use its concentration to modulate other reactions. Each receptor targets a reaction controlled by a different gene — the receptor's `geneId` matches the target reaction's `geneId`. Together they form a simple but elegant body-composition feedback system:

#### Receptor 26 — carbohydrate-hunger shuffle

- **Target**: reaction 57 (`Hunger for carbohydrate [150] → Hunger for carb backup [133]`)
- **Class**: REDUCE (inverted), threshold 16, nominal 225, gain 26
- **Behaviour**: when Triglyceride rises above ≈6.3 %, the inverted output drops low, slowing the hunger-shuffle so that `Hunger for carbohydrate` accumulates instead of draining into its backup. When Triglyceride is low (depleted fat stores), the shuffle runs faster, draining carb-hunger into the backup pool.

In effect: **when the creature has fat stores, carb-hunger can build up** (the brain can register "I want sugar"); **when the creature is fat-depleted, carb-hunger is drained off** (the body doesn't bother asking for sugar — it asks for fat instead). This cross-wires the fat reserve to the carbohydrate appetite in a subtle but important way.

#### Receptor 38 — fat-hunger shuffle

- **Target**: reaction 58 (`Hunger for fat [151] → Hunger for fat backup [134]`)
- **Class**: DIGITAL (all-or-nothing), threshold 26, nominal 191, gain 153
- **Behaviour**: above ≈10 % Triglyceride the hunger-shuffle is clamped to the higher gain 153, aggressively draining `Hunger for fat` into its backup. Below the threshold the shuffle runs at its default weak rate.

In effect: **a well-fed fat body signals "I'm full of fat" more strongly** — fat-hunger decays quickly when fat stores are ample, preventing the creature from over-eating fatty foods when it already has plenty in storage. This is the biochemistry's built-in satiety brake on fat appetite and the natural partner to receptor 47 (on Fatty Acid), which brakes fat digestion.

#### Receptor 48 — protein digestion

- **Target**: reaction 1 (`Protein [12] → Amino Acid [13]`)
- **Class**: REDUCE (inverted), threshold 25, nominal 221, gain 204
- **Behaviour**: when Triglyceride is high, the inverted output is low, slowing protein digestion. When Triglyceride is low, protein digestion runs at full rate.

In effect: **a starving creature digests protein faster** (breaking down more amino acids, which can then be fed into the Prostaglandin cycle and eventually into gluconeogenesis / muscle-tissue sparing logic), while **a well-fed creature digests protein more leisurely** (preserving muscle tissue, not flooding the body with amino acids it doesn't need). This is a classic real-biology behaviour: the body prioritises protein breakdown when carbohydrate and fat reserves are low.

#### The combined effect

```
Triglyceride high  ──► receptor 26: carb-hunger accumulates
                   ──► receptor 38: fat-hunger drained aggressively ("I'm full of fat")
                   ──► receptor 48: protein digestion slow

Triglyceride low   ──► receptor 26: carb-hunger drained ("don't ask for sugar")
                   ──► receptor 38: fat-hunger builds up ("I need fat!")
                   ──► receptor 48: protein digestion fast
```

Triglyceride concentration thus behaves as a **composite body-fat gauge** that the biochemistry uses to re-bias both the creature's appetites and its nutrient-processing priorities. When fat stores are high, the creature wants sugar (not more fat) and spares its protein; when stores are low, it wants fat, ignores sugar, and aggressively breaks protein down.

### Why Triglyceride is born at 6.3 %

The newborn Triglyceride concentration (16 / 0.0627) is identical to the newborn Fatty Acid concentration. This matters because the fat hierarchy only functions if there is seed material in every tier — if Triglyceride started at zero, a newborn creature could not immediately run reaction 15 to liberate Fatty Acid, and the initial 16 units of FA would drain away before the digestive system had any time to produce new Triglyceride from food. By starting both pools at 6.3 %, the genome ensures that:

- The creature has immediately available burnable fat (Fatty Acid).
- The creature has immediately available **reserve** fat (Triglyceride).
- The creature has a substantial long-term reserve (Adipose at 70 units, ≈27 %) that will unpack into even more Triglyceride over the first several thousand ticks of life.

Together these three pools give a newborn roughly 10–15 minutes of ATP autonomy before any external food must be provided, which is critical in a game where eggs can hatch far from the nearest dispenser.

### Why Triglyceride doesn't decay

Like every core metabolite (Glucose, Glycogen, Starch, Pyruvate, Fatty Acid, Adipose, Cholesterol) Triglyceride's passive half-life is effectively infinite (9.07 × 10¹⁰ ticks, decay 1.0). If it decayed naturally, body-fat would slowly leak out of the system whenever the creature was resting — the opposite of what fat storage is *for*. Instead, Triglyceride is non-decaying and only leaves the pool via reaction 10 (to Adipose) or reaction 15 (to Fatty Acid).

### Practical consequences for gameplay

- **Weight-gain lag**: the 3-step chain from dietary Fat through Triglyceride to Adipose (HL ≈ 116 + HL ≈ 621) means it takes many thousands of ticks of sustained overfeeding for a creature's Adipose pool to visibly rise. Triglyceride will spike first and may hover at elevated levels for a long time before condensing into Adipose.
- **Starvation visibility**: a starving creature shows declining Adipose first, then Triglyceride, then Fatty Acid in roughly 47 : 47 : 52-tick rolling steps. Observing Triglyceride in CAOS (`chem TARG 8`) is a good mid-term indicator of whether the creature is pulling on its fat reserve.
- **Hunger coupling**: the three receptors (26, 38, 48) mean that a fat creature will naturally lean its appetite towards carbohydrate and a lean creature towards fat. Breeders can observe this by watching carb-vs-fat hunger drives over long timescales.
- **Debugging / CAOS injection**: calling `CHEM 8 amount` directly injects Triglyceride without going through the Fat → Triglyceride digestion cascade. This is useful for testing the lipolysis + β-oxidation pipeline or for benchmarking receptor 38/48 thresholds.
- **Cholesterol pairing**: because reaction 3 is the only dietary source of both Triglyceride and Cholesterol, the ratio of the two pools over time reveals how much of a creature's Triglyceride is dietary vs. internally synthesised. High Cholesterol relative to Triglyceride = well-fed on real food; low Cholesterol with moderate Triglyceride = mostly internal lipogenesis or Adipose mobilisation.

### Summary of the Triglyceride pipeline

```
  Dietary Fat (stim 78 → chem 10)
           │
           │  reaction 3 (HL 116)
           ▼
    ┌─► Triglyceride (8) ◄──── reaction 9 ──── 3× Fatty Acid (6)
    │       │
    │       │ reaction 10 (HL 621)
    │       ▼
    │   Adipose Tissue (9)
    │       │
    │       │ reaction 16 (HL 47)
    │       ▼
    │   8× Triglyceride ──┐
    │                     │
    └─────────────────────┤
                          │
                          │ reaction 15 (HL 47)
                          ▼
                     3× Fatty Acid (6)
                          │
                          │ (feeds β-oxidation, prostaglandin, re-storage)
                          ▼
                     Pyruvate / ATP / Prostaglandin

  Regulatory outputs (three reaction-rate receptors on locus 0):
      receptor 26 → reaction 57 (carb-hunger shuffle)        [REDUCE]
      receptor 38 → reaction 58 (fat-hunger shuffle)         [DIGITAL]
      receptor 48 → reaction 1  (Protein → Amino Acid)       [REDUCE]
```

Triglyceride is therefore the **central load-balancing node of the fat branch** — the chemical through which every gram of body-fat passes at least twice (once on the way in, once on the way out), and the single concentration that the biochemistry uses to gauge overall fat-store level for hunger and protein-digestion regulation. Its mid-tier position, mid-tier compression ratio, and mid-tier reaction speeds make it the natural "buffer" between the fast, reactive Fatty Acid pool and the slow, compressed Adipose reserve, giving the creature a smooth, biologically realistic three-tier fat-storage system.
