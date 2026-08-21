# 174 - CA smell 9 (flowers)

Chemical 174 is the tenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 9**, which the engine's canonical naming table (`CASystem.js:31-36`, `biochemistry.json` row 8938) calls `"flowers"`. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `9`, and writes that float directly into biochemistry chemical `FIRST_SMELL_CHEMICAL + 9 = 174`.

Unlike its siblings CA 6 (protein), CA 7 (carbohydrate) and CA 8 (fat) — which are actively fuelled by food agents and wired into the smell lobe — **CA 9 (flowers) is an allocated-but-unused channel in the standard Creatures 3 bootstrap**. The rate table in `!map.cos` reserves a full CA-smell-style propagation profile for it, the engine hard-codes the per-tick SensoryFaculty write so the chemical still tracks the room field, and the halfLives table gives it the usual 1241-tick decay — but **no agent script emits CA 9**, **no `cacl` line in `z_agent smells.cos` binds it to a smell-lobe neuron**, and **no genome reaction or receptor reads it**. It is a reserved slot: wired at the engine and map-rate levels for a "flower smell" category the designers planned to populate but never shipped.

Architecturally, chem 174 can be characterised by four properties:

1. **Engine-level plumbing is present.** The SensoryFaculty loop does not special-case CA 9; it runs the same `SetChemical(FIRST_SMELL_CHEMICAL + 9, roomValue)` call it runs for every other CA smell. So whenever a creature is inside any room, chem 174 is rewritten each sensory tick with whatever value the room currently holds for CA 9 — even though the game never puts any signal into CA 9 in the first place. In practice this means chem 174 is **pinned at zero for the entire game**, because the source field is never energised.
2. **The map rate table is fully configured.** `!map.cos:1668-1983` sets up a complete 16-room-type propagation profile for CA 9 that is **identical to CA 6, CA 7 and CA 8** (gain 0.99 air/indoor/water, 0.40 soil, 0 cold; loss 0.001; diffusion 0.8). The designers clearly intended CA 9 to propagate across the world like a food-smell gradient and had allocated the tuning slot for it.
3. **There is no CACL binding in the standard bootstrap.** `z_agent smells.cos` contains exactly nine CACL lines mapping CA indices {6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18} into the smell lobe — CA 9 is conspicuously absent. Consequently, even if a modder emits CA 9 into a room, the value will correctly flow into chem 174 on every nearby creature but will **not** drive any smell-lobe neuron until a matching `cacl <family> <genus> <species> 9` line is added.
4. **There is no biochemistry-level consumer.** `biochemistry.json` contains chem 174 only in the `halfLives` table (entry 130, decay rate 0.99944177, ~1241-tick half-life). It appears nowhere in `reactions`, `receptors`, `emitters`, `neuroemitters`, or `organs`. The standard C3 genome therefore does not react to chem 174 at all — not biochemically, and not through the brain.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 9** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 9, smellValue)` → `Biochemistry.SetChemical(174, smellValue)`. In the standard game this value is always 0 because no agent ever injects CA 9 into the room field | Per tick — direct assignment (not additive) |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 174 <amount>` writes directly to the biochemistry. Overwritten back to 0 on the next sensory tick if the creature is inside a room (because the room field itself is 0) | Author-defined |
| 3 | **Ingestion of agents containing chem 174** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 174 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |
| 4 | **Mod-added `emit 9` or `altr room targ 9`** | — | — | Any add-on agent can seed CA 9 in a room using `emit 9 <value>` or `altr room targ 9 <delta>`. The field will then propagate across the world using the rate table, and every creature entering such a room will see chem 174 rise. **Not used anywhere in the standard bootstrap** | Author-defined |

### Emitters of CA 9 — the empty set

A full-text scan of every `.cos` file shipped in `Rebuild/Assets/Bootstrap/` finds **zero** occurrences of `emit 9 <x>` and **zero** occurrences of `altr room targ 9 <x>`. The CA 9 field is therefore permanently **0 throughout the world** in a vanilla C3 installation.

