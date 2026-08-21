# 082 - Antigen 0

Antigen 0 is chemical slot 82 in the Creatures 3 chemistry and the first entry in the canonical **antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Antigens are the in-chemistry representation of **bacterial invaders**: they are the specific molecular "fingerprints" that bacteria inject into a host's bloodstream to flag their presence, and they are the triggers that drive the creature's immune system to manufacture antibodies. Antigen 0 is specifically paired with [Antibody 0 (102)](../CreaturesData/biochemistry.json) and with [Histamine B (074)](074%20-%20Histamine%20B.md): the standard genome reaction 92 consumes two units of Antigen 0 to produce twelve units of Antibody 0 plus one unit of Histamine B, which is why an Antigen-0-carrying infection produces the game's characteristic **sneeze** symptom.

Antigen 0 is **exogenously sourced** — no part of the standard genome produces it endogenously. The only in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` to one of 82-89 at spawn time and injects that chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 82`, the bacterium is an **Antigen-0 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 0 into the host's bloodstream. The creature's response is dual-pronged — reaction 92 burns the antigen down while manufacturing Antibody 0, *and* four somatic `RLOCUS_INJURY` receptors read the antigen's concentration as tissue-damage signal. Antigen 0 is therefore both **the trigger for immunity** and **the direct source of infection-related organ damage** whenever an Antigen-0 bacterium is chronically infecting a host.

The chemical's passive half-life is **Long** (1,670 ticks, decay rate 0.99958, ~56 seconds of real play per halving at 30 tps) — the longest of the block and long enough that antigen persists in the bloodstream long after the bacterium has been suppressed. Combined with reaction 92's Short half-life (52 ticks, decay rate 0.987), this produces a characteristic clearance profile: Antigen 0 is eliminated quickly while Antibody 0 is still being manufactured (because reaction 92 is active), but the last traces linger on passive decay alone, still weakly firing the injury receptors, until the bloodstream is fully cleared. There is **no dedicated antidote reaction** for Antigen 0 — the player cannot directly neutralise an antigen with any of the stock potions; they can only feed the bacterium-suppression antibiotic (the anti-bacterial spray) and wait for the immune response (reaction 92) and passive decay to clear the chemical.

