# 143 - Anger backup

Anger backup occupies the twelfth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome would conceptually pair one-to-one with the sixteen drive chemicals in the 148–161 range. It would be the **reservoir half** of the Anger drive — the chronic pool that could buffer the acute Anger (160) signal the decision lobe reads. In practice, however, chemical 143 is one of the three **completely unwired reservoir slots** in the stock biochemistry: it has no emitter, no receptor, no neuroemitter, no initial concentration, and — crucially — **no reaction wires it to its would-be active partner**. Where every other drive in the block has a matched pair of reactions (`backup → active` drip-feed and `active → backup` sweep), Anger has none. The Anger drive therefore runs without a reservoir: Anger (160) is produced, decays, and is exchanged with Fear directly, with no chronic-signal shadow chemical behind it.

The half-life table entry for chemical 143 is identical to the other unused reservoir slots: `genomeValue: 255`, half-life ≈ 9·10¹⁰ ticks (decay rate exactly `1.0`), labelled "Very long". This means that if anything ever *did* write to chemical 143 — a modded gene, a CAOS `CHEM 143 <n>` from a script, or an agent injecting it into the creature's bloodstream — whatever mass landed in the slot would persist essentially forever, because nothing drains it. Together with the two other orphan drive-backup slots in the stock genome (Fear backup at 141 and Comfort backup at 145, plus the short-half-life Sex-drive backup at 144), Anger backup is best understood as a **reserved-but-empty reservoir** — a genome slot the engine recognises and can store concentration in, but one that the shipping biochemistry never touches.

Because of this, the gameplay behaviour of Anger is driven entirely by chemical 160 and its direct partners (Fear 158 via the Fear↔Anger exchange, Adrenalin 117 as the autocatalytic amplifier, and Stress (Anger) 190 as a downstream stress product). The rest of this document describes *what the Anger pair would look like if wired analogously to Crowded or Boredom*, why the stock genome leaves it unwired, the resulting asymmetry between Anger and the reservoired drives, and the practical consequences for scripts, agents, and modders who want to use chemical 143 anyway.

## Sources

Anger backup has **no stock-genome inflow at all**. No emitter, neuroemitter, reaction, or initial-concentration entry writes to chemical 143. The only way mass ever enters the slot in a default game is through direct CAOS or PRAY-agent injection.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | No backup-filling reaction | — | — | The reaction table does **not** contain an `Anger [160] → Anger backup [143]` sweep. Every other active drive in the 148–161 range whose backup is wired has such a reaction (sometimes duplicated), including Pain, protein/carb/fat hunger, Coldness/Hotness, Tiredness, Sleepiness, Loneliness, Crowded, Boredom, and Sex drive — but **Anger has none**. This is the most significant missing piece of plumbing on the anger axis | — |
| 2 | No direct emitter on 143 | — | — | The emitters table contains no entry whose target chemical is 143. No sensorimotor locus, circulatory locus, or organ tissue fires into the reservoir | — |
| 3 | No neuroemitter on 143 | — | — | The single stock neuroemitter (lobe 4 "move" neuron 37) writes Adrenalin [117], Fear [158] and Crowded [157] — but **not** chemical 143 or even the active Anger at 160 directly | — |
| 4 | No initial concentration | — | — | Chemical 143 does not appear in the genome's initial-concentration table, and neither does its active partner Anger (160). A newly-hatched Norn is born with exactly 0 Anger backup and 0 Anger, and — because no reaction fills either slot unless Fear is present — typically stays neutral until a frightening or painful event generates Fear that then decays into Anger | — |
| 5 | No cross-drive spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`) or the Sleepiness pair (where Sleep-toxin metabolism produces active Sleepiness that is swept into its backup), there is no stock-genome reaction that routes any other chemical into chemical 143. The Anger axis is wholly decoupled from the reservoir | — |
| 6 | Direct CAOS injection | — | Any | `CHEM 143 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot; effectively permanent because the chemical's half-life is ≈ 9·10¹⁰ ticks and no reaction drains it |
| 7 | Modded genomes | User-added | User-added | Breeders sometimes add the missing `Anger → Anger backup` sweep reaction to convert the drive into a reservoired pair that behaves like Crowded or Boredom. Another common mod is to add a `Anger backup → Anger` drip reaction so that a CAOS-injected 143 value surfaces gradually as active Anger — modelling long-held "grudges" — or to wire a "memory of wrong" neuron as a neuroemitter into 143 so that repeated aggression-triggering events accumulate in the reservoir independently of the fast-decaying active drive | Gene-dependent |

