# 086 - Antigen 4

Antigen 4 is chemical slot 86 in the Creatures 3 chemistry and the fifth entry in the canonical **antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Like every antigen, it is the in-chemistry representation of a **bacterial invader**: a specific molecular "fingerprint" that bacteria inject into their host's bloodstream to flag their presence, and the trigger that drives the creature's immune system to manufacture the matching antibody. Antigen 4 is specifically paired with **Antibody 4 (106)** and its symptom chemical is **Hotness (153)** — the thermoregulatory opposite of the Coldness carried by Antigens 2 and 3. The standard genome reaction 95 consumes **two** units of Antigen 4 to produce **three** units of Antibody 4 plus one unit of Hotness, making this the antigen block's first (and, as it turns out, only) genuinely **amplifying** immune reaction: antibody output exceeds antigen input per firing.

Antigen 4 is **exogenously sourced** — no part of the standard genome produces it endogenously. The only in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` uniformly to one of 82-89 at spawn time and injects that chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 86`, the bacterium is an **Antigen-4 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 4 into the host's bloodstream. The creature's response is dual-pronged — reaction 95 consumes the antigen two units at a time to manufacture three units of Antibody 4 and one unit of Hotness, *and* **six** somatic `RLOCUS_INJURY` receptors read the antigen's concentration as a tissue-damage signal. Antigen 4 is therefore both **the trigger for immunity** and **a direct source of infection-related organ damage** whenever an Antigen-4 bacterium is chronically infecting a host. Notably, Antigen 4 has **one more injury receptor than any earlier antigen** (five on Antigens 1-3, six on Antigen 4) — its summed gain of 377 is the highest of any antigen in the block, marking it as the most organ-damaging antigen the bacteria family can deliver.

The chemical's passive half-life is **Long** (1,370 ticks, decay rate 0.99949, ~46 seconds of real play per halving at 30 tps) — identical to Antigen 3's and a notch shorter than Antigen 2's 1,670. Reaction 95 runs on a **Short** half-life (64 ticks, decay rate 0.989) and fires at a 2-unit threshold — meaning any two units of Antigen 4 in the bloodstream immediately engages the immune response. Because two units accumulate almost instantly at the bacterium's 0.02/tick injection rate (~100 ticks / ~3 seconds), reaction 95's firing cadence is effectively continuous from a player-perceptual standpoint: Antigen 4 behaves much like Antigen 3's continuous drip rather than Antigen 2's punctate reservoir-burn, but each firing amplifies antibody production 1.5× (3 antibodies per 2 antigens) — a unique feature in the antigen block. As with every antigen, there is **no dedicated antidote reaction** — the player cannot directly neutralise an Antigen-4 load with a stock potion; they can only kill the source bacterium (anti-bacterial spray) and let reaction 95 plus passive decay do the rest.

