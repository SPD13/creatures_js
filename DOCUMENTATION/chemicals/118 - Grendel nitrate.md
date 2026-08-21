# 118 - Grendel nitrate

Grendel nitrate is the name the Creatures 3 / Docking Station chemical table attaches to slot **118** — one of a pair of species-flavoured "nitrate" slots (the other being 119 Ettin nitrate) that the game's authors reserved to hint at a **species-specific metabolic waste / toxin pathway** in the Grendel's biochemistry. In the lore the Grendel is a carnivorous, toxin-producing cousin of the Norn; real-biology "Grendel nitrate" would naturally live in the same family as ammonia (26) and urea (25) — nitrogenous end-products of protein metabolism — but attached specifically to the Grendel's body. Its neighbours in the chemical table are the carnivore antibody line (109 Antibody 7), the anabolic steroids and protein-control chemicals (112 Anabolic steroid, 113 Pistle, 114 Insulin, 115 Glycolase), and the other species nitrate (119) — all slots in the "late metabolic" band of the table.

In the **stock Creatures 3 / Docking Station Norn genome, Grendel nitrate is a vestigial chemical** — a reserved slot that exists in the chemical table but carries **zero active biology**. There is no emitter that secretes it, no reaction that produces or consumes it, no receptor that reads it, no initial-concentration gene that seeds it, and — uniquely among its immediate neighbours — **not even a half-life gene entry** in the decoded biochemistry (`DOCUMENTATION/CreaturesData/biochemistry.json`): chemicals 117 Adrenalin and 119 Ettin nitrate both appear in the halflives list, while **118 is absent**, a small footnote showing that the Norn genome treats this slot as "not my problem" rather than as a shared metabolite.

Mechanically, Grendel nitrate therefore behaves exactly like the other named-but-unused chemical slots in the genome (Insulin 114, Glycolase 115, Pistle 113, Ettin nitrate 119, etc.): it starts at zero concentration at birth, it is invisible to all of the Norn's metabolic, drive, and signalling machinery, and — because it is also not part of the Norn's half-life table — any amount that ever enters it through scripting will persist at whatever value the genome's default initialisation leaves the decay rate at (functionally the same "effectively infinite half-life" behaviour as the other reserved slots). It is, in effect, a **species marker** — a chemical slot reserved by the engine so that a Grendel-specific genome, a modded "grendel-poison" agent, or a Norn→Grendel cross-genome experiment has a stable, semantically-meaningful id to attach the toxin biology to, without colliding with slots already in use by the Norn's body.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | *(none — stock Norn genome)* | — | — | Grendel nitrate has **no emitter, no reaction product, and no initial-concentration gene** in the standard Norn genome. It is also absent from the Norn's halflives table. The steady-state value is **0** unless something external introduces it | — |
| 2 | External injection (scripting) | — | Any | `CHEM TARG 118 <amount>` or `INJR 118 <amount>` via CAOS; consumable agent scripts that call `CHEM` on a held creature; drug / food PRAY files whose chemical table targets chemical 118 | One-shot; persists indefinitely because nothing consumes it |
| 3 | Grendel-species / modded genomes | User- or Grendel-specific | User- or Grendel-specific | A Grendel genome or a breeder's modded genome may attach the Grendel-metabolism biology — typically an emitter on a digestive / liver organ keyed to Protein or Amino Acid abundance, producing Grendel nitrate as a nitrogenous by-product (by analogy with Ammonia → Urea in the Norn) | Gene-dependent |
| 4 | Environmental ingestion (CAOS) | — | Mouth / digestive pathway | A scripted "grendel poison berry" or "grendel corpse bite" agent can deliver chemical 118 into a Norn that eats it, using the Drive system's hook for consumables | One-shot per ingestion |

Because the stock Norn genome has no Grendel-nitrate source, a standard Docking Station Norn will live its entire life with the reading locked at 0.000. Any non-zero reading therefore guarantees the chemical was set externally (a CAOS script, a modded agent, an imported cross-genome creature, or a test-tube injection from the debug console).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | *(none — stock Norn genome)* | — | — | Grendel nitrate has **no reaction consumer, no receptor, and no locus binding** in the standard Norn genome. No physiological, behavioural, or animation system reads its concentration | — |
| 2 | Passive decay | *(default initialisation)* | Bloodstream | Slot 118 is not present in the Norn halflives export, so its decay rate is left at whatever the `Biochemistry::myChemicalDecayRates` array was initialised to before the halflife genes were applied (functionally "never decays" in practice) | **Effectively none.** Injected Grendel nitrate persists indefinitely — the chemical does not evaporate on any meaningful timescale |
| 3 | Grendel-species / modded genomes | User- or Grendel-specific | Kidney-analogue / digestive organ | A Grendel genome may attach a receptor keyed to Grendel nitrate on an involuntary sensorimotor locus (e.g. a "nausea → vomit" action) or a reaction that consumes Grendel nitrate to produce Urea / Ammonia / Water, modelling renal clearance of the toxin | Gene-dependent |
| 4 | Modded toxicity mechanic | User-added | Any | A modded "grendel allergy" receptor on REDUCE-Life or REDUCE-Glucose can make a Norn who absorbs Grendel nitrate take continuous physiological damage, giving the lore-canonical "Grendels are poisonous to Norns" mechanic a concrete implementation | Gene-dependent |

