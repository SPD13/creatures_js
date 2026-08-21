# 092 - Medicine one

Medicine one is chemical slot 92 in the Creatures 3 biochemistry. In the player-facing *Chemical Names* catalogue it is listed as **"Medicine one"**; in the *Materia Medica* appendix it appears capitalised as **"Medicine One"**. The chemical-library descriptor file (`creatures-chemicals.js`) carries a note reading *"Cure for cyanide poisoning"* — but this descriptor is **incorrect**: the stock biochemistry actually wires Medicine one as the dedicated antidote for **ATP Decoupler (78)**, not cyanide (cyanide is neutralised by Sodium thiosulphite, slot 96). The mis-labelled stub is a known text-layer artefact and does not reflect the genome's behaviour.

In mechanical terms Medicine one is a **sacrificial 1 : 1 neutraliser** with no endogenous production. The genome contains exactly one reaction that consumes it (Reaction 83: `1× ATP Decoupler + 1× Medicine one → nothing`, half-life 2 ticks — "Very short") and **no** reaction, emitter, or receptor that produces or reads it. Medicine one therefore cannot arise inside a creature's body on its own: a newborn Norn's concentration is 0 and stays at 0 unless something external injects it. The only stock sources are the two medicinal potions dispensed by the Medicine Maker — the **ATP Decoupler Cure** (1.0 unit per bottle) and the **General Cure** (0.15 unit per bottle alongside six other weak cure chemicals and a splash of Adrenalin). Any Medicine one that is not consumed by Reaction 83 fades out of the bloodstream through its own passive decay (half-life 621 ticks ≈ 20.7 s at 30 tps, "Medium") without doing any harm along the way.

Medicine one is the canonical member of the Shee's **"Medicine N"** naming series (slots 92, 93, and so on): generic catalogue labels for passive chemicals whose only job is to consume one specific toxin 1 : 1 on a very-short-half-life reaction with no side products. The design pattern across the series is the same — no receptors, no emitters, no side effects, overdose-safe, paired with a single dedicated potion in the Medicine Maker. Medicine one pairs with ATP Decoupler; Anti-oxidant (93) pairs with carbon monoxide (76); and so on down the cure roster. Because Medicine one has zero receptor wiring, a creature cannot "feel" it, respond to it, or become dependent on it; it is purely a passive reagent that the player can drop into the bloodstream via a potion to erase one very specific toxin.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter, no reaction produces chemical 92, no starting endowment | — | — | Initial concentration is 0 for every newborn creature. The genome contains zero production mechanisms for slot 92; Medicine one can only enter the bloodstream through an external injection |
| 2 | **ATP Decoupler Cure potion** (stock potion class `2 25 4`) | `scrp 2 25 4 12` in `medicine maker.cos:556` | `chem 92 1` on drink event | One bottle delivers a full 1.0 unit of Medicine one — enough to neutralise up to ~1.0 unit of ATP Decoupler with a little slack left over to catch new exposure arriving shortly afterwards. The Medicine Maker dispenses this potion on demand from its cure menu |
| 3 | **General Cure potion** (stock potion class `2 25 19`) | `scrp 2 25 19 12` in `medicine maker.cos:642` | `chem 92 .15` alongside `chem 100 .15` (Antihistamine), `chem 97 .15` (Arnica), `chem 95 .15` (EDTA), `chem 93 .15` (Anti-oxidant), `chem 96 .15` (Sodium thiosulphite), `chem 94 .15` (Prostaglandin), and `chem 117 .45` (Adrenalin) on drink event | One bottle delivers a token 0.15 unit, enough to dent but not fully clear a serious ATP Decoupler infection. The Materia Medica explicitly flags the General Cure as "extremely weak" and recommends the dedicated ATP Decoupler Cure for serious poisonings |
| 4 | **CAOS injection** | — | `CHEM TARG 92 <amount>` from console, scripts or custom content | The standard route for testing the cure pathway, topping up Medicine one to verify Reaction 83, or building custom potion content that borrows the slot |

