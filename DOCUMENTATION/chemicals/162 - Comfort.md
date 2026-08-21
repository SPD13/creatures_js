# 162 - Comfort

Comfort is the **pregnancy drive** of the Creatures 3 / Docking Station genome — the sixteenth and final drive chemical in the 148–162 "drives" block (locus 14 in the Drives tissue, just above Sex drive at locus 13). It sits at the very end of the drive bank and is the **only drive in the stock genome whose sole endogenous inflow is pregnancy itself**. In every other drive (Pain, the three hungers, Coldness / Hotness, Tiredness / Sleepiness, Loneliness / Crowded, Fear, Boredom, Anger, Sex drive), the inflow is either a constant metabolic emitter, a sensorimotor reading of the environment, an immune or toxin cascade, or a reproductive-hormone rhythm. Comfort is unique: its single emitter in the shipping genome reads the **LOC_PREGNANT** reproductive locus and writes into the chemical. A pregnant female fills her Comfort drive to saturation within about a second of conception; a creature who has never been pregnant stays at exactly zero for life.

Comfort is paired on paper with **Comfort backup [145]**, the seventh of the sixteen drive-reservoir chemicals in the 132–147 block. This backup slot is **fully orphaned in the stock genome** — no reaction sweeps Comfort into it, no reaction drips it back into Comfort, and nothing else reads or writes it. The genome reserves the reservoir slot for symmetry with the other drive pairs but never plumbs it. This orphan reservoir, combined with Comfort's "Very long" passive decay (half-life ≈ 90 billion ticks, i.e. effectively permanent), produces the most unusual behavioural signature of any drive: **Comfort is a one-way latching chemical.** Once it rises, it never falls. After a female's first successful conception the Comfort bar climbs to 255 over a few ticks and then stays at 255 for the rest of her life — through birth, through subsequent pregnancies, through illness, through old age, through export and re-import. No stock-genome mechanism can reduce it.

The sole **consumer** is the Drives-tissue decision-lobe drive bar: a single analogue receptor (gene 50, receptor id 15) at threshold 0 and the **maximum possible gain of 255**, active from Baby. Because the drive bar reads the chemical at full gain, a pregnant (and henceforth "ever-pregnant") female's Comfort bar saturates the decision-lobe neuron for drive 14 from first conception onward. No other receptor in the stock genome reads Comfort: no sensorimotor involuntary-action trigger, no gait receptor, no circulatory alarm, no reproductive feedback. Comfort's only effect on the creature is via the decision-lobe drive bar it feeds — a purely cognitive signal biasing behaviour-selection.

The practical read of this wiring is that Comfort encodes **"this female is (or has been) pregnant"** as a permanent, maximum-intensity input to the decision lobe's drive 14 neuron. Whichever learned behaviours the creature has attached to drive 14 via reinforcement become strongly weighted from pregnancy onward. In the absence of any other inflow and with no decay path, Comfort functions less like a moment-to-moment drive and more like a **maternal-state flag baked into the drives tissue** — a chemistry-level record that a female has entered motherhood.

## Sources

