# Cellular Automata System

The **Cellular Automata (CA) system** simulates 20 environmental properties per room — heat, light, food smells, creature smells, home markers, and so on — and propagates them between rooms through doors and links.

There are **two completely separate update paths**: one for *non-navigable* CAs (per-tick equilibrium + door diffusion) and one for *navigable* CAs (immediate recursive propagation from each emitter). Most of the confusion when debugging the CA system comes from not realising which path applies to which CA index. This article explains both.

---

## The 20 CA Properties

Each room maintains exactly **20 CA values** (`caValues[0..19]`). The names are **not** read from the catalogue at runtime: `CASystem.js` exports `CA_PROPERTY_NAMES` as the single canonical list (with `caPropertyName(i)` and, for anything a person reads, `caDisplayName(i)` — `nornSmell` → `norn smell`), and the debugger, the graph module and the Help Chat's context builder all import it from there. The list is hand-picked to match the C++ `ChemicalNames.catalogue` entries for chemicals 165-184, which are the same twenty channels as the creature smells them — but those entries are inconsistent (channel 11 has no name, 3 and 5 are both "water", 18 and 19 are blank), hence the tidied names below:

| Index | Name | Navigable? |
|-------|------|------------|
| 0 | sound | no |
| 1 | light | no |
| 2 | heat | no |
| 3 | water | no |
| 4 | nutrient | no |
| 5 | water2 | no |
| 6 | protein | **yes** |
| 7 | carbohydrate | **yes** |
| 8 | fat | **yes** |
| 9 | flowers | no |
| 10 | machinery | **yes** |
| 11 | creatureSmell1 | **yes** |
| 12 | nornSmell | **yes** |
| 13 | grendelSmell | **yes** |
| 14 | ettinSmell | **yes** |
| 15 | nornHome | **yes** |
| 16 | grendelHome | **yes** |
| 17 | ettinHome | **yes** |
| 18 | unused18 | **yes** |
| 19 | unused19 | no |

The navigable set is hard-coded as `NAVIGABLE_CA_INDICES = {6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18}` in `CASystem.js:19`, matching the original engine's `IsCANavigable()`.

> **Note:** "Navigable" has nothing to do with whether the CA can flow between rooms. *Both* navigable and non-navigable CAs can spread room-to-room — they just use very different algorithms. See the next section.

---

## Navigable vs Non-Navigable: The Critical Distinction

This is the single most important concept in the CA system.

### Non-navigable CAs — equilibrium model

Non-navigable CAs (sound, light, heat, water, nutrient, flowers, etc.) are updated by a **per-tick equilibrium** loop. Every game tick the system picks one CA index in round-robin order; for that index it:

1. Pulls the room's current value toward an asymptotic target derived from `caInput` (the sum of agent contributions since the last update for this CA), weighted by the room's `gain` (when rising) or `loss` (when falling) rate.
2. Diffuses the resulting temp value through every shared door, weighted by both rooms' `diffusion` rates and the door's `doorage`.
3. Resets `caInput` to 0, ready for the next cycle.

So a non-navigable CA's value is **recomputed every cycle from scratch** out of `(input, gain, loss, diffusion, neighbours)`. If the input dries up, the value decays to 0 over a few cycles. Agents emit non-navigable CAs by adding to `room.caInput` only on the CA's turn in the round-robin (`Agent.js:3584-3589`).

### Navigable CAs — accumulating-delta model

Navigable CAs (proteins, smells, home markers, …) are **never touched** by the per-tick equilibrium loop. `CASystem.updateCurrentCAProperty()` explicitly skips them at line 316:

```js
if (!CASystem.isCANavigable(currentProperty)) {
    // ...full equilibrium pipeline...
}
```

Instead, the value is an **accumulating sum of deltas** pushed in by `alterCAEmission()`. Each navigable-CA emitter calls `setEmission()` once at install time; that call propagates a single delta out from the agent's room, and the resulting value **persists** in every reached room. The agent re-emits **only when it changes room** (`Agent.js:3568`), at which point it subtracts the old delta from the previous room and adds it to the new one.

In other words, the field of navigable-CA values across the world is a **steady-state snapshot of every currently-active emitter**. There is no per-tick decay, no per-tick equilibrium, no `caInput` involvement. If no chain of links/doors connects an emitter to a room, that room's value for that CA is **exactly zero forever**.

