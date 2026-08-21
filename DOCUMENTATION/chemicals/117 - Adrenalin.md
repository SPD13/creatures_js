# 117 - Adrenalin

Adrenalin is the Creatures 3 / Docking Station stock genome's **"fight-or-flight" signalling chemical** — a fast, moderately-decaying bloodstream messenger that couples the creature's emotional state to its physiology. Unlike most of the hormones in the Norn biochemistry, Adrenalin is not a terminal mood chemical (it has no receptor that drives a specific drive or behavioural locus directly). Instead it acts as an **amplifier**: when Adrenalin is present alongside Fear or Anger, those emotions self-catalyse and grow; simultaneously Adrenalin unlocks an extra glycolytic pathway that trades the creature's stored Glycogen for a large burst of Glucose, readying the body for action.

Its sources are two: an **endogenous emitter** on the Creature/Circulatory organ that watches a stress-type locus and releases Adrenalin in digital bursts, and a **neuroemitter** driven by the Movement lobe (lobe 4, "move") neuron 37 that releases Adrenalin together with Fear and Crowded when the brain fires that neuron. Its sinks are the three genome reactions that consume it (the energy-releasing Glycogen → Glucose reaction, plus the two emotion-amplification reactions), the single Reaction-organ receptor that reads Adrenalin concentration, and its own Medium-speed half-life of 209 ticks (~7 s at 30 Hz) that clears any unused hormone in under a minute. Together these make Adrenalin the short-lived, high-impact arousal signal of the Norn body.

## Sources

| # | Mechanism | Gene / ID | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-----------|----------------|-------------------|------|
| 1 | Endogenous emitter (stress-linked release) | Emitter #12 (geneId 11) | Organ #1 "Creature" / Circulatory / Locus 4 | When the creature's Circulatory Locus 4 signal ≥ threshold 128/255, fire a **DIGITAL fixed-gain** emission of Adrenalin — each tick the locus is tripped, a fixed dose of ~8/255 units is deposited into the bloodstream (rate byte 17) | Digital — fires in all-or-nothing bursts whenever the watched locus crosses threshold |
| 2 | Neuroemitter (movement-lobe neuron firing) | Neuroemitter #1 (geneId 1) | Brain → bloodstream via `NEU1` emission | When lobe 4 ("move") neuron 37 fires, emit chemicals in bundled amounts: Adrenalin (8), Fear (5), Crowded (6). Rate byte 4 | Fires in proportion to that single neuron's output each update |
| 3 | External CAOS injection | — | Any | `CHEM 117 <n>` (or `INJR 117 <n>`) targeted at a creature | One-shot; the injected amount then decays at chemical half-life |
| 4 | Food / agent chemical tables | — | Ingestion | An edible agent whose PRAY `Chemical 0..3` slots include chemical 117 deposits that amount when eaten (rare in stock agents, common in "energy drink"-type mods) | One-shot on ingestion |

Because the endogenous sources are digital and tied to specific high-activation events (a drive locus tripping, or a single neuron firing), stock Norns spend most of their lives with Adrenalin at or near zero, punctuated by short spikes at moments of stress or movement-lobe activity.

## Usage

