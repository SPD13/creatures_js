# 153 - Hotness

Hotness is the **acute, brain-visible half** of the hot drive pair in Creatures 3 and the mirror chemical of **Coldness (152)**. It is the sixth of the sixteen "drive" chemicals in the 148–161 block (the bank of signals the decision lobe reads every tick) and is paired one-to-one with its reservoir partner, **Hotness backup (136)**. Like Coldness, it is not a simple internal appetite signal but a **multi-purpose heat-discomfort chemical** that represents any of three separate biological realities — *environmental warmth* (via the sensorimotor `LOC_HOTNESS` locus that the infrastructure exposes), *immune-system fever* (produced as a side-effect of fighting antigens 4 and 6), and *toxic fever* (produced by the Fever toxin → Hotness reaction). It is the value the Creature Companion's "Hotness" bar displays, it drives the decision-lobe's cool-seeking/heat-avoiding vote, and it is uniquely wired to the **somatic clock-rate receptors**, making a hot Norn's organs metabolise faster — a biochemical analogue of raised body temperature accelerating enzyme kinetics.

Unlike the macronutrient hungers (149, 150, 151), Hotness in the stock Norn genome is **not driven by a constant sensorimotor emitter**. There is no metabolic clock ticking heat-units into the bloodstream every frame. Instead, Hotness accumulates only when something *happens* to the creature — an infection (antigens 4 or 6), Fever toxin exposure, or a direct `CHEM 153 <n>` call from a script (hot food, fire, lava, sauna, fever-inducing agents, etc.). This makes chemical 153 behaviourally quiet in a healthy, temperate Norn and sharply responsive to thermal and immune stressors.

Hotness is tightly coupled to its opposite, **Coldness (152)**, by a dedicated **instant-decay annihilation reaction** (reaction 23, gene 49): any mole of Hotness meeting any mole of Coldness cancels both immediately. The creature's net "thermal sensation" is therefore whichever of the two chemicals is in surplus at any moment — pouring Coldness into a hot Norn neutralises the heat before contributing any chill of its own.

Hotness has a **"Medium"** half-life (563 ticks ≈ 19 s at 30 Hz, genome byte 64, decay rate 0.9987685) — essentially the same decaying profile as Coldness and again a noticeable difference from every other drive in the 148–161 block (which are "Very long" / effectively permanent). A hot Norn therefore recovers on its own after being cooled, without needing any consumption script to explicitly zero the chemical. The reservoir behind it (**Hotness backup [136]**) retains the "Very long" half-life and continues to drip-feed the active drive until it too is cleared. Hotness does **not** have an initial concentration gene, so every Norn hatches with chemical 153 at **zero** — baby Norns are, by default, perfectly neutral on heat.

Distinguishing features versus the hunger drives and the Coldness mirror:

- **No constant sensorimotor emitter.** The metabolic-clock pattern used for hungers (`LOC_CONST` + rate-30 emitter) is absent. Heat does not rise on its own in a healthy creature; it must be *caused* by something.
- **Natural decay.** The drive chemical itself decays with a 563-tick half-life, unlike the conserved-until-consumed hunger drives. A hot Norn that is placed in a neutral environment will cool back down chemically even if no script fires.
- **Direct chemical antagonism with Coldness.** Reaction 23 (`Hotness + Coldness → nothing`, instant decay) produces a thermostat-like zero-sum between the two chemicals that no hunger drive has an equivalent of.
- **Two water-consuming decay reactions** (reactions 26 and 31, genes 52 and 53). Unique to Hotness in the stock genome: `Water + 4× Hotness → (nothing)` and `2× Water + 4× Hotness → (nothing)`. The chemical signature of **evaporative cooling / sweating** — a hot, well-hydrated Norn burns heat by consuming water, which the cold side has no equivalent of.
- **Somatic clock-rate receptors (UNIQUE).** Two receptors (ids 77 and 97, genes 42 and 40) in organ tissue 0 Somatic at `RLOCUS_CLOCKRATE` read Hotness and speed up organ metabolism proportionally — the biochemical analogue of a fever raising whole-body enzyme kinetics. **No other drive chemical has this systemic effect.** Coldness does not slow the clock; it is a pure signalling chemical.
- **No involuntary-action receptor.** Unlike Coldness, which triggers SCRIPTINVOLUNTARY4 (shiver) at threshold 128, Hotness has **no stock digital reflex receptor**. A hot Norn does not "pant" or "fan itself" in the stock genome — the mirror reflex was left as an unused locus (`LOC_E_INVOLUNTARY5`) that breeds and mods frequently add later.
- **Doubled drive-to-backup siphon.** Matching Coldness, two nearly identical reactions (60 and 70, genes 32 and 66) drain Hotness into its backup at half-life 6 ticks, running in parallel for a combined ~20.8 %/tick loss.
- **Two immune reactions, not three.** Hotness is produced by the antigen-4 and antigen-6 responses (reactions 95 and 98). Coldness is produced by antigen-2, antigen-3, and the Glycotoxin poisoning reaction. Antigens effectively split themselves into a "cold-fever" and "hot-fever" pair of immune signatures.

