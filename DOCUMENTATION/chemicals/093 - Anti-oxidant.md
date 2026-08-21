# 093 - Anti-oxidant

Anti-oxidant is chemical slot 93 in the Creatures 3 biochemistry. The stock chemical-library descriptor at `Rebuild/Libraries/creatures-chemicals.js:117` reads "*Extract of arnica flower — cures glycotoxin poisoning*"; this is a **legacy C1/C2 description that no longer matches the Creatures 3 wiring**. In the stock Creatures 3 genome, Anti-oxidant is wired to a single purpose: it is the **sacrificial 1 : 1 neutraliser of Carbon monoxide (slot 79)**. The player-facing *Materia Medica* entry for its delivery potion, "**Antioxidant Syrup**" (potion class `2 25 5`), states: "*Antioxidant Syrup is the best way to stop the nasty effects of carbon monoxide poisoning… it is vital that a creature poisoned with carbon monoxide is treated quickly. Should you find a creature has carbon monoxide poisoning, make sure they drink some of this syrup.*" (*Materia Medica.catalogue:99–100*). Glycotoxin is cured by Sugar (99), not Anti-oxidant — the arnica/glycotoxin description is a fossil from an earlier game's chemistry table.

Anti-oxidant has **no endogenous production pathway** — no gene emits it, no reaction produces it, no starting endowment. A newborn Norn's Anti-oxidant concentration is 0 and it stays at 0 unless an external agent injects it. This places Anti-oxidant in the same "externally-administered medicine" family as the other "anti-toxin" cure chemicals (Medicine one 92, EDTA 95, Sodium thiosulphate 96, Arnica 97, Antihistamine 100), each of which is a pure pharmacological input rather than something the body makes. The canonical vectors are the **Antioxidant Syrup** potion (single-purpose cure: injects 1.0 units, potion class `2 25 5`) and the **General Cure** potion (broad-spectrum prophylactic: injects 0.15 units alongside six other cure chemicals at 0.15 and Adrenalin at 0.45, potion class `2 25 19`), both dispensed by the Medicine Maker. Once in the bloodstream, Anti-oxidant drives **Reaction 77** (`1× Anti-oxidant [93] + 1× Carbon monoxide [79] → (nothing)`, gene 100) with a half-life of just 6 ticks — "Very short", ~0.2 s at 30 tps — annihilating CO faster than CO can attack Oxygen (Reaction 78's HL is 19 ticks). Any Anti-oxidant not consumed by a CO molecule fades passively with a half-life of 1 370 ticks (~46 s, "Long" speed), so over-dosing is harmless.

