# 167 - CA smell 2 (heat)

Chemical 167 is the third of the **twenty "CA smell" chemicals** (chem 165 … chem 184) that act as the creature's *internal copy* of the environment's cellular-automata channels. Each room in the map carries `CA_PROPERTY_COUNT = 20` scalar values (the "CA properties") that diffuse between rooms through doors; every SensoryFaculty tick the creature looks up its own room, reads CA property `i`, and writes that float directly into biochem chemical `FIRST_SMELL_CHEMICAL + i` (= 165 + i). Chem 167 is therefore the bloodstream mirror of **CA index 2**, which the engine's canonical naming table labels `"heat"` (`CASystem.js:31-36`, matching the original `ChemicalNames.catalogue`).

CA 2 (heat) is an **authored-world thermal signal**: the bootstrap decorates specific rooms and agents with heat sources — the Ettin-area sun, Grendel-area fires, the volcano, Norn-terrarium sun emitters, the hatchery incubator — and plants then sample the local value with `prop room targ 2` to decide whether conditions are warm enough to grow, bloom, germinate, or spread. The critical distinction with CA 1 (light) is the **per-room-type propagation rate**: unlike light, which spreads uniformly through every room type, heat is **blocked entirely** in several room types (water, sea-floor, cold indoor types), producing sharp thermal boundaries at water surfaces and cold-zone walls.

At the creature's own chemistry level, however, chem 167 is still a **reserved blank**. The SensoryFaculty writes it every tick, but no standard genome has a receptor for it and no `CACL` line maps CA 2 to a smell-lobe classifier (`z_agent smells.cos` begins at `cacl 2 8 0 6` — there is no `cacl … 2` line). The Coldness (chem 152) and Hotness (chem 153) drives that *do* govern creature thermal behaviour are driven by separate internal reactions, not by ambient CA 2.

The dichotomy is the key to this chemical: CA 2 is an **authored-world signal** (plants, fires, and volcano scripts use it extensively), whereas chem 167 is the **biochem copy of that signal** — always populated, queryable from CAOS on the creature (`chem TARG 167`), but not wired into creature cognition by default.

Its only guaranteed runtime behaviours are: (a) being overwritten each tick with the current room's CA 2 value while the creature stands inside any valid room, and (b) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms (the `GetRoomIDForPoint` guard fails, so the SetChemical overwrite is skipped and only the normal chemical decay runs).

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 2** | — (hard-coded in engine) | `SensoryFaculty::Update` | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 2, smellValue)` → `Biochemistry::SetChemical(167, smellValue)` | Per tick — direct assignment (not additive), so the value tracks the local room's CA 2 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 167 <amount>` writes directly to the biochemistry. Effect is overwritten on the next sensory tick if the creature is inside a room, so it is only persistent when the creature is roomless | Author-defined |
| 3 | **Ingestion of agents containing chem 167** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 167 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

The room-side CA 2 value that feeds source (1) is produced by a rich set of bootstrap heat emitters — the single largest difference from CA 1 is that heat sources are concentrated in hot zones rather than distributed world-wide:

- **Norn-terrarium sun** (`light & heat emitters NT.cos:234-236`): the same `simp 1 1 12` emitter agents that carry the `scrp 1 1 12 1000 → emit 1 _p1_` light script also carry `scrp 1 1 14 1000 → emit 2 _p1_`. A day/night controller sends `mesg writ <agent> 1000 <intensity>` targeting family 1 1 14, which makes every terrarium sun agent simultaneously translate the solar intensity into a per-tick CA 2 contribution. Daytime warms the Norn terrarium; nightfall removes the contribution.
- **Ettin-area sun** (`Ettin area environment.cos:240-242`): `scrp 1 1 42 1000 → emit 2 _p1_` on the desert sun emitters — identical pattern, scaled to the desert's harsher thermal profile.
- **Grendel-area fires and heat sources** (`Grendel Area environment.cos:355-357`): `scrp 1 1 104 1000 → emit 2 _p1_` for the Grendel jungle's volcanic/thermal features. Both script and steady-state values are authored to produce a hot, humid jungle microclimate.
- **Volcano** (`volcano.cos:14, 19, 222, 231, 257, 294`): the volcano is the most dramatic heat emitter in the world. Two always-on `emit 2 1` pour permanent heat into the volcano chamber, and the eruption scripts toggle `emit 2 ov99` / `emit 2 0` to produce pulses of extra heat during active phases. When an eruption splashes magma into the surrounding room, `altr room targ 2 1` additionally slams the local CA 2 value to 1.0 for an instant heat spike.
- **Hatchery incubator** (`Hatchery2.cos:10, 25`): two `emit 2 0.1` agents inside the hatchery keep the incubation chamber at a low but constant baseline temperature — low enough not to trigger plant-growth thresholds elsewhere, but enough to make the hatchery measurably warmer than ambient unlit rooms.
- **`ALTR` CAOS command**: one-shot additive writes to a specific room's CA 2 — allowed because CA 2 is not in the navigable set `{6,7,8,10-18}`. Used by the volcano eruption (above), scripted events, and the map debugger.

From there CA 2 diffuses between rooms every two game ticks through the standard two-phase CA update (`CASystem`). Unlike CA 1, however, the `!map.cos` bootstrap configures **heterogeneous rates for CA 2 across room types** (`!map.cos:1661-1976`):

| Room type | gain | loss | diffusion | Behaviour for CA 2 |
|-----------|------|------|-----------|--------------------|
| 0 | 0.80 | 0.010 | 0.70 | Air / atmosphere — heat received and spread, but 1 %/tick loss |
| 1 | 0.60 | 0.001 | 0.70 | Attenuated reception, very slow loss — retains heat once warmed |
| 2 | 0.60 | 0.001 | 0.70 | Same as type 1 — thermal inertia profile |
| 3-7 | 0.80 | 0.010 | 0.70 | Standard air-like thermal behaviour (indoor, walkway, soil types) |
| 8 | 0.00 | 0.000 | 0.00 | **Heat dead-zone** — heat does not propagate (water / below-floor) |
| 9 | 0.00 | 0.000 | 0.00 | **Heat dead-zone** — heat blocked |
| 10 | 0.80 | 0.010 | 0.70 | Standard thermal behaviour |
| 11-15 | 0.00 | 0.000 | 0.00 | **Heat dead-zones** — no reception, no diffusion, no loss |

The key physical intuition is: in "air-like" room types (0, 3-7, 10) heat arrives quickly (gain 0.80), bleeds off slowly (loss 0.01 = 1 %/tick), and diffuses 70 % per step — hot spots around emitters but visible gradients away from them. In types 1 and 2, the attenuated gain (0.60) and near-zero loss (0.001) produce **thermal reservoirs**: rooms that warm up slowly but then hold their heat for a long time, useful for thermally stable micro-climates like caves. Room types 8, 9, 11-15 are **completely transparent to heat from the CA perspective** — they have zero gain (do not accept heat from emitters inside them), zero diffusion (do not pass heat to neighbours), and zero loss (the CA value just sits at whatever initial value it had, typically 0). A heat emitter placed inside a water room contributes nothing; a warm air room that borders a water room does not warm the water; a creature standing in a water room reads chem 167 = 0 regardless of the world state around it.

