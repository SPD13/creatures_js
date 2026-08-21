# DS HoldingHandsControlScripts

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS HoldingHandsControlScripts.cos`

## Overview

This bootstrap script configures the **"holding hands"** mechanic — what happens when the player's hand picks up or drops a creature. It does not create any agents; it defines two creature event scripts (classifier `4 0 0`, i.e. all creatures) and refreshes the engine's game-variable state. It is the Docking Station counterpart of the Creatures 3 [HoldingHandsControlScripts](../C3/HoldingHandsControlScripts.md).

The script enforces the `Grettin` selectability rule: when `Grettin` is 0, only Norns (genus 1) can be held; all other creature types are immediately released. (In Docking Station `Grettin` defaults to **1** — set in [!DS_game variables](!DS_game%20variables.md) — so Grendels and Ettins are holdable too.)

**Difference from C3:** the C3 version sets `engine_creature_pickup_status` to 1 here; in the Docking Station version that line is **commented out**, because the pickup status is configured (to 3) centrally in `!DS_game variables`. The install body therefore just calls `rgam` to refresh the engine from the current game variables.

## No Created Agents

This script creates no agents. It defines event scripts on the existing creature classifier (`4 0 0`) and calls `rgam`.

---

## Creature Scripts (4 0 0)

### Events

| Event | Number | Description |
|---|---|---|
| Start Hold Hands | 13 | Fired when the hand picks up a creature |
| Stop Hold Hands | 14 | Fired when the hand drops a creature |

### Event 13 — Start Hold Hands

Triggered when the hand picks up a creature.

- **Selectability check:** if `game "Grettin" = 0` **and** the creature's genus is not 1 (not a Norn), it is immediately released (`nohh`) and the script stops — preventing non-Norns from being held when full selectability is off.
- **If allowed to be held:**
  1. `norn targ` — make the picked-up creature the game's current Norn focus.
  2. `clac 14` — set the click action to 14 (Stop Hold Hands), so clicking again drops the creature.
  3. `trck targ 70 70 2 0` — lock the camera onto the held creature with **hard tracking** (style 2), keeping it within a 70%×70% viewport rectangle and preventing the player from scrolling away. Focus is then restored to the default focus agent/part.

### Event 14 — Stop Hold Hands

Triggered when the hand drops the held creature.

1. `clac 0` — reset the click action to default.
2. `trck norn 70 70 1 0` — switch the camera to **flexible tracking** (style 1) of the current Norn: kept within a 70%×70% rectangle, but the player may pan away and tracking resumes when they pan back. This restores the normal slap/tickle interaction.

## Impact on Stimulus / Room CA

None. This script only controls the hand-creature interaction and camera tracking; it has no effect on stimuli or Room CA.
