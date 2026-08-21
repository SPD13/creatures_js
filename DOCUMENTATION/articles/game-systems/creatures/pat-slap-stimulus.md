# Pat and Slap: Teaching a Creature Through Touch

Patting and slapping are the player's most direct reinforcement tools. They don't call any special "teach" API — under the hood they are ordinary CAOS stimuli that ride the same pipeline as eating a fruit or being stung by a wasp. This article walks the full path from the mouse click on a creature's body to the neural reinforcement that trains its decision lobe, with exact file and line references for the JS rebuild.

## Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     PAT / SLAP → BRAIN PIPELINE                          │
│                                                                          │
│  1. PLAYER LEFT-CLICKS A CREATURE                                        │
│     PointerAgent handles the mouse event                                 │
│          │                                                               │
│          ▼                                                               │
│  2. BODY-PART DETECTION                                                  │
│     Creature.clickAction(x, y)                                           │
│       head   → ACTIVATE1  (pat)                                          │
│       legs   → DEACTIVATE (slap)                                         │
│       torso  → INVALID    (ignored)                                      │
│          │                                                               │
│          ▼                                                               │
│  3. POINTER SENDS MESSAGE TO CREATURE                                    │
│     AgentManager.sendMessage(pointer, creature, msgid)                   │
│          │                                                               │
│          ▼                                                               │
│  4. CREATURE DISPATCHES THE MATCHING EVENT SCRIPT                        │
│     Agent.handleMessage maps message → script number                     │
│       ACTIVATE1 (0)  → event 1 → scrp 4 0 0 1   (pat handler)            │
│       DEACTIVATE (2) → event 0 → scrp 4 0 0 0   (slap handler)           │
│       HIT (3)        → event 3 → scrp 4 0 0 3   (also slap)              │
│          │                                                               │
│          ▼                                                               │
│  5. creatureDoneTo.cos ISSUES A STIMULUS                                 │
│     doif from eq pntr                                                    │
│       stim writ targ 1 1   (POINTERPAT)   ← pat                          │
│       stim writ targ 3 1   (POINTERSLAP)  ← slap                         │
│          │                                                               │
│          ▼                                                               │
│  6. STIM WRIT → SensoryFaculty.stimulate()                               │
│     Look up stimulus #1 / #3 in the creature's genome StimulusLibrary    │
│          │                                                               │
│          ▼                                                               │
│  7. PROCESS STIMULUS                                                     │
│       • Noun/verb lobe nudges (attention/concept)                        │
│       • Up to 4 genome-defined chemicals injected                        │
│       • Each drive chemical fires resp (alert) or prox (asleep)          │
│         as a reinforcement input to the brain                            │
│          │                                                               │
│          ▼                                                               │
│  8. REINFORCEMENT LOBE LEARNS                                            │
│     The concept/action that was "winning" in the decision lobe at        │
│     the moment of touch is rewarded or punished. Next time the same      │
│     situation arises, that concept's weight is shifted accordingly.      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

The rest of this article walks each step and points at the exact code on both sides of the port.

---

## Step 1 — Click Detection

When the player left-clicks anywhere in the world, `PointerAgent` receives the mouse event, finds the agent under the cursor, and calls `activateAgent()`. If that agent is a creature, the pointer needs to know what part of the body was clicked so it can decide whether the click means "pat" or "slap".

The body-part decision is made by the creature itself, not the pointer. The original engine's `Creature::ClickAction(x, y)` walks the creature's limb bounding boxes:

- If the click's Y-coordinate is above the head limb's center → return `ACTIVATE1` (pat / tickle).
- Else if the click is inside either leg's bounding box → return `DEACTIVATE` (slap).
- Else → return `INVALID` (torso, arms, tail — no reinforcement).

The JS rebuild mirrors this in `Creature.js:1534-1577`, using the same limb bounds and the same message-type values. The values themselves come from `MessageTypes` in `Rebuild/Main_Game/src/engine/messages/Message.js:81-105`, which preserves the original mapping:

| Constant   | Value | Meaning                   |
|------------|-------|---------------------------|
| ACTIVATE1  | 0     | Primary activation (pat)  |
| ACTIVATE2  | 1     | Secondary activation      |
| DEACTIVATE | 2     | Deactivation (slap)       |
| HIT        | 3     | Agent was hit             |

> **Don't confuse "message type" with "script event number".** Message type 0 (ACTIVATE1) fires script event **1**. Message type 2 (DEACTIVATE) fires script event **0**. The mapping is historical and is done by `Agent.handleMessage` (see Step 3).

### A note on event 117 (`SCRIPTPOINTERACTIONDISPATCH`)

There is a separate pointer flow that fires script event **117** (`SCRIPTPOINTERACTIONDISPATCH`) *on hover*, with `_p1_` set to 1 (slap-hover) or 2 (pat-hover). This is the **hover preview only** — it swaps the visual hand pose in `Pointer scripts.cos` (`scrp 2 1 1 117`) so the player can see whether their next click will pat or slap. It does **not** emit any stimulus and is not part of the reinforcement pipeline.

Only the click path in Step 2 actually touches the brain.

---

## Step 2 — The Pointer Sends a Message

Once `clickAction` has returned a valid message ID, `PointerAgent.activateAgent()` executes two things in order (matching the original order):

1. **Pointer-side visual script**: `getPointerScriptForAction(msgid)` maps the message type to a pointer-script event (`SCRIPTPOINTERACT1=101` for ACTIVATE1, `SCRIPTPOINTERDEAC=103` for DEACTIVATE). The pointer runs its own `scrp 2 0 0 10x` script — just an animation of the hand slapping or patting. This is cosmetic.
2. **Send the message to the creature**: `world.agentManager.sendMessage(pointer.myID, creature.myID, msgid, ...)`.

In the JS rebuild, step 2 lives in `Rebuild/Main_Game/src/engine/agents/PointerAgent.js` around line 1037. For a long time this path contained a defensive guard that **suppressed** ACTIVATE1 and DEACTIVATE when the target was a creature, under the belief that "creatures don't receive those messages from the pointer." That was a misreading of the original engine's behavior — in reality the stock bootstrap script `creatureDoneTo.cos` depends entirely on those messages arriving. With the guard in place, patting and slapping had no effect on the brain at all. The guard has been removed, and the pointer now always sends the message.

---

## Step 3 — The Creature Routes the Message to a Script

On the creature side, `Agent.handleMessage` (`Agent.js:1757-1854`) pulls the next message off the creature's per-agent message queue and translates the message type to a script event number:

```
case 0: // ACTIVATE1  → script event 1 ("Activate1")
case 1: // ACTIVATE2  → script event 2 ("Activate2")
case 2: // DEACTIVATE → script event 0 ("Deactivate")
case 3: // HIT        → script event 3 ("Hit")
```

It then calls `startEventScript(name, event, enhancedMessage)`, which finds the appropriate script in the Scriptorium and queues it to run on the next agent tick. The `em.from` field on the enhanced message points at the sender — in our case, the pointer.

Two gates matter here:

- **Creature permission bits** (`testCreaturePermissions`) — these only apply when the **sender** is itself a creature. The pointer is not a creature, so pat/slap bypass the permission check.
- **`world.isCAOSExecutionPaused()`** — if CAOS execution is globally paused (e.g. while a different agent has errored) the message is dropped on the floor.

---

## Step 4 — `creatureDoneTo.cos` Issues the Stimulus

The creature-side scripts that handle pat, slap and hit live in `Rebuild/Assets/Bootstrap/001 World/creatureDoneTo.cos`. All three use the same `doif from eq pntr` test to distinguish player interactions from creature-on-creature interactions.

### Pat (`scrp 4 0 0 1`, event 1 / ACTIVATE1)

