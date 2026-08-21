# 169 - CA smell 4 (nutrient)

Chemical 169 is the fifth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) that act as the creature's *internal copy* of the environment's cellular-automata channels. Each room in the map carries `CA_PROPERTY_COUNT = 20` scalar values (the "CA properties") that diffuse between rooms through doors; every SensoryFaculty tick the creature looks up its own room, reads CA property `i`, and writes that float directly into biochem chemical `FIRST_SMELL_CHEMICAL + i` (= 165 + i). Chem 169 is therefore the bloodstream mirror of **CA index 4**, which the engine's canonical naming table labels `"nutrient"` (`CASystem.js:31-36`, matching the original `ChemicalNames.catalogue`).

CA 4 (nutrient) is the world's **soil-fertility channel**: it models the store of organic nutrient matter that accumulates in rooms floored with soil, and it is the second pillar — paired with CA 3 (water) — of the bootstrap's decomposition-driven ecology. Unlike every other metered CA channel, CA 4 is **geographically confined**: the `!map.cos` rate table gives it non-zero gain/loss/diffusion *only* in room types 5, 6, and 7 (the soil room types). In every other room type — outdoor air, walkways, water, cold-zones — `rate X 4 0.000000 0.000000 0.000000` completely disables the channel. The world's nutrient field therefore lives exclusively on the ground, which is exactly where a real ecosystem's nutrients live.

Like CA 3, CA 4 has **no steady `EMIT 4` sources anywhere in the bootstrap** — nutrient is injected only as **discrete pulses** via `altr room targ 4 <amount>` issued from death / decomposition scripts, and it is *consumed* by plants (grass, carrots, foxglove, cactus) that subtract nutrient from the soil as they grow. The resulting cycle is the textbook soil-nutrient loop: *corpse → nutrient in soil → plants eat nutrient → plants grow → fauna eat plants → fauna die → nutrient back into soil*. Of the twenty CA channels, nutrient is the one most tightly bound to a single biological metaphor.

At the creature's own chemistry level, however, chem 169 is still a **reserved blank**. The SensoryFaculty writes it every tick, but no standard genome has a receptor for it, no reaction consumes it, and no `CACL` line maps CA 4 to a smell-lobe classifier (`z_agent smells.cos` uses ca_index values 6,7,8,10,11,12,13,14,15,16,17,18 — never 4). The standard hunger drives of a creature are driven by direct food-ingestion biochem, not by the ambient CA 4 → chem 169 loop.

The dichotomy is the key to this chemical: CA 4 is an **authored-world signal** (plants, scripts, and the ecology cycle use it extensively), whereas chem 169 is the **biochem copy of that signal** — always populated, queryable from CAOS on the creature (`chem TARG 169`), but not wired into creature cognition by default.

