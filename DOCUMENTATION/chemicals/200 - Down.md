# 200 - Down

**Down** is the second of the five **navigation drives** that occupy chemical slots 199–203 in the C3 / Docking Station genome — the cluster `Up [199]`, `Down [200]`, `Exit [201]`, `Enter [202]`, `Wait [203]` that the chemical-names catalogue groups under the comment `# navigation drives` (`Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32, 277-281`). Functionally Down is the **vertical-descent counterpart of Up**: a drive chemical bound to a single Drives-tissue receptor, with the same threshold-0 / gain-255 saturating profile, the same "Short" half-life, and the same complete absence of biochemistry-side producers in the stock genome. Where Up signals "I am too low — I should ascend", Down signals "I am too high — I should descend"; the two chemicals are conceptual opposites that share a receptor architecture and timing profile, but they do *not* annihilate each other in chemistry — both can be saturated simultaneously, with the brain disambiguating purely through trained `driv→comb` associations.

The drive bar that Down feeds is, following the same convention used by Up, **named for the felt state rather than the action**. `Rebuild/Assets/Catalogue/Brain.catalogue:96` calls drive neuron 16 `"high up"` — meaning a creature with a high Down chemical level **feels high up**, and is biased by its decision-lobe network toward whatever concept neurons it has learned to associate with descent: lifts going down, ladders, climbing-down poses on stairs, jumping-off animations, the hand-of-help "put me down" gesture. The chemical is the urge; the drive bar is the discomfort; the action is whatever the comb→decn associative network has been Hebbian-trained to deliver.

A small but interpretively important quirk appears in the receptor catalogue at `biochemistry.json:3655-3673`: the receptor's `locusName` field reads `"Up"` even though it writes to **drive locus 16**, not 15. This is a misleading internal label — the field is a debug string, not the actual binding. The genuine binding is `locus: 16, chemical: 200`, which lines up with the brain catalogue's drive-bar 16 = `"high up"`. Builders reading the JSON should trust the numeric `locus` and `chemical` fields and the Brain.catalogue drive-bar names; the `locusName` strings on the navigation-drive receptors appear to have been copy-paste artefacts in the source catalogue file.

Down's position in the chemical-decay table (`biochemistry.json:9120-9127`) marks it as a **Short**-speed chemical: genomeValue 38, half-life 43 ticks (~1.43 seconds at 30 tps), decay rate 0.98399 per tick. This is the same decay profile shared by all five navigation drives, and it places Down squarely in the "fast-fading urge" regime. A pulse of Down that is not topped up will fall by half in ~1.4 seconds and be effectively gone in under 10 seconds. Down is therefore a **moment-to-moment pull** rather than a slowly-accumulating need: agents that want a creature to *keep* wanting to descend have to keep pulsing the chemical.

