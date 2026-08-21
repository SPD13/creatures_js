# 085 - Antigen 3

Antigen 3 is chemical slot 85 in the Creatures 3 chemistry and the fourth entry in the canonical **antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Antigens are the in-chemistry representation of **bacterial invaders**: they are the specific molecular "fingerprints" that bacteria inject into a host's bloodstream to flag their presence, and they are the triggers that drive the creature's immune system to manufacture antibodies. Antigen 3 is specifically paired with **Antibody 3 (105)** and, like [Antigen 2](084%20-%20Antigen%202.md), with **Coldness (152)** as its symptom chemical: the standard genome reaction 96 consumes **one** unit of Antigen 3 to produce one unit of Antibody 3 plus two units of Coldness. This makes Antigen 3 the "drip-feed" counterpart to Antigen 2's reservoir-burn — the same thermoregulatory symptom delivered through a fundamentally different reaction structure.

Antigen 3 is **exogenously sourced** — no part of the standard genome produces it endogenously. The only in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` to one of 82-89 at spawn time and injects that chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 85`, the bacterium is an **Antigen-3 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 3 into the host's bloodstream. The creature's response is dual-pronged — reaction 96 consumes the antigen one unit at a time to manufacture Antibody 3 and Coldness, *and* five somatic `RLOCUS_INJURY` receptors read the antigen's concentration as a tissue-damage signal. Antigen 3 is therefore both **the trigger for immunity** and **a direct source of infection-related organ damage** whenever an Antigen-3 bacterium is chronically infecting a host. It carries the same number of injury receptors as Antigens 1 and 2 (five, total gain 312) but its immune reaction uses the **lowest possible threshold** in the block — 1 unit — producing a smooth, continuous antibody drip rather than Antigen 2's punctate 16-unit reservoir bursts.

The chemical's passive half-life is **Long** (1,370 ticks, decay rate 0.99949, ~46 seconds of real play per halving at 30 tps) — a notch shorter than Antigen 2's 1,670 but still in the Long range shared by the entire antigen block. Combined with reaction 96's Short half-life (64 ticks, decay rate 0.989), this produces a clearance profile unlike Antigen 2's: because reaction 96 fires at a single-unit threshold, **any** accumulation of Antigen 3 immediately engages the immune response. The reaction is 1→1 by molecule count (one unit of antigen makes one unit of antibody), so there is no amplification — antibody production tracks antigen injection nearly one-to-one, minus the passive decay on both ends. As with every antigen, there is **no dedicated antidote reaction** — the player cannot directly neutralise an Antigen-3 load with a stock potion; they can only kill the source bacterium (anti-bacterial spray) and let reaction 96 plus passive decay do the rest.