| # | Mechanism | Gene / ID | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-----------|----------------|-----------------|--------|
| 1 | Glycogen → Glucose burst reaction | Reaction #22 (geneId 38) | Organ #2 "Reaction" | `1× Glycogen [4] + 1× Adrenalin [117] → 8× Glucose [3]` at rate byte 38, half-life 43 ticks ("Short") | Consumes stored Glycogen **and** the Adrenalin itself. Produces an 8× Glucose output per stoichiometric cycle — a large, fast energy dump that supplements the normal glycolysis pathway during arousal |
| 2 | Fear amplification reaction | Reaction #38 (geneId 5, switch-on Adolescent) | Organ #2 "Reaction" | `1× Fear [158] + 1× Adrenalin [117] → 2× Fear [158] + 1× Adrenalin [117]` at rate byte 41, half-life 58 ticks ("Short") | **Catalytic** — Adrenalin is conserved; Fear doubles per cycle. As long as both chemicals are present, Fear grows exponentially. The reaction is switched on at Adolescent age, so infants do not amplify Fear yet |
| 3 | Anger amplification reaction | Reaction #39 (geneId 6, switch-on Adolescent) | Organ #2 "Reaction" | `1× Anger [160] + 1× Adrenalin [117] → 2× Anger [160] + 1× Adrenalin [117]` at rate byte 41, half-life 58 ticks ("Short") | **Catalytic** — Adrenalin is conserved; Anger doubles per cycle. Same Adolescent gating as Fear amplification. The two reactions compete for the same finite Adrenalin pool, so whichever emotion starts with the larger concentration will grow fastest |
| 4 | Adrenalin concentration receptor | Receptor #55 (geneId 197) | Organ #3 "Reaction" / Somatic / Locus 0 | Reads Adrenalin; threshold 16, nominal 247, gain 48, no flags | Feeds the generic Reaction-organ locus 0, which the organ's internal logic uses as a modulator — in effect, the organ "knows" when Adrenalin is elevated and biases its behaviour accordingly |
| 5 | Passive decay | Half-life table entry for 117 | Bloodstream | `genomeValue: 54`, half-life 209 ticks (≈7 s at 30 Hz), decay rate 0.99669106 ("Medium") | Any unused Adrenalin clears in well under a minute, preventing accumulation between stress events |
| 6 | No initial concentration | — | — | Adrenalin is **not** listed in the initial-concentration table; newborn Norns start with 0 Adrenalin | Baseline is zero; the creature must produce or receive Adrenalin to have any |

## Role in Game Mechanics

### An arousal amplifier, not a drive

Adrenalin is one of a small group of chemicals in the Norn genome that have **no drive receptor**. Chemicals such as Fear (158), Anger (160), Pain (148), Hunger (149) feed directly into the Creature/Circulatory locus block that the brain reads as emotions; the creature literally *feels* them. Adrenalin does not. There is no locus, mood, or neuron that reads Adrenalin as "I feel adrenalized". Instead, Adrenalin's two behavioural consequences both happen indirectly:

1. It **amplifies** the emotional chemicals that do have drive receptors (Fear, Anger).
2. It **fuels** the body by accelerating glycogenolysis into Glucose.

This is a faithful model of real adrenaline, which is not itself a felt emotion but a hormone that potentiates the autonomic expression of existing emotional states. The Norn does not experience "adrenaline"; it experiences *more intense Fear* or *more intense Anger* and a sugar rush, all of which are the downstream effects of the hormone.

### The fight-or-flight energy burst

The stock genome's reaction #22 is the engine of the "energy dump":

```
1× Glycogen [4] + 1× Adrenalin [117]  →  8× Glucose [3]
```

- **Rate half-life 43 ticks (Short).** Whenever both reactants are present, roughly 1.6% of the reactant stock converts per tick; in practice a 30 Hz update collapses a dose to near-zero in a few seconds.
- **8× output amplification.** This is one of the most aggressive amplifications in the genome. Typical ATP-producing steps yield 1–2 products per reactant; this reaction yields 8 Glucose per Glycogen when catalysed by Adrenalin. The effect is a sudden spike in circulating Glucose that the downstream glycolysis reaction (`1× Glucose + 2× ADP → 2× Pyruvate + 2× ATP`, gene 34) turns into a burst of ATP.
- **Both reactants consumed.** The Adrenalin is *not* catalytic here. Each unit of Glycogen metabolised costs one unit of Adrenalin. This limits the size of the energy burst to the Adrenalin dose — stress releases ~8 units of Adrenalin per emitter firing, so at most ~8 units of Glycogen are liberated per burst.
- **Stored Glycogen is the fuel reservoir.** Glycogen is built up slowly during normal metabolism; Adrenalin spends it rapidly. This matches the biological logic of glycogenolysis: stored carbohydrate energy converted on demand to blood sugar, for immediate muscular use.

In gameplay terms, an adrenalized Norn will have a brief blood-sugar spike above baseline, which keeps the ATP supply high during the period of high arousal — crucial because stressed, fearful, or angry Norns typically are also moving more (running from danger, fighting, pushing objects), which would otherwise drain ATP faster than normal metabolism can replenish it.

### Exponential Fear and Anger

Reactions #38 and #39 are the most distinctive behavioural feature of Adrenalin. They are **catalytic** amplification loops:

```
1× Fear  + 1× Adrenalin  →  2× Fear  + 1× Adrenalin   (reaction #38)
1× Anger + 1× Adrenalin  →  2× Anger + 1× Adrenalin   (reaction #39)
```

Because the Adrenalin is preserved by each cycle, a single pulse of Adrenalin can amplify the emotion it catches many times over before Adrenalin itself decays. Concretely:

- At rate half-life 58 ticks, approximately 1.2% of the Fear/Anger pool doubles per tick while Adrenalin is present.
- Adrenalin itself decays at half-life 209 ticks. So a single Adrenalin pulse stays in the system for roughly 3.6× the reaction half-life — plenty of time for the Fear or Anger pool to undergo several doublings.
- The amplification is **asymmetric between the two emotions**. Whichever one had the head start when Adrenalin arrived wins: if the Norn is already scared and a little bit angry, the scared state will double many times while Anger barely moves (because the Fear reaction is hitting a much larger reactant pool per tick than the Anger reaction is).

This is the game mechanism behind the observable "the more scared you get, the more scared you get" feedback loop in Creatures 3. A Norn that sees something it mildly fears will generate a little Fear. If the fear signal (or an associated stress signal) trips the Adrenalin emitter, Adrenalin floods in and the Fear begins to double per tick. The fear locus reads the Fear chemical; as the chemical grows, the drive grows; as the drive grows, the brain's behaviour lobe outputs change (flee rather than investigate, cry rather than coo). The Norn ends up in full panic from an input that only generated a small initial Fear dose.

Anger follows the same pattern, producing escalating aggression when a minor annoyance is met with an Adrenalin surge.

The **Adolescent gating** (switch-on age 2) is gameplay-significant: infants do *not* have these amplification loops. A baby Norn with Fear and Adrenalin in its bloodstream does not spiral — its emotions stay at their linear levels. Only after the creature reaches Adolescent life-stage does the amplification kick in, at which point the creature gains the capacity for intense fear and rage. Narratively, the genome is modelling the emergence of adolescent emotional volatility.

### The stress-coupled emitter

Emitter #12 on the Creature/Circulatory organ reads Locus 4 of the Circulatory tissue — one of the drive-type loci that the creature's emotional state is encoded on — and releases Adrenalin in **digital fixed-gain** bursts. The flag `DIGITAL (fixed gain)` means that as soon as the locus crosses its threshold of 128/255, the emitter fires a fixed 8/255 dose of Adrenalin each tick, regardless of how far above threshold the locus has gone. Below threshold, nothing; above threshold, a constant trickle.

This threshold-and-fixed-gain design has two clean consequences:

1. **Hysteresis-free bursts.** Adrenalin turns on and off cleanly at a defined stress level; it does not gradually ramp up as stress climbs. Either the Norn is adrenalized (stress past threshold) or it isn't.
2. **Cap on total output.** Because each tick deposits a fixed 8 units, and the chemical decays at 209-tick half-life, Adrenalin equilibrates at a steady-state concentration as long as the locus stays tripped, rather than climbing without limit. If the locus trips for 1000 ticks, Adrenalin does not reach 8000 — it plateaus in the low tens.

The emitter's Locus 4 is a circulatory drive locus wired into the creature's broader emotional readouts (the same locus block the brain reads as felt emotion). Which specific drive occupies Locus 4 varies with the genome's drive layout, but in the stock Starter Parent genome it lines up with one of the stress-valenced drives (a fear/anger/overcrowding family). Regardless of exact identity, the behavioural semantics are clear: **"when the creature is sufficiently stressed on this drive, release Adrenalin"**.

### The Movement-lobe neuroemitter

Neuroemitter #1 is a different, brain-side route to Adrenalin release. It is wired to one specific neuron — lobe 4 ("move"), neuron 37 — and whenever that neuron fires it releases a bundle of three chemicals at once:

- Adrenalin (8 units)
- Fear (5 units)
- Crowded (6 units)

The `move` lobe (index 4, token `move`) is the **Movement Detector** lobe in the Creatures 3 brain architecture. It contains neurons that activate in response to motion in specific regions of the creature's visual field. Neuron 37 is one of those motion-sensitive cells. When the Norn sees something moving in that neuron's receptive region, the neuron fires, and this neuroemitter dumps Adrenalin + Fear + Crowded into the bloodstream.