Unusually for a cure chemical, Anti-oxidant **has no receptor of its own**. It is invisible to the creature's own wiring: no locus reads chem 93, no injury or pain receptor triggers on its presence or absence, and no secondary reaction uses it for anything except the CO annihilation in Reaction 77. Slot 93 in Creatures 3 is functionally a "single-purpose antidote token" — inject, react with CO, decay away.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter, no producing reaction, no starting endowment | — | — | Initial concentration is 0 for every newborn creature. The stock genome contains zero production mechanisms for chemical 93; any presence in the bloodstream is evidence of external administration (potion, CAOS script, custom content) |
| 2 | **Antioxidant Syrup potion** (dedicated CO cure) | Medicine Maker potion class `2 25 5` / script `scrp 2 25 5 12` (`medicine maker.cos:568`) | `chem 93 1` — inject 1.0 units when creature drinks one bottle | The primary in-game source. *Materia Medica* describes it as "*the best way to stop the nasty effects of carbon monoxide poisoning*". One bottle delivers exactly 1.0 units, enough to fully neutralise any reasonable CO dose up to ~1.0 units and leave residual Anti-oxidant circulating to handle ongoing exposure |
| 3 | **General Cure potion** (broad-spectrum prophylactic) | Medicine Maker potion class `2 25 19` / script `scrp 2 25 19 12` (`medicine maker.cos:642`) | `chem 93 .15` — inject 0.15 units alongside 0.15 units each of Medicine one (92), Prostaglandin (94), EDTA (95), Sodium thiosulphate (96), Arnica (97), Antihistamine (100), plus 0.45 Adrenalin (117) | The weak multi-target cure. 0.15 units of Anti-oxidant can only neutralise 0.15 units of CO per bottle; the *Materia Medica* explicitly warns "*in the case of serious toxic poisonings that you use the stronger cure specific potions instead*". A seriously CO-poisoned Norn would need 5+ General Cure bottles to match one Antioxidant Syrup |
| 4 | **CAOS injection** | — | `CHEM TARG 93 <amount>` from console, custom agents, or debug scripts | The standard way to introduce Anti-oxidant for testing, or the expected extension point for custom medicinal content that wants to deliver the CO antidote through non-potion vectors (e.g. herbal agents, medical room effects) |

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Stoichiometric CO neutralisation** | 100 | — | Reaction 77: `1× Anti-oxidant [93] + 1× Carbon monoxide [79] → (nothing)` | — | — | rate 18 (half-life **6 ticks**, "Very short") | — | The sole functional use of Anti-oxidant. One unit of Anti-oxidant destroys one unit of CO on a 1 : 1 basis; both reactants are annihilated and nothing is produced. Half-life 6 ticks ≈ 0.2 s at 30 tps, the fastest speed class in the CO/cure interaction — more than three times faster than Reaction 78's CO/Oxygen destruction (HL 19), so once Anti-oxidant reaches the bloodstream it outraces CO's attack on the oxygen pool and wipes the toxin out within a handful of frames |
| 2 | **No receptor wiring** | — | — | — | — | — | — | — | No receptor in the stock genome reads from chem 93. Anti-oxidant has no direct phenotypic effect — it does not trigger pain relief, a cure/well-being signal, a digestive effect, or any locus modulation. Its entire biological role is consumption in Reaction 77 |
| 3 | **No secondary reactions** | — | — | — | — | — | — | — | Anti-oxidant is not a substrate for any other reaction in the stock genome. Slot 93 is single-purpose: the only consumer is Reaction 77 (CO neutralisation) |
| 4 | **Passive decay** | — | — | Half-life **1 370 ticks** ("Long", decay rate 0.99949) | — | — | — | Background clearance of residual Anti-oxidant that was not consumed by CO. ~46 s at 30 tps — much slower than the reaction half-life, so un-consumed Anti-oxidant lingers for about a minute after a cure dose, giving ongoing protection against a still-active CO source. Over-dosing with Antioxidant Syrup is benign because un-reacted Anti-oxidant simply fades away |

The potions delivering Anti-oxidant, side by side:

| Potion | Tag | Script | Anti-oxidant delivered | Other ingredients |
|--------|-----|--------|------------------------|-------------------|
| **Antioxidant Syrup** | `Agent Help 2 25 5` | `scrp 2 25 5 12` (`medicine maker.cos:568`) | `CHEM 93 1` (1.0 units) | None — single-purpose |
| **General Cure** | `Agent Help 2 25 19` | `scrp 2 25 19 12` (`medicine maker.cos:642`) | `CHEM 93 0.15` (0.15 units) | `CHEM 100 0.15` Antihistamine, `CHEM 97 0.15` Arnica, `CHEM 95 0.15` EDTA, `CHEM 92 0.15` Medicine one, `CHEM 96 0.15` Sodium thiosulphate, `CHEM 94 0.15` Prostaglandin, `CHEM 117 0.45` Adrenalin |

## Role in Game Mechanics

### The single-purpose antidote

Anti-oxidant's entire wiring in the stock genome consists of one reaction and nothing else:

```
 1× Anti-oxidant [93]  +  1× Carbon monoxide [79]   →   (nothing)
```

Gene 100, rate 18, half-life 6 ticks ("Very short"). Both reactants are consumed 1 : 1 and nothing is produced. Anti-oxidant is a **sacrificial neutraliser** — every molecule destroys exactly one molecule of CO and then disappears from the bloodstream. This makes the accounting simple and intuitive: the amount of CO that can be cleared from a creature is capped at the amount of Anti-oxidant administered.

