# 154 - Tiredness

Tiredness is the **active drive chemical** for cumulative fatigue. It is one of the sixteen "drive" chemicals in the 148–161 block — the signals that the brain, body and tissue receptors actually read to produce drive-coloured behaviour — and it is paired with **Tiredness backup [137]** in the canonical Creatures 3 drive/reservoir architecture. Tiredness represents the *felt, currently-relevant* component of exhaustion: the instantaneous signal that drives the "tiredness" bar on the Drives tissue, dispatches the stumble-gait animation, modulates immune response, and (past the Youth life stage) fires an age-gated circulatory locus used for fatigue penalties on older Norns. At very high levels it crosses the involuntary-faint threshold and causes the creature to collapse outright.

Unlike many drives (e.g. Pain, Hunger) which are filled by direct emitters from sensorimotor events, Tiredness is **never emitted** — no neuroemitter, organ receptor, circulatory locus, STIM write, script event or engine helper writes directly to chemical 154 as a response to "effort". The chemical is produced endogenously from a single upstream source: a catalytic reaction that converts the **Sleepiness backup [138]** reservoir into active Tiredness while leaving the backup intact (gene 103, reaction id 49). Sleepiness backup is itself filled whenever the creature's Sleepiness has been pumped up by the sleep cycle. The result is that a Norn's felt Tiredness tracks *how long ago the last sleep replenished the Sleepiness reservoir* rather than how much physical work it has done — an idiosyncratic but deliberate tuning choice.

Once produced, active Tiredness is immediately swept into Tiredness backup [137] by **two identical** `Tiredness → Tiredness backup` reactions (genes 33 and 67), running at a 6-tick half-life each. The effective ~3-tick combined half-life means any unit of active Tiredness survives only a fraction of a second before being banked. The reservoir then drips back out through reaction 48 at a 311-tick half-life (~10 s), so the **steady-state active drive is only ~1% of the banked pool**. This makes Tiredness a *low-amplitude, low-pass-filtered* signal: most of the chemical lives invisibly in the backup, and the brain sees a smoothed trickle rather than a spiky instantaneous reading. The design philosophy is the mirror of Pain (which is predominantly held in the active slot and only lightly reserved) — Tiredness is predominantly banked, and what the creature *feels* is a small equilibrium fraction of the accumulated history.

Tiredness itself has **no decay** (half-life ≈ 9·10¹⁰ ticks, labelled "Very long"), which seems paradoxical for an "active" signal but is the correct choice here: all dynamics are driven by the refill/release reactions against chemical 137, not by intrinsic decay. Removing the reactions would leave active Tiredness frozen at whatever value it had; with them, it rapidly equilibrates to ~1% of the backup and tracks that reservoir faithfully.

Because Tiredness is produced only from Sleepiness backup, is near-instantly banked into Tiredness backup, and is then slowly released from that reservoir, it is the **output stage of the full sleep cycle** — the readable face of a four-chemical subsystem (Sleepase 129 → Sleepiness backup 138 → Sleepiness 155 → Tiredness 154 → Tiredness backup 137) whose job is to turn intermittent sleep events into a persistent memory of cumulative fatigue that the creature's body can react to.

