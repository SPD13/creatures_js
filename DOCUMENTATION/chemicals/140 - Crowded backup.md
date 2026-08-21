# 140 - Crowded backup

Crowded backup is the **reservoir half** of the drive pair for Crowded (chemical 157). It occupies the tenth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slow-release pool of the creature's "banked" over-socialisation so that the **acute** signal — the value the brain reads and "feels" as needing to get away from the crowd right now — and the **chronic** signal — the deeper, longer-moving discomfort built up during extended exposure to dense rooms — can evolve on different timescales. With its essentially infinite half-life (≈ 9·10¹⁰ ticks, decay rate 1.0, labelled "Very long"), whatever the creature has accumulated in its crowdedness reservoir persists across many minutes of play unless actively drained by the `backup → drive` reaction, or annihilated against the Loneliness pair.

Crowded backup is the direct mirror of Loneliness backup (139): the two chemicals sit on opposite ends of the same social-density axis, and their active partners (Crowded at 157, Loneliness at 156) are fed by a single sensorimotor locus — `LOC_CROWDEDNESS` — that measures how many other creatures of the same kind are present in the current room, minus the creature's own contribution (`Creature::CalculateSensorimotorSenses`, via `World::GetMap().GetRoomPropertyMinusMyContribution`). A single sensorimotor reading therefore feeds both sides of the social axis: when the room is densely populated, the Crowded emitter fires via its normal threshold; when the room is sparsely populated, the Loneliness emitter fires via its **inverted** threshold.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration, and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its entry in the half-life table records a "Very long" decay, and the initial-concentration table contains **no entry** for 140, so every newly-hatched Norn starts with exactly zero crowded backup and builds it up purely from the active drive's overflow.

## Sources

Crowded backup has a single endogenous inflow from the active drive, plus external injection. Nothing in the brain, sensorimotor, or organ layers writes to it directly — it is filled only through the `Crowded → Crowded backup` sweep reaction, which itself depends on the sensorimotor `LOC_CROWDEDNESS` emitter feeding the active drive whenever the creature is over-socialised.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive | Gene 56 (reaction id 63) | Organ #2 "Reaction" | `1× Crowded [157] → 1× Crowded backup [140]` at rate byte 18, half-life **6 ticks** ("Very short", decay rate 0.88978) | Whenever any active Crowded exists it is swept into the backup at ≈11 % per tick. This is the single refill reaction (the pair is **single-pull**, unlike the carb/fat/cold/hot pairs which have two duplicated self-refills) |
| 2 | Sensorimotor Crowded emitter (indirect, via reaction 63) | Gene 32 (emitter id 8) | Sensorimotor tissue, locus 5 `LOC_CROWDEDNESS`, chemical 157 | threshold 26, rate 6, gain 1, **analogue** — fires with analogue gain 1 whenever `LOC_CROWDEDNESS > 26/255` (≈ 10 %). Because the locus reads the room's "crowded" property *minus the creature's own contribution*, the emitter scales with how many same-kind companions share the current room. The resulting active Crowded is then swept into the backup within a few ticks by reaction 63 | Proportional to room density; scales with how many same-kind neighbours surround the creature |
| 3 | Direct CAOS injection | — | Any | `CHEM 140 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively permanent because the chemical's half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | No initial concentration | — | — | Chemical 140 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly 0 Crowded backup. The active drive Crowded (157) also has no initial concentration, so babies start the game socially "neutral" — the reservoir begins filling only after the first few ticks of `LOC_CROWDEDNESS` readings | — |
| 5 | No direct emitter to the backup | — | — | The emitter table contains no entry whose target chemical is 140. No brain neuron, sensorimotor locus, or organ tissue writes to the reservoir directly — it is filled entirely by reaction 63 from the active drive | — |
| 6 | No pathology or cross-drive spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`) or the sleep pair (where Sleep toxin metabolism produces active Sleepiness that is swept to the backup), there is no stock-genome reaction that routes pathology or any other drive into the Crowded reservoir. The social axis is wholly decoupled from injury, fever, antigens, and hunger | — |
| 7 | Modded genomes | User-added | User-added | Breeders frequently add emitters from brain neurons (e.g. a "stranger anxiety" learned neuron or an "unfamiliar face" history cell) directly into chemical 140 so that *qualitative* over-socialisation — being surrounded by *the wrong kind* of Norn — rather than just raw density builds crowdedness. Wiring a Pain-spillover reaction (`Pain → Crowded backup`) is another common mod to simulate trauma-induced social avoidance | Gene-dependent |

