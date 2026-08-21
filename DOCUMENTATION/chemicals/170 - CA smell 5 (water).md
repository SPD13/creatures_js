# 170 - CA smell 5 (water)

Chemical 170 is the sixth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) that act as a creature's *internal copy* of the environment's cellular-automata channels. Each room in the map carries `CA_PROPERTY_COUNT = 20` scalar values (the "CA properties") that diffuse between rooms through doors; every SensoryFaculty tick the creature looks up its own room, reads CA property `i`, and writes that float directly into biochem chemical `FIRST_SMELL_CHEMICAL + i` (= 165 + i). Chem 170 is therefore the bloodstream mirror of **CA index 5**, which the engine's canonical naming table calls `"water"` again — `CASystem.js:31-36` actually labels it `water2`, distinguishing it from CA 3 (also `"water"`) (`biochemistry.json` row 8905, `ChemicalNames.catalogue` row 5).

The fact that two CA channels are both named "water" is not redundant — they encode **two completely different physical things**:

- **CA 3** (chem 168) is the **decomposition water field**: pulse-driven by dying fauna, decomposing fruit, and expiring fungi via `altr room targ 3 <amount>`. It is a "things have died/rotted here recently" sensor that diffuses everywhere with full diffusion (1.0) and per-room-type loss rates ranging from 0.0001 (ocean) to 0.9 (dry corridor).
- **CA 5** (chem 170) is the **standing-water beacon field**: emitted continuously by 10 hand-placed `Water smell emitter` agents at the exact map coordinates of ponds, oases and the ocean. Diffusion is heavily attenuated (0.1 in outdoor air, 0.95-1.0 inside rooms), so the smell stays largely *where the water actually is*. It is a "follow this gradient to find an actual body of water" sensor used by water-loving fauna for navigation.

In short: CA 3 says "something rotted nearby"; CA 5 says "real liquid water exists *that way*". CA 3 changes second-by-second as the ecology runs; CA 5 is essentially a static topographic feature of the world.

At the creature's own chemistry level, however, chem 170 is — like its cousin chem 168 — a **reserved blank**. The SensoryFaculty writes it every tick, but no standard genome has a receptor for it, no reaction consumes it, and (as confirmed below) no `CACL` line maps CA 5 to a smell-lobe classifier. The standard hydration drives of a creature are driven by separate internal reactions, not by ambient CA 5 → chem 170 readings.

Its only guaranteed runtime behaviours are: (a) being overwritten each tick with the current room's CA 5 value while the creature stands inside any valid room, and (b) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms (the `GetRoomIDForPoint` guard fails, so the SetChemical overwrite is skipped and only the normal chemical decay runs).

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 5** | — (hard-coded in engine) | `SensoryFaculty::Update` | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 5, smellValue)` → `Biochemistry::SetChemical(170, smellValue)` | Per tick — direct assignment (not additive), so the value tracks the local room's CA 5 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 170 <amount>` writes directly to the biochemistry. Effect is overwritten on the next sensory tick if the creature is inside a room, so it is only persistent when the creature is roomless | Author-defined |
| 3 | **Ingestion of agents containing chem 170** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 170 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

The room-side CA 5 value that feeds source (1) comes from a single, very deliberate authoring decision: a hand-placed grid of 10 emitter agents in `001 World/Water smell emitter.cos`. Unlike CA 3, **`altr room targ 5` is never called** anywhere in the bootstrap — there are no death pulses, no decomposition contributions, no rotting-fruit injections. The entire CA 5 field is sustained by `emit 5 1` running every tick from these 10 agents:

| Cluster | Agents (mvto coordinates) | Map region |
|---------|---------------------------|------------|
| North-east pond (high) | (6707, 570), (6809, 570), (6919, 574) | Three emitters lined along the upper aquatic biome shore |
| Central garden pond | (3311, 1040), (3468, 1040), (3763, 1029), (3866, 1022), (3960, 1027) | Five emitters covering the vivarium garden / pond complex |
| Desert oasis | (2518, 2186), (2700, 2186) | Two emitters at the lower-map water source |

Each emitter is created as `simp 1 1 15 "targ" 2 0 0` (family 1, genus 1, species 15 — generic invisible simp), made invisible (`attr 16` = invisible), and runs the single permanent line `emit 5 1`. The intensity `1` is the `EMIT` "intensity" parameter — the actual per-tick contribution depends on the room's `gain` rate (column 1 of the `rate` table, see below). The companion `enum 1 1 15 / kill targ` block at the bottom of the install script wipes any previous instances first, so re-installing the bootstrap is idempotent.

