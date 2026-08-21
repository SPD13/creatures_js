# 125 - Life

**Life** is the single chemical that holds the clock of a Creature's natural lifespan. It sits in slot **125** of the 256-entry chemical table, in the "late biological" band next to **124 Activase** and **127 Injury**, and unlike the neighbouring enzyme-reservation slots it is **actively wired into the Norn's biology** — it is arguably the single most load-bearing chemical in the whole game, because without it no Creature would ever advance through the Seven Ages of Norn and no Creature would ever die of old age.

Mechanically, Life is an **inert reservoir with a fixed initial charge and a slow, monotone decay**. At birth the genome seeds the Creature's bloodstream with a full tank of Life: the initial-concentration gene (`biochemistry.json:9474-9483`, gene id 12) writes **amount = 255 (concentration = 1.0)** into chemical 125. After that, **no reaction in the stock genome produces or consumes Life**, and **no emitter replenishes it**. The only thing that touches the Life pool is the half-life decay table (`biochemistry.json:8592-8599`, genome byte 99 → `halfLifeInTicks ≈ 17 951`, decay rate ≈ 0.99996, "Very long" speed band), which drains Life geometrically tick by tick. Life is therefore a **one-way countdown**: the instant the embryo is assembled the clock starts, and the concentration falls smoothly toward zero over the rest of the Creature's natural life.

What Life *does* is trigger aging. Seven digital-inverted chemoreceptors (ids 101-107, gene ids 60 and 62-67 — `biochemistry.json:5251-5383`) sit on the **Creature / Somatic / LOC_AGE0..LOC_AGE6** aging loci, each one wired to read chemical 125. Every age transition in the Norn's life — Baby→Child, Child→Adolescent, Adolescent→Youth, Youth→Adult, Adult→Old, Old→Senile, and finally Senile→Death — is literally a Life-threshold crossing. Because the receptors carry the `REDUCE (invert)` flag, each one fires when Life **falls below** its threshold; because they carry the `DIGITAL (all-or-nothing)` flag, each one slams its `myAgeingLoci[age]` locus from 0 to 1 the instant that crossing happens. `LifeFaculty::Update()` polls the age-appropriate entry of that array each tick and, the first time it goes non-zero, calls `ForceAgeing()` which bumps `myAge`, re-expresses the genome for the new life stage, and fires the `SCRIPTAGE` event. When the chain reaches `LOC_AGE6` and `myAge` hits `NUMAGES` (=7), the Creature is forced into `deadState` regardless of its other chemistry — this is death by old age.

In other words, the **Life chemical is the Creature's lifespan timer reified as a biochemical** — a design that is unique in the whole chemical table. Hunger, pain, drives, hormones, nutrients, immune chemicals: every other actively-wired chemical has a production path and a consumption path and exists in a roughly-steady-state equilibrium. Life alone is initialised once, consumed only by passive decay, and read only by age-transition receptors. Its entire purpose is to be a slow-dripping sand-timer whose threshold crossings spell out the punctuation of a Norn's life.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration at birth | Initial-concentration gene id **12** (`biochemistry.json:9474-9483`, entry id 25) | Creature / bloodstream (systemic) | At the moment the embryo's `age=0` genes express, chemical 125 is seeded with **amount = 255 (concentration = 1.0)**. This is the only "source" of Life in the stock Norn genome | One-shot at birth |
| 2 | CAOS / external injection | — | Any | `CHEM 125 <amount>` or `INJR 125 <amount>` on a Creature; consumable agents whose chemical table targets chemical 125; debug-console chemical editor; Shee Starship's Chemical Injection module (Chemical Analysis Screen) | One-shot per injection; then decays at the normal rate |
| 3 | Modded genomes / longevity mods | User-specific | User-specific | A community mod may add an emitter (e.g. keyed to "eating the right food" or to a custom "fountain of youth" locus) that tops up Life, effectively extending lifespan or resetting an age gate. Nothing in the stock genome does this | Gene-dependent |

