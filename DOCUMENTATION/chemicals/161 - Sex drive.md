# 161 - Sex drive

Sex drive is the **active drive chemical** for the creature's sexual readiness — the urge to court, mate, and, for fertile females, to conceive. It sits in slot 14 of the sixteen "drive" chemicals in the 148–161 block and is the final entry in that block (chemical 162 "Comfort" begins the next drive-like group). It is paired with **Sex drive backup [144]** in the canonical Creatures 3 / Docking Station drive/reservoir architecture. Unlike the orphaned Fear/Anger reservoirs and the never-decaying Loneliness/Crowded/Boredom reservoirs, the Sex-drive pair sits in a **unique third dynamic class**: it has a fully-wired doubled active→backup sweep and a working backup→active drip (the full reservoir pattern), *and* the backup itself decays at "Medium" speed rather than being effectively permanent. The result is a reservoir with a minutes-scale memory rather than a lifetime-scale memory — long enough to smooth the Sex-drive curve across a courtship encounter, short enough to reset when the mate-compatible context disappears.

Sex drive is also the **most life-stage-gated drive in the game**. The receptor that reads it for drive-bar input fires from Baby, but the single stock inflow reaction (Arousal Potential + Opposite Sex Pheromone → Sex drive) and the fertilisation-gating LOC_RECEPTIVE receptor are both `switchOnAge=3 / switchOnStage=Youth`. Infants and children therefore *can* read a Sex-drive bar in the decision lobe but cannot produce the chemical through normal chemistry — any Sex drive they exhibit must have been injected by script or agent. Once a creature reaches the Youth stage, the axis comes online: the reproductive cycle (oestrogen/testosterone pathway) produces Arousal Potential, nearby mate-compatible creatures emit Opposite Sex Pheromone via pheromone agents, reaction 32 combines them into Sex drive at "Very short" speed, and the full cascade — drive bar, gait switch, fertilisation gate — begins to operate.

Three receptors span three tissues (Drives, Reproductive, Sensorimotor) and produce three distinct effects: a **decision-lobe sex-drive bar** (cognitive motivation to approach, court, and mate with other creatures), a **fertilisation probability gate in the female reproductive organ** (the LOC_RECEPTIVE digital locus that governs whether a sperm actually fertilises the egg), and a **gait switch to LOC_GAIT13** (the "courtship" / mating-walk pattern). There is also a biochemical antagonist — **Libido lowerer [40]** — that catalytically destroys Sex drive without being consumed itself, producing the refractory "just-had-enough" phase after a mating or after the genome's oestrogen/testosterone rhythm moves out of the arousal window. This makes Sex drive the only drive with a dedicated antagonist chemical in the stock genome.

## Sources