Comfort has a single endogenous inflow — a pregnancy-gated reproductive emitter — plus direct CAOS injection. There are no reactions, no sensorimotor emitters, no brain neuroemitters, and no toxins producing it.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | LOC_PREGNANT reproductive emitter (primary — only stock source) | Gene 37 (emitter id 18) | Creature / Reproductive (tissue 2) | Locus 1 **LOC_PREGNANT**, threshold 0, **rate 10**, gain **255**, flags 2 = **DIGITAL (fixed gain)**, **switchOnAge 3 (Youth)** | Every 10 ticks the emitter samples the LOC_PREGNANT locus. The reproductive faculty's per-tick update writes `myPregnancyLocus = (IsPregnant()) ? 1.0 : 0` each tick. `IsPregnant()` returns true iff the creature's genome-store slot 1 contains a zygote. Because the emitter is DIGITAL with threshold 0, it fires whenever `myPregnancyLocus > 0`, writing the full gain 255 into chemical 162 every 10 ticks. Coupled with Comfort's "Very long" passive decay (no measurable loss), a single pregnancy tick saturates the chemical essentially instantly. The Youth gate means the axis is inert in Babies and Children, but also irrelevant there because pre-Youth females cannot carry a zygote (the LOC_RECEPTIVE fertilisation gate on chemical 161 is also Youth-gated). Once the female gives birth, the zygote leaves genome-store slot 1, `myPregnancyLocus` returns to 0, and the emitter stops firing — but by then the Comfort chemical is saturated and will not decay |
| 2 | No brain neuroemitter | — | — | The single stock neuroemitter (gene 1, lobe 4 "move" neuron 37) writes Adrenalin [117], Fear [158], and Crowded [157] — **not** Comfort. No stimulus-lobe, decision-lobe, or concept-lobe neuron emits into chemical 162. The brain has no cognitive way to decide "be comforted"; comfort arises only from the physiological state of pregnancy | — |
| 3 | No sensorimotor emitter | — | — | Unlike Crowded / Loneliness (fed by `LOC_CROWDEDNESS`), Tiredness (fed by `LOC_TIREDNESS`), or Hotness / Coldness (fed by the temperature locus), Comfort has **no sensorimotor locus writing into it**. The creature does not "sense" comfort from any physical world-reading | — |
| 4 | No reactions | — | — | Chemical 162 does **not appear as a product of any reaction in the stock genome**. There is no hormonal cascade, no immune side-effect, no metabolic by-product, no chain from any other chemical that produces Comfort | — |
| 5 | No toxin pathway | — | — | Unlike Fear (Fear toxin 80), Sleepiness (Sleep toxin 71), or the temperature drives (Hot / Cold toxins), Comfort has **no dedicated toxin chemical** in the 80s block. Scripts and agents that want to comfort a creature must either get her pregnant or write chemical 162 directly | — |
| 6 | Direct CAOS injection | — | Any | `CHEM 162 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot and, uniquely among the drive chemicals, **permanent**. Because there is no decay, no sweep-to-reservoir, no active→backup plumbing, no catalytic destruction, and no consuming reaction, any Comfort injected by a script remains at that level indefinitely. Injecting `CHEM 162 128` into a never-pregnant male Norn at birth will leave him with Comfort = 128 for the rest of his life |
| 7 | No initial concentration | — | — | Chemical 162 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly **0** active Comfort. Chemical 145 is also born at 0. Pre-Youth creatures cannot become pregnant, so the axis remains at zero throughout Baby and Child stages regardless of environment | — |
| 8 | No cross-drive spillover | — | — | No stock-genome reaction routes Pain, hunger, fear, anger, coldness, hotness, tiredness, sleepiness, loneliness, crowdedness, boredom, or any other drive into Comfort. Nor does any reproductive-hormone chemistry (oestrogen, testosterone, arousal potential, libido lowerer, progesterone) produce Comfort. The chemical is isolated from every other chemical in the genome at the reaction level — its only connection to the rest of the chemistry is via the pregnancy locus | — |
| 9 | Modded genomes | User-added | User-added | Common modifications include: adding a constant "baseline contentment" emitter so non-pregnant creatures also produce some Comfort; wiring Adrenalin, Pain, or Fear into reactions that consume Comfort so stress reduces contentment; plumbing the orphaned Comfort backup [145] into a proper active→backup sweep + drip so the chemical actually has finite memory instead of latching permanently; adding a sensorimotor "safety" emitter on 162 so being in a familiar / low-threat room raises Comfort; adding a `LOC_GENDER`-gated emitter so males also have a "comforted" state (perhaps triggered by successful feeding of offspring); adding a decay reaction so Comfort fades after birth rather than persisting for life; adding a brain concept-lobe neuroemitter so learned positive experiences (petting, safe play) raise Comfort directly; giving Comfort a non-zero initial concentration so creatures hatch with some baseline contentment | Gene-dependent |

## Usage

Comfort has a **single receptor** — the decision-lobe drive bar — and **no consumers** (no reactions, no catalytic destruction, no sweep, no annihilation, and an effectively-infinite passive decay). It is the only drive chemical with this topology.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Drives-tissue "Comfort" receptor | Gene 50 (receptor id 15) | Creature / Drives (tissue 5) | Locus 14 "Comfort", threshold 0, nominal 0, **gain 255 (maximum)**, analogue, **from Baby** | **The comfort drive bar the decision lobe reads to choose drive-14 actions.** Threshold 0 means every level of Comfort produces proportional decision-lobe input; gain 255 is the **maximum possible gain** — higher than Sex drive's 223, Fear's 209, Pain's 207, Anger's 202 — putting Comfort at the top of the drive-weighting hierarchy *when it is non-zero*. Any amount of Comfort therefore dominates the decision-lobe drive-bar vote. Despite the Baby stage-gate on the receptor, the bar reads 0 in practice throughout Baby and Child because the emitter (gene 37) is Youth-gated and pregnancy is impossible before Youth. Once pregnancy occurs at Youth+, the bar saturates to 255 within a few ticks and stays there |
| 2 | No involuntary-action receptor | — | — | Unlike Coldness (LOC_INVOLUNTARY4 shiver reflex), Hotness (LOC_INVOLUNTARY5 sweat reflex), Pain (LOC_INVOLUNTARY pain reflex), or Sex drive (LOC_GAIT13 courtship gait), **Comfort has no sensorimotor receptor**. It does not trigger reflex animations, gait changes, or any motor output. The chemical acts purely on cognitive decision-making | — |
| 3 | No reproductive or physiological receptor | — | — | Unlike Sex drive (LOC_RECEPTIVE fertilisation gate), Progesterone (LOC_PREGNANT self-reinforcement), or the hunger chemicals (LOC_* critical-alarm circulatory receptors), Comfort has no receptor outside the Drives tissue. It does not feedback into the reproductive organ, the circulatory organ, or any other physiological system | — |
| 4 | No reactions consume Comfort | — | — | Chemical 162 does **not appear as a reactant in any reaction in the stock genome**. There is no catalytic antagonist (unlike Sex drive's Libido lowerer [40] via reaction 33), no passive-destruction reaction (unlike Sex drive's reaction 35), no annihilation with an opposite chemical (unlike the Coldness ↔ Hotness cancellation via reaction 23), no hunger-satisfaction pathway — nothing removes Comfort via chemistry | — |
| 5 | No active → backup sweep | — | — | The doubled sweep pattern used by every other working drive pair (two identical `active → backup` reactions at "Very short" half-life that drain the active drive into its reservoir within a few seconds) is **entirely absent for the Comfort / Comfort backup pair**. Chemical 162 is never transferred to chemical 145 by any mechanism | — |
| 6 | No backup → drive drip | — | — | Matching the absence of the sweep, there is no `Comfort backup → Comfort` drip reaction. Chemical 145 is a **completely orphaned genome slot** — allocated in the half-life table but unreachable by any chemical pathway | — |
| 7 | Passive decay | Half-life table entry for chemical 162 | Bloodstream | genomeValue **255**, half-life **≈ 90,682,980,616 ticks** ("Very long"), decay rate 1.0 | **No measurable decay.** At 30 ticks/second this is ~96 years of real-time play. The chemical is effectively permanent. Combined with the absence of any reaction consumer, this is the mechanism that makes Comfort a one-way latching chemical: once it rises, nothing reduces it |
| 8 | Modded consumers | User-added | User-added | Modders may add a reaction consuming Comfort (e.g. `Comfort + Adrenalin → Adrenalin` catalytic destruction so stress cancels contentment); wire chemical 145 into the active / backup sweep-and-drip pattern; add a sensorimotor "calm" receptor that biases gait selection toward slow walks when Comfort is high; add a somatic heart-rate slow-down receptor on 162 to match the physiological correlates of contentment; add a decision-lobe feedback where learned "safe room" concepts reinforce comfort; add a post-birth decay reaction so comfort fades over a few minutes rather than persisting for life | Gene-dependent |

## Role in Game Mechanics

### The LOC_PREGNANT → Comfort emitter

The single stock inflow for chemical 162 is the reproductive-tissue emitter configured by gene 37 (emitter id 18). The emitter wiring is:

- **Source locus**: `LOC_PREGNANT` (reproductive tissue 2, locus 1)
- **Target chemical**: Comfort [162]
- **Threshold**: 0 — any non-zero pregnancy value triggers the emitter
- **Rate**: 10 — the emitter samples every 10 ticks
- **Gain**: 255 — writes the maximum chemical amount per firing
- **Flags**: 2 (DIGITAL / fixed gain) — the write is all-or-nothing at full gain regardless of the locus value
- **Stage gate**: Youth (switchOnAge 3, switchOnStage "Youth")

`LOC_PREGNANT` is kept up to date by the reproductive faculty's per-tick update in the original engine:

```text
// Note in locus if pregnant
myPregnancyLocus = (IsPregnant()) ? 1.0 : 0
```

and `IsPregnant()` is defined as a genome-store slot check:

```text
// Pregnant if our genome store slot 1 has a zygote in it
IsPregnant():
    return slot 1 of the creature's GenomeStore is not empty