The biological logic is: **sudden motion in the field of view is a startle stimulus**, which both scares (Fear) and physiologically arouses (Adrenalin) the creature — and, through the Crowded signal, may also signal social density. Because Adrenalin is released *together with* Fear, the two chemicals hit the Reaction organ simultaneously, and reaction #38's Fear-amplification loop immediately begins doubling the small Fear pulse. Within a few seconds the startled Norn is genuinely fearful rather than just registering "something moved" — a neat implementation of the jump-scare-to-panic cascade.

Because the neuroemitter is tied to a single neuron, the amount of Adrenalin released per moment scales with how strongly that one movement detector is activating — meaning a bigger, faster, or closer moving object yields proportionally more Adrenalin, Fear, and Crowded signal.

### Half-life — short enough to be a pulse, long enough to act

Adrenalin's Medium half-life of 209 ticks (~7 s at the 30 Hz world tick) is deliberately chosen in the middle of the decay-speed spectrum:

- **Longer than the reaction half-life** (43 and 58 ticks). This means that when Adrenalin is present alongside its reaction partners, the reactions run many times before Adrenalin itself decays. The pulse has time to do substantial work.
- **Shorter than most mood chemicals**. Fear, Anger, Boredom, and related drives persist for minutes; Adrenalin persists for seconds. This ensures Adrenalin acts as a *short amplifier window* over an otherwise-slow emotional substrate — the chemical equivalent of a brief attack boost rather than a long-term change in temperament.
- **Shorter than the emitter trigger latency**. If the stress locus stays tripped for less than ~200 ticks, all the Adrenalin released during that interval will be cleared within about a second of the trigger resetting. This means Adrenalin does not linger after the stressor is gone — the creature calms down chemically about as fast as its emotional state does.

### Interaction summary

The chemistry around Adrenalin is a small but richly wired subsystem:

```
                     ┌─────────────────────────┐
                     │ Brain: move lobe, n37  │
                     └────────────┬────────────┘
                                  │ fires
                                  ▼
                        ┌───────────────────┐
  Stress locus 4 ──────▶│   Adrenalin [117] │◀───── CAOS CHEM 117 / food
   (emitter #12)        │   half-life 209   │
                        │   "Medium"        │
                        └──┬──────────┬─────┘
                           │          │
             ┌─────────────┘          └──────────────┐
             │                                       │
             ▼                                       ▼
  ┌──────────────────────┐        ┌─────────────────────────────────────┐
  │ Reaction #22         │        │ Reaction #38  (Adolescent only)    │
  │ Glycogen [4] +       │        │ Fear [158] + Adrenalin [117]       │
  │  Adrenalin [117] →   │        │   → 2× Fear + 1× Adrenalin         │
  │  8× Glucose [3]      │        │ Reaction #39                       │
  │  (Short, rate 38)    │        │ Anger [160] + Adrenalin [117]      │
  │                      │        │   → 2× Anger + 1× Adrenalin        │
  │  BOTH reactants      │        │ (catalytic; Short, rate 41)        │
  │  consumed            │        │                                    │
  └──────────┬───────────┘        └──────────────┬─────────────────────┘
             │                                   │
             ▼                                   ▼
        ┌─────────┐                        ┌──────────────┐
        │ Glucose │                        │ Fear / Anger │
        │   ↓     │                        │  drives rise │
        │ ATP via │                        │  exponentially│
        │ gene 34 │                        └──────────────┘
        └─────────┘

  Receptor #55: Organ #3 "Reaction", Somatic locus 0 ← reads Adrenalin
  (reaction-organ-wide modulator; no direct drive coupling)
```

Three chemicals enter the reaction block, one chemical (Adrenalin) is effectively "shared" between them, and the net effect is **a brief window during which the creature simultaneously burns stored carbohydrate faster and feels its current stress emotion more intensely**. This is a clean, minimalist model of the physiological fight-or-flight response.

### Practical consequences for gameplay

