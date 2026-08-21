# 202 - Enter

**Enter** is the fourth of the five **navigation drives** that occupy chemical slots 199–203 in the C3 / Docking Station genome — the cluster `Up [199]`, `Down [200]`, `Exit [201]`, `Enter [202]`, `Wait [203]` that the chemical-names catalogue groups under the comment `# navigation drives` (`Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32, 277-281`). Where Up/Down express the vertical-axis pair, Exit and Enter together express the **enclosure axis**: Exit is the urge to *leave* a confined or unwanted space, Enter is the urge to *seek shelter, return home, or move into a desirable enclosed space*. Architecturally Enter is identical to its sibling drives — a single Drives-tissue receptor at locus 18, threshold 0 / gain 255 / nominal 0, "Short" half-life of 43 ticks, switched on at Baby stage, with **zero biochemistry-side producers** in the stock genome. The chemical exists only to be poked into the bloodstream by CAOS scripts and read out by the drive lobe; the rest of the chemistry network ignores it.

The drive bar that Enter feeds is, following the same convention used for the rest of the navigation block, **named for the felt state rather than the action**. `Rebuild/Assets/Catalogue/Brain.catalogue:98` calls drive neuron 18 `"trapped"` — the *same string* used for drive 17, Exit. A creature with a high Enter chemical level **feels the cognitive equivalent of "I should not be here — I should be somewhere enclosed/safe/home"**, and is biased by its decision-lobe network toward whatever concept neurons it has learned to associate with entering: doors of the home room, lift cars going *to* the home room, hutch entrances, ship-segment teleporters that bring it home, the "come back inside" hand-of-help gesture. The chemical is the urge; the drive bar is the discomfort; the action is whatever the `comb→decn` associative network has been Hebbian-trained to deliver. There is **no dedicated "enter" verb** in the decision-lobe action catalogue (`Brain.catalogue:102-118` lists 14 actually-selectable verbs followed by three placeholder entries marked `# not used:` — `"up"`, `"down"`, `"exit"` — and *no* `"enter"` placeholder at all; Enter must operate entirely through learned associations to existing verbs like `approach` and `push`).

A small but interpretively important quirk appears in the receptor catalogue at `biochemistry.json:3693-3711`: the receptor's `locusName` field reads `"Exit"` even though it writes to **drive locus 18**, not 17. This is the same copy-paste artefact pattern seen on the Up, Down, and Exit receptors (which carry stale `"Up"`, `"Up"`, and `"Down"` strings respectively) — the `locusName` field is a debug label, not the actual binding. The genuine binding is `locus: 18, chemical: 202`, which lines up with `Brain.catalogue:98`'s drive-bar 18 = `"trapped"`. Builders reading the JSON should trust the numeric `locus` and `chemical` fields and the Brain.catalogue drive-bar names; the `locusName` strings on the navigation-drive receptors are unreliable.

Enter's position in the chemical-decay table (`biochemistry.json:9137-9143`) marks it as a **Short**-speed chemical: genomeValue 38, half-life 43 ticks (~1.43 seconds at 30 tps), decay rate 0.98398825 per tick. This is the same decay profile shared by all five navigation drives, and it places Enter in the "fast-fading urge" regime. A pulse of Enter that is not topped up will fall by half in ~1.4 seconds and be effectively gone in under 10 seconds. Enter is therefore a **moment-to-moment pull** rather than a slowly-accumulating need: agents that want a creature to *keep* wanting to come home have to keep pulsing the chemical every second or two.

