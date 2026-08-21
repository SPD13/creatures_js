# 013 - Amino Acid

Amino Acid is the creature's **circulating protein currency** — the central, body-wide protein-branch metabolite that every other nitrogen-bearing chemical either produces or consumes. Where Protein (12) is the raw dietary input (food-side) and Muscle Tissue (11) is the long-term structural store (storage-side), Amino Acid sits between them as the freely-mobile intermediate in which the body actually "counts" its protein. It is simultaneously a building block (fed into muscle synthesis by reaction 5), an energy substrate (deaminated into Glucose + Ammonia by reaction 21, the creature's gluconeogenic pathway), a lipid-pathway feedstock (condensed with Pyruvate into Cholesterol by reaction 4), and a prostaglandin precursor (combined with Fatty Acid into Prostaglandin by reaction 101). Almost every major metabolic branch touches Amino Acid at some point, making it — together with Glucose (3), Pyruvate (2), Fatty Acid (6) and ATP (35) — one of the handful of **hub chemicals** that tie the entire biochemistry together.

Amino Acid has **no initial concentration at birth** (a newborn starts with zero in its bloodstream), **no organ emitter**, **no dietary stim**, and an effectively **infinite passive half-life** (≈9.07 × 10¹⁰ ticks, decay rate 1.0). Every molecule in the pool therefore came from one of six reactions, and every molecule that leaves the pool is consumed by one of four reactions — nothing evaporates, nothing seeps in from the world. The chemical is also **receptor-rich compared to its upstream neighbour**: where Protein (12) has no sensors at all, Amino Acid is watched by **four receptors** (three regulatory receptors clustered on the Reaction organ's Somatic tissue locus 0, plus one alarm receptor on the Creature organ's Circulatory tissue locus 2). This dense sensor placement reflects Amino Acid's role as the pool that actually carries long-term protein-satiety information — it is stable enough (no passive decay, Medium-speed consumers) that a receptor reading it produces a meaningful "how protein-replete is this creature right now" signal, whereas a reading of the ephemeral dietary Protein would just say "I recently ate".

Structurally, Amino Acid is the **protein-branch mirror of Glucose (3)** in the carbohydrate branch: both are the freely-circulating mid-tier chemical between a dietary input and a tissue store, both are produced by multiple reactions and consumed by multiple reactions, both have very long passive half-lives, both are deeply watched by receptors, and both can flow into either anabolic storage (Muscle Tissue / Glycogen / Adipose) or catabolic energy release (Pyruvate / ATP). The symmetry between the two branches is deliberate and runs through most of the biochemistry.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | — | — | Newborn endowment | **Amount 0 / concentration 0 %** — a newborn Norn has no Amino Acid in its blood; the pool only fills after its first meal (via reaction 1) or after the first tick of active muscle catabolism (reaction 13) |
| 2 | Dietary-protein digestion (reaction 1) | Gene 24, Baby onwards | Standard | `1× Protein [12] → 4× Amino Acid [13]` | Medium, half-life ~209 ticks (decay 0.99669) — the main "fed" inflow. Every carrot, piece of cheese, or other protein-bearing food agent that writes `STIM WRIT from 79 …` ultimately pulses four units of Amino Acid per swallowed unit of Protein into the bloodstream. See `012 - Protein.md` for the digestive-checkpoint mechanics |
| 3 | Active muscle catabolism (reaction 13) | Gene 44, Baby onwards | Standard | `1× Muscle Tissue [11] → 4× Amino Acid [13]` | Short, half-life ~47 ticks (decay 0.98549) — the "starvation unwinding" inflow. When nothing is being eaten and the Amino-Acid pool runs dry, reaction 13 tears down Muscle Tissue to keep the pool topped up. The 4 : 1 stoichiometry recovers exactly the four Amino Acids originally consumed to build each unit of muscle via reaction 5 |
| 4 | Latent catalysed catabolism (reaction 12) | Gene 48, Baby onwards | Standard | `1× Muscle Tissue [11] + 1× [121] → 4× Amino Acid [13]` | Medium, half-life ~116 ticks (decay 0.99402) — **dormant in the stock genome**: chemical 121 is an unnamed placeholder that no reaction, emitter, or food stim ever produces, so this pathway never fires. The slot appears to be reserved for a catalysed wasting mechanism (community genomes are free to repurpose chemical 121 to activate it) |
| 5 | Cholesterol breakdown (reaction 11) | Gene 60, Baby onwards | Standard | `1× Cholesterol [7] → 1× Amino Acid [13] + 4× Pyruvate [2]` | Medium, half-life ~116 ticks (decay 0.99402) — the reverse leg of the Amino-Acid ⇄ Cholesterol equilibrium (paired with reaction 4). When Cholesterol accumulates, this reaction unpacks it back into one Amino Acid plus four Pyruvate. The shared half-life (116) with reaction 4 ensures the pair behaves as a balanced buffer between the protein and fat branches |
| 6 | Prostaglandin breakdown (reaction 100) | Gene 99, Baby onwards | Standard | `2× Prostaglandin [94] → 1× Amino Acid [13] + 1× Fatty Acid [6]` | Short, half-life ~18 ticks (decay 0.96144) — the reverse leg of the Amino-Acid ⇄ Prostaglandin equilibrium (paired with reaction 101). Prostaglandin is a short-range signalling lipid used elsewhere in the genome; whatever pool builds up is recycled back into one Amino Acid plus one Fatty Acid at this fast rate, keeping Prostaglandin from lingering and re-contributing to the hub pools |

