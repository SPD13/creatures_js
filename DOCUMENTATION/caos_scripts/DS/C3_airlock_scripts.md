# C3_airlock_scripts.cos - Docked Airlock Behaviour Override

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/C3_airlock_scripts.cos`

## Overview

When a Creatures 3 world is **docked** with Docking Station, the C3 airlock agents are present but their original behaviour needs adjusting for the docked setup. This script first **stops** the three C3 airlock agents from running their own scripts (`stpt`), then **injects replacement event scripts** for them. It also defines a small **particle-effect agent** (`1 1 46`) used to play the "vaporise" dust/bone effect.

The replacement airlock logic enumerates every agent currently in the airlock (`etch`) and, for each one that is not held and not in the C3 inventory:

- **Hand / pointer** (`fmly 2 gnus 1`) — ignored.
- **Portal** (`fmly 3 gnus 9`) — moved safely back onto the Capillata hub (`mvsf 2700 9000`) instead of being destroyed.
- **Hoverdoc** (`fmly 3 gnus 8 spcs 64`) and a related agent (`fmly 2 gnus 14 spcs 8`) — told to close and return home (`setv name "airlock" 1`, `tick 1`).
- **Creatures** (`fmly 4`) — flung upward (`velo 0 -10`), marked `dead`, killed, and given both a dust cloud **and** a bone particle burst.
- **Everything else** — killed, with a dust-cloud burst at its last position.

The net effect is that the airlock ejects/vaporises stray objects and creatures (with appropriate effects), while gracefully relocating special agents (portals, hoverdoc) rather than destroying them.

## Created / Modified Agents

| Classifier | Name | Type | Description | Details |
|---|---|---|---|---|
| 1 1 39 | Airlock Agent (C3) | Modification | Its scripts are stopped and replaced with the docked collision handler | [Details](#agent-1-1-39-airlock-agent) |
| 1 1 44 | Bridge Airlock (C3) | Modification | Replaced with docked push + kill handlers | [Details](#agent-1-1-44-bridge-airlock) |
| 1 1 50 | Engineering Airlock (C3) | Modification | Replaced with docked push + kill handlers | [Details](#agent-1-1-50-engineering-airlock) |
| 1 1 46 | Airlock Particle FX | Creation | Dust-cloud / bone particles spawned by the airlock vaporise effect | [Details](#agent-1-1-46-airlock-particle-fx) |

The C3 airlock agents themselves are documented under the Creatures 3 pack ([airlock agent](../C3/airlock%20agent.md), [all bridge airlock](../C3/all%20bridge%20airlock.md), [all Engineering airlock](../C3/all%20Engineering%20airlock.md)); this script only re-points their behaviour for the docked case.

---

## Agent 1 1 39: Airlock Agent

First stopped with `stpt`, then given a replacement script.

### Events

| Event | Number | Description |
|---|---|---|
| Collision | 9 | Process every agent in the airlock — relocate specials, vaporise the rest |

#### Event 9 — Collision (airlock processing)

Locks, enumerates the agents touching the airlock (`etch`), and applies the per-agent rules listed in the Overview (ignore hand, relocate portal/hoverdoc, kill objects with a dust burst, kill creatures with dust + bones). Killed agents spawn 10 `dust cloud` particles (`1 1 46`); creatures additionally spawn 8 `bone` particles.

---

## Agent 1 1 44: Bridge Airlock

Stopped with `stpt`, then given two replacement scripts.

### Events

| Event | Number | Description |
|---|---|---|
| Message | 1001 | Push handler — plays `poyy`, relocates specials, and shoves loose physical agents out to the **right** (`velo 50 -20`) |
| Message | 1002 | Kill handler — vaporises objects/creatures left in the airlock (dust + bones), relocating specials first |

#### Event 1001 — Push

Plays the `poyy` sound, then for each in-airlock agent (excluding hand-held / inventory items): relocates portal/hoverdoc specials; for ordinary non-floatable physical agents it zeroes aero/friction, sets full elasticity and launches them rightward (`velo 50 -20`). Creatures (`fmly 4`) are marked `dead`.

#### Event 1002 — Kill objects in airlock

The destructive pass: for each qualifying physical agent it relocates specials, ignores the hand, and otherwise kills the agent (creatures upward-flung, marked dead, bones; objects just dust), spawning the `1 1 46` particle effects at the last position.

---

## Agent 1 1 50: Engineering Airlock

Identical structure to the Bridge Airlock, but mirrored: its push (event 1001) shoves agents out to the **left** (`velo -50 -20`).

### Events

| Event | Number | Description |
|---|---|---|
| Message | 1001 | Push handler — `poyy`, relocate specials, shove loose agents **left** (`velo -50 -20`) |
| Message | 1002 | Kill handler — vaporise objects/creatures (dust + bones), relocating specials first |

---

## Agent 1 1 46: Airlock Particle FX

A transient `simp` particle created by the airlock kill handlers:

- **Dust cloud** — `new: simp 1 1 46 "dust cloud" 4 8 1000`, physical (`attr 192`), light gravity (`accg 0.1`), bouncy (`elas 100`), random velocity, animates `[0 1 2 3]`. 10 are spawned per vaporised agent.
- **Bone** — `new: simp 1 1 46 "bone" 12 0 1000`, no gravity (`accg 0`), bouncy, animates a 12-frame sequence ending in `255` (hold). 8 are spawned when the vaporised agent was a creature.

Each particle is positioned at the victim's last location (`tmvt` validates the move; if invalid the particle kills itself).

### Events

| Event | Number | Description |
|---|---|---|
| Collision | 9 | `kill ownr` — the particle destroys itself on first collision |

---

## Removal Script

```
rscr
enum 1 1 39
    kill targ
next
enum 1 1 46
    kill targ
next
```

Kills any Airlock Agent (1 1 39) and leftover particle (1 1 46) instances. (The Bridge/Engineering airlock agents are owned by the C3 world and are not enumerated for destruction here.)

## Impact on Stimulus / Room CA

None on Room CA. The airlocks operate on agents — destroying or relocating them and spawning short-lived particle effects. They emit no CA and no creature stimuli; creatures caught in an airlock are simply killed (`dead` + `kill`).
