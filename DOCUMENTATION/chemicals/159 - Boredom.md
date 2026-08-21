# 159 - Boredom

Boredom is the **active drive chemical** for the creature's need for cognitive stimulation and variety in its behaviour. It occupies slot 12 of the sixteen "drive" chemicals in the 148–161 block — the active signals the decision lobe reads to choose behaviour — and it is paired with **Boredom backup [142]** in the canonical Creatures 3 / Docking Station drive/reservoir architecture. Its defining feature in the stock genome is that **its source is unconditional**: a `LOC_CONST`-driven sensorimotor emitter drips Boredom into the bloodstream at a steady rate every 8 ticks, irrespective of what the creature is doing, where it is, or what it is looking at. The creature is, by biological default, *becoming more bored every second it is alive*. Reducing the drive therefore depends entirely on **external events writing negative Boredom** — script-side `stim` writes attached to engaging objects, neuroemitter-style decision-lobe reward chemicals, and CAOS `CHEM` injections from toys, food, and social events — each of which chips away at the constantly-accumulating pool.

This "always-rising, externally-drained" design is the chemistry of **stimulation hunger**: the creature does not need to be *under-stimulated* for boredom to grow — it grows regardless — but it needs to be *sufficiently stimulated* to keep the bar from creeping up. In gameplay, Boredom is therefore the drive that punishes inactivity, punishes repetition (once the decision lobe has learned a reward, the same stimulus delivers the same nudge, but the creature's attention drifts when the brain's reinforcement loop stops firing), and rewards exploration and variety. A Norn that sits idle in a corner for a few minutes has a rising Boredom bar; a Norn that plays with a ball, eats a new fruit, listens to music, or hears a new word keeps the bar low.

Like Loneliness, Boredom is an **exclusively cognitive** drive: its only downstream effect is a single decision-lobe drive bar (Drives tissue locus 11, gain 211). There is no gait receptor, no cardiac receptor, no circulatory panic locus — a bored Norn's body does not slow down, speed up, or enter a measurable stress state. Boredom is a **motivational** signal, not a physiological one. And unlike Loneliness, Crowded, Tiredness, or the hunger block, it is **born non-zero**: the genome's initial-concentration table writes 90 units of Boredom into a freshly-hatched Norn (≈35 % of full scale), so a new creature already begins the game with a mid-range boredom bar that predisposes the decision lobe to seek novelty from its very first ticks of life.

## Sources

