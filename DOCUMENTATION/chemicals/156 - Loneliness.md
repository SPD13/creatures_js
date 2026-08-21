# 156 - Loneliness

Loneliness is the **active drive chemical** for the creature's need for same-kind companionship. It sits in slot 9 of the sixteen "drive" chemicals in the 148–161 block — the active signals that the decision lobe, body tissues and organ receptors read to choose behaviour — and it is paired with **Loneliness backup [139]** in the canonical Creatures 3 / Docking Station drive/reservoir architecture. Unlike most drives, which are produced by either an always-on `LOC_CONST` drip or by a pathology/metabolism reaction, Loneliness is generated directly by a **sensorimotor locus** (`LOC_CROWDEDNESS`, locus 5) that the creature's own physics engine keeps up to date every tick: the value of the current room's "crowded" CA property minus the creature's own contribution. When that reading is low — i.e. few same-kind neighbours are sharing the room — a digital + inverted emitter fires, writing a small fixed increment of Loneliness into the bloodstream. That active mass is then almost entirely swept into the reservoir within a few ticks, to be slowly drip-fed back out again in the minutes that follow.

Loneliness is the **exclusively cognitive half** of the pair: its only downstream effect is the decision-lobe drive bar (Drives tissue locus 8, gain 207), which the brain reads when choosing its next action. Loneliness has no sensorimotor-gait receptor, no circulatory receptor, no immune receptor, no organ receptor — unlike Tiredness (which alters gait), Hotness (which alters clock rate) or Pain (which fires involuntary actions), a lonely Norn is not biologically sickened or slowed by loneliness; it is simply *motivated* toward social behaviour. This clean separation between motivation and physiology is the defining feature of the whole social axis in the stock genome.

Because Loneliness shares its source locus with **Crowded (157)** via complementary emitter thresholds, and because the two active drives mutually annihilate through **reaction 24** at a short (but non-instant) 19-tick half-life, Loneliness is a **balanced, overlapping** drive rather than an either/or signal. In a room of moderate density (between the 10 %-and-89 % band on `LOC_CROWDEDNESS`) **both** emitters fire and both active drives exist, constantly eroding each other while the Loneliness-backup reservoir continues to accumulate. This produces the characteristic "slow-moving social weather" quality of Creatures 3 loneliness: the chemistry makes the drive **lag behind** the environment — minutes of isolation are needed before the bar rises noticeably, and minutes of companionship are needed before it falls noticeably.

## Sources

