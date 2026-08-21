# Linguistic Faculty

The **LinguisticFaculty** is the creature's language and communication system — it manages vocabulary learning, speech generation, sentence parsing, and social intelligence. Every creature maintains a personal dictionary of imperfectly learned words, speaks in baby-talk that gradually improves, spontaneously expresses needs and opinions, responds to commands from the player and other creatures, and learns vocabulary by hearing speech.

## Position in the Faculty System

LinguisticFaculty is **faculty index 3** — it updates after the MotorFaculty (index 2). This ordering is architecturally critical: the creature must have a current action and attention target before the linguistic system can describe what it is doing or express opinions about what it sees.

```
Tick Order:  SensoryFaculty → Brain → MotorFaculty → LinguisticFaculty → Biochemistry → ...
             (perceive)       (think)  (act)          (speak)             (metabolise)
```

Speech only occurs when the creature is **alert** (awake) or in **zombie** state. Sleeping, unconscious, or dead creatures are silent.

## Core Architecture

### Word Types (8 Categories)

The linguistic system organises all words into 8 types, matching the original `LinguisticFaculty` enum:

| Index | Type | Count | Description |
|-------|------|-------|-------------|
| 0 | **VERB** | 16 (NUMACTIONS) | Action words — "push", "eat", "get", "look" |
| 1 | **NOUN** | 40 (numCategories) | Object category names — "food", "toy", "norn" |
| 2 | **DRIVE** | 20 (NUMDRIVES) | Negative drive states — "hungry", "tired", "lonely" |
| 3 | **SPECIAL** | 12 | Fixed semantic words — "yes", "no", "look", "what", "happy", "like", "dislike", "love", "hate", "maybe", "definitely", "ill" |
| 4 | **QUALIFIER** | 5 | Intensity words — "a bit", "quite", "very", etc. |
| 5 | **PERSONAL** | 1 | The creature's own name (slot 0 = ME) |
| 6 | **NICEDRIVE** | 20 (NUMDRIVES) | Positive drive states — "well-fed", "rested", "content" |
| 7 | **CREATURENAME** | dynamic | Other creatures' names — not stored in vocab, dynamically looked up from creature collection |

Each word slot (except CREATURENAME) is stored as a `Vocab` object containing:
- **platonicWord** — the correct spelling (target form)
- **outWord** — how the creature actually says it (may be mispronounced)
- **learnedStrength** — learning progress from 0.0 to 1.0

### Vocabulary Initialisation

When a creature is born, `Init()` loads random baby words from the catalogue based on genus:

| Genus | Catalogue Tag |
|-------|--------------|
| 1 (Norn) | "Default Norn Speak" |
| 2 (Grendel) | "Default Grendel Speak" |
| 3 (Ettin) | "Default Ettin Speak" |
| 4 (Geat) | "Default Geat Speak" |

Each word slot gets a random variant from 4 possible catalogue entries. The index formula is:

```
catalogueIndex = (noOfTypes - 1) * randomVariant + wordType
```

All initial words have `learnedStrength = 0.0` — the creature has heard the word but cannot say it at all.

## Pronunciation Learning System (Vocab Class)

The `Vocab` class implements a three-stage pronunciation learning system with two thresholds:

| Stage | Strength Range | Pronunciation | Method |
|-------|---------------|---------------|--------|
| 0 — Baby babble | 0.0 – 0.31 | Heavily garbled syllable repetition | `DoReallyTerribleInfantSpeak()` |
| 1 — Phonetic errors | 0.31 – 0.80 | Single phonetic substitution | `DoReasonablyGoodInfantSpeak()` |
| 2 — Perfect | 0.80 – 1.0 | Correct pronunciation | outWord = platonicWord |

### Learning Constants

```
PRONUNTHRES1 = 0.31    // Threshold: baby babble → phonetic errors
PRONUNTHRES2 = 0.80    // Threshold: phonetic errors → perfect
CONFIRM      = 0.14    // Strength gain when correct word heard
DENY         = 0.10    // Strength loss when wrong word heard
```

### Stage 0: Really Terrible Infant Speak

