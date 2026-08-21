# 134 - Hunger for fat backup

Hunger for fat backup is the **reservoir half** of the drive pair for *Hunger for fat* (chemical 151). It sits in the fourth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slow-release pool of the creature's "banked" fat hunger so that the **acute** signal (the current, felt urge to eat fatty food) and the **chronic** signal (the deeper, slower-moving metabolic deficit) can be modulated independently. With its essentially infinite half-life, whatever the creature has accumulated in its fat-hunger reservoir persists across many minutes of play unless actively drained by the `backup → drive` reaction.

Like its immediate sibling **Hunger for carb backup** (133), chemical 134 is **fully plumbed** in the stock genome — it has a drain (reaction 45: `Hunger for fat backup → Hunger for fat`, "Medium" speed) and not one but **two** self-refill reactions (reactions 58 and 68, both `Hunger for fat → Hunger for fat backup` at "Very short" speed). That doubling of the self-refill pathway, shared with the carb pair (133), means **active fat hunger is pulled back into its reservoir roughly twice as aggressively as protein hunger**, giving the fat drive the same heavily-buffered feel as the carb drive. Unlike chemical 132 (the protein backup), chemical 134 has **no cross-coupling inflow** from another drive — there is no `Pain → Hunger for fat backup` reaction in the stock genome, so fat hunger is wholly decoupled from injury.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its only entry in the half-life table records a "Very long" decay (≈ 9·10¹⁰ ticks, effectively permanent), and the initial-concentration table contains **no entry** for 134, so every newly-hatched Norn starts with zero fat-hunger backup and builds it up purely from the active drive's overflow.

## Sources

