# 127 - Injury

**Injury** is the creature's whole-body damage accumulator: a single scalar chemical that rises whenever *any* organ is hurt and falls whenever *any* organ repairs itself. It sits in slot **127** of the 256-entry chemical table, directly between **125 Life** (the lifespan clock) and **128 Stress** in the "late biological / long-term physiological state" band. Where Life counts down the ticks remaining in the Norn's natural lifespan, Injury is the **cumulative shadow of every organ insult** the Creature has suffered — blunt trauma from `INJR`, organ starvation from a missing metabolite, antigen-driven immune damage, heavy-metal poisoning, Geddonase attack — condensed into one bloodstream reading that both the body and the brain can observe.

Injury is unusual among the stock chemicals in that it has **no gene-defined source or sink**: no reaction produces it, no reaction consumes it, no emitter adds it to the bloodstream, no initial-concentration gene seeds it at birth. Its entire production and consumption is hard-wired into the engine, inside `Organ::Injure()` and `Organ::RepairInjury()`. Every time any organ's short-term life-force is reduced, the organ calls `myBiochemistryOwner->AddChemical(CHEM_INJURY, LF_TO_LOC(damage))`; every time any organ heals some of that damage back, the organ calls `myBiochemistryOwner->SubChemical(CHEM_INJURY, LF_TO_LOC(repair))`. The comment on the repair line — `// Emit drive chemical` — is the design-time giveaway: Injury is treated as a **drive-style signal** the way Hunger or Loneliness is, even though it is not registered as one of the 16 "proper" drives the Drive faculty polls (those live at chemicals 148-159 / 130-141).

On top of that engine bookkeeping, Injury decays on its own at a medium pace (half-life ≈ 209 ticks, `biochemistry.json:8600-8606`), so an acute injury becomes a rising spike that fades back toward zero over a few hundred biochem ticks even without repair activity. What the chemical reading represents is therefore **"recent unrepaired damage"**, not a permanent wound log — chronic damage will keep Injury elevated only for as long as it is actively accruing faster than it repairs and decays. Three live receptors read that reading (`biochemistry.json`, receptor ids 176, 177, 189): two are **Reaction-organ rate modulators** on the Somatic tissue that gate other reactions by the current injury level, and one is a **Sensorimotor receptor on LOC_GAIT6** that switches the Creature into its sixth gait animation — effectively a *limp* — as soon as Injury crosses a digital threshold. The chemical thus closes the loop between damage done at the organ layer, visible pain behaviour at the body layer, and downstream metabolic side-effects at the Reaction layer.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | Applied damage via `RLOCUS_INJURY` receptor | 45 receptor genes in the stock genome (`biochemistry.json`, locus `RLOCUS_INJURY`) — one per organ × per triggering chemical (Antigens 0-7, Glycotoxin, Geddonase, Heavy Metals, Lactate, Muscle toxin) | Every major organ / Somatic tissue, locus 2 (`RLOCUS_INJURY`) | The receptor reads a damaging chemical (e.g. Antigen 3 on the lungs at gain 62) and writes into `loc_InjuryToApply`. Each organ tick, `Organ::Update()` does `if (loc_InjuryToApply) { Injure(LOC_TO_LF(loc_InjuryToApply)/10.0f); loc_InjuryToApply=0; }`. `Injure()` reduces that organ's short-term life-force by the damage and calls `AddChemical(CHEM_INJURY, LF_TO_LOC(damage))` on the bloodstream | Proportional to the damaging-chemical concentration × receptor gain ÷ 10 |
| 2 | Organ starvation (no energy) | Hard-wired in `Organ::Update()` | Every organ / Somatic tissue | When an organ ticks but has no ATP/Glucose to fuel its reactions, it self-inflicts `myDamageDueToZeroEnergy` on its own short-term life-force. That damage path goes through the same `Injure()` call and therefore pumps `CHEM_INJURY` into the bloodstream at the same rate as external damage | `myDamageDueToZeroEnergy = myInitialLifeForce / 128.0f` (default) or gene-tuned; fired once per organ tick while starved |
| 3 | CAOS `INJR organ amount` command | `Command_INJR` → `Organ::Injure(LOC_TO_LF(amount)/10.0f)` | Targeted organ (0 = body organ, -1 = random, otherwise specific) | A script or Kit injects damage directly: the Medical Pod's "hurt" tests, Shee Agent injury FX, combat agents, the debug console's `INJR` button. Same code path as the receptor-driven injury (`Injure()` → `AddChemical(CHEM_INJURY, …)`), so the chemical reading rises in the bloodstream just like a real wound | One-shot per `INJR` call, amount clamped to 0.0-1.0 locus scale |
| 4 | Direct `CHEM 127 …` / `ADMN`-family chemical injection | `CHEM`, `ALTR`, chemical-injector agents | Creature / bloodstream (systemic) | A CAOS script or a consumable agent dumps chemical 127 directly into the creature's bloodstream without actually injuring an organ. The resulting reading *feels* like injury to the brain and to the gait receptor, even though no organ has lost life-force | One-shot per injection |
| 5 | Decay back from an elevated reading | Halflives gene, byte 127 = **54** (`biochemistry.json:8600-8606`) | Bloodstream (systemic) | This is the *passive* opposite of a source: once Injury is elevated, the biochem decay pass multiplies the reading by `decayRate ≈ 0.99669` every tick (`halfLifeInTicks ≈ 209`, "Medium" band), pulling it back toward zero absent further insults. This matters because it means an old injury reading fades even when the creature's organs cannot actively repair themselves | Passive, × 0.99669 per biochem tick |

