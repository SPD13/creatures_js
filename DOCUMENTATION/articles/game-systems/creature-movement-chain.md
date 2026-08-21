# Creature Movement Decision Chain

How does a creature decide to move? The answer involves a sophisticated pipeline that flows from **biochemistry** through **neural networks** to **CAOS scripts** to **skeleton animation** to **map physics**. This article traces every step of that chain, from the initial chemical signal to the creature walking across the screen.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│              CREATURE MOVEMENT DECISION CHAIN                     │
│                                                                 │
│   BIOCHEMISTRY ──► BRAIN LOBES ──► MOTOR FACULTY                │
│                                        │                        │
│                              ┌─────────┴─────────┐              │
│                              ▼                   ▼              │
│                        Involuntary          Voluntary           │
│                        (reflexes)           (decisions)         │
│                              │                   │              │
│                              └─────────┬─────────┘              │
│                                        ▼                        │
│                                  CAOS SCRIPT                    │
│                                        │                        │
│                                        ▼                        │
│                            SKELETON ANIMATION                   │
│                                        │                        │
│                                        ▼                        │
│                               MAP PHYSICS                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

There are two parallel paths through this pipeline:

- **Voluntary path**: Brain decides → MotorFaculty fires action script → CAOS runs WALK/APPR → Skeleton animates → Physics moves
- **Involuntary path**: Biochemistry loci trigger → MotorFaculty fires reflex script → CAOS executes → same animation/physics chain

---

## Step 1: The Tick System — Entry Point

Every game tick, `Agent.Update()` runs for every agent. For creatures, `Creature.Update()` overrides this:

1. Calls `base.Update()` — handles physics + VM execution (up to 5 CAOS instructions)
2. Only runs creature-specific logic **every 4th tick** (staggered updates)
3. On creature ticks: iterates through ALL 9 faculties calling `update()`

```
Faculty Update Order (from Creature constructor):
  [0] SensoryFaculty    ◄── What can I see?
  [1] Brain             ◄── What should I do?
  [2] MotorFaculty      ◄── Execute the decision
  [3] LinguisticFaculty
  [4] Biochemistry
  [5] ReproductiveFaculty
  [6] ExpressiveFaculty
  [7] MusicFaculty
  [8] LifeFaculty
```

**The order matters.** Sensory runs first (populates what the creature can see), then Brain runs (processes neural networks), then MotorFaculty runs (makes movement decisions based on brain output).

### Key Files

| Component | Source |
|-----------|-----|
| Agent tick | `Agent.js:748-778` |
| Creature tick | `Creature.js:380-418` |

---

## Step 2: Brain Processing

The Brain is a faculty that updates its neural network lobes. Its key outputs for movement are two "winner-takes-all" competitions:

```
┌─────────────────────────────────────────────────────────────────┐
│                     BRAIN OUTPUT FOR MOVEMENT                     │
│                                                                 │
│   ┌──────────────────────┐    ┌──────────────────────┐          │
│   │  Attention Lobe      │    │  Decision Lobe        │          │
│   │  "attn" (40 neurons) │    │  "decn" (14 neurons)  │          │
│   │                      │    │                      │          │
│   │  Each neuron = one   │    │  Each neuron = one   │          │
│   │  object category     │    │  possible action     │          │
│   │                      │    │                      │          │
│   │  Winner = WHAT to    │    │  Winner = WHAT to    │          │
│   │  pay attention to    │    │  DO about it         │          │
│   └──────────┬───────────┘    └──────────┬───────────┘          │
│              │                           │                      │
│              ▼                           ▼                      │
│   Category index ──► IT object    Action ID (0-13)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

```javascript
// Get the brain's winning attention and decision
int winningAttentionId = brain.getWinningId("attn");  // Which category?
int winningDecisionId  = brain.getWinningId("decn");   // Which action?
```

The attention winner is an index into `SensoryFaculty.myKnownAgents[]` — it identifies the creature's focus of attention (the "IT" object). The decision winner maps to an action script offset via catalogue lookup.

See also: [Attention Lobe Architecture](#/article/attention-lobe-architecture), [Decision Lobe Architecture](#/article/decision-lobe-architecture)

---

## Step 3: MotorFaculty — The Decision Hub

The MotorFaculty is the central gatekeeper that translates brain outputs into physical actions. It runs a strict sequence of checks:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOTOR FACULTY PIPELINE                         │
│                                                                 │
│   MotorFaculty.update()                                         │
│     │                                                           │
│     ├─ 1. Consciousness check ──► unconscious/zombie? STOP     │
│     │                                                           │
│     ├─ 2. Attention processing ──► determine IT object          │
│     │                                                           │
│     ├─ 3. Involuntary check ──► VM still running reflex? STOP  │
│     │                                                           │
│     ├─ 4. Involuntary selection ──► scan biochemistry loci      │
│     │                              probabilistic trigger?       │
│     │                              ──► fire reflex script       │
│     │                                                           │
│     ├─ 5. Alert check ──► asleep? STOP                         │
│     │                                                           │
│     └─ 6. Voluntary decision ──► map brain decision to script  │
│                                  fire action script              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3a. Consciousness Check

```text
if c.Life().GetWhetherUnconscious() or c.Life().GetWhetherZombie()
    return
