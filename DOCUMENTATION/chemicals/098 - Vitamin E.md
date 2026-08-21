# 098 - Vitamin E

Vitamin E is chemical slot 98 in the Creatures 3 chemistry, listed in the library (`Rebuild/Libraries/creatures-chemicals.js:122`) with no descriptive tagline and displayed to the player simply as **"Vitamin E"** in `ChemicalNames.catalogue:154`. The name is borrowed from the real-world fat-soluble vitamin (α-tocopherol), a classic anti-oxidant and general "vitality" nutrient in folk nutrition. In Creatures 3, however, Vitamin E is **functionally a placeholder**: the stock genome wires it with **no reactions, no receptors, no emitters and no organ involvement whatsoever**, and its only appearance in biochemistry.json is the half-life / decay-rate entry that gives it an essentially infinite residence time in the bloodstream. It is one of the **inert, flavour-only** chemicals in the C3 pharmacopoeia — a chemical that can be injected and measured on the chemistry panel but that has **no mechanical effect** on the creature.

Vitamin E has **no endogenous production** in the standard genome — no emitter, no synthesising reaction, no organ that releases it — so every molecule present inside a creature's bloodstream arrives from **outside** the body, delivered exclusively by the **Vitamin Potion** from the Medicine Maker / Materia Medica (`scrp 2 25 20 12`, `medicine maker.cos:661–673`). Once injected, it simply **sits** in the bloodstream: its half-life of **90,682,980,616 ticks** (about 95 000 years of real play at 30 tps) combined with its decay rate of 1.0 ("Very long") means it never meaningfully decays on biological timescales. There is no receptor to read it, no reaction to consume it and no emitter to balance it, so whatever Vitamin E the player injects stays there essentially forever — a permanent marker in the chemistry graph with no other consequence.

The disconnect between the player-facing flavour ("Vitamin Potion… enriches the health of a Creature, helping it maintain strength and vitality") and the actual wiring (no health, no vitality, no strength effect — just an inert tracer) is one of the more interesting fossils in the C3 catalogues. The *Materia Medica* even describes the Vitamin Potion as "*containing Vitamins C & D*" despite the actual script injecting chemicals 98 (Vitamin E) and 99 (Vitamin C) — Vitamin D is not a separate slot at all. The likeliest explanation is that Vitamin E was reserved as a nutrient slot carried over from the earlier Creatures titles' biochemistry and never rewired when the C3 repair/vitality mechanics were consolidated onto Prostaglandin (94) and the Life / Energy / Glucose axes. The slot is retained for backward compatibility, potion aesthetics, and potential extension by third-party genomes or agents.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter and no producing reaction in the standard genome | — | — | A healthy creature is born with Vitamin E = 0 and stays at 0 forever unless something external injects the chemical. The body cannot synthesise it and does not accumulate it from diet |
| 2 | **Vitamin Potion** (Materia Medica) | Medicine Maker potion — `scrp 2 25 20 12` (`Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:661–673`, family/genus/species `2 25 20`) | Drinking the potion runs `chem 98 .35` (0.35 units), bundled with `chem 99 .35` Vitamin C, `chem 94 .15` Prostaglandin and `chem 3 .05` Glucose | The **only canonical delivery route** for Vitamin E in the stock game. The Materia Medica entry (`Materia Medica.catalogue:134–136`) reads: *"Keep your Creatures happy and healthy with this Vitamin Potion. It contains Vitamins C & D which enrich the health of a Creature, helping it maintain strength and vitality."* The "strength and vitality" effect that the player observes comes entirely from the Prostaglandin (repair-rate boost) and Glucose (energy) components of the bundle — Vitamin E itself does nothing on ingestion |
| 3 | **Third-party / CAOS injection** | User-made `.agents` files, debug console, custom genomes | Custom scripts that `CHEM TARG 98 <amount>`, or new reactions / emitters inserted into a modded genome | Because the slot is unused by stock chemistry it is a convenient **"free" chemical** for community designers wishing to add a long-lived nutrient, loyalty tracker or time-marker without disturbing any existing system. Several community biochemistry mods repurpose Vitamin E as a custom signalling or store chemical |

