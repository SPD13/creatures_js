# 148 - Pain

Pain is the **active half** of the drive pair whose reservoir is Pain backup (chemical 131). It occupies the first slot of the "active drive" block (chemicals 148–161), the bank of sixteen short-to-medium-lived drive chemicals that the brain's `DRIVE_LOBE` reads to decide what the creature needs next. Pain is conceptually drive offset **0** (`PAIN` in the drive-offsets enum) — the primal "something is wrong with my body" signal that precedes every other motivational consideration in the decision hierarchy.

Unlike most of the other fifteen drives — which track smooth, slowly-moving internal or environmental conditions (temperature, social density, boredom, hunger) — Pain is the drive that fires on **discrete damaging events**: being slapped by the hand, metabolising alcohol, mounting an immune response to a specific antigen, or receiving a scripted `STIM WRIT ... 0 ...` from an agent. It is the only drive in Creatures 3 whose genome wiring includes a **cross-drive spillover** (reaction 56: `Pain → Hunger for protein backup`) that funnels its own mass into the food drive's reservoir, implementing the biologically-plausible rule "injury increases appetite for the building blocks of repair".

With a 172-tick Medium half-life (≈5.7 s at the 30 Hz world tick), the active Pain pool empties quickly on its own. Combined with the fast 6-tick spillover sweep of reaction 56, a Pain injection that is not continuously refreshed fades from the drive bar within a few seconds. To produce a *lingering* pain the creature must either carry an accumulated reservoir in Pain backup (131) which slowly drips active Pain back into circulation, or receive a continuous external stimulus. This separation of acute vs. chronic is the whole reason the drive-backup architecture exists, and the Pain axis is the canonical example.

Pain has five receptors in the stock Norn / Grendel / Ettin genome — more than any other drive chemical in the 148–161 range. Beyond the expected drive-bar reader on the decision lobe, pain also directly **speeds up organ metabolism** (`RLOCUS_CLOCKRATE`), **triggers involuntary egg-laying** (`LOC_INVOLUNTARY0`), **alters the creature's gait** (`LOC_GAIT1`), and at adolescence wires into a **circulatory floating-locus feedback loop** (circulatory locus 12). This multi-system penetration is what makes pain the most physiologically disruptive signal in the biochemistry — it changes not only *what the creature wants to do* but also *how its body behaves while wanting it*.

## Sources

