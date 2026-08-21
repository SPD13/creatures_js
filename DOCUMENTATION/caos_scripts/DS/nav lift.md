# nav lift.cos — The Navigator Lifts

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/nav lift.cos`

## Overview

This script creates the **navigator lifts** (`3 1 3`) that carry creatures between the floors of the Meso and Workshop, along with the **call buttons** (`2 12 21`) at each landing. Two lifts are placed — one in the Norn Meso (3 levels, 3 call buttons) and one in the Workshop (2 levels, 2 call buttons). A lift is an open-air **vehicle**: it grabs whoever is standing in its cabin (or a specific creature that summoned it), animates its rockets/feet, glides to the target level, and drops its passengers — stimming them as having travelled in a lift.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 1 3 | Navigator Lift | `ds lifts` | The cabin vehicle that moves between floors — see [detail](#agent-3-1-3-navigator-lift) |
| 2 12 21 | Lift Call Button | `ds lifts` | Per-landing button that summons the lift — see [detail](#agent-2-12-21-call-button) |

Lift state: `ov00` (0 = stationary, 1 = moving), `ov01` (current level ID), `ov02` (the specific creature to carry, when a creature pressed a call button). Call-button state: `ov00` (this button's level ID), `ov16` (its lift).

## Agent 3 1 3: Navigator Lift

A `new: vhcl` with an open-air cabin. The on-board **up** button sends Activate 1 (event 1), the **down** button sends Activate 2 (event 2).

### Events

| Event | Number | Description |
|---|---|---|
| Custom — go up | 1 | Travel up to the calling level, carrying passengers |
| Custom — go down | 2 | Travel down to the calling level, carrying passengers |

### Events 1 / 2 — Travel (symmetric)

1. Identify the sender (`from`). If a **creature** or the **pointer** triggered it directly (not via a call button), stim the creature **75 (wait)**, remember it as the passenger (`ov02`), and route by finding the correct call button one level up/down — disappointing the creature (**stim 0**) if it's already at the end of the shaft.
2. Otherwise (message came from a call button): **grab passengers** — either the specific `ov02` creature, or (when `_p2_ = 1`) all awake, living creatures standing in the cabin (`etch 4 0 0` + `spas`).
3. Close the doors, fire the rocket/navigator/feet animations, and glide (coarse then fine velocity ramps) to the call button's level.
4. On arrival: **stim every passenger 94 (travelled in a lift)** (`epas`), drop them (`dpas`), open the doors, update the current level (`ov01`), clear the moving flag, and message itself to reset.

## Agent 2 12 21: Call Button

| Event | Number | Description |
|---|---|---|
| Deactivate | 0 | Reset the button pose |
| Activate | 1 | Summon the lift to this landing |
| Timer | 9 | Retry summoning once the lift stops moving |

### Event 1 — Summon

Plays a button click, and if its lift exists and isn't already at this level: if the lift is busy moving it starts a retry timer; otherwise it works out whether the lift is above or below (comparing Y positions) and sends the lift a **go up (0)** or **go down (1)** message, passing this button's level ID so the lift knows where to stop.

## Removal Script

```
rscr
enum 3 1 3 / 2 12 21
    kill targ
next
```

Kills both lifts and all call buttons.

## Impact on Stimulus / Room CA

**Stimuli:** a creature that summons a lift is stimmed **75 (wait)** while it arrives, or **0 (disappointment)** if the lift can't go that way; on arrival, every passenger is stimmed **94 (travelled in a lift)**.

**Room CA:** none directly — the lifts move creatures spatially but write no CA. (The CA links that let smells/heat flow between the floors the lifts connect are set up separately by [lift ca linkers](lift%20ca%20linkers.md).)
