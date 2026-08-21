# 203 - Wait

**Wait** is the fifth and final entry of the **navigation drive cluster** that occupies chemical slots 199–203 in the C3 / Docking Station genome — the block `Up [199]`, `Down [200]`, `Exit [201]`, `Enter [202]`, `Wait [203]` that the chemical-names catalogue groups under the comment `# navigation drives` (`Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32, 277-281`). Where Up/Down express the vertical axis and Exit/Enter the enclosure axis, Wait is the **null-motion / stillness drive**: a chemical urge to *remain in place*, *do nothing*, *stop moving*, *hold position*. Architecturally Wait is identical to its four sibling drives — a single Drives-tissue receptor at locus 19, threshold 0 / gain 255 / nominal 0, "Short" half-life of 43 ticks, switched on at Baby stage, with **zero biochemistry-side producers** in the stock genome. The chemical exists only to be poked into the bloodstream by CAOS scripts and read out by the drive lobe; the rest of the chemistry network ignores it.

The drive bar that Wait feeds breaks the naming pattern of the directional drives. `Rebuild/Assets/Catalogue/Brain.catalogue:99` calls drive neuron 19 `"patient"` — and unlike the duplicated `"low down"` / `"high up"` / `"trapped"` strings used for the four directional drives, `"patient"` is a *unique* drive-bar name that appears only on locus 19. A creature with a high Wait chemical level **feels the cognitive equivalent of "I should not move — I should stay where I am, hold still, wait for something"**, and is biased by its decision-lobe network toward the only verb in the actually-selectable action catalogue that produces no locomotion: `rest`. Like the other navigation drives there is no dedicated "wait" verb in the action catalogue's actually-used 14-entry list (`Brain.catalogue:102-115`); Wait operates entirely through learned associations to existing verbs, with `rest` being the natural primary anchor.

A small but interpretively important quirk appears in the receptor catalogue at `biochemistry.json:3712-3730`: the receptor's `locusName` field reads `"Enter"` even though it writes to **drive locus 19**, not 18. This is the same copy-paste artefact pattern seen on the other four navigation-drive receptors (which carry stale `"Up"`, `"Up"`, `"Down"`, and `"Exit"` strings respectively) — the `locusName` field is a debug label, not the actual binding. The genuine binding is `locus: 19, chemical: 203`, which lines up with `Brain.catalogue:99`'s drive-bar 19 = `"patient"`. Builders reading the JSON should trust the numeric `locus` and `chemical` fields and the Brain.catalogue drive-bar names; the `locusName` strings on the navigation-drive receptors are unreliable.

Wait's position in the chemical-decay table (`biochemistry.json:9144-9151`) marks it as a **Short**-speed chemical: genomeValue 38, half-life 43 ticks (~1.43 seconds at 30 tps), decay rate 0.98398825 per tick. This is the same decay profile shared by all five navigation drives, and it places Wait in the "fast-fading urge" regime. A pulse of Wait that is not topped up will fall by half in ~1.4 seconds and be effectively gone in under 10 seconds. Wait is therefore a **moment-to-moment pull** rather than a slowly-accumulating need: agents that want a creature to *keep* holding position have to keep pulsing the chemical every second or two.

