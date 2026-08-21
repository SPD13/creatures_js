# 142 - Boredom backup

Boredom backup is the **reservoir half** of the drive pair for Boredom (chemical 159). It occupies the twelfth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry the creature's long-term banked *ennui* — the chronic "I have nothing interesting to do" signal that grows steadily throughout the Norn's life and that external stimulation (toys, minigames, agents, hand attention) must continually push back against. With its essentially infinite half-life (≈ 9·10¹⁰ ticks, decay rate exactly `1.0`, labelled "Very long"), whatever mass has been swept into the reservoir persists indefinitely unless actively drained by the `backup → drive` release reaction or cleared by an external CAOS / STIM write.

Boredom is the **most unusual** of the sixteen drive pairs, and chemical 142 is the key to understanding why. Unlike every other active drive in the 148–161 range, Boredom (159) itself also carries a **"Very long"** half-life — it does **not** passively decay. Coupled with a **constant `LOC_CONST` emitter** that drips fresh Boredom into the active drive every tick regardless of any sensorimotor state, and with the **doubled self-refill** (two separate `Boredom → Boredom backup` reactions at "Very short" half-life, matching the dynamic class of the carb / fat / coldness / hotness pairs rather than the single-pull class of Crowded / Loneliness / Fear / Anger), the net effect is a monotonically-accumulating ennui signal. There is **no stock biochemistry reaction that destroys boredom** anywhere in the genome. Mass added to the pair by the constant emitter can only leave the creature via external STIM / CAOS writes that deliver negative chemical payloads when the Norn successfully engages with a novel stimulus — pressing a button on a computer, poking an interactive toy, eating, playing with another creature, etc. Boredom backup is the chronic half of that pressure: it silently accumulates behind the active drive, ready to drip-feed boredom back onto the decision-lobe bar as soon as external stimulation stops.

Like the other drive backups, the Boredom-backup slot has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration, and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its entry in the half-life table records a "Very long" decay, and the initial-concentration table contains **no entry** for 142, so every newly-hatched Norn starts with exactly zero boredom backup — but with an active Boredom of 90/255 (≈ 35 %) already present. The reservoir fills from that seed within the first few ticks of life and continues to grow for the rest of the Norn's existence, every minute the creature is not being actively entertained.

## Sources

