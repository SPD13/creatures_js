# 046 - Oestrogen

Oestrogen is the **female reproductive cycle hormone** and the chemical clock that drives ovulation in Norns. Its concentration in the bloodstream is the sole input that decides whether a female currently carries a fertile egg (or a male carries viable sperm — the same locus wiring is used for both sexes, with the ReproductiveFaculty interpreting the gamete according to sex). Unlike most reproductive chemicals, Oestrogen is not a one-shot trigger — it is engineered to **cycle** between a low ("infertile") and high ("ovulating") level, using a self-limiting feedback loop between one emitter and one receptor, and the classical hysteresis thresholds `OVULATEOFF = 0.314` and `OVULATEON = 0.627` built into `ReproductiveFaculty::Update()`.

The cycle works as follows. When the creature is **not** fertile, `LOC_FERTILE` reads 0, and emitter 21 — configured with the `INVERT` flag — fires at fixed `DIGITAL` gain, pushing Oestrogen into the bloodstream tick after tick. Oestrogen accumulates (its medium 621-tick half-life lets it build up faster than it decays) until receptor 118 crosses its threshold (chem>50) and drives `LOC_OVULATE` above `OVULATEON`. At that moment `ReproductiveFaculty::Update()` creates a gamete (`myGamete = true`), which flips `LOC_FERTILE` to 1, which in turn (via the `INVERT`) shuts off emitter 21. With the source gone, Oestrogen decays. Once the receptor output falls back below `OVULATEOFF`, the faculty removes the gamete, `LOC_FERTILE` returns to 0, and the emitter restarts — producing **cyclic ovulation** driven entirely by the decay rate of a single chemical.

The second load-bearing role is **pregnancy suppression**. Reaction 37 destroys Oestrogen in the presence of Progesterone (chem 48) using Progesterone as an un-consumed catalyst. Since the ReproductiveFaculty itself produces Progesterone when a zygote sits in genome slot 1 (the pregnancy state), this reaction **mops up Oestrogen whenever the creature is pregnant**, preventing `LOC_OVULATE` from rising and blocking further ovulation until the pregnancy ends. This is the chemical equivalent of the real-world mechanism by which progesterone of pregnancy suppresses the menstrual cycle.