The defining structural fact about Wait — as with the rest of the navigation cluster — is that **the stock genome contains zero biochemistry for it**. There are no emitters writing into chemical 203 (the genome's emitters table at `biochemistry.json:7076` lists 43 emitters, none targeting slots 199–203). There are no reactions producing it (101 reactions, none with chem 203 as a product). There are no reactions consuming it. No neuroemitter writes into it. There is no initial-concentration entry, so a hatched Norn is born with Wait = 0. The chemical reaches the bloodstream **only via CAOS** — through `CHEM 203 <amount>` from agent scripts (teaching toys, parent-summoning scripts, ceremonies, "stay where you are" scripts, hand-of-help "stop wandering" gestures, queue-management agents), through `ALTR` adjustments, or through modder-added stimulus genes that pulse it on relevant events. The receptor at the other end is fully wired and functional from Baby; the producer side is left entirely to the agent layer of the game.

This producer/consumer asymmetry is what makes Wait a **hook the agents use to talk to the creature's decision lobe about staying put**. A "creature should hold still and observe" script that wants the creature to learn "this kind of pause is good — I should hold still here" pulses chem 203 while the creature is at the relevant location; the brain's `driv→comb` tract picks up the now-elevated Wait drive co-activating with whatever object/location concept the creature is currently attending to, and the resulting Reward / Punishment signals from successfully waiting reinforce a drive→concept association. Over many incidents the creature learns: "when I feel this 'should hold still' urge (Wait drive high), the right thing to do is rest in front of the speaker / teaching toy / parent."

## Sources

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|-------------|----------------|-------------------|------|
| 1 | **No biochemistry emitter in the stock genome** | — | — | The genome's emitter table lists 43 emitters and **none target chemical 203**. There is no `LOC_*` reproductive, sensorimotor, room, temperature, or location locus that pulses Wait. The chemical is not produced by any organ-locus reading | — |
| 2 | **No reaction product in the stock genome** | — | — | The 101 reactions in the genome do not produce chemical 203. No metabolic, hormonal, immune, or toxin pathway converts another chemical into Wait. The chemical has no chemistry-side birth | — |
| 3 | **No neuroemitter in the stock genome** | — | — | The single stock neuroemitter (gene 1, lobe `move` neuron 37) writes Adrenalin [117], Fear [158], Crowded [157]. **No brain neuron emits into the navigation drives**. The brain cannot raise its own Wait urge from cognitive activity alone | — |
| 4 | **No initial concentration** | — | — | Chemical 203 is absent from the genome's `initialConcentrations` table. A newly-hatched creature is born with **Wait = 0** and stays at 0 for life unless a CAOS-side or modder-side mechanism injects into the chemical | — |
| 5 | **Direct CAOS injection — the primary stock mechanism** | `CHEM 203 <amount>` from agent scripts and event handlers | Creature / bloodstream (systemic) | The CAOS `CHEM` command on a targeted creature writes a delta into `myChemicalConcs[203]` via `Biochemistry.adjustChemicalLevel(203, amount)`. Teaching machines, demonstration agents, "watch this" scripts, ceremony scripts, parent-call-and-pose scripts, hand-of-help "settle down" gestures, queue / line / appointment agents, and meditation toys all use this path | One-shot per script invocation |
| 6 | **`ALTR` chemical adjustment** | `ALTR 203 <amount>` | Creature / bloodstream | The CAOS `ALTR` command performs a clamped adjustment to chemical 203. Functionally identical to `CHEM` for the purposes of the drive bar | One-shot per call |
| 7 | **Modder-added stimulus genes** | Custom `G_STIMULUS` entries with chemical 203 in `chemicalsToAdjust[4]` | Creature / bloodstream (systemic) | A modder adding a `STIM_HOLD_POSITION` (or repurposing an existing low-frequency stimulus) can pulse Wait alongside other chemicals when their event fires — e.g. on receiving a "stay" command from another creature, on entering a "queue here" trigger zone, on the start of a teaching demonstration, or as a counter-pulse following any of the directional drives to enforce a pause | One-shot per stimulus event |
| 8 | **Modder-added emitter genes** | Custom `G_EMITTER` reading some sensorimotor or attention locus and writing chemical 203 | Creature / Drives or modder-defined tissue | Genetic engineers wanting endogenous Wait can wire an emitter that reads a custom CAOS-managed "I should be paying attention here" locus (e.g. high attention on a fixed object, low movement velocity, or proximity to a designated "wait spot") and pulses chem 203 whenever those conditions hold. The emitter then auto-pulses Wait any time the creature is in a context that warrants stillness | Gene-dependent rate |
| 9 | **Modder-added reactions** | Custom reactions with chemical 203 as a product | Creature / bloodstream | A mod can plumb Wait into the wider chemistry — e.g. `Tiredness → Wait` so an exhausted creature wants to rest in place, `Fear + safe-marker → Wait` so a frightened creature in a safe spot freezes there, `Boredom + interesting-object → Wait` so a bored creature pauses to investigate, or annihilation pairs `Up + Wait → Wait` / `Exit + Wait → Wait` so the stay-still urge overrides directional urges. None of this exists in stock C3 | Gene-dependent |

The single most important consequence of points 1–4 is that **the stock genome's Wait drive is purely script-driven**. A creature in a world with no agents that pulse chem 203 will never have a non-zero Wait drive, and the drive 19 neuron will sit at zero forever — not because the wiring is broken, but because nothing is delivering input.

## Usage

| # | Mechanism | Gene / Code | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|-------------|----------------|-----------------|--------|
| 1 | **Drives-tissue "Drive 19" receptor — the sole stock consumer** | Gene 157 (receptor id 20) | Creature / Drives (tissue 5) | Locus 19 (`locusName` field reads `"Enter"` in `biochemistry.json:3722` — a copy-paste artefact; the authoritative drive-bar name from `Brain.catalogue:99` is **`"patient"`**), chemical 203 "Wait", threshold **0**, nominal **0**, gain **255 (maximum)**, analogue, flags 0, **switchOnAge 0 (Baby)** | Reads chemical 203 from the bloodstream and writes the gained level to `myDriveLoci[19]`. With threshold 0 the receptor responds linearly to any level above zero; with gain 255 (maximum) even a small chem 203 level produces a saturated drive-bar reading. The drive locus is then read every brain tick by `SensoryFaculty.updateDriveLobe()` which calls `brain.setInput('driv', 19, creature.getDriveLevel(19))`. The driv lobe's neuron 19 — labelled `"patient"` in `Brain.catalogue:99` — is the cognitive representation of the urge to hold still / wait |
| 2 | **`driv→comb` tract — concept association** | Genome's tract gene for `driv→comb` (associative tract from drive lobe to combination/concept lobe) | Brain / `driv→comb` tract | Drive 19's neuron state propagates along all dendrites of the `driv→comb` tract. Whichever concept neurons are co-firing have their dendrite weights updated by the standard Hebbian / Reward / Punishment loop. This is how Wait becomes associated with specific learned objects — teaching toys, ceremony stones, parent-while-speaking, "wait here" markers, queue zones, demo-machines | Drives the cognitive learning that ties the **feeling** of needing to hold position to the **objects/contexts** that historically resolved it |
| 3 | **`comb→decn` and `decn` selection — verb selection** | Stock decision-lobe wiring | Brain / decision lobe | The decision lobe reads concept-neuron activity weighted by the trained drive→concept dendrites and selects a verb. The 14 actually-selectable verbs (`Brain.catalogue:102-115`: look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit) **do not include any "wait" verb** — the catalogue's three `# not used:` placeholders (`"up"`, `"down"`, `"exit"`) do not include a "wait" placeholder either; Wait has no verb-name placeholder at all. The natural primary anchor is **`rest`** — the only stock verb that produces no locomotion — but Wait can equally be trained against `look` (turn attention without moving) or `express` (perform a gesture in place) | The drive does not control motor output directly; it modulates *what the creature wants to do* via the trained associative network, with `rest` as the typical action that satisfies the urge |
| 4 | **No involuntary-action receptor** | — | — | Unlike Pain, Coldness, Hotness, or Sex drive, **Wait has no sensorimotor receptor**. The chemical does not trigger reflex animations, automatic gait changes, an automatic "stop" behaviour, or any direct motor output. Its effect is purely cognitive | — |
| 5 | **No reactions consume Wait** | — | — | Chemical 203 does not appear as a reactant in any of the genome's 101 reactions. There is no antagonist (no chemical that destroys Wait the way Libido lowerer destroys Sex drive), no metabolic conversion, **no annihilation pairing with the directional drives** — high Up / Down / Exit / Enter and high Wait can co-exist in the bloodstream simultaneously | — |
| 6 | **No active → backup sweep** | — | — | The drive-pair sweep+drip pattern used by drives 0–14 (each main drive drains into a backup chemical at slots 131–145 and trickles back) is **entirely absent for navigation drives**. There is no "Wait backup" chemical at all — the navigation drive cluster ends at chemical 203, and no reservoir chemicals exist for them. The drive has no chemical memory beyond its own decay | — |
| 7 | **Passive decay** | Half-lives table entry for chemical 203 | Bloodstream | genomeValue **38**, half-life **43 ticks** (~1.43 s at 30 tps), decay rate **0.98399** per tick, speed class **"Short"** | Chemical 203 falls to half its level every ~43 ticks. Without continuous re-pulsing, an injection of `CHEM 203 100` decays to ~50 in 1.4 s, ~25 in 3 s, ~12 in 4.5 s, < 1 in ~10 s. This is the fastest decay tier of any drive chemical — Wait therefore does not accumulate over time the way Loneliness or Boredom do; it is a **per-event urge** |
| 8 | **No emitter consuming Wait** | — | — | No emitter reads chemical 203 to drive a sensorimotor output or another chemical. The chemical's only forward path is through the drive-bar receptor | — |
| 9 | **CAOS reads** | `CHEM 203` query, `DRV!` (driveset), drive-monitor agents, Science Kit chemistry graphs | Creature / bloodstream | Any CAOS script can read the current chemical 203 level and the drive-19 level, allowing agents to react to a creature's Wait urge — e.g. a teaching toy that delivers its lesson only while the student creature's Wait drive is high (i.e. the creature is paying attention and not about to wander off), a queue agent that grants service to whichever creature shows the strongest Wait drive, or a "patience reward" agent that pings Reward when a creature successfully holds Wait above threshold for N ticks | Read-only — the creature's behaviour is unchanged by the read |

## Role in Game Mechanics

### The "drive name vs chemical name" inversion — and the break in the pattern

The same naming convention used for the rest of the navigation drives applies to Wait, with one important difference: the chemical name describes the *action the creature wants to take*, while the drive-bar name describes the *feeling the creature has* — but unlike the four directional drives, **Wait's drive-bar name is unique** and not shared with any other drive:

- `ChemicalNames.catalogue:281`: chemical 203 = `"Wait"` — named for the **action the creature wants to take** (or rather, the *non-action*: hold still, do nothing).
- `Brain.catalogue:99`: drive 19 = `"patient"` — named for the **feeling the creature has** when the chemical is high. **Unique to drive 19** — does not duplicate the `"low down"` / `"high up"` / `"trapped"` / `"trapped"` strings used for drives 15–18.

A creature with `chem[203] = 200` has its Drive 19 receptor produce ~255 (gain 255 amplifies any non-trivial level), which the `driv` lobe interprets as the feeling "I am restless / impatient / I should be holding still". The "action" name in the chemical describes the *resolution*: wait, hold position, do nothing. Together with the four directional drives the cluster spans all five primitive movement urges:

| Chem | Chemical name | Drive 15-19 brain name | Meaning | Verb anchor |
|------|--------------|--------------------------|---------|-------------|
| 199  | Up           | low down                 | "I am too low — I should ascend" | up-stairs / up-lift agents |
| 200  | Down         | high up                  | "I am too high — I should descend" | down-stairs / down-lift agents |
| 201  | Exit         | trapped                  | "I feel enclosed — I should leave" | door / exit agents |
| 202  | Enter        | trapped                  | "I feel exposed — I should enter shelter" | home-door / shelter agents |
| 203  | Wait         | **patient**              | "I feel restless — I should remain still" | **rest** / look / express |

The unique `"patient"` label is significant — it confirms that Wait is the conceptual outlier of the cluster. The four directional drives all share duplicated labels because they come in axis-pairs (vertical, enclosure) where the drive-bar UI cannot meaningfully distinguish "want to go up" from "want to go down" without spatial context. Wait stands alone — it has no axis-partner — and so it gets its own distinctive label. The action it produces is also categorically different: the four directional drives all push the creature toward *more locomotion*; Wait pushes toward *less*.

### Why Wait has no biochemistry-side producer

The same architectural reasoning that motivated leaving Up, Down, Exit, and Enter purely script-driven applies symmetrically to Wait:

1. **"Should I hold still here" is not a chemical fact.** A real organism has body senses for fear, hunger, fatigue, and crowding, but not for "the situation requires me to wait" — that judgement requires knowledge of social conventions, queue rules, demonstration timing, parent-status, and other simulation-side data the chemistry organ does not have access to. The C3 designers therefore left the wait-axis to the agent layer that *does* know about contexts requiring stillness.
2. **The world is the source of truth.** Different worlds have different "wait here" semantics — teaching toys with different demonstration durations, ceremony stones with different sacred-pause requirements, queue agents with different service rates, parent-call scripts with different attention-spans. Encoding any one world's wait semantics in the genome would make the genome non-portable.
3. **Symmetry with the rest of the cluster keeps the design clean.** Up, Down, Exit, Enter, and Wait share decay, gain, threshold, switchOnAge, tissue, and the absence of producers. The five navigation drives are a coherent block with one consistent design rule: *receptor wired from Baby, biochemistry left to agents*.
4. **The receptor side is universal.** Every Norn, Grendel, and Ettin in the stock genome has the Drive 19 receptor wired identically from Baby. Whichever world a creature finds itself in, *if* an agent in that world pulses chem 203, the creature will respond in the same way — feel the "should hold still" urge, learn the association with the agent, and seek that pause-in-front-of-it behaviour again next time it feels restless.

### How Wait gets pulsed in the stock world

Concretely, in the C3 ship and the DS subnet, the Wait drive is pulsed by attention / patience / hold-position CAOS script paths:

1. **Teaching toy demonstrations.** When a teaching agent begins a multi-step lesson (e.g. word-noun association, gesture demonstration), it pulses Wait on the student creature so the creature is biased to stay and watch rather than wandering off mid-lesson.
2. **Ceremony / ritual scripts.** Bootstrap or modded scripts that simulate sacred-pause moments (e.g. the player-controlled "everyone hold still for the camera" gesture) pulse Wait to enforce the pause cognitively rather than mechanically.
3. **Parent-call-and-attend scripts.** Scripts that simulate a parent issuing a "pay attention" call pulse Wait so the offspring learns to settle in front of the parent and listen.
4. **Hand-of-help "settle down" gesture.** When the player wants to stop a creature that is bouncing between objects, hand-of-help scripts can pulse Wait to encourage the creature to pause and let the player intervene.
5. **Queue / line / appointment agents.** Agents that gate access to a resource by enforcing a queue (e.g. one creature at a time at a shared toy) pulse Wait on creatures that have arrived but are not yet at the front, so they learn to hold position.
6. **Counter-pulse for the directional drives.** A script that has finished pulsing Up/Down/Exit/Enter on a creature that has reached its destination can pulse Wait to mark "you have arrived; stop here" and prevent the creature from immediately wandering off.
7. **Modder-added meditation / observation toys** — observation posts, meditation mats, watch-points, sentry stations — all use the same `CHEM 203` injection pattern.

The reinforcement cycle mirrors that of the directional drives: agent pulses Wait, brain feels the "should hold still" urge, creature attends to the local context (teaching toy, ceremony stone, queue spot), `driv→comb` strengthens the dendrite from drive-19 to that concept, the agent stops pulsing on goal completion (lesson finished, ceremony over, queue served) and pulses Reward to lock in the lesson. Bugs in agent timing produce the same misbehaviours — a forgotten "stop pulsing on completion" creates a never-satisfied drive that teaches the wrong lesson.

### Wiring detail of the receptor

The exact receptor entry from `biochemistry.json:3712-3730`:

```json
{
  "id": 20,
  "geneId": 157,
  "switchOnAge": 0,
  "switchOnStage": "Baby",
  "organ": 1,
  "organName": "Creature",
  "tissue": 5,
  "tissueName": "Drives",
  "locus": 19,
  "locusName": "Enter",
  "chemical": 203,
  "chemicalName": "Wait",
  "threshold": 0,
  "nominal": 0,
  "gain": 255,
  "flags": 0,
  "flagsDescription": "none"
}
```

Three fields matter for behaviour:

- **`threshold = 0`**: the receptor fires for any chem 203 > 0. There is no minimum activation level. Even a small leftover decay tail still drives Drive 19 a little.
- **`nominal = 0`**: the drive's "satisfied" baseline is zero chemical. The drive is satisfied only when chem 203 is fully gone. There is no homeostatic setpoint above zero — Wait is purely a "presence-of-need" signal.
- **`gain = 255`**: the maximum possible gain. With `flags = 0` (analogue) the reading is `clamp(255 × chem, 0, 255)`, which saturates at chem 203 ≈ 1 (out of a 0–255 range). A `CHEM 203 1` write is enough to fully saturate the drive bar; `CHEM 203 200` does not produce any more drive than `CHEM 203 1` — the receptor is at ceiling for any non-trivial level.

The `locusName` field's stale `"Enter"` string is a debug-only label and is overridden in any UI that loads `Brain.catalogue` (which gives drive 19 its real name `"patient"`). Ports must read the *numeric* `locus: 19` field, not the string.

The implication is the same as for the rest of the cluster: **Wait is a binary-feeling drive** at the receptor side — either silent (chem 203 = 0) or fully on (chem 203 ≥ 1). The chemical's *quantitative* level affects only how long the drive stays active before decay drops it back to zero. A bigger pulse = longer-lasting urge.

### Why "Short" half-life matters — and why it matters most for Wait

The 43-tick half-life (~1.4 s at 30 tps) makes Wait a **per-event, ~10-second urge**:

- A `CHEM 203 100` injection is at ~50 after 1.4 s, ~25 after 3 s, ~12 after 4.5 s, ~6 after 6 s, ~3 after 7 s, < 1 after ~10 s.
- Throughout the first ~7 seconds the chemical is still > 1 and the receptor is saturated at gain 255 — Drive 19 stays at ~255.
- After ~10 seconds the chemical falls below the receptor's effective saturation level and Drive 19 declines meaningfully.
- The "felt" duration of one Wait pulse is therefore on the order of 10 seconds — comfortably long enough for a typical "hold still and watch" sequence to play out, short enough that the drive does not linger and freeze the creature in place after the lesson / ceremony / queue has finished.

The 10-second window is particularly important for Wait because the desired behaviour (stillness) competes with the creature's *baseline drift* tendency — random brain noise, micro-decisions to look around, low-level urges from other drives. Without a continuously re-pulsed Wait drive, even a creature that has decided to `rest` may within seconds drift into another verb selection. Teaching agents that need a creature to attend for 30+ seconds therefore have to keep re-pulsing Wait on every tick of the lesson, not just at lesson start.

### Wait is a verb-selector, not a movement-suppressor

A subtle but important architectural fact: Wait does **not** disable the motor faculty. It does not write a "stop signal" to the locomotion system, does not zero the velocity, does not lock the gait. All it does is bias the decision lobe toward verbs that don't move — primarily `rest`, secondarily `look` and `express`. The creature's actual stillness emerges from the decision lobe selecting `rest` and the motor faculty playing the rest animation, *not* from any chemical-level motor inhibition.

The practical consequences:

1. **A creature with no `rest` training will not wait well.** Even with chem 203 maxed out, a creature whose `driv→comb` network has never had drive-19 reinforced against `rest` (or any non-locomotion verb) will not know what to do with the urge. It might select random verbs, fidget, drift — the urge is a felt restlessness, not a motor lock.
2. **Other drives can override Wait.** If Pain or Hunger or Fear is screaming, the decision lobe will select the more urgent verb — flee, eat, escape — even with Wait saturated. Wait is one input among many to the decn lobe; it does not have priority.
3. **Wait and the directional drives can be co-saturated.** Pulsing both `CHEM 200 100` (Down) and `CHEM 203 100` (Wait) leaves the creature in a tug-of-war: drive 16 pushes for descent verbs, drive 19 pushes for `rest`. Whichever has stronger trained dendrites at the currently-attended concept wins. This is *not* a chemistry-level annihilation — both drive bars stay saturated; the conflict is resolved entirely in decision-making.

### Reinforcement learning and Wait

Because Wait has no biochemistry-side feedback, the drive **does not learn to satisfy itself the way the metabolic drives do**. The lesson loop is identical to the directional drives':

1. Teaching script writes `CHEM 203 100` when the creature is in front of the lesson agent — Wait drive rises.
2. Creature selects `rest` (or any non-locomotion verb); `driv→comb` Hebbian pass strengthens dendrite from drive 19 to teaching-toy concept.
3. Lesson completes; teaching script stops pulsing chem 203.
4. Teaching script writes `CHEM 204 50` (Reward) on successful attention — the brain's `driv→comb` tract picks up the Reward pulse and applies a positive STW change to the just-strengthened dendrite, locking in the lesson.
5. Chemical 203 decays from its leftover level; within ~10 s the drive bar is back to zero and the creature is free to wander off.

The agent author is responsible for the timing of all four chemical pulses (Wait, off-Wait, Reward, off-Reward). Same failure modes apply: skipping the Reward weakens the lesson; failing to stop pulsing Wait on completion teaches "this teaching toy did not satisfy my urge to wait" — exactly the wrong lesson, and one that can train the creature to *avoid* the toy in the future. This is particularly easy to get wrong for tick-driven scripts that re-pulse Wait every frame: the lesson must detect completion and stop the pulse cleanly, otherwise the leftover drive mid-decay teaches a "this object was almost-but-not-quite enough" failure association.

### What Wait is *not*

- **Wait is not a brain chemical.** Despite sitting at slot 203, immediately adjacent to the brain-chemistry block (Reward 204, Punishment 205, Brain chemical 9 206), Wait is a *drive* chemical. It is read by a Drives-tissue receptor, not by an SVRule operand in the brain. The chemical's effect on the brain is entirely indirect, through the drive-lobe input.
- **Wait is not a verb.** The decision-lobe action catalogue's actually-used 14 verbs (look, push, pull, deactivate, approach, retreat, get, drop, express, rest, left, right, eat, hit) do not include a "wait" or "hold" verb. The placeholder list (`"up"`, `"down"`, `"exit"`) does not contain a `"wait"` entry either. The creature cannot decide "I will wait"; it can only decide to `rest` (or `look`, or `express`) at a learned wait-context.
- **Wait is not a motor-inhibition signal.** No engine code reads chemical 203 and zeros the creature's velocity. The chemical's only effect is to bias the decision lobe toward non-locomotion verbs through the standard drive→concept→verb pipeline. A Wait-saturated creature whose decision lobe nonetheless picks `approach` will still walk forward.
- **Wait is not the chemical opposite of any one directional drive.** Although it conceptually contrasts with all four directional drives, the genome does **not** contain any annihilation reactions like `Up + Wait → 0`. High Wait can co-exist with high Up/Down/Exit/Enter; the conflict is resolved at the decision lobe by trained dendrite weights, not at the chemistry level.
- **Wait is not used by the per-tract reward system.** The opcode-59 / opcode-62 mechanism (`SET_REWARD_CHEMICAL_INDEX` / `SET_PUNISHMENT_CHEMICAL_INDEX`) reads chemicals 204 and 205. Chemical 203 plays no role in the generic reinforcement plumbing; it is a drive input, not a learning signal.
- **Wait is not pulsed by any stock stimulus gene.** Unlike Brain chemical 1 [198] (pulsed by `STIM_DISAPPOINT`), Reward [204] and Punishment [205] (pulsed by all the success/failure stimuli), Wait has *no stock stimulus producer*. The genome leaves the producer side entirely to the agent layer.
- **Wait is not the same as Tiredness.** A tired creature feels Tiredness [11/137] which is metabolically produced by the body and triggers `rest`-seeking via its own Drives-tissue receptor. Wait is a *separate* signal, with its own receptor and its own purely-script-driven inflow — it is the cognitive cue for "the situation requires you to be still", not the physiological cue for "your body needs sleep". A creature can be wide-awake (low Tiredness) and still have high Wait (e.g. attending a lesson), or exhausted (high Tiredness) and have zero Wait — the two drives are independent.
- **Wait is not the same as Boredom.** A bored creature feels Boredom [9/138] and is driven to seek novelty — the *opposite* behavioural prescription to Wait. The two can briefly co-exist (a creature waiting through a long boring ceremony) but the felt states are different and the verb-selection biases pull in opposite directions.

### Modding affordances

Wait shares the rest of the navigation cluster's clean extension-point profile because the producer side is empty:

- **Add an "attention" emitter.** A modded `G_EMITTER` reading the creature's current attention-target velocity (via a custom CAOS-managed locus) and writing chem 203 when attention is locked on a stationary high-interest object would give the creature an endogenous "hold and observe" drive.
- **Add a "courtesy" stimulus.** A `STIM_QUEUE_HERE` gene that pulses chem 203 (and possibly Crowded [157] suppression) every few ticks while the creature is in a designated queue zone would produce naturalistic line-waiting behaviour without per-creature CAOS scripts.
- **Wire Wait into the main reaction graph.** Modded reactions like `Tiredness → Wait` (tired wants to rest in place), `Fear + safe-marker → Wait` (frightened in a safe spot freezes there), `Pain + low-velocity → Wait` (injured creature should hold still), or annihilation pairs `Up + Wait → Wait` / `Boredom + Wait → Boredom` (one drive overrides the other) fold Wait into the chemistry network.
- **Add navigation backup chemicals.** Reserving five free slots can replicate the active/backup sweep+drip pattern from the main drive bank, giving Wait chemical memory beyond its 10-second decay.
- **Repurpose the slot.** Because the chemical has no stock biochemistry, modders can repurpose chem 203 entirely (e.g. as a "stage fright" axis for performance-shy creatures, a "meditation" axis for spiritual mods, or a generic "follow scripted choreography" axis) without colliding with any stock receptor / emitter / reaction.

### Practical consequences for gameplay

- **Norns in barren worlds never feel "patient".** A Norn loaded into a custom world with no agents pulsing chem 203 will have Drive 19 = 0 forever, regardless of how many lessons or ceremonies it might benefit from sitting through. The drive is not a sense organ; it is a script-driven cue.
- **Creatures learn wait-contexts, not the abstract concept of waiting.** The Hebbian association is from drive-19 neuron to *concept* neurons (specific teaching toys, specific ceremony stones, specific queue agents), not to a generalised "stillness" concept. A Norn that has learned to wait for teaching toy A will still need separate experience to learn teaching toy B unless they are categorised under the same concept (e.g. both are "machines" or both are "things that beep").
- **Disabled lesson scripts silently disable the drive.** If a world's teaching agents fail to install, the Wait drive stops being pulsed in classroom-like contexts. There is no biochemistry redundancy to mask the loss — creatures simply never feel the patience urge during lessons, which can manifest as Norns that wander away mid-demonstration with no apparent motivation to stay.
- **Tools / debug toys can prime the drive directly.** A Science Kit or debug tool that writes `CHEM 203 100` to the selected creature provides a one-click way to test that the Drive 19 receptor and `driv→comb` learning are wired correctly. The drive bar should saturate within one tick and decay over ~10 s; the brain should accept the drive as input and bias decision-making toward `rest` or whichever non-locomotion verb has the strongest trained association with the currently-attended concept.
- **Watching chem 203 in Kits diagnoses the patience pipeline.** A creature in an active world should show occasional chem 203 spikes whenever it is in front of a teaching toy, in a queue, or being demonstrated to. A flat-zero trace in a world that *should* be pulsing the chemical is a red flag that the lesson / ceremony / queue agents have failed to install or that their target-creature detection is broken.
- **The unique `"patient"` label makes Wait the easiest navigation drive to spot in the Drive Kit.** Unlike Up/Down/Exit/Enter which all share duplicated `"low down"` / `"high up"` / `"trapped"` labels, drive 19's `"patient"` is unique — making it visually unambiguous in any UI that displays drive bars by name.

### JS port notes

The Rebuild port treats chemical 203 as an ordinary bloodstream chemical with no special-case handling, parallel to the four directional navigation drives:

- **No `CHEM_WAIT` constant.** The chemical is referenced numerically by genome data only. There is no engine-level enum entry for chemical 203, no special path, no built-in producer.
- **The drive locus must be writable from the receptor.** `Rebuild/Main_Game/src/engine/creature/Creature.js:119` allocates `myDriveLoci` as a `Float32Array(NUM_DRIVES)` of size 20. The Drives-tissue receptor for chem 203 writes to `myDriveLoci[19]` via the standard receptor evaluator. `getDriveLevel(19)` returns this float, and `SensoryFaculty.updateDriveLobe()` propagates it to brain input `('driv', 19)`. Drive 19 is the **last** entry in the drive array (NUM_DRIVES = 20, indices 0–19); any port-side off-by-one in the LOC_DRIVE0 base address that overshoots by one would silently corrupt memory past the drive-loci array. The Wait drive is the canary for end-of-array bugs in the drive system.
- **The decay must implement the "Short" half-life correctly.** Half-life 43 ticks, decay rate 0.98399, must be applied every biochemistry tick. Because the receptor saturates at very low chemical levels (gain 255), small numeric errors in the decay loop accumulate visibly in the drive bar.
- **`CHEM 203` and `ALTR 203` must reach the same `myChemicalConcs[203]` slot the receptor reads.** Standard `getChemicalConcs()` live-reference invariant.
- **The receptor's stale `locusName: "Enter"` must not mislead the port.** The authoritative drive-bar name comes from `Brain.catalogue:99` (`"patient"`). Any UI that displays drive-bar names should ignore the `locusName` field from `biochemistry.json` for receptor 20 and use the catalogue value instead.
- **The drive 19 brain neuron's `"patient"` name is unique.** Unlike drives 15–18 which share duplicated names, drive 19 is the only `"patient"` neuron — UI code does not need to disambiguate it by integer index, but should still use the integer index for canonical identification to be consistent with how the directional drives are handled.

The most likely class of port bug specific to Wait is **agent-side**: if the teaching / ceremony / queue scripts in the bootstrap COS files fail to install correctly, the chemical never gets pulsed and the drive never engages. A secondary class of port bug is **end-of-array** issues — drive locus 19 is the highest valid drive index, and any indexing math that assumes "drives 0–18" or that uses `< NUM_DRIVES - 1` instead of `< NUM_DRIVES` will silently drop Wait from the drive sweep.

### Summary

```
   World event: lesson begins / ceremony starts / queue forms / "stay" command
                       │
        Agent script: CHEM 203 +amount
                       │
                       ▼
       Biochemistry: myChemicalConcs[203] += amount (clamped to 0..255)
                       │
                       ▼ (every biochem tick)
       Drives receptor 20: myDriveLoci[19] := clamp(255 × chem 203, 0, 255)
                       │
                       ▼ (every brain tick)
       SensoryFaculty.updateDriveLobe: brain.setInput('driv', 19, drive[19])
                       │
                       ▼
       driv lobe neuron 19 ("patient") = saturated while chem > 0
                       │
                       ▼ (next brain tick, driv→comb tract runs)
       Hebbian pass: dendrites from drive-19 → currently-firing concepts
                     have their STW updated by Reward / Punishment levels
                       │
                       ▼ (after ~10 seconds without re-pulse)
       Chemical 203 decays past saturation level → drive bar falls →
       creature no longer feels the urge to hold position

   Wait [203] is the navigation drive for stillness / patience / hold-position:
     - No biochemistry producer in the stock genome (CAOS-only inflow)
     - Single receptor at Drives locus 19, gain 255 (saturating)
     - Drive bar labelled "patient" in Brain.catalogue (drive 19) —
       UNIQUE name (not duplicated across drives like the four directionals)
     - Half-life 43 ticks ("Short") — pulse lasts ~10 seconds
     - Companion drives at 199, 200, 201, 202 (Up, Down, Exit, Enter) —
       the four directional drives; Wait is the lone non-directional drive
       in the navigation cluster
     - No dedicated verb — Brain.catalogue has no "wait" placeholder at
       all (not even in the # not used: section); the drive operates
       entirely via learned associations in the driv→comb tract toward
       the only stock non-locomotion verb (rest) and to a lesser extent
       look and express
     - Not a motor-inhibition signal — Wait biases verb selection toward
       rest/look/express, but does not zero velocity or lock the gait;
       stillness emerges from the decision lobe, not from chemistry
     - No annihilation reaction with the directional drives — Wait can
       co-exist with saturated Up/Down/Exit/Enter; conflict resolution is
       entirely brain-side via trained driv→comb associations
     - Agent-layer hook for teaching creatures to attend lessons,
       observe ceremonies, queue for resources, and respond to "stay"
       gestures
     - One of five fully-script-driven drives, designed to be portable
       across worlds with different attention / ceremony / queue mechanics
     - The last drive in the drive-loci array (locus 19, NUM_DRIVES = 20)
       — canary for end-of-array indexing bugs in the drive system
```

## Key Source References

- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:27-32` — the `# navigation drives` comment placeholder block marking 199–203 as the navigation-drive cluster
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:281` — chemical 203 named `"Wait"` in the main `chemical_names` array, the final entry of the Up/Down/Exit/Enter/Wait sequence
- `Rebuild/Assets/Catalogue/Brain.catalogue:79-100` — `"Creature Drives"` array; entry 19 is `"patient"`, the brain-side name for the drive bar fed by chemical 203 (note: unique label, not shared with any other drive)
- `Rebuild/Assets/Catalogue/Brain.catalogue:102-118` — `"Creature Actions"` array; 14 actually-used verbs followed by three `# not used:` placeholders (`"up"`, `"down"`, `"exit"`); confirms there is no `"wait"` placeholder verb at all — Wait operates only via learned associations to existing verbs, primarily `rest`
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:3712-3730` — the Drive 19 receptor (id 20, gene 157) reading chemical 203 with threshold 0, nominal 0, gain 255, switchOnAge 0 (Baby); `locusName` field reads `"Enter"` (stale debug string — the authoritative drive-bar name comes from `Brain.catalogue`)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:9144-9151` — half-life entry: genomeValue 38, halfLifeInTicks 43, decayRate 0.98398825, speed "Short"
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json:7076` — the genome's emitters table (43 entries); none target chemical 203
- `Rebuild/Main_Game/src/engine/creature/CreatureConstants.js:39-60` — `DriveOffsets` enum; the navigation drives occupy locus indices 15–19; Wait (locus 19) is the final drive
- `Rebuild/Main_Game/src/engine/creature/Creature.js:119` — `myDriveLoci = new Float32Array(NUM_DRIVES)` allocation (NUM_DRIVES = 20)
- `Rebuild/Main_Game/src/engine/creature/Creature.js:1641-1646` — `getDriveLevel(driveIndex)` returns `myDriveLoci[driveIndex]`
- `Rebuild/Main_Game/src/engine/creature/Creature.js:247-275` — `LOC_DRIVE0`-based ref creation for biochemistry receptors writing into drive loci; the receptor for chem 203 lands here at the final drive index
- `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:351-357` — `updateDriveLobe()` propagates `myDriveLoci[19]` to brain input `('driv', 19)` every brain tick
- `Rebuild/Main_Game/src/engine/creature/faculties/MotorFaculty.js:842-856` — `getActionName()`; the 14-verb action catalogue; confirms the absence of any "wait" verb in the decision lobe's actually-selectable verbs, and confirms `rest` as the only non-locomotion verb
- `Rebuild/DOCUMENTATION/chemicals/199 - Up.md` — sibling doc on the first vertical navigation drive; identical architecture
- `Rebuild/DOCUMENTATION/chemicals/200 - Down.md` — sibling doc on the second vertical navigation drive; identical architecture
- `Rebuild/DOCUMENTATION/chemicals/201 - Exit.md` — sibling doc on the first enclosure-axis drive; identical architecture
- `Rebuild/DOCUMENTATION/chemicals/202 - Enter.md` — sibling doc on the second enclosure-axis drive; identical architecture; the conceptual companion that completes the navigation cluster
