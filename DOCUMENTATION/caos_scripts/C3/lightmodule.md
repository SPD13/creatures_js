# lightmodule.cos — Light Module

## Overview

This script creates six stackable light modules — small engineering components that form part of the Creatures 3 machinery port system. Light modules can receive light intensity signals through their input ports, visually display the intensity level through animation, and forward the signal through their output ports to downstream devices. They can be stacked on top of each other using a gravity-based stacking mechanic, and creatures can cycle through three color/base states by pushing them.

Six modules are created in two groups of three:
- **Group 1** at X=1560, Y positions 3300, 3250, 3200 — in the lower Engineering section
- **Group 2** at X=1900, Y positions 500, 450, 400 — in the upper Engineering section

Each module emits CA 18 (a cellular automata smell) at rate 0.2 into its surrounding room, contributing to the environmental smell propagation system. The modules are physics-enabled, carryable, and respond to creature interactions with appropriate biochemical stimuli for machine-type objects.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `3 8 11` | Light Module | A stackable engineering component that receives and forwards light signals via ports, with three color states | [Details](#agent-3-8-11-light-module) |

---

## Agent `3 8 11` — Light Module

A small engineering gadget that participates in the port-based machinery system. Light modules receive a light intensity value (0–255) on their input port, animate to reflect the intensity level, and forward the value through their output port. They can be physically stacked on top of each other and will re-stack when disturbed. Creatures can cycle through three visual color states by pushing the module.

### Agent Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activateable (4) + Suffer Collisions (64) + Suffer Physics (128) |
| `bhvr` | 41 | Activate 1 / Push (1) + Hit (8) + Pickup (32) |
| `perm` | 60 | Moderate permeability |
| `elas` | 10 | Low elasticity — minimal bounce |
| `aero` | 5 | Low air resistance |
| `fric` | 100 | Maximum friction — does not slide |
| `accg` | 4 | Standard gravity |
| `ov00` | 0 | Current base frame (color state): 0, 4, or 8 |
| `ov01` | null/agent | Reference to the module this one is stacked on |
| `ov61` | 100 | Machine smell intensity |
| `ov70` | — | Last received light signal value (signed) |
| `ov71` | — | Absolute value of last received signal |
| Sprite | `lightmod` | 12 frames, plane 5000 |
| `emit` | CA 18 at 0.2 | Emits cellular automata property 18 into the room |

### Ports

| Port | Type | ID | Name | Description |
|---|---|---|---|---|
| Input | `prt: inew` | 0 | "light in" | Receives a light intensity value; triggers script 1000 |
| Output | `prt: onew` | 0 | "light out" | Forwards the light intensity value to connected devices |

### Events

| Event | Script Number | Description |
|---|---|---|
| Push (Activate 1) | 1 | Creature pushes the module — cycles color state |
| Hit | 3 | Creature hits the module — damages port connections |
| Pickup | 4 | Creature picks up the module |
| Drop | 5 | Creature drops the module — re-enables stacking |
| Timer | 9 | Stacking behavior — finds and stacks on nearest module below |
| Port Input | 1000 | Receives light signal via input port |
| Deactivate | 2000 | Resets module to idle state (zero signal) |

### Event Details

#### Push (Event 1) — Activate 1

When a creature pushes the light module, it plays the "lg_1" sound effect and sends the `ACTIVATE_MACHINE` stimulus to the creature. The module then cycles through three base frame states in order: 0 → 4 → 8 → 0, each representing a different visual color configuration. If the current base is in an unexpected state, it resets to 8. The animation is restarted at frame [0] relative to the new base.

**Stimulus impact:**
- `stim writ from 90 1` — Sends stimulus 90 (`ACTIVATE_MACHINE`) to the pushing creature at intensity 1

#### Hit (Event 3)

When a creature hits the module, it plays the "hit_" sound effect and randomly breaks port connections with a 60–100% probability per connection. This simulates physical damage to the machinery. The hitting creature receives a negative reinforcement stimulus.

**Stimulus impact:**
- `stim writ from 92 1` — Sends stimulus 92 (`HIT_MACHINE`) to the hitting creature at intensity 1

#### Pickup (Event 4)

When a creature (family 4) picks up the module, it receives the `GOT_MACHINE` stimulus. The module's tick timer is stopped (tick 0). The script then iterates through all other light modules (3 8 11) and restarts the tick on any module that had `ov01` pointing to this module — meaning any module that was stacked on top of this one will begin falling and searching for a new stack target.

**Stimulus impact:**
- `stim writ targ 91 1` — Sends stimulus 91 (`GOT_MACHINE`) to the picking-up creature at intensity 1

#### Drop (Event 5)

When dropped, the module counts all other existing light modules. If there is one or fewer other modules remaining, it starts its tick timer (tick 1) to enable the stacking search behavior. Gravity is set to 4 (standard).

#### Timer (Event 9) — Stacking Behavior

The timer script implements the stacking mechanic. The module searches for other light modules that are below it (positive relative Y) and not currently being carried. If a valid target is found, the module stores a reference to it in `ov01` and executes the `stak` subroutine:

**Subroutine `stak`**: Disables gravity (`accg 0`), calculates a position 30 pixels above the target module's top, stops velocity, and moves to that position (using `mvsf` for safe movement with fallback to `mvto`). The tick is stopped.

**Subroutine `fall`**: If there is an obstacle below (checked via `obst 3`), the module notifies any other modules stacked on it to start their tick timers (so they can re-stack), sets gravity to 4, and stops execution. If there is no obstacle below, the tick is stopped.

#### Port Input (Event 1000) — Light Signal Received

Triggered when a signal arrives on input port 0. The received value (`_p1_`) is stored in `ov70`, and its absolute value in `ov71`. The module immediately forwards the signal through output port 0 via `prt: send 0 ov70`.

The animation played depends on the absolute signal intensity:
- **1–85** (low): Gentle flicker animation `[1 0 1 0 1 0 1 0 1 0]`, tick 20
- **86–170** (medium): Moderate flicker `[2 0 2 0 2 0 2 0 2 0]`, tick 20
- **171–255** (high): Strong flicker `[3 0 3 0 3 0 3 0 3 0]`, tick 20

The animation is the same for positive and negative signal values — only the magnitude affects the visual display.

If the signal value is exactly 0, the module sends message 2000 to itself to deactivate.

#### Deactivate (Event 2000) — Reset to Idle

Resets the module to its idle state: plays the static base animation `[0]`, stops the tick timer, disables clac (click action), and sends a 0 value through output port 0 to propagate the deactivation downstream.

### Room CA Impact

- **CA 18**: Each light module continuously emits CA property 18 at rate 0.2 into its containing room. This contributes to the room's cellular automata smell propagation, making the area detectable by creatures sensitive to this CA channel.

## Removal Script

The removal section (`rscr`) kills all light module agents (3 8 11) and removes all their event scripts (1, 2, 4, 5, 9, 1000, 2000).
