# 157 - Crowded

Crowded is the **active drive chemical** for the creature's feeling of being over-socialised. It sits in slot 10 of the sixteen "drive" chemicals in the 148–161 block — the active signals the decision lobe and body tissues read to choose behaviour — and it is paired with **Crowded backup [140]** in the canonical Creatures 3 / Docking Station drive/reservoir architecture. Like its mirror Loneliness (156), Crowded is generated directly by a **sensorimotor locus** (`LOC_CROWDEDNESS`, tissue 4 / locus 5) that the creature's own physics keeps up to date every tick: the value of the current room's "crowded" CA property minus the creature's own contribution, so same-kind neighbours register but self does not. When that reading is high — i.e. many same-kind companions share the room — an analogue emitter fires, writing a per-tick increment of Crowded into the bloodstream that scales smoothly with the density of the crowd. That active mass is then almost entirely swept into the reservoir within a few ticks, to be slowly drip-fed back out again in the minutes that follow.

Unlike its mirror Loneliness, Crowded is **not a purely cognitive drive**. It has two distinct pathways to the body: the familiar drive-bar receptor that weights the decision lobe's choice of behaviour, and a second, youth-gated **physiological stress pathway** that activates at very high crowdedness and converts the sensation into Stress (Crowded) [195] — a circulatory stress chemical that participates in the generalised stress-response block of the stock genome. This asymmetry makes Crowded the more "biological" of the two social-axis drives: a mildly crowded Norn is simply motivated to move away, but a Norn packed into a densely populated room past the 90 % threshold triggers a genuine stress response with potential downstream consequences for immunity, heart rate, and the other circulatory-locus-driven systems that read the Stress (Crowded) chemical.

Because Crowded shares its source locus with **Loneliness (156)** via complementary emitter thresholds, and because the two active drives mutually annihilate through **reaction 24** at a short (but non-instant) 19-tick half-life, Crowded is a **balanced, overlapping** drive rather than an either/or signal. In a room of moderate density (between the ~10 %-and-~89 % band on `LOC_CROWDEDNESS`) **both** emitters fire and both active drives exist, constantly eroding each other while the Crowded-backup reservoir continues to accumulate. This produces the characteristic slow-moving quality of Creatures 3 social signals: the chemistry makes the drive **lag behind** the environment — minutes of dense company are needed before the bar rises noticeably, and minutes of solitude are needed before it falls noticeably.

## Sources

