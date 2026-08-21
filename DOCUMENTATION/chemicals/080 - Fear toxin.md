# 080 - Fear toxin

Fear toxin is chemical slot 80 in the Creatures 3 chemistry and is the eleventh entry in the canonical **bacterial-toxin block** (chemicals 70-81) — the contiguous range of chemicals that infectious bacteria can be rolled to inject into their host while actively colonising it. Like Sleep toxin (71), Fear toxin is a **drive-injector toxin**: it has no receptor of its own, no organ-injury wire, and no direct damage path. Its entire phenotype is produced by a single standard-genome reaction (reaction 79, gene 93) that burns 14 units of Fear toxin to mint 1 unit of the **Fear drive** (chemical 158). Every unit of Fear toxin that enters the creature's bloodstream is, through this reaction, funnelled into the creature's own emotional chemistry and expressed as the artificially-induced sensation of being afraid — panting, fleeing gait, raised adrenalin, clock-rate increase, and in severe cases the DIGITAL "stress" switch flipping on.

The in-fiction thematic role of chemical 80 is straightforward: a bacterium that secretes Fear toxin is a bacterium that makes its host *terrified of nothing*. Where Sleep toxin sedates the creature and Fever toxin cooks it, Fear toxin takes the creature's own emergency-fear system and jams it on artificially. A Fear-toxin-infected Norn runs, hides, refuses to approach food, breaks away from social partners, and in severe dosing loses its gait to Fear's sensorimotor override — symptoms that look, from the player's perspective, as if the creature has suddenly decided the entire world is hostile. The effect cascades through the whole fear/anger/adrenalin emotional chemistry (reactions 38, 40, 41 — Fear amplification, Fear→Anger bleed, Anger→Fear bleed) rather than being confined to a single chemical, making Fear toxin one of the most *behaviourally visible* toxins in the stock palette despite not damaging a single tissue.

Unlike the "classic cureable toxins" (Heavy Metals, Cyanide, Belladonna, Geddonase, Glycotoxin, Alcohol, ATP Decoupler, Carbon monoxide) which each have a dedicated antidote chemical and potion in the Medicine Maker, **Fear toxin has no antidote reaction and no listed cure in the stock genome**. It is absent from the Medical Pod's "creature is sick" scanner list (`medical scanner.cos:80`, which stops at chem 78 plus chem 30 and the antigen block). It is absent from the General Cure potion's documented toxin coverage. Its only clearance pathways are (a) Reaction 79's own self-consumption, which requires 14 units of toxin per unit of Fear minted, and (b) passive decay on a **Long** half-life of 1,241 ticks (decay rate 0.99944, roughly 41 seconds of real play per halving at 30 tps). The player's only intervention is to **remove the source** — kill the bacterium, separate the creature from the infection vector — and ride out the chronic Fear drive until the toxin and the drive it produces decay naturally.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No endogenous production** — no emitter and no synthesising reaction in the standard genome | — | — | A healthy creature is born with Fear toxin = 0. There is no metabolic pathway that generates chemical 80 from anything the body already makes. The creature's own Fear drive (158) is produced and regulated by its emotion-chemistry network (Fear backup 141, Stress (Fear) 191, Adrenalin amplifier reaction 38, Fear↔Anger cross-reactions 40/41) — never by endogenous Fear toxin |
| 2 | **Bacterial infection** (primary stock-game source) | `bacteria.cos` (family/genus/species `2 32 23`), OV16 | Every timer tick while the bacterium is active (not dormant), inject `ov17` (0.005-0.050) units of `ov16` into the host | OV16 is rolled per-bacterium (`setv ov16 rand 70 81`, bacteria.cos:82) and may take any value in 70-81; when OV16 = 80 the bacterium is a Fear-toxin carrier. The bacterium catalogue entry at `DOCUMENTATION/caos_scripts/bacteria.md:180` annotates slot 80 as "Fear Toxin — Causes fear response". A chronic infection therefore keeps the host's Fear drive pegged high, turning every moment of the creature's life into an artificially-frightened one until antibodies 102-109 against the matching antigen 82-89 suppress the bacterium |
| 3 | **Bacterial-toxin themed agents** (hostile foods, fear-gas traps, community disease packs) | User-made `.agents` / `.cob` files | `CHEM TARG 80 <amount>` on bite, touch or spore-emission events | Fear toxin is an attractive chemical for community authors who want an "anxiety draught" or a non-lethal scare-trap that drives a creature away from a location without physically hurting it. Because the stock genome provides no antidote, a sizeable dose reliably unsettles any Norn / Grendel / Ettin for the lifespan of the toxin |
| 4 | **CAOS injection** | — | `CHEM TARG 80 <amount>` from scripts or the debug console | The standard way to test reaction 79's 14:1 Fear-minting stoichiometry, to force a Fear-drive emergency for behaviour testing, or to investigate how the Fear/Anger/Adrenalin cross-reactions respond to a saturating dose of artificial fear |

