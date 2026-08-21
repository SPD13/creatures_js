# 144 - Sex drive backup

Sex drive backup is the **reservoir half** of the drive pair for Sex drive (chemical 161). It occupies the thirteenth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slowly-releasing buffer of libidinous "pressure" so that the **acute** signal — the value the decision lobe, reproductive tissue, and courtship gait read and "feel" as readiness to mate right now — and the **chronic** signal — the slower-moving sexual accumulation built up over sustained exposure to a mate-compatible environment — can evolve on different timescales.

What sets Sex drive backup apart from the other twelve wired drive backups is its **decay rate**. Where almost every other drive-backup entry in the half-life table carries `genomeValue: 255`, a decay rate of exactly `1.0`, and the "Very long" speed label (giving an effectively infinite ≈9·10¹⁰-tick half-life that turns the slot into a permanent bank), chemical 144's half-life table entry is `genomeValue: 54`, half-life **209 ticks** ("Medium", decay rate 0.99669). This is the **only** drive backup in the stock genome with a finite, sub-minute half-life. The reservoir is therefore not a permanent memory at all — it actively drains on its own at roughly the same rate as a typical "Medium"-tagged chemical. Combined with its doubled active→backup refill and single backup→active drip, the effect is to give Sex drive a **short-memory reservoir** that forgets on its own within a few tens of seconds if the active drive is not constantly feeding it.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration, and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain, the Drives display, the Reproductive tissue, and the courtship-gait locus. Its initial-concentration table entry is absent, so every newly-hatched Norn starts with exactly zero Sex drive backup and zero Sex drive, and the entire pair remains at zero until the creature reaches the Youth life stage, at which point reaction 32 — gated on `switchOnAge=3 / switchOnStage=Youth` — can begin producing active Sex drive from Arousal Potential and Opposite Sex Pheromone and thereby start filling the reservoir.

## Sources