## Role in Game Mechanics

### The "reserved name" nature of Grendel nitrate

The Creatures biochemistry subsystem allocates **256 chemical slots** in a fixed table (`Libraries/creatures-chemicals.js:146`, `Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`). Each slot carries three things: an id, a human-readable name, and a passive half-life/decay rate stored in the genome. Genes then attach *active* biology — reactions, emitters, receptors, initial concentrations — to whichever slots the genome designer wants to use.

Of the 256 slots, only around 130 actually have active biology attached in the stock Norn genome. The remainder are **reserved names**: the game's authors picked a label and (usually) a half-life for them so that mod authors and genome hackers have stable, semantically-meaningful slots to hang new biology on. Grendel nitrate (118) is one of these reserved names, occupying a specifically **species-coded** corner of the table:

- **109 Antibody 7** — immune chemical, part of the shared antibody line
- **112 Anabolic steroid / 113 Pistle / 114 Insulin / 115 Glycolase** — metabolic enzymes and hormones, mostly vestigial in the stock Norn
- **116 Dehydrogenase** — actually *is* used, appearing in the lipid and protein metabolic chains
- **117 Adrenalin** — actively used (stress hormone, short half-life 209 ticks)
- **118 Grendel nitrate** — **Grendel-species slot, inactive on Norns**
- **119 Ettin nitrate** — **Ettin-species slot, inactive on Norns**
- **120, 121, … 127** — unnamed slots; modders can claim them

The pattern is intentional: by baking these names into the table, the game reserves a stable id for "the Grendel's nitrogenous waste", so that a future Grendel genome, a modded cross-breed, or a user-written "grendel poison" agent can target `CHEM 118 ...` knowing no stock Norn genome will ever accidentally be affected by it, and no two mods will collide on the same id.

### Why the Norn genome has no half-life for slot 118

Most reserved chemicals in the Norn genome (including 113 Pistle, 114 Insulin, 115 Glycolase, 119 Ettin nitrate) still carry a **half-life byte** in the halflives gene, usually set to the sentinel value `255` (which the decay formula `decayRate = 1 − (1/2)^(1/genomeValue)` resolves to an effective half-life of ~9 × 10¹⁰ ticks — "never decays"). This is the standard way the Norn genome tells the engine "this chemical exists but I'm not going to do anything with it".

Grendel nitrate (118) is treated differently in the decoded biochemistry dump: it has **no entry** in the halflives array at all. Two readings of this are consistent with how the genome decoder works:

- **Export artefact.** The halflives gene stores bytes for all 256 chemicals in a single 256-byte block (`Biochemistry.js:360-379`). Every chemical therefore gets *some* decay rate from the gene. The JSON export in `biochemistry.json` may simply filter out entries whose byte equals a shared "defaulted" value, and the Norn designer may have left slot 118 at a byte value (e.g. 0) that the exporter skips as uninteresting. This is consistent with chemical 120 also being absent from the list while 121 is present.
- **Deliberate abdication.** By leaving slot 118 at whatever byte value falls there in the gene (rather than setting it explicitly to 255 like the other reserved slots), the Norn genome signals that it is not claiming responsibility for this chemical's behaviour at all — neither as an active metabolite *nor* as a deliberately-inert reserved slot. Slot 118 belongs to the *Grendel's* biology, and the Norn genome intentionally leaves the setting to whatever the Grendel's own half-life gene would have written.

The second reading is more satisfying interpretatively: the Grendel genome (if decoded separately) almost certainly *does* set chemical 118 explicitly, because it produces and consumes Grendel nitrate as part of its metabolism. The Norn genome's silence on the slot is a form of species-scoping — the chemical is a Grendel concern and the Norn's half-life gene simply says nothing about it. At runtime on a Norn this produces the same practical effect as any of the other "reserved" slots (infinite half-life in practice, since nothing consumes it either), but the absence-of-entry rather than explicit-255 is a small signature of species ownership.

### Canonical lore: Grendels as poisonous to Norns