The half-life ordering in the CO sub-system is the critical design decision:

- **Reaction 77** (Anti-oxidant + CO): half-life **6 ticks** ("Very short")
- **Reaction 78** (CO + Oxygen): half-life **19 ticks** ("Short")
- **Passive CO decay**: half-life **1 370 ticks** ("Long")
- **Passive Anti-oxidant decay**: half-life **1 370 ticks** ("Long")

Reaction 77 is roughly **3× faster** than Reaction 78 and ~**228× faster** than the passive decays. Once Anti-oxidant arrives in a CO-poisoned bloodstream, it outcompetes the CO-attacks-oxygen reaction for the available CO. Within ~20–30 ticks (~1 s) most of the CO is gone, and the creature's Oxygen pool — which the lungs are continuously replenishing — climbs back over the hypoxia receptor's ~0.6 threshold. The DIGITAL hypoxia receptor snaps from "off" back to "on" in a single tick, aerobic glycolysis resumes, and the creature is essentially out of danger.

### Why Anti-oxidant has no receptor of its own

A striking feature of slot 93's design is the **complete absence of receptor wiring**. Unlike most cure chemicals — where the body reads the cure's presence as a positive signal (Pain Killer hits pain-relief loci, Hormone potions drive drive-specific loci, etc.) — Anti-oxidant drives nothing. The creature has no biochemical "sense" that it has been cured of CO; the only observable effect of Anti-oxidant is the indirect one that CO disappears, which restores the Oxygen pool, which un-snaps the hypoxia receptor, which un-blocks aerobic metabolism.

This is consistent with Carbon monoxide's own design: CO also has no dedicated receptor and expresses its damage entirely through the Oxygen channel (see `079 - Carbon monoxide.md`). Both toxin and antidote are **biochemically invisible** to the creature — only the downstream Oxygen pool is read. The genome saves two receptor slots this way while still producing a believable, bidirectional toxin/cure dynamic.

The consequence for the Medical Pod's diagnostic scanner (`medical scanner.cos:80`) is that neither CO (79) nor Anti-oxidant (93) appears in its threshold battery; the scanner watches `chem 30 < 0.5` (low Oxygen) to catch the downstream symptom of CO poisoning. After the Antioxidant Syrup cure, the scanner will simply stop reporting low oxygen as the lungs refill the pool, without any direct signal that the cure itself arrived.

### The stoichiometric dosing model

Because both CO (stoichiometric, Reaction 78) and Anti-oxidant (stoichiometric, Reaction 77) are consumed 1 : 1 by their reactions, the cure arithmetic is simple:

- **X units of CO** require **X units of Anti-oxidant** to fully clear, minus whatever CO has already self-destroyed by reacting with Oxygen
- **Antioxidant Syrup delivers 1.0 units**, enough to handle any CO dose up to ~1.0 units in a single bottle
- **General Cure delivers 0.15 units**, enough to handle only ~0.15 units of CO

Small over-dose is harmless — the un-reacted Anti-oxidant passively decays over ~46 s and provides a short "protective buffer" during which any new CO entering the bloodstream (e.g. from a still-active bacterial source or a polluted room the creature is still standing in) will be neutralised on contact. This is a subtle but important design feature: a single bottle of Antioxidant Syrup does not just cure the current load, it provides about a minute of residual immunity while the creature is moved away from the source.

Under-dose leaves a proportional amount of CO still in circulation — the General Cure's 0.15 units against a 1.0-unit CO load would clear 15% of the toxin, leaving the remaining 0.85 units to continue attacking oxygen. The *Materia Medica* guidance ("*in the case of serious toxic poisonings that you use the stronger cure specific potions instead*") points the player at the dedicated Antioxidant Syrup when CO is confirmed or strongly suspected.

### Speed as the critical design parameter

