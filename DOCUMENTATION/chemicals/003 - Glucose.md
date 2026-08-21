# 003 - Glucose

Glucose is the creature's **blood sugar** — the first-tier, easily-burned fuel that every other carbohydrate pathway funnels into or out of. It is the immediate output of digestion (Starch → Glucose), the immediate input of glycolysis (Glucose → Pyruvate → ATP + Energy), and the reversible counterpart of Glycogen, the body's short-term carbohydrate store. Biologically it mirrors real-world glucose: rising after a meal, falling during exertion or starvation, buffered by the glycogen reservoir, and driving both the creature's energy supply and several homeostatic feedback loops.

Glucose sits one step "upstream" of Pyruvate in the metabolic chain. Where Pyruvate is the central junction that feeds aerobic respiration, Glucose is the **fast-access carbohydrate tank** that feeds Pyruvate. It is produced from four different sources — dietary Starch, stored Glycogen (both ordinary and adrenalin-triggered), spare Pyruvate (gluconeogenesis), and catabolised Amino Acids — and it is disposed of in two directions: burned into Pyruvate for energy, or packed back into Glycogen for storage. Several drugs and toxins also operate on this flow (Geddonase, Glycotoxin, Dehydrogenase), making Glucose one of the most heavily "trafficked" chemicals in the biochemistry.

Like Pyruvate, Glucose has no dedicated emitter and an effectively infinite half-life (~9 × 10¹⁰ ticks, decay rate 1): every molecule persists until a reaction consumes it. It does, however, have **five receptors**, four of which are reaction-rate feedback loops on the "Reaction" organ (regulating Glycogen / Pyruvate / Fatty-Acid turnover) and one of which is a **sensorimotor receptor** wired to an involuntary action — the creature literally faints / drops when blood sugar falls too low. The standard genome seeds a newborn with 48/255 (~0.188 concentration) of Glucose so glycolysis can start producing Pyruvate and ATP from tick 0.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction 4 (digestion) | Gene 26, Baby onwards | Standard (genome-wide) | `1× Starch [5] → 4× Glucose [3]` | Medium half-life ~255 ticks (decay 0.997) — the main dietary source: starchy food gets broken down into a steady Glucose pulse |
| 2 | Chemical reaction 14 (glycogenolysis) | Gene 42, Baby onwards | Standard (genome-wide) | `1× Glycogen [4] → 6× Glucose [3]` | Short half-life ~47 ticks (decay 0.985) — fast mobilisation of stored sugar when Glucose runs low |
| 3 | Chemical reaction 22 (adrenalin-boosted glycogenolysis) | Gene 38, Baby onwards | Standard (genome-wide) | `1× Glycogen [4] + 1× Adrenalin [117] → 8× Glucose [3]` | Short half-life ~43 ticks (decay 0.984) — fight-or-flight sugar dump: Adrenalin yields a *larger* (×8 vs. ×6) Glucose release from the same Glycogen |
| 4 | Chemical reaction 8 (gluconeogenesis) | Gene 35, Baby onwards | Standard (genome-wide) | `2× Pyruvate [2] + 2× ATP [35] → 1× Glucose [3] + 2× ADP [36]` | Medium half-life ~621 ticks (decay 0.999) — ATP-powered rebuilding of Glucose from Pyruvate when Glucose is low |
| 5 | Chemical reaction 21 (amino-acid catabolism) | Gene 45, Baby onwards | Standard (genome-wide) | `2× Amino Acid [13] → 1× Glucose [3] + 1× Ammonia [26]` | Medium half-life ~105 ticks (decay 0.993) — spare Amino Acid is converted to Glucose (and ammonia waste) when other fuel is scarce |
| 6 | Chemical reaction 87 (Geddonase slimming drug) | Gene 75, Baby onwards | Standard (genome-wide) | `1× Geddonase [69] + 1× Adipose Tissue [9] → 5× Glucose [3]` | Short half-life ~24 ticks (decay 0.971) — the drug path that dissolves fat storage straight into Glucose |
| 7 | Chemical reaction 88 (Glycotoxin poisoning) | Gene 78, Baby onwards | Standard (genome-wide) | `1× Glycotoxin [70] + 1× Glycogen [4] → 4× Glucose [3] + 4× Coldness [152]` | Short half-life ~24 ticks (decay 0.971) — a toxin that raids the Glycogen store for Glucose and dumps Coldness as a side-effect |
| 8 | Chemical reaction 90 (alcohol metabolism) | Gene 81, Baby onwards | Standard (genome-wide) | `2× Alcohol [75] + 1× Dehydrogenase [116] → 1× Glucose [3] + 1× Pain [148]` | Short half-life ~21 ticks (decay 0.968) — alcohol broken down by Dehydrogenase yields a small Glucose payoff plus Pain |
| 9 | Initial concentration | Gene 3 | Standard (genome-wide) | — | Baby creatures spawn with 48/255 (~0.188) Glucose so glycolysis can start feeding Pyruvate immediately |

