# 097 - Arnica

Arnica is chemical slot 97 in the Creatures 3 chemistry, listed in the library (`creatures-chemicals.js`) with no descriptive tagline and displayed to the player simply as **"Arnica"** in `ChemicalNames.catalogue`. The name is borrowed from the real-world flowering herb *Arnica montana*, which has a long folk-medicine tradition as a topical anti-inflammatory and bruise remedy. In Creatures 3 that herbal pedigree is leveraged for a single, tightly-focused pharmacological role: Arnica is the **specific chemical antidote to Glycotoxin (chem 70)** — the first and most iconic bacterial toxin in the 70–81 toxin block — and nothing else. The Materia Medica states the relationship plainly: *"Arnica is the only known cure for a glycotoxin poisoning."*

Arnica has **no endogenous production** in the standard genome — no emitter, no synthesising reaction, no organ that releases it — so every molecule present inside a creature's bloodstream arrives from **outside** the body, typically delivered by the **Elixir of Arnica** potion or (at a much smaller dose) by the **General Cure** potion from the Materia Medica Creature Disk. It also has **no receptors** of any kind: the body does not "sense" its presence, no organ behaviour is modulated by it, and it has no direct effect on mood, drives, instinct or physical state. Its only participation in the biochemistry is as the second reactant in **Reaction 89** (gene 79), `Glycotoxin + Arnica → (nothing)`, which destroys one molecule of each chemical with a short half-life of 21 ticks (~0.7 s at 30 tps). The reaction produces no by-products, so the antidote works cleanly — both the toxin and the cure are consumed together and disappear.

Any excess dose that is not matched by an equivalent amount of Glycotoxin is cleared from the bloodstream by the chemical's own **passive half-life of 6,045 ticks (~3.4 minutes of real play at 30 tps, decay rate 0.99989, labelled "Long")**. Unlike Sodium thiosulphite's ~20 second "Medium" decay, Arnica is designed to **linger**: the Elixir of Arnica is meant to guard a creature through the full course of an infection, not just neutralise a single bolus of toxin. That long-lived presence is a direct response to Glycotoxin's primary delivery vector — a chronic bacterial infection (family/genus/species `2 32 23`, `bacteria.cos`) that re-injects small amounts of Glycotoxin every tick for as long as the bacterium is active. A short-lived antidote would be worn out long before the infection clears; Arnica's 3-minute half-life ensures one dose keeps suppressing Glycotoxin across the bacterium's full lifetime.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter and no producing reaction in the standard genome | — | — | A healthy creature is born with Arnica = 0 and stays at 0 unless something external injects the chemical. The body cannot synthesise its own glycotoxin antidote |
| 2 | **Elixir of Arnica potion** (Materia Medica) | Syrup agent from the Materia Medica Creature Disk (family/genus/species `2 25 2`, `medicine maker.cos:532-541`) | Drinking the potion runs the CAOS event `scrp 2 25 2 12`, which executes `chem 97 1` against the drinker — a full unit dose of Arnica injected directly into the bloodstream | The canonical in-world delivery route. The Materia Medica states: *"Arnica is the only known cure for a glycotoxin poisoning... Glycotoxin breaks down glycogen leaving your Creature quite cold and unhealthy — if not treated in time the Creature could end up dying. In Norns it can cause damage to the liver anabolic organ. Should you find a Creature poisoned by glycotoxin, make sure they drink some of this elixir. After that, keep the Creature well fed and rested."* Dose 1.0 is sized to suppress a chronic bacterial infection for the full duration of the Arnica half-life (~3 minutes) |
| 3 | **General Cure potion** (Materia Medica) | Multi-toxin remedy agent (family/genus/species `2 25 19`, `medicine maker.cos:642-658`) | Drinking the potion injects 0.15 units of chem 97 alongside seven other antidote / neutraliser chemicals (chem 100, 95, 92, 93, 96, 94 and 117) | The Materia Medica notes: *"This extremely useful potion can cure many different illnesses... The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin... It is extremely weak, so you may need to get a Creature to have quite a few bottles of it in order to cure anything completely."* Because the Arnica dose is 15 % of an Elixir of Arnica, several bottles may be needed to neutralise a sustained Glycotoxin infection, and the Materia Medica explicitly recommends the stronger specific-cure potion for serious poisonings |
| 4 | **Third-party / CAOS injection** | User-made `.agents` files, debug console | Custom scripts that `CHEM TARG 97 <amount>` | Useful for testing the antidote reaction and for designing custom medicines. Community disease and cure packs sometimes bundle additional Arnica delivery items for scenarios that expose creatures to repeated Glycotoxin attacks |