Crowded is produced by a single continuous endogenous sensorimotor emitter, a slow drip-release from the backup, one action-learning neuroemitter in the move lobe, and the usual direct-CAOS injection path. Nothing in the brain emits to it for "crowdedness appraisal" — production is driven by the creature's measured environment, not its cognition.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | `LOC_CROWDEDNESS` sensorimotor emitter | Gene 32 (emitter id 8) | Creature / Sensorimotor (tissue 4) | Locus 5 `LOC_CROWDEDNESS`, threshold 26, rate 6, gain 1, **analogue** (no flags) | Fires every 6 ticks with analogue gain scaling from the locus value whenever `LOC_CROWDEDNESS > 26/255 ≈ 10 %`. Because the locus is set to `room_crowded − self_contribution` by the creature's sensorimotor-sense calculation, it scales smoothly with the density of *other* same-kind Norns in the current room. Unlike the Loneliness emitter (DIGITAL + INVERT), this emitter is **analogue**, so the per-tick increment is *proportional* to how densely populated the room is — a Norn surrounded by ten companions fills the drive roughly 2.5× faster than a Norn with two |
| 2 | Backup → active drip | Gene 16 (reaction id 53) | Organ #2 "Reaction" | `1× Crowded backup [140] → 1× Crowded [157]` at half-life **311 ticks** ("Medium", decay rate 0.99777) | ≈0.22 %/tick of the reservoir is released into the active drive. This is the mechanism that surfaces banked social saturation: whatever Crowded-backup has accumulated during prior dense-room exposure slowly re-appears as active drive whenever the reservoir is non-zero, even if the creature is currently in a quiet room |
| 3 | Move-lobe neuroemitter | Gene 1 (neuroemitter id 1) | Brain / lobe 4 ("move") neuron 37 | rate 4 | Emits amount 6 to Crowded (alongside amount 5 to Fear [158] and amount 8 to chemical 117) whenever the specific movement-action neuron fires. This is the **only** brain-level input to the Crowded axis in the stock genome — a learning/reinforcement signal associated with certain motor actions, not a cognitive appraisal of social density. Its contribution to resting Crowded is small relative to the sensorimotor emitter, but it biases the decision lobe's reinforcement learning by tying movement choice to the crowded/fear coupling |
| 4 | Direct CAOS injection | — | Any | `CHEM 157 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot. Because reaction 63 sweeps the active drive into the reservoir at a 6-tick half-life (≈11 %/tick), a `CHEM 157 <n>` write peaks immediately and then decays rapidly over ~20–30 ticks. Most of the injected mass ends up banked into chemical 140 rather than lingering as active drive; any ambient Loneliness further accelerates the decay through reaction 24 |
| 5 | No initial concentration | — | — | Chemical 157 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly **0** active Crowded. Chemical 140 is also born at 0, so babies start the game perfectly neutral on the social axis; the first few ticks of `LOC_CROWDEDNESS` reading from the hatching room begin filling the reservoir from scratch | — |
| 6 | No pathology cross-coupling | — | — | Unlike the protein-hunger pair (which receives spillover from Pain via gene 20) or the sleep pair (which receives exogenous input from Sleep toxin), the Crowded pair is decoupled from injury, antigens, fever, hunger and the emotional drives. The only paths into chemical 157 are the sensorimotor emitter, the reservoir drip, and the move-lobe neuroemitter | — |
| 7 | Modded genomes | User-added | User-added | Common mods include: making the emitter DIGITAL so active Crowded jumps at a fixed rate past the threshold rather than scaling smoothly; raising the emitter gain above 1 for "claustrophobic" breeds; wiring an "unfamiliar-creature" perception neuron as a neuroemitter so *who* is present (not just *how many*) drives the signal; adding a Pain → Crowded backup spillover reaction to model trauma-induced social avoidance; gating reaction 53 with a catalyst so banked crowdedness only surfaces in response to a specific event chemical | Gene-dependent |

## Usage

Crowded has **two receptors** — the decision-lobe drive bar and a youth-gated circulatory receptor that gates the Stress (Crowded) stress pipeline — plus two consuming reactions and an annihilation with Loneliness. This is one more receptor than Loneliness has, and it is the key structural asymmetry between the two halves of the social axis.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Drives-tissue "Crowded" receptor | Gene 7 (receptor id 10) | Creature / Drives (tissue 5) | Locus 9 "Crowded", threshold 0, gain 209, analogue, from Baby | **The crowded drive bar the decision lobe reads to choose withdrawal behaviours.** Threshold 0 means proportional response at every level; gain 209 (symmetric with the Loneliness receptor's gain 207 on locus 8) puts the two ends of the social axis at comparable decision-lobe weighting. Without this receptor the Norn has no drive-level reason to seek empty space |
| 2 | Circulatory stress-gate receptor | Gene 54 (receptor id 158) | Creature / Circulatory (tissue 1) | Locus 10 "Locus 10", threshold 230, gain 255, **DIGITAL**, from Youth | **Fires only when active Crowded exceeds 230/255 ≈ 90 % of full scale**, writing a full-gain digital output into Circulatory Locus 10. This locus is in turn read by a locus-10 emitter (gene 20) that produces Stress (Crowded) [195] at rate 14, gain 6 whenever its own threshold (128) is met. The chain is therefore: **extreme active Crowded → Circulatory Locus 10 digital trip → Stress (Crowded) production**. The receptor switches on at Youth, so infant Norns cannot yet develop crowdedness stress — only sub-adult creatures and older respond biologically to dense rooms |
| 3 | Active → backup sweep | Gene 56 (reaction id 63) | Organ #2 "Reaction" | `1× Crowded [157] → 1× Crowded backup [140]` at half-life **6 ticks** ("Very short", decay rate 0.88978) | ~11 %/tick of the active drive is banked into the reservoir. This is a **single-pull** reaction (unlike the carb/fat/cold/hot pairs which have duplicated sweeps) — Crowded shares this single-pull design with Pain, Fear, Anger, Boredom, Need-for-pleasure, Sex-drive and the Loneliness pair. Single-pull means active mass survives a few extra ticks before banking, keeping short-term density spikes visible on the bar rather than smoothing them away completely |
| 4 | Crowded / Loneliness annihilation | Gene 104 (reaction id 24) | Organ #2 "Reaction" | `1× Crowded [157] + 1× Loneliness [156] → (nothing)` at half-life **19 ticks** ("Short", decay rate 0.96501) | Whenever both active drives exist, ~3.5 %/tick of the **smaller** pool is destroyed. This is NOT an instant-decay annihilation like Hotness/Coldness (reaction 23, half-life 0); the two social signals can coexist transiently for tens of ticks after a density change. The non-instant character is what produces the sluggish dynamics described below |
| 5 | Passive decay | Gene 64 entry #157 (half-life table) | Bloodstream | genomeValue 64, half-life **563 ticks** ("Medium", decay rate 0.99877) | ≈0.12 %/tick of the active drive decays on its own. This leaks mass out of the loop that otherwise cycles between 157 and 140 — the reason the pair is non-conservative and the reservoir slowly drains over very long timescales even with no annihilation or stress-pathway consumption |
| 6 | No sensorimotor or gait receptor | — | — | Unlike Tiredness (which fires `LOC_GAIT2`), Sleepiness (`LOC_GAIT3`), Hotness (`RLOCUS_CLOCKRATE`) or Coldness (`LOC_INVOLUNTARY4`), chemical 157 has no gait or involuntary-action reader. A crowded Norn walks at normal speed and does not exhibit gait changes — the behavioural response to crowdedness is wholly mediated through decision-lobe action selection and, at extremes, through the general stress-response block | — |
| 7 | Modded consumers | User-added | User-added | Modders may add a sensorimotor receptor on 157 to produce a "hunched" crowded-walk animation, a second circulatory receptor at a lower threshold to make stress activate earlier, an organ receptor on gonads to simulate crowd-induced mating suppression, or a brain-lobe receptor feeding a memory cell so the creature learns to recognise specific packed-room contexts | Gene-dependent |

## Role in Game Mechanics

### The social axis and its two emitters

Crowded and Loneliness form a **single-locus, two-emitter, mutually-annihilating** axis driven entirely by the sensorimotor reading `LOC_CROWDEDNESS` (tissue 4, locus 5). That reading is set once per creature tick by the creature's sensorimotor-sense calculation:

```text
myCrowdedLocus = 0.0
if world.GetMap().GetRoomPropertyMinusMyContribution(this, value):
    myCrowdedLocus = value