The "Very short" half-life (6 ticks, rate 18) for Reaction 77 is not incidental. CO is a fast-acting toxin (Reaction 78 at HL 19 ticks can drain the whole Oxygen pool within a second or two at significant doses), and the *Materia Medica* warns it can "*suffocate the creature in only a few minutes*". If the cure reaction ran at the same speed as the toxin's attack, the race between "CO destroys Oxygen" and "Anti-oxidant destroys CO" would be evenly matched and the creature's oxygen pool might be severely depleted by the time the cure finished.

By setting Anti-oxidant's reaction 3× faster than CO's attack, the Shee guarantee that once the cure reaches the bloodstream, CO is gone before it can do more than a fraction of additional damage. The Oxygen pool may have been reduced during the period before the cure arrived, but from the moment the creature drinks the potion, further damage stops essentially instantly. The 1–2 seconds it then takes for the lungs to refill the Oxygen pool past the hypoxia threshold are spent with no active toxin in circulation.

### The legacy library descriptor — arnica and glycotoxin

The stock chemical-library descriptor for slot 93 reads "*Extract of arnica flower — cures glycotoxin poisoning*". This is **inconsistent with the Creatures 3 wiring**:

- **Arnica** is slot **97** in C3, not slot 93. The dedicated "Arnica" slot in C3's *Materia Medica* index (line 363) is chemical 97. Reaction 70 (gene 108) consumes it to convert `Wounded [90]` to `(nothing)` — arnica's role in C3 is healing wounds, not curing poisons.
- **Glycotoxin** (slot 70) is cured by **Sugar** (slot 99) in C3 via Reaction 65 (gene 85) `1× Sugar + 1× Glycotoxin → 3× Glucose + 1× Sugar`. Not by Anti-oxidant.

The library descriptor is most plausibly a fossil from earlier Creatures titles (C1/C2) whose chemistry tables used different slot assignments, and was not refreshed when the C3 stock genome was authored. The authoritative in-game source for slot 93's role is the *Materia Medica* entry (line 99–100) + the reaction wiring in the stock genome, both of which consistently identify it as the CO antidote. The *Materia Medica* index (line 360) also lists it simply as "Antioxidant", with no mention of arnica or glycotoxin.

### The structural pattern among cure chemicals

Anti-oxidant fits into a consistent design pattern visible across all the stock genome's "anti-toxin" cure chemicals:

| Cure chemical | Slot | Target toxin | Dedicated potion | General Cure inclusion |
|---------------|------|--------------|------------------|------------------------|
| Medicine one | 92 | ATP Decoupler (78) | Energy Booster | 0.15 units |
| **Anti-oxidant** | **93** | **Carbon monoxide (79)** | **Antioxidant Syrup** | **0.15 units** |
| Prostaglandin | 94 | Histamine A (80), Histamine B (81) | Pain Relief / Anti-histamine | 0.15 units |
| EDTA | 95 | Heavy Metals (66) | Detoxicator | 0.15 units |
| Sodium thiosulphate | 96 | Cyanide (67) | Cyanide Cure | 0.15 units |
| Arnica | 97 | Wounded (90) | Bruise Cure | not included |
| Antihistamine | 100 | Antigens 0–7 (82–89) | Anti-histamine | 0.15 units |

Every entry follows the same architecture: no endogenous production, a dedicated 1 : 1 reaction consuming one unit of cure + one unit of toxin → nothing, no own receptor, delivery by a single-purpose potion + inclusion in the General Cure at 0.15 units. Anti-oxidant is the CO-specific instance of this pattern.

### Contrast with broader "anti-" chemicals

A name-similar chemical is **Antihistamine** (100), which cures the immune-response Antigen chemicals (82–89) via a different reaction wiring. The two are unrelated in function — Antigens drive immune and histamine responses (slots 80, 81); CO drives nothing directly but destroys Oxygen. The General Cure bundles both (0.15 units of each) because both are common poisoning vectors and a general-purpose sick Norn may have any combination.

### Recovery trajectory under Anti-oxidant treatment

A CO-poisoned creature that drinks Antioxidant Syrup follows this recovery profile:

1. **Ingestion + injection.** The drink script (`scrp 2 25 5 12`) fires on consumption: `chem 93 1` injects 1.0 units of Anti-oxidant into the bloodstream.
2. **Reaction 77 fires** at HL 6 ticks. If CO is present at any concentration, Anti-oxidant and CO are annihilated 1 : 1. Within ~20 ticks (< 1 s) essentially all CO is gone, up to the 1.0-unit dose capacity of the cure.
3. **CO attack on Oxygen stops.** Reaction 78 (CO + O₂ → nothing) starves of its CO reactant and ceases contributing to oxygen destruction.
4. **Lungs refill the Oxygen pool.** Normal breathing continues to inject O₂. The pool climbs back over the hypoxia receptor's threshold (153/255 ≈ 0.6) within seconds.
5. **Hypoxia receptor snaps back on.** The DIGITAL receptor 78 on chem 30 restores its nominal contribution to the Reaction organ's Somatic locus-0 rate, un-blocking the aerobic metabolism that had been locked down.
6. **Aerobic glycolysis resumes.** Reaction 49 (`Glucose + Oxygen → Pyruvate`) restarts; Pyruvate → ATP regeneration follows; Lactate that accumulated during the anaerobic-only interval fades on its own schedule.
7. **No organ damage to heal.** CO does not wire into any injury receptor; the creature is structurally intact and needs only normal feeding and rest to rebuild any energy drained during the poisoning episode.
8. **Residual Anti-oxidant fades.** Any un-consumed Anti-oxidant passively decays with HL 1 370 ticks (~46 s). During this window the creature is immune to small new CO doses (each such dose is immediately consumed by the residual cure).

The *Materia Medica*'s practical advice ("*make sure they drink some of this syrup. After that, keep the creature well fed and rested*") captures this exactly: the potion restores the biochemistry; the player keeps the creature fed (rebuilds Glucose / Energy after the anaerobic interval) and rested (Lactate clears, Tiredness abates).

### Design philosophy — a transparent antidote

Anti-oxidant exemplifies a clean, minimal "antidote" design:

- **One source** — the Antioxidant Syrup potion (and the weaker General Cure).
- **One reaction** — 1 : 1 annihilation with Carbon monoxide.
- **No receptor** — no direct phenotypic read of the cure itself.
- **Fast kinetics** — reaction half-life 3× faster than the toxin it counters, guaranteeing the cure always wins.
- **Passive decay tail** — benign over-dosing, short residual immunity window.

The result is a chemical whose semantics the player can fully grasp from its *Materia Medica* entry ("drink this to cure CO") without needing to understand the underlying stoichiometry, while the underlying stoichiometry is clean and debuggable for anyone inspecting the bloodstream via CAOS or the Science Kit. The legacy library descriptor's mention of arnica and glycotoxin is the only incongruity, and it is invisible in normal gameplay — the authoritative source for the player is the *Materia Medica* entry, which correctly identifies the cure.

## Summary

