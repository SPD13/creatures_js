# 004 - Glycogen

Glycogen is the creature's **short-term carbohydrate reservoir** — the dense, slow-access counterpart of Glucose. Where Glucose is the "blood sugar" that the creature actually burns for energy, Glycogen is the warehouse that Glucose is packed into when it is abundant and drawn from when it is scarce. Biologically it mirrors real-world glycogen: a polysaccharide that the liver and muscles stockpile after meals and mobilise during exertion, fasting or stress. In the Creatures 3 genome it is the hinge between "I have eaten recently" (Starch → Glucose → Glycogen) and "I am running on reserves" (Glycogen → Glucose → Pyruvate → ATP).

Glycogen sits one step "off-path" from the main energy chain. It is not consumed directly by glycolysis; instead it exists purely as the buffer in the reversible **Glucose ↔ Glycogen** loop. The genome provides one storage reaction (6:1 packing of Glucose into Glycogen) and three release reactions (plain mobilisation, Adrenalin-boosted mobilisation, and a toxin-driven raid), giving the creature a small, well-regulated store that can be drawn down in three different modes depending on circumstance. The stored 6:1 ratio is what makes Glycogen a *dense* reservoir: a single unit of Glycogen, when broken back down, regenerates six units of Glucose — and eight under stress.

Like Glucose and Pyruvate, Glycogen has no dedicated emitter and an effectively infinite half-life (~9 × 10¹⁰ ticks, decay rate 1): every unit of Glycogen persists until a reaction burns it back into Glucose. It has **two receptors**, both on the "Reaction" organ's Somatic tissue at Locus 0 — there is no sensorimotor / brain-level receptor for Glycogen, meaning the creature cannot directly "feel" its carbohydrate stores; it can only feel the Glucose that flows out of them. The standard genome seeds a newborn with 34/255 (~0.133 concentration) of Glycogen so the creature has a small cushion of sugar reserves from tick 0.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction 6 (glycogenesis) | Gene 41, Baby onwards | Standard (genome-wide) | `6× Glucose [3] → 1× Glycogen [4]` | Medium half-life ~621 ticks (decay 0.999) — the sole production path: six units of blood sugar are packed into one dense unit of stored Glycogen |
| 2 | Initial concentration | Gene 8 | Standard (genome-wide) | — | Baby creatures spawn with 34/255 (~0.133) Glycogen so they have a small carbohydrate reserve from birth |

Glycogen has **no emitter** in the standard genome and **no other production reaction**: it can only be built from Glucose. Every unit of Glycogen in the creature's body was either present at birth, synthesised from excess Glucose after eating, or injected externally via CAOS (`CHEM`, `INJR`, consumable agents).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Chemical reaction 14 (glycogenolysis) | Gene 42, Baby onwards | Standard (genome-wide) | `1× Glycogen [4] → 6× Glucose [3]` | Short half-life ~47 ticks (decay 0.985) — the baseline mobilisation path: one unit of Glycogen is rapidly broken back down into six units of Glucose when blood sugar is low |
| 2 | Chemical reaction 22 (adrenalin-boosted glycogenolysis) | Gene 38, Baby onwards | Standard (genome-wide) | `1× Glycogen [4] + 1× Adrenalin [117] → 8× Glucose [3]` | Short half-life ~43 ticks (decay 0.984) — fight-or-flight sugar dump: Adrenalin yields a *larger* (×8 vs. ×6) Glucose release from the same Glycogen |
| 3 | Chemical reaction 88 (Glycotoxin poisoning) | Gene 78, Baby onwards | Standard (genome-wide) | `1× Glycotoxin [70] + 1× Glycogen [4] → 4× Glucose [3] + 4× Coldness [152]` | Short half-life ~24 ticks (decay 0.971) — a toxin that raids the Glycogen store for a *smaller-than-normal* Glucose payoff (×4 vs. ×6) and dumps Coldness as a side-effect |
| 4 | Receptor 34 (reaction-rate feedback, inverted) | Gene 134, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 191 / threshold 34 / gain 229 / flags: REDUCE (invert) | Strong *negative* feedback: once Glycogen exceeds ~13 % concentration the linked reaction (typically further glycogenesis) is throttled down — the brake that prevents the store from overfilling |
| 5 | Receptor 46 (reaction-rate feedback) | Gene 135, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | nominal 174 / threshold 34 / gain 255 / flags: none | Maximum-gain *positive* feedback at the same threshold: plenty of Glycogen accelerates a reaction (typically glycogenolysis), i.e. the body becomes more willing to mobilise stored sugar when there is lots of it sitting around |
| 6 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1) | Glycogen does not decay naturally; any unconverted Glycogen sits in the body indefinitely until a reaction consumes it or it is removed externally |

