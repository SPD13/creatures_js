# 113 - Pistle

Pistle is the **high-urea alarm hormone** of the standard Norn biochemistry — a short-lived signalling chemical that the body releases automatically whenever blood Urea climbs above a critical level, and that in turn triggers a coupled "purge and cool" response: it accelerates the destruction of the offending Urea, it speeds up the entire Reaction organ so that purge runs at full throttle, and it catalyses an evaporative-cooling reaction that turns Water into the Coldness drive-signal. The name (echoing "pistle"/excretion) is a clue — Pistle is the engine's analogue to the kidney/sweat-gland endocrine axis, dumping nitrogenous waste while shedding heat at the same time.

Crucially, Pistle is **not produced by a normal life-stage emitter or by reading any sensory locus** — it is produced by a *floating-locus* trick on the Circulatory tissue. The genome wires a receptor for Urea (threshold 192) and an emitter for Pistle to the **same** floating locus on Creature/Circulatory (locus 1). When the receptor flips that locus to 255, the emitter sees the change and pumps Pistle into the bloodstream at full gain. This is the "produce chemical B when chemical A exceeds threshold" pattern that the engine documents as the entire reason floating loci exist. Urea above 192 ⇒ Pistle on; Urea below 192 ⇒ Pistle off — and because Pistle's half-life is only 13 ticks (~0.43 s of real time), the signal disappears almost immediately when the underlying urea drops.

Once Pistle is in the bloodstream, three things happen in parallel inside the Reaction organ. (1) A receptor on `RLOCUS_CLOCKRATE` reads Pistle and boosts the organ's clock rate to maximum, so all reactions in the Reaction organ run faster. (2) Reaction 28 burns Pistle 1:1 with Urea and produces *nothing* — both molecules are deleted, which is the actual urea-disposal pathway. (3) Reaction 29 uses Pistle as a *catalyst* (consumed and re-produced 1:1) to destroy Water and emit 3× Coldness, providing the engine's evaporative-cooling effect. Pistle therefore couples nitrogen excretion to thermoregulation in a single hormone, exactly the way mammalian sweat couples water loss to cooling.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **Urea-triggered floating-locus emitter** — the only endogenous source of Pistle | Emitter 14, gene 8, Baby onwards (age 0) | Creature / Circulatory, locus 1 (floating-locus pair, `LOC_FLOATING_FIRST..LAST`) | Threshold **128**, rate **1**, gain **255**, **DIGITAL (fixed gain)** — fires whenever the floating locus is held above 128. The locus is itself driven by **Receptor 84** (gene 44) on the same Creature/Circulatory locus 1, which reads **Urea > 192** with DIGITAL all-or-nothing flag and gain 255: any urea above 192 saturates the locus to 255, which trips the emitter. The pair effectively implements *"if Urea > 192 then emit Pistle at maximum rate"* — the canonical floating-locus idiom. | Fixed-gain DIGITAL output: maximum emission as soon as the threshold is crossed, no proportional response. The result is a square-wave hormone that is fully on while urea is dangerous and fully off otherwise |

