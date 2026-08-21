# Hearing System

The **hearing system** is the engine-side pipeline that determines which creatures can receive auditory stimuli — speech, shouts, and sound-based interactions. Unlike vision and smell, hearing has **no dedicated brain lobe**. Instead, it acts as a **delivery gate** on the stimulus system: a creature can only receive a `SHOU`-type stimulus if it passes the `CanHear()` range check. Once delivered, the stimulus is processed through the SensoryFaculty and LinguisticFaculty exactly like any other stimulus.

Hearing is architecturally simple compared to vision (which has two lobes, 5 selection algorithms, and per-category representatives). It is a binary distance check that answers one question: "Is the speaker close enough and in the same MetaRoom?"

**Key stats**: No dedicated lobe, shared `myGeneralRange` with vision (default 512px), same-MetaRoom requirement, squared-distance comparison.

---

## Architecture

The complete hearing pipeline flows from a speaker's action to the listener's internal response:

```
                    HEARING SYSTEM PIPELINE

  Speaker (Creature or Agent)
         │
         ▼
  LinguisticFaculty::Shout()
  Creates Stimulus with typeSHOU
         │
         ▼
  Stimulus::Process()
  Iterates ALL creatures in the world
         │
         ▼
  ┌─────────────────────────────────┐
  │   For each creature:            │
  │                                 │
  │   creature.CanHear(speaker)?    │
  │     1. Not self?                │
  │     2. Both in valid MetaRooms? │
  │     3. Same MetaRoom?           │
  │     4. Within audible range?    │
  │            │                    │
  │       YES  │  NO                │
  │        │   └──► skip            │
  │        ▼                        │
  │   SensoryFaculty::Stimulate()   │
  └─────────────────────────────────┘
         │
         ▼
  ┌─────────────────────────────────┐
  │  Sleep/Death Gate               │
  │  - Dead? → discard entirely     │
  │  - Asleep + no IFASLEEP flag?   │
  │    → check name-wake, discard   │
  │  - Asleep + IFASLEEP flag?      │
  │    → halve verb/noun stim       │
  └─────────────────────────────────┘
         │
         ▼
  LinguisticFaculty::HearSentence()
  Parses speech, learns words
         │
         ├──► Brain nudge (noun/verb neurons)
         ├──► Chemical adjustments (SWAY)
         └──► Wake-up if name spoken
```

---

## The CanHear() Check

`CanHear()` is defined on `Agent` (not on creatures specifically), meaning any agent type can be a potential listener or speaker. The check is straightforward:

```text
CanHear(other):
    // Can't hear self
    if self == other:
        return false

    v1 = GetCentre()
    v2 = other.GetCentre()

    if GetMetaRoomIDForPoint(v1, v1id) and GetMetaRoomIDForPoint(v2, v2id):
        if v1id == v2id:  // Must be in same MetaRoom
            audioRange = GetAudibleRange()
            return v1.SquareDistanceTo(v2) <= (audioRange * audioRange)
    return false
```

### Rules

| Rule | Description |
|---|---|
| Not self | A creature cannot hear itself |
| Valid positions | Both agents must be at positions that resolve to a valid MetaRoom |
| Same MetaRoom | Both agents must be in the **same** MetaRoom — sound does not cross MetaRoom boundaries |
| Within range | Euclidean distance (squared) from centre to centre must be within `GetAudibleRange()` |

### Audible Range

The audible range is **identical** to the visual range — both return `myGeneralRange`:

```text
GetVisualRange()  returns myGeneralRange
GetAudibleRange() returns myGeneralRange
GetGeneralRange() returns myGeneralRange
```

The range is configurable between **1.0** and **2000.0** pixels via `SetGeneralRange()`. There is no separate "hearing range" property — visual and audible ranges are always coupled.

### Comparison with CanSee()

| Property | `CanHear()` | `CanSee()` |
|---|---|---|
| Range source | `myGeneralRange` | `myGeneralRange` |
| MetaRoom check | Same MetaRoom required | Same MetaRoom required |
| Distance metric | Euclidean (squared) | Euclidean (squared) |
| Self check | Cannot hear self | Cannot see self |
| Attribute filter | None | `attrInvisible` agents excluded |
| Line of sight | Not checked (sound passes through walls) | Not checked (vision passes through walls too) |

The key difference: `CanSee()` excludes agents with the `attrInvisible` attribute, but `CanHear()` does **not** check invisibility. An invisible agent can still be heard.

---

## Stimulus Delivery Types

Hearing is one of four stimulus delivery mechanisms. The `Stimulus::Process()` method determines which creatures receive a stimulus based on its type:

```text
if   stimulusType == typeWRIT: deliver if c == toCreature
elif stimulusType == typeSHOU: deliver if c.CanHear(fromAgent)
elif stimulusType == typeSIGN: deliver if c.CanSee(fromAgent)
elif stimulusType == typeTACT: deliver if c.CanTouch(fromAgent)
else: do not deliver
```

| Type | ID | Gate Function | CAOS Command | Description |
|---|---|---|---|---|
| `typeSHOU` | 0 | `CanHear()` | `STIM SHOU` | All creatures within audible range in the same MetaRoom |
| `typeSIGN` | 1 | `CanSee()` | `STIM SIGN` | All creatures within visual range (excludes invisible) |
| `typeTACT` | 2 | `CanTouch()` | `STIM TACT` | All creatures within touch distance |
| `typeWRIT` | 3 | Direct match | `STIM WRIT` | Only the specific target creature (no range check) |

The `Process()` method iterates **every creature in the world** and applies the appropriate gate function. For `typeSHOU`, each creature calls `CanHear()` on the source agent — if it returns true, the creature receives the stimulus.

---

## The Speaker Side: Shout()

Creatures broadcast speech through `LinguisticFaculty::Shout()`:

```text
Shout(sentence, verb, noun):
    s.stimulusType = typeSHOU
    s.incomingSentence = sentence
    s.fromAgent = myCreature
    s.nounIdToStim = noun
    s.verbIdToStim = verb
    s.Process(false)  // false = don't auto-set nounId from agent category
```

Key details:
- The stimulus type is `typeSHOU`, triggering `CanHear()` checks during delivery
- The sentence text is attached as `incomingSentence`
- Noun and verb IDs are passed for brain nudging (allowing the speaker to direct attention)
- `Process(false)` — the `false` parameter prevents automatic noun-ID assignment from the speaker's category, because speech explicitly carries its own noun/verb identifiers

---

## The Listener Side: HearSentence()

When a creature passes the `CanHear()` gate, `SensoryFaculty::Stimulate()` routes the speech to `LinguisticFaculty::HearSentence()`:

```text
c.Linguistic().HearSentence(s.fromAgent, s.incomingSentence, s.verbIdToStim, s.nounIdToStim)
```

### HearSentence Processing Pipeline

`HearSentence()` performs these steps:

**1. Validation**
- Speaker must be valid
- Sentence must have content
- Cannot hear yourself (self-talk filtered)

**2. Preprocessing**
- Convert to lowercase
- Trim leading/trailing whitespace
- Compress multiple spaces into one
- Append a trailing space (parser requirement)

**3. Learn-Sentence Check**
- If the sentence matches the format `"learn verb|noun|drive|qualifier|special|personal <number> <word>"`, the creature learns the word and returns early