Because sources 1-4 all funnel through `Organ::Injure()` (apart from source 4, which just writes the chemical), the bloodstream reading of `CHEM_INJURY` is almost exactly **"total life-force damage applied to all organs recently, in locus units"** — one chemical that summarises damage done across the whole body.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | Organ repair consumes Injury | Hard-wired in `Organ::RepairInjury()` | Every organ / Somatic tissue | During each organ tick, if energy is available, the organ moves `delta = myLongTermLifeForce − myShortTermLifeForce` back into short-term via `loc_LongTermRateOfRepair`, then calls `myBiochemistryOwner->SubChemical(CHEM_INJURY, LF_TO_LOC(repair))` | Every healed unit of life-force removes one matching locus unit from the `CHEM_INJURY` pool, so the bloodstream reading tracks the body's *unhealed* damage. No repair happens (and no Injury is consumed) if the creature has no energy |
| 2 | Injury-triggered "limp" gait | Receptor gene **id 101** (`biochemistry.json`, receptor id 189) | Creature / **Sensorimotor** / **LOC_GAIT6** | `chemical=127, threshold=64, nominal=0, gain=239, flags=DIGITAL (all-or-nothing)`, switches on at `AGE_BABY` | When Injury climbs above **64** (out of 255), the LOC_GAIT6 locus snaps to ~0.94 (`gain/255`). `Skeleton::UpdateGait()` scans `myGaitLoci[0..15]` and, because LOC_GAIT6 is the only non-default non-zero gait locus in the stock genome, selects gait 6's animation string (`myGaitTable[6]`). The Creature visibly switches from its normal walk to the **injured / limping** gait until Injury decays back below 64 |
| 3 | Reaction-rate modulator (invert-digital) | Receptor gene **id 107** (`biochemistry.json`, receptor id 176) | Reaction-organ / Somatic / Locus 0 | `chemical=127, threshold=26, nominal=224, gain=32, flags=REDUCE+DIGITAL`, switches on at `AGE_BABY` | The Reaction-organ's Locus 0 is the *rate multiplier* for the reaction defined by the same gene group. With REDUCE+DIGITAL flags, the locus is **on while Injury is low (< 26)** and **off while Injury is high**. Effect: a metabolic reaction that is suppressed whenever the creature is injured (pulling metabolic priority away from a normal-time reaction when damaged) |
| 4 | Reaction-rate modulator (threshold-gated) | Receptor gene **id 98** — the `1x Stress [128] + 1x Prostaglandin [94] → 1x Stress [128] + 1x Fatty Acid [6]` reaction (`biochemistry.json`, receptor id 177) | Reaction-organ / Somatic / Locus 0 | `chemical=127, threshold=16, nominal=192, gain=128, flags=none` (analog, non-inverted), switches on at `AGE_BABY` | This is the *Prostaglandin → Fatty Acid under stress* reaction, gated by Injury. The analog receptor lets the reaction's rate scale up smoothly as Injury rises above threshold 16, so the stress-driven fatty-acid release becomes progressively stronger the more injured the Norn is. In effect, **Injury unlocks a stress-mediated energy-mobilisation reaction**: a wounded stressed Norn converts more of the pain-modulator Prostaglandin into fuel |
| 5 | Readable for the brain via Biochemistry faculty | `Biochemistry::GetChemical(127)` | Creature / bloodstream (systemic) | Chemical 127 is a normal bloodstream chemical and is therefore available to every faculty, debug view, and Kit. The Creatures 3 Health Kit, the Science Kit's chemical graphs, the Observation Kit's "history of this creature" graph, the debug console chemistry dump, and the Shee Starship's Chemical Analysis Screen all expose it as `"Injury"` | "How hurt has this Creature been recently?" becomes a first-class observable for both in-game UI and external tools |
| 6 | Passive decay | Halflives byte 127 = **54** | Bloodstream (systemic) | `halfLifeInTicks ≈ 209`, `decayRate ≈ 0.99669`, "Medium" speed band. Multiplies the Injury reading by 0.99669 every biochem tick | Ensures that a spike of damage decays back to zero over a few hundred ticks on its own, so Injury is a **recent-damage** reading rather than a permanent wound log |