## Sources

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Catalytic production from Sleepiness backup | Gene 103 (reaction id 49) | Organ #2 "Reaction" | `1× Sleepiness backup [138] → 1× Tiredness [154] + 1× Sleepiness backup [138]` at half-life ≈ 510 ticks ("Medium") | The backup acts as a catalyst — it is not consumed — so the production rate is proportional to the current Sleepiness-backup pool. This is the **only endogenous producer of Tiredness in the stock genome** |
| 2 | Backup → active drip-feed | Gene 13 (reaction id 48) | Organ #2 "Reaction" | `1× Tiredness backup [137] → 1× Tiredness [154]` at half-life ≈ 311 ticks ("Medium") | Converts the banked reservoir into felt drive at ~0.22%/tick. Together with the aggressive refill reactions below, drives active Tiredness to a steady state near 1% of the backup pool |
| 3 | Direct CAOS injection | — | Any | `CHEM 154 <n>` on a targeted creature | One-shot. Because reactions 61 and 71 sweep active Tiredness into the backup at ~22%/tick combined, an injection produces a brief visible spike (~0.2 s) before the value equilibrates down as the chemical floods chemical 137 |
| 4 | CAV shutdown helper | `MakeYourselfTired()` | engine shutdown path | Called ~5 minutes before the game saves, writes `CHEM_TIREDNESS (154) = 0.8` and `CHEM_SLEEPINESS (155) = 0.6` directly. Called during world shutdown | One-shot per saved creature. The 0.8 unit is banked into chemical 137 within milliseconds of the next simulation tick, producing a persistent post-import fatigue |
| 5 | No emitter | — | — | The stock genome's 43-entry emitter table contains **no emitter targeting chemical 154**. No brain neuron, sensorimotor locus, organ tissue, or physiological state directly writes Tiredness as a response to effort, activity, or time spent awake. All Tiredness comes from the Sleepiness-backup route above | — |
| 6 | No initial concentration | — | — | Chemical 154 does not appear in the genome's initial-concentration table (gene 64). A newly-hatched Norn is born with exactly 0 Tiredness | — |
| 7 | No passive decay production | — | — | The chemical's "Very long" half-life (≈9·10¹⁰ ticks, decay rate 1.0) means it is neither created nor destroyed by the half-life table. All dynamics come from reactions | — |
| 8 | Modded genomes | User-added | User-added | Breeders commonly add activity-sensitive emitters (e.g. `LOC_GAIT0` activity integrators, muscle-activity neuroemitters, or lobe-output "effort" signals) to make Tiredness rise in response to *physical work* rather than time since sleep. Typical "physical exertion" mods add a neuroemitter onto either 154 or 137 | Gene-dependent |

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Active → backup sweep (primary) | Gene 33 (reaction id 61) | Organ #2 "Reaction" | `1× Tiredness [154] → 1× Tiredness backup [137]` at half-life ≈ 6 ticks ("Very short") | ~11% of the active pool is banked each tick. Single largest sink of active Tiredness |
| 2 | Active → backup sweep (duplicate) | Gene 67 (reaction id 71) | Organ #2 "Reaction" | `1× Tiredness [154] → 1× Tiredness backup [137]` at half-life ≈ 6 ticks ("Very short") — **identical to reaction 61** | The only drive/backup pair with a *doubled* refill reaction. Effective combined half-life is ~3 ticks, pushing the effective active-drive fraction to ~1% of the backup |
| 3 | Drives-tissue receptor (brain-readable drive bar) | Gene 6 (receptor id 7) | Creature / Drives | Locus 6 "Tiredness", threshold 0, gain 223 | The drive bar the decision lobe reads to choose "sleep" or "rest" behaviours. Without this receptor, the Norn has no drive-level reason to sleep |
| 4 | Involuntary faint reflex | Gene 96 (receptor id 73) | Creature / Sensorimotor | Locus 5 `LOC_INVOLUNTARY5` (Faint), threshold 208, gain 255, **DIGITAL** | At ≈82% active Tiredness, the faint locus fires and the creature's involuntary faint script runs (collapse, eyes closed, drop actions). Usually only reachable via a very large `CHEM 154` / `CHEM 137` injection |
| 5 | Stumble-gait animation | Gene 105 (receptor id 185) | Creature / Sensorimotor | Locus 10 `LOC_GAIT2`, threshold 141, gain 207 | At ≈55% active Tiredness the skeleton switches to the tired stumble-walk animation. Easily reached in normal play once the backup has accumulated |
| 6 | Immune-response modulation | Gene 198 (receptor id 87) | Brain / Immune tissue | Brain neuron 1, threshold 128, gain 85 | A brain-side neuron in the immune tissue lights up at ≈50% Tiredness, used elsewhere in the genome to weaken immune response when exhausted — the "tired creatures get sick more easily" wiring |
| 7 | Age-gated circulatory fatigue | Gene 45 (receptor id 163) | Creature / Circulatory | Locus 10, threshold 204, gain 255, **DIGITAL**, **switches on at age 3 "Youth"** | From Youth onward, very high active Tiredness (≈80%) fires a circulatory locus that is read elsewhere for age-dependent fatigue penalties. Switched off in babies so Tiredness has milder effects on young Norns |
| 8 | No emitter feedback | — | — | Tiredness does not emit to any other chemical in the stock genome. The 154 → 137 flow via reactions 61/71 is the only sink | — |

