# 138 - Sleepiness backup

Sleepiness backup is the **reservoir half** of the drive pair for Sleepiness (chemical 155). It occupies slot two of the sixteen-chemical "drive backup" block (chemicals 131–146), which the stock genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Like every backup in that block it carries a near-permanent pool of the drive's "history" — its chemical half-life is ≈9·10¹⁰ ticks (decay rate 1.0), so whatever has been banked stays there across the entire lifetime unless explicitly consumed by a reaction or externally drained.

Where Sleepiness backup differs sharply from every other entry in the 131–146 block is that it sits at the **heart of the stock sleep cycle**. The chemical is not just a reservoir for its own drive: it is also the **catalytic upstream source of Tiredness** (chemical 154). Three reactions in the shipped Norn genome wire Sleepiness backup into the active sleep system. Gene 101 (reaction 51) sweeps any active Sleepiness back into the backup at an 11-tick half-life; gene 102 (reaction 50) is the enzymatic release of banked Sleepiness back to the active drive — catalysed by Sleepase (chemical 129) at an explosive 2-tick half-life; and gene 103 (reaction 49) is a **catalytic** loop where Sleepiness backup produces Tiredness without consuming itself, at a 510-tick half-life. That last reaction is the single source of Tiredness in the base creature: nothing else in the genome emits or produces chemical 154.

Sleepiness backup has **no emitter, no receptor, and no initial concentration**. The creature cannot sense its backup directly — all awareness of the sleep state flows through the active drive at 155 (read by the Drives "Sleepiness" receptor, the age-gated Circulatory locus 9, and the `LOC_GAIT3` sleepy-gait locus) and through the active Tiredness drive at 154. Sleepiness backup sits invisibly beneath both, acting as **the long-term sleep-debt memory that drives the entire fatigue ecosystem**.