Pain has three endogenous production pathways plus two external injection routes. None of them is an emitter — the stock genome contains **no emitter whose target is chemical 148 or 131**, which is why pain cannot be produced "ambiently" by a sensorimotor locus the way Loneliness or Boredom can. Pain is an **event chemical**: it enters the biochemistry only through a reaction product, an explicit stim, or a scripted CHEM write.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Backup → active drip-feed | Gene 7 (reaction id 42) | Organ #2 "Reaction" | `1× Pain backup [131] → 1× Pain [148]` at rate byte 58, half-life **311 ticks** ("Medium", decay rate 0.99777) | The sole continuous source of Pain in normal gameplay. Whatever mass the Pain-backup reservoir holds drips into active Pain at a ~10 s half-life, producing a smooth chronic ache. Because there is no reverse `Pain → Pain backup` refill reaction, this reaction is strictly one-way: it only empties the reservoir, never refills it |
| 2 | Alcohol metabolism byproduct | Gene 81 (reaction id 90) | Organ #2 "Reaction" | `2× Alcohol [75] + 1× Dehydrogenase [116] → 1× Glucose [3] + 1× Pain [148]` at rate byte 31, half-life **21 ticks** ("Short", decay rate 0.96825) | Every time the creature's Dehydrogenase enzyme breaks down two units of Alcohol it produces one Glucose *and* one active Pain. This is the biochemical analogue of "hangover": a Norn who has eaten fermented food or been fed alcohol from a dispenser accumulates active Pain in direct proportion to its alcohol load, produced at Short speed and decaying on its own at the 172-tick Medium rate |
| 3 | Immune response to antigen 7 | Gene 92 (reaction id 99) | Organ #2 "Reaction" | `1× Antigen 7 [89] → 3× Antibody 7 [109] + 1× Pain [148]` at rate byte 47, half-life **105 ticks** ("Medium", decay rate 0.99340) | Antigen 7 is the only antigen (of the eight at chemicals 82–89) whose immune-clearance reaction emits Pain as a byproduct. The other seven antigens clear without pain. The effect is that *this specific illness* produces both the expected fever-and-fatigue response and a foreground pain signal that drives the creature to seek food and rest rather than just tolerate the ailment. Antigen 7 is used by the stock genome's "serious-infection" disease vector |
| 4 | Damage stimulus (STIM WRIT) | Bootstrap scripts, agent event handlers | — | `STIM WRIT <target> 0 <amount>` with stim chemical id 0, which the `STIMTOBIOCHEMOFFSET = 148` mapping translates directly to chemical 148 | Stim id 0 is the "PAIN" slot in the stimulus table. The slap bootstrap handler, the DEACTIVATE click handler (click over legs = slap), hazard agents (flames, electricity, hitting a wall at speed), and any script that wants to "hurt the creature" inject directly into chemical **148** (the active drive), **not** 131 (the reservoir). This means stim-based pain is inherently transient: it rises sharply on the event and fades on the 172-tick half-life unless the script re-stims repeatedly or also writes 131 |
| 5 | Direct CAOS injection | — | Any | `CHEM 148 <n>` on a targeted creature from a script, agent event handler, or the debug console | One-shot burst; decays on own half-life (≈ 5.7 s). For a lingering pain inject into 131 (the backup) instead — see usage #1 |
| 6 | No emitter | — | — | The emitter table (43 entries) contains **no entry whose target chemical is 148 or 131**. No brain neuron, sensorimotor locus, circulatory locus, or organ signal produces Pain directly — every source of pain in the game is a reaction product, a stim, or an explicit CHEM write. This is structurally unlike Loneliness, Crowded, Sleepiness, Boredom, Fear, Anger, and most other drives, all of which have at least one emitter seeding their active pool ambiently |
| 7 | No initial concentration | — | — | Chemical 148 is absent from the initial-concentration table. A newly-hatched Norn is born with exactly 0 active Pain. Pain backup (131) also has no initial concentration, so babies start painless and the pair stays at zero until the first damage event, the first alcohol intake, or the first antigen-7 infection |
| 8 | Modded genomes | User-added | User-added | Breeders commonly add emitters keyed to `RLOCUS_INJURY` (organ somatic injury locus), to specific antigens, to brain "trauma memory" neurons, or to low-life-force circulatory conditions. A particularly popular mod adds a `Pain` emitter on low blood-sugar to simulate "hunger pangs"; another family of mods wires individual organ damage (via the per-organ injury locus) into Pain to make organ-specific injuries noticeable | Gene-dependent |

## Usage

