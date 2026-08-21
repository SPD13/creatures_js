# 158 - Fear

Fear is the **active drive chemical** for the creature's feeling of threat and alarm. It sits in slot 11 of the sixteen "drive" chemicals in the 148–161 block — the active signals the decision lobe and body tissues read to choose behaviour — and it is nominally paired with **Fear backup [141]** in the canonical Creatures 3 / Docking Station drive/reservoir architecture. Unlike Loneliness, Crowded, or Boredom, however, the Fear pair is **orphaned at the reservoir end**: no stock reaction sweeps Fear into 141, no reaction releases 141 back into Fear, and no receptor reads the reservoir. Fear therefore runs as a **purely acute** drive, without the minutes-scale chronic buffer that shapes the physical-need drives. What enters chemical 158 stays in chemical 158 until it decays, converts into Anger, or is amplified by Adrenalin — there is no long tail.

This acute-only design is matched by a richly-wired set of **four receptors** — the widest downstream footprint of any drive chemical in the genome — that turn Fear into the single most bodily drive in the Creatures 3 biochemistry. Where Loneliness, Boredom, and most of the other emotional drives touch only the decision lobe, Fear simultaneously drives the **decision lobe drive bar** (cognitive motivation to flee), **accelerates the heart** (cardiac RLOCUS_CLOCKRATE), **switches the gait to the panic-run pattern** (sensorimotor LOC_GAIT4), and at high concentration **trips a youth-gated circulatory panic locus** that in turn produces the Stress (Fear) circulatory stress chemical. A frightened Norn therefore does not just want to run — its heart races, its legs move differently, and at the extreme it enters a measurable physiological stress state.

Fear's dynamics are also unusual in having an **autocatalytic amplifier** that switches on at Adolescent stage: whenever Adrenalin is present (as it typically is in stressful contexts), the reaction `Fear + Adrenalin → 2 Fear + Adrenalin` doubles fresh Fear every ~2 seconds, producing the characteristic cascading panic response. Combined with the mutually-converting `Fear ↔ Anger` pair of reactions, this makes Fear a volatile signal that can escalate quickly, transition smoothly into Anger, and decay cleanly to zero within a minute or two of the stimulus ending — the chemistry of a momentary fright rather than a chronic anxiety.

## Sources

