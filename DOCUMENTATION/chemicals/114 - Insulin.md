# 114 - Insulin

Insulin is, in the classic biology sense, the **glucose-storage hormone** — the signal secreted by the pancreatic β-cells that tells the body "blood sugar is high, pack the excess away as glycogen/fat for later". The game's built-in chemical table (see `Libraries/creatures-chemicals.js:142`) even describes it as *"Regulates storage of glucose"*, and Organ #3, the creature's glucose-storage organ, is explicitly named **"Pancreas (β-cells / Insulin)"** in `BiochemistryConstants.js:57`. A reader coming from real physiology would expect Insulin to be at the centre of the game's carbohydrate metabolism.

In the **stock Creatures 3 / Docking Station Norn genome, however, Insulin is a vestigial chemical** — a reserved slot that exists in the chemical table but carries **zero active biology**. It has no reactions that produce or consume it, no receptors that read it, and no emitters that secrete it. Organ #3 instead implements its insulin-like role *directly*, by running a `6× Glucose → 1× Glycogen` reaction (reaction id varies with gene ordering) whose rate is modulated by an Adipose-Tissue feedback receptor — the chemical mediator (Insulin) has been "compiled out" of the loop. The name is preserved on Organ #3 as a real-biology metaphor, not as a chemical coupling.

Mechanically, Insulin therefore behaves exactly like the other named-but-unused chemical slots in the genome (Glycolase 115, Grendel/Ettin nitrate 118/119, etc.): it has a "Very long" half-life (≈9.07 × 10¹⁰ ticks, decay rate 1.0), so any amount you inject persists essentially forever; it starts at zero concentration at birth; it has no initial concentration entry in the standard genome; and it is invisible to all of the creature's metabolic, drive, and signalling machinery unless a breeder/scripter wires it into an imported genome or a modded agent script. It is, in effect, a **reserved name for genetic engineering** — a chemical slot that modders can attach reactions and receptors to in order to implement an explicit insulin-mediated storage pathway, without having to repurpose a slot that is already in use.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | *(none — stock genome)* | — | — | Insulin has **no emitter, no reaction product, and no initial-concentration gene** in the standard Norn genome. The steady-state value is **0** unless something external introduces it | — |
| 2 | External injection (scripting) | — | Any | `CHEM TARG 114 <amount>` or `INJR 114 <amount>` via CAOS; consumable agent scripts that call `CHEM` on a held creature; drug/food PRAY files whose chemical table targets chemical 114 | One-shot; persists indefinitely thanks to the ~infinite half-life |
| 3 | Modded / imported genomes | User-added | User-added | A breeder or genetic engineer may add a chemical-synthesis reaction (e.g. `Glucose → Insulin` to mimic real pancreatic secretion) or an emitter (e.g. on an "Adipose" or "Pancreas" organ reading Glucose level) that writes into chemical 114 | Gene-dependent |

Because the genome-defined biochemistry has no Insulin source, a stock Norn will live its entire life with Insulin locked at 0.000. Any non-zero reading therefore guarantees the chemical was set externally (a CAOS script, a modded agent, a mutated genome with added genes, or a test-tube injection from the debug console).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | *(none — stock genome)* | — | — | Insulin has **no reaction consumer, no receptor, and no locus binding** in the standard Norn genome. No physiological, behavioural, or animation system reads its concentration | — |
| 2 | Passive decay | Gene 64 (half-life table) | Bloodstream | Half-life ≈ 9.07 × 10¹⁰ ticks, decay rate 1.0 (`Very long`) | **Effectively none.** Injected Insulin persists indefinitely — the chemical does not evaporate on any meaningful timescale. A dose given at birth is still essentially intact at natural death |
| 3 | Modded / imported genomes | User-added | User-added | A breeder may add a receptor on the Reaction organ keyed to chemical 114 (modulating Glycogenesis rate), or a receptor on the Sensorimotor tissue (driving hunger, satiation, or involuntary actions), or even a drive-tissue receptor to couple Insulin to an emotional state | Gene-dependent |

## Role in Game Mechanics

### The "reserved name" nature of Insulin

The Creatures biochemistry subsystem allocates **256 chemical slots** in a fixed table (`Libraries/creatures-chemicals.js`, `Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`). Each slot carries three things: an id, a human-readable name, and a passive half-life/decay rate stored in the genome. Genes then attach *active* biology — reactions, emitters, receptors, initial concentrations — to whichever slots the genome designer wants to use.

Of the 256 slots, only around 130 actually have active biology attached in the stock Norn genome. The remainder are **reserved names**: the game's authors picked a label and a half-life for them so that mod authors and genome hackers have stable, semantically-meaningful slots to hang new biology on. Insulin (114) is one of these reserved names. Its neighbours include:

