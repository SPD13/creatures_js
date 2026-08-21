---
title: recycler2
type: CAOS Script Documentation
---

# recycler2.cos

**Source**: `Assets/Bootstrap/001 World/recycler2.cos`

## Overview

This bootstrap script installs the **Recycler** machine in the Norn Terrarium. The Recycler accepts organic items (food, creatures) inside its cabin, and when activated converts their stored nutrition (`ov61` — the "nutrition" / calorie value of each item) into the world-wide **Bioenergy** economy. The amount of Bioenergy produced is further modulated by the `ov90` multiplier that is read from a connected controller agent (classifier `1 1 91`, broadcaster/stats agent) — this lets an in-world "energy dial" scale the recycler's efficiency.

The script:

- Adds **200** to the global game variable `"Bioenergy"` at install time (seed value).
- Creates a **vehicle** (the recycler cabin, classifier `1 1 38`) that physically holds items dropped in by the player or by creatures.
- Creates a **compound control panel** (classifier `2 12 9`) with three buttons and two wireable ports (input / output), placed next to the cabin.
- Cross-links the two agents: the vehicle stores a reference to the panel in `ov16`, and the panel stores a reference to the vehicle in `ov16`.
- Broadcasts status messages to any connected `1 1 91` stats agents, sending a composed string that reads `"Energy: <Bioenergy value>"` so external displays stay in sync.

The `rscr` block enumerates and kills both the vehicle (`1 1 38`) and the compound (`2 12 9`) classes so the installer can be re-run cleanly.

## Created Agents