- **Infant Norns cannot spiral into panic or rage.** Until the Adolescent stage switches on reactions #38 and #39, a baby Norn with Fear or Anger in its bloodstream experiences those emotions linearly — at whatever level the triggering stimulus produced. No runaway amplification. This is why baby Norns in the stock genome tend to have mild, brief emotional responses compared to the intense reactions of older creatures.
- **Adolescents and adults can be destabilised by a single Adrenalin pulse.** Once amplification is online, any event that releases Adrenalin (startle from movement lobe, stress threshold trip) can turn a small Fear or Anger into an extended emotional episode. This is intentional and part of the "adolescent moodiness" feel.
- **Sustained Adrenalin exhausts Glycogen.** Reaction #22 consumes Glycogen with each burst. A Norn repeatedly stressed over a short window will burn through its Glycogen reserves and eventually be unable to do the burst-energy conversion — the creature becomes chemically "depleted" by prolonged stress. To recover, the creature must build Glycogen back up via the normal metabolic pathway (Glucose + ATP storage reactions, gene 40).
- **A CAOS `CHEM 117` injection is a gameplay lever for stress studies.** Scripts and debug commands that inject Adrenalin let modders and researchers study emotional amplification dynamics in isolation. Because Adrenalin has no direct drive receptor, injecting it alone produces no behaviour change — the creature must also have Fear or Anger for the effect to manifest. This is a useful experimental property.
- **The short half-life means adrenalin cannot be stockpiled.** An Adrenalin dose given in anticipation of a future stressor will decay away in under a minute. Adrenalin only matters when it is co-present with either Glycogen (for energy) or Fear/Anger (for amplification).
- **Movement-based startle is hardwired.** Because neuroemitter #1 is tied to a specific visual-motion neuron rather than a learned concept, Norns will always be startled by motion in that neuron's receptive field, regardless of training. Adult creatures learn to associate specific moving things with specific emotional valences, but the raw startle response is constitutional.

### Modifications and modding

Common community tweaks to the Adrenalin subsystem include:

1. **Earlier or later amplification.** Moving the switch-on age of reactions #38 and #39 from Adolescent to Baby (for more emotionally volatile infants) or to Adult (for calmer adolescents).
2. **Replacing catalytic amplification with a consuming variant.** Rewriting the reactions as `1× Fear + 1× Adrenalin → 2× Fear` (no Adrenalin recovered) limits each amplification episode to a single doubling per Adrenalin unit, damping the runaway.
3. **Adding an Adrenalin drive receptor.** Wiring a receptor that reads Adrenalin concentration onto a Creature/Circulatory locus makes the creature *aware* of its own arousal — useful for modelling explicit "I feel excited" behaviour in specialist Norns.
4. **Stronger or weaker energy burst.** Adjusting reaction #22's stoichiometry (currently `1 Glycogen + 1 Adrenalin → 8 Glucose`) changes the intensity of the stress-energy dump. A 1 → 16 Glucose version makes a single Adrenalin pulse dump an enormous amount of sugar.
5. **Decoupling Adrenalin from Fear in the startle neuroemitter.** Removing Adrenalin from neuroemitter #1 breaks the link between visual startle and physiological arousal, producing a Norn that registers motion as emotionally salient (Fear, Crowded) without the accompanying exponential amplification — a calmer but still attentive creature.
6. **Extending half-life for "chronic stress" genomes.** Raising the genomeValue from 54 to ~90 (half-life ≈1500 ticks, still "Medium" tier) makes Adrenalin persist for nearly a minute, turning stress episodes into much longer-lasting amplification windows — useful for modelling anxious personalities.

### Summary

Adrenalin is the Norn genome's **arousal amplifier**: a short-lived, digitally-released bloodstream hormone that couples stress-type drives and motion-startle neurons to two downstream consequences — a catalytic doubling loop on Fear and Anger (from Adolescent onward) and a consuming reaction that converts stored Glycogen into a large Glucose burst. It has no drive receptor of its own, so the creature does not feel "adrenalized" directly; instead, every felt effect is mediated by either an amplified emotion or an elevated blood sugar. The Medium half-life ensures each release is a short pulse rather than a persistent state, and the Adolescent gating of the emotion-amplification reactions means the full fight-or-flight feedback loop emerges only as the creature matures — a compact, behaviourally faithful implementation of the hormone's physiological role.
