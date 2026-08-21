# 132 - Hunger for protein backup

Hunger for protein backup is the **reservoir half** of the drive pair for *Hunger for protein* (chemical 149). It sits in the second slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slow-release pool of the creature's "banked" protein hunger so that the **acute** signal (the current, felt urge to eat protein) and the **chronic** signal (the deeper, slower-moving metabolic deficit) can be modulated independently. With its essentially infinite half-life, whatever the creature has accumulated in its protein-hunger reservoir persists across many minutes of play unless actively drained by the `backup → drive` reaction.

Unlike the vestigial **Pain backup** (131), the Hunger-for-protein backup is **fully plumbed** in the stock Creatures 3 / Docking Station Norn genome: it has a drain (reaction 43: `Hunger for protein backup → Hunger for protein`, "Medium" speed), a self-refill (reaction 66: `Hunger for protein → Hunger for protein backup`, "Very short" speed), **and** a secondary cross-coupling inflow from the Pain drive (reaction 56: `Pain → Hunger for protein backup`, "Very short" speed). Together these three reactions form a small auto-balancing loop in which active Hunger for protein and its backup continuously exchange molecules, while every pain event adds an extra drip of "hungry for protein later" into the reservoir. That cross-coupling is why a sustained injury makes a Norn not only limp but also eventually head for the vendors — the stock genome literally wires pain into a long-term craving for protein.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its only entry in the half-life table records a "Very long" decay (≈ 9·10¹⁰ ticks, effectively permanent), and the initial-concentration table contains **no entry** for 132, so every newly-hatched Norn starts with zero protein-hunger backup and builds it up purely from the active drive's overflow.

## Sources

Hunger for protein backup has two **endogenous** inflows and one **external** inflow. All of them route through the same product slot in the chemistry table (chemical 132); nothing in the brain or sensorimotor system writes to it directly.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive | Gene 62 (reaction id 66) | Organ #2 "Reaction" | `1× Hunger for protein [149] → 1× Hunger for protein backup [132]` | Rate byte 18, half-life **6 ticks** (≈ 0.2 s at 30 Hz), labelled **"Very short"** — the fastest speed class. Every unit of active protein hunger is aggressively pulled back into the reservoir almost as soon as it appears |
| 2 | Cross-coupling from Pain drive | Gene 20 (reaction id 56) | Organ #2 "Reaction" | `1× Pain [148] → 1× Hunger for protein backup [132]` | Rate byte 18, half-life **6 ticks** (≈ 0.2 s). Any active Pain in the bloodstream rapidly becomes protein-hunger memory. This is the stock genome's "injured Norn gets hungry for protein" wiring — mirrored by no corresponding `Pain → Pain backup` reaction, which makes chemical 132 the sole beneficiary of the Pain drive's decay |
| 3 | External CAOS injection | — | Any | `CHEM 132 <n>` on a targeted creature from a script, bootstrap agent, or the debug console | One-shot; effectively permanent because the chemical's own half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | Constant background hunger via the drive | Gene 36 (emitter id 1) → reaction 66 | Sensorimotor tissue → bloodstream | The sensorimotor emitter at `LOC_CONST` constantly writes chemical 149 (`Hunger for protein`) at rate 30, gain 2. Because reaction 66 immediately siphons most of that active-drive production into the backup, the steady-state result is that the backup grows over time *even when the creature is not in pain* — this is the "metabolism clock" behind protein hunger | Indirect; the active drive rises at a constant 30/tick × 2/gain and half of it is pulled into 132 every 6 ticks |
| 5 | No direct emitter | — | — | The emitter table contains **no** entry whose target chemical is 132. All inflow to 132 comes from reactions that consume chemicals 148 or 149 | — |
| 6 | No initial concentration | — | — | The `initialConcentrations` block has no entry for chemical 132, so every Norn hatches with exactly 0 units of protein-hunger backup. The reservoir is built up entirely during the creature's own lifetime | — |
| 7 | Modded genomes | User-added | User-added | Breeders can add emitters keyed to custom "protein memory" lobes or adjust gene 62's rate to speed up or slow down how aggressively active hunger is banked | Gene-dependent |

## Usage

