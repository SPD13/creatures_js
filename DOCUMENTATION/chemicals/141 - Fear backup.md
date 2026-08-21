# 141 - Fear backup

Fear backup occupies the eleventh slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome normally pairs one-to-one with the sixteen drive chemicals in the 148–161 range. It would conceptually be the **reservoir half** of the Fear drive — the long-moving chronic pool that would buffer the acute Fear (158) signal the brain reads. In practice, however, chemical 141 is one of the few **completely unwired slots** in the stock biochemistry: it has no emitter, no receptor, no neuroemitter, no initial concentration, and — crucially — **no reaction wires it to its would-be active partner**. Where every other drive in the block has a matched pair of reactions (`backup → active` drip-feed and `active → backup` sweep), Fear has no such plumbing. The Fear drive therefore runs without a reservoir: Fear (158) is produced, decays, and is consumed directly, with no chronic-signal shadow chemical behind it.

The half-life table entry for chemical 141 is identical to the other unused reservoir slots: `genomeValue: 255`, half-life ≈ 9·10¹⁰ ticks (decay rate exactly `1.0`), labelled "Very long". This means that if anything ever *did* write to chemical 141 — a modded gene, a CAOS `CHEM 141 <n>` from a script, or an agent injecting it into the creature's bloodstream — whatever mass landed in the slot would persist essentially forever, because nothing drains it. Together with the three other orphan drive-backup slots in the stock genome (Anger backup at 143 and Comfort backup at 145, plus the small-genome-value Sex drive backup at 144 which is Medium rather than Very long), Fear backup is best understood as a **reserved-but-empty reservoir** — a genome slot the engine recognises and can store concentration in, but one that the shipping biochemistry never touches.

Because of this, the gameplay behaviour of Fear is driven entirely by chemical 158 and its direct partners (Fear toxin 80, Adrenalin 117, Anger 160). The rest of this document describes *what the Fear pair would look like if wired analogously to Crowded or Boredom*, why the stock genome leaves it unwired, the resulting asymmetry between Fear and the reservoired drives, and the practical consequences for scripts, agents, and modders who want to use chemical 141 anyway.

## Sources

Fear backup has **no stock-genome inflow at all**. No emitter, neuroemitter, reaction, or initial-concentration entry writes to chemical 141. The only way mass ever enters the slot in a default game is through direct CAOS or PRAY-agent injection.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | No backup-filling reaction | — | — | The reaction table does **not** contain an `Fear [158] → Fear backup [141]` sweep. Every other active drive in the 148–161 range has such a reaction (sometimes duplicated), including Pain (70), protein/carb/fat hunger (71, 73, 74, 77, 78), Coldness/Hotness (75, 76, 80, 81), Tiredness (82, 83), Loneliness (84), Crowded (63), Boredom (65, 66), and Sex drive (67, 68) — but **Fear has none**. This is the most significant missing piece of plumbing in the stock biochemistry | — |
| 2 | No direct emitter on 141 | — | — | The emitters table contains no entry whose target chemical is 141. No sensorimotor locus, circulatory locus, or organ tissue fires into the reservoir | — |
| 3 | No neuroemitter on 141 | — | — | The single stock neuroemitter (lobe 4 "move" neuron 37) writes Adrenalin [117] +8, Fear [158] +5, and Crowded [157] +6 when it fires — but **not** chemical 141 | — |
| 4 | No initial concentration | — | — | Chemical 141 does not appear in the genome's initial-concentration table. A newly-hatched Norn is born with exactly 0 Fear backup and, because no reaction fills the slot, it stays at 0 for the creature's entire life unless a script writes to it | — |
| 5 | No cross-drive spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`) or the Sleepiness pair (where Sleep toxin metabolism produces active Sleepiness that is swept into its backup), there is no stock-genome reaction that routes any other chemical into chemical 141. The Fear axis is wholly decoupled from the reservoir | — |
| 6 | Direct CAOS injection | — | Any | `CHEM 141 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively permanent because the chemical's half-life is ≈ 9·10¹⁰ ticks and no reaction drains it |
| 7 | Modded genomes | User-added | User-added | Breeders frequently add the missing `Fear → Fear backup` sweep reaction to convert the drive into a reservoired pair that behaves like Crowded or Boredom. Another common mod is to add a `Fear backup → Fear` drip reaction so that a CAOS-injected 141 value surfaces gradually as active Fear, and/or to wire a "traumatic memory" neuron as a neuroemitter into 141 so that long-term fear conditioning accumulates in the reservoir independently of the fast-decaying active drive | Gene-dependent |

