# 069 - Geddonase

Geddonase is chemical slot 69 in the Creatures 3 chemistry, described in the library as **"Toxin secreted by some insects in Albia"** and listed in the game's own *Materia Medica* under the `ChemicalNames` headings alongside Heavy Metals, Cyanide and Belladonna as one of the four classic environmental toxins of Albia. Its very name — a contraction of "Armageddon" plus the enzymatic `‑ase` suffix — advertises its mode of action: Geddonase is the biochemistry's **fat-destroying enzyme**, a doomsday digestive that liquefies the creature's long-term body-fat reserve (Adipose Tissue, chem 9) directly into a small, lossy burst of Glucose. It models the real-world concept of a catabolic enzyme gone rogue, and in gameplay terms it is the poison that makes a Norn wither away even while appearing briefly energised.

Unlike most core metabolites, Geddonase has **no internal synthesis pathway** — no gene emits it, no reaction produces it, and newborn Norns have exactly zero units of it in their body. Every unit of Geddonase inside a creature came from an **external source**: the classic in-world vector is the **Stinger Cookie**, a "quirky cookie recipe" that injects Geddonase (69) together with Heavy Metals (66) when a creature eats it, modelling the toxin of a stinging insect worked into the dough. Third-party agents, poisoned food packs and direct CAOS injection are the other usual routes. Once inside the body, Geddonase runs a single destructive reaction — `1× Geddonase + 1× Adipose Tissue → 5× Glucose` — at a very short half-life (24 ticks), causes a direct injury signal via a gain-6 `RLOCUS_INJURY` receptor on the Somatic tissue, and then slowly fades out via a long passive half-life (3 024 ticks, "Long", decay 0.99977) unless further doses arrive or the creature's Adipose runs out first. There is **no dedicated stock-genome antidote** for Geddonase; clearance is either spontaneous (passive decay), attritional (burning through the victim's fat reserve until the reaction has no substrate left), or indirect (the weak multi-toxin "General Cure" potion, which does not list Geddonase among its declared targets and is essentially ineffective).

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter, no producing reaction, no starting endowment | — | — | A healthy creature is born with Geddonase = 0 and stays at 0 unless something external injects the chemical. This is the defining signature of the four "classic toxin" slots (Heavy Metals 66, Cyanide 67, Belladonna 68, Geddonase 69): the genome is pure *consumer*, never producer |
| 2 | **Stinger Cookies** (stock game) | `quirky cookie recipes.catalogue:125‑149`, tag `"Quirky Recipe 2 14 8"` | Cookie injects chemicals 80, 66 ("Geddonase and Heavy Metals" per the authorial comment) and 69 in "small quantities" (`"1"` category) on ingestion | The canonical in-world delivery route. Named after the stinging insect whose venom the cookie is modelled on. A single Stinger Cookie is not necessarily lethal, but repeated consumption strips a Norn's fat reserves while also accumulating permanent Heavy-Metals organ damage — a particularly nasty long-term poisoning profile |
| 3 | **Third-party toxic agents** (poisoned food, stings, custom COBs) | User-made `.agents` / `.cos` files | Custom scripts that `CHEM TARG 69 <amount>` on ingestion or contact | Community "nasty bug" packs and fatshaming-themed COBs commonly use chem 69 for rapid-weight-loss or "cursed food" effects because the visible phenotype of a creature losing Adipose is dramatic |
| 4 | **CAOS injection** | — | `CHEM TARG 69 <amount>` from scripts or the debug console | Useful for testing fat-branch biochemistry, receptor-85 starvation alarms, or the General Cure potion without waiting hours of wall-clock time for natural fat depletion |

