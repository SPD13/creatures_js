# Wetness Monitor and Designator

## Purpose

Installs an invisible "wetness designator" agent that periodically inspects every creature in the world and tracks how wet it is. When a creature stands in a water-type room (room types 8 and 9, i.e. sea / ocean / submerged rooms), its personal wetness counter (`ov60`) ramps up to a maximum of 100. When the creature then leaves the water, the designator drops one animated water droplet per tick at the creature's position, decrementing `ov60` until the creature is "dry" again. This produces the classic dripping-after-a-swim visual feedback seen on Norns, Grendels and Ettins returning from water areas.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 1 106 | Wetness Designator | Invisible global monitor that scans creatures every 10 ticks and spawns drip droplets when wet creatures leave water. | [See details](#wetness-designator-1-1-106) |
| 2 19 4 | Water Droplet | Small falling water drop spawned on wet creatures after they leave water; splashes on collision. | [See details](#water-droplet-2-19-4) |

---

### Wetness Designator (1 1 106)

Invisible global singleton (`attr 0`, placed at 2500,500) that ticks every 10 frames. On each tick it enumerates all creatures (family 2 = general creatures, and family 3 = Norns specifically — the two `enum` loops combined cover every creature class) and updates their personal wetness counter based on the room they currently occupy. It also uses that counter to emit falling water droplets while the creature is drying off.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Periodic wetness scan and drip emission |

**Timer (9)** — For every enumerated creature, the `get_wet` subroutine runs the following logic on the creature as `TARG`:

1. Skip the creature if it is being carried (`attr & 32`).
2. Only consider creatures that are movable / suffer-physics (`attr & 3`).
3. If the creature's current room type (`rtyp room targ`) is 8 or 9 (water rooms), increment its wetness variable `ov60`, capped at 100.
4. If `ov60 > 0` and the creature is currently NOT in a water room, decrement `ov60` by 1 and spawn a new Water Droplet (2 19 4) at the creature's `posx/posy` on its current `plne`. The droplet is created with `perm 100`, `attr 192` (suffers collisions + suffers physics), `elas 0`, `accg 10`, `tick 30`, and is then `mvto`'d into place. If the target position is not movement-valid (`tmvt <> 1`), the droplet is killed immediately.

This is a purely visual/ambient system — wetness is not exposed as a chemical or stimulus; the only side-effect on the world is the stream of short-lived water droplets produced during drying.

### Water Droplet (2 19 4)

Short-lived physics droplet used as the visible "drip" effect. Created by the Wetness Designator above the creature's sprite position, it falls under gravity (`accg 10`) until it lands on any surface and then plays a splash animation before removing itself.

| Event | Number | Description |
|---|---|---|
| Collision | 6 | Splash on impact and remove droplet |
| Timer | 9 | Fail-safe self-destruction |

**Collision (6)** — Plays the splash animation `[1 2 3 4]` once, waits for it to complete with `over`, then `kill targ`. No stimulus is emitted and no Room CA is affected; this is purely cosmetic.

**Timer (9)** — Unconditionally `kill targ`. Acts as a cleanup safety net if the droplet somehow never collides (e.g. falls outside a valid room) so droplets cannot accumulate.

## Removal Script

Kills the singleton designator (1 1 106) and all live droplets (2 19 4), and removes the timer and collision scripts for both classifiers.