Glucose has **no emitter** in the standard genome. Every molecule either comes from one of the reactions above or is injected externally via CAOS (`CHEM`, `INJR`, consumable agents such as food).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Chemical reaction 18 (glycolysis) | Gene 34, Baby onwards | Standard (genome-wide) | `1× Glucose [3] + 2× ADP [36] → 2× Pyruvate [2] + 2× ATP [35]` | Short half-life ~52 ticks (decay 0.987) — the primary consumer: every unit of Glucose becomes two units of Pyruvate + 2 ATP, feeding aerobic respiration |
| 2 | Chemical reaction 6 (glycogenesis) | Gene 41, Baby onwards | Standard (genome-wide) | `6× Glucose [3] → 1× Glycogen [4]` | Medium half-life ~621 ticks (decay 0.999) — 6:1 storage of excess Glucose into Glycogen for short-term reserves |
| 3 | Receptor 25 (reaction-rate feedback, inverted) | Gene 20, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 225 / threshold 51 / gain 130 / flags: REDUCE (invert) | Strong *negative* feedback: as Glucose rises above threshold 51 the linked reaction is throttled down — a brake on continued Glucose production |
| 4 | Receptor 33 (reaction-rate feedback) | Gene 32, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 191 / threshold 26 / gain 153 / flags: none | Moderate positive feedback: plenty of Glucose accelerates a reaction (typically a consumer such as glycogenesis or glycolysis) |
| 5 | Receptor 45 (reaction-rate feedback, inverted) | Gene 30, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 217 / threshold 25 / gain 255 / flags: REDUCE (invert) | Maximum-gain *negative* feedback: high Glucose strongly suppresses another reaction — the dominant brake that prevents run-away Glucose synthesis when the tank is full |
| 6 | Receptor 54 (reaction-rate feedback) | Gene 28, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 207 / threshold 64 / gain 112 / flags: none | Moderate positive feedback that only kicks in above a fairly high threshold (64), i.e. only when Glucose is genuinely abundant |
| 7 | Receptor 74 (involuntary faint / collapse) | Gene 97, Baby onwards | Creature / Sensorimotor, LOC_INVOLUNTARY6 | nominal 128 / threshold 13 / gain 255 / flags: REDUCE, DIGITAL | **Low-blood-sugar collapse**: when Glucose falls below 13/255 the inverted+digital receptor slams an involuntary action to maximum — the creature's sensorimotor layer fires a collapse/faint behaviour. This is the in-game representation of hypoglycaemic shock |
| 8 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1) | Glucose does not decay naturally; any unconverted Glucose sits in the bloodstream until a reaction consumes it or it is removed externally |

## Role in Game Mechanics

### The dietary first step

Glucose is the chemical signature of "having just eaten". The genome's digestion reaction (reaction 4) takes `Starch [5]` — the raw carbohydrate delivered into the bloodstream by food-eating CAOS scripts — and quadruples it into Glucose. Because Starch's own decay is also medium-slow, feeding a creature produces a smooth rising curve of Glucose over a few hundred ticks rather than a single spike. From the player's point of view, "full creature" = high Glucose, and every other energy chemical in the body eventually traces back to this number.

### Two-level carbohydrate storage: Glucose ↔ Glycogen

The pair of reactions **6** (`6× Glucose → 1× Glycogen`) and **14** (`1× Glycogen → 6× Glucose`) implement the same reversible storage loop that real physiology calls the glycogen cycle. The 6:1 ratio means Glycogen is a dense, slow-access reservoir: it takes six units of Glucose to stash one unit of Glycogen, but breaking that one unit back down yields six units of Glucose again in a short half-life of only 47 ticks. Combined with reaction 22 (`Glycogen + Adrenalin → 8× Glucose`), this gives the creature three modes of sugar mobilisation:

- **Slow refill from food**: Starch → Glucose (reaction 4)
- **Medium-speed home stores**: Glycogen → 6 Glucose (reaction 14)
- **Emergency stress dump**: Glycogen + Adrenalin → 8 Glucose (reaction 22)

The Adrenalin variant is particularly important: it is *more* efficient (×8 vs. ×6) and is specifically gated on the stress-signalling chemical, so frightened / angry / fleeing creatures literally get a bigger sugar injection than calm ones. This is the genome's fight-or-flight hook.

### The glycolysis bottleneck

All Glucose ultimately flows through reaction 18 (`Glucose + 2 ADP → 2 Pyruvate + 2 ATP`) — the glycolysis analogue. This is the *only* place Glucose is directly burned as fuel (glycogenesis just parks it for later, the receptors only adjust rates). The short half-life of ~52 ticks means Glucose is a "fast-turnover" fuel: once it is produced, it is either banked into Glycogen or consumed into Pyruvate within at most a minute or two of real time. Downstream, reaction 19 burns that Pyruvate with Oxygen into Energy + CO₂, and reaction 20 turns the Energy into ATP. The full fuel chain is therefore:

```
Starch ─► Glucose ─► Pyruvate ─► Energy ─► ATP
  (r4)      (r18)       (r19, +O2)  (r20)
```

Glucose is the *second* link in this chain and the first one that the feedback receptors regulate heavily — it is where the genome decides "should I burn this, or stash it?".

### The low-blood-sugar faint (Receptor 74)

Receptor 74 is the most gameplay-visible Glucose receptor. It is unique among Glucose receptors in that it does *not* sit on the Reaction organ; it sits on the **Creature / Sensorimotor** tissue at `LOC_INVOLUNTARY6`, i.e. it drives one of the creature's involuntary motor actions. Its parameters are:

- **threshold 13** — must be *below* this to fire (REDUCE flag inverts the comparison)
- **gain 255** — maximum possible gain
- **DIGITAL** — the output is all-or-nothing

The effect is a hard hypoglycaemic trigger: as long as Glucose stays above ~5 % concentration the receptor is silent, but the moment it drops below that floor the receptor slams an involuntary collapse action to full strength. Players who starve a creature long enough will see it faint / stagger / die from this receptor firing well before any other metabolic damage shows up — it is the in-game punishment for letting blood sugar fall below a critical level.

### The four-receptor Reaction feedback network

The other four Glucose receptors (25, 33, 45, 54) all sit on the "Reaction" organ's Somatic tissue at Locus 0, meaning each one modulates a specific chemical-reaction rate. Their combination forms a multi-threshold regulator:

- **Receptor 54** (threshold 64, positive): only fires when Glucose is genuinely high (~25 %+). Used to *accelerate* a reaction that should speed up when sugar is abundant — typically glycogenesis (storage) or glycolysis (faster burning when fuel is plentiful).
- **Receptor 25** (threshold 51, REDUCE, gain 130): once Glucose exceeds ~20 %, *slow down* another reaction (typically one that would produce more Glucose, such as gluconeogenesis or starch digestion).
- **Receptor 45** (threshold 25, REDUCE, gain 255): the highest-gain Glucose receptor. Even moderate Glucose levels (~10 %) strongly *suppress* another reaction — this is the primary brake on overproduction.
- **Receptor 33** (threshold 26, positive, gain 153): mirrors receptor 45 in shape but with normal (not inverted) flags, so it *boosts* a different reaction at the same moderate threshold — likely glycolysis, so the creature burns sugar faster once there is enough to burn.

Together these four form a set of "if sugar is low / medium / high" rules that shift the body between **hoard** and **burn / store** modes automatically, without needing any brain-level input. This is why a creature's base metabolism stays stable across very different diets: as soon as Glucose drifts out of its comfort band, one or more of these receptors kicks in to push it back.

### Why Glucose never decays on its own