## Usage

Fear backup has **no stock-genome consumers**. With no receptor to read it and no reaction to drain it, any value injected into chemical 141 sits in the slot indefinitely. The only "use" in the default game is as a permanent annotation — mass placed there neither decays nor exerts any effect.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | No backup → active conversion reaction | — | — | There is **no** `Fear backup [141] → Fear [158]` reaction in the stock genome. Where every other reservoired drive has a ~311-tick Medium drip reaction releasing reservoir mass into its active partner, Fear has none. Mass deposited in 141 cannot surface as active Fear without a modded reaction | — |
| 2 | Passive decay (effectively none) | Gene 64 entry #141 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate exactly `1.0`), labelled "Very long" | All sixteen drive backups share this near-infinite half-life by design: the chemical is meant to be a reservoir, not a signal. Combined with the absence of any drain reaction, this makes 141 a **completely static slot** in stock play: once written, the value persists forever | — |
| 3 | No receptor | — | — | Chemical 141 is **not read by any stock receptor**. No drive tissue, brain lobe, sensorimotor locus, circulatory locus, or organ receptor reads its concentration. The creature has no awareness of its Fear-backup value, and no downstream behaviour changes with it | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter table does not wire any brain neuron to chemical 141 | — |
| 5 | Modded consumers | User-added | User-added | Modders who want 141 to matter typically add (a) a `Fear backup → Fear` drip reaction at Medium speed so the reservoir surfaces like the other drive backups, (b) a drive-tissue receptor on 141 so that chronic fear weights the decision lobe independently of acute Fear, (c) an enzyme-gated release reaction (analogous to Sleepase gating Sleepiness-backup release) so that banked fear only surfaces in response to a specific trigger chemical, or (d) a sensorimotor receptor on 141 to make the gait or involuntary-action response sensitive to chronic rather than acute fear | Gene-dependent |

## Role in Game Mechanics

### The orphan-reservoir pattern

Creatures 3 organises each drive in the 148–161 range as a *nominal* pair: a short-lived active drive chemical and a long-lived backup reservoir. The block is laid out so that chemical `148 + n` is paired with chemical `131 + n` for `n` = 0…13, giving fourteen drive pairs plus two extra reservoir slots:

| n | Active (148 + n) | Backup (131 + n) | Wired in stock? |
|---|-------------------|-------------------|-----------------|
| 0 | 148 Pain | 131 Pain backup | Yes (full pair) |
| 1 | 149 Hunger for protein | 132 Hunger for protein backup | Yes (full pair + Pain spillover) |
| 2 | 150 Hunger for carbohydrate | 133 Hunger for carb backup | Yes (full pair, duplicated refill) |
| 3 | 151 Hunger for fat | 134 Hunger for fat backup | Yes (full pair, duplicated refill) |
| 4 | 152 Coldness | 135 Coldness backup | Yes (full pair, duplicated refill) |
| 5 | 153 Hotness | 136 Hotness backup | Yes (full pair, duplicated refill) |
| 6 | 154 Tiredness | 137 Tiredness backup | Yes (full pair) |
| 7 | 155 Sleepiness | 138 Sleepiness backup | Yes (full pair + Sleepase enzyme gate) |
| 8 | 156 Loneliness | 139 Loneliness backup | Yes (full pair, single-pull) |
| 9 | 157 Crowded | 140 Crowded backup | Yes (full pair, single-pull) |
| 10 | **158 Fear** | **141 Fear backup** | **NO — backup is orphan** |
| 11 | 159 Boredom | 142 Boredom backup | Yes (full pair, single-pull) |
| 12 | 160 Anger | 143 Anger backup | NO — backup is orphan |
| 13 | 161 Sex drive | 144 Sex drive backup | Yes (full pair, single-pull) |
| — | — | 145 Comfort backup | NO — backup is orphan (no active partner either) |
| — | — | 146 (unused) | — |

