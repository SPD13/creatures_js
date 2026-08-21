# switch.cos - Wired Toggle Switch

**Source**: `Assets/Bootstrap/001 World/switch.cos`

## Overview

This script installs two simple wall switches in the Ark — single-sprite wired gadgets that act as on/off toggles in the port-based wiring system. A switch has one input port ("light in") and one output port ("light out"). Pressing the switch alternates between two click actions: while off, the switch sends `+255` on its output port and starts a periodic blinking animation; while on, the switch sends `0` on its output port and goes dark. The switch can also be remotely driven through its input port — any non-zero signal arriving on the input is forwarded as-is on the output and starts the blink cycle, while a `0` input turns the switch off.

Two switches are placed in the world: one at (2100, 364) in the upper Ark and one at (2210, 3250) in the lower Ark. Each switch emits CA 18 (machinery smell) at 0.2 to mark its room as containing machinery.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 3 | Wall Switch | `switch` | Toggleable wired on/off switch with input and output ports | [Detail](#wall-switch-3-8-3) |

---

## Wall Switch (3 8 3)

A simple two-frame `simp` agent representing a wall-mounted toggle switch (frame 0 = off, frame 1 = on/lit). The switch wires into the Ark's port system: it has one input port that accepts an external signal and one output port that drives downstream devices (typically lights or other powered gadgets — the port names "light in" / "light out" reflect the original use case of switching room lights). Toggling the switch is done either by clicking it (which alternates between the on and off Activate scripts via `clac`) or by sending a signal through its input port. While on, the switch ticks at 20 frames and plays a periodic beep + animation cycle.

### Properties

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 3 8 3 "switch" 2 0 1000 | Simple agent, sprite `switch`, 2 frames, image base 0, plane 1000 |
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activatable (4) + Floatable (64) + Suffer Collisions (128) |
| `bhvr` | 41 | Activate 1 (1) + Hit (8) + Pick Up (32) |
| `puhl` | -1 40 0 | Pickup handle offset (40, 0) for all poses |
| `perm` | 60 | Moderate permeability |
| `clac` | 0 | Click action initially set to Activate 1 (toggled to 1 when switch turns on) |
| `elas` | 10 | Slight bounce |
| `tick` | 0 | No timer initially (set to 20 when on) |
| `fric` | 100 | High friction |
| `aero` | 5 | Low air resistance |
| `accg` | 4 | Low gravity |
| `emit` | CA 18 at 0.2 | Continuous machinery smell emission into the room |
| `ov61` | 100 | CA smell emission intensity |
| `pose` | 0 | Initial pose = off frame |

### Initial Placement

Two switches are created in a `reps 2` loop, each positioned individually:

| Instance | Position | Notes |
|---|---|---|
| 1 | (2100, 364) | Upper Ark |
| 2 | (2210, 3250) | Lower Ark |

### Port System

| Direction | Index | Name | Description | Position | Message Range | Triggers |
|---|---|---|---|---|---|---|
| Input | 0 | "light in" / "light setting" | Receives external on/off signal | (24, 47) | 1000 | Script 1000 |
| Output | 0 | "light out" / "light setting" | Drives downstream powered device(s) | (20, 34) | — | — |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov61` | 100 | CA smell emission intensity |
| `ov70` | 0 | Current switch output value (0 = off, otherwise the active drive level — usually 255) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Turn switch on — drives output to +255, starts blink cycle |
| 2 | Activate 2 | Turn switch off — drives output to 0, stops blink cycle |
| 3 | Hit | Creature hits the switch — fires a random port bang and stimulates the hitter |
| 4 | Pickup | Creature picks up the switch — applies a stimulus to the creature |
| 9 | Timer (tick) | Beep + blink animation while on |
| 1000 | Port Input (port 0) | External signal sets switch state and forwards through output port |

---

#### Event 1 — Activate 1 (turn on)

Triggered when the switch is clicked while in the off state (`clac 0`):
1. Plays animation `[1]` (single on-frame).
2. Writes **stimulus 90** with intensity 1 to the activator (`from`) — biochemical feedback for operating the switch.
3. Sends **+255** through output port 0 (`prt: send 0 255`).
4. Stores `ov70 = 255` (current output value).
5. Sets `tick 20` — enables the periodic blink/beep timer.
6. Sets `clac 1` — next click will fire Activate 2 (turn off).

#### Event 2 — Activate 2 (turn off)

Triggered when the switch is clicked while in the on state (`clac 1`):
1. Plays animation `[0]` (single off-frame).
2. Sets `tick 0` — disables the timer.
3. Sets `clac 0` — next click will fire Activate 1 (turn on).

Note: this event does **not** explicitly send `0` on the output port (the input-port script handles that path); it simply stops the local blink cycle and resets the click action.

#### Event 3 — Hit

Triggered when a creature hits the switch:
1. Targets the hitter (`targ from`).
2. If the hitter is a Norn (family 4, genus 2), retargets the switch (`targ ownr`) and fires a `prt: bang rand 60 100` — a random signal burst is emitted on the output port.
3. Retargets the switch and writes **stimulus 92** (`HIT_MACHINE`) with intensity 1 to the hitter.

#### Event 4 — Pickup

Triggered when a creature picks up the switch:
1. Targets the picker (`targ from`).
2. If the picker is a Creature (family 4), writes **stimulus 91** (`GOT_MACHINE`) with intensity 1 to itself.

#### Event 9 — Timer (tick)

Fires every 20 ticks while the switch is on (`tick 20` was set by Activate 1). Implements the periodic blink/beep animation:
1. Plays the `"beep"` sound effect.
2. Plays animation `[0]` (off frame).
3. Defers the rest until the script is allowed to continue (`over` waits for animation to finish).
4. Re-sends the current output value `ov70` on output port 0 (refreshes the downstream signal).
5. Plays animation `[1]` (on frame), completing the blink.

#### Event 1000 — Port Input (Input Port 0)

Triggered when an external signal arrives on input port 0. Implements switch-by-wire:

| Incoming `_p1_` | Action |
|---|---|
| Non-zero | Plays anim `[1]`, sends `_p1_` on output port 0, stores `ov70 = _p1_`, sets `tick 20`, sets `clac 1` |
| `0` | Plays anim `[0]`, sends `0` on output port 0, sets `tick 0`, sets `clac 0` |

This makes the switch fully driveable by upstream wiring: any non-zero input turns it on (and forwards the same magnitude downstream), and a zero input turns it off — keeping the local `clac` and `tick` state consistent with the wired state.

### Signal Summary

| Source | Output Port 0 Value |
|---|---|
| Activate 1 (clicked on) | +255 |
| Activate 2 (clicked off) | (not changed by this event) |
| Hit by Norn (event 3) | rand 60–100 (via `prt: bang`) |
| Port input ≠ 0 (event 1000) | `_p1_` (forwarded as-is) |
| Port input = 0 (event 1000) | 0 |
| Periodic tick (event 9, while on) | `ov70` (refreshed once per 20 ticks) |

---

## Removal Script (rscr)

The removal script cleanly uninstalls the switches:

1. Enumerates all switches (`enum 3 8 3`) and kills each (`kill targ`).
2. Strips event scripts 1, 2, 9 and 1000 via `scrx`.

(Event scripts 3 and 4 remain in the scriptorium after removal.)

---

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 90 | — | Switch turned on (event 1) | Biochemical feedback for operating the switch |
| 91 | `GOT_MACHINE` | Switch picked up (event 4, family 4 only) | Biochemical feedback for obtaining a machine |
| 92 | `HIT_MACHINE` | Switch hit (event 3) | Biochemical feedback for hitting machinery |

## Room CA Effects

| CA Index | Name | Source | Amount | Ecological Role |
|---|---|---|---|---|
| 18 | Machinery / Music smell | Switch emission (`emit`) | 0.2 (continuous) | Marks the room as containing machinery, drawing creature attention |
