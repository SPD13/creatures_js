# 131 - Pain backup

Pain backup is the **reservoir half** of the drive pair for Pain (chemical 148). It sits at the head of the "drive backup" block (chemicals 131–146), a bank of sixteen long-lived placeholder chemicals that the stock genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. The role of a backup is to carry a slowly-released pool of the drive's "history" so that an **acute** spike (Pain rising from a damage event) and a **chronic** signal (Pain lingering as a dull ache after the event) can be separated and tuned independently. The backup's near-infinite half-life means that whatever the creature has "banked" as pain memory persists across many minutes of real time unless deliberately drained.

In the stock Creatures 3 / Docking Station Norn genome, Pain backup is **latent**: it has no emitter, no receptor, no initial concentration, and is **not produced by any reaction**. Its only biochemical wiring is reaction 42 (gene 7), which performs the one-way conversion `Pain backup [131] → Pain [148]` at medium speed. The backup is therefore a **write-only reservoir from the outside world**: it exists to let scripts, mods, or future genome revisions inject a slow-release pain source without having to tamper with the fast-decay active Pain drive directly. A `CHEM 131 <n>` call on a targeted creature produces exactly the *sustained, slowly-rising pain* profile that cannot easily be produced by injecting Pain itself — because active Pain [148] has a 172-tick half-life and fades within seconds.