Boredom has one continuous endogenous source (the unconditional `LOC_CONST` emitter), a drip release from the backup reservoir, and the usual direct-CAOS injection path. No brain neuron, organ reaction, pathology pathway, or cross-drive spillover writes to Boredom in the stock genome.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | `LOC_CONST` sensorimotor emitter | Gene 3 (emitter id 2) | Creature / Sensorimotor (tissue 4) | Locus 0 `LOC_CONST`, threshold 128, rate 8, gain 1, **DIGITAL (fixed gain)** | **The sole always-on production pathway.** `LOC_CONST` is a sensorimotor "constant" locus hard-wired to 255 every tick — it is always above the 128 threshold. The emitter therefore fires unconditionally every 8 ticks, writing 1 unit of Boredom into the bloodstream. Over one real-time minute (at 30 Hz tick rate) that is ≈225 units — more than enough to fully saturate the active chemical if nothing drains it. This is the mechanism by which **the simple passage of time raises the boredom bar**: there is no "triggering stimulus" for boredom the way Fear has Fear toxin, or Loneliness has LOC_CROWDEDNESS — boredom is produced by the clock |
| 2 | Backup → active drip | Gene 17 (reaction id 54) | Organ #2 "Reaction" | `1× Boredom backup [142] → 1× Boredom [159]` at half-life **311 ticks** ("Medium", decay rate 0.99777) | ≈0.22 %/tick of the reservoir is released into the active drive. Whatever Boredom-backup has accumulated during previous idle periods continues to bleed back into the active drive bar for minutes afterward, even if the creature is currently being stimulated. This is the mechanism by which **past boredom has inertia**: a Norn that has been bored for a long time does not instantly relax when a toy is produced; the banked reservoir will keep raising the active bar until the toy's reward writes drain both pools |
| 3 | Direct CAOS injection | — | Any | `CHEM 159 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot. Active Boredom is swept to the reservoir very quickly (two parallel sweep reactions, effective half-life ~3 ticks — see Usage), so a positive `CHEM 159 <n>` write peaks immediately and then decays into the reservoir within a handful of ticks. Most of the injected mass ends up banked as Boredom backup rather than lingering on the active bar. A **negative** `CHEM 159 <n>` write is the canonical way scripts relieve boredom — see below |
| 4 | Initial concentration 90 (≈35 %) | Gene 13 (initial-concentration entry id 24) | Bloodstream | Chemical 159 set to 90 at birth | **Boredom is one of the few drives that is born non-zero.** A hatchling already carries 35 % of full-scale active Boredom in its bloodstream, which means the very first decision the decision lobe makes is being pushed — weakly — toward "do something novel". Because reservoir 142 is born at 0, the backup starts empty, so the initial 90 units on the active chemical will quickly be swept into the reservoir and begin the normal active↔reservoir cycle within the creature's first few seconds of life. This initial bias is what prevents a newly-hatched Norn from sitting motionless immediately after hatching — it begins life already mildly bored and therefore already reaching for the first interesting thing in its visual field |
| 5 | No brain or organ emitter | — | — | The stock neuroemitter list contains no brain-neuron, organ-tissue, or circulatory emitter writing to chemical 159. Beyond the single `LOC_CONST` emitter and the reservoir drip, no endogenous cognitive or metabolic source exists. This makes Boredom entirely a function of **time** (via the `LOC_CONST` drip), **history** (via the reservoir), and **external events** (via script `CHEM` injections) | — |
| 6 | No cross-drive spillover | — | — | No stock-genome reaction routes Pain, hunger, fear, anger, crowdedness, tiredness, or any other drive chemical into Boredom or its backup. The boredom axis is completely isolated at the chemical level — other drives do not indirectly raise or lower it | — |
| 7 | Modded genomes | User-added | User-added | Common mods include: replacing the `LOC_CONST` emitter with one keyed to an idle-detection locus so boredom only rises when the creature is genuinely inactive; adding a `Pain → Boredom backup` spillover reaction ("misery grows over time"); wiring a concept-lobe "familiarity" neuron as a neuroemitter on 159 so repetition of known stimuli raises boredom faster than novelty; adding a catalyst gate on reaction 54 so banked boredom only surfaces under specific conditions; adjusting the `LOC_CONST` emitter's rate (8 → higher → slower accumulation, lower → faster) to tune the age-of-a-Norn-before-it-gets-bored | Gene-dependent |

## Usage

Boredom has exactly **one receptor** — the decision-lobe drive bar — plus two parallel consuming sweep reactions and a passive-decay track that is essentially non-functional. Because of the parallel sweep and the very-long passive decay, **the stock genome has no mechanism to remove Boredom mass from the body**: the drive chemistry is *conservative*, cycling between active (159) and backup (142) forever, and can only be truly drained by external negative writes. This is structurally distinct from every other drive in the block, which has at minimum a medium-speed passive-decay track on the active chemical.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Drives-tissue "Boredom" receptor | Gene 11 (receptor id 12) | Creature / Drives (tissue 5) | Locus 11 "Boredom", threshold 0, gain 211, analogue, from Baby | **The boredom drive bar the decision lobe reads to choose novelty/variety behaviours.** Threshold 0 means proportional response at every level; gain 211 puts Boredom at the same cognitive weighting as Crowded (209) and Fear (209). This is the sole downstream effect of Boredom in the stock genome — there is no somatic, circulatory, sensorimotor, or organ-level reader. A bored Norn is motivated, not sickened |
| 2 | Active → backup sweep (copy A) | Gene 57 (reaction id 64) | Organ #2 "Reaction" | `1× Boredom [159] → 1× Boredom backup [142]` at half-life **6 ticks** ("Very short", decay rate 0.88978) | ≈11 %/tick of the active drive is banked into the reservoir |
| 3 | Active → backup sweep (copy B) | Gene 69 (reaction id 72) | Organ #2 "Reaction" | `1× Boredom [159] → 1× Boredom backup [142]` at half-life **6 ticks** ("Very short", decay rate 0.88978) | A **second, identical sweep reaction** runs in parallel to reaction 64. Both pull from 159 to 142 at the same rate. This is the only drive in the stock genome with a duplicated sweep — Hunger-for-carbohydrate, Hunger-for-fat, Coldness, Hotness, Tiredness, Sleepiness, Loneliness, Fear, Anger, Pain, Comfort, and Sex-drive each have exactly one sweep reaction. With two in parallel, the effective half-life of the active → reservoir transfer is **~3 ticks** (≈21 %/tick), roughly double the normal sweep rate. This makes active Boredom decay into the reservoir very rapidly: a `CHEM 159 <n>` positive write is almost immediately banked into 142, where it will drip back out over minutes. The practical consequence is that **direct positive writes to 159 are a poor way to sustain boredom**; scripts that want to *raise* boredom realistically should write to 142 (the reservoir) instead, and scripts that want to *drain* it should write negative to both |
| 4 | Passive decay (active) | Gene 64 entry #159 (half-life table) | Bloodstream | genomeValue 255, half-life ~9×10¹⁰ ticks ("Very long", decay rate 1.0) | **Effectively zero.** The genome value 255 maps to a half-life of ~90 billion ticks — many orders of magnitude longer than any creature's lifetime. Mass on the active chemical does not meaningfully decay on its own; it must be swept to the reservoir or consumed by negative CAOS writes |
| 5 | Passive decay (backup) | Gene 64 entry #142 (half-life table) | Bloodstream | genomeValue 255, half-life ~9×10¹⁰ ticks ("Very long", decay rate 1.0) | **Also effectively zero.** Boredom backup does not decay. Mass entering the reservoir stays there until it drips back out (reaction 54) or is consumed by negative CAOS writes on chemical 142 |
| 6 | No annihilation with any other chemical | — | — | Boredom has no mutual-destruction reaction with any other drive (unlike the Loneliness ↔ Crowded pair, which mutually annihilate via reaction 24, or Hotness ↔ Coldness, which annihilate via reaction 23). Its mass is fully conserved at the reaction level — only negative external writes can reduce total (active + backup) Boredom | — |
| 7 | No sensorimotor, circulatory, or organ reader | — | — | Unlike Tiredness (which fires `LOC_GAIT2` and an immune receptor), Sleepiness (`LOC_GAIT3` and a Youth+ circulatory locus), Hotness (`RLOCUS_CLOCKRATE`), Fear (four receptors across four tissues), or Coldness (`LOC_INVOLUNTARY4`), chemical 159 has no reader outside the decision-lobe drive bar. A bored Norn walks, metabolises, fights infection, and regulates temperature exactly like a non-bored one. The only change is which action its decision lobe selects | — |
| 8 | Negative `CHEM 159 <-n>` writes from external scripts | — | Any | Stimulus scripts attached to interactive objects (toys, food, music players, social interactions with other creatures, vocabulary words, etc.) | **The canonical drainage mechanism in the shipping game.** Because the endogenous sources guarantee monotonic accumulation, the only way for Boredom to go down in normal gameplay is for scripts to write negative values. Most `stim` (sensory stimulation) macros attached to objects include a small negative Boredom nudge as part of their reward cocktail; the decision lobe's reinforcement learning then identifies those objects/actions as boredom-relievers and biases future action selection toward them. The design is intentional: **boredom teaches the decision lobe what "fun" means**, by making every externally-rewarded action cross-reinforced as a boredom-reliever | — |
| 9 | Modded consumers | User-added | User-added | Modders may add a sensorimotor receptor on 159 to produce a "slumped posture" bored idle pose; a brain-lobe receptor feeding a concept-memory cell so long-term boredom influences learning; a circulatory receptor to simulate chronic-boredom stress or immune dampening; an organ receptor that slows clock rate (the "fidgety" opposite pathology); or an auto-decay gene on the passive-decay table so boredom can eventually fade on its own without external scripts | Gene-dependent |

## Role in Game Mechanics

### The "always rising" design

The stock genome makes Boredom structurally unique among the sixteen drive chemicals: **its endogenous source is unconditional**. The `LOC_CONST` locus (sensorimotor tissue 4, locus 0) is not connected to any environmental input — it is a raw constant value permanently set to 255, read by any emitter or receptor that wants a "clock tick" trigger. The stock genome uses it for two things: the Boredom emitter (gene 3), and the gene-loop trigger machinery for a handful of other genes. For Boredom specifically, it means the threshold-128 check is always met, and the emitter therefore fires **every 8 ticks for the entire lifetime of the creature**.

This is in deliberate contrast to the other sensorimotor-fed drives:

| Drive | Source locus | Source value depends on | When does source fire? |
|-------|--------------|-------------------------|------------------------|
| Tiredness (154) | `LOC_TIREDNESS` | Time since last sleep, muscular exertion | During activity |
| Sleepiness (155) | `LOC_TIREDNESS` (inverse) | Time since last sleep | Continuously, but slowly |
| Coldness (152) | Air temperature locus | Room temperature (cold reading) | When cold |
| Hotness (153) | Air temperature locus | Room temperature (hot reading) | When hot |
| Loneliness (156) | `LOC_CROWDEDNESS` (inverse) | Density of same-kind in room | When few peers |
| Crowded (157) | `LOC_CROWDEDNESS` | Density of same-kind in room | When many peers |
| **Boredom (159)** | **`LOC_CONST`** | **Nothing — constant 255** | **Always** |

Every other sensorimotor-sourced drive has some form of "this condition produces this signal"; Boredom's condition is *existing*. This encodes the design philosophy that **all waking experience is, biologically, mildly aversive unless actively rewarded** — the default state of the decision lobe is low-grade motivation to do *something*, which keeps the creature from sitting completely still and provides the reinforcement-learning gradient that the decision lobe needs to learn anything at all.

### Boredom drives reinforcement learning

Without a continuously rising drive, the decision lobe would have no gradient to learn from. Reinforcement learning in Creatures 3 works by:

1. The decision lobe chooses an action based on current drive bars and learned weights.
2. Executing the action produces world-state changes, which trigger `stim` scripts on objects and creatures.
3. Those `stim` scripts write chemical nudges (typically small negative values) to the creature's drive chemicals.
4. The decision lobe observes which bars went down after which action, and adjusts the action-selection weights to prefer reward-generating actions in similar states.

If Boredom did not rise unconditionally, the decision lobe would never have a reason to try a new action once it had found one drive-reducer for hunger, one for tiredness, one for coldness, etc. Boredom is the **exploration pressure**: no matter how well-fed, well-rested, and well-companioned the creature is, the boredom bar keeps rising, forcing the decision lobe to keep selecting actions — and therefore keep learning.

This also explains the initial concentration of 90. A newborn Norn must begin the reinforcement loop immediately, not wait for boredom to accumulate through the first minute of `LOC_CONST` ticks. The 35 % head start primes the system so the very first action selection is under meaningful drive pressure, and the decision lobe can begin accumulating weight updates from its first moments of life.

### The dual-sweep and the rapid reservoir cycle

The parallel pair of sweep reactions (64 and 72) — both converting Boredom to Boredom backup at half-life 6 — is the only duplicated sweep in the stock drive block. Why?

The practical effect is to **double the sweep rate**: with two reactions running in parallel at ≈11 %/tick each, the effective drain from 159 to 142 is ~21 %/tick, an effective half-life of ~3 ticks. This means the active chemical equilibrates very quickly with the reservoir — within a second of any perturbation, active Boredom is close to its steady-state fraction of the total (active + backup) mass.

Combined with the Medium-speed drip back from 142 to 159 (half-life 311 ticks), the equilibrium distribution at steady state has the active chemical at a small fraction of the backup:

- Sweep effective rate ≈ 21 %/tick = 0.21
- Drip rate ≈ 0.22 %/tick = 0.0022
- At equilibrium: active × 0.21 = backup × 0.0022 → active / backup ≈ 0.01

That is: **~99 % of the total boredom mass sits in the reservoir at steady state, and only ~1 % shows on the active drive bar**. This is the biochemistry of **slow social-weather dynamics** — the reservoir is a low-pass filter that smooths the unconditional `LOC_CONST` emission into a slowly-drifting "how bored has this creature been lately" value, rather than a jittery instantaneous "how bored is it right now" value.

The large reservoir-to-active ratio also means that **draining Boredom via a negative CAOS write is much more effective against chemical 142 than against 159**. A `CHEM 159 -30` write removes 30 units from the active bar, but the reservoir (at perhaps 2400 units) will drip back a large fraction of that within a few seconds. A `CHEM 142 -30` write removes 30 units from the actual stored boredom pool, and the ~1 % active equilibrium means the visible drop on the drive bar is only ≈0.3 units — but it is **permanent**. In the shipping scripts, toys and food tend to write negative values to both 159 and 142 in small amounts, giving an immediate visible drop on the bar (from the 159 write) and a persistent drain on the reservoir (from the 142 write).

### Reducing boredom: the stim-script pathway

Because neither the active chemical nor the backup have meaningful passive decay, and because the `LOC_CONST` emitter is always firing, boredom in the stock biochemistry is **only drained by external writes**. The canonical source of those writes is the sensory-stimulation macro system:

- Every interactive object in the shipping world has a `stim` script (or a chain of them) that fires on the player's or creature's interaction events (`PUSH`, `PULL`, `HIT`, `EAT`, `SIT`, `LISN`, etc.).
- The `stim` macro writes a cocktail of small chemical nudges to the creature's bloodstream, typically including a negative Boredom (and often negative versions of whatever other drive the action satisfies — e.g. food gives negative Hunger too).
- The creature's brain additionally produces a general "reward" chemical signal when the decision lobe is satisfied with its action choice. This signal is typically routed through the Reward/Punishment chemicals (116/117) and tied to neuroemitters that modulate neural weights and sometimes nudge drive chemicals directly.

The specific Boredom-reducing magnitude on each interaction is a tuning variable that shipping objects set according to how "interesting" they are meant to be: a simple rock gives a small drain, a complex toy gives a larger drain, a novel creature word gives a moderate drain plus reinforcement of the linguistic learning system. Over a Norn's lifetime, the decision lobe learns which object-action combinations produce the strongest net drain on its drive bars (Boredom being one of many), and biases future action selection toward those combinations — the behavioural signature of a creature that has "favourite toys", "preferred foods", "favourite people".

This is the direct mechanism behind the cognitive feel of boredom in the game: a Norn in a featureless room gets bored because nothing is firing `stim` scripts at it; put a ball in the room and it stops being bored *if and only if* its decision lobe has learned that balls relieve boredom. Newly-hatched Norns have to explore a few interactions before their decision lobe has learned anything — which is why babies will frequently poke at inanimate walls, try to eat their own body parts, or otherwise behave erratically: they are pressured by rising boredom to take actions, but they have not yet learned which actions produce the `stim`-script writes that relieve it.

### Effects of directly filling Boredom

A `CHEM 159 <n>` injection produces a characteristic pattern shaped by the dual sweep and the reservoir drip:

1. **Tick 0**: Active Boredom rises to *n*. The decision-lobe drive bar shows a sudden jump. If the creature is awake, the next action-selection cycle will weight boredom-relieving actions more strongly.
2. **Ticks 1–30** (~1 second): The dual sweep begins banking the active mass into the reservoir at ~21 %/tick. The bar falls rapidly — a `CHEM 159 50` write at *t* = 0 shows ~5 on the bar by *t* = 30.
3. **Ticks 30–300** (~10 seconds): The reservoir drip begins releasing the banked mass back into the active bar. At equilibrium (~99 % in reservoir, ~1 % active), the bar settles at ~0.5 units above its pre-injection level.
4. **Long-term**: Because neither pool decays, the injected mass is **permanent**. Future `LOC_CONST` emissions pile additional mass on top, and the bar continues its normal slow rise. A positive `CHEM 159 50` write is therefore equivalent to giving the creature a few extra minutes of boredom history — it rolls into the reservoir and never leaves.

A `CHEM 159 -n` (negative) write immediately drops the active bar, but is rapidly "refilled" from the reservoir over the next few seconds. To genuinely reduce boredom, a negative write to chemical 142 (the reservoir) is required — and even then, the ongoing `LOC_CONST` drip will begin re-accumulating mass immediately.

A `CHEM 142 -n` write on the reservoir has the opposite profile: no immediate visible drop on the bar, but the equilibrium level it settles at is permanently lower (minus the dripped-in contribution from ongoing emissions).

The standard shipping scripts combine both writes for maximum effect: a small negative write to 159 for the immediate visible feedback, and a matching negative write to 142 for the durable drain. This pair-write pattern is the reason the Creatures 3 SDK's `stim` macro template always specifies both the active and backup chemical for any drive being relieved.

### CAV save/load and imported creatures

A creature exported to a CAV save retains its Boredom and Boredom backup values at save time. Because neither chemical has meaningful passive decay, the saved values are preserved exactly on import — a creature that was mildly bored at export arrives mildly bored in the new world, and a creature that was at saturation arrives saturated. The `MakeYourselfTired` helper does not touch chemical 159 or 142; it writes only Tiredness and Sleepiness.

The unconditional `LOC_CONST` emitter begins firing immediately on import, so saved Boredom continues to accumulate from the exact moment of deserialisation. A creature saved in a world with lots of stimulating objects and then imported into an empty world will begin accumulating Boredom backup at ~225 units/minute with no offsetting `stim` drains — rapidly saturating the reservoir and producing the characteristic "new-world malaise" pattern in which newly-imported Norns appear bored even in novel environments, because their brains have not yet learned which local objects to approach.

### Contrast with the other drives

| Drive | Source | Rises | Decays naturally? | Main receptor |
|-------|--------|-------|-------------------|----------------|
| Pain (148) | Injury/antigen toxins | On event | Yes (Medium) | Drive bar + involuntary action |
| Hunger for protein (149) | Tissue-depletion emitter | Slowly | No (reservoired) | Drive bar |
| Hunger for carb (150) | Tissue-depletion emitter | Slowly | No (reservoired) | Drive bar |
| Hunger for fat (151) | Tissue-depletion emitter | Slowly | No (reservoired) | Drive bar |
| Coldness (152) | Air temperature | With cold room | No (swept) | Gait + drive bar |
| Hotness (153) | Air temperature | With hot room | No (swept) | Clockrate + drive bar |
| Tiredness (154) | Activity | With activity | No (reservoired) | Gait + drive bar |
| Sleepiness (155) | Clock | Slowly | No (reservoired) | Gait + drive bar |
| Loneliness (156) | `LOC_CROWDEDNESS` inverse | When alone | Yes (Medium) | Drive bar only |
| Crowded (157) | `LOC_CROWDEDNESS` | When crowded | Yes (Medium) | Drive bar + panic |
| Fear (158) | Toxin + Anger exchange | On event | Yes (Medium) | Drive, clock, gait, panic |
| **Boredom (159)** | **`LOC_CONST` (clock)** | **Always** | **No (Very long)** | **Drive bar only** |
| Anger (160) | Fear exchange | On event | Yes (Medium) | Drive + panic + stress |
| Sex drive (161) | Hormones | With age | No (reservoired) | Drive bar |

Boredom is the only drive whose source is **unconditional and whose stored mass cannot be drained without external writes**. Loneliness rises only when alone, falls partly by decay and partly by mutual-annihilation with Crowded. Crowded rises only when many peers are near, falls the same way. Every hunger drive can be reduced by eating. Fear decays automatically. Boredom keeps rising, forever, unless the creature is actively entertained — which is precisely the behavioural signature the gameplay wants to produce.

### Implications for modders

Common modifications built on Boredom:

1. **Replace the `LOC_CONST` emitter with an analogue emitter on an idle-detection locus** so boredom only rises when the creature is genuinely inactive. Produces creatures that are contentedly absorbed in activity but bored when stationary.
2. **Add a passive-decay value to chemical 159 and/or 142** (edit gene 64's half-life table) so boredom eventually fades without external intervention. Produces more forgiving creatures — useful for CAV worlds with sparse object density.
3. **Wire a concept-lobe "familiarity" neuron as a neuroemitter on 159** so repeated exposure to the same stimulus raises boredom faster than novel stimuli. Produces Norns that actively seek variety.
4. **Add a sensorimotor receptor on 159 at a lower threshold** producing a "fidgeting" idle pose when boredom is high. Visual signal for the player that a creature needs attention.
5. **Gate reaction 54 with a catalyst** so banked boredom only surfaces when some condition is met (e.g. the creature is awake, alone, or in a specific room). Useful for advanced narrative control over when boredom is allowed to affect behaviour.
6. **Add a `Pain → Boredom backup` spillover reaction** to tie chronic misery to boredom ("when nothing goes right, everything feels pointless"). Produces creatures that develop long-term behavioural withdrawal after sustained pain exposure.
7. **Remove one of the two parallel sweep reactions** (e.g. delete reaction 72 and keep reaction 64) to halve the sweep rate. Produces a higher equilibrium ratio of active-to-backup, making the bar more responsive but also noisier.
8. **Increase the initial concentration from 90 to 180 or higher** to make babies born "desperate for stimulation". Useful for breeds meant to seek attention from the first moment of life.
9. **Lower the `LOC_CONST` emitter's rate from 8 to 2 or 1** to accelerate boredom accumulation. Produces creatures that require constant entertainment — useful for modelling neurotic or highly-active breeds.

### Practical consequences for gameplay

- **Boredom rises constantly whenever the creature is alive.** Unlike every other drive, there is no environmental condition that suppresses its source. A Norn in the calmest, safest, most well-fed and well-rested state still has a rising boredom bar.
- **Boredom is not drainable without external stimulation.** In an empty world with no interactive objects, boredom accumulates monotonically until the bar saturates. This is the chemistry behind "lonely empty worlds produce listless creatures" — the decision lobe's constant attempts to relieve boredom never succeed because no object is writing the required negative nudges.
- **Newly-hatched Norns begin the game mildly bored.** The initial concentration of 90 ensures the very first action-selection cycle is already under drive pressure. Babies do not sit idle; they immediately begin poking, prodding, and exploring.
- **Reducing boredom on the bar is easy; reducing it permanently requires writing to the reservoir.** Shipping `stim` scripts write negative to both 159 and 142 for this reason. Player-injected `CHEM 159 -50` writes produce a satisfying visible drop but no durable relief.
- **Boredom is the engine of exploration and learning.** Without the constantly-rising drive, the decision lobe would have no reason to keep trying new actions once its immediate physical needs are met. Boredom is the biochemical reason Norns are curious.
- **The reservoir smooths short-term fluctuations.** Because ~99 % of total boredom mass sits in the reservoir at steady state, the visible drive bar reacts to *recent-history* boredom rather than *instantaneous* boredom. A brief burst of entertainment lowers the bar for a moment but the reservoir drips it back; a sustained period of entertainment drains the reservoir and the bar stays low for a long time.
- **`CHEM 159 <n>` positive writes are ineffective for sustained boredom.** The dual sweep banks the active mass into the reservoir within seconds. Scripts that want to raise a creature's boredom should target the reservoir (chemical 142) directly.
- **`CHEM 142 -n` reservoir writes are the definitive boredom-reducer.** Scripted "enrichment" agents that want to genuinely reduce a creature's boredom for minutes afterwards should write negative values to 142, not 159.
- **Imported creatures retain their boredom exactly.** No cleansing happens on CAV import; a creature arrives as bored as it was when saved, and boredom continues to accumulate in the new world.

### Summary

```
 Stock-genome wiring of Boredom [159]
 ────────────────────────────────────
 Inputs:
   emitter #2 (gene 3)  Sensorimotor LOC_CONST → Boredom
     threshold 128 (always met, since LOC_CONST = 255)
     rate 8 ticks, gain 1, DIGITAL (fixed gain)
     — UNCONDITIONAL: fires every 8 ticks for the entire creature lifetime
     — ≈225 units/minute at 30 Hz

   reaction 54 (gene 17)  Boredom backup [142] → Boredom
     half-life 311 ticks (Medium)
     — slow drip-release from reservoir, banked mass resurfaces over minutes

   initial concentration 90  (gene 13, ≈35 % of full scale)
     — Norns are born mildly bored

   CHEM 159 <n>  (CAOS / stim scripts / mods)
     — both positive (rare) and negative (common from object stim scripts)

         Boredom [159]               half-life ≈9×10¹⁰ ticks (Very long = none)
         initial concentration: 90   active chemical does not decay
                 │
                 ├──► Drives receptor #12 (gene 11):
                 │      Drives tissue (5) / locus 11 / threshold 0 / gain 211
                 │      analogue, from Baby
                 │      → decision-lobe "boredom" drive bar
                 │      — sole downstream effect, cognitive only
                 │
                 ├──► reaction 64 (gene 57):  Boredom → Boredom backup
                 │      half-life 6 ticks (Very short)
                 ├──► reaction 72 (gene 69):  Boredom → Boredom backup
                 │      half-life 6 ticks (Very short)
                 │      — DUAL parallel sweep, effective half-life ~3 ticks
                 │        (~21 %/tick banked to reservoir)
                 │      — ~99 % of total mass sits in reservoir at equilibrium
                 │
                 └──► passive decay  half-life ~9×10¹⁰ ticks (effectively none)
                      — mass is conserved; only external negative writes
                        can drain total (active + backup) boredom

 Companion reservoir: Boredom backup [142]
   Also has Very long passive decay (never decays naturally)
   Fed by reactions 64 + 72 (dual sweep from active)
   Drained by reaction 54 (drip to active) at half-life 311 ticks
   ~99 % of total boredom mass resides here at steady state
```

Boredom is the **clock-driven, externally-drained, purely cognitive motivational drive** of the Creatures 3 biochemistry. Its chemistry — a sensorimotor emitter that fires unconditionally every 8 ticks, a dual parallel sweep that rapidly banks active mass into a reservoir, a slow drip that bleeds the reservoir back into view over minutes, and the complete absence of any passive-decay pathway — encodes the design intent that **being alive is, by default, mildly unsatisfying**, and that the decision lobe must therefore perpetually seek new stimulation to keep the bar low. It is the biochemical engine of curiosity, exploration, and reinforcement learning in the game: without it, the creature would have no gradient to learn from and no reason to stop doing whatever worked the first time.
