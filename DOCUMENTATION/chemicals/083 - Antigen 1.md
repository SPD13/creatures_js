# 083 - Antigen 1

Antigen 1 is chemical slot 83 in the Creatures 3 chemistry and the second entry in the canonical **antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Antigens are the in-chemistry representation of **bacterial invaders**: they are the specific molecular "fingerprints" that bacteria inject into a host's bloodstream to flag their presence, and they are the triggers that drive the creature's immune system to manufacture antibodies. Antigen 1 is specifically paired with [Antibody 1 (103)](../CreaturesData/biochemistry.json) and with [Histamine A (073)](073%20-%20Histamine%20A.md): the standard genome reaction 93 consumes two units of Antigen 1 to produce twelve units of Antibody 1 plus one unit of Histamine A, which is why an Antigen-1-carrying infection produces the game's characteristic **cough** symptom via the LOC_INVOLUNTARY2 receptor on Histamine A.

Antigen 1 is **exogenously sourced** — no part of the standard genome produces it endogenously. The only in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` to one of 82-89 at spawn time and injects that chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 83`, the bacterium is an **Antigen-1 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 1 into the host's bloodstream. The creature's response is dual-pronged — reaction 93 burns the antigen down while manufacturing Antibody 1, *and* five somatic `RLOCUS_INJURY` receptors read the antigen's concentration as a tissue-damage signal. Antigen 1 is therefore both **the trigger for immunity** and **a direct source of infection-related organ damage** whenever an Antigen-1 bacterium is chronically infecting a host. Notably, Antigen 1 carries **one more injury receptor than Antigen 0** (five versus four), giving it a slightly heavier long-term somatic damage footprint per unit of sustained infection.

The chemical's passive half-life is **Long** (1,670 ticks, decay rate 0.99958, ~56 seconds of real play per halving at 30 tps) — the same decay profile shared by every chemical in the antigen block (82-89). Combined with reaction 93's Short half-life (58 ticks, decay rate 0.988), this produces a characteristic clearance profile: Antigen 1 is eliminated quickly while Antibody 1 is still being manufactured (because reaction 93 is active), but the last traces linger on passive decay alone, still weakly firing the injury receptors, until the bloodstream is fully cleared. There is **no dedicated antidote reaction** for Antigen 1 — the player cannot directly neutralise an antigen with any of the stock potions; they can only feed the bacterium-suppression antibiotic (the anti-bacterial spray) and wait for the immune response (reaction 93) and passive decay to clear the chemical.