```

If the creature is unconscious or in zombie state, **no movement at all**. Full stop.

### 3b. Attention Processing — Determine the IT Object

```text
winningAttentionId = (myVoluntaryScriptOverrides.attentionScriptNo >= 0) ?
    myVoluntaryScriptOverrides.attentionScriptNo :
    brain.getWinningId("attn")

winningAgent = sensory.getKnownAgent(winningAttentionId)
```

This step:
1. Gets the brain's attention lobe winner (or a URGE override if one is active)
2. Maps it to a known agent via `SensoryFaculty.getKnownAgent()`
3. If the winning agent has **changed**, may stop the current running script
4. Checks the visual neuron — if no signal, the agent is set to null (can't see it)
5. Sets the creature's IT object: `creature.setItAgent(winningAgent)`
6. If no IT object exists, the creature becomes **introspective** (self-focused)

### 3c. Involuntary Action Check

Involuntary actions are biochemistry-driven reflexes that take priority over voluntary decisions:

```text
// Reset involuntary flag when VM finishes
if vm.isRunning() == false
    myCurrentInvoluntaryAction = -1

// Don't start voluntary actions during involuntary ones
if myCurrentInvoluntaryAction > -1
    return
```

Then the faculty scans all 8 involuntary action loci — values written by the biochemistry system through receptors:

```text
for i = 0 to NUMINVOL - 1:
    if latency == 0 and locus > random() and locus > strongestSoFar:
        strongestSoFar = myInvoluntaryActions[i].locus
        bestInvoluntaryActionId = i
```

The selection is **probabilistic**: the locus value (0.0-1.0) is compared against a random number. Higher chemical concentrations = higher probability of triggering the reflex.

| Involuntary ID | Action | Typical Chemical Trigger |
|-----------------|--------|--------------------------|
| 0 | Flinch | Pain chemicals |
| 1 | Lay Egg | Progesterone |
| 2 | Sneeze | Histamine A |
| 3 | Cough | Histamine B |
| 4 | Shiver | Coldness |
| 5 | Sleep | Sleepiness chemicals |
| 6 | Fainting | Extreme exhaustion |
| 7 | (Unassigned) | — |

If triggered, the corresponding CAOS script event (64-71) is executed.

### 3d. Alert State Check

```text
if not creature.Life().GetWhetherAlert()
    return
```

If the creature is **asleep**, no voluntary actions are processed. Only involuntary actions (from step 3c) can fire.

### 3e. Voluntary Decision Processing

This is where the brain's decision output becomes an actual action:

```text
scriptAction = (myVoluntaryScriptOverrides.decisionScriptNo >= 0) ?
    myVoluntaryScriptOverrides.decisionScriptNo :
    getScriptOffsetFromNeuronId(brain.getWinningId("decn"))
