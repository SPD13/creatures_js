# Hatchery2.cos - Egg Hatchery Machine

**Source**: `Assets/Bootstrap/001 World/Hatchery2.cos`

## Overview

This script implements the Egg Hatchery, the primary machine for hatching creature eggs in the Creatures 3 world. It is a vehicle-type agent with a mechanical lid and a status indicator. When a Norn egg (family 3, genus 4) is dropped into its cabin, the hatchery closes its lid, rises to a steaming position, and waits for the egg to hatch. Once the creature is born, it reopens and ejects the newborn into the world with a `born` event, automatically selecting it as the active Norn if none is currently selected.

The hatchery includes an automatic population control system. A periodic timer checks the number of living Norns and total creatures against the game's configured maximums (`c3_max_norns` and `c3_max_creatures`). If either population reaches two-thirds of its cap, the hatchery closes itself and disables its cabin to prevent further egg drops. When the population drops below the threshold, it reopens.

The hatchery emits CA 2 (heat) at a rate of 0.1.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 22 1 | Hatchery Machine | `hatch` frames 0-10 | Main vehicle agent with cabin for eggs, hatching animation, and population control | [Detail](#hatchery-machine-2-22-1) |
| 2 22 3 | Hatchery Lid | `hatch` frames 22-28 | Animated cover that opens and closes during hatching sequences | [Detail](#hatchery-lid-2-22-3) |
| 2 22 2 | Hatchery Indicator | `hatch` frames 16-21 | Status indicator that animates during hatching | [Detail](#hatchery-indicator-2-22-2) |

---

## Hatchery Machine (2 22 1)

The Hatchery Machine is a vehicle-type agent that accepts eggs into its cabin. It features a full hatching animation sequence (closing, rising with steam, reopening) and an automatic population limiter that disables the hatchery when creature counts approach their maximums.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 12 | Activatable (4) + Greedy portal (8) — automatically grabs agents entering the cabin |
| `cabn` | 30 0 180 135 | Cabin bounds for receiving eggs |
| `cabp` | -1 | Cabin plane behind the vehicle |
| `emit` | CA 2, rate 0.1 | Emits heat |
| Position | (451, 701) | Home position |
| `tick` | rand 10 30 | Random timer interval for population checks |
| Sprite | `hatch`, 16 images, plane 11 | Initial pose 10 |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov00` | Open/closed state: 0 = open and accepting eggs, 1 = closed (hatching or population limit) |
| `ov99` | Hatching in progress flag: 0 = idle, 1 = currently hatching an egg |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 124 | Got Carried Agent | An agent was dropped into the hatchery cabin |
| 3000 | Internal message | Begin hatching sequence (close lid, rise, wait for hatch) |
| 3001 | Internal message | Reset and reopen hatchery, eject newborn creature |
| 3002 | Internal message | Close hatchery (population limit reached) |
| 3003 | Internal message | Reopen hatchery (population below limit) |
| 9 | Timer | Periodic population check |

#### Event 124 — Got Carried Agent

Instant execution. Fires when an agent enters the hatchery's cabin (greedy portal).

1. Targets the held agent (`targ held`).
2. **If it is a Norn egg** (family 3, genus 4):
   - Stops the timer (`tick 0`) to prevent population checks during hatching.
   - Disables the hatchery (`attr 0`).
   - If the hatchery lid is not yet fully closed (pose < 3), increments the pose by 1 (partial closing animation).
   - Sends message 3000 to self to begin the full hatching sequence.
3. **If it is a creature** (family 4):
   - Checks if the creature's `ov53` is an agent reference pointing to this hatchery. If so, stops (the creature stays — this supports Ettin creatures placed by the egg maker system).
4. **Otherwise**: Sends message 5 (Activate 1) back to the dropped agent, effectively rejecting it from the hatchery.

#### Event 3000 — Hatching Sequence

Locked, instant execution. Orchestrates the full hatching animation and waits for the egg to hatch.

Sets `ov99 = 1` (hatching in progress).

**If hatchery is open** (`ov00 = 0`):
1. Sets `ov00 = 1`, disables hatchery (`attr 0`).
2. Targets the lid (2 22 3), plays `"hat3"` sound, animates lid closing `[5 4 3 2 1 0]`, waits for completion.
3. Targets self, plays `"hat1"` sound, sets upward velocity (-1, -3), plays `"hat2"` sound.
4. Animates hatchery rising `[10 10 9 9 8 8 7 7 6 6 5 5 4 4 3 3 2 2 1 1 0]`.
5. Sends message 1002 to the lid (move lid up).
6. After 30 ticks, stops movement. Plays `"stm1"` (steam) sound. Moves to steaming position (421, 611).
7. Targets the held egg. If it is a Norn egg:
   - **Hatching loop**: Waits tick by tick until `CODE = -1` (the egg is no longer executing any script, meaning hatching is complete). If the egg becomes null during the wait, sends message 3001 (reset) and stops.
   - On successful hatch: sends message 1000 to the egg.
8. If the egg disappears after the loop, sends message 3001 (reset) and stops.
9. Otherwise, animates hatchery opening `[0 1 2 3 255]`.

**If hatchery is already closed** (`ov00 = 1`):
- Passes all carried agents from the hatchery to the message sender (`rpas ownr from`).

#### Event 3001 — Reset and Birth

Locked execution. Reopens the hatchery, moves everything back to starting positions, and ejects the newborn creature.

1. Plays `"stm1"` sound. Targets the lid, moves it down (velocity 1, 3). Waits 30 ticks, stops.
2. Targets self, plays `"hat1"`, moves down (velocity 1, 3). Waits 30 ticks, stops.
3. Moves hatchery to home position (452, 704).
4. Plays `"hat2"`, animates opening `[0 1 1 2 2 3 3 4 4 5 5 6 6 7 7 8 8 9 9 10 10]`, waits for completion.
5. Targets the lid, plays `"hat3"`, animates lid opening `[0 1 2 3 4 5]`.
6. If holding an Ettin creature (family 4): wakes it up (`aslp 0`).
7. **Ejects passengers** (`epas 4 0 0` — enumerate all family 4 passengers):
   - Passes each creature out of the hatchery (`rpas`).
   - Stops their velocity.
   - Calls `born` to trigger the creature's birth event scripts.
   - Sets creature attributes to `game "c3_creature_attr"`.
   - If no Norn is currently selected (`norn eq null`), selects this creature as the active Norn.
8. Drops all remaining passengers (`dpas 0 0 0`).
9. Resets hatchery: `attr 12`, `ov00 = 0`, `ov99 = 0`.

#### Event 3002 — Close (Population Limit)

Only executes if the hatchery is currently open (`ov00 = 0`). Locked execution.

1. Targets the lid, plays `"hat3"`, animates lid closing `[5 4 3 2 1 0]`, waits for completion.
2. Targets self, plays `"hat1"`, sets upward velocity (-1, -3), plays `"hat2"`.
3. Animates rising `[10 10 9 9 8 8 7 7 6 6 5 5 4 4 3 3 2 2 1 1 0]`.
4. Sends message 1002 to lid (move up).
5. After 30 ticks, stops. Plays `"stm1"`, moves to (421, 611).
6. Disables cabin (`cabn -1 -1 -1 -1`) to prevent eggs from being dropped in.
7. Sets `ov00 = 1`.

#### Event 3003 — Reopen (Population Below Limit)

Only executes if the hatchery is currently closed (`ov00 = 1`). Locked execution.

1. Plays `"stm1"`, targets lid, moves it down (velocity 1, 3). Waits 30 ticks, stops.
2. Targets self, plays `"hat1"`, moves down (velocity 1, 3). Waits 30 ticks, stops.
3. Plays `"hat2"`, animates opening `[0 1 1 2 2 3 3 4 4 5 5 6 6 7 7 8 8 9 9 10 10]`, waits for completion.
4. Targets lid, plays `"hat3"`, animates lid opening `[0 1 2 3 4 5]`.
5. Re-enables cabin (`cabn 50 20 180 130`, `cabp -1`).
6. Sets `ov00 = 0`.

#### Event 9 — Timer (Population Check)

Periodic population monitoring. Fires every 10-30 ticks (randomized).

1. If hatching is in progress (`ov99 = 1`), stops immediately.
2. Drops all passengers (`dpas 0 0 0`) — clears any non-egg agents.
3. Counts all living Norns (`enum 4 1 0`, checking `dead = 0`).
4. If living Norn count >= 2/3 of `game "c3_max_norns"`, flags for closure.
5. Counts all living creatures (`enum 4 0 0`, checking `dead = 0`).
6. If living creature count >= 2/3 of `game "c3_max_creatures"`, flags for closure.
7. Resets timer (`tick rand 10 30`).
8. If flagged: sends message 3002 (close hatchery).
9. Otherwise: sends message 3003 (reopen hatchery).

---

## Hatchery Lid (2 22 3)

A simple agent that serves as the animated cover of the hatchery. It moves up when the hatchery closes and returns to its resting position when it reopens.

### Properties

| Property | Value | Notes |
|---|---|---|
| `clac` | -1 | Mouse click does not activate creatures |
| `emit` | CA 2, rate 0.1 | Emits heat |
| Position | (401, 573) | Resting position |
| Sprite | `hatch`, 7 images, first image 22, plane 12 | Initial pose 5 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1002 | Internal message | Move lid up to open position |

#### Event 1002 — Move Lid Up

1. Sets pose 6.
2. Sets upward velocity (-1, -3).
3. Waits 30 ticks, stops movement.
4. Moves to elevated position (370, 480).

The lid is moved back down during events 3001 and 3003 on the Hatchery Machine, which directly target and reposition it.

---

## Hatchery Indicator (2 22 2)

A simple agent that serves as a visual status indicator for the hatchery. It animates forward during hatching and backward when resetting.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Activatable |
| `clac` | -1 | Mouse click does not activate creatures |
| Position | (406, 601) | |
| Sprite | `hatch`, 6 images, first image 16, plane 13 | |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Internal message | Animate indicator forward (hatching active) |
| 1001 | Internal message | Animate indicator backward (reset) |

#### Event 1000 — Hatching Active

Waits 20 ticks, then animates forward `[0 1 2 3 4 5]` (lights up progressively).

#### Event 1001 — Reset

Animates backward `[5 4 3 2 1 0]` (lights turn off).

---

## Removal Script (rscr)

The removal script cleanly uninstalls the entire hatchery system:

1. Kills all Hatchery Machine instances (`enum 2 22 1 -> kill targ`).
2. Kills all Hatchery Indicator instances (`enum 2 22 2 -> kill targ`).
3. Kills all Hatchery Lid instances (`enum 2 22 3 -> kill targ`).
4. Removes the timer script (`scrx 2 22 1 9`).

## Sound Effects

| Sound ID | Context | Description |
|---|---|---|
| `"hat1"` | Events 3000, 3001, 3002, 3003 | Hatchery body movement sound |
| `"hat2"` | Events 3000, 3001, 3002, 3003 | Hatchery animation sound |
| `"hat3"` | Events 3000, 3001, 3002, 3003 | Lid opening/closing sound |
| `"stm1"` | Events 3000, 3001, 3002, 3003 | Steam/hissing sound at elevated position |
