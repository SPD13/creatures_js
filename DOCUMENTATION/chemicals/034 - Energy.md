# 034 - Energy

Energy is the **intermediate "chemical fuel"** of the creature's metabolism — the short-lived product of aerobic respiration that is immediately cashed in to recharge the ATP pool. Biologically it corresponds to the high-energy bond output of the Krebs cycle / electron-transport chain: Pyruvate is burned with Oxygen to release Energy and CO₂, and that Energy is then used to phosphorylate ADP back into ATP (the chemical actually spent by every ATP-dependent reaction). Without a constant Energy supply the ATP pool cannot be regenerated, every ATP-powered reaction stalls, and the creature ultimately dies.

Energy sits between Pyruvate (the upstream carbon fuel) and ATP (the downstream universal currency) in the two-reaction respiration chain. It has **no emitter**, **no neuroemitter**, and **no non-reaction receptor** that reads it as a behavioural signal: its role is purely biochemical plumbing. However three receptors *do* monitor Energy — one reaction-rate feedback, one circulatory feedback, and, critically, an immune-system **LOC_DIE receptor** that kills the creature outright if Energy falls too low. That last receptor makes Energy the second of the two "starvation" chemicals (alongside ATP) whose depletion directly triggers death by energy failure.

Like the other metabolic substrates, Energy does not decay on its own — its half-life is "Very long" (decay rate 1). The genome seeds a newborn creature with a full 255/255 pool so that the ATP-regeneration pipeline can run from tick 0, and from then on the creature has to keep burning Pyruvate + Oxygen fast enough (reaction 19) to replace what reaction 20 consumes.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction 19 (aerobic respiration) | Gene 39, Baby onwards | Standard (genome-wide) | `1× Pyruvate [2] + 3× Oxygen [30] → 6× Energy [34] + 3× Dissolved carbon dioxide [24]` | Very-short half-life ~5 ticks (decay 0.879) — the primary and *only* Energy-producing reaction; runs every tick as long as Pyruvate and O₂ are available |
| 2 | Initial concentration | Gene 6 | Standard (genome-wide) | — | Baby creatures spawn with 255/255 (concentration 1.0) Energy so ATP regeneration can start immediately |

Energy has **no emitter** in the standard genome. Apart from the respiration reaction above, any additional Energy must be injected externally (`CHEM`, `INJR`, consumables, cheat commands).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Chemical reaction 20 (ATP synthesis) | Gene 40, Baby onwards | Standard (genome-wide) | `1× Energy [34] + 6× ADP [36] → 6× ATP [35]` | Very-short half-life ~2 ticks (decay 0.730) — the dominant consumer; every unit of Energy is converted into six ATP within a handful of ticks, coupling respiration to ATP regeneration |
| 2 | Chemical reaction 85 (Cyanide toxicity) | Gene 73, Baby onwards | Standard (genome-wide) | `1× Cyanide [67] + 1× Energy [34] → 1× Cyanide [67]` | Very-short half-life ~2 ticks (decay 0.752) — Cyanide acts as a *catalyst* that destroys Energy without being consumed itself; models cyanide's real-world action of blocking the mitochondrial electron transport chain |
| 3 | Receptor 58 (reaction-rate feedback, inverted) | Gene 33, Baby onwards | Organ 3 "Reaction" / Somatic, Locus 0 | threshold 128 / nominal 249 / gain 247 / flags: REDUCE (invert) | Very strong negative feedback: once Energy passes mid-range (threshold 128) the linked reaction rate is driven sharply *down* — prevents run-away respiration when Energy is already plentiful |
| 4 | Receptor 82 (circulatory signalling, inverted) | Gene 53, Baby onwards | Organ 1 "Creature" / Circulatory, Locus 4 | threshold 128 / nominal 0 / gain 255 / flags: REDUCE (invert) | Strong inverted feedback on an internal circulatory signal locus (locus 4) — the signal rises as Energy falls, letting downstream genes react to low-Energy conditions before they become fatal |
| 5 | Receptor 109 — **LOC_DIE** (death from energy failure) | Gene 70, Baby onwards | Organ 1 "Creature" / Immune, Locus 0 (LOC_DIE) | threshold 13 / nominal 255 / gain 255 / flags: REDUCE + DIGITAL | **Kills the creature** as soon as Energy drops below ~5% of full. The inverted + digital combination turns this into an all-or-nothing "Energy has run out → die" switch |
| 6 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1) | Energy does not decay naturally; every unit sits in the body until reaction 20 (or Cyanide) consumes it |