Fear toxin thus follows the "no endogenous source, external delivery only" design of the bacterial-toxin block. It is not referenced by any stock Medicine Maker recipe, is not mentioned in the *Materia Medica*'s chemical-by-chemical section, and does not appear in the Medical Pod's scanner thresholds — an indication that it was wired into the genome primarily as a bacterial-infection ingredient rather than as a potion-cureable acute poisoning.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Fear-drive minting reaction** (the sole effect pathway) | 93 (reaction 79, Baby onwards) | Reaction / Somatic | `14× Fear toxin [80] → 1× Fear [158]`, rate 32, half-life 24 ticks ("Short", decay rate 0.9712) | — | — | — | — | The only reaction touching chemical 80 in the stock genome. Each activation burns 14 units of Fear toxin and emits 1 unit of Fear drive. The 14:1 stoichiometry is deliberately *de-amplifying* — the opposite of Sleep toxin's 1:2 ratio — meaning Fear toxin is a **high-dose** drive injector. A small trickle produces only a trickle of Fear drive; a serious dose is required before Fear accumulates faster than the Fear→Anger (reaction 40), Fear backup (chemical 141) and passive-decay channels can clear it. The fast half-life (Short, 24 ticks ≈ 0.8 s at 30 tps) means the conversion is responsive — no slow build-up — but the high reactant ratio means the creature needs a *lot* of toxin to feel meaningfully afraid |
| 2 | **No receptor on chem 80** | — | — | — | — | — | — | — | Fear toxin drives no receptor directly. All phenotypic expression is routed through the Fear drive (158), whose receptors are the ordinary emotional-chemistry wiring: Drives/Locus 10 "Fear" (receptor 11), Organ/Somatic/RLOCUS_CLOCKRATE (receptor 142, threshold 45, gain 255 — raises organ clock rates when afraid), Circulatory Locus 11 DIGITAL switch (receptor 157, threshold 204, gain 255 — flips the "stressed" flag all-or-nothing), Sensorimotor/LOC_GAIT4 (receptor 188, threshold 128, gain 223 — overrides gait selection toward a flee-gait when Fear is high), and more |
| 3 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | Unlike the classic cureable toxins, there is no pharmaceutical neutralisation path for Fear toxin. The creature's only clearance of the toxin itself is self-consumption by reaction 79 and passive decay. Clearance of the *downstream* Fear drive follows the normal emotional-chemistry pathways: Fear → Fear backup (reactions around chemical 141), Fear → Anger bleed (reaction 40), and the Fear drive's own circulatory decay |
| 4 | **Not listed in Medical Pod scanner** | `medical scanner.cos:80` | — | — | — | — | — | — | The sick-threshold `doif` at `medical scanner.cos:80` watches chem 66, 67, 68, 69, 70, 75, 78, 82-89 and chem 30 < 0.5, but **does not include chem 80**. A Fear-toxin-infected creature will not trip the Medical Pod's "sick" alert from the toxin alone; the player must diagnose it behaviourally (creature fleeing for no reason, Fear drive visibly high, chemistry panel showing Fear toxin > 0) |
| 5 | **Not in General Cure** | Materia Medica | — | — | — | — | — | — | The General Cure potion's stated toxin list is "*Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin*" — chem 80 is absent. There is no one-potion pharmaceutical lever on Fear toxin in the stock Medicine Maker |
| 6 | **Passive decay** | — | — | Half-life **1,241 ticks** ("Long", decay rate 0.99944) | — | — | — | — | The fallback clearance pathway. ~41 seconds of real play time per halving at 30 tps — slightly shorter than Sleep toxin (1,513) and much shorter than Carbon monoxide (1,370) and Muscle toxin (3,024). Combined with the 14:1 reaction stoichiometry this produces a profile where a moderate dose is mostly cleared by passive decay within a minute or two, while a heavy bacterial infection maintains a near-steady-state Fear drive for as long as the bacterium keeps injecting |