Geddonase therefore joins Heavy Metals, Cyanide and Belladonna as a **chemical with no endogenous production in the standard genome** — its presence in a creature's bloodstream is always the signature of external contamination, usually food-borne.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Fat-destruction reaction** | 75 | — | Reaction 87: `1× Geddonase [69] + 1× Adipose Tissue [9] → 5× Glucose [3]` | — | — | rate 32 (half-life 24 ticks, "Short") | — | The core toxicity mechanism. One unit of Geddonase consumes one unit of Adipose (the creature's long-term fat vault) and produces just five units of Glucose — an enormously lossy conversion. A Norn's 70 baseline Adipose units × 192 Pyruvate-equivalents per unit = ~13 440 Pyruvate of latent energy, versus the 350 Glucose (× ~6 Pyruvate each = 2 100 Pyruvate) that Geddonase would extract from the same mass. The toxin **throws away roughly 85 % of the chemical energy** it destroys |
| 2 | **Injury receptor** | 147 | Organ / Somatic | RLOCUS_INJURY (locus 2) | 0 | 0 | **6** | none | Any Geddonase in the body drives the Somatic `RLOCUS_INJURY` locus linearly with a modest gain of 6. This is a *direct* toxicity channel independent of the fat-burning reaction: even if the creature has no Adipose left to react, the mere presence of Geddonase inflicts continuous low-level organ injury until the chemical decays. The low gain (6 vs. the 64‑to‑255 typical for acute toxins) reflects the fact that Geddonase's *primary* harm is the fat destruction, not direct tissue damage — the injury receptor is a secondary "this chemical shouldn't be in the body" alarm |
| 3 | **Passive decay** | — | — | Half-life **3 024 ticks** ("Long", decay rate 0.99977) | — | — | — | A creature that escapes a Geddonase source clears the chemical on its own over ~100 seconds (at 30 tps). This is identical to Cyanide's and Belladonna's passive half-life — the three acute toxins share a common "long but finite" clearance profile — but because Reaction 87 is 13× faster than the passive half-life (HL 24 vs. 3 024), virtually every Geddonase molecule is consumed by fat-destruction long before passive decay can touch it. Passive decay only matters when the creature has run out of Adipose |

There is **no dedicated cure reaction** for Geddonase in the stock genome. Unlike Cyanide (Sodium thiosulphite antidote, HL 4) or Heavy Metals (EDTA chelation, HL 2), chemical 69 has no paired neutraliser; once ingested, the only ways it leaves the body are (a) burning through Adipose Tissue via Reaction 87, (b) slow passive decay, or (c) coincidental indirect effects of the very weak "General Cure" multi-toxin potion (which does not list Geddonase among its declared targets, making its effectiveness against chem 69 effectively zero in practice).

## Role in Game Mechanics

### The lossy fat-destruction reaction

Reaction 87 (gene 75) is the defining mechanic of Geddonase. Its formula is:

```
 1× Geddonase [69]  +  1× Adipose Tissue [9]   →   5× Glucose [3]  +  (nothing)
```

Both reactants are consumed 1 : 1 — Geddonase is **not** a catalyst (unlike Cyanide, which regenerates itself). Each Geddonase molecule destroys exactly one Adipose molecule and then disappears. At genome value 32 the reaction half-life is just **24 ticks (~0.8 s at 30 tps)**, short enough that a Geddonase dose is almost entirely burnt off through Reaction 87 within a handful of seconds *provided the victim has Adipose to spare*. If Adipose is exhausted, the remaining Geddonase idles in the bloodstream and slowly fades via the 3 024-tick passive half-life instead, continuing to inflict its injury-receptor damage the whole time.

The 1 : 5 ratio of Adipose → Glucose is deceptively generous on first reading, but the numbers are catastrophic. One unit of Adipose normally yields, through the full β-oxidation cascade (reactions 16 → 15 → 17 → glycolysis), roughly **192 Pyruvate + 144 ATP**. Geddonase cuts that yield down to just 5 Glucose, each of which can be further broken down to ~6 Pyruvate via Reaction 5, for a total of ~30 Pyruvate — **only about 15 % of the metabolic energy** the normal pathway would have extracted. The rest is chemically lost; the Norn's body pays the full cost of demolishing the fat vault but sees only a small fraction of the usable fuel on the other side.

In gameplay terms this produces a very characteristic phenotype:

1. **Brief deceptive energy spike.** The burst of Glucose from Reaction 87 feeds directly into glycolysis and the ATP pathway. A Norn who has just ingested Geddonase may initially appear more energetic as its Glucose pool rises — more willing to move, speak, or play.
2. **Rapid visible weight loss.** The same creature is simultaneously losing Adipose very fast. Because Reaction 87 (HL 24) runs at roughly **2× the speed of the normal lipolysis pathway** (Reaction 16, HL 47), the fat vault empties noticeably faster than even active starvation would drain it.
3. **Delayed energy crash.** Once the Glucose spike is metabolised and the fat reserve is gone, the starvation alarm (receptor 85 on Adipose, at Circulatory locus 0, threshold 3.1 %) fires hard. The creature transitions abruptly from "unusually energetic" to "visibly skinny and metabolically failing" — a textbook example of a poison that eats the body from the inside.