The babbling algorithm extracts the first consonant-vowel (or vowel-consonant) boundary from the platonic word, then duplicates it if the result is too short:

1. Find the first consonant position and first vowel position in the word
2. If word starts with a vowel: take characters up to first consonant + 1
3. If word starts with a consonant: take characters up to first vowel + 1
4. If the word is polysyllabic (> 5 chars with short result < 5) or the baby form is very short (< 3 chars): duplicate by appending the original word and truncating to 2× boundary length

**Examples:** "elevator" → "elel", "lift" → "li", "push" → "pupu"

**Important:** Babies (age 0, `learnedStrength = 0.0`) do NOT generate any pronunciation — the `learnedStrength > 0` guard in `InitWord()` skips the babble generation entirely, leaving `outWord` empty. A creature must hear a word at least once before it can attempt to say it.

### Stage 1: Reasonably Good Infant Speak

Uses a table of 18 phonetic substitution rules. Only **one** substitution is made per call, applied to the first matching rule:

| # | From | To | Example |
|---|------|----|---------|
| 1 | ph | f | "phone" → "fone" |
| 2 | ss | s | "hiss" → "his" |
| 3 | sh | th | "ship" → "thip" |
| 4 | s | th | "sun" → "thun" |
| 5 | th | d | "this" → "dis" |
| 6 | j | d | "jump" → "dump" |
| 7 | r | w | "run" → "wun" |
| 8 | ion | un | "station" → "statun" |
| 9 | in | im | "win" → "wim" |
| 10 | nn | n | "running" → "runing" |
| 11 | rr | r | "purring" → "puring" |
| 12 | ea | ee | "eat" → "eet" |
| 13 | ai | ay | "rain" → "rayn" |
| 14 | v | w | "very" → "wery" |
| 15 | ck | k | "kick" → "kik" |
| 16 | ng | nk | "sing" → "sink" |
| 17 | oa | ow | "boat" → "bowt" |
| 18 | or | aw | "for" → "faw" |

The single-substitution-per-call design means creatures gradually improve their pronunciation over multiple hearings rather than suddenly jumping to correct speech.

### HearWord — The Learning Mechanism

When a creature hears a word (via `HearWord()`):

1. **Correct match** (heard word = platonicWord): Strength increases by CONFIRM (0.14), bounded at 1.0. Pronunciation updates based on new strength thresholds.
2. **Incorrect match** (heard word ≠ platonicWord): Strength decreases by DENY (0.10), bounded at 0.0.
3. **Complete unlearning** (strength drops to 0.0): The old word is replaced entirely — platonicWord becomes the new word, baby babble is generated, and strength resets to CONFIRM (0.14).

### Age-Based Initial Strength

When `InitWord()` is called (e.g., via `SetWord()` or `LearnVocab()`), the initial learning strength depends on age:

| Age | Initial Strength | Starting Stage |
|-----|-----------------|----------------|
| Baby (0) | 0.0 | Silent — no pronunciation |
| Child (1) | 0.17 (PRONUNTHRES1 − CONFIRM) | Stage 0 — baby babble |
| Adolescent+ (2+) | 0.66 (PRONUNTHRES2 − CONFIRM) | Stage 1 — phonetic errors |

## Speech Generation

The LinguisticFaculty generates three types of spontaneous speech, each using localised syntax patterns for word ordering:

### Spontaneous Speech (Update Loop)

Each tick, if the sentence queue is empty, there is a **1/120 chance** (~0.83% per tick, roughly every 2 seconds at 60fps) of spontaneously generating speech. The type of speech depends on random odds and proximity to other creatures:

```
                          ┌──────────────────────┐
                          │   nearest creature    │
                          │   or pointer exists?  │
                          └─────────┬─────────────┘
                             yes    │    no
                    ┌───────────────┼───────────────┐
                    │               │               │
              odds > 0.7      odds > 0.5        always
            SayWhatDoing     SayWhatDoing    SayWhatDoing
                    │               │               │
              odds > 0.4      always           (never)
            ExpressNeed      ExpressNeed     ExpressNeed
                    │
              else
          ExpressOpinion(nearest)
```

