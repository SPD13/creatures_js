# 096 - Sodium thiosulphite

Sodium thiosulphite is chemical slot 96 in the Creatures 3 chemistry, listed in the library (`creatures-chemicals.js`) with no descriptive tagline and displayed to the player as **"Sodium thiosulphite"** in `ChemicalNames.catalogue`. In the *Materia Medica* it is presented under its real-world spelling as **sodium thiosulphate** — the medicinal compound that is used in actual clinical practice to neutralise cyanide poisoning. In Creatures 3 it plays exactly that single, narrow role: it is the **specific chemical antidote to Cyanide (chem 67)** and nothing else.

Sodium thiosulphite has **no endogenous production** in the standard genome — no emitter, no synthesising reaction, no organ that releases it — so every molecule present inside a creature's bloodstream comes from **outside** the body, typically delivered by the **Cyanide Cure** potion or (in weaker doses) by the **General Cure** potion from the Materia Medica Creature Disk. It also has **no receptors** of any kind: the body does not "sense" its presence, no organ behaviour is modulated by it, and it has no direct effect on mood, drives, instinct or physical state. Its only participation in the biochemistry is as the second reactant in **Reaction 86**, `Cyanide + Sodium thiosulphite → (nothing)`, which destroys one molecule of each chemical with a very short half-life of 4 ticks (~0.13 s at 30 tps). The reaction produces no by-products, so the antidote works cleanly: both the toxin and the cure are consumed together and disappear.

Any excess dose that is not matched by an equivalent amount of Cyanide is cleared from the bloodstream by the chemical's own **passive half-life of 621 ticks (~20 seconds, decay rate 0.99888, labelled "Medium")**. The half-life is short enough that the Cyanide Cure does not leave a lingering chemical footprint in a healthy creature — any surplus antidote drains away within a minute or so and has no side-effects on normal metabolism.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter and no producing reaction in the standard genome | — | — | A healthy creature is born with Sodium thiosulphite = 0 and stays at 0 unless something external injects the chemical. The body cannot synthesise its own cyanide antidote |
| 2 | **Cyanide Cure potion** (Materia Medica) | Syrup agent from the Materia Medica Creature Disk | Drinking the potion runs a CAOS script that injects a concentrated dose of chem 96 directly into the creature's bloodstream | The canonical in-world delivery route. The Materia Medica states: *"This cyanide cure contains sodium thiosulphate which was discovered to neutralise cyanide almost instantly."* Dose is sized to handle any ordinary Cyanide exposure in a single administration |
| 3 | **General Cure potion** (Materia Medica) | Multi-toxin remedy agent | Drinking the potion injects a weaker dose of chem 96 along with several other antidote chemicals | The Materia Medica notes: *"The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin."* Because the dose of Sodium thiosulphite is smaller, multiple bottles may be needed for serious Cyanide loads, and the stronger Cyanide Cure is recommended for acute poisoning |
| 4 | **Third-party / CAOS injection** | User-made `.agents` files, debug console | Custom scripts that `CHEM TARG 96 <amount>` | Useful for testing the antidote reaction and for designing custom medicines. Community medical packs often bundle additional Sodium thiosulphite delivery items for scenarios that expose creatures to repeated Cyanide attacks |

Sodium thiosulphite is therefore a **pure external-delivery chemical**: its only way into a creature's bloodstream is through a potion, injection or scripted cure event. The body never makes it endogenously.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Cyanide antidote reaction** | 74 | — | Reaction 86: `1× Cyanide [67] + 1× Sodium thiosulphite [96] → (nothing)` | — | — | rate 14 (half-life 4 ticks, "Very short") | — | The chemical's only active role. Both reactants are consumed stoichiometrically with no product, so when Sodium thiosulphite meets Cyanide in the bloodstream the two molecules annihilate each other in a handful of ticks. Because the half-life is 4 ticks, a creature that has just drunk the Cyanide Cure typically shows its Cyanide level falling to zero within a fraction of a second |
| 2 | **No receptors** | — | — | — | — | — | — | — | The chemical has no sensors anywhere in the body. It does not trigger drives, it is not read by the brain, it does not modulate reaction rates and it has no REDUCE/injury effects. The creature cannot directly perceive the antidote and will not react behaviourally to its presence |
| 3 | **Passive decay** | — | — | Half-life **621 ticks** ("Medium", decay rate 0.99888) | — | — | — | Any surplus dose not consumed by Reaction 86 fades on its own over ~20 seconds. Because the chemical has no side-effects, this decay is gameplay-invisible — it simply ensures the antidote does not accumulate across many administrations |