Boredom backup has a single endogenous inflow from the active drive via **two duplicated sweep reactions**, plus external injection. Nothing in the brain, sensorimotor, or organ layers writes to it directly — it is filled only through the `Boredom → Boredom backup` self-refill, which itself depends on the constant `LOC_CONST` emitter continuously feeding the active drive and on the initial-concentration seed value loaded at hatching.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive (primary sweep) | Gene 57 (reaction id 64) | Organ #2 "Reaction" | `1× Boredom [159] → 1× Boredom backup [142]` at rate byte 18, half-life **6 ticks** ("Very short", decay rate 0.88978) | ~11 % of active Boredom swept per tick |
| 2 | Self-refill from active drive (duplicate sweep) | Gene 69 (reaction id 72) | Organ #2 "Reaction" | `1× Boredom [159] → 1× Boredom backup [142]` at rate byte 18, half-life **6 ticks** ("Very short", decay rate 0.88978) | A **second** identical reaction stacks on top of reaction 64. Because reaction rates combine additively in the bloodstream, the effective sweep rate is ≈ 21 % per tick — placing the Boredom pair in the **doubled-pull** dynamic class alongside the carb / fat / coldness / hotness pairs, and **contrasting** with the single-pull Crowded / Loneliness / Fear / Anger pairs whose backup has no second sweep. The doubled-pull design makes short-term active-drive spikes (e.g. a brief engagement with a toy that fires a negative-boredom STIM) get absorbed into the reservoir almost instantly, so transient events don't show up on the drive bar |
| 3 | LOC_CONST sensorimotor emitter (indirect, via reactions 64 + 72) | Gene 3 (emitter id 2) | Sensorimotor tissue, locus 0 `LOC_CONST`, chemical 159 | threshold 128, rate 8, gain 1, **DIGITAL** — fires at a fixed gain of 1 every tick that `LOC_CONST > 128/255`. `LOC_CONST` is a **constant value of 255** (Sensorimotor locus 0 in C3 biochemistry always reads full-scale), so this emitter **always fires**, delivering a steady drip of active Boredom into the creature every tick of its life. The resulting active Boredom is then swept into the backup within a few ticks by reactions 64 + 72 | Constant drip; the creature's "boredom clock" advances at a fixed rate regardless of sensorimotor state, brain activity, or environmental context |
| 4 | Initial seed on active partner | Gene 13 (initial concentration id 24) | Bloodstream | Chemical 159 "Boredom" is loaded with **amount 90 / concentration 0.3529** at hatching. Chemical 142 itself is **not** in the initial-concentration table, so backup starts at 0 — but the seed value of 90 in the active drive is swept into the backup within a few ticks by reactions 64 + 72 | One-shot at birth; typically contributes ≈ 60–80 units to the backup within the first second of real time |
| 5 | Direct CAOS injection | — | Any | `CHEM 142 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively permanent because the chemical's half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 6 | No direct emitter to the backup | — | — | The emitter table contains no entry whose target chemical is 142. No brain neuron, sensorimotor locus, or organ tissue writes to the reservoir directly — it is filled entirely by reactions 64 + 72 from the active drive | — |
| 7 | No neuroemitter hook | — | — | The sole stock neuroemitter (lobe 4 "move" neuron 37) writes Adrenalin [117], Fear [158], and Crowded [157] — not Boredom or Boredom backup | — |
| 8 | No pathology or cross-drive spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`) or the sleep pair (where Sleep-toxin metabolism produces active Sleepiness that is swept to the backup), there is no stock-genome reaction that routes pathology, injury, or any other drive into the Boredom reservoir. The boredom axis is wholly decoupled from pain, hunger, thermoregulation, illness, and the other drives — it is a self-contained clock | — |
| 9 | Modded genomes | User-added | User-added | Breeders sometimes replace the `LOC_CONST` emitter with a more sophisticated "novelty detector" — e.g. a sensorimotor emitter tied to room cell-count or to a perception lobe's "unfamiliar stimulus" signal — so that boredom grows faster in impoverished environments and slower in rich ones. Another common mod is to add a `Boredom backup → (nothing)` slow decay reaction so that a Norn at peace gradually "forgets" its accumulated ennui, preventing the runaway growth that plagues long-lived stock Norns | Gene-dependent |

## Usage

