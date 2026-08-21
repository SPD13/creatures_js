# 205 - Punishment

**Punishment** is the genome's canonical negative-reinforcement chemical and the **antagonist twin** of **Reward [204]**, occupying the immediately following slot in the chemical-names catalogue (`Rebuild/Assets/Catalogue/ChemicalNames.catalogue:282-283`). Like Reward, it lives inside the brain-bus band 198–214 — bracketed by `Brain chemical 1 [198]` (the disappointment chemical) below and `Brain chemical 9 [206]` and onward above — and is functionally invisible to the rest of the body: it is **not** a drive (no Drives-tissue receptor reads it), **not** a sense (no organ-locus emitter writes it), and **not** a metabolic product (no reaction has it on either side). Its sole job is to tell the brain's per-tract reinforcement loop "the just-fired association was a bad one — weaken it". Where Reward's role is to strengthen the dendrite weights of winning neurons via a positive rate, Punishment's role is to **weaken** those same weights via a negative rate, using exactly the same engine equation. The two chemicals together cover the full positive/negative reinforcement axis.

The mechanism is hard-coded in the engine and is byte-for-byte symmetric with Reward. Each genome tract gene carries an SVRule program containing the operands `setPunishmentChemicalIndex` (opcode 62), `setPunishmentThreshold` (opcode 60), and `setPunishmentRate` (opcode 61) that the tract evaluates when it initialises. These three parameters are stored in the tract's per-instance `myPunishment` `ReinforcementDetails` struct (JS `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:1-82`). On every brain tick, after the tract has computed which destination neurons "won" the local competition, it walks all dendrites whose destination is a winning neuron and calls `processRewardAndPunishment(d)` (JS `Tract.js:529-560`). That function reads `myPointerToChemicals[myPunishment.GetChemicalIndex()]` — the live bloodstream level of the chemical at whatever index the genome configured, **typically 205** — and if that level is above `myPunishment.threshold`, the dendrite's short-term weight (`WEIGHT_SHORTTERM_VAR`) is incremented by `rate × (level − threshold)`. Because Punishment's rate is conventionally **negative** in the genome, the addition is mathematically a subtraction: weights of winning dendrites are pulled down, not up. The result is then clamped into `[-1, +1]` by `BoundIntoMinusOnePlusOne()`. This is the entire formal mechanism of "the creature learns from being slapped": a chemical pulse arrives, the dendrites that just took part in the winning decision are nudged weaker, and the next time the same situation arises that decision is less likely to win.

The chemical's decay profile is identical to Reward's and is the most aggressive of any non-trivial slot in the genome: genomeValue **4**, half-life **1 tick**, decay rate **0.62713226** per tick, speed class **"Very short"** (`biochemistry.json:9160-9167`). With a half-life of one biochemistry tick (0.033 s at 30 tps), a `CHEM 205 100` injection is at 62 after one tick, ~39 after two, ~25 after three, ~10 after five, and effectively zero by tick ten — under a third of a second. Punishment is therefore a **single-tick spike**, not an accumulating reservoir. It is designed to coincide with exactly one brain update — the same tick on which the tract is processing dendrites for a winning decision — and to be gone before the next stimulus event arrives. This stops two consecutive negative stimuli from blurring their de-reinforcement: each pulse de-trains only the decision that is currently winning when *it* arrives, not the decision that won several ticks ago. The matching parameters with Reward are deliberate — the two chemicals are designed as an antagonist pair operating on the same time scale through the same code path.

