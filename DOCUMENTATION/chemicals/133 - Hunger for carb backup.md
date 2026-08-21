# 133 - Hunger for carb backup

Hunger for carb backup is the **reservoir half** of the drive pair for *Hunger for carbohydrate* (chemical 150). It sits in the third slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slow-release pool of the creature's "banked" carbohydrate hunger so that the **acute** signal (the current, felt urge to eat sugary food) and the **chronic** signal (the deeper, slower-moving metabolic deficit) can be modulated independently. With its essentially infinite half-life, whatever the creature has accumulated in its carb-hunger reservoir persists across many minutes of play unless actively drained by the `backup → drive` reaction.

Like its immediate sibling **Hunger for protein backup** (132), chemical 133 is **fully plumbed** in the stock genome — it has a drain (reaction 44: `Hunger for carb backup → Hunger for carbohydrate`, "Medium" speed) and not one but **two** self-refill reactions (reactions 57 and 67, both `Hunger for carbohydrate → Hunger for carb backup` at "Very short" speed). That doubling of the self-refill pathway is unique to the carb-hunger pair and has a direct, measurable consequence: **active carb hunger is pulled back into its reservoir roughly twice as aggressively as protein hunger**, giving the carb drive an even more heavily buffered feel than its protein counterpart. Unlike chemical 132, chemical 133 has **no cross-coupling inflow** from another drive — the gene slot that carries the `Pain → Hunger for protein backup` reaction for the protein pair (gene 20) has no carb-pair equivalent, so carb hunger is wholly decoupled from injury.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its only entry in the half-life table records a "Very long" decay (≈ 9·10¹⁰ ticks, effectively permanent), and the initial-concentration table contains **no entry** for 133, so every newly-hatched Norn starts with zero carb-hunger backup and builds it up purely from the active drive's overflow.

## Sources