Boredom backup has exactly **one consumer in the stock biochemistry** — reaction 54, the backup → active drip — and **no direct receptor**. Critically, the biochemistry contains **no reaction anywhere that destroys boredom mass**: neither the active drive nor the backup has a consumption pathway, so the total boredom (142 + 159) only grows over the creature's lifetime. The only way to *reduce* boredom is via external STIM / CAOS writes delivered by agents and scripts when the creature successfully engages with a stimulating object.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion (drip release) | Gene 17 (reaction id 54) | Organ #2 "Reaction" | `1× Boredom backup [142] → 1× Boredom [159]` at rate byte 58, half-life **311 ticks** ("Medium", decay rate 0.99777) | Every backup unit slowly becomes an active-drive unit at a medium rate (~10 s at 30 Hz). Combined with the **doubled "Very short"** (6-tick) reverse refill (reactions 64 + 72), this produces a heavily-damped equilibrium in which the two chemicals constantly exchange, tilted ≈ 99:1 toward the backup |
| 2 | Passive decay (effectively none) | Gene 64 entry #142 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | All sixteen drive backups share this near-infinite half-life by design: the chemical is a reservoir, not a signal. Uniquely, the **active partner Boredom [159] also has a "Very long" half-life** (genomeValue 255, same rate) — making the Boredom pair the only drive in which **neither half** spontaneously decays. All other active drives (Pain, hungers, Coldness, Hotness, Tiredness, Sleepiness, Loneliness, Crowded, Fear, Anger, Sex drive) carry a Medium, Short, or similar natural decay. For Boredom, mass is conserved between the two slots (modulo external STIM writes) |
| 3 | No consumption reaction (the critical absence) | — | — | The reaction table contains **no** entry of the form `Boredom [159] → X` or `Boredom backup [142] → X` where X is anything other than the other half of the pair. Compare with Crowded (destroyed by reaction 24 against Loneliness), Fear (converted to Anger by reaction 40 then passive-decayed), Pain (passive-decayed at Medium half-life). Boredom has none of these: it is a **conservative** drive in the stock genome, and without external intervention will only grow | The combination of "constant emitter + no consumer + no passive decay" guarantees that boredom is always the rising drive in an unattended Norn |
| 4 | External STIM / CAOS writes (the real consumer) | — | Agent scripts | `STIM WRIT` / `STIM SIGN` from agent event handlers, or `CHEM 159 -n` / `CHEM 142 -n` from scripts. Toys, food, drink, minigames, computers, compost, the Hand's tickle, and many other agents fire stimuli carrying negative chemical payloads for Boredom when the Norn successfully interacts with them | The engine's `STIM` machinery is how boredom is actually reduced in gameplay. A Norn that pushes a button on the Juke Box, for example, receives a stimulus whose chemical list includes a negative Boredom payload; the Science Kit's "give attention" button similarly clears some boredom. Without agent-driven STIMs, a stock Norn will simply accumulate boredom until the decision lobe preferentially chooses any available stimulating action over all other drives |
| 5 | No receptor | — | — | Boredom backup is **not read by any stock receptor**. No drive, brain lobe, sensorimotor locus, circulatory locus, or organ receptor reads chemical 142's concentration. All behavioural awareness flows through the active drive at 159 via the single decision-lobe receptor (see *What the active drive does that the backup cannot* below) | — |
| 6 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 142 | — |
| 7 | Modded consumers | User-added | User-added | Modders can add a slow passive decay (e.g. `Boredom backup → (nothing)` at Long half-life) to give the reservoir a natural time-forgetting pathway, add a Boredom-backup receptor on a "habituation" lobe so the creature learns from chronic ennui rather than spike-driven boredom, gate reaction 54 with an enzyme catalyst (so release only occurs when a specific "idle trigger" chemical is present), or add a Sleep / Sleepiness-coupled clearance reaction (`Boredom backup + Sleepiness → Boredom backup'` at some rate) so that sleeping reduces accumulated boredom — a common mod to prevent the runaway growth that plagues long-lived stock Norns | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: an active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Boredom drive the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **142** | **Boredom backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 159 | Boredom | ~9·10¹⁰ ticks ("Very long") | 90 / 255 ≈ 0.3529 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 17 (id 54) | `Boredom backup → Boredom` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 57 (id 64) | `Boredom → Boredom backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (sweep #1) |
| Gene 69 (id 72) | `Boredom → Boredom backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (sweep #2, duplicate) |

### The doubled-sweep dynamic class

Every drive pair in the stock genome belongs to one of two dynamic classes, determined by whether its `active → backup` sweep reaction is **duplicated**:

| Class | Sweep reactions | Effective rate | Drives in class |
|-------|-----------------|----------------|-----------------|
| **Single-pull** (single sweep) | 1 × "Very short" | ≈ 11 % /tick | Pain, Protein hunger, Loneliness, Crowded, Sleepiness, Fear (unwired backup), Anger (unwired backup), Sex drive |
| **Double-pull** (duplicated sweep) | 2 × "Very short" | ≈ 21 % /tick | Carb hunger, Fat hunger, Coldness, Hotness, Tiredness, **Boredom** |

Boredom therefore belongs to the double-pull class — its sweep is **duplicated** via gene 69 / reaction 72. The practical consequence is that any spike of active Boredom is absorbed into the reservoir within roughly two to three ticks, so short-term events barely register on the drive bar. For example, if an agent fires a STIM that adds +50 active Boredom, about 21 % of that is swept to the backup per tick, so after 10 ticks (1/3 second) the active drive has already dropped to ≈ 5 units while the backup has risen by ≈ 45. Conversely, if a toy fires a STIM that delivers −50 active Boredom, the active drive briefly dips but reaction 54 (backup → active at Medium half-life) refills it over the following 10+ seconds, meaning short-term interactions with one toy produce only short-term drive-bar relief.

For long-lasting boredom relief the negative STIM must target the **backup** (chemical 142) directly — typically via `CHEM 142 -n` — rather than just the active drive. This is why the Science Kit's "Decrease Boredom" button and the engagement-reward scripts in many stock toys write explicitly to both chemical 159 and 142, not just the active drive.

### The "Very long" active partner

The most unusual feature of the Boredom drive is that its **active partner also has a "Very long" half-life** — the same genomeValue 255 and near-infinite decay time as the backup. This is unique among the 16 drive pairs. Every other active drive decays at least at Medium rate, so a single stimulus produces a pulse that fades within 20–60 seconds without intervention. For Boredom, the active drive **does not fade**. An agent that writes `CHEM 159 +30` without any follow-up will leave +30 units of active Boredom in the creature's bloodstream, most of which immediately moves into the backup via reactions 64 + 72, but none of which is ever destroyed.

This design choice makes sense in light of the emitter: because `LOC_CONST` constantly drips Boredom into the active drive every tick, a passive-decay pathway would have to be tuned precisely to match the emission rate in order to produce a stable equilibrium. Instead the stock genome opts for the cleaner "no decay + external-only consumer" model: the drive accumulates at a predictable constant rate, and gameplay scripts are responsible for reducing it in response to successful creature–environment interaction. The result is a drive that feels **earned** — a Norn that has recently played with toys has low boredom, a Norn that has been ignored for ten minutes has high boredom, and the state of the drive reflects the creature's recent engagement history directly.

### The LOC_CONST constant emitter

The Boredom emitter differs from most other drive emitters in that it reads `LOC_CONST` (sensorimotor locus 0), which is a **constant value of 255** rather than a real environmental or physiological signal. Compare with:

| Drive | Emitter source locus | What it reads |
|-------|----------------------|---------------|
| Coldness | `LOC_TEMPERATURE` (inverted) | Room temperature CA |
| Hotness | `LOC_TEMPERATURE` | Room temperature CA |
| Tiredness | `LOC_CONST` | Always fires — but consumed by active metabolism |
| Sleepiness | Sleep toxin reaction | Sleep-toxin metabolism pathway |
| Loneliness | `LOC_CROWDEDNESS` (inverted digital) | Room same-kind density |
| Crowded | `LOC_CROWDEDNESS` (analogue) | Room same-kind density |
| Fear | Scripts + brain neuroemitter | Fear-toxin + "move" neuron |
| **Boredom** | **`LOC_CONST`** | **Always 255 — unconditional drip** |

With threshold 128, rate 8, gain 1, DIGITAL flags, emitter #2 fires at a fixed rate every tick — `LOC_CONST = 255` is always above threshold 128, so the condition is never false. The effective output is approximately 8/255 ≈ 3.1 % of maximum per tick, or roughly 1 unit of active Boredom every 4 ticks (~0.13 s).

This design models boredom as **passage of time without novelty**: every tick the creature is alive, its internal "I should be doing something interesting" pressure ticks up by a fixed amount, independent of what it's actually doing. The only thing that reduces the pressure is an *event* — a stimulus from an agent script that fires a negative-boredom STIM. Without such events, boredom rises forever.

### The "no consumer" property

Boredom is unique among the drives in having **no stock-biochemistry consumer**. Every other drive has at least one pathway by which its active partner's mass is destroyed:

| Drive | Consumer pathway | Mechanism |
|-------|------------------|-----------|
| Pain | Passive decay (Medium) | Chemical decays at 172-tick half-life |
| Protein hunger | Consumed by digestion reactions + decay | Multiple reactions destroy it |
| Coldness / Hotness | Annihilation (reaction 23) + decay | Hotness + Coldness → (nothing), instant |
| Tiredness | Consumed by sleep-state transition | Sleep state zeros it |
| Sleepiness | Converted to Sleep-state signals + decay | Sleepase enzyme + decay |
| Loneliness / Crowded | Annihilation (reaction 24) + decay | Loneliness + Crowded → (nothing), Short |
| Fear | Converted to Anger (reaction 40) + decay | Fear → Anger, then passive decay |
| Anger | Converted to Fear (reaction 41) + decay | Anger → Fear, then passive decay |
| Sex drive | Consumed by mating reactions + decay | Multiple reactions destroy it |
| **Boredom** | **(none in stock genome)** | **Only external STIM / CAOS writes reduce it** |

The absence of any biochemistry-level consumer is a deliberate design choice: it forces the game world — not the creature's body — to be the source of boredom relief. A Norn alone in an empty room will get progressively more bored until its decision lobe is entirely dominated by the Boredom drive bar; the creature then chooses any available stimulating action (walking, pushing, eating, etc.) because nothing else is competing for its attention. Once the action is performed, an appropriate agent STIM delivers the boredom reduction, and the cycle repeats.

This is the engine's implementation of **intrinsic motivation**: unlike hunger (fed by metabolism), thermal drives (fed by environment), or social drives (fed by companions), boredom is fed by **nothing** and requires **attention from the game world** to stay low.

### Steady-state analysis

With the doubled self-refill pulling active Boredom into the backup at ~21 %/tick, and the drip-release returning it at ~0.22 %/tick:

- Active drive 159 loses mass at rate `2 × (1 − 0.88978) × [159] ≈ 0.220` per tick from reactions 64 + 72.
- Active drive 159 does **not** passively decay (half-life is "Very long").
- Active drive 159 is fed continuously by emitter #2 at roughly 1 unit per 4 ticks.
- Backup 142 loses mass at rate `(1 − 0.99777) × [142] ≈ 0.00223` per tick from reaction 54.
- Backup 142 is topped up at rate `0.220 × [159]` per tick from reactions 64 + 72.

Setting backup-inflow equal to backup-outflow (ignoring external STIMs):
```
  0.220 × [159] = 0.00223 × [142]
  [142] / [159] ≈ 98.7
```

So approximately **99 %** of the pair's circulating mass sits in the backup at rest — this matches the steady-state ratio of the carb, fat, coldness, and hotness pairs, all of which share the doubled-sweep design. In a Norn that has been alive for several in-game hours without substantial stimulation, the reservoir can easily exceed the 255-unit cap of a single chemical slot and saturate; the active drive, meanwhile, sits at a modest but non-zero fraction of the total, with the decision-lobe receptor registering a steady "bored" pressure.

### What the active drive does that the backup cannot

Because chemical 142 has no receptor, every behavioural effect of boredom is mediated through chemical 159. The stock genome places exactly **one receptor** on the active drive:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #12 | Creature / Drives (tissue 5) / locus 11 "Boredom" | threshold 0, gain 211, analogue, from Baby | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows as the "Boredom" bar. The analogue gain of 211 (out of 255) is symmetric with the Loneliness drive receptor (207), Crowded (209), and Fear (209), so boredom has comparable weighting at the decision-lobe level |

There are **no sensorimotor, circulatory, immune, or organ-level receptors on chemical 159** in the stock genome. This is a striking asymmetry compared with sleep (which has LOC_GAIT3 and a circulatory receptor on Sleepiness), tiredness (which has LOC_GAIT2 and an immune receptor on Tiredness), fear (which has RLOCUS_CLOCKRATE, a panic circulatory locus, and LOC_GAIT4), or the thermal drives. Boredom is **purely cognitive-motivational** — it affects behaviour only by weighting the decision lobe, never by directly altering gait, involuntary actions, metabolism, or immunity.

This makes Boredom backup the **cleanest reservoir** in the block: its only downstream effect is to raise the sleeping-giant of the boredom drive bar over time, and the sole consequence of a high drive bar is that the Norn is more likely to choose exploratory or stimulating actions. There is no metabolic side-effect, no gait change, no immune reaction — just a cognitive preference for "do something, anything".

### The Music Faculty exemption

One of the few places in the engine that explicitly references Boredom is the Music Faculty's mood calculation, which assigns a per-drive influence on the creature's musical mood:

```text
 InfluenceOnMood (per drive):
    NNN   //   0 PAIN
    N     //   1 HUNGER FOR PROTEIN
    N     //   2 HUNGER FOR CARB
    N     //   3 HUNGER FOR FAT
    N     //   4 COLDNESS
    N     //   5 HOTNESS
    N     //   6 TIREDNESS
    0     //   7 SLEEPINESS
    N     //   8 LONELINESS
    N     //   9 CROWDEDNESS
    NN    //  10 FEAR
    0     //  11 BOREDOM   ← no influence on mood
    N     //  12 ANGER
    YYY   //  13 SEXDRIVE
```

Boredom is one of only two drives (alongside Sleepiness) whose mood influence is explicitly **zero**. This means that even when a Norn's boredom reservoir is saturated, the music system does not register this as a "negative mood" — the creature neither sings sad songs nor changes tonality due to ennui. Boredom is a purely behavioural drive, not an emotional one, from the engine's perspective.

### Effects of directly filling Boredom backup

A `CHEM 142 <n>` injection produces a distinctive, slow-rolling ennui:

1. **Tick 0:** The backup rises to *n*. Active Boredom is unchanged; the Drives "boredom bar" reading is unaffected because the decision lobe reads only 159.
2. **Ticks 1–311:** Reaction 54 drip-feeds the backup into active Boredom at a 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–3:** Simultaneously, reactions 64 + 72 at a combined 21 %/tick pull the newly-active drive back into the backup. Most of what leaves via reaction 54 returns almost immediately, but because the backup pool is so large compared with the active drive, a small persistent rise in active Boredom is sustained for many minutes.
4. **Because nothing destroys boredom**, the injection sits in the creature's bloodstream essentially forever. Only an external STIM or `CHEM 142 -n` can drain it.
5. **No collateral drives.** Because Boredom has no cross-couplings to Pain, Hunger, Fear, or any of the other drives, the injection produces a clean single-axis response.

This makes `CHEM 142 <n>` the canonical way for a script or ailment to simulate **persistent ennui** — an "I'm trapped with nothing to do" effect. Injecting the active drive directly with `CHEM 159 <n>` instead produces a brief pulse that is mostly swept into the backup within 2–3 ticks, after which the behaviour is equivalent to having injected the backup directly, just with a slight transient bump on the drive bar.

Conversely, `CHEM 142 -n` is the canonical way to **wipe accumulated boredom** — a "the Norn just learned something new" write in a tutorial or minigame script would typically zero both 142 and 159 to reset the boredom accumulator cleanly. Partial negative writes (`CHEM 142 -25`) model partial engagement — the creature is somewhat less bored but not fully engaged.

### How agents reduce boredom in practice

Most stock C3/DS objects that provide stimulation to creatures do so by firing a `STIM WRIT` or `STIM SIGN` command in their activation or push handler, with a chemical payload that includes a negative Boredom value. Typical examples:

- **Toys (ball, bouncy, pushie-toy):** Each push fires a small negative-boredom STIM (e.g. −5 to −20 units on 159 and 142). Sustained play drains boredom steadily.
- **The Juke Box and similar musical toys:** Longer-duration activation, with larger or repeated STIMs.
- **Food and drink:** Eating fires a small negative-boredom STIM as a side effect of the "I just successfully ate" stimulus.
- **Computers and educational agents:** Larger single-shot boredom reductions in response to successful interaction (e.g. answering a quiz question).
- **Creature-to-creature interaction (LOOK, LOBB, SMIL):** Small negative-boredom STIMs, encouraging socialisation.
- **The Hand's tickle and pat actions:** Small negative-boredom STIMs from user attention.
- **The Science Kit's "Entertain" button:** Direct `CHEM 142 -n` / `CHEM 159 -n` writes for diagnostic use.

The overall rhythm is that a Norn in a stimulating environment (with toys, companions, food, and attentive owner) receives a steady stream of small negative-boredom STIMs that roughly match or exceed the emitter's constant drip, keeping the reservoir at a manageable level. A Norn in a barren environment accumulates boredom until the decision lobe chooses any available action; successfully engaging with even a simple object delivers a small STIM that partially drains the reservoir and reinforces the decision (via the brain's drive-reduction reward system).

