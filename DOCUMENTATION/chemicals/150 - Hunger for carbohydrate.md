# 150 - Hunger for carbohydrate

Hunger for carbohydrate is the **active, brain-visible half** of the drive pair for sugary-food nutrition in Creatures 3. It is the second of the sixteen "drive" chemicals in the 148–161 block (the bank of acute drive signals that the decision-lobe reads every tick) and is paired one-to-one with its long-lived reservoir partner, **Hunger for carb backup (133)**. Where the backup carries the slow-moving, minute-scale "memory" of how long the creature has gone without sugar, chemical 150 is the fast-moving *felt* value: the number the Norn's brain actually consults when deciding whether to toddle over to the honeypot, bite the lemon on the vine, or ignore sweet food entirely. It is also the signal the Creature Companion's "Hunger for Carbohydrate" drive bar displays, and — once the creature reaches Youth — it is the threshold-gated trigger for the Circulatory system's critical-hunger alarm.

Unlike metabolite chemicals (Glucose, Glycogen, Starch, etc.), Hunger for carbohydrate is **not a nutrient**. It is a pure signalling chemical: its concentration represents how much the creature "wants" carbohydrate, not how much carbohydrate the creature has. The stock Norn genome produces chemical 150 continuously from a single constant sensorimotor emitter (the "metabolic clock") and then siphons most of its instantaneous mass into the long-term reservoir at chemical 133 via **two identical drive-to-backup reactions** (genes 21 and 63). That doubling of the drain pathway is unique to the carb pair and makes its active drive the most heavily buffered of the four macronutrient hungers — the carb bar physically *cannot* rise as steeply as the protein bar for the same input, because twice as much active drive is being pulled into the reservoir every tick.

Hunger for carbohydrate has a **"Very long"** half-life (≈ 9·10¹⁰ ticks, genome byte 255 — effectively permanent on its own), so like every drive in the 148–161 range its mass is conserved until it is explicitly consumed. The three consumers are: the twin self-refill reactions (57 and 67) that pull it into backup 133, external `CHEM 150 <−n>` calls fired by food-eating scripts, and the natural budget the Drives-tissue receptor applies when the brain reads the value. Its newborn concentration is **13/255 ≈ 5.1 %** — roughly a third of the protein-hunger starting value — so every Norn hatches only very mildly carb-hungry, a noticeably gentler opening condition than for protein.

Distinguishing features versus the other macronutrient hungers (protein 149, fat 151):

- **No positive-feedback circulatory emitter.** The stock genome wires no locus-8-style "low blood sugar → more hunger" emitter onto chemical 150. Carb hunger is driven purely by the constant sensorimotor clock — it cannot accelerate on its own when the creature's blood metabolism deteriorates.
- **No pain cross-coupling.** Unlike protein's reaction 56 (`Pain → Hunger for protein backup`), there is no `Pain → Hunger for carb backup` or `Pain → Hunger for carbohydrate` reaction. A slapped Norn never develops carb hunger as a consequence of the injury.
- **Maxed-out Drives receptor gain.** The decision-lobe receptor for carb hunger has gain **255** (compared with 209 for protein, 205 for fat). The carb bar translates one-for-one onto the drive neuron's excitation — the full analogue range of the chemical is the full range of the behavioural drive.
- **Doubled drive-to-backup siphon.** Two genes (21 and 63) both encode the identical `Hunger for carbohydrate [150] → Hunger for carb backup [133]` 6-tick reaction. They run in parallel, so ≈ 21 % of the active drive drains into the reservoir per tick — roughly twice the rate for protein. The result is that a bolus injection into 150 "bounces down" even faster than a protein injection.
- **Critical-hunger alarm is a youth-only faculty.** Unlike the Drives receptor (Baby from hatching), the Circulatory locus-5 alarm receptor only switches on at life-stage 3 (Youth). Baby Norns have no hard "starvation-risk" signal for sugar — only the analogue drive bar.

## Sources