## Usage

Anger backup has **no stock-genome consumers**. With no receptor to read it and no reaction to drain it, any value injected into chemical 143 sits in the slot indefinitely. The only "use" in the default game is as a permanent annotation — mass placed there neither decays nor exerts any effect.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | No backup → active conversion reaction | — | — | There is **no** `Anger backup [143] → Anger [160]` reaction in the stock genome. Where every reservoired drive has a ~311-tick Medium drip reaction releasing reservoir mass into its active partner, Anger has none. Mass deposited in 143 cannot surface as active Anger without a modded reaction | — |
| 2 | Passive decay (effectively none) | Gene 64 entry #143 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate exactly `1.0`), labelled "Very long" | All sixteen drive backups share this near-infinite half-life by design: the chemical is meant to be a reservoir, not a signal. Combined with the absence of any drain reaction, this makes 143 a **completely static slot** in stock play: once written, the value persists forever | — |
| 3 | No receptor | — | — | Chemical 143 is **not read by any stock receptor**. No drive tissue, brain lobe, sensorimotor locus, circulatory locus, or organ receptor reads its concentration. The creature has no awareness of its Anger-backup value, and no downstream behaviour changes with it | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter table does not wire any brain neuron to chemical 143 | — |
| 5 | Modded consumers | User-added | User-added | Modders who want 143 to matter typically add (a) a `Anger backup → Anger` drip reaction at Medium speed so the reservoir surfaces like the other drive backups, (b) a drive-tissue receptor on 143 so that chronic aggression weights the decision lobe independently of acute Anger, (c) an enzyme-gated release reaction (analogous to Sleepase gating Sleepiness-backup release) so that banked anger only surfaces in response to a specific trigger chemical — e.g. a grudge-target pheromone — or (d) a sensorimotor receptor on 143 to make the gait or aggressive-action response sensitive to chronic rather than acute anger | Gene-dependent |

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
| 10 | 158 Fear | 141 Fear backup | NO — backup is orphan |
| 11 | 159 Boredom | 142 Boredom backup | Yes (full pair, doubled-refill) |
| 12 | **160 Anger** | **143 Anger backup** | **NO — backup is orphan** |
| 13 | 161 Sex drive | 144 Sex drive backup | Yes (full pair, single-pull) |
| — | — | 145 Comfort backup | NO — backup is orphan (no active partner either) |
| — | — | 146 (unused) | — |

Anger backup is therefore one of three reservoir slots (141, 143, 145) that the stock genome simply leaves empty. The pattern is consistent: **all three orphan reservoirs belong to the "emotional" end of the drive spectrum** — Fear, Anger, and Comfort — whereas the reservoired pairs cover physical needs (hunger, thermoregulation, tiredness, social density, boredom with the current environment, sex drive). The design implication is that the shipping biochemistry models emotional drives as **fast, ephemeral signals** without a chronic-memory buffer, while physical drives get a long-tail reservoir that averages their signal over minutes.

### Why the stock genome leaves Anger unreservoired

Anger (160) is already one of the more responsively-wired active drives in the genome, with three receptors tapping it (the decision-lobe drive bar, a digital circulatory panic/rage trigger at threshold 214, and a sensorimotor gait switch LOC_GAIT5) and three sources feeding it (Fear↔Anger exchange, the Adrenalin autocatalytic amplifier that switches on at Adolescence, and the shared Stress pathway that routes into the separate Stress (Anger) chemical 190). These mechanics give the creature a responsive, spike-driven aggression signal:

1. A frustrating or painful stimulus raises Fear via its own pathway (Fear-toxin metabolism, the "move" neuroemitter, or scripted injections).
2. Reaction 40 (`Fear → Anger`, Short half-life 95 ticks, ≈ 3 s) steadily converts some of that Fear into active Anger, giving the classic "fear settles into anger after the immediate threat passes" dynamic.
3. If Adrenalin is present — which the stock genome arranges through the separate adrenaline/stress pathway any time the creature is in an arousing situation — reaction 39 (`Anger + Adrenalin → 2 Anger + Adrenalin`, Short half-life 58 ticks, ≈ 2 s) **autocatalytically amplifies Anger** against the Adrenalin catalyst, until Adrenalin is consumed by its own decay or by competing reactions. This is the biochemical analogue of "rage escalation" — a small irritation in an already-stressed creature can rapidly tip into full aggression.
4. Anger passes the sensorimotor receptor threshold (124) and switches LOC_GAIT5 (gain 223), producing a visibly-angry gait.
5. If Anger gets high enough, it passes the circulatory receptor threshold (214) and fires the digital all-or-nothing locus 13 — a rage-state trigger analogous to Fear's panic locus.
6. Meanwhile reaction 41 (`Anger → Fear`, Short half-life 95 ticks) converts a parallel fraction of Anger back into Fear, creating a continuous **Fear↔Anger shuttle** that, combined with both chemicals' Medium passive-decay, prevents either from monopolising the creature's emotional state indefinitely.
7. Active Anger decays at a Medium half-life (621 ticks, ≈ 21 s at 30 Hz), so without a fresh source, the anger spike fades within roughly a minute.

This rich active-drive wiring means Anger already has strong short-term dynamics. A reservoir would dilute rather than add to it: any chronic buffering would mute the sharp spikes that make anger useful as a behavioural signal and would interfere with the Fear↔Anger shuttle by adding a third compartment for mass to hide in. The stock design therefore opts for a **purely acute** Anger drive. The reservoir slot exists only as a placeholder that modders can wire up if they want slower rage dynamics.

The same reasoning applies to Fear backup (141) and Comfort backup (145): both active partners have strong acute dynamics (Fear through its adrenaline autocatalysis and panic locus, and Comfort — via the Sex-drive and pleasure pathways — through direct reward emitters) and don't benefit from a chronic buffer in the default design.

### How Anger actually works without a reservoir

Because 143 is unwired, the complete active-drive dynamic of Anger runs entirely through chemical 160. The sources of Anger in stock play are:

| Source | Mechanism | Half-life / rate | Role |
|--------|-----------|------------------|------|
| Reaction 40 `Fear → Anger` | One-to-one conversion, spontaneous | Short, 95 ticks (≈ 3 s) | The primary source of Anger. Whenever Fear is present, a fraction bleeds into Anger each tick, modelling the "fear turns to anger" transition |
| Reaction 39 `Anger + Adrenalin → 2 Anger + Adrenalin` | Autocatalytic amplifier, requires Adrenalin as catalyst, switches on at **Adolescent** age | Short, 58 ticks (≈ 2 s) | The rage-escalation pathway. Once Anger exists *and* Adrenalin is circulating, Anger doubles per ≈ 2 s of half-life until Adrenalin runs out. Adolescents and adults can rage; babies and children cannot — an intentional developmental gate |
| Direct CAOS / STIM writes | `CHEM 160 <n>` or `STIM` with chemical 160 payload | One-shot | Agents (e.g. other creatures' aggressive actions, the Hand's slap, predator events) inject active Anger directly |

The consumers of Anger are:

| Consumer | Mechanism | Half-life / rate | Role |
|----------|-----------|------------------|------|
| Reaction 41 `Anger → Fear` | One-to-one conversion, spontaneous | Short, 95 ticks (≈ 3 s) | Routes a parallel fraction of Anger back into Fear, producing the Fear↔Anger shuttle and preventing either chemical from dominating indefinitely |
| Passive decay | Gene 64 entry #160 | Medium, 621 ticks (≈ 21 s) | Active Anger fades to half strength every ≈ 21 s absent new input. Combined with the Fear shuttle and Anger's lack of a reservoir, this is what makes an anger outburst a transient event rather than a chronic state |
| No `Anger → backup` sweep | — | — | Nothing moves Anger into chemical 143; the reservoir stays at 0 unless externally written |

The receptors on Anger (160) are:

| Reader | Tissue / Locus | Threshold / Gain / Flags | Meaning |
|--------|----------------|--------------------------|---------|
| Drives receptor | Creature / Drives (tissue 5) / locus 12 "Anger" | threshold 0, gain **202**, analogue | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows as the "Anger" bar. The gain of 202 (out of 255) is slightly lower than Boredom (211), Loneliness (207) and Crowded (209), giving Anger a modest but non-dominant weight among the emotional drives at the decision-lobe level |
| Circulatory rage trigger | Creature / Circulatory (tissue 1) / locus 13 | threshold **214**, gain 255, **DIGITAL** (all-or-nothing) | A high-threshold digital locus that fires only when Anger exceeds ≈ 84 % of its range. Acts as a "rage-state" switch analogous to Fear's panic locus — once tripped, it engages circulatory changes that feed downstream autonomic responses |
| Sensorimotor gait-5 | Creature / Sensorimotor (tissue 4) / locus 13 "LOC_GAIT5" | threshold 124, gain 223, analogue | Switches the creature to its angry gait. LOC_GAIT5 is the "aggressive" locomotion locus; above threshold 124 (≈ 49 % of range) the creature's walk cycle and posture shift to reflect the aggression, providing visible external cues to the player and to other creatures |

Together these three receptors turn Anger into a **cognitive + circulatory + locomotor** drive: the creature feels aggressive, its heart rate pattern changes (via the digital circulatory locus), and its body language changes (via LOC_GAIT5) — all in the 2 to 30 second window after a fear-triggering event. The lack of a reservoir means that once the immediate biochemical sources dry up and passive decay runs its course, the creature returns to baseline within roughly a minute. There is **no chronic "always angry" state** achievable through stock biochemistry alone — any long-term aggression must come from repeated external triggers that keep refreshing the active drive.

### Effects of directly filling Anger backup

Because chemical 143 is completely unwired, a `CHEM 143 <n>` injection in a stock-genome creature has **no observable effect** at all. The value sits in the bloodstream permanently, visible only in the Science Kit's chemical panel under the "Anger backup" label. It does not:

- raise the decision-lobe anger bar (no drive receptor reads 143);
- change the creature's gait (LOC_GAIT5 reads 160, not 143);
- trigger the circulatory rage locus (which reads 160 at threshold 214);
- interact with Fear, Adrenalin, or the Stress pathway (no reactions touch 143);
- decay (half-life ≈ 9·10¹⁰ ticks + no drain reaction = permanent).

This contrasts sharply with `CHEM 160 <n>` (injecting active Anger directly), which produces a full rage-response within one tick: the drive bar rises, LOC_GAIT5 flips on at *n* > 124, the circulatory digital locus trips at *n* > 214, Reaction 41 starts converting some Anger back to Fear, and — in Adolescents and older — Reaction 39 begins the Adrenalin-gated autocatalytic amplification. The injected mass then decays at the Medium 621-tick half-life, and within ≈ 1 minute the creature returns to baseline.

