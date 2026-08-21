# siren.cos - Siren Alarm Device

**Source**: `Assets/Bootstrap/001 World/siren.cos`

## Overview

This script installs a single **siren** gadget in the Ark's wiring system at (1800, 700). The siren is a signal-driven alarm: when it receives a non-zero signal on its input port — either from a connected upstream gadget or from a creature/mouse clicking it — it plays a wind-up animation, emits the `"sirn"` sound, wakes every creature in range (`aslp 0`), loops through its siren animation, winds down, and finally re-emits the same signal value on its output port. Clicking the siren toggles its state (on → off via an internal turn-off message). The siren continuously emits CA 18 into its room, marking it as an alarm/alert zone.

Creatures interacting with the siren receive biochemical stimuli: stim 90 on activation, stim 91 (`GOT_MACHINE`) on pickup, and stim 92 (`HIT_MACHINE`) on hit.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 8 | Siren | `siren` frame 20 | Signal-activated alarm that wakes nearby creatures and forwards the signal through its output port | [Detail](#siren-3-8-8) |

---

## Siren (3 8 8)

A simple alarm agent with one input port and one output port. It is part of the Ark's port-wiring network and behaves like a signal repeater: any non-zero input signal fires the full alarm sequence and is then passed through unchanged on the output. A zero signal turns the siren off. Creatures can also click the siren to toggle it manually, hit it for a bounce + port-bang, or pick it up.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 3 8 8 "siren" 20 0 5000 | Simple agent, sprite `siren`, 20 frames, first image 0, plane 5000 |
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activate 1 (4) + Floatable (64) + Suffer Collisions (128) |
| `bhvr` | 41 | Activate 1 (1) + Hit (8) + Pick Up (32) |
| `perm` | 99 | High permeability |
| `clac` | 0 | Click maps to Activate 1 (toggled to 1 during the alarm sequence) |
| `elas` | 10 | Low bounce |
| `tick` | 0 | No timer (purely event driven) |
| `aero` | 5 | Light air resistance |
| `accg` | 4 | Low gravity |
| `emit` | CA 18 at 0.2 | Continuous emission into the room |
| Position | (1800, 700) | Upper Ark, near ceiling |
| `anim` | [0] | Initial idle frame |

### Ports

Defined with `prt: inew` / `prt: onew`:

| Direction | Index | Name | Sprite | First Image | Relative Position | Input Msg ID | Purpose |
|---|---|---|---|---|---|---|---|
| Input | 0 | "siren in" | `siren` | 24 | (36, —) | 1000 | Receives signal; fires event 1000 |
| Output | 0 | "siren out" | `siren` | 10 | (36, —) | — | Re-emits received signal after alarm sequence |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | Active flag — 1 while alarm is sounding, 0 when idle |
| `ov61` | 100 | CA smell emission intensity |
| `ov70` | — | Last input signal value (stored from `_p1_`) |
| `ov71` | — | Absolute value of `ov70` — used to test "signal vs no signal" |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Click / activate — sends stim 90 and toggles the siren on (signal 255) or off |
| 2 | Activate 2 | Click / deactivate equivalent — toggles on/off, no stim |
| 3 | Hit | Creature hits the siren — bounce, random port bang, stim 92 |
| 4 | Pickup | Creature picks up the siren — stim 91 to creature (family 4 only) |
| 1000 | Input Port Signal | Incoming wire signal — runs the full alarm sequence or turns off on 0 |
| 2000 | Internal Turn-Off Message | Winds down the alarm and resets state, emits 0 on the output port |

---

#### Event 1 — Activate 1

Triggered when the siren is clicked / activated (by a creature or the mouse):
1. Sends **stim 90** with intensity 1 to the activator (`from`) — biochemical feedback for activating the alarm.
2. Toggles state:
   - If `ov00 = 0` (idle) → sends message **1000** to self with `_p1_ = 255` (alarm on).
   - Else (already active) → sends message **2000** to self (alarm off).

#### Event 2 — Activate 2

Same toggle logic as event 1 but without the stimulus:
- If `ov00 = 0` → self-message **1000** with `_p1_ = 255`.
- Else → self-message **2000**.

#### Event 3 — Hit

Triggered when a creature hits the siren:
1. Plays the `"hit_"` sound effect.
2. Applies a random upward velocity (`velo 0, rand -5 to -10`) — the siren bounces.
3. Sends a random port-bang value (`prt: bang rand 60 100`) — produces a random signal burst through connected ports.
4. Sends **stim 92** (`HIT_MACHINE`) with intensity 1 to the hitting creature (`from`).

#### Event 4 — Pickup

Triggered when a creature picks up the siren:
1. Targets the pickup agent (`targ from`).
2. If the picker is family 4 (a Creature) → sends **stim 91** (`GOT_MACHINE`) with intensity 1.

#### Event 1000 — Input Port Signal (Alarm Sequence)

Fired when a signal arrives on input port 0 (either from a connected upstream gadget or from the self-message generated by clicks).

1. Stores the incoming value: `ov70 = _p1_`, `ov71 = |ov70|`.
2. **If `ov71 ≠ 0` (non-zero signal — alarm on):**
   - If `ov00 = 0` (not already sounding): set `ov00 = 1`, play wind-up animation `[0 1 2]`, wait for animation (`over`).
   - Play the `"sirn"` sound (`snde "sirn"`).
   - Enumerate all creatures in range (`esee 4 0 0`) and wake each one (`aslp 0`).
   - Return targeting to self (`targ ownr`).
   - Play the main siren loop animation `[3 4 5 6 7 8 9 10 11 12 13 14 15]` (13 frames), wait (`over`).
   - Play the wind-down animation `[16 17 0]`, wait (`over`).
   - Set `clac 1` (clicks now map to Activate 2).
   - Reset `ov00 = 0`.
   - Forward the original signal value through output port 0 (`prt: send 0 ov70`).
3. **If `ov71 = 0` (zero signal — explicit off):**
   - Sends message **2000** to self to run the turn-off sequence.

#### Event 2000 — Internal Turn-Off

Cleanly stops the siren:
1. Plays wind-down animation `[16 17 0]`, waits.
2. Resets `ov00 = 0`.
3. Sets `clac 0` (clicks map back to Activate 1).
4. Emits **0** on output port 0 (`prt: send 0 0`) so downstream gadgets see the siren going silent.

### Signal Summary

| Source | Output Port 0 Value |
|---|---|
| Input signal `_p1_ ≠ 0` (event 1000) | `_p1_` (forwarded unchanged after alarm sequence) |
| Input signal `_p1_ = 0` (event 1000) | 0 (via turn-off event 2000) |
| Internal turn-off (event 2000) | 0 |
| Hit (event 3) | rand 60–100 (via `prt: bang`) |

### Creature Wake-Up Side Effect

Within the alarm sequence, the siren enumerates every creature (`esee 4 0 0`) and forces `aslp 0` on each — any sleeping/dreaming creature in range is woken. This is the siren's core ecological role: it is an alert device that interrupts creature sleep.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the siren:

1. Enumerates all sirens (`enum 3 8 8`) and kills each (`kill targ`).
2. Removes scripts: `scrx 3 8 8 1` (Activate 1), `scrx 3 8 8 2` (Activate 2), `scrx 3 8 8 9` (defensive — no event 9 is defined), `scrx 3 8 8 1000` (input port), `scrx 3 8 8 2000` (turn-off).

Note: the Hit (event 3) and Pickup (event 4) scripts are not explicitly stripped via `scrx`.

---

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 90 | — | Siren activated (event 1) | Biochemical feedback for turning the alarm on/off |
| 91 | `GOT_MACHINE` | Siren picked up (event 4, family 4 only) | Biochemical feedback for obtaining a machine |
| 92 | `HIT_MACHINE` | Siren hit (event 3) | Biochemical feedback for hitting machinery |

## Room CA Effects

| CA Index | Source | Amount | Ecological Role |
|---|---|---|---|
| 18 | Siren emission (`emit`) | 0.2 (continuous) | Marks the room as an alarm/alert zone — potentially used by creature navigation or scripting as a "danger/alert" cue |