The defining structural fact about Down — as with Up — is that **the stock genome contains zero biochemistry for it**. There are no emitters writing into chemical 200 (the genome's emitters table at `biochemistry.json:7076` lists 43 emitters, none targeting slots 199–203). There are no reactions producing it (101 reactions, none with chem 200 as a product). There are no reactions consuming it. No neuroemitter writes into it. There is no initial-concentration entry, so a hatched Norn is born with Down = 0. The chemical reaches the bloodstream **only via CAOS** — through `CHEM 200 <amount>` from agent scripts (descending lifts, the hand-of-help "set down" gesture, falling-from-height detectors, climbable-down agents, debug toys), through `ALTR` adjustments, or through modder-added stimulus genes that pulse it on success/failure events. The receptor at the other end is fully wired and functional from Baby; the producer side is left entirely to the agent layer of the game.

This producer/consumer asymmetry is what makes Down a **hook the agents use to talk to the creature's decision lobe about descent**. A descending-lift script that wants the creature to learn "this lift is what I use when I want to go down" pulses chem 200 just before or during the ride; the brain's `driv→comb` tract picks up the now-elevated Down drive co-activating with whatever concept the creature is currently attending to, and the resulting Reward / Punishment signals from successful arrival reinforce a drive→concept association. Over many descents the creature learns: "when I feel high up (Down drive high), the lift / ladder / hand is what I want."

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **No biochemistry emitter in the stock genome** | — | — | The genome's emitter table lists 43 emitters and **none target chemical 200**. There is no `LOC_*` reproductive, sensorimotor, temperature, or altitude locus that pulses Down. The chemical is not produced by any organ-locus reading | — |
| 2 | **No reaction product in the stock genome** | — | — | The 101 reactions in the genome do not produce chemical 200. No metabolic, hormonal, immune, or toxin pathway converts another chemical into Down. The chemical has no chemistry-side birth | — |
| 3 | **No neuroemitter in the stock genome** | — | — | The single stock neuroemitter (gene 1, lobe `move` neuron 37) writes Adrenalin [117], Fear [158], Crowded [157]. **No brain neuron emits into the navigation drives**. The brain cannot raise its own Down urge from cognitive activity alone | — |
| 4 | **No initial concentration** | — | — | Chemical 200 is absent from the genome's `initialConcentrations` table. A newly-hatched creature is born with **Down = 0** and stays at 0 for life unless a CAOS-side or modder-side mechanism injects into the chemical | — |
| 5 | **Direct CAOS injection — the primary stock mechanism** | `CHEM 200 <amount>` from agent scripts and event handlers | Creature / bloodstream (systemic) | The CAOS `CHEM` command on a targeted creature writes a delta into `myChemicalConcs[200]` via `Biochemistry.adjustChemicalLevel(200, amount)`. Descending lifts, ladders, climb-down hooks, the hand-of-help "set down" gesture, height-detector ecological agents, and any modder-built descent aid all use this path | One-shot per script invocation |
| 6 | **`ALTR` chemical adjustment** | `ALTR 200 <amount>` | Creature / bloodstream | The CAOS `ALTR` command performs a clamped adjustment to chemical 200. Functionally identical to `CHEM` for the purposes of the drive bar | One-shot per call |
| 7 | **Modder-added stimulus genes** | Custom `G_STIMULUS` entries with chemical 200 in `chemicalsToAdjust[4]` | Creature / bloodstream (systemic) | A modder adding a `STIM_NEED_TO_GO_DOWN` (or repurposing an existing low-frequency stimulus) can pulse Down alongside other chemicals when their event fires. The pipeline is identical to the disappointment pipeline used by Brain chemical 1 [198] | One-shot per stimulus event |
| 8 | **Modder-added emitter genes** | Custom `G_EMITTER` reading some sensorimotor locus and writing chemical 200 | Creature / Drives or modder-defined tissue | Genetic engineers wanting endogenous Down can wire an emitter on a yet-unused locus that scripts populate with the creature's vertical position relative to a "home altitude". The emitter then pulses Down whenever the creature is above its home, completing — together with a symmetric Up emitter — a true two-axis homing-altitude drive | Gene-dependent rate |
| 9 | **Modder-added reactions** | Custom reactions with chemical 200 as a product | Creature / bloodstream | A mod can plumb Down into the wider chemistry — e.g. `Hotness + high-altitude marker → Down + Hotness` so heat + altitude produces a downward urge (cf. heat rises so hot air is "up there"). None of this exists in stock C3 | Gene-dependent |

The single most important consequence of points 1–4 is that **the stock genome's Down drive is purely script-driven**. A creature in a world with no agents that pulse chem 200 will never have a non-zero Down drive, and the drive 16 neuron will sit at zero forever — not because the wiring is broken, but because nothing is delivering input.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **Drives-tissue "Drive 16" receptor — the sole stock consumer** | Gene 154 (receptor id 17) | Creature / Drives (tissue 5) | Locus 16 (`locusName` field reads `"Up"` in `biochemistry.json:3665` — a copy-paste artefact; the authoritative drive-bar name from `Brain.catalogue:96` is **`"high up"`**), chemical 200 "Down", threshold **0**, nominal **0**, gain **255 (maximum)**, analogue, flags 0, **switchOnAge 0 (Baby)** | Reads chemical 200 from the bloodstream and writes the gained level to `myDriveLoci[16]`. With threshold 0 the receptor responds linearly to any level above zero; with gain 255 (maximum) even a small chem 200 level produces a saturated drive-bar reading. The drive locus is then read every brain tick by `SensoryFaculty.updateDriveLobe()` which calls `brain.setInput('driv', 16, creature.getDriveLevel(16))`. The driv lobe's neuron 16 — labelled `"high up"` in `Brain.catalogue:96` — is the cognitive representation of the urge to descend |
| 2 | **`driv→comb` tract — concept association** | Genome's tract gene for `driv→comb` (associative tract from drive lobe to combination/concept lobe) | Brain / `driv→comb` tract | Drive 16's neuron state propagates along all dendrites of the `driv→comb` tract. Whichever concept neurons are co-firing have their dendrite weights updated by the standard Hebbian / Reward / Punishment loop. This is how Down becomes associated with specific learned objects — descending lifts, ladders, slides, jump-down ledges | Drives the cognitive learning that ties the **feeling** of being "high up" to the **objects** that historically resolved it |
| 3 | **`comb→decn` and `decn` selection — verb selection** | Stock decision-lobe wiring | Brain / decision lobe | The decision lobe reads concept-neuron activity weighted by the trained drive→concept dendrites and selects a verb. There is **no dedicated "Down" verb** in the 14-action decision-lobe catalogue (`Brain.catalogue:102-115`: look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit). High Down therefore does not produce direct downward locomotion; it produces a bias toward verbs the creature has learned co-occur with descent — most commonly **approach** on a descending lift agent, **push** on a "down" call button, or **deactivate** to climb off something | The drive does not control motor output directly; it modulates *what the creature wants to interact with* via the trained associative network |
| 4 | **No involuntary-action receptor** | — | — | Unlike Pain, Coldness, Hotness, or Sex drive, **Down has no sensorimotor receptor**. The chemical does not trigger reflex animations, automatic gait changes, or any direct motor output. Its effect is purely cognitive | — |
| 5 | **No reactions consume Down** | — | — | Chemical 200 does not appear as a reactant in any of the genome's 101 reactions. There is no antagonist (no chemical that destroys Down the way Libido lowerer destroys Sex drive), no metabolic conversion, **no annihilation pairing with Up [199]** — the four directional drives do not cancel each other in chemistry, only in behaviour-selection at the brain | — |
| 6 | **No active → backup sweep** | — | — | The drive-pair sweep+drip pattern used by drives 0–14 (each main drive drains into a backup chemical at slots 131–145 and trickles back) is **entirely absent for navigation drives**. There is no "Down backup" chemical at all — the navigation drive cluster ends at chemical 203, and no reservoir chemicals exist for them. The drive has no chemical memory beyond its own decay | — |
| 7 | **Passive decay** | Half-lives table entry for chemical 200 | Bloodstream | genomeValue **38**, half-life **43 ticks** (~1.43 s at 30 tps), decay rate **0.98399** per tick, speed class **"Short"** | Chemical 200 falls to half its level every ~43 ticks. Without continuous re-pulsing, an injection of `CHEM 200 100` decays to ~50 in 1.4 s, ~25 in 3 s, ~12 in 4.5 s, < 1 in ~10 s. This is the fastest decay tier of any drive chemical — Down therefore does not accumulate over time the way Loneliness or Boredom do; it is a **per-event urge** |
| 8 | **No emitter consuming Down** | — | — | No emitter reads chemical 200 to drive a sensorimotor output or another chemical. The chemical's only forward path is through the drive-bar receptor | — |
| 9 | **CAOS reads** | `CHEM 200` query, `DRV!` (driveset), drive-monitor agents, Science Kit chemistry graphs | Creature / bloodstream | Any CAOS script can read the current chemical 200 level and the drive-16 level, allowing agents to react to a creature's Down urge — e.g. a smart descending-lift that auto-summons when nearby creatures have high Down drive, or a teaching toy that pings Reward when Down is pulsed and the creature is correctly approaching a descent agent | Read-only — the creature's behaviour is unchanged by the read |

## Role in Game Mechanics

### The "drive name vs chemical name" inversion

The same convention used for Up applies to Down: the chemical name describes the *direction the creature wants to travel*, while the drive-bar name describes the *feeling the creature has* that motivates the travel:

- `ChemicalNames.catalogue:278`: chemical 200 = `"Down"` — named for the **direction the creature wants to travel**.
- `Brain.catalogue:96`: drive 16 = `"high up"` — named for the **feeling the creature has** when the chemical is high.

A creature with `chem[200] = 200` has its Drive 16 receptor produce ~255 (gain 255 amplifies any non-trivial level), which the `driv` lobe interprets as the feeling "I am high up — I should not be here". The directional verb in the chemical name describes the *resolution*: get down, descend, climb down. Together with Up the cluster forms a vertical-axis pair where each chemical names the desired travel direction and the corresponding drive bar names the felt position:

| Chem | Chemical name | Drive 15-19 brain name | Meaning |
|------|--------------|--------------------------|---------|
| 199  | Up           | low down                 | "I am too low — I should ascend" |
| 200  | Down         | high up                  | "I am too high — I should descend" |
| 201  | Exit         | trapped                  | "I feel enclosed — I should leave" |
| 202  | Enter        | trapped                  | "I feel exposed — I should enter shelter" |
| 203  | Wait         | patient                  | "I feel restless — I should remain still" |

### Why Down has no biochemistry-side producer

The same architectural reasoning that motivated leaving Up purely script-driven applies symmetrically to Down:

1. **Altitude is not a chemical fact.** A real organism has no body sense for "I am too high above a goal"; it has body senses for fatigue, fear, and motion sickness. The genome can express the latter but not the former. The C3 designers therefore left the altitude-relative-to-goal axis to the agent layer that *does* know the world's altitudes.
2. **The world is the source of truth.** Different worlds have different vertical mechanics — the C3 ship's lifts, the Norn Terrarium's tree branches, modded jet-pack worlds, the underwater SeaLift. Encoding any one world's vertical semantics in the genome would make the genome non-portable.
3. **Symmetry with Up keeps the design clean.** Up and Down share decay, gain, threshold, switchOnAge, tissue, and the absence of producers. The five navigation drives are a coherent block with one consistent design rule: *receptor wired from Baby, biochemistry left to agents*.
4. **The receptor side is universal.** Every Norn, Grendel, and Ettin in the stock genome has the Drive 16 receptor wired identically from Baby. Whichever world a creature finds itself in, *if* an agent in that world pulses chem 200, the creature will respond in the same way — feel "high up", learn the association with the agent, and seek the agent again next time.

### How Down gets pulsed in the stock world

Concretely, in the C3 ship and the DS subnet, the Down drive is pulsed by descent-related CAOS script paths:

1. **Lift call buttons (down direction).** The `Lifts.cos` family of agents (`Rebuild/Assets/Bootstrap/001 World/Lifts.cos`) provides physical lifts whose call buttons can pulse chem 200 on a Norn that is on an upper floor. Arriving at the lower floor stops the pulsing; leftover chemical decays over ~10 s.
2. **Ladders / climb-down agents.** Climbable agents that face downward pulse chem 200 while the creature is at the top.
3. **The hand-of-help "set down" gesture.** When the player picks up a creature on a high platform and the creature wants to be put down, hand-of-help scripts can pulse Down so the experience associates with the urge that gets resolved when the player obliges.
4. **Falling / jump-down / slide agents.** Slides, fireman's poles, falling-leaf platforms, and similar one-way descent toys pulse chem 200 to teach the creature that they are how to come down.
5. **Modder-added vertical agents** — parachutes, glide-down slings, drop-shafts — all use the same `CHEM 200` injection pattern.

The reinforcement cycle mirrors Up's: agent pulses Down, brain feels "high up", creature attends to the descent agent, `driv→comb` strengthens the dendrite from drive-16 to the descent-agent concept, the agent stops pulsing on goal completion and pulses Reward to lock in the lesson. Bugs in agent timing produce the same misbehaviours as for Up — a forgotten "stop pulsing on arrival" creates a never-satisfied drive that teaches the wrong lesson.

### Wiring detail of the receptor

The exact receptor entry from `biochemistry.json:3655-3673`:

```json
{
  "id": 17,
  "geneId": 154,
  "switchOnAge": 0,
  "switchOnStage": "Baby",
  "organ": 1,
  "organName": "Creature",
  "tissue": 5,
  "tissueName": "Drives",
  "locus": 16,
  "locusName": "Up",
  "chemical": 200,
  "chemicalName": "Down",
  "threshold": 0,
  "nominal": 0,
  "gain": 255,
  "flags": 0,
  "flagsDescription": "none"
}
```

Three fields matter for behaviour:

- **`threshold = 0`**: the receptor fires for any chem 200 > 0. There is no minimum activation level. Even a small leftover decay tail still drives Drive 16 a little.
- **`nominal = 0`**: the drive's "satisfied" baseline is zero chemical. The drive is satisfied only when chem 200 is fully gone. There is no homeostatic setpoint above zero — Down is purely a "presence-of-need" signal.
- **`gain = 255`**: the maximum possible gain. With `flags = 0` (analogue) the reading is `clamp(255 × chem, 0, 255)`, which saturates at chem 200 ≈ 1 (out of a 0–255 range). A `CHEM 200 1` write is enough to fully saturate the drive bar; `CHEM 200 200` does not produce any more drive than `CHEM 200 1` — the receptor is at ceiling for any non-trivial level.

The `locusName` field's stale `"Up"` string is a debug-only label and is overridden in any UI that loads `Brain.catalogue` (which gives drive 16 its real name `"high up"`). Ports must read the *numeric* `locus: 16` field, not the string.

The implication is the same as for Up: **Down is a binary-feeling drive** at the receptor side — either silent (chem 200 = 0) or fully on (chem 200 ≥ 1). The chemical's *quantitative* level affects only how long the drive stays active before decay drops it back to zero. A bigger pulse = longer-lasting urge.

### Why "Short" half-life matters

The 43-tick half-life (~1.4 s at 30 tps) makes Down a **per-event, ~10-second urge**:

- A `CHEM 200 100` injection is at ~50 after 1.4 s, ~25 after 3 s, ~12 after 4.5 s, ~6 after 6 s, ~3 after 7 s, < 1 after ~10 s.
- Throughout the first ~7 seconds the chemical is still > 1 and the receptor is saturated at gain 255 — Drive 16 stays at ~255.
- After ~10 seconds the chemical falls below the receptor's effective saturation level and Drive 16 declines meaningfully.
- The "felt" duration of one Down pulse is therefore on the order of 10 seconds — long enough for a typical descending-lift ride to play out, short enough that the drive does not linger after arrival.

This is the same timing curve as Up; the symmetry is intentional, so that the two opposite drives have identical responsiveness.

### The "no Up–Down annihilation" property

A natural intuition would be that Up and Down should annihilate each other — that being high (Down active) and being low (Up active) cannot both be true at once. The stock genome **does not implement this**. There is no reaction `Up + Down → 0` (verified by absence in the 101-reaction table), and the two drive bars can both saturate simultaneously if two different agents happen to pulse both chemicals at the same time. The brain does not get confused by this directly — it simply has both drives reading 255 at the decn lobe, and decision-making proceeds on whichever concept neuron is most strongly co-activated by *any* drive-to-concept dendrite.

The behavioural disambiguation is therefore left to:

1. **Agent author discipline.** The C3 lift scripts pulse only Up *or* Down at any given moment, never both, because no real-world situation demands both.
2. **The trained `driv→comb` network.** Different concepts are typically associated with different drives, so the dominant concept-lobe activation will reflect whichever drive has more strongly-trained dendrites at that moment.
3. **Decay.** Both drives fall fast, so any spurious co-activation is short-lived.

A modder wanting strict Up/Down exclusion can add a reaction `Up + Down → Down` (or vice-versa) to a custom genome; the chemistry pipeline supports it, the stock genome simply doesn't include it.

### Reinforcement learning and Down

Because Down has no biochemistry-side feedback, the drive **does not learn to satisfy itself the way the metabolic drives do**. The lesson loop is identical to Up's:

1. Descent script writes `CHEM 200 100` when the creature is on a high platform near the down-lift — Down drive rises.
2. Creature approaches lift; `driv→comb` Hebbian pass strengthens dendrite from drive 16 to lift concept.
3. Lift carries creature down; lift script stops pulsing chem 200.
4. Lift script writes `CHEM 204 50` (Reward) on arrival — the brain's `driv→comb` tract picks up the Reward pulse and applies a positive STW change to the just-strengthened dendrite, locking in the lesson.
5. Chemical 200 decays from its leftover level; within ~10 s the drive bar is back to zero.

The agent author is responsible for the timing of all four chemical pulses (Down, off-Down, Reward, off-Reward). Same failure modes apply: skipping the Reward weakens the lesson; failing to stop pulsing Down on arrival teaches "this lift did not satisfy my urge to go down" — exactly the wrong lesson.

### What Down is *not*

- **Down is not a brain chemical.** Despite sitting at slot 200, immediately adjacent to the brain-chemistry block (Reward 204, Punishment 205, Brain chemical 9 206), Down is a *drive* chemical. It is read by a Drives-tissue receptor, not by an SVRule operand in the brain. The chemical's effect on the brain is entirely indirect, through the drive-lobe input.
- **Down is not a verb.** The decision-lobe action catalogue has 14 verbs (look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit). There is no "go down" verb. The creature cannot decide "I will travel down"; it can only decide to approach a learned downward-travel object.
- **Down is not the chemical opposite of Up.** Although the two are conceptual opposites, the genome does **not** contain an annihilation reaction. High Up and high Down can co-exist in the bloodstream simultaneously — both drive bars will be saturated, and the brain will simultaneously feel "low down" and "high up". The behavioural disambiguation happens entirely in the trained `driv→comb` associations, not in chemistry.
- **Down is not used by the per-tract reward system.** The opcode-59 / opcode-62 mechanism (`SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`) reads chemicals 204 and 205. Chemical 200 plays no role in the generic reinforcement plumbing; it is a drive input, not a learning signal.
- **Down is not pulsed by any stock stimulus gene.** Unlike Brain chemical 1 [198] (pulsed by `STIM_DISAPPOINT`), Reward [204] and Punishment [205] (pulsed by all the success/failure stimuli), Down has *no stock stimulus producer*. The genome leaves the producer side entirely to the agent layer.

### Modding affordances

Down shares Up's clean extension-point profile because the producer side is empty:

- **Add a "homing-altitude" emitter.** A modded `G_EMITTER` reading the creature's current altitude (via a custom CAOS-managed locus) and writing chem 200 when altitude > home_altitude turns the agent-only Down drive into a true endogenous descent drive. Combined with a symmetric Up emitter, the creature gets a real two-axis altitude homing chemistry.
- **Add a "vertigo" stimulus.** A `STIM_HEIGHT_FEAR` gene that pulses chem 200 (and possibly Fear [158]) every few ticks while the creature is on a high platform would give the creature a slow-rising Down urge proportional to altitude exposure.
- **Wire navigation drives into the main reaction graph.** Modded reactions like `Hotness → Down` (heat rises so hot creatures want to descend), or `Up + Down → Down` (annihilation pairing — high-up wins out by default) fold the navigation drives into the chemistry network.
- **Add navigation backup chemicals.** Reserving five free slots can replicate the active/backup sweep+drip pattern from the main drive bank, giving the navigation drives chemical memory.
- **Repurpose the slot.** Because the chemical has no stock biochemistry, modders can repurpose chem 200 entirely (e.g. as a "groundedness" supplementary axis, a "low-altitude home" axis) without colliding with any stock receptor / emitter / reaction.

### Practical consequences for gameplay

- **Norns in barren worlds never feel "high up".** A Norn loaded into a custom world with no agents pulsing chem 200 will have Drive 16 = 0 forever, regardless of how high or exposed it is in physical reality. The drive is not a sense organ; it is a script-driven cue.
- **Creatures learn descent agents, not heights.** The Hebbian association is from drive-16 neuron to *concept* neurons (descending lift, ladder, slide, hand, etc.), not to *positions*. A Norn that has learned to ride down-lift A in room R will still need to learn down-lift B in room S separately, unless the two are categorised as the same concept.
- **Disabled descent scripts silently disable the drive.** If a world's down-lift agents fail to install, the Down drive stops being pulsed. There is no biochemistry redundancy to mask the loss — creatures simply never feel "high up" again.
- **Tools / debug toys can prime the drive directly.** A Science Kit or debug tool that writes `CHEM 200 100` to the selected creature provides a one-click way to test that the Drive 16 receptor and `driv→comb` learning are wired correctly. The drive bar should saturate within one tick and decay over ~10 s; the brain should accept the drive as input and bias decision-making toward whatever concepts the creature is currently attending to.
- **Watching chem 200 in Kits diagnoses the descent pipeline.** A creature in an active world should show occasional chem 200 spikes whenever a down-lift / ladder / slide pulses it. A flat-zero trace in a world that *should* be pulsing the chemical is a red flag that the descent agents have failed to install or that the creature's targeting mechanism is broken.

### JS port notes

The Rebuild port treats chemical 200 as an ordinary bloodstream chemical with no special-case handling, parallel to Up:

- **No `CHEM_DOWN` constant.** The chemical is referenced numerically by genome data only. There is no engine-level enum entry for chemical 200, no special path, no built-in producer.
- **The drive locus must be writable from the receptor.** `Rebuild/Main_Game/src/engine/creature/Creature.js:119` allocates `myDriveLoci` as a `Float32Array(NUM_DRIVES)` of size 20. The Drives-tissue receptor for chem 200 writes to `myDriveLoci[16]` via the standard receptor evaluator. `getDriveLevel(16)` returns this float, and `SensoryFaculty.updateDriveLobe()` propagates it to brain input `('driv', 16)`. Any port-side bug that mis-indexes drive locus 16 (off-by-one in the LOC_DRIVE0 base address) silently breaks the Down drive.
- **The decay must implement the "Short" half-life correctly.** Half-life 43 ticks, decay rate 0.98399, must be applied every biochemistry tick. Because the receptor saturates at very low chemical levels (gain 255), small numeric errors in the decay loop accumulate visibly in the drive bar.
- **`CHEM 200` and `ALTR 200` must reach the same `myChemicalConcs[200]` slot the receptor reads.** Standard `getChemicalConcs()` live-reference invariant.
- **The receptor's stale `locusName: "Up"` must not mislead the port.** The authoritative drive-bar name comes from `Brain.catalogue:96` (`"high up"`). Any UI that displays drive-bar names should ignore the `locusName` field from `biochemistry.json` for receptor 17 and use the catalogue value instead.
- **The drive 16 brain neuron's `"high up"` name is purely informational.** The brain catalogue's `"high up"` label is loaded from `Brain.catalogue` and used only for debug displays and Kits — the brain itself addresses the neuron by integer index 16. A port that fails to load the catalogue still has a fully-functional drive system; it just shows generic neuron numbers in the debug UI.

The most likely class of port bug specific to the navigation drives is **agent-side**: if the descent / down-lift / ladder scripts in the bootstrap COS files fail to install correctly, the chemical never gets pulsed and the drive never engages. The receptor side is straightforward and shares its evaluator with all other drive receptors, so receptor-side bugs would manifest in *all* drives, not just Down.

### Summary

```
   World event: creature on a high platform / near a descending lift
                       │
        Agent script: CHEM 200 +amount
                       │
                       ▼
       Biochemistry: myChemicalConcs[200] += amount (clamped to 0..255)
                       │
                       ▼ (every biochem tick)
       Drives receptor 17: myDriveLoci[16] := clamp(255 × chem 200, 0, 255)
                       │
                       ▼ (every brain tick)
       SensoryFaculty.updateDriveLobe: brain.setInput('driv', 16, drive[16])
                       │
                       ▼
       driv lobe neuron 16 ("high up") = saturated while chem > 0
                       │
                       ▼ (next brain tick, driv→comb tract runs)
       Hebbian pass: dendrites from drive-16 → currently-firing concepts
                     have their STW updated by Reward / Punishment levels
                       │
                       ▼ (after ~10 seconds without re-pulse)
       Chemical 200 decays past saturation level → drive bar falls →
       creature no longer feels "high up" — the urge has subsided

   Down [200] is the navigation drive for descent:
     - No biochemistry producer in the stock genome (CAOS-only inflow)
     - Single receptor at Drives locus 16, gain 255 (saturating)
     - Drive bar labelled "high up" in Brain.catalogue (drive 16)
     - Half-life 43 ticks ("Short") — pulse lasts ~10 seconds
     - Companion drives at 199, 201–203 (Up, Exit, Enter, Wait)
     - No dedicated verb — operates entirely via learned associations
       in the driv→comb tract
     - No annihilation reaction with Up — the two opposites can both
       be saturated simultaneously; behavioural disambiguation is
       brain-side via trained driv→comb associations
     - Agent-layer hook for teaching creatures to seek vertical-descent
       objects (down-lifts, ladders, slides, hands, parachutes, …)
     - One of five fully-script-driven drives, designed to be portable
       across worlds with different vertical-navigation mechanics
```

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32` — the `# navigation drives` comment placeholder block marking 199–203 as the navigation-drive cluster
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:277-281` — chemical 200 named `"Down"` in the main `chemical_names` array, in the Up/Down/Exit/Enter/Wait sequence
- `Rebuild/Assets/Catalogue/Brain.catalogue:79-100` — `"Creature Drives"` array; entry 16 is `"high up"`, the brain-side name for the drive bar fed by chemical 200
- `Rebuild/Assets/Catalogue/Brain.catalogue:102-115` — `"Creature Actions"` array; 14 verbs, **no Down verb**, confirming that the Down drive operates only via learned associations to existing verbs
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:3655-3673` — the Drive 16 receptor (id 17, gene 154) reading chemical 200 with threshold 0, nominal 0, gain 255, switchOnAge 0 (Baby); `locusName` field reads `"Up"` (stale debug string — the authoritative drive-bar name comes from `Brain.catalogue`)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9120-9127` — half-life entry: genomeValue 38, halfLifeInTicks 43, decayRate 0.98399, speed "Short"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:7076` — the genome's emitters table (43 entries); none target chemical 200
- `Rebuild/Main_Game/src/engine/creature/CreatureConstants.js:39-60` — `DriveOffsets` enum; the navigation drives occupy locus indices 15–19
- `Rebuild/Main_Game/src/engine/creature/Creature.js:119` — `myDriveLoci = new Float32Array(NUM_DRIVES)` allocation
- `Rebuild/Main_Game/src/engine/creature/Creature.js:1641-1646` — `getDriveLevel(driveIndex)` returns `myDriveLoci[driveIndex]`
- `Rebuild/Main_Game/src/engine/creature/Creature.js:247-275` — `LOC_DRIVE0`-based ref creation for biochemistry receptors writing into drive loci; the receptor for chem 200 lands here
- `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:351-357` — `updateDriveLobe()` propagates `myDriveLoci[16]` to brain input `('driv', 16)` every brain tick
- `Rebuild/Main_Game/src/engine/creature/faculties/MotorFaculty.js:842-856` — `getActionName()`; the 14-verb action catalogue; confirms the absence of a directional "Down" verb
- `Rebuild/Assets/Bootstrap/001 World/Lifts.cos` — the stock C3 lift agents; their down-direction scripts are the producer side of the Down drive in the stock world
- `Rebuild/Assets/Bootstrap/001 World/SeaLift.cos` — the underwater-lift companion to Lifts.cos; pulses Down on creatures riding the lift downward
- `Rebuild/DOCUMENTATION/chemicals/199 - Up.md` — sibling doc on the opposite navigation drive; identical architecture, opposite direction
- `Rebuild/DOCUMENTATION/chemicals/198 - Brain chemical 1.md` — adjacent-slot doc; chemical 200 sits immediately after Up [199] and shares its placement in the chemical bus, but operates on the same drive-receptor plumbing as Up rather than the brain-chemical plumbing of 198 / 204 / 205 / 206