### The injury-receptor damage channel

Receptor 42 (gene 147) wires Geddonase into the **Organ / Somatic tissue at locus 2 (`RLOCUS_INJURY`)** with threshold 0, nominal 0 and gain **6**. The flags are `none`, so the receptor runs in its ordinary analogue mode: the injury locus is driven linearly by the Geddonase concentration scaled by gain 6. This is a *direct* toxicity channel that is independent of Reaction 87:

- Unlike Reaction 87, which requires Adipose as a substrate, the injury receptor fires whenever Geddonase is present regardless of whether any fat is being destroyed.
- Unlike a typical acute toxin's injury receptor (gain 64–255), Geddonase's injury output is deliberately **small** (gain 6). The genome's design intent is clear: Geddonase harms the body primarily through its *metabolic* action (fat destruction); the injury channel is a secondary "foreign substance" alarm rather than the main damage mechanism.
- Because it is on the **Somatic** tissue (tissue 0) of the Organ organ (organ 2) rather than the Creature organ, the damage is generic body-wide injury rather than targeted at a specific organ such as the liver or heart. This is consistent with Geddonase's thematic role as a whole-body catabolic chemical rather than an organ-specific poison.

Taken together with Reaction 87, Geddonase has a two-pronged attack on the creature:

1. Reaction 87 burns through the strategic fat reserve, producing a temporary energy spike followed by a starvation crash.
2. Receptor 42 drips low-grade injury onto the Somatic tissue the whole time the chemical is present.

### Why there is no antidote

The three other acute toxins (Cyanide, Heavy Metals, Belladonna) each have a specific cure reaction wired into the genome and a matching potion in the Materia Medica:

| Toxin | Cure reactant | Cure reaction HL | Stock potion |
|-------|---------------|------------------|--------------|
| Heavy Metals [66] | EDTA [95] | 2 ticks | Heavy Metal Cure |
| Cyanide [67] | Sodium thiosulphite [96] | 4 ticks | Cyanide Cure |
| Belladonna [68] | Magic Word [105] | (see gene) | (implicit) |
| **Geddonase [69]** | **— (none)** | **— (none)** | **— (none)** |

Geddonase is the only member of the classic-toxin quartet with **no dedicated cure pathway**. This reflects a deliberate design choice: because Reaction 87 itself clears Geddonase very quickly (HL 24), the chemical is effectively *self-consuming* as long as the victim has Adipose to spare. The "cure" is the creature's own fat reserve being sacrificed to neutralise the toxin — a visceral, biologically-grounded trade-off. Only when the fat reserve is exhausted does Geddonase linger, and at that point the creature's bigger problem is no longer the toxin but the starvation it has induced.

The **General Cure** potion lists its targets as *"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"* — Geddonase is conspicuously absent. In practice there is no effective pharmacological intervention for a Geddonase-poisoned creature; the player's best options are (a) feeding the creature large amounts of fatty food to race more Adipose into the vault than the toxin can destroy, and (b) isolating the creature from further exposure and waiting out the passive half-life once its Adipose is gone.

### Stinger Cookies — the canonical delivery vehicle

The stock game's in-world source for Geddonase is the **Stinger Cookie**, defined in `quirky cookie recipes.catalogue` under tag `"Quirky Recipe 2 14 8"`:

```
"80"                # (quantity / chemical category flag)
"66"  # Geddonase and Heavy Metals   ← authorial comment
"69"                # (second chemical slot: Geddonase)
"0"
"1"   # Small quantities
"1"
…
"rotorfly" # stinger ;)
```

The in-file comment `# Geddonase and Heavy Metals` makes the author's intent explicit: the cookie is a deliberate **paired-toxin** delivery, combining the acute fat-destruction of Geddonase with the chronic organ-damage of Heavy Metals. The `"rotorfly"` sprite and the `# stinger ;)` comment place it in the bestiary as the venom of a Rotorfly — the stinging insect whose bite canonically produces this cookie's effect if worked into food. The "small quantities" flag (`"1"`) and the pairing with Heavy Metals (slowly-accumulating, never-clearing organ damage) make the cookie an insidious long-term threat rather than a single-dose killer: a Norn who eats one Stinger Cookie will lose noticeable Adipose but usually survive; a Norn who habitually eats them over days of play will slowly emaciate while also accumulating permanent organ injury.