### Side-by-side comparison

| Aspect | Non-navigable | Navigable |
|---|---|---|
| Updated each tick? | Yes (round-robin, one CA per tick, every 2 ticks) | No — only when an emitter calls `alterCAEmission` |
| What `caValues[i]` represents | An equilibrium driven by current input | A persistent sum of all reachable emitter contributions |
| How agents emit | `increaseCAInput` adds to `caInput` only on the CA's turn | `alterCAEmission` propagates a one-shot delta on emission start / room change |
| Decays without input? | Yes (governed by `loss`) | No — stays until the emitter stops or moves |
| Diffusion across doors | Per-tick `UpdateDoorCA` two-way mixing | Recursive walk at emission time, attenuated per hop |
| Path metric | One hop per tick (slow spread) | Up to 30 hops in a single recursive walk (`CA_DISTANCE`) |
| Source-room gain matters? | Yes — gates how fast it equilibrates | Yes — multiplies the delta at the source (and **only** there) |
| Destination-room gain matters? | Yes (own equilibrium) | **No** (only diffusion enters the propagation factor) |

---

## Non-Navigable Update Algorithm

`CASystem.updateCurrentCAProperty()` runs once every two game ticks and processes one CA index per call, cycling 0 → 19. For non-navigable indices it executes the original two-phase algorithm faithfully.

### Phase 1 — Room equilibrium

For each room (`CARates.js::UpdateRoomCA`):

```
adjustedInput = 1 - 1 / (caInput + 1)         # asymptotic curve, saturates at 1
rate          = (current > adjustedInput) ? loss : gain
tempValue     = rate * adjustedInput + (1 - rate) * current
caInput       = 0                              # consumed
caValues[i]   = 0                              # reset; rebuilt in phase 3
```

The asymptotic transform means a single agent contribution of `caInput=1` produces an effective target of `0.5`; you need infinite input to ever reach `1.0`. This prevents a single shouting agent from saturating a CA.

### Phase 2 — Door and link diffusion

For each door and each link with two parents (`CASystem.js:350-365`):

```
diffusionRate = sqrt(rates_A.diffusion) * sqrt(rates_B.diffusion)   # geometric mean
average       = (tempA + tempB) / 2
mix           = average * diffusionRate
newA          = doorage_A * (tempA * (1 - diffusionRate) + mix)
newB          = doorage_B * (tempB * (1 - diffusionRate) + mix)
caValues[i]_A += newA
caValues[i]_B += newB
```