The usage table is the portrait of a **pure drive-injector toxin**: one reaction that mints Fear from Fear toxin at a deliberately *inefficient* 14:1 ratio, no receptor of its own, no antidote, no organ damage, and no diagnostic visibility beyond the chemistry-panel presence of chemical 80. Everything that happens to the creature behaviourally happens through the creature's own Fear drive chemistry reacting to the minted drive units.

## Role in Game Mechanics

### Reaction 79 — the 14:1 Fear-drive mint

Reaction 79 (gene 93) is the entire pharmacological story of chemical 80:

```
14× Fear toxin [80]  →  1× Fear [158]
```

Several features of this reaction make it distinctive within the bacterial-toxin block:

- **High reactant coefficient (14).** Compared to Sleep toxin's `4× Sleep toxin → 3× Sleep toxin + 2× Sleepiness` (net −1 toxin, +2 drive), Fear toxin's `14× toxin → 1× drive` is an aggressively *down-amplifying* conversion. It takes 14 units of circulating Fear toxin to produce 1 unit of Fear drive. At Fear toxin concentrations near 0 the reaction fires negligibly; the rate scales with the 14th-power-style product of the reactant concentration, so the reaction is effectively *thresholded* — trace doses produce no meaningful Fear, and the toxin has to build to a moderately high bloodstream concentration before the creature feels the effect.
- **Short half-life (24 ticks, rate 32, decay 0.9712).** Once the reaction *does* fire, it fires fast — about 0.8 s per halving at 30 tps. This matches the responsiveness expectation for a "fear"-style toxin: the effect should feel acute and sudden, not dragged out.
- **Single product, no by-products.** Unlike Sleep toxin, Fear toxin does not regenerate any of itself — every activation is a clean 14-unit sink that produces only Fear drive. This makes the toxin's total "damage budget" finite: a 1.0-unit dose of Fear toxin can produce at most ~0.07 units of Fear drive before the toxin is exhausted (and passive decay will additionally remove most of it before the reaction catches all 14-unit batches).

The combined effect of the high reactant coefficient and the short half-life is a characteristic dose-response curve:

| Fear toxin dose | Steady-state Fear drive produced | Phenotype |
|---|---|---|
| < 0.1 units (trace) | Near-zero | No observable effect; the reaction cannot assemble enough 14-unit batches |
| 0.3 - 0.5 units (mild bacterial dose) | Small positive Fear drive | Mild uneasiness; creature slightly more reactive, may prefer to move away from ambiguous stimuli |
| 0.7 - 1.0 units (moderate dose) | Noticeable Fear drive | Creature flees from nearby objects, refuses to approach food briefly, may break off social interactions |
| > 1.0 units (heavy dose / chronic infection) | Fear drive saturates | Locus-10 Fear drive pegged, gait switches to LOC_GAIT4 (threshold 128), organ clock rate elevated (threshold 45), and at Fear > 204 the Circulatory Locus-11 DIGITAL stress switch flips on |

The 14:1 stoichiometry is the design lever that makes Fear toxin "expensive" to weaponise: a bacterium injecting 0.005-0.050 units per tick has to maintain the infection for many ticks before the creature's Fear drive is meaningfully elevated, giving the immune system time to mount antibody production against the matching antigen (82-89).

### The Fear drive cascade — why Fear toxin has such a visible phenotype

