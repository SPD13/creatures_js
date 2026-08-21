# 155 - Sleepiness

Sleepiness is the **active drive chemical** for the creature's need to sleep. It sits in slot 8 of the sixteen "drive" chemicals in the 148–161 block — the active signals that the brain, body and tissue receptors read to decide behaviour — and it is paired with **Sleepiness backup [138]** in the canonical Creatures 3 drive/reservoir architecture. Unlike Tiredness (chemical 154), which is an integrator that tracks accumulated fatigue over tens of minutes, Sleepiness is the **decisional** sleep signal: the short, pulsed, high-amplitude drive that tells the creature's decision lobe "sleep *now*", drives the `LOC_GAIT3` drowsy-walk animation, and — from the Youth life stage onward — fires an age-gated circulatory locus used for sleep-deficit penalties in older Norns.

Sleepiness is fed from three distinct sources in the stock genome. First, a **continuous `LOC_CONST` drip** (emitter #5, gene 39) writes a small fixed-gain signal into chemical 155 every tick, which provides the slow build-up of baseline sleepiness over time. Second, **Sleep toxin (chemical 71)** drives reaction 82 (`4× Sleep toxin → 3× Sleep toxin + 2× Sleepiness`) at a 24-tick half-life — this is how sedatives, sleeping draughts and similar agents act chemically on the Norn. Third, and most importantly for the normal sleep cycle, **Sleepase (chemical 129)** catalyses reaction 50 (`Sleepiness backup + Sleepase → Sleepiness + Sleepase`) at an explosive 2-tick half-life whenever the creature has elected to sleep (decision-lobe neuron 40) or is already sleeping (`LOC_ASLEEP` locus). This is the *release pulse* that momentarily dumps banked sleep debt back onto the active drive so the brain commits to the sleep session.

Once produced, active Sleepiness is swept back into Sleepiness backup [138] by reaction 51 (gene 101) at an 11-tick half-life (~6%/tick). This rate is an order of magnitude slower than the doubled `Tiredness → Tiredness backup` sweep (~3-tick combined), so a meaningful fraction of the active drive survives long enough to be read by receptors — in contrast to Tiredness, where the active-drive reading is locked at ~1% of the backup, Sleepiness's active fraction can climb to a sizeable value during a Sleepase pulse and is responsible for the visibly-rising sleepiness bar that accompanies a sleep decision. Sleepiness itself has **no intrinsic decay** (half-life ≈ 9·10¹⁰ ticks, labelled "Very long"); all dynamics come from the emitter/reaction network around it.

Sleepiness is the **pulsed face of the sleep cycle**. Where Tiredness is the slow-rolling integrator that propagates accumulated sleep debt into fatigue-related body states, Sleepiness is the short, sharp, gate-keyed signal that actually initiates and sustains sleep. The pair work together: the creature banks sleep pressure into chemical 138, slowly leaks Tiredness from it via gene 103, and periodically releases the reservoir as a high-amplitude Sleepiness pulse that wins the decision-lobe's attention.

## Sources

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | `LOC_CONST` baseline drip | Gene 39 (emitter id 5) | Creature / Sensorimotor | Locus 0 `LOC_CONST` (always-on), threshold 0, rate 35, gain 4, **DIGITAL (fixed gain)** | The only neuroemitter writing Sleepiness in the stock genome. `LOC_CONST` reads 255 at all times, so this emitter fires every 35 ticks (~1 s at 30 Hz) and adds a small fixed increment to 155. Provides the steady background climb of sleep pressure while the creature is awake |
| 2 | Sleepase-catalysed release from backup | Gene 102 (reaction id 50) | Organ #2 "Reaction" | `1× Sleepiness backup [138] + 1× Sleepase [129] → 1× Sleepiness [155] + 1× Sleepase [129]` at half-life ≈ **2 ticks** ("Very short") | **The primary source of active Sleepiness during sleep events.** With Sleepase present, ~29% of the backup pool is converted to active Sleepiness per tick. This is what raises the sleepiness bar sharply when the decision lobe commits to sleep, and keeps it high for the duration of the `asleepState` |
| 3 | Sleep-toxin conversion | Gene 83 (reaction id 82) | Organ #2 "Reaction" | `4× Sleep toxin [71] → 3× Sleep toxin [71] + 2× Sleepiness [155]` at half-life ≈ 24 ticks ("Short") | Sleep toxin (chemical 71) — the active ingredient in sleeping draughts, sedative pies, honey-based sweeteners, and several plant agents — is converted directly to active Sleepiness. Produces the "falling asleep after eating a sedative food" behaviour: the toxin lingers for minutes while steadily generating active Sleepiness |
| 4 | Direct CAOS injection | — | Any | `CHEM 155 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot. Because reaction 51 sweeps active Sleepiness into the backup at ~6%/tick (much slower than the ~22%/tick Tiredness sweep), a `CHEM 155` injection produces a visible, slowly-decaying spike that typically lasts a few seconds before most of it is banked into chemical 138 |
| 5 | CAV shutdown helper | `MakeYourselfTired()` | engine shutdown path | Called ~5 minutes before the game saves, writes `CHEM_TIREDNESS (154) = 0.8` and `CHEM_SLEEPINESS (155) = 0.6` directly. Called during world shutdown | One-shot per saved creature. Most of the 0.6 active Sleepiness is swept into chemical 138 within ~11 ticks, leaving the imported creature with a pre-filled sleep reservoir that will release strongly the next time Sleepase is emitted |
| 6 | No initial concentration | — | — | Chemical 155 does not appear in the genome's initial-concentration table (gene 64). A newly-hatched Norn is born with exactly 0 active Sleepiness | — |
| 7 | No passive decay production | — | — | The chemical's "Very long" half-life (≈9·10¹⁰ ticks, decay rate 1.0) means no chemical 155 is created or destroyed by the half-life table. All dynamics come from emitter 5, reactions 50, 51, 82, and external writes | — |
| 8 | Modded genomes | User-added | User-added | Common mods include replacing the `LOC_CONST` drip with an activity-scaled emitter (so physical effort raises Sleepiness rather than just time), tying Sleepiness emission to a circadian-rhythm lobe for day/night sleep preference, or adding new sleep-inducing toxins that mimic reaction 82 | Gene-dependent |

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Active → backup sweep | Gene 101 (reaction id 51) | Organ #2 "Reaction" | `1× Sleepiness [155] → 1× Sleepiness backup [138]` at half-life ≈ 11 ticks ("Short") | ~6% of the active pool is banked each tick. This rate is slow enough (relative to Sleepase-driven production) that the active drive rises during a sleep pulse and falls smoothly afterward, rather than being instantly flattened the way Tiredness is |
| 2 | Drives-tissue receptor (sleepiness bar) | Gene 7 (receptor id 8) | Creature / Drives | Locus 7 "Sleepiness", threshold 0, gain 211 | **The sleepiness drive bar the decision lobe reads to choose sleep behaviours.** Threshold 0 means proportional response at every level; without this receptor the Norn has no drive-level reason to sleep |
| 3 | Drowsy-gait animation | Gene 104 (receptor id 186) | Creature / Sensorimotor | Locus 11 `LOC_GAIT3`, threshold 128, gain 207 | At ≈50% active Sleepiness the skeleton switches to the drowsy-walk animation. Easily reached during a mid-to-late Sleepase pulse, producing the visible "wobbly just-before-bed" gait players associate with a sleepy Norn |
| 4 | Age-gated circulatory locus | Gene 46 (receptor id 159) | Creature / Circulatory | Locus 9, threshold 214, gain 255, **DIGITAL**, **switches on at age 3 "Youth"** | From Youth onward, very high active Sleepiness (≈84%) fires a circulatory locus read elsewhere in the genome for age-dependent sleep-deficit penalties. Switched off in babies so the circulatory consequence of heavy sleep pulses is milder in the earliest life stage |
| 5 | No emitter feedback | — | — | Sleepiness does not emit to any other chemical in the stock genome. The 155 → 138 sweep via reaction 51 is the only sink apart from receptor reads | — |
| 6 | No brain-lobe receptor | — | — | Unlike Tiredness (which has a brain immune-tissue neuron reading it), no brain lobe neuron in the stock genome reads chemical 155. All awareness flows through the Drives tissue, Sensorimotor, and Circulatory receptors listed above | — |

## Role in Game Mechanics

### Position in the sleep cycle

Sleepiness is the **central active drive** of a five-chemical cycle that governs sleep behaviour:

```
            LOC_CONST (always active)
                    │
                    │  emitter #5 (gene 39): rate 35, gain 4, DIGITAL
                    ▼
            Sleepiness [155] ◄── reaction 50 (gene 102):
                    │             Sleepiness backup + Sleepase → Sleepiness + Sleepase
                    │             (half-life 2, Very short, CATALYSED pulse)
                    │
                    │  reaction 51 (gene 101): Sleepiness → Sleepiness backup
                    │  (half-life 11, Short)
                    ▼
            Sleepiness backup [138] ── reaction 49 (gene 103, catalytic):
                                       Sleepiness backup → Tiredness + Sleepiness backup
                                       (half-life 510) ─► Tiredness [154] ─► Tiredness backup [137]

            Sleepase [129]                 pulsed "permission to sleep" enzyme
              emitters:
                Brain neuron 40 (decision-lobe sleep cell) — rate 3, gain 68, DIGITAL
                LOC_ASLEEP (gene 43)                        — rate 3, gain 77, DIGITAL

            Sleep toxin [71] ──► reaction 82 ──► Sleepiness [155]
                                 (4T → 3T + 2 Sleepiness, half-life 24)
```

Sleepiness thus sits at the intersection of four systems:

1. **Baseline drive** fed by `LOC_CONST` — the slow background rise of sleep pressure while awake.
2. **Pulsed release** from the reservoir at chemical 138 via Sleepase catalysis — the high-amplitude signal that commits the creature to sleep.
3. **Exogenous sedation** via Sleep toxin — the food/agent pathway that can put a creature to sleep without a decision.
4. **Sweep into the reservoir** via reaction 51 — the mechanism that converts transient active signal into persistent sleep debt.

### Why Sleepiness has a visibly-rising bar (unlike Tiredness)

The defining biochemical difference between Sleepiness and Tiredness is the **asymmetry between the active→backup sweep rate and the backup→active release rate**:

| Drive | Active → Backup sweep | Backup → Active release |
|-------|-----------------------|--------------------------|
| Tiredness (154) | **~22%/tick** (half-life 6, doubled) | ~0.22%/tick (half-life 311, spontaneous) |
| Sleepiness (155) | ~6%/tick (half-life 11, single reaction) | ~29%/tick (half-life 2, **catalysed by Sleepase**) |

In steady state with no Sleepase, Sleepiness reaches approximately `backup × (release_rate / sweep_rate) = 0 / 6% = 0` — i.e. flat. But during a Sleepase pulse, the release rate jumps to ~29%/tick while the sweep stays at 6%/tick, so the active drive climbs rapidly to a large fraction of the backup before settling. This is the *opposite* of Tiredness's behaviour, where the sweep rate always dominates the release rate and the active drive is permanently pinned at ~1% of the backup.

The consequence is that the Sleepiness bar **responds strongly to sleep events** rather than being a smoothed low-pass filter. When a Norn decides to sleep, the bar rises visibly, peaks during the `asleepState`, and falls gradually as the reservoir depletes and Sleepase emission ceases. Players see a direct correlation between "the Norn is sleeping" and "the sleepiness bar is high", which is exactly the intent — Sleepiness is designed to be the *felt* sleep drive, while Tiredness is designed to be a chronic background signal.

### The Sleepase pulse mechanic

Sleepase (chemical 129) is the stock genome's "permission to sleep" enzyme. It has two DIGITAL emitters:

1. **Brain neuron 40 — the decision-lobe sleep cell** (emitter #9, gene 42): fires when the decision lobe commits to the "sleep" action on the basis of a high Sleepiness drive reading. Produces an initial Sleepase pulse that starts reaction 50 running.
2. **`LOC_ASLEEP`** (emitter #10, gene 43): fires at 255 whenever the `LifeFaculty` state machine is in `asleepState` or `dreamingState`. Continuously tops up Sleepase for the duration of sleep, keeping reaction 50 running.

Once Sleepase is present, reaction 50 consumes **no** Sleepase (it is catalytic — Sleepase is both a reactant and a product) but converts Sleepiness backup to active Sleepiness at a 2-tick half-life. The dynamics are:

1. **Decision**: brain neuron 40 fires, Sleepase appears, reaction 50 begins pumping 138 → 155 at ~29%/tick.
2. **Drive rises**: the Drives receptor (gene 7) reports a rapidly-climbing Sleepiness bar; the decision lobe's "sleep" cell is reinforced; the creature enters `asleepState`.
3. **Sustained sleep**: `LOC_ASLEEP` emitter keeps Sleepase topped up despite its own 4-tick half-life. Reaction 50 runs continuously; the backup depletes; the active drive stays high.
4. **`LOC_GAIT3` fires**: at ≈50% active Sleepiness, the drowsy-gait receptor trips — the creature's skeleton switches to the wobbly walk animation. (Has limited visible effect during the `asleepState` because the creature is lying down, but fires on the transitions in and out.)
5. **Reservoir drains**: as chemical 138 falls, the release rate (still 29% of backup per tick) proportionally drops. Less new active Sleepiness arrives; the active drive starts to fall.
6. **Decision to wake**: the Sleepiness drive drops below the decision-lobe's "continue sleeping" threshold; the lobe elects to wake up; the creature exits `asleepState`; both emitters cease; Sleepase decays to zero within ~0.5 s.
7. **Aftermath**: reaction 50 halts (no catalyst). Any residual active Sleepiness is swept into 138 by reaction 51 at the normal 11-tick rate. The Sleepiness bar returns to baseline within a few seconds. Reaction 49 continues leaking a (now much smaller) Tiredness signal from whatever reservoir is left.

This is the **canonical sleep cycle** and Sleepiness is its visible face. All of it is driven by the interaction between Sleepase (129), Sleepiness backup (138), and Sleepiness (155); Tiredness (154) is a slow-track side-product that accumulates across many cycles.

### The Circulatory age-gate (Youth+)

The Circulatory locus 9 receptor (gene 46, receptor id 159) is DIGITAL with threshold 214 and gain 255, and **only switches on at age 3 "Youth"**. At ≈84% active Sleepiness it writes 255 to Circulatory locus 9, a signal read elsewhere in the genome for age-dependent sleep-deficit physiological consequences (e.g. modifiers on immunity, metabolism, or blood chemistry in older creatures).

Because the active drive can only reach 84% during a strong Sleepase pulse on a well-filled reservoir, this receptor typically fires during sleep events on Norns past the Youth transition. In practice it means:

- **Babies don't feel circulatory sleep effects.** The receptor is off, so sleep pulses have only drive-bar and animation consequences.
- **Youth and older Norns experience real circulatory cost of sleeping.** The high-amplitude pulse crosses the 214 threshold, firing locus 9 briefly during each strong sleep event.
- **A Norn that transitions from Baby to Youth with a full Sleepiness backup will immediately experience these effects on the next sleep.** The biochemical reason older-stage Norns often seem to "feel their age" at each sleep is this receptor going live at age 3.

### Interaction with Sleep toxin

Reaction 82 (`4 Sleep toxin → 3 Sleep toxin + 2 Sleepiness`) is the pharmacological entry point for sleep-inducing agents. Several stock and third-party food/drug agents (honey-based sweets, sedative pies, specific plant flowers, medical soporifics) load Sleep toxin into the bloodstream; it is then progressively consumed over its own half-life of a few hundred ticks, producing a sustained drip of active Sleepiness. This differs from a `CHEM 155 <n>` injection in three important ways:

1. **Extended duration**: the toxin runs for seconds to minutes, so Sleepiness is produced over many ticks rather than in a single spike.
2. **Reaches the reservoir**: most of the produced active Sleepiness is swept into chemical 138 by reaction 51 within ~11 ticks, so Sleep toxin *also* fills the sleep-debt reservoir for future pulses.
3. **Triggers sleep decisions**: the prolonged elevated drive has time to cross the decision-lobe's sleep threshold, so Sleep toxin *chemically induces* sleep rather than merely sedating the active drive. This is why eating a sleeping-draught agent reliably causes the Norn to lie down and sleep, whereas a direct `CHEM 155 0.5` injection does not.

This makes Sleep toxin the main gameplay-level mechanism for "putting a Norn to sleep" without using decision-lobe reinforcement — agents act on 71, 71 drives 155, 155 feeds the decision lobe, the lobe commits to sleep, and the Sleepase pulse takes over from there.

### Why the steady-state drive is non-zero but small

Outside of sleep events, Sleepase is absent, so reaction 50 does not fire. The only active-drive input in that regime is emitter #5 (`LOC_CONST`), which writes a small DIGITAL-fixed-gain increment every 35 ticks. Reaction 51 simultaneously sweeps that increment into the backup at an 11-tick half-life. The equilibrium balance is:

```
  emitter_rate (per tick)   ≈   active × 0.06
  ⇒  active ≈ emitter_rate / 0.06
```

Because emitter #5 has gain 4 (very small) and fires once every 35 ticks, the steady-state active Sleepiness during waking hours is a few per cent of 1.0 — visible on the Drives bar but well below the `LOC_GAIT3` threshold of 50%. This gives the correct "slight but non-zero sleepiness rises gradually as the day wears on" behaviour, with most of the accumulated sleep pressure actually living in chemical 138 waiting for the next Sleepase release.

### Interaction with Tiredness

Although Sleepiness and Tiredness are mechanically distinct drives, they are biochemically coupled through Sleepiness backup:

- **Sleep events don't directly remove Tiredness.** A Sleepase pulse drains chemical 138 into chemical 155; the active Sleepiness is then swept back into 138 by reaction 51, then drained again by reaction 50 while Sleepase is still present. Net: chemicals cycle between 138 and 155 with a gradual net loss through receptor reads and reaction 49's Tiredness leak. The *reservoir* shrinks, but slowly.
- **Reduced reservoir → reduced Tiredness production.** Reaction 49's rate is proportional to Sleepiness backup, so after a successful sleep the rate at which Tiredness is produced drops. The felt Tiredness drive (already near its 1% equilibrium of whatever 137 banks) takes minutes of game time to notice because chemical 137's reservoir drains at a 311-tick half-life.
- **Sleeping restores alertness gradually, not instantly.** This is a stock-genome quirk often addressed by mods: the natural behaviour is "sleep shrinks the Sleepiness reservoir, which over many minutes of real time lowers Tiredness production, which over many more minutes lowers the felt fatigue drive". Players who expect "sleep = instantly fresh" find this unintuitive; the vanilla intent is explicitly biological — sleep is a long process with a long tail.

### Implications for modders

- **Add an activity emitter**: The most common Sleepiness mod replaces or augments the `LOC_CONST` drip with an activity-scaled emitter (muscle-use locus, `LOC_GAIT0` integrator, or a lobe-output "exertion" signal). Because the sweep rate is only 6%/tick, emitter writes survive a few ticks before banking — long enough to produce visible bar responses to exertion.
- **Tie Sleepiness to a circadian lobe**: Add a brain lobe with a day/night-cycling output that emits to 155 or 138. Produces Norns that naturally prefer sleeping at specific game-time hours instead of purely on accumulated debt.
- **Make Sleepase uncatalytic**: Change reaction 50 from catalytic to consuming (drop Sleepase from the product list). Sleepase is then consumed during the pulse, so a single decision-lobe fire drains only a small fraction of 138 before the enzyme is exhausted, producing shorter, lighter sleep cycles.
- **Add a "refresh on wake" reaction**: A `Sleepiness backup + Sleepase → (nothing) + Sleepase` reaction lets the Sleepase pulse *erode* the reservoir rather than merely convert it to active form. This is the classic "sleep clears sleep debt" mod, bringing behaviour into line with player expectations and indirectly reducing Tiredness production.
- **Add a brain-lobe receptor**: A lobe with a receptor on chemical 155 feeding a memory or decision neuron gives the Norn explicit cognitive awareness of sleepiness beyond the decision-lobe drive. Useful for "strategic rester" breeds that plan sleep around safety, food, or social context.
- **Replace Sleep toxin reaction 82**: New reactions that generate Sleepiness from novel toxins (honey derivatives, plant alkaloids, etc.) allow mods to introduce new sleep-inducing substances without needing to touch the agent system.

### Practical consequences for gameplay

- **`CHEM 155 <n>` produces a visible, short-lived spike.** Unlike `CHEM 154 <n>` (banked almost instantly), a Sleepiness injection peaks immediately and takes ~11 ticks per half to decay. A one-shot write of 0.3 or higher will trip `LOC_GAIT3` (the drowsy gait) for a second or two; 0.85+ will trip the Youth+ Circulatory locus 9. Neither will persist — within a second or two, most of the chemical has been banked into 138.
- **`CHEM 155 -n` removes the current active drive only.** The reservoir at 138 is untouched, so the next Sleepase pulse (a subsequent sleep decision) will re-fill the active drive from it. To *actually* reduce a Norn's sleep drive to zero you must write to both 155 and 138.
- **`CHEM 129 <n>` forces immediate release regardless of decision.** Writing Sleepase directly bypasses the decision lobe — reaction 50 activates and whatever is in 138 is dumped into 155. This is the scripting shortcut used by "put to sleep" agents that target non-cooperating creatures.
- **The Drives UI shows only 155.** Chemical 138 is invisible to the sleepiness bar; a Norn with low 155 but high 138 *appears fine* on the display but is massively sleep-deprived, which will become obvious on the next sleep decision. Science Kit users can see the reservoir explicitly.
- **Sleep toxin is the gentle, durable induction path.** Gameplay-level sleep-inducing agents (honey, sedative pies, sleep draughts) load chemical 71 rather than 155 directly, giving a long, gentle rise that naturally triggers a decision-lobe sleep commitment — the desired gameplay flow.
- **Imported CAV creatures wake up sleepy.** The `MakeYourselfTired` helper writes 155=0.6 before a save; this migrates into the backup by reload time but re-releases on the next Sleepase pulse, producing the familiar "freshly-imported Norn falls asleep quickly" behaviour.

### Summary

```
 Stock-genome wiring of Sleepiness [155]
 ────────────────────────────────────────
 Inputs:
   LOC_CONST emitter #5 (gene 39)            — baseline drip, rate 35, gain 4, DIGITAL
   reaction 50 (gene 102, CATALYSED)          — Sleepiness backup + Sleepase → Sleepiness + Sleepase
                                               (half-life 2, Very short — the sleep pulse)
   reaction 82 (gene 83)                      — 4 Sleep toxin → 3 Sleep toxin + 2 Sleepiness
                                               (half-life 24, Short — sedative pathway)
   CHEM 155 <n>                               — direct CAOS write
   MakeYourselfTired() shutdown helper         — writes 155 = 0.6 on CAV shutdown

         Sleepiness [155]                     half-life ≈ 9·10¹⁰ ticks (no intrinsic decay)
                                              Initial concentration: 0
                 │
                 │ reaction 51 (gene 101):
                 │   Sleepiness → Sleepiness backup
                 │   (half-life 11, Short — bank to reservoir)
                 ▼
         Sleepiness backup [138]              → (see 138 doc; catalyses Tiredness via gene 103)

 Receptors (all read chemical 155 directly):
   • Drives locus 7 (gene 7):        thresh 0, gain 211      → sleepiness drive bar
   • Sensorimotor LOC_GAIT3 (gene 104): thresh 128, gain 207 → drowsy gait animation
   • Circulatory locus 9 (gene 46):  thresh 214, DIG, age 3+ → age-gated sleep-deficit penalty

 Steady-state active drive (awake, no Sleepase): a few per cent (baseline LOC_CONST drip)
 Sleep-pulse active drive (Sleepase present):    large fraction of 138 (up to 84%+ during deep sleep)
```

Sleepiness is the **decisional, pulsed half** of the Creatures 3 sleep drive system. Where Tiredness (154) is a slow integrator that reports cumulative fatigue through a rich four-receptor suite, Sleepiness is the short, sharp, Sleepase-gated signal that actually commits the creature to sleeping and drives the visible drowsy-gait and sleepiness-bar responses. Its chemistry is unusual among the drives: a slow active→backup sweep combined with an explosive catalysed backup→active release means the active drive *can* rise high — unlike every other drive in the stock genome — which is what makes the sleep-decision cycle mechanically work. Together with Sleepiness backup [138], Sleepase [129], Tiredness [154] and Tiredness backup [137], it forms the five-chemical subsystem that turns a Norn's raw time-on-task into the behaviours, animations, and physiological states players recognise as "tired" and "sleepy".