## Role in Game Mechanics

### The two-step respiration chain

Creatures 3's energy metabolism is deliberately modelled as a *two-step* pipeline rather than a single reaction. Pyruvate and Oxygen do not produce ATP directly — they produce Energy first (reaction 19), and a second reaction (reaction 20) then combines that Energy with ADP to regenerate ATP:

```
    Pyruvate + 3× Oxygen ──(r19, ~5-tick half-life)──► 6× Energy + 3× CO₂
    1× Energy + 6× ADP   ──(r20, ~2-tick half-life)──► 6× ATP
```

Splitting respiration into these two reactions gives the genome a separate "knob" for each half of the pipeline:

- Reaction 19's rate controls how much raw fuel is burned (and how much CO₂ is released into the breathing feedback).
- Reaction 20's rate controls how quickly that fuel is actually cashed in as ATP. Mutations or chemistry tweaks on one stage can slow the creature down without killing it outright.

Because both reactions are **very short** half-life, Energy is normally a *flow-through* quantity: a pulse of Energy appears every time Pyruvate + O₂ collide, and almost immediately reaction 20 drains it into ATP. In a healthy creature the measured Energy concentration is therefore small and oscillates quickly, while ATP stays near 1.0.

### Death by energy failure (LOC_DIE)

Receptor 109 is the crucial receptor that makes Energy a *load-bearing* chemical rather than just a metabolic bookkeeping intermediate. It is a **REDUCE + DIGITAL** receptor targeting the Immune-tissue `LOC_DIE` locus, threshold 13 (≈0.05 concentration). The REDUCE flag inverts its response, so:

- While Energy ≥ 13, the receptor output stays low → LOC_DIE is *not* triggered → creature remains alive.
- When Energy drops below 13 (inverted output goes high, digital flag then snaps it to full), LOC_DIE fires → the creature dies.

An identical receptor (id 108) exists for ATP (threshold 19). Together they define the base genome's two "energy-starvation" death conditions: run out of ATP, or run out of the upstream Energy that makes ATP — either way the creature dies. This is why low-Energy states are an emergency, not a mild penalty.

### Reaction-rate feedback (receptor 58)

Receptor 58 watches Energy concentration and (because of its REDUCE flag) throttles some target reaction *down* as Energy rises. In the standard genome this is part of the balancing network that prevents respiration from running flat-out even when Pyruvate is abundant: a well-stocked Energy pool dampens whatever reaction receptor 58 is wired to, keeping the metabolism at a cruising rate instead of a permanent sprint.

Combined with Pyruvate's own receptors (35/36 positive, 53 inverted) the genome ends up with a smooth self-regulating respiration loop: Pyruvate high + Energy low ⇒ burn faster; Pyruvate low + Energy high ⇒ slow down.

### Circulatory-locus signalling (receptor 82)

Receptor 82 maps Energy onto the creature's **circulatory locus 4** (a "floating" intra-body signal channel, per the base genome's receptor-locus table). Its REDUCE flag means the floating-locus signal *rises* as Energy *falls*, effectively broadcasting a "low-energy alarm" to any other gene that reads circulatory locus 4. This is the genome-level mechanism by which the body can express low-energy stress chemically — for example by waking other reactions or by feeding into drive-level hunger signalling — well before the LOC_DIE threshold is reached.

### Cyanide and the "catalyst" consumption

