# 149 - Hunger for protein

Hunger for protein is the **active, brain-visible half** of the drive pair for protein nutrition in Creatures 3. It is the first of the sixteen "drive" chemicals in the 148–161 block (the bank of acute drive signals the decision-lobe reads every tick) and is paired one-to-one with its long-lived reservoir partner, **Hunger for protein backup (132)**. Where the backup holds the slow-moving "memory" of how protein-deprived the creature has been over the minute-scale timescale, chemical 149 is the fast-moving *felt* value: the number the Norn's brain actually consults when deciding whether to walk to the vendor, eat the cheese on the floor, or ignore food entirely. It is also the signal that feeds the Creature Companion's "Hunger for Protein" drive bar, and it is the threshold-gated trigger for the Circulatory system's critical-hunger alarm.

Unlike most metabolite chemicals (glucose, fatty acid, amino acid, etc.), Hunger for protein is **not a nutrient**. It is a pure signalling chemical: its concentration represents how much the creature "wants" protein rather than how much protein the creature has. The wiring in the stock Norn genome produces chemical 149 continuously from a constant sensorimotor emitter (the "metabolic clock"), amplifies it via a positive-feedback emitter on a circulatory locus, and siphons most of its instantaneous mass into the long-term reservoir at chemical 132. The net effect is that 149's steady-state value tracks the creature's long-term protein balance, while briefly spiking or dipping in response to recent events (a meal, a pain event, a `CHEM` injection, or a metabolic shock).

Hunger for protein has a **"Very long"** half-life (≈ 9·10¹⁰ ticks, genome byte 255 — effectively permanent on its own), so like all drives in the 148–161 range its mass is conserved until it is explicitly consumed. The three consumers are: the self-refill reaction (66) that pulls it into backup 132, external `CHEM 149 <−n>` calls fired by food-eating scripts, and the natural budget the Drives-tissue receptor applies when the brain reads the value. Its newborn concentration is **33/255 ≈ 13 %**, so every Norn hatches mildly hungry.

## Sources

Hunger for protein has three **endogenous** inflows and two **external** inflows. Of these, the constant sensorimotor emitter is by far the dominant source — the bedrock of the drive's "always-on" baseline.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Constant sensorimotor emitter (the "metabolic clock") | Gene 36 (emitter id 1) | Organ #1 "Creature" → Sensorimotor (tissue 4) → locus 0 `LOC_CONST` | Always on from Baby life-stage. Writes chemical 149 every tick | Rate byte **30**, gain **2**, threshold 0. At full gain this is ≈ 60 drive-units per tick, but in practice the steady-state output is moderated by the backup siphon (reaction 66) |
| 2 | Positive-feedback circulatory emitter | Gene 35 (emitter id 11) | Organ #1 "Creature" → Circulatory (tissue 1) → locus 8 | Digital (all-or-nothing); fires when the signal at circulatory locus 8 exceeds threshold **128** (mid-range) | Rate byte **12**, gain **2**. When active, adds another burst of protein hunger. Locus 8 is the low-blood-protein signal, so a creature with low circulating protein becomes *more* hungry — classic metabolic feedback |
| 3 | Backup → drive release | Gene 8 (reaction id 43) | Organ #2 "Reaction" | `1× Hunger for protein backup [132] → 1× Hunger for protein [149]` | Half-life **311 ticks** (≈ 10 s), "Medium" speed. The reservoir steadily drip-feeds the active drive — this is what makes hunger return a few seconds after a meal |
| 4 | External CAOS injection | — | Any | `CHEM 149 <n>` on a targeted creature from scripts, bootstrap agents, or the debug console | One-shot. Because the chemical is "Very long" half-life, injected mass persists until reaction 66 drains it to the backup or food scripts consume it |
| 5 | Initial concentration at birth | Gene 16 (initialConcentrations id 8) | Bloodstream | Every Norn hatches at **amount 33 / 255 ≈ 12.94 %** of Hunger for protein | One-time, applied at Baby life-stage |
| 6 | Modded inflows | User-added | User-added | Custom emitters keyed to a "chronic-hunger" lobe, `CREA` / `TMVT` events, or ingestion-triggered scripts | Gene-dependent |

## Usage