Hunger for carb backup has two endogenous inflows (both routed from the active drive) and one external inflow. Nothing in the brain or sensorimotor system writes to it directly.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive (primary) | Gene 21 (reaction id 57) | Organ #2 "Reaction" | `1× Hunger for carbohydrate [150] → 1× Hunger for carb backup [133]` | Rate byte 18, half-life **6 ticks** (≈ 0.2 s at 30 Hz), labelled **"Very short"** — the fastest speed class |
| 2 | Self-refill from active drive (duplicate) | Gene 63 (reaction id 67) | Organ #2 "Reaction" | `1× Hunger for carbohydrate [150] → 1× Hunger for carb backup [133]` (identical formula and rate) | Rate byte 18, half-life **6 ticks**. This is an exact duplicate of gene 21 — both reactions run in parallel every tick, so the **effective decay of [150] into [133] is doubled**: the per-tick loss of active-drive mass to the reservoir is `1 − 0.88978² ≈ 0.2083` rather than the single-reaction `0.1102` observed for the protein pair |
| 3 | External CAOS injection | — | Any | `CHEM 133 <n>` on a targeted creature from a script, bootstrap agent, or the debug console | One-shot; effectively permanent because the chemical's own half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | Constant background hunger via the drive | Gene 16 (emitter id 4) → reactions 57 & 67 | Sensorimotor tissue → bloodstream | The sensorimotor emitter at `LOC_CONST` constantly writes chemical 150 (`Hunger for carbohydrate`) at rate 35, gain 2. Because the two self-refill reactions immediately siphon most of that active-drive production into the backup, the steady-state result is that the backup grows over time — this is the "metabolism clock" behind carb hunger | Indirect; the active drive rises at a constant 35/tick × 2/gain and ≈21 % of it is pulled into 133 every tick |
| 5 | No pain spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`), there is **no `Pain → Hunger for carb backup` reaction** in the stock genome. Carb hunger is therefore wholly decoupled from injury and pain history | — |
| 6 | No direct emitter | — | — | The emitter table contains **no** entry whose target chemical is 133. All inflow to 133 comes from reactions that consume chemical 150 | — |
| 7 | No initial concentration | — | — | The `initialConcentrations` block has no entry for chemical 133, so every Norn hatches with exactly 0 units of carb-hunger backup. The reservoir is built up entirely during the creature's own lifetime (contrast with the active drive 150, which hatches at 13/255 ≈ 0.051) | — |
| 8 | Modded genomes | User-added | User-added | Breeders can add emitters keyed to custom "carbohydrate memory" lobes, wire in a missing `Pain → Hunger for carb backup` spillover to mirror the protein pair, or remove one of the duplicate self-refill reactions to bring the carb pair in line with the other backups | Gene-dependent |

## Usage

Hunger for carb backup has exactly **one consumer** — reaction 44 — and one passive characteristic (its essentially infinite half-life). Like all drive backups it has no direct receptor.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 9 (reaction id 44) | Organ #2 "Reaction" | `1× Hunger for carb backup [133] → 1× Hunger for carbohydrate [150]` at rate byte 58, half-life **311 ticks** (≈ 10 s at 30 Hz), labelled **"Medium"** | Every backup unit slowly becomes an active-drive unit at a medium rate. Combined with the two **"Very short"** (6-tick) reverse reactions, this produces a damped equilibrium in which the two chemicals constantly exchange at a ratio tilted even more heavily toward the backup than the protein pair — at steady state, `[133] / [150] ≈ 0.2083 / 0.00223 ≈ 93.4`, so **roughly 99 % of the loop's mass sits in the backup** |
| 2 | Passive decay (effectively none) | Gene 64 entry #133 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | A Hunger-for-carb-backup pool persists indefinitely unless it is drained by reaction 44. All sixteen drive backups share this near-infinite half-life by design; the chemical's role is to act as a reservoir, not a signal, so it must not decay on its own |
| 3 | No receptor | — | — | Hunger for carb backup is **not read by any stock receptor**. No drive, brain lobe, locus, or organ reads its concentration — the creature has no direct sensory awareness of the pool. Only the *active* drive at chemical 150 is read (on Drives tissue locus 2, gain **255**, and on Circulatory tissue locus 5, digital at threshold 214, switched on at Youth) | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 133 | — |
| 5 | Modded consumers | User-added | User-added | Modders can add a "carb-memory" receptor (reading the slow-moving backup rather than the bouncing active drive) to feed a chronic-hunger neuron, or gate reaction 44 with an enzyme catalyst so that banked carb hunger is only released when a specific metabolic signal fires (e.g. when blood Glucose runs low) | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Hunger-for-carbohydrate drive the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **133** | **Hunger for carb backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 150 | Hunger for carbohydrate | ~9·10¹⁰ ticks ("Very long") | 13/255 ≈ 0.051 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 9 (id 44) | `Hunger for carb backup → Hunger for carbohydrate` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 21 (id 57) | `Hunger for carbohydrate → Hunger for carb backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (fast self-refill) |
| Gene 63 (id 67) | `Hunger for carbohydrate → Hunger for carb backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Duplicate** active → backup (second parallel pull) |

Neither chemical decays on its own (both are "Very long" in the half-life table). The two chemicals therefore behave as a **closed two-compartment system** that only gains mass from two sources — the constant sensorimotor emitter on chemical 150 and any external `CHEM` injection — and only loses mass when active Hunger for carbohydrate is *consumed* by the creature's metabolism (by the digestion of food, which is a different set of reactions outside the 133/150 loop itself).

### Why the duplicate self-refill matters

Of all sixteen drive-backup pairs in the 131–146 / 148–161 block, the carb pair is the **only one with two identical self-refill reactions**. Gene 21 and gene 63 both encode exactly the same formula at exactly the same rate:

```
  Gene 21 → Reaction 57 : 1× [150] → 1× [133]  (Very short, halflife 6 ticks)
  Gene 63 → Reaction 67 : 1× [150] → 1× [133]  (Very short, halflife 6 ticks)
