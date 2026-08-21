# Pointer scripts

**Source file:** `Assets/Bootstrap/001 World/Pointer scripts.cos`

## Overview

This bootstrap script creates the visual "hand" indicator agent and defines the default pointer interaction scripts for all four major agent families (Simple, Compound, Vehicle, Creature). It establishes the foundational layer of mouse-driven interaction in the game world: how agents visually respond when the player clicks, picks up, or drops them, and how the hand cursor appears when hovering near interactive objects.

The script also defines two key scripts on the system Pointer agent (2 1 1): one that controls the visibility and appearance of the floating hand indicator based on interaction context, and one that dispatches pickup messages when the player clicks to pick up an agent.

For creatures specifically (family 4), the script implements the classic Creatures 3 **tickle/slap mechanic** — left-clicking a creature tickles (rewards) it by default, while right-clicking spanks (punishes) it. These behaviors can be inverted by holding the Delete or Insert keys, allowing the player to spank with left-click or tickle with right-click.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 95 | Hand Indicator | `hand` | Visual hand cursor overlay that floats near the pointer when interacting with agents | [Detail](#hand-indicator-1-1-95) |

---

## Hand Indicator (1 1 95)

A simple agent that serves as the visual hand graphic displayed near the mouse pointer. It has two poses: an open hand (pose 0) and a closed/pointing hand (pose 1). The hand is normally hidden off-screen at (-1000, -1000) and is made visible by floating it relative to the pointer when the engine dispatches a POINTERACTIONDISPATCH event.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `hand` | 2 frames starting at image index 15 |
| Plane | 8000 | Very high plane — always renders on top of all other agents |
| `attr` | 32 | Floatable — required for `frel` (float relative) to work |
| Initial position | (-1000, -1000) | Off-screen until activated by pointer events |

### Events

The hand indicator itself has no event scripts. Its visibility and pose are controlled entirely by the Pointer agent's POINTERACTIONDISPATCH script (event 117 on classifier 2 1 1).

---

## Pointer Agent Scripts (2 1 1)

The system Pointer agent receives two event scripts that control hand appearance and agent pickup.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 117 | POINTERACTIONDISPATCH | Controls the hand indicator's visibility and pose based on pointer interaction state |
| 1000 | Custom: Pointer Click Action | Sends a Pickup message to the target agent |

#### Event 117 — POINTERACTIONDISPATCH

Called by the engine when the pointer's interaction context changes. The `_p1_` parameter indicates the new state:

- **`_p1_ = 1`** (Pointer near interactive agent): Finds the hand indicator (1 1 95), sets it to **pose 1** (closed/pointing hand), and floats it relative to the pointer at offset (10, -20) using `frel pntr`.
- **`_p1_ = 2`** (Pointer hovering/ready): Finds the hand indicator, sets it to **pose 0** (open hand), and floats it relative to the pointer at offset (10, -20).
- **`_p1_ = 0`** (No interaction target): Finds the hand indicator, detaches it from the pointer (`frel null`), and moves it off-screen to (-10000, -10000).

Runs in `inst` (instant) mode to prevent visual lag.

#### Event 1000 — Pointer Click Action

A custom click action script. When fired, if `_p1_` is not null, it sends **message 4** (Pickup) to the agent referenced by `_p1_`. This provides a mechanism for the pointer to trigger pickup on a specific target agent through the message system.

Runs in `inst` mode.

---

## Default Pointer Interaction Scripts by Family

The script defines default visual feedback animations for pointer interactions across all four agent families. These scripts fire on the target agent when the player interacts with it via the pointer.

### Family 1 — Simple Agents (1 0 0)

Default pointer reaction animations for all simple agents.

| Event # | Event Name | Animation | Description |
|---|---|---|---|
| 101 | POINTERACT1 | `[1 0]` | Left-click: quick flash to frame 1 then back to 0 |
| 102 | POINTERACT2 | `[0 1 0]` | Right-click: brief blink animation |
| 103 | POINTERDEAC | `[0 1 0]` | Deactivate: brief blink animation |
| 104 | POINTERPICKUP | `[7 7 6]` | Pickup: shake animation (frames 7, 7, 6) |
| 105 | POINTERDROP | `[6 7 7 7 0]` | Drop: bounce animation ending at frame 0 |

### Family 2 — Compound Agents (2 0 0)

Default pointer reaction animations for compound agents, plus default handlers for port input events and custom messages.

| Event # | Event Name | Animation / Action | Description |
|---|---|---|---|
| 101 | POINTERACT1 | `[1 0]` | Left-click: quick flash |
| 102 | POINTERACT2 | `[0 1 0]` | Right-click: brief blink |
| 103 | POINTERDEAC | `[0 1 0]` | Deactivate: brief blink |
| 104 | POINTERPICKUP | `[7 7 6]` | Pickup: shake animation |
| 105 | POINTERDROP | `[6 7 7 7 0]` | Drop: bounce animation |
| 1000 | Port Input 0 | `[1 0]` | Default port 0 input: quick flash |
| 1001 | Port Input 1 | `[1 0]` | Default port 1 input: quick flash |
| 1002 | Port Input 2 | `[1 0]` | Default port 2 input: quick flash |
| 1003 | Port Input 3 | `[1 0]` | Default port 3 input: quick flash |
| 1004 | Port Input 4 | `[1 0]` | Default port 4 input: quick flash |
| 1005 | Port Input 5 | `[1 0]` | Default port 5 input: quick flash |
| 2000 | Custom 2000 | `[1 0]` | Default custom message handler: quick flash |
| 2001 | Custom 2001 | `[1 0]` | Default custom message handler: quick flash |
| 2002 | Custom 2002 | `[1 0]` | Default custom message handler: quick flash |
| 2003 | Custom 2003 | `[1 0]` | Default custom message handler: quick flash |
| 2004 | Custom 2004 | `[1 0]` | Default custom message handler: quick flash |
| 2005 | Custom 2005 | `[1 0]` | Default custom message handler: quick flash |
| 2006 | Custom 2006 | `mesg writ _p1_ 92` | Sends UIMOUSEDOWN (message 92) to `_p1_` |

Event 2006 is unique: instead of playing an animation, it forwards **message 92** (UIMOUSEDOWN) to the agent specified in `_p1_`. This provides a mechanism for compound agents to relay mouse-down UI events to other agents.

### Family 3 — Vehicles (3 0 0)

Default pointer reaction animations for vehicle agents.

| Event # | Event Name | Animation | Description |
|---|---|---|---|
| 101 | POINTERACT1 | `[1 0]` | Left-click: quick flash |
| 102 | POINTERACT2 | `[0 1 0]` | Right-click: brief blink |
| 103 | POINTERDEAC | `[0 1 0]` | Deactivate: brief blink |
| 104 | POINTERPICKUP | `[7 7 6]` | Pickup: shake animation |
| 105 | POINTERDROP | `[6 7 7 7 0]` | Drop: bounce animation |

### Family 4 — Creatures (4 0 0)

Creature pointer interactions implement the **tickle/slap mechanic**, the primary way the player rewards or punishes creatures. Unlike the simple animation-only responses of families 1-3, creature scripts check for modifier keys and send behavioral messages back to the creature.

| Event # | Event Name | Description |
|---|---|---|
| 101 | POINTERACT1 | Left-click on creature: tickle or spank depending on Delete key |
| 103 | POINTERDEAC | Right-click on creature: spank or tickle depending on Insert key |
| 104 | POINTERPICKUP | Pickup: shake animation `[7 7 6]` |
| 105 | POINTERDROP | Drop: bounce animation `[6 7 7 7 0]` |

#### Event 101 — POINTERACT1 (Left-Click on Creature)

**Default behavior (no modifier key): Tickle**
1. Plays tickle animation: `[2 3 2 3 2 3 2 3 0]` — rapid wiggling motion.
2. Sends **message 0** (Activate 1 / reward) to the creature (`from`).
3. Plays the `"tckl"` (tickle) sound effect.

**With Delete key held (keyd 46): Spank**
1. Targets the creature (`from`). If the creature is dreaming (`drea eq 1`), wakes it from dreams (`drea 0`). Otherwise, wakes it from sleep (`aslp 0`).
2. Plays spank animation: `[4 5 5 0]` — slapping motion.
3. Sends **message 2** (Deactivate / punishment) to the creature.
4. Plays the `"spnk"` (spank) sound effect.

#### Event 103 — POINTERDEAC (Right-Click on Creature)

The inverse of event 101:

**Default behavior (no modifier key): Spank**
1. Wakes the creature from dreaming or sleep (same as Delete+left-click above).
2. Plays spank animation: `[4 5 5 0]`.
3. Sends **message 2** (Deactivate / punishment) to the creature.
4. Plays the `"spnk"` sound effect.

**With Insert key held (keyd 45): Tickle**
1. Plays tickle animation: `[2 3 2 3 2 3 2 3 0]`.
2. Sends **message 0** (Activate 1 / reward) to the creature.
3. Plays the `"tckl"` sound effect.

Both spank actions wake the creature first if it is asleep or dreaming, ensuring the punishment is received.

---

## Removal Script (rscr)

The removal script cleans up the hand indicator agent:

1. Enumerates all agents of type 1 1 95 (hand indicator).
2. Kills each found instance.

This removes the visual hand overlay from the game. The default family scripts (1 0 0, 2 0 0, 3 0 0, 4 0 0) and Pointer scripts (2 1 1) are not explicitly removed, as they are overwritten or cleared by other bootstrap mechanisms.

---

## Impact on Stimulus / Room CA

None. This script only defines visual feedback animations and pointer interaction behavior. It does not emit any chemical atmospheres, stimuli, or environmental effects. The creature tickle/slap messages (0 and 2) are processed by the creature's own Activate 1 and Deactivate scripts, which may in turn apply stimuli — but that behavior is defined elsewhere, not in this script.
