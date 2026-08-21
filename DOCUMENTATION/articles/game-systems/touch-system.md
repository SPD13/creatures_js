# Touch System

The **touch system** is the engine-side pipeline that determines which creatures are in physical contact with a source agent. Like hearing, touch has **no dedicated brain lobe** and is **event-driven** rather than continuous. It acts as a **delivery gate** on the stimulus system: a creature can only receive a `TACT`-type stimulus if it passes the `CanTouch()` bounding box overlap check. Once delivered, the stimulus is processed through the SensoryFaculty identically to any other stimulus type.

Touch is the simplest of the four sense gates — a pure axis-aligned bounding box (AABB) intersection test with no range calculation, no MetaRoom constraint, and no attribute filtering.

**Key stats**: No dedicated lobe, AABB overlap check, no range/MetaRoom constraint, event-driven delivery.

---

## Architecture

The complete touch pipeline flows from a source agent's stimulus to the listener's internal response:

```
                    TOUCH SYSTEM PIPELINE

  Source Agent (OWNR)
         │
         ▼
  CAOS Command (STIM TACT, URGE TACT,
                 SWAY TACT, ORDR TACT)
  Creates Stimulus with typeTACT
         │
         ▼
  Stimulus::Process()
  Iterates ALL creatures in the world
         │
         ▼
  ┌─────────────────────────────────┐
  │   For each creature:            │
  │                                 │
  │   creature.CanTouch(source)?    │
  │     1. Not self?                │
  │     2. Bounding boxes overlap?  │
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
  │  (same as hearing/vision)       │
  │  - Dead? → discard entirely     │
  │  - Asleep + no IFASLEEP flag?   │
  │    → check name-wake, discard   │
  │  - Asleep + IFASLEEP flag?      │
  │    → halve verb/noun stim       │
  └─────────────────────────────────┘
         │
         ├──► LinguisticFaculty::HearSentence() (if speech)
         ├──► Brain nudge (noun/verb neurons)
         └──► Chemical adjustments (SWAY)
```

---

## The CanTouch() Check

`CanTouch()` is defined on `Agent` and performs a straightforward bounding box intersection:

```text
function CanTouch(self, other):
    if self == other:
        return false

    r1 = GetAgentExtent(self)
    r2 = GetAgentExtent(other)

    if r1.left > r2.right or r2.left > r1.right:
        return false
    if r1.top > r2.bottom or r2.top > r1.bottom:
        return false

    return true
```

### Rules

| Rule | Description |
|---|---|
| Not self | An agent cannot touch itself |
| AABB overlap | The two agents' bounding rectangles must overlap on both axes |

That's it. No range calculation, no MetaRoom check, no visibility check. If the bounding boxes overlap, the agents are "touching."

### Comparison with CanHear() and CanSee()

| Property | `CanSee()` | `CanHear()` | `CanTouch()` |
|---|---|---|---|
| Check type | Distance + MetaRoom | Distance + MetaRoom | AABB overlap |
| Range | `myGeneralRange` | `myGeneralRange` | N/A (contact) |
| MetaRoom required | Same | Same | Not checked |
| Self excluded | Yes | Yes | Yes |
| Invisible excluded | Yes | No | No |
| Complexity | Most complex | Medium | Simplest |

---

## Stimulus Delivery

Touch is one of four stimulus delivery mechanisms. In `Stimulus.Process()`, the `typeTACT` type uses `CanTouch()` as its gate:

```text
if stimulusType == typeWRIT: deliver = (c == toCreature)
else if stimulusType == typeSHOU: deliver = c.CanHear(fromAgent)
else if stimulusType == typeSIGN: deliver = c.CanSee(fromAgent)
else if stimulusType == typeTACT: deliver = c.CanTouch(fromAgent)
else: deliver = false
```

| Type | ID | Gate Function | Delivery |
|---|---|---|---|
| `typeSHOU` | 0 | `CanHear()` | All creatures within audible range, same MetaRoom |
| `typeSIGN` | 1 | `CanSee()` | All creatures within visual range, not invisible |
| `typeTACT` | 2 | `CanTouch()` | All creatures whose bounding box overlaps with source |
| `typeWRIT` | 3 | Direct match | Only the specified target creature |

The `Process()` method iterates **every creature in the world** and applies the gate function. For `typeTACT`, each creature calls `CanTouch()` on the source agent — if bounding boxes overlap, the creature receives the stimulus.

---

## Touch-Related Stimuli

Several built-in stimulus numbers relate to physical contact and interaction:

### Direct Contact Stimuli

