# 168 - CA smell 3 (water)

Chemical 168 is the fourth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) that act as the creature's *internal copy* of the environment's cellular-automata channels. Each room in the map carries `CA_PROPERTY_COUNT = 20` scalar values (the "CA properties") that diffuse between rooms through doors; every SensoryFaculty tick the creature looks up its own room, reads CA property `i`, and writes that float directly into biochem chemical `FIRST_SMELL_CHEMICAL + i` (= 165 + i). Chem 168 is therefore the bloodstream mirror of **CA index 3**, which the engine's canonical naming table labels `"water"` (`CASystem.js:31-36`, matching the original `ChemicalNames.catalogue`).

CA 3 (water) is the world's **ambient-moisture channel**: it models how much free water is present in a room, and it is the first pillar of the bootstrap's simple decomposition-driven ecology. Unlike CA 1 (light) and CA 2 (heat), **no script uses a steady `EMIT 3`**: water is injected only as **discrete pulses** via `altr room targ 3 <amount>` — primarily by dying fauna, decomposing fruit, expiring fungi, and the creature's own death script — and is then spread around by diffusion until the per-room-type loss rates evaporate it. Plants (grass, carrots, banana cactus, foxglove) read the resulting water field via `prop room targ 3` and gate germination / growth on it, producing the classic ecological cycle *corpse → water + nutrient → plants → fauna → corpse* that C3's ecology rests on.

At the creature's own chemistry level, however, chem 168 is still a **reserved blank**. The SensoryFaculty writes it every tick, but no standard genome has a receptor for it, no reaction consumes it, and no `CACL` line maps CA 3 to a smell-lobe classifier (`z_agent smells.cos` contains `cacl 3 3 0 10`, `cacl 3 8 0 18`, `cacl 3 4 1 11`, `cacl 3 5 0 15`, `cacl 3 6 0 16`, `cacl 3 7 0 17` — but these are `family genus species ca_index` tuples with the `3` in the *family* slot, not the CA-index slot; there is no `cacl … … … 3` line). The standard hydration-related drives of a creature are driven by separate internal reactions, not by the ambient CA 3 → chem 168 loop.

The dichotomy is the key to this chemical: CA 3 is an **authored-world signal** (plants, fungi, and the ecology cycle use it extensively), whereas chem 168 is the **biochem copy of that signal** — always populated, queryable from CAOS on the creature (`chem TARG 168`), but not wired into creature cognition by default.

Its only guaranteed runtime behaviours are: (a) being overwritten each tick with the current room's CA 3 value while the creature stands inside any valid room, and (b) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms (the `GetRoomIDForPoint` guard fails, so the SetChemical overwrite is skipped and only the normal chemical decay runs).

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 3** | — (hard-coded in engine) | `SensoryFaculty::Update` | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 3, smellValue)` → `Biochemistry::SetChemical(168, smellValue)` | Per tick — direct assignment (not additive), so the value tracks the local room's CA 3 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 168 <amount>` writes directly to the biochemistry. Effect is overwritten on the next sensory tick if the creature is inside a room, so it is only persistent when the creature is roomless | Author-defined |
| 3 | **Ingestion of agents containing chem 168** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 168 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

The room-side CA 3 value that feeds source (1) is produced by a fundamentally different mechanism from CA 1 and CA 2. **No bootstrap agent uses `emit 3 <intensity>`** — searching the entire `001 World/` bootstrap for `emit 3` returns no matches. Instead, CA 3 is populated almost entirely by one-shot **`altr room targ 3 <amount>`** writes issued from death / decomposition scripts:

- **Creature death** (`creatureInvoluntary.cos:340-348`, `scrp 4 0 0 72` — family 4 = creature, event 72 = die): when a creature dies with no carrier, `altr room targ 3 0.5` adds a large water pulse to the room, alongside `altr room targ 4 0.5` (nutrient). This is the single largest author-set water injection event in the game — a corpse is worth half a water-unit of ambient moisture.
- **Fungi** (`fungi.cos:128, 214, 231, 241`): fungi `altr room targ 3 0.1` and `altr room targ 4 0.1` on death or when their timer expires, and also when they complete a spore cycle. Because fungi prefer cool dark rooms (`cacl`-less plants; see "Non-creature consumers" below), this concentrates moisture in cave-like rooms, reinforcing their preferred habitat.
- **Apples** (`apples.cos:118, 158`): rotting or falling apples add `altr room targ 3 0.01` + `altr room targ 4 0.01`. Small but repeatable — a populated orchard gradually humidifies its local rooms.
- **Pumperspikel / other decomposing plants** (`pumperspikel.cos:142`): `altr room targ 3 0.01` on decomposition.
- **Insect death** (`wasp.cos:405`, `bee.cos:843`, `dragonfly.cos`, `ant.cos`, `Butterfly.cos`, `grasshopper.cos`, `Hummingbird.cos`): most insect death scripts issue `altr room targ 3 0.1` + `altr room targ 4 0.1` on kill, so insect mortality feeds the local humidity.
- **Aquatic fauna** (`piranha.cos:131, 399`, `man-o-war.cos:486, 496`, `stickleback.cos`): death in water adds 0.01–0.1 water, but because the ocean room types (8, 9) already have loss rate `0.0001`, contributions there are almost permanent.
- **Grazer / kobold / hedgehog / snail / meerk / gnarler / kingfisher / hoppity** death scripts: same 0.1 water + 0.1 nutrient pulse, giving every fauna class a consistent decomposition footprint.
- **Foxglove plant** (`PLANT MODEL - foxglove plant.cos:313, 388`): foxgloves use `altr room targ 3 va00` / `altr room targ 3 va92` in growth/death scripts to trade moisture with the environment as part of their lifecycle.
- **`ALTR` CAOS command**: the generic one-shot additive write to a specific room's CA 3, used by all of the above. Allowed because CA 3 is not in the navigable set `{6,7,8,10-18}`.

From there CA 3 diffuses between rooms every two game ticks through the standard two-phase CA update (`CASystem`). Just like CA 2, the `!map.cos` bootstrap configures **heterogeneous rates for CA 3 across room types** — but with a totally different physical model: water evaporates fast in dry indoor rooms, pools in soil, and is essentially permanent in water rooms (`!map.cos:1661-1976`):

| Room type | gain | loss | diffusion | Behaviour for CA 3 |
|-----------|------|------|-----------|--------------------|
| 0 | 0.90 | 0.050 | 1.00 | Outdoor air — fast reception, 5 %/tick evaporation, full diffusion |
| 1 | 0.30 | 0.900 | 1.00 | **Drying room** — attenuated gain, 90 %/tick loss. Water arrives slowly and evaporates almost instantly |
| 2 | 0.30 | 0.900 | 1.00 | Same — drying room profile |
| 3 | 0.30 | 0.900 | 1.00 | Same — drying room |
| 4 | 0.30 | 0.900 | 1.00 | Same — drying room |
| 5 | 1.00 | 0.005 | 1.00 | **Wet soil** — full reception, very slow loss (0.5 %/tick). Holds water for a long time |
| 6 | 1.00 | 0.001 | 1.00 | **Very wet soil / swamp** — 0.1 %/tick loss |
| 7 | 1.00 | 0.010 | 1.00 | Damp soil — 1 %/tick loss |
| 8 | 1.00 | 0.0001 | 1.00 | **Water / ocean** — near-permanent water retention (0.01 %/tick loss) |
| 9 | 1.00 | 0.0001 | 1.00 | **Water / ocean** — near-permanent water retention |
| 10 | 0.30 | 0.900 | 1.00 | Drying room |
| 11-15 | 0.00 | 0.000 | 0.00 | **Blocked** — no reception, no diffusion, no loss (CA 3 held at whatever initial value) |

The key physical intuition: **dry rooms stay dry, wet rooms stay wet, and water rooms are effectively reservoirs**. A pulse delivered into a room-type-1 corridor vanishes in a handful of ticks (`0.9` per-tick loss means ~70 % gone in two ticks). A pulse delivered into a soil room (type 5–7) lingers for minutes. A pulse delivered into ocean (type 8–9) is permanent on any gameplay-relevant timescale. The air-type room 0 is an intermediate: it accepts water readily but loses 5 %/tick, producing a temporary humidity cloud that fades over ~200 ticks.

