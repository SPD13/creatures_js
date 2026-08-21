# 204 - Reward

**Reward** is the genome's canonical positive-reinforcement chemical and the **second key** of the Creatures 3 / Docking Station learning system, partnered with **Punishment [205]** at the slot immediately after it. The chemical-names catalogue (`Rebuild/Assets/Catalogue/ChemicalNames.catalogue:282-283`) places the pair in the brain-chemistry band 198–214 — bracketed by `Brain chemical 1 [198]` (the disappointment chemical) and `Brain chemical 9 [206]` and onward — making it visually obvious that 204/205 are dedicated brain-bus signals rather than metabolic or physiological chemicals. Functionally, Reward is **not** a drive (it is not read by any Drives-tissue receptor), it is **not** a sense (no organ-locus emitter), and it is **not** a reaction product (no metabolic pathway converts another chemical into it). It is a **per-tract reinforcement read** consumed directly inside the brain by the dendrite weight-update routine, and its sole job is to tell that routine "the just-fired association was a good one — strengthen it".

The mechanism is hard-coded in the engine. Each genome tract gene carries an SVRule program containing the operands `setRewardChemicalIndex` (opcode 59), `setRewardThreshold` (opcode 57), and `setRewardRate` (opcode 58) that the tract evaluates when it initialises. These three parameters are stored in the tract's per-instance `myReward` `ReinforcementDetails` struct (JS `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:1-78`). On every brain tick, after the tract has computed which destination neurons "won" the local competition, it walks all dendrites whose destination is a winning neuron and calls `processRewardAndPunishment(d)` (JS `Tract.js:529-560`). That function reads `myPointerToChemicals[myReward.GetChemicalIndex()]` — the live bloodstream level of the chemical at whatever index the genome configured, **typically 204** — and if that level is above `myReward.threshold`, the dendrite's short-term weight (`WEIGHT_SHORTTERM_VAR`) is incremented by `rate × (level − threshold)` (JS `Tract.js:74-82`). The result is then clamped into `[-1, +1]` by `BoundIntoMinusOnePlusOne()`. This is the entire formal mechanism of "the creature learns from being patted": a chemical pulse arrives, the dendrites that just took part in the winning decision are nudged stronger, and the next time the same situation arises that decision is more likely to win.

The chemical's decay profile is the most aggressive of any non-trivial slot in the genome: genomeValue **4**, half-life **1 tick**, decay rate **0.62713226** per tick, speed class **"Very short"** (`biochemistry.json:9152-9159`). With a half-life of one biochemistry tick (0.033 s at 30 tps), a `CHEM 204 100` injection is at 62 after one tick, ~39 after two, ~25 after three, ~10 after five, and effectively zero by tick ten — under a third of a second. Reward is therefore a **single-tick spike**, not an accumulating reservoir. It is designed to coincide with exactly one brain update — the same tick on which the tract is processing dendrites for a winning decision — and to be gone before the next stimulus event arrives. This stops two consecutive stimuli from blurring their reinforcement: each pulse trains only the decision that is currently winning when *it* arrives, not the decision that won several ticks ago. The same decay applies to Punishment [205], which shares the genomeValue 4 / half-life 1 / "Very short" parameters byte-for-byte.