Reaction 85 (`Cyanide + Energy → Cyanide`) is an unusual pattern in the biochemistry: Cyanide appears on both sides of the reaction, so it is not actually consumed — it only catalyses the destruction of Energy. Biologically this mirrors cyanide's real-world mode of action, which is to block cellular respiration by poisoning the electron transport chain. In game terms, any Cyanide in the bloodstream continuously bleeds Energy out of the body, and because Energy does not decay on its own, Cyanide is one of the very few ways Energy can drop without respiration being starved of O₂ or Pyruvate. Persistent Cyanide exposure will therefore eventually push Energy below the LOC_DIE threshold and kill the creature.

### Why Energy does not decay

Like Pyruvate, ATP and ADP, Energy has a "Very long" half-life (decay rate 1.0): nothing is lost to natural background decay. This is deliberate — Energy is a *substrate* for reaction 20, not a *signal* that needs to time out. If it decayed on its own, the creature would slowly lose ATP-regeneration capability even when fed and breathing, which would make the two-step respiration pipeline unstable. By pinning the decay rate at 1.0 the designers guarantee that every unit of Energy produced by respiration is either cashed in as ATP (the expected path) or destroyed by Cyanide (the poison path) — it cannot simply evaporate.

### Practical consequences for gameplay

- **Normal operation:** Energy hovers near zero most of the time — pulses produced by reaction 19 are drained by reaction 20 in ~2 ticks. The creature's measurable Energy reading is therefore usually a *thin stripe*, while ATP stays pinned near 1.0.
- **Suffocation / low Oxygen:** reaction 19 stalls (it needs 3× Oxygen per pulse). Pyruvate accumulates (it does not decay), but Energy production stops, reaction 20 runs dry, ATP begins to fall — and simultaneously the Energy pool falls too. Once Energy drops below 13, the LOC_DIE receptor fires and the creature dies of asphyxiation.
- **Starvation:** with no Glucose / Fatty Acid / Cholesterol to feed Pyruvate, reaction 19 has no fuel, Energy production stops, same LOC_DIE death mode applies — this is biochemically equivalent to suffocation, just reached from the carbon side rather than the oxygen side.
- **Cyanide poisoning:** even if Pyruvate and O₂ are abundant, Cyanide (reaction 85) destroys Energy continuously. Because Cyanide is not consumed, a single dose keeps bleeding Energy until the Cyanide itself decays (or is neutralised by `Sodium thiosulphite [96]` via reaction 86). This is one of the game's few fast-acting toxins against a well-fed creature.
- **CAOS-level tweaks:** injecting Energy directly with `CHEM` effectively short-circuits respiration, immediately filling the substrate of reaction 20 and regenerating ATP. Useful for debugging metabolic genomes or for "revival" potions in mods; conversely, draining Energy to 0 with `CHEM` is a fast way to trigger the LOC_DIE energy-failure death.

### Summary of the Energy loop

```
  Pyruvate + Oxygen ──(r19, very fast)──► ENERGY ──(r20, very fast)──► ATP
                                           │                           ▲
                                           │                           │
                                           ├─ (r85) +Cyanide ─► Energy destroyed (Cyanide unchanged)
                                           │
                                           ├─ Receptor 58 ─► throttle linked reaction (REDUCE)
                                           ├─ Receptor 82 ─► circulatory locus 4 alarm (REDUCE)
                                           └─ Receptor 109 ─► LOC_DIE (REDUCE + DIGITAL)
                                                             ↳ Energy < 13 ⇒ creature dies
```

Energy is therefore the **fragile middle link** of the respiration pipeline: produced only by reaction 19, consumed almost as fast as it is made by reaction 20, not replenished by any other pathway, monitored by a death-trigger receptor, and uniquely vulnerable to Cyanide. It is a short-lived chemical with an outsized role — the single point through which every joule of metabolic work in the body has to pass, and whose failure is one of only two biochemical conditions that cause outright death in the base genome.