Vitamin E is therefore a **pure external-delivery chemical** whose only canonical source is the Vitamin Potion, and a **terminal chemical** whose only fate in the body is to sit there indefinitely because nothing consumes it and its decay is negligible.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **No reactions** | — | — | — | — | — | — | — | Vitamin E is not a reactant or product of any of the 270+ reactions in the stock biochemistry. It is never converted, transformed, catalysed, neutralised or destroyed by any stock chemistry |
| 2 | **No receptors** | — | — | — | — | — | — | — | The chemical has no sensors anywhere in the body. It does not trigger drives, it is not read by the brain, it does not modulate reaction rates, it does not drive repair, and it has no REDUCE / injury effects. The creature cannot perceive Vitamin E at all |
| 3 | **No emitters** | — | — | — | — | — | — | — | No organ emits Vitamin E under any circumstance. It cannot be released by metabolism, stress, injury, digestion or any other internal process |
| 4 | **Passive decay (negligible)** | — | — | Half-life **90,682,980,616 ticks** ("Very long", decay rate 1.0) | — | — | — | — | Nominally the chemical decays, but at decay rate 1.0 with a half-life measured in the tens of billions of ticks the clearance is effectively zero on any play-session timescale. A dose of Vitamin E injected at birth would still be present, to within floating-point error, at the end of a creature's entire life |

With no reactions, no receptors, no emitters and no meaningful decay, Vitamin E's biochemistry is the **simplest possible**: it is a passive, permanent chemical tracer whose level in the bloodstream is set only by external injection and never changes thereafter.

## Role in Game Mechanics

### The "placeholder chemical" pattern

Creatures 3's chemistry engine supports up to 256 chemical slots (0–255), and the stock genome fills a large majority of them with active reactions, receptors or emitters. A handful of slots, however, are reserved but **not wired**: they exist in the chemical catalogue and can be named, injected and graphed, but they participate in no biological process. Vitamin E (98) is the archetypal example of this pattern. It shares the pattern with Vitamin C (99) — which is likewise inert in the stock genome — and a few of the antigen / antibody free slots.

Placeholder chemicals serve several practical purposes in the engine design:

1. **Backward compatibility / lineage markers.** Earlier titles in the Creatures series (C1, C2) used different chemistry sets; some slot names were preserved in C3 for continuity even when the underlying mechanic was redesigned or moved to another slot. The "vitamin" nomenclature is a clear example: in C3 the functional "vitamin" role (anti-oxidant, repair-rate, immune modulation) is concentrated on Prostaglandin (94), Anti-oxidant (93) and Medicine one (92), while the "Vitamin E" and "Vitamin C" names are retained without wiring.
2. **Flavour for potions.** A player-facing potion like the "Vitamin Potion" benefits from the narrative presence of named vitamins even if those vitamins have no mechanical effect. Bundling Vitamin E and Vitamin C with *actually-active* chemicals (Prostaglandin and Glucose) gives the potion a plausible real-world nutritional framing while the mechanical benefit is delivered by the active components.
3. **Headroom for genetic engineering.** An unused slot is a free resource for third-party developers who wish to extend the chemistry without colliding with stock mechanics. A modded genome can add a Vitamin E receptor, an emitter tied to specific foods, or a reaction that consumes it, and all such modifications are guaranteed not to conflict with any stock pathway.
4. **Cosmetic chemical-panel tracking.** Players who watch the chemistry graph during experiments can use an inert tracer like Vitamin E as a timestamp — inject it at a known moment, and its level on the graph remains a stable reference line against which other chemicals can be compared — without the tracer itself perturbing the creature.

### The "Very long" half-life — an effectively immortal chemical

The half-life entry for Vitamin E in `biochemistry.json:8432–8438` is one of the two most extreme decay profiles in the entire chemistry set (shared with Vitamin C, chem 99):

```
halfLifeInTicks: 90,682,980,616
decayRate:       1.0
speed:           "Very long"
```

At 30 ticks per second, 90.68 billion ticks is approximately **96 000 years** of continuous play — in practice, a decay so slow that a dose of Vitamin E injected at birth is still present at the end of any real-world play session. The per-tick clearance is below the floating-point precision of the chemistry engine's 0–255 normalised concentration scale, so the chemical effectively **never goes away**.

