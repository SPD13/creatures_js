# Air and Breathing: How Creatures Suffocate

Air is one of the simplest environmental inputs in the engine, but also one of the most lethal. Unlike temperature or light, air quality is not a cellular‑automata (CA) property that diffuses across rooms, and no agent in the world produces or consumes it. It is a **binary, per‑tick geometric test**: a creature either has air at its head, or it does not. If it does not, the biochemistry pipeline turns that into a drowning chemical, and the drowning chemical eventually kills the creature.

This article explains the full chain: what drives air quality, how it is measured each tick, how it connects to the **Air** chemical (#29) through receptors and emitters, and what happens when it reaches zero.

## Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       AIR / DROWNING PIPELINE                            │
│                                                                          │
│  1. GEOMETRIC TEST (every creature tick)                                 │
│     head center point → mapManager.getRoomIDForPoint(x, y)               │
│     is the head's room type WATER (8 or 9)?                              │
│          │                                                               │
│          ▼                                                               │
│  2. AIR QUALITY LOCUS SET                                                │
│     creature.myAirQualityLocus = 0.0 (underwater) or 1.0 (breathable)    │
│     Sensorimotor locus LOC_AIRQUALITY = 9                                │
│          │                                                               │
│          ▼                                                               │
│  3. EMITTERS READ THE LOCUS                                              │
│     Emitter genes bound to LOC_AIRQUALITY produce chemicals into         │
│     the bloodstream — typically a "drowning" / stress chemical when      │
│     the locus is low, and chemical 29 (Air) when it is high              │
│          │                                                               │
│          ▼                                                               │
│  4. RECEPTORS TURN CHEMICALS INTO DRIVES / REFLEXES                      │
│     Drowning chemical → panic / stress drive, Die reflex trigger         │
│     Chemical 29 depletion → life‑support failure over time               │
│          │                                                               │
│          ▼                                                               │
│  5. DEATH                                                                │
│     LifeFaculty transitions myState → deadState when life chemistry      │
│     collapses (drowning chemical saturates, Air chemical depletes)       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## What drives air quality

Air quality is **purely a function of room type at the head position**. There is:

- **No CA channel for air.** The `MapManager` CA system carries 20 channels (sound, light, heat, water, nutrients, protein/carbohydrate/fat, flowers, machinery, creature smells, homes, etc.) but **none of them is air**. See `CASystem.js` (`CA_PROPERTY_NAMES`).
- **No air‑producing or air‑consuming agent.** No plant, vent, or machinery in the bootstrap scripts adds or removes air. The original engine behaves the same way.
- **No gradient or diffusion.** Air does not "run out" in a closed room. A creature standing in an ordinary room always reads 1.0, forever.

Air is therefore entirely defined by the metaroom layout: which rooms the level designer marked as water.

### Water room types

Two room types are treated as water (and therefore "no air") by the creature's head test:

| Room Type | Constant              | Meaning                 |
|-----------|-----------------------|-------------------------|
| `8`       | `WATER_ROOM_TYPE_1`   | Water (primary)         |
| `9`       | `WATER_ROOM_TYPE_2`   | Water (secondary)       |

Defined in `Rebuild/Main_Game/src/engine/creature/Creature.js:89-90`, matching the constants used by the original engine.

Any other room type — including rooms with CA water content, soggy ground, or weather — is considered **breathable**. Only the room *type* enum matters for this check; the CA water channel does not influence air quality at all.

## How air quality is measured each tick

The check runs every creature tick from `Creature.updateEnvironmentalLoci()` (`Creature.js:446`), which is called from the main creature update after faculty updates (`Creature.js:427`).

```javascript
// Rebuild/Main_Game/src/engine/creature/Creature.js:446-482
updateEnvironmentalLoci() {
    // Reset to defaults
    this.myAirQualityLocus = 1.0;  // Breathable by default
    this.myCrowdedLocus = 0.0;

    if (!this.world || !this.world.mapManager) {
        return;
    }

    // ===== AIR QUALITY CHECK (check HEAD position) =====
    const headPosition = this.getHeadCenterPoint();
    let headRoomId = -1;

    if (this.world.mapManager.getRoomIDForPoint) {
        headRoomId = this.world.mapManager.getRoomIDForPoint(
            headPosition.x, headPosition.y);
    } else {
        headRoomId = this.myCurrentRoom;  // fallback
    }

    if (headRoomId !== -1) {
        const headRoom = this.world.mapManager.getRoomById(headRoomId);
        if (headRoom) {
            if (headRoom.type === WATER_ROOM_TYPE_1 ||
                headRoom.type === WATER_ROOM_TYPE_2) {
                this.myAirQualityLocus = 0.0;  // Drowning!
            }
        }
    }
    // ... crowdedness check follows
}
```

### What is measured — the head, not the body

Only the **head** matters. The original engine (and the rebuild, faithfully) uses `myLimbs[BODY_LIMB_HEAD].CentrePoint()` to decide where to sample. This has subtle but important consequences:

- A creature standing on a shoreline with its body on land but its head poked over water will read `myAirQualityLocus = 0.0` and begin drowning.
- A creature fully submerged will drown regardless of body orientation.
- A creature's head briefly clipping into an adjacent water room — even for a single tick — will spike the drowning signal into the bloodstream.

### The fallback when no room is found

If `getRoomIDForPoint()` returns `-1` (the head point is outside any valid room), the code **does not** mark the creature as drowning — `myAirQualityLocus` stays at its default `1.0`. Creatures briefly clipped outside the map are therefore safe from this particular death vector. (They may die from other things — collision, walk‑off physics — but not suffocation.)

## How the locus connects to the Air chemical (#29)

`myAirQualityLocus` is a **sensorimotor locus** with the numeric ID `LOC_AIRQUALITY = 9` (see `BiochemistryConstants.js:97`). It is registered in the locus table (`Creature.js:258`) so that biochemistry genes can bind to it.

There are two gene types that interact with this locus:

### Emitters: locus → chemical

An emitter gene reads a locus each tick and writes its value (scaled by threshold and gain) into a bloodstream chemical. In the standard Norn genome, emitters on `LOC_AIRQUALITY` typically:

- **Invert** the locus: when air quality is **low** (0.0), the emitter produces a high concentration of a **drowning / stress chemical**.
- **Pass through**: when air quality is **high** (1.0), the emitter maintains a healthy level of **chemical 29 (Air / CHEM_AIR)** in the bloodstream.

Chemical 29 is defined in `BiochemistryConstants.js` as `CHEM_AIR`. Chemical 30 is `CHEM_OXYGEN`. The exact wiring (which chemical is emitted, with what threshold and gain) is entirely **genome‑driven** — it is not hard‑coded in the engine.

### Receptors: chemical → drive / locus

Receptors on the resulting chemicals feed drives (panic, stress, suffocation) or directly trigger death reflexes via the `LifeFaculty`. Once the drowning chemical saturates and/or chemical 29 depletes below a threshold receptor, the life‑chemistry cascade ends with:

```
myState → deadState
```

The death cascade runs through `LifeFaculty.setWhetherDead(true)` and the Die script (event 72). See the **Life Faculty** and **Creature Faculties** articles for the full state machine.

## What causes a creature to suffocate

Given the architecture above, a suffocation death can only be caused by one of the following:

1. **The head's room was actually a water room.** The creature walked, fell, or was placed somewhere its head center point resolves to a room whose `type` is 8 or 9. This is the normal, expected case (drowning in the ocean or aquatic metaroom).
2. **The head clipped into an adjacent water room.** Near shorelines, the body can sit in a safe room while the head center (offset upward/forward by the skeleton) pokes into a neighboring water‑typed room. Even one tick of this per game‑second is enough to ramp the drowning chemical up over time.
3. **A metaroom was authored with the wrong room type.** If a designer mistakenly marked an indoor or normal outdoor room as type 8 or 9, every creature entering it will start drowning immediately.
4. **Genome damage / receptor bias.** If a creature's genome has an unusual emitter or receptor on `LOC_AIRQUALITY`, it can self‑inflict the drowning chemical even when the locus is 1.0 — but this is a **genetic** cause, not an environmental one.

**Causes ruled out by the architecture:**

- Air does *not* get "used up" by being in a sealed room.
- Other creatures, plants, machinery, or CAOS scripts do not remove air.
- Weather, smoke, or temperature have no effect on `myAirQualityLocus`.
- The water CA channel (`water`, `water2`) is unrelated — only the room **type** matters.

## Debugging a suspected suffocation

When a creature dies with chemical 29 (Air) near zero and the drowning chemical elevated, work backwards through the pipeline:

1. **Check the head's room at time of death.** If the debugger history is available, look at the creature's last known position and ask `mapManager.getRoomIDForPoint(headX, headY)` for that point. If the room type is 8 or 9, the engine is behaving correctly — the death cause is environmental.
2. **Check the metaroom layout.** Open the metaroom in the map debug tool and visualise room types. Water rooms should be obviously water. If a non‑water area is mis‑typed, fix the metaroom data.
3. **Check the head offset against the body position.** If the body is clearly on land but `getHeadCenterPoint()` returns a point inside a water room, the creature is legitimately "leaning" into water. This is correct behavior but may surprise the player; adjust the shoreline walls or poses to prevent it.
4. **Check the genome.** Use the Genome Viewer to inspect emitters on `LOC_AIRQUALITY` (locus 9) and receptors on chemical 29 and the drowning chemical. Unusual thresholds/gains can cause suffocation symptoms without any environmental cause.

## File references

- `Rebuild/Main_Game/src/engine/creature/Creature.js:89-90` — `WATER_ROOM_TYPE_1`, `WATER_ROOM_TYPE_2`
- `Rebuild/Main_Game/src/engine/creature/Creature.js:123` — `myAirQualityLocus` initialization
- `Rebuild/Main_Game/src/engine/creature/Creature.js:258` — locus registration for gene binding
- `Rebuild/Main_Game/src/engine/creature/Creature.js:427` — `updateEnvironmentalLoci()` call site
- `Rebuild/Main_Game/src/engine/creature/Creature.js:446-482` — air quality measurement
- `Rebuild/Main_Game/src/engine/creature/Creature.js:2370-2417` — serialization of `myAirQualityLocus`
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js:97` — `LOC_AIRQUALITY = 9`

## Related articles

- **Life Faculty** — how the death state machine consumes the drowning signal
- **Drive System: From Chemical to Decision** — the general chemical → locus → drive pipeline that air follows
- **Biochemistry System** — emitter and receptor genes
- **Cellular Automata** — why air is *not* a CA channel, and what the CA channels actually are
- **World Map System** — room types and the metaroom authoring model