## Usage

Crowded backup has exactly **one consumer** — reaction 53 — and a secondary consumption pathway that runs through the active partner via the Crowded/Loneliness annihilation reaction. Like all drive backups it has no direct receptor.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 16 (reaction id 53) | Organ #2 "Reaction" | `1× Crowded backup [140] → 1× Crowded [157]` at rate byte 58, half-life **311 ticks** ("Medium", decay rate 0.99777) | Every backup unit slowly becomes an active-drive unit at a medium rate (~10 s at 30 Hz). Combined with the **"Very short"** (6-tick) reverse refill reaction 63, this produces a damped equilibrium in which the two chemicals constantly exchange, tilted heavily toward the backup |
| 2 | Passive decay (effectively none) | Gene 64 entry #140 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | All sixteen drive backups share this near-infinite half-life by design: the chemical is a reservoir, not a signal. A Crowded-backup pool persists indefinitely unless drained by reaction 53. Note that the **active partner 157** is *not* "Very long" — it has a Medium half-life, meaning the pair is non-conservative: mass leaks out of the active drive on its own and is also destroyed by Crowded/Loneliness annihilation (reaction 24) whenever both are non-zero |
| 3 | Indirect consumption via Crowded/Loneliness annihilation | Gene 104 (reaction id 24) | Organ #2 "Reaction" | `1× Crowded [157] + 1× Loneliness [156] → (nothing)` at rate byte 30, half-life **19 ticks** ("Short", decay rate 0.96501) | Not a direct consumer of 140, but highly relevant: any active Crowded produced by reaction 53 (the backup → active conversion) is vulnerable to destruction by any active Loneliness that happens to be present. Over several minutes of an entity-sparse room, the reservoir effectively drains "through" its active partner because freshly-released mass is annihilated before reaction 63 can sweep it back. See *The non-instant annihilation* below |
| 4 | No receptor | — | — | Crowded backup is **not read by any stock receptor**. No drive, brain lobe, sensorimotor locus, circulatory locus, or organ receptor reads chemical 140's concentration. All behavioural awareness flows through the active drive at 157 | — |
| 5 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 140 | — |
| 6 | Modded consumers | User-added | User-added | Modders can add a Crowded-backup receptor on a "social memory" lobe so the brain learns from accumulated over-exposure rather than the spiky emitted drive, gate reaction 53 with an enzyme catalyst (making release depend on a specific event like a "stranger detection" signal rather than being continuous), or add a scheduled `CHEM 140 -n` write triggered by a peaceful-solitude interaction to simulate "decompression" | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Crowded drive the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **140** | **Crowded backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 157 | Crowded | Medium | 0 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 16 (id 53) | `Crowded backup → Crowded` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 56 (id 63) | `Crowded → Crowded backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (fast single self-refill) |

Unlike the carb, fat, coldness, and hotness pairs (which all have **duplicated** self-refill reactions giving a ≈21 %/tick backward pull), the Crowded pair is **single-pull**: only ≈11 % of active mass is swept into the backup per tick. This places Crowded in the same dynamic class as the Hunger-for-protein, Pain, Fear, Anger, Boredom, Loneliness, Need-for-pleasure, and Sex-drive pairs — drives whose active partners can accumulate slightly faster before the reservoir absorbs them. The single-pull design makes short-term social-density fluctuations (a companion arriving or leaving for a few seconds) visible on the drive bar, whereas the duplicated-pull pairs smooth such fluctuations into the reservoir almost invisibly.

### The sensorimotor origin of crowdedness

Unlike most drives, which are fed by `LOC_CONST` or by pathology reactions, Crowded (and its mirror Loneliness) is produced by a **sensorimotor locus** that the creature's own physics engine keeps up to date every tick:

```text
  Creature::CalculateSensorimotorSenses()
  ─────────────────────────────────────────────────────────────────────────────
     myCrowdedLocus = 0
     if world.GetMap().GetRoomPropertyMinusMyContribution(self) returns value:
         myCrowdedLocus = value