```

The map's "crowded" CA property is the summed presence of same-kind creatures in the room; the "minus-my-contribution" call subtracts the creature's own stamp so that no Norn senses itself. Two emitters then read the single locus:

| Emitter | Gene | Target | Threshold | Rate | Gain | Flags | Fires when |
|---------|------|--------|-----------|------|------|-------|------------|
| #8 | 32 | **157 Crowded** | 26 | 6 | 1 | **analogue** (none) | `LOC_CROWDEDNESS > 26/255 ≈ 10 %` (any neighbours present), **scales with density** |
| #7 | 41 | 156 Loneliness | 227 | 10 | 1 | DIGITAL + INVERT | `LOC_CROWDEDNESS < 227/255 ≈ 89 %` (almost always), **fixed drip** |

The key qualitative distinction is **analogue vs. digital**: Crowded fills in proportion to how densely populated the room is, whereas Loneliness fills at a fixed drip rate as long as the room is not already packed. In the wide middle band (density between ~10 % and ~89 %) **both emitters fire every tick**, and the net social signal is determined by the balance between the two production rates and reaction 24's annihilation. Only at the extremes does a single emitter dominate cleanly:

- **Completely alone** (`LOC_CROWDEDNESS ≈ 0`): only the Loneliness emitter fires. The Loneliness pair accumulates; the Crowded pair is inert.
- **Densely packed** (`LOC_CROWDEDNESS ≈ 1`): only the Crowded emitter fires, at full analogue gain. The Crowded pair accumulates rapidly; the Loneliness reservoir slowly drains via reaction 52 → reaction 24.
- **Middle band**: both emitters fire; reaction 24 annihilates the smaller pool; whichever side the emitter balance favours slowly wins. Because the Crowded emitter has a faster rate byte (6 vs 10) but only fires analogue-proportionally, moderate densities typically favour Crowded-net-loneliness-suppressed at the midpoint and tilt back toward Loneliness as the density falls.

The analogue design means Crowded is the **density-graded** drive: it does not switch on at a fixed threshold but rises more and more steeply as the room fills up.

### The sluggish "social weather" dynamic

Like Loneliness, Crowded is shaped by three stacked latencies that cooperate to make it a minutes-scale drive rather than a seconds-scale one:

1. **The emitter is analogue + gain-1** — the base per-tick increment is small, firing once every 6 ticks. Even a packed room produces only a moderate trickle of active Crowded, scaled by density.
2. **Reaction 63 sweeps at 11 %/tick** — the vast majority of what the emitter writes is banked into the reservoir within one or two ticks, so the drive bar barely notices individual emitter fires.
3. **Reaction 53 releases at 0.22 %/tick** — the backup drips back out over minutes, so accumulated crowdedness surfaces slowly as a smooth rising baseline rather than as a direct emitter-to-bar signal.

The combined effect is that crowdedness in Creatures 3 is a **chronic, slow-tracking** drive. A Norn briefly standing next to another creature shows no visible response. A Norn packed into a breeder hut for five in-game minutes shows a small but rising bar. A Norn left in a packed room for an hour shows a substantial bar that persists for minutes even after being moved to an empty room, because the reservoir must drain through reaction 53 → reaction 24 before the active drive finally subsides.

This is the same design language used for Loneliness, but applied to the opposite end of the same axis: the social drive system was not designed to respond to second-scale events (a companion walks past, a neighbour turns away), but to track the sustained social density of a Norn's life.

### The non-instant annihilation (reaction 24)

The most distinctive feature of the Crowded/Loneliness pair relative to the other antagonistic pair in the genome (Hotness/Coldness) is the **half-life of the annihilation reaction**:

| Pair | Reaction | Half-life | Speed | Co-existence |
|------|----------|-----------|-------|--------------|
| Hotness / Coldness (153 / 152) | Reaction 23 (gene 49) | 0 | "Instant decay" | Strictly mutually exclusive |
| Crowded / Loneliness (157 / 156) | Reaction 24 (gene 104) | 19 | "Short" | Transient overlap allowed |

Reaction 24 runs at ~3.5 %/tick of the smaller pool. This means after a density change, the losing side takes tens of ticks (seconds to a minute) to erode to zero. During that window the creature's decision lobe sees **both** drives at once and weights both in its action selection — a Norn who has just arrived in an empty room after a long period in a crowd momentarily "feels" both crowded (banked reservoir still draining via reaction 53) and somewhat lonely (new emitter firing), which is a plausible model of the ambiguous social state that follows a sudden change in company.

Over many ticks the Loneliness side wins because the Loneliness emitter keeps topping it up while the Crowded side is only receiving its slow drip from the reservoir; but the key gameplay consequence is that **social transitions are gradual**, not instantaneous. Moving a crowded Norn to an empty room does not instantly zero its crowdedness — the reservoir must drain through the slow reaction 53 pathway, with any fresh output colliding with the new Loneliness build-up via the non-instant reaction 24.

### The Stress (Crowded) pathway: the physiological asymmetry

The critical structural difference between Crowded and Loneliness is that Crowded has a **second receptor** — the circulatory stress-gate at gene 54 — which Loneliness lacks. This turns Crowded from a purely cognitive drive (like Loneliness, Fear, Anger, Boredom) into a **hybrid cognitive-physiological** one (like Tiredness and Sleepiness, which also have circulatory/gait side-effects).

The pathway runs:

```
  [157] Crowded (active drive)
    │
    ├──► gene 7 receptor → Drives locus 9 → decision-lobe "crowded" bar
    │    (threshold 0, analogue, from Baby — purely cognitive)
    │
    └──► gene 54 receptor → Circulatory locus 10
         (threshold 230 = 90%, DIGITAL, from Youth)
              │
              │   (Circulatory locus 10 is now digitally "tripped")
              ▼
         gene 20 emitter at Circulatory locus 10
         (threshold 128, rate 14, gain 6, DIGITAL)
              │
              ▼
         [195] Stress (Crowded)
              │
              ├──► gene 79 receptor → Circulatory locus 22
              │    (threshold 128, DIGITAL, from Youth)
              │
              └──► general stress-response consumers
                   (shared with other Stress* chemicals)
