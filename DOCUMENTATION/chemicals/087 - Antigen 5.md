# 087 - Antigen 5

Antigen 5 is chemical slot 87 in the Creatures 3 chemistry and the sixth entry in the canonical **antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Like every antigen, it is the in-chemistry representation of a **bacterial invader** — a specific molecular "fingerprint" that bacteria inject into their host's bloodstream to flag their presence, and the trigger that drives the creature's immune system to manufacture the matching antibody. Antigen 5 is paired with **Antibody 5 (107)** and its symptom by-product is **chemical 90** — the **only unnamed chemical** produced by any antigen in the block, and, structurally, the **only symptom chemical in the entire antigen block whose dedicated consumer is a `LOC_DIE` receptor**. Where the other antigens produce behavioural or thermoregulatory discomfort (Histamines, Coldness, Hotness, Pain), Antigen 5's symptom pathway culminates in **instant lethality** at high concentration. This makes Antigen 5 the lethal antigen of the standard-genome immune system — the one antigen-driven infection that can directly kill a creature rather than merely make it miserable.

Antigen 5 is **exogenously sourced** — no part of the standard genome produces it endogenously. The sole in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` uniformly to one of 82-89 at spawn time and injects the rolled chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 87`, the bacterium is an **Antigen-5 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 5 into the host's bloodstream. The creature's response is dual-pronged — reaction 97 consumes the antigen one unit at a time to manufacture three units of Antibody 5 plus **one unit of chemical 90**, *and* **five** somatic `RLOCUS_INJURY` receptors read the antigen's concentration as a tissue-damage signal. Antigen 5 is therefore both **the trigger for immunity** and **the feedstock for a death chemical**. Unlike the Coldness (Antigens 2/3) or Hotness (Antigens 4/6) pairs, whose symptom by-products are thermoregulatory chemicals with behavioural drives attached, Antigen 5's by-product has **no drive**, **no behavioural cue**, and **no warning in the drive panel** — just a hidden accumulator that silently approaches the lethal threshold.

The chemical's passive half-life is **Long** (1,370 ticks, decay rate 0.99949, ~46 seconds of real play per halving at 30 tps) — identical to Antigens 3 and 4. Reaction 97 runs on a **Medium** half-life (116 ticks, decay rate 0.9940) and fires at a **1-unit threshold** — so any single unit of Antigen 5 in the bloodstream immediately engages the immune response. Because even one unit accumulates within ~50 ticks (~1.7 seconds) at the bacterium's 0.02/tick rate, reaction 97 engages almost instantly on exposure. The reaction's 1→3 stoichiometry makes it **the second amplifying immune reaction** in the block (after Antigen 4's 2→3), and the 1:1 antigen-to-chemical-90 stoichiometry means every firing produces exactly one unit of the hidden death chemical. As with every antigen, there is **no dedicated antidote reaction** — the player cannot directly neutralise an Antigen-5 load, and, critically, **no reaction consumes chemical 90** either. Chemical 90 is cleared only by passive decay (half-life 462 ticks, Medium) — and if its production rate exceeds its decay rate long enough, the creature dies silently.