The Creatures franchise established early that **Grendels are supposed to be toxic to Norns** — bites transfer disease, close contact triggers Antigen emissions (`biochemistry.json` Grendel-specific antigens), and proximity lowers a Norn's mood. Grendel nitrate is the chemical-table hook for a *metabolic* version of this same story: a nitrogenous compound produced by Grendel physiology that, if transferred into a Norn's body (by bite, by eating Grendel remains, or by drinking contaminated water), would represent a literal biochemical toxin.

In Creatures 3 / Docking Station as shipped, this mechanic is **not wired in** — aggression and antigen transmission are handled through the immune system (Antibody 0-7 / Antigen 0-7 pairs) rather than through Grendel nitrate. The nitrate slot was left as an extensibility point: modders who want a "metabolic poisoning" story (e.g. a Grendel-meat food item that slowly builds a toxic reading in the eating creature, producing nausea and finally death) have chemical 118 ready to use, with no stock biology to collide with.

This is exactly parallel to how 119 Ettin nitrate is reserved for an Ettin-equivalent story and how 22-23 (Sex drive decrease) and 45 (Glucotropic) are reserved for behavioural-ecology mods.

### Real-biology metaphor

The chemical's name is a deliberate nod to a real class of compounds. In mammalian biochemistry, nitrogen-containing end-products of amino-acid catabolism are excreted either as **ammonia** (fish, aquatic creatures) or as **urea** (mammals, most terrestrial creatures). Some reptiles and insects excrete **uric acid** or directly produce **nitrates** as metabolic end-products. The game's own nitrogen pathway is simple — Protein → Amino Acid → Urea → Ammonia → Water (see biochemistry.json reactions involving chemicals 12, 13, 25, 26, 33) — and covers the Norn's needs.

By calling slot 118 "Grendel nitrate", the designers signal that the Grendel's metabolism should be modelled as producing a different nitrogen end-product (a nitrate rather than urea / ammonia). This is semantically justified: Grendels are canonically more reptile-like than Norns (carnivorous, predatory, toxic), and a reptilian-style nitrate pathway is a reasonable biochemical flavour. The name makes the slot's intended role self-documenting to any genome engineer who opens the chemical table.

The same pattern is visible in 119 Ettin nitrate, which is presumably reserved for a *different* nitrate variant in the Ettin's body — perhaps a desert-adapted variant, since Ettins are lore-canonically xerophilic.

### What happens if you inject Grendel nitrate into a stock Norn

Because Grendel nitrate has no receptors and no reaction couplings in the standard Norn genome, injecting it has **no physiological effect whatsoever**. The classic test is:

```caos
setv va00 0
reps 10
  targ norn
  chem 118 255     * or INJR 118 255
  wait 30
  outv chem 118    * reads back the current concentration
  nextv
repe
```

The printout will show the Grendel-nitrate reading climbing with each injection and then remaining essentially flat between them (because nothing consumes it and its decay rate is in the "never" band). The Norn will continue to eat, sleep, move, breed, age, and die exactly as it would have without the injections. No drive will shift, no mood will change, no action will be inhibited or triggered.

This is the simplest confirmation that Grendel nitrate is genuinely vestigial in the stock Norn genome: no receptor threshold is ever crossed, no reaction ever fires as a result of its presence, no locus ever changes value.

On a **Grendel** the same injection *may* have an effect — the Grendel's own genome almost certainly attaches reactions and receptors to chemical 118 as part of its native metabolism — but that is Grendel biology, not Norn biology, and is outside the scope of this doc, which describes the Norn chemical table.

### How modders can activate Grendel nitrate

Genome engineers who want to give Grendel nitrate a "real" role have several well-trodden options:

1. **Grendel toxicity mechanic.** Define a consumable agent "Grendel flesh" whose script calls `CHEM 118 <n>` on the Norn that eats it, and add a receptor on Life (REDUCE flag) keyed to Grendel nitrate. The Norn then takes slow Life damage proportional to how much Grendel meat it has consumed — a concrete implementation of the lore-canonical "Grendels are poisonous to Norns" story. A second reaction `Grendel nitrate + Water → Water + Water` (effectively a slow clearance) gives the body a way to excrete the toxin gradually.

2. **Cross-species metabolic compatibility.** In a modded genome designed for a Norn-Grendel hybrid creature, wire a new reaction `Amino Acid + ATP → Grendel nitrate + ADP` as an alternative nitrogen-end-product pathway, competing with the stock `Amino Acid → Protein` and `Protein → Urea` chains. This lets the hybrid creature "choose" between Norn-style urea excretion and Grendel-style nitrate excretion depending on which reaction's rate is higher, giving a concrete biochemical signature to the species mix.