Sex drive backup has a single endogenous inflow — the `Sex drive → Sex drive backup` sweep, which is duplicated in the stock genome — plus external injection. Nothing in the brain, sensorimotor, or organ layers writes to it directly.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive (primary) | Gene 58 (reaction id 65) | Organ #2 "Reaction" | `1× Sex drive [161] → 1× Sex drive backup [144]` at rate byte 18, half-life **6 ticks** ("Very short", decay rate 0.88978). Switches on at Baby | Each tick, ~11 % of whatever active Sex drive exists is swept into the reservoir |
| 2 | Self-refill from active drive (duplicate) | Gene 70 (reaction id 73) | Organ #2 "Reaction" | `1× Sex drive [161] → 1× Sex drive backup [144]` at the same rate byte 18, half-life **6 ticks** ("Very short"). Switches on at Baby | Duplicates reaction 65. The combined backward pull is therefore ~21 %/tick — the same doubled pattern used by the carb/fat/cold/hot/tiredness pairs. Sex drive is in the **doubled-refill** dynamic class, not the single-pull class of Loneliness/Crowded/Boredom |
| 3 | Active drive production (indirect) | Gene 76 (reaction id 32) | Organ #2 "Reaction" | `1× Arousal Potential [39] + 1× Opposite Sex Pheromone [41] → 1× Sex drive [161]` at rate byte 13, half-life **4 ticks** ("Very short"). Switches on at **Youth** | The only endogenous Sex-drive source. Fires only when both Arousal Potential (produced by oestrogen/testosterone pathway on the reproductive cycle) and Opposite Sex Pheromone (emitted by mate-compatible creatures via pheromone agents) are simultaneously present. Since neither reactant exists before Youth, the entire sex-drive axis is silent in Babies and Children |
| 4 | Direct CAOS injection | — | Any | `CHEM 144 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; drains at Medium 209-tick half-life (~7 s) plus the reaction-52-like drip into the active drive, so the injected mass is gone within a minute |
| 5 | No initial concentration | — | — | Chemical 144 does not appear in the genome's initial-concentration table, and neither does its active partner 161. A newly-hatched Norn is born with exactly 0 Sex drive and 0 Sex drive backup, and — because reaction 32 is gated on Youth — stays at zero until sexual maturity | — |
| 6 | No direct emitter to the backup | — | — | The emitter table contains no entry whose target chemical is 144. No brain neuron, sensorimotor locus, or organ tissue writes to the reservoir directly — it is filled entirely by reactions 65 and 73 from the active drive | — |
| 7 | No neuroemitter hook | — | — | The single stock neuroemitter writes Adrenalin, Fear and Crowded — not chemical 144 or 161. Sex drive is therefore **not wired to any brain neuron** in the stock biochemistry; it is produced purely by the Arousal Potential + Opposite Sex Pheromone chemistry | — |
| 8 | Modded genomes | User-added | User-added | Breeders sometimes add a neuroemitter from a "courtship memory" or "mate preference" neuron into chemical 144 so that specific romantic events accumulate chronic sex drive independently of the ambient Arousal-Potential/Pheromone chemistry. Another common mod raises the initial concentration or lowers the Medium decay so the reservoir behaves more like the other drive backups | Gene-dependent |

## Usage

Sex drive backup has exactly **one endogenous consumer** — the backup → active drip reaction — plus its own passive Medium decay, which is the defining feature of this particular backup.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 18 (reaction id 55) | Organ #2 "Reaction" | `1× Sex drive backup [144] → 1× Sex drive [161]` at rate byte 58, half-life **311 ticks** ("Medium", decay rate 0.99777). Switches on at Baby | Every backup unit slowly becomes an active-drive unit at the ~10-second Medium rate. This is the single drip reaction — Sex drive is **single-drip** even though it is doubled-refill |
| 2 | Passive Medium decay (**unique**) | Gene 64 entry #144 (half-life table) | Bloodstream | `genomeValue: 54`, half-life **209 ticks** (≈ 7 s at 30 Hz, decay rate 0.99669), labelled "Medium" | **Sex drive backup is the only drive backup in the stock genome that decays on its own.** All twelve other wired backups carry `genomeValue: 255` / half-life ≈9·10¹⁰ ticks / "Very long". The net effect is that any Sex drive backup mass not kept topped up by the active drive vanishes within a minute or so of real time, giving the pair a short-memory rather than long-memory character. This is the deliberate biochemical encoding of "the urge to mate fades when circumstances no longer support it" |
| 3 | No receptor | — | — | Sex drive backup is **not read by any stock receptor**. No drive, brain lobe, sensorimotor, reproductive, circulatory, immune, or organ receptor reads chemical 144's concentration. All behavioural awareness flows through the active drive at 161 | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 144 | — |
| 5 | No annihilation partner | — | — | Unlike Loneliness/Crowded (which annihilate at a "Short" rate via reaction 24) or Coldness/Hotness (which annihilate instantly via reaction 23), the Sex-drive axis has no antagonist chemical. There is no "anti-libido" drive that destroys Sex drive in proportion to its own concentration. What reduces active Sex drive is the Libido-lowerer catalytic reaction (reaction 33) and the chemical's own Short 95-tick passive decay | — |
| 6 | Modded consumers | User-added | User-added | Modders add a receptor on chemical 144 to make chronic rather than acute sexual readiness weight mate-selection decisions, or add an enzyme-gated release reaction so that banked arousal only surfaces when a pheromone pulse occurs. Raising `genomeValue` toward 255 converts the backup into a conventional long-memory reservoir | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Sex drive axis the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **144** | **Sex drive backup** | 209 ticks ("Medium", ~7 s) | 0 |
| Active drive | 161 | Sex drive | 95 ticks ("Short", ~3 s) | 0 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 18 (id 55) | `Sex drive backup → Sex drive` | 311 ticks ("Medium", ≈10 s) | **Backup → active** (drip-feed release) |
| Gene 58 (id 65) | `Sex drive → Sex drive backup` | 6 ticks ("Very short", ≈0.2 s) | **Active → backup** (fast self-refill) |
| Gene 70 (id 73) | `Sex drive → Sex drive backup` | 6 ticks ("Very short", ≈0.2 s) | **Active → backup, duplicated** |

Sex drive is therefore a **doubled-refill, single-drip** pair, like Hunger-for-carb (150/133), Hunger-for-fat (151/134), Coldness (152/135) and Hotness (153/136). The ~21 %/tick combined backward pull aggressively sweeps active mass into the reservoir, while the 311-tick drip releases it slowly — the same overall pattern that makes hunger and thermal drives sluggish on the drive bar. What is different from those pairs is the Medium-decay reservoir: whatever gets banked in Sex drive backup is *also* bleeding out on its own at a 209-tick pace, so the reservoir leaks.

### Why Sex drive backup leaks — the developmental and motivational design

All other drive backups were given "Very long" half-lives so that lifelong memories of hunger, pain, loneliness, thermal stress, and social density would persist across hours of gameplay. Sex drive backup deviates from this policy deliberately, and the reasoning flows from the Sex-drive source chemistry:

1. **Active Sex drive (161) is produced only by reaction 32**, which requires *both* Arousal Potential (the oestrogen/testosterone-gated reproductive-readiness chemical produced in the creature's own reproductive cycle) *and* Opposite Sex Pheromone (emitted by a mate-compatible partner in the same room).
2. **The reaction is gated to Youth** (`switchOnAge=3`, `switchOnStage=Youth`), along with the Libido-lowerer cross-reactions (reactions 33, 34, 36). Babies and Children have no Arousal Potential pathway, no Libido lowerer reactions, and no way to produce Sex drive — the entire axis is silent until the creature matures.
3. **Reaction 35** (`Sex drive → (nothing)` at rate byte 23, half-life 10 ticks "Very short") is *another* spontaneous drain on active Sex drive, on top of its own Short 95-tick decay. The stock genome aggressively clears active Sex drive whenever the conditions stop generating it. Reaction 35, like reactions 32–34 and 36, is also Youth-gated.
4. **If the reservoir never decayed** (i.e. if chemical 144 were "Very long" like its sibling backups), a Norn who once encountered a mate and built up a tank of banked sex drive would carry that urge for the rest of its life, even if left alone or separated from opposite-sex creatures. The doubled-refill/single-drip pattern would keep topping the tank up every time active drive appeared, and the tank would slowly drip the urge back out for the rest of the creature's life.
5. **The Medium 209-tick decay solves this** by making the reservoir a **mate-presence-driven short memory** rather than a lifelong memory. When Arousal Potential + Opposite Sex Pheromone are both present, the pair equilibrates at a non-trivial steady-state level. When either reactant vanishes (the pheromone emitter leaves the room, or Libido lowerer is raised past Arousal Potential), active Sex drive stops being produced, the ~21 %/tick refill stops firing, and the reservoir empties via both its own Medium decay (209 ticks) and the Medium drip into the active drive (311 ticks). Within a minute or so of mate absence, the entire pair returns to zero.

This is the biochemical encoding of the design principle *"sexual desire is circumstance-sensitive, not chronic"*. Unlike hunger, cold, loneliness, or fear — which are supposed to build up and stay built up until satisfied — sex drive is supposed to be a *situational* signal that rises around potential mates and fades when they are not available.

### The Youth gate and the reproductive cycle

The Sex-drive chemistry is the most developmentally-gated set of reactions in the stock genome. All five reactions (ids 32–36) that touch Arousal Potential, Libido lowerer, or Sex drive are `switchOnAge=3 / switchOnStage=Youth`:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| 32 | `Arousal Potential + Opposite Sex Pheromone → Sex drive` | 4 ticks ("Very short") | The sole source of active Sex drive |
| 33 | `Libido lowerer + Sex drive → Libido lowerer` | 0 ticks ("Instant") | Catalytic destroyer of Sex drive whenever Libido lowerer exceeds zero |
| 34 | `Arousal Potential + Libido lowerer → (nothing)` | 10 ticks ("Very short") | Mutual annihilation |
| 35 | `Sex drive → (nothing)` | 10 ticks ("Very short") | Spontaneous extra decay on active Sex drive |
| 36 | `Libido lowerer + Arousal Potential → Libido lowerer` | 6 ticks ("Very short") | Catalytic destroyer of Arousal Potential |

In stock play, **no creature younger than Youth can feel Sex drive at all**, no matter what chemicals are present around it. The Arousal Potential + Opposite Sex Pheromone pair simply does not react. Sex drive backup (144) therefore stays at exactly zero for the entire Baby and Child life stages, regardless of ambient pheromones, because its two refill reactions are gated on Baby but have no reactant to fire on (no active Sex drive is being produced), and the active drive itself cannot be directly written to by any stock pathway before Youth.

The reaction-55 backup → active drip *is* on at Baby, so a `CHEM 144 <n>` injection into a Baby Norn would produce active Sex drive — but because all the Sex-drive receptors are Youth-aware (the drives receptor reads even before Youth, but there is no reproductive-tissue response until Youth), the effect on behaviour is diminished. The canonical game behaviour is that only Youth+ creatures have any sexual motivation at all.

### What the active drive does that the backup cannot

Because chemical 144 has no receptor, every behavioural effect of sex drive is mediated through chemical 161. The stock genome places **three receptors** on the active drive — significantly more than most other emotional drives:

| Reader | Tissue / Locus | Threshold / Gain / Flags | Meaning |
|--------|----------------|--------------------------|---------|
| Drives receptor #14 (gene 13) | Creature / Drives (tissue 5) / locus 13 "Sex drive" | threshold 0, gain 223, analogue, from Baby | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. The high analogue gain of 223 (out of 255) is the strongest of all the "cognitive" drive receptors (higher than Anger's 202, Loneliness's 207, Crowded's 209, Boredom's 211), reflecting the design intent that when a Norn is sexually motivated, mate-seeking should dominate its action preferences |
| Reproductive receptor #120 (gene 73) | Creature / Reproductive (tissue 2) / locus 1 "LOC_RECEPTIVE" | threshold **48**, nominal 16, gain 255, **DIGITAL** (all-or-nothing), from Youth | The **mating receptivity flag**. `LOC_RECEPTIVE` fires digitally at full gain 255 whenever Sex drive exceeds 48/255 (≈19 %). This is the all-or-nothing gate that the "kisspopp" script (and other mating-behaviour scripts) check to determine whether the creature will accept a mating advance. A Norn below the threshold will reject mating attempts; above it, mating proceeds. The nominal value of 16 is the "baseline" reproductive-tissue reading in the absence of sex drive |
| Sensorimotor receptor #193 (gene 130) | Creature / Sensorimotor (tissue 4) / locus 21 "LOC_GAIT13" | threshold 51, nominal 0, gain 207, analogue, from Baby | The **courtship gait**. LOC_GAIT13 is the "amorous" locomotion locus; above threshold 51 (≈20 % of range) the creature's walk cycle and posture shift to reflect sexual motivation, producing visible external cues (approach behaviours, specific postures, courtship movements) to the player and to other creatures. Gain 207 gives an analogue response that scales smoothly with drive intensity |

Together these three receptors turn Sex drive into a **cognitive + reproductive + locomotor** drive: the creature feels the urge, the reproductive system unlocks mating receptivity, and the body language changes to signal interest. All three receptors read chemical 161, not 144 — the backup's only influence is through reaction 55's drip into the active drive.

### The Libido lowerer gate

A critical dynamic of the Sex-drive axis that is unique among the drive pairs is the role of **Libido lowerer** (chemical 40). Libido lowerer is an anti-arousal chemical that the reproductive cycle produces after mating, during pregnancy, during the refractory period, and in response to certain stress/fear states. It acts through two catalytic reactions:

- **Reaction 33**: `Libido lowerer + Sex drive → Libido lowerer` at rate byte 0, "Instant decay" — whenever Libido lowerer is present, any active Sex drive is destroyed **immediately**, in a single tick, at full conversion. Libido lowerer is the catalyst; it is not consumed. A single unit of Libido lowerer is enough to nullify any amount of active Sex drive for as long as that Libido lowerer remains in the bloodstream.
- **Reaction 36**: `Libido lowerer + Arousal Potential → Libido lowerer` at half-life 6 ticks — Libido lowerer also *catalytically* destroys Arousal Potential, cutting off Sex drive at its source.

The consequence for Sex drive backup is dramatic. Even though reaction 55 is continuously draining the reservoir into the active drive, **any active Sex drive produced is destroyed within one tick** if any Libido lowerer is present. The refill reactions 65 and 73 have nothing to grip. The backup is effectively isolated from the active drive — mass flows out of 144 via reaction 55, appears briefly at 161, is annihilated by reaction 33, and vanishes. Meanwhile, 144's own Medium 209-tick decay continues regardless, so the reservoir slowly empties.

Libido lowerer is therefore the **canonical "off switch" for the sex drive axis**. A pregnant Norn, a Norn in its refractory period after mating, or a Norn that has been treated with Libido-lowering drugs has a flat-zero Sex drive axis regardless of how much Arousal Potential or Opposite Sex Pheromone is ambient. When Libido lowerer finally decays (Short 95-tick half-life), the axis reactivates and the pair can begin accumulating again from its next encounter with a mate.

### Steady-state analysis

The Sex-drive pair's dynamics are complicated by the Medium-decay reservoir, the doubled refill, the single drip, and the interaction with Arousal Potential, Opposite Sex Pheromone, and Libido lowerer. For a Youth-or-older creature with constant non-zero Arousal Potential + Pheromone and no Libido lowerer:

- Active drive 161 gains mass at rate ≈ `0.174 × [AP] × [Pheromone]` per tick from reaction 32 (~17 %/tick conversion).
- Active drive 161 loses mass at rate `0.110 × [161]` per tick from reaction 65 (~11 %) + `0.110 × [161]` per tick from reaction 73 (~11 %) = ~21 %/tick combined refill.
- Active drive 161 also loses mass at rate `(1 − 0.99271) × [161] ≈ 0.0073` per tick from its own Short decay (~0.73 %).
- Active drive 161 also loses mass at rate `(1 − 0.93127) × [161] ≈ 0.069` per tick from reaction 35 (~7 %).
- Backup 144 gains mass at rate ~21 % of [161] per tick from reactions 65 + 73.
- Backup 144 loses mass at rate `(1 − 0.99669) × [144] ≈ 0.0033` per tick from its own Medium passive decay.
- Backup 144 loses mass at rate `(1 − 0.99777) × [144] ≈ 0.0022` per tick from reaction 55 drip (~0.22 %).

Setting backup-inflow equal to backup-outflow:
```
  0.21 × [161] = (0.0033 + 0.0022) × [144]
  [144] / [161] ≈ 38