### Contrast with the other drive backups

Boredom backup is structurally closest to the double-pull metabolic backups (Carb, Fat, Cold, Hot, Tiredness backups) in its sweep design, but its active partner's "Very long" half-life and its total absence of consumption reactions place it in a unique category:

| Feature | Boredom pair (142 / 159) | Double-pull metabolic pairs (Cold/Hot/Carb/Fat) | Single-pull social pairs (Crowded/Lonely) |
|---------|---------------------------|-------------------------------------------------|-------------------------------------------|
| Sweep reactions | **2** (doubled) | 2 (doubled) | 1 (single) |
| Active drive passive decay | **"Very long"** (none) | Medium | Medium |
| Backup passive decay | "Very long" (none) | "Very long" (none) | "Very long" (none) |
| Active drive consumer | **None** | Yes (digestion, annihilation, etc.) | Yes (annihilation with mirror) |
| Initial concentration | **90 on active** | Varies | 0 |
| Emitter source | LOC_CONST (constant) | Real sensorimotor loci | Real sensorimotor loci |
| Receptor count on active | 1 (Drives only) | Multiple (Drives + gait + metabolism) | 1 (Drives only) |
| Natural equilibrium | Monotonically rising | Bounded by environment | Bounded by social conditions |

Boredom is the only drive that is **engineered to rise forever** in the absence of intervention. This asymmetry with the other drives is intentional: it ensures that creatures are always at least somewhat motivated to seek stimulation, which is the core gameplay loop of the Creatures series.