```

Because the biochemistry engine runs each reaction independently per tick, the two reactions compose multiplicatively. The fraction of active drive surviving one tick is `0.88978² ≈ 0.79172`, so about **21 %** of active carb hunger is pulled into the reservoir every tick — roughly double the protein pair's ~11 %.

Whether the duplication is a deliberate designer's tuning or a shipped-genome accident is unclear (the same "gene 20 → gene 21" symmetry that puts `Pain → 132` at gene 20 would suggest gene 21 should have been a pain spillover into the carb backup, by symmetry with gene 20's pain spillover into the protein backup — so a plausible interpretation is that someone noticed there was no "pain → carbs" relationship desired and simply replaced gene 21 with a copy of gene 63). Whatever the origin, the observable gameplay consequence is that the carb pair buffers faster and more completely than the protein pair:

- **Active carb hunger reacts more sluggishly to CHEM injections** than active protein hunger — any `CHEM 150 <n>` spike is absorbed into the reservoir in roughly half the time.
- **A single piece of sweet food produces a longer satiety window for carb hunger** than for protein hunger, because the Medium-speed release from the reservoir is competing with a doubly-fast absorption.
- **The steady-state mass ratio is higher** (~99:1 backup:active instead of ~49:1). A Norn that has been alive for an hour and has never eaten sweet food has an even larger invisible carb-hunger reservoir than an equivalent protein-hunger reservoir, which makes neglected-Norn carb hunger particularly stubborn to satisfy.

### Why the asymmetric half-lives matter (the "buffer" behaviour)

The `backup → drive` reaction is classified as "Medium" (311-tick half-life) and the `drive → backup` reactions are classified as "Very short" (6-tick half-life each). That ratio — now compounded by duplication — makes the backup behave as a **very effective low-pass filter** on the drive. Consider what happens when the creature eats a honeycomb, a piece of fruit, or any other sweet food (triggering a script that consumes some active Hunger for carbohydrate):

1. **Tick 0:** The food script reduces `Hunger for carbohydrate [150]` by some amount. The active drive falls sharply.
2. **Ticks 1–50:** Because the `backup → drive` reaction is slow (311-tick half-life), only a small trickle of the banked reservoir enters the active drive each tick. The drive stays low for several seconds — the Norn feels satisfied.
3. **Ticks 50–300:** Over the next few seconds, reaction 44 continues to drip-feed from the large reservoir. The active drive slowly climbs back toward its equilibrium value.
4. **Ticks 300+:** Once the active drive recovers, reactions 57 and 67 *both* kick in and quickly (effective 3-tick half-life, since two parallel Very-short reactions compose) pull any excess back into the reservoir. Equilibrium is restored.

Conversely, when something injects a lot of active drive *rapidly* (e.g. `STIM WRIT <creature> ...` on a carb-hunger stim, or a modded emitter pulse), the paired reactions aggressively pull most of that injection into the backup, so the visible Drives bar spikes only very briefly. The duplicated-pump carb backup is therefore the **best surge absorber** in the whole backup block.

### Contrast with the protein pair (132) and why there is no pain cross-coupling

The protein pair and the carb pair are the first two entries in the backup block and are wired with an obvious parallel structure — except for two asymmetries:

| Feature | Hunger for protein (149 / 132) | Hunger for carbohydrate (150 / 133) |
|--------|--------------------------------|-------------------------------------|
| Active → backup refill reactions | **One** (gene 62 / reaction 66) | **Two duplicates** (genes 21 and 63 / reactions 57 and 67) |
| Pain cross-coupling | **Yes** — gene 20 writes `Pain → [132]`, Very short | **No** — carb backup is decoupled from injury |
| Sensorimotor emitter rate | 30 units/tick, gain 2 | 35 units/tick, gain 2 — a ~17 % stronger base pressure |
| Drives-tissue receptor gain | 209/255 | **255/255** — carb hunger pushes the decision neurons harder per unit |
| Circulatory critical-alarm receptor | Active from Baby (threshold 214, digital) | Active from **Youth (age 3)** only |
| Circulatory positive feedback | Yes (emitter id 11, threshold 128 on locus 8) | **None** — no metabolic feedback emitter |
| Active-drive initial concentration | 33/255 ≈ 0.129 | 13/255 ≈ 0.051 (about 40 % of protein's starting value) |

Together these differences mean that carb hunger is a **much simpler, cleaner-shaped drive signal** than protein hunger: it's not confounded by pain events, it doesn't get a secondary kick from a circulatory feedback loop, but its base pressure is stronger and its brain reads it at maximum gain. A baby Norn hatches with less starting carb hunger than protein hunger (0.051 vs 0.129) and has no critical-carb-hunger alarm until it grows into Youth, so in the first life stage the carb drive is essentially a smooth, slowly-growing "I want sweet food" signal with no emergency spikes. This is consistent with the in-game observation that very young Norns rarely seem frantic about sweet food even when neglected.

Pain-wise, because there is no `Pain → 133` reaction, a hurt Norn does **not** develop a craving for sweet food in the way it develops a craving for protein. Injury strictly feeds the protein reservoir, never the carb reservoir. This is one of the more legible parts of the stock genome's drive wiring: pain biases eating toward meat/cheese, not toward honey.

### Steady-state analysis

At equilibrium (ignoring consumption at the brain-facing drives receptor), the 133/150 loop reaches balance when inflow from the sensorimotor emitter equals outflow through the duplicated self-refill. Using the same approach as for the protein pair:

- The sensorimotor emitter on chemical 150 (`LOC_CONST`, rate 35, gain 2) writes approximately **70 units per tick** into active Hunger for carbohydrate.
- The combined reactions 57 and 67 pull mass out of 150 at rate `(1 − 0.88978²) × [150] ≈ 0.2083 × [150]` per tick.
- Reaction 44 pulls mass out of 133 at rate `(1 − 0.99777) × [133] ≈ 0.00223 × [133]` per tick.

Setting the two internal flows equal (the backup and active drive must exchange at equal rates in a steady loop):

```
[133] / [150] ≈ 0.2083 / 0.00223 ≈ 93.4
```

So roughly **99 % of the carb-hunger loop's mass sits in the backup** at rest, and **~1 % sits in the active drive**. A Norn that has been alive for an hour and has never eaten will have a huge invisible carb-hunger reservoir, even larger in proportional terms than its protein-hunger reservoir (~99:1 vs ~49:1), which explains why weaning a neglected Norn onto sweet food is particularly slow.

### What the active drive does that the backup cannot

Because chemical 133 has no receptor, every behavioural effect of carb hunger is mediated through chemical 150:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #3 | Creature / Drives (tissue 5) / locus 2 "Hunger for carbohydrate" | threshold 0, gain **255**, analogue | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows. The gain 255 is the **maximum** possible, meaning the brain reads carb hunger at full sensitivity |
| Circulatory receptor #162 | Creature / Circulatory (tissue 1) / locus 5 | threshold 214, gain 255, **DIGITAL (all-or-nothing)**, switch-on age **Youth** | A **critical-hunger alarm** that fires only when active hunger is very high (>83 % of the chemical's range) **and** only once the Norn is at least in the Youth life stage. Whatever physiological signal this locus controls turns on as a hard threshold for adolescent and older Norns, but is inactive in babies |

None of these read the backup, so the reservoir's role is entirely to *buffer* the active drive, not to contribute any new signal. Notably, unlike the protein pair, **there is no circulatory positive-feedback emitter** on chemical 150 — so carb hunger does not self-amplify via blood-sugar signals the way protein hunger does via its secondary circulatory emitter. The carb drive is therefore a purely "metabolism-clock" drive driven by its constant LOC_CONST emitter, with no additional physiological modulation.

### Effects of directly filling Hunger for carb backup

A `CHEM 133 <n>` injection produces a characteristic *slow-burn hunger* profile because of the asymmetric reaction speeds — and the asymmetry is even more extreme than for the protein pair:

1. **Tick 0:** `CHEM 133 <n>` is called. Backup rises to *n*, active drive unchanged.
2. **Ticks 1–311:** Reaction 44 drip-feeds the backup into active Hunger for carbohydrate at 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–3:** Simultaneously, reactions 57 and 67 at their combined ~3-tick effective half-life aggressively pull that newly-active drive *back* into the backup. For the first few seconds, almost everything that leaves the reservoir via reaction 44 returns via the paired pumps.
4. **Equilibrium:** The system re-establishes the ~93:1 ratio — virtually all of the injected mass ends up staying in the backup, with only about 1 % visible in the active drive at any given time.
5. **Slow discharge:** The backup slowly shrinks over the following minutes as the active drive is consumed (by the Drives-tissue receptor feeding into decision neurons, by food-eating scripts, etc.). The creature experiences a very long, quiet period of elevated carb hunger rather than any sharp spike.

This makes `CHEM 133 <n>` the canonical way for a script to simulate a **sustained long-term carbohydrate deficit** — e.g. after a long journey, during a diet-restriction challenge, or as part of a scenario where a Norn slowly accumulates a sweet tooth it cannot satisfy.

### Interaction with food consumption

In-game food items don't all reduce carb hunger the same way. A script that plays a food-eating animation for sugary food typically ends with a call that *consumes* some amount of chemical 150 (active Hunger for carbohydrate) via a CAOS `CHEM` injection with a negative amount. Because only the active drive is touched, the backup is unaffected and continues to drip-feed. A Norn that has just eaten a sweet food will feel less carb-hungry for ~10 s (one half-life of reaction 44) and then gradually resume interest as the reservoir refills the drive.

Creature-tending scripts that want to fully "reset" a Norn's carb hunger must zero **both** chemicals explicitly: `CHEM 150 -255` (drain active drive) followed by `CHEM 133 -255` (drain backup). Because the carb pair's self-refill is doubled, forgetting the second call is an even more common source of the complaint that "feeding my Norn didn't do anything" than it is for protein — the single honeycomb or fruit is consumed nearly instantly by the paired pumps, and the very large reservoir dominates behaviour within seconds.

### Implications for modders

Common modifications built on top of chemical 133:

1. **Add a "carb-memory" receptor on a custom lobe.** Because 133 changes on a minute-scale timescale while 150 bounces on a sub-second timescale, a lobe reading the backup gives the brain access to *chronic* sweet-food deficit rather than *acute* carb-hunger events. A "learns which sweet foods satisfy long-term" Norn mod typically adds such a receptor.
2. **Remove the duplicate self-refill (gene 21 or gene 63).** Reducing the carb pair to a single self-refill brings it into line with the other fifteen backups and cuts the active-drive absorption rate roughly in half. This makes sweet food visibly more satisfying in the short term because the Drives bar will actually stay down for longer. It's a popular "make feeding feel rewarding" tweak.
3. **Add a `Pain → Hunger for carb backup` reaction** (mirroring gene 20's `Pain → 132`) to give pain a partial spillover into carb cravings too, so that a hurt Norn seeks both meat and sweet food. This is a thematic tweak that some breeders prefer for more "biological" injury behaviour.
4. **Change reaction 44's rate byte** (from 58/Medium to a higher value like 128/Short) to make the reservoir release its contents faster — a Norn that "metabolises" carb hunger more quickly, with less pronounced satiety windows.
5. **Add a catalyst to reaction 44**, for example `Hunger for carb backup + (low-Glucose signal) → Hunger for carbohydrate + (low-Glucose signal)`, to gate the backup's release on blood sugar. This lets a modded creature simulate "carb hunger that only emerges when blood glucose is actually low" — a more realistic metabolic feedback than the stock wiring provides.
6. **Raise the initial concentration** in gene 64 so that newly-hatched Norns already carry a carb-hunger reservoir — useful for challenges that start with a "starving baby" premise. Note that unlike the active drive (which has a baseline of 13/255), the backup starts at zero in the stock genome.

Because the chemical has no receptor and the active drive already has a high-gain brain receptor, these modifications are generally safe and isolated from other body systems.

### Practical consequences for gameplay

- **`CHEM 133 <n>` simulates sustained, chronic sweet-food hunger.** Unlike `CHEM 150 <n>` (which spikes the Drives bar but is immediately absorbed back into the reservoir in ~0.1 s by the duplicated pumps), injecting into the backup produces a drawn-out hunger that takes minutes to fully drain.
- **Hunger for carb backup is invisible to Norn-care tools that monitor chemical 150.** A Norn can have a large reservoir of banked carb hunger while its visible carb-hunger bar reads moderate. Tools like the Science Kit's full chemical list will show it, but the default Drives view will not.
- **Feeding a Norn does not empty the reservoir.** Every honeycomb, fruit, or sweet food consumes active drive only. To truly "solve" a long-standing carb hunger, either the backup has to be drained externally (`CHEM 133 -n`) or the creature has to keep eating over many minutes while the paired pumps are prevented from replenishing the reservoir. This is visibly harder for carb hunger than for protein hunger because of the duplicated self-refill.
- **Pain events do NOT raise the carb-hunger reservoir.** Unlike protein hunger, carb hunger is completely decoupled from injury. A repeatedly slapped Norn will develop protein cravings but not sweet-food cravings — the two food-seeking patterns are genetically distinct.
- **Newly-hatched Norns start with zero backup but non-zero active drive.** The reservoir takes several minutes of in-game time to build up from the constant sensorimotor emitter's output. Very young Norns have a small-but-real baseline carb hunger (from the initial 13/255 in chemical 150) that is easily satisfied with a single feed, while older Norns — carrying a large invisible reservoir — are much harder to satiate.
- **Baby Norns have no critical-carb-hunger alarm.** The Circulatory locus-5 digital receptor switches on only at Youth (age 3). Before that, severe carb hunger has no emergency signal — the Norn simply feels a steadily increasing drive via the analogue Drives receptor. Past Youth, very high active carb hunger will trigger whatever the locus-5 signal controls (likely a metabolic distress response) as a binary alarm.

### Summary

```
 Stock-genome wiring of Hunger for carb backup [133]
 ──────────────────────────────────────────────────────
 Inputs:
    Hunger for carbohydrate [150] ─ reaction 57 (gene 21) ──▶ [133]
                                    half-life 6 ticks ("Very short")

    Hunger for carbohydrate [150] ─ reaction 67 (gene 63) ──▶ [133]
                                    half-life 6 ticks ("Very short")
                                    (DUPLICATE of reaction 57)

    CHEM 133 <n>  (CAOS / scripts / mods)  ───────────────────▶ [133]

    (No pain cross-coupling — unlike chemical 132)

 Reservoir:
         Hunger for carb backup [133]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                        │
                        │ reaction 44 (gene 9):  1× [133] → 1× [150]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Hunger for carbohydrate [150]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent — loop is near-conservative)
         initial concentration: 13/255 ≈ 0.051 (non-zero at hatch)
                        │
                        ├─► Drives tissue locus 2 (gain 255) ─────▶ decision-lobe "carb-hunger" bar
                        │                                          (maximum-gain brain reader)
                        ├─► Circulatory locus 5 (thresh 214, digital, gain 255,
                        │                         switch-on age Youth) ───▶ critical-hunger alarm
                        │                                          (inactive in babies)
                        ├─► (Sensorimotor LOC_CONST emitter feeds 150 continuously at rate 35, gain 2)
                        │                                          (no circulatory feedback emitter)
                        │
                        └─► reactions 57 & 67 back into [133]  (doubled fast self-refill)
```

Hunger for carb backup is therefore a **heavily-buffered fully-wired drive backup** — a long-lived reservoir paired with its active drive via three opposing reactions (one release, two identical pumps) of very different speeds. Compared to its sibling Hunger for protein backup (132), it is more aggressively self-refilling (effective ~21 % per-tick absorption rather than ~11 %), has no pain cross-coupling, and feeds an active drive that the brain reads at maximum gain but whose critical-alarm receptor only activates after infancy. The net effect in the stock Norn genome is a **cleanly-shaped, strongly-buffered sweet-food drive** that is decoupled from injury, grows steadily throughout the Norn's life, and requires sustained feeding — not single meals — to genuinely satisfy.