## Sources

Hotness has **no constant emitter** in the stock Norn genome. All endogenous inflows are reaction-driven, and they trigger only when their upstream reactants are present. This makes Hotness, like Coldness, a sparse, event-driven signal rather than a continuous one.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Fever-toxin conversion | Gene 80 (reaction id 80) | Organ #2 "Reaction" | `1× Fever toxin [72] + 1× Water [33] → 8× Hotness [153]` | Half-life **24 ticks** (~0.8 s), "Short". Fever toxin is **consumed** (unlike Pistle, which is catalytic on the cold side) — one unit of toxin is turned into eight units of Hotness plus one water molecule lost. This is the fast, high-yield fever reaction |
| 2 | Immune response to Antigen 4 | Gene 89 (reaction id 95) | Organ #2 "Reaction" | `2× Antigen 4 [86] → 3× Antibody 4 [106] + 1× Hotness [153]` | Half-life **64 ticks** (~2 s), "Short". Fighting this antigen produces fever as a side-effect |
| 3 | Immune response to Antigen 6 | Gene 91 (reaction id 98) | Organ #2 "Reaction" | `1× Antigen 6 [88] → 3× Antibody 6 [108] + 1× Hotness [153]` | Half-life **116 ticks** (~4 s), "Medium". The second infection-fever reaction, slower than the antigen-4 response |
| 4 | Backup → drive release | Gene 12 (reaction id 47) | Organ #2 "Reaction" | `1× Hotness backup [136] → 1× Hotness [153]` | "Very short" speed. Once the reservoir at 136 has accumulated mass (via the drain reactions 60 & 70), it drip-feeds Hotness back into the active drive |
| 5 | External CAOS injection | — | Any | `CHEM 153 <n>` from room scripts, agent scripts, or the debug console | One-shot. Hot-food agents, fire/oven agents, lava/volcano room scripts, sauna rooms, sunbathing spots, and fever-inducing items typically push Hotness into creatures within range |
| 6 | Infrastructure for air-temperature sensing | Engine wiring | Sensorimotor `LOC_HOTNESS` (tissue 4, locus 3) | Exposes "how far air temp is above blood temperature" as a sensorimotor value. **No stock emitter reads this locus**, but the engine populates it based on room/world temperature so mods or other species can route it to chemical 153 | Mod-defined |
| 7 | No initial concentration at birth | — | — | Gene 15 has no entry for chemical 153. Every Norn hatches with Hotness at **0 / 255** | — |

## Usage