Unlike most chemicals in the genome, Medicine one has no production gene of any kind — it is a pure player-delivered reagent. This mirrors the structure of all the other "Medicine N" cure slots in the palette.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **ATP Decoupler neutralisation** | 97 | — | Reaction 83: `1× ATP Decoupler [78] + 1× Medicine one [92] → (nothing)` | — | — | rate 7 (half-life **2 ticks**, "Very short") | — | The sole active role. One unit of Medicine one destroys one unit of ATP Decoupler, and both are consumed — Medicine one is a sacrificial reagent, not a catalyst. Half-life 2 ticks ≈ 67 ms at 30 tps: any Medicine one in the bloodstream erases an equal mass of ATP Decoupler within a handful of frames |
| 2 | **Passive decay** | — | — | Half-life **621 ticks** ("Medium", decay rate 0.99888) | — | — | — | Background clearance of any Medicine one that was injected but did not meet an ATP Decoupler molecule to react with. ~20.7 seconds at 30 tps — long enough that a little "safety buffer" of Medicine one can remain in the bloodstream for a while after the toxin is gone, ready to catch a fresh exposure if one arrives soon |

**No receptors.** The genome does not wire Medicine one to any Creature, Reaction, or Brain organ locus. Creatures cannot sense their own Medicine-one level and no tissue changes behaviour with its concentration. It is a purely "metabolic-plumbing" chemical — it exists to be consumed by Reaction 83 and, failing that, to decay away.

**No emitters.** No gene causes any tissue to produce Medicine one in response to any signal. The body cannot self-medicate.

The matched cure line in the stock game:

| Potion | Tag | Injects Medicine one | Also injects | Reaction consuming Medicine one |
|--------|-----|----------------------|--------------|---------------------------------|
| **ATP Decoupler Cure** | `Agent Help 2 25 4` / `scrp 2 25 4 12` | `CHEM 92 1.0` | — | Reaction 83 (HL 2 ticks, 1 : 1) |
| **General Cure** | `Agent Help 2 25 19` / `scrp 2 25 19 12` | `CHEM 92 0.15` | 0.15 × Antihistamine, Arnica, EDTA, Anti-oxidant, Sodium thiosulphite, Prostaglandin; 0.45 × Adrenalin | Reaction 83 (HL 2 ticks, 1 : 1 — but only 0.15 units per bottle) |

## Role in Game Mechanics

### The antidote reaction

Reaction 83 is the defining mechanic of Medicine one:

```
 1× ATP Decoupler [78]  +  1× Medicine one [92]   →   (nothing)
```

Both reactants are consumed with no products. This is the hallmark of the **sacrificial neutraliser** pattern: Medicine one does not recycle, it does not catalyse, it simply annihilates itself and one molecule of ATP Decoupler on contact. The half-life at the stock genome value (7) is **2 ticks**, placing this reaction in the "Very short" speed bucket — the fastest class in the biochemistry. At 30 tps that works out to ≈ 67 ms of half-life: whenever both chemicals are present in the bloodstream, their product concentrations are halved every two frames, so a typical ATP Decoupler load of ~0.5–1.0 units is wiped out within roughly a quarter of a second of the cure taking effect.

Because the reaction consumes both sides 1 : 1, the arithmetic a player actually has to do is very simple: *however many units of ATP Decoupler the creature has, it needs at least that many units of Medicine one to clear the infection completely.* One bottle of ATP Decoupler Cure delivers 1.0 unit of Medicine one, which covers any realistic ATP Decoupler load in the stock-content world. If Medicine one is delivered in shortfall — e.g. 0.15 units of Medicine one against 0.8 units of ATP Decoupler from a single General Cure bottle — the reaction fires until the Medicine one is exhausted, leaving the residual ATP Decoupler to continue its catalytic ATP destruction. This is precisely why the Materia Medica warns that the General Cure is underpowered for serious toxic poisonings.

### Why "very short" half-life matters

The 2-tick half-life makes Reaction 83 the fastest class of reaction in the biochemistry. In practice this has three consequences:

- **Near-instantaneous effect.** There is no "waiting" for the cure to work. A creature that drinks ATP Decoupler Cure has its ATP Decoupler cleared within about a quarter of a second of real time — fast enough that the player sees the effect essentially on the next chemistry update.
- **No window for the toxin to "outrun" the cure.** ATP Decoupler's own catalytic reaction (Reaction 84, `ATP + Decoupler → ADP + Decoupler`) runs at half-life 3 ticks, comparable to but slower than the antidote reaction. Once Medicine one is present, the antidote reaction out-runs the toxin's damage reaction: every tick the toxin destroys less ATP than the Medicine one destroys of the toxin itself.
- **Minimal dose dependence.** Because the half-life is so short, even sub-optimal doses of Medicine one are fully consumed very quickly, rather than lingering around and wasting their curative capacity on passive decay. Whatever Medicine one is injected, almost all of it ends up paired with ATP Decoupler in the first second after delivery — the only Medicine one that reaches the passive-decay path is surplus beyond the ATP Decoupler available.