The practical consequence for scripts and agents is that **chemical 143 is effectively a no-op in stock play**. Scripts that want to produce persistent aggression must either repeatedly refresh chemical 160 (expensive and visible on the drive bar as a sawtooth), inject Fear (which then bleeds into Anger via Reaction 40), or add the missing backup wiring through a modded genome. The one exception is diagnostic or telemetry use: a script can safely store a sentinel value in chemical 143 without perturbing the creature's behaviour at all, since nothing reads it.

### Contrast with Fear backup (141)

Anger backup is structurally identical to Fear backup in the stock genome: both are completely unwired drive reservoirs belonging to the emotional end of the spectrum, both share the "Very long" half-life marker, both lack any initial concentration, and both have exactly the same set of zero reactions, emitters, receptors, and neuroemitters. The two orphans are the mirror-image halves of the Fear↔Anger shuttle pair: Fear and Anger exchange mass through reactions 40 and 41, but neither has a reservoir behind it, so the shuttle runs entirely in the "active" compartment of the bloodstream.

The design symmetry is deliberate. Fear and Anger together form a two-chemical coupled oscillator: a Fear spike bleeds into Anger, Anger bleeds back to Fear, both decay, and the emotional state of the creature is the integral of the net production minus consumption of this pair. Adding a reservoir behind either chemical would break the symmetry — mass banked in Fear backup would eventually release as active Fear and flow through Reaction 40 into Anger, giving the creature a chronic "always on edge" signal that the stock design explicitly avoids. Keeping both backups orphaned preserves the "emotions are transient events, not chronic states" principle.

### Contrast with Comfort backup (145)

Comfort backup is the third orphan and is slightly different: it has no active partner at all in the stock genome (position `n = 14` in the 148–161 range is occupied by chemical 162, which is not wired as a drive), so the concept of a "Comfort drive pair" does not exist in stock play. Anger backup differs from Comfort backup in that Anger (160) itself is a fully-wired, first-class active drive — so chemical 143 is genuinely the missing half of a half-built pair, whereas chemical 145 is more like a fully-empty placeholder on an axis the genome never implemented.

### The Stress (Anger) chemical is separate

An important distinction for scripters: the Anger pair (143 / 160) is **not** the same as the Stress (Anger) chemical at 190. Stress (Anger) has its own Medium half-life (311 ticks), its own emitter from Circulatory locus 13 (threshold 128, rate 14, gain 6 — meaning that when the digital circulatory rage-trigger fires at Anger > 214, this emitter begins producing Stress (Anger) in parallel), and its own receptor at Circulatory locus 17 (threshold 128, gain 254). Stress (Anger) is the engine's model of the **downstream physiological damage** of sustained anger — the wear-and-tear on the creature's body from being in a rage-state — and is the chemical that drives long-term stress-related illness on the anger axis. Chemical 143 plays no role in this pathway.

Modders sometimes conflate the two: they want to add chronic aggression and either wire Stress (Anger) into new reactions or write to Anger backup. The cleaner approach depends on intent — use chemical 143 to buffer a chronic aggression *drive* (weighting the decision lobe toward aggressive actions), and use chemical 190 / Stress (Anger) to model chronic aggression's *physiological consequences* (illness, heart strain, etc.). The two should not be treated as interchangeable.

### Music Faculty: Anger has a moderate depressive mood influence

The Music Faculty's mood calculation assigns a per-drive influence on the creature's musical mood:

```text
InfluenceOnMood[14] = {
    NNN,    //   0 PAIN,
    N,      //   1 HUNGER FOR PROTEIN
    N,      //   2 HUNGER FOR CARB
    N,      //   3 HUNGER FOR FAT
    N,      //   4 COLDNESS,
    N,      //   5 HOTNESS,
    N,      //   6 TIREDNESS,
    0,      //   7 SLEEPINESS,
    N,      //   8 LONELINESS,
    N,      //   9 CROWDEDNESS,
    NN,     //  10 FEAR,
    0,      //  11 BOREDOM,
    N,      //  12 ANGER,    ← single-N negative mood influence
    YYY,    //  13 SEXDRIVE
}
```

