# 095 - EDTA

EDTA is chemical slot 95 in the Creatures 3 biochemistry. The stock chemical-library descriptor at `Rebuild/Libraries/creatures-chemicals.js:119` reads "*Chelates heavy metals*" — and unlike many slots in the legacy table this description is exactly correct: EDTA is the **heavy-metal chelator**, the single chemical the genome wires up to scrub Heavy Metals (chem 66) out of the bloodstream. It exists for one purpose only — to participate in Reaction 91 (`1× Heavy Metals [66] + 1× EDTA [95] → (nothing)`), which annihilates a 1 : 1 molar amount of each reactant and produces no products. Without EDTA the body has no metabolic pathway to clear Heavy Metals; the chemical's half-life is functionally infinite (90 682 980 616 ticks ≈ 100 000 years at 30 tps), so any heavy-metal load a creature picks up is **permanent** until EDTA is administered. EDTA is therefore the only "antidote" in the entire stock chemistry that resolves an otherwise inescapable poisoning, and the player-facing *Materia Medica* explicitly frames it that way: "*This potion contains EDTA, which is a useful medicinal chemical that neutralises the effects of heavy metal build-up*" (`Materia Medica.catalogue:91`).

EDTA has **no endogenous synthesis pathway**. No reaction in the stock genome produces EDTA, and no emitter gene secretes it from any organ — the Shee built the receiving chemistry but no biology to make the chemical itself. Every molecule of EDTA in a creature's bloodstream comes from outside: either the dedicated single-chemical "Heavy Metal Cure" potion (`scrp 2 25 3 12`, 1.0 unit per bottle — the highest single-chemical dose in the entire Medicine Maker), the broad-spectrum "General Cure" potion (`scrp 2 25 19 12`, 0.15 unit alongside six other cure chemicals), or a CAOS injection from a custom agent or the debug console. Once injected EDTA is consumed primarily by Reaction 91 against any Heavy Metals present (half-life 24 ticks ≈ 0.8 s — "Short", a rapid scrubbing reaction); whatever remains after the Heavy Metals pool is exhausted then drains by passive decay at half-life 24 155 ticks (~13 minutes at 30 tps — "Very long"), one of the longest passive residence times in the entire chemistry. The combination of "very long passive decay" and "fast reactive consumption" gives the chemical a "wait until needed" character: an EDTA dose lingers in circulation for many minutes, and is only spent when the body actually has Heavy Metals to clear.

EDTA itself drives **no other receptors** — no organ, drive, brain lobe, or behaviour reads chem 95 directly. Its only mechanical effect on the creature is the indirect one of removing Heavy Metals: every unit of EDTA consumed by Reaction 91 also removes one unit of Heavy Metals from the bloodstream, which in turn reduces the Heavy-Metals-driven `RLOCUS_INJURY` damage on the three immune/reproductive organs that read chem 66, and lowers the gametes' `LOC_CHANCEOFMUTATION` (threshold 128) and `LOC_DEGREEOFMUTATION` (threshold 22) signals. The *Materia Medica* makes the downstream chain visible to the player: "*Most Creature with a large heavy metal build-up will be highly susceptible to organ damage in their immune and reproductive systems. Once these organs are damaged the Creature could have great difficulty in fighting diseases and may become unable to reproduce.*" EDTA is the only player-accessible lever that interrupts that cascade.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Heavy Metal Cure** (`2 25 3`) | Medicine Maker potion — `scrp 2 25 3 12` (`medicine maker.cos:545–553`) | `chem 95 1` (1.0 unit per bottle), single-chemical formulation | The dedicated EDTA potion, and the **largest single-chemical dose** the Medicine Maker delivers in any potion — five to six times bigger than the typical 0.15-unit "cure-token" dose. Unlike the multi-chemical broad-spectrum cures, this potion contains only EDTA: it is intended for targeted heavy-metal-poisoning treatment. The full bottle gives the body enough EDTA to clear ~1.0 normalised units of Heavy Metals before the chemical decays, more than sufficient for any normal poisoning load. *Materia Medica* (`134 - 136`): "*This potion contains EDTA … neutralises the effects of heavy metal build-up*" |
| 2 | **General Cure** (`2 25 19`) | Medicine Maker potion — `scrp 2 25 19 12` (`medicine maker.cos:642–658`) | `chem 95 .15` (0.15 units per bottle), bundled with six other cures at 0.15 each plus 0.45 Adrenalin | The broad-spectrum cure includes a "token" 0.15-unit EDTA dose alongside Antihistamine (100), Arnica (97), Medicine one (92), Anti-oxidant (93), Sodium thiosulphate (96), Prostaglandin (94), and Adrenalin (117). The 0.15-unit dose is small (1/7 of the dedicated potion) and intended as a partial top-up for a creature with a moderate heavy-metal load — it will not fully clear a heavily-contaminated creature; that is what the targeted potion exists for |
| 3 | **CAOS injection** | — | `CHEM TARG 95 <amount>` from console, custom agents, or debug scripts | The standard way to introduce EDTA for testing, or the expected extension point for custom medical agents (chelation IVs, environmental remediation devices, third-party potions, etc.). Because EDTA has no endogenous synthesis at all, the only way to get it into a creature outside of these two potions is via direct CHEM injection |

