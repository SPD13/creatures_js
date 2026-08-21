# 124 - Activase

Activase is the label the Creatures 3 / Docking Station chemical table attaches to slot **124** — one of the "enzyme-band" reserved names in the late-metabolic stretch of the table, sitting among Anabolic Steroid (112), Pistle (113), Insulin (114), Glycolase (115), Dehydrogenase (116) and Adrenalin (117). The name is a direct nod to real-world pharmacology: **Activase** is the Genentech brand name for **alteplase**, a recombinant tissue-plasminogen-activator (tPA) enzyme that catalyses the conversion of plasminogen into plasmin and is used clinically to dissolve blood clots in strokes, heart attacks, and pulmonary emboli. The "-ase" suffix places the slot semantically in the same enzyme family as Glycolase and Dehydrogenase, and the choice of a thrombolytic brand name signals that the designers reserved it for a **"something-activator" role** — a chemical that, if wired up, would kick another pathway into life (clotting, repair, an enzyme cascade, a pro-drug activation) rather than doing work itself.

In the **stock Creatures 3 / Docking Station Norn genome, Activase is a vestigial chemical** — a reserved slot that exists in the chemical table but carries **zero active biology**. There is no emitter that secretes it, no reaction that produces or consumes it, no receptor that reads it, and no initial-concentration gene that seeds it. The only genome entry that mentions chemical 124 at all is the halflives table (`biochemistry.json:8584-8591`), which sets its genome byte to the sentinel value **255**. That byte resolves, through the decay formula `decayRate = 1 − (1/2)^(1/genomeValue)`, to an effective half-life of ~9 × 10¹⁰ ticks (roughly 90 billion) — i.e. "never decays in any reachable game session". This is the canonical way the Norn genome declares an inert reserved chemical: the slot is named and given a sentinel half-life so the engine knows it exists, but no genes attach any real biology to it.