Fear (chemical 158) is not merely a drive: it is the hub of a small network of emotion-chemistry reactions and receptors that together produce the stereotyped "afraid creature" phenotype. When Fear toxin mints Fear drive via reaction 79, the minted Fear drive immediately enters this network:

1. **Fear amplifier (reaction 38, gene 5, Adolescent onwards).** `1× Fear + 1× Adrenalin → 2× Fear + 1× Adrenalin`. Adrenalin (117) is a catalyst — it is not consumed — and it doubles circulating Fear per activation. Half-life 58 ticks (Short). Any creature with non-trivial Adrenalin (which is constantly being produced by stress responses, exercise, and damage) will see its Fear toxin-induced Fear drive *amplified* rather than simply added. This reaction is the reason Fear toxin feels like an "overreaction" chemical: even a small initial nudge can run away in a creature whose circulation already carries Adrenalin. Reaction 39 is the symmetric Anger amplifier (`1× Anger + Adrenalin → 2× Anger + Adrenalin`), which matters because of reaction 40 below.
2. **Fear → Anger bleed (reaction 40, gene 1).** `1× Fear → 1× Anger`, half-life 95 ticks (Short). A fraction of the minted Fear drive *converts into Anger* (chemical 160). This is the Creatures 3 emotional model's implementation of the real-world observation that chronic fear often manifests as aggression: a frightened creature becomes an angry creature over time. For Fear toxin this means a chronic dose does not only produce flee/avoid behaviour — as Fear sits in the bloodstream, some of it bleeds into Anger, and the creature may start *lashing out* at perceived threats as well as fleeing them.
3. **Anger → Fear bleed (reaction 41, gene 3).** `1× Anger → 1× Fear`, half-life 95 ticks (same rate as 40). The reverse bleed makes the Fear ↔ Anger system a near-equilibrium pair: circulating Anger decays partially into Fear at the same rate Fear decays into Anger. This tends to equalise the two drives in steady state, so a chronic Fear-toxin infection produces a creature that is simultaneously afraid *and* angry, not purely one or the other.
4. **Circulatory clearance / Fear backup.** Fear has its own passive decay and a Fear-backup reservoir chemical (141, "Fear backup"). When the acute Fear pulse subsides, circulating Fear is partially parked in the backup reservoir and partially decayed away by ordinary circulatory chemistry. Fear backup is the drive equivalent of Sleepiness backup — it smooths the fear response so that brief frights don't produce unresolvably-oscillating behaviour.

The key observation is that **Fear toxin does not simply "make the creature afraid" — it injects a small amount of Fear drive which is then multiplied, converted into Anger, bled back, amplified by Adrenalin, and parked into a backup reservoir, all by the creature's own emotion chemistry**. This is why Fear toxin's phenotypic effect is so much more visible than its literal stoichiometry would suggest: the creature's biology is doing most of the work of turning a small artificial nudge into a full-blown emotional crisis.

### Phenotypic expression — the three Fear receptor tiers

The Fear drive (158) is read by at least four distinct receptors in the stock genome, each activating at a different concentration. This produces a *layered* phenotype in which the symptoms worsen in recognisable stages as the Fear drive climbs:

- **Receptor 11 (gene 10) — the Drives tissue itself.** `Creature / Drives / Locus 10 "Fear"`, threshold 0, gain 209. This is the Fear drive reading its own chemical into the Drives tissue, where the brain's decision layer reads it to bias action selection toward flee / avoid / hide. Even small amounts of Fear register here.
- **Receptor 142 (gene 17) — organ clock-rate acceleration.** `Organ / Somatic / RLOCUS_CLOCKRATE`, threshold 45, gain 255. At Fear > ~0.18 (45/255) the creature's organ clocks speed up. This is the chemistry-level equivalent of "the heart starts racing" — all the creature's metabolic organs tick faster, which bumps up chemistry turnover and makes the creature more reactive and energetic, exactly the physiological profile of acute fear. Fear toxin consistently trips this receptor because reaction 79's Short half-life means any non-trivial dose pushes Fear above the 45 threshold quickly.
- **Receptor 188 (gene 102) — flee-gait selection.** `Creature / Sensorimotor / LOC_GAIT4`, threshold 128, gain 223. At Fear > ~0.5 (128/255) the creature's sensorimotor gait selection forces LOC_GAIT4 — the flee / panic gait. This is the point at which Fear becomes visible in the creature's movement: instead of walking, it runs. A moderate Fear-toxin dose (≥ 0.7 units) brings Fear drive above this threshold and the creature will visibly panic-walk wherever it goes.
- **Receptor 157 (gene 53) — the DIGITAL "stress" switch.** `Creature / Circulatory / Locus 11`, threshold 204, gain 255, flags 2 (DIGITAL all-or-nothing). At Fear > ~0.8 (204/255) the DIGITAL flag causes this receptor to *snap* — its output is not a smoothly-scaled signal but an all-or-nothing switch. This is the "extreme stress" flag; it is read by other genome wiring to produce the behavioural disruptions associated with overwhelming fear (breakdown of normal drive resolution, possible learning suppression). Only a heavy Fear-toxin dose or a chronic bacterial infection can drive Fear high enough to trip this receptor.

The layered thresholds produce the recognisable progression: **mild dose → uneasy; moderate dose → flee-gait; heavy / chronic dose → stress-switch snap**. A player who recognises the progression can often diagnose Fear toxin from the creature's behaviour alone — a Norn running in panic-gait for no apparent environmental reason is the classic symptom.

### Why there is no antidote — the drive system clears itself

The stock genome follows the same design principle for Fear toxin as for Sleep toxin: **no dedicated antidote reaction** because the creature's own drive chemistry already provides clearance. Specifically:

- Fear (158) has its own passive decay and Fear-backup (141) parking reservoir, analogous to the Sleepiness / Sleepiness-backup pair.
- The Fear → Anger bleed (reaction 40) continuously redirects a fraction of Fear into Anger, which has its own decay and its own backup reservoir.
- Once the incoming Fear toxin dose stops (bacterium suppressed, creature moved away), reaction 79 cannot sustain Fear drive production; Fear drive decays to baseline within seconds to tens of seconds; and the 41-second passive half-life of Fear toxin ensures that even residual toxin clears within a few minutes.

There is simply no need for an "anti-fear" chemical in the same sense that Anti-oxidant (93) clears Carbon monoxide or Sodium thiosulphate (96) clears Cyanide, because Fear toxin does not damage anything — it only *nudges* a regulatory system. The cure is to stop the nudging and let the regulator restabilise.

The practical consequence for players is that **a Fear-toxin infection is not treated pharmacologically — it is treated by removing the source**. The player should kill the bacterium, physically separate the creature from the bacterium's range, or wait for antibodies 102-109 (matched to the bacterium's antigen 82-89) to reach a concentration that forces the bacterium dormant. Once the influx stops, the creature recovers naturally within a minute or two.

### Interaction with the bacterial infection system

Fear toxin's primary stock-game vector is the bacterium agent family (`bacteria.cos`, class `2 32 23`). Each bacterium, on instantiation, rolls OV16 randomly in the range 70-81 (`setv ov16 rand 70 81`, bacteria.cos:82). When OV16 lands on 80 the bacterium becomes a Fear-toxin carrier and, while actively infecting a host, injects `ov17` (0.005-0.050) units of chemical 80 into the host's bloodstream on every timer tick.

The 14:1 stoichiometry of reaction 79 interacts with the bacterium's per-tick injection rate in an important way:

- At the low end of the bacterium's dose range (0.005/tick), the steady-state Fear toxin concentration stays below the effective threshold for reaction 79 to fire substantially. The creature may feel *slight* Fear elevation but not enough to trip the gait receptor.
- At the high end (0.050/tick) and especially against a weakened immune system, Fear toxin accumulates faster than reaction 79 consumes it, the bloodstream Fear toxin level climbs into the ≥ 0.5 range, and reaction 79 starts producing meaningful Fear drive on every half-second cycle. The creature enters the flee-gait phenotype and stays there for the duration of the chronic infection.
- As the immune system ramps (antibodies 102-109 build against the matching antigen), the bacterium periodically goes dormant, the injection rate drops to zero, and the creature has brief lucid windows in which Fear toxin and Fear drive fall back to baseline. These windows are useful for the player to hand-feed the creature if the Fear state was interfering with normal eating.

