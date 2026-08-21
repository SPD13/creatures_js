# Toolbar

**Source file:** `Assets/Bootstrap/001 World/toolbar.cos`

## Overview

The Toolbar script installs the bottom/right-edge sidebar and counter panels used by the main menu / world selection screen. It builds a transition button (agent `1 1 606`) that hands the player back to the `c3_meta_transition` game meta-room, and a compound counter panel (agent `1 1 605`) that displays a 3-digit counter, exposes three difficulty preset buttons, and hides a classic Space Invaders-style easter-egg minigame.

The easter egg is only unlockable when `game "scared"` equals `1`. When unlocked, clicking the counter's hidden button spawns descending "fairy" invaders (`1 1 600`), a player-controlled spaceship (`1 1 601`), player bullets (`1 1 602`), invader droppings (`1 1 603`), death effects (`1 1 604`), and debris particles (`2 1 610`). If the easter egg has not been unlocked, the button simply plays the `"buzz"` sound.

The script variables `ov00`, `ov01`, and `ov02` on the counter panel store the current difficulty offset, the current counter value (0-999), and the difficulty selection respectively.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 1 606 | Sidebar Transition Button | Simple agent that returns to the `c3_meta_transition` metaroom when clicked | [Details](#agent-1-1-606-sidebar-transition-button) |
| 1 1 605 | Counter / Difficulty Panel | Compound panel with counter digits, difficulty buttons, lives display, and hidden easter-egg trigger | [Details](#agent-1-1-605-counter--difficulty-panel) |
| 1 1 600 | Fairy (Invader) | Descending invader used in the Space Invaders easter egg | [Details](#agent-1-1-600-fairy-invader) |
| 1 1 601 | Player Spaceship | Keyboard-controlled shooter used in the easter egg | [Details](#agent-1-1-601-player-spaceship) |
| 1 1 602 | Bone (Bullet) | Player-fired projectile in the easter egg | [Details](#agent-1-1-602-bone-bullet) |
| 1 1 603 | Fairy Dropping | Falling particle occasionally spawned by descending fairies | [Details](#agent-1-1-603-fairy-dropping) |
| 1 1 604 | Death Effect | Short-lived "deth" animation agent used when the player ship is hit | [Details](#agent-1-1-604-death-effect) |
| 2 1 610 | Debris Particle | Scattered particles spawned at the spaceship's death sequence | [Details](#agent-2-1-610-debris-particle) |

---

## Agent 1 1 606: Sidebar Transition Button

A simple agent placed at the bottom of the screen (`mvto 131 357`) that acts as a clickable transition button back to the `c3_meta_transition` metaroom (meta command 6). It uses the `sidebar` sprite starting at frame 27 on plane 0.

**Sprite:** `sidebar` (frame 27)
**Plane:** 0

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Idle animation tick |
| Activate 1 | 1 | Transition to `c3_meta_transition` metaroom |

### Event 9 - Timer

Plays a brief 2-frame idle animation (`anim [0 0 1 0]`) and re-seeds the timer with a random interval between 100 and 600 ticks.

### Event 1 - Activate 1

If the player is holding something (`hhld <> null`), the held item is dropped via `nohh`. The camera is then switched to the `c3_meta_transition` metaroom on screen 6.

---

## Agent 1 1 605: Counter / Difficulty Panel

A compound agent placed at the right edge of the world (`mvto 7212 120`) that serves both as a world-selection/difficulty panel and a hidden minigame. It exposes:

- Three 3-digit counter display "dull" parts (`1`, `2`, `3`) that count upward (0-999) each time the counter is poked via message 1005.
- Three difficulty buttons (parts `5`, `6`, `7`) that set the easter-egg difficulty (0, 30, or 40) and post the chosen value into `ov00` on any existing fairies.
- A "lives" display dull part (`8`) used during the minigame.
- A hidden button (part `9`) at position (0, 430) that either starts the easter-egg minigame (if `game "scared"` equals 1) or plays a buzz sound.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Difficulty / fairy spawn speed offset (initialised to 2) |
| `ov01` | Current counter value (0-999) |
| `ov02` | Selected difficulty level (0, 30, or 40) |

### Parts

| Part | Type | Description |
|---|---|---|
| 1 | Dull | Counter hundreds digit |
| 2 | Dull | Counter tens digit |
| 3 | Dull | Counter ones digit |
| 4 | Button | Primary action button (sends message 1000, transitions metarooms) |
| 5 | Button | Difficulty preset 1 (easiest, `ov02 = 0`) |
| 6 | Button | Difficulty preset 2 (`ov02 = 30`) |
| 7 | Button | Difficulty preset 3 (`ov02 = 40`) |
| 8 | Dull | Lives / state indicator |
| 9 | Button | Hidden easter-egg trigger (sends message 1000) |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Easter-egg auto-spawn fairies if none are left |
| Button 1000 | 1000 | Launch the easter-egg minigame if unlocked, otherwise buzz |
| Button 1001 | 1001 | Select difficulty 1 (easy) |
| Button 1002 | 1002 | Select difficulty 2 (medium) |
| Button 1003 | 1003 | Select difficulty 3 (hard) |
| Message 1004 | 1004 | Decrement the lives display by one |
| Message 1005 | 1005 | Increment the counter display by one |
| Button 1006 | 1006 | Focus the default creature and transition to main metaroom |

### Event 1001 / 1002 / 1003 - Difficulty Selection

Sets the poses of the three difficulty button parts to form a radio-button look, stores the chosen difficulty value into `ov02` (0, 30 or 40), and enumerates any currently spawned fairies (`1 1 600`) to propagate that difficulty into their `ov00` fields.

### Event 1004 - Lives Decrement

If `ov00 > 0`, decrements `ov00` by 1 and re-renders the lives display part (part 8) to pose `ov00`.

### Event 1005 - Counter Increment

If `ov01 < 999`, increments `ov01` by 1. The value is then split into hundreds/tens/ones and each digit is rendered on parts 1, 2 and 3 respectively.

### Event 1006 - Transition to Default Focus

Targets the game variable `c3_default_focus` on part `c3_default_focus_part`, focuses it, drops any held item, and issues `meta 0` to transition to the default metaroom via `c3_meta_transition`.

### Event 1000 - Easter-Egg Launcher

If `game "scared"` equals 1:
1. Drops focus (`fcus`), retargets the owner, sets `ov99 = 1` to mark the egg as active, and resets the timer to 10.
2. Kills any leftover debris (`2 1 610`).
3. Resets the lives indicator to `ov00 = 2` (pose 2) and zeroes the counter display.
4. Kills any existing player ship (`1 1 601`) and spawns a new one at (7625, 585) with attributes 64, elasticity 0, camera-room 0, and input mask 1 (keyboard events). Its `ov00` is initialised to 3 (lives).
5. Kills any remaining fairies and spawns a 3x10 grid of new `1 1 600` fairies starting at (7416, 150) with 50 px horizontal spacing and 60 px vertical spacing. Each fairy is given `ov10 = -1` (initial movement direction) and `ov00 = ov02` (difficulty).

Otherwise (`scared != 1`): plays sound `"buzz"`.

### Event 9 - Timer (Respawn Fairies)

If no fairies are currently alive (`totl 1 1 600 eq 0`), spawns another 3x10 grid of invaders using the same pattern as event 1000, ensuring the minigame continues for as long as the player has lives.

---

## Agent 1 1 600: Fairy (Invader)

A simple agent representing one of the descending invaders. Uses the `fairy` sprite (frame 10, 29 frames total) on plane 300. It has attribute 64 (Camera shy) and is animated with `[0 1 2 3 4 5 6 7 8 9 255]`.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Difficulty level (higher = faster drop rate and more droppings) |
| `ov10` | Current horizontal direction: positive = right, negative = left |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Movement, edge detection, dropping spawns, and hit detection |

### Event 9 - Timer

Runs every 5 ticks:

1. **Edge detection**: if the obstacle distance to the left is `<= 50` and `ov10 < 0`, flip direction (`negv ov10`) and move down by 30. Mirror logic for the right edge.
2. **Speed**: if fewer than 5 fairies remain, velocity multiplier is 20 (fast), otherwise 10.
3. Horizontal velocity is set to `ov10 * multiplier`.
4. **Dropping spawn**: with probability `(rand ov00 50) > 48` (i.e., more often on higher difficulty), spawns a fairy dropping (`1 1 603`) at the fairy's position.
5. **Hit detection**: targets the player ship (`1 1 601`) and if touching, sends message 1000 to the player ship (player is hit).

---

## Agent 1 1 601: Player Spaceship

A simple agent representing the player-controlled shooter placed at (7625, 585). Uses `sidebar` sprite (frame 12, 2 frames) on plane 200 with attributes 64 and elasticity 0. The input mask is set to 1, enabling keyboard input.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Remaining lives (initialised to 3) |
| `ov99` | Counter-panel flag: 0 means minigame over, 1 means active |

### Events

| Event | Number | Description |
|---|---|---|
| Message 1000 | 1000 | Ship hit - lose a life or trigger game-over |
| Key Down | 73 | Keyboard input: move left/right, fire |

### Event 1000 - Ship Hit

Plays a short flash animation (`anim [0 1 0 1 0]`).

- If `ov00 != 1` (still has lives): spawns a `deth` effect (`1 1 604`) at the ship's position, decrements `ov00` on the owner, and notifies the counter panel (`1 1 605`) via message 1004 to decrement the lives display, then `slow`s.
- If `ov00 == 1` (final life):
  1. Spawns 5 `2 1 610` debris particles at (7321, 133) with randomised horizontal velocities and gravity, each with an 8000-tick lifetime.
  2. Stops all remaining fairies (sets `velx 0` and clears timer).
  3. Freezes all other player ships (`velx 0`, pose 1).
  4. Targets the counter panel (`1 1 605`) and clears its `ov99` flag to mark the egg over.

### Event 73 - Key Down

Reads the key code from `_p1_`:
- Key 37 (left arrow): `velx = -10`
- Key 39 (right arrow): `velx = 10`
- Key 32 (space): if fewer than 4 bullets (`totl 1 1 602 le 3`), spawn a new `1 1 602` bullet at the ship's position with `vely = -20`.

If the counter panel still exists but `ov99 == 0` (game is in final-death freeze), input is ignored.

---

## Agent 1 1 602: Bone (Bullet)

The player's projectile. Uses `bone` sprite (frame 12, 0 frames) on plane 100 with attribute 64.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Collision detection with fairies |
| Collision | 6 | Destroy the bullet |

### Event 9 - Timer

Enumerates all fairies touching the bullet:
- If one is hit, kills that fairy and sets a flag (`va00 = 1`).
- If the flag is set, notifies the counter panel (`1 1 605`) via message 1005 (increment score) and destroys the bullet after a brief wait.

### Event 6 - Collision

Any physical collision with a wall destroys the bullet immediately.

---

## Agent 1 1 603: Fairy Dropping

A small falling particle dropped by descending fairies. Uses `sidebar` sprite (frame 20, 3 frames) on plane 100 with attributes 192 (Invisible to creatures + Camera shy), elasticity 0, and gravity 0.5. It is animated with `[0 1 2 255]`.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Collision with player ship - hits the ship |

### Event 9 - Timer

Enumerates any player ship (`1 1 601`) touching the dropping and sends message 1000 to it (player-hit), then waits 1 tick and destroys itself.

---

## Agent 1 1 604: Death Effect

A brief visual effect used when the player ship is hit. Uses the `deth` sprite (frame 5, 22 frames) on plane 300.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Destroy self after the tick timer fires (30 ticks) |

---

## Agent 2 1 610: Debris Particle

One of five debris particles created in the player-ship final-death sequence. Uses `sidebar` sprite (frame 26, 1 frame) on plane 8000 with attributes 192 (Invisible to creatures + Camera shy). Each particle has a random gravity (1-3) and a random horizontal velocity (-10 to 10), with a lifetime of 100 ticks.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Destroy self |

---

## Additional Script Definitions

This script exits the script pool by explicitly killing all its created agents (`rscr` block, lines 416-446) and by removing a subset of the installed event scripts with `scrx`. This ensures clean re-installation if the bootstrap script is reloaded.

### Impact on Stimulus / Room CA

None. The toolbar and easter-egg agents do not emit stimuli and do not alter room CA values.