Arnica is therefore a **pure external-delivery chemical**: its only way into a creature's bloodstream is through a potion, injection or scripted cure event. The body never makes it endogenously.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Glycotoxin antidote reaction** | 79 (reaction 89, Baby onwards) | Reaction / Somatic | `1× Glycotoxin [70] + 1× Arnica [97] → (nothing)`, half-life 21 ticks ("Short", decay rate 0.968) | — | — | — | — | The chemical's only active role. Both reactants are consumed stoichiometrically with no product, so when Arnica meets Glycotoxin in the bloodstream the two molecules annihilate each other in under a second. The fast reaction half-life (21 ticks) means an injected Arnica load burns down any co-present Glycotoxin almost immediately — but because Glycotoxin is re-injected every tick by an active bacterial infection, the antidote's own long half-life is what provides sustained protection, not the reaction's speed |
| 2 | **No receptors** | — | — | — | — | — | — | — | The chemical has no sensors anywhere in the body. It does not trigger drives, it is not read by the brain, it does not modulate reaction rates and it has no REDUCE / injury effects. The creature cannot directly perceive the antidote and will not react behaviourally to its presence |
| 3 | **Passive decay** | — | — | Half-life **6,045 ticks** ("Long", decay rate 0.99989) | — | — | — | Any surplus dose not consumed by Reaction 89 fades on its own over ~3.4 minutes of real play. This long persistence is deliberately chosen to outlast a typical chronic Glycotoxin infection, so a single Elixir of Arnica provides cover for the full course of a bacterial illness rather than requiring repeated administration |

Arnica's biochemistry is one of the **simplest** in the whole Creatures 3 chemistry set: one consumer reaction, no receptors, no emitters, a long half-life calibrated to the duration of the infection it is designed to treat. It is a purpose-built **single-function medicinal chemical**, and the only stock antidote paired to a chemical in the bacterial toxin block.

## Role in Game Mechanics

### The antidote reaction — Reaction 89

Arnica exists in the genome solely to power Reaction 89 (gene 79):

```
 1× Glycotoxin [70]  +  1× Arnica [97]   →   (nothing)  +  (nothing)
```

Both reactants are destroyed in 1:1 stoichiometry and nothing is produced. This is a **mutual annihilation** reaction — both the toxin and the antidote vanish together — the same design pattern used for Sodium thiosulphite + Cyanide (Reaction 86) and EDTA + Heavy Metals (Reaction 87). It is the cleanest possible model of an acid/base-style neutralisation in the game's chemistry engine, and it is the basis for the Materia Medica's *"Arnica is the only known cure"* claim: no other reaction anywhere in the stock genome consumes Glycotoxin as a reactant.

At genome value 31 the reaction's half-life is **21 ticks (~0.7 s at 30 tps)**. In practical terms this means the reaction is fast on human-perceptible timescales: as soon as the two chemicals are co-present in the bloodstream, they react down within roughly a frame's worth of animation. The subjective impression is that the cure *"works on contact"* — the moment Arnica arrives, any existing Glycotoxin load is visibly falling on the chemistry panel.

Because the reaction is strictly 1:1, the outcome depends on the **relative** quantities of the two chemicals:

- **Arnica ≥ Glycotoxin**: All Glycotoxin is neutralised; some surplus Arnica remains and continues to guard the creature until it decays away via its 6,045-tick half-life. Any new Glycotoxin injected later by the same infection is neutralised on arrival until the Arnica reserve is exhausted.
- **Arnica < Glycotoxin**: All Arnica is consumed but some Glycotoxin remains, continuing to catalyse Reaction 88 (the Glycogen-raid reaction) and to drive Receptor 30 (the somatic injury receptor). A follow-up dose is required to finish clearing the toxin.

### Why Arnica lasts ~3.4 minutes while Sodium thiosulphite lasts ~20 seconds