There is **no initial concentration** in the genome (Pistle has only a `chemicalRates` entry, no `initialConcentrations` entry) — every creature starts life with zero Pistle and only ever produces it in response to urea overload. There is no food source, no stimulus source, no second emitter, and no CAOS-scripted source in the standard genome. Pistle exists *only* as a derived alarm signal of the floating-locus pair.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Reaction-organ clockrate boost** | Receptor 92, gene 31, Baby onwards | Reaction organ / Somatic / Locus 0 (`RLOCUS_CLOCKRATE`) | Threshold **80**, nominal 11, gain **248**, **DIGITAL (all-or-nothing)** | When Pistle exceeds 80, the receptor flips fully on and drives the Reaction organ's clock rate to maximum (gain 248 of a possible 255). All reactions in the Reaction organ — including the urea-purge and water-to-coldness reactions below — therefore run at full speed for as long as Pistle is present. This is what makes the alarm response *fast*: the Reaction organ over-clocks itself the moment urea-driven Pistle appears |
| 2 | **Urea purge** — destroys both reactants 1:1 | Reaction 28, gene 51, Baby onwards | Reaction organ | `1× Urea [25] + 1× Pistle [113] → (nothing)` | The actual nitrogen-disposal pathway. Each tick, this reaction deletes one unit of Urea and one unit of Pistle without producing anything. Because Pistle is itself driven by a Urea > 192 receptor, the system is **self-extinguishing**: the hormone consumes the very signal that produced it, and as urea drops back below 192 the floating-locus emitter shuts off, halting further Pistle production. Combined with Pistle's 13-tick half-life, the result is a sharp burst of urea-clearance that stops automatically as soon as the danger is past. Reaction half-life 105 ticks ("Medium") |
| 3 | **Evaporative cooling catalyst** — Pistle as catalyst, Water consumed | Reaction 29, gene 54, Baby onwards | Reaction organ | `1× Water [33] + 1× Pistle [113] → 3× Coldness [152] + 1× Pistle [113]` | Pistle is regenerated 1:1 (true catalyst), but Water is destroyed and 3× Coldness is produced. Coldness is `LOC_COLDNESS`, the sensorimotor drive locus that "how far air temp is below blood temperature" — increasing it makes the creature *feel* colder, which the brain treats as a comfort cue and which damps temperature-driven behaviour. In effect, Pistle bursts make the creature **lose body water** to gain a transient cool sensation — biologically analogous to sweating: the body loses fluid in exchange for thermoregulation. Reaction half-life 116 ticks ("Medium") |
| 4 | Passive decay | — | — | Half-life **13 ticks** (decay rate 0.94846, "Short") | Equivalent to ~0.43 s of real time at 30 ticks/second — among the fastest decay rates in the biochemistry. Pistle is therefore a true *transient alarm* hormone: it never accumulates in the bloodstream, it appears the instant urea exceeds the threshold and disappears the instant urea falls back below it. The short half-life is what allows the system to use Pistle as a clean on/off control signal rather than an integrated stress hormone |

There is **no brain receptor** for Pistle — it has no direct behavioural effect, no drive, no neuron lobe input, no learning-system involvement. It is a pure body-internal control hormone whose entire job is to gate the urea-purge and cooling reactions.

## The Floating-Locus Trick: How Pistle Senses Urea

The Circulatory floating-locus pair (`LOC_FLOATING_FIRST..LOC_FLOATING_LAST` on Creature/Circulatory) is the engine's mechanism for letting one chemical *cause* another to be produced without writing a reaction for it. The engine's design comment is explicit:

> *These IDs are both receptor AND emitter loci. They allow me to attach a receptor directly to an emitter and therefore make one chemical respond to the existence or non-existence of another in a more complex way than Reactions can handle. For instance "produce chem B when chem A exceeds threshold".*

The Pistle pair is a textbook use of this idiom:

1. **Receptor 84 (gene 44)** sits on Creature/Circulatory/Locus 1 and reads chemical **25 (Urea)** with threshold 192, DIGITAL all-or-nothing, gain 255. When blood Urea exceeds 192, it writes 255 to floating-locus 1.
2. **Emitter 14 (gene 8)** sits on the same Creature/Circulatory/Locus 1, reads it as an emitter input, threshold 128, DIGITAL fixed gain, gain 255. Whenever the locus value exceeds 128, it emits Pistle at full rate.
3. Because the receptor is DIGITAL (it writes either 0 or 255 — never an in-between value), and the emitter threshold (128) is below the receptor's saturation value (255), the pair behaves as a **clean Schmitt-trigger**: Urea > 192 ⇒ Pistle full-on; Urea ≤ 192 ⇒ Pistle full-off.

This is more powerful than a reaction would be: a normal reaction `Urea → Urea + Pistle` would produce Pistle proportionally at all urea levels, whereas the floating-locus pair produces *no* Pistle at safe urea levels and a *strong* burst at dangerous ones. Pistle therefore stays at zero for the vast majority of a creature's life and only spikes when a real metabolic crisis is in progress.

## The Coupled Purge-and-Cool Response

When Pistle fires, three coordinated responses happen in the Reaction organ within a few ticks of each other:

1. **Tick 0** — Urea crosses 192. Receptor 84 writes 255 to floating-locus 1. Emitter 14 begins dumping Pistle at full rate.
2. **Tick 1-3** — Pistle blood concentration rises past 80. Receptor 92 on the Reaction organ's `RLOCUS_CLOCKRATE` flips on, doubling-and-then-some the Reaction organ's clock rate (gain 248/255).
3. **Tick 1+** — Reaction 28 begins running at the over-clocked rate, deleting Urea and Pistle 1:1. Each unit of Pistle that's destroyed also takes one unit of Urea with it.
4. **Tick 1+** — Reaction 29 begins running in parallel, also at the over-clocked rate. It does *not* consume Pistle (catalyst) but it consumes Water and writes 3× into the Coldness drive locus per cycle. The creature begins to feel cold.
5. **Tick N** — Urea drops back below 192. Receptor 84 zeroes the floating locus. Emitter 14 stops emitting. The remaining Pistle is destroyed within ~13 ticks (one half-life) by a combination of Reaction 28 (if any urea is left) and natural decay.
6. **Tick N+13** — Pistle is essentially gone. Reaction-organ clock rate falls back to baseline. Reactions 28 and 29 stop running. Coldness production halts and Coldness itself decays through the normal sensorimotor pathway.

The net effect is a sharp, self-extinguishing crisis response that purges nitrogen waste and chills the creature simultaneously, all without any input from the brain or external behaviour.

## Why Couple Excretion With Cooling?

Coupling urea purge to evaporative cooling is a deliberate piece of biological mimicry. In real mammals, the kidneys excrete urea dissolved in water, and sweat glands lose water in service of thermoregulation; both pathways are water-expensive, both are triggered by similar systemic stressors (overheating, exertion, dehydration), and both are coordinated by overlapping endocrine signals. The Creatures 3 design folds the two systems into a single hormone:

- The **Water cost** of Reaction 29 (1 Water per cycle, repeated rapidly while Pistle is active) means a Pistle burst measurably depletes the Water chemical. A creature with high urea will lose water as it purges — exactly as a real animal under metabolic stress would.
- The **Coldness output** feeds the sensorimotor drive system, modulating how cold the creature *feels*. Because Coldness is read by `LOC_COLDNESS` and ultimately influences the brain's drive lobe, a Pistle burst makes the creature feel cooler for the duration of the response.
- The combination means a creature whose metabolism is under stress (high urea) will both excrete and cool, and will then need to drink to replenish the lost water — closing a behavioural loop that reinforces the biology.

## Comparison With Other Alarm/Excretion Hormones

| Chemical | Role | Trigger | Consumer | Half-life |
|----------|------|---------|----------|-----------|
| **Pistle (113)** | High-urea purge & cooling alarm | Urea > 192 (floating-locus pair) | Reaction 28 (Urea+Pistle→∅), Reaction 29 (Water→Coldness, catalyst) | 13 ticks (Short) |
| Urea (25) | Nitrogenous waste | Protein/amino-acid catabolism | Reaction 28 (Pistle pathway), normal decay | — |
| Ammonia (26) | Toxic nitrogen intermediate | Amino-acid breakdown | Reaction 30 (2 NH₃ + CO₂ → Urea + H₂O) | — |
| Coldness (152) | "How cold I feel" sensorimotor signal | Reaction 29 (Pistle-driven), environment | Sensorimotor / drive lobe | — |

Pistle is the only hormone in the standard genome that is produced *purely* by a floating-locus pair rather than by a normal life-stage emitter or sensorimotor reading. It is also one of the very few hormones whose only job is to gate other reactions — it has no brain receptor, no drive influence, no learning role. It is a pure metabolic relay: a chemical fuse that blows when nitrogen waste gets dangerous and ignites the disposal cascade.

## Key Source References

- `biochemistry.json:907-939` — Reaction 28 (`1× Urea + 1× Pistle → (nothing)`), gene 51, half-life 105 ticks
- `biochemistry.json:940-972` — Reaction 29 (`1× Water + 1× Pistle → 3× Coldness + 1× Pistle`), gene 54, half-life 116 ticks
- `biochemistry.json:5083-5098` — Receptor 92 (Reaction-organ clockrate gate), gene 31, DIGITAL threshold 80, gain 248
- `biochemistry.json:7325-7342` — Emitter 14 (Pistle on Creature/Circulatory/floating-locus 1), gene 8, DIGITAL fixed gain 255, threshold 128
- `biochemistry.json:4928-4946` — Receptor 84 (Urea sensor on the same floating-locus 1), gene 44, DIGITAL all-or-nothing threshold 192, gain 255
- `biochemistry.json:8528-8535` — Pistle decay rate (half-life 13 ticks, "Short"), no initial concentration
