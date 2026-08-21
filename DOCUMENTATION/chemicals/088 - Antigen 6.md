# 088 - Antigen 6

Antigen 6 is chemical slot 88 in the Creatures 3 chemistry and the seventh entry in the canonical **antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Like every antigen, it is the in-chemistry representation of a **bacterial invader** — a specific molecular "fingerprint" that bacteria inject into their host's bloodstream to flag their presence, and the trigger that drives the creature's immune system to manufacture the matching antibody. Antigen 6 is paired with **Antibody 6 (108)** and its symptom by-product is **Hotness (153)** — the same thermoregulatory chemical produced by Antigen 4. The two Hotness-carrying antigens are the block's "overheating pair" and the thermoregulatory mirror of the Antigens 2 / 3 Coldness pair. Antigen 6 is the **milder of the two Hotness antigens**: it uses the highest antibody-amplification stoichiometry in the block (1→3) but carries the **smallest RLOCUS_INJURY receptor set** of any antigen (only four receptors, summed gain 247) and runs on a Medium-speed reaction rather than Antigen 4's Short. Functionally it behaves like a slower, less-damaging variant of Antigen 4 with a more efficient antibody response.

Antigen 6 is **exogenously sourced** — no part of the standard genome produces it endogenously. The sole in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` uniformly to one of 82-89 at spawn time and injects the rolled chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 88`, the bacterium is an **Antigen-6 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 6 into the host's bloodstream. The creature's response is dual-pronged — reaction 98 consumes the antigen one unit at a time to manufacture three units of Antibody 6 plus one unit of Hotness, *and* **four** somatic `RLOCUS_INJURY` receptors read the antigen's concentration as a tissue-damage signal. Antigen 6 is therefore both **the trigger for immunity** and **a source of mild infection-related organ damage** whenever an Antigen-6 bacterium is chronically attached to a host. With only four injury receptors and a summed gain of 247, Antigen 6 delivers **the lowest direct tissue damage in the antigen block** — about 66% of Antigens 2/3/5's 312 and only 65% of Antigen 4's 377. The Hotness it generates, however, drives the full set of Hotness-linked behaviours (cold-seeking drive, accelerated metabolism at high concentration) identically to Antigen 4.

The chemical's passive half-life is **Long** (1,018 ticks, decay rate 0.99932, ~34 seconds of real play per halving at 30 tps) — notably **the shortest Long-decay half-life among the antigen block** (Antigens 2-5 and 7 all sit between 1,241 and 1,670 ticks). Reaction 98 runs on a **Medium** half-life (116 ticks, decay rate 0.9940) — identical to Antigen 5's reaction 97 and slower than Antigen 4's Short 64-tick reaction 95. The 1-unit firing threshold means any single unit of Antigen 6 engages the immune response immediately; at the bacterium's 0.02/tick injection rate that is ~50 ticks (~1.7 seconds) from exposure onset. As with every antigen, there is **no dedicated antidote reaction** — the player cannot directly neutralise an Antigen-6 load with a stock potion; they can only kill the source bacterium (anti-bacterial spray), shelter the creature in a cool environment to counter the Hotness drive, or wait for reaction 98 plus the relatively fast passive decay to clear the chemistry.

