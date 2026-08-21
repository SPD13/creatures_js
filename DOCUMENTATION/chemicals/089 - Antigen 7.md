# 089 - Antigen 7

Antigen 7 is chemical slot 89 in the Creatures 3 chemistry and the **eighth and final entry in the canonical antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Like every antigen, it is the in-chemistry representation of a **bacterial invader** — a specific molecular "fingerprint" that a bacterium injects into its host's bloodstream to flag its presence, and the trigger that drives the creature's immune system to manufacture the matching antibody. Antigen 7 is paired with **Antibody 7 (109)** and its symptom by-product is **Pain (148)** — making it the **only antigen in the block whose symptom is Pain** and, through Pain's extraordinarily broad receptor network, **structurally the most behaviourally disruptive antigen in the standard genome**. Where Antigens 0/1 produce sneezing and coughing, Antigens 2/3 produce shivering and sleep, Antigens 4/6 produce heat-seeking, and Antigen 5 kills via a digital death threshold, Antigen 7 strikes at the creature's entire motor, reproductive and metabolic repertoire at once through Pain's cross-cutting receptor set.

Antigen 7 is **exogenously sourced** — no part of the standard genome produces it endogenously. The sole in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` uniformly to one of 82-89 at spawn time and injects the rolled chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 89`, the bacterium is an **Antigen-7 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 7 into the host's bloodstream. The creature's response is dual-pronged — reaction 99 consumes the antigen one unit at a time to manufacture three units of Antibody 7 plus one unit of Pain, *and* four somatic `RLOCUS_INJURY` receptors read the antigen's concentration as a tissue-damage signal. Antigen 7 is therefore both **the trigger for immunity** and **a source of infection-related organ damage** whenever an Antigen-7 bacterium is chronically attached to a host. Its injury receptor set (gains 64/60/64/64 summing to **252**) sits near the bottom of the block — only marginally higher than Antigen 6's 247 — making the *direct* tissue damage comparatively mild; the punishment for an Antigen-7 infection comes almost entirely through the **Pain symptom cascade**, not through organ injury.

The chemical's passive half-life is **Long** (1,241 ticks, decay rate 0.99944, ~41 seconds of real play per halving at 30 tps). Reaction 99 runs on a **Medium** half-life (105 ticks, decay rate 0.9934) — the **fastest Medium-speed antigen reaction in the block** (Antigens 5 and 6 both sit at 116 ticks on their Medium reactions). The 1-unit firing threshold means any single unit of Antigen 7 engages the immune response immediately; at the bacterium's 0.02/tick injection rate that is ~50 ticks (~1.7 seconds) from exposure onset. As with every antigen, there is **no dedicated antidote reaction** — the player cannot directly neutralise an Antigen-7 load with a stock potion; they can only kill the source bacterium (anti-bacterial spray), manage the resulting Pain cascade (analgesic potions that inject negative-flag Pain scavengers, if available in the world), or wait for reaction 99 plus the passive decay to clear the chemistry.