The clinical profile of a Fear-toxin infection is therefore **chronic panic with partial remission**: long stretches of fleeing / avoidance / heightened aggression punctuated by brief calm periods as the bacterium goes dormant. Because Fear-toxin-infected creatures actively avoid other creatures and normal food sources, the infection has substantial *behavioural* consequences beyond its chemistry: the creature does not socialise, does not breed, may not eat adequately, and may not learn (the stress-snap receptor at Fear > 0.8 is widely read by other genome wiring as a "do not update nouns / verbs / learning state" signal in many genome designs).

### Contrast with Sleep toxin and the other drive-injector toxins

Fear toxin and Sleep toxin are the two clearest "drive-injector" toxins in the bacterial-toxin block. They share the same basic architecture (no receptor on the toxin itself, one reaction converting toxin to drive, no antidote) but their stoichiometries reveal a deliberate design contrast:

| Chemical | Reaction | Toxin → drive ratio | Drive target | Drive receptor tiers | Passive HL |
|----------|----------|---------------------|--------------|----------------------|------------|
| Sleep toxin (71) | `4× toxin → 3× toxin + 2× drive` | Net **−1 toxin, +2 drive** (up-amplifying) | Sleepiness (155) | Single behavioural switch (fall asleep) | 1,513 ticks |
| **Fear toxin (80)** | `14× toxin → 1× drive` | Net **−14 toxin, +1 drive** (down-amplifying) | Fear (158) | **Four layered thresholds** (Drives, CLOCKRATE, GAIT4, DIGITAL stress) | **1,241 ticks** |

Sleep toxin is cheap per unit — a small dose produces double the drive — but the drive it produces has a single switch-like effect (sleep or awake). Fear toxin is expensive per unit — it takes 14 units of toxin to mint 1 unit of drive — but the drive it produces unlocks a *graded* phenotype with four thresholds. The design philosophy is that fear should be a nuanced, layered phenotype that scales smoothly with dose, while sleep is a binary state that the creature either enters or does not. The two toxins also differ sharply in their secondary chemistry: Sleep toxin's product (Sleepiness) decays simply into Sleepiness backup, while Fear toxin's product (Fear) participates in a bidirectional Fear ↔ Anger bleed and an Adrenalin-catalysed amplification loop — making Fear toxin's downstream effects much more chaotic and harder to predict.

### Diagnostic visibility — "the creature that runs from nothing"

Fear toxin is absent from the Medical Pod's sick-threshold scanner (`medical scanner.cos:80`) and from the General Cure potion's toxin list, so it has **no built-in diagnostic support** in the stock game. The player must recognise it behaviourally and chemically:

- **Behavioural signs**: creature runs (LOC_GAIT4 active) for no environmental reason; creature avoids food, water and social partners; creature may flip between flee behaviour and angry lashing-out (the Fear→Anger bleed); creature's fear drive reads high on the drive-inspection tools.
- **Chemical signs**: chemistry panel shows Fear toxin > 0 alongside elevated Fear (158); Adrenalin (117) may also be elevated because the amplifier loop feeds it; Anger (160) elevated as Fear bleeds into it over time.
- **Environmental signs**: a bacterium sprite (family `2 32 23`) nearby or attached to the creature; the bacterium's OV16 reads 80.

The diagnostic gap is consistent with the design philosophy that chemical 80 is a **bacterial infection ingredient** rather than a potion-cureable acute poisoning — the player is expected to recognise the behavioural phenotype and target the bacterium, not reach for the Medicine Maker.

### Strategic / gameplay implications