## Role in Game Mechanics

### What the reading actually represents

`CHEM_INJURY` is best understood as the bloodstream's rolling measurement of **"locus units of organ life-force damage currently unhealed and unreplaced"**. Each time `Organ::Injure(damage)` fires on any organ, `LF_TO_LOC(damage)` (the inverse of the `LocToLf` conversion in `INJR.js`: `damage / myInitialLifeForce`) is added to the bloodstream pool. Each time `Organ::RepairInjury` actually manages to repair `repair` units of short-term life-force, `LF_TO_LOC(repair)` is subtracted. A 1-to-1 ledger is maintained across 21 stock organs.

There is no per-organ injury chemical in the stock genome — the bloodstream pool is the *aggregated* damage signal. This is why a Norn whose stomach is being eaten by Antigen-3-driven autoimmune activity and a Norn who has just been `INJR`-ed on the body organ can both present with the same Injury reading: the chemical tells the brain and the gait system *that* the body is damaged, not *where*.

### The four places Injury is actually read

Only four things read chemical 127 in the stock genome and engine:

1. **The `LOC_GAIT6` receptor (id 189)** switches on the injured/limping gait when Injury > 64 (DIGITAL).
2. **The injury-suppresses-reaction receptor (id 176)** switches *off* a Somatic reaction when Injury > 26 (REDUCE+DIGITAL).
3. **The Prostaglandin-under-stress reaction receptor (id 177)** scales that reaction's rate *up* as Injury rises past 16 (analog).
4. **The `SubChemical(CHEM_INJURY, …)` call inside every organ's `RepairInjury()`** — this is not a "reader" so much as a bookkeeping consumer that keeps the pool honest.

That small reader set is deliberate. Injury is a **whole-body status signal**, not a drive. The actual *pain* drive the Creature's brain acts on is a separate chemical — Pain at slot 148 (`ChemicalNames.catalogue:214`) — with its own emitters and its own drive-lobe wiring. Injury feeds downstream chemistry (via receptors 176-177) and downstream animation (via receptor 189), but the brain's conscious "I am in pain, do something about it" behaviour is driven by Pain, not by Injury directly.

### The limping gait in detail

The whole-body gait-selection routine `UpdateGait()` works as follows. Each biochemistry tick, `myGaitLoci[0..15]` is refreshed from the gait receptors, and `UpdateGait()` picks the gait with the strongest non-zero locus value. In the stock genome, `myGaitLoci[6]` is the only non-default entry that ever fires (others are wired to chemicals that never rise above their thresholds in normal play), and it is driven exclusively by the Injury-on-LOC_GAIT6 receptor.

