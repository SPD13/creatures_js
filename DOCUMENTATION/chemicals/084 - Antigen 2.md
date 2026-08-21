# 084 - Antigen 2

Antigen 2 is chemical slot 84 in the Creatures 3 chemistry and the third entry in the canonical **antigen block** (chemicals 82-89, Antigen 0 through Antigen 7). Antigens are the in-chemistry representation of **bacterial invaders**: they are the specific molecular "fingerprints" that bacteria inject into a host's bloodstream to flag their presence, and they are the triggers that drive the creature's immune system to manufacture antibodies. Antigen 2 is specifically paired with **Antibody 2 (104)** and with **Coldness (152)**: the standard genome reaction 94 consumes **sixteen** units of Antigen 2 to produce twelve units of Antibody 2 plus two units of Coldness, which is why an Antigen-2-carrying infection produces the game's characteristic **feeling-cold / shivering** symptom via the Coldness drive and the LOC_INVOLUNTARY4 (Sleep) reflex at high concentrations.

Antigen 2 is **exogenously sourced** — no part of the standard genome produces it endogenously. The only in-world producer is the `bacteria.cos` agent family (`2 32 23`), which rolls `ov15` to one of 82-89 at spawn time and injects that chemical into any host it is attached to at 0.02 units per tick. When `ov15 = 84`, the bacterium is an **Antigen-2 carrier**: every tick, while the bacterium is active (not dormant), it dumps a small pulse of Antigen 2 into the host's bloodstream. The creature's response is dual-pronged — reaction 94 slowly burns the antigen down while manufacturing Antibody 2, *and* five somatic `RLOCUS_INJURY` receptors read the antigen's concentration as a tissue-damage signal. Antigen 2 is therefore both **the trigger for immunity** and **a direct source of infection-related organ damage** whenever an Antigen-2 bacterium is chronically infecting a host. It carries the same number of injury receptors as [Antigen 1](083%20-%20Antigen%201.md) (five) but its immune reaction is radically different in structure: Antigens 0 and 1 use a low-threshold / high-amplification pattern (2→12), whereas **Antigen 2 uses a high-threshold / de-amplifying pattern (16→12)** — the immune response fires rarely but consumes a large pool of antigen per firing.

The chemical's passive half-life is **Long** (1,670 ticks, decay rate 0.99958, ~56 seconds of real play per halving at 30 tps) — the same decay profile shared by every chemical in the antigen block (82-89). Combined with reaction 94's Short half-life (64 ticks, decay rate 0.989), this produces a characteristic clearance profile unlike Antigens 0 and 1: because the reaction requires **16 units** of Antigen 2 to fire, low-grade infections never trigger a proper immune response and are cleared almost exclusively by passive decay. Only sustained, heavy infections push Antigen 2 past the 16-unit threshold, at which point reaction 94 begins firing and rapidly consumes the reservoir while dumping bursts of Coldness into the bloodstream. There is **no dedicated antidote reaction** for Antigen 2 — the player cannot directly neutralise an antigen with any of the stock potions; they can only feed the bacterium-suppression antibiotic (the anti-bacterial spray) and wait for reaction 94 and passive decay to clear the chemical.