Pain is consumed by **five receptors** and **one reaction**, plus its own passive decay. No neuroemitter in the stock genome reads chemical 148. The five receptors are distributed across four of the six organ-1 tissues and one organ-2 tissue, giving Pain an unusually broad physiological footprint.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Decision-lobe drive bar | Receptor #1 (gene 1) | Organ #1 "Creature" / Tissue 5 "Drives" / locus 0 "Pain" | threshold 0, gain 207, analogue, from Baby | The value the brain's `DRIVE_LOBE` receives as drive offset **0** (`PAIN` in the `driveoffsets` enum). This is the "Pain" bar shown in the Creature Companion's drives display, and the signal the concept-, decision-, and attention-lobe circuitry weighs when choosing behaviour. With threshold 0 and analogue gain 207/255, the drive receptor is active at any non-zero Pain level, rising linearly with concentration. This is the only receptor on 148 that directly affects *what the creature chooses to do* |
| 2 | Involuntary egg-laying trigger | Receptor #69 (gene 92) | Organ #1 "Creature" / Tissue 4 "Sensorimotor" / locus 0 "LOC_INVOLUNTARY0 (Lay egg)" | threshold 48, gain 255, **DIGITAL**, from Baby | Whenever active Pain exceeds 48/255 (≈ 19 %) the sensorimotor locus for involuntary action 0 fires at full intensity, triggering the Lay-Egg reflex in pregnant females. This is how the stock biochemistry models "labour pain → contractions → birth": a pregnant Norn whose progesterone cycle has produced enough Pain (directly or via backup release) automatically lays her egg without the decision lobe having to choose an explicit `lay egg` action. The threshold is low enough that any serious pain event in a pregnant creature will cause her to lay. See also the reproductive faculty |
| 3 | Organ metabolic acceleration | Receptor #138 (gene 16) | Organ #2 "Organ" / Tissue 0 "Somatic" / locus 0 "RLOCUS_CLOCKRATE" | threshold 30, gain 255, analogue, from Baby | Every organ in the creature (heart, lungs, brain, reproductive, digestive, etc.) has a per-organ somatic clockrate. This receptor raises each organ's tick rate whenever active Pain exceeds 30/255 (≈ 12 %), scaling analogue up to full speed-up at saturation. The effect is that a Norn in pain metabolises *all* internal biochemistry faster — reactions run quicker, energy is burned faster, and other decays accelerate. This is the "adrenaline / stress response" pathway: pain makes the whole body run hot. Because the receptor is attached at organ scope (ORGAN=2, not ORGAN=1 Creature), it applies to each organ independently |
| 4 | Gait/posture shift | Receptor #192 (gene 100) | Organ #1 "Creature" / Tissue 4 "Sensorimotor" / locus 9 "LOC_GAIT1" | threshold 33, gain 239, **DIGITAL**, from Baby | Whenever active Pain exceeds 33/255 (≈ 13 %) sensorimotor emitter GAIT1 fires at gain 239/255. `LOC_GAIT1` is one of sixteen voluntary gait loci the motor faculty reads to select pose overlays — different values select different gait animations (hobbling, limping, favouring a side, etc.). The stock genome uses GAIT1 as the "hurt walk" gait. A Norn in noticeable pain visibly changes its walk animation as long as the active Pain signal remains above threshold |
| 5 | Circulatory feedback (Youth+) | Receptor #156 (gene 56) | Organ #1 "Creature" / Tissue 1 "Circulatory" / locus 12 "Locus 12" | threshold 191, gain 255, **DIGITAL**, from **Youth** | A late-maturing digital receptor on circulatory floating-locus 12. Floating loci (`LOC_FLOATING_FIRST=0` … `LOC_FLOATING_LAST=31`) are pairs of receptor+emitter at the same locus id that let the genome link two chemicals without a reaction — "produce chem B when chem A exceeds threshold". The stock Pain receptor at circulatory locus 12 writes the 255-valued signal into that locus's emitter slot, which is picked up by another gene (paired emitter — in stock genomes this routes to stress or adrenaline analogues). The high threshold (191/255 ≈ 75 %) means this only fires during **severe** pain, and only once the creature has matured past Baby stage. It is the circulatory-system entry point for "agonising pain" signals that younger creatures are shielded from |
| 6 | Active → Hunger-for-protein-backup spillover | Gene 20 (reaction id 56) | Organ #2 "Reaction" | `1× Pain [148] → 1× Hunger for protein backup [132]` at rate byte 18, half-life **6 ticks** ("Very short", decay rate 0.88978) | The single **cross-drive** reaction in the backup family. Active Pain is consumed very fast (~11 % per tick) and the mass is deposited into the Hunger-for-protein reservoir, not the Pain reservoir. The biological metaphor is direct: an injured body needs protein to rebuild, so pain should make the creature hungry for protein. Because this reaction is Very short and the active-Pain half-life is Medium, almost all active Pain produced by stims, alcohol, or antigen-7 is drained into 132 within a second or two, after which the protein-hunger reservoir slowly drips that accumulated "damage debt" into active Hunger-for-protein (149) via reaction 43 over the following minutes. The net effect is that a one-off damage event produces a brief sharp Pain bar followed by a sustained protein-hunger bar — the creature remembers the pain as hunger |
| 7 | Passive own-decay | Gene 64 entry #148 (half-life table) | Bloodstream | `genomeValue: 52`, half-life **172 ticks** (decay rate 0.99597), labelled "Medium" | Independent of reaction 56, active Pain is erased by its own genome-decay term at ~0.4 %/tick, i.e. half is gone every 5.7 s. This is identical to several other active drives in the 148–161 range (e.g. Loneliness 156 at 563-tick Medium is slower; Hotness 153 at Medium is comparable). Because reaction 56 is much faster (6 ticks vs. 172), own-decay is a negligible second-order drain — over 95 % of mass leaves through the spillover |
| 8 | No neuroemitter hook | — | — | The stock neuroemitter list does not wire any brain neuron to chemical 148 | — |
| 9 | Modded consumers | User-added | User-added | Modders commonly add secondary Pain receptors: on brain lobes (a "pain memory" neuron), on additional gait loci (severe-pain collapse animation), on the immune tissue (illness-accelerates-under-pain), or replace reaction 56 with variants feeding other drive backups (e.g. `Pain → Fear backup` for a "trauma" mod, or `Pain → Sleepiness backup` for a "concussion" mod) | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture for Pain