```

**Action Constants:**

| ID | Action | Description |
|----|--------|-------------|
| 0 | `AC_DEFAULT` | Quiescent (do nothing) |
| 1 | `AC_ACTIVATE1` | Push / Activate primary |
| 2 | `AC_ACTIVATE2` | Pull / Activate secondary |
| 3 | `AC_DEACTIVATE` | Deactivate target |
| 4 | `AC_APPROACH` | Walk toward IT |
| 5 | `AC_RETREAT` | Walk away from IT |
| 6 | `AC_GET` | Pick up IT |
| 7 | `AC_DROP` | Drop carried item |
| 8 | `AC_EXPRESSNEED` | Express current need |
| 9 | `AC_REST` | Rest / Do nothing |
| 10 | `AC_TRAVWEST` | Travel west |
| 11 | `AC_TRAVEAST` | Travel east |
| 12 | `AC_EAT` | Eat IT |
| 13 | `AC_HIT` | Hit / Attack IT |

The script event number depends on **what the IT object is**:

```text
scriptEvent = scriptAction + (isCreatureTarget ? 32 : 16)
```

- **IT is an object or null:** event = action + 16 (scripts 16-31: extrovert/introvert)
- **IT is a creature:** event = action + 32 (scripts 32-47: creature-creature)

For example:
- Approach an object → script event **20** (4 + 16)
- Approach a creature → script event **36** (4 + 32)
- Eat an object → script event **28** (12 + 16)

The script fires if:
1. The action has **changed** (new decision), OR
2. The IT object has **changed** and creature is not introspective, OR
3. The VM is **not currently running** (previous script finished)

### Key Files

| Component | Source |
|-----------|-----|
| MotorFaculty update | `MotorFaculty.js:164-206` |
| Attention processing | `MotorFaculty.js:219-275` |
| Decision processing | `MotorFaculty.js:283-375` |
| Involuntary actions | `MotorFaculty.js:384-447` |
| Script offset mapping | `BrainScriptFunctions.js:104-113` |
| Action constants | `CreatureConstants.js` |

---

## Step 4: CAOS Script Execution

Once the MotorFaculty fires a script (e.g., "approach" = script 20), a CAOS script runs. These scripts are defined in `.cos` files and use movement commands. The key movement commands are:

### WALK — Start Walking

```
WALK
```

Calls `Skeleton.walk()`:

```javascript
walk() {
    const gaitIndex = this.selectGait();
    const gaitAnim = this.myGaitTable[gaitIndex];
    this.setAnimationString(gaitAnim);
}
```

**Gait selection is biochemistry-driven.** The `myGaitLoci[]` array holds signal strengths from chemical receptors. Different chemicals activate different gaits:

```
┌─────────────────────────────────────────────────────────────────┐
│                       GAIT SELECTION                              │
│                                                                 │
│   myGaitLoci[]  (written by biochemistry receptors)             │
│                                                                 │
│   [0] Normal walk     ──► 0.0  (default when no signal)        │
│   [1] Drunk stagger   ──► 0.7  (high Alcohol)                  │
│   [2] Tired plod      ──► 0.3  (high Tiredness)                │
│   [3] Injured limp    ──► 0.1  (high Injury)                   │
│   [4] Fast run        ──► 0.0  (no Adrenalin)                  │
│                                                                 │
│   Winner: Gait 1 (strongest signal = 0.7) → drunk stagger      │
│                                                                 │
│   If ALL loci are 0.0 → Gait 0 (normal walk) is default        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each gait is a sequence of pose numbers forming a looping animation, loaded from **GAIT genes** in the genome (e.g., `"013014015016R"` where `R` = repeat).

### APPR — Approach IT

```
APPR
```

The APPR command is a **blocking** command — it suspends the VM and re-executes each tick until the creature reaches its target. It uses two navigation strategies:

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPROACH STRATEGIES                            │
│                                                                 │
│   Strategy 1: Direct approach (IT agent exists)                 │
│   ┌─────────────────────────────────────────────┐               │
│   │  Walk toward IT's position                   │               │
│   │  Stop when CannotBeMuchCloser() == true      │               │
│   │  (within ~120 pixels)                        │               │
│   └─────────────────────────────────────────────┘               │
│                                                                 │
│   Strategy 2: Smell gradient (IT invalid/lost)                  │
│   ┌─────────────────────────────────────────────┐               │
│   │  Follow CA (Cellular Automata) smell map      │               │
│   │  WhichDirectionToFollowCA() determines        │               │
│   │  which direction has increasing smell          │               │
│   │  Walk 500 pixels in that direction             │               │
│   └─────────────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Other Movement-Related CAOS Commands

| Command | Effect |
|---------|--------|
| `WALK` | Start walking with biochemistry-selected gait |
| `APPR` | Approach IT agent (blocking) |
| `FLEE` | Move away from IT agent (blocking) |
| `GAIT gait_number` | Explicitly set a gait animation |
| `MVTO x y` | Teleport agent to coordinates |
| `VELO vx vy` | Set velocity directly |

### Key Files

| Component | Source |
|-----------|-----|
| WALK command | `WALK.js:36-70` |
| APPR command | `APPR.js:54-195` |

---

## Step 5: Skeleton Animation System

Once a CAOS command like WALK sets an animation string, the Skeleton system takes over. `Skeleton.update()` runs **every tick** (not just on creature ticks):