In-game, Antigen 2 is one of the eight antigens rolled uniformly by bacteria (~12.5% spawn rate). Unlike Antigens 0 and 1, which drive loud respiratory reflexes (sneeze and cough) that players notice immediately, Antigen 2's symptom is **thermoregulatory**: the Coldness by-product raises the creature's Coldness drive and, at high concentrations, fires the involuntary **Sleep** reflex. Players typically perceive an Antigen-2 infection as "my norn keeps feeling cold / keeps falling asleep" rather than as a sickness per se, and they often address it by guiding the creature to a heat source or a bed rather than recognising the underlying immune response. Because Coldness is also a *drive* (not just a somatic signal), an Antigen-2 infection has a characteristic behavioural signature: the creature's Coldness drive rises, motivating it to seek warmth, and in heavy infections the creature may fall asleep involuntarily even in otherwise stimulating environments. Antigen 2 is therefore **"the chills antigen"** or **"the sleepy-cold antigen"** of the block.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Bacterial infection** (direct injection) | `bacteria.cos` (family/genus/species `2 32 23`), `ov15 = 84` | Every timer tick while active (not dormant): `chem ov15 0.02` on the attached host | The only in-world source of Antigen 2. At spawn the bacterium rolls `ov15` uniformly across 82-89; when the roll is 84 the bacterium becomes an Antigen-2 carrier. While attached to a host and not dormant, it injects **0.02 units of Antigen 2 per tick**. The bacterium also simultaneously injects its rolled `ov16` toxin (chemicals 70-81, e.g. Glycotoxin, Sleep toxin, Histamine A/B, etc.) at `ov17` rate (0.005-0.050), giving a dual-chemical injection pattern — antigen + toxin. See `DOCUMENTATION/caos_scripts/bacteria.md` for the full bacterium behaviour |
| 2 | **No endogenous production** | — | — | Unlike metabolic chemicals (Glucose, Pyruvate, ATP, etc.), antigens are **not manufactured** by any reaction in the standard genome. They exist in a creature's bloodstream only when an external agent has injected them. This is by design: antigens are meant to be a pathogen-specific signal, not a routine biochemical |
| 3 | **Indirect via bacterium reproduction** | `bacteria.cos` splitting behaviour | When a bacterium splits (reproduces), the child inherits `ov15` from the parent | Because bacteria reproduce by splitting, an Antigen-2-carrying infection remains Antigen-2-carrying across generations. A chronic infection persists its antigen profile and will keep injecting the same antigen into the host as long as any child bacterium is attached. Because Antigen 2's reaction requires a 16-unit reservoir before firing, a single-bacterium infection tends to accumulate antigen rather than clear it, and multi-bacterium or reproducing infections are where the immune response becomes effective |
| 4 | **CAOS injection** | — | `CHEM TARG 84 <amount>` from scripts or the debug console | Used for testing the immune response (reaction 94), the five injury receptors, and the downstream Coldness drive / Sleep reflex. Players do not normally encounter this pathway, but it is the route used by the Medical Pod's toxin-testing utilities and by developer debug tools |
| 5 | **Community "chill" / "cold-pathogen" agents** | User-made `.agents` / `.cob` files | `CHEM TARG 84 <amount>` on bite, touch or spore-emission events | Community authors wanting to ship a "cold-aura" hazard, a "frozen-air" room agent, or an "icicle" that makes creatures feel cold on contact sometimes inject Antigen 2 directly. It is preferred over injecting Coldness (152) directly because reaction 94's stochastic burst behaviour produces a more organic feeling-cold pattern (intermittent Coldness spikes) than a steady Coldness injection, and because the five injury receptors add a plausible long-term health cost to the exposure |

