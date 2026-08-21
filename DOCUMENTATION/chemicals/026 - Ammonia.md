# 026 - Ammonia

Ammonia is the creature's **primary nitrogen toxin** — the short-lived, highly-reactive intermediate produced whenever the body burns protein for energy. It is the upstream counterpart of [Urea (025)](025%20-%20Urea.md): every time reaction 21 (`2× Amino Acid → 1× Glucose + 1× Ammonia`) fires to convert amino-acid stores into usable Glucose, one unit of Ammonia is released into the bloodstream. The creature then has only one way to get rid of it — reaction 30, which couples two Ammonia with one Dissolved carbon dioxide to form one unit of Urea and one unit of Water. Ammonia is therefore the "dangerous form" of the nitrogen load; Urea is the "safe form"; and the whole nitrogen-disposal pipeline is fundamentally about converting Ammonia into Urea as fast as it is produced.

Like most core wastes in the C3 biochemistry, Ammonia has an effectively **infinite passive half-life** (~9.07 × 10¹⁰ ticks, decay rate 1.0). It does not disappear on its own. The only routes out of the body are reaction 30 (normal disposal) and direct CAOS manipulation (`CHEM` / `INJR`). Unlike Urea, however, Ammonia has an **aggressive toxicity receptor** attached to it: receptor 91 reads the Ammonia level at organ-clock-rate locus and, above threshold 22 / 256 (~9 %), dramatically accelerates the organ's internal metabolic clock. High Ammonia therefore does not simply "sit" in the body waiting to be cleared — it actively speeds up the creature's organs, burning energy faster and, if energy cannot keep up, causing organ damage. Ammonia is the toxin; Urea is the waste.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction (id 21) — protein catabolism for energy | Gene 45, Baby onwards | Standard (genome-wide) | `2× Amino Acid [13] → 1× Glucose [3] + 1× Ammonia [26]` | Medium half-life (~105 ticks, decay 0.993) — fires whenever Amino Acid is available; the creature's main "burn protein" pathway |

Ammonia has **no dedicated emitter** in the standard genome. Every unit of Ammonia in a healthy creature's body comes from reaction 21 firing as the body metabolises stored Amino Acid. External sources are of course possible via CAOS (`CHEM` / `INJR`) or via food / drug agents that inject chemical 26 directly, but these are not part of the normal metabolic design.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction (id 30) — urea synthesis (detoxification) | Gene 46, Baby onwards | Standard (genome-wide) | `2× Ammonia [26] + 1× Dissolved carbon dioxide [24] → 1× Urea [25] + 1× Water [33]` | Short half-life (~24 ticks, decay 0.971) — fires quickly whenever both reactants are present; the sole clearance pathway for Ammonia |
| 2 | Receptor 91 — organ metabolic clock-rate accelerator | Gene 150, Baby onwards | Organ / Somatic / Locus 0 (`RLOCUS_CLOCKRATE`) | Threshold **22 / 256 ≈ 9 %**, nominal 128, gain 66, analogue — output is written to every organ's clock-rate locus; above threshold, organs tick faster | Read each tick (clock-rate receptors run every frame, even before the organ's own clock fires) |
| 3 | Passive accumulation | — | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1) — Ammonia does not decay on its own; it is only removed by reaction 30 |

## Role in Game Mechanics

### Position in the nitrogen pipeline

Ammonia sits between protein catabolism (upstream) and Urea synthesis (downstream):

```
  (food → digestion → Protein → Amino Acid)
                                    │
                                    ▼
                      Amino Acid [13]  (reaction 21, Gene 45)
                                    │
                                    ▼
                      Glucose [3]  +  Ammonia [26]        ← toxic intermediate
                                    │
                                    ▼
                      Ammonia [26]  +  CO₂ [24]           (reaction 30, Gene 46)
                                    │
                                    ▼
                      Urea [25]  +  Water [33]            ← stable waste
                                    │
                                    ▼
                      (Urea / Pistle excretion loop)
```

Ammonia is the bottleneck of this chain. It has a fast input (reaction 21 fires whenever the creature burns protein) and a fast clearance (reaction 30 has half-life only ~24 ticks, faster than its own production) — but the clearance pathway only fires when CO₂ is *also* available. Any time the creature's respiration chain stalls (no Pyruvate being burned, no CO₂ being produced), Ammonia production can outpace its removal and the chemical starts to accumulate.

### The toxicity mechanism — clock-rate acceleration

What makes Ammonia genuinely dangerous in C3 — and distinguishes it from its stable downstream cousin Urea — is that it is wired to **every organ's internal clock** through receptor 91.

Each organ has its own metabolic clock (`loc_ClockRate`, default 0.5). On every engine tick the organ accumulates `myClock += loc_ClockRate`; when `myClock` reaches 1.0, the organ processes one round of its emitters, reactions, and receptors, and consumes energy to do so. A default clock-rate of 0.5 means the organ actually processes biochemistry once every two ticks.