| # | Stimulus | Description |
|---|---|---|
| 1 | `STIM_POINTERPAT` | User has patted the creature |
| 2 | `STIM_CREATUREPAT` | Another creature has patted this creature |
| 3 | `STIM_POINTERSLAP` | User has slapped the creature |
| 4 | `STIM_CREATURESLAP` | Another creature has slapped this creature |
| 24 | `STIM_PUSH` | Emitted after being pushed |
| 25 | `STIM_HIT` | Emitted after being hit |
| 44 | `STIM_AGGRESSION` | Emitted after performing a HIT action |
| 91 | `STIM_OPPSEX_TICKLE` | Tickled by opposite sex |
| 92 | `STIM_SAMESEX_TICKLE` | Tickled by same sex |

### Collision/Impact Stimuli

| # | Stimulus | Description |
|---|---|---|
| 7 | `STIM_BUMP` | Creature has hit a wall |
| 39 | `STIM_IMPACT` | Emitted after a collision |

### Interaction Stimuli (Touch-Adjacent)

| # | Stimulus | Description |
|---|---|---|
| 13 | `STIM_ACTIVATE1` | Emitted after activation (requires proximity) |
| 14 | `STIM_ACTIVATE2` | Emitted after second activation type |
| 18 | `STIM_GET` | Emitted after picking up an object |
| 19 | `STIM_DROP` | Emitted after dropping an object |
| 26 | `STIM_EAT` | Emitted after eating |
| 45 | `STIM_MATE` | Emitted after mating |

Note: These stimuli are not all delivered via `typeTACT`. Many are delivered via `typeWRIT` or `typeSHOU` depending on the context. The stimulus **number** indicates the type of event, while the stimulus **delivery type** determines who receives it.

---

## CAOS Commands

### TOUC (Agent Query) — Test if Touching

Returns 1 if two agents' bounding rectangles overlap, 0 otherwise:

```
TOUC first second
```

Implementation:
```text
function IntegerRV_TOUC(vm):
    agent1 = vm.FetchAgentRV()
    agent2 = vm.FetchAgentRV()

    if agent1 == NULLHANDLE or agent2 == NULLHANDLE:
        return 0

    return agent1.CanTouch(agent2) ? 1 : 0
```

### TOUC (Creature Command) — Reach Out to Touch IT

Makes a creature physically reach out to touch its IT agent, blocking the script until the reach animation completes or fails:

```
TOUC
```

Implementation:
```text
function Command_TOUC(vm):
    if not vm.IsBlocking():
        vm.Block()
        reachReturnValue = vm.GetCreatureTarg().ReachOut()
        if reachReturnValue != 0:    // not still moving
            vm.UnBlock()
            return
    if vm.GetCreatureTarg().HasTargetPoseStringBeenReached():
        vm.UnBlock()
```

This command:
- Calls `Skeleton::ReachOut()` which animates the creature extending its arm toward the IT agent
- Blocks the script until the reach animation completes or the creature is fully stretched and still can't reach
- Used in creature interaction scripts (e.g., activating objects, patting other creatures)

### STIM TACT — Broadcast Tactile Stimulus

Sends a predefined stimulus to all creatures touching OWNR:

```
STIM TACT stimulus_number strength
```

### URGE TACT — Urge Touching Creatures

Urges all creatures touching OWNR to perform an action:

```
URGE TACT noun_stim verb_id verb_stim
```

### SWAY TACT — Adjust Drives of Touching Creatures

Adjusts up to four drives of all creatures touching OWNR:

```
SWAY TACT drive1 adjust1 drive2 adjust2 drive3 adjust3 drive4 adjust4
```

### ORDR TACT — Spoken Command to Touching Creatures

Sends a spoken command to all creatures touching OWNR:

```
ORDR TACT speech
```

---

## Agent Manager Touch Queries

The `AgentManager` provides two utility methods for touch detection:

### WhoAmITouching() — Find First Touching Creature

```text
WhoAmITouching(me) → AgentHandle
```

Iterates the **creature collection** and returns the first creature whose bounding box overlaps with `me`. Has a special case: if `me` is a vehicle carrying a creature, that carried creature counts as touching. Returns the first match found (not necessarily the nearest).

### WhatAmITouching() — Find Frontmost Touching Agent

```text
WhatAmITouching(ptThis, me, AttrFields, AttrState) → AgentHandle
```