Fear backup is therefore one of three reservoir slots (141, 143, 145) that the stock genome simply leaves empty. The pattern is consistent: **all three orphan reservoirs belong to the "emotional" end of the drive spectrum** — Fear, Anger, and Comfort — whereas the reservoired pairs cover physical needs (hunger, thermoregulation, tiredness, social density, boredom with the current environment, sex drive). The design implication is that the shipping biochemistry models emotional drives as **fast, ephemeral signals** without a chronic-memory buffer, while physical drives get a long-tail reservoir that averages their signal over minutes.

### Why the stock genome leaves Fear unreservoired

Fear (158) is already one of the most richly-wired active drives in the genome, with four receptors tapping it (the decision-lobe drive bar, a cardiac clock-rate acceleration, a digital circulatory panic trigger, and a sensorimotor gait-4 switch) and three sources feeding it (Fear-toxin metabolism, Anger↔Fear exchange, and an adrenaline-driven autocatalytic amplifier). These mechanics are sufficient to give the creature a responsive, realistic fear response:

1. A frightening stimulus (e.g. a predator in view, a painful event, a loud sound) triggers a brain-lobe output or an organ reaction that produces Fear toxin or directly emits Fear via the "move" neuroemitter.
2. The acute Fear level rises sharply.
3. If Adrenalin is present (as it usually is in stressful contexts, because the stress pathway emits it too), reaction 38 amplifies Fear autocatalytically — the more Fear, the more Fear is produced per tick, until Adrenalin is exhausted.
4. Fear passes the cardiac receptor threshold (45) and accelerates the heart rate, passes the sensorimotor receptor threshold (128) and switches the gait, and (if high enough) passes the circulatory panic threshold (204) and triggers the digital panic locus.
5. Fear decays at a Medium half-life (686 ticks, ~23 seconds at 30 Hz) and is partially converted to Anger via reaction 40, giving the classic fear→anger transition after prolonged exposure.

This rich active-drive wiring means Fear already has strong short-term dynamics, and a reservoir would dilute rather than add to it: any chronic buffering would mute the sharp spikes that make fear useful as a behavioural signal. The stock design therefore opts for a **purely acute** Fear drive. The reservoir slot exists only as a placeholder that modders can wire up if they want slower fear dynamics.

The same reasoning applies to Anger backup (143) and Comfort backup (145): both active partners have strong acute dynamics (Anger through its adrenaline autocatalysis, and Comfort — via chemical 161 Sex drive and related pleasure pathways — through direct reward emitters) and don't benefit from a chronic buffer in the default design.

### How Fear actually works without a reservoir

Because 141 is unwired, the complete active-drive dynamic of Fear runs entirely through chemical 158. The sources of Fear in stock play are:

| Source | Mechanism | Half-life / rate | Role |
|--------|-----------|------------------|------|
| Reaction 79 (gene 93) | `14× Fear toxin [80] → 1× Fear [158]` | 24 ticks ("Short", ≈ 0.8 s) | The primary exogenous source: an event (pain, startle, brain-lobe trigger) produces Fear toxin, which is metabolised into active Fear at a short half-life. The 14:1 stoichiometry means a substantial toxin injection is needed for a meaningful Fear rise |
| Reaction 41 (gene 3) | `1× Anger [160] → 1× Fear [158]` | 95 ticks ("Short", ≈ 3.2 s) | Mutual conversion with Anger. Lets the creature oscillate between the two adrenaline-driven emotions: fear can decay into anger, anger can decay back into fear, and the equilibrium is determined by which emitters are currently active |
| Reaction 38 (gene 5) | `1× Fear [158] + 1× Adrenalin [117] → 2× Fear [158] + 1× Adrenalin [117]` | 58 ticks ("Short", ≈ 2 s) | Autocatalytic amplifier: fresh Fear doubles every ~2 seconds as long as Adrenalin is present. Switches on at Adolescent stage (`switchOnAge: 2`), so it applies only to mature creatures. This is the engine of the panic response — once Fear crosses the Adrenalin threshold, it escalates quickly |
| Neuroemitter #1 | `move lobe (4) neuron 37 → +8 Adrenalin [117], +5 Fear [158], +6 Crowded [157]` at rate 4 | Instant, fires whenever neuron 37 is active | Direct brain-neuron production. Lobe 4 is the "move" motor lobe, so this fires when a particular learned action is chosen. The simultaneous Adrenalin release primes the autocatalysis reaction |

And the sinks of Fear are:

| Sink | Mechanism | Half-life / rate | Role |
|------|-----------|------------------|------|
| Reaction 40 (gene 1) | `1× Fear [158] → 1× Anger [160]` | 95 ticks ("Short", ≈ 3.2 s) | Fear-to-anger conversion. After a frightening stimulus, sustained Fear gradually becomes sustained Anger — the classic "scared → angry" emotional progression |
| Passive decay | Gene 64 entry 158 (Medium) | 686 ticks ("Medium", ≈ 23 s) | Slow spontaneous decay. On its own, Fear halves every 23 seconds of real time, so a single spike fades to negligible levels within a minute or two |

Notably absent is any **sweep** reaction into chemical 141. Every other active drive has such a sweep (Crowded → Crowded backup at half-life 6, Boredom → Boredom backup at 6, Loneliness → Loneliness backup at 6, Tiredness → Tiredness backup, etc.) but Fear does not. Mass produced by the four Fear sources stays in chemical 158 until it is either converted to Anger (reaction 40), consumed by the Fear+Adrenalin amplifier (actually a producer, not a consumer), or decays passively.

### The four Fear receptors

All four receptors that read the Fear signal target chemical 158, never chemical 141:

| Receptor | Tissue / Locus | Threshold / Gain | Flags | Effect |
|----------|----------------|------------------|-------|--------|
| #11 (gene 10) | Creature / Drives (tissue 5) / locus 10 "Fear" | threshold 0, gain 209, from Baby | analogue | The decision-lobe drive bar. The analogue gain of 209 (out of 255) is symmetric with the Loneliness drive receptor (gain 207), Crowded drive receptor (gain 209), and Boredom drive receptor (gain 211) — all four emotional drives have comparable weighting at the decision-lobe level |
| #141 (gene 126) | Organ 2 "Reaction" / Somatic (tissue 0) / locus 2 "RLOCUS_INJURY" → Antigen 0 [82] | threshold 0, gain 56, from Baby | analogue | (This receptor actually targets Antigen 0, not Fear — the id 141 is coincidental. Included here to disambiguate from the chemical id 141) |
| #142 (gene 17) | Organ 2 "Reaction" / Somatic (tissue 0) / locus 0 "RLOCUS_CLOCKRATE" | threshold 45, gain 255, from Baby | analogue | Cardiac acceleration. Whenever Fear exceeds threshold 45/255 (~18 %), the heart-rate clock accelerates at full gain. This is the physiological "heart races when scared" response. Because it's analogue, the acceleration scales with how much Fear is present |
| #157 (gene 55) | Creature / Circulatory (tissue 1) / locus 11 "Locus 11" | threshold 204, gain 255, from **Youth** | **DIGITAL** | The panic trigger. Whenever Fear exceeds threshold 204/255 (~80 %), this receptor fires its full digital output, switching on an involuntary circulatory response. Only switches on at Youth stage, so very young creatures cannot panic — they can feel fear (via the decision-lobe drive) but cannot physiologically panic |
| #188 (gene 102) | Creature / Sensorimotor (tissue 4) / locus 12 "LOC_GAIT4" | threshold 128, gain 223, from Baby | analogue | Gait switching. Whenever Fear exceeds threshold 128/255 (~50 %), sensorimotor gait 4 (the "flee" or "panic-run" gait) is activated with gain 223. This is how fear changes how the creature moves — fast, jittery movement at high Fear levels |