### Why start with 90 initial Boredom?

Newly-hatched Norns arrive with active Boredom = 90/255 ≈ 35 %, already partially filling the drive bar. The backup starts at 0 but fills rapidly from the initial active-drive seed within the first few ticks. The design intent is to give babies an immediate incentive to engage with the world — without this seed value, a freshly-hatched Norn would have no drive pressure at all for the first several seconds of life, and its decision lobe would have nothing to weight against the default tonic. With 35 % boredom at hatching, the creature is immediately motivated to look around, push things, and explore, which is essential for the early-learning curriculum that gameplay depends on.

Among the sixteen drives, only a few have non-zero initial concentrations on the active side:

- Hunger for carbohydrate (150): 13 / 255 ≈ 5 %
- **Boredom (159): 90 / 255 ≈ 35 %**
- Life (125): 255 / 255 = 100 %
- Antibody 0 (126): 96 / 255 ≈ 38 %

The 35 % seed for Boredom is substantially larger than the hunger seed, reflecting the design priority that babies should be **curious** from the very first tick, not merely hungry.

### Interaction with bootstrap scripts and agent behaviours

Several stock game mechanisms touch chemical 142 indirectly:

- **The Science Kit's chemical panel** displays chemical 142 directly in its "Boredom backup" slot. A Norn with low active Boredom but high Boredom backup will appear behaviourally comfortable on the drives display while carrying a large dormant ennui that will slowly surface once stimulation ceases.
- **The `MakeYourselfTired` shutdown helper** does not touch chemical 142. A creature imported from a CAV save therefore arrives with its saved boredom-backup value, which may be considerable for a long-lived saved creature.
- **Teleporters and world-change events** do not reset boredom. Moving a creature from an empty room to a toy-filled room doesn't drain the reservoir directly — the creature must actually interact with the toys (which then fire negative-boredom STIMs) to reduce it.
- **Sleep and dreaming** do not reduce boredom in the stock genome. A Norn that sleeps for an hour wakes up with the same boredom backup it went to sleep with, possibly higher because the constant emitter kept firing during sleep.

