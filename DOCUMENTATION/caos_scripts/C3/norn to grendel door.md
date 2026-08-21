# norn to grendel door.cos - Norn / Grendel Terrarium Teleport Door Pair

**Source**: `Assets/Bootstrap/001 World/norn to grendel door.cos`

## Overview

This script creates a pair of linked teleport doors that connect the Norn Terrarium to the Grendel Terrarium. Activating either door teleports the activating creature (or the creature currently held by the pointer) from one door to the other, playing open/close animations and sounds on both ends. The two doors are also linked via a CA room link (`link va00 va01 75`), meaning the two rooms are treated as smell-connected for creature navigation — creatures can sense and path to the opposite terrarium through the door pair.

Each door is a two-sided portal:
- **Door A** (`2 2 20`) is placed at `(4000, 149)` (high up in the Norn Terrarium).
- **Door B** (`2 2 21`) is placed at `(312, 1497)` (Grendel Terrarium side).

When activated, the door plays an opening animation, emits an early-teleport stimulus (`75`) to the creature if one is involved, then retargets to the paired door on the other side, also opens it, teleports the passenger to the destination coordinates, closes both doors, and finally emits a late-teleport stimulus (`95`) to the creature.

Destination coordinates are different for each direction:
- Door A → Door B drops the passenger at `(364, 1618)` (just below Door B).
- Door B → Door A drops the passenger at `(4008, 292)` (just below Door A).

