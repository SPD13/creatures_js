# 066 - Heavy Metals

Heavy Metals is the Creatures 3 chemistry's catch-all **environmental toxin slot**, described in the catalogue as "Lead, Thallium, etc." It represents the bioaccumulating heavy-metal poisons that a creature picks up from contaminated food, stinger-type plants and mischievous agents, and it models the real-world behaviour of those poisons with remarkable fidelity: once inside the body, Heavy Metals effectively **never decay on their own** (half-life 90,682,980,616 ticks ≈ 95 years of real play time, decay rate 1.0) and the only chemical that can clear them is **EDTA (chem 95)**, the real-world chelating agent used in clinical lead/mercury poisoning therapy. The standard genome wires no internal producer of Heavy Metals — they only enter a creature from the outside world — but wires **five different receptors** that make any build-up progressively dangerous: three organ-level damage receptors on separate somatic organs, and two reproductive-tract receptors that raise both the chance and the severity of genetic mutation during gamete production. Cyberlife's Materia Medica summarises the design intent directly: *"Most Creatures with a large heavy metal build-up will be highly susceptible to organ damage in their immune and reproductive systems. Once these organs are damaged the Creature could have great difficulty in fighting diseases and may become unable to reproduce. Should you find a Creature has a high heavy metal build-up, make sure they drink some of this syrup"* — the syrup being the **Heavy Metal Cure potion**, an EDTA-loaded Creature Disk item whose sole mechanical purpose is to trigger reaction 91.

Heavy Metals therefore occupy a distinctive niche in the chemistry: a **permanent, externally-sourced, multi-organ toxin** whose only cure is a specific antidote. They are the game's principal mechanism for long-term environmental damage — the chemical that makes poisoned food stay dangerous after the meal is digested, the chemical that turns a single bite of a Stinger Cookie into a slow bioaccumulating threat to reproduction, and the chemical that makes the Materia Medica's EDTA potion a genuinely valuable item rather than a redundant curiosity.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter and no producing reaction in the standard genome | — | — | A healthy creature is born with Heavy Metals = 0 and stays at 0 for life unless something external injects the chemical |
| 2 | **Stinger Cookie** (ingested agent) | `Assets/Catalogue/quirky cookie recipes.catalogue` (Recipe "Quirky Recipe 2 14 8", chemicals 80/**66**/69 in small quantities) | Bite / eat action → agent injects chem 66 into the creature | The stock game's canonical environmental source. Stinger Cookies look like ordinary rotorfly-topped cookies but deliver a small dose of Heavy Metals with every bite, so creatures that over-eat them bioaccumulate toxic levels over many meals |
| 3 | **Other third-party toxic agents** (stings, poisoned foods, environmental hazards) | User-made `.agents` files (e.g. `toxicnornpack-*.agents`) | Custom COB/PRAY scripts that `CHEM TARG 66 <amount>` | No other stock-shipped agent uses chem 66, so in a clean install Stinger Cookies are effectively the only natural route of exposure |
| 4 | **CAOS injection** | — | `CHEM TARG 66 <amount>` from scripts or debug consoles | Because the half-life is effectively infinite, any dose written by CAOS persists indefinitely until cleared by reaction 91 or manually reset |

