# 073 - Histamine A

Histamine A is chemical slot 73 in the Creatures 3 chemistry and the fourth entry in the canonical **bacterial-toxin block** (chemicals 70-81). Unlike the purely-external toxins of the block (Glycotoxin, Sleep toxin, Fever toxin), Histamine A is **dual-sourced**: it can be delivered straight into a host's bloodstream by the bacterium agent family (`bacteria.cos`) as a rolled OV16 toxin, **and** it is produced endogenously by the creature's own immune system as a by-product of the antibody reaction against Antigen 1 (reaction 93, `2× Antigen 1 [83] → 12× Antibody 1 [103] + 1× Histamine A [73]`). This makes Histamine A the in-chemistry signature of an immune response — the chemical that models the "allergic" / "inflammatory" symptoms of fighting off an infection, in addition to being a directly-injected toxin.

In-game, Histamine A's effect is wired to a single, very distinctive mechanism: a direct receptor on the creature's **LOC_INVOLUNTARY2 (Cough)** locus that makes the creature cough whenever chemical 73 is elevated. Histamine A and its sibling [Histamine B (074)](../CreaturesData/biochemistry.json) are the canonical "cough and sneeze" chemicals of the game — Histamine A drives the cough reflex, Histamine B drives the shiver reflex (LOC_INVOLUNTARY3), and together they produce the audible, visually-distinctive respiratory symptoms that tell an attentive player "this creature is sick". The **Cough Syrup** potion from the Materia Medica Creature Disk is designed explicitly around these two chemicals: *"This syrup is to cure Creatures who are coughing and sneezing. It contains Antihistamine which breaks down Histamine A & B in the bloodstream."*

Unlike most toxins in the 70-81 block, Histamine A has a **dedicated pharmacological clearance pathway**: reaction 74 consumes 1× Histamine A with 1× [Antihistamine (100)](../CreaturesData/biochemistry.json) and produces nothing, giving the Cough Syrup (and the General Cure potion) a working biochemical handle on the chemical. Histamine A is explicitly named in the General Cure potion's documented toxin list — *"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"* — and it is one of the named, scanner-detectable toxins surfaced by the Medical Pod and Medical Scanner diagnostics. Passive decay is **Long** at 1,241 ticks (decay rate 0.99944, ~41 seconds of real play per halving at 30 tps), so an untreated Histamine A load takes a few minutes to fade by itself once the source is removed.