The most architecturally important fact about Punishment, mirroring the pattern of Reward [204] and the navigation drives ([199] Up, [200] Down, …), is that **the stock genome contains no biochemistry-side producer for it.** No emitter writes chemical 205, no reaction has chem 205 as a product, no neuroemitter pulses it, and it has no initial-concentration entry. Every Punishment pulse a creature receives in stock C3 / DS arrives via one of three CAOS-driven paths: (a) genome stimulus genes (`G_STIMULUS`) with chemical 205 listed in their `chemicalsToAdjust[4]` array, fired by `STIM WRIT`/`STIM SHOU`/etc. when an agent script reports a negative event (slap by player, hit by another creature, hear "no", aggression target, fail to perform action); (b) the `STIM_POINTERSLAP`/`STIM_POINTERNO`-class linguistic events that wrap up a player disapproval gesture into a stimulus the genome can map onto a punishment pulse; or (c) direct CAOS `CHEM 205` / `ALTR 205` writes from agent scripts. The receptor side — meaning the read inside `processRewardAndPunishment` — is **fully wired** the moment any tract runs its SVRule init program with `setPunishmentChemicalIndex(205)`; the producer side is left to the agent layer plus the genome's stimulus library.

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **No biochemistry emitter in the stock genome** | — | — | The genome's emitter table (`biochemistry.json:7076`, 43 entries) does not list chemical 205 as a target. No physiological locus pulses Punishment. The chemical has no organ-side birth path | — |
| 2 | **No reaction product in the stock genome** | — | — | The 101 reactions in the stock genome do not produce chemical 205 (verified — chem 205 appears in the JSON only at the half-life entry on line 9161). No metabolic, hormonal, immune, or toxin pathway converts another chemical into Punishment | — |
| 3 | **No neuroemitter in the stock genome** | — | — | The single stock neuroemitter (gene 1, lobe `move`/neuron 37) writes Adrenalin / Fear / Crowded — not Punishment. **No brain neuron emits Punishment from cognitive activity.** The brain cannot self-punish purely from a thought; the pulse must come from outside the brain (sensory/CAOS) | — |
| 4 | **No initial concentration** | — | — | Chemical 205 is absent from the genome's `initialConcentrations` table. A newly-hatched creature is born with **Punishment = 0** and stays at 0 between explicit pulses | — |
| 5 | **Stimulus-gene chemical injection — the primary stock mechanism** | `G_STIMULUS` genes whose `chemicalsToAdjust[4]` array contains chemical 205 | Creature / bloodstream (systemic) | When an agent issues `STIM WRIT targ N M` (or `STIM SHOU`, `STIM SIGN`, `STIM TACT`), `SensoryFaculty.stimulate(stim N)` (JS `SensoryFaculty.js:processStimulus`) walks the stimulus's four chemical/adjustment pairs and calls `Biochemistry.adjustChemicalLevel(205, +Δ × strengthMultiplier)` for each pair whose chemical is 205. This is how `STIM_POINTERSLAP`, `STIM_POINTERNO`, `STIM_HIT`, `STIM_AGGRESSION` and most of the other "failure" stimuli deliver negative reinforcement — they each carry a chemical 205 entry with a positive amount in the genome's stimulus library | One-shot per stimulus event, magnitude per genome |
| 6 | **`STIM_POINTERNO` / `STIM_CREATURENO` — language-driven punishment** | Built-in stimuli 42 / 43, fired by the linguistic faculty's sentence-hearing routine when the player or another creature speaks "no" while pointing at this creature | Creature / Linguistic → Sensory | The player saying "no" stimulates the creature's sensory faculty with `STIM_POINTERNO`. The genome's stimulus #42 entry then fires its chemical payload — in the stock genome, this includes a chemical 205 (Punishment) injection, identical to a slap for the brain-side de-training pipeline. This makes "no" a verbal slap | One-shot per recognised "no" sentence |
| 7 | **`STIM_POINTERSLAP` / `STIM_CREATURESLAP` — touch-driven punishment** | Built-in stimuli 3 / 4, fired by `creatureDoneTo.cos` after the player clicks the creature's hand or right-clicks the creature (`Creature::ClickAction` → ACTIVATE2 → script issues `stim writ targ 3 1`; `pat-slap-stimulus.md:62-105`) | Creature / Sensory | The slap pipeline is the canonical negative-feedback path. The genome's stimulus #3 fires a chemical 205 pulse plus a small Pain / Anger / drive-bar nudge. The `processRewardAndPunishment` read inside every tract that initialised with `chem 205` then sees a non-zero level on the next tick and (because the genome's punishment rate is negative) reduces the dendrite weights of every just-won decision | One-shot per slap, magnitude per genome |
| 8 | **`STIM_HIT` / `STIM_AGGRESSION` — combat-driven punishment** | Built-in stimuli 25 / 44, fired when another creature performs an aggressive interaction (`Creature::ClickAction` from another creature's IT pursuit, or `STIM SHOU 25 1` from a hostile agent script) | Creature / Sensory | Combat events deliver Punishment to the recipient's brain via the same stimulus pipeline. The genome's stimulus #25 entry typically carries a chem 205 payload (plus pain / fear / anger drive nudges). The receiving creature's just-won decision (often "approach the attacker" or "stay near the attacker") gets de-reinforced, biasing future decisions away from that situation | One-shot per hit / aggression event |
| 9 | **Direct CAOS injection** | `CHEM 205 <amount>` from any agent script | Creature / bloodstream (systemic) | The CAOS `CHEM` command on a targeted creature writes a positive (or negative) delta into `myChemicalConcs[205]` via `Biochemistry.adjustChemicalLevel(205, amount)`. Modders use this to deliver custom punishment events that don't go through the stimulus library — debug toys, special items, scripted teaching mini-games, hazardous-terrain feedback | One-shot per call |
| 10 | **`ALTR` chemical adjustment** | `ALTR 205 <amount>` | Creature / bloodstream | Functionally identical to `CHEM 205` for the purposes of the per-tract reinforcement read. `ALTR` clamps to the chemical's range | One-shot per call |
| 11 | **Modder-added emitter / reaction / neuroemitter** | Custom genes targeting chem 205 | Creature / various | Genetic engineers can add Punishment producers — e.g. an emitter that writes chem 205 when blood-toxin rises (so eating poison reliably de-trains the brain), or a reaction `Pain → Pain + Punishment` that converts physical pain into negative reinforcement, or a neuroemitter on the `decn` lobe that pulses Punishment when a low-confidence decision fires (de-training indecision). None of these exist in the stock genome | Gene-dependent |

The single most important consequence of points 1–4 is that **stock C3 Punishment chemistry is purely event-driven through the stimulus library plus CAOS** — exactly the same architectural inversion that applies to Reward. No background metabolism, no slow accumulation, no chemistry-pathway-failure penalty — every pulse is the consequence of a discrete in-world event reported by an agent or by the linguistic system.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **Per-tract punishment read — the sole stock consumer** | Tract genes with SVRule operand `setPunishmentChemicalIndex(205)` (opcode 62) plus `setPunishmentThreshold` (60) and `setPunishmentRate` (61, conventionally negative) | Brain / every tract whose genome configured chem 205 as its punishment | Inside `ProcessRewardAndPunishment(dendrite d)` (JS `Tract.js:529-560`): if the tract's `myPunishment.IsSupported()` is true and the dendrite's destination neuron has `OUTPUT_VAR > 0` (it is a winning neuron), the function reads `myPointerToChemicals[myPunishment.GetChemicalIndex()]` — i.e. the bloodstream level of chem 205 — and calls `myPunishment.ReinforceAVariable(level, dendrite.weights[WEIGHT_SHORTTERM_VAR])`. ReinforceAVariable computes `if (level > threshold) variableToReinforce = clamp(variable + rate × (level − threshold), -1, +1)`. With a negative rate, the addition is a subtraction: STW falls. The dendrite's short-term weight is then propagated to long-term over many ticks by the `STtoLTRate` mechanism | The fundamental mechanism by which **every learning-capable tract in the brain converts a Punishment pulse into weaker dendrite weights for the dendrites of just-fired winning neurons**. Stock learning tracts — `driv→comb`, `noun→comb`, `comb→decn`, `verb→decn` — all invoke this code path each brain tick, and the pulse-on-slap / pulse-on-no events arrive on exactly the tick the relevant decision is winning |
| 2 | **No drive receptor** | — | — | Chemical 205 is **not** in any Drives-tissue receptor (`biochemistry.json` receptors search for `"chemical": 205` returns zero hits). Punishment does not feel like a drive to the creature; there is no "punishment drive bar" in the brain. The chemical's effect is invisible to introspection — only the dendrite weight changes are observable, and only to a debugger or post-hoc behavioural test | — |
| 3 | **No sensorimotor receptor** | — | — | Chemical 205 has no involuntary-action emitter, no gait modifier, no expression trigger. It does not by itself make the creature wince, scream, or perform any animation. The grimace / sound that accompanies a slap comes from the **other** chemicals carried by the slap stimulus (Pain, Anger, Fear), not from chem 205 itself. Chem 205's effect is **purely cognitive** — it modifies dendrite weights inside the brain | — |
| 4 | **No reactions consume Punishment** | — | — | Chemical 205 does not appear as a reactant in any of the 101 stock reactions. There is no antagonist (no chemical that destroys Punishment the way Libido lowerer destroys Sex drive), no metabolic conversion. The only way the chemical leaves the bloodstream is **passive decay** | — |
| 5 | **Passive decay — "Very short"** | `biochemistry.json:9160-9167` | Bloodstream | genomeValue **4**, half-life **1 tick**, decay rate **0.62713226** per tick. Each biochemistry tick the chemical is multiplied by 0.62713226 — i.e. it loses 37.3 % of its level per tick. After 1 tick: ~62 %. After 2: ~39 %. After 5: ~10 %. After 10: ~0.9 %. Effectively the chemical is gone within ~10 biochem ticks (~0.33 s at 30 tps). Decay parameters are byte-for-byte identical to Reward's | The decay is what makes Punishment a **transient pulse** rather than an accumulating reservoir. A slap at tick T de-trains only the decision winning at tick T (or T+1, when the chemical is already at ~62 % and still well above any reasonable threshold) — by tick T+5 the level is too low to trigger de-reinforcement, so a later unrelated decision cannot accidentally inherit blame for the original bad behaviour |
| 6 | **CAOS reads** | `CHEM 205` query from agent scripts; debug Kits and biochemistry monitors | Bloodstream | Any CAOS script can read the current chemical 205 level. Smart teaching toys can verify that a Punishment pulse is propagating; debug Kits and Science Kits visualise the chemical's spike-and-decay on a graph alongside Reward. Biochemistry debuggers in the rebuild's debug console list chem 205 alongside every other slot | Read-only — does not affect the creature's own state |
| 7 | **Per-tract index is configurable** | SVRule opcode 62 `setPunishmentChemicalIndex` | Brain / per tract | Each tract can be configured to read a *different* chemical as its Punishment source via `setPunishmentChemicalIndex(N)`. The stock genome uses 205 universally, but a modder could redirect e.g. `comb→decn` to read chem 231 instead, separating "decision punishment" from "association punishment". The per-tract granularity is the architectural reason chemicals 204 and 205 are not hard-coded engine constants — they are genome conventions, not engine guarantees. The default value at construction is `myChemicalIndex = 0` (the placeholder slot), so an unconfigured tract reads the dead "(none)" chemical and never de-reinforces — the genome must explicitly set the index for de-reinforcement to function | The chemical index field in `ReinforcementDetails` is a single byte, giving a full 0–255 range — any chemical slot can be the Punishment source |
| 8 | **No de-reinforcement when destination not winning** | `Tract.js:534-538` | Brain / tract | Even if chemical 205 is high, dendrites whose destination neuron's `OUTPUT_VAR` is 0 are skipped — there is no de-reinforcement of "losing" decisions. This is the second filter (after the threshold) that focuses learning on dendrites which actually contributed to the just-fired choice | Punishment only debits decisions the creature **actually made**, not decisions it considered and rejected |
| 9 | **No de-reinforcement when level ≤ threshold** | `ReinforcementDetails.ReinforceAVariable` (JS `Tract.js:74-82`) | Brain / tract | The threshold check `if (level > threshold)` means an unconfigured-threshold tract (threshold 0) de-reinforces on any non-zero level, but a tract configured with a higher threshold (e.g. 0.5) ignores small Punishment dribbles and only de-learns from strong pulses. The genome can therefore tune which tracts learn from "small" punishments (low threshold) vs. "big" punishments only (high threshold) | Threshold is the genome's per-tract sensitivity dial for Punishment |
| 10 | **Sign of the rate determines direction** | SVRule opcode 61 `setPunishmentRate` | Brain / per tract | The engine equation is identical for Reward and Punishment: `newSTW = clamp(STW + rate × (level − threshold), -1, +1)`. The **only** thing that distinguishes Punishment from Reward operationally is that the genome typically configures the punishment rate as **negative**. A modder who configures a positive punishment rate would turn chem 205 into a second Reward bus; the engine has no enforcement of the "punishment must be negative" convention. This is the most subtle modding pitfall of the system | The genome convention (negative punishment rate) is what makes Punishment behave as the antagonist of Reward |

## Role in Game Mechanics

### The de-reinforcement equation in detail

The core formula is shared with Reward, expressed as `ReinforceAVariable`:

```text
ReinforceAVariable(levelOfReinforcement, variableToReinforce):
    # levelOfReinforcement = chemicals[chem 205]
    # variableToReinforce  = dendrite.weights[WEIGHT_SHORTTERM_VAR]
    if levelOfReinforcement > myThreshold:
        reinforcementModifier = levelOfReinforcement - myThreshold
        variableToReinforce = BoundIntoMinusOnePlusOne(
            variableToReinforce + (myRate * reinforcementModifier)
        )
```

Three observations matter for the Punishment case specifically:

1. **There is no separate "punishment equation".** The engine reuses the same formula with a negative `myRate`. A tract with `setPunishmentRate(-0.1)` and threshold 0.0 reduces STW by `0.1 × level` for every Punishment pulse above zero. The single equation handles both reinforcement directions, which is why the engine names them both "ReinforcementDetails" rather than "RewardDetails" / "PunishmentDetails" — they are the same object, distinguished only by the typical sign of their rate.
2. **The clamp `[-1, +1]` saturates at the negative bound.** `BoundIntoMinusOnePlusOne()` clamps a STW that is being driven down by repeated Punishment pulses at -1. Once a STW saturates at -1, further Punishment pulses produce no further change in that dendrite. The brain has a built-in floor on how strongly any one association can be unlearned, regardless of how many slaps the creature receives.
3. **A negative STW means active inhibition, not just absence of activation.** Through the STW→LTW migration, a saturated -1 STW propagates into a strongly negative LTW, which the brain's neuron-update equations interpret as an *inhibitory* synapse — i.e. firing the source neuron actively *suppresses* the destination neuron. Punishment therefore not only erases learned associations, it can build counter-associations: "when I see this object, do *not* fire the approach decision". This is qualitatively different from "no learning", which would leave the dendrite weight at its baseline value and let competition settle the matter.

### Why the half-life is 1 tick

The 1-tick half-life is shared with Reward and motivated by exactly the same logic: tract de-reinforcement runs every brain tick; per-dendrite cumulative effects would otherwise saturate; and the `[-1, +1]` clamp makes even a moderate pulse meaningful. See the corresponding section in `204 - Reward.md` for the full argument — it applies symmetrically to Punishment with the sign flipped.

There is one Punishment-specific reason to keep the half-life short that does not apply to Reward: **a long Punishment half-life would over-train against borderline behaviours.** If a slap's chem 205 pulse persisted for several seconds, the creature's brain would de-reinforce not only the bad decision but also every slightly-related decision the brain considered in the next few ticks — including the "do nothing" decision the creature naturally falls back to after a slap. The result would be a creature trained to do *nothing*, because every behaviour following a slap got punished. The 1-tick half-life prevents this by cleanly limiting de-reinforcement to the single decision that was on the table when the slap landed.

### How `processRewardAndPunishment` is called

The call chain on every brain tick is identical to Reward's, with the punishment branch executed after the reward branch on the same dendrite:

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

A subtle but important consequence: **the two chemicals are processed sequentially on the same STW value within a single call.** If both Reward and Punishment are non-zero on the same tick (e.g. an event that delivers both — uncommon but possible via a custom stimulus), the Reward branch fires first and adjusts the STW upward, then the Punishment branch reads the *already-adjusted* STW and pulls it back down. The order matters for the final value, because the clamp `[-1, +1]` is applied at each step: a STW driven to +1 by Reward and then driven down by Punishment within the same tick can land anywhere in `[-1, +1]` depending on the relative magnitudes. This is the engine's behaviour and the JS port preserves it (`Tract.js:546-559`).

### Stock stimulus gene payloads

The negative-feedback complement to the Reward stimulus list, drawn from the same `pat-slap-stimulus.md` walkthrough:

- **POINTERSLAP (3)**, **CREATURESLAP (4)** — slap by player / by another creature → small Punishment + Pain + Anger drive nudge
- **POINTERNO (42)**, **CREATURENO (43)** — verbal "no" → identical to a slap; chem 205 pulse + drive nudge
- **HIT (25)**, **AGGRESSION (44)** — being attacked by another creature → chem 205 pulse + Pain / Fear / Anger
- **DISAPPOINTED (variable)** — failure to perform an attempted action that the creature expected to succeed → small chem 198 (Brain chemical 1, the disappointment chemical) and, in some genomes, chem 205 pulse on the failed-decision tract
- **EATEN_DETRITUS (81)** when bad-tasting — some genomes encode certain low-quality foods to deliver a small chem 205 pulse alongside the food's nutritional payload, producing food-aversion learning

The complement set — **POINTERPAT (1)**, **POINTERYES (40)**, **EAT (26)**, **MATE (45)** — carry a **Reward** [204] payload instead. The clean separation by stimulus number is what lets the genome map any in-world event onto either the positive or the negative reinforcement bus without ambiguity.

This is the architectural reason the `pat-slap-stimulus.md` article describes the slap as the player's most direct negative-reinforcement tool: the player is the only agent that triggers `STIM_POINTERSLAP` / `STIM_POINTERNO` directly, and those two stimuli's chem-205 payloads are the fastest, most reliable way to deliver Punishment to a creature's brain.

### How tract genes select chem 205

A tract gene's SVRule program is a sequence of opcodes evaluated when the tract initialises. The relevant opcodes for Punishment are:

| Opcode | SVRule operand | JS equivalent | Operand |
|--------|----------------|---------------|---------|
| 60 | `setPunishmentThreshold` | `SET_PUNISHMENT_THRESHOLD` | float in [-1, +1] |
| 61 | `setPunishmentRate` | `SET_PUNISHMENT_RATE` | float in [-1, +1] (conventionally negative) |
| 62 | `setPunishmentChemicalIndex` | `SET_PUNISHMENT_CHEMICAL_INDEX` | byte (0–255), modulo NUMCHEM |

Opcode 62 in particular calls `Tract.myPunishment.SetChemicalIndex(operand % NUMCHEM)` and **also** sets `myPunishment.SetDendritesSupportFlag(true)` (JS `SVRule.js:594-606`). Without the dendrite-support flag, `processRewardAndPunishment` exits early on its `IsSupported()` check, so a tract whose genome forgets to issue opcode 62 will *not* de-learn from chem 205 even if the chemical level is high. The same is true symmetrically for opcode 59 / chem 204. The genome therefore must issue opcode 62 (chemicalIndex 205) on every tract that should de-learn from Punishment, plus opcode 60 / 61 for threshold and rate.

A tract that issues opcode 62 with operand 205 effectively wires itself onto the Punishment bus. A tract that issues opcode 62 with a different operand (say, the index of `Hunger for protein`) wires itself onto a different bus — every time the protein hunger drive rises, that tract de-reinforces its currently-winning dendrites, which is approximately "punish what you're doing whenever you're getting hungry". This is rarely useful, but the engine permits it.

### Asymmetric configuration is permitted

A tract can have Reward enabled and Punishment disabled, or vice versa, or both, or neither. The four combinations correspond to four different learning regimes:

- **Both enabled (typical):** the tract learns from both positive and negative feedback. Stock C3's main learning tracts (`comb→decn`, `verb→decn`, `noun→comb`, `driv→comb`) all use this regime.
- **Reward only:** the tract can be strengthened but never weakened by external feedback. STW only erodes through passive decay and through the STW→LTW migration. A tract configured this way will eventually saturate every dendrite it cares about toward +1 if the relevant Reward stimuli fire often enough. Useful for tracts that should *only* form positive associations.
- **Punishment only:** the tract can be weakened but never strengthened. Useful for tracts that should *only* form negative associations — e.g. a hypothetical "danger memory" tract that is born neutral and accumulates negative weights for things that hurt the creature.
- **Neither enabled:** the tract has no external learning at all. STW is shaped only by the source-neuron firing patterns and by passive decay. This is the regime for tracts that are pre-wired by the genome and not meant to adapt. Stock C3 uses this for some perception tracts.

The asymmetry is a significant modding affordance and is invisible from the gameplay layer: the player can pat or slap a creature freely, and which tracts respond to which stimulus is determined entirely by the genome's per-tract opcode configuration.

### Punishment and the `resp`/`prox` brain inputs

Like Reward, when a stimulus delivers a chemical that is **also** a drive chemical (e.g. it adjusts Pain or Anger as well as Punishment), `SensoryFaculty.adjustChemicalLevelWithTraining` (JS `SensoryFaculty.js:1257-1310`) calls `brain.setInput('resp', driveId, adjustment)` for the drive component. So a single slap event with both drive chemicals and chem 205 in its payload de-trains the brain through *two* parallel paths:

1. The **per-tract de-reinforcement** path triggered by the chem 205 pulse, which weakens dendrite STW weights in every Punishment-listening tract.
2. The **stimulus-lobe path** triggered by the drive adjustment, which delivers a `setInput('resp', driveId, adj)` that the `resp`-driven decision lobe uses to bias its next decision toward / away from the action that produced the adjustment.

Punishment is *not* a drive chemical (no Drives-tissue receptor for chem 205), so it does not produce a `resp` input by itself — only the drive components of the slap stimulus do. The two paths are complementary: chem 205 says "weaken the recently-fired decision generally", `resp` says "bias your next decision-making away from this specific drive's increase". A slap with both a chem 205 pulse and a Pain drive nudge therefore both weakens the just-fired decision *and* makes the underlying drive feel more aversive, both of which discourage repetition.

### What Punishment is *not*

Several confusions are easy to fall into because the chemical's name is so suggestive:

- **Punishment is not Pain.** Pain is a separate chemical that produces immediate sensory and behavioural responses (wince, scream, drop-held-object via involuntary actions, drive-bar increase). Punishment chem 205 has none of these effects; it is purely a signal to the dendrite-weight loop. A creature can be punished without feeling pain (e.g. a verbal "no") and can feel pain without being punished (e.g. an injury from terrain, if the genome doesn't wire that to chem 205). The two signals frequently co-occur in slap stimuli, but they are independent in the engine.
- **Punishment is not Fear.** Fear is a drive that biases the creature toward retreat; Punishment is a learning signal that weakens specific dendrite weights. A high Fear without a Punishment pulse trains nothing — it just makes the creature run away in the moment. A Punishment pulse without a Fear nudge leaves the creature outwardly unaffected but quietly weakens its tendency to repeat the just-made decision.
- **Punishment is not the absence of Reward.** Failing to pat a creature is not Punishment; it is merely the absence of Reward, which leaves dendrite weights to drift through their natural decay and STW→LTW migration. Punishment is an *active* opposing force, not the null state.
- **Punishment is not retroactive.** Like Reward, the chemical's 1-tick half-life means it can only train the decision currently winning when the pulse arrives. Slapping a creature several seconds after its bad behaviour de-trains whatever it is doing *now*, which is usually not the bad behaviour. This is the most common cause of "the creature isn't learning" complaints from new players, and is symmetric with the equivalent issue for Reward.
- **Punishment is not used for long-term memory directly.** The chemical de-reinforces the *short-term* dendrite weight (`WEIGHT_SHORTTERM_VAR`). The migration from short-term to long-term is governed by `STtoLTRate`, which moves a small fraction of STW into LTW each tick. A single Punishment pulse therefore produces a transient STW dip that converts into a much smaller, but persistent, LTW change over many ticks. A truly entrenched aversion requires many Punishment pulses for the same decision over time.
- **Punishment is not modulated by emotion.** Unlike Adrenalin, Punishment has no upstream modulators. The chemical's level is exactly what was injected, minus its decay. A scared creature and a calm creature receive identical chem 205 pulses from identical slaps, and their brains de-train at identical per-pulse magnitudes. (The *consequences* of the de-training may differ because the underlying decision weights differ, but the per-pulse delta is the same.)
- **Punishment is not pulsed by any reaction.** The 101 stock reactions do not produce chem 205 (verified by direct search of `biochemistry.json` — chem 205 appears only in the half-life table). The chemical is exclusively script- and stimulus-driven.

### Modding affordances

Punishment has the same clean extension surface as Reward, with a few asymmetric possibilities arising from its negative-rate convention:

- **Add a metabolic Punishment source.** A modded reaction `Toxin → Toxin + Punishment` would let a creature punish its own brain when it accumulates poison — turning Punishment from a purely external bus into a partial-feedback bus. The creature would then learn aversion to whatever it was doing when the toxin level rose, without needing the player to slap it.
- **Add a hazard emitter.** An emitter that writes chem 205 in proportion to high body temperature would make creatures self-train to avoid hot environments. An emitter on an injury sensor would make them self-train to avoid the cause of injury. The flexibility is identical to Reward's, just with the opposite sign convention.
- **Redirect specific tracts off the Punishment bus.** Editing a tract gene to issue `setPunishmentChemicalIndex(N)` for a different N peels that tract off the universal Punishment bus and onto its own private chemical. A modder could give the noun→comb tract a different punishment chemical from the verb→decn tract, decoupling "association de-reinforcement" from "decision de-reinforcement".
- **Repurpose the slot for an unrelated chemical.** Because the engine doesn't hard-code chem 205, a modder can rename the slot in `ChemicalNames.catalogue`, repurpose it as e.g. an "anti-endorphin" or "shame" chemical, and rewire all tract genes to use a different index for de-reinforcement. The engine is agnostic to which slot carries the de-reinforcement signal.
- **Add a positive punishment rate (anti-pattern).** A modder who configures `setPunishmentRate(+0.1)` turns chem 205 into a second Reward bus. The engine has no enforcement of the "punishment must be negative" convention, so the resulting creature would experience slaps as additional pats — reinforcing the very behaviour the player was trying to discourage. This is a real risk in genome experimentation and is a useful debugging cue: a creature that *learns from slaps to repeat the slapped behaviour* is most likely a victim of a positive punishment rate somewhere in its tract opcode list.
- **Add stimulus-specific Punishment magnitudes.** Each `G_STIMULUS` gene can deliver a different chem 205 amount in its `chemicalsToAdjust[4]/adjustments[4]` pair. A modder can therefore make "being attacked by another creature" a much bigger Punishment pulse than "verbal no", or fine-tune "physical slap" relative to "linguistic no".

### Practical consequences for gameplay

- **Slapping de-trains the most recent decision.** Because of the 1-tick half-life and the per-tract loop, a slap at tick T de-trains the dendrites of every winning neuron at tick T (or T+1 at most). Players who slap the creature *while it is doing the undesired thing* train it correctly; players who slap *afterwards* train against the wrong thing. This is symmetric with the Reward timing issue and is the second most common cause of "the creature isn't learning" frustration.
- **Verbal "no" is just as effective as a slap.** Both go through the same chem 205 pulse via different stimuli. A player who finds slapping cruel can de-train a creature equally well by typing "no" while pointing at it. The chemistry is identical at the brain level; only the accompanying drive nudges differ (the slap typically also pulses Pain, the verbal "no" does not).
- **Excessive punishment can paralyse a creature.** Because chem 205 saturates STW at -1 and the negative weights propagate to LTW as inhibitory connections, a creature that is repeatedly punished for many decisions can develop a brain in which most decisions are actively suppressed. The result is a creature that does very little, because every winning candidate decision has been driven into the negative weight band. The fix is to alternate Punishment with Reward for desired alternative behaviours, so that the creature has *something* to fall back on.
- **Punishment without an alternative does not produce the behaviour you want.** Slapping a creature for eating a particular plant teaches it not to eat that plant, but if no other food source has been Reward-trained, the creature will simply keep eating it (because Hunger drive eventually overcomes the de-trained decision) or starve. Effective negative training in stock C3 is almost always paired with positive training of the desired alternative, and a creature trained only with slaps tends to become passive rather than corrected.
- **Watching chem 205 in the Science Kit diagnoses negative training.** A creature that is not learning aversion despite player slapping will show a flat zero on the chem 205 graph — the stimulus library failed to wire the slap to chem 205. A creature that becomes inappropriately fearful or passive will show frequent chem 205 spikes — possibly a hostile sibling delivering aggression stimuli, or a modded stimulus gene with an over-tuned chem 205 amount. The chemical's graph is the fastest way to diagnose the producer side of the negative-reinforcement pipeline; the dendrite-weight visualiser in the brain debugger is the fastest way to diagnose the consumer side.
- **Combat between creatures de-trains both.** When two creatures fight, each delivers `STIM_HIT` / `STIM_AGGRESSION` to the other, each with a chem 205 payload. The result is that *both* creatures' brains de-train whatever decision they were just making — typically "approach the other creature". Over time, a pair of creatures that fights repeatedly will mutually train themselves to avoid each other, even without player intervention. This is the engine's emergent solution to chronic conflict.

### JS port notes

The Rebuild treats chemical 205 as an ordinary bloodstream chemical with no special-case handling, in line with the engine-agnostic design and exactly mirroring the Reward port:

- **No `CHEM_PUNISHMENT` constant.** The chemical is referenced numerically by genome data only. There is no engine-level enum entry for chemical 205, no special path, no built-in producer or consumer hook beyond the SVRule opcode 62 that any tract can configure.
- **The `pointerToChemicals` reference must be live.** `Tract.js:554-558` reads `this.pointerToChemicals[this.punishment.getChemicalIndex()]` directly. The same memory must be the `Biochemistry.myChemicalConcs` array that `CHEM 205` and stimulus chemical adjustments write into. Any port-side bug that copies the array (rather than aliasing it) will silently break all de-reinforcement — pulses written by stimuli will not be visible to the tract reads. This is the same memory-aliasing invariant flagged for Reward and for the navigation drives.
- **The decay must apply to chem 205 every tick.** `Biochemistry.update()` walks all 256 chemical slots and applies each chemical's individual decay rate per `biochemistry.json`. Chem 205's rate of 0.62713226 must be applied every biochemistry tick. An off-by-frequency bug here would make Punishment either far too persistent (de-training persists across many decisions, producing the paralysis effect described above) or far too transient (de-training never reaches a tract that runs after the chemical has already decayed).
- **The clamp `[-1, +1]` in `reinforceAVariable` is critical.** `Tract.js:74-82` calls the bounded clamp on the result. Skipping the clamp would let dendrite STW weights run to negative infinity over repeated punishment, which would then propagate to LTW and corrupt the brain's normalised competition with arbitrarily large negative weights.
- **`processRewardAndPunishment` must run on every dendrite of every winning neuron, not on every dendrite.** The early-exit on `dstOutput === 0` (`Tract.js:535-538`) is the second filter that focuses learning. A port that drops this check would de-reinforce *every* dendrite on every Punishment pulse, collapsing the brain's discrimination between winning and losing decisions and making every slap broadly damaging to all of the creature's learned associations.
- **The order of Reward then Punishment within a single call is observable.** `Tract.js:546-559` processes Reward first, then Punishment, on the same STW value. If both are non-zero on the same tick, the final STW depends on the per-step clamps, not just the sum of the two adjustments. A port that aggregates them into a single delta would lose this behaviour and would diverge from the original engine on combined-stimulus events.
- **The `IsSupported()` early-exit must respect the `setDendritesSupportFlag` set by SVRule opcode 62.** `Tract.js:530-532` exits if neither reward nor punishment is supported. The flag is only set true by opcode 59 / 62 in `SVRule.js`. A port that defaults the flag to true would have every tract attempt to de-reinforce, even those whose genome did not configure a chemical index — leading to reads of chem 0 ("(none)"), which is always 0 and therefore always below threshold, so no actual harm, but a visible performance regression on every brain tick.
- **The chemical decay floor must be 0.** Punishment levels can never go negative; `Biochemistry.adjustChemicalLevel(205, -Δ)` must clamp to 0, not produce a negative level. A negative level passed through `level > threshold` (with threshold 0) would *not* trigger the branch, so the damage is contained to the producer side — but a non-zero negative level used elsewhere (e.g. by a CAOS read) would be misleading.

The most likely class of port bug specific to Punishment is the same memory-aliasing mismatch flagged for Reward, plus one Punishment-specific risk: **an accidental swap of opcodes 59 and 62 in the SVRule handler table** would route Punishment-rate writes into the Reward struct (turning slaps into pats) and vice versa. The two handlers sit on adjacent opcodes by design, which makes a copy-paste error easy. The fix is to verify, on first-creature creation in the rebuild, that a tract initialised with `setPunishmentChemicalIndex(205)` reports `myPunishment.chemicalIndex == 205` and `myReward.chemicalIndex == 204` (or the tract's individual reward index), not the other way around.

### Summary

```
   Player slaps creature hand (or says "no", or another creature attacks, etc.)
                       │
              Stimulus pipeline:
              SensoryFaculty.stimulate(STIM_POINTERSLAP / STIM_POINTERNO / STIM_HIT / etc.)
                       │
                       ▼
              Genome G_STIMULUS entry's chemicalsToAdjust[]:
              chemicalsToAdjust[i] = 205, adjustments[i] = +Δ
              (often paired with Pain/Anger/Fear drive nudges)
                       │
                       ▼
              Biochemistry.adjustChemicalLevel(205, +Δ)
              myChemicalConcs[205] += Δ (clamped 0..1)
                       │
                       ▼ (next biochem tick = next brain tick)
              Brain.update() walks each tract:
                Tract.processRewardAndPunishment(d) for every dendrite
                  if punishment.supported && d.dstNeuron.OUTPUT_VAR > 0:
                    level = pointerToChemicals[punishment.chemicalIndex] ← chem 205
                    if level > punishment.threshold:
                      d.weights[STW] = clamp(d.weights[STW]
                                              + punishment.rate × (level − punishment.threshold),
                                            -1, +1)
                      // punishment.rate is conventionally negative,
                      // so the addition reduces STW
                       │
                       ▼ (subsequent ticks)
              STW → LTW migration via STtoLTRate
              Long-term aversion encoded in dendrite long-term weights
              (negative LTW = inhibitory synapse — actively suppresses the decision)
                       │
                       ▼ (next biochem tick)
              Chemical 205 decays by × 0.62713226 → ~62 % → ~39 % → ~0 %
              within ~10 biochem ticks (~0.33 s at 30 tps)
                       │
                       ▼
              The single pulse is gone; the lesson it produced lives on
              in the weakened (or negative) dendrite weights of the just-won decision.

   Punishment [205] is the per-tract negative-reinforcement bus:
     - No biochemistry producer in the stock genome (CAOS + stimuli only)
     - Read by Tract.processRewardAndPunishment on every brain tick
     - Per-tract chemical index configurable via SVRule opcode 62
     - Per-tract threshold (opcode 60) and rate (opcode 61, conventionally negative)
       tune sensitivity and gain
     - Decays in 1 tick (genomeValue 4, "Very short") — single-tick spike
     - Weakens dendrite STW weights of every winning neuron's dendrites,
       can drive them into the negative band (active inhibition)
     - Antagonist of Reward [204] which uses the same equation with
       opposite sign rate
     - Driven primarily by genome stimulus library (POINTERSLAP, POINTERNO,
       HIT, AGGRESSION, CREATUREAGGRESSION, …) and by direct CAOS
     - The fundamental aversion-learning signal of the Creatures brain
```

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:283` — chemical 205 named `"Punishment"`
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:282` — chemical 204 named `"Reward"`, the antagonist slot
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9160-9167` — half-life entry: genomeValue 4, halfLifeInTicks 1, decayRate 0.62713226, speed "Very short"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — verified: no receptor, no emitter, no reaction, and no neuroemitter has chemical 205 as either input or output. The chemical is invisible to organ-level biochemistry (chem 205 appears only at the half-life table line 9161 in the entire JSON)
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:529-560` — JS port of `processRewardAndPunishment`, with sequential reward-then-punishment branches preserving the original ordering
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:1-85` — JS port of `ReinforcementDetails` class, including `reinforceAVariable` formula and the `setDendritesSupportFlag` alias
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:96-101` — JS opcode constants `SET_REWARD_THRESHOLD`, `SET_REWARD_RATE`, `SET_REWARD_CHEMICAL_INDEX`, `SET_PUNISHMENT_THRESHOLD`, `SET_PUNISHMENT_RATE`, `SET_PUNISHMENT_CHEMICAL_INDEX`
- `Rebuild/Main_Game/src/engine/creature/brain/SVRule.js:586-606` — JS handlers for the six reinforcement opcodes
- `Rebuild/Main_Game/src/engine/creature/perception/PerceptionConstants.js:80-127` — `BuiltInStimuli` enum including `POINTERSLAP`, `POINTERNO`, `HIT`, `AGGRESSION` and the other Punishment-payload stimuli
- `Rebuild/DOCUMENTATION/articles/game-systems/creatures/pat-slap-stimulus.md` — full walkthrough of the slap → stimulus → chemical → tract pipeline; the canonical Punishment delivery path
- `Rebuild/DOCUMENTATION/articles/game-systems/stimulus-system.md` — broader stimulus architecture; sections covering reward / punishment mapping
- `Rebuild/DOCUMENTATION/chemicals/204 - Reward.md` — sibling doc on the antagonist positive-reinforcement chemical; same equation with opposite sign by convention. This document and that one form a matched pair and should be read together
- `Rebuild/DOCUMENTATION/chemicals/198 - Brain chemical 1.md` — sibling doc on the disappointment chemical at slot 198; same producer/consumer asymmetry pattern, same brain-bus design
- `Rebuild/DOCUMENTATION/chemicals/199 - Up.md` — sibling doc on the navigation drives; the "no biochemistry producer in stock genome, agent-layer pulse only" architectural pattern is identical
