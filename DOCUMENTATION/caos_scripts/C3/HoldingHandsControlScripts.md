# HoldingHandsControlScripts

**Source file:** `Assets/Bootstrap/001 World/HoldingHandsControlScripts.cos`

## Overview

This bootstrap script configures the "holding hands" mechanic — the core interaction between the player's hand (Pointer agent, classifier 4 0 0) and creatures in the world. It does not create any new agents. Instead, it enables creature pickup globally by setting the `engine_creature_pickup_status` game variable and defines the two event scripts on the Pointer agent that govern what happens when the hand picks up or drops a creature.

The script enforces the `Grettin` selectability rule: when `Grettin` is 0 (the default), only Norns (genus 1) can be held by the hand. All other creature types (Grendels, Ettins, etc.) are immediately released. When `Grettin` is set to 1 (by other scripts such as the stars and pickup panel), all creature types become holdable.

When the hand successfully picks up a creature, the camera locks onto that creature with hard tracking (style 2), preventing the player from scrolling away. When the creature is dropped, the camera switches to flexible tracking (style 1) on the current Norn, allowing the player to freely pan the view again.

## No Created Agents

This script does not create any agents. It defines event scripts for the existing Pointer agent (4 0 0) and sets a global game variable.

---

## Game Variable

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_creature_pickup_status` | Integer | `1` | Enables the creature pickup system. Set to 1 during bootstrap to allow the hand to pick up creatures. Other scripts (e.g., stars and pickup panel) may change this to 3 to alter pickup behavior. |

After setting the variable, the script calls `rgam` to force the engine to immediately refresh its internal state from the updated game variables.

---

## Pointer Agent Scripts (4 0 0)

### Events

| Event | Number | Description |
|---|---|---|
| Start Hold Hands | 13 | Fired when the hand picks up a creature |
| Stop Hold Hands | 14 | Fired when the hand drops a creature |

### Event 13 - Start Hold Hands (STARTHOLDHANDS)

Triggered when the player's hand picks up a creature. This script determines whether the creature is allowed to be held and, if so, sets up the camera to follow it.

**Selectability check:**
- If the `Grettin` game variable is 0 (default — only Norns selectable) **and** the target creature's genus is not 1 (i.e., it is not a Norn), the creature is immediately released from the hand (`nohh`) and the script stops. This prevents the player from holding Grendels, Ettins, or other non-Norn creatures when full creature selectability has not been enabled.

**If the creature is allowed to be held:**
1. `norn targ` — Sets the game's current Norn focus to the picked-up creature. This makes it the "selected" creature for UI and other systems.
2. `clac 14` — Sets the Pointer's click action to 14 (STOPHOLDHANDS). This means clicking the held creature again will trigger the drop event.
3. `trck targ 70 70 2 0` — Locks the camera onto the held creature with **hard tracking** (style 2). The creature is kept within a rectangle centered on 70% x 70% of the viewport. Hard tracking prevents the player from scrolling the camera away from the held creature. No metaroom transition effect is used (transition 0).

### Event 14 - Stop Hold Hands (STOPHOLDHANDS)

Triggered when the hand drops the currently held creature.

1. `clac 0` — Resets the Pointer's click action to 0 (no click action), restoring default click behavior.
2. `trck norn 70 70 1 0` — Switches the camera to track the current Norn with **flexible tracking** (style 1). The Norn is kept within a 70% x 70% viewport rectangle, but the player can freely pan the camera away. If they pan back, tracking resumes automatically. No metaroom transition effect is used (transition 0).

---

## Impact on Stimulus / Room CA

None. This script only controls the hand-creature interaction mechanic and camera behavior. It has no effect on stimuli, room chemical atmospheres, or environmental properties.