- **Behavioural denial, not organ damage.** Like Sleep toxin, Fear toxin causes zero organ injury. A creature can survive a long Fear-toxin infection with every somatic tissue intact; the cost is all in opportunity — the creature fails to eat, breed, socialise and learn while afraid.
- **No pharmacological cure.** The stock Medicine Maker offers nothing for Fear toxin. The correct intervention is behavioural (remove the source) or immunological (wait for antibodies) rather than pharmaceutical.
- **Starvation and isolation risk.** A chronically fear-afflicted creature will not approach food or water reliably and will actively move away from its social group. The long-term mortality risk is indirect: Starvation (chemical 197), dehydration, loneliness drive accumulation, and the social-graph consequences of a creature that has repeatedly fled from its partners.
- **Learning disruption at high dose.** The DIGITAL stress snap at Fear > 0.8 (receptor 157) is widely read by brain-layer genome wiring to suppress learning and decision-plasticity updates. A sustained heavy Fear-toxin load is therefore a form of *cognitive* denial as well as behavioural denial: the creature does not just panic, it fails to update its brain model of the world during the panic, and may retain confused associations after the toxin clears.
- **Anger bleed as secondary risk.** Reaction 40's Fear → Anger conversion means a chronic Fear-toxin infection also elevates Anger (160), which has its own receptors and behavioural effects (aggressive actions, slapping, pushing). A long-running Fear-toxin infection can therefore *also* make the creature dangerous to nearby creatures, not only frightened itself.
- **Community modders' "panic trap".** Because Fear toxin has no receptor and no organ-injury path, it is a safe non-lethal ingredient for community-made anxiety traps, scare-gas vents, or fear-inducing hostile objects. A creature dosed heavily with Fear toxin will flee the area reliably and predictably without permanent harm.

## Summary

```
 Chemical 80 — Fear toxin  (bacterial-toxin block, drive-injector class)
 --------------------------------------------------------------------------
 Producers:   NONE internally — external only
              - Bacterium agents (class 2 32 23, bacteria.cos) rolling
                OV16 = 80 inject 0.005-0.050 units per tick while active
              - User-made agents via CHEM TARG 80 <amount>
              - CAOS console / scripts for testing

 Consumers:   Reaction 79  (Fear-mint: 14× Fear toxin → 1× Fear [158];
                             HL 24 ticks "Short", gene 93, rate 32 —
                             deliberately *down-amplifying* 14:1 ratio,
                             the opposite of Sleep toxin's +2:1 minting)

 Receptors (0 on chem 80):
   - NONE drive off chem 80 directly.
   - All phenotypic damage routed via the Fear drive (158):
     * Receptor 11  (Drives/Fear, threshold 0, gain 209)
     * Receptor 142 (Organ/Somatic/CLOCKRATE, threshold 45, gain 255)
     * Receptor 188 (Sensorimotor/GAIT4, threshold 128, gain 223)
     * Receptor 157 (Circulatory/Locus 11, DIGITAL, threshold 204,
                     gain 255 — the "stress snap" all-or-nothing switch)

 Half-life:   1,241 ticks (~41 s at 30 tps, decay 0.99944 — "Long")

 Antidote:    NONE in stock genome. Not in General Cure. Not in any
              Medicine Maker recipe. Not listed in Medical Pod scanner.

 Cure:        Remove the source (kill the bacterium, separate from range),
              let reaction 79 self-consume the toxin, let passive decay
              clear residuals, let the Fear drive's own circulatory
              clearance + Fear backup (141) + Fear↔Anger bleeds
              (reactions 40/41) restore emotional baseline.

 Narrative role: The "irrational-terror" bacterial toxin. A drive-injector
                 toxin that mints the creature's own Fear drive at a
                 deliberately inefficient 14:1 ratio, relying on the
                 creature's own emotion-chemistry network (Adrenalin
                 amplification, Fear↔Anger bleed) to magnify the small
                 artificial nudge into a full-blown emotional crisis.
                 Phenotype scales in four tiers: uneasy → flee-gait →
                 stress-snap → cognitive lockdown. No organ damage, no
                 antidote, no diagnostic support — diagnosed behaviourally
                 (creature runs from nothing) and treated by removing the
                 source bacterium.
```