### SayWhatDoing — Describing Current Action

Syntax pattern: `"pvn"` (personal + verb + noun), localised via `TranslateToLocal()`.

- **p (personal)**: 50% chance of saying own name. Each time the creature says its name, it reinforces its own name learning via `HearWord()`.
- **v (verb)**: The verb for the current motor decision (`getCurrentDecisionId()`).
- **n (noun)**: Only included if the current action requires an IT object (checked via `DoesThisScriptRequireAnItObject()`). Uses the current attention category.

The sentence is **shouted** so other creatures can learn the verb and noun words.

### ExpressNeed — Expressing Drive States

Syntax pattern: `"pqd"` (personal + qualifier + drive).

1. First checks **illness**: scans antigen chemicals (82–89). If any exceeds 0.2, the creature says "ill" with a qualifier.
2. If not ill, finds the **most pressing drive** (or uses a specifically requested drive).
3. Three expression modes based on drive level:
   - Level < 0.25 (no request): says "happy"
   - Level < 0.25 (requested): uses NICEDRIVE word with qualifier — "quite well-fed"
   - Level ≥ 0.25: uses DRIVE word with qualifier — "very hungry"

The qualifier is selected from the 5-slot QUALIFIER array based on intensity: `qualifier = floor(level × 5)`.

### ExpressOpinion — Social Commentary

Syntax pattern: `"poc"` (personal + opinion + creature/pointer name).

Uses the SensoryFaculty's `GetOpinionOfCreature()` which returns both an `opinion` (long-term) and `moodOpinion` (mood-influenced) value:

**Positive opinion (> 0.1):**
- If mood is bad (< 0.1): diverts to `ExpressNeed(ANGER)` or `ExpressNeed(FEAR)` instead
- opinion > 0.7 (non-Grendels): says "love [name]"
- Otherwise: says "like [name]"

**Negative opinion (< −0.1):**
- If mood is good (> −0.1): diverts to `ExpressNeed(SEXDRIVE)` or `ExpressNeed(LONELINESS)` instead
- opinion < −0.7: says "hate [name]"
- Otherwise: says "dislike [name]"

**Grendel social filter**: Grendels only express positive opinions about other Grendels. Non-Grendels express positive opinions about anyone.

**Creature naming**: When referring to another creature, the speaker uses the target's personal name. However, if the target's name is the default "me" or identical to the speaker's own name, the creature type noun is used instead.

## Sentence Queue

Sentences are not spoken immediately — they are queued in `mySentenceStack` (maximum **4** sentences). Each sentence has a delay counter.

### Delay System

The delay system uses a global `myStackCount` counter with post-decrement semantics:

1. When a sentence is queued to an empty stack, `myStackCount` is set to the sentence's delay value
2. Each tick, `myStackCount` is checked — if 0, the sentence is spoken and dequeued
3. After checking, `myStackCount` is decremented
4. When the next sentence becomes the front, `myStackCount` is set to its delay value

A delay of N means **N+1 ticks** before the sentence is actually spoken.

### Delay Constants

| Constant | Value | Usage |
|----------|-------|-------|
| LEARNING_DELAY | 1 | Echo-back when learning a word |
| NORMAL_DELAY_OFFSET | 4 | Standard speech delay |
| INTERMEDIATE_DELAY_OFFSET | 6 | Spontaneous speech |
| REPLY_TO_CREATURE_DELAY_OFFSET | 9 | Responses to other creatures |

## Say and Shout — Speech Delivery

### Say — Speech Bubble

`Say()` triggers a speech bubble via script event 126 (`SCRIPT_MAKE_SPEECH_BUBBLE`) broadcast to all agents. The creature also checks the `engine_dumb_creatures` game variable — if set to 1, voice synthesis is skipped entirely.

The voice system (not yet implemented in the web rebuild) loads voice data per genus/species/age and generates syllable sounds from the sentence text.

### Shout — Broadcasting to Other Creatures

`Shout()` broadcasts the sentence to **all creatures in the world** by calling `HearSentence()` on each creature's LinguisticFaculty. Unlike many other systems, shout has **no distance filtering** — all creatures hear every shout regardless of position.