This is the single most important property difference with CA 1 (light) and CA 0 (sound): heat has **real physical geometry** in the world, with sharp thermal boundaries at water lines and cold-zone walls.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails the SensoryFaculty overwrite is skipped, so the chemical simply decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 2 | **Smell-lobe neuron write** (catalytic — reads CA 2, not chem 167) | — (hard-coded) | `brain->SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager::GetCategoryIdFromSmellId(2)` | The smell lobe has 40 neurons (`brain-architecture.json` lobe index 14). For CA index `i` the brain neuron is chosen by the classifier-to-CA mapping set via the `CACL` CAOS command | In the default bootstrap (`z_agent smells.cos`) **no `cacl … 2` line exists**, so `ourCategoryIdsForSmellIds[2]` stays at its initialised `-1` value. `SetInput("smel", -1, …)` is a no-op, so ambient heat produces no smell-lobe activation by default |
| 3 | **Plant and animal agent behaviour** (reads CA 2, not chem 167) | — | — | `setv va02 prop room targ 2` and `doif prop room targ 2 … <threshold>` | Agents compare the room's CA 2 directly to thresholds. See the "Non-creature consumers" section below for specific examples |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 167 | Threshold / gain / locus author-defined | Breeders / genome hackers can add receptors that read chem 167 to give creatures a thermal-skin response. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter touches chemical 167 in the standard C3 genome.** Searching `biochemistry.json` for references to chemical id 167 returns only the `decays` entry (the half-life table); coincidental uses of `167` elsewhere (e.g. receptor `id: 167` at line 6506, whose `chemical` field is `99` — Vitamin C) refer to unrelated records. The standard creature thermal drives, Coldness (chem 152) and Hotness (chem 153), are driven by separate biochem reactions tied to the creature's own internal state, not by the ambient CA 2 → chem 167 loop.

## Role in Game Mechanics

### CA 2 is an *authored thermal map*, chem 167 is a *sampled sensor*

The crucial distinction with CA 1 (light), which propagates uniformly, is that CA 2 has **baked-in thermal geography**: hot zones (volcano chamber, Ettin desert, Grendel jungle, terrarium at noon) are physically separated from cold zones (water, deep underground, unlit indoor) by the zero-rate room types acting as thermal walls. The CA 2 → chem 167 mirroring loop is identical in structure to every other CA channel, but CA 2's rich ecology of emitters, blockers, and consumers makes chem 167 a uniquely information-dense signal — even though the creature's biochemistry and brain remain oblivious to it.

```
  Volcano / Sun / Grendel fires / Ettin sun / Hatchery (EMIT 2 <intensity>)
         │
         ▼
  Map room CA[2]  ←──── diffuses only through "air-like" room types
         │                (0, 3-7, 10: gain 0.8; 1-2: gain 0.6, low loss)
         │             ───BLOCKED at water/cold zones (types 8, 9, 11-15: all zero)
         │
         ├─────► Agent scripts (plants, fungi, tendrils, carrots) read via PROP ROOM TARG 2
         │
         │
         │  SensoryFaculty.Update() every tick
         ▼
  chem 167 (creature bloodstream) ──► receptors?  → NONE in default genome
                                  ──► reactions?  → NONE in default genome

  (Parallel path, same loop)
         │
         ▼
  brain "smel" neuron AgentManager.GetCategoryIdFromSmellId(2)
         → -1 by default (no cacl for CA 2)
         → no brain-level reaction to ambient heat
```

Two parallel observation channels thus exist for the world's thermal state: the *agent-script* channel (`PROP`), which is heavily used, and the *biochem* channel (`chem 167`), which is fully populated but not consumed by the standard genome.

### The heat emitter script pattern

Heat emitters follow the same idiom as light emitters, with the CA index swapped:

```
scrp 1 1 14 1000
    emit 2 _p1_
endm
```

Event `1000` is the shared "write" event. A day/night controller (or a per-event trigger) calls `mesg writ <agent> 1000 <intensity>` which invokes this script with `_p1_ = intensity`. `emit 2 _p1_` then makes the agent contribute that intensity to CA 2 of whichever room it occupies, every tick, until reset with another `writ`. The terrarium thus warms at dawn and cools at dusk in lockstep with the light level, produced by the same messaging mechanism fanning out to paired scripts on the same emitter agents (family 1 1 12 for light, family 1 1 14 for heat in the NT; 1 1 41 and 1 1 42 respectively in the Ettin area; 1 1 103 and 1 1 104 in the Grendel area).

The volcano variant adds a more dynamic pattern (`volcano.cos`): a steady `emit 2 1` maintains a permanent heat core, while eruption scripts layer `emit 2 ov99` (variable eruption intensity) on top, and the explosive splash does a one-shot `altr room targ 2 1` to force an instantaneous heat spike on any room that takes a lava hit. The hatchery, by contrast, uses static `emit 2 0.1` values for a permanent low-level incubation warmth.

