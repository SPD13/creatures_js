# mediporter.cos - Mediporter (Medical Transporter)

**Source**: `Assets/Bootstrap/001 World/mediporter.cos`

## Overview

This script installs the **Mediporter**, a medical teleportation device that transports creatures (and other non-carried agents) from its location to a fixed destination point (2000, 3780) in the world — the Medical Bay. The mediporter is a carryable tool placed near the surface of the Ark (random x between 2800 and 3100, y=213). It is activated either by direct interaction or via its input port, at which point it spawns a short-lived **teleport** agent near itself. The teleport agent enumerates all nearby agents within a bounded area (4×0×0 via `etch`), moves each eligible one to the Medical Bay coordinates, and then destroys itself.

The mediporter also participates in the stimulus system: activating, picking up, or hitting it delivers different stimuli back to the interacting creature. It exposes an input port (id 1000) and an output port (id 0) allowing it to be wired to other devices — activations can be forwarded over the network, and receiving a signal on the input port triggers the same teleport behaviour as a physical activation.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 8 9 | Mediporter | `mediporter` frames 0-8 | Carryable medical transporter that teleports creatures to the Medical Bay when activated | [Detail](#mediporter-3-8-9) |
| 1 1 43 | Teleport Effect | `teleport` frames 0-11 | Transient visual effect that enumerates nearby agents and moves them to (2000, 3780) | [Detail](#teleport-effect-1-1-43) |

---

## Mediporter (3 8 9)

The mediporter is a simple physical agent representing a portable medical transporter. It is placed at a random x between 2800 and 3100 at y=213 (near the top-surface of the map). When activated, it launches a teleport effect that sweeps nearby agents to the Medical Bay destination (2000, 3780). It also defines ports so it can be wired into the Ark's signalling network.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable + Mouseable + Activatable 1 + Physics + Suffers Collisions |
| `bhvr` | 41 | Creatures can Activate 1 (1) + Activate 2 (8) + Pick Up (32) |
| `perm` | 60 | Moderate permeability |
| `elas` | 10 | Low bounce |
| `fric` | 100 | Maximum friction |
| `aero` | 5 | Light air resistance |
| `accg` | 4 | Moderate gravity |
| `tick` | 0 | No timer |
| `clac` | 0 | Activate 1 maps to event 1 (default) |
| `puhl` | -1 25 36 | Pickup handle on all poses at offset (25, 36) |
| `ov61` | 100 | Agent-specific flag (used elsewhere as CA-smell intensity convention; unused here in behaviour) |
| `emit` | CA 18 at 0.2 | Emits the "Machinery" smell so creatures can locate/identify it |

### Ports

| Port | Type | ID | Name | Description |
|---|---|---|---|---|
| Input | `inew 0` | 1000 | `mediporter in` | Triggers script 1000 on message; activates the teleport when signalled |
| Output | `onew 0` | — | `mediporter out` | Forwards the activation signal to any wired downstream agent |

`cmrt 0` disables default message routing behaviour between ports.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Direct activation by a creature; plays sound and triggers teleport |
| 3 | Hit | Agent is hit (collision/impact); plays hit sound, bounces and emits particles |
| 4 | Pickup | Creature picks up the mediporter |
| 1000 | Port Input | Signal arrived on the input port |
| 2000 | Teleport Trigger | Internal message that actually spawns the teleport effect |

#### Event 1 — Activate 1

1. Plays the `"lg_1"` sound effect.
2. Sends **stimulus 90** with intensity 1 to `from` (the activating creature) — the standard "activated object" stimulus.
3. Sends message 2000 to itself to start the teleport sequence.

#### Event 3 — Hit

When the mediporter is physically hit:
1. Plays a random `"hit_"` variant sound.
2. Applies a random upward velocity (`velo 0 rand -5 -10`) — it hops.
3. Emits a particle bang of random radius (60-100).
4. Sends **stimulus 92** with intensity 1 to `from` — the "hit object" stimulus.

#### Event 4 — Pickup

1. Switches target to `from` (the creature performing the pickup).
2. If that target's family is 4 (Creature), sends **stimulus 91** with intensity 1 to it — the "picked up object" stimulus.

#### Event 1000 — Port Input

Triggered when another agent signals the input port.
1. If `_p1_` (the sender/value) is non-zero, sends message 2000 to itself — the signal causes a teleport just like a physical activation.
2. Forwards the signal out of the output port (`prt: send 0 _p1_`) — downstream wired agents also receive the event.

#### Event 2000 — Teleport Trigger (Internal)

The meat of the mediporter behaviour. Uses `lock`/`unlk` so no other script can interrupt.

1. `clac -1` — temporarily disables the Activate 1 behaviour so re-activation during the sequence is ignored.
2. Computes the spawn offset for the teleport effect in `va10`, `va11`:
   - `va10 = posx - 100`
   - `va11 = posy - 130`
3. Plays the opening animation `[0 1 2 3 4 5 6 7 8]` using `over` to wait for completion.
4. Uses `inst` to execute atomically, then creates a new **Teleport Effect** (`simp 1 1 43 "teleport" 9 11 9000`) at (`va10`, `va11`) with `attr 0` (no physics/collisions).
5. Sends message 2000 to that new teleport agent (triggering its own event 2000).
6. Switches back to the mediporter itself (`targ ownr`) and plays the reverse closing animation `[8 7 6 5 4 3 2 1 0]`, again waiting with `over`.
7. `clac 0` — restores Activate 1 behaviour.
8. Unlocks.

---

## Teleport Effect (1 1 43)

The teleport effect is a short-lived visual agent spawned by the mediporter. It plays the teleport animation, enumerates agents within a small bounded area around itself, moves each eligible one to the fixed Medical Bay destination at (2000, 3780), and then destroys itself. Classifier 1 1 43 is a generic "effect / transient agent" family; several scripts in the project reuse this classifier for different one-shot visuals. This script contributes the `2000` handler.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 0 | No physics, not collidable, not carryable — purely visual |
| Plane | 9000 | Rendered on top of most other agents |
| Sprite | `teleport` | Animation frames 0-11 |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 2000 | Teleport Sequence | Plays effect, teleports nearby agents to (2000, 3780), then self-destructs |

#### Event 2000 — Teleport Sequence

1. Locks execution for atomicity.
2. Plays sound `"tele"`.
3. Plays the intro animation `[0 1 2 3 4 5 6 7]` using `over` (blocks until complete).
4. Queues the outro animation `[3 4 5 6 7 255]` — 255 marks the animation-end token so it plays once and stops on the last frame.
5. `inst` — executes the following block atomically.
6. `etch 4 0 0` — enumerates agents in a bounded touching area with parameters (family=4, genus=0, species=0) — i.e. all **Creatures**. For each one:
   - If `targ <> null` and `targ <> ownr` (not the effect itself) and `carr = null` (the agent is not being carried):
     - `nohh` — detach from any held object the creature was holding.
     - If `tmvf 2000 3780 <> 1` (the target cannot safely be moved via footing to 2000,3780), uses `mvsf 2000 3780` (move safely/snap to footing) instead; otherwise uses `mvft 2000 3780` (move foot to). This picks the gentlest teleport that lands the creature correctly.
7. Unlocks (`slow`).
8. `kill targ` — destroys the teleport effect.

The `etch 4 0 0` enumeration limits teleporting to Creatures (family 4) — the mediporter is designed specifically for transporting Norns, Grendels, and Ettins. Other agents nearby are not affected.

---

## Removal Script (rscr)

Cleanly uninstalls the mediporter and any active teleport effects:

1. Enumerates and kills all existing **Mediporter** agents (`enum 3 8 9 → kill targ`).
2. Removes Mediporter scripts: Activate 1 (`scrx 3 8 9 1`) and port input (`scrx 3 8 9 1000`).
3. Enumerates and kills all existing **Teleport Effect** agents (`enum 1 1 43 → kill targ`).
4. Removes Teleport Effect scripts: event 1 (`scrx 1 1 43 1`, a placeholder — no such script is installed here, but the removal is safe) and event 2000 (`scrx 1 1 43 2000`).

Note: The removal does not detach event 3 (Hit) or event 4 (Pickup) for classifier 3 8 9, nor event 2000 on 3 8 9. These remain registered after removal, which matches the original script as authored.

---

## Stimulus Summary

| Stimulus # | Context | Recipient | Intensity | Effect |
|---|---|---|---|---|
| 90 | Mediporter activated (event 1) | Activating creature (`from`) | 1 | Standard "I activated an object" feedback |
| 91 | Mediporter picked up (event 4) by a creature | Creature that picked it up | 1 | Standard "I picked up an object" feedback |
| 92 | Mediporter hit (event 3) | Hitting agent (`from`) | 1 | Standard "hit object" feedback |

## Teleport Destination

All teleports performed by this script target the fixed world coordinate **(2000, 3780)** — the Medical Bay area of the Ark. The choice between `mvft` (move foot to) and `mvsf` (move safely to) is driven by `tmvf`, which tests whether a direct foot-move lands the agent on valid footing. This guarantees creatures arrive upright rather than in mid-air or embedded in geometry.

## Port Network Behaviour

- **Input port 1000** (`mediporter in`): receiving any non-zero signal triggers a teleport, just like a physical activation.
- **Output port 0** (`mediporter out`): every signal received on the input port is re-emitted here, so the mediporter can be chained to further devices.

This makes the mediporter useful as a building block in Ark-wide wired contraptions — a remote switch can fire it, and it can in turn fire something else downstream.
