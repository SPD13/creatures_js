# 139 - Loneliness backup

Loneliness backup is the **reservoir half** of the drive pair for Loneliness (chemical 156). It occupies the ninth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slow-release pool of the creature's "banked" isolation so that the **acute** signal — the value the brain reads and "feels" as needing company right now — and the **chronic** signal — the deeper, longer-moving loneliness built up during extended time spent alone — can evolve on different timescales. With its essentially infinite half-life (≈ 9·10¹⁰ ticks, decay rate 1.0, labelled "Very long"), whatever the creature has accumulated in its loneliness reservoir persists across many minutes of play unless actively drained by the `backup → drive` reaction, or annihilated against the Crowded pair.

Loneliness backup is the direct mirror of Crowded backup (140): the two chemicals sit on opposite ends of the same social-density axis, and their active partners (Loneliness at 156, Crowded at 157) are fed by a single sensorimotor locus — `LOC_CROWDEDNESS` — that measures how many other creatures of the same kind are present in the current room, minus the creature's own contribution (`Creature::CalculateSensorimotorSenses`, via `World::GetMap().GetRoomPropertyMinusMyContribution`). A single sensorimotor reading therefore feeds both sides of the social axis: when the room is sparsely populated, the Loneliness emitter fires via its **inverted** threshold; when the room is crowded, the Crowded emitter fires via its normal threshold.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration, and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its entry in the half-life table records a "Very long" decay, and the initial-concentration table contains **no entry** for 139, so every newly-hatched Norn starts with exactly zero loneliness backup and builds it up purely from the active drive's overflow.

## Sources

Loneliness backup has a single endogenous inflow from the active drive, plus external injection. Nothing in the brain, sensorimotor, or organ layers writes to it directly — it is filled only through the `Loneliness → Loneliness backup` sweep reaction, which itself depends on the sensorimotor `LOC_CROWDEDNESS` emitter feeding the active drive whenever the creature is under-socialised.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive | Gene 43 (reaction id 62) | Organ #2 "Reaction" | `1× Loneliness [156] → 1× Loneliness backup [139]` at rate byte 18, half-life **6 ticks** ("Very short", decay rate 0.88978) | Whenever any active Loneliness exists it is swept into the backup at ≈11 % per tick. This is the single refill reaction (the pair is **single-pull**, unlike the carb/fat/cold/hot pairs which have two duplicated self-refills) |
| 2 | Sensorimotor Loneliness emitter (indirect, via reaction 62) | Gene 41 (emitter id 7) | Sensorimotor tissue, locus 5 `LOC_CROWDEDNESS`, chemical 156 | threshold 227, rate 10, gain 1, **DIGITAL + INVERT** — fires at fixed gain 1 whenever `LOC_CROWDEDNESS < 227/255` (≈ 89 %). Because the locus reads the room's "crowded" property *minus the creature's own contribution*, the emitter fires for virtually any Norn who is not currently surrounded by many same-kind companions. The resulting active Loneliness is then swept into the backup within a few ticks by reaction 62 | Effectively continuous, low-rate; scales with how long the creature spends with few or no neighbours |
| 3 | Direct CAOS injection | — | Any | `CHEM 139 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively permanent because the chemical's half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | No initial concentration | — | — | Chemical 139 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly 0 Loneliness backup. The active drive Loneliness (156) also has no initial concentration, so babies start the game socially "neutral" — the reservoir begins filling only after the first few ticks of `LOC_CROWDEDNESS` readings |  — |
| 5 | No direct emitter to the backup | — | — | The emitter table contains no entry whose target chemical is 139. No brain neuron, sensorimotor locus, or organ tissue writes to the reservoir directly — it is filled entirely by reaction 62 from the active drive |  — |
| 6 | No pathology or cross-drive spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`) or the sleep pair (where Sleep toxin metabolism produces active Sleepiness that is swept to the backup), there is no stock-genome reaction that routes pathology or any other drive into the Loneliness reservoir. The social axis is wholly decoupled from injury, fever, antigens, and hunger | — |
| 7 | Modded genomes | User-added | User-added | Breeders frequently add emitters from brain neurons (e.g. a "missing my mate" learned neuron or a "lost a companion" history cell) directly into chemical 139 so that *events* rather than just ambient density build loneliness. Wiring a Pain-spillover reaction (`Pain → Loneliness backup`) is another common mod to simulate social trauma. A particularly popular mod adds an emitter keyed to the "last hatched with" registry to make loneliness scale with time-since-sibling-contact | Gene-dependent |