Because the sole endogenous route to produce Antigen 2 does not exist in the standard genome, Antigen 2 is effectively an **infection-only** chemical — its presence in a creature's bloodstream always signals either a current or recent bacterial exposure, a user-injected environmental hazard, or a developer-side debug injection.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Antibody-2 immune response** (reaction 94, primary sink) | 87 (reaction 94, Baby onwards) | Reaction / Somatic | `16× Antigen 2 [84] → 12× Antibody 2 [104] + 2× Coldness [152]`, half-life 64 ticks ("Short", decay rate 0.989) | — | — | — | — | The primary consumption pathway, and structurally unusual within the antigen block. Each activation burns **sixteen** units of Antigen 2 and manufactures twelve units of Antibody 2 — this is not an amplifying reaction: it consumes more antigen than it produces antibody (4-unit deficit per firing in molecule count). The reaction is therefore a **reservoir-burn** rather than a multiplier: the creature must accumulate a large pool of antigen before any antibody is manufactured, and each firing produces a Coldness pulse as the visible symptom. The Short half-life (64 ticks) means that *once* the 16-unit threshold is crossed, the reaction fires rapidly and repeatedly, rapidly draining the reservoir and generating bursts of Coldness |
| 2 | **Somatic injury receptors** (tissue damage, organ-localised) | 171, 181, 112, 185, 128 (receptors 50, 99, 128, 136, 145, all Baby onwards) | Organ / Somatic (five separate organ slots) | `RLOCUS_INJURY`, threshold 0, nominal 0, gain 58-64, flags 0 | 0 | 0 | 58-64 | 0 (analogue, positive) | **Five** separate somatic organs carry an analogue injury-direction receptor on Antigen 2 with threshold 0 — meaning **any** trace of Antigen 2 in the bloodstream causes mild tissue damage on these organs. The gains (64, 64, 58, 64, 62; sum 312) are moderate, so a small antigen dose causes a slow damage rate, but a sustained chronic infection progressively injures the organs. Combined with the high 16-unit reaction threshold, Antigen 2 infections tend to sit in a *sub-threshold damaging zone* for longer than Antigens 0/1 — the creature accumulates injury from the receptors before any immune response starts clearing antigen, so organ damage tends to reach a higher floor before the reservoir-burn kicks in |
| 3 | **Coldness symptom by-product** (indirect, via reaction 94) | 87 (reaction 94) | — | Reaction 94 produces 2× Coldness per activation | — | — | — | — | Not a direct effect of Antigen 2 itself, but its most behaviourally-visible consequence: every activation of reaction 94 produces **two units of Coldness** — twice the symptom load per firing of Antigens 0/1. Coldness has three in-chemistry effects: (a) it drives the Coldness drive (receptor 5, gain 204) — the creature feels cold and will seek heat sources; (b) at ≥128 it digitally triggers the LOC_INVOLUNTARY4 (Sleep) reflex (receptor 72, threshold 128, gain 255, DIGITAL flag) — the creature falls asleep involuntarily; and (c) it is the thermoregulatory counterpart to Hotness and participates in ambient temperature regulation. Reaction 94's burst pattern therefore produces a characteristic *intermittent feeling-cold / sudden-sleep* symptom pattern. See biochemistry.json for the full Coldness wiring |
| 4 | **Passive decay** | — | — | Half-life **1,670 ticks** ("Long", decay rate 0.99958) | — | — | — | — | The fallback clearance pathway and the decay profile shared across the entire antigen block (82-89 all have Long/1,670). ~56 seconds of real play time per halving at 30 tps. For Antigen 2 specifically, passive decay is the **dominant** clearance mechanism at sub-threshold concentrations (below 16 units), because reaction 94 simply doesn't fire. A mild, single-bacterium infection may never accumulate enough antigen for the immune system to activate — the antigen is produced at 0.02/tick and passively lost at ~0.042%/tick, establishing a rough steady-state around 48 units if the bacterium runs continuously without interruption, with the 16-unit reaction threshold crossed only when the bacterium is actively injecting for some time |
| 5 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | Unlike the toxins in block 70-81 (Histamine A/B cleared by Antihistamine, Cyanide by Cyanide antidote, Fever toxin by Antipyretic, etc.), Antigen 2 has **no pharmacological antidote**. There is no stock-genome reaction that consumes Antigen 2 alongside a cure-potion reactant. The player cannot medicate antigen directly — the only levers are (a) kill the bacterium (anti-bacterial spray to stop antigen injection at source), (b) keep the creature warm to counter the Coldness symptom behaviourally (and avoid the Sleep reflex by preventing Coldness from reaching 128), or (c) wait out passive decay. The Coldness symptom itself *can* be directly suppressed by keeping the creature near a heat source, which raises Hotness and can counter the Coldness drive, but this does not clear the underlying Antigen 2 |
| 6 | **Not listed in the Medical Pod toxin panel** | Medical Scanner / Medical Pod | — | — | — | — | — | — | Unlike Histamine A/B, Cyanide, Heavy Metals, Glycotoxin, Fever toxin and other block-70-81 toxins, Antigen 2 is **not** surfaced as a named toxin in the Medical Pod's diagnostic panel (`ov71` highest-toxin variable). The pod reads antigens as background immune-system chemistry rather than as headline toxins. Players diagnose Antigen-2 presence indirectly — via the creature's elevated Coldness drive, the involuntary-sleep reflex firing, and/or a visible bacterium attached to the creature |

