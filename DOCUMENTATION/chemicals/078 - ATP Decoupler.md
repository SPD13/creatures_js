# 078 - ATP Decoupler

ATP Decoupler is chemical slot 78 in the Creatures 3 biochemistry. Its descriptor in the chemical library is empty, but the game's own *Materia Medica* gives the definitive gloss: "*This nasty toxin breaks down ATP into ADP, causing imbalance in the regulation of the creature's bloodstream which in time can leave a Creature devoid of energy*". The name is a direct borrowing from real biochemistry — an **uncoupler of oxidative phosphorylation**, a class of molecule (dinitrophenol, carbonyl cyanide, certain thermogenic agents) that lets the proton gradient across a mitochondrial membrane dissipate without producing ATP. In Creatures-terms the model is simplified to a single catalytic destruction: every time the toxin "fires", one unit of the creature's ATP fuel currency is flipped back to ADP (spent form), **while the decoupler molecule itself regenerates unchanged** and continues to act. This makes ATP Decoupler a **self-regenerating energy thief** — unlike Geddonase (69), which consumes itself as it destroys fat, ATP Decoupler is a true catalyst and will keep burning the ATP pool for as long as the toxin is present.

Because the energy currency of the entire metabolism sits on top of the ATP ↔ ADP cycle (glycolysis, β-oxidation, protein catabolism and muscle contraction all pass their yield through reaction 50 `ADP + Pyruvate → ATP + …` or equivalent regeneration steps), draining ATP is equivalent to draining *effort itself*. A Norn carrying a large ATP Decoupler load has a fully-stocked pantry — Glucose, Fatty Acids, Triglycerides, all intact — but cannot keep the cellular battery charged. The phenotype is an enervated, listless creature that eats normally, sleeps heavily, but still slides into fatigue and eventually unconsciousness as every attempt to regenerate ATP is shorted out almost as fast as it is made.

Unlike most metabolites, ATP Decoupler has **no endogenous production pathway**. No gene emits it, no reaction produces it, no stock in-world food injects it; a newborn Norn's ATP Decoupler concentration is 0, and it stays at 0 unless something external puts it there. This places it in the "purely external toxin" family alongside Heavy Metals (66), Cyanide (67), Belladonna (68), Geddonase (69) and Glycotoxin (70). Unlike Geddonase, however, ATP Decoupler **has a dedicated antidote**: the "ATP Decoupler Cure" potion injects Medicine one (chemical 92), which consumes the toxin 1 : 1 in a very short-half-life reaction (half-life 2 ticks, `1× 78 + 1× 92 → nothing`). The toxin is also one of the six declared targets of the weak "General Cure" potion. Residual ATP Decoupler left untreated fades with a long passive half-life (1 370 ticks, "Long", decay 0.99949 ≈ 46 s at 30 tps), but the catalytic ATP destruction proceeds ~500× faster than passive decay, so a significant dose will drain a creature's ATP reserves many times over before fading on its own.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter, no producing reaction, no starting endowment | — | — | Initial concentration is 0 for every newborn creature. The genome contains zero production mechanisms for chemical 78; any presence in the bloodstream is evidence of external exposure |
| 2 | **Third-party toxic agents, bacteria & diseases** (custom content) | User-made `.agents` / `.cos` files, disease COBs | Scripts that `CHEM TARG 78 <amount>` on ingestion, contact, sting, or infection tick | The *Materia Medica* treats "ATP Decoupler infection" as a disease-like condition to be screened for by the Medical Pod's scanner and cured with the matching potion, implying the design intent was that custom diseases or stinging creatures would be the in-world vectors. No stock-game content in the main 001 bootstrap actually injects chem 78 |
| 3 | **CAOS injection** | — | `CHEM TARG 78 <amount>` from console or scripts | The standard way to produce ATP Decoupler for testing, debugging the Medical Pod scanner, or verifying that the ATP Decoupler Cure potion is working. Useful when tuning ATP / ADP balance or testing receptor-59's reaction-rate suppression |

