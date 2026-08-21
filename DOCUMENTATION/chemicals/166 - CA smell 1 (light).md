# 166 - CA smell 1 (light)

Chemical 166 is the second of the **twenty "CA smell" chemicals** (chem 165 … chem 184) that act as the creature's *internal copy* of the environment's cellular-automata channels. Each room in the map carries `CA_PROPERTY_COUNT = 20` scalar values (the "CA properties") that diffuse between rooms through doors; every SensoryFaculty tick the creature looks up its own room, reads CA property `i`, and writes that float directly into biochem chemical `FIRST_SMELL_CHEMICAL + i` (= 165 + i). Chem 166 is therefore the bloodstream mirror of **CA index 1**, which the engine's canonical naming table labels `"light"` (`CASystem.js:31-36`, matching the original `ChemicalNames.catalogue`).

Unlike CA 0 (sound), which is left as a blank reserved channel, **CA 1 (light) is one of the most heavily-used CA channels in the standard C3 world**. It models ambient illumination: how bright a given room is, given its distance (through the room graph) from the nearest light source. Bootstrap scripts attach `emit 1 <intensity>` scripts to light-emitter agents (sun emitters on the surface, Ettin-area bioluminescence, Grendel-area fires, the volcano), plants and animals read the local value via `prop room targ 1` to decide whether to grow, flower, bloom, or wake, and the value diffuses freely through every room type in the map.

At the creature's own chemistry level, however, chem 166 is still a **reserved blank**. The SensoryFaculty writes it every tick, but no standard genome has a receptor for it and no `CACL` line maps CA 1 to a smell-lobe classifier. The dichotomy is the key to this chemical: CA 1 is an **authored-world signal** (plants and scripts use it extensively), whereas chem 166 is the **biochem copy of that signal** — always populated, queryable from CAOS on the creature (`chem TARG 166`), but not wired into creature cognition by default.

Its only guaranteed runtime behaviours are: (a) being overwritten each tick with the current room's CA 1 value while the creature stands inside any valid room, and (b) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms (the `GetRoomIDForPoint` guard fails, so the SetChemical overwrite is skipped and only the normal chemical decay runs).

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 1** | — (hard-coded in engine) | `SensoryFaculty::Update` | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 1, smellValue)` → `Biochemistry::SetChemical(166, smellValue)` | Per tick — direct assignment (not additive), so the value tracks the local room's CA 1 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 166 <amount>` writes directly to the biochemistry. Effect is overwritten on the next sensory tick if the creature is inside a room, so it is only persistent when the creature is roomless | Author-defined |
| 3 | **Ingestion of agents containing chem 166** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 166 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

The room-side CA 1 value that feeds source (1) is produced by several standard bootstrap mechanisms:

- **Sun / daylight emitters** (`light & heat emitters NT.cos`): the Norn-terrarium surface has a chain of invisible `simp 1 1 12` agents placed along the ceiling at roughly 200-pixel intervals, each running the script `scrp 1 1 12 1000 → emit 1 _p1_`. The overlying day/night controller sends a `mesg writ` with `_p1_` set to the current solar intensity, which these agents then translate into a per-tick CA 1 contribution to whatever room they are standing in. This is the primary light source for the Norn terrarium.
- **Ettin-area emitters** (`Ettin area environment.cos:237-239`): the same `emit 1 _p1_` pattern on the 1 1 41 family, used for the glow of the Ettin desert sun.
- **Grendel-area emitters** (`Grendel Area environment.cos:354`): fires and heat sources in the Grendel jungle contribute to local light via the same script idiom.
- **Volcano** (`volcano.cos:14`): a permanent `emit 1 1` hot spot that bathes the volcano chamber in CA 1 regardless of day/night.
- **`ALTR` CAOS command**: one-shot writes to a specific room's CA 1 — allowed because CA 1 is not in the navigable set `{6,7,8,10-18}`. Used by scripted events and the map debugger.

From there CA 1 diffuses between rooms every two game ticks through the standard two-phase CA update (`CASystem`). The `!map.cos` bootstrap configures **identical rates for CA 1 across every single room type** (`rate <roomType> 1 1.0 0.001 1.0` for room types 0-15):

| Room type | gain | loss | diffusion | Behaviour for CA 1 |
|-----------|------|------|-----------|--------------------|
| 0-15 (all) | 1.0 | 0.001 | 1.0 | Full reception, 0.1 % per-tick loss, full spread to neighbours |