Hunger for protein backup has exactly **one consumer** — reaction 43 — and one passive characteristic (its essentially infinite half-life). Like all drive backups it has no direct receptor.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 8 (reaction id 43) | Organ #2 "Reaction" | `1× Hunger for protein backup [132] → 1× Hunger for protein [149]` at rate byte 58, half-life **311 ticks** (≈ 10 s at 30 Hz), labelled **"Medium"** | Every backup unit slowly becomes an active-drive unit at a medium rate. Combined with the fast **"Very short"** (6-tick) reverse reaction, this produces a damped equilibrium in which the two chemicals constantly exchange at a ratio tilted heavily toward the backup (≈ 52 : 1 at steady state, since the decay rates are 0.99777 vs 0.88978). The reservoir therefore holds roughly 50× as much material as the active drive when the system is at rest |
| 2 | Passive decay (effectively none) | Gene 64 entry #132 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | A Hunger-for-protein-backup pool persists indefinitely unless it is drained by reaction 43. All sixteen drive backups share this near-infinite half-life by design; the chemical's role is to act as a reservoir, not a signal, so it must not decay on its own |
| 3 | No receptor | — | — | Hunger for protein backup is **not read by any stock receptor**. No drive, brain lobe, locus, or organ reads its concentration — the creature has no direct sensory awareness of the pool. Only the *active* drive at chemical 149 is read (on Drives tissue locus 1, gain 209, and on Circulatory tissue locus 6, digital at threshold 214) | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 132 | — |
| 5 | Modded consumers | User-added | User-added | Modders can add a "protein-memory" receptor (reading the slow-moving backup rather than the bouncing active drive) to feed a chronic-hunger neuron, or gate reaction 43 with an enzyme catalyst so that banked protein hunger is only released when a specific metabolic signal fires | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. The general pattern is:

```
    <Drive backup>  ──(reaction, backup→drive)──▶  <Active drive>  ──(reaction, drive→backup)──▶  <Drive backup>
                                                       │
                                                       └── read by Drives-tissue receptor
                                                           (the value the brain actually sees)
```

For the Hunger-for-protein drive specifically, all three wires are present and there is also a fourth "pain spillover" inflow:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **132** | **Hunger for protein backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 149 | Hunger for protein | ~9·10¹⁰ ticks ("Very long") | 33/255 ≈ 0.13 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 8 (id 43) | `Hunger for protein backup → Hunger for protein` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 62 (id 66) | `Hunger for protein → Hunger for protein backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (fast self-refill) |
| Gene 20 (id 56) | `Pain → Hunger for protein backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Cross-coupling** (pain becomes protein-hunger memory) |

Crucially, neither chemical decays on its own (both are "Very long" in the half-life table). The two chemicals therefore behave as a **closed two-compartment system** that only gains mass from three sources — the constant sensorimotor emitter on chemical 149, the pain-spillover from chemical 148, and any external `CHEM` injection — and only loses mass when active Hunger for protein is *consumed* by the creature's metabolism (by the digestion of food, which is a different set of reactions outside the 132/149 loop itself).

### Why the asymmetric half-lives matter (the "buffer" behaviour)

The `backup → drive` reaction is classified as "Medium" (311-tick half-life) and the `drive → backup` reaction is classified as "Very short" (6-tick half-life). That 52-fold ratio is *not* an accident: it makes the backup behave as a **low-pass filter** on the drive.

Consider what happens when the creature eats a piece of cheese (triggering a CAOS script that injects some `Protein [12]` and indirectly consumes some Hunger for protein [149]):

1. **Tick 0:** The food script reduces `Hunger for protein [149]` by some amount. The active drive falls sharply.
2. **Ticks 1–50:** Because the backup → drive reaction is slow (311-tick half-life), only a small trickle of the banked reservoir enters the active drive each tick. The drive stays low for several seconds — the Norn feels satisfied.
3. **Ticks 50–300:** Over the next few seconds, reaction 43 continues to drip-feed from the large reservoir. The active drive slowly climbs back toward its equilibrium value.
4. **Ticks 300+:** Once the active drive recovers, reaction 66 kicks in and quickly (6-tick half-life) pulls any excess back into the reservoir. Equilibrium is restored.

Without the backup, a single meal would zero the Hunger for protein drive and the creature would feel "done" for no time at all (because the emitter would immediately start refilling it). With the backup, the same meal produces a **lingering feeling of satiety** because the reservoir has to slowly leak back into the drive. The backup is effectively the "memory of how hungry I was two minutes ago".

