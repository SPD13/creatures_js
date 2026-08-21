# Genetic splicer panel2.cos - Genetic Splicer Panel

**Source**: `Assets/Bootstrap/001 World/Genetic splicer panel2.cos`

## Overview

This script implements the Genetic Splicer Panel, the primary UI for crossbreeding two creatures in Creatures 3. The panel is positioned in the Engineering section of the Ark and works in conjunction with the Gene Pods (3 3 32, defined in `gene pod.cos`) which hold the parent creatures.

The splicing workflow is:
1. The player activates the panel, which opens with an animation and creates interactive button parts.
2. The player selects the desired offspring gender (male or female) using toggle buttons.
3. The Gene Pods detect when creatures are dropped into them and notify the panel via message 1010, registering each parent.
4. Once both parent slots are filled, the player presses the Splice button (part 11). If sufficient bioenergy is available (checked via the infobar agent 1 1 91 with `ov00 = 4`), genetic crossover is performed.
5. A new creature is created from the crossed genome with the selected gender, placed near the splicer, and the `born` command is issued.
6. After splicing, the Gene Pods are signaled to release their creatures and reset.

The panel communicates with three external agent types: the Gene Pods (3 3 32) for creature holding, the Infobar/Efficiency Indicator (1 1 91, `ov00 = 4`) for bioenergy status display, and the player's pointer agent for genome storage during crossover.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 18 | Genetic Splicer Panel | `gene splicer panel` | Compound agent providing the splicing UI with gender selection, splice/close/refresh buttons, and creature status indicators | [Detail](#genetic-splicer-panel-3-3-18) |

---

## Genetic Splicer Panel (3 3 18)

The Genetic Splicer Panel is a compound agent that provides the complete user interface for genetic crossover. It features gender selection toggles, creature status indicators, a splice initiation button, a close button, and a pod refresh button. The panel coordinates with Gene Pods to receive creature references and performs the actual genetic crossover operation.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Activatable by hand |
| Sprite | `gene splicer panel` frame 37, plane 20 | Main panel graphic |
| Position | (5100, 3650) | Engineering section |

### Parts