## Role in Game Mechanics

### Position in the sleep cycle

Tiredness is the **fourth stage** of a four-chemical cycle that turns sleep events into long-term cumulative-fatigue memory:

```
            (decision / LOC_ASLEEP)
                      │
                      ▼  brain neuron 40 emitter
              Sleepase [129]
                      │
                      │ catalyses gene 102: Sleepiness backup → Sleepiness
                      ▼
          Sleepiness backup [138] ◄── gene 101: Sleepiness → Sleepiness backup
                      │
                      │ gene 103 (catalytic):
                      │  Sleepiness backup → Tiredness + Sleepiness backup
                      ▼
              Tiredness [154]  ◄── Drives / Sensorimotor / Immune / Circulatory receptors
                      │
                      ├── reactions 61 + 71 (gene 33 + gene 67): doubled sweep
                      ▼
          Tiredness backup [137]
                      │
                      │ gene 13: Tiredness backup → Tiredness (drip-feed)
                      ▼
              (back to Tiredness [154])
```

The key feature is that the sleep cycle writes *Sleepiness*, not Tiredness: sleep fills the Sleepiness pool (via Sleepase), and from there Sleepiness backup continuously spawns Tiredness via the catalytic gene-103 reaction. This architectural choice means:

1. **Tiredness is not a direct consequence of activity.** The stock genome has no link between muscle use, script actions, or time spent awake and chemical 154. A Norn can sit motionless and still accumulate Tiredness as long as its Sleepiness backup is high.
2. **Sleepiness and Tiredness are not synonymous.** Sleepiness is a pulsed, decision-driving signal that gets drained by the Sleepase pulse when the creature falls asleep. Tiredness is a slowly-building, long-term signal that represents the *consequences* of the sleep/wake cycle — it only rises when Sleepiness backup is substantial, and it only falls when external intervention drains chemicals 154 or 137.
3. **The creature's "felt" fatigue lags real-time activity by minutes.** Because reaction 49's rate is proportional to Sleepiness backup (itself slowly refilled by gene 101 from active Sleepiness), the Tiredness signal is a minute-to-hour-scale integrator rather than a second-to-second reading.

### Why active Tiredness is always small

With reactions 61 and 71 both running at a 6-tick half-life, the combined sweep rate for `Tiredness → Tiredness backup` is ~22% per tick (one of the fastest biochemistry half-lives in the stock genome). Meanwhile, the release reaction 48 runs at a 311-tick half-life (~0.22% per tick). In steady state, inflow from 48 equals outflow into 61+71:

```
  (backup) × 0.0022   ≈   (active) × 0.22
  ⇒  active  ≈  (backup) × 0.01
```

So the active-drive reading is approximately **1% of the banked reservoir**. A Norn with a full 1.0 Tiredness backup shows roughly 0.01 on its Tiredness drive bar — a very small fraction. This is why `CHEM 154 <n>` injections appear to "not stick": the injected amount is banked within ~0.2 s and only ~1% survives as visible drive.

The design intent is clear: make Tiredness a **smoothed low-pass filter** on the upstream Sleepiness-backup pool. Spikes are absorbed into the reservoir, and what the brain sees is a slowly-varying integrated signal. The four receptors on chemical 154 read this filtered value, which gives the creature behaviour that looks "gradually tired" rather than "suddenly exhausted".