This infinite-residence profile is the stock engine's way of modelling a chemical that the design intent wants to be **"accumulated for life"** rather than metabolised. Conceptually, Vitamin E is meant to be something the creature stores up as lifetime reserve — one dose at birth would last forever. In practice, because nothing reads the chemical, the "reserve" is a reserve of nothing; but the decay tuning is consistent with the conceptual design of a fat-soluble vitamin that the body sequesters rather than processes.

Compare this with the decay profiles of the active pharmacological chemicals:

| Chemical | Speed class | Half-life (ticks) | Real-time | Residence design |
|----------|-------------|-------------------|-----------|------------------|
| Sodium thiosulphite (96) | Medium | 621 | ~20 s | Discrete antidote for single-exposure toxin |
| Arnica (97) | Long | 6,045 | ~3.4 min | Sustained antidote for chronic bacterial toxin |
| EDTA (95) | Very long | ~24,155 | ~13 min | Slow heavy-metals chelator |
| **Vitamin E (98)** | **Very long** | **90,682,980,616** | **~96 000 years** | **Permanent lifetime reserve (inert)** |
| **Vitamin C (99)** | **Very long** | **90,682,980,616** | **~96 000 years** | **Permanent lifetime reserve (inert)** |

Vitamin E / Vitamin C sit far beyond the end of the active-antidote spectrum, in the "effectively immortal" regime shared with a handful of structural / store chemicals. The practical consequence is that the chemistry panel for a creature that has ever drunk a Vitamin Potion will show a non-zero Vitamin E line forever — a permanent mark of "this creature has been dosed".

### The Vitamin Potion — the only delivery vehicle

The **Vitamin Potion** (family/genus/species `2 25 20`) is the sole canonical source of Vitamin E in the stock game. It is implemented at `medicine maker.cos:661–673`:

```
scrp 2 25 20 12
    seta va16 from
    snde "drnk"
    inst
    targ va16
    chem 98 .35          ; Vitamin E
    chem 99 .35          ; Vitamin C
    chem 94 .15          ; Prostaglandin
    chem 3  .05          ; Glucose
    slow
    targ ownr
    kill ownr
endm
```

Drinking the potion injects a fixed cocktail into the creature's bloodstream and destroys the bottle. The **mechanical** effect of the potion comes entirely from:

- **0.15 Prostaglandin (94)**: a short boost to every organ's repair rate via `RLOCUS_RATEOFREPAIR`, helping damaged tissue heal toward its long-term life-force baseline for the duration of the Prostaglandin pulse.
- **0.05 Glucose (3)**: a small top-up to the energy chemistry, contributing to ATP synthesis and reducing hunger for glucose.

The **0.35 Vitamin E and 0.35 Vitamin C** are inert on the creature's physiology. They contribute to the potion's narrative description ("vitamins that enrich health, strength and vitality") but deliver **no measurable biochemical benefit** beyond showing up on the chemistry graph.

The *Materia Medica* (`Materia Medica.catalogue:134–136`) describes the potion as:

> *"Keep your Creatures happy and healthy with this Vitamin Potion. It contains Vitamins C & D which enrich the health of a Creature, helping it maintain strength and vitality."*

This text contains two quiet inconsistencies worth noting:

- The description mentions **"Vitamin D"**, but no chemical slot named Vitamin D exists — the actual injection is Vitamin E (98). This is almost certainly a copy-editing slip from a design document that once distinguished D and E separately.
- The description promises **health, strength and vitality** benefits, but all observable benefits come from Prostaglandin + Glucose, not from the vitamins themselves. The vitamins provide the *name* of the potion; the non-vitamin components do the *work*.

Despite these fossils, the potion is mechanically useful in-game — the Prostaglandin pulse accelerates recovery from any organ damage — so players who use it are not being cheated; they are simply getting their benefit from a different mechanism than the label implies.

### Behavioural invisibility

Because Vitamin E has no receptors and no emitter, it has **no direct behavioural consequences**. A creature does not:

- Feel a drive for it (no "need vitamins" drive).
- Learn that a particular object produces it (no classifier stimulus tied to chem 98).
- Experience pain, pleasure, sleepiness, hunger, warmth or any mood shift from its presence.
- Show any animation, posture or voice change on receiving the dose.
- Become stronger, faster, healthier, or more disease-resistant when Vitamin E is high.
- Become weak, sick or unhappy when Vitamin E is low (a creature with Vitamin E = 0 for life is perfectly normal).