**4. Sentence Parsing**
- `ParseSentence()` attempts to understand the sentence using the creature's vocabulary
- If parsing fails (incomprehensible speech):
  - If the speaker is a non-creature, non-pointer agent whose name matches its category, the creature learns the sentence as a noun for that category
  - `STIM_GOBBLEDYGOOK` (stimulus #9) is fired — the creature "heard gibberish"

**5. Semantic Processing** (if parsing succeeds)
- The parsed sentence is interpreted as a directive, question, or statement
- Noun and verb brain neurons are nudged based on the sentence content
- Built-in stimuli may fire:
  - `STIM_POINTERWORD` (#10) — heard the user (pointer) speak
  - `STIM_CREATUREWORD` (#11) — heard another creature speak
  - `STIM_CREATUREYES` (#41) — heard a creature say "yes"
  - `STIM_CREATURENO` (#43) — heard a creature say "no"

### Sleep Gate and Name Wake-Up

Before `HearSentence()` is called, `SensoryFaculty::Stimulate()` applies sleep filtering:

```text
if not c.Life().GetWhetherAlert() and not c.Life().GetWhetherZombie():
    if not (s.bitFlags has IFASLEEP):
        // saying the creature's name wakes it up:
        if c.Life().GetWhetherAsleep() and
           s.incomingSentence == c.Linguistic().GetPlatonicWord(PERSONAL, ME):
            c.Life().SetWhetherAsleep(false)
        return  // stimulus blocked
    s.verbStim /= 2.0   // attenuate if IFASLEEP flag is set
    s.nounStim /= 2.0
```

- **Dead creatures** ignore all stimuli entirely (checked first)
- **Sleeping creatures** block most stimuli, but:
  - If the incoming sentence matches the creature's **own name** (its "personal ME" word), it **wakes up**
  - If the stimulus has the `IFASLEEP` flag, it passes through with halved verb/noun stim strength

---

## Crowding Score: HowManyCreaturesCanIHear()

The `AgentManager` provides a utility function that computes a "crowding score" based on hearable creatures:

```text
HowManyCreaturesCanIHear(me, score):
    for each creature in world:
        if me.CanHear(creature):
            tmp = me.GetAudibleRange() - abs(me.x - creature.x)
            score += (tmp * tmp)
```

This weighted score favours nearby creatures (closer = higher contribution) and is used by the crowding drive system — creatures that hear many others nearby feel "crowded."

---

## Brain Integration: No Hearing Lobe

Unlike vision (`visn` + `elvn`), smell (`smel`), or drives (`driv`), hearing has **no dedicated brain lobe**. The brain is affected by hearing only indirectly:

| Mechanism | Brain Effect | Triggered By |
|---|---|---|
| Noun neuron nudge | `noun` lobe input set at `nounStim` strength | Parsed speech content or STIM command |
| Verb neuron nudge | `verb` lobe input set at `verbStim` strength | Parsed speech content or STIM command |
| Attention override | MotorFaculty forced to specific category | `nounStim > 1.0` |
| Decision override | MotorFaculty forced to specific action | `verbStim > 1.0` |
| Chemical adjustment | Up to 4 chemicals injected into bloodstream | Stimulus library definition (SWAY) |
| Reinforcement learning | `resp` or `prox` lobe signal | Chemical adjustment with training enabled |

The hearing system's brain influence is entirely mediated through the **stimulus processing pipeline** in `Stimulate()` — the same pathway used by all stimulus types. There is no per-tick "hearing update" like the vision or smell updates.

### Why No Hearing Lobe?

In the Creatures 3 design, hearing serves a fundamentally different purpose than vision or smell:

- **Vision** answers "what is around me?" — requires continuous per-tick scanning and spatial encoding across 40 categories
- **Smell** answers "what is in the environment?" — requires per-tick room CA property reading
- **Hearing** answers "did someone just say something?" — it is **event-driven**, not continuous

A hearing lobe would need to encode "what am I currently hearing" every tick, but speech is transient — a creature shouts once and the stimulus is delivered. There is no persistent auditory field to sample. The noun/verb lobe nudges from speech processing are sufficient to integrate hearing into the creature's decision-making.

---

## CAOS Commands Related to Hearing

### STIM SHOU — Broadcast Auditory Stimulus

Broadcasts a predefined stimulus to all creatures that can hear the source agent:

```
STIM SHOU stimulus_number amount
```

Creates a `typeSHOU` stimulus and calls `Process()`, which iterates all creatures and checks `CanHear()`.

### ORDR — Order a Creature via Speech

Sends a sentence directly to a creature's linguistic faculty via the stimulus system:

```
ORDR family genus species sentence
```

The sentence is processed through `HearSentence()` on matching creatures.

### VOCB — Vocabulary Teaching

Teaches words to a creature's vocabulary, which affects how `HearSentence()` parses future speech.

### SEZZ — Make Creature Speak

Makes the target creature say a sentence, which internally calls `Shout()` to broadcast to nearby creatures.

---

## Comparison with Other Senses

| Property | Vision | Smell | Hearing | Touch |
|---|---|---|---|---|
| Brain lobe(s) | `visn`, `elvn` | `smel` | None | None |
| Update frequency | Every tick | Every tick | Event-driven | Event-driven |
| Range source | `myGeneralRange` | Room CA diffusion | `myGeneralRange` | Bounding box overlap |
| Spatial encoding | X/Y displacement per category | Per-category CA value | None | None |
| MetaRoom constraint | Same MetaRoom | Same room (CA) | Same MetaRoom | Same position |
| Invisible agents | Excluded | N/A | **Included** | N/A |
| SensoryFaculty method | `updateVisionLobe()` | `updateSmellLobe()` | `Stimulate()` | `Stimulate()` |

---

## File Locations

| Component | Description |
|---|---|
| `CanHear()`, `GetAudibleRange()`, `myGeneralRange` | Range/MetaRoom hearing check on the agent |
| `Stimulus::Process()` | Stimulus-type delivery loop (`typeSHOU` gate) |
| `Stimulate()` | Sleep gate, name wake-up, brain nudging |
| `Shout()` | Broadcasts speech as a `typeSHOU` stimulus |
| `HearSentence()` | Parses heard speech and learns words |
| `HowManyCreaturesCanIHear()` | Crowding-score utility |
