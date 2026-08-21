# doors.cos — The Docking Station Hub Doors

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/doors.cos`

## Overview

This script creates the six **hub doors** that connect Docking Station's metarooms to the central Hub. They are the lockable, species-gated gateways a creature (or the player's hand) pushes to travel between areas, and they also stitch the connected rooms together for **Room CA** purposes (smells/chemicals flow across each doorway via `link`).

Each door is one half of a **pair** — pushing one animates its partner on the far side and moves any travelling creatures across the boundary. The doors are:

| Classifier | Door | Partner | Notes |
|---|---|---|---|
| 2 2 22 | Mesa → Hub | 2 2 25 | |
| 2 2 25 | Hub → Mesa | 2 2 22 | Starts locked to grendels |
| 2 2 23 | Asrai Workshop → Hub | 2 2 27 | Starts locked to grendels |
| 2 2 27 | Right Hub → Workshop | 2 2 23 | |
| 2 2 24 | Comms/Nemo → Hub | 2 2 26 | |
| 2 2 26 | Centre Hub → Comms | 2 2 24 | **Invisible in a docked world**; starts locked to norns + grendels (has two button banks) |

Door state on each agent:

- **`ov00`** — 0 = closed, 1 = open (movement flag).
- **`ov01`** — bitwise lock: **+1 grendels, +2 ettins, +4 norns** locked out (0 = open to all). Three lock buttons (parts 1–3; the centre hub door has two banks, parts 1–6) toggle these bits.

At install the script also issues `link` between each door-pair's rooms (CA links, weight 100) so the connected rooms share their CA.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 2 22 | Mesa→Hub Door | `ds door` | See [common door behaviour](#common-door-behaviour) |
| 2 2 23 | Workshop→Hub Door | `ds door` | " |
| 2 2 24 | Comms→Hub Door | `ds door` | " |
| 2 2 25 | Hub→Mesa Door | `ds door` | " |
| 2 2 26 | Centre Hub Door | `ds door` | Invisible when docked; two button banks |
| 2 2 27 | Right Hub Door | `ds door` | " |

## Common Door Behaviour

All six doors share the same event set (the centre hub door simply mirrors its lock state across two button banks).

| Event | Number | Description |
|---|---|---|
| Push (Activate 1) | 1 | A creature or the pointer opens the door and travels through |
| Custom — partner open/close | 2 | Mirror the open→close animation when the paired door is used |
| Custom — grendel lock | 1000 | Toggle the grendel-lock bit (+1) and the button pose |
| Custom — ettin lock | 1001 | Toggle the ettin-lock bit (+2) |
| Custom — norn lock | 1002 | Toggle the norn-lock bit (+4) |

### Event 1 — Push / travel

1. Stim the pusher (`from`) with **75 ("wait")**.
2. If the pusher is the **pointer**, flag a metaroom change.
3. If the pusher is a **creature** (`fmly 4`), check `ov01` against the creature's genus (norn/grendel/ettin). **If that species is locked out**, stim the creature with **0 (disappointment)** and stop — the door stays shut.
4. Otherwise play the `doro` sound, tell the partner door (event 2) to animate, and open.
5. **Transfer creatures across the boundary** (`mvft` to the partner's stored X/Y) and stim each with **95 (travelled through door)**:
   - If the **pointer** opened it: move **all** touching, eligible creatures (`etch 4 0 0`, excluding the held creature, carried/asleep/dead ones).
   - If a **creature** opened it: move just that creature.
6. If a metaroom change was flagged (pointer) and the hand isn't holding a creature, call `meta` to move the player's view to the connected metaroom.
7. Close the door and refresh the three lock-button poses from `ov01`.

## Removal Script

```
rscr
enum 2 2 22 … 2 2 27
    kill targ
next
scrx 2 2 22 1
scrx 2 2 25 1
```

Kills all six doors and removes two push scripts.

## Impact on Stimulus / Room CA

**Stimuli:** doors stim the pusher with **75 (wait)** on contact, **0 (disappointment)** when the creature's species is locked out, and **95 (travelled through door)** on each creature actually transferred across.

**Room CA:** at creation each door pair issues a `link` (weight 100) between the rooms either side of the doorway, so the two connected rooms share CA (smells/heat/etc. propagate across the gateway). This is a persistent structural effect on the world's CA graph, independent of whether the door is open or closed. The doors do not themselves write CA values.
