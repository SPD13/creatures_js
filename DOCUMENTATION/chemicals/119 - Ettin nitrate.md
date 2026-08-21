# 119 - Ettin nitrate

Ettin nitrate is the name the Creatures 3 / Docking Station chemical table attaches to slot **119** — the second of a pair of species-flavoured "nitrate" slots (the other being 118 Grendel nitrate) reserved by the game's authors to hint at a **species-specific metabolic waste / toxin pathway** in the Ettin's biochemistry. Ettins are lore-canonically a desert-adapted, xerophilic, scavenger species — the natural real-biology parallel is the uric-acid / nitrate pathway used by reptiles and birds to excrete nitrogen with minimal water loss, in contrast to the water-hungry urea pathway of mammals. Its immediate neighbours in the chemical table — 117 Adrenalin, 118 Grendel nitrate, and the unnamed reserved slots 120-127 — sit in the "late metabolic" band of the table, just after the antibody line (102-109) and the metabolic-enzyme block (112-116 Anabolic steroid, Pistle, Insulin, Glycolase, Dehydrogenase).

In the **stock Creatures 3 / Docking Station Norn genome, Ettin nitrate is a vestigial chemical** — a reserved slot that carries **zero active biology**: there is no emitter that produces it, no reaction that creates or consumes it, no receptor that reads it, and no initial-concentration gene that seeds it. Unlike its neighbour 118 Grendel nitrate (which is entirely absent from the Norn halflives export), Ettin nitrate **does appear in the Norn halflives table** (`DOCUMENTATION/CreaturesData/biochemistry.json`) with a `genomeValue` of **255** — the sentinel "never decays" setting (half-life ≈ 9.07 × 10¹⁰ ticks, decay rate 1.0). This is the standard pattern the Norn genome uses to say "this chemical exists, I am not going to touch it, and if anything ever puts some in, it will stay there".

Mechanically, Ettin nitrate therefore behaves exactly like the other explicitly-reserved-but-unused chemical slots in the Norn genome (Pistle 113, Insulin 114, Glycolase 115, etc.): it starts at zero at birth, it is invisible to all of the Norn's metabolic, drive, and signalling machinery, and any amount that ever enters it via scripting will persist at its injected level forever (the decay calculation `decayRate = 1 − (1/2)^(1/255)` resolves to essentially `1.0`, meaning ~0% loss per tick). It is, in effect, a **species marker** — a chemical slot reserved by the engine so that an Ettin-specific genome, a modded "ettin-poison" agent, or a Norn↔Ettin cross-genome experiment has a stable, semantically-meaningful id to attach the toxin biology to, without colliding with slots already in use by the Norn's body.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | *(none — stock Norn genome)* | — | — | Ettin nitrate has **no emitter, no reaction product, and no initial-concentration gene** in the standard Norn genome. The steady-state value is **0** unless something external introduces it | — |
| 2 | External injection (scripting) | — | Any | `CHEM TARG 119 <amount>` or `INJR 119 <amount>` via CAOS; consumable agent scripts that call `CHEM` on a held creature; drug / food PRAY files whose chemical table targets chemical 119 | One-shot; persists indefinitely because nothing consumes it and its half-life gene is set to 255 ("never decays") |
| 3 | Ettin-species / modded genomes | User- or Ettin-specific | User- or Ettin-specific | An Ettin genome or a breeder's modded genome may attach the Ettin-metabolism biology — typically an emitter on a digestive / renal-analogue organ keyed to Protein or Amino Acid abundance, producing Ettin nitrate as a dry-climate nitrogenous by-product (by analogy with Ammonia → Urea in the Norn, but producing a crystallisable nitrate instead to conserve body water) | Gene-dependent |
| 4 | Environmental ingestion (CAOS) | — | Mouth / digestive pathway | A scripted "ettin carrion" or "ettin corpse bite" agent can deliver chemical 119 into a Norn that eats it, using the Drive system's hook for consumables; similarly a modded "ettin-contaminated desert food" item (scorpion, dry root, etc.) can carry a small dose of 119 | One-shot per ingestion |

