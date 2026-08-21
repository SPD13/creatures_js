# 112 - Anabolic steroid

Anabolic steroid is the **exercise-driven muscle-growth hormone**. It is the biochemical bridge between *physical activity* and *muscle tissue synthesis*: every time a creature moves a limb, a small pulse of Anabolic steroid is released into the bloodstream, and that hormone then catalyses the conversion of Amino Acid into Muscle Tissue inside the Reaction organ. The more a creature exercises, the more Anabolic steroid it produces, the more muscle it grows — a direct mechanical-to-metabolic feedback loop that mirrors real-life use-it-or-lose-it muscle physiology.

Crucially, the emitter that produces Anabolic steroid is wired to `LOC_MUSCLES` — a locus whose comment reads *"amount of energy expended by movement this tick"*. The locus is **reset to zero every tick** and incremented by `1/256` for every limb that changes pose this tick. So Anabolic steroid is **not** produced by the mere presence of muscle mass — it is produced by *instantaneous mechanical work*. A sleeping, dead, or utterly still creature produces **zero** Anabolic steroid; a creature walking, turning, climbing, or gesturing produces a steady trickle; a creature running hard with all limbs moving produces substantially more.

Anabolic steroid has **no brain receptor and no direct behavioural effect** — it is a pure somatic hormone whose entire purpose is to gate the muscle-building reaction. The long half-life (13 341 ticks, "Very long") ensures that a burst of activity continues to build muscle for many minutes afterwards, smoothing the feedback so creatures don't need to move continuously to keep growing.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **Exertion-driven emitter** — the only endogenous source of Anabolic steroid | Emitter 43, gene 34, Baby onwards (age 0) | Creature / Somatic, reads `LOC_MUSCLES` (`myMusclesLocus`) | Threshold **0**, no flags — fires proportionally to the locus value. The locus is incremented by `1/256` per moving limb per tick and **reset to 0 every tick**, so it encodes *this-tick exertion* rather than accumulated work | Rate **32**, gain **13** — a moderate, analog signal. A creature that moves one limb per tick emits at ~`(1/256) × 13 = 0.05` chemical per half-cycle; a creature moving every limb (≈5-6 body parts including dirn/head/legs/arms/tail) emits ~5-6× that. The high emission rate combined with the very long half-life means even light activity accumulates useful hormone pools |

There is **no initial concentration** in the genome — every creature starts life with zero Anabolic steroid and must earn it through movement. There is no food source, no stimulus source, no reaction producing it, and no CAOS-scripted source in the standard genome. It is a pure activity-driven hormone.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Muscle-synthesis catalyst** — the only consumer | Reaction 5, gene 55, Baby onwards | Reaction organ | `1× Anabolic steroid [112] + 4× Amino Acid [13] → 1× Muscle Tissue [11]` | Anabolic steroid is both a **substrate** (consumed 1:1) and the *gating* signal for muscle tissue creation. The reaction cannot run without it, so Amino Acid cannot become Muscle Tissue until the creature has exercised. Reaction half-life is 621 ticks ("Medium"): fast enough that a short burst of steroid drains quickly into the muscle pool once amino acids are available. The 4:1 Amino-Acid-to-Muscle stoichiometry makes muscle synthesis protein-expensive — exercise alone is not enough, the creature must also have eaten |
| 2 | **Reaction catalyst gate** (receptor, not consumption) | Receptor 32, gene 23, Baby onwards | Reaction organ / Somatic / Locus 0 | Threshold **2**, nominal 169, gain **87**, **DIGITAL (all-or-nothing)** | This is the receptor that reads Anabolic steroid on the Reaction organ and enables Reaction 5. The `DIGITAL` flag with low threshold 2 means the reaction switches **fully on as soon as Anabolic steroid exceeds 2** and runs at its configured rate regardless of how much more hormone is present. In other words: any meaningful exercise unlocks maximum-rate muscle synthesis; more exercise does not build muscle faster, it just keeps the reaction running longer. Nominal 169 is the original engine's receptor-output midpoint reference but has no effect given the DIGITAL flag |
| 3 | Passive decay | — | — | Half-life **13 341 ticks** (decay rate 0.99994804, "Very long") | Equivalent to ~7.4 minutes of real time at 30 ticks/second, one of the longest half-lives in the biochemistry. Sustains the muscle-building window long after exercise stops: a short burst of activity continues to synthesise muscle for several minutes afterwards. This is what turns Anabolic steroid from a per-tick gating signal into a **smoothed activity history** — muscle growth tracks the moving average of exertion, not the current tick |

There is **no reaction** that destroys Anabolic steroid beyond Reaction 5 itself (which consumes 1 unit per muscle-tissue unit produced). No antagonist hormone mops it up; no catabolic counterpart exists in the standard genome (chemical 113, "Pistle", is an unrelated thermoregulatory signaller despite the pair-of-steroids naming that would be expected in real endocrinology).