### Implications for modders

Common modifications built on top of Boredom backup:

1. **Add a slow passive decay to Boredom backup** (e.g. half-life ~10000 ticks, "Long"). This gives the creature a natural time-forgetting pathway — ennui gradually fades over many minutes of wall-clock time even without stimulation. Prevents long-lived Norns from becoming permanently saturated.
2. **Replace the LOC_CONST emitter with a sensorimotor novelty detector.** Wire the emitter to read a real locus — e.g. a lobe neuron that fires when the creature sees something new, or a room cell-count — so that boredom grows faster in impoverished environments and slower in rich ones. Produces more environmentally-responsive ennui.
3. **Add a sleep-coupled clearance reaction** (`Boredom backup → (nothing)` catalysed by Sleep-state chemical). Makes sleeping restorative for boredom as well as tiredness. A popular quality-of-life mod.
4. **Add a reward-reinforcement coupling** — e.g. a reaction that converts small amounts of Boredom backup to a "satisfaction" chemical when a drive-reduction signal fires in the brain. Gives the creature a biochemical correlate of the reinforcement-learning reward.
5. **Convert one of the two sweeps to a single-pull** (disable reaction 72). Shifts Boredom into the single-pull dynamic class, making the drive bar more responsive to short-term interactions at the cost of being noisier.
6. **Wire a brain-neuron neuroemitter into 142 directly** — for example, an "accomplishment" neuron from the decision lobe — so that successful learning or task completion banks satisfaction rather than just acute reduction. Gives the creature a chronic "I feel fulfilled" buffer independent of the acute boredom drive.
7. **Raise the initial concentration of 142** so newly-hatched Norns begin life with pre-loaded ennui. Useful for "world-weary" breed genomes or for testing the drive-reduction reward machinery at hatching time.