Because Life has **no stock emitter and no stock reaction product**, a wild-born Norn's Life reading can only ever go down over time. The only way for it to rise is external intervention — a player-issued CAOS `CHEM 125 ...` injection, a modded agent that delivers chemical 125 on consumption, or a modded genome that wires up an in-body emitter.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Baby → Child aging trigger | Receptor gene id **60** (`biochemistry.json:5251-5269`, receptor id 101) | Creature / Somatic / **LOC_AGE0** | `chemical=125, threshold=229, nominal=119, gain=255, flags=REDUCE+DIGITAL`, switches on at `AGE_BABY` | When Life falls below **229**, the LOC_AGE0 locus flips to 1, `LifeFaculty::Update()` calls `ForceAgeing()`, `myAge` moves from 0 (Baby) to 1 (Child), the genome is re-expressed for the Child life stage, and the `SCRIPTAGE` event fires |
| 2 | Child → Adolescent aging trigger | Receptor gene id **62** (`biochemistry.json:5270-5288`, receptor id 102) | Creature / Somatic / **LOC_AGE1** | `threshold=194, nominal=116, gain=255, flags=REDUCE+DIGITAL`, switches on at `AGE_CHILD` | When Life falls below **194**, `myAge` advances from Child to Adolescent; gene expression switches on Child→Adolescent-gated genes (instincts for language continue, ovulation systems come online) |
| 3 | Adolescent → Youth aging trigger | Receptor gene id **63** (`biochemistry.json:5289-5307`, receptor id 103) | Creature / Somatic / **LOC_AGE2** | `threshold=165, nominal=128, gain=255, flags=REDUCE+DIGITAL`, switches on at `AGE_ADOLESCENT` | When Life falls below **165**, `myAge` advances from Adolescent to Youth; pair-bonding, mating, and reproductive behaviours come fully online |
| 4 | Youth → Adult aging trigger | Receptor gene id **64** (`biochemistry.json:5308-5326`, receptor id 104) | Creature / Somatic / **LOC_AGE3** | `threshold=136, nominal=128, gain=255, flags=REDUCE+DIGITAL`, switches on at `AGE_YOUTH` | When Life falls below **136**, `myAge` advances from Youth to Adult; genes gated on adulthood express (mature sprite set, adult-only behaviours) |
| 5 | Adult → Old aging trigger | Receptor gene id **65** (`biochemistry.json:5327-5345`, receptor id 105) | Creature / Somatic / **LOC_AGE4** | `threshold=19, nominal=128, gain=255, flags=REDUCE+DIGITAL`, switches on at `AGE_ADULT` | When Life falls below **19**, `myAge` advances from Adult to Old; reproductive interest fades, "failing faculties" genes come online. This is the longest age stage — the threshold gap from 136 down to 19 is very wide |
| 6 | Old → Senile aging trigger | Receptor gene id **66** (`biochemistry.json:5346-5364`, receptor id 106) | Creature / Somatic / **LOC_AGE5** | `threshold=10, nominal=128, gain=255, flags=REDUCE+DIGITAL`, switches on at `AGE_OLD` | When Life falls below **10**, `myAge` advances from Old to Senile; the genome design notes comment: "slowly poisoning yourself to death" — Senile-gated genes begin degrading the Norn's metabolism |
| 7 | Senile → Die (of old age) | Receptor gene id **67** (`biochemistry.json:5365-5383`, receptor id 107) | Creature / Somatic / **LOC_AGE6** | `threshold=5, nominal=112, gain=255, flags=REDUCE+DIGITAL`, switches on at `AGE_SENILE` | When Life falls below **5**, the LOC_AGE6 locus fires. `LifeFaculty::ForceAgeing()` advances `myAge` past `NUMAGES` (=7); the `myAge>=NUMAGES` guard then calls `SetWhetherDead(true)` unconditionally, regardless of the Creature's other chemistry. The Creature drops what it is carrying, is removed from friend/foe sets, executes its `SCRIPTDIE` script, closes its eyes, and has a `typeDied` event written to its history. The header comment on `LOC_AGE6` flags it as "only implement receptor if death needs to be forced to occur" — the engine already kills on `myAge>=NUMAGES`, so the receptor is a belt-and-braces redundancy |
| 8 | Passive decay | Halflives gene, byte 125 = **99** (`biochemistry.json:8592-8599`) | Bloodstream (systemic) | `halfLifeInTicks = 17 951`, `decayRate ≈ 0.99996139`, speed band "Very long". Life's concentration is multiplied by the decay rate every biochemistry tick | **This is the lifespan clock itself.** Starting from 255, Life halves every ~17 951 biochem ticks. See the "Lifespan arithmetic" section below for the resulting age-stage durations |