The uniform configuration is physically sensible — light propagates through every type of environment (air, water, caves, indoor spaces) — but with a small non-zero **loss** (0.001) that gradually attenuates the signal the further it travels from the emitter. This is the single most important property difference with CA 0 (sound), which has a binary "full propagation / dead channel" split. For CA 1, all rooms are "lit" rooms, but distant rooms end up dimmer because of cumulative loss across the diffusion hops.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails the SensoryFaculty overwrite is skipped, so the chemical simply decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 2 | **Smell-lobe neuron write** (catalytic — reads CA 1, not chem 166) | — (hard-coded) | `brain->SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager::GetCategoryIdFromSmellId(1)` | The smell lobe has 40 neurons (`brain-architecture.json` lobe index 14). For CA index `i` the brain neuron is chosen by the classifier-to-CA mapping set via the `CACL` CAOS command | In the default bootstrap (`z_agent smells.cos`) **no `cacl … 1` line exists**, so `ourCategoryIdsForSmellIds[1]` stays at its initialised `-1` value. `SetInput("smel", -1, …)` is a no-op, so light produces no smell-lobe activation by default |
| 3 | **Plant and animal agent behaviour** (reads CA 1, not chem 166) | — | — | `setv va01 prop room targ 1` and `doif prop room targ 1 … <threshold>` | Agents compare the room's CA 1 directly to thresholds. See the "Non-creature consumers" section below for specific examples |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 166 | Threshold / gain / locus author-defined | Breeders / genome hackers can add receptors that read chem 166 to give creatures a photosensitive response. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter touches chemical 166 in the standard C3 genome.** Searching `biochemistry.json` for references to chemical id 166 returns only the `decays` entry (the half-life table); coincidental uses of `166` elsewhere (`geneId`, `threshold`, etc.) refer to different fields.

## Role in Game Mechanics

### CA 1 is a *world-level* light model, chem 166 is a *creature-level* sensor

The crucial distinction with CA 0 (sound) is that CA 1 is **actually used** by the game world. The CA 1 → chem 166 mirroring loop is the same for every CA channel, but CA 1 has a rich ecology of emitters and consumers around it, even though the creature's biochemistry and brain remain oblivious to the chemical 166 copy.

```
  Sun / Volcano / Heat emitters (EMIT 1 <intensity>)
         │
         ▼
  Map room CA[1]  ←──── diffuses freely through all room types
         │                (rate 1.0, loss 0.001, diff 1.0)
         │
         ├─────► Agent scripts (plants, animals) read via PROP ROOM TARG 1
         │
         │
         │  SensoryFaculty.Update() every tick
         ▼
  chem 166 (creature bloodstream) ──► receptors?  → NONE in default genome
                                  ──► reactions?  → NONE in default genome

  (Parallel path, same loop)
         │
         ▼
  brain "smel" neuron AgentManager.GetCategoryIdFromSmellId(1)
         → -1 by default (no cacl for CA 1)
         → no brain-level reaction to light
```

Two parallel observation channels thus exist for the world's illumination state: the *agent-script* channel (`PROP`), which is heavily used, and the *biochem* channel (`chem 166`), which is fully populated but not consumed by the standard genome.

### The light emitter script pattern

The bootstrap uses a consistent idiom to turn any agent into a "light source":

```
scrp 1 1 12 1000
    emit 1 _p1_
endm
```

Event `1000` is a user-defined "write" event. Other bootstrap code (typically a day/night controller or a time-of-day tick) calls `mesg writ <agent> 1000 <intensity>` which ends up invoking this script with `_p1_ = intensity`. `emit 1 _p1_` then makes the agent contribute that intensity to CA 1 of whichever room it happens to occupy, every tick, until reset with another `writ`. This lets a single controller scale the intensity of all Norn-terrarium light emitters up and down in lockstep to produce a day/night cycle, while the map's diffusion machinery spreads the result through connected rooms.

The volcano variant (`emit 1 1` called once at placement, with no subsequent `writ`) is a constant low-level light: it emits intensity 1.0 per tick forever without script intervention, producing a permanently-lit hot spot.

### Non-creature consumers of CA 1

Unlike CA 0, CA 1 has a rich population of agent consumers that query it directly from script via `prop room targ 1`. A partial tour:

- **Plants that need light to grow / flower** (`PLANT MODEL - foxglove plant.cos:293`, `grass.cos:410`, `PLANT MODEL - foxglove Seed.cos:53`): foxglove and grass sample the local CA 1 and compare it to per-instance thresholds stored in `ov80` / `ov81`; outside the acceptable range the plant halts growth or fails to germinate. This is the closest the game gets to modelling photosynthesis.
- **Plants that only bloom in bright light** (`cacbana.cos:332, 369`): the banana-cactus uses `doif prop room targ 1 le 0.4` / `gt 0.4` branches to choose between dormant and flowering states.
- **Fungi (negative light preference)** (`fungi.cos:72`): the fungus runs `doif prop room targ 1 le ov80` to check that the room is *dark enough* before it will spread — a nice inversion of the plant pattern.
- **Day/night-sensitive animals** (`Robin2.cos:201-214`, `Hummingbird.cos:176-188`): the Robin and Hummingbird both test against a 0.25 / 0.5 threshold respectively to decide between "roost / sleep" and "fly / feed" behaviours. As CA 1 falls across the map at nightfall (the sun emitters receive a `writ` with a lower `_p1_`), these agents transition to their night scripts automatically, world-wide.