## Usage

Loneliness backup has exactly **one consumer** — reaction 52 — and a secondary consumption pathway that runs through the active partner via the Crowded/Loneliness annihilation reaction. Like all drive backups it has no direct receptor.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 15 (reaction id 52) | Organ #2 "Reaction" | `1× Loneliness backup [139] → 1× Loneliness [156]` at rate byte 58, half-life **311 ticks** ("Medium", decay rate 0.99777) | Every backup unit slowly becomes an active-drive unit at a medium rate (~10 s at 30 Hz). Combined with the **"Very short"** (6-tick) reverse refill reaction 62, this produces a damped equilibrium in which the two chemicals constantly exchange, tilted heavily toward the backup |
| 2 | Passive decay (effectively none) | Gene 64 entry #139 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | All sixteen drive backups share this near-infinite half-life by design: the chemical is a reservoir, not a signal. A Loneliness-backup pool persists indefinitely unless drained by reaction 52. Note that the **active partner 156** is *not* "Very long" — it has a 563-tick Medium half-life (decay rate 0.99877), meaning the pair is non-conservative: mass leaks out of the active drive on its own and is also destroyed by Crowded/Loneliness annihilation (reaction 24) whenever both are non-zero |
| 3 | Indirect consumption via Crowded/Loneliness annihilation | Gene 104 (reaction id 24) | Organ #2 "Reaction" | `1× Crowded [157] + 1× Loneliness [156] → (nothing)` at rate byte 30, half-life **19 ticks** ("Short", decay rate 0.96501) | Not a direct consumer of 139, but highly relevant: any active Loneliness produced by reaction 52 (the backup → active conversion) is vulnerable to destruction by any active Crowded that happens to be present. Over several minutes of an entity-dense room, the reservoir effectively drains "through" its active partner because freshly-released mass is annihilated before reaction 62 can sweep it back. See *The non-instant annihilation* below |
| 4 | No receptor | — | — | Loneliness backup is **not read by any stock receptor**. No drive, brain lobe, sensorimotor locus, circulatory locus, or organ receptor reads chemical 139's concentration. All behavioural awareness flows through the active drive at 156 | — |
| 5 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 139 | — |
| 6 | Modded consumers | User-added | User-added | Modders can add a Loneliness-backup receptor on a "social memory" lobe so the brain learns from accumulated isolation rather than the spiky emitted drive, gate reaction 52 with an enzyme catalyst (making release depend on a specific event like a mate-loss signal rather than being continuous), or add a scheduled `CHEM 139 -n` write triggered by a companion interaction to simulate "friendship healing" | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Loneliness drive the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **139** | **Loneliness backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 156 | Loneliness | 563 ticks ("Medium") | 0 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 15 (id 52) | `Loneliness backup → Loneliness` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 43 (id 62) | `Loneliness → Loneliness backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (fast single self-refill) |

Unlike the carb, fat, coldness, and hotness pairs (which all have **duplicated** self-refill reactions giving a ≈21 %/tick backward pull), the Loneliness pair is **single-pull**: only ≈11 % of active mass is swept into the backup per tick. This places Loneliness in the same dynamic class as the Hunger-for-protein, Pain, Fear, Anger, Boredom, Need-for-pleasure, and Sex-drive pairs — drives whose active partners can accumulate slightly faster before the reservoir absorbs them. The single-pull design makes short-term social-density fluctuations (a companion arriving or leaving for a few seconds) visible on the drive bar, whereas the duplicated-pull pairs smooth such fluctuations into the reservoir almost invisibly.

### The sensorimotor origin of loneliness

Unlike most drives, which are fed by `LOC_CONST` or by pathology reactions, Loneliness (and its mirror Crowded) is produced by a **sensorimotor locus** that the creature's own physics engine keeps up to date every tick:

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
| #7 | 41 | **156 Loneliness** | 227 | 10 | 1 | **DIGITAL + INVERT** | Fires at fixed gain 1 whenever `LOC_CROWDEDNESS < 227/255`. The inverted threshold + digital gain means: if the creature is *not* in a heavily-populated room, produce a steady low-rate drip of Loneliness |
| #8 | 32 | 157 Crowded | 26 | 6 | 1 | none (analogue) | Fires whenever `LOC_CROWDEDNESS > 26/255`, scaling analogue gain of 1 with the locus value. Produces Crowded in proportion to room density |

The consequence is that the two ends of the social axis are produced **simultaneously** over a wide middle band (locus between 26/255 ≈ 10 % and 227/255 ≈ 89 %): both Loneliness and Crowded are generated every tick, and they cancel each other via reaction 24. In that middle band, the creature's net social-drive signal is determined by the *balance* of the two emitter rates and their annihilation, not by either emitter alone. Only at the extremes does one side dominate cleanly:

- `LOC_CROWDEDNESS < 26/255`: only the Loneliness emitter fires — the creature feels purely lonely.
- `LOC_CROWDEDNESS > 227/255`: only the Crowded emitter fires — the creature feels purely crowded.
- In between: both fire, and the annihilation reaction determines which drive wins on the drive bar.

Loneliness backup therefore accumulates during **any** period the creature spends below the 89 % density threshold, which is virtually all of ordinary Norn life. The reservoir quietly builds whenever the brain is deciding "I would like company" even if the decision-lobe drive bar is being partly cancelled by simultaneous Crowded production.

### The non-instant annihilation

The Crowded/Loneliness annihilation reaction is structurally similar to the Hotness/Coldness annihilation (reaction 23), but crucially it runs at a **"Short" 19-tick half-life** rather than **Instant decay**. This is a deliberate and significant design difference between the two antagonistic drive pairs:

| Pair | Annihilation reaction | Half-life | Speed | Co-existence |
|------|-----------------------|-----------|-------|--------------|
| Hotness / Coldness (153 / 152) | Reaction 23 (gene 49) | 0 | "Instant decay" | Only one ever non-zero at a time |
| Crowded / Loneliness (157 / 156) | Reaction 24 (gene 104) | 19 | "Short" | Both can coexist transiently; the smaller decays over several ticks |

Because reaction 24 is not instant, a creature entering a moderately-populated room can experience a brief overlap period in which *both* Loneliness and Crowded are non-zero. During this overlap:

- Reaction 52 is continuing to drip Loneliness out of the backup.
- Reaction 62 is continuing to sweep any active Loneliness back into the backup.
- Reaction 24 is continuously destroying whichever is smaller of Loneliness and Crowded at a 19-tick pace.
- The Crowded emitter is continuing to top up active Crowded at a rate proportional to room density.

The net effect is that the Loneliness reservoir does not empty instantly when a companion arrives — it drains gradually, because reaction 24 only destroys *active* Loneliness, not banked Loneliness, and the backup can only offload into the active pool at the 311-tick Medium rate of reaction 52. A lonely Norn who is suddenly surrounded by friends therefore takes **minutes** to work down its banked loneliness, producing the characteristic "it takes time to feel socially satisfied again" effect in gameplay.

Conversely, a well-socialised Norn can build some loneliness backup during short interruptions (the companions leave the room for a few seconds), and that residue only shrinks slowly even after the companions return. Loneliness backup is therefore the chemical that makes social satisfaction **sluggish** in both directions: it lags behind room-density changes.

### Why no emitter on the backup

The Loneliness-backup slot is filled only by reaction 62 from the active drive. There is no direct emitter writing to 139 because loneliness is modelled as *something the body reads from its environment and then remembers*, not something the body produces in response to an internal event. This is identical to how Tiredness backup, Boredom backup, Fear backup, Anger backup, and the other "social-emotional" backups are wired — all of them receive mass only from their active partner, which in turn is emitted from an appropriate sensorimotor or state locus.

By contrast, the "metabolic" backups (Hunger-for-protein backup, Pain backup, Hotness backup) are fed from pathology or brain-neuron sources directly into the active drive, and sometimes from cross-drive spillover (`Pain → Hunger for protein backup`). The Loneliness axis has no such cross-coupling in the stock genome — the only path to fill the reservoir is through the sensorimotor emitter and reaction 62.

### Steady-state analysis

With only one self-refill reaction pulling active Loneliness into the backup, the steady-state ratio between reservoir and active drive is smaller than for the carb/fat/cold/hot pairs:

- Active drive 156 loses mass at rate `(1 − 0.88978) × [156] ≈ 0.110` per tick from reaction 62 (~11 %).
- Active drive 156 also loses mass at rate `(1 − 0.99877) × [156] ≈ 0.00123` per tick from its own Medium decay (~0.12 %).
- Active drive 156 is also consumed by reaction 24 at a rate proportional to `min([156], [157])` with a 19-tick half-life when Crowded is non-zero.
- Backup 139 loses mass at rate `(1 − 0.99777) × [139] ≈ 0.00223` per tick from reaction 52 (~0.22 %).
- Backup 139 is topped up at rate `0.110 × [156]` per tick from reaction 62.

Setting backup-inflow equal to backup-outflow (ignoring annihilation and own-decay losses of the active drive):
```
  0.110 × [156] = 0.00223 × [139]
  [139] / [156] ≈ 49
