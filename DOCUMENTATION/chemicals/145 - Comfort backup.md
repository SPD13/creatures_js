# 145 - Comfort backup

Comfort backup occupies the fifteenth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome normally pairs one-to-one with the sixteen drive chemicals in the 148–161 range. It would conceptually be the **reservoir half** of the Comfort drive — the long-moving chronic pool that would buffer the Comfort (162) signal the brain's decision lobe reads. In practice, however, chemical 145 is the most thoroughly **unwired slot** in the stock biochemistry: it has no emitter, no receptor, no neuroemitter, no initial concentration, and — crucially — **no reaction wires it to its would-be active partner**. It is, alongside Fear backup (141) and Anger backup (143), one of three completely orphan reservoirs in the shipping genome, and unlike them its active partner Comfort (162) is *also* a near-orphan: only one source ever produces it (the `LOC_PREGNANT` reproductive emitter) and only one tissue ever reads it (the decision-lobe drive bar at locus 14). The entire Comfort axis is therefore a minimalist, single-purpose drive with a permanent reservoir slot kept in reserve for genome modders.

The half-life table entry for chemical 145 is identical to most of the other reserved reservoir slots: `genomeValue: 255`, half-life ≈ 9·10¹⁰ ticks (decay rate exactly `1.0`), labelled "Very long". This means that if anything ever *did* write to chemical 145 — a modded gene, a CAOS `CHEM 145 <n>` from a script, or an agent injecting it into the creature's bloodstream — whatever mass landed in the slot would persist essentially forever, because nothing drains it. Together with the other orphan drive-backup slots (Fear backup at 141, Anger backup at 143, and the unused 146), Comfort backup is best understood as a **reserved-but-empty reservoir** — a genome slot the engine recognises and can store concentration in, but one that the shipping biochemistry never touches.

Because of this, the gameplay behaviour of Comfort is driven entirely by chemical 162 and its single source — the pregnancy emitter on reproductive tissue locus 1 (`LOC_PREGNANT`). The rest of this document describes *what the Comfort pair would look like if wired analogously to Loneliness or Boredom*, why the stock genome leaves it unwired, the resulting peculiarities of Comfort as a "single-event, lifetime-memory" drive, and the practical consequences for scripts, agents, and modders who want to use chemical 145 anyway.

## Sources

