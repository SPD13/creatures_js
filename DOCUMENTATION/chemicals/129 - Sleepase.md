# 129 - Sleepase

Sleepase is an **enzyme chemical** whose sole biological role in the Creatures 3 / Docking Station stock Norn genome is to **convert the "Sleepiness backup" reservoir (chemical 138) into the active "Sleepiness" drive signal (chemical 155)**. The chemical table (`Libraries/creatures-chemicals.js:159`) describes it simply as *"Converts sleepiness backup to sleepiness"*, and gene 102 in the reaction block wires exactly that:

```
1× Sleepiness backup [138] + 1× Sleepase [129]  →  1× Sleepiness [155] + 1× Sleepase [129]
```

Sleepase is the **catalyst half** of the Sleepiness drive-backup feedback loop. Creatures 3 separates each drive into two chemicals — an **active drive** that the brain reads (`Sleepiness`, locus 7 on the Drives tissue) and a **backup reservoir** that buffers the drive between events (`Sleepiness backup`). The active drive continuously decays back into the reservoir (gene 101: `Sleepiness → Sleepiness backup`, half-life 11 ticks) so that the drive signal never persists indefinitely on its own. A specialised enzyme — Sleepase — is required to push the reservoir *back* into active drive on demand. By controlling the emission of Sleepase, the genome controls **when** accumulated "background tiredness" converts into a felt urge to sleep.

Unlike reserved / unused enzymes in the 110–130 block (115 Glycolase, 114 Insulin, 120–126 unused), Sleepase is **genuinely active** and completely endogenous: the Norn both produces and consumes it without any external input. It has **no initial concentration** (the creature is born with zero Sleepase), **no receptors** (no locus reads Sleepase concentration — the chemical is a pure catalyst, not a signal), and a very short half-life (4 ticks, ≈0.13 s at the 30 Hz world tick) so that any surplus disappears almost immediately after its job is done. The whole point of Sleepase is to fire as a **brief pulse** whenever the genome wants the Sleepiness drive to rise.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|------|----------------|-----------------|------|
| 1 | Brain sleep-neuron emitter | Gene 42 (emitter id 9) | Organ #0 "Brain", Tissue 10 | `Brain neuron 40` of the decision/drive brain tissue; any non-zero activation of that neuron emits Sleepase | `rate=3`, `gain=68`, `threshold=0`, `DIGITAL (fixed gain)` — any neuron activity produces a fixed-amplitude pulse |
| 2 | Asleep-state emitter | Gene 43 (emitter id 10) | Organ #1 "Creature", Tissue 4 "Sensorimotor" | `LOC_ASLEEP` (locus 1) — set to 1.0 by `LifeFaculty` whenever `myState==asleepState` (see `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:118-119`) | `rate=3`, `gain=77`, `threshold=0`, `DIGITAL (fixed gain)` — while asleep, a steady Sleepase pulse is emitted every biotick |
| 3 | External CAOS injection | — | Any | `CHEM 129 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; decays at the chemical's own half-life (see Usage below) |
| 4 | No initial concentration | — | — | Gene 64 initial-concentration table does **not** include chemical 129; the Norn starts life with exactly 0 Sleepase | — |
| 5 | Modded / imported genomes | User-added | User-added | A breeder can add further emitters keyed to e.g. the `LOC_TIRED` locus, high Tiredness, or dusk/dawn CA smells to change when the creature "feels the urge to sleep" | Gene-dependent |

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 102 (reaction id 50) | Organ #2 "Reaction" | `1× Sleepiness backup [138] + 1× Sleepase [129] → 1× Sleepiness [155] + 1× Sleepase [129]` at rate byte 7, half-life ≈ 2 ticks ("Very short") | As soon as Sleepase is present, it transfers the contents of the Sleepiness-backup reservoir into the active Sleepiness drive almost instantly. The enzyme is **regenerated** at the end of the cycle (true catalyst, not a consumable), so a single pulse can convert the entire backup pool if given enough time |
| 2 | Passive decay | Gene 64 entry #129 (half-life table) | Bloodstream | `genomeValue: 14`, half-life ≈ **4 ticks** (≈0.13 s), decay rate `0.84073853` ("Very short") | Any Sleepase not immediately consumed by the reaction is wiped out within a few ticks. Combined with the continuous emission from gene 42/43 this produces a **pulsed** catalyst rather than a standing pool |
| 3 | No receptors | — | — | Sleepase is **not read by any stock receptor**: no drive, locus, mood, or brain lobe responds to its concentration | The creature has no sensory awareness of its own enzyme pool — Sleepase is a pure biochemical intermediate |
| 4 | Modded / imported genomes | User-added | User-added | Modders may add a receptor that senses Sleepase levels (e.g. to trigger dreaming) or rewrite the reaction to be stoichiometric (consumable enzyme) for a different pharmacokinetic profile | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

The Sleepiness drive is one instance of a pattern applied to every homeostatic drive in the Creatures 3 biochemistry. For each drive the genome carries **three chemicals** plus **two reactions**:

```
      <Drive backup> ──enzyme/catalyst──▶ <Active drive> ──slow decay──▶ <Drive backup>
                                              │
                                              └── read by Drives-tissue receptor
                                                  (the value the brain actually sees)
