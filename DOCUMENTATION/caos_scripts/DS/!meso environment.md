# !meso environment.cos - Norn Meso Environment Setup

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/!meso environment.cos`

## Overview

This bootstrap script seeds the environmental layer of the **Norn Meso** (metaroom 11, the Capillata's creature terrarium) defined in [!map](!map.md). It scatters three families of invisible helper agents across the mesa:

- **Light emitters** — fixed points that emit into the light CA channel (over plant pods, lift buttons, the Empathic Vendor, the incubator, etc.).
- **Heat emitters** — fixed points that emit into the heat CA channel across the lower/mid/upper mesa.
- **"Muck from C3"** — physics particles that fall onto the ground and deposit Room CA before disappearing, seeding the soil/ground with starting environmental values (the Docking Station equivalent of the Creatures 3 detritus muck).

A debug switch (`setv va00 0`) controls the emitters' base sprite image; the source notes that setting it to 1 makes the otherwise-invisible emitters visible for tuning. All emitter/muck agents are made invisible at runtime via `attr 16`.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 1 150 | Meso Light Emitter | Invisible point emitter for the light CA channel | [Details](#agent-1-1-150-light-emitter) |
| 1 1 151 | Meso Heat Emitter | Invisible point emitter for the heat CA channel | [Details](#agent-1-1-151-heat-emitter) |
| 1 1 171 | Mesa Muck | Falling physics particle that deposits Room CA on landing, then dies | [Details](#agent-1-1-171-mesa-muck) |

---

## Agent 1 1 150: Light Emitter

Nine invisible `simp` agents (gallery `blnk`, plane 8000, `attr 16` invisible, `clac 0`) placed at fixed positions around the upper/mid mesa — to the top-right/top-left/left of and below the Empathic Vendor, above the lift call button, above the lemon and carrot pods, above the heatpan incubator, and at the lift hole between the mid and lower mesa.

### Events

| Event | Number | Description |
|---|---|---|
| Message | 1000 | Set light emission |

#### Event 1000 — Set light emission

```caos
emit 1 _p1_
```

Begins emitting into **CA channel 1 (light)** at the strength supplied in `_p1_`. The strength is provided by whatever controller drives the mesa lighting (e.g. a day/night controller messaging the emitters), so a single emitter agent can be re-tuned without being recreated.

---

## Agent 1 1 151: Heat Emitter

Around thirteen invisible `simp` agents (same setup as the light emitters: `blnk`, plane 8000, `attr 16`, `clac 0`). They are spread along the lower mesa (a left-to-right row), with extra emitters at the egg-hatcher pan, near the Empathic Vendor, and at the centre of the upper-mesa lemon pod. (One lower-mesa emitter is commented out in the source.)

### Events

| Event | Number | Description |
|---|---|---|
| Message | 1000 | Set heat emission |

#### Event 1000 — Set heat emission

```caos
emit 2 _p1_
```

Begins emitting into **CA channel 2 (heat)** at the strength supplied in `_p1_`.

---

## Agent 1 1 171: Mesa Muck

80 physics particles seeded with `new: simp 1 1 171 "blnk" 1 va00 3000` (plane 3000), created in three batches with `reps`/`repe` and scattered horizontally with `mvto rand`:

| Batch | Count | Region | X range | Y |
|---|---|---|---|---|
| Upper mesa | 20 | upper | 480–1388 | 8900 |
| Mid mesa | 20 | mid | 1110–1811 | 9188 |
| Lower mesa | 40 | lower | 495–1635 | 9470 |

Each particle is a physical object: `attr 192` (SufferCollisions + SufferPhysics), `elas 0` (no bounce), `accg 0.4` (gravity), `perm 40` (passes floors of permeability ≤ 40). With gravity and no elasticity it simply drops to the ground.

### Events

| Event | Number | Description |
|---|---|---|
| Collision | 6 | On hitting the floor, deposit Room CA and self-destruct |

#### Event 6 — Collision

```caos
doif wall = down
    inst
    altr room ownr 4 0.80
    altr room ownr 3 0.25
    slow
    wait 20
    kill ownr
endi
```

When the particle lands on the floor (`wall = down`), it raises two Room CA channels in its current room — channel 4 by +0.80 and channel 3 by +0.25 — then waits 20 ticks and destroys itself. This is a one-shot mechanism for seeding the mesa ground rooms with starting CA values (replicating the C3 "muck" environmental seeding); once all particles have landed and died, the agents leave no lasting presence, only the CA they deposited.

---

## Removal Script

```
rscr
enum 1 1 150
    kill targ
next
enum 1 1 151
    kill targ
next
enum 1 1 171
    kill targ
next
scrx 1 1 171 6
scrx 1 1 150 1000
scrx 1 1 151 1000
```

Destroys all light emitters, heat emitters and any surviving muck particles, and unregisters their event handlers.

## Impact on Stimulus / Room CA

This script's whole purpose is **Room CA**:

- **Light emitters (1 1 150)** continuously inject into CA channel 1 (light) at controller-driven strengths.
- **Heat emitters (1 1 151)** continuously inject into CA channel 2 (heat).
- **Mesa muck (1 1 171)** performs a one-time deposit into Room CA channels 4 (+0.80) and 3 (+0.25) of each ground room where a particle lands, seeding the mesa's initial environmental gradients before the particles self-destruct.

It emits no creature stimuli directly.