Hunger for protein has four distinct consumers: two receptors that read it (but do not destroy it — receptors are sensors), one reaction that converts it to backup, and the implicit "consumption" by food scripts via negative `CHEM` calls.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | **Decision-lobe drive bar** | Gene 2 (receptor id 2) | Organ #1 "Creature" → Drives (tissue 5) → locus 1 "Hunger for protein" | Analogue, threshold **0**, nominal 0, **gain 209**. Reads chemical 149 from Baby | This is the value the brain's drive-selection decision lobe consults when choosing what action to take. The gain of 209/255 means a full active drive maps to ≈ 82 % excitation on the drive neuron. **This is the signal that shows on the Creature Companion's "Hunger for Protein" bar** |
| 2 | **Critical-hunger digital alarm** | Gene 38 (receptor id 161) | Organ #1 "Creature" → Circulatory (tissue 1) → locus 6 | **DIGITAL (all-or-nothing)**, threshold **214**, gain **255**. Reads chemical 149 from Baby | Fires a hard on/off signal at circulatory locus 6 when hunger exceeds ≈ 83 % of full range. Locus 6 is a whole-body alarm channel that downstream organs and reactions gate on — when this trips, the creature is in "starvation risk" mode |
| 3 | Active → backup siphon | Gene 62 (reaction id 66) | Organ #2 "Reaction" | `1× Hunger for protein [149] → 1× Hunger for protein backup [132]` | Half-life **6 ticks** (≈ 0.2 s), "Very short". Pulls active drive into the reservoir aggressively, which is what keeps the active drive from blowing up under the constant sensorimotor emitter's pressure |
| 4 | Food-script consumption | — | Any food-agent script | `CHEM 149 <negative n>` called at the end of an eating/drinking animation | The canonical way food items "reduce hunger". Because the chemical has no spontaneous decay, this is the *only* way food can lower active protein hunger apart from reaction 66's backup pull |
| 5 | Debug / care-script consumption | — | CAOS console or tending scripts | `CHEM 149 -255` (full drain) or `CHEM 149 -n` | Common operator action to relieve a starving Norn. To fully reset protein hunger the backup must also be drained with `CHEM 132 -255`; otherwise reaction 43 will repopulate 149 within minutes |

## Role in Game Mechanics

### The drive/backup architecture, revisited from the active side

Every drive in Creatures 3 is a pair: a short-responsive **drive chemical** (148–161) that the brain reads directly, and a long-lived **backup chemical** (131–146) that the drive continuously exchanges with. For protein hunger specifically:

```
             (sensorimotor LOC_CONST emitter, rate 30 × gain 2 per tick — constant)
                                  │
                                  ▼
      [132] Hunger for protein backup  ◀──── reaction 66 (0.2 s half-life) ──── [149] Hunger for protein
                │                                                                   ▲
                └──── reaction 43 (10 s half-life) ────────────────────────────────┘
                                                                                    │
                                                                                    ├──▶ Drives tissue locus 1 (gain 209) — decision-lobe drive bar
                                                                                    ├──▶ Circulatory locus 6 (thresh 214, digital) — critical alarm
                                                                                    ├──▶ Circulatory locus 8 emitter (thresh 128, digital) — positive feedback
                                                                                    │
                                                                                    └──◀ Pain [148]   (reaction 56 → drips into backup 132, not 149 directly)
```

Chemical 149 sits at the centre of this graph as the **behaviourally-visible** node: it is the only one read by a decision-lobe receptor, and therefore the only one whose value translates into Norn action. Chemical 132 is its memory; Pain is its occasional cross-coupling contributor; and the sensorimotor emitter is its pump.

### What the Norn "feels"

The **Drives receptor #2** (tissue 5, locus 1, gain 209) is the direct wiring from chemical 149's value into the brain. The C3/DS brain's decision lobe treats drive receptor inputs as candidate action urges: each of the 16 drive neurons votes for the action-selection algorithm, and the winning one dictates the creature's current goal. A high Hunger for protein value therefore translates directly into a strong vote for "seek and eat protein food". Because the gain is 209/255 ≈ 82 %, the drive's influence saturates before the chemical itself saturates — small changes near full hunger produce large changes in the drive neuron's excitation, making truly starving Norns highly fixated on food.

This is also the exact value the Creature Companion's drives tab displays as the "Hunger for Protein" bar. **The backup at chemical 132 is not displayed anywhere in the stock UI**; a breeder watching the drives panel sees only the fast-moving active drive, not the reservoir behind it, which is why experienced Creatures 3 players quickly learn that "the bar dropped to zero" does not mean "the Norn is not hungry any more".

### The critical-hunger alarm

The **Circulatory receptor #161** (tissue 1, locus 6, threshold 214, digital, gain 255) provides the game's sharp-edged "starvation" signal. Unlike the Drives receptor, which reads an analogue value scaled by gain, this receptor is all-or-nothing: it fires at full strength only when the active drive exceeds ≈ 214 / 255 ≈ **83 %**. Below that, it is silent.