The most architecturally important fact about Reward, mirroring the pattern of the navigation drives ([199] Up, [200] Down, …), is that **the stock genome contains no biochemistry-side producer for it.** No emitter writes chemical 204, no reaction has chem 204 as a product, no neuroemitter pulses it, and it has no initial-concentration entry. Every Reward pulse a creature receives in stock C3 / DS arrives via one of three CAOS-driven paths: (a) genome stimulus genes (`G_STIMULUS`) with chemical 204 listed in their `chemicalsToAdjust[4]` array, fired by `STIM WRIT`/`STIM SHOU`/etc. when an agent script reports a positive event (eat fruit, pat by player, mate successfully, hear "yes"); (b) the `STIM_POINTERYES`/`STIM_POINTERPAT`-class linguistic events that wrap up a player approval gesture into a stimulus the genome can map onto a reward pulse; or (c) direct CAOS `CHEM 204` / `ALTR 204` writes from agent scripts. The receptor side — meaning the read inside `processRewardAndPunishment` — is **fully wired** the moment any tract runs its SVRule init program with `setRewardChemicalIndex(204)`; the producer side is left to the agent layer plus the genome's stimulus library.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **No biochemistry emitter in the stock genome** | — | — | The genome's emitter table (`biochemistry.json:7076`, 43 entries) does not list chemical 204 as a target. No physiological locus pulses Reward. The chemical has no organ-side birth path | — |
| 2 | **No reaction product in the stock genome** | — | — | The 101 reactions in the stock genome do not produce chemical 204. No metabolic, hormonal, immune, or toxin pathway converts another chemical into Reward. The chemical has no chemistry-side birth | — |
| 3 | **No neuroemitter in the stock genome** | — | — | The single stock neuroemitter (gene 1, lobe `move`/neuron 37) writes Adrenalin / Fear / Crowded — not Reward. **No brain neuron emits Reward from cognitive activity.** The brain cannot self-reward purely from a thought; the pulse must come from outside the brain (sensory/CAOS) | — |
| 4 | **No initial concentration** | — | — | Chemical 204 is absent from the genome's `initialConcentrations` table. A newly-hatched creature is born with **Reward = 0** and stays at 0 between explicit pulses | — |
| 5 | **Stimulus-gene chemical injection — the primary stock mechanism** | `G_STIMULUS` genes whose `chemicalsToAdjust[4]` array contains chemical 204 | Creature / bloodstream (systemic) | When an agent issues `STIM WRIT targ N M` (or `STIM SHOU`, `STIM SIGN`, `STIM TACT`), `SensoryFaculty.stimulate(stim N)` (JS `SensoryFaculty.js:processStimulus`) walks the stimulus's four chemical/adjustment pairs and calls `Biochemistry.adjustChemicalLevel(204, +Δ × strengthMultiplier)` for each pair whose chemical is 204. This is how `STIM_POINTERPAT`, `STIM_POINTERYES`, `STIM_EATEN_FRUIT`, `STIM_MATE`, `STIM_REACHED_PEAK_OF_SMELL*` and most of the other "success" stimuli deliver positive reinforcement — they each carry a chemical 204 entry with a positive amount in the genome's stimulus library | One-shot per stimulus event, magnitude per genome |
| 6 | **`STIM_POINTERYES` / `STIM_CREATUREYES` — language-driven reward** | Built-in stimuli 40 / 41, fired by the linguistic faculty's sentence-hearing routine when the player or another creature speaks "yes" while pointing at this creature | Creature / Linguistic → Sensory | The player saying "yes" stimulates the creature's sensory faculty with `STIM_POINTERYES`. The genome's stimulus #40 entry then fires its chemical payload — in the stock genome, this includes a chemical 204 (Reward) injection, identical to a pat for the brain-side training pipeline. This makes "yes" a verbal pat | One-shot per recognised "yes" sentence |
| 7 | **`STIM_POINTERPAT` / `STIM_CREATUREPAT` — touch-driven reward** | Built-in stimuli 1 / 2, fired by `creatureDoneTo.cos` after the player clicks the creature's head (`Creature::ClickAction` → ACTIVATE1 → script issues `stim writ targ 1 1`; `pat-slap-stimulus.md:62-105`) | Creature / Sensory | The pat pipeline is the canonical positive-feedback path. The genome's stimulus #1 fires a chemical 204 pulse plus a small drive-bar nudge. The `processRewardAndPunishment` read inside every tract that initialised with `chem 204` then sees a non-zero level on the next tick and trains the dendrites of every just-won decision | One-shot per pat, magnitude per genome |
| 8 | **Direct CAOS injection** | `CHEM 204 <amount>` from any agent script | Creature / bloodstream (systemic) | The CAOS `CHEM` command on a targeted creature writes a positive (or negative) delta into `myChemicalConcs[204]` via `Biochemistry.adjustChemicalLevel(204, amount)`. Modders use this to deliver custom reward events that don't go through the stimulus library — debug toys, special items, scripted teaching mini-games | One-shot per call |
| 9 | **`ALTR` chemical adjustment** | `ALTR 204 <amount>` | Creature / bloodstream | Functionally identical to `CHEM 204` for the purposes of the per-tract reinforcement read. `ALTR` clamps to the chemical's range | One-shot per call |
| 10 | **Modder-added emitter / reaction / neuroemitter** | Custom genes targeting chem 204 | Creature / various | Genetic engineers can add Reward producers — e.g. an emitter that writes chem 204 when blood-glucose rises (so eating reliably trains the brain), or a neuroemitter on the `decn` lobe that pulses Reward when a decision neuron fires strongly. None of these exist in the stock genome | Gene-dependent |