```

The chain has three gates. First, active Crowded must exceed 90 % of full scale — a substantial threshold that in practice is only reached after prolonged exposure to a densely populated room, because the sweep reaction keeps most of the per-tick emitter output in the reservoir rather than in the active drive. Second, the creature must be at Youth life stage or older; infant Norns have neither the gene-54 receptor nor the gene-20 emitter switched on yet. Third, the circulatory locus must itself exceed its own digital threshold (128) to fire the stress emitter. Because the upstream receptor writes full-gain (255) output when it trips, this third gate is always satisfied once the first two are.

Once the chain is live, Stress (Crowded) is produced at rate 14, gain 6 — a modest continuous drip that decays at its own Medium half-life (311 ticks). The stress chemical then participates in the generalised stress-response machinery: the gene-79 receptor on Circulatory locus 22 is the dedicated Stress (Crowded) reader, and it sits in a block with the other Stress* chemicals (Stress (Sleep) [193], Stress (Tired) [194], Stress (Pain) [192], Stress (Fear) [191], Stress (Anger) [190], Stress (H4F) [189]), all of which use identical DIGITAL receptors at threshold 128 to feed adjacent circulatory loci. This shared architecture means crowdedness-induced stress contributes to the same downstream physiological effects as sleep-deprivation stress, pain stress, fear stress, and anger stress — fitting the "stress is stress" design of the Creatures 3 circulatory block.

In practice this pathway is what makes chronically over-socialised Norns visibly unwell in late-stage play: not mildly motivated to avoid crowds (that is the drive bar), but biologically stressed by them, with the downstream circulatory consequences of Stress (Crowded) building up and persisting over minutes. The youth gate means this does not apply to babies — a crowded infant is merely motivated, not stressed — modelling the real-world observation that infant social tolerance is much higher than adolescent or adult tolerance.

### Why Crowded has a small but real active presence

In steady state, the sensorimotor emitter writes analogue-gain increments at rate 6 (every 6 ticks), and reaction 63 sweeps ~11 %/tick into the reservoir. The steady-state balance is approximately:

```
emitter_inflow (per tick) ≈ active × 0.11
⇒ active ≈ emitter_inflow / 0.11
```

With the emitter firing at gain proportional to density (so gain ≈ `LOC_CROWDEDNESS` × 1 / 255 of full scale) once every 6 ticks, the tick-averaged inflow rises linearly with room density. At full density the steady-state active Crowded sits at ~15 % of full scale — well below the 90 % threshold for the stress receptor, which means sustained high-density exposure is required for that gate to trip. At moderate density the steady-state active Crowded is single-digit percent, just barely visible on the drive bar.

The contrast with the metabolic drives is stark: a hungry Norn's Hunger-for-protein drive bar can rise rapidly because of cross-couplings to pain and `LOC_CONST`-driven baseline emitters. A crowded Norn's bar rises **slowly** and is soft-capped by the single-pull sweep, only reaching the stress-receptor threshold after an hour or more of packed conditions. This is intentional: the design makes sure crowdedness-induced stress is a *chronic* pathology, not an acute reaction.

### Decision-lobe consequences

The Drives receptor (gene 7) writes the drive-bar value into the decision lobe's input layer every tick. The decision lobe is trained (during lifetime via reinforcement and via the initial genome bias) to associate high Crowded readings with the **withdraw**, **move-to-empty-space**, and **avoid-companion** actions: walking away from other creatures, heading to unoccupied rooms, refusing interaction invitations. Because Crowded is a **reducible-by-action** drive (moving away lowers `LOC_CROWDEDNESS` below the emitter threshold), the decision lobe's reinforcement learning will identify these actions as reward-generating in the presence of crowdedness, cementing the withdrawal response pattern during normal life.

There is **no autonomic withdrawal pathway** (unlike Pain, which has an involuntary-action receptor): a crowded Norn does not flee reflexively, but because its cognitive layer has learned that moving away reduces the crowded drive. This is why Norns raised in perpetually-packed rooms can fail to develop normal withdrawal behaviour — the decision-lobe training never saw the crowdedness-reducing reinforcement signal and instead learned other actions (freezing, passivity) as the default response to high Crowded.

### The move-lobe neuroemitter coupling

The only brain-level input to chemical 157 is the neuroemitter at gene 1, which fires from move-lobe neuron 37 and simultaneously emits Crowded (6), Fear (5), and chemical 117 (8). This is an action-level learning signal: when that specific movement neuron fires, small doses of three drives are produced at once, creating a three-way reinforcement coupling in the decision lobe.

The gameplay consequence is subtle but real: movement actions associated with this neuron slightly elevate Crowded and Fear alongside their primary effect. Over time this couples certain motor patterns to a small crowded/fearful tail, which the decision lobe's learning mechanism can then use as an anchor for associating movement-in-crowds with the crowded-fear complex. This is how the biochemistry makes certain movement choices "feel" more socially heavy than others without requiring explicit behavioural rules.

### Interaction with the Loneliness drive

Because Crowded and Loneliness share a locus, an emitter pair, and an annihilation reaction, they behave as a **coupled axis** rather than two independent drives:

- **Low density**: Loneliness emitter fires, Crowded emitter silent. Active Loneliness accumulates; reservoir fills; drive bar rises gradually over minutes.
- **Moderate density**: Both emitters fire, both active drives exist, reaction 24 eats the smaller. The *net* bar tilt depends on the density: at low density the digital Loneliness drip dominates; at high density the analogue Crowded emission overtakes it. In practice, the crossover happens in rooms of 4–6 same-kind neighbours.
- **High density** (`LOC_CROWDEDNESS > ~90 %`): Only the Crowded emitter fires (Loneliness inversion threshold satisfied). Active Crowded accumulates; the Loneliness reservoir still drains via reaction 52, but each unit released is quickly annihilated by reaction 24 against the elevated Crowded. The Crowded bar rises steadily and eventually trips the stress receptor.

The result is that the social drive bar is **bimodal**: deeply lonely Norns and deeply crowded Norns both exhibit strong, sustained drive readings, while moderate-density Norns show a low baseline on both ends — the social-signal "resting state". This is mechanically elegant: the creature is motivated toward social behaviour in the extremes and is left alone to pursue other drives (hunger, sleep, exploration) during the balanced middle. Crowded's analogue design, however, gives it a slight edge at the high end compared to Loneliness at the low end — crowded stress is a more sharply scaling signal than loneliness accumulation.

### Effects of directly filling Crowded

A `CHEM 157 <n>` injection produces a sharp, short-lived spike:

1. **Tick 0:** Active Crowded rises to *n*. The decision-lobe drive bar reports a sudden jump. If *n* exceeds 230/255 and the creature is at Youth or older, the circulatory stress receptor trips immediately.
2. **Ticks 1–6:** Reaction 63 rapidly banks most of the injected mass into the reservoir at ~11 %/tick. Within 20–30 ticks most of the active drive has moved to chemical 140. If the stress receptor tripped, the downstream emitter continues producing Stress (Crowded) for the duration that the active drive stays above threshold.
3. **Minutes 1+:** Reaction 53 then drip-releases the banked mass at a 311-tick half-life, producing a gradually-decaying active Crowded tail over many minutes. The tail typically does not re-trip the stress receptor because the drip rate is too slow to get active Crowded above 230/255 again.
4. **If lonely:** Reaction 24 accelerates the destruction of the active drive, converting the spike and its slow tail into a faster decay to zero as Loneliness annihilates the surfacing Crowded.

A `CHEM 157 -n` write (negative, "relieve crowdedness") removes current active Crowded but leaves the reservoir untouched; the bar drops immediately but then slowly rises again as reaction 53 continues releasing banked mass. To truly zero a Norn's crowdedness one must write to both 157 and 140.

The canonical "social-saturation injection" for scripts and care agents is therefore `CHEM 140 <n>` (or `CHEM 140 -n`) rather than `CHEM 157`: writing to the reservoir produces a persistent, gradually-surfacing effect that the decision lobe responds to naturally, whereas writing to 157 produces a transient spike that the sweep reaction quickly buffers away — with the secondary caveat that a large enough `CHEM 157` injection can trip the stress pathway briefly, which `CHEM 140` cannot do directly (because reaction 53 drips the reservoir out too slowly to ever push active Crowded past the 230 threshold).

### Contrast with Tiredness and Sleepiness

Both Tiredness (154) and Sleepiness (155) have active drive chemicals with multiple receptors beyond the drive bar — Tiredness has an immune-tissue receptor and a `LOC_GAIT2` gait receptor; Sleepiness has a `LOC_GAIT3` receptor and an age-gated circulatory locus. Both produce **physical symptoms** that extend beyond decision-lobe motivation into gait, metabolism, and physiology.

Crowded is closer in spirit to these than to Loneliness. Like Tiredness and Sleepiness it has a circulatory pathway — specifically the stress gate — that activates a physiological response at extremes. However, it does **not** affect gait (no `LOC_GAIT` receptor), does **not** alter metabolism directly, and does **not** target the immune system. Its single physiological effect is the generalised stress response via the Stress (Crowded) chemical, which participates in the same downstream machinery as the other six Stress* chemicals. So Crowded is "half physiological": cognitive drive bar at all ages, plus a late-triggered generalised stress signal at youth+.

### Contrast with Fear, Anger, Boredom and the other emotional drives

Fear (158), Anger (160), and Boredom (159) are single-pull pairs and purely cognitive (drive bar only, no physiological side-effects). Structurally they are Loneliness's closest siblings — and Crowded's distant cousins.

| Drive | Primary source | Physiological side-effects |
|-------|----------------|---------------------------|
| Crowded (157) | Sensorimotor locus (`LOC_CROWDEDNESS`), analogue threshold | **Yes** (Stress (Crowded) via circulatory locus 10 at youth+) |
| Loneliness (156) | Sensorimotor locus, inverted digital threshold | No (drive bar only) |
| Fear (158) | Brain-lobe emitters (stimulus-classification based) | **Yes** (Stress (Fear) via similar circulatory pathway) |
| Anger (160) | Brain-lobe emitters (frustration / unmet-goal based) | **Yes** (Stress (Anger)) |
| Boredom (159) | `LOC_CONST` drip (constant baseline) | No (drive bar only) |

Crowded is the only sensorimotor-fed drive that has a stress-pathway coupling. Fear, Anger, Pain and the Hungers also feed their respective Stress* chemicals, but all of those are driven by brain-level or pathology-level sources, not by a direct environmental reading. Crowded is unique in being both **environmentally sensed** and **physiologically stressful** — the only drive where the creature's surroundings can directly make it biologically ill without any cognitive appraisal step in between.

### CAV save/load and imported creatures

The `MakeYourselfTired` shutdown helper does **not** touch the social chemicals — it writes only Tiredness (154) and Sleepiness (155). A creature exported to a CAV save therefore retains whatever 157 and 140 values it had at save time; a densely-socialised saved creature will arrive in its new world already carrying a substantial Crowded reservoir, and will quickly surface crowdedness on the drive bar once imported, with potential stress-pathway activation if the destination world is also densely populated.

Conversely, a creature saved while in a quiet room will arrive in its new world with zero crowdedness regardless of the destination density, and the reservoir will begin filling from scratch based on the new environment's `LOC_CROWDEDNESS` reading.

### Implications for modders

Common modifications built on Crowded:

1. **Replace the analogue emitter with a digital one at the same threshold.** Makes active Crowded rise at a fixed rate as soon as density crosses the threshold, rather than scaling smoothly. Produces a sharper "room-is-too-full" boundary and eliminates the graded response to density.
2. **Raise the emitter gain above 1**: The stock gain-1 setting is low; raising it to 4 or 8 makes crowdedness a much more responsive drive that can rise to visible (and stress-tripping) levels within seconds rather than minutes. Popular for "claustrophobic" breeds.
3. **Lower the Circulatory-locus-10 receptor threshold** below 230 to make the stress pathway activate at moderate densities rather than only at extremes. Produces creatures that visibly stress in modest crowds.
4. **Remove the Youth gate on the stress receptor** so that infants can also exhibit crowded-stress. Models species with no crowding tolerance at any life stage.
5. **Add a sensorimotor receptor on 157** to fire `LOC_GAIT2` at high Crowded, producing a "hunched-shoulders" walk for packed-in Norns.
6. **Add a brain-lobe receptor on 157** (e.g. a "social memory" lobe) so the cognitive layer has explicit awareness of chronic crowding beyond the decision-lobe drive bar. Enables learned avoidance strategies that respond to absolute crowdedness levels rather than just the reinforcement gradient.
7. **Cross-couple Pain to Crowded backup**: Add a `Pain → Crowded backup [140]` spillover reaction so injured Norns accumulate crowdedness, modelling "pain in a crowd makes you want to flee". Mirrors the gene 20 `Pain → Hunger for protein backup` reaction.
8. **Convert reaction 24 to "Instant decay"**: Makes the social axis strictly mutually exclusive like Hotness/Coldness. Eliminates the middle-band co-existence and produces sharp, on/off social signals.
9. **Add an organ-level receptor on 157** (e.g. on gonads or the reproductive organ) to simulate crowding-induced mating suppression, mirroring real-world population-density fertility effects.

Because 157 has only two stock receptors (drive bar and stress gate), modifications to its wiring are cleanly isolated from the rest of the biochemistry — they affect the crowded drive without perturbing metabolism, sleep, or the other emotional drives.

### Practical consequences for gameplay

- **Crowded rises over minutes, not seconds.** A Norn briefly in a packed room shows no visible response; exposure on the scale of several in-game minutes is required before the bar moves visibly. Below ~90 % density the bar rise will never trigger the stress pathway.
- **Crowded falls over minutes, not seconds.** Moving a crowded Norn to an empty room does not instantly zero its bar. Reaction 53 continues draining the reservoir for minutes; reaction 24's non-instant annihilation cannot clear the residue faster than reaction 53 produces it. Social satisfaction is *sluggish* on both transitions.
- **Newly-hatched Norns start neutral.** Both 157 and 140 have zero initial concentration. The first few ticks of `LOC_CROWDEDNESS` reading from the hatching room determine whether the reservoir starts filling immediately (crowded hatching environment) or stays near zero.
- **Infant Norns cannot get crowded-stressed.** The circulatory stress receptor switches on at Youth. A packed-room infant is motivated to withdraw (drive bar) but will not develop Stress (Crowded) until it matures. This models the higher social tolerance of real-world infants.
- **Density scales the response.** Because the emitter is analogue, a Norn in a room of ten fills the reservoir roughly 2.5× faster than a Norn in a room of four. Loneliness, by contrast, fills at a fixed rate regardless of how alone the creature is.
- **`CHEM 157 <n>` produces a brief spike**; `CHEM 140 <n>` produces a persistent, slowly-surfacing crowdedness. Care scripts and healing agents should write to the reservoir (140), not the active drive (157), unless the intent is specifically to trip the stress pathway transiently.
- **Drive bar shows only 157.** The Science Kit is the only stock tool that displays the reservoir at 140. A Norn with low active Crowded but high Crowded backup appears "fine" on the drives UI while carrying a substantial dormant social debt.
- **Chronic crowding is biologically stressful at youth+.** Unlike loneliness, which is purely cognitive, sustained high-density exposure (active Crowded > 90 %) produces Stress (Crowded), which feeds the generalised stress-response machinery. This is the chemistry behind "overpacked breeder hut makes older Norns visibly unwell".
- **Middle-band density is comfortable.** A Norn in a room with 2–3 companions has both Crowded and Loneliness at low active levels (the two emitters balance and reaction 24 consumes the overlap). This corresponds to the gameplay notion of "a socially adequate environment".
- **Imported creatures arrive carrying their history.** The shutdown helper does not touch 157 or 140, so a CAV-exported creature that was densely-socialised at save time will appear in its destination world with an intact Crowded reservoir, surfacing on its drive bar over the first few minutes after import.

### Summary

```
 Stock-genome wiring of Crowded [157]
 ───────────────────────────────────────
 Inputs:
   emitter #8 (gene 32) ──────────────────────────────────▶ [157]
     Sensorimotor / LOC_CROWDEDNESS (tissue 4 / locus 5)
     threshold 26, rate 6, gain 1, ANALOGUE (no flags)
     fires whenever LOC_CROWDEDNESS > 10 %, scaling with density
     LOC_CROWDEDNESS set by the sensorimotor-sense calculation
       = room_crowded − self_contribution (same-kind neighbours)

   reaction 53 (gene 16)  [140] → [157]
     half-life 311 ticks (Medium, ~10 s)
     continuous drip-release from the reservoir

   neuroemitter #1 (gene 1):
     move lobe neuron 37, rate 4 → amount 6 into [157]
     (also 5 into Fear [158], 8 into chemical 117)
     — only brain-level input to Crowded in the stock genome

   CHEM 157 <n>   (CAOS / scripts / mods)
   CAV import state (not touched by MakeYourselfTired)

         Crowded [157]              half-life 563 ticks (Medium)
         initial concentration: 0   decays ≈0.12 %/tick on its own
                 │
                 ├──► Drives receptor #10 (gene 7):
                 │       Drives tissue (5) / locus 9 / threshold 0 / gain 209, from Baby
                 │       → decision-lobe "crowded" bar
                 │
                 ├──► Circulatory receptor (gene 54):
                 │       Circulatory tissue (1) / locus 10 / threshold 230 DIGITAL, from Youth
                 │       → when active Crowded > 90 %, trips stress chain:
                 │           Circulatory locus 10 → emitter (gene 20) → Stress (Crowded) [195]
                 │           → circulatory locus 22 → generalised stress response
                 │
                 ├──► reaction 63 (gene 56):
                 │       [157] → [140]
                 │       half-life 6 ticks (Very short, ~11 %/tick)
                 │       single-pull sweep to the reservoir
                 │
                 └──► reaction 24 (gene 104):
                         [157] + [156] → (nothing)
                         half-life 19 ticks (Short, NOT instant)
                         cross-annihilation with the Loneliness drive

 Reservoir: Crowded backup [140]   half-life ≈9·10¹⁰ ticks (essentially permanent)

 Companion axis: Loneliness [156] emits from the same locus at threshold 227 INVERT+DIGITAL
                 produced when the room is sparse; mutually annihilates with 157
```

Crowded is the **sensorimotor-fed, analogue-scaled, hybrid cognitive-physiological active half** of the Creatures 3 social-density drive system. It is unique among drives in being produced by a measured property of the creature's environment **and** in being the only sensorimotor-fed drive that feeds the stress-response block: mild crowdedness merely motivates withdrawal via the decision lobe, but sustained high-density exposure past the 90 % threshold at Youth or older biologically stresses the creature via the Stress (Crowded) pipeline. Its chemistry — an analogue sensorimotor emitter that scales with density, a fast single-pull sweep to a near-permanent reservoir, a non-instant cross-annihilation with Loneliness, and a youth-gated circulatory stress gate — produces a slow-tracking, density-graded social motivation whose most distinctive feature is the late-triggered physiological stress response at the extreme end. Together with Crowded backup [140], Loneliness [156], and Loneliness backup [139], it forms the four-chemical social axis that the decision lobe weights when a Norn is choosing whether to seek, tolerate, or avoid company.
