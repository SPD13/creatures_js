# 067 - Cyanide

Cyanide is chemical slot 67 in the Creatures 3 chemistry, described in the library as **"Any chemical containing cyanide anion"** and listed in the game's own *Materia Medica* under the ChemicalNames headings alongside Heavy Metals, Belladonna and Geddonase as one of the four classic environmental toxins of Albia. Biologically it is modelled on the real-world mechanism of cyanide poisoning: rather than damaging organs directly, Cyanide acts as a **catalytic destroyer of Energy**. A single molecule of the chemical can participate in the reaction `Cyanide + Energy → Cyanide`, which consumes Energy without consuming the Cyanide itself — so once a creature has Cyanide in its bloodstream, every molecule acts as a tiny, persistent energy-burner that quickly starves the body of its fundamental metabolic currency. In the *Materia Medica* Cyberlife describes the effect directly: *"It breaks down energy and can stop your creature's heart beating. It is fast acting and hard to cure in time!"*

Unlike Heavy Metals (chem 66), Cyanide is **not permanent**. The standard genome gives it a finite but long decay half-life (**3,024 ticks ≈ 100 seconds** of real play time at 30 tps, decay rate 0.99977, labelled "Long"), and it is cleared from the body by a **specific antidote reaction** — `Cyanide + Sodium thiosulphite → (nothing)` — which runs on a very short half-life of just 4 ticks (~0.13 s) once the antidote chemical arrives. The antidote is delivered by the **Cyanide Cure** potion from the Materia Medica Creature Disk: *"This cyanide cure contains sodium thiosulphate which was discovered to neutralise cyanide almost instantly."* The General Cure potion also contains cyanide among the toxins it dilutes. No part of the standard genome *produces* Cyanide internally — it has no emitter and no synthesising reaction — so every milligram of chemical 67 inside a creature's body came from an external source, typically the cyanogenic bacteria of Albia or custom third-party agents.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter and no producing reaction in the standard genome | — | — | A healthy creature is born with Cyanide = 0 and stays at 0 unless something external injects the chemical. Unlike Heavy Metals, Cyanide *can* drain back out on its own via the passive half-life, so a brief contact with a cyanogenic source does not leave a permanent residue |
| 2 | **Cyanogenic bacteria** | Bacteria that the stock game identifies as a canonical environmental source | Bacteria's infection script injects chem 67 into the infected creature | The Materia Medica's Cyanide Cure entry states directly: *"Certain bacteria have been known to poison a Creature with cyanide, so you'll need to make sure they drink this Syrup quickly!"* This is the design-intended in-world delivery route |
| 3 | **Third-party toxic agents** (poisoned food, stings, custom COBs) | User-made `.agents` files | Custom scripts that `CHEM TARG 67 <amount>` | Community toxic food packs and nasty-creature packs commonly use chem 67 for "quick-kill" poison effects because its energy-draining mode of action produces visible distress and death far faster than the slow organ-damage of Heavy Metals |
| 4 | **CAOS injection** | — | `CHEM TARG 67 <amount>` from scripts or the debug console | Useful for testing the Cyanide Cure potion and for designing disease scenarios. Because the half-life is long but finite, injected doses fade naturally over a few minutes even without the antidote, unlike Heavy Metals which require the specific EDTA reaction |