### The four-receptor cascade

Tiredness has the richest receptor suite of any drive in the stock genome — four physiological systems read it simultaneously, each with its own threshold. As the active drive climbs from 0 toward 1.0, they fire in sequence:

| Threshold | Receptor | Effect |
|-----------|----------|--------|
| 0 (continuous) | Drives tissue gene 6 | The tiredness drive bar — always visible to the brain |
| ~50% | Brain immune neuron (gene 198) | Immune lobe modulation, "tired creatures get sick" |
| ~55% | Sensorimotor `LOC_GAIT2` (gene 105) | Skeleton switches to stumble-walk animation |
| ~80% (Youth+) | Circulatory locus 10 (gene 45) | Age-gated fatigue penalty — only on age 3 and above |
| ~82% | Sensorimotor `LOC_INVOLUNTARY5` (Faint) (gene 96) | Involuntary faint — creature collapses |

Because the active drive sits near 1% of the backup in steady state, reaching even the first non-zero threshold (50%) requires the backup to hold ~5000% — which is impossible in a single chemical slot (capped at 1.0). In practice the thresholds above 0 are **only reached by direct `CHEM 154 <n>` injections or by the CAV `MakeYourselfTired` helper**, which writes active Tiredness directly and thus bypasses the 1%-equilibrium constraint. During normal play, the only receptor that consistently fires is the Drives-tissue one (threshold 0), which simply reads whatever fraction of 1.0 the active drive currently holds.

This explains a surprising property of the stock genome: **the `LOC_GAIT2` stumble and `LOC_INVOLUNTARY5` faint effects almost never fire from endogenous Tiredness**. They exist primarily so that scripts, agents, and `CHEM` debug writes can push a creature into those states for narrative or gameplay purposes (e.g. the Shut-Down sequence, cloning effects, or breeder-provided fatigue-tonic agents), while the normal "tired drive" the brain reads stays in the low, smooth range.

### The `MakeYourselfTired` shutdown path

One of the few places the engine writes directly to chemical 154 is the world-save shutdown sequence. The helper:

```text
MakeYourselfTired():
    SetChemical(CHEM_TIREDNESS,  0.8)
    SetChemical(CHEM_SLEEPINESS, 0.6)
```

is called when the world is shutting down in "CAV" mode (creature-aware shutdown). The comment explains: "These tiredness and sleepiness values were recommended by Helen. Call this 5 minutes before shutdown." The intent is to make Norns visibly tired and sleepy as the world closes, so that when the world reloads they start in a natural post-sleep state.

The immediate effect is that for a few seconds, active Tiredness reads 0.8 — **above every receptor threshold** — firing the stumble gait, immune penalty, Youth circulatory locus and the involuntary faint. Within ~1 second, reactions 61/71 sweep the 0.8 unit into the backup, where it persists indefinitely. Creatures imported from a CAV-saved world therefore have:

- ~0 active Tiredness on reload (having been banked)
- ~0.8 Tiredness backup persisting in reservoir
- Slow drip-out of the backup giving a low but non-zero felt Tiredness going forward

This is the primary reason imported Norns can look "worn" relative to freshly-hatched ones even though no obvious difference exists in their genome — the reservoir is pre-filled with banked Tiredness from the shutdown write.

### Interaction with the sleep system

Sleep does *not* directly drain Tiredness in the stock genome. The Sleepase pulse (triggered when the decision lobe or `LOC_ASLEEP` fires) drains **Sleepiness backup [138]**, which shuts off reaction 49 and *stops new Tiredness from being produced*. But:

- Already-banked Tiredness in chemical 137 remains.
- Active Tiredness (small) equilibrates back to 1% of whatever is in the backup.
- There is no mechanism in the stock genome for sleep to *remove* Tiredness that has already been produced.