The sentence includes the verb and noun IDs so that hearing creatures can learn the specific words even if they don't understand the full sentence.

## Sentence Parsing Engine

When a creature hears speech (via `HearSentence()`), the system processes it through multiple stages:

### Preprocessing

1. Convert to lowercase
2. Trim leading/trailing spaces
3. Add terminating space (for parsing)
4. Compress multiple spaces to single spaces

### Learn Command Detection

Before parsing, check for special learning commands of the form:
```
learn verb|noun|drive|qualifier|special|personal|nice_drive <id> <word>
perfect verb|noun|drive|qualifier|special|personal|nice_drive <id> <word>
```

"learn" teaches the word through `HearWord()` (gradual learning). "perfect" teaches it instantly via `SetWord()` with `perfect=true`.

### Word Matching (ParseSentence)

The parser scans the sentence left-to-right, trying to match increasingly long word sequences against the creature's vocabulary:

1. For each position, try matching from the current character to successively later spaces
2. Check the matched text against **outWord** (how the creature says it) and **platonicWord** (correct form)
3. If matched on outWord → `wordUnderstood = true`
4. If matched on platonicWord → `wordUnderstood = false` (the creature recognizes it but can't say it)
5. Build a syntax string from matched word types

**Special handling:**
- The pointer's **LOOK** word is checked separately before normal matching (because "look" may also be a verb)
- Only the **first** word of each type is accepted (except CREATURENAME, which always takes the latest)
- **DRIVE and NICEDRIVE are mutually exclusive** — recognising one cross-fills the other's slot to prevent hearing both
- If a word is recognised but not understood (`wordUnderstood = false`), the creature reinforces it via `HearWord()`

### Creature Name Matching

After checking the vocabulary, the parser checks against all other creatures' personal names (both outWord and platonicWord). Default "me" names are ignored. Matches are typed as `CREATURENAME` with the creature's collection index as the word ID.

### Inter-Creature Word Learning

If the speaker is a creature, and they explicitly mentioned verb/noun IDs in the shout that the listener didn't recognise in the sentence, the listener learns those words from the speaker — but only if the speaker knows them better (higher `learnedStrength`).

## Syntax Character Mapping

Each recognised word type maps to a syntax character for pattern matching:

| Word Type | Syntax Char | Notes |
|-----------|-------------|-------|
| VERB | `v` | |
| NOUN | `n` | |
| DRIVE | `d` | |
| NICEDRIVE | `z` | |
| PERSONAL | `p` | |
| CREATURENAME | `c` | |
| SPECIAL: YES | `g` | "good" |
| SPECIAL: NO | `b` | "bad" |
| SPECIAL: HAPPY, ILL | `h` | |
| SPECIAL: MAYBE | `1` | Weak qualifier |
| SPECIAL: DEFINITELY | `2o` | Strong qualifier + opinion (switch-case fall-through) |
| SPECIAL: LIKE, DISLIKE, LOVE, HATE | `o` | Opinion words |
| QUALIFIER | *(ignored)* | Qualifiers have no syntax character |

**Important**: The DEFINITELY → `2o` mapping reflects the original switch-case fall-through: when DEFINITELY is matched, the code adds `"2"` and then falls through into the LIKE/DISLIKE/LOVE/HATE case to also add `"o"`.

## Syntax Localisation

Before generating speech, base syntax patterns are translated to localised word order via catalogue arrays:

- `"Base Syntax"` — engine-standard patterns (e.g., `"pvn"`)
- `"Localised Syntax"` — per-language word order (e.g., `"vpn"` for verb-first languages)

When hearing speech, the reverse translation occurs: local → base syntax for semantic matching.

## Sentence Semantics — Response Patterns

After parsing produces a base syntax string, the creature responds based on pattern matching. Patterns are evaluated in priority order through an if/else-if chain:

### Simple Patterns

| Syntax | Condition | Response |
|--------|-----------|----------|
| `p` | Any speaker | Pay attention to speaker. **Wake up** if asleep. |
| `n` | Any speaker | Nudge attention to noun. Say word back if still learning, or if from agent help/pointer, or if noun is current focus. |
| `c` | Any speaker | Pay attention to named creature. |

### Pointer Reward/Punishment

| Syntax | Condition | Response |
|--------|-----------|----------|
| `pg`, `gp`, `g` | Pointer only | YES — triggers `STIM_POINTERYES` (reward, like pat) |
| `pb`, `bp`, `b` | Pointer only | NO — triggers `STIM_POINTERNO` (punishment, like slap) |

### Directed Commands

Matches patterns: `pv`, `vnp`, `1vnp`, `2vnp`, `pvn`, `pvc`, `1vcp`, `2vcp`

Also matches **undirected** patterns from pointer only: `vn`, `vc`, `v`, `1vc`, `2vc`, `1vn`, `2vn`

**Target resolution:**
1. If syntax contains `c`: pay attention to named creature, set as target
2. If noun matches pointer category: pointer is the target
3. If noun is present: nudge attention to noun
4. Otherwise (no noun, not "look" from pointer): use current attention object

**Social intelligence** (non-Grendel creatures):
- If asked to do a **bad action** towards a liked creature (opinion > 0.1): **refuse** — express opinion instead
- If asked to do a **good action** towards a disliked creature (opinion < −0.1): **refuse** — express opinion instead
- The bad action check applies only to non-Grendels; the good action check applies to **all** creatures

**Qualifier-based nudge strength:**

| Qualifier | Noun Nudge | Verb Nudge |
|-----------|-----------|-----------|
| Maybe (`1`) | 0.3 | 0.3 |
| Definitely (`2`) | 1.1 | 1.1 |
| Unqualified | 0.9 | 0.9 |

The verb nudge uses `GetNeuronIdFromScriptOffset()` to convert from script offset to brain neuron ID.

### Drive Questions (Pointer Only)

| Syntax | Response |
|--------|----------|
| `pd`, `dp`, `ph`, `hp`, `d`, `h` | Express the mentioned drive state |
| `pz`, `zp`, `z` | Express the mentioned nice-drive state |

### Creature-to-Creature Conversations

| Syntax | Condition | Response |
|--------|-----------|----------|
| `cd`, `d` | From creature | Respond with brain knowledge about the drive. 40% chance of ignoring. Uses `Brain.getKnowledge()` to find what action the listener would take, replies with `"1vnc"` syntax (qualifier + verb + noun + speaker name). |
| `poc`, `coc`, `cop`, `oc`, `op` | From creature or pointer | Express opinion about the named creature (or speaker for `op`). ~29% chance of ignoring creature speakers. Creatures reply with longer delay (9 ticks). |
| `on`, `nop`, `noc`, `con` | About pointer noun, from creature or pointer | Express opinion about the pointer (`on`, `con`, `nop`) or about a named creature (`noc`). ~29% chance of ignoring creature speakers. |

### Special Word Handling (Pointer Only)

After all pattern matching, special words from the pointer are handled:

- **LOOK**: Shifts attention to the agent under the pointer cursor. If a noun was mentioned and matches the category of the agent under the pointer, shifts to that specific agent.
- **WHAT**: Forces the creature to `SayWhatDoing()`.

### Brain Stimulation and Nudging

At the end of sentence processing (for all recognised sentences):

1. **Stimulus**: `STIM_POINTERWORD` (10) if speaker is pointer, `STIM_CREATUREWORD` (11) if speaker is creature
2. **Noun nudge**: If a noun was identified, set brain input on the `"noun"` lobe, modulated by `learnedStrength`
3. **Verb nudge**: If a verb was identified, set brain input on the `"verb"` lobe, modulated by `learnedStrength`

The word strength modulation means newly learned words have less brain impact than well-known ones, preventing babbled words from strongly influencing decisions.

### Incomprehensible Speech

If `ParseSentence()` fails to recognise any word:

1. **Agent help**: If the speaker is an agent help object (not a creature or pointer), learn the entire text as a noun for the speaker's category
2. **Category match**: If the speaker is a creature and the text matches their category name, learn it as that noun
3. **Gobbledygook stimulus**: Always triggers `STIM_GOBBLEDYGOOK` (9) to update boredom

## LearnVocab — Debug/Cheat Command

The `LearnVocab()` method (triggered by the CAOS `VOCB` command) instantly teaches all words perfectly:

- **Verbs**: from "Creature Actions" catalogue
- **Nouns**: from `CategorySystem` names (pointer gets its actual name)
- **Drives**: from "Creature Drives" catalogue
- **Specials**: from "Learnt Specials" catalogue
- **Qualifiers**: from "Learnt Qualifiers" catalogue
- **Personal**: from "Learnt Personals" catalogue (only if not already named)
- **Nice Drives**: from "Learnt Nice Drives" catalogue

All words set to `learnedStrength = 1.0` with perfect pronunciation.

## Serialisation (Binary Archive Format)

The LinguisticFaculty serialises to the `CreaturesArchive` binary format:

### Write Order

1. `base::Write()` — Faculty base class data
2. For each of 7 vocab types (VERB through NICEDRIVE):
   - `int32` — number of words in this type
   - For each word:
     - `string` — platonicWord
     - `string` — outWord
     - `float32` — learnedStrength
     - `bool` — myVoiceFileHasBeenInitialised (class-level field, same value per entry)
3. `int32` — myStackCount

### Read Order

Identical to write order. The voice-initialised boolean is read per entry but only the last value is retained (overwritten each iteration), matching the original behaviour.

## CAOS Command Integration

| Command | Description |
|---------|-------------|
| `VOCB` | Learn all vocabulary instantly (calls `LearnVocab()`) |
| `SAYN` | Creature expresses need by speaking (calls `ExpressNeed()`) |
| `LIKE` | State a personal opinion about a creature (calls `ExpressOpinion()`) |
| `SEZZ` | Make TARG speak a specific sentence |
| `HIST NAME` | When setting name, updates LinguisticFaculty personal word |

## Source Files

### JavaScript (Web Rebuild)
- `Main_Game/src/engine/creature/faculties/LinguisticFaculty.js` — Complete faculty implementation
- `Main_Game/src/engine/creature/language/Vocab.js` — Vocab class with learning system
- `Main_Game/src/engine/caos/commands/creatures/VOCB.js` — VOCB CAOS command
- `Main_Game/src/engine/caos/commands/creatures/SAYN.js` — SAYN CAOS command
- `Main_Game/src/engine/caos/commands/creatures/LIKE.js` — LIKE CAOS command
- `Main_Game/src/engine/caos/commands/sounds/SEZZ.js` — SEZZ CAOS command

## Architectural Notes

### Why No Distance Filtering on Shout

The original `Shout()` creates a `Stimulus` with `typeSHOU` and calls `Process(false)`, which broadcasts to all creatures in the world without distance checks. This is a design decision — creatures are meant to hear all speech in the world, enabling language learning across the entire ship. The hearing range concepts in the stimulus system only apply to certain delivery types, not SHOU.

### Vocabulary Size Asymmetry

VERB has 16 slots (NUMACTIONS) while NOUN has 40 slots (numCategories). This means creatures have a much richer object vocabulary than action vocabulary, reflecting the game's design where a few actions apply to many different kinds of objects.

### The DEFINATELY Fall-Through

The switch-case for DEFINATELY intentionally falls through to the LIKE/DISLIKE/LOVE/HATE case, producing syntax `"2o"` instead of just `"2"`. This means "definitely" is always treated as a qualified opinion, not just a standalone qualifier. The syntax patterns `"2vc"`, `"2vn"` etc. in the command handler use this to strengthen the brain nudge, while the `"o"` component allows the opinion-response patterns to also match.

### Mutual Exclusivity of DRIVE and NICEDRIVE

When the parser recognises a DRIVE word, it cross-fills the NICEDRIVE slot (and vice versa). This prevents a sentence from containing both "hungry" (DRIVE) and "well-fed" (NICEDRIVE), which would be contradictory. Only the first drive-type word heard in a sentence is accepted.
