# aquatic_population_monitoring_device.cos - Aquatic Population Monitoring Device

## Overview
- **File**: `aquatic_population_monitoring_device.cos`
- **Category**: Engineering Gadget / Marine Ecosystem
- **Purpose**: An engineering compound agent placed in the marine terrarium that monitors the population of a selected aquatic species and outputs a signal when the count drops below a configurable threshold. The device has three interactive buttons: an ON/OFF toggle, a species selector that cycles through nine aquatic species (fish, aquamites, sponges, and plants), and a population threshold selector that allows desired minimum counts from 1 to 25.

When active, the device periodically scans a 1000-pixel radius for individuals of the selected species (checking both adult and juvenile forms for fish). If the population is below the desired threshold, it sends the species code through its output port. This output is designed to be wired to an Aquatic Launcher (3 8 22), which interprets the species code and automatically spawns new organisms to maintain the desired population level. For aquamites, a special signal of 255 is sent instead of a species code, since aquamites are managed by the separate Aquamite Maker (3 8 21).

The device emits CA 18 (machinery smell) so creatures can detect and navigate to it.

## Created Agents

| Agent | Classifier | Description | Details |
|-------|------------|-------------|---------|
| Aquatic Population Monitoring Device | 3 8 16 | Engineering gadget that monitors aquatic species population levels | [Details](#aquatic-population-monitoring-device-3-8-16) |

---

## Aquatic Population Monitoring Device (3 8 16)

An engineering compound agent placed at position (4516, 2151) in the marine terrarium. It monitors the population of a user-selected aquatic species within a 1000-pixel radius and outputs a signal when the population drops below a configurable threshold. The device is designed to be wired to an Aquatic Launcher for automated population management.

### Agent Properties

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `aquatic_population_monitoring_device` | 16 frames initial, plane 5000 |
| Attributes | 198 | Carryable, mouse-clickable, activatable, physics-enabled |
| Behaviors | 41 | Activate1, activate2, hit |
| Permeability | 100 | Full wall permeability |
| Gravity | 4 | Light gravity |
| Air resistance | 10 | Moderate drag |
| Elasticity | 30 | Moderate bounce |
| Emit | CA 18 at 0.35 | Machinery smell |
| Tick | 0 (off) / 1 (when active) | Timer interval for population scanning |

### Compound Parts

| Part | Type | Sprite | Description |
|------|------|--------|-------------|
| 0 | Body | `aquatic_population_monitoring_device` (frame 0) | Main body with opening/closing animation |
| 1 | Button | `aquatic_population_monitoring_device` (frame 16) | ON/OFF toggle button, message 6464 |
| 2 | Button | `aquatic_population_monitoring_device` (frame 18) | Species selector button, message 6565 |
| 3 | Button | `aquatic_population_monitoring_device` (frame 29) | Population threshold selector button, message 6666 |

### Ports

| Port | Direction | ID | Description |
|------|-----------|-----|-------------|
| Input | In | 0 | "device will turn on if it hears 255, off if it hears 0" (signal type 9, position 52, event 6767) |
| Output | Out | 0 | "255 if selected species population is lower than wanted" (signal type 9, position 66) |

### Key Variables

| Variable | Initial | Description |
|----------|---------|-------------|
| ov01 | 0 | Device state (0=off, 1=on) |
| ov02 | 0 | Species selection enabled (0=disabled, 1=enabled when device is on) |
| ov03 | 0 | Threshold selection enabled (0=disabled, 1=enabled when device is on) |
| ov61 | 100 | Machine charge state |
| ov72 | 1 (off) / 2-10 (species) | Selected species code (also used as pose index for part 2) |
| ov73 | 1 | Desired minimum population threshold (cycles: 1,2,3,4,5,10,15,20,25) |
| ov80 | — | Whether to perform a secondary scan (1=yes for fish, 0=no for others) |
| ov81 | — | Primary scan genus |
| ov82 | — | Primary scan species |
| ov83 | — | Secondary scan genus (99=unused) |
| ov84 | — | Secondary scan species (99=unused) |

### Species Selection Map

When the species selector button is pressed, ov72 cycles through values 2-10 (wrapping back to 2 after 10). Each value configures which classifiers to scan:

| ov72 | Species Name | Primary Scan (2 g s) | Secondary Scan (2 g s) | Output Code |
|------|-------------|----------------------|------------------------|-------------|
| 2 | Wysteria Fish | 2 15 18 (juvenile) | 2 18 16 (adult) | 2 |
| 3 | Angel Fish | 2 15 14 (juvenile) | 2 18 14 (adult) | 3 |
| 4 | Neon Fish | 2 15 19 (juvenile) | 2 18 17 (adult) | 4 |
| 5 | Graspit | 2 15 16 (juvenile) | 2 18 18 (adult) | 5 |
| 6 | Clown Fish | 2 15 15 (juvenile) | 2 18 15 (adult) | 6 |
| 7 | Aquamites | 2 13 8 (aquamite) | none | 255 |
| 8 | Opal Sponge | 2 4 8 (juvenile) | none | 8 |
| 9 | Orange Sponge | 2 4 7 (juvenile) | none | 9 |
| 10 | Gumin Grass | 2 4 10 (juvenile) | none | 10 |

For fish species (ov72=2-6), both juvenile (genus 15) and adult (genus 18) forms are counted together. For sponges and grass (ov72=8-10), only the juvenile form (genus 4) is monitored. Aquamites (ov72=7) output the special code 255 instead of the species code, as they are not managed by the Aquatic Launcher.

### Population Threshold Values

The threshold button cycles ov73 through these values: 1 -> 2 -> 3 -> 4 -> 5 -> 10 -> 15 -> 20 -> 25 -> back to 1. Each pose of part 3 corresponds to a threshold value.

### Events

| Event | Script | Description |
|-------|--------|-------------|
| Activate1 | scrp 3 8 16 1 | Creature pushes — stimulates activator and triggers species selector |
| Hit | scrp 3 8 16 3 | Creature hits — knockback response |
| Pickup | scrp 3 8 16 4 | Creature picks up — stimulus to creature |
| Port Input | scrp 3 8 16 6767 | Remote activation via input port |
| ON/OFF Toggle | scrp 3 8 16 6464 | Button 1 — toggles device on/off |
| Species Select | scrp 3 8 16 6565 | Button 2 — cycles through monitored species |
| Threshold Select | scrp 3 8 16 6666 | Button 3 — cycles through population threshold values |
| Timer | scrp 3 8 16 9 | Population scan and output signal |

#### Activate1 (scrp 3 8 16 1) — Creature Push

When a creature activates the device:
1. Sends stimulus 90 (ACTIVATE_MACHINE) to the activating creature
2. Triggers message 6565 (species selector) on the device itself

**Stimulus impact**: Stimulus 90 to the activating creature

#### Hit (scrp 3 8 16 3) — Impact Response

When a creature hits the device:
- Plays "hit_" sound
- Knocked upward with random velocity (vy = random -5 to -10)
- Sends a random bang signal (60-100) through the output port
- Sends stimulus 92 (HIT_MACHINE) to the hitter

**Stimulus impact**: Stimulus 92 to the hitting creature

#### Pickup (scrp 3 8 16 4) — Creature Picks Up

When picked up by a creature (family 4):
- Sends stimulus 91 (GOT_MACHINE) to the picking creature

**Stimulus impact**: Stimulus 91 to the picking creature

#### Port Input (scrp 3 8 16 6767) — Remote Activation

Receives a signal via input port 0:
- If the signal value (`_p1_`) is greater than 0, sends message 6464 (ON/OFF toggle) to itself
- This allows external machines to turn the device on remotely by sending any positive value

#### ON/OFF Toggle (scrp 3 8 16 6464) — Button 1

Toggles the device between on and off states. Execution is locked to prevent interruption.

**Turning ON** (when ov01=0):
1. Sets part 1 (button) to pose 0 (pressed)
2. Plays "bep2" sound
3. Sets device state variables: ov01=1, ov02=1 (species select enabled), ov03=1 (threshold select enabled)
4. Sets ov72=2 (default to Wysteria Fish), ov73=1 (threshold of 1)
5. Plays opening animation on body part: fast animation [0-6], then slower animation [6-13] and waits for completion
6. Sets part 2 (species display) to pose 2 (Wysteria Fish)
7. Configures scanning classifiers for Wysteria Fish (ov81=15, ov82=18, ov83=18, ov84=16)
8. Sets part 3 (threshold display) to pose 1
9. Starts timer tick at interval 1

**Turning OFF** (when ov01=1):
1. Sets part 1 (button) to pose 1 (released)
2. Plays "bep2" sound
3. Plays closing animation on body [6-0]
4. Resets species and threshold displays to pose 0
5. Clears state variables: ov01=0, ov02=0, ov03=0
6. Sets ov72=2, ov73=1
7. Stops timer (tick 0)

#### Species Select (scrp 3 8 16 6565) — Button 2

Cycles through the nine monitored species. Execution is locked.

When device is on (ov02=1):
1. Plays "bep2" sound
2. Increments ov72 by 1 (wraps from 11 back to 2)
3. Updates part 2 pose to match ov72
4. Configures the scanning classifiers (ov80, ov81-84) based on the new species selection (see Species Selection Map above)

When device is off (ov02=0):
- Plays "excl" error sound (operation rejected)

#### Threshold Select (scrp 3 8 16 6666) — Button 3

Cycles through the population threshold values. Execution is locked.

When device is on (ov03=1):
- Plays "bep2" sound
- Cycles ov73 through: 1 -> 2 -> 3 -> 4 -> 5 -> 10 -> 15 -> 20 -> 25 -> back to 1
- Updates part 3 pose to match the cycle position (poses 1-9)

When device is off (ov03=0):
- Plays "excl" error sound (operation rejected)

#### Timer (scrp 3 8 16 9) — Population Scan

Runs periodically when the device is active (tick 1). Performs the population count and outputs a signal if needed:

1. Sets scan range to 1000 pixels
2. Counts all agents of family 2, genus ov81, species ov82 within range (primary scan)
3. If ov80=1 (fish species), also counts family 2, genus ov83, species ov84 (secondary scan for adult/juvenile form)
4. If total count is less than ov73 (desired threshold):
   - For aquamites (ov81=13, ov82=8): sends 255 through output port 0
   - For all other species: sends ov72 (species code) through output port 0

The output signal is designed to be received by an Aquatic Launcher (3 8 22), which interprets the species code and spawns the corresponding organism.

### Removal Script

The removal script (`rscr`) cleans up all instances of the monitoring device (3 8 16) and removes event scripts for events 1, 9, 6464, 6565, 6666, and 3.