```
┌─────────────────────────────────────────────────────────────────┐
│                  SKELETON UPDATE PIPELINE                         │
│                                                                 │
│   1. Speed gating                                               │
│      └── Only update every other tick (unless double-speed)     │
│                                                                 │
│   2. Movement check                                             │
│      └── If falling/carried/floating → skip animation           │
│                                                                 │
│   3. Track IT                                                   │
│      └── Update the IT object's position for facing             │
│                                                                 │
│   4. MoveTowardsTargetPoseString()                              │
│      └── Incrementally shift each body part toward target pose  │
│      └── Uses turning table for smooth direction changes        │
│      └── Handles '?' (face toward IT) and '!' (face away)      │
│                                                                 │
│   5. Advance animation                                          │
│      └── When target pose reached, read next pose from string   │
│      └── If 'R' reached, loop back to start                    │
│      └── Track myMusclesLocus (energy expenditure)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Pose String Format

A pose string encodes the direction and position of each body part:

```
Position:  0    1    2    3    4    5    6
Meaning:   DIR  HEAD BODY LLEG RLEG LARM RARM

Example: "2130120"
  Dir=2 (EAST), Head=1, Body=3, LLeg=0, RLeg=1, LArm=2, RArm=0
```

Direction codes:
- `0` = NORTH (facing up)
- `1` = SOUTH (facing down)
- `2` = EAST (facing right)
- `3` = WEST (facing left)
- `?` = Face toward IT object
- `!` = Face away from IT object

### Animation String Format

An animation string is a sequence of 3-digit pose references:

```
"013014015016R"

Pose 1: 013  (direction 0, head 1, body 3...)
Pose 2: 014
Pose 3: 015
Pose 4: 016
R = Repeat from beginning
```

### Incremental Pose Transitions

`MoveTowardsTargetPoseString()` does NOT jump to the target pose instantly. It incrementally moves each body part **one step per call**, using a turning table for smooth rotation. This means a creature changing direction will visibly rotate through intermediate poses.

### Key Files

| Component | Source |
|-----------|-----|
| Skeleton update | `Skeleton.js` |
| Walk/gait selection | `Skeleton.js:1964-1988` |
| Pose interpolation | `Skeleton.js:4162+` |

---

## Step 6: Physical Movement — Map Collision

While the Skeleton handles visual animation, the physics system handles actual positional movement. `HandleMovementWhenAutonomous()` runs on every tick:

```
┌─────────────────────────────────────────────────────────────────┐
│                  PHYSICS / MAP SYSTEM                             │
│                                                                 │
│   HandleMovementWhenAutonomous()                                │
│     │                                                           │
│     ├─ If myStoppedFlag == true → return (at rest)             │
│     │                                                           │
│     ├─ MoveCreatureInsideRoomSystem()                           │
│     │    Inputs:                                                │
│     │    ├── Left foot position                                 │
│     │    ├── Right foot position                                │
│     │    ├── Top of creature (minY)                             │
│     │    ├── Permeability (can pass through walls?)             │
│     │    ├── Gravity, friction, air resistance                  │
│     │    └── Current velocity vector                            │
│     │                                                           │
│     │    Outputs:                                               │
│     │    ├── New position                                       │
│     │    ├── New velocity                                       │
│     │    ├── Collision flag                                     │
│     │    ├── Wall hit info                                      │
│     │    └── Stopped flag                                       │
│     │                                                           │
│     ├─ If stopped → set myStoppedFlag = true                   │
│     │                                                           │
│     ├─ UpdatePositionsWithRespectToDownFoot()                   │
│     │    └── Reposition entire skeleton relative to foot        │
│     │                                                           │
│     ├─ CommitPositions()                                        │
│     │    └── Apply final positions to all body parts            │
│     │                                                           │
│     └─ If collision → ExecuteScriptForEvent(SCRIPTCOLLISION)   │
│          └── Fire collision CAOS script                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Creatures use foot-based physics**, unlike regular agents which use bounding-box physics. The map system checks both the left and right foot positions against room boundaries, floors, and walls.

For **hand-holding movement** (when the player drags a creature), `ShiftCreatureAlongFloor()` is used instead — it slides the creature along the floor surface toward the mouse pointer.

### Key Files

| Component | Source |
|-----------|-----|
| Autonomous movement | `Agent.js:748-778` |
| Room collision | `MapManager.js` |
| Hand-holding | `Creature.js:1656-1663` |