The usage table describes a chemical whose **primary role is information-theoretic** (it tells the immune system "fight this bacterium") and whose secondary role is **slow tissue damage** via five injury receptors. Unlike Antigens 0 and 1, whose symptoms hijack respiratory reflexes and are aurally obvious, Antigen 2's symptom is *behavioural* — the creature feels cold and may fall asleep — and is easily misread by players as a temperature-management or tiredness issue rather than as an infection.

## Role in Game Mechanics

### The Antibody-2 immune response: reservoir-burn rather than amplification

Reaction 94 (gene 87) is the biochemical heart of the Antigen-2 immune response, and it is the structural outlier of the antigen block:

```
16× Antigen 2 [84] → 12× Antibody 2 [104] + 2× Coldness [152]
```

Four design choices are encoded in this single formula:

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Reactant stoichiometry | **16× Antigen 2** | Reaction requires a very large accumulation of antigen before firing — trace infections don't produce any antibody at all |
| Antibody output | 12× Antibody 2 | The reaction is **de-amplifying** by molecule count (16 in, 12 out): each firing consumes more antigen than it produces antibody |
| Symptom by-product | **2× Coldness** | Double the symptom load per firing compared to Antigens 0/1 (which produce 1× Histamine) — when the reaction does fire, it fires hard |
| Half-life | 64 ticks (Short, 0.989) | Fast reaction speed *once the threshold is crossed* — the reservoir drains quickly and Coldness spikes in bursts |

The 16-unit reactant threshold is the key structural feature. At 0.02 units/tick bacterium injection rate, a single bacterium takes roughly 800 ticks (~26 seconds of play) of *uninterrupted* injection to accumulate the first reaction threshold — longer in practice, because passive decay (0.042%/tick) is eating the antigen continuously. This means:

- **Brief exposures** (bacterium attached for a few seconds) never trigger reaction 94 at all. Antigen 2 accumulates up to some sub-threshold peak, decays over a couple of minutes, and the creature experiences only the slow organ damage from the injury receptors without any symptomatic Coldness.
- **Moderate exposures** (chronic bacterium attachment) eventually push Antigen 2 past 16 units, at which point reaction 94 fires, dumps 2 Coldness, drops Antigen 2 by 16 units back to 0. The reservoir then refills over another ~30 seconds of bacterium activity, and the cycle repeats. The creature experiences an **intermittent feeling-cold pattern** — periodic Coldness spikes separated by quiet intervals.
- **Heavy exposures** (multi-bacterium reproducing colony) push Antigen 2 well past 16 units and keep it there: reaction 94 fires repeatedly in quick succession, stacking Coldness faster than it can decay, and the creature's Coldness drive rises while they may also cross the 128 threshold for involuntary sleep.

This reservoir-burn structure is dramatically different from the smooth, continuous antibody production of Antigens 0 and 1. The Antigen 2 immune response is **step-wise and punctate** rather than continuous.

### The five somatic injury receptors

Unlike Antigen 0 (four receptors), Antigen 2 matches Antigen 1's five-receptor injury load. Each receptor is an analogue, positive-direction receptor with threshold 0 (any trace fires it), nominal 0, and no flags:

| Receptor ID | Gene | Gain | Organ effect |
|-------------|------|------|--------------|
| 50 | 171 | 64 | First somatic organ takes injury proportional to Antigen 2 concentration × 64 |
| 99 | 181 | 64 | Second somatic organ takes injury × 64 |
| 128 | 112 | 58 | Third somatic organ takes injury × 58 |
| 136 | 185 | 64 | Fourth somatic organ takes injury × 64 |
| 145 | 128 | 62 | Fifth somatic organ takes injury × 62 |

The threshold of 0 is significant: there is **no "safe" concentration** of Antigen 2 — any presence at all causes mild tissue damage, whether reaction 94 is firing or not. The gains (58-64) are moderate, summing to 312 across the five organs — slightly higher than Antigen 1's 309. In practice, Antigen 2's damage *footprint* is a little heavier than Antigen 1's because:

1. **The five gains total 312 vs Antigen 1's 309** — a fractional difference per tick.
2. **The 16-unit reaction threshold means Antigen 2 lingers in the bloodstream at higher average concentrations** than Antigens 0/1, because it takes longer to fire the clearance reaction. Higher average concentration × the same per-unit gain = more injury per unit of bacterium time.
3. Because the antibody amplification is *negative* (de-amplifying), the immune system suppresses the bacterium more slowly than for Antigens 0/1, extending the infection duration.

The net effect: a chronic Antigen-2 infection inflicts the **highest long-term somatic damage** of the three symptom-carrying antigens (0, 1, 2), despite being the least acutely alarming to the player.

### The Coldness symptom: thermoregulation and sleep

Coldness (152) is the symptom chemical produced by reaction 94 and is the most game-visible consequence of an Antigen-2 infection. It has three distinct effects in the standard genome:

**1. Coldness drive** (receptor 5, gene 4, tissue Drives, gain 204, analogue):
- Feeds directly into the creature's Coldness drive, which motivates heat-seeking behaviour.
- A creature with elevated Coldness will exhibit a strong preference for heat-emitting objects and rooms.
- The creature may leave a food source, a companion, or a comfortable location to go stand near a fire or a heating vent.
- At gain 204 out of 255, this is one of the stronger drive inputs in the chemistry — Coldness is a motivationally-loud signal.

**2. Involuntary Sleep reflex** (receptor 72, gene 95, tissue Sensorimotor, locus LOC_INVOLUNTARY4, threshold 128, gain 255, DIGITAL flag):
- If Coldness crosses 128 units, the creature digitally and immediately enters the involuntary Sleep state (LOC_INVOLUNTARY4).
- The DIGITAL flag means this is an all-or-nothing reflex, not a proportional one: below 128 no effect, at 128+ instantly asleep.
- This is the classic "hypothermia sleep" pattern — a heavily-infected creature may suddenly drop to the ground asleep even in mid-activity.
- This produces one of the most visually-distinctive Antigen-2 symptoms: a creature that periodically collapses into sleep, wakes up, collapses again as Coldness re-accumulates.

**3. Ambient thermoregulation**:
- Coldness participates in the broader thermoregulation chemistry, pairing with Hotness (153) to represent the creature's thermal state.
- An Antigen-2 infection effectively adds a chronic cold-side bias to the thermal balance, making the creature run cooler than its environment would otherwise dictate.

Together these effects create the Antigen-2 clinical picture: a creature that **feels cold, seeks heat, and periodically falls asleep** without any obvious external cause. A player not familiar with the biochemistry may mistake this for genuine thermal discomfort or tiredness, and may respond by moving the creature to a warmer area — which is *appropriate* behaviourally (raising Hotness counters Coldness at the drive level) but does nothing to clear the underlying antigen.

### Why Antigen 2 has no antidote

As with all antigens, the design decision to give Antigen 2 no pharmacological antidote parallels real-world immunology: **antigens are cleared by the immune system, not by medication**. In Creatures 3 terms:

- The **anti-bacterial spray** (AntiBact toxin) kills the bacterium source, stopping antigen injection at the root.
- **Keeping the creature warm** raises Hotness and can counter the Coldness drive at the behavioural level, but does not clear the antigen itself.
- **No stock potion clears Antigen 2 directly** — there is no genome reaction that consumes chemical 84 with a cure-reactant and produces nothing.
- **No stock potion clears Coldness (152) directly either** — the only sink on Coldness is Hotness-balance thermoregulation and its own passive decay, so even the symptom is hard to medicate away.

The practical implication is that the only reliable way to resolve an Antigen-2 infection is to **kill the bacterium and wait**. Passive decay plus reaction 94 will eventually drain the antigen reservoir (though slowly — Long half-life is 56 seconds per halving, and reaction 94 only fires when ≥16 units are present).

### The paired structure of the antigen block

Antigen 2 is the third entry in a systematically-paired block of antigen/antibody/symptom triples:

| Antigen | Reaction | Antibody | Symptom by-product | Symptom receptor |
|---------|----------|----------|---------------------|-------------------|
| Antigen 0 (82) | 92 (2→12) | Antibody 0 (102) | Histamine B (74) | LOC_INVOLUNTARY3 (Shiver / sneeze) |
| Antigen 1 (83) | 93 (2→12) | Antibody 1 (103) | Histamine A (73) | LOC_INVOLUNTARY2 (Cough) |
| **Antigen 2 (84)** | **94 (16→12)** | **Antibody 2 (104)** | **Coldness (152, ×2)** | **Coldness drive + LOC_INVOLUNTARY4 (Sleep)** |
| Antigen 3 (85) | 96 (1→1) | Antibody 3 (105) | Coldness (152, ×2) | Thermoregulation |
| Antigen 4 (86) | 95 (2→3) | Antibody 4 (106) | Hotness (153) | Thermoregulation |
| Antigen 5 (87) | 97 (1→3) | Antibody 5 (107) | Chemical 90 | — |
| Antigen 6 (88) | 98 (1→3) | Antibody 6 (108) | Hotness (153) | Thermoregulation |
| Antigen 7 (89) | 99 (1→3) | Antibody 7 (109) | Pain (148) | LOC_PAIN |

Antigen 2 is the first "thermal" antigen in the block and the only one that uses the high-threshold 16→12 pattern — this is a genuine structural outlier. All the other thermal antigens (3, 4, 6) use small-amount reactions (1→1, 2→3, 1→3). Antigen 2's structure gives it a unique clinical presentation:

- It is the **only antigen** that does not fire its reaction at trace concentrations. All other antigens begin immune response at 1 or 2 units of reactant.
- It produces **double the symptom load per firing** (2× Coldness vs 1× Histamine/Hotness/etc.) compared to any other antigen — when it does fire, it fires hard.
- It pairs with Antigen 3 on Coldness as their shared symptom, but Antigen 3 uses a 1→1 reaction (constant low-level Coldness drip) while Antigen 2 uses the 16→12 reservoir-burn. An Antigen-2+Antigen-3 dual infection therefore produces a steady Coldness baseline (Antigen 3) with superimposed Coldness spikes (Antigen 2), which at sufficient load can push Coldness past 128 and trigger involuntary Sleep — a signature dual-bacterium presentation.

### Strategic / gameplay implications