Because the stock Norn genome has no Ettin-nitrate source, a standard Docking Station Norn will live its entire life with the reading locked at 0.000. Any non-zero reading therefore guarantees the chemical was set externally (a CAOS script, a modded agent, an imported cross-genome creature, or a test-tube injection from the debug console).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | *(none — stock Norn genome)* | — | — | Ettin nitrate has **no reaction consumer, no receptor, and no locus binding** in the standard Norn genome. No physiological, behavioural, or animation system reads its concentration | — |
| 2 | Passive decay | Halflives gene, byte 119 = 255 | Bloodstream | `decayRate = 1 − (1/2)^(1/255) ≈ 0.0000000` per tick; effective half-life ≈ 9.07 × 10¹⁰ ticks | **Effectively none.** Injected Ettin nitrate persists indefinitely — the chemical does not evaporate on any meaningful timescale |
| 3 | Ettin-species / modded genomes | User- or Ettin-specific | Renal / excretory organ | An Ettin genome may attach a receptor keyed to Ettin nitrate on an involuntary action locus (e.g. a "seek water" or "seek salt lick" action) or a reaction that slowly clears Ettin nitrate to Water + trace minerals, modelling renal clearance of the crystallisable toxin | Gene-dependent |
| 4 | Modded xeno-toxicity mechanic | User-added | Any | A modded "ettin allergy" receptor on REDUCE-Life, INCREASE-Pain, or INCREASE-Dri-Hotness can make a Norn who absorbs Ettin nitrate take continuous physiological damage or feel distress, giving the lore-canonical "Ettin-species antagonism" story a metabolic implementation distinct from the immune-system version (Antigen 6 / Antibody 6) | Gene-dependent |

## Role in Game Mechanics

### The "reserved name" nature of Ettin nitrate

The Creatures biochemistry subsystem allocates **256 chemical slots** in a fixed table (`Libraries/creatures-chemicals.js:146`, `Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`). Each slot carries three things: an id, a human-readable name, and a passive half-life/decay rate stored in the genome's halflives gene. Genes then attach *active* biology — reactions, emitters, receptors, initial concentrations — to whichever slots the genome designer wants to use.

Of the 256 slots, only around 130 actually have active biology attached in the stock Norn genome. The remainder are **reserved names**: the game's authors picked a label and (usually) a half-life for them so that mod authors and genome hackers have stable, semantically-meaningful slots to hang new biology on. Ettin nitrate (119) is one of these reserved names, occupying a specifically **species-coded** corner of the table:

- **109 Antibody 7** — immune chemical, part of the shared antibody line
- **112 Anabolic steroid / 113 Pistle / 114 Insulin / 115 Glycolase** — metabolic enzymes and hormones, mostly vestigial in the stock Norn
- **116 Dehydrogenase** — actively used, appearing in the lipid and protein metabolic chains
- **117 Adrenalin** — actively used (stress hormone, short half-life 209 ticks)
- **118 Grendel nitrate** — **Grendel-species slot, inactive on Norns** (also absent from halflives gene)
- **119 Ettin nitrate** — **Ettin-species slot, inactive on Norns** (halflife explicitly set to 255 = never decays)
- **120, 121, … 127** — unnamed slots; modders can claim them

The pattern is intentional: by baking these names into the table, the game reserves a stable id for "the Ettin's nitrogenous waste", so that a future Ettin genome, a modded cross-breed, or a user-written "ettin poison" agent can target `CHEM 119 ...` knowing no stock Norn genome will ever accidentally be affected by it, and no two mods will collide on the same id.

### Why Ettin nitrate *does* carry a half-life while Grendel nitrate does not

The two species-nitrate slots are treated subtly differently in the decoded Norn biochemistry. Grendel nitrate (118) is **absent** from the halflives array in `biochemistry.json` entirely — the JSON export either skipped it because its byte value was at the export's "defaulted" filter threshold, or the Norn genome simply never wrote an explicit byte for it. Ettin nitrate (119), by contrast, is **present** in the halflives list with `genomeValue: 255`, `halfLifeInTicks: 90682980616`, `decayRate: 1.0`, `speed: "Very long"`. Two readings of this small asymmetry are consistent with how the Norn genome was authored:

- **Author-time inconsistency.** The halflives gene stores bytes for all 256 chemicals in a single 256-byte block (`Biochemistry.js:360-379`). Every chemical gets *some* decay rate from the gene. The Norn designer, iterating through the table, explicitly set slot 119 to `255` (the standard "reserved-but-inert" sentinel) but may have missed slot 118, leaving it at whatever default byte (likely 0, which the exporter filters out) was pre-initialised into the gene. This is consistent with the nearby slot 120 also being absent from the list while 121 is present — a small pattern of gappy coverage that looks more like authoring omissions than deliberate species-scoping.
- **Deliberate asymmetry.** Alternatively the designers may have considered the Grendel a more metabolically alien cousin and the Ettin a closer relative, explicitly marking 119 as "present but never decays" (i.e. the Norn body would retain Ettin metabolites just as it retains its own vestigial reserved chemicals), while leaving 118 Grendel nitrate entirely unclaimed.

Either way, the practical effect on a stock Norn is identical: both slots have no reactions, no receptors, and no emitters, so both behave as passive "infinite half-life" containers — any injection just sits there.

The `genomeValue: 255` → `halfLifeInTicks: 90682980616` mapping comes from the standard Creatures decay formula:

```
decayRate   = 1 − (1/2)^(1/genomeValue)       // per-tick retention
halfLifeInTicks ≈ genomeValue × ln(2)⁻¹ × ln(1/decayRate)⁻¹   // (approximated as retention→1)
```

At `genomeValue = 255`, the decay rate is so close to 1.0 that the engine-computed half-life overflows into the "tens of billions of ticks" band — far longer than any creature's lifespan (a Norn typically lives 10-20 hours of game time, ~25,000-50,000 ticks). For all practical purposes the chemical is immortal once injected.

### Canonical lore: Ettins as desert scavengers and the real-biology metaphor

The Creatures franchise portrays the three primary creature species with distinct ecological roles: Norns are generalist mammals (urea pathway), Grendels are aggressive predators (a more reptilian, toxic cousin), and **Ettins are desert-adapted scavengers** — small, mischievous, thieving creatures canonically at home in the Ettin Desert region of C3's Shee ship. Real-biology parallels fit this well: in nature, desert-adapted animals (reptiles, birds, some insects) excrete nitrogenous waste as **uric acid or nitrates** rather than urea, because these compounds can be crystallised and expelled with very little water, conserving body fluid in arid environments. Mammals that excrete urea must pair it with ~50-100 ml of water per gram; birds and reptiles that excrete uric acid or nitrates can expel it essentially dry.

By calling slot 119 "Ettin nitrate", the designers signal that the Ettin's metabolism should be modelled as producing a different, water-conserving nitrogen end-product (a nitrate rather than urea / ammonia). The game's own stock nitrogen pathway on a Norn is simple — Protein → Amino Acid → Urea → Ammonia → Water (see biochemistry.json reactions involving chemicals 12, 13, 25, 26, 33) — and covers the Norn's needs because Norns live in well-watered environments. An Ettin, running this pathway, would lose water it cannot afford; diverting the endpoint to nitrate instead is the natural fix. The name makes the slot's intended role self-documenting to any genome engineer who opens the chemical table.

