# DS death.cos — Death Overlay Behaviour

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS death.cos`

## Overview

This script defines the behaviour of the **death overlay** agent (`1 1 56`) — the cloud/sludge effect that plays over a creature's corpse when it dies, then removes the body. The overlay is **created** by the creature die action in [DS creatureInvoluntary](DS%20creatureInvoluntary.md) (event 72), which spawns either a `death_cloud` (Norns/Ettins) or `death_sludge` (Grendels) instance and messages it 100. This script provides only that message handler. It is the Docking Station counterpart of the Creatures 3 [death](../C3/death.md).

It creates no agents itself.

## Agent 1 1 56: Death Overlay

### Events

| Event | Number | Description |
|---|---|---|
| Custom | 100 | Play the death effect over the corpse, remove the body, self-destruct |

#### Event 100 — Death effect

`_p1_` is the dead creature. The overlay:

1. Reads the corpse position and moves itself over it (offset up/left to centre the effect).
2. **Non-Grendel** (`death_cloud`): plays the `dcld` sound and a cloud build-up animation; once it's over the body it kills the corpse (`kill _p1_`), then plays the cloud dissipation animation.
3. **Grendel** (`death_sludge`): plays the `dslg` sound and the sludge animation; kills the corpse partway through; then finishes the sludge animation.
4. Kills itself.

## Impact on Stimulus / Room CA

None directly. The overlay is a visual death effect that also removes the corpse agent. (The environmental water/nutrient deposit on death is done by the die action in [DS creatureInvoluntary](DS%20creatureInvoluntary.md), not here.) It emits no stimuli and does not write Room CA.