In-game, Antigen 6 is one of the eight antigens rolled uniformly by bacteria (~12.5% spawn rate). Its visible symptom is **thermoregulatory on the heat side**: reaction 98 releases one unit of Hotness into the bloodstream per firing, driving the creature's Hotness drive (cold-seeking behaviour) and gradually accelerating somatic organ clock rate via Hotness's two RLOCUS_CLOCKRATE receptors (thresholds 16 and 80). Players typically perceive an Antigen-6 infection the same way they perceive Antigen 4 — "my norn is overheating" or "my norn keeps moving toward cool places" — and address it by guiding the creature to shaded or cool areas. Because Antigen 6 produces less direct tissue damage than Antigen 4 and its passive decay is the fastest in the block, an Antigen-6 infection is **the least punishing of the Hotness-symptom antigens** to recover from once the source bacterium is eliminated. Antigen 6 is therefore **"the mild overheating antigen"** — the softer twin of Antigen 4 and one of the most survivable bacterial infections a creature can suffer.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 88` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 6. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 88 the bacterium becomes an Antigen-6 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 6 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81) at `ov17` rate (0.005-0.050), giving the familiar dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals, antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | An Antigen-6-carrying infection remains Antigen-6-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached. A multi-bacterium Antigen-6 colony accelerates antigen accumulation; because reaction 98 amplifies antibody production 3×, Antibody 6 rises rapidly on the chemistry panel even when the antigen concentration itself is being held low by the aggressive consumption reaction |
| 4 | **CAOS injection** | — | `CHEM TARG 88 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 98), the four injury receptors, and the downstream Hotness drive / clock-rate receptors. Developer tools can use this route to test any Hotness-related behaviour without needing to spawn a bacterium first |
| 5 | **Community "heat-aura" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 88 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "creature overheats on contact" hazard sometimes inject Antigen 6 directly. It is a gentler alternative to Antigen 4 for the same symptom: identical behavioural outcome (cold-seeking + accelerated metabolism) but lower direct tissue damage, making it appropriate for mildly-threatening hazards rather than seriously-damaging ones |

Because the sole endogenous route to produce Antigen 6 does not exist in the standard genome, Antigen 6 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected environmental hazard, or a developer-side debug injection.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-6 immune response** (reaction 98, primary sink) | 91 (reaction 98, Baby onwards) | Reaction / Somatic | `1× Antigen 6 [88] → 3× Antibody 6 [108] + 1× Hotness [153]`, half-life 116 ticks ("Medium", decay rate 0.9940) | — | — | — | — | The primary consumption pathway. One unit of Antigen 6 produces three units of Antibody 6 plus one unit of Hotness per firing — antibody output is **amplified 3×** per firing, matching the highest amplification factor in the block (shared with Antigens 5 and 7). The 1-unit threshold engages instantly on exposure (within ~50 ticks at 0.02/tick injection). The Medium 116-tick half-life is identical to Antigen 5's reaction 97 and slower than Antigen 4's Short 64-tick reaction 95 — firings are less frequent than Antigen 4's, but each firing produces 50% more antibody per unit of antigen consumed |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 168, 172, 178, 115 (receptors 41, 63, 89, 180, all Baby onwards) | Organ / Somatic (four separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gain 55-64, flags 0 | 0 | 0 | 55-64 | 0 (analogue, positive) | **Four** separate somatic organs carry an analogue injury-direction receptor on Antigen 6 with threshold 0 — meaning **any** trace of Antigen 6 in the bloodstream causes mild tissue damage. The gains (64, 64, 64, 55; sum **247**) are the **lowest total of any antigen in the block** — 33% less than Antigens 2/3/5's 312 and 35% less than Antigen 4's 377. Antigen 6 therefore carries **the mildest direct tissue damage profile of any antigen**, reinforcing its position as the softer twin of Antigen 4 |
| 3 | **Hotness symptom by-product** (indirect, via reaction 98) | 91 (reaction 98) | — | Reaction 98 produces 1× Hotness per activation | — | — | — | — | The game-visible consequence of Antigen 6 infection. Hotness has three in-chemistry effects: (a) it drives the Hotness drive (receptor 17, threshold 0, gain 204) — the creature feels hot and seeks cool places; (b) at ≥16 it raises somatic organ clock rate (receptor 171, threshold 16, nominal 128, gain 192) — mild metabolic acceleration; (c) at ≥80 a second clock-rate receptor fires (receptor 77, threshold 80, nominal 128, gain 127) — stronger metabolic acceleration. Unlike Coldness, **Hotness has no digital involuntary-sleep reflex** — its high-concentration effects are the accelerated organ clock rate rather than a collapse to unconsciousness. Because reaction 98 releases only 1 Hotness per firing and fires on each single antigen unit, net Hotness production over time is close to the bacterium's injection rate of 0.02/tick gross |
| 4 | **Passive decay** | — | — | Half-life **1,018 ticks** ("Long", decay rate 0.99932) | — | — | — | — | The fallback clearance pathway — and **the fastest of any antigen in the block** (Antigens 2, 3, 4, 5, 7 all run longer, with Antigen 0/1 using a different half-life entirely). At ~34 seconds of real play per halving at 30 tps, Antigen 6 is cleared passively about 35% faster than Antigens 3/4/5 at comparable residual concentrations. This is rarely the dominant clearance mechanism during active infection (reaction 98 fires aggressively at 1-unit threshold), but in the terminal phase of an infection — when antigen concentration drops below the reaction threshold — the faster decay helps the creature clear the residual antigen more quickly than any other bacterial infection |
| 5 | **Hotness cancelling via Coldness** (indirect) | 22 (reaction 30) | Reaction / Somatic | `1× Hotness + 1× Coldness → nothing`, half-life 22 ticks ("Fast", decay rate 0.969) | — | — | — | — | Indirect clearance of the symptom chemical. Reaction 30 cancels Hotness against equivalent Coldness on a 1:1 basis — meaning a creature simultaneously infected with an Antigen-2 or -3 (Coldness-producing) bacterium will automatically neutralise the Hotness symptom of its Antigen-6 infection. This is unusual chemistry but possible: mixed-antigen infections from multiple bacteria may self-balance at the symptom level even as both antigens continue to drive injury and antibody production independently. Players can also exploit this by injecting Coldness to suppress the Hotness drive, but Coldness is not directly available as a consumable potion |
| 6 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | As with every antigen, there is **no pharmacological antidote**. The player cannot medicate Antigen 6 directly — the only levers are (a) kill the bacterium (anti-bacterial spray), (b) keep the creature cool to counter the Hotness drive at the behavioural level, (c) exploit reaction 30 via a co-infection or injected Coldness, or (d) wait for reaction 98 plus the fastest-in-block passive decay to clear |
| 7 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Like the rest of the antigen block, Antigen 6 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). The pod reads antigens as background immune-system chemistry rather than as headline toxins. Players diagnose Antigen-6 presence indirectly — via persistently-elevated Hotness drive, cold-seeking behaviour, and accelerated metabolism that accompanies sustained Hotness levels. Antigen 6 is clinically indistinguishable from Antigen 4 at the symptom level; the only way to tell them apart is the raw chemistry-panel readout showing Antibody 4 vs Antibody 6 rising |