This mirrors 118 Grendel nitrate (reserved for a Grendel-flavoured toxic-waste variant, modelling the Grendel's more reptilian biochemistry) and distinguishes both from the shared Norn pathway.

### What happens if you inject Ettin nitrate into a stock Norn

Because Ettin nitrate has no receptors and no reaction couplings in the standard Norn genome, injecting it has **no physiological effect whatsoever**. A direct test:

```caos
setv va00 0
reps 10
  targ norn
  chem 119 255     * or INJR 119 255
  wait 30
  outv chem 119    * reads back the current concentration
  nextv
repe
```

The printout will show the Ettin-nitrate reading climbing with each injection and then remaining essentially flat between them (because nothing consumes it and its decay rate is in the "never" band). The Norn will continue to eat, sleep, move, breed, age, and die exactly as it would have without the injections. No drive will shift, no mood will change, no action will be inhibited or triggered. Crucially, even though slot 119 *has* a half-life entry in the Norn genome (unlike slot 118), the half-life is set to the effectively-immortal value, so the readings do not visibly tail off over the sampling interval.

This is the simplest confirmation that Ettin nitrate is genuinely vestigial in the stock Norn genome: no receptor threshold is ever crossed, no reaction ever fires as a result of its presence, no locus ever changes value.

On an **Ettin** the same injection *may* have an effect — the Ettin's own genome almost certainly attaches reactions and receptors to chemical 119 as part of its native metabolism — but that is Ettin biology, not Norn biology, and is outside the scope of this doc, which describes the Norn chemical table.

### How modders can activate Ettin nitrate

Genome engineers who want to give Ettin nitrate a "real" role have several well-trodden options:

1. **Xerophilic-metabolism mechanic.** Define an alternative nitrogen pathway reaction `Amino Acid + ATP → Ettin nitrate + ADP` competing with the stock `Amino Acid → Protein` and `Protein → Urea` chains. Pair it with a receptor on `Drives / DRI_NEED_TO_DRINK` keyed to Water *deficit* and on `Drives / DRI_HOTNESS` keyed to body temperature — so that in hot, dry conditions the creature's metabolism preferentially shunts nitrogen to Ettin nitrate (water-sparing), and in cool, wet conditions it falls back to the Norn's urea pathway. This gives a concrete climate-responsive biochemical signature suitable for a desert-species modded genome.

2. **Ettin-scavenger toxicity mechanic.** Define a consumable agent "Ettin carrion" whose script calls `CHEM 119 <n>` on the Norn that eats it, and add a receptor on Life (REDUCE flag) keyed to Ettin nitrate. The Norn then takes slow Life damage proportional to how much Ettin meat it has consumed — a "these scavengers' flesh carries toxic metabolites" story distinct from the Grendel's antigen-based aggression story. A second reaction `Ettin nitrate + Water → Water + Water` (effectively a slow diuretic clearance) gives the body a way to excrete the toxin gradually at the cost of body water.

3. **Cross-species metabolic compatibility.** In a modded genome designed for a Norn-Ettin hybrid creature, wire a new reaction network that produces *both* Urea and Ettin nitrate in parallel, with the ratio depending on ambient temperature / humidity detected through CA smell channels. This lets a hybrid creature "choose" between Norn-style urea excretion and Ettin-style nitrate excretion depending on the room it is in, giving a concrete biochemical signature to the species mix.

4. **Curiosity / foraging hook.** Attach a receptor on `Drives / DRI_BOREDOM` (decrease) keyed to Ettin nitrate, so that when an Ettin nitrate reading is non-zero the creature's boredom drops — a biochemical representation of "Ettins enjoy desert scavenging, and a creature that has eaten Ettin food feels content". This is a mirror of how modders use 118 Grendel nitrate for disgust stories.

5. **Environmental contaminant.** A modded water source (e.g. "Ettin oasis water" or "desert runoff") can deliver trace chemical 119 into any creature that drinks from it, combining with options (1) or (2) to make certain biome zones subtly different for different species.

In every case the pattern is "add genes (or agent scripts) that make Ettin nitrate meaningful"; the chemical itself is a passive container waiting to be given a purpose.

### Relationship to other species-specific chemicals

Creatures 3 / Docking Station contains several chemical slots that are similarly species-coded:

- **118 Grendel nitrate / 119 Ettin nitrate** — species-specific metabolic end-products (both inactive on Norns)
- **237 CA smell 12 (Norn) / 238 CA smell 13 (Grendel) / 239 CA smell 14 (Ettin)** — CA (Cellular Automata) smell channels so creatures can sniff each other out by species
- **240 CA smell 15 (Norn home) / 241 CA smell 16 (Grendel home) / 242 CA smell 17 (Ettin home)** — CA channels for species-home regions of the world
- **Antigen 6 (chemical 100) / Antibody 6 (chemical 108)** — the immune pair conventionally used to tag Ettin-specific infections in the stock Norn genome

The **smell slots** (237-242) are actively used by every creature — they are how the creature's olfactory organs detect conspecifics and home-ground, and they form the core of territorial and social behaviour. The **antigen/antibody pair** (100/108) is the immune-system's species-tagging mechanism, wired in by stock reactions. The **nitrate slot** (119), by contrast, is the *metabolic* counterpart, and unlike the smells and the antigens it is **not** wired up in the Norn genome by default. This asymmetry — active smells and immune tags, inactive nitrates — reflects a design decision: species identity in C3 is expressed through behaviour (smell, mood) and immunity (antigen panels) rather than through metabolism. The nitrate slots are the metabolism-flavoured extensibility hooks that didn't make it past the "name reservation" stage.

### Practical consequences for gameplay

- **Stock Norns can safely ignore Ettin nitrate.** Debug-console chemistry tabs will show it perpetually at zero on any Norn that has never received external injections, and injections have no physiological consequences on Norns.
- **The name is not a promise of effect.** Reading "Ettin nitrate" on the chemical table does *not* imply the chemical interacts with Ettins in any scripted way *on a Norn*. The interaction (if any) must be wired in by a genome or agent.
- **Modders can freely claim chemical 119 for Ettin-related mechanics** — nothing in the stock Norn genome will conflict. The slot is a particularly natural fit for xerophilic-metabolism, desert-scavenger-toxicity, or cross-species hybridisation stories, because its name already hints at that role to any reader of the modded agent's source.
- **Care when importing cross-species or modded creatures.** Some experimental community genomes *do* wire the nitrate slots into real biology (particularly Ettin-genome ports and Norn-Ettin hybrid experiments). Creatures from such lines will show a meaningful Ettin-nitrate column; injecting or draining it *will* have physiological effects for them. If unsure, inspect the imported creature's gene list for any reaction, receptor, or emitter referencing chemical 119 before drawing conclusions.
- **Do not confuse with the Antigen / Antibody system.** Ettin-species infectious disease transmission is implemented in the stock game through **Antigen 6 / Antibody 6**, not through Ettin nitrate. A Norn bitten by (or sharing a room with) a sick Ettin sickens because the immune genes are wired to trigger on the Ettin-specific antigen, not because of chemical 119. Ettin nitrate is reserved for a *metabolic* story that the stock game does not ship.
- **The half-life presence is informational only.** The fact that slot 119 has an explicit `genomeValue: 255` entry (unlike 118) does not mean the Norn "uses" the chemical any more than it uses slot 118 — both are functionally identical at runtime (both never decay, both have no reactions/receptors/emitters). The difference is purely in how the genome file encodes the "reserved but inert" declaration.

### Summary

```
                   (No stock Norn emitter)
                           │
                           ▼
  Ettin nitrate [119]   ──┼──  (No stock Norn reaction consumes it)
   • halflives = 255       │       (effective half-life ≈ 9.07 × 10¹⁰ ticks)
   • initial 0 / 256       │
   • no receptors          │
                           ▼
                   (No stock Norn receptor reads it)

 Stock Norn biology never sets, consumes, or reads Ettin nitrate.
 Lore-canonical "Ettin-species identity" in the stock game runs through
 Antigen 6 / Antibody 6 (immune tagging) and CA smell 14 (olfactory tagging),
 NOT through chemical 119.

 Ettin nitrate is a reserved species chemical slot:
   - Named to flag Ettin-specific (xerophilic, nitrate-excreting) nitrogen metabolism
   - Kept inert in the stock Norn genome by design (halflife 255 = never decays)
   - Free for modded genomes / agents to wire into real biology
     (most naturally: desert-metabolism, Ettin-carrion toxicity, or Norn-Ettin hybrids)
```

Ettin nitrate therefore occupies the same niche in the Creatures 3 chemistry as Grendel nitrate, Glycolase, and Insulin: it is an example of a chemical that exists for **human readers and modders**, not for the Norn itself. Its role in gameplay is not a biological function on Norns but an **extensibility point** — a stable, well-named, species-scoped chemical id reserved for Ettin-flavoured biology and for cross-species mods, and a deliberate choice by the genome designers to keep species-metabolism slots distinct from the Norn's own chemical repertoire even when the corresponding biology was not shipped. The slight authoring difference from Grendel nitrate (explicit `255` halflife here vs. absent there) is a harmless quirk of how the Norn genome's halflives byte-block was filled in, not a gameplay-meaningful distinction.
