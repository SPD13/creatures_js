# Learning Machine

**Source file:** `Bootstrap/001 World/learning_machine.cos`

## Overview

The Learning Machine is an interactive teaching device located in the Learning Room of the Creatures 3 spaceship (Shee Ark). Its purpose is to teach creatures vocabulary words — both action words (verbs, specials, nouns) and feeling words (drives, qualifiers, nice drives). The machine provides two modes of operation: **Manual Tutoring**, where the player cycles through words one at a time, and **AutoTutor**, where the machine automatically advances through the entire word library, speaking each word aloud so nearby creatures can learn.

When a word is taught, the machine speaks it aloud (via `sezz`), displays it on screen, and orders a nearby creature to shout the word back (`ordr shou`). It also sends a message (126) to a creature to trigger the "perfect" learning stimulus, reinforcing the word in the creature's vocabulary brain lobes.

The word libraries are loaded from catalogue tags (`"learning machine actions"` and `"learning machine feelings"`) defined in `Scrolls of Learning.catalogue`. The actions library contains 31 entries covering verbs (look, push, pull, eat, hit...), specials (yes, no, like, dislike...), and nouns (hand, norn home, grendel home...). The feelings library contains 46 entries covering drives (hungry, tired, lonely, scared...), qualifiers (quite, very, extremely...), and nice drives (well, alert, awake, not lonely...).

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 1 80 | Learning Machine | Interactive vocabulary teaching device with manual and auto-tutor modes | [Details](#learning-machine-1-1-80) |

---

## Learning Machine (1 1 80)

Interactive compound agent that teaches creatures vocabulary words through speech and visual display. Located at position (8600, 450) in the Learning Room. Uses the `objects_of_learning` sprite set with 37 parts forming buttons, display icons, and text areas. The machine has a voice set to `"MachineVoice"`.

**Attributes:** 4 (activatable)

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Power state: 0 = off, 1 = on |
| `ov01` | Current word library: 0 = actions, 1 = feelings |
| `ov03` | Current scroll index into the word library |
| `ov06` | Catalogue key prefix for the current library (e.g. `"learning machine actions "`) |
| `ov23` | UI state tracker (reset on power toggle) |
| `ov55` | Idle interaction counter for hint display |
| `ov81` | AutoTutor mode: 0 = manual browsing, 1 = auto-tutor active |

### Compound Parts

| Part | Type | Function |
|---|---|---|
| 0 | Compound body | Main machine body |
| 1 | Dull | Display panel background (pose 22 = off screen, pose 0 = on screen) |
| 2 | Button | Actions library tab (Word Library One) |
| 3 | Button | Feelings library tab (Word Library Two) |
| 4 | Button | Scroll left |
| 5 | Button | Scroll right |
| 6 | Button | Power on/off (animated red flashing when idle) |
| 7 | Button | AutoTutor toggle (animated when active) |
| 8-11 | Dull | Left-side word icon slots (4 positions before center) |
| 12 | Dull | Center divider/highlight |
| 13-16 | Dull | Right-side word icon slots (4 positions after center) |
| 17 | Fixed text | Primary text display area (uses `heatherontransparentchars` font) |
| 18-21 | Dull | Left-side secondary icon row |
| 22-25 | Dull | Right-side secondary icon row |
| 26 | Dull | Display frame overlay |
| 27 | Dull | Background panel |
| 28-36 | Dull | Object/word illustration sprites (9 positions showing icons for visible words) |
| 37 | Fixed text | Word name display (uses `whiteontransparentchars` font) |

### Events

| Event | Number | Description |
|---|---|---|
| Button click (Power) | 5581 | Power on/off toggle |
| Button click (Actions tab) | 8677 | Switch to actions word library |
| Button click (Feelings tab) | 8864 | Switch to feelings word library |
| Button click (Scroll left) | 3571 | Scroll one word to the left |
| Button click (Scroll right) | 1157 | Scroll one word to the right |
| Button click (AutoTutor) | 8881 | Toggle AutoTutor mode on/off |
| Internal message (Update display) | 3030 | Refresh the icon carousel display |
| Internal message (Teach word) | 3031 | Speak and teach the currently selected word |
| Timer | 9 | Auto-advance in AutoTutor mode; show hints when idle in manual mode |

### Event Behaviors

#### Power On/Off (5581)

Toggles the machine between on and off states:
- **Turning on** (`ov00`: 0 → 1): Plays `"bep2"` sound, activates the display panel (part 1 pose 0), shows "Learning Machine Online" text, sets the power button to its active state, defaults to the actions library (`ov01 = 0`), and triggers a display update (message 3030).
- **Turning off** (`ov00`: 1 → 0): Plays `"bep2"` sound, hides the display panel (part 1 pose 22), clears text, resets all state variables (`ov03`, `ov23`, `ov81`), stops the AutoTutor animation, and resets the power button to its idle flashing animation.

#### Actions Tab (8677)

Switches to the actions word library when the machine is on:
- Sets `ov01 = 0` and `ov06 = "learning machine actions "`.
- Highlights the actions tab button (part 2 pose 1) and deactivates the feelings tab (part 3 pose 0).
- Displays "Word Library One" text and resets the scroll position to 0.
- If AutoTutor is active, shows "AutoTutor Active" text after a short delay.
- Triggers display update (message 3030).
- Plays `"excl"` sound if machine is off.

#### Feelings Tab (8864)

Switches to the feelings word library when the machine is on:
- Sets `ov01 = 1` and `ov06 = "learning machine feelings "`.
- Highlights the feelings tab button (part 3 pose 1) and deactivates the actions tab (part 2 pose 0).
- Displays "Word Library Two" text and resets the scroll position to 0.
- If AutoTutor is active, shows "AutoTutor Active" text after a short delay.
- Triggers display update (message 3030).
- Plays `"excl"` sound if machine is off.

#### Scroll Left (3571)

Scrolls one position to the left in the current word library when in manual mode:
- Decrements `ov03` by 1.
- Displays "Manual Tutoring" text and triggers display update (message 3030).
- If AutoTutor is active (`ov81 = 1`), plays `"excl"` sound and shows a warning sequence: "Cannot use Manual Tutoring.." → "..while AutoTutor is active." → "AutoTutor Active".
- Plays `"excl"` sound if machine is off.

#### Scroll Right (1157)

Scrolls one position to the right in the current word library when in manual mode:
- Increments `ov03` by 1.
- Displays "Manual Tutoring" text and triggers display update (message 3030).
- Same AutoTutor conflict warning as scroll left.
- Plays `"excl"` sound if machine is off.

#### AutoTutor Toggle (8881)

Toggles the AutoTutor automatic teaching mode:
- **Activating** (`ov81`: 0 → 1): Plays `"bep2"` sound, starts the AutoTutor button animation (part 7, cycling through 10 frames), displays "AutoTutor Active" text.
- **Deactivating** (`ov81`: 1 → 0): Plays `"bep2"` sound, displays "AutoTutor Deactivated" text, stops the button animation, then after a 40-tick wait shows "Awaiting User Input" text.
- Plays `"excl"` sound if machine is off.

#### Update Display (3030)

Refreshes the visual carousel of word icons. This is an internal message handler:
- Reads the total word count from the catalogue (`"learning machine [actions/feelings] count"`).
- Wraps `ov03` around if it goes below 0 or above the count.
- Iterates through 9 visible positions (parts 28-36), centered on the current index.
- For each position, reads the catalogue entry to get the sprite base pose and animation flag.
- Sets the appropriate sprite pose for each icon; animates icons that have animation enabled.
- After updating the display, sends message 3031 to trigger the teach action for the center word.

#### Teach Word (3031)

The core teaching action — speaks and teaches the currently selected word:
1. Reads the catalogue entry for the current word to determine category type and index:
   - Type 1 = verb → uses `"Creature Actions"` catalogue
   - Type 2 = special → uses `"Learnt Specials"` catalogue
   - Type 3 = drive → uses `"Creature Drives"` catalogue
   - Type 4 = qualifier → uses `"Learnt Qualifiers"` catalogue
   - Type 5 = nice drive → uses `"Learnt Nice Drives"` catalogue
   - Type 6 = noun → uses `"Agent Categories"` catalogue
2. Looks up the human-readable word from the corresponding catalogue.
3. Special case: if the word is noun category index 1, substitutes the hand name (`hand` command).
4. Displays the word name on part 37.
5. Targets a creature (`rtar 1 2 10`) and sends message 126 with the word text to trigger the learning stimulus.
6. Speaks the word aloud (`sezz`).
7. Waits 14 ticks, then orders the creature to shout the word (`ordr shou`), building a "perfect [category] [index] [word]" command string.

#### Timer (9)

Handles automatic behavior on a 35-tick interval:
- **AutoTutor active** (`ov81 = 1`): Increments `ov03` by 1 and triggers a display update, automatically advancing through the word library.
- **Manual mode, machine on** (`ov81 = 0, ov00 = 1`): Increments an idle counter (`ov55`). Every second tick, displays "Awaiting User Input" as a reminder hint.

### Removal Script

The removal section (`rscr`) kills all existing Learning Machine agents (`enum 1 1 80 / kill targ / next`) and removes all registered event scripts (`scrx`).