Heavy Metals are unique among dangerous chemicals in the genome in that there is **no metabolic pathway that creates them** — the creature cannot poison itself from the inside. Every milligram of chemical 66 in a bloodstream came from the outside world.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Organ damage receptor (organ A)** | 86 | Organ / Somatic | `RLOCUS_INJURY` | 0 | 0 | 25 | none | Any concentration of Heavy Metals above zero inflicts a low but continuous stream of injury on this organ, slowly degrading its capacity to perform its metabolic function |
| 2 | **Organ damage receptor (organ B)** | 87 | Organ / Somatic | `RLOCUS_INJURY` | 0 | 0 | 25 | none | Same action as receptor 1 but wired on a second organ — the three identical copies (genes 86, 87, 88) give Heavy Metals a **broad, multi-organ** damage profile rather than targeting a single organ |
| 3 | **Organ damage receptor (organ C)** | 88 | Organ / Somatic | `RLOCUS_INJURY` | 0 | 0 | 25 | none | Third of the identical organ-damage receptors. In combination with 1 and 2 this is what the Materia Medica is describing when it says Heavy Metals damage "immune and reproductive" organs — the three `RLOCUS_INJURY` receptors are distributed across the organ set so that immune, reproductive and other somatic organs all accrue damage simultaneously |
| 4 | **Mutation chance receptor** | 159 | Creature / Reproductive | `LOC_CHANCEOFMUTATION` | 128 | 0 | 255 | none | When Heavy Metals exceeds **128/255 (≈ 50 %)**, the locus that governs the probability of a mutation during gamete production is driven strongly positive. Full gain (255) on a 255-range locus means this receptor can swing the mutation probability from its nominal value all the way to saturation |
| 5 | **Mutation severity receptor** | 160 | Creature / Reproductive | `LOC_DEGREEOFMUTATION` | 22 | 0 | 255 | none | Much lower threshold (**22/255 ≈ 9 %**): even a small residual Heavy Metals load raises the *degree* of each mutation once one occurs. In combination with receptor 4, this means low levels cause occasional but serious mutations and high levels cause frequent serious mutations |
| 6 | **EDTA neutralising reaction** | 82 | — | Reaction 91: `1× Heavy Metals [66] + 1× EDTA [95] → (nothing)` | — | — | rate 0.97 (half-life 24 ticks, "Short") | none | The genome's only removal pathway. EDTA is itself an externally-sourced chemical (the Heavy Metal Cure potion injects it) that reacts rapidly with Heavy Metals and consumes both molecules without producing any by-product |
| 7 | **Passive decay** | — | — | Half-life **90,682,980,616 ticks** ("Very long", decay rate 1.0) | — | — | — | The "effectively no decay" placeholder used by stable accumulating toxins. Once Heavy Metals enter the bloodstream they remain there for the creature's entire life unless EDTA (or another custom reaction) neutralises them |

The usage table shows the characteristic "**long-term poison**" design pattern: a chemical that (a) does not decay, (b) has no internal producer, (c) has damage receptors that are always active (threshold 0 on receptors 1–3) so even trace amounts do persistent harm, and (d) has a single specific antidote reaction. Every one of these traits mirrors the pharmacology of real-world lead/thallium poisoning.

## Role in Game Mechanics

### Why the chemistry looks the way it does

Real-world heavy-metal poisoning (lead, mercury, thallium, cadmium) has three defining features:

1. The metals bioaccumulate — they do not metabolise away and clearance is extraordinarily slow (half-lives measured in years).
2. They damage a wide range of tissues, especially haematopoietic and reproductive organs, and interfere with neurological development.
3. The clinical antidote is **chelation therapy** with EDTA or similar chelators, which bind the metal into a soluble complex that can be excreted.

The Creatures 3 chemistry encodes each of these three facts as a separate mechanism:

- Trait (1) is encoded by **half-life 90,682,980,616 ticks / decay rate 1.0** — the same "no-decay" sentinel used by truly dormant catalogue slots, re-used here as a deliberate biological statement: Heavy Metals do not decay.
- Trait (2) is encoded by **three `RLOCUS_INJURY` receptors on three different somatic organs** (genes 86, 87, 88) plus **two receptors on the Reproductive tract** affecting mutation (genes 159, 160). The Materia Medica's "immune and reproductive" wording describes this directly.
- Trait (3) is encoded by **reaction 91** (gene 82) — `Heavy Metals + EDTA → nothing` — and the Heavy Metal Cure potion in the Materia Medica. The rate genome value of 32 gives a short half-life of ~24 ticks, so once EDTA arrives in the bloodstream the metals are cleared quickly.

This is one of the genome's most faithful real-world analogies and it is designed to make the Heavy Metal Cure potion a memorable, specific tool rather than a generic healing item.

### Organ damage: how the three `RLOCUS_INJURY` receptors actually work

`RLOCUS_INJURY` is an **Organ**-level (not Creature-level) reducer locus: it writes into the organ's `injury` field, which the organ update code subtracts from the organ's life value each tick. With threshold 0, nominal 0 and gain 25, the receptor output is proportional to Heavy Metals concentration:

```
 injury_delta ≈ (HeavyMetals_concentration × gain) / 255
              ≈ HeavyMetals × 25 / 255
```

A creature with Heavy Metals = 128 (half-max) receives roughly `128 × 25 / 255 ≈ 12.5` injury units per tick on each of the three wired organs. Because the gain is low (25 out of a possible 255) the damage per tick is slow; the real danger is the *cumulative* effect over the many thousands of ticks that the non-decaying chemical remains in the bloodstream. A single moderate dose of Heavy Metals that is never treated will eventually kill organs outright.