The defining structural fact about Enter — as with Up, Down, and Exit — is that **the stock genome contains zero biochemistry for it**. There are no emitters writing into chemical 202 (the genome's emitters table at `biochemistry.json:7076` lists 43 emitters, none targeting slots 199–203). There are no reactions producing it (101 reactions, none with chem 202 as a product). There are no reactions consuming it. No neuroemitter writes into it. There is no initial-concentration entry, so a hatched Norn is born with Enter = 0. The chemical reaches the bloodstream **only via CAOS** — through `CHEM 202 <amount>` from agent scripts (home-room scripts, hutch scripts, "you should come inside" scripts, dangerous-environment escape destinations, hand-of-help gestures), through `ALTR` adjustments, or through modder-added stimulus genes that pulse it on shelter-related events. The receptor at the other end is fully wired and functional from Baby; the producer side is left entirely to the agent layer of the game.

This producer/consumer asymmetry is what makes Enter a **hook the agents use to talk to the creature's decision lobe about coming home / seeking shelter**. A "creature is far from its home room" script that wants the creature to learn "this kind of journey home is good — I should make it" pulses chem 202 while the creature wanders; the brain's `driv→comb` tract picks up the now-elevated Enter drive co-activating with whatever shelter-related concept the creature is currently attending to, and the resulting Reward / Punishment signals from successfully arriving home reinforce a drive→concept association. Over many incidents the creature learns: "when I feel this 'should be inside' urge (Enter drive high), the home-door / hutch / lift-to-home in front of me is what I want to use."

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **No biochemistry emitter in the stock genome** | — | — | The genome's emitter table lists 43 emitters and **none target chemical 202**. There is no `LOC_*` reproductive, sensorimotor, room, temperature, or location locus that pulses Enter. The chemical is not produced by any organ-locus reading | — |
| 2 | **No reaction product in the stock genome** | — | — | The 101 reactions in the genome do not produce chemical 202. No metabolic, hormonal, immune, or toxin pathway converts another chemical into Enter. The chemical has no chemistry-side birth | — |
| 3 | **No neuroemitter in the stock genome** | — | — | The single stock neuroemitter (gene 1, lobe `move` neuron 37) writes Adrenalin [117], Fear [158], Crowded [157]. **No brain neuron emits into the navigation drives**. The brain cannot raise its own Enter urge from cognitive activity alone | — |
| 4 | **No initial concentration** | — | — | Chemical 202 is absent from the genome's `initialConcentrations` table. A newly-hatched creature is born with **Enter = 0** and stays at 0 for life unless a CAOS-side or modder-side mechanism injects into the chemical | — |
| 5 | **Direct CAOS injection — the primary stock mechanism** | `CHEM 202 <amount>` from agent scripts and event handlers | Creature / bloodstream (systemic) | The CAOS `CHEM` command on a targeted creature writes a delta into `myChemicalConcs[202]` via `Biochemistry.adjustChemicalLevel(202, amount)`. Home-room beacon agents, hutch / nest / shelter agents, "your species lives here" scripts, return-from-dangerous-room scripts, parent-calling scripts, the home-portal lifts, and hand-of-help "come back inside" gestures all use this path | One-shot per script invocation |
| 6 | **`ALTR` chemical adjustment** | `ALTR 202 <amount>` | Creature / bloodstream | The CAOS `ALTR` command performs a clamped adjustment to chemical 202. Functionally identical to `CHEM` for the purposes of the drive bar | One-shot per call |
| 7 | **Modder-added stimulus genes** | Custom `G_STIMULUS` entries with chemical 202 in `chemicalsToAdjust[4]` | Creature / bloodstream (systemic) | A modder adding a `STIM_FEELS_EXPOSED` (or repurposing an existing low-frequency stimulus) can pulse Enter alongside other chemicals when their event fires — e.g. on entering an "outside" / wide-open / unsheltered room, or on receiving a parent-calling cue. The pipeline is identical to the disappointment pipeline used by Brain chemical 1 [198] | One-shot per stimulus event |
| 8 | **Modder-added emitter genes** | Custom `G_EMITTER` reading some sensorimotor or room locus and writing chemical 202 | Creature / Drives or modder-defined tissue | Genetic engineers wanting endogenous Enter can wire an emitter that reads a custom CAOS-managed "I am out of my home territory" locus and pulses chem 202 whenever the creature's current room CA-class disagrees with its species home class. The emitter then auto-pulses Enter any time the creature wanders away from home, completing — together with a symmetric Exit emitter for "I should leave this wrong room" — a true two-axis territoriality drive | Gene-dependent rate |
| 9 | **Modder-added reactions** | Custom reactions with chemical 202 as a product | Creature / bloodstream | A mod can plumb Enter into the wider chemistry — e.g. `Coldness → Enter` so a cold creature wants to come inside, `Loneliness + outside-marker → Enter` so a lonely creature outside wants to find others indoors, or `Hotness + sun-marker → Enter` so an overheating creature seeks shade. None of this exists in stock C3 | Gene-dependent |

The single most important consequence of points 1–4 is that **the stock genome's Enter drive is purely script-driven**. A creature in a world with no agents that pulse chem 202 will never have a non-zero Enter drive, and the drive 18 neuron will sit at zero forever — not because the wiring is broken, but because nothing is delivering input.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **Drives-tissue "Drive 18" receptor — the sole stock consumer** | Gene 156 (receptor id 19) | Creature / Drives (tissue 5) | Locus 18 (`locusName` field reads `"Exit"` in `biochemistry.json:3702` — a copy-paste artefact; the authoritative drive-bar name from `Brain.catalogue:98` is **`"trapped"`**), chemical 202 "Enter", threshold **0**, nominal **0**, gain **255 (maximum)**, analogue, flags 0, **switchOnAge 0 (Baby)** | Reads chemical 202 from the bloodstream and writes the gained level to `myDriveLoci[18]`. With threshold 0 the receptor responds linearly to any level above zero; with gain 255 (maximum) even a small chem 202 level produces a saturated drive-bar reading. The drive locus is then read every brain tick by `SensoryFaculty.updateDriveLobe()` which calls `brain.setInput('driv', 18, creature.getDriveLevel(18))`. The driv lobe's neuron 18 — labelled `"trapped"` in `Brain.catalogue:98` — is the cognitive representation of the urge to seek shelter / return home |
| 2 | **`driv→comb` tract — concept association** | Genome's tract gene for `driv→comb` (associative tract from drive lobe to combination/concept lobe) | Brain / `driv→comb` tract | Drive 18's neuron state propagates along all dendrites of the `driv→comb` tract. Whichever concept neurons are co-firing have their dendrite weights updated by the standard Hebbian / Reward / Punishment loop. This is how Enter becomes associated with specific learned objects — home doors, hutch / nest entrances, the home-room lift, the parent's location, ship transporters that bring the creature back, the "come inside" hand gesture | Drives the cognitive learning that ties the **feeling** of needing to come home to the **objects** that historically resolved it |
| 3 | **`comb→decn` and `decn` selection — verb selection** | Stock decision-lobe wiring | Brain / decision lobe | The decision lobe reads concept-neuron activity weighted by the trained drive→concept dendrites and selects a verb. The 14 actually-selectable verbs (`Brain.catalogue:102-115`: look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit) **do not include any "enter" verb** — the catalogue's three `# not used:` placeholders (`"up"`, `"down"`, `"exit"`) do not even list an "enter" placeholder; Enter has no verb-name placeholder at all. High Enter therefore does not produce a direct "go inside" motor program; it produces a bias toward verbs the creature has learned co-occur with arriving — most commonly **approach** on a home-door agent, **push** on a call button, or **left**/**right** to climb toward the home room | The drive does not control motor output directly; it modulates *what the creature wants to interact with* via the trained associative network |
| 4 | **No involuntary-action receptor** | — | — | Unlike Pain, Coldness, Hotness, or Sex drive, **Enter has no sensorimotor receptor**. The chemical does not trigger reflex animations, automatic gait changes, or any direct motor output. Its effect is purely cognitive | — |
| 5 | **No reactions consume Enter** | — | — | Chemical 202 does not appear as a reactant in any of the genome's 101 reactions. There is no antagonist (no chemical that destroys Enter the way Libido lowerer destroys Sex drive), no metabolic conversion, **no annihilation pairing with Exit [201]** — the four directional drives do not cancel each other in chemistry, only in behaviour-selection at the brain | — |
| 6 | **No active → backup sweep** | — | — | The drive-pair sweep+drip pattern used by drives 0–14 (each main drive drains into a backup chemical at slots 131–145 and trickles back) is **entirely absent for navigation drives**. There is no "Enter backup" chemical at all — the navigation drive cluster ends at chemical 203, and no reservoir chemicals exist for them. The drive has no chemical memory beyond its own decay | — |
| 7 | **Passive decay** | Half-lives table entry for chemical 202 | Bloodstream | genomeValue **38**, half-life **43 ticks** (~1.43 s at 30 tps), decay rate **0.98399** per tick, speed class **"Short"** | Chemical 202 falls to half its level every ~43 ticks. Without continuous re-pulsing, an injection of `CHEM 202 100` decays to ~50 in 1.4 s, ~25 in 3 s, ~12 in 4.5 s, < 1 in ~10 s. This is the fastest decay tier of any drive chemical — Enter therefore does not accumulate over time the way Loneliness or Boredom do; it is a **per-event urge** |
| 8 | **No emitter consuming Enter** | — | — | No emitter reads chemical 202 to drive a sensorimotor output or another chemical. The chemical's only forward path is through the drive-bar receptor | — |
| 9 | **CAOS reads** | `CHEM 202` query, `DRV!` (driveset), drive-monitor agents, Science Kit chemistry graphs | Creature / bloodstream | Any CAOS script can read the current chemical 202 level and the drive-18 level, allowing agents to react to a creature's Enter urge — e.g. a smart home-door that auto-opens when the resident creature's Enter drive is high, a parent-calling agent that targets creatures showing Enter > threshold, or a teaching toy that pings Reward when Enter is pulsed and the creature is correctly approaching the home portal | Read-only — the creature's behaviour is unchanged by the read |

## Role in Game Mechanics

### The "drive name vs chemical name" inversion

The same naming convention used for the rest of the navigation drives applies to Enter: the chemical name describes the *direction the creature wants to travel*, while the drive-bar name describes the *feeling the creature has* that motivates the travel:

- `ChemicalNames.catalogue:280`: chemical 202 = `"Enter"` — named for the **action the creature wants to take**.
- `Brain.catalogue:98`: drive 18 = `"trapped"` — named for the **feeling the creature has** when the chemical is high (deliberately the same string used for drive 17 / Exit).

A creature with `chem[202] = 200` has its Drive 18 receptor produce ~255 (gain 255 amplifies any non-trivial level), which the `driv` lobe interprets as the feeling "I am not where I should be — I should be somewhere enclosed / sheltered / home". The directional verb in the chemical name describes the *resolution*: enter, go inside, return. Together with Exit the cluster forms an enclosure-axis pair where each chemical names the desired action and the corresponding drive bar names the felt state:

| Chem | Chemical name | Drive 15-19 brain name | Meaning |
|------|--------------|--------------------------|---------|
| 199  | Up           | low down                 | "I am too low — I should ascend" |
| 200  | Down         | high up                  | "I am too high — I should descend" |
| 201  | Exit         | trapped                  | "I feel enclosed — I should leave" |
| 202  | Enter        | trapped                  | "I feel exposed — I should enter shelter" |
| 203  | Wait         | patient                  | "I feel restless — I should remain still" |

Note the **deliberately identical brain-name `"trapped"`** for drives 17 and 18 (Exit and Enter). The drive-bar UI does not distinguish the two on its own — the creature's behavioural disambiguation comes entirely from which of the two chemicals is present in the bloodstream, and from which set of `driv→comb` dendrites it has trained against each drive. From the brain's point of view there are simply two separate neurons each labelled `"trapped"`; the `driv` lobe addresses them by integer index 17 vs 18, not by string name. This is arguably a design quirk — a more descriptive scheme would have called drive 17 `"trapped"` and drive 18 `"exposed"` — but the catalogue ships with the string duplicated, and any UI faithfully presenting the catalogue's names will surface two identically-labelled bars.

### Why Enter has no biochemistry-side producer

The same architectural reasoning that motivated leaving Up, Down, and Exit purely script-driven applies symmetrically to Enter:

1. **"Where I belong" is not a chemical fact.** A real organism has body senses for fear, hunger, fatigue, and crowding, but not for "I am away from my home territory" — that judgement requires knowledge of room IDs, room CA-classes, species territory rules, parent locations, and other simulation-side data the chemistry organ does not have access to. The C3 designers therefore left the territory-relative axis to the agent layer that *does* know about rooms.
2. **The world is the source of truth.** Different worlds have different home semantics — the C3 ship's species compartments, the Norn Terrarium's biomes, the DS subnet's docking ports, modded prison/cage/cell environments. Encoding any one world's home semantics in the genome would make the genome non-portable.
3. **Symmetry with the rest of the cluster keeps the design clean.** Up, Down, Exit, Enter, and Wait share decay, gain, threshold, switchOnAge, tissue, and the absence of producers. The five navigation drives are a coherent block with one consistent design rule: *receptor wired from Baby, biochemistry left to agents*.
4. **The receptor side is universal.** Every Norn, Grendel, and Ettin in the stock genome has the Drive 18 receptor wired identically from Baby. Whichever world a creature finds itself in, *if* an agent in that world pulses chem 202, the creature will respond in the same way — feel the "should be inside" urge, learn the association with the agent, and seek the agent again next time it feels exposed.

### How Enter gets pulsed in the stock world

Concretely, in the C3 ship and the DS subnet, the Enter drive is pulsed by shelter / home / return CAOS script paths:

1. **Home-room beacon scripts.** Bootstrap scripts that flag rooms as belonging to a particular species can pulse chem 202 on creatures of the *correct* species when they wander too far from their home compartment, encouraging them to learn the home door / portal as the way back.
2. **Hutch / nest / shelter agents.** Agents that act as creature shelters can pulse Enter when a creature wanders away during cold/dark/dangerous moments, so the creature learns "this hutch is where I want to be when I feel exposed".
3. **Parent-calling scripts.** Scripts that simulate a parent calling for a child can pulse Enter so the offspring learns to approach the parent / parent's location.
4. **Hand-of-help "come back inside" gesture.** When the player wants to summon a creature back to a safe area, hand-of-help scripts can pulse Enter so the creature learns to seek the player's hand or the room's door.
5. **Return-from-dangerous-room counter-pulse.** A room that pulses Exit to push a creature out can simultaneously pulse Enter on a *different* room (the destination home room) to pull the same creature in, reinforcing the round-trip lesson.
6. **Modder-added shelter agents** — caves, dens, panic-rooms, parent-toys — all use the same `CHEM 202` injection pattern.

The reinforcement cycle mirrors Up's, Down's, and Exit's: agent pulses Enter, brain feels the "should be inside" urge, creature attends to the home-door / hutch / call-button, `driv→comb` strengthens the dendrite from drive-18 to the home-agent concept, the agent stops pulsing on goal completion (creature has arrived) and pulses Reward to lock in the lesson. Bugs in agent timing produce the same misbehaviours — a forgotten "stop pulsing on arrival" creates a never-satisfied drive that teaches the wrong lesson.

### Wiring detail of the receptor

The exact receptor entry from `biochemistry.json:3693-3711`:

```json
{
  "id": 19,
  "geneId": 156,
  "switchOnAge": 0,
  "switchOnStage": "Baby",
  "organ": 1,
  "organName": "Creature",
  "tissue": 5,
  "tissueName": "Drives",
  "locus": 18,
  "locusName": "Exit",
  "chemical": 202,
  "chemicalName": "Enter",
  "threshold": 0,
  "nominal": 0,
  "gain": 255,
  "flags": 0,
  "flagsDescription": "none"
}
```

Three fields matter for behaviour:

- **`threshold = 0`**: the receptor fires for any chem 202 > 0. There is no minimum activation level. Even a small leftover decay tail still drives Drive 18 a little.
- **`nominal = 0`**: the drive's "satisfied" baseline is zero chemical. The drive is satisfied only when chem 202 is fully gone. There is no homeostatic setpoint above zero — Enter is purely a "presence-of-need" signal.
- **`gain = 255`**: the maximum possible gain. With `flags = 0` (analogue) the reading is `clamp(255 × chem, 0, 255)`, which saturates at chem 202 ≈ 1 (out of a 0–255 range). A `CHEM 202 1` write is enough to fully saturate the drive bar; `CHEM 202 200` does not produce any more drive than `CHEM 202 1` — the receptor is at ceiling for any non-trivial level.

The `locusName` field's stale `"Exit"` string is a debug-only label and is overridden in any UI that loads `Brain.catalogue` (which gives drive 18 its real name `"trapped"`). Ports must read the *numeric* `locus: 18` field, not the string.

The implication is the same as for the rest of the cluster: **Enter is a binary-feeling drive** at the receptor side — either silent (chem 202 = 0) or fully on (chem 202 ≥ 1). The chemical's *quantitative* level affects only how long the drive stays active before decay drops it back to zero. A bigger pulse = longer-lasting urge.

### Why "Short" half-life matters

The 43-tick half-life (~1.4 s at 30 tps) makes Enter a **per-event, ~10-second urge**:

- A `CHEM 202 100` injection is at ~50 after 1.4 s, ~25 after 3 s, ~12 after 4.5 s, ~6 after 6 s, ~3 after 7 s, < 1 after ~10 s.
- Throughout the first ~7 seconds the chemical is still > 1 and the receptor is saturated at gain 255 — Drive 18 stays at ~255.
- After ~10 seconds the chemical falls below the receptor's effective saturation level and Drive 18 declines meaningfully.
- The "felt" duration of one Enter pulse is therefore on the order of 10 seconds — long enough for a typical "walk to the home door" sequence to play out, short enough that the drive does not linger after the creature has actually arrived.

This is the same timing curve as Up, Down, and Exit; the symmetry is intentional, so that all four directional drives have identical responsiveness.

### The "no Exit–Enter annihilation" property

A natural intuition would be that Exit and Enter should annihilate each other — that wanting to leave and wanting to enter cannot both be true at once. The stock genome **does not implement this**. There is no reaction `Exit + Enter → 0` (verified by absence in the 101-reaction table), and the two drive bars can both saturate simultaneously if two different agents happen to pulse both chemicals at the same time. The brain does not get confused by this directly — it simply has both drive-17 and drive-18 reading 255 at the decn lobe (both labelled `"trapped"`), and decision-making proceeds on whichever concept neuron is most strongly co-activated by *any* drive-to-concept dendrite.

The behavioural disambiguation is therefore left to:

1. **Agent author discipline.** The bootstrap scripts pulse only Exit *or* Enter at any given moment, never both, because no real-world situation demands both.
2. **The trained `driv→comb` network.** Different concepts are typically associated with different drives, so the dominant concept-lobe activation will reflect whichever drive has more strongly-trained dendrites at that moment — typically `Exit` is associated with the door of the *current (wrong)* room, and `Enter` is associated with the door of the *home* room.
3. **Decay.** Both drives fall fast, so any spurious co-activation is short-lived.

A modder wanting strict Exit/Enter exclusion can add a reaction `Exit + Enter → Exit` (or vice-versa) to a custom genome; the chemistry pipeline supports it, the stock genome simply doesn't include it.

### Reinforcement learning and Enter

Because Enter has no biochemistry-side feedback, the drive **does not learn to satisfy itself the way the metabolic drives do**. The lesson loop is identical to Up's, Down's, and Exit's:

1. Home / shelter script writes `CHEM 202 100` when the creature is too far from its home room — Enter drive rises.
2. Creature approaches home door; `driv→comb` Hebbian pass strengthens dendrite from drive 18 to home-door concept.
3. Creature passes through home door; home-room script stops pulsing chem 202.
4. Home-room script writes `CHEM 204 50` (Reward) on successful arrival — the brain's `driv→comb` tract picks up the Reward pulse and applies a positive STW change to the just-strengthened dendrite, locking in the lesson.
5. Chemical 202 decays from its leftover level; within ~10 s the drive bar is back to zero.

The agent author is responsible for the timing of all four chemical pulses (Enter, off-Enter, Reward, off-Reward). Same failure modes apply: skipping the Reward weakens the lesson; failing to stop pulsing Enter on arrival teaches "this door did not satisfy my urge to come home" — exactly the wrong lesson. This is particularly easy to get wrong for room-bounded scripts that re-pulse Enter every tick: the home room must detect that the creature has actually crossed into the safe boundary and stop pulsing immediately, otherwise the drive stays elevated past arrival and the creature keeps trying to enter rooms it is already in.

### What Enter is *not*

- **Enter is not a brain chemical.** Despite sitting at slot 202, immediately adjacent to the brain-chemistry block (Reward 204, Punishment 205, Brain chemical 9 206), Enter is a *drive* chemical. It is read by a Drives-tissue receptor, not by an SVRule operand in the brain. The chemical's effect on the brain is entirely indirect, through the drive-lobe input.
- **Enter is not a verb.** The decision-lobe action catalogue's actually-used 14 verbs (look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit) do not include a "go inside" verb. The `Brain.catalogue` placeholder list does not even contain an `"enter"` entry — Enter is *more* purely associative than Exit, which at least has a placeholder verb name. The creature cannot decide "I will enter"; it can only decide to approach a learned shelter object.
- **Enter is not the chemical opposite of Exit.** Although the two are conceptual opposites, the genome does **not** contain an annihilation reaction. High Exit and high Enter can co-exist in the bloodstream simultaneously — both drive bars (both labelled `"trapped"`) will be saturated, and the brain will simultaneously feel the urge to leave and the urge to enter. The behavioural disambiguation happens entirely in the trained `driv→comb` associations, not in chemistry.
- **Enter is not used by the per-tract reward system.** The opcode-59 / opcode-62 mechanism (`SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`) reads chemicals 204 and 205. Chemical 202 plays no role in the generic reinforcement plumbing; it is a drive input, not a learning signal.
- **Enter is not pulsed by any stock stimulus gene.** Unlike Brain chemical 1 [198] (pulsed by `STIM_DISAPPOINT`), Reward [204] and Punishment [205] (pulsed by all the success/failure stimuli), Enter has *no stock stimulus producer*. The genome leaves the producer side entirely to the agent layer.
- **Enter is not the same as Loneliness [97/107] or Coldness.** A creature far from others feels Lonely; a cold creature feels Coldness. These are emitted by stock biochemistry pathways and are part of the regular drive cluster. Enter is a *separate* signal, with its own receptor and its own purely-script-driven inflow — it is the cognitive cue for "go to the place you belong", not the social or thermal cue.

### Modding affordances

Enter shares the rest of the navigation cluster's clean extension-point profile because the producer side is empty:

- **Add a "home-territory" emitter.** A modded `G_EMITTER` reading the creature's current room CA-class (via a custom CAOS-managed locus) and writing chem 202 when the room class disagrees with the species home class turns the agent-only Enter drive into a true endogenous homing drive. Combined with a symmetric Exit emitter, the creature gets a real two-axis territoriality chemistry.
- **Add an "agoraphobia" stimulus.** A `STIM_FEELS_EXPOSED` gene that pulses chem 202 (and possibly Fear [158]) every few ticks while the creature is in a large open room (room volume above threshold) would give the creature a slow-rising Enter urge proportional to exposure time.
- **Wire navigation drives into the main reaction graph.** Modded reactions like `Coldness → Enter` (cold drives a desire for shelter), `Loneliness + outside-marker → Enter` (lonely outside drives a desire to come in), or `Exit + Enter → Enter` (annihilation pairing — enter wins out by default) fold the navigation drives into the chemistry network.
- **Add navigation backup chemicals.** Reserving five free slots can replicate the active/backup sweep+drip pattern from the main drive bank, giving the navigation drives chemical memory.
- **Repurpose the slot.** Because the chemical has no stock biochemistry, modders can repurpose chem 202 entirely (e.g. as a "homesickness" axis distinct from territory, a "I want to be near the parent" axis) without colliding with any stock receptor / emitter / reaction.

### Practical consequences for gameplay

- **Norns in barren worlds never feel "homesick".** A Norn loaded into a custom world with no agents pulsing chem 202 will have Drive 18 = 0 forever, regardless of how far it wanders from any meaningful home. The drive is not a sense organ; it is a script-driven cue.
- **Creatures learn home agents, not rooms.** The Hebbian association is from drive-18 neuron to *concept* neurons (home-door, hutch, parent, etc.), not to *rooms*. A Norn that has learned to use home door A will still need to learn home door B separately, unless the two are categorised as the same concept (e.g. both are "doors").
- **Disabled home-room scripts silently disable the drive.** If a world's home-bounded Enter-pulsing scripts fail to install, the Enter drive stops being pulsed. There is no biochemistry redundancy to mask the loss — creatures simply never feel the homing urge again, which can manifest as Norns wandering far from their species compartment without any apparent motivation to return.
- **Tools / debug toys can prime the drive directly.** A Science Kit or debug tool that writes `CHEM 202 100` to the selected creature provides a one-click way to test that the Drive 18 receptor and `driv→comb` learning are wired correctly. The drive bar should saturate within one tick and decay over ~10 s; the brain should accept the drive as input and bias decision-making toward whatever shelter / home concepts the creature is currently attending to.
- **Watching chem 202 in Kits diagnoses the homing pipeline.** A creature in an active world should show occasional chem 202 spikes whenever it strays from its home territory. A flat-zero trace in a world that *should* be pulsing the chemical is a red flag that the home-territory agents have failed to install or that the room-membership detection is broken.
- **Two indistinguishable "trapped" bars in the Drive Kit.** Because `Brain.catalogue` labels both drive 17 and drive 18 with the literal string `"trapped"`, any Drive Kit UI that renders bars by name will show two visually identical entries side-by-side. Diagnosing which is Exit and which is Enter requires reading the underlying drive index (17 vs 18) or the chemical level (chem 201 vs 202) — the displayed name alone is insufficient.

### JS port notes

The Rebuild port treats chemical 202 as an ordinary bloodstream chemical with no special-case handling, parallel to Up, Down, and Exit:

- **No `CHEM_ENTER` constant.** The chemical is referenced numerically by genome data only. There is no engine-level enum entry for chemical 202, no special path, no built-in producer.
- **The drive locus must be writable from the receptor.** `Rebuild/Main_Game/src/engine/creature/Creature.js:119` allocates `myDriveLoci` as a `Float32Array(NUM_DRIVES)` of size 20. The Drives-tissue receptor for chem 202 writes to `myDriveLoci[18]` via the standard receptor evaluator. `getDriveLevel(18)` returns this float, and `SensoryFaculty.updateDriveLobe()` propagates it to brain input `('driv', 18)`. Any port-side bug that mis-indexes drive locus 18 (off-by-one in the LOC_DRIVE0 base address) silently breaks the Enter drive.
- **The decay must implement the "Short" half-life correctly.** Half-life 43 ticks, decay rate 0.98399, must be applied every biochemistry tick. Because the receptor saturates at very low chemical levels (gain 255), small numeric errors in the decay loop accumulate visibly in the drive bar.
- **`CHEM 202` and `ALTR 202` must reach the same `myChemicalConcs[202]` slot the receptor reads.** Standard `getChemicalConcs()` live-reference invariant.
- **The receptor's stale `locusName: "Exit"` must not mislead the port.** The authoritative drive-bar name comes from `Brain.catalogue:98` (`"trapped"`). Any UI that displays drive-bar names should ignore the `locusName` field from `biochemistry.json` for receptor 19 and use the catalogue value instead.
- **The drive 18 brain neuron's `"trapped"` name is shared with drive 17.** The brain catalogue's `"trapped"` label appears at *both* line 97 (drive 17, Exit) and line 98 (drive 18, Enter). UI code that surfaces drive bars by name must disambiguate by integer index, not by string, or the two drives will be indistinguishable in the Kits.

The most likely class of port bug specific to the navigation drives is **agent-side**: if the room-bounded / home / shelter scripts in the bootstrap COS files fail to install correctly, the chemical never gets pulsed and the drive never engages. The receptor side is straightforward and shares its evaluator with all other drive receptors, so receptor-side bugs would manifest in *all* drives, not just Enter.

### Summary

```
   World event: creature is far from home / outside / exposed
                       │
        Agent script: CHEM 202 +amount
                       │
                       ▼
       Biochemistry: myChemicalConcs[202] += amount (clamped to 0..255)
                       │
                       ▼ (every biochem tick)
       Drives receptor 19: myDriveLoci[18] := clamp(255 × chem 202, 0, 255)
                       │
                       ▼ (every brain tick)
       SensoryFaculty.updateDriveLobe: brain.setInput('driv', 18, drive[18])
                       │
                       ▼
       driv lobe neuron 18 ("trapped") = saturated while chem > 0
                       │
                       ▼ (next brain tick, driv→comb tract runs)
       Hebbian pass: dendrites from drive-18 → currently-firing concepts
                     have their STW updated by Reward / Punishment levels
                       │
                       ▼ (after ~10 seconds without re-pulse)
       Chemical 202 decays past saturation level → drive bar falls →
       creature no longer feels the urge to come inside

   Enter [202] is the navigation drive for arrival / shelter / homing:
     - No biochemistry producer in the stock genome (CAOS-only inflow)
     - Single receptor at Drives locus 18, gain 255 (saturating)
     - Drive bar labelled "trapped" in Brain.catalogue (drive 18) —
       the SAME string used for drive 17 (Exit); disambiguation is
       by integer index, not by name
     - Half-life 43 ticks ("Short") — pulse lasts ~10 seconds
     - Companion drives at 199, 200, 201, 203 (Up, Down, Exit, Wait)
     - No dedicated verb — Brain.catalogue has no "enter" placeholder
       at all (not even in the # not used: section); the drive operates
       entirely via learned associations in the driv→comb tract toward
       existing verbs (approach, push, left, right)
     - No annihilation reaction with Exit — the two opposites can both
       be saturated simultaneously; behavioural disambiguation is
       brain-side via trained driv→comb associations, despite both
       drive bars sharing the literal name "trapped"
     - Agent-layer hook for teaching creatures to seek home-doors,
       hutches, nests, parents, and shelter agents when they have
       wandered from their territory
     - One of five fully-script-driven drives, designed to be portable
       across worlds with different home / shelter / territory mechanics
```

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32` — the `# navigation drives` comment placeholder block marking 199–203 as the navigation-drive cluster
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:280` — chemical 202 named `"Enter"` in the main `chemical_names` array, in the Up/Down/Exit/Enter/Wait sequence
- `Rebuild/Assets/Catalogue/Brain.catalogue:79-100` — `"Creature Drives"` array; entry 18 is `"trapped"`, the brain-side name for the drive bar fed by chemical 202 (note: entry 17 is also `"trapped"`)
- `Rebuild/Assets/Catalogue/Brain.catalogue:102-118` — `"Creature Actions"` array; 14 actually-used verbs followed by three `# not used:` placeholders (`"up"`, `"down"`, `"exit"`); confirms there is no `"enter"` placeholder verb at all — Enter operates only via learned associations to existing verbs
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:3693-3711` — the Drive 18 receptor (id 19, gene 156) reading chemical 202 with threshold 0, nominal 0, gain 255, switchOnAge 0 (Baby); `locusName` field reads `"Exit"` (stale debug string — the authoritative drive-bar name comes from `Brain.catalogue`)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9137-9143` — half-life entry: genomeValue 38, halfLifeInTicks 43, decayRate 0.98398825, speed "Short"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:7076` — the genome's emitters table (43 entries); none target chemical 202
- `Rebuild/Main_Game/src/engine/creature/CreatureConstants.js:39-60` — `DriveOffsets` enum; the navigation drives occupy locus indices 15–19
- `Rebuild/Main_Game/src/engine/creature/Creature.js:119` — `myDriveLoci = new Float32Array(NUM_DRIVES)` allocation
- `Rebuild/Main_Game/src/engine/creature/Creature.js:1641-1646` — `getDriveLevel(driveIndex)` returns `myDriveLoci[driveIndex]`
- `Rebuild/Main_Game/src/engine/creature/Creature.js:247-275` — `LOC_DRIVE0`-based ref creation for biochemistry receptors writing into drive loci; the receptor for chem 202 lands here
- `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:351-357` — `updateDriveLobe()` propagates `myDriveLoci[18]` to brain input `('driv', 18)` every brain tick
- `Rebuild/Main_Game/src/engine/creature/faculties/MotorFaculty.js:842-856` — `getActionName()`; the 14-verb action catalogue; confirms the absence of any "enter" verb in the decision lobe's actually-selectable verbs
- `Rebuild/DOCUMENTATION/chemicals/199 - Up.md` — sibling doc on the first vertical navigation drive; identical architecture
- `Rebuild/DOCUMENTATION/chemicals/200 - Down.md` — sibling doc on the second vertical navigation drive; identical architecture
- `Rebuild/DOCUMENTATION/chemicals/201 - Exit.md` — direct conceptual opposite on the enclosure axis; same architecture, opposite directional semantics
