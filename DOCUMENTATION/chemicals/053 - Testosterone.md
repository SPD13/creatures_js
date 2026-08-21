# 053 - Testosterone

Testosterone is the **male reproductive cycle hormone** — the exact masculine analogue of Oestrogen (chem 46). It drives sperm production in male Norns, Grendels and Ettins using the same `LOC_OVULATE` hysteresis machinery in `ReproductiveFaculty::Update()` that governs ovulation in females. The original engine's design comment makes this explicit: *"Males also use this receptor to control sperm generation — for example, a hormone level can rise and cause sperm to be produced, then fall to zero after sex to provide a recovery period."* Because the `myGamete` flag on the ReproductiveFaculty is interpreted as **egg** for females and **sperm** for males, one shared chemical clock suffices — each sex just wires its own hormone into the same locus.

The cycle works identically to the Oestrogen clock but with male-tuned parameters. When a male is **not** carrying viable sperm (`LOC_FERTILE = 0`), emitter 20 — configured with the `INVERT` flag — fires at fixed `DIGITAL` gain, pushing Testosterone into the bloodstream tick after tick. Testosterone accumulates until receptor 119 crosses its threshold (chem>48) and drives `LOC_OVULATE` above `OVULATEON = 0.627`. At that moment `ReproductiveFaculty::Update()` sets `myGamete = true` (prepared sperm), flips `LOC_FERTILE` to 1, and the `INVERT` on the emitter shuts it off. Testosterone then decays with its long 4960-tick half-life until receptor output falls below `OVULATEOFF = 0.314`, at which point the gamete is removed, `LOC_FERTILE` returns to 0, and the emitter restarts.

A mating event — `ReproductiveFaculty::DonateSperm()` — clears `myGamete` immediately (*"shot your bolt now"*). On the next tick, if Testosterone is still high enough to keep `myOvulateLocus > OVULATEON`, the faculty simply re-creates the sperm gamete (males are not rate-limited to one mating per cycle). The *real* recovery period only kicks in once natural decay has pulled `myOvulateLocus` back below the threshold — a design that lets a vigorous male mate repeatedly while his hormone level is high, but forces a rest when it dips.