This asymmetry — backup only *becomes* drive, drive never decays *into* backup — makes Pain backup unique among the sixteen drive backups. Most backups (Sleepiness backup, Hunger for carb backup, Tiredness backup, etc.) are written into by a reaction of the form `<Drive> → <Drive backup>` so that the drive naturally replenishes its own reservoir; Pain backup has no such inbound reaction in the stock genome. See **[Why Pain backup is "half-wired"](#why-pain-backup-is-half-wired)** below for the likely reason.

## Sources

Pain backup has **no endogenous source** in the stock Norn genome. Every entry below is either external, genomic-constant, or modder-supplied.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | External CAOS injection | — | Any | `CHEM 131 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively persistent because the chemical's half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 2 | No endogenous reaction | — | — | **No reaction in the stock genome produces Pain backup.** Unlike Sleepiness backup (fed by gene 101: `Sleepiness → Sleepiness backup`) or Hunger-for-carb backup (fed by gene 58), the genome carries no `Pain → Pain backup` reaction — the backup is only filled externally | — |
| 3 | No emitter | — | — | The emitter table (43 entries, gene ids 42–84 in the organ table) contains no entry for chemical 131. No brain neuron, sensorimotor locus, or organ receptor gene converts a neural or physiological signal into Pain backup | — |
| 4 | No initial concentration | — | — | The half-life / initial-concentration table entry for chemical 131 specifies `genomeValue: 255` (≈ no decay), but no gene writes a non-zero starting amount — the Norn is born with exactly 0 Pain backup | — |
| 5 | Modded genomes | User-added | User-added | A breeder can add a reaction (e.g. `Pain → Pain backup`, mirroring the Sleepiness pattern) or an emitter keyed to `RLOCUS_INJURY`, `Antigen N`, or a brain pain-memory neuron to make the chemical endogenously active. Mods that add a "pain memory" lobe typically wire its output into 131 rather than 148 | Gene-dependent |
| 6 | External agent damage (indirect) | Stock bootstrap scripts | Any | `STIM WRIT <target> 0 <amount>` (stim id 0 = PAIN) writes *Pain* directly at chemical 148 via the `STIMTOBIOCHEMOFFSET=148` rule. Note this feeds chemical **148 (Pain)**, not 131 — the backup is **not** automatically topped up by stim-based damage. Bootstrap scripts that want a lingering ache must inject 131 directly | — |

## Usage

Pain backup has exactly one consumer — reaction 42 — and one passive characteristic (its essentially infinite half-life).

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 7 (reaction id 42) | Organ #2 "Reaction" | `1× Pain backup [131] → 1× Pain [148]` at rate byte 58, half-life ≈ 311 ticks ("Medium") | Every backup unit slowly becomes an active-Pain unit at a medium rate. Unlike Sleepiness backup → Sleepiness (which requires a Sleepase catalyst and converts in ≈ 2 ticks), the Pain conversion is **spontaneous** (no catalyst in the formula) and deliberately sluggish (half-life ~10 s at the 30 Hz world tick). This produces a **drip-feed** of pain rather than a burst, which is exactly the "chronic ache" profile the backup is designed for |
| 2 | Passive decay (effectively none) | Gene 64 entry #131 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | A Pain-backup pool loaded by `CHEM 131 <n>` persists indefinitely *unless* it is drained by reaction 42. All sixteen drive backups share this near-infinite half-life by design; the chemical's role is to act as a reservoir, not a signal, so it must not decay on its own |
| 3 | No receptor | — | — | Pain backup is **not read by any stock receptor**. No drive, brain lobe, locus, or organ reads its concentration — the creature has no sensory awareness of the pool. It is a pure biochemical reservoir | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 131 | — |
| 5 | Modded consumers | User-added | User-added | Modders can add a Pain-backup receptor (e.g. on a "pain memory" lobe) or rewrite reaction 42 to require a catalyst (giving a gated / enzymatic release profile mirroring Sleepase). Typical "trauma memory" mods do both | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. The general pattern, implemented for most drives, is:

```
     <Drive backup>  ──(reaction)──▶  <Active drive>  ──(reaction, slow)──▶  <Drive backup>
                                            │
                                            └── read by Drives-tissue receptor
                                                (the value the brain actually sees)
```

For the Pain drive specifically:

| Role | Chemical id | Name | Half-life | Initial |
|------|------------|------|-----------|---------|
| Backup reservoir | **131** | **Pain backup** | **~9·10¹⁰ ticks (Very long)** | **0** |
| Active drive | 148 | Pain | 172 ticks (Medium, ≈5.7 s) | 0 |

The two wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 7 (id 42) | `Pain backup → Pain` | 311 ticks (≈10 s) | **Backup → active** (drip-feed) |
| Gene 20 (id 56) | `Pain → Hunger for protein backup` | 6 ticks (Very short) | **Active → protein-hunger backup** (cross-coupled, *not* a self-refill) |

Notice the second reaction: **Pain does not decay into its own backup.** Instead, active Pain drains into *Hunger for protein backup [132]* (the next chemical in the backup bank), which is almost certainly an off-by-one wiring in the stock genome — the intended target was probably Pain backup itself. This is consistent with the way the backup block (131–146) is **shifted by one** relative to the drive block (148–161) — Pain backup is 131, not 132, but Hunger-for-protein backup is 132 — and the Pain-generating cell of a symmetric backup table would have read one slot too far. Whether intentional or a genuine bug frozen into the shipped genome, the practical consequence is that:

- **Pain backup has no organic source** — only `CHEM 131 <n>` or modded genes can fill it.
- **Pain itself drains into the protein-hunger reservoir**, producing the oddly characteristic Norn behaviour where sustained pain makes the creature hungry (for protein).

### Why Pain backup is "half-wired"

The Pain backup's missing inbound reaction makes it the cleanest example of a **vestigial drive-reservoir chemical** in the stock genome. Several observations support this reading:

1. **The chemical's slot is filled** (131 has a name, a half-life entry, and is cited by reaction 42), so it is not reserved empty space like chemicals 121–123 or 126.
2. **The reaction 42 consumer exists and runs continuously.** Any Pain backup that ever appears will drain into active Pain at a half-life of ≈10 s.
3. **No gene writes 131 from within the body.** The only writes are external (CAOS / mods), and the "symmetric" reaction that would self-refill the reservoir (gene 20: `Pain → ?backup`) targets 132 instead of 131.
4. **The near-infinite chemical half-life is identical to every other backup** (135, 137, 138, etc.) — the chemistry table treats 131 as a full-fledged reservoir despite the missing refill path.

The most likely historical story is that chemical 131 was designed as a full mirror of the Sleepiness / Hunger / etc. backups but that the refill reaction for Pain was either (a) deliberately removed because spontaneous pain-memory would interfere with the short-burst nature of stim-driven pain, or (b) accidentally mis-wired to chemical 132 (the next slot). The biochemistry remains coherent with both readings: external agents (traps, smacking the Norn, toxic plants) all use the `STIM WRIT PAIN <n>` path, which writes active Pain at chemical 148; they do not need the backup. Nothing in the stock gameplay actually relies on 131 being populated, so the missing refill has no observable consequence on a wild-type Norn.

### How Pain backup differs from Sleepiness backup

It is worth comparing the two reservoirs side-by-side because they sit at opposite ends of the design spectrum for drive backups:

| Feature | Sleepiness backup (138) | Pain backup (131) |
|---------|-------------------------|-------------------|
| Refill reaction (drive → backup) | **Yes**, gene 101, 11-tick half-life | **No** (gene 20 mis-targets 132) |
| Release reaction (backup → drive) | **Yes**, catalysed by Sleepase (gene 102), 2-tick half-life | **Yes**, spontaneous (gene 7), 311-tick half-life |
| Release gating | Pulse-catalyst (Sleepase emitter fires on decision neuron / asleep locus) | Ungated — constant slow drip |
| Secondary pathway | `Sleepiness backup → Tiredness + Sleepiness backup` (separate drive clock) | None |
| Initial / endogenous filling | 0 at birth, but continuously refilled by active-drive decay | 0 at birth and never refilled endogenously |
| Drain mechanism | Backup depletes as Sleepase pulses convert it to active drive | Backup depletes only if externally filled |
| Role in play | Acts as the **sleep reservoir** — how long the Norn can stay asleep | Acts as a **dormant slot** — useful only for mods and scripts |

Sleepiness backup is a fully-functional reservoir supporting the Norn's sleep cycle. Pain backup, in contrast, is a **reservoir in search of a source** — the plumbing is present but no pump is attached.

### Connection to the STIM → Pain path (why the backup is unused by the stock game)

The engine provides a direct path from external "stimulus" events to the active Pain drive via the stim-to-chemistry offset. The engine defines:

```text
STIMTOBIOCHEMOFFSET = 148
```

and states in the accompanying comment that *"chemical 148–255 = stim chemical 0–107"*. That means stim id 0 (PAIN) writes directly into chemical 148 when a `STIM WRIT <creature> 0 <amount>` CAOS command fires or when a bootstrap event (a slap, a trap, ingestion of Cyanide / Glycotoxin / Belladonna, etc.) triggers the pain stim. **The stim machinery skips the backup entirely** — it goes straight to the active drive at chemical 148.

Because almost every in-game pain event uses the stim path, Pain backup never gets touched by normal gameplay:

- Pressing the "slap" button on the Norn UI issues `STIM WRIT <norn> 0 <amount>` → writes chemical 148.
- Ingesting Cyanide (67) or Glycotoxin (70) generates pain via their own toxicity reactions or organ damage → writes chemical 148.
- Antigen 7 immune reaction (gene `Antigen 7 → 3× Antibody 7 + Pain`) writes chemical 148.
- The Alcohol-Dehydrogenase metabolic pathway writes chemical 148 as a by-product of a hangover.

None of these touch chemical 131. A Norn can live a full life with its Pain backup reservoir at 0, which is in fact the expected behaviour.

### Effects of directly filling Pain backup

Because the chemical is wired to slowly convert to active Pain, a `CHEM 131 <n>` injection produces a characteristic drip-feed pain profile:

1. **Tick 0:** `CHEM 131 <n>` is called. The creature's Pain backup rises to *n*, Pain drive is unchanged.
2. **Tick 1–∞:** reaction 42 converts Pain backup to Pain at half-life 311 ticks (~10 s). The Pain drive rises smoothly — the rate is the derivative of an exponential, so it peaks near the injection time and decays with the 311-tick half-life.
3. **Pain drive readers fire.** The Pain receptor on the Drives tissue (locus 0, gain 207) starts lighting up the decision lobe's pain bar. The Pain receptor on Sensorimotor locus 9 (`LOC_GAIT1`, threshold 33, gain 239) starts tripping the limp gait. The Pain receptor on Organ Somatic locus 0 (`RLOCUS_CLOCKRATE`, threshold 30, gain 255) accelerates the creature's organ clocks, so **the Norn ages faster while its Pain backup drains**. The Pain receptor on Circulatory locus 12 (threshold 191, gain 255) triggers when the instantaneous Pain is very high.
4. **Cross-coupling to protein hunger.** As reaction 42 produces Pain, reaction 56 converts that Pain at 6-tick half-life into Hunger-for-protein backup [132]. So every Pain unit that passes through the active drive ends up topping up the protein-hunger reservoir. A large `CHEM 131 <n>` therefore produces **sustained limping, accelerated ageing, and a delayed hunger spike** — a distinctive "sick / injured Norn" behavioural cluster.
5. **No self-refill.** Because no reaction ever writes to 131 again, the reservoir strictly drains. The total amount of Pain produced from the injection is bounded by the initial *n* (minus whatever is lost to other reactions consuming active Pain before it is read).

This is by far the cleanest way for a bootstrap script to simulate a **lingering ache**: the stim path gives you a single sharp pain event, whereas `CHEM 131 <large>` gives you several in-game minutes of slowly-fading pain with all the usual receptor consequences.

### Interaction with pain-suppressing chemicals

Several stock chemicals oppose Pain either by directly antagonising the receptor (*Medicine one*, chemical 92) or by consuming the Pain molecule in a metabolic reaction (*Prostaglandin*, chemical 94, via receptor 139 on RLOCUS_RATEOFREPAIR — though this one actually *repairs* in response to injury rather than reducing pain chemically). Because these act at chemical 148, they do **not** drain Pain backup. A Norn that has been given `CHEM 131 <n>` will therefore continue to hurt long after an analgesic has worn off: the analgesic masks whatever active Pain is present at the moment, but the 311-tick drip-feed keeps the chemical topped up.

This behaviour — "pain returns after painkillers wear off" — is not deliberately engineered by the stock genome (nothing in the wild Norn ever uses 131), but it emerges automatically from the chemistry graph if a script chooses to fill the reservoir.

### Implications for modders

Common modifications built on top of Pain backup:

1. **Add a refill reaction `Pain → Pain backup`** (mirroring the Sleepiness pattern). The simplest fix for the cross-coupled drain on chemical 132: add the missing reaction and the Pain drive will re-populate its own reservoir whenever the creature is hurt, producing genuine **pain memory** (a hit that still aches minutes later).
2. **Add a pain-memory receptor** on a custom lobe that reads chemical 131 rather than 148. Because 131 changes on a minute-scale timescale while 148 bounces on a second-scale timescale, a lobe reading the backup gives the brain access to *chronic* pain history rather than *acute* pain events. This is a common addition in "smart" Norn mods that aim to let the creature learn from past injury.
3. **Gate reaction 42 with an enzyme**, e.g. `Pain backup + Endorphinase → Pain + Endorphinase`. Combined with an emitter on the enzyme, this lets the genome dynamically choose when accumulated pain memory becomes felt pain (a natural way to implement an "adrenaline overrides pain" or "pain during dreaming" mechanic).
4. **Raise the initial concentration** so newly-hatched Norns already feel some background pain — a crude way to simulate a creature "born damaged" in breeder challenges.

Because the chemical has no receptor and no inbound reaction in the stock genome, these modifications are isolated from every other gene and generally cannot destabilise an otherwise-healthy Norn's biochemistry.

### Practical consequences for gameplay

- **`CHEM 131 <n>` is the canonical CAOS call for "slow-burn pain".** Unlike `STIM WRIT <c> 0 <n>` (which produces a single sharp pain spike via chemical 148), injecting Pain backup produces a drawn-out ache that lingers for several seconds at full strength and then tails off over roughly a minute. Use it in scripts that want to model long-term injury (fighting damage, toxic spore exposure, infected wound) rather than instantaneous hits.
- **Pain backup is invisible to Norn-care tools that monitor chemical 148.** A Norn can have 200 units of Pain backup banked while its visible Pain bar reads 20 (because only the currently-converted portion shows up on the drive). Players who watch the chemistry UI for acute pain may miss this. Tools like the Science Kit's full chemical list will show it, but the default "Drives" view will not.
- **The backup is cleared by Medicine One only indirectly.** Medicine One (chemical 92) neutralises active Pain but does not touch the reservoir; a script that wants to fully reset the creature's pain must inject Medicine One *and* explicitly zero chemical 131 via `CHEM 131 -255`.
- **Wild-type Norns never fill the backup.** Any observed non-zero value of chemical 131 in a running game is traceable to (a) a deliberate script injection, (b) a modded genome with an added refill reaction, or (c) PRAY-imported creatures from genomes that include such a reaction. This makes chemical 131 a useful **diagnostic marker** for modded Norns when analysing creature history.

### Summary

```
 Stock-genome wiring of Pain backup [131]
 ───────────────────────────────────────────────
 Inputs:  (none endogenous)                          ← missing refill reaction
           ↑
           └── CHEM 131 <n>  (CAOS / scripts / mods only)

          Pain backup [131]          half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                │
                │ reaction 42 (gene 7):  1× Pain backup → 1× Pain
                │ half-life 311 ticks (~10 s) — spontaneous, no catalyst
                ▼
          Pain drive [148]           half-life 172 ticks (~5.7 s)
                │
                ├─► Drives locus 0 (gain 207) ─────► brain "pain bar"
                ├─► Organ Somatic locus 0 (thresh 30, gain 255) ─► RLOCUS_CLOCKRATE (accelerated ageing)
                ├─► Sensorimotor locus 0 (thresh 48) ────────────► LOC_INVOLUNTARY0 (lay egg)
                ├─► Sensorimotor locus 9 (thresh 33, gain 239) ──► LOC_GAIT1 (limp)
                ├─► Circulatory locus 12 (thresh 191, gain 255) ─► high-pain reflex
                │
                └─► reaction 56 (gene 20): Pain → Hunger for protein backup [132]
                                           (mis-wired cross-coupling — *not* a self-refill)
```

Pain backup is therefore best understood as a **latent reservoir chemical** — a fully-typed drive-backup slot with the plumbing of a Sleepiness-backup but without the accompanying pump. It plays no role in wild-type Norn biochemistry, yet it is a complete and well-behaved chemical that scripts and mods can enlist to produce a distinctive **slow drip** of pain that the stim path cannot. Of the sixteen backup chemicals in the 131–146 block, Pain backup is the one where the missing refill is most noticeable, and it is the canonical worked example of why the "drive-plus-backup" architecture is powerful even when only half of it is wired in the shipped genome.
