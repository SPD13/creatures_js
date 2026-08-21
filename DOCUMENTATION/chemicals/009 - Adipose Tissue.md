# 009 - Adipose Tissue

Adipose Tissue is the creature's **long-term, high-density body-fat reserve** — the deepest and largest energy vault in the whole biochemistry. Where Fatty Acid (6) is fat ready to burn *now* and Triglyceride (8) is fat *in transit*, Adipose Tissue is fat *put away for a rainy day*: eight Triglycerides (and therefore twenty-four Fatty Acids' worth of chemical energy) compressed into a single unit. A newborn Norn is born with a very large Adipose endowment (amount 70, concentration ≈27.45 %), making it by far the richest core metabolite pool at birth — roughly four times the starting Fatty Acid and Triglyceride concentrations combined. This generous opening reserve is the creature's built-in insurance policy against a neglectful keeper or a long interval between meals.

Unlike most core metabolites (Fat, Glycogen, Starch, Cholesterol, Triglyceride, Fatty Acid, Protein, Muscle Tissue) which have an effectively infinite passive half-life, Adipose Tissue is the **only fat-branch chemical that slowly decays on its own**: genome value 88, half-life ~6045 ticks ("Long"). A creature that is neither eating nor mobilising its body-fat will therefore still lose Adipose over time — slowly, but inevitably. This small trickle of natural decay is the biochemical expression of the fact that even "idle" fat storage isn't completely free: tissue maintenance costs something. It also guarantees that Adipose concentration drifts back towards zero if the creature stops generating new body-fat, preventing infinite accumulation for creatures that are being pampered but rarely active.

Adipose has **no dietary source, no stim, and no emitter** — every molecule in the body is either endowed at birth (gene 10) or synthesised internally by reaction 10 from Triglyceride. It is removed from the body by three distinct mechanisms: normal lipolytic mobilisation (reaction 16), catastrophic enzymatic destruction by Geddonase (reaction 87), and the slow passive decay described above. Finally, Adipose concentration is read by a single very important receptor (receptor 85) that feeds into the creature's **"too skinny" starvation signalling** on the Creature/Circulatory tissue at locus 0 — the body-wide signal that the fat reserve has dropped to critical levels.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | Gene 10, Baby onwards | Systemic | Newborn endowment | Amount 70 / concentration 0.2745 (≈27.45 %) at birth — the largest starting pool of any core metabolite |
| 2 | Lipogenic condensation (reaction 10) | Gene 27, Baby onwards | Standard | `8× Triglyceride [8] → 1× Adipose Tissue [9]` | Medium, half-life ~621 ticks (decay 0.99888) — eight Triglyceride units condense into one unit of long-term body-fat. The 8 : 1 compression makes Adipose loading deliberately slow and expensive |

There is only **one synthesis pathway** for Adipose — reaction 10, which is itself one of three matched "slow build-up" reactions (7, 9, 10) that together form the creature's fat-deposition chain (Pyruvate → Fatty Acid → Triglyceride → Adipose, each step HL ≈ 621). No food item, organ emitter, stim, or CAOS event writes Adipose directly; every unit in the body came from upstream Triglyceride, which itself came from either digested dietary Fat (reaction 3) or re-condensed Fatty Acid (reaction 9). This narrow source funnel is why fat takes many thousands of ticks of consistent overfeeding to visibly accumulate — the whole pipeline is designed to prevent sudden weight gain.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Lipolytic mobilisation (reaction 16) | Gene 28, Baby onwards | Standard | `1× Adipose Tissue [9] → 8× Triglyceride [8]` | Short, half-life ~47 ticks (decay 0.98549) — unpacks one unit of Adipose into eight Triglycerides. The only normal "re-open the vault" pathway; runs ~13× faster than it was to build, giving the body its rapid starvation-response ratchet |
| 2 | Geddonase destruction (reaction 87) | Gene 75, Baby onwards | Standard | `1× Geddonase [69] + 1× Adipose Tissue [9] → 5× Glucose [3]` | Short, half-life ~24 ticks (decay 0.97120) — a catastrophic, catalytic (well, consuming) reaction driven by the Armageddon-class toxin Geddonase. Converts body-fat directly to Glucose, bypassing the normal lipolysis cascade. The dose-response is savage: in seconds of ingestion a creature can lose substantial Adipose reserves |
| 3 | Starvation signal (receptor 85) | Gene 41, Baby onwards | Creature organ, Circulatory tissue, locus 0 | DIGITAL + REDUCE (inverted, all-or-nothing), threshold 8, nominal 255, gain 255 | The body-wide "too skinny" alarm. Below an Adipose concentration of ≈3.1 % (threshold 8/256), the output fires hard (inverted digital, gain 255, nominal 255) — a full-strength systemic signal that the fat reserve is critically low. Above the threshold the output is silent. This is the lowest vital-sign trip-wire for the fat branch and pairs with the Muscle Tissue low-signal at locus 8 as the twin "wasting" alarms |
| 4 | Passive decay | — | — | Half-life ~6045 ticks (decay rate 0.99988535, "Long") | Adipose is the **only core metabolite that passively decays**. Even a completely idle, well-rested creature will slowly lose body-fat over time — about a 50 % loss every ~6045 ticks (~10 minutes real-time at 10 Hz world tick). This prevents unbounded fat accumulation and ensures Adipose tracks recent metabolic activity, not lifetime integral |