In-game, Antigen 1 is one of the two most commonly encountered antigens (alongside [Antigen 0](082%20-%20Antigen%200.md)) because bacteria roll their `ov15` uniformly across 82-89, giving each antigen a ~12.5% spawn rate. Antigens 0 and 1 dominate player perception of the immune system because they are the only two antigens whose by-products (Histamine B and Histamine A respectively) drive *audible respiratory reflexes* — the sneeze (Antigen 0 → Histamine B → LOC_INVOLUNTARY3) and the cough (Antigen 1 → Histamine A → LOC_INVOLUNTARY2). Antigen 1 is specifically **"the cough antigen"**. Players typically perceive its presence indirectly, via its Histamine A by-product and the resulting cough reflex, rather than by name — and because Histamine A is a named, scanner-detectable toxin (while antigens are not), a player will often see "Histamine A elevated" on the Medical Pod's toxin panel and conclude "the creature is coughing because of histamine", without realising that the Histamine A is itself being *produced* by the immune response to Antigen 1.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 83` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 1. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 83 the bacterium becomes an Antigen-1 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 1 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81, e.g. Glycotoxin, Sleep toxin, Histamine A/B, etc.) at `ov17` rate (0.005-0.050), giving a dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals (Glucose, Pyruvate, ATP, etc.), antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | Because bacteria reproduce by splitting, an Antigen-1-carrying infection remains Antigen-1-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached |
| 4 | **CAOS injection** | — | `CHEM TARG 83 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 93), the five injury receptors, and the downstream Histamine A / cough reflex. Players do not normally encounter this pathway, but it is the route used by the Medical Pod's toxin-testing utilities and by developer debug tools |
| 5 | **Community "pathogen" / "allergen" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 83 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "cough-inducing" allergen, a "dusty room" agent or a "pollen" object sometimes inject Antigen 1 directly (rather than via a custom bacterium), because the downstream Histamine-A / cough reflex it triggers is immediately recognisable to players and produces the desired symptom without requiring a full bacterium implementation. Antigen 1 is especially popular for this pattern because the cough reflex is the loudest and most visually-distinctive respiratory symptom in the game |

Because the sole endogenous route to produce Antigen 1 does not exist in the standard genome, Antigen 1 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected allergen, or a developer-side debug injection.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-1 immune response** (reaction 93, primary sink) | 86 (reaction 93, Baby onwards) | Reaction / Somatic | `2× Antigen 1 [83] → 12× Antibody 1 [103] + 1× Histamine A [73]`, half-life 58 ticks ("Short", decay rate 0.988) | — | — | — | — | The primary consumption pathway. Each activation burns two units of Antigen 1 and manufactures twelve units of Antibody 1 — a 6× amplification that lets the immune system rapidly build up antibody concentration against a chronic infection. The one-unit Histamine A by-product is the source of the cough reflex (see [073 - Histamine A](073%20-%20Histamine%20A.md)). The Short half-life (58 ticks) means the reaction activates quickly on any Antigen-1 accumulation, so antibody production starts shortly after the bacterium begins injecting antigen. The reaction's half-life is very slightly longer than Antigen 0's reaction 92 (52 ticks), making Antigen 1's immune response marginally slower but still decisive |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 170, 180, 111, 184, 127 (receptors 51, 100, 114, 137, 140, all Baby onwards) | Organ / Somatic (five separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gain 58-64, flags 0 | 0 | 0 | 58-64 | 0 (analogue, positive) | **Five** separate somatic organs carry an analogue injury-direction receptor on Antigen 1 with threshold 0 — meaning **any** trace of Antigen 1 in the bloodstream causes mild tissue damage on these organs. The gains (64, 64, 59, 64, 58) are moderate, so a small antigen dose causes a slow damage rate, but a sustained chronic infection progressively injures the organs. This is one more injury receptor than Antigen 0 carries (four), making Antigen 1 slightly more somatically destructive per unit of chronic infection. This is the biochemistry behind the "bacterial infection damages organs over time" narrative — each tick of chronic Antigen 1 presence is a tick of somatic injury on five organs in parallel |
| 3 | **Histamine A cough by-product** (indirect, via reaction 93) | 86 (reaction 93) | — | Reaction 93 produces 1× Histamine A per activation | — | — | — | — | Not a direct effect of Antigen 1 itself, but its most visible consequence: every activation of reaction 93 produces one unit of Histamine A, which then drives the LOC_INVOLUNTARY2 (Cough) reflex via receptor 70 (threshold 16, gain 255). This is why Antigen-1-carrying bacteria produce *coughing* creatures regardless of what secondary toxin (`ov16`) the bacterium carries. See [073 - Histamine A](073%20-%20Histamine%20A.md) for the full reflex wiring |
| 4 | **Passive decay** | — | — | Half-life **1,670 ticks** ("Long", decay rate 0.99958) | — | — | — | — | The fallback clearance pathway and the decay profile shared across the entire antigen block (82-89 all have Long/1,670). ~56 seconds of real play time per halving at 30 tps. Once the bacterium has been removed (via antibody suppression or anti-bacterial spray), Antigen 1 fades purely through passive decay plus any residual reaction-93 activity. The slow decay is deliberate: it keeps the antigen signal alive in the bloodstream long enough to complete the immune response and "remember" the exposure through residual antibody levels |
| 5 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | Unlike the toxins in block 70-81 (Histamine A/B cleared by Antihistamine, Cyanide by Cyanide antidote, Fever toxin by Antipyretic, etc.), Antigen 1 has **no pharmacological antidote**. There is no stock-genome reaction that consumes Antigen 1 alongside a cure-potion reactant. The player cannot medicate antigen directly — the only levers are (a) kill the bacterium (anti-bacterial spray, reaction 93's antibody output eventually suppressing it), (b) clear the Histamine A symptom with Cough Syrup (which does not address the underlying Antigen 1), or (c) wait out passive decay |
| 6 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Unlike Histamine A/B, Cyanide, Heavy Metals, Glycotoxin, Fever toxin and other block-70-81 toxins, Antigen 1 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). The pod reads antigens as background immune-system chemistry rather than as headline toxins. Players diagnose Antigen-1 presence indirectly — via the downstream Histamine A reading (which *is* in the pod's watchlist) and/or by observing the creature coughing |

The usage table describes a chemical whose **primary role is information-theoretic** (it tells the immune system "fight this bacterium") and whose secondary role is **slow tissue damage** via five injury receptors. Unlike a direct toxin, Antigen 1 itself does not hijack a creature drive or disrupt metabolism — its harm is the slow-burn organ damage of sustained chronic infection, amplified slightly over Antigen 0 by the extra fifth injury receptor.

## Role in Game Mechanics

### The Antibody-1 immune response: the core infection loop

Reaction 93 (gene 86) is the biochemical heart of the Antigen-1 immune response:

```
2× Antigen 1 [83] → 12× Antibody 1 [103] + 1× Histamine A [73]
```

Three design choices are encoded in this single formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | 2× Antigen 1 | Reaction requires a small accumulation of antigen before firing — single-tick traces don't produce antibody |
| Antibody amplification | 12× Antibody 1 | Each firing produces 6× more antibody than it consumes antigen, so the immune response builds concentration rapidly against a chronic source |
| Symptom by-product | 1× Histamine A | The immune response has a visible cost — every antibody-production pulse also coughs |
| Half-life | 58 ticks (Short, 0.988) | Fast reaction speed — the immune system responds within a couple of seconds of antigen accumulation crossing the 2-unit threshold |

The full infection loop is:

1. **Bacterium attaches and injects Antigen 1** at 0.02 units per tick while active.
2. **Antigen 1 accumulates** in the bloodstream. Simultaneously, the five injury receptors start reading the chemical and producing a slow `RLOCUS_INJURY` signal on five somatic organs — tissue damage begins immediately, even at very low antigen concentrations.
3. **Reaction 93 fires** once 2 units of Antigen 1 are available, consuming two units and producing 12 units of Antibody 1 plus 1 unit of Histamine A.
4. **Antibody 1 accumulates** in the host; the bacterium's `bacteria.cos` behaviour script monitors `chem 103` (the host's antibody level) and compares it against its own dormancy threshold.
5. **Once Antibody 1 exceeds the bacterium's dormancy threshold**, the bacterium goes dormant and stops injecting antigen and toxin. Antigen 1 input ceases.
6. **Residual Antigen 1 is cleared** by continued reaction-93 firing (while enough antigen still exists) and passive decay (Long, 1,670 ticks).
7. **Histamine A fades** (Long, 1,241 ticks) — or is cleared rapidly by Cough Syrup's Antihistamine via reaction 74 — and the cough reflex stops.
8. **Antibody 1 persists** (also Long half-life) and continues suppressing the bacterium. If antibody levels fall below the bacterium's wake threshold later, the cycle can restart.

This loop is the canonical implementation of an adaptive immune response in Creatures 3, and Antigen 1 is the trigger that makes the whole mechanism fire.

### The five somatic injury receptors: why Antigen-1 infections damage more than Antigen-0

Unlike most chemicals in the antigen block, Antigen 1 is wired into **five** separate somatic organs via `RLOCUS_INJURY` receptors — one more than Antigen 0's four. Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 51 | 170 | 64 | First somatic organ takes injury proportional to Antigen 1 concentration × 64 |
| 100 | 180 | 64 | Second somatic organ takes injury × 64 |
| 114 | 111 | 59 | Third somatic organ takes injury × 59 |
| 137 | 184 | 64 | Fourth somatic organ takes injury × 64 |
| 140 | 127 | 58 | Fifth somatic organ takes injury × 58 |

The threshold of 0 is significant: there is **no "safe" concentration** of Antigen 1 — any presence at all causes mild tissue damage. The gains (58-64) are moderate, so the damage per tick is small at typical infection concentrations, but because the receptors fire continuously while antigen is present, a chronic infection that lasts several minutes will eventually inflict measurable life-force loss on five organs simultaneously. The slightly-higher total gain budget (64+64+59+64+58 = 309) versus Antigen 0's four receptors (64+64+57+56 = 241) gives Antigen 1 chronic infections a ~28% greater somatic-damage footprint per unit of sustained antigen — a subtle but real reason why an Antigen-1 infection is marginally worse for long-term creature health than an Antigen-0 infection, even before the cough symptom.

Because the `damageRate` and `lifeForce` of each organ is different (see the `organs` block of `biochemistry.json`), the five organs wear out at different rates under a sustained Antigen-1 exposure, giving each bacterial infection a slightly different long-term organ-damage fingerprint. A young, healthy creature can weather a handful of Antigen-1 infections without visible effects; a chronically infected elderly creature will see organ failure accelerate — faster with Antigen 1 than with any other antigen in the block because of the extra receptor.

It is worth noting that this injury pathway is **independent** of the bacterium's secondary toxin (`ov16`). Even if the bacterium's toxin is harmless, the antigen pathway still inflicts slow somatic damage simply because the antigen is being injected. A "nuisance" bacterium whose toxin is benign can still wear a creature down through sustained antigen exposure — and an Antigen-1 carrier does so more efficiently than any other antigen.

### The Histamine A cough by-product

Because reaction 93 produces one unit of Histamine A per activation, every active Antigen-1 immune response produces a parallel Histamine A signal. The Histamine A receptor (70) on LOC_INVOLUNTARY2 has a threshold of 16, so a single reaction-93 activation is not enough — the immune response must be firing repeatedly for Histamine A to cross threshold and trigger the cough reflex. In practice this means:

- **Mild Antigen 1 exposure** (brief bacterium contact, reaction 93 fires once or twice): no cough, and passive decay clears everything within a minute.
- **Moderate chronic infection** (bacterium is attached for some time, reaction 93 fires repeatedly): Histamine A accumulates above threshold, creature starts coughing, player notices.
- **Heavy chronic infection** (long-duration attachment, many bacteria at once): strong sustained cough reflex with maximum gain (255), producing very rapid and easy audio/visual diagnosis.

This creates a nice diagnostic gradient: the player's ability to *hear* an Antigen-1 infection (via the Histamine-A cough) is approximately proportional to the severity of the infection. Light exposures clear silently; meaningful infections announce themselves.

A subtle interaction with the Cough Syrup: because Histamine A has a Very-short (10-tick) Antihistamine clearance reaction, feeding Cough Syrup to a coughing creature will silence the cough reflex within a fraction of a second — but because Antihistamine *does not* touch Antigen 1 itself, the underlying immune response continues firing reaction 93 and producing more Histamine A, which the Antihistamine continues burning down. A player giving Cough Syrup to an Antigen-1-infected creature therefore sees the cough stop, but the potion is effectively being consumed in a treadmill as reaction 93 keeps generating more Histamine A. The cough-syrup-consumes-antihistamine-as-fast-as-reaction-93-produces-histamine-A balance is another subtle biochemical loop driven by Antigen 1.

### Why Antigen 1 has no antidote

The design decision to give Antigen 1 no pharmacological antidote is deliberate and parallels the real-world biology it models: **antigens are not something you medicate away, you medicate the pathogen and let the immune system clear the antigen**. In Creatures 3 terms:

- The **anti-bacterial spray** (AntiBact toxin) kills the bacterium source, stopping antigen injection at the root.
- The **Cough Syrup** (Antihistamine) clears the Histamine A *symptom* of the Antigen-1 response, silencing the cough reflex without affecting the underlying immune response.
- The **General Cure** delivers Antihistamine alongside other antidotes but similarly does not address Antigen 1 itself.
- **No stock potion clears Antigen 1 directly** — there is no genome reaction that consumes chemical 83 with a cure-reactant and produces nothing.

The practical implication is that a player cannot "reset" an Antigen-1 exposure chemically — they can only either let the immune system run its course or kill the bacterium producing the antigen. Once antigen is in the bloodstream, it will stay there (driving injury on five organs and Histamine A production) until reaction 93 and passive decay have chewed through it.

### The paired structure of the antigen block

Antigen 1 is the second entry in a systematically-paired block of antigen/antibody/symptom triples:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| **Antigen 1 (83)** | **93 (2→12)** | **Antibody 1 (103)** | **Histamine A (73)** | **LOC_INVOLUNTARY2 (Cough)** |
| Antigen 2 (84) | 94 (16→12) | Antibody 2 (104) | Coldness (152, ×2) | Thermoregulation |
| Antigen 3 (85) | 96 (1→1) | Antibody 3 (105) | Coldness (152, ×2) | Thermoregulation |
| Antigen 4 (86) | 95 (2→3) | Antibody 4 (106) | Hotness (153) | Thermoregulation |
| Antigen 5 (87) | 97 (1→3) | Antibody 5 (107) | Chemical 90 | — |
| Antigen 6 (88) | 98 (1→3) | Antibody 6 (108) | Hotness (153) | Thermoregulation |
| Antigen 7 (89) | 99 (1→3) | Antibody 7 (109) | Pain (148) | LOC_PAIN |

Antigen 0 and Antigen 1 are the two "noisy" antigens (they produce visible/audible respiratory symptoms at moderate concentrations). Antigen 1's specific role is **"the cough antigen"** — the louder, more distinctive half of the symptomatic pair. The cough reflex is visually and aurally more striking than the sneeze reflex (a bigger body animation, a louder audio cue), so players tend to react to Antigen 1 infections faster than to Antigen 0 infections. The 2→12 antibody amplification and Short (58-tick) reaction half-life make Antigen 1's immune response one of the most efficient in the block, on par with Antigen 0, reflecting the importance of this channel: it is the most clearly-perceived antigen in the game.

### Strategic / gameplay implications

- **Hearing a cough ≈ Antigen 1 is active, or chemical 73 has been directly injected**: the primary diagnostic cue for Antigen 1 presence is the creature coughing (via Histamine A, receptor 70). If a player hears a cough, the most common cause (by a wide margin) is an active reaction-93 immune response driven by an Antigen-1-carrying bacterium. A less-common cause is a bacterium whose `ov16` rolled to 73 (Histamine A directly), which would cough the creature *without* any Antigen 1 presence.
- **Cough Syrup silences the symptom but not the cause**: feeding Antihistamine clears Histamine A and stops the cough, but does nothing for Antigen 1 itself. The player's creature will stop coughing but still accumulate organ injury from the five somatic receptors until the bacterium is killed and the antigen clears.
- **Anti-bacterial spray is the causal cure**: to stop Antigen 1 at its root, the player must kill the bacterium. Once the bacterium is gone, reaction 93 and passive decay will clear the antigen over 1-3 minutes of play, and coughing will subside as Histamine A drops below threshold.
- **Antigen 1 damages slightly more than Antigen 0**: the extra fifth injury receptor means that a chronic Antigen-1 infection is marginally more damaging to long-term creature health than an equivalent Antigen-0 infection. A player managing a creature's long-term wellbeing should be slightly more eager to treat a coughing creature than a sneezing one.
- **Antigen 1 is "the chest cold" chemical**: it is the loudest antigen in the block (cough symptom) and one of the two most commonly encountered (12.5% spawn rate). Player folklore around "my norn keeps coughing" is effectively a player-level diagnosis of an Antigen-1 infection.

### Diagnostic visibility

Antigen 1 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable — the pod only tracks chemicals in the toxin block 70-81. It *is* readable via direct chemistry inspection (debug console, `CHEM` readouts, chemistry panel if enabled) as the raw numeric value of slot 83. Players relying solely on the pod will therefore never see "Antigen 1" named in the diagnostic UI — they must infer its presence indirectly through:

- **Cough reflex firing** — implies elevated Histamine A, which implies active reaction 93, which implies Antigen 1 input.
- **Histamine A named on the Medical Pod toxin panel** — the most common way players encounter indirect evidence of Antigen 1. The pod surfaces Histamine A by name, so a coughing creature with elevated Histamine A on the pod readout is almost always an Antigen-1 infection.
- **Antibody 1 visible on chemistry panel** — direct evidence that reaction 93 has been firing.
- **Bacterium agent visibly attached to creature** — if the bacterium's `ov15 = 83`, it is an Antigen-1 carrier (this is not displayed in-game, so players generally cannot tell one bacterium from another by sight).

The canonical clinical signature of an elevated Antigen 1 load is therefore:

- Audible cough reflex firing repeatedly (via Histamine A).
- Chemistry panel shows Antigen 1 and Antibody 1 both elevated.
- Medical Pod shows Histamine A named as the highest toxin (the common surrogate signal for "Antigen 1 is active").
- Often a visible bacterium agent attached to the creature.
- Symptoms resolve slowly (minutes, not seconds) even after the bacterium is killed, because passive decay is Long.

## Summary

Antigen 1 is the second of the eight antigens (chemicals 82-89) and the **cough antigen** of the Creatures 3 immune system. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 83, at a rate of 0.02 units per tick, and it is cleared by reaction 93 (`2× Antigen 1 → 12× Antibody 1 + 1× Histamine A`, half-life 58 ticks, "Short") plus a Long passive decay (1,670 ticks, ~56 seconds per halving). Its canonical effects are twofold: it drives the adaptive immune response by feeding Antibody 1 production — the 6× antibody amplification makes the response efficient against chronic infection — and it simultaneously generates Histamine A as a by-product, which fires the cough reflex through the LOC_INVOLUNTARY2 receptor on chemical 73. **Five** somatic organs also carry analogue `RLOCUS_INJURY` receptors on Antigen 1 (threshold 0, gain 58-64), one more than Antigen 0 — so the chemical inflicts slightly heavier slow, continuous tissue damage on multiple organs while it is present, giving chronic Antigen-1 infections a ~28% larger somatic-damage footprint than chronic Antigen-0 infections. There is **no pharmacological antidote**: the only way to clear Antigen 1 is to kill the source bacterium (anti-bacterial spray, or let antibodies suppress it) and wait for reaction 93 and passive decay to do the rest. The Cough Syrup clears the downstream Histamine A symptom but does not touch the antigen itself, so a syrup-medicated Antigen-1 infection still damages five organs until the bacterium is dealt with. Player-side, Antigen 1 is experienced as "the chest cold" of Creatures 3 — a frequent, loud, cough-announced infection whose audible symptom makes it the most viscerally-perceived antigen in the block, and whose main long-term cost is slightly-accelerated organ damage rather than acute toxicity. It pairs directly with Antigen 0 (the sneeze antigen) to form the block's visible-symptom pair, and together they dominate the player's perception of the creature immune system.
