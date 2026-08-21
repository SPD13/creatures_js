# 135 - Coldness backup

Coldness backup is the **reservoir half** of the drive pair for *Coldness* (chemical 152). It occupies the fifth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slow-release pool of the creature's "banked" coldness so that the **acute** signal — the value the brain reads and "feels" as being cold — and the **chronic** signal — the deeper, slower-moving thermal load built up over minutes of exposure — can evolve on different timescales. With its essentially infinite half-life, whatever the creature has accumulated in its coldness reservoir persists across many minutes of play unless actively drained by the `backup → drive` reaction.

Unlike the four hunger backups immediately before it (131 Pain backup, 132 Hunger-for-protein backup, 133 Hunger-for-carb backup, 134 Hunger-for-fat backup), chemical 135 sits behind an active drive that is **genuinely metabolic rather than continuously forced**. Coldness (152) has a **Medium** half-life of 621 ticks — it decays on its own, representing the body's slow thermal equalisation with its surroundings — and there is **no `LOC_CONST` sensorimotor emitter writing to it**. Active coldness rises only when the environment, the creature's metabolism, or its immune system actively push it up; the backup then buffers that rise and smooths it out. The stock genome gives the pair the same **duplicated self-refill** structure as the carb (133/150) and fat (134/151) backups — two identical `Coldness → Coldness backup` reactions running in parallel — which makes the backup an unusually strong absorber of any transient thermal spike.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its only entry in the half-life table records a "Very long" decay (≈ 9·10¹⁰ ticks, effectively permanent), and the initial-concentration table contains **no entry** for 135, so every newly-hatched Norn starts with zero coldness backup and builds it up purely from the active drive's overflow.

## Sources

