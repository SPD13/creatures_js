# 074 - Histamine B

Histamine B is chemical slot 74 in the Creatures 3 chemistry and the fifth entry in the canonical **bacterial-toxin block** (chemicals 70-81). Like its sibling [Histamine A (073)](073%20-%20Histamine%20A.md), Histamine B is **dual-sourced**: it can be delivered straight into a host's bloodstream by the bacterium agent family (`bacteria.cos`) as a rolled OV16 toxin, **and** it is produced endogenously by the creature's own immune system as a by-product of the antibody reaction against Antigen 0 (reaction 92, `2× Antigen 0 [82] → 12× Antibody 0 [102] + 1× Histamine B [74]`). Histamine B is therefore the in-chemistry signature of an **Antigen-0 immune response**, exactly paralleling Histamine A's role for Antigen 1 — the two histamines split the antigen space between them and together model the inflammatory side-effect of any immune response to a standard-genome bacterial antigen.

In-game, Histamine B's effect is wired to a single, very distinctive mechanism: a direct receptor on the creature's **LOC_INVOLUNTARY3 (Shiver)** locus that fires the involuntary shiver / sneeze reflex whenever chemical 74 is elevated. Histamine A drives LOC_INVOLUNTARY2 (Cough) via receptor 70; Histamine B drives LOC_INVOLUNTARY3 (Shiver) via receptor 71. Together they are the canonical "cough and sneeze" chemicals of the game, and the **Cough Syrup** potion from the Materia Medica Creature Disk is designed explicitly around both of them: *"This syrup is to cure Creatures who are coughing and sneezing. It contains Antihistamine which breaks down Histamine A & B in the bloodstream."*

Like Histamine A, Histamine B has a **dedicated pharmacological clearance pathway**: reaction 75 consumes 1× Histamine B with 1× [Antihistamine (100)](../CreaturesData/biochemistry.json) and produces nothing, giving the Cough Syrup (and the General Cure potion) a working biochemical handle on the chemical. The stoichiometry and Very-short half-life (10 ticks) exactly mirror the Histamine A clearance reaction (74), which is why a single dose of Antihistamine neutralises both histamines simultaneously and the Cough Syrup cures *"coughing and sneezing"* as a combined syndrome. Histamine B is explicitly named in the General Cure potion's documented toxin list — *"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"* — and it is one of the named, scanner-detectable toxins surfaced by the Medical Pod and Medical Scanner diagnostics. Passive decay is **Long** at 1,241 ticks (decay rate 0.99944, ~41 seconds of real play per halving at 30 tps), identical to Histamine A, so an untreated Histamine B load takes a few minutes to fade by itself once the source is removed.