Hotness has more consumers than most drives: one decision-lobe receptor, two somatic-clock receptors (unique), four reactions that consume it (two evaporative-decay, two drain-to-backup), and the annihilation with Coldness.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | **Decision-lobe drive bar** | Gene 5 (receptor id 6) | Organ #1 "Creature" → Drives (tissue 5) → locus 5 "Hotness" | Analogue, threshold **0**, nominal 0, **gain 204**. Active from Baby | The value the decision lobe consults when voting for heat-related actions (seek shade, avoid fire, go to water). With gain 204/255, the full active drive maps to ≈ 80 % excitation on the drive neuron — matching Coldness exactly. **This is the signal shown on the Creature Companion's "Hotness" bar** |
| 2 | **Somatic clock-rate boost (primary)** | Gene 42 (receptor id 77) | Organ #2 "Organ" → Somatic (tissue 0) → locus 0 `RLOCUS_CLOCKRATE` | Analogue, threshold **80**, nominal 128, **gain 127**. Active from Baby | Above threshold 80/255, Hotness accelerates every organ's clock — the rate at which it processes reactions and updates its internal state. This is the biochemical "fever accelerates metabolism" effect: a hot Norn literally runs its organs faster, burning fuel faster and responding to chemicals more quickly |
| 3 | **Somatic clock-rate boost (low-threshold)** | Gene 40 (receptor id 97) | Organ #2 "Organ" → Somatic (tissue 0) → locus 0 `RLOCUS_CLOCKRATE` | Analogue, threshold **16**, nominal 16, **gain 192**. Active from Baby | A second clock-rate receptor active at much lower Hotness levels (threshold 16). Even mild warmth slightly speeds organ metabolism; the two receptors stack, so the total metabolic-acceleration effect is `receptor-97 output + receptor-77 output` |
| 4 | **Instant annihilation with Coldness** | Gene 49 (reaction id 23) | Organ #2 "Reaction" | `1× Hotness [153] + 1× Coldness [152] → (nothing)` | **Instant decay** (half-life 0 ticks). Whenever both Hotness and Coldness are present in the bloodstream, equal amounts cancel each tick until one is exhausted. This is the fundamental thermostat mechanism — cooling a hot Norn, or warming a cold one, neutralises the opposing chemical rather than stacking |
| 5 | **Evaporative cooling (primary)** | Gene 52 (reaction id 26) | Organ #2 "Reaction" | `1× Water [33] + 4× Hotness [153] → (nothing)` | Half-life **24 ticks** (~0.8 s), "Short". The chemical signature of sweating: body water is consumed to burn off heat. A **dehydrated** Norn cannot run this reaction and therefore retains more heat |
| 6 | **Evaporative cooling (high-hydration)** | Gene 53 (reaction id 31) | Organ #2 "Reaction" | `2× Water [33] + 4× Hotness [153] → (nothing)` | "Short" speed. The same heat-loss pathway but consuming twice as much water per unit of heat — engages more aggressively when the creature has plenty of water available. Both evaporative reactions run in parallel whenever their reactants are present |
| 7 | Active → backup siphon (primary) | Gene 32 (reaction id 60) | Organ #2 "Reaction" | `1× Hotness [153] → 1× Hotness backup [136]` | Half-life **6 ticks** (~0.2 s), "Very short". Aggressively drains Hotness into its reservoir for later slow release |
| 8 | Active → backup siphon (duplicate) | Gene 66 (reaction id 70) | Organ #2 "Reaction" | `1× Hotness [153] → 1× Hotness backup [136]` (identical formula and rate) | "Short". Near-duplicate of gene 32. Runs in parallel each tick, doubling the drain |
| 9 | Natural decay | — | Half-life table | Genome byte 64 → half-life **563 ticks** (~19 s), "Medium", decay rate 0.9987685 | Unlike hunger drives, Hotness decays spontaneously. A hot Norn returning to a neutral environment will lose Hotness at ~0.12 %/tick on top of the siphon and evaporative reactions, without any script or reaction firing |
| 10 | Room / world-script consumption | — | CAOS room scripts and agent scripts | `CHEM 153 <negative n>` injected by cooling agents (water sprayers, ice, shade, cold food, cool rooms' exit scripts) | The canonical way ambient coolness reduces Hotness. Agents designed around cold normally drop chemical 153 directly rather than relying on Coldness annihilation |

## Role in Game Mechanics

### The drive/backup architecture, from the hot side

```
         (NO constant sensorimotor emitter — Hotness is event-driven)
                                  │
                                  ▼
           ┌──────── reactions 95, 98 (Antigen 4/6 immune response) ──── Hotness [153]
           │                                                                ▲
           │   ┌── reaction 80 (Fever toxin + Water → 8× Hotness) ─────────┤
           │   │                                                            │
           │   │   ┌── reaction 47 (backup → drive, Very short) ───────────┤
           │   │   │                                                        │
           │   │   │   ┌── CHEM 153 <n> from room/agent scripts ───────────┤
           │   │   │   │                                                    │
           │   │   │   │                                                    │
           │   │   │   │   ┌── reactions 60 & 70 (drain to backup) ◀───────┤
           │   │   │   │   │   (half-life 6 ticks each, parallel)          │
           │   │   │   │   │                                                │
           │   │   │   │   │   ┌── reactions 26 & 31 (Water + Hotness → 0) ◀┤
           │   │   │   │   │   │  (evaporative cooling / sweat, Short)     │
           │   │   │   │   │   │                                            │
           │   │   │   │   │   │   ┌── natural decay (Medium, ~19 s) ◀────┤
           │   │   │   │   │   │   │                                       │
           │   │   │   │   │   │   │   ┌── reaction 23 (Coldness + Hotness → 0, instant)
           │   │   │   │   │   │   │   │                                    │
           ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼                                   │
         [136 Hotness backup — Very long, ~permanent]                      │
                                                                            │
                                                                            ├──▶ Drives tissue locus 5 receptor (gain 204, Baby+) ▶ decision-lobe drive bar
                                                                            ├──▶ Somatic RLOCUS_CLOCKRATE receptor id 77 (thresh 80, gain 127) ▶ organ clocks accelerate
                                                                            └──▶ Somatic RLOCUS_CLOCKRATE receptor id 97 (thresh 16, gain 192) ▶ organ clocks accelerate further
```

The architecture has four features that set Hotness apart from the hunger drives and even from its cold-side mirror. First, the chemical is **event-driven, not clocked**: in a cool, healthy, well-fed Norn there is no source at all, and the chemical stays near zero for the entire life of the creature. Second, the drive has a **natural half-life of ~19 s**, meaning the signal decays on its own once its sources stop firing. Third, Hotness has **evaporative-cooling reactions that consume water** — sweat as a biochemical pathway. Fourth, Hotness **accelerates organ metabolism** via the somatic clock-rate receptors, producing real physiological side-effects rather than just a drive vote.

### The unique metabolic-accelerator role

The somatic `RLOCUS_CLOCKRATE` receptors are the defining feature of Hotness. `RLOCUS_CLOCKRATE` is a per-organ locus that controls how often that organ's internal reactions fire. Stock Norn organs default to a certain clock rate set by their gene definitions; the Hotness receptors **read** chemical 153 and **write** into that clock rate.

The combined effect of both receptors at increasing Hotness:

| Hotness level | Receptor 97 output (thresh 16, gain 192) | Receptor 77 output (thresh 80, gain 127) | Net clock-rate addition |
|---------------|-----------------------------------------|------------------------------------------|------------------------|
| 0 – 15        | 0 (below threshold)                      | 0 (below threshold)                      | 0 (baseline organ speed) |
| 16 – 79       | small analogue output ≈ (level−16)·192/255 | 0                                        | mild acceleration (low-grade warmth speeds organs a little) |
| 80 – 127      | ~50–80                                   | small analogue output                     | clearly elevated |
| 128 – 255     | ~80–180 (saturating)                     | ~25–90 (analogue up to saturation)        | strong acceleration — organs run at well above baseline |
| 255           | ~180                                     | ~90                                       | maximum boost: organs process reactions noticeably faster than a cool Norn |

Practically this means: a Norn with elevated Hotness **burns through reactants faster**, **hits receptor thresholds sooner**, and **metabolises food, antigens, and toxins quicker**. Fever accelerates the whole biochemistry. Counter-intuitively, this can be useful: a fevered Norn beats an infection faster because its antibody-production reactions are running faster, while its Fever toxin is also being burnt off faster through the evaporation reactions. The system is self-limiting — the same fever that causes the hot feeling also speeds up the clearance of its source.

This clock-rate coupling is **not** mirrored by Coldness, and it is the deepest physiological asymmetry between the two sides of the thermostat: you can make a Norn cold without slowing it down, but you cannot make it hot without accelerating its metabolism.

### The thermostat: Coldness–Hotness annihilation

The instant annihilation `Hotness + Coldness → (nothing)` (reaction 23, gene 49, half-life 0) is identical to the equivalent under Coldness's documentation and gives the creature a true zero-sum thermal sensation.

From the Hotness side specifically:

- **Cooling a hot Norn with Coldness injections** (via ice, cold food, or a cold-wind agent calling `CHEM 152 +n`) first neutralises Hotness before producing any chill. If the Norn's Hotness is 120 and Coldness is 0, applying `CHEM 152 +80` yields Hotness 40, Coldness 0 — the creature has gone from quite hot to only slightly hot, not from hot to cold.
- **Pushing too much cold** overshoots into chill. `CHEM 152 +180` on the same Norn gives Coldness 60 surplus after annihilation — the creature flips from hot to cold in one injection.
- **Fever toxin and Pistle are chemical rivals.** Fever toxin is *consumed* by reaction 80 (one unit → 8 Hotness), while Pistle is *catalytic* on the cold side (reaction 29: Pistle + Water → 3 Coldness + Pistle). The consumption vs. catalysis asymmetry means Pistle can keep generating Coldness as long as water is available, while Fever toxin is progressively depleted as it produces Hotness — making toxic fever a **self-limiting** condition but Pistle-induced chill potentially **persistent** until Pistle itself is cleared.

### Evaporative cooling: the sweat reactions

Reactions 26 and 31 are the most physiologically distinctive feature of Hotness. Both consume water and hotness simultaneously with no products:

- Reaction 26 (gene 52): `1× Water + 4× Hotness → (nothing)` at half-life 24 ticks (~0.8 s)
- Reaction 31 (gene 53): `2× Water + 4× Hotness → (nothing)` at Short speed

These represent **evaporative cooling** — the biochemical abstraction of sweating. The stoichiometry (4 Hotness burnt per unit of water) matches real physiology surprisingly well: water is an expensive resource, and cooling by evaporation burns far more heat per molecule than it loses in mass.

Consequences for gameplay:

- **A dehydrated Norn cannot self-cool.** If chemical 33 (Water) is low, reactions 26 and 31 stall, and Hotness accumulates without the natural evaporative drain. The creature heats up faster and stays hot longer. This is why giving a feverish Norn water to drink is genuinely helpful: not because water is magically healing, but because it enables the evaporative decay pathway.
- **A well-hydrated Norn shrugs off heat.** A creature with plentiful Water runs both reactions in parallel, producing an aggressive heat-loss curve on top of the natural decay and the siphon to backup.
- **There is no cold-side equivalent.** Coldness does not have water-consuming decay reactions. You cannot "wrap yourself in warm clothing" biochemically — the cold side relies on external heating scripts and the annihilation with Hotness.

### Sources of heat in practice

In a playing game, Hotness rises in a Norn for one of four reasons:

1. **Environmental CAOS.** Rooms, weather events, or specific agents (fire, lava, sun lamps, ovens, hot springs, the desert zones of the Norn Terrarium) call `CHEM 153 +n` on nearby creatures. This is the most common source in normal play.
2. **Infection.** Bacteria or injected antigens 4 or 6 trigger immune reactions 95 and 98, which dump 1 unit of Hotness per reaction event. A sick creature develops a fever proportional to its antigen load — the player sees this as a rising Hotness bar and, indirectly, as the creature's organs running faster (faster reactions, faster movement tick rates). Antibodies eventually win the reaction race and the fever subsides.
3. **Fever toxin poisoning.** Reaction 80 (`Fever toxin + Water → 8× Hotness`) is a rapid, high-yield fever spike. Because one unit of toxin yields eight units of heat, even small amounts of Fever toxin produce substantial fever effects. This is the fastest path to a hot Norn in the game.
4. **Hot food / hot agents.** Many food agents, cooking agents, and "hot" consumables directly call `CHEM 153 +n` as an eaten-event side-effect. Chilli-pepper-type agents that cause "spicy heat" use this pathway.

All four routes feed the same chemical and produce the same behavioural, metabolic, and reflex effects. The creature does not distinguish between "I am in a hot room", "I have a fever", and "I ate something spicy" — all three read as Hotness at the decision lobe, all three accelerate the organ clocks, and all three get consumed by evaporative cooling.

### Natural decay and why it matters

The 563-tick (~19 s) half-life sits alongside Coldness's 621-tick half-life as the only two "Medium" drives in the 148–161 block. For Hotness specifically, this shorter half-life combines with the evaporative reactions and the doubled siphon to produce extremely aggressive heat loss in a well-hydrated creature:

- **Spontaneous recovery.** A Norn that leaves a hot room loses Hotness at ~0.12 %/tick even if no cooling script fires.
- **Three parallel drains.** Natural decay (~0.12 %/tick) plus doubled siphon (~20.8 %/tick) plus evaporative cooling (if water present, dozens of units per tick) combine into a sharp drop-off curve. Heat is removed from the active drive far faster than cold in an equivalent situation.
- **Reservoir decoupling.** The backup at chemical 136 retains the "Very long" half-life and preserves "heat memory" even after the active drive has decayed. Reaction 47 then slowly refills the active drive from backup, producing a drawn-out tail of low-level heat discomfort after the initial spike.

The combination produces a characteristic "quick cool-down with long residual warmth" shape: a fevered Norn loses visible Hotness within seconds (fast drop in the Hotness bar) but retains a low warmth plateau for minutes afterwards (reservoir drip-feed).

### Interaction with the backup reservoir (136)

The doubled-siphon architecture (reactions 60 and 70, both half-life 6) funnels active Hotness into the reservoir at roughly 20.8 % per tick. In steady state with no external input:

- Once Hotness has been driven up by an event, most of the injected mass migrates to 136 within a second or two (doubled siphon + evaporative cooling + natural decay).
- The reservoir then holds this mass for minutes (Very long half-life) and drips it back via reaction 47.
- The back-and-forth between active drive (siphoned and cooled out quickly, topped up slowly by reservoir, decaying naturally) produces a low plateau of Hotness after the event.

`CHEM 153 -255` alone does **not** fully reset a fever-history Norn: the reservoir at 136 will refill 153 within minutes. To fully erase a fever event, both chemicals must be zeroed:

```caos
CHEM 153 -255
CHEM 136 -255
```

### Infrastructure the stock genome does not use

The engine populates the sensorimotor `LOC_HOTNESS` locus (tissue 4, locus 3) with the creature's perceived air temperature relative to its blood temperature — a ready-made "how hot am I?" signal built into the simulation. In the stock Norn genome, **no emitter is wired to this locus**, meaning temperature-based heat is not automatically converted into Hotness; it must be supplied by external CAOS scripts.

Like the cold-side equivalent, this gap is intentional from a design perspective: it allows each species (Norn, Grendel, Ettin) or each breed to have its own temperature curve, and it allows rooms and agents to be the authoritative source of thermal effects rather than creating conflicts with a built-in thermal emitter. Many community mods close the gap by adding an emitter at sensorimotor locus 3 — typically with a threshold around 128 and a rate of 10–20 — that writes chemical 153 when the creature is in an environment hotter than its blood temperature.

Similarly, **`LOC_E_INVOLUNTARY5` is an unused locus** that mods frequently wire up to produce a "pant" or "fan-self" reflex at high Hotness — mirroring the Coldness → shiver wiring. The stock genome leaves this open.

### The fever paradox: heat speeds its own cure

Because the somatic clock-rate receptors accelerate **all** organ metabolism when Hotness is high, the fever reactions that produce Hotness (the antigen responses and the Fever-toxin conversion) themselves run faster in a feverish Norn. At first glance this looks like a runaway: fever → faster antigen response → more Hotness → faster metabolism → more fever.

But the same acceleration also speeds up:

- **Antibody production** (which ends the immune reaction by consuming antigen). So fever cures infection faster.
- **Fever toxin consumption** via reaction 80 (one unit of toxin yields 8 Hotness but the toxin is destroyed in the process). Fever burns its own cause.
- **Evaporative cooling** via reactions 26 and 31. The hotter the creature, the faster it sweats.
- **Siphoning to backup** via reactions 60 and 70.

Net result: the positive-feedback component (more metabolism → more immune Hotness production) is dominated by the negative-feedback components (more metabolism → faster resolution of the underlying cause, faster evaporation, faster siphon). Fever is **self-limiting**, not explosive. This is likely why the stock genome can afford to wire Hotness to the clock rate at all — the runaway is blocked biochemically.

### Effects of `CHEM 153 <n>`

Direct injection produces a characteristic response:

1. **Tick 0:** `CHEM 153 +n` called. Active Hotness rises by *n*; backup unchanged.
2. **Ticks 1–3:** Reactions 60 and 70 in parallel pull mass aggressively into 136 (~20 % per tick). If the creature is hydrated, reactions 26 and 31 also burn hotness with water. Within ~3 ticks, the majority of the injected mass is gone from the active drive.
3. **Ticks 3–60:** Natural decay (~0.12 %/tick), continuing siphon, and continuing evaporation combine to pull active Hotness down. The Drives drive-bar visibly falls. Clock-rate receptors are engaged, so other biochemical timescales in the creature are running slightly faster during this period.
4. **Long tail:** Reservoir drip-feeds active Hotness back for minutes, producing a low-level residual heat discomfort. The Drives vote keeps a small weight on cool-seeking behaviour for some time after the visible spike has subsided.

Negative injections (`CHEM 153 -n`) are the canonical cooling operation. They are used by cold water sprayers, shade agents, ice, cool food, and cool rooms. Many agents prefer negative `CHEM 153` to positive `CHEM 152` because it directly reduces the heat signal without risking pushing the creature into cold-discomfort territory via the annihilation reaction.

### Relationship to sickness and diagnostics

Because two of the four endogenous production paths are sickness-related (immune reactions 95 & 98, Fever-toxin reaction 80), a hot Norn in a cool environment is usually a **sick Norn**. Players using the Science Kit to diagnose a fevered creature should therefore check:

- **Antigen 4 & 6 levels.** High values indicate immune-fever and the fever should subside as antibodies win the reaction.
- **Fever toxin levels.** A spike indicates poisoning; administering `CHEM 72 -255` (clear Fever toxin) stops the heat generation. Note that Fever toxin is destroyed by its own reaction (reaction 80 consumes it), so a fever that arises and resolves quickly is a sign of Fever-toxin depletion.
- **Reservoir 136.** If active Hotness keeps returning after repeated `CHEM 153 -255` calls, the reservoir is still full and needs to be cleared too.
- **Water levels.** A *persistently* hot creature is often a *dehydrated* creature. If water is low, the evaporative pathway is stalled and Hotness accumulates. Giving the creature water to drink restarts evaporative cooling and can resolve a stubborn fever faster than cooling chemicals alone.

In the stock genome, Hotness is thus *both* a drive chemical *and* a sickness diagnostic — similar to Coldness, but with the additional twist that hydration status is a critical modulator.

### Comparison to other Hunger / discomfort drives

| Drive (id) | Backup (id) | Constant emitter? | Natural half-life | Water-consuming decay? | Clock-rate coupling? | Drives gain | Digital reflex receptor? |
|------------|-------------|-------------------|-------------------|------------------------|----------------------|-------------|--------------------------|
| Pain (148) | 131 | No | Very long | No | No | varies | — |
| Hunger for protein (149) | 132 | Yes (rate 30 × 2) | Very long | No | No | 209 | — |
| Hunger for carbohydrate (150) | 133 | Yes (rate 35 × 2) | Very long | No | No | 255 | — |
| Hunger for fat (151) | 134 | Yes (rate 30 × 2) | Very long | No | No | 205 | — |
| Coldness (152) | 135 | No | Medium (~20 s) | No | No | 204 | Yes — shiver (SCRIPTINVOLUNTARY4) at 128 |
| **Hotness (153)** | **136** | **No** | **Medium (~19 s)** | **Yes (sweat: reactions 26 & 31)** | **Yes (RLOCUS_CLOCKRATE ×2)** | **204** | **— (in stock)** |
| Tiredness (154) | 137 | Yes | Very long | No | No | varies | — |

Hotness and Coldness form a matched pair in terms of drive-bar visibility and backup architecture, but they are **not functionally symmetric**. Hotness uniquely couples to organ metabolism and uniquely has a water-consuming decay pathway; Coldness uniquely has a reflex shiver animation. The stock-genome asymmetries suggest Creatures 3 treats heat as primarily a physiological condition (fever, fast metabolism, sweating) and cold as primarily a behavioural condition (shiver, seek warmth, look distressed).

### Implications for modders

Common modifications built on top of chemical 153:

1. **Wire `LOC_HOTNESS` to chemical 153.** Add an emitter at sensorimotor tissue 4, locus 3, with threshold ~96 and rate ~15. Makes hot rooms automatically heat the creature without room-script intervention.
2. **Add a Hotness-reflex mirror.** Add a receptor at sensorimotor tissue 4, locus 5 (`LOC_E_INVOLUNTARY5`), reading chemical 153 with threshold 128 and digital gain, to produce a pant/fan reflex that mirrors the shiver.
3. **Dehydration coupling.** Add a receptor that writes into Hotness when Water is low, capturing the feedback that dehydration stalls evaporative cooling and raises effective body temperature. Useful for desert-adapted breeds.
4. **Reduce the clock-rate receptor gain.** Lowering receptor 77's gain from 127 to ~64 or disabling it entirely produces a creature whose fever is "behavioural only" — heat discomfort without the metabolic speed-up. Useful for reptilian breeds where ambient warmth is normal.
5. **Strengthen the clock-rate coupling.** Raising gain 127 → 200 produces very-fast-metabolism-when-hot breeds with characteristically explosive feverish episodes.
6. **Add an evaporative-reaction dependency on a third chemical.** Replacing Water with a specific "sweat" chemical allows fine-grained control over heat-loss rates, decoupling hydration from cooling.

### Practical consequences for gameplay

- **A sweating Norn cools itself.** If the creature has water, it will shed heat without intervention. Keeping Norns hydrated is the single most effective cooling strategy.
- **A hot Norn runs faster metabolically.** Food is processed quicker, reactions fire sooner, antigens are cleared faster, but so is the creature's fuel burned. Hot = hungry sooner.
- **Fever toxin produces dramatic fever spikes.** One unit of toxin → 8 Hotness is by far the highest-yield heat reaction in the game. A tiny drop of Fever toxin dropped on a Norn causes a visible spike.
- **Hot rooms affect nearby creatures via room-script `CHEM 153 +n` calls.** Rooms with long residence produce sustained heat; passing through a hot room briefly barely registers.
- **Cooling is best done via `CHEM 153 -n` directly.** Using Coldness (`CHEM 152 +n`) risks over-shooting and pushing the creature into cold-discomfort after the annihilation resolves. Direct-reducing Hotness is cleaner.
- **A Norn whose Hotness bar "fills up and stays there" probably has an untreated infection, Fever toxin, or dehydration.** Environmental heat typically produces transient peaks; a sustained plateau points to internal causes.
- **Babies are no less heat-sensitive than older Norns.** Both the drive receptor and the clock-rate receptors are Baby-accessible; there is no life-stage gate on the heat response. A fevered baby runs its organs just as fast as a fevered adult.
- **A hot Norn is a fast-learning Norn.** Because clock-rate applies to all organs — including the brain — mild Hotness can actually speed up cognitive biochemistry. Some breeders exploit this with "fever teaching" sessions (mild controlled Hotness while teaching vocabulary).

### Summary

```
 Stock-genome wiring of Hotness [153]
 ─────────────────────────────────────────────
 Inputs:
    Reaction 80 (gene 80):  Fever toxin + Water → 8× Hotness, half-life 24 (~0.8 s)
    Reaction 95 (gene 89):  2× Antigen 4 → 3× Antibody 4 + 1× Hotness, half-life 64 (~2 s)
    Reaction 98 (gene 91):  Antigen 6 → 3× Antibody 6 + 1× Hotness, half-life 116 (~4 s)
    Reaction 47 (gene 12):  Hotness backup → Hotness, Very short (reservoir refill)
    CHEM 153 <n> from room/agent CAOS scripts (hot environment, fire, lava, hot food, etc.)

 Sensory infrastructure:
    Sensorimotor locus 3 (LOC_HOTNESS) — engine-populated "air hotter than blood" signal.
                                         No stock emitter reads it → stock genome does NOT
                                         automatically convert air heat into chemical 153.

 Active drive:
    Hotness [153]
    Natural half-life 563 ticks (~19 s), "Medium" — DECAYS unlike hunger drives
    No initial concentration at birth (0/255)
                    │
                    ├──▶ Drives tissue locus 5 receptor (gain 204, Baby+) ▶ decision-lobe drive bar (Creature Companion)
                    ├──▶ Somatic RLOCUS_CLOCKRATE receptor id 77 (thresh 80, gain 127, Baby+) ▶ organ metabolism accelerates
                    ├──▶ Somatic RLOCUS_CLOCKRATE receptor id 97 (thresh 16, gain 192, Baby+) ▶ organ metabolism accelerates further
                    │
                    ├──▶ reaction 26 (gene 52) + Water → (nothing)  [evaporative cooling / sweat]
                    ├──▶ reaction 31 (gene 53) + 2× Water → (nothing)  [evaporative cooling, high-water]
                    │
                    ├──▶ reaction 60 (gene 32) → Hotness backup [136]
                    ├──▶ reaction 70 (gene 66) → Hotness backup [136]  (duplicate; parallel drain)
                    │    both half-life 6 ticks (~0.2 s), "Very short"
                    │
                    ├──▶ reaction 23 (gene 49) + Coldness → (nothing)  [instant-decay thermostat]
                    │
                    └──▶ CHEM 153 -n from cooling-agent scripts (consumption)

 Absent compared to hunger drives:
    - No constant sensorimotor emitter (no metabolic clock)
    - No initial concentration at birth
    - No Youth-gated critical-hunger alarm

 Present compared to hunger drives:
    - Natural (Medium) decay half-life — recovers without script intervention
    - Instant annihilation reaction with Coldness [152] — zero-sum thermostat
    - Evaporative-cooling reactions consuming Water — biochemical "sweat"
    - Somatic clock-rate receptors — heat accelerates ALL organ metabolism (UNIQUE)

 Absent compared to Coldness (152):
    - No digital involuntary-action reflex receptor in the stock genome (no pant/fan reflex)

 Present compared to Coldness (152):
    - Water-consuming evaporative decay (reactions 26 & 31)
    - Somatic RLOCUS_CLOCKRATE receptors (×2) — hot Norns metabolise faster
```

Hotness is the **event-driven, naturally-decaying, metabolism-accelerating drive chemical** on the hot side of the Norn thermostat. It aggregates heat discomfort from three separate physiological realities — infection, toxic fever, and ambient warmth — into one brain-visible signal that drives cool-seeking behaviour. Unlike its cold-side mirror, Hotness also **physically speeds up the creature's biochemistry** via the somatic clock-rate receptors, making fever a genuine metabolic state rather than just a behavioural signal. Its water-consuming evaporative reactions give hydration a direct role in thermal regulation, and its doubled drain into the long-lived reservoir at chemical 136 produces the same "bounce-plus-long-tail" profile seen on the cold side. Paired with Coldness (152) through the instant-decay annihilation reaction, it completes the clean zero-sum thermal sensation that every thermal agent in Creatures 3 builds on.