The mechanic is therefore:

- Norn is healthy → `CHEM_INJURY` ~ 0 → `myGaitLoci[6]` = 0 → `UpdateGait()` picks `myGaitTable[0]` (default walk).
- Norn takes a round of damage → `CHEM_INJURY` spikes past 64 → DIGITAL+`gain=239` slams `myGaitLoci[6]` to ~0.94 → `UpdateGait()` picks `myGaitTable[6]` (the injured gait). The Norn visibly limps.
- Injury decays back below 64 → `myGaitLoci[6]` snaps to 0 → gait 0 resumes. The Norn stops limping.

This is why players see wounded Norns immediately change their walk animation after a fall, a Grendel attack, or a sting from an aggressive Ettin, and why that visual limp *fades on its own* over a minute or two rather than needing a heal — the chemical reading is decaying under its half-life at the same time the organs are repairing themselves.

### The `RLOCUS_INJURY` receptor class — how damage gets in

`RLOCUS_INJURY` is the **per-organ locus that receives applied damage**. It is addressed by `Organ::GetLocusAddress(RLOCUS_INJURY)` returning `&loc_InjuryToApply`. Any receptor on an organ whose locus is `RLOCUS_INJURY` writes a pending-damage value into that field; the next `Organ::Update()` cranks through the sequence `Injure(LOC_TO_LF(loc_InjuryToApply)/10.0f); loc_InjuryToApply = 0;`.

The stock genome contains **45 RLOCUS_INJURY receptors** that connect toxic chemicals to organ damage. The damage-source chemical list is:

- **Antigens 0-7** (chemicals 82-89) — 38 receptors. Every antigen hurts one or two specific organs (e.g. Antigen 3 hurts the lungs at receptor gain 62). This is how the Creature's immune system "tracks which pathogen lives where": each antigen corresponds to a different tissue attack pattern.
- **Glycotoxin** (chemical 70) — 1 receptor. Glycotoxin damages the reproductive organ.
- **Geddonase** (chemical 69) — 1 receptor at low gain. Geddonase is the "meltdown" enzyme in the Creatures 3 biology and acts as a slow tissue dissolver.
- **Heavy Metals** (chemical 71) — 3 receptors. Heavy metals damage multiple filter organs (kidney etc.) simultaneously.
- **Lactate** (chemical 1) — 1 receptor at very low gain. Sustained muscle-organ lactate accumulation damages the muscle organ itself (the biological "overexertion" mechanic).
- **Muscle toxin** (chemical 81) — 1 receptor. Acute muscle-organ damage from Grendel-ettin toxin exposure.

In **all** 45 cases, the damage path is the same: receptor sees the toxin, writes to `loc_InjuryToApply`, `Organ::Update()` translates that into a call to `Injure()`, which shortens short-term life-force *and* pumps `CHEM_INJURY` into the bloodstream. So from the brain's point of view, a Creature made ill by Antigens looks identical to a Creature made ill by eating heavy metals: both produce the same rising Injury reading and the same eventual limp.

### The starvation path

When an organ has no energy, `Organ::Update()` does `Injure(myDamageDueToZeroEnergy)` every tick. `myDamageDueToZeroEnergy` is computed at construction as `myInitialLifeForce / 128.0f` and can be tuned per-organ by a gene. This is the biochemical mechanism for **starvation damage**: a Norn with no Glucose/ATP will watch its Injury reading climb steadily across ticks as every one of its 21 organs self-inflicts starvation damage, limping as soon as the aggregated reading hits 64 and eventually dying via the ATP/LOC_DIE pathway (which is a *different* receptor; see `125 - Life.md` for the death pipeline).

### Relationship to Pain (148), Stress (128), and ATP (35)

Injury lives in a small cluster of "how is the body doing?" chemicals that are often confused but play distinct roles:

- **Injury (127)** — *damage done.* Rises when organs lose life-force, falls when they repair. Consumed only by repair bookkeeping and read only by gait + two Somatic reactions.
- **Pain (148)** — *perceived pain drive.* A proper drive chemical the brain can act on; fed by its own emitters (external pain stimuli, pokes, burns) and consumed by drive-satisfaction reactions. Drives behaviour: "seek comfort, seek the medic, leave the hurt thing alone." See `DOCUMENTATION/chemicals/094 - Prostaglandin.md` for the Pain-modulator role of Prostaglandin.
- **Stress (128)** — *chronic-stress hormone.* Rises from adverse conditions (crowding, fear, prolonged drives) and combines with Prostaglandin in the reaction Injury gates up (item 4 in Usage).
- **ATP (35)** — *short-term energy reservoir.* Its depletion is the actual death-by-ill-health trigger via `LOC_DIE` (receptor id 108); Injury alone does not kill (see `125 - Life.md` for the death pathways).

A wounded Norn in the stock biology therefore shows a tightly-linked cascade: **Injury rises → limping gait + Prostaglandin-under-Stress reaction suppressed/up-regulated → Pain (a separate chemical) is emitted by pain-receptor organs → the brain reacts to Pain → ATP is drained by stressed metabolism → if ATP falls past `LOC_DIE` threshold, the Creature dies**. Injury is the mid-chain signalling molecule: downstream of organ damage, upstream of gait change and certain reaction modulators, adjacent to (but not identical with) the Pain drive.

### Why there is no Injury emitter, reaction, or initial concentration

The design pattern of Injury is the mirror of **Life** (125):

- **Life** is seeded once at birth and never produced again, consumed only by passive decay — the lifespan clock.
- **Injury** is **never** seeded (initial value 0), produced only by hard-wired engine calls in `Organ::Injure()`, and consumed by hard-wired engine calls in `Organ::RepairInjury()` plus passive decay — the whole-body damage signal.

Both chemicals sit outside the normal emitter/reaction/receptor loop for a reason: they are **bookkeeping chemicals** whose value is controlled by engine code, not by the genome. A modder can *read* them via new receptors (as the stock genome does via LOC_GAIT6 and the two Reaction receptors) but cannot easily put them into a normal biochemical pathway without modifying the engine itself. This is intentional: it prevents a runaway-emitter mod from producing "infinite Injury" from a wholly imaginary metabolic pathway, or a mod from seeding a Norn with pre-existing damage at birth.

### JS port notes

The Rebuild mirrors the original engine behaviour exactly at `Rebuild/Main_Game/src/engine/creature/biochemistry/Organ.js:375-419`:

- `Organ.injure(damage)` reduces `myShortTermLifeForce` and calls `myBiochemistryOwner.addChemical(CHEM_INJURY, this.lfToLoc(damage))`.
- `Organ.repairInjury(energyAvailable)` always accumulates long-term damage, but only spends short-term repair (and only debits `CHEM_INJURY`) if the organ has energy. This matches the `Emit drive chemical` comment in the original engine.
- The CAOS `INJR` handler (`Rebuild/Main_Game/src/engine/caos/commands/creatures/INJR.js`) converts the script-supplied locus amount into a life-force value via `organ.locToLf(amount) / 10.0` and calls `organ.injure()`. The divide-by-10 matches the original engine and means a full injury (`amount=1.0`) over 10 consecutive organ ticks will completely drain the organ's life-force.
- `CHEM_INJURY = 127` is defined at `BiochemistryConstants.js:20`.

The three reader receptors (gait 6, the two Reaction-organ modulators) are realised by the generic receptor/reaction biochemistry engine and do not need per-chemical handling: they are just ordinary receptor genes whose `chemical` field is 127.

### Practical consequences for gameplay