Receptor 91 (Organ / Somatic / Locus 0 = `RLOCUS_CLOCKRATE`) reads the Ammonia concentration and, whenever it is above threshold 22, writes a signal onto the organ clock-rate locus:

- **Threshold 22 / 256 ≈ 9 %**: the receptor stays silent while Ammonia is in its normal operational range (reaction 30 usually keeps it well below this).
- **Analogue response, gain 66**: once Ammonia crosses the threshold, every unit of excess above 22 adds 66 units of clock-rate signal. Because the signal is bounded to [0, 255] and the clock-rate locus maps that to [0, 1], the receptor very quickly saturates the clock-rate output — a modest Ammonia excess of ~4 units already pushes the organ to full clock.
- **Nominal 128**: when Ammonia is *exactly* at or below threshold, the nominal baseline is written (128 / 256 = 0.5), i.e. the normal default clock rate.

The consequence is simple and severe: **high Ammonia makes all the creature's organs tick faster.** Every organ processes its reactions, emitters, and energy consumption more often per unit of game time. The organism is essentially pushed into a fever state.

### Why faster clock rates are dangerous

A faster clock rate is not cost-free. Each time an organ ticks, the engine calls `ConsumeEnergy()` against the creature's energy reserves, then processes that organ's biochemistry. If energy is available, reactions fire normally. If energy is *not* available, the organ instead takes damage:

```text
Organ Update():
myClock += loc_ClockRate
if myClock >= 1.0:
    myClock -= 1.0
    myEnergyAvailableFlag = ConsumeEnergy()
    if myEnergyAvailableFlag:
        ProcessAll()                  # reactions & emitters fire
    else:
        Injure(myDamageDueToZeroEnergy)   # organ takes damage
    ...
    ProcessReceptors(false)           # all receptors
else:
    ProcessReceptors(true)            # only clock-rate receptors
```

So Ammonia's toxicity plays out in two phases:

1. **Mild Ammonia load (just above threshold).** The creature's organs tick a little faster. They consume Glucose slightly more quickly, and their reactions (and their emitters) fire more often. The creature looks "wired" — its biochemistry simulation runs in fast-forward. This is the *fever* stage.
2. **Severe Ammonia load (well above threshold).** Clock rates saturate near 1.0, meaning organs tick *every* engine frame. Energy reserves drain rapidly. Once reserves cannot keep up, `ConsumeEnergy()` starts returning false and each organ takes `myDamageDueToZeroEnergy` of injury per tick. Because all organs are affected by the same bus (all of them have clock-rate receptors in the standard genome), this damage is **body-wide and simultaneous**. This is the *poisoning* stage.

The engine even has a special fast-path for clock-rate receptors: `ProcessReceptors(true)` updates only the clock-rate receptors in between normal organ ticks, so the clock-rate signal responds to Ammonia on *every* engine frame rather than only when the organ wakes up. This is deliberate — the designers wanted the toxicity response to be tight, not lag behind a slow organ clock.

### The coupling to respiration

Because reaction 30 requires Dissolved carbon dioxide as well as Ammonia, the entire nitrogen-disposal pipeline is tied to the respiration pipeline. If a creature's CO₂ supply falters — through starvation (no Pyruvate to burn via reaction 19), unconsciousness, extreme cold reducing organ clocks, or a mutation on any of the respiratory reactions — reaction 30 stalls even while reaction 21 continues to fire, and Ammonia starts to accumulate.

The progression of failure then looks like this:

1. Respiration slows → CO₂ drops → reaction 30 starves.
2. Amino Acid keeps being burned → reaction 21 keeps producing Ammonia.
3. Ammonia crosses threshold 22 → receptor 91 fires → organ clocks accelerate.
4. Faster organ clocks burn through Glucose reserves → respiration reactions briefly run *faster* (reaction 19 consumes more Pyruvate → more CO₂).
5. If energy holds, Ammonia is pushed back through reaction 30 and the crisis resolves. If energy runs out, organs take damage per tick and the creature's life force starts to drop.

There is a subtle feedback benefit baked into this design: because the ammonia-driven clock-rate boost accelerates *all* organ reactions (including the respiration chain that produces CO₂), a moderate Ammonia spike will briefly raise CO₂ production, which in turn accelerates reaction 30 and clears the Ammonia. The system has a built-in compensatory response — the fever is, in moderate cases, self-limiting.

### The asymmetry with Urea

It is informative to compare Ammonia and Urea as sibling nitrogen chemicals:

| Property | Ammonia [26] | Urea [25] |
|----------|--------------|-----------|
| Role | Toxic intermediate | Stable waste |
| Source | Reaction 21 (protein catabolism) | Reaction 30 (detoxification of Ammonia) |
| Clearance | Reaction 30 only | Reaction 28 + Pistle loop |
| Passive half-life | Effectively infinite (decay 1.0) | Effectively infinite (decay 1.0) |
| Toxicity receptor | **Receptor 91 — Organ / Somatic / clock-rate** | Receptor 84 — Creature / Circulatory / Locus 1 |
| Threshold | **22 (~9 %)** | 192 (~75 %) |
| Response shape | Analogue (proportional) | Digital (all-or-nothing) |
| Target | Every organ's metabolic clock | The locus-1 "vital-sign" bus (drives Pistle emission) |
| Severity | Immediate organ-wide acceleration → can cause energy crisis and injury | Triggers self-cleaning (Pistle) loop; no direct organ damage |

Ammonia is fundamentally a **low-threshold, body-wide metabolic accelerator** — a small rise is enough to trip the organ-clock response, and the response is proportional so the consequences scale smoothly with ammonia concentration. Urea, in contrast, is a **high-threshold, binary servo** — it has to reach 75 % before anything fires, and the fire-event is a clean emit-and-clear cycle with no organ damage in the standard path. The genome intentionally routes the toxic effects through Ammonia and keeps Urea as the harmless carrier.

### Consequences for breeding and life-cycle

Because the Ammonia → Urea conversion requires CO₂, and because young creatures and aged creatures alike may have weaker respiration, Ammonia can quietly be a significant contributor to the slow decline of older Norns who still eat but respire inefficiently. Newborns typically show very low Ammonia because they have not yet built up an Amino Acid pool to burn. Adolescents and adults show the characteristic "fed recently" saw-tooth: Ammonia spikes briefly after a protein-heavy meal as reaction 21 fires, and is pulled back down within a few hundred ticks as reaction 30 converts it into Urea. Old and senescent creatures may lose their ability to keep up with the conversion and drift into chronic low-grade Ammonia excess, which manifests as slight organ-clock acceleration — subtly faster organ wear, not acute poisoning.

### Mutations and scripter notes

- **Mutations on gene 45 (reaction 21).** If reaction 21 is disabled or mutated off, the creature loses its ability to burn Amino Acid for Glucose — a serious metabolic deficit — but Ammonia production effectively ceases. The creature will have zero Ammonia regardless of diet, and receptor 91 will never fire. Such a creature is immune to Ammonia poisoning but becomes dependent on reaction 22 (Glycogen + Adrenalin → Glucose) and direct Glucose intake for energy.
- **Mutations on gene 46 (reaction 30).** Disabling reaction 30 is one of the most dangerous mutations in the genome. Amino Acid catabolism still produces Ammonia, but the creature has no way to detoxify it. Every protein-containing meal pushes Ammonia further over threshold 22, accelerating every organ in the body until energy reserves collapse. Unless the creature avoids protein entirely, death by fever / organ-damage follows within a few meals.
- **Mutations on gene 150 (receptor 91).** If the receptor is weakened or removed, the creature loses its ammonia-sensitivity: organs continue to tick at their nominal rate regardless of Ammonia concentration. Counter-intuitively, such a creature is *more robust* to ammonia loads in the short term (no fever response) but loses the compensatory boost to respiration that accelerates its own clearance — so ammonia clears more slowly, and prolonged elevation accumulates unnoticed.
- **CAOS-injected Ammonia (`CHEM 26 <amount>`)** is the cleanest way to test the toxicity loop. Injecting even 30 (just above threshold) produces a visible metabolic speed-up; injecting 80+ on a creature with limited energy reserves will cause organ injury within seconds.
- **Food / drug agents** that inject Amino Acid will in turn spike Ammonia via reaction 21; agents that inject Ammonia directly are rare outside toxin / trap / biowarfare mechanics.

### Summary of the Ammonia pathway

```
           Protein → Amino Acid [13]
                         │
                         ▼
                Reaction 21 (Gene 45)
                 "burn protein for energy"
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        Glucose [3]           Ammonia [26]  ← TOXIC
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
      Receptor 91 (Gene 150)              Reaction 30 (Gene 46)
      Organ/Somatic/CLOCKRATE             "detoxify with CO₂"
      threshold 22, gain 66                      │
                     │                           ▼
                     ▼                 Urea [25] + Water [33]
            All organ clocks ↑
              (fever state)
                     │
         If energy runs out →
         Organ injury per tick
```

Ammonia therefore plays the role of the creature's **fast-acting metabolic alarm**. It is produced whenever protein is burned for energy, it is cleared rapidly whenever respiration is healthy, and it is a direct and unforgiving signal whenever either side of that balance breaks — driving the entire body into an accelerated, energy-hungry fever that either burns itself out by restoring homeostasis or burns through the creature's organs trying.