Because chemical 142 has no direct receptor and the active drive has only a single receptor (the decision-lobe drive bar), these modifications are safely isolated from the rest of the biochemistry — they affect the boredom drive cleanly without perturbing metabolism, immunity, gait, or sleep.

### Practical consequences for gameplay

- **`CHEM 142 <n>` is the canonical "chronic ennui" injection.** Unlike `CHEM 159 <n>` (which produces a brief spike that is mostly swept into the backup within 2–3 ticks), injecting into 142 guarantees a persistent boredom-deficit state that surfaces over minutes and keeps pushing the decision lobe toward exploratory behaviours.
- **`CHEM 142 -n` is the canonical "entertainment reward" write.** Zeroing the reservoir immediately eliminates the long-tail ennui drip, and any residual active Boredom will be swept back up into it anyway within a few ticks — so the drive bar falls cleanly within seconds of the write. Agents that deliver real stimulation (toys, food, minigames) typically write to both 142 and 159 to produce durable relief.
- **The reservoir is invisible to most UI.** Only the Science Kit displays chemical 142 directly. A Norn with low Boredom but high Boredom backup will appear "fine" on the drives display while carrying a sizable dormant ennui that will manifest as soon as stimulation ceases.
- **Moving a stimulated Norn to a barren room does not immediately produce boredom** — but it does remove the STIM source, so the constant emitter's drip begins to accumulate in the active drive within ticks. The backup refills rapidly from there; within minutes the Norn is substantially more bored.
- **Moving a bored Norn to a toy-filled room does not immediately cure boredom** — the creature must actually interact with the toys to receive the negative-boredom STIMs. Simply being in a rich environment does nothing. This is a frequent source of player confusion, because other drives like Loneliness/Crowded respond to room presence automatically while Boredom does not.
- **Sleeping does not reduce boredom.** The emitter keeps firing during sleep, and no stock reaction drains the reservoir, so a Norn wakes up with the same or higher boredom than it went to sleep with.
- **Baby Norns start motivated.** The 90-unit initial seed ensures hatchlings have drive pressure from their very first tick, critical for triggering early decision-lobe activity before the creature has had any experiences.
- **Very old Norns are permanently bored** unless actively maintained. Without a passive-decay pathway, every minute of under-stimulation adds to the reservoir, and the reservoir never empties. Long-lived Norns eventually reach saturation where the Boredom drive bar dominates the decision lobe, making them prefer exploratory actions over sleep, food, or socialisation — a well-documented quirk of stock genomes.