### Passive decay and overdose safety

Medicine one's own passive half-life is **621 ticks ≈ 20.7 s** at 30 tps ("Medium", decay 0.99888). This matters in two cases:

1. **Residual after a full cure.** When the Cure is dosed at 1.0 unit and the toxin was below 1.0 unit, a small amount of Medicine one is left over after Reaction 83 finishes consuming the ATP Decoupler. That residual fades out over ~20 seconds, quietly catching any new exposure arriving in that window before vanishing.
2. **Overdose safety.** Because Medicine one has no receptors — no organ tissue responds to its concentration — there is no physiological downside to excess. A Norn dosed with two, three, or ten bottles of ATP Decoupler Cure suffers no side effects. The excess simply sits in the bloodstream and decays away, or reacts with any fresh ATP Decoupler exposure that happens to arrive. This is a deliberate design choice that lets the player be liberal with the cure without having to measure exact doses.

This "no side effects" profile is what makes Reaction 83 tuneable so aggressively. Because Medicine one cannot hurt the creature, the designer was free to pick a crushingly fast half-life (2 ticks) without worrying about the reagent overshooting and causing collateral damage — the only thing overshooting does is deliver a safety buffer.

### Relationship to the Medicine Maker

The Medicine Maker in the 001 bootstrap dispenses Medicine one exclusively through its **ATP Decoupler Cure** and **General Cure** recipes. There is no other in-world gadget, food, or agent that emits chemical 92 in the stock content. Concretely:

- The **ATP Decoupler Cure** (`scrp 2 25 4 12`) is the dedicated single-toxin remedy. Drinking one bottle fires `chem 92 1` on the drinker, injecting one full unit of Medicine one. That bottle is enough to clear any realistic ATP Decoupler infection with a little buffer left over.
- The **General Cure** (`scrp 2 25 19 12`) is the catch-all prophylactic. Drinking one bottle fires `chem 92 .15` alongside six other cure chemicals (each at 0.15) and Adrenalin (0.45). The Materia Medica explicitly describes this potion as "extremely weak" and recommends the dedicated cure potions for any serious toxic poisoning — consistent with the arithmetic that 0.15 units of Medicine one can only clear 0.15 units of ATP Decoupler. A creature in serious ATP-Decoupler distress would need five or more General Cure bottles to match one ATP Decoupler Cure.

The General Cure's inclusion of Medicine one reflects the Materia Medica's explicit listing of ATP Decoupler as one of the six toxins the General Cure can address: "*The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin.*"

### No sensing, no behavioural feedback

Because Medicine one has zero receptors, creatures cannot perceive their own cure state. A cured Norn does not "feel better"; what happens instead is that the *consequences* of the toxin fade:

- With ATP Decoupler gone, Reaction 84 stops firing and the ATP pool stops being drained to ADP. The creature's glycolytic and β-oxidation pathways (Reaction 50 and friends) recover to their normal ATP-regeneration rates within one or two ticks.
- The reaction-rate suppression driven by ATP Decoupler's own receptor (Receptor 59, acting through the Reaction organ / Somatic tissue / locus 0) releases linearly as the toxin concentration falls, restoring normal biochemical throughput.
- The creature's Energy pool (chem 34), having been depleted during the poisoning, rebuilds at its normal rate over the following minutes as the restored ATP production funds re-minting of Energy.

From the creature's point of view the experience of being cured is simply "the fatigue starts to lift". There is no pharmacological feedback from the cure itself — only the absence of the toxin that was causing the fatigue.

### The mis-labelled descriptor

The chemical-library stub in `Rebuild/Libraries/creatures-chemicals.js:116` reads:

```javascript
{ id: 92, name: 'Medicine one', description: 'Cure for cyanide poisoning' }
```