Cyanide therefore joins Heavy Metals, Belladonna and Geddonase as a **chemical with no endogenous production in the standard genome** — its presence in a creature's bloodstream is always a sign of external contamination.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Catalytic energy destruction** | 73 | — | Reaction 85: `1× Cyanide [67] + 1× Energy [34] → 1× Cyanide [67]` | — | — | rate 9 (half-life 2 ticks, "Very short") | — | The core toxicity mechanism. Cyanide is *regenerated* as a product, so it acts as a **catalyst** that destroys Energy without being consumed. With a 2-tick half-life this runs extremely fast — even small amounts of Cyanide can drain a creature's Energy pool down to zero within seconds of entering the bloodstream |
| 2 | **Sodium thiosulphite antidote reaction** | 74 | — | Reaction 86: `1× Cyanide [67] + 1× Sodium thiosulphite [96] → (nothing)` | — | — | rate 14 (half-life 4 ticks, "Very short") | — | The one and only stock-genome clearance pathway. Both chemicals are consumed stoichiometrically and no by-product is produced. The 4-tick half-life means that once Sodium thiosulphite arrives in the bloodstream, Cyanide is neutralised almost instantly |
| 3 | **Somatic reaction inhibitor receptor** | 164 | Reaction / Somatic | Locus 0 (reaction-rate modifier) | 0 | 201 | 199 | **REDUCE (invert)** | A receptor wired to a somatic reaction rate. With threshold 0 and flags REDUCE, any Cyanide at all drives the receptor output down from its high nominal (201) toward zero, shutting down the associated metabolic reaction. This is a second, indirect toxicity channel: as well as directly burning Energy, Cyanide also **blocks part of the body's normal biochemistry** so that even the Energy still present cannot be used as efficiently |
| 4 | **Passive decay** | — | — | Half-life **3,024 ticks** ("Long", decay rate 0.99977) | — | — | — | A creature that escapes a Cyanide source without treatment will eventually clear the chemical on its own over ~100 seconds, but the energy damage inflicted during those 100 seconds is severe. Decay is slow enough that the cure is nearly always the faster option |

The chemistry shows the characteristic **"fast-acting acute toxin"** design pattern: no internal production, a long-but-finite half-life, a catalytic energy-destruction reaction that magnifies a small dose into a sustained metabolic attack, a receptor that inhibits normal biochemistry, and a single specific antidote that clears the chemical in seconds. This is the chemical face of a *real* poisoning, in contrast to Heavy Metals' slow chronic-toxicity profile.

## Role in Game Mechanics

### The catalytic energy-destruction reaction

Reaction 85 (gene 73) is the single most important mechanic in Cyanide's chemistry. Its formula is:

```
 1× Cyanide [67]  +  1× Energy [34]   →   1× Cyanide [67]  +  (nothing)
```

Cyanide is listed as **both a reactant and a product**: every time the reaction runs, one unit of Energy is destroyed but the Cyanide molecule that catalysed the destruction is regenerated and free to react again. In enzymology this is the hallmark of a **catalyst**, and Cyberlife is using it deliberately to model the real-world action of cyanide, which inhibits cellular respiration without being consumed by the reaction.

At genome value 9 the reaction half-life is just **2 ticks (~0.07 s at 30 tps)**, which means that in every 2-tick window roughly half of the Energy *that could react with the available Cyanide* is destroyed. Because the Cyanide is not consumed, the reaction continues at full strength until either (a) the Cyanide itself decays to near-zero via the 3,024-tick passive half-life, or (b) Reaction 86 neutralises the Cyanide. In the meantime, the creature's Energy pool is drained far faster than the Glycolysis, Lactate→Pyruvate and fat-metabolism pathways can replenish it.

This is why the Materia Medica warns that Cyanide *"can stop your creature's heart beating"*: the heart organ, like every other somatic organ, consumes Energy to survive, and the body-wide energy starvation caused by Cyanide rapidly starves the cardiac tissue. Death by cyanide in Creatures 3 is not framed as an organ-injury death but as an **energy-failure death** — a creature whose Energy pool has been burned down to zero faster than it can be regenerated simply runs out of metabolic fuel.

### The Sodium thiosulphite antidote reaction

Reaction 86 (gene 74) is the one and only stock pathway that clears Cyanide:

```
 1× Cyanide [67]  +  1× Sodium thiosulphite [96]   →   (nothing)   +   (nothing)
```

Both chemicals are consumed stoichiometrically and nothing is produced. The reaction half-life at genome value 14 is just **4 ticks (~0.13 s)**, so once Sodium thiosulphite arrives in the bloodstream — typically delivered as a single large dose by drinking the Cyanide Cure potion — it finds any Cyanide present and neutralises it almost instantly. The Materia Medica's "almost instantly" wording is accurate.

Because the reaction is one-to-one, the antidote works best when the Sodium thiosulphite dose is at least as large as the Cyanide load. Undersized doses leave residual Cyanide that continues to catalyse Energy destruction until further treatment or until the passive half-life clears the remainder. The Cyanide Cure potion is calibrated to deliver a dose comfortably above the largest Cyanide load an ordinary creature is likely to accumulate in a single exposure.

