# Creature Decisions Script (creatureDecisions.cos)

The `creatureDecisions.cos` bootstrap script defines how creatures physically carry out the actions chosen by their brain. Each decision (activate, eat, hit, pick up, etc.) has a dedicated CAOS script that validates whether the action is possible and either executes it or punishes the creature with a **Disappoint stimulus** (stimulus 0).

This is the primary mechanism by which creatures learn from failed actions.

## Overview

```
BRAIN DECISION
     │
     ▼
MotorFaculty fires creature script (scrp 4 0 0 <event>)
     │
     ▼
creatureDecisions.cos script runs
     │
     ├── Can IT be reached?  (appr + touc + byit check)
     ├── Does IT support this action?  (bhvr bitmask check)
     │
     ├─► YES: Perform action + positive stimulus (learning)
     └─► NO:  Disappoint stimulus 0 (negative reinforcement)
```

The creature's brain picks an action, but **the script decides if the action actually succeeds**. Failed actions are punished biochemically so the creature learns to avoid repeating them.

---

## Script Event Numbering

All creature decision scripts use classifier `4 0 0` (family=4 = Creature, genus=0, species=0) with event numbers starting at 16:

| Event | Action | CAOS Header |
|-------|--------|-------------|
| 16 | Quiescent (idle) | `scrp 4 0 0 16` |
| 17 | Activate 1 | `scrp 4 0 0 17` |
| 18 | Activate 2 | `scrp 4 0 0 18` |
| 19 | Deactivate | `scrp 4 0 0 19` |
| 20 | Approach | `scrp 4 0 0 20` |
| 21 | Retreat | `scrp 4 0 0 21` |
| 22 | Pick Up | `scrp 4 0 0 22` |
| 23 | Drop | `scrp 4 0 0 23` |
| 24 | Express Need | `scrp 4 0 0 24` |
| 25 | Rest / Sleep | `scrp 4 0 0 25` |
| 26 | Walk West | `scrp 4 0 0 26` |
| 27 | Walk East | `scrp 4 0 0 27` |
| 28 | Eat | `scrp 4 0 0 28` |
| 29 | Hit | `scrp 4 0 0 29` |

Scripts in the 0+ range of the original engine's numbering are "been done to" actions (messages received from other agents), while 64+ are involuntary actions.

---

## The Validation Pattern

Most action scripts follow a consistent three-stage validation pattern before executing:

### Stage 1: Null IT Check

```caos
inst
doif _it_ eq null
* no stim disappointment cos chemical based learning cant be silenced
    wait 10
    stop
endi
```

If the creature has no attention target (`_it_` is null), the script **silently aborts** without issuing Disappoint. The script's own comment explains why: chemical-based learning cannot distinguish "I had no target" from "my target was wrong", so punishing here would create incorrect associations.

### Stage 2: Approach and Touch

```caos
appr        * walk toward IT
touc        * attempt physical contact
```

After `touc`, IT may become null if the target was destroyed or moved away. The script checks for null again after touch.

### Stage 3: Behavior Flag + Proximity Check

```caos
targ _it_
setv va00 bhvr       * read target's behavior flags
targ ownr
andv va00 <bitmask>  * isolate the relevant bit
doif va00 eq <bitmask> and byit ne 0
    * SUCCESS: perform action
else
    * FAILURE: disappointment
    stim writ targ 0 1
endi
```

Two conditions must both be true for success:
- **`bhvr` bit set**: The target object supports this action type
- **`byit ne 0`**: The creature is close enough to interact

If either fails, the creature receives Disappoint.

---

## Behavior Flag Bitmask Reference

The `bhvr` value on each agent is a bitmask that declares which actions it supports:

| Bit | Value | Action | Script |
|-----|-------|--------|--------|
| 0 | 1 | Activate 1 | Event 17 |
| 1 | 2 | Activate 2 | Event 18 |
| 2 | 4 | Deactivate | Event 19 |
| 3 | 8 | Hit | Event 29 |
| 4 | 16 | Eat | Event 28 |
| 5 | 32 | Pick Up | Event 22 |

For example, an agent with `bhvr 33` (bits 0 + 5) can be activated and picked up, but not eaten or hit.

---

## Disappoint Conditions by Action

### Activate 1 (Event 17)