The three identical receptors (genes 86, 87, 88) are distributed across the organ list so that the damage is *spread* rather than focused — this is what gives Heavy Metals their "whole-body toxicity" character. Treatment with EDTA clears the chemical quickly, but any organ damage *already accrued* persists (organs heal via `RLOCUS_RATEOFREPAIR` driven by Prostaglandin, which is a separate, slow process). So Heavy Metals poisoning can leave a creature permanently weakened even after the metals themselves are gone.

### Reproductive damage: mutation rate and mutation severity

The two receptors on the Creature / Reproductive tissue (genes 159, 160) target the loci that govern mutation during gamete production:

- `LOC_CHANCEOFMUTATION` — probability that a given gene in the gamete will mutate during copying.
- `LOC_DEGREEOFMUTATION` — amplitude of each mutation when one occurs (i.e. how different the mutated allele is from the parent allele).

Receptor 124 (gene 159) has threshold 128 and gain 255: it is essentially a **high-concentration switch** that sharply raises the mutation probability once Heavy Metals climb above the mid-range. Receptor 125 (gene 160) has threshold 22 and gain 255 — a much **lower-concentration ramp** that raises mutation severity even when the metals are present at relatively low levels.

The combined effect is biologically intuitive:

| Heavy Metals level (0–255) | Chance of mutation | Degree of mutation |
|----------------------------|--------------------|--------------------|
| 0 – 22 | Nominal (baseline) | Nominal |
| 22 – 128 | Nominal | **Raised** — any mutations that do occur are more severe |
| 128 – 255 | **Raised** — mutations become far more frequent | **Strongly raised** — and more severe |

So a mildly contaminated creature produces occasional but meaningful mutations, and a heavily contaminated creature produces frequent, severe mutations. This is the in-game analogue of the teratogenic and germ-line-damage effects of real heavy-metal poisoning, and it makes Heavy Metals a particularly dangerous chemical for a breeding colony: a single contaminated parent can seed an entire lineage with mutated genetics.

### The EDTA antidote reaction and the Heavy Metal Cure potion

Reaction 91 (gene 82) is the only stock-game pathway that clears Heavy Metals:

```
 1× Heavy Metals  +  1× EDTA   →   (nothing)   +   (nothing)
```

The reaction half-life is **24 ticks** at genome value 32 — approximately **0.8 seconds of real time** at 30 tps. Both molecules are consumed stoichiometrically. The Materia Medica's *Heavy Metal Cure* potion is a consumable Creature Disk item that, when ingested, dumps a dose of EDTA directly into the bloodstream; the reaction then rapidly converts both the newly-delivered EDTA and the resident Heavy Metals into nothing.

Because EDTA itself has a finite (though fairly long) half-life and is consumed by the reaction, repeated small doses of the cure are more efficient than a single overdose: the creature's body consumes EDTA in proportion to the Heavy Metals present, so delivering EDTA at roughly the same rate that metals leave the bloodstream is the optimal clearance schedule. The Materia Medica's usage advice — *"make sure they drink some of this syrup. After that, keep the Creature well fed and rested"* — reflects exactly this: the cure removes the metals, but the creature then needs recovery time for the Prostaglandin-driven organ repair to undo the accumulated `RLOCUS_INJURY` damage.

### Environmental sources in the stock game

The only stock-shipped source of Heavy Metals is the **Stinger Cookie**, registered in `Assets/Catalogue/quirky cookie recipes.catalogue` under *Quirky Recipe 2 14 8*. The recipe injects three chemicals per bite — **80 (Geddonase)**, **66 (Heavy Metals)**, and **69 (something else)** — in "small quantities" flagged by the recipe. Geddonase is an enzymatic toxin and Heavy Metals supply the long-lived secondary damage; the result is a food item that seems only mildly unpleasant on a single bite but becomes deeply dangerous for a creature that develops a habit of eating them.

User-made content (notably `toxicnornpack-no-inline-no-links-no-cookies-no-depends.agents` in the `My Agents` folder) also injects Heavy Metals, but those are third-party additions; the shipped stock experience confines Heavy Metals exposure to the Stinger Cookies unless the player imports extra agents.

### Interaction with the injury / repair system