Coldness backup has two endogenous inflows (both routed from the active drive) and one external inflow. Nothing in the brain or sensorimotor system writes to it directly.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive (primary) | Gene 23 (reaction id 59) | Organ #2 "Reaction" | `1× Coldness [152] → 1× Coldness backup [135]` | Rate byte 18, half-life **6 ticks** (≈ 0.2 s at 30 Hz), labelled **"Very short"** — the fastest speed class |
| 2 | Self-refill from active drive (duplicate) | Gene 65 (reaction id 69) | Organ #2 "Reaction" | `1× Coldness [152] → 1× Coldness backup [135]` (identical formula and rate) | Rate byte 18, half-life **6 ticks**. This is an exact duplicate of gene 23 — both reactions run in parallel every tick, so the **effective decay of [152] into [135] is doubled**: the per-tick loss of active-drive mass to the reservoir is `1 − 0.88978² ≈ 0.2083` rather than the single-reaction `0.1102` observed for the protein pair |
| 3 | External CAOS injection | — | Any | `CHEM 135 <n>` on a targeted creature from a script, bootstrap agent, or the debug console | One-shot; effectively permanent because the chemical's own half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | Indirect via Pistle (environmental cold sensing) | Gene 8 (emitter id 14) → Gene 54 (reaction id 29) → reactions 59 & 69 | Circulatory tissue (locus 1) → bloodstream → Organ #2 | Circulatory locus 1 emits **Pistle [113]** (digital, threshold 128, rate 1, gain 255) when the locus reading crosses a threshold set by the body's thermal input. Reaction 29 then converts `Water [33] + Pistle [113] → 3× Coldness [152] + Pistle [113]` at Medium speed (116 ticks). Because the two self-refill reactions siphon ≈21 % of the freshly-produced coldness into the backup every tick, environmental chill gradually fills the reservoir | Indirect; active drive flow depends on Pistle concentration, which depends on the creature's circulatory-tissue thermal state |
| 5 | Indirect via Glycotoxin metabolism | Gene 78 (reaction id 88) → reactions 59 & 69 | Organ #2 | `1× Glycotoxin [70] + 1× Glycogen [4] → 4× Glucose [3] + 4× Coldness [152]` at **Short** speed (24 ticks). A Norn that has accumulated glycotoxin (a muscular waste product) "burns off" glycogen into glucose *and* generates a coldness side-effect — an anaerobic-metabolism signal that contributes to the coldness reservoir during prolonged exertion | Indirect; two units of coldness per glycotoxin+glycogen tick, ≈21 % of which is pulled into 135 |
| 6 | Indirect via immune response to Antigen 2 | Gene 87 (reaction id 94) → reactions 59 & 69 | Organ #2 | `16× Antigen 2 [84] → 12× Antibody 2 [104] + 2× Coldness [152]` at **Short** speed (64 ticks). Fighting off the Antigen-2 pathogen gives the creature a *chill* as an immune side-effect | Indirect; modest contribution, tied to infection load |
| 7 | Indirect via immune response to Antigen 3 | Gene 88 (reaction id 96) → reactions 59 & 69 | Organ #2 | `1× Antigen 3 [85] → 1× Antibody 3 [105] + 2× Coldness [152]` at **Short** speed (64 ticks). A second "cold-symptom" immune response tied to a different antigen | Indirect; modest contribution, tied to infection load |
| 8 | No pain spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`), there is **no `Pain → Coldness backup`** reaction in the stock genome. The coldness reservoir is wholly decoupled from injury and pain history | — |
| 9 | No `LOC_CONST` pressure | — | — | The emitter table contains **no** entry whose target chemical is 152 and no entry for 135. Unlike the hunger drives (which have a constant `LOC_CONST` emitter writing ≈60 u/tick), coldness has no baseline pressure — the creature only feels cold when its environment, metabolism, or immune system actively push the active drive up | — |
| 10 | No initial concentration | — | — | The `initialConcentrations` block has no entry for chemical 135 (nor for 152 either). Every Norn hatches with exactly 0 units of coldness and 0 units of coldness backup | — |
| 11 | Modded genomes | User-added | User-added | Breeders can add emitters keyed to custom "cold-memory" lobes, wire in a `Pain → Coldness backup` spillover to mirror the protein pair, add a cross-reaction from Hotness to Coldness backup (so that leaving a hot room banks some thermal momentum), or remove one of the duplicate self-refill reactions to bring the coldness pair in line with the hunger-for-protein-style single-pull buffer | Gene-dependent |

## Usage

Coldness backup has exactly **one consumer** — reaction 46 — and one passive characteristic (its essentially infinite half-life). Like all drive backups it has no direct receptor.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 11 (reaction id 46) | Organ #2 "Reaction" | `1× Coldness backup [135] → 1× Coldness [152]` at rate byte 58, half-life **311 ticks** (≈ 10 s at 30 Hz), labelled **"Medium"** | Every backup unit slowly becomes an active-drive unit at a medium rate. Combined with the two **"Very short"** (6-tick) reverse reactions, this produces a damped equilibrium in which the two chemicals constantly exchange, tilted heavily toward the backup |
| 2 | Passive decay (effectively none) | Gene 64 entry #135 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | A Coldness-backup pool persists indefinitely unless it is drained by reaction 46. All sixteen drive backups share this near-infinite half-life by design; the chemical's role is to act as a reservoir, not a signal, so it must not decay on its own. Note that the **active partner 152** is NOT "Very long" — it has a 621-tick Medium half-life, meaning the pair is *not* conservative: mass leaks out of the active drive continuously even without consumption |
| 3 | No receptor | — | — | Coldness backup is **not read by any stock receptor**. No drive, brain lobe, locus, or organ reads its concentration — the creature has no direct sensory awareness of the pool. Only the *active* drive at chemical 152 is read (on Drives tissue locus 4 at gain 204 analogue, and on Sensorimotor tissue locus 4 `LOC_INVOLUNTARY4 (Sleep)` as a digital threshold at 128) | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 135 | — |
| 5 | Modded consumers | User-added | User-added | Modders can add a "cold-memory" receptor (reading the slow-moving backup rather than the bouncing active drive) to feed a chronic-chill neuron, or gate reaction 46 with an enzyme catalyst so that banked coldness is only released under a specific metabolic signal (e.g. when blood glucose is low, simulating shivering kicking in) | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Coldness drive the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **135** | **Coldness backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 152 | Coldness | 621 ticks ("Medium") | 0 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 11 (id 46) | `Coldness backup → Coldness` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 23 (id 59) | `Coldness → Coldness backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (fast self-refill) |
| Gene 65 (id 69) | `Coldness → Coldness backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Duplicate** active → backup (second parallel pull) |

The key structural difference from the hunger backups is that the **active drive 152 itself decays** at Medium pace (621-tick half-life). Every tick the active coldness loses another ≈0.11 % of its mass to thermal equalisation, in addition to the ≈21 % pulled into the backup. This means the 135/152 loop is **not conservative** even when no one eats or drinks — heat and cold leak out of the system naturally, modelling the fact that a Norn's body temperature drifts back toward neutral when nothing is pushing it.

### Coldness vs. Hotness: a bidirectional thermal axis

Coldness is one end of a two-chemical thermal axis; the other end is **Hotness (153)**, which has a mirrored backup at **Hotness backup (136)**. The two active chemicals annihilate each other via reaction 23:

```
  Reaction 23 (gene 49): 1× Hotness [153] + 1× Coldness [152] → (nothing)
                         Half-life 0, "Instant decay"