```
scrp 4 0 0 1
    forf from
    doif dead ne 0 stop endi
    doif from eq pntr
        stim writ targ 1 1          ← POINTERPAT
    else
        stim writ targ 2 1          ← CREATUREPAT
    endi
    doif uncs ne 0 stop endi
    doif aslp gt 0 aslp 0 endi      ← wake the creature if asleep
    ...                              ← giggle sounds, "like" response, etc.
endm
```

### Slap (`scrp 4 0 0 0`, event 0 / DEACTIVATE)

```
scrp 4 0 0 0
    forf from
    doif dead ne 0 stop endi
    doif from eq pntr
        stim writ targ 3 1          ← POINTERSLAP
    else
        stim writ targ 4 1          ← CREATURESLAP
    endi
    doif uncs ne 0 stop endi
    doif aslp ne 0 aslp 0 endi
    ...                              ← "ow" sounds, dislike response, etc.
endm
```

`scrp 4 0 0 3` (event 3 / HIT) is a secondary slap path, used when something strikes the creature hard; it also issues `stim writ targ 3 1` when the hitter is the pointer.

The `stim writ targ N 1` form corresponds to the `STIM_WRIT` CAOS command (JS `commands/creatures/STIM_WRIT.js`). The integer argument `N` is a **predefined stimulus number** from the creature's genome — not a chemical ID, not a drive. Four of those numbers are hard-wired across all creatures:

| Stim # | Name            | Who sends it            |
|--------|-----------------|-------------------------|
| 1      | `POINTERPAT`    | Player pats the creature |
| 2      | `CREATUREPAT`   | Another creature pats it |
| 3      | `POINTERSLAP`   | Player slaps the creature |
| 4      | `CREATURESLAP`  | Another creature slaps it |

These constants are defined for the JS rebuild in `Rebuild/Main_Game/src/engine/creature/perception/PerceptionConstants.js:80-86`.

---

## Step 5 — `STIM WRIT` Reaches the Sensory Faculty

`STIM_WRIT` builds a `Stimulus` object and calls `SensoryFaculty.stimulate()` on the target creature. On both sides of the port, `stimulate()` looks the stimulus number up in a `StimulusLibrary` that was populated from the creature's genome at birth. Each entry was parsed by `Stimulus.initFromGenome` (JS: `Rebuild/Main_Game/src/engine/creature/perception/Stimulus.js:45-67`) and contains:

- `nounStim` (float) — how much to push the noun lobe
- `verbIdToStim` + `verbStim` — how much to push the verb lobe
- `bitFlags` — feature flags (e.g. "perceptible while asleep", per-chemical "no-learning")
- `chemicalsToAdjust[4]` — up to four biochemical IDs
- `adjustments[4]` — signed amounts matching each chemical

There is no hardcoded "pat chemistry" and no hardcoded "slap chemistry". What a pat actually does to a particular Norn is written in **that Norn's genome**. This is why selectively bred creatures can respond very differently to the same touch — their stimulus genes differ.

---

## Step 6 — Chemicals Flow, Drives Train

Inside `SensoryFaculty.processStimulus` (`SensoryFaculty.js:987-1080`), each non-zero chemical in the stimulus entry is applied via `adjustChemicalLevelWithTraining(chemicalId, adjustment, fromScriptEventNo, fromAgent)` (JS `SensoryFaculty.js:1257-1310`):

1. The chemical level itself is adjusted by the signed amount (this is what makes slap hurt — "pain" chemicals go up; this is what makes pat feel good — "reward" chemicals go up).
2. The helper looks up whether the chemical is a **drive chemical** (via `GetDriveNumberOfChemical`).
3. If it is a drive chemical and the creature is alert, it calls `brain.setInput('resp', driveId, adjustment)` — this is the **reinforcement lobe** input that trains the decision lobe.
4. If the creature is asleep instead, it fires `brain.setInput('prox', driveId, adjustment)` — the proximity/offline-learning path.

