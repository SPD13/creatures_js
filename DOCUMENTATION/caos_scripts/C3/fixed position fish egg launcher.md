# fixed position fish egg launcher.cos - Aquatic Fish Egg Launcher Machine

**Source**: `Assets/Bootstrap/001 World/fixed position fish egg launcher.cos`

## Overview

This script creates a fixed-position fish egg launcher machine (3 3 67) in the marine/aquatic area of the Ark. The launcher is a compound agent that serves as the player's primary interface for populating the aquatic terrarium with fish. It allows the player to select a fish species, choose a quantity, and launch fish eggs into the water.

The machine has five selectable fish species (Wysteria, Angel Fish, Neon Fish, Graspit, and Clown Fish) and supports launching 1 to 5 eggs per activation. Each launch consumes Bioenergy from the global energy pool. A population cap of 75 per species (counting both eggs and adults) prevents overpopulation. The machine must be powered on before use, and a bioenergy gauge displays the current energy reserve.

The launcher is positioned at (4878, 2434) in the aquatic section and features animated power indicators, a species selector dial, a quantity selector dial, a launch button, and a bioenergy meter.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 67 | Fish Egg Launcher | `fish launcher things` | Compound machine for selecting and launching fish into the aquatic terrarium | [Detail](#fish-egg-launcher-3-3-67) |
| 2 18 16 | Wysteria Fish Egg | `wysts` | Wysteria fish egg launched into the water | [Detail](#launched-fish-eggs) |
| 2 18 14 | Angel Fish Egg | `angel` | Angel fish egg launched into the water | [Detail](#launched-fish-eggs) |
| 2 18 17 | Neon Fish Egg | `neon` | Neon fish egg launched into the water | [Detail](#launched-fish-eggs) |
| 2 18 21 | Graspit Egg | `graspit` | Graspit egg launched into the water | [Detail](#launched-fish-eggs) |
| 2 18 15 | Clown Fish Egg | `clown` | Clown fish egg launched into the water | [Detail](#launched-fish-eggs) |
| 43 93 48 | Overflow Indicator | `launcher` | Temporary invisible agent created when population cap is reached | [Detail](#overflow-indicator-43-93-48) |

---

## Fish Egg Launcher (3 3 67)

The fish egg launcher is a multi-part compound agent that provides a control panel for launching fish eggs into the aquatic terrarium. It must be powered on before use, and consumes Bioenergy from the global game variable for each fish launched.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 9 | Push + Hit |
| Position | (4878, 2434) | Aquatic area |
| `tick` | 1250 | Timer interval for bioenergy check |

### Compound Parts

| Part | Type | Sprite | Frames | Offset | Plane | Message | Purpose |
|---|---|---|---|---|---|---|---|
| 0 | (root) | `fish launcher things` frame 1 | — | — | — | — | Base compound agent |
| 1 | Button | `fish launcher things` frame 11 | 7 | (-35, -109) | — | 2000 | Species selector dial |
| 2 | Button | `fish launcher things` frame 0 | 6 | (23, -80) | — | 2001 | Quantity selector dial |
| 3 | Dull | `fish launcher things` frame 6 | — | (-56, -94) | — | — | Decorative element |
| 4 | Button | `fish launcher things` frame 9 | 2 | (-56, -107) | — | 1999 | Power toggle button |
| 5 | Button | `fish launcher things` frame 7 | 2 | (13, -20) | — | 2002 | Launch button |
| 6 | Dull | `fish launcher things` frame 19 | — | (-50, 58) | — | — | Launch tube animation |
| 7 | Dull | `fish launcher things` frame 29 | — | (-40, -118) | — | — | Power indicator left |
| 8 | Dull | `fish launcher things` frame 33 | — | (19, -85) | — | — | Power indicator right |
| 9 | Dull | `bioenergy` frame 0 | — | (6, -109) | 2 | — | Bioenergy gauge (poses 0-5) |

### Input/Output Ports

| Port | Direction | ID | Name | Offset |
|---|---|---|---|---|
| 0 | Input | 2003 | "fixed fish launcher input" | (-49, -88) |
| 0 | Output | — | "fixed fish launcher output" | (-49, -73) |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Power state | 0 = Off, 1 = On |
| `ov01` | Quantity selection | 1-5 (wraps from 5 back to 1) |
| `ov05` | Species selection | 2 = Wysteria, 3 = Angel, 4 = Neon, 5 = Graspit, 6 = Clown (wraps from 6 back to 2) |
| `ov71` | Bioenergy gauge level | 0-5 (visual indicator on part 9) |

### Species Selector Mapping

| `ov05` Value | Species | Egg Classifier | Adult/Alternate Classifier | Sprite | Population Cap Check |
|---|---|---|---|---|---|
| 2 | Wysteria Fish | 2 18 16 | 2 15 18 | `wysts` | totl(2 18 16) + totl(2 15 18) <= 75 |
| 3 | Angel Fish | 2 18 14 | 2 15 14 | `angel` | totl(2 18 14) + totl(2 15 14) <= 75 |
| 4 | Neon Fish | 2 18 17 | 2 15 19 | `neon` | totl(2 18 17) + totl(2 15 19) <= 75 |
| 5 | Graspit | 2 18 21 | 2 15 16 | `graspit` | totl(2 18 21) + totl(2 15 16) <= 75 |
| 6 | Clown Fish | 2 18 15 | 2 15 15 | `clown` | totl(2 18 15) + totl(2 15 15) <= 75 |

### Events

| Event | Type | Description |
|---|---|---|
| 9 | Timer | Bioenergy gauge update |
| 3 | Hit | Hit response with sound and stimulus |
| 1 | Push | Redirects to launch (message 2002) |
| 1999 | User message | Power toggle |
| 2000 | User message | Species selector cycle |
| 2001 | User message | Quantity selector cycle |
| 2002 | User message | Launch fish eggs |
| 2003 | User message (port) | Input port trigger |

### Event 9 — Timer (Bioenergy Gauge Update)

Runs every 1250 ticks. Reads the global `"Bioenergy"` game variable. If bioenergy >= 20 and the gauge is not full (`ov71 < 5`), increments the gauge level by 1 and updates the bioenergy display sprite (part 9) to match. This provides a visual representation of available energy.

### Event 3 — Hit

Plays the `"hit_"` sound effect. Applies a random physical force (60-100) via `prt: bang`. Sends stimulus 92 (machine hit) with intensity 1 to the creature that hit it.

### Event 1 — Push

When pushed by a creature (not the pointer/hand), redirects the push action to the launch button by sending message 2002 to itself. This allows creatures to trigger the launcher.

### Event 1999 — Power Toggle

Toggles the machine between on and off states:

**Turning On** (`ov00` = 0 → 1):
- Plays `"bep2"` sound
- Animates power indicators (parts 7 and 8) turning on
- Sets power toggle button (part 4) to "on" pose
- Activates the launch button animation (part 5)
- Sets species selector (part 1) and quantity selector (part 2) to their current values
- Updates `ov00` to 1

**Turning Off** (`ov00` = 1 → 0):
- Plays `"bep2"` sound
- Resets power toggle animation (part 4)
- Stops launch button animation (part 5)
- Resets selectors to pose 0 (off state)
- Animates power indicators (parts 7 and 8) turning off
- Updates `ov00` to 0

### Event 2000 — Species Selector Cycle

Only responds when the machine is powered on (`ov00` = 1). Plays `"bep2"` sound. Increments `ov05` (species selection) by 1. When it reaches 7, wraps back to 2. Updates the species dial display (part 1) to match. If the machine is off, plays `"excl"` (error buzz).

### Event 2001 — Quantity Selector Cycle

Only responds when the machine is powered on (`ov00` = 1). Plays `"bep2"` sound. Increments `ov01` (quantity selection) by 1. When it reaches 6, wraps back to 1. Updates the quantity dial display (part 2) to match. If the machine is off, plays `"excl"` (error buzz).

### Event 2002 — Launch Fish Eggs

The core launch logic. Only responds when powered on (`ov00` = 1). Repeats the launch process `ov01` times (quantity selected):

1. **Bioenergy check**: If `ov71 > 0`, decrements the bioenergy gauge and updates the display
2. **Launch tube animation**: Animates part 6 (launch tube) through frames 0-9
3. **Population cap check**: Counts existing agents of the selected species (both egg and adult classifiers). If total <= 75, creates the fish egg; otherwise creates an overflow indicator
4. **Fish egg creation**: Creates a new simple agent of the selected species with full aquatic physics properties
5. **Output signal**: Sends value 255 on output port 0 after each launch

If the machine is off, plays `"excl"` (error buzz) instead.

### Event 2003 — Input Port Handler

Receives input signals via the machine's input port. If the signal value (`_p1_`) is greater than 0 and the machine is powered on, triggers a launch by sending message 2002 to itself. This allows other machines to chain-trigger the launcher.

---

## Launched Fish Eggs

All five fish species are created with identical physics properties when launched. They appear at position (4856, 2507) — at the base of the launch tube — and are given a slight random horizontal velocity with an upward impulse.

### Shared Launch Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Physics + Collisions + Mouseclickable + Carryable + Pickup |
| `bhvr` | 32 or 48 | Wysteria: 32 (Pick up only); Others: 48 (Pick up + Eat) |
| `clac` | -1 | Default click action |
| `elas` | 50 (40 for Clown) | Elasticity/bounce |
| `accg` | 1 | Gravity |
| `aero` | 7 | Air resistance |
| `perm` | 75 | Permeability |
| `fric` | 99 | High friction |
| `tick` | 10 | Timer interval |
| `ov60` | 200 | Species-specific variable (likely lifespan/energy) |
| `ov61` | 30 | Species-specific variable |
| Initial velocity | x: rand(-1, 1), y: 10 | Slight random horizontal drift, upward launch |
| Launch position | (4856, 2507) | Base of the launch tube |

The fish eggs are created as new simple agents and inherit their full lifecycle behaviors from their respective species scripts (angel fish.cos, clown fish.cos, aquatic_launcher.cos, etc.).

---

## Overflow Indicator (43 93 48)

When the population cap (75) for a selected species is reached, the launcher creates a temporary invisible indicator agent instead of a fish egg.

| Property | Value | Notes |
|---|---|---|
| Classifier | 43 93 48 | Special overflow marker |
| Sprite | `launcher` frame 31 | — |
| `attr` | 0 | Invisible, no interactions |
| Plane | 5000 | High plane (above most agents) |
| Position | (4843, 2325) | Near the launcher display area |
| Lifespan | ~10 ticks | Created, then killed after a `wait 10` |

Plays `"excl"` (error buzz) sound when the cap is reached. The agent is purely a transient visual/logic element that self-destructs.

---

## Removal Script

The removal section (`rscr`) cleans up all instances of the fish egg launcher (3 3 67) and unregisters all associated event scripts (1999, 2000, 2001, 2002, 2003, 1, 3).
