# Norn seed launcher.cos - Creature & Critter Dispensing System

**Source**: `Assets/Bootstrap/001 World/Norn seed launcher.cos`

## Overview

This script implements the Norn seed launcher — an interactive dispensing machine that allows the player to spawn various critters, plants, and food items into the Creatures 3 world. The launcher is a compound agent with a UI panel that lets the user cycle through 18 different species and launch them into the environment, consuming Bioenergy in the process.

The launcher serves as the primary population seeding mechanism for the ecosystem. It both responds to manual player interaction (opening the panel, selecting a species, pressing launch) and operates automatically through its companion nozzle agent, which runs a periodic auto-replenishment timer. The timer checks population counts of key species and spawns replacements for any that have fallen below minimum thresholds — ensuring the ecosystem remains populated even without player intervention.

All launched creatures are ejected from position (2150, 750) with random velocities. Each species has an associated Bioenergy cost stored in `ov61`; manual launches deduct this cost from the global `game "Bioenergy"` variable, while auto-replenishment launches bypass the energy check. The launcher also communicates with the efficiency monitor system (1 1 91) to display energy status updates.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 71 | Norn Seed Launcher | `Norn seed launcher` | Compound agent — the main dispensing machine with UI panel | [Detail](#norn-seed-launcher-3-3-71) |
| 1 1 109 | Launcher Nozzle | `Launcher nozzle` | Visual nozzle/tube and auto-replenishment timer host | [Detail](#launcher-nozzle-1-1-109) |

---

## Norn Seed Launcher (3 3 71)

The main compound agent that provides the interactive UI for selecting and launching creatures. When activated, it opens a panel with species selection buttons and a launch button. It also hosts all the creature instantiation logic for all 18 launchable species.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `Norn seed launcher` | Compound agent |
| Position | (2107, 918) | |
| `attr` | 4 | Greedy (cannot be picked up) |
| `elas` | 0 | No bounce |
| `accg` | 0 | No gravity |
| `fric` | 100 | Maximum friction |
| `clac` | 0 | Click activation enabled |

### Ports

| Port | Direction | Name | Type | Notes |
|---|---|---|---|---|
| 0 | Input | "launcher in" | inject/close | Receives signals to trigger or close the launcher |
| 0 | Output | "launcher out" | throughput | Sends energy status updates |

### Compound Parts

| Part | Type | Sprite | Purpose | Notes |
|---|---|---|---|---|
| 0 | Base | `Norn seed launcher` | Main body of the launcher | Always present |
| 6 | Dull | `Norn seed launcher` frame 41 | Decorative idle animation | Present when closed; killed when open |
| 1 | Dull | `Norn seed launcher` frame 21 | Species display panel | Created when opened; pose shows selected species |
| 2 | Button | `Norn seed launcher` frame 15 | Previous species button | Sends message 2002 |
| 3 | Button | `Norn seed launcher` frame 15 | Next species button | Sends message 2003 |
| 4 | Button | `Norn seed launcher` frame 18 | Close/cancel button | Sends message 2004 |
| 5 | Button | `Norn seed launcher` frame 18 | Launch button | Sends message 2005 |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Open/closed state | 0=Closed, 1=Open |
| `ov01` | Selected species ID | 2–19 (wraps around) |

### Launchable Species

| ID (`ov01`) | Classifier | Sprite | Name | Bioenergy Cost (`ov61`) |
|---|---|---|---|---|
| 2 | 2 14 2 | `ant` | Ant | 41 |
| 3 | 2 14 1 | `bee` | Bee | 41 |
| 4 | 2 8 2 | `apple` | Apple | 25 |
| 5 | 2 13 2 | `caterpillar` | Caterpillar | 50 |
| 6 | 2 11 1 | `carr` | Carrot | 60 |
| 7 | 2 15 8 | `dragonfly` | Dragonfly | 50 |
| 8 | 2 3 4 | `grass` | Grass | — (no explicit ov61) |
| 9 | 2 18 10 | `grasshopper` | Grasshopper | 20 |
| 10 | 2 16 1 | `hawk` | Hawk | 80 |
| 11 | 2 15 5 | `hedgehog` | Hedgehog | 60 |
| 12 | 2 15 12 | `hoppity` | Hoppity | 85 |
| 13 | 2 15 3 | `hummingbird` | Hummingbird | 60 |
| 14 | 2 15 10 | `king` | Kingfisher | 70 |
| 15 | 2 15 1 | `robin` | Robin | 65 |
| 16 | 2 15 9 | `trout` | Trout | 60 |
| 17 | 2 15 11 | `woodpigeon` | Woodpigeon | 65 |
| 18 | 2 3 1 | `fxgl` | Ugly Fruit | 10 |
| 19 | 2 15 2 | `graz` | Grazer | 50 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Toggle open/close the launcher panel |
| 1000 | Port Input | Receives port signals to close or launch |
| 2002 | UI: Previous | Decrement species selection |
| 2003 | UI: Next | Increment species selection |
| 2004 | UI: Close | Close the launcher |
| 2005 | UI: Launch | Trigger the launch sequence |
| 2010 | Update Display | Update the species display panel |
| 2020 | Execute Launch | Create and launch the selected species |
| 2100 | Set Selection | Remotely set the selected species (used by auto-replenishment) |

#### Event 1 — Activate 1 (Toggle Panel)

Opens or closes the launcher UI.

**Opening (ov00 = 0 → 1):**
1. Sets `ov00` to 1 (open).
2. Kills decorative part 6.
3. Animates the nozzle agent (1 1 109) opening via `anim [0..10]`.
4. Disables click activation on the launcher body (`clac -1`).
5. Plays "inje" sound effect.
6. Notifies efficiency monitors (1 1 91) with `ov00 = 3`: sends message 1001 with `read "Efficiency" 7` (panel opened status).
7. Waits for nozzle animation to complete (`over`).
8. Creates UI parts: display (part 1), previous/next buttons (parts 2/3), close button (part 4), launch button (part 5).
9. Sets initial species selection to 2 (Ant) and triggers display update (message 2010).

**Closing (ov00 = 1 → 0):**
1. Animates nozzle closing (reverse animation `[10..0]`).
2. Sets `ov00` to 0 (closed).
3. Re-enables click activation (`clac 0`).
4. Kills all UI parts (1–5).
5. Plays "inje" sound effect.
6. Notifies efficiency monitors with `read "Efficiency" 8` (panel closed status).
7. Sends port bang to disconnect any port links (`prt: bang 100`).
8. Waits for animation, then recreates decorative part 6 with idle animation.

#### Event 1000 — Port Input

Handles signals received on port 0:
- If `_p1_` ≤ 0 and launcher is open: sends message 0 to self (closes the launcher via Activate 1 deactivate).
- If `_p1_` > 0 and launcher is open: sends message 2005 to self (triggers launch).

#### Event 2002 — Previous Species

Decrements `ov01` by 1, plays "beep" sound, animates button press on part 2, and triggers display update (message 2010).

#### Event 2003 — Next Species

Increments `ov01` by 1, plays "beep" sound, animates button press on part 3, and triggers display update (message 2010).

#### Event 2004 — Close

Plays "beep" sound, animates button press on part 4, and sends message 0 to self (closes the panel).

#### Event 2005 — Launch

Plays "beep" sound, animates button press on part 5, and sends message 2020 to self (execute launch).

#### Event 2010 — Update Display

Wraps the species selection: if `ov01` < 2, wraps to 19; if `ov01` > 19, wraps to 2. Then sets part 1's pose to `ov01` to display the corresponding species icon.

#### Event 2020 — Execute Launch

The core launch logic. Creates the selected species and ejects it from the launcher.

**Common pattern for all species:**
1. The `_p2_` parameter controls energy checking: `_p2_ = 0` for normal (costs energy), `_p2_ = 1` for free (auto-replenishment).
2. If `_p2_ = 1`, sets `va61` to -10, effectively bypassing the energy check.
3. Checks `tmvt 2150 750` to verify the target position is valid.
4. If placement is invalid or `game "Bioenergy" < va61`: kills the newly created agent (launch fails).
5. If successful: moves agent to (2150, 750), gives it a random launch velocity (`velx: -6 to 6`, `vely: -8 to -12` for most species), sets `va67 = 1` (success flag).
6. After creature creation: if `va67 = 1` and `_p2_ = 0`, deducts `va61` from `game "Bioenergy"` and sends energy status to efficiency monitors.
7. If launch failed (`va67 ≠ 1`) and `_p2_ = 0`: plays "buzz" error sound and sends empty energy message.
8. Animates the nozzle with launch sequence `[18 19]`.

Each species is configured with its own physics properties, animation frames, behavior variables, and attributes appropriate to its type (flying creatures get `accg 0`, ground creatures get higher gravity, etc.).

#### Event 2100 — Set Selection Remotely

Used by the auto-replenishment timer. If the launcher is open (`ov00 = 1`), sets `ov01` to `_p1_`, animates part 2 button press, plays "beep", and triggers display update.

---

## Launcher Nozzle (1 1 109)

A simple agent that serves as the visual nozzle/tube for the launcher and hosts the auto-replenishment timer. It periodically checks the world's critter populations and spawns replacements for species that have fallen below minimum thresholds.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `Launcher nozzle` | |
| Position | (2140, 780) | Near the launcher body |
| `attr` | 0 | No interaction |
| `tick` | 30000 | Timer interval (~16.7 minutes at 30 FPS) |
| `perm` | 1 | Fully permeable |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Auto-replenishment — checks populations and spawns replacements |
| 2000 | Open Animation | Plays nozzle opening animation |
| 2001 | Close Animation | Plays nozzle closing animation |
| 2002 | Launch Animation | Plays launch/ejection animation |

#### Event 9 — Timer (Auto-Replenishment)

The auto-replenishment timer runs every 30000 ticks. It checks if key species populations are below minimum thresholds and spawns replacements through the launcher.

**Pre-check:**
1. Targets the Norn seed launcher (3 3 71) and stores reference in `va99`.
2. If the launcher panel is open (`ov00 = 1`): stops execution (does not interfere with manual use).

**Population Census:**
Uses `enum` to count existing agents within range 1000 for each monitored species:

| Counter | Classifier Counted | Min Threshold | Launch Type | Species |
|---|---|---|---|---|
| `va03` | 2 14 1 | < 1 | 3 | Bee |
| `va05` | 2 13 2 | < 2 | 5 | Caterpillar |
| `va06` | 2 11 1 | < 2 | 6 | Carrot |
| `va07` | 2 15 8 | < 2 | 7 | Dragonfly |
| `va08` | 2 6 1 | < 2 | 8 | Grass (mature form) |
| `va09` | 2 13 6 | < 2 | 9 | Grasshopper (mature form) |
| `va11` | 2 15 5 | < 2 | 11 | Hedgehog |
| `va12` | 2 15 12 | < 2 | 12 | Hoppity |
| `va18` | 2 4 1 | < 2 | 18 | Ugly Fruit (mature form) |
| `va19` | 2 15 2 | < 2 | 19 | Grazer |

Note: Some species are counted by their mature/transformed classifier (e.g., grass 2 6 1 instead of 2 3 4, grasshopper 2 13 6 instead of 2 18 10) since the launched form may metamorphose during its lifecycle.

**Replenishment sequence:**
For each species below its minimum:
1. Sends message 2100 to the launcher with the species ID (sets the selection).
2. Waits 30 ticks.
3. Sends message 2020 with `_p2_ = 1` (free launch, no energy cost).
4. Waits 60 ticks between species.

**Launcher state management:**
- Before replenishment: if the launcher is closed (`ov00 = 0`), sends message 0 to open it.
- After replenishment: if the launcher is open (`ov00 = 1`), sends message 0 to close it.

#### Event 2000 — Open Animation

Plays the nozzle opening animation `[0 1 2 3 4 5 6 7 8 9 10]`.

#### Event 2001 — Close Animation

Plays the nozzle closing animation `[10 9 8 7 6 5 4 3 2 1 0]`.

#### Event 2002 — Launch Animation

Plays the launch ejection animation `[11 12 13 14 15 16 17 18 19]`.

---

## Bioenergy System Integration

The launcher is tightly integrated with the global Bioenergy economy:

| Aspect | Detail |
|---|---|
| Energy source | `game "Bioenergy"` global variable |
| Cost per launch | Varies by species (10–85 Bioenergy, see species table) |
| Free launches | Auto-replenishment uses `_p2_ = 1` to bypass energy cost |
| Failure condition | Launch fails if energy < cost or target position is invalid |
| Status reporting | Energy level sent to efficiency monitors (1 1 91) via message 1001 |
| Display format | Uses `read "Energy" 4` catalogue string + current energy value |

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 1 1 91 | Message 1001 (status display) | Efficiency monitors — receives energy status and panel open/close notifications |
| 1 1 109 | Animation control | Launcher nozzle — animated for open/close/launch sequences |
| 2 17 4 | Agent reference (`va99`) | Hawk perch — referenced when creating hawks (species 10) |
| 2 17 3 | Agent reference (`va19`) | Referenced when creating kingfishers (species 14) |

## Removal Script (rscr)

The removal script cleanly uninstalls the launcher system:

1. Kills all Norn seed launchers (`enum 3 3 71 → kill targ`).
2. Kills all launcher nozzles (`enum 1 1 109 → kill targ`).