- **A limping Norn is injured, but not necessarily hurt.** The limp is driven by the bloodstream Injury reading, not by the Pain drive. A Norn can be limping (Injury > 64) without being in pain (Pain drive low) — e.g. if its pain receptors are disabled or if it has just been dosed with a painkiller that knocks down Pain but not Injury. Conversely, a Norn in acute Pain can be walking perfectly normally if the underlying damage has not raised Injury past 64.
- **Injury is a useful whole-body diagnostic.** Open the Health Kit or the Science Kit: a rising Injury reading over several ticks is a clear signal that *something* in this Norn is being damaged faster than it is healing. Cross-reference with the per-organ life-force graphs and the antigen / toxin panels to localise which organ and which cause.
- **Injury naturally decays.** A one-off shock (a `INJR 0 0.5` debug call, a fall, a single Grendel hit) produces a visible spike that fades away on its own over ~200-400 ticks. Chronic problems (an antigen the Norn cannot clear, heavy-metal poisoning, persistent starvation) produce a steady plateau or rising line — the difference between the two shapes, visible on the Kit graphs, is a key diagnostic tool.
- **Injecting chemical 127 is a valid cheat.** `CHEM 127 200` into a Norn will force it to limp and will activate the Stress-Prostaglandin reaction, but will *not* actually injure any organ — the bloodstream reading is high but the organs' short-term life-forces are unaffected. This is visible in save-file diffs: organ `myShortTermLifeForce` fields unchanged, `myChemicals[127]` elevated. Conversely, an `INJR` call both drains the targeted organ's life-force *and* raises the Injury chemical.
- **Injury is the natural "hurt animation" hook for modders.** To add a new "ouch, I've been poked" animation for a creature, a modder only has to fill in `myGaitTable[6]` with the new animation string; the existing Injury-on-LOC_GAIT6 receptor will trigger it automatically whenever the Norn takes real damage.

### Summary

```
   Organ takes damage (one of 45 toxin receptors on RLOCUS_INJURY,
                       zero-energy tick, INJR CAOS command,
                       or CHEM 127 injection)
                                 │
                                 ▼
                      Organ::Injure(damage)
                        • myShortTermLifeForce -= damage
                        • AddChemical(CHEM_INJURY, LF_TO_LOC(damage))
                                 │
                                 ▼
                   CHEM_INJURY [127] in bloodstream
                        • No reaction, no emitter, no initial conc
                        • Half-life ≈ 209 ticks ("Medium" decay)
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
   LOC_GAIT6 receptor     Reaction id 176 rec.    Reaction id 177 rec.
   (thr 64, DIGITAL)      (thr 26, REDUCE+DIG)    (thr 16, analog)
   Switches the body      Suppresses a Somatic    Up-regulates the
   into limping gait 6    reaction while hurt     Stress + Prostaglandin
   when Injury > 64       → Fatty Acid reaction
                                 │
                                 ▼
                   Organ::RepairInjury(energy)
                     • If energy: repair short-term life force
                     • SubChemical(CHEM_INJURY, LF_TO_LOC(repair))

   Injury is the whole-body damage accumulator:
     - Produced only by engine Organ::Injure() (no gene emitters, no reactions)
     - Consumed only by engine Organ::RepairInjury() + passive decay
     - Drives the limping gait and two Somatic reactions
     - Distinct from, but upstream of, the Pain drive (chemical 148)
     - Never kills by itself — death-by-ill-health goes via ATP / LOC_DIE
```

## Key Source References

- `DOCUMENTATION/CreaturesData/biochemistry.json`, receptor ids **176, 177, 189** — the three stock-genome readers of chemical 127 (two Reaction-organ rate modulators, one LOC_GAIT6 gait trigger)
- `DOCUMENTATION/CreaturesData/biochemistry.json`, 45 receptors at `locusName: "RLOCUS_INJURY"` — the full toxin → organ-damage table (Antigens 0-7, Glycotoxin, Geddonase, Heavy Metals, Lactate, Muscle toxin)
- `DOCUMENTATION/CreaturesData/biochemistry.json:8600-8606` — Injury's halflives entry: genome byte `54`, `halfLifeInTicks = 209`, `decayRate ≈ 0.99669`, speed "Medium"
- `Rebuild/Main_Game/src/engine/creature/biochemistry/Organ.js:375-419` — JS port of `Injure()` / `RepairInjury()` with CHEM_INJURY bookkeeping
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js:20` — `export const CHEM_INJURY = 127;`
- `Rebuild/Main_Game/src/engine/caos/commands/creatures/INJR.js` — JS port of the `INJR` CAOS command