| Classifier | Name | Role | Detail |
|---|---|---|---|
| 1 1 38 | Recycler cabin (vehicle) | Physical receptacle that holds items to be recycled and performs the recycling math | [Detail](#recycler-cabin-1-1-38) |
| 2 12 9 | Recycler control panel (compound) | User-facing panel with 3 buttons and input/output ports, drives the recycler and reports state | [Detail](#recycler-control-panel-2-12-9) |

---

## Recycler cabin (1 1 38)

A vehicle agent placed at world coordinates `(2299, 951)` using sprite file `recycler2` (image base 29, plane 50). Its cabin rectangle is `cabn 10 10 205 98` with `cabp -25` (items are drawn behind the vehicle body), so items dropped on it fall inside the cabin and are carried. `attr 8` gives it collision, and `perm 60` makes it solid against physics. `bhvr 0` disables creature interaction with the cabin itself — creatures interact through the panel only.

On installation the script stores the cabin's `targ` into temp `va66`, then — after the compound panel is created and its `targ` stored in `va67` — re-enumerates the `1 1 38` class and writes `va67` (the panel) into the cabin's `ov16`, completing the mutual link.

### Events

| Event | # | Purpose |
|---|---|---|
| Message | 1001 | Main recycle cycle — consumes cabin contents and produces Bioenergy |
| Message | 1002 | Cancel / abort the current cycle |

#### Message 1001 — Recycle cycle

Runs the whole recycle sequence, gated by the cabin's internal state `ov00` and `ov01`:

1. Enumerates all `1 1 91` agents (external controller/display) looking for one whose `ov00 = 3`; copies that agent's `ov02` into `va89`, then writes it into the cabin's own `ov90` — this becomes the **Bioenergy yield multiplier** (as a percentage, divided by 100 below).
2. If the cabin is idle (`ov00 = 0`) and `_p2_ = 1` (start requested):
   - Sets `ov00 = 1` (busy), disables physics attrs (`attr 0`), plays the open/in animation `[0..8]` with `over` to wait for completion.
   - Plays the `"recy"` loop sound.
   - Sends message `2000` to the panel (triggers the "running" animation on the panel's part 1).
   - Enumerates everything presently inside the cabin (`epas 0 0 0`) and, for every item whose `ov61` (nutrition / calorie content) is non-zero, accumulates `ov61` into `va02` and **kills** the item.
   - Computes the produced Bioenergy: `va02 * ov90 / 100` (truncated to int via `ftoi`) and adds that to the global `"Bioenergy"` game variable.
   - Composes a status string `"Energy: <Bioenergy>"` and sends message `1001` with it to every `1 1 91` controller that has `ov00 = 3` (keeps hooked-up displays in sync).
   - `wait 50` for dramatic pause, plays the close animation `[8..0]` with `fade`/`over`, resets `ov00 = 0`, `ov01 = 0`, re-enables physics (`dpas 0 0 0`, `attr 8`) and sends `2001` to the panel so it returns to idle visuals.
3. If `ov00 = 1` (already busy) and `_p2_ = 1`: a shorter variant of the same cycle — skips the opening animation, still consumes items and adds raw `va02` (without the `ov90` multiplier applied in this branch), then returns the panel and cabin to idle.
4. If `ov00 = 1` and `_p2_ = 0` (cancel while busy): plays close animation, sends `2001` to the panel, returns to idle without consuming items or producing Bioenergy.

> Stimulus / CA impact: none directly, but the cycle mutates the world-level `"Bioenergy"` game variable which other machines (e.g. the energy meter) read. Items inside the cabin are destroyed (`kill targ`) when consumed.

#### Message 1002 — Cancel

Simply re-enables physics on the cabin (`dpas 0 0 0`) — a minimal cancel hook used by the panel's "off" button.

---

## Recycler control panel (2 12 9)

A compound agent placed at `(2552, 950)` using sprite file `recycler2` (image base 19, plane 50). It has `attr 8` and `perm 60`. On creation it stores the vehicle's `targ` (`va66`) into its own `ov16` — giving the panel a handle to the cabin it controls — and writes its own `targ` into `va67` for the vehicle's back-link.

The panel is built from three button parts plus two wire ports:

| Part | Kind | Sprite frame | Description |
|---|---|---|---|
| 1 | `butt` | base 5, 9 frames, message `1001` | Primary **Start** button |
| 2 | `butt` | base 39, 6 frames, message `1002` | Auxiliary / Secondary button |
| 3 | `butt` | base 57, 13 frames, message `1003` | **Stop / Cancel** button |
| 0 | input port `inew` | "recycler in" / "activation value", slot 26/80, message `1000` | Wire-in activation value |
| 0 | output port `onew` | "recycler out" / "output value", slot 10/80 | Wire-out — currently unused in-script but available for external wiring |

### Events

| Event | # | Purpose |
|---|---|---|
| Message | 1000 | Port input — routes an incoming activation value to the Start or Cancel button |
| Message | 1001 | Start button pressed — begin a recycle cycle |
| Message | 1002 | Secondary button pressed — begin a cycle with `ov01 = 0` (no reentrancy flag) |
| Message | 1003 | Cancel button pressed — toggle idle or report status |
| Message | 2000 | Internal — play the "running" animation on part 1 |
| Message | 2001 | Internal — reset all button parts to frame 0 and clear state |

#### Message 1000 — Port input

Sends the received `_p1_` value through the output port (`prt: send 0 _p1_`), then forwards it: if positive, simulates a press of the Start button by `mesg writ ownr 1001`; otherwise simulates a press of the Cancel button by `mesg writ ownr 1003`.

#### Message 1001 — Start button

Plays the `"lg_1"` button sound, sets part 1 to its pressed animation `anim [1]`, and — only if the panel is idle (`ov01 = 0`) — sets `ov00 = 1`, `ov01 = 1`, then sends `mesg wrt+ ov16 1001 ov00 ov01 0` to the cabin to actually run the recycle cycle. The `wrt+` form passes `ov00` as `_p1_` and `ov01` as `_p2_` — the cabin's 1001 handler keys off `_p2_` to decide between full-cycle and cancel variants.

#### Message 1002 — Secondary button

Plays `"lg_1"` and animates part 2 to frame 2. If fully idle (`ov00 = 0 and ov01 = 0`), sets `ov00 = 1`, keeps `ov01 = 0`, and forwards `mesg wrt+ ov16 1001 ov00 ov01 0` to the cabin — this takes the `_p2_ = 0` path inside the cabin (the "cancel while busy" branch), effectively a silent / no-op start used for state testing.

#### Message 1003 — Cancel button

Plays `"lg_1"` and animates part 3 to frame 1. If a cycle is running (`ov00 = 1`), resets the panel's local state (`ov00 = 0`, `ov01 = 0`) and sends `mesg wrt+ ov16 1001 ov00 ov01 0` to the cabin — this is the abort path inside cabin 1001. Otherwise sends `mesg writ ov16 1002` to invoke the cabin's cancel/dpas hook directly.

#### Message 2000 — Running animation

Plays animation `[1..11 255]` (255 = repeat) on part 1. Called by the cabin during a live recycle cycle to show the panel is busy.

#### Message 2001 — Reset visuals

Resets parts 1, 2 and 3 to frame 0, clears `ov00`/`ov01`, and calls `clac 0` to re-enable creature click activation. Called by the cabin when a cycle finishes (or is cancelled) so the panel looks idle again.

---

## Global game variables

- `game "Bioenergy"` — created / incremented by this script. Set to at least **200** at install time, then incremented on every successful recycle cycle by the scaled nutrition of the consumed items. Acts as a shared world resource.

## Remove Script (rscr)

Enumerates `1 1 38` and `2 12 9` and kills every agent found. Running the installer again will tear down the previous instance of both the cabin and the panel cleanly.