| Part | Type | Sprite | Position (relative) | Purpose |
|---|---|---|---|---|
| 0 | Body | `gene splicer panel` frame 37 | Origin | Main panel body with open/close animation |
| 1 | Button | `gene splicer panel` frames 17-18 | (224, 138) | Unused button — message 1000 |
| 2 | Button | `gene splicer panel` frames 19-20 | (178, 137) | Unused button — message 1001 |
| 3 | Button | `gene splicer panel` frames 21-22 | (137, 135) | Unused button — message 1002 |
| 4 | Button | `gene splicer panel` frames 23-24 | (102, 135) | Gender toggle: Female (ov01=2) — message 1003 |
| 5 | Button | `gene splicer panel` frames 25-26 | (70, 133) | Gender toggle: Male (ov01=1) — message 1004 |
| 6 | Dull | `gene splicer panel` frame 27 | (55, 171) | Creature 2 status indicator (parent B loaded) |
| 7 | Dull | `gene splicer panel` frame 29 | (108, 171) | Creature 1 status indicator (parent A loaded) |
| 8 | Dull | `gene splicer panel` frame 31 | (122, 224) | Splice status display |
| 9 | Dull | `gene splicer panel` frame 33 | (89, 224) | Splice status display |
| 10 | Dull | `gene splicer panel` frame 35 | (55, 224) | Splice status display |
| 11 | Button | `gene splicer panel` frames 11-12 | (309, 230) | Splice/Go button — message 1005 |
| 12 | Button | `gene splicer panel` frames 13-14 | (38, 111) | Close panel button — message 1006 |
| 13 | Button | `gene splicer panel` frames 15-16 | (282, 272) | Refresh Gene Pods button — message 1007 |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov00` | Panel state: 0 = closed, 1 = open |
| `ov01` | Gender selection for offspring: 0 = none, 1 = male, 2 = female |
| `ov80` | Creature 1 (parent A) loaded flag: 0 = empty, 1 = loaded |
| `ov81` | Creature 2 (parent B) loaded flag: 0 = empty, 1 = loaded |
| `ov88` | Agent reference to parent creature A (from Gene Pod slot 1) |
| `ov89` | Agent reference to parent creature B (from Gene Pod slot 2) |
| `ov90` | Bioenergy level obtained from the infobar agent |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Open the panel and create UI buttons |
| 1003 | Button 4 (UI) | Select female gender for offspring |
| 1004 | Button 5 (UI) | Select male gender for offspring |
| 1005 | Button 11 (UI) | Initiate splice operation |
| 1006 | Button 12 (UI) | Close panel |
| 1007 | Button 13 (UI) | Refresh Gene Pods |
| 1010 | Gene Pod notification | Receive creature reference from a Gene Pod |
| 1020 | Pre-splice | Trigger the main splice routine |
| 1040 | External open request | Auto-open panel if closed |
| 2000 | Main splice | Perform genetic crossover and create offspring |

#### Event 1 — Open Panel

Locked execution. Disables click activation (`clac -1`).

Sound: `"gs_o"` (splicer open).

1. Animates the panel body (part 0) opening: frames 0-10.
2. Waits for the opening animation to complete (`over`).
3. Creates all interactive button and display parts (parts 1-13).
4. Sets part 3 to pose 0 (initial state).
5. Parts 4 and 5 start with a blinking animation (`[1 0 1 0...]`) to draw attention to gender selection.
6. Part 11 (splice button) starts with a pulsing animation.
7. Part 12 (close button) starts with a blinking animation.
8. Part 13 (refresh button) starts with a cycling animation.
9. Sets `ov90 = 0`, `ov00 = 1` (panel now open).

#### Event 1003 — Select Female Gender

Instant execution. Sound: `"bp_1"` (button press).

1. Sets part 4 to pose 1 (selected/highlighted).
2. Sets part 5 to pose 0 (deselected).
3. Sets `ov01 = 2` (female offspring).

#### Event 1004 — Select Male Gender

Instant execution. Sound: `"bp_1"` (button press).

1. Sets part 5 to pose 1 (selected/highlighted).
2. Sets part 4 to pose 0 (deselected).
3. Sets `ov01 = 1` (male offspring).

#### Event 1005 — Splice Button

Locked execution. Animates the splice button (part 11) and several status display parts (6, 7, 8, 9, 10) with activity indicators.

Sound: `"bp_1"` (button press).

**Both parents loaded** (`ov80 = 1` AND `ov81 = 1`):
1. Unlocks and sends message 1020 to self, initiating the splice sequence.

**Parents missing** (one or both slots empty):
1. Sends message 1001 with `"Energy"` reading (param: 3) to any infobar agent (1 1 91) where `ov00 = 4`, requesting an energy status update.
2. Sends message 1001 to all Gene Pods (3 3 32) to signal them to refresh/release.

#### Event 1006 — Close Panel

Locked execution. Sound: `"bp_1"` (button press).

1. Animates close button (part 12).
2. Waits for animation to complete.
3. Resets all parts (3, 4, 5, 10, 11, 12) to pose 0.
4. Kills all button and display parts (parts 1-13).
5. Plays close sound `"gs_c"`.
6. Animates panel body closing: frames 10-0.
7. Waits for closing animation to complete.
8. Re-enables click activation (`clac 0`).
9. Sets `ov00 = 0` (panel closed).

#### Event 1007 — Refresh Gene Pods

Locked execution. Sound: `"bp_1"` (button press).

1. Animates the refresh button (part 13).
2. Sends message 1001 to all Gene Pods (3 3 32), signaling them to release creatures and reset.

#### Event 1010 — Receive Creature from Gene Pod

Locked execution. Only processes if the panel is open (`ov00 = 1`).

Receives two parameters from the Gene Pod:
- `_p1_`: Slot identifier (1 = Gene Pod slot 1/parent A, 2 = Gene Pod slot 2/parent B)
- `_p2_`: Agent reference to the creature

**Slot 1** (`_p1_ = 1`):
1. Sets `ov80 = 1` (parent A loaded).
2. Stores creature reference in `ov88`.
3. Animates part 7 (creature 1 indicator) to show loaded state.

**Slot 2** (`_p1_ = 2`):
1. Sets `ov81 = 1` (parent B loaded).
2. Stores creature reference in `ov89`.
3. Animates part 6 (creature 2 indicator) to show loaded state.

#### Event 1020 — Pre-Splice

Locked execution. Forwards to the main splice routine by sending message 2000 to self.

#### Event 1040 — External Open Request

Instant execution. If the panel is closed (`ov00 = 0`), sends message 0 (activate 1) to self, auto-opening the panel.

This is called by the Gene Pods when a creature is dropped into them, ensuring the panel opens automatically.

#### Event 2000 — Main Splice (Genetic Crossover)

Locked execution. This is the core splicing logic.

**Setup:**
1. Retrieves parent creature references from `ov88` and `ov89`.
2. Queries the bioenergy infobar (1 1 91, `ov00 = 4`) for the current energy level, stores in `ov90`.

**Null parent check** (`va88 = null` OR `va89 = null`):
1. Sends energy reset message (param: 0) to the infobar.
2. Sends message 1006 to self to close the panel.
3. Stops execution.

**Zero energy check** (`ov90 = 0`):
1. Sends energy reset message (param: 0) to the infobar.
2. Sends message 1007 to self to refresh Gene Pods.
3. Stops execution.

**Second null check** (safety): Stops if either parent reference became null.

**Successful splice:**

Sound: `"poyy"` (splice activation).

1. Waits 10 ticks for dramatic effect.
2. Performs genetic crossover:
   ```
   gene cros pntr 1 va88 0 va89 0 40 40 40 40
   ```
   Crosses the genomes of parent A (`va88`, slot 0) and parent B (`va89`, slot 0). The resulting genome is stored in the pointer agent (`pntr`) slot 1. Crossover parameters: 40% crossover probability, 40% mutation rate, 40% deletion rate, 40% duplication rate.

3. Signals all Gene Pods (3 3 32) with message 1002, instructing them to kill the parent creatures in the pods.
4. Clears parent references (`ov88 = null`, `ov89 = null`) and loaded flags (`ov80 = 0`).
5. Resets creature indicator displays (parts 6 and 7) to empty state.

6. Reads gender selection from `ov01`.
7. Creates a new creature:
   ```
   new: crea 4 pntr 1 va66 0
   ```
   Creates a Norn (family 4) from the crossed genome in pointer slot 1, with the selected gender (`va66` from `ov01`: 1=male, 2=female), at age 0 (baby).

8. Moves the newborn to position (5160, 3900), near the splicer area.
9. Applies standard creature physics and behavior attributes from game variables:
   - `accg` = `game "c3_creature_accg"` (gravity)
   - `bhvr` = `game "c3_creature_bhvr"` (creature behaviors)
   - `attr` = `game "c3_creature_attr"` (attributes)
   - `perm` = `game "c3_creature_perm"` (permeability)
10. Emits a chemical signal: chemical ID = 11 + creature genus (`gnus`), at intensity 0.5.
11. Issues the `born` command, formally registering the creature as alive in the world.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the Genetic Splicer Panel:

1. Kills all Genetic Splicer Panel instances (`enum 3 3 18 → kill targ`).
2. Removes all registered event scripts:
   - `scrx 3 3 18 1` (Activate 1)
   - `scrx 3 3 18 1003` (Female gender)
   - `scrx 3 3 18 1004` (Male gender)
   - `scrx 3 3 18 1005` (Splice)
   - `scrx 3 3 18 1006` (Close)
   - `scrx 3 3 18 1010` (Gene Pod notification)
   - `scrx 3 3 18 1020` (Pre-splice)
   - `scrx 3 3 18 1040` (External open)
   - `scrx 3 3 18 2000` (Main splice)

---

## External Agent Communication

| Target Agent | Classifier | Message | Purpose |
|---|---|---|---|
| Gene Pod | 3 3 32 | 1001 | Signal pods to release creatures and reset |
| Gene Pod | 3 3 32 | 1002 | Signal pods to kill contained creatures after splice |
| Infobar (Energy) | 1 1 91 (`ov00 = 4`) | 1001 | Request energy status display update |
| Self | 3 3 18 | 1006 | Close panel (internal) |
| Self | 3 3 18 | 1007 | Refresh pods (internal) |
| Self | 3 3 18 | 1020 | Initiate splice sequence (internal) |
| Self | 3 3 18 | 2000 | Execute genetic crossover (internal) |
| Self | 3 3 18 | 0 | Auto-open panel (internal, from event 1040) |

## Genetic Crossover Parameters

| Parameter | Value | Description |
|---|---|---|
| Crossover % | 40 | Probability of gene crossover between parents |
| Mutation % | 40 | Probability of random mutation in offspring genes |
| Deletion % | 40 | Probability of gene deletion in offspring |
| Duplication % | 40 | Probability of gene duplication in offspring |

## Creature Creation Attributes

The newborn creature receives standard attributes from game variables:

| Attribute | Game Variable | Purpose |
|---|---|---|
| `accg` | `c3_creature_accg` | Gravitational acceleration |
| `bhvr` | `c3_creature_bhvr` | Creature interaction behaviors |
| `attr` | `c3_creature_attr` | Agent attributes |
| `perm` | `c3_creature_perm` | Permeability for room boundaries |

## Chemical Emission

Upon birth, the newborn emits chemical signal ID `11 + gnus` (11 plus the creature's genus number) at intensity 0.5. This notifies nearby creatures and environmental systems of the new birth.