Comfort backup has **no stock-genome inflow at all**. No emitter, neuroemitter, reaction, or initial-concentration entry writes to chemical 145. The only way mass ever enters the slot in a default game is through direct CAOS or PRAY-agent injection.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | No backup-filling reaction | — | — | The reaction table does **not** contain a `Comfort [162] → Comfort backup [145]` sweep. Every wired active drive in the 148–161 range has such a reaction (sometimes duplicated), but **Comfort has none**. There is no mass flow from the active partner into the reservoir | — |
| 2 | No direct emitter on 145 | — | — | The emitters table contains no entry whose target chemical is 145. No sensorimotor locus, circulatory locus, reproductive locus, or organ tissue fires into the reservoir | — |
| 3 | No neuroemitter on 145 | — | — | The single stock neuroemitter (lobe 4 "move" neuron 37) writes Adrenalin [117], Fear [158] and Crowded [157] when it fires — **not** chemical 145 | — |
| 4 | No initial concentration | — | — | Chemical 145 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly 0 Comfort backup and, because no reaction fills the slot, it stays at 0 for the creature's entire life unless a script writes to it | — |
| 5 | No cross-drive spillover | — | — | Unlike the protein pair (where Pain spills into Hunger-for-protein backup) or the Sleepiness pair (where Sleep toxin metabolism produces active Sleepiness that is swept into its backup), there is no stock-genome reaction that routes any other chemical into chemical 145. The Comfort axis is wholly decoupled from the reservoir | — |
| 6 | Direct CAOS injection | — | Any | `CHEM 145 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively permanent because the chemical's half-life is ≈ 9·10¹⁰ ticks and no reaction drains it |
| 7 | Modded genomes | User-added | User-added | Breeders sometimes add the missing `Comfort → Comfort backup` sweep reaction to convert the drive into a reservoired pair that behaves like Loneliness or Boredom. Another common mod is to add a "post-mating bond" or "nest familiarity" neuroemitter into 145 so that long-term contentment accumulates in the reservoir independently of the pregnancy-only active drive | Gene-dependent |

## Usage

Comfort backup has **no stock-genome consumers**. With no receptor to read it and no reaction to drain it, any value injected into chemical 145 sits in the slot indefinitely. The only "use" in the default game is as a permanent annotation — mass placed there neither decays nor exerts any effect.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | No backup → active conversion reaction | — | — | There is **no** `Comfort backup [145] → Comfort [162]` reaction in the stock genome. Where every wired reservoired drive has a Medium drip reaction releasing reservoir mass into its active partner, Comfort has none. Mass deposited in 145 cannot surface as active Comfort without a modded reaction | — |
| 2 | Passive decay (effectively none) | Gene 64 entry #145 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate exactly `1.0`), labelled "Very long" | Nearly all drive backups share this near-infinite half-life by design: the chemical is meant to be a reservoir, not a signal. Combined with the absence of any drain reaction, this makes 145 a **completely static slot** in stock play: once written, the value persists forever | — |
| 3 | No receptor | — | — | Chemical 145 is **not read by any stock receptor**. No drive tissue, brain lobe, sensorimotor locus, reproductive locus, circulatory locus, or organ receptor reads its concentration. The creature has no awareness of its Comfort-backup value, and no downstream behaviour changes with it | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter table does not wire any brain neuron to chemical 145 | — |
| 5 | No annihilation partner | — | — | Comfort has no antagonist chemical (no "discomfort" drive), and 145 has no cross-pair destruction reaction. Even modded environments rarely include a Comfort-destroying chemical | — |
| 6 | Modded consumers | User-added | User-added | Modders who want 145 to matter typically add (a) a `Comfort backup → Comfort` drip reaction at Medium speed so the reservoir surfaces like the other drive backups, (b) a drive-tissue receptor on 145 so that chronic comfort weights the decision lobe independently of acute Comfort, (c) a sensorimotor receptor on 145 to make idle/relaxation gait sensitive to chronic rather than acute comfort, or (d) wire the reservoir to a "safe place" or "nest" learned-neuron output so that revisiting familiar territory accumulates banked contentment | Gene-dependent |

## Role in Game Mechanics

### The orphan-reservoir pattern

Creatures 3 organises each drive in the 148–161 range as a *nominal* pair: a short-lived active drive chemical and a long-lived backup reservoir. The block is laid out so that chemical `148 + n` is paired with chemical `131 + n` for `n` = 0…13, giving fourteen drive pairs. There are however **two extra reservoir slots** in the backup block (145 and 146) and **one extra active slot** (162 Comfort) that fall outside this regular pairing:

| n | Active (148 + n) | Backup (131 + n) | Wired in stock? |
|---|-------------------|-------------------|-----------------|
| 0 | 148 Pain | 131 Pain backup | Yes (full pair) |
| 1 | 149 Hunger for protein | 132 Hunger for protein backup | Yes (full pair + Pain spillover) |
| 2 | 150 Hunger for carbohydrate | 133 Hunger for carb backup | Yes (full pair, doubled refill) |
| 3 | 151 Hunger for fat | 134 Hunger for fat backup | Yes (full pair, doubled refill) |
| 4 | 152 Coldness | 135 Coldness backup | Yes (full pair, doubled refill) |
| 5 | 153 Hotness | 136 Hotness backup | Yes (full pair, doubled refill) |
| 6 | 154 Tiredness | 137 Tiredness backup | Yes (full pair) |
| 7 | 155 Sleepiness | 138 Sleepiness backup | Yes (full pair + Sleepase enzyme gate) |
| 8 | 156 Loneliness | 139 Loneliness backup | Yes (full pair, single-pull) |
| 9 | 157 Crowded | 140 Crowded backup | Yes (full pair, single-pull) |
| 10 | 158 Fear | 141 Fear backup | NO — backup is orphan |
| 11 | 159 Boredom | 142 Boredom backup | Yes (full pair, single-pull) |
| 12 | 160 Anger | 143 Anger backup | NO — backup is orphan |
| 13 | 161 Sex drive | 144 Sex drive backup | Yes (full pair, single-pull, Medium decay) |
| — | **162 Comfort** | **145 Comfort backup** | **NO — backup is orphan; the active drive is also nearly orphan, with only one source and one reader** |
| — | — | 146 (unused) | — |

Comfort is therefore unique among the fifteen drives in two ways. First, its **active partner** sits *outside* the regular `148 + n` block at chemical 162, indicating it was added late in the genome design and never given the full reservoir wiring that the earlier pairs received. Second, both halves of the pair are minimally wired: 145 is unreferenced anywhere outside the half-life table, and 162 has only a single emitter (pregnancy) and a single receptor (the decision-lobe drive bar). Where Loneliness, Boredom, Hunger and the rest are integrated into a web of cross-reactions, neuroemitters, and sensorimotor consequences, Comfort is a deliberately stripped-down "bonus drive" that fires under exactly one circumstance.

### Why the stock genome leaves Comfort unreservoired

The Comfort drive (162) has only one stock-genome producer:

| Source | Mechanism | Half-life / rate | Role |
|--------|-----------|------------------|------|
| **Reproductive tissue emitter #18** (gene 37) | `Reproductive / locus 1 LOC_PREGNANT → Comfort [162]`, threshold 0, **rate 10**, gain 255, **DIGITAL** (fixed gain), switches on at **Youth** | While `LOC_PREGNANT` reads non-zero (i.e. the creature is pregnant), the emitter fires at rate 10 per tick at full gain 255 — adding ≈10/255 ≈ 3.9 % of the chemical's max range to Comfort every tick. Because Comfort itself has a "Very long" half-life and decays at rate 1.0, every emitted unit accumulates without loss | The single source of Comfort in stock biochemistry |

This pattern — one DIGITAL-gain reproductive emitter feeding a Very-long-half-life chemical — produces a **pregnancy-only, lifetime-memory** signal. As soon as a Norn becomes pregnant, the emitter starts dumping mass into Comfort each tick. The drive bar climbs steadily over the course of the pregnancy and **never decays back down**, because the half-life is effectively infinite. Once the pregnancy ends (the egg is laid and `LOC_PREGNANT` clears), the emitter stops firing, but the accumulated Comfort remains in the bloodstream forever, perpetually pushing the decision-lobe drive bar.

Because Comfort already has a single, narrow, lifetime-persistent signal, a reservoir would be redundant: the active drive *already* behaves like a reservoir thanks to its Very-long half-life. The shipping design treats Comfort as a one-way "I have given birth at least once" indicator — a permanent biochemical mark of motherhood — rather than a fluctuating drive that needs short-term and chronic channels.

The same general reasoning applies to the other orphan reservoirs: Fear (158) is already richly wired with multiple sources, several receptors, and an autocatalytic adrenaline amplifier, so adding a chronic buffer would dilute its sharp acute response; Anger (160) similarly has its own self-reinforcing dynamics through Adrenalin. Comfort is the simplest of the three — instead of needing an unreservoired *acute* response, it needs an unreservoired *permanent* response, and the Very-long half-life of chemical 162 itself fills that role without requiring 145.

### How Comfort actually works without a reservoir

Because 145 is unwired, the complete dynamic of the Comfort drive runs entirely through chemical 162. The single source is the LOC_PREGNANT reproductive emitter described above; the single decoder is the Drives-tissue receptor:

| Reader | Tissue / Locus | Threshold / Gain / Flags | Meaning |
|--------|----------------|--------------------------|---------|
| Drives receptor #15 (gene 50) | Creature / Drives (tissue 5) / locus 14 "Comfort" | threshold 0, gain 255, analogue, from Baby | The brain's **decision-lobe drive bar** for Comfort. Reads chemical 162's concentration at full gain 255 with no threshold — every unit of Comfort directly raises the drive bar that the decision lobe sees as "comfort". Because the drive bar is read by the brain as a low-need indicator (high comfort = no problem to address), a saturated Comfort drive *suppresses* the urgency of competing drives in the decision lobe's relative-need calculation |

Notably, **the Comfort drive sits at locus 14**, *outside* the fourteen drives (loci 0–13) that the Music Faculty's mood calculation considers. The Music Faculty iterates only over drives 0–13 (PAIN through SEXDRIVE) when computing mood from drive levels, so Comfort — alone among all drives — has **no influence on the creature's musical mood signature**. This is consistent with its design as a behavioural-only drive: it shapes the decision lobe's choice of action but does not colour the creature's emotional output to song.

There is no sensorimotor receptor for Comfort, no organ receptor, no reproductive-tissue feedback receptor, no circulatory receptor, and no brain-lobe receptor. The drive's only behavioural effect is therefore through the decision lobe's drive-bar weighting: a pregnant or once-pregnant creature has a permanently-elevated Comfort bar that down-weights the salience of every other competing drive on a relative-need scale.

### The pregnancy-as-comfort design

The stock genome's wiring of Comfort encodes a specific narrative design choice: **motherhood is biochemically rewarding, and the reward is permanent**. The mechanics flow as follows:

1. A female Norn reaches Youth and becomes fertile. The reproductive tissue's `LOC_PREGNANT` locus reads zero. Comfort emitter #18 is gated on Youth and would fire if `LOC_PREGNANT` were non-zero, but it is not, so no Comfort is produced.
2. The Norn mates successfully and becomes pregnant. The reproductive cycle sets `LOC_PREGNANT` non-zero (the locus typically reads as the gestation timer or a pregnancy flag).
3. Emitter #18, now seeing `LOC_PREGNANT > threshold 0`, fires at rate 10 per tick at DIGITAL gain 255 — adding ~3.9 % of the chemical max to Comfort every tick. Over the gestation period (hundreds to thousands of ticks), Comfort accumulates rapidly and saturates well before the egg is laid.
4. The decision lobe sees the elevated Comfort drive bar and treats the pregnant creature as "satisfied" on the comfort axis, freeing up its action selection to focus on hunger, thermoregulation, and social drives without the comfort drive demanding attention.
5. The egg is laid; `LOC_PREGNANT` returns to zero; emitter #18 stops firing. But the accumulated Comfort in the bloodstream **does not decay** — its Very-long half-life keeps it pinned at the saturated value indefinitely.
6. For the rest of the Norn's life, the Comfort drive bar stays high. Any subsequent pregnancy adds *more* Comfort, but the chemical is already saturated at 255, so the additional production has no effect — the creature has been "marked as a mother" and the mark is irrevocable.

Males experience the Comfort drive only by external injection, since `LOC_PREGNANT` cannot be set on a male creature in stock biochemistry. A male Norn's Comfort drive bar reads exactly zero for life, contributing the maximum "discomfort" weighting to the decision lobe's comfort axis. This is one of the few places in the stock genome where the two sexes have permanently asymmetric drive states regardless of behaviour.

### Effects of directly filling Comfort backup

A `CHEM 145 <n>` injection produces **no observable effect at all** in stock play:

1. **Tick 0:** Chemical 145 rises to *n*. Nothing reads it; nothing converts it; nothing decays it.
2. **Tick 1 and forever after:** The value persists at *n* unchanged. The Comfort drive bar (which reads chemical 162, not 145) is unaffected. The creature's decision lobe sees no change in its comfort axis. No sensorimotor, reproductive, brain-lobe, or organ tissue notices.
3. **The injection is permanent and silent.** Unlike Sex drive backup (144), which leaks at Medium speed; or the wired drive backups, which drip into their active partners over Medium half-lives; or even the other orphan backups Fear (141) and Anger (143) which still have *some* acute partner that could in principle be cross-modded — chemical 145 is the most thoroughly inert slot in the bloodstream. It is the closest the genome comes to an unused chemical that nonetheless has a nominal "name" attached.

A scripter or modder wanting to genuinely give a non-pregnant Norn a Comfort signal must either:
- Inject **Comfort** (162) directly via `CHEM 162 <n>` — this raises the drive bar immediately and persists indefinitely, but cannot be undone by stock biochemistry either (no stock reaction destroys 162).
- Set the creature's `LOC_PREGNANT` reproductive locus through CAOS — this triggers the natural emitter, but is gameplay-incoherent on a male or pre-Youth creature.
- Add a drip reaction `145 → 162` via a modded gene, then inject 145; this gives a slow surfacing of comfort over the Medium drip half-life.

### Implications for modders

Common modifications built on top of Comfort backup:

1. **Add the missing `Comfort → Comfort backup` sweep reaction** so that the active drive is buffered into the reservoir like the wired pairs. With the Very-long half-life, this would mean once-pregnant Norns accumulate banked Comfort for life and dripped Comfort backwards from the reservoir would create a second-order "memory of comfort" channel.
2. **Add a `Comfort backup → Comfort` drip reaction** so that CAOS-injected 145 surfaces gradually as active Comfort. Combined with the doubled `Comfort → Comfort backup` sweep, this would convert the Comfort axis into a fully-paired drive with the same equilibrium dynamics as Loneliness or Crowded.
3. **Wire a "safe place" or "nest" learned-neuron output** as a neuroemitter into chemical 145 so that revisiting familiar, comfortable territory accumulates banked contentment independently of pregnancy. This generalises the comfort signal beyond motherhood.
4. **Add a drives-tissue receptor on 145 at low threshold** so that even a small banked-comfort value contributes to the decision-lobe drive bar — making chronic environmental contentment (from the modded neuroemitter above) compete with acute pregnancy-comfort.
5. **Add a finite half-life** (lower the half-life table's `genomeValue` from 255 to e.g. 64, "Medium") so that the comfort reservoir actually drains over time. Combined with a backup-filling reaction, this would produce a "comfort fades unless reinforced" dynamic similar to Sex drive backup.
6. **Cross-couple 145 to Loneliness (156) destruction** so that high comfort directly suppresses loneliness — encoding the design intent that a comfortable creature is also less socially desperate.
7. **Wire an emitter from `LOC_RECEPTIVE` (post-mating)** into chemical 145 so that successful mating events accumulate comfort independently of pregnancy itself, giving male creatures a route into the comfort axis.

Because chemical 145 has no direct receptor and the active partner 162 has only a single decision-lobe receptor, these modifications are extremely safely isolated from the rest of the biochemistry — they affect the comfort axis cleanly without perturbing metabolism, immunity, sleep, hunger, fear, anger, or sex drive.

### Why "Comfort" is named the way it is

The chemical name "Comfort" is one of several stock-genome chemical names that describes the *cognitive interpretation* of the drive rather than the physiological process producing it. The stock genome's only producer is pregnancy, but the decoder is named "Comfort drive" — the design implication being that the experience of being pregnant is, from the Norn's behavioural perspective, a feeling of contentment and reduced need for action. Other examples of similar phrasing in the stock genome are "Loneliness" (the decoder of a low-population CA-detector), "Crowded" (the decoder of a high-population CA-detector), and "Boredom" (the decoder of low novelty in the perceived-objects channel). In each case, the chemical name is the player-facing description of what the Norn "feels", not the biological mechanism producing the chemical. Comfort is the most striking example of this disconnect: the player sees a drive bar called "Comfort" that goes up when a Norn becomes pregnant and stays high for the rest of her life, with no other circumstance affecting it. The reservoir slot 145 was reserved in case future genome work or community modders wanted to broaden the meaning of "comfort" beyond this single trigger.

### Practical consequences for gameplay

- **`CHEM 145 <n>` is a no-op.** Nothing reads it, nothing drains it, no behaviour changes. The injection persists permanently in the slot but has no effect. Useful only as a tagged "marker" that survives saves/loads (e.g. a modded script could later grep for non-zero 145 to detect creatures it has previously processed) — but better tagging mechanisms exist (CAOS variables, world variables, or one of the genuinely unused chemical slots).
- **Comfort itself is a near-permanent flag.** Once a female Norn becomes pregnant for the first time, her Comfort drive bar saturates and stays saturated for life. This subtly biases her decision lobe away from comfort-seeking actions (which would be a lower priority anyway since she "feels comfortable") and toward addressing other drives.
- **Males never feel Comfort in stock play.** The pregnancy emitter cannot fire on a male (he has no `LOC_PREGNANT`), and no other source produces chemical 162. A male Norn's Comfort drive bar reads exactly zero for life, creating an asymmetric drive baseline between the sexes.
- **Comfort is the one drive that does not affect mood/song.** The Music Faculty iterates only over drive loci 0–13 when computing mood; Comfort sits at locus 14 and is silently excluded. A pregnant Norn singing happily is doing so because of Sex drive (YYY positive influence) or low Pain/Hunger/Cold/Loneliness/Anger, not because of her Comfort level.
- **No biochemical reset.** Unlike all other drive backups, where even at minimum a Very-long half-life is paired with active reaction networks that move mass in and out, Comfort backup has no in-flow and no out-flow — making it the most thoroughly inert chemical slot in the stock biochemistry that nonetheless has a chemical name. It is closer to an "unnamed" slot than to the other reservoir chemicals.

### Summary

```
 Stock-genome wiring of Comfort backup [145]
 ──────────────────────────────────────────────
 Inputs: NONE in stock play
    No reaction:    nothing → [145]
    No emitter:     no tissue locus writes [145]
    No neuroemitter: no brain neuron writes [145]
    No initial concentration: born at 0
    No cross-drive spillover

    CHEM 145 <n>  (CAOS / scripts / mods)  ──────────▶ [145]   (only entry route)

 Reservoir:
         Comfort backup [145]
         half-life ≈ 9·10¹⁰ ticks ("Very long"), decay rate 1.0
         initial concentration: 0
                        │
                        │ NO drip reaction → [162]
                        │ NO own decay (decay rate 1.0)
                        │
                        ▼
                   ── value persists indefinitely, invisible ──

 Active partner (separately driven, not connected to the reservoir):
         Comfort [162]
         half-life ≈ 9·10¹⁰ ticks ("Very long"), decay rate 1.0
         initial concentration: 0
                        │
                        ├─◀ Reproductive emitter #18 (gene 37, Youth-gated):
                        │      LOC_PREGNANT > 0  →  Comfort [162] +10/tick (DIGITAL, gain 255)
                        │      — only stock source; only fires while pregnant
                        │
                        └─► Drives receptor #15 (gene 50, Baby+):
                               Drives tissue locus 14 "Comfort", gain 255, threshold 0, analogue
                               — only stock reader; pushes the decision-lobe Comfort drive bar

 Unused / orphan in stock biochemistry:
    chemical 145 (this slot)
    chemical 146 (unnamed reservoir slot)
    Music Faculty drive index 14 (Comfort — drives 0-13 only contribute to mood)
```

Comfort backup is therefore an **unwired-on-both-sides, lifetime-permanent, behaviourally-silent** reservoir — the most thoroughly orphan of all the orphan drive backups. Its active partner Comfort (162) is itself a minimally-wired single-purpose drive — the "I am or have been pregnant" indicator — and the reservoir slot 145 was reserved against the possibility that modders would want to broaden the comfort signal to other situations (nest familiarity, post-mating bonds, environmental safety, etc.) but is left empty in the shipping genome. Among the sixteen reservoir chemicals in the 131–146 block it is the only one whose active partner is *also* nearly orphan, making the entire Comfort axis the simplest and most narrowly-scoped drive in the Creatures 3 / Docking Station biochemistry.
