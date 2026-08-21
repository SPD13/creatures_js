# 201 - Exit

**Exit** is the third of the five **navigation drives** that occupy chemical slots 199–203 in the C3 / Docking Station genome — the cluster `Up [199]`, `Down [200]`, `Exit [201]`, `Enter [202]`, `Wait [203]` that the chemical-names catalogue groups under the comment `# navigation drives` (`Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32, 277-281`). Where Up/Down express the vertical-axis pair, Exit and Enter express the **enclosure axis**: Exit is the urge to *leave* a confined or unwanted space, Enter is the urge to *seek shelter*. Architecturally Exit is identical to its sibling drives — a single Drives-tissue receptor at locus 17, threshold 0 / gain 255 / nominal 0, "Short" half-life of 43 ticks, switched on at Baby stage, with **zero biochemistry-side producers** in the stock genome. The chemical exists only to be poked into the bloodstream by CAOS scripts and read out by the drive lobe; the rest of the chemistry network ignores it.

The drive bar that Exit feeds is, following the same convention used for the rest of the navigation block, **named for the felt state rather than the action**. `Rebuild/Assets/Catalogue/Brain.catalogue:97` calls drive neuron 17 `"trapped"` — meaning a creature with a high Exit chemical level **feels trapped**, and is biased by its decision-lobe network toward whatever concept neurons it has learned to associate with leaving: doors, exit portals, transporter call-buttons, the "go-outside" hand-of-help gesture, lift cars they can ride out, ship-segment teleporters. The chemical is the urge; the drive bar is the discomfort; the action is whatever the `comb→decn` associative network has been Hebbian-trained to deliver. There is **no dedicated "exit" verb** in the decision-lobe action catalogue (`Brain.catalogue:118` does list `"exit"` in the 17-entry "Creature Actions" array but the comment immediately above marks the last three entries as `# not used:` — they are catalogue placeholders that the stock decision lobe never selects).

A small but interpretively important quirk appears in the receptor catalogue at `biochemistry.json:3674-3692`: the receptor's `locusName` field reads `"Down"` even though it writes to **drive locus 17**, not 16. This is the same copy-paste artefact pattern seen on the Up and Down receptors (which carry stale `"Up"` and `"Up"` strings respectively) — the `locusName` field is a debug label, not the actual binding. The genuine binding is `locus: 17, chemical: 201`, which lines up with `Brain.catalogue:97`'s drive-bar 17 = `"trapped"`. Builders reading the JSON should trust the numeric `locus` and `chemical` fields and the Brain.catalogue drive-bar names; the `locusName` strings on the navigation-drive receptors are unreliable.

Exit's position in the chemical-decay table (`biochemistry.json:9128-9135`) marks it as a **Short**-speed chemical: genomeValue 38, half-life 43 ticks (~1.43 seconds at 30 tps), decay rate 0.98398825 per tick. This is the same decay profile shared by all five navigation drives, and it places Exit in the "fast-fading urge" regime. A pulse of Exit that is not topped up will fall by half in ~1.4 seconds and be effectively gone in under 10 seconds. Exit is therefore a **moment-to-moment pull** rather than a slowly-accumulating need: agents that want a creature to *keep* wanting to leave have to keep pulsing the chemical every second or two.

