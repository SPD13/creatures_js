# 030 - Oxygen

Oxygen is the creature's **blood-borne oxidant** — the chemical that makes aerobic metabolism possible. It sits one step downstream of Air [29] in the respiratory pipeline: the creature inhales Air from the environment (emitter 6 on `LOC_AIRQUALITY`), reaction 27 then combines that Air with Water to synthesise Oxygen (`1× Water [33] + 1× Air [29] → 3× Oxygen [30]`), and Oxygen is finally burned with Pyruvate in reaction 19 (`1× Pyruvate [2] + 3× Oxygen [30] → 6× Energy [34] + 3× Dissolved CO₂ [24]`) to produce the Energy that drives ATP regeneration. Every joule of ATP the creature spends to move a muscle, tick an organ, or fire a brain lobe ultimately comes from this reaction — making Oxygen the single most load-bearing chemical in the entire metabolic simulation.

Oxygen has an **effectively infinite passive half-life** (decay rate 1.0, ~90 billion ticks) — once synthesised, it does not decay on its own. It can only leave the bloodstream by being consumed in a reaction. This deliberate "no-leak" design makes Oxygen behave as a **working fluid**: the creature builds up a large steady-state reserve (initial concentration 191/255 ≈ 74.9 %), and that reserve is drawn down only at the rate metabolism actually demands. Compare this to Air, which has a ~343-tick half-life and is constantly bleeding away — the split creates a "lungs vs. bloodstream" metaphor where Air is the short-lived inhaled gas and Oxygen is the long-lived circulating oxidant.

Oxygen also acts as a **dual-purpose safety chemical**: besides powering the glucose-combustion chain, it is consumed by reaction 78 (`1× Carbon monoxide [79] + 1× Oxygen [30] → (nothing)`) to scrub carbon monoxide from the bloodstream, and it is *monitored* by two separate receptors (75 and 78) that compensate for low oxygen by accelerating organ clock rates. In effect, Oxygen is simultaneously the fuel, the antitoxin, and the sensor signal for "am I getting enough air?".

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction (id 27) — oxygen synthesis | Gene 47, Baby onwards | Standard (genome-wide) | `1× Water [33] + 1× Air [29] → 3× Oxygen [30]` | Medium half-life (~105 ticks, decay 0.993) — the only endogenous source, produces 3 units per 1 Air consumed |
| 2 | Initial concentration | Gene 7, Baby onwards | Standard (genome-wide) | Bloodstream starts at 191/255 ≈ 74.9 % at birth | One-off at creature instantiation |

Oxygen is not emitted by the environment and has no sensorimotor source; it is entirely **manufactured internally** from the inhaled Air reserve. The 3:1 stoichiometry of reaction 27 means each unit of inhaled Air yields three units of circulating Oxygen, which is why a relatively slow-firing emitter (Air emitter 6, every 20 ticks with gain 56) can sustain the creature's continuous metabolic demand. Oxygen may also be injected externally via CAOS (`CHEM 30 <amount>`) — typically by food agents, drug agents, or developer testing.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction (id 19) — glucose combustion | Gene 39, Baby onwards | Standard (genome-wide) | `1× Pyruvate [2] + 3× Oxygen [30] → 6× Energy [34] + 3× Dissolved CO₂ [24]` | Very short half-life (~5 ticks, decay 0.879) — the fastest reaction in the metabolic chain and the main Energy / ATP producer |
| 2 | Chemical reaction (id 78) — carbon monoxide detoxification | Gene 95, Baby onwards | Standard (genome-wide) | `1× Carbon monoxide [79] + 1× Oxygen [30] → (nothing)` | Short half-life (~19 ticks, decay 0.965) — burns off CO toxicity at the cost of one Oxygen per CO molecule |
| 3 | Receptor 75 — low-oxygen organ acceleration | Gene 39, Baby onwards | Organ / Somatic / Locus 0 (`RLOCUS_CLOCKRATE`) | Threshold 128, nominal 128, gain 112, REDUCE (invert) — below ~50 % Oxygen, organ clock rate is driven upward (proportional to how far below threshold) | Read each tick by the organ receptor processor |
| 4 | Receptor 78 — low-oxygen reaction-organ boost | Gene 89, Baby onwards | Reaction-organ / Somatic / Locus 0 (clock rate) | Threshold 153, nominal 223, gain 18, REDUCE + DIGITAL — below ~60 %, applies a fixed acceleration to the reaction organ clock | Read each tick by the organ receptor processor |
| 5 | Passive decay | Gene 62 (half-life table) | Bloodstream | Half-life ≈ 90 billion ticks (decay rate 1.0) — effectively no decay | Negligible |