Amino Acid has **no organ-level emitter** — there is no tissue that spontaneously injects it into the bloodstream. Every source in the table above is an enzymatic reaction, not an emitter, which means the body can only raise its Amino Acid level by (a) digesting food, (b) actively breaking down muscle, or (c) draining one of the two equilibrium partners (Cholesterol, Prostaglandin) back into the hub.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Muscle synthesis (reaction 5) | Gene 55, Baby onwards | Standard | `1× Anabolic steroid [112] + 4× Amino Acid [13] → 1× Muscle Tissue [11]` | Medium, half-life ~621 ticks (decay 0.99888) — the anabolic pathway. Four Amino Acids are condensed into one Muscle Tissue unit in the presence of one Anabolic steroid (which is emitted by the `LOC_MUSCLES` emitter whenever the creature actively uses its muscles). This is the only way to build Muscle Tissue and the main "constructive" exit from the Amino-Acid pool |
| 2 | Gluconeogenesis / deamination (reaction 21) | Gene 45, Baby onwards | Standard | `2× Amino Acid [13] → 1× Glucose [3] + 1× Ammonia [26]` | Medium, half-life ~105 ticks (decay 0.99340) — the protein-to-carbohydrate bridge. Two Amino Acids are deaminated into one Glucose (feeding the energy economy) plus one Ammonia (the waste nitrogen, cleared by the kidneys via chemical 26's own disposal pathway). This is the body's mechanism for burning protein for calories when carbohydrate is scarce, and the only place in the genome where Ammonia is produced |
| 3 | Cholesterol synthesis (reaction 4) | Gene 59, Baby onwards | Standard | `1× Amino Acid [13] + 4× Pyruvate [2] → 1× Cholesterol [7]` | Medium, half-life ~116 ticks (decay 0.99402) — the forward leg of the Cholesterol equilibrium. When both Amino Acid and Pyruvate are in surplus, the body condenses them into Cholesterol (used elsewhere in lipid and steroid pathways). Paired with reaction 11 into a reversible buffer |
| 4 | Prostaglandin synthesis (reaction 101) | Gene 68, Baby onwards | Standard | `1× Amino Acid [13] + 1× Fatty Acid [6] → 2× Prostaglandin [94]` | Short, half-life ~21 ticks (decay 0.96825) — the forward leg of the Prostaglandin equilibrium. Combines one Amino Acid with one Fatty Acid into two Prostaglandin. Paired with reaction 100 into a reversible buffer |
| 5 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1.0) | Amino Acid does not decay on its own; the pool is only depleted when one of the four reactions above consumes it |
| 6 | Receptor 24 — Reaction-rate modulation (inverting analogue) | Gene 19, Baby onwards | Reaction / Somatic / Locus 0 | REDUCE (invert), threshold 71 (~28 %), nominal 225, gain 86 | Continuous inverted output: when Amino Acid is **below** ~28 % the receptor fires strongly (baseline 225/256), when it climbs above the receptor's output fades toward zero. Acts as a "low-AA" bias that feeds the Reaction organ's locus 0 — likely tuning reaction throughput when the amino-acid pool is scarce |
| 7 | Receptor 44 — Low-AA digital alarm | Gene 34, Baby onwards | Reaction / Somatic / Locus 0 | DIGITAL + REDUCE (all-or-nothing, inverted), threshold 13 (~5 %), nominal 203, gain 203 | Fires hard (203/256) whenever Amino Acid drops below ~5 % of its range, silent otherwise. The "protein pool critically low" alarm — tells the Reaction organ to compensate when protein reserves are near-exhausted |
| 8 | Receptor 61 — High-AA digital gate | Gene 35, Baby onwards | Reaction / Somatic / Locus 0 | DIGITAL (all-or-nothing, non-inverted), threshold 42 (~16 %), nominal 128, gain 107 | Fires (128/256) whenever Amino Acid is **above** ~16 %, silent otherwise. Paired with receptors 24 and 44 to form a three-band sensor on the same locus: well-fed (61 on), normal (24 partial), critical (44 on). All three outputs sum at Reaction/Somatic locus 0, giving the Reaction organ a piecewise readout of amino-acid status |
| 9 | Receptor 83 — Circulatory "low-AA" alarm | Gene 52, Baby onwards | Creature / Circulatory / Locus 2 | DIGITAL (all-or-nothing), threshold 16 (~6 %), nominal 0, gain 255 | Body-wide circulatory alarm: fires at full strength (255/256) whenever Amino Acid is above the low threshold, and is silent below. Feeds the Creature organ's Circulatory locus 2 — the same general tissue that houses the Adipose and Muscle-Tissue wasting alarms (receptors 85 and 86). In effect it is the Amino-Acid "the protein supply is flowing" signal, the complement of the muscle- and fat-wasting alarms |