Its only guaranteed runtime behaviours are: (a) being overwritten each tick with the current room's CA 4 value while the creature stands inside any valid room, and (b) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms (the `GetRoomIDForPoint` guard fails, so the SetChemical overwrite is skipped and only the normal chemical decay runs). In practice, because the only rooms that *have* non-zero CA 4 are the soil rooms, chem 169 is near-zero for any creature standing anywhere *except* standing on soil.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 4** | — (hard-coded in engine) | `SensoryFaculty::Update` | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 4, smellValue)` → `Biochemistry::SetChemical(169, smellValue)` | Per tick — direct assignment (not additive), so the value tracks the local room's CA 4 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 169 <amount>` writes directly to the biochemistry. Effect is overwritten on the next sensory tick if the creature is inside a room, so it is only persistent when the creature is roomless | Author-defined |
| 3 | **Ingestion of agents containing chem 169** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 169 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

The room-side CA 4 value that feeds source (1) is produced exclusively by `altr room targ 4 <amount>` calls — the engine never emits CA 4 on its own, and no bootstrap agent runs `emit 4`. Every unit of soil nutrient in the world therefore came from a scripted pulse. The canonical pulse sites are **paired 1:1 with the CA 3 (water) pulses** documented in the water chemical's entry — wherever something dies or decomposes, it releases equal amounts of CA 3 (water) and CA 4 (nutrient) in almost every case:

- **Creature death** (`creatureInvoluntary.cos:340-348`, `scrp 4 0 0 72` — family 4 = creature, event 72 = die): when a creature dies with no carrier, `altr room targ 4 0.5` adds the single largest nutrient pulse in the game, paired with `altr room targ 3 0.5` (water). A creature corpse fertilises its resting room more than any other event.
- **Meerkat death** (`meerk.cos:214`): `altr room targ 4 0.4` + `altr room targ 3 0.2` — the only non-creature event that pulses more nutrient than water, i.e. meerkats leave *more* fertiliser than moisture behind. The slight imbalance makes them a net enricher of soil.
- **Rocklice** (`rocklice.cos:772, 782`), **fungi** (`fungi.cos:215, 232, 242`), and **Hummingbird** death (`Hummingbird.cos:992, 1001`) each add 0.2 nutrient on death / decomposition.
- **Most fauna deaths** (0.1 pulse): insect kills (`wasp.cos:406`, `bee.cos:844`, `dragonfly.cos:705,719,1308,1323`, `Butterfly.cos:1160,1168,1182`, `ant.cos:753,763`), aquatic mortality (`man-o-war.cos:487,497`, `piranha.cos:130,400`), mammalian kills (`grazer2.cos:820,1114`) all issue `altr room targ 4 0.1` paired with an equal CA 3 pulse. Because only soil rooms can hold the pulse, an insect that dies in the air or on a walkway delivers its nutrient into a *room that cannot store nutrient at all*, and it evaporates to zero instantly (`rate X 4 0.0 0.0 0.0`). The ecological effect is concentrated where fauna can land on soil.
- **Decomposing plants and fruit**: rotting apples (`apples.cos:117, 157`) and pumperspikel (`pumperspikel.cos:143`) emit the small `0.01` pulse; carrots (`Carrot.cos:145, 152`) pulse `0.01` on growth events, providing a modest feedback signal that growing carrots improve their own soil.
- **Cactus (banana cactus)** (`cacbana.cos:133, 274, 318, 546`): big-agent, multi-phase nutrient events from 0.1 to 0.5, plus author-scripted positive and negative pulses in its growth/decay cycle. `altr room targ 4 0.5` at line 133 is a major cactus death pulse matching the creature-death magnitude.
- **Foxglove plant** (`PLANT MODEL - foxglove plant.cos:334`): `altr room targ 4 va00` — mature foxgloves write a computed amount of nutrient into the room as part of their active soil participation.
- **Foxglove seed** (`PLANT MODEL - foxglove Seed.cos:191`): a token `0.0001` pulse.
- **Grass and desert grass** (`grass.cos:270, 451`, `desert grass.cos:269`): grass emits a tiny `0.001` on decomposition and, critically, a **negative** pulse during growth (line 451: `altr room targ 4 va00` where `va00 = negv va91 / 2`, so growth *subtracts* half of the consumed value from the soil — grass eats its nutrient as it grows). This makes grass the primary nutrient *sink* in the ecology.
- **`ALTR` CAOS command**: the generic one-shot additive write to a specific room's CA 4, used by all of the above. Allowed because CA 4 is not in the navigable set `{6,7,8,10-18}`.

From there CA 4 diffuses between rooms every two game ticks through the standard two-phase CA update (`CASystem`), but only among soil rooms. The `!map.cos` bootstrap configures **a pure soil-only model** (`!map.cos:1663-1762`):

| Room type | gain | loss | diffusion | Behaviour for CA 4 |
|-----------|------|------|-----------|--------------------|
| 0 | 0.00 | 0.000 | 0.00 | **Blocked** — outdoor air does not carry or hold nutrient |
| 1 | 0.00 | 0.000 | 0.00 | **Blocked** — walkways do not carry nutrient |
| 2 | 0.00 | 0.000 | 0.00 | **Blocked** |
| 3 | 0.00 | 0.000 | 0.00 | **Blocked** |
| 4 | 0.00 | 0.000 | 0.00 | **Blocked** |
| 5 | 1.00 | 0.001 | 0.90 | **Soil** — full reception, 0.1 %/tick loss, near-full diffusion. Nutrient accumulates here and leaks slowly |
| 6 | 1.00 | 0.001 | 0.90 | **Soil** — same profile |
| 7 | 1.00 | 0.001 | 0.90 | **Soil** — same profile |
| 8 | 0.00 | 0.000 | 0.00 | **Blocked** — water/ocean does not carry nutrient |
| 9 | 0.00 | 0.000 | 0.00 | **Blocked** — water/ocean |
| 10 | 0.00 | 0.000 | 0.00 | **Blocked** — walkway |
| 11-15 | 0.00 | 0.000 | 0.00 | **Blocked** — cold-zone and other non-soil types |

The physical intuition could not be clearer: **nutrient exists only in soil**. No matter what the script pumps into a corridor or an ocean room, the `rate X 4` entry forces gain to 0, loss to 0, and diffusion to 0, so the room can neither gain nor lose nor spread CA 4 — it stays pinned at its initial value (usually 0). Only the three soil room types (5, 6, 7) participate in the nutrient field. Within them the near-zero 0.001 loss rate (0.1 %/tick) makes nutrient an essentially persistent resource: a pulse of 0.1 fades with a half-life of ~693 ticks (~23 s at 30 tps), meaning corpses and decomposition events enrich soil for minutes rather than seconds.

A creature standing on a non-soil room reads chem 169 ≈ 0 regardless of events anywhere in the world; a creature standing on soil reads the long-term accumulation of decomposition in that soil patch. Nutrient thus gives a strongly *location-keyed* signal — "am I standing on fertile ground" is answered precisely, while all non-soil positions collapse to "no data".

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails the SensoryFaculty overwrite is skipped, so the chemical simply decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 2 | **Smell-lobe neuron write** (reads CA 4, not chem 169) | — (hard-coded) | `brain->SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager::GetCategoryIdFromSmellId(4)` | The smell lobe has 40 neurons (`brain-architecture.json` lobe index 14). For CA index `i` the brain neuron is chosen by the classifier-to-CA mapping set via the `CACL` CAOS command | In the default bootstrap (`z_agent smells.cos`) **no `cacl … … … 4` line exists** — the ca_index slot takes values 6,7,8,10,11,12,13,14,15,16,17,18 but never 4. `ourCategoryIdsForSmellIds[4]` stays at its initialised `-1` value. `SetInput("smel", -1, …)` is a no-op, so ambient nutrient produces no smell-lobe activation by default |
| 3 | **Plant agent behaviour** (reads CA 4, not chem 169) | — | — | `setv vaXX prop room targ 4` and `doif prop room targ 4 ge/gt <threshold>` | Plants and a few fauna compare the room's CA 4 directly to thresholds and either gate germination/growth on sufficient nutrient, or extract nutrient from the soil. See "Non-creature consumers" below |
| 4 | **Plant consumption of CA 4** (reads *and writes* CA 4) | — | — | `altr room targ 4 <negative-va>` | Grass and foxglove subtract nutrient from the soil as they grow — the only bootstrap mechanism that *removes* CA 4 from a room other than the 0.1 %/tick passive loss |
| 5 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 169 | Threshold / gain / locus author-defined | Breeders / genome hackers can add receptors that read chem 169 to give creatures a soil-smell sense. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter touches chemical 169 in the standard C3 genome.** Searching `biochemistry.json` for references to chemical id 169 returns only the `halfLives` entry (1241-tick half-life, genome value 72, "Long" speed) and unrelated entries where `169` happens to appear as an id/geneId/nominal of a *different* reaction targeting chem 99 (Vitamin C) or chem 112 (Anabolic steroid). No creature drive is driven by ambient nutrient, and no internal chemistry consumes or produces chem 169 during a creature's life.

## Role in Game Mechanics

### CA 4 is a *soil-only* field

The defining feature of CA 4 versus every other CA channel is its **per-room-type gating**: all non-soil room types (0, 1, 2, 3, 4, 8, 9, 10, 11-15) have `rate 0 0 0` for CA 4, which means nutrient cannot enter, leave, or spread in those rooms. The nutrient field is therefore not a world-wide continuous field like heat or water; it is a collection of **isolated soil patches**, each accumulating nutrient independently from local decomposition events and draining only through local plant consumption. This is a deliberate and distinctive modelling choice — nutrient behaves like topsoil, not like air.

A practical consequence: an insect that dies in mid-air, on a stone walkway, or in the ocean releases its 0.1 nutrient pulse into a room that cannot hold any nutrient, so the pulse evaporates to zero in the next CA tick. Only fauna that fall onto soil — or creatures/meerkats that die on soil floors — actually enrich the ecology. This concentrates the ecology's feedback loop on the ground, where plants already live.

### The decomposition cycle (paired with CA 3)

Nutrient and water are **coupled** through the death/decomposition pulse pattern. Every death script that writes CA 3 also writes CA 4, almost always in equal amounts:

```
scrp 4 0 0 72      ; Creature::DeathScript (die event)
  ...
  doif room ownr ne -1 and carr eq null
    altr room targ 3 0.5     ; water
    altr room targ 4 0.5     ; nutrient
  endi
  ...