The pointer (`pntr`) is handled specially: if the pointer triggered the activation, the camera is centred on the destination door and any creature currently held by the pointer (`hhld`) is released after transit.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 2 20 | norn to grendel door (A) | `norn to grendel door` 8 0 | Norn-side door at (4000, 149); teleports passengers to (364, 1618) | [Detail](#norn-to-grendel-door-a-2-2-20) |
| 2 2 21 | norn to grendel door (B) | `norn to grendel door` 8 8 | Grendel-side door at (312, 1497); teleports passengers to (4008, 292) | [Detail](#norn-to-grendel-door-b-2-2-21) |

## Common Properties

Both doors share the same base properties:

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Mouseclickable |
| `bhvr` | 1 | Activatable with activate1 |
| `clac` | 0 | Default (activate1 → event 1) |
| Family/Genus/Species | 2 / 2 / 20 and 2 / 2 / 21 | Door family (compound objects – `simp`) |

### Room Link

After creation, the two doors are linked with `link va00 va01 75`, which sets a CA path-link of strength `75` between the room containing Door A (sampled via `room targ` at the time of creation) and the room containing Door B. This allows creatures to smell through the portal and path toward it as if the two rooms were adjacent.

### Script Variables

| Variable | Meaning |
|---|---|
| `va00` | Door A's room id (at creation); later re-used to hold Door B's posx during teleport |
| `va01` | Door B's room id (at creation); later re-used to hold Door B's posy during teleport |
| `va02` / `va03` | Half of window width/height (used to centre the camera on the destination door) |
| `va12` / `va13` | Destination door's posx/posy (copy for reference) |

---

## norn to grendel door (A) (2 2 20)

Norn-side door at world position `(4000, 149)`. Activating this door sends the passenger to the Grendel-side door at `(312, 1497)` and drops them at `(364, 1618)`.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Plays open/close animations on both doors and teleports the activating creature (or the pointer's held creature) to the Grendel-side drop point |

#### Event 1 — Activate 1 (Teleport to Grendel Terrarium)

1. `lock` the script so only one activation is processed at a time.
2. Play `"open"` sound; clear current actions (`clac -1`); play opening animation `[0..7]`.
3. If `from` is a creature (`fmly eq 4`), emit stimulus **75** (early-teleport / "entering door") to it with intensity `1`.
4. `wait 20` ticks while the door is open.
5. Play closing animation `[7..6..5..4..3..2..1..0]` on Door A.
6. `rtar 2 2 21` — retarget to Door B (Grendel side) and play opening animation `[0..7]` on it.
7. Store Door B's posx/posy in `va00`/`va01` (and a backup in `va12`/`va13`).
8. **Pointer-initiated activation** (`from eq pntr`):
   - Compute half-screen offsets (`va02 = wndw / 2`, `va03 = wndh / 2`) and subtract from Door B's posx/posy — this will be used to centre the camera.
   - Enumerate creatures in range 4 around Door B (`etch 4 0 0`):
     - For each creature that is not currently held (`hhld ne targ`) and not carrying anything (`carr eq null`):
       - Release the pointer's held agent (`nohh`).
       - Teleport the creature to `(364, 1618)` using `mvft` (foot-anchored) if `tmvf 364 1618 = 1` (destination valid), otherwise fall back to `mvsf` (safe move).
       - Zero its velocity (`velo 0 0`).
   - If the pointer was still holding an agent, release it (`nohh`).
   - Retarget to Door B; `cmrt 0` snaps the camera onto it.
9. **Non-pointer activation** (other creatures / agents):
   - If `from` is a creature and is not the current hand-held creature, and is not carrying anything:
     - Release the hand-held agent (`nohh`).
     - Teleport `from` to `(364, 1618)` with `mvft`/`mvsf` and zero its velocity.
10. Retarget to Door B and play closing animation `[7..0]` on it.
11. Retarget to `ownr` (Door A); reset `clac 0`.
12. If `from` is a creature, emit stimulus **95** (late-teleport / "arrived through door") to it with intensity `1`.

### Stimulus Impact

| Stimulus | Intensity | Target | When |
|---|---|---|---|
| 75 | 1 | Activating creature | At start of teleport (door opens) |
| 95 | 1 | Activating creature | After teleport completes (door closes) |

### Room CA Impact

No `ca` slots are modified. However, on creation the two doors share a `link … 75` between their rooms, creating a CA path-link of strength 75 so that smells/drives can propagate from the Grendel Terrarium room to the Norn Terrarium room and vice versa.

---

## norn to grendel door (B) (2 2 21)

Grendel-side door at world position `(312, 1497)`. Activating this door sends the passenger to the Norn-side door at `(4000, 149)` and drops them at `(4008, 292)`.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Mirror of Door A's activation; teleports the activating creature (or the pointer's held creature) to the Norn-side drop point |

#### Event 1 — Activate 1 (Teleport to Norn Terrarium)

Structurally identical to Door A's activate1 with the following differences:

- `wait 10` instead of `wait 20` between opening and closing animations on the source side.
- Retarget destination is `2 2 20` (Door A).
- Teleport destination is `(4008, 292)` (Norn-side drop point) using `mvft`/`mvsf`.
- Stimuli emitted to the activating creature are the same: **75** on open and **95** on close.

### Stimulus Impact

| Stimulus | Intensity | Target | When |
|---|---|---|---|
| 75 | 1 | Activating creature | At start of teleport (door opens) |
| 95 | 1 | Activating creature | After teleport completes (door closes) |

### Room CA Impact

Same as Door A — no CA slots modified, but the two doors share a bidirectional room `link … 75` created at bootstrap time.

---

## Teleport Summary

| Direction | Source Door | Destination Door | Drop Point | Source Wait |
|---|---|---|---|---|
| Norn → Grendel | 2 2 20 @ (4000, 149) | 2 2 21 @ (312, 1497) | (364, 1618) | 20 ticks |
| Grendel → Norn | 2 2 21 @ (312, 1497) | 2 2 20 @ (4000, 149) | (4008, 292) | 10 ticks |

## Pointer vs Creature Activation

The script distinguishes three activation modes via `from`:

- **`from eq pntr`** — The pointer clicked the door directly. The camera is centred on the destination door (via `cmrt 0`), any creature held by the pointer is transferred through, and the pointer's hand is released.
- **`from` is a creature (`fmly eq 4`)** — The creature itself activated the door (e.g. walking up and pushing it). The creature is teleported; stimuli 75/95 are emitted to teach it about the teleport experience.
- **Other agents / `null` `from`** — Only the door animations play; nothing is teleported.

---

## Removal Script

The `rscr` section cleanly removes all agents and event scripts created by this file:
1. Enumerates and kills all `2 2 20` doors.
2. Enumerates and kills all `2 2 21` doors.
3. Removes event scripts `2 2 21 1` and `2 2 20 1` via `scrx`.