A creature standing in a wet-soil room reads chem 168 ≈ the long-term accumulation of decomposition in that room; a creature standing in a dry corridor reads near-0; a creature standing in the ocean reads whatever steady-state moisture level the ocean has built up. The water channel thus gives behaviourally-rich information — "am I in a swamp, a dry cave, an orchard with rotting fruit, or the open sea?" — that is totally invisible to the default creature chemistry.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails the SensoryFaculty overwrite is skipped, so the chemical simply decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 2 | **Smell-lobe neuron write** (reads CA 3, not chem 168) | — (hard-coded) | `brain->SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager::GetCategoryIdFromSmellId(3)` | The smell lobe has 40 neurons (`brain-architecture.json` lobe index 14). For CA index `i` the brain neuron is chosen by the classifier-to-CA mapping set via the `CACL` CAOS command | In the default bootstrap (`z_agent smells.cos`) **no `cacl … … … 3` line exists** (every appearance of `3` in that file is the *family* argument, never the *ca_index* argument). `ourCategoryIdsForSmellIds[3]` stays at its initialised `-1` value. `SetInput("smel", -1, …)` is a no-op, so ambient water produces no smell-lobe activation by default |
| 3 | **Plant and animal agent behaviour** (reads CA 3, not chem 168) | — | — | `setv va03 prop room targ 3` and `doif prop room targ 3 … <threshold>` | Agents compare the room's CA 3 directly to thresholds. See the "Non-creature consumers" section below for specific examples |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 168 | Threshold / gain / locus author-defined | Breeders / genome hackers can add receptors that read chem 168 to give creatures a moisture-skin response. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter touches chemical 168 in the standard C3 genome.** Searching `biochemistry.json` for references to chemical id 168 returns only the `halfLives` entry (1241-tick half-life, genome value 72, "Long" speed). No creature drive is driven by ambient moisture, and no internal chemistry consumes or produces chem 168 during a creature's life.

## Role in Game Mechanics

### CA 3 is a *decomposition field*, not a *emitter field*

Where CA 1 (light) is an always-on sun-like field and CA 2 (heat) is a mix of always-on emitters and eruption pulses, CA 3 is **entirely pulse-driven**: it has no steady-state `EMIT` sources anywhere in the bootstrap. Every unit of CA 3 in the map came from a discrete `altr room targ 3` call, and its lifetime in that room is determined only by the room type's loss rate. The effect is that the water field is a **living map of recent mortality** — its hotspots migrate as fauna die, as fungi decompose, as fruit rots on the ground.

```
  Dying fauna (altr room targ 3 0.1)
  Creature death script (altr room targ 3 0.5)
  Rotting apples, fungi, foxglove, pumperspikel (altr room targ 3 0.01-0.1)
         │
         ▼
  Map room CA[3]  ←──── diffuses between rooms (rate 1.0)
         │                ───FAST EVAPORATION in indoor/walkway rooms (types 1-4, 10: loss 0.9)
         │                ───SLOW EVAPORATION in soil rooms (types 5-7: loss 0.001-0.01)
         │                ───NEAR-PERMANENT in ocean rooms (types 8-9: loss 0.0001)
         │                ───BLOCKED in cold zones (types 11-15: zero)
         │
         ├─────► Plant scripts (grass, foxglove, carrot, banana cactus, desert grass)
         │       → gate germination and growth on prop room targ 3 thresholds
         │
         │
         │  SensoryFaculty.Update() every tick
         ▼
  chem 168 (creature bloodstream) ──► receptors?  → NONE in default genome
                                  ──► reactions?  → NONE in default genome

  (Parallel path, same loop)
         │
         ▼
  brain "smel" neuron AgentManager.GetCategoryIdFromSmellId(3)
         → -1 by default (no cacl for CA 3)
         → no brain-level reaction to ambient water
```

The result is a self-consistent ecology simulation riding on a single CA channel, invisible to the creatures living in it.

### The decomposition cycle

The game's ecology loops tightly on CA 3 + CA 4 (nutrient). Every death event adds both:

```
scrp 4 0 0 72      ; Creature::DeathScript (die event)
  ...
  doif room ownr ne -1 and carr eq null
    altr room targ 3 0.5     ; water
    altr room targ 4 0.5     ; nutrient
  endi
  ...
```