### The REDUCE receptor on a somatic reaction

Receptor 56 (gene 164) wires Cyanide into the **Reaction organ, Locus 0** — the locus that modulates a specific somatic biochemical reaction's rate — with flags `REDUCE (invert)`. The nominal is **201** and the gain is **199**, so when Cyanide is absent the receptor output is close to the maximum (~201/255) and the affected reaction runs at full speed. As Cyanide concentration rises above the threshold of 0, the inverted receptor output falls quickly toward zero, effectively **switching off** the associated somatic reaction.

Taken together with Reaction 85, this gives Cyanide a **two-pronged attack** on metabolism:

1. Reaction 85 directly *destroys* the Energy currency of the cell.
2. Receptor 56 additionally *blocks* a somatic reaction from running.

Even if the creature somehow managed to keep producing Energy faster than Reaction 85 could destroy it, Receptor 56 would still be shutting down part of the normal metabolic machinery — a defence-in-depth pattern that ensures a Cyanide-poisoned creature cannot simply "out-metabolise" the toxin. The genome's design intent is clear: once Cyanide is present, the creature is in genuine metabolic trouble until the chemical is cleared.

### Decay, dose-response and time-to-death

The passive half-life of 3,024 ticks (**~100 s**, decay rate 0.99977) means that, *in the absence of the antidote*, a Cyanide dose loses half its concentration every 100 seconds of real play time. That is slow enough that the catalytic Energy destruction of Reaction 85 will typically cause serious harm before passive decay takes effect. Roughly:

| Cyanide dose (0–255) | Expected outcome without treatment |
|----------------------|--------------------------------------|
| Tiny (< 10) | Minor energy wobble, creature recovers in a few minutes as Cyanide decays |
| Small (10 – 40) | Noticeable tiredness, hunger for energy, creature seeks food and rest; usually survives |
| Moderate (40 – 120) | Rapid energy collapse; creature becomes tired and distressed; survival depends on how quickly it finds food or the antidote |
| Large (> 120) | Energy destroyed faster than any food intake can replace; high risk of death within 10–30 seconds of ingestion unless the Cyanide Cure is administered |

The Cyanide Cure potion, by contrast, clears the chemical in a handful of seconds regardless of dose size, which is why the Materia Medica emphasises **urgency** (*"you'll need to make sure they drink this Syrup quickly!"*) rather than simply waiting the chemical out. For larger doses, the passive half-life is irrelevant — the creature dies long before meaningful decay occurs.

### The Cyanide Cure and General Cure potions

The Materia Medica lists two stock-game potions that address Cyanide:

- **Cyanide Cure** (*"This cyanide cure contains sodium thiosulphate which was discovered to neutralise cyanide almost instantly."*) — delivers a concentrated dose of Sodium thiosulphite, the specific reactant for Reaction 86. This is the treatment of choice for any visible Cyanide poisoning.
- **General Cure** (*"The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin."*) — a weaker combined potion that includes a smaller dose of Sodium thiosulphite among other antidote reactants. The Materia Medica recommends the specific Cyanide Cure for serious cases.

The design rationale is explicit: specific cures are fast and reliable; general cures are convenient but may not deliver enough Sodium thiosulphite to fully clear a large Cyanide load. Because Reaction 86 is stoichiometric (1:1), doubling the Cyanide dose doubles the Sodium thiosulphite requirement — which is why the Materia Medica recommends pairing the General Cure with *multiple* bottles, or using the specific cure in serious cases.

### Recovery after successful treatment

Unlike Heavy Metals, Cyanide does **not** leave persistent organ damage behind — there are no `RLOCUS_INJURY` receptors on the chemical. The damage model is entirely through **Energy depletion**, which is reversible: once the Cyanide is cleared by Reaction 86, Reaction 85 stops running, Receptor 56 releases its inhibition of somatic metabolism, and the creature's ordinary metabolic pathways (Glucose → Pyruvate → ATP, fatty-acid oxidation, etc.) can replenish the Energy pool.