```

So approximately **98 %** of the loop's circulating mass sits in the backup at rest. This is identical to the protein-hunger and pain steady-state ratios and about half as backup-heavy as the carb/fat/cold/hot pairs (which sit near ≈99 %). When annihilation is consuming mass on the active side (a partly-crowded room), the active-drive fraction drops further, so the steady-state ratio can climb above 99:1 in a socially-balanced setting.

### What the active drive does that the backup cannot

Because chemical 139 has no receptor, every behavioural effect of loneliness is mediated through chemical 156. The stock genome places exactly **one receptor** on the active drive:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #9 (gene 8) | Creature / Drives (tissue 5) / locus 8 "Loneliness" | threshold 0, gain 207, analogue, from Baby | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows as the "Loneliness" bar. The analogue gain of 207 (out of 255) is symmetric with the Crowded drive receptor (gain 209 on locus 9), so both ends of the social axis have comparable weighting at the decision-lobe level |

There are **no sensorimotor, circulatory, immune, or organ-level receptors on chemical 156** in the stock genome. This is a striking asymmetry compared with sleep (which has LOC_GAIT3 and a circulatory receptor on Sleepiness), tiredness (which has LOC_GAIT2 and an immune receptor on Tiredness), or the thermal drives (which have RLOCUS_CLOCKRATE receptors on Hotness and LOC_INVOLUNTARY4 on Coldness). Loneliness and Crowded are **purely cognitive-motivational** — they affect behaviour only by weighting the decision lobe, never by directly altering gait, involuntary actions, metabolism, or immunity.

This makes the Loneliness backup one of the **cleanest reservoirs** in the block: its only downstream effect is to raise the sleeping-giant of the loneliness drive bar over time, and the sole consequence of a high drive bar is that the Norn is more likely to choose social actions (approach another creature, perform a "come here" gesture, seek out kin). There is no metabolic side-effect of being lonely, no gait change, no immune reaction — just a cognitive preference.

### Effects of directly filling Loneliness backup

A `CHEM 139 <n>` injection produces a distinctive, slow-rolling social hunger:

1. **Tick 0:** The backup rises to *n*. Active Loneliness is unchanged; the Drives sleepiness-style "loneliness bar" reading is unaffected because the decision lobe reads only 156.
2. **Ticks 1–311:** Reaction 52 drip-feeds the backup into active Loneliness at a 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–6:** Simultaneously, reaction 62 at a 6-tick half-life pulls that newly-active drive back into the backup. A substantial fraction of what leaves via reaction 52 returns immediately via reaction 62, but because the single-pull pair loses only ~11 %/tick to refill rather than the doubled ~21 %/tick of the thermal pairs, a visible rise in the active drive is sustained.
4. **If the creature is with companions:** Crowded is simultaneously being emitted and begins annihilating the freshly-released Loneliness via reaction 24 at a 19-tick pace. The backup still drains, but almost none of its mass ever registers on the drive bar — the loneliness is "absorbed" socially before the decision lobe notices.
5. **If the creature is alone:** Crowded is close to zero (only a trickle from the ambient-locus baseline), reaction 24 is essentially idle, and the released Loneliness rises on the drive bar for several minutes. The Norn will prefer social actions and seek other creatures.
6. **No collateral drives.** Because Loneliness has no cross-couplings to Pain, Hunger, Fear, or any of the other thirteen drives, the injection produces a clean single-axis response.

This makes `CHEM 139 <n>` the canonical way for a script or ailment to simulate **chronic social isolation** — the "home-sickness" effect. Injecting the active drive directly with `CHEM 156 <n>` instead produces a sharp but short-lived spike that mostly bypasses the cognitive threshold (because reaction 62 buffers it into the reservoir in seconds and reaction 24 annihilates it if any Crowded is around).

Conversely, `CHEM 139 -n` is the canonical way to *wipe* social history — a "just-met friend" event in a care script would typically zero both 139 and 140 (and optionally write small positive values to 157 Crowded) to reset the social accumulator cleanly.

### Contrast with Crowded backup (140)

Loneliness backup (139) and Crowded backup (140) are structural mirrors. They share:

- Identical half-life table entries (255 / ~9·10¹⁰ ticks / "Very long").
- Identical reaction-speed parameters for the backup → active pathway (reactions 52 and 53, both gene-id-contiguous 15/16, both half-life 311 / "Medium").
- Identical reaction-speed parameters for the active → backup pathway (reactions 62 and 63, both half-life 6 / "Very short").
- Identical absence of receptors on the backup and near-identical drive-receptor gains on the active partner (207 vs. 209).
- A shared annihilation reaction (reaction 24) that destroys both active partners simultaneously when both exist.
- A shared sensorimotor source (`LOC_CROWDEDNESS`) with complementary thresholds: low values emit Loneliness, high values emit Crowded.

The only substantive differences are:

| Feature | Loneliness pair (139 / 156) | Crowded pair (140 / 157) |
|--------|------------------------------|--------------------------|
| Emitter threshold on `LOC_CROWDEDNESS` | 227 (**INVERT + DIGITAL**, gain 1) | 26 (analogue, gain 1) |
| Emitter rate byte | 10 | 6 |
| Drive-receptor gain | 207 | 209 |
| Drive-tissue locus id | 8 | 9 |

The two pairs are therefore **symmetric but distinguishable**: a creature with no neighbours has its Loneliness-backup reservoir filling via the continuous inverted digital emitter; a creature packed into a ten-Norn biome has its Crowded-backup reservoir filling via the analogue density-scaled emitter. Because both emitters fire for most realistic densities, the *direction* of the net social signal is determined by the continuous balance between the two — and the reservoirs accumulate on whichever side is winning at any given moment.

### Why loneliness feels slow

The sluggishness of loneliness as a gameplay drive is a direct consequence of three stacked latencies:

1. **The sensorimotor locus updates continuously**, but the Loneliness emitter is digital-fixed-gain at 1/255 per tick — a very low trickle. Even a Norn alone for the whole day produces only a modest amount of active Loneliness per tick.
2. **Reaction 62 sweeps active Loneliness into the backup at 11 %/tick**, so almost all of what the emitter produces is immediately banked rather than showing up on the drive bar.
3. **Reaction 52 releases backup into active at 311-tick half-life**, a slow drip that takes tens of seconds to produce a substantial drive-bar movement.

The cumulative effect is that a Norn needs to be alone for **minutes of real time** before the loneliness drive bar rises noticeably, and needs to be with companions for **minutes of real time** before the bar falls noticeably. This is intentional: the social drive is not meant to bounce on second-scale events (a companion walks past, a companion pauses) but to track sustained exposure to crowd density, exactly as real social satisfaction does.

### Interaction with bootstrap scripts and agent behaviours

Several stock game mechanisms touch chemical 139 indirectly:

- **The Pickup agent family** and other "hand-held" mechanisms that carry a Norn into an empty CA will, over minutes, drive the reservoir up as the sensorimotor locus reports no nearby kin. Dropping the creature back into a family CA will not immediately empty the reservoir — reaction 52 must drain it slowly.
- **The teleporters in the Norn Terrarium, Grendel Jungle, and Ettin Desert** do not directly reset loneliness; they simply move the creature to a new room. Whether the reservoir begins to drain depends on what density the creature finds at its destination.
- **The Science Kit** is one of the few stock tools that displays chemical 139 directly. The Drives UI shows only the Loneliness bar (receptor reading 156); a Norn with low active Loneliness but high Loneliness backup will appear socially content on the drives display while carrying a large dormant reservoir that will slowly surface.
- **The `MakeYourselfTired` shutdown helper** does not touch the social chemicals. A creature imported from a CAV save therefore arrives with whatever Loneliness and Loneliness-backup it had at the save moment, which may be non-zero for a long-isolated saved creature.

### Implications for modders

Common modifications built on top of Loneliness backup:

1. **Replace the DIGITAL + INVERT Loneliness emitter with an analogue INVERT emitter.** This makes active Loneliness rise smoothly in proportion to "how alone" the creature is rather than either-fires-or-not at a binary threshold. Produces a more graded social-hunger profile.
2. **Add a `Pain → Loneliness backup` reaction** to model "pain makes you want comfort". Mirrors the gene 20 `Pain → Hunger for protein backup` spillover in the metabolic pairs.
3. **Wire a brain neuron (e.g. the "learned-attachment" memory cell) as a neuroemitter into chemical 139** so that specific relationships, rather than just ambient density, drive long-term social need.
4. **Duplicate reaction 62** (add a second `Loneliness → Loneliness backup` reaction at the same rate) to convert the Loneliness pair into a heavily-buffered pair like the thermal drives. Makes short-term social fluctuations invisible on the drive bar and produces a very slow-moving "family bond" chronic signal.
5. **Convert reaction 24 from half-life 19 to "Instant decay"**, making the social axis strictly mutually-exclusive like the thermal pairs. Eliminates the middle-band co-existence and makes social signals switch sharply between lonely and crowded.
6. **Gate reaction 52 with an enzyme catalyst** (analogous to Sleepase gating the Sleepiness-backup release). Makes banked loneliness only surface in response to a specific event chemical — e.g. a "seeing a familiar face leave" toxin — rather than as a continuous drip.
7. **Raise the initial concentration of 139** so newly-hatched Norns begin life slightly socially hungry, giving them an early preference for approach-behaviours.

Because chemical 139 has no direct receptor and the active drive has only a single receptor (the decision-lobe drive bar), these modifications are safely isolated from the rest of the biochemistry — they affect the loneliness drive cleanly without perturbing metabolism, immunity, gait, or sleep.

### Practical consequences for gameplay

- **`CHEM 139 <n>` is the canonical "social-debt" injection.** Unlike `CHEM 156 <n>` (which produces a brief pulse that decays as reaction 62 sweeps it into the backup, or gets annihilated by any ambient Crowded), injecting into 139 guarantees a persistent loneliness-deficit state that surfaces over minutes and keeps pushing the decision lobe toward social behaviours.
- **`CHEM 139 -n` is the canonical "friendship healing" write.** Zeroing the reservoir immediately eliminates the long-tail loneliness drip, and any residual active Loneliness will be swept back up into it anyway within a few ticks — so the drive bar falls cleanly within seconds of the write.
- **The reservoir is invisible to most UI.** Only the Science Kit displays chemical 139 directly. A Norn with low Loneliness but high Loneliness backup will appear "fine" on the drives display while carrying a sizable dormant social need that will manifest slowly once social density drops.
- **Moving a lonely Norn to a crowded room does not immediately "cure" loneliness.** Reaction 52 keeps dripping banked loneliness into the active drive for minutes, and reaction 24's non-instant annihilation cannot clean it up faster than reaction 52 produces it. The creature's decision lobe will keep seeing elevated Loneliness for some time after the social-density change.
- **Moving a crowded Norn to an empty room does not immediately produce loneliness either.** The sensorimotor emitter begins producing active Loneliness within one tick, but reaction 62 sweeps almost all of it straight into the backup; the drive-bar rise is gradual over tens of seconds to minutes, not abrupt.
- **Lonely babies never start that way.** Because both 139 and 156 have no initial concentration, a newly-hatched Norn is always born at exactly neutral on the social axis. The reservoir begins to fill only after the first few ticks of real `LOC_CROWDEDNESS` readings from the room into which the egg hatches.
- **Purely cognitive consequence.** Unlike the thermal, sleep, and hunger backups — which feed receptors that alter gait, metabolism, or immunity — the Loneliness reservoir has *no* side-effect pathway. Its only downstream behaviour is the decision lobe choosing "approach another creature" more often once the drive bar is high enough.

### Summary

```
 Stock-genome wiring of Loneliness backup [139]
 ────────────────────────────────────────────────
 Inputs:
    Loneliness [156] ─ reaction 62 (gene 43) ────────▶ [139]
                        half-life 6 ticks ("Very short")
                        single-pull (not doubled)

    CHEM 139 <n>  (CAOS / scripts / mods)  ──────────▶ [139]

    (No emitter writes to 139 directly; no cross-drive spillover)

 Reservoir:
         Loneliness backup [139]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                        │
                        │ reaction 52 (gene 15): 1× [139] → 1× [156]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Loneliness [156]
         half-life 563 ticks ("Medium") — decays on its own
         initial concentration: 0
                        │
                        ├─► Drives tissue locus 8 (gain 207) ─────▶ decision-lobe "loneliness" bar
                        │                                            (the only receptor on 156)
                        │
                        ├─◀ emitter #7 (gene 41):
                        │      Sensorimotor LOC_CROWDEDNESS (locus 5)
                        │      threshold 227, rate 10, gain 1, DIGITAL + INVERT
                        │      → fires whenever density < 89 % (almost always)
                        │
                        └─◀ reaction 24 (gene 104):
                               Crowded [157] + Loneliness [156] → (nothing)
                               half-life 19 ticks ("Short") — NOT instant
                               (cross-annihilation with the Crowded pair)

 LOC_CROWDEDNESS source:
    Creature::CalculateSensorimotorSenses()
       myCrowdedLocus = World.Map.GetRoomPropertyMinusMyContribution(self)
       — reads the room's "crowded" CA property minus this creature's
         own contribution, so same-kind neighbours register but self does not
```

Loneliness backup is therefore a **single-pull, sensorimotor-fed, purely cognitive** reservoir — the chronic half of the Norn's social-density drive. Among the sixteen backup chemicals in the 131–146 block it is most similar in structure to Crowded backup (140), Fear backup (141), Boredom backup (142), Anger backup (143), Need-for-pleasure backup (145), and Sex-drive backup (144): all are single-pull buffers whose active partners drive only the decision lobe, with no metabolic, sensorimotor-gait, or immune side-effects. What distinguishes Loneliness backup from those siblings is the **non-instant annihilation** coupling with Crowded backup's active partner, which creates the sluggish, overlapping, minutes-scale dynamics that make social satisfaction in Creatures 3 feel like a slow-moving emotional weather system rather than a sharp on/off signal.