```

The paired injection means that whenever organisms die, the ground gets **water-and-nutrient-rich** simultaneously — the biologically realistic precondition for plant growth. But the *distribution* of the two channels ends up radically different:

- CA 3 (water) spreads to every non-cold room with varying loss rates, so the water field is a smooth map of recent mortality plus inherent room humidity.
- CA 4 (nutrient) stays locked inside the soil rooms where the corpse landed, so the nutrient field is a sharp, patchy map of where organisms specifically died *on soil*.

A creature walking through a dry walkway where an insect just died reads chem 168 (water) spiking but chem 169 (nutrient) at 0, because the walkway cannot hold nutrient. Walking a few metres further into a soil room reads the reverse — nutrient accumulated from weeks of local decomposition, water at whatever the current soil steady state is.

### Plant growth gating on nutrient

Plants use `prop room targ 4` as a hard gate on germination and growth. The pattern is consistent across species:

- **Carrots** (`Carrot.cos:87, 159`): `doif prop room targ 2 gt 0.2 and prop room targ 4 gt 0.3 … doif prop room targ 3 gt 0.1` — carrots require heat > 0.2 AND nutrient > 0.3 AND water > 0.1, a triple gate where the nutrient threshold is the highest-demanding of the three. Carrots will self-abort (`kill ownr`) if any threshold is missed. This makes carrots a sensitive bio-indicator of a truly fertile room.
- **Fungi** (`fungi.cos:80`): `doif prop room targ 4 ge ov87` — fungi gate germination on nutrient above an author-set threshold (`ov87`). Fungi thus cluster on soil patches recently enriched by death.
- **Tendril plants** (`tendril.cos:129`): same `doif prop room targ 4 ge ov87` pattern.
- **Cactus (banana cactus)** (`cacbana.cos:315, 541`): `doif prop room targ 4 ge ov70` — banana cacti only proceed with certain growth / flowering phases when nutrient exceeds the author-set threshold `ov70`. Also reads `setv va00 prop room targ 4` for conditional branching.
- **Foxglove plant** (`PLANT MODEL - foxglove plant.cos:299`): `setv va04 prop room targ 4` — mature foxgloves monitor soil nutrient and branch subsequent behaviour on its value, including emitting/absorbing nutrient themselves.
- **Grass and desert grass** (`grass.cos:416`, `desert grass.cos:414`): `setv va04 prop room targ 4` — grass monitors nutrient similarly.

The plant ecology is thus a multi-channel filter over soil rooms: a carrot can only continue growing in rooms whose heat, water, and nutrient all fall inside authored ranges, and the resulting spatial distribution of plants is essentially a map of those ranges. Nutrient is typically the *bottleneck* channel, because its source rate (sum of local death events) is independent of sunlight or weather and is directly limited by local fauna mortality.

### Plant consumption — the ecology's net nutrient sink

Uniquely among the CA channels, CA 4 has an **active consumer**: grass (`grass.cos:445-451`). During the grass growth subroutine, `va91` accumulates a growth-proportional value which is then negated and halved before being added to the soil:

```
setv va00 va91
negv va00               ; va00 = -va91
divv va00 2             ; va00 = -va91 / 2
altr room targ 4 va00   ; subtracts va91/2 from room's CA 4
```

This is the game's model of plants eating soil nutrient — a feedback that creates steady-state dynamics in populated soil rooms: nutrient rises when fauna die, falls when grass grows, and the equilibrium determines how much grass a patch can sustain. The 0.1 %/tick passive loss in soil rooms is a secondary drain; the grass-consumption term is the primary biologically-meaningful sink.

This active consumption is what prevents soil nutrient from monotonically increasing and allows the ecology to reach non-trivial equilibria. Without it, every death event would permanently enrich the soil (with only 0.1 %/tick natural drain), and nutrient would pile up forever in heavily populated patches. With it, grass density becomes the self-regulating valve.

### Inside-room vs outside-room behaviour

The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check is the single line that decides whether the creature's chem 169 tracks the world or decays on its own:

- **Inside any room.** Chem 169 is overwritten every sensory tick with the room's live CA 4 value. Because CA 4 is 0 in every non-soil room, a creature standing anywhere except on soil reads chem 169 ≈ 0. A creature standing on soil reads the accumulated value, which for a well-populated soil patch can reach several tenths of a unit.
- **Outside all rooms** (mid-air during a fall with no room below the down-foot position, or in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 169 follows pure first-order decay at rate 0.99944177 per tick.

Because virtually every non-soil room permanently reads 0 CA 4, chem 169 on a Norn in normal play is almost always either 0 (anywhere except soil) or a small positive value (on soil), with essentially no transient excursions. It is the least noisy of the five metered CA smell chemicals (165-169).

### The `-MyContribution` subtraction and why CA 4 skips it

For CA indices that *are* bound to the creature's own category (e.g. a Norn looking at CA 12 = Norn smell), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. For CA 4 this branch is never taken (creatures do not have a standing `emit 4` on themselves), so the full room value is what flows into chem 169. The creature's own death does still pump CA 4 into the room — but by that point the creature's sensory loop is no longer running.

### Practical consequences

- **`chem TARG 169` is a live soil-fertility sensor.** A CAOS script querying chem 169 on a creature reads the current room's CA 4 value (with one-tick lag). This gives an exceptionally selective signal: a non-zero chem 169 means "standing on soil", and its magnitude indicates how recently the soil has been enriched by decomposition. No other channel answers both questions at once.
- **Flooding chem 169 via `chem 169 255` has no behavioural effect on a standard creature.** No receptor reads it, no reaction consumes it, and the SensoryFaculty overwrites it on the next tick if the creature is in a room. The stim-chemical offset (`STIMTOBIOCHEMOFFSET = 148`) maps chem 169 to stim chemical 21, but no stim gene in the standard genome targets stim chemical 21 either.
- **Adding a "soil-smell" Norn variant is a single-gene change.** Because no existing receptor or reaction uses chem 169, a breeder can safely add one receptor locus against chem 169 (e.g. `Drive: Hunger for Protein − Chemical 169 (nutrient) → reduce Hunger for Protein` to model "Norns sense fertile soil as a promise of protein-bearing plants and browsing fauna", or `Drive: Boredom − Chemical 169 → reduce Boredom` to model "Norns find fertile ground inherently engaging"). The SensoryFaculty-driven overwrite guarantees the receptor sees live data.
- **Standard creature hunger is internal, not environmental.** Creature hunger-for-protein / carbohydrate / fat drives in C3 are driven by internal biochem reactions triggered by eating, not by ambient CA 4. CA 4 and chem 169 are **environmental** nutrient; the drive chemicals model **body** nutrient stores. Bridging them is left to the breeder.
- **Nutrient is the ecology's single best "has an ecosystem lived here" indicator.** A soil room with high chem 169 is a room where fauna have died and decomposed; a soil room with near-zero chem 169 is either newly created, recently over-grazed by grass, or never inhabited. Checking chem 169 across different soil rooms is a cheap way for a script to find "healthy" biomes.
- **Breeding out the sensory pathway is not possible.** Because the per-tick SetChemical is engine-hard-coded (not a gene), no genetic mutation can stop chem 169 from tracking room CA 4. The only way to make chem 169 "do nothing" is to leave no receptor hooked to it — which is already the default state.

### Summary

CA smell 4 (nutrient) is the bloodstream mirror of map CA index 4, the soil-fertility channel and the co-linchpin (with water) of C3's decomposition ecology. It is the most geographically confined of all CA channels: `rate` entries restrict it to room types 5, 6, and 7 (soil) and completely block it elsewhere, so the nutrient field exists only on the ground. Like water, nutrient is pulse-driven rather than emitter-driven — every gram of it came from a death or decomposition script, most commonly paired 1:1 with an equivalent water pulse. The ecology loop closes through active plant consumption: grass eats nutrient during growth (`altr room targ 4 <neg>`), making the grass population the self-regulating sink that prevents soil from enriching unboundedly. Plants (carrots, fungi, foxglove, cactus, tendrils) gate germination and growth on `prop room targ 4` thresholds, so nutrient directly determines what grows where. The creature-level half of the pipeline, however, stops at the biochem copy: chem 169 is faithfully updated every tick but no standard gene consumes it and no `CACL` line routes it into the smell lobe, so creatures remain blind to soil fertility at both the brain and the chemistry layer. In a default, unmodified world running a default genome, chem 169 is therefore a **silent altimeter of soil health** — it jumps to a positive value the moment a creature steps onto recently-enriched soil, drops back to 0 the moment it steps off, and the creature notices none of it. Its value becomes behaviourally meaningful only when an author adds a receptor gene, a reaction, or a script that queries the chemical directly — at which point a creature can learn to treat fertile soil as the promise of food, water, and a future meal that it really is.