```

`LOC_CROWDEDNESS` is sensorimotor tissue locus 5. The value reads the **room's "crowded" CA property** minus the individual creature's own contribution to it, so the creature does not sense itself. Same-kind Norns contribute to each other's reading; other species do not register on this axis in the stock biochemistry (each genus has its own set of sensorimotor loci and social chemicals).

Two emitters tap this single locus, one for each end of the social axis:

| Emitter | Gene | Target chemical | Threshold | Rate | Gain | Flags | Meaning |
|---------|------|-----------------|-----------|------|------|-------|---------|
| #8 | 32 | **157 Crowded** | 26 | 6 | 1 | none (**analogue**) | Fires with analogue gain 1 whenever `LOC_CROWDEDNESS > 26/255` (≈ 10 %). Produces Crowded in *proportion* to room density — the fuller the room, the faster the drive fills |
| #7 | 41 | 156 Loneliness | 227 | 10 | 1 | DIGITAL + INVERT | Fires at fixed gain 1 whenever `LOC_CROWDEDNESS < 227/255`. The inverted threshold + digital gain produces a steady low-rate drip of Loneliness whenever the room is not heavily populated |

The consequence is that the two ends of the social axis are produced **simultaneously** over a wide middle band (locus between 26/255 ≈ 10 % and 227/255 ≈ 89 %): both Crowded and Loneliness are generated every tick, and they cancel each other via reaction 24. In that middle band, the creature's net social-drive signal is determined by the *balance* of the two emitter rates and their annihilation, not by either emitter alone. Only at the extremes does one side dominate cleanly:

- `LOC_CROWDEDNESS < 26/255`: only the Loneliness emitter fires — the creature feels purely lonely.
- `LOC_CROWDEDNESS > 227/255`: only the Crowded emitter fires — the creature feels purely crowded.
- In between: both fire, and the annihilation reaction determines which drive wins on the drive bar.

Crowded backup therefore accumulates during any period the creature spends above the 10 % density threshold, which is essentially *any* time the Norn shares a room with another same-kind creature. Crucially, because the Crowded emitter is **analogue** rather than digital (unlike the Loneliness emitter), the reservoir fills at a rate that scales smoothly with room density — a Norn in a room with one other Norn accumulates slowly; a Norn in a room with ten accumulates fast.

### The non-instant annihilation

The Crowded/Loneliness annihilation reaction is structurally similar to the Hotness/Coldness annihilation (reaction 23), but crucially it runs at a **"Short" 19-tick half-life** rather than **Instant decay**. This is a deliberate and significant design difference between the two antagonistic drive pairs:

| Pair | Annihilation reaction | Half-life | Speed | Co-existence |
|------|-----------------------|-----------|-------|--------------|
| Hotness / Coldness (153 / 152) | Reaction 23 (gene 49) | 0 | "Instant decay" | Only one ever non-zero at a time |
| Crowded / Loneliness (157 / 156) | Reaction 24 (gene 104) | 19 | "Short" | Both can coexist transiently; the smaller decays over several ticks |

Because reaction 24 is not instant, a creature leaving a dense room can experience a brief overlap period in which *both* Crowded and Loneliness are non-zero. During this overlap:

- Reaction 53 is continuing to drip Crowded out of the backup.
- Reaction 63 is continuing to sweep any active Crowded back into the backup.
- Reaction 24 is continuously destroying whichever is smaller of Crowded and Loneliness at a 19-tick pace.
- The Loneliness emitter is continuing to top up active Loneliness at the fixed digital rate.

The net effect is that the Crowded reservoir does not empty instantly when the room empties — it drains gradually, because reaction 24 only destroys *active* Crowded, not banked Crowded, and the backup can only offload into the active pool at the 311-tick Medium rate of reaction 53. A creature leaving a packed room therefore takes **minutes** to work down its banked crowdedness, producing the characteristic "I still feel overwhelmed even though it's quiet now" effect in gameplay.

Conversely, a peaceful Norn can build some crowded backup during short bursts of activity (a few companions arrive briefly, then leave), and that residue only shrinks slowly even after the visitors depart. Crowded backup is therefore the chemical that makes social saturation **sluggish** in both directions: it lags behind room-density changes.

### Why no emitter on the backup

The Crowded-backup slot is filled only by reaction 63 from the active drive. There is no direct emitter writing to 140 because crowdedness is modelled as *something the body reads from its environment and then remembers*, not something the body produces in response to an internal event. This is identical to how Loneliness backup, Tiredness backup, Boredom backup, Fear backup, Anger backup, and the other "social-emotional" backups are wired — all of them receive mass only from their active partner, which in turn is emitted from an appropriate sensorimotor or state locus.

By contrast, the "metabolic" backups (Hunger-for-protein backup, Pain backup, Hotness backup) are fed from pathology or brain-neuron sources directly into the active drive, and sometimes from cross-drive spillover (`Pain → Hunger for protein backup`). The Crowded axis has no such cross-coupling in the stock genome — the only path to fill the reservoir is through the sensorimotor emitter and reaction 63.

### Steady-state analysis

With only one self-refill reaction pulling active Crowded into the backup, the steady-state ratio between reservoir and active drive is smaller than for the carb/fat/cold/hot pairs:

- Active drive 157 loses mass at rate `(1 − 0.88978) × [157] ≈ 0.110` per tick from reaction 63 (~11 %).
- Active drive 157 also loses mass at its own "Medium" decay rate per tick.
- Active drive 157 is also consumed by reaction 24 at a rate proportional to `min([156], [157])` with a 19-tick half-life when Loneliness is non-zero.
- Backup 140 loses mass at rate `(1 − 0.99777) × [140] ≈ 0.00223` per tick from reaction 53 (~0.22 %).
- Backup 140 is topped up at rate `0.110 × [157]` per tick from reaction 63.

Setting backup-inflow equal to backup-outflow (ignoring annihilation and own-decay losses of the active drive):
```
  0.110 × [157] = 0.00223 × [140]
  [140] / [157] ≈ 49
