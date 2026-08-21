# 160 - Anger

Anger is the **active drive chemical** for the creature's feeling of aggression, frustration, and hostility. It sits in slot 13 of the sixteen "drive" chemicals in the 148–161 block — the active signal the decision lobe and body tissues read to choose behaviour — and it is nominally paired with **Anger backup [143]** in the canonical Creatures 3 / Docking Station drive/reservoir architecture. Like its companion **Fear [158]**, however, the Anger pair is **orphaned at the reservoir end**: no stock reaction sweeps Anger into 143, no reaction releases 143 back into Anger, and no receptor reads the reservoir. Anger therefore runs as a **purely acute** drive, without the minutes-scale chronic buffer that shapes the physical-need drives. Whatever enters chemical 160 stays in chemical 160 until it decays, converts back into Fear, or is amplified by Adrenalin — there is no long tail.

Anger is the **structural twin of Fear**: the two drives mirror each other through a symmetric pair of mutual-conversion reactions, both participate in Adrenalin-powered autocatalysis (Anger's cascade gates on at Adolescent stage, identical to Fear's), and both feed parallel stress-chemical pipelines via the Circulatory tissue. The key differences are in sourcing and downstream footprint. Fear has four receptors and a dedicated toxin (Fear toxin [80]) plus a brain neuroemitter feeding it directly; Anger has **three receptors and no dedicated toxin**, and **no stock neuroemitter writes to it**. Anger is therefore a **fully-derived drive** in the shipping genome: no sensorimotor locus, no toxin, no brain neuron writes Anger directly — every unit of active Anger in a default Norn's bloodstream ultimately came from Fear (via reaction 40) and was then amplified by reaction 39's autocatalysis or injected via CAOS. This makes Anger the emotional "downstream tail" of Fear: a creature gets angry *because* it has been scared, and the chemistry enforces this progression.

The three receptors span three tissues (Drives, Sensorimotor, Circulatory) and produce three distinct effects: a **decision-lobe anger bar** (cognitive motivation to attack/retaliate), a **gait switch to LOC_GAIT5** (the "stomp" / aggressive-walk pattern), and a **youth-gated circulatory panic locus at very high Anger** that produces **Stress (Anger) [190]**. Notably, unlike Fear, Anger has **no somatic RLOCUS_CLOCKRATE receptor** — Anger does not accelerate the heart rate directly (Fear does this job for both drives since they are mutually-convertible and Adrenalin catalyses both). The autocatalysis reaction `Anger + Adrenalin → 2 Anger + Adrenalin` (reaction 39, switchOnAge Adolescent) doubles fresh Anger every ~2 seconds as long as Adrenalin is present, producing a slow-building rage cascade that matches Fear's panic cascade in timing and severity. Because Adrenalin is released by the same move-lobe neuroemitter that primes Fear, sustained Fear plus its Adrenalin tail is precisely what the Anger axis needs to ignite — reaction 40 bleeds the Fear into Anger, and reaction 39 then doubles it in place.

## Sources