Fear is produced by three bloodstream reactions (a toxin metabolism, a mutual conversion with Anger, and an Adrenalin-powered autocatalysis), one action-learning neuroemitter in the move lobe, and the usual direct-CAOS injection path. Nothing in the stock brain emits Fear from a "threat-perception" neuron directly — Fear arises from Fear toxin, from Anger, from its own autocatalysis, and from a single motor-action neuroemitter.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Fear-toxin metabolism | Gene 93 (reaction id 79) | Organ #2 "Reaction" | `14× Fear toxin [80] → 1× Fear [158]` at half-life **24 ticks** ("Short", decay rate 0.97120) | ~2.9 %/tick of available Fear toxin is converted into active Fear, at a 14:1 stoichiometry. This is the **primary exogenous source**: scripts and agents that want to scare a Norn inject Fear toxin (`CHEM 80 <n>`) rather than writing Fear directly, because the 14:1 ratio and Short half-life produce a smooth, delayed fear response that peaks over several seconds rather than a jarring instantaneous spike. The "Scary Thing" scripts (loud noises, predator-class agents, startling events) all funnel through this pathway |
| 2 | Anger → Fear conversion | Gene 3 (reaction id 41) | Organ #2 "Reaction" | `1× Anger [160] → 1× Fear [158]` at half-life **95 ticks** ("Short", decay rate 0.99271) | ~0.7 %/tick of active Anger is converted to Fear. Paired with the reverse reaction 40 (`Fear → Anger`), this gives the two adrenaline-driven emotions a slow mutual interchange. In equilibrium, a creature with active Anger slowly bleeds some of it into Fear, and vice versa; which drive dominates is decided by which emitters (brain neurons, toxins, neuroemitters) are currently topping up each side |
| 3 | Adrenalin-powered autocatalysis | Gene 5 (reaction id 38) | Organ #2 "Reaction" | `1× Fear [158] + 1× Adrenalin [117] → 2× Fear [158] + 1× Adrenalin [117]` at half-life **58 ticks** ("Short", decay rate 0.98808), **switchOnAge 2 (Adolescent)** | Fresh Fear doubles approximately every 58 ticks (~2 s at 30 Hz) as long as Adrenalin is available. Adrenalin is preserved through the reaction — it acts as a catalyst, not a reactant — so a single pulse of Adrenalin can sustain many rounds of Fear doubling. This is the **engine of the panic response**: once Fear crosses a threshold where Adrenalin is also present, the level escalates cascadingly until one of the downstream receptors fires or Adrenalin runs out. The Adolescent gate means infant and child Norns cannot yet undergo panic amplification — their fear decays at its ordinary passive rate |
| 4 | Move-lobe neuroemitter | Gene 1 (neuroemitter id 1) | Brain / lobe 4 ("move") neuron 37 | rate 4 | Emits amount 5 to Fear whenever the specific movement-action neuron fires — alongside amount 8 to Adrenalin [117] and amount 6 to Crowded [157]. This is the **only stock brain-level input to Fear**, and because it simultaneously releases Adrenalin it *primes the autocatalysis reaction*: each neuron-37 firing creates both the Fear substrate and the Adrenalin catalyst needed for it to amplify. Over a creature's lifetime, this wires the decision lobe's reinforcement learning to couple certain movement choices to a fear-and-adrenalin tail — which is how the biochemistry encodes "this kind of moving feels dangerous" without requiring explicit threat-detection circuitry |
| 5 | Direct CAOS injection | — | Any | `CHEM 158 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot. Because there is **no** active→backup sweep reaction for Fear (the Fear-backup slot 141 is orphaned), the entire injected mass remains in chemical 158 and decays through the Medium passive-decay path and through reaction 40 (`Fear → Anger`). A `CHEM 158 <n>` write is therefore unusually "honest" compared to other drive writes: the level stays near *n* for several ticks before decaying, giving the receptors (drive bar, heart rate, gait, panic) time to respond to the value as written. If Adrenalin is also present, reaction 38 will begin doubling the injected Fear until Adrenalin is exhausted |
| 6 | No sensorimotor emitter | — | — | Unlike Crowded and Loneliness (both fed by `LOC_CROWDEDNESS`), Tiredness (fed by `LOC_TIREDNESS`), or Hotness/Coldness (fed by the temperature locus), Fear has **no stock sensorimotor locus that emits directly into it**. The creature does not "sense fearfulness" from a physical world-reading; it develops fear only via the brain (neuroemitter), via toxin-delivered events (reaction 79), or via the emotional exchange with Anger (reaction 41) | — |
| 7 | No initial concentration | — | — | Chemical 158 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly **0** active Fear. Chemical 141 is also born at 0, so babies start the game with no fear signal at all, and the first Fear experience will be whatever combination of toxin, neuroemitter, or Anger-conversion events they first encounter | — |
| 8 | No cross-drive spillover | — | — | Unlike the protein-hunger pair (which receives spillover from Pain via gene 20) or the Hotness pair (which receives spillover from Fever toxin via gene 80), there is no stock-genome reaction that routes pain, hunger, coldness, hotness, tiredness, sleepiness, loneliness, crowdedness, boredom, or sex-drive chemicals into Fear. The fear axis is cleanly isolated from other drives at the chemical level — only the mutual Anger↔Fear conversion crosses the boundary | — |
| 9 | Modded genomes | User-added | User-added | Common mods include: adding a sensorimotor receptor on a new "threat-proximity" locus that emits into Fear; wiring a stimulus-lobe "unfamiliar creature" neuron as a neuroemitter on 158 to give cognitive-appraisal-based fear; adding the missing `Fear → Fear backup` sweep reaction so the drive becomes reservoired like Crowded; gating reaction 38's amplification with a catalyst chemical so panic only cascades under specific conditions; injecting Fear from a pain event via a `Pain → Fear` spillover reaction to model trauma-induced startle | Gene-dependent |

## Usage

Fear has **four receptors** — the widest downstream footprint of any drive chemical — plus two consuming reactions (conversion to Anger and passive decay). Every receptor reads the active chemical 158; none reads the orphan reservoir 141.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Drives-tissue "Fear" receptor | Gene 10 (receptor id 11) | Creature / Drives (tissue 5) | Locus 10 "Fear", threshold 0, gain 209, analogue, from Baby | **The fear drive bar the decision lobe reads to choose flee/avoid/freeze behaviours.** Threshold 0 means proportional response at every level; gain 209 (identical to the Crowded receptor's gain) puts Fear at the same cognitive weighting as the other emotional drives. This is the *purely cognitive* side of the fear response — the signal that drives the decision lobe toward learned fear-relief actions without any autonomic involvement |
| 2 | Somatic RLOCUS_CLOCKRATE receptor | Gene 17 (receptor id 142) | Organ #2 "Reaction" / Somatic (tissue 0) | Locus 0 RLOCUS_CLOCKRATE, threshold 45, gain 255, analogue, from Baby | **Cardiac acceleration.** Whenever active Fear exceeds ~18 % of full scale (45/255), the Reaction organ's clock rate is accelerated at full gain, scaling analogue with the Fear level. This is the "heart races when scared" response — it physically speeds up the creature's core metabolic clock, increasing the rate at which all organ reactions (including further Fear production) tick. Because the receptor is analogue and threshold is low, it activates early in the fear curve and amplifies the dynamics throughout the mid-range |
| 3 | Circulatory panic receptor | Gene 55 (receptor id 157) | Creature / Circulatory (tissue 1) | Locus 11 "Locus 11", threshold 204, gain 255, **DIGITAL**, from **Youth** | **The panic trigger.** Fires only when active Fear exceeds 204/255 (~80 % of full scale), writing a full-gain digital output into Circulatory Locus 11. This locus is then read by a locus-11 emitter (gene 15, emitter id 36) that produces Stress (Fear) [191] at rate 14, gain 6 whenever its own threshold (128) is met. The chain is therefore: **extreme Fear → Circulatory Locus 11 digital trip → Stress (Fear) production**. The receptor switches on at Youth, so infant and child Norns can be *afraid* (decision bar + heart rate + gait) but cannot *panic* at the circulatory level — only sub-adult creatures and older develop the Stress (Fear) response |
| 4 | Sensorimotor LOC_GAIT4 receptor | Gene 102 (receptor id 188) | Creature / Sensorimotor (tissue 4) | Locus 12 LOC_GAIT4, threshold 128, gain 223, analogue, from Baby | **Gait switching.** Whenever Fear exceeds ~50 % of full scale (128/255), sensorimotor gait-4 (the "flee" / "panic-run" gait) is activated with gain 223. This is how fear changes *how* the creature moves, not just where: fast, jittery, wide-legged locomotion that is visually recognisable as panicked. The threshold 128 means the gait switch only kicks in once Fear is substantial — below it the creature walks normally even with some fear showing |
| 5 | Fear → Anger conversion | Gene 1 (reaction id 40) | Organ #2 "Reaction" | `1× Fear [158] → 1× Anger [160]` at half-life **95 ticks** ("Short", decay rate 0.99271) | ~0.7 %/tick of active Fear is consumed and converted to Anger. This is the chemistry of the classic **scared → angry** emotional progression: sustained Fear gradually bleeds into sustained Anger, giving creatures the characteristic escalation from startle to aggression when a threat persists beyond the initial fright. Paired with the reverse reaction 41 (`Anger → Fear`) at the same rate, it also sets up a slow equilibrium between the two — creatures oscillate between fear and anger depending on which downstream emitters keep firing |
| 6 | Passive decay | Gene 64 entry #158 (half-life table) | Bloodstream | genomeValue 66, half-life **686 ticks** ("Medium", decay rate 0.99899) | ~0.1 %/tick spontaneous decay. On its own, a Fear spike halves every 686 ticks (~23 s at 30 Hz), so an isolated startle fades to negligible levels within a minute or two. This is the slowest decay among the four "emotional" drives but still far faster than the reservoir-backed physical drives — the Medium-speed passive decay is what keeps Fear an ephemeral signal rather than a chronic one, making up for the absence of a reservoir sweep |
| 7 | No active→backup sweep | — | — | Unlike every other drive in the 148–161 block, **Fear has no `Fear [158] → Fear backup [141]` sweep reaction**. Whatever is produced stays in 158 until decay or conversion consumes it. This is the structural reason Fear is a purely acute drive — see the Fear backup [141] documentation for the detailed treatment of the orphaned reservoir | — |
| 8 | Stress (Fear) pipeline (indirect) | Genes 15 / 75 (emitter 36, receptor 150) | Creature / Circulatory | Circulatory locus 11 (digital from receptor 157) → emitter 36 → Stress (Fear) [191] → receptor 150 on circulatory locus 18 | The downstream physiological pipeline activated by panic-level Fear: once the Circulatory Locus 11 digital gate trips, the stress-chemical emitter begins drip-producing Stress (Fear), which joins the other six Stress\* chemicals (Stress (Pain), Stress (Anger), Stress (Crowded), Stress (Sleep), Stress (Tired), Stress (H4F)) in the generalised stress-response block. Stress (Fear) has its own Medium-speed passive decay (half-life 311 ticks) and is consumed by the shared stress-response machinery; it is the only way Fear can have persistent effects lasting beyond its own rapid decay window. The Youth age-gate on receptor 157 means this pipeline is inaccessible to babies and children |
| 9 | Modded consumers | User-added | User-added | Modders may add a brain-lobe receptor on 158 (e.g. feeding a "danger memory" neuron in the stimulus lobe) to give the cognitive layer explicit access to fear levels; a second sensorimotor receptor on 158 at a lower threshold to produce a "trembling" idle-pose animation; a gonad receptor on 158 to simulate fear-induced mating suppression; or an organ receptor on Circulatory Locus X that emits Glucose so fear triggers a blood-sugar spike (the "fight-or-flight" metabolic response) | Gene-dependent |

## Role in Game Mechanics

### The most richly-wired drive in the genome

Every other drive in the 148–161 block has at most two receptors: one on the Drives tissue (the decision-lobe bar) and optionally one on a sensorimotor or circulatory tissue for a single physiological side-effect. Fear has **four**, spanning three distinct tissues (Drives, Somatic, Circulatory, Sensorimotor) and producing four independent effects on three different timescales:

| Receptor | Tissue | Locus | Threshold | Flags | Gated at |
|----------|--------|-------|-----------|-------|----------|
| Drives #11 | Drives | 10 "Fear" | 0 | analogue | Baby |
| Somatic #142 | Somatic | RLOCUS_CLOCKRATE | 45 (~18 %) | analogue | Baby |
| Sensorimotor #188 | Sensorimotor | LOC_GAIT4 | 128 (~50 %) | analogue | Baby |
| Circulatory #157 | Circulatory | Locus 11 (panic) | 204 (~80 %) | DIGITAL | **Youth** |

The four thresholds stack to produce a **graded fear response** that unfolds across the full range of the chemical:

- **Fear ≈ 0**: only the drive bar reads a (zero) value. No autonomic response.
- **Fear > 0**: decision-lobe "fear" bar begins weighting flee/avoid actions.
- **Fear > 18 %**: heart rate begins to accelerate (cardiac RLOCUS_CLOCKRATE) — the earliest autonomic symptom.
- **Fear > 50 %**: gait switches to LOC_GAIT4 (flee/panic-run pattern) — the visible behavioural symptom.
- **Fear > 80 %** (Youth+ only): circulatory panic locus trips, producing Stress (Fear) — the full-body stress response.

This layered design means the creature's fear response scales qualitatively with magnitude, not just quantitatively. A mildly-scared Norn simply avoids the threat; a moderately-scared Norn's heart is racing; a panicked Norn is running with a different gait; an utterly terrified Norn is physiologically stressed. Fear is the only drive whose magnitude crosses multiple qualitative behavioural regimes.

### The Adrenalin autocatalysis and panic cascade

The reaction `Fear + Adrenalin → 2 Fear + Adrenalin` (gene 5, reaction 38) is the biochemical signature of the Fear drive. In stoichiometric terms, Adrenalin acts as a catalyst: it is not consumed by the reaction, it merely enables the doubling of Fear. The half-life of 58 ticks means Fear produced by this mechanism doubles every ~2 seconds at the reaction's full rate.

The critical feature is that **Adrenalin is simultaneously produced by the same move-lobe neuroemitter that produces Fear** (gene 1, lobe 4 neuron 37: +8 Adrenalin, +5 Fear, +6 Crowded). So whenever that neuron fires, both the substrate (Fear) and the catalyst (Adrenalin) appear together, priming the autocatalysis loop. A single firing can trigger:

1. **Tick 0**: +5 Fear, +8 Adrenalin released into the bloodstream.
2. **Tick ~60** (one half-life): Fear ≈ 10 (doubled), Adrenalin still ~7 (slowly decaying on its own, genomeValue 125, half-life ~3.6×10⁵ ticks — actually very long).
3. **Tick ~120**: Fear ≈ 20. Gait-4 receptor now firing (threshold 128 is ~25).
4. **Tick ~240**: Fear ≈ 80. Cardiac accelerator well above threshold, gait switched, drive bar showing strong fear.
5. **Tick ~480**: Fear ≈ 200. Panic receptor trips (threshold 204) at Youth+. Stress (Fear) pipeline activates.
6. **Tick ~500+**: Fear amplification saturates (approaches chemical-bank cap at 255). Adrenalin begins to be slowly depleted by other reactions. Fear decay (passive + conversion to Anger) eventually exceeds the doubling rate, and the spike collapses.

The whole cycle from single neuron firing to full panic takes roughly 8–16 seconds, after which Fear decays over ~1–2 minutes via passive decay and conversion to Anger. This timeline matches the gameplay experience of a Norn "noticing a threat, panicking, then calming down" over the course of a short scene.

The Adolescent age-gate on reaction 38 is crucial: **babies and children cannot panic** in this amplified sense. Their Fear drive exists — the toxin, Anger-conversion, and neuroemitter sources all work — but each emission produces only the small quantity it wrote, with no runaway doubling. Infant creatures can be scared into changing direction, but they cannot cascade into full panic until they mature. This models real-world developmental fact: fight-or-flight amplification is a hormonal system that matures through adolescence.

### Fear toxin as the canonical "scare this creature" input

Because Fear itself has no sensorimotor source and only one brain-level source, the stock mechanism for scripts and agents to inject fear is **Fear toxin** (chemical 80), metabolised by reaction 79 at a 14:1 ratio. The design of this pipeline is precise:

- **14:1 stoichiometry**: a `CHEM 80 <n>` write produces only `n/14` Fear over time. This prevents scripts from accidentally triggering the circulatory panic receptor with a small toxin dose — the threshold 204 would require at least ~2860 units of Fear toxin, which clips against the 255 chemical cap.
- **Short half-life (24 ticks)**: the toxin metabolises quickly, so a Fear-toxin injection peaks over ~24 ticks (~0.8 s) rather than instantaneously. This produces the characteristic "rising dread" quality of scary events, where the Norn's fear ramps up over a fraction of a second rather than popping in immediately.
- **Fear toxin passive decay (half-life 1241 ticks)**: any unmetabolised toxin persists and continues producing Fear over tens of seconds, so a startling event leaves a lingering metabolic pressure on the fear level that extends the experience beyond the event itself.

The Fear-toxin pathway is used by the standard "scary thing" scripts (predator sightings, loud noises, painful events triggered by agent-on-agent contact, certain Grendel behaviours), making it the dominant source of Fear in normal gameplay. A `CHEM 80 30` injection on a Norn produces about 2 units of Fear directly but queues up to ~14 more units via continued metabolism over the next ~30 seconds — a dose that is visible on the drive bar and the cardiac receptor but does not trigger panic or gait-4.

### The Fear–Anger emotional axis

Fear and Anger are tied together by the pair of mutual-conversion reactions 40 and 41, both at the same 95-tick half-life. In equilibrium they will reach whatever balance the net emitters push them toward:

| Reaction | Direction | Rate | Role |
|----------|-----------|------|------|
| 40 (gene 1) | `Fear → Anger` | Short, 95 ticks | Sustained Fear becomes sustained Anger (escalation) |
| 41 (gene 3) | `Anger → Fear` | Short, 95 ticks | Sustained Anger becomes sustained Fear (backlash) |

With equal rates in both directions, the two drives mutually convert at the same speed. This means:

- If Fear is topped up but Anger is not, the Fear-side emitters will keep refilling Fear faster than reaction 40 drains it — net effect: Fear dominates, with a small Anger tail.
- If the Fear stimulus stops but no Anger stimulus has started, passive decay and reaction 40 will drain both, with a small Anger bump appearing as the Fear converts across.
- If both are stimulated simultaneously (e.g. a painful-and-frustrating event), the two drives reach a rough equilibrium proportional to their respective input rates.

The downstream receptors for the two drives are structurally parallel — both feed a Circulatory panic locus (11 for Fear, 13 for Anger), both contribute to the Stress\* block (Stress (Fear) 191, Stress (Anger) 190), and both participate in the Adrenalin autocatalysis (reaction 38 for Fear, reaction 39 for Anger). This means a prolonged Fear-plus-Anger state produces a full cocktail of stress effects on the circulatory system, which is the biochemistry behind "sustained emotional arousal is bad for Norn health".

### Why the reservoir is intentionally missing

Every other drive in the 148–161 block has a full reservoir pairing, but Fear, Anger, and Comfort do not. The design rationale (see 141 - Fear backup.md for the detailed treatment) is that reservoired drives have **minutes-scale persistence** — a Norn that was hungry an hour ago still has some hunger-backup in its bloodstream trickling back to the active drive. This is desirable for physical needs: a Norn shouldn't forget it's been hungry just because it ate one bite.

For emotional drives, however, minutes-scale persistence is undesirable. If Fear had a reservoir, every minor startle would leave a week-long residue that accumulated over a Norn's lifetime, producing chronically-anxious creatures even after a few mild scary events. The shipping design opts for **acute-only** emotional drives: a Fear spike rises sharply, decays within a minute or two, and leaves no chronic trace. The Stress (Fear) pathway exists specifically to provide the *intended* form of persistence — a youth-gated, threshold-triggered stress response that kicks in only when Fear has actually been extreme, rather than accumulating from every minor fright.

This design choice makes Fear feel qualitatively different from Loneliness, Crowded, or Boredom. Those drives are *tracking* drives — they gradually adjust to represent the creature's chronic environmental state. Fear is an *event* drive — it fires in response to specific triggers and then clears. The biochemistry reflects the gameplay: fear is meant to be a sharp, transient signal.

### Decision-lobe consequences

The Drives receptor (gene 10) writes the fear-drive-bar value into the decision lobe's input layer every tick. The decision lobe is trained (during lifetime via reinforcement and via the initial genome bias) to associate high Fear readings with the **retreat**, **flee**, **avoid-approaching-entities**, and **hide-behind-scenery** actions. Because Fear is a **reducible-by-action** drive (moving away from a scary agent lowers the neuroemitter firing rate, fleeing past a loud source reduces toxin exposure, etc.), the decision lobe's reinforcement learning will identify these actions as reward-generating in the presence of fear, cementing the flight response during normal life.

Unlike Crowded (which is purely cognitive at the decision-lobe level), Fear also has an **autonomic flight pathway** via the LOC_GAIT4 receptor. At high Fear the creature runs in the panic gait regardless of what the decision lobe chose — the gait switch is analogue-proportional to Fear and overrides normal locomotion. This means a terrified Norn whose decision lobe has inadequately learned the flee response will still *physically* run, just not necessarily in the right direction. The dual pathway — cognitive flight via decision lobe + autonomic flight via gait — is a layered safety net that ensures fear-driven behaviour even when cognition fails.

The cardiac acceleration (RLOCUS_CLOCKRATE) adds a third pathway: a frightened Norn's whole metabolism ticks faster, accelerating every organ reaction including digestion, hunger accumulation, and energy consumption. This reproduces the real-world phenomenon that chronic fear burns energy — a persistently-scared Norn will become hungry and tired faster than a calm one.

### Effects of directly filling Fear

A `CHEM 158 <n>` injection produces a distinctive pattern — unlike the reservoired drives, the entire injected mass stays visible rather than being swept into a backup:

1. **Tick 0**: Active Fear rises to *n*. The decision-lobe drive bar reports a sudden jump.
   - If *n* > 45, the cardiac receptor immediately begins accelerating the heart.
   - If *n* > 128, gait-4 switches on immediately.
   - If *n* > 204 and the creature is at Youth or older, the circulatory panic receptor trips immediately.
2. **Ticks 1 → dozens**: No sweep reaction fires. Fear persists at approximately *n*, slowly drained by passive decay (~0.1 %/tick), conversion to Anger (~0.7 %/tick of the current value), and — if Adrenalin is present — *amplified* by reaction 38.
3. **If Adrenalin present (Adolescent+):** Fear doubles every ~58 ticks. A moderate injection (*n* = 50) can cascade into a full panic within 10–20 seconds.
4. **If no Adrenalin:** Fear simply decays. Half-life ~686 ticks total across the two sinks, so the level halves every ~23 s. A moderate injection fades to negligible within ~2 minutes.

A `CHEM 158 -n` write (negative) immediately removes active Fear. Because there is no reservoir to leak mass back, the effect is permanent until some new Fear source fires — making it the only drive where a "reset to zero" CAOS write actually holds.

This is why **Fear is one of the few drives where writing the active chemical directly is the correct technique** for scripted fear effects. For Crowded, Loneliness, Boredom etc. care scripts write to the reservoir (chemical 140, 139, 142) because the active chemical is swept away too quickly. For Fear, writing to the active chemical is canonical — there is no reservoir, the sweep doesn't happen, and the written value has its full intended effect on all four receptors at once.

### CAV save/load and imported creatures

The `MakeYourselfTired` shutdown helper does **not** touch chemical 158 — it writes only Tiredness (154) and Sleepiness (155). A creature exported to a CAV save therefore retains whatever Fear value it had at save time. Since Fear decays on a Medium-speed passive-decay track with no reservoir feeding it, a scared-at-save-time creature will arrive in its new world with its Fear value intact but already on its way down: the first minute of real time after import will halve it regardless of the destination environment.

The Adrenalin level from the save is also preserved, so a creature saved mid-panic will arrive still panicking if it also arrives with active Adrenalin — a pathological case that modders occasionally hit when engineering "always anxious" creatures by pre-loading both chemicals in the initial-concentration table.

### Contrast with Crowded, Loneliness, Boredom

| Drive | Primary source | Reservoir | Receptors | Amplification | Physiological effects |
|-------|----------------|-----------|-----------|---------------|----------------------|
| Fear (158) | Toxin + Anger exchange + neuroemitter | **None (orphan)** | 4 (drive, clock, gait, panic) | **Yes** (Fear+Adrenalin) | Heart rate, gait, Stress (Fear) |
| Crowded (157) | Sensorimotor (density) | Yes (140) | 2 (drive, panic@90%) | No | Stress (Crowded) at extremes |
| Loneliness (156) | Sensorimotor (inverse density) | Yes (139) | 1 (drive) | No | None |
| Boredom (159) | `LOC_CONST` drip | Yes (142) | 1 (drive) | No | None |
| Anger (160) | Fear exchange + neuroemitter | **None (orphan)** | 3 (drive, panic, Stress) | **Yes** (Anger+Adrenalin) | Stress (Anger) |

Fear is the most physiologically impactful drive in the block and the only one with an autocatalytic amplifier that switches on at adolescence. It is also one of only two drives (with Anger) whose reservoir slot is intentionally unwired, reflecting the design intent that emotional signals be sharp and ephemeral rather than chronic.

### Implications for modders

Common modifications built on Fear:

1. **Wire up the missing `Fear → Fear backup` sweep reaction** (half-life ~6 ticks) to give Fear a reservoir. Creates chronically-fearful Norns whose Fear level lingers for minutes after an event. Pair with a `Fear backup → Fear` drip reaction (half-life ~311 ticks) for the full reservoired-drive pattern.
2. **Add a stimulus-lobe neuroemitter to Fear** from a "dangerous object perception" neuron so that the cognitive appraisal system contributes directly, rather than relying entirely on Fear-toxin-via-event-scripts. Useful for creatures that are supposed to recognise types of threats.
3. **Lower the Circulatory Locus 11 receptor threshold** below 204 to make panic trigger at moderate fear levels. Produces "nervous" breeds that enter the Stress (Fear) pipeline easily.
4. **Remove the Youth gate on receptor 157** so infants can also panic. Produces high-strung baby Norns with full adult fear physiology.
5. **Add a sensorimotor receptor on 158 at LOC_GAIT4 with a lower threshold** (e.g. 64 instead of 128) so mildly-scared creatures already exhibit the panic gait. Useful for nervous-breed visuals.
6. **Block reaction 40 (`Fear → Anger`)** — e.g. gate it with a catalyst — to produce creatures that cannot escalate from fear to aggression. Useful for docile-breed designs.
7. **Add a `Pain → Fear` spillover reaction** to tie injury to fright. Models startle response to painful events without requiring separate event scripts.
8. **Boost reaction 38's Adolescent-gate threshold** (lower `switchOnAge`) so younger Norns can also panic. Or conversely, raise it so only mature adults exhibit the full cascade.
9. **Wire a neuroemitter from the concept lobe into Fear** to make fear context-sensitive: a specific learned concept ("this type of agent is dangerous") fires the neuron and writes Fear. Requires complex training but produces the most realistic creature-specific fear profiles.

### Practical consequences for gameplay

- **Fear rises quickly and falls quickly.** Unlike Crowded or Loneliness, fear responds to events on a seconds-to-tens-of-seconds timescale. A scary event produces a sharp spike; within a minute or two of the event ending, the level is near zero.
- **Fear cascades at Adolescent+.** Teen and adult Norns exposed to repeated Fear-toxin pulses (or any Adrenalin-coinciding event) will enter a panic cascade that can saturate the chemical cap. Babies cannot cascade — they respond to fear more mutedly, matching the real-world developmental pattern.
- **Fear makes the creature run differently.** At moderate levels, the gait switches to LOC_GAIT4, which looks visually distinctive (faster, wider-step, jittery). This is the most visible gameplay symptom of fear.
- **Fear accelerates the heart.** The RLOCUS_CLOCKRATE receptor speeds up the Reaction organ's tick rate, which in turn accelerates all organ reactions — including hunger development, sleep debt accumulation, and energy burn. A chronically-frightened Norn becomes hungry and tired faster than a calm one.
- **Severe Fear triggers panic + Stress (Fear) at Youth+.** Only at Youth or older does the circulatory panic gate open, producing the generalised stress-response chemical. Babies and children can be scared but cannot be *stressed* by fear.
- **`CHEM 158 <n>` is honest.** Unlike reservoired drives, writing to Fear directly has its full intended effect because there is no sweep reaction banking it away. Scripts that want to produce a specific fear level can write to 158 and get a reliably-readable value on all four receptors.
- **`CHEM 80 <n>` (Fear toxin) is the canonical stimulus injection.** The 14:1 metabolism ratio and Short half-life produce a smooth, delayed fear ramp that feels more natural in gameplay than a direct write to 158. Scary agent scripts, bootstrap "surprise" events, and predator interactions all use Fear toxin rather than direct Fear.
- **Fear and Anger are interchangeable over time.** Sustained Fear gradually becomes Anger and vice versa. A Norn startled into fear, then denied the flee response for long enough, will eventually transition into aggression — a realistic emotional progression baked into the chemistry.
- **Newly-hatched Norns start at zero Fear.** No initial concentration means babies begin the game with a completely calm nervous system, and their first Fear experience is genuinely novel. This is important for fair imprint-learning: creatures cannot enter the world pre-disposed to fear something specific.

### Summary

```
 Stock-genome wiring of Fear [158]
 ──────────────────────────────────
 Inputs:
   reaction 79 (gene 93)  14× Fear toxin [80] → 1× Fear
     half-life 24 ticks (Short, ~0.8 s)
     — primary stimulus pathway (scary events → toxin → fear)

   reaction 41 (gene 3)  1× Anger [160] → 1× Fear
     half-life 95 ticks (Short, ~3.2 s)
     — mutual conversion with Anger

   reaction 38 (gene 5, Adolescent+) Fear + Adrenalin → 2 Fear + Adrenalin
     half-life 58 ticks (Short, ~2 s), autocatalytic amplifier
     — panic cascade engine (requires Adrenalin catalyst)

   neuroemitter #1 (gene 1)  move lobe neuron 37, rate 4
     → +5 Fear, +8 Adrenalin, +6 Crowded, +8 chemical 117
     — only brain-level input; simultaneously primes the autocatalysis

   CHEM 158 <n>  (CAOS / scripts / mods)
   CAV import state (not touched by MakeYourselfTired)

         Fear [158]                  half-life 686 ticks (Medium, ~23 s)
         initial concentration: 0    decays ≈0.1 %/tick on its own
                 │
                 ├──► Drives receptor #11 (gene 10):
                 │      Drives tissue (5) / locus 10 / threshold 0 / gain 209, from Baby
                 │      → decision-lobe "fear" drive bar
                 │
                 ├──► Somatic receptor #142 (gene 17):
                 │      Organ #2 / Somatic (0) / RLOCUS_CLOCKRATE / threshold 45 / gain 255
                 │      analogue, from Baby
                 │      → cardiac acceleration (heart races when scared)
                 │
                 ├──► Sensorimotor receptor #188 (gene 102):
                 │      Creature / Sensorimotor (4) / LOC_GAIT4 / threshold 128 / gain 223
                 │      analogue, from Baby
                 │      → gait switch to flee/panic-run pattern
                 │
                 ├──► Circulatory receptor #157 (gene 55):
                 │      Creature / Circulatory (1) / Locus 11 / threshold 204 DIGITAL
                 │      from Youth
                 │      → panic locus → emitter #36 (gene 15) → Stress (Fear) [191]
                 │           → circulatory locus 18 → generalised stress response
                 │
                 ├──► reaction 40 (gene 1):  1× Fear → 1× Anger
                 │      half-life 95 ticks (Short)
                 │      — escalation: sustained Fear → Anger
                 │
                 └──► passive decay  half-life 686 ticks (Medium)
                      — the only drain-to-zero path

 No active → backup sweep reaction exists.
 Fear backup [141] is an orphan reservoir slot: no stock reaction writes to it,
 no stock receptor reads it. See 141 - Fear backup.md for details.

 Companion axis: Anger [160] is linked by the mutual-conversion pair
                 (reactions 40 / 41) and shares the Adrenalin-autocatalysis
                 pattern (reaction 39 mirrors reaction 38 for Anger).
```

Fear is the **acute, autocatalytic, multi-receptor emotional drive** of the Creatures 3 biochemistry. Its chemistry — a toxin-fed primary source, a mutual exchange with Anger, a youth-gated panic trigger, an Adolescent-gated autocatalytic amplifier, and a purely-acute design that skips the reservoir block entirely — produces the sharpest and most physically-embodied of the drive-chemical signals. A frightened Norn doesn't just want to flee: its heart is racing, its gait has shifted, the decision lobe is weighted toward retreat, and if the fear is severe enough and the creature is old enough, a full stress-response chemical is entering the bloodstream. Together with its orphan reservoir Fear backup [141] (intentionally unwired to keep the drive ephemeral) and its paired Anger drive (via the symmetric conversion reactions), it forms the fight-or-flight emotional axis that the decision lobe, cardiac system, gait controller, and stress-response block all read simultaneously whenever a Norn encounters something alarming.
