# training dummy.cos — The Training Dummy

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/training dummy.cos`

## Overview

The **Training Dummy** (`2 21 21`) is a creature-shaped teaching toy in the Workshop that helps creatures learn their **action vocabulary**. When a creature (or the hand) pushes, pulls, hits or deactivates it, the dummy looks up the corresponding action word from the `Creature Actions` catalogue and **"says" it** (via the speech-bubble factory), so a watching creature associates the spoken verb with the action. A bell button morphs the dummy between **Norn**, **Grendel** and **Ettin** appearances, setting its category (`cato`) to match so each species recognises it as one of their own.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 21 21 | Training Dummy | `training_dummy` | The action-word teaching toy — see [detail](#agent-2-21-21-training-dummy) |

`ov00` holds the current appearance (0 Norn, 1 Grendel, 2 Ettin).

## Agent 2 21 21: Training Dummy

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 (push) | 1 | Say the "push" word (Creature Actions 1), animate, kiss sound |
| Activate 2 (pull) | 2 | Say the "pull" word (Creature Actions 2), animate, tickle sound |
| Deactivate | 0 | Say the "let go" word (Creature Actions 3), animate |
| Hit | 3 | Say the "hit" word (Creature Actions 13), animate, spank sound |
| Custom — morph | 1000 | Cycle the appearance Norn → Grendel → Ettin (and set `cato`) |

### Saying the word

Each interaction reads the matching word from the `Creature Actions` catalogue and sends it to the **speech-bubble factory** (`1 2 10`, event 126) with the dummy as the speaker — making the dummy speak the verb out loud. Nearby creatures hear it and reinforce the link between that action and its word. The animation played depends on the dummy's current species appearance.

## Removal Script

```
rscr
enum 2 21 21
    kill targ
next
```

Kills the training dummy.

## Impact on Stimulus / Room CA

None. The training dummy emits no creature stimuli and writes no Room CA. Its teaching effect is **linguistic**: on each interaction it makes itself **speak the matching action word** (through the speech-bubble factory `1 2 10`), so creatures learn the verbs for push/pull/hit/let-go. The `cato` override makes it read as the player's chosen creature species.