Testosterone has **no brain receptor, no reaction (neither produced nor destroyed by any reaction), and no direct behavioural role**. Its only consumers are receptor 119 (sperm production) and the unused/scratchpad receptor 117. Unlike Oestrogen there is no pregnancy-suppression analogue — males cannot become pregnant, so Progesterone (chem 48) does not interact with Testosterone at all.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **Cyclic fertility emitter** (the sperm-production clock's source) | Emitter 20, gene 17, Youth onwards (age 3) | Creature / Reproductive, reads `LOC_FERTILE` | `DIGITAL (fixed gain), INVERT` — when `myFertileLocus` is below threshold 128 the emitter fires at fixed gain; when the creature is already fertile, it stops | Rate **4**, gain **5** — roughly twice the speed of Oestrogen's emitter 21 (rate 2, gain 3). Combined with Testosterone's much longer half-life, this gives a slower rise-then-slow-fall profile compared with Oestrogen's faster cycling |
| 2 | **Initial genome endowment** | Chemical init list | — | Starting concentration **86** at Youth switch-on | One-shot — seeds the bloodstream so a freshly matured male is immediately fertile, rather than waiting hundreds of ticks for the emitter to fill the pool from zero (same priming trick used by Oestrogen at init 65) |

There is no food source, no stimulus source, no reaction that produces Testosterone, and no CAOS-scripted source in the standard genome. It is a pure internal hormone, generated only by the creature's own reproductive feedback loop.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Sperm production trigger** (catalytic — receptor does not consume) | Receptor 119, gene 72, Youth onwards | Creature / Reproductive → `LOC_OVULATE` (`myOvulateLocus`) | Threshold **48**, gain 255, no flags — analog linear output proportional to (chem − threshold) | Feeds the hysteresis check in `ReproductiveFaculty::Update()`. When `myOvulateLocus > OVULATEON (0.627)` the faculty sets `myGamete = true` (prepared sperm for males, prepared egg for females — same code path, sex determines interpretation); when `myOvulateLocus < OVULATEOFF (0.314)` the gamete is removed. The `255` gain gives the receptor enough headroom to swing across the 0.314–0.627 band as Testosterone cycles. Threshold 48 is slightly lower than Oestrogen's 50, making the male cycle trigger a touch earlier per unit hormone |
| 2 | **Scratchpad circulatory signal** (catalytic — receptor does not consume) | Receptor 117, gene 69, Youth onwards | Creature / Circulatory → `myFloatingLoci[5]` (a generic floating locus, not a named locus) | Threshold 128, gain 255, `DIGITAL` (all-or-nothing) | Writes an all-or-nothing 1.0/0.0 signal into the shared Circulatory Locus 5 whenever Testosterone exceeds 128. This locus is a **floating/scratchpad** locus — it can be read by any other emitter or receptor wired to the same slot. In the standard genome several chemicals (Hunger for carbohydrate, Stress variants, Testosterone) all write here, making it a noisy shared bus rather than a precise signal. It exists primarily as a hook for CAOS scripts or third-party genome authors wanting to branch on "is this creature highly testosteronic?" without adding new genes |
| 3 | Passive decay | — | — | Half-life **4960 ticks** (decay rate 0.99986, "Long") | Much longer than Oestrogen's 621-tick half-life. Sets the *period* of the male sperm-production cycle — testosterone lingers in the bloodstream for much longer, so after a male becomes fertile it takes a proportionally longer time for the hormone to drop below `OVULATEOFF`. In practice this means a male's refractory window (when he cannot produce fresh sperm after depletion) is short, because the fresh sperm gets remade quickly once prior sperm is donated — so long as the hormone is still above threshold |

There is **no reaction** that destroys Testosterone. Unlike Oestrogen (which is catalytically destroyed by Progesterone during pregnancy to prevent further ovulation), there is no male-side pregnancy state and hence nothing to cull the hormone — males can cycle indefinitely from Youth to death. This asymmetry is biologically accurate: real-life males maintain testosterone production regardless of reproductive state, whereas female ovulation is famously suppressed during pregnancy.

## The Sperm-Production Cycle in Detail

The closed-loop interaction between Testosterone, `LOC_OVULATE`, and `LOC_FERTILE` is identical in shape to the Oestrogen/ovulation cycle documented on chem 46, but with the following male-specific twists:

1. **t=0 — Youth onset.** Testosterone starts at 86 (genome init, higher than Oestrogen's 65). Receptor 119 immediately reports `myOvulateLocus > OVULATEON` because 86 × (gain 255 / 256) / threshold 48 comfortably exceeds 0.627 → `myGamete = true` (first sperm produced) → `LOC_FERTILE = 1`.
2. **Fertility phase.** `LOC_FERTILE = 1` inverts emitter 20 **off**. No new Testosterone enters the blood. The existing pool decays with its 4960-tick half-life. The creature is fertile during this window and — via the Arousal Potential chain driven by `LOC_FERTILE` — can mate. If he mates, `DonateSperm()` clears `myGamete`, `LOC_FERTILE` drops to 0, and the emitter restarts; but because Testosterone is still above threshold, the next Update() simply re-creates `myGamete` and `LOC_FERTILE` goes back to 1. The male is therefore capable of successive matings inside one hormone peak.
3. **Decay phase.** Eventually — either because no mating has cleared the gamete, or because successive mating-induced emitter pulses fail to replenish as fast as decay — Testosterone drops enough that `myOvulateLocus` falls below `OVULATEOFF (0.314)`. The faculty removes `myGamete`. The creature becomes infertile. `LOC_FERTILE = 0`.
4. **Rebuilding phase.** `LOC_FERTILE = 0` re-enables emitter 20. Testosterone trickles back in at rate 4, gain 5. The long half-life means decay is slow, so the rebuild is a relatively short transition — the pool fills up faster than it drains. Once the level crosses `OVULATEON` again the cycle returns to step 2.

Because Testosterone never interacts with any reaction (unlike Oestrogen's Progesterone brake), the male's cycle is **purely thermostat-driven** — a clean hysteresis loop between the emitter and receptor with no external modulator. This makes the male system simpler but also less rich: there is no equivalent of the "pregnancy lock" that makes the female system genuinely state-dependent.

## Genome Initial Concentration

The 86/255 initial concentration (`biochemistry.json:8163-8167`) is set so a freshly grown male Norn is immediately fertile when reaching Youth at age 3. The higher initial value compared to Oestrogen's 65 compensates for the fact that receptor 119's threshold (48) is slightly lower than receptor 118's (50), while gain 255 is the same — the math works out so both sexes cross `OVULATEON` on the very first tick of Youth. This symmetry ensures both sexes enter adulthood ready to mate without an artificial delay.

## Asymmetry With Oestrogen

Comparing the male Testosterone system with the female Oestrogen system element-by-element:

| Property | Testosterone (male) | Oestrogen (female) |
|----------|---------------------|--------------------|
| Initial endowment | 86 | 65 |
| Half-life | 4960 ticks ("Long") | 621 ticks ("Medium") |
| Emitter rate / gain | 4 / 5 | 2 / 3 |
| Ovulation receptor threshold | 48 | 50 |
| Pregnancy-suppression reaction | **None** | Reaction 37 (Progesterone catalysis) |
| Additional receptor wiring | Receptor 117 → Circulatory Locus 5 (scratchpad) | — |
| Brain receptor | None | None |

The net result is that the male cycle is longer-period and more continuous (long half-life, no pregnancy lock), whereas the female cycle is shorter-period and state-gated (short half-life, pregnancy mops up the hormone). Biologically this matches real mammalian reproductive biology: males are approximately-continuously fertile; females cycle and pause for gestation.

## Key Source References

- The engine's reproductive update routine — design comment explicitly calling out testosterone-driven sperm generation and recovery period; implements shared hysteresis for both eggs and sperm via `myGamete`; `DonateSperm()` clears `myGamete` after successful mating; locus addressing wires `LOC_OVULATE` and `LOC_FERTILE` to the shared floats used by both sexes
- Circulatory Locus 5 resolves to `myFloatingLoci[5]` (the scratchpad receptor 117 writes into)
- `biochemistry.json` receptor 119 (line 5594) — Testosterone → `LOC_OVULATE`
- `biochemistry.json` receptor 117 (line 5555) — Testosterone → Circulatory Locus 5 (scratchpad)
- `biochemistry.json` emitter 20 (line 7438) — `LOC_FERTILE` (inverted) → Testosterone
- `biochemistry.json` initial concentration (line 8160) — starting value 86, half-life 4960
