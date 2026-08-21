# Norn Egg layer.cos - Norn Egg Layer Machine

**Source**: `Assets/Bootstrap/001 World/Norn Egg layer.cos`

## Overview

This script implements the Norn Egg Layer, the primary interface for selecting and dispensing Norn eggs into the Creatures 3 world. It consists of three agents working together: a control panel with buttons for cycling through available eggs and selecting gender, an egg dispensing machine that physically creates and places eggs, and an info bar that displays the name of the currently selected egg.

The system reads available eggs from installed PRAY resources of type `"EGGS"`. The player can cycle through them with a next button, choose male or female genetics, and press a hatch button to lay the selected egg into the world. The egg layer machine plays a dispensing animation, validates that the egg's PRAY data and dependencies are intact, then creates a Norn egg (3 4 1) with the appropriate genetics, physics, and chemical properties.

Laid eggs emit CA 11 (Norn home smell) at a rate of 0.65, have full physics (gravity, aerodynamics, friction, elasticity), and are set to auto-hatch after 900 ticks via a timer. The egg's gender is stored in `ov01` based on the player's selection.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 131 | Egg Info Bar | `infobar` | Text display showing the name of the currently selected egg | [Detail](#egg-info-bar-1-1-131) |
| 3 3 30 | Egg Layer Machine | `egglayer` | Dispenses eggs with animation, validates PRAY data, creates egg agents | [Detail](#egg-layer-machine-3-3-30) |
| 3 3 31 | Egg Layer Control Panel | `egglayer` | Button panel for cycling eggs, selecting gender, and triggering egg laying | [Detail](#egg-layer-control-panel-3-3-31) |
| 3 4 1 | Norn Egg | `eggs` | Created dynamically when an egg is laid; has physics, genetics, and auto-hatch timer | [Detail](#norn-egg-3-4-1) |

---

## Egg Info Bar (1 1 131)

A compound agent that displays the name of the currently selected PRAY egg resource. It uses a fixed background part and a text part to show the egg name in white text.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible to creatures |
| Position | (700, 820) | |
| Sprite | `infobar`, 1 image, plane 1 | Background frame |
| Part 0 | Fixed text, `infobar` sprite, 2 images at (22, 13) | Background |
| Part 1 | Text part, font `whiteontransparentchars`, format `2 2 0 0 0 0 2` | Displays egg name via `ptxt` |

### Behavior

The info bar has no scripts of its own. It is targeted by the control panel scripts (via `rtar 1 1 131`) which update its text (part 1) with the name of the currently selected egg using `ptxt`.

---

## Egg Layer Machine (3 3 30)

The egg layer machine is a compound agent that physically creates and dispenses Norn eggs when commanded by the control panel. It validates PRAY resource availability and dependencies before creating an egg, and plays an error animation with a buzzer sound if the egg data is invalid.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 28 | Activatable (4) + Greedy portal (8) + Invisible to creatures (16) |
| `clac` | 0 | Mouse click does not activate creatures |
| Position | (672, 845) | |
| Sprite | `egglayer`, 17 images, plane 0 | |
| Part 0 | Dull, `egglayer` sprite, 1 image at (19, 24), plane 5 | Machine body |
| Part 1 | Dull, pose 4 | Dispensing arm, initial retracted pose |
| Part 2 | Dull, `egglayer` sprite, 7 images at (23, 89), plane 1 | Egg display area |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov90` | Current egg PRAY resource name (copied from control panel during laying) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Internal message | Lay an egg (received from control panel via message 1001) |

#### Event 1000 — Lay Egg

Locked execution. Triggered by the control panel's hatch button. Parameter `_p1_` carries the gender (1 = male, 2 = female).

1. Part 1 animates `[4 3 2 1 0]` (dispensing arm extends).
2. Plays `"egg1"` sound.
3. Calculates egg spawn position: `posl + 10`, `post + 2`.
4. Generates a random sprite offset: `rand(0, 10) * 8` for egg visual variety.
5. Retrieves the selected egg name (`ov90`) from the control panel (3 3 31).
6. Refreshes PRAY resources and validates the egg exists:
   - **If egg not found**: plays `"buzz"`, animates error `[1 2 1 2 3 2 3 4 3 4]`, stops.
7. Loads PRAY dependencies (`pray deps ov90 1`):
   - **If dependency load fails**: plays `"buzz"`, animates error, stops.
8. Retrieves genetics file name (`ov91`) from the control panel.
9. **Creates the egg**: `new: simp 3 4 1 "eggs" 8 va60 4`.
10. Sets 6 pickup handle points (`puhl 0-5`) at various positions.
11. Sets `emit 11 0.65` (emits CA 11 — Norn home smell).
12. Loads genetics: `gene load targ 1 va99` (loads genome from PRAY genetics file).
13. Sets gender: `ov01 = _p1_` (1 = male, 2 = female).
14. Configures egg physics:
    - `elas 10` (low elasticity)
    - `fric 100` (high friction)
    - `attr 195` (Carryable + Mouseable + Suffer physics + Camera shy)
    - `bhvr 32` (creatures can push)
    - `aero 10` (aerodynamic drag)
    - `accg 4` (gravity)
    - `perm 60` (permeability)
15. Positions egg at spawn location.
16. Sets `tick 900` (auto-hatch timer).
17. Sets `ov61 = 100` (egg energy/health).
18. Targets self (machine), animates reset `[0 1 2 3 4]` (arm retracts).

---

## Egg Layer Control Panel (3 3 31)

A compound agent providing the user interface for the egg layer system. It contains five buttons and an egg glyph display area. The player cycles through available eggs, selects male or female genetics, and presses the hatch button to instruct the egg layer machine to dispense an egg.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible to creatures |
| Position | (736, 845) | |
| Sprite | `egglayer`, 10 images, first image 17, plane 0 | |
| Part 1 | Button at (112, 30), sends message 1000 | Next egg button |
| Part 2 | Button at (114, 54), sends message 1001 | Hatch/lay button |
| Part 3 | Button at (13, 83), sends message 1002 | Unused (no handler defined) |
| Part 4 | Button at (75, 53), sends message 1003 | Male gender toggle |
| Part 5 | Button at (76, 33), sends message 1004 | Female gender toggle |
| Part 6 | Dull part, egg glyph display | Shows preview of selected egg |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov00` | Selected gender: 1 = male (default), 2 = female |
| `ov90` | Currently selected egg PRAY resource name |
| `ov91` | Genetics file name for the selected egg |

### Initial Setup

During installation, the control panel:
1. Refreshes PRAY resources (`pray refr`).
2. Gets the first available egg: `pray next "EGGS" ""`.
3. If an egg is found, loads its glyph files (`"Egg Glyph File"` and optionally `"Egg Glyph File 2"` from PRAY).
4. Creates part 6 with the male egg gallery sprite and animation string.
5. Sets `ov91` to the egg's genetics file.
6. Updates the info bar (1 1 131) with the egg name.
7. If no eggs are available, sets part 6 to blank (`"blnk"`) and genetics to `"n*"`.
8. Defaults `ov00` to 1 (male).

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Button message | Cycle to the next available egg |
| 1001 | Button message | Lay the selected egg (send command to machine) |
| 1002 | Button message | No handler defined (unused button) |
| 1003 | Button message | Select male gender |
| 1004 | Button message | Select female gender |

#### Event 1000 — Next Egg

Locked execution. Cycles to the next egg in the PRAY `"EGGS"` list.

1. Plays `"sc_1"` sound.
2. Part 1 animates `[1 0 1 0 1 0]` (button blink).
3. Refreshes PRAY resources.
4. If no egg is currently selected, gets the first one.
5. Advances to next egg: `pray next "EGGS" ov90`.
6. If no more eggs (wraps to empty string), stops.
7. Updates the info bar (1 1 131) with the new egg name.
8. Based on current gender selection (`ov00`):
   - **Male (1)**: Loads `"Egg Glyph File"` from PRAY. If the glyph file fails to load, sets gallery to blank. Otherwise, sets part 6 to the male egg gallery with animation.
   - **Female (2)**: Loads `"Egg Glyph File 2"` from PRAY. If fails, sets to blank. Otherwise, sets part 6 to the female egg gallery with animation.
9. Updates `ov91` with the new egg's genetics file.
10. Slow, waits for part 1 animation to complete, then resets button animations.

#### Event 1001 — Hatch (Lay Egg)

Locked execution. Sends the lay command to the egg layer machine.

1. Plays `"beep"` sound.
2. Part 2 animates `[1 0 1 0 1 0]` (button blink).
3. Reads gender from `ov00`.
4. Finds the egg layer machine (`rtar 3 3 30`).
5. Sends message 1000 to the machine with `va00` (gender) as parameter 1.
6. Waits for part 2 animation to complete, then resets button animations.

#### Event 1003 — Select Male

Instant execution. Selects male gender and updates the egg glyph display.

1. Plays `"pl_1"` sound.
2. Sets part 4 pose to 1 (male button highlighted).
3. Sets part 5 pose to 0 (female button unhighlighted).
4. Sets `ov00 = 1` (male).
5. Refreshes PRAY resources.
6. If no egg is currently selected, selects the first available one and updates the info bar.
7. Updates part 6 to show the male egg glyph:
   - Attempts to load `"Egg Glyph File"`. If it fails, sets gallery to blank.
   - Otherwise, loads male egg gallery sprite with animation.

#### Event 1004 — Select Female

Instant execution. Selects female gender and updates the egg glyph display.

1. Plays `"pl_2"` sound.
2. Sets part 4 pose to 0 (male button unhighlighted).
3. Sets part 5 pose to 1 (female button highlighted).
4. Sets `ov00 = 2` (female).
5. Refreshes PRAY resources.
6. If no egg is currently selected, selects the first available one and updates the info bar.
7. Updates part 6 to show the female egg glyph:
   - Attempts to load `"Egg Glyph File 2"`. If it fails, sets gallery to blank.
   - Otherwise, loads female egg gallery sprite with animation.

---

## Norn Egg (3 4 1)

Created dynamically by the egg layer machine. Each egg is a simple agent with full physics, genetics loaded from PRAY data, and an auto-hatch timer. The egg's species and appearance vary based on the installed PRAY egg packs.

### Properties (at creation)

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Carryable (1) + Mouseable (2) + Suffer physics (64) + Camera shy (128) |
| `bhvr` | 32 | Creatures can push |
| `elas` | 10 | Low elasticity |
| `fric` | 100 | High friction |
| `aero` | 10 | Aerodynamic drag |
| `accg` | 4 | Gravity |
| `perm` | 60 | Permeability |
| `emit` | CA 11, rate 0.65 | Emits Norn home smell |
| `tick` | 900 | Auto-hatch timer |
| Sprite | `eggs`, 8 images, random first image, plane 4 | Visual variety via random offset |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov01` | Gender: 1 = male, 2 = female (set from `_p1_` parameter) |
| `ov61` | Egg energy/health, initialized to 100 |

### Pickup Handles

Six pickup points are defined (`puhl 0-5`) at varying positions (15, 10-45) for creature and hand interaction.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6 | Collision | Adjust plane when dropped |

#### Event 6 — Collision

When the egg collides and is not being carried (`carr eq null`), its plane is set to 5000, bringing it to the front of the display.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the egg layer system:

1. Kills all Egg Layer Machine instances (`enum 3 3 30 -> kill targ`).
2. Kills all Egg Layer Control Panel instances (`enum 3 3 31 -> kill targ`).
3. Kills all Egg Info Bar instances (`enum 1 1 131 -> kill targ`).
4. Removes the egg collision script (`scrx 3 4 1 6`).

Note: Existing eggs (3 4 1) are **not** killed by the removal script and will persist in the world.

## Sound Effects

| Sound ID | Context | Description |
|---|---|---|
| `"sc_1"` | Event 1000 (next egg) | Button click / scroll sound |
| `"beep"` | Event 1001 (hatch) | Hatch button confirmation beep |
| `"pl_1"` | Event 1003 (male) | Male toggle click |
| `"pl_2"` | Event 1004 (female) | Female toggle click |
| `"egg1"` | Event 1000 on machine | Egg dispensing sound |
| `"buzz"` | Event 1000 on machine | Error buzzer (invalid egg data or missing dependencies) |

## PRAY Resource Integration

The egg layer system relies on PRAY resources of type `"EGGS"` for its functionality. Each egg resource provides:

| PRAY Tag | Purpose |
|---|---|
| `"Egg Glyph File"` | Male egg preview sprite file |
| `"Egg Glyph File 2"` | Female egg preview sprite file |
| `"Egg Gallery male"` | Male egg gallery sprite name |
| `"Egg Gallery female"` | Female egg gallery sprite name |
| `"Egg Animation String"` | Animation string for egg preview |
| `"Genetics File"` | Genome file name for the egg |