Anger carries a **single-N** negative influence on mood — smaller than Fear (NN) and Pain (NNN), but non-zero, unlike Sleepiness and Boredom. This reflects the in-world interpretation that an angry creature's songs are measurably more sombre than a neutral creature's but not as pronounced as a pained or terrified creature's. Crucially, this influence reads the **active** Anger drive at 160 (via the drive-level lookup for drive 12), not chemical 143 — so even a creature with a saturated Anger backup sings the same songs as a creature with zero anger reservoir, provided the active drive is low. This is another consequence of the orphan-reservoir design: no downstream subsystem in the engine reads 143.

### Implications for modders

Common modifications built on top of Anger backup:

1. **Add a `Anger → Anger backup` sweep reaction** (Short or Very Short half-life) and a matching `Anger backup → Anger` drip reaction (Medium half-life). This converts the Anger pair into a fully-reservoired drive behaving like Crowded or Boredom. A popular mod for "grudge-holding" breeds — the creature's chronic aggression level accumulates over repeated provocations and takes minutes to drain.
2. **Wire a brain-neuron neuroemitter into 143 directly** — for example, an "insult memory" neuron from the Decision or Verb lobe — so that specific triggering events bank chronic anger independently of the acute drive. Pairs well with (1) to produce genuinely vindictive creatures.
3. **Add a drive-tissue receptor on 143** so that chronic aggression directly weights the decision lobe, bypassing the need for a drip reaction. Makes the reservoir behaviour visible on the Drives bar even without a backup→active drip.
4. **Add an enzyme-gated release reaction** (analogous to Sleepase gating Sleepiness-backup release) so that banked anger only surfaces in response to a specific trigger chemical — e.g. a pheromone emitted by a creature the target has previously fought with, producing a "remembers the enemy" mechanic.
5. **Add a sensorimotor receptor on 143 to LOC_GAIT5** so that the angry gait reflects chronic rather than acute anger. Produces creatures that walk angrily for long stretches after repeated provocations, even after the active Anger has decayed.
6. **Cross-couple 143 to Stress (Anger) 190**: add a reaction `Anger backup → Stress (Anger)` at Long half-life, so that chronic aggression slowly damages the body over many minutes of game time. Useful for adversarial genome designs where aggressive lifestyles are penalised with shorter lifespans.
7. **Raise the initial concentration of 143** so newly-hatched Norns begin life with pre-loaded aggression. Useful for "warrior" breed genomes that should bias toward aggressive behaviour from birth.

Because chemical 143 has no direct receptor and the active drive has only three receptors (decision lobe, circulatory rage, LOC_GAIT5), these modifications are safely isolated from the rest of the biochemistry — they affect the anger drive cleanly without perturbing metabolism, immunity, sleep, or hunger.

### Practical consequences for gameplay

- **`CHEM 143 <n>` is a no-op in stock Creatures 3 / Docking Station.** The value persists forever but affects nothing. It is safe to use as a script-local marker or sentinel without perturbing the creature.
- **To produce chronic aggression in a stock Norn, write to Fear (158).** Injected Fear decays via Reaction 40 into active Anger over several seconds, producing a more natural-looking aggression build-up than direct Anger injection. Repeat the injection every minute or so to maintain the state.
- **Rage is gated by Adolescence.** Reaction 39 (the Adrenalin-driven autocatalytic amplifier) is switched on at age `switchOnAge = 2` / `switchOnStage = "Adolescent"`. Babies and children can feel Anger, but it does not escalate into rage — they never trip the circulatory digital locus at threshold 214 unless a single large injection pushes Anger past that point in one tick. This is an intentional developmental gate.
- **The circulatory rage locus is all-or-nothing.** Crossing threshold 214 flips the locus on at full gain 255; falling below 214 turns it off. There is no gradient between "calm" and "raging" — the creature is either in the rage state or not. This produces the sharp, discrete aggression events that characterise Creatures behaviour.
- **The angry gait is analogue and kicks in earlier.** LOC_GAIT5 fires above threshold 124 with gain 223 (analogue), so the creature's body language shifts gradually from ≈ 49 % Anger upward, well below the rage-trigger threshold. A moderately irritated creature looks visibly tense even if not in full rage.
- **The Fear↔Anger shuttle is the dominant dynamic.** Without a reservoir on either side, whatever mass is on the Fear-Anger axis at any moment is split between chemicals 158 and 160 according to the relative rates of reactions 40 and 41 (both the same rate), plus the autocatalytic amplification of Anger when Adrenalin is present. Mass only leaves the axis through passive decay (both chemicals at Medium half-life) and the Adrenalin consumption in Reaction 39.
- **Anger-related Music Faculty mood is subtle.** The single-N mood influence produces a modest but noticeable darkening of the creature's songs during high-anger periods. Raising or lowering chemical 143 has no effect on this — only chemical 160 matters.