These 10 emitters are the **only** standing producers of CA 5 in the entire game. They are spatially correlated with the world's actual water bodies (the high pond, the central pond, and the lower oasis) — so the CA 5 field is physically a steady gradient peaking on those bodies and falling off into surrounding rooms.

From those emission points CA 5 diffuses between rooms every two game ticks through the standard two-phase CA update (`CASystem`). The `!map.cos` bootstrap configures **CA 5's per-room-type rates very differently from CA 3's** — diffusion is intentionally throttled so the smell does not flood the whole map (`!map.cos:1664-1979`):

| Room type | gain | loss | diffusion | Behaviour for CA 5 |
|-----------|------|------|-----------|--------------------|
| 0 | 1.00 | 0.100 | **0.10** | **Outdoor air** — full reception, 10 %/tick loss, but *only 10 % diffusion to neighbours*. The smell decays in place rather than spreading far through open air |
| 1 | 1.00 | 0.500 | 1.00 | Indoor room — 50 %/tick loss, full diffusion. Smell dissipates quickly indoors |
| 2 | 1.00 | 0.500 | 1.00 | Same — indoor |
| 3 | 1.00 | 0.500 | 1.00 | Same — indoor |
| 4 | 1.00 | 0.500 | 1.00 | Same — indoor |
| 5 | 1.00 | 0.500 | 1.00 | Wet soil — 50 %/tick loss (CA 5 doesn't pool here even though water itself does!) |
| 6 | 1.00 | 0.500 | 1.00 | Damp soil — 50 %/tick loss |
| 7 | 1.00 | 0.500 | 1.00 | Same |
| 8 | 0.90 | **0.001** | 1.00 | **Water / ocean** — slight reception attenuation, near-permanent retention (0.1 %/tick loss). CA 5 *does* pool here |
| 9 | 0.90 | 0.001 | 1.00 | **Water / ocean** — same near-permanent retention |
| 10 | 1.00 | 0.500 | 1.00 | Indoor — 50 %/tick loss |
| 11-15 | 0.00 | 0.000 | 0.00 | **Blocked** — no reception, no diffusion, no loss |

The key contrasts with CA 3 (chem 168) are:

1. **Outdoor diffusion is choked** (0.1 vs 1.0). CA 5 is supposed to be a *local* signal, not a global haze. An emitter on the central pond produces a smell pocket that grows slowly and only weakly bleeds into adjacent corridors and meta-rooms.
2. **Soil and indoor rooms lose CA 5 fast** (0.5 per tick — a much higher loss rate than for any of CA 3's soil rooms). CA 5 does not accumulate in the rooms surrounding water, so the gradient is sharp rather than fuzzy.
3. **Water rooms are still long-term reservoirs** (loss 0.001) — but with diffusion 1.0 from neighbouring water rooms, the ocean ends up homogeneously bathed in CA 5.

The net effect: from an emitter at, say, (3866, 1022) on the central pond, CA 5 builds up in the local water rooms (very low loss, full reception), then weakly bleeds through the pond's surface into the adjacent garden rooms (which lose 50 %/tick, so the value drops sharply within a couple of door crossings). A creature standing on the pond shore reads chem 170 ≈ a moderate value; a creature five rooms inland reads ≈ 0.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails the SensoryFaculty overwrite is skipped, so the chemical simply decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 2 | **Smell-lobe neuron write** (reads CA 5, not chem 170) | — (hard-coded) | `brain->SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager::GetCategoryIdFromSmellId(5)` | The smell lobe has 40 neurons (`brain-architecture.json` lobe index 14). For CA index `i` the brain neuron is chosen by the classifier-to-CA mapping set via the `CACL` CAOS command | In the default bootstrap (`z_agent smells.cos`) **no `cacl … … … 5` line exists** — every `CACL` call uses ca_index ∈ {6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18}. `ourCategoryIdsForSmellIds[5]` stays at its initialised `-1` value. `SetInput("smel", -1, …)` is a no-op, so ambient water beacons produce no smell-lobe activation in a default Norn |
| 3 | **Fauna navigation behaviour** (reads CA 5, not chem 170) | — | — | `lorp room targ 5 <smoothing>`, `prop room targ 5 <threshold>` | Several insect / animal scripts use the room's CA 5 value directly — see "Non-creature consumers" below. They never touch chem 170 |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 170 | Threshold / gain / locus author-defined | A breeder can add receptors that read chem 170 to give a creature a thirst-relief response near water bodies. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter touches chemical 170 in the standard C3 genome.** Searching `biochemistry.json` for references to chemical id 170 returns only the `halfLives` entry (1241-tick half-life, genome value 72, "Long" speed). No creature drive is driven by the standing-water beacon, and no internal chemistry consumes or produces chem 170 during a creature's life.

## Role in Game Mechanics

### CA 5 is an *authored topographic feature*, not an emergent ecology signal

Where CA 3 (chem 168) is an emergent decomposition field whose hotspots wander as the ecology runs, CA 5 (chem 170) is a **fixed, hand-painted gradient** that maps directly onto the world's actual water bodies. The 10 `emit 5 1` agents in `Water smell emitter.cos` are placed exactly where the world map shows ponds and the ocean shore; their emission rates are constant; the per-room-type rate table (low diffusion in air, near-zero loss in water rooms) shapes the field into a smooth bowl centred on each water body.

```
   Water smell emitter agents (emit 5 1, 24/7, 10 fixed locations)
          │
          ▼
   Map room CA[5]  ←──── diffuses between rooms (rate 1.0 between water rooms,
          │                                       0.1 in outdoor air rooms)
          │                ───MODERATE LOSS in dry/soil/indoor rooms (0.5 per tick)
          │                ───NEAR-PERMANENT in water rooms (0.001 per tick)
          │                ───CHOKED DIFFUSION outdoors (0.1 — does not flood the map)
          │                ───BLOCKED in cold zones (types 11-15: zero)
          │
          ├─────► Aquatic / water-following fauna
          │       (mosquito, gnats: hover above water at threshold;
          │        grazer2, gnarler: navigate toward water with lorp)
          │
          │  SensoryFaculty.Update() every tick
          ▼
   chem 170 (creature bloodstream) ──► receptors?  → NONE in default genome
                                   ──► reactions?  → NONE in default genome

   (Parallel path, same loop)
          │
          ▼
   brain "smel" neuron AgentManager.GetCategoryIdFromSmellId(5)
          → -1 by default (no cacl for CA 5)
          → no brain-level reaction to standing water
```

The result is a stable navigation grid that fauna AI can rely on every tick. A grazer that wakes up far from water can walk in the direction of increasing CA 5 and will reach a real water body — not a corpse, not a fungus, not a rotting apple, but actual standing water.

### Non-creature consumers — water-following fauna

CA 5 is the navigation fuel for the world's "find water" behaviours. Four scripts use it directly, in two distinct idioms:

**Threshold-gated hovering (insects with above-water aerial behaviour):**
- **Mosquito** (`mosquito.cos:59-62`): `doif prop room targ 5 gt 0.2 / setv vely -10 / stop`. When the mosquito enters a room with significant CA 5 (i.e. directly above a pond surface), it nudges its vertical velocity upward (negative Y is up) and aborts further movement decisions for this tick — the classic "hover above water" insect behaviour. The threshold of 0.2 means the mosquito only triggers near-emitter, where the CA 5 value is high enough to actually be over the water.
- **Gnats** (`gnats.cos:131-134`): identical idiom, identical 0.2 threshold — gnats also hover above water bodies. The two scripts share a copy of this water-finding logic.

**Direction-finding for terrestrial fauna (`lorp` gradient navigation):**
- **Grazer2** (`grazer2.cos:375-385`): `doif room targ ne -1 / doif prop room targ 5 ge 0.00001 / setv va90 lorp room targ 5 0 / setv va91 torx va90 / doif va91 lt 0 and ov10 gt 0 / …`. The grazer first checks it's in a valid room, then checks CA 5 is non-trivially present (≥ 0.00001 — much lower than the insect 0.2 threshold, because the grazer is detecting water from far away). It then calls `lorp room targ 5 0` to find the direction of strongest CA 5 gradient (`LORP` returns a position interpolated toward the highest-CA neighbouring room), converts that to a relative X (`torx`), and uses it to decide whether to flip its facing/movement. The grazer is a herbivore that needs water — this is its "head toward the pond" instinct.
- **Gnarler** (`gnarler.cos:359-368`): identical pattern — `doif prop room targ 5 ge 0.00001 / setv va00 lorp room targ 5 0 / setv va01 torx va00 / doif va01 lt 0 and ov10 gt 0 / …`. The gnarler (predator) follows the same gradient toward water, presumably to find prey there or to drink itself.

The dichotomy of thresholds is meaningful: **insects use a high threshold (0.2) because they only act when directly above water**, while **mammals use a near-zero threshold (0.00001) because they navigate via the gradient from far away**. The choked outdoor diffusion (rate 0.1) keeps the high-threshold zone tightly bound to the actual water surface, while still leaving a faint detectable trail across the rest of the map for the gradient followers.

Note that none of these scripts touch chem 170. They all read `prop room targ 5` directly from the room CA system, bypassing the biochemistry entirely. Chem 170 is the creature-side pipeline; the fauna AI uses the room-side pipeline. The same CA 5 value drives both.

### Why CA 5 has tight diffusion and CA 3 has loose diffusion

The diffusion-rate column is the most striking difference between CA 3 and CA 5. CA 3 has diffusion 1.0 in every active room type — a death pulse anywhere spreads everywhere. CA 5 has diffusion **0.1 in outdoor rooms** and the gain itself is attenuated to 0.9 in water rooms. This is a deliberate authoring choice that reflects what each channel *means*:

- CA 3 represents a **diffuse chemical** (the smell of decomposition products in the air), so it should travel freely.
- CA 5 represents a **localised physical attribute** (an actual pond exists *here*), so it should stay put. A creature has to walk closer to detect it more strongly.

The throttling also keeps the field finite-energy: with 10 emitters running constantly at intensity 1 in rate-1.0 diffusion conditions, CA 5 would accumulate without bound. The high indoor loss (0.5) and choked outdoor diffusion balance against the constant emission, so the field reaches a steady state where the maximum concentration is achieved adjacent to the emitters and falls off rapidly with distance.

### Inside-room vs outside-room behaviour for chem 170

Same architectural rule as for chem 168. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 170 tracks the world or decays in isolation:

- **Inside any room.** Chem 170 is overwritten every sensory tick with the room's live CA 5 value. The 1241-tick half-life is moot.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 170 follows pure first-order decay at rate 0.99944177 per tick.

Because CA 5 is concentrated only around the pond/oasis emitter clusters, chem 170 on a Norn in normal play is usually **0.0** — most rooms in the Shee ship are far from any water emitter. Non-zero readings are a diagnostic that the creature is currently near one of the three water bodies.

### The `-MyContribution` subtraction and why CA 5 skips it

For CA indices that *are* bound to the creature's own category (e.g. a Norn looking at CA 12 = Norn smell), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. For CA 5 this branch is never taken — creatures do not have a standing `emit 5` on themselves. The full room value flows into chem 170.

### Practical consequences

- **`chem TARG 170` is a live "near-water" indicator.** A CAOS script querying chem 170 reads the current room's CA 5 value (with one-tick lag). A non-zero reading means the creature is within a few rooms of one of the three authored water bodies. This is the cleanest scripting hook for "is this creature near a pond?"; far cleaner than the noisy, transient CA 3 field which spikes on every nearby death.
- **The "near-water" map is fixed at world-design time.** Removing or moving any of the 10 `Water smell emitter` agents changes where the CA 5 gradient peaks. World designers can extend the navigable water set by spawning new emitter agents at additional pond locations. Aquatic mods that add a new pond should ship a corresponding emitter agent to make it findable by water-following fauna.
- **Flooding chem 170 via `chem 170 255` has no behavioural effect on a standard creature.** No receptor reads it, no reaction consumes it, and the SensoryFaculty overwrites it on the next tick if the creature is in a room. The stim-chemical offset (`STIMTOBIOCHEMOFFSET = 148`) maps chem 170 to stim chemical 22, but no stim gene in the standard genome targets stim chemical 22 either.
- **A "thirst-relief from being near water" gene is a one-receptor change.** Because no existing receptor uses chem 170, a breeder can add a single receptor locus — e.g. `Drive: Thirst − Chemical 170 (water beacon) → reduce Thirst` — to make creatures relax their thirst when standing near a pond. The SensoryFaculty-driven overwrite guarantees the receptor sees a meaningful, geographically-anchored value. This is arguably a more game-coherent thirst signal than CA 3 (which would also trigger on rotting fruit), but the standard genome ships neither.
- **Adding `cacl X X X 5` would route water-presence into the smell lobe.** A bootstrap addition like `cacl 1 1 15 5` (family/genus/species of the emitter agent) would make the smell lobe fire whenever the creature smelled CA 5, giving creatures a brain-level "I sense a water source" input that they could learn to associate with thirst relief. The default bootstrap deliberately avoids this — possibly because water-finding behaviour was considered too critical to leave to creature learning.
- **Mosquitoes and gnats are not killed by being away from water — they just stop hovering.** The `prop room targ 5 gt 0.2` check only modifies vertical velocity when the creature is over water; outside that condition, the insect just flies normally. So the insects naturally cluster around the three pond emitter clusters because of their hovering behaviour, not because they die elsewhere. CA 5 is the spatial organiser of the entire flying-insect population.
- **Breeding out the sensory pathway is not possible.** The per-tick SetChemical is engine-hard-coded (not a gene), so no genetic mutation can stop chem 170 from tracking room CA 5. The only way to make chem 170 "do nothing" is to leave no receptor hooked to it — which is already the default state.

### CA 3 vs CA 5 side-by-side

| Aspect | CA 3 (chem 168) | CA 5 (chem 170) |
|--------|-----------------|-----------------|
| Naming | `water` (canonical), `water` (game label) | `water2` (canonical), `water` (game label) |
| Source mechanism | Discrete `altr room targ 3 <amount>` pulses | Continuous `emit 5 1` from 10 fixed agents |
| Source count | ~30+ scripts (every death/decomposition event) | Exactly 10 hand-placed emitters |
| Source location | Wherever fauna die or fruit rots — *dynamic* | Three fixed clusters at pond/oasis locations — *static* |
| Outdoor diffusion | 1.0 (full — spreads everywhere) | 0.1 (choked — stays local) |
| Outdoor loss | 0.05 per tick | 0.10 per tick |
| Indoor loss | 0.9 per tick (evaporates fast) | 0.5 per tick (also lost fast) |
| Soil loss | 0.001-0.01 (pools in soil) | 0.5 (does NOT pool in soil) |
| Ocean loss | 0.0001 (near-permanent) | 0.001 (near-permanent — same idea, slightly higher) |
| Behavioural meaning | "Things have died/rotted near here recently" | "An actual body of water is *that way*" |
| Used by plants? | Yes — grass, carrot, foxglove, banana cactus | No |
| Used by animals? | Not directly | Yes — mosquito, gnats, grazer2, gnarler |
| Used by creatures? | No (no genome reads it) | No (no genome reads it) |
| Author-modifiability | Add receptor for "rotting smell triggers fear" | Add receptor for "near water relieves thirst" |

### Summary

CA smell 5 (water) is the bloodstream mirror of map CA index 5, the **standing-water beacon channel** — a fixed, hand-painted gradient maintained by 10 invisible `emit 5 1` agents placed at the exact map coordinates of C3's three water-body clusters (the high pond at ~(6800, 570), the central garden pond at ~(3700, 1030), and the lower oasis at ~(2600, 2186)). Its per-room-type rate table differs sharply from CA 3's: outdoor diffusion is throttled to 0.1 (so the smell does not flood the world), indoor and soil rooms lose 50 %/tick (so the gradient stays sharply bound to the water bodies), and water rooms hold the smell with near-zero loss (so ocean and pond rooms saturate to a stable high value). Four bootstrap scripts use the resulting CA 5 field directly: mosquitoes and gnats hover above the surface when `prop room targ 5 gt 0.2`, and grazer2 and gnarler navigate toward water by following the `lorp room targ 5` gradient with a far-distance threshold of `≥ 0.00001`. The creature-level half of the pipeline, however, stops at the biochem copy: chem 170 is faithfully updated every tick but no standard gene consumes it and no `CACL` line routes CA 5 into the smell lobe, so creatures remain blind to the water-beacon field at both the brain and chemistry layer. In a default, unmodified world running a default genome, chem 170 is therefore a **silent positional indicator** that quietly reads non-zero only when a Norn happens to wander near a pond — perfectly placed for an author to wire into a thirst, hydration, or "happy near water" response, but inert by default. Together with chem 168 (CA 3, the decomposition water), it forms a two-channel "wet world" sensor pair where one channel tracks *recent biological wetness* and the other tracks *fixed geographical wetness* — and a default Norn perceives neither.