- **113 Pistle** (described as "Regulates urination") — also unused in stock biology
- **115 Glycolase** ("Splits glucose to release energy during glycolysis") — also unused
- **118 Grendel nitrate** / **119 Ettin nitrate** — used only for species-specific poisoning behaviour, largely vestigial in standard Norns

The pattern is intentional: by baking these names into the table, the game reserves a stable id for them across all mods, so a modded "pancreatic dysfunction" agent can target `CHEM 114 ...` knowing no stock genome will ever be affected by it and no two mods will collide on the same id.

### Why the stock genome skips the chemical mediator

Organ #3 (the "Pancreas (β-cells / Insulin)") is the organ you would expect to emit Insulin. It owns the `6× Glucose → 1× Glycogen` reaction, the feedback receptor on Adipose Tissue, and the Loneliness emitter. All three of those pieces of biology are wired *directly* — the reaction reads Glucose and writes Glycogen without passing through an Insulin intermediate; the Adipose receptor modulates the reaction's rate by feeding the reaction organ's "Reaction rate" locus, not by altering an Insulin pool. Inserting Insulin as an explicit mediator would require **three additional genes** (an emitter, a chemical-synthesis reaction, and a receptor) and would add nothing mechanically that the existing direct path does not already achieve.

This is a recurring design pattern in the C3 genome: wherever a real-biology process could be modelled either as "signal chemical → receptor → effect" or as "locus reads drive reaction rate directly", the genome almost always picks the shorter, directer path. The chemical mediator is kept only when one of:

- **Hysteresis** is needed (e.g. Downatrophin's 5-tick half-life debouncing the gait-8 animation switch)
- **Multiple consumers** need to read the same signal (e.g. Glucose is read by five receptors)
- **Diffusion between organs** is required (e.g. Adrenalin is produced in one organ and read by many)
- **CAOS-level tuning** is intended to be exposed (injectable hormones like Testosterone, Oestrogen, Adrenalin)

None of these apply to insulin-mediated glycogenesis: the trigger (high Glucose) and the effect (Glucose → Glycogen) happen in the same organ at the same tick, with no other consumers, no need for hysteresis, and no gameplay reason to let modders inject "Insulin" the way they can inject "Adrenalin". So the Insulin chemical was reserved for its *name* (and its *semantic* usefulness to modders) but not actually used.

### What happens if you inject Insulin into a stock Norn

Because Insulin has no receptors and no reaction couplings in the standard genome, injecting it has **no physiological effect whatsoever**. The classic test is:

```caos
setv va00 0
reps 10
  targ norn
  chem 114 255     * or INJR 114 255
  wait 30
  outv chem 114    * reads back the current concentration
  nextv
repe
```

The printout will show the Insulin reading climbing with each injection and then remaining essentially flat between them — because the half-life is effectively infinite, it does not decay; because nothing consumes it, it is never removed. The Norn will continue to eat, sleep, move, breed, age, and die exactly as it would have without the injections. A breeder watching only the Insulin column of the chemistry tab will see a steadily rising line that bears no relationship to the creature's behaviour.

This is the simplest confirmation that Insulin is genuinely vestigial in the stock genome: no receptor threshold is ever crossed, no reaction ever fires, no locus ever changes value as a result of the chemical being present.

### How modders can activate Insulin

Genome engineers who want to give Insulin a "real" role have several well-trodden options:

1. **Proper insulin-mediated glycogenesis.** Replace Organ #3's direct `Glucose → Glycogen` reaction with a two-step chain: `Glucose → Insulin` (emission), then `Insulin + Glucose → Glycogen` (consumption). This more-biologically-accurate pathway gives the modder a dial — the Insulin half-life — for how aggressive the creature's storage response is. Short half-life → Insulin-sensitive, stores only when Glucose is continuously high; long half-life → Insulin-resistant, keeps storing long after Glucose has fallen.

2. **A diabetes mechanic.** Add a receptor on Sensorimotor `LOC_INVOLUNTARY*` keyed to **low** Insulin (REDUCE flag) so that the creature lapses into a hyperglycaemic involuntary action when its pancreas fails to produce enough Insulin for the current Glucose level. Combined with a "diabetes virus" agent that injects an Insulin-destroying chemical, this gives a playable illness loop.

3. **A drug target.** Define a consumable agent "insulin shot" whose script calls `CHEM 114 <n>` on the creature that eats it. Paired with a new reaction that spends Insulin to lower blood Glucose directly, this turns Insulin into a usable in-world medication. Note that without such a reaction the "insulin shot" has no effect (see the previous section).

4. **A signalling slot for a new organ.** A brand-new organ (e.g. a "fat-cell" organ simulating real adipocytes) can emit Insulin into the bloodstream as its output signal, and have its own receptors on Insulin to self-regulate. Because nothing else in the stock genome competes for chemical 114, the new organ has exclusive ownership of the signal.

In every case the pattern is "add genes that make Insulin meaningful"; the chemical itself is a passive container waiting to be given a purpose.

### Relationship to the pancreas organ's name

Organ #3's name — "Pancreas (β-cells / Insulin)" — is therefore a **metaphorical** label rather than a mechanical coupling. The organ *plays the role* of the pancreatic β-cells in real physiology (converting excess glucose to a stored form, modulated by body-fat feedback) but does so without using the Insulin chemical that the same role would require in a real body. It is the behavioural analogue of insulin signalling, implemented without the messenger molecule.

This kind of metaphorical naming is consistent throughout the genome. Organ names like "Liver", "Hypothalamus", "Adrenal gland", and "Small intestine" describe the *function* the organ performs, not necessarily the set of chemicals it handles. The chemicals, conversely, are named after real biochemistry so that modders can reason about them — but as with Insulin, not every named chemical is biologically active in the base game.

### The half-life curiosity

All three of Insulin, Glycolase, and Ettin nitrate share the same decay-rate encoding — `genomeValue: 255`, which the decay formula `decayRate = 1 − (1/2)^(1/genomeValue)` resolves to a half-life of ~9 × 10¹⁰ ticks, i.e. effectively `decay rate = 1.0`. This is the "never decays" sentinel used for every effectively-passive chemical in the table (Glucose, Pyruvate, Oxygen all share it). For Insulin specifically, the choice is defensible on two grounds:

- **It prevents unintentional drift** if a modded agent ever injects Insulin: the stored value stays exactly at what the mod set it to, so downstream mod logic can reason about the value deterministically.
- **It makes "no biology" the default null state.** If Insulin had a short half-life instead, an injection would quietly fade to zero without firing anything — still harmless, but harder for a modder to diagnose why their new receptor never triggers. The infinite half-life is an invariant: "the value only changes when something explicitly changes it".

### Practical consequences for gameplay

- **Stock Norns can safely ignore Insulin.** Debug-console chemistry tabs will show it perpetually at zero on any creature that has never received external injections, and injections have no physiological consequences.
- **Do not mistake Insulin's presence in the chemical table for stock biology.** The game's internal docs and organ names make it sound active; in practice only Organ #3's direct `Glucose → Glycogen` reaction implements the "insulin function", without the chemical.
- **Modders can freely claim chemical 114 for their own use** — nothing in the stock genome will conflict. This makes it a natural choice for "realistic endocrinology" addons, diabetes-like illness mechanics, or new pancreatic agents.
- **Care when importing older-genome breeds.** A few experimental community genomes *do* wire Insulin into a real pathway (typically as a `Glucose → Insulin → Glycogen` chain). Creatures from such lines will show a meaningful Insulin column; injecting or draining it *will* have physiological effects for them. If unsure, inspect the imported creature's gene list for any reaction, receptor, or emitter referencing chemical 114 before drawing conclusions.
- **No need to feed "insulin drugs" to stock Norns.** Any consumable agent claiming to "give insulin" to a standard Norn is either a no-op (pure `CHEM 114` injection) or is actually delivering some other effect (e.g. CHEM on Glucose or Glycogen directly) and simply labelled as insulin for flavour.

### Summary

```
                   (No stock emitter)
                           │
                           ▼
       Insulin [114]   ────┼────  (No stock reaction consumes it)
       • half-life ≈ ∞     │
       • initial 0 / 256   │
       • no receptors      │
                           ▼
                   (No stock receptor reads it)

 Stock biology never sets, consumes, or reads Insulin.
 The "Pancreas / Insulin" organ #3 plays insulin's role directly,
 via   6× Glucose [3]  →  1× Glycogen [4],
 modulated by an Adipose-Tissue feedback receptor,
 without any chemical mediator.

 Insulin is a reserved chemical slot:
   - Named for semantic clarity and modder convenience
   - Kept inert in the stock genome by design
   - Free for modded genomes / agents to wire into real biology
```

Insulin therefore occupies an interesting niche in the Creatures 3 chemistry: it is the clearest example of a chemical that exists for **human readers and modders**, not for the creature itself. Its role in gameplay is not a biological function but an **extensibility point** — a stable, well-named, never-colliding chemical id reserved for future biology that the Docking Station shipped without implementing.