In-game, Antigen 7 is one of the eight antigens rolled uniformly by bacteria (~12.5% spawn rate). Its visible symptoms are **multi-modal and unmistakeable**: reaction 99 releases one unit of Pain into the bloodstream per firing, and Pain in turn drives the Pain drive (receptor 1, gain 207 — a very strong motivation to escape), forces the **LOC_INVOLUNTARY0 "Lay egg" reflex** at concentration ≥48, accelerates somatic organ clock rate at concentration ≥30, switches to an **LOC_GAIT1** (limping) gait at concentration ≥33, and — in youth and older — triggers a digital Circulatory Locus 12 receptor at concentration ≥191 (a high-Pain circulatory stress response). Players typically perceive an Antigen-7 infection as "my norn is in obvious distress" — limping gait, crying, possibly laying an unfertilised egg involuntarily, running fast and behaving erratically from the elevated clock rate, and seeking any route of escape from whatever it blames for the Pain. Antigen 7 is therefore **"the distress antigen"** — the one whose symptom is impossible to miss and hardest to ignore, even though its underlying tissue damage is among the mildest in the block.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 89` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 7. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 89 the bacterium becomes an Antigen-7 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 7 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81) at `ov17` rate (0.005-0.050), giving the familiar dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals, antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | An Antigen-7-carrying infection remains Antigen-7-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached. Because Pain is by far the most behaviourally-disruptive symptom chemical in the game, a multi-bacterium Antigen-7 colony can lock a creature into a continuous distress state until the colony is cleared |
| 4 | **CAOS injection** | — | `CHEM TARG 89 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 99), the four injury receptors, and the cascade of Pain-linked receptors (Pain drive, Lay-egg involuntary, clock-rate, gait, circulatory stress). Because Antigen 7 indirectly exercises more receptor pathways than any other antigen, it is the most useful single chemical for stress-testing Pain-dependent behaviour |
| 5 | **Community "distress" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 89 <amount>` on bite, touch or thorn-contact events | Community authors wanting to ship a "painful trap" or "thorny plant" hazard sometimes inject Antigen 7 directly rather than injecting Pain (148) directly. Doing so via the antigen — rather than Pain — has the side effect of driving Antibody 7 production and triggering the four injury receptors, so it is a harsher choice than direct Pain injection. Direct Pain injection (`CHEM TARG 148 <amount>`) is the cleaner way to produce "this hurt but is not a disease" hazards |

Because the sole endogenous route to produce Antigen 7 does not exist in the standard genome, Antigen 7 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected environmental hazard, or a developer-side debug injection.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-7 immune response** (reaction 99, primary sink) | 92 (reaction 99, Baby onwards) | Reaction / Somatic | `1× Antigen 7 [89] → 3× Antibody 7 [109] + 1× Pain [148]`, half-life **105 ticks** ("Medium", decay rate 0.9934) | — | — | — | — | The primary consumption pathway. One unit of Antigen 7 produces three units of Antibody 7 plus one unit of Pain per firing — antibody output is **amplified 3×** per firing, matching the highest amplification factor in the block (shared with reactions 97 and 98). The 1-unit threshold engages instantly on exposure (within ~50 ticks at 0.02/tick injection). The 105-tick half-life is **the fastest Medium-speed antigen reaction** — slightly quicker than Antigens 5 and 6 (both 116 ticks) — meaning Antibody 7 accumulates marginally faster per unit of antigen than the other two Medium-reaction antibodies |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 169, 142, 145, 115 (receptors 40, 95, 96, 180, all Baby onwards) | Organ / Somatic (four separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gains 64/60/64/64, flags 0 | 0 | 0 | 60-64 | 0 (analogue, positive) | **Four** separate somatic organs carry an analogue injury-direction receptor on Antigen 7 with threshold 0 — meaning **any** trace of Antigen 7 in the bloodstream causes mild tissue damage. The gains sum to **252** — second-lowest of any antigen in the block, just above Antigen 6's 247. Antigen 7's direct tissue damage is mild; the behavioural punishment for infection flows almost entirely through the Pain symptom |
| 3 | **Pain symptom by-product** (indirect, via reaction 99) | 92 (reaction 99) | — | Reaction 99 produces 1× Pain per activation | — | — | — | — | The headline consequence of Antigen 7 infection. Pain has the **broadest receptor network of any symptom chemical in the game** — see the detailed receptor table below. Because reaction 99 releases 1 Pain per firing and fires on every single antigen unit, net Pain production over time is close to the bacterium's gross injection rate of 0.02/tick |
| 4 | **Pain drive** (indirect) | 1 (receptor 1, Baby onwards) | Creature / Drives | `Locus 0 (Pain drive)`, threshold 0, nominal 0, gain **207**, flags 0 | 0 | 0 | 207 | 0 (analogue, positive) | Any Pain concentration above zero raises the Pain drive proportionally (gain 207 — the second-highest drive gain in the game). The Pain drive is a **very strong motivator**: the creature is powerfully pushed to escape whatever it believes is causing the pain. High Pain drive drowns out most other drives and can cause a creature to abandon food, mates, or shelter in search of relief |
| 5 | **Lay egg involuntary reflex** (indirect) | 92 (receptor 69, Baby onwards) | Creature / Sensorimotor | `LOC_INVOLUNTARY0 (Lay egg)`, threshold **48**, nominal 0, gain 255, flags 2 | 48 | 0 | 255 | DIGITAL (all-or-nothing) | At Pain concentration ≥48 the creature digitally triggers its involuntary "Lay egg" reflex — in females this forces an egg-laying event whether or not the creature is pregnant. This is an important Pain-specific behaviour: **severe pain causes spontaneous egg-laying**, a reflex design choice that mirrors the stress-induced premature delivery seen in real mammals. For males the receptor still fires but the Lay-egg motor plan has no effect. Antigen 7 is therefore the **only antigen capable of inducing involuntary reproduction** as a symptom |
| 6 | **Accelerated metabolism** (indirect) | 16 (receptor 138, Baby onwards) | Organ / Somatic | `RLOCUS_CLOCKRATE`, threshold **30**, nominal 0, gain 255, flags 0 | 30 | 0 | 255 | 0 (analogue, positive) | At Pain concentration ≥30 the somatic clock rate climbs sharply — organs run faster, chemistry cycles more quickly, and behaviour appears visibly agitated. The very high gain (255) means this receptor saturates quickly, pushing the creature into a rapid-action metabolic state very soon after the threshold is crossed |
| 7 | **Limping gait** (indirect) | 100 (receptor 192, Baby onwards) | Creature / Sensorimotor | `LOC_GAIT1`, threshold **33**, nominal 0, gain 239, flags 2 | 33 | 0 | 239 | DIGITAL (all-or-nothing) | At Pain concentration ≥33 the creature switches to its alternate gait (LOC_GAIT1) — effectively a "limp" or distressed walk cycle. This is one of the most recognisable visual symptoms of an Antigen-7 infection: the affected creature walks awkwardly, noticeably different from a healthy creature's normal gait |
| 8 | **Circulatory stress response** (indirect, Youth+) | 56 (receptor 156, Youth onwards) | Creature / Circulatory | `Locus 12`, threshold **191**, nominal 0, gain 255, flags 2 | 191 | 0 | 255 | DIGITAL (all-or-nothing) | At very high Pain concentration (≥191) and from Youth onwards, a digital circulatory-system receptor fires. This is a high-stress-only response — at normal infection loads (Pain hovering in the tens) it never fires. Sustained or extremely severe Antigen-7 infections can push Pain high enough to trigger it, with significant cardiovascular consequences on the creature's circulatory organ |
| 9 | **Pain passive decay** (indirect) | — | — | Half-life **172 ticks** (Medium, decay rate 0.9960) for chemical 148 | — | — | — | — | Pain itself decays on a Medium half-life — ~5.7 seconds per halving at 30 tps. Relative to the 105-tick reaction 99 and the 1,241-tick Long decay of Antigen 7, Pain is the fastest-clearing chemical in the Antigen-7 → Pain pipeline. Pain levels therefore respond relatively quickly to a reduction in antigen injection (i.e. to the death of the source bacterium), and Pain-driven symptoms subside within minutes of the bacterium being killed |
| 10 | **Pain conversion** (indirect) | 8 (reaction 43) | Reaction / Somatic | `1× Pain [148] → 1× Hunger for protein backup [132]`, Medium | — | — | — | — | A secondary Pain sink — a small fraction of Pain is consumed to produce a backup hunger-for-protein signal, loosely modelling that painful/stressed creatures tend to crave protein. Rarely noticeable at normal infection levels but contributes to Pain clearance |
| 11 | **Antigen 7 passive decay** | — | — | Half-life **1,241 ticks** ("Long", decay rate 0.99944) | — | — | — | — | The fallback clearance pathway for Antigen 7 itself — about 41 seconds per halving at 30 tps. Slower than Antigen 6's 1,018 ticks but roughly comparable to Antigens 2-5. Rarely dominant during active infection (reaction 99 fires aggressively at the 1-unit threshold), but in the terminal phase of an infection it gradually clears any residual antigen that does not meet the reaction threshold |
| 12 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | As with every antigen, there is **no pharmacological antidote**. The player cannot medicate Antigen 7 directly — the only levers are (a) kill the bacterium (anti-bacterial spray), (b) let reaction 99 and passive decay drain the antigen, (c) inject an analgesic / negative-flag Pain scavenger to ease the symptom, or (d) remove the creature from whatever it is trying to escape, letting the behavioural Pain-drive response resolve |
| 13 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Like the rest of the antigen block, Antigen 7 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). The pod reads antigens as background immune-system chemistry rather than as headline toxins. Players diagnose Antigen 7 presence indirectly — through the unmistakeable Pain-cascade symptoms and the rising Antibody 7 level on the chemistry panel |

The usage table describes a chemical whose **primary role is immune signalling** (it tells the immune system "fight this bacterium"), whose secondary role is **broad behavioural and motor disruption** via its continuous Pain production, and whose tertiary role is **mild tissue damage** via the block's second-smallest injury-receptor set. Antigen 7 is unique in the block in that its symptom chemical has a far richer receptor network than any of the other symptom chemicals — Pain touches drives, sensorimotor (involuntary reflexes and gait), somatic organs (clock-rate), and circulatory system all at once, making the behavioural signature of an Antigen-7 infection the most vivid and multi-layered of any antigen.

## Role in Game Mechanics

### The Antibody-7 immune response: fastest Medium-speed antigen reaction

Reaction 99 (gene 92) is the biochemical heart of the Antigen-7 immune response:

```
1× Antigen 7 [89] → 3× Antibody 7 [109] + 1× Pain [148]
```

Four design choices are encoded in this formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | **1× Antigen 7** | Lowest possible threshold — engages instantly on any antigen presence. At the bacterium's 0.02/tick injection rate this is ~50 ticks (~1.7 seconds) from exposure onset |
| Antibody output | **3× Antibody 7 (amplifying 3×)** | Tied with Antigens 5 and 6 for the highest amplification factor in the block. Antibody production triples the molecular antigen consumption — Antibody 7 rises at 3× the antigen injection rate |
| Symptom by-product | **1× Pain** | The single most impactful symptom chemical in the game — Pain reaches drives, sensorimotor, somatic and circulatory receptors simultaneously |
| Half-life | 105 ticks (Medium, 0.9934) | **Fastest Medium-speed antigen reaction** — slightly quicker than Antigens 5 and 6 (116 ticks). Net antibody output per unit of antigen is therefore marginally higher over time |

The 1-unit reactant threshold and 3× amplification combine with the fastest Medium reaction speed to produce the most aggressive Medium-speed immune engagement in the block. At 0.02 units/tick injection rate, reaction 99 begins firing ~1.7 seconds after infection onset and fires repeatedly for every additional unit. Steady-state behaviour is essentially identical to Antigens 5 and 6 — Antibody 7 climbs at roughly 3× the antigen injection rate — but with a marginally shorter reaction half-life allowing slightly faster clearance between firings.

Because Antibody 7 concentration feeds back into the bacterium's dormancy check, the 3× amplification **shortens the effective duration of an Antigen-7 infection** compared with any of the 1.5×-amplifying antigens. For a given antigen injection profile, the bacterium is driven into dormancy fastest by the highest-amplification antibody reaction — and reactions 97, 98 and 99 all share that top-tier 3× amplification factor.

### The Pain cascade: the widest symptom reach in the game

Pain (chemical 148) is the single most impactful symptom chemical in the standard genome. Unlike Histamine (coughing, sneezing), Coldness (shivering, sleep), Hotness (cold-seeking, clock-rate) and chemical 90 (Antigen 5's digital death signal), Pain reaches **five separate receptor pathways** spanning four tissue types:

| Pain receptor | Tissue | Locus | Threshold | Gain | Flags | Effect |
|---------------|--------|-------|-----------|------|-------|--------|
| Pain drive (receptor 1, gene 1) | Drives | Locus 0 | 0 | 207 | 0 | **Very strong behavioural motivation to escape the source of the pain.** Drives behaviour selection toward flight and avoidance |
| LOC_INVOLUNTARY0 Lay-egg (receptor 69, gene 92) | Sensorimotor | — | **48** | 255 | DIGITAL | Forces an egg-laying motor plan in females at high Pain concentration. One of the most distinctive Pain-specific symptoms |
| RLOCUS_CLOCKRATE (receptor 138, gene 16) | Somatic (Organ) | — | **30** | 255 | 0 | Accelerates organ clock rate — faster metabolism, faster chemistry, visibly more agitated behaviour |
| LOC_GAIT1 (receptor 192, gene 100) | Sensorimotor | — | **33** | 239 | DIGITAL | Switches to an alternate (limping) gait — a visible distress animation |
| Circulatory Locus 12 (receptor 156, gene 56) | Circulatory (Youth+) | — | **191** | 255 | DIGITAL | High-Pain circulatory stress response — only fires at very high Pain concentrations |

Pain is also consumed by:

- **Reaction 43** (`1× Pain → 1× Hunger for protein backup [132]`), a small secondary sink
- **Passive decay** on a Medium half-life of 172 ticks

And Pain can be *produced* by several reactions beyond reaction 99:

- **Reaction 90** (`2× Alcohol + 1× Dehydrogenase → 1× Glucose + 1× Pain`) — the in-chemistry analogue of an alcohol hangover. Heavy alcohol consumption indirectly raises Pain (see chemical 75, Alcohol, for the full picture)
- **Reaction 42 / Pain backup conversion** — topping up Pain from a reserve pool when the main pool is depleted
- **LOC_PAIN emitter** — the creature's sensorimotor system emits Pain chemical in response to external injury events (falls, strikes, burns, bites)

Antigen 7's infection is therefore one of *many* routes to Pain, but the only one that is unavoidable and self-sustaining once a bacterium has attached. Players who see a limping, egg-laying, hyperactive creature can infer an Antigen-7 infection — or an alcohol overdose, a recent injury, or a deliberate Pain-inflicting hazard — and must check for a visible bacterium (or the chemistry panel) to distinguish between them.

### The four injury receptors: second-mildest tissue damage in the block

Antigen 7 carries **four** somatic injury receptors — matching Antigen 6's four (and one fewer than Antigens 1, 2, 3, 5, which each carry five; two fewer than Antigen 4's six). Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 40 | 169 | 64 | First somatic organ takes injury proportional to Antigen 7 concentration × 64 |
| 95 | 142 | 60 | Second somatic organ takes injury × 60 |
| 96 | 145 | 64 | Third somatic organ takes injury × 64 |
| 180 | 115 | 64 | Fourth somatic organ takes injury × 64 |

Threshold 0 means **no "safe" concentration** exists — any Antigen 7 presence causes tissue damage whether reaction 99 is currently firing or not. The gains total **252** — second-lowest of any antigen in the block, only marginally higher than Antigen 6's 247:

| Antigen | Injury receptors | Summed gain |
|---------|------------------|-------------|
| Antigen 1 | 5 | 309 |
| Antigen 2 | 5 | 312 |
| Antigen 3 | 5 | 312 |
| Antigen 4 | **6** | **377** (highest) |
| Antigen 5 | 5 | 312 |
| Antigen 6 | 4 | 247 (lowest) |
| **Antigen 7** | **4** | **252** |

Antigen 7's *direct* tissue damage is therefore comparable to Antigen 6's — mild, and much lower than Antigens 1-5. The *behavioural* punishment of an Antigen-7 infection comes from the Pain cascade, not from organ damage. This is a clear design choice: the antigen that produces the most disruptive symptom is also the one that inflicts the least direct organ harm — the creature survives long enough to experience the full misery of the Pain response.

### The paired structure of the antigen block

Antigen 7 is the final entry in the systematically-paired antigen/antibody/symptom triples:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| Antigen 1 (83) | 93 (2→12) | Antibody 1 (103) | Histamine A (73) | LOC_INVOLUNTARY2 (Cough) |
| Antigen 2 (84) | 94 (16→12) | Antibody 2 (104) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| Antigen 3 (85) | 96 (1→1) | Antibody 3 (105) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| Antigen 4 (86) | 95 (2→3) | Antibody 4 (106) | Hotness (153, ×1) | Hotness drive + 2× RLOCUS_CLOCKRATE |
| Antigen 5 (87) | 97 (1→3) | Antibody 5 (107) | Chemical 90 (×1) | LOC_DIE (threshold 232, DIGITAL) |
| Antigen 6 (88) | 98 (1→3) | Antibody 6 (108) | Hotness (153, ×1) | Hotness drive + 2× RLOCUS_CLOCKRATE |
| **Antigen 7 (89)** | **99 (1→3)** | **Antibody 7 (109)** | **Pain (148, ×1)** | **Pain drive + Lay-egg reflex + RLOCUS_CLOCKRATE + LOC_GAIT1 + Circulatory locus 12** |

Antigen 7's row is structurally unique: while the other antigens each map to a single behavioural pathway (sneezing, coughing, cold-seeking, heat-seeking, death), Antigen 7's symptom chemical (Pain) fans out to **five** distinct receptor pathways across four tissue types. From a game-design standpoint, Antigen 7 is the block's "everything, everywhere, all at once" antigen — a single infection produces a visible limping gait, a strong escape drive, accelerated metabolism, potentially forced egg-laying, and potentially a circulatory stress response. Where Antigens 5 kills the creature with a clean digital threshold, Antigen 7 makes the creature *suffer visibly* until the player intervenes.

### Strategic / gameplay implications

- **Limping, crying, hyperactive norn ≈ Antigen 7 infection** (or alcohol overdose, or a recent injury). The Pain-cascade symptom profile is unmistakeable, but the specific cause needs the chemistry panel or a visible bacterium to confirm.
- **Anti-bacterial spray is the primary intervention**: killing the source bacterium stops the antigen injection. Because Pain decays on a 172-tick Medium half-life (faster than any of the other symptom chemicals), Pain-driven behaviour subsides within ~1 minute of the bacterium's death, well before the antigen itself has fully cleared.
- **Analgesic / Pain-scavenger potions** are a useful secondary intervention if available. Unlike Antigen 5 (where the symptom *is* death), Antigen 7's symptom can be directly suppressed by lowering Pain — restoring normal behaviour even while the infection continues. This is a rare case where symptomatic treatment is genuinely useful.
- **Watch for forced egg-laying**: Pain ≥ 48 triggers the involuntary Lay-egg reflex. An Antigen-7-infected female can lay an unfertilised egg as a symptom. This is a distinctive, somewhat alarming visual cue that differentiates Antigen 7 from direct Pain injection (which would do the same thing) but from most other Pain-producing situations where the concentration does not reach 48.
- **Watch for the gait change**: at Pain ≥ 33 the limp is automatic and visually obvious. This is usually the first symptom players notice.
- **Severe infection can trigger the circulatory stress response** (Pain ≥ 191) in Youth-and-older creatures. This is rare but possible for extremely chronic multi-bacterium infections; it can have serious cardiovascular consequences on the creature's circulatory organ.
- **No environmental workaround**: unlike Antigens 4/6 (cool rooms ease the Hotness drive) or Antigens 2/3 (warm rooms ease Coldness), there is no environmental factor that reduces Pain. The player must treat the chemistry directly or wait.

### Diagnostic visibility

Antigen 7 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable. Players diagnose Antigen 7 indirectly through:

- **Limping gait** (LOC_GAIT1, threshold 33): the creature walks differently.
- **Elevated Pain drive** (gain 207): the creature is visibly motivated to escape.
- **Accelerated metabolism** (RLOCUS_CLOCKRATE threshold 30): organ clock rate rises above nominal, producing faster-than-usual behaviour.
- **Potential forced egg-laying** (LOC_INVOLUNTARY0 threshold 48): in females, a spontaneous egg-laying event during infection is a near-certain Antigen-7 tell.
- **Antibody 7 climbing rapidly** on the chemistry panel (3× amplification signature).
- **Visible bacterium attached** to the creature.

The canonical clinical signature of an elevated Antigen 7 load is therefore:

- **Visible bacterium attached** to the creature.
- **Limping gait** and visibly agitated movement.
- **High Pain drive**, crying/distress behaviour, attempts to flee.
- **Antibody 7 climbing rapidly** on the chemistry panel.
- **Possible involuntary egg-laying** in females at sustained Pain concentration.
- **Resolution within ~1-2 minutes of bacterium death** — Pain clears first (Medium decay), then Antigen 7 follows (Long decay), with behavioural normality returning well before all traces of antigen are gone.

## Summary

Antigen 7 is the eighth and final entry in the antigen block (chemicals 82-89) and **the most behaviourally-disruptive antigen in the standard genome**, despite inflicting only the second-lowest direct tissue damage in the block. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 89, at a rate of 0.02 units per tick, and it is cleared by reaction 99 (`1× Antigen 7 → 3× Antibody 7 + 1× Pain`, half-life 105 ticks, the fastest Medium-speed antigen reaction in the block) plus a Long passive decay (1,241 ticks, ~41 seconds per halving). Reaction 99 shares the 3× antibody-amplification factor with reactions 97 and 98, making Antibody 7 one of the fastest-rising antibodies during an active infection. The symptom by-product is **Pain (148)** — structurally the most impactful symptom chemical in the game, reaching **five** distinct receptor pathways across four tissue types: the Pain drive (gain 207 — second-highest drive gain in the game), the LOC_INVOLUNTARY0 Lay-egg reflex (digital threshold 48), RLOCUS_CLOCKRATE (threshold 30, gain 255), LOC_GAIT1 limping gait (digital threshold 33), and a high-Pain Circulatory Locus 12 receptor (digital threshold 191, Youth onwards). **Four** somatic organs carry analogue `RLOCUS_INJURY` receptors on Antigen 7 (threshold 0, gains 64/60/64/64 summing to **252**) — second-mildest direct tissue damage in the block. There is **no pharmacological antidote** for the antigen itself; the only interventions are killing the source bacterium (anti-bacterial spray), suppressing the Pain symptom with an analgesic/scavenger potion, or waiting for reaction 99 plus passive decay to clear the chemistry. Player-side, Antigen 7 is experienced as a **visibly suffering creature** — limping, crying, running frantically, possibly laying an unfertilised egg, with organ metabolism racing — a constellation of symptoms too vivid to miss and too cross-cutting to ignore. This makes Antigen 7 **the distress antigen**: the one whose symptom cascade reaches every major motor and drive pathway at once, and the one that most unambiguously signals to the player that their creature needs help *now*.
