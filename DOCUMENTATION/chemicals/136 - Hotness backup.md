# 136 - Hotness backup

Hotness backup is the **reservoir half** of the drive pair for *Hotness* (chemical 153). It occupies the sixth slot of the "drive backup" block (chemicals 131–146), the bank of sixteen long-lived placeholder chemicals that the stock Creatures 3 / Docking Station genome pairs one-to-one with the sixteen drive chemicals in the 148–161 range. Its role is to carry a slow-release pool of the creature's "banked" heat so that the **acute** signal — the value the brain reads and "feels" as being hot — and the **chronic** signal — the deeper, slower-moving thermal load built up over a minutes-long fever or sustained exertion — can evolve on different timescales. With its essentially infinite half-life, whatever the creature has accumulated in its hotness reservoir persists across many minutes of play unless actively drained by the `backup → drive` reaction, bled off by evaporative cooling, or annihilated against Coldness.

Hotness backup is the mirror of Coldness backup (135) and follows an almost identical skeleton, but it differs in several important ways that reflect the asymmetry between feeling hot and feeling cold in the stock genome. There is **no Pistle-like environmental emitter** driving Hotness up when the creature enters a warm CA; in the stock Docking Station genome, rising body temperature is a product of **pathology** (a fever toxin metabolising with the creature's water), **immune stress** (specific antigen responses), and **internal mass transfer from Coldness** rather than an ambient-thermal input. Hotness also has **two additional consumption pathways** that Coldness lacks — reactions 26 and 31, both of which burn water *together* with hotness, modelling the biochemistry of sweating and evaporative cooling. Finally, the active drive 153 is read not only by the ordinary Drives-tissue "hotness" bar but by **two distinct RLOCUS_CLOCKRATE receptors on the reaction organ**, so sustained hotness directly accelerates the creature's internal biochemistry — the classic "fever speeds up metabolism" effect.

The backup itself has **no receptor** anywhere in the body and **no emitter** — nothing reads its concentration and no neural or organ signal writes to it directly. It is a pure biochemical buffer, invisible to the creature's brain and to the stock `Drives` display. Its entry in the half-life table records a "Very long" decay (≈ 9·10¹⁰ ticks, effectively permanent), and the initial-concentration table contains **no entry** for 136, so every newly-hatched Norn starts with zero hotness backup and builds it up purely from the active drive's overflow.

## Sources

Hotness backup has two endogenous inflows (both routed from the active drive) and one external inflow. Nothing in the brain or sensorimotor system writes to it directly, and — unlike Coldness — no circulatory-tissue emitter produces the active partner from an environmental reading.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Self-refill from active drive (primary) | Gene 32 (reaction id 60) | Organ #2 "Reaction" | `1× Hotness [153] → 1× Hotness backup [136]` | Rate byte 18, half-life **6 ticks** (≈ 0.2 s at 30 Hz), labelled **"Very short"** — the fastest speed class |
| 2 | Self-refill from active drive (duplicate) | Gene 66 (reaction id 70) | Organ #2 "Reaction" | `1× Hotness [153] → 1× Hotness backup [136]` (identical formula and rate) | Rate byte 18, half-life **6 ticks**. This is an exact duplicate of gene 32 — both reactions run in parallel every tick, so the **effective decay of [153] into [136] is doubled**: the per-tick loss of active-drive mass to the reservoir is `1 − 0.88978² ≈ 0.2083` rather than a single-reaction `0.1102` |
| 3 | External CAOS injection | — | Any | `CHEM 136 <n>` on a targeted creature from a script, bootstrap agent, or the debug console | One-shot; effectively permanent because the chemical's own half-life is ≈ 9·10¹⁰ ticks (see Usage #2) |
| 4 | Indirect via Fever toxin metabolism | Gene 80 (reaction id 80) → reactions 60 & 70 | Organ #2 | `1× Fever toxin [72] + 1× Water [33] → 8× Hotness [153]` at **Short** speed (24 ticks). Fever toxin is the stock genome's dedicated pyrogen; whenever the creature has any fever toxin in its bloodstream, it burns water to produce a strong 8-unit pulse of active hotness, ≈21 % of which is siphoned into the backup per tick | Indirect; very fast and potent — a single fever-toxin spike can fill the reservoir substantially within seconds |
| 5 | Indirect via immune response to Antigen 4 | Gene 89 (reaction id 95) → reactions 60 & 70 | Organ #2 | `2× Antigen 4 [86] → 3× Antibody 4 [106] + 1× Hotness [153]` at **Short** speed (64 ticks). Fighting off the Antigen-4 pathogen gives the creature a warm "fever" as an immune side-effect | Indirect; modest contribution, tied to infection load |
| 6 | Indirect via immune response to Antigen 6 | Gene 91 (reaction id 98) → reactions 60 & 70 | Organ #2 | `1× Antigen 6 [88] → 3× Antibody 6 [108] + 1× Hotness [153]` at **Medium** speed (116 ticks). A second "hot-symptom" immune response tied to a different antigen | Indirect; slower than Antigen-4 response because Medium vs. Short, again tied to infection load |
| 7 | No environmental emitter | — | — | Unlike the Coldness drive (which has the `Water + Pistle → 3× Coldness + Pistle` pathway fed by a Circulatory-tissue emitter), **no emitter anywhere in the stock genome writes to chemical 153**. Hotness is wired to **pathology, not ambient thermal input** — a plain warm CA does not raise a healthy Norn's Hotness. Hot environments still affect the creature's Coldness pathway (by making the circulatory emitter fall silent), but they do not produce a positive Hotness signal | — |
| 8 | No pain spillover | — | — | Unlike the protein pair (where gene 20 writes `Pain → Hunger for protein backup`), there is **no `Pain → Hotness backup`** reaction in the stock genome. The hotness reservoir is wholly decoupled from injury and pain history | — |
| 9 | No `LOC_CONST` pressure | — | — | The emitter table contains **no** entry whose target chemical is 153 and no entry for 136. Unlike the hunger drives (which have a constant `LOC_CONST` emitter writing 30–35 u/tick), hotness has no baseline pressure — the creature only feels hot when fever toxin or certain infections actively produce it | — |
| 10 | No initial concentration | — | — | The `initialConcentrations` block has no entry for chemical 136 (nor for 153 either). Every Norn hatches with exactly 0 units of hotness and 0 units of hotness backup | — |
| 11 | Modded genomes | User-added | User-added | Breeders frequently add the missing `Water + Pistle-hot → 3× Hotness + Pistle-hot` pathway to give Norns a proper hot-environment response, or a direct Circulatory-tissue emitter keyed to a high locus reading; add a `Pain → Hotness backup` spillover to mirror the protein pair; wire exercise-generated ATP decoupling into a direct Hotness producer (to simulate overheating from activity); or remove one of the duplicate self-refill reactions to bring the hotness pair in line with a single-pull buffer | Gene-dependent |

## Usage

Hotness backup has exactly **one consumer** — reaction 47 — and one passive characteristic (its essentially infinite half-life). Like all drive backups it has no direct receptor.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Backup → active drive conversion | Gene 12 (reaction id 47) | Organ #2 "Reaction" | `1× Hotness backup [136] → 1× Hotness [153]` at rate byte 58, half-life **311 ticks** (≈ 10 s at 30 Hz), labelled **"Medium"** | Every backup unit slowly becomes an active-drive unit at a medium rate. Combined with the two **"Very short"** (6-tick) reverse reactions, this produces a damped equilibrium in which the two chemicals constantly exchange, tilted heavily toward the backup |
| 2 | Passive decay (effectively none) | Gene 64 entry #136 (half-life table) | Bloodstream | `genomeValue: 255`, half-life ≈ **9.0 × 10¹⁰ ticks** (decay rate `1.0`), labelled "Very long" | A Hotness-backup pool persists indefinitely unless it is drained by reaction 47. All sixteen drive backups share this near-infinite half-life by design; the chemical's role is to act as a reservoir, not a signal, so it must not decay on its own. Note that the **active partner 153** is NOT "Very long" — it has a 563-tick Medium half-life (slightly faster than Coldness's 621-tick half-life), meaning the pair is *not* conservative: mass leaks out of the active drive continuously even without consumption |
| 3 | No receptor | — | — | Hotness backup is **not read by any stock receptor**. No drive, brain lobe, locus, or organ reads its concentration — the creature has no direct sensory awareness of the pool. Only the *active* drive at chemical 153 is read (see "What the active drive does that the backup cannot" below) | — |
| 4 | No neuroemitter hook | — | — | The neuroemitter list in the stock genome does not wire any brain neuron to chemical 136 | — |
| 5 | Modded consumers | User-added | User-added | Modders can add a "heat-memory" receptor (reading the slow-moving backup rather than the bouncing active drive) to feed a chronic-overheat neuron, or gate reaction 47 with an enzyme catalyst so that banked hotness is only released under a specific metabolic signal (e.g. when blood water is high, simulating a sweat-based release) | Gene-dependent |

## Role in Game Mechanics

### The drive-backup architecture

Creatures 3 organises every drive as a **pair** of chemicals: a short-lived active **drive chemical** (148–161) that the Drives-tissue receptors read, and a long-lived **backup chemical** (131–146) that acts as a reservoir. For the Hotness drive the pair is:

| Role | Chemical id | Name | Half-life | Initial |
|------|-------------|------|-----------|---------|
| Backup reservoir | **136** | **Hotness backup** | ~9·10¹⁰ ticks ("Very long") | 0 |
| Active drive | 153 | Hotness | 563 ticks ("Medium") | 0 |

The wiring reactions are:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 12 (id 47) | `Hotness backup → Hotness` | 311 ticks ("Medium", ≈ 10 s) | **Backup → active** (drip-feed release) |
| Gene 32 (id 60) | `Hotness → Hotness backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Active → backup** (fast self-refill) |
| Gene 66 (id 70) | `Hotness → Hotness backup` | 6 ticks ("Very short", ≈ 0.2 s) | **Duplicate** active → backup (second parallel pull) |

The key structural difference from the hunger backups is that the **active drive 153 itself decays** at Medium pace (563-tick half-life). Every tick the active hotness loses another ≈0.12 % of its mass to thermal equalisation, in addition to the ≈21 % pulled into the backup. This means the 136/153 loop is **not conservative** even without evaporative-cooling losses — heat leaks out of the system naturally, modelling the fact that a Norn's body temperature drifts back toward neutral when nothing is pushing it.

### Hotness vs. Coldness: a bidirectional thermal axis

Hotness is one end of a two-chemical thermal axis; the other end is **Coldness (152)**, which has a mirrored backup at **Coldness backup (135)**. The two active chemicals annihilate each other via reaction 23:

```
  Reaction 23 (gene 49): 1× Hotness [153] + 1× Coldness [152] → (nothing)
                         Half-life 0, "Instant decay"
```

This is a unique reaction class: it has the fastest possible rate (genomeValue 0) and removes mass from both reactants with no products. Whatever the smaller of the two concentrations is, it is removed *instantly* (within one tick) from both sides. The net effect is that **at most one of Hotness or Coldness is ever non-zero at a given moment**; they cannot coexist. Any environmental, metabolic, or immune event that would normally push both up simultaneously results in only the net-dominant signal being felt.

This is the game's biochemical representation of the thermodynamic fact that you cannot be both hot and cold at the same time — the temperature gradient has one direction. Hotness backup 136 and Coldness backup 135 therefore form a pair of mutually-exclusive reservoirs: a Norn with a long-standing fever has a large Hotness-backup reservoir and a depleted Coldness-backup reservoir (because any residual Coldness was being annihilated by the continuously-produced Hotness).

### Asymmetry with the Coldness pair: pathology-driven, not environment-driven

The most striking feature of the Hotness pair in the stock Docking Station genome is that it is **purely pathology-driven**. The three producers of active hotness are all abnormal states of the body:

1. **Fever toxin metabolism** (`Fever toxin + Water → 8× Hotness`, Short, reaction 80). Fever toxin is a chemical that enters the body either from infection, ingestion, or a direct `CHEM 72 <n>` inject. It metabolises with water to produce an unusually large 8-unit pulse of hotness per reaction, making it the single most efficient hotness producer in the stock biochemistry — more than double the 3-unit Coldness produced by the Pistle reaction.
2. **Antigen 4 immune response** (`2× Antigen 4 → 3× Antibody 4 + 1× Hotness`, Short, reaction 95). Fighting the Antigen-4 pathogen gives the creature a fever-like symptom as a side-effect of producing antibody 4.
3. **Antigen 6 immune response** (`1× Antigen 6 → 3× Antibody 6 + 1× Hotness`, Medium, reaction 98). A second fever-inducing infection with a slower metabolic pace.

Critically, **there is no ambient-thermal emitter for Hotness anywhere in the stock genome**. A healthy Norn in a warm CA does not experience rising hotness; it simply experiences falling coldness (because the Pistle emitter on Circulatory locus 1 falls silent). This is an intentional asymmetry: in the Creatures 3 worldview, environmental *warmth* is the absence of cold rather than the presence of heat, whereas environmental *cold* is an active sensation. Heat in the body is reserved for pathology — you don't just feel hot, you feel **feverish**.

Modders who want a Norn to sweat in a hot room almost always add a mirrored `Water + Pistle-hot → 3× Hotness + Pistle-hot` reaction driven by a new Circulatory-tissue emitter keyed to a high-end temperature locus. This is one of the most common stock-genome "fixes" in long-lived Docking Station communities.

### Evaporative cooling: the unique role of reactions 26 and 31

Hotness has two consumption pathways that Coldness entirely lacks:

| Reaction | Formula | Half-life | Role |
|----------|---------|-----------|------|
| Gene 52 (id 26) | `1× Water + 4× Hotness → (nothing)` | 24 ticks ("Short") | Fast evaporative-cooling burst |
| Gene 53 (id 31) | `2× Water + 4× Hotness → (nothing)` | 116 ticks ("Medium") | Slower, more water-costly baseline cooling |

Both reactions consume water *together* with hotness, producing nothing. This is the biochemical model of **sweating**: the body exports its excess heat by burning water in a reaction that produces no stored mass but removes both quantities from circulation. The two reactions differ in their water-efficiency:

- Reaction 26 burns 1 water per 4 hotness at a short timescale — the fast emergency cooling pulse that kicks in when hotness rises quickly.
- Reaction 31 burns 2 water per 4 hotness at a medium timescale — the slower baseline cooling that runs continuously but doubles the water cost.

A well-hydrated Norn has plenty of ammunition for both reactions and can shed a fever over minutes. A dehydrated Norn cannot, and its hotness will accumulate — creating a characteristic death-spiral in which illness drives both fever and dehydration simultaneously. This interaction is the closest the stock genome gets to modelling a heatstroke fatality.

Note that **Coldness has no equivalent warming reaction**. There is no `Food + Coldness → ...` to "warm the creature by eating", which is consistent with the rest of the biochemistry — cold is a sensation, heat is a substance.

### Why hotness has no LOC_CONST emitter

Unlike Pain and the three hunger drives, Hotness has **no `LOC_CONST` sensorimotor emitter** writing a baseline 30 u/tick into it. This is a deliberate design choice: hotness is **stimulus-driven**, not appetite-driven. A Norn does not have a constant urge to be hot; instead, it feels hot only when pathology is making it hot.

### Why the duplicate self-refill matters

Of the sixteen drive-backup pairs in the 131–146 / 148–161 block, the carb pair (133/150), the fat pair (134/151), the coldness pair (135/152), and the **hotness pair (136/153)** are the four with two identical self-refill reactions. For the hotness pair, gene 32 and gene 66 both encode exactly the same formula at exactly the same rate:

```
  Gene 32 → Reaction 60 : 1× [153] → 1× [136]  (Very short, halflife 6 ticks)
  Gene 66 → Reaction 70 : 1× [153] → 1× [136]  (Very short, halflife 6 ticks)
```

Because the biochemistry engine runs each reaction independently per tick, the two reactions compose multiplicatively. The fraction of active drive surviving one tick due to the two refills alone is `0.88978² ≈ 0.79172`, so about **21 %** of active hotness is pulled into the reservoir every tick — roughly double the protein-hunger pair's ~11 %.

The duplication is structurally identical to the carb, fat, and coldness pairs, and the symmetry is deliberate-looking: all three **macronutrient hungers** (carb, fat) and both **thermal sensations** (cold, hot) need heavily-buffered drive signals because their underlying physical quantities (blood sugar, blood lipids, body temperature) fluctuate on the scale of minutes, not seconds. The protein and pain backups (which are single-pull) represent faster-changing drives that don't need as much buffering.

The observable gameplay consequence is that the hotness drive is sluggish and stable:

- **A short exposure to fever toxin barely registers** on the Drives bar, because the fast self-refill absorbs the transient burst into the invisible reservoir before the brain's drive receptor has time to respond — but it also barely triggers the clock-rate-acceleration receptor, protecting the creature from transient fevers.
- **A prolonged infection builds up a substantial reservoir**, which then drip-feeds the active drive via reaction 47 for ten seconds or more after the infection clears — the lingering "post-fever exhaustion" window that keeps the clock-rate elevated even after the antigen is gone.
- **The steady-state ratio is ≈93:1 backup:active** (see below), the same as the carb, fat, and coldness pairs and roughly twice as backup-heavy as the protein pair.

### Steady-state analysis

Because the active drive 153 also decays on its own (Medium, 563-tick half-life, decay rate 0.99877) and is additionally consumed by the two sweating reactions, the steady-state analysis is slightly more nuanced than the Coldness pair. Considering only the backup-refill and backup-release loop:

- Active drive 153 loses mass at rate `(1 − 0.88978²) × [153]` per tick from the duplicated self-refill (≈21 %).
- Active drive 153 also loses mass at rate `(1 − 0.99877) × [153]` per tick from its own Medium decay (≈0.12 %).
- Active drive 153 loses further mass to the two water-consuming sweating reactions when water is present (variable rate — fast when water is high).
- Backup 136 loses mass at rate `(1 − 0.99777) × [136]` per tick from reaction 47 (≈0.22 %).
- Backup 136 is topped up at rate `0.21 × [153]` per tick by the duplicated refill.

Setting backup-inflow equal to backup-outflow, ignoring sweating:
```
  0.21 × [153] = 0.00223 × [136]
  [136] / [153] ≈ 94
```

So approximately **99 % of the loop's circulating mass sits in the backup** at rest, just like the carb, fat, and coldness pairs. When sweating is active the active-drive fraction drops further, so in practice a well-hydrated feverish Norn's ratio climbs to well over 99 % — a deeply-buffered heat load that takes minutes to fully discharge.

### What the active drive does that the backup cannot

Because chemical 136 has no receptor, every behavioural effect of hotness is mediated through chemical 153, and the stock genome places **three receptors** on it:

| Reader | Tissue / Locus | Threshold / Gain | Meaning |
|--------|----------------|------------------|---------|
| Drives receptor #6 | Creature / Drives (tissue 5) / locus 5 "Hotness" | threshold 0, gain 204, analogue, from Baby | The brain's **decision-lobe drive bar** — the value the Norn "feels" when choosing what to do. This is what the Creature Companion's drives display shows as the "Hotness" bar. The gain of 204 is identical to the Coldness drive receptor, keeping the two thermal drives symmetric from the decision lobe's perspective |
| Organ receptor #97 | Reaction organ / Somatic / locus 0 **`RLOCUS_CLOCKRATE`** | threshold 16, nominal 16, gain 192, analogue, from Baby | A **low-threshold clock-rate accelerator**: even mild hotness (> 16/255 ≈ 6 %) begins to increase the speed at which the reaction organ processes all of its chemistry. This is the biochemical implementation of the well-known physiological fact that a warm body has faster metabolism — every reaction the organ runs happens more frequently per tick |
| Organ receptor #77 | Reaction organ / Somatic / locus 0 **`RLOCUS_CLOCKRATE`** | threshold 80, nominal 128, gain 127, analogue, from Baby | A **high-threshold clock-rate accelerator**: on top of receptor 97, a second mechanism kicks in at around 80/255 ≈ 31 % that pushes the clock rate higher still toward the nominal value of 128. Because both receptors write to the same locus, their outputs compose additively. A severely feverish Norn's organ therefore runs at a substantially accelerated pace — consuming reactants faster, producing wastes faster, and burning through ATP faster |

The dual clock-rate receptors on RLOCUS_CLOCKRATE are the signature feature of the hotness drive, and they have **no analogue on the coldness side**. Coldness triggers a sensorimotor involuntary-sleep lockout (hibernation); hotness accelerates internal biochemistry (fever metabolism). This asymmetry is the biochemical heart of the game's thermal model: cold slows the creature down from the outside in (by forcing a sleep pose), heat speeds it up from the inside out (by running the chemistry faster).

The practical consequence is that a sustained fever has **cascading side-effects**: faster ATP consumption drains energy, faster urea/waste buildup poisons the bloodstream more quickly, and faster immune reactions accelerate the disease's resolution in either direction. A healthy feverish Norn burns through its illness quickly; a weakened feverish Norn can metabolic-collapse before the immune response completes.

Note that **no receptor fires on Hotness backup 136**, so the clock-rate accelerators are driven strictly by the active drive. Because the active drive is so heavily buffered, the digital-feeling threshold of receptor 77 is only crossed after sustained fever, not by transient spikes — which is exactly the intended behaviour: you do not want a Norn's metabolism to spasm into overdrive from a brief antigen flare.

### Effects of directly filling Hotness backup

A `CHEM 136 <n>` injection produces a characteristic *very-slow-burn fever* profile because of the asymmetric reaction speeds and the doubled refill:

1. **Tick 0:** `CHEM 136 <n>` is called. Backup rises to *n*, active drive unchanged.
2. **Ticks 1–311:** Reaction 47 drip-feeds the backup into active Hotness at 10-second half-life. The active drive rises smoothly.
3. **Ticks 1–6:** Simultaneously, reactions 60 and 70 at 6-tick half-life each aggressively pull that newly-active drive *back* into the backup. For the first few seconds, almost everything that leaves the reservoir via reaction 47 returns via the duplicated refill.
4. **Additional drains:** The active drive also decays on its own (Medium, 563-tick half-life), plus the two sweating reactions consume hotness with water whenever water is present, so mass leaks out of the loop both passively and by active thermoregulation.
5. **Slow discharge:** The backup slowly shrinks over the following minutes. The creature experiences a long, quiet period of elevated hotness rather than a sharp spike, driving the clock-rate receptors into gentle long-duration acceleration.

This makes `CHEM 136 <n>` the canonical way for a script to simulate a **sustained low-grade fever** — e.g. after a prolonged infection, for a "convalescent glow" ailment effect, or for testing the clock-rate receptors' threshold behaviour over long timescales. Injecting the active drive directly with `CHEM 153 <n>` instead produces a sharp but short-lived spike that mostly bypasses the clock-rate acceleration (because it is cleared in seconds by the doubled refill and, if water is present, by sweating).

### Interaction with the Coldness pair and the annihilation reaction

Reaction 23 (`Hotness + Coldness → nothing`, Instant decay) means that **injecting into Hotness backup cannot build up hotness if the Norn simultaneously has active coldness** — the active drives cancel each other out the instant either rises. If a creature is in a cold room (high Coldness) and also receives `CHEM 136 <n>`:

1. Reaction 47 slowly releases backup into active Hotness.
2. As soon as active Hotness is non-zero, reaction 23 instantly annihilates it against whatever Coldness is present.
3. Neither drive bar moves — all the injected backup mass is dissipated harmlessly.

To *truly* warm a cold Norn with a CAOS script you must first drain its Coldness and Coldness backup (`CHEM 152 -255`, `CHEM 135 -255`) and then inject into Hotness or Hotness backup. Otherwise the instant-decay cancellation consumes the injection.

Conversely, if a Norn is feverish and the player wants to cool it down, the cleanest approach is to inject Coldness (or Coldness backup), which will burn away Hotness via reaction 23 before registering on the Coldness drive — effectively draining the hotness reservoir "by opposition" rather than by direct subtraction. Alternatively, simply raising the creature's water reserves (by feeding it a drink) will let the sweating reactions 26 and 31 consume both the active hotness and the continuous drip-feed coming out of the backup, which is gentler and more physiologically plausible.

### Contrast with the Coldness backup

While structurally almost identical, the hotness and coldness pairs differ on several points:

| Feature | Coldness pair (135 / 152) | Hotness pair (136 / 153) |
|--------|---------------------------|--------------------------|
| Active drive half-life | "Medium" (621 ticks) | "Medium" (**563** ticks — slightly faster) |
| Environmental emitter | **Yes** — Circulatory locus 1 via Pistle (reaction 29) | **None** — no ambient-thermal producer in stock |
| Primary pathological source | Antigens 2 and 3 | **Fever toxin** + Antigens 4 and 6 |
| Water-consuming consumption | None | **Two** reactions (26, 31) that sweat out hotness with water |
| Drives-tissue receptor | `locus 4 "Coldness"` gain 204 | `locus 5 "Hotness"` gain 204 (symmetric) |
| Non-drive receptors on active partner | Sensorimotor `LOC_INVOLUNTARY4 (Sleep)` threshold 128 digital — **hibernation alarm** | Two Somatic `RLOCUS_CLOCKRATE` receptors (thresholds 16 and 80) — **fever metabolism accelerator** |
| Secondary metabolic coupling | Glycotoxin + Glycogen → 4× Coldness (exertion chill) | None analogous |
| Cross-annihilation | Reaction 23 vs. Hotness | Reaction 23 vs. Coldness |

The two pairs are symmetric at the decision-lobe level (both use gain-204 drive receptors on the same tissue) but deeply asymmetric at the organ level: cold *slows the creature from outside* via involuntary sleep, whereas heat *accelerates the creature from inside* via clock-rate receptors. This asymmetry is the biochemical engine behind the different observable behaviours — cold Norns nap, hot Norns sweat and over-metabolise.

### Implications for modders

Common modifications built on top of chemical 136:

1. **Add an environmental Hotness emitter.** The most common stock-genome "fix" — add a Circulatory-tissue emitter analogous to the Pistle-for-cold emitter (e.g. on Circulatory locus 2) and a matching `Water + HotPistle → 3× Hotness + HotPistle` reaction, so that a hot CA actually raises hotness rather than merely suppressing coldness.
2. **Add a "fever-memory" receptor on a custom lobe.** Because 136 changes on a minute-scale timescale while 153 bounces on a second-scale timescale, a lobe reading the backup gives the brain access to *chronic* illness history rather than *acute* events. A "remembers which foods made it ill" Norn mod typically adds such a receptor feeding a directional-avoidance neuron.
3. **Remove either gene 32 or gene 66.** Deleting one of the duplicate refill reactions brings the hotness pair in line with the protein pair (single-pull, ~49:1 ratio, ~11 %/tick refill). This makes hotness more reactive to brief fevers — useful for mods that want visible fever spikes from transient immune events.
4. **Add a `Pain → Hotness backup` reaction**, mirroring gene 20's pain spillover into the protein backup. This wires injury into long-term thermal load, giving hurt creatures a tendency to feel feverish. Sensible for "trauma-induced inflammation" mods.
5. **Change reaction 47's rate byte** (from 58/Medium to a higher value like 128/Short) to make the reservoir release its contents faster — a Norn that "metabolises" fever more quickly, with shorter and less pronounced post-infection windows.
6. **Gate reactions 26 and 31 on a body-temperature threshold** by catalysing them with a custom "sweating enzyme" — makes the sweating response voluntary-feeling rather than automatic, so the Norn must have a working neural signal to actually begin cooling down.
7. **Add a Coldness-backup → Hotness-backup reaction** to model overshoot thermoregulation (a Norn that over-cooled in a cold room accumulates slow-release heat as their body over-corrects).
8. **Raise the initial concentration** by adding a 136 entry to the initialConcentrations block so newly-hatched Norns already carry a small thermal reservoir — useful for "hot-world" scenario eggs.
9. **Lower the low-end clock-rate receptor threshold** (receptor 97) from 16 to 0 to make any trace of hotness accelerate the metabolism, modelling a hypersensitive-fever phenotype.

Because the chemical has no receptor and the active drive already has multiple writers, these modifications are generally safe and isolated from other body systems.

### Practical consequences for gameplay

- **`CHEM 136 <n>` simulates a sustained, long-duration fever.** Unlike `CHEM 153 <n>` (which spikes the Drives bar but is immediately absorbed back into the reservoir in ~0.1 s by the doubled refill, annihilated against any active Coldness, and sweated out with water), injecting into the backup produces a drawn-out fever that takes minutes to fully drain and drives the clock-rate receptors into sustained acceleration.
- **Hotness and Coldness cannot coexist.** Any script that tries to push both simultaneously will see only the net-dominant drive survive, because reaction 23 is Instant. To model a "dimensional mismatch" or "confused thermostat" you must disable reaction 23 first.
- **A well-hydrated Norn cannot sustain a fever easily.** Reactions 26 and 31 aggressively burn water + hotness together, so keeping a feverish Norn hydrated (by feeding it drinks) genuinely reduces its hotness reservoir over time. This is the intended biochemical cure for fever.
- **A hot environment alone will not make a stock Norn feverish.** Because there is no environmental emitter to Hotness, warm CAs only reduce coldness — they do not produce heat. Players who want a "desert hazard" zone must either drop fever toxin into the area or add the modded environmental emitter.
- **Antigens 4 and 6 cause fever; Antigens 2 and 3 cause chill.** A Norn catching Antigen 4 or 6 will run a clear, metabolism-accelerating fever. A Norn catching Antigen 2 or 3 will run a chill and may eventually hibernate if the infection is severe.
- **Fever metabolism accelerates itself.** The two clock-rate receptors increase the speed of the reaction organ, which includes the speed of reactions 26, 31, 47, 60, 70, and all other organ chemistry — including the hotness-producing reactions themselves. A severe fever is therefore partly self-stabilising (faster sweating, faster backup-refill) and partly self-accelerating (faster fever-toxin metabolism, faster immune response). This positive/negative feedback interplay is responsible for the characteristic "crisis" pattern of stock Docking Station illnesses.
- **Pain events do *not* raise the hotness reservoir.** Unlike the protein pair, the hotness backup is wholly insulated from injury. A Norn that has been hurt for hours will not develop a fever as a side-effect of its pain history.
- **Newly-hatched Norns start with zero hotness and zero backup.** Combined with the 0 initial concentration of the active drive, babies are never born feverish — they only become hot through pathology (fever toxin, antigens 4/6) or direct CAOS injection.

### Summary

```
 Stock-genome wiring of Hotness backup [136]
 ─────────────────────────────────────────────────────
 Inputs:
    Hotness [153] ─ reaction 60 (gene 32) ───────────▶ [136]
                     half-life 6 ticks ("Very short")

    Hotness [153] ─ reaction 70 (gene 66) ───────────▶ [136]
                     half-life 6 ticks ("Very short")
                     (DUPLICATE — gives doubled refill rate)

    CHEM 136 <n>  (CAOS / scripts / mods)  ──────────▶ [136]

    (No pain spillover; no emitter writes to 136 or 153 directly)

 Reservoir:
         Hotness backup [136]
         half-life ≈ 9·10¹⁰ ticks (essentially permanent)
                        │
                        │ reaction 47 (gene 12):  1× [136] → 1× [153]
                        │ half-life 311 ticks (~10 s), "Medium"
                        │ spontaneous, no catalyst
                        ▼
 Active drive:
         Hotness [153]
         half-life 563 ticks ("Medium") — decays naturally on its own
         initial concentration: 0
                        │
                        ├─► Drives tissue locus 5 (gain 204) ─────▶ decision-lobe "hotness" bar
                        ├─► Organ Somatic RLOCUS_CLOCKRATE receptor 97
                        │      (thresh 16, gain 192, analogue, Baby+) ▶ low-end fever metabolism boost
                        ├─► Organ Somatic RLOCUS_CLOCKRATE receptor 77
                        │      (thresh 80, gain 127, analogue, Baby+) ▶ high-end fever metabolism boost
                        ├─◀ reaction 80: Fever toxin + Water → 8× Hotness (pathology)
                        ├─◀ reaction 95: 2× Antigen 4 → ... + 1× Hotness (immune)
                        ├─◀ reaction 98: Antigen 6 → ... + 1× Hotness (immune)
                        ├─► reaction 26: Water + 4× Hotness → nothing (sweating, Short)
                        ├─► reaction 31: 2× Water + 4× Hotness → nothing (sweating, Medium)
                        ├─► reaction 23: Hotness + Coldness → nothing (Instant — mutual annihilation)
                        │
                        └─► reactions 60 & 70 back into [136]  (doubled fast self-refill)
```

Hotness backup is therefore the **mirror of Coldness backup**, sharing the same duplicated self-refill architecture and the same ~99 % reservoir mass ratio, but wired to an active drive with a fundamentally different biological meaning. Where Coldness represents the creature's ambient-thermal sensation and can put it to sleep, Hotness represents its internal pathology and accelerates its metabolism. Among the sixteen backup chemicals in the 131–146 block, chemical 136 is the one most closely paired with another (135, its thermal opposite), and together they form the body's two-compartment thermal system with mutual-annihilation coupling — the only such antagonistic pair in the entire drive-backup block.
