# 048 - Progesterone

Progesterone is the **pregnancy hormone** in Creatures 3. Unlike Oestrogen (chem 46) which drives the ovulation *cycle*, Progesterone is a one-way signalling chemical that rises monotonically during pregnancy and does three things: it (a) **blocks further ovulation** while the creature is carrying a zygote, (b) **drives the visual swelling** of the creature's body sprite so that a pregnant female looks visibly pregnant, and (c) at very high concentrations, **triggers the involuntary "lay egg" reflex** that physically ends the pregnancy. It is a purely internal hormone — it has no brain receptor, no food source, and no scripted authored input; its level is entirely determined by whether a zygote currently occupies genome store slot 1.

Pregnancy begins the moment `ReproductiveFaculty::AcceptSperm()` fills genome slot 1 with a fertilised moniker. From the next `Update()` tick onward, `IsPregnant()` returns true, `myPregnancyLocus` is set to 1.0, and emitter 19 — wired to `LOC_PREGNANT` with a threshold of 128 — begins firing at a fixed `DIGITAL` gain of 3 units per tick. Progesterone accumulates in the bloodstream; because its half-life is 141 ticks ("Medium") the emission rate easily outpaces decay, so the level climbs towards saturation. When the pregnancy ends (either by laying an egg or by the zygote being cleared from the genome store), `myPregnancyLocus` returns to 0, emitter 19 stops, and the residual Progesterone decays away over a few hundred ticks — which is why the female does not immediately become fertile again after laying: she must wait for the Progesterone pool to fall below the level at which it can suppress Oestrogen before the ovulation cycle restarts.

Progesterone also serves as the **catalyst for reaction 37** (`1× Oestrogen + 1× Progesterone → 1× Progesterone`), which regenerates Progesterone on the product side and therefore consumes only Oestrogen. This reaction is the chemical enforcement of "one pregnancy at a time": while Progesterone is high, any Oestrogen produced by the ovulation emitter is destroyed before it can raise `LOC_OVULATE` above `OVULATEON`, so no new gamete is created. This is the chemical equivalent of the real-world mechanism by which the progesterone of pregnancy suppresses the menstrual cycle.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **Pregnancy emitter** — produces Progesterone whenever a zygote occupies genome store slot 1 | Emitter 19, gene 13, Youth onwards (age 3) | Creature / Reproductive, reads `LOC_PREGNANT` (`myPregnancyLocus`) | `DIGITAL (fixed gain)` — fires when `myPregnancyLocus > 128/255` (i.e. whenever pregnant, since `myPregnancyLocus` is a binary 0/1 flag set by `ReproductiveFaculty::Update()`) | Rate 1, gain 3 — steady production that quickly saturates the chemical during a pregnancy |
| 2 | **Reaction 37 self-regeneration** (catalyst role) | Reaction 37, gene 77, Youth onwards | Creature / Reproductive | 1× Oestrogen [46] + 1× Progesterone [48] → 1× Progesterone [48] | Progesterone is net **unchanged** — it is consumed as a reactant but regenerated as the sole product, making it a catalyst for the destruction of Oestrogen. This does not create new Progesterone, but it does explain why Progesterone is "eternally" available once pregnancy starts |
| 3 | **Initial genome endowment** | Chemical init list (`biochemistry.json:8136-8142`) | — | Starting concentration **50/255** at Youth switch-on | One-shot priming — seeds the bloodstream so that a freshly-grown youth does not start with a completely empty Progesterone pool. This does not imply "pregnancy at birth" — it is below the `LOC_PREGNANT` emitter threshold of 128, and below the reaction 37 level that would suppress Oestrogen, so it simply avoids a cold-start discontinuity |