The single most important consequence of points 1–4 is that **stock C3 Reward chemistry is purely event-driven through the stimulus library plus CAOS**. No background metabolism, no slow accumulation, no chemistry-pathway-completion bonus — every pulse is the consequence of a discrete in-world event reported by an agent or by the linguistic system.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **Per-tract reward read — the sole stock consumer** | Tract genes with SVRule operand `setRewardChemicalIndex(204)` (opcode 59) plus `setRewardThreshold` (57) and `setRewardRate` (58) | Brain / every tract whose genome configured chem 204 as its reward | Inside `ProcessRewardAndPunishment(dendrite d)` (JS `Tract.js:529-560`): if the tract's `myReward.IsSupported()` is true and the dendrite's destination neuron has `OUTPUT_VAR > 0` (it is a winning neuron), the function reads `myPointerToChemicals[myReward.GetChemicalIndex()]` — i.e. the bloodstream level of chem 204 — and calls `myReward.ReinforceAVariable(level, dendrite.weights[WEIGHT_SHORTTERM_VAR])`. ReinforceAVariable computes `if (level > threshold) variableToReinforce = clamp(variable + rate × (level − threshold), -1, +1)`. The dendrite's short-term weight is then propagated to long-term over many ticks by the `STtoLTRate` mechanism (STW→LTW migration) | The fundamental mechanism by which **every learning-capable tract in the brain converts a Reward pulse into stronger dendrite weights for the dendrites of just-fired winning neurons**. Stock learning tracts — `driv→comb`, `noun→comb`, `comb→decn`, `verb→decn` — all invoke this code path each brain tick, and the pulse-on-pat / pulse-on-yes events arrive on exactly the tick the relevant decision is winning |
| 2 | **No drive receptor** | — | — | Chemical 204 is **not** in any Drives-tissue receptor (`biochemistry.json` receptors search for `"chemical": 204` returns zero hits). Reward does not feel like a drive to the creature; there is no "reward drive bar" in the brain. The chemical's effect is invisible to introspection — only the dendrite weight changes are observable, and only to a debugger or post-hoc behavioural test | — |
| 3 | **No sensorimotor receptor** | — | — | Chemical 204 has no involuntary-action emitter, no gait modifier, no expression trigger. It does not make the creature smile, blush, or perform any animation. Its effect is **purely cognitive** — it modifies dendrite weights inside the brain | — |
| 4 | **No reactions consume Reward** | — | — | Chemical 204 does not appear as a reactant in any of the 101 stock reactions. There is no antagonist (no chemical that destroys Reward the way Libido lowerer destroys Sex drive), no metabolic conversion. The only way the chemical leaves the bloodstream is **passive decay** | — |
| 5 | **Passive decay — "Very short"** | `biochemistry.json:9152-9159` | Bloodstream | genomeValue **4**, half-life **1 tick**, decay rate **0.62713226** per tick. Each biochemistry tick the chemical is multiplied by 0.62713226 — i.e. it loses 37.3 % of its level per tick. After 1 tick: ~62 %. After 2: ~39 %. After 5: ~10 %. After 10: ~0.9 %. Effectively the chemical is gone within ~10 biochem ticks (~0.33 s at 30 tps) | The decay is what makes Reward a **transient pulse** rather than an accumulating reservoir. A pat at tick T trains only the decision winning at tick T (or T+1, when the chemical is already at ~62 % and still well above any reasonable threshold) — by tick T+5 the level is too low to trigger reinforcement, so a later unrelated decision cannot accidentally inherit credit for the original good behaviour |
| 6 | **CAOS reads** | `CHEM 204` query from agent scripts; debug Kits and biochemistry monitors | Bloodstream | Any CAOS script can read the current chemical 204 level. Smart teaching toys can verify that a Reward pulse is propagating; debug Kits and Science Kits visualise the chemical's spike-and-decay on a graph. Biochemistry debuggers in the rebuild's debug console list chem 204 alongside every other slot | Read-only — does not affect the creature's own state |
| 7 | **Per-tract index is configurable** | SVRule opcode 59 `setRewardChemicalIndex` | Brain / per tract | Each tract can be configured to read a *different* chemical as its Reward source via `setRewardChemicalIndex(N)`. The stock genome uses 204 universally, but a modder could redirect e.g. `comb→decn` to read chem 230 instead, separating "decision reward" from "association reward". The per-tract granularity is the architectural reason chemicals 204 and 205 are not hard-coded engine constants — they are genome conventions, not engine guarantees. The default value at construction is `myChemicalIndex = 0` (the placeholder slot), so an unconfigured tract reads the dead "(none)" chemical and never reinforces — the genome must explicitly set the index for reinforcement to function | The chemical index field in `ReinforcementDetails` is a single byte, giving a full 0–255 range — any chemical slot can be the Reward source |
| 8 | **No reinforcement when destination not winning** | `Tract.js:534-538` | Brain / tract | Even if chemical 204 is high, dendrites whose destination neuron's `OUTPUT_VAR` is 0 are skipped — there is no reinforcement of "losing" decisions. This is the second filter (after the threshold) that focuses learning on dendrites which actually contributed to the just-fired choice | Reward only credits decisions the creature **actually made**, not decisions it considered and rejected |
| 9 | **No reinforcement when level ≤ threshold** | `ReinforcementDetails.ReinforceAVariable` (JS `Tract.js:74-82`) | Brain / tract | The threshold check `if (level > threshold)` means an unconfigured-threshold tract (threshold 0) reinforces on any non-zero level, but a tract configured with a higher threshold (e.g. 0.5) ignores small Reward dribbles and only learns from strong pulses. The genome can therefore tune which tracts learn from "small" rewards (low threshold) vs. "big" rewards only (high threshold) | Threshold is the genome's per-tract sensitivity dial for Reward |