Creatures 3 organises every drive as a **pair** of chemicals: a short-to-medium-lived active drive (148–161) that the Drives-tissue receptor reads, and a long-lived backup (131–146) that acts as a reservoir. For the Pain axis:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | 131 | Pain backup | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | **148** | **Pain** | **172 ticks ("Medium", ≈ 5.7 s)** | **0** |

Two reactions wire the pair — but **asymmetrically**, unlike most other drive pairs:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 7 (id 42) | `Pain backup → Pain` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 20 (id 56) | `Pain → Hunger for protein backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → *other drive's backup*** (cross-drive spillover) |

Every other drive pair in the stock genome has a symmetric `<Drive> → <Drive backup>` reaction that refills its own reservoir. Pain is the sole exception: its reverse reaction routes mass into the Hunger-for-protein reservoir (132) instead of its own reservoir (131). The consequence is that active Pain cannot "charge up" Pain backup — the reservoir is filled only by explicit external writes. See *[The missing self-refill](#the-missing-self-refill)* below for the consequences.

### Why there is no Pain emitter

Most drive chemicals have at least one ambient emitter that produces a small background signal scaled by an environmental or internal condition. Loneliness has `LOC_CROWDEDNESS`; Boredom has an analogue input; Hotness / Coldness have `LOC_HOTNESS` / `LOC_COLDNESS`; Sleepiness has `LOC_CONST` and `LOC_LIGHTLEVEL`. Pain has **none**.

The biochemical justification is that pain in the Creatures ecosystem is an **event signal**, not a homeostatic one. A healthy Norn in a non-hostile environment should have exactly zero pain — there is nothing for the body to report. Pain only makes sense when something discrete has happened: a physical impact, a metabolic poison accumulating, a specific pathogen being cleared, or a deliberate injection by a scripted device or the hand itself. The genome therefore supplies three reaction-based producers (backup drip, alcohol metabolism, antigen 7 immune response) and relies on the stimulus system (`STIM WRIT 0`) for all other damage.

This makes Pain qualitatively different from every other drive: its active pool can be **exactly zero for the entire lifetime** of a Norn if nothing damages her, whereas Loneliness, Hotness, Tiredness, and Hunger are always at least slightly positive in any real game session.

### The missing self-refill

Reaction 56 is often called the "cross-spillover" and it replaces the role that a hypothetical `Pain → Pain backup` reaction would have played. Consider the four possible designs for the feedback leg of a drive pair:

| Design | Effect on active drive | Effect on own backup | Example drives |
|--------|------------------------|----------------------|----------------|
| `Active → own Backup`, Very short | Active drains fast; chronic signal accumulates in own reservoir | Reservoir grows in proportion to total active-event exposure | Loneliness, Crowded, Sleepiness, Boredom, Fear, Anger, Sex drive, Need for pleasure, Hunger for protein/carb/fat, Tiredness, Coldness, Hotness (all 14 other drives) |
| `Active → own Backup` **doubled** | Very fast drain; reservoir fills near-instantly | Reservoir tracks total exposure very closely | Carb, Fat, Coldness, Hotness (doubled-pull pairs) |
| `Active → other drive's Backup`, Very short | Active drains fast, but into a *different* axis | Own reservoir can only grow by external writes | **Pain** (unique) |
| No feedback leg at all | Active simply decays on its own half-life | Backup never fills automatically | (no drive uses this) |

The stock genome's choice to route reaction 56 into chemical 132 (Hunger-for-protein backup) rather than 131 is deliberate and carries two gameplay consequences:

1. **Pain is ephemeral unless actively re-stimulated.** A single `STIM WRIT ... 0 100` produces a brief spike that is mostly gone within a second or two. For a lingering ache the script must either repeat the stim, write to 131 (the backup), or hurt the creature repeatedly (e.g. by leaving it on a hot plate).
2. **Pain translates into hunger.** A minute after a damage event the creature will be hungrier for protein than it was before, even though the decision lobe's pain bar has returned to zero. This models the metabolic cost of healing — an injured body needs amino acids — without requiring the brain to "know" it is injured. The body remembers via biochemistry.

The Pain-backup doc calls this asymmetry the reason chemical 131 is "write-only from the outside world". Scripts wanting a chronic ache have to inject 131 explicitly; no amount of repeated `STIM WRIT 0` damage will build up a Pain-backup reservoir, because the stim system writes only to 148.

### The five-receptor cascade

When active Pain crosses the various receptor thresholds, the effects unfold in a specific sequence. Assume a creature at rest (all pain 0) receives a `STIM WRIT ... 0 128` (half-intensity slap). The following tick-by-tick cascade runs:

| Pain level | Receptors firing | Behavioural / physiological effect |
|------------|------------------|------------------------------------|
| 0–29 (< 12 %) | Drive-bar only | The decision lobe sees a small Pain signal and begins weighting pain-reduction actions. No other system reacts. This threshold window is almost never held: reaction 56 drains mass at 11 %/tick, so a pain injection of this size fades within ~3 ticks |
| 30–32 (~12 %) | Drive-bar + organ clockrate | `RLOCUS_CLOCKRATE` begins scaling up organ tick rates. Every organ in the body starts running faster, consuming more ATP and producing more waste. This is the first whole-body physiological effect |
| 33–47 (~13–18 %) | + gait | `LOC_GAIT1` fires digital-full; the creature's walk animation shifts to "hurt walk". This is the first *visible* external sign of pain |
| 48–190 (~19–74 %) | + involuntary lay-egg (if pregnant) | A pregnant Norn at this pain level will automatically lay her egg (`LOC_INVOLUNTARY0`). Combined with the drive-bar signal and gait change, this produces the "Norn in labour" appearance: hurt walk + brief auto-egg-drop |
| 191–255 (~75–100 %) | + circulatory Locus 12 (Youth+) | Severe pain in an adolescent-or-older creature fires the circulatory feedback receptor. The paired emitter (the other half of the floating-locus pair) will then produce its chemical downstream — typically a stress-or-adrenaline analogue in the stock genome. Babies are exempt because this receptor is `switchOnStage: Youth`, implementing the design rule "the youngest creatures should not suffer extreme physiological pain responses" |

Because the drive-bar receptor has threshold 0 and gain 207, the creature's **decision-making** starts to weight pain-reduction before any of the physiological effects kick in. The gait change at ~13 % is the first visible cue, the organ speed-up at ~12 % is the first invisible cost, and the extreme-pain circulatory signal at ~75 % is the last-resort "fight-or-flight" trigger.

### Pain and alcohol: the hangover mechanism

Reaction 90 deserves a closer look. It consumes **two** units of Alcohol plus **one** unit of Dehydrogenase to produce one Glucose and one Pain:

```
  2× Alcohol + 1× Dehydrogenase → 1× Glucose + 1× Pain
```

Dehydrogenase (chemical 116) is the metabolic enzyme that normally clears ingested alcohol. Every successful clearance therefore produces a proportional amount of active Pain. Because the reaction runs at Short (21-tick) speed, a drunk Norn accumulates Pain faster than her 172-tick Medium own-decay and 6-tick Very-short spillover can dissipate it, producing a sustained drive-bar reading as long as alcohol remains in the system. Once alcohol is exhausted the reaction stops and Pain falls to zero within tens of seconds.

This means the "hangover" is not a delayed-onset effect — it occurs *during* intoxication, while alcohol is being metabolised. It is also a **pure active-drive** effect: no Pain backup is created (reaction 56 drains the produced Pain straight into Hunger-for-protein backup), so when the alcohol runs out the creature feels fine within seconds but *also* finds itself suddenly much hungrier for protein than she was before drinking. The stock genome's drinking mechanics therefore produce three compounded effects: drive-bar pain while drinking, visible hurt-gait while drinking, and sustained protein hunger afterwards.

### Pain and antigen 7: the "serious illness" marker