## The Exercise-to-Muscle Feedback Loop

The full causal chain from movement to muscle is:

1. **Movement** — the skeleton's decision-tree receives a new target pose from the brain. For every limb whose pose has to change this tick, the skeleton increments `myMusclesLocus` by `LOC_MUSCLES_INCREASE = 1/256`.
2. **Locus read** — at the end of the tick, emitter 43 samples `myMusclesLocus` via the `LOC_MUSCLES` alias on the Creature organ. The value is proportional to the number of limbs moved this tick (capped at ≈6/256 for "all body parts moving").
3. **Hormone release** — the emitter deposits Anabolic steroid into the bloodstream at rate 32, gain 13, scaled by the locus value. A creature moving every limb every tick can emit several units of Anabolic steroid per second of real-time play.
4. **Reset** — `myMusclesLocus` is zeroed at the start of the next tick's skeleton update, so the locus encodes *only this-tick exertion* and never accumulates.
5. **Receptor activation** — on the Reaction organ, receptor 32 sees Anabolic steroid > 2 and flips the DIGITAL gate fully open, enabling Reaction 5.
6. **Muscle synthesis** — Reaction 5 begins converting Amino Acid to Muscle Tissue at 1:4:1 stoichiometry, consuming one Anabolic steroid per output unit. The reaction runs as long as steroid stays above the threshold and amino acids are available.
7. **Decay** — without continued movement, Anabolic steroid decays with its 13 341-tick half-life. After ~7 minutes of stillness, half the steroid is gone; after ~15, the reaction finally starves.

The loop is **self-regulating**: more movement → more steroid → more muscle synthesis, capped by the DIGITAL flag (no over-drive from hyperactivity) and by amino-acid availability (no muscle without food protein).

## Interaction With Feeding and Nutrition

Reaction 5 is the **only** non-gluconeogenic pathway to Muscle Tissue in the standard genome. Anabolic steroid is therefore the key that unlocks how a creature's protein intake (Amino Acid, from eating food and digesting Protein via other reactions) is converted into usable body mass. Without exercise, ingested protein is shunted elsewhere — primarily stored as adipose via fat-metabolism reactions, or excreted as Urea / Ammonia. With exercise, the same protein intake builds muscle.

The 4:1 Amino-Acid-to-Muscle ratio also means that a sedentary creature who eats a lot will **gain fat, not muscle**, while an active creature who eats lightly will simply fail to grow muscle (no substrate). Balanced exercise + feeding is required.

## Why DIGITAL and Why So Long a Half-Life?

The design choice to make the Reaction-organ receptor DIGITAL with threshold 2 rather than linear is deliberate: it prevents hyperactive creatures from over-producing muscle, and it ensures that any non-trivial amount of exercise is enough to unlock the full muscle-building pathway. A creature doesn't need to exercise *more* to build muscle faster — it needs to exercise *at all*. This matches the intent of the hormone as an on/off gate rather than a throttle.

The very long half-life is the flip side: once the gate is open, muscle synthesis should persist through normal resting periods. A creature that takes a break, eats, then rests shouldn't immediately lose the benefit of its recent exertion. The 7-minute half-life ensures that realistic life-rhythms (hunt → eat → rest → hunt) all continue to build muscle as long as exercise happens at least occasionally.

## Comparison With Other Somatic Hormones

| Chemical | Role | Driving locus | Consumer | Half-life |
|----------|------|---------------|----------|-----------|
| **Anabolic steroid (112)** | Muscle synthesis | `LOC_MUSCLES` (exertion/tick) | Reaction 5 | 13 341 ticks (Very long) |
| Upatrophin (18) | Body-scale growth up | Age / life-stage | Growth reactions | — |
| Downatrophin (17) | Body-scale growth down | Age / life-stage | Growth reactions | — |
| Muscle Tissue (11) | The actual tissue | — | Passive decay + energy reactions | — |

Anabolic steroid is unique among the endocrinology in being driven not by life-stage, drive, or external stimulus but by **mechanical behaviour itself**. It is the clearest example of the Creatures 3 design principle that "biochemistry senses behaviour": the body builds itself in response to what the creature does, not what it is told to do.

## Key Source References

- `biochemistry.json:148-180` — Reaction 5 (`1× Anabolic steroid + 4× Amino Acid → 1× Muscle Tissue`), gene 55
- `biochemistry.json:3940-3958` — Receptor 32 (Reaction organ gate), gene 23, DIGITAL threshold 2
- `biochemistry.json:7875-7893` — Emitter 43 (exertion-driven), gene 34, `LOC_MUSCLES` → Anabolic steroid
- `biochemistry.json:8520-8527` — Half-life 13 341 ticks (Very long), no initial concentration