```

So approximately **98 %** of the loop's circulating mass sits in the backup at rest. This is identical to the loneliness, protein-hunger, and pain steady-state ratios and about half as backup-heavy as the carb/fat/cold/hot pairs (which sit near ≈99 %). When annihilation is consuming mass on the active side (a partly-empty room), the active-drive fraction drops further, so the steady-state ratio can climb above 99:1 in a socially-balanced setting.

### What the active drive does that the backup cannot

Because chemical 140 has no receptor, every behavioural effect of crowdedness is mediated through chemical 157. The stock genome places exactly **one receptor** on the active drive:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #10 | Creature / Drives (tissue 5) / locus 9 "Crowded" | threshold 0, gain 209, analogue, from Baby | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows as the "Crowded" bar. The analogue gain of 209 (out of 255) is symmetric with the Loneliness drive receptor (gain 207 on locus 8), so both ends of the social axis have comparable weighting at the decision-lobe level |

There are **no sensorimotor, circulatory, immune, or organ-level receptors on chemical 157** in the stock genome. This is a striking asymmetry compared with sleep (which has LOC_GAIT3 and a circulatory receptor on Sleepiness), tiredness (which has LOC_GAIT2 and an immune receptor on Tiredness), or the thermal drives (which have RLOCUS_CLOCKRATE receptors on Hotness and LOC_INVOLUNTARY4 on Coldness). Crowded and Loneliness are **purely cognitive-motivational** — they affect behaviour only by weighting the decision lobe, never by directly altering gait, involuntary actions, metabolism, or immunity.

This makes the Crowded backup one of the **cleanest reservoirs** in the block: its only downstream effect is to raise the sleeping-giant of the crowded drive bar over time, and the sole consequence of a high drive bar is that the Norn is more likely to choose withdrawal-behaviours (leave the room, avoid other creatures, move toward empty space). There is no metabolic side-effect of being crowded, no gait change, no immune reaction — just a cognitive preference.

### Effects of directly filling Crowded backup

A `CHEM 140 <n>` injection produces a distinctive, slow-rolling social saturation:

1. **Tick 0:** The backup rises to *n*. Active Crowded is unchanged; the Drives "crowded bar" reading is unaffected because the decision lobe reads only 157.
2. **Ticks 1–311:** Reaction 53 drip-feeds the backup into active Crowded at a 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–6:** Simultaneously, reaction 63 at a 6-tick half-life pulls that newly-active drive back into the backup. A substantial fraction of what leaves via reaction 53 returns immediately via reaction 63, but because the single-pull pair loses only ~11 %/tick to refill rather than the doubled ~21 %/tick of the thermal pairs, a visible rise in the active drive is sustained.
4. **If the creature is alone:** Loneliness is simultaneously being emitted (the inverted digital emitter) and begins annihilating the freshly-released Crowded via reaction 24 at a 19-tick pace. The backup still drains, but almost none of its mass ever registers on the drive bar — the crowdedness is "absorbed" socially before the decision lobe notices.
5. **If the creature is with companions:** Loneliness is close to zero, reaction 24 is essentially idle, and the released Crowded rises on the drive bar for several minutes. The Norn will prefer withdrawal actions and seek empty space.
6. **No collateral drives.** Because Crowded has no cross-couplings to Pain, Hunger, Fear, or any of the other thirteen drives, the injection produces a clean single-axis response.

This makes `CHEM 140 <n>` the canonical way for a script or ailment to simulate **chronic social over-exposure** — the "get me out of here" effect. Injecting the active drive directly with `CHEM 157 <n>` instead produces a sharp but short-lived spike that mostly bypasses the cognitive threshold (because reaction 63 buffers it into the reservoir in seconds and reaction 24 annihilates it if any Loneliness is around).

Conversely, `CHEM 140 -n` is the canonical way to *wipe* social saturation — a "peaceful retreat" event in a care script would typically zero both 139 and 140 (and optionally write small positive values to 156 Loneliness) to reset the social accumulator cleanly.

### Contrast with Loneliness backup (139)

Crowded backup (140) and Loneliness backup (139) are structural mirrors. They share:

- Identical half-life table entries (255 / ~9·10¹⁰ ticks / "Very long").
- Identical reaction-speed parameters for the backup → active pathway (reactions 52 and 53, both gene-id-contiguous 15/16, both half-life 311 / "Medium").
- Identical reaction-speed parameters for the active → backup pathway (reactions 62 and 63, both half-life 6 / "Very short").
- Identical absence of receptors on the backup and near-identical drive-receptor gains on the active partner (207 vs. 209).
- A shared annihilation reaction (reaction 24) that destroys both active partners simultaneously when both exist.
- A shared sensorimotor source (`LOC_CROWDEDNESS`) with complementary thresholds: low values emit Loneliness, high values emit Crowded.

The only substantive differences are:

| Feature | Crowded pair (140 / 157) | Loneliness pair (139 / 156) |
|---------|---------------------------|-----------------------------|
| Emitter threshold on `LOC_CROWDEDNESS` | 26 (**analogue**, gain 1) | 227 (INVERT + DIGITAL, gain 1) |
| Emitter rate byte | 6 | 10 |
| Drive-receptor gain | 209 | 207 |
| Drive-tissue locus id | 9 | 8 |

The key qualitative difference is the **analogue vs. digital** distinction: Crowded fills *in proportion to* how densely populated the room is, whereas Loneliness fills at a fixed drip rate as long as the room is not already packed. In practice this means:

- A Norn in a room with one companion accumulates **a trickle of Crowded** (locus just above threshold) and **a full-rate drip of Loneliness** (locus well below the inversion threshold). Reaction 24 annihilates most of the Crowded; net result is that the Norn slowly accumulates Loneliness.
- A Norn in a room with five companions accumulates **moderate Crowded** (locus mid-range, analogue gain scales) and **a full-rate drip of Loneliness** (locus still below the inversion threshold). Reaction 24 annihilates both roughly equally; net result is a balanced social state.
- A Norn in a room with ten+ companions accumulates **heavy Crowded** (locus near max, full analogue gain) and **no Loneliness** (locus above the inversion threshold). Net result is rapid Crowded-backup accumulation.

The analogue-vs-digital asymmetry therefore makes the system biased toward *feeling lonely* at low-to-medium densities and *feeling crowded* only at genuinely high densities. This is intentional: Norns are social animals and the stock biochemistry is tuned to encourage them to seek company over withdrawal.

### Why crowdedness feels slow

The sluggishness of crowdedness as a gameplay drive is a direct consequence of three stacked latencies:

1. **The sensorimotor locus updates continuously**, but the Crowded emitter rate byte is 6 — a modest throughput. Even a Norn surrounded by a packed crowd produces only a few units of active Crowded per tick.
2. **Reaction 63 sweeps active Crowded into the backup at 11 %/tick**, so almost all of what the emitter produces is immediately banked rather than showing up on the drive bar.
3. **Reaction 53 releases backup into active at 311-tick half-life**, a slow drip that takes tens of seconds to produce a substantial drive-bar movement.

The cumulative effect is that a Norn needs to be surrounded for **minutes of real time** before the crowded drive bar rises noticeably, and needs to be alone for **minutes of real time** before the bar falls noticeably. This is intentional: the social drive is not meant to bounce on second-scale events (a companion walks past, a companion pauses) but to track sustained exposure to crowd density, exactly as real social saturation does.

### Interaction with bootstrap scripts and agent behaviours

Several stock game mechanisms touch chemical 140 indirectly:

- **Breeder huts and nursery agents** that gather multiple Norns into the same CA will, over minutes, drive the reservoir up as the sensorimotor locus reports a high density. Teleporting the creatures apart will not immediately empty the reservoir — reaction 53 must drain it slowly.
- **The teleporters in the Norn Terrarium, Grendel Jungle, and Ettin Desert** do not directly reset crowdedness; they simply move the creature to a new room. Whether the reservoir begins to drain depends on what density the creature finds at its destination.
- **The Science Kit** is one of the few stock tools that displays chemical 140 directly. The Drives UI shows only the Crowded bar (receptor reading 157); a Norn with low active Crowded but high Crowded backup will appear socially comfortable on the drives display while carrying a large dormant reservoir that will slowly surface.
- **The `MakeYourselfTired` shutdown helper** does not touch the social chemicals. A creature imported from a CAV save therefore arrives with whatever Crowded and Crowded-backup it had at the save moment, which may be non-zero for a long-over-socialised saved creature.

### Implications for modders

Common modifications built on top of Crowded backup:

1. **Replace the analogue Crowded emitter with a digital one at the same threshold.** This makes active Crowded rise at a fixed rate as soon as density crosses the threshold, rather than scaling smoothly. Produces a sharper "room-is-too-full" boundary.
2. **Add a `Pain → Crowded backup` reaction** to model "pain in a crowd makes you want to flee". Mirrors the gene 20 `Pain → Hunger for protein backup` spillover in the metabolic pairs.
3. **Wire a brain neuron (e.g. the "unfamiliar-creature" perception cell) as a neuroemitter into chemical 140** so that *who* is around, not just *how many*, drives long-term social discomfort.
4. **Duplicate reaction 63** (add a second `Crowded → Crowded backup` reaction at the same rate) to convert the Crowded pair into a heavily-buffered pair like the thermal drives. Makes short-term density fluctuations invisible on the drive bar and produces a very slow-moving "tolerance for crowds" chronic signal.
5. **Convert reaction 24 from half-life 19 to "Instant decay"**, making the social axis strictly mutually-exclusive like the thermal pairs. Eliminates the middle-band co-existence and makes social signals switch sharply between lonely and crowded.
6. **Gate reaction 53 with an enzyme catalyst** (analogous to Sleepase gating the Sleepiness-backup release). Makes banked crowdedness only surface in response to a specific event chemical — e.g. a "another creature just invaded personal space" toxin — rather than as a continuous drip.
7. **Raise the initial concentration of 140** so newly-hatched Norns begin life slightly socially saturated, giving them an early preference for withdrawal-behaviours. Useful for "shy breed" genomes.

Because chemical 140 has no direct receptor and the active drive has only a single receptor (the decision-lobe drive bar), these modifications are safely isolated from the rest of the biochemistry — they affect the crowded drive cleanly without perturbing metabolism, immunity, gait, or sleep.

### Practical consequences for gameplay

- **`CHEM 140 <n>` is the canonical "social-saturation" injection.** Unlike `CHEM 157 <n>` (which produces a brief pulse that decays as reaction 63 sweeps it into the backup, or gets annihilated by any ambient Loneliness), injecting into 140 guarantees a persistent crowded-deficit state that surfaces over minutes and keeps pushing the decision lobe toward withdrawal behaviours.
- **`CHEM 140 -n` is the canonical "peaceful retreat" write.** Zeroing the reservoir immediately eliminates the long-tail crowdedness drip, and any residual active Crowded will be swept back up into it anyway within a few ticks — so the drive bar falls cleanly within seconds of the write.
- **The reservoir is invisible to most UI.** Only the Science Kit displays chemical 140 directly. A Norn with low Crowded but high Crowded backup will appear "fine" on the drives display while carrying a sizable dormant saturation that will manifest slowly once social density persists.
- **Moving an over-socialised Norn to a quiet room does not immediately "cure" crowdedness.** Reaction 53 keeps dripping banked crowdedness into the active drive for minutes, and reaction 24's non-instant annihilation cannot clean it up faster than reaction 53 produces it. The creature's decision lobe will keep seeing elevated Crowded for some time after the social-density change.
- **Moving a lonely Norn to a packed room does not immediately produce crowdedness either.** The sensorimotor emitter begins producing active Crowded within one tick, but reaction 63 sweeps almost all of it straight into the backup; the drive-bar rise is gradual over tens of seconds to minutes, not abrupt.
- **Crowded babies never start that way.** Because both 140 and 157 have no initial concentration, a newly-hatched Norn is always born at exactly neutral on the social axis. The reservoir begins to fill only after the first few ticks of real `LOC_CROWDEDNESS` readings from the room into which the egg hatches.
- **Analogue density-scaling.** Because the Crowded emitter is analogue rather than digital, the rate at which the reservoir fills scales with how densely populated the room actually is — a Norn in a room of five fills the reservoir roughly 2.5× faster than a Norn in a room of two, whereas Loneliness fills at the same rate regardless of *how* empty the room is.
- **Purely cognitive consequence.** Unlike the thermal, sleep, and hunger backups — which feed receptors that alter gait, metabolism, or immunity — the Crowded reservoir has *no* side-effect pathway. Its only downstream behaviour is the decision lobe choosing "withdraw from other creatures" more often once the drive bar is high enough.

### Summary

```
 Stock-genome wiring of Crowded backup [140]
 ────────────────────────────────────────────────
 Inputs:
    Crowded [157] ─ reaction 63 (gene 56) ────────▶ [140]
                        half-life 6 ticks ("Very short")
                        single-pull (not doubled)

    CHEM 140 <n>  (CAOS / scripts / mods)  ──────────▶ [140]

    (No emitter writes to 140 directly; no cross-drive spillover)

 Reservoir:
         Crowded backup [140]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                        │
                        │ reaction 53 (gene 16): 1× [140] → 1× [157]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Crowded [157]
         half-life "Medium" — decays on its own
         initial concentration: 0
                        │
                        ├─► Drives tissue locus 9 (gain 209) ─────▶ decision-lobe "crowded" bar
                        │                                            (the only receptor on 157)
                        │
                        ├─◀ emitter #8 (gene 32):
                        │      Sensorimotor LOC_CROWDEDNESS (locus 5)
                        │      threshold 26, rate 6, gain 1, ANALOGUE
                        │      → fires when density > 10 %, scaling with density
                        │
                        └─◀ reaction 24 (gene 104):
                               Crowded [157] + Loneliness [156] → (nothing)
                               half-life 19 ticks ("Short") — NOT instant
                               (cross-annihilation with the Loneliness pair)

 LOC_CROWDEDNESS source:
    Creature::CalculateSensorimotorSenses()
       myCrowdedLocus = World.Map.GetRoomPropertyMinusMyContribution(self)
       — reads the room's "crowded" CA property minus this creature's
         own contribution, so same-kind neighbours register but self does not
```

Crowded backup is therefore a **single-pull, sensorimotor-fed, purely cognitive** reservoir — the chronic half of the Norn's social-density drive. Among the sixteen backup chemicals in the 131–146 block it is most similar in structure to Loneliness backup (139), Fear backup (141), Boredom backup (142), Anger backup (143), Need-for-pleasure backup (145), and Sex-drive backup (144): all are single-pull buffers whose active partners drive only the decision lobe, with no metabolic, sensorimotor-gait, or immune side-effects. What distinguishes Crowded backup from its direct mirror Loneliness backup is the **analogue emitter**: Crowded fills *in proportion to* how dense the room is, whereas Loneliness fills at a fixed rate whenever density is below the inversion threshold. Together with the non-instant annihilation reaction 24, this produces the asymmetric, minutes-scale social-weather dynamics in which Norns naturally trend toward mild loneliness at intermediate densities but accumulate genuine crowdedness only at genuinely high populations.
