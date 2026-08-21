# 151 - Hunger for fat

Hunger for fat is the **active, brain-visible half** of the drive pair for fatty-food nutrition in Creatures 3. It is the third of the sixteen "drive" chemicals in the 148–161 block (the bank of acute drive signals the decision-lobe reads every tick) and is paired one-to-one with its long-lived reservoir partner, **Hunger for fat backup (134)**. Where the backup carries the slow-moving, minute-scale "memory" of how long the creature has gone without fatty food, chemical 151 is the fast-moving *felt* value: the number the Norn's brain actually consults when deciding whether to walk to the cheese, bite into a greasy pie, or ignore fatty food entirely. It is the signal that drives the Creature Companion's "Hunger for Fat" bar, and — once the creature reaches Youth — it is the threshold-gated trigger for the Circulatory system's critical-hunger alarm at locus 7.

Unlike metabolite chemicals (Fat [10], Fatty Acid [6], Triglyceride [8], Adipose Tissue [9], Cholesterol [7]), Hunger for fat is **not a nutrient**. It is a pure signalling chemical: its concentration represents how much the creature "wants" fat, not how much fat the creature has. The stock Norn genome produces chemical 151 continuously from a single constant sensorimotor emitter (the "metabolic clock") and then siphons most of its instantaneous mass into the long-term reservoir at chemical 134 via **two identical drive-to-backup reactions** (genes 22 and 64). This doubled drain matches the carb-hunger pattern (and not the protein-hunger pattern), making the fat drive's active side roughly twice as heavily buffered as protein's — the fat bar physically cannot rise as steeply as the protein bar for the same input.

Hunger for fat has a **"Very long"** half-life (≈ 9·10¹⁰ ticks, genome byte 255 — effectively permanent on its own), so like every drive in the 148–161 range its mass is conserved until it is explicitly consumed. The three consumers are: the twin self-refill reactions (58 and 68) that pull it into backup 134, external `CHEM 151 <−n>` calls fired by food-eating scripts, and the natural budget the Drives-tissue receptor applies when the brain reads the value. Its newborn concentration is **33/255 ≈ 12.94 %** — identical to Hunger for protein and markedly higher than Hunger for carbohydrate's 5.1 % — so every Norn hatches mildly fat-hungry from the first tick.

Distinguishing features versus the other macronutrient hungers (protein 149, carbohydrate 150):

- **No positive-feedback circulatory emitter.** The stock genome wires no locus-keyed "low blood fat → more hunger" emitter onto chemical 151. Fat hunger is driven purely by the constant sensorimotor clock — it cannot accelerate on its own when the creature's metabolic state deteriorates. In this it matches carb hunger, and contrasts with protein hunger's aggressive emitter #11.
- **No pain cross-coupling.** Unlike protein's reaction 56 (`Pain → Hunger for protein backup`), there is no `Pain → Hunger for fat backup` or `Pain → Hunger for fat` reaction. A slapped Norn never develops fat hunger as a consequence of the injury.
- **Slightly reduced Drives-receptor gain.** The decision-lobe receptor for fat hunger has gain **205** — lower than protein's 209 and well below carb's 255. The fat bar at full range translates into ≈ 80 % excitation on the drive neuron, making fat hunger the most *attenuated* of the three macronutrient drives in terms of behavioural weight.
- **Doubled drive-to-backup siphon.** Two genes (22 and 64) both encode the identical `Hunger for fat [151] → Hunger for fat backup [134]` 6-tick reaction. Running in parallel they drain ≈ 20.8 % of the active drive per tick — nearly twice the 11 % per-tick loss seen in the protein pair, and matching the carb pair's doubled siphon.
- **Critical-hunger alarm is a youth-only faculty.** Unlike the Drives receptor (Baby from hatching), the Circulatory locus-7 alarm receptor only switches on at life-stage 3 (Youth). Baby Norns have no hard "starvation-risk" signal for fat — only the analogue drive bar.