Conversely, when something injects a lot of active drive *rapidly* (e.g. `STIM WRIT <creature> ...` on a protein-hunger stim, or a modded emitter pulse), reaction 66 aggressively (6-tick half-life) pulls most of that injection into the backup, so the visible Drives bar spikes only briefly. The backup acts as a **surge absorber** for transient hunger events.

### The pain → protein-hunger cross-coupling

Of all sixteen backups in the 131–146 range, chemical 132 is the only one with an **external inflow from another drive** in the stock genome. Reaction 56 (gene 20) converts active Pain directly into Hunger for protein backup at "Very short" speed. This is conspicuously the reaction that the Pain backup (131) documentation identifies as "mis-wired" — the symmetric expectation would have been `Pain → Pain backup`, but the shipped genome reads into 132 instead.

Whether this was a deliberate design choice ("injured creatures need protein to heal") or a one-slot off-by-one coding error in the original genome, its observable consequence in gameplay is that:

- **Every pain event contributes to the creature's long-term protein-hunger reservoir.**
- **A sustained hurt Norn will eventually walk to the vendor for cheese.**
- **Pain and protein hunger are therefore loosely correlated signals** at the minute-scale timescale of the backup.

This creates some of the more "biological" Norn behaviour in Creatures 3: a slapped creature that has also been neglected will start to actively seek protein food as the pain drains through reaction 56 into the reservoir and then through reaction 43 back into the active drive. Because both reactions 56 and 66 have the same 6-tick half-life, active pain and active protein hunger contribute equally (unit-for-unit) to the reservoir.

Mod-wise, adding a `Pain → Pain backup` reaction (the "missing" refill for chemical 131, see *131 - Pain backup*) removes Pain's exclusive drain into 132 — half of the active Pain would now refill 131 instead. This is one of the easiest places to rebalance a Creatures 3 genome: a small change to the reaction table measurably reduces the correlation between injury and protein hunger.

### Steady-state analysis

At equilibrium, the amount of each chemical in the 132/149 loop can be estimated as follows (ignoring pain and consumption):

- The constant sensorimotor emitter on chemical 149 (`LOC_CONST`, rate 30, gain 2) writes approximately **60 units per tick** into active Hunger for protein.
- Reaction 66 pulls mass out of 149 at rate `(1 − 0.88978) × [149] ≈ 0.1102 × [149]` per tick.
- Reaction 43 pulls mass out of 132 at rate `(1 − 0.99777) × [132] ≈ 0.00223 × [132]` per tick.

Setting the two flows equal to a common circulating mass `Q` (inflow from emitter = outflow by consumption at the Drives receptor, not modelled here), the steady-state ratio is:

```
[132] / [149] ≈ 0.1102 / 0.00223 ≈ 49.4
```

So roughly **98 % of the loop's mass sits in the backup** at rest, and **2 % sits in the active drive**. A Norn that has been alive for an hour and has never eaten will have a huge invisible protein-hunger reservoir, which is exactly what makes weaning a neglected Norn so difficult: even a big meal barely touches the reservoir.

### What the active drive does that the backup cannot

Because chemical 132 has no receptor, every behavioural effect of protein hunger is mediated through chemical 149:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #2 | Creature / Drives (tissue 5) / locus 1 "Hunger for protein" | threshold 0, gain 209, analogue | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows |
| Circulatory receptor #161 | Creature / Circulatory (tissue 1) / locus 6 | threshold 214, gain 255, **DIGITAL (all-or-nothing)** | A **critical-hunger alarm** that fires only when active hunger is very high (>83 % of the chemical's range). Whatever physiological signal this locus controls turns on as a hard threshold, not gradually |
| Circulatory emitter #11 | Creature / Circulatory (tissue 1) / locus 8 | threshold 128, rate 12, gain 2, digital | Emits *more* Hunger for protein when a circulatory signal at locus 8 is above mid-range — this is the **positive feedback** from metabolic state back into the drive (a low blood-protein signal makes the creature hungrier) |

None of these read the backup, so the reservoir's role is entirely to *buffer* the active drive, not to contribute any new signal.

### Why gene 62 makes sense even though it "reduces" the active drive

At first glance, reaction 66 (`Hunger for protein → Hunger for protein backup`) seems counter-productive: it converts the very thing the brain can read into something the brain cannot. But the logic is the same as for all drive backups:

1. Without the backup, the active drive would rise and fall on whatever timescale the emitters and consumers dictate — usually seconds. That is too fast for a *metabolic* drive: a creature that has just eaten would, within 5 seconds, already feel ravenous again because the constant `LOC_CONST` emitter never stops.
2. With the backup, the active drive is held roughly constant at its equilibrium value (~2 % of the circulating mass), and the **reservoir** absorbs the emitter's constant writes. The creature feels "steadily hungry" rather than "hungry-not-hungry-hungry-not-hungry".
3. A meal then removes some active drive, and the equilibrium takes 10 s (one half-life of reaction 43) to re-establish — giving a plausible post-meal satiety window.

So gene 62 is the mechanism by which the backup can absorb the constant emitter pressure without the active drive running away. It is the inverse partner of gene 8.

### Comparison to the other fully-wired backups

Hunger for protein backup is representative of the **standard fully-plumbed drive backup** pattern used for most drives in the 131–146 block. For comparison:

| Backup (id) | Active drive (id) | Self-refill reaction? | Release catalyst? | Extra inflow from other drives? |
|-------------|------------------|----------------------|-------------------|--------------------------------|
| Pain backup (131) | Pain (148) | **No** (gene 20 mis-wires to 132 instead) | No (ungated) | None |
| **Hunger for protein backup (132)** | **Hunger for protein (149)** | **Yes** (gene 62) | No (ungated, reaction 43 is spontaneous) | **Yes, from Pain** (gene 20) |
| Hunger for carb backup (133) | Hunger for carbohydrate (150) | Yes (gene 63) | No | None |
| Sleepiness backup (138) | Sleepiness (155) | Yes (gene 101) | **Yes, Sleepase** (gene 102) | None |
| Tiredness backup (137) | Tiredness (154) | Yes | No | None |

Chemical 132 therefore has the **second-most-complex inbound wiring** in the backup block after Sleepiness backup (138). It lacks Sleepiness's gated release (there's no catalyst on reaction 43), but it gains the extra pain-spillover inflow that no other backup enjoys.

### Effects of directly filling Hunger for protein backup

A `CHEM 132 <n>` injection produces a characteristic *slow-burn hunger* profile because of the asymmetric reaction speeds:

1. **Tick 0:** `CHEM 132 <n>` is called. Backup rises to *n*, active drive unchanged.
2. **Ticks 1–311:** Reaction 43 drip-feeds the backup into active Hunger for protein at 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–6:** Simultaneously, reaction 66 at 6-tick half-life aggressively pulls that newly-active drive *back* into the backup. For the first few seconds, almost everything that leaves the reservoir via reaction 43 returns via reaction 66.
4. **Equilibrium:** The system re-establishes the ~49:1 ratio — most of the injected mass ends up staying in the backup, with only a small fraction visible in the active drive at any time.
5. **Slow discharge:** The backup slowly shrinks over the following minutes as the active drive is consumed (by the Drives-tissue receptor feeding into decision neurons, by food-eating scripts, etc.). The creature experiences a long, quiet period of elevated protein hunger rather than a sharp spike.

This makes `CHEM 132 <n>` the canonical way for a script to simulate a **sustained long-term protein deficit** — e.g. after a long journey, after a prolonged illness, or as part of a genetic-drift challenge where Norns slowly accumulate a craving they cannot satisfy.

### Interaction with food consumption

In-game food items don't all reduce protein hunger the same way. A script that plays a food-eating animation typically ends with a call that *consumes* some amount of chemical 149 (active Hunger for protein) via a CAOS `CHEM` injection with a negative amount. Because only the active drive is touched, the backup is unaffected and continues to drip-feed. A Norn that has overeaten protein once will eat less for ~10 s (one half-life of reaction 43) and then gradually resume interest as the reservoir refills the drive.

Creature-tending scripts that want to fully "reset" a Norn's protein hunger must zero **both** chemicals explicitly: `CHEM 149 -255` (drain active drive) followed by `CHEM 132 -255` (drain backup). Missing the second call is a common source of the complaint that "feeding my Norn didn't do anything" — the single drink/pill/injection is consumed instantly by reaction 66 and the large reservoir dominates.

### Implications for modders

Common modifications built on top of chemical 132:

1. **Add a "protein-memory" receptor on a custom lobe.** Because 132 changes on a minute-scale timescale while 149 bounces on a second-scale timescale, a lobe reading the backup gives the brain access to *chronic* hunger history rather than *acute* hunger events. A "learns which foods help long-term hunger" Norn mod typically adds such a receptor.
2. **Rewrite reaction 56 to target chemical 131 instead of 132.** This is the surgical fix for the pain-spillover cross-coupling if a breeder finds that their Norns associate pain too strongly with food-seeking. It also retroactively gives chemical 131 (Pain backup) an inbound pump, fixing its "half-wired" state.
3. **Change reaction 43's rate byte** (from 58/Medium to a higher value like 128/Short) to make the reservoir release its contents faster — a Norn that "metabolises" protein hunger more quickly, with less pronounced satiety windows.
4. **Add a catalyst to reaction 43**, for example `Hunger for protein backup + Insulin → Hunger for protein + Insulin`, to gate the backup's release on an external metabolic signal. This lets a modded creature simulate "hunger that only emerges when blood sugar is low".
5. **Raise the initial concentration** in gene 64 so that newly-hatched Norns already carry a protein-hunger reservoir — useful for challenges that start with a "starving baby" premise.

Because the chemical has no receptor and the active drive already has multiple emitters, these modifications are generally safe and isolated from other body systems.

### Practical consequences for gameplay

- **`CHEM 132 <n>` simulates sustained, chronic protein hunger.** Unlike `CHEM 149 <n>` (which spikes the Drives bar but is immediately absorbed back into the reservoir in ~0.2 s by reaction 66), injecting into the backup produces a drawn-out hunger that takes minutes to fully drain.
- **Hunger for protein backup is invisible to Norn-care tools that monitor chemical 149.** A Norn can have a large reservoir of banked hunger while its visible protein-hunger bar reads moderate. Tools like the Science Kit's full chemical list will show it, but the default Drives view will not.
- **Feeding a Norn does not empty the reservoir.** Every piece of cheese, meat, or protein-rich food consumes active drive only. To truly "solve" a long-standing protein hunger, either the backup has to be drained externally (`CHEM 132 -n`) or the creature has to keep eating over many minutes while reaction 66 is prevented from replenishing the reservoir.
- **Pain events raise the protein-hunger reservoir.** A Norn that has been repeatedly slapped, has ingested Cyanide, or has suffered an immune reaction against Antigen 7 (all of which produce active Pain) will develop a gradually-growing protein-hunger reservoir. Over the course of a long game session, this creates the "hurt creatures are also hungry" emergent pattern.
- **Newly-hatched Norns start with zero backup.** The reservoir takes several minutes of in-game time to build up from the constant sensorimotor emitter's output, which means very young Norns are easier to satisfy with a single feed than older ones — their reservoir hasn't filled yet.

### Summary

```
 Stock-genome wiring of Hunger for protein backup [132]
 ─────────────────────────────────────────────────────────
 Inputs:
    Pain [148] ────────── reaction 56 (gene 20) ──────────▶ [132]
                          half-life 6 ticks ("Very short")

    Hunger for protein [149] ─ reaction 66 (gene 62) ─────▶ [132]
                          half-life 6 ticks ("Very short")

    CHEM 132 <n>  (CAOS / scripts / mods)  ───────────────▶ [132]

 Reservoir:
         Hunger for protein backup [132]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                        │
                        │ reaction 43 (gene 8):  1× [132] → 1× [149]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Hunger for protein [149]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent — loop is near-conservative)
                        │
                        ├─► Drives tissue locus 1 (gain 209) ────▶ decision-lobe "protein-hunger" bar
                        ├─► Circulatory locus 6 (thresh 214, digital, gain 255) ▶ critical-hunger alarm
                        ├─► (Sensorimotor LOC_CONST emitter feeds 149 continuously at rate 30, gain 2)
                        ├─► (Circulatory locus 8 emitter feeds 149 at thresh 128 when blood signal high)
                        │
                        └─► reaction 66 back into [132]  (fast self-refill)
```

Hunger for protein backup is therefore the **canonical fully-wired drive backup** — a long-lived reservoir paired with its active drive via two opposing reactions of very different speeds, plus an extra cross-coupling from the Pain drive that gives the stock Norn genome its distinctive "injury-leads-to-hunger" behaviour. Unlike its sibling Pain backup (131), chemical 132 does real work every tick of a living Norn's life: it absorbs the constant sensorimotor hunger emitter, smooths the active drive's response to feeding, and slowly leaks "pain memory" into the creature's food-seeking behaviour. Of the sixteen backup chemicals in the 131–146 block, it is arguably the most behaviourally important in the stock genome.