Fear toxin is the bacterial-toxin block's **emotional-crisis chemical**. It joins Sleep toxin (71) as one of the two pure drive-injector toxins — toxins whose entire effect is to inject a single drive chemical via one reaction, with no receptor of their own and no antidote. Its 14:1 stoichiometry (down-amplifying, the opposite of Sleep toxin's up-amplifying +2:1) and its target drive's four-tiered receptor network (Drives, CLOCKRATE, GAIT4, DIGITAL stress) together make Fear toxin a *graded, behaviourally-visible* toxin that a player can diagnose from across the room — a Norn running in panic-gait for no environmental reason is almost always Fear-toxin infected. The cure is behavioural: remove the source, wait for the creature's own Fear drive chemistry (Fear backup, Fear↔Anger bleed, passive decay) to restabilise once the influx stops.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:102` — chemical descriptor slot 80 "Fear toxin" (empty description)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:133-134` — player-visible slot name "Fear toxin"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:344-345` — chemical 80 lexicon entry "Fear Toxin" (no dedicated potion / no Materia Medica prose — Fear toxin has no Medicine Maker cure in the stock catalogue)
- `Rebuild/Assets/Bootstrap/001 World/bacteria.cos:82` — `setv ov16 rand 70 81`: per-bacterium random toxin selection. OV16 = 80 makes the bacterium a Fear-toxin carrier
- `Rebuild/Assets/Bootstrap/001 World/bacteria.cos:702` — re-roll OV16 on bacterium re-initialisation (same 70-81 range)
- `Rebuild/Assets/Bootstrap/001 World/medical scanner.cos:80` — Medical Pod "sick" scanner threshold battery. **Note that chem 80 is NOT in the list** (the list stops at chem 78 plus chem 30 and the antigen block 82-89) — Fear toxin infections do not trigger the scanner's generic sick alert
- `Rebuild/DOCUMENTATION/caos_scripts/bacteria.md:180` — bacterium toxin table entry: `80 | Fear Toxin | Causes fear response`
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - Reaction 79 (gene 93, Baby onwards): `14× Fear toxin [80] → 1× Fear [158]`, rate 32, HL 24 ticks ("Short"), decay 0.9712
  - Reaction 38 (gene 5, Adolescent+): `1× Fear + 1× Adrenalin → 2× Fear + 1× Adrenalin` — Adrenalin-catalysed amplifier, HL 58 ticks
  - Reaction 40 (gene 1, Baby+): `1× Fear → 1× Anger` — Fear→Anger bleed, HL 95 ticks
  - Reaction 41 (gene 3, Baby+): `1× Anger → 1× Fear` — symmetric Anger→Fear bleed
  - Receptor 11 (gene 10): Creature/Drives/Locus 10 "Fear", threshold 0, gain 209 — drive reads its own chemical
  - Receptor 142 (gene 17): Organ/Somatic/RLOCUS_CLOCKRATE, chem 158, threshold 45, gain 255 — Fear speeds up organ clocks
  - Receptor 188 (gene 102): Creature/Sensorimotor/LOC_GAIT4, chem 158, threshold 128, gain 223 — Fear overrides gait to flee
  - Receptor 157 (gene 53): Creature/Circulatory/Locus 11, chem 158, threshold 204, gain 255, flags DIGITAL — "stress snap" all-or-nothing switch at high Fear
  - Half-life entry chem 80: 1,241 ticks, decay rate 0.99944177, "Long"
- `Rebuild/DOCUMENTATION/chemicals/071 - Sleep toxin.md` — companion analysis of the other pure drive-injector toxin, illustrating the design contrast between Sleep toxin's +2:1 up-amplifying minting and Fear toxin's −14:1 down-amplifying minting
- `Rebuild/DOCUMENTATION/chemicals/072 - Fever toxin.md` — companion analysis of an adjacent bacterial-toxin-block entry, illustrating the "toxin + substrate → symptom chemical" alternative pattern
- `Rebuild/DOCUMENTATION/chemicals/079 - Carbon monoxide.md` — companion analysis of the immediately preceding chemical slot, a classic cureable toxin with a fully-wired antidote path, contrasting sharply with Fear toxin's "no cure, no scanner, no potion" minimal wiring
