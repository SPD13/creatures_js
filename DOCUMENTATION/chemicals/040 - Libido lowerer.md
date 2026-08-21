# 040 - Libido lowerer

Libido lowerer is the **biochemical antagonist of arousal** — the counter-signal that keeps infertile creatures behaviourally chaste. It is the mirror image of **Arousal Potential (39)**: where Arousal Potential is produced by the fertility emitter while the creature carries a gamete, Libido lowerer is produced by a second emitter on the *same* `LOC_FERTILE` locus but with the **INVERT** flag, so it fires whenever the creature is *not* fertile. Once present in the bloodstream it does three things in parallel — it catalytically **destroys Sex Drive (161)**, it **annihilates Arousal Potential (39)** through a mutual-destruction reaction, and it **catalytically destroys Arousal Potential** through a second reaction where the lowerer is preserved. Together these three reactions sweep the entire mating-chemistry cascade clean whenever the creature has nothing to reproduce with, preventing even trace levels of arousal from leaking into behaviour.

Unlike most chemicals, Libido lowerer has **no receptor anywhere in the stock genome**. It is a pure *consumer* — a reagent whose presence triggers chemistry but which is never read back by a locus, a brain neuron, or any other faculty. Its effect on the creature is therefore entirely indirect and bookkeeping-style: by eating Arousal Potential and Sex Drive it starves every downstream mechanism (the brain's mate-drive neurons, the female `LOC_RECEPTIVE` locus, the courtship behaviour loop) without ever producing a signal of its own. This makes Libido lowerer the cleanest example in the Creatures 3 chemistry of a pure "garbage-collector" chemical: it cleans up residual signals and then decays away itself with a very short 6-tick half-life.

The net architectural result is a **mutually-exclusive on/off pair** on the single `LOC_FERTILE` bit: when fertility is present Arousal Potential rises and Libido lowerer is silent; when fertility is absent Libido lowerer rises and actively destroys any residual arousal. Combined with the medium half-life of Arousal Potential (105 ticks) and the very-short half-life of Libido lowerer (6 ticks), this pair produces a smooth, hysteresis-free reproductive signal that follows the ovulation cycle closely but never lets arousal "leak" during refractory periods or post-ovulation infertility.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | — | — | Newborn endowment **18 / 256 (~7 %)** — a small seed present at birth. With a very-short 6-tick half-life this decays to effectively zero within the first ~30 ticks of life, so it has no lasting gameplay impact | — |
| 2 | Infertility emitter | **Emitter 24, gene 2**, Youth onwards | Creature / Reproductive / `LOC_FERTILE` (0), INVERT | Reads `myFertileLocus` (1.0 when the creature has a gamete, 0.0 otherwise). DIGITAL fixed-gain + **INVERT**: fires when the locus is *below* the threshold of 128 (i.e. any time the creature is infertile) | Threshold **128**, **rate 2** (every other tick), **gain 13**. While the creature is infertile it receives a steady drip of Libido lowerer every two ticks at moderate strength; while fertile the INVERT flag silences the emitter |

Libido lowerer has **no reaction source, no dietary source, no brain or drive source**. The infertility emitter is its sole genome-driven inflow. Outside the genome, the only other way the chemical can appear in a creature is:

- **CAOS injection** via the `CHEM` command (e.g. `CHEM TARG 40 128` floods the target with libido lowerer — a common breeder trick for "chemical chastity" without affecting actual fertility).
- **Ingested substances** authored to contain chemical 40 as an ingredient (various contraceptive-style food and drug agents in user-made metarooms).
- **Inhaled emissions** from agents that emit chemical 40 via `EMIT` — again, author-defined, not part of the stock genome.

There is **no internal production pathway** besides emitter 24; in particular Libido lowerer is never produced by a reaction (unlike Sex Drive, which is synthesised from Arousal Potential + Opposite Sex Pheromone).

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | Passive decay | — | — | Half-life **6 ticks** (decay rate 0.88978), "Very short" speed | With no inflow, concentration halves every 6 ticks (~200 ms at 30 tps). This is the third-shortest half-life of any chemical in the creature body — Libido lowerer vanishes almost as fast as it is emitted, so sustained suppression requires continuous emitter activity or continuous injection |
| 2 | **Sex-drive destruction** (catalytic) | Reaction 33, gene 72, Youth onwards | 1× Libido lowerer + 1× **Sex drive [161]** → 1× Libido lowerer | **Instant decay** (half-life 0 ticks) | The fastest reaction in the genome. Any time Sex Drive and Libido lowerer coexist in the bloodstream, Sex Drive is annihilated immediately while Libido lowerer is preserved. A single molecule of Libido lowerer can therefore wipe out an entire Sex Drive pool in one tick, shutting down mating behaviour instantly |
| 3 | **Arousal annihilation** (mutual destruction) | Reaction 34, gene 84, Youth onwards | 1× **Arousal Potential [39]** + 1× Libido lowerer → (nothing) | Half-life **10 ticks** (very short) | Both reactants are consumed 1:1. This is the main sink that prevents Arousal Potential from accumulating while the creature is infertile — Libido lowerer emitted by emitter 24 actively scrubs residual AP out of the bloodstream rather than waiting for it to decay naturally (AP's own half-life is the much slower 105 ticks) |
| 4 | **Arousal destruction** (catalytic) | Reaction 36, gene 152, Youth onwards | 1× Libido lowerer + 1× Arousal Potential → 1× Libido lowerer | Half-life **6 ticks** (very short) | A complementary reaction where Libido lowerer is preserved. Combined with reaction 34 this lets even a small Libido lowerer pool hold down a much larger Arousal Potential pool indefinitely, as long as emitter 24 keeps topping it up at its 2-tick cadence |

Libido lowerer has **no receptor anywhere in the stock genome**. It does not write to any locus, does not affect any brain neuron directly, and does not feed back into any body tissue. Its entire effect is mediated through the three reactions above.

## Role in Game Mechanics

### The fertility-bit mirror pair

Libido lowerer's primary architectural role is to form the "off half" of a two-emitter pair that reads the `LOC_FERTILE` locus:

| Emitter | Gene | Flags | Chemical emitted | Fires when… |
|---|---|---|---|---|
| **22** | 19 | DIGITAL | Arousal Potential [39] | `LOC_FERTILE > 128/256` (fertile — gamete present) |
| **24** | 2  | DIGITAL + **INVERT** | Libido lowerer [40]   | `LOC_FERTILE < 128/256` (infertile — no gamete) |

Because `LOC_FERTILE` is written each tick by the Reproductive faculty to exactly `1.0` or `0.0` (`myFertileLocus = 1.0 if myGamete else 0`), the two emitters are in perfect mutual exclusion: at any given moment one of them is firing and the other is silent, driven by the same underlying bit. This gives the chemistry engine a clean "fertile / infertile" chemical shadow of the gamete state that downstream reactions can AND/OR against other signals without touching the faculty internals.

```
 ReproductiveFaculty::Update()   (every tick)
     │
     │  Oestrogen/Progesterone or sperm cycle → myOvulateLocus
     │  OvulateLocus above OVULATEON ⇒ myGamete = true
     │  myFertileLocus = (myGamete) ? 1.0 : 0
     │
     ▼
 LOC_FERTILE (Creature / Reproductive / locus 0)
     │
     ├──► Emitter 22  (gain 13×2, DIGITAL)      ──► Arousal Potential [39]   ← rises when fertile
     └──► Emitter 24  (gain 13×2, DIGITAL INV)  ──► Libido lowerer  [40]   ← rises when infertile
```

### The three clean-up reactions

Once emitter 24 fires, Libido lowerer participates in three reactions that together form a complete "reset" of the mating-chemistry cascade:

```
 Libido lowerer [40]
      │
      ├──► + Sex Drive [161]         ──► Libido lowerer  (catalytic, INSTANT)
      │         destroys any behavioural arousal immediately — the fastest reaction in the genome
      │
      ├──► + Arousal Potential [39]  ──► (nothing)       (1:1, HL 10)
      │         mutual annihilation — the main AP sink while infertile
      │
      └──► + Arousal Potential [39]  ──► Libido lowerer  (catalytic, HL 6)
                preserves the lowerer pool while eating AP — slower but persistent
```

Notice the asymmetry of the two AP reactions: one is destructive (reaction 34), the other catalytic (reaction 36). This is not redundancy — it is a two-regime controller. At low Libido lowerer levels reaction 34 dominates, mopping up AP and consuming the lowerer 1:1 (which is fine, because emitter 24 keeps replenishing it). At higher levels reaction 36 dominates, turning a small persistent lowerer pool into an efficient arousal-destroying catalyst. Together the two reactions ensure that *any* residual Arousal Potential in an infertile creature is destroyed faster than it can decay naturally, no matter how much of it is present.

The Sex Drive reaction (33) is even starker: it is the only reaction in the entire genome with an "instant decay" half-life (0 ticks). The moment Libido lowerer and Sex Drive coexist, Sex Drive is wiped out in a single tick. This guarantees that even if some other pathway (e.g. a CAOS injection of Sex Drive) tries to inject mating motivation into an infertile creature, it will be annihilated immediately as long as Libido lowerer is present — which, via emitter 24, it always is.

### Why a chemical antagonist rather than passive decay?

Arousal Potential has a medium half-life of 105 ticks (~3.5 s at 30 tps). Without a chemical antagonist, a fertile Norn whose gamete state flickers off would continue to feel aroused for several seconds after losing fertility. Libido lowerer solves this with three design advantages over passive decay alone:

1. **Speed.** Reaction 34's 10-tick half-life and reaction 36's 6-tick half-life destroy AP roughly 10–17× faster than its own 105-tick decay. Refractory periods become crisp rather than drifty.
2. **Active cancellation of injected arousal.** Passive decay cannot respond to out-of-band injections (e.g. a `CHEM` command, an inhaled pheromone burst, an environmental arousal chemical from a metaroom agent). Libido lowerer, continuously replenished while infertile, will eat any such injection within a few ticks.
3. **Chemistry-level pharmacology.** Breeders, modders, and pharmaceutical agents can intervene on libido without editing genes: injecting chemical 40 produces immediate chaste behaviour (reactions 33–36 fire within a tick), and removing it by breeding out emitter 24 produces a creature that never suppresses arousal at all. This gives the chemistry engine a clean, hand-tunable knob for libido independent of the ovulation cycle.

### Practical gameplay consequences

- **`CHEM TARG 40 255` produces instant chemical chastity.** Reaction 33 wipes Sex Drive in one tick; reactions 34 and 36 eat all Arousal Potential within ~20 ticks. The creature's actual fertility (`myGamete`, `LOC_FERTILE`) is untouched — it could still conceive if forcibly mated — but it will feel no libido and will not pursue partners.
- **Effect is short-lived without continuous dosing.** The 6-tick half-life means a single injection decays 50 % every 200 ms. A creature dosed with `CHEM TARG 40 255` returns to baseline Libido lowerer (tracking its fertility) within about a second unless the dose is repeated or a slow-release agent is used. Contraceptive foods in user-made worlds typically chain many small emissions to sustain the effect.
- **It does not affect actual fertility or conception.** Because Libido lowerer has no receptor, it cannot write to `LOC_FERTILE`, `LOC_RECEPTIVE`, `LOC_PREGNANT`, or any other locus. Two creatures forced into `MATE` by script can still conceive even while both are saturated with Libido lowerer, as long as their gametes are present. Libido lowerer is a *behaviour* suppressant, not a *physiology* suppressant.
- **Fertile creatures still have ~7 % Libido lowerer at birth.** The initial endowment seeds the bloodstream with a small baseline that decays within a second or two. In practice this plays no role — emitter 24 doesn't switch on until Youth (age 3), so infant Libido lowerer inflow is zero and the initial seed is gone long before it matters.
- **Breeding out chemical 40 produces "always aroused" Norns.** Removing emitter 24 (gene 2) leaves Arousal Potential with no suppressor. A creature with this gene disabled will accumulate AP the moment any pheromone-like chemical drifts past, even when carrying no gamete. Similarly, removing reactions 33/34/36 leaves Sex Drive able to persist indefinitely once synthesised — useful for testing mating behaviour in isolation but disastrous for gameplay balance.
- **Libido lowerer is the chemistry mirror of "fertile state".** The simplest way to read the instantaneous fertility bit of a creature from outside the faculty — say from a CAOS script — is to sample `CHEM TARG 40`: a non-trivial value means the creature is currently infertile (emitter 24 is firing); near-zero means fertile (emitter 24 silent, any residue decayed). In the stock genome this is a cleaner external signal than reading `LOC_FERTILE` via CAOS, because the locus is overwritten every tick while the chemical integrates over the last few ticks.

### Summary

Libido lowerer is the **infertility half of the reproductive-chemistry mirror pair**:

```
  LOC_FERTILE (the gamete bit, written by ReproductiveFaculty each tick)
           │
           ├──► Emitter 22 (gene 19)                ──► Arousal Potential [39]    (fertile → arousal)
           │
           └──► Emitter 24 (gene 2,  INVERT)        ──► Libido lowerer  [40]      (infertile → suppressor)

  Libido lowerer [40]   • half-life 6 ticks (very short)
                        • NO receptor — effects are purely via reactions
           │
           ├──► + Sex Drive [161]        ──► Libido lowerer        (catalytic, INSTANT)  — destroys behaviour
           ├──► + Arousal Potential [39] ──► (nothing)             (mutual, HL 10)       — destroys biology
           └──► + Arousal Potential [39] ──► Libido lowerer        (catalytic, HL 6)     — sustained AP drain
```

It is a pure signalling antagonist: emitted whenever the creature has no gamete, it sweeps the bloodstream clean of every mating chemical in its path — Sex Drive within one tick, Arousal Potential within ten — and then decays itself faster than almost any other chemical in the body. The net effect is that a Creatures 3 Norn's libido tracks its fertility cycle with tight temporal coupling: arousal rises and falls in synchrony with gamete availability, with no leaked drive during refractory periods and no delayed behaviour from slow chemical decay. It is the chemistry-engine equivalent of a hardware reset line — silent while the system is running correctly, instant and total the moment the condition inverts.