Hunger for fat backup has two endogenous inflows (both routed from the active drive) and one external inflow. Nothing in the brain or sensorimotor system writes to it directly.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive (primary) | Gene 22 (reaction id 58) | Organ #2 "Reaction" | `1× Hunger for fat [151] → 1× Hunger for fat backup [134]` | Rate byte 18, half-life **6 ticks** (≈ 0.2 s at 30 Hz), labelled **"Very short"** — the fastest speed class |
| 2 | Self-refill from active drive (duplicate) | Gene 64 (reaction id 68) | Organ #2 "Reaction" | `1× Hunger for fat [151] → 1× Hunger for fat backup [134]` (identical formula and rate) | Rate byte 18, half-life **6 ticks**. This is an exact duplicate of gene 22 — both reactions run in parallel every tick, so the **effective decay of [151] into [134] is doubled**: the per-tick loss of active-drive mass to the reservoir is `1 − 0.88978² ≈ 0.2083` rather than the single-reaction `0.1102` observed for the protein pair |
| 3 | External CAOS injection | — | Any | `CHEM 134 <n>` on a targeted creature from a script, bootstrap agent, or the debug console | One-shot; effectively permanent because the chemical's own half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | Constant background hunger via the drive | Gene 29 (emitter id 3) → reactions 58 & 68 | Sensorimotor tissue → bloodstream | The sensorimotor emitter at `LOC_CONST` constantly writes chemical 151 (`Hunger for fat`) at rate 30, gain 2. Because the two self-refill reactions immediately siphon most of that active-drive production into the backup, the steady-state result is that the backup grows over time — this is the "metabolism clock" behind fat hunger | Indirect; the active drive rises at a constant 30/tick × 2/gain and ≈21 % of it is pulled into 134 every tick |
| 5 | No pain spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`), there is **no `Pain → Hunger for fat backup` reaction** in the stock genome. Fat hunger is therefore wholly decoupled from injury and pain history | — |
| 6 | No direct emitter | — | — | The emitter table contains **no** entry whose target chemical is 134. All inflow to 134 comes from reactions that consume chemical 151 | — |
| 7 | No initial concentration | — | — | The `initialConcentrations` block has no entry for chemical 134, so every Norn hatches with exactly 0 units of fat-hunger backup. The reservoir is built up entirely during the creature's own lifetime (contrast with the active drive 151, which hatches at 33/255 ≈ 0.1294) | — |
| 8 | Modded genomes | User-added | User-added | Breeders can add emitters keyed to custom "fat-memory" lobes, wire in a `Pain → Hunger for fat backup` spillover to mirror the protein pair, or remove one of the duplicate self-refill reactions to bring the fat pair in line with the other backups | Gene-dependent |

## Usage

Hunger for fat backup has exactly **one consumer** — reaction 45 — and one passive characteristic (its essentially infinite half-life). Like all drive backups it has no direct receptor.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 10 (reaction id 45) | Organ #2 "Reaction" | `1× Hunger for fat backup [134] → 1× Hunger for fat [151]` at rate byte 58, half-life **311 ticks** (≈ 10 s at 30 Hz), labelled **"Medium"** | Every backup unit slowly becomes an active-drive unit at a medium rate. Combined with the two **"Very short"** (6-tick) reverse reactions, this produces a damped equilibrium in which the two chemicals constantly exchange at a ratio tilted heavily toward the backup — at steady state, `[134] / [151] ≈ 0.2083 / 0.00223 ≈ 93.4`, so **roughly 99 % of the loop's mass sits in the backup** |
| 2 | Passive decay (effectively none) | Gene 64 entry #134 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | A Hunger-for-fat-backup pool persists indefinitely unless it is drained by reaction 45. All sixteen drive backups share this near-infinite half-life by design; the chemical's role is to act as a reservoir, not a signal, so it must not decay on its own |
| 3 | No receptor | — | — | Hunger for fat backup is **not read by any stock receptor**. No drive, brain lobe, locus, or organ reads its concentration — the creature has no direct sensory awareness of the pool. Only the *active* drive at chemical 151 is read (on Drives tissue locus 3, gain 205, and on Circulatory tissue locus 7, digital at threshold 214, switched on at Youth) | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 134 | — |
| 5 | Modded consumers | User-added | User-added | Modders can add a "fat-memory" receptor (reading the slow-moving backup rather than the bouncing active drive) to feed a chronic-hunger neuron, or gate reaction 45 with an enzyme catalyst so that banked fat hunger is only released when a specific metabolic signal fires (e.g. when blood Triglyceride runs low) | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Hunger-for-fat drive the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **134** | **Hunger for fat backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 151 | Hunger for fat | ~9·10¹⁰ ticks ("Very long") | 33/255 ≈ 0.1294 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 10 (id 45) | `Hunger for fat backup → Hunger for fat` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 22 (id 58) | `Hunger for fat → Hunger for fat backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (fast self-refill) |
| Gene 64 (id 68) | `Hunger for fat → Hunger for fat backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Duplicate** active → backup (second parallel pull) |

Neither chemical decays on its own (both are "Very long" in the half-life table). The two chemicals therefore behave as a **closed two-compartment system** that only gains mass from two sources — the constant sensorimotor emitter on chemical 151 and any external `CHEM` injection — and only loses mass when active Hunger for fat is *consumed* by the creature's metabolism (by the digestion of fatty food, which is a different set of reactions outside the 134/151 loop itself).

### Why the duplicate self-refill matters

Of the sixteen drive-backup pairs in the 131–146 / 148–161 block, the carb pair (133/150) and the **fat pair (134/151) are the only two with two identical self-refill reactions**. For the fat pair, gene 22 and gene 64 both encode exactly the same formula at exactly the same rate:

```
  Gene 22 → Reaction 58 : 1× [151] → 1× [134]  (Very short, halflife 6 ticks)
  Gene 64 → Reaction 68 : 1× [151] → 1× [134]  (Very short, halflife 6 ticks)