```

This is a unique reaction class: it has the fastest possible rate (genomeValue 0) and removes mass from both reactants with no products. Whatever the smaller of the two concentrations is, it is removed *instantly* (within one tick) from both sides. The net effect is that **at most one of Coldness or Hotness is ever non-zero at a given moment**; they cannot coexist. Any environmental or metabolic event that would normally push both up simultaneously results in only the net-dominant signal being felt.

This is the game's biochemical representation of the thermodynamic fact that you cannot be both hot and cold at the same time — the temperature gradient has one direction. Coldness backup 135 and Hotness backup 136 therefore form a pair of mutually-exclusive reservoirs: a Norn that has spent a long time in a cold room has a large Coldness-backup reservoir and a depleted Hotness-backup reservoir (because any residual Hotness was being annihilated by the continuously-produced Coldness).

### Why coldness has no constant emitter

Unlike Pain and the three hunger drives, Coldness has **no `LOC_CONST` sensorimotor emitter** writing a baseline 30 u/tick into it. This is a deliberate design choice: coldness is **stimulus-driven**, not appetite-driven. A Norn does not have a constant urge to be cold the way it has a constant slowly-rising hunger; instead, it feels cold only when something in the world is making it cold.

Active coldness 152 rises from four distinct pathways:

1. **Environmental chill via Pistle.** When the creature is in a cool CA (the Creatures Array — the environmental map), its **Circulatory tissue locus 1** reads a low value. Emitter 14 (digital, threshold 128) fires and produces **Pistle (113)** whenever that locus is above the threshold — i.e. when the body has detected a thermal mismatch with the environment. Pistle then catalyses reaction 29 (`Water + Pistle → 3× Coldness + Pistle`, Medium, 116 ticks), turning the creature's plentiful water into coldness at a rate proportional to pistle concentration. Pistle is itself slowly decayed by urea (reaction 28), so the cold-production loop is self-limiting.
2. **Glycotoxin metabolism.** Reaction 88 (`Glycotoxin + Glycogen → 4× Glucose + 4× Coldness`, Short) ties coldness to anaerobic effort. A tired Norn that has built up glycotoxin in its muscles produces both glucose (to fuel recovery) *and* coldness — the biochemical signature of exertion chill. This is a minor but persistent contributor during long activity bouts.
3. **Antigen-2 immune response.** Reaction 94 (`16× Antigen 2 → 12× Antibody 2 + 2× Coldness`, Short) produces a cold symptom while the body is fighting off the Antigen-2 pathogen — the chills of a cold-like illness.
4. **Antigen-3 immune response.** Reaction 96 (`Antigen 3 → Antibody 3 + 2× Coldness`, Short) produces a second cold-symptom immune response for a different antigen.

The stock genome therefore models three distinct "feels cold" situations:
- Being in a cold place (environmental, via pistle)
- Being exhausted (metabolic, via glycotoxin)
- Being sick with certain infections (immune, via antigens 2 and 3)

Any of these routes can raise 152; the duplicated self-refill then pulls most of that signal into the 135 reservoir, where it persists as a long-term "chronic chill" state.

### Why the duplicate self-refill matters

Of the sixteen drive-backup pairs in the 131–146 / 148–161 block, the carb pair (133/150), the fat pair (134/151), the **coldness pair (135/152)**, and the hotness pair (136/153) are the four with two identical self-refill reactions. For the coldness pair, gene 23 and gene 65 both encode exactly the same formula at exactly the same rate:

```
  Gene 23 → Reaction 59 : 1× [152] → 1× [135]  (Very short, halflife 6 ticks)
  Gene 65 → Reaction 69 : 1× [152] → 1× [135]  (Very short, halflife 6 ticks)