## Role in Game Mechanics

### Life *is* the lifespan

The Creatures biochemistry engine is built around the idea that everything a Creature does must be expressible as a chemical reading crossing a receptor threshold. Aging is no exception: there is no separate "lifespan" variable in `LifeFaculty`, there is no wall-clock age cutoff, there is no deterministic "after N ticks, die" rule. `myAge` only ever changes when `myAgeingLoci[myAge]` — a float in the receptor-output array — becomes non-zero, and the only thing wired into those loci is the Life chemical falling below the seven thresholds.

This has an elegant consequence: **a Creature's lifespan is entirely controlled by the interplay between the Life half-life and the seven age thresholds**. Want a longer-lived species? Lower the half-life genome byte (higher byte = slower decay, because of the `decayRate = 1 − 0.5^(1/byte)` formula). Want a Creature that stays a child longer? Raise the Baby→Child threshold so Life has to fall further before the receptor fires. Want an eternally-young Creature? Set the LOC_AGE0 threshold to zero and the receptor will never fire even as Life drains to nothing — the Creature will age nominally but the aging gates will stay locked. This is exactly what experimental "immortal Norn" mods do.

### How the aging receptor works in detail

Each age-transition receptor has the same four-byte shape: `chemical=125 (Life), threshold=T, nominal=N, gain=255, flags=0x03 (REDUCE+DIGITAL)`.

- **`REDUCE` (bit 0, "invert")** flips the sign of the receptor's internal signal. A normal receptor computes `(chemical − threshold)`, clamps it positive, and delivers a signal whose magnitude grows as the chemical *rises* past threshold. A REDUCE receptor computes `(threshold − chemical)`, so its signal grows as the chemical *falls* below threshold. This is essential for Life: aging must be triggered when the Life reservoir drains *down* past the threshold, not when it rises past it.
- **`DIGITAL` (bit 1, "all-or-nothing")** collapses the receptor's analog output to a binary step: either 0 (while chemical > threshold) or the full `gain` value (the instant chemical ≤ threshold). Combined with `gain=255`, a DIGITAL aging receptor slams its locus from 0.0 to the maximum as soon as the crossing happens, giving `LifeFaculty::Update()` a crisp "yes, age now" signal with no ambiguity.
- **`switchOnAge`** on the receptor (Baby for LOC_AGE0, Child for LOC_AGE1, etc.) is the **life-stage gate** on the gene itself: gene id 62 for the Child→Adolescent receptor is only *expressed* once the Creature enters `AGE_CHILD`. This enforces the strictly-sequential ordering of life stages: even if Life somehow shot back up to 255 and then drained past threshold 194 while the Creature was still a Baby, the Child→Adolescent receptor would not be active yet (its gene has not expressed), so the Baby would not skip straight to Adolescent. Each life stage has exactly one aging receptor live at any moment, and they fire in order.

### Lifespan arithmetic

The decay equation each tick is `Life(t+1) = Life(t) × 0.99996139`, starting from `Life(0) = 255/255 = 1.0` (the chemical scale is 0-1 internally, displayed as 0-255). Equivalently, `Life(t) = exp(−t × ln 2 / 17951)`.

Solving for the threshold crossings (thresholds are on the 0-255 scale, so divide by 255 to get the internal fraction, then take a log):

