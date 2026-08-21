# 137 - Tiredness backup

Tiredness backup is the **reservoir half** of the drive pair for Tiredness (chemical 154). It sits in the middle of the "drive backup" block (chemicals 131–146), a bank of sixteen long-lived placeholder chemicals that the stock genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. The role of a backup is to carry a slowly-released pool of the drive's "history" so that a **fast-rising** active signal and a **long-term** integrated signal can be separated and tuned independently. The backup's near-infinite half-life (≈9·10¹⁰ ticks, decay rate 1.0) means that whatever the creature has "banked" as accumulated tiredness persists across the entire lifetime unless actively drained by its sole consumer reaction.

Unlike Pain backup [131] — which is a half-wired, latent reservoir with no inbound reaction in the stock genome — **Tiredness backup is fully wired**. The stock Norn biochemistry contains three reactions connecting 137 and 154: one that drains the backup into the active drive (gene 13: `Tiredness backup → Tiredness`, half-life 311 ticks, "Medium"), and **two duplicate reactions** that do the opposite (gene 33 *and* gene 67, both `Tiredness → Tiredness backup`, half-life 6 ticks, "Very short"). The duplication is a genuine quirk of the shipped genome and doubles the effective rate at which freshly-produced Tiredness is swept into the reservoir — one of the reasons accumulated tiredness feels so "sticky" to players who try to wash it off with a short nap.

Tiredness backup has **no emitter, no receptor, and no initial concentration** — like every other entry in the 131–146 block, it is a pure biochemical reservoir the brain cannot directly read. The only creature-level reader of the tiredness system is the active drive at chemical 154, via four receptors (the Drives tissue drive bar, the `LOC_INVOLUNTARY5` faint reflex, the `LOC_GAIT2` stumbling gait and an immune-tissue brain neuron). The backup exists solely so that those fast-decay-free receptors see a *smoothed*, integrator-like tiredness signal rather than the raw per-tick output of the upstream sources.