## Sources

Hunger for fat has two endogenous inflows and two external inflows. The constant sensorimotor emitter is the sole internal producer — there is no positive-feedback path and no cross-coupling from another drive.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Constant sensorimotor emitter (the "metabolic clock") | Gene 29 (emitter id 3) | Organ #1 "Creature" → Sensorimotor (tissue 4) → locus 0 `LOC_CONST` | Always on from Baby life-stage. Writes chemical 151 every tick | Rate byte **30**, gain **2**, threshold 0. At full gain this is ≈ 60 drive-units per tick — identical to the protein emitter and slightly below the carb emitter's 70 |
| 2 | Backup → drive release | Gene 10 (reaction id 45) | Organ #2 "Reaction" | `1× Hunger for fat backup [134] → 1× Hunger for fat [151]` | Half-life **311 ticks** (≈ 10 s at 30 Hz), "Medium" speed. The reservoir steadily drip-feeds the active drive — this is what makes fat hunger return a few seconds after a fatty meal |
| 3 | External CAOS injection | — | Any | `CHEM 151 <n>` on a targeted creature from scripts, bootstrap agents, or the debug console | One-shot. Because the chemical is "Very long" half-life, injected mass persists until the doubled siphon drains it to the backup or food scripts consume it |
| 4 | Initial concentration at birth | Gene 15 (initialConcentrations id 7) | Bloodstream | Every Norn hatches at **amount 33 / 255 ≈ 12.94 %** of Hunger for fat | One-time, applied at Baby life-stage. Matches protein hunger's starting value |
| 5 | No positive-feedback metabolic emitter | — | — | Unlike the protein pair (emitter #11 on circulatory locus 8, threshold 128, digital), **there is no locus-keyed emitter** targeting chemical 151. Fat hunger therefore does not accelerate when blood-fat metabolite levels are low — only the sensorimotor clock drives it | — |
| 6 | No cross-coupling from pain or another drive | — | — | The reaction table contains no pain-spillover or drive-cross-coupling entry for 151 or 134. Fat hunger is wholly internal to its own pair | — |
| 7 | Modded inflows | User-added | User-added | Custom emitters keyed to a "low-fat" circulatory locus, a smell-8-triggered lobe (CA smell 8 (fat) exists at chemical 173 for environmental fat scents), or ingestion-triggered scripts | Gene-dependent |

## Usage

Hunger for fat has four consumers: two receptors that read it (but do not destroy it — receptors are sensors), **two duplicate reactions** that convert it to backup, and the implicit "consumption" by food scripts via negative `CHEM` calls.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | **Decision-lobe drive bar** | Gene 47 (receptor id 4) | Organ #1 "Creature" → Drives (tissue 5) → locus 3 "Hunger for fat" | Analogue, threshold **0**, nominal 0, **gain 205**. Reads chemical 151 from Baby | The value the brain's decision lobe consults when choosing which drive-related action to vote for. With gain 205/255, the full active drive maps to ≈ 80 % excitation on the drive neuron — slightly more attenuated than protein's 82 % and noticeably less than carb's linear 100 %. **This is the signal shown on the Creature Companion's "Hunger for Fat" bar** |
| 2 | **Critical-hunger digital alarm** (Youth+ only) | Gene 43 (receptor id 160) | Organ #1 "Creature" → Circulatory (tissue 1) → locus 7 | **DIGITAL (all-or-nothing)**, threshold **214**, gain **255**. Reads chemical 151 from **Youth (age 3)** onward | Fires a hard on/off signal at circulatory locus 7 when fat hunger exceeds ≈ 83 % of full range. Unlike the Drives receptor (always on), this receptor does not activate until the creature reaches Youth — Baby Norns cannot trigger the fat-starvation alarm |
| 3 | Active → backup siphon (primary) | Gene 22 (reaction id 58) | Organ #2 "Reaction" | `1× Hunger for fat [151] → 1× Hunger for fat backup [134]` | Half-life **6 ticks** (≈ 0.2 s), "Very short". Aggressively drains the active drive into the reservoir |
| 4 | Active → backup siphon (duplicate) | Gene 64 (reaction id 68) | Organ #2 "Reaction" | `1× Hunger for fat [151] → 1× Hunger for fat backup [134]` (identical formula and rate) | Half-life **6 ticks**. Exact duplicate of gene 22. Runs in parallel every tick, doubling the effective drain rate. Per-tick active-drive loss to backup becomes `1 − 0.88978² ≈ 0.2083` — nearly twice the `0.1102` per-tick loss seen in the protein pair |
| 5 | Food-script consumption | — | Any food-agent script | `CHEM 151 <negative n>` called at the end of an eating/drinking animation for fatty items (cheese, pies, fatty meats) | The canonical way food agents "reduce fat hunger". With no spontaneous decay, this is the only way food can lower active fat hunger apart from reactions 58 & 68's backup pull |
| 6 | Debug / care-script consumption | — | CAOS console or tending scripts | `CHEM 151 -255` (full drain) or `CHEM 151 -n` | Common operator action to relieve a fat-starving Norn. To fully reset fat hunger the backup must also be drained with `CHEM 134 -255`; otherwise reaction 45 will repopulate 151 within minutes |

## Role in Game Mechanics

### The drive/backup architecture, from the active side

Every drive in Creatures 3 is a pair: a short-responsive **drive chemical** (148–161) that the brain reads directly, and a long-lived **backup chemical** (131–146) that the drive continuously exchanges with. For fat hunger:

```
         (sensorimotor LOC_CONST emitter, rate 30 × gain 2 per tick — constant)
                                  │
                                  ▼
     [134] Hunger for fat backup  ◀─── reactions 58 & 68 (6-tick half-life, ×2 parallel) ─── [151] Hunger for fat
              │                                                                                        ▲
              └─── reaction 45 (10 s half-life) ──────────────────────────────────────────────────────┘
                                                                                                       │
                                                                                                       ├──▶ Drives tissue locus 3 (gain 205, Baby+) — decision-lobe drive bar
                                                                                                       └──▶ Circulatory locus 7 (thresh 214, digital, Youth+) — critical alarm
```

Compared with the protein pair, three features are missing from this diagram: the low-blood-protein-style positive-feedback emitter, the pain cross-coupling into the backup, and the Baby-accessible critical alarm. What fat hunger gains in exchange — matching the carb pair — is a **doubled** drive-to-backup siphon, making its chemistry the second-most "reservoir-dominated" drive in the stock genome after carb hunger.

Among the three macronutrient drives (protein 149, carb 150, fat 151), fat sits in the middle on most metrics: its starting concentration matches protein, its doubled siphon matches carb, but its Drives-receptor gain (205) is the lowest of the three. Behaviourally this produces a creature that is mildly fat-hungry from birth, recovers quickly after eating (doubled siphon), and votes for fat-seeking actions slightly more weakly than for protein-seeking or carb-seeking actions at the same drive level.

### What the Norn "feels"

The **Drives receptor #4** (tissue 5, locus 3, gain 205) is the direct wiring from chemical 151's value into the brain. The decision lobe treats its input as a candidate action urge: each of the 16 drive neurons votes for the action-selection algorithm, and the winning vote dictates the creature's current goal. Because the fat-hunger receptor has gain 205 — the lowest of the three macronutrient drives — the drive neuron's excitation is slightly compressed relative to the raw chemical reading: a drive value of 255 produces 205/255 ≈ 80 % neuronal excitation rather than the full 100 %.

The practical consequence is that a Norn whose protein, carb, and fat drives are *all* at 50 % of full will vote most strongly for carb-seeking (gain 255 → 50 % excitation), next for protein-seeking (gain 209 → 41 % excitation), and weakest for fat-seeking (gain 205 → 40 % excitation). The three are close enough that behavioural noise and environmental cues dominate tie-breaking, but over many decisions the Norn will, all else equal, seek sugary and protein foods slightly more avidly than fatty ones. This is a subtle tilt that is easy to miss in casual play but visible in aggregate statistics over thousands of ticks.

This is also the exact value the Creature Companion's drives tab displays as the "Hunger for Fat" bar. **The backup at chemical 134 is not displayed anywhere in the stock UI**; a breeder watching the drives panel sees only the fast-moving active drive, not the reservoir behind it, so "the bar dropped to zero" does *not* mean "the Norn is not fat-hungry any more".

### The critical-hunger alarm — a Youth-only faculty

The **Circulatory receptor #160** (tissue 1, locus 7, threshold 214, digital, gain 255) provides the game's sharp-edged "fat starvation" signal. Unlike the Drives receptor, which reads an analogue value scaled by gain, this receptor is all-or-nothing: it fires at full strength only when active fat hunger exceeds ≈ 214 / 255 ≈ **83 %**. Below that, it is silent.

Crucially, this receptor has `switchOnAge: 3` (Youth). **It does not activate in Baby Norns.** The first three weeks of a Norn's life are therefore *fat-alarm-free* — no matter how high chemical 151 rises in a baby, the circulatory alarm does not trip. Only once the creature reaches Youth does the receptor come online, at which point crossing the 83 % threshold produces a sudden, hysteresis-free switch to "starvation risk" mode.

All three macronutrient alarms (receptor 160 for fat on circulatory locus 7, receptor 161 for protein on locus 6, receptor 162 for carb on locus 5) switch on together at Youth with identical threshold (214) and gain (255), forming a coherent "physiological maturity" gate: below Youth, a Norn lives by its analogue drive bars alone; at Youth the sharp-edged alarms come online and the creature gains the ability to enter "desperate for X food" states. Each alarm writes to a distinct circulatory locus (5, 6, 7), so downstream organs and reactions can distinguish *which* macronutrient is in critical shortfall — though in the stock genome no obvious physiological response is wired to any of the three, leaving them as a "dire-hunger" bus for mods to exploit.

### Why there is no positive-feedback loop

Protein hunger has an aggressive positive-feedback circuit: emitter #11 on circulatory locus 8 fires digitally when blood-protein signals are low, adding another 24 units per tick to chemical 149. Fat hunger has no such amplifier. In the stock genome, circulatory locus 9 (which would be the analogous "low blood fat" signal) exists but is not wired to any emitter that feeds chemical 151.

The absence of this loop has three consequences:

- **Fat hunger rises gently.** With only the sensorimotor LOC_CONST trickle (rate 30 × gain 2 = 60 units/tick) feeding an actively-drained pool, fat hunger climbs at a steady, predictable pace, without the sharp accelerations seen in protein hunger during periods of metabolic stress.
- **Fatty food is not a metabolic-priority nutrient in the stock genome's behavioural model.** If a Norn's blood-fat metabolites (Fatty Acid, Triglyceride, Adipose Tissue) fall to zero, the creature's fat hunger does not automatically intensify. The Norn will continue to seek fatty food based only on its ambient drive level, even in a state of genuine fat starvation.
- **Modders targeting a "realistic fat metabolism" experience routinely add an emitter** keyed to low-Fatty-Acid or low-Adipose-Tissue signals. The common target is a new circulatory locus (typically locus 9 or 10), written to by a custom emitter that fires when the fat-metabolite signal is low, producing a protein-hunger-style aggressive climb when the creature's fat stores deplete.

### Why no pain cross-coupling?

Protein hunger's backup (chemical 132) receives a direct inflow from Pain via reaction 56 (`Pain [148] → Hunger for protein backup [132]`). Fat hunger's backup does not. A slapped Norn does not become fat-hungry, even over the following tens of seconds.

This is consistent with the carb pair (no pain coupling) and with the general pattern that only the protein hunger pair has the pain cross-coupling. Whether this is a deliberate design choice (pain induces a protein-specific hunger because protein is needed for tissue repair) or a one-slot wiring error in the original genome remains debated in the Creatures 3 community — see *131 - Pain backup* and *132 - Hunger for protein backup* for that discussion. From the fat-hunger side, the clean diagram above reflects the most common macronutrient wiring, and the protein pair is the outlier.

### Why the active drive at 13 % at birth

Every Norn hatches with chemical 151 at amount **33/255 ≈ 12.94 %** (initial concentration gene 15 / entry id 7). This matches the initial concentration of Hunger for protein exactly, and stands in contrast to the much gentler 5.1 % starting value used for Hunger for carbohydrate. The effect is that a newborn Norn is **already mildly fat-hungry from the first tick**, which gives the initial feeding behaviour a natural starting point — the brain has a non-zero fat-seeking vote from birth, but no alarm is firing yet (Youth-only receptor). Within the first few minutes of life, the constant sensorimotor emitter and the reservoir-drive dynamic together raise the effective drive into normal operating range.

Because the reservoir (chemical 134) has **no** initial concentration, newly-hatched Norns have an asymmetric state: 13 % active drive, 0 % backup. This means baby Norns are genuinely easier to satiate for fat than older Norns — a single fatty meal drains a large fraction of their active drive, and there is no reservoir yet to refill it. Older Norns, whose reservoirs have built up over tens of minutes or hours, require repeated fatty meals before the active drive stays low for any meaningful period.

### The active drive as a "fast", "Very long" chemical

As with every drive in the 148–161 block, chemical 151's natural half-life is "Very long" (≈ 9·10¹⁰ ticks, decay rate 1.0) — effectively permanent. On its own, the chemical does not decay. Yet its *effective* half-life in the creature's body is much shorter, because reactions 58 and 68 together aggressively siphon it into the backup. The combination produces a chemical whose:

- **Natural behaviour** is to persist forever.
- **Realised behaviour** in the stock genome is to bounce around on a ≈ 0.1 s timescale (the doubled siphon's effective half-life is roughly `6 / 2 = 3` ticks, ≈ 0.1 s at 30 Hz).

This gives modders a useful knob: removing one of the two duplicate drain reactions (say, gene 64) halves the siphon rate and makes fat hunger behave more like protein hunger in its steady-state dynamics. Conversely, adding a third duplicate drain would make the active drive almost instantaneously mirror whatever the backup is doing, eliminating the transient "bounce" seen after food consumption.

### Steady-state balance (active drive side)

The sensorimotor emitter writes ≈ 60 units/tick into chemical 151. The two parallel drain reactions together remove chemical 151 at rate `(1 − 0.88978^2) × [151] ≈ 0.2083 × [151]` per tick. At equilibrium, ignoring the backup → drive reflux (reaction 45, which adds a small constant depending on [134]):

```
   inflow = outflow
   60 = 0.2083 × [151]
   [151] ≈ 288 units  (but clamped to 255)
```

So in practice the active drive saturates at **full scale (255)** unless something is consuming it — which is why a creature that has never eaten fatty food, has no pain events, and has no `CHEM` consumption will eventually pin its fat hunger bar at maximum. The system is only kept away from 255 by the fact that **the Drives-tissue receptor and downstream action-selection cause the creature to find and eat fatty food**, which triggers food-agent scripts that call `CHEM 151 -n`. As with protein and carb hunger, the chemistry alone will drive a creature to full hunger; only *behaviour* can reduce it.

Note the contrast with protein hunger's `[149] ≈ 544` equilibrium figure (clamped to 255) — fat hunger's 288 equilibrium is much closer to the 255 ceiling, reflecting the higher effective drain rate. In practical terms, fat hunger approaches its ceiling more gradually than protein hunger does: you get less "headroom" in the chemistry alone, so the creature's behavioural response (eating) needs to engage proportionally more often to keep the bar below critical threshold.

Once fatty food is eaten and the active drive is pulled down, reaction 45's slow 10-second half-life determines how long the post-meal "satiety window" lasts before the reservoir replenishes the drive and the cycle resumes. The reservoir therefore sets the **tempo** of fat-hunger cycles, while the emitter sets the **amplitude** of the baseline drive.

### Effects of `CHEM 151 <n>`

Direct injection into the active drive produces a sharp, *transient* change in the drive bar:

1. **Tick 0:** `CHEM 151 +n` called. Active drive rises by *n*; backup unchanged.
2. **Ticks 1–3:** Reactions 58 and 68 in parallel aggressively pull mass out of 151 into 134. Within one effective half-life (~3 ticks, ~0.1 s), about half of the injected mass has migrated to the reservoir — roughly twice as fast as protein's single-siphon behaviour.
3. **Ticks 3–30:** The active drive stabilises at a new equilibrium that is only slightly elevated compared to before — most of the injected mass is now banked in 134. The drive bar "bounces down" almost immediately, faster than a protein injection of the same size would bounce.
4. **Ticks 30+:** The elevated reservoir now drip-feeds the active drive for minutes to come, producing a slow, long-tailed rise in drive above baseline. The creature becomes persistently slightly fat-hungrier.

As with protein and carb hunger, experienced CAOS scripters often prefer `CHEM 134 <n>` (reservoir injection) over `CHEM 151 <n>` for simulating long-term fat-hunger states: the former produces the lingering effect directly, while the latter is quickly absorbed into the reservoir.

Conversely, `CHEM 151 -n` (negative injection) is the **canonical fatty-food-consumption operation**. Because it zeroes out the active drive immediately, the Creature Companion's bar drops visibly. The backup then refills the drive over ~10 s (reaction 45 half-life), producing the familiar "feels fed for a moment, then gradually gets hungry again" post-meal profile.

### Relationship to fat-metabolite chemistry

Although Hunger for fat is a pure signalling chemical and is not chemically linked to the fat-metabolism network (Fat [10], Fatty Acid [6], Triglyceride [8], Adipose Tissue [9], Cholesterol [7]), its role in behaviour closes an important loop in the creature's energy economy:

```
   Fat-hungry Norn   ──▶  Drive receptor fires  ──▶  Decision lobe votes for food-seeking
          ▲                                                        │
          │                                                        ▼
   CHEM 151 -n   ◀─── Fatty-food script   ◀───  Norn eats fatty item
   (on eating)                                            │
                                                          ▼
                                                   Fat [10] → Triglyceride + Cholesterol (reaction 1)
                                                   Triglyceride + Adipose Tissue reactions (4, 5, 10, 11)
                                                   Fatty Acid → Pyruvate → ATP (energy pathway)
```

The behavioural drive (chemical 151) and the metabolic chemistry (Fat, Triglyceride, Fatty Acid, etc.) are thus **causally coupled via behaviour**, not via chemistry: a hungry Norn seeks fatty food; eating fatty food drops chemical 151 and injects Fat [10] into the stomach; the digestive and adipose systems then handle the metabolic consequences. The absence of a locus-keyed positive-feedback emitter on chemical 151 (noted above) means there is no tight chemical feedback from the metabolite side back to the drive side — behaviour is the only closed loop.

### The CA smell channel for fat

The world CA system provides a separate channel, **CA smell 8 (fat)** at chemical 173, that food agents broadcast when they contain fat. This is a spatial "fat scent" broadcast to the environmental CA map, not a drive-related chemical, and it does not interact with chemical 151 directly. Instead:

- A fat-containing food agent emits CA smell 8 into the local map cells it occupies.
- A Norn's perception system reads CA smell 8 via a smell-8 brain-input lobe.
- The brain, upon detecting fatty food nearby, biases action selection toward that direction — but only if the Hunger for fat drive (chemical 151, via receptor #4) is also elevated.

This two-stage system (internal drive + external scent) is why a satiated Norn will often ignore a fatty item it walks past: the scent is perceived, but the drive is low, so the combined behavioural vote is weak. A fat-hungry Norn in the same situation will immediately approach and eat.

### Comparison to other Hunger drives

The sixteen 148–161 drives all share the same basic architecture, but Hunger for fat has some distinguishing features:

| Drive (id) | Backup (id) | Constant emitter? | Critical-hunger alarm? | Positive metabolic feedback? | Cross-coupling inflows? | Drain reactions | Drives gain |
|------------|-------------|-------------------|------------------------|------------------------------|-------------------------|-----------------|-------------|
| Pain (148) | 131 | No | — (pain is its own signal) | No | Various pain sources | 1 | varies |
| Hunger for protein (149) | 132 | Yes (rate 30 × 2) | Youth (locus 6, thresh 214) | Yes (locus 8 emitter) | Pain → backup 132 (indirect) | **1** | 209 |
| Hunger for carbohydrate (150) | 133 | Yes (rate 35 × 2) | Youth (locus 5, thresh 214) | No | None | **2 (doubled)** | 255 |
| **Hunger for fat (151)** | **134** | **Yes (rate 30 × 2)** | **Youth (locus 7, thresh 214)** | **No** | **None** | **2 (doubled)** | **205** |
| Coldness (152) | 135 | — | — | — | — | 1 | 204 |
| Hotness (153) | 136 | — | — | — | — | 1 | 204 |
| Tiredness (154) | 137 | Yes | No hard alarm | No | None | 1 | varies |

Hunger for fat shares its sensorimotor emitter rate (30) and initial concentration (33) with protein; shares its doubled drain and absence of positive feedback with carb; and has the lowest Drives gain (205) of the three macronutrient hungers. It is the "middle child" of the macronutrient-drive set — neither as aggressive as protein (feedback loop + pain coupling) nor as heavily-weighted as carb (gain 255) in the decision lobe.

### Implications for modders

Common modifications built on top of chemical 151:

1. **Add a positive-feedback emitter** keyed to low fat-metabolite signals (e.g. circulatory locus 9 = low Fatty Acid). Brings fat hunger in line with protein hunger's aggressive behaviour during starvation.
2. **Raise the Drives-receptor gain from 205 to 255.** Makes fat hunger behaviourally weighted equal to carb hunger, producing Norns that seek fatty food as avidly as sweet food. Useful for "gourmet" breeds.
3. **Remove one of the duplicate drain reactions (gene 22 or 64).** Halves the siphon rate and makes fat hunger behave more like protein hunger in its steady-state dynamics (slower bounce after meals, more lingering drive).
4. **Lower the critical-alarm threshold on receptor #160** from 214 to something like 192 (~75 %). Makes the fat-starvation alarm trip earlier, producing more urgent fat-seeking in youth-or-older Norns.
5. **Enable the critical alarm from Baby** by changing receptor #160's `switchOnAge` from 3 to 0. Gives baby Norns the same hard "I am fat-starving" signal their older kin get, resulting in more reliable baby feeding behaviour at the cost of more frantic-looking infants.
6. **Add a pain cross-coupling** (`Pain [148] → Hunger for fat backup [134]`). Produces a delayed fat hunger after injury, analogous to protein's pain coupling — useful for simulating a stress-eating response to fatty foods.

### Practical consequences for gameplay

- **The drive bar shows 151, not 134.** A creature whose fat-hunger bar reads zero can still have a large reservoir of banked hunger in chemical 134. Expect the bar to rise again within seconds of hitting zero.
- **Fatty food items consume the active drive directly.** Every fat-bearing food agent's eating/drinking script injects `CHEM 151 -n` at the end of its animation. Cheese, pies, fatty meats, and greasy snacks all target chemical 151 and leave the reservoir untouched.
- **Critical-hunger behaviour is a step change, not a ramp — and only from Youth.** Once active fat hunger exceeds 214/255 in a Youth-or-older Norn, the circulatory locus 7 alarm trips. Baby Norns cannot reach this state — the receptor is inactive for them.
- **No metabolic positive-feedback spiral.** Unlike protein hunger, which can run away during low-blood-protein episodes, fat hunger climbs at a steady gradient regardless of fat-metabolite state. A fat-starving Norn does not "desperately" accelerate its fat-seeking — it escalates smoothly.
- **Doubled siphon means fast "bounce" after injection.** `CHEM 151 +n` produces a transient spike that decays to near-baseline within ~5 ticks (0.17 s), about twice as fast as a protein injection. For modders trying to use fat hunger as a behavioural trigger, prefer reservoir injections (`CHEM 134 +n`) for long-lasting effects.
- **Pain does not cause fat hunger.** Unlike protein hunger, a slapped Norn will not become fat-hungry over the following minute. Pain is a protein-coupling-only signal in the stock genome.
- **Smell channel is separate.** Perception of fatty food via CA smell 8 (chemical 173) is a distinct channel from the internal drive. Both must be active for strong fatty-food-seeking behaviour.
- **Science Kit monitoring.** The Science Kit's chemical view shows chemical 151 by name, and is the go-to tool for diagnosing whether a Norn is stuck at high fat hunger because of a reservoir leak, a missing food-consumption script, or a broken fat-metabolite chain.

### Summary

```
 Stock-genome wiring of Hunger for fat [151]
 ─────────────────────────────────────────────
 Inputs:
    Sensorimotor LOC_CONST emitter (gene 29): rate 30, gain 2 — constant, ~60 units/tick
    Backup → drive reaction 45     (gene 10): half-life 311 ticks (~10 s), "Medium"
    CHEM 151 <n>                   (CAOS / scripts)

 Active drive:
    Hunger for fat [151]
    half-life ≈ 9·10¹⁰ ticks (Very long — effectively permanent)
    initial concentration 33/255 ≈ 13 %
                    │
                    ├──▶ Drives tissue locus 3 receptor (gain 205, Baby+) ▶ decision-lobe drive bar (Creature Companion)
                    ├──▶ Circulatory locus 7 receptor  (threshold 214, digital, Youth+) ▶ critical-hunger alarm
                    │
                    ├──▶ reaction 58 (gene 22) → Hunger for fat backup [134]
                    ├──▶ reaction 68 (gene 64) → Hunger for fat backup [134]   (duplicate; parallel drain, ~0.21/tick combined)
                    │    both half-life 6 ticks (~0.2 s), "Very short"
                    │
                    └──▶ CHEM 151 -n from fatty-food-agent scripts (consumption)

 Absent compared to protein pair:
    - No positive-feedback circulatory emitter (would be locus 9/10 for low blood fat)
    - No pain cross-coupling (reaction 56 exists only for protein)
    - No Baby-era critical alarm (Youth+ only)

 Present compared to protein pair:
    - Second duplicate drain reaction (gene 64 / reaction 68) — doubled siphon
```

Hunger for fat is the **least amplified** of the three macronutrient drives: a brain-read signal fed by a constant metabolic emitter, drained twice-over into a long-lived reservoir, gated by a Youth-only digital critical-state alarm, and consumed only by the creature's own behaviour via fatty-food-eating scripts. Its pair with the reservoir at chemical 134 is a minimal, cleanly-wired drive pair in the stock genome — lacking the protein pair's feedback loop and pain coupling, but matching the carb pair's doubled-siphon architecture. Among the three macronutrient hungers it is the most restrained: steady rise, gentle decision weight, fast bounce after meals, and no runaway dynamics. For modders, it is the most natural starting point for experimenting with adding metabolic feedback loops to Creatures 3 drives, because its wiring is uncluttered by the stock genome's idiosyncrasies.
