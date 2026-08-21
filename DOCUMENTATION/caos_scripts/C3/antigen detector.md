# antigen detector.cos - Antigen Detector

**Source**: `Assets/Bootstrap/001 World/antigen detector.cos`

## Overview

This script implements an antigen detector device (3 8 20) — a medical engineering gadget placed in the medical bay. When activated, it scans a nearby creature for antigen chemicals (chemicals 82-89) and displays the infection severity level on a visual indicator. It also outputs a proportional signal through its output port, allowing it to be connected to other machines (such as the anti-bacterial spray) for automated treatment chains.

The device operates as a toggle: pushing it or sending an input signal turns it on (starts scanning), and pushing again turns it off. While active, the timer periodically scans for touching creatures and checks their antigen levels.

## Script Analysis

### Installation Script (INUM)

Creates a **compound agent** (3 8 20) — an infection detection device placed in the medical bay at position (1903, 3877).

**Agent Setup**:
- **Sprite**: `infection detector` (main body frame 0, plus frames for antenna, button, and display parts)
- **Attributes** (`attr 199`): Carryable, mouse-clickable, activatable, wall-bound, camera-shy
- **Behaviors** (`bhvr 41`): Creatures can activate (push), hit, and use activate1
- **Physics**: Gravity 1.64, permeability 64, elasticity 20, friction 100

**Compound Parts**:
- **Part 1** — Scanning antenna: Dull overlay (`infection detector` frames 1-6, offset 5,0) — animates when scanning
- **Part 2** — Button: Interactive button (`infection detector` frames 12-13, offset 32,22) — click sends message 2000 to toggle the device
- **Part 3** — Infection display: Dull overlay (`infection detector` frames 14-18, offset 25,0) — shows infection severity level (5 poses: off, low, medium, high, and a 5th frame)

**Ports**:
- One input port (type 2001, "infection detector input") at position (10, 41) — receiving a signal turns the device on
- One output port ("infection detector output") at position (44, 41) — sends a signal proportional to detected infection severity

**Emission**: Emits CA 18 (machinery smell) at intensity 0.35
**OV61**: Set to 100 (machine state/charge)

### Event Scripts

#### Push Script (scrp 3 8 20 1) — Creature Activates Detector

When a creature pushes the detector:
1. **Stimulates the pusher** with stimulus 90 (machinery interaction)
2. **Sends message 2000** to itself, triggering the toggle script

#### Toggle Script (scrp 3 8 20 2000) — Turn On/Off

This script toggles the device between active and inactive states:

**If off (`ov00 = 0`) — Turn on**:
1. Plays "bep2" sound
2. Button (part 2) changes to pressed state (pose 1)
3. Antenna (part 1) plays scanning animation (frames 0-10, looping)
4. Sets `ov00 = 1` (active)
5. Starts timer at interval 10 (`tick 10`) — begins periodic scanning

**If on (`ov00 = 1`) — Turn off**:
1. Plays "bep2" sound
2. Button (part 2) returns to unpressed state (pose 0)
3. Antenna (part 1) resets to frame 0
4. Sets `ov00 = 0` (inactive)
5. Stops timer (`tick 0`) — no more scanning
6. Display (part 3) resets to off (pose 0)

#### Timer Script (scrp 3 8 20 9) — Scanning

Runs periodically while the device is active (every 10 ticks). Scans for a nearby creature and reads its antigen levels:

1. **Finds nearby creature**: Uses `etch 4 0 0` to enumerate creatures touching within range 4
2. **Scans antigens**: For the first creature found, iterates through chemicals 82-89 (the 8 antigen chemicals) and identifies the highest concentration (`va51`) and its chemical ID (`va52`)
3. **Displays infection severity** and sends output signal:

| Antigen Concentration | Display (Part 3) | Output Signal | Meaning |
|---|---|---|---|
| 0 | (unchanged) | 0 | No infection |
| > 0.01 and <= 0.25 | Pose 1 | 85 | Low infection |
| > 0.25 and <= 0.5 | Pose 2 | 170 | Medium infection |
| > 0.5 and <= 1.0 | Pose 3 | 255 | High infection |

4. **No creature nearby**: Display resets to pose 0 (off)