The clinical presentation of elevated Histamine B is therefore the mirror image of Histamine A's: a creature shivering / sneezing repeatedly, with the chemistry panel showing a rising Histamine B reading, either directly from a bacterial infection (`ov16 = 74`) or as the immune-system's own response to any Antigen-0-bearing bacterium. The cure is the same: feed Cough Syrup (Antihistamine), let the antibody response finish suppressing the bacterium, or wait out the passive decay.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Endogenous immune response** (reaction 92) | Gene 85 (reaction 92, Baby onwards) | `2× Antigen 0 [82] → 12× Antibody 0 [102] + 1× Histamine B [74]`, half-life 52 ticks ("Short", decay rate 0.987) | The single **endogenous** producer of Histamine B in the standard genome. Each time the creature's immune system burns two units of Antigen 0 to produce Antibody 0, it also releases one unit of Histamine B as an inflammatory by-product. This is the exact parallel of reaction 93 (which produces Histamine A from Antigen 1), and it models the real-world role of histamine as a signalling molecule released during an immune response. Any bacterium whose rolled OV15 is 82 will cause the host to produce Histamine B endogenously, regardless of what toxin OV16 it carries. The Short half-life means the reaction activates quickly whenever Antigen 0 is present, so Histamine B appears in the bloodstream shortly after the immune system starts responding |
| 2 | **Bacterial infection** (direct injection as rolled toxin) | `bacteria.cos` (family/genus/species `2 32 23`), OV16 | Every timer tick while the bacterium is active (not dormant), inject `ov17` (0.005-0.050) units of `ov16` into the host | OV16 is rolled per-bacterium and may take any value in 70-81; when OV16 = 74 the bacterium is a Histamine-B carrier. The bacterium's entry in `DOCUMENTATION/caos_scripts/bacteria.md` lists Histamine B under its canonical effect "Immune/allergic response" (sneeze variant). A single chronic infection will dose the host with 0.005-0.050 Histamine B every tick until antibodies suppress the bacterium or the host is removed from its range. This pathway is **independent** of reaction 92 — a Histamine-B-carrying bacterium floods the host with chemical 74 directly, without needing the Antigen-0 immune pathway to fire |
| 3 | **Indirect via any Antigen-0-bearing bacterium** | `bacteria.cos` when OV15 = 82 | Reaction 92 fires on the injected Antigen 0 | Because reaction 92 produces Histamine B as a by-product of the Antigen-0 antibody response, **any** bacterium whose OV15 rolls to 82 will cause the host to produce Histamine B endogenously, regardless of what its OV16 toxin is. This means sneeze symptoms can appear alongside *any* toxin (Sleep, Fever, Glycotoxin, Cyanide, etc.) whenever the infecting bacterium happens to be an Antigen-0 carrier — a common diagnostic overlap that makes "sneezing creature" a signal of "immune system is fighting Antigen 0", not specifically "bacterium is Histamine-B-dosed" |
| 4 | **Sneeze-themed agents / irritants** | User-made `.agents` / `.cob` files | `CHEM TARG 74 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "cold-weather", "pepper", "dust" or "pollen-sneeze" agent use chemical 74 directly because its shiver/sneeze output is recognisable and its clearance pathway (Antihistamine) is well-known to players. The pairing with Histamine A for "pollen"-style allergen agents is particularly common |
| 5 | **CAOS injection** | — | `CHEM TARG 74 <amount>` from scripts or the debug console | The route used for testing the shiver receptor and the Antihistamine reaction. The Long passive half-life (1,241 ticks) keeps an injected dose visible in the chemistry panel for roughly 40 seconds of real play before passive decay alone clears it |

Histamine B's dual-source nature (direct injection **plus** endogenous immune-response by-product of Antigen 0) makes it the second most routinely-present chemical in the 70-81 block, alongside Histamine A. Because the standard bacterial genome splits antigens evenly between Antigen 0 and Antigen 1, roughly half of all bacterial infections will cause the host to produce Histamine B endogenously, even when the bacterium's rolled OV16 toxin is something entirely different.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Shiver / sneeze reflex receptor** (primary effect pathway) | 94 (receptor 71, Baby onwards) | Creature / Sensorimotor | `LOC_INVOLUNTARY3 (Shiver)` | 16 | 0 | 255 | none | The canonical effect pathway. An analogue receptor (no flags, i.e. positive-direction) with threshold 16 and the maximum possible gain of 255 drives the LOC_INVOLUNTARY3 involuntary-action locus whenever Histamine B exceeds the threshold. The involuntary-action system then fires the creature's shiver/sneeze animation and audio. Because the receptor sits on the **Creature / Sensorimotor** tissue (organ 1, tissue 4), it applies uniformly to the whole creature — any Histamine B load above threshold produces a shivering/sneezing creature. The receptor's shape and tuning exactly mirror receptor 70 (Histamine A → Cough), giving the two histamines a symmetric, parallel effect profile |
| 2 | **Antihistamine antidote reaction** (pharmacological clearance) | 154 (reaction 75, Baby onwards) | Reaction / Somatic | `1× Histamine B [74] + 1× Antihistamine [100] → (nothing)`, half-life 10 ticks ("Very short", decay rate 0.931) | — | — | — | — | The stock-genome clearance pathway. Each activation consumes one unit of Histamine B with one unit of Antihistamine and produces no products — a clean neutralisation. The Very-short half-life (10 ticks) is one of the fastest antidote reactions in the whole genome, so any Antihistamine delivered to a sneezing creature burns down its Histamine B within a fraction of a second, immediately stopping the reflex. This is the biochemistry underneath the Cough Syrup potion and the reason Histamine B appears in the General Cure's documented toxin list. Crucially, this reaction and the Histamine A clearance reaction (74) share the same Antihistamine reactant, so a single Antihistamine dose simultaneously clears both histamines |
| 3 | **Listed in General Cure** | Materia Medica / community pharma | — | — | — | — | — | — | The General Cure potion (documented as treating *"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"*) delivers Antihistamine alongside other antidote reactants, so Histamine B is curable by the general-purpose potion in addition to the dedicated Cough Syrup. A pure Antihistamine dose is also sufficient because reaction 75 consumes Histamine B 1:1 with Antihistamine alone |
| 4 | **Passive decay** | — | — | Half-life **1,241 ticks** ("Long", decay rate 0.99944) | — | — | — | — | The fallback clearance pathway, identical to Histamine A. ~41 seconds of real play time per halving at 30 tps. Faster than Sleep toxin's 1,513 ticks but slower than the block's medium toxins, so Histamine B decays away in a few minutes of wall-clock time on its own once the source is removed. Because the Shiver receptor threshold is 16 (a moderate value) and the Long half-life chews through any dose quickly enough, untreated Histamine B exposures typically stop producing sneeze symptoms within a minute or two even without medicine |
| 5 | **No dedicated injury receptor** | — | — | — | — | — | — | — | Unlike Glycotoxin (070) or Geddonase (069), Histamine B has **no `RLOCUS_INJURY` receptor** on any somatic organ. The chemical produces no organ damage at any concentration — its entire effect is the involuntary shiver/sneeze reflex. This makes Histamine B, like Histamine A, one of the **safest** toxins in the 70-81 block: even a heavy, sustained dose produces only the sneeze symptom plus slight metabolic energy cost from the repeated reflex, with no lasting tissue damage |
| 6 | **Diagnostic visibility** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Histamine B is named and surfaced by the Medical Scanner and Medical Pod computers alongside the other stock toxins (Histamine A, Cyanide, Heavy Metals, Belladonna, etc.). The Materia Medica ChemicalNames catalogue displays the chemical as "Histamine B" in-game, and the Medical Pod's toxin-name variable (`ov71`) stores it when Histamine B is the highest-concentration toxin in the creature's blood |

The usage table describes a **"noisy but benign"** toxin exactly paralleling Histamine A: one involuntary-action receptor that produces the characteristic sneeze reflex, one Very-short antidote reaction that the Cough Syrup and General Cure potions exploit, no injury wire at all, and a Long passive half-life that clears untreated exposures within minutes. Histamine B, like Histamine A, is the block's **symptomatic-but-harmless** entry — loud, visible, and curable, but not fundamentally dangerous.

## Role in Game Mechanics

### The Shiver / sneeze reflex receptor: why creatures sneeze when they're sick

Receptor 71 (gene 94) is Histamine B's defining effect. It wires chemical 74 directly into the creature's LOC_INVOLUNTARY3 (Shiver) involuntary-action locus:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Organ | 1 (Creature) | Creature-level involuntary-action system |
| Tissue | 4 (Sensorimotor) | Involuntary-action tissue layer |
| Locus | 3 (LOC_INVOLUNTARY3) | **Shiver** reflex (in practice the sneeze reflex in Creatures 3 norns) |
| Threshold | 16 | Moderate trigger — small traces of Histamine B don't sneeze |
| Nominal | 0 | No baseline activation |
| Gain | 255 | Maximum — any above-threshold Histamine B saturates the reflex signal |
| Flags | 0 | Analogue, positive-direction (no REDUCE) |

The threshold of 16, the gain of 255 and the flags of 0 are identical to receptor 70 (Cough), a deliberate symmetry that keeps both histamines behaving the same way in the chemistry panel even though they fire different involuntary-action loci. A creature with tiny amounts of Histamine B (e.g. the trickle produced by the immune system fighting a mild Antigen-0 exposure) will not sneeze, but any meaningful load — whether from a chronic bacterial infection or from a vigorous immune response — will exceed the threshold and fire the sneeze reflex repeatedly. The maximum gain means the reflex is a pure on/off affair once the threshold is crossed.

The involuntary-action system, which processes LOC_INVOLUNTARY0-7 signals, responds to LOC_INVOLUNTARY3 by triggering the creature's sneeze/shiver animation script (pose change, head jerk) and its sneeze sound effect. The Cough Syrup catalogue text explicitly calls the observable symptom "sneezing", even though the locus is named "Shiver" at the biochemistry layer — the audible cue is unmistakable and is one of the game's most distinctive infection signals.

A subtle and important consequence: because reaction 92 (Antigen 0 → Antibody 0 + Histamine B) produces Histamine B as an immune-response by-product, any Antigen-0-carrying bacterium will cause the host to sneeze *regardless* of what the bacterium's actual toxin is. This is the biochemistry behind the classic "my creature keeps sneezing but I can't find what's poisoning it" scenario — the sneeze is the immune system itself, not a direct toxin effect, and it will stop once the antibody response has suppressed the bacterium below its dormancy threshold.

### The Antihistamine antidote reaction and the Cough Syrup

Reaction 75 (gene 154) is the pharmacological clearance pathway:

```
1× Histamine B [74] + 1× Antihistamine [100] → (nothing)
```

This is the biochemistry underneath the **Cough Syrup** potion from the Materia Medica Creature Disk — the same potion that clears Histamine A. The Cough Syrup delivers Antihistamine (chemical 100), which reacts 1:1 with Histamine B and is consumed alongside it. The Very-short half-life (10 ticks, decay rate 0.931) is one of the fastest reaction speeds in the entire standard genome — an Antihistamine load burns down Histamine B within a fraction of a second of arrival. Combined with the parallel Histamine A clearance, this makes the Cough Syrup a **decisive, fast-acting dual-symptom cure**: a single swallow stops both coughing and sneezing within seconds.

The catalogue text for the Cough Syrup (`Assets/Catalogue/Materia Medica.catalogue:116`) is explicit:

> This syrup is to cure Creatures who are coughing and sneezing. It contains Antihistamine which breaks down Histamine A & B in the bloodstream.
>
> These two histamine toxins causes your Creature to cough and sneeze, so if you notice this obvious sound this is the Syrup for you!
>
> If you have a Creature suffering from the effects of Histamine A or B, make sure they drink this syrup and do your best to keep them well fed and rested.

The same reaction makes Histamine B curable by the **General Cure** potion as well, which is documented as treating *"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"*. The General Cure's Antihistamine content is weaker than the Cough Syrup's, so it takes longer to fully clear a heavy Histamine B load, but it still works via the same reaction.

The symmetry between Histamine A and Histamine B in the pharmacology is a deliberate design choice. The two reactions (74 and 75) have identical stoichiometry, identical reactants (Antihistamine), and identical rates. A player does not need to distinguish "which histamine" a creature is producing — a single Antihistamine-based potion cures both, and the Cough Syrup description wisely groups them together as "coughing and sneezing".

### Interaction with the bacterial infection and immune system

Histamine B, like Histamine A, is uniquely placed in the bacterial infection loop because it is produced both *by* the bacterium (if OV16 = 74) and *by* the host's own response to any Antigen-0-carrying bacterium (if OV15 = 82). The full loop mirrors Histamine A's exactly:

1. **Bacterium injects Antigen 0** (0.02 units per tick, every tick while active).
2. **Reaction 92 fires** on accumulated Antigen 0, consuming 2 units and producing 12 units of Antibody 0 **plus** 1 unit of Histamine B.
3. **Histamine B exceeds the sneeze threshold (16)**, firing the shiver/sneeze reflex.
4. **Antibody 0 accumulates** and eventually crosses the bacterium's dormancy threshold, stopping antigen injection.
5. **Antigen 0 decays** (passive decay), reaction 92 stops firing, Histamine B production stops.
6. **Histamine B decays** (Long, 1,241 ticks) or is cleared by Antihistamine if the player has fed Cough Syrup.
7. **Sneeze reflex stops** when Histamine B falls back below threshold 16.

If the bacterium is **additionally** a Histamine-B carrier (OV16 = 74), the host gets a direct injection of 0.005-0.050 Histamine B per tick on top of the reaction-92 output, producing a more severe and sustained sneeze symptom. In this case the immune system's Antibody-0 response still shuts down the bacterium eventually, but the sneezing is more prolonged and the Antihistamine reaction (Cough Syrup) provides a more valuable shortcut to symptom relief.

Because the standard bacterial genome splits antigens roughly evenly between Antigen 0 and Antigen 1, a player will see Histamine B (sneeze) alongside Histamine A (cough) at comparable frequencies across their creatures' lives. Every bacterial infection ends up producing *some* histamine symptom — either cough, or sneeze, or (rarely, when a bacterium happens to carry Antigen 0 *and* OV16=73, or Antigen 1 *and* OV16=74) both at once.

### Why Histamine B is benign relative to the other block toxins

Histamine B is, like Histamine A, among the **least dangerous** toxins in the 70-81 block because:

- **No injury receptor**: unlike Glycotoxin (070) or Fever toxin (072), Histamine B causes no organ damage at any concentration.
- **No metabolic disruption**: unlike Fever toxin (which accelerates organ clockrate) or ATP Decoupler (which disrupts ATP production), Histamine B has no receptor on any metabolic locus.
- **No drive hijacking**: unlike Sleep toxin (071) or Fear toxin, Histamine B does not target any of the creature's drive chemicals.
- **Fast, clean antidote**: the Antihistamine reaction (75) is one of the fastest clearance reactions in the genome, and the Cough Syrup delivers plenty of Antihistamine.
- **Moderate threshold**: the shiver receptor's threshold of 16 means small traces produce no symptoms.

The only lasting cost of a chronic Histamine B exposure is the **metabolic expense** of the repeated sneeze reflex itself (each sneeze burns a tiny amount of energy) and the **behavioural disruption** of the sneeze animation interrupting other actions. A creature can be dosed with heavy, sustained Histamine B without any risk of death or permanent injury — the chemical is a symptom, not a threat.

### Strategic / gameplay implications

- **Sneeze is a diagnostic, not a death warrant**: when a player hears a creature sneezing, it signals "something is producing Histamine B" — usually a bacterial infection that is being successfully fought off by the Antigen-0 immune response. The sneeze is *evidence of a working immune response*, not necessarily evidence of mortal danger.
- **Cough Syrup is the first-line tool for both histamines**: because reactions 74 and 75 share Antihistamine as reactant, a single dose of Cough Syrup addresses cough and sneeze at once. This is one of the most efficient first-aid responses in the game and players quickly learn to reach for the Cough Syrup at the first audible symptom.
- **Sound-based early warning**: the sneeze has a distinctive audio cue that is clearly differentiable from the cough, so players can tell which antigen the creature's immune system is fighting (Antigen 0 → sneeze → Histamine B, Antigen 1 → cough → Histamine A) even before looking at the chemistry panel.
- **General Cure works but is slower**: the General Cure potion treats Histamine B alongside Cyanide, ATP Decoupler, etc., but its Antihistamine content is lower than the Cough Syrup's. For pure histamine symptoms, Cough Syrup is the better choice; for multi-toxin poisoning, the General Cure covers Histamine B as a bonus.
- **Ignore mild cases**: because passive decay is Long (1,241 ticks) and there is no injury pathway, mild, transient sneezing (e.g. during a short bacterial exposure) can safely be ignored — the creature will clear the chemical on its own within a couple of minutes once the source is gone.
- **Community "sneeze" and "allergen" agents**: modders use Histamine B as the canonical chemical for any sneeze-themed agent — cold drafts, dust motes, pepper foods. It is a natural choice because the sneeze reflex is recognisable and the cure (Cough Syrup) is well-understood by players. Pairing Histamine A and Histamine B in a single agent (e.g. a pollen cloud) produces the full "hayfever" syndrome of simultaneous coughing and sneezing.

### Diagnostic visibility

The Medical Scanner and Medical Pod computers name Histamine B in their toxin panels, so a player docking a sneezing creature will see **"Histamine B"** appear in the pod's toxin-detected readout (variable `ov71` stores the name of the highest-concentration toxin). Combined with the audio cue of the sneeze reflex itself, Histamine B is one of the most *self-diagnosing* chemicals in the game — the creature tells you it is sick, and the pod confirms which specific chemical is responsible.

The canonical clinical signature of elevated Histamine B is:

- Audible sneeze/shiver reflex firing repeatedly.
- Chemistry panel shows Histamine B > 16 (above threshold).
- Medical Pod displays "Histamine B" as the detected toxin name.
- Often accompanied by elevated Antigen 0 (if immune-response-driven) or elevated Antibody 0 (if the response is well underway).
- Symptoms resolve within seconds of the creature drinking Cough Syrup.

### Relationship to Histamine A: the matched pair

Histamine A (073) and Histamine B (074) are a deliberately-designed **matched pair** in the Creatures 3 biochemistry:

| Feature | Histamine A (073) | Histamine B (074) |
|---------|-------------------|-------------------|
| Endogenous source reaction | 93 (gene 86) | 92 (gene 85) |
| Antigen consumed | Antigen 1 [83] | Antigen 0 [82] |
| Antibody produced | Antibody 1 [103] | Antibody 0 [102] |
| Receptor | 70 (gene 93) | 71 (gene 94) |
| Involuntary locus | 2 (Cough) | 3 (Shiver / sneeze) |
| Threshold | 16 | 16 |
| Gain | 255 | 255 |
| Flags | 0 | 0 |
| Antidote reaction | 74 (gene 153) | 75 (gene 154) |
| Antidote chemical | Antihistamine [100] | Antihistamine [100] |
| Antidote half-life | 10 ticks (Very short) | 10 ticks (Very short) |
| Passive decay half-life | 1,241 ticks (Long) | 1,241 ticks (Long) |
| Medical Pod visibility | Yes | Yes |
| Cured by Cough Syrup | Yes | Yes |
| Cured by General Cure | Yes | Yes |

Every numeric parameter is identical; the only differences are the antigen / antibody slots the endogenous reaction consumes and the involuntary-action locus the receptor targets. This is the same biochemistry played twice, once per antigen and once per reflex, and it lets the player perceive which antigen the immune system is fighting purely by listening to whether the creature is coughing or sneezing.

## Summary

Histamine B is the fifth entry in the bacterial-toxin block (70-81) and the block's **symptomatic sneeze** chemical — the sibling of Histamine A (073) and the pair's **Antigen-0** half. It is defined by a single involuntary-action wire — receptor 71 (gene 94) on the **LOC_INVOLUNTARY3 (Shiver)** locus, with threshold 16 and maximum gain 255 — that fires the creature's sneeze reflex whenever chemical 74 exceeds a moderate baseline. Like Histamine A, it has a dedicated pharmacological clearance pathway: reaction 75 (gene 154) consumes 1× Histamine B with 1× Antihistamine at a Very-short half-life of 10 ticks, giving the Cough Syrup (and the General Cure potion) a decisive, fast-acting cure. Its **dual sourcing** exactly mirrors Histamine A: it is delivered directly by the bacterium agent when OV16 rolls to 74, *and* it is produced endogenously by reaction 92 as a by-product of the Antigen 0 antibody response — meaning any Antigen-0-carrying bacterium causes the host to sneeze regardless of what its actual toxin is. Because Antigens 0 and 1 are rolled in roughly equal proportions across bacteria, sneezing (Histamine B) is as common as coughing (Histamine A) in normal play, and together the two chemicals produce the game's characteristic "sick creature" audio syndrome. With no injury receptor, no metabolic disruption, no drive hijacking, and a fast antidote reaction shared with Histamine A, Histamine B is among the **safest** toxins in the 70-81 block: it produces a noisy, visible symptom that prompts player intervention, but the symptom itself is harmless and clears quickly through the passive decay (Long, 1,241 ticks, ~41 s per halving), the self-depleting stoichiometry of reaction 75, or a single swallow of Cough Syrup — the same swallow that simultaneously clears its sibling Histamine A.