Every one of these receptors reads chemical 158, not 141. No stock receptor anywhere in the body, brain, or organs reads Fear backup.

### What a CAOS `CHEM 141 <n>` injection actually does

Because chemical 141 has no consumer and no receptor:

1. **Tick 0:** The backup rises to *n*. Nothing in the creature's biochemistry, physiology, gait, or decision-making changes.
2. **Ticks 1 → ∞:** Nothing happens. The half-life is 9·10¹⁰ ticks (effectively permanent) and there is no reaction to drain the slot. The value persists for the creature's entire life.
3. **No collateral effect.** The injection produces no Fear, no Anger, no Adrenalin, no cardiac acceleration, no gait change, no panic, and no drive-bar movement. It is functionally invisible.

The only way a `CHEM 141 <n>` write becomes observable is if the creature's genome has been modded to include a `Fear backup → Fear` reaction or a receptor on 141. In a stock genome, the write is a **no-op** that simply leaves a permanent numerical tag in the bloodstream — detectable only via the Science Kit's chemical panel or via `CHEM` read-back commands.

Conversely, `CHEM 141 -n` zeroes the slot (clamped to 0 from below), which again has no observable effect in a stock genome.

### Contrast with the wired drive backups

The three fully-wired reservoired drives that are structurally closest to what a hypothetical wired Fear backup would look like are Loneliness backup (139), Crowded backup (140), and Boredom backup (142). All three use the **single-pull** pattern (one `active → backup` sweep at Very short half-life, one `backup → active` release at Medium half-life). If the stock genome had wired Fear analogously, the Fear pair would look like:

| Role | Chemical id | Name | Half-life | Hypothetical wiring |
|------|-------------|------|-----------|---------------------|
| Backup reservoir | 141 | Fear backup | ~9·10¹⁰ ticks ("Very long") | Inflow from `Fear → Fear backup` sweep (Very short, ~6 ticks) |
| Active drive | 158 | Fear | 686 ticks ("Medium") | Inflow from fear-toxin breakdown + anger conversion + adrenalin autocatalysis + "move" neuroemitter |

And the two missing reactions would be:

| Hypothetical | Formula | Half-life | Role |
|--------------|---------|-----------|------|
| Missing #1 | `Fear [158] → Fear backup [141]` | ~6 ticks ("Very short") | Sweep acute Fear into the reservoir |
| Missing #2 | `Fear backup [141] → Fear [158]` | ~311 ticks ("Medium") | Drip reservoir into acute Fear |

With such wiring, Fear would behave like Crowded: a frightening stimulus would produce a large acute spike, most of which would be banked into the reservoir within a fraction of a second, and the reservoir would then release the mass back as a minutes-long lingering fear. The creature would experience acute fear *and* a long post-fear "I'm still on edge" tail.

The stock design chooses not to do this because the scripted interactions that produce Fear in a C3/DS game session are already somewhat infrequent and sharp (a predator sighting, a painful event, a startle from a Grendel, the "scary sound" scripts) — adding a minutes-long chronic tail would make creatures feel perpetually anxious because every brief startle would leave a week-long residue. The acute-only Fear model keeps the emotion responsive and ephemeral.

### Differences from the Anger backup and Comfort backup orphans

Fear backup shares its orphan status with chemicals 143 (Anger backup) and 145 (Comfort backup). The three orphan reservoirs differ in how their active partners are wired:

| Orphan backup | Active partner | Active-partner sources | Active-partner consumers | Notes |
|---------------|----------------|------------------------|--------------------------|-------|
| 141 Fear backup | 158 Fear (Medium, 686 ticks, genomeValue 66) | Reaction 79 (Fear toxin), reaction 41 (Anger), reaction 38 (Adrenalin autocatalysis), neuroemitter #1 | Reaction 40 (→ Anger), passive decay | Four receptors (Drives, RLOCUS_CLOCKRATE, Circulatory locus 11 digital panic, LOC_GAIT4). Most richly-wired orphan |
| 143 Anger backup | 160 Anger | Reaction 40 (Fear), reaction 39 (Adrenalin autocatalysis) | Reaction 41 (→ Fear), passive decay | Mirrors Fear almost exactly — autocatalysis, Anger↔Fear exchange, similar receptors |
| 145 Comfort backup | (no active partner — 145 has no 158+n pair) | — | — | The only completely isolated orphan — both the reservoir *and* the hypothetical active chemical are absent from the genome. Chemical 161 Sex drive occupies the expected slot (148+13=161, backup at 131+13=144 Sex drive backup) instead |

Fear backup is therefore the most "almost-wired" of the orphans: its active partner Fear is fully functional and heavily used in game scripts, and only the sweep and drip reactions are missing. This makes it the cleanest starting point for modders who want to add reservoir dynamics.

### Implications for modders

Common modifications that build on chemical 141:

1. **Add the missing `Fear → Fear backup` sweep** (at half-life ~6 ticks, "Very short"). This single reaction is enough to start banking Fear automatically, and combined with the existing `9·10¹⁰`-tick half-life, gives the creature a permanent "fear memory" that accumulates over its lifetime.
2. **Add the missing `Fear backup → Fear` drip** (at half-life ~311 ticks, "Medium"). Without this, mass swept into the reservoir can never surface as active Fear again — the slot would become a write-only accumulator. With both reactions wired, Fear behaves like Crowded.
3. **Wire a brain-neuron neuroemitter into 141 directly** — for example, an "unfamiliar creature memory" cell from the stimulus lobe, so that specific perceptual history (rather than raw events) feeds the fear reservoir. Produces a kind of long-term fear learning that evolves independently of the acute drive.
4. **Add a drive-tissue receptor on 141** to make the decision lobe sensitive to chronic fear independently of acute fear. A scared-but-then-recovered creature would still show a residual "scared" drive bar for some minutes after the acute signal has decayed.
5. **Gate a `Fear backup → Fear` release with an enzyme catalyst** — e.g. an "anxiety trigger" chemical produced by specific stimuli, so banked fear only surfaces when a specific cue is present. Analogous to how Sleepase gates Sleepiness backup release.
6. **Wire a `Pain → Fear backup` spillover reaction** to simulate trauma: severe pain events would permanently increase the creature's fear baseline, giving PTSD-like behaviour.
7. **Raise the half-life's decay rate slightly below 1.0** so the reservoir drains slowly over hours, simulating gradual habituation to past trauma.
8. **Add a clearance reaction** like `Fear backup + Comfort [160 analog] → nothing` so that comfort/reassurance events can explicitly reduce banked fear. Mirrors how the Stress/Prostaglandin reaction clears stress.

Because chemical 141 has no existing connections, these modifications are **maximally safe** — nothing in the stock genome is perturbed by writes to or from 141, and any added wiring is purely additive.

### Interaction with bootstrap scripts and save/load

- **CAV save files preserve chemical 141 exactly.** The engine serialises all 256 chemical slots, including unwired ones. A creature exported with a non-zero 141 value (perhaps from a mod or a script that wrote to it) will be imported with the same value. In a stock-genome game session that value will never change and never affect behaviour, but it will be visible to scripts that explicitly read it.
- **The `MakeYourselfTired` shutdown helper** does not touch chemical 141. A creature imported from a CAV therefore arrives with its saved 141 value, whatever it was.
- **The Science Kit's chemical panel displays chemical 141** in its "Fear backup" slot. A Norn with a non-zero value there will show a numerical reading even though nothing else in the game reads it.
- **Agent scripts and CAOS debugging**: scripts can legitimately use chemical 141 as a **stable long-term tag** — e.g. a "this creature has been taught the safe-zone lesson" flag — because the genome guarantees nothing else will ever write to or read from it. This is a niche but genuine use of the slot as a private data channel per creature. Writing `CHEM 141 50` on a creature at lesson-completion time and later reading it with `CHEM 141` gives a portable, persistent, creature-specific annotation that survives saves, loads, and reboots.