## Sources

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Active drive → backup (sweep) | Gene 101 (reaction id 51) | Organ #2 "Reaction" | `1× Sleepiness [155] → 1× Sleepiness backup [138]` at rate byte 24, half-life ≈ 11 ticks ("Short") | Whenever any active Sleepiness exists it is swept into the backup at ~6% per tick. Because the active drive is fed by an 11-tick process while being drained by a 2-tick catalytic release, almost all of the sleep debt spends most of its life banked in 138 rather than in 155 |
| 2 | Direct CAOS injection | — | Any | `CHEM 138 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively persistent because the chemical's half-life is ≈ 9·10¹⁰ ticks (see Usage #3) |
| 3 | Sleep-toxin → Sleepiness → backup path | Gene 83 (reaction id 82) → Gene 101 (reaction id 51) | Organ #2 "Reaction" | `4× Sleep toxin [71] → 3× Sleep toxin [71] + 2× Sleepiness [155]` (half-life 24 ticks, "Short") produces active Sleepiness that is then banked by reaction 51 within a few ticks | Indirect; scales with the creature's Sleep-toxin concentration |
| 4 | Shutdown "make tired" engine helper | `Creature::MakeYourselfTired()` | CAV shutdown path | Called ~5 minutes before the game saves, this helper writes `CHEM_TIREDNESS (154) = 0.8` and `CHEM_SLEEPINESS (155) = 0.6` directly. The 0.6 active Sleepiness is then swept into chemical 138 by reaction 51, so imported creatures from a shut-down CAV are born with a pre-filled Sleepiness-backup reservoir | One-shot, ≈0.6 banked per saved creature |
| 5 | No initial concentration | — | — | Chemical 138 does not appear in the genome's initial-concentration table (gene 64). A newly-hatched Norn is born with exactly 0 Sleepiness backup |  — |
| 6 | No emitter | — | — | The emitter table contains no entry for chemical 138. No brain neuron, sensorimotor locus, organ tissue, or physiological state directly writes to the backup — it is entirely filled by reaction 51 from active Sleepiness (itself emitted on `LOC_CONST` via gene 39) or by reaction 82 from Sleep toxin |  — |
| 7 | Modded genomes | User-added | User-added | Breeders frequently wire muscle-activity, hunger-cross-coupling, or "exertion" neuroemitters onto chemical 138 to simulate how physical effort builds sleep debt. Because the chemical is otherwise only fed by the LOC_CONST Sleepiness drip, mods that add an activity-scaled source are a common way to make Sleepiness respond to behaviour rather than just elapsed time | Gene-dependent |

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Sleepase-catalysed release to active drive | Gene 102 (reaction id 50) | Organ #2 "Reaction" | `1× Sleepiness backup [138] + 1× Sleepase [129] → 1× Sleepiness [155] + 1× Sleepase [129]` at rate byte 7, half-life ≈ **2 ticks** ("Very short") | When any Sleepase is present, banked Sleepiness is released explosively — ~29% of the backup pool is converted to active Sleepiness per tick. This is the *pulse* mechanism that raises the Drives sleepiness bar when the decision lobe elects to sleep, or when the creature is already asleep |
| 2 | Catalytic production of Tiredness | Gene 103 (reaction id 49) | Organ #2 "Reaction" | `1× Sleepiness backup [138] → 1× Tiredness [154] + 1× Sleepiness backup [138]` at rate byte 63, half-life ≈ **510 ticks** ("Medium") | The backup is not consumed — it acts as a **catalyst** that continuously produces Tiredness at a rate proportional to its own level. This is the stock genome's **only source of Tiredness**: nothing else in the emitter or reaction tables writes chemical 154. As long as Sleepiness-backup > 0, Tiredness is being generated |
| 3 | Passive decay (effectively none) | Gene 64 entry #138 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | All sixteen drive backups share this near-infinite half-life by design: the chemical is a reservoir, not a signal. The only way banked sleep debt leaves the creature is via reaction 50 (Sleepase-catalysed conversion to active Sleepiness, which is itself consumed by nothing in the stock genome and swept straight back in by reaction 51) or via external writes |
| 4 | No receptor | — | — | Sleepiness backup is **not read by any stock receptor**. No drive, brain lobe, sensorimotor locus, circulatory locus, or organ receptor reads chemical 138's concentration. All awareness flows through the active drives at 154 and 155 |
| 5 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 138 | — |
| 6 | Modded consumers | User-added | User-added | Modders can add a Sleepiness-backup receptor on a "rest memory" lobe (so the brain learns from accumulated sleep debt rather than the spiky pulsed drive), replace the reaction-49 catalysis with a consuming reaction (so Tiredness eats the sleep reservoir), or add a scheduled `CHEM 138 -n` write to agents that represent "a very restful nap" | Gene-dependent |

## Role in Game Mechanics

### The sleep cycle in one picture

Sleepiness backup is the hub chemical of the stock Norn sleep cycle. Four reactions and five chemicals cooperate to produce the behaviour; every path through the system passes through 138:

```
        LOC_CONST (always active)
                │
                │  emitter #5 (gene 39): rate 35, gain 4 → DIGITAL
                ▼
       Sleepiness [155]  ──► Drives locus 7  (gain 211)    — sleepiness bar
            │       │    ──► LOC_GAIT3       (thresh 128)  — sleepy gait
            │       │    ──► Circulatory L9  (thresh 214, age ≥ Youth, DIGITAL)
            │       │
            │       │  reaction 51 (gene 101): Sleepiness → Sleepiness backup
            │       ▼       (half-life 11, "Short")
            │  Sleepiness backup [138]   ─── near-permanent reservoir
            │       │
            │       │  reaction 50 (gene 102):
            │       │   Sleepiness backup + Sleepase → Sleepiness + Sleepase
            │       │   (half-life 2, "Very short", CATALYSED)
            │       │
            │       │  reaction 49 (gene 103):
            │       │   Sleepiness backup → Tiredness + Sleepiness backup
            │       │   (half-life 510, "Medium", CATALYTIC SOURCE)
            │       ▼
            │  Tiredness [154]   ─► Drives locus 6, LOC_GAIT2, LOC_INVOLUNTARY5,
            │       │              Immune neuron 1, Circulatory L10 (age ≥ Youth)
            │       │
            │       │  reactions 61 + 71 (genes 33 + 67, both half-life 6):
            │       ▼   Tiredness → Tiredness backup (DOUBLED sweep)
            │  Tiredness backup [137]  ─► reaction 48 (gene 13): drip back to 154
            │                             (half-life 311, "Medium")
            │
            │  Sleepase [129]       half-life 4 ticks ("Very short") — pulse chemical
            │  emitted on:
            │      Brain neuron 40 (decision-lobe sleep cell), rate 3, gain 68, DIGITAL
            │      LOC_ASLEEP sensorimotor locus (255 while asleep), rate 3, gain 77, DIGITAL
            ▼
       (Sleep toxin [71] → reaction 82 → Sleepiness pulse → backup via 51)