Each door redistributes a fraction of both rooms' temp values toward their average, weighted by the door's `doorage` (see [Doorage and Permeability](#doorage-and-permeability)).

### Phase 3 — Final application

After all doors have contributed, each room adds back its own retained share (`CASystem.js:368-371`):

```
caValues[i] += tempValue * (1 - totalDoorage)
```

`totalDoorage` is the sum of all door+link doorages on the room, clamped to `1`. A room with no openings keeps 100% of its temp value; a room with very leaky walls keeps almost none. Combined with phase 2 this gives the room exactly one "unit" of its temp value distributed between itself and its neighbours.

---

## Navigable Update Algorithm — `alterCAEmission`

When an agent starts emitting a navigable CA — or when it walks into a different room while emitting — the engine calls:

```js
caSystem.alterCAEmission(roomId, caIndex, +amount)   // entering / starting
caSystem.alterCAEmission(roomId, caIndex, -amount)   // leaving
```

Implementation (`CASystem.js:105-117`):

```js
alterCAEmission(roomId, caIndex, difference) {
    const room  = this.mapManager.getRoomById(roomId);
    const rates = this.getCARatesForRoom(room, caIndex);
    difference *= rates.getGain();              // (1) source-room gain
    this._alterCAEmissionRecursive(
        room, caIndex,
        difference * CA_MULTIPLIER,             // (2) ×10
        CA_DISTANCE,                            // (3) up to 30 hops
        -1, null
    );
}
```

Three things to notice immediately:

1. **`gain` is read from the source room only** — the room the emitter is sitting in. The destination rooms' gain values are completely ignored.
2. The delta is then multiplied by `CA_MULTIPLIER = 10.0` before being walked outward.
3. Propagation runs to a maximum of `CA_DISTANCE = 30` link/door hops.

### Recursive walk

`_alterCAEmissionRecursive(room, caIndex, difference, distance, fromRoom, fromLink)`:

1. **Deposit:** `room.caValues[caIndex] += difference`.
2. **Phase A — links (manual room-to-room connections):** for each entry in `room.linkCollection` other than the one we came in on, recurse into the other room with
   ```
   difference' = difference * diffusion(here) * diffusion(neighbour) * permeability * 0.01
   ```
3. **Phase B — iterative left walk** along `room.leftNavigableDoor`. Each step multiplies `leftDifference` by `diffusion(here) * diffusion(next) * perm * 0.01` and stops on `perm == 0`, no neighbour, or when `leftDistance` runs out. At each step it also recursively walks any *links* attached to the current "left" room (using the pre-advance rates, matching the original engine).
4. **Phase C — iterative right walk** along `room.rightNavigableDoor`, symmetric to phase B.

> **Critical:** `_alterCAEmissionRecursive` only follows three channels — `linkCollection`, `leftNavigableDoor`, and `rightNavigableDoor`. **Regular doors in `doorCollection` are completely ignored by navigable CA propagation, even at permeability 100.** This matches the original engine exactly: non-navigable diffusion uses `getAllDoors()`, but navigable propagation walks only the horizontal "room chain" through the navigable-door pointers and any explicit links. See [How a door becomes navigable](#how-a-door-becomes-navigable) below.

The full propagation factor along a path is therefore:

```
contributionAtRoomN = amount
                    * gain(sourceRoom)              # source room only
                    * 10                            # CA_MULTIPLIER
                    * Π over each hop (perm/100 * diffusion(prev) * diffusion(next))
```

Notes:

- `perm * 0.01` is the per-hop scaling (permeability is stored as 0–100). It is **not** squared here — that squaring only applies to non-navigable doorage (see below).
- Diffusion is multiplied *raw*, not by its square root, so it attenuates faster than non-navigable diffusion does.
- `_alterCAEmissionRecursive` uses additive deposits (`+=`). When an agent moves rooms, `Agent.handleCA()` first calls the function with `-amount` from the old room and then `+amount` from the new room, so the world state stays consistent.

> **Important runtime detail:** an emitter does **not** push `+amount` every tick. It pushes its delta exactly once at `setEmission` time and again only when it changes room (`Agent.js:3551-3625` — `stateSettingsChange` → `stateStableSettings`). So a navigable-CA value in a room is the algebraic sum of every emitter currently within 30 hops, attenuated by their respective paths. That's why removing or killing every emitter for a CA leaves all reachable rooms at 0 immediately, and why nothing about that value changes between emitter movements.

### How a door becomes navigable

Each room carries two single-pointer fields, `leftNavigableDoor` and `rightNavigableDoor`, in addition to the general-purpose `doorCollection`. These pointers are the *only* doors that navigable CAs can cross — so it matters a lot which of a room's doors get promoted to them, and which don't.

Promotion is performed by `MapManager.calculateNeighbourInformationForRoom()` (`MapManager.js:813-861`, mirroring the original engine). The algorithm walks `room.doorCollection` and applies three filters to each door:

1. **`door.parentCount === 2`** — the door connects exactly two rooms. External edges (`parentCount === 1`) never become navigable.
2. **`door.doorType === 0`** (`DOOR_LEFT_RIGHT`) — the door is a horizontal walking door. Vertical doors, hatches, ladders, and staircases all have other `doorType` values and are never promoted, even if they connect adjacent rooms.
3. **Floor-edge alignment** — the rooms' floor corners must coincide within 2.0 units in both x and y. The exact comparison is *asymmetric* and depends on the door's parent slots:
   - `rightNavigableDoor` is set when `room === parent1` **and** `|room.endFloor − otherRoom.startFloor| < 2.0`.
   - `leftNavigableDoor` is set when `room === parent2` **and** `|room.startFloor − otherRoom.endFloor| < 2.0`.

   (The 2.0-unit tolerance is a JS-side relaxation of the strict `Vector2D` equality in the original engine. Anything the original accepts, JS accepts.)

The two branches above only make sense if the door's parent slots already encode a specific geometric meaning, which is the fourth — implicit — requirement:

#### The parent-ordering convention

> For every shared horizontal door, **`parent1` is the geometrically LEFT room** and **`parent2` is the geometrically RIGHT room**.

This is not a soft suggestion. The promotion check above asks "if I'm `parent1`, does my right floor corner touch the other room's left floor corner?" — which is only a meaningful question when `parent1` is actually the room on the left. If a door has its parents in the wrong slots (e.g. because it was created when the left-side room was added *after* the right-side room and the door-creation pipeline didn't reorder them), the geometry test falls into the wrong branch on both sides and the door silently fails promotion no matter how perfectly its floors line up.

The same convention is required by `CASystem._alterCAEmissionRecursive`, which literally treats `leftDoor.parent1` as "the room to the left" when iterating navigable propagation along the room chain (`CASystem.js:179-180`, matching the original engine).

The JS door-creation pipeline enforces the convention through a dedicated helper `MapManager._orderParentsForSharedDoor(thisRoomId, otherRoomId, edgeType)` (`MapManager.js:~2288`):

```js
if (edgeType === DIRECTION_LEFT || edgeType === DIRECTION_UP) {
    return [otherRoomId, thisRoomId];  // other is to the left/top → other is parent1
}
return [thisRoomId, otherRoomId];      // this is to the left/top → this is parent1
```

It is invoked from the two real shared-door creation sites: `createSharedDoorSegment` (`MapManager.js:2336-2347`) and the overlap-segment branch of `getOverlapInformation` (`MapManager.js:~2887`). Mirrors the original engine's `Map.AddRoomEdge`, which has the same branching inline.

(External / unshared doors use a different JS-internal convention `parent1 = room.id, parent2 = -1` regardless of direction. This is harmless because external doors fail filter #1 and are never inspected for navigability. If an external door is later upgraded to shared by `getOverlapInformation`, its parent slots are overwritten through the helper, so the unshared convention never leaks into a shared door.)

#### Floor-chain visualisation

```
   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
   │     Room A     │ │     Room B     │ │     Room C     │
   │                │ │                │ │                │
   │ floor ........ │ │ floor ........ │ │ floor ........ │
   │ ........A.endFloor==B.startFloor.....B.endFloor==C.startFloor.....
   └────────────────┘ └────────────────┘ └────────────────┘
              ▲                  ▲                  ▲
              │                  │                  │
       Door A↔B is        Door B↔C is         end of chain:
       parent1=A          parent1=B           C.rightNavigableDoor
       parent2=B          parent2=C           is null (no neighbour)
       so:                so:
       A.rightNav = door  B.rightNav = door
       B.leftNav  = door  C.leftNav  = door

     CA15 emitted in B walks both ways along this chain.
     A door joining B to a room *above* B (different floor chain)
     is in B.doorCollection but is NOT a navigableDoor —
     navigable CAs cannot cross it.
```

#### Refresh after `addRoom`

`calculateNeighbourInformationForRoom` is called on the newly-added room from inside `MapManager.addRoom`. But that's not enough on its own: when a new room overlaps an existing room's external door, the existing door is **mutated in place** to become a shared door, and *the existing room's* navigable pointers were computed back when its door was still external (and was rejected by filter #1). Without an explicit refresh, the existing room would never re-see the upgraded connection — it would stay half-wired forever, and navigable CAs from the old room into the new one would never propagate.

`MapManager.refreshNavigableInfoForNeighbours(room)` (`MapManager.js:292-312`) closes this loop. After `addRoom` finishes building the new room, it walks the new room's horizontal shared doors, dedupes the other-room ids, and re-runs `calculateNeighbourInformationForRoom` on each affected sibling. Mirrors the explicit left/right neighbour refresh loops in the original engine.

#### Consequences worth knowing

- **At most one door in each direction can be navigable.** If a room had two horizontal floor-aligned doors meeting the test on its right side, the last one inspected would win. In practice rooms in C3 have at most one horizontal neighbour per side, so this rarely matters — but if you author maps with branching floor chains, only one branch will carry navigable CAs.
- **A room at the end of its chain has only one navigable-door pointer set.** That's normal. The other side stays `null`.
- **Manual links bypass the navigable-door restriction.** If you need a navigable CA to flow across a non-floor-aligned connection (a teleporter, a vehicle dock, a vertical shaft between two metarooms), create a `LINK` between the rooms. Links live in `room.linkCollection`, are walked by phase A of the recursive walk, and don't care about floor geometry — only about the link's own `permeability` and the two rooms' diffusion rates.
- **Doors that fail all three filters are still useful for non-navigable CAs.** They live in `doorCollection`, get a doorage computed in `preCalculateAllDoorages`, and participate in the per-tick equilibrium pipeline for sound, light, heat, water, etc. They just don't carry proteins, smells, or home markers.

#### Deserialisation fallback

`MapManager.js:~7262` provides a fallback recompute when restoring rooms from a saved world, in case the navigable-door references didn't deserialise cleanly:

```js
if ((!room.leftNavigableDoor || !room.rightNavigableDoor) && room.doorCollection?.length > 0) {
    this.calculateNeighbourInformationForRoom(room);
}
```

The condition fires if *either* pointer is missing — not only when both are missing — so a half-restored room with one resolved id and one unresolved id still gets repaired. (An older form of this guard tested `&&` instead of `||` and silently skipped recompute on partially-wired rooms; that latent bug has been corrected.)

For the room-side perspective on construction order, the parent-ordering helper, and the original-engine correspondence, see [Rooms — Construction, Geometry, and System Integration](#/article/rooms).

---

## CA Rates

Each combination of **room type** (0–15) and **CA property** (0–19) has a `CARates(gain, loss, diffusion)` triple. Rates are stored in `CASystem.myCARates[roomType][caProperty]`.

```js
class CARates {
    myGain          // rate of rise toward target  (0–1)
    myLoss          // rate of fall toward target  (0–1)
    myDiffusion     // raw diffusion strength      (0–1)
    myDiffusionRoot // sqrt(diffusion), cached     (used by non-navigable Phase 2)
}
```

### Defaults are zero

`CASystem.js:68` and `:272` initialise every rate to **`CARates(0, 0, 0)`** — matching the original engine, which has no built-in defaults at all (`CARates.js:135-139`). Rates only become non-zero when bootstrap CAOS scripts run `RATE` commands at world install time. **A room type that no `RATE` command has touched cannot accumulate, equilibrate, or propagate any CA at all.**

This is the most common cause of "my CA is silently zero" bugs — see [Debugging](#debugging-zero-values).

### Setting rates from CAOS

```caos
* RATE room_type ca_index gain loss diffusion
rate 5 15 0.915 0.915 0.915     * Norn-home rates for "norn terrarium" room type
```

`RATE` with no arguments after `ca_index` is a *getter* and returns `gain loss diffusion` packed into a single value.

---

## Doorage and Permeability

Doors and links carry CA between rooms. Their effective conductance is called **doorage** and is computed differently for the two algorithms.

### Door / link permeability

Every door and link has a `permeability` field stored as an integer **0–100**:

| Permeability | Meaning |
|---|---|
| 0 | sealed (no CA crosses) |
| 50 | half-open |
| 100 | fully open |

Permeability is set by the `DOOR` command and may also be modified by gameplay (e.g. an airlock cycling).

### Non-navigable doorage (`preCalculateAllDoorages`, `CASystem.js:453-498`)

For each door/link with two parent rooms:

```
normPerm = permeability / 100
doorage  = length * normPerm²              # squared on purpose
doorage_A = doorage / room_A.perimeterLength
doorage_B = doorage / room_B.perimeterLength
```

A room's `caTotalDoorage` is the sum over all attached doors and links of *its* side's doorage, clamped to `1`. This is what gets used by Phase 2's `doorage_A * …` weighting and Phase 3's `(1 - totalDoorage)` retention term.

The `normPerm²` squaring (matching the original engine) means halving permeability quarters the effective opening. Practical effect:

| `permeability` | Effective conductance |
|---|---|
| 0   | 0 % |
| 25  | 6.25 % |
| 50  | 25 % |
| 75  | 56.25 % |
| 100 | 100 % |

### Navigable doorage

`alterCAEmission` does **not** use the cached `doorage` values at all. It uses raw `permeability * 0.01` (no squaring), multiplied by the diffusion of both endpoint rooms. For a single hop:

```
hopFactor = (perm / 100) * diffusion(prev) * diffusion(next)
```

So navigable propagation is more sensitive to a door being slightly closed than non-navigable diffusion is, but it does *not* care about door length or room perimeter.

---

## Agent CA Emission

```js
{
    myCAIndex:              -1 to 19,    // CA to emit, -1 disables
    myCAIncrease:           float,        // amount per emission
    myCAIsNavigable:        boolean,      // cached from CASystem.isCANavigable
    myCAProcessingState:    'stateNotProcessing'
                          | 'stateSettingsChange'
                          | 'stateStableSettings',
    myPrevRoomWhenEmitting: -1            // last room we deposited into (navigable)
}
```

### State machine (`Agent.js::handleCA`)

```
                    EMIT command
NotProcessing ────────────────────► SettingsChange
     ▲                                    │
     │                                    │ (apply on next handleCA)
     │ EMIT -1                            ▼
     └─────────────────────────────  StableSettings
                                          │
                                          │ navigable + room changed:
                                          │   alterCAEmission(prevRoom, -delta)
                                          │   alterCAEmission(newRoom,  +delta)
                                          │
                                          │ non-navigable, on this CA's turn:
                                          ▼   increaseCAInput(room, delta)
```

Two important behavioural notes:

- **Navigable emission is event-driven** (install / room change / disable), not per-tick.
- **Non-navigable emission is round-robin**: an agent only deposits on the tick when the CA system is processing *its* CA (`CASystem.getCAIndex() === myCAIndex`, `Agent.js:3584`). Off-cycle ticks do nothing. This is why the per-cycle equilibrium math uses `caInput` directly — exactly one deposit happens between resets.

### EMIT command

```caos
emit 12 0.5    * start emitting nornSmell at 0.5 per emission cycle
emit -1 0      * stop emitting
```

---

## Smell Perception

Smells reach the brain via `SensoryFaculty.updateSmellLobe()` (`SensoryFaculty.js:362-403`), which reads the current room's `caValues` and runs each through `SmellCategoryMapper.getCategoryIdFromSmellId()` to translate it into a brain category, then writes it into the smell lobe via `brain.setInput('smel', categoryId, value)`.

The default mapping (`SmellCategoryMapper.js`) for the home/creature smells is:

| CA index | CA name | Smell category |
|---|---|---|
| 12 | nornSmell | 36 |
| 13 | grendelSmell | 37 |
| 14 | ettinSmell | 38 |
| 15 | nornHome | 30 |
| 16 | grendelHome | 31 |
| 17 | ettinHome | 32 |

The genome-defined `smel → stim` tract then carries those activations into the matching `stim` lobe neurons. There is **no engine code anywhere that writes `stim[30..32]` directly** — the entire "I am at a home" perception is a chain of: bootstrap-spawned emitter agents → navigable CA propagation → smell lobe → genome tract → stim lobe.

---

## Debugging Zero Values

When a navigable-CA value in a room is unexpectedly `0`, work through the chain in this order:

1. **Are there any emitters at all for this CA?** Most navigable CAs are populated by bootstrap-spawned emitter agents (e.g. `Assets/Bootstrap/001 World/Home smell emitters.cos` for CA 15/16/17). Verify the bootstrap script ran and the emitter agents still exist.
2. **What is the source room's `gain` for this CA?** `alterCAEmission` multiplies the delta by `gain(sourceRoom)` *first*. If the room type at the emitter's coordinates has no `RATE` line covering this CA, gain is `0` and the delta is annihilated before propagation starts. **This is the most common cause.**
3. **What is the source room's own `caValues[i]`?** The emitter deposits into its own room first, so the source room should be the highest reading anywhere. If it's `0` too, propagation never started — fix step 2 or check that the emitter agent is actually placed in a valid room (`getRoomID() !== -1`).
4. **Is there a path of links / navigable doors from the source to your destination?** Walk it in the map debugger. Watch for any `permeability == 0` (closed door / link) — that breaks the chain. The walk only follows `linkCollection`, `leftNavigableDoor`, and `rightNavigableDoor`; doors that live only in `doorCollection` are **not** used by navigable CAs.
5. **Are the doors along the path actually promoted to navigable doors?** This is the trap. A door joining the source room to the next one over may sit in `doorCollection` with `permeability=100` and *still* not carry CA15 because it was never promoted to `leftNavigableDoor` / `rightNavigableDoor`. Check both sides of the door using the Map debugger's **Navigable** row, which surfaces the result and the rejection reason in one click:
   - **Green "Yes — leftNavigableDoor → Room N" / "rightNavigableDoor → Room N"** on both sides → the door is fully promoted, propagation will cross it.
   - **Red "No"** with a tooltip explaining the rejection — one of `external edge (parentCount=1)`, `doorType=N (not LEFT_RIGHT)`, or `floor endpoints do not match`. The first two mean the door is structurally ineligible; the third usually means the rooms genuinely aren't floor-aligned. In all three cases the fix is content: either correct the geometry, or add a `LINK` between the rooms — see [How a door becomes navigable](#how-a-door-becomes-navigable).
   - **Orange "⚠ asymmetric"** → promoted on one side but not the other. In a freshly-built world this should be impossible because `MapManager.refreshNavigableInfoForNeighbours` reruns the promotion check on every sibling whose door was just upgraded. If you see it, either the world was loaded from a save predating the fix, or some manual code path bypasses `addRoom` and forgets to call the refresh. Force-reloading the world or calling `MapManager.calculateNeighbourInformationForRoom` on the half-wired side fixes it.
6. **Does any room along the path have `diffusion == 0` for this CA?** Because the per-hop factor is `perm/100 × diffusion(prev) × diffusion(next)`, a single zero cancels everything downstream. Again, this is usually a missing `RATE` line for that room type.
7. **Is the path longer than 30 hops?** `CA_DISTANCE = 30` is a hard cap.
8. **Could attenuation have rounded the value to display-zero?** With permeability 100 and diffusion ~0.9 each side, each hop is ~`0.81×`, so 30 hops still leaves ~0.2% of source intensity. With permeability 30 and diffusion 0.5 each side, each hop is ~`0.075×` and a handful of hops kills the signal entirely.

For non-navigable CAs the questions are different: check `caInput`, both rooms' `gain`/`loss`/`diffusion`, and confirm the agent actually got its turn in the round-robin (i.e. that the agent has been alive for at least 20 ticks / one full cycle).

---

## CAOS Commands Reference

| Command | Syntax | Description |
|---|---|---|
| `EMIT` | `emit ca_index amount` | Target agent emits CA (state machine above) |
| `PROP` | `prop room_id ca_index` | Read a room's `caValues[ca_index]` |
| `ALTR` | `altr room_id ca_index delta` | Add `delta` to a room's CA value (raw, no propagation) |
| `RATE` | `rate type ca gain loss diff` | Set or get a (`roomType`, `caIndex`) rate triple |
| `SMAP` | `smap ca family genus species` | Map a CA to a smell category by classifier |
| `RTYP` | `rtyp room_id [type]` | Get / set room type (selects which `CARates` row applies) |
| `DOOR` | `door r1 r2 [perm]` | Get / set door permeability between two rooms |

---

## System Constants

```
CA_PROPERTY_COUNT = 20      // CASystem.js:46
ROOM_TYPE_COUNT   = 16      // CASystem.js:47
CA_MULTIPLIER     = 10.0    // CASystem.js:22  (navigable propagation amplifier)
CA_DISTANCE       = 30      // CASystem.js:25  (max recursive hops)
NAVIGABLE_CA_INDICES = {6,7,8,10,11,12,13,14,15,16,17,18}   // CASystem.js:19
```

---

## Key Files

| File | Purpose |
|------|---------|
| `engine/world/CASystem.js` | Both update paths (non-navigable per-tick + navigable recursive) |
| `engine/world/CARates.js` | `CARates`, `UpdateRoomCA`, `UpdateDoorCA` |
| `engine/world/Room.js` | `caValues`, `caInput`, `caTotalDoorage`, history arrays |
| `engine/world/SmellCategoryMapper.js` | CA index → smell category translation |
| `engine/agents/Agent.js` | `setEmission`, `handleCA`, `alterCAEmission` wrapper, room-change tracking |
| `engine/caos/commands/map/EMIT.js` | `EMIT` CAOS command |
| `engine/caos/commands/map/RATE.js` | `RATE` CAOS command |
| `engine/caos/commands/map/SMAP.js` | `SMAP` CAOS command |

---

## Related Articles

- [World Map System](#/article/world-map-system) — rooms, doors, links, permeability
- [Stimulus Lobe Architecture](#/article/stimulus-lobe-architecture) — how smells become stim neurons
- [Creature Perception](#/article/creature-perception) — how creatures read CAs