## Role in Game Mechanics

### The reinforcement equation in detail

The core formula, expressed as `ReinforceAVariable`:

```text
ReinforceAVariable(levelOfReinforcement, variableToReinforce):
    # levelOfReinforcement = chemicals[chem 204]
    # variableToReinforce  = dendrite.weights[WEIGHT_SHORTTERM_VAR]
    if levelOfReinforcement > myThreshold:
        reinforcementModifier = levelOfReinforcement - myThreshold
        variableToReinforce = BoundIntoMinusOnePlusOne(
            variableToReinforce + (myRate * reinforcementModifier)
        )
```

Three observations matter here:

1. **The modifier is `(level − threshold)`, not `level`.** Tracts with the same rate but different thresholds will produce different effective gains for the same chemical level. A tract with threshold 0.0, rate 0.1 reinforces by `0.1 × level`; a tract with threshold 0.5, rate 0.1 reinforces by `0.1 × (level − 0.5)` — i.e. zero for levels ≤ 0.5, a quarter as much for level 0.75, and identical for level 1.0 to a less-discriminating tract at the same point. This is the genome's mechanism for making different brain regions learn at different speeds and with different sensitivities from the same Reward bus.
2. **The variable is clamped to `[-1, +1]`.** `BoundIntoMinusOnePlusOne()` is the bounded floating-point clamp — once a STW saturates at +1, further Reward pulses produce no further change in that dendrite. The brain therefore has a built-in ceiling on how strongly any one association can be learned, regardless of how many pats the creature receives.
3. **Reward is positive-only by sign convention.** Because the chemical level is non-negative (the bloodstream clamps each chemical concentration to 0..1 in the Rebuild port / 0..255 in the original engine) and the rate is typically positive, Reward only ever **strengthens** (positive STW change). The Punishment chemical at slot 205 is what produces negative STW changes, and uses the same equation with its own (typically negative) rate.

### Why the half-life is 1 tick

The 1-tick half-life is the most aggressive decay in the entire genome and is a deliberate design choice. Three properties of the brain dynamics force it:

1. **Tract reinforcement runs every brain tick.** If Reward had a half-life of, say, 30 ticks (≈1 s), a single pulse would still be reinforcing dendrites a full second later — long after the relevant decision had been replaced by the next decision. The creature would learn "what I'm doing now" instead of "what I just did when the pat arrived". The 1-tick half-life makes Reward effectively a **single-tick window**.
2. **Tract reinforcement is per-dendrite cumulative.** A single brain tick sees `processRewardAndPunishment` called once per dendrite of every winning neuron in every reinforcement-supporting tract. With thousands of dendrites and tens of tracts, the cumulative reinforcement from one Reward pulse is already substantial. Letting that pulse persist would produce explosive weight growth.
3. **The clamp `[-1, +1]` saturates fast.** Even with the 1-tick half-life, a single moderate pulse is enough to push borderline dendrites several percent of the way toward saturation. Slowing decay would cause every dendrite to reach +1 within seconds of repeated pats, collapsing the brain's discrimination ability.

The Punishment slot (205) shares the same 1-tick half-life for the same reasons. The two chemicals are designed as **single-tick spikes** by the same logic that the navigation drives are designed as 10-second pulses: the timing of the chemical's lifetime exactly matches the duration of the brain event it is supposed to influence.

### How `processRewardAndPunishment` is called

The call chain on every brain tick is:

```
Brain.update()
  for each tract:
    Tract.update()
      for each dendrite of every neuron in the destination lobe:
        Tract.processDendrite(dendrite)
          Tract.processRewardAndPunishment(dendrite)
            if !reward.supported && !punishment.supported: return
            if dendrite.dstNeuron.states[OUTPUT_VAR] == 0: return
            if reward.supported:
              level = pointerToChemicals[reward.chemicalIndex]   ← reads chem 204
              dendrite.weights[STW] = reward.reinforceAVariable(level, dendrite.weights[STW])
            if punishment.supported:
              level = pointerToChemicals[punishment.chemicalIndex] ← reads chem 205
              dendrite.weights[STW] = punishment.reinforceAVariable(level, dendrite.weights[STW])
```

The `pointerToChemicals` array is a live pointer into the bloodstream's `myChemicalConcs[256]` (wired up during brain-component initialisation). This means a `CHEM 204 +amount` write that lands between two brain ticks is visible to the next tick's reinforcement loop without any explicit propagation step. The brain and the bloodstream share memory by reference — the same invariant called out for chemical 198 / Up / etc.

### Stock stimulus gene payloads

Although the stimulus library itself is not extracted into `biochemistry.json` (it lives in the `G_STIMULUS` genes), the `pat-slap-stimulus.md` walkthrough documents which stimuli carry a Reward payload in the stock genome. The pattern, by stimulus number:

- **POINTERPAT (1)**, **CREATUREPAT (2)** — pat by player / by another creature → small Reward + small drive-bar relief
- **POINTERYES (40)**, **CREATUREYES (41)** — verbal "yes" → identical to a pat; chem 204 pulse + drive nudge
- **EAT (26)**, **EATEN_FRUIT (78)**, **EATEN_FOOD (79)**, **EATEN_PLANT (77)**, **EATEN_DETRITUS (81)** — successful consumption → Reward pulse on top of the metabolic chemicals (sugars, proteins) the food carries via its own scripts
- **MATE (45)** — successful mating → Reward pulse plus a Sex-drive reduction
- **REACHED_PEAK_OF_SMELL\* (55–74)** — the creature found the peak of a CA gradient it was tracking → Reward pulse on the navigational decision that brought it there
- **DROP (19)**, **GET (18)** when the agent was the IT object the creature had been pursuing — Reward for completing the desire

The complement set — **POINTERSLAP (3)**, **POINTERNO (42)**, **HIT (25)**, **AGGRESSION (44)** — carry a **Punishment** [205] payload instead. The two chemicals together cover the full positive/negative reinforcement axis, with stimuli mapping every kind of in-world event onto one or the other (or, for ambiguous events, onto neither).

This is the architectural reason the `pat-slap-stimulus.md` article describes the pat / slap as "the player's most direct reinforcement tools": the player is the only agent that triggers `STIM_POINTERPAT` / `STIM_POINTERSLAP` / `STIM_POINTERYES` / `STIM_POINTERNO` directly, and those four stimuli's chem-204 / chem-205 payloads are the fastest, most reliable way to deliver Reward / Punishment to a creature's brain.

### How tract genes select chem 204

A tract gene's SVRule program is a sequence of opcodes evaluated when the tract initialises. The relevant opcodes for Reward are:

| Opcode | SVRule operand | JS equivalent | Operand |
|--------|----------------|---------------|---------|
| 57 | `setRewardThreshold` | `SET_REWARD_THRESHOLD` | float in [-1, +1] |
| 58 | `setRewardRate` | `SET_REWARD_RATE` | float in [-1, +1] |
| 59 | `setRewardChemicalIndex` | `SET_REWARD_CHEMICAL_INDEX` | byte (0–255), modulo NUMCHEM |
| 60 | `setPunishmentThreshold` | `SET_PUNISHMENT_THRESHOLD` | float in [-1, +1] |
| 61 | `setPunishmentRate` | `SET_PUNISHMENT_RATE` | float in [-1, +1] |
| 62 | `setPunishmentChemicalIndex` | `SET_PUNISHMENT_CHEMICAL_INDEX` | byte (0–255), modulo NUMCHEM |

Opcode 59 in particular calls `Tract.myReward.SetChemicalIndex(operand % NUMCHEM)` and **also** sets `myReward.SetDendritesSupportFlag(true)` (JS `SVRule.js:1024-1040`). Without the dendrite-support flag, `processRewardAndPunishment` exits early on its `IsSupported()` check, so a tract whose genome forgets to issue opcode 59 will *not* learn from chem 204 even if the chemical level is high. The same is true symmetrically for opcode 62 / chem 205. The genome therefore must issue opcode 59 (chemicalIndex 204) on every tract that should learn from Reward, plus opcode 60 / 61 for threshold and rate, plus the matching opcodes 60–62 for Punishment if the tract should also de-learn from negative events.

A tract that issues opcode 59 with operand 204 effectively wires itself onto the Reward bus. A tract that issues opcode 59 with a different operand (say, the index of `Hunger for protein`) wires itself onto a *different* bus — every time the protein hunger drive rises, that tract reinforces its currently-winning dendrites. This is the genetic flexibility the engine exposes, and it is rarely used in stock C3 — virtually every reinforcement-capable tract in the stock genome reads chem 204 / chem 205 — but it is the architectural reason the chemicals are named "Reward" and "Punishment" only by convention, not by engine hard-coding.

### Reward and the `resp`/`prox` brain inputs

A subtle interaction with the stimulus pipeline: when a stimulus delivers a chemical that is **also** a drive chemical (e.g. it adjusts Hunger for fat as well as Reward), `SensoryFaculty.adjustChemicalLevelWithTraining` (JS `SensoryFaculty.js:1257-1310`) calls `brain.setInput('resp', driveId, adjustment)` for the drive component. This is a separate, **brain-input** signal that goes to the stimulus / `resp` lobe (or `prox` if the creature is asleep), which is itself a learning lobe. So a single stimulus event with both a drive chemical and chem 204 in its payload trains the brain through *two* parallel paths:

1. The **per-tract reinforcement** path triggered by the chem 204 pulse, which strengthens dendrite STW weights in every Reward-listening tract (possibly all of them).
2. The **stimulus-lobe path** triggered by the drive adjustment, which delivers a `setInput('resp', driveId, adj)` that the `resp`-driven decision lobe uses to bias its next decision toward / away from the action that produced the adjustment.

