# 099 - Vitamin C

Vitamin C is chemical slot 99, the last entry in the Creatures 3 "Medicine / vitamins" band of the chemistry register (`Rebuild/Libraries/creatures-chemicals.js:123`, `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:155`). Unlike its immediate neighbour **Vitamin E** (98) — which is a completely inert placeholder — Vitamin C is genuinely *wired* into the stock genome. It has no emitters, no synthesising reaction and no decay path, so every molecule of it comes from outside the body, but once inside it acts as a **multi-target catalytic modulator**: nine stock receptors read its bloodstream concentration and use it to modulate the *rates* of eight different chemical reactions plus the *clockrate* of one organ. The design shape matches real-world folk-nutrition conceptions of ascorbic acid as an "immune booster" — Vitamin C arrives from the outside, never accumulates endogenously, persists effectively forever once delivered, and while it is present it speeds up the reactions that matter most to a sick or recovering creature.

Vitamin C has **no endogenous source** in the stock genome: no organ emits it, no reaction produces it, and no food or metabolite is converted into it. It enters the bloodstream exclusively through **CAOS `CHEM` injection**, and in the stock game this happens only one way — the player hand-feeds the creature a **Vitamin Potion** from the Medicine Maker / Materia Medica (`scrp 2 25 20 12`, `medicine maker.cos:661–673`), which injects `chem 99 .35` alongside `chem 98 .35` (Vitamin E), `chem 94 .15` (Prostaglandin) and `chem 3 .05` (Glucose). Once delivered, Vitamin C sits in the blood with a **half-life of 90,682,980,616 ticks** (decay rate 1.0, "Very long") — at 30 tps that is about 96 000 years of continuous play, far beyond the precision floor of the 0–255 chemistry scale. In practice this means a single dose at birth is still effectively intact at natural death. A creature that has ever drunk a Vitamin Potion carries a permanent Vitamin C tracer in its bloodstream until it dies.

While Vitamin C is present, the nine receptors that read it fire continuously, modulating eight reaction rates in the Reaction pseudo-organ and the clockrate of an internal organ. Because those receptors all use threshold 0, even a tiny residual dose is enough to switch their output from the "nominal only" baseline to "nominal + gain" — a measurable acceleration that the player experiences as a faster rate of chemical processing in the creature's body. The community flavour text for the third-party Panatreea Potion captures the intended reading exactly: *"It contains lots of Vitamin C and Prostaglandin to give immune systems a boost in times of need."* (`panatreea.catalogue:3`)

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter, no producing reaction | — | — | The stock genome contains no emitter anywhere in the body that releases Vitamin C, and no reaction produces it as a product. Vitamin C is **never generated endogenously**; a newborn starts at zero and only ever rises if something external injects the chemical |
| 2 | **Vitamin Potion** (Medicine Maker / Materia Medica) | `scrp 2 25 20 12` — `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:661–673`, family/genus/species `2 25 20` | Drinking the potion runs `chem 99 .35` (0.35 units of Vitamin C), bundled with `chem 98 .35` Vitamin E, `chem 94 .15` Prostaglandin and `chem 3 .05` Glucose | The **only canonical stock source**. The Materia Medica description (`Materia Medica.catalogue:134–136`) reads: *"Keep your Creatures happy and healthy with this Vitamin Potion. It contains Vitamins C & D which enrich the health of a Creature, helping it maintain strength and vitality."* Unlike Vitamin E, the Vitamin C component of this cocktail is mechanically active: it accelerates eight reactions in the body, complementing the Prostaglandin repair-rate boost |
| 3 | **Third-party potions / agents (community content)** | e.g. Panatreea Potion (`panatreea.catalogue`) and other modded medicines | Community agents that `chem 99 <dose>` | Community content frequently leans on Vitamin C's real, immune-boosting mechanical effect. The Panatreea Potion is flavoured precisely as a Vitamin C + Prostaglandin combo "to give immune systems a boost in times of need" — a direct acknowledgement of the slot's active role |
| 4 | **CAOS / debug injection** | Debug console, genetic-engineering tools, modded genomes | Custom scripts that `CHEM TARG 99 <amount>`, or new emitters / reactions inserted into a modded genome | Because Vitamin C's effect is purely catalytic (accelerating existing reactions), a dose injected via CAOS gives an observable boost to the reactions its receptors modulate without any risk of overdose: the receptors saturate long before any toxicity threshold because there is no toxicity threshold to reach |