In-game, Antigen 0 is one of the two most commonly encountered antigens (alongside Antigen 1) because bacteria roll their `ov15` uniformly across 82-89, giving each antigen a ~12.5% spawn rate, but because only Antigens 0 and 1 drive symptomatic histamine reflexes (sneeze and cough respectively), these two are the antigens a player notices. The Medical Scanner and Medical Pod do not name individual antigens in their toxin panels — antigens are a *diagnosis mechanism* (they tell the immune system what to fight) rather than a *toxin* per se, so they appear as background chemistry rather than as headline health indicators. Players typically perceive Antigen 0's presence indirectly, via its Histamine B by-product and the resulting sneeze reflex, rather than by name.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 82` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 0. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 82 the bacterium becomes an Antigen-0 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 0 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81, e.g. Glycotoxin, Sleep toxin, Histamine A/B, etc.) at `ov17` rate (0.005-0.050), giving a dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals (Glucose, Pyruvate, ATP, etc.), antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | Because bacteria reproduce by splitting, an Antigen-0-carrying infection remains Antigen-0-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached |
| 4 | **CAOS injection** | — | `CHEM TARG 82 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 92), the injury receptors, and the downstream Histamine B / sneeze reflex. Players do not normally encounter this pathway, but it is the route used by the Medical Pod's toxin-testing utilities and by developer debug tools |
| 5 | **Community "pathogen" / "allergen" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 82 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "mild allergen", "dust-mite" or "pollen" agent sometimes inject Antigen 0 directly (rather than via a custom bacterium), because the downstream Histamine-B / sneeze reflex it triggers is recognisable to players and produces the desired symptom without requiring a full bacterium implementation |

Because the sole endogenous route to produce Antigen 0 does not exist in the standard genome, Antigen 0 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected allergen, or a developer-side debug injection.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-0 immune response** (reaction 92, primary sink) | 85 (reaction 92, Baby onwards) | Reaction / Somatic | `2× Antigen 0 [82] → 12× Antibody 0 [102] + 1× Histamine B [74]`, half-life 52 ticks ("Short", decay rate 0.987) | — | — | — | — | The primary consumption pathway. Each activation burns two units of Antigen 0 and manufactures twelve units of Antibody 0 — a 6× amplification that lets the immune system rapidly build up antibody concentration against a chronic infection. The one-unit Histamine B by-product is the source of the sneeze reflex (see [074 - Histamine B](074%20-%20Histamine%20B.md)). The Short half-life (52 ticks) means the reaction activates quickly on any Antigen-0 accumulation, so antibody production starts shortly after the bacterium begins injecting antigen |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 179, 110, 126, 187 (receptors 94, 115, 141, 195, all Baby onwards) | Organ / Somatic (four separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gain 56-64, flags 0 | 0 | 0 | 56-64 | 0 (analogue, positive) | Four separate somatic organs carry an analogue injury-direction receptor on Antigen 0 with threshold 0 — meaning **any** trace of Antigen 0 in the bloodstream causes mild tissue damage on these organs. The gains (56, 57, 64, 64) are moderate, so a small antigen dose causes a slow damage rate, but a sustained chronic infection progressively injures the organs. This is the biochemistry behind the "bacterial infection damages organs over time" narrative — each tick of chronic Antigen 0 presence is a tick of somatic injury. The organs are inferred from the genome's organ block (multiple somatic organs with different `damageRate`/`lifeForce` profiles) |
| 3 | **Histamine B sneeze by-product** (indirect, via reaction 92) | 85 (reaction 92) | — | Reaction 92 produces 1× Histamine B per activation | — | — | — | — | Not a direct effect of Antigen 0 itself, but its most visible consequence: every activation of reaction 92 produces one unit of Histamine B, which then drives the LOC_INVOLUNTARY3 (Shiver / sneeze) reflex via receptor 71. This is why Antigen-0-carrying bacteria produce *sneezing* creatures regardless of what secondary toxin (`ov16`) the bacterium carries. See [074 - Histamine B](074%20-%20Histamine%20B.md) for the full reflex wiring |
| 4 | **Passive decay** | — | — | Half-life **1,670 ticks** ("Long", decay rate 0.99958) | — | — | — | — | The fallback clearance pathway and the longest passive decay of any chemical in the antigen block (82-89 all share the same Long/1,670 profile). ~56 seconds of real play time per halving at 30 tps. Once the bacterium has been removed (via antibody suppression or anti-bacterial spray), Antigen 0 fades purely through passive decay plus any residual reaction-92 activity. The slow decay is deliberate: it keeps the antigen signal alive in the bloodstream long enough to complete the immune response and "remember" the exposure through residual antibody levels |
| 5 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | Unlike the toxins in block 70-81 (Histamine A/B cleared by Antihistamine, Cyanide by Cyanide antidote, Fever toxin by Antipyretic, etc.), Antigen 0 has **no pharmacological antidote**. There is no stock-genome reaction that consumes Antigen 0 alongside a cure-potion reactant. The player cannot medicate antigen directly — the only levers are (a) kill the bacterium (anti-bacterial spray, reaction 92's antibody output eventually suppressing it), (b) boost the immune response indirectly via Creature Care items, or (c) wait out passive decay |
| 6 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Unlike Histamine A/B, Cyanide, Heavy Metals, Glycotoxin, Fever toxin and other block-70-81 toxins, Antigen 0 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). The pod reads antigens as background immune-system chemistry rather than as headline toxins. Players diagnose Antigen-0 presence indirectly — via the downstream Histamine B reading and/or by observing the creature sneezing |

The usage table describes a chemical whose **primary role is information-theoretic** (it tells the immune system "fight this bacterium") and whose secondary role is **slow tissue damage** via the injury receptors. Unlike a direct toxin, Antigen 0 itself does not hijack a creature drive or disrupt metabolism — its harm is the slow-burn organ damage of sustained chronic infection, which is meaningful only when the bacterium cannot be cleared quickly.

## Role in Game Mechanics

### The Antibody-0 immune response: the core infection loop

Reaction 92 (gene 85) is the biochemical heart of the Antigen-0 immune response:

```
2× Antigen 0 [82] → 12× Antibody 0 [102] + 1× Histamine B [74]
```

Three design choices are encoded in this single formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | 2× Antigen 0 | Reaction requires a small accumulation of antigen before firing — single-tick traces don't produce antibody |
| Antibody amplification | 12× Antibody 0 | Each firing produces 6× more antibody than it consumes antigen, so the immune response builds concentration rapidly against a chronic source |
| Symptom by-product | 1× Histamine B | The immune response has a visible cost — every antibody-production pulse also sneezes |
| Half-life | 52 ticks (Short, 0.987) | Fast reaction speed — the immune system responds within a couple of seconds of antigen accumulation crossing the 2-unit threshold |

The full infection loop (reproducing the corresponding section of the Histamine B doc from the antigen side) is:

1. **Bacterium attaches and injects Antigen 0** at 0.02 units per tick while active.
2. **Antigen 0 accumulates** in the bloodstream. Simultaneously, the four injury receptors start reading the chemical and producing a slow `RLOCUS_INJURY` signal on four somatic organs — tissue damage begins immediately, even at very low antigen concentrations.
3. **Reaction 92 fires** once 2 units of Antigen 0 are available, consuming two units and producing 12 units of Antibody 0 plus 1 unit of Histamine B.
4. **Antibody 0 accumulates** in the host; the bacterium's `bacteria.cos` behaviour script monitors `chem 102` (the host's antibody level) and compares it against its own dormancy threshold.
5. **Once Antibody 0 exceeds the bacterium's dormancy threshold**, the bacterium goes dormant and stops injecting antigen and toxin. Antigen 0 input ceases.
6. **Residual Antigen 0 is cleared** by continued reaction-92 firing (while enough antigen still exists) and passive decay (Long, 1,670 ticks).
7. **Histamine B fades** (Long, 1,241 ticks), the sneeze reflex stops.
8. **Antibody 0 persists** (also Long half-life) and continues suppressing the bacterium. If antibody levels fall below the bacterium's wake threshold later, the cycle can restart.

This loop is the canonical implementation of an adaptive immune response in Creatures 3, and Antigen 0 is the trigger that makes the whole mechanism fire.

### The four somatic injury receptors: why bacterial infections damage organs

Unlike most chemicals in the antigen block, Antigen 0 is wired into **four** separate somatic organs via `RLOCUS_INJURY` receptors. Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, gain 56-64, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 94 | 179 | 64 | One somatic organ takes injury proportional to Antigen 0 concentration × 64 |
| 115 | 110 | 57 | Second somatic organ takes injury × 57 |
| 141 | 126 | 56 | Third somatic organ takes injury × 56 |
| 195 | 187 | 64 | Fourth somatic organ takes injury × 64 |

The threshold of 0 is significant: there is **no "safe" concentration** of Antigen 0 — any presence at all causes mild tissue damage. The gains (56-64) are moderate, so the damage per tick is small at typical infection concentrations, but because the receptors fire continuously while antigen is present, a chronic infection that lasts several minutes will eventually inflict measurable life-force loss on four organs simultaneously. This is the biochemical engine behind the experiential truth that "creatures who stay sick for a long time get permanently weakened".

Because the `damageRate` and `lifeForce` of each organ is different (see the `organs` block of `biochemistry.json`), the four organs will wear out at different rates under a sustained Antigen-0 exposure, giving each bacterial infection a slightly different long-term organ-damage fingerprint. A young, healthy creature can weather a handful of Antigen-0 infections without visible effects; a chronically infected elderly creature will see organ failure accelerate.

It is worth noting that this injury pathway is **independent** of the bacterium's secondary toxin (`ov16`). Even if the bacterium's toxin is harmless (e.g. Histamine B, which produces only a sneeze reflex), the antigen pathway still inflicts slow somatic damage simply because the antigen is being injected. A "nuisance" bacterium whose toxin is benign can still wear a creature down through sustained antigen exposure.

### The Histamine B sneeze by-product

Because reaction 92 produces one unit of Histamine B per activation, every active Antigen-0 immune response produces a parallel Histamine B signal. The Histamine B receptor (71) on LOC_INVOLUNTARY3 has a threshold of 16, so a single reaction-92 activation is not enough — the immune response must be firing repeatedly for Histamine B to cross threshold and trigger the sneeze reflex. In practice this means:

- **Mild Antigen 0 exposure** (brief bacterium contact, reaction 92 fires once or twice): no sneeze, and passive decay clears everything within a minute.
- **Moderate chronic infection** (bacterium is attached for some time, reaction 92 fires repeatedly): Histamine B accumulates above threshold, creature starts sneezing, player notices.
- **Heavy chronic infection** (long-duration attachment, many bacteria at once): strong sustained sneeze reflex, easy audio/visual diagnosis.

This creates a nice diagnostic gradient: the player's ability to *hear* an Antigen-0 infection (via the Histamine-B sneeze) is approximately proportional to the severity of the infection. Light exposures clear silently; meaningful infections announce themselves.

### Why Antigen 0 has no antidote

The design decision to give Antigen 0 no pharmacological antidote is deliberate and parallels the real-world biology it models: **antigens are not something you medicate away, you medicate the pathogen and let the immune system clear the antigen**. In Creatures 3 terms:

- The **anti-bacterial spray** (AntiBact toxin) kills the bacterium source, stopping antigen injection at the root.
- The **Cough Syrup** (Antihistamine) clears the Histamine B *symptom* of the Antigen-0 response, silencing the sneeze reflex without affecting the underlying immune response.
- The **General Cure** delivers Antihistamine alongside other antidotes but similarly does not address Antigen 0 itself.
- **No stock potion clears Antigen 0 directly** — there is no genome reaction that consumes chemical 82 with a cure-reactant and produces nothing.

The practical implication is that a player cannot "reset" an Antigen-0 exposure chemically — they can only either let the immune system run its course or kill the bacterium producing the antigen. Once antigen is in the bloodstream, it will stay there (driving injury and Histamine B production) until reaction 92 and passive decay have chewed through it.

### The paired structure of the antigen block

Antigen 0 is the first entry in a systematically-paired block of antigen/antibody/symptom triples:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| Antigen 1 (83) | 93 (2→12) | Antibody 1 (103) | Histamine A (73) | LOC_INVOLUNTARY2 (Cough) |
| Antigen 2 (84) | 94 (16→12) | Antibody 2 (104) | Coldness (152, ×2) | Thermoregulation |
| Antigen 3 (85) | 96 (1→1) | Antibody 3 (105) | Coldness (152, ×2) | Thermoregulation |
| Antigen 4 (86) | 95 (2→3) | Antibody 4 (106) | Hotness (153) | Thermoregulation |
| Antigen 5 (87) | 97 (1→3) | Antibody 5 (107) | Chemical 90 | — |
| Antigen 6 (88) | 98 (1→3) | Antibody 6 (108) | Hotness (153) | Thermoregulation |
| Antigen 7 (89) | 99 (1→3) | Antibody 7 (109) | Pain (148) | LOC_PAIN |

Antigen 0 and Antigen 1 are the two "noisy" antigens (they produce visible/audible symptoms at moderate concentrations), Antigens 2, 3, 4, 6 produce thermoregulatory disruption, Antigen 5 produces a relatively obscure by-product, and Antigen 7 produces Pain (the most obviously painful antigen). Antigen 0's specific role is therefore **"the sneeze antigen"** — it is the half of the symptomatic pair (with Antigen 1's cough) that announces "your creature's immune system is fighting something" through an easily recognisable audio cue. The Short (52-tick) reaction half-life and the 2→12 antibody amplification make Antigen 0's immune response one of the most efficient in the block, reflecting the importance of this channel: it is the most common antigen players will notice, so the biochemistry favours a fast, decisive response.

### Strategic / gameplay implications

- **Hearing a sneeze ≈ Antigen 0 is active**: the primary diagnostic cue for Antigen 0 presence is the creature sneezing (via Histamine B, receptor 71). If a player hears a sneeze, there is a ~100% chance an Antigen-0 response is running — i.e. either a bacterium is actively injecting Antigen 0, or a recent injection is still being cleared through reaction 92.
- **Cough Syrup silences the symptom but not the cause**: feeding Antihistamine clears Histamine B and stops the sneeze, but does nothing for Antigen 0 itself. The player's creature will stop sneezing but still accumulate organ injury from the four somatic receptors until the bacterium is killed and the antigen clears.
- **Anti-bacterial spray is the causal cure**: to stop Antigen 0 at its root, the player must kill the bacterium. Once the bacterium is gone, reaction 92 and passive decay will clear the antigen over 1-3 minutes of play, and sneezing will subside as Histamine B drops below threshold.
- **Chronic mild infections are slowly damaging**: because the injury receptors fire on any trace of Antigen 0 (threshold 0), a long-running low-grade infection that does not produce enough Histamine B to sneeze will still be slowly degrading four somatic organs. This is an invisible-but-real cost of ignoring bacterial contamination.
- **Antigen 0 is "the common cold" chemical**: it is the most easily recognisable antigen in the block (sneeze symptom) and the most commonly encountered (one of eight antigens with equal roll probability, but the easiest to spot). Player folklore around "my norn keeps sneezing" is effectively a player-level diagnosis of an Antigen-0 infection.

### Diagnostic visibility

Antigen 0 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable — the pod only tracks chemicals in the toxin block 70-81. It *is* readable via direct chemistry inspection (debug console, `CHEM` readouts, chemistry panel if enabled) as the raw numeric value of slot 82. Players relying solely on the pod will therefore never see "Antigen 0" named in the diagnostic UI — they must infer its presence indirectly through:

- **Sneeze reflex firing** — implies elevated Histamine B, which implies active reaction 92, which implies Antigen 0 input.
- **Antibody 0 visible on chemistry panel** — direct evidence that reaction 92 has been firing.
- **Bacterium agent visibly attached to creature** — if the bacterium's `ov15 = 82`, it is an Antigen-0 carrier (this is not displayed in-game, so players generally cannot tell one bacterium from another by sight).

The canonical clinical signature of an elevated Antigen 0 load is therefore:

- Audible sneeze/shiver reflex firing repeatedly (via Histamine B).
- Chemistry panel shows Antigen 0 and Antibody 0 both elevated.
- Medical Pod shows no specific toxin name (antigens are not in the pod's watchlist), though Histamine B may appear if its concentration exceeds other toxins.
- Often a visible bacterium agent attached to the creature.
- Symptoms resolve slowly (minutes, not seconds) even after the bacterium is killed, because passive decay is Long.

## Summary

Antigen 0 is the first of the eight antigens (chemicals 82-89) and the **sneeze antigen** of the Creatures 3 immune system. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 82, at a rate of 0.02 units per tick, and it is cleared by reaction 92 (`2× Antigen 0 → 12× Antibody 0 + 1× Histamine B`, half-life 52 ticks, "Short") plus a Long passive decay (1,670 ticks, ~56 seconds per halving). Its canonical effects are twofold: it drives the adaptive immune response by feeding Antibody 0 production — the 6× antibody amplification makes the response efficient against chronic infection — and it simultaneously generates Histamine B as a by-product, which fires the sneeze reflex through the LOC_INVOLUNTARY3 receptor on chemical 74. Four somatic organs also carry analogue `RLOCUS_INJURY` receptors on Antigen 0 (threshold 0, gain 56-64), so the chemical inflicts slow, continuous tissue damage on multiple organs while it is present — the biochemistry behind "chronic bacterial infections wear creatures down". There is **no pharmacological antidote**: the only way to clear Antigen 0 is to kill the source bacterium (anti-bacterial spray, or let antibodies suppress it) and wait for reaction 92 and passive decay to do the rest. Player-side, Antigen 0 is experienced as "the common cold" of Creatures 3 — a frequent, low-grade, sneeze-announced infection whose audible symptom makes it the most recognisable antigen in the block, and whose main long-term cost is subtle organ damage rather than acute toxicity. It pairs directly with Antigen 1 (the cough antigen) to form the block's visible-symptom pair, and together they dominate the player's perception of the creature immune system.