## Role in Game Mechanics

### The reversible glycogen cycle

The pair of reactions **6** (`6× Glucose → 1× Glycogen`) and **14** (`1× Glycogen → 6× Glucose`) is the whole reason Glycogen exists in the chemistry. Together they implement the same reversible storage loop that real physiology calls the glycogen cycle:

- **After a meal** (Starch → Glucose via reaction 4) Glucose rises. Once it exceeds the thresholds of its own receptors (see `003 - Glucose.md`), glycogenesis (reaction 6) fires and packs Glucose away 6:1 into Glycogen. The medium half-life of ~621 ticks makes this a slow, deliberate process — the body does not immediately bank every spare sugar molecule.
- **During exertion or fasting** Glucose falls. Glycogenolysis (reaction 14) then fires with a *short* half-life of ~47 ticks, rapidly breaking Glycogen back down at a 1:6 ratio. The asymmetric rates (slow to store, fast to release) mean Glycogen is an "easy in, easy out" buffer — but the release is much more aggressive than the storage, which biases the creature toward maintaining blood sugar over hoarding reserves.

This 6:1 packing ratio is what makes Glycogen a *dense* reservoir. A creature holding, say, 20/255 Glycogen effectively has 120 additional units of latent Glucose queued up behind it — far more than the 255-unit ceiling of Glucose itself can ever hold directly. Glycogen therefore dramatically extends the effective carbohydrate capacity of the body without inflating any single concentration beyond its 0–255 range.

### The Adrenalin amplifier (reaction 22)

Reaction 22 is the most gameplay-significant Glycogen consumer: `1× Glycogen + 1× Adrenalin → 8× Glucose`. It is the fight-or-flight hook. Whenever the creature is frightened, angry, fleeing, or in pain — any scenario that raises Adrenalin — this reaction fires alongside the baseline glycogenolysis (reaction 14) and produces a *bigger* Glucose payoff per unit of Glycogen (×8 instead of ×6). The short half-life (~43 ticks) means the Glucose burst arrives quickly, within the same stress episode that triggered it.

The asymmetric payoff has a cost, though: Adrenalin is simultaneously consumed, so a long stress event will drain both the Adrenalin supply and the Glycogen store faster than a calm body would. This is why frightened creatures briefly spike with energy but then crash harder once Glycogen is depleted — their own stress reaction burned their reserves at a premium rate.

### The Glycotoxin raid (reaction 88)

Reaction 88, the Glycotoxin pathway, is the only hostile / offensive chemistry that directly attacks Glycogen. `1× Glycotoxin + 1× Glycogen → 4× Glucose + 4× Coldness` takes a unit of the creature's carbohydrate store and converts it into a *smaller-than-normal* Glucose payoff (×4 vs. the baseline ×6) while dumping Coldness — a drive / environmental chemical — as a side-effect. The short half-life (~24 ticks) makes it a fast, punishing effect: administer a shot of Glycotoxin via an injector agent or hostile item and the creature's Glycogen reserves are eaten up in seconds, with only two-thirds of the normal blood sugar return and a chill effect on top.

This makes Glycogen strategically interesting for hostile gameplay. A well-fed creature with a large Glycogen store is *more* vulnerable to Glycotoxin than a hungry one, because the reaction literally cannot proceed without Glycogen to consume. Starving a creature is, paradoxically, a defence against this specific toxin.

### The two-receptor feedback pair

Glycogen has exactly two receptors (34 and 46), both on the Reaction organ's Somatic tissue at Locus 0, and both with the same threshold of 34/255 (~13 % concentration). The pair forms a classic "fork" regulator:

- **Receptor 34** (nominal 191, gain 229, REDUCE): once Glycogen exceeds 34/255, this receptor *inverts* and strongly suppresses one reaction — typically the production path (glycogenesis itself, or earlier upstream reactions) — preventing the Glycogen store from overfilling beyond its comfort band.
- **Receptor 46** (nominal 174, gain 255, normal): at the *same* 34/255 threshold this receptor does the opposite — it strongly *boosts* a reaction, typically a consumer such as glycogenolysis (reaction 14) or Adrenalin-boosted glycogenolysis (reaction 22). High Glycogen makes the body more willing to mobilise it.