There is no food, stimulus, authored CAOS source, or behavioural-event source for Progesterone. Its concentration is a direct, continuous readout of the creature's pregnancy state.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Pregnancy-locked Oestrogen destruction** (catalytic) | Reaction 37, gene 77, Youth onwards | Somatic reaction | 1× Oestrogen [46] + 1× Progesterone [48] → 1× Progesterone [48] | While Progesterone is present, every tick of this reaction destroys one unit of Oestrogen without consuming any Progesterone. This holds `LOC_OVULATE` below `OVULATEOFF` and prevents the production of a new gamete. The creature cannot conceive again until the pregnancy ends and Progesterone decays |
| 2 | **Involuntary "lay egg" trigger** (consumed: no — catalytic) | Receptor 112, gene 68, Youth onwards | Creature / Sensorimotor → `LOC_INVOLUNTARY1` (Lay egg) | Threshold **223/255 ≈ 0.875**, gain 255, `DIGITAL` (all-or-nothing) | When Progesterone saturates past 223/255 the receptor fires the "lay egg" involuntary motor action at full strength. This is the physical event that ends the pregnancy: the female drops the egg, genome slot 1 empties, `IsPregnant()` returns false, and the emitter shuts off. Progesterone then decays away at the 141-tick half-life |
| 3 | **Body pregnancy-sprite selector** (read only, not a receptor) | Hard-coded in `Creature::Update()` → `Body::SetPregnancyStage()` | Body sprite lookup | `myPregnancyStage = round(progesteroneLevel × (NUMBER_OF_PREGNANCY_SPRITES − 1))` where `NUMBER_OF_PREGNANCY_SPRITES = 4` | Divides the Progesterone level into 4 sprite buckets (0, 1, 2, 3). Bucket 0 is the normal non-pregnant sprite; buckets 1-3 are progressively more-swollen pregnancy sprites selected via `SetCurrentIndexFromBase((myPregnancyStage × 16) + view)`. This is the *only* visual feedback the player gets that a creature is pregnant, and it is driven entirely by this chemical — not by `IsPregnant()` — which is why the belly shrinks *gradually* after laying as the hormone decays, rather than snapping back instantly |
| 4 | Passive decay | — | — | Half-life **141 ticks** (decay rate 0.99509, "Medium") | Governs the *tail* of pregnancy. After the egg is laid, Progesterone takes several hundred ticks to decay back below the ovulation-suppression level, giving the female a natural recovery / infertile period before her Oestrogen cycle can resume |

Progesterone has **no brain receptor** — it is invisible to the stim, decision, and concept lobes. It drives no drive, no emotion, and no learned behaviour. Everything it does is either mechanical (pregnancy-sprite bucketing, involuntary action triggering) or chemical (reaction 37). This is by design: in the Creatures 3 biochemistry Progesterone is a **state hormone**, not a drive hormone, just like Oestrogen.

## The Pregnancy Arc in Detail

The complete life of a Progesterone pool spans one pregnancy, from insemination to delivery to post-partum recovery:

1. **Insemination (t = 0).** The female accepts sperm via `ReproductiveFaculty::AcceptSperm()`; a fertilised moniker is created by `GenomeStore::CrossoverFrom()` and written into slot 1. The gamete flag `myGamete` is cleared, so `LOC_FERTILE` drops to 0.
2. **Accumulation phase (t ≈ 0 → a few hundred ticks).** `ReproductiveFaculty::Update()` sets `myPregnancyLocus = 1.0` on the next tick. Emitter 19 begins firing gain 3 every tick. Progesterone climbs. As it crosses each of the 4-bucket thresholds (~0.0, 0.33, 0.66, 1.0) the body sprite switches to the next pregnancy pose via `Creature::Update()` → `SetPregnancyStage()`. Meanwhile reaction 37 is now active: any Oestrogen trickling in from emitter 21 is chewed up before it can re-trigger ovulation.
3. **Plateau (high Progesterone).** The emission rate of 3/tick vastly exceeds the decay loss (0.5% per tick from a base near saturation), so Progesterone sits near saturation for the bulk of the pregnancy. The female displays the full pregnancy silhouette. `LOC_OVULATE` stays below `OVULATEOFF`; no new gametes are produced.
4. **Birth trigger (Progesterone > 223).** Once the level crosses the high threshold, receptor 112 fires `LOC_INVOLUNTARY1` (Lay egg). The MotorFaculty interrupts the current voluntary action and executes the lay-egg involuntary script, which removes the zygote from slot 1 and spawns an egg agent.
5. **Post-partum decay.** With slot 1 empty, `IsPregnant()` returns false, `myPregnancyLocus` drops to 0, and emitter 19 stops. Progesterone now decays at 0.995/tick. Over ~300-600 ticks it falls below the reaction-37 effective threshold (small but non-zero) and below the 0.875 lay-egg threshold. During this window, the belly visibly shrinks back through sprite buckets 3 → 2 → 1 → 0. Once Progesterone is low enough that reaction 37 no longer meaningfully suppresses Oestrogen accumulation, the Oestrogen ovulation cycle restarts and the creature becomes fertile again.