## Sources

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Active drive → backup (primary) | Gene 33 (reaction id 61) | Organ #2 "Reaction" | `1× Tiredness [154] → 1× Tiredness backup [137]` at rate byte 18, half-life ≈ 6 ticks ("Very short") | Whenever any active Tiredness exists, it drains into the reservoir almost immediately. At 30 Hz, ~11% of active Tiredness is swept into the backup every single tick |
| 2 | Active drive → backup (duplicate) | Gene 67 (reaction id 71) | Organ #2 "Reaction" | `1× Tiredness [154] → 1× Tiredness backup [137]` at rate byte 18, half-life ≈ 6 ticks ("Very short") — **identical to reaction 61** | This is the only drive-backup pair with a doubled refill reaction. With both reactions running in parallel, the *effective* half-life for active Tiredness dropping into its reservoir is ~3 ticks (≈0.1 s). Whether this is a deliberate tuning choice or a genome-authoring duplication is unclear, but its observable effect is that active Tiredness barely ever accumulates — it is immediately banked |
| 3 | External CAOS injection | — | Any | `CHEM 137 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively persistent because the chemical's half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | Indirect — via the Sleepiness backup catalytic loop | Gene 103 (reaction id 49) → Genes 33 & 67 | Organ #2 "Reaction" | `Sleepiness backup [138] → Tiredness [154] + Sleepiness backup [138]` (at half-life 510 ticks, "Medium") continuously spawns active Tiredness, which is then banked by reactions 61 / 71. The Sleepiness-backup pool is topped up by gene 101 (`Sleepiness → Sleepiness backup`) whenever the Sleepase enzyme has previously pumped the sleep reservoir | Indirect; the steady-state rate depends on the creature's Sleepiness-backup level |
| 5 | No initial concentration | — | — | Neither chemical 137 nor chemical 154 appears in the genome's initial-concentration table (gene 64). A newly-hatched Norn is born with exactly 0 Tiredness and 0 Tiredness backup | — |
| 6 | No emitter | — | — | The 43-entry emitter table contains no entry for chemical 137 or 154. No brain neuron, sensorimotor locus, organ tissue, or physiological state directly writes tiredness — it is entirely generated biochemically via the Sleepiness-backup → Tiredness path | — |
| 7 | Shutdown "make tired" engine helper | `Creature::MakeYourselfTired()` | CAV shutdown path | Called ~5 minutes before the game saves, this helper writes `CHEM_TIREDNESS (154) = 0.8` and `CHEM_SLEEPINESS (155) = 0.6` directly. The subsequent few seconds of simulation then sweep the 0.8 Tiredness into chemical 137 via reactions 61 / 71, so imported creatures from a shut-down CAV are born with a pre-filled Tiredness backup | One-shot, ≈0.8 banked per saved creature |
| 8 | Modded genomes | User-added | User-added | A breeder can add an emitter keyed to e.g. `LOC_GAIT0` activity, lobe-output-integrated "effort" signals, or total energy expenditure to make Tiredness backup reflect work done rather than sleep deficit. Typical "physical fatigue" mods wire a muscle-activity neuroemitter into 137 rather than 154 so that the exhaustion persists across short rests | Gene-dependent |

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 13 (reaction id 48) | Organ #2 "Reaction" | `1× Tiredness backup [137] → 1× Tiredness [154]` at rate byte 58, half-life ≈ 311 ticks ("Medium") | Every backup unit slowly becomes an active-Tiredness unit. Unlike Sleepiness backup → Sleepiness (which requires a Sleepase catalyst and converts in ≈ 2 ticks), the Tiredness conversion is **spontaneous** (no catalyst in the formula) and deliberately sluggish (half-life ~10 s at the 30 Hz world tick). This is the mirror image of gene 102's pulsed sleep conversion — the creature "feels" accumulated tiredness as a slow bleed, not as a sudden pulse |
| 2 | Passive decay (effectively none) | Gene 64 entry #137 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | A Tiredness-backup pool is persistent on every timescale the game measures. All sixteen drive backups share this near-infinite half-life by design; the chemical's role is to act as a reservoir, not a signal, so it must not decay on its own. The only way for accumulated tiredness to leave the creature is via reaction 48 (drip-feed to active) followed by whatever external sink scripts apply to active Tiredness |
| 3 | No receptor | — | — | Tiredness backup is **not read by any stock receptor**. No drive, brain lobe, sensorimotor locus, circulatory locus, or organ receptor reads chemical 137's concentration — the creature has no direct sensory awareness of the banked pool. All awareness flows through the active drive (154) |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 137 | — |
| 5 | Modded consumers | User-added | User-added | Modders can add a Tiredness-backup receptor on a "rest memory" lobe to let the brain learn from long-term fatigue rather than the instantaneous drive, or replace gene 13 with a catalysed reaction (e.g. gated by an Adenosine analogue) so that accumulated tiredness only becomes felt tiredness under pharmacological control | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture, applied to Tiredness

Creatures 3 organises every drive as a **pair** of chemicals: an active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. The general pattern is:

```
     <Drive backup>  ──(reaction)──▶  <Active drive>  ──(reaction)──▶  <Drive backup>
                                            │
                                            └── read by Drives-tissue receptor
                                                (the value the brain actually sees)