Arnica's 6,045-tick half-life ("Long") is an order of magnitude longer than Sodium thiosulphite's 621 ticks ("Medium"), despite both chemicals playing the same structural role — a pure antidote with no receptors and a single annihilation reaction. The difference reflects the **delivery profile of their paired toxin**:

- **Cyanide (chem 67)** is typically delivered as a discrete exposure — a single bacterial burst, a poisoned food bite, a scripted injection event. Once the source is removed, no new Cyanide arrives. A short-lived antidote is adequate because there is no sustained onslaught to defend against.
- **Glycotoxin (chem 70)** is primarily delivered by the `bacteria.cos` infection loop, which re-injects `ov17` (0.005–0.050) units of Glycotoxin **every tick** for as long as the bacterium is active (see `DOCUMENTATION/caos_scripts/bacteria.md`). This is a chronic, minute-scale drip, not a one-shot bolus. An antidote with a 20-second half-life would decay away long before the bacterium was cleared by the immune system, leaving the creature to suffer again.

By giving Arnica a ~3.4-minute half-life the genome ensures that **a single Elixir of Arnica covers the typical duration of a bacterial infection from end to end**. Every Glycotoxin molecule the bacterium emits is annihilated on arrival by the long-lasting Arnica reserve, the Glycogen-raid reaction (88) never gets to run, the somatic injury receptor (30) never gets to damage an organ, and the player's single decisive intervention is enough to see the creature through the illness. This is the biochemical equivalent of a prophylactic antibiotic course: dose once, stay protected for the whole window of exposure.

The Long half-life also makes Arnica the closest thing in the stock game to a **preventive medicine**. A creature dosed with Elixir of Arnica is meaningfully protected against any Glycotoxin exposure that occurs during the next three minutes, not just Glycotoxin that is already present at the moment of dosing. In scenarios where the player knows a bacterial agent is about to be introduced (e.g. a deliberate infection experiment in a laboratory metaroom) a pre-emptive dose is a valid tactic.

### Why the chemical has no receptors

Arnica is unusual among the Creatures 3 chemicals in having **no receptor wiring whatsoever**. Most biologically-active chemicals in the stock genome have at least one receptor somewhere in the body — even minor metabolic substrates have receptors that modulate organ behaviour. The complete absence of receptors for chem 97 is a deliberate design choice mirroring the pattern established by Sodium thiosulphite (chem 96) and EDTA (chem 95):

1. The chemical's **only intended effect** is to destroy Glycotoxin via Reaction 89. Any receptor-mediated side-effect would be an off-target action that could interfere with normal behaviour or turn the cure itself into a symptom.
2. The chemical is only ever present as a **medical intervention**. The body should not learn to rely on it, crave it, or be disturbed by its presence — it should be chemically invisible except for the neutralisation reaction.
3. The creature should not be able to **detect** that it has been cured. Its behaviour should track the *effects* of the poisoning (Coldness drive from Reaction 88, malaise from organ injury) and the *effects* of recovery (restored Glycogen store, organ life-force regenerating), not the cure itself.

This minimal profile — one reaction, no receptors, external delivery only, long half-life — is the stock Materia Medica's canonical **"pure pharmacological antidote"** pattern, adapted here for a chronic-exposure use case.

### Relationship to the Elixir of Arnica potion

The **Elixir of Arnica** potion from the Materia Medica Creature Disk is the in-world delivery vehicle for a full-strength Arnica dose. Its Materia Medica description reads:

> *"Arnica is the only known cure for a glycotoxin poisoning.*
>
> *What exactly does a glycotoxin poisoning do to a Creature?*
>
> *Glycotoxin breaks down glycogen leaving your Creature quite cold and unhealthy — if not treated in time the Creature could end up dying. In Norns it can cause damage to the liver anabolic organ.*
>
> *Should you find a Creature poisoned by glycotoxin, make sure they drink some of this elixir. After that, keep the Creature well fed and rested."*

The potion is implemented in `medicine maker.cos` at lines 532-541 as a drinkable agent whose `scrp 2 25 2 12` handler injects a single full unit of chem 97 into the drinker. The follow-up advice — *"keep the Creature well fed and rested"* — is grounded in the actual biochemistry: once Arnica neutralises the ongoing Glycotoxin drip, the creature still needs to rebuild the Glycogen store that Reaction 88 already raided (food / starch intake) and heal the somatic organ damage accumulated via Receptor 30 (rest and energy surplus). Arnica stops the bleeding, but the creature still has to recover.

