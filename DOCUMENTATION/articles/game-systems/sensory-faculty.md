# Sensory Faculty

The **SensoryFaculty** is the creature's perceptual gateway — the first faculty to update each tick, responsible for everything the creature sees, smells, feels, and learns from. It bridges the physical game world to the neural brain by converting environmental data into neuron inputs across six brain lobes, manages the creature's memory of known agents and social relationships, and drives the reinforcement learning system that shapes behaviour over a lifetime.

## Position in the Faculty System

SensoryFaculty is **faculty index 0** — it updates before all other faculties every creature tick. This is architecturally critical: the brain (index 1) needs fresh sensory data to make decisions, the MotorFaculty (index 2) needs the brain's output, and downstream faculties need the results of motor actions.

```
Tick Order:  SensoryFaculty → Brain → MotorFaculty → LinguisticFaculty → Biochemistry → ...
             (perceive)       (think)  (act)          (speak)             (metabolise)
```

When the creature is not alert (asleep, unconscious, or dead), the entire `update()` method returns immediately — no sensory processing occurs. Dead creatures also ignore all stimuli.

## The Update Cycle

Each tick, the SensoryFaculty performs five sequential steps, each writing inputs to a specific set of brain lobes:

### Step 1: Situation Lobe (`situ`) — 9 neurons

The situation lobe encodes the creature's own state — "what is happening to me right now?"

| Neuron | Input | Value |
|---|---|---|
| 0 `AGE_LEVEL` | Current life stage | `age / 7` (normalised across 7 life stages) |
| 1 `IN_VEHICLE` | Being carried by a vehicle | 1.0 or 0.0 |
| 2 `CARRYING_SOMETHING` | Holding an object | 1.0 or 0.0 |
| 3 `BEING_CARRIED` | Movement status is CARRIED | 1.0 or 0.0 |
| 4 `FALLING` | Not on the ground | 1.0 if not stopped, 0.0 otherwise |
| 5 `NEAR_OPPOSITE_SEX` | Proximity to potential mate | `(visualRange - xDistance) / visualRange`, 0.0 if beyond range |
| 6 `MUSIC_MOOD` | Current music mood from MusicFaculty | 0.0–1.0 |
| 7 `MUSIC_THREAT` | Current music threat level | 0.0–1.0 |
| 8 `SELECTED_CREATURE` | Whether the player has selected this creature | 1.0 or 0.0 |