Sex drive has a single endogenous inflow reaction, the backup-drip, and direct CAOS injection. Unlike most drives, it has **no sensorimotor emitter, no brain neuroemitter, and no toxin** — the entire inflow is produced by the reproductive-cycle chemistry combined with ambient mate-compatible pheromones.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Arousal-Potential + Pheromone reaction (primary) | Gene 76 (reaction id 32) | Organ #2 "Reaction" | `1× Arousal Potential [39] + 1× Opposite Sex Pheromone [41] → 1× Sex drive [161]` at half-life **4 ticks** ("Very short", decay rate 0.82571), **switchOnAge 3 (Youth)** | ~17 %/tick of the co-available reactants is consumed and converted to Sex drive. This is the **only endogenous Sex-drive source in the stock genome**. Both reactants must be simultaneously present: Arousal Potential is produced by the oestrogen/testosterone rhythm of the reproductive cycle (via reactions 29/30 in the reaction organ), so it waxes and wanes with the sex-hormone cycle; Opposite Sex Pheromone is **not** produced inside the creature at all — it comes from external pheromone agents emitted by mate-compatible creatures via CAOS. The conjunction of "I am in my arousable phase" *and* "a potential mate is within pheromone range" is therefore the gating logic, enforced by chemistry rather than by the brain. The Youth gate means the entire axis is dormant in Babies and Children |
| 2 | Backup → active drive drip | Gene 18 (reaction id 55) | Organ #2 "Reaction" | `1× Sex drive backup [144] → 1× Sex drive [161]` at half-life **311 ticks** ("Medium", decay rate 0.99777). Switches on at Baby | Every tick, ~0.22 % of backup mass becomes active. This is the slow trickle from the reservoir that gives the pair its characteristic reservoir-shaped response curve — a fresh Sex-drive spike is partially banked into the backup by the doubled sweep reactions, then bled back out to the active drive over the next several minutes. Because the backup also has a Medium passive decay (unique among drive backups), the trickle fades naturally rather than sustaining indefinitely |
| 3 | No brain neuroemitter | — | — | The single stock neuroemitter (gene 1, lobe 4 "move" neuron 37) writes Adrenalin [117], Fear [158], and Crowded [157] — but **not** Sex drive. No stimulus-lobe, decision-lobe, or concept-lobe neuron emits into chemical 161 in the shipping genome. The brain has no way to decide "be aroused"; arousal is produced entirely by the reproductive-cycle + pheromone chemistry | — |
| 4 | No toxin pathway | — | — | Unlike Fear (Fear toxin 80), Pain (Pain toxin), Sleepiness (Sleep toxin), or temperature drives (Hot/Cold toxins), **Sex drive has no dedicated toxin chemical** in the 80s block. Scripts and agents that want to arouse a creature must either inject Arousal Potential (letting reaction 32 do the work when pheromones are nearby) or write Sex drive directly with CAOS | — |
| 5 | No sensorimotor emitter | — | — | Unlike Crowded/Loneliness (fed by `LOC_CROWDEDNESS`), Tiredness (fed by `LOC_TIREDNESS`), or Hotness/Coldness (fed by the temperature locus), Sex drive has **no stock sensorimotor locus that emits directly into it**. The creature does not "sense arousal" from any physical world-reading; the chemistry is purely hormonal (Arousal Potential from the reproductive cycle) plus olfactory (Opposite Sex Pheromone from external agents) | — |
| 6 | Direct CAOS injection | — | Any | `CHEM 161 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot. The injected mass splits three ways: the Short 95-tick passive decay nibbles it steadily (~0.73 %/tick), the doubled sweep reactions 65 + 73 pull ~21 %/tick into the reservoir, and — if Libido lowerer is present — the catalytic reaction 33 destroys some of it instantly. A `CHEM 161 50` on a Youth-stage Norn without Libido lowerer will drop the drive bar to ≈0 within ~20 ticks as the sweep redistributes it, then leak back out over the next minute via the backup → active drip |
| 7 | No initial concentration | — | — | Chemical 161 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly **0** active Sex drive. Chemical 144 is also born at 0, and because reaction 32 is Youth-gated, the entire axis remains empty throughout the Baby and Child stages regardless of environment | — |
| 8 | No cross-drive spillover | — | — | No stock-genome reaction routes Pain, hunger, fear, anger, coldness, hotness, tiredness, sleepiness, loneliness, crowdedness, boredom, or any other drive into Sex drive. The axis is isolated from the other fifteen drive chemicals at the chemical level | — |
| 9 | Modded genomes | User-added | User-added | Common mods include: adding a stimulus-lobe "attractiveness recognition" neuroemitter so the cognitive system contributes to arousal; adding a Sex-drive toxin chemical so scripts can directly drive the level without going through the reproductive-cycle chemistry; wiring Adrenalin into reaction 32 as a catalyst to make arousal stack with excitement; lowering or removing the Youth gate on reaction 32 so pre-pubescent creatures can also produce Sex drive; adding a Pain → Sex-drive spillover for "comfort-seeking" behaviour after injury; raising the reservoir genomeValue from 54 toward 255 so Sex drive backup becomes a long-memory reservoir like the other drive backups | Gene-dependent |

## Usage

Sex drive has **three receptors** — Drives (cognitive drive bar), Reproductive (LOC_RECEPTIVE fertilisation gate), Sensorimotor (LOC_GAIT13 courtship gait) — plus three consuming reactions (the Libido-lowerer catalytic sink, a passive destruction reaction, and the doubled active → backup sweep) and the Short-speed passive decay.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Drives-tissue "Sex drive" receptor | Gene 13 (receptor id 14) | Creature / Drives (tissue 5) | Locus 13 "Sex drive", threshold 0, gain 223, analogue, **from Baby** | **The sex-drive bar the decision lobe reads to choose approach/court/mate behaviours.** Threshold 0 means every level produces proportional decision-lobe input; gain 223 is slightly higher than Fear's 209 and Anger's 202, putting sexual motivation near the top of the drive-weighting hierarchy. This is the *purely cognitive* side of the sex-drive response — the signal that biases the decision lobe toward learned courtship and mating actions (kiss-pop, approach opposite sex, mating dance). Despite the Baby stage-gate here, the drive-bar value is 0 in practice throughout Baby/Child because reaction 32 cannot yet fire — the receptor wiring is stage-permissive but the chemistry is stage-gated |
| 2 | Reproductive LOC_RECEPTIVE receptor | Gene 73 (receptor id 120) | Creature / Reproductive (tissue 2) | Locus 1 LOC_RECEPTIVE, threshold 48, nominal 16, gain 255, **DIGITAL**, **from Youth** | **The fertilisation probability gate for females.** When Sex drive exceeds 48/255 (≈19 % of full scale), this digital receptor trips with full gain and writes 1.0 into the female's `myReceptiveLocus` float. The reproductive faculty's sperm-acceptance routine (`AcceptSperm`) reads this field and uses it as a probability gate: on each sperm-transfer event, fertilisation succeeds only if `RndFloat() < myReceptiveLocus`. A receptive female (Sex drive > 48) therefore fertilises with probability 1.0; a non-receptive female fertilises with probability 0.0. This is the biochemical implementation of "consent at the cellular level" — the Creatures 3 design philosophy that the female's own chemistry, not just the male's advance, determines whether conception occurs. The Youth gate on this receptor means pre-pubescent females cannot conceive under any circumstances, even if their Sex drive is externally raised via CAOS |
| 3 | Sensorimotor LOC_GAIT13 receptor | Gene 130 (receptor id 193) | Creature / Sensorimotor (tissue 4) | Locus 21 LOC_GAIT13, threshold 51, gain 207, analogue, from Baby | **Courtship-gait switching.** Whenever Sex drive exceeds 51/255 (≈20 % of full scale), sensorimotor gait-13 (the "courtship" / "mating-dance" gait pattern) is activated with gain 207. This is how arousal changes *how* the creature moves: the swaying, bouncy courtship stride that is visually distinctive from the normal walk, the fear-panic run (gait 4), or the anger-stomp (gait 5). Because this receptor is gated from Baby rather than Youth, a CAOS-injected Sex-drive spike in a Child will switch gait-13 on even though no fertilisation is possible — producing the pre-pubescent courtship-dance behaviour occasionally used in scripted scenes |
| 4 | Libido-lowerer catalytic destruction | Gene 72 (reaction id 33) | Organ #2 "Reaction" | `1× Libido lowerer [40] + 1× Sex drive [161] → 1× Libido lowerer [40]` at **Instant decay** (genomeValue 0, decay rate 0), **switchOnAge 3 (Youth)** | Whenever Libido lowerer [40] is present in the bloodstream, it **catalytically destroys Sex drive at maximum rate** — the Libido lowerer is preserved through the reaction (appears on both sides), so a tiny amount of it continues to eliminate every fresh unit of Sex drive until the Libido lowerer itself decays. This is the biochemical implementation of the post-orgasmic / refractory / "just had enough" phase: the oestrogen/testosterone rhythm produces Libido lowerer on the falling edge of the cycle (reaction 36 converts Arousal Potential into Libido lowerer via the same catalytic pattern), and the Libido lowerer then cancels out the creature's Sex drive until the reproductive-cycle phase rotates back into Arousal-Potential production |
| 5 | Unconditional passive destruction | Gene 150 (reaction id 35) | Organ #2 "Reaction" | `1× Sex drive [161] → (nothing)` at half-life **10 ticks** ("Very short", decay rate 0.93127), **switchOnAge 3 (Youth)** | A secondary drain reaction that destroys ~7 %/tick of Sex drive unconditionally at Youth+. This adds to the Short-speed (95-tick) passive decay in the half-life table, giving the active drive a *much* faster effective clearance than its "Short" passive decay alone would suggest. A Youth-stage creature's Sex drive halves every ~10 ticks (~0.33 s) from this reaction alone, plus the doubled active → backup sweep. The net half-life of the active chemical at Youth, ignoring Libido lowerer, is therefore only a few ticks — the chemical only persists because the reactions 32 (inflow) and 55 (drip) continuously replenish it |
| 6 | Active → backup sweep (doubled) | Genes 58 + 70 (reaction ids 65 + 73) | Organ #2 "Reaction" | `1× Sex drive [161] → 1× Sex drive backup [144]` — two identical reactions, each at half-life **6 ticks** ("Very short", decay rate 0.88978). Switches on at Baby | Each of the two reactions consumes ~11 %/tick of the active Sex drive; combined they sweep ~21 %/tick into the reservoir. This is the same doubled-refill pattern used by the hunger/temperature/tiredness pairs, in contrast to the single-pull pattern used by Loneliness/Crowded/Boredom. The doubled sweep is what makes active Sex drive short-lived even outside the Libido-lowerer cycle: most of a fresh Sex-drive spike is banked into chemical 144 within a fraction of a second, then slowly returned via reaction 55 over the next several minutes |
| 7 | Passive decay | Gene 64 entry #161 (half-life table) | Bloodstream | genomeValue 46, half-life **95 ticks** ("Short", decay rate 0.99271) | ~0.73 %/tick spontaneous decay. This is the slower background drain that operates even in Babies and Children where the Youth-gated destruction reaction 35 is not yet active. For a pre-Youth creature with CAOS-injected Sex drive, this is the only non-sweep drain, giving the drive a comparatively long tail in young creatures (~3 s half-life) until it is pushed into the reservoir by reactions 65 + 73 | 
| 8 | Modded consumers | User-added | User-added | Modders may add a brain-lobe receptor on 161 so the stimulus lobe or concept lobe reads arousal directly; a somatic RLOCUS_CLOCKRATE receptor to make arousal accelerate the heart (matching Fear's cardiac coupling); a circulatory panic locus on 161 to produce a Stress-(Sex drive) chemical mirroring Stress (Fear) and Stress (Anger); a male LOC_FERTILITY receptor so that male reproductive success also gates on chemistry, not just on the approach/court decision; or lowering the LOC_RECEPTIVE threshold from 48 toward 0 to make females fertilise more readily. Raising the Libido-lowerer production rate via reaction 36 shortens the refractory period; removing reaction 33 makes Sex drive immune to the Libido lowerer antagonist entirely | Gene-dependent |

## Role in Game Mechanics

### The reproductive-cycle chemistry

Sex drive sits at the downstream end of a four-chemical loop implemented in the reaction organ:

1. **Oestrogen / Testosterone** (chemicals 46 / 53) — the sex hormones, driven by the creature's reproductive-cycle clock (separate reactions produce them in rhythmic pulses).
2. **Arousal Potential** (chemical 39) — produced from oestrogen/testosterone via reactions 29/30 on the upswing of the hormonal cycle.
3. **Libido lowerer** (chemical 40) — produced from Arousal Potential via reaction 36 (`Libido lowerer + Arousal Potential → Libido lowerer`, catalytic) on the downswing.
4. **Sex drive** (chemical 161) — produced from Arousal Potential combined with **external** Opposite Sex Pheromone via reaction 32.

The logic this encodes is: *the creature can only become aroused when its own hormonal cycle is in the Arousal-Potential phase **and** a potential mate is within pheromone range.* Both conditions must hold simultaneously because reaction 32 requires both reactants. The Libido lowerer that Arousal Potential slowly converts into (reaction 36) then actively *destroys* Sex drive via reaction 33 — the chemistry naturally cycles through a "ready → peak → refractory" progression even without any mating actually happening.

Opposite Sex Pheromone is not a chemical produced inside the creature. It is **emitted by the world** via pheromone agents: mate-compatible creatures release pheromone agents that raise chemical 41 in nearby receivers. The pheromone-response half of the system is therefore implemented as CAOS agents rather than as biochemistry, but reaction 32 connects the two worlds cleanly — the creature's internal readiness chemistry combines with the external olfactory signal to produce the behavioural drive.

### The LOC_RECEPTIVE fertilisation gate

The single most important receptor on Sex drive is the Reproductive-tissue LOC_RECEPTIVE gate (receptor 120, gene 73). This is a DIGITAL receptor with threshold 48 and gain 255, gated from Youth. When active Sex drive exceeds ~19 % of full scale, the receptor writes 1.0 into `myReceptiveLocus` on the female's reproductive faculty.

When a male successfully courts a female and the mating event transfers sperm, the sperm-acceptance routine (`AcceptSperm`) checks three conditions:

1. A fertile egg is present (`myGamete`).
2. A sperm is present on the male's side (`dad.Reproductive().myGamete`).
3. The female is not already pregnant (`!IsPregnant()`).

If all three hold, conception proceeds **only if** `RndFloat() < myReceptiveLocus`. The practical values are:

- `myReceptiveLocus = 1.0` (Sex drive > 48): `RndFloat()` ∈ [0,1) is always below 1.0 → **conception always succeeds**.
- `myReceptiveLocus = 0.0` (Sex drive ≤ 48): `RndFloat()` is never below 0.0 → **conception never succeeds**.

Because the receptor is digital with full gain, there is no "partial receptivity" — the female is either fully fertile or completely infertile at any given moment, with the boundary at Sex drive 48. This gives the player a meaningful handle on breeding: a Norn with Sex drive stubbornly below 48 (because her hormonal cycle is in the Libido-lowerer phase, or because no mate-pheromones are nearby) cannot conceive no matter how many mating events occur. A Norn whose Sex drive crosses 48 becomes immediately conception-capable. This is how the stock genome enforces rhythmic fertility rather than constant fertility.

The reproductive faculty's design comment spells out the design intent:

> "As well as the various biological necessities such as sperm and egg, another control over successful fertilisation is the value on the female's loc_receptive receptor. This allows chemistry to give the female some say in the issue. For example, this receptor could be driven by the sex drive, which might be raised by some pheromone emitted by the male during a courtship dance."

This is the precise mechanism the stock genome implements.

### Gait 13 — the courtship dance

The LOC_GAIT13 sensorimotor receptor (gene 130) writes into the sensorimotor gait-13 channel whenever Sex drive exceeds 51/255 (~20 % of full scale, just above the LOC_RECEPTIVE threshold of 48). Gait 13 is the "courtship" gait pattern — a swaying, exaggerated stride visually distinct from the normal walk, panic run (gait 4), anger stomp (gait 5), or other gait channels. The near-coincidence of the gait-13 threshold (51) with the LOC_RECEPTIVE threshold (48) means that when a female becomes conception-capable, she simultaneously begins displaying the courtship gait — the visual signalling and the chemical readiness are chemically synchronised.

Because this receptor is gated from Baby (not Youth), a CAOS-injected Sex-drive spike in a Child will switch gait-13 on even though no fertilisation is possible. This lets scripts stage courtship scenes in pre-pubescent creatures for narrative purposes without breaking the fertility model.

### The Libido-lowerer refractory cycle

Libido lowerer [40] catalytically destroys Sex drive at **instant decay rate** via reaction 33. As long as Libido lowerer is present, every fresh unit of Sex drive produced by reaction 32 is immediately annihilated. This produces the post-arousal refractory phase:

1. **Ascending phase**: Oestrogen/Testosterone is high, Arousal Potential rises, Libido lowerer is still depleted. Reaction 32 converts Arousal Potential + Opposite Sex Pheromone into Sex drive rapidly. Sex drive bar rises, gait-13 engages, LOC_RECEPTIVE trips — the creature becomes visibly aroused and fertile.
2. **Peak**: Sex drive saturates toward 255 if pheromones remain available. Mating / conception / kiss-pop events can occur.
3. **Descending phase**: Reaction 36 converts the remaining Arousal Potential into Libido lowerer. Reaction 33 then begins destroying any newly-produced Sex drive on the spot, while the doubled active → backup sweep continues pulling existing Sex drive into the reservoir. The active drive falls to zero within seconds, even if pheromones are still present.
4. **Refractory**: Libido lowerer is the only chemical standing. Arousal Potential is exhausted, so reaction 32 cannot fire. Sex drive backup drips some chemical back into the active pool via reaction 55, but reaction 33 destroys it before it can accumulate. The creature is uninterested in mating until the reproductive cycle rotates forward and produces fresh Arousal Potential.

The refractory period length is determined by how long Libido lowerer persists, which is controlled by chemical 40's own passive decay and the reproductive-cycle rhythm. See the Libido lowerer [40] documentation for the antagonist side of this pair.

### The short-memory reservoir

Sex drive backup [144] is the only drive backup in the stock genome that has a finite passive decay (half-life 209 ticks, "Medium"). Combined with the doubled active → backup sweep (~21 %/tick from reactions 65 + 73) and the Medium-speed backup → active drip (~0.22 %/tick from reaction 55), this gives the Sex-drive pair a characteristic **minutes-scale memory** rather than the lifetime-scale memory of the hunger/temperature/tiredness pairs.

In practice, a successful mating event produces:

1. A sharp Sex-drive spike (reaction 32 firing rapidly while pheromones are nearby).
2. Rapid banking of most of that mass into the reservoir (reactions 65 + 73 at ~21 %/tick).
3. A slowly-declining backup level (Medium 209-tick passive decay + reaction 55 drip).
4. Over 1–2 minutes, the reservoir drains to zero and the active drive settles back to zero alongside it.

By contrast, a hunger spike banks into a *permanent* reservoir — the creature remembers it was hungry this morning even at bedtime. Sex drive deliberately forgets: the creature's sexual history is chemically ephemeral.

This design choice avoids pathological behaviour like "Norn was aroused ten minutes ago and still has a courtship-gait bias". It also simplifies breeding: a newly-introduced mate produces a fresh arousal cycle regardless of prior history, rather than having to overcome a cumulative lifetime-long backup.

### Effects of directly filling Sex drive

A `CHEM 161 <n>` injection on a Youth-stage creature produces a distinctive rapid-then-fading pattern:

1. **Tick 0**: Active Sex drive rises to *n*. Drive bar jumps, gait-13 engages if *n* > 51, LOC_RECEPTIVE trips if *n* > 48.
2. **Ticks 1 → 10**: Reaction 35 destroys ~7 %/tick, reactions 65 + 73 sweep another ~21 %/tick into the reservoir. The active chemical falls rapidly.
3. **Ticks 10 → 50**: Most of the injected mass is now in the reservoir. Active level is a small fraction of *n*. If *n* was large, the reservoir is full enough that reaction 55 can continue dripping significant active Sex drive for a minute or so.
4. **Minutes afterward**: The reservoir drains via its Medium passive decay and reaction 55. Active drive persists at low levels but below the 48/51 thresholds, so gait-13 disengages and LOC_RECEPTIVE drops back to 0.

If Libido lowerer is present at injection time, step 2 accelerates dramatically — reaction 33 fires at instant decay and sweeps the injected mass away before it can do anything useful. This is how an agent script can deliberately *prevent* a scripted arousal from working: inject Libido lowerer first, and any subsequent Sex drive write will be eaten instantly.

Injecting Sex drive in a Baby or Child creature bypasses the Youth-gated destruction reactions (33 and 35) but still triggers the sweep to the reservoir. The level decays at the Short 95-tick passive-decay rate rather than the aggressive reaction-35 rate, giving pre-pubescent injections a ~3-second active half-life. The gait-13 and drive-bar receptors will fire but the LOC_RECEPTIVE receptor will not (Youth-gated), so scripts can produce pre-pubescent "flirt poses" without accidentally creating pre-pubescent conception.

### CAV save/load and imported creatures

The `MakeYourselfTired` shutdown helper does **not** touch chemical 161. An exported Norn retains whatever Sex drive value it had at save time, just like Fear and Anger. However, because the active chemical has an aggressive effective clearance (Short passive decay + Youth-gated reaction 35 + doubled sweep), any Sex drive present at save time is gone within a few seconds of the creature being re-imported into a new world. The Sex drive backup is preserved and will drip back out over the next minute or two, but the backup's own Medium passive decay eliminates it entirely within a few minutes of real time in the new world.

In practice, imported creatures arrive sexually "reset" — their reproductive chemistry restarts from effectively zero within the first minute of the new environment, regardless of their pre-export state. This is convenient for players who move a Norn to a new world and don't want residual arousal chemistry from the old world affecting breeding decisions in the new one.

### Contrast with the other drives

| Drive | Primary source | Reservoir | Receptors | Life-stage gating | Antagonist |
|-------|----------------|-----------|-----------|-------------------|------------|
| Fear (158) | Toxin + Anger exchange + neuroemitter | None (orphan) | 4 (drive, clock, gait, panic) | Baby+ | — |
| Anger (160) | Fear exchange only | None (orphan) | 3 (drive, gait 5, panic) | Baby+ | — |
| **Sex drive (161)** | **Arousal Potential × Pheromone** | **Yes (144, short-memory)** | **3 (drive, LOC_RECEPTIVE, gait 13)** | **Youth+ for chemistry, Youth+ for fertilisation** | **Libido lowerer [40]** |
| Hunger for protein (149) | Amino-acid deficit | Yes (132) long-memory | 2 (drive, panic@>214) | Baby+ | — |
| Loneliness (156) | Sensorimotor (inverse density) | Yes (139) permanent | 1 (drive) | Baby+ | Crowded [157] via reaction 24 |
| Boredom (159) | `LOC_CONST` drip | Yes (142) permanent | 1 (drive) | Baby+ | — |

Sex drive is uniquely distinguished by four features: it is the only drive with a **dedicated antagonist chemical** (Libido lowerer); it is the only drive whose primary inflow requires **two simultaneous reactants** (Arousal Potential × Opposite Sex Pheromone); it is the only drive with a **short-memory reservoir** (finite backup decay); and it is the only drive with a **fertility-gating receptor** that controls a physical reproductive event rather than just a drive bar or gait.

### Implications for modders

Common modifications built on Sex drive:

1. **Lower the Youth gate on reaction 32** (e.g. to Child) so pre-pubescent creatures can produce Sex drive naturally — paired with lowering the Youth gate on receptor 120 if pre-pubescent fertility is desired (controversial; usually kept Youth-gated while letting earlier arousal occur without fertilisation).
2. **Add a stimulus-lobe neuroemitter on 161** so the brain's cognitive appraisal contributes to arousal directly, not just the reproductive-cycle × pheromone chemistry. Useful for mods that add "attractiveness" as a recognisable concept.
3. **Raise the Sex drive backup decay (genomeValue 54 → 255)** to convert the reservoir to long-memory, matching the other drive backups. Produces creatures whose arousal lingers for many minutes after an encounter.
4. **Lower the LOC_RECEPTIVE threshold from 48** to make females conception-capable at lower Sex-drive levels. Produces "always-receptive" breeds with high fertility.
5. **Add a male-side LOC_FERTILITY receptor on 161** so male reproductive success also gates on chemistry. Currently males can father offspring regardless of their own Sex drive, provided the female is receptive — adding a male gate produces "mutual consent" breeding.
6. **Remove reaction 33 (Libido lowerer → eats Sex drive)** to eliminate the refractory period entirely. Creates constantly-aroused breeds.
7. **Raise the gain on the Drives receptor from 223 to 255** to make sexual motivation dominate all other drives. Produces single-minded breeding-focused creatures.
8. **Add a Pain → Sex drive spillover reaction** for "comfort-seeking" post-injury mating behaviour.
9. **Add a circulatory panic locus on 161** to mirror Fear/Anger and produce a Stress-(Sex drive) chemical for generalised stress from sexual frustration.
10. **Add an Adrenalin-catalysed autocatalytic amplifier** like Fear's reaction 38 or Anger's reaction 39, so that sex drive in the presence of excitement cascades to full saturation. Produces explosive courtship responses when pheromones hit during fear/anger episodes.

### Practical consequences for gameplay

- **Sex drive is absent before Youth.** Baby and Child Norns cannot produce it through normal chemistry; any Sex drive they show must have been injected by script. They can read a Sex-drive bar but it is always zero in practice.
- **Sex drive requires both hormonal readiness and a nearby mate.** The oestrogen/testosterone cycle produces Arousal Potential on its upswing, and mate-compatible creatures emit Opposite Sex Pheromone via agents. Both must coincide for reaction 32 to fire.
- **Sex drive oscillates with the reproductive cycle.** The upswing → peak → refractory pattern is chemically enforced by the interplay of Arousal Potential (source) and Libido lowerer (antagonist). Norns naturally experience rhythmic fertility.
- **Sex drive > 48 makes females conception-capable.** The LOC_RECEPTIVE digital gate is the single biochemical switch for female fertility. Below the threshold, no sperm-transfer event can produce conception; above it, every such event succeeds.
- **Sex drive > 51 produces the courtship gait.** Arousal is visually recognisable via gait-13 switching.
- **Sex drive has a rapid effective clearance at Youth+.** Reaction 35 destroys ~7 %/tick, plus the doubled sweep to the reservoir. A Sex-drive spike fades within a few seconds unless continuously replenished by reaction 32.
- **Sex drive has a short-memory reservoir.** The 209-tick backup decay plus 311-tick drip means a sex-drive spike is remembered for about a minute, then forgotten. No lifetime accumulation.
- **Libido lowerer is a hard antagonist.** When Libido lowerer is present, Sex drive cannot exist in the bloodstream at all — reaction 33 destroys it instantly. This is the biochemical implementation of the refractory period.
- **`CHEM 161 <n>` decays fast.** Unlike Fear/Anger CAOS writes (which persist for tens of seconds), Sex drive CAOS writes are aggressively consumed by sweep and destruction reactions within a few ticks. Scripts that want sustained arousal must either inject Arousal Potential (along with pheromones) or repeatedly re-inject Sex drive.
- **Imported creatures arrive sexually reset.** The aggressive clearance eliminates any saved Sex drive within seconds of arrival; the short-memory reservoir drains within a minute. Pre-export arousal state does not persist meaningfully into the new world.
- **Newly-hatched Norns start at zero Sex drive.** No initial concentration, no production before Youth. The axis is entirely dormant through the first two life stages.

### Summary

```
 Stock-genome wiring of Sex drive [161]
 ─────────────────────────────────────
 Inputs:
   reaction 32 (gene 76, Youth+)  Arousal Potential [39] + Opposite Sex Pheromone [41]
                                  → Sex drive [161]
     half-life 4 ticks (Very short, ~0.13 s) — the primary source
     Pheromone comes from external agents, not internal chemistry

   reaction 55 (gene 18, Baby+)   Sex drive backup [144] → Sex drive [161]
     half-life 311 ticks (Medium, ~10 s) — reservoir drip

   CHEM 161 <n>  (CAOS / scripts / mods)
   CAV import state (rapidly cleared after import)

   (no toxin, no sensorimotor emitter, no neuroemitter, no initial concentration)

         Sex drive [161]             half-life 95 ticks (Short, ~3.2 s)
         initial concentration: 0    decays ≈0.73 %/tick passively
                 │
                 ├──► Drives receptor #14 (gene 13, Baby+):
                 │      Drives tissue (5) / locus 13 / threshold 0 / gain 223, analogue
                 │      → decision-lobe "sex drive" drive bar
                 │
                 ├──► Reproductive receptor #120 (gene 73, Youth+):
                 │      Reproductive tissue (2) / LOC_RECEPTIVE / threshold 48 / gain 255 DIGITAL
                 │      → myReceptiveLocus = 1.0 above threshold
                 │      → fertilisation probability gate in AcceptSperm()
                 │
                 ├──► Sensorimotor receptor #193 (gene 130, Baby+):
                 │      Sensorimotor tissue (4) / LOC_GAIT13 / threshold 51 / gain 207, analogue
                 │      → courtship / mating-dance gait
                 │
                 ├──► reaction 33 (gene 72, Youth+):
                 │      Libido lowerer [40] + Sex drive → Libido lowerer  (INSTANT decay)
                 │      — catalytic antagonist, refractory-period enforcer
                 │
                 ├──► reaction 35 (gene 150, Youth+):
                 │      Sex drive → (nothing), Very short 10 ticks
                 │      — unconditional aggressive clearance at Youth+
                 │
                 ├──► reactions 65 + 73 (genes 58 + 70, Baby+):
                 │      Sex drive → Sex drive backup, Very short 6 ticks each (doubled sweep)
                 │      — banking into the short-memory reservoir
                 │
                 └──► passive decay  half-life 95 ticks (Short)
                      — background baseline drain

 Companion reservoir: Sex drive backup [144]
   — unique among drive backups: Medium 209-tick passive decay (not Very long)
   — gives the pair a minutes-scale memory rather than lifetime memory

 Antagonist: Libido lowerer [40]
   — catalytically destroys Sex drive at instant rate
   — produced from Arousal Potential by reaction 36 on the downswing of the
     oestrogen/testosterone cycle, enforcing the refractory period

 Reproductive-cycle chain:
   Oestrogen/Testosterone → Arousal Potential → (+ Pheromone) → Sex drive
                                             → Libido lowerer (which eats Sex drive)
```

Sex drive is the **mate-gated, short-memory, refractory-controlled sexual readiness drive** of the Creatures 3 biochemistry — the single chemical that governs female fertility, courtship-gait display, and decision-lobe courtship motivation. Its chemistry — a dual-reactant primary source (Arousal Potential × Opposite Sex Pheromone), a short-memory reservoir that forgets within a minute, a dedicated catalytic antagonist (Libido lowerer), and a full Youth gate on the key reactions and the fertility receptor — produces the rhythmic, context-sensitive reproductive behaviour the Creatures 3 genome was designed around. A Norn is aroused only when both its own hormonal cycle and its immediate environment permit, the arousal fades quickly after the triggering conditions vanish, and the resulting fertility window is gated at the female reproductive organ by the LOC_RECEPTIVE digital receptor reading this exact chemical. Together with its short-memory reservoir Sex drive backup [144] and its chemical antagonist Libido lowerer [40], it completes the reproductive-axis that governs breeding rhythm, consent, and courtship display across the entire Creatures 3 / Docking Station genome.
