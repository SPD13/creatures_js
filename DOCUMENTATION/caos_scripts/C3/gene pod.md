# Gene Pod

**Source**: `Assets/Bootstrap/001 World/gene pod.cos`

## Overview

The Gene Pod script creates two pod-shaped compound agents (classifier **3 3 32**) used as creature holding slots for the Genetic Splicer system. Each gene pod acts as a vehicle that can accept a creature via drag-and-drop, hold it in place, and interface with the Genetic Splicer Panel (3 3 18) to facilitate crossbreeding.

The two pods are positioned in the Engineering section of the Ark, near the Genetic Splicer Panel. Pod 1 (ov80=1) is placed at approximately (5190, 3905) and Pod 2 (ov80=2) at approximately (4985, 3891). When a creature is dropped into a pod, the pod visually closes around it, plays a squelching sound, and notifies the splicer panel that a parent creature is ready for splicing.

## Created Agents

| Classifier | Agent | Description | Details |
|---|---|---|---|
| 3 3 32 | Gene Pod (×2) | Creature holding pod for the Genetic Splicer system | [Details](#gene-pod-3-3-32) |

## Gene Pod (3 3 32)

A compound vehicle agent with 4 parts (0–3) that visually represents a biological pod. Part 0 is the base body; parts 1–3 are animated petal/flap elements that open and close around a creature. Two instances are created, distinguished by `ov80` (1 or 2), corresponding to parent slot 1 and parent slot 2 on the splicer panel.

**Agent Properties**:
- **Permeability**: 100 (fully permeable)
- **Attributes**: 4 (activatable)
- **Cabin**: Defined interior for holding creatures
- **Cabin passenger capacity**: 1 (`cabw 1`)

**Object Variables**:
- `ov80`: Pod slot number (1 or 2), identifies which splicer parent slot this pod corresponds to
- `ov99`: Reference to the creature currently held in the pod (null if empty)

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | User clicks on the pod — sends auto-open message to splicer panel |
| Pod Close Sequence | 2000 | Main logic for capturing a dropped creature and closing the pod |
| Splicer Pickup Request | 5000 | Called by splicer panel to retrieve the creature from the pod |
| Receive Creature References | 1000 | Receives parent creature references from splicer panel |
| Reset Pod | 1001 | Resets the pod to its open/empty state and releases any held creature |
| Kill Contents | 1002 | Destroys all creatures held as passengers in the pod |

### Event Details

#### Event 1 — Activate (User Click)

When the user clicks on the gene pod, it finds a random Genetic Splicer Panel (3 3 18) and sends it message **1040** (auto-open request), prompting the splicer panel UI to become visible. It then sends itself message **2000** to begin the creature capture sequence.

#### Event 2000 — Pod Close Sequence

This is the core logic of the gene pod. It performs the following steps:

1. **Check for passengers**: Enumerates existing passengers (`epas`). If a creature is already inside, the sequence aborts.
2. **Capture nearby creatures**: If empty, iterates over creatures in the cabin area (`etch 4 2 0`) and zombifies them (freezes their AI), sets their pose to 80, and forces them into the pod as passengers (`spas`).
3. **Pull creature into pod**: Uses `gpas` to grab a passenger. The first passenger found has its attributes modified (carryable/pickupable bits cleared) so it cannot be removed, and is zombified with pose 0. Any additional passengers are released back.
4. **Store creature reference**: Saves the held creature in `ov99`.
5. **Play close animation**: Plays a squelching sound (`sqh3`) and animates parts 1–3 through frames 0–19 (the pod closing), then resets part 0 to frame 9 (closed state).
6. **Notify splicer panel**: Sends message **1010** to the splicer panel with `_p1_` = pod slot number (`ov80`) and `_p2_` = the creature agent reference (`ov99`), registering the creature as a parent for splicing.

#### Event 5000 — Splicer Pickup Request

Called by the splicer panel when it needs to retrieve the creature. Updates the `ov99` reference by checking current passengers, then forwards the creature to the splicer panel by sending it message **2000** (trigger splice).

#### Event 1000 — Receive Creature References

Receives two agent references via `_p1_` and `_p2_` and stores them in `va88`/`va89`. Used by the splicer panel to pass creature data back to the pod.

#### Event 1001 — Reset Pod

Resets the pod to its open/empty state:
- Clears the splicer panel's stored references (`ov88`, `ov89`)
- Resets slot tracking (`ov80 = 0`)
- Resets visual parts 6 and 7 to frame 0
- Un-zombifies and releases all passengers (`epas` → `zomb 0`, restore attributes)
- Drops all passengers (`dpas`)

#### Event 1002 — Kill Contents

Destroys all creatures currently held as passengers in the pod. Iterates through passengers, kills their AI (`dead`), then removes them (`kill targ`). Used during cleanup operations.

### Removal Script (rscr)

The removal section cleans up all gene pod instances and their associated scripts:
- Kills all existing gene pod agents (`enum 3 3 32 → kill targ`)
- Removes all registered event scripts (`scrx` for events 1, 1000, 1001, 1002, 5000, 124)

## Inter-Agent Communication

The gene pod works as part of the Genetic Splicer system alongside the Genetic Splicer Panel (3 3 18):

| Direction | Message | Purpose |
|---|---|---|
| Gene Pod → Splicer Panel | 1040 | Request splicer panel to auto-open its UI |
| Gene Pod → Splicer Panel | 1010 | Register creature in parent slot (params: slot number, creature ref) |
| Gene Pod → Splicer Panel | 2000 | Trigger the splice/crossover operation |
| Splicer Panel → Gene Pod | 1000 | Pass creature references to the pod |
| Splicer Panel → Gene Pod | 1001 | Reset pod to empty state |
| Splicer Panel → Gene Pod | 1002 | Kill pod contents |
| Splicer Panel → Gene Pod | 5000 | Request creature pickup |