## Role in Game Mechanics

### Position in the respiratory pipeline

Oxygen is the **middle link** of the creature's three-stage respiratory chain:

```
   Air [29]  (inhaled reserve, half-life 343 ticks)
        │
        │  Reaction 27 (Gene 47): 1 Water + 1 Air → 3 Oxygen
        ▼
  Oxygen [30]  (working oxidant, effectively no decay)
        │
        │  Reaction 19 (Gene 39): 1 Pyruvate + 3 Oxygen → 6 Energy + 3 CO₂
        ▼
   Energy [34] + CO₂ [24]
        │
        │  Reaction 20 (Gene 40): 1 Energy + 6 ADP → 6 ATP
        ▼
     ATP [35]  (cellular power currency)
```

Every downstream link in the metabolic chain — ATP regeneration, muscle contraction, organ maintenance, brain activity — depends on Oxygen being available for reaction 19 to fire. If the Oxygen reserve collapses, Energy production collapses within a handful of ticks (reaction 19 has a 5-tick half-life), and ATP follows within another handful of ticks (reaction 20 has a 2-tick half-life). The whole creature effectively runs on a *very* short ATP buffer with Oxygen as the key substrate feeding it.

### Why Oxygen has no passive decay

The half-life table explicitly marks Oxygen as "very long" (decay rate 1.0, ~90 billion ticks — longer than the age of the universe in ticks, i.e. effectively infinite). This is a deliberate design choice:

- **Air** has a medium half-life because it represents a short-lived lungful of inhaled gas that must be refreshed.
- **Oxygen** has no decay because it represents the *dissolved* oxidant in the bloodstream, which only disappears when actually consumed by a reaction.

The practical consequence is that Oxygen is only ever lost to **useful work** (reaction 19's glucose combustion, reaction 78's CO scrubbing). A creature that stops moving and stops metabolising would keep its Oxygen reserve essentially forever. Conversely, a creature that is working hard — reaction 19 firing at full rate — will burn Oxygen at three units per Pyruvate consumed, which can deplete the pool in seconds if the Air supply cannot keep up.

This creates a natural buffer: even if the creature briefly loses access to Air (a short dip underwater), Oxygen reserves carry it through the gap. Only sustained Air starvation truly threatens metabolism.

### The stoichiometric design of reaction 19

Reaction 19 is unusual in consuming **three** Oxygens per one Pyruvate, and in producing **six** Energy and **three** CO₂ per firing. This 1:3 Pyruvate-to-Oxygen ratio is what makes Oxygen the rate-limiting chemical for Energy production:

- If Pyruvate is abundant but Oxygen is low → reaction 19 stalls, Energy starves.
- If Oxygen is abundant but Pyruvate is low → reaction 19 also stalls, but this is typically rarer (Pyruvate is replenished from Glucose via reaction 18, which does not require Oxygen).

So the respiratory chain's most common failure mode is **oxygen starvation**, not fuel starvation — which matches the real-world physiology it is modelling. The 3:1 ratio also explains why Air emitter 6's gain of 56 (only moderate) is enough: each inhalation produces 3× as much Oxygen as Air, giving the downstream chain enough headroom to keep up with reaction 19's 5-tick half-life.

### The low-oxygen compensation receptors

C3's biochemistry includes two separate "low-oxygen" receptors that accelerate metabolism when Oxygen is running low — an internal hypoxia response:

**Receptor 75** is wired to `RLOCUS_CLOCKRATE` on the Organ tissue with flags `REDUCE`. Its behaviour under the organ receptor kernel is:

- If Oxygen is above threshold 128 (~50 %), the reduced signal is zero; the clockrate receives the nominal value 128 (i.e. no change from baseline).
- If Oxygen is below 128, the excess `(128 − Oxygen) × gain/255 ≈ (128 − Oxygen) × 0.44` is added to the nominal, *pushing the clockrate above baseline* — the organ ticks faster, which accelerates its internal reactions.

The mechanism is a compensatory reflex: as Oxygen drops, every organ speeds up, trying to wring more throughput out of whatever reserves remain. It is *not* a panic trigger — it scales smoothly with how low Oxygen has fallen — and it eventually fails as Oxygen runs out entirely.

**Receptor 78** is similar but more targeted: it is attached to the Reaction-organ locus 0 (clockrate of a specific reaction organ) with flags `REDUCE | DIGITAL`. Because DIGITAL, its output is binary: as soon as Oxygen drops below threshold 153 (~60 %), it emits its fixed gain of 18 subtracted-from-nominal-223 = 205 (i.e. 205/255 clockrate). Above the threshold, the output stays at nominal (223). This gives a specific reaction organ a fixed boost when Oxygen drops — a simpler, cruder version of receptor 75's proportional compensation.