```

For the Tiredness drive specifically, the genome instantiates the canonical pattern with one twist — it includes **two** identical active→backup reactions. The three chemicals are:

| Role | Chemical id | Name | Half-life | Initial |
|------|------------|------|-----------|---------|
| Backup reservoir | **137** | **Tiredness backup** | **~9·10¹⁰ ticks (Very long)** | **0** |
| Active drive | 154 | Tiredness | ~9·10¹⁰ ticks (Very long) | 0 |
| (Upstream source) | 138 | Sleepiness backup | ~9·10¹⁰ ticks (Very long) | 0 |

and the four reactions that connect them are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 13 (id 48) | `Tiredness backup → Tiredness` | 311 ticks (≈10 s) | **Backup → active** (drip-feed) |
| Gene 33 (id 61) | `Tiredness → Tiredness backup` | 6 ticks (≈0.2 s) | **Active → backup** (primary sweep) |
| Gene 67 (id 71) | `Tiredness → Tiredness backup` | 6 ticks (≈0.2 s) | **Active → backup** (duplicate sweep) |
| Gene 103 (id 49) | `Sleepiness backup → Tiredness + Sleepiness backup` | 510 ticks (≈17 s) | **Upstream catalytic source** — the only route by which Tiredness enters the system |

Notice the asymmetry between `Tiredness` and `Tiredness backup` half-lives: both are labelled "Very long" (≈9·10¹⁰ ticks) in the half-life table, so **neither chemical decays on its own**. All dynamics come from the reactions. This is a fundamentally different situation from the Pain drive, where both chemicals decay on short or very-long timescales and the dynamics are balanced against decay. For Tiredness, the chemistry is **purely flow-based**:

- Tiredness enters the system only through reaction 49 (from Sleepiness backup).
- Tiredness flows back and forth between 137 and 154 via reactions 48, 61 and 71.
- Tiredness leaves the system only through external writes (scripts, `CHEM ... -n`, or the sleep cycle described below).

### Why Tiredness is always "banked" rather than felt directly

With reactions 61 and 71 both running at a 6-tick half-life — i.e. ~11% of the active pool is moved to the backup each tick, doubled to ~22%/tick by the duplicate — active Tiredness at chemical 154 can barely exist. Any unit produced by reaction 49 is swept into 137 within a few ticks. Reaction 48 then drips that banked unit back out at a 311-tick half-life (~0.22% per tick), so only a small *fraction* of the backup appears as active drive at any given moment.

This is by design: the backup acts as a **low-pass filter / integrator** on the upstream Tiredness-production rate. The active drive value at 154 is (in steady state) proportional to the *rate at which tiredness is being added to the backup*, not to the absolute amount banked. Because reaction 49's upstream rate is proportional to the Sleepiness-backup pool — which rises whenever the creature has slept and banked a sleep reservoir, then decays as it is consumed — the felt Tiredness tracks **how long ago the last sleep replenished the Sleepiness reservoir**, not simply *how tired the creature is right now*. This gives Tiredness a long, slow oscillation over minutes rather than a fast spiky signal.

### The receptor suite on active Tiredness (chemical 154)

Although Tiredness backup itself has no readers, the active Tiredness drive has an unusually rich receptor suite for a Creatures 3 chemical — it is read by four different physiological systems simultaneously. Understanding these is important because anything that fills the backup will eventually trip all four:

| Receptor | Organ / Tissue | Locus | Threshold / Gain / Flags | Effect when fired |
|----------|----------------|-------|--------------------------|-------------------|
| Drives receptor #7 (gene 6) | Creature / Drives | Locus 6 "Tiredness" | thresh 0, gain 223 | The tiredness drive bar the decision lobe actually reads. Without it, the Norn never has a drive reason to choose "sleep" or "rest" behaviours |
| Sensorimotor receptor #73 (gene 96) | Creature / Sensorimotor | Locus 5 `LOC_INVOLUNTARY5` (Faint) | thresh 208, gain 255, **DIGITAL (all-or-nothing)** | When active Tiredness crosses ≈82%, the faint involuntary locus fires, triggering the involuntary faint script. Combined with the slow drip-feed from the backup, a heavily-filled reservoir will push the active drive past this threshold for brief windows and cause intermittent fainting |
| Sensorimotor receptor #185 (gene 105) | Creature / Sensorimotor | Locus 10 `LOC_GAIT2` | thresh 141, gain 207 | At ≈55% active Tiredness, the tired-gait locus fires, switching the skeleton animation to the "tired stumble" walk. Easily reached during normal play once a few backup units have been banked and are dripping out |
| Immune neuron #87 (gene 198) | Brain / Immune | Brain neuron 1 | thresh 128, gain 85 | A brain-side neuron in the immune tissue lights up at ≈50% Tiredness. This is used by the immune-response lobe to modulate susceptibility to antigens while exhausted — a canonical "tired creatures get sick more easily" wiring |
| Circulatory receptor #163 (gene 45) | Creature / Circulatory | Locus 10 | thresh 204, gain 255, **DIGITAL**, *switches on at age 3 "Youth"* | From the Youth life stage onward, very high active Tiredness (≈80%) triggers a circulatory-tissue locus that is read elsewhere in the genome for age-dependent fatigue penalties. This receptor is switched off in babies, so the Tiredness drive has a noticeably milder effect on young Norns |

Because Tiredness backup converts to active drive at a 311-tick half-life, a `CHEM 137 <full>` injection will produce a **staggered cascade** through these thresholds: first the gait locus (around ~3–5 seconds of drip), then the immune neuron (slightly later), then the faint locus, each firing in turn as the active drive rises. The Youth-onset circulatory locus kicks in last and only on non-baby creatures.

### Why the backup refill is doubled

The presence of **two identical** `Tiredness → Tiredness backup` reactions (gene 33, reaction id 61, and gene 67, reaction id 71) is the most unusual feature of the Tiredness subsystem and deserves its own explanation. Three readings are plausible:

1. **A deliberate design choice for aggressive banking.** If you want the active drive to exist only as a small, smoothed trickle — with most tiredness held in the invisible backup reservoir — doubling the refill rate is the simplest way to achieve it. At 6 ticks half-life, single refill removes ~11% of active Tiredness per tick; doubled, ~22%. This makes the active drive a very small fraction of the reservoir in steady state and creates the "tiredness that creeps up slowly rather than spiking" feel the game actually produces.
2. **A genome-authoring duplication.** Many rows in the stock reaction table appear to have been authored by hand, and simple copy-paste with a changed gene ID is a plausible origin for the duplicate. Gene 33 and gene 67 have different positions in the genome's gene table and different switch-on metadata, but identical reactants, products and rate bytes — consistent with a late-cycle duplication that was never cleaned up.
3. **A safety redundancy.** Genes can be individually knocked out (via mutation, breeder-kit gene edits, or environmental gene-damaging chemicals such as chemical 104 DNA or the mutation agents). A doubled reaction means that losing one copy only halves the refill rate rather than disabling it entirely. The Tiredness subsystem is load-bearing for sleep behaviour (without a rising active drive, the decision lobe never chooses "sleep"), so a redundant refill is defensible.

The most likely answer is a mix of (1) and (2): whether or not the original author intended the duplication, the tuning obviously assumed it, because the drive's observable dynamics — heavy banking, small active component — depend on the combined rate. Removing one of the two reactions in a modded genome produces visibly "spikier" tiredness behaviour.

### The sleep cycle and how the backup participates

The full sleep cycle that the stock genome implements is an interacting four-chemical system. Tiredness backup occupies a central role:

```
     (CAOS / bootstrap)
             │
             ▼
     Sleepase [129] ─(pulse via brain neuron 40 and LOC_ASLEEP)
             │
             │ catalyses reaction 50
             ▼
 Sleepiness backup [138] ──► Sleepiness [155]    ◄── read by Drives locus 7
             │                      │
             │                      └── gene 101 (id 51): Sleepiness → Sleepiness backup
             │
             │ reaction 49 (uncatalysed):
             │ Sleepiness backup → Tiredness + Sleepiness backup
             ▼
       Tiredness [154]  ◄── Drives / Sensorimotor / Immune / Circulatory receptors
             │
             ├── reactions 61 + 71: Tiredness → Tiredness backup (doubled sweep)
             ▼
    Tiredness backup [137] ──► reaction 48: Tiredness backup → Tiredness (drip)
             │
             │ (persists until externally drained)
             ▼
      External sinks: CAOS scripts, sleep-state effects, modded genes