```

Because the biochemistry engine runs each reaction independently per tick, the two reactions compose multiplicatively. The fraction of active drive surviving one tick due to the two refills alone is `0.88978² ≈ 0.79172`, so about **21 %** of active coldness is pulled into the reservoir every tick — roughly double the protein-hunger pair's ~11 %.

The duplication is structurally identical to the carb, fat, and hotness pairs, and the symmetry is deliberate-looking: all three **macronutrient hungers** (carb, fat) and both **thermal sensations** (cold, hot) need heavily-buffered drive signals because their underlying physical quantities (blood sugar, blood lipids, body temperature) fluctuate on the scale of minutes, not seconds. The protein and pain backups (which are single-pull) represent faster-changing drives that don't need as much buffering.

The observable gameplay consequence is that the coldness drive is sluggish and stable:

- **Stepping briefly into a cold room barely registers** on the Drives bar, because the fast self-refill absorbs the transient pistle-driven spike into the invisible reservoir before the brain's drive receptor has time to respond.
- **Staying in a cold room for a minute builds up a substantial reservoir**, which then drip-feeds the active drive via reaction 46 for ten seconds or more after the creature leaves — the lingering "I still feel cold" sensation after moving into a warmer area.
- **The steady-state ratio is ≈93:1 backup:active** (see below), the same as the carb and fat pairs and roughly twice as backup-heavy as the protein pair.

### Steady-state analysis

Because the active drive 152 also decays on its own (Medium, 621-tick half-life, decay rate 0.99888), the steady-state analysis differs slightly from the hunger pairs. Consider a scenario where Pistle is producing coldness at a constant rate `P` via reaction 29. At equilibrium:

- Active drive 152 loses mass at rate `(1 − 0.88978²) × [152]` per tick from the duplicated self-refill (≈21 %)
- Active drive 152 also loses mass at rate `(1 − 0.99888) × [152]` per tick from its own Medium decay (≈0.11 %)
- Backup 135 loses mass at rate `(1 − 0.99777) × [135]` per tick from reaction 46 (≈0.22 %)
- Backup 135 is topped up at rate `0.21 × [152]` per tick by the duplicated refill

Setting backup-inflow equal to backup-outflow:
```
  0.21 × [152] = 0.00223 × [135]
  [135] / [152] ≈ 94