The usage table describes a chemical whose **primary role is immune signalling** (it tells the immune system "fight this bacterium"), whose secondary role is **steady-state thermoregulatory disruption** via its continuous Hotness production, and whose tertiary role is **mild tissue damage** via the block's smallest injury-receptor set. Antigen 6 is the softest of the standard bacterial antigens — a chronic but survivable infection rather than a seriously-damaging one.

## Role in Game Mechanics

### The Antibody-6 immune response: amplifying and efficient

Reaction 98 (gene 91) is the biochemical heart of the Antigen-6 immune response, sharing its 3× amplification with reactions 97 (Antigen 5) and 99 (Antigen 7):

```
1× Antigen 6 [88] → 3× Antibody 6 [108] + 1× Hotness [153]
```

Four design choices are encoded in this formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | **1× Antigen 6** | Lowest possible threshold — engages instantly on any antigen presence. At the bacterium's 0.02/tick injection rate this is ~50 ticks (~1.7 seconds) from exposure onset |
| Antibody output | **3× Antibody 6 (amplifying 3×)** | Tied with Antigens 5 and 7 for the highest amplification factor in the block. Antibody production triples the molecular antigen consumption — Antibody 6 rises faster per antigen unit than any of the non-3× antibodies |
| Symptom by-product | **1× Hotness** | Same per-firing symptom load as Antigen 4 (and Antigen 7's Pain). Because reaction 98 fires on every single unit of antigen (vs Antigen 4's pair-threshold), net Hotness production over time is comparable to Antigen 4's net production despite the slower Medium reaction speed |
| Half-life | 116 ticks (Medium, 0.9940) | Moderate reaction speed — slower than Antigen 4's Short 64 but firing at a 1-unit threshold vs Antigen 4's 2-unit. The two factors partly cancel: net antibody output rate is similar between the two Hotness antigens but achieved through different stoichiometric routes |