Iterates **all agents** (not just creatures) and finds the frontmost agent (highest display plane) that passes a **hit-test** at the specified point. Used for interaction targeting — finding what an agent is standing on or overlapping with. The test point for non-pointer agents is the **centre-bottom** of the bounding box (the creature's "feet").

Key differences:

| Property | `WhoAmITouching()` | `WhatAmITouching()` |
|---|---|---|
| Searches | Creatures only | All agents |
| Test method | AABB overlap | Point hit-test |
| Selection | First found | Frontmost (highest plane) |
| Vehicle check | Special case for carried creatures | No |
| Attribute filter | No | Yes (AttrFields/AttrState) |

---

## The TOUC Creature Action — Physical Reach

The creature's touch action is more than just a proximity check — it involves a physical **reach animation** through the skeleton system.

When a CAOS script executes the creature `TOUC` command:

1. `Skeleton.ReachOut()` is called
2. The creature's arm extends toward the IT agent using pose tables
3. The creature faces the camera (not the object) — this allows the player to see the interaction
4. The script blocks until the animation completes
5. If the creature is fully stretched and still can't reach, the command returns failure

This is distinct from `CanTouch()` which is an instantaneous bounding box check. The `TOUC` command is an **animated physical action**, while `CanTouch()` is a **spatial query**.

---

## Brain Integration: No Touch Lobe

Like hearing, touch has **no dedicated brain lobe**. The brain is affected by touch only through the standard stimulus processing pipeline in `SensoryFaculty::Stimulate()`:

| Mechanism | Brain Effect | Example |
|---|---|---|
| Noun neuron nudge | `noun` lobe input | Nudges attention toward the touching agent's category |
| Verb neuron nudge | `verb` lobe input | Nudges action toward a specific behaviour |
| Attention override | MotorFaculty forced to category | `nounStim > 1.0` forces creature to focus |
| Decision override | MotorFaculty forced to action | `verbStim > 1.0` forces creature to act |
| Chemical adjustment | Bloodstream chemicals modified | Pat → comfort chemicals, Slap → pain chemicals |
| Reinforcement learning | `resp`/`prox` lobe signal | Chemical adjustment with training enabled |

### Why No Touch Lobe?

Touch shares the same architectural rationale as hearing for lacking a dedicated lobe:

- **Vision** and **smell** are continuous — every tick, the creature scans the world for what it can see and what it can smell
- **Touch** is transient — an agent touches a creature (pat, slap, bump) and the event is delivered as a stimulus
- There is no persistent "tactile field" to sample every tick. A touch lobe would need to encode "what is currently touching me" but physical contact is momentary and handled by event scripts

The chemical responses from touch stimuli (pain from slaps, comfort from pats) are sufficient to integrate touch into the creature's decision-making through the biochemistry and drive systems.

---

## Comparison Across All Four Senses

| Property | Vision | Smell | Hearing | Touch |
|---|---|---|---|---|
| Brain lobe(s) | `visn`, `elvn` | `smel` | None | None |
| Update frequency | Every tick | Every tick | Event-driven | Event-driven |
| Gate function | `CanSee()` | N/A (room CA) | `CanHear()` | `CanTouch()` |
| Range source | `myGeneralRange` | Room CA diffusion | `myGeneralRange` | Bounding box |
| Spatial encoding | X/Y displacement per category | Per-category CA value | None | None |
| MetaRoom constraint | Same MetaRoom | Same room | Same MetaRoom | None |
| Invisible agents | Excluded | N/A | Included | Included |
| Stimulus type | `typeSIGN` | N/A | `typeSHOU` | `typeTACT` |
| SensoryFaculty method | `updateVisionLobe()` | `updateSmellLobe()` | `Stimulate()` | `Stimulate()` |
| CAOS query | `SEEE` | N/A | N/A | `TOUC` |

---

## Key Behaviours

| Behaviour | Description |
|---|---|
| `CanTouch()` | Bounding box overlap test between two agents |
| Touch point calculation | The agent touch point is the centre-bottom of its bounding box |
| `typeTACT = 2` | Stimulus delivery type for tactile contact |
| `Stimulus.Process()` | Stimulus delivery loop over all creatures |
| `Stimulate()` | Sleep/death gate and brain nudging in the sensory pipeline |
| `ReachOut()` | Creature reach animation through the skeleton system |
| `WhoAmITouching()` | First touching creature |
| `WhatAmITouching()` | Frontmost touching agent |
| `TOUC` agent query | Integer return value reporting whether two agents touch |
| `TOUC` creature command | Animated physical reach toward the IT agent |
| `STIM/URGE/SWAY/ORDR TACT` | Tactile stimulus command definitions |