The scanning uses `inst`/`slow` to ensure the creature enumeration and chemical scanning happen atomically within a single tick.

#### Input Script (scrp 3 8 20 2001) — Port Signal Activation

When the detector receives a non-zero input signal via its input port and is currently off (`ov00 = 0`), it sends message 2000 to itself, turning the device on. This allows other connected machines to remotely activate the detector.

#### Collision Script (scrp 3 8 20 6)

Not explicitly defined in this script (no `scrp 3 8 20 6`). The device relies on standard physics behavior.

#### Hit Script (scrp 3 8 20 3)

When hit by a creature:
- Plays hit sound ("hit_")
- Gets knocked upward with random velocity (vx=0, vy=random -5 to -10)
- Sends a random bang signal (60-100) through output port
- Stimulates the hitter with stimulus 92 (hit machine)

#### Get/Pickup Script (scrp 3 8 20 4)

When picked up by a creature (family 4), stimulates the creature with stimulus 91 (pick up machine).

### Removal Script (RSCR)

Kills all antigen detector agents (3 8 20) and removes event scripts (1, 2000, 2001).

## Agents Created

| Agent | Family | Genus | Species | Description |
|-------|--------|-------|---------|-------------|
| Antigen Detector | 3 (Gadget) | 8 (Engineering) | 20 | Medical device that scans creatures for antigen chemicals and displays infection severity |

## Key CAOS Commands Used

| Command | Usage | Purpose |
|---------|-------|---------|
| `new: comp` | `new: comp 3 8 20 "infection detector" 1 0 5001` | Creates compound agent with sprite plane 5001 |
| `pat: dull` | Parts 1 and 3 | Adds non-interactive overlay parts (antenna and display) |
| `pat: butt` | `pat: butt 2 "infection detector" 12 2 32 22 0 [] 2000 0` | Adds clickable button that sends message 2000 |
| `prt: inew` | Input port creation | Allows signal-based activation from other machines |
| `prt: onew` | Output port creation | Sends infection severity signal to connected machines |
| `prt: send` | `prt: send 0 85/170/255` | Sends proportional output signal based on infection level |
| `prt: bang` | `prt: bang rand 60 100` | Sends random bang signal when hit |
| `etch` | `etch 4 0 0` | Enumerates creatures touching the detector within range 4 |
| `chem` | `chem va50` | Reads antigen chemical concentration from a creature |
| `stim writ` | Various stimulus signals | Sends neural stimuli to creatures for learning |
| `emit` | `emit 18 .35` | Emits CA 18 (machinery smell) so creatures can find it |
| `inst`/`slow` | Wraps scanning loop | Ensures atomic scanning of creature chemicals |

## Dependencies

- **Sprite**: `infection detector.c16` — device graphics (body, antenna animation, button states, infection display levels)
- **Sounds**: `bep2` (toggle beep), `hit_` (impact)
- **Machine port system**: Uses CAOS port system for input/output connections to other engineering gadgets
- **Chemical system**: Reads chemicals 82-89 (the 8 antigen chemicals in Creatures 3 biochemistry)
- **Anti-bacterial spray** (`anti-bacterial spray.cos`): The detector's output can be connected to the spray for automated infection treatment

## Notes

- The device has a **toggle activation model**: pushing it (or receiving an input signal) toggles between active scanning and inactive states
- The push script does not directly perform scanning — it sends message 2000 to itself, which handles the toggle logic. This ensures consistent behavior whether activated by creature push or port signal
- Chemical scanning covers **chemicals 82-89**, which are the 8 antigen chemicals in the Creatures 3 biochemistry system. The detector finds the single highest-concentration antigen
- The output signal is **proportional** to infection severity (0/85/170/255), allowing downstream connected machines to respond differently to different infection levels
- The device is placed in the medical bay at (1903, 3877), near the anti-bacterial spray at (1983, 3877), facilitating a natural connection between detection and treatment
- The `inst`/`slow` block around the scanning ensures that the creature enumeration and all chemical reads happen in a single tick, preventing timing issues
- The input port only activates the device if it's currently **off** (`ov00 = 0`), preventing redundant activation. Turning off still requires a direct push