Because Vitamin C is not synthesised by any organ and is not consumed by any reaction, the bloodstream level at any given tick is simply the cumulative dose injected minus the (essentially zero) decay — the chemistry panel shows a flat line starting at the moment of the first dose.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | Reaction-rate receptor | 196 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction in its gene block | 0 | 214 (~0.84) | 64 (~0.25) | none | While Vitamin C is present, this receptor drives the target reaction's `Rate` toward saturation, speeding it up dramatically (see "How reaction-rate receptors work" below). At zero concentration the rate sits at the nominal baseline |
| 2 | Reaction-rate receptor | 195 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction | 0 | 214 (~0.84) | 64 (~0.25) | none | Same catalytic effect as (1) on a different target reaction |
| 3 | Reaction-rate receptor | 194 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction | 0 | 213 (~0.84) | 64 (~0.25) | none | Same catalytic effect on a different target reaction |
| 4 | Reaction-rate receptor | 193 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction | 0 | 213 (~0.84) | 64 (~0.25) | none | Same catalytic effect on a different target reaction |
| 5 | Reaction-rate receptor | 192 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction | 0 | 213 (~0.84) | 64 (~0.25) | none | Same catalytic effect on a different target reaction |
| 6 | Reaction-rate receptor | 191 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction | 0 | 209 (~0.82) | 64 (~0.25) | none | Same catalytic effect on a different target reaction |
| 7 | Reaction-rate receptor | 123 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction | 0 | 209 (~0.82) | 48 (~0.19) | none | Catalytic effect with a slightly gentler gain on a different target reaction |
| 8 | Reaction-rate receptor | 109 | Reaction (organ 3) | Locus 0 — attached to the preceding reaction | 0 | 206 (~0.81) | 63 (~0.25) | none | Same catalytic effect on a different target reaction |
| 9 | Organ clockrate receptor | 99 | Organ (organ 2) — an internal organ whose clock the gene attaches to | `RLOCUS_CLOCKRATE` | 32 (~0.13) | 116 (~0.45) | 57 (~0.22) | none | When Vitamin C **exceeds** ~0.13 (a meaningful non-trace dose), this receptor raises the organ's clockrate from the nominal ~0.45 toward ~0.67. A faster clockrate makes the organ tick more of its reactions per world tick, compounding the direct catalytic speed-ups in (1)–(8) |
| 10 | Passive decay (negligible) | — | — | Half-life **90,682,980,616 ticks** ("Very long", decay rate 1.0) | — | — | — | — | Nominally decays, but the clearance is below the precision of the chemistry engine's 0–255 scale. A dose persists essentially forever on any play-session timescale |

Vitamin C is therefore **read in nine places and written in none** within the stock genome: a one-way signalling chemical whose concentration is dictated entirely by the player's potion-feeding schedule.

## Role in Game Mechanics

### The "catalytic vitamin" design

Creatures 3 supports a special pseudo-organ, `ORGAN_REACTION`, whose sole purpose is to host receptors that modulate reaction rates — an enzyme-like layer that sits above the reactions themselves. When a receptor's `IDOrgan` is `ORGAN_REACTION`, the genome parser substitutes the current reaction number for the receptor's tissue field, and the receptor's `Dest` is resolved by the locus-address lookup to the reaction's `Rate` slot — *"all loci return the Reaction Rate"*. In other words, a Reaction-organ receptor does not read a creature state and produce a chemical — it takes a chemical (the "enzyme") and writes its output directly into the rate parameter of the specific reaction in front of which it was placed in the genome. This is the engine's way of modelling a chemical catalyst: a chemical whose role is not to be a reactant or a product, but to **speed up or slow down** a specific reaction.

Vitamin C has **eight such catalytic receptors**, making it the most widely-acting catalyst in the stock genome. Every dose of Vitamin C simultaneously adjusts the rates of eight different reactions toward saturation. With all eight receptors using threshold 0, any non-zero Vitamin C level activates them.

### How reaction-rate receptors work — the concentration-to-rate mapping

The rate update itself runs every tick in `ProcessReceptors` followed by `ProcessReaction`. The receptor output is written into the target reaction's `Rate` slot, and that slot is interpreted by the reaction as:

```text
inputFloat      = (1.0 - Rate) * 32.0            // invert genome convention: 0 = slow, 1 = fast
halfLifeInTicks = pow(2.2, inputFloat)
rate            = 1.0 - pow(0.5, 1.0/halfLifeInTicks)
avail           = avail * rate                   // fraction of reactants that react this tick
```

A Rate close to 1.0 collapses the half-life to ≈ 1 tick — the reaction runs to completion almost instantaneously. A Rate close to 0 pushes the half-life out to ~9 × 10¹⁰ ticks — effectively frozen.