Like Pyruvate, Glucose's half-life of 255 (→ decay rate 1.0) makes it effectively non-decaying. This is intentional: Glucose is a **substrate**, not a signal. If it decayed naturally, the creature would lose dietary energy to background noise and could starve while still apparently well-fed. By letting it persist indefinitely, the designers guarantee every unit of Starch / Glycogen / Pyruvate the creature processes is accounted for — it is either burned for ATP, stored as Glycogen, or pushed into fat synthesis via Pyruvate, but never simply vanishes.

### Drugs and toxins that manipulate Glucose

Several pharmaceutical / toxic chemicals hook directly into the Glucose system:

- **Geddonase** (reaction 87): a "slimming drug" that converts stored Adipose Tissue into Glucose (1 Geddonase + 1 Adipose → 5 Glucose). This bypasses the normal fat → triglyceride → fatty acid → pyruvate → glucose chain, effectively teleporting fat reserves back into usable blood sugar.
- **Glycotoxin** (reaction 88): a toxin that raids Glycogen for Glucose and produces Coldness as a side-effect (1 Glycotoxin + 1 Glycogen → 4 Glucose + 4 Coldness). Useful for attacking a creature's long-term carbohydrate reserves while inflicting environmental damage.
- **Alcohol + Dehydrogenase** (reaction 90): alcohol metabolism produces a small Glucose payoff (2 Alcohol + 1 Dehydrogenase → 1 Glucose + 1 Pain). Drinking therefore provides a trickle of sugar at the cost of Pain.

All three pathways make Glucose a more strategically interesting chemical than "just food energy": it can be attacked, boosted or leaked via items and injections to push the creature into specific metabolic states.

### Practical consequences for gameplay

- **Feeding** a hungry creature raises Starch, which reaction 4 converts to Glucose over ~255 ticks, which reaction 18 then feeds into Pyruvate within ~52 ticks more. The cascade restores ATP over the order of a few in-game minutes.
- **Starvation**: first Starch runs out, then Glucose slowly falls as glycolysis and glycogenesis continue to drain it, then Glycogen is broken down to top Glucose back up. Once Glycogen is also depleted, Glucose starts to fall sharply — and when it reaches ~13/255, receptor 74 fires the faint / collapse action.
- **Stress response**: any Adrenalin spike (fear, fight, pain) activates reaction 22, converting Glycogen to a *bigger* Glucose dump than normal. This is why frightened creatures briefly get a burst of energy before crashing.
- **Overfeeding**: sustained high Glucose triggers both glycogenesis (reaction 6) — locking sugar into Glycogen — and, further downstream via Pyruvate, fatty-acid synthesis, leading to Adipose Tissue gain.
- **CAOS-level tweaks** can inject or drain Glucose directly with `CHEM`, useful for stress-testing a genome's hunger / faint / storage responses without having to feed real food agents.

### Summary of the Glucose loop

```
    Starch ─(r4)──────────┐
    Glycogen ─(r14)───────┤                 (r6)
    Glycogen+Adrenalin ─(r22)─┤  ┌──────► Glycogen  (storage)
    Pyruvate+ATP ─(r8)────┤     │
    Amino Acid ─(r21)─────┤     │
    Adipose+Geddonase ─(r87)────┤
    Glycogen+Glycotoxin ─(r88)──┤
    Alcohol+Dehydrog. ─(r90)────┤
                                 ▼
                              Glucose  (persistent; initial 0.188)
                                 │
                    ┌────────────┼────────────┐
                    │                         │
                 (r18) +ADP              (r6) 6:1
                    │                         │
                    ▼                         ▼
              Pyruvate + ATP             Glycogen
              (→ Energy → ATP)          (short-term reserve)

 Rate feedback: 4 Reaction-organ receptors (25, 33, 45, 54) balance production vs. consumption.
 Safety net:    Receptor 74 on Sensorimotor triggers involuntary collapse when Glucose < 13/255.
```

Glucose therefore occupies the layer between food and Pyruvate: it is where the creature's digestion, glycogen reserves, gluconeogenesis, amino-acid spillover, and several drugs / toxins all converge, and from which every unit of burnable energy has to pass before it can become ATP. Keeping it in its healthy band (roughly 25–50 out of 255) is the single most important homeostatic job the genome has to do — which is why it is the most-receptor-regulated metabolic chemical after ATP itself.