The 1-unit reactant threshold and 3× amplification together produce a very aggressive immune engagement. At 0.02 units/tick bacterium injection rate, reaction 98 begins firing ~1.7 seconds after infection onset and fires repeatedly for every additional unit. This means:

- **Brief exposures** (bacterium attached for a few seconds) immediately engage the immune response. A single firing produces 3 units of Antibody 6 and 1 unit of Hotness.
- **Chronic exposures** (single bacterium attached long-term) reach a steady-state where reaction 98 consumes antigen at roughly the bacterium's injection rate. Antigen 6 concentration hovers just above 1 unit, Antibody 6 accumulates at **3× the antigen injection rate** (the amplification factor), and Hotness trickles in at the reaction's firing rate.
- **Heavy exposures** (multi-bacterium reproducing colony) push antigen above 1 unit rapidly and reaction 98 fires nearly continuously. Antibody 6 build-up is especially aggressive because of the 3× amplification — Antibody 6 on the chemistry panel is the quickest rising of any Hotness-associated antibody during a severe infection.

Because Antibody 6 concentration feeds back into the bacterium's dormancy check (each bacterium reads its paired antibody level and transitions to dormant when it is high enough), the 3× amplification actually **shortens the effective duration of an Antigen-6 infection** compared with Antigen 4. The amplification is therefore doubly beneficial for the creature: higher antibody concentration for the same antigen exposure, and faster bacterium dormancy.

### The four injury receptors: mildest tissue damage in the block

Antigen 6 carries **four** somatic injury receptors — one fewer than Antigens 1, 2, 3, 5 (five) and two fewer than Antigen 4 (six). Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 41 | 168 | 64 | First somatic organ takes injury proportional to Antigen 6 concentration × 64 |
| 63 | 172 | 64 | Second somatic organ takes injury × 64 |
| 89 | 178 | 64 | Third somatic organ takes injury × 64 |
| 180 | 115 | 55 | Fourth somatic organ takes injury × 55 |

Threshold 0 means **no "safe" concentration** exists — any Antigen 6 presence causes tissue damage whether reaction 98 is currently firing or not. The gains total **247** — the **lowest total of any antigen in the block**:

| Antigen | Injury receptors | Summed gain |
|---------|------------------|-------------|
| Antigen 0 | small set | (sparse) |
| Antigen 1 | 5 | 309 |
| Antigen 2 | 5 | 312 |
| Antigen 3 | 5 | 312 |
| Antigen 4 | **6** | **377** (highest) |
| Antigen 5 | 5 | 312 |
| **Antigen 6** | **4** | **247 (lowest)** |
| Antigen 7 | 5 | ~312 |

In comparative terms:

1. **Antigen 6 is the least tissue-damaging antigen** — both by count of receptors and by summed gain.
2. **It is the structural "soft" twin of Antigen 4**: same symptom (Hotness), same behavioural consequence (cold-seeking + accelerated metabolism), but significantly less organ damage per unit of antigen.
3. **Long-term chronic infections are more survivable** — the reduced injury rate combined with the fastest passive decay in the block means a creature can endure a chronic Antigen-6 infection with less cumulative organ damage than any other.

### The Antigen 4 / Antigen 6 pair: the two faces of Hotness

Antigens 4 and 6 form the block's "Hotness pair", mirroring the Antigens 2 / 3 "Coldness pair". Despite producing the same symptom chemical, the two Hotness antigens have very different structural properties:

| Property | Antigen 4 (reaction 95) | Antigen 6 (reaction 98) |
|----------|--------------------------|--------------------------|
| Reactant threshold | 2 units | **1 unit** |
| Antibody output | 3 | 3 |
| Amplification | 1.5× | **3×** |
| Symptom by-product | 1× Hotness | 1× Hotness |
| Reaction half-life | 64 ticks (Short) | 116 ticks (Medium) |
| Firing frequency | Very fast | Moderate |
| Passive decay half-life | 1,370 ticks | **1,018 ticks (fastest)** |
| Injury receptors | 6 | **4** (fewest) |
| Injury summed gain | **377 (highest)** | 247 (lowest) |
| Relative severity | Heavy-hitter | **Mild** |
| Antibody rise rate | Fast (1.5×) | **Fastest (3×)** |

