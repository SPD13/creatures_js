# 172 - CA smell 7 (carbohydrate)

Chemical 172 is the eighth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 7**, which the engine's canonical naming table (`CASystem.js:31-36`, `biochemistry.json` row 8922) calls `"carbohydrate"`. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `7`, and writes that float directly into biochemistry chemical `FIRST_SMELL_CHEMICAL + 7 = 172`. CA 7 is the **seed/grass broadcast channel**: its emitters are plant agents (and a handful of seed-launcher vending mechanisms) that fire `emit 7 X` as they disperse seeds into the world. Where CA 6 (protein) announces "live food exists here", CA 7 (carbohydrate) announces "a plant is seeding right now", which in practice means "a patch of edible grass/seed/sponge is being sown nearby".

Architecturally, chem 172 is a direct sibling of chem 171 (CA 6, protein) and chem 173 (CA 8, fat) with three defining properties:

1. **Its sources are event-triggered, not continuous.** Emission happens during the specific moment a plant disperses its seeds — a single `emit 7` pulse per dispersal event. The field is sustained by the map-rate table's extreme low loss (0.001 per tick), so one pulse remains meaningfully detectable for hundreds of ticks before fading.
2. **It *is* wired into the smell lobe.** `z_agent smells.cos:6` runs `cacl 2 3 0 7`, mapping CA 7 to the smell-lobe neuron categorised as `(family 2, genus 3, species 0)` — the "seed/plant" category. Every seed-family agent (grass, foxglove, fungi, opal sponge, orange sponge, cacbana, desert grass, gumin grass, tendril, pumperspikel sprouts) classifies into this single smell-lobe neuron, so a creature near any seeding or seeded plant activates the same brain input.
3. **Its per-room rate profile matches CA 6 exactly** — gain 0.99 / loss 0.001 / diffusion 0.8 in air, indoor and water rooms; gain 0.40 in soil; blocked (0/0/0) in cold zones (room types 11-15). The carbohydrate signal is designed to spread widely through the outdoor biome and persist for long periods.