Reward is *not* a drive chemical (no Drives-tissue receptor for chem 204), so it does not produce a `resp` input by itself — only the drive components of a stimulus do. The two paths are complementary: chem 204 says "strengthen the recently-fired decision generally", `resp` says "bias your next decision-making toward this specific drive's relief". A pat with both a chem 204 pulse and a drive nudge therefore both strengthens the just-fired decision *and* makes the underlying drive feel slightly more satisfied, both of which encourage repetition.

### What Reward is *not*

Several confusions are easy to fall into because the chemical's name is so suggestive:

- **Reward is not a drive.** No drive bar represents it; the creature does not "feel rewarded" in the way it feels hungry or scared. The chemical is invisible to the drive lobe and the introspective faculties. It is a learning signal only.
- **Reward is not a verb.** The decision lobe has no "reward" action. A high Reward level does not push the creature toward any specific behaviour — it strengthens whatever behaviour is *currently* winning, no matter what that behaviour is.
- **Reward is not pleasant in any direct sense.** The chemical does not modulate facial expressions, gait, posture, or verbalisation. A creature receiving a chem 204 pulse exhibits no observable change beyond the (delayed) shift in decision probabilities once enough pats accumulate.
- **Reward is not the only positive chemical.** Several drives drop on positive events (Hunger for fat falls when fat is eaten; Loneliness falls when another creature is nearby). Those drops are not Reward — they're drive satisfaction, which trains the brain via the `resp` lobe input rather than through tract reinforcement. The two systems coexist; chem 204 is a separate, dedicated reinforcement bus.
- **Reward is not used for long-term memory directly.** The chemical reinforces the *short-term* dendrite weight (`WEIGHT_SHORTTERM_VAR`). The migration from short-term to long-term is governed by `STtoLTRate` (set by SVRule opcode 43), which moves a small fraction of STW into LTW each tick. A single Reward pulse therefore produces a transient STW bump that converts into a much smaller, but persistent, LTW change over many ticks. The final long-term lesson is the *integral over time* of all the Reward-driven STW bumps, attenuated by STW→LTW rate and by intervening Punishment pulses.
- **Reward is not modulated by emotion.** Unlike Adrenalin (which scales a creature's general activation) or Glycotoxin (which signals metabolic distress), Reward has no upstream modulators. The chemical's level is exactly what was injected, minus its decay — no other chemical raises or lowers it by reaction.
- **Reward is not pulsed by any reaction.** The 101 stock reactions do not produce chem 204 (verified by searching `biochemistry.json` for `"chemical": 204` in the `product1`/`product2` fields of all reactions — zero hits). The chemical is exclusively script- and stimulus-driven.

### Modding affordances

Reward is one of the cleanest extension points in the engine for behavioural modders, because the chemical's two halves (the chemical itself and the per-tract index) are independent:

- **Add a metabolic Reward source.** A modded reaction `Glucose + low-blood-glucose-marker → Glucose + Reward` would let a creature reward its own brain when it eats sugar — turning Reward from a purely external bus into a partial-feedback bus. The engine doesn't care; the dendrite-weight loop reads whatever chem 204 contains.
- **Add a neuroemitter on `decn`.** A modded neuroemitter on the decision lobe that pulses chem 204 when a high-confidence decision is made would let the brain self-reinforce its own confident choices, biasing the network toward decisiveness.
- **Redirect specific tracts off the Reward bus.** Editing a tract gene to issue `setRewardChemicalIndex(N)` for a different N peels that tract off the universal Reward bus and onto its own private chemical. Modders can use this to make e.g. the `comb→decn` tract learn only from a custom "decision reward" chemical that is pulsed by a different stimulus class than the universal Reward.
- **Repurpose the slot for an unrelated chemical.** Because the engine doesn't hard-code chem 204, a modder can rename the slot in `ChemicalNames.catalogue`, repurpose it as e.g. an "endorphin" chemical, and rewire all tract genes to use a different index for reinforcement. The engine is agnostic to which slot carries the reinforcement signal.
- **Add stimulus-specific Reward magnitudes.** Each `G_STIMULUS` gene can deliver a different chem 204 amount in its `chemicalsToAdjust[4]/adjustments[4]` pair. A modder can therefore make "successful mating" a much bigger Reward pulse than "successful eating", or fine-tune "verbal yes" vs "physical pat" differently.

### Practical consequences for gameplay

- **Patting trains the most recent decision.** Because of the 1-tick half-life and the per-tract loop, a pat at tick T trains the dendrites of every winning neuron at tick T (or T+1 at most). Players who pat the creature *while it is doing the desired thing* train it correctly; players who pat *afterwards* train the wrong thing (whatever the creature happened to be doing at the moment of the pat, e.g. having walked away from the food it just ate). This is the single most common cause of frustration in first-time Creatures players — the engine is doing exactly what it should, but the player's mental model assumes a longer reward window than the 1-tick chemical actually provides.
- **Verbal "yes" is just as effective as a pat.** Both go through the same chem 204 pulse via different stimuli. A player who finds patting fiddly can train a creature equally well by typing "yes" while pointing at it.
- **Eating self-rewards through the stimulus library.** A creature that eats a fruit experiences `STIM_EATEN_FRUIT`, which delivers a chem 204 pulse alongside the food's drive-bar relief. The creature learns to associate the food agent with reward without any player input. This is what makes stock C3 creatures gradually develop food preferences on their own.
- **Failing to pulse Reward weakens learning.** A custom agent that wants to teach a creature its purpose (e.g. "use this lift to go up") must pulse chem 204 on success. Skipping the Reward pulse means the creature still associates the agent with the drive-bar relief (from the drive chemical adjustment), but loses the per-tract reinforcement bonus across all the other tracts that fired during the interaction. The lesson takes longer to sink in and is more easily overwritten by later, conflicting events.
- **Punishment is the antagonist, not the absence.** Failing to pat is *not* punishment; it is merely the absence of reward. A chem 205 pulse is required to actively de-learn a behaviour, and the two chemicals work on different signs (positive rate vs. negative rate at the per-tract level). A creature can therefore exist in a "not reinforced, not punished" state where its dendrite weights drift only through their natural decay and STW→LTW migration, with no external pull in either direction.
- **Watching chem 204 in the Science Kit diagnoses training.** A creature that is not learning despite player patting will show a flat zero on the chem 204 graph — the stimulus library failed to wire the pat to chem 204. A creature that learns "too readily" (i.e. flips its preferences on every stimulus) will show large chem 204 spikes — possibly a modded stimulus gene with an over-tuned amount. The chemical's graph is the fastest way to diagnose the producer side of the reinforcement pipeline; the dendrite-weight visualiser in the brain debugger is the fastest way to diagnose the consumer side.

### JS port notes

The Rebuild treats chemical 204 as an ordinary bloodstream chemical with no special-case handling, in line with the engine-agnostic design:

- **No `CHEM_REWARD` constant.** The chemical is referenced numerically by genome data only. There is no engine-level enum entry for chemical 204, no special path, no built-in producer or consumer hook beyond the SVRule opcode 59 that any tract can configure.
- **The `pointerToChemicals` reference must be live.** `Tract.js:541-547` reads `this.pointerToChemicals[this.reward.getChemicalIndex()]` directly. The same memory must be the `Biochemistry.myChemicalConcs` array that `CHEM 204` and stimulus chemical adjustments write into. Any port-side bug that copies the array (rather than aliasing it) will silently break all reinforcement — pulses written by stimuli will not be visible to the tract reads.
- **The decay must apply to chem 204 every tick.** `Biochemistry.update()` walks all 256 chemical slots and applies each chemical's individual decay rate per `biochemistry.json`. Chem 204's rate of 0.62713226 must be applied every biochemistry tick, not every brain tick, not every game tick — an off-by-frequency bug here would make Reward either far too persistent (training persists across many decisions) or far too transient (training never reaches a tract that runs after the chemical has already decayed).
- **The clamp `[-1, +1]` in `reinforceAVariable` is critical.** `Tract.js:74-82` calls `boundIntoMinusOnePlusOne` on the result. Skipping the clamp would let dendrite STW weights run to infinity over repeated training, which would then propagate to LTW and corrupt the brain's normalised competition.
- **`processRewardAndPunishment` must run on every dendrite of every winning neuron, not on every dendrite.** The early-exit on `dstOutput === 0` (`Tract.js:535-538`) is the second filter that focuses learning. A port that drops this check would reinforce *every* dendrite on every Reward pulse, collapsing the brain's discrimination between winning and losing decisions.
- **The `IsSupported()` early-exit must respect the `setDendritesSupportFlag` set by SVRule opcode 59.** `Tract.js:530-532` exits if neither reward nor punishment is supported. The flag is only set true by opcode 59 / 62 in `SVRule.js:594` / `SVRule.js:602`. A port that defaults the flag to true would have every tract attempt to reinforce, even those whose genome did not configure a chemical index — leading to reads of chem 0 ("(none)"), which is always 0 and therefore always below threshold, so no actual harm, but a visible performance regression on every brain tick.
- **The chemical decay floor must be 0.** Reward levels can never go negative; `Biochemistry.adjustChemicalLevel(204, -Δ)` must clamp to 0, not produce a negative level. A negative level would pass the `level > threshold` check (since most thresholds are 0) and produce a negative STW change — anti-reward. This is not the engine's intended behaviour for chem 204; negative reinforcement is the job of the separate Punishment chemical at slot 205.

The most likely class of port bug specific to Reward is a **memory-aliasing mismatch**: the chemical concentration array seen by the Tract reinforcement loop must be byte-for-byte identical to the array seen by the stimulus chemical injector. Any port-side caching, copying, or buffering between the two will mute the reinforcement pipeline.

### Summary

```
   Player pats creature head (or says "yes", or creature eats fruit, etc.)
                       │
              Stimulus pipeline:
              SensoryFaculty.stimulate(STIM_POINTERPAT / etc.)
                       │
                       ▼
              Genome G_STIMULUS entry's chemicalsToAdjust[]:
              chemicalsToAdjust[i] = 204, adjustments[i] = +Δ
                       │
                       ▼
              Biochemistry.adjustChemicalLevel(204, +Δ)
              myChemicalConcs[204] += Δ (clamped 0..1)
                       │
                       ▼ (next biochem tick = next brain tick)
              Brain.update() walks each tract:
                Tract.processRewardAndPunishment(d) for every dendrite
                  if reward.supported && d.dstNeuron.OUTPUT_VAR > 0:
                    level = pointerToChemicals[reward.chemicalIndex]   ← chem 204
                    if level > reward.threshold:
                      d.weights[STW] = clamp(d.weights[STW]
                                              + reward.rate × (level − reward.threshold),
                                            -1, +1)
                       │
                       ▼ (subsequent ticks)
              STW → LTW migration via STtoLTRate
              Long-term lesson encoded in dendrite long-term weights
                       │
                       ▼ (next biochem tick)
              Chemical 204 decays by × 0.62713226 → ~62 % → ~39 % → ~0 %
              within ~10 biochem ticks (~0.33 s at 30 tps)
                       │
                       ▼
              The single pulse is gone; the lesson it produced lives on
              in the strengthened dendrite weights of the just-won decision.

   Reward [204] is the per-tract positive-reinforcement bus:
     - No biochemistry producer in the stock genome (CAOS + stimuli only)
     - Read by Tract.processRewardAndPunishment on every brain tick
     - Per-tract chemical index configurable via SVRule opcode 59
     - Per-tract threshold (opcode 57) and rate (opcode 58) tune
       sensitivity and gain
     - Decays in 1 tick (genomeValue 4, "Very short") — single-tick spike
     - Strengthens dendrite STW weights of every winning neuron's dendrites
     - Companion to Punishment [205] which uses the same equation with
       opposite sign rate
     - Driven primarily by genome stimulus library (POINTERPAT, POINTERYES,
       EATEN_FRUIT, MATE, REACHED_PEAK_OF_SMELL*, …) and by direct CAOS
     - The fundamental learning signal of the Creatures brain
```

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:282` — chemical 204 named `"Reward"`
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:283` — chemical 205 named `"Punishment"`, the antagonist slot
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9152-9159` — half-life entry: genomeValue 4, halfLifeInTicks 1, decayRate 0.62713226, speed "Very short"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — verified: no receptor, no emitter, no reaction, and no neuroemitter has chemical 204 as either input or output. The chemical is invisible to organ-level biochemistry
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:529-560` — JS port of `processRewardAndPunishment`
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:1-82` — JS port of `ReinforcementDetails` class, including `reinforceAVariable` formula
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:96-101` — JS opcode constants `SET_REWARD_THRESHOLD`, `SET_REWARD_RATE`, `SET_REWARD_CHEMICAL_INDEX`, `SET_PUNISHMENT_THRESHOLD`, `SET_PUNISHMENT_RATE`, `SET_PUNISHMENT_CHEMICAL_INDEX`
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:586-606` — JS handlers for the six reinforcement opcodes
- `Rebuild/Main_Game/src/engine/creature/perception/PerceptionConstants.js:80-127` — `BuiltInStimuli` enum including `POINTERPAT`, `POINTERYES`, `EAT`, `MATE` and the other Reward-payload stimuli
- `Rebuild/DOCUMENTATION/articles/game-systems/creatures/pat-slap-stimulus.md` — full walkthrough of the pat → stimulus → chemical → tract pipeline; the canonical Reward delivery path
- `Rebuild/DOCUMENTATION/articles/game-systems/stimulus-system.md` — broader stimulus architecture; sections 99, 213, 276, 413–425 cover the reward / punishment mapping
- `Rebuild/DOCUMENTATION/chemicals/198 - Brain chemical 1.md` — sibling doc on the disappointment chemical at slot 198; same producer/consumer asymmetry pattern, same brain-bus design
- `Rebuild/DOCUMENTATION/chemicals/199 - Up.md` — sibling doc on the navigation drives; the "no biochemistry producer in stock genome, agent-layer pulse only" architectural pattern is identical, but Up is read by a Drives-tissue receptor while Reward is read inside the brain by the per-tract reinforcement loop
- `Rebuild/DOCUMENTATION/chemicals/205 - Punishment.md` — sibling doc on the antagonist slot (companion to this document; same equation, opposite sign by convention)