The net effect is that **sleep only prevents further Tiredness accumulation**; it does not refresh the creature. Over multiple sleep cycles, Tiredness backup slowly accumulates, raising the low-level felt drive and (eventually) tripping the Youth-gated circulatory locus. This is a design quirk often addressed by modders and by the Norn-care agent toolchain, which typically writes `CHEM 137 -<n>` and `CHEM 154 -<n>` explicitly when the creature sleeps to simulate the "sleep refreshes you" behaviour players expect.

### Interaction with other drives

Tiredness is relatively **isolated** from other drives in the stock genome:

- **No cross-reactions** with Hunger, Pain, or other drives (unlike Pain backup, which has the chemical-132 mis-target creating a "pain makes you hungry" cross-coupling).
- **No emitter competition**. Since no emitter writes Tiredness, nothing else in the genome trades Tiredness production against other drives.
- **Shared catalytic reactant**. Reaction 49 uses Sleepiness backup both as reactant *and* product (catalyst), so producing Tiredness does not deplete Sleepiness backup — the two drives can rise together.

This cleanliness means mods adding physical-activity emitters onto chemical 154 or 137 do not destabilise other drive subsystems, making Tiredness the simplest drive to extend.

### Life-stage effects

Only the Circulatory receptor (gene 45, id 163) has an age-switch — it switches on at age 3 "Youth". Babies therefore lack the high-Tiredness age-gated fatigue penalty, making them robust to the transient spikes that can occur during events like the CAV shutdown write. From Youth onward, a creature that has accumulated a substantial Tiredness backup can push its active drive past 0.80 briefly (e.g. on a fresh `CHEM 154` injection before banking), triggering the age-gated locus and producing a persistent fatigue penalty that lasts until scripts clear the reservoir.

This makes the transition from Baby to Youth biochemically meaningful: a Norn that was heavily played as a baby (accumulating backup) will find its newly-active circulatory fatigue locus firing more often in the Youth stage than a fresh-hatched Youth would.

### Behavioural consequences

- **Decision-making**: Because the drive-tissue receptor has threshold 0 and gain 223, the brain sees *proportional* Tiredness at all times — even a 0.01 reading maps to a non-trivial drive pressure that can tip decision-making toward "sleep" when no other drive is dominant. This lets small changes in the backup produce meaningful behaviour changes without requiring receptor thresholds to be crossed.
- **Animation**: In ordinary play, Tiredness rarely drives the stumble-gait or faint animations directly (those thresholds are too high for a 1%-equilibrium signal to reach). Those animations fire mostly when scripts, agents, or the CAV shutdown helper write active Tiredness above threshold.
- **Learning**: Active Tiredness is not read by any brain lobe in the stock genome apart from the immune lobe's single neuron. Tiredness therefore does not influence learned concept associations or the decision lobe's dendritic weights directly; it only provides a drive-level pressure on action selection.

### Implications for modders

- **Add an activity emitter**: The most common Tiredness mod is a neuroemitter that writes chemical 154 when a muscle-activity locus or `LOC_GAIT0` output integrator is active. Because the backup absorbs the writes rapidly, modders typically target chemical 137 directly (or double the emitter rate) to get visible results.
- **Cut the duplicate refill**: Removing gene 67 leaves only gene 33 refilling the backup, halving the sweep rate and noticeably increasing the active-drive fraction to ~2% of the backup. This makes the gait and faint thresholds reachable endogenously and produces "spikier" Tiredness behaviour.
- **Add a sleep sink**: The simplest "sleep refreshes" mod adds a catalysed reaction `Tiredness backup + Sleepase → (none) + Sleepase`, letting the Sleepase pulse drain Tiredness backup at the same time it drains Sleepiness backup. Player expectations around the sleep cycle are met.
- **Add a brain-lobe receptor on 154**: For "aware of tiredness" Norns, receptors on 154 feeding a decision or memory lobe give the brain explicit awareness of fatigue beyond the drive-bar reading. Useful for Norns bred to make rest decisions strategically.
- **Bypass the backup**: Direct `CHEM 154 <n>` scripts can inject above-threshold Tiredness momentarily for narrative effects (forced faint, stumble during a cutscene) without touching the long-term reservoir — the injection is banked within 0.2 s and the chemical returns to its natural low-amplitude state.