Hunger for carbohydrate has two endogenous inflows and two external inflows. The constant sensorimotor emitter is the sole internal producer — there is no positive-feedback path and no cross-coupling from another drive.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Constant sensorimotor emitter (the "metabolic clock") | Gene 16 (emitter id 4) | Organ #1 "Creature" → Sensorimotor (tissue 4) → locus 0 `LOC_CONST` | Always on from Baby life-stage. Writes chemical 150 every tick | Rate byte **35**, gain **2**, threshold 0. At full gain this is ≈ 70 drive-units per tick, slightly higher than the protein emitter's 60 — but the doubled drain of reactions 57 & 67 more than compensates, so the steady-state bloodstream concentration tracks a lower equilibrium than protein hunger |
| 2 | Backup → drive release | Gene 9 (reaction id 44) | Organ #2 "Reaction" | `1× Hunger for carb backup [133] → 1× Hunger for carbohydrate [150]` | Half-life **311 ticks** (≈ 10 s at 30 Hz), "Medium" speed. The reservoir steadily drip-feeds the active drive — this is what makes sugar hunger return a few seconds after a sweet meal |
| 3 | External CAOS injection | — | Any | `CHEM 150 <n>` on a targeted creature from scripts, bootstrap agents, or the debug console | One-shot. Because the chemical is "Very long" half-life, injected mass persists until the doubled siphon drains it to the backup or food scripts consume it |
| 4 | Initial concentration at birth | Gene 14 (initialConcentrations id 23) | Bloodstream | Every Norn hatches at **amount 13 / 255 ≈ 5.1 %** of Hunger for carbohydrate | One-time, applied at Baby life-stage. Markedly lower than the 13 % seen for protein hunger |
| 5 | No positive-feedback metabolic emitter | — | — | Unlike the protein pair (emitter #11 on circulatory locus 8, threshold 128, digital), **there is no locus-keyed emitter** targeting chemical 150. Carb hunger therefore does not accelerate when blood sugar is low — only the sensorimotor clock drives it | — |
| 6 | No cross-coupling from pain or another drive | — | — | The reaction table contains no pain-spillover or drive-cross-coupling entry for 150 or 133. Carb hunger is wholly internal to its own pair | — |
| 7 | Modded inflows | User-added | User-added | Custom emitters keyed to a "low-glucose" circulatory locus, a metabolic-memory lobe, or ingestion-triggered scripts. Adding a positive-feedback emitter is one of the most commonly-recommended carb-hunger mods — it brings carb hunger in line with the aggressive behaviour of the protein pair | Gene-dependent |

## Usage

Hunger for carbohydrate has four consumers: two receptors that read it (but do not destroy it — receptors are sensors), **two duplicate reactions** that convert it to backup (unusual — every other drive has just one), and the implicit "consumption" by food scripts via negative `CHEM` calls.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | **Decision-lobe drive bar** | Gene 3 (receptor id 3) | Organ #1 "Creature" → Drives (tissue 5) → locus 2 "Hunger for carbohydrate" | Analogue, threshold **0**, nominal 0, **gain 255**. Reads chemical 150 from Baby | The value the brain's decision lobe consults when choosing which drive-related action to vote for. With gain 255 (maxed), the full range of the chemical maps 1:1 onto the drive neuron's excitation — the most "linearly faithful" drive wiring in the stock genome. **This is the signal shown on the Creature Companion's "Hunger for Carbohydrate" bar** |
| 2 | **Critical-hunger digital alarm** (Youth+ only) | Gene 18 (receptor id 162) | Organ #1 "Creature" → Circulatory (tissue 1) → locus 5 | **DIGITAL (all-or-nothing)**, threshold **214**, gain **255**. Reads chemical 150 from **Youth (age 3)** onward | Fires a hard on/off signal at circulatory locus 5 when carb hunger exceeds ≈ 83 % of full range. Unlike the Drives receptor (always on), this receptor does not activate until the creature reaches Youth — Baby Norns cannot trigger the sugar-starvation alarm |
| 3 | Active → backup siphon (primary) | Gene 21 (reaction id 57) | Organ #2 "Reaction" | `1× Hunger for carbohydrate [150] → 1× Hunger for carb backup [133]` | Half-life **6 ticks** (≈ 0.2 s), "Very short". Aggressively drains the active drive into the reservoir |
| 4 | Active → backup siphon (duplicate) | Gene 63 (reaction id 67) | Organ #2 "Reaction" | `1× Hunger for carbohydrate [150] → 1× Hunger for carb backup [133]` (identical formula and rate) | Half-life **6 ticks**. Exact duplicate of gene 21. Runs in parallel every tick, doubling the effective drain rate. Per-tick active-drive loss to backup becomes `1 − 0.88978² ≈ 0.2083` — nearly twice the `0.1102` per-tick loss seen in the protein pair |
| 5 | Food-script consumption | — | Any food-agent script | `CHEM 150 <negative n>` called at the end of an eating/drinking animation for sugary items (honey, carrots, fruit) | The canonical way food agents "reduce carb hunger". With no spontaneous decay, this is the only way food can lower active carb hunger apart from reactions 57 & 67's backup pull |
| 6 | Debug / care-script consumption | — | CAOS console or tending scripts | `CHEM 150 -255` (full drain) or `CHEM 150 -n` | Common operator action to relieve a sugar-starving Norn. To fully reset carb hunger the backup must also be drained with `CHEM 133 -255`; otherwise reaction 44 will repopulate 150 within minutes |

## Role in Game Mechanics

### The drive/backup architecture, from the active side

Every drive in Creatures 3 is a pair: a short-responsive **drive chemical** (148–161) that the brain reads directly, and a long-lived **backup chemical** (131–146) that the drive continuously exchanges with. For carbohydrate hunger:

```
         (sensorimotor LOC_CONST emitter, rate 35 × gain 2 per tick — constant)
                                  │
                                  ▼
     [133] Hunger for carb backup  ◀─── reactions 57 & 67 (6-tick half-life, ×2 parallel) ─── [150] Hunger for carbohydrate
              │                                                                                          ▲
              └─── reaction 44 (10 s half-life) ───────────────────────────────────────────────────────┘
                                                                                                         │
                                                                                                         ├──▶ Drives tissue locus 2 (gain 255, Baby+) — decision-lobe drive bar
                                                                                                         └──▶ Circulatory locus 5 (thresh 214, digital, Youth+) — critical alarm
```

Compared with the protein pair, four nodes are missing from this diagram: the low-blood-protein positive-feedback emitter, the pain cross-coupling into the backup, the analogue-attenuation of the Drives receptor (gain 209 vs 255), and the Baby-accessible critical alarm. What carb hunger gains in exchange is a **doubled** drive-to-backup siphon, making its chemistry the most aggressively "reservoir-dominated" of any drive in the stock genome.

### What the Norn "feels"

The **Drives receptor #3** (tissue 5, locus 2, gain 255) is the direct wiring from chemical 150's value into the brain. The decision lobe treats its input as a candidate action urge: each of the 16 drive neurons votes for the action-selection algorithm, and the winning vote dictates the creature's current goal. Because the carb-hunger receptor has gain 255 — the maximum — the drive neuron's excitation is a linear, uncorrupted reading of the chemical's concentration. A drive value of 128 produces exactly 50 % excitation; a value of 255 produces 100 %. This makes carb hunger the most "honest" drive signal in the creature: nothing is attenuated, and nothing is amplified.

In play this manifests as carb hunger having a **gentler rise-curve** than protein hunger (because of the doubled drain) but **louder decision weight** when it does rise (because of the higher gain). A Norn whose protein and carb drives are both at 50 % of full will tend to vote slightly more strongly for the carb-seeking action, because the carb drive neuron is more excited by that same chemical concentration.

This is also the exact value the Creature Companion's drives tab displays as the "Hunger for Carbohydrate" bar. **The backup at chemical 133 is not displayed anywhere in the stock UI**; a breeder watching the drives panel sees only the fast-moving active drive, not the reservoir behind it, so "the bar dropped to zero" does *not* mean "the Norn is not carb-hungry any more".

### The critical-hunger alarm — a Youth-only faculty

The **Circulatory receptor #162** (tissue 1, locus 5, threshold 214, digital, gain 255) provides the game's sharp-edged "sugar starvation" signal. Unlike the Drives receptor, which reads an analogue value scaled by gain, this receptor is all-or-nothing: it fires at full strength only when active carb hunger exceeds ≈ 214 / 255 ≈ **83 %**. Below that, it is silent.

Crucially, this receptor has `switchOnAge: 3` (Youth). **It does not activate in Baby Norns.** The first three weeks of a Norn's life are therefore *carb-alarm-free* — no matter how high chemical 150 rises in a baby, the circulatory alarm does not trip. Only once the creature reaches Youth does the receptor come online, at which point crossing the 83 % threshold produces the same step-change behavioural shift seen with the protein alarm: a sudden, hysteresis-free switch to "starvation risk" mode.

This is different from the protein alarm (receptor 161), which also `switchOnAge: 3`. Both macronutrient alarms come online together at Youth; they share the same threshold and digital behaviour. The protein doc's claim that receptor 161 is "from Baby" is an error; the underlying genome data shows all four macronutrient-alarm receptors (159: fat carried over, 160: fat, 161: protein, 162: carb) switch on together at Youth. Baby Norns therefore have **only the analogue drive bars** — no hard alarms for any macronutrient — and their early hunger behaviour is correspondingly softer and more gradient-based.

### Why there is no positive-feedback loop

Protein hunger has a digital emitter (#11, circulatory locus 8) that pumps extra hunger into chemical 149 when blood protein is low. **Carb hunger has no equivalent.** The carb emitter list contains only the single sensorimotor LOC_CONST entry; no circulatory locus writes to chemical 150.

The gameplay consequence is that carb hunger is **climate-independent** — it rises at a steady, predictable rate regardless of whether the creature's blood sugar is high or low. Unlike the protein drive, which accelerates when the creature is metabolically deficient in protein, carb hunger simply increases at the rate the LOC_CONST emitter sets, modulo the doubled drain. This is arguably a genome-design oversight: in a real metabolism, low blood glucose should produce ravenous sugar craving. In the stock Creatures 3 genome, the sugar drive is actually the least metabolically-responsive of the three macronutrient drives.

Modders frequently fix this by adding an emitter keyed to circulatory locus 9 (or any free locus) that reads a "low blood Glucose" signal and writes into chemical 150 with a digital threshold. This brings carb hunger's responsiveness in line with protein's and produces more realistic "hypoglycaemic" creature behaviour — listless when rested, desperate when blood sugar is low.

### The doubled drive-to-backup siphon

The most mechanically significant feature of the carb-hunger pair is the **duplicated** drive-to-backup reaction: genes 21 and 63 both encode `Hunger for carbohydrate → Hunger for carb backup` with identical rates and half-lives. Both reactions run every tick in parallel. The combined per-tick fraction of active drive transferred to the backup is therefore not `1 − 0.88978 ≈ 0.1102` (as it is for the protein pair), but:

```
   per-tick drain = 1 − 0.88978 × 0.88978 ≈ 0.2083
```

In other words, **≈ 21 % of the active carb drive is pulled into the reservoir every tick**, roughly double the protein rate. The practical consequences are multiple:

1. **CHEM injections into 150 are far more transient than into 149.** A `CHEM 150 +128` bolus will be half-gone in ≈ 3 ticks (one half-life of the combined reactions), whereas the equivalent `CHEM 149 +128` takes ≈ 6 ticks. The carb drive bar responds sharply but settles back almost instantly.
2. **Food items that target 150 produce a briefer visible drop in the drive bar.** Because any residual active-drive value is rapidly resorbed into the reservoir, and then released only slowly via reaction 44, the "I just ate!" moment is shorter for carb than for protein.
3. **The steady-state ratio of backup to drive is higher.** With the doubled drain, the equilibrium ratio is `[133] / [150] ≈ 93`, compared with `[132] / [149] ≈ 50`. Roughly 99 % of the pair's mass sits in the reservoir at any given time, vs 98 % for protein — a small but real difference in buffering.
4. **Modders sometimes remove one of the duplicates** (commonly gene 63, the later one) to bring the carb pair into line with the other drive pairs. This produces a carb drive that behaves more similarly to protein — more visible on the drive bar, more persistent after a bolus injection, more responsive to short-term food events.

Whether the duplication is a deliberate design choice (to make sugar hunger a "background", heavily-buffered drive) or a genome-editing mistake from the original development team is not documented in the stock genome notes. Either way, the behavioural effect is consistent: carb hunger is the most reservoir-dominated, least-spiky drive in the creature.

### Why the active drive is at 5 % at birth

Every Norn hatches with chemical 150 at amount **13/255 ≈ 5.1 %** (initial concentration gene 14 / entry id 23). This is considerably lower than the 13 % starting value for protein hunger. The effect is that a newborn Norn is **barely carb-hungry at all** in its first few minutes — sugary foods have little immediate appeal at hatch.

Combined with the zero initial backup (chemical 133 has no initial concentration entry), newly-hatched Norns have the lowest carb-hunger loading of any drive: 5 % active, 0 % backup. Within the first several minutes of life the constant LOC_CONST emitter builds the pair up to normal operating range, but the initial "honeymoon window" is meaningfully longer than for protein. This pattern reflects the natural feeding order: baby creatures who have just hatched do not need sugar as urgently as they need protein for tissue construction.

### The active drive as a "fast", "Very long" chemical

Chemical 150's half-life is classified "Very long" (≈ 9·10¹⁰ ticks, decay rate 1.0) — effectively permanent. On its own, the chemical does not decay. Yet its *effective* half-life in the creature's body is much shorter, because reactions 57 and 67 together pull it into the backup at a combined 6-tick/6-tick parallel rate. The combination produces a chemical whose:

- **Natural behaviour** is to persist forever.
- **Realised behaviour** in the stock genome is to decay with an effective half-life of ≈ 3 ticks (because two parallel 6-tick half-life reactions compose to a ~3-tick combined half-life).

This makes chemical 150 the fastest-settling of the drive chemicals. Anything that perturbs the active drive bounces back to equilibrium within a tenth of a second. The creature's brain therefore sees a very smooth, heavily-damped carb-hunger signal, with most of the transient detail absorbed into the reservoir before the decision lobe can react.

### Steady-state balance (active drive side)

Assuming no external consumption and the reservoir has reached steady state, the sensorimotor emitter writes ≈ 70 units/tick into chemical 150. The doubled siphon drains it at rate `(1 − 0.88978²) × [150] ≈ 0.2083 × [150]` per tick. At equilibrium with the inflow balanced by the outflow:

```
   inflow = outflow
   70 = 0.2083 × [150]
   [150] ≈ 336 units  (but clamped to 255)
```

So in practice the active drive **saturates at full scale (255)** unless something is consuming it — the same outcome as for the protein pair, despite the very different chemistry. The system is only kept away from 255 by food-script consumption and by the backup's finite capacity during initial build-up. This is a deliberate design choice: the chemistry alone will drive a creature to full carb hunger; only behaviour can reduce it.

Once food is eaten and the active drive is pulled down, reaction 44's 10-second half-life determines how long the "sugar satiety window" lasts before the reservoir replenishes the drive. The reservoir sets the **tempo** of carb-hunger cycles, while the emitter sets the **amplitude** of the baseline drive.

### Effects of `CHEM 150 <n>`

Direct injection into the active drive produces a very sharp, very brief spike in the drive bar because of the doubled siphon:

1. **Tick 0:** `CHEM 150 +n` called. Active drive rises by *n*; backup unchanged.
2. **Ticks 1–3:** Reactions 57 & 67 aggressively pull mass out of 150 into 133. Within one combined half-life (≈ 3 ticks / 0.1 s), about half of the injected mass has migrated to the reservoir.
3. **Ticks 3–15:** The active drive stabilises at a new equilibrium only slightly above its previous level — most of the injected mass is now banked in 133. The drive bar "bounces down" almost immediately, faster than for any other drive.
4. **Ticks 15+:** The elevated reservoir now drip-feeds the active drive for minutes to come, producing a slow, long-tailed rise in drive above baseline. The creature becomes persistently slightly sugar-hungrier.

Because of the rapid siphon, `CHEM 150 +n` is a poor tool for inducing a visible, lasting carb-hunger spike in a Norn — the drive bar will have returned near its prior value before the player can confirm the effect. Experienced scripters prefer `CHEM 133 <n>` (reservoir injection) for simulating long-term sugar-hunger states.

Conversely, `CHEM 150 -n` (negative injection) is the **canonical food-consumption operation**. Because it zeroes the active drive immediately, the Creature Companion's bar drops visibly. The backup then refills the drive over ~10 s (reaction 44 half-life), producing the familiar "feels fed for a moment, then gradually gets hungry again" post-meal profile — though with a shorter initial-visible-drop phase than protein because of the doubled drain.

### Comparison to other Hunger drives

The sixteen 148–161 drives all share the same basic architecture, but Hunger for carbohydrate has several distinguishing features:

| Drive (id) | Backup (id) | Constant emitter? | Positive metabolic feedback? | Pain cross-coupling? | Drive→backup reactions | Drives-tissue gain | Critical alarm switchOnAge |
|------------|-------------|-------------------|------------------------------|----------------------|------------------------|--------------------|-----------------------------|
| Pain (148) | 131 | No | — | Self-source | 1 | n/a (different architecture) | — |
| Hunger for protein (149) | 132 | Yes (rate 30 × gain 2) | **Yes** (locus 8 emitter) | Yes (Pain→132) | 1 (reaction 66) | 209 | Youth |
| **Hunger for carbohydrate (150)** | **133** | **Yes (rate 35 × gain 2)** | **No** | **No** | **2 (reactions 57 & 67, duplicated)** | **255 (maxed)** | **Youth** |
| Hunger for fat (151) | 134 | Yes | None in stock | No | 1 | 205 | Youth |
| Coldness (152) | 135 | — | — | — | — | (different architecture) | — |

Carb hunger is distinguished by three "firsts" among the drives:

- **Highest Drives-tissue gain** (255 vs protein's 209 and fat's 205), giving the most linear translation of chemical value into behavioural vote.
- **Only drive with a duplicated drive-to-backup reaction**, giving it the fastest effective drain and the most heavily buffered behaviour.
- **Only macronutrient drive with no metabolic feedback path** — it cannot accelerate on its own in response to a blood-sugar deficit.

### Implications for modders

Common modifications built on top of chemical 150:

1. **Add a positive-feedback emitter.** The canonical "fix" for the carb pair: wire a digital emitter keyed to a low-blood-Glucose signal (perhaps a new circulatory locus, or an existing one like locus 9) to chemical 150. This brings carb hunger's responsiveness in line with protein's and produces more realistic hypoglycaemic behaviour.
2. **Remove gene 63** (the duplicate drive-to-backup reaction). Halving the drain rate brings the carb pair into line with the other drives, makes the active drive more spiky and visible, and produces more pronounced post-meal drops in the drive bar.
3. **Add a Pain cross-coupling.** Modders who want injured Norns to comfort-eat sweet food can add a `Pain → Hunger for carb backup` reaction analogous to protein's reaction 56, producing a delayed sugar craving after injury.
4. **Lower the Drives-tissue receptor gain** from 255 to match protein's 209. Produces a subtler carb drive whose full chemical concentration doesn't entirely dominate the behavioural vote.
5. **Enable the critical-hunger alarm from Baby.** Change receptor #162's `switchOnAge` from 3 to 0 so baby Norns can experience the step-change "sugar starvation" behavioural shift. Useful for breeds where early sugar-seeking is a desired trait.
6. **Raise the initial concentration** in gene 14. Newborn Norns become immediately carb-hungry, removing the brief "honeymoon" window and producing a more urgent early feeding behaviour.

### Practical consequences for gameplay

- **The drive bar shows 150, not 133.** A creature whose carb-hunger bar reads zero can still have a large reservoir of banked hunger in chemical 133. Expect the bar to rise again within seconds of hitting zero.
- **Food items consume the active drive directly.** Sugary food agents' eating scripts inject `CHEM 150 -n` at the end of their animation. Different foods use different *n* values — honey is typically stronger than a single piece of carrot — but all target chemical 150 and leave the reservoir untouched.
- **Critical-hunger behaviour is Youth-only and a step change, not a ramp.** Baby Norns have no hard carb-alarm at all. Once in Youth and above, crossing the 214/255 threshold produces a sudden shift in physiological state rather than a gradual one.
- **Carb hunger does not accelerate on its own.** Unlike protein, which ramps faster when blood protein is low, carb hunger grows at a constant rate set by the LOC_CONST emitter. A Norn whose blood sugar collapses will not become more desperately sugar-hungry — it will simply continue feeling mildly, steadily hungry for sugar while its metabolic state deteriorates.
- **The drive bar responds briskly but shallowly.** Because of the doubled siphon, short-term perturbations of chemical 150 (injections, single bites of food) produce visible but brief bar movements. Long-term changes must be effected via the reservoir at chemical 133.
- **Science Kit monitoring.** The Science Kit's chemical view shows chemical 150 by name, and is the go-to tool for diagnosing whether a Norn is stuck at high active carb-drive because of a reservoir leak, a broken food-consumption script, or a missing bootstrap initialisation.

### Summary

```
 Stock-genome wiring of Hunger for carbohydrate [150]
 ────────────────────────────────────────────────────
 Inputs:
    Sensorimotor LOC_CONST emitter (gene 16): rate 35, gain 2 — constant, ~70 units/tick
    Backup → drive reaction 44     (gene 9):  half-life 311 ticks (~10 s), "Medium"
    CHEM 150 <n>                   (CAOS / scripts)
    (No positive-feedback emitter, no pain cross-coupling)

 Active drive:
    Hunger for carbohydrate [150]
    half-life ≈ 9·10¹⁰ ticks (Very long — effectively permanent)
    initial concentration 13/255 ≈ 5.1 %
                    │
                    ├──▶ Drives tissue locus 2 receptor (gain 255, Baby+) ▶ decision-lobe drive bar (Creature Companion)
                    ├──▶ Circulatory locus 5 receptor (threshold 214, digital, Youth+) ▶ critical-hunger alarm
                    │
                    ├──▶ reaction 57 (gene 21) → Hunger for carb backup [133]
                    │    half-life 6 ticks (~0.2 s), "Very short"
                    ├──▶ reaction 67 (gene 63) → Hunger for carb backup [133]  (DUPLICATE of reaction 57)
                    │    half-life 6 ticks — runs in parallel, doubling effective drain
                    │
                    └──▶ CHEM 150 -n from food-agent scripts (consumption)
```

Hunger for carbohydrate is the Creatures 3 drive chemical with the most **reservoir-dominated, mechanically-damped** character. Its maxed-out Drives-tissue gain makes its behavioural influence loudly linear, but its doubled drive-to-backup siphon and absent positive-feedback loop make its bloodstream concentration exceptionally smooth and slow to respond to acute events. In play this manifests as a Norn whose sugar-seeking behaviour is steady and predictable rather than spiky — a creature that craves honey consistently throughout its life, rather than in the sharp, hunger-driven bursts that characterise protein-seeking.