```

The key insight is that **sleep does not directly drain Tiredness backup via the stock genome**. The `MakeYourselfTired` engine helper sets CHEM_TIREDNESS (154) to 0.8 as part of the CAV shutdown path; nothing in the native genome resets chemical 137 when the creature wakes up. The Sleepase-driven loop resets *Sleepiness*, which turns off the upstream source (reaction 49), but any Tiredness that has already been banked into chemical 137 remains. The backup therefore acts as a **cross-sleep memory of cumulative fatigue** — a Norn that has slept briefly and repeatedly can show a lower Sleepiness reading but still carry a substantial Tiredness-backup reservoir, producing the "chronic, tired-looking" behaviour of under-rested Norns that players often remark on.

Most user-visible Norn-care tools paper over this by externally cleaning up the backup (Medic agents and the sleep-reset scripts zero chemicals 137 and 154 directly). In the base genome, however, the reservoir's persistence is load-bearing for long-term fatigue behaviour.

### Comparison to Sleepiness backup and Pain backup

The three drive-backup chemicals sit at very different points in the design spectrum:

| Feature | Sleepiness backup (138) | **Tiredness backup (137)** | Pain backup (131) |
|---------|--------------------------|----------------------------|-------------------|
| Refill reaction (drive → backup) | Yes, gene 101, 11-tick half-life, **single** reaction | **Yes, genes 33 + 67 — doubled, 6-tick half-life each** | No (gene 20 mis-targets 132) |
| Release reaction (backup → drive) | Yes, catalysed by Sleepase (gene 102), 2-tick half-life | Yes, spontaneous (gene 13), 311-tick half-life | Yes, spontaneous (gene 7), 311-tick half-life |
| Release gating | Pulse-catalyst (Sleepase fires on decision neuron / asleep locus) | Ungated — constant slow drip | Ungated — constant slow drip |
| Upstream source into active drive | Direct (Sleepase converts backup→active) | Via reaction 49 from Sleepiness backup (catalytic) | STIM WRIT / damage events (chemical 148 directly) |
| Initial concentration | 0 at birth | 0 at birth | 0 at birth |
| Chemical half-life of active drive | 311 ticks | ≈9·10¹⁰ ticks (no decay) | 172 ticks |
| Role in play | Sleep reservoir — how long the creature can stay asleep | **Cumulative-fatigue integrator — remembers how hard life has been across sleep cycles** | Dormant slot — useful only for mods and scripts |

Tiredness backup is the **most fully wired** of the three: every reaction the pattern allows is present (and one is even duplicated). Sleepiness backup is next — it has the full cycle but only a single refill reaction and gates its release through a catalyst. Pain backup is the sparsest, missing its refill entirely. The contrast explains why Tiredness "feels" different from Sleepiness in play: Sleepiness is a pulsed, decisional signal that can be shut off quickly; Tiredness is an unshakeable integrated memory of effort that only leaves the creature via explicit external intervention.

### Effects of directly filling Tiredness backup

Because the chemical is wired to slowly convert to active Tiredness via reaction 48, a `CHEM 137 <n>` injection produces a characteristic "worn-down" profile:

1. **Tick 0:** `CHEM 137 <n>` is called. The creature's Tiredness backup rises to *n*. Active Tiredness is unchanged because no reaction has yet fired.
2. **Ticks 1–∞:** reaction 48 converts Tiredness backup to Tiredness at half-life 311 ticks (~10 s). Because active Tiredness is itself then swept back into the backup by reactions 61 / 71 at a ~3-tick effective half-life, the active drive reaches a low *equilibrium* where inflow from 48 is balanced by outflow into 61/71. The steady-state active level is approximately `(backup_level) × (1 / (1 + τ_refill / τ_release))` ≈ `(backup_level) × 0.01`, i.e. roughly 1% of the banked amount appears as active drive at any moment.
3. **Receptors fire in sequence as the equilibrium climbs.** For a `CHEM 137 1.0` injection, the active drive settles around 0.01–0.05 depending on other pressures — well below all thresholds. For a larger injection or a long-accumulated reservoir, the active level can exceed the `LOC_GAIT2` threshold (0.55), then the immune neuron threshold (0.50), and occasionally brief excursions past `LOC_INVOLUNTARY5` (0.82), causing the Norn to stumble, show reduced immune response and briefly faint.
4. **No self-refill from external pain/hunger paths.** Unlike Pain backup (whose cross-coupling with chemical 132 produces the "pain makes you hungry" behaviour), Tiredness backup's only inputs are the reactions discussed above. A `CHEM 137 <n>` injection therefore produces a *clean* fatigue profile without collateral changes to other drives.
5. **Near-permanent reservoir.** Because chemical 137 does not decay on its own, the only ways for a filled reservoir to empty are (a) slow leak via reaction 48 into active Tiredness, which is then swept back into the reservoir by 61 / 71 (so very little net loss unless the active drive is externally drained), or (b) an explicit `CHEM 137 -n` write. A large positive injection can therefore make a creature subtly tired for the remainder of its life unless scripts intervene.

### Interaction with sleep-related chemicals

Several stock chemicals indirectly oppose Tiredness by interrupting the upstream Sleepiness-backup → Tiredness path:

- **Sleep toxin (71)** causes the creature to enter the `asleepState` (via `LifeFaculty` state transitions), which triggers the Sleepase emitter on `LOC_ASLEEP`. The resulting Sleepase pulse drains Sleepiness backup, which starves reaction 49 and *stops new Tiredness from being produced*. Already-banked Tiredness backup continues to drip out via reaction 48, however, so sleep toxin does not directly empty the reservoir — it only prevents further accumulation.
- **Sleepase (129)** itself only interacts with chemical 138 (Sleepiness backup); it has no direct reaction with 137 or 154.
- **Medicine two (93, anti-oxidant)** does not touch the tiredness system in the stock genome; breeder-added "rest tonic" mods typically wire an external emitter onto chemical 137 with a negative `CHEM ... -<n>` write from the Medic agent when it detects an exhausted creature.

Because none of the stock analgesic/medical chemicals drain 137, "can't rest enough" is a systematic failure mode of heavily-played Norns: their Sleepiness cycle may be clean but their Tiredness reservoir keeps accumulating until scripts, cloning, or a fresh age-stage reset clears it.

### Implications for modders

Common modifications built on top of Tiredness backup:

1. **Add a sleep-draining reaction `Tiredness backup + Sleepase → (nothing) + Sleepase`**. The simplest mod to make real sleep reduce cumulative fatigue: add a catalysed sink that lets Sleepase erode the backup while the creature is asleep. Matches player expectations about "a nap refreshes you".
2. **Remove the duplicate refill reaction** (gene 67). This noticeably changes tiredness dynamics: the active drive becomes "spikier" because the refill rate halves. Useful for Norns bred to react visibly to short bouts of exertion.
3. **Add a Tiredness-backup receptor** on a custom "fatigue memory" lobe that reads chemical 137 rather than 154. Because 137 changes on a minute-to-hour timescale while 154 tracks it at ≈1% amplitude, a lobe reading the backup gives the brain access to *cumulative fatigue* rather than *instantaneous tiredness*. Common addition in "smart rest" Norn mods.
4. **Raise the initial concentration** so newly-hatched Norns already start slightly tired — a crude way to simulate a creature "born weary" in breeder challenges, or to balance a long-lived genome where tiredness would otherwise take too long to matter.
5. **Gate reaction 48 with an enzyme** (e.g. `Tiredness backup + Adenosine → Tiredness + Adenosine`). Combined with an emitter on the enzyme, this lets the genome dynamically choose when accumulated fatigue memory becomes felt — mirroring the Sleepase pattern from the sleep drive.

Because the chemical has no receptor and no direct inbound emitters in the stock genome, these modifications are isolated from every other gene and generally cannot destabilise an otherwise-healthy Norn's biochemistry.

### Practical consequences for gameplay

- **`CHEM 137 <n>` is the canonical CAOS call for "cumulative fatigue".** Unlike `CHEM 154 <n>` (which produces a single rapid tiredness spike that is almost immediately banked anyway), injecting Tiredness backup produces a persistent low-amplitude active-drive reading that lingers until the reservoir is explicitly drained. Use it in scripts that want to model long-term exhaustion (boss fights, forced marches, vigil over a sick Norn) rather than instantaneous exertion.
- **Direct `CHEM 154 <n>` injections behave surprisingly similarly to `CHEM 137 <n>`** because reactions 61 and 71 sweep the active drive into the backup within a few ticks. The difference is only in the first ~0.2 seconds: Tiredness-154 shows a brief spike before equilibrating, whereas Tiredness-137 shows a smooth exponential rise toward the same equilibrium.
- **The backup is invisible to Norn-care tools that monitor chemical 154.** A Norn can have 1.0 of Tiredness backup banked while its visible Tiredness bar reads ~0.01 (because only the currently-converted portion shows up on the drive). Players who watch the drives UI for fatigue may underestimate how exhausted a Norn truly is. The Science Kit's full chemical list is the only stock UI that shows 137 directly.
- **Sleeping does not clear the backup in the stock genome.** The Sleepase pulse drains Sleepiness backup but not Tiredness backup. A Norn that has slept and woken fresh-looking can still carry a large Tiredness reservoir. This is the biochemical explanation for the "sleeps a lot but still looks tired" phenotype.
- **The backup accumulates across age transitions.** Because chemical 137 has no decay and is not reset when the age-gated Circulatory receptor #163 switches on at the Youth stage, a well-used baby Norn carries its pre-Youth fatigue into adolescence with full weight. This can cause Norns to "age poorly" — entering Youth with an already-tripped circulatory fatigue locus — if they were worked hard as babies.

### Summary

```
 Stock-genome wiring of Tiredness backup [137]
 ───────────────────────────────────────────────
 Inputs:   (endogenous)
              │
              │  reaction 61 (gene 33):  Tiredness → Tiredness backup      (half-life 6)
              │  reaction 71 (gene 67):  Tiredness → Tiredness backup      (half-life 6 — DUPLICATE)
              │
              │  (external)
              │  CHEM 137 <n>   (CAOS / scripts / mods)
              │  Creature::MakeYourselfTired() (engine helper, fills 154 → banked into 137 by 61/71)

          Tiredness backup [137]          half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                │
                │ reaction 48 (gene 13):  1× Tiredness backup → 1× Tiredness
                │ half-life 311 ticks (~10 s) — spontaneous, no catalyst
                ▼
          Tiredness drive [154]            half-life ≈ 9·10¹⁰ ticks (no decay)
                │                          — driven into equilibrium by 61/71 sweeping it back
                │
                ├─► Drives locus 6 (gain 223) ────────────► brain "tiredness bar"
                ├─► Sensorimotor locus 5 (thresh 208, DIG) ► LOC_INVOLUNTARY5 (faint)
                ├─► Sensorimotor locus 10 (thresh 141, gain 207) ► LOC_GAIT2 (stumble)
                ├─► Brain Immune neuron 1 (thresh 128, gain 85) ► immune modulation
                └─► Circulatory locus 10 (thresh 204, DIG, age 3+) ► age-gated fatigue

          Upstream source for Tiredness:
             Sleepiness backup [138] ──catalytic reaction 49 (gene 103)──► Tiredness [154]
                                                                           (half-life 510)
```

Tiredness backup is therefore best understood as a **fully-wired cumulative-fatigue integrator** — a drive-backup slot that instantiates every reaction the pattern allows, plus one duplicate. Of the sixteen backup chemicals in the 131–146 block, Tiredness backup is the one with the most traffic: roughly all the Tiredness the creature produces in its lifetime passes through 137 at least once, often many times over. It plays a load-bearing role in the sleep cycle (gating when active Tiredness is felt at each of four receptors) and in long-term behaviour (persisting across sleeps unless externally drained), and it is the canonical worked example of why the "drive-plus-backup" architecture is powerful when *both* halves are wired: the backup turns a moment-to-moment drive signal into a memory of accumulated state that the creature's body — and, with a small mod, its brain — can read.