| Transition | Threshold | Cumulative ticks to cross | Δ ticks in this stage |
|------------|-----------|---------------------------|------------------------|
| Baby → Child (LOC_AGE0) | 229 / 255 ≈ 0.898 | ≈ 2 774 | ≈ 2 774 (Baby stage) |
| Child → Adolescent (LOC_AGE1) | 194 / 255 ≈ 0.761 | ≈ 7 074 | ≈ 4 300 (Child) |
| Adolescent → Youth (LOC_AGE2) | 165 / 255 ≈ 0.647 | ≈ 11 290 | ≈ 4 216 (Adolescent) |
| Youth → Adult (LOC_AGE3) | 136 / 255 ≈ 0.533 | ≈ 16 282 | ≈ 4 992 (Youth) |
| Adult → Old (LOC_AGE4) | 19 / 255 ≈ 0.0745 | ≈ 67 244 | ≈ 50 962 (Adult — the long plateau) |
| Old → Senile (LOC_AGE5) | 10 / 255 ≈ 0.0392 | ≈ 83 906 | ≈ 16 662 (Old) |
| Senile → Die (LOC_AGE6) | 5 / 255 ≈ 0.0196 | ≈ 101 857 | ≈ 17 951 (Senile) |

A "Very long" chemical band ticks once per biochemistry update, and biochemistry updates run on the Creature's own tick schedule; at the default world tick rate the full natural lifespan comes to roughly **100 000 biochem ticks from birth to death of old age**. The shape of the curve is deliberate: Baby/Child/Adolescent/Youth are packed into the first ~16 000 ticks (the first four stages together are ~16% of total lifespan), then Adult dominates the next ~51 000 ticks (about 50% of the whole life), and Old+Senile together are another ~34 000 ticks. This matches the documented design intent: the four early stages are formative and fast (embryological, language, maturation, pair-bonding), Adulthood is the meaty "lived" phase, and Old+Senile are a gradual failure.

### The aging pipeline end-to-end

When a Creature crosses an age threshold, the following happens in a single `LifeFaculty::Update()` call:

1. The biochemistry engine, on its regular decay pass, multiplies the Life concentration by `decayRate`. At some tick, the new value falls below the currently-armed LOC_AGE*n* threshold.
2. The LOC_AGE*n* receptor (gene expressed because `switchOnAge == myAge`) computes its REDUCE+DIGITAL output: `1.0 × gain = 255/255 = 1.0`. It writes that value into `myAgeingLoci[n]` via the locus address returned by `LifeFaculty::GetLocusAddress`.
3. Next `LifeFaculty::Update()` call: the `if (myAgeingLoci[myAge])` guard at line 101 sees the non-zero value and calls `ForceAgeing()` (line 103).
4. `ForceAgeing()` calls `Creature::PrepareForAgeing(myNextAge)` — this handles the multi-tick visual transition (sprite / body-part swap animates over several ticks). If the visuals are ready, `myAge++`, `Creature::ExpressGenes()` is called to re-scan the genome and express all genes whose `switchOnAge` equals the new `myAge`, and `SCRIPTAGE` fires so agent scripts can react to the transition.
5. If the visuals are not ready yet, `myNumberOfForceAgeingRequestsPending++` and the transition is deferred to subsequent ticks (the deferred-request logic handles the replay). This is the "debug ageing too fast" safety-net described in the code.
6. At the new life stage, genes gated on that stage (including the *next* aging receptor) come online, and the Creature's body, brain lobes, instincts, and drives reconfigure to match. Life continues decaying; the next threshold sits somewhere between the current Life value and zero.
7. On the final transition, `myAge` reaches `NUMAGES` (=7). Both the `myAge>=NUMAGES` guard (post-Update) and the guard inside `ForceAgeing` call `SetWhetherDead(true)`. The Creature stops carrying items, is removed from all friend/foe lists, transitions to `deadState` (a state the body cannot leave — `SetWhetherDead` is annotated `"can't rejuvenate"`), stops its VM, executes `SCRIPTDIE`, closes its eyes, and writes a `typeDied` event to the HistoryStore.

### Relationship to the other death pathway