```

So approximately **99 % of the loop's circulating mass sits in the backup** at rest, just like the carb and fat pairs. The small difference from the fat pair's 93.4 ratio comes from the active drive's own Medium decay — because some mass leaks out of the loop entirely (the body "warms up"), the equilibrium is slightly tilted toward the backup storing more of what remains.

A Norn that has been in a cold room for an hour therefore has a huge invisible coldness reservoir, most of which is *not* reflected in the Drives bar. When the Norn is moved to a warm room, the active drive drops sharply as the environmental pistle production stops and the active-drive decay takes over. But the reservoir then drip-feeds the drive for several minutes, so the Norn continues to act cold long after the environment has changed — the lingering chill is one of the most recognisable behaviours the backup produces.

### What the active drive does that the backup cannot

Because chemical 135 has no receptor, every behavioural effect of coldness is mediated through chemical 152:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #5 | Creature / Drives (tissue 5) / locus 4 "Coldness" | threshold 0, gain 204, analogue, from Baby | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows as the "Coldness" bar. The gain of 204 is very close to the fat-hunger gain of 205, meaning coldness is one of the gentler analogue drive signals in the stock genome |
| Sensorimotor receptor #72 | Creature / Sensorimotor (tissue 4) / locus 4 **`LOC_INVOLUNTARY4 (Sleep)`** | threshold 128, gain 255, **DIGITAL (all-or-nothing)**, from Baby | A **hibernation / hypothermic-sleep alarm**: when active coldness exceeds half its range (> 128/255 ≈ 50 %), the sensorimotor involuntary-sleep locus is driven hard to maximum. This is the biochemical implementation of the "cold Norns fall asleep" behaviour — a critically cold creature is forced into an involuntary sleep pose, protecting itself from further heat loss by reducing activity |

The sensorimotor involuntary-sleep receptor is a distinctive feature of the coldness drive. Most other drives use only their Drives-tissue receptor (the gradual analogue bar), but coldness adds a hard digital safety threshold. If the Norn ever gets cold enough to cross threshold 128, it doesn't just feel cold — it **physically passes out** via the LifeFaculty's sleep state. This is separate from the creature's voluntary sleep behaviour and cannot be overridden by the brain's decision lobe.

Note that **no receptor fires on Coldness backup 135**, so the hibernation alarm is driven strictly by the active drive. Because the active drive is so heavily buffered, the digital threshold is only crossed after sustained environmental chill, not by transient spikes — which is exactly the intended behaviour: you do not want a Norn to collapse from briefly passing through a cold doorway.

### Why the duplicate gene 65 makes sense

At first glance, reaction 69 (the duplicate of reaction 59) seems redundant: it converts the very thing the brain can read into something the brain cannot, and it does so on top of an already-aggressive single pull from reaction 59. But the logic is the same as for all drive backups — only doubled:

1. Without the backup, the active drive would rise and fall on whatever timescale the emitters and consumers dictate — usually seconds. Given that pistle production in a cold environment can produce coldness at up to ~3 units per tick per unit of pistle, the active drive would spike rapidly on entering a cold room and fall rapidly on leaving it. That is too fast for a *thermal* drive, which should model the body's slow heat capacity.
2. With a single backup pull, the active drive equilibrates at ~2 % of the circulating mass (as the protein pair does). For coldness — a quantity that physically changes on a minute-scale timescale — the designers seem to have wanted an even quieter active drive, so the second refill reaction reduces the active-drive equilibrium to ~1 % of the loop's mass.
3. On leaving a cold room, the active drive is only ~1 % of the stored cold; the backup then drip-feeds it for several minutes at Medium pace — giving the Norn a plausible thermal-memory window that lingers long after the environment changes.

So gene 65's duplicate is the mechanism by which the backup can absorb environmental chill with even more headroom and produce a particularly stable, slow-moving coldness signal. It is the doubled inverse partner of gene 11.

### Effects of directly filling Coldness backup

A `CHEM 135 <n>` injection produces a characteristic *very-slow-burn chill* profile because of the asymmetric reaction speeds and the doubled refill:

1. **Tick 0:** `CHEM 135 <n>` is called. Backup rises to *n*, active drive unchanged.
2. **Ticks 1–311:** Reaction 46 drip-feeds the backup into active Coldness at 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–6:** Simultaneously, reactions 59 and 69 at 6-tick half-life each aggressively pull that newly-active drive *back* into the backup. For the first few seconds, almost everything that leaves the reservoir via reaction 46 returns via the duplicated refill.
4. **Additional drain:** The active drive also decays on its own (Medium, 621-tick half-life), so some mass leaks out of the loop entirely — this is the "body warms up again" effect. Over long times, the reservoir shrinks even without reaction 46 being consumed, because every unit that briefly becomes active drive has a small probability of evaporating rather than returning to the backup.
5. **Slow discharge:** The backup slowly shrinks over the following minutes. The creature experiences a long, quiet period of elevated coldness rather than a sharp spike.

This makes `CHEM 135 <n>` the canonical way for a script to simulate a **sustained long-term thermal load** — e.g. after a long exposure to a cold biome, for a "shivering" ailment effect, or for testing the hypothermic-sleep receptor's threshold behaviour.

### Interaction with the Hotness pair and the annihilation reaction

Reaction 23 (`Hotness + Coldness → nothing`, Instant decay) means that **injecting into Coldness backup cannot build up coldness if the Norn simultaneously has active hotness** — the active drives cancel each other out the instant either rises. If a creature is in a hot room (high Hotness) and also receives `CHEM 135 <n>`:

1. Reaction 46 slowly releases backup into active Coldness.
2. As soon as active Coldness is non-zero, reaction 23 instantly annihilates it against whatever Hotness is present.
3. Neither drive bar moves — all the injected backup mass is dissipated harmlessly.

To *truly* cool a hot Norn with a CAOS script you must first drain its Hotness and Hotness backup (`CHEM 153 -255`, `CHEM 136 -255`) and then inject into Coldness or Coldness backup. Otherwise the instant-decay cancellation consumes the injection.

Conversely, if a Norn is cold and the player wants to warm it up, the cleanest approach is to inject Hotness (or Hotness backup), which will burn away Coldness via reaction 23 before registering on the Hotness drive — effectively draining the coldness reservoir "by opposition" rather than by direct subtraction.

### Contrast with the hunger backups

Coldness backup shares the duplicated self-refill with carb and fat but differs from all the hunger pairs in three important ways:

| Feature | Hunger pairs (132–134 / 149–151) | Coldness pair (135 / 152) |
|--------|----------------------------------|---------------------------|
| Active drive half-life | "Very long" (~9·10¹⁰ ticks) — essentially conservative | **"Medium" (621 ticks)** — active drive decays naturally |
| `LOC_CONST` emitter on active drive | Yes, 30–35 u/tick, gain 2 (constant baseline hunger pressure) | **None** — stimulus-driven only |
| Sources of active drive | Constant emitter + catalysed reactions (e.g. Glucose catalysis of carb-hunger decay) | Pistle-catalysed environmental sensing + glycotoxin metabolism + two antigen responses |
| Initial concentration of active drive | Small but non-zero (33 or 13 out of 255) | **0** |
| Secondary receptor on active drive | Circulatory critical-hunger alarm (analogue/digital depending on pair) | **Sensorimotor involuntary-sleep (hibernation) alarm**, digital, threshold 128 |
| Cross-annihilation with paired drive | None | **Instant annihilation with Hotness (reaction 23)** |
| Pain spillover into backup | Yes for protein only (gene 20) | **None** |

The coldness pair is therefore the first of the drive backups to model a physical quantity (body temperature differential) rather than a metabolic appetite, and it does so with a fundamentally different architecture: no baseline pressure, natural decay of the active signal, and a mutually-exclusive partner drive.

### Implications for modders

Common modifications built on top of chemical 135:

1. **Add a "cold-memory" receptor on a custom lobe.** Because 135 changes on a minute-scale timescale while 152 bounces on a second-scale timescale, a lobe reading the backup gives the brain access to *chronic* cold-exposure history rather than *acute* events. A "remembers which rooms are cold" Norn mod typically adds such a receptor feeding a directional-avoidance neuron.
2. **Remove either gene 23 or gene 65.** Deleting one of the duplicate refill reactions brings the coldness pair in line with the protein pair (single-pull, ~49:1 ratio, ~11 %/tick refill). This makes coldness less stable and more reactive to thermal events — useful for mods that want a livelier "cold-sensitive" Norn that reacts strongly to brief chills.
3. **Add a `Pain → Coldness backup` reaction**, mirroring gene 20's pain spillover into the protein backup. This wires injury into long-term thermal load, giving hurt creatures a tendency to seek warmth. Sensible for "trauma-shivering" mods.
4. **Change reaction 46's rate byte** (from 58/Medium to a higher value like 128/Short) to make the reservoir release its contents faster — a Norn that "metabolises" cold more quickly, with shorter and less pronounced shivering windows after leaving a cold area.
5. **Add a catalyst to reaction 46**, for example `Coldness backup + ATP → Coldness + ATP`, to gate the backup's release on an energy signal. This lets a modded creature simulate "cold that only manifests when energy is low" (a starving Norn gets colder).
6. **Lower the sensorimotor involuntary-sleep threshold** (receptor 72) from 128 to something like 200 to make hibernation a rarer, more extreme event — useful for robust "hardy" Norn breeds.
7. **Add a Hotness-backup → Coldness-backup reaction** to model heat loss that outlasts the environmental trigger (a Norn that over-cooled in a hot room accumulates slow-release cold as their body over-corrects).
8. **Raise the initial concentration** by adding a 135 entry to the initialConcentrations block so newly-hatched Norns already carry a small thermal reservoir — useful for "cold-world" scenario eggs.

Because the chemical has no receptor and the active drive already has multiple writers, these modifications are generally safe and isolated from other body systems.

### Practical consequences for gameplay

- **`CHEM 135 <n>` simulates sustained, chronic cold.** Unlike `CHEM 152 <n>` (which spikes the Drives bar but is immediately absorbed back into the reservoir in ~0.1 s by the doubled refill, and also annihilated against any active Hotness), injecting into the backup produces a drawn-out chill that takes minutes to fully drain and drives the involuntary-sleep receptor if the reservoir is large enough.
- **Coldness and Hotness cannot coexist.** Any script that tries to push both simultaneously will see only the net-dominant drive survive, because reaction 23 is Instant. To model a "dimensional mismatch" or "confused thermostat" you must disable reaction 23 first.
- **The cold-sleep behaviour only fires above threshold 128 on the active drive.** Because of the heavy buffering, a brief visit to a cold room will *not* trigger hibernation — only sustained exposure will build up a reservoir large enough to keep the active drive above threshold through the buffer's drain.
- **Feeding a Norn does not empty the coldness reservoir.** Food consumes specific hunger drives, not thermal drives. A cold Norn needs warmth (moving to a warmer CA, or ingesting a warming chemical), not food.
- **A Norn's natural thermal decay is slow.** The Medium-half-life active drive combined with a ~99 % reservoir mass means a warmed-up Norn can stay functionally cold for **many minutes** after leaving a cold room — the characteristic "took ages to thaw out" behaviour.
- **Pain events do *not* raise the coldness reservoir.** Unlike the protein pair, where every slap or immune response gradually fills 132, the coldness backup is wholly insulated from injury. A Norn that has been hurt for hours will not develop a cold craving or chill as a side effect.
- **Newly-hatched Norns start with zero coldness and zero backup.** Combined with the 0 initial concentration of the active drive, babies are never born cold — they only become cold through environmental contact or metabolic/immune processes that develop over their lifetime.

### Summary

```
 Stock-genome wiring of Coldness backup [135]
 ─────────────────────────────────────────────────────
 Inputs:
    Coldness [152] ─ reaction 59 (gene 23) ───────────▶ [135]
                      half-life 6 ticks ("Very short")

    Coldness [152] ─ reaction 69 (gene 65) ───────────▶ [135]
                      half-life 6 ticks ("Very short")
                      (DUPLICATE — gives doubled refill rate)

    CHEM 135 <n>  (CAOS / scripts / mods)  ───────────▶ [135]

    (No pain spillover; no emitter writes to 135 directly)

 Reservoir:
         Coldness backup [135]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                        │
                        │ reaction 46 (gene 11):  1× [135] → 1× [152]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Coldness [152]
         half-life 621 ticks ("Medium") — decays naturally on its own
         initial concentration: 0
                        │
                        ├─► Drives tissue locus 4 (gain 204) ─────▶ decision-lobe "coldness" bar
                        ├─► Sensorimotor tissue LOC_INVOLUNTARY4
                        │      (thresh 128, digital, gain 255, Baby+) ▶ involuntary-sleep alarm
                        ├─◀ reaction 29: Water + Pistle → 3× Coldness (from environmental cold)
                        ├─◀ reaction 88: Glycotoxin + Glycogen → 4× Coldness (exertion chill)
                        ├─◀ reaction 94: 16× Antigen 2 → ... + 2× Coldness (immune)
                        ├─◀ reaction 96: Antigen 3 → ... + 2× Coldness (immune)
                        ├─◀ reaction 23: Hotness + Coldness → nothing (Instant — mutual annihilation)
                        │
                        └─► reactions 59 & 69 back into [135]  (doubled fast self-refill)
```

Coldness backup is therefore the **first of the drive backups to sit behind a stimulus-driven (rather than appetite-driven) active drive**, and the first of them whose active partner decays on its own. Together with the Hotness pair (136/153) it forms the body's two-compartment thermal system, modelling both hot and cold as separate but mutually-annihilating signals. Among the sixteen backup chemicals in the 131–146 block, chemical 135 is architecturally closest to the carb and fat hunger backups (same duplicated self-refill, same ~99 % reservoir mass ratio) but functionally most distinct — it is not a metabolic appetite but an environmental and immune sensation, and its digital involuntary-sleep receptor makes it the only drive in the stock genome that can directly force a change in the creature's sensorimotor state rather than merely influencing its brain's decisions.