Adipose has **no drive receptors, no brain receptors, and no muscle or neuron targets**. Its single readout (receptor 85) feeds into a low-level systemic alarm channel rather than a behavioural drive — the creature does not *feel* its Adipose level the way it feels hunger for fat; instead the body simply reacts to extreme depletion with a whole-body signal that other genes can couple to life-critical responses.

## Role in Game Mechanics

### Position in the fat pipeline

Adipose is the **terminal, deepest tier** of the three-level fat hierarchy. Reading the chain from most-reactive to most-compressed:

```
        Fatty Acid (6)          free, burnable, drives β-oxidation
             │▲
   lipolysis ││ lipogenesis
   (HL 47)   ││ (HL 621)
   reaction 15│reaction 9
             ▼│
       Triglyceride (8)         mid-term storage (3 : 1 compression)
             │▲
   mobilisation││ condensation
   (HL 47)     ││ (HL 621)
   reaction 16 │reaction 10
             ▼│
       Adipose Tissue (9)       long-term storage (8 : 1 compression → 24 : 1 vs FA)
```

In terms of energy density, **one unit of Adipose is equivalent to 24 units of Fatty Acid** (8 Triglycerides × 3 Fatty Acids each). A newborn's 70 units of Adipose therefore represent roughly **1680 Fatty-Acid-equivalents** of stored chemical energy before accounting for Glycogen, Starch, Glucose or the Fatty Acid / Triglyceride pools themselves. This is why a Norn can happily survive for hours without food once hatched — the fat vault is enormous.

### The build-up vs. mobilisation asymmetry (the "ratchet")

The fat branch encodes a deliberate **metabolic ratchet**: every step of the build-up chain (Pyruvate → FA → TG → Adipose) has a half-life of ≈621 ticks, while every step of the mobilisation chain (Adipose → TG → FA → Pyruvate) has a half-life of ≈47 ticks. That is a **~13× speed asymmetry** at each level.

| Direction | Reactions | Half-lives (each step) |
|-----------|-----------|------------------------|
| Build-up  | 7, 9, 10  | 621, 621, 621 ticks    |
| Mobilise  | 16, 15, 17 | 47, 47, 52 ticks      |

For Adipose specifically, reaction 10 (build) runs at HL 621 while reaction 16 (mobilise) runs at HL 47. A starving creature can therefore unlock its fat reserve about 13× faster than an overfed creature can lay it down. In gameplay terms:

- **Weight loss is rapid.** A neglected Norn will visibly shrink — its Adipose concentration can drop from 27 % to near-zero in a few minutes of in-game time once food is gone.
- **Weight gain is slow.** Even aggressive overfeeding requires many thousands of ticks for Adipose to meaningfully rise, because the rate-limiting step (Pyruvate → FA at HL 621) is the same regardless of how many Triglycerides are being condensed.
- **Obesity is possible but hard.** Persistent overfeeding with fatty foods (which enter as Triglyceride directly, skipping the slow Pyruvate → FA step) can accelerate fat gain, which is why high-calorie pushes (eg. Cheese feeders) are the classic way to fatten a Norn.

### The full starvation cascade

When a creature is running on Adipose reserves, the mobilisation chain is:

```
  1 Adipose ──(r16, HL 47)──► 8 Triglyceride
                                    │
                                    │ reaction 15, HL 47
                                    ▼
                              24 Fatty Acid
                                    │
                                    │ reaction 17, HL 52
                                    │ (6 ADP consumed, 6 ATP produced per FA)
                                    ▼
                        192 Pyruvate + 144 ATP
                                    │
                                    │ reaction 5 (glycolysis) or used directly
                                    ▼
                            Glucose / TCA / energy
```

One unit of Adipose therefore ultimately yields ~192 Pyruvate and ~144 ATP (if fully oxidised via β-oxidation), over a composite half-life of roughly 150 ticks. That is the quantitative basis of the "body-fat keeps me alive" phenotype.

### The Geddonase pathway — catastrophic fat destruction