Together these two receptors give the creature an endogenous "try harder when you're suffocating" response, before the drowning-specific reflex on Air (receptor 76) fires.

### Carbon monoxide detoxification — reaction 78

Reaction 78 (`1× Carbon monoxide + 1× Oxygen → (nothing)`) models the fact that CO is dangerous because it competes with Oxygen for haemoglobin binding sites. In C3's simpler model, CO is simply scrubbed at the cost of one Oxygen per CO molecule, with no product chemicals generated. The rate is short (half-life ~19 ticks) so CO clearance is quite rapid — but it comes at a metabolic cost: every CO molecule purged costs an Oxygen that can no longer be used for reaction 19.

Gameplay consequence: if a creature breathes in a CO-producing agent (e.g. a faulty engine, certain toxic plants), its Oxygen reserve gets *double-drained* — once by normal metabolism, once by CO scrubbing — and it may asphyxiate even without being submerged in water. This is a subtle but realistic mechanism for "slow poisoning" agents in the game.

### Initial concentration — why 75 %

The newborn Norn/Grendel/Ettin starts with Oxygen at 191/255 ≈ 74.9 % — a deliberately generous initial reserve. Compared to Air's 25.1 % starting concentration, Oxygen is three times more abundant at birth. This asymmetry ensures that:

- Reaction 19 can fire at full rate immediately (three Oxygens per firing × high abundance = no stalling on the first tick).
- CO₂ and Energy production begin from tick 0, feeding the ATP cycle.
- The creature has a buffer while respiration stabilises; even if the newborn hasn't yet triggered its first breath, it can metabolise for hundreds of ticks on its initial Oxygen alone.

In practice this means a healthy newborn starts with all its metabolic machinery already "primed" — the very first tick of life is a productive metabolic tick, not a loading tick.

### Comparison with Air

It is worth repeating the key contrast between the two gateway respiratory chemicals:

| Property | Air [29] | Oxygen [30] |
|----------|----------|-------------|
| Role | Inhaled reserve | Dissolved oxidant |
| Source | Emitter 6 (environmental) | Reaction 27 (from Air + Water) |
| Consumers | Reaction 27 (→ Oxygen); Receptor 76 (drowning reflex) | Reaction 19 (→ Energy + CO₂); Reaction 78 (CO detox); Receptors 75, 78 (clock-rate compensation) |
| Passive half-life | Medium (~343 ticks, decay 0.998) | Effectively infinite (decay 1.0) |
| Initial concentration | 64 / 255 ≈ 25 % | 191 / 255 ≈ 75 % |
| Environmental coupling | Yes — tied to `LOC_AIRQUALITY` | No — purely internal |
| Reflex trigger | Drowning (receptor 76, threshold 30 %) | None direct; drives compensation receptors |
| Stoichiometry | 1 Air → 3 Oxygen (reaction 27) | 3 Oxygen → 6 Energy + 3 CO₂ (reaction 19) |

Air is the **gateway** — a short-lived, location-dependent input. Oxygen is the **working fluid** — a long-lived, internally-regenerated reserve that actually powers metabolism. The separation lets the engine model the difference between "running out of breath" (Air crashes, drowning reflex fires) and "running out of metabolic capacity" (Oxygen crashes, organs slow down, creature weakens and eventually dies quietly).

### Progression of oxygen starvation

If the Air supply is cut off (e.g. head submerged), the Oxygen pool does *not* collapse immediately — it drains at the rate reaction 19 consumes it, plus any CO-detox demand. The stages unfold as follows:

1. **Air stops flowing in.** `LOC_AIRQUALITY = 0.0`, emitter 6 silent. Air reserve begins to drop. Reaction 27 continues to fire *while Air remains*, still producing Oxygen.
2. **Air depletes (~300–500 ticks).** Reaction 27's substrate runs out. Oxygen production stops. Existing Oxygen reserve (at ~75 %) begins to be consumed by reaction 19 alone.
3. **Oxygen drops below threshold 153 (~60 %).** Receptor 78 fires, boosting a reaction-organ clockrate. Metabolism tries to compensate but has no new fuel coming in.
4. **Oxygen drops below threshold 128 (~50 %).** Receptor 75 begins ramping up organ clockrates proportionally. All organs speed up.
5. **Oxygen approaches zero.** Reaction 19 stalls. Energy production collapses. Pyruvate accumulates. Reaction 20 (Energy → ATP) starves. ATP runs out. Muscle, brain and organ activity all begin to fail.
6. **Metabolic collapse.** With no ATP, the creature cannot maintain homeostasis. Cascade failures across organs trigger injury accumulation, life force drops, and the creature dies.