Anger has no dedicated toxin, no stock brain neuroemitter, and no sensorimotor emitter. The entire stock-genome inflow consists of **one mutual-conversion reaction from Fear, one autocatalytic amplifier (Adolescent-gated), and direct CAOS injection**. This makes Anger the most *chemically derivative* of all the emotional drives — the only input path in the default game passes through Fear first.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Fear → Anger conversion | Gene 1 (reaction id 40) | Organ #2 "Reaction" | `1× Fear [158] → 1× Anger [160]` at half-life **95 ticks** ("Short", decay rate 0.99271) | ~0.7 %/tick of active Fear is consumed and converted to Anger. This is the **primary stock source of Anger**: every unit of Anger in a default Norn's blood originates from Fear that crossed over via this reaction. The half-life of 95 ticks (~3.2 s at 30 Hz) means a Fear spike takes roughly a minute of sustained elevation to produce comparable Anger, matching the gameplay feel of "startle → annoyance → hostility" as a stimulus persists. The reaction switches on from Baby, so even infant creatures can generate Anger if they are scared for long enough |
| 2 | Adrenalin-powered autocatalysis | Gene 6 (reaction id 39) | Organ #2 "Reaction" | `1× Anger [160] + 1× Adrenalin [117] → 2× Anger [160] + 1× Adrenalin [117]` at half-life **58 ticks** ("Short", decay rate 0.98808), **switchOnAge 2 (Adolescent)** | Fresh Anger doubles approximately every 58 ticks (~2 s at 30 Hz) as long as Adrenalin is available. Adrenalin is preserved through the reaction — it acts as a catalyst, not a reactant — so a single pulse of Adrenalin can sustain many rounds of Anger doubling. This is the **engine of the rage response**, structurally identical to Fear's panic cascade: once Anger crosses a threshold where Adrenalin is also present, the level escalates cascadingly until one of the downstream receptors fires or Adrenalin runs out. The Adolescent gate means infant and child Norns cannot yet undergo rage amplification — their Anger decays at its ordinary passive rate, producing muted "annoyed" rather than "furious" behaviour |
| 3 | No direct brain neuroemitter | — | — | The single stock neuroemitter (gene 1, lobe 4 "move" neuron 37) writes Adrenalin [117], Fear [158], and Crowded [157] — but **not** Anger. No stimulus-lobe, decision-lobe, or concept-lobe neuron emits directly into chemical 160 in the shipping genome. This is why Anger is a *downstream-only* drive: the brain cannot directly decide "be angry"; it can only decide "be scared", and the Fear it generates will bleed into Anger over time if the condition persists | — |
| 4 | No toxin pathway | — | — | Unlike Fear (which has Fear toxin [80] metabolised 14:1 by reaction 79), Pain (which has Pain toxin), Sleepiness (Sleep toxin), or temperature drives (Hot/Cold toxins), **Anger has no dedicated toxin chemical**. There is no `Anger toxin → Anger` reaction and no chemical reserved for this purpose in the 80s block. Scripts and agents that want to make a creature angry must either inject Fear (letting conversion do the work over tens of seconds) or write Anger directly with CAOS. This is the most significant structural absence in the Anger source pathway | — |
| 5 | No sensorimotor emitter | — | — | Unlike Crowded and Loneliness (fed by `LOC_CROWDEDNESS`), Tiredness (fed by `LOC_TIREDNESS`), or Hotness/Coldness (fed by the temperature locus), Anger has **no stock sensorimotor locus that emits directly into it**. The creature does not "sense anger" from any physical world-reading; Anger is generated only by the Fear exchange, by the autocatalysis, or by explicit CAOS injection | — |
| 6 | Direct CAOS injection | — | Any | `CHEM 160 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot. Because there is **no** active→backup sweep reaction for Anger (the Anger-backup slot 143 is orphaned), the entire injected mass remains in chemical 160 and decays through the Medium passive-decay path and through reaction 41 (`Anger → Fear`). A `CHEM 160 <n>` write is therefore unusually "honest": the level stays near *n* for several ticks before decaying, giving the receptors (drive bar, gait, panic) time to respond to the value as written. If Adrenalin is also present, reaction 39 will begin doubling the injected Anger until Adrenalin is exhausted |
| 7 | No initial concentration | — | — | Chemical 160 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly **0** active Anger. Chemical 143 is also born at 0, so babies start the game with no anger signal at all, and the first Anger they experience will be whatever slowly converts from the first Fear event they encounter | — |
| 8 | No cross-drive spillover beyond Fear | — | — | Unlike the protein-hunger pair (which receives spillover from Pain via gene 20) or the Hotness pair (which receives spillover from Fever toxin), there is no stock-genome reaction that routes Pain, hunger, coldness, hotness, tiredness, sleepiness, loneliness, crowdedness, boredom, or sex-drive chemicals into Anger. The only gateway onto the Anger axis at the chemical level is reaction 40 from Fear | — |
| 9 | Modded genomes | User-added | User-added | Common mods include: adding a stimulus-lobe "frustration" or "territory violation" neuron as a neuroemitter on 160 to give cognitive-appraisal-based anger; adding an Anger toxin chemical (e.g. repurposing an unused toxin slot) with a metabolism reaction parallel to Fear toxin's, so agent scripts can inject anger directly; wiring a Pain → Anger spillover reaction to model the classic "injury causes aggression" response; adding the missing `Anger → Anger backup` sweep reaction so the drive becomes reservoired and capable of sustaining chronic "grudge" states; adding a circulatory Glucose emitter tied to Anger so rage triggers a blood-sugar spike (the fight-half of fight-or-flight metabolism) | Gene-dependent |

## Usage

Anger has **three receptors** — one less than Fear, owing to the absent somatic RLOCUS_CLOCKRATE receptor — plus two consuming reactions (conversion to Fear and passive decay), and an emitter that produces Stress (Anger) when the circulatory panic locus trips. Every receptor reads the active chemical 160; none reads the orphan reservoir 143.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Drives-tissue "Anger" receptor | Gene 12 (receptor id 13) | Creature / Drives (tissue 5) | Locus 12 "Anger", threshold 0, gain 202, analogue, from Baby | **The anger drive bar the decision lobe reads to choose attack/confront/stand-ground behaviours.** Threshold 0 means proportional response at every level; gain 202 puts Anger slightly below Fear (gain 209) and Crowded (gain 209) in cognitive weighting — a subtle design choice reflecting that Anger is derivative of Fear and should not dominate it at equal levels. This is the *purely cognitive* side of the anger response — the signal that drives the decision lobe toward learned aggression-relief actions (punch, push, attack, stand ground) without any autonomic involvement |
| 2 | Sensorimotor LOC_GAIT5 receptor | Gene 103 (receptor id 187) | Creature / Sensorimotor (tissue 4) | Locus 13 LOC_GAIT5, threshold 124, gain 223, analogue, from Baby | **Gait switching.** Whenever Anger exceeds ~49 % of full scale (124/255), sensorimotor gait-5 (the "stomp" / "aggressive-stride" gait) is activated with gain 223. This is how anger changes *how* the creature moves, not just where: heavier, more deliberate, more emphatic locomotion that is visually recognisable as aggressive. The threshold 124 is very close to Fear's gait-4 threshold of 128 (and the gain 223 is identical), making the two gait switches nearly symmetric — a parallel design that reflects the structural twinship of the two drives |
| 3 | Circulatory panic receptor | Gene 57 (receptor id 155) | Creature / Circulatory (tissue 1) | Locus 13, threshold 214, gain 255, **DIGITAL**, from **Youth** | **The rage trigger.** Fires only when active Anger exceeds 214/255 (~84 % of full scale), writing a full-gain digital output into Circulatory Locus 13. The threshold 214 is slightly higher than Fear's circulatory-panic threshold of 204, meaning creatures panic from Fear slightly more readily than they rage from Anger — a balancing choice that keeps Fear as the dominant acute-emotion symptom. This locus is then read by emitter 34 (gene 14) that produces Stress (Anger) [190] at rate 14, gain 6. The chain is therefore: **extreme Anger → Circulatory Locus 13 digital trip → Stress (Anger) production**. The Youth age-gate means infant and child Norns can be *angry* (decision bar + gait) but cannot *rage* at the circulatory level — only sub-adult creatures and older develop the Stress (Anger) response |
| 4 | Anger → Fear conversion | Gene 3 (reaction id 41) | Organ #2 "Reaction" | `1× Anger [160] → 1× Fear [158]` at half-life **95 ticks** ("Short", decay rate 0.99271) | ~0.7 %/tick of active Anger is consumed and converted to Fear. This is the chemistry of the **angry → scared** reverse progression, the backlash phase of the mutual-conversion pair. Paired with reaction 40 at the same rate, it sets up a slow equilibrium between the two emotional drives — creatures oscillate between fear and anger depending on which net emitters keep firing. When an angry creature's stimulus is removed, the rapid passive decay plus this reaction drain Anger fast; a residual Fear bump appears as the Anger converts across |
| 5 | Passive decay | Gene 64 entry #160 (half-life table) | Bloodstream | genomeValue 65, half-life **621 ticks** ("Medium", decay rate 0.99888) | ~0.11 %/tick spontaneous decay. On its own, an Anger spike halves every 621 ticks (~21 s at 30 Hz), slightly faster than Fear's 686-tick decay. This is the second-slowest decay among the four "emotional" drives but still far faster than the reservoir-backed physical drives — the Medium-speed passive decay is what keeps Anger ephemeral rather than chronic, compensating for the absence of a reservoir sweep |
| 6 | No active→backup sweep | — | — | Like Fear, **Anger has no `Anger [160] → Anger backup [143]` sweep reaction**. Whatever is produced stays in 160 until decay or conversion consumes it. This is the structural reason Anger is a purely acute drive — see the Anger backup [143] documentation for the detailed treatment of the orphaned reservoir | — |
| 7 | No somatic RLOCUS_CLOCKRATE receptor | — | — | Unlike Fear (which has gene 17 / receptor 142 feeding cardiac acceleration), Anger has **no receptor writing into the Reaction organ's clock rate**. A purely angry creature does not have its heart race from the Anger signal — but because Anger almost always coexists with residual Fear (via the mutual conversion), and because Adrenalin is the shared catalyst, the somatic effects of rage in practice come through the Fear side of the pair. This is an economy of wiring: there is no need to duplicate cardiac acceleration on Anger when the two drives share an Adrenalin substrate | — |
| 8 | Stress (Anger) pipeline (indirect) | Genes 14 / 74 (emitter 34, receptor 149) | Creature / Circulatory | Circulatory locus 13 (digital from receptor 155) → emitter 34 → Stress (Anger) [190] → receptor 149 on circulatory locus 17 | The downstream physiological pipeline activated by rage-level Anger: once the Circulatory Locus 13 digital gate trips, emitter 34 (threshold 128 DIGITAL, Youth+) begins drip-producing Stress (Anger), which joins the other six Stress\* chemicals in the generalised stress-response block. Stress (Anger) has its own Medium-speed passive decay and is consumed by the shared stress-response machinery; it is the only way Anger can have persistent effects lasting beyond its own rapid decay window. The Youth age-gate on receptor 155 means this pipeline is inaccessible to babies and children |
| 9 | Modded consumers | User-added | User-added | Modders may add a brain-lobe receptor on 160 (e.g. feeding a "grudge memory" neuron in the stimulus lobe) to give the cognitive layer explicit access to anger levels; a somatic RLOCUS_CLOCKRATE receptor to give Anger its own cardiac acceleration; a Testosterone emitter on a locus driven by Anger to model aggression-driven hormone spikes; or a sensorimotor "fight" stance emitter so very angry Norns posture aggressively even while standing still | Gene-dependent |

## Role in Game Mechanics

### The downstream half of the fight-or-flight axis

Anger and Fear are tied together by the **symmetric pair of mutual-conversion reactions** 40 and 41, both at the same 95-tick half-life. They are not parallel drives; they are *entangled* drives. The chemistry enforces that any Anger in a Norn's system without external injection was previously Fear, and any Fear in a sustained-anger state is slowly reconverting from the Anger. This is the biochemical implementation of the classic psychological model where fear and anger are two expressions of a single arousal system:

| Reaction | Direction | Rate | Role |
|----------|-----------|------|------|
| 40 (gene 1) | `Fear → Anger` | Short, 95 ticks | Sustained Fear becomes sustained Anger (escalation) |
| 41 (gene 3) | `Anger → Fear` | Short, 95 ticks | Sustained Anger becomes sustained Fear (backlash) |

With equal rates in both directions, the two drives mutually convert at the same speed. This produces three distinctive behaviours:

- **Fresh fright**: A Fear-toxin spike produces a fear-dominated mixture that gradually bleeds 15–30 % of itself into Anger over the first minute. The creature feels "startled", then "annoyed", as the conversion proceeds.
- **Persistent threat**: If the Fear stimulus persists (repeated toxin pulses, or a stable threat in range), reaction 40 keeps draining Fear into Anger while new Fear is being added. Over ~2 minutes, Anger rises to parity with Fear. The creature feels "scared and angry" — the core fight-or-flight state.
- **Stimulus removal**: When the threat vanishes, Fear decays via both passive decay and reaction 40, while Anger decays via passive decay and reaction 41. Because both reactions run in parallel, the two drives reach equilibrium at roughly equal levels, then drain together to zero. A small backlash Fear bump appears as residual Anger converts back.

The downstream receptors for the two drives are structurally parallel — both feed a Circulatory panic locus (11 for Fear, 13 for Anger), both contribute to the Stress\* block (Stress (Fear) 191, Stress (Anger) 190), and both participate in the Adrenalin autocatalysis (reaction 38 for Fear, reaction 39 for Anger). This means a prolonged Fear-plus-Anger state produces a **full cocktail of stress effects** on the circulatory system, which is the biochemistry behind "sustained emotional arousal is bad for Norn health".

### The Adrenalin autocatalysis — the rage cascade

Reaction 39 (`Anger + Adrenalin → 2 Anger + Adrenalin`, gene 6, Adolescent+) is the structural twin of Fear's panic reaction 38. The parameters are identical: Short half-life (58 ticks, ~2 s), Adolescent gate, Adrenalin preserved as catalyst. Every feature discussed for Fear's cascade applies equally to Anger:

1. **Tick 0**: A unit of Anger enters the blood (from a Fear-conversion tick, or from CAOS). Adrenalin is also present (either from the move-lobe neuroemitter or from sustained Fear context).
2. **Tick ~60**: Anger doubles.
3. **Tick ~120**: Gait-5 begins firing (threshold 124 in the sensorimotor receptor).
4. **Tick ~240**: Drive bar shows strong anger, Gait-5 fully engaged.
5. **Tick ~480**: Circulatory panic receptor trips (threshold 214) at Youth+. Stress (Anger) pipeline activates.
6. **Tick ~500+**: Anger approaches chemical-bank cap at 255, then begins draining via passive decay and reaction 41 once Adrenalin is depleted.

The crucial difference from the Fear cascade is in **sourcing**: Fear's autocatalysis is often triggered directly by Fear toxin or by the move-lobe neuroemitter, both of which deliver the Fear substrate *and* the Adrenalin catalyst in one event. Anger's autocatalysis has no such shortcut. The Anger substrate must arrive via reaction 40 (Fear → Anger), which is itself a slow process (~0.7 %/tick of Fear). So the rage cascade always **lags** the panic cascade by ~20–60 seconds, and is often muted in magnitude because Fear is simultaneously amplifying itself and consuming its own mass. In practice:

- A one-off startle produces a sharp Fear spike, a modest Fear cascade (Adrenalin is present), then a small Anger bleed-over that usually does not cascade on its own because Adrenalin has begun to deplete.
- A sustained stimulus that keeps Fear topped up beyond the Adrenalin half-life produces both cascades, with Fear peaking first and Anger peaking roughly 30–60 seconds later. This is the biochemical signature of the classic "first startled, then furious" arc.
- Direct CAOS injection of Anger bypasses the lag entirely and triggers the rage cascade immediately if Adrenalin is already in the system.

The Adolescent age-gate on reaction 39 means **babies and children cannot rage** in this amplified sense. Their Anger drive exists — the Fear conversion works from Baby stage — but each emission produces only the small quantity converted, with no runaway doubling. Infant creatures can be cross or grumpy but cannot enter a full adolescent-rage cascade until they mature. This models real-world developmental facts: aggression amplification is a hormonal system that matures through adolescence.

### Why Anger has no dedicated toxin

Fear toxin [80] is the canonical "scare this creature" input for scripts and agents, metabolised 14:1 by reaction 79 to produce a smooth, delayed fear ramp. One might expect an equivalent "Anger toxin" for directly making creatures angry, but the stock genome provides none. This is a deliberate design choice:

- The engine already has a route from Fear to Anger via reaction 40. An agent that wants to make a Norn angry can inject Fear toxin and wait — the Anger will appear automatically over ~30–60 seconds, with a natural "first startled, then angry" progression.
- Anger cascades (reaction 39) depend on Adrenalin, which is produced by the Fear pipeline (via the move-lobe neuroemitter fired by creature movement decisions). Directly injecting Anger without Fear tends to produce Anger that does not cascade, because Adrenalin is not present. This would be less dramatic and less useful for gameplay.
- Adding a dedicated Anger toxin would break the structural invariant that Anger is a *derived* emotion. The shipping biochemistry wants every angry Norn to have been scared first, because that pattern produces the most coherent and recognisable emotional arcs.

Scripts that need to generate anger without a preceding Fear event therefore use `CHEM 160 <n>` directly. This is the canonical CAOS route for modded "annoying agent" scripts that want to bypass the startle phase.

### Decision-lobe consequences

The Drives receptor (gene 12) writes the anger-drive-bar value into the decision lobe's input layer every tick. The decision lobe is trained (during lifetime via reinforcement and via the initial genome bias) to associate high Anger readings with the **attack**, **push**, **slap**, **shout-at**, and **stand-ground** actions. Because Anger is a **reducible-by-action** drive — successfully attacking the source of anger, or having the angering stimulus removed, causes Fear to stop feeding Anger, and the existing Anger to drain via reaction 41 + passive decay — the decision lobe's reinforcement learning will identify these actions as reward-generating in the presence of anger, cementing the aggression response during normal life.

The Anger drive bar has gain 202 versus Fear's 209. This small difference ensures that at equal active-chemical levels, Fear exerts slightly more pull on decision-lobe output than Anger does. In the common case where Fear and Anger are roughly equal (because the mutual conversion has equilibrated), the decision lobe will lean marginally toward flee behaviours over fight behaviours — a conservative bias that the lifetime reinforcement learning can override as the creature learns specific stimulus-response patterns.

Unlike Fear, Anger does **not** directly accelerate the heart — there is no somatic RLOCUS_CLOCKRATE receptor on 160. However, because Anger and Fear are mutually-convertible, a rage state almost always co-occurs with a fear tail that *is* driving cardiac acceleration. The physiological "heart races when angry" effect therefore appears as a side-effect of the Fear tail, not as a direct consequence of Anger itself.

### Gait 5 — the stomp

The LOC_GAIT5 sensorimotor receptor (gene 103) writes into the sensorimotor layer's gait-5 channel whenever Anger exceeds 49 % of full scale. Gait 5 in the Creatures 3 locomotion system is the "aggressive stride" — heavier footfalls, wider stance, more deliberate pacing than gait 0 (walk) or gait 4 (panic run). The combination of Anger-driven gait 5 and Fear-driven gait 4 means a creature in a mixed fear-anger state may rapidly switch between the two gaits as the drive ratio fluctuates, producing the characteristic visual of an agitated creature alternating between retreat and advance. This is especially visible in creatures that have just suffered repeated pokes or slaps from an agent: they back off (gait 4 from residual Fear), then advance (gait 5 as Anger peaks), then back off again.

### Effects of directly filling Anger

A `CHEM 160 <n>` injection produces a distinctive pattern — unlike the reservoired drives, the entire injected mass stays visible rather than being swept into a backup:

1. **Tick 0**: Active Anger rises to *n*. The decision-lobe drive bar reports a sudden jump.
   - If *n* > 124, gait-5 switches on immediately.
   - If *n* > 214 and the creature is at Youth or older, the circulatory rage receptor trips immediately.
2. **Ticks 1 → dozens**: No sweep reaction fires. Anger persists at approximately *n*, slowly drained by passive decay (~0.11 %/tick), conversion to Fear (~0.7 %/tick of the current value), and — if Adrenalin is present — *amplified* by reaction 39.
3. **If Adrenalin present (Adolescent+):** Anger doubles every ~58 ticks. A moderate injection (*n* = 50) can cascade into a full rage within 10–20 seconds.
4. **If no Adrenalin:** Anger simply decays. Half-life ~621 ticks, so the level halves every ~21 s. A moderate injection fades to negligible within ~2 minutes. A small Fear bump also appears as reaction 41 converts some of the injected mass back into Fear.

A `CHEM 160 -n` write (negative) immediately removes active Anger. Because there is no reservoir to leak mass back, the effect is permanent until some new Anger source fires — making it, like Fear, one of the few drives where a "reset to zero" CAOS write actually holds.

Because Anger has no stock neuroemitter and no toxin, **`CHEM 160 <n>` is the canonical scripted-anger technique**. There is no equivalent of Fear toxin to produce a gradual ramp. Agents that want to produce a naturalistic "getting angrier" curve must either inject Fear (and let reaction 40 convert it) or emit a sequence of small `CHEM 160` writes over time.

### CAV save/load and imported creatures

The `MakeYourselfTired` shutdown helper does **not** touch chemical 160 — it writes only Tiredness (154) and Sleepiness (155). A creature exported to a CAV save therefore retains whatever Anger value it had at save time. Since Anger decays on a Medium-speed passive-decay track with no reservoir feeding it, an angry-at-save-time creature will arrive in its new world with its Anger value intact but already on its way down: the first minute of real time after import will halve it regardless of the destination environment.

The Adrenalin level from the save is also preserved, so a creature saved mid-rage will arrive still raging if it also arrives with active Adrenalin — a pathological case that modders occasionally hit when engineering "always hostile" creatures by pre-loading both chemicals in the initial-concentration table.

### Contrast with Fear and the other drives

| Drive | Primary source | Reservoir | Receptors | Amplification | Physiological effects |
|-------|----------------|-----------|-----------|---------------|----------------------|
| Fear (158) | Toxin + Anger exchange + neuroemitter | **None (orphan)** | 4 (drive, clock, gait, panic) | **Yes** (Fear+Adrenalin) | Heart rate, gait 4, Stress (Fear) |
| **Anger (160)** | **Fear exchange only** | **None (orphan)** | **3 (drive, gait 5, panic)** | **Yes** (Anger+Adrenalin) | **Gait 5, Stress (Anger)** — *no direct cardiac effect* |
| Crowded (157) | Sensorimotor (density) | Yes (140) | 2 (drive, panic@90%) | No | Stress (Crowded) at extremes |
| Loneliness (156) | Sensorimotor (inverse density) | Yes (139) | 1 (drive) | No | None |
| Boredom (159) | `LOC_CONST` drip | Yes (142) | 1 (drive) | No | None |

Anger is **the most structurally derivative drive** in the genome — alone among the sixteen drive chemicals, it has no direct inflow of any kind. It is fed only by conversion from Fear and by its own Adrenalin-powered autocatalysis (which itself cannot start without some seed Anger to amplify). This makes Anger uniquely vulnerable to Fear manipulation: disable the Fear pipeline and a stock Norn will never become angry.

Anger is also the only drive whose downstream footprint is strictly smaller than its companion drive's. Fear has four receptors (drive / cardiac / gait / panic), Anger has three (drive / gait / panic) — the cardiac receptor is absent by design, delegated to the Fear side of the pair.

### Why the reservoir is intentionally missing

Like Fear, Anger has no active→backup sweep reaction and no backup→active drip reaction. The Anger backup slot 143 sits empty in the default genome. The design rationale (see 141 - Fear backup.md and 143 - Anger backup.md for the detailed treatment) is that reservoired drives have **minutes-scale persistence** — a Norn that was hungry an hour ago still has some hunger-backup in its bloodstream trickling back to the active drive. This is desirable for physical needs but undesirable for emotional signals.

If Anger had a reservoir, every brief annoyance would leave a hours-long residue that accumulated over a Norn's lifetime, producing chronically-angry creatures even after a few mild irritations. The shipping design opts for **acute-only** emotional drives: an Anger spike rises, peaks, and decays within a minute or two, leaving no chronic trace. The Stress (Anger) pathway exists specifically to provide the *intended* form of persistence — a youth-gated, threshold-triggered stress response that kicks in only when Anger has actually been extreme, rather than accumulating from every minor cross mood.

This design choice makes Anger feel qualitatively different from Loneliness, Crowded, or Boredom. Those drives are *tracking* drives — they gradually adjust to represent the creature's chronic environmental state. Anger is an *event* drive — it fires in response to specific triggers (usually via Fear) and then clears. The biochemistry reflects the gameplay: anger is meant to be a sharp, transient signal, not a lingering mood.

### Implications for modders

Common modifications built on Anger:

1. **Wire up the missing `Anger → Anger backup` sweep reaction** (half-life ~6 ticks) to give Anger a reservoir. Creates chronically-angry Norns whose anger lingers for minutes after an event. Pair with a `Anger backup → Anger` drip reaction (half-life ~311 ticks) for the full reservoired-drive pattern — useful for "grudge-holding" breeds.
2. **Add a stimulus-lobe neuroemitter to Anger** from a "frustration" or "territory violation" neuron so that the cognitive appraisal system contributes directly, rather than relying entirely on Fear-conversion. Useful for creatures that are supposed to recognise specific sources of irritation.
3. **Add a somatic RLOCUS_CLOCKRATE receptor on 160** to give Anger its own cardiac acceleration path, matching Fear's. Produces creatures whose hearts race from pure rage, not just from the Fear tail.
4. **Add an Anger toxin chemical** (repurposing an unused toxin slot) with a metabolism reaction parallel to Fear toxin's (~14:1 at Short half-life), so agent scripts can inject anger directly without going through Fear first. Required for scenarios like "this food makes creatures angry" that currently have no clean implementation.
5. **Add a Pain → Anger spillover reaction** to tie injury to aggression. Models the "hurt creatures fight back" dynamic without requiring separate event scripts.
6. **Block reaction 41 (`Anger → Fear`)** — e.g. gate it with a catalyst — to produce creatures whose anger cannot bleed back into fear. Creates "steadfast" breeds whose rage persists until discharged through action rather than softening into worry.
7. **Lower the Circulatory Locus 13 receptor threshold** below 214 to make rage trigger at moderate anger levels. Produces "hot-tempered" breeds that enter the Stress (Anger) pipeline easily.
8. **Remove the Youth gate on receptor 155** so infants can also rage. Produces high-aggression baby Norns with full adult anger physiology — controversial but occasionally used for "wild" breed designs.
9. **Lower reaction 39's Adolescent gate** (e.g. to Child) so younger Norns can also experience the rage cascade. Or conversely, raise it so only mature adults exhibit the full cascade, creating a "temperate young" breed.
10. **Wire a neuroemitter from the concept lobe into Anger** to make aggression context-sensitive: a specific learned concept ("this type of agent has hurt me before") fires the neuron and writes Anger. Requires complex training but produces the most realistic creature-specific grudge profiles.

### Practical consequences for gameplay

- **Anger is the tail of Fear.** In the stock biochemistry, a creature only becomes angry after it has been scared. The pattern "startled → annoyed → furious" is a chemical inevitability of reactions 40 + 39 given a sustained Fear stimulus.
- **Anger rises slower than Fear.** Because Anger has no direct source beyond Fear-conversion, the Anger curve lags the Fear curve by ~20–60 seconds. A one-off startle may never produce visible anger at all if the Fear spike decays faster than reaction 40 can convert it.
- **Anger cascades at Adolescent+.** Teen and adult Norns exposed to sustained Fear will enter a rage cascade (reaction 39) that can saturate the chemical cap. Babies and children cannot cascade — their Anger rises only as fast as reaction 40 converts the Fear it feeds on.
- **Anger makes the creature walk differently.** At moderate levels, the gait switches to LOC_GAIT5, the "stomp" pattern — heavier and more deliberate than either normal walk or panic-run. This is the most visible gameplay symptom of anger.
- **Anger does not directly accelerate the heart.** Unlike Fear, Anger has no cardiac receptor. Rage's apparent heart-racing effect in practice comes from the residual Fear tail that coexists with Anger via the mutual conversion.
- **Severe Anger triggers rage + Stress (Anger) at Youth+.** Only at Youth or older does the circulatory rage gate open, producing the Stress (Anger) chemical. Babies and children can be cross but cannot be *stressed* by anger.
- **`CHEM 160 <n>` is honest.** Unlike reservoired drives, writing to Anger directly has its full intended effect because there is no sweep reaction banking it away. Scripts that want to produce a specific anger level can write to 160 and get a reliably-readable value on all three receptors.
- **There is no toxin for anger.** The canonical way to produce anger from a script is to inject Fear toxin (`CHEM 80 <n>`) and let reaction 40 generate Anger over tens of seconds, or to write `CHEM 160 <n>` directly. There is no gradual-ramp toxin equivalent to Fear toxin.
- **Anger and Fear are interchangeable over time.** Sustained Anger gradually becomes Fear and vice versa. A Norn stuck in a rage state with no outlet for long enough will eventually transition back into fear as reaction 41 converts Anger to Fear — a realistic emotional de-escalation baked into the chemistry.
- **Newly-hatched Norns start at zero Anger.** No initial concentration means babies begin the game with a completely calm nervous system; they cannot be born hostile in the stock genome.

### Summary

```
 Stock-genome wiring of Anger [160]
 ───────────────────────────────────
 Inputs:
   reaction 40 (gene 1)  1× Fear [158] → 1× Anger [160]
     half-life 95 ticks (Short, ~3.2 s)
     — primary stock source (every unit of Anger came from Fear)

   reaction 39 (gene 6, Adolescent+) Anger + Adrenalin → 2 Anger + Adrenalin
     half-life 58 ticks (Short, ~2 s), autocatalytic amplifier
     — rage cascade engine (requires Adrenalin catalyst)

   CHEM 160 <n>  (CAOS / scripts / mods)
   CAV import state (not touched by MakeYourselfTired)

   (no toxin, no sensorimotor emitter, no neuroemitter, no initial concentration)

         Anger [160]                  half-life 621 ticks (Medium, ~21 s)
         initial concentration: 0     decays ≈0.11 %/tick on its own
                 │
                 ├──► Drives receptor #13 (gene 12):
                 │      Drives tissue (5) / locus 12 / threshold 0 / gain 202, from Baby
                 │      → decision-lobe "anger" drive bar
                 │
                 ├──► Sensorimotor receptor #187 (gene 103):
                 │      Creature / Sensorimotor (4) / LOC_GAIT5 / threshold 124 / gain 223
                 │      analogue, from Baby
                 │      → gait switch to stomp/aggressive-stride pattern
                 │
                 ├──► Circulatory receptor #155 (gene 57):
                 │      Creature / Circulatory (1) / Locus 13 / threshold 214 DIGITAL
                 │      from Youth
                 │      → rage locus → emitter #34 (gene 14) → Stress (Anger) [190]
                 │           → circulatory locus 17 → generalised stress response
                 │
                 ├──► reaction 41 (gene 3):  1× Anger → 1× Fear
                 │      half-life 95 ticks (Short)
                 │      — de-escalation: sustained Anger → Fear
                 │
                 └──► passive decay  half-life 621 ticks (Medium)
                      — the only drain-to-zero path

 No active → backup sweep reaction exists.
 Anger backup [143] is an orphan reservoir slot: no stock reaction writes to it,
 no stock receptor reads it. See 143 - Anger backup.md for details.

 Companion axis: Fear [158] is linked by the mutual-conversion pair
                 (reactions 40 / 41) and shares the Adrenalin-autocatalysis
                 pattern (reaction 38 mirrors reaction 39 for Fear).
```

Anger is the **acute, autocatalytic, derived emotional drive** of the Creatures 3 biochemistry — the downstream half of the fight-or-flight emotional axis. Its chemistry — a Fear-fed primary source, a mutual exchange with Fear, a youth-gated rage trigger, an Adolescent-gated autocatalytic amplifier, and a purely-acute design that skips the reservoir block entirely — produces the "second wave" of the emotional arousal response. A creature that is angry was first scared: the Fear conversion is the mandatory gateway onto the Anger axis in the stock genome. Once active, Anger drives the decision lobe toward aggression, switches the gait to the stomp pattern, and if sustained to extremes in a Youth-stage-or-older creature, trips the circulatory rage locus that produces Stress (Anger) as the physiological expression of rage. Together with its orphan reservoir Anger backup [143] (intentionally unwired to keep the drive ephemeral) and its paired Fear drive (via the symmetric conversion reactions), it completes the fight-or-flight emotional axis that the decision lobe, gait controller, and stress-response block all read simultaneously whenever a Norn encounters a sustained threat.