Reaction 87 (`1× Geddonase [69] + 1× Adipose Tissue [9] → 5× Glucose [3]`) is a **rapid, destructive shortcut** that bypasses the normal Adipose → Triglyceride → Fatty Acid → β-oxidation cascade. Geddonase is an Armageddon-class toxin (one of the C3 "doomsday" chemicals designed for dangerous foods, injectors, or emergency scripting), and when it reacts with Adipose:

- It runs **short** (HL 24), about twice as fast as normal lipolysis (HL 47).
- It converts fat **directly to Glucose** — useful energy — but at a grossly lossy ratio: one unit of Adipose yields only 5 Glucose, compared to the ~192 Pyruvate / 144 ATP of the normal oxidation path. In other words, Geddonase burns roughly **97 % of the chemical energy** of the Adipose as waste.
- Both Geddonase and Adipose are consumed 1 : 1, so a large Geddonase dose strips a matching amount of fat.

Gameplay consequences:

- Any food or drug that injects Geddonase is effectively a "rapid fat-burn" item, useful (cruelly) for thinning obese Norns or (catastrophically) for sudden starvation if used on a lean creature.
- Because the end product is Glucose, a Geddonase hit gives a short-lived, deceptive energy spike followed by a long fat-deficit afterburn. The creature may appear temporarily fine and then collapse as the starvation alarm (receptor 85) fires.
- Geddonase also produces injury on its own (it has a receptor that drives RLOCUS_INJURY via gain 6), so a Norn receiving Geddonase is simultaneously losing fat *and* taking damage — it is the quintessential "poison that eats the body".

### Receptor 85 — the body-wide skinny alarm

Receptor 85 is the sole sensor on Adipose and is tuned for **extreme depletion only**:

- **Organ/Tissue/Locus**: Creature / Circulatory / Locus 0
- **Chemical**: Adipose Tissue [9]
- **Threshold**: 8 / 256 ≈ 3.1 %
- **Nominal**: 255 (full-strength output baseline)
- **Gain**: 255 (full-strength amplification)
- **Flags**: REDUCE (inverted) + DIGITAL (all-or-nothing)

The DIGITAL + REDUCE combination gives a "trip-wire" response: above the 3.1 % threshold the receptor output is **off**; the instant Adipose falls below it, the output **snaps to 255** (full scale). This is a body-wide, full-volume signal that the fat vault is critically empty — the biochemical equivalent of a fuel-empty warning light.

The Creature / Circulatory tissue at locus 0 is one of the creature's life-critical vital-sign channels, paralleling:

- Locus 1 (Urea, threshold 192): high-urea toxicity alarm
- Locus 2 (Amino Acid, threshold 16): low-AA protein-starvation alarm
- Locus 4 (Energy, threshold 128): low-energy fatigue/unconscious alarm
- Locus 8 (Muscle Tissue, threshold 26): muscle-wasting alarm

Adipose-at-locus-0 sits alongside these as the **fat-wasting alarm** — the signal that says "this creature has exhausted its long-term fat reserve". Genes downstream of these circulatory signals can couple them to visible phenotype (pose changes, emaciated sprites), to further hunger-drive reinforcement, or to life-state transitions. In the stock C3 genome it is a gate: it quietly sits above 3.1 % Adipose for most of a creature's life, and only fires in severe neglect or prolonged starvation.

### Why Adipose decays when nothing else does

Every other core metabolite in the fat/carb/protein branches (Lactate, Pyruvate, Glucose, Glycogen, Starch, Fatty Acid, Cholesterol, Triglyceride, Fat, Muscle Tissue, Protein, Amino Acid) has an effectively infinite passive half-life (10¹⁰ ticks, decay 1.0). Adipose is the only exception:

- Half-life: 6045 ticks (~10 minutes real-time at the standard 10 Hz world tick)
- Decay rate: 0.99988535
- Speed: "Long" (but still finite)

This choice reflects a design intent: **body-fat is the one metabolite that cannot be perfectly preserved**. Biologically, fat tissue in a real organism requires continuous maintenance — vascularisation, hormonal regulation, turnover of the adipocytes themselves. Encoding a small passive decay on Adipose:

1. **Prevents infinite accumulation.** Even a creature that is constantly overfed and never stressed will eventually plateau, because lipogenic input rate (HL 621) is balanced by passive decay (HL 6045) — a ~10 : 1 ratio that caps realistic Adipose concentrations well below the 256 maximum.
2. **Ensures Adipose tracks recent activity.** A creature that is fed well, then neglected for a week of real time, will not still show "full" Adipose on return — its fat stores reflect recent history, not lifetime integral.
3. **Gives a measurable "idle burn"** even when no reaction is consuming fat. Calibrated carefully, this represents the basal metabolic cost of simply being alive.