### Practical consequences for gameplay

- **`CHEM 154 <n>` is a short-duration spike.** For temporary fatigue effects (stumble animation, brief faint), write 154 directly. The visible effect lasts ~0.2 s before the chemical is banked; after that, only the 1%-equilibrium fraction shows on the drive bar.
- **`CHEM 137 <n>` is the "persistent fatigue" call.** For long-term cumulative fatigue that survives across sleep cycles, write 137 directly. The reservoir drips out over minutes and the active drive stays at a low, steady fraction indefinitely.
- **Debug-console readers see very different values depending on which chemical they read.** A Norn with 1.0 banked in 137 and 0.01 active in 154 looks almost untired on the Tiredness drive bar but is persistently exhausted in the Science Kit's chemical list.
- **Norn-care agents and medic scripts typically write both 154 and 137 to zero** when they treat exhaustion, because draining only the active drive is useless (the backup refills it within seconds).
- **Imported creatures from CAV worlds carry 0.8 banked Tiredness** from the `MakeYourselfTired` shutdown write. Fresh-hatched Norns do not. This can cause apparent "breed quality" differences that are purely artefacts of the import path.

### Summary

```
 Stock-genome wiring of Tiredness [154]
 ───────────────────────────────────────
 Inputs:   Sleepiness backup [138] ──catalytic reaction 49 (gene 103)──► Tiredness
                                     (half-life 510 ticks, Medium)

           Tiredness backup [137] ──reaction 48 (gene 13)──► Tiredness
                                     (half-life 311 ticks, Medium — drip-feed)

           External:  CHEM 154 <n>  (CAOS / scripts)
                      MakeYourselfTired() → writes 0.8 (CAV shutdown)

           Tiredness [154]                 half-life ≈ 9·10¹⁰ ticks (no decay)
                                           Initial concentration: 0
                      │
                      │ reactions 61 + 71 (genes 33 + 67):
                      │   doubled sweep Tiredness → Tiredness backup
                      │   (half-life 6 ticks each, ~3-tick combined)
                      ▼
              Tiredness backup [137]       → (reservoir; see 137 doc)

           Steady-state active drive  ≈  1% of banked backup

 Receptors (all read chemical 154 directly):
   • Drives locus 6 (gene 6):      thresh 0, gain 223     → brain "tiredness bar"
   • Sensorimotor locus 10 (gene 105): thresh 141, gain 207 → LOC_GAIT2 (stumble)
   • Brain immune neuron 1 (gene 198): thresh 128, gain 85  → immune modulation
   • Circulatory locus 10 (gene 45):   thresh 204, DIG, age 3+ → age-gated fatigue
   • Sensorimotor locus 5 (gene 96):   thresh 208, DIG     → LOC_INVOLUNTARY5 (faint)
```

Tiredness is the **readable face of a four-chemical cumulative-fatigue subsystem**. Its steady-state value sits at ~1% of Tiredness backup's reservoir thanks to the doubled refill reactions, its only endogenous source is a catalytic pull from the sleep cycle's Sleepiness-backup pool, and its rich receptor suite gives the creature's body, brain and animation pipeline four simultaneous ways to react to fatigue — though in normal play, only the drive-tissue receptor actually fires, because the other thresholds are set high enough that only direct `CHEM` writes or the CAV shutdown helper can reach them. The chemical exemplifies Creatures 3's "drive plus backup" design pattern at its most fully-wired: a fast, aggressively-banked active signal backed by a near-infinite reservoir, with the balance between the two producing the slow, integrated fatigue behaviour the stock genome is tuned to express.