Once tripped, circulatory locus 6 is a whole-body signalling channel that downstream reactions and receptors can gate on. In the stock genome, no single obvious physiological response is wired to locus 6 directly — it acts more as a generic "dire-hunger" bus that mods and future revisions can hook into. Its presence, however, explains why Creatures 3 Norns sometimes exhibit a sudden, step-change shift in behaviour (increased food-seeking, reluctance to sleep) as their protein hunger crosses the 83 % line: one locus that was silent suddenly goes full-on.

Because the receptor is digital, there is hysteresis-free switching at exactly threshold 214. A Norn oscillating around that hunger level will see the alarm flicker on and off with every tick that the active drive crosses the line — a symptom that can appear in heavily-stimulated Norns (e.g. a Norn with `CHEM 149 +200` injected and no food available) as a period of jittery hunger-driven decision-making before the system re-equilibrates.

### The positive-feedback circulatory emitter

Emitter #11 (gene 35) is a digital, mid-threshold emitter that adds a *further* 24 units per tick (rate 12 × gain 2) to chemical 149 whenever the signal at circulatory locus 8 exceeds 128. Circulatory locus 8 is the stock genome's "low blood protein" signal — it rises when the concentration of circulating Protein (chemical 12), Amino Acid (13), or a related metabolite is low.

This creates a **negative-metabolic-feedback loop with a positive-drive sign**:

- Low blood protein → locus 8 signal rises → emitter 11 fires → Hunger for protein [149] increases → decision lobe votes for food-seeking → Norn eats → blood protein rises → locus 8 falls → emitter 11 stops → active drive returns to baseline.

Because the emitter is digital (fixed gain when active), hunger grows in a sharp-stepped way while protein is low, rather than scaling smoothly. This is what gives protein hunger its characteristically aggressive acceleration when a Norn has not eaten in a while: the constant LOC_CONST trickle is supplemented by a much larger burst once the metabolic feedback kicks in, and the creature becomes visibly "desperate" for protein rather than merely peckish.

### Why the active drive at 13 % at birth

Every Norn hatches with chemical 149 at amount **33/255 ≈ 13 %** (initial concentration gene 16 / entry id 8). This is the same baseline value used for most of the sixteen drives: it is not zero, but it is well below the critical-alarm threshold of 214. The effect is that a newborn Norn is **already mildly hungry from the first tick**, which gives the initial feeding behaviour a natural starting point — the brain has a non-zero food-seeking vote from birth, but no alarm is firing yet. Within the first few minutes of life, the constant sensorimotor emitter and the reservoir-drive dynamic together raise the effective drive into normal operating range.

Because the reservoir (chemical 132) has **no** initial concentration (see *132 - Hunger for protein backup*), newly-hatched Norns have an asymmetric state: 13 % active drive, 0 % backup. This means baby Norns are genuinely easier to satiate than older Norns — a single meal drains a large fraction of their active drive, and there is no reservoir yet to refill it. Older Norns, whose reservoirs have built up over tens of minutes or hours, require repeated feedings before the active drive stays low for any meaningful period.

### Interaction with Pain (the indirect cross-coupling)

Hunger for protein does **not** have a direct inflow from Pain. The stock genome's reaction 56 (`Pain [148] → Hunger for protein backup [132]`) targets the *reservoir*, not the active drive. The observable consequence in gameplay is delayed: a pain event raises 132, not 149, and the elevated 132 then drip-feeds 149 over the next ten seconds through reaction 43. So a slapped Norn does not immediately feel hungry — the hunger builds over the following tens of seconds as pain is banked and then slowly released.

This is architecturally important because it means the **decision lobe does not panic-switch to food-seeking at the instant a Norn is hurt**. Instead, pain produces a slow-building hunger tail, so a recently-injured Norn continues to react to the pain (retreat, express discomfort) *first*, and only moves toward food-seeking once the pain has been substantially absorbed into the protein-hunger reservoir.

See *131 - Pain backup* and *132 - Hunger for protein backup* for the counterpart discussion of whether reaction 56 is a deliberate design choice or a one-slot wiring error.

### The active drive as a "fast", "Very long" chemical

It is worth pausing on the fact that chemical 149's half-life is classified "Very long" (≈ 9·10¹⁰ ticks, decay rate 1.0) — effectively permanent. On its own, the chemical does not decay. Yet its *effective* half-life in the creature's body is much shorter, because reaction 66 (6-tick half-life) aggressively siphons it into the backup. The combination produces a chemical whose:

- **Natural behaviour** is to persist forever.
- **Realised behaviour** in the stock genome is to bounce around on a ≈ 0.2 s timescale.

This gives modders a useful knob: by reducing reaction 66's rate (making the active → backup siphon slower), the active drive becomes much more volatile and spiky, and the Norn's behaviour becomes more responsive to acute events (a single piece of cheese produces a bigger short-term drop in the drive bar). Conversely, increasing reaction 66's rate flattens the drive's response and makes hunger appear more steady.

### Steady-state balance (active drive side)

Assuming the positive-feedback emitter is silent (blood protein healthy), the sensorimotor emitter writes ≈ 60 units/tick into chemical 149. Reaction 66 drains chemical 149 at rate `(1 − 0.88978) × [149] ≈ 0.1102 × [149]` per tick. At equilibrium:

```
   inflow = outflow
   60 = 0.1102 × [149]
   [149] ≈ 544 units  (but clamped to 255)
```

So in practice the active drive saturates at **full scale (255)** unless something is consuming it — which is why a creature that has never eaten, never had a pain event, and has no `CHEM` consumption will eventually pin its hunger bar at maximum. The system is only kept away from 255 by the fact that **the Drives-tissue receptor and downstream action-selection cause the creature to find and eat food**, which triggers food-agent scripts that call `CHEM 149 -n`. The brain, via the drive loop, acts as the feedback controller that keeps the chemical in range. This is a deliberate design choice in the stock genome: the chemistry alone will drive a creature to full hunger; only *behaviour* can reduce it.

Once food is eaten and the active drive is pulled down, reaction 43's slow 10-second half-life determines how long the post-meal "satiety window" lasts before the reservoir replenishes the drive and the cycle resumes. The reservoir therefore sets the **tempo** of protein-hunger cycles, while the emitter sets the **amplitude** of the baseline drive.

### Effects of `CHEM 149 <n>`

Direct injection into the active drive produces a sharp, *transient* change in the drive bar:

1. **Tick 0:** `CHEM 149 +n` called. Active drive rises by *n*; backup unchanged.
2. **Ticks 1–6:** Reaction 66 aggressively pulls mass out of 149 into 132. Within one half-life (0.2 s / 6 ticks), about half of the injected mass has migrated to the reservoir.
3. **Ticks 6–30:** The active drive stabilises at a new equilibrium that is only slightly elevated compared to before — most of the injected mass is now banked in 132. The drive bar "bounces down" almost immediately.
4. **Ticks 30+:** The elevated reservoir now drip-feeds the active drive for minutes to come, producing a slow, long-tailed rise in drive above baseline. The creature becomes persistently slightly hungrier.

This is why experienced CAOS scripters often prefer `CHEM 132 <n>` (reservoir injection) over `CHEM 149 <n>` for simulating long-term hunger states: the former produces the lingering effect directly, while the latter is quickly absorbed.

Conversely, `CHEM 149 -n` (negative injection) is the **canonical food-consumption operation**. Because it zeroes out the active drive immediately, the Creature Companion's bar drops visibly. The backup then refills the drive over ~10 s (reaction 43 half-life), producing the familiar "feels fed for a moment, then gradually gets hungry again" post-meal profile.

### Comparison to other Hunger drives

The sixteen 148–161 drives all share the same basic architecture, but Hunger for protein has some distinguishing features:

| Drive (id) | Backup (id) | Constant emitter? | Critical-hunger alarm? | Positive metabolic feedback? | Cross-coupling inflows? |
|------------|-------------|-------------------|------------------------|------------------------------|-------------------------|
| Pain (148) | 131 | No | — (pain is its own signal) | No | Various pain sources |
| **Hunger for protein (149)** | **132** | **Yes** (rate 30 × gain 2) | **Yes** (locus 6, thresh 214) | **Yes** (locus 8 emitter) | Pain → backup 132 (indirect) |
| Hunger for carbohydrate (150) | 133 | Yes | Yes (locus 5, thresh 214) | Yes | None |
| Hunger for fat (151) | 134 | Yes | Yes | Yes | None |
| Hunger for starch (152) | 135 | Yes | Yes | Yes | None |
| Thirst (153) | 136 | Yes | Yes | Yes | None |
| Tiredness (154) | 137 | Yes | No hard alarm | No positive feedback | None |

The three macronutrient hungers (protein, carbohydrate, fat) all follow the same pattern: a constant LOC_CONST emitter, a digital critical-hunger alarm at circulatory locus 5/6/7, a positive-feedback emitter tied to blood-nutrient signals, and a reservoir at 132/133/134. Hunger for protein is distinguished primarily by its pain-cross-coupling (via the backup), which none of the other macronutrient hungers have.