```

The moment `AcceptSperm` succeeds and writes the new zygote moniker into genome-store slot 1, `IsPregnant()` flips to `true`, `myPregnancyLocus` becomes 1.0, and the next sample by emitter 18 writes 255 into Comfort. Because the chemical has no decay and no consumer, the first write alone saturates the drive bar and holds it saturated. Subsequent emitter firings every 10 ticks write 255 again but cannot raise the chemical above its 255 ceiling.

When the pregnancy ends (birth transfers the zygote out of slot 1, or an early miscarriage clears the slot), `IsPregnant()` returns false, `myPregnancyLocus` goes to 0, and the emitter stops firing — but the Comfort level is already at 255 and has no way to fall.

### Why Comfort is a one-way latching drive

Examining the full receptor / reaction graph for chemical 162 yields a striking result:

**Inflows**: 1 (the pregnancy emitter) + CAOS injection.
**Outflows**: 0.

No reaction destroys Comfort. No reaction converts it to anything else. No reaction converts anything into Comfort backup (so even if the backup could drain, it wouldn't help). Comfort's own passive decay has a half-life of ~96 years of continuous gameplay. The chemical therefore has **no return path from non-zero to zero** other than save-file editing or a CAOS script that writes `CHEM 162 -255` directly.

This produces a characteristic behavioural curve:

1. **Baby and Child**: Comfort is 0 (no pregnancy possible, no emitter firing). Drive-14 neuron on the decision lobe is inactive.
2. **Youth pre-first-conception**: Still 0. The Youth-gate unlocks the emitter but the locus is still 0 because no zygote is present.
3. **First conception**: `LOC_PREGNANT` flips to 1.0. Within the next 10 ticks (~0.33 s at 30 Hz), emitter 18 fires and writes 255. Drive-14 neuron saturates to 100 % excitation on the decision lobe.
4. **Rest of life**: Comfort stays at 255. Every pregnancy re-triggers the emitter but cannot raise the chemical above its ceiling. Birth releases the pregnancy but nothing reduces Comfort.

From the first successful conception onward, the female's decision-lobe drive-14 neuron is **pegged at full excitation for life** and contributes maximum influence to every decision-lobe action-selection from that moment onward.

### The gain-255 dominance on the decision lobe

Of all sixteen drive receptors in the Drives tissue, Comfort's receptor has the **maximum gain of 255**. This is tied with Hunger for carbohydrate (150), Hunger for fat (151), Tiredness (154), Sleepiness (155), Loneliness (156), Crowded (157), Boredom (159), drive 15 (Up), and drive 16 (Down) — but notably higher than the gains on Pain (207), Hunger for protein (209), Coldness (204), Hotness (204), Fear (209), Anger (202), and Sex drive (223).

In the Creatures 3 decision lobe, drive-bar neurons provide excitation into learned concept associations; higher drive excitation produces more weight on that drive's action preferences. With gain 255 at threshold 0, **any non-zero Comfort level produces full-strength excitation** on the drive-14 neuron.

Because Comfort latches at 255 after first conception, ever-pregnant females carry a full-strength drive-14 vote in every action-selection for the rest of their life. The specific actions this biases toward are determined by reinforcement learning rather than genome wiring — whatever actions the creature has associated with drive 14 become strongly preferred. In a typical Norn raised on the stock genome, the drive-14 vote has accumulated few specific associations before the first pregnancy (since Comfort is 0 throughout Baby / Child / pre-first-pregnancy Youth), so the strongest votes tend to come from actions learned *during* the first pregnancy — usually eating, resting, and staying in a quiet area. This produces the "broody" behavioural shift many players observe in pregnant Norns: they rapidly associate the current quiet-resting-eating context with the newly-saturated drive-14 neuron, then keep preferring it indefinitely.

### The orphaned Comfort backup [145]

Chemical 145 (Comfort backup) is allocated in the genome's half-life table with genomeValue 255 (half-life ~90 billion ticks, "Very long") but has **zero plumbing in the stock genome**:

- No reaction produces it. The active → backup sweep pattern (two identical `Comfort → Comfort backup` reactions at half-life 6 ticks, "Very short") that exists for every other drive pair is **entirely absent**.
- No reaction consumes it. The backup → drive drip (typically `Comfort backup → Comfort` at "Medium" half-life) does not exist either.
- No receptor reads it.
- No emitter writes it.

The slot is reserved in the genome for symmetry with the other drive pairs (132 Pain backup, 133 Hunger-for-protein backup, … 144 Sex drive backup, 145 Comfort backup, 146 / 147 Up / Down backups) but never wired. This leaves chemical 145 as one of a small handful of **unused genome slots in the shipping genome** — present in the data model, invisible in practice, and mostly useful to modders as a free slot to build a proper reservoir mechanism for Comfort.

### Comparison with other drives

| Drive | Primary source | Reservoir | Receptors | Life-stage gating | Decay |
|-------|----------------|-----------|-----------|-------------------|-------|
| Pain (148) | Pain toxin, injury | Yes (132) permanent | 2 (drive, involuntary) | Baby+ | Medium |
| Hunger for protein (149) | Amino-acid deficit | Yes (133) permanent | 2 (drive, panic) | Baby+ | Very long |
| Coldness (152) | Immune / metabolic / Pistle | Yes (135) permanent | 2 (drive, involuntary shiver) | Baby+ | Medium |
| Tiredness (154) | Sensorimotor LOC_TIREDNESS | Yes (137) permanent | 1 (drive) | Baby+ | Very long |
| Loneliness (156) | Sensorimotor inverse-density | Yes (139) permanent | 1 (drive) | Baby+ | Very long |
| Boredom (159) | LOC_CONST drip | Yes (142) permanent | 1 (drive) | Baby+ | Very long |
| Fear (158) | Toxin + neuroemitter + Anger exchange | None (orphan backup) | 4 (drive, clock, gait, panic) | Baby+ | Medium |
| Anger (160) | Fear exchange only | None (orphan backup) | 3 (drive, gait 5, panic) | Baby+ | Medium |
| Sex drive (161) | Arousal Potential × Pheromone | Yes (144, short memory) | 3 (drive, LOC_RECEPTIVE, gait 13) | Youth+ chemistry / Youth+ fertility | Short |
| **Comfort (162)** | **LOC_PREGNANT emitter only** | **Orphan (145 is wired to nothing)** | **1 (drive bar, gain 255 max)** | **Youth+ emitter** | **Very long (effectively infinite)** |

Comfort is the **simplest and most specialised** drive in the genome: one inflow (pregnancy), one consumer (the decision-lobe drive bar), no reservoir plumbing, no decay, no toxin, no reflex, no gait. It is also the only drive whose rise is irreversible within the stock chemistry.

### Effects of directly filling Comfort

A `CHEM 162 <n>` injection produces a **permanent step-increase** in the drive bar:

1. **Tick 0**: Active Comfort rises to *n*. The decision-lobe drive-14 neuron is excited at *n*/255 × gain 255 = full-strength proportional to *n* (threshold 0).
2. **All subsequent ticks**: No decay, no sweep, no catalytic destruction. The level stays at *n* forever.

This is **profoundly different** from a `CHEM 161 <n>` (Sex drive) injection, which decays within a few ticks due to reaction 35, the doubled sweep reactions, and possible Libido lowerer catalysis. A Comfort injection is the closest thing to a permanent genome edit available through the debug console — the only way to undo it is to inject `CHEM 162 -n` explicitly.

This property makes `CHEM 162 255` a useful (and unusual) debug tool: it promotes a drive-14 signal to maximum intensity without any of the usual decay curves that complicate drive debugging. It is also a potential source of confusion for modders who inject test Comfort values during development and later wonder why their Norn is still showing pegged Comfort levels hours later.

Because Comfort has no involuntary-action receptor, gait receptor, or physiological coupling, a high Comfort level does not produce any immediately visible effect in the game — no reflex animation, no gait change, no health effect. The only manifestation is the Creature Companion's Comfort drive bar, and whatever indirect behavioural bias the decision-lobe's drive-14 neuron contributes to action selection.

### CAV save/load and imported creatures

Because Comfort decays at "Very long" rate (essentially zero) and has no chemistry consumers, its value is **perfectly preserved** across save / export / import. An ever-pregnant female exported from one world and imported into a new one arrives with Comfort = 255 and will stay at 255 in the new world regardless of what happens there.

This is the single largest contrast with Sex drive [161], which is aggressively cleared by reaction 35 + the doubled sweep within a few seconds of arrival in a new world. A Norn's "sexual history" is chemically ephemeral; her "motherhood state" is chemically permanent. The pair (161, 162) together form the reproductive axis that is cleanly memory-wiped on the arousal side and permanently latched on the motherhood side.

`MakeYourselfTired`, the shutdown helper that prepares a creature for save, does **not** touch chemical 162. Whatever Comfort level the creature had at save time is exactly the level she has at load time.

### Practical consequences for gameplay

- **Comfort only rises from pregnancy.** There is no other stock-genome source. Non-pregnant creatures, male creatures, and pre-Youth creatures all stay at zero unless a script injects Comfort directly.
- **Comfort is permanent.** Once it rises, no stock-genome mechanism lowers it. The drive bar latches at whatever level the emitter or injection produced.
- **Pregnancy saturates Comfort within a fraction of a second.** Rate 10 sampling × gain 255 DIGITAL writes mean the first emitter firing after conception pushes the chemical to 255 and clamps there.
- **Comfort dominates the decision-lobe drive-bar hierarchy when non-zero.** Its gain 255 receptor is at the ceiling of the gain range. An ever-pregnant female has a pegged drive-14 vote in every action selection.
- **Comfort has no physical manifestation.** No gait, no reflex, no heart-rate effect, no fertilisation gate, no breathing change. The only visible sign is the Creature Companion's drive bar.
- **Ever-pregnant females are behaviourally different from never-pregnant females for life.** The permanently-saturated drive-14 neuron biases every subsequent action-selection.
- **Males never receive Comfort from stock chemistry.** Because `IsPregnant()` can only return true on females (only females have eggs in genome-store slot 1), male Norns live and die with Comfort at zero unless a script writes to the chemical.
- **Comfort backup [145] is an orphan slot in the stock genome** — allocated but never plumbed. Modders sometimes use it as a free slot for custom chemistry.
- **Direct CAOS injection is effectively a permanent genome flag.** `CHEM 162 <n>` persists indefinitely, across saves and worlds, until explicitly countered.
- **Newly-hatched Norns start at zero Comfort.** No initial concentration, no production before Youth, no production before first conception. The axis is entirely dormant until motherhood.

### Implications for modders

Common modifications built on Comfort:

1. **Add a baseline contentment emitter** — e.g. a `LOC_CONST` sensorimotor emitter at low rate so all creatures have some baseline Comfort, not just pregnant females. Produces a genome where Comfort behaves more like a general well-being signal.
2. **Plumb the orphaned Comfort backup [145]** — add the standard doubled sweep (`Comfort → Comfort backup` at half-life 6 ticks, two copies) and a drip (`Comfort backup → Comfort` at half-life ~300 ticks) so the chemical has genuine long-memory reservoir behaviour like the other drive pairs.
3. **Add a decay reaction** — e.g. `Comfort + Adrenalin → Adrenalin` (catalytic) so stress cancels contentment, or a passive `Comfort → nothing` reaction at a finite half-life so Comfort fades after birth rather than latching for life.
4. **Wire Comfort to gait or reflex** — add a sensorimotor LOC_GAIT receptor at a mid threshold to produce a distinctive "contented stride" when Comfort is high, matching Sex drive's gait-13 courtship walk. Can also add a LOC_INVOLUNTARY receptor to play a "purr" / "hum" animation reflex.
5. **Add a male-side Comfort emitter** — e.g. tied to successful feeding of offspring, or to successful insemination events, so males also have a motherhood-equivalent latching drive.
6. **Couple Comfort to circulatory / heart-rate loci** — add a LOC_CLOCKRATE receptor on 162 to slow the heart rate when contented, producing the physiological correlates of calm.
7. **Remove the Youth gate on the emitter** — allows Baby and Child creatures to acquire Comfort through scripted "being cuddled" events, extending the drive beyond its reproductive-specific role.
8. **Add a decision-lobe neuroemitter on Comfort** — so the cognitive system can learn to raise Comfort itself through experiences (safe rooms, full belly, being petted), not just from pregnancy.
9. **Lower the gain on the drive receptor from 255 to a smaller value** — so Comfort contributes at most a moderate amount to the decision lobe rather than dominating when present. Useful when combined with adding multiple other inflows to prevent a single pregnancy from pegging the drive-14 neuron for life.
10. **Add a reproductive-tissue coupling** — e.g. a LOC_E_RECEPTIVE emitter that writes negative Comfort during non-receptive phases, producing a genuine cyclical drive rather than a pregnancy-only one-shot.

### Summary

```
 Stock-genome wiring of Comfort [162]
 ────────────────────────────────────
 Inputs:
   emitter 18 (gene 37, Youth+)   LOC_PREGNANT (reproductive, locus 1)
                                  → Comfort [162]
     rate 10, gain 255 DIGITAL, threshold 0
     Fires whenever the female's genome-store slot 1 contains a zygote
     Saturates the chemical within one sampling interval

   CHEM 162 <n>  (CAOS / scripts / mods) — persists forever

   (no reactions, no neuroemitter, no sensorimotor emitter, no toxin,
    no initial concentration, no cross-drive spillover)

         Comfort [162]              half-life ≈ 90,682,980,616 ticks
         initial concentration: 0   (Very long — effectively permanent,
                                     no measurable decay)
                 │
                 └──► Drives receptor #15 (gene 50, Baby+):
                        Drives tissue (5) / locus 14 / threshold 0
                        / gain 255 (maximum), analogue
                        → decision-lobe "comfort" drive-14 bar

                 (no reactions consume Comfort)
                 (no active → backup sweep)
                 (no catalytic destruction)
                 (no annihilation with an antagonist)
                 (no sensorimotor / reflex / gait output)
                 (no circulatory / reproductive / cognitive feedback)

 Companion reservoir: Comfort backup [145]
   — ORPHANED in the stock genome: no reactions, no receptors, no emitters
   — allocated in the half-life table (Very long, genomeValue 255) but
     unreachable through chemistry; effectively a free slot for modders

 Gate: the LOC_PREGNANT reproductive locus
   — set to 1.0 whenever the female's genome-store slot 1 holds a zygote
   — cleared to 0.0 on birth (zygote transferred out) or miscarriage
   — re-entered on each subsequent conception

 Net effect:
   — Comfort is 0 throughout Baby, Child, and pre-first-pregnancy Youth
   — First conception saturates Comfort to 255 within one emitter cycle
   — Comfort stays at 255 for the rest of the female's life, through all
     subsequent pregnancies, births, and stresses, across save / export /
     import, until explicitly cleared by a CAOS negative write
   — The drive-14 decision-lobe neuron is pegged at full excitation for
     life from first conception onward, biasing action-selection toward
     whatever the female associated with drive-14 during that period
```

Comfort is the **pregnancy-gated, permanently-latching motherhood drive** of the Creatures 3 biochemistry — the single chemical that records, at full intensity and without return, whether a female has ever carried a zygote. Its wiring is minimalist to the point of asymmetry: a single Youth-gated reproductive emitter on the inflow side, a single max-gain drive-bar receptor on the consumer side, a completely orphaned reservoir slot, no decay, no reactions, no reflexes. This produces a chemical whose semantics are closer to a permanent state flag than a moment-to-moment drive — a chemistry-level memory of motherhood that, once set, stays set for life. Combined with its never-used reservoir Comfort backup [145] (reserved for symmetry with the other drive pairs but wired to nothing in the stock genome), Comfort completes the drive bank at locus 14 and serves as the genome's clearest example of an intentional-but-minimally-specified drive slot — a skeleton the designers left room to flesh out that modders routinely extend with reservoir plumbing, decay, stress coupling, and learned-experience inflows.