This description is **wrong**. Cyanide (chemical 67) is cured in the stock biochemistry by **Sodium thiosulphite** (chemical 96), via Reaction 82 (`1× Cyanide + 1× Sodium thiosulphite → nothing`). Medicine one participates in only one reaction in the genome — Reaction 83 — and that reaction consumes ATP Decoupler (78), not Cyanide. The descriptor is a leftover error from an earlier iteration of the cure palette that was never corrected. Tools reading from the descriptor file should be aware of this discrepancy; the authoritative source is the genome's reaction table and the Materia Medica catalogue entry *"ATP Decoupler Cure"* (TAG `Agent Help 2 25 4`), both of which correctly identify Medicine one as the ATP Decoupler antidote.

### Contrast with the rest of the cure palette

Medicine one is part of a structurally uniform cluster of "cure-pair" chemicals in the genome. The cluster occupies slots 92–100 (with a couple of exceptions) and each pairs 1 : 1 with one specific toxin:

| Cure chemical | Slot | Paired toxin | Slot | Potion |
|---------------|------|--------------|------|--------|
| **Medicine one** | **92** | **ATP Decoupler** | **78** | **ATP Decoupler Cure (2 25 4)** |
| Anti-oxidant | 93 | Carbon monoxide | 76 | Antioxidant Syrup (2 25 5) |
| Prostaglandin | 94 | Geddonase-like / wound signal | — | (not in a single potion) |
| EDTA | 95 | Heavy Metals | 66 | Heavy Metal Cure (2 25 3) |
| Sodium thiosulphite | 96 | Cyanide | 67 | Cyanide Cure (2 25 6) |
| Arnica | 97 | Glycotoxin | 70 | Elixir of Arnica (2 25 2) |
| Antihistamine | 100 | Histamine A (73) & B (74) | 73, 74 | Cough Syrup (2 25 18) |

Every member of this cluster shares the same structural profile: no internal production pathway, no receptors, a single "consume-paired-toxin" reaction with very-short half-life, a benign passive-decay half-life, and a dedicated potion in the Medicine Maker. Medicine one is the first entry in the series (hence the name) and the paradigmatic example of the pattern. The uniform design is what makes the Medicine Maker's cure menu "just work" from the player's perspective: every potion clears exactly one toxin fast, cleanly, and without side effects.

### Recovery profile (player-perspective)

A creature treated promptly with ATP Decoupler Cure recovers as follows:

1. **T+0 s — potion drunk.** `CHEM 92 1` fires; 1.0 unit of Medicine one enters the bloodstream.
2. **T+0.1 s — toxin gone.** Reaction 83 (HL 2 ticks ≈ 67 ms) halves the ATP Decoupler + Medicine one pair every two frames. Within a handful of ticks, any realistic ATP Decoupler load has been consumed.
3. **T+0.2 s — residual Medicine one.** Any Medicine one left over after the ATP Decoupler runs out begins decaying passively (HL 621 ticks). Within ~20 s it has halved; within ~2 minutes it has faded to insignificance.
4. **T+0 s onward — ATP pool recovery.** With Reaction 84 no longer running, the creature's glycolytic and β-oxidation pathways mint ATP at normal speed. ATP concentration climbs back toward baseline within seconds.
5. **T+minutes — Energy rebuild.** The creature's Energy pool (chem 34), depleted during the poisoning, rebuilds over the following minutes as ATP production funds the Energy-regeneration reactions. The creature's fatigue lifts gradually as the Energy reserve returns to normal.

There is no Medicine-one-specific side effect at any stage. The only "pharmacological signature" of the cure is the absence of the toxin it has destroyed.

### Thematic role

In the Shee's in-fiction pharmacopoeia, Medicine one is the archetype of a **clean antidote**: a single-purpose chemical discovered (per the Materia Medica) to break down one very specific toxin and otherwise leave the creature's biochemistry untouched. The generic name "Medicine one" rather than a descriptive name (contrast "Sodium thiosulphite" or "Arnica") reflects the fact that the Shee were cataloguing these compounds as a numbered series rather than identifying them by structure — Medicine one is simply the first cure chemical in the Shee registry, paired with the first toxin they figured out how to neutralise in this clean fashion. The design intent is that a player scanning a listless Norn, reading "ATP Decoupler" on the Medical Pod, and dispensing one bottle of ATP Decoupler Cure should see the creature bounce back within seconds — a satisfying diagnosis-and-treatment loop that shows off the biochemistry system without requiring the player to understand the underlying reaction stoichiometry.