ATP Decoupler therefore shares Geddonase's structural profile — the body is a pure *consumer*, never a producer — but the stock game includes a fully wired cure system for it (Medicine-one reaction, dedicated potion, explicit listing in General Cure, dedicated Medical Pod scanner threshold), marking it as a "classic cureable toxin" in the Shee Medicinal system rather than an uncurable catabolic enzyme like Geddonase.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Catalytic ATP destruction** | 96 | — | Reaction 84: `1× ATP [35] + 1× ATP Decoupler [78] → 1× ADP [36] + 1× ATP Decoupler [78]` | — | — | rate 11 (half-life **3 ticks**, "Very short") | — | The core toxicity mechanism. Every tick, each unit of ATP Decoupler catalyses the conversion of one unit of ATP to ADP without itself being consumed. The half-life is crushingly short — at 30 tps, half of the available ATP is dumped to ADP every 0.1 s while the toxin is present. The decoupler slot appears on both sides of the reaction with `amount: 1`, marking it as a true catalyst |
| 2 | **Antidote reaction** | 97 | — | Reaction 83: `1× ATP Decoupler [78] + 1× Medicine one [92] → (nothing)` | — | — | rate 7 (half-life **2 ticks**, "Very short") | — | The cure. One unit of Medicine one (from the "ATP Decoupler Cure" potion) eliminates one unit of the toxin on a 1 : 1 basis. Half-life 2 ticks ≈ 67 ms at 30 tps — essentially instantaneous; any Medicine one in the bloodstream wipes ATP Decoupler out of the creature within a handful of frames |
| 3 | **Reaction-rate suppressor receptor** | 165 | Reaction / Somatic | Locus 0 | 0 | 248 | 239 | REDUCE (invert) | Receptor 59: a very aggressive inverter on the Reaction organ's Somatic tissue locus 0. Organ 3 ("Reaction") holds the biochemistry's reaction-rate modulation channel: receptors wired to it shift the rate of reactions keyed off locus 0 when their driver chemical is present. With nominal 248, gain 239 and the REDUCE flag, this receptor **suppresses** the associated reaction rate almost to zero as ATP Decoupler rises — the in-body signal that the toxin is de-regulating the normal biochemistry by jamming reaction throughput, on top of directly destroying ATP. This mirrors the "causing imbalance in the regulation of the creature's bloodstream" wording of the in-game help text |
| 4 | **Passive decay** | — | — | Half-life **1 370 ticks** ("Long", decay rate 0.99949) | — | — | — | Background clearance of any residual ATP Decoupler without cure. ~46 seconds at 30 tps — long enough that a creature that simply waits out the toxin without drinking the cure potion will lose a lot of ATP in the interim, since Reaction 84 (HL 3) operates roughly 460× faster than passive decay. The passive half-life only dominates once the creature's ATP has already been fully depleted and the cycle has nothing left to destroy |

The **cure** line-up in the stock game is:

| Potion | Tag | Injects | Reaction consuming ATP Decoupler |
|--------|-----|---------|------------------------------------|
| **ATP Decoupler Cure** | `Agent Help 2 25 4` / `scrp 2 25 4 12` | `CHEM 92 1` (Medicine one, 1.0 units) | Reaction 83 (HL 2 ticks, 1 : 1 neutralisation) |
| **General Cure** | `Agent Help 2 25 19` / `scrp 2 25 19 12` | `CHEM 92 0.15` (Medicine one, 0.15 units) alongside six other cure chemicals at 0.15 each plus `CHEM 117 0.45` Adrenalin | Reaction 83 (HL 2 ticks, 1 : 1 neutralisation, but only 0.15 units per bottle) |

The Medical Pod's scanner (`Assets/Bootstrap/001 World/medical scanner.cos:80`) flags ATP Decoupler as one of the "Creature is sick" triggers with a detection threshold of `chem 78 > 0.1`, putting it on the same alert footing as Heavy Metals, Cyanide, Belladonna, Geddonase and Glycotoxin.

## Role in Game Mechanics

### The catalytic ATP → ADP destruction

Reaction 84 is the defining mechanic of ATP Decoupler:

```
 1× ATP [35]  +  1× ATP Decoupler [78]   →   1× ADP [36]  +  1× ATP Decoupler [78]
```

The decoupler appears on both sides of the equation with `amount: 1`, marking it as a classic **enzymatic catalyst** in the Creatures biochemistry: the toxin is not consumed by its own reaction. Each decoupler molecule can process an indefinite number of ATP molecules until it is removed either by Medicine one (Reaction 83) or by passive decay over ~46 s. This is in sharp structural contrast to Geddonase (Reaction 87), which *is* consumed as it destroys fat and therefore has a finite "dose" of damage per dose of toxin.

