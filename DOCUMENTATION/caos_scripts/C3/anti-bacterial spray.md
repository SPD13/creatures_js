# anti-bacterial spray.cos - Anti-Bacterial Spray

## Overview
- **File**: `anti-bacterial spray.cos`
- **Category**: Medical / Engineering Gadget
- **Purpose**: A medical device placed in the medical bay that sprays Prostaglandin (chemical 94) into nearby creatures to combat bacterial infections. It also directly kills bacteria agents attached to the sprayed creature.

## Script Analysis

### Installation Script (INUM)

Creates a **compound agent** (3 8 19) — an anti-infection spray device placed in the medical bay at position (1983, 3877).

**Agent Setup**:
- **Sprite**: `anti-infection spray` (10 frames for body, 7 frames for spray nozzle part)
- **Attributes** (`attr 199`): Carryable, mouse-clickable, activatable, wall-bound, camera-shy
- **Behaviors** (`bhvr 41`): Creatures can activate (push), hit, and use activate1
- **Physics**: Gravity 1.64, permeability 64, elasticity 20, friction 100
- **Compound Part**: Part 1 is a dull overlay ("anti-infection spray" frame 10) offset at (-38, 0) — the spray nozzle
- **Ports**: One input port (type 2001, "anti-infection spray input") and one output port ("anti-infection spray output") for connecting to other machines
- **Emission**: Emits CA 18 (machinery smell) at intensity 0.35
- **OV61**: Set to 100 (machine state/charge)

### Event Scripts

#### Push Script (scrp 3 8 19 1) — Creature Activates Spray
The primary activation method. When a creature pushes the spray:

1. **Stimulates the pusher** with stimulus 90 (machinery interaction)
2. **Plays spray animation** on the main body (frames 0-6) with sound "splt"
3. **Finds nearby creature**: Uses `ETCH 4 0 0` to find creatures touching within range 4, stores the last one found in `va16`
4. **Injects Prostaglandin**: Injects chemical 94 (Prostaglandin) at concentration 0.2 into each touching creature — Prostaglandin is the body's anti-bacterial defense chemical
5. **Plays spray effect**: Nozzle part animates (frames 1-6-0) at rate 3 with sound "spew", then main body plays drip animation (frames 7-8-9) and retract (frames 6-1-0)
6. **Sends output signal** 255 through output port 0
7. **Kills bacteria on sprayed creature**: Enumerates all bacteria agents (2 32 23), and if a bacterium's host (`ov00`) is a creature (`type ov00 = 7`) and that host matches the sprayed creature (`ov00 = va16`), the bacterium is killed

#### Input Script (scrp 3 8 19 2001) — Port Signal Activation
Triggered when the spray receives a non-zero input signal via its input port. Performs the exact same spray sequence as the push script, allowing the device to be activated by other connected machines.

#### Collision Script (scrp 3 8 19 6)
Plays a bounce sound ("dr10") when the spray collides with a wall.

#### Hit Script (scrp 3 8 19 3)
When hit by a creature:
- Plays hit sound ("hit_")
- Gets knocked upward with random velocity (vx=0, vy=random -5 to -10)
- Sends a random bang signal (60-100) through output port
- Stimulates the hitter with stimulus 92 (hit machine)

#### Get/Pickup Script (scrp 3 8 19 4)
When picked up by a creature (family 4), stimulates the creature with stimulus 91 (pick up machine).

### Removal Script (RSCR)

Kills all anti-bacterial spray agents (3 8 19) and removes all event scripts (2000, 2001, 3, 4, 6).

## Agents Created

| Agent | Family | Genus | Species | Description |
|-------|--------|-------|---------|-------------|
| Anti-Bacterial Spray | 3 (Gadget) | 8 (Engineering) | 19 | Medical spray device that injects Prostaglandin and kills bacteria on creatures |

## Key CAOS Commands Used

| Command | Usage | Purpose |
|---------|-------|---------|
| `new: comp` | `new: comp 3 8 19 "anti-infection spray" 10 0 5005` | Creates compound agent with sprite plane 5005 |
| `pat: dull` | `pat: dull 1 "anti-infection spray" 10 4 -38 0` | Adds spray nozzle as dull (non-interactive) part |
| `prt: inew` | Input port creation | Allows signal-based activation from other machines |
| `prt: onew` | Output port creation | Sends signal to connected machines after spraying |
| `prt: send` | `prt: send 0 255` | Sends output signal value 255 |
| `prt: bang` | `prt: bang rand 60 100` | Sends random bang signal when hit |
| `etch` | `etch 4 0 0` | Enumerates creatures touching the spray within range 4 |
| `chem` | `chem 94 .2` | Injects Prostaglandin (chemical 94) at 0.2 concentration |
| `stim writ` | Various stimulus signals | Sends neural stimuli to creatures for learning |
| `emit` | `emit 18 .35` | Emits CA 18 (machinery smell) so creatures can find it |
| `enum` | `enum 2 32 23` | Enumerates all bacteria agents to find ones to kill |

## Dependencies

- **Bacteria system** (`bacteria.cos`): The spray kills bacteria agents (2 32 23) that store their host creature in `ov00`
- **Sprite**: `anti-infection spray.c16` — spray device graphics
- **Sounds**: `splt` (spray start), `spew` (spray effect), `dr10` (bounce), `hit_` (impact)
- **Machine port system**: Uses CAOS port system for input/output connections to other engineering gadgets
- **Chemical system**: Relies on chemical 94 (Prostaglandin) being recognized by the creature biochemistry as an anti-bacterial agent

## Notes

- The spray has a **dual activation model**: it can be activated directly by a creature pushing it, or remotely via a port signal from a connected machine
- The push and input scripts are **nearly identical** — both perform the same spray-inject-kill sequence
- Chemical 94 (Prostaglandin) works through creature biochemistry to fight infections, while the direct bacteria killing provides an immediate mechanical effect
- The `type ov00 = 7` check ensures only bacteria attached to **creatures** (type 7) are targeted, not free-floating bacteria or those on objects
- The device is placed in the medical bay, consistent with other medical gadgets in the game
- The `LOCK` command at the start of push/input scripts prevents the creature from being interrupted during the spray sequence
