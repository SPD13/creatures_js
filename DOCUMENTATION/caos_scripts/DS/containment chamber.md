# containment chamber.cos — The Containment Chamber

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/containment chamber.cos`

## Overview

This script builds the **Containment Chamber** (`1 1 154`), the sealable airlock-like booth in the Workshop where creatures **warp in** (online immigrants / quarantined arrivals) and where the player can shut a creature in for safe-keeping. It is a **vehicle** with a cabin, so closing it picks up whichever creatures stand inside and seals a door between the chamber and the room beyond; opening it drops them again and re-opens the door. It works hand-in-hand with the **Workshop Screen** (`1 2 208`, a separate script) which drives the UI, and the **warning-icon / "fat controller"** (`1 1 164`) which is notified about new immigrants.

When a creature warps in it plays a glowing **containment warp** animation via a short-lived effect agent (`1 1 191`).

> **Dependency:** needs `workshop screen.cos` present to receive its messages.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 154 | Containment Chamber | `containment chamber` | The sealable cabin vehicle that contains/warps creatures — see [detail](#agent-1-1-154-containment-chamber) |
| 1 1 191 | Containment Warp FX | `containment_warp` | A transient warp-in animation that fades and self-destructs — see [detail](#agent-1-1-191-containment-warp-fx) |

## Agent 1 1 154: Containment Chamber

A `new: vhcl` with a cabin (`cabn`), a low cabin plane (`cabp`), and an activation button (part 2). `ov00` is the door state: **0 = open, 1 = closed**. `ov16` holds a creature reference (init null).

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Tell the Workshop Screen (`1 2 208`) the chamber was activated (`mesg 1004`) |
| Activate 2 | 2 | The actual open/close mechanism — animate, carry/release creatures, set the door |
| Custom — press button | 1000 | Animate the button, then message self Activate 1 |
| Custom — immigrant ahoy | 1001 | A creature is warping in (`_p1_` = moniker): play warp FX, notify the fat controller and Workshop Screen |
| Custom — create warp anim | 1002 | Spawn the `1 1 191` warp effect at the chamber mouth |

### Event 2 — Open / close

Reads the room IDs either side of the chamber (`grap` at two X positions) to know which door to operate, then toggles on `ov00`:

- **Currently open (→ close):** plays `shut`, runs the closing animation, **picks up passengers** of families 4/2/3 (creatures) into the cabin (`gpas`), seals the door (`door … 0`, impermeable), sets `ov00 = 1`. If `_p1_` is 0 and a creature is actually inside (`epas`), scrolls the Workshop Screen view to the chamber.
- **Currently closed (→ open):** plays `opn1`, runs the opening animation, **drops all passengers** (`dpas`), opens the door (`door … 100`, fully permeable), sets `ov00 = 0`.

### Event 1001 — Immigrant ahoy

Fired when a creature warps in. It triggers the warp animation (event 1002), notifies the **fat controller** (`1 1 164`, `mesg 1000` with portal-event code 1 and the inbound moniker) so the appropriate warning icon is raised, and tells the **Workshop Screen** (`1 2 208`, `mesg 1070`) about the new arrival.

## Agent 1 1 191: Containment Warp FX

A `new: simp` effect created at the chamber's mouth (offset +74,+25), plane 200, playing a one-shot warp animation with a 30-tick timer and the `chm1` sound.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | `fade` then `kill ownr` — the animation removes itself |

## Removal Script

```
rscr
enum 1 1 154
    kill targ
next
enum 1 1 191
    kill targ
next
scrx 1 1 154 1
```

Kills the chamber and any warp effects, and removes the `1 1 154` activate script.

## Impact on Stimulus / Room CA

No creature **stimuli** are emitted. The chamber's gameplay effect is **spatial**: as a vehicle it carries creatures in its cabin, and it changes **door permeability** between the chamber room and the adjacent room (`door … 0` when sealed, `door … 100` when open) — so it gates creature/agent passage at that boundary. It does not write Room CA values (light/heat/etc.).