Amino Acid has **no dedicated drive receptor** and **no brain receptor**. It does not directly couple to the "Hunger for protein" drive (149) — that drive is produced by a separate backup/decay cycle (reactions 43 and 66) rather than read off Amino Acid's concentration. Instead the protein-satiety story is indirect: a full Amino-Acid pool keeps reaction 21 (deamination) running and thereby topped up Glucose and depresses the carbohydrate-hunger drive, while a drained Amino-Acid pool triggers the reaction-organ alarms (receptors 24 / 44 / 83) which in turn bias the rest of the metabolic circuitry toward protein-conservation and (eventually) hunger-drive elevation.

## Role in Game Mechanics

### The central hub of the protein branch

Every creature's nitrogen economy flows through Amino Acid. The chemical is the confluence point for six distinct inflows and four distinct outflows, and by count alone it is one of the most heavily-connected chemicals in the entire genome (only Glucose, Pyruvate and ATP rival it). Its role can be summarised as a three-lane junction:

```
  ┌──────────────── dietary inflow ────────────────┐
  │                                                │
  Protein (12) ──R1──► Amino Acid (13) ──R5──► Muscle Tissue (11)  structural storage
                              ▲  │
           muscle wasting ────┘  └──R21──► Glucose (3) + Ammonia (26)  energy / waste
                (R13 / R12)           │
                                      ├──R4──► Cholesterol (7)          lipid branch
                                      │    ◄──R11── (reverse)
                                      │
                                      └──R101──► Prostaglandin (94)     signalling
                                             ◄──R100── (reverse)
```

The three "lanes" correspond to the three biological fates of amino acids in real biochemistry: structural protein synthesis (R5), catabolic oxidation for energy (R21), and sidechain conversions into other macromolecule classes (R4, R101). The stock genome wires all three, making Amino Acid the only chemical that can be simultaneously the anabolic feedstock, the catabolic substrate, and the bridge to the other two branches of metabolism.

### The Amino-Acid ⇄ Muscle-Tissue pump