### Why the reaction is so fast but the passive decay is so slow

The 2-order-of-magnitude mismatch between Reaction 87's half-life (24 ticks) and the passive half-life (3 024 ticks) looks odd at first glance but is structurally meaningful:

- **Fast Reaction 87** ensures that whenever the victim *has* Adipose, the toxin consumes itself quickly. The damage is therefore front-loaded: a Geddonase dose does most of its harm in the first few seconds after ingestion, during which a matching amount of Adipose is destroyed.
- **Slow passive decay** ensures that once the fat vault runs empty, the Geddonase that remains does not disappear immediately. A Norn who has lost all its Adipose to the toxin continues to carry a gradually-fading Geddonase load for another ~100 seconds, during which the gain-6 injury receptor continues to fire — a lingering "you have been poisoned" signal that prevents a creature from instantly recovering once the fat is gone.

The two half-lives together produce the characteristic Geddonase curve: a **sharp fat crash** in the first seconds, followed by a **long injury tail** as residual toxin fades. This is quite unlike Cyanide (fast, symmetric, cleanly reversible) or Heavy Metals (slow, chronic, permanent) — Geddonase carves out its own niche as the toxin that *eats its victim alive* in a visible, phenotypically dramatic way.

### Interaction with the starvation alarm (receptor 85)

Because Reaction 87 pulls Adipose down hard and fast, Geddonase is the quickest stock-genome route to tripping the Adipose-depletion alarm on receptor 85 (Creature / Circulatory tissue / locus 0, threshold 8/256 ≈ 3.1 %, DIGITAL + REDUCE, nominal 255, gain 255). A large Geddonase dose can drive a Norn from a healthy ~27 % Adipose concentration down below the 3.1 % threshold in seconds, snapping the alarm from off to full-strength. Once the alarm is firing the creature is flagged as critically underweight by any genome pathway downstream of that Circulatory signal — typically coupling to visible "emaciated" pose/tint rules, hunger-drive reinforcement, or Energy-crash cascades that eventually lead to collapse or death.

From the player's perspective this means a Geddonase-poisoned Norn often **looks fine right up until it doesn't**. The fat loss is invisible under the sprite's normal body pose for the first few seconds; then the starvation alarm trips, the phenotype changes suddenly, and within another few seconds the creature is curled up, distressed, or falling unconscious as its Energy pool — now cut off from its main reserve — collapses.

### Recovery profile

A creature that survives a single Geddonase dose has a long road back:

1. **Adipose rebuild is slow.** Even under aggressive overfeeding, the Pyruvate → Fatty Acid → Triglyceride → Adipose chain takes cumulative half-lives of 621 × 3 ≈ 1 860 ticks (~62 s) to add meaningful new Adipose, and many multiples of that to return to a safe reserve. A Norn who has lost its fat vault to Geddonase will be vulnerable to the starvation alarm for minutes or tens of minutes of real time.
2. **No organ damage (unlike Heavy Metals).** Receptor 42 drives `RLOCUS_INJURY` but only while Geddonase is present. Once the chemical is cleared (through Reaction 87 or passive decay), the injury source disappears and the body's normal repair/healing mechanics can restore the affected tissue. Unlike Heavy Metals there is **no permanent organ damage** waiting after the acute phase.
3. **Energy recovery is normal.** Because Geddonase does not attack the Energy pool directly (unlike Cyanide's catalytic energy-destruction), an un-starved victim will rebuild its Energy stores at the normal metabolic pace once Adipose is replenished.

The net shape of a Geddonase recovery is therefore "rebuild the fat vault, then everything else follows". Feeding the creature fat-heavy food (Cheese, butter, high-fat feeders) accelerates recovery because those foods enter directly as Triglyceride and skip the slow Pyruvate → FA build-up step.

### Thematic role — the catabolic doomsday

The chemical's name encodes its design role: "Gedd-onase" is *Arm-**ageddon** + **enzym**-**ase***. Where Cyanide attacks the cell's ability to *use* fuel, Heavy Metals attack the organs that *produce* fuel, and Belladonna attacks the nervous system that *controls* fuel consumption, Geddonase attacks the **fuel reserve itself** — the fat vault that is the Norn's insurance policy against neglect. It is the apocalyptic chemical in a very literal sense: its purpose is to burn down the body's strategic reserve from within. The lossy 5 : 1 yield ratio emphasises the theme of *waste*; the short reaction half-life emphasises the theme of *suddenness*; the absence of any cure emphasises the theme of *irreversibility*.

In genome-design terms Geddonase is also an elegant illustration of how a single line of biochemistry (one reaction, one receptor, one half-life entry) can produce a rich, gameplay-legible toxicity phenotype without any direct scripting. The whole behaviour — the deceptive energy spike, the rapid emaciation, the alarm snap, the long injury tail, the slow and difficult recovery — emerges from the interaction of Reaction 87 with the pre-existing fat-branch metabolism (reactions 10, 15, 16, 17) and the Adipose starvation alarm (receptor 85) documented with chemical 9.

## Summary

```
 Chemical 69 — Geddonase  ("Toxin secreted by some insects in Albia")
 ---------------------------------------------------------------------
 Producers:   NONE internally — external only (Stinger Cookies, custom agents, CAOS)
 Consumers:   Reaction 87   (1× Geddonase + 1× Adipose → 5× Glucose;
                             half-life 24 ticks, "Short", 1:1 consumed)

 Receptors (1):
   - Organ / Somatic tissue / RLOCUS_INJURY  (gene 147)
       threshold 0, nominal 0, gain 6, flags none
       → continuous low-grade body-wide injury while Geddonase is present

 Half-life:   3 024 ticks (~100 s at 30 tps, decay 0.99977 — "Long")
 Antidote:    NONE — no cure reaction, not listed by General Cure
              Effective clearance is via Reaction 87 burning through Adipose

 Stock-game in-world source: Stinger Cookies
                             (quirky cookie recipes.catalogue,
                              tag "Quirky Recipe 2 14 8", Rotorfly sprite)

 Narrative role: The catabolic doomsday toxin. Burns the creature's
                 long-term fat reserve (Adipose Tissue) directly into
                 a small, lossy burst of Glucose. Produces a deceptive
                 brief energy spike followed by rapid visible weight
                 loss, a starvation-alarm snap, and a long injury tail.
                 Has no pharmacological cure — the only defences are
                 avoidance, overfeeding with fatty food to outrun the
                 destruction, and time for the body to rebuild the
                 fat vault from scratch.
```

Geddonase fills a deliberately different gameplay niche from the other stock toxins: it is **fast**, **acutely dangerous**, **visibly dramatic**, and **uncurable by potion**. The fat-destruction reaction is an unusually expressive piece of biochemistry — a single line of genome data (Reaction 87, with Adipose on the left and Glucose on the right at a 1 : 5 ratio) captures the defining feature of a catabolic enzyme going rogue in a way that propagates naturally through the rest of the fat-branch metabolism. Paired with Heavy Metals' organ-damage profile, Cyanide's energy-destruction profile and Belladonna's neurological profile, Geddonase completes the classic four-toxin palette of Albia: each chemical attacks a different critical axis of the body (fuel reserve, organs, energy currency, nervous system), each has a different temporal signature, and together they give the stock game a genuinely varied and biologically-grounded toxin repertoire.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:87` — chemical descriptor "Toxin secreted by some insects in Albia"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - `:2854–2886` — reaction 87 (gene 75): `1× Geddonase [69] + 1× Adipose Tissue [9] → 5× Glucose [3]`, rate 32, half-life 24 ticks ("Short")
  - `:4130–4148` — receptor 42 (gene 147): Organ / Somatic / RLOCUS_INJURY, Geddonase threshold 0, nominal 0, gain 6, flags none
  - `:8224–8231` — half-life entry: 3 024 ticks, decay rate 0.99977, "Long"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:330` — player-visible "Geddonase" name, grouped with Heavy Metals / Cyanide / Belladonna under the classic-toxin quartet
- `Rebuild/Assets/Catalogue/quirky cookie recipes.catalogue:125–149` — "Stinger Cookie" recipe, tag `"Quirky Recipe 2 14 8"`, pairing Geddonase (69) with Heavy Metals (66) on a Rotorfly ("stinger") sprite
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:119` — slot 69 named "Geddonase"
- `Rebuild/DOCUMENTATION/chemicals/009 - Adipose Tissue.md` — companion analysis of the fat-branch metabolism that Geddonase attacks (reactions 10, 15, 16, 17; receptor 85 starvation alarm)
- `Rebuild/DOCUMENTATION/chemicals/067 - Cyanide.md` — companion analysis of the parallel acute-toxin slot, illustrating the contrasting "has an antidote" design pattern