At genome value 11 the reaction half-life is **3 ticks ≈ 0.1 s**. In practical terms this means:

- **ATP is destroyed essentially as fast as it is produced.** The main ATP-regeneration reaction (Reaction 50: `ADP + Pyruvate → ATP + Lactate`, half-life ~14 ticks) runs roughly 5× slower than Reaction 84. A Norn with any substantive ATP Decoupler load cannot keep up with the destruction using normal glycolytic flux: energy drawn from food and fat reserves is shunted into ATP and then almost immediately converted back to ADP.
- **The ATP/ADP ratio collapses toward "all ADP".** Because only ATP is attacked and the produced ADP is recycled back into the same pool that glycolysis needs to top up, the bloodstream's phosphorylation state slides rapidly toward the ADP-heavy end. Every biochemical process downstream that looks at ATP concentration — receptor-driven loci that gate muscle action, cognition, organ upkeep — sees a falling ATP signal.
- **Energy (chem 34) still decays on its normal schedule.** The Energy pool is produced from its own precursors in reactions that themselves consume ATP; with ATP perpetually spiking down to ADP the flux into Energy falls, and Energy then decays via its own passive half-life into a starvation state. The creature becomes exhausted *even while eating well* because no matter how much substrate it has, the end-of-pipeline currency is being drained catalytically.

### The reaction-rate suppression receptor

Receptor 59 (gene 165) wires ATP Decoupler into the Reaction organ's Somatic tissue at locus 0 with threshold 0, nominal **248** and gain **239**, flagged REDUCE (invert). In the stock genome's use of organ 3, locus 0 receptors modulate the throughput of a specific biochemical reaction on the Somatic side of the organ: a "none"-flagged receptor drives the rate up in proportion to the chemical; a REDUCE-flagged receptor like this one **drives it down**. With an invert baseline of 248 out of 255 and a gain of 239, the receptor delivers nearly the maximum possible suppression effect as ATP Decoupler concentration rises from 0 toward saturating values — it is effectively an "all-the-way off" switch.

This is a second damage channel on top of the direct ATP destruction: by suppressing a reaction rate tied to Somatic tissue, ATP Decoupler is modelling the metabolic *disarray* described in the Materia Medica's "imbalance in the regulation of the creature's bloodstream" line. The creature's normal homeostatic machinery — the network of reaction-rate modulators that keep glucose, glycogen, amino acids and fatty acids flowing through the metabolism at the right speeds — gets jammed, so even the reactions that would help rebuild the ATP pool are running slower than they should. The combined effect is a toxin that both destroys the energy currency and detunes the factory that would re-mint it.

Because locus-0 Reaction-organ receptors behave differently from the more familiar Creature-organ injury or starvation receptors, this channel is harder to "see" from a player's perspective (there is no red injury pulse, no starvation alarm snap, no stagger animation), but its effect propagates through every downstream locus that reads from the suppressed reaction's output chemicals, producing a slow, diffuse decline in biochemical competence that fits the in-fiction description of a creature becoming "very tired" and "devoid of energy".

### The antidote: Medicine one and "ATP Decoupler Cure"

The *Materia Medica* entry for the ATP Decoupler Cure describes it as "*a chemical which the Shee discovered was able to break down the nasty ATP decoupler toxin*". That chemical is **Medicine one** (slot 92). The Medicine Maker dispenses the cure as potion class `2 25 4`; when a creature drinks one, the script `scrp 2 25 4 12` injects `CHEM 92 1` (1.0 units of Medicine one) into the bloodstream. Reaction 83 then runs in the body:

```
 1× ATP Decoupler [78]  +  1× Medicine one [92]   →   (nothing)
```

Both reactants are consumed 1 : 1 and nothing is produced; Medicine one is a **sacrificial neutraliser**, not a catalyst. The reaction's half-life is 2 ticks (~67 ms at 30 tps) — the fastest class of biochemical reaction in the game — so *any* Medicine one in the creature's bloodstream wipes out an equal mass of ATP Decoupler almost instantaneously.

Because both chemicals are consumed 1 : 1, a player dosing a poisoned creature has to match the cure to the infection:

- A creature with, say, 0.7 units of ATP Decoupler needs ~0.7 units of Medicine one to clear it. One full bottle of "ATP Decoupler Cure" delivers exactly 1.0 units of Medicine one, so one bottle handles any infection up to ~1.0 units and leaves a little Medicine one behind to catch any new exposure arriving shortly afterwards.
- The **General Cure** potion only delivers 0.15 units of Medicine one per bottle, alongside six other small medicinal doses. It is flagged as "extremely weak" in the Materia Medica and the help text explicitly says *"in the case of serious toxic poisonings that you use the stronger cure specific potions instead"*. At 0.15 units per bottle a seriously poisoned Norn would need 5+ General Cure bottles to match one ATP Decoupler Cure — consistent with the potion's design role as a catch-all prophylactic rather than an acute remedy.

Residual Medicine one after the cure is benign: it has its own passive half-life (slot 92 halfLife entry) and simply fades out of the bloodstream over time, so over-dosing with ATP Decoupler Cure is not dangerous in the stock genome. This is part of why the cure line for slot 78 is tuned so aggressively (HL 2 ticks, clean 1 : 1 stoichiometry): the designer could rely on over-shoot being harmless.

### Passive decay and why the cure matters

The passive half-life of ATP Decoupler is **1 370 ticks ≈ 46 s** ("Long", decay 0.99949). A creature that simply avoids further exposure will clear the toxin on its own within a couple of minutes. However:

- **Reaction 84 runs ~460× faster than passive decay** (HL 3 vs. HL 1 370). In the ~46 s it takes for the toxin to passively halve, it will have processed roughly 10 half-lives' worth of ATP destruction — a healthy Norn's entire ATP pool can be flipped to ADP dozens of times over before the decoupler has even halved its own concentration.
- **The antidote reaction runs ~685× faster than passive decay** (HL 2 vs. HL 1 370). Drinking ATP Decoupler Cure converts a "waiting for ATP to be rebuilt over minutes" recovery profile into a near-instantaneous clearance.

In practice this means passive decay is a near-useless defence: untreated ATP Decoupler exposure will drain the creature's energy reserves far faster than the toxin decays on its own. The Shee's design of a dedicated antidote is not cosmetic — it is functionally necessary to rescue a creature from a serious infection in any reasonable time.

### The Medical Pod and the detection threshold

The Medical Pod scanner (`medical scanner.cos`) lists ATP Decoupler in the battery of toxins it screens for:

```
doif chem 66 > 0.1 or chem 67 > 0.1 or chem 68 > 0.1 or chem 69 > 0.1 or chem 70 > 0.1
    or chem 75 > 0.1 or chem 78 > 0.1 or chem 82 > 0.15 or chem 83 > 0.15
    or chem 84 > 0.15 or chem 85 > 0.15 or chem 86 > 0.15 or chem 87 > 0.15
    or chem 88 > 0.15 or chem 89 > 0.15 or chem 30 < 0.5
```

The 0.1-unit trigger puts ATP Decoupler at the same "serious toxin" threshold as Heavy Metals, Cyanide, Belladonna, Geddonase, Glycotoxin and Histamine — a low bar, deliberately sensitive, because any of these chemicals in any measurable amount is bad news. When a player scans a suspect creature and the Pod reports "ATP Decoupler", the prescribed treatment is either the ATP Decoupler Cure (one bottle typically sufficient) or multiple General Cure bottles.

### Contrast with other classic toxins

The design space of the stock genome distinguishes ATP Decoupler from its sibling toxins along multiple axes:

| Chemical | Target | Consumes itself? | Antidote | Passive HL | Primary phenotype |
|----------|--------|------------------|----------|------------|-------------------|
| Heavy Metals (66) | Organs (chronic) | No | EDTA (Cure 95) | Very long | Slow, permanent organ damage |
| Cyanide (67) | Energy (catalytic) | No | Sodium thiosulphite (96) | Long | Rapid energy drain |
| Belladonna (68) | Nervous system | No | Magic Word (105) | Long | Neurological disarray |
| Geddonase (69) | Adipose (acute) | **Yes** | — (none) | Long | Rapid emaciation, energy spike, starvation crash |
| **ATP Decoupler (78)** | **ATP pool (catalytic)** | **No** | **Medicine one (92)** | **Long** | **Persistent exhaustion despite full larder** |