```
 Chemical 93 — Anti-oxidant  (the CO antidote)
 --------------------------------------------------------------------------
 Producers:   NONE internally — external only.
              Primary vector: "Antioxidant Syrup" potion (scrp 2 25 5 12)
                 → CHEM 93 1 (1.0 units per bottle)
              Secondary vector: "General Cure" potion (scrp 2 25 19 12)
                 → CHEM 93 0.15 (bundled with six other cure chemicals)
              CAOS/custom: CHEM TARG 93 <amount>
 Consumers:   Reaction 77   (antidote: 1× Anti-oxidant + 1× Carbon monoxide
                              → nothing; HL 6 ticks, "Very short",
                              stoichiometric 1 : 1 annihilation)

 Receptors (0):
   - NONE. Anti-oxidant drives no locus, triggers no injury/pain signal,
     and has no secondary reactions. Its sole biological role is
     consumption in Reaction 77.

 Half-life:   1 370 ticks (~46 s at 30 tps, decay 0.99949 — "Long")

 Role: Single-purpose sacrificial neutraliser of Carbon monoxide (79).
       One Anti-oxidant molecule destroys exactly one CO molecule and
       itself. Reaction 77's 6-tick half-life is ~3× faster than CO's
       attack on Oxygen (Reaction 78, HL 19), guaranteeing the cure
       outruns the toxin once it reaches the bloodstream. Creature
       recovers to normal within ~1 s as the lungs refill the Oxygen
       pool past the hypoxia threshold.

 Legacy library descriptor:
   - creatures-chemicals.js:117 says "Extract of arnica flower — cures
     glycotoxin poisoning". This is a C1/C2 fossil description. In C3
     arnica is slot 97 (wound cure), glycotoxin (70) is cured by Sugar
     (99), and slot 93 is exclusively the CO antidote. The authoritative
     in-game source is the Materia Medica entry at line 99–100.

 Medical Pod scanner threshold: NOT listed (chem 93 does not appear in
                                medical scanner.cos:80). Neither toxin
                                (CO 79) nor its cure is directly scanned;
                                the scanner watches chem 30 < 0.5
                                (low Oxygen) to catch CO's downstream
                                effect, and the cure's success is
                                observed indirectly as the alert clears.

 Narrative role: The dedicated CO antidote. Clean, transparent design:
                 one source (potion), one reaction (1:1 with CO), one
                 half-life (fast, 6 ticks), no receptor noise. The Shee's
                 solution to the "silent oxygen thief" is a silent
                 cure — a chemical the creature cannot feel, whose only
                 evidence of action is that CO is gone.
```

Anti-oxidant completes the treatment side of the Carbon monoxide poisoning system: a stoichiometrically consumed, reaction-only, receptor-free cure chemical delivered almost exclusively by the Antioxidant Syrup potion (with a token 0.15-unit inclusion in the General Cure). Its fast reaction half-life guarantees it wins the race against CO's attack on the Oxygen pool; its passive decay tail gives a minute of residual protection after a bottle; and its absence of receptor wiring keeps the creature's biochemistry minimal — only the downstream Oxygen pool carries the phenotypic signal of both the poisoning and its cure.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:117` — chemical descriptor slot 93 "Anti-oxidant" (*note: the text "Extract of arnica flower — cures glycotoxin poisoning" is a legacy C1/C2 description and does NOT match C3 wiring*)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:149` — player-visible slot name "Anti-oxidant"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:99–100` — "Antioxidant Syrup" potion help text: "*Antioxidant Syrup is the best way to stop the nasty effects of carbon monoxide poisoning… it is vital that a creature poisoned with carbon monoxide is treated quickly. Should you find a creature has carbon monoxide poisoning, make sure they drink some of this syrup. After that, keep the creature well fed and rested.*"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:360` — *Materia Medica* index listing "Antioxidant" (slot 93)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - Reaction 77 (gene 100): `1× Anti-oxidant [93] + 1× Carbon monoxide [79] → nothing`, rate 18, half-life 6 ticks ("Very short")
  - Half-life entry (slot 93): 1 370 ticks, decay rate 0.99949, "Long"
  - No emitter, no receptor, no other reaction references chem 93
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:568–578` — `scrp 2 25 5 12`: "Antioxidant Syrup" drink script, injects `chem 93 1` (1.0 units)
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:642–658` — `scrp 2 25 19 12`: "General Cure" drink script, injects `chem 93 .15` alongside six other cure chemicals at 0.15 and Adrenalin at 0.45
- `Rebuild/Assets/Bootstrap/001 World/medical scanner.cos:80` — Medical Pod "sick" scanner threshold battery; chem 93 is NOT in the list (neither CO nor its cure is directly scanned; downstream low-Oxygen signal is the diagnostic target)
- `Rebuild/DOCUMENTATION/chemicals/079 - Carbon monoxide.md` — companion analysis of the toxin that Anti-oxidant cures, including the CO/Oxygen destruction reaction and the DIGITAL hypoxia receptor downstream of both chemicals
- `Rebuild/DOCUMENTATION/chemicals/030 - Oxygen.md` — companion analysis of the Oxygen pool whose restoration is the observable consequence of a successful Anti-oxidant cure