In-game, Antigen 3 is one of the eight antigens rolled uniformly by bacteria (~12.5% spawn rate). Like Antigen 2, its visible symptom is **thermoregulatory**: reaction 96 dumps 2 units of Coldness into the bloodstream per firing, driving the creature's Coldness drive (heat-seeking behaviour) and potentially — at sustained high concentrations — crossing the 128-unit Coldness threshold for the involuntary Sleep reflex. Because reaction 96 fires continuously at every concentration (rather than in large bursts), an Antigen-3 infection produces a **steady, low-grade feeling-cold baseline** rather than Antigen 2's intermittent Coldness spikes. Players typically perceive an Antigen-3 infection as "my norn just feels cold all the time" rather than as a sickness per se, and they often address it by guiding the creature to a heat source rather than recognising the underlying immune response. Antigen 3 is therefore **"the steady-chills antigen"** — the constant thermal drip to Antigen 2's periodic cold burst.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 85` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 3. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 85 the bacterium becomes an Antigen-3 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 3 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81) at `ov17` rate (0.005-0.050), giving the familiar dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals (Glucose, Pyruvate, ATP, etc.), antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | An Antigen-3-carrying infection remains Antigen-3-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached. Because Antigen 3's reaction fires at the lowest possible threshold (1 unit), even a single-bacterium infection is immediately engaged by the immune system and reaches steady-state rapidly |
| 4 | **CAOS injection** | — | `CHEM TARG 85 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 96), the five injury receptors, and the downstream Coldness drive / Sleep reflex. Players do not normally encounter this pathway, but it is the route used by developer debug tools |
| 5 | **Community "chill-aura" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 85 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "steady cold bias" hazard sometimes inject Antigen 3 directly. It is preferred over Antigen 2 when the author wants a continuous low-grade feeling-cold effect rather than Antigen 2's punctate burst behaviour, and preferred over injecting Coldness (152) directly because the injury receptors add a plausible long-term health cost to the exposure |

Because the sole endogenous route to produce Antigen 3 does not exist in the standard genome, Antigen 3 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected environmental hazard, or a developer-side debug injection.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-3 immune response** (reaction 96, primary sink) | 88 (reaction 96, Baby onwards) | Reaction / Somatic | `1× Antigen 3 [85] → 1× Antibody 3 [105] + 2× Coldness [152]`, half-life 64 ticks ("Short", decay rate 0.989) | — | — | — | — | The primary consumption pathway. Unlike Antigen 2's reservoir-burn, this reaction fires **at a single unit** of reactant — any Antigen 3 presence immediately produces Antibody 3 and Coldness. The 1→1 antibody stoichiometry means antibody production tracks antigen injection one-to-one (minus decay on both ends), establishing a smooth continuous immune response. **Two units of Coldness per firing** is the same symptom load as Antigen 2, but delivered continuously rather than in bursts — producing a steady Coldness baseline instead of intermittent spikes. The Short 64-tick reaction half-life keeps the reservoir from ever accumulating significantly |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 144, 173, 124, 182, 129 (receptors 23, 67, 127, 133, 144, all Baby onwards) | Organ / Somatic (five separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gain 58-64, flags 0 | 0 | 0 | 58-64 | 0 (analogue, positive) | **Five** separate somatic organs carry an analogue injury-direction receptor on Antigen 3 with threshold 0 — meaning **any** trace of Antigen 3 in the bloodstream causes mild tissue damage. The gains (64, 64, 62, 64, 58; sum **312**) match Antigen 2's total exactly, so the per-tick injury rate at equivalent antigen concentration is the same. The key difference is the *average concentration*: because reaction 96 consumes Antigen 3 immediately at any level, Antigen 3's bloodstream residence time is **much shorter** than Antigen 2's, keeping the antigen closer to the injection rate / reaction-rate equilibrium than to a reservoir peak. The result is a lower average concentration and a proportionally lower long-term organ-damage floor than Antigen 2 at equivalent exposure |
| 3 | **Coldness symptom by-product** (indirect, via reaction 96) | 88 (reaction 96) | — | Reaction 96 produces 2× Coldness per activation | — | — | — | — | The game-visible consequence of Antigen 3 infection. Coldness has three in-chemistry effects: (a) it drives the Coldness drive (receptor 5, gain 204) — the creature feels cold and seeks heat sources; (b) at ≥128 it digitally triggers the LOC_INVOLUNTARY4 (Sleep) reflex (receptor 72, threshold 128, gain 255, DIGITAL flag) — the creature falls asleep involuntarily; and (c) it is the thermoregulatory counterpart to Hotness. Because reaction 96 fires at every concentration, Antigen 3 produces a **continuous Coldness drip** at roughly 2 units per reaction firing — a smooth symptomatic signature very different from Antigen 2's burst pattern. See biochemistry.json for the full Coldness wiring |
| 4 | **Passive decay** | — | — | Half-life **1,370 ticks** ("Long", decay rate 0.99949) | — | — | — | — | The fallback clearance pathway. ~46 seconds of real play per halving at 30 tps, a notch faster than Antigen 2's 1,670 ticks but still Long. Unlike Antigen 2, passive decay is *not* the dominant clearance pathway for Antigen 3 at any concentration — reaction 96 fires at every level and dominates the clearance curve. Passive decay matters primarily in the terminal phase of an infection, after the bacterium is killed and the remaining antigen drops below rough parity with the reaction rate |
| 5 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | As with every antigen, there is **no pharmacological antidote**. The player cannot medicate Antigen 3 directly — the only levers are (a) kill the bacterium (anti-bacterial spray), (b) keep the creature warm to counter the Coldness drive behaviourally, or (c) wait for reaction 96 plus passive decay to clear. Because reaction 96 is so aggressive, post-bacterium clearance for Antigen 3 is typically *faster* than for Antigen 2 — once the injection source stops, the reaction drains the bloodstream rapidly |
| 6 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Like the rest of the antigen block, Antigen 3 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). The pod reads antigens as background immune-system chemistry rather than as headline toxins. Players diagnose Antigen-3 presence indirectly — via the creature's persistently-elevated Coldness drive and, in heavy infections, the occasional involuntary-sleep reflex |

The usage table describes a chemical whose **primary role is information-theoretic** (it tells the immune system "fight this bacterium") and whose secondary role is **steady-state thermoregulatory disruption** via its continuous Coldness production plus slow tissue damage via five injury receptors. Unlike Antigens 0 and 1 (respiratory reflexes) and Antigen 2 (burst-pattern chills + periodic sleep), Antigen 3's symptom is a **continuous low-grade feeling-cold baseline** that is behaviourally the most easily confused with ordinary thermal preference.

## Role in Game Mechanics

### The Antibody-3 immune response: continuous drip rather than reservoir burst

Reaction 96 (gene 88) is the biochemical heart of the Antigen-3 immune response, and it is the structural counterpoint to Antigen 2's reaction 94:

```
1× Antigen 3 [85] → 1× Antibody 3 [105] + 2× Coldness [152]
```

Four design choices are encoded in this formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | **1× Antigen 3** | Reaction fires at the lowest possible threshold — any trace of antigen immediately engages the immune system |
| Antibody output | 1× Antibody 3 | Neither amplifying nor de-amplifying — antibody production tracks antigen injection exactly one-to-one per firing |
| Symptom by-product | **2× Coldness** | Same per-firing symptom load as Antigen 2, but delivered continuously rather than in bursts |
| Half-life | 64 ticks (Short, 0.989) | Fast reaction speed at all concentrations — the antigen is consumed the moment it appears, keeping average concentration low |

The 1-unit reactant threshold is the key structural feature. At 0.02 units/tick bacterium injection rate, reaction 96 begins firing within the first tick of any Antigen 3 presence, and it keeps firing continuously. This means:

- **Brief exposures** (bacterium attached for a few seconds) produce a small, continuous Coldness drip proportional to the exposure time. Unlike Antigen 2 — where brief exposures never trigger reaction 94 at all — Antigen 3 always engages the immune system immediately.
- **Chronic exposures** (single bacterium attached long-term) reach a rapid steady-state where reaction 96 consumes antigen at roughly the bacterium's injection rate. Antigen 3 concentration stays low, antibody 3 accumulates steadily, and Coldness trickles into the bloodstream at a predictable rate.
- **Heavy exposures** (multi-bacterium reproducing colony) push both the antigen injection rate and the reaction firing rate upwards, accumulating Coldness faster than its own decay. In prolonged heavy colonies, Coldness can climb past the 128-unit Sleep threshold, but it does so **gradually and predictably** — not in Antigen 2's sudden 2-unit spikes.

This continuous-drip structure is the diametric opposite of Antigen 2's punctate reservoir-burn. An Antigen-3 infection is **smooth and steady** where Antigen 2 is **step-wise and punctate**.

### The five somatic injury receptors

Antigen 3 matches Antigens 1 and 2 with five somatic injury receptors. Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 23 | 144 | 64 | First somatic organ takes injury proportional to Antigen 3 concentration × 64 |
| 67 | 173 | 64 | Second somatic organ takes injury × 64 |
| 127 | 124 | 62 | Third somatic organ takes injury × 62 |
| 133 | 182 | 64 | Fourth somatic organ takes injury × 64 |
| 144 | 129 | 58 | Fifth somatic organ takes injury × 58 |

Threshold 0 means **no "safe" concentration** exists — any Antigen 3 presence causes mild tissue damage whether the reaction is firing or not. The gains total **312** — identical to Antigen 2's and three higher than Antigen 1's (309). The raw per-unit injury rate is therefore the same as Antigen 2's.

The meaningful difference between Antigen 2 and Antigen 3 in damage terms is **average concentration**:

1. Antigen 2's 16-unit reaction threshold allows antigen to *accumulate* into a reservoir, producing periods of high concentration between burst clearances. The time-averaged concentration is relatively high.
2. Antigen 3's 1-unit reaction threshold keeps antigen near the injection-rate / reaction-rate equilibrium at all times. The time-averaged concentration is low.
3. Since injury per tick scales linearly with concentration, Antigen 3's long-term organ damage floor is **lower than Antigen 2's at equivalent exposure duration**, despite the identical total gain.

The net effect: a chronic Antigen-3 infection is **less damaging per tick** than a chronic Antigen-2 infection, but more damaging than Antigen 0 (four receptors, lower total gain) and comparable to Antigen 1.

### The Coldness symptom: the same chemical, a different rhythm

Coldness (152) is the symptom chemical for both Antigen 2 and Antigen 3, but the two antigens deliver it in fundamentally different patterns:

- **Antigen 2** (reaction 94, 16→12 burst): periodic 2-unit Coldness spikes separated by quiet intervals. Players see an intermittent symptom — the creature feels fine, then suddenly feels cold, then fine again.
- **Antigen 3** (reaction 96, 1→1 drip): continuous 2-unit Coldness releases at the reaction rate. Players see a steady low-grade Coldness elevation — the creature "just always feels a bit cold".

The three Coldness effects (Coldness drive, involuntary Sleep reflex, thermoregulation) apply identically regardless of the source antigen, but the patterns differ:

**1. Coldness drive** (receptor 5, gain 204): Antigen 3 produces a persistent low-to-moderate elevation of the Coldness drive rather than Antigen 2's periodic spikes. The behavioural signature is a creature that **consistently prefers warmer environments** and shows a steady heat-seeking bias.

**2. Involuntary Sleep reflex** (receptor 72, threshold 128, gain 255, DIGITAL): because reaction 96 produces Coldness more smoothly than reaction 94, crossing the 128-unit Sleep threshold requires sustained heavy infection rather than a single burst event. Single-bacterium Antigen-3 infections rarely trigger involuntary sleep; multi-bacterium colonies may push Coldness gradually past 128 and produce *prolonged* sleep episodes (versus Antigen 2's rapid wake-sleep-wake cycles).

**3. Ambient thermoregulation**: Antigen 3 adds a chronic, steady cold-side bias to the thermal balance — the creature's effective thermal "set-point" runs cooler than the ambient would otherwise produce.

### Why Antigen 3 has no antidote

As with every antigen, **antigens are cleared by the immune system, not by medication**. The design decision parallels real-world immunology:

- The **anti-bacterial spray** (AntiBact toxin) kills the bacterium source, stopping antigen injection at the root.
- **Keeping the creature warm** raises Hotness and can counter the Coldness drive at the behavioural level, but does not clear the antigen itself.
- **No stock potion clears Antigen 3 directly** — there is no genome reaction that consumes chemical 85 with a cure-reactant.
- **No stock potion clears Coldness (152) directly either** — only Hotness-balance thermoregulation and passive decay drain Coldness.

Because reaction 96 is aggressive (fires at every concentration), **post-bacterium Antigen-3 clearance is faster than post-bacterium Antigen-2 clearance**. Once the source bacterium is killed, the antigen drains rapidly through reaction 96, and the lingering Coldness clears through its own decay over a minute or two.

### The paired structure of the antigen block

Antigen 3 is the fourth entry in the systematically-paired antigen/antibody/symptom triples:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| Antigen 1 (83) | 93 (2→12) | Antibody 1 (103) | Histamine A (73) | LOC_INVOLUNTARY2 (Cough) |
| Antigen 2 (84) | 94 (16→12) | Antibody 2 (104) | Coldness (152, ×2) | Coldness drive + LOC_INVOLUNTARY4 (Sleep) |
| **Antigen 3 (85)** | **96 (1→1)** | **Antibody 3 (105)** | **Coldness (152, ×2)** | **Coldness drive + LOC_INVOLUNTARY4 (Sleep)** |
| Antigen 4 (86) | 95 (2→3) | Antibody 4 (106) | Hotness (153) | Thermoregulation |
| Antigen 5 (87) | 97 (1→3) | Antibody 5 (107) | Chemical 90 | — |
| Antigen 6 (88) | 98 (1→3) | Antibody 6 (108) | Hotness (153) | Thermoregulation |
| Antigen 7 (89) | 99 (1→3) | Antibody 7 (109) | Pain (148) | LOC_PAIN |

Antigen 3 and Antigen 2 form a **matched Coldness pair** — both drive the same thermoregulatory symptom chemistry but through opposite reaction geometries:

- **Antigen 2**: 16-unit threshold, de-amplifying, punctate bursts, long residence time, high organ damage.
- **Antigen 3**: 1-unit threshold, non-amplifying, continuous drip, short residence time, moderate organ damage.

A dual Antigen-2 + Antigen-3 infection is particularly dangerous because the two antigens' Coldness productions **stack additively**: Antigen 3 provides a steady Coldness baseline while Antigen 2 superimposes periodic spikes. At moderate infection load this baseline-plus-spike pattern can push peak Coldness past 128 repeatedly, producing more involuntary-sleep events than either antigen alone. This is the signature dual-thermal-antigen presentation — more dangerous than Antigen 2 alone or Antigen 3 alone, and one of the harder bacterial infections to manage through environmental heat management alone.

### Strategic / gameplay implications

- **Persistent low-grade feeling-cold ≈ Antigen 3 infection**: the primary diagnostic cue is the creature consistently preferring warm environments without obvious thermal justification. If Coldness drive is chronically elevated but there are no periodic sleep collapses, the culprit is almost always an Antigen-3 bacterium rather than an Antigen-2 one.
- **Heat exposure is still only symptom management**: as with Antigen 2, warming the creature raises Hotness and helps counter the Coldness drive at the behavioural level, but does nothing to kill the bacterium or clear the antigen. The creature will continue to accumulate (slow) organ damage.
- **Anti-bacterial spray is the causal cure**: kill the bacterium to stop antigen injection. Post-bacterium clearance for Antigen 3 is typically *faster* than for Antigen 2 because reaction 96 is more aggressive — expect clearance in 1-3 minutes rather than 2-5.
- **Antigen 3 is less per-tick-damaging than Antigen 2**: despite identical total gain (312), the shorter residence time means average bloodstream concentration is lower, so chronic organ damage accumulates more slowly. Prioritise Antigen-2 treatment over Antigen-3 treatment when both are suspected and resources are limited.
- **Dual thermal infections are the real danger**: Antigen 2 + Antigen 3 together produce a Coldness pattern more dangerous than either alone. A creature with persistent Coldness and *occasional* sleep collapses is the classic dual-thermal presentation — consider checking for multiple bacterial carriers and spraying aggressively.
- **Symptom onset is faster than Antigen 2**: because reaction 96 fires at trace concentrations, a player infecting a test creature with Antigen 3 will see Coldness symptoms within seconds; Antigen 2 may take 20-30 seconds of accumulation before the first burst fires. Antigen 3 is the "quick-onset" thermal antigen.

### Diagnostic visibility

Antigen 3 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable. Coldness (152) is likewise not a named toxin. Players diagnose Antigen 3 indirectly through:

- **Elevated Coldness drive on the creature's drive panel**, with a notably *steady* rather than spiky profile — the creature reports feeling cold persistently.
- **Heat-seeking behaviour** out of proportion to the ambient temperature.
- **Antibody 3 visible on chemistry panel** — direct evidence that reaction 96 has been firing, which implies Antigen 3 has been present in the bloodstream.
- **Chemistry panel shows Antigen 3 present at low levels with Antibody 3 at higher levels** — the signature of the 1→1 drip reaction running for some time with passive decay on the antibody side.
- **Bacterium agent visibly attached to creature** — if the bacterium's `ov15 = 85`, it is an Antigen-3 carrier.

The canonical clinical signature of an elevated Antigen 3 load is therefore:

- Steady elevated Coldness drive with no environmental cause, more persistent and less spiky than an Antigen-2 profile.
- Chronic heat-seeking behaviour.
- Rare or absent involuntary-sleep collapses (unless infection is heavy / multi-bacterium).
- Chemistry panel shows Antigen 3 low-but-nonzero with Antibody 3 steadily accumulating.
- Often a visible bacterium agent attached to the creature.
- Symptoms resolve within 1-3 minutes after the bacterium is killed, faster than Antigen 2.

## Summary

Antigen 3 is the fourth of the eight antigens (chemicals 82-89) and the **"steady chills antigen"** of the Creatures 3 immune system — the second thermal-symptom antigen and the structural counterpoint to Antigen 2. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 85, at a rate of 0.02 units per tick, and it is cleared by reaction 96 (`1× Antigen 3 → 1× Antibody 3 + 2× Coldness`, half-life 64 ticks, "Short") plus a Long passive decay (1,370 ticks, ~46 seconds per halving). Where Antigen 2 uses a high-threshold de-amplifying reservoir-burn (16→12), **Antigen 3 uses the lowest possible threshold and a flat 1→1 ratio**, producing a continuous antibody drip and a steady low-grade Coldness release rather than punctate bursts. The Coldness by-product drives the Coldness drive (gain 204, motivating heat-seeking) and, above 128 units, digitally triggers the LOC_INVOLUNTARY4 (Sleep) reflex — the same symptom wiring as Antigen 2, but the gradual accumulation means involuntary sleep only occurs under sustained heavy infection rather than as a routine event. **Five** somatic organs carry analogue `RLOCUS_INJURY` receptors on Antigen 3 (threshold 0, gains 64/64/62/64/58 summing to **312**, identical to Antigen 2's total) — but because reaction 96 keeps the average bloodstream concentration low, the long-term organ-damage floor is proportionally lower than Antigen 2's at equivalent exposure. There is **no pharmacological antidote**: the only way to clear Antigen 3 is to kill the source bacterium (anti-bacterial spray) and wait, though reaction 96's aggressive clearance makes the post-bacterium tail phase faster than Antigen 2's. Player-side, Antigen 3 is experienced as "my norn just feels cold all the time" — the steadiest and most easily-misdiagnosed of the visible-symptom antigens, because the symptom maps cleanly onto ordinary thermal preference. It pairs with Antigen 2 on the shared Coldness symptom, and a dual Antigen-2 + Antigen-3 infection stacks a steady Coldness baseline with periodic spikes — together pushing peak Coldness past the Sleep threshold more easily than either alone, and constituting one of the more dangerous multi-bacterium thermal presentations in the game.
