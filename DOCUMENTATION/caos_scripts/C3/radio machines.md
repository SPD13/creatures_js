# radio machines.cos - Radio Communication Devices

**Source**: `Assets/Bootstrap/001 World/radio machines.cos`

## Overview

This script installs four radio machines (classifier `3 8 5`) across the world at bootstrap, two in each pair of fixed locations. Radios are compound agents with a tuneable "station" display, an ON button, an OFF button, and a dull animation overlay. They are part of the Creatures 3 device/signal network: each radio has one input port and one output port, so radios can be wired into the Ron Agent machine system and used as signal relays.

When a radio receives a signal on its input port (or from an external source via message 1000), and the radio is switched ON, it:

1. Plays an activity animation on its dull part.
2. Forwards the signal to its own output port.
3. Broadcasts the signal to every other radio in the world that is tuned to the same "station" (`ov01`), using cross-radio message 1001. Tuned-in radios then emit the signal on their own output ports.

This gives the player a wireless signalling medium for device networks — a tuned radio effectively bridges two otherwise-disconnected wire graphs. Radios also constantly emit CA 18 (musical/social smell) at 0.2 strength, which attracts creatures.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 5 | Radio | `radio` frame 0 | Tuneable wireless signal relay; broadcasts to other radios on the same station | [Detail](#radio-3-8-5) |

---

## Radio (3 8 5)

The only agent created by this script. Four instances are spawned at bootstrap by a `reps 4` loop. A counter `va00` (1–4) is used to place the first two radios at a random x in 1575–1900 (y = 3283) and the last two at a random x in 2600–3100 (y = 213).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `radio` | Single base image (first image 0), plane 610 |
| Count | 4 | Spawned in a `reps 4` bootstrap loop |
| Positions (radios 1 & 2) | x = rand 1575–1900, y = 3283 | Via `mvto` |
| Positions (radios 3 & 4) | x = rand 2600–3100, y = 213 | Via `mvto` |
| `attr` | 195 | Carryable + Mouseable + Activatable 1 + Activatable 2 + Suffers Collisions |
| `bhvr` | 41 | Push / Pull / Hit allowed (creature interaction bitmask) |
| `elas` | 0 | No bounce |
| `accg` | 6 | Gravity (falls when dropped) |
| `perm` | 60 | Permeability for wall passage |
| CA emission | 18 at 0.2 | `emit 18 0.2` — attracts creatures (music/entertainment smell) |

### Key Variables

| Variable | Purpose | Typical Values |
|---|---|---|
| `ov00` | Power state | 0 = OFF, 1 = ON (initialised to 1 at bootstrap) |
| `ov01` | Current tuning / station index | 0–15 (initialised to 0) |
| `ov61` | CA emission strength marker | 100 |

### Compound Parts

| Part | Type | Sprite range | Relative pos | Message | Purpose |
|---|---|---|---|---|---|
| 1 | Button (`pat: butt`) | frames 8–23 (16 images) | (10, 18) | 1050 | Tuner / station display; each click cycles station (pose) 0→15→0 |
| 2 | Button (`pat: butt`) | frames 4–5 (2 images) | (3, 46) | 1051 | ON button (pose 0 unlit, pose 1 lit) |
| 3 | Button (`pat: butt`) | frames 6–7 (2 images) | (27, 46) | 1052 | OFF button (starts at pose 1 lit — radio starts ON) |
| 4 | Dull (`pat: dull`) | frame 8 (1 image) | (0, 0) | — | Animation overlay used for activity flashes |

### Ports

| Direction | ID | Name | Position | Trigger |
|---|---|---|---|---|
| Input | 0 | Radio Input | (43, 37) | Fires message 1000 on the radio when a signal arrives |
| Output | 0 | Radio Output | (41, 50) | Receives forwarded signals via `prt: send 0 va00` |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (push) | Knock sideways; give pusher stim 90 (generic positive interaction) |
| 3 | Deactivate / hit impact | Play `hit_` sound, emit spark particles, give hitter stim 92 |
| 4 | Hit (from creature) | If the initiator is a creature, give it stim 91 |
| 114 | (unused) | Empty stub — reserved slot |
| 1000 | Radio Input received | Forward signal to output port and broadcast to all radios on same station |
| 1001 | Cross-radio broadcast | Received from another radio on same station; forward signal to local output port |
| 1050 | Tuner button clicked (part 1) | Play `rad1` sound; cycle tuner pose 0→15→0 |
| 1051 | ON button clicked (part 2) | Power on: `ov00 = 1`, ON button lit, OFF button unlit |
| 1052 | OFF button clicked (part 3) | Power off: `ov00 = 0`, OFF button lit, ON button unlit |

#### Event 1 — Activate 1 (Push)

1. `velo 0 rand -5 -10` — applies a small upward knock with zero horizontal impulse (y velocity −5 to −10).
2. `stim writ from 90 1` — writes stimulus 90 (value 1) to the agent that pushed the radio.

#### Event 3 — Deactivate / Hit Impact

1. `sndc "hit_"` — plays a hit sound (cached).
2. `velo 0 rand -5 -10` — small knock upward.
3. `prt: bang rand 60 100` — emits a particle "bang" effect of random magnitude 60–100.
4. `stim writ from 92 1` — writes stimulus 92 to the hitter.

#### Event 4 — Creature Interaction

1. `targ from` — switches target to the initiator.
2. If the initiator's family is 4 (Creature): `stim writ targ 91 1` — gives that creature stimulus 91.

This acts as a catch-all for creatures interacting with the radio beyond push/hit.

#### Event 1050 — Tuner Click (Part 1)

Triggered when a creature or the player clicks the station-display button.

1. `snde "rad1"` — plays the "radio tune" sound effect.
2. If `ov01 < 15`: increment `ov01` by 1; otherwise reset to 0. This cycles the station through 16 values (0–15).
3. `part 1 / pose ov01` — updates the tuner display to show the new station.

Stations 0–15 are simple indices; any two radios sharing the same `ov01` value are "on the same frequency" and will relay signals to each other.

#### Event 1051 — ON Button (Part 2)

1. `ov00 = 1` — sets the radio to ON.
2. `part 2 / pose 1` — ON button appears lit.
3. `part 3 / pose 0` — OFF button appears unlit.

#### Event 1052 — OFF Button (Part 3)

1. `ov00 = 0` — sets the radio to OFF.
2. `part 3 / pose 1` — OFF button appears lit.
3. `part 2 / pose 0` — ON button appears unlit.

While OFF, events 1000 and 1001 become no-ops — the radio neither forwards nor re-broadcasts signals.

#### Event 1000 — Radio Input (Signal Received)

Triggered when a signal arrives on the input port (or by any external `mesg` with id 1000). `_p1_` is the incoming signal value.

Runs only when `ov00 = 1` (radio is ON):

1. `part 4 / anim [0 1 2 0 1 2 0 1 2 0]` — plays activity animation on the dull overlay (flashing "receiving" indicator).
2. `va00 = _p1_` — captures the signal value.
3. `va01 = ov01` — captures the local station.
4. Enumerates every radio in the world (`enum 3 8 5`): for each radio other than self whose `ov01` equals `va01`, sends message 1001 with `va00` as the parameter (`mesg wrt+ targ 1001 va00 0 0`).
5. `prt: send 0 va00` — emits `va00` on the local output port 0.

This turns the radio into a one-to-many wireless broadcast node: one input triggers output on every tuned-in radio.

#### Event 1001 — Cross-Radio Broadcast Received

Triggered by another radio's Event 1000 broadcast. `_p1_` is the relayed signal value.

Runs only when `ov00 = 1`:

1. `part 4 / anim [0 1 2 0 1 2 0 1 2 0]` — activity animation.
2. `va00 = _p1_`.
3. `prt: send 0 va00` — emits the relayed value on local output port 0.

Important: Event 1001 does **not** re-broadcast to other radios. This prevents infinite loops when three or more radios share a station — each broadcast is authoritative and one hop deep.

#### Event 114 — Unused

Empty script (`scrp 3 8 5 114 ... endm`). Likely a reserved slot for a future or cut feature (event 114 is the standard "alive, waiting for something" slot in some devices). No behaviour.

### Stimulus Impact

| Stimulus | Value | Target | Trigger |
|---|---|---|---|
| 90 | 1 | Pusher (from Event 1) | Generic push feedback |
| 91 | 1 | Creature initiator (Event 4) | Creature interaction feedback |
| 92 | 1 | Hitter (from Event 3) | Hit/impact feedback |

### Room CA Impact

The radio emits CA 18 at 0.2 strength via `emit 18 0.2` at creation. This is the "music / interest" smell that biases creature attention toward the radio's room. No modifications to room CA values are performed by events.

---

## Removal Script (rscr)

1. `enum 3 8 5 → kill targ` — destroys all radio instances in the world.
2. Removes scripts: `scrx 3 8 5 1000`, `scrx 3 8 5 1001`, `scrx 3 8 5 1050`, `scrx 3 8 5 1051`, `scrx 3 8 5 1052` — the custom message handlers.

Note: the standard event handlers (1, 3, 4, 114) are not explicitly removed by `scrx` — they will persist in the script table until the next full scriptorium clear. Event `9` (timer) is not defined by this script.

---

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 3 8 5 (other Radios) | Message 1001 broadcast | When input arrives and other radios share `ov01` station |
| 4 0 0 (Creatures) | Stimuli 90 / 91 / 92 via `stim writ from` | Push / interact / hit events generate creature feedback |
| Any agent | Output port 0 | Forwards signals to wired device on the output |
| Any agent | Input port 0 | Receives signals that fire Event 1000 |