Of the eight antigens in the 82–89 block, only antigen 7 (chemical 89) has a pain-producing clearance reaction (reaction 99). The other seven antigens produce only their corresponding antibodies, without the Pain byproduct. This makes antigen 7 the genome's canonical "serious infection" — one that produces an explicit pain signal during immune response.

A creature infected with antigen 7 therefore runs the following compound pathway:

1. The antigen triggers general immune responses (fever toxin, antibody production, antigen-binding histamine releases).
2. Reaction 99 consumes antigen at Medium speed, producing **three** antibody-7 and **one** Pain per antigen unit.
3. The produced Pain fires all five receptors in proportion, including the decision-lobe drive bar (choosing to seek pain-relief, i.e. food and sleep), the organ clockrate increase (burning energy to fight the infection), the hurt-gait (visible sickness animation), and at high antigen loads the involuntary-egg-lay and circulatory stress responses.
4. Reaction 56 drains the Pain into Hunger-for-protein backup, producing a sustained appetite that persists after the infection clears — the creature eats more for days after recovery, rebuilding damaged tissue.

This is the biochemical implementation of "you're not just ill, you're in pain from being ill". It distinguishes the severe antigen-7 infection from milder conditions that produce only fever or fatigue.

### Effects of direct injection

Because Pain has three very different injection points — reservoir (131), active drive (148), and stim (which also writes 148) — each produces a characteristic profile:

| Injection | Profile | Use case |
|-----------|---------|----------|
| `CHEM 148 <n>` | Sharp rise, ~5.7 s Medium decay, most mass drained to protein-hunger backup within seconds | "Brief pain event" — simulating an instantaneous slap or impact |
| `STIM WRIT <target> 0 <n>` | Identical to `CHEM 148` (stim id 0 maps directly to chemical 148) plus usual stim-system side effects (learning, attention) | Canonical damage-stim — bootstrap code uses this for hand slaps, hazard agents, etc. |
| `CHEM 131 <n>` | Slow rise of active Pain over minutes via reaction 42 at 311-tick Medium; because the active pool drains fast, *most* of the reservoir never produces a visible drive-bar spike, but the creature feels a small persistent background pain for a long time | "Chronic ache" — simulating long-term injury, lingering illness, or phantom pain |
| `CHEM 131 +n` + `CHEM 148 +m` | Combined: acute spike plus chronic tail | "Serious injury" — mod scripts use this for fractures, burns, or deep wounds |

The design asymmetry makes the stim and direct-active injections nearly interchangeable (both go to 148 with the same decay profile), while Pain-backup injection produces a qualitatively different profile that cannot be reproduced by any amount of repeated stimming.

### Pain in the decision hierarchy

Because Pain is drive offset 0 in the drive-offsets enum, it occupies the first slot the `DRIVE_LOBE` reads. The decision lobe weighs all sixteen drive inputs together, but modders and C3 lore generally hold that the drive-lobe network was trained with Pain as the single highest-weight input: a creature with a non-zero pain bar will almost always choose a pain-relieving action over a comfort, food, or social action when the signals are comparable. This is hard to prove from the genome alone because the lobe's weights are network-dependent, but the receptor gain (207) is the joint-highest on the drive-bar receptors, tying with Loneliness (207) and Crowded (209) but being the only one that also fires all four non-drive effects simultaneously.

In practical gameplay, a slap produces the following decision cascade:

1. Tick 0: `STIM WRIT 0 <n>` writes Pain = n. Drive-bar rises immediately.
2. Tick 1: Decision lobe re-evaluates; pain-relief actions (`AC_EAT`, `AC_SLEEP`, `AC_GET` if a toy is present) gain weight.
3. Ticks 1–6: Reaction 56 drains pain into hunger-for-protein backup; drive-bar falls rapidly.
4. Ticks 2–4: Organ clockrate increases; gait shifts to hurt-walk if pain was above 33.
5. Ticks 6–50: Pain-bar is near zero but protein-hunger-backup is non-zero; reaction 43 slowly drips it into active protein-hunger.
6. Ticks 50+: The creature chooses food behaviours (approach food, eat) because the protein-hunger bar is now elevated.

From the player's perspective: the creature winces (gait change), reacts briefly (pain spike), and then wants food. The continuity between "you slapped her" and "she's eating" is implemented purely biochemically — the brain never explicitly represents the causal link.