Loneliness has a single continuous endogenous source — the sensorimotor `LOC_CROWDEDNESS` emitter — plus a slow drip-release from the backup and the usual direct-CAOS injection path. Nothing else writes to it in the stock genome; there are no pathology cross-couplings, no brain-neuron emitters, and no organ-level production.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | `LOC_CROWDEDNESS` sensorimotor emitter | Gene 41 (emitter id 7) | Creature / Sensorimotor (tissue 4) | Locus 5 `LOC_CROWDEDNESS`, threshold 227, rate 10, gain 1, **DIGITAL + INVERT** | Fires at fixed gain 1 every 10 ticks whenever the locus reads **below 227/255 ≈ 89 %**. Because the locus is set to `room_crowded − self_contribution` by the creature's sensorimotor-sense calculation, it reports the density of *other* same-kind Norns in the current room. For virtually any realistic world state — even a room with two or three companions — the threshold is met and this emitter fires continuously. The INVERT flag reverses the normal "fire when above threshold" logic: this is the only emitter in the stock genome that uses INVERT, and it is the defining mechanism by which **absence** of stimulus produces a chemical signal |
| 2 | Backup → active drip | Gene 15 (reaction id 52) | Organ #2 "Reaction" | `1× Loneliness backup [139] → 1× Loneliness [156]` at half-life **311 ticks** ("Medium", decay rate 0.99777) | ≈0.22 %/tick of the reservoir is released into the active drive. This is the mechanism that surfaces banked social debt: whatever Loneliness-backup has accumulated during prior isolation periods slowly re-appears as active drive whenever the reservoir is non-zero, even if the creature is currently in a crowded room |
| 3 | Direct CAOS injection | — | Any | `CHEM 156 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot. Because reaction 62 sweeps the active drive into the reservoir at a 6-tick half-life (≈11 %/tick), a `CHEM 156 <n>` write peaks immediately and then decays rapidly over ~20–30 ticks. Most of the injected mass ends up banked into chemical 139 rather than lingering as active drive |
| 4 | No initial concentration | — | — | Chemical 156 does not appear in the genome's initial-concentration table (gene 64). A newly-hatched Norn is born with exactly **0** active Loneliness. Chemical 139 is also born at 0, so babies start the game perfectly neutral on the social axis; the first few ticks of `LOC_CROWDEDNESS` reading into the hatching room begin filling the reservoir from scratch | — |
| 5 | No brain or organ emitter | — | — | The stock neuroemitter list contains **no** brain-neuron, organ-tissue, or circulatory emitter writing to chemical 156. Beyond the single `LOC_CROWDEDNESS` emitter and the reservoir drip, no other endogenous source exists. This makes Loneliness one of the most "peripherally produced" drives — its value is driven entirely by the creature's perception of its environment and the accumulated history of that perception, with no internal cognitive or metabolic contributions | — |
| 6 | No cross-drive spillover | — | — | Unlike the protein-hunger pair (which receives spillover from Pain via gene 20) or the sleep pair (which receives exogenous input from Sleep toxin via reaction 82), the Loneliness pair is completely decoupled from the rest of the biochemistry. Injury, fever, antigens, hunger, sex-drive and emotional drives do **not** feed loneliness in the stock genome | — |
| 7 | Modded genomes | User-added | User-added | Common mods include: replacing the DIGITAL + INVERT emitter with an analogue INVERT emitter (smooth proportional response to density); adding a `Pain → Loneliness backup` spillover reaction ("pain makes you want comfort"); wiring a "learned-attachment" brain neuron as a neuroemitter on 156 so specific relationships drive the signal; gating reaction 52 with a catalyst analogous to Sleepase so banked loneliness only surfaces in response to an event chemical | Gene-dependent |

## Usage

Loneliness has exactly **one receptor** — the decision-lobe drive bar — plus two consuming reactions. There is no gait, circulatory, immune, or organ-level reader. Its behavioural influence is therefore entirely cognitive-motivational.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Drives-tissue "Loneliness" receptor | Gene 8 (receptor id 9) | Creature / Drives (tissue 5) | Locus 8 "Loneliness", threshold 0, gain 207, analogue, from Baby | **The loneliness drive bar the decision lobe reads to choose social behaviours.** Threshold 0 means proportional response at every level; gain 207 (symmetric with the Crowded receptor's gain 209 on locus 9) puts the two ends of the social axis at comparable decision-lobe weighting. Without this receptor the Norn has no drive-level reason to seek company |
| 2 | Active → backup sweep | Gene 43 (reaction id 62) | Organ #2 "Reaction" | `1× Loneliness [156] → 1× Loneliness backup [139]` at half-life **6 ticks** ("Very short", decay rate 0.88978) | ~11 %/tick of the active drive is banked into the reservoir. This is a **single-pull** reaction (unlike the carb/fat/cold/hot pairs which have duplicated sweeps) — Loneliness shares this single-pull design with Pain, Fear, Anger, Boredom, Need-for-pleasure, Sex-drive and the Crowded pair. Single-pull means active mass survives a few extra ticks before banking, keeping short-term density fluctuations visible on the bar rather than smoothing them away completely |
| 3 | Crowded / Loneliness annihilation | Gene 104 (reaction id 24) | Organ #2 "Reaction" | `1× Crowded [157] + 1× Loneliness [156] → (nothing)` at half-life **19 ticks** ("Short", decay rate 0.96501) | Whenever both active drives exist, ~3.5 %/tick of the **smaller** pool is destroyed. This is NOT an instant-decay annihilation like Hotness/Coldness (reaction 23, half-life 0); the two social signals can coexist transiently during minutes after a density change. The non-instant character is what produces the sluggish dynamics described below |
| 4 | Passive decay | Gene 64 entry #156 (half-life table) | Bloodstream | genomeValue 64, half-life **563 ticks** ("Medium", decay rate 0.99877) | ≈0.12 %/tick of the active drive decays on its own. This leaks mass out of the loop that otherwise cycles between 156 and 139 — the reason the pair is non-conservative and the reservoir slowly drains over very long timescales even with no annihilation |
| 5 | No sensorimotor or circulatory receptor | — | — | Unlike Tiredness (which fires `LOC_GAIT2` and an immune-tissue receptor), Sleepiness (`LOC_GAIT3` and a Youth+ circulatory locus), Hotness (`RLOCUS_CLOCKRATE`) or Coldness (`LOC_INVOLUNTARY4`), chemical 156 has no reader outside the decision-lobe drive bar. A lonely Norn walks, metabolises, fights infection and regulates temperature exactly like a non-lonely one. The only change is which action its decision lobe selects | — |
| 6 | No neuroemitter on the backup | — | — | No brain or organ neuron emits to 139 either, so active Loneliness has no hidden "cognitive" feeder beyond the sensorimotor locus and its own reservoir. This keeps the drive entirely a function of environmental density and history | — |
| 7 | Modded consumers | User-added | User-added | Modders may add a sensorimotor receptor on 156 to produce a "hanging-head" loneliness gait, or a circulatory receptor to simulate social-isolation stress (e.g. immune dampening, clock-rate changes), or a brain-lobe receptor feeding a memory cell so the creature learns from long-term loneliness rather than just reacting to its current level | Gene-dependent |

## Role in Game Mechanics

### The social axis and its two emitters

Loneliness and Crowded form a **single-locus, two-emitter, mutually-annihilating** axis driven entirely by the sensorimotor reading `LOC_CROWDEDNESS` (tissue 4, locus 5). That reading is set once per creature tick by the creature's sensorimotor-sense calculation:

```text
myCrowdedLocus = 0.0
if world.GetMap().GetRoomPropertyMinusMyContribution(this, value):
    myCrowdedLocus = value