Oestrogen has **no brain receptor and no behavioural role** — it is a pure reproductive-tissue hormone. Its only consumers are receptor 118 (the ovulation driver) and reaction 37 (the pregnancy brake). It is endowed at initial concentration 65 in the genome (`Very short` initial push that bootstraps the cycle on first reaching Youth at age 3).

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **Cyclic fertility emitter** (the ovulation clock's source) | Emitter 21, gene 18, Youth onwards (age 3) | Creature / Reproductive, reads `LOC_FERTILE` | `DIGITAL (fixed gain), INVERT` — when `myFertileLocus` is below threshold 158 the emitter fires; when fertile, it stops | Rate 2, gain 3 — slow steady trickle that builds up faster than the 621-tick half-life drains it, so Oestrogen climbs whenever the creature is not already fertile |
| 2 | **Initial genome endowment** | Chemical init list | — | Starting concentration **65** at Youth switch-on | One-shot — seeds the bloodstream so the cycle begins immediately rather than waiting for the emitter to accumulate from zero |

There is no food, no stimulus, no other reaction, and no CAOS-scripted authored source for Oestrogen in the standard genome. It is a pure internal hormone produced only by the creature's own reproductive feedback loop.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Ovulation trigger** (catalytic — receptor does not consume) | Receptor 118, gene 71, Youth onwards | Creature / Reproductive → `LOC_OVULATE` (`myOvulateLocus`) | Threshold **50**, gain 255, no flags — analog linear output proportional to (chem − threshold) | Feeds the hysteresis check in `ReproductiveFaculty::Update()`. When `myOvulateLocus > OVULATEON (0.627)` a gamete is created (egg for females, sperm for males) and the creature becomes fertile; when `myOvulateLocus < OVULATEOFF (0.314)` the gamete is removed. The `255` gain gives the receptor enough headroom to swing across the 0.314–0.627 band as Oestrogen cycles |
| 2 | **Pregnancy-locked destruction** (consumed) | Reaction 37, gene 77, Youth onwards | 1× Oestrogen + 1× **Progesterone [48]** → 1× Progesterone | — | Progesterone is fully regenerated on the product side — it is a **catalyst**. The net effect is one unit of Oestrogen destroyed per reaction tick in the presence of any Progesterone. Because Progesterone is high exactly when pregnant (`GetProgesteroneLevel()` derives it from `myPregnancyLocus`), this reaction gates ovulation off during pregnancy: Oestrogen can no longer accumulate, `LOC_OVULATE` stays below `OVULATEOFF`, and no new gamete is produced until the pregnancy ends and progesterone decays |
| 3 | Passive decay | — | — | Half-life **621 ticks** (decay rate 0.99888, "Medium") | Sets the *period* of the ovulation cycle. The long half-life is deliberate — it ensures the drop from ovulating level back down through `OVULATEOFF` takes long enough to be biologically plausible, while the emitter's slow rate ensures the rise up to `OVULATEON` is also paced. Together they produce a multi-minute cycle in real time |

The chemical has **no brain-stimulus receptor** — unlike Arousal Potential (39) or Opposite Sex Pheromone (41), Oestrogen never enters the stim lobe or drives any neuron directly. Its influence on behaviour is entirely indirect: it decides whether a gamete exists, which in turn raises `LOC_FERTILE`, which in turn drives Arousal Potential emission (emitter 22, the AP source), which *then* feeds the mating-chemistry reaction chain. Oestrogen is thus one level below the behavioural chemistry — a "state" chemical, not a "drive" chemical.

## The Ovulation Cycle in Detail

The closed-loop interaction between Oestrogen, `LOC_OVULATE`, and `LOC_FERTILE` is the canonical example of **chemical hysteresis** in Creatures 3. The original engine's design comment explicitly documents the design:

> The hysteresis allows females to have cyclic ovulation — eg. oestrogen level can be caused to cycle between OVULATEOFF and OVULATEON by producing oestrogen when the `loc_fertile` emitter is off, and not producing it when it is on.

Step-by-step, starting from a just-hatched creature at age 3 (Youth — the moment the reproductive genes switch on):

1. **t=0 — Youth onset.** Oestrogen starts at 65 (genome init). `LOC_OVULATE` is well above threshold 50 almost immediately → `myOvulateLocus` crosses `OVULATEON` → `myGamete` is set true (first egg/sperm produced) → `LOC_FERTILE = 1`.
2. **Fertility phase.** `LOC_FERTILE = 1` inverts emitter 21 **off**. No new Oestrogen enters the blood. The existing pool decays with 621-tick half-life. During this window the creature is fertile and — via the Arousal Potential chain — can mate.
3. **Decay phase.** Oestrogen drops. Once `myOvulateLocus` falls below `OVULATEOFF (0.314)` the faculty removes `myGamete`. The creature becomes infertile. `LOC_FERTILE = 0`.
4. **Rebuilding phase.** `LOC_FERTILE = 0` re-enables emitter 21. Oestrogen trickles back in at rate 2, gain 3. It accumulates slowly until the cycle returns to step 2.

A successful mating interrupts this cycle: when the egg is fertilised and a zygote lands in genome slot 1, `IsPregnant()` returns true, `myPregnancyLocus` rises to 1.0, and Progesterone is produced (its own emitter reads `LOC_PREGNANT`). The Progesterone + Oestrogen → Progesterone reaction then chews through any remaining Oestrogen, holding the cycle at "infertile" until pregnancy ends.

## Genome Initial Concentration

The 65/255 initial concentration (`biochemistry.json:8130-8135`) is set so that a freshly grown youth *immediately* has a fertile ovulation window, rather than waiting the ~400 ticks it would take emitter 21 to accumulate that much from zero. Without this priming the creature's first fertile window would be delayed to well into Youth, reducing effective breeding lifespan. This mirrors the logic on chem 48 (Progesterone), which uses the same 50/255 priming trick for symmetric reasons.

## Key Source References

- `biochemistry.json` receptor 118 (line 5575) — Oestrogen → `LOC_OVULATE`
- `biochemistry.json` emitter 21 (line 7458) — `LOC_FERTILE` (inverted) → Oestrogen
- `biochemistry.json` reaction 37 (line 1204) — pregnancy-locked destruction by Progesterone