ATP Decoupler occupies a unique niche: it is catalytic (like Cyanide) but attacks a different axis of the metabolism — not the Energy pool directly, but the ATP currency that mints and redeems that pool. Where Cyanide destroys the battery's charge, ATP Decoupler short-circuits the charger. A creature with both toxins present simultaneously suffers compounding damage: Cyanide drains the Energy reserve while ATP Decoupler prevents the creature from regenerating it, making the combined poisoning dramatically harder to survive than either alone.

### Why Medicine one is the antidote (and "Medicine one" naming)

The curiously generic name "Medicine one" reflects the Shee's design aesthetic in the Materia Medica: medicines are numbered 1 through N in the order the Shee catalogued them, each paired with a specific toxin they can neutralise. Slot 92 is the first medicine (Medicine one) and pairs with ATP Decoupler; slot 93 is Medicine two (different pairing); and so on. The naming is therefore a systematic catalogue label, not a description — the reactive chemistry is the real identifier. Every "Medicine N" slot in the genome follows the same pattern: a passive chemical with a passive half-life that consumes its paired toxin 1 : 1 in a very-short-half-life reaction with no side products.

### Recovery profile

A creature treated promptly with ATP Decoupler Cure recovers quickly:

1. **Toxin clearance is near-instant.** Reaction 83's 2-tick half-life means Medicine one wipes out any ATP Decoupler in the bloodstream within ~20 ticks (less than a second) of arrival.
2. **ATP pool rebuilds at normal pace.** Once Reaction 84 has stopped, the creature's glycolytic flux (`Pyruvate + ADP → ATP + Lactate`, reaction 50) and β-oxidation pathway resume re-minting ATP from substrate at their normal rates. A cured creature will feel "tired" for a short while as the ATP pool recharges from its depleted state, but there is no permanent damage.
3. **No organ injury aftermath (unlike Heavy Metals).** ATP Decoupler does not wire into any `RLOCUS_INJURY` receptor or damage any organ directly. Once the toxin is gone, the creature's tissues are structurally intact.
4. **The reaction-rate suppression from receptor 59 releases immediately.** Because that receptor is driven linearly by ATP Decoupler concentration, clearing the toxin instantly restores the affected reaction's normal throughput. The "bloodstream regulation imbalance" described in the help text is fully reversible.

A creature left untreated does eventually clear the toxin via passive decay (~46 s) but will have had its ATP pool flipped to ADP many times over in the interim, resulting in severe Energy depletion. Recovery from an untreated but survived ATP Decoupler exposure is therefore dominated by rebuilding the Energy pool rather than repairing damage — feed the creature, let it sleep, wait for the Energy reserve to climb back toward normal.

### Thematic role

ATP Decoupler's design role in the toxin palette is "*the toxin that attacks effort itself*". Where Cyanide attacks the consumable fuel (Energy), Heavy Metals attack the infrastructure (organs), Belladonna attacks the controller (nervous system) and Geddonase attacks the strategic reserve (fat), ATP Decoupler attacks the **per-moment currency of action** — the instantaneous ability to *do* anything. A poisoned creature is well-stocked, structurally sound, neurologically intact and fat-rich; it simply cannot turn any of that into useful work, because every ATP it mints is immediately spent.

The Materia Medica's phrase "*can leave a Creature devoid of energy*" is a compact capture of this: the creature has plenty of fuel, but no spendable currency. The fact that the toxin is easily cured by a specific Medicine-one potion reflects the design intent that this is a **treatable mystery poison** rather than a catastrophe: a Norn behaving strangely listlessly despite being well-fed is a clue that something has de-phosphorylated the bloodstream, and the answer is the ATP Decoupler Cure bottle. In worlds using custom content that introduces novel diseases or stinging creatures, ATP Decoupler is the canonical "mysterious fatigue illness" chemical, and the matching cure is the canonical treatment.

## Summary