The defining structural fact about Exit — as with Up and Down — is that **the stock genome contains zero biochemistry for it**. There are no emitters writing into chemical 201 (the genome's emitters table at `biochemistry.json:7076` lists 43 emitters, none targeting slots 199–203). There are no reactions producing it (101 reactions, none with chem 201 as a product). There are no reactions consuming it. No neuroemitter writes into it. There is no initial-concentration entry, so a hatched Norn is born with Exit = 0. The chemical reaches the bloodstream **only via CAOS** — through `CHEM 201 <amount>` from agent scripts (door agents, room-bounded spaces, "you don't belong here" scripts, dangerous-environment detectors, hand-of-help gestures), through `ALTR` adjustments, or through modder-added stimulus genes that pulse it on enclosure-related events. The receptor at the other end is fully wired and functional from Baby; the producer side is left entirely to the agent layer of the game.

This producer/consumer asymmetry is what makes Exit a **hook the agents use to talk to the creature's decision lobe about leaving**. A "creature is in a dangerous room" script that wants the creature to learn "this kind of room is bad — I should leave" pulses chem 201 while the creature lingers; the brain's `driv→comb` tract picks up the now-elevated Exit drive co-activating with whatever room concept the creature is currently attending to, and the resulting Reward / Punishment signals from successfully escaping reinforce a drive→concept association. Over many incidents the creature learns: "when I feel trapped (Exit drive high), the door / lift / portal in front of me is what I want to use."

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **No biochemistry emitter in the stock genome** | — | — | The genome's emitter table lists 43 emitters and **none target chemical 201**. There is no `LOC_*` reproductive, sensorimotor, room, temperature, or location locus that pulses Exit. The chemical is not produced by any organ-locus reading | — |
| 2 | **No reaction product in the stock genome** | — | — | The 101 reactions in the genome do not produce chemical 201. No metabolic, hormonal, immune, or toxin pathway converts another chemical into Exit. The chemical has no chemistry-side birth | — |
| 3 | **No neuroemitter in the stock genome** | — | — | The single stock neuroemitter (gene 1, lobe `move` neuron 37) writes Adrenalin [117], Fear [158], Crowded [157]. **No brain neuron emits into the navigation drives**. The brain cannot raise its own Exit urge from cognitive activity alone | — |
| 4 | **No initial concentration** | — | — | Chemical 201 is absent from the genome's `initialConcentrations` table. A newly-hatched creature is born with **Exit = 0** and stays at 0 for life unless a CAOS-side or modder-side mechanism injects into the chemical | — |
| 5 | **Direct CAOS injection — the primary stock mechanism** | `CHEM 201 <amount>` from agent scripts and event handlers | Creature / bloodstream (systemic) | The CAOS `CHEM` command on a targeted creature writes a delta into `myChemicalConcs[201]` via `Biochemistry.adjustChemicalLevel(201, amount)`. Door agents, room-bounded "this is not your home room" scripts, dangerous-room agents (Grendel huts pulsing Exit on Norns inside, Norn dwellings pulsing Exit on Grendels), submarine / vehicle interior scripts, and hand-of-help "let me out" gestures all use this path | One-shot per script invocation |
| 6 | **`ALTR` chemical adjustment** | `ALTR 201 <amount>` | Creature / bloodstream | The CAOS `ALTR` command performs a clamped adjustment to chemical 201. Functionally identical to `CHEM` for the purposes of the drive bar | One-shot per call |
| 7 | **Modder-added stimulus genes** | Custom `G_STIMULUS` entries with chemical 201 in `chemicalsToAdjust[4]` | Creature / bloodstream (systemic) | A modder adding a `STIM_FEELS_ENCLOSED` (or repurposing an existing low-frequency stimulus) can pulse Exit alongside other chemicals when their event fires — e.g. on entering a room flagged as "wrong species" or on receiving a hostile-territory cue. The pipeline is identical to the disappointment pipeline used by Brain chemical 1 [198] | One-shot per stimulus event |
| 8 | **Modder-added emitter genes** | Custom `G_EMITTER` reading some sensorimotor or room locus and writing chemical 201 | Creature / Drives or modder-defined tissue | Genetic engineers wanting endogenous Exit can wire an emitter that reads a custom CAOS-managed "I am in an unwanted room" locus and pulses chem 201 whenever the creature's current room CA-class disagrees with its species home class. The emitter then auto-pulses Exit any time the creature wanders into the wrong territory, completing — together with a symmetric Enter emitter for "I should be home" — a true two-axis territoriality drive | Gene-dependent rate |
| 9 | **Modder-added reactions** | Custom reactions with chemical 201 as a product | Creature / bloodstream | A mod can plumb Exit into the wider chemistry — e.g. `Crowded + Fear → Exit` so a fearful creature in a crowd builds an exit urge, or `Hotness → Exit` so an overheating creature wants to leave the hot room. None of this exists in stock C3 | Gene-dependent |

The single most important consequence of points 1–4 is that **the stock genome's Exit drive is purely script-driven**. A creature in a world with no agents that pulse chem 201 will never have a non-zero Exit drive, and the drive 17 neuron will sit at zero forever — not because the wiring is broken, but because nothing is delivering input.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **Drives-tissue "Drive 17" receptor — the sole stock consumer** | Gene 155 (receptor id 18) | Creature / Drives (tissue 5) | Locus 17 (`locusName` field reads `"Down"` in `biochemistry.json:3684` — a copy-paste artefact; the authoritative drive-bar name from `Brain.catalogue:97` is **`"trapped"`**), chemical 201 "Exit", threshold **0**, nominal **0**, gain **255 (maximum)**, analogue, flags 0, **switchOnAge 0 (Baby)** | Reads chemical 201 from the bloodstream and writes the gained level to `myDriveLoci[17]`. With threshold 0 the receptor responds linearly to any level above zero; with gain 255 (maximum) even a small chem 201 level produces a saturated drive-bar reading. The drive locus is then read every brain tick by `SensoryFaculty.updateDriveLobe()` which calls `brain.setInput('driv', 17, creature.getDriveLevel(17))`. The driv lobe's neuron 17 — labelled `"trapped"` in `Brain.catalogue:97` — is the cognitive representation of the urge to leave |
| 2 | **`driv→comb` tract — concept association** | Genome's tract gene for `driv→comb` (associative tract from drive lobe to combination/concept lobe) | Brain / `driv→comb` tract | Drive 17's neuron state propagates along all dendrites of the `driv→comb` tract. Whichever concept neurons are co-firing have their dendrite weights updated by the standard Hebbian / Reward / Punishment loop. This is how Exit becomes associated with specific learned objects — doors, room-portal lifts, ship transporters, escape ladders, the "go outside" hand gesture | Drives the cognitive learning that ties the **feeling** of being "trapped" to the **objects** that historically resolved it |
| 3 | **`comb→decn` and `decn` selection — verb selection** | Stock decision-lobe wiring | Brain / decision lobe | The decision lobe reads concept-neuron activity weighted by the trained drive→concept dendrites and selects a verb. The 14 actually-selectable verbs (`Brain.catalogue:102-115`: look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit) **do not include a working "exit" verb** — the catalogue's last three entries (`"up"`, `"down"`, `"exit"` at lines 116-118) are explicitly marked `# not used:` at line 117. High Exit therefore does not produce a direct "leave the room" motor program; it produces a bias toward verbs the creature has learned co-occur with departure — most commonly **approach** on a door agent, **push** on a call button, or **retreat** away from whatever object made it feel trapped | The drive does not control motor output directly; it modulates *what the creature wants to interact with* via the trained associative network |
| 4 | **No involuntary-action receptor** | — | — | Unlike Pain, Coldness, Hotness, or Sex drive, **Exit has no sensorimotor receptor**. The chemical does not trigger reflex animations, automatic gait changes, or any direct motor output. Its effect is purely cognitive | — |
| 5 | **No reactions consume Exit** | — | — | Chemical 201 does not appear as a reactant in any of the genome's 101 reactions. There is no antagonist (no chemical that destroys Exit the way Libido lowerer destroys Sex drive), no metabolic conversion, **no annihilation pairing with Enter [202]** — the four directional drives do not cancel each other in chemistry, only in behaviour-selection at the brain | — |
| 6 | **No active → backup sweep** | — | — | The drive-pair sweep+drip pattern used by drives 0–14 (each main drive drains into a backup chemical at slots 131–145 and trickles back) is **entirely absent for navigation drives**. There is no "Exit backup" chemical at all — the navigation drive cluster ends at chemical 203, and no reservoir chemicals exist for them. The drive has no chemical memory beyond its own decay | — |
| 7 | **Passive decay** | Half-lives table entry for chemical 201 | Bloodstream | genomeValue **38**, half-life **43 ticks** (~1.43 s at 30 tps), decay rate **0.98399** per tick, speed class **"Short"** | Chemical 201 falls to half its level every ~43 ticks. Without continuous re-pulsing, an injection of `CHEM 201 100` decays to ~50 in 1.4 s, ~25 in 3 s, ~12 in 4.5 s, < 1 in ~10 s. This is the fastest decay tier of any drive chemical — Exit therefore does not accumulate over time the way Loneliness or Boredom do; it is a **per-event urge** |
| 8 | **No emitter consuming Exit** | — | — | No emitter reads chemical 201 to drive a sensorimotor output or another chemical. The chemical's only forward path is through the drive-bar receptor | — |
| 9 | **CAOS reads** | `CHEM 201` query, `DRV!` (driveset), drive-monitor agents, Science Kit chemistry graphs | Creature / bloodstream | Any CAOS script can read the current chemical 201 level and the drive-17 level, allowing agents to react to a creature's Exit urge — e.g. a smart door that auto-opens when nearby creatures have high Exit drive, a teleporter call-script that targets creatures showing Exit > threshold, or a teaching toy that pings Reward when Exit is pulsed and the creature is correctly approaching a door | Read-only — the creature's behaviour is unchanged by the read |

## Role in Game Mechanics

### The "drive name vs chemical name" inversion

The same naming convention used for the rest of the navigation drives applies to Exit: the chemical name describes the *direction the creature wants to travel*, while the drive-bar name describes the *feeling the creature has* that motivates the travel:

- `ChemicalNames.catalogue:279`: chemical 201 = `"Exit"` — named for the **action the creature wants to take**.
- `Brain.catalogue:97`: drive 17 = `"trapped"` — named for the **feeling the creature has** when the chemical is high.

A creature with `chem[201] = 200` has its Drive 17 receptor produce ~255 (gain 255 amplifies any non-trivial level), which the `driv` lobe interprets as the feeling "I am trapped here — I should not be here". The directional verb in the chemical name describes the *resolution*: leave, get out, escape. Together with Enter the cluster forms an enclosure-axis pair where each chemical names the desired action and the corresponding drive bar names the felt state:

| Chem | Chemical name | Drive 15-19 brain name | Meaning |
|------|--------------|--------------------------|---------|
| 199  | Up           | low down                 | "I am too low — I should ascend" |
| 200  | Down         | high up                  | "I am too high — I should descend" |
| 201  | Exit         | trapped                  | "I feel enclosed — I should leave" |
| 202  | Enter        | trapped                  | "I feel exposed — I should enter shelter" |
| 203  | Wait         | patient                  | "I feel restless — I should remain still" |

Note the **deliberately identical brain-name `"trapped"`** for drives 17 and 18 (Exit and Enter). The drive-bar UI does not distinguish the two on its own — the creature's behavioural disambiguation comes entirely from which of the two chemicals is present in the bloodstream, and from which set of `driv→comb` dendrites it has trained against each drive. From the brain's point of view there are simply two separate neurons each labelled `"trapped"`; the `driv` lobe addresses them by integer index 17 vs 18, not by string name.

### Why Exit has no biochemistry-side producer

The same architectural reasoning that motivated leaving Up and Down purely script-driven applies symmetrically to Exit:

1. **Enclosure is not a chemical fact.** A real organism has body senses for fear, hunger, fatigue, and crowding, but not for "I am in the wrong room" — that judgement requires knowledge of room IDs, room CA-classes, species territory rules, and other simulation-side data the chemistry organ does not have access to. The C3 designers therefore left the room-relative-to-territory axis to the agent layer that *does* know about rooms.
2. **The world is the source of truth.** Different worlds have different room semantics — the C3 ship's compartments, the Norn Terrarium's biomes, the DS subnet's docking ports, modded prison/cage/cell environments. Encoding any one world's enclosure semantics in the genome would make the genome non-portable.
3. **Symmetry with the rest of the cluster keeps the design clean.** Up, Down, Exit, Enter, and Wait share decay, gain, threshold, switchOnAge, tissue, and the absence of producers. The five navigation drives are a coherent block with one consistent design rule: *receptor wired from Baby, biochemistry left to agents*.
4. **The receptor side is universal.** Every Norn, Grendel, and Ettin in the stock genome has the Drive 17 receptor wired identically from Baby. Whichever world a creature finds itself in, *if* an agent in that world pulses chem 201, the creature will respond in the same way — feel "trapped", learn the association with the agent, and seek the agent again next time it feels enclosed.

### How Exit gets pulsed in the stock world

Concretely, in the C3 ship and the DS subnet, the Exit drive is pulsed by enclosure-related CAOS script paths:

1. **Wrong-territory room scripts.** Bootstrap scripts that flag rooms as belonging to a particular species can pulse chem 201 on creatures of the wrong species — Norns in Grendel huts, Grendels in Norn dwellings — encouraging them to learn the door / portal as the way out.
2. **Dangerous-room detectors.** Rooms with high temperature, low oxygen, or hostile fauna can pulse Exit so creatures learn "this room makes me feel trapped — I want to leave through the door I came in".
3. **Hand-of-help "let me out" gesture.** When the player drops a creature into a confined room and the creature wants out, hand-of-help scripts can pulse Exit so the creature learns to seek the player's hand or the room's door.
4. **Vehicle / submarine interior scripts.** Riding inside the SeaLift or any other vehicle pulses Exit while the creature is trapped inside, so dismounting becomes a learned exit behaviour.
5. **Modder-added enclosure agents** — cages, cells, traps, prison rooms — all use the same `CHEM 201` injection pattern.

The reinforcement cycle mirrors Up's and Down's: agent pulses Exit, brain feels "trapped", creature attends to the door / call-button / portal, `driv→comb` strengthens the dendrite from drive-17 to the exit-agent concept, the agent stops pulsing on goal completion (creature has left the room) and pulses Reward to lock in the lesson. Bugs in agent timing produce the same misbehaviours — a forgotten "stop pulsing on exit" creates a never-satisfied drive that teaches the wrong lesson.

### Wiring detail of the receptor

The exact receptor entry from `biochemistry.json:3674-3692`:

```json
{
  "id": 18,
  "geneId": 155,
  "switchOnAge": 0,
  "switchOnStage": "Baby",
  "organ": 1,
  "organName": "Creature",
  "tissue": 5,
  "tissueName": "Drives",
  "locus": 17,
  "locusName": "Down",
  "chemical": 201,
  "chemicalName": "Exit",
  "threshold": 0,
  "nominal": 0,
  "gain": 255,
  "flags": 0,
  "flagsDescription": "none"
}
```

Three fields matter for behaviour:

- **`threshold = 0`**: the receptor fires for any chem 201 > 0. There is no minimum activation level. Even a small leftover decay tail still drives Drive 17 a little.
- **`nominal = 0`**: the drive's "satisfied" baseline is zero chemical. The drive is satisfied only when chem 201 is fully gone. There is no homeostatic setpoint above zero — Exit is purely a "presence-of-need" signal.
- **`gain = 255`**: the maximum possible gain. With `flags = 0` (analogue) the reading is `clamp(255 × chem, 0, 255)`, which saturates at chem 201 ≈ 1 (out of a 0–255 range). A `CHEM 201 1` write is enough to fully saturate the drive bar; `CHEM 201 200` does not produce any more drive than `CHEM 201 1` — the receptor is at ceiling for any non-trivial level.

The `locusName` field's stale `"Down"` string is a debug-only label and is overridden in any UI that loads `Brain.catalogue` (which gives drive 17 its real name `"trapped"`). Ports must read the *numeric* `locus: 17` field, not the string.

The implication is the same as for the rest of the cluster: **Exit is a binary-feeling drive** at the receptor side — either silent (chem 201 = 0) or fully on (chem 201 ≥ 1). The chemical's *quantitative* level affects only how long the drive stays active before decay drops it back to zero. A bigger pulse = longer-lasting urge.

### Why "Short" half-life matters

The 43-tick half-life (~1.4 s at 30 tps) makes Exit a **per-event, ~10-second urge**:

- A `CHEM 201 100` injection is at ~50 after 1.4 s, ~25 after 3 s, ~12 after 4.5 s, ~6 after 6 s, ~3 after 7 s, < 1 after ~10 s.
- Throughout the first ~7 seconds the chemical is still > 1 and the receptor is saturated at gain 255 — Drive 17 stays at ~255.
- After ~10 seconds the chemical falls below the receptor's effective saturation level and Drive 17 declines meaningfully.
- The "felt" duration of one Exit pulse is therefore on the order of 10 seconds — long enough for a typical "walk to the door" sequence to play out, short enough that the drive does not linger after the creature has actually left.

This is the same timing curve as Up and Down; the symmetry is intentional, so that all four directional drives have identical responsiveness.

### The "no Exit–Enter annihilation" property

A natural intuition would be that Exit and Enter should annihilate each other — that wanting to leave and wanting to enter cannot both be true at once. The stock genome **does not implement this**. There is no reaction `Exit + Enter → 0` (verified by absence in the 101-reaction table), and the two drive bars can both saturate simultaneously if two different agents happen to pulse both chemicals at the same time. The brain does not get confused by this directly — it simply has both drive-17 and drive-18 reading 255 at the decn lobe (both labelled `"trapped"`), and decision-making proceeds on whichever concept neuron is most strongly co-activated by *any* drive-to-concept dendrite.

The behavioural disambiguation is therefore left to:

1. **Agent author discipline.** The bootstrap scripts pulse only Exit *or* Enter at any given moment, never both, because no real-world situation demands both.
2. **The trained `driv→comb` network.** Different concepts are typically associated with different drives, so the dominant concept-lobe activation will reflect whichever drive has more strongly-trained dendrites at that moment — typically `Exit` is associated with the door of the *current* room, and `Enter` is associated with the door of the *home* room.
3. **Decay.** Both drives fall fast, so any spurious co-activation is short-lived.

A modder wanting strict Exit/Enter exclusion can add a reaction `Exit + Enter → Exit` (or vice-versa) to a custom genome; the chemistry pipeline supports it, the stock genome simply doesn't include it.

### Reinforcement learning and Exit

Because Exit has no biochemistry-side feedback, the drive **does not learn to satisfy itself the way the metabolic drives do**. The lesson loop is identical to Up's and Down's:

1. Enclosure script writes `CHEM 201 100` when the creature is in a wrong-species room near the door — Exit drive rises.
2. Creature approaches door; `driv→comb` Hebbian pass strengthens dendrite from drive 17 to door concept.
3. Creature passes through door; door / room script stops pulsing chem 201.
4. Door / room script writes `CHEM 204 50` (Reward) on successful exit — the brain's `driv→comb` tract picks up the Reward pulse and applies a positive STW change to the just-strengthened dendrite, locking in the lesson.
5. Chemical 201 decays from its leftover level; within ~10 s the drive bar is back to zero.

The agent author is responsible for the timing of all four chemical pulses (Exit, off-Exit, Reward, off-Reward). Same failure modes apply: skipping the Reward weakens the lesson; failing to stop pulsing Exit on departure teaches "this door did not satisfy my urge to leave" — exactly the wrong lesson. This is particularly easy to get wrong for room-bounded scripts that re-pulse Exit every tick: the room must detect that the creature has actually crossed the boundary and stop pulsing immediately, otherwise the drive stays elevated through the doorway and into the next room.

### What Exit is *not*

- **Exit is not a brain chemical.** Despite sitting at slot 201, immediately adjacent to the brain-chemistry block (Reward 204, Punishment 205, Brain chemical 9 206), Exit is a *drive* chemical. It is read by a Drives-tissue receptor, not by an SVRule operand in the brain. The chemical's effect on the brain is entirely indirect, through the drive-lobe input.
- **Exit is not a verb.** The decision-lobe action catalogue's actually-used 14 verbs (look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit) do not include a "leave the room" verb. The `Brain.catalogue:118` entry `"exit"` is one of the three placeholder verbs explicitly marked `# not used:` at line 117. The creature cannot decide "I will leave"; it can only decide to approach a learned exit object.
- **Exit is not the chemical opposite of Enter.** Although the two are conceptual opposites, the genome does **not** contain an annihilation reaction. High Exit and high Enter can co-exist in the bloodstream simultaneously — both drive bars (both labelled `"trapped"`) will be saturated, and the brain will simultaneously feel the urge to leave and the urge to enter. The behavioural disambiguation happens entirely in the trained `driv→comb` associations, not in chemistry.
- **Exit is not used by the per-tract reward system.** The opcode-59 / opcode-62 mechanism (`SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`) reads chemicals 204 and 205. Chemical 201 plays no role in the generic reinforcement plumbing; it is a drive input, not a learning signal.
- **Exit is not pulsed by any stock stimulus gene.** Unlike Brain chemical 1 [198] (pulsed by `STIM_DISAPPOINT`), Reward [204] and Punishment [205] (pulsed by all the success/failure stimuli), Exit has *no stock stimulus producer*. The genome leaves the producer side entirely to the agent layer.
- **Exit is not the same as Crowded [157] or Fear [158].** A creature in a tightly-packed room feels Crowded; a creature near a predator feels Fear. Both are emitted by the brain's stock neuroemitter (gene 1, lobe `move` neuron 37) and are part of the regular drive cluster (drives 9 and 10). Exit is a *separate* signal, with its own receptor and its own purely-script-driven inflow — it is the cognitive cue for "leave this confined space", not the social or threat cue.

### Modding affordances

Exit shares Up's and Down's clean extension-point profile because the producer side is empty:

- **Add a "wrong-territory" emitter.** A modded `G_EMITTER` reading the creature's current room CA-class (via a custom CAOS-managed locus) and writing chem 201 when the room class disagrees with the species home class turns the agent-only Exit drive into a true endogenous territoriality drive. Combined with a symmetric Enter emitter, the creature gets a real two-axis territoriality chemistry.
- **Add a "claustrophobia" stimulus.** A `STIM_FEELS_CLOSED_IN` gene that pulses chem 201 (and possibly Fear [158]) every few ticks while the creature is in a small room (room volume below threshold) would give the creature a slow-rising Exit urge proportional to enclosure exposure.
- **Wire navigation drives into the main reaction graph.** Modded reactions like `Crowded → Exit` (crowding produces an exit urge), `Fear + room-marker → Exit` (fear in a room produces an exit urge), or `Exit + Enter → Exit` (annihilation pairing — exit wins out by default) fold the navigation drives into the chemistry network.
- **Add navigation backup chemicals.** Reserving five free slots can replicate the active/backup sweep+drip pattern from the main drive bank, giving the navigation drives chemical memory.
- **Repurpose the slot.** Because the chemical has no stock biochemistry, modders can repurpose chem 201 entirely (e.g. as a "wanderlust" generic-leave-anywhere axis, an "I am bored of this room" axis) without colliding with any stock receptor / emitter / reaction.

### Practical consequences for gameplay

- **Norns in barren worlds never feel "trapped".** A Norn loaded into a custom world with no agents pulsing chem 201 will have Drive 17 = 0 forever, regardless of how confined or hostile its physical surroundings are. The drive is not a sense organ; it is a script-driven cue.
- **Creatures learn exit agents, not rooms.** The Hebbian association is from drive-17 neuron to *concept* neurons (door, lift, portal, hand, etc.), not to *rooms*. A Norn that has learned to use door A in room R will still need to learn door B in room S separately, unless the two are categorised as the same concept (e.g. both are "doors").
- **Disabled enclosure scripts silently disable the drive.** If a world's room-bounded Exit-pulsing scripts fail to install, the Exit drive stops being pulsed. There is no biochemistry redundancy to mask the loss — creatures simply never feel "trapped" again, which can manifest as Norns happily living in Grendel huts.
- **Tools / debug toys can prime the drive directly.** A Science Kit or debug tool that writes `CHEM 201 100` to the selected creature provides a one-click way to test that the Drive 17 receptor and `driv→comb` learning are wired correctly. The drive bar should saturate within one tick and decay over ~10 s; the brain should accept the drive as input and bias decision-making toward whatever concepts the creature is currently attending to (typically the nearest door or portal).
- **Watching chem 201 in Kits diagnoses the territory pipeline.** A creature in an active world should show occasional chem 201 spikes whenever it wanders into a wrong-territory room. A flat-zero trace in a world that *should* be pulsing the chemical is a red flag that the territory agents have failed to install or that the room-membership detection is broken.

### JS port notes

The Rebuild port treats chemical 201 as an ordinary bloodstream chemical with no special-case handling, parallel to Up and Down:

- **No `CHEM_EXIT` constant.** The chemical is referenced numerically by genome data only. There is no engine-level enum entry for chemical 201, no special path, no built-in producer.
- **The drive locus must be writable from the receptor.** `Rebuild/Main_Game/src/engine/creature/Creature.js:119` allocates `myDriveLoci` as a `Float32Array(NUM_DRIVES)` of size 20. The Drives-tissue receptor for chem 201 writes to `myDriveLoci[17]` via the standard receptor evaluator. `getDriveLevel(17)` returns this float, and `SensoryFaculty.updateDriveLobe()` propagates it to brain input `('driv', 17)`. Any port-side bug that mis-indexes drive locus 17 (off-by-one in the LOC_DRIVE0 base address) silently breaks the Exit drive.
- **The decay must implement the "Short" half-life correctly.** Half-life 43 ticks, decay rate 0.98399, must be applied every biochemistry tick. Because the receptor saturates at very low chemical levels (gain 255), small numeric errors in the decay loop accumulate visibly in the drive bar.
- **`CHEM 201` and `ALTR 201` must reach the same `myChemicalConcs[201]` slot the receptor reads.** Standard `getChemicalConcs()` live-reference invariant.
- **The receptor's stale `locusName: "Down"` must not mislead the port.** The authoritative drive-bar name comes from `Brain.catalogue:97` (`"trapped"`). Any UI that displays drive-bar names should ignore the `locusName` field from `biochemistry.json` for receptor 18 and use the catalogue value instead.
- **The drive 17 brain neuron's `"trapped"` name is shared with drive 18.** The brain catalogue's `"trapped"` label appears at *both* line 97 (drive 17, Exit) and line 98 (drive 18, Enter). UI code that surfaces drive bars by name must disambiguate by integer index, not by string, or the two drives will be indistinguishable in the Kits.

The most likely class of port bug specific to the navigation drives is **agent-side**: if the room-bounded / door / enclosure scripts in the bootstrap COS files fail to install correctly, the chemical never gets pulsed and the drive never engages. The receptor side is straightforward and shares its evaluator with all other drive receptors, so receptor-side bugs would manifest in *all* drives, not just Exit.

### Summary

```
   World event: creature in confined / wrong / dangerous room
                       │
        Agent script: CHEM 201 +amount
                       │
                       ▼
       Biochemistry: myChemicalConcs[201] += amount (clamped to 0..255)
                       │
                       ▼ (every biochem tick)
       Drives receptor 18: myDriveLoci[17] := clamp(255 × chem 201, 0, 255)
                       │
                       ▼ (every brain tick)
       SensoryFaculty.updateDriveLobe: brain.setInput('driv', 17, drive[17])
                       │
                       ▼
       driv lobe neuron 17 ("trapped") = saturated while chem > 0
                       │
                       ▼ (next brain tick, driv→comb tract runs)
       Hebbian pass: dendrites from drive-17 → currently-firing concepts
                     have their STW updated by Reward / Punishment levels
                       │
                       ▼ (after ~10 seconds without re-pulse)
       Chemical 201 decays past saturation level → drive bar falls →
       creature no longer feels "trapped" — the urge has subsided

   Exit [201] is the navigation drive for departure / escape:
     - No biochemistry producer in the stock genome (CAOS-only inflow)
     - Single receptor at Drives locus 17, gain 255 (saturating)
     - Drive bar labelled "trapped" in Brain.catalogue (drive 17)
     - Half-life 43 ticks ("Short") — pulse lasts ~10 seconds
     - Companion drives at 199, 200, 202, 203 (Up, Down, Enter, Wait)
     - No dedicated verb — the catalogue's "exit" verb is marked
       # not used; the drive operates entirely via learned associations
       in the driv→comb tract toward existing verbs (approach, push, retreat)
     - No annihilation reaction with Enter — the two opposites can both
       be saturated simultaneously; behavioural disambiguation is
       brain-side via trained driv→comb associations, despite both
       drive bars sharing the literal name "trapped"
     - Agent-layer hook for teaching creatures to seek doors, portals,
       call-buttons, and exit lifts when they are in unwanted rooms
     - One of five fully-script-driven drives, designed to be portable
       across worlds with different enclosure / territory mechanics
```

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32` — the `# navigation drives` comment placeholder block marking 199–203 as the navigation-drive cluster
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:277-281` — chemical 201 named `"Exit"` in the main `chemical_names` array, in the Up/Down/Exit/Enter/Wait sequence
- `Rebuild/Assets/Catalogue/Brain.catalogue:79-100` — `"Creature Drives"` array; entry 17 is `"trapped"`, the brain-side name for the drive bar fed by chemical 201 (note: entry 18 is also `"trapped"`)
- `Rebuild/Assets/Catalogue/Brain.catalogue:102-118` — `"Creature Actions"` array; 14 actually-used verbs followed by three `# not used:` placeholders (`"up"`, `"down"`, `"exit"`), confirming that the Exit drive operates only via learned associations to existing verbs
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:3674-3692` — the Drive 17 receptor (id 18, gene 155) reading chemical 201 with threshold 0, nominal 0, gain 255, switchOnAge 0 (Baby); `locusName` field reads `"Down"` (stale debug string — the authoritative drive-bar name comes from `Brain.catalogue`)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9128-9135` — half-life entry: genomeValue 38, halfLifeInTicks 43, decayRate 0.98398825, speed "Short"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:7076` — the genome's emitters table (43 entries); none target chemical 201
- `Rebuild/Main_Game/src/engine/creature/CreatureConstants.js:39-60` — `DriveOffsets` enum; the navigation drives occupy locus indices 15–19
- `Rebuild/Main_Game/src/engine/creature/Creature.js:119` — `myDriveLoci = new Float32Array(NUM_DRIVES)` allocation
- `Rebuild/Main_Game/src/engine/creature/Creature.js:1641-1646` — `getDriveLevel(driveIndex)` returns `myDriveLoci[driveIndex]`
- `Rebuild/Main_Game/src/engine/creature/Creature.js:247-275` — `LOC_DRIVE0`-based ref creation for biochemistry receptors writing into drive loci; the receptor for chem 201 lands here
- `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:351-357` — `updateDriveLobe()` propagates `myDriveLoci[17]` to brain input `('driv', 17)` every brain tick
- `Rebuild/Main_Game/src/engine/creature/faculties/MotorFaculty.js:842-856` — `getActionName()`; the 14-verb action catalogue; confirms the absence of a working "exit" verb in the decision lobe's actually-selectable verbs
- `Rebuild/DOCUMENTATION/chemicals/199 - Up.md` — sibling doc on the first vertical navigation drive; identical architecture
- `Rebuild/DOCUMENTATION/chemicals/200 - Down.md` — sibling doc on the second vertical navigation drive; identical architecture
- `Rebuild/DOCUMENTATION/chemicals/198 - Brain chemical 1.md` — adjacent-slot doc; chemical 201 sits two slots after Brain chemical 1 but operates on a completely different plumbing path (drive-receptor vs `STIM_DISAPPOINT`-fed brain chemical)