The contrast with CA 6/7/8 is sharp:

- CA 6 has apples, fish, and various fruit-family agents continuously broadcasting protein smell.
- CA 7 has grass, desert grass, pumperspikel and seed launchers firing carbohydrate pulses on dispersal events.
- CA 8 has carrots and the infinite cheese machine firing fat pulses on agent creation.
- **CA 9 has nothing at all.**

The canonical name "flowers" combined with the rate-table configuration strongly suggests the designers initially planned a flower-category of plant agents that would emit CA 9 in the same creation-time-pulse style as carrots. These flower agents never shipped — the standard C3 `PLANT MODEL - foxglove plant.cos`, `gumin grass.cos`, `fungi.cos`, etc. emit CA 7 (carbohydrate) rather than CA 9. The channel remains a scaffolding artefact visible throughout the engine.

### Per-room-type diffusion rates (reserved but never exercised)

From `!map.cos:1668-1983`, CA 9 has **the same rate profile as CA 6, CA 7 and CA 8** — ready for future use:

| Room type | gain | loss | diffusion | Behaviour for CA 9 (if ever emitted) |
|-----------|------|------|-----------|---------------------------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion |
| 1-4 (various indoor) | 0.99 | 0.001 | 0.80 | Same — passes freely through indoor rooms |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (40 %) — soil accepts flower smell less readily |
| 8-9 (water/ocean) | 0.99 | 0.001 | 0.80 | Full reception — would propagate to any aquatic flower emitter |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold) | 0.00 | 0.00 | 0.00 | Dead zones — no reception or diffusion |

A hypothetical `emit 9 0.5` pulse in an indoor room would decay with a ~693-tick (~23 s) half-life and fall to a tenth after ~2300 ticks (~77 s), identical to CA 6/7/8 behaviour. The plumbing is complete; only the content is missing.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **No smell-lobe neuron write** | — (no CACL line in `z_agent smells.cos`) | — | No `cacl ? ? ? 9` mapping exists in the standard bootstrap | CA 9 never drives any smell-lobe neuron. A breeder/modder would need to add a `cacl <family> <genus> <species> 9` line to wire it up |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 174 is 0 inside rooms anyway |
| 3 | **No genome-defined reaction or receptor** | — | — | — | Chem 174 has **no entry in `biochemistry.json`'s `reactions`, `receptors`, `emitters`, `neuroemitters`, or `organs` arrays**. Only the `halfLives[130]` decay entry exists |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 174 | Threshold / gain / locus author-defined | A breeder can add receptors that read chem 174 to produce direct biochemical responses to flower-smell proximity (none exist in the standard genome) |

**No genome-defined reaction, receptor, or emitter in the standard C3 genome touches chemical 174. No bootstrap agent emits CA 9. No CACL line maps CA 9 to the smell lobe.** Chem 174 is therefore a completely inert chemical in a vanilla Creatures 3 session — it always reads as 0.

## Role in Game Mechanics

### The "reserved slot" design pattern

CA 9 is one of several **reserved CA indices** in the Creatures 3 map system. A look at the full CA index table illustrates the design:

| CA index | Canonical name | Used in standard bootstrap? | CACL binding? |
|----------|---------------|-----------------------------|--------------|
| 0 | sound | Yes (ambient sound emitters) | No (direct sensory input) |
| 1 | light | Yes (light sources) | No (direct sensory input) |
| 2 | heat | Yes (heat sources) | No (direct sensory input) |
| 3 | water (soil nutrient A) | Yes (plants, detritus) | No (soil-cycle input) |
| 4 | nutrient | Yes (plants, detritus) | No (soil-cycle input) |
| 5 | water2 | Yes (aquatic agents) | No |
| 6 | protein | Yes (apples, fish) | Yes (`cacl 2 8 0 6`) |
| 7 | carbohydrate | Yes (grass, foxglove, fungi, seeds) | Yes (`cacl 2 3 0 7`) |
| 8 | fat | Yes (carrot, cheese) | Yes (`cacl 2 11 0 8`) |
| **9** | **flowers** | **No — reserved but never emitted** | **No** |
| 10 | machinery | Yes (logic gates, machine emitters) | Yes (`cacl 3 3 0 10`) |
| 11 | creatureSmell1 / teachable | Yes (creature emissions) | Yes (`cacl 3 4 1 11`) |
| 12-14 | norn/grendel/ettin smell | Yes (creature self-broadcast) | Yes (`cacl 4 ? 0 12-14`) |
| 15-17 | norn/grendel/ettin home | Yes (home-area markers) | Yes (`cacl 3 5/6/7 0 15/16/17`) |
| 18 | (vendor-category smell) | Yes (vendors) | Yes (`cacl 3 8 0 18`) |
| 19 | unused19 | No | No |

CA 9 and CA 19 are the two CA indices with **no standard-bootstrap emitter and no CACL mapping**. CA 9 is the more interesting of the two because it has a **canonical semantic name** ("flowers"), a **fully-configured rate-table entry** identical to the other food-smell channels, and a **halfLives entry** in `biochemistry.json`. Every layer of the engine is prepared to handle CA 9 — only the content authors skipped it.

This is a common design pattern in engine projects: an extensibility slot is allocated in all central tables, the mechanical infrastructure is duplicated from a working sibling, and only the gameplay-specific content remains as an open task. CA 9 was presumably intended to support a flower-category of plant agents — perhaps decorative plants emitting a category of smell distinct from the edible grass/foxglove/fungi that drive CA 7 — and the chem/rate/chemname plumbing was laid down in advance. The flower agents themselves never shipped.

### What the channel would do if populated

If a modder adds a flower agent that runs `emit 9 0.5` on creation, the full infrastructure comes alive:

1. **Room field energises.** The `emit 9 0.5` pulse is added to the room's CA 9 value. Over subsequent ticks, the field propagates across adjacent rooms at 0.80 diffusion, retains 99.9 % of its contents per tick (loss 0.001), and builds long smooth gradients across the indoor/outdoor biome.
2. **SensoryFaculty propagates into creatures.** Every sensory tick, any creature in a room with non-zero CA 9 has its chem 174 overwritten with the local field value. A creature walking towards the emitter sees chem 174 rise; walking away sees it fall.
3. **Without a CACL line the brain is blind.** As long as no `cacl <family> <genus> <species> 9` line is present, chem 174 is not routed to any smell-lobe neuron. The creature has the biochemical marker "flower smell near" in its bloodstream but no cognitive access to it.
4. **Adding a CACL line wires the brain.** A modder could add e.g. `cacl 2 5 0 9` to their startup script to map CA 9 → the smell-lobe neuron for `(family 2, genus 5, species 0)` — a chosen flower category. Every flower agent declared with that family/genus would then register on the creature's "I smell flower" neuron, and the creature could learn to associate it with whatever reward structure the modder provides (e.g. a cosmetic social drive, or a novel hunger satisfier).
5. **Adding a receptor gene enables biochemical response.** A modder could further add a receptor locus reading chem 174 to produce direct physiological effects — e.g. "flower smell → mild tranquilliser release" — independent of the brain pathway.

### Inside-room vs outside-room behaviour for chem 174

Same architectural rule as for chems 171/172/173. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 174 tracks the world or decays in isolation:

- **Inside any room.** Chem 174 is overwritten every sensory tick with the room's live CA 9 value (which is 0 by default). The 1241-tick half-life is moot.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 174 follows pure first-order decay at rate 0.99944177 per tick — but since the value inside rooms is 0 anyway, there is effectively nothing to decay.

### The `-MyContribution` subtraction is a no-op here