**There is no fourth source.** No reaction produces EDTA, no emitter gene secretes it, no environmental agent (food, plant, drink dispenser, weather effect) injects it. EDTA exists in the bloodstream **only** because the player administered a potion or a script wrote it directly.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Heavy-metal chelation reaction** (the only consumer) | Gene 82 — Reaction 91 | — | `1× Heavy Metals [66] + 1× EDTA [95] → (nothing)` | — | — | rate 32, half-life **24 ticks** ("Short", ~0.8 s at 30 tps) | — | The body's only heavy-metal scrubbing pathway. One unit of EDTA destroys one unit of Heavy Metals and yields no products on either side — both molecules are simply removed from the bloodstream. Half-life 24 ticks is fast enough that the reaction empties whichever reactant is in shorter supply within ~1 second once both are present. EDTA is the limiting reagent for the player's purposes (Heavy Metals lingers indefinitely); the moment EDTA enters circulation it begins clearing Heavy Metals at a rate proportional to the product of both concentrations |
| 2 | **Passive decay** | — | — | Half-life **24 155 ticks** ("Very long", decay rate 0.9999713) | — | — | — | Background clearance of EDTA that was not consumed by Reaction 91. ~13.4 minutes at 30 tps — among the **slowest passive decays in the entire chemistry** (Heavy Metals' 100 000-year half-life and a few antibody slots are slower; almost everything else is faster). The very long residence time means an EDTA dose works as a "standing chelation reservoir": even if there are no Heavy Metals in circulation when the potion is drunk, the EDTA stays in the bloodstream for many minutes and will react against any heavy-metal exposure that occurs in that window |

**No receptors.** The stock genome contains zero receptors that read chem 95. EDTA does not feed any organ injury locus, drive, emotion, brain lobe, behavioural signal, or reproductive parameter. Its sole mechanical effect is participation in Reaction 91; everything else the player sees (organ damage falling, fertility recovering) is a downstream consequence of the Heavy Metals concentration that EDTA reduces.

## Role in Game Mechanics

### What heavy metals do to a creature

To understand why EDTA exists at all, the role of Heavy Metals (chem 66) needs to be sketched:

- **Half-life 90 682 980 616 ticks** — effectively permanent. Once a creature accumulates Heavy Metals, the chemical does not decay on any timescale relevant to a play session.
- **Three `RLOCUS_INJURY` receptors** (genes 86, 87, 88) on tissue 0 (Somatic) of organ 2 (ORGAN_ORGAN), each with `threshold = 0`, `gain = 25` (~0.098 linear coefficient). Any Heavy Metals concentration immediately injures the three organs these receptors are wired to — the *Materia Medica* identifies them as "*the immune and reproductive systems*". Because injury accumulates short-term life-force damage that Prostaglandin (chem 94) can repair only up to the long-term baseline (which itself drifts down), a creature with chronic Heavy Metals contamination steadily destroys its immune and reproductive organs.
- **`LOC_CHANCEOFMUTATION`** (gene 118) on tissue 1 (Gametes), `threshold = 128`, `gain = 255` — once Heavy Metals exceeds half-saturation, the creature's gametes become highly mutation-prone, so any offspring it conceives carry randomised genome mutations.
- **`LOC_DEGREEOFMUTATION`** (gene 160) on tissue 1 (Gametes), `threshold = 22`, `gain = 255` — at even modest Heavy Metals loads (~9% of saturation), mutated genes drift further from their parental value.

The combined effect is a chemistry that **silently destroys both the immune system and the reproductive system** of any creature exposed to it, with the damage compounding over time and (because of the infinite half-life) impossible to escape through patience or rest.

### EDTA as the only escape route

EDTA is the genome's single biochemical answer to that trap. Reaction 91 is the only reaction in the stock chemistry that has Heavy Metals as a reactant on either side, and EDTA is the only chemical it consumes. The reaction's stoichiometry (`1 + 1 → nothing`) is the cleanest possible chelation model: one molecule of EDTA "captures" one molecule of Heavy Metals and both are removed from circulation. There is no intermediate product, no inert chelate complex, no downstream excretion chemistry — the genome simulates excretion implicitly by destroying both reactants.

The reaction's half-life of 24 ticks ("Short") is fast: once both reactants are present at non-trivial concentrations, the chelation is effectively complete within ~1 second of game time. This means the player's intervention pattern is "drink the potion → Heavy Metals concentration crashes immediately → injury and mutation receptors stop firing within the same second." There is no dragged-out recovery; the chemistry is fast-acting on the chelation step itself. The only delay the player perceives is the downstream healing of any organ damage already inflicted — that is Prostaglandin's job (chem 94, see `094 - Prostaglandin.md`) and runs on its own timescale.

### Dose sizing — why the dedicated potion delivers 1.0 unit

Most Medicine Maker potions deliver chemicals at the 0.15-unit "cure-token" level, which is the typical cure-chemical dose (Antihistamine, Arnica, Anti-oxidant, etc. all carry 0.15 units in the General Cure). The dedicated Heavy Metal Cure (`scrp 2 25 3 12`) breaks this pattern by delivering a full **1.0 unit** of EDTA — six to seven times the typical token dose, and the largest single-chemical dose any Medicine Maker potion delivers.

The reason is the stoichiometry of Reaction 91: every unit of EDTA destroys exactly one unit of Heavy Metals, so the EDTA dose needed to clear a creature's heavy-metal load equals the load itself. A creature that has been exposed for many in-game days may have accumulated a substantial Heavy Metals concentration (the chemical does not decay), and a 0.15-unit "token" dose would only chelate the first 0.15 units before being exhausted. The 1.0-unit dedicated potion is calibrated to clear essentially any heavy-metal contamination that might plausibly accumulate in a single play session. The 0.15-unit General Cure dose is a partial top-up — useful for a creature that has only mild contamination, or as a maintenance dose alongside the broader cure profile, but not sufficient for serious poisoning.

### Why the very-long passive decay matters

EDTA's passive half-life is 24 155 ticks (~13.4 minutes), among the longest in the chemistry. Combined with the fact that Reaction 91 only fires when **both** reactants are present, this gives EDTA a "patient antidote" character: a player can administer the Heavy Metal Cure prophylactically — before a creature is exposed to a heavy-metal source — and the EDTA will sit in circulation for many minutes, ready to react instantly with any Heavy Metals that subsequently appear.

This contrasts sharply with most other cure chemicals (Antihistamine, Anti-oxidant, Arnica) whose passive half-lives are much shorter (a few minutes at most) and which therefore must be administered *after* exposure to the toxin they neutralise. EDTA is one of the few cures in the stock chemistry that meaningfully supports "preventive" administration as well as "reactive" administration: the molecule lingers, waiting for substrate.

### The asymmetric reactant lifetimes

The two reactants in Reaction 91 have wildly different passive lifetimes: Heavy Metals at ~100 000 years, EDTA at ~13 minutes. This asymmetry encodes a clear gameplay statement: **Heavy Metals never goes away on its own**, and **EDTA is consumed (reactively or passively) within a play session**. The chemistry is a one-way removal pump — you can drive Heavy Metals down by adding EDTA, but you cannot drive EDTA down by adding Heavy Metals (it would already be vanishing on its own). The player's strategic responsibility is therefore unambiguous: when a creature shows signs of heavy-metal poisoning (fertility problems, weak immune system, organ damage on the medical scanner), administer EDTA. There is no biological self-healing pathway to wait for.

### Heavy-metal sources in the stock world

EDTA's role only matters if creatures actually pick up Heavy Metals from somewhere. The stock C3 world includes a small number of heavy-metal sources — typically toxic environmental hazards or specific contaminated foods — which are documented in `066 - Heavy Metals.md` (when present). The game does not contain large concentrated heavy-metal "dump" agents in the bootstrap; rather, low-level heavy-metal exposure tends to come from:

- Bacteria that secrete chem 66 as part of their toxin profile (some bootstrapped bacteria use Heavy Metals as one of several damage chemicals).
- Specific toxic plants or food items (genome-driven; varies by world).
- Direct CAOS injection from third-party agents (mods).

Because Heavy Metals never decays, even small repeated exposures over a creature's lifetime can accumulate to clinically significant loads. A long-lived creature in an environment with any heavy-metal sources at all will eventually need EDTA, even if it appears healthy in the short term.

### EDTA as an "invisible" chemical to the creature

A design pattern repeated across most cure chemicals: EDTA itself drives no perception, no drive, no emotion, and no brain lobe. The creature does not "feel" EDTA in its bloodstream — there is no receptor for "EDTA satiation" or "EDTA hunger". The chemistry is purely metabolic: the player administers it, the body consumes it against any Heavy Metals present, and the downstream observables (Heavy Metals dropping, organ injury falling, mutation receptor signals decreasing, fertility recovering over time) emerge naturally without the creature being conscious of the chelating agent at all. The same pattern recurs in Prostaglandin (chem 94 — invisible healing coefficient), Antihistamine (chem 100), Arnica (chem 97), and the antibody slots — they are mechanics, not percepts.

The player-facing *Materia Medica* names EDTA explicitly and explains the chemistry to the human reader, but in-game the creature has no equivalent self-knowledge: it does not know it has been cured, only that a few seconds after drinking the potion its organs stop being injured and its pain drive subsides.

### The Medical Pod scanner

The Medical Pod's chemical scanner (`medical scanner.cos`) does not specifically watch chem 95. Its display surface is the chemical concentrations the player chooses to graph, and any chemical can be selected — so a player who knows what to look for can confirm an EDTA dose has been administered and watch its concentration fall as it consumes Heavy Metals. The diagnostic the scanner offers for the underlying problem, however, is chem 66 (Heavy Metals) and the organ life-force panels: a creature with damaged immune/reproductive organs and elevated Heavy Metals is the diagnostic signature of "needs EDTA". The chemical itself is a treatment, not a diagnostic finding.

### Dose math — what 1.0 unit of EDTA actually clears

Concentrations in the C3 chemistry are normalised 0.0 – 1.0 (saturated at 1.0 = 255 / 255 internal). One full bottle of Heavy Metal Cure delivers `chem 95 1`, which sets the EDTA concentration to 1.0 (saturating). With Heavy Metals also at most 1.0, Reaction 91 then proceeds at half-life 24 ticks against the smaller of the two reactant pools. If the creature's Heavy Metals concentration is `X`:

- **X ≥ 1.0** (severely contaminated): EDTA will be exhausted before Heavy Metals; the dose chelates the first 1.0 unit of Heavy Metals and leaves any excess in place. A second potion would then be needed.
- **X = 0.5** (moderately contaminated): Reaction 91 consumes 0.5 units of each reactant within ~1 s. The remaining 0.5 units of EDTA then sit in circulation for ~13 minutes of half-life, providing prophylactic coverage against any further heavy-metal exposure during that window.
- **X = 0** (uncontaminated, prophylactic dose): No Reaction 91 firing. The 1.0 unit of EDTA decays passively at half-life 24 155 ticks; the creature has elevated EDTA for ~13 minutes during which any heavy-metal exposure will be neutralised on contact.

The 0.15-unit General Cure dose follows the same arithmetic at smaller scale: it can fully neutralise a Heavy Metals load up to 0.15 units, after which it is exhausted.

## Summary

```
 Chemical 95 — EDTA  (the heavy-metal chelator)
 --------------------------------------------------------------------------
 Producers:   NONE endogenously. No reaction produces EDTA. No emitter gene
              secretes it. EDTA exists in a creature's bloodstream only via
              external administration.

              Heavy Metal Cure (scrp 2 25 3 12) → CHEM 95 1.0
                  Dedicated single-chemical potion, the largest single-
                  chemical dose any Medicine Maker potion delivers.
              General Cure   (scrp 2 25 19 12) → CHEM 95 0.15
                  Token dose alongside six other cure chemicals.
              CAOS/custom: CHEM TARG 95 <amount>

 Consumers:   Reaction 91 (gene 82, HL 24 "Short", rate 32):
                 1× Heavy Metals [66] + 1× EDTA [95] → (nothing)
              Passive decay: HL 24 155 ticks ("Very long", ~13.4 minutes).

 Receptors:   NONE. Zero genes read chem 95. EDTA has no direct effect on
              any organ, drive, brain lobe, emotion, behaviour, or
              reproductive locus. Its only mechanical effect is participation
              in Reaction 91, which removes Heavy Metals from circulation.

 Role: The genome's only heavy-metal chelator. Reaction 91 is the only
       reaction in the entire stock chemistry that can remove Heavy Metals
       (chem 66) from a creature, and EDTA is the only reactant it
       consumes. Because Heavy Metals' passive half-life is ~100 000 years
       (effectively permanent), and because Heavy Metals injures the
       immune and reproductive organs (gain 25 on three RLOCUS_INJURY
       receptors at genes 86/87/88) and elevates gamete mutation rate
       (LOC_CHANCEOFMUTATION threshold 128, LOC_DEGREEOFMUTATION threshold
       22), a creature exposed to Heavy Metals is in a degenerative
       trajectory it cannot escape biologically. EDTA is the only escape
       route the genome provides.

 Dose sizing: The dedicated potion delivers 1.0 unit (saturating), enough
              to chelate ~1.0 normalised units of Heavy Metals — sufficient
              for essentially any plausible contamination load. The General
              Cure delivers only 0.15 units, useful as a top-up but not
              for serious poisoning.

 Lifetime profile: VERY LONG passive decay (HL 24 155 ticks ≈ 13 min) +
                   SHORT reactive consumption (HL 24 ticks ≈ 0.8 s). EDTA
                   waits patiently in circulation and reacts immediately
                   when Heavy Metals appears — supports both reactive and
                   prophylactic administration.

 Player-facing framing (Materia Medica.catalogue:91):
   "This potion contains EDTA, which is a useful medicinal chemical that
    neutralises the effects of heavy metal build-up. … Most Creature with
    a large heavy metal build-up will be highly susceptible to organ
    damage in their immune and reproductive systems. Once these organs
    are damaged the Creature could have great difficulty in fighting
    diseases and may become unable to reproduce. … EDTA stands for
    ethylene diamine tetra-acetic acid."

 Narrative role: The single antidote. The chemical that the player
                 administers — and only the player can administer — to
                 rescue a creature from the otherwise irreversible
                 immune-system / reproductive-system / mutation-rate
                 cascade triggered by heavy-metal exposure.
```

EDTA is one of the cleanest "pure cure" chemicals in the C3 chemistry: it has no endogenous production, no receptors of its own, no role outside Reaction 91, and a single dedicated potion built around it. The genome's design separates the **toxin** (chem 66, Heavy Metals — permanent, organ-damaging, mutation-driving) from its **antidote** (chem 95, EDTA — externally administered only, fast-reactive, long-lingering) into two slots whose only point of contact is the chelation reaction that destroys both. The player owns the entire antidote axis: the body cannot rescue itself from heavy-metal poisoning, so the player must recognise the symptoms, identify the cause, and administer the dedicated potion.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:119` — chemical descriptor slot 95 "EDTA" — "*Chelates heavy metals*" (accurate and concise; matches the C3 wiring exactly)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:151` — player-visible slot name "EDTA"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:90–92` — "Heavy Metal Cure" (`Agent Help 2 25 3`) full help text: "*This potion contains EDTA, which is a useful medicinal chemical that neutralises the effects of heavy metal build-up. … Most Creature with a large heavy metal build-up will be highly susceptible to organ damage in their immune and reproductive systems. Once these organs are damaged the Creature could have great difficulty in fighting diseases and may become unable to reproduce. … EDTA stands for ethylene diamine tetra-acetic acid.*"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:362` — *Materia Medica* index entry "EDTA"
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:545–553` — `scrp 2 25 3 12`: Heavy Metal Cure drink script — single chemical, `chem 95 1` (1.0 unit)
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:642–658` — `scrp 2 25 19 12`: General Cure drink script — `chem 95 .15` alongside six other cure chemicals at 0.15 each plus 0.45 Adrenalin
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring for slot 95:
  - Reaction 91 (gene 82): `1× Heavy Metals [66] + 1× EDTA [95] → (nothing)`, rate 32, half-life 24 ticks ("Short")
  - Half-life entry (slot 95): 24 155 ticks, decay rate 0.9999713, "Very long"
  - **No receptors** read chem 95
  - **No emitter gene** produces chem 95
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — companion wiring for chem 66 (Heavy Metals) that explains why EDTA matters:
  - Half-life entry (slot 66): 90 682 980 616 ticks, decay rate 1.0, "Very long" (effectively permanent)
  - Receptor 111 (gene 87): `RLOCUS_INJURY` on organ 2 / Somatic, gain 25 — heavy-metal injury to one immune/reproductive organ
  - Receptor 116 (gene 88): `RLOCUS_INJURY` on organ 2 / Somatic, gain 25 — heavy-metal injury to a second organ
  - Receptor 172 (gene 86): `RLOCUS_INJURY` on organ 2 / Somatic, gain 25 — heavy-metal injury to a third organ
  - Receptor 124 (gene 118): `LOC_CHANCEOFMUTATION` on Creature / Gametes, threshold 128, gain 255 — heavy-metal-driven germline mutation rate
  - Receptor 125 (gene 160): `LOC_DEGREEOFMUTATION` on Creature / Gametes, threshold 22, gain 255 — heavy-metal-driven mutation magnitude
- `Rebuild/DOCUMENTATION/chemicals/094 - Prostaglandin.md` — companion analysis of Prostaglandin, the organ-repair coefficient that heals the short-term damage Heavy Metals causes (but cannot restore the long-term life-force erosion). Prostaglandin alone does not cure heavy-metal poisoning — only EDTA can stop the ongoing injury — but Prostaglandin and EDTA together are the standard "remove the toxin, then heal the damage" pairing
- `Rebuild/DOCUMENTATION/chemicals/092 - Medicine one.md`, `093 - Anti-oxidant.md`, `096 - Sodium thiosulphate.md` (when present), `097 - Arnica.md`, `100 - Antihistamine.md` — companion analyses of the other cure chemicals that share the General Cure's 0.15-unit cure-token dosing pattern