Note the interlock between chemical levels and visual state: the body sprite is a **direct continuous readout of the Progesterone chemical**, not a boolean pregnancy flag. This is why a female "looks pregnant for a while" after laying — the sprite tracks the decay curve, not the genome slot.

## Why Progesterone is Primed at 50/255

The genome init table seeds Progesterone at 50/255 at Youth switch-on. At first glance this looks paradoxical — a just-grown youth is not pregnant, so the init value is non-zero for a hormone that supposedly only rises during pregnancy. The reason is symmetric with Oestrogen's 65/255 prime: it guarantees reaction 37 has **some** Progesterone available from tick 0 to catalyse Oestrogen destruction if/when needed, without having to wait for the emitter to build up from zero during a pregnancy's first few ticks. 50/255 is well below the 128/255 emitter threshold and well below the 223/255 lay-egg threshold, so it is chemically inert on its own — but it ensures reaction 37 fires immediately once a zygote appears, closing the pregnancy feedback loop cleanly.

## Interaction with the Oestrogen Cycle

Oestrogen (chem 46) and Progesterone (chem 48) form a **mutually exclusive pair**:

- **Not pregnant → only Oestrogen runs.** `LOC_PREGNANT = 0` so emitter 19 is silent, Progesterone decays to zero, reaction 37 is effectively inactive. Oestrogen is free to cycle between `OVULATEOFF` and `OVULATEON`, producing periodic gametes.
- **Pregnant → only Progesterone runs.** `LOC_PREGNANT = 1` so emitter 19 saturates Progesterone. Reaction 37 destroys any Oestrogen the ovulation emitter tries to produce, locking `LOC_OVULATE` below `OVULATEOFF`. No new gametes are created.

This binary switch between the two hormonal regimes is the chemical machinery that enforces the rule "a creature can carry one pregnancy at a time", without any explicit code in the faculty having to check it — it is an emergent property of the genome's chemistry alone.

## Key Source References

- The engine's reproductive update routine — sets `myPregnancyLocus` from `IsPregnant()` (genome slot 1 occupancy), implements `AcceptSperm()` writing the fertilised moniker, and exposes `GetProgesteroneLevel()` reading chem 48 directly
- The engine's creature update feeds Progesterone into the body sprite via `Body::SetPregnancyStage()` and the 4-bucket sprite lookup (NUMBER_OF_PREGNANCY_SPRITES=4)
- `CHEM_PROGESTERONE = 48` in the biochemistry constants
- Locus annotation: `LOC_INVOLUNTARY1 = "Lay egg"` (note: the biochemistry.json annotation labelling this locus "Sneeze" is incorrect; the authoritative constants table shows Involuntary 1 is Lay egg, Involuntary 2 is Sneeze)
- `biochemistry.json` emitter 19 (line 7418) — `LOC_PREGNANT` → Progesterone
- `biochemistry.json` receptor 112 (line 5460) — Progesterone → `LOC_INVOLUNTARY1` (Lay egg)
- `biochemistry.json` reaction 37 (line 1204) — Progesterone-catalysed Oestrogen destruction
- `biochemistry.json` chemical init (line 8136) — 50/255 seed, half-life 141