```

For the Sleep drive those three chemicals are:

| Role | Chemical id | Name | Half-life | Initial |
|------|------------|------|-----------|---------|
| Catalyst enzyme | **129** | **Sleepase** | **4 ticks (Very short)** | **0** |
| Backup reservoir | 138 | Sleepiness backup | ~10¹⁰ ticks (Very long) | 0 |
| Active drive | 155 | Sleepiness | 311 ticks (Medium) | 0 |

And the three reactions that connect them:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 102 (id 50) | `Sleepiness backup + Sleepase → Sleepiness + Sleepase` | 2 ticks | **Backup → active** (needs Sleepase) |
| Gene 101 (id 51) | `Sleepiness → Sleepiness backup` | 11 ticks | **Active → backup** (always runs) |
| Gene 103 (id 49) | `Sleepiness backup → Tiredness + Sleepiness backup` | 510 ticks | **Backup bleeds Tiredness** (independent pathway that feeds a separate *Tiredness* drive) |

The asymmetry is deliberate and important. Without Sleepase, Sleepiness can only flow **downhill into the backup reservoir** — the active drive, once triggered, always decays away. Sleepase is the **only route uphill**. Because Sleepase is purely endogenous (two brain/body emitters, no external source, no initial concentration), the genome retains complete control over when Sleepiness rises: it rises **only** when one of two conditions is met — the sleep decision neuron has fired, or the creature is already asleep.

### Why Sleepase is catalytic (not consumable)

Gene 102 writes the reaction as `A + B → C + B` — the enzyme appears unchanged on both sides. This makes Sleepase a **true catalyst**, in contrast to Dehydrogenase (chemical 116), which is consumed by its reaction. The practical consequences are:

1. **A small pulse converts a large pool.** A burst of Sleepase as small as a few units, sustained for a single biotick, is enough to empty a well-filled Sleepiness-backup reservoir into the active drive. The reaction half-life is 2 ticks, so ~30% of the remaining backup is converted per tick while the enzyme is present.
2. **The pulsing is created by the enzyme's own half-life, not by its stoichiometry.** Because the reaction leaves Sleepase intact, the enzyme would accumulate forever without a counter-balance. That counter-balance is the **4-tick chemical half-life** — any free Sleepase is wiped out in under a second. Emission + rapid decay together produce a steady "dripping" pulse exactly as long as the emitter is active.
3. **Stopping the emitter stops the conversion almost immediately.** One biotick after the emission stops, Sleepase drops below the level needed to sustain the reaction, and the backup→active flow shuts off. Anything already in the active drive then decays at the drive's own half-life (311 ticks for Sleepiness, ≈10 s) back into the backup pool.

This is the cleanest example of the **pulse-catalyst** pattern in the stock genome: an enzyme whose half-life is **shorter** than its reaction half-life (4 vs 2 ticks are comparable, and both are far shorter than the active-drive decay of 311 ticks), so that the enzyme only exists in transient spikes and the conversion is completely gated by the emitter.

### The two emitters: *deciding* to sleep vs *staying* asleep

Sleepase has two genome-wired sources, and each plays a distinct role in the sleep cycle:

**Emitter 1 — Brain neuron 40 (`geneId=42`, organ=Brain, tissue=10, locus=40, gain=68)**

Tissue 10 of the brain corresponds to one of the decision/drive lobes in the Norn brain architecture. Neuron 40 fires when the corresponding decision-bar cell reaches activation — in practice, when the brain *decides* to sleep. A DIGITAL emitter (flags=2) with `threshold=0` means the emission amplitude is fixed regardless of the exact neuron activity: once the neuron fires at all, a fixed 68/255 pulse of Sleepase is released. This pulse rapidly converts backup Sleepiness into active Sleepiness, **boosting the drive value above the behaviour-selection threshold and reinforcing the decision to go to sleep**. The creature thus does not need a huge standing pool of Sleepiness to decide to sleep — it only needs a *brief, decisive* rise, which the Sleepase pulse provides.

**Emitter 2 — `LOC_ASLEEP` (`geneId=43`, organ=Creature, tissue=Sensorimotor, locus=1, gain=77)**

`LOC_ASLEEP` is a Sensorimotor locus that reflects the creature's actual sleep state. `LifeFaculty.js:118-119` sets `myAsleepLocus = 1.0` whenever `myState==asleepState`, and that value is written into the creature's Sensorimotor locus 1 every tick. This emitter therefore fires **continuously while the Norn is asleep**, emitting a steady 77/255 pulse of Sleepase every biotick. The result is that during sleep, the Sleepiness-backup pool is continually drained into the active drive — which keeps the Sleepiness drive **elevated while sleeping**, preventing the creature from immediately deciding to wake up. Meanwhile the involuntary Sleep action (`LOC_INVOLUNTARY4 (Sleep)`, gene 95) continues to run, discharging Sleepiness through whatever sleep-consumption pathway is wired in the involuntary loop.

The two emitters together produce the characteristic Creatures-3 sleep cycle:

1. **Awake phase.** Tiredness slowly accumulates (gene 103 bleeds it out of the Sleepiness-backup reservoir at half-life 510 ticks), which drives other brain inputs — but Sleepiness itself stays low because no Sleepase is being emitted.
2. **Sleep decision.** When the brain weighs Tiredness / Loneliness / etc. and the decision lobe selects the "sleep" action, neuron 40 fires. Sleepase pulses; Sleepiness backup rapidly converts to active Sleepiness. The creature commits to sleep.
3. **Falling asleep.** `LifeFaculty.setState(ASLEEP)` flips `myState` to `asleepState`; `myAsleepLocus` goes to 1.0 next biotick.
4. **Asleep phase.** Emitter 2 takes over: a continuous Sleepase pulse maintains Sleepiness above threshold while the involuntary Sleep script consumes it. The reservoir empties over the sleep episode.
5. **Waking.** When the Sleepiness backup is exhausted, Sleepase can no longer meaningfully convert anything; active Sleepiness decays to its backup (gene 101, 11-tick half-life) and falls below the sleep threshold. The brain's decision lobe then selects a non-sleep action, `LifeFaculty.setState(ALERT)` is called, `myAsleepLocus` drops to 0, and the ASLEEP emitter stops.

Sleep in Creatures 3 is therefore **self-terminating through reservoir exhaustion** rather than through a fixed timer: the longer the creature was tired (bigger reservoir), the longer it sleeps; if it slept briefly or only topped up a little, it wakes again quickly. Sleepase is the critical pump that translates "how much rest is banked" into "how long the Norn stays asleep".

### Sleepase vs. Tiredness — two parallel pathways

It is worth highlighting that **Tiredness (154)** and **Sleepiness (155)** are separate drives, wired with different pathways:

- Tiredness is generated at a steady rate by gene 103 (`Sleepiness backup → Tiredness + Sleepiness backup`) at a *Medium* 510-tick half-life. The Sleepiness-backup reservoir therefore acts as a **clock** for Tiredness: as long as there is any backup, Tiredness ticks up. Tiredness only drains through its own half-life or through direct intervention.
- Sleepiness is generated only by the Sleepase-catalysed reaction and drains slowly into the backup pool.

This split lets the brain distinguish *long-term fatigue* ("how much have I been awake?") from *acute urge to sleep now* ("how strongly is the drive ringing in my decision bar?"). Tiredness is the **chronic** signal, Sleepiness the **acute** signal, and Sleepase is the valve that converts chronic fatigue into an acute urge whenever the decision neuron fires or the creature is already committed to sleeping.

### Connection to `LOC_INVOLUNTARY4 (Sleep)` and the Coldness guard

Receptor id 72 (gene 95) wires a different chemical into the sleep machinery:

```
chemical=152 (Coldness)  →  locus=LOC_INVOLUNTARY4 (Sleep)
threshold=128, gain=255, DIGITAL (all-or-nothing)
```

High Coldness trips the involuntary Sleep locus directly — an emergency "fall asleep from cold" reflex. Sleepase is not involved in this path; it is a parallel, purely reflexive emergency route. Normal sleep goes through the decision lobe (emitter 1) and the asleep state (emitter 2); hypothermic sleep short-circuits straight to the involuntary action.

This clarifies the architectural role of Sleepase: it gates the *voluntary* / *natural* sleep transitions, leaving emergencies to separate, faster reflex arcs.

### Neuroemitter hooks

The stock genome does not include a neuroemitter for chemical 129 (the neuroemitter list has only one entry, wiring lobe-4 neuron 37 to Adrenalin / Crowded / Loneliness). All Sleepase generation therefore goes through the two biochemistry emitters above — no brain cells inject Sleepase directly at lobe activation time. A modder who wants *other* brain neurons (e.g. a boredom-gated drowsiness neuron) to trigger sleep can add a `CNeuroEmitter` gene that releases chemical 129 when those neurons fire.

### What a Norn without Sleepase looks like

Imagining the degenerate case is a good sanity check:

- Without Sleepase, gene 102 never fires, so the Sleepiness drive stays at zero throughout the creature's life. Tiredness still rises (gene 103 is independent), but the acute **urge** to sleep never builds.
- The Drives-tissue Sleepiness receptor (receptor id 8) stays at zero, so the decision lobe never sees the Sleepiness bar. Sleep can still happen via the Coldness → involuntary-action shortcut, but not voluntarily.
- The ASLEEP emitter cannot fire without the creature being asleep in the first place, so there is no compensating mechanism — an insomniac Norn.

This is in practice not observed in stock Norns because gene 42 is always on (switch-on age 0, switch-on stage Baby), but it demonstrates why Sleepase is the critical load-bearing chemical for voluntary sleep.

### How modders can rewire Sleepase

Several common modifications are seen in community genomes:

1. **Adjust the voluntary-sleep threshold** by changing the gain byte of emitter 1 (gene 42). Lowering gain to 20–30 means the creature needs many more neuron-40 firings before enough Sleepase accumulates to tip Sleepiness past the decision threshold — producing a more "resistant" Norn that refuses to nap unless very tired. Raising gain to 150+ produces a sleepy Norn that drops off at the slightest provocation.
2. **Shorten the asleep phase** by reducing the gain of emitter 2 (gene 43). With a smaller Sleepase pulse during sleep, the Sleepiness drive stays lower during the asleep state and the creature wakes sooner. This is useful for hyperactive Norn breeds.
3. **Add a Sleepase-sensing receptor** (e.g. on the decision lobe) to create "dream" behaviours that trigger only when Sleepase is elevated.
4. **Make Sleepase consumable** by rewriting gene 102 as `Sleepiness backup + Sleepase → Sleepiness` (drop the enzyme on the product side). The catalyst then becomes a fuel: a single Sleepase pulse only converts a fixed stoichiometric amount of backup. This turns sleep from a reservoir-exhaustion process into a strict pulse-count process and is typical of "pharmacological sleep aid" mods.
5. **Add environmental Sleepase injection via CA smells.** Docking Station's CA system includes "dusk" / "nighttime" CA values; a receptor that converts the dusk CA level into Sleepase creates genuine circadian behaviour without replacing the stock architecture.

### Practical consequences for gameplay

- **`CHEM 129 <high>` on a sleeping Norn extends sleep.** A single large CAOS injection floods the backup→active conversion and pushes active Sleepiness to 255; the creature will sleep until the backup reservoir finally drains. Useful in medical / ill-Norn-care scripts.
- **`CHEM 129 <high>` on an awake Norn does not instantly put it to sleep.** The reaction only converts existing *backup*; if Sleepiness backup is low (e.g. young, well-rested Norn) there is little to convert and active Sleepiness rises only slightly. Force-sleep requires `CHEM 155 <high>` directly.
- **Sleepase is invisible in the chemistry UI most of the time.** Because the chemical half-life is only 4 ticks, a still frame of the chemistry UI rarely shows any concentration — the enzyme effectively exists "between frames". The observable in-game signature is *not* a Sleepase bar but the **rapid rise of chemical 155 immediately after** the ASLEEP state is entered or after the decision-lobe sleep neuron fires.
- **"Insomniac" genetic disorders tend to map to gene 42.** A breeder observing a Norn that accumulates Tiredness but never takes voluntary naps should suspect an emitter gene on chemical 129 has been weakened or switched off — and indeed gene 42 is the usual suspect.

### Summary

```
 Voluntary-sleep path:                                  Stay-asleep path:
 ┌─────────────────────────────┐                       ┌────────────────────────────┐
 │ Brain decision lobe picks   │                       │ LifeFaculty.myState = ASLEEP│
 │ "sleep" action → neuron 40  │                       │  → myAsleepLocus = 1.0     │
 │  fires                      │                       │  → LOC_ASLEEP = 1          │
 └─────────────┬───────────────┘                       └───────────────┬────────────┘
               │ emitter gene 42                                       │ emitter gene 43
               │ (gain 68, DIGITAL)                                    │ (gain 77, DIGITAL)
               ▼                                                       ▼
        ┌───────────────────────────  Sleepase [129]  ──────────────────────────┐
        │  half-life 4 ticks (Very short) — the enzyme pulses and disappears   │
        └─────────────────────────────────┬─────────────────────────────────────┘
                                          │  catalyses (true catalyst)
                                          ▼
            ┌─────────────────────────────────────────────────────────────┐
            │  1× Sleepiness backup [138] + 1× Sleepase [129]              │
            │       → 1× Sleepiness [155] + 1× Sleepase [129]              │
            │  rate half-life 2 ticks ("Very short")                       │
            └─────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                          Sleepiness drive [155] rises
                                          │
                                          ▼
                   Drives-tissue receptor (id 8) reads it
                   → decision lobe sees "sleepy" → reinforces / maintains sleep
                                          │
                                          ▼ slow decay (gene 101, 11-tick half-life)
                          Sleepiness backup [138] (reservoir)
                                          │
                                          ▼ steady bleed (gene 103, 510-tick half-life)
                                 Tiredness [154]
```

Sleepase thus occupies a distinctive niche in the stock biochemistry: **a pure, transient catalyst whose pulsing controls when banked fatigue becomes a felt urge to sleep**. It has no initial concentration, no receptors, and a half-life short enough to exist only in brief pulses — yet it is the single load-bearing chemical linking the decision lobe's "I want to sleep" signal, the body's asleep state, and the Sleepiness drive the brain actually feels. Of the enzyme-style chemicals in the stock Norn genome, Sleepase is the cleanest example of a true catalytic pulse-gate, and it sits at the centre of the one piece of creature physiology — sleep — that is otherwise entirely autonomous from the player.