Antigen 6 is structurally the **faster-amplifying, slower-firing, milder-damaging** counterpart to Antigen 4's faster-firing, heavier-damaging design. Where Antigen 4 punishes the creature through broad organ damage and aggressive Hotness production, Antigen 6 delivers the same behavioural symptom with less collateral harm and clears more quickly through both reaction and passive decay. From a game-design standpoint the two antigens give bacteria two flavour variants of the same thermal challenge — one harsh, one mild — with the roll of `ov15` choosing which the creature is exposed to.

### Mixed-antigen interactions: Coldness + Hotness cancellation

Because reaction 30 (`1× Hotness + 1× Coldness → nothing`) cancels the two thermoregulatory symptom chemicals on a 1:1 basis, a creature suffering a **mixed Antigen-6 + Antigen-2/3** infection (one bacterium of each) will see its Hotness and Coldness symptom chemicals partially cancel each other in the bloodstream:

- If Antigen 2 or 3 injection produces Coldness at ~0.04/tick (2× per firing) and Antigen 6 produces Hotness at ~0.02/tick (1× per firing), reaction 30 drains both at the rate of the lower concentration — typically Hotness — until the Coldness antigen runs out or a new equilibrium forms.
- Net effect: the **Hotness drive is reduced** by the competing Coldness, and the creature's behavioural symptom may look ambiguous — not clearly heat-seeking, not clearly cold-seeking, with a confused thermoregulatory drive panel.
- The two antibodies (Antibody 2 or 3 and Antibody 6) continue to rise independently, and the organ-injury receptors continue to fire independently. **Only the behavioural Hotness/Coldness symptoms cancel**; the underlying immune and tissue-damage pathways are unaffected.

This unusual symmetry is the only documented case in the game where two bacterial antigen infections **partially treat each other** at the symptom level. Players observing a doubly-infected creature may notice that its behavioural cues fail to match any single antigen profile.

### The paired structure of the antigen block

Antigen 6 is the seventh entry in the systematically-paired antigen/antibody/symptom triples:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| Antigen 1 (83) | 93 (2→12) | Antibody 1 (103) | Histamine A (73) | LOC_INVOLUNTARY2 (Cough) |
| Antigen 2 (84) | 94 (16→12) | Antibody 2 (104) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| Antigen 3 (85) | 96 (1→1) | Antibody 3 (105) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| Antigen 4 (86) | 95 (2→3) | Antibody 4 (106) | Hotness (153, ×1) | Hotness drive + 2× RLOCUS_CLOCKRATE |
| Antigen 5 (87) | 97 (1→3) | Antibody 5 (107) | Chemical 90 (×1) | LOC_DIE (threshold 232, DIGITAL) |
| **Antigen 6 (88)** | **98 (1→3)** | **Antibody 6 (108)** | **Hotness (153, ×1)** | **Hotness drive + 2× RLOCUS_CLOCKRATE** |
| Antigen 7 (89) | 99 (1→3) | Antibody 7 (109) | Pain (148) | LOC_PAIN |

Antigen 6's row is almost a direct duplicate of Antigen 4's at the symptom-receptor level — both feed the Hotness drive and the clock-rate receptors identically. The structural difference is entirely in the **reaction stoichiometry** (1→3 vs 2→3), **reaction speed** (Medium vs Short), **passive decay** (shorter vs longer), and **injury receptor load** (fewer vs more). The designers clearly intended Antigens 4 and 6 as two difficulty variants of the same symptom theme: a heavy-hitting variant (4) and a mild variant (6).

### Strategic / gameplay implications