## Summary

```
 Chemical 92 — Medicine one  ("ATP Decoupler antidote" — descriptor file
                               incorrectly labels it "Cure for cyanide
                               poisoning"; the genome's actual pairing
                               is with ATP Decoupler, 78)
 --------------------------------------------------------------------------
 Producers:   NONE internally — external only (ATP Decoupler Cure potion,
              General Cure potion, CAOS injection)
 Consumers:   Reaction 83   (1× ATP Decoupler + 1× Medicine one → nothing;
                             HL 2 ticks, "Very short")

 Receptors:   NONE. Creatures cannot sense their own Medicine-one level.
 Emitters:    NONE. No organ produces Medicine one in response to anything.

 Half-life:   621 ticks (~20.7 s at 30 tps, decay 0.99888 — "Medium")

 Stock sources:
   - ATP Decoupler Cure potion (tag 2 25 4):  injects 1.0 unit
   - General Cure potion       (tag 2 25 19): injects 0.15 unit alongside
                                               six other weak cures

 Narrative role: The archetypal "clean antidote" in the Shee cure palette.
                 Sacrificial 1 : 1 neutraliser of ATP Decoupler on a
                 near-instantaneous half-life (2 ticks ≈ 67 ms). No
                 receptors, no side effects, overdose-safe. The first and
                 canonical member of the "Medicine N" numbered cure series,
                 pairing with the "classic mystery-fatigue toxin" ATP
                 Decoupler in the Medicine Maker's cure menu.
```

Medicine one is one of the simplest chemicals in the stock biochemistry by design — exactly two interactions (one antidote reaction, one passive-decay line), no wiring to any organ tissue, and no production pathway of any kind. That minimalism is precisely the point: as the paired antidote for a catalytic energy thief, its value lies in being predictable, fast, and harmless, so that the player can lean on the ATP Decoupler Cure potion the moment the Medical Pod flags a problem without having to second-guess the dose or worry about side effects.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:116` — chemical descriptor slot 92: *"Medicine one"* / *"Cure for cyanide poisoning"* (descriptor text is **incorrect**; Medicine one cures ATP Decoupler in the stock genome, not cyanide)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:148` — player-visible slot name *"Medicine one"*
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:94` — *"ATP Decoupler Cure"* potion help text (`TAG "Agent Help 2 25 4"`): *"This potion contains a chemical which the Shee discovered was able to break down the nasty ATP decoupler toxin…"* — confirms Medicine one as the ATP Decoupler antidote
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:130` — *"General Cure"* potion help text (`TAG "Agent Help 2 25 19"`): *"The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"* — confirms the General Cure's coverage of ATP Decoupler via its 0.15-unit Medicine-one dose
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:359` — appendix listing of *"Medicine One"* under chemical slot 92 (capitalised variant of the name)
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:556` — `scrp 2 25 4 12`: ATP Decoupler Cure drink script, injects `chem 92 1` (Medicine one, 1.0 unit)
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:642` — `scrp 2 25 19 12`: General Cure drink script, injects `chem 92 .15` (Medicine one, 0.15 unit) alongside six other cure chemicals at 0.15 and Adrenalin at 0.45
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - Reaction 83 (gene 97, switch-on Baby / age 0): `1× ATP Decoupler [78] + 1× Medicine one [92] → (nothing)`, rate 7, half-life 2 ticks ("Very short"), decay 0.70697
  - Half-life entry: 621 ticks, decay rate 0.99888, "Medium"
  - No receptor or emitter entries reference chemical 92
- `Rebuild/DOCUMENTATION/chemicals/078 - ATP Decoupler.md` — companion analysis of the paired toxin, detailing the ATP/ADP attack mechanism that Medicine one is designed to clean up
- `Rebuild/DOCUMENTATION/chemicals/035 - ATP.md` — companion analysis of the ATP/ADP energy-currency cycle whose balance the toxin attacks and the cure restores
- `Rebuild/DOCUMENTATION/chemicals/067 - Cyanide.md` — companion analysis clarifying that cyanide is neutralised by Sodium thiosulphite (96), not by Medicine one, despite the descriptor-file mis-label