The clinical presentation of elevated Histamine A is therefore clear-cut: a creature coughing repeatedly, with the chemistry panel showing a rising Histamine A reading, either directly from a bacterial infection (`ov16 = 73`) or as the immune-system's own response to any Antigen-1-bearing bacterium. The cure is equally clear-cut: feed Cough Syrup (Antihistamine), let the antibody response finish suppressing the bacterium, or wait out the passive decay.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Endogenous immune response** (reaction 93) | Gene 86 (reaction 93, Baby onwards) | `2× Antigen 1 [83] → 12× Antibody 1 [103] + 1× Histamine A [73]`, half-life 58 ticks ("Short", decay rate 0.988) | The single **endogenous** producer of Histamine A in the standard genome. Each time the creature's immune system burns two units of Antigen 1 to produce Antibody 1, it also releases one unit of Histamine A as an inflammatory by-product. This models the real-world role of histamine as a signalling molecule released during an allergic / immune response, and it is the reason a creature fighting off an Antigen-1-bearing bacterium will cough even if the bacterium itself is not directly injecting chemical 73. The fast Short half-life means the reaction activates quickly whenever antigen is present, so Histamine A appears in the bloodstream shortly after the immune system starts responding |
| 2 | **Bacterial infection** (direct injection as rolled toxin) | `bacteria.cos` (family/genus/species `2 32 23`), OV16 | Every timer tick while the bacterium is active (not dormant), inject `ov17` (0.005-0.050) units of `ov16` into the host | OV16 is rolled per-bacterium and may take any value in 70-81; when OV16 = 73 the bacterium is a Histamine-A carrier. The bacterium's entry in `DOCUMENTATION/caos_scripts/bacteria.md` lists Histamine A under its canonical effect "Immune/allergic response". A single chronic infection will dose the host with 0.005-0.050 Histamine A every tick until antibodies suppress the bacterium or the host is removed from its range. Note that this pathway is **independent** of reaction 93 — a Histamine-A-carrying bacterium floods the host with chemical 73 directly, without needing the Antigen-1 immune pathway to fire |
| 3 | **Indirect via any Antigen-1-bearing bacterium** | `bacteria.cos` when OV15 = 83 | Reaction 93 fires on the injected Antigen 1 | Because reaction 93 produces Histamine A as a by-product of the Antigen-1 antibody response, **any** bacterium whose OV15 rolls to 83 will cause the host to produce Histamine A endogenously, regardless of what its OV16 toxin is. This means cough symptoms can appear alongside *any* toxin (Sleep, Fever, Glycotoxin, etc.) whenever the infecting bacterium happens to be an Antigen-1 carrier — a common diagnostic overlap that makes "coughing creature" a signal of "immune system is fighting Antigen 1", not specifically "bacterium is Histamine-A-dosed" |
| 4 | **Cough-themed agents / food** | User-made `.agents` / `.cob` files | `CHEM TARG 73 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "pollen"-style allergen, a dusty-room agent, or an irritant toy use chemical 73 directly because its cough output is recognisable and its clearance pathway (Antihistamine) is well-known to players |
| 5 | **CAOS injection** | — | `CHEM TARG 73 <amount>` from scripts or the debug console | The route used for testing the cough receptor and the Antihistamine reaction. The Long passive half-life (1,241 ticks) keeps an injected dose visible in the chemistry panel for roughly 40 seconds of real play before passive decay alone clears it |

Histamine A's dual-source nature (direct injection **plus** endogenous immune-response by-product) makes it the most routinely-present chemical in the 70-81 block. Most Creatures 3 players will see chemical 73 rise in a creature's chemistry panel multiple times across its life, because every time the immune system fights off an Antigen-1 bacterium it produces some Histamine A as a side-effect — even if the bacterium itself was delivering a completely different toxin.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Cough reflex receptor** (primary effect pathway) | 93 (receptor 70, Baby onwards) | Creature / Sensorimotor | `LOC_INVOLUNTARY2 (Cough)` | 16 | 0 | 255 | none | The canonical effect pathway. An analogue receptor (no flags, i.e. positive-direction) with threshold 16 and the maximum possible gain of 255 drives the LOC_INVOLUNTARY2 involuntary-action locus whenever Histamine A exceeds the threshold. The involuntary-action system then fires the creature's cough animation and audio. Because the receptor sits on the **Creature / Sensorimotor** tissue (organ 1, tissue 4), it applies uniformly to the whole creature — any Histamine A load above threshold produces a coughing creature |
| 2 | **Antihistamine antidote reaction** (pharmacological clearance) | 153 (reaction 74, Baby onwards) | Reaction / Somatic | `1× Histamine A [73] + 1× Antihistamine [100] → (nothing)`, half-life 10 ticks ("Very short", decay rate 0.931) | — | — | — | — | The stock-genome clearance pathway. Each activation consumes one unit of Histamine A with one unit of Antihistamine and produces no products — a clean neutralisation. The Very-short half-life (10 ticks) is one of the fastest antidote reactions in the whole genome, so any Antihistamine delivered to a coughing creature burns down its Histamine A within a fraction of a second, immediately stopping the cough. This is the biochemistry underneath the Cough Syrup potion and the reason Histamine A appears in the General Cure's documented toxin list |
| 3 | **Listed in General Cure** | Materia Medica / community pharma | — | — | — | — | — | — | The General Cure potion (documented as treating *"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"*) delivers Antihistamine alongside other antidote reactants, so Histamine A is curable by the general-purpose potion in addition to the dedicated Cough Syrup. A pure Antihistamine dose is also sufficient because reaction 74 consumes Histamine A 1:1 with Antihistamine alone |
| 4 | **Passive decay** | — | — | Half-life **1,241 ticks** ("Long", decay rate 0.99944) | — | — | — | — | The fallback clearance pathway. ~41 seconds of real play time per halving at 30 tps. Faster than Sleep toxin's 1,513 ticks but slower than the block's medium toxins, so Histamine A decays away in a few minutes of wall-clock time on its own once the source is removed. Because the Cough receptor threshold is 16 (a moderate value) and the Long half-life chews through any dose quickly enough, untreated Histamine A exposures typically stop producing cough symptoms within a minute or two even without medicine |
| 5 | **No dedicated injury receptor** | — | — | — | — | — | — | — | Unlike Glycotoxin (146) or Geddonase (91), Histamine A has **no `RLOCUS_INJURY` receptor** on any somatic organ. The chemical produces no organ damage at any concentration — its entire effect is the involuntary cough reflex. This makes Histamine A one of the **safest** toxins in the 70-81 block: even a heavy, sustained dose produces only the cough symptom plus slight metabolic energy cost from the repeated reflex, with no lasting tissue damage |
| 6 | **Diagnostic visibility** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Histamine A is named and surfaced by the Medical Scanner and Medical Pod computers alongside the other stock toxins (Histamine B, Cyanide, Heavy Metals, Belladonna, etc.). The Materia Medica ChemicalNames catalogue entry 125 displays the chemical as "Histamine A" in-game, and the Medical Pod's toxin-name variable (`ov71`) stores it when Histamine A is the highest-concentration toxin in the creature's blood |

The usage table describes a **"noisy but benign"** toxin: one involuntary-action receptor that produces the characteristic cough reflex, one Very-short antidote reaction that the Cough Syrup and General Cure potions exploit, no injury wire at all, and a Long passive half-life that clears untreated exposures within minutes. Histamine A is the block's **symptomatic-but-harmless** entry — loud, visible, and curable, but not fundamentally dangerous.

## Role in Game Mechanics

### The Cough reflex receptor: why creatures cough when they're sick

Receptor 70 (gene 93) is Histamine A's defining effect. It wires chemical 73 directly into the creature's LOC_INVOLUNTARY2 (Cough) involuntary-action locus:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Organ | 1 (Creature) | Creature-level involuntary-action system |
| Tissue | 4 (Sensorimotor) | Involuntary-action tissue layer |
| Locus | 2 (LOC_INVOLUNTARY2) | **Cough** reflex |
| Threshold | 16 | Moderate trigger — small traces of Histamine A don't cough |
| Nominal | 0 | No baseline activation |
| Gain | 255 | Maximum — any above-threshold Histamine A saturates the cough signal |
| Flags | 0 | Analogue, positive-direction (no REDUCE) |

The threshold of 16 is the critical tuning parameter: it means a creature with tiny amounts of Histamine A (e.g. the trickle produced by the immune system fighting a mild Antigen-1 exposure) will not cough, but any meaningful load — whether from a chronic bacterial infection or from a vigorous immune response — will exceed the threshold and fire the cough reflex repeatedly. The maximum gain (255) means the reflex is a pure on/off affair once the threshold is crossed: there is no "slightly coughing" behaviour, the creature either coughs or doesn't.

The involuntary-action system, which processes LOC_INVOLUNTARY0-7 signals, responds to LOC_INVOLUNTARY2 by triggering the creature's cough animation script (pose change, head movement) and its cough sound effect. This is one of the game's most distinctive audio cues — a coughing creature is immediately recognisable and prompts the player to investigate.

A subtle and important consequence: because reaction 93 (Antigen 1 → Antibody 1 + Histamine A) produces Histamine A as an immune-response by-product, any Antigen-1-carrying bacterium will cause the host to cough *regardless* of what the bacterium's actual toxin is. This is the biochemistry behind the classic "my creature keeps coughing but I can't find what's poisoning it" scenario — the cough is the immune system itself, not a direct toxin effect, and it will stop once the antibody response has suppressed the bacterium below its dormancy threshold.

### The Antihistamine antidote reaction and the Cough Syrup

Reaction 74 (gene 153) is the pharmacological clearance pathway:

```
1× Histamine A [73] + 1× Antihistamine [100] → (nothing)
```

This is the biochemistry underneath the **Cough Syrup** potion from the Materia Medica Creature Disk. The Cough Syrup delivers Antihistamine (chemical 100), which reacts 1:1 with Histamine A and is consumed alongside it. The Very-short half-life (10 ticks, decay rate 0.931) is one of the fastest reaction speeds in the entire standard genome — an Antihistamine load burns down Histamine A within a fraction of a second of arrival. This makes the Cough Syrup a **decisive, fast-acting cure**: the coughing stops almost immediately after the creature swallows the syrup.

The catalogue text for the Cough Syrup (`Assets/Catalogue/Materia Medica.catalogue:116`) is explicit:

> This syrup is to cure Creatures who are coughing and sneezing. It contains Antihistamine which breaks down Histamine A & B in the bloodstream.
>
> These two histamine toxins causes your Creature to cough and sneeze, so if you notice this obvious sound this is the Syrup for you!
>
> If you have a Creature suffering from the effects of Histamine A or B, make sure they drink this syrup and do your best to keep them well fed and rested.

The same reaction makes Histamine A curable by the **General Cure** potion as well, which is documented as treating *"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"* — the General Cure's Antihistamine content is weaker than the Cough Syrup's, so it takes longer to fully clear a heavy Histamine A load, but it still works via the same reaction.

Note the symmetry with Histamine B: reaction 75 (`1× Histamine B + 1× Antihistamine → nothing`) uses the same Antihistamine to clear chemical 74. A single dose of Antihistamine therefore cures both cough (Histamine A → LOC_INVOLUNTARY2) and shiver (Histamine B → LOC_INVOLUNTARY3) symptoms at once, which is why the Cough Syrup text mentions "coughing and sneezing" as a combined syndrome — both chemicals share the same antidote.

### Interaction with the bacterial infection and immune system

Histamine A is uniquely placed in the bacterial infection loop because it is produced both *by* the bacterium (if OV16 = 73) and *by* the host's own response to any Antigen-1-carrying bacterium (if OV15 = 83). The full loop looks like this:

1. **Bacterium injects Antigen 1** (0.02 units per tick, every tick while active).
2. **Reaction 93 fires** on accumulated Antigen 1, consuming 2 units and producing 12 units of Antibody 1 **plus** 1 unit of Histamine A.
3. **Histamine A exceeds the cough threshold (16)**, firing the cough reflex.
4. **Antibody 1 accumulates** and eventually crosses the bacterium's dormancy threshold, stopping antigen injection.
5. **Antigen 1 decays** (passive decay), reaction 93 stops firing, Histamine A production stops.
6. **Histamine A decays** (Long, 1,241 ticks) or is cleared by Antihistamine if the player has fed Cough Syrup.
7. **Cough reflex stops** when Histamine A falls back below threshold 16.

If the bacterium is **additionally** a Histamine-A carrier (OV16 = 73), the host gets a direct injection of 0.005-0.050 Histamine A per tick on top of the reaction-93 output, producing a more severe and sustained cough symptom. In this case the immune system's Antibody-1 response still shuts down the bacterium eventually, but the coughing is more prolonged and the Antihistamine reaction (Cough Syrup) provides a more valuable shortcut to symptom relief.

This layered design means Histamine A is the **most commonly-observed bacterial chemical** in the game — almost every bacterial infection produces some cough symptoms, because any bacterium rolling Antigen 1 triggers the endogenous production pathway. Players quickly learn to associate coughing with infection and Cough Syrup with cure.

### Why Histamine A is benign relative to the other block toxins

Histamine A is the **least dangerous** toxin in the 70-81 block because:

- **No injury receptor**: unlike Glycotoxin (146) or Fear toxin (which have `RLOCUS_INJURY` wires on somatic organs), Histamine A causes no organ damage at any concentration.
- **No metabolic disruption**: unlike Fever toxin (which accelerates organ clockrate) or ATP Decoupler (which disrupts ATP production), Histamine A has no receptor on any metabolic locus.
- **No drive hijacking**: unlike Sleep toxin (which drives the Sleepiness drive) or Fear toxin (which drives Fear), Histamine A does not target any of the creature's drive chemicals.
- **Fast, clean antidote**: the Antihistamine reaction (74) is one of the fastest clearance reactions in the genome, and the Cough Syrup delivers plenty of Antihistamine.
- **Moderate threshold**: the cough receptor's threshold of 16 means small traces produce no symptoms.

The only lasting cost of a chronic Histamine A exposure is the **metabolic expense** of the repeated cough reflex itself (each cough burns a tiny amount of energy) and the **behavioural disruption** of the coughing animation interrupting other actions. A creature can be dosed with heavy, sustained Histamine A without any risk of death or permanent injury — the chemical is a symptom, not a threat.

### Strategic / gameplay implications

- **Cough is a diagnostic, not a death warrant**: when a player hears a creature coughing, it signals "something is producing Histamine A" — usually a bacterial infection that is being successfully fought off by the immune system. The cough is *evidence of a working immune response*, not necessarily evidence of mortal danger.
- **Cough Syrup is the first-line tool**: the Cough Syrup is one of the fastest-acting potions in the game thanks to reaction 74's Very-short half-life. A single dose stops coughing within seconds, making it a highly satisfying, responsive player tool.
- **Sound-based early warning**: because coughing has a distinctive audio cue, players often hear a sick creature before they see any chemistry-panel evidence. Histamine A is therefore the game's **audible infection indicator**.
- **General Cure works but is slower**: the General Cure potion treats Histamine A alongside Cyanide, ATP Decoupler, etc., but its Antihistamine content is lower than the Cough Syrup's. For a pure cough symptom, Cough Syrup is the better choice; for multi-toxin poisoning, the General Cure covers Histamine A as a bonus.
- **Ignore mild cases**: because passive decay is Long (1,241 ticks) and there is no injury pathway, mild, transient coughing (e.g. during a short bacterial exposure) can safely be ignored — the creature will clear the chemical on its own within a couple of minutes once the source is gone.
- **Community "sneeze" and "allergen" agents**: modders use Histamine A as the canonical chemical for any cough-themed agent — dusty rooms, pollen clouds, peppery food. It is a natural choice because the cough reflex is recognisable and the cure (Cough Syrup) is well-understood by players.

### Diagnostic visibility

The Medical Scanner and Medical Pod computers name Histamine A in their toxin panels, so a player docking a coughing creature will see **"Histamine A"** appear in the pod's toxin-detected readout (variable `ov71` stores the name of the highest-concentration toxin). Combined with the audio cue of the cough reflex itself, Histamine A is one of the most *self-diagnosing* chemicals in the game — the creature tells you it is sick, and the pod confirms which specific chemical is responsible.

The canonical clinical signature of elevated Histamine A is:

- Audible cough reflex firing repeatedly.
- Chemistry panel shows Histamine A > 16 (above threshold).
- Medical Pod displays "Histamine A" as the detected toxin name.
- Often accompanied by elevated Antigen 1 (if immune-response-driven) or elevated Antibody 1 (if the response is well underway).
- Symptoms resolve within seconds of the creature drinking Cough Syrup.

## Summary

Histamine A is the fourth entry in the bacterial-toxin block (70-81) and the block's **symptomatic respiratory** chemical. It is defined by a single involuntary-action wire — receptor 70 (gene 93) on the **LOC_INVOLUNTARY2 (Cough)** locus, with threshold 16 and maximum gain 255 — that fires the creature's cough reflex whenever chemical 73 exceeds a moderate baseline. Unlike most toxins in the block it has a dedicated pharmacological clearance pathway: reaction 74 (gene 153) consumes 1× Histamine A with 1× Antihistamine at a Very-short half-life of 10 ticks, giving the Cough Syrup (and the General Cure potion) a decisive, fast-acting cure. What makes Histamine A unique in the block is its **dual sourcing**: it is delivered directly by the bacterium agent when OV16 rolls to 73, *and* it is produced endogenously by reaction 93 as a by-product of the Antigen 1 antibody response — meaning any Antigen-1-carrying bacterium causes the host to cough regardless of what its actual toxin is. This makes Histamine A the most commonly-observed bacterial chemical in the game, the source of the distinctive "coughing creature" audio cue, and the biochemistry underneath the Cough Syrup potion's famous role-fit to its name. With no injury receptor, no metabolic disruption, no drive hijacking, and a fast antidote reaction, Histamine A is also the **safest** toxin in the 70-81 block: it produces a noisy, visible symptom that prompts player intervention, but the symptom itself is harmless and clears quickly through the passive decay (Long, 1,241 ticks, ~41 s per halving), the self-depleting stoichiometry of reaction 74, or a single swallow of Cough Syrup.