### Summary

```
 Stock-genome wiring of Anger backup [143]
 ────────────────────────────────────────────────
 Inputs:
    (none in stock genome)
    CHEM 143 <n>  (CAOS / scripts / mods)  ──────────▶ [143]

 Reservoir:
         Anger backup [143]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
         initial concentration: 0
                        │
                        │ (no drain reaction in stock genome)
                        │ (no receptor in stock genome)
                        │ (no neuroemitter in stock genome)
                        ▼
                     (stored indefinitely, exerts no effect)

 Active partner (for reference):
         Anger [160]
         half-life 621 ticks ("Medium", ≈ 21 s)
         initial concentration: 0
                        │
                        ├─► Drives tissue locus 12 (gain 202) ─▶ decision-lobe "anger" bar
                        ├─► Circulatory tissue locus 13 (threshold 214, DIGITAL) ─▶ rage trigger
                        ├─► Sensorimotor tissue locus 13 (LOC_GAIT5, threshold 124, gain 223) ─▶ angry gait
                        │
                        ├─◀ Reaction 40: 1× Fear [158] → 1× Anger [160]
                        │      half-life 95 ticks (Short, ≈ 3 s)
                        │      spontaneous, switchOnAge=Baby
                        │
                        ├─◀ Reaction 39: 1× Anger + 1× Adrenalin → 2× Anger + 1× Adrenalin
                        │      half-life 58 ticks (Short, ≈ 2 s)
                        │      switchOnAge=Adolescent — autocatalytic rage amplifier
                        │
                        └─▶ Reaction 41: 1× Anger [160] → 1× Fear [158]
                               half-life 95 ticks (Short, ≈ 3 s)
                               spontaneous, switchOnAge=Baby

 Related but separate:
    Stress (Anger) [190] — a downstream physiological-stress chemical
    emitted from Circulatory locus 13 when Anger > 214 trips the digital trigger.
    Not the same as Anger backup; do not conflate.
```

Anger backup is therefore an **orphan reservoir** — a genome slot reserved for the backup half of the Anger drive that the stock biochemistry never wires up. Its existence is purely architectural: the engine recognises it as chemical 143 and faithfully stores whatever value is written to it, but no stock reaction, emitter, receptor, or neuroemitter touches it. The Anger drive runs entirely through its active partner (chemical 160), whose rich wiring — decision-lobe bar, circulatory rage trigger, LOC_GAIT5 gait switch, Adrenalin-autocatalysed amplification, and the Fear↔Anger shuttle with Fear (158) — produces the characteristic short-lived, explosively-escalating, developmentally-gated rage response that defines Creatures 3 aggression behaviour. The reservoir stands ready as an extension point for modders who want to add chronic aggression memory to their breeds, but in the shipping game it remains a reserved-but-empty placeholder, one of only three such orphans (alongside Fear backup 141 and Comfort backup 145) that together define the stock biochemistry's commitment to treating emotions as **transient signals** rather than chronic states.
