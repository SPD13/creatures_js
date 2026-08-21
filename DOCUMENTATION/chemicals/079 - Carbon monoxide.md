# 079 - Carbon monoxide

Carbon monoxide is chemical slot 79 in the Creatures 3 biochemistry. The chemical library descriptor is empty, but the *Materia Medica* entry for the **Antioxidant Syrup** potion gives the in-fiction description: "*carbon monoxide… breaks down oxygen in the bloodstream of the creature which can suffocate the creature in only a few minutes! Therefore it is vital that a creature poisoned with carbon monoxide is treated quickly.*" The name is taken directly from real-world chemistry — CO is the classic hypoxia toxin that binds haemoglobin and prevents oxygen transport — but the in-game model is a much simpler one-line abstraction: a single 1 : 1 reaction in the bloodstream that annihilates Oxygen (slot 30) whenever CO is present. Both molecules are destroyed together; neither is regenerated. Carbon monoxide is therefore a **stoichiometric oxygen-sink toxin** — it cannot keep working indefinitely like ATP Decoupler's catalyst, but each molecule reliably removes one unit of oxygen from the creature's blood before it too disappears.

Because the whole aerobic side of the metabolism — Reaction 49 `Glucose + Oxygen → Pyruvate` (glycolysis' oxygen-consuming branch), fat oxidation, and anything downstream that reads bloodstream O₂ — depends on Oxygen (30) being kept topped up by breathing, draining it directly out of the bloodstream is equivalent to *suffocating the creature from the inside*. The receptor on chemical 30 at the Reaction organ's locus 0 (receptor 78, genome 150) is a REDUCE + DIGITAL invert receptor with threshold 153 and nominal 223: when Oxygen falls below ~0.6 it snaps the whole Reaction organ's Somatic reaction-rate locus down to zero all at once. CO's action is deliberately channelled through this existing hypoxia pathway: CO does not need its own dedicated receptor wiring, because it hijacks the creature's own low-oxygen emergency signal. The phenotype is a Norn that suddenly acts as if it were drowning, stranded on the ceiling, or otherwise asphyxiating — panting, weak, reactions slowed — while visibly still in a normal atmosphere.

Unlike most metabolites, Carbon monoxide has **no endogenous production pathway**. No gene emits it, no reaction produces it, no stock in-world food or chemical source injects it; a newborn Norn's CO concentration is 0, and it stays at 0 unless something external puts it there. This places it squarely in the "purely external toxin" family alongside Heavy Metals (66), Cyanide (67), Belladonna (68), Geddonase (69), Glycotoxin (70) and ATP Decoupler (78). The *Materia Medica* text explicitly names the expected vector: "*Certain bacteria have been known to poison a Creature with carbon monoxide.*" The dedicated cure is **Antioxidant Syrup**, which injects Anti-oxidant (chemical 93); Reaction 77 consumes CO and Anti-oxidant together 1 : 1 with a 6-tick half-life, so drinking one bottle wipes out any reasonable CO load within a few frames. Carbon monoxide is also one of the seven toxins declared as targets of the weak "General Cure" potion. Residual CO left untreated fades with a long passive half-life (1 370 ticks, "Long", decay 0.99949 ≈ 46 s at 30 tps), but Reaction 78's oxygen-destruction is much faster than passive decay, so a significant CO load will drain a creature's oxygen several times over before the toxin is gone on its own.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter, no producing reaction, no starting endowment | — | — | Initial concentration is 0 for every newborn creature. The genome contains zero production mechanisms for chemical 79; any presence in the bloodstream is evidence of external exposure |
| 2 | **Bacterial poisoning (canonical in-fiction vector)** | Disease / bacteria `.agents` or `.cos` files | Scripts that `CHEM TARG 79 <amount>` on infection tick or sting contact | The *Materia Medica* explicitly names bacteria as the canonical source of CO poisoning ("*Certain bacteria have been known to poison a Creature with carbon monoxide*"). No stock-game bacteria in the main 001 World bootstrap actually inject chem 79, but the design intent is that custom bacterial content would be the primary in-world vector |
| 3 | **Environmental hazards / custom content** | User-made `.agents` / `.cos` files | Gases, exhaust-pipe agents, smoky rooms that `CHEM TARG 79 <amount>` on proximity | Fits the real-world thematic — CO as a combustion by-product — for custom worlds that want to model smoke, fumes or industrial pollution as a creature health hazard. The 46 s passive half-life means a creature can walk away from a CO source and slowly recover as it leaves the polluted area |
| 4 | **CAOS injection** | — | `CHEM TARG 79 <amount>` from console or scripts | The standard way to produce Carbon monoxide for testing, debugging the Antioxidant Syrup, or verifying the interaction between CO and the Oxygen receptor's DIGITAL snap-to-zero behaviour |

Carbon monoxide therefore shares the structural profile of ATP Decoupler and Geddonase — the body is a pure *consumer*, never a producer — but the stock game includes a fully wired cure system for it (Anti-oxidant reaction, dedicated potion, explicit listing in General Cure), marking it as a "classic cureable toxin" in the Shee Medicinal system.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Stoichiometric oxygen destruction** | 95 | — | Reaction 78: `1× Carbon monoxide [79] + 1× Oxygen [30] → (nothing)` | — | — | rate 30 (half-life **19 ticks**, "Short") | — | The core toxicity mechanism. One unit of CO annihilates one unit of dissolved Oxygen in the bloodstream; both reactants are consumed and nothing is produced. At rate 30 the reaction has a half-life of ~19 ticks ≈ 0.63 s at 30 tps, so CO strips oxygen out of the blood several times faster than the lungs can replenish it via breathing. Unlike ATP Decoupler (slot 78) this is **not** a catalytic reaction — each CO molecule annihilates exactly one oxygen and then disappears, giving the toxin a finite "damage budget" proportional to its dose |
| 2 | **Antidote reaction** | 100 | — | Reaction 77: `1× Anti-oxidant [93] + 1× Carbon monoxide [79] → (nothing)` | — | — | rate 18 (half-life **6 ticks**, "Very short") | — | The cure. One unit of Anti-oxidant (from the "Antioxidant Syrup" potion) eliminates one unit of CO on a 1 : 1 basis. Half-life 6 ticks ≈ 0.2 s at 30 tps — more than three times faster than the CO/Oxygen reaction, so any Anti-oxidant in the bloodstream outraces CO's attack on the oxygen pool and wipes the toxin out within a handful of frames |
| 3 | **No dedicated CO receptor** | — | — | — | — | — | — | — | Chemical 79 does not drive any receptor in the stock genome. Its phenotypic effect is expressed entirely through the indirect pathway of destroying the Oxygen pool and letting the existing hypoxia receptor (Receptor 78 on chemical 30, Reaction / Somatic / Locus 0, threshold 153, nominal 223, gain 18, flags REDUCE + DIGITAL) snap to "all off" when blood O₂ falls past its trigger. CO is deliberately invisible to the creature's own biochemistry except through the oxygen channel |
| 4 | **Passive decay** | — | — | Half-life **1 370 ticks** ("Long", decay rate 0.99949) | — | — | — | Background clearance of any residual CO without cure. ~46 seconds at 30 tps — long enough that a creature simply waiting out a significant CO dose will have most of its oxygen pool destroyed several times over in the interim, since Reaction 78 (HL 19) operates ~72× faster than passive decay. Passive decay becomes the dominant clearance only once the CO dose has run out of oxygen to attack |

The **cure** line-up in the stock game is:

| Potion | Tag | Injects | Reaction consuming CO |
|--------|-----|---------|-------------------------|
| **Antioxidant Syrup** | `Agent Help 2 25 5` / `scrp 2 25 5 12` | `CHEM 93 1` (Anti-oxidant, 1.0 units) | Reaction 77 (HL 6 ticks, 1 : 1 neutralisation) |
| **General Cure** | `Agent Help 2 25 19` / `scrp 2 25 19 12` | `CHEM 93 0.15` (Anti-oxidant, 0.15 units) alongside six other cure chemicals at 0.15 each plus `CHEM 117 0.45` Adrenalin | Reaction 77 (HL 6 ticks, 1 : 1 neutralisation, but only 0.15 units per bottle) |

Note: unlike the other classic toxins (Heavy Metals, Cyanide, Belladonna, Geddonase, Glycotoxin, Alcohol and ATP Decoupler), **Carbon monoxide is NOT listed in the Medical Pod's "Creature is sick" scanner threshold** (`medical scanner.cos:80`). The scanner does however flag `chem 30 < 0.5` — low Oxygen — which is the downstream signature CO leaves behind. A CO-poisoned creature is therefore detected by the *consequence* (hypoxia) rather than the cause (CO presence directly), and the player may need to infer CO specifically from the context (custom bacteria, polluted room) rather than a direct chemical readout from the Pod.

## Role in Game Mechanics

### The stoichiometric Oxygen destruction

Reaction 78 is the defining mechanic of Carbon monoxide:

```
 1× Carbon monoxide [79]  +  1× Oxygen [30]   →   (nothing)
```

Both reactants are consumed 1 : 1 and nothing is produced. This classes CO as a **stoichiometric annihilator** of the oxygen pool — fundamentally different from ATP Decoupler's self-regenerating catalyst design. Every molecule of CO destroys exactly one molecule of Oxygen and then disappears from the bloodstream, so the total damage CO can inflict is capped at its dose: 1.0 units of CO can destroy at most 1.0 units of O₂ before the toxin is exhausted.

At genome value 30 the reaction half-life is **19 ticks ≈ 0.63 s** at 30 tps. In practical terms this means:

- **Oxygen disappears faster than breathing can replenish it.** The creature's Breathing organ injects Oxygen into the bloodstream through the lung-chemistry reactions, but at CO doses above ~0.5 units the rate at which CO strips oxygen out vastly exceeds normal inhalation flux. Within a second or two of a significant exposure, `chem 30` collapses toward zero.
- **The hypoxia digital receptor snaps to "off".** Receptor 78 (chemical 30, organ 3 "Reaction", tissue 0 "Somatic", locus 0, threshold 153, nominal 223, gain 18, flags 3 = REDUCE + DIGITAL) is an all-or-nothing switch: while oxygen is above its threshold it contributes a moderate baseline to the Somatic locus-0 reaction rate; below threshold the DIGITAL flag causes it to **snap** rather than fade, cutting the contribution to zero all at once. A CO-poisoned creature's Reaction organ goes from "running normally" to "partially shut down" in a single tick the moment Oxygen crosses the 0.6-ish line.
- **The aerobic glycolytic branch starves.** Reaction 49 (`Glucose + Oxygen → Pyruvate`) is the primary aerobic route from Glucose to Pyruvate. With oxygen gone, this reaction's flux drops to zero and the anaerobic branch (Reaction 48, `Glucose → 2× Pyruvate + Lactate`) has to carry the load. The anaerobic branch produces Lactate, a *tiredness* signal chemical — so a CO-poisoned Norn accumulates Lactate rapidly on top of losing oxygen, compounding the fatigue phenotype.
- **Energy regeneration falters.** The ATP ↔ ADP cycle is fed by Pyruvate + ADP in Reaction 50; with Pyruvate still being produced (from the anaerobic branch) but Oxygen gone, the aerobic regeneration of fatty-acid-derived energy halts. The creature quickly enters a state functionally equivalent to being under water: anaerobic-only metabolism, rising Lactate, falling ATP, and a DIGITAL-snapped Reaction organ locking down the whole Somatic reaction rate.

### The indirect hypoxia channel — why CO has no receptor of its own

One of the striking design choices in chemical 79's wiring is that **Carbon monoxide drives no receptor**. None of the 256 receptor slots in the stock genome reads from `chem 79`. All of CO's phenotypic effect is expressed through the indirect route of destroying Oxygen and letting the existing O₂ receptor react to the resulting hypoxia.

This is elegant for two reasons:

1. **Cause-and-consequence symmetry.** In the real world, CO poisoning is itself a form of hypoxia — CO binds haemoglobin and blocks oxygen transport, so the creature dies of low oxygen rather than of CO directly. The Creatures model captures this by routing CO's damage through the low-oxygen receptor rather than giving CO its own injury pathway. A creature poisoned with CO and a creature suffocating in a low-oxygen room look biochemically identical from the Reaction organ's perspective — both have `chem 30 < threshold` and both get the DIGITAL snap-to-zero.
2. **Economy of genome slots.** CO does not need a dedicated injury or reduce receptor, a dedicated pain signal, a dedicated alarm chemical. The existing Oxygen receptor is doing all the work. This frees up receptor/chemical slots for other toxins that need finer-grained wiring (Belladonna's nervous-system effects, Heavy Metals' chronic organ damage).

The trade-off is that CO becomes invisible to any diagnostic system that watches chemicals directly — which is exactly why the Medical Pod scanner does **not** list chem 79 alongside the other toxins at its 0.1-unit threshold. Instead the scanner watches `chem 30 < 0.5` and raises a generic "low oxygen / suffocating" alert, relying on the player or Materia Medica to interpret the symptom.

### The antidote: Anti-oxidant and "Antioxidant Syrup"

The *Materia Medica* entry for the Antioxidant Syrup describes it as "*the best way to stop the nasty effects of carbon monoxide poisoning*". The active ingredient is **Anti-oxidant** (slot 93). The Medicine Maker dispenses the cure as potion class `2 25 5`; when a creature drinks one, the script `scrp 2 25 5 12` injects `CHEM 93 1` (1.0 units of Anti-oxidant) into the bloodstream. Reaction 77 then runs in the body:

```
 1× Anti-oxidant [93]  +  1× Carbon monoxide [79]   →   (nothing)
```

Both reactants are consumed 1 : 1 and nothing is produced; Anti-oxidant is a **sacrificial neutraliser**, not a catalyst. The reaction's half-life is 6 ticks (~0.2 s at 30 tps), more than three times faster than Reaction 78's oxygen-destruction rate (HL 19 ticks). This half-life ordering is the critical design decision: it guarantees that once the cure enters the bloodstream, CO is neutralised faster than it can keep attacking oxygen. The short window during which CO has already started draining O₂ but the cure has arrived resolves in favour of the cure.

Because both chemicals are consumed 1 : 1, a player dosing a poisoned creature has to match the cure to the infection:

- A creature with, say, 0.7 units of CO needs ~0.7 units of Anti-oxidant to clear it. One full bottle of Antioxidant Syrup delivers exactly 1.0 units, so one bottle handles any infection up to ~1.0 units and leaves a little Anti-oxidant behind to mop up ongoing exposure (useful if the creature is still standing in the polluted area or carrying an active bacterial infection).
- The **General Cure** potion only delivers 0.15 units of Anti-oxidant per bottle, alongside six other small medicinal doses. It is flagged as "extremely weak" in the Materia Medica and the help text explicitly says *"in the case of serious toxic poisonings that you use the stronger cure specific potions instead"*. At 0.15 units per bottle, a seriously CO-poisoned Norn would need 5+ General Cure bottles to match one Antioxidant Syrup — consistent with the potion's design role as a catch-all prophylactic rather than an acute remedy for something as urgent as "*suffocate the creature in only a few minutes*".

Residual Anti-oxidant after the cure is benign: it has its own passive half-life (slot 93 entry) and fades out of the bloodstream over time, so over-dosing with Antioxidant Syrup is not dangerous in the stock genome.

### Passive decay and the "few minutes" time pressure

The passive half-life of CO is **1 370 ticks ≈ 46 s** ("Long", decay 0.99949). A creature that simply avoids further exposure will clear the toxin within a couple of minutes even without any cure. However:

- **Reaction 78 runs ~72× faster than passive decay** (HL 19 vs. HL 1 370). In the ~46 s it takes for the toxin to passively halve, each CO molecule that is still present will have had dozens of chances to destroy an oxygen molecule (until the CO molecules stoichiometrically run out). A 1.0-unit CO dose left untreated will strip the oxygen pool to near-zero for most of its ~1.5-minute lifetime, and the DIGITAL hypoxia receptor will hold the creature's Reaction organ snapped off for most of that time.
- **The antidote reaction runs ~228× faster than passive decay** (HL 6 vs. HL 1 370). Drinking Antioxidant Syrup converts a "suffocate for a minute and a half" recovery profile into a near-instantaneous clearance that lets breathing restore the oxygen pool within a few more seconds.

The *Materia Medica*'s "*suffocate the creature in only a few minutes*" language is not hyperbole: an untreated 1.0-unit CO dose functionally removes the creature's ability to use oxygen for the time it takes the CO to decay plus the time it takes breathing to rebuild `chem 30` back past the hypoxia threshold. A creature without the Antioxidant Syrup handy that cannot shake the infection (e.g. still parked next to the CO-emitting bacterium) will eventually die of derived starvation as its ATP / Energy pools collapse without aerobic regeneration.

### The absence from the Medical Pod's toxin scanner — a diagnostic gap

Every other "classic cureable toxin" slot in the stock genome (66 Heavy Metals, 67 Cyanide, 68 Belladonna, 69 Geddonase, 70 Glycotoxin, 75 Alcohol, 78 ATP Decoupler, 82–89 Histamines/Antigens) is explicitly named in the Medical Pod scanner's sick-threshold list at `medical scanner.cos:80`. CO (79) is conspicuously absent. The scanner instead watches `chem 30 < 0.5` — low Oxygen — as a symptom.

This reflects two design considerations:

1. **Symptom-based diagnosis mirrors real-world CO poisoning.** A hypoxic patient in the real world is identified by low SpO₂, not by a direct CO reading; the Creatures scanner follows the same logic.
2. **CO is a transient "in-flight" toxin.** Because CO is rapidly consumed by its own attack on oxygen, the *presence* of CO above some threshold is a fleeting state — by the time the scanner detects it, it may already have annihilated most of itself along with the oxygen. The downstream symptom (low O₂) lasts much longer and is a more reliable detection target.

The practical consequence is that a player diagnosing a listless, panting creature via the Medical Pod will see a "low oxygen" warning, and the *Materia Medica* entry for Antioxidant Syrup teaches the player to interpret that — especially when it occurs in a creature that is clearly breathing normal air — as possible CO poisoning. The cure is the same regardless (Antioxidant Syrup), so the diagnostic gap is navigable.

### Contrast with other classic toxins

The design space of the stock genome distinguishes Carbon monoxide from its sibling toxins along multiple axes:

| Chemical | Target | Consumes itself? | Has own receptor? | Antidote | Scanner listed? | Passive HL | Primary phenotype |
|----------|--------|------------------|-------------------|----------|-----------------|------------|-------------------|
| Heavy Metals (66) | Organs (chronic) | No | Yes (injury) | EDTA (95) | Yes | Very long | Slow, permanent organ damage |
| Cyanide (67) | Energy (catalytic) | No (catalyst) | Yes | Sodium thiosulphite (96) | Yes | Long | Rapid energy drain |
| Belladonna (68) | Nervous system | No | Yes | Magic Word (105) | Yes | Long | Neurological disarray |
| Geddonase (69) | Adipose (acute) | **Yes** | Yes | — (none) | Yes | Long | Rapid emaciation, energy spike, starvation crash |
| Glycotoxin (70) | Glycogen | No (catalyst) | Yes | Sugar (99) | Yes | Long | Hypoglycaemia, energy crash |
| ATP Decoupler (78) | ATP pool (catalytic) | No (catalyst) | Yes (REDUCE invert) | Medicine one (92) | Yes | Long | Persistent exhaustion despite full larder |
| **Carbon monoxide (79)** | **Oxygen pool (stoichiometric)** | **Yes (consumed 1:1 with O₂)** | **No — routed via existing hypoxia receptor** | **Anti-oxidant (93)** | **No — scanner watches O₂ instead** | **Long** | **Acute suffocation, DIGITAL Reaction-organ shutdown** |

Carbon monoxide occupies a unique niche among the classic toxins: it is the only one that is **completely invisible to the genome's receptor network on its own terms**, expressing its entire phenotype through the existing Oxygen channel. It is also the only one that is **stoichiometrically consumed by its own damaging reaction** (Geddonase is likewise consumed, but by attacking fat rather than oxygen). The combination of stoichiometric consumption + routing through the DIGITAL hypoxia receptor makes CO behave like an acute crisis — a sudden, sharp loss of function that resolves either quickly (cure) or catastrophically (untreated long exposure to an active source), with no slow "wearing off" middle ground of the kind ATP Decoupler produces.

### Why Anti-oxidant is the antidote

The curative chemistry is plausibly gestured at by its name. In real-world toxicology, antioxidants do not actually treat CO poisoning (the real treatment is oxygen therapy), but the Creatures fiction plays on the broader "anti-" pattern: Anti-oxidant (93) is one of several generic "anti-X" chemicals the Shee catalogued as neutralisers. Slot 93 is paired specifically with CO via Reaction 77 (HL 6 ticks, 1 : 1) and is delivered exclusively through the Antioxidant Syrup potion and the General Cure. The pairing is a pure design choice of the stock genome — there is no receptor or secondary reaction that uses Anti-oxidant for anything else, so slot 93 in the Creatures 3 stock genome is functionally "the CO antidote slot".

### Recovery profile

A creature treated promptly with Antioxidant Syrup recovers quickly:

1. **Toxin clearance is near-instant.** Reaction 77's 6-tick half-life means Anti-oxidant wipes out any CO in the bloodstream within ~20–30 ticks (about a second) of arrival, well before the next scheduled round of CO/O₂ destruction runs would have time to empty the lungs.
2. **Oxygen pool rebuilds by breathing.** The Breathing organ resumes normal injection of Oxygen into the bloodstream. `chem 30` rises back above the 153/255 ≈ 0.6 threshold within seconds, and the DIGITAL hypoxia receptor snaps back on.
3. **Reaction organ unlocks.** The Somatic locus-0 reaction rate returns to its nominal value, aerobic glycolysis (Reaction 49) resumes producing Pyruvate, and Reaction 50 re-mints ATP from substrate at the normal rate. Any accumulated Lactate fades on its own schedule.
4. **No organ injury aftermath.** CO does not wire into any `RLOCUS_INJURY` receptor or damage any organ directly. Once the toxin is gone and oxygen is restored, the creature's tissues are structurally intact.
5. **Energy pool replenishes.** If the creature was energy-depleted by the period of anaerobic-only metabolism, normal eating and resting rebuilds Energy (34) over minutes.

A creature left untreated but surviving the exposure (e.g. the source was a short-lived CO puff and the creature did not die of derived oxygen starvation before the CO's passive decay completed) recovers along the same trajectory but on a ~2-minute timescale rather than a ~second timescale. If the source is ongoing (a parked CO-emitting bacterium, a polluted room), recovery is impossible without removing the creature from the source or administering Antioxidant Syrup.

### Thematic role

Carbon monoxide's design role in the toxin palette is "*the silent killer*" — the toxin you cannot see in the Medical Pod's toxin readout, only in its downstream effect on oxygen. Where Heavy Metals attack the infrastructure (organs), Cyanide and ATP Decoupler attack the energy currency, Belladonna attacks the controller (nervous system) and Geddonase attacks the strategic reserve (fat), CO attacks **the air itself** — the one resource the creature's body draws in continuously from outside rather than storing internally.

The Materia Medica's "*breaks down oxygen in the bloodstream of the creature which can suffocate the creature in only a few minutes*" is a compact capture of the mechanism: the creature cannot stockpile oxygen the way it can stockpile glycogen or triglycerides, so a toxin that destroys what little O₂ is circulating at any given moment is uniquely dangerous. The fact that CO is easily cured by Antioxidant Syrup reflects the design intent that this is a **treatable acute poisoning** rather than a chronic condition — unlike Heavy Metals (slow, permanent organ damage) or Alcohol (pleasant-then-toxic), CO is all-or-nothing: either you cure it and the creature is fine within seconds, or you let it run and the creature dies within minutes.

For custom content designers, CO is the canonical "pollution / industrial hazard / bacterial gas" chemical, and the matching cure is the canonical treatment. A polluted room agent, a smoky exhaust pipe, a coughing creature transmitting a bacterial disease — any in-fiction source of "bad air" should inject `CHEM TARG 79 <amount>` to express its hazard through the existing CO mechanic rather than invent a new one.

## Summary

```
 Chemical 79 — Carbon monoxide  ("breaks down oxygen in the bloodstream")
 --------------------------------------------------------------------------
 Producers:   NONE internally — external only (bacteria, pollution agents,
              custom CAOS). Materia Medica names bacteria as canonical
              in-fiction vector.
 Consumers:   Reaction 78   (oxygen destruction: 1× CO + 1× O₂ → nothing;
                             HL 19 ticks, "Short" — stoichiometric, NOT
                             catalytic; both reactants consumed 1:1)
              Reaction 77   (antidote: 1× CO + 1× Anti-oxidant → nothing;
                             HL 6 ticks, "Very short")

 Receptors (0):
   - NONE drive off chem 79 directly.
   - All phenotypic damage routed via the existing Oxygen receptor
     (receptor 78, chem 30, Reaction/Somatic/Locus 0, threshold 153,
     nominal 223, gain 18, flags REDUCE + DIGITAL) which snaps the
     Somatic reaction-rate locus to zero when O₂ falls below threshold.

 Half-life:   1 370 ticks (~46 s at 30 tps, decay 0.99949 — "Long")

 Antidote:    Anti-oxidant (93)
              - "Antioxidant Syrup" potion (tag 2 25 5): injects 1.0 unit
              - "General Cure" potion (tag 2 25 19): injects 0.15 units
                alongside six other cure chemicals (weak, ~5× bottles needed)

 Medical Pod scanner threshold: NOT directly listed (unlike the other
                                classic toxins). Indirectly detected via
                                the scanner's `chem 30 < 0.5` low-oxygen
                                check, which catches CO's downstream effect.

 Narrative role: The silent oxygen thief. A stoichiometric toxin that
                 annihilates dissolved Oxygen 1:1, destroying itself in the
                 process. Acts indirectly through the existing DIGITAL
                 hypoxia receptor — a CO-poisoned creature is biochemically
                 indistinguishable from one suffocating in a low-oxygen
                 room. Phenotype: acute suffocation (panting, weakness,
                 Reaction-organ snap-shutdown) with a "few minutes" time
                 pressure before derived energy starvation kills the
                 creature. Fully curable by a dedicated Anti-oxidant potion;
                 recovery is rapid (seconds) and leaves no permanent damage.
```

Carbon monoxide completes the Shee Medicinal stock palette by modelling a real-world asphyxiant as a single stoichiometric oxygen-sink reaction, routed through the existing hypoxia receptor rather than given its own wiring. Combined with a dedicated antidote, a specific cure potion, a general-cure inclusion, and a deliberately *symptom-based* Medical Pod diagnostic pathway (low oxygen, not direct CO detection), it is the canonical "bacterial / pollution suffocation toxin" slot in the genome: custom content designers building polluted environments, smoky agents, or gas-producing bacteria should target chem 79 to express their hazard through the stock CO mechanic.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:99` — chemical descriptor slot 79 "Carbon monoxide" (empty description)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:131` — player-visible slot name "Carbon monoxide"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:99-100` — "Antioxidant Syrup" potion help text: "*Antioxidant Syrup is the best way to stop the nasty effects of carbon monoxide poisoning. Certain bacteria have been known to poison a a Creature with carbon monoxide… breaks down oxygen in the bloodstream of the creature which can suffocate the creature in only a few minutes!*"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:132` — "General Cure" potion lists carbon monoxide as one of its seven declared targets
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:342` — *Materia Medica* index listing of the toxin
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:360` — *Materia Medica* entry heading for Anti-oxidant (the cure chemical)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - Reaction 77 (gene 100): `1× Anti-oxidant [93] + 1× Carbon monoxide [79] → nothing`, rate 18, half-life 6 ticks ("Very short")
  - Reaction 78 (gene 95): `1× Carbon monoxide [79] + 1× Oxygen [30] → nothing`, rate 30, half-life 19 ticks ("Short")
  - Receptor 78 (gene 150): Reaction organ / Somatic tissue / locus 0, Oxygen (30), threshold 153, nominal 223, gain 18, flags REDUCE + DIGITAL — the downstream hypoxia channel that CO drives indirectly
  - Half-life entry: 1 370 ticks, decay rate 0.99949, "Long"
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:573` — `scrp 2 25 5 12`: "Antioxidant Syrup" drink script, injects `CHEM 93 1` (Anti-oxidant, 1.0 units)
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:651` — `scrp 2 25 19 12`: "General Cure" drink script, injects `CHEM 93 0.15` alongside six other cure chemicals at 0.15 and Adrenalin at 0.45
- `Rebuild/Assets/Bootstrap/001 World/medical scanner.cos:80` — Medical Pod "sick" scanner threshold battery; **note that chem 79 is NOT in the list**, but `chem 30 < 0.5` catches CO's downstream hypoxia effect
- `Rebuild/DOCUMENTATION/chemicals/030 - Oxygen.md` — companion analysis of the Oxygen pool that CO attacks, including the DIGITAL hypoxia receptor wiring
- `Rebuild/DOCUMENTATION/chemicals/078 - ATP Decoupler.md` — companion analysis of a contrasting "catalytic, own-receptor" toxin slot, illustrating the structural alternatives inside the classic-toxin palette
- `Rebuild/DOCUMENTATION/chemicals/069 - Geddonase.md` — companion analysis of the only other stoichiometrically-consumed classic toxin, illustrating the "consumed by its own reaction" design pattern that CO also follows