The most important loop involving Amino Acid is the reversible pump between reactions 5 and 13 (and its dormant sibling, reaction 12):

| Direction | Reaction | Gene | Formula | HL | Gate |
|---|---|---|---|---|---|
| Build | 5 | 55 | 4 AA + 1 Anabolic steroid → 1 Muscle Tissue | 621 (Medium) | Requires Anabolic steroid from `LOC_MUSCLES` emitter |
| Unwind | 13 | 44 | 1 Muscle Tissue → 4 AA | 47 (Short) | None — runs continuously |
| Unwind (latent) | 12 | 48 | 1 Muscle Tissue + 1 [121] → 4 AA | 116 (Medium) | Requires chemical 121 (unused in stock genome) |

The key asymmetry is that **building muscle is slow and gated** (HL 621, requires exercise) while **burning muscle is fast and ungated** (HL 47, always on). This ratchet is what makes a sedentary, well-fed Norn never bulk up (the gate is closed) while a starving Norn rapidly dissolves its muscle into Amino Acid to survive (the ungated catabolism wins by default). The net effect: muscle mass integrates the history of "how much exercise minus how much starvation" the creature has experienced.

Because each conversion in each direction uses a 4 : 1 stoichiometry, a round-trip through the pump is chemical-neutral (4 AA → 1 Muscle → 4 AA), just like real-world protein turnover. What costs the body is the **Anabolic steroid** consumed on the build side — exercise is the only input that can keep the pump running in the anabolic direction.

### The Amino-Acid ⇄ Cholesterol equilibrium

Reactions 4 and 11 form a reversible bridge between the protein and lipid branches:

```
   AA (13) + 4 Pyruvate (2)  ───R4 (HL 116)───►  Cholesterol (7)
   AA (13) + 4 Pyruvate (2)  ◄──R11 (HL 116)──   Cholesterol (7)
```

Both reactions share the identical half-life (116 ticks, decay 0.99402), which means the system sits naturally at equilibrium — any surplus on one side of the equation pushes the reaction in the opposite direction, and the pool will settle into a steady-state ratio determined by the two chemicals' other sources and sinks. This is one of only a handful of **self-balancing buffers** in the entire genome (the others are the Amino-Acid ⇄ Prostaglandin buffer via R100/R101 and the Fatty-Acid ⇄ Glycerol-related buffers in the lipid branch). Its biological role is to let the creature trade Amino Acid for Cholesterol whenever the sex-hormone or cell-membrane pathways need the latter, and vice-versa when Cholesterol accumulates beyond the body's immediate use.

The inclusion of four Pyruvates on both sides of the equation couples the buffer to the **energy economy** as well: a shortage of Pyruvate (low ATP, aerobic collapse) slows both directions of the reaction, essentially locking the AA-Cholesterol pair in place until the cell's energy supply recovers. This is a subtle but elegant piece of design — it ensures that structural trade-offs between branches only happen when the creature has spare metabolic bandwidth to afford them.

### The Amino-Acid ⇄ Prostaglandin equilibrium

The second buffer (reactions 100 and 101) links Amino Acid to the signalling-lipid branch:

```
   AA (13) + 1 Fatty Acid (6)  ───R101 (HL 21)───►  2 Prostaglandin (94)
   AA (13) + 1 Fatty Acid (6)  ◄──R100 (HL 18)───   2 Prostaglandin (94)
```

These are both **Short**-speed reactions — far faster than the Cholesterol buffer — which makes the Prostaglandin pool highly reactive to changes in Amino Acid or Fatty Acid availability. Prostaglandin is itself a short-range, fast-acting signalling chemical used elsewhere in the genome for transient regulatory effects, so the fast turnover is consistent with its role. In practice the two reactions keep Prostaglandin from accumulating for more than a minute or so: any pulse rapidly dissipates back into its precursors, which is exactly the behaviour you want from a transient chemical messenger.

### The deamination exit to the carbohydrate branch

Reaction 21 is the only place in the creature's body where **protein is burned for carbohydrate calories**:

```
  2 × Amino Acid (13) ──R21 (HL 105, gene 45)──► 1 × Glucose (3) + 1 × Ammonia (26)
```