### Implications for modders

Common modifications built on top of chemical 149:

1. **Replace the Drives-tissue receptor with a nonlinear one.** The stock gain of 209 is linear; a receptor with a lower threshold and higher gain would make the Norn aggressively food-motivated even at mild hunger. Useful for "gluttonous Norn" breeds.
2. **Disable emitter #11** (the positive-feedback loop). Removing it makes protein hunger depend only on the constant LOC_CONST trickle, so hungry Norns do not "accelerate" their food-seeking when their metabolic state is poor. Produces calmer, more predictable creatures.
3. **Raise the critical-hunger threshold** on receptor #161 from 214 to something higher (e.g. 240). This effectively disables the all-or-nothing alarm and forces the creature to rely solely on the analogue drive bar — a milder, more "continuous" experience of hunger.
4. **Add a catalyst to reaction 66** (e.g. `Hunger for protein + Insulin → Hunger for protein backup + Insulin`). This would only siphon active drive into the reservoir when blood insulin is high, producing a creature whose hunger-memory formation depends on metabolic state — hungry after exercise, not after rest.
5. **Change the initial concentration** of chemical 149 in gene 16. Raising it makes newborn Norns immediately crave protein; lowering it to zero gives the creature a "honeymoon" window at the start of life before hunger emerges.

### Practical consequences for gameplay

- **The drive bar shows 149, not 132.** A creature whose protein-hunger bar reads zero can still have a large reservoir of banked hunger in chemical 132. Expect the bar to rise again within seconds of hitting zero.
- **Food items consume the active drive directly.** Every food agent's eating/drinking script injects `CHEM 149 -n` at the end of its animation. Different foods use different *n* values — cheese is stronger than, say, a single piece of fruit — but all target chemical 149 and leave the reservoir untouched.
- **Critical-hunger behaviour is a step change, not a ramp.** Once active protein hunger exceeds 214/255, the circulatory locus 6 alarm trips, producing a sudden shift in physiological state. Norns do not become critically hungry *gradually* — they cross a line.
- **The metabolic positive-feedback loop can spiral.** A Norn with both low blood protein and no food nearby will experience a runaway climb in hunger: the LOC_CONST trickle plus the locus-8 emitter together raise the drive much faster than the Norn's reservoir can absorb, and the drive bar fills rapidly until food is found or the creature weakens.
- **Pain-to-hunger coupling is delayed.** A pain event raises the reservoir (132), which then slowly releases into the active drive (149) over the following minutes. Injured Norns do not immediately appear hungry; the hunger builds on a minute-scale delay.
- **Science Kit monitoring.** The Science Kit's chemical view shows chemical 149 by name, and is the go-to tool for diagnosing whether a Norn is stuck at high active drive because of a reservoir leak, a blood-protein signal failure, or a broken food-consumption script.

### Summary

```
 Stock-genome wiring of Hunger for protein [149]
 ───────────────────────────────────────────────
 Inputs:
    Sensorimotor LOC_CONST emitter (gene 36): rate 30, gain 2 — constant, ~60 units/tick
    Circulatory locus 8 emitter    (gene 35): rate 12, gain 2 — digital, fires when blood-protein signal high
    Backup → drive reaction 43     (gene 8):  half-life 311 ticks (~10 s), "Medium"
    CHEM 149 <n>                   (CAOS / scripts)

 Active drive:
    Hunger for protein [149]
    half-life ≈ 9·10¹⁰ ticks (Very long — effectively permanent)
    initial concentration 33/255 ≈ 13 %
                    │
                    ├──▶ Drives tissue locus 1 receptor (gain 209) ▶ decision-lobe drive bar (Creature Companion)
                    ├──▶ Circulatory locus 6 receptor (threshold 214, digital) ▶ critical-hunger alarm
                    │
                    ├──▶ reaction 66 (gene 62) → Hunger for protein backup [132]
                    │    half-life 6 ticks (~0.2 s), "Very short"
                    │
                    └──▶ CHEM 149 -n from food-agent scripts (consumption)
```

Hunger for protein is the **archetypal Creatures 3 drive chemical**: a brain-read signal fed by a constant metabolic emitter, amplified by a blood-signal positive-feedback loop, buffered through a long-lived reservoir, gated by a digital critical-state alarm, and consumed only by the creature's own behaviour via food-eating scripts. Its pair with the reservoir at chemical 132 is the most fully-wired drive pair in the stock genome, and it is the canonical reference implementation for how Creatures 3 couples biochemistry to decision-making.