### Non-creature consumers of CA 2

CA 2 is the second most consumed CA channel after CA 1 (nutrient/water channels 3-4 are about on par). Plants and ecosystem agents use it heavily to gate growth:

- **Foxglove plants / seeds** (`PLANT MODEL - foxglove plant.cos:295, 366`, `PLANT MODEL - foxglove Seed.cos:59-63`): foxglove pulls `setv va02 prop room targ 2` and compares against per-instance thresholds in `ov82` / `ov83` / `ov84`. Germination is gated on being between `ov84` and `ov83` (a warm-but-not-too-hot band); outside the band, the seed stays dormant. Mature plants use the same thresholds to decide between growth and wilting.
- **Grass / desert grass** (`grass.cos:123-127, 412, 479`, `desert grass.cos:122-126, 410, 481`): identical threshold-band pattern. Desert grass is parameterised with higher `ov82`/`ov83` bounds so that it germinates only in the hot Ettin zone; standard grass germinates in the cooler terrarium.
- **Carrots** (`Carrot.cos:87, 159`): `doif prop room targ 2 gt 0.2 and prop room targ 4 gt 0.3` — a combined warmth + nutrient check. Carrot growth halts below the 0.2 heat floor, making it a seasonal/zonal crop that only thrives in warm rooms.
- **Banana cactus** (`cacbana.cos:44, 137`): `doif prop room targ 2 ge 0.1` — a simple "not too cold" gate. The cactus remains dormant in cold rooms and grows normally once ambient heat passes 0.1.
- **Fungi** (`fungi.cos:76`): `doif prop room targ 2 le ov82` — an inverse pattern. Fungi prefer cool rooms (ambient heat below an author-set threshold). In combination with the same-direction dark preference (`prop room targ 1 le ov80`), fungi end up colonising the cool, dark corners of the map — a plausible biological match.
- **Tendrils** (`tendril.cos:125`): `doif prop room targ 2 le ov82` — same inverse pattern as fungi. Tendrils spread into cooler rooms.
- **Volcano eruption cleanup** (`volcano.cos:222-294`): the magma projectile itself sources heat into whatever room it lands in, then `emit 2 0` resets the contribution when the projectile is destroyed.

The creature does **not** participate in this ecology — creatures cannot "read" heat through their brain (no CACL) or their bloodstream chemistry (no receptor on chem 167). A Norn walking through the volcano chamber feels no chemistry-driven change in behaviour from the ambient heat; conversely, a Norn crossing an ice-cold cold-zone room (CA 2 forced to 0 by the zero-rate room type) feels no chemistry-driven aversion. The creature's thermal drives (Coldness, Hotness) are governed entirely by internal biochem reactions — they track the creature's own body temperature model, not the environment's CA 2 field.

### Inside-room vs outside-room behaviour

The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check is the single line that decides whether the creature's chem 167 tracks the world or decays on its own:

- **Inside any room.** Chem 167 is overwritten every sensory tick with the room's live CA 2 value. The 1241-tick half-life is moot. A creature standing next to the volcano core sees chem 167 climb to the emitted intensity within a few ticks of arrival; walking out into a heat-dead room (type 8/9/11-15) makes chem 167 drop to 0 on the first sensory tick after crossing the door.
- **Outside all rooms** (mid-air during a fall with no room below the down-foot position, or in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 167 follows pure first-order decay at rate 0.99944177 per tick. A creature that briefly leaves all rooms with chem 167 = 1.0 will still have ~0.5 after 1241 ticks, ~0.25 after 2482 ticks, and so on.

Because CA 2 is authored to reach meaningful values (~0.1-1.0) in hot zones but to be zero in cold-zone rooms and water, chem 167 on a Norn in normal play is usually either "tracking a live hot-zone value" or "pinned to ~0 in a cold-zone", not decaying through intermediate values — transitions between the two regimes happen almost instantly via door crossings.

### Why heat has thermal walls but light does not

The design choice in the `!map.cos` rate table is physically suggestive: light propagates through every room type (air, water, caves, indoor) with uniform parameters, whereas heat is explicitly blocked at water (types 8-9) and cold indoor types (11-15). This is an authored simplification rather than a physical simulation — the CA rate table predates the chemicals that might model water convection or wall conduction. The practical consequence for agent authors is that **heat is a locally-bounded signal** suitable for "thermal zone" gating, whereas light is a **globally-decaying gradient** suitable for "distance from light source" gating. Plants that want "warm but not specifically sunny" use CA 2 with sharp thresholds; plants that want "bright but not thermally specific" use CA 1 with decay-scaled thresholds.

### The `-MyContribution` subtraction and why CA 2 skips it

For CA indices that *are* bound to the creature's own category (e.g. a Norn looking at CA 12 = Norn smell), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. This prevents a Norn from "smelling itself" in the brain and mistakenly perceiving the Norn-smell concept as present wherever it goes. For CA 2 this branch is never taken (creatures do not emit CA 2), so the full room value is what flows into chem 167. If a future author were to attach an `EMIT 2` script to the creature itself (e.g. a glowing Grendel that warms its surroundings), both chem 167 and the room's published CA 2 value would include that emission.

### Practical consequences

- **`chem TARG 167` is a live ambient-heat sensor with sharp zone boundaries.** A CAOS script querying chem 167 on a creature reads the current room's CA 2 value (with one-tick lag), and it will be essentially 0 in water/cold rooms and a gradient value (0.1-1.0) in warm rooms. This is more selective than CA 1 because of the room-type blocking — it gives a "which biome am I in?" answer rather than a "how far from the nearest source?" answer.
- **Flooding chem 167 via `chem 167 255` has no behavioural effect on a standard creature.** No receptor reads it, no reaction consumes it, and the SensoryFaculty overwrites it on the next tick if the creature is in a room. The stim-chemical offset (`STIMTOBIOCHEMOFFSET = 148`) maps chem 167 to stim chemical 19, but no stim gene in the standard genome targets stim chemical 19 either.
- **Adding a "thermally sensitive" Norn variant is a single-gene change.** Because no existing receptor or reaction uses chem 167, a breeder can safely add one receptor locus against chem 167 (e.g. `Drive: Hotness + Chemical 167 (heat) → increase Hotness`) to model environmental heat stress, without any risk of interfering with existing chemistry. The `CHEM` command or an always-on sensory overwrite guarantees the receptor sees live data.
- **Standard creature thermal drives are internal, not environmental.** Coldness (chem 152) and Hotness (chem 153) are chemically produced by internal reactions tied to the creature's own body state in the standard genome. CA 2 and chem 167 are **ambient** heat; the drive chemicals model **body** heat. Bridging them is left to the breeder.
- **Breeding out the sensory pathway is not possible.** Because the per-tick SetChemical is engine-hard-coded (not a gene), no genetic mutation can stop chem 167 from tracking room CA 2. The only way to make chem 167 "do nothing" is to leave no receptor hooked to it — which is already the default state.

### Summary

CA smell 2 (heat) is the bloodstream mirror of map CA index 2, the thermal channel. The world-level half of the pipeline is richly developed: the terrarium sun, the Ettin desert sun, the Grendel jungle fires, the volcano, and the hatchery incubator all pump CA 2 into their rooms, with diffusion configured per room type so that water and cold-indoor rooms act as thermal walls. Plants, fungi, tendrils, and seasonal crops all gate their growth on `prop room targ 2` thresholds, producing a coherent biome-driven ecology of warm-loving and cool-loving flora. The creature-level half, however, stops at the biochem copy: chem 167 is faithfully updated every tick but no standard gene consumes it and no `CACL` line routes it into the smell lobe, so creatures remain blind to the world's ambient heat at both the brain and the chemistry layer — their own Coldness/Hotness drives are driven by separate internal reactions. In a default, unmodified world running a default genome, chem 167 is therefore a **quiet observer of a thermally rich world** — it reads 0 in water, bumps up in the terrarium at noon, pins high near the volcano, and none of it matters to the creature. Its value becomes behaviourally meaningful only when an author adds a receptor gene or a script that queries the chemical directly.