- **Feeling cold + periodic sleep ≈ Antigen 2 infection**: the primary diagnostic cue is the creature exhibiting an elevated Coldness drive and/or periodic involuntary sleep collapses, especially if there is no obvious cold environment to explain it. If Coldness is behaviourally elevated but the creature is indoors near heat sources, the culprit is almost always an Antigen-2 bacterium.
- **Heat exposure is only a symptom-management strategy**: moving an infected creature to a heat source raises Hotness and helps counter the Coldness drive at the behavioural level, reducing the chance of involuntary sleep, but it does nothing to kill the bacterium or clear the antigen. The creature will continue to accumulate organ damage until the bacterium is suppressed.
- **Anti-bacterial spray is the causal cure**: to stop Antigen 2 at its root, the player must kill the bacterium. Once the bacterium is gone, reaction 94 and passive decay will clear the antigen over 2-5 minutes of play (longer than Antigens 0/1 because of the higher reaction threshold and the sub-threshold decay regime).
- **Antigen 2 inflicts the most long-term damage of the symptom-carrying antigens**: the combination of five injury receptors, a slightly higher total gain (312), and a longer average bloodstream residence time (because of the 16-unit reaction threshold delaying clearance) makes Antigen 2 the most damaging-per-infection of the "visible-symptom" antigens (0, 1, 2). A player managing long-term creature health should treat an Antigen-2 infection with a slightly higher priority than a cough or sneeze.
- **The involuntary Sleep reflex is the acute danger**: a creature that falls asleep in a hazardous location (near an elevator, in a predator's path, in a cold room that keeps firing the reflex) can be genuinely vulnerable. Unlike the cough and sneeze reflexes, which are merely inconvenient, the Sleep reflex takes the creature out of motion and awareness entirely until Coldness drops below 128 — which, if reaction 94 keeps firing, can be a prolonged period.
- **Dual infection scenarios matter**: because Antigen 2 and Antigen 3 both produce Coldness, an Antigen-2 + Antigen-3 infection has a compounding symptom effect that is disproportionately worse than either alone. Players encountering creatures with persistent Coldness and frequent sleeping should consider the possibility of multiple bacterial carriers.

### Diagnostic visibility

Antigen 2 is **not** surfaced in the Medical Pod's `ov71` toxin-name variable — the pod only tracks chemicals in the toxin block 70-81. Coldness (152) is likewise not a named toxin. Players diagnose Antigen 2 indirectly through:

- **Elevated Coldness drive on the creature's drive panel** — the creature reports feeling cold even in neutral or warm environments.
- **Periodic involuntary sleep** — the creature collapses into sleep at irregular intervals, particularly during heavy infections.
- **Coldness-seeking behaviour** — the creature abandons other activities to seek heat sources repeatedly.
- **Antibody 2 visible on chemistry panel** — direct evidence that reaction 94 has been firing, which implies that Antigen 2 has been accumulating past 16 units.
- **Bacterium agent visibly attached to creature** — if the bacterium's `ov15 = 84`, it is an Antigen-2 carrier (this is not displayed in-game).

The canonical clinical signature of an elevated Antigen 2 load is therefore:

- Elevated Coldness drive with no environmental cause.
- Periodic involuntary-sleep collapses, particularly under sustained infection.
- Heat-seeking behaviour out of proportion to the ambient temperature.
- Chemistry panel shows Antigen 2 and Antibody 2 both elevated (Antibody 2 only present if the reservoir has fired at least once).
- Often a visible bacterium agent attached to the creature.
- Symptoms resolve over several minutes after the bacterium is killed, with a characteristic tail pattern: involuntary sleep stops first (as Coldness drops below 128), heat-seeking fades next (as Coldness drive drops), and the sub-threshold antigen finally clears through passive decay.

## Summary

Antigen 2 is the third of the eight antigens (chemicals 82-89) and the **"chills antigen"** of the Creatures 3 immune system — the first of the thermal-symptom antigens and a structural outlier in the block. It is injected into a host exclusively by bacteria whose rolled `ov15` equals 84, at a rate of 0.02 units per tick, and it is cleared by reaction 94 (`16× Antigen 2 → 12× Antibody 2 + 2× Coldness`, half-life 64 ticks, "Short") plus a Long passive decay (1,670 ticks, ~56 seconds per halving). Unlike Antigens 0 and 1, which use a low-threshold amplifying immune response (2→12), Antigen 2 uses a **high-threshold de-amplifying reservoir-burn** (16→12): the reaction requires a large accumulation of antigen before firing, then burns hard and produces a double dose of Coldness per firing. The Coldness by-product drives the creature's Coldness drive (gain 204, motivating heat-seeking) and, above 128 units, digitally triggers the LOC_INVOLUNTARY4 (Sleep) reflex, producing the characteristic feeling-cold / periodic-sleep symptom pattern. **Five** somatic organs carry analogue `RLOCUS_INJURY` receptors on Antigen 2 (threshold 0, gains summing to 312), one more than Antigen 0 and matching Antigen 1 — combined with Antigen 2's higher average bloodstream residence time (because of the 16-unit reaction threshold), this makes Antigen 2 the most somatically-damaging of the visible-symptom antigens over a chronic infection. There is **no pharmacological antidote**: the only way to clear Antigen 2 is to kill the source bacterium (anti-bacterial spray) and wait for reaction 94 and passive decay to do the rest. Heat-source exposure counters the Coldness drive at the behavioural level but does not clear the antigen, and it does not directly reduce the Sleep reflex risk because it does not remove Coldness — only Coldness's own decay and the Hotness balance can do that. Player-side, Antigen 2 is experienced as "my norn keeps feeling cold and falling asleep" — a subtler and more easily-misdiagnosed infection than the cough and sneeze antigens, because the symptoms map onto ordinary behaviours (temperature preference, tiredness) rather than onto obvious illness reflexes. It pairs with Antigen 3 on the shared Coldness symptom, and a dual Antigen-2 + Antigen-3 infection can stack Coldness hard enough to keep the creature semi-permanently asleep, making combined thermal-antigen infections one of the more dangerous multi-bacterium presentations in the game.