The opposite-sex distance uses **X-distance only** (matching the original engine's absolute-value approach) and requires the other creature to pass the `CanSee()` visibility check.

### Step 2: Detail Lobe (`detl`) — 11 neurons

The detail lobe describes the creature's current focus of attention — the **IT** object. If the creature has no IT object, this step is skipped entirely.

| Neuron | Input | Value |
|---|---|---|
| 0 | IT is being carried by me | 1.0 or 0.0 |
| 1 | IT is being carried by someone else | 1.0 or 0.0 |
| 2 | IT nearness | `(255 - 2*distance) / 255`, only if within 128 pixels |
| 3 | IT is a creature | 1.0 or 0.0 |
| 4 | IT is my sibling | 1.0 if shared mother or father moniker |
| 5 | IT is my parent | 1.0 if IT's moniker matches mother or father |
| 6 | IT is my child | 1.0 if IT's parent moniker is mine |
| 7 | IT is opposite sex | 1.0 if same family+genus but different sex |
| 8 | IT size | `(width + height) / 500.0` |
| 9 | IT smell emission | CA increase value of the IT agent |
| 10 | IT is falling | 1.0 if IT is not stopped |

Family relationships are determined by **moniker comparison** — each creature has a unique moniker and stores its mother's and father's monikers. This allows recognition of parents, children, and siblings without a global family tree.

### Step 3: Drive Lobe (`driv`) — 20 neurons

The simplest step: each of the 20 drive neurons receives the creature's current drive level directly from the biochemistry system. Drive levels are floating-point values representing motivational states like hunger, pain, fear, sleepiness, loneliness, and boredom.

### Step 4: Smell Lobe (`smel`) — up to 40 neurons

The smell lobe connects the creature's brain to the **Cellular Automata (CA)** environmental system. For each of the CA properties in the creature's current room:

1. The room's CA value is read from the MapManager
2. **Self-smell subtraction**: If the CA property maps to the creature's own category, its own emission contribution is subtracted (preventing self-detection)
3. The CA value is **injected into the biochemistry** as a chemical (`FIRST_SMELL_CHEMICAL + caIndex`, chemicals 160+), enabling receptor genes and chemical reactions to respond to environmental conditions
4. The value is mapped to a category ID via the `SmellCategoryMapper` and set as a brain input on the corresponding `smel` lobe neuron

This dual output — both to the brain AND to the biochemistry — is what allows creatures to both "smell" things neurally and have their body chemistry respond to environmental conditions.

### Step 5: Vision Lobe (`visn` / `elvn`) — up to 40 neurons each

The most complex step, performed in two passes:

**Pass 1 — Find Category Representatives** (per-category loop):

For each of the 40 agent categories, the faculty selects a single **representative agent** — the one agent of that type the creature is currently "aware of." The selection process:

1. **Persistence check**: If the current known agent is still visible AND the `noun` lobe neuron for this category has activity > 0.20 (the creature is "thinking about" it), keep the existing representative. This prevents attention shifts during ongoing actions.

2. **Agent discovery**: All visible agents matching the category's classifier are gathered and filtered by visual range (512 pixels). Invisible agents (`attrInvisible`) are excluded.

3. **Algorithm selection**: Each category has a configured selection algorithm (loaded from the "Category Representative Algorithms" catalogue entry):

| Algorithm | ID | Behaviour |
|---|---|---|
| Nearest in X direction | 0 | Smallest absolute X distance from creature centre to agent's interaction point |
| Random | 1 | Random selection from visible candidates |
| Nearest in current room | 2 | Like nearest-in-X but only agents in the same room |
| Nearest to ground | 3 | Agent closest in Y to the creature's feet |
| Random nearest in X | 4 | Randomly selects from the 5 nearest agents by X distance |

4. **VM stability**: For the random algorithms (1 and 4), if the creature's virtual machine is currently running a script, the old known agent is kept rather than picking a new random one. This prevents mid-script target switching.

**Carried Object Override**: After the loop, if the creature is carrying an object (and it is not invisible), that object always becomes the representative for its category.

**Pass 2 — Set Brain Inputs** (per-category loop):

For each category with a known agent, the normalised displacement is computed:
- `visn` neuron: `(agentCentreX - creatureCentreX) / visualRange`, clamped to [-1, +1]
- `elvn` neuron: `(agentCentreY - creatureCentreY) / visualRange`, clamped to [-1, +1]

Categories with no known agent receive 0.0 for both lobes.

Both creature and agent positions use `getCentre()` (bounding box centre), matching the original engine's centre method.

## The Category System

The game world's agents are organised into **40 categories** defined by the "Agent Categories" catalogue. Each category has:
- A **classifier pattern** (family/genus/species) from "Agent Classifiers" — with 0 as wildcard
- A **human-readable name** from "Agent Categories"
- A **representative selection algorithm** from "Category Representative Algorithms"

Categories include things like: norn, grendel, ettin, food, toys, machines, lifts, doors, eggs, and creature-specific smell categories.

The `CategorySystem` static class (extracted from the original engine's static members of SensoryFaculty) manages this catalogue data and provides:
- `getCategoryIdOfAgent(agent)` — returns category index for an agent
- `getCategoryIdOfClassifier(classifier)` — returns category for a classifier pattern
- `getNumCategories()` — typically 40
- `getCategoryName(id)` — human-readable name
- `getCategoryAlgorithm(id)` — selection algorithm for the category

When no category matches, the fallback `ourCategoryIdError` (39) is returned.

## The Known Agents System

`myKnownAgents` is an array of 40 slots — one per category. Each slot holds a reference to the single agent currently representing that category for this creature. This is the creature's "working memory" of the world.

Key methods:
- `getKnownAgent(categoryId)` — returns the current representative (or null)
- `setKnownAgent(categoryId, agent)` — sets the representative

The known agent for the attention lobe's winning category becomes the creature's **IT object** — the target of its next action. The MotorFaculty reads the winning attention category and retrieves the corresponding known agent.

## The Friend/Foe System

The friend/foe system maintains a per-creature social memory using the brain's `forf` (friend-or-foe) lobe. Each neuron in the forf lobe represents a remembered creature or the pointer agent.

### Data Structures

Three parallel arrays, sized to `forfLobeSize - 1` (one spare for dendrite migration):
- `myFriendsAndFoeHandles[]` — agent references (null if slot is empty or agent destroyed)
- `myFriendsAndFoeMonikers[]` — moniker strings (persist across export/import)
- `myFriendsAndFoeLastEncounters[]` — tick timestamps of last encounter

### Adding a Friend/Foe

`addFriendOrFoe(agent)` — triggered when a creature or pointer is first seen:

1. **Rate limiting**: Only one new friend/foe can be added per tick (`myAddedAFriendOnThisUpdate`), ensuring dendrite migration has time to settle.
2. **Slot selection**: Prefers never-used slots (null handle + empty moniker), then falls back to the oldest invalid-handle slot.
3. **Kinship-based initialization** of the forf neuron's `STATE_VAR` (initial friendliness):

| Relationship | Initial `STATE_VAR` |
|---|---|
| Parent or child | 0.8 (immediate love) |
| Sibling | 0.225 |
| Same genus (not grendels) | 0.175 |
| Stranger or pointer | `FOURTH_VAR` set to -1.0 ("clear and relearn") |

4. **Dendrite migration flagging**: Sets `NGF_VAR = 1.0` on the forf neuron and flags related combination lobe (`comb`) concept neurons for dendrite migration. This uses the "Good Action Script" and "Bad Action Script" catalogue entries to identify which action+category combinations should have their dendrites migrate toward this new friend's neuron.

### Neuron Variable Usage

Each forf lobe neuron uses its state variables:

| Variable | Purpose |
|---|---|
| `STATE_VAR` (0) | Opinion/friendliness level (-1 to +1) |
| `OUTPUT_VAR` (2) | Mood-based opinion output |
| `THIRD_VAR` (3) | "This creature is currently acting upon me" flag |
| `FOURTH_VAR` (4) | Set to -1.0 to signal "clear and relearn" |
| `FIFTH_VAR` (5) | "Currently visible" flag (set each tick, cleared at start) |
| `NGF_VAR` (7) | Neural Growth Factor — flags for dendrite migration |

### Visibility Tracking

Each tick during vision processing:
1. `clearSeenFriendsOrFoes()` resets `FIFTH_VAR` and `NGF_VAR` on all forf neurons
2. For each visible creature/pointer found as a category representative, `setSeenFriendOrFoe(agent)` sets `FIFTH_VAR = 1.0`
3. If the agent isn't already in the list, `addFriendOrFoe()` is called to register it

### Interaction Tracking

- `setCreatureActingUponMe(agent)` — sets `THIRD_VAR = 1.0` on the forf neuron for the given creature, signalling to the brain which creature is currently interacting with this one. Used during CAOS creature interaction scripts.

### Opinion Query

- `getOpinionOfCreature(agent)` — returns `{ opinion, moodOpinion }` by reading `STATE_VAR` and `OUTPUT_VAR` from the forf neuron. Used by the LinguisticFaculty for expressing attitudes ("I like/dislike X").

### Removal and Cleanup

- `removeFriendAndFoe(agent)` — clears a specific slot
- `removeFromAllFriendAndFoe(agent)` — iterates ALL creatures in the world and removes the given agent from every creature's friend/foe list. Called when a creature dies (from `LifeFaculty`).
- `cleanUpInvalidFriendAgentHandles()` — called at the start of each update to null out handles pointing to destroyed agents.

## The Stimulus System

Stimuli are the primary mechanism for delivering rewards, punishments, and behavioural nudges to creatures. Each creature has a personal **stimulus library** of 99 entries, initialised from genome genes and potentially modified during life.

### Stimulus Library

The `StimulusLibrary` (wrapping the `myStimulusLib[NUMSTIMULI]` array) contains stimulus response definitions loaded from the genome's G_STIMULUS genes. Each stimulus definition includes:
- Noun and verb stim strengths and IDs
- Up to 4 chemical adjustments (chemical ID + adjustment amount)
- Bit flags (MODULATE, IFASLEEP, per-slot training-off flags)
- Strength multiplier

### Stimulus Delivery Types

Stimuli reach creatures through four delivery mechanisms:

| Type | CAOS Command | Delivery |
|---|---|---|
| `SHOU` (0) | `STIM SHOU` | All creatures that can HEAR the source |
| `SIGN` (1) | `STIM SIGN` | All creatures that can SEE the source |
| `TACT` (2) | `STIM TACT` | All creatures that can TOUCH the source |
| `WRIT` (3) | `STIM WRIT` | Only the specific target creature |

### Processing Pipeline

When `stimulate()` is called:

1. **Dead check**: Dead creatures ignore all stimuli.

2. **Sleep attenuation**:
   - If the creature is asleep and the stimulus does NOT have the `IFASLEEP` flag, it is blocked entirely
   - Exception: if the incoming sentence matches the creature's own name, it wakes the creature up
   - If `IFASLEEP` is set, both `verbStim` and `nounStim` are halved

3. **Language processing**: The incoming sentence (if any) is passed to `LinguisticFaculty.hearSentence()` for word learning and semantic processing.

4. **Attention/Decision nudging** (the "URGE" macro):
   - If `nounStim > 1.0`: forces attention override via `MotorFaculty.setAttentionOverride()` (the creature MUST look at this category)
   - Otherwise: sets the `noun` lobe neuron for the target category at `nounStim` strength
   - If `verbStim > 1.0`: forces decision override via `MotorFaculty.setDecisionOverride()` (the creature MUST perform this action)
   - Otherwise: sets the `verb` lobe neuron (translated via `getNeuronIdFromScriptOffset()`) at `verbStim` strength

5. **Chemical adjustments** (the "SWAY" macro): Up to 4 chemicals can be adjusted, each either with or without training (learning), controlled by per-slot training-off bit flags.

### The Learning System

When a chemical adjustment has training enabled, `adjustChemicalLevelWithTraining()` implements the creature's reinforcement learning:

**If asleep/dreaming**: The adjustment goes to the `prox` (proximal) lobe, providing dream-based reinforcement.

**If alert**: The adjustment goes to the `resp` (response) lobe, providing active reinforcement. However, when **synchronous learning** is enabled (via the `engine_synchronous_learning` game variable), two additional checks are performed:

1. **Decision/Script match**: The creature's current decision (from MotorFaculty) must correspond to the script event that triggered the stimulus. This prevents learning from unrelated events.
2. **Attention match**: The creature's IT object must still be the agent that sent the stimulus. This prevents learning from events happening to a different target.

If either check fails, the learning signal is suppressed — the chemical adjustment still happens (the creature still "feels" the effect), but the brain does not reinforce the association. This is critical for correct behavioural conditioning: without synchronous learning, creatures would form incorrect associations between their actions and their consequences.

## Attention Control

Two methods allow external systems to direct the creature's attention:

### payAttentionToCreature(lookAtCreature)

Forces the creature to focus on a specific creature. Requires:
- The target must be a creature (not a general agent)
- The creature must be able to see the target (`CanSee()`)
- The creature must be alert

Sets the target as the known agent for its category, updates visual inputs, and clears the noun neuron activity for that category (resetting the persistence check).

### payAttentionToAgent(agent)

Same as above but works for **any agent type** (not just creatures). Additionally calls `setSeenFriendOrFoe()` for the target. Used by CAOS commands and the language system to direct attention to objects.

## Smell Integration

The smell system creates a bidirectional link between the environment and the creature:

**Environment to creature**: CA room properties are read and set as both brain inputs (smel lobe) and biochemistry chemicals (FIRST_SMELL_CHEMICAL + caIndex). The `SmellCategoryMapper` translates CA property indices to agent category IDs.

**Self-smell subtraction**: When the CA property corresponds to the creature's own category, the MapManager's `getRoomPropertyMinusContribution()` is used to subtract the creature's own emission. This prevents a norn from smelling itself and being attracted to its own location.

**Biochemistry integration**: By injecting CA values into chemicals 160+, the creature's body can respond to environmental conditions through receptor genes. For example, a genome could wire a receptor to respond to high food-smell concentrations by reducing hunger drive.

## Brain Lobe Interaction Summary

The SensoryFaculty writes to 12 brain lobes:

| Lobe | Size | Source | Written By |
|---|---|---|---|
| `situ` | 9 | Creature's own state | `updateSituationLobe()` |
| `detl` | 11 | IT object properties | `updateDetailLobe()` |
| `driv` | 20 | Biochemistry drive levels | `updateDriveLobe()` |
| `smel` | 40 | Room CA properties | `updateSmellLobe()` |
| `visn` | 40 | X displacement of category reps | `updateVisionLobe()` |
| `elvn` | 40 | Y displacement of category reps | `updateVisionLobe()` |
| `noun` | 40 | Attention nudges from stimuli | `processStimulus()` |
| `verb` | 14 | Action nudges from stimuli | `processStimulus()` |
| `forf` | varies | Per-creature social memory | Friend/foe methods |
| `comb` | 40x14 | Concept neuron migration flags | `flagConceptNeuronsForMigration()` |
| `resp` | 20 | Reinforcement signal (awake) | `adjustChemicalLevelWithTraining()` |
| `prox` | 20 | Reinforcement signal (asleep) | `adjustChemicalLevelWithTraining()` |

## Key Constants

| Constant | Value | Purpose |
|---|---|---|
| `VISUAL_RANGE` | 512 | Maximum visual range in pixels |
| `NUMDRIVES` | 20 | Number of biochemistry drives |
| `CA_PROPERTY_COUNT` | 16 | Number of Cellular Automata properties per room |
| `FIRST_SMELL_CHEMICAL` | 160 | First biochemistry chemical for smell injection |
| `NO_RANDOM_NEAR_AGENTS` | 5 | Maximum agents in random-nearest selection pool |
| `NEAR_RAND_VISUAL_RANGE` | 200 | Distance threshold divisor for random-nearest |
| `NUMSTIMULI` | 99 | Number of built-in stimulus definitions |
| `NUMAGES` | 7 | Number of creature life stages |

## File Locations

| File | Description |
|---|---|
| `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | JS implementation |
| `Rebuild/Main_Game/src/engine/creature/perception/CategorySystem.js` | Category management (extracted from the original engine's static members) |
| `Rebuild/Main_Game/src/engine/creature/perception/StimulusLibrary.js` | Stimulus library wrapper |
| `Rebuild/Main_Game/src/engine/creature/perception/Stimulus.js` | Individual stimulus definition |
| `Rebuild/Main_Game/src/engine/creature/perception/PerceptionConstants.js` | Shared constants |
| `Rebuild/Main_Game/src/engine/world/SmellCategoryMapper.js` | CA-to-category mapping |
| `Rebuild/Main_Game/src/engine/creature/brain/BrainScriptFunctions.js` | Script-to-neuron ID mapping |

## Serialisation

The SensoryFaculty serialises in this order (matching the original engine's `Write()`/`Read()` format):

1. Base Faculty data (creature handle)
2. `myKnownAgents[40]` — 40 agent handles (no count prefix)
3. `myStimulusLib[99]` — 99 stimulus objects (no count prefix)
4. `myFriendsAndFoeHandles` — vector with count prefix
5. `myFriendsAndFoeMonikers` — vector with count prefix
6. `myFriendsAndFoeLastEncounters` — vector with count prefix
7. `myAddedAFriendOnThisUpdate` — boolean

After deserialisation, `ResolveFriendAndFoe()` reconnects agent handles by matching monikers to creatures currently in the world, enabling friend/foe relationships to survive world saves and creature exports/imports.