### Contrast with Pain backup (131)

Chemical 148 Pain (active) and 131 Pain backup (reservoir) share the pair's structural role but differ in every observable property:

| Feature | Pain (148) | Pain backup (131) |
|---------|-----------|-------------------|
| Half-life | 172 ticks (Medium, ~5.7 s) | ~9·10¹⁰ ticks (Very long, effectively permanent) |
| Decay per tick | ~0.4 % (own) + ~11 % (reaction 56 spillover) | ~0.22 % (reaction 42 release) |
| Receptors | **Five** (drive-bar, involuntary-lay-egg, organ-clockrate, gait, circulatory-locus-12-at-Youth) | **Zero** |
| Reaction inputs | Reaction 42 (from backup), reaction 90 (alcohol), reaction 99 (antigen 7) | None — reservoir is filled only externally |
| Reaction outputs | Reaction 56 (to Hunger-for-protein backup) | Reaction 42 (to Pain active) |
| Initial concentration | 0 | 0 |
| Stim mapping | `STIM WRIT 0` maps to 148 via `STIMTOBIOCHEMOFFSET = 148` | Not mapped to any stim id |
| Decision-lobe read | Yes (drive offset 0) | Invisible to the brain |
| Visible on Drives UI | Yes (the "Pain" bar) | No (Science Kit only) |

The two chemicals together constitute the full Pain axis: 148 is what the creature *feels and reacts to right now*, and 131 is what it *has banked* as ongoing body-damage history. The absence of an automatic flow from 148 back to 131 is the feature that makes pain fundamentally different from every other drive — it cannot accumulate as "remembered pain" unless an external actor chose to write the reservoir.

### Implications for modders

Common modifications built on top of Pain:

1. **Add a `Pain → Pain backup` reaction** (mirroring the 15 other drive pairs). Makes pain accumulate as chronic ache over sustained damage. Fundamentally changes the Pain axis from ephemeral to cumulative.
2. **Add an `RLOCUS_INJURY` emitter into chemical 148.** Makes physical damage to any organ automatically produce Pain. In the stock genome, organ injury only produces Pain via the immune-response chain if it triggers antigen production; this shortcut makes purely mechanical injury painful.
3. **Add emitters from brain "trauma memory" neurons** into chemical 131, so specific learned memories (e.g. "the hand slapped me here") produce long-term chronic pain and therefore chronic protein-hunger via the 56 spillover.
4. **Replace reaction 56 with a self-refill** (`Pain → Pain backup` at Very short). Converts Pain into a standard drive pair and removes the cross-drive spillover. Simplifies the biochemistry at the cost of losing the pain-increases-appetite mechanic.
5. **Lower the involuntary-lay-egg threshold from 48 to 10.** Makes pregnant females lay eggs from minor slaps — a common breeding mod for accelerating egg production in maternity pens.
6. **Raise the organ-clockrate threshold from 30 to 128.** Makes metabolic acceleration require severe pain only, eliminating the subtle "pain makes you burn energy" background effect.
7. **Replace the circulatory locus 12 floating-locus pair's target chemical** to produce different downstream responses from extreme pain — e.g. adrenaline, dopamine, or a mod-specific "fury" chemical.
8. **Raise the initial concentration of 148 or 131** so newly-hatched Norns begin life in pain. Used by "damaged newborn" mods or punishment genomes.

Because Pain sits at drive offset 0 and fires four non-drive receptors simultaneously, modifications to it are unusually impactful — they cascade into appetite, gait, organ metabolism, egg-laying, and circulatory stress. Modders are advised to keep changes small and monitor all five downstream effects.

### Practical consequences for gameplay