```

Because the biochemistry engine runs each reaction independently per tick, the two reactions compose multiplicatively. The fraction of active drive surviving one tick is `0.88978² ≈ 0.79172`, so about **21 %** of active fat hunger is pulled into the reservoir every tick — roughly double the protein pair's ~11 %.

The duplication is structurally identical to the carb pair's two refill reactions (genes 21 and 63), and the symmetry is deliberate-looking: the macronutrient drives (carb and fat) are the only two with the doubled self-refill, while protein has only the single pull. The stock-genome rationale appears to be that the body's *energy* macronutrients (sugars and lipids) need an extra-stable, extra-buffered hunger signal because they fluctuate more sharply with metabolism than protein does. Whatever the original design intent, the observable gameplay consequence is that the fat pair buffers faster and more completely than the protein pair:

- **Active fat hunger reacts more sluggishly to CHEM injections** than active protein hunger — any `CHEM 151 <n>` spike is absorbed into the reservoir in roughly half the time.
- **A single piece of fatty food produces a longer satiety window for fat hunger** than for protein hunger, because the Medium-speed release from the reservoir is competing with a doubly-fast absorption.
- **The steady-state mass ratio is higher** (~93:1 backup:active instead of ~49:1). A Norn that has been alive for an hour and has never eaten fatty food has an even larger invisible fat-hunger reservoir than an equivalent protein-hunger reservoir, which makes neglected-Norn fat hunger particularly stubborn to satisfy.

### Why the asymmetric half-lives matter (the "buffer" behaviour)

The `backup → drive` reaction is classified as "Medium" (311-tick half-life) and the `drive → backup` reactions are classified as "Very short" (6-tick half-life each). That ratio — compounded by duplication — makes the backup behave as a **very effective low-pass filter** on the drive. Consider what happens when the creature eats a piece of cheese, a slab of meat fat, or any other lipid-rich food (triggering a script that consumes some active Hunger for fat):

1. **Tick 0:** The food script reduces `Hunger for fat [151]` by some amount. The active drive falls sharply.
2. **Ticks 1–50:** Because the `backup → drive` reaction is slow (311-tick half-life), only a small trickle of the banked reservoir enters the active drive each tick. The drive stays low for several seconds — the Norn feels satisfied.
3. **Ticks 50–300:** Over the next few seconds, reaction 45 continues to drip-feed from the large reservoir. The active drive slowly climbs back toward its equilibrium value.
4. **Ticks 300+:** Once the active drive recovers, reactions 58 and 68 *both* kick in and quickly (effective ~3-tick half-life, since two parallel Very-short reactions compose) pull any excess back into the reservoir. Equilibrium is restored.

Conversely, when something injects a lot of active drive *rapidly* (e.g. `STIM WRIT <creature> ...` on a fat-hunger stim, or a modded emitter pulse), the paired reactions aggressively pull most of that injection into the backup, so the visible Drives bar spikes only very briefly. Like its sibling carb backup, the duplicated-pump fat backup is one of the **best surge absorbers** in the whole backup block.

### Contrast with the protein and carb pairs

The fat pair sits between the protein and carb pairs in the backup block and shares structural elements with each — but with its own distinctive parameter mix:

| Feature | Hunger for protein (149 / 132) | Hunger for carbohydrate (150 / 133) | Hunger for fat (151 / 134) |
|--------|--------------------------------|-------------------------------------|----------------------------|
| Active → backup refill reactions | **One** (gene 62 / reaction 66) | **Two duplicates** (genes 21 and 63) | **Two duplicates** (genes 22 and 64) |
| Pain cross-coupling | **Yes** — gene 20 writes `Pain → [132]`, Very short | None | **None** |
| Sensorimotor emitter rate | 30 units/tick, gain 2 | 35 units/tick, gain 2 | 30 units/tick, gain 2 |
| Drives-tissue receptor gain | 209/255 | 255/255 (max) | **205/255** — the lowest of the three macronutrient drives |
| Circulatory critical-alarm receptor | Active from Baby (threshold 214, digital) | Active from Youth (age 3) only | Active from **Youth (age 3)** only (id 160, threshold 214, digital) |
| Circulatory positive feedback | Yes (emitter id 11, threshold 128 on locus 8) | None | **None** |
| Active-drive initial concentration | 33/255 ≈ 0.129 | 13/255 ≈ 0.051 | **33/255 ≈ 0.129** — same starting deficit as protein |

In summary: fat hunger is wired most similarly to **carb hunger** in its reservoir dynamics (same duplicated self-refill, same lack of pain coupling, same youth-gated critical alarm) but most similarly to **protein hunger** in its baseline pressure and starting state (same sensorimotor emitter rate of 30, same initial concentration of 33). It has the **lowest Drives-receptor gain** of the three macronutrient drives, meaning that for any given concentration of active fat hunger, the brain's decision-lobe drive bar reads a slightly weaker signal than the equivalent protein- or carb-hunger bar — which makes fat hunger the gentlest of the three macronutrient drives in normal play.

### Steady-state analysis

At equilibrium, the amount of each chemical in the 134/151 loop can be estimated as follows (ignoring consumption):

- The constant sensorimotor emitter on chemical 151 (`LOC_CONST`, rate 30, gain 2) writes approximately **60 units per tick** into active Hunger for fat.
- Reactions 58 and 68 together pull mass out of 151 at rate `(1 − 0.88978²) × [151] ≈ 0.2083 × [151]` per tick.
- Reaction 45 pulls mass out of 134 at rate `(1 − 0.99777) × [134] ≈ 0.00223 × [134]` per tick.

Setting the two flows equal to a common circulating mass `Q`, the steady-state ratio is:

```
[134] / [151] ≈ 0.2083 / 0.00223 ≈ 93.4
```

So roughly **99 % of the loop's mass sits in the backup** at rest, and **1 % sits in the active drive** — exactly the same ratio as the carb pair, and roughly twice as backup-heavy as the protein pair. A Norn that has been alive for an hour and has never eaten a fatty food will have a huge invisible fat-hunger reservoir that the Drives bar barely reflects, which is exactly what makes weaning a neglected Norn off chronic hunger so difficult: even a big meal barely touches the reservoir.

### What the active drive does that the backup cannot

Because chemical 134 has no receptor, every behavioural effect of fat hunger is mediated through chemical 151:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #4 | Creature / Drives (tissue 5) / locus 3 "Hunger for fat" | threshold 0, gain 205, analogue | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows as the "Hunger for fat" bar |
| Circulatory receptor #160 | Creature / Circulatory (tissue 1) / locus 7 | threshold 214, gain 255, **DIGITAL (all-or-nothing)**, switched on at **Youth (age 3)** | A **critical-hunger alarm** that fires only when active hunger is very high (>83 % of the chemical's range) **and** the creature has reached the Youth life stage. Whatever physiological signal this locus controls turns on as a hard threshold, not gradually; baby and child Norns do not have this alarm wired in yet |

None of these read the backup, so the reservoir's role is entirely to *buffer* the active drive, not to contribute any new signal. Notably, **fat hunger has no circulatory positive-feedback emitter** like the one the protein drive enjoys (emitter 11, on Circulatory locus 8): there is no metabolic loop that detects low blood fat and emits more Hunger for fat in response. Active fat hunger therefore rises *only* from the constant sensorimotor pressure, without any extra acceleration from the body's circulatory state.

### Why the duplicate gene 64 makes sense even though it "reduces" the active drive

At first glance, reaction 68 (`Hunger for fat → Hunger for fat backup`, the duplicate of reaction 58) seems redundant: it converts the very thing the brain can read into something the brain cannot, and it does so on top of an already-aggressive single pull from reaction 58. But the logic is the same as for all drive backups — only doubled:

1. Without the backup, the active drive would rise and fall on whatever timescale the emitters and consumers dictate — usually seconds. That is too fast for a *metabolic* drive: a creature that has just eaten a fatty meal would, within 5 seconds, already feel hungry again because the constant `LOC_CONST` emitter never stops.
2. With a single backup pull, the active drive equilibrates at ~2 % of the circulating mass (as the protein pair does). For fat hunger — a slower-metabolised macronutrient in real life and in the game's chemistry — the designers seem to have wanted an even quieter active drive, so the second refill reaction reduces the active-drive equilibrium to ~1 % of the loop's mass.
3. A meal then removes some active drive, and the equilibrium takes 10 s (one half-life of reaction 45) to re-establish — giving a plausible post-meal satiety window that lasts noticeably longer than for protein because the backup has to fight against both reactions 58 and 68 to refill.

So gene 64's duplicate is the mechanism by which the backup can absorb the constant emitter pressure with even more headroom and produce a particularly stable, slow-moving fat-hunger signal. It is the doubled inverse partner of gene 10.

### Effects of directly filling Hunger for fat backup

A `CHEM 134 <n>` injection produces a characteristic *very-slow-burn hunger* profile because of the asymmetric reaction speeds and the doubled refill:

1. **Tick 0:** `CHEM 134 <n>` is called. Backup rises to *n*, active drive unchanged.
2. **Ticks 1–311:** Reaction 45 drip-feeds the backup into active Hunger for fat at 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–6:** Simultaneously, reactions 58 and 68 at 6-tick half-life each aggressively pull that newly-active drive *back* into the backup. For the first few seconds, almost everything that leaves the reservoir via reaction 45 returns via the duplicated refill.
4. **Equilibrium:** The system re-establishes the ~93:1 ratio — the vast majority of the injected mass ends up staying in the backup, with only a small fraction visible in the active drive at any time.
5. **Slow discharge:** The backup slowly shrinks over the following minutes as the active drive is consumed (by the Drives-tissue receptor feeding into decision neurons, by food-eating scripts, etc.). The creature experiences a long, quiet period of elevated fat hunger rather than a sharp spike.

This makes `CHEM 134 <n>` the canonical way for a script to simulate a **sustained long-term fat deficit** — e.g. after a long fast, a metabolic challenge, or a genetic-drift scenario where Norns slowly accumulate a craving for fatty food they cannot satisfy.

### Interaction with food consumption

In-game food items don't all reduce fat hunger the same way. A script that plays a food-eating animation typically ends with a call that *consumes* some amount of chemical 151 (active Hunger for fat) via a CAOS `CHEM` injection with a negative amount. Because only the active drive is touched, the backup is unaffected and continues to drip-feed. A Norn that has overeaten fat once will eat less fatty food for ~10 s (one half-life of reaction 45) and then gradually resume interest as the reservoir refills the drive.

Creature-tending scripts that want to fully "reset" a Norn's fat hunger must zero **both** chemicals explicitly: `CHEM 151 -255` (drain active drive) followed by `CHEM 134 -255` (drain backup). Missing the second call is the same common source of "feeding my Norn didn't do anything" complaints described in the protein-backup documentation — the single drink/pill/injection is consumed instantly by the doubled refill (reactions 58 and 68) and the very large reservoir dominates.

### Implications for modders

Common modifications built on top of chemical 134:

1. **Add a "fat-memory" receptor on a custom lobe.** Because 134 changes on a minute-scale timescale while 151 bounces on a second-scale timescale, a lobe reading the backup gives the brain access to *chronic* fat-hunger history rather than *acute* events. A "remembers which foods are fatty" Norn mod typically adds such a receptor.
2. **Remove either gene 22 or gene 64.** Deleting one of the duplicate refill reactions brings the fat pair in line with the protein pair (single-pull, ~49:1 ratio, ~11 %/tick refill). This makes fat hunger less stable and more reactive to feeding events — useful for mods that want a livelier "snacker" Norn.
3. **Add a `Pain → Hunger for fat backup` reaction**, mirroring gene 20's pain spillover into the protein backup. This wires injury into long-term fat craving, giving hurt creatures a tendency to seek high-energy food. Sensible for "heal-by-eating-fat" mods.
4. **Change reaction 45's rate byte** (from 58/Medium to a higher value like 128/Short) to make the reservoir release its contents faster — a Norn that "metabolises" fat hunger more quickly, with shorter and less pronounced satiety windows.
5. **Add a catalyst to reaction 45**, for example `Hunger for fat backup + Glycogen → Hunger for fat + Glycogen`, to gate the backup's release on an external metabolic signal. This lets a modded creature simulate "fat hunger that only emerges when stored carbs are low".
6. **Add a circulatory positive-feedback emitter** (mirroring emitter id 11 for protein hunger) that writes more Hunger for fat when a metabolic locus signals low blood Triglyceride. This restores parity with the protein drive's "blood signal accelerates hunger" mechanism.
7. **Raise the initial concentration** by adding a 134 entry to the initialConcentrations block so newly-hatched Norns already carry a fat-hunger reservoir — useful for "starving baby" challenge scenarios.

Because the chemical has no receptor and the active drive already has multiple writers, these modifications are generally safe and isolated from other body systems.

### Practical consequences for gameplay

- **`CHEM 134 <n>` simulates sustained, chronic fat hunger.** Unlike `CHEM 151 <n>` (which spikes the Drives bar but is immediately absorbed back into the reservoir in ~0.1 s by the doubled refill), injecting into the backup produces a drawn-out hunger that takes minutes to fully drain.
- **Hunger for fat backup is invisible to Norn-care tools that monitor chemical 151.** A Norn can have a large reservoir of banked hunger while its visible fat-hunger bar reads moderate. Tools like the Science Kit's full chemical list will show it, but the default Drives view will not.
- **Feeding a Norn does not empty the reservoir.** Every piece of cheese, fatty meat, or lipid-rich food consumes active drive only. To truly "solve" a long-standing fat hunger, either the backup has to be drained externally (`CHEM 134 -n`) or the creature has to keep eating over many minutes while reactions 58 and 68 are prevented from replenishing the reservoir.
- **Pain events do *not* raise the fat-hunger reservoir.** Unlike the protein pair, where every slap or immune response gradually fills 132, the fat backup is wholly insulated from injury. A Norn that has been hurt for hours will not develop a fat craving as a side effect.
- **Babies and children have no critical-fat-hunger alarm.** The youth-gated circulatory receptor (id 160) only switches on at age 3, so for the first two life stages active fat hunger has no emergency response — only the analogue Drives-receptor signal exists. Baby Norns therefore appear less frantic about fatty food than youth/adult Norns at equivalent hunger levels.
- **Newly-hatched Norns start with zero backup** but with active drive at 0.1294 (33/255), the same as protein. The reservoir takes several minutes of in-game time to build up from the constant sensorimotor emitter's output, which means very young Norns are easier to satisfy with a single fatty feed than older ones — their reservoir hasn't filled yet.

### Summary

```
 Stock-genome wiring of Hunger for fat backup [134]
 ─────────────────────────────────────────────────────
 Inputs:
    Hunger for fat [151] ─ reaction 58 (gene 22) ────────▶ [134]
                          half-life 6 ticks ("Very short")

    Hunger for fat [151] ─ reaction 68 (gene 64) ────────▶ [134]
                          half-life 6 ticks ("Very short")
                          (DUPLICATE — gives doubled refill rate)

    CHEM 134 <n>  (CAOS / scripts / mods)  ──────────────▶ [134]

    (No pain spillover; no emitter writes to 134 directly)

 Reservoir:
         Hunger for fat backup [134]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                        │
                        │ reaction 45 (gene 10):  1× [134] → 1× [151]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Hunger for fat [151]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent — loop is near-conservative)
         initial concentration: 33/255 ≈ 0.1294
                        │
                        ├─► Drives tissue locus 3 (gain 205) ─────▶ decision-lobe "fat-hunger" bar
                        ├─► Circulatory locus 7 (thresh 214, digital, gain 255, Youth+) ▶ critical-hunger alarm
                        ├─► (Sensorimotor LOC_CONST emitter feeds 151 continuously at rate 30, gain 2)
                        │
                        └─► reactions 58 & 68 back into [134]  (doubled fast self-refill)
```

Hunger for fat backup is therefore the **second of two macronutrient drive backups with a duplicated self-refill** (the other being Hunger for carb backup, 133). Together with the carb pair it forms the heavily-buffered "energy macronutrient" pole of the hunger system, sitting between the more reactive protein-hunger pair and the simpler purely-decay drives further down the backup block. Of the sixteen backup chemicals in the 131–146 block, chemical 134 is one of the most stable: it absorbs more of the active drive per tick than any other backup except its carb sibling, and once filled it leaks back into the active drive only at a Medium pace — making fat hunger the smoothest, slowest-changing macronutrient hunger signal in the stock Norn genome.