### Why the slot exists at all

The drive-backup block is a reserved region in the genome format, not a dynamic allocation. The engine treats chemicals 131–146 as the "backup block" and allocates 16 contiguous slots whether or not the shipping genome uses them. Leaving 141, 143, and 145 empty is a deliberate design choice: it keeps the active-drive numbering symmetric (each 148+n maps to 131+n) even where the reservoir is intentionally unwired, and it preserves space for modders and future official additions to expand the biochemistry without renumbering the drive chemicals.

Because the layout is fixed, a fan-made genome that adds reactions for chemical 141 is directly compatible with unmodded games — the active Fear drive behaves the same way, and the reservoir becomes active only on creatures whose genomes include the new reactions. This is how breeder communities have historically extended the emotional biochemistry without breaking compatibility.

### Summary

```
 Stock-genome wiring of Fear backup [141]
 ─────────────────────────────────────────
 Inputs:
    (none — no stock reaction, emitter, or neuroemitter writes to 141)
    CHEM 141 <n>  (CAOS / scripts / mods) ──────────▶ [141]

 Reservoir:
         Fear backup [141]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
         initial concentration: 0
         (no drain reaction)

 Outputs:
    (none — no stock reaction drains 141; no receptor reads it)

 Active partner runs independently:
         Fear [158]
         half-life 686 ticks ("Medium", ~23 s)
         initial concentration: 0
             │
             ├─◀ Reaction 79 (gene 93): 14× Fear toxin [80] → 1× Fear
             │   ("Short", 24 ticks)
             │
             ├─◀ Reaction 41 (gene 3): 1× Anger [160] → 1× Fear
             │   ("Short", 95 ticks)
             │
             ├─◀ Reaction 38 (gene 5, Adolescent+): Fear + Adrenalin → 2 Fear + Adrenalin
             │   ("Short", 58 ticks, autocatalytic amplifier)
             │
             ├─◀ Neuroemitter #1 (lobe 4 "move" neuron 37):
             │      +8 Adrenalin [117], +5 Fear [158], +6 Crowded [157], rate 4
             │
             ├─▶ Reaction 40 (gene 1): 1× Fear → 1× Anger ("Short", 95 ticks)
             │
             ├─▶ Drives receptor #11 (gain 209) ─────▶ decision-lobe "fear" bar
             ├─▶ Somatic receptor #142 (threshold 45, gain 255) ─▶ RLOCUS_CLOCKRATE (heart races)
             ├─▶ Circulatory receptor #157 (threshold 204, DIGITAL, Youth+) ─▶ panic locus
             └─▶ Sensorimotor receptor #188 (threshold 128, gain 223) ─▶ LOC_GAIT4 (flee gait)

 Result: Fear is a purely acute drive with no chronic-memory buffer.
         Frightening stimuli produce sharp spikes that decay over tens of seconds
         via passive decay and Anger conversion, without leaving a long tail.
```

Fear backup is therefore a **reserved-but-empty reservoir slot** — a genome placeholder for a reservoir that the shipping biochemistry intentionally does not populate. Its existence in the chemical table ensures numbering symmetry with the other drive-backup slots, its "Very long" half-life ensures that any mass ever placed in it (by CAOS, by mods, by agent scripts) will persist indefinitely, and its complete absence of stock reactions guarantees that in a default game it is an inert marker. Among the sixteen drive backups it shares orphan status with Anger backup (143) and Comfort backup (145), together forming the "emotional" trio of unwired reservoirs — a deliberate design choice that keeps Fear, Anger, and Comfort as fast, ephemeral signals rather than chronically-buffered drives, preserving the responsiveness of the emotional biochemistry while leaving room for modders to add reservoir dynamics if a slower-moving fear or anger signal is desired.
