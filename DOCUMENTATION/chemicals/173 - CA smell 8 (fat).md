# 173 - CA smell 8 (fat)

Chemical 173 is the ninth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 8**, which the engine's canonical naming table (`CASystem.js:31-36`, `biochemistry.json` row 8929) calls `"fat"`. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `8`, and writes that float directly into biochemistry chemical `FIRST_SMELL_CHEMICAL + 8 = 173`. CA 8 is the **fat-food broadcast channel**: its emitters are the two agents in the standard bootstrap that the designers categorised as fatty food — **carrots** (growing in-ground and picked) and **the infinite cheese machine** (the perpetual cheese dispenser placed around the ship). Where CA 6 (protein) says "live protein is over there" and CA 7 (carbohydrate) says "a plant has just seeded over there", CA 8 (fat) says "a lump of fatty food is *sitting right there*".

Architecturally, chem 173 is a direct sibling of chem 171 (CA 6, protein) and chem 172 (CA 7, carbohydrate) with four defining properties:

1. **Its sources are creation-time event pulses.** Every carrot and every cheese spawns with one `emit 8` call in its placement script. There is no per-tick top-up and no `altr room targ 8` elsewhere in the bootstrap, so the field is seeded by carrot/cheese creation events and then decays through the map rate table. One carrot emits 0.5 as it appears; one cheese emits 0.35.
2. **It *is* wired into the smell lobe.** `z_agent smells.cos:8` runs `cacl 2 11 0 8`, mapping CA 8 to the smell-lobe neuron categorised as `(family 2, genus 11, species 0)` — the "fatty food" category. Both the carrot (`2 11 1`) and every cheese lump produced by the infinite cheese machine (`2 11 2`) share family-2 genus-11 and therefore classify into this single smell-lobe neuron. The bootstrap comment at `z_agent smells.cos:7` names this channel explicitly: `*fat smell 8: carot, cheese`.
3. **Its per-room rate profile matches CA 6 and CA 7 exactly** — gain 0.99 / loss 0.001 / diffusion 0.8 in air, indoor and water rooms; gain 0.40 in soil room types 5-7; blocked (0/0/0) in cold zones (room types 11-15). The fat-food signal is designed to spread widely through the indoor/outdoor biome and persist for a long time after each emission.
4. **No genome reaction or receptor consumes it.** Like every other CA-smell chemical, chem 173 has no default entry in `biochemistry.json`'s `reactions` or `receptors` arrays. Its entire runtime behaviour is: (a) being overwritten each tick with the current room's CA 8 value while the creature is inside any valid room, (b) being fed into the smell lobe neuron for fatty-food agents via the `cacl 2 11 0 8` mapping, and (c) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 8** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 8, smellValue)` → `Biochemistry.SetChemical(173, smellValue)` | Per tick — direct assignment (not additive), tracks local room's CA 8 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 173 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room | Author-defined |
| 3 | **Ingestion of agents containing chem 173** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 173 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

### Emitters of CA 8 — what actually fuels the room field

CA 8 is fuelled by the two fatty-food agent families in the standard bootstrap. Every emission is a **one-shot pulse at creation time**, not a per-tick top-up:

| Agent | Script location | Trigger | Intensity | Meaning |
|-------|-----------------|---------|-----------|---------|
| **Carrot (fresh, in-ground)** | `Carrot.cos:13` (main startup loop, 10 carrots spawned) | Once, when a new in-ground carrot is placed in the world | **0.5** | "A fresh carrot has just been planted here" |
| **Carrot (picked, loose)** | `Carrot.cos:26` (main startup loop, 10 carrots spawned) | Once, when a new picked carrot is placed in the world | **0.5** | "A picked carrot is sitting here" |
| **Carrot (regrowth from detritus)** | `Carrot.cos:175` (inside the detritus-timer `scrp 2 10 26 9`) | Once, when a carrot regrows from rotted detritus in a suitable soil room | **0.5** | "A new carrot has just sprouted from detritus" |
| **Infinite cheese machine (placement)** | `infinite_cheese_machine.cos:132,145,158,171,184,197` | Once per cheese, at bootstrap time (six pre-placed cheeses around the ship) | **0.35** | "A lump of cheese is sitting here" |
| **Infinite cheese machine (dispense)** | `infinite_cheese_machine.cos:240` (inside `scrp 2 23 1 6463`, the dispenser's run-cycle script) | Once per cheese dispensed by the machine, triggered when a creature pushes/pulls it | **0.35** | "The machine has just dropped a fresh cheese here" |

There are **no `altr room targ 8`** calls anywhere in the bootstrap, and no hand-placed invisible emitters for CA 8. The entire CA 8 field is therefore an **object-driven** emergent signal: as carrots sprout or the cheese machine dispenses, the CA 8 field energises in those regions and then slowly decays. Unlike CA 6 (whose fish emitters fire every tick), **every CA 8 emission is a discrete one-shot pulse** triggered by the food's creation — so the signal is characteristically "patchy in time, smooth in space". A creature walking past a newly-placed cheese or carrot picks up a strong pulse that fades over roughly a minute of wall-clock play; a creature arriving later picks up a diminished residue.

The intensity asymmetry between carrots (0.5) and cheeses (0.35) mirrors the CA-6/CA-7 design pattern where certain "important" food events are given stronger broadcast weight. A carrot emission dominates a cheese emission at equal range; a cluster of six cheeses in a room, however, accumulates to a detectable steady-state field well above the single-carrot peak. The bootstrap places six cheeses in six different regions of the ship (Learning Room, Incubator Area, near the Lower Lift, Nice Nornish Roomy Place, Lower Corridor near Recycler, and one near the machine itself), so the ship-interior CA 8 field has a near-permanent "cheese baseline" augmented by whichever carrots happen to be fresh and any newly-dispensed cheeses.

### Per-room-type diffusion rates

From `!map.cos:1669-1983`, CA 8 has the **same rate profile as CA 6 and CA 7** — effectively a carbon copy of the food-channel table, so the three food-smell channels propagate identically:

| Room type | gain | loss | diffusion | Behaviour for CA 8 |
|-----------|------|------|-----------|--------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion — CA 8 spreads freely through open air |
| 1-4 (various indoor) | 0.99 | 0.001 | 0.80 | Same — CA 8 passes through indoor rooms without attenuation |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (only 40 %): soil rooms accept CA 8 less readily from neighbouring rooms, but retain what they do receive for a long time |
| 8-9 (water/ocean) | 0.99 | 0.001 | 0.80 | Full reception — would propagate to any aquatic fatty-food agent added by modders |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold) | 0.00 | 0.00 | 0.00 | No reception, no diffusion — cold zones are dead regions for fat smell |

The key pattern is **very low loss (0.001) combined with high diffusion (0.8) in every active room type**, identical to CA 6 and CA 7. A single `emit 8 0.5` pulse in an indoor room (a freshly-placed carrot) decays as follows:

- Tick 0: 0.5 deposited (scaled by gain 0.99 ≈ 0.495 received).
- Tick 1: room retains 99.9 % of its contents (loss 0.001), emits 80 % of its gradient to neighbours… but by the same mechanism receives 80 % of theirs back, so the equilibrium is near-full-conservation.
- After ~693 ticks (~23 s) the residue falls to half.
- After ~2300 ticks (~77 s) the residue falls to a tenth.

So a single carrot placement stays meaningfully above the noise floor for roughly a minute of wall-clock play, and the six pre-placed cheeses create a sustained multi-source gradient that creatures can track throughout the ship's interior. The soil-gain drop to 0.40 reflects the same design decision as CA 6 and CA 7: creatures traversing soil tunnels experience a mild dip in fat-smell strength rather than the tunnels becoming a high-capacitance reservoir that flattens gradients.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron write — "fatty food" category** | — (hard-coded pipeline; CACL binding in `z_agent smells.cos:8`) | `brain.SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager.GetCategoryIdFromSmellId(8)` | `cacl 2 11 0 8` maps CA 8 → the smell-lobe neuron whose category is `(family 2, genus 11, species 0)` — the *fatty food* category. The two standard-genome agents of family 2 genus 11 are the **carrot** (`2 11 1`) and the **cheese** produced by the infinite cheese machine (`2 11 2`). Any additional mod agent declared with family 2 genus 11 classifies into the same neuron | Non-zero chem 173 fires the fat-smell neuron in the smell lobe (lobe index 14, 40 neurons). This is the creature's brain-level "I smell fatty food" input, drivable into association learning — e.g. learning to push or eat a cheese when the fat neuron + hunger drive coincide |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails, the SensoryFaculty overwrite is skipped and chem 173 decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 3 | **No genome-defined reaction or receptor** | — | — | — | Chem 173 has **no entry in `biochemistry.json`'s `reactions` or `receptors` arrays**. The only path from CA 8 to behaviour goes through the brain, not the body |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 173 | Threshold / gain / locus author-defined | A breeder can add receptors that read chem 173 to produce "fat smell → salivation", "fat smell → hunger-for-fat anticipatory satiation", or other direct biochemical responses. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter in the standard C3 genome touches chemical 173 directly.** Its influence on creature behaviour is entirely mediated through the brain's smell lobe via the `cacl 2 11 0 8` CACL mapping.

## Role in Game Mechanics

### The fat neuron and its catchment

The CA 8 → `(2, 11, 0)` CACL binding means **every family-2 genus-11 agent classifies under the same smell-lobe neuron**. In the standard bootstrap there are only two such agents:

- **Carrot** (`2 11 1`) — the in-ground and picked carrots in `Carrot.cos`, plus the carrots that regrow from detritus.
- **Cheese** (`2 11 2`) — every cheese lump produced by the infinite cheese machine, both the six bootstrap placements and any dispensed at runtime.

The neuron does not distinguish between carrot and cheese: both foods smell the same to a Norn. Combined with the fact that both agents also run the same `stim writ from 79 1` or `stim writ from 81 1` "I was eaten" pattern (see `Carrot.cos:109, 189`), the creature cannot smell-differentiate carrots from cheese but can taste-differentiate them via whichever ingested chemicals each agent injects. This parallels the protein-neuron (fruit/fish indistinguishable) and the carbohydrate-neuron (all plants indistinguishable) design — the smell lobe sacrifices intra-category specificity for category economy, and post-ingestion feedback teaches the creature which specific food helped.

### Emission cadence: creation-time pulses versus sustained emitters

Unlike the fish-driven CA 6 field (continuous per-tick emission from live fish) but similar to CA 7, CA 8 is driven entirely by **one-shot emissions at the moment a food agent is instantiated or dispensed**. This has three consequences:

1. **Gradients are object-bound.** Each carrot and each cheese is a "smell point source" with a single emission event attached to its creation. Once emitted, the carrot/cheese itself does not continue to broadcast — the room field evolves on its own as the pulse diffuses and (very slowly) decays. This is important because it means the CA 8 field does *not* automatically update when a carrot is picked up and moved: the pulse stays where the carrot was spawned, not where it currently sits.
2. **Quasi-permanent ship-interior baseline.** The six bootstrap cheeses emit 0.35 each during world initialisation and never re-emit (unless the machine produces new cheeses). With loss 0.001 per tick, each 0.35 pulse takes ~2300 ticks (~77 s) to fall to one-tenth. In a room where cheeses are close together, the combined field reaches a long-lived equilibrium near 2-3 × 0.35 × diffusion smoothing ≈ 0.5-1.0 that persists for the entire game session.
3. **Dynamic pulses from the dispenser.** When the player (or a creature) triggers the cheese-dispensing script (`scrp 2 23 1 6463`), each new cheese fires its own `emit 8 0.35` pulse on top of the baseline. A creature arriving at the machine at the moment it dispenses will experience a detectable uptick in chem 173. This is how trained Norns "learn the machine": they correlate the fat-smell pulse with the audible dispensing sound, eventually associating the machine's vicinity with hunger-for-fat relief.

### Carrot regrowth and the detritus cycle

Carrots have a more complex lifecycle than cheese. A carrot that is eaten spawns a **detritus** object (`2 10 26`) via `scrp 2 11 1 12` (`Carrot.cos:101-134`). The detritus timer (`scrp 2 10 26 9`) counts down while periodically calling `altr room targ 3 0.01` and `altr room targ 4 0.01` — slowly bleeding a small amount of CA 3 (a soil nutrient) and CA 4 (another nutrient) into the room. When the detritus reaches the end of its cycle in a suitable soil-rich room (`prop room targ 2 gt 0.2 and prop room targ 4 gt 0.3 and prop room targ 3 gt 0.1`), it spawns a new carrot and fires `emit 8 0.5` (`Carrot.cos:175`). The net effect is that **the carrot ecosystem self-sustains**: a creature eating a carrot contributes to the CA 3/CA 4 gradient that will in turn produce a new carrot with its own CA 8 pulse some time later. CA 8 is therefore a **slowly-self-regenerating field** in carrot-rich areas — a true ecology signal, in contrast to cheese which is purely mechanical.

### Fat smell vs protein vs carbohydrate semantics at the brain level

A well-trained Norn will have distinct associations on three food-related smell-lobe neurons:

- **Fruit/protein neuron (CA 6)** ↔ satisfies hunger and hunger-for-protein (via apples and fish).
- **Seed/carbohydrate neuron (CA 7)** ↔ satisfies hunger and hunger-for-carbohydrate (via grass/foxglove/fungi).
- **Fat neuron (CA 8)** ↔ satisfies hunger and hunger-for-fat (via carrot/cheese).

These are independent brain inputs. A creature can learn to discriminate behaviourally "I see/smell fat" vs "I see/smell fruit" vs "I see/smell seeds" even though within any one category it cannot tell members apart. The granularity of smell classification in C3 is therefore **food-macro-category-level** — a coarser resolution than real animal olfaction but enough to drive distinct feeding behaviours per macronutrient.

This distinction matters for the creature's **Hunger for fat** drive (chem 151), which is alleviated only by fat-rich foods (carrot and cheese). A creature whose fat-hunger is high benefits from following CA 8 gradients preferentially, but only if it has *learned* that the fat neuron's firing correlates with fat-hunger relief. There is no genetic hard-wiring from chem 173 to the fat-hunger drive — the creature must build the association through experience. This is the classic Creatures 3 learning-loop design.

### Inside-room vs outside-room behaviour for chem 173

Same architectural rule as for chem 171 (protein) and chem 172 (carbohydrate). The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 173 tracks the world or decays in isolation:

- **Inside any room.** Chem 173 is overwritten every sensory tick with the room's live CA 8 value. The 1241-tick half-life is moot.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 173 follows pure first-order decay at rate 0.99944177 per tick.

Because CA 8 has extremely low loss (0.001) and wide diffusion (0.8) across active rooms, and the six bootstrap cheeses provide a near-permanent background emission field, chem 173 on a Norn in normal play inside the ship is **typically non-zero at all times**. The value only drops to zero deep inside cold zones, in unmapped regions, or in rooms very distant from any carrot or cheese.

### The `-MyContribution` subtraction and why CA 8 skips it

For CA indices that are bound to the creature's own category via CACL (e.g. a Norn looking at CA 12 = Norn smell via `cacl 4 1 0 12`), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. For CA 8 this branch is never taken — creatures do not `emit 8` on themselves (Norns are family 4, not family 2 genus 11). The full room value flows into chem 173 and into the fat-smell neuron.

### Practical consequences

- **`chem TARG 173` is a live "fatty food is near" indicator.** A CAOS script querying chem 173 reads the current room's CA 8 value (with one-tick lag). A non-zero reading means at least one carrot or cheese emission is still within diffusion reach.
- **Staleness matters.** Because emissions are tied to object creation (not object current position), chem 173 does *not* reflect a food that has been moved. If a player picks up a cheese and carries it to the other end of the ship, the CA 8 peak stays near the cheese's original spawn position for ~77 s of decay. A creature tracking fat-smell will follow the stale pulse, not the actual cheese. This is a subtle but exploitable behaviour for player-assisted training.
- **The cheese machine is an expected player interaction.** A player triggering the infinite cheese machine deliberately adds `emit 8 0.35` pulses to the machine's area, which can attract hungry Norns. This is a documented gameplay pattern for feeding — and by extension, for training Norns to associate the cheese machine with fat-hunger relief.
- **Flooding chem 173 via `chem 173 255` has no direct biochemical effect on a standard creature**, but it *will* strongly activate the fat-smell neuron on the next brain tick — so the creature will behave as if surrounded by carrots and cheese. The sensory overwrite restores it on the following tick if the creature is in a room, so the effect is transient.
- **A fat-hunger-relief-from-nearby-fat-food gene is a one-receptor change.** Because no existing receptor uses chem 173, a breeder can add a single receptor locus — e.g. `Drive: Hunger for fat − Chemical 173 (fat smell) → reduce Hunger for fat` — to make creatures feel partially sated simply by standing near fat food. None exists by default.
- **Breeding out the sensory pathway is not possible.** The SetChemical write in the sensory loop is engine-hard-coded (not a gene), so no genetic mutation can stop chem 173 from tracking room CA 8. The only way to mute the pathway is via brain-lobe genetics.
- **Adding new fat foods is straightforward.** A modder creating a new fat-category food need only declare it under family 2 genus 11 and add `emit 8 <intensity>` to its placement script; it will automatically register on every nearby creature's fat-smell neuron without any brain-level modification required. Foods in other families (e.g. 2 8 for fruit, 2 3 for seed) will not fire the fat neuron even if their ingested chemicals contribute to hunger-for-fat relief — classification is by agent family/genus, not by nutritional content.
- **No standard fat-food agent emits continuously.** Unlike fish on CA 6, neither carrot nor cheese runs `emit 8` every tick. This is an important performance decision — there can be many static food items in a room, and per-tick emission would multiply the CA 8 workload. The designers used creation-time emission and compensated with the extremely low loss rate (0.001) to give each pulse a long tail.

### CA 6 vs CA 7 vs CA 8 side-by-side

| Aspect | CA 6 (chem 171, protein) | CA 7 (chem 172, carbohydrate) | CA 8 (chem 173, fat) |
|--------|---------------------------|-------------------------------|----------------------|
| Canonical name | `protein` | `carbohydrate` | `fat` |
| Smell-lobe category (CACL) | `(2, 8, 0)` — fruit | `(2, 3, 0)` — seed/plant | `(2, 11, 0)` — fatty food |
| Primary emitters | Ripe apples, live fish (handle/angel/clown/neon) | Grass, desert grass, pumperspikel shatter, seed launchers | Carrots (fresh, picked, regrown), cheese (bootstrap and dispensed) |
| Emission cadence | Apples: one-shot 0.5 on ripening; fish: continuous 0.15 per tick | All emitters: discrete one-shot pulses per dispersal event | All emitters: one-shot pulses at agent creation time |
| Typical peak intensity | 0.5 (apple ripening), 0.15-0.25 (fish) | 0.5 (pumperspikel shatter), 0.3 (grass/seed launchers) | 0.5 (carrot), 0.35 (cheese) |
| Rate table | gain 0.99 air / 0.40 soil / 0 cold; loss 0.001; diffusion 0.8 | **Identical** | **Identical** |
| Meaning | "Live food (fruit or fish) exists *that way*" | "A plant has recently seeded *that way*" | "Fat food is sitting *that way*" |
| Agent classifier catchment | `2 8 *` (fruit family) + fish `2 15 *` (via classification into the fruit neuron by CACL) | `2 3 *` (all seed-family plants) | `2 11 *` (carrot + cheese only in standard genome) |
| Half-life of decaying blood chem when outside rooms | 1241 ticks (~41 s) | 1241 ticks (~41 s) | 1241 ticks (~41 s) |
| Used by smell lobe? | Yes (fruit neuron) | Yes (seed neuron) | Yes (fat neuron) |
| Default genome reactions/receptors? | None | None | None |
| Dynamic vs static source map? | Semi-dynamic (fish move, apples ripen/fall) | Episodic (seeding events come and go) | Semi-static (bootstrap cheeses permanent; carrots regrow slowly; new cheeses only on player-triggered dispense) |

### Summary

CA smell 8 (fat) is the bloodstream mirror of map CA index 8, the **fat-food broadcast channel**. It is fuelled by creation-time `emit 8` pulses fired by the two fatty-food agent families in the standard bootstrap: carrots emit 0.5 when a fresh carrot is placed (either at bootstrap, when a picked carrot is spawned, or when detritus regrows into a new carrot), and the infinite cheese machine emits 0.35 for each cheese — six at world-init, plus any that the machine dispenses in response to player or creature interaction. No agent emits CA 8 continuously, so the field is sustained entirely by the map's extreme low loss rate (0.001 per tick) and the six bootstrap cheese placements that each create a ~77-second tail of detectable fat smell in their corner of the ship. The per-room-type rate table is identical to CA 6 and CA 7 (gain 0.99 air, 0.40 soil, 0 cold; loss 0.001; diffusion 0.8), so CA 8 forms long, smooth gradients throughout the ship interior. The bootstrap wires CA 8 into the smell lobe via `cacl 2 11 0 8` in `z_agent smells.cos:8` — the comment on the line above names the catchment `*fat smell 8: carot, cheese` — mapping it to the neuron for the fatty-food category `(2, 11, 0)`. Consequently, chem 173 is the primary brain input for the creature's "I smell fatty food" awareness, and is the sensory foundation that creatures learn to associate with hunger-for-fat satisfaction. At the biochemistry level the chemical itself remains inert (no default reaction or receptor consumes it), so the whole behavioural pathway runs through the brain lobe, leaving chem 173 available as a clean scripting hook for any author who wants to add direct biochemical responses to fat-food proximity.