The description's identification of the **liver anabolic organ** as the specific damage target aligns with Receptor 30 (gene 146) being wired to `RLOCUS_INJURY` on the somatic organ designated in the Norn genome for that receptor. A Glycotoxin infection therefore manifests as liver injury in a standard Norn — a flavour detail the Materia Medica preserves — and Arnica's neutralisation of the toxin halts further liver damage immediately on contact.

### Relationship to the General Cure potion

The **General Cure** potion bundles **0.15 units of Arnica** — 15 % of an Elixir of Arnica — alongside seven other antidote / neutraliser chemicals into a single convenient bottle. Its Materia Medica description reads:

> *"This extremely useful potion can cure many different illnesses, all from the one bottle. It is extremely weak, so you may need to get a Creature to have quite a few bottles of it in order to cure anything completely. The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin. It is highly recommended that in the case of serious toxic poisonings that you use the stronger cure specific potions instead of this General Cure."*

Because Reaction 89 is stoichiometric (1:1), the General Cure's 0.15-unit dose simply means fewer Glycotoxin molecules are neutralised per bottle. Mathematically, *N* bottles of General Cure ≈ 1 bottle of Elixir of Arnica for *N* ≥ ~7. In practice the General Cure is a **convenience good** for mild or uncertain toxic exposure — the player who suspects their creature is ill but does not yet know with which toxin can dose a bottle and rely on whichever of the seven bundled antidotes happens to match — while the Elixir of Arnica is the **emergency drug** for confirmed Glycotoxin poisoning from a chronic bacterial source.

### The bacterial infection model — why Arnica matters

The standard delivery vector for Glycotoxin is the `bacteria.cos` agent (family/genus/species `2 32 23`). Each bacterium rolls a random toxin ID into OV16 somewhere in the 70–81 range; when the roll lands on 70 the bacterium becomes a Glycotoxin carrier. While active (not dormant), the bacterium fires a timer script that injects `ov17 (0.005–0.050) × ov16` of chem 70 into the host every tick. A single chronic infection is therefore a sustained-release Glycotoxin pump.

Without Arnica, the creature's only defences are:

1. **Passive Glycotoxin decay** (half-life 3,686 ticks, ~2 minutes per halving) — a slow, continuous drain.
2. **The immune system** — antibodies 102-109 eventually suppress the bacterium, but the immune response takes time and in young creatures may be weak or slow.
3. **The Materia Medica's other bacterial tools** — generic antibiotic agents that suppress the bacterium directly rather than clearing its toxin.

Arnica short-circuits this entire arc: administer the Elixir of Arnica and every new Glycotoxin molecule the bacterium emits is neutralised on arrival for the next three minutes. The infection continues biologically (the bacterium is still active), but its **effect** on the host — the Glycogen raid, the Coldness drive, the somatic organ injury — is zeroed out. By the time the Arnica decays, the host's own immune response has typically had enough time to suppress the bacterium. This is what the Materia Medica means by *"the only known cure"*: Arnica does not cure the bacterium, it **cures the poisoning**, and in the game's model that is enough to let the creature recover.

### Why the passive half-life is "Long" (~3.4 min) and not longer

The 6,045-tick half-life is carefully chosen. Key constraints:

- **Long enough** to outlast a typical bacterial Glycotoxin drip. The `bacteria.cos` infection lifecycle — attachment, active infection, immune suppression — typically resolves in 1-3 minutes of real play, and the Arnica half-life is tuned so one dose covers the full course.
- **Long enough** to permit a small degree of prophylactic dosing. A player who dosed the creature "just in case" has a three-minute window in which any Glycotoxin exposure is caught by the neutralisation reaction.
- **Short enough** that excess antidote does not accumulate across many potion administrations. A creature dosed once and then re-dosed an hour later sees the first dose almost entirely gone — the second dose does the work. This preserves the **scarcity and pacing** of the Elixir of Arnica as a meaningful intervention.
- **Short enough** that the chemical has no meaningful presence in the body during normal life. Outside of an acute cure, Arnica is invisible.