**Failure conditions:**
- `bhvr` bit 0 not set (target doesn't accept Activate 1)
- `byit eq 0` (creature can't reach the target)

```caos
andv va00 1
doif va00 eq 1 and byit ne 0
    * success: stim 13 (Activate 1) + mesg writ _it_ 0
else
    stim writ targ 0 1   * Disappoint
endi
```

### Activate 2 (Event 18)

**Failure conditions:** Same pattern as Activate 1 but checks `bhvr` bit 1.

### Deactivate (Event 19)

**Failure conditions:** Same pattern, checks `bhvr` bit 2.

### Approach (Event 20)

**Failure condition:**
- `byit eq 0` after `appr` (creature tried to approach but couldn't reach target)

```caos
appr
doif byit eq 0
    stim writ targ 0 1   * Disappoint
endi
```

This is the simplest script - no bhvr check needed since approach doesn't require the target to support any action.

### Retreat (Event 21)

**No Disappoint.** Retreat always succeeds — the creature picks a direction based on its drives (fear, pain, crowdedness) and walks away.

### Pick Up (Event 22)

**Failure conditions (3 separate checks):**

1. **Already holding IT**: `held eq _it_` — trying to pick up what you already have
2. **Target not pickupable**: `bhvr` bit 5 not set
3. **Can't reach**: `byit eq 0` after touch

```caos
* Check 1: already holding this?
doif held eq _it_
    stim writ targ 0 1
    stop
endi

* Check 2: is it pickupable?
andv va00 32
doif va00 ne 32
    stim writ targ 0 1
    stop
endi

* Check 3: close enough?
doif byit ne 0
    * success: stim 18 (Get) + mesg writ _it_ 4
else
    stim writ targ 0 1
endi
```

This action has the most failure paths of any decision.

### Drop (Event 23)

**Failure condition:**
- `held eq null` (not holding anything)

```caos
doif held eq null
    stim writ targ 0 1
    stop
endi
```

### Eat (Event 28)

**Failure conditions:**
- `bhvr` bit 4 not set (target is not edible)
- `byit eq 0` (can't reach target after touch)

```caos
andv va00 16
doif va00 ne 16
    stim writ targ 0 1   * not edible
    stop
endi
...
doif byit ne 0
    * success: pick up, eat, stim 26
else
    stim writ targ 0 1   * can't reach
endi
```

### Hit (Event 29)

**Failure conditions:**
- `bhvr` bit 3 not set (target can't be hit)
- `byit eq 0` (can't reach target)

```caos
andv va00 8
doif va00 eq 8 and byit ne 0
    * success: stim 44 (Aggression) + mesg writ _it_ 3
else
    stim writ targ 0 1
endi
```

---

## Actions That Never Disappoint

| Action | Why |
|--------|-----|
| **Quiescent** (16) | Idle animation, always succeeds. Issues stim 12 (Quiescent). |
| **Retreat** (21) | Always picks a direction based on drives and walks. Issues stim 17. |
| **Express Need** (24) | Always succeeds — creature just poses and vocalizes. Issues stim 20. |
| **Rest / Sleep** (25) | Always succeeds — creature rests or sleeps. Issues stim 21/22. |
| **Walk West/East** (26/27) | Always succeeds — creature just walks. Issues stim 23. |

---

## The Learning Mechanism

### Positive Path (Success)

When an action succeeds, the script checks whether the target has a script for this interaction:

```caos
targ _it_
doif sorq fmly gnus spcs <event> eq 0
    * no script on target: learn from stimulus (va99 = 1)
    setv va99 1
else
    * target has a script: it will provide its own learning
    setv va99 0
endi
targ ownr
stim writ targ <action_stimulus> va99
```

- **`va99 = 1`** (strength 1.0): Full learning — the action stimulus fires with reinforcement
- **`va99 = 0`** (strength 0.0): No learning — the target's own script will provide appropriate feedback via its own stimuli

This prevents double-learning when both the creature's decision script and the target's response script would issue stimuli.

### Negative Path (Disappoint)

```caos
stim writ targ 0 1    * Disappoint with strength 1.0 (full learning)
```

Disappoint always fires with strength 1.0, meaning the creature **always learns from failure**. The genome-defined chemicals for stimulus 0 typically increase negative emotions (pain, fear, etc.), teaching the creature to avoid repeating the failed action on similar objects.

---

## Why Disappoint Fires Frequently

A high rate of Disappoint stimuli is **normal and expected**, especially for:

- **Young creatures**: Haven't yet learned which objects support which actions
- **Creatures in sparse environments**: Few valid targets for their chosen actions
- **Creatures with high drive levels**: Attempt more actions, including unsuccessful ones

The Disappoint stimulus is the primary negative reinforcement mechanism. Without it, creatures would never learn to stop trying to eat rocks or pick up walls. The frequency naturally decreases as the creature builds correct associations between object categories and valid actions.

---

## Source Files

| File | Purpose |
|------|---------|
| `Assets/C3_Bootstrap_V2/creatureDecisions.cos` | The CAOS script defining all creature decision behaviors |
| `Main_Game/src/engine/creature/faculties/SensoryFaculty.js` | JS stimulus processing (`processStimulus`) |
| `Main_Game/src/engine/creature/faculties/MotorFaculty.js` | Fires decision scripts based on brain output |