Mechanically, Activase therefore behaves exactly like the other named-but-unused enzyme slots in the Norn genome (Insulin 114, Glycolase 115, Anabolic steroid 112, Grendel nitrate 118, Ettin nitrate 119): it starts at zero concentration at birth, it is invisible to all of the Norn's metabolic, drive, signalling, and immune machinery, and — because its half-life is set to the sentinel "infinite" value — any amount that ever enters it through scripting, agent ingestion, or a debug-console injection will persist at that value indefinitely. The slot is in effect a **well-typed extensibility hook**, pre-named and pre-decayed so that a modded genome, a community patch, or a scripted potion has a stable, semantically-meaningful id on which to hang a clot-busting / enzyme-activator / pathway-starter story without colliding with any chemical the Norn's own body already uses.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | *(none — stock Norn genome)* | — | — | Activase has **no emitter, no reaction product, and no initial-concentration gene** in the standard Norn genome. The steady-state value is **0** unless something external introduces it | — |
| 2 | External injection (CAOS) | — | Any | `CHEM TARG 124 <amount>` or `INJR 124 <amount>` via CAOS; consumable agent scripts that call `CHEM` on a held creature; drug / food PRAY files whose chemical table targets chemical 124 | One-shot; persists indefinitely because nothing consumes it and its half-life is the "never decays" sentinel (genome byte 255 → ~9 × 10¹⁰ ticks) |
| 3 | Modded genomes | User-specific | User-specific | A mod author may attach an emitter to Activase (e.g. keyed to a wound/injury locus, or to the Life faculty's damage-taken signal) to produce an "activator" hormone that in turn triggers downstream reactions or receptors added by the same mod | Gene-dependent |
| 4 | PRAY-defined potions / consumables | — | Mouth / digestive pathway | A third-party Medicine Maker recipe or a hand-written "clot buster" agent can deliver chemical 124 into a Norn that drinks or eats it, using the consumable hook that sets arbitrary chemicals on the consumer | One-shot per ingestion |

Because the stock Norn genome has no Activase source, a standard Docking Station Norn will live its entire life with the Activase reading locked at **0.000**. Any non-zero reading therefore guarantees the chemical was introduced externally: via a CAOS script, a modded agent, a debug-console injection, or an imported cross-genome creature whose genome explicitly wires Activase into its biology.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | *(none — stock Norn genome)* | — | — | Activase has **no reaction consumer, no receptor, and no locus binding** in the standard Norn genome. No physiological, behavioural, immune, or animation system reads its concentration | — |
| 2 | Passive decay | Halflives gene, byte 124 = **255** | Bloodstream | `halfLifeInTicks ≈ 90 682 980 616`, `decayRate ≈ 1.000` ("Very long" speed band) | **Effectively none.** Injected Activase persists indefinitely — the chemical does not evaporate on any gameplay-relevant timescale |
| 3 | Modded enzyme-activator pathway | User-specific | User-specific | A mod may add a reaction such as `1× Activase + 1× <precursor> → 1× <active form> + 1× Activase` (catalyst idiom) to model a true enzyme — Activase catalyses the conversion without being consumed, giving the slot the thrombolytic / clot-busting flavour its name implies | Gene-dependent |
| 4 | Modded damage-response hook | User-specific | User-specific | A receptor on the Life or Injury faculty, keyed to Activase, can be used to trigger a healing cascade, a pain-signal boost, or a bleed-stop animation when the modded genome releases Activase in response to injury | Gene-dependent |

## Role in Game Mechanics

### The "reserved enzyme name" pattern

The Creatures biochemistry subsystem allocates **256 chemical slots** in a fixed table (`Libraries/creatures-chemicals.js:146`, `Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`). Each slot carries three things: an id, a human-readable name, and a genome-encoded half-life. Genes then attach *active* biology — reactions, emitters, receptors, initial concentrations — to whichever slots the genome designer wants to use.

Of the 256 slots, only around 130 actually have active biology attached in the stock Norn genome. The remainder are **reserved names**: the designers picked a label (and usually a half-life) so that mod authors and genome hackers have stable, semantically-meaningful slots on which to hang new biology. The immediate neighbourhood of Activase is a deliberate cluster of enzyme / hormone names, only a subset of which are wired into real biology:

- **112 Anabolic steroid** — reserved hormone slot, inactive in the stock Norn genome
- **113 Pistle** — **actively used**: the urea-triggered purge-and-cool alarm hormone (floating-locus pair, half-life 13 ticks)
- **114 Insulin** — reserved enzyme slot, inactive in stock Norn
- **115 Glycolase** — reserved enzyme slot, inactive in stock Norn
- **116 Dehydrogenase** — **actively used**: participates in the lipid / protein metabolic chain
- **117 Adrenalin** — **actively used**: stress hormone (half-life 209 ticks, "Medium")
- **118 Grendel nitrate / 119 Ettin nitrate** — species-scoped reserved slots
- **123 (unnamed)** — unnamed slot; free for modders
- **124 Activase** — **enzyme-activator slot, inactive in stock Norn**
- **125 Life** — **actively used**: the core life-force chemical
- **126 (unnamed)** — unnamed slot; free for modders
- **127 Injury** — **actively used**: the damage-level chemical

The pattern is deliberate: the designers seeded the enzyme band of the chemical table with evocative real-biology names (Insulin, Glycolase, Dehydrogenase, Activase) so that modders wanting to build metabolic or enzyme-cascade mechanics have a ready-made vocabulary of slots to reach for, each already set to the safe "never decays" sentinel so any injected test dose persists long enough to observe downstream effects. Activase sits at the edge of the "actively used" cluster (125 Life, 127 Injury) — a positioning that is itself a hint: a clot-busting / damage-response enzyme fits naturally in the same band of the table as Life and Injury.

### Why the name "Activase"?

The choice of *Activase* specifically (rather than, say, "tPA", "plasmin", or a generic "Enzyme X") is a small piece of medical-pop-culture reference on the part of the Creatures Biochemistry team:

- **Real-world**: *Activase* (alteplase, recombinant human tissue plasminogen activator) is a Genentech brand approved by the FDA in 1987 for acute myocardial infarction and later for ischaemic stroke and pulmonary embolism. Its pharmacological action is to bind to fibrin in a thrombus and convert plasminogen to plasmin, initiating clot lysis.
- **In Creatures**: the name suggests the slot is reserved for a **"kick-starter" enzyme** — a chemical whose biology is to *activate* something else (a reaction, a repair pathway, a pro-drug) rather than to be a substrate or a messenger in its own right. Its placement next to 125 Life and 127 Injury further nudges the interpretation toward damage-response: a mod that wants "injury triggers repair activation" has Activase as an obvious intermediate to reach for.

Like Pistle's name (echoing "pistle" / epistle / excretion) or Glycolase's name (suggesting a glucose-cleaving enzyme), Activase is a self-documenting reservation — a label that tells any genome engineer opening the chemical table what the slot was *intended* for, even though the stock genome never delivered on the hint.

### What happens if you inject Activase into a stock Norn

Because Activase has no receptors and no reaction couplings in the standard Norn genome, injecting it has **no physiological effect whatsoever**. A minimal test from the CAOS command line:

```caos
targ norn
chem 124 255     * or INJR 124 255
wait 30
outv chem 124    * reads back the current concentration
```

The printout will show the Activase reading sitting at whatever value the injection delivered (capped at 255 by the 8-bit chemical scale) and then remaining essentially flat for the rest of the creature's life — because nothing consumes it and its decay rate is in the "never" band. The Norn will continue to eat, sleep, move, breed, age, and die exactly as it would have without the injection. No drive will shift, no mood will change, no action will be inhibited or triggered, no animation will play, no immune response will activate, no life-force or injury reading will move.

This is the simplest confirmation that Activase is genuinely vestigial in the stock Norn genome: no receptor threshold is ever crossed, no reaction ever fires as a result of its presence, no locus ever changes value. The Chemical Injection module on the Shee Starship's Chemical Analysis Screen (described in `Assets/Catalogue/Materia Medica.catalogue`) exposes Activase alongside every other slot in the table, but unlike (say) injecting Glucose or Adrenalin, an Activase injection produces no visible behavioural or physiological change.

### How modders can activate Activase

Genome engineers who want to give Activase a "real" role have several well-trodden options, each leaning on the thrombolytic / enzyme-activator flavour hinted at by the name:

1. **Injury-response activator.** Attach an emitter on the Creature / Circulatory tissue keyed to the **Injury (127)** locus or to a wound-damage signal, so that any time the Norn takes physical damage a burst of Activase is released. Pair this with a reaction such as `1× Activase + 1× Injury → 1× Activase + 1× Prostaglandin` (catalyst idiom, using Prostaglandin 94's existing repair-rate receptor) to turn the injury signal into a self-healing response: Activase is produced by injury, and its presence upgrades the body's repair throughput. Activase itself is not consumed — it stays in circulation to catalyse further repair — and only decays away naturally once the injury burst has subsided.

2. **Pro-drug activator in a Medicine Maker recipe.** Define a potion that delivers an "inactive" chemical (e.g. a custom slot) plus Activase into the creature. Add a reaction `1× <pro-drug> + 1× Activase → 1× <active form> + 1× Activase` so that only creatures with Activase present actually benefit from the potion. This gives medicine-maker authors a way to gate a drug's effect on a second chemical cue — a gameplay mechanic borrowed from real-world pro-drug pharmacology.

3. **Thrombolytic / bleed-stop mechanic.** In a modded genome that implements a custom "bleeding" chemical (not shipped in the stock game), wire Activase as the clearance enzyme: `1× Bleeding + 1× Activase → (nothing)` or `1× Bleeding + 1× Activase → 1× Activase` (catalyst) so that Activase's presence shuts down a bleed signal. Combined with an Activase emitter on the platelet-equivalent locus, this gives a concrete biochemical model of the real-world tPA / plasmin / fibrin cascade.

4. **Cascade starter.** Use Activase as the first link in a longer enzyme chain — a reaction sequence where Activase catalyses the production of a second enzyme, which catalyses the production of a third, and so on. The "never decays" half-life makes Activase ideal for this: a single initiating dose persists long enough to drive the whole cascade to completion, rather than disappearing mid-chain.

In every case the pattern is "add genes (or agent scripts) that make Activase meaningful"; the chemical itself is a passive container waiting to be given a purpose, pre-seeded with a thrombolytic-enzyme flavour by the name alone.

### Relationship to other reserved enzyme names

Creatures 3 / Docking Station contains several chemical slots that are similarly named-but-inactive enzymes, clustered in the 112-124 band of the table:

| Chemical | Name suggests | Stock Norn biology |
|----------|---------------|--------------------|
| 112 Anabolic steroid | muscle-growth hormone (cf. testosterone derivatives) | Inactive — reserved |
| 114 Insulin | blood-sugar-lowering hormone | Inactive — reserved (Glucose regulation is handled by other reactions) |
| 115 Glycolase | glucose-cleaving enzyme | Inactive — reserved |
| 124 Activase | **thrombolytic / enzyme-activator** (Genentech brand for alteplase) | **Inactive — reserved** |

These share several traits with Activase: all carry the sentinel "never decays" half-life (genome byte 255), all have zero concentration at birth, and all are completely invisible to the Norn's active biology. The cluster gives mod authors a four-strong palette of enzyme-themed slot names to pick from when designing new metabolic mechanics, each pre-flavoured for a slightly different pharmacological role.

The contrast with the **actively used** members of the same band — 113 Pistle (urea-purge alarm), 116 Dehydrogenase (lipid / protein metabolic cofactor), 117 Adrenalin (stress hormone) — shows that the designers were not allergic to wiring enzyme names into real biology. They wired up the subset they needed for the Norn's own metabolism and left the rest as hooks for future work and for the modding community. Activase is one of the "left as a hook" slots.

### Practical consequences for gameplay

- **Stock Norns can safely ignore Activase.** Debug-console chemistry tabs will show it perpetually at zero on any Norn that has never received external injections, and injections have no physiological consequences on Norns.
- **The name is not a promise of effect.** Reading "Activase" on the chemical table does *not* imply the chemical has any clot-busting, enzyme-activating, or damage-response role in the shipped game. Any such interaction must be wired in by a genome or agent.
- **Modders can freely claim chemical 124 for enzyme-activator mechanics** — nothing in the stock Norn genome will conflict. The slot is a particularly natural fit for damage-response, pro-drug, or cascade-starter stories, because its name already hints at that role to any reader of the modded agent's source.
- **Care when importing modded creatures.** Some experimental community genomes *do* wire Activase into real biology (particularly genomes that extend the Norn's injury-response system or add custom medical potions). Creatures from such lines will show a meaningful Activase column; injecting or draining it *will* have physiological effects for them. If unsure, inspect the imported creature's gene list for any reaction, receptor, or emitter referencing chemical 124 before drawing conclusions.
- **Chemical Injection module compatibility.** The Shee Starship's Chemical Analysis Screen ("Please note that some chemicals in the Injection Module can be extremely dangerous to a Creature so we recommend that module for Advanced Users only" — `Materia Medica.catalogue:57`) lists Activase alongside every other slot; it is one of the *safe* chemicals to inject into a stock Norn precisely because it does nothing.

### Summary

```
                   (No stock Norn emitter)
                           │
                           ▼
  Activase [124]  ─────────┼──  (No stock Norn reaction consumes it)
   • halflives byte = 255  │
     → half-life ≈ 9×10¹⁰  │
   • initial 0 / 256       │
   • no receptors          │
                           ▼
                   (No stock Norn receptor reads it)

 Stock Norn biology never sets, consumes, or reads Activase.
 The name is a nod to Genentech's brand-name for alteplase (tPA),
 a thrombolytic / clot-busting enzyme — signalling the slot's
 intended role as an enzyme-activator in modded biology.

 Activase is a reserved enzyme chemical slot:
   - Named to flag "activator"/"pro-drug"/"cascade-starter" roles
   - Kept inert in the stock Norn genome by design
   - Pre-seeded with the "never decays" half-life sentinel so
     injected test doses persist long enough to drive downstream
     reactions added by modded genes
   - Free for modded genomes / agents to wire into real biology
     (most naturally: injury-response, pro-drug activation, or
     enzyme-cascade starter mechanics)
```

Activase therefore occupies the same niche in the Creatures 3 chemistry as Insulin, Glycolase, Anabolic steroid, Grendel nitrate, and Ettin nitrate: it is an example of a chemical that exists for **human readers and modders**, not for the Norn itself. Its role in gameplay is not a biological function on Norns but an **extensibility point** — a stable, well-named, pharmacologically-flavoured chemical id reserved for enzyme-activator biology, deliberately kept inert in the shipped genome so it remains free for any mod that wants to attach a clot-busting, repair-activating, or cascade-starting story to the Norn's chemical repertoire.

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue` — the string `"Activase"` as the 124th entry in the chemical-names catalogue (counting from slot 0)
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:397` — Activase appears as a selectable chemical in the Chemical Injection module's in-game list
- `DOCUMENTATION/CreaturesData/biochemistry.json:8584-8591` — the only genome entry for Activase: `chemical: 124, genomeValue: 255, halfLifeInTicks: 90682980616, decayRate: 1, speed: "Very long"`; no reaction, emitter, receptor, or initial-concentration entry references chemical 124
- `DOCUMENTATION/articles/game-systems/biochemistry-system.md:1144` — mentions "running → emit activase" as a hypothetical example of a gait-coupled emitter, illustrating the kind of role the slot's name invites modders to explore (not an actual stock-genome wiring)
- `Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js` — 256-slot chemical table; `Libraries/creatures-chemicals.js:146` — chemical-name lookup that returns "Activase" for index 124
- `Biochemistry.js:360-379` — the halflives decoder that interprets genome byte 255 as the "never decays" sentinel via `decayRate = 1 − (1/2)^(1/genomeValue)`