With threshold 0 and nominal 0.82–0.84, **no Vitamin C** gives the receptor group an output of ~0.82 written into the reaction's Rate slot. The `(1-0.82)*32 ≈ 5.76` exponent yields `2.2^5.76 ≈ 85` ticks half-life — a brisk but not instant reaction. **Any Vitamin C above zero** (which is the threshold) adds the per-receptor gain (~0.25) to that nominal via the `BoundedAdd` in the receptor-processing routine, pushing the Rate to ~1.0 and the half-life to ~1 tick — the reaction runs to completion essentially every tick as long as reactants are present. The net result: Vitamin C, when present in any quantity, roughly **eighty-fold to effectively-infinitely accelerates** each of the eight reactions it modulates.

### The clockrate receptor — compounding the acceleration

Receptor 9 is structurally different. It sits on `ORGAN_ORGAN` with locus `RLOCUS_CLOCKRATE`, which writes into the organ's `loc_ClockRate` — the master timescale for that organ. A clockrate below 1.0 means the organ runs some of its reactions on some ticks rather than every tick; a clockrate at 1.0 means the organ runs all of its work every tick. The threshold of 32 (~0.13) on this receptor means trace amounts of Vitamin C below this level leave the clockrate at its nominal ~0.45, but a "meaningful dose" (anything above 13% of the 0–255 scale) boosts the clockrate by up to +0.22 toward a saturating ~0.67.

Because this receptor lives on the same organ whose reactions Vitamin C is also modulating, the two effects **compound**: Vitamin C makes the organ tick more often *and* makes its reactions reach completion faster per tick. A creature that has drunk a Vitamin Potion therefore has an organ firing on a nearly continuous schedule with reaction rates saturated — a meaningful boost in biochemical throughput for as long as Vitamin C is present.

### The immune-boost reading

Which eight reactions does Vitamin C catalyse? The engine's receptor-to-reaction binding is positional: the receptor-parsing code sets the receptor's target to *the reaction most recently parsed in the current organ's gene block*. The gene IDs of the Vitamin C reaction receptors (196, 195, 194, 193, 192, 191, 123, 109) sit between and immediately after the genome's antigen→antibody reaction block — the eight symmetrical immune reactions that the body runs when pathogenic antigens are present:

- `Antigen 0 → Antibody 0 + Histamine B` (reaction gene ~88)
- `Antigen 1 → Antibody 1 + Histamine A`
- `Antigen 2 → Antibody 2 + Coldness`
- `Antigen 3 → Antibody 3 + Coldness`
- `Antigen 4 → Antibody 4 + Hotness`
- `Antigen 5 → Antibody 5 + chemical 90`
- `Antigen 6 → Antibody 6 + Hotness`
- `Antigen 7 → Antibody 7 + Pain`