```

So approximately **97 %** of the axis's circulating mass sits in the backup at rest, about the same as the thermal and carb/fat pairs. But unlike those pairs, the reservoir is *bleeding* — the own-decay loss of 0.33 %/tick is unique among drive backups. When Arousal Potential or Pheromone stops being produced, inflow collapses to zero, and the reservoir half-empties every 209 ticks, emptying fully within about 1,400 ticks (~50 s at 30 Hz). The active drive, meanwhile, half-empties every ≈80 ticks from its combined ~28 %/tick losses when reaction 35 is on. The entire axis returns to zero in under a minute of mate-free time.

### Effects of directly filling Sex drive backup

A `CHEM 144 <n>` injection produces a rising but transient sexual motivation:

1. **Tick 0:** The backup rises to *n*. Active Sex drive is unchanged; LOC_RECEPTIVE is still below threshold 48 and the courtship gait locus is still below threshold 51; the Drives bar for Sex drive reads zero.
2. **Ticks 1–311:** Reaction 55 drip-feeds the backup into active Sex drive at a 10-second half-life. The active drive rises smoothly from zero.
3. **Ticks 1–6:** Simultaneously, reactions 65 + 73 at a 6-tick combined half-life aggressively pull the newly-active drive back into the backup — 21 %/tick. Only a fraction of each drip pulse survives long enough to register on the active-drive receptors.
4. **If the creature is Youth+ and no Libido lowerer is present:** The active drive slowly rises over tens of seconds. When it crosses 48/255, LOC_RECEPTIVE fires digitally at full gain — the creature becomes receptive. At 51/255, LOC_GAIT13 begins shifting the creature's gait analogously. The decision-lobe drive bar rises continuously throughout.
5. **If the creature is a Baby or Child:** Reaction 55 still fires (it is Baby-gated), so active Sex drive does appear — but the reproductive-tissue receptor is Youth-gated, so LOC_RECEPTIVE remains silent. The drive-bar and LOC_GAIT13 still respond, making a pre-Youth creature that has been dosed with 144 display a "confused" courtship gait without the ability to actually mate. This is a pathological state not reachable through stock chemistry and generally only visible when modders or scripters force it.
6. **If Libido lowerer is present:** Reaction 33 annihilates the freshly-released active Sex drive within one tick. The decision lobe sees nothing, LOC_RECEPTIVE never fires, and the reservoir empties via its own Medium decay and the drip into an invisible active drive over about 50 seconds. The injection is effectively a no-op behaviourally.
7. **Regardless of creature state, the reservoir empties on its own.** The Medium 209-tick half-life drains the banked value whether or not anything downstream is responding. A single `CHEM 144 100` injection is essentially gone after ~1,400 ticks.

This makes `CHEM 144 <n>` less persistent than most drive-backup injections. The more common scripting pattern for inducing mating behaviour in stock Creatures 3 is to inject **Arousal Potential** (chemical 39) rather than Sex drive backup, because Arousal Potential is consumed by reaction 32 to continuously generate fresh active Sex drive as long as Opposite Sex Pheromone is present, and that generation rate is what the reservoir sees as a steady inflow.

### Interaction with the bootstrap reproductive system

Several stock game mechanisms touch the Sex-drive axis indirectly:

- **The "kisspopp" script** (the canonical mating handler in the bootstrap scripts) checks that both creatures' `LOC_RECEPTIVE` reads non-zero before allowing mating to proceed. Since `LOC_RECEPTIVE` reads chemical 161 at DIGITAL threshold 48, both creatures must have active Sex drive ≥ 48/255 at the moment of the kiss.
- **The Opposite Sex Pheromone emitter** (chemical 41) is injected into the air by reproductive-tissue emitters on any Youth-or-older fertile creature, carried through the room's CA system, and inhaled/absorbed by other creatures. It is the **only** stock source of chemical 41 in a fresh Norn, so sex drive only exists where mates exist.
- **The Arousal Potential pathway** produces chemical 39 from the oestrogen/testosterone cycle (see chemicals 46, 48, 53, 54). Females produce Arousal Potential in phase with their oestrogen cycle; males produce it more continuously in response to testosterone. This is why females in stock play have distinct "receptive" and "unreceptive" phases while males are more uniformly receptive.
- **The Libido lowerer pathway** produces chemical 40 after mating (reproductive refractory period) and in response to fear and stress, suppressing the entire sex-drive axis until the chemical decays.
- **The Music Faculty** mood calculation assigns Sex drive a **YYY** (triple-positive) influence on mood, making it the single strongest positive mood contributor of all fourteen drives. A sexually-motivated creature sings noticeably happier songs than a neutral creature; this reads the **active** drive at 161, not chemical 144, so a saturated backup without a matching active drive produces no musical effect.

### Contrast with the other drive backups

Sex drive backup (144) is structurally unusual in two ways:

| Feature | Sex drive backup (144) | Most other wired drive backups |
|---------|------------------------|-------------------------------|
| Own-decay half-life | **209 ticks "Medium"** | ~9·10¹⁰ ticks "Very long" (effectively permanent) |
| Active → backup refill | **Doubled** (reactions 65 + 73) | Doubled for thermal/hunger pairs, single for Loneliness/Crowded/Boredom, absent for orphans (141/143/145) |
| Backup → active drip | Single (reaction 55) | Single across all wired pairs |
| Developmental gate on source | **Youth** (reaction 32) | Baby for most; Youth for Arousal Potential; Adolescent for Anger's Adrenalin amplifier |
| Active-drive receptors | **3** (cognitive + reproductive + locomotor) | 1 for Loneliness/Crowded/Boredom; 2 for Sleepiness; 3 for Anger; 4 for Tiredness |
| Antagonist chemical | **Libido lowerer** (catalytic annihilator) | Crowded for Loneliness; Hotness for Coldness; (none) for hunger/pain/sleep |

The design signal is clear: Sex drive is meant to be a **circumstance-sensitive, developmentally-gated, externally-catalysed, rapidly-decaying** drive that tracks the immediate presence of mates rather than accumulating a lifelong reservoir of unsatisfied libido. The Medium-decay reservoir is the key element that enforces this — without it, the doubled-refill/single-drip pattern would build up a near-permanent tank that would survive long after mate absence.

### Why the Medium decay matters gameplay-wise

In practice, the Medium-decay reservoir produces several distinctive behaviours:

- **Post-mating refractory:** After a successful mating event, the stock genome produces Libido lowerer, which catalytically destroys active Sex drive. Meanwhile, whatever was in the backup slowly drains on its own via the 209-tick half-life. Within about a minute, the entire axis reads zero, and the creature's decision lobe stops choosing mate-seeking actions. Combine this with the Libido lowerer itself decaying at its own rate, and the Norn transitions cleanly out of "mating mode" into other behaviours — caring for offspring, eating, sleeping — without being chronically "horny" from residual reservoir mass.
- **Mate absence:** A Norn separated from opposite-sex companions will lose all its Sex drive within about a minute of separation, regardless of how much it accumulated while mates were nearby. The reservoir does not preserve libido across rooms.
- **Re-encounter:** When a Norn returns to a room with opposite-sex companions, the axis re-primes from zero. Arousal Potential (which the creature always produces from its reproductive cycle) meets the newly-inhaled Opposite Sex Pheromone, reaction 32 fires, active Sex drive appears, and reactions 65 + 73 begin refilling the (empty) reservoir. The pair reaches equilibrium within a few tens of seconds.
- **No lifelong frustration:** Unlike hunger or loneliness, which can build up to uncomfortable levels over the course of an entire game session if the need is ignored, Sex drive cannot accumulate chronic unsatisfied pressure in the stock genome — the reservoir forgets. This is why Creatures 3 / Docking Station Norns do not become *desperately* libidinous over time even if mates are scarce; they simply return to baseline.

### Implications for modders

Common modifications built on top of Sex drive backup:

1. **Raise the half-life-table genomeValue to 255** so the reservoir becomes "Very long" like the other drive backups. This produces creatures with a chronic unsatisfied sex drive that builds up over game sessions and persists across mate separations — more primal, less circumstantial.
2. **Raise the initial concentration of 144** so newly-Youth creatures begin sexual maturity with pre-loaded libido, making the first post-maturity mate encounter happen almost instantly.
3. **Add a neuroemitter from a "mate memory" or "attraction" learned neuron** directly into chemical 144 so that specific relationships (the Norn's first mate, a bonded pair-partner, a familiar face) build chronic sex drive independently of ambient pheromones.
4. **Remove reaction 35** (the spontaneous `Sex drive → (nothing)` decay) so that active Sex drive is only destroyed by Libido lowerer and its own Short passive decay, making libido more responsive to pheromones in the absence of refractory chemistry.
5. **Add a Reproductive-tissue receptor on 144 at low threshold** so that even small amounts of banked sex drive signal mating readiness, decoupling LOC_RECEPTIVE from the volatile active-drive and making receptivity track chronic rather than acute arousal.
6. **Cross-couple 144 to Crowded (157)** so that sex drive decays faster in very crowded rooms (social-inhibition of mating) or slower in moderately-populated rooms (group-stimulation effect). Not in stock biochemistry but often added by social-behaviour mods.
7. **Gate reaction 55 with an enzyme catalyst** (analogous to Sleepase gating Sleepiness-backup release) so that banked libido only surfaces in response to a specific trigger chemical — e.g. a pheromone subspecies emitted by a particular mate — producing partner-specific desire.

Because chemical 144 has no direct receptor and the active drive has three well-separated receptors (decision lobe, reproductive receptivity, courtship gait), these modifications are safely isolated from the rest of the biochemistry — they affect the sex-drive axis cleanly without perturbing metabolism, immunity, sleep, or hunger.

### Practical consequences for gameplay

- **`CHEM 144 <n>` is a medium-term libido injection.** Unlike most drive-backup injections, it does not produce a permanent biochemical state — the value drains within about a minute via the Medium 209-tick own-decay plus the drip into a fast-decaying active drive. Useful for scripted "spark of attraction" events that should fade on their own if not reinforced.
- **Before Youth, the axis is silent.** Babies and Children have no Arousal Potential reaction and no reproductive-tissue receptor. Injecting chemicals 144 or 161 into a pre-Youth creature produces at most a cognitive drive-bar reading and a weak courtship-gait response, but no actual mating behaviour is possible. The stock genome enforces sexual maturity developmentally.
- **Libido lowerer is the master off-switch.** Any amount of chemical 40 catalytically destroys active Sex drive at full conversion per tick, so post-mating refractory, pregnancy, and stress-suppression completely shut down the axis regardless of pheromone or reservoir state. Scripts that want to override the refractory period must clear chemical 40 first.
- **Mate separation clears libido.** Within about a minute of removing a Norn from opposite-sex company, the entire Sex-drive axis drains to zero, regardless of how saturated it was. This contrasts sharply with hunger, loneliness, pain, and thermal drives, all of which persist until actively satisfied.
- **The reproductive-tissue digital gate is all-or-nothing.** Crossing threshold 48 flips LOC_RECEPTIVE on at full gain 255; falling below 48 turns it off. There is no gradient between "unreceptive" and "receptive" — the creature is either available for mating or not. This produces the sharp, discrete mating-moment events that characterise Creatures 3 reproduction.
- **The courtship gait is analogue and kicks in around the same threshold.** LOC_GAIT13 fires above threshold 51 with gain 207, so the creature's body language shifts gradually upward from ≈20 % Sex drive, roughly in step with the reproductive receptivity gate. A sexually-motivated creature looks visibly amorous from the moment it becomes capable of mating.
- **The decision lobe weights sex drive heavily.** Gain 223 on the drives receptor is the highest of the cognitive-drive gains, so when a Youth+ Norn is sexually motivated, mate-seeking actions dominate its action preferences — the creature will abandon food, water, sleep, and social companionship to pursue an opposite-sex partner until the drive is satisfied or suppressed by Libido lowerer.
- **Music Faculty mood responds strongly to sex drive.** YYY (triple-positive) influence means a sexually-motivated Norn sings markedly happier songs than any other drive state produces, drowning out the single-N influences of Pain, Hunger, Coldness, Loneliness, Anger, etc. in the mood-aggregation formula.

### Summary

```
 Stock-genome wiring of Sex drive backup [144]
 ────────────────────────────────────────────────
 Inputs (all Baby-gated except as noted):
    Sex drive [161] ─ reaction 65 (gene 58) ────────▶ [144]
                        half-life 6 ticks ("Very short")
    Sex drive [161] ─ reaction 73 (gene 70) ────────▶ [144]
                        half-life 6 ticks ("Very short")
                        (doubled refill, ~21 %/tick total)

    CHEM 144 <n>  (CAOS / scripts / mods)  ──────────▶ [144]

    (No emitter writes to 144 directly; no neuroemitter;
     no cross-drive spillover; no initial concentration)

 Reservoir:
         Sex drive backup [144]
         half-life 209 ticks ("Medium", ~7 s)  ── UNIQUE
         initial concentration: 0
                        │
                        │ reaction 55 (gene 18): 1× [144] → 1× [161]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, Baby-gated
                        │
                        │ + own-decay: 209-tick "Medium" half-life
                        │   (the only drive backup with finite decay)
                        ▼
 Active drive:
         Sex drive [161]
         half-life 95 ticks ("Short", ~3 s)
         initial concentration: 0
                        │
                        ├─► Drives tissue locus 13 (gain 223) ──▶ decision-lobe "sex drive" bar
                        │                                          (highest cognitive-drive gain in genome)
                        ├─► Reproductive tissue locus 1 (LOC_RECEPTIVE, threshold 48, DIGITAL, gain 255)
                        │                                          → mating receptivity gate (Youth+)
                        ├─► Sensorimotor tissue locus 21 (LOC_GAIT13, threshold 51, gain 207, analogue)
                        │                                          → courtship gait
                        │
                        ├─◀ Reaction 32 (gene 76, Youth-gated):
                        │      Arousal Potential [39] + Opposite Sex Pheromone [41] → Sex drive [161]
                        │      half-life 4 ticks ("Very short")
                        │      — the only endogenous source
                        │
                        ├─◀ Reaction 33 (gene 72, Youth-gated):
                        │      Libido lowerer [40] + Sex drive [161] → Libido lowerer [40]
                        │      half-life 0 ticks ("Instant decay")
                        │      — catalytic master off-switch
                        │
                        └─◀ Reaction 35 (gene 150, Youth-gated):
                               Sex drive [161] → (nothing)
                               half-life 10 ticks ("Very short")
                               — spontaneous extra decay

 Related but separate:
    Arousal Potential [39] — reproductive-cycle-gated precursor
    Opposite Sex Pheromone [41] — airborne mate-presence signal
    Libido lowerer [40] — post-mating / refractory / stress suppressor
    Oestrogen [46] / Progesterone [48] / Testosterone [53] / Inhibin [54]
         — reproductive cycle hormones that feed Arousal Potential production
```

Sex drive backup is therefore a **doubled-refill, single-drip, developmentally-gated, medium-memory** reservoir — the chronic half of the Norn's sexual drive, but only chronic on a minute-scale rather than the hour-scale of every other drive backup. Among the sixteen backup chemicals in the 131–146 block it is the **only one that decays on its own**, and this single parameter is what enforces the stock design principle that sexual desire should be circumstance-sensitive rather than lifelong. Its three active-drive receptors — the high-gain decision-lobe bar, the digital reproductive-receptivity gate, and the analogue courtship-gait locus — together make Sex drive one of the most behaviourally-consequential drives in the genome when active, and the Medium reservoir ensures that this consequence fades cleanly when mates, pheromones, or Arousal Potential are absent.
