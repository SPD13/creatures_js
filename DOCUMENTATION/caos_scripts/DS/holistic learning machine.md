# holistic learning machine.cos — The Holistic Learning Machine

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/holistic learning machine.cos`

## Overview

This script creates the **Holistic Learning Machine** (HLM, `3 3 100`) — Docking Station's language teacher. When a **creature** pushes it, the machine lifts the creature up into its plasma chamber, **teaches it the entire vocabulary** (`vocb`), makes it express its new contentment, then sets it back down. When the **hand** pushes it instead, the machine beckons nearby creatures to come and use it. It coordinates three helper agents: a **plasma tube** glow, an invisible **pickup agent** that grabs and positions the creature, and a spinning **blue effect**.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 3 100 | Holistic Learning Machine | `ds holistic learning` | The teaching device — see [detail](#agent-3-3-100-holistic-learning-machine) |
| 1 1 202 | Plasma Tube | `ds holistic learning` | The glowing plasma column (handle in `game "hlm_plasma"`) — see [detail](#agent-1-1-202-plasma-tube) |
| 1 1 174 | Pickup Agent | `ds holistic learning` | Invisible agent that lifts and positions the creature — see [detail](#agent-1-1-174-pickup-agent) |
| 1 1 175 | Blue Effect | `ds holistic learning` | The spinning learning aura shown while teaching |

## Agent 3 3 100: Holistic Learning Machine

The visible device (lights = part 1, tendrils = part 2). `ov16` holds the creature being taught; `ov80`/`ov81`/`ov84` are busy/ready flags.

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | A creature push starts the teaching cycle; a hand push beckons nearby creatures instead |
| Custom — teach | 1000 | Once the creature is in position, teach it all words and make it express |

### Event 1 — Push

If ready (`ov84 = 1`, not busy):

- **Hand push** (`from = pntr`): plays an animation and, within range 400, **urges** the first creature it can see (`esee 4 0 0`, `urge … 28`) to approach and use the machine — a "come here" demo.
- **Creature push**: marks itself busy, stores the pusher (`ov16`), confirms it's a creature (`fmly 4`), tells the **pickup agent** (`1 1 174`) who to lift, and starts the plasma tube and flashing lights.

### Event 1000 — Teach

With the creature held in the chamber: flashes the screen, stims the creature **90 (activate machinery)**, runs **`vocb`** to teach it the full vocabulary, un-zombifies it, drives an **express** urge so it reacts, then tells the pickup agent (`1 1 174`, event 1001) to set the creature down and resets.

## Agent 1 1 202: Plasma Tube

| Event | Number | Description |
|---|---|---|
| Custom — toggle | 1000 | Start/stop the plasma glow (toggles its fade timer) |
| Timer | 9 | Fade the glow in and out continuously while active |

## Agent 1 1 174: Pickup Agent

An invisible helper that physically moves the creature into and out of the machine.

| Event | Number | Description |
|---|---|---|
| Custom — pick up | 1000 | Create the blue effect (`1 1 175`), zombify & pose the creature, pick it up and glide it into the chamber, then tell the HLM to teach (event 1000) |
| Custom — drop | 1001 | Restore the creature's original attributes, un-zombify and drop it, kill the blue effect, and reset the machine |

It remembers and restores the creature's original `attr` so picking it up for teaching doesn't permanently change it, and `zomb`s the creature so it holds still during the lift.

## Removal Script

```
rscr
enum 3 3 100 / 1 1 174 / 1 1 175 / 1 1 202
    kill targ
next
scrx … (removes the machine and pickup-agent scripts)
```

Kills the machine and all its helpers.

## Impact on Stimulus / Room CA

No Room CA is written. **Stimuli/effects on the creature:** the taught creature is stimmed with **90 (activate machinery)**, has its **entire vocabulary taught** directly (`vocb` — a permanent learning effect on its brain), and is driven to **express** (urge). While in the machine it is temporarily `zomb`ified (held still) with its attributes restored afterward. A hand-push instead issues an **approach urge (28)** to nearby creatures, calling them over to learn.