```
 Chemical 78 — ATP Decoupler  ("nasty toxin that breaks down ATP into ADP")
 --------------------------------------------------------------------------
 Producers:   NONE internally — external only (custom agents, diseases, CAOS)
 Consumers:   Reaction 84   (catalytic: 1× ATP + 1× Decoupler →
                             1× ADP + 1× Decoupler;  HL 3 ticks, "Very short")
              Reaction 83   (antidote: 1× Decoupler + 1× Medicine one →
                             nothing;  HL 2 ticks, "Very short")

 Receptors (1):
   - Reaction / Somatic / Locus 0  (gene 165)
       threshold 0, nominal 248, gain 239, flags REDUCE (invert)
       → suppresses a Somatic reaction rate almost to zero as the
         toxin rises — "imbalance in bloodstream regulation"

 Half-life:   1 370 ticks (~46 s at 30 tps, decay 0.99949 — "Long")

 Antidote:    Medicine one (92)
              - "ATP Decoupler Cure" potion (tag 2 25 4): injects 1.0 unit
              - "General Cure" potion (tag 2 25 19): injects 0.15 units
                alongside six other cure chemicals (weak, ~5× bottles needed)

 Medical Pod scanner threshold: chem 78 > 0.1

 Narrative role: The catalytic ATP thief. Does not attack the Energy pool
                 or any organ directly; instead, catalytically flips the
                 creature's ATP currency back to ADP faster than the
                 metabolism can regenerate it. Phenotype: a well-fed,
                 structurally sound, fat-rich creature that is nonetheless
                 persistently exhausted and eventually collapses from
                 derived Energy depletion. Fully curable by a dedicated
                 Medicine-one potion; recovery is rapid and leaves no
                 permanent damage.
```

ATP Decoupler completes the Shee Medicinal stock palette by modelling a real-world biochemical attack — uncoupling of oxidative phosphorylation — as a single catalytic reaction line. Combined with a dedicated antidote, a specific cure potion, a general-cure inclusion, and a Medical Pod scanner threshold, it is one of the most fully-integrated "classic cureable toxin" slots in the genome: everything the player needs to diagnose, treat and verify recovery is wired into the stock bootstrap content, making ATP Decoupler the canonical "mystery fatigue illness" chemical for custom content designers to target when building diseases and stinging creatures.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:98` — chemical descriptor slot 78 "ATP Decoupler" (empty description)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:130` — player-visible slot name "ATP Decoupler"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:95` — "ATP Decoupler Cure" potion help text: "*This potion contains a chemical which the Shee discovered was able to break down the nasty ATP decoupler toxin… breaks down ATP into ADP, causing imbalance in the regulation of the creature's bloodstream which in time can leave a Creature devoid of energy*"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:131` — "General Cure" potion lists ATP Decoupler as one of its six declared targets
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:341` — *Materia Medica* index listing of the toxin
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - Reaction 83 (gene 97): `1× ATP Decoupler [78] + 1× Medicine one [92] → nothing`, rate 7, half-life 2 ticks ("Very short")
  - Reaction 84 (gene 96): `1× ATP [35] + 1× ATP Decoupler [78] → 1× ADP [36] + 1× ATP Decoupler [78]`, rate 11, half-life 3 ticks ("Very short")
  - Receptor 59 (gene 165): Reaction organ / Somatic tissue / locus 0, ATP Decoupler, threshold 0, nominal 248, gain 239, flags REDUCE (invert)
  - Half-life entry: 1 370 ticks, decay rate 0.99949, "Long"
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:556` — `scrp 2 25 4 12`: "ATP Decoupler Cure" drink script, injects `CHEM 92 1` (Medicine one, 1.0 units)
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:642` — `scrp 2 25 19 12`: "General Cure" drink script, injects `CHEM 92 0.15` alongside six other cure chemicals at 0.15 and Adrenalin at 0.45
- `Rebuild/Assets/Bootstrap/001 World/medical scanner.cos:80` — Medical Pod "sick" scanner threshold `chem 78 > 0.1`, grouped with the classic toxin battery (66–70, 75, 82–89) and the oxygen-depletion check
- `Rebuild/DOCUMENTATION/chemicals/035 - ATP.md` — companion analysis of the ATP / ADP energy-currency cycle whose balance ATP Decoupler attacks
- `Rebuild/DOCUMENTATION/chemicals/069 - Geddonase.md` — companion analysis of a contrasting "no antidote, consumed by its own reaction" toxin, illustrating the distinct design patterns inside the classic-toxin quartet
- `Rebuild/DOCUMENTATION/chemicals/067 - Cyanide.md` — companion analysis of the parallel catalytic energy-destruction toxin slot, illustrating the "has an antidote" design pattern that ATP Decoupler also follows