The creature does **not** participate in this ecology — creatures cannot "read" light through their brain (no CACL) or their bloodstream chemistry (no receptor), and there is no plant gene that responds to chem 166. A Norn blundering into a pitch-black room does not sleep or flinch by virtue of the light level; it simply goes about its business, oblivious to the world-level illumination signal that is steering every plant and bird around it. The only genome-visible trace of light in C3 creatures is the day/night cycle's separate effect on sleep chemistry (which is driven by engine time, not by CA 1).

### Inside-room vs outside-room behaviour

The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check is the single line that decides whether the creature's chem 166 tracks the world or decays on its own:

- **Inside any room.** Chem 166 is overwritten every sensory tick with the room's live CA 1 value. The 1241-tick half-life is moot. A creature standing next to a sun emitter sees chem 166 rise to the emitter's intensity within a few ticks of arrival; as it walks into deeper, less-lit corners of the map, chem 166 falls in lockstep with the diffusion gradient (with one-tick lag).
- **Outside all rooms** (e.g. mid-air during a fall with no room below the down-foot position, or in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 166 follows pure first-order decay at rate 0.99944177 per tick. A creature that briefly leaves all rooms with chem 166 = 1.0 will still have ~0.5 after 1241 ticks, ~0.25 after 2482 ticks, and so on.

Because CA 1 is authored to reach meaningful values (~0.1-1.0) across most of the populated map, chem 166 on a Norn in normal play almost always tracks a non-zero live world value rather than decaying; the decay regime matters only during roomless edge cases.

### The `-MyContribution` subtraction and why CA 1 skips it

For CA indices that *are* bound to the creature's own category (e.g. a Norn looking at CA 12 = Norn smell), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. This prevents a Norn from "smelling itself" in the brain and mistakenly perceiving the Norn-smell concept as present wherever it goes. For CA 1 this branch is never taken (creatures do not emit CA 1), so the full room value is what flows into chem 166. If a future author were to attach an `EMIT 1` script to the creature itself (e.g. a glowing Grendel), both chem 166 and the room's published CA 1 value would include that emission.

### Practical consequences

- **`chem TARG 166` is a live ambient-light sensor.** A CAOS script querying chem 166 on a creature reads the current room's CA 1 value (with one-tick lag). This is a convenient way for scripts *attached to creatures* to know how bright the creature's current location is without needing a separate `PROP` call — and it works even if the creature moves across rooms during the script.
- **Flooding chem 166 via `chem 166 255` has no behavioural effect on a standard creature.** No receptor reads it, no reaction consumes it, and the SensoryFaculty overwrites it on the next tick if the creature is in a room. The stim-chemical offset (`STIMTOBIOCHEMOFFSET = 148`) maps chem 166 to stim chemical 18, but no stim gene in the standard genome targets stim chemical 18 either.
- **Adding a "photosensitive" Norn variant is a single-gene change.** Because no existing receptor or reaction uses chem 166, a breeder can safely add one receptor locus against chem 166 (e.g. `Drive: Tiredness + Chemical 166 (light) → analgesic effect`) to model photophobia or photophilia without any risk of interfering with existing chemistry. The `CHEM` command, or an always-on sensory overwrite, guarantees the receptor sees live data.
- **Day/night cycle is an emitter-side property, not a sensory one.** A creature's sleep-wake behaviour in the standard genome is driven by the engine's time-of-day mechanism and sleep-toxin chemistry (chem 71), *not* by CA 1 or chem 166. The visual dimming of the world at night is a separate rendering effect, also independent of this chemistry.
- **Breeding out the sensory pathway is not possible.** Because the per-tick SetChemical is engine-hard-coded (not a gene), no genetic mutation can stop chem 166 from tracking room CA 1. The only way to make chem 166 "do nothing" is to leave no receptor hooked to it — which is already the default state.

### Summary

CA smell 1 (light) is the bloodstream mirror of map CA index 1, the illumination channel. The world-level half of the pipeline is heavily developed — sun emitters, volcano glow, bioluminescence, plants that grow only in bright rooms, nocturnal animals that sleep when their room goes dark — all riding on `EMIT 1` / `PROP ROOM TARG 1` and the uniform diffusion rates in `!map.cos`. The creature-level half, however, stops at the biochem copy: chem 166 is faithfully updated every tick but no standard gene consumes it and no `CACL` line routes it into the smell lobe, so creatures remain blind to the world's light level at both the brain and the chemistry layer. In a default, unmodified world running a default genome, chem 166 is therefore a **quiet observer of a busy world** — it watches the illumination gradient move across the map as day turns to night and as the creature walks through it, but nothing in the standard chemistry acts on what it sees. Its value becomes behaviourally meaningful only when an author adds a receptor gene or a script that queries the chemical directly.