### Summary

```
 Stock-genome wiring of Boredom backup [142]
 ────────────────────────────────────────────────
 Inputs:
    Boredom [159] ─ reaction 64 (gene 57) ────────▶ [142]
                        half-life 6 ticks ("Very short")
    Boredom [159] ─ reaction 72 (gene 69) ────────▶ [142]
                        half-life 6 ticks ("Very short")
                        (duplicated sweep; combined ≈ 21 %/tick)

    CHEM 142 <n>  (CAOS / scripts / mods)  ──────────▶ [142]

    (No emitter writes to 142 directly; no neuroemitter;
     no cross-drive spillover)

 Reservoir:
         Boredom backup [142]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
         initial concentration: 0
                        │
                        │ reaction 54 (gene 17): 1× [142] → 1× [159]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Boredom [159]
         half-life ≈ 9·10¹⁰ ticks ("Very long" — UNIQUE)
         initial concentration: 90 / 255 ≈ 0.3529 (UNIQUELY high)
                        │
                        ├─► Drives tissue locus 11 (gain 211) ─────▶ decision-lobe "boredom" bar
                        │                                            (the only receptor on 159)
                        │
                        ├─◀ emitter #2 (gene 3):
                        │      Sensorimotor LOC_CONST (locus 0) = constant 255
                        │      threshold 128, rate 8, gain 1, DIGITAL
                        │      → fires unconditionally every tick
                        │
                        └─◀ external STIM / CAOS writes (from agent scripts)
                               toys, food, computers, hand attention, etc.
                               typically deliver negative-boredom chemical payloads
                               on both 159 (transient relief) and 142 (lasting relief)

 No consumer anywhere in stock biochemistry.
 Mass is conserved between 142 and 159 except for external STIM writes.
```

Boredom backup is therefore a **doubled-pull, constantly-fed, externally-drained** reservoir — the chronic half of a drive that is designed to rise forever unless the world actively pushes back against it. Among the sixteen backup chemicals in the 131–146 block it shares its doubled-sweep topology with Coldness backup (135), Hotness backup (136), Carb-hunger backup (133), Fat-hunger backup (134), and Tiredness backup (137), all of which use reaction duplication to aggressively buffer short-term fluctuations into the reservoir. What makes Boredom uniquely unusual is the **"Very long" half-life on its active partner** and the **complete absence of any biochemistry consumer** — together these design choices encode the fundamental gameplay assumption of the Creatures series: creatures need the player, agents, toys, and environment to stay engaged, and no amount of internal biochemistry can substitute for real-world stimulation. The reservoir's behavior is consequently dominated by the player's engagement with the creature, making it the most **world-coupled** of all the drive chemicals in the stock genome.