Sodium thiosulphite's biochemistry is one of the **simplest** in the whole Creatures 3 chemistry set: one consumer reaction, no receptors, no emitters, a moderate half-life. It is a purpose-built **single-function medicinal chemical**.

## Role in Game Mechanics

### The antidote reaction — Reaction 86

Sodium thiosulphite exists in the genome solely to power Reaction 86 (gene 74):

```
 1× Cyanide [67]  +  1× Sodium thiosulphite [96]   →   (nothing)  +  (nothing)
```

Both reactants are destroyed in 1:1 stoichiometry and nothing is produced. This is a **mutual annihilation** reaction — both the toxin and the antidote vanish together — which is the cleanest possible model of an acid/base-style neutralisation in the game's chemistry engine.

At genome value 14 the reaction's half-life is just **4 ticks (~0.13 s at 30 tps)**. In practical terms this means the reaction is essentially **instantaneous on human-perceptible timescales**: as soon as the two chemicals are co-present in the bloodstream, they react away within a single rendered frame or two. The Materia Medica's wording — *"neutralise cyanide almost instantly"* — is an accurate description of the in-engine behaviour.

Because the reaction is strictly 1:1, the outcome of a Cyanide poisoning depends on the **relative** quantities of the two chemicals:

- **Antidote ≥ Cyanide**: All Cyanide is neutralised; some surplus antidote remains and drains away via its 621-tick half-life. Full recovery.
- **Antidote < Cyanide**: All antidote is consumed but some Cyanide remains, continuing to catalyse Energy destruction via Reaction 85. A follow-up dose (or the passive 3,024-tick Cyanide half-life) is required to finish clearing the toxin.

This is why the Materia Medica recommends the **specific Cyanide Cure** for serious poisonings — its single dose is calibrated to exceed any realistic Cyanide load — and warns that the weaker **General Cure** may require *"quite a few bottles"* for complete neutralisation.

### Why the chemical has no receptors

Sodium thiosulphite is unusual among the Creatures 3 chemicals in having **no receptor wiring whatsoever**. Most biologically-active chemicals in the stock genome have at least one receptor somewhere in the body — even background metabolic substrates like Glucose have receptors that drive hunger or modulate organ behaviour. The complete absence of receptors for chem 96 is a deliberate design choice:

1. The chemical's **only intended effect** is to destroy Cyanide via Reaction 86. Any receptor-mediated side-effect would be an off-target action that could interfere with normal behaviour.
2. The chemical is only ever present as a **transient medical intervention**. The body should not learn to rely on it, crave it, or be disturbed by its presence — it should be chemically invisible except for the neutralisation reaction.
3. The creature should not be able to **detect** that it has been cured. Its behaviour should track the *effects* of poisoning (low Energy, distress) and the *effects* of recovery (restored Energy), not the cure itself.

This minimal profile — one reaction, no receptors, external delivery only — makes Sodium thiosulphite a textbook example of a **pure pharmacological antidote** in the game's chemistry model.

### Relationship to the Cyanide Cure potion

The **Cyanide Cure** potion from the Materia Medica Creature Disk is the in-world delivery vehicle for Sodium thiosulphite. Its description reads:

> *"This cyanide cure contains sodium thiosulphate which was discovered to neutralise cyanide almost instantly. Certain bacteria have been known to poison a Creature with cyanide, so you'll need to make sure they drink this Syrup quickly!"*

The potion is implemented as an edible agent that, when consumed, runs a CAOS script that injects a measured dose of chem 96 directly into the creature's bloodstream. The dose is sized to:

- Fully neutralise a single bacterial Cyanide exposure of realistic strength.
- Leave a modest surplus to catch late-arriving Cyanide molecules still being released by an ongoing infection.
- Decay away within ~20 seconds after the Cyanide is cleared, leaving no lingering chemical footprint.