- **Cold-seeking norn with rising Antibody 6 ≈ Antigen 6 infection**: the primary diagnostic cue matches Antigen 4 exactly — the only way to distinguish the two is the chemistry-panel readout showing which antibody is rising. Clinically, players can treat them identically.
- **Keep the creature cool**: moving the creature to a cool or shaded environment provides partial behavioural relief. Unlike Antigen 5, Antigen 6's symptom *is* affected by environment because the Hotness drive is what the creature is responding to.
- **Anti-bacterial spray is the primary intervention**: as with every antigen, killing the source bacterium stops the injection. Because Antigen 6's passive decay is the fastest in the block and its reaction clears residual antigen aggressively at the 1-unit threshold, post-spray recovery is the quickest of any antigen — residual antigen drops below threshold within a couple of minutes of bacterium death.
- **Milder prognosis than Antigen 4**: for a comparable infection load, an Antigen-6-infected creature takes less cumulative organ damage than an Antigen-4-infected one. Chronic infections are correspondingly more survivable.
- **Mixed-antigen thermoregulatory cancellation**: a rare but possible scenario — if a creature is simultaneously infected with an Antigen-2/3 bacterium, the behavioural Hotness cue may be partially cancelled by the Coldness cue. The creature's drive panel will look mixed or neutral. Diagnostically this can make the Antigen-6 half of the dual infection nearly invisible without the chemistry-panel readout.

### Diagnostic visibility

Antigen 6 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable. Players diagnose Antigen 6 indirectly through:

- **Elevated Hotness drive** (receptor 17 on chemical 153, gain 204): the creature feels persistently hot.
- **Cold-seeking behaviour** driven by the Hotness drive.
- **Accelerated metabolism at high concentration** (RLOCUS_CLOCKRATE thresholds 16 and 80): organ clock rate rises above nominal, producing faster-than-usual behaviour and faster chemistry cycling.
- **Antibody 6 climbing rapidly** on the chemistry panel (3× amplification signature — the fingerprint that distinguishes Antigen 6 from Antigen 4, whose Antibody 4 rises more slowly per unit of antigen).
- **Visible bacterium attached** to the creature.

The canonical clinical signature of an elevated Antigen 6 load is therefore:

- **Visible bacterium attached** to the creature.
- **Cold-seeking behaviour**, persistent heat discomfort.
- **Antibody 6 climbing rapidly** on the chemistry panel (fastest among Hotness-linked antibodies).
- **Accelerated organ clock rate** at sustained concentrations above 16.
- **Resolution within ~1-2 minutes of bacterium death** — faster than any other antigen, thanks to the block's shortest passive decay half-life plus aggressive reaction-based consumption.

## Summary

Antigen 6 is the seventh of the eight antigens (chemicals 82-89) and the **mild twin of Antigen 4** in the Creatures 3 immune system — the second of the two Hotness-producing antigens and the structurally softest antigen in the block. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 88, at a rate of 0.02 units per tick, and it is cleared by reaction 98 (`1× Antigen 6 → 3× Antibody 6 + 1× Hotness`, half-life 116 ticks, "Medium") plus a Long passive decay (1,018 ticks, ~34 seconds per halving) — **the fastest passive decay of any antigen in the block**. Reaction 98 shares the 3× antibody-amplification factor with reactions 97 and 99, making Antibody 6 the fastest-rising Hotness-linked antibody during an active infection. The symptom by-product is **Hotness (153)** — identical to Antigen 4's symptom, driving the Hotness drive (cold-seeking behaviour, gain 204) and the two RLOCUS_CLOCKRATE receptors (thresholds 16 and 80) that progressively accelerate somatic organ metabolism at high concentrations. **Four** somatic organs carry analogue `RLOCUS_INJURY` receptors on Antigen 6 (threshold 0, gains 64/64/64/55 summing to **247**, the **lowest total of any antigen in the block**) — the tissue damage profile is correspondingly the mildest of any bacterial infection a creature can suffer. There is **no pharmacological antidote**; the only interventions are killing the source bacterium (anti-bacterial spray), sheltering the creature in a cool environment to counter the Hotness drive, exploiting reaction 30's Hotness-Coldness cancellation via a co-infection, or waiting for the block's fastest natural clearance to take effect. Player-side, Antigen 6 is experienced as a persistently cold-seeking, overheated creature whose organ clock runs fast — clinically indistinguishable from Antigen 4 at the symptom level but significantly less damaging to organ health and the quickest of all antigens to resolve once the source bacterium is eliminated. This makes Antigen 6 the **most survivable antigen in the standard game** and, functionally, a gentler difficulty variant of Antigen 4 for players learning to manage bacterial infections.