Notice that the compensation receptors actually *accelerate* the creature's doom once Oxygen is falling: by speeding up organ clocks they increase the rate at which remaining Oxygen is consumed. This is intentional — it models the physiological reality that hypoxia causes hyperventilation and tachycardia, which in a closed system burns through reserves faster. It also provides an observable symptom: a Norn on the verge of asphyxiation will show subtly elevated animation speed and more frequent organ events just before metabolic shutdown.

### Mutations and scripter notes

- **Mutations on gene 7 (initial Oxygen concentration).** Lowering the starting value makes newborns metabolically fragile — they may fail to establish a stable Energy / ATP cycle before their first breath lands. Raising it is harmless but also largely cosmetic, since a healthy respiratory chain refills Oxygen quickly.
- **Mutations on gene 47 (reaction 27).** Already covered in Air's documentation — disabling reaction 27 causes Air to accumulate while Oxygen steadily drains to zero, killing the creature *silently* (no drowning reflex fires because Air is fine). This is one of the most insidious lethal mutations in the genome.
- **Mutations on gene 39 (reaction 19 / receptor 75).** Note that gene 39 encodes both the main combustion reaction *and* the clockrate compensation receptor — a genetic linkage. Disabling gene 39 catastrophically breaks Energy production while simultaneously removing the compensatory response, so the creature cannot even speed up organs to stretch remaining reserves.
- **Mutations on gene 89 (receptor 78).** Loss of this receptor is relatively mild — the creature simply lacks the early-warning boost to its reaction organ. Receptor 75 (gene 39) is the main compensation mechanism.
- **Mutations on gene 95 (reaction 78 — CO detox).** Disabling CO scrubbing means any exposure to carbon monoxide accumulates permanently, poisoning the creature. Enhancing it makes CO harmless at the cost of extra Oxygen consumption per exposure.
- **Mutations on gene 62 (Oxygen half-life).** Gene 62 sets Oxygen's decay rate to effectively 1.0 (no decay). Mutating it to a shorter half-life would make Oxygen leak away even when no reaction consumes it — the creature would constantly "bleed" Oxygen and need to breathe much harder to stay alive. Lengthening it has no effect (already effectively infinite).
- **CAOS-injected Oxygen (`CHEM 30 <amount>`)** can be used to top up or strip the reserve for testing. Injecting a large positive Oxygen dose is a quick way to "revive" a struggling creature; injecting a large negative dose (`CHEM 30 -191`) immediately triggers metabolic collapse by starving reaction 19, which is useful for testing asphyxiation scripts.
- **Agent design.** Food agents and medical agents that want to provide respiratory benefit should inject Air [29] rather than Oxygen [30] — Air is the physiological "breath", Oxygen is the processed form. Directly boosting Oxygen bypasses reaction 27 and is the equivalent of an oxygen mask or hyperbaric chamber; it is useful for emergency healing agents but less "natural" than boosting Air.

### Summary of the Oxygen pathway

```
                    ┌───────────────────────────────────┐
                    │       Air [29]  (inhaled)         │
                    └───────────────┬───────────────────┘
                                    │
                       Reaction 27 (Gene 47)
                       + Water [33]
                                    │
                                    ▼
                    ┌───────────────────────────────────┐
                    │   Oxygen [30]  (no decay, 75 %)    │
                    └───────────────┬───────────────────┘
                                    │
             ┌──────────────────────┼─────────────────────────────┐
             │                      │                             │
             ▼                      ▼                             ▼
     Reaction 19 (Gene 39)   Reaction 78 (Gene 95)       Receptors 75 & 78
     + Pyruvate [2]          + Carbon monoxide [79]      RLOCUS_CLOCKRATE
             │                      │                             │
             ▼                      ▼                             ▼
   6× Energy [34] +              (scrub — no product)       Organ clock rate
   3× CO₂ [24]                                              (compensation)
             │
             ▼
     Reaction 20 (Gene 40)
     + ADP [36]
             │
             ▼
       ATP [35]  (cellular power currency)
```

Oxygen therefore plays the role of the creature's **universal metabolic oxidant** — the one chemical whose availability directly gates Energy production, ATP regeneration, and ultimately every ATP-dependent process from muscle contraction to brain activity. It is the hinge between the environment-coupled Air pipeline and the internal ATP economy; every other chemical in the respiratory chain flows through it.
