# 152 - Coldness

Coldness is the **acute, brain-visible half** of the cold drive pair in Creatures 3. It is the fifth of the sixteen "drive" chemicals in the 148–161 block (the bank of signals the decision lobe reads every tick) and is paired one-to-one with its reservoir partner, **Coldness backup (135)**. Despite sharing the drive-pair architecture with the hunger drives, Coldness is functionally different: it is not a simple internal appetite signal but a **multi-purpose cold-discomfort chemical** that represents any of three separate biological realities — *environmental chill* (via the sensorimotor `LOC_COLDNESS` locus that the infrastructure exposes), *immune-system chills* (produced as a side-effect of fighting certain antigens), and *metabolic cold* (produced by the Glycotoxin → Glucose reaction and the Pistle hormone). It is the value the Creature Companion's "Coldness" bar displays, it drives the decision-lobe's cold-seeking/cold-avoiding vote, and it triggers a **digital sensorimotor involuntary-action receptor** that causes cold-related reflex animations (shivering) once the chemical crosses the 128/255 threshold.

Unlike the macronutrient hungers (149, 150, 151), Coldness in the stock Norn genome is **not driven by a constant sensorimotor emitter**. There is no metabolic clock ticking cold-units into the bloodstream every frame. Instead, Coldness accumulates only when something *happens* to the creature — an infection, a chilling reaction, or a direct `CHEM 152 <n>` call from a script (for example, from a room whose CAOS code pushes cold chemicals into nearby creatures, or from an ice-cube agent's eaten event). This makes chemical 152 behaviourally quiet in a healthy, warm Norn and sharply responsive to thermal and immune stressors.

Coldness is tightly coupled to its opposite, **Hotness (153)**, by a dedicated **instant-decay annihilation reaction** (reaction 23, gene 49): any mole of Coldness meeting any mole of Hotness cancels both immediately. The creature's net "thermal sensation" is therefore whichever of the two chemicals is in surplus at any moment — adding hot chemicals to a cold Norn neutralises its chill before contributing any heat of its own.

Coldness has a **"Medium"** half-life (621 ticks ≈ 20 s at 30 Hz, genome byte 65, decay rate 0.99888) — a noticeable difference from every other drive in the 148–161 block. The hunger and emotion drives all carry "Very long" half-lives (effectively permanent until actively consumed). Coldness, by contrast, **naturally decays** on a ~20 s time-scale, which means a chilled Norn recovers on its own after being warmed, without needing any consumption script to explicitly zero the chemical. The reservoir behind it (**Coldness backup [135]**) retains the "Very long" half-life and continues to drip-feed the active drive until it too is cleared. Coldness does **not** have an initial concentration gene, so every Norn hatches with chemical 152 at **zero** — baby Norns are, by default, perfectly neutral on cold.

Distinguishing features versus the hunger and other classical drives:

- **No constant sensorimotor emitter.** The metabolic-clock pattern used for hungers (`LOC_CONST` + rate-30 emitter) is absent. Cold does not rise on its own in a healthy creature; it must be *caused* by something.
- **Natural decay.** The drive chemical itself decays with a 621-tick half-life, unlike the conserved-until-consumed hunger drives. A cold Norn that is placed in a neutral environment will warm back up chemically even if no script fires.
- **Direct chemical antagonism with Hotness.** Reaction 23 (`Hotness + Coldness → nothing`, instant decay) produces a thermostat-like zero-sum between the two chemicals that no hunger drive has an equivalent of.
- **Digital involuntary-action receptor.** The sensorimotor `LOC_INVOLUNTARY4` receptor (gene 95, receptor id 72) fires at threshold 128 with gain 255, causing the creature to run **SCRIPTINVOLUNTARY4 (script 68)** — the "cold reflex" (shiver / hug-self / teeth-chatter) animation. No hunger drive has an equivalent involuntary-action trigger.
- **No Youth-gated critical-hunger alarm.** Unlike the three macronutrient hungers, Coldness does not feed a circulatory critical-alarm receptor. Its only two receptors — Drives locus 4 and Sensorimotor `LOC_INVOLUNTARY4` — are both active from Baby.
- **Three independent production paths.** Immune chills (reactions 94 and 96 from Antigens 2 and 3), metabolic cold (reaction 89 from Glycotoxin), and the Pistle-catalysed conversion (reaction 29 from Water + Pistle) all inject Coldness for different physiological reasons. The chemical is therefore a *symptom* aggregated from several sub-systems, not a single drive.
- **Doubled drive-to-backup siphon.** Matching the carb- and fat-hunger pairs, two identical reactions (59 and 69, genes 23 and 65) drain Coldness into its backup at half-life 6 ticks, running in parallel for a combined ~20.8 %/tick loss.

## Sources

Coldness has **no constant emitter** in the stock Norn genome. All endogenous inflows are reaction-driven, and they trigger only when their upstream reactants are present. This makes Coldness a sparse, event-driven signal rather than a continuous one.

| # | Mechanism | Gene / Source | Organ / Tissue | Locus / Trigger | Rate |
|---|-----------|---------------|----------------|-----------------|------|
| 1 | Pistle-catalysed conversion | Gene 54 (reaction id 29) | Organ #2 "Reaction" | `1× Water [33] + 1× Pistle [113] → 3× Coldness [152] + 1× Pistle [113]` | Half-life **116 ticks** (~4 s), "Medium". The hormone **Pistle** acts as a catalyst (it is consumed as reactant and regenerated as product) that turns bodily water into Coldness. Pistle is the "cold hormone" — whenever it appears in the bloodstream, Coldness follows |
| 2 | Immune response to Antigen 2 | Gene 89 (reaction id 94) | Organ #2 "Reaction" | `16× Antigen 2 [84] → 12× Antibody 2 [104] + 2× Coldness [152]` | Half-life **64 ticks** (~2 s), "Short". Fighting this antigen produces chills as a side-effect |
| 3 | Immune response to Antigen 3 | Gene 90 (reaction id 96) | Organ #2 "Reaction" | `1× Antigen 3 [85] → 1× Antibody 3 [105] + 2× Coldness [152]` | Half-life **64 ticks** (~2 s), "Short". The second infection-chill reaction |
| 4 | Glycotoxin → Glucose side-chill | Gene 79 (reaction id 89) | Organ #2 "Reaction" | `1× Glycotoxin [70] + 1× Glycogen [4] → 4× Glucose [3] + 4× Coldness [152]` | Half-life **24 ticks** (~0.8 s), "Short". The toxin forces the liver to dump stored glycogen; the metabolic shock appears as Coldness |
| 5 | Backup → drive release | Gene 11 (reaction id 46) | Organ #2 "Reaction" | `1× Coldness backup [135] → 1× Coldness [152]` | Half-life **311 ticks** (~10 s), "Medium". Once the reservoir at 135 has accumulated mass (via the drain reactions 59 & 69), it drip-feeds Coldness back into the active drive |
| 6 | External CAOS injection | — | Any | `CHEM 152 <n>` from room scripts, agent scripts, or the debug console | One-shot. Room ambient-temperature code, ice-cube food agents, cold-wind events, etc., commonly push Coldness into creatures within range |
| 7 | Infrastructure for air-temperature sensing | Engine wiring | Sensorimotor `LOC_COLDNESS` (tissue 4, locus 2) | Exposes "how far air temp is below blood temperature" as a sensorimotor value. **No stock emitter reads this locus**, but the engine populates it based on room/world temperature so mods or other species can route it to chemical 152 | Mod-defined |
| 8 | No initial concentration at birth | — | — | Gene 15 has no entry for chemical 152. Every Norn hatches with Coldness at **0 / 255** | — |

## Usage

Coldness has four distinct consumers: two receptors that read the chemical (one in the Drives lobe, one in the Sensorimotor for involuntary action), two duplicate reactions that siphon it to the reservoir, and the instant-decay annihilation with Hotness.

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | **Decision-lobe drive bar** | Gene 4 (receptor id 5) | Organ #1 "Creature" → Drives (tissue 5) → locus 4 "Coldness" | Analogue, threshold **0**, nominal 0, **gain 204**. Active from Baby | The value the decision lobe consults when voting for cold-related actions (seek warmth, avoid cold area, hug). With gain 204/255, the full active drive maps to ≈ 80 % excitation on the drive neuron. **This is the signal shown on the Creature Companion's "Coldness" bar** |
| 2 | **Involuntary cold-reflex action** | Gene 95 (receptor id 72) | Organ #1 "Creature" → Sensorimotor (tissue 4) → locus 4 (`LOC_E_INVOLUNTARY4`) | **DIGITAL (all-or-nothing)**, threshold **128**, gain **255**. Active from Baby | Once active Coldness exceeds 128/255 (50 %), the receptor fires a full-strength write to the involuntary-action-4 trigger locus, causing the creature to execute **SCRIPTINVOLUNTARY4 (script 68)** — the shivering / teeth-chattering / hug-self reflex animation. This is reflex, not voluntary behaviour: it happens *to* the creature and is not part of the decision-lobe vote |
| 3 | **Instant annihilation with Hotness** | Gene 49 (reaction id 23) | Organ #2 "Reaction" | `1× Hotness [153] + 1× Coldness [152] → (nothing)` | **Instant decay** (half-life 0 ticks). Whenever both Coldness and Hotness are present in the bloodstream, equal amounts cancel each tick until one is exhausted. This is the fundamental thermostat mechanism — warming a cold Norn, or cooling a hot one, neutralises the opposing chemical rather than stacking |
| 4 | Active → backup siphon (primary) | Gene 23 (reaction id 59) | Organ #2 "Reaction" | `1× Coldness [152] → 1× Coldness backup [135]` | Half-life **6 ticks** (~0.2 s), "Very short". Aggressively drains Coldness into its reservoir for later slow release |
| 5 | Active → backup siphon (duplicate) | Gene 65 (reaction id 69) | Organ #2 "Reaction" | `1× Coldness [152] → 1× Coldness backup [135]` (identical formula and rate) | Half-life **6 ticks**. Exact duplicate of gene 23. Runs in parallel each tick, doubling the drain — combined per-tick loss `1 − 0.88978² ≈ 0.2083` |
| 6 | Natural decay | — | Half-life table | Genome byte 65 → half-life **621 ticks** (~20 s), "Medium", decay rate 0.99888 | Unlike hunger drives, Coldness decays spontaneously. A cold Norn returning to a neutral environment will lose Coldness at ~0.11 %/tick on top of the siphon, without any script or reaction firing |
| 7 | Room / world-script consumption | — | CAOS room scripts and agent scripts | `CHEM 152 <negative n>` injected by warming agents (heaters, fires, hot food, warm rooms' exit scripts) | The canonical way ambient warmth reduces Coldness. Agents designed around heat normally drop chemical 152 directly rather than relying on Hotness annihilation |

## Role in Game Mechanics

### The drive/backup architecture, from the cold side

```
         (NO constant sensorimotor emitter — Coldness is event-driven)
                                  │
                                  ▼
           ┌──────── reactions 94, 96 (Antigen 2/3 immune response) ──── Coldness [152]
           │                                                                ▲
           │   ┌── reaction 89 (Glycotoxin → Glucose + 4× Coldness) ───────┤
           │   │                                                            │
           │   │   ┌── reaction 29 (Water + Pistle → 3× Coldness) ─────────┤
           │   │   │                                                        │
           │   │   │   ┌── reaction 46 (backup → drive, ~10 s half-life) ──┤
           │   │   │   │                                                    │
           │   │   │   │   ┌── CHEM 152 <n> from room/agent scripts ───────┤
           │   │   │   │   │
           │   │   │   │   │                                                │
           │   │   │   │   │   ┌── reactions 59 & 68 (drain to backup) ◀───┤
           │   │   │   │   │   │   (half-life 6 ticks each, parallel)     │
           │   │   │   │   │   │                                           │
           │   │   │   │   │   │   ┌── natural decay (Medium, ~20 s) ◀───┤
           │   │   │   │   │   │   │                                      │
           │   │   │   │   │   │   │   ┌── reaction 23 (Coldness + Hotness → 0, instant)
           │   │   │   │   │   │   │   │                                   │
           ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼                                  │
         [135 Coldness backup — Very long, ~permanent]                     │
                                                                           │
                                                                           ├──▶ Drives tissue locus 4 receptor (gain 204, Baby+) ▶ decision-lobe drive bar
                                                                           └──▶ Sensorimotor LOC_E_INVOLUNTARY4 receptor (thresh 128, digital, Baby+) ▶ SCRIPTINVOLUNTARY4 (shiver)
```

The architecture has three features that set Coldness apart from the hunger drives. First, the chemical is **event-driven, not clocked**: in a warm, healthy, well-fed Norn there is no source at all, and the chemical stays near zero for the entire life of the creature. Second, the drive has a **natural half-life of ~20 s**, meaning the signal decays on its own once its sources stop firing. Third, the chemical is wired to a **digital involuntary-action receptor** rather than a critical-hunger alarm — crossing the 128 threshold triggers a reflex animation, not a behavioural emergency state.

### The two faces of Coldness: drive and reflex

The decision-lobe Drives receptor (tissue 5, locus 4, gain 204, analogue) makes Coldness a **behavioural drive**: the Norn votes for warm-seeking actions in proportion to the chemical's level. At low Coldness the drive neuron is quiet; at maximum it fires at ~80 % excitation, comparable to — but slightly weaker than — the middle macronutrient drives. The creature's action-selection algorithm therefore interprets Coldness as one of its sixteen voting urges, weighed against hunger, fear, loneliness, and the rest.

The sensorimotor `LOC_E_INVOLUNTARY4` receptor (tissue 4, locus 4, threshold 128, digital, gain 255) is a **reflex**, not a vote. When Coldness exceeds 50 % of full range, this receptor writes 255 into the involuntary-action-4 trigger, causing the creature to immediately run **SCRIPTINVOLUNTARY4 (script 68)** — the shivering / hugging / teeth-chattering animation from the creature's script set. This is outside the decision lobe's purview: the creature shivers whether or not its current voluntary action is a cold-related one, and whether or not the drive neuron happens to be the winning vote this tick.

Because the involuntary-action receptor is digital, there is no gradation: below 128 it is silent; at or above 128 it is fully firing. Small fluctuations around the threshold can produce stuttering shiver animations as the creature crosses and re-crosses the boundary, which is why Coldness's natural ~20 s decay is a meaningful feature — it makes the threshold crossing a one-way event most of the time.

### The Coldness–Hotness thermostat

The instant annihilation `Hotness + Coldness → (nothing)` (reaction 23, gene 49, half-life 0) gives the creature a true zero-sum thermal sensation. Any tick where both chemicals are present, the smaller of the two is wiped out completely, and the difference is what the creature "feels".

Practically, this means:

- **Warming a cold Norn with Hotness injections** (via a fire, heater, or hot food that calls `CHEM 153 +n`) first neutralises Coldness before producing any heat excess. If the Norn's Coldness is 80 and Hotness 0, applying `CHEM 153 +60` yields Coldness 20, Hotness 0 — the creature has gone from quite cold to only slightly cold, not from cold to warm.
- **Pushing too much heat** makes the creature hot. `CHEM 153 +120` on the same Norn gives Hotness 40 surplus after annihilation — the creature flips from cold to hot in one injection.
- **Pistle and Fever toxin are direct antagonists.** Pistle catalyses water → Coldness (reaction 29, ~4 s half-life); Fever toxin catalyses water → Hotness (reaction 68, gene 52). If both are present, the water is turned into Coldness and Hotness in parallel, which then annihilate each other — the net biochemical effect depends on which hormone wins.

This reaction is the reason Creatures 3 does not need separate "cooling" chemicals for each heat source or "warming" chemicals for each cold source: heat and cold live on a single signed axis, and any agent can shift the creature along it by pushing either chemical.

### Sources of cold in practice

In a playing game, Coldness rises in a Norn for one of four reasons:

1. **Environmental CAOS.** Rooms, weather events, or specific agents (ice cubes, frost, the observatory wing of the Norn Terrarium) call `CHEM 152 +n` on nearby creatures. This is the most common source in normal play, and is how the world tells the creature's brain "you are in a cold place".
2. **Infection.** Bacteria or injected antigens 2 or 3 trigger immune reactions 94 and 96, which dump 2 units of Coldness per reaction event. A sick creature therefore develops chills proportional to its antigen load, which the player sees as shivering animations and a rising Coldness bar. Antibodies eventually win the reaction race and the chills subside.
3. **Glycotoxin poisoning.** Reaction 89 (`Glycotoxin + Glycogen → 4× Glucose + 4× Coldness`) is a rapid "cold spike" that occurs when the creature is poisoned with Glycotoxin — a toxin that forces glycogen breakdown and produces Coldness as a metabolic side-effect. This is felt as a sudden intense chill and is an important diagnostic marker for Glycotoxin presence.
4. **Pistle hormone surges.** If Pistle appears in the bloodstream (from a reaction upstream or injected by a script), reaction 29 immediately starts turning the creature's water into Coldness at a ~4 s half-life. Pistle is essentially the "cold hormone" of the Norn genome.

All four routes feed the same chemical and produce the same behavioural and reflex effects. The creature does not (and cannot) distinguish between "I am in a cold room", "I have an infection", and "I was poisoned with Glycotoxin" — all three read as Coldness at the decision lobe and all three trigger shivering at the sensorimotor reflex.

### Natural decay and why it matters

The 621-tick (~20 s) half-life is unique among the drive chemicals. Every other 148–161 drive is "Very long" (effectively permanent). For Coldness, this shorter half-life means:

- **Spontaneous recovery.** A Norn that walks out of a cold room loses Coldness at ~0.11 %/tick even if the room has no warming script. Over ~20 s, active Coldness halves naturally; after a minute it is at ~12 %, below the shiver threshold.
- **Transient chills.** A single immune reaction or short Pistle surge produces a rise-and-fall curve rather than a persistent cold state. The creature shivers for a while, then stops automatically.
- **Reservoir decoupling.** The backup at chemical 135 retains the "Very long" half-life, so the reservoir preserves "cold memory" even after the active drive has decayed. Reaction 46 then slowly refills the active drive from backup over ~10 s half-life, producing a drawn-out tail of low-level cold discomfort after the initial spike.

The combination produces a characteristic "bounce-decay-long-tail" shape that matches intuitive experience: shock of cold → visible shivering → quick recovery of the visible symptom → lingering low-grade chill for several minutes afterwards.

### Interaction with the backup reservoir (135)

The doubled-siphon architecture (reactions 59 and 69, both half-life 6) funnels active Coldness into the reservoir at roughly 20.8 % per tick. At the same time, reaction 46 (half-life 311) drips it back out at roughly 0.22 % of the reservoir per tick. In steady state with no external input:

- Once Coldness has been driven up by an event, almost all of the injected mass migrates to 135 within a second or two (doubled siphon + natural decay).
- The reservoir then holds this mass for minutes (Very long half-life) and drips it back via reaction 46.
- The back-and-forth between active drive (siphoned out quickly, topped up slowly by reservoir, decaying naturally) produces a low plateau of Coldness after the event.

This is why `CHEM 152 -255` alone does **not** fully reset a cold-history Norn: the reservoir at 135 will refill 152 within minutes. To fully erase a cold event, both chemicals must be zeroed:

```caos
CHEM 152 -255
CHEM 135 -255
```

### Infrastructure the stock genome does not use

The engine populates the sensorimotor `LOC_COLDNESS` locus (tissue 4, locus 2) with the creature's perceived air temperature relative to its blood temperature — a ready-made "how cold am I?" signal built into the simulation. In the stock Norn genome, **no emitter is wired to this locus**, meaning temperature-based cold is not automatically converted into Coldness; it must be supplied by external CAOS scripts.

This gap is intentional from a design perspective: it allows each species (Norn, Grendel, Ettin) or each breed to have its own temperature curve, and it allows rooms and agents to be the authoritative source of thermal effects rather than creating conflicts with a built-in thermal emitter. Many community mods close this gap by adding an emitter at sensorimotor locus 2 — typically with a threshold around 64–128 and a rate of 10–20 — that writes chemical 152 when the creature is in an environment colder than its blood temperature. The result is a Norn that genuinely feels cold in cold rooms without room scripts having to manually push chemicals.

### Why no positive-feedback loop on metabolic cold

Unlike protein hunger, which has a circulatory positive-feedback emitter that accelerates its rise during metabolic stress, Coldness has no feedback loop. The chemical is driven only by its five event sources (Pistle, antigens 2 & 3, Glycotoxin, backup, external CHEM). A chilled Norn does not enter a "cold panic" that amplifies the cold signal further; it sits at its current Coldness level until the underlying source stops.

This makes Coldness behaviourally calm: the drive bar rises predictably when the creature is exposed to a source and falls predictably when the source is removed. There is no runaway "hypothermia spiral" in the chemistry; only the reflex shiver (via the digital 128 threshold) and the decision-lobe vote (via gain 204) respond to the chemical.

### Effects of `CHEM 152 <n>`

Direct injection produces a characteristic response:

1. **Tick 0:** `CHEM 152 +n` called. Active Coldness rises by *n*; backup unchanged.
2. **Ticks 1–3:** Reactions 59 and 69 in parallel pull mass aggressively into 135 (~20 % per tick). Within ~3 ticks, roughly half of the injected mass has migrated to the reservoir.
3. **Ticks 3–60:** Natural decay (~0.11 %/tick) and continuing siphon together pull active Coldness down. The Drives drive-bar visibly falls.
4. **Simultaneously:** If the injected amount pushed active Coldness above 128, the shiver reflex fired at least once (possibly more times if the chemical bounces around the threshold as it decays).
5. **Long tail:** Reservoir drip-feeds active Coldness back for minutes, producing a low-level residual cold discomfort. The Drives vote keeps a small weight on cold-seeking behaviour for some time after the visible spike has subsided.

Negative injections (`CHEM 152 -n`) are the canonical warming operation. They are used by heaters, fires, hot food, warm rooms, blankets, and similar items. Many agents prefer negative `CHEM 152` to positive `CHEM 153` because it directly reduces the cold signal without risking pushing the creature into hot-discomfort territory via the annihilation reaction.

### Relationship to sickness and diagnostics

Because three of the four endogenous production paths are sickness-related (immune reactions 94 & 96, Glycotoxin reaction 89, Pistle reaction 29), a cold Norn in a warm environment is usually a **sick Norn**. Players using the Science Kit to diagnose a shivering creature should therefore check:

- **Antigen 2 & 3 levels.** High values indicate immune-chill and the shivering should subside as antibodies win the reaction.
- **Glycotoxin levels.** A spike indicates poisoning; administering `CHEM 70 -255` (clear Glycotoxin) stops the cold-side effect.
- **Pistle levels.** A persistent chill with no other obvious cause often points to a Pistle accumulation. Clearing Pistle stops the Water → Coldness conversion.
- **Reservoir 135.** If active Coldness keeps returning after repeated `CHEM 152 -255` calls, the reservoir is still full and needs to be cleared too.

In the stock genome, Coldness is thus *both* a drive chemical *and* a sickness diagnostic — a dual role no other drive shares.

### Comparison to other Hunger / discomfort drives

| Drive (id) | Backup (id) | Constant emitter? | Natural half-life | Positive metabolic feedback? | Cross-coupling inflows | Drain reactions | Drives gain | Digital reflex receptor? |
|------------|-------------|-------------------|-------------------|------------------------------|------------------------|-----------------|-------------|--------------------------|
| Pain (148) | 131 | No | Very long | No | Various pain sources | 1 | varies | — |
| Hunger for protein (149) | 132 | Yes (rate 30 × 2) | Very long | Yes (locus 8) | Pain → backup 132 | 1 | 209 | — |
| Hunger for carbohydrate (150) | 133 | Yes (rate 35 × 2) | Very long | No | None | 2 (doubled) | 255 | — |
| Hunger for fat (151) | 134 | Yes (rate 30 × 2) | Very long | No | None | 2 (doubled) | 205 | — |
| **Coldness (152)** | **135** | **No** | **Medium (~20 s)** | **No** | **Pistle, Glycotoxin, antigens 2 & 3** | **2 (doubled)** | **204** | **Yes — SCRIPTINVOLUNTARY4 at 128** |
| Hotness (153) | 136 | No | Medium (~19 s) | No | Fever toxin, antigens 4 & 6 | 2 (doubled) | 204 | — (in stock) |
| Tiredness (154) | 137 | Yes | Very long | No | None | 1 | varies | — |

Coldness and Hotness form a matched pair: same architecture, same gain, same reservoir style, same decaying half-life — mirror images on the cold and hot sides of the thermostat. The most visible asymmetry is that Coldness has an involuntary-action receptor (shiver) and Hotness does not, in the stock genome. The hot-side mirror would typically be a "pant" or "fan self" reflex, which some breeds and mods add at sensorimotor locus 5 (`LOC_E_INVOLUNTARY5`).

### Implications for modders

Common modifications built on top of chemical 152:

1. **Wire `LOC_COLDNESS` to chemical 152.** Add an emitter at sensorimotor tissue 4, locus 2, with threshold ~96 and rate ~15. Makes cold rooms automatically chill the creature without room-script intervention.
2. **Add a Hotness-reflex mirror.** Add a receptor at sensorimotor tissue 4, locus 5 (`LOC_E_INVOLUNTARY5`), reading chemical 153 with threshold 128 and digital gain, to produce a pant/fan reflex that mirrors the shiver.
3. **Steepen the shiver threshold.** Lower the 128 threshold to 80 for a more sensitive creature that shivers at lower Coldness levels. Useful for "chilly" breeds.
4. **Change the natural half-life.** Raising the decay rate from 0.99888 to something like 0.99 (half-life ~70 ticks, ~2.3 s) produces much faster recovery from cold — useful for warm-blooded breeds. Lowering it to ~0.9999 approximates the hunger drives' permanence.
5. **Add a Pain ↔ Coldness cross-coupling.** Mirrors the Pain → Hunger-for-protein-backup reaction with a Pain → Coldness backup link, producing chills after injury — a "shock response".
6. **Remove one of the duplicate drain reactions.** Halves the siphon and produces a more persistent active-drive cold sensation, at the cost of a smaller reservoir.

### Practical consequences for gameplay

- **A shivering Norn is either cold or sick.** Both routes look identical to the observer. The Science Kit is the only way to distinguish.
- **The shiver reflex is independent of the decision.** A Norn may be shivering (reflex) while simultaneously voting to eat (decision). The shivering animation does not lock the creature out of other actions.
- **Cold rooms affect nearby creatures via room-script `CHEM 152 +n` calls.** Rooms with a long residence produce sustained cold; passing through a cold room briefly barely registers.
- **Warming is best done via `CHEM 152 -n` directly.** Using Hotness (`CHEM 153 +n`) risks over-shooting and pushing the creature into hot-discomfort after the annihilation resolves. Direct-reducing Coldness is cleaner.
- **A Norn whose Coldness bar "fills up and stays there" probably has an untreated infection or Glycotoxin accumulation, not an environmental cold problem.** The environmental path typically produces transient peaks rather than sustained plateaus.
- **Baby Norns shiver exactly like older Norns.** Both receptors are Baby-accessible; there is no life-stage gate on the cold-reflex or cold-drive response. This matches intuition — babies are not less sensitive to cold than youths.
- **Pistle is a diagnosable "why is my Norn shivering?" cause.** If a player is puzzled by persistent chills in a healthy Norn in a warm room, Pistle accumulation is the usual culprit in modded genomes where a script has dumped the hormone into the creature.

### Summary

```
 Stock-genome wiring of Coldness [152]
 ─────────────────────────────────────────────
 Inputs:
    Reaction 29 (gene 54):  Water + Pistle → 3× Coldness + Pistle, half-life 116 (~4 s)
    Reaction 89 (gene 79):  Glycotoxin + Glycogen → 4× Glucose + 4× Coldness, half-life 24 (~0.8 s)
    Reaction 94 (gene 89):  16× Antigen 2 → 12× Antibody 2 + 2× Coldness, half-life 64 (~2 s)
    Reaction 96 (gene 90):  Antigen 3 → Antibody 3 + 2× Coldness, half-life 64 (~2 s)
    Reaction 46 (gene 11):  Coldness backup → Coldness, half-life 311 (~10 s, reservoir refill)
    CHEM 152 <n> from room/agent CAOS scripts (cold environment, ice, frost, cold wind, etc.)

 Sensory infrastructure:
    Sensorimotor locus 2 (LOC_COLDNESS) — engine-populated "air colder than blood" signal.
                                          No stock emitter reads it → stock genome does NOT
                                          automatically convert air chill into chemical 152.

 Active drive:
    Coldness [152]
    Natural half-life 621 ticks (~20 s), "Medium" — DECAYS unlike hunger drives
    No initial concentration at birth (0/255)
                    │
                    ├──▶ Drives tissue locus 4 receptor (gain 204, Baby+) ▶ decision-lobe drive bar (Creature Companion)
                    ├──▶ Sensorimotor LOC_E_INVOLUNTARY4 receptor (thresh 128, digital, Baby+) ▶ SCRIPTINVOLUNTARY4 (shiver reflex)
                    │
                    ├──▶ reaction 59 (gene 23) → Coldness backup [135]
                    ├──▶ reaction 69 (gene 65) → Coldness backup [135]  (duplicate; parallel drain, ~0.21/tick combined)
                    │    both half-life 6 ticks (~0.2 s), "Very short"
                    │
                    ├──▶ reaction 23 (gene 49) + Hotness → (nothing)  [instant-decay thermostat]
                    │
                    └──▶ CHEM 152 -n from warming-agent scripts (consumption)

 Absent compared to hunger drives:
    - No constant sensorimotor emitter (no metabolic clock)
    - No initial concentration at birth
    - No Youth-gated critical-hunger alarm

 Present compared to hunger drives:
    - Natural (Medium) decay half-life — recovers without script intervention
    - Instant annihilation reaction with Hotness [153] — zero-sum thermostat
    - Digital involuntary-action receptor triggering SCRIPTINVOLUNTARY4 (shiver reflex)
    - Three event-driven production paths (Pistle, antigens 2 & 3, Glycotoxin)
```

Coldness is the **event-driven, naturally-decaying thermostat-side drive chemical** of the Norn biochemistry. It aggregates cold discomfort from three separate physiological realities — infection, metabolic poisoning, and ambient chill — into one brain-visible signal that both drives warm-seeking behaviour and triggers the shivering reflex. Its doubled drain into the long-lived reservoir at chemical 135 gives it a short-term "bounce" profile (visible shivering fades quickly) with a long-term tail (residual low-grade cold discomfort lingers for minutes). Paired with its mirror chemical Hotness (153) through the instant-decay annihilation reaction, it implements a clean zero-sum thermal sensation that the rest of the genome and every thermal agent in Creatures 3 builds on.