Contrast this with longer-lived medical chemicals like Vitamin E / Vitamin C (chems 98 / 99, essentially immortal), which are meant to build up a lifetime reserve, and with shorter-lived antidotes like Sodium thiosulphite (chem 96, ~20 s), which are tuned to discrete bolus exposures. Arnica sits in the **sustained-cover antidote** bucket, a middle ground designed for the specific challenge of chronic bacterial toxin delivery.

### Interaction with the wider antidote palette

Arnica is one of several specific antidotes in the Materia Medica's stock pharmacopoeia, each paired to a distinct toxin via a single dedicated reaction:

| Antidote | Toxin cleared | Reaction pattern | Antidote half-life |
|----------|---------------|------------------|--------------------|
| **Arnica (97)** | Glycotoxin (70) | `Glycotoxin + Arnica → nothing` | 6,045 ticks ("Long") |
| Sodium thiosulphite (96) | Cyanide (67) | `Cyanide + Thiosulphite → nothing` | 621 ticks ("Medium") |
| EDTA (95) | Heavy Metals (66) | `Heavy Metals + EDTA → nothing` | ~24,155 ticks ("Very long") |
| Antigens (82–89) | Antibodies (100–107) | Stoichiometric neutralisation | Variable |
| Prostaglandin (94) | Histamine A / B | Dampens inflammation | Short |
| Anti-oxidant (93) | Oxidative damage chemistry | Scavenger reactions | Long |

The design pattern is uniform: **one antidote, one toxin, one specific reaction, stoichiometric consumption, no receptors**. What varies is the **half-life profile**, tuned to the delivery mode of the matching toxin. Arnica's Long half-life uniquely positions it for chronic bacterial exposure — the one toxin in the 66–69 and 70–81 blocks that is canonically delivered by a persistent, tick-by-tick pump rather than a discrete dose.

### Behavioural invisibility

Because Arnica has no receptors and no emitter, it has **no direct behavioural consequences**. A creature does not:

- Feel a drive for it (no "need antidote" drive).
- Learn that a particular object produces it (no classifier stimulus tied to chem 97).
- Experience pain, pleasure, sleepiness or any other mood shift from its presence.
- Show any animation or posture change on receiving the cure.

All observable behavioural recovery from a Glycotoxin cure therefore comes from the **elimination of Glycotoxin's effects**: Reaction 88 stops running, Coldness stops being produced (so the creature stops shivering and seeking heat), the somatic injury receptor releases, the damaged organ begins to regenerate its life-force, and the creature's normal metabolism replenishes the Glycogen store. The antidote itself is chemically silent, which makes the cure feel natural and clean: the creature transitions from "poisoned and distressed" to "recovering" without any intermediate state in which the antidote itself is producing symptoms.

### Edge cases and failure modes

A handful of edge cases are worth noting for agent designers and genetic engineers:

- **Administering the cure before exposure** is partially useful: with no Glycotoxin present, the antidote simply decays away via its 6,045-tick half-life, but for the next three minutes any new Glycotoxin is neutralised on arrival. Unlike Sodium thiosulphite (whose short half-life makes prophylactic dosing almost useless), Arnica can be dosed preventively in anticipation of a known bacterial threat.
- **Over-dosing** has no ill effects: the chemical has no receptors to over-stimulate and no toxic threshold. Excess simply decays.
- **Under-dosing** (partial cure) with General Cure is common in serious infections and requires repeat administration. The 1:1 stoichiometry of Reaction 89 makes the arithmetic straightforward: a 0.15-unit General Cure dose neutralises 0.15 units of Glycotoxin before it is exhausted.
- **Sustained infection with no Arnica on board** means Glycotoxin will accumulate faster than its own passive half-life can clear it, and Reaction 88 (Glycogen raid) plus Receptor 30 (somatic injury) will continue to damage the creature until either an Arnica dose arrives or the immune system suppresses the bacterium.
- **Genetic mutation of Reaction 89** (disabling gene 79 or drastically slowing it) would render Arnica completely inert. Such a mutant creature cannot be cured of Glycotoxin poisoning by any stock potion — a scenario sometimes used in community "hardcore" genomes to make bacterial Glycotoxin infections irreversible without genetic intervention.
- **No cross-reactivity with other toxins**: Arnica does not react with any of the other bacterial toxins in the 71–81 block, nor with the environmental toxins in the 66–69 block. A bacterium whose OV16 roll lands on 71 (Sleep Toxin), 72 (Fever Toxin), etc. cannot be treated with Elixir of Arnica — the player must identify the toxin and match the cure.