Recovery speed therefore depends on food availability: a fed creature refills Energy quickly, an unfed creature refills it slowly. This is why the Materia Medica's follow-up advice is simply *"make sure they are well fed and rested"* — no special recovery chemistry is needed, the creature's normal metabolism handles it as long as substrate is available.

### Environmental delivery: the bacterial origin

The Materia Medica identifies **bacteria** as the canonical in-world source of Cyanide exposure: *"Certain bacteria have been known to poison a Creature with cyanide."* In the stock game this corresponds to disease-carrying microorganisms whose infection scripts inject chem 67 into an infected creature over time. Because of the long-but-finite passive half-life, a brief bacterial encounter clears on its own, but a sustained infection produces a continuous low-grade Cyanide burden that steadily saps the creature's Energy.

This design makes Cyanide fundamentally different from Heavy Metals as a gameplay element: Heavy Metals are a **chronic exposure toxin** (Stinger Cookies over many meals), while Cyanide is an **acute infection toxin** (bacterial poisoning) that needs rapid intervention. The two toxins together cover the two major axes of real-world poisoning and give the Materia Medica's potions complementary, non-overlapping roles.

## Summary

```
 Chemical 67 — Cyanide  ("Any chemical containing cyanide anion")
 -----------------------------------------------------------------
 Producers:   NONE internally — external only (bacterial infection, custom agents, CAOS)
 Consumers:   Reaction 85   (Cyanide + Energy → Cyanide; half-life 2 ticks, CATALYTIC)
              Reaction 86   (Cyanide + Sodium thiosulphite → nothing; half-life 4 ticks)

 Receptors (1):
   - Reaction organ / Locus 0, REDUCE  (gene 164, nom 201, gain 199)
       → inhibits a somatic metabolic reaction whenever Cyanide is present

 Half-life:   3,024 ticks (~100 s at 30 tps, decay rate 0.99977 — "Long" but finite)
 Antidote:    Sodium thiosulphite (chem 96), delivered by the "Cyanide Cure" potion

 Stock-game in-world source: cyanogenic bacteria (Materia Medica design note)

 Narrative role: The game's acute fast-acting metabolic toxin. A catalyst that
                 burns the body's Energy currency without being consumed itself,
                 so even small doses rapidly starve the creature of metabolic
                 fuel. Clears fully once the specific antidote is administered
                 and leaves no lingering organ damage — the creature just needs
                 food and rest to rebuild its Energy pool.
```

Cyanide fills a deliberately different gameplay niche from the other stock toxins: it is **fast**, **acutely dangerous**, **self-clearing given time**, and **cleanly reversible with a specific antidote**. The catalytic energy-destruction reaction is an unusually elegant piece of biochemistry — a single line of genome data (Reaction 85, with Cyanide on both sides) captures the defining feature of real-world cyanide poisoning in a way that propagates naturally through the rest of the metabolic model. Paired with Heavy Metals' opposite profile (slow, chronic, permanent without a specific antidote), the two chemicals together give Albia a rich, biologically-grounded toxin palette whose cures are genuinely worth carrying.

## Key Source References

- `ChemicalNames.catalogue:117` — slot 67 named "Cyanide"
- `Rebuild/Libraries/creatures-chemicals.js:85` — chemical descriptor "Any chemical containing cyanide anion"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - `:2788-2819` — reaction 85 (gene 73): `Cyanide + Energy → Cyanide` (catalytic energy destruction, half-life 2 ticks)
  - `:2821-2852` — reaction 86 (gene 74): `Cyanide + Sodium thiosulphite → nothing` (antidote, half-life 4 ticks)
  - `:4396-4414` — receptor 56 (gene 164): Reaction organ / Locus 0, REDUCE (invert), Cyanide threshold 0, nominal 201, gain 199
  - `:8208-8215` — half-life entry: 3,024 ticks, decay rate 0.99977, "Long"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:103-104` — "Cyanide Cure" potion description and design intent (bacterial origin, sodium thiosulphate, urgency)
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:131-132` — "General Cure" potion — weaker multi-toxin remedy that includes cyanide
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:328` — player-visible "Cyanide" name
