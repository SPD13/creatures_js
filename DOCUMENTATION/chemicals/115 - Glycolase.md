# 115 - Glycolase

Glycolase is, in real biochemistry, a generic name for the family of enzymes that catalyse **glycolysis** — the ten-step cytosolic pathway that cleaves one molecule of glucose into two molecules of pyruvate, yielding a net two ATP. The game's own chemical table (`Libraries/creatures-chemicals.js:143`) spells this out: *"Splits glucose to release energy during glycolysis"*. A reader coming from textbook metabolism would expect Glycolase to appear alongside Glucose, Pyruvate, ADP and ATP in the reaction `Glucose + Glycolase → Pyruvate + Energy`, the canonical example used in the engine's own biochemistry docs (`DOCUMENTATION/Docs/biochemistry_system.md:225`).

In the **stock Creatures 3 / Docking Station Norn genome, however, Glycolase is a vestigial chemical** — a reserved slot that exists in the chemical table but carries **zero active biology**. It has no reactions that produce or consume it, no receptors that read it, no emitters that secrete it, and no initial-concentration gene. Glycolysis itself is fully implemented in the stock genome, but as a single-step reaction run by **Organ #2 (Reaction)** under gene 34: `1× Glucose [3] + 2× ADP [36] → 2× Pyruvate [2] + 2× ATP [35]` (see `DOCUMENTATION/CreaturesData/biochemistry.json:582`). The enzyme has been "compiled out" of the equation — Glucose is converted directly to Pyruvate without passing through a Glycolase cofactor. The chemical's name is preserved on the table as a real-biology metaphor, not as an active participant.

