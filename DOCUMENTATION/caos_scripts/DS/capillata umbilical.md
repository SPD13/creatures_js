# capillata umbilical.cos — C3 ↔ DS Teleporter

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/capillata umbilical.cos`

## Overview

The **Capillata Umbilical** is the two-way teleporter ("lift") that connects the Creatures 3 Ark and the Docking Station Capillata when the two worlds are **docked**. It is therefore only built in a docked world (`eame "engine_no_auxiliary_bootstrap_1" = 0`). It consists of a call button on each side, a destination "energizer" effect, and a Room CA link so chemicals flow between the joined ships.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 1 4 | Umbilical (C3 side) | `capillata umbilical` | Call button in the C3 Ark — teleports to the Capillata |
| 3 1 5 | Umbilical (DS side) | `capillata umbilical` | Call button in the Capillata — teleports to the C3 Ark |
| 1 1 192 | Destination Energizer | `capillata umbilical` | Arrival-point teleport effect (one per side) |

The two call buttons and their energizers are saved to game variables (`CUc3`, `CUc3DE`, `CUds`, `CUdsDE`). A **CA link** is created between the two buttons' rooms (`link <c3 room> <ds room> 100`), so Room CA diffuses between the docked ships.

## Agent 3 1 4 / 3 1 5: Call Buttons

Both are `attr 4` (hand-activatable, invisible to creatures). Each has a `name "status"` ("inactive"/"active") so it can't be re-triggered mid-teleport.

### The teleport event (3 1 4 event 2 / 3 1 5 event 1)

When pushed while inactive:

1. Play `1bep`, stim the pusher to wait (75), and set status "active".
2. Animate the call button and electro-lift spark, light up the local **energizer**, and reveal the **destination energizer** (`1 1 192`) at the arrival point.
3. Play the `tele` sound, then move the traveller(s):
   - **Pushed by the hand/owner:** every alive, awake, uncarried, un-held creature within range 200 (`esee 4 0 0`) is moved to the destination (`mvft`) and **stimmed 94** ("travelled in a lift").
   - **Pushed by a creature:** only that creature (`from`) is moved and stimmed.
4. If hand-activated, pan the camera to the destination metaroom (`meta`).
5. Turn off the energizers/spark, hide the destination energizer, reset the button and status to "inactive". (A buzz plays if pushed while already active.)

`3 1 4` (C3 side) sends travellers to the Capillata; `3 1 5` (DS side) sends them to the C3 Ark — the logic is mirrored.

## Removal Script

```
rscr
enum 3 1 4
    kill targ
next
enum 3 1 5
    kill targ
next
enum 1 1 192
    kill targ
next
```

Kills both call buttons and any destination energizers.

## Impact on Stimulus / Room CA

- **Room CA:** a `link` is established between the C3-side and DS-side rooms so CA diffuses between the docked ships.
- **Stimuli:** travellers are stimmed with **75** (wait) on activation and **94** ("travelled in a lift") on arrival.