It is also the **only source of Ammonia (26)** in the genome. Ammonia is a nitrogenous waste product that then has to be cleared by the creature's kidney/elimination pathway, completing the metabolic story of "protein nitrogen comes in via food, leaves via urine" (the full Ammonia pipeline is documented under chemical 26). Reaction 21's Medium rate (HL 105) is comparable to the other mid-tier metabolic reactions — fast enough that a well-fed creature continuously deaminates some of its Amino Acid pool into Glucose, slow enough that it doesn't drain the pool in one burst.

Biologically this is the **protein-as-fallback-energy** mechanism: when carbohydrates run low (Glucose and Glycogen depleted) and fats are unavailable or slow-converting, the creature survives by deaminating amino acids. The cost is (a) loss of amino-acid pool depth (which in turn risks triggering muscle catabolism via the Amino-Acid ratchet), and (b) accumulation of Ammonia, which is mildly toxic if not cleared quickly enough.

### The three-band Reaction-organ readout

Amino Acid is watched by three receptors all pinned to the same locus (Reaction / Somatic / Locus 0), but each tuned to a different concentration band:

| Receptor | Threshold | Flags | Behaviour |
|---|---|---|---|
| 44 (gene 34) | ~5 % | DIGITAL + REDUCE | Fires hard when AA < 5 % — critical low alarm |
| 24 (gene 19) | ~28 % | REDUCE (analogue) | Smooth inverse ramp — fades out as AA climbs from 0 to ~28 % |
| 61 (gene 35) | ~16 % | DIGITAL | Fires when AA > 16 % — well-fed gate |

All three outputs sum at the same locus, giving the Reaction organ a **piecewise-linear readout of amino-acid status** that is flat-high when starving, tapered through the normal range, and flat-low when well-fed. This is a classical engineering pattern for producing a smooth control signal out of a handful of simple receptors — the Reaction organ then uses the combined signal to modulate the clock rates or biotick schedules of the reactions pinned at its somatic locus 0. In practice this means the body automatically speeds up certain reactions when amino-acid is scarce (emergency processing) and throttles them back when amino-acid is abundant (energy-conservation), without having to route through the brain.

### The Circulatory alarm receptor

Receptor 83 on Creature / Circulatory / Locus 2 is a separate, body-wide readout:

- **Threshold 16** (~6 % of range)
- **Nominal 0, gain 255** — maximum-strength output when it fires
- **Non-inverted DIGITAL** — so it fires **above** the threshold, silent below

It sits on the same tissue (Circulatory) that houses the low-Adipose alarm (receptor 85, locus 0) and the low-Muscle-Tissue alarm (receptor 86, locus 8). Because its polarity is inverted relative to those two alarms (this one fires when AA is **present**, they fire when their chemicals are **absent**), it acts as the "protein supply is flowing" complement: together the three receptors give the Creature organ a compact body-composition readout of the form `{adipose low?, muscle low?, AA flowing?}` at three different loci of one tissue. This is how the lowest-level systemic regulation distinguishes "fed and healthy" from "wasting emergency".

### Why Amino Acid has no drive receptor but Protein has no receptor at all

The "Hunger for protein" drive (chemical 149) is produced by a backup/decay cycle (chemical 132, reactions 43 / 66) rather than by a direct receptor on Amino Acid. At first glance this seems wasteful — why not just have a receptor on Amino Acid that drives the hunger chemical directly? The answer is that the backup/decay cycle produces a **smooth, time-integrating drive** that rises gradually as the backup pool fills and clears slowly as it empties. A direct receptor readout of Amino Acid would instead fluctuate wildly with every meal, making the hunger drive noisy and the Norn twitchy about eating.