The player-visible urgency of the Cyanide Cure (*"make sure they drink this Syrup quickly!"*) is grounded in Reaction 85's catalytic energy-destruction mechanic: every second a Cyanide-poisoned creature goes untreated, more Energy is destroyed and the creature moves closer to an energy-failure death. Once the antidote arrives, Reaction 86 clears the toxin in a fraction of a second — but the **window** to administer it matters far more than the reaction's own speed.

### Relationship to the General Cure potion

The **General Cure** potion bundles smaller doses of several antidote chemicals — including Sodium thiosulphite — into a single convenient bottle. Its Materia Medica description reads:

> *"This extremely useful potion can cure many different illnesses, all from the one bottle. It is extremely weak, so you may need to get a Creature to have quite a few bottles of it in order to cure anything completely. The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin. It is highly recommended that in the case of serious toxic poisonings that you use the stronger cure specific potions instead of this General Cure."*

Because Reaction 86 is stoichiometric (1:1), the General Cure's smaller dose simply means fewer Cyanide molecules are neutralised per bottle. Mathematically, `N` bottles of General Cure ≈ 1 bottle of Cyanide Cure, where `N` depends on the dose ratio set by the two agents' CAOS injection scripts. In practice the General Cure is a **convenience good** for mild poisoning and the Cyanide Cure is the **emergency drug** for heavy exposure.

### Why the passive half-life is "Medium" (~20 s) and not longer

The 621-tick half-life is carefully chosen. Key constraints:

- **Long enough** that a single potion delivers enough sustained presence in the bloodstream for the 4-tick Reaction 86 to find and neutralise all Cyanide molecules, even if they enter the body slightly later (e.g. from a still-active bacterial infection that keeps trickling in chem 67).
- **Short enough** that excess antidote does not accumulate across many potion administrations. A creature cured once and then re-exposed a minute later cannot rely on leftover antidote — it needs another dose. This preserves the **scarcity and urgency** of the Cyanide Cure potion.
- **Short enough** that the chemical has no meaningful presence in the body during normal life. Sodium thiosulphite is invisible outside of its role as an active cure.

Contrast this with longer-lived medical chemicals like EDTA (chem 95, half-life ~13 minutes), which is designed to give heavy-metal chelation a sustained window to work in, or Vitamin E / Vitamin C (chems 98 / 99, essentially immortal), which are meant to build up a lifetime reserve. Sodium thiosulphite sits in the **short-acting acute-intervention** bucket alongside the other fast-response medicines.

### Interaction with the wider antidote palette

Sodium thiosulphite is one of six specific antidotes in the Materia Medica's stock pharmacopoeia, each paired to a distinct toxin via a single dedicated reaction:

| Antidote | Toxin cleared | Reaction pattern |
|----------|---------------|------------------|
| **Sodium thiosulphite (96)** | Cyanide (67) | `Cyanide + Thiosulphite → nothing` |
| EDTA (95) | Heavy Metals (66) | `Heavy Metals + EDTA → nothing` |
| Antigen-family (84–89) | Corresponding Antibody-family (102–107) | Stoichiometric neutralisation |
| Prostaglandin (94) | Histamine A/B | Dampens inflammation |
| Anti-oxidant (93) | Oxidative damage chemistry | Scavenger reactions |

The design pattern is uniform: **one antidote, one toxin, one specific reaction, stoichiometric consumption, no receptors**. Sodium thiosulphite is the archetypal example of the pattern — its single-reaction, zero-receptor profile is the cleanest instance in the chemistry.

### Behavioural invisibility

Because Sodium thiosulphite has no receptors and no emitter, it has **no direct behavioural consequences**. A creature does not:

- Feel a drive for it (no "need antidote" drive).
- Learn that a particular object produces it (no classifier stimulus tied to chem 96).
- Experience pain, pleasure, sleepiness or any other mood shift from its presence.
- Show any animation or posture change on receiving the cure.

