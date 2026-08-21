# teleporter.cos - Ark Teleporter Network

**Source**: `Assets/Bootstrap/001 World/teleporter.cos`

## Overview

This script installs a network of four wired teleporter pads around the Ark, plus defines a transient "beam" effect agent that is spawned during teleportation. A teleporter is a wired gadget with one input port ("Activate") and one output port ("Pass through"): activating it (via click or port input) opens the pad (extends an iris-like animation), and once open the owner can command it to teleport — the teleporter scans the other teleporters in its network, picks the next one in sequence (by `ov03` slot index, wrapping around), and moves every creature currently touching it (up to 4 creatures per transfer) to that destination pad. A short "beam" `simp` animation is spawned at both the source and destination to visually accompany the transfer, and the camera follows if a visible Norn is among the teleported creatures.

Four teleporter instances are placed around the world at fixed positions and assigned sequence indices via `ov03` (1, 3, 2, 4) that control the network traversal order. The first teleporter also tracks how many siblings exist in the network (`va50`) before creation — the pattern is classic "count first, then create".

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 2 1 | Teleporter Pad | `teleport` | Wired teleport booth that moves touching creatures to the next pad in the network | [Detail](#teleporter-pad-3-2-1) |
| 1 1 130 | Teleport Beam Effect | `teleport` | Transient visual beam / fade effect spawned at source and destination during a teleport | [Detail](#teleport-beam-effect-1-1-130) |

---

## Teleporter Pad (3 2 1)

A 11-frame `comp` agent representing an iris / beaming booth. The pad can be clicked by a creature to open it, and then re-clicked (or signalled externally) to initiate a beam-out of any creature standing on it to the next teleporter in the network. The network is formed implicitly by the four instances of classifier `3 2 1` and ordered by each pad's `ov03` sequence index; when a pad is activated it loops through the other pads (wrapping `va03` back to 1 when it exceeds the count) looking for one that is also open (`ov00 = 1`) and not the current pad — the first match becomes the destination. If exactly one teleporter (only this one) is open, the activation is aborted and the pad shuts down.

### Properties

| Property | Value | Notes |
|---|---|---|
| `new: comp` | 3 2 1 "teleport" 11 0 30 | Composite agent, sprite `teleport`, 11 base frames, first image 0, plane 30 |
| `elas` | 0 | No bounce |
| `attr` | 197 | Carryable (1) + Mouseable (4) + Floatable (64) + Suffer Collisions (128) |
| `bhvr` | 9 | Activate 1 (1) + Hit (8) |
| `accg` | 5 | Low gravity |
| `clac` | -1 | No default click action (activation is routed via PAT: BUTT message 6400) |
| `perm` | 100 | Fully permeable |
| `pat: butt 1` | 20 1 151 60 0 [] 6400 0 | Button hotspot 1 — sends message 6400 (activate) |
| `pat: butt 2` | 20 1 151 81 0 [] 6401 0 | Button hotspot 2 — sends message 6401 (teleport) |
| `tick` | 30 | Periodic heartbeat (only referenced for port-querying in event 9) |

### Initial Placement

Four pads are placed, each assigned a distinct sequence index via `ov03`:

| Instance | Position | `ov03` (sequence slot) |
|---|---|---|
| 1 | (1004, 426) | 1 |
| 2 | (2563, 1647) | 3 |
| 3 | (1635, 3405) | 2 |
| 4 | (6750, 200) | 4 |

### Port System

| Direction | Index | Name | Description | Position | Message |
|---|---|---|---|---|---|
| Input | 0 | "Activate" | "When a non-zero signal is received the teleport will activate" | (169, 75) | 6404 |
| Output | 0 | "Pass through" | "Outputs 255 when teleport activates" | (169, 90) | — |

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Open-state flag: 0 = closed, 1 = open |
| `ov03` | Sequence slot / network index (1..N), controls destination order |
| `ov16` | Current destination pad (set during teleport) |
| `ov70` | Busy flag: 1 while a teleport cycle is running (prevents re-entry) |
| `ov90` | Initialised to 0 (unused at runtime) |
| `ov95` | Initialised to 0 (unused at runtime) |
| `va50` | (install only) Count of existing pads before placement |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 0 | Deactivate (agent disabled) | Forwards to self as message 6401 — triggers a teleport if open |
| 1 | Activate 1 | Forwards to self as message 6401 — triggers a teleport if open |
| 3 | Collision | Creature collides with the pad — bangs the output port and stimulates the creature |
| 9 | Timer (tick) | Reports open/closed state on output port 0 |
| 6400 | Message — Open/Close toggle | Opens the iris (closed → open) or closes it while killing any beam effects (open → closed) |
| 6401 | Message — Begin Teleport | If open and not busy, scans network, picks next pad, moves touching creatures |
| 6402 | Message — Receive Arrivals | Destination-side beam animation; kills leftover beam effects and resets busy flag |
| 6403 | Message — Emergency Reset | Clears busy flag, kills beam effects, returns to open pose |
| 6404 | Message — Port Input | If incoming `_p1_ = 255`, forwards to self as 6401 (begin teleport) |

#### Event 0 / Event 1 — forwarded Activate

Both events simply do `mesg writ ownr 6401`, routing the standard Activate 1 (click) and Deactivate (0) script flows into the teleport start path. A creature clicking a teleporter pad triggers Activate 1 → 6401.

#### Event 3 — Collision

Fires when an agent (usually a creature) collides with the pad:
1. Targets the colliding agent (`targ from`).
2. If it is a Norn (family 4, genus 2), the pad (retargeted via context) bangs its output port with a random value 60..100 (`prt: bang rand 60 100`).
3. Writes **stimulus 92** (HIT_MACHINE) with intensity 1 to the collider.

#### Event 9 — Timer / Port Query

Tick-triggered output-port refresh:
- If `ov00 = 0` (closed), sends 0 on output port 0.
- If `ov00 = 1` (open), sends 128 on output port 0.

This keeps downstream wired devices aware of whether the teleporter is currently open.

#### Event 6400 — Open/Close Toggle

Wrapped in `lock/unlk` to serialise concurrent activations.

Writes **stimulus 101** to the `pntr` (the pointer/hand agent) — provides activation feedback to the player/creature holding the pointer.

Then branches on `ov00`:

- **If `ov00 = 0` (opening):**
  1. With 50% probability (`rand 0 1 == 0`), plays startup sound `"stup"`, base 0, plays the startup anim `[0 1 0 1 0 0 1 1 0 1 1]` and waits for it (`over`).
  2. Sets `pose 1`, plays `"bep2"` beep, waits 10 ticks.
  3. Plays `"coil"` sound and the full opening iris animation `[2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 7 7 7 8 8 8 9 9 9]`, waits for it (`over`).
  4. Sets `pose 9` (fully open frame).
  5. Sets `ov00 = 1` (pad is open).

- **Else if `ov00 = 1` (closing):**
  1. Kills any lingering beam effects (`etch 1 1 130 … kill targ`).
  2. Plays `"bep2"`, waits 10, plays closing sound `"col2"` and the reverse iris anim `[9 9 9 8 8 8 … 2 2 2]`, waits for it.
  3. Sets `pose 0` (closed frame).
  4. Sets `ov00 = 0`.

#### Event 6401 — Begin Teleport (main teleport logic)

Gated by `lock`. Guards:
- If `ov00 = 1` **and** `ov70 = 0` (open and idle): writes stim 101 to pointer, then calls subroutine `actv`.
- Else if `ov00 = 0`: no-op.
- Else if `ov70 = 1`: calls subroutine `deac` then `stop` (emergency cancel of a stuck in-progress teleport).

The body is a chain of local subroutines:

##### `subr actv` — activate

1. Sets `ov70 = 1` (busy flag).
2. Plays `"bep2"` beep.
3. Sets `pose 10` (teleport-ready pose).
4. Calls `zzap`.

##### `subr zzap` — spawn source beam and pick destination

1. Records pad position in `va80`/`va81` (posl/post).
2. Sends **+255** on output port 0 (`prt: send 0 255`) — signals downstream wiring that teleportation is starting.
3. Creates the beam effect agent: `new: simp 1 1 130 "teleport" 9 11 5001` and moves it to the pad's position.
4. Plays `"beam"` sound and the energising anim `[0 0 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 7 8]`.
5. Calls `sele` to choose destination and move the creatures.
6. If `va98 = 1` (transfer succeeded), resets base to 0 and sets `pose 9`.

##### `subr sele` — select destination pad

1. Counts pads in the network and pads that are currently open:
   - `va70` = total pads.
   - `va72` = pads with `ov00 = 1` (including self).
2. Snapshots this pad's sequence index into `va03` and `va90`.
3. If only one pad is open (`va72 = 1`): `fade`s the beam effect, calls `deac`, and `stop`s — abort.
4. Otherwise, loops (`va71` counts iterations, max 10) advancing `va03` each pass (wrapping back to 1 when it exceeds `va70`), enumerating all pads and selecting the one whose `ov03 = va03`, is open (`ov00 = 1`) and is not this pad (`va03 <> va90`). The chosen pad is stored in `va16` and sent message **6402** (receive-arrivals).
5. If a destination was found: stores `va16` in `ov16` and calls `move`; otherwise calls `deac`.

##### `subr move` — move creatures to destination

1. Targets the destination pad (`ov16`), reads `va17 = posx`, `va18 = posb - 10` (just above its bottom).
2. Back on the source pad, enumerates the 4 nearest colliding agents (`etch 4 0 0`) — the creatures touching the pad:
   - For each agent currently not being carried (`carr = null`): increments `va44`.
   - If it is a Norn that is visible (`fmly = 4 gnus = 2 visi 0 = 1`), sets `va66 = 6` (a flag used below to trigger a camera follow).
   - Disables the carry-while-handling flag (`nohh`), then moves the agent onto the destination: `mvft` if `tmvf` reports the position is valid (floor/room appropriate), otherwise `mvsf` (move safely to nearest floor).
3. If at least one agent was moved (`va44 <> 0`):
   - Targets the destination (if still valid). If `va66 = 6` (a visible Norn was teleported), triggers a `cmrp posx posy 0` — camera-jumps to the destination so the player follows the creature.
4. Retargets `ownr`, calls `deac`, and sets `va98 = 1` to mark success.

##### `subr deac` — deactivate / cleanup

1. Re-locks, sets `ov70 = 0` (clears busy flag).
2. Kills any remaining beam effect agents (`etch 1 1 130 … kill targ`).
3. Sets `pose 9` (open pose).
4. Unlocks.

#### Event 6402 — Receive Arrivals (destination side)

Fires on the destination teleporter during `sele`. Wrapped in `lock`.
1. Records destination position in `va80`/`va81`.
2. Spawns its own beam effect (`new: simp 1 1 130 "teleport"`) at the pad position.
3. Plays `"beam"` and the arrival anim `[0 0 1 1 2 2 3 3 4 4 5 5 6 6 7 8]`, waits for it (`over`).
4. Kills the beam (`kill targ`), retargets itself (`targ ownr`), clears `ov70`, and kills any stray beam effects (`etch 1 1 130`).
5. Sets `pose 9` (open).

#### Event 6403 — Emergency Reset

Wrapped in `lock`. Clears busy flag, kills any beam effects, sets pose 9. Used as a manual recovery path if a pad is stuck busy.

#### Event 6404 — Port Input (Input Port 0)

1. If `_p1_ = 255`, forwards to self as message 6401 — a full-strength wired signal kicks off a teleport.
2. Other values are ignored (pad is only driven by explicit max-strength pulses).

### Signal Summary

| Source | Output Port 0 Value |
|---|---|
| Timer (event 9), closed | 0 |
| Timer (event 9), open | 128 |
| Collision with Norn (event 3) | rand 60..100 (`prt: bang`) |
| Teleport starts (`zzap`) | +255 |

---

## Teleport Beam Effect (1 1 130)

A transient, single-purpose `simp` agent used only as a visual/sound carrier for the beam animation during teleportation. It has no event scripts of its own — the teleporter pad drives its animation directly after creating it, and kills it explicitly once the sequence is done. It is created at the source pad during `zzap`, and at the destination pad by event 6402.

### Properties

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 1 1 130 "teleport" 9 11 5001 | Simple agent, sprite `teleport`, 9 frames starting at frame 11, plane 5001 (rendered on top) |

It has no event scripts — it is purely a puppet object animated by the spawning teleporter.

---

## Removal Script (rscr)

1. Enumerates all teleporter pads (`enum 3 2 1`) and kills each.
2. Enumerates all beam effects (`enum 1 1 130`) and kills each.
3. Strips event scripts `0, 1, 6400, 6401, 6402, 6403, 6404, 9` from the scriptorium via `scrx`.

(Event script 3 — collision — is left in the scriptorium after removal.)

---

## Stimulus Summary

| Stimulus # | Name | Context | Target |
|---|---|---|---|
| 92 | `HIT_MACHINE` | Creature collides with the pad (event 3) | The colliding creature |
| 101 | — | Pad is clicked to open/close (event 6400) or teleport begins (event 6401) | The pointer (`pntr`) |

## Room CA Effects

The teleporter does not emit any Room CA. Its only environmental signature is via wiring (`prt: send` / `prt: bang`) on its output port.