```

The three roles Sleepiness backup plays simultaneously are:

1. **Sleep-debt reservoir.** Active Sleepiness is continuously produced on `LOC_CONST` by emitter 5 (gene 39) and by Sleep toxin via reaction 82. Reaction 51 then sweeps that active Sleepiness into the backup at an 11-tick half-life, so the instantaneous drive reading at 155 mostly reflects new arrivals, not the cumulative pool. The *real* sleep debt lives in 138.
2. **Sleepase-gated release pump.** Whenever the creature's decision lobe fires neuron 40 (the sleep decision cell), or whenever the creature enters the `asleepState` and triggers `LOC_ASLEEP`, the two Sleepase emitters produce a short pulse of Sleepase (half-life 4 ticks). Reaction 50 then consumes almost nothing (Sleepase is a catalyst) but moves ~29% of the backup back into active Sleepiness *per tick* for as long as the Sleepase lasts. This is what drives the Sleepiness bar upward so the creature commits to sleeping; when the pulse fades, the bar drops as reaction 51 re-banks whatever is not consumed.
3. **Tiredness generator.** Reaction 49 is the stock genome's only source of Tiredness — it spawns chemical 154 continuously at a rate proportional to the backup pool. Because the Tiredness drive has no upstream emitter or other reaction producing it, *every unit of Tiredness a Norn ever feels originated in chemical 138*. This makes Sleepiness backup the single most load-bearing reservoir in the fatigue system.

### Why Sleepiness backup is the "master" sleep chemical

Of all sixteen drive backups, only Sleepiness backup has this double duty. It is both the reservoir for its own drive (like every other backup in the block) **and** a catalytic source for a second drive (Tiredness). No other chemical in the 131–146 range participates in a second drive's pathway. This is why the chemistry is so tightly wired around 138:

| Feature | Sleepiness backup (138) | Tiredness backup (137) | Pain backup (131) |
|---|---|---|---|
| Refill (drive → backup) | Yes, gene 101, 11 ticks | Yes, genes 33 + 67 (doubled), 6 ticks each | No (gene 20 mis-targets 132) |
| Release (backup → drive) | Yes, **Sleepase-catalysed**, 2 ticks | Yes, spontaneous, 311 ticks | Yes, spontaneous, 311 ticks |
| Release gating | Pulse-catalyst (decision + asleep) | Ungated slow drip | Ungated slow drip |
| Catalytic source for another drive | **Yes — feeds Tiredness (154) via gene 103** | No | No |
| Initial concentration | 0 at birth | 0 at birth | 0 at birth |
| Role in play | **Sleep-debt reservoir + Tiredness generator** | Fatigue-history integrator | Dormant slot, mods/scripts only |

The combination of (a) explosive catalytic release and (b) a slow catalytic leak to another drive is unique in the stock genome. Sleepiness backup is, in effect, the creature's biochemical "how long has it been since you slept" counter: every second the backup sits at a high level, the creature is drip-producing Tiredness, and every time the decision lobe chooses to sleep, the backup is converted back to a strong Sleepiness-drive signal that keeps the creature in bed until the reservoir has been meaningfully drained.

### The Sleepase pulse: why sleeping actually works

The catalytic geometry of reaction 50 is what makes sleep mechanically effective. Consider what happens when a Norn decides to sleep:

1. **Decision lobe fires.** Brain neuron 40 in the sleep decision cell activates. Emitter #9 (gene 42) immediately starts pushing Sleepase into the bloodstream at rate byte 3, gain 68, DIGITAL.
2. **State transitions to `asleepState`.** The `LifeFaculty` state machine advances the creature into `asleepState` and the `LOC_ASLEEP` sensorimotor locus reads 255. This activates emitter #10 (gene 43) — a second Sleepase source — which **keeps Sleepase topped up for the whole duration of sleep** despite Sleepase's own 4-tick chemical half-life.
3. **Reaction 50 pumps backup → active.** With Sleepase present, the backup pool is drained explosively into active Sleepiness at a 2-tick half-life. Within ~10 ticks (~0.33 s at 30 Hz) a substantial fraction of 138 has moved to 155. The Drives sleepiness bar reads high, and the brain is reinforced in its decision to keep sleeping.
4. **Active Sleepiness does nothing useful yet.** Because reaction 51 sweeps 155 back into 138 at an 11-tick half-life, the active drive drops as soon as it rises — *unless* the Sleepase pulse keeps feeding new active Sleepiness into 155. The net flow is therefore `backup ⇌ active`, with Sleepase strongly biasing it toward active while the creature is asleep.
5. **`LOC_ASLEEP` keeps Sleepase emitted.** Because the `LOC_ASLEEP` emitter is DIGITAL-fixed-gain with rate byte 3, Sleepase is replenished every few ticks. The creature stays asleep as long as 138 is still pumping 155 at a rate the brain reads as "I should still be sleeping".
6. **Reservoir depletes.** Reaction 50 is ultimately a conversion — each tick, some fraction of 138 becomes 155, and although reaction 51 re-banks it, not all of it gets banked before further Sleepase arrivals redirect it. Over ~10–30 seconds of real time, chemical 138 depletes substantially. With the reservoir low, the rate at which reaction 50 can drive 155 upward drops, the sleepiness-bar reading falls, and the decision lobe eventually chooses "wake up" — stopping emitter #9, exiting `asleepState`, stopping emitter #10, and letting Sleepase decay to zero.
7. **Aftermath.** With Sleepase gone, reaction 50 effectively halts (it requires Sleepase as a catalyst). Any residual active Sleepiness is swept back into the backup by reaction 51. Reaction 49 continues leaking Tiredness from whatever backup remains, but because the reservoir is now much smaller, the Tiredness-production rate drops — which is the biochemical "I am well-rested" signal that propagates downstream.

This is a **fundamentally different** mechanism to the Tiredness backup → Tiredness pathway (which is ungated and uncatalysed and produces a slow, steady drip). Sleep-related chemistry is **pulsed**: the creature spends most of its life banking Sleepiness into 138, then periodically opens a "release valve" by emitting Sleepase to dump that backup back into the active drive so the decision lobe commits to a sleep session.

### The critical Sleepase half-life asymmetry

Sleepase has a 4-tick chemical half-life and catalyses reaction 50 at a 2-tick half-life. This means:

- Without a continuous emitter, a pulse of Sleepase decays to ~half in 4 ticks and to ~6% in 16 ticks (~0.5 s).
- While present, Sleepase drains 138 at ~29%/tick.
- The decision-lobe emitter (brain neuron 40) is *momentary* (it fires when the lobe reaches a threshold), so *by itself* it would only drive a brief Sleepase pulse insufficient to deplete the backup.
- The `LOC_ASLEEP` emitter (gene 43) is the critical piece: while the creature is in `asleepState`, it continuously tops up Sleepase, so reaction 50 runs at full rate for the entire duration of sleep.

This is why a creature briefly deciding "I'm going to sleep" and then being interrupted by stimulus does not empty its Sleepiness backup — there simply isn't enough Sleepase in the system to pump 138 down significantly. Only a *sustained* `asleepState` (handled by the `LifeFaculty` state machine and not interrupted by pain, sudden loud sounds, or `WAKE` CAOS calls) produces a full release cycle.

### Receptors on active Sleepiness (155) — what the backup ultimately drives

Sleepiness backup has no receptors, but every behavioural consequence of banked sleep debt goes through the three receptors on 155:

| Receptor | Organ / Tissue | Locus | Threshold / Gain / Flags | Effect when fired |
|----------|----------------|-------|--------------------------|-------------------|
| Drives receptor #8 (gene 7) | Creature / Drives | Locus 7 "Sleepiness" | thresh 0, gain 211 | The sleepiness-drive bar the decision lobe actually reads. Without it, the Norn never has a drive reason to choose "sleep" or "lie down" behaviours |
| Sensorimotor receptor #186 (gene 104) | Creature / Sensorimotor | Locus 11 `LOC_GAIT3` | thresh 128, gain 207 | At ≈50% active Sleepiness, the sleepy-gait locus fires, switching the skeleton animation to the "drowsy stumble" walk. Easily reached during a mid-to-late sleep pulse |
| Circulatory receptor #159 (gene 46) | Creature / Circulatory | Locus 9 | thresh 214, gain 255, **DIGITAL**, *switches on at age 3 "Youth"* | From the Youth life stage onward, very high active Sleepiness (≈84%) triggers a circulatory-tissue locus read elsewhere in the genome for age-dependent sleep-deficit penalties. Switched off in babies, so the sleep drive has a noticeably milder circulatory effect in young Norns |

Because the active drive is only at a high level during a Sleepase-driven release pulse, `LOC_GAIT3` and the Circulatory locus typically fire only just before, during, and immediately after sleep events — not as a steady effect of accumulated sleep debt. The steady effect of banked Sleepiness is felt through the Tiredness chain (reaction 49 → chemical 154 → its own richer receptor suite), which is why Tiredness and Sleepiness feel like "two sides of the same coin" in play: Sleepiness is the *pulsed, decisional* signal that says "it is time to sleep now", Tiredness is the *persistent, integrator* signal that says "you have been awake too long".

### Effects of directly filling Sleepiness backup

A `CHEM 138 <n>` injection produces a distinctive, slow-rolling exhaustion:

1. **Tick 0:** The backup rises to *n*. Active Sleepiness is unchanged (no Sleepase present, so reaction 50 does nothing), and the drives-bar reading is unaffected.
2. **Ticks 1–∞:** Reaction 49 begins generating Tiredness at rate proportional to the backup, with a 510-tick half-life. Tiredness accumulates and is swept into Tiredness backup by reactions 61 + 71, producing the long slow rise in felt fatigue described in the 137 documentation.
3. **On next sleep decision.** When the decision lobe next fires neuron 40 (or when the creature is put to sleep via an agent), Sleepase is emitted, reaction 50 activates, and the full reservoir suddenly converts to active Sleepiness — pushing the sleepiness bar far higher than a naturally-accumulated level would. This often triggers long, hard-to-interrupt sleep sessions as the creature works through the injected backup.
4. **Tiredness lingers.** Because reaction 49 keeps running for as long as chemical 138 is non-zero, even after a sleep session has drained most of it, the residual backup continues to produce Tiredness. A large `CHEM 138 <n>` injection therefore looks to the player like *both* severe sleepiness during the next sleep cycle *and* weeks of persistent mild fatigue afterward.
5. **No collateral drives.** Unlike Pain backup's cross-coupling with hunger, or Tiredness backup's connection to age-gated circulatory locus 10, Sleepiness backup affects only the sleep/tiredness axis. The injection produces a clean two-drive response without touching Pain, Hunger, Need-for-pleasure, or any of the other twelve drives.

### Interaction with Sleep toxin and other substances

Several stock chemicals interact with the sleep system *via* chemical 138:

- **Sleep toxin (71)** drives reaction 82 (`4× Sleep toxin → 3× Sleep toxin + 2× Sleepiness`), producing active Sleepiness that is swept into the backup within a few ticks by reaction 51. Administering Sleep toxin therefore fills 138 over the duration of the toxin's own half-life, not only 155 — a dose of Sleep toxin leaves behind a sleep-debt reservoir even after the toxin itself has decayed.
- **Sleepase (129)** is the enzymatic key that unlocks reaction 50. Nothing else catalyses it, and chemical 129 is only emitted by the decision-lobe sleep neuron and the `LOC_ASLEEP` locus. This means Sleepase is effectively the stock genome's "permission to sleep" signal; externally injecting Sleepase via `CHEM 129 <n>` will force reaction 50 to fire, draining the backup into active Sleepiness even if the decision lobe has not elected to sleep.
- **The `MakeYourselfTired` shutdown helper** writes active Sleepiness (155) = 0.6 and active Tiredness (154) = 0.8 just before a CAV save. The 0.6 active Sleepiness migrates into chemical 138 within a few seconds via reaction 51, so imported Norns from a saved CAV arrive with a pre-filled sleep reservoir. This is why a Norn loaded from a warm save often wants to sleep shortly after being imported.
- **Medicine chemicals in the stock genome do not drain 138.** Neither the antihistamines, antibodies, nor anti-oxidants touch the sleep reservoir. "Wake-up tonics" and "sleeping draughts" in the stock agent pack operate by writing to 155 (active drive) or 129 (Sleepase) directly; the reservoir at 138 is only indirectly affected by their knock-on effects.

### Implications for modders

Common modifications built on top of Sleepiness backup:

1. **Add a reaction `Sleepiness backup + Sleepase → (nothing) + Sleepase`** to make sleep actually *erode* the backup rather than just converting it to active Sleepiness. This matches the intuition that "a good sleep clears sleep debt" and avoids the stock-genome quirk where Sleepase just redistributes the chemical without eliminating it.
2. **Add a neuroemitter from a "physical activity" brain neuron to chemical 138.** The stock genome fills 138 almost entirely via the `LOC_CONST` time-based drip; mods that wire effort into the reservoir produce behaviourally-scaled sleep debt — hard-working Norns get sleepy, lazy ones don't.
3. **Weaken reaction 49.** Reducing the rate of Sleepiness-backup → Tiredness decouples the two drives, useful for modding "night owl" Norns that stay sharp despite accumulating sleep debt, or for genomes that want Tiredness to be driven by a different mechanism (hunger, injury, age).
4. **Raise the initial concentration** so newly-hatched Norns start with a small Sleepiness-backup reserve — a crude way to simulate pre-birth fatigue or a "slow-starter" breed.
5. **Replace the Sleepase catalyst with a different enzyme**, letting the release be gated by something other than the decision-lobe sleep neuron — e.g. an external "sandman" chemical emitted by a specific agent, or a circadian-rhythm enzyme tied to game time.

Because chemical 138 has no direct receptors and is pervasive in the sleep/fatigue subsystem, these modifications have broad consequences — changing the dynamics of 138 affects both Sleepiness and Tiredness simultaneously and therefore every receptor on 155 and 154.

### Practical consequences for gameplay

- **`CHEM 138 <n>` is the canonical "sleep-debt" injection.** Unlike `CHEM 155 <n>` (which produces a brief pulse that decays as reaction 51 sweeps it into the backup) or `CHEM 129 <n>` (which would force an immediate release without any reservoir to release from), writing to 138 guarantees a persistent sleep-deficit state: the next sleep will be strong, and Tiredness will steadily rise until the reservoir has been drained.
- **`CHEM 138 -n` wipes sleep debt in one write.** This is how well-behaved Norn-care tools model "a perfect night's rest" or "wake up refreshed" — they zero both 138 and 137 simultaneously so that neither the sleep reservoir nor the fatigue reservoir continues to produce downstream signals.
- **The reservoir is invisible to most UI.** The Drives UI shows only the Sleepiness bar (receptor reading 155); the Science Kit is the only stock tool that displays chemical 138. A Norn with low Sleepiness but high Sleepiness backup will appear "fine" on the drives display while being, biochemically, massively sleep-deprived.
- **Sleep does not necessarily drain the reservoir to zero.** Because reaction 50 is a *redistribution* (backup → active, with catalyst retained) and reaction 51 is a *re-banking* (active → backup), a complete sleep cycle moves chemicals around between 138 and 155 but only *consumes* them via downstream receptors and reaction 49. A long sleep reduces but rarely empties chemical 138, which is why Norns sometimes appear to wake, behave normally for a while, and then want to sleep again shortly after — they're working down a reservoir that one session wasn't enough to clear.
- **Tiredness tracks the backup, not sleep events.** Because Tiredness is produced *from* chemical 138 by reaction 49, the felt Tiredness of a creature is proportional to how much sleep debt is banked, not to how recently it slept. A Norn that slept briefly and didn't empty 138 will still feel tired; a Norn whose 138 has been externally zeroed will feel fresh immediately, regardless of whether it has actually slept.
- **Age-gated receptors on 155 and 154 both fire eventually.** The Circulatory locus 9 (on 155, thresh 214) and Circulatory locus 10 (on 154, thresh 204) both become active at the Youth age stage. A baby with a full Sleepiness backup who transitions to Youth can immediately find both circulatory loci firing during the next sleep cycle — the biochemical reason Norns often "feel their age" suddenly at the Youth transition if their sleep has been poorly managed.

### Summary

```
 Stock-genome wiring of Sleepiness backup [138]
 ───────────────────────────────────────────────
 Inputs:
   LOC_CONST emitter #5 (gene 39): Sleepiness [155] baseline drip
   Sleep toxin [71] → reaction 82 → Sleepiness [155] (half-life 24)
   reaction 51 (gene 101):   Sleepiness → Sleepiness backup      (half-life 11, "Short")
   CHEM 138 <n>   (CAOS / scripts / mods)
   Creature::MakeYourselfTired() (engine helper, fills 155 → banked by 51)

         Sleepiness backup [138]          half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                 │
                 │  reaction 50 (gene 102):
                 │    Sleepiness backup + Sleepase → Sleepiness + Sleepase
                 │    (half-life 2, "Very short", CATALYSED release pulse)
                 │
                 │  reaction 49 (gene 103):
                 │    Sleepiness backup → Tiredness + Sleepiness backup
                 │    (half-life 510, "Medium", CATALYTIC — 138 not consumed)
                 │
                 ▼
       Sleepiness [155]  ── Drives locus 7 (gain 211)         — sleepiness bar
       Tiredness  [154]  ── Drives locus 6 (gain 223)         — tiredness bar
                 │             LOC_GAIT3 (155, thresh 128)    — drowsy gait
                 │             LOC_GAIT2 (154, thresh 141)    — tired stumble
                 │             LOC_INVOLUNTARY5 (154, t 208)  — faint reflex
                 │             Circulatory L9 (155, age ≥ 3)
                 │             Circulatory L10 (154, age ≥ 3)
                 │             Immune neuron 1 (154, t 128)

         Sleepase [129] — the release-pump enzyme that opens reaction 50
         Sleepase emitters:
            Brain neuron 40 (sleep decision cell) — rate 3, gain 68, DIGITAL
            LOC_ASLEEP (sensorimotor locus 1, reads 255 while asleep) — rate 3, gain 77
```

Sleepiness backup is therefore best understood as the **central hub of the Norn sleep-fatigue system** — the reservoir that both banks sleep debt and, catalytically, drives the production of Tiredness. Unlike Tiredness backup (which is a passive integrator) or Pain backup (which is a half-wired dormant slot), Sleepiness backup is the busiest chemical in the 131–146 block: it participates in three reactions, gates the entire sleep pulse via Sleepase, and is the single source of the Tiredness drive. Of the sixteen drive-backup slots, it is the one the genome treats as load-bearing infrastructure rather than a reservoir for its own drive alone.