Insect and small-fauna deaths add 0.1 of each. Dropped apples add 0.01 of each. The paired injection means that wherever organisms die, the ground gets **water-and-nutrient-rich** — the biologically realistic conditions that promote plant growth. Plants then grow in those rooms and become food for more fauna, completing the loop. The tight coupling with CA 4 is why almost every script that writes CA 3 also writes the same amount of CA 4.

### Plant growth gating

Plants use `prop room targ 3` as a hard gate on germination and growth. The pattern is consistent across species:

- **Grass / desert grass** (`grass.cos:120, 414`, `desert grass.cos:119, 412`): in the germination check, `elif prop room targ 3 gt ov85 or prop room targ 3 lt ov86` returns failure — grass requires water between author-set bounds `ov86 ≤ water ≤ ov85`. Desert grass has lower bounds than regular grass, so it germinates in drier rooms. The range check (`gt ov85 or lt ov86`) means grass prefers a specific moisture band: not too dry, not too wet.
- **Foxglove seeds** (`PLANT MODEL - foxglove Seed.cos:56`): the same range check — `elif prop room targ 3 gt ov85 or prop room targ 3 lt ov86` aborts germination outside the author-set water band.
- **Foxglove plants** (`PLANT MODEL - foxglove plant.cos:297, 313, 388`): mature foxgloves read the water level into `va03` and also emit / absorb water themselves, becoming active participants in the moisture field rather than passive consumers.
- **Carrots** (`Carrot.cos:88, 160`): `doif prop room targ 2 gt 0.2 and prop room targ 4 gt 0.3 ... doif prop room targ 3 gt 0.1` — a combined heat + nutrient + water check. Carrots require *all three* to be favourable (warm, nutrient-rich, damp) before they continue growing; if any one fails, the carrot dies. This triple-gate makes carrots a sensitive indicator species for "healthy" rooms.
- **Banana cactus** (`cacbana.cos:404`): `doif prop room targ 3 ge 0.3` — the cactus *flowers* only when water is abundant (a rain-sensitive desert bloom), an inverted idiom from its more arid-tolerant growth phase.

The plant ecology is thus a multi-channel filter over rooms: a foxglove can germinate only in rooms whose heat, light, and water all fall inside authored ranges, and the resulting spatial distribution of plants is essentially a map of those ranges. Water is the single most discriminating channel of the three, because water is also the most variable — it is created by mortality events and varies over time as those events fluctuate.

### Why water has such extreme per-room-type rates

The 0.9 per-tick loss rate in dry indoor rooms (types 1, 2, 3, 4, 10) is dramatically higher than anything used for CA 2 (heat, max 0.01). This is an intentional asymmetry: heat is modelled as slow-changing thermal bulk, but water is modelled as fast-evaporating surface moisture. A puddle in a corridor is supposed to dry out within seconds; a heated room is supposed to stay warm for minutes. The rate table encodes that intuition directly.

Conversely, the 0.0001 loss rate in ocean rooms (types 8, 9) is the smallest in the whole rate table — the ocean is supposed to hold arbitrary amounts of water essentially forever, which matches the real-world intuition of a large water body. Swamps and damp soils (types 5-7) sit in between, with loss rates of 0.005-0.01 that allow slow drainage.

The fully-blocked types 11-15 treat water the same way they treat heat — no gain, no diffusion, no loss. A creature standing in such a cold-zone room reads chem 168 = 0 regardless of events in neighbouring rooms.

### Inside-room vs outside-room behaviour

The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check is the single line that decides whether the creature's chem 168 tracks the world or decays on its own:

- **Inside any room.** Chem 168 is overwritten every sensory tick with the room's live CA 3 value. The 1241-tick half-life is moot. A creature walking into a room where a dying insect just released 0.1 water sees chem 168 jump by that amount within one tick of crossing the door; walking out into a dry-corridor room makes chem 168 drop toward 0 rapidly as the corridor's own 90 %/tick loss wipes out whatever transient water is present.
- **Outside all rooms** (mid-air during a fall with no room below the down-foot position, or in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 168 follows pure first-order decay at rate 0.99944177 per tick.

Because CA 3 in most rooms is either ~0 (dry rooms in equilibrium) or a small positive value (soil / ocean steady-states), chem 168 on a Norn in normal play is usually very small. Large values (>0.2) are rare and transient — typically caused by walking through a room where a creature just died.

### The `-MyContribution` subtraction and why CA 3 skips it

For CA indices that *are* bound to the creature's own category (e.g. a Norn looking at CA 12 = Norn smell), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. For CA 3 this branch is never taken (creatures do not have a standing `emit 3` on themselves), so the full room value is what flows into chem 168. The creature's own death does still pump CA 3 into the room — but by that point the creature's sensory loop is no longer running.

### Practical consequences

- **`chem TARG 168` is a live ambient-moisture sensor.** A CAOS script querying chem 168 on a creature reads the current room's CA 3 value (with one-tick lag). This gives the best signal of "is there recent mortality nearby" or "am I in a wet biome" that is available to scripting. More selective than CA 1 and more dynamic than CA 2 — it answers "are things dying or rotting around me?" in a way no other channel does.
- **Flooding chem 168 via `chem 168 255` has no behavioural effect on a standard creature.** No receptor reads it, no reaction consumes it, and the SensoryFaculty overwrites it on the next tick if the creature is in a room. The stim-chemical offset (`STIMTOBIOCHEMOFFSET = 148`) maps chem 168 to stim chemical 20, but no stim gene in the standard genome targets stim chemical 20 either.
- **Adding a "moisture-sensitive" Norn variant is a single-gene change.** Because no existing receptor or reaction uses chem 168, a breeder can safely add one receptor locus against chem 168 (e.g. `Drive: Thirst − Chemical 168 (water) → reduce Thirst` to model "drinking from ambient humidity", or `Drive: Fear + Chemical 168 → increase Fear` to model "smell of recent death causes distress"). The SensoryFaculty-driven overwrite guarantees the receptor sees live data.
- **Water is a recent-mortality sensor more than a hydration sensor.** Because the bootstrap injects CA 3 primarily via death and decomposition scripts, chem 168 is implicitly a "things have died here recently" signal. A creature mod that drives fear or disgust from chem 168 would give creatures a realistic reaction to corpse-strewn rooms without needing any additional scripting.
- **Standard creature hydration is internal, not environmental.** Creature thirst mechanics in C3 are driven by internal biochem (water-balance reactions tied to eating and drinking), not by ambient CA 3. CA 3 and chem 168 are **environmental** water; the drive chemicals model **body** water. Bridging them is left to the breeder.
- **Breeding out the sensory pathway is not possible.** Because the per-tick SetChemical is engine-hard-coded (not a gene), no genetic mutation can stop chem 168 from tracking room CA 3. The only way to make chem 168 "do nothing" is to leave no receptor hooked to it — which is already the default state.

### Summary

CA smell 3 (water) is the bloodstream mirror of map CA index 3, the ambient-moisture channel and the linchpin of C3's decomposition ecology. Unlike every other metered CA, it has no steady emitters — every water unit on the map is a pulse issued by a dying fauna, a decomposing fruit, an expiring fungus, or a dead creature's corpse, with the creature-death event contributing the single largest pulse (0.5 water + 0.5 nutrient). Per-room-type rates then shape the spatial distribution dramatically: corridors evaporate water in a few ticks, soil rooms hold it for minutes, ocean rooms hold it essentially forever, and cold-zone rooms block it entirely. Plants (grass, carrots, foxglove, banana cactus, desert grass) close the ecological loop by gating germination and growth on `prop room targ 3` thresholds, so "where things die" deterministically becomes "where things grow". The creature-level half of the pipeline, however, stops at the biochem copy: chem 168 is faithfully updated every tick but no standard gene consumes it and no `CACL` line routes it into the smell lobe, so creatures remain blind to the world's moisture field at both the brain and the chemistry layer. In a default, unmodified world running a default genome, chem 168 is therefore a **quiet witness to the death-and-growth cycle** running all around the creature — it spikes when a friend dies nearby, lingers in swampy rooms, sits at 0 in the dry corridors of the Shee ship, and none of it matters to the creature. Its value becomes behaviourally meaningful only when an author adds a receptor gene, a reaction, or a script that queries the chemical directly.