This same logic explains why Protein has no receptor at all (a single meal's Protein pulse would be too transient to signal anything useful) while Amino Acid gets four receptors (the pool is stable enough, but only for non-drive signals — reaction-rate bias and systemic alarms, not the hunger drive itself). The hunger drive's own integration mechanism is architectural: the backup/decay pair is what gives the Norn its patient, food-seeking pacing rather than an instant gratification loop.

### Practical consequences for gameplay

- **Amino Acid is the "protein heartbeat" of the creature.** Its concentration tells you at a glance whether the creature has been fed recently, is digesting, or is deep into muscle-wasting territory. Inspecting it in the debug console via `CHEM TARG 13` is often more informative than looking at Protein or Muscle Tissue individually.
- **Feeding a creature raises Amino Acid indirectly.** Food items write Protein (via stim 79), reaction 1 cleaves that into Amino Acid over ~2 minutes, and the Amino-Acid pool then ripples through to muscle, glucose, cholesterol, and prostaglandin over longer time-scales. To raise Amino Acid directly for testing, use `CHEM 13 <amount>` (skips the digestive step).
- **Exercise is necessary to convert Amino Acid into Muscle Tissue.** Without firing the `LOC_MUSCLES` emitter (by having the creature actually walk, climb, push or carry things), the Anabolic steroid gate on reaction 5 stays closed. A well-fed sedentary Norn will simply deaminate its excess Amino Acid into Glucose and Ammonia (reaction 21) rather than building muscle.
- **A starving creature eats its own muscle.** When Amino Acid drops below the receptor thresholds, reaction 13 rapidly tears Muscle Tissue back into Amino Acid (HL 47) to keep the pool topped up. You can see this in the debug console as a falling Muscle-Tissue trace paired with a stable (or slowly rising) Amino-Acid trace, while the `Muscle low` alarm (receptor 86 on Circulatory locus 8) begins to fire once muscle drops below ~10 %.
- **The carbohydrate and protein branches are linked through deamination.** A protein-only diet will still produce Glucose via reaction 21, albeit with the side-effect of Ammonia accumulation. A very long-running protein-only Norn may eventually show Ammonia-related symptoms (see chemical 26). Conversely a carbohydrate-only diet will eventually run down the Amino-Acid pool, trigger muscle wasting, and fire the Muscle-low alarm — the classic "calorie-replete but protein-starved" state.
- **`CHEM 13` is a clean injection for amino-acid-driven effects.** Because Amino Acid has no emitter and the pool is consumed by four distinct reactions, injecting into it lets you observe the downstream effects on each branch independently. Combine with `CHEM 112 <amount>` (Anabolic steroid) to drive reaction 5 in isolation; combine with a suppressed glucose pool to watch reaction 21 ramp up; compare the rate at which the injected Amino Acid flows into Cholesterol vs Muscle Tissue vs Glucose to see the reaction-rate hierarchy in action.
- **Ammonia tracking.** Because reaction 21 is the only Ammonia source, any Ammonia you see in a creature's bloodstream is a direct signature of protein-branch activity (either deamination of a recent meal or starvation-catabolism). Ammonia is therefore a useful forensic indicator when debugging metabolic imbalance.

### Summary of the Amino-Acid hub

```
                         ┌── R1 (from Protein, dietary)
                         │
                         ├── R13 (from Muscle, ungated catabolism)
                         │
       sources ──────────┼── R12 (from Muscle + chem 121, dormant)
                         │
                         ├── R11 (from Cholesterol, reverse buffer)
                         │
                         └── R100 (from Prostaglandin, reverse buffer)
                         │
                         ▼
                 Amino Acid (13)
                 • no emitter
                 • no decay
                 • 4 receptors
                         │
                         ├── R5  → Muscle Tissue      (+Anabolic steroid gate)
                         │
                         ├── R21 → Glucose + Ammonia  (deamination / gluconeogenesis)
         sinks ──────────┤
                         ├── R4  → Cholesterol         (+4 Pyruvate, forward buffer)
                         │
                         └── R101 → 2 Prostaglandin    (+1 Fatty Acid, forward buffer)
```

Amino Acid is therefore the **circulating-currency tier** of the creature's nitrogen economy: empty at birth, filled by food (R1) and by the body's own muscle (R13), read by three regulatory receptors at the Reaction organ plus one systemic alarm at the Creature organ, and spent on either structural protein (R5), caloric energy (R21) or lipid-pathway bridging (R4, R101). Almost every interesting story in the protein branch — feeding, exercise, muscle wasting, starvation, recovery, ageing — can be told by reading the shape of its trace in the debug console over time.