Because the three `RLOCUS_INJURY` receptors write into the organ's injury field continuously while Heavy Metals are present, the organ's repair system (`RLOCUS_RATEOFREPAIR`, driven by Prostaglandin via receptors 113, 126, 173) is in a permanent race with the damage. As long as Heavy Metals > 0, repair is fighting a steady supply of fresh injury; only after the metals are cleared (via EDTA) can Prostaglandin-driven repair finally reduce the organ damage back toward zero. This two-stage clearance — **first neutralise the toxin, then wait for repair** — is what makes Heavy Metal poisoning feel like a distinct recovery arc in-game rather than an instant-cure interaction.

### Consequences for breeders

The pairing of receptors 124 and 125 on the reproductive tract has specific consequences for breeding colonies:

- A creature exposed to Heavy Metals *before* reaching fertility produces **mutated gametes** once it matures. Those mutations are heritable.
- A long-lived contaminated creature that is allowed to breed repeatedly will seed a **persistently mutating lineage** — each successive generation rolls extra mutations until the metals are cleared or the lineage is pruned.
- Because the Creature tissue's reproductive locus is accessed every time gametes are produced, even a creature that appears healthy (organ repair keeping pace with the slow `RLOCUS_INJURY` damage) can still be generating heavily mutated offspring in the background.

For this reason experienced breeders treat any positive Heavy Metals reading on a breeder as a hard stop on mating until the Heavy Metal Cure has cleared the chemical, regardless of the creature's apparent physical health.

## Summary

```
 Chemical 66 — Heavy Metals  ("Lead, Thallium, etc.")
 -----------------------------------------------------
 Producers:   NONE internally — external only (Stinger Cookies, custom agents, CAOS)
 Consumers:   Reaction 91   (Heavy Metals + EDTA → nothing; half-life 24 ticks)

 Receptors (5):
   - RLOCUS_INJURY × 3   (genes 86, 87, 88)  — continuous multi-organ damage
   - LOC_CHANCEOFMUTATION (gene 159, thresh 128) — mutation frequency rises above ~50 %
   - LOC_DEGREEOFMUTATION (gene 160, thresh  22) — mutation severity rises above ~9 %

 Half-life:   90,682,980,616 ticks (decay rate 1.0 — effectively permanent)
 Antidote:    EDTA (chem 95), delivered by the "Heavy Metal Cure" potion

 Stock-game in-world source: Stinger Cookies (quirky cookie recipe)

 Narrative role: The game's long-term environmental toxin. Bioaccumulates,
                 damages organs broadly, and makes a contaminated creature
                 produce heavily mutated offspring. Only a specific antidote
                 (EDTA) can clear it; organ damage must then heal separately.
```

Heavy Metals is one of the most cleanly-designed chemicals in the stock genome: its chemistry (no internal production, no decay, a single specific antidote, broad multi-organ and germ-line damage) is an unusually faithful encoding of real-world heavy-metal toxicology, and it anchors an entire small loop of gameplay — Stinger Cookie → slow organ damage → mutation risk in offspring → Heavy Metal Cure potion → gradual organ recovery — that gives the Materia Medica's EDTA potion a genuine, specific role in a creature's long-term health.

## Key Source References

- `ChemicalNames.catalogue:116` — slot 66 named "Heavy Metals"
- `Libraries/creatures-chemicals.js:84` / `Tools/gen-viewer/chemicals.js:70` — chemical descriptor "Lead, Thallium, etc."
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - `:2986-3018` — reaction 91 (gene 82): Heavy Metals + EDTA → nothing
  - `:5441-5458` — receptor 111 (gene 87): organ-level `RLOCUS_INJURY`
  - `:5536-5553` — receptor 116 (gene 88): organ-level `RLOCUS_INJURY`
  - `:6600-6617` — receptor 172 (gene 86): organ-level `RLOCUS_INJURY`
  - `:5688-5705` — receptor 124 (gene 159): reproductive `LOC_CHANCEOFMUTATION`
  - `:5707-5724` — receptor 125 (gene 160): reproductive `LOC_DEGREEOFMUTATION`
  - `:8200-8206` — half-life entry: 90,682,980,616 ticks, decay rate 1.0, "Very long"
- `Assets/Catalogue/Materia Medica.catalogue:90-92` — "Heavy Metal Cure" potion description and design intent
- `Assets/Catalogue/quirky cookie recipes.catalogue:125-137` — Stinger Cookie recipe (chemicals 80/**66**/69)
- `Assets/Catalogue/ChemicalNames.catalogue:327` — player-visible "Heavy Metals" name
