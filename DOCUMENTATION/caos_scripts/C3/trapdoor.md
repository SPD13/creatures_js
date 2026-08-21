# trapdoor.cos - Trapdoor Mechanism and Control Panel

**Source**: `Assets/Bootstrap/001 World/trapdoor.cos`

## Overview

This script creates a two-part trapdoor mechanism: a wall-mounted control panel with a button and wiring ports, and an invisible floor agent that acts as the actual trapdoor. When the button is pressed (by a creature, the hand, or a connected input port), the panel signals the trapdoor to open. The trapdoor plays an opening animation, lowers the room permeability between adjacent rooms so agents can pass through, zeroes the velocity of any entities caught on it, and then waits. After a short delay the trapdoor checks for creatures in range — if any are still standing on it, it stays open and retries on a tick; once clear, it animates closed and restores a partial room permeability of 50.

The panel broadcasts an output signal (255 high when the trap opens, 0 low when it closes) on its output port, allowing the trapdoor to be daisy-chained into other gadgets. The trapdoor and its panel are paired by classifier (the panel targets `1 1 26`, the trapdoor targets `3 3 35`).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 35 | Trapdoor Control Panel | `trapdoor` frame 6 | Wall-mounted button with input/output ports that drives the trapdoor | [Detail](#trapdoor-control-panel-3-3-35) |
| 1 1 26 | Trapdoor | `trapdoor` frame 6 (simple) | Invisible floor-level trapdoor that opens/closes room permeability | [Detail](#trapdoor-1-1-26) |

## Agent Pairing and Layout

| Agent | Position | Role |
|---|---|---|
| 3 3 35 panel | (2814, 2060) | Control button and port interface |
| 1 1 26 trapdoor | (2604, 2098) | Actual trap floor that opens below |

The panel and trapdoor discover each other at runtime through `rtar` (range target) on the paired classifier — they do not store each other's id.

---

## Trapdoor Control Panel (3 3 35)

Compound agent (`new: comp`) carrying one animated button part and a pair of CAOS ports. When pressed, it plays a brief press animation, tells the nearby trapdoor to open, and broadcasts a high signal on its output port.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `clac` | 0 | Direct click activation (no redirect) |
| `elas` | 0 | No bounce |
| Sprite (base) | `trapdoor` 1 6 0 | Base image, first relative pose 6 |
| Button part (1) | `butt 1 "trapdoor" 7 2 15 6 0 [] 1000 0` | 7 images, 2 anim frames, hover msg 1000 |
| Input port 0 | "Trapdoor input" → event 1001 | Activates the trap when signal ≥ 128 (via event 1001 logic) |
| Output port 0 | "Trapdoor output" | Sends 255 (open) / 0 (closed) on state change |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Button pressed by creature — beep, signal self to trigger the trap |
| 1000 | Custom (Trigger Trap) | Plays press animation, tells trapdoor (1 1 26) to open |
| 1001 | Input Port 0 | Input port received a value; if non-zero, triggers the trap |
| 1002 | Custom (Output) | Sends `_p1_` on output port 0 (used by trapdoor to raise/lower the line) |

#### Event 1 — Activate 1

Plays the "beep" sound and sends itself message 1000 to run the trigger sequence.

#### Event 1000 — Trigger Trap

1. Targets button part 1.
2. Plays press animation `[0 1 0 1 0 1 0]` (button bounce).
3. Range-targets the paired trapdoor agent `1 1 26` (`rtar`).
4. If a trapdoor is found, sends it message 1000 (open).
5. Returns target to `ownr`, waits for the animation to finish (`over`).
6. Restores the idle animation loop `[0,0,0,...0, 1,1,1,...1, 255]` (30 frames, looping at frame 255).

#### Event 1001 — Input Port Trigger

If the incoming signal `_p1_` is non-zero, sends self message 1000 to fire the trap. A zero input is ignored (edge-like behaviour — only a rising signal opens the trap).

#### Event 1002 — Output Send

Emits the value in `_p1_` on output port 0. The trapdoor itself writes 255 when it opens and 0 when it closes, so any wired downstream gadget tracks the trap state.

---

## Trapdoor (1 1 26)

Simple agent (`new: simp`) that represents the physical trap floor. It is positioned just below/left of the panel and, when opened, uses the `door` command to change the permeability between the rooms above and below the grid point under its feet, letting agents fall through.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Suffer collisions (floor-like behaviour) |
| `elas` | 0 | No bounce |
| Sprite | `trapdoor` 6 0 | 6-frame open/close animation |

### OV Variables

| OV | Usage |
|---|---|
| `ov00` | Room at the trapdoor's position (`grap posx posy`) |
| `ov01` | Room to the north (up) of `ov00` (`grid ... _up_`) |
| `ov02` | Room to the south (down) of `ov00` (`grid ... down`) |
| `ov50` | Open-state lock: 0 = closed, 1 = open (prevents re-entry) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Custom (Open) | Opens the trap, lowers permeability, zeroes entity velocity, waits, then closes (or retries on tick 9 if blocked) |
| 9 | Timer tick | Retry-close logic when creatures are still standing on the trap |

#### Event 1000 — Open

1. `lock` to prevent re-entry.
2. If `ov50 = 0` (trap is closed):
   1. Set `ov50 = 1` to mark the trap as open.
   2. Play sound "trap".
   3. Resolve and cache the three rooms used by the permeability update:
      - `ov00 = grap posx posy` — room under the trapdoor.
      - `ov01 = grid targ _up_` — room to the north.
      - `ov02 = grid targ down` — room to the south.
   4. Range-target the panel (`rtar 3 3 35`); if found, send `mesg wrt+ 1002 255 0 0` to raise the output port high.
   5. Return target to `ownr` and play opening animation `[0 1 2 3 4 5]`.
   6. Open permeability fully: `door ov00 ov01 100` and `door ov00 ov02 100` so agents can fall through.
   7. **Stop caught entities**: `etch 0 0 0` enumerates every agent in the touching region; for each, `velo 0 0` zeroes its velocity so it falls straight down rather than being flung.
   8. `slow` (set target to low frame-rate category) and `over` to wait for the animation to finish, then `wait 30` ticks.
   9. `inst` and count creatures in range: `setv va66 0`, `etch 4 0 0` (enum family 4 = creatures), `addv va66 1` for each.
   10. If `va66 < 1` (no creatures on/near the trap):
       - `tick 0` (disable timer).
       - `setv ov50 0` (unlock the trap).
       - Play closing animation `[5 4 3 2 1 0]` and sound "trap".
       - Partially restore permeability: `door ov00 ov01 50` and `door ov00 ov02 50` (not back to fully solid; creatures can still pass but with reduced ease — matches the ordinary floor state for this room pair).
       - `over`, range-target the panel, and send `mesg wrt+ 1002 0 0 0` to drop the output port low.
   11. Else (`va66 ≥ 1`, creatures still present): set `tick 20` to retry the close check in 20 game ticks via event 9.

#### Event 9 — Timer Retry

Mirrors the close-or-retry branch from event 1000:

1. `inst`, `lock`, zero `va66`, re-count creatures via `etch 4 0 0`.
2. If clear, disable the tick, unlock, play close animation and sound, restore permeability to 50, drop the output signal.
3. If still occupied, reset `tick 20` and try again next cycle.

### Room CA / Permeability Impact

| State | `door ov00 ov01` | `door ov00 ov02` | Effect |
|---|---|---|---|
| Closed (idle) | — | — | Unchanged by this script (whatever the map default is) |
| Open | 100 | 100 | Full permeability north↔centre and south↔centre — agents fall through |
| Just closed | 50 | 50 | Partial permeability (the script does not fully seal the rooms) |

No chemical stimuli are emitted by this agent — interaction is purely mechanical via room permeability and velocity.

---

## Removal Script

The `rscr` section cleans up both agents and removes their event handlers:

```
enum 3 3 35
    kill targ
next
enum 1 1 26
    kill targ
next
scrx 3 3 35 1000
scrx 1 1 26 1000
```

Note that the removal script only kills the panel event `1000` and the trapdoor event `1000`; other scripts (activate `1`, port handlers `1001`/`1002`, tick `9`) are left installed in the scriptorium. This appears to be a minor omission in the original script.