All observable behavioural recovery from a Cyanide cure therefore comes from the **elimination of Cyanide's effects** — Energy stops being destroyed, the REDUCE receptor on the inhibited somatic reaction releases, and the creature's normal metabolism refills the Energy pool. The antidote itself is chemically silent. This makes the cure feel instantaneous and complete: the creature transitions from "poisoned and distressed" to "recovering" the moment the Cyanide level reaches zero, with no intermediate state in which the antidote itself is producing symptoms.

### Edge cases and failure modes

A handful of edge cases are worth noting for agent designers and genetic engineers:

- **Administering the cure before exposure** does nothing useful: with no Cyanide present, the antidote simply decays away via its 621-tick half-life. Prophylactic dosing does not work.
- **Over-dosing** has no ill effects: the chemical has no receptors to over-stimulate and no toxic threshold. Excess simply decays.
- **Under-dosing** (partial cure) is common with General Cure in serious poisonings and requires repeat administration. The 1:1 stoichiometry of Reaction 86 makes the arithmetic straightforward: half the dose clears half the Cyanide.
- **Genetic mutation of Reaction 86** (disabling gene 74 or drastically slowing it) would render Sodium thiosulphite completely inert. Such a mutant creature cannot be cured of Cyanide poisoning by any stock potion — a scenario sometimes used in community "hardcore" genomes to make bacterial cyanide infections untreatable.

## Summary

```
 Chemical 96 — Sodium thiosulphite  (Materia Medica spelling: "sodium thiosulphate")
 ------------------------------------------------------------------------------------
 Producers:   NONE internally — external only
              (Cyanide Cure potion, General Cure potion, CAOS injection)

 Consumers:   Reaction 86  (Cyanide + Sodium thiosulphite → nothing;
                            gene 74, half-life 4 ticks, "Very short")

 Receptors:   NONE — chemical is behaviourally invisible

 Half-life:   621 ticks (~20 s at 30 tps, decay rate 0.99888 — "Medium")

 Delivery:    Cyanide Cure potion (primary, large dose — specific antidote)
              General Cure potion (secondary, small dose — multi-toxin convenience)

 Narrative role: The specific chemical antidote to Cyanide poisoning.
                 Mutually annihilates with Cyanide in a handful of ticks,
                 produces no by-products, has no side-effects, and any surplus
                 fades quietly within half a minute. A textbook example of
                 the stock Materia Medica's "one antidote, one toxin, one
                 reaction, no receptors" design pattern.
```

Sodium thiosulphite is a study in **deliberate biochemical minimalism**. It exists to do exactly one thing — destroy Cyanide — and every property of its chemistry is tuned to that single role: no internal production to keep the body from relying on it, no receptors to avoid off-target effects, a very fast consuming reaction so it acts *"almost instantly"* as promised by the Materia Medica, and a medium passive half-life so it does not linger or accumulate. The pairing with Cyanide's own biochemistry is likewise elegant: a catalytic acute toxin (Cyanide, chem 67) and its one specific annihilating antidote (Sodium thiosulphite, chem 96) together model real-world cyanide poisoning and sodium-thiosulphate treatment with remarkable fidelity for a late-1990s simulation chemistry.

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:152` — slot 96 named "Sodium thiosulphite" (player-visible name)
- `Rebuild/Libraries/creatures-chemicals.js:120` — chemical descriptor `{ id: 96, name: 'Sodium thiosulphite', description: '' }`
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - `:2821-2852` — reaction 86 (gene 74): `Cyanide + Sodium thiosulphite → nothing` (antidote, half-life 4 ticks, "Very short")
  - `:8416-8423` — half-life entry: 621 ticks, decay rate 0.99888, "Medium"
  - No emitter entries — chemical has no internal production pathway
  - No receptor entries — chemical has no sensors anywhere in the body
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:103-104` — "Cyanide Cure" potion description (sodium thiosulphate, "almost instantly", bacterial origin, urgency)
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:131-132` — "General Cure" potion — weaker multi-toxin remedy listing cyanide among the toxins it dilutes
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:363` — potion ingredient label "Sodium thiosulphate"
- `Rebuild/DOCUMENTATION/chemicals/067 - Cyanide.md` — paired toxin documentation detailing Reaction 85 (catalytic energy destruction) and the full Cyanide-poisoning lifecycle that Reaction 86 terminates