There are actually **two ways a Creature can die** in the engine:

- **Death by old age** — triggered by Life falling below the final threshold (LOC_AGE6 = 5). This is what the Life chemical is for.
- **Death by ill health** — triggered by the **ATP** chemical falling below a threshold, routed through a different receptor (`biochemistry.json:5384-5402`, receptor id 108, gene id 163) on `Creature / Immune / LOC_DIE`. That receptor feeds `myDeathTriggerLocus`, which `LifeFaculty::Update()` checks with `if (myDeathTriggerLocus>0.0f) SetWhetherDead(true)`.

Life and ATP thus divide labour: ATP is the short-term health reservoir (refilled constantly by metabolism, drained by activity and disease; see `DOCUMENTATION/chemicals/035 - ATP.md`), and its depletion signals acute metabolic collapse — starvation, disease, wounding, toxic chemistry. Life is the long-term lifespan clock that ticks down regardless of how well-fed or healthy the Creature is. A well-cared-for Norn dies of old age (Life → 5); a starved or poisoned Norn dies of ill health (ATP → threshold) long before that.

Because Life's decay is independent of any other chemistry, **a Creature cannot extend its natural lifespan through good nutrition, exercise, or medicine in the stock genome** — no reaction adds Life, no emitter refills it, no food chemical produces it. The only way to slow aging in a stock Norn is to inject Life externally with `CHEM 125 ...`, and the only way to speed it up is either to drain Life externally (`CHEM 125 -<amount>`) or to use the `AGE+` / `AGE` CAOS command which directly increments `myAge` without waiting for a threshold.

### The `SCRIPTAGE` event and the Life-driven narrative

Every Life-triggered aging call ends with `SendAgeEvent()`, which fires the Norn's `SCRIPTAGE` event script. This is the hook every agent in the game uses to react to a Creature growing up: sprite sets swap in, the Norn's name is announced, birthdays and milestones are written to the Health Kit and the History system, the Observation Kit updates its age display, the Breeder Display refreshes. The whole "Seven Ages of Norn" narrative that players see — the baby appearing, the child learning to talk, the adolescent becoming interested in the opposite sex, the adult mating, the old Norn slowing down, the senile Norn hobbling — is paced out by Life's decay curve and punctuated by seven `SCRIPTAGE` firings.

### Why Life sits at slot 125

Slot 125 is in the "late biological" band of the chemical table (110-128), which groups chemicals related to long-term physiological state rather than moment-to-moment metabolism or drives:

- **124 Activase** — reserved enzyme-activator slot (inactive in stock; see `124 - Activase.md`)
- **125 Life** — **actively used: the lifespan clock**
- **127 Injury** — **actively used**: the damage accumulator that feeds into the ill-health death trigger
- **128 Stress** — **actively used**: the long-term stress hormone

Placing Life next to Injury is a small piece of designer intent: the two chemicals together are "how close is this Creature to being finished?" — Injury tracks accumulated damage, Life tracks accumulated time. The two death pathways (LOC_AGE6 on Life, LOC_DIE on ATP-as-proxy for health) both live in `LifeFaculty` because the Life chemical ultimately owns the concept of "alive vs dead" even when the triggering signal comes from elsewhere.

### Practical consequences for gameplay