- **Slapping a Norn is the canonical pain event.** The DEACTIVATE click message (click over legs or body) invokes the slap bootstrap script, which calls `STIM WRIT <target> 0 <n>`. This writes directly to chemical 148 with the full acute profile described above.
- **Pain is almost always short-lived.** Without backup injection or continuous restimulation, any pain the creature feels fades within seconds. A Norn observed in sustained pain is almost certainly either (a) drunk on alcohol that has not yet cleared, (b) clearing antigen 7, or (c) carrying a Pain-backup reservoir from an earlier CHEM 131 write.
- **Pain makes creatures hungry.** Because reaction 56 routes active Pain into Hunger-for-protein backup at Very short rate, every pain event produces a corresponding increase in protein appetite that persists for minutes afterwards. Feeding a just-slapped Norn is well-received.
- **Pain accelerates everything.** The organ-clockrate receptor means a Norn in pain burns energy faster, ages metabolically faster during the pain, and runs chemical reactions faster in every organ. A chronically-pained creature (one carrying a large Pain-backup reservoir) effectively lives a compressed life.
- **Pregnant Norns lay eggs when in pain.** The `LOC_INVOLUNTARY0` receptor at threshold 48 ensures that any significant pain event in a pregnant female triggers auto-lay. This is why breeders occasionally use controlled slaps to induce egg-laying in stuck pregnancies.
- **Severe pain has an adolescent cutoff.** The circulatory locus 12 receptor does not fire in Baby-stage creatures — babies are spared the "extreme pain" circulatory response. Beyond adolescence the receptor is active and severe pain produces whatever downstream effect its paired emitter targets (typically adrenaline or stress chemicals in the stock genome).
- **Pain is not directly observable in bulk.** Only the active drive bar appears on the standard Drives UI. Pain-backup is invisible except via the Science Kit. A creature with low active Pain but high Pain backup will appear to be feeling fine while slowly accumulating the secondary effects (organ acceleration, occasional gait slips) from the drip-feed.

### Summary

```
 Stock-genome wiring of Pain [148]
 ────────────────────────────────────────────────────
 Inputs:
    Pain backup [131] ─ reaction 42 (gene 7) ───────▶ [148]
                          half-life 311 ticks ("Medium", ~10 s)
                          drip-feed release

    2× Alcohol [75] + Dehydrogenase [116] ───────────▶ [148] (+ Glucose)
                          reaction 90 (gene 81), half-life 21 ticks ("Short")

    Antigen 7 [89] ──────────────────────────────────▶ [148] (+ 3× Antibody 7)
                          reaction 99 (gene 92), half-life 105 ticks ("Medium")

    STIM WRIT <target> 0 <amount> ───────────────────▶ [148]
                          stim id 0 → chemical 148 via STIMTOBIOCHEMOFFSET=148
                          used by slap bootstrap, hazards, damage agents

    CHEM 148 <n> (CAOS / scripts / mods) ────────────▶ [148]

    (No emitter writes to 148 directly; no initial concentration)

 Active drive:
         Pain [148]
         half-life 172 ticks ("Medium", ~5.7 s)
         initial concentration: 0
                        │
                        ├─► Drives tissue locus 0 (gain 207) ───▶ decision-lobe "pain" bar
                        │                                         (drive offset 0, DRIVE_LOBE)
                        │
                        ├─► Sensorimotor LOC_INVOLUNTARY0 (Lay egg)
                        │     threshold 48, digital, gain 255
                        │     → pregnant female auto-lays egg
                        │
                        ├─► Organ somatic RLOCUS_CLOCKRATE
                        │     threshold 30, gain 255
                        │     → every organ speeds up tick rate
                        │
                        ├─► Sensorimotor LOC_GAIT1
                        │     threshold 33, digital, gain 239
                        │     → shifts walk animation to hurt-walk
                        │
                        ├─► Circulatory Locus 12 (Youth+ only)
                        │     threshold 191, digital, gain 255
                        │     → fires floating-locus pair, triggers stress/adrenaline
                        │
                        └─► reaction 56 (gene 20):
                              1× Pain [148] → 1× Hunger for protein backup [132]
                              half-life 6 ticks ("Very short", ~0.2 s)
                              (cross-drive spillover, NOT self-refill)
```

Pain is therefore the **event-driven, physiologically-penetrating, cross-coupled** active drive of the Creatures 3 biochemistry. It is produced only by specific events (stim, alcohol metabolism, antigen 7 immune response, backup drip), consumed by five receptors that collectively alter decision-making, egg-laying, organ metabolism, gait, and the circulatory stress response, and drained by a unique cross-drive spillover that converts it into protein-hunger instead of self-replenishing a reservoir. Among the sixteen active drives it is the one with the widest physiological footprint and the shortest event-to-effect latency — the signal the body cannot ignore, and the only drive whose ghost lives on as hunger long after the pain itself has faded.