In-game, Antigen 4 is one of the eight antigens rolled uniformly by bacteria (~12.5% spawn rate). Its visible symptom is **thermoregulatory on the heat side**: reaction 95 releases one unit of Hotness into the bloodstream per firing, driving the creature's Hotness drive (cold-seeking behaviour) and gradually accelerating somatic organ clock rate via the two RLOCUS_CLOCKRATE receptors on Hotness (thresholds 16 and 80). At the symptom level, Antigen 4 produces the **opposite** behavioural pattern of Antigens 2 and 3: instead of the creature seeking warmth, it seeks cool environments; instead of involuntary sleep at high thermal loads, it experiences accelerated metabolism (faster organ clock) and persistent heat discomfort. Players typically perceive an Antigen-4 infection as "my norn is overheating" or "my norn keeps moving away from heat sources" and often address it by guiding the creature to shaded or cool areas rather than recognising the underlying immune response. Antigen 4 is therefore **"the overheating antigen"** — the first of two Hotness-symptom antigens in the block (the other being Antigen 6) and the thermoregulatory mirror-image of the Antigen 2 / Antigen 3 pair.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 86` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 4. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 86 the bacterium becomes an Antigen-4 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 4 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81) at `ov17` rate (0.005-0.050), giving the familiar dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals (Glucose, Pyruvate, ATP, etc.), antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | An Antigen-4-carrying infection remains Antigen-4-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached. A multi-bacterium Antigen-4 colony accelerates antigen accumulation in the bloodstream, which — because reaction 95 amplifies antibody production 1.5× — produces a disproportionately rapid Antibody 4 build-up compared with non-amplifying antigens |
| 4 | **CAOS injection** | — | `CHEM TARG 86 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 95), the six injury receptors, and the downstream Hotness drive / clock-rate receptors. Players do not normally encounter this pathway, but it is the route used by developer debug tools |
| 5 | **Community "heat-aura" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 86 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "creature overheats on contact" hazard sometimes inject Antigen 4 directly. It is preferred over injecting Hotness (153) directly because the injury receptors add a plausible long-term health cost to the exposure, and the amplifying 2→3 reaction produces a satisfying immune response on the chemistry panel — something injected Hotness alone cannot do |

Because the sole endogenous route to produce Antigen 4 does not exist in the standard genome, Antigen 4 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected environmental hazard, or a developer-side debug injection.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-4 immune response** (reaction 95, primary sink) | 89 (reaction 95, Baby onwards) | Reaction / Somatic | `2× Antigen 4 [86] → 3× Antibody 4 [106] + 1× Hotness [153]`, half-life 64 ticks ("Short", decay rate 0.989) | — | — | — | — | The primary consumption pathway and **the only amplifying reaction in the antigen block**. Two units of Antigen 4 produce three units of Antibody 4 plus one unit of Hotness per firing — antibody output exceeds antigen input by 50%. The 2-unit threshold accumulates almost instantly at the bacterium's 0.02/tick injection rate (~100 ticks/~3 seconds), so from the player's perspective the reaction effectively fires continuously once infection begins. The 1.5× amplification means Antibody 4 builds up faster per unit of antigen injected than any other antibody in the block; a light Antigen-4 infection produces a disproportionately strong antibody signature on the chemistry panel |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 166, 153, 174, 175, 183, 113 (receptors 22, 28, 66, 81, 132, 175, all Baby onwards) | Organ / Somatic (six separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gain 57-64, flags 0 | 0 | 0 | 57-64 | 0 (analogue, positive) | **Six** separate somatic organs carry an analogue injury-direction receptor on Antigen 4 with threshold 0 — meaning **any** trace of Antigen 4 in the bloodstream causes mild tissue damage. The gains (64, 64, 64, 64, 64, 57; sum **377**) are the **highest total of any antigen in the block** — 20% more than Antigens 2 and 3's 312, 22% more than Antigen 1's 309, and substantially more than Antigen 0's smaller receptor set. The extra receptor and the higher summed gain make Antigen 4 the most organ-damaging antigen a standard bacterium can carry |
| 3 | **Hotness symptom by-product** (indirect, via reaction 95) | 89 (reaction 95) | — | Reaction 95 produces 1× Hotness per activation | — | — | — | — | The game-visible consequence of Antigen 4 infection. Hotness has three in-chemistry effects: (a) it drives the Hotness drive (receptor 17, threshold 0, gain 204) — the creature feels hot and seeks cool places; (b) at ≥16 it raises somatic organ clock rate (receptor 171, threshold 16, nominal 128, gain 192) — mild metabolic acceleration; (c) at ≥80 a second clock-rate receptor fires (receptor 77, threshold 80, nominal 128, gain 127) — stronger metabolic acceleration. Unlike Coldness, **Hotness has no digital involuntary-sleep reflex** — its high-concentration effects are the accelerated organ clock rate rather than a collapse to unconsciousness. Because reaction 95 releases only 1 Hotness per firing (vs 2 Coldness for Antigens 2/3), per-firing symptom load is half that of the Coldness-antigen pair, partly offset by the amplifying 2→3 stoichiometry |
| 4 | **Passive decay** | — | — | Half-life **1,370 ticks** ("Long", decay rate 0.99949) | — | — | — | — | The fallback clearance pathway. ~46 seconds of real play per halving at 30 tps, identical to Antigen 3's half-life and shorter than Antigen 2's 1,670 ticks but still Long. Passive decay is not the dominant clearance pathway for Antigen 4 at any non-trivial concentration — reaction 95 fires aggressively once two units are present and dominates the clearance curve. Passive decay matters primarily in the terminal phase of an infection, when antigen concentration drops below the 2-unit reaction threshold and the reaction can no longer fire |
| 5 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | As with every antigen, there is **no pharmacological antidote**. The player cannot medicate Antigen 4 directly — the only levers are (a) kill the bacterium (anti-bacterial spray), (b) keep the creature cool to counter the Hotness drive at the behavioural level, or (c) wait for reaction 95 plus passive decay to clear. Hotness itself can be "cancelled" by equivalent Coldness via reaction 30 (`1× Hotness + 1× Coldness → nothing`), giving players an indirect lever if they can supply Coldness — but Coldness is itself a symptom chemical without a convenient stock source |
| 6 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Like the rest of the antigen block, Antigen 4 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). The pod reads antigens as background immune-system chemistry rather than as headline toxins. Players diagnose Antigen-4 presence indirectly — via the creature's persistently-elevated Hotness drive, its cold-seeking behaviour, and the accelerated metabolism that accompanies sustained Hotness levels |

The usage table describes a chemical whose **primary role is information-theoretic** (it tells the immune system "fight this bacterium") and whose secondary role is **steady-state thermoregulatory disruption** via its continuous Hotness production plus the block's most aggressive tissue-damage receptor profile. Unlike the Coldness pair (Antigens 2 and 3), Antigen 4's symptom drives the creature *away* from heat, and its high-concentration phase manifests as metabolic acceleration rather than involuntary sleep.

## Role in Game Mechanics

### The Antibody-4 immune response: the block's only amplifying reaction

Reaction 95 (gene 89) is the biochemical heart of the Antigen-4 immune response, and it is structurally unique within the antigen block because it amplifies:

```
2× Antigen 4 [86] → 3× Antibody 4 [106] + 1× Hotness [153]
```

Four design choices are encoded in this formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | **2× Antigen 4** | Low threshold — any time two units accumulate, the reaction fires. At the bacterium's 0.02/tick injection rate this is ~100 ticks (~3 seconds) from exposure onset |
| Antibody output | **3× Antibody 4 (amplifying 1.5×)** | The only amplifying immune reaction in the block. Antibody production exceeds antigen consumption — antibody accumulates faster per unit of antigen than any other antigen allows |
| Symptom by-product | **1× Hotness** | Half the per-firing symptom load of Antigens 2/3 (which produce 2 Coldness per firing). But combined with the reaction's higher firing frequency and the amplifying stoichiometry, net Hotness production over time is comparable to the Coldness antigens' net Coldness production |
| Half-life | 64 ticks (Short, 0.989) | Fast reaction speed at all concentrations above threshold — the antigen is consumed rapidly once two units are present, keeping average concentration just above threshold |

The 2-unit reactant threshold and 1.5× amplification together produce a distinctive firing pattern. At 0.02 units/tick bacterium injection rate, reaction 95 begins firing ~3 seconds after infection onset and then fires repeatedly as each additional 2 units accumulate. This means:

- **Brief exposures** (bacterium attached for a few seconds) may or may not clear the 2-unit threshold, producing a binary "immune response triggered / not triggered" outcome. Unlike Antigen 3, where the 1-unit threshold guarantees immediate engagement, Antigen 4 has a very short but real delay before the reaction engages.
- **Chronic exposures** (single bacterium attached long-term) reach a steady-state where reaction 95 consumes antigen at roughly the bacterium's injection rate. Antigen 4 concentration hovers just above 2 units, Antibody 4 accumulates at **1.5× the antigen injection rate** (the amplification factor), and Hotness trickles into the bloodstream at the reaction's firing rate.
- **Heavy exposures** (multi-bacterium reproducing colony) push antigen above 2 units rapidly, and the reaction fires nearly continuously. Antibody 4 build-up is especially aggressive because of the amplification, making Antibody 4 levels the quickest-rising of any antibody during a severe infection.

The amplification is the key design point. Where Antigens 0, 1, and 2 use de-amplifying 2→12 and 16→12 ratios (or Antigen 3's neutral 1→1), **Antigen 4 is the only antigen where the creature's immune system produces more molecular antibody than molecular antigen per firing**. Functionally this makes Antigen 4 look on the chemistry panel like the "strongest" immune response, even though its per-firing symptom load is smaller.

### The six somatic injury receptors: the block's most damaging antigen

Antigen 4 breaks from Antigens 1-3's pattern of five injury receptors and carries **six**. Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 22 | 166 | 64 | First somatic organ takes injury proportional to Antigen 4 concentration × 64 |
| 28 | 153 | 64 | Second somatic organ takes injury × 64 |
| 66 | 174 | 64 | Third somatic organ takes injury × 64 |
| 81 | 175 | 64 | Fourth somatic organ takes injury × 64 |
| 132 | 183 | 64 | Fifth somatic organ takes injury × 64 |
| 175 | 113 | 57 | Sixth somatic organ takes injury × 57 |

Threshold 0 means **no "safe" concentration** exists — any Antigen 4 presence causes tissue damage whether reaction 95 is currently firing or not. The gains total **377** — the highest of any antigen in the block, exceeding Antigens 2 and 3's shared 312 by 21% and Antigen 1's 309 by 22%. The raw per-unit injury rate is therefore the worst in the block.

In comparative terms:

1. **Antigen 4 injures more organs than any other antigen** (6 receptors vs 5 on Antigens 1-3, and fewer on Antigen 0). Tissue damage is more broadly distributed across the creature's somatic organ set.
2. **Antigen 4's per-unit summed gain is the highest in the block** (377 vs 309-312 elsewhere). At equivalent bloodstream concentration, the injury rate per tick is roughly 21% higher than Antigens 1-3.
3. **Because reaction 95 keeps Antigen 4 at or slightly above the 2-unit threshold**, the average bloodstream concentration is low — lower than Antigen 2's reservoir average but higher than Antigen 3's equilibrium, producing an injury-rate ranking roughly of: Antigen 2 > Antigen 4 > Antigen 3 > Antigen 1 > Antigen 0 in chronic-infection damage floor.

The net effect: a chronic Antigen-4 infection has the **highest per-tick injury rate** of the antigen block, but because reaction 95 clears the antigen fairly quickly, long-term organ damage accumulation is comparable to (not strictly greater than) Antigen 2's high-reservoir pattern. Antigen 4 is best thought of as the antigen with the **most widely-distributed organ damage profile** rather than the one with the strictly highest total damage.

### The Hotness symptom: the thermoregulatory mirror of Coldness

Hotness (153) is the symptom chemical for Antigen 4 (and later for Antigen 6). It is the thermoregulatory opposite of Coldness (152), and the two chemicals mutually annihilate via reaction 30 (`1× Hotness + 1× Coldness → nothing`). Hotness has three in-chemistry effects:

**1. Hotness drive** (receptor at threshold 0, gain 204): Antigen 4 produces a persistent low-to-moderate elevation of the Hotness drive. The behavioural signature is a creature that **consistently prefers cooler environments** and shows a steady cold-seeking bias — the exact behavioural mirror of Antigens 2 and 3's heat-seeking.

**2. Organ clock-rate acceleration** (two receptors): Hotness at or above threshold 16 triggers receptor 171 (gain 192) and at or above threshold 80 additionally triggers receptor 77 (gain 127). Both receptors target RLOCUS_CLOCKRATE on somatic organs — the effect is to speed up the rate at which somatic organs process chemistry, making the entire metabolism run faster. At moderate infection load, the accelerated clock rate subtly speeds up energy metabolism, hunger, and other downstream processes; at heavy infection load the creature's organs are processing chemistry noticeably faster than baseline, which can produce compound effects (faster glucose depletion, faster energy turnover, etc.).

**3. Ambient thermoregulation**: Hotness adds a chronic, steady heat-side bias to the thermal balance — the creature's effective thermal "set-point" runs hotter than the ambient would otherwise produce. Seeking cool environments is the natural behavioural response.

**Crucially, Hotness has no digital involuntary-reflex receptor** comparable to Coldness's LOC_INVOLUNTARY4 Sleep trigger. The Coldness antigens (2 and 3) can, at high concentrations, involuntarily collapse the creature into sleep; Antigen 4 cannot. Instead, Hotness's high-concentration phase is **metabolic acceleration**, which is more insidious — the creature remains conscious and active but is burning through glucose, ATP, and other metabolic resources at an elevated rate.

### Why Antigen 4 has no antidote

As with every antigen, **antigens are cleared by the immune system, not by medication**. The design decision parallels real-world immunology:

- The **anti-bacterial spray** (AntiBact toxin) kills the bacterium source, stopping antigen injection at the root.
- **Keeping the creature cool** raises ambient Coldness intake (via thermoregulation) and can counter the Hotness drive at the behavioural level, but does not clear the antigen itself.
- **Supplying Coldness directly** can neutralise Hotness via reaction 30 (mutual annihilation), but Coldness is itself a symptom chemical and there is no stock potion that delivers it cleanly — the only reliable source is cold-environment exposure.
- **No stock potion clears Antigen 4 directly** — there is no genome reaction that consumes chemical 86 with a cure-reactant.
- **No stock potion clears Hotness (153) directly either** — only Coldness-balance thermoregulation (reaction 30) and passive decay drain Hotness.

Because reaction 95 is aggressive (fires at every two-unit accumulation), **post-bacterium Antigen-4 clearance is comparable to Antigen 3's** — once the source bacterium is killed, the antigen drains through reaction 95 until it falls below the 2-unit threshold, then passive decay takes over for the final tail. The Hotness symptom persists somewhat longer because its own decay is slower and because the organ clock-rate acceleration subtly changes the decay rates of downstream chemistry.

### The paired structure of the antigen block

Antigen 4 is the fifth entry in the systematically-paired antigen/antibody/symptom triples and the **first of two Hotness-symptom antigens**:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| Antigen 1 (83) | 93 (2→12) | Antibody 1 (103) | Histamine A (73) | LOC_INVOLUNTARY2 (Cough) |
| Antigen 2 (84) | 94 (16→12) | Antibody 2 (104) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| Antigen 3 (85) | 96 (1→1) | Antibody 3 (105) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| **Antigen 4 (86)** | **95 (2→3)** | **Antibody 4 (106)** | **Hotness (153, ×1)** | **Hotness drive + 2× RLOCUS_CLOCKRATE** |
| Antigen 5 (87) | 97 (1→3) | Antibody 5 (107) | Chemical 90 | — |
| Antigen 6 (88) | 98 (1→3) | Antibody 6 (108) | Hotness (153) | Hotness drive + RLOCUS_CLOCKRATE |
| Antigen 7 (89) | 99 (1→3) | Antibody 7 (109) | Pain (148) | LOC_PAIN |

Antigen 4 and Antigen 6 form a **matched Hotness pair** — both drive the same thermoregulatory symptom chemistry but through structurally different reactions (Antigen 4's 2→3 amplifying with Short half-life versus Antigen 6's 1→3 amplifying). The Hotness pair is the thermoregulatory mirror of the Antigen 2 / Antigen 3 Coldness pair: where Coldness pushes heat-seeking and eventually involuntary sleep, Hotness pushes cold-seeking and metabolic acceleration. A creature suffering a dual Antigen-4 + Antigen-6 infection experiences compounded Hotness load and correspondingly pronounced metabolic acceleration.

A particularly pathological multi-antigen scenario is **Antigen 2 + Antigen 4**: Hotness and Coldness are both produced simultaneously and partially cancel via reaction 30, but the reaction is only 1:1 — any imbalance still drives symptoms. The creature feels thermally "chaotic" — alternately seeking heat and cold — and the Hotness/Coldness cancellation wastes chemistry cycles that could otherwise have gone to metabolism. This is thermally the most confusing multi-antigen presentation in the game.

### Strategic / gameplay implications

- **Cold-seeking behaviour ≈ Antigen 4 or Antigen 6 infection**: the primary diagnostic cue is the creature consistently preferring cooler environments without obvious thermal justification. This distinguishes the Hotness antigens from the Coldness pair (2/3) at the behavioural level. Distinguishing Antigen 4 specifically from Antigen 6 requires chemistry-panel inspection for the specific antibody (104 vs 108).
- **Cool exposure is only symptom management**: as with the Coldness antigens, moving the creature to a cool environment raises Coldness and helps counter the Hotness drive at the behavioural level, but does nothing to kill the bacterium or clear the antigen. The creature continues to accumulate organ damage from the six injury receptors.
- **Anti-bacterial spray is the causal cure**: kill the bacterium to stop antigen injection. Post-bacterium clearance for Antigen 4 is roughly comparable to Antigen 3 — expect 1-3 minutes for the antigen to clear via reaction 95 plus passive decay.
- **Antigen 4 is the most organ-damaging antigen**: with six injury receptors (one more than Antigens 1-3) and a summed gain of 377 (highest in the block), chronic Antigen-4 infections produce the most widely-distributed and fastest-accumulating tissue damage of any antigen. Prioritise Antigen-4 treatment when multiple antigens are suspected.
- **Metabolic acceleration is a secondary risk**: unlike the Coldness antigens' involuntary-sleep reflex, Antigen 4's sustained high-concentration phase accelerates somatic organ clock rate. This compounds downstream: faster glucose depletion, faster energy turnover, faster chemistry decay generally. A creature with a severe Antigen-4 infection may paradoxically appear *energetic* but will deplete its metabolic reserves faster and tire quicker in the long run.
- **Amplifying immune response is the most visible on chemistry panel**: because reaction 95 produces 1.5× antibody per antigen, Antibody 4 accumulates disproportionately fast. If a chemistry panel shows Antibody 4 rising quickly with Antigen 4 staying low, this is the normal signature of an ongoing Antigen-4 infection, not an indication that the infection is being cleared.

### Diagnostic visibility

Antigen 4 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable. Hotness (153) is likewise not a named toxin. Players diagnose Antigen 4 indirectly through:

- **Elevated Hotness drive on the creature's drive panel**, with a steady rather than spiky profile — the creature reports feeling hot persistently.
- **Cold-seeking behaviour** out of proportion to the ambient temperature.
- **Subtle metabolic acceleration** — the creature appears more active than usual, eats more frequently, or depletes energy reserves faster.
- **Antibody 4 visible on chemistry panel, rising faster than Antigen 4** — the amplifying reaction's signature. Antibody 4 climbing while Antigen 4 stays near 2 units is the canonical Antigen-4 fingerprint.
- **Bacterium agent visibly attached to creature** — if the bacterium's `ov15 = 86`, it is an Antigen-4 carrier.

The canonical clinical signature of an elevated Antigen 4 load is therefore:

- Steady elevated Hotness drive with no environmental cause.
- Chronic cold-seeking behaviour.
- Subtle metabolic acceleration (faster hunger, faster energy depletion, more active behaviour).
- Chemistry panel shows Antibody 4 accumulating noticeably faster than the apparent Antigen 4 level — the amplifying-reaction signature.
- Often a visible bacterium agent attached to the creature.
- Organ damage accumulating across a broader somatic spread than other antigen infections, due to the sixth injury receptor.
- Symptoms resolve within 1-3 minutes after the bacterium is killed.

## Summary

Antigen 4 is the fifth of the eight antigens (chemicals 82-89) and the **"overheating antigen"** of the Creatures 3 immune system — the first of two Hotness-symptom antigens (with Antigen 6) and the thermoregulatory mirror-image of the Antigen 2 / Antigen 3 Coldness pair. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 86, at a rate of 0.02 units per tick, and it is cleared by reaction 95 (`2× Antigen 4 → 3× Antibody 4 + 1× Hotness`, half-life 64 ticks, "Short") plus a Long passive decay (1,370 ticks, ~46 seconds per halving). Reaction 95 is **the only amplifying immune reaction in the antigen block** — it produces 1.5× antibody per antigen consumed, giving Antibody 4 the fastest build-up rate of any antibody during an active infection. The Hotness by-product drives the Hotness drive (gain 204, motivating cold-seeking) and, at thresholds 16 and 80, accelerates somatic organ clock rate via two RLOCUS_CLOCKRATE receptors — the metabolic-acceleration equivalent of the Coldness antigens' involuntary-sleep reflex, without the collapse to unconsciousness. **Six** somatic organs (one more than any earlier antigen) carry analogue `RLOCUS_INJURY` receptors on Antigen 4 (threshold 0, gains 64/64/64/64/64/57 summing to **377**, the highest total in the block) — making Antigen 4 the most organ-damaging antigen a standard bacterium can carry, with tissue injury distributed more broadly across the somatic organ set than any other antigen. There is **no pharmacological antidote**: the only way to clear Antigen 4 is to kill the source bacterium (anti-bacterial spray) and wait, though the aggressive reaction 95 keeps post-bacterium clearance comparable to Antigen 3's. Player-side, Antigen 4 is experienced as "my norn keeps running to cooler places and seems unusually active" — the thermoregulatory opposite of the Coldness antigens, with a deceptively energetic behavioural signature masking both widespread organ damage and gradual metabolic depletion from the sustained clock-rate acceleration.