The per-stimulus `bitFlags` can disable learning on any subset of the four chemicals (or the `STIM WRIT ... 0` form sets `forceNoLearning` globally), letting genome designers deliver a purely biochemical effect without training the brain.

### What the brain actually learns

The reinforcement lobe doesn't know or care that the trigger was a hand from the sky. It knows:

- Which concept / action was winning in the decision lobe at the moment the `resp` input arrived (the "what the creature was doing").
- Which drive was reinforced, and in which direction.

So when you pat a Norn that is currently eating an apple, you reward "eat apple" — not "be patted". The decision lobe learns the concept that produced the reward, not the reward itself. The next time the same creature faces the same apple-and-hunger situation, the winning concept will fire slightly harder. Slap the same moment and you punish "eat apple" instead.

This is why timing matters so much when teaching a creature by touch: the reinforcement is attributed to whatever the decision lobe is holding at that exact tick.

---

## Putting It Together

End to end, pat and slap are three things layered on top of each other:

1. **Input routing**: `PointerAgent` converts a mouse click into a normal MESG of type 0 or 2 addressed to the creature.
2. **CAOS dispatch**: the creature's standard `creatureDoneTo.cos` scripts observe that MESG and issue an ordinary `STIM WRIT TARG` command with a well-known stimulus number.
3. **Sensory + biochemistry**: the creature's genome stimulus table decides which chemicals move and whether the drive-chemical movements train the reinforcement lobe.

Every link in the chain is CAOS-scriptable. Bootstrap mods can change how a pat feels without touching the engine at all — rewire `creatureDoneTo.cos` to issue a different stim number, or alter the genome's POINTERPAT entry to change the chemical payload. The engine's only job is to make sure the initial MESG gets delivered; everything after that is data.

---

## Key File References

### Rebuild (JS)

- `Rebuild/Main_Game/src/engine/agents/PointerAgent.js` — mouse click routing, `activateAgent`
- `Rebuild/Main_Game/src/engine/creature/Creature.js:1534-1577` — `clickAction` body-part detection
- `Rebuild/Main_Game/src/engine/messages/Message.js:81-150` — `MessageTypes` / `ScriptEvents` constants
- `Rebuild/Main_Game/src/engine/agents/Agent.js:1757-1854` — `handleMessage` routing to scripts
- `Rebuild/Main_Game/src/engine/caos/commands/creatures/STIM_WRIT.js` — `STIM WRIT` CAOS implementation
- `Rebuild/Main_Game/src/engine/caos/commands/creatures/StimulusBroadcast.js` — stimulus dispatch helper
- `Rebuild/Main_Game/src/engine/creature/perception/Stimulus.js:45-67` — `Stimulus.initFromGenome`
- `Rebuild/Main_Game/src/engine/creature/perception/StimulusLibrary.js` — genome stimulus table
- `Rebuild/Main_Game/src/engine/creature/perception/PerceptionConstants.js:80-86` — `POINTERPAT` / `POINTERSLAP` numbers
- `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:987-1310` — `processStimulus`, `adjustChemicalLevelWithTraining`

### Bootstrap scripts

- `Rebuild/Assets/Bootstrap/001 World/creatureDoneTo.cos` — `scrp 4 0 0 0/1/3` issue `stim writ targ 1/3 1`
- `Rebuild/Assets/Bootstrap/001 World/Pointer scripts.cos` — `scrp 2 1 1 117` hover hand-pose preview

## See Also

- [Creature Action Pipeline](creature-action-pipeline.md) — how the decision lobe chooses what the creature does (the "concept" that reinforcement attaches to).
- [Creature Decisions Script](creature-decisions-script.md) — the matching reinforcement path for creature-initiated actions.
- [Creature Eating: From Action to Biochemistry](creature-eating-biochemistry.md) — another end-to-end stimulus walkthrough, useful for comparison.