Mechanically, Glycolase therefore behaves exactly like the other named-but-unused chemical slots in the genome (Insulin 114, Grendel/Ettin nitrate 118/119, Pistle 113, etc.): it has a "Very long" half-life (≈9.07 × 10¹⁰ ticks, decay rate 1.0), so any amount you inject persists essentially forever; it starts at zero concentration at birth; it has no initial concentration entry in the standard genome; and it is invisible to all of the creature's metabolic, drive, and signalling machinery unless a breeder or scripter wires it into an imported genome or a modded agent script. It is, in effect, a **reserved name for genetic engineering** — a chemical slot that modders can attach reactions and receptors to in order to implement an explicit enzyme-mediated glycolysis pathway, without having to repurpose a slot that is already in use.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | *(none — stock genome)* | — | — | Glycolase has **no emitter, no reaction product, and no initial-concentration gene** in the standard Norn genome. The steady-state value is **0** unless something external introduces it | — |
| 2 | External injection (scripting) | — | Any | `CHEM TARG 115 <amount>` or `INJR 115 <amount>` via CAOS; consumable agent scripts that call `CHEM` on a held creature; drug/food PRAY files whose chemical table targets chemical 115 | One-shot; persists indefinitely thanks to the ~infinite half-life |
| 3 | Modded / imported genomes | User-added | User-added | A breeder or genetic engineer may add a chemical-synthesis reaction (e.g. a `Pyruvate + ATP → Glucose + Glycolase` product, or an emitter on Organ #2 keyed to Glucose abundance) that writes into chemical 115 | Gene-dependent |

Because the genome-defined biochemistry has no Glycolase source, a stock Norn will live its entire life with Glycolase locked at 0.000. Any non-zero reading therefore guarantees the chemical was set externally (a CAOS script, a modded agent, a mutated genome with added genes, or a test-tube injection from the debug console).

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | *(none — stock genome)* | — | — | Glycolase has **no reaction consumer, no receptor, and no locus binding** in the standard Norn genome. No physiological, behavioural, or animation system reads its concentration | — |
| 2 | Passive decay | Gene 64 (half-life table) | Bloodstream | Half-life ≈ 9.07 × 10¹⁰ ticks, decay rate 1.0 (`Very long`) | **Effectively none.** Injected Glycolase persists indefinitely — the chemical does not evaporate on any meaningful timescale. A dose given at birth is still essentially intact at natural death |
| 3 | Modded / imported genomes | User-added | User-added | A breeder may add a Glycolase-consuming reaction (e.g. `Glucose + Glycolase → Pyruvate + Energy`, as sketched in `DOCUMENTATION/Docs/biochemistry_system.md`), or a receptor on the Reaction organ keyed to chemical 115 that modulates the stock Glucose→Pyruvate reaction rate | Gene-dependent |

## Role in Game Mechanics

### The "reserved name" nature of Glycolase

The Creatures biochemistry subsystem allocates **256 chemical slots** in a fixed table (`Libraries/creatures-chemicals.js`, `Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js`). Each slot carries three things: an id, a human-readable name, and a passive half-life/decay rate stored in the genome. Genes then attach *active* biology — reactions, emitters, receptors, initial concentrations — to whichever slots the genome designer wants to use.

Of the 256 slots, only around 130 actually have active biology attached in the stock Norn genome. The remainder are **reserved names**: the game's authors picked a label and a half-life for them so that mod authors and genome hackers have stable, semantically-meaningful slots to hang new biology on. Glycolase (115) is one of these reserved names. Its immediate neighbours include:

- **113 Pistle** ("Regulates urination") — also unused in stock biology
- **114 Insulin** ("Regulates storage of glucose") — also unused; the pancreas-like Organ #3 implements its role directly without the mediator
- **116 Dehydrogenase** — actually *is* used, appearing in the lipid and protein metabolic chains
- **118 Grendel nitrate** / **119 Ettin nitrate** — used only for species-specific poisoning, largely vestigial in standard Norns

The pattern is intentional: by baking these names into the table, the game reserves a stable id for them across all mods, so a modded "glycolysis booster" agent can target `CHEM 115 ...` knowing no stock genome will ever be affected by it and no two mods will collide on the same id.

### Why the stock genome skips the enzyme

In real biology, the cell needs enzymes because the activation energy of cleaving glucose is too high for the reaction to run spontaneously at body temperature. In the Creatures engine, reactions have no activation energy — they are plain stoichiometric transforms that run at a genome-set rate whenever both reactants are present. The "enzyme" role in real biochemistry (making the reaction fast enough to matter) is played in the engine by the reaction's own **Rate** parameter, where the genome byte is inverted into a 0-1 rate: byte 0 → rate 1.0 fast, byte 255 → rate ≈ 0 slow.

For the stock glycolysis reaction (gene 34), the genome sets rate byte 40 → half-life 52 ticks → "Short" speed, meaning about 1.3% of the substrate pool is converted per tick. This is already enough to drain Glucose as fast as the body can supply it under load, without any help from a separate enzyme chemical. Adding a Glycolase cofactor would require:

1. An **emitter** somewhere to produce Glycolase (either Organ #2 itself, or the Pancreas organ).
2. The reaction to be **rewritten** as `Glucose + Glycolase → Pyruvate + ATP + Glycolase` (regenerating the enzyme) or `Glucose + Glycolase → Pyruvate + ATP` (consuming it, forcing continuous resynthesis).
3. If consumed, a second reaction to keep replenishing Glycolase.

This adds two-to-three extra genes for no mechanical payoff: the rate is already tunable via the reaction's own Rate byte, and nothing about the creature's behaviour would look any different. So the designers took the shorter path and treated Glycolase as a purely descriptive label on the table, not a runtime quantity.

This is a recurring design pattern in the C3 genome: wherever a real-biology process could be modelled either as "cofactor → reaction rate" or as "reaction rate directly set by gene", the genome almost always picks the shorter, directer path. The enzyme chemical is kept only when one of:

- **Hysteresis** is needed (where a chemical's own half-life provides temporal smoothing)
- **Multiple consumers** need to share the same enzyme pool (e.g. if several reactions all depended on Glycolase availability)
- **Diffusion between organs** is required (producing the enzyme in one organ and using it in another)
- **CAOS-level tuning** is intended to be exposed (injectable boosters like Adrenalin)

None of these apply to glycolysis: the trigger (Glucose present) and the effect (Glucose → Pyruvate) happen in the same organ at the same tick, with no other consumers and no gameplay reason to let modders inject "Glycolase" as a distinct lever. So the Glycolase chemical was reserved for its *name* (and its *semantic* usefulness to modders) but not actually used.

### Misleading example in the internal docs

The engine's own architecture documentation (`DOCUMENTATION/Docs/biochemistry_system.md:225` and `DOCUMENTATION/articles/game-systems/biochemistry-system.md:289`) uses `Glucose + Glycolase → Pyruvate + Energy` as its **illustrative** example of a reaction. This can be misleading: readers following the doc may reasonably conclude that such a reaction is wired in the stock genome. It is not. The actual gene 34 reaction produces Pyruvate from Glucose and ADP (not Glycolase), and its `P2` product is ATP, not a bare "Energy" slot. The docs' example was written for pedagogical clarity (it matches real-biology notation) but does not correspond to any actual gene in the shipped Norn genome.

If you grep the genome for receptors, reactions, or emitters referring to chemical 115, the answer is a flat zero on every one — confirming the doc's example is notional, not descriptive.

### What happens if you inject Glycolase into a stock Norn

Because Glycolase has no receptors and no reaction couplings in the standard genome, injecting it has **no physiological effect whatsoever**. The classic test is:

```caos
setv va00 0
reps 10
  targ norn
  chem 115 255     * or INJR 115 255
  wait 30
  outv chem 115    * reads back the current concentration
  nextv
repe
```

The printout will show the Glycolase reading climbing with each injection and then remaining essentially flat between them — because the half-life is effectively infinite, it does not decay; because nothing consumes it, it is never removed. The Norn will continue to eat, sleep, move, breed, age, and die exactly as it would have without the injections. Critically, the creature's **actual glycolysis rate is unaffected** — gene 34's reaction runs at the same 52-tick half-life whether Glycolase is at 0 or at saturation.

This is the simplest confirmation that Glycolase is genuinely vestigial in the stock genome: no receptor threshold is ever crossed, no reaction ever fires as a result of its presence, no locus ever changes value.

### How modders can activate Glycolase

Genome engineers who want to give Glycolase a "real" role have several well-trodden options:

1. **Enzyme-mediated glycolysis.** Replace gene 34's direct `Glucose + ADP → Pyruvate + ATP` reaction with an enzyme-cofactor pair: `Glucose + Glycolase → Pyruvate + Glycolase` (regenerating the enzyme) plus an emitter on the Reaction organ that produces Glycolase proportional to a Glucose-sensing receptor. This gives the modder a dial — the emitter's Gain, or the Glycolase half-life — for how aggressive the creature's glycolytic flux is. A short Glycolase half-life or a low emitter Gain models "insulin resistance" or "glycolytic enzyme deficiency"; a high gain models a Warburg-like "sugar-burner" metabolism.

2. **A metabolic illness.** Add a receptor on Sensorimotor `LOC_INVOLUNTARY*` keyed to **low** Glycolase (REDUCE flag) so that the creature lapses into a hypoglycaemic involuntary action when its enzyme pool is depleted. Combined with a "glycolase-inhibitor" agent that decays chemical 115, this gives a playable illness loop analogous to an arsenic- or fluoride-type glycolysis poisoning.

3. **A drug target.** Define a consumable agent "glycolase booster" whose script calls `CHEM 115 <n>` on the creature that eats it. Paired with a reaction that *consumes* Glycolase to turn Glucose into Pyruvate faster, this turns Glycolase into a usable in-world stimulant — essentially a metabolic accelerator that trades chemical 115 for short-term ATP bursts. Note that without such a reaction the "booster" has no effect (see the previous section).

4. **A signalling slot for a new organ.** A brand-new organ (e.g. a "liver cytosol" organ simulating real hepatic glycolysis) can emit Glycolase into the bloodstream as its output signal, and have its own receptors on Glycolase to self-regulate. Because nothing else in the stock genome competes for chemical 115, the new organ has exclusive ownership of the signal.

In every case the pattern is "add genes that make Glycolase meaningful"; the chemical itself is a passive container waiting to be given a purpose.

### Relationship to Organ #2's name

Organ #2 is named simply "Organ" in the standard decoded organ list — the engine does not label it "Glycolytic Organ" or "Cytosol", despite that being what gene 34's reaction physiologically represents. This naming neutrality is consistent with the rest of the genome: where Organ #3's name ("Pancreas (β-cells / Insulin)") uses a real-biology metaphor to hint at the function, Organ #2 is a generic catch-all for several reactions and receptors (glycolysis, immune responses, injury processing). Attaching the Glycolase name to Organ #2 explicitly would overcommit — the organ does more than glycolysis, and the Glycolase enzyme would only be relevant to one of its reactions.

This separation of "chemical name" (real-biology, for modder comprehension) from "organ name" (engine-role, for gameplay) is part of why so many chemicals are reserved-but-unused: the naming scheme was chosen for pedagogical clarity to modders, and the genome was then filled in with the minimum biology necessary to produce the desired creature behaviour.

### The half-life curiosity

Glycolase shares the same decay-rate encoding as Insulin, Ettin nitrate, and all the other truly-inert chemicals: `genomeValue: 255`, which the decay formula `decayRate = 1 − (1/2)^(1/genomeValue)` resolves to a half-life of ~9 × 10¹⁰ ticks, i.e. effectively `decay rate = 1.0`. This is the "never decays" sentinel used for every effectively-passive chemical in the table (Glucose, Pyruvate, Oxygen all share it). For Glycolase specifically, the choice is defensible on two grounds:

- **It prevents unintentional drift** if a modded agent ever injects Glycolase: the stored value stays exactly at what the mod set it to, so downstream mod logic can reason about the value deterministically.
- **It makes "no biology" the default null state.** If Glycolase had a short half-life instead, an injection would quietly fade to zero without firing anything — still harmless, but harder for a modder to diagnose why their new receptor never triggers. The infinite half-life is an invariant: "the value only changes when something explicitly changes it".

A modded genome that does wire Glycolase into a real pathway will typically override this default, setting the half-life to something short (e.g. 50-500 ticks) so that the enzyme pool turns over on the same timescale as the reactions that consume it. An effectively-infinite half-life only makes sense while the chemical is truly inert.

### Practical consequences for gameplay

- **Stock Norns can safely ignore Glycolase.** Debug-console chemistry tabs will show it perpetually at zero on any creature that has never received external injections, and injections have no physiological consequences.
- **Do not trust the "Glucose + Glycolase → Pyruvate" example in the docs as stock biology.** The actual stock glycolysis reaction (gene 34) does not involve Glycolase at all; it is `Glucose + ADP → Pyruvate + ATP`. The docs' formulation is pedagogical.
- **Modders can freely claim chemical 115 for their own use** — nothing in the stock genome will conflict. This makes it a natural choice for "realistic glycolysis" addons, metabolic-illness mechanics, or new liver/muscle enzyme agents.
- **Care when importing older-genome breeds.** A few experimental community genomes *do* wire Glycolase into a real pathway (typically as an enzyme cofactor regenerated by the reaction, or as an injectable booster). Creatures from such lines will show a meaningful Glycolase column; injecting or draining it *will* have physiological effects for them. If unsure, inspect the imported creature's gene list for any reaction, receptor, or emitter referencing chemical 115 before drawing conclusions.
- **No need to feed "enzyme pills" to stock Norns.** Any consumable agent claiming to "boost glycolysis via glycolase" on a standard Norn is either a no-op (pure `CHEM 115` injection) or is actually delivering some other effect (e.g. CHEM on Glucose or Energy directly) and simply labelled as glycolase for flavour.

### Summary

```
                   (No stock emitter)
                           │
                           ▼
      Glycolase [115]  ────┼────  (No stock reaction consumes it)
       • half-life ≈ ∞     │
       • initial 0 / 256   │
       • no receptors      │
                           ▼
                   (No stock receptor reads it)

 Stock biology never sets, consumes, or reads Glycolase.
 The "Reaction" organ #2 runs glycolysis directly,
 via   1× Glucose [3] + 2× ADP [36]  →  2× Pyruvate [2] + 2× ATP [35]
 (gene 34, rate byte 40, "Short" speed),
 without any enzyme mediator.

 Glycolase is a reserved chemical slot:
   - Named for semantic clarity and modder convenience
   - Kept inert in the stock genome by design
   - Free for modded genomes / agents to wire into real biology
```

Glycolase therefore occupies the same niche in the Creatures 3 chemistry as Insulin: it is an example of a chemical that exists for **human readers and modders**, not for the creature itself. Its role in gameplay is not a biological function but an **extensibility point** — a stable, well-named, never-colliding chemical id reserved for future biology that the Docking Station shipped without implementing, and a deliberate choice by the genome designers to let the reaction rate speak for the enzyme's existence without paying the gene cost of modelling the enzyme pool explicitly.