Any observable behavioural recovery that follows the Vitamin Potion therefore comes from the **Prostaglandin** (healing) and **Glucose** (energy) components of the bundle, not from the vitamins themselves. This makes Vitamin E **chemically silent**: the creature is not aware of it, does not respond to it, and its presence or absence cannot be inferred from observing the creature's behaviour.

### Why the slot is retained despite being unused

A game designer looking at this slot might reasonably ask why Cyberlife preserved it at all. Four answers apply:

1. **Genome stability.** The C3 genome format has fixed slot numbers for chemicals, and breaking changes to the slot map would invalidate every existing genome, save file and community mod. Keeping slot 98 reserved — even if unused — lets legacy C1/C2 content import without renumbering, and lets community biochemistry mods use the slot safely.
2. **Player-facing narrative continuity.** The name "Vitamin E" carries immediate real-world resonance that "slot 98" does not. A potion containing a "Vitamin E + Vitamin C + Prostaglandin" cocktail sounds like a familiar multivitamin remedy even if only the Prostaglandin is mechanically active. Removing the vitamins would force a renaming of the Vitamin Potion or a substantive redesign of its script.
3. **Design-time hooks for future expansion.** During development, a slot reserved-but-unused is a deliberate architectural hook for future mechanics. Vitamin E could plausibly be wired, in a future update or expansion pack, to modulate fertility, immune response, or anti-oxidant chemistry — all traditional real-world roles of α-tocopherol. The slot is a placeholder for mechanics that were scoped out of 1999's Creatures 3 but might return.
4. **Community modding surface.** Unused chemical slots are prime territory for third-party biochemistry designers. A modded Norn genome that adds a Vitamin E receptor — say, to boost immune system rates or to dampen somatic oxidative stress — can do so without colliding with any stock chemistry. The slot is a **gift to the modding community**, and several community biochemistry packs have indeed wired Vitamin E into custom pathways.

### Interaction with the wider chemistry

Because Vitamin E participates in no stock reaction and no stock receptor, it has **no direct interactions** with any other chemical. It cannot:

- Displace, compete with, or antagonise any other chemical (no shared receptors).
- Be produced from, or converted into, any other chemical (no reactions).
- Modulate the rates or thresholds of any receptor or reaction (no catalytic role).
- Contribute to, or subtract from, any drive (no drive receptors).
- Act as a substrate, product, catalyst, or inhibitor anywhere in the stock genome.

Its **indirect** interactions are limited to those of its potion cocktail-mates:

- **Vitamin C (99)**: bundled in the same potion at the same dose, also inert, identical decay profile.
- **Prostaglandin (94)**: bundled alongside at 0.15 units, providing the potion's actual healing effect.
- **Glucose (3)**: bundled alongside at 0.05 units, providing a minor energy top-up.

These co-administered chemicals do their own work entirely independently of Vitamin E; the only "interaction" is that they share the same bottle and arrive at the same moment.

### Testing and experimentation

For genetic engineers and agent designers, Vitamin E's complete inertness makes it an **ideal diagnostic tracer**. Common uses in testing harnesses:

- **Chemistry panel calibration.** Inject a known dose and verify the chemistry graph reads back the expected level — because nothing consumes or emits it, the reading reflects purely the injection / decay arithmetic of the engine.
- **Timestamping experiments.** Inject a pulse at the start of a test session and record it as a time-reference on chemistry recordings; its near-zero decay means the reference line remains essentially flat across the entire session.
- **Delivery-script verification.** Test new medicine agents by including a Vitamin E pulse and confirming it arrives in the target creature; a successful pulse confirms the agent's CAOS delivery mechanism without side-effects that might confuse interpretation.
- **Generational continuity tracking.** Because the chemical is not reset by any natural biological process, dosing a parent and tracking its descendants can illuminate what genetic traits pass on — though in practice Vitamin E is *not* inherited (chemicals are not gene-carriers; only the genome transmits), so this test confirms that the chemical is **not** hereditary.

### Edge cases and failure modes

A handful of edge cases are worth noting for agent designers and genetic engineers:

- **Over-dosing has no ill effects.** The chemical has no receptors to over-stimulate and no toxic threshold. A creature saturated with Vitamin E = 255 is biochemically identical to a creature with Vitamin E = 0.
- **Under-dosing is the default state** and is not a deficiency. A creature that never drinks a Vitamin Potion has zero Vitamin E for its entire life and exhibits no deficiency symptoms — there are none.
- **Heritability is zero.** Chemicals are runtime state, not genotype. Parents that drank Vitamin Potions do not pass the Vitamin E to their offspring; each newborn starts at zero regardless of parental history.
- **Mutation of the decay rate** (via genetic manipulation of the half-life entry) to a faster decay would make Vitamin E clear in a finite time, but because nothing reads the level, the change would have no observable biological consequence — only the chemistry graph would show the decline.
- **Adding a custom receptor** in a modded genome is the canonical way to give Vitamin E a mechanical role. Common community wirings include: anti-oxidant scavenger tied to Oxygen / Stress chemistry, fertility modulator tied to Oestrogen / Progesterone / Testosterone, and immune booster tied to antibody production rates.
- **Adding a custom reaction** that consumes Vitamin E is another straightforward extension — for example, a slow `Vitamin E → Anti-oxidant` conversion would make the potion deliver its real-world function of providing a slow-release anti-oxidant reserve.

## Summary

```
 Chemical 98 — Vitamin E  (Materia Medica: part of the "Vitamin Potion",
                           labelled with the real-world vitamin name but
                           mechanically inert in the stock genome)
 ------------------------------------------------------------------------------------
 Producers:   NONE internally — external only
              (Vitamin Potion, family/genus/species 2 25 20, 0.35-unit dose)

 Consumers:   NONE — no reactions consume Vitamin E

 Receptors:   NONE — chemical is behaviourally and biologically invisible

 Emitters:    NONE — no organ releases Vitamin E

 Half-life:   90,682,980,616 ticks (~96 000 years at 30 tps, decay rate 1.0 —
              "Very long"; effectively immortal)

 Delivery:    Vitamin Potion (0.35 units, bundled with Vitamin C 0.35,
              Prostaglandin 0.15, Glucose 0.05)

 Narrative role: A flavour / placeholder chemical. Named after the real-world
                 fat-soluble vitamin and carried across from earlier Creatures
                 titles' chemistry sets, but not wired into any C3 mechanic.
                 Its presence in the "Vitamin Potion" cocktail gives the potion
                 its multivitamin framing while the actual mechanical benefits
                 (accelerated organ repair + minor energy top-up) come from
                 the Prostaglandin and Glucose components. A prime candidate
                 slot for community biochemistry mods that need a free,
                 guaranteed-non-colliding chemical channel.
```

Vitamin E is a study in **intentional inertness**. The slot is fully registered in the chemical catalogue, available to the player via a named potion, and tracked on the chemistry graph — yet it is wired to nothing, reacts with nothing, is sensed by nothing, and decays on geological timescales. That design is not an oversight but a reserved hook: a genome-stable, legacy-compatible, modding-friendly placeholder whose mechanical silence is itself the feature. In the richly-interconnected Creatures 3 biochemistry — where most chemicals are tangled into multiple reactions, receptors and emitters — Vitamin E stands out as a reminder that the engine also supports the zero-interaction case, and that a chemical can meaningfully exist in the catalogue without doing anything at all.

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:154` — slot 98 named "Vitamin E" (player-visible name)
- `Rebuild/Libraries/creatures-chemicals.js:122` — chemical descriptor `{ id: 98, name: 'Vitamin E', description: '' }`
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json`:
  - `:8432–8438` — half-life entry: 90,682,980,616 ticks, decay rate 1.0, "Very long"
  - No reaction entries — chemical is never a reactant or product anywhere
  - No emitter entries — chemical has no internal production pathway
  - No receptor entries — chemical has no sensors anywhere in the body
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:134–136` — "Vitamin Potion" player-facing description ("enriches the health of a Creature, helping it maintain strength and vitality"; mentions "Vitamins C & D" despite the script delivering Vitamin E and Vitamin C)
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:365` — potion ingredient label "Vitamin E"
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:661–673` — `scrp 2 25 20 12` handler for the Vitamin Potion, injects `chem 98 .35` alongside Vitamin C, Prostaglandin and Glucose
- `Rebuild/DOCUMENTATION/chemicals/094 - Prostaglandin.md` — documentation for the actually-active healing chemical bundled with Vitamin E in the Vitamin Potion, explaining the true mechanism of the potion's "vitality" benefit