In-game, Antigen 5 is one of the eight antigens rolled uniformly by bacteria (~12.5% spawn rate). It is **the only antigen whose sustained presence poses a direct mortality risk**: a single bacterium attached long enough, or a reproducing colony, can push chemical 90 past the 232-unit `LOC_DIE` threshold and trigger instant death. Players typically perceive an Antigen-5 infection as **"my norn died suddenly with no obvious cause"** — there is no behavioural symptom (no cold-seeking, no heat-seeking, no coughing or sneezing, no pain reaction), no drive spike, and no Medical Pod toxin warning. The only in-game visibility is (a) the visible bacterium agent attached to the creature, (b) the rising Antibody 5 on the chemistry panel, and (c) the silent accumulation of chemical 90 — which only shows in the raw chemistry readout. Antigen 5 is therefore **"the silent killer antigen"** — structurally the most dangerous antigen a standard-genome bacterium can carry, and the hardest to diagnose before it becomes fatal.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 87` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 5. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 87 the bacterium becomes an Antigen-5 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 5 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81) at `ov17` rate (0.005-0.050), giving the familiar dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals, antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical. For Antigen 5 specifically, this design choice is especially significant — because its downstream chemistry leads to a lethal chemical, any endogenous production pathway would be catastrophically dangerous |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | An Antigen-5-carrying infection remains Antigen-5-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached. **A multi-bacterium Antigen-5 colony is the single most dangerous ongoing-infection scenario in the standard game** — combined injection rates can push chemical 90 past the 232-unit `LOC_DIE` threshold before the player notices anything is wrong |
| 4 | **CAOS injection** | — | `CHEM TARG 87 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 97), the five injury receptors, and — with caution — the lethal chemical-90 pathway. Developer tools can use this route to test the death mechanism by injecting enough Antigen 5 to drive chemical 90 past threshold |
| 5 | **Community "deadly-bite" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 87 <amount>` on bite / touch / venom events | Community authors wanting to ship a "creature can be killed by contact" hazard sometimes inject Antigen 5 directly. It is the most reliable way to guarantee eventual creature death from a chemical hazard, because chemical 90 has no antidote reaction and the death receptor is a DIGITAL all-or-nothing trigger. Because the symptom is silent (no behavioural cue), this is considered poor design in community circles — well-designed hazards typically use Antigens 2/3 (Coldness, sleep) or Antigens 4/6 (Hotness, metabolic) for visible symptoms |

Because the sole endogenous route to produce Antigen 5 does not exist in the standard genome, Antigen 5 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected environmental hazard, or a developer-side debug injection. Critically, the lack of endogenous production is a **safety feature**: because Antigen 5 drives a lethal downstream pathway, the standard-genome design ensures that no ordinary biochemical imbalance can accidentally trigger it.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-5 immune response** (reaction 97, primary sink) | 90 (reaction 97, Baby onwards) | Reaction / Somatic | `1× Antigen 5 [87] → 3× Antibody 5 [107] + 1× Chem 90`, half-life 116 ticks ("Medium", decay rate 0.9940) | — | — | — | — | The primary consumption pathway. One unit of Antigen 5 produces three units of Antibody 5 plus one unit of chemical 90 per firing — antibody output is **amplified 3×** per firing, but each firing also produces one unit of the lethal symptom chemical. The 1-unit threshold engages instantly on exposure (within ~50 ticks at 0.02/tick injection). **The reaction is simultaneously the creature's defence and its slow poisoning** — every unit of antibody gained costs one unit of chemical 90 accumulated. The Medium half-life (116 ticks) is slower than Antigen 4's Short 64 ticks, making reaction 97 fire less frequently and allowing chemical 90 time to decay between firings at low infection loads |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 167, 139, 176, 177, 114 (receptors 27, 64, 80, 90, 174, all Baby onwards) | Organ / Somatic (five separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gain 55-65, flags 0 | 0 | 0 | 55-65 | 0 (analogue, positive) | **Five** separate somatic organs carry an analogue injury-direction receptor on Antigen 5 with threshold 0 — meaning **any** trace of Antigen 5 in the bloodstream causes mild tissue damage. The gains (64, 65, 64, 64, 55; sum **312**) are comparable to Antigens 1-3 (all 309-312) and lower than Antigen 4's 377. Antigen 5's tissue damage profile is therefore "middle of the pack" — the lethal downstream chemistry is what makes it dangerous, not the direct injury receptors |
| 3 | **Chemical-90 death receptor** (indirect, via reaction 97) | 158 (receptor 110, Baby onwards) | Creature / Immune | `LOC_DIE`, threshold **232**, nominal 0, gain 255, flags 2 (DIGITAL) | 232 | 0 | 255 | DIGITAL | **The most dangerous single receptor in the antigen block.** When chemical 90 reaches concentration 232 (out of 255), the DIGITAL `LOC_DIE` receptor fires and **the creature dies instantly**. Every firing of reaction 97 produces 1 unit of chemical 90; at the bacterium's 0.02/tick antigen injection rate, chemical 90 is produced at ~0.02/tick gross, offset by its own Medium-speed passive decay (462 ticks half-life). **Chronic infections can breach the 232 threshold** — especially multi-bacterium colonies — producing silent, unannounced death with no behavioural warning. This is the defining danger of Antigen 5 |
| 4 | **Passive decay** | — | — | Half-life **1,370 ticks** ("Long", decay rate 0.99949) | — | — | — | — | The fallback clearance pathway. ~46 seconds of real play per halving at 30 tps, identical to Antigens 3 and 4. Passive decay is not the dominant clearance pathway for Antigen 5 at any non-trivial concentration — reaction 97 fires aggressively once a single unit is present and dominates the clearance curve. Passive decay matters primarily in the terminal phase of an infection, when antigen concentration drops below the 1-unit reaction threshold |
| 5 | **No dedicated antidote reaction** (for either Antigen 5 *or* chemical 90) | — | — | — | — | — | — | — | The most dangerous property of the Antigen 5 pathway. Not only is there no antidote for Antigen 5 itself (typical for the block), **there is also no reaction that consumes chemical 90**. The only pathway clearing chemical 90 is passive decay (half-life 462 ticks, Medium) — which competes against continuous production by reaction 97. If production exceeds decay for long enough, the creature dies. **No stock potion and no endogenous reaction can save a creature once chemical 90 begins rising toward 232** except by eliminating the source bacterium and waiting |
| 6 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Like the rest of the antigen block, Antigen 5 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). **Chemical 90 is also not surfaced** — an especially perverse diagnostic blind spot given that it is the proximate cause of creature death. Players cannot read chemical 90's concentration from any convenient in-game tool without using the chemistry-panel raw readout |

The usage table describes a chemical whose **direct consumption** is aggressive and whose **symptom by-product is lethal**. Where other antigens produce thermoregulatory or behavioural symptoms with visible drives, Antigen 5's symptom chemistry operates silently and terminally — there is no behavioural warning, no drive spike, and no named toxin alert to tell the player their creature is in mortal danger.

## Role in Game Mechanics

### The Antibody-5 immune response: fast, amplifying, and toxic-producing

Reaction 97 (gene 90) is the biochemical heart of the Antigen-5 immune response, and it is structurally unique within the antigen block because **every firing produces one unit of a chemical whose only purpose is to kill the creature**:

```
1× Antigen 5 [87] → 3× Antibody 5 [107] + 1× Chem 90 [90]
```

Four design choices are encoded in this formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | **1× Antigen 5** | Lowest possible threshold — engages instantly on any antigen presence. At the bacterium's 0.02/tick injection rate this is ~50 ticks (~1.7 seconds) from exposure onset |
| Antibody output | **3× Antibody 5 (amplifying 3×)** | The highest amplification factor in the antigen block. Antibody production triples the molecular antigen consumption — Antibody 5 rises faster per antigen unit than any other antibody |
| Symptom by-product | **1× Chemical 90** | The only unnamed symptom chemical and the only one with a dedicated LOC_DIE receptor. Each firing is simultaneously a defensive win and a step toward mortality |
| Half-life | 116 ticks (Medium, 0.9940) | Moderate reaction speed — slower than Antigen 4's Short 64, faster than the passive decay. Gives chemical 90 brief windows to decay between firings at low infection loads |

The 1-unit reactant threshold and 3× amplification together produce a very aggressive immune engagement. At 0.02 units/tick bacterium injection rate, reaction 97 begins firing ~1.7 seconds after infection onset and fires repeatedly for every additional unit. This means:

- **Brief exposures** (bacterium attached for a few seconds) immediately engage the immune response. A single firing produces 3 units of Antibody 5 and 1 unit of chemical 90 — the chem-90 unit then decays with a 462-tick half-life, never approaching the 232 threshold.
- **Chronic exposures** (single bacterium attached long-term) reach a steady-state where reaction 97 consumes antigen at roughly the bacterium's injection rate. **Chemical 90 accumulates at ~0.02/tick gross production minus its passive decay.** Equilibrium concentration depends on the balance — for a single bacterium, chemical 90 typically settles at levels well below 232, but prolonged infection can push it into dangerous territory.
- **Heavy exposures** (multi-bacterium reproducing colony) push antigen injection rate above 0.02/tick, and chemical-90 production scales linearly with the number of bacteria. **Two or more simultaneously-attached bacteria can push chemical 90 past 232** within a few minutes of real play, killing the creature abruptly and silently.

The 3× amplification is the key design point. Where Antigens 0-3 use de-amplifying or neutral ratios and Antigen 4 uses a 1.5× amplifier, **Antigen 5 uses the highest antibody-production amplification in the block**. Functionally this makes Antibody 5 the fastest-rising antibody on the chemistry panel during an active infection — a useful diagnostic if the player thinks to check, but invisible to players using only the Medical Pod or drive-panel views.

### Chemical 90 and the LOC_DIE receptor: the silent death pathway

The defining feature of Antigen 5 is its symptom chemical. Chemical 90 — uniquely among the antigen block's symptom products — has **no name**, **no drive**, **no behavioural receptor**, and **no consuming reaction**. Its only dedicated receptor in the standard genome is this:

| Receptor ID | Gene | Organ | Locus | Threshold | Gain | Flags |
|-------------|------|-------|-------|-----------|------|-------|
| 110 | 158 | Creature / Immune | LOC_DIE | **232** | 255 | 2 (DIGITAL) |

The receptor is **DIGITAL** — it does not produce a graded effect. The moment chemical 90 crosses 232, `LOC_DIE` fires and the creature dies. There is no warning ramp, no partial effect, no gradually-worsening symptom. Below 232 the creature is unaffected; at 232 it dies.

Chemical 90's accumulation dynamics are:

- **Production**: 1 unit per firing of reaction 97, which fires at every 1-unit accumulation of Antigen 5. At a single bacterium's 0.02 units/tick injection, reaction 97 fires roughly every 50 ticks (~1.7 seconds), producing chemical 90 at a gross rate of ~0.02/tick.
- **Decay**: Passive Medium-speed decay at half-life 462 ticks (~15 seconds per halving at 30 tps). Decay is concentration-proportional — at chemical-90 concentration 100, decay removes roughly 0.15/tick gross.
- **Equilibrium**: Chemical 90 reaches equilibrium where production (constant at source rate) equals decay (proportional to concentration). For a single bacterium, equilibrium is typically well below the 232 threshold. For two or more simultaneously-active bacteria, equilibrium approaches or exceeds 232.

The death pathway is therefore **dose-dependent on bacterial load**. A single attached bacterium is dangerous but rarely immediately fatal. **Multi-bacterium colonies are reliably fatal within minutes** unless killed. This makes Antigen 5 the only antigen where *bacterial reproduction rate directly determines creature mortality* rather than merely the severity of discomfort.

### The five somatic injury receptors: middle-of-the-pack tissue damage

Antigen 5 carries **five** somatic injury receptors, matching Antigens 1-3 and one fewer than Antigen 4's six. Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 27 | 167 | 64 | First somatic organ takes injury proportional to Antigen 5 concentration × 64 |
| 64 | 139 | 65 | Second somatic organ takes injury × 65 |
| 80 | 176 | 64 | Third somatic organ takes injury × 64 |
| 90 | 177 | 64 | Fourth somatic organ takes injury × 64 |
| 174 | 114 | 55 | Fifth somatic organ takes injury × 55 |

Threshold 0 means **no "safe" concentration** exists — any Antigen 5 presence causes tissue damage whether reaction 97 is currently firing or not. The gains total **312** — comparable to Antigens 1-3 and 20% lower than Antigen 4's 377.

In comparative terms:

1. **Antigen 5 has average direct tissue damage** — five receptors like most of the block, summed gain 312 in line with Antigens 2 and 3.
2. **The danger is not the direct damage** — it is the chemical-90 downstream. Even if Antigen 5 caused zero direct injury, the LOC_DIE pathway would still make it the most dangerous antigen.
3. **The injury receptor damage compounds with chemical 90 lethality** — a creature suffering an Antigen-5 infection accumulates both organ damage (from direct antigen presence) *and* progressive chemical-90 poisoning toward death. If the infection is cleared before chemical 90 reaches 232, the creature survives but carries lasting somatic organ damage.

### The two amplifying reactions: Antigen 4 vs Antigen 5

Antigens 4 and 5 are the block's two amplifying reactions, but with very different structural properties:

| Property | Antigen 4 (reaction 95) | Antigen 5 (reaction 97) |
|----------|--------------------------|--------------------------|
| Reactant threshold | 2 units | **1 unit** |
| Antibody output | 3 | 3 |
| Amplification | 1.5× | **3×** |
| Symptom by-product | 1× Hotness (behavioural) | **1× Chem 90 (lethal)** |
| Reaction half-life | 64 ticks (Short) | 116 ticks (Medium) |
| Firing frequency | Very fast | Moderate |
| Symptom visibility | Behavioural (cold-seeking) + metabolic acceleration | **None — silent** |
| Antibody rise rate | Fast (1.5× multiplier) | **Fastest in block** (3× multiplier) |
| Lethal risk | No | **Yes** (LOC_DIE at chem-90 = 232) |

Antigen 5 is structurally the **faster-amplifying, slower-firing, silently-lethal** counterpart to Antigen 4's faster-firing, behaviourally-obvious, non-lethal design. Where Antigen 4 hurts creatures through broad organ damage and metabolic acceleration, Antigen 5 hurts them through the invisible accumulation of a death chemical.

### Why Antigen 5 has no antidote — and why chemical 90 has no antidote either

As with every antigen, **antigens are cleared by the immune system, not by medication**. But Antigen 5's situation is especially stark because its downstream chemical *also* has no medication:

- The **anti-bacterial spray** (AntiBact toxin) kills the bacterium source, stopping antigen injection at the root. This is the only effective intervention.
- **No stock potion clears Antigen 5 directly** — there is no genome reaction that consumes chemical 87 with a cure-reactant.
- **No stock potion clears chemical 90 directly either** — unique among symptom chemicals. Coldness can be cancelled by Hotness via reaction 30. Hotness can be cancelled by Coldness. Pain has a dedicated Pain Killer pathway. Histamines have their own antidote reactions. **Chemical 90 has no counterpart chemical, no cancelling reaction, no antidote potion** — only passive decay.
- **The 3× antibody amplification partly helps** — because Antibody 5 rises 3× per antigen unit, antibody levels quickly reach concentrations that will encourage the bacterium to enter a dormant state via its own `ov15 + 20` antibody check. But this is an indirect effect mediated by bacterium behaviour, not a chemistry-level clearance of the antigen or chemical 90.

Because chemical 90 has **only passive decay** as a clearance path, **post-bacterium creature survival depends entirely on how much chemical 90 accumulated before the bacterium was killed** and how much further decay can reduce it before the 232 threshold is reached. If the player kills the bacterium when chemical 90 is already at (say) 200, the creature is in a race between ongoing decay (~0.3/tick at that concentration) and the residual Antigen 5 still being consumed by reaction 97 (still producing chemical 90). **This is the only antigen where killing the bacterium may not save the creature in time.**

### The paired structure of the antigen block

Antigen 5 is the sixth entry in the systematically-paired antigen/antibody/symptom triples and the **only antigen with a lethal symptom pathway**:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| Antigen 1 (83) | 93 (2→12) | Antibody 1 (103) | Histamine A (73) | LOC_INVOLUNTARY2 (Cough) |
| Antigen 2 (84) | 94 (16→12) | Antibody 2 (104) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| Antigen 3 (85) | 96 (1→1) | Antibody 3 (105) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| Antigen 4 (86) | 95 (2→3) | Antibody 4 (106) | Hotness (153, ×1) | Hotness drive + 2× RLOCUS_CLOCKRATE |
| **Antigen 5 (87)** | **97 (1→3)** | **Antibody 5 (107)** | **Chemical 90 (×1)** | **LOC_DIE (threshold 232, DIGITAL)** |
| Antigen 6 (88) | 98 (1→3) | Antibody 6 (108) | Hotness (153) | Hotness drive + RLOCUS_CLOCKRATE |
| Antigen 7 (89) | 99 (1→3) | Antibody 7 (109) | Pain (148) | LOC_PAIN |

Antigen 5 breaks the behavioural-symptom pattern that otherwise unifies the block. Every other antigen produces a chemical tied to a behavioural drive or an involuntary reflex:

- Antigens 0, 1 → Histamines → coughing, sneezing, shivering
- Antigens 2, 3 → Coldness → heat-seeking, involuntary sleep
- Antigens 4, 6 → Hotness → cold-seeking, metabolic acceleration
- Antigen 7 → Pain → pain behaviour

**Antigen 5 alone produces no behavioural cue.** Its symptom chemical drives only the hidden LOC_DIE receptor. This is the single most striking design anomaly in the block — arguably a deliberate choice to include one "hardest-difficulty" antigen whose damage is invisible until it is fatal, providing a scarcity-of-information challenge to players managing infectious disease.

A particularly pathological multi-antigen scenario is **Antigen 5 + any other antigen**: the other antigen's behavioural symptom masks the Antigen-5 infection under the guise of a "normal" sickness (cold-seeking, sleep, coughing). The creature appears to have a run-of-the-mill infection — and then dies without warning. Triple-antigen infections (Antigens 5 + 2 + 4, for instance) are the deadliest combinations in the standard game: Coldness/Hotness chaos keeps the player focused on thermoregulation while chemical 90 silently climbs.

### Strategic / gameplay implications

- **Sudden death without warning ≈ Antigen 5 infection**: the primary diagnostic cue is **the lack of a cue**. A creature dying with no visible symptom, no drive elevation, and no Medical Pod toxin warning has almost certainly succumbed to chemical 90 via Antigen 5.
- **Check the chemistry panel for Antibody 5**: because reaction 97 amplifies 3×, Antibody 5 rises the fastest of any antibody during active infection. A chemistry panel showing rapidly-climbing Antibody 5 with low visible Antigen 5 is the canonical Antigen-5 fingerprint.
- **Anti-bacterial spray is the only effective intervention, and it must be applied *early***: unlike other antigens, where the player can wait and watch symptoms develop before deciding to intervene, Antigen-5 infections are silently fatal. The spray must be applied before chemical 90 approaches 232 — and because chemical 90 is not visible in most player UI, this effectively means **applying spray proactively on any bacterium attachment**.
- **Multi-bacterium colonies are reliably fatal**: a single attached Antigen-5 bacterium may stabilise chemical 90 at a survivable equilibrium; two or more will push chemical 90 past 232 within minutes. Bacterial reproduction is therefore a near-guaranteed kill timer for Antigen 5 hosts.
- **No thermoregulation or environment change helps**: unlike Coldness/Hotness antigens, where moving the creature to a different thermal environment provides partial symptom relief, Antigen 5 is unaffected by any environmental factor. The player has no passive mitigation available.
- **Chemical 90 survives the bacterium**: killing the bacterium stops antigen injection, but the chemical 90 already accumulated continues to exist and decay slowly. If the player kills the bacterium too late, the creature may still die from residual chemical 90 pushing past 232 moments after the bacterium's death — a particularly cruel outcome where the player's intervention appears successful but the creature dies anyway.

### Diagnostic visibility

Antigen 5 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable. Chemical 90 is likewise not named anywhere in the standard UI. This makes Antigen 5 **the most diagnostically-invisible antigen**. Players diagnose Antigen 5 indirectly through:

- **Lack of other antigen-specific symptoms** despite visible bacterium attachment — if a bacterium is attached and the creature shows no cold-seeking, heat-seeking, pain, coughing, or sneezing, the antigen is probably 5, 6, or rarely a dormant bacterium phase.
- **Antibody 5 climbing rapidly on the chemistry panel** — the 3× amplification signature. Antibody 5 rising faster than any other antibody is the canonical Antigen-5 fingerprint.
- **Raw chemistry-panel readout of chemical 90** — available in the detailed chemistry view but not in any convenient UI. A chemical-90 reading above ~100 is cause for immediate concern; above 150 is urgent; above 200 is critical; 232+ is instant death.
- **Bacterium agent visibly attached to creature with no behavioural symptom** — strong indicator of Antigen 5, 6, or 7 (the three antigens with the least visible behavioural cues).

The canonical clinical signature of an elevated Antigen 5 load is therefore:

- **Visible bacterium attached** to the creature.
- **No behavioural symptom**, no drive elevation, no Medical Pod warning.
- **Antibody 5 climbing rapidly** on the chemistry panel (3× amplification signature).
- **Chemical 90 rising** toward or past 100 on raw chemistry readout.
- **Sudden death** when chemical 90 crosses 232 — instant, with no terminal behaviour.
- If the bacterium is killed early enough, symptoms resolve silently with no visible indication anything was wrong, except for the cumulative somatic organ damage from the five RLOCUS_INJURY receptors.

## Summary

Antigen 5 is the sixth of the eight antigens (chemicals 82-89) and the **"silent killer"** of the Creatures 3 immune system — the only antigen in the standard genome whose symptom by-product is a **lethal chemical**. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 87, at a rate of 0.02 units per tick, and it is cleared by reaction 97 (`1× Antigen 5 → 3× Antibody 5 + 1× chem 90`, half-life 116 ticks, "Medium") plus a Long passive decay (1,370 ticks, ~46 seconds per halving). Reaction 97 is **the highest-amplifying immune reaction in the block** (3× antibody per antigen consumed), giving Antibody 5 the fastest build-up rate of any antibody during an active infection. The symptom by-product — unnamed **chemical 90** — has no drive, no behavioural receptor, and no consuming reaction; its only dedicated consumer is a DIGITAL `LOC_DIE` receptor at threshold 232 that **instantly kills the creature** if the concentration is reached. Chemical 90 accumulates from reaction 97 firings and clears only through passive decay (half-life 462 ticks, Medium) — giving chronic infections, and especially multi-bacterium colonies, a reliable path to fatal concentrations. **Five** somatic organs carry analogue `RLOCUS_INJURY` receptors on Antigen 5 (threshold 0, gains 64/65/64/64/55 summing to **312**, middle-of-the-pack for the block) — significant but not the defining danger. There is **no pharmacological antidote**, either for Antigen 5 or for chemical 90 — the only effective intervention is to kill the source bacterium (anti-bacterial spray) early, and because chemical 90 survives the bacterium's death, late intervention may fail even when the bacterium is successfully killed. Player-side, Antigen 5 is experienced as **"my norn died suddenly with no obvious cause"** — the lack of any behavioural, drive-panel, or Medical-Pod warning is the defining diagnostic signature, and the only reliable in-game tells are visible bacterium attachment and rapidly-climbing Antibody 5 on the chemistry panel. This makes Antigen 5 the most structurally dangerous antigen in the game and the hardest to diagnose before the damage becomes irreversible — a deliberate design choice that provides a "hardest-difficulty" pathogen for players managing infectious disease.
