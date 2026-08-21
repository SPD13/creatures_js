# medical scanner.cos - Medical Scanner Station

**Source**: `Assets/Bootstrap/001 World/medical scanner.cos`

## Overview

This script installs a single standalone **Medical Scanner** station in the world at position `(1240, 500)`. The scanner is a compound agent with five parts that monitor nearby creatures' health and display the result on two visual gauges (a numeric/pose indicator and two animated status lights). When activated it locks onto creatures around it (via an `etch 4 0 0` creature enumeration) and reads their **ATP** (chemical 34) as an overall "health" metric; if any of a broad list of toxic/dangerous chemicals are present above threshold, the scanner plays a warning ping and flashes its alarm animation. The scanner also forwards its reading out of an output port (`"scan out"` / `"creature health"`) so other agents can wire into the health signal.

Interacting with the scanner (activate / hit / creature contact) emits small stimuli to the interacting agent: an "activation" stimulus on press, a "hit" stimulus when struck, and a "creature-contact" stimulus when a creature bumps into it.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 10 | Medical Scanner | `mediscan` | Wall-mounted creature health scanner with on/off button, numeric gauge and two warning lamps | [Detail](#medical-scanner-3-8-10) |

---

## Medical Scanner (3 8 10)

A compound agent built from five parts placed at `(1240, 500)` on plane `5000`:

| Part | Role | Sprite base / offset | Notes |
|---|---|---|---|
| 0 | Main body (`mediscan` pose 0) | `mediscan` frame 0 | Hosts the input/output ports |
| 1 | Numeric gauge (`pat: dull`) | frames 16..17 starting at (2,0) | Shows the current health reading as a pose index |
| 2 | Power button (`pat: butt`) | frames 16..17 at (2,1), click anim `[] 2000 0` | Sends message 2000 (toggle on/off) when pressed |
| 3 | Alert lamp A (`pat: dull`) | frames 18..26 at (44,9) | Animates while the reading is in an intermediate range |
| 4 | Alert lamp B (`pat: dull`) | frames 20..41 at (44,22) | Animates while the reading is in the high range |

### Properties & Initial State

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable + Mouseable + Activatable 1 + Physics + Suffers Collisions |
| `bhvr` | 41 | Creatures can Activate 1 (1), Activate 2 (8), Hit (32) |
| `accg` | 4 | Light gravity |
| `perm` | 60 | Moderate permeability |
| `elas` | 0 | No bounce |
| `fric` | 80 | High friction |
| `ov00` | 0 | On/off state (0 = off, 1 = on) |
| `ov01` | 0 | Reserved |
| `ov02` | 0 | Last external command value (set by event 1000) |
| `ov61` | 100 | Default particle/port signal strength |
| `ov90` / `ov91` | 0 | Display value / output-port value (scratch) |

### Ports

| Port | Direction | Sprite frame | Name | Description |
|---|---|---|---|---|
| 0 | Input (`inew`) | 45,37 | "scan in" / "activation value" | External trigger — incoming messages run event 1000 to toggle the scanner |
| 0 | Output (`onew`) | 42,49 | "scan out" / "creature health" | Broadcasts the current averaged health reading (`ov91`) |

The main body also runs `emit 18 0.2` — it continuously emits **CA 18 (Machinery smell)** at intensity 0.2 so creatures can locate it.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | User / creature turns the scanner on |
| 2 | Activate 2 | User / creature turns the scanner off |
| 3 | Hit | Reaction to being struck |
| 4 | Pickup (creature contact) | A creature (family 4) has touched the scanner |
| 9 | Timer | Scanning cycle — reads creature chemicals and drives the gauges |
| 1000 | Custom — Input port message | External port writes the activation command |
| 2000 | Custom — Toggle on/off | Internal state machine that switches the scanner between on and off |

#### Event 1 — Activate 1 (Turn On)

1. Plays the `"beep"` sound.
2. Sends **stimulus 90** (intensity 1) to the activator (`from`) — the "device activated" biochemical cue.
3. If the scanner is currently off (`ov00 = 0`), sends message 2000 to itself to start the scanning cycle.

#### Event 2 — Activate 2 (Turn Off)

If the scanner is currently on (`ov00 = 1`), sends message 2000 to itself to stop the scanning cycle. No sound or stimulus is emitted on deactivation.

#### Event 3 — Hit

1. Plays a random `"hit_"` impact sound.
2. Bounces upward with a small randomised vertical velocity (`velo 0 rand -5 -10`).
3. Spawns a `bang` particle at a random offset (60–100).
4. Sends **stimulus 92** (intensity 1) to the striker (`from`) — the "device hit" cue.

#### Event 4 — Creature Contact (Pickup script reused for collision)

When the creature-contact event fires, targets `from`; if `from`'s family is 4 (a Creature), sends **stimulus 91** (intensity 1) to that creature. This gives creatures a small biochemical nudge whenever they physically bump into the scanner.

#### Event 9 — Timer (Scan Cycle)

This is the heart of the scanner. It runs whenever `ov00 = 1` (the toggle script sets `tick 10`). Execution is `inst`-wrapped so the whole pass is atomic.

1. Clear scratch (`va88 = 0`, `va89 = 0`).
2. Enumerate every creature-family agent near the scanner with `etch 4 0 0`:
   - Read the creature's **ATP** (`chem 34`) into `va00` — the "health score".
   - Mark `va88 = 1` (at least one creature scanned).
   - If any of the following chemicals are above their alarm threshold, mark `va89 = 1` (warning state):
     - `chem 66` (Heavy Metals) > 0.1
     - `chem 67` (Cyanide) > 0.1
     - `chem 68` (Belladonna) > 0.1
     - `chem 69` > 0.1
     - `chem 70` > 0.1
     - `chem 75` (Alcohol) > 0.1
     - `chem 78` > 0.1
     - `chem 82..89` > 0.15 (antigens / toxins band)
     - `chem 30` (Glucose) < 0.5 (starvation)
3. If at least one creature was read (`va88 = 1`):
   - Clamp the health value to a maximum of 0.6 (`va00 > 0.6 → 0.6`).
   - Compute the **display pose** for part 1: `ov90 = va00 * 23` (rounded via `ftoi`), and the **port output** `ov91 = va00 * 425`.
   - Drive **part 1** to pose `ov90` (numeric gauge).
   - If the warning flag was set (`va89 = 1`): play the `"epng"` warning sound and animate part 1 flashing — builds the animation string `"<ov90> 0 255"` via `vtos` + `adds`, then `anms`.
   - Read the final gauge pose back into `va66` and drive the two alert lamps:
     - **Part 3** (alert lamp A): `anim [1]` if `3 < va66 < 7`, `anim [0 1 255]` (blinking loop) if `va66 <= 3`, otherwise `anim [0]`.
     - **Part 4** (alert lamp B): `anim [1]` if `va66 > 10`, otherwise `anim [0]`.
   - Broadcast the reading out of output port 0: `prt: send 0 ov91` — downstream agents wired to the "creature health" output receive the scaled health value.
4. If no creature was in range (`va88 = 0`), reset parts 1, 3 and 4 to pose/anim `[0]` (idle).

Because the scan is re-armed every 10 ticks (see event 2000), the scanner polls the nearest creature(s) constantly while on and displays an instantaneous health/warning readout.

#### Event 1000 — Input Port Message

Invoked by an incoming port signal.

1. Plays `"beep"`.
2. Snaps part 0 to its default (`part 0`).
3. Records the incoming value in `ov02`.
4. Requests a state toggle: if the scanner is off (`ov00 = 0`) and the incoming value is non-zero, or if the scanner is on (`ov00 = 1`) and the incoming value is zero, sends message 2000 to itself to flip state. Otherwise the message is a no-op (already in the requested state).

#### Event 2000 — Toggle On/Off

The internal state machine that turns the scanner on or off.

**If currently off (`ov00 = 0`):**
1. Plays `"beep"`.
2. Sets `ov00 = 1`.
3. Starts the button click animation on part 2 (`anim [0 1 255]`).
4. Sets `tick 10` — starts the scanning timer loop.

**If currently on (`ov00 = 1`):**
1. Plays `"beep"`.
2. Resets all readout parts to their idle frame:
   - Part 1 → `anim [0]`
   - Part 2 → `anim [0]`
   - Part 3 → `anim [0]`
   - Part 4 → `anim [0]`
3. Sets `tick 0` — stops the scanning timer loop.
4. Sets `ov00 = 0`.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the scanner:

1. Enumerates and kills every agent with classifier `3 8 10`.
2. Removes event scripts 1 (Activate 1), 2 (Activate 2), 9 (Timer), 1000 (Input message), 2000 (Toggle) and 2001 (reserved, not installed by this file) for classifier `3 8 10`.

Event scripts 3 (Hit) and 4 (Creature contact) are intentionally left registered by the `rscr` list shown in the file.

---

## Stimulus Summary

| Stimulus # | Context | Target | Intensity | Meaning |
|---|---|---|---|---|
| 90 | Event 1 — scanner activated | Activator (`from`) | 1 | Generic "device activated" biochemical cue |
| 91 | Event 4 — creature bumps into scanner | Contacting creature (`from`) | 1 | Device-touch cue (only if `fmly = 4`) |
| 92 | Event 3 — scanner hit | Striker (`from`) | 1 | Generic "device hit" biochemical cue |

## Chemicals Monitored by the Scan Cycle

| Chemical # | Threshold | Role in Warning |
|---|---|---|
| 30 (Glucose) | < 0.5 | Triggers warning on starvation |
| 34 (ATP) | — | Primary "health" value displayed on the gauge |
| 66 (Heavy Metals) | > 0.1 | Toxin warning |
| 67 (Cyanide) | > 0.1 | Toxin warning |
| 68 (Belladonna) | > 0.1 | Toxin warning |
| 69 | > 0.1 | Toxin warning |
| 70 | > 0.1 | Toxin warning |
| 75 (Alcohol) | > 0.1 | Toxin warning |
| 78 | > 0.1 | Toxin warning |
| 82..89 | > 0.15 | Antigen / toxin band — any one triggers warning |

## Room CA Emission

| CA Index | Name | Source | Amount |
|---|---|---|---|
| 18 | Machinery smell | Main body `emit 18 0.2` | 0.2 (continuous) |