The combined effect is a narrow-band regulator centred on Glycogen ≈ 34/255 (~13 % — coincidentally the same value the creature is born with). Above this band the genome simultaneously *slows production* (receptor 34) and *speeds consumption* (receptor 46), pushing the concentration back down. Below it, both receptors fall silent and the Glucose-side receptors take over (see `003 - Glucose.md`), allowing Glycogen to rebuild. This is why a healthy adult creature's Glycogen level tends to hover fairly tightly around its birth concentration: the body actively defends that setpoint.

### No sensorimotor receptor — by design

Unlike Glucose (which has receptor 74 wired to an involuntary faint action at `LOC_INVOLUNTARY6`), Glycogen has **no brain-level or sensorimotor receptor at all**. The creature has no direct way to "feel" its carbohydrate reserves — it can only feel the *Glucose* that those reserves produce. This is deliberate: Glycogen is an internal metabolic buffer, not a drive. The creature does not get hungry because Glycogen is low; it gets hungry because Glucose eventually falls as Glycogen is exhausted, and that Glucose fall is what triggers the faint / feeding / drive responses. Glycogen therefore functions silently in the background, invisible to the creature's own perception and brain.

### Why Glycogen never decays on its own

Glycogen's half-life of 9.07 × 10¹⁰ ticks (decay rate 1.0) makes it effectively non-decaying. This matches Glucose, Starch and most of the other metabolic substrates and is intentional: Glycogen is a **substrate**, not a signal. If it decayed naturally, a creature in a stable environment would slowly lose its carbohydrate reserves even while apparently healthy, and the 6:1 storage ratio would leak energy out of the system over time. By letting it persist indefinitely, the designers guarantee that every unit of Glycogen the creature builds up is preserved until it is deliberately mobilised.

### Practical consequences for gameplay

- **Feeding** a creature raises Starch → Glucose → Glycogen in sequence. Once Glycogen reaches its comfort band around 34/255, receptor 34 kicks in and slows further glycogenesis, so no amount of overfeeding will inflate Glycogen indefinitely (though it will push Glucose up instead, which then spills into Pyruvate / Fatty Acid storage).
- **Starvation** shows a characteristic Glucose curve: blood sugar first falls, then glycogenolysis (reaction 14) kicks in as Glycogen breaks down to prop it up. Glucose therefore plateaus at a lower but stable level for as long as Glycogen lasts. Once Glycogen is exhausted, Glucose starts to fall sharply — and when it reaches ~13/255, the Glucose faint receptor (74) fires. The Glycogen reserve is effectively the creature's starvation timer.
- **Stress cycles**: Adrenalin spikes accelerate Glycogen depletion via reaction 22 (×8 payoff). A creature that spends long periods frightened or angry will burn through its Glycogen reserves much faster than a calm one, even at otherwise identical Glucose turnover.
- **Glycotoxin attacks** directly drain Glycogen. A large reserve is a larger attack surface. Combined with Coldness as a side product, Glycotoxin is a multi-vector poison: metabolic drain plus environmental drive.
- **CAOS-level tweaks** can `CHEM` Glycogen up or down directly to simulate well-fed or starving creatures for testing, or can inject Glycotoxin to stress-test a genome's carbohydrate regulation without waiting for real starvation.

### Summary of the Glycogen loop

```
                         Glucose  (from Starch, amino acids, gluconeogenesis…)
                            │
                         (r6) 6:1
                            ▼
    ┌──────────────────► Glycogen  (persistent; initial 0.133)
    │                       │
    │                       ├──(r14)─────────────► 6× Glucose   (baseline mobilisation)
    │                       │
    │                       ├──(r22) +Adrenalin ─► 8× Glucose   (stress mobilisation)
    │                       │
    │                       └──(r88) +Glycotoxin ► 4× Glucose + 4× Coldness   (toxin raid)
    │
    │
    └─── Rate feedback (both at threshold 34/255):
            Receptor 34: REDUCE  → slows a reaction (typically glycogenesis) when Glycogen is high
            Receptor 46: normal  → speeds a reaction (typically glycogenolysis) when Glycogen is high

    Safety net: none at the Glycogen level itself — starvation collapse is driven by the
                downstream Glucose receptor 74 once Glycogen has been exhausted.
```

Glycogen therefore occupies the layer between Glucose abundance and Glucose scarcity: it is the buffer that lets the creature smooth out meals, withstand short fasts, pay for fight-or-flight bursts, and — unfortunately — be raided by Glycotoxin. It is the genome's answer to "what do we do with all this extra blood sugar?", and the reason a well-fed creature can go some time without eating before it begins to starve.