```

The map's "crowded" CA property is the summed presence of same-kind creatures in the room; the "minus-my-contribution" call subtracts the creature's own stamp so that no Norn senses itself. Two emitters then read the single locus:

| Emitter | Gene | Target | Threshold | Rate | Gain | Flags | Fires when |
|---------|------|--------|-----------|------|------|-------|------------|
| #7 | 41 | **156 Loneliness** | 227 | 10 | 1 | **DIGITAL + INVERT** | `LOC_CROWDEDNESS < 227/255 ≈ 89 %` (almost always) |
| #8 | 32 | 157 Crowded | 26 | 6 | 1 | none (analogue) | `LOC_CROWDEDNESS > 26/255 ≈ 10 %` (whenever any neighbours present) |

In the wide middle band (density between ~10 % and ~89 %) **both emitters fire every tick**, and the net social signal is determined by the balance between the two production rates and reaction 24's annihilation. Only at the extremes does a single emitter dominate cleanly:

- **Completely alone** (`LOC_CROWDEDNESS ≈ 0`): only the Loneliness emitter fires. The Loneliness pair accumulates; the Crowded pair is inert.
- **Densely packed** (`LOC_CROWDEDNESS ≈ 1`): only the Crowded emitter fires. The Crowded pair accumulates; the Loneliness reservoir slowly drains via reaction 52 → reaction 24 → (annihilated by the already-elevated Crowded).
- **Middle band**: both emitters fire; reaction 24 annihilates the smaller pool; whichever side the emitter balance favours slowly wins.

The INVERT flag on emitter #7 is unusual — it is the only stock emitter that uses the "fire when below threshold" rule. This is how loneliness is modelled: the *absence* of stimulus, not its presence, is what produces the chemical signal.

### Why Loneliness has a small but real active presence

In steady state (no Crowded annihilation, no reservoir release), the emitter writes gain-1 fixed increments at rate 10 (every 10 ticks), and reaction 62 sweeps ~11 %/tick into the reservoir. The steady-state balance is approximately:

```
emitter_inflow (per tick) ≈ active × 0.11
⇒ active ≈ emitter_inflow / 0.11
```

With the emitter's tiny gain-1 (1/255 of full scale) firing once every 10 ticks, the tick-averaged inflow is small, and the steady-state active Loneliness sits at a few per cent of full scale. This is just barely visible on the drives bar — enough for the decision lobe to weight social actions slightly upward, but not enough to dominate behaviour unless the reservoir has had time to accumulate substantially and reaction 52 is adding its slow drip on top.

The contrast with the metabolic drives is stark: a hungry Norn's Hunger-for-protein drive bar rises rapidly in response to `LOC_CONST`-driven emitter inputs feeding a pair that also has cross-couplings to pain. A lonely Norn's bar rises **slowly**, because the single sensorimotor emitter with gain 1 and single-pull sweep is one of the lowest-amplitude drive-producing loops in the entire genome.

### The non-instant annihilation (reaction 24)

The most distinctive feature of the Loneliness/Crowded pair relative to the other antagonistic pair in the genome (Hotness/Coldness) is the **half-life of the annihilation reaction**:

| Pair | Reaction | Half-life | Speed | Co-existence |
|------|----------|-----------|-------|--------------|
| Hotness / Coldness (153 / 152) | Reaction 23 (gene 49) | 0 | "Instant decay" | Strictly mutually exclusive |
| Crowded / Loneliness (157 / 156) | Reaction 24 (gene 104) | 19 | "Short" | Transient overlap allowed |

Reaction 24 runs at ~3.5 %/tick of the smaller pool. This means after a density change, the losing side takes tens of ticks (seconds to a minute) to erode to zero. During that window the creature's decision lobe sees **both** drives at once and weights both in its action selection — a Norn who has just arrived in a populated room after a long period of isolation momentarily "feels" both lonely (banked reservoir still draining via reaction 52) and somewhat crowded (new emitter firing), which is a plausible model of the ambiguous social state that follows a sudden change in company.

Over many ticks the Crowded side wins because the emitter keeps topping it up while the Loneliness side is only receiving its slow drip from the reservoir; but the key gameplay consequence is that **social transitions are gradual**, not instantaneous. Moving a lonely Norn into company does not instantly zero its loneliness — the reservoir must drain through the slow reaction 52 pathway, with any fresh output colliding with the new Crowded build-up via the non-instant reaction 24.

### The "sluggish social weather" dynamic

Three stacked latencies cooperate to make Loneliness a minutes-scale drive rather than a seconds-scale one:

1. **The emitter is digital + gain-1** — the smallest possible per-tick increment, firing once every 10 ticks. Even uninterrupted isolation produces only a slow trickle of active Loneliness.
2. **Reaction 62 sweeps at 11 %/tick** — the vast majority of what the emitter writes is banked into the reservoir within one or two ticks, so the drive bar barely notices individual emitter fires.
3. **Reaction 52 releases at 0.22 %/tick** — the backup drips back out over minutes, so accumulated loneliness surfaces slowly as a smooth rising baseline rather than as a direct emitter-to-bar signal.

The combined effect is that loneliness in Creatures 3 is a **chronic, slow-tracking** drive. A Norn briefly left alone while the player attends to another task shows no visible loneliness response. A Norn left alone for five in-game minutes shows a small but rising bar. A Norn left alone for an hour shows a substantial bar that persists even after reuniting with companions, because the reservoir must drain through reaction 52 → reaction 24 over several more minutes before the active drive finally subsides.

This was an explicit design choice by the biochemists on the original game: the social drive was not meant to track second-scale events (a companion walks past, a companion pauses), but the sustained social density of a Norn's life. It is conceptually closer to "accumulated social hunger" than to "current loneliness feeling", although only the latter shows on the drive bar.

### Decision-lobe consequences

The Drives receptor (gene 8) writes the drive-bar value into the decision lobe's input layer every tick. The decision lobe is trained (during lifetime via reinforcement and via the initial genome bias) to associate high Loneliness readings with the **approach-companion** and **social-behaviour** actions: looking at another creature, walking toward it, performing greeting gestures, and engaging in mating or interaction scripts. Because Loneliness is a **reducible-by-action** drive (engaging with company eventually lowers `LOC_CROWDEDNESS` away from the emitter threshold), the decision lobe's reinforcement learning will identify these actions as reward-generating in the presence of loneliness, cementing the social response pattern during normal life.

There is **no autonomic pathway**: a lonely Norn does not walk toward companions because of a reflex or involuntary action, but because the cognitive layer has learned that doing so reduces the loneliness drive. This is why un-socialised Norns (those raised in isolation past a critical period) can fail to develop normal social approach behaviour — the decision-lobe training never saw the loneliness-reducing reinforcement signal and instead learned other actions (wandering, eating) as the default response to high Loneliness.

### Interaction with the Crowded drive

Because Loneliness and Crowded share a locus, an emitter pair, and an annihilation reaction, they behave as a **coupled axis** rather than two independent drives:

- **Low density**: Loneliness emitter fires, Crowded emitter silent. Active Loneliness accumulates; reservoir fills; drive bar rises gradually over minutes.
- **Moderate density**: Both emitters fire, both active drives exist, reaction 24 eats the smaller. The *net* bar tilt depends on the emitter rate balance — the Loneliness emitter fires at rate 10 (every 10 ticks) while the Crowded emitter fires at rate 6 (every 6 ticks), giving the Crowded pair slightly more throughput at the midpoint density. In practice, a room with 2–3 same-kind neighbours typically stabilises with Crowded slightly elevated and Loneliness slightly suppressed.
- **High density**: Only the Crowded emitter fires. Active Crowded accumulates; the Loneliness reservoir still drains via reaction 52, but each unit released is quickly annihilated by reaction 24 against the elevated Crowded. The loneliness bar approaches zero within a few minutes.

The result is that the social drive bar is **bimodal**: deeply lonely Norns and deeply crowded Norns both exhibit strong, sustained drive readings, while moderate-density Norns show a low baseline on both ends — the social-signal "resting state". This is a mechanically elegant design: the creature is motivated toward social behaviour in the extremes and is left alone to pursue other drives (hunger, sleep, exploration) during the balanced middle.

### Effects of directly filling Loneliness

A `CHEM 156 <n>` injection produces a sharp, short-lived spike:

1. **Tick 0:** Active Loneliness rises to *n*. The decision-lobe drive bar reports a sudden jump.
2. **Ticks 1–6:** Reaction 62 rapidly banks most of the injected mass into the reservoir at ~11 %/tick. Within 20–30 ticks most of the active drive has moved to chemical 139.
3. **Minutes 1+:** Reaction 52 then drip-releases the banked mass at a 311-tick half-life, producing a gradually-decaying active Loneliness tail over many minutes.
4. **If in company:** Reaction 24 accelerates the destruction of the active drive, converting the spike and its slow tail into a faster decay to zero as Crowded annihilates the surfacing Loneliness.

A `CHEM 156 -n` write (negative, "heal loneliness") removes current active Loneliness but leaves the reservoir untouched; the bar drops immediately but then slowly rises again as reaction 52 continues releasing banked mass. To truly zero a Norn's loneliness one must write to both 156 and 139.

The canonical "social injection" for scripts and care agents is therefore `CHEM 139 <n>` (or `CHEM 139 -n`) rather than `CHEM 156`: writing to the reservoir produces a persistent, gradually-surfacing effect that the decision lobe responds to naturally, whereas writing to 156 produces a transient spike that the sweep reaction quickly buffers away.

### Contrast with Tiredness and Sleepiness

Both Tiredness (154) and Sleepiness (155) have active drive chemicals with multiple receptors beyond the drive bar — Tiredness has an immune-tissue receptor and a `LOC_GAIT2` gait receptor; Sleepiness has a `LOC_GAIT3` receptor and an age-gated circulatory locus. Both produce **physical symptoms** that extend beyond decision-lobe motivation into gait, metabolism, and physiology.

Loneliness has none of these. The only receptor is the drive bar. A lonely Norn is not tired, not slow, not pale, not slightly feverish — it is simply motivated toward company. This design reflects the authors' view of social drive as a purely motivational signal rather than a physiological state, and it keeps the social axis cleanly separable from metabolic health in both the stock behaviour and in all mods that touch only 156/139/157/140.

### Contrast with Fear, Anger, Boredom and the emotional drives

Fear (158), Anger (160), and Boredom (159) are also single-pull pairs and also purely cognitive (drive bar only, no physiological side-effects). Structurally they are Loneliness's closest siblings. The key differences are **source**:

| Drive | Primary source |
|-------|----------------|
| Loneliness (156) | Sensorimotor locus (`LOC_CROWDEDNESS`), inverted threshold |
| Fear (158) | Brain-lobe emitters (stimulus-classification based) |
| Anger (160) | Brain-lobe emitters (frustration / unmet-goal based) |
| Boredom (159) | `LOC_CONST` drip (constant baseline) |

Loneliness is the only drive in this emotional-cluster fed by a direct sensorimotor reading of the creature's environment. Fear and Anger require cognitive appraisal (the brain deciding something is scary or frustrating); Boredom builds at a constant rate unless actively suppressed. Loneliness is unique in being produced by the creature's *measured social context*, not its thoughts.

### CAV save/load and imported creatures

The `MakeYourselfTired` shutdown helper does **not** touch the social chemicals — it writes only Tiredness (154) and Sleepiness (155). A creature exported to a CAV save therefore retains whatever 156 and 139 values it had at save time; a socially isolated saved creature will arrive in its new world already carrying a substantial Loneliness reservoir, and will quickly surface loneliness on the drive bar once imported unless the destination world is populated with same-kind companions.

This is often visible as the "imported-creature wants attention" effect: a newly-loaded Norn from a creature-export file, placed into an unfamiliar world, will approach the nearest same-kind creature almost immediately because its reservoir has been draining into the active drive bar since the moment it was un-freezed.

### Implications for modders

Common modifications built on Loneliness:

1. **Remove DIGITAL + INVERT from emitter #7**: Makes active Loneliness rise analogue-smoothly in proportion to "how alone" the creature is, scaling with `(255 − locus) / 255`. Produces a graded social-hunger profile rather than an either-fires-or-not binary emitter.
2. **Raise the emitter gain above 1**: The stock gain-1 setting is the lowest possible; raising it to 4 or 8 makes loneliness a much more responsive drive that can rise to visible levels within seconds rather than minutes. Popular for "clingy" breeds.
3. **Add a sensorimotor receptor on 156** to fire `LOC_GAIT2` or `LOC_GAIT3` at high Loneliness, producing a "mopey walk" animation for lonely Norns.
4. **Add a brain-lobe receptor on 156** (e.g. a "social memory" lobe) so the cognitive layer has explicit awareness of loneliness beyond the decision-lobe drive bar. Enables learned social strategies that respond to absolute loneliness levels rather than just the reinforcement gradient.
5. **Gate reaction 52 with a catalyst** (analogous to Sleepase gating Sleepiness-backup release). Makes banked loneliness only surface in response to a specific event chemical — e.g. a "seeing a familiar face leave" toxin — instead of as a continuous drip.
6. **Cross-couple to Pain**: Add a `Pain → Loneliness backup` spillover reaction so injured Norns accumulate loneliness, modelling "pain makes you want comfort". Mirrors the gene 20 `Pain → Hunger for protein backup` reaction in the metabolic pairs.
7. **Convert reaction 24 to "Instant decay"**: Makes the social axis strictly mutually exclusive like Hotness/Coldness. Eliminates the middle-band co-existence and produces sharp, on/off social signals.
8. **Add a circulatory receptor on 156**: Simulates social-isolation stress with real physiological consequences — elevated clock rate, suppressed immunity, or similar. Turns loneliness from a purely cognitive drive into one with a measurable biological cost.

Because 156 has a single receptor and no cross-coupling, all of these modifications are cleanly isolated from the rest of the biochemistry: they affect the social drive without perturbing metabolism, sleep, or hunger.

### Practical consequences for gameplay

- **Loneliness rises over minutes, not seconds.** A Norn briefly separated from its family shows no visible response; separation on the scale of several in-game minutes is required before the bar moves visibly.
- **Loneliness falls over minutes, not seconds.** Reuniting a lonely Norn with companions does not instantly zero its bar. Reaction 52 continues draining the reservoir for minutes; reaction 24's non-instant annihilation cannot clear the residue faster than reaction 52 produces it. The creature's social satisfaction is *sluggish* on both transitions.
- **Newly-hatched Norns start neutral.** Both 156 and 139 have zero initial concentration. The first few ticks of `LOC_CROWDEDNESS` reading from the hatching room determine whether the reservoir starts filling immediately (lonely hatching environment) or stays near zero (hatched into company).
- **Drive bar shows only 156.** The Science Kit is the only stock tool that displays the reservoir at 139. A Norn with low active Loneliness but high Loneliness backup appears "content" on the drives UI while carrying a substantial dormant social debt.
- **`CHEM 156 <n>` produces a brief spike**; `CHEM 139 <n>` produces a persistent, slowly-surfacing loneliness. Care scripts and healing agents should write to the reservoir (139), not the active drive (156), to produce a stable change in social motivation.
- **Purely cognitive drive.** A lonely Norn walks at normal speed, eats normally, fights off infections normally, and regulates temperature normally. The only observable effect of loneliness is the decision lobe preferring social actions when choosing what to do next.
- **Imported creatures arrive carrying their history.** The shutdown helper does not touch 156 or 139, so a CAV-exported creature that was isolated at save time will appear in its destination world with an intact Loneliness reservoir, surfacing on its drive bar over the first few minutes after import.
- **Social density has a "middle band" with low on both ends.** A Norn in a room with 2–3 companions has both Loneliness and Crowded at low active levels (the two emitters balance and reaction 24 consumes the overlap). This corresponds to the gameplay notion of "a socially adequate environment" where neither extreme of the axis is driving behaviour, leaving the creature free to pursue hunger, sleep, exploration, and mating drives.

### Summary

```
 Stock-genome wiring of Loneliness [156]
 ────────────────────────────────────────
 Inputs:
   emitter #7 (gene 41) ──────────────────────────────────▶ [156]
     Sensorimotor / LOC_CROWDEDNESS (tissue 4 / locus 5)
     threshold 227, rate 10, gain 1, DIGITAL + INVERT
     fires whenever LOC_CROWDEDNESS < 89 % (almost always)
     LOC_CROWDEDNESS set by the sensorimotor-sense calculation
       = room_crowded − self_contribution (same-kind neighbours)

   reaction 52 (gene 15)  [139] → [156]
     half-life 311 ticks (Medium, ~10 s)
     continuous drip-release from the reservoir

   CHEM 156 <n>   (CAOS / scripts / mods)
   CAV import state (not touched by MakeYourselfTired)

         Loneliness [156]            half-life 563 ticks (Medium)
         initial concentration: 0    decays ≈0.12 %/tick on its own
                 │
                 ├──► Drives receptor #9 (gene 8):
                 │       Drives tissue (5) / locus 8 / threshold 0 / gain 207
                 │       → decision-lobe "loneliness" bar
                 │       → only receptor on 156 in stock genome
                 │
                 ├──► reaction 62 (gene 43):
                 │       [156] → [139]
                 │       half-life 6 ticks (Very short, ~11 %/tick)
                 │       single-pull sweep to the reservoir
                 │
                 └──► reaction 24 (gene 104):
                         [157] + [156] → (nothing)
                         half-life 19 ticks (Short, NOT instant)
                         cross-annihilation with the Crowded drive

 Reservoir: Loneliness backup [139]   half-life ≈9·10¹⁰ ticks (essentially permanent)

 Companion axis: Crowded [157] emits from the same locus at threshold 26, rate 6
                 produced when the room is populated; mutually annihilates with 156
```

Loneliness is the **sensorimotor-fed, cognitive-only, single-pull active half** of the Creatures 3 social-density drive system. It is unique among drives in being produced by a measured property of the creature's environment rather than by an internal cognitive, metabolic, or baseline source, and unique in using the INVERT emitter flag so that *absence* of social stimulus generates the signal. Its chemistry — a low-amplitude sensorimotor emitter, a fast single-pull sweep to a near-permanent reservoir, and a non-instant cross-annihilation with the Crowded drive — produces a slow-tracking, overlap-tolerant social motivation whose defining gameplay quality is the multi-minute lag between environmental change and drive-bar response. Together with Loneliness backup [139], Crowded [157], and Crowded backup [140], it forms the four-chemical social axis that the decision lobe weights when a Norn is choosing whether to seek, tolerate, or avoid company.