---

## Complete Decision Chain Summary

```
BIOCHEMISTRY (chemicals change over time)
    │
    ▼
BRAIN LOBES UPDATE (every 4th tick, after Sensory)
    │
    ├── Attention Lobe "attn" ──► winning neuron = object category
    │                                     │
    │                           SensoryFaculty.getKnownAgent(id)
    │                                     │
    │                                     ▼
    │                              IT OBJECT (creature's focus)
    │
    └── Decision Lobe "decn" ──► winning neuron ──► getScriptOffsetFromNeuronId()
                                                           │
                                                           ▼
                                                    ACTION ID (0-13)
                                                           │
    MOTOR FACULTY ◄────────────────────────────────────────┘
    │
    ├─ [Gate 1] Unconscious/zombie? ──► BLOCK
    │
    ├─ [Gate 2] Involuntary actions (biochemistry-driven)
    │    Probabilistic: locus value vs random threshold
    │    If triggered ──► script events 64-71 (flinch, sneeze, etc.)
    │
    ├─ [Gate 3] Asleep? ──► BLOCK (voluntary only)
    │
    └─ [Gate 4] Voluntary decision
         scriptEvent = action + (creature? 32 : 16)
         ExecuteScriptForClassifier(event)
                │
                ▼
        CAOS SCRIPT RUNS (defined in .cos files)
                │
                ├── WALK ──► Skeleton.walk()
                │     └── selectGait() from myGaitLoci[] (biochemistry)
                │     └── setAnimationString(gaitTable[choice])
                │
                ├── APPR ──► walk + navigate toward IT/smell gradient
                │
                └── POSE ──► set specific body pose
                │
                ▼
        SKELETON ANIMATION
                │
                ├── moveTowardsTargetPoseString()
                │     Incremental, one step per tick
                │     Turning table for smooth rotation
                │     Tracks energy expenditure (myMusclesLocus)
                │
                └── Advance animation pointer on completion
                │
                ▼
        PHYSICS / MAP SYSTEM
                │
                ├── MoveCreatureInsideRoomSystem()
                │     Gravity, friction, wall collisions
                │     Foot-based position tracking
                │
                ├── If collision ──► fire SCRIPTCOLLISION event
                └── If stopped ──► myStoppedFlag = true
```

---

## Key Design Insights

### Biochemistry Influences Movement at Three Levels

1. **Drives → Brain → Action selection**: Hunger drives approach food, tiredness drives rest
2. **Involuntary loci → Reflexes**: Direct chemical-to-action bypass (sneezing, fainting)
3. **Gait loci → Walk style**: Even *how* a creature walks depends on chemistry (drunk, tired, injured)

### The Motor Faculty is a Gatekeeper, Not a Decision-Maker

The MotorFaculty does not decide what to do — the Brain does that. The MotorFaculty's role is to:
- Gate decisions through consciousness/alertness checks
- Prioritize involuntary reflexes over voluntary actions
- Translate brain output neuron IDs into CAOS script event numbers
- Fire the appropriate CAOS script

### Scripts are the Glue Between Decision and Physics

CAOS scripts serve as the flexible layer between the rigid neural decision system and the physical movement system. This means:
- The same brain decision (e.g., "approach") can execute different scripts depending on what type of object the IT is
- Scripts can include complex multi-step behaviors (walk toward, pick up, eat, express satisfaction)
- New behaviors can be added without modifying the brain or physics code

### Movement is Not Instantaneous

Several mechanisms ensure movement looks natural:
- **Pose interpolation**: Body parts transition one step at a time toward target poses
- **Gait animation**: Walking is a looping sequence of poses, not a single frame
- **Physics simulation**: Gravity, friction, and room boundaries constrain movement
- **Blocking commands**: APPR re-checks each tick, creating continuous walking toward a goal

---

## Related Articles

- [Creature Faculties](#/article/creature-faculties) — Overview of all 9 faculty subsystems
- [Brain & Neural Networks](#/article/brain-system) — Neural architecture details
- [Attention Lobe Architecture](#/article/attention-lobe-architecture) — How IT object selection works
- [Decision Lobe Architecture](#/article/decision-lobe-architecture) — How action selection works
- [Biochemistry System](#/article/biochemistry-system) — Chemical drives and involuntary loci
- [Collision & Physics](#/article/collision-system) — Map physics and room boundaries
- [Creature Perception](#/article/creature-perception) — How creatures see and smell