At the creature's own chemistry level, chem 172 is — like its CA-smell siblings — a **reserved blank**. No standard genome reaction consumes it, and no receptor in `biochemistry.json` reads it. Its exclusive runtime behaviours are: (a) being overwritten each tick with the current room's CA 7 value while the creature stands inside any valid room, (b) being fed into the smell lobe neuron for seed-category agents via the `cacl 2 3 0 7` mapping, and (c) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 7** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 7, smellValue)` → `Biochemistry.SetChemical(172, smellValue)` | Per tick — direct assignment (not additive), tracks local room's CA 7 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 172 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room | Author-defined |
| 3 | **Ingestion of agents containing chem 172** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 172 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

### Emitters of CA 7 — what actually fuels the room field

CA 7 is fuelled by **plant and seed-dispenser agents** running `emit 7 X` in their dispersal event scripts. All known standard-bootstrap emitters are:

| Agent | Script location | Trigger | Intensity | Meaning |
|-------|-----------------|---------|-----------|---------|
| **Pumperspikel (dispersing fruit)** | `pumperspikel.cos:94` (inside the `scrp 2 8 3 6` "burst" script, firing for each seed launched) | Once per seed, during the fruit's shatter/disperse action | **0.5** | "A pumperspikel has just shattered here" — the strongest seed signal, matching the apple's 0.5 on CA 6 |
| **Grass (seeding)** | `grass.cos:394` (inside the seed-launch branch of the main grass script) | Once per seed, when a mature grass plant launches its seed | **0.3** | "A grass plant is seeding here" |
| **Desert grass (seeding)** | `desert grass.cos:392` | Once per seed, during the seed-launch branch | **0.3** | "A desert grass plant is seeding here" |
| **Norn seed launcher** (vendor) | `Norn seed launcher.cos:512` | Once per seed produced by the hand-triggered launcher mechanism | **0.3** | "A seed has just been dispensed here" — the player-triggered farming tool |
| **Ettin seed bank** (vendor) | `ettin seed bank.cos:190` | Once per seed produced by the ettin desert-region seed vendor | **0.3** | Same, but in the ettin biome |

There are **no `altr room targ 7`** calls anywhere in the bootstrap, and no hand-placed invisible emitters for CA 7. The entire CA 7 field is therefore an **ecology-driven** emergent signal: as plants seed (autonomously or via player-triggered launchers) and as seed-banks dispense, the CA 7 field energises in those regions and then slowly decays. Unlike CA 6 (whose fish emitters fire every tick), **every CA 7 emission is a discrete one-shot pulse** triggered by a dispersal event — so the signal is characteristically "patchy in time, smooth in space". A creature standing near a patch that just seeded picks up a strong pulse that fades over ~10-15 seconds of game time; a creature arriving later picks up a diminished residue.

The intensity asymmetry between pumperspikel (0.5) and the other seed agents (0.3) mirrors the CA-6 asymmetry between ripe and fallen apples: the pumperspikel shatter is a loud, one-off event that the designers wanted to propagate across the whole biome as an "important food source is here *right now*" alert, while grass, desert grass, and the seed-launchers produce the gentler background chorus of ongoing seed dispersal. The 5/3 intensity ratio means a pumperspikel burst out-competes a single grass seed event in any creature's CA 7 reading, but a full field of seeding grass will eventually accumulate (one 0.3 pulse per seed × many seeds × 0.001 loss per tick) into a locally high reading that creatures can follow up a gradient.

### Per-room-type diffusion rates

From `!map.cos:1666-1981`, CA 7 has the **same rate profile as CA 6** — effectively a carbon copy of the protein-channel table, so the two food-smell channels propagate identically:

| Room type | gain | loss | diffusion | Behaviour for CA 7 |
|-----------|------|------|-----------|--------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion — CA 7 spreads freely through open air |
| 1-4 (various indoor) | 0.99 | 0.001 | 0.80 | Same — CA 7 passes through indoor rooms without attenuation |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (only 40 %): soil rooms accept CA 7 less readily from neighbouring rooms, but retain what they do receive for a long time |
| 8-9 (water/ocean) | 0.99 | 0.001 | 0.80 | Full reception — relevant for any future aquatic seed-dispersing plants |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold) | 0.00 | 0.00 | 0.00 | No reception, no diffusion — cold zones are dead regions for seed smell |

The key pattern is **very low loss (0.001) combined with high diffusion (0.8) in every active room type**, identical to CA 6. A single `emit 7 0.3` pulse in an outdoor room decays as follows:

- Tick 0: 0.3 deposited (scaled by gain 0.99 ≈ 0.297 received).
- Tick 1: room retains 99.9 % of its contents (loss 0.001), emits 80 % of its gradient to neighbours… but by the same mechanism receives 80 % of theirs back, so the equilibrium is near-full-conservation.
- After ~693 ticks (~23 s) the residue falls to half.
- After ~2300 ticks (~77 s) the residue falls to a tenth.

So a single pumperspikel burst stays meaningfully above the noise floor for roughly a minute of wall-clock play, and a full seeding patch of grass creates a sustained gradient that creatures can track. The soil-gain drop to 0.40 reflects the same design decision as CA 6: creatures traversing soil tunnels experience a mild dip in carbohydrate-smell strength rather than the tunnels becoming a high-capacitance reservoir that flattens gradients.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron write — "seed" category** | — (hard-coded pipeline; CACL binding in `z_agent smells.cos:6`) | `brain.SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager.GetCategoryIdFromSmellId(7)` | `cacl 2 3 0 7` maps CA 7 → the smell-lobe neuron whose category is `(family 2, genus 3, species 0)` — the *seed/plant* category. Any agent of family 2 genus 3 (grass, foxglove, fungi, opal sponge, orange sponge, cacbana, desert grass, gumin grass, tendril, pumperspikel sprouts, etc.) classifies into this neuron | Non-zero chem 172 fires the seed-smell neuron in the smell lobe (lobe index 14, 40 neurons). This is the creature's brain-level "I smell seeds/plants" input, drivable into association learning — e.g. learning to push or eat a grass patch when the seed neuron + hunger drive coincide |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails, the SensoryFaculty overwrite is skipped and chem 172 decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 3 | **No genome-defined reaction or receptor** | — | — | — | Chem 172 has **no entry in `biochemistry.json`'s `reactions` or `receptors` arrays**. The only path from CA 7 to behaviour goes through the brain, not the body |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 172 | Threshold / gain / locus author-defined | A breeder can add receptors that read chem 172 to produce "seed smell → salivation", "seed smell → carbohydrate hunger anticipatory satiation", or other direct biochemical responses. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter in the standard C3 genome touches chemical 172 directly.** Its influence on creature behaviour is entirely mediated through the brain's smell lobe via the `cacl 2 3 0 7` CACL mapping.

## Role in Game Mechanics

### The seed neuron and its catchment

The CA 7 → `(2, 3, 0)` CACL binding means **every family-2 genus-3 agent classifies under the same smell-lobe neuron**. This includes a broad swath of the Shee ship's plant ecology:

- **Grass family**: `grass` (2 3 4), `desert grass` (2 3 13), `gumin grass` (2 3 8)
- **Foxglove**: `fxgl` (2 3 1) — the classic Norn food
- **Fungi**: `fungi` (2 3 10)
- **Sponges**: `opal sponge` (2 3 7), `orange sponge` (2 3 6)
- **Cacbana**: `cacbana` (2 3 9) — the desert cactus-banana
- **Tendril**: `tendril` (2 3 11)
- **Pumperspikel seedlings**: `2 3 5` (the seedling phase of pumperspikel — note the adult plant is 2 8 3, which classifies under the *fruit* neuron via CA 6)

Every one of these, if it becomes the TARG of a smell query or drifts through the CA 7 gradient, registers to the creature as "seed smell". The neuron does not distinguish between, say, grass and a foxglove: all plants smell the same to a Norn. This parallel the apple/fish indistinguishability for CA 6 — the smell lobe sacrifices specificity for category economy, and post-ingestion feedback (taste, nutrition from drinking chemicals) differentiates good plants from bad.

### Emission cadence: one-shot pulses versus sustained emitters

Unlike the fish-driven CA 6 field (continuous per-tick emission from live fish), CA 7 is driven entirely by **discrete dispersal events**. This has three consequences:

1. **Gradients are punctuated.** A patch that has just seeded will have a strong local CA 7 pulse for ~30-60 s and then fade. A creature that happens to be walking through will notice a sudden "seed smell" that was absent a minute earlier.
2. **Seasonal / ecological rhythm.** Because seeding is tied to plant life cycles (controlled by each plant's own COS script — e.g. grass only seeds when mature and under appropriate conditions), CA 7 has an **ecologically-driven rhythm** that reflects the garden's overall health. A dying garden produces few emissions; a thriving garden produces many, overlapping into a continuous meadow-smell.
3. **Player triggering.** The two "seed launcher" agents (Norn seed launcher, ettin seed bank) are vendor-style mechanisms that the player can trigger manually. Each trigger fires an `emit 7 0.3` pulse — so the player can actively *create* CA 7 gradients for Norns to follow. This is how players lure hungry Norns to feeding areas in the mid-game.

### Pumperspikel: the fruit-to-seed boundary case

Pumperspikel is unusual because it spans both CA 6 and CA 7:

- The **ripe fruit** on the vine is classifier `2 8 3` (fruit family) — this would in principle trigger CA 6 / fruit smell, though no `emit 6` call exists in pumperspikel.cos. Pumperspikel fruit itself is silent on the protein channel.
- The **shattering event** (`scrp 2 8 3 6`, triggered when the fruit hits a wall or is eaten) fires `emit 7 0.5` five times, one per seedling spawned — so pumperspikel *emits* on the seed channel, not the fruit channel.
- The **seedlings** are classifier `2 3 5` — they register under the seed smell neuron if any creature happens to walk past.

So pumperspikel's smell-lobe signature is actually **carbohydrate-dominated, not protein-dominated**, despite the fruit classifier suggesting otherwise. This is a subtle design detail: the creature brain learns "pumperspikel-shatter events smell like seeds, not fruit", and the seed-neuron association is reinforced each time a Norn encounters a pumperspikel.

### Carbohydrate vs protein semantics at the brain level

A well-trained Norn will have distinct associations on two smell-lobe neurons:

- **Fruit neuron (CA 6)** ↔ satisfies hunger (via protein chemicals from apples) and hunger-for-protein.
- **Seed neuron (CA 7)** ↔ satisfies hunger (via carbohydrate chemicals from grass/foxglove) and hunger-for-carbohydrate.

These are independent brain inputs even though many "plants" (foxglove, grass) contribute chemicals that satisfy both hunger-for-carb AND general hunger. A creature can learn to distinguish "I see fruit" vs "I see seeds" behaviourally even though it cannot distinguish "apple" from "fish" or "grass" from "foxglove". The granularity of smell classification in C3 is therefore **food-category-level** — roughly matching real animals' coarser food-categorisation olfactory strategies.

This distinction matters for the creature's **Hunger for carbohydrate** drive (chem 150), which is alleviated only by carbohydrate-rich foods (primarily grass/foxglove/fungi). A creature whose carbohydrate-hunger is high benefits from following CA 7 gradients preferentially, but only if it has *learned* that the seed neuron's firing correlates with carb-hunger relief. There is no genetic hard-wiring from chem 172 to the carb-hunger drive — the creature must build the association through experience. This is the classic Creatures 3 learning-loop design.

### Inside-room vs outside-room behaviour for chem 172

Same architectural rule as for chem 171 (protein) and chem 173 (fat). The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 172 tracks the world or decays in isolation:

- **Inside any room.** Chem 172 is overwritten every sensory tick with the room's live CA 7 value. The 1241-tick half-life is moot.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 172 follows pure first-order decay at rate 0.99944177 per tick.

Because CA 7 has extremely low loss (0.001) and wide diffusion (0.8) across active rooms, chem 172 on a Norn in normal play is **near-continuously non-zero** once the garden's plants have begun seeding. The value only drops to zero deep inside cold zones, in unmapped regions, or during the first few hundred ticks of a fresh world before any plant has seeded.

### The `-MyContribution` subtraction and why CA 7 skips it

For CA indices that are bound to the creature's own category via CACL (e.g. a Norn looking at CA 12 = Norn smell via `cacl 4 1 0 12`), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. For CA 7 this branch is never taken — creatures do not `emit 7` on themselves (Norns are family 4, not family 2 genus 3). The full room value flows into chem 172 and into the seed-smell neuron.

### Practical consequences

- **`chem TARG 172` is a live "recently-seeded patch is near" indicator.** A CAOS script querying chem 172 reads the current room's CA 7 value (with one-tick lag). A non-zero reading means at least one seed-dispersal event has happened recently within diffusion reach.
- **The "seed map" is dynamic and episodic.** Because emissions are one-shots rather than continuous, CA 7 hotspots come and go as the plant ecology cycles through seeding events. A scripting agent tracking chem 172 can infer "recent seeding activity" without directly inspecting every plant's state.
- **Seed launchers are a player-accessible CA 7 emitter.** A player using the Norn seed launcher or ettin seed bank creates localised CA 7 pulses that can attract Norns (through the seed-neuron-hungry-for-carb association). This is a documented gameplay pattern for luring.
- **Flooding chem 172 via `chem 172 255` has no direct biochemical effect on a standard creature**, but it *will* strongly activate the seed-smell neuron on the next brain tick — so the creature will behave as if surrounded by freshly-seeding grass. The sensory overwrite restores it on the following tick if the creature is in a room, so the effect is transient.
- **A carb-hunger-relief-from-nearby-seeds gene is a one-receptor change.** Because no existing receptor uses chem 172, a breeder can add a single receptor locus — e.g. `Drive: Hunger for carbohydrate − Chemical 172 (seed smell) → reduce Hunger for carbohydrate` — to make creatures feel partially sated simply by standing near plants. None exists by default.
- **Breeding out the sensory pathway is not possible.** The SetChemical write in the sensory loop is engine-hard-coded (not a gene), so no genetic mutation can stop chem 172 from tracking room CA 7. The only way to mute the pathway is via brain-lobe genetics.
- **Adding new plant agents is straightforward.** A modder creating a new plant need only add `emit 7 0.3` (or similar) to the agent's seeding script; its carbohydrate contribution will automatically register in every nearby creature's seed-smell neuron without any brain-level modification required.
- **No standard plant emits continuously.** Unlike fish on CA 6, no plant runs `emit 7` every tick. This is an important performance decision — there may be dozens of plants in a single garden, and per-tick emission would quadruple the CA 7 workload. The designers used event-triggered emission (at seeding moments only) and compensated with the low-loss rate table.

### CA 6 vs CA 7 side-by-side

| Aspect | CA 6 (chem 171, protein) | CA 7 (chem 172, carbohydrate) |
|--------|---------------------------|-------------------------------|
| Canonical name | `protein` | `carbohydrate` |
| Smell-lobe category (CACL) | `(2, 8, 0)` — fruit | `(2, 3, 0)` — seed/plant |
| Primary emitters | Ripe apples, live fish (handle/angel/clown/neon) | Grass, desert grass, pumperspikel shatter, seed launchers |
| Emission cadence | Apples: one-shot 0.5 on ripening; fish: continuous 0.15 per tick | All emitters: discrete one-shot pulses per dispersal event |
| Typical peak intensity | 0.5 (apple ripening), 0.15-0.25 (fish) | 0.5 (pumperspikel shatter), 0.3 (grass/seed launchers) |
| Rate table | gain 0.99 air / 0.40 soil / 0 cold; loss 0.001; diffusion 0.8 | **Identical** |
| Meaning | "Live food (fruit or fish) exists *that way*" | "A plant has recently seeded *that way*" |
| Agent classifier catchment | `2 8 *` (fruit family) + fish `2 15 *` (via classification into the fruit neuron by CACL) | `2 3 *` (all seed-family plants) |
| Half-life of decaying blood chem when outside rooms | 1241 ticks (~41 s) | 1241 ticks (~41 s) |
| Used by smell lobe? | Yes (fruit neuron) | Yes (seed neuron) |
| Default genome reactions/receptors? | None | None |
| Dynamic vs static source map? | Semi-dynamic (fish move, apples ripen/fall) | Episodic (seeding events come and go) |

### Summary

CA smell 7 (carbohydrate) is the bloodstream mirror of map CA index 7, the **plant/seed broadcast channel**. It is fuelled by discrete `emit 7` pulses fired by seed-dispersing agents: pumperspikel bursts emit 0.5 per seedling spawned, mature grass and desert grass emit 0.3 per seed launched, and the two player-facing seed-launcher vendors (Norn seed launcher, ettin seed bank) emit 0.3 per seed dispensed. Unlike CA 6's fish, no plant emits continuously — CA 7 is characterised by one-shot pulses that persist for a minute or so via the map's 0.001 loss rate before fading. The per-room-type rate table is identical to CA 6 (gain 0.99 air, 0.40 soil, 0 cold; loss 0.001; diffusion 0.8), so CA 7 forms long, smooth gradients reaching across the outdoor biome. The bootstrap wires CA 7 into the smell lobe via `cacl 2 3 0 7` in `z_agent smells.cos:6`, mapping it to the neuron for the seed-plant category `(2, 3, 0)` — a broad catchment that includes grass, foxglove, fungi, sponges, cacbana, desert grass, gumin grass, tendril, and pumperspikel seedlings. Consequently, chem 172 is the primary brain input for the creature's "I smell plants" awareness, and is the sensory foundation that creatures learn to associate with hunger-for-carbohydrate satisfaction. At the biochemistry level the chemical itself remains inert (no default reaction or receptor consumes it), so the whole behavioural pathway runs through the brain lobe, leaving chem 172 available as a clean scripting hook for any author who wants to add direct biochemical responses to plant proximity.