## Summary

```
 Chemical 97 — Arnica  (Materia Medica: "Elixir of Arnica",
                        "the only known cure for a glycotoxin poisoning")
 ------------------------------------------------------------------------------------
 Producers:   NONE internally — external only
              (Elixir of Arnica potion, General Cure potion, CAOS injection)

 Consumers:   Reaction 89  (Glycotoxin + Arnica → nothing;
                            gene 79, half-life 21 ticks, "Short")

 Receptors:   NONE — chemical is behaviourally invisible

 Half-life:   6,045 ticks (~3.4 min at 30 tps, decay rate 0.99989 — "Long")

 Delivery:    Elixir of Arnica potion (primary, 1.0-unit dose — specific antidote)
              General Cure potion (secondary, 0.15-unit dose — multi-toxin convenience)

 Narrative role: The specific chemical antidote to Glycotoxin, the first and most
                 iconic bacterial toxin in the 70–81 block. Mutually annihilates
                 with Glycotoxin in under a second, produces no by-products, has
                 no side-effects, and the long passive half-life keeps a single
                 dose working for the full duration of a typical bacterial
                 infection (~3 minutes). A textbook example of the stock Materia
                 Medica's "one antidote, one toxin, one reaction, no receptors"
                 design pattern, uniquely tuned for chronic drip exposure.
```

Arnica is a study in **target-matched pharmacological design**. It exists to do exactly one thing — destroy Glycotoxin — and every property of its chemistry is tuned to that single role, with one crucial difference from its cousin Sodium thiosulphite: the passive half-life is ten times longer, because Glycotoxin arrives as a continuous bacterial drip rather than a one-off bolus. No internal production to keep the body from relying on it; no receptors to avoid off-target effects; a fast consuming reaction so it acts on contact; and a Long passive half-life so one dose protects the creature through the full course of an infection. The pairing with Glycotoxin's own biochemistry is elegant: a bacterial toxin that robs Glycogen for reduced Glucose plus Coldness and slowly injures the liver (Glycotoxin, chem 70) and its one specific annihilating herbal antidote (Arnica, chem 97) together model real-world "chronic poisoning + traditional herbal cure" with the same understated fidelity that characterises the rest of the Creatures 3 pharmacopoeia.

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue` — slot 97 named "Arnica" (player-visible name)
- `Rebuild/Libraries/creatures-chemicals.js` — chemical descriptor `{ id: 97, name: 'Arnica', description: '' }`
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - `:2920-2952` — reaction 89 (gene 79): `Glycotoxin + Arnica → nothing` (antidote, half-life 21 ticks, "Short")
  - `:8424-8431` — half-life entry: 6,045 ticks, decay rate 0.99989, "Long"
  - No emitter entries — chemical has no internal production pathway
  - No receptor entries — chemical has no sensors anywhere in the body
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:122-124` — "Elixir of Arnica" potion description (only known cure for glycotoxin, liver damage in Norns, "keep the Creature well fed and rested")
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:131-132` — "General Cure" potion — weaker multi-toxin remedy listing glycotoxin among the toxins it dilutes
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:364` — potion ingredient label "Arnica"
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:532-541` — `scrp 2 25 2 12` handler for Elixir of Arnica, injects `chem 97 1`
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:642-658` — `scrp 2 25 19 12` handler for General Cure, injects `chem 97 .15` alongside six other antidote chemicals
- `Rebuild/DOCUMENTATION/chemicals/070 - Glycotoxin.md` — paired toxin documentation detailing Reaction 88 (Glycogen raid), Receptor 30 (somatic injury) and the full Glycotoxin-poisoning lifecycle that Reaction 89 terminates
- `Rebuild/DOCUMENTATION/caos_scripts/bacteria.md` — the canonical delivery vector, the bacterium agent whose OV16 roll determines which toxin (70–81) it injects every tick while active