3. **Behavioural disgust signal.** Attach a receptor on the Drives faculty (e.g. on the `DRI_NEED_TO_EXPRESS_DISGUST` locus) keyed to Grendel nitrate, so that when a Norn's nitrate reading is non-zero it feels continuous disgust and is pushed toward the Express-Disgust involuntary action. Paired with a smell-13-Grendel CA emission that also triggers disgust, this doubles the "ugh, Grendels" gameplay effect.

4. **An environmental contaminant.** A modded water source (e.g. "Grendel swamp water") can deliver chemical 118 into any creature that drinks from it. Combined with option (1), this produces an environmental hazard — certain zones of the world become chemically inhospitable to Norns because the local water contains Grendel metabolites.

In every case the pattern is "add genes (or agent scripts) that make Grendel nitrate meaningful"; the chemical itself is a passive container waiting to be given a purpose.

### Relationship to other species-specific chemicals

Creatures 3 / Docking Station contains several chemical slots that are similarly species-coded:

- **118 Grendel nitrate / 119 Ettin nitrate** — species-specific metabolic end-products
- **237 CA smell 12 (Norn) / 238 CA smell 13 (Grendel) / 239 CA smell 14 (Ettin)** — CA (Cellular Automata) smell channels so creatures can sniff each other out by species
- **240 CA smell 15 (Norn home) / 241 CA smell 16 (Grendel home) / 242 CA smell 17 (Ettin home)** — CA channels for species-home regions of the world

The *smell* slots (237-242) are actively used by every creature — they are how the creature's olfactory organs detect conspecifics and home-ground, and they form the core of territorial and social behaviour. The *nitrate* slots (118, 119) are the metabolic counterpart, and unlike the smells they are **not** wired up in the Norn genome by default. This asymmetry — active smells, inactive nitrates — reflects a design decision: species identity in C3 is expressed through behaviour (smell, mood, antigen panels) rather than through metabolism. The nitrate slots are the metabolism-flavoured extensibility hooks that didn't make it past the "name reservation" stage.

### Practical consequences for gameplay

- **Stock Norns can safely ignore Grendel nitrate.** Debug-console chemistry tabs will show it perpetually at zero on any Norn that has never received external injections, and injections have no physiological consequences on Norns.
- **The name is not a promise of effect.** Reading "Grendel nitrate" on the chemical table does *not* imply the chemical interacts with Grendels in any scripted way. The interaction (if any) must be wired in by a genome or agent.
- **Modders can freely claim chemical 118 for Grendel-related mechanics** — nothing in the stock Norn genome will conflict. The slot is a particularly natural fit for toxicity, disgust, or cross-species hybridisation stories, because its name already hints at that role to any reader of the modded agent's source.
- **Care when importing cross-species or modded creatures.** Some experimental community genomes *do* wire the nitrate slots into real biology (particularly Grendel-genome ports). Creatures from such lines will show a meaningful Grendel-nitrate column; injecting or draining it *will* have physiological effects for them. If unsure, inspect the imported creature's gene list for any reaction, receptor, or emitter referencing chemical 118 before drawing conclusions.
- **Do not confuse with the Antigen system.** "Grendels are toxic to Norns" is implemented in the stock game through the **Antigen 0-7** / **Antibody 0-7** immune pairs (chemicals 94-109), not through Grendel nitrate. A Norn bitten by a Grendel sickens because the immune genes are wired to trigger on Grendel-specific antigens, not because of chemical 118. Grendel nitrate is reserved for a *metabolic* story that the stock game does not ship.

### Summary

```
                   (No stock Norn emitter)
                           │
                           ▼
  Grendel nitrate [118]  ──┼──  (No stock Norn reaction consumes it)
   • not in halflives gene │
   • initial 0 / 256       │
   • no receptors          │
                           ▼
                   (No stock Norn receptor reads it)

 Stock Norn biology never sets, consumes, or reads Grendel nitrate.
 Lore-canonical "Grendels are poisonous to Norns" is implemented
 through the Antigen/Antibody immune system, NOT through chemical 118.

 Grendel nitrate is a reserved species chemical slot:
   - Named to flag Grendel-specific nitrogen metabolism
   - Kept inert in the stock Norn genome by design
   - Free for modded genomes / agents to wire into real biology
     (most naturally: Grendel-toxicity or cross-species hybrids)
```

Grendel nitrate therefore occupies the same niche in the Creatures 3 chemistry as Glycolase, Insulin, and Ettin nitrate: it is an example of a chemical that exists for **human readers and modders**, not for the Norn itself. Its role in gameplay is not a biological function on Norns but an **extensibility point** — a stable, well-named, species-scoped chemical id reserved for Grendel-flavoured biology and for cross-species mods, and a deliberate choice by the genome designers to keep species-metabolism slots distinct from the Norn's own chemical repertoire even when the corresponding biology was not shipped.