For CA indices that are bound to the creature's own category via CACL (e.g. CA 12 = Norn smell on a Norn), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe using `GetRoomPropertyMinusMyContribution`. For CA 9 this branch is never taken — no CACL line binds CA 9 to any creature family, and no creature emits CA 9 on itself.

### Practical consequences

- **`chem TARG 174` is effectively dead-code in a vanilla game.** Every read returns 0. It is a "safe to overwrite" slot for debugging, experimentation, or mod use.
- **Flooding chem 174 via `chem 174 255` has no observable effect.** No reaction consumes it. No receptor reads it. No brain neuron is wired to it. The sensory overwrite restores it to 0 on the following tick if the creature is in a room. This makes it a useful **null-chemical marker** for testing the SensoryFaculty pipeline itself — confirming that the per-tick overwrite is running can be verified by injecting chem 174 and watching it be zeroed.
- **The channel is a clean extension point.** A modder wanting to add a "flower smell" category to an expansion pack or genetic engineering experiment can use CA 9 / chem 174 without touching any existing gameplay. The name is already canonical, the rate table is already tuned, and no standard agent or genome will be disturbed.
- **Two edits are enough to fully activate the channel.** (1) Add an `emit 9 <x>` call to a mod-agent's placement script. (2) Add a `cacl <family> <genus> <species> 9` line to a startup script (or a patch layered over `z_agent smells.cos`). With those two changes the brain-to-world pathway is complete; a third edit adding a receptor gene to the genome would also enable biochemical responses.
- **The channel does not appear in the smell-lobe's default category list.** Because no `cacl` line maps CA 9 to the smell lobe, the lobe's 40-neuron category space is not reserved for flowers in the standard genome. A modder who wires CA 9 up has to pick an existing smell-lobe neuron slot for their flower category.
- **Breeding cannot "turn on" CA 9.** Because the activation requires bootstrap-level CAOS additions (both an emitter agent and a CACL line), no amount of genetic mutation alone will cause a creature to smell flowers. This is structural: the CACL binding is a bootstrap/world-setup responsibility, not a per-creature genome responsibility.

### Comparison with CA 19 (the other unused slot)

CA 19 (`unused19`) is the only other CA index that is not emitted by any standard agent. The two slots differ subtly:

- **CA 9 has a meaningful canonical name** ("flowers"), its rate-table entries in all 16 room types are configured identically to the food-smell channels, and the absence of any emitter feels more like a dropped feature than a deliberate null.
- **CA 19 is explicitly labelled `unused19`** and is configured as a generic full-propagation channel. It reads as a deliberate placeholder for later expansion.

Both channels are functionally equivalent from the runtime's perspective — zero in the field, zero in the chemical — but CA 9's naming and rate-profile-parity with CA 6/7/8 signal that the design was further along before the feature was cut or deferred.

### Summary

Chemical 174 — CA smell 9 (flowers) — is a **reserved but unused** slot in the Creatures 3 sensory pipeline. The engine hard-codes the per-tick SensoryFaculty write that maps room CA 9 into chem 174, the map rate table in `!map.cos` configures CA 9 with a full food-smell-style propagation profile identical to CA 6/7/8, the halfLives table gives it the same 1241-tick decay as the other CA-smell chemicals, and the chemical catalogue names it canonically as "flowers". But no bootstrap agent runs `emit 9` and no `cacl` line in `z_agent smells.cos` binds CA 9 to a smell-lobe neuron, so in a vanilla C3 session the field is always 0, chem 174 always reads as 0, and the chemical has no observable effect on creature behaviour or biochemistry. The slot appears to be a dropped feature — an intended flower-category of plant agents whose in-world placement script would have fired creation-time `emit 9` pulses in the same style as carrots (CA 8) — left as scaffolding after the content was deferred. For modders it is a clean, well-named, pre-tuned extension point: two bootstrap edits (one `emit 9` call in a mod agent and one `cacl` line in a patch) are enough to bring the channel fully online, and a third optional receptor-gene addition would enable biochemical responses in addition to the brain-smell pathway.