These eight reactions live in the immune-response organ and are responsible for clearing pathogens and producing the matching antibodies (plus the pain / hotness / coldness "symptoms" that warn the brain and bias the creature's behaviour). The Vitamin Potion's Vitamin C component dramatically accelerates all eight: under Vitamin C, the body recognises and neutralises any antigen it encounters in effectively one tick, producing antibodies at maximum stoichiometric rate. The clockrate receptor on the same organ compounds the effect by making the organ tick more often.

This mechanism matches the flavour text perfectly: the stock Vitamin Potion's *"strength and vitality"* effect is a combination of three mechanisms that each hit a different part of the recovery pathway: **Vitamin C** catalyses the immune reactions (clearing pathogens faster), **Prostaglandin** boosts the organ repair rate (healing existing injury faster), and **Glucose** tops up the energy chemistry (paying the ATP cost of the accelerated reactions). Vitamin E is the only inert component of the cocktail — a real mechanical difference from its neighbour in the chemical register.

### Why the half-life is effectively infinite

Vitamin C is one of only two chemicals in the stock biochemistry assigned the extreme "Very long" decay class — 90,682,980,616 ticks half-life at decay rate 1.0 (`biochemistry.json:8441–8447`). At 30 tps this is ~96 000 real-world years, far beyond any play session and in fact beyond the floating-point precision of the chemistry engine's normalised 0–255 scale. The per-tick clearance is below machine-epsilon at the relevant concentrations; the chemical never meaningfully decays.

The design intent is clear: Vitamin C is modelled as a long-term reservoir. The receptors are all threshold-0 for the reaction-rate receptors (any trace activates them) and threshold-32 for the clockrate receptor, which means a single dose keeps those receptors firing for the rest of the creature's life. The potion is conceived as a **once-per-lifetime immune booster** — a player who administers a Vitamin Potion to a sick creature gives it a permanent immune upgrade. The near-zero decay is the mechanism that makes this permanence work.

The practical consequences of this decay profile:

- A creature dosed in the nursery still has Vitamin C at elder age.
- Repeat dosing is pointless: the saturation is reached at the first dose and subsequent doses are clipped to the chemistry ceiling.
- Once injected, the Vitamin C concentration is essentially a birthmark — a creature that has been to the Medicine Maker is biochemically distinguishable from one that has not, forever.

### Interaction with the wider chemistry

Vitamin C's interactions are purely modulatory — it is never a reactant or product — but because it modulates the immune pathway, it interacts indirectly with many chemicals:

- **Antigens (82–89)**: all eight consumed faster under Vitamin C. An infected creature clears its viral / bacterial / fungal load in a fraction of the usual time.
- **Antibodies (102–109)**: produced faster, building up to the concentration needed for lasting immunity sooner.
- **Histamine A / B (73, 74)**: produced as by-products of the Antigen 0 and Antigen 1 reactions, so Vitamin C transiently increases histamine output during active infection. (Histamine is then cleared by its own separate chemistry.)
- **Pain, Hotness, Coldness (148, 153, 152)**: side products of several antigen reactions, so Vitamin C can briefly increase these warning chemicals while clearing an infection — a faster but sharper "I am fighting something off" signal.
- **Prostaglandin (94)**: delivered in the same potion bundle, works on a different axis (organ repair rate) — Vitamin C and Prostaglandin together give a full-spectrum recovery boost.
- **Glucose (3) / ATP pathway**: the accelerated reactions cost ATP via the standard organ energy system, so a creature under heavy Vitamin C + infection load can briefly deplete energy faster; the 0.05 Glucose in the Vitamin Potion is a modest hedge against this.

### Behavioural signature

Unlike a drive-modulator or a mood chemical, Vitamin C has **no direct behavioural effect**. There is no "need vitamins" drive, no brain receptor, no classifier, no stimulus, no animation, no voice change. A creature does not know that it is on Vitamin C. What the player *observes* is not Vitamin C itself but its downstream consequences: a sick creature recovers faster, a creature exposed to pathogens builds antibodies more quickly, and illness symptoms (hotness, coldness, pain from the antibody reactions) resolve faster because the underlying reactions complete in one tick rather than dozens.

This indirect signature is the reason the potion's *Materia Medica* description talks about *"enrich[ing] the health… strength and vitality"* without specifying a mechanism: the mechanism is invisible biochemistry, observable only through its symptoms.

### Testing and experimentation

Vitamin C is a useful tracer for anyone investigating C3's immune system:

- **Catalyst diagnostic.** Injecting a known dose and watching the antigen → antibody reaction rates on the chemistry panel is a direct way to see the Reaction-organ modulation in action. The antigen concentration should fall and antibody concentration rise on a noticeably steeper curve than in a control.
- **Organ-clockrate measurement.** Because the clockrate receptor has a threshold of 32, one can dose below and above 0.13 and observe the organ's tick schedule shift from "every few ticks" to "nearly every tick". This is one of the cleanest demonstrations of clockrate modulation in the stock genome.
- **Persistence marker.** Because the half-life is effectively infinite, a Vitamin C dose is a stable chronometric tag on an individual creature. Experiments that span generations or imports can use it to confirm that the dosed creature is the same individual.
- **Control for Vitamin E.** The paired Vitamin E / Vitamin C design makes them an ideal A/B pair: inject only Vitamin E and nothing changes, inject only Vitamin C and the immune reactions and organ clockrate shift observably. The contrast between the two is the cleanest inert-vs-active comparison in the medicine catalogue.

### Edge cases and failure modes

- **Repeat dosing is wasted.** The receptors saturate at very small concentrations (threshold 0 for reaction rate, threshold 32 for clockrate). Beyond the saturation point, additional Vitamin C has no additional effect.
- **Overdose has no toxic threshold.** There is no receptor that punishes high Vitamin C and no reaction that consumes it; overdose is harmless and strictly equivalent to a single dose.
- **Underdose still works.** Any trace amount above zero activates the reaction-rate receptors (threshold 0). Only the clockrate receptor requires >0.13 to engage.
- **Not heritable.** Chemicals are runtime state, not genotype. A child of a dosed parent starts at zero Vitamin C; each creature must be dosed individually.
- **Decay rate mutation.** A mutated genome that shortens the half-life would force periodic re-dosing to maintain the immune boost — a plausible community-mod rebalance that would turn the potion from a once-per-lifetime upgrade into a renewable medicine.
- **Removing a receptor** via genetic engineering disables the corresponding reaction acceleration without affecting the others — a clean way to selectively weaken the immune boost on a per-antigen basis, e.g. to model specific immunodeficiency.

## Summary

```
 Chemical 99 — Vitamin C  (Medicine Maker: half of the "Vitamin Potion",
                           a catalytic immune-system booster)
 ------------------------------------------------------------------------------------
 Producers:   NONE internally — external only
              (Vitamin Potion, family/genus/species 2 25 20, 0.35-unit dose)

 Consumers:   NONE — no reactions consume Vitamin C; it is a pure catalyst

 Receptors:   9 total
              - 8 on ORGAN_REACTION (locus 0) — each catalyses one reaction
                (threshold 0, nominal ~0.82, gain ~0.25): the eight
                Antigen N → Antibody N immune reactions are modulated from
                ~85-tick half-life at baseline down to ~1-tick half-life
                under Vitamin C — an effectively complete immune-response
                acceleration.
              - 1 on ORGAN_ORGAN (RLOCUS_CLOCKRATE), threshold 32, nominal
                ~0.45, gain ~0.22: raises the immune-response organ's
                clockrate toward saturation, compounding the reaction
                acceleration.

 Emitters:    NONE — no organ releases Vitamin C

 Half-life:   90,682,980,616 ticks (~96 000 years at 30 tps, decay rate 1.0 —
              "Very long"; effectively immortal)

 Delivery:    Vitamin Potion (0.35 units, bundled with Vitamin E 0.35,
              Prostaglandin 0.15, Glucose 0.05) or any community potion
              e.g. Panatreea Potion flavoured as "Vitamin C and Prostaglandin
              to give immune systems a boost in times of need."

 Narrative role: A catalytic immune booster. Speeds up the eight stock
                 antigen→antibody reactions and raises the hosting organ's
                 clockrate. In the Vitamin Potion cocktail, Vitamin C is
                 the active immune component — complementing Prostaglandin's
                 repair-rate boost and Glucose's energy top-up. Unlike its
                 inert neighbour Vitamin E, Vitamin C genuinely does what
                 the potion label claims: it enriches health by enabling
                 the body to clear pathogens and produce antibodies faster.
```

Vitamin C is one of the most economical designs in the C3 chemistry — a single chemical, with no synthesis and no decay, that hooks into nine modulator receptors to deliver a coherent "immune-boost" effect across eight reactions and one organ clock. It is a rare instance where the stock genome uses the `ORGAN_REACTION` catalytic layer in force, and it stands as the mechanistic counterpart to its visually-identical but functionally-inert neighbour Vitamin E — together, the pair illustrate both ends of the chemistry spectrum (fully wired vs. reserved placeholder) within a single thematic potion.

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:155` — slot 99 named "Vitamin C"
- `Rebuild/Libraries/creatures-chemicals.js:123` — chemical descriptor `{ id: 99, name: 'Vitamin C', description: '' }`
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json`:
  - `:6449–6599` — the eight `ORGAN_REACTION` (organ 3) locus-0 receptors reading Vitamin C: gene IDs 196, 195, 194, 193, 192, 191, 123, 109, each attached to its preceding reaction with threshold 0, nominal ~0.82–0.84, gain ~0.19–0.25
  - `:6771–6789` — the ninth receptor, on `ORGAN_ORGAN` (organ 2) locus `RLOCUS_CLOCKRATE`, threshold 32, nominal 116, gain 57 — clockrate modulator
  - `:8441–8447` — half-life entry: 90,682,980,616 ticks, decay rate 1.0, "Very long"
  - No reaction entries with chemical 99 as reactant or product — the chemical is never consumed or produced anywhere
  - No emitter entries — no organ produces Vitamin C internally
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:134–136` — "Vitamin Potion" player-facing description
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:366` — potion ingredient label "Vitamin C"
- `Rebuild/Assets/Catalogue/panatreea.catalogue:3` — community flavour text confirming the immune-boost reading ("lots of Vitamin C and Prostaglandin to give immune systems a boost in times of need")
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:661–673` — `scrp 2 25 20 12` handler for the Vitamin Potion, injects `chem 99 .35`
- `Rebuild/DOCUMENTATION/chemicals/094 - Prostaglandin.md` — documentation for the paired repair-rate booster delivered in the same Vitamin Potion
- `Rebuild/DOCUMENTATION/chemicals/098 - Vitamin E.md` — documentation for the inert placeholder delivered alongside Vitamin C in the same potion, for contrast