- **Life is readable in every debug view.** The Creatures 3 Science Kit, the Observation Kit's chemistry page, the debug-console chemistry dump, and the Shee Starship's Chemical Analysis Screen all expose chemical 125 by name. A Creature's remaining lifespan can be *eyeballed* directly from its Life reading: `~229` = just born, `~136` = young adult, `~19` = middle-aged, `~10` = old, `<5` = about to die of old age.
- **Life is the safe knob for lifespan mods.** Extending a Creature's life does not require modifying any receptor, reaction, or emitter — just raising the genome half-life byte for chemical 125 (byte `0x7D` in the halflives gene). Doubling the byte from 99 to 198 roughly halves the decay rate, approximately doubling every age-stage duration.
- **Injecting Life resets the aging gate.** Because the aging receptors are DIGITAL, the `myAgeingLoci[myAge]` locus is only read as "fire" *while* Life is below threshold. If a player pumps `CHEM 125 200` into an Old Norn before LOC_AGE5 has fired, Life rises back above 10, the receptor output drops back to zero, and the aging step is averted until Life drains below 10 again. This is the mechanic behind "fountain of youth" potions in some community mods.
- **Life cannot be used to skip ages.** The `switchOnAge` gating on each receptor gene means only the receptor for the current life stage is live. Dropping Life to 3 in a Baby will not jump the Norn straight to dead — the Baby's only active aging receptor is LOC_AGE0 with threshold 229, which triggered long before Life reached 3. The Baby ages to Child, then the Child's LOC_AGE1 receptor (threshold 194) fires immediately (because Life is already at 3), then Adolescent's LOC_AGE2 (threshold 165) fires, and so on: the Norn chains through all seven transitions back-to-back, each gated on the visual-transition animation completing via `PrepareForAgeing`. The result is a rapid but still *ordered* cascade through every life stage, ending in death of old age, rather than a direct skip. The `myNumberOfForceAgeingRequestsPending` counter exists precisely to handle this "too many aging triggers in a single update" case.
- **Life is a fragile measurement target for IQ / fitness.** Because Life only ever goes down at a fixed rate, it is not a useful proxy for "how well this Creature is doing". For that purpose, other chemicals (ATP, Glycogen, Stress, Boredom, the drives) carry far more moment-to-moment information. Life tells you only "how many biochem ticks of natural life remain".

### Summary

```
  (Birth: initial-concentration gene id 12 writes chemical 125 = 255/255)
                                  │
                                  ▼
     Life [125]  ────────────────────────────────  (No emitter, no reaction input)
      • halflives byte = 99                                     │
        → half-life 17 951 ticks (≈ "Very long")                │
      • initial 255 / 255 at birth                              │ Passive decay:
      • no stock emitters                                       │ × 0.99996139/tick
      • no stock reactions                                      │
                                  │                             │
                                  ▼                             ▼
         Seven REDUCE+DIGITAL aging receptors                Dead of old age
         on Creature / Somatic / LOC_AGE0..LOC_AGE6          when myAge ≥ NUMAGES
         fire in order as Life crosses:
           229 → Baby → Child          (LOC_AGE0)
           194 → Child → Adolescent    (LOC_AGE1)
           165 → Adolescent → Youth    (LOC_AGE2)
           136 → Youth → Adult         (LOC_AGE3)
            19 → Adult → Old           (LOC_AGE4)
            10 → Old → Senile          (LOC_AGE5)
             5 → Senile → Die          (LOC_AGE6)
         Each firing: myAge++, ExpressGenes(), SCRIPTAGE
         Final firing: SetWhetherDead(true), SCRIPTDIE

  Life is the Creature's lifespan clock reified as a chemical:
    - Seeded once at birth, never refilled by stock biology
    - Drained by passive decay at a "Very long" half-life
    - Read only by the seven age-transition receptors
    - Its threshold crossings spell out the Seven Ages of Norn
      and set the moment of natural death
```

## Key Source References

- `DOCUMENTATION/CreaturesData/biochemistry.json:5251-5383` — the seven aging receptors (ids 101-107, gene ids 60 and 62-67), each wired to chemical 125 with REDUCE+DIGITAL flags and decreasing thresholds
- `DOCUMENTATION/CreaturesData/biochemistry.json:8592-8599` — Life's halflives entry: genome byte 99 → `halfLifeInTicks = 17951`, `decayRate = 0.99996139`, speed "Very long"
- `DOCUMENTATION/CreaturesData/biochemistry.json:9474-9483` — Life's initial-concentration gene (id 25, geneId 12): `amount = 255, concentration = 1.0` at `AGE_BABY`
- `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js` — JS port of the LifeFaculty, mirroring the aging pipeline and death transitions
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — 256-slot chemical table and `LOC_AGE*` locus constants used by the JS rebuild