From a gameplay perspective, this decay is slow enough that a well-cared-for Norn won't noticeably slim down between meals, but fast enough that long-term neglect always eventually bites.

### Why Adipose is born so high

The newborn Adipose concentration (70 units, 27.45 %) is **the single largest starting pool of any core metabolite** — larger than Glucose (0.5–1 %), Glycogen (a few percent), Starch, Fatty Acid (6.27 %), Triglyceride (6.27 %), Protein, or Muscle Tissue. The rationale mirrors real-world neonatal biology: babies are born with a substantial fat reserve because the first minutes-to-hours of life involve uncertain nutrition and high metabolic demand (temperature regulation, early movement, early learning).

For Norns, this starting pool translates roughly to:

- 70 Adipose × 8 Triglycerides = 560 Triglycerides latent
- 560 Triglycerides × 3 Fatty Acids = 1680 Fatty Acids latent
- 1680 Fatty Acids × (8 Pyruvate + 6 ATP) = 13 440 Pyruvate + 10 080 ATP

…enough raw metabolic substrate to keep a baby Norn alive for a long time even if the keeper is slow to introduce food. This is critical in Creatures 3 where eggs can hatch anywhere on the Shee Ark and the nearest feeder may not be for several rooms over.

### Practical consequences for gameplay

- **Obesity is Adipose-driven.** Sprites for "fat" Norns typically key on high Adipose concentration via genome-authored body-pose or tint rules, so a Norn that has been consistently overfed fat-heavy food will eventually appear visibly plumper.
- **Emaciation is Adipose + Muscle driven.** A starving Norn loses Adipose first (fast), then starts consuming Muscle Tissue (reaction 14-ish territory) as protein is cannibalised for glucose. A visibly skinny Norn is one whose Adipose has already passed the receptor-85 threshold at least once.
- **Fat content of the food matters.** Cheese, cake and other fat-heavy foods inject both Fat (10) and, via reaction 3, a spike of Triglyceride and Cholesterol. Those foods build Adipose far faster than carb-heavy foods like apples, because carb foods reach Adipose only through the full Pyruvate → FA → TG chain (three HL-621 reactions).
- **Starvation recovery is slow.** Even once a starving creature starts eating again, its Adipose won't be refilled quickly — Pyruvate → FA → TG → Adipose takes cumulative HL ≈ 621 × 3 ticks from scratch. A Norn that has bottomed out on Adipose stays vulnerable for a long time.
- **CAOS debugging.** `chem TARG 9` reads current Adipose concentration, and `CHEM 9 amount` injects directly, bypassing the build-up chain. Useful for testing the Geddonase pathway, the starvation alarm, or receptor-85-coupled downstream genes without waiting hours of wall-clock time for natural Adipose accumulation.
- **Death indirectly.** Adipose depletion does not on its own kill a Norn (receptor 85 only raises an alarm — it does not trigger the `die` script). Death from starvation in C3 is driven by Energy (locus 4) collapse, Muscle Tissue depletion (locus 8), or Glucose-driven cascade failure. Adipose is more accurately the *clock* on starvation than the cause — it tells you how long the creature has before those other systems finally give out.

### Summary of the Adipose pipeline

```
  Initial endowment (gene 10): amount 70 / concentration 27.45 %
           │
           │  reaction 10 (HL 621, 8 TG → 1 Adipose)
           ▼
  ┌──► Adipose Tissue (9) ◄─── Triglyceride (8)
  │         │
  │         │ reaction 16 (HL 47, 1 Adipose → 8 TG)
  │         ▼
  │    8× Triglyceride ──► lipolysis (r15) ──► 24× Fatty Acid
  │                                                │
  │                                                ▼
  │                                β-oxidation (r17, HL 52)
  │                                                │
  │                                                ▼
  │                              192 Pyruvate + 144 ATP
  │
  │    reaction 87 (HL 24):
  │       1 Geddonase + 1 Adipose → 5 Glucose   [catastrophic / toxin path]
  │
  │    Passive decay (HL 6045):
  │       1 Adipose → 0                         [unique among core metabolites]
  │
  └── Readout:
       receptor 85 (Creature / Circulatory / Locus 0):
         threshold 8, nominal 255, gain 255, DIGITAL + REDUCE
         → "Adipose below ~3.1 %" full-strength body-wide alarm
```

Adipose Tissue is therefore the **strategic reserve tier** of the creature's fat system: enormous at birth, slow to rebuild, fast to burn, quietly leaking over time, and monitored by a single stern alarm that fires only when the vault is almost empty. It is the Norn's version of a savings account — hard to grow, easy to spend, and the last thing standing between a hungry creature and real starvation.
