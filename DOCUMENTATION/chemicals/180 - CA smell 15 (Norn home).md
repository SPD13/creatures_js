# 180 - CA smell 15 (Norn home)

Chemical 180 is the sixteenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 15**. The canonical naming table (`biochemistry.json` row 8984) labels it `"CA smell 15 (Norn home)"`, and the channel marks the **Norn home territory** in the Ark: two invisible stationary beacons broadcast CA 15 into their surrounding rooms, producing a slowly-decaying scent gradient that Norns can smell from several rooms away and follow back to their home zone. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `15`, and writes that float into biochemistry chemical `FIRST_SMELL_CHEMICAL + 15 = 180` (with `FIRST_SMELL_CHEMICAL = 165`).

CA 15 opens a new conceptual sub-group after the three race-scent channels — **home/territory smells** (CA 15 Norn home, CA 16 Grendel home, CA 17 Ettin home). The three home channels share an architecture that differs sharply from the race-scent channels:

- **Race-scent channels (CA 12-14)** track *where the creatures currently are* — they are emitted by every living Norn/Grendel/Ettin agent and follow those agents around the map. The field is a live population-density map.
- **Home-scent channels (CA 15-17)** track *where each race's home territory is located in the world* — they are emitted by a small number of **invisible, stationary beacon agents** placed once at map-bootstrap time and never moving afterwards. The field is a permanent geographic marker of the home zones, independent of the actual creatures' positions.

For Norn home specifically, `Home smell emitters.cos` spawns **two** invisible emitters at hard-coded positions in the main Ark corridor: a **primary** beacon at `(780, 712)` emitting CA 15 at **0.025**, and a **secondary** beacon at `(2360, 467)` emitting CA 15 at **0.01**. Both are `simp 3 5 <species>` invisible/mouseable agents running only `attr 18 / pose 0 / mvto <x> <y> / emit 15 <rate>` — no event scripts, no physics, no movement. The `emit` call stores `myCAIndex=15` and `myCAIncrease=<rate>` on each beacon; thereafter `Agent.HandleCA` (the per-agent CA-handling routine) takes the non-navigable branch on every CA-15 cycle and calls `map.IncreaseCAInput(roomID, <rate>)`, adding the beacon's rate to its current room's `caInput` accumulator. The primary beacon therefore contributes 0.025 per cycle and the secondary 0.01, totalling 0.035 of fresh Norn-home scent per CA-15 cycle across the two source rooms.

Four key properties characterise chem 180:

1. **The channel is bound to the Norn-home emitter category via CACL.** `z_agent smells.cos:28` contains the single line `cacl 3 5 0 15`. This registers in `AgentManager.ourCategoryIdsForSmellIds[15]` the smell-lobe neuron ID corresponding to the `(family=3, genus=5, species=0)` agent category — the classifier of **the home-smell emitter agents themselves**, not of any creature. Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 15 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron. Because the creature's own classifier is `(family=4, genus=1/2/3, species=X)` — not 3/5/0 — the `neuronId == GetCategoryIdOfAgent(myCreature)` check on line 284 **never fires for CA 15 on a creature**; no `-MyContribution` subtraction is applied, and the brain neuron reads the same unmodified CA 15 value that is written to chem 180.
2. **Two fixed beacons emit CA 15 at hard-coded intensities.** The primary beacon `(3 5 1)` at `(780, 712)` emits `0.025` and the secondary beacon `(3 5 2)` at `(2360, 467)` emits `0.01`. The species-1 vs species-2 distinction is just to give the two beacons different agent identities — both are caught by the `cacl 3 5 0 15` mapping thanks to the species-0 wildcard. Beacons do not move (no movement code, no physics) and have no event scripts: they simply exist and emit. The CA-15 field consequently has two fixed sources — a strong one in the Norn corridor core and a weaker one a few screens to the east — with the field falling off through diffusion and room-type loss as distance from each source increases.
3. **CA 15 diffuses more permissively than the race-scent channels.** The `!map.cos` rate table gives CA 15 a diffusion of **0.95** (rates `rate X 15 0.99 0.001 0.95` for room types 0-4, 8-10), compared to **0.80** for CA 12-14 and the food/eggs channels. The higher diffusion means the home-scent gradient spreads more widely through connected rooms per tick, giving Norns a long-range cue they can follow from many screens away. The gain is still 0.99 (nearly full reception) in air/indoor/water rooms, dropped to **0.40** in soil rooms (types 5-7), and zeroed in blocked/cold rooms (types 11-15). The loss is the standard 0.001 per tick — a long memory that, combined with the continuous beacon emission, produces a stable equilibrium field rather than a pulsing one.
4. **Chem 180 has no receptor at all in the standard genome.** Like chem 179 (Ettin) and unlike chem 177/178 (Norn/Grendel race-scents, which have inert placeholder receptors at genes 131/132), chem 180 is **absent from the entire receptor list** of the standard biochemistry (`biochemistry.json` has no receptor row with `"chemical": 180`). The only behaviourally-active pathway from chem 180 in vanilla C3 is the smell-lobe neuron for category (3,5,0) — there is no bloodstream-visible response to Norn-home proximity unless a breeder adds a receptor from scratch. The biochemistry copy exists purely for CAOS inspection, save/load snapshotting, and modder extensibility.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 15** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 15, smellValue)` → `Biochemistry.SetChemical(180, smellValue)`. The unmodified value is written — no `-MyContribution` adjustment applies because the neuron's category (3,5,0) is never the creature's own category | Per tick — direct assignment (not additive) |
| 2 | **Primary Norn-home beacon** `(3 5 1)` at `(780, 712)` | — | Invisible stationary agent spawned by `Home smell emitters.cos:10-14` | Bootstrap runs `new: simp 3 5 1 "blnk" 2 0 0 / attr 18 / pose va00 / mvto 780 712 / emit 15 .025`. Thereafter `Agent.HandleCA` non-navigable branch adds `0.025` to the beacon's room `caInput` every CA-15 cycle | 0.025 per CA-15 cycle, in the beacon's single fixed room |
| 3 | **Secondary Norn-home beacon** `(3 5 2)` at `(2360, 467)` | — | Invisible stationary agent spawned by `Home smell emitters.cos:16-20` | Same template, with `emit 15 .01` — weaker beacon at the secondary location | 0.01 per CA-15 cycle, in the beacon's single fixed room |
| 4 | **CA diffusion from the two beacon rooms** | — | `Map.UpdateCurrentCAProperty` (the room CA update routine) with diffusion 0.95 in most room types | No direct emission — the field spreads outward from the two beacon rooms through every CA-15 tick, decaying at 0.001 per tick and attenuated by each room type's gain. The equilibrium field provides a multi-room gradient that creatures can follow | Emergent — determined by the per-room-type rate profile |
| 5 | **`CHEM` CAOS injection** | — | — | `chem 180 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 15 value) | Author-defined |
| 6 | **Ingestion of agents containing chem 180** | — | — | A `FOOD`/drug agent whose PRAY chemistry lists chem 180 will inject it on bite/eat. Same overwrite caveat as (5) | Author-defined |
| 7 | **Mod-added emitters or `altr room targ 15`** | — | — | Any add-on agent can issue `emit 15 <x>` on itself or `altr room targ 15 <x>` to seed CA 15 at a new location — typical usage includes creating additional home beacons for custom Norn territories, adjusting the default beacon strengths, or temporarily marking areas as "Norn home" for behavioural experiments | Author-defined |

### Per-room-type diffusion rates

The 16-room-type rate profile for CA 15, from `!map.cos`, differs from the race-scent channels in its **higher diffusion coefficient (0.95 vs 0.80)**:

| Room type | gain | loss | diffusion | Behaviour for CA 15 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | **0.95** | Nearly full reception, near-permanent retention, very wide diffusion — home scent floods outdoor air across many rooms |
| 1-4 (indoor/tunnel variants) | 0.99 | 0.001 | **0.95** | Same — home scent propagates freely through corridors and indoor spaces |
| 5-7 (soil variants) | **0.40** | 0.001 | **0.95** | Reduced reception (40 %) — soil attenuates home scent, but diffusion remains wide |
| 8-9 (water / deep water) | 0.99 | 0.001 | **0.95** | Full reception in water |
| 10 (indoor) | 0.99 | 0.001 | **0.95** | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

The combination of continuous emission (0.025 + 0.01 per cycle), 0.001 loss, and 0.95 diffusion produces a stable equilibrium that **saturates near 1.0 in the two beacon rooms** and trails off through adjacent connected rooms in a broad gradient. In practice this gradient is detectable many rooms away from the beacons — a creature walking east from the Grendel jungle or west from the Ettin desert sees CA 15 rise monotonically as it approaches the Norn corridor, giving the smell lobe a smooth navigational cue.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (only behavioural pathway in stock C3) | — (CAOS-bound, not gene-bound) | `cacl 3 5 0 15` in `z_agent smells.cos:28` | `SensoryFaculty.Update` pushes the room's CA 15 value into `brain.SetInput("smel", neuronId, smellValue)` for the "Norn Home" smell neuron (category 30 in the default 40-neuron smell lobe). No `-MyContribution` subtraction — the neuron's category (3,5,0) never matches a creature's own category (4,X,X) | Creatures learn to associate "Norn home smell" with positive reinforcement (food availability, comfort, social contact) in the Norn corridor, producing go-to-home navigation toward the beacon rooms when hungry, sleepy, lonely, or cold. The smell lobe's plasticity builds the creature's mental map of "where home is" from repeated exposure to this gradient |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 180 is overwritten every sensory tick inside rooms anyway |
| 3 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 180 | Threshold / gain / locus author-defined | A breeder can attach chem 180 to any biochemistry locus — e.g. a Comfort/Reward locus that spikes in the home corridor, a homesickness chemical that builds up when away and drains when home, a pair-bond strengthener for mates meeting at the home beacon. **No inert placeholder receptor exists** — breeders must add a receptor gene from scratch rather than repurpose an existing one |

**The only behavioural pathway from chem 180 in the stock genome is the smell-lobe neuron for family 3 / genus 5 / species 0 (Norn home emitters).** No receptor gene, no reaction, no neuroemitter, and no organ references chem 180 in vanilla C3. The channel is purely brain-layer, with its biochemistry mirror acting as a diagnostic and modder extension point rather than a genomic signalling pathway.

## Role in Game Mechanics

### Home territory as a navigable scent gradient

Creatures 3's Ark is divided into three race-themed biomes: the central **Norn corridor** (main garden, hatchery, nursery, orchard — gentle, food-rich, temperate), the **Grendel jungle terrarium** (hot, wet, dense vegetation, mushrooms), and the **Ettin desert** (dry, industrial, machinery-dominated). For each race, a dedicated home-scent channel marks the biome as "yours" via invisible emitters:

- **CA 15 (Norn home)** — two beacons in the Norn corridor at `(780, 712)` and `(2360, 467)`
- **CA 16 (Grendel home)** — one beacon in the Grendel jungle at `(1948, 2310)`
- **CA 17 (Ettin home)** — three beacons in the Ettin desert at `(4872, 704)`, `(6200, 704)`, `(6363, 704)` (the third emits 0)

The home-smell system is the chief **geographic orientation cue** in C3. Unlike race-scent channels (which follow moving creatures around), home-scents are fixed features of the map — a creature that learns "home smell → good things happen" can navigate back to its home zone from anywhere on the map by walking up the gradient. This is the sensory substrate for:
- **Homing behaviour** — a lost Norn returning to the Ark's main corridor when hungry, cold, or scared.
- **Biome preference** — Norns staying in their native biome rather than wandering into Grendel or Ettin territory (where they would smell low CA 15 and strong CA 16 or CA 17).
- **Cross-race discomfort** — a Norn in the Grendel jungle reads low CA 15 + high CA 16, a sensory signature of "not home and Grendels nearby" that can be learned as aversive.

### Why chem 180 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 180 to drive any physiological response to home-proximity — e.g. a Comfort-increasing locus that produces contentment in the home corridor, a homesickness chemical that builds up elsewhere, or a reward-reinforcer that locks in the brain's home-association learning. The standard genome does *not* express any receptor at all, so this pathway is entirely latent for breeders to populate.
2. **CAOS inspection.** A world script can read `chem TARG 180` to query how strongly the creature currently smells home, which is useful for diagnostic gadgets ("is this Norn far from home?"), story scripts that trigger on homecoming, behaviour monitors, and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so the bloodstream view shows home-smell alongside other smells without special-casing lobe inputs.

### The two-beacon architecture for Norns

Norns uniquely get **two** home beacons (Grendels get one, Ettins get three including one inert). The two-beacon Norn setup creates a gradient with two peaks:

- **Primary beacon at `(780, 712)`** — intensity **0.025**, placed in the main Norn living corridor near the hatchery/nursery/gardens. This is the **core home zone**: where Norns hatch, eat, drink, sleep, and breed. The high intensity produces a strong, saturated CA 15 reading throughout the corridor.
- **Secondary beacon at `(2360, 467)`** — intensity **0.01**, placed further east along the Ark in a secondary area. The weaker intensity produces a lower-but-still-detectable reading that extends Norn-home territory eastwards.

The two-beacon approach serves a functional purpose: the Ark is physically long (spanning x-coordinates roughly 0 → 4100 for the main corridor), and a single beacon's diffusion — even at 0.95 — would not reliably reach the far end. By seeding a second weaker source 1600 px east of the first, the bootstrap ensures that a Norn anywhere in the corridor gets a meaningful CA 15 reading. The intensity difference (2.5× stronger primary) also produces a gradient **within** the home zone itself: a Norn near `(780, 712)` smells stronger "home" than one near `(2360, 467)`, giving the creature a usable cue for navigating to the *core* of home rather than just somewhere in the home biome.

Contrast with the Grendel setup (one beacon in the smaller jungle biome, which is geometrically more compact so one source suffices) and the Ettin setup (three beacons spread across the long desert with the third inert — possibly a leftover from iteration, or a boundary marker).

### Higher diffusion coefficient (0.95) — wider navigational gradient

The three home-scent channels (CA 15-17) get a diffusion rate of **0.95** in all non-blocked room types, compared to the **0.80** used by CA 11 (eggs), CA 12-14 (race scents), and most other smell channels. This is a **deliberate design choice** for home-beacons: the smell must spread further to give creatures a long-range homing cue, not just a local presence indicator. The tradeoff is that with higher diffusion, the gradient is smoother/shallower — a creature climbing toward the beacon gets steady small increases per step rather than a sharp spike near the source.

The practical effect: a Norn walking west through the Grendel jungle will start detecting CA 15 many rooms before reaching the Norn corridor entrance, with the reading rising steadily as it approaches. This long-range detection is what makes home-scent a useful *navigational* cue rather than just a *location identity* signal.

### No `-MyContribution` subtraction applies

Unlike CA 12-14 (which are bound to the creature's own-race category and trigger the self-emission suppression branch in `SensoryFaculty.Update`), CA 15 is bound to a completely different category — `(family=3, genus=5, species=0)` — the invisible beacon agents. Creatures are family 4, so the neuron-category/creature-category match check on line 284 **never fires for CA 15**. Consequences:

- The chemical (line 278) and the brain neuron (line 288) always receive the **same** unmodified value.
- A creature never "subtracts itself" from CA 15 because the creature never contributed to it in the first place.
- The smell lobe receives the full beacon-plus-diffusion intensity at all times.

This is the same architecture as, say, CA 9 (flowers) or CA 10 (machinery) — smell channels keyed to *agents in the world* rather than to the creatures themselves. The `-MyContribution` branch is a special case for the three race-scent channels (CA 12-14) where a creature's own emission would drown out the signal of interest (other race-members nearby), and does not apply to home-scents or to any other CA channel.

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 180 tracks the world or decays in isolation:

- **Inside any room.** Chem 180 is overwritten every sensory tick with the room's live CA 15 value. The 1241-tick half-life is moot — the chemical tracks the field directly.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 180 follows pure first-order decay at rate 0.99944177 per tick. A creature that was at home just before falling retains residual chem 180 for roughly 23 s (half-life) before the next room-bound overwrite.

### The 40-neuron smell lobe layout

The smell lobe has 40 neurons, each tied to an agent classifier via CACL. The default bootstrap populates the following mappings (all from `z_agent smells.cos`):

| CA | CACL | Neuron interpretation |
|----|------|-----------------------|
| 6 | `2 8 0 6` | Food / Seeds (family 2, genus 8 — seeds) |
| 7 | `2 3 0 7` | Food / Fruit (genus 3) |
| 8 | `2 11 0 8` | Food / Meat (genus 11) |
| 10 | `3 3 0 10` | Machinery (genus 3 in family 3) |
| 11 | `3 4 1 11` | Norn eggs specifically (family 3, genus 4, species 1) |
| 12 | `4 1 0 12` | Adult Norns (any species) |
| 13 | `4 2 0 13` | Adult Grendels |
| 14 | `4 3 0 14` | Adult Ettins |
| **15** | **`3 5 0 15`** | **Norn home beacons** |
| 16 | `3 6 0 16` | Grendel home beacons |
| 17 | `3 7 0 17` | Ettin home beacons |
| 18 | `3 8 0 18` | Home-smell category 8 (unused/reserved) |

The "category ID" mapping (per the `creature-perception.md` article) places Norn home on **category 30** in the smell-lobe layout, distinct from the race-scent neurons (categories 36-38) and the food/machinery neurons. Brain connectivity in the default genome wires these three home neurons into decision/drive centres that can modulate go-to-home behaviour based on drive state (hunger, sleepiness, loneliness, fear).

### The removal script

`Home smell emitters.cos:52-61` defines an `rscr` (removal script) that cleanly kills all home-beacon agents:
```
rscr
enum 3 5 0
    kill targ
next
enum 3 6 1
    kill targ
next
enum 3 7 1
    kill targ
next
```
The first `enum 3 5 0` uses a species wildcard (species 0) to catch both the primary (species 1) and secondary (species 2) Norn beacons in one pass. When the script is uninstalled, the beacons are destroyed; `Agent.HandleCA` stops contributing to their rooms' `caInput`, and the CA 15 field drains at the 0.001 loss rate over roughly 1000 ticks. Any ongoing creature behaviour that depends on CA 15 learning will gradually decouple as the field fades.

### What modders can do with CA 15

The channel is fully active and extensible in several directions:

- **Relocate the home zone.** Editing the two `mvto` coordinates in `Home smell emitters.cos` moves the Norn home territory to a different part of the map. Creatures will learn the new location over time via their smell-lobe plasticity. Useful for custom worlds where the Norn corridor has been relocated or reshaped.
- **Change beacon intensities.** Editing the two `emit 15 .025` / `emit 15 .01` lines rescales the home-scent strength. A stronger primary beacon tightens the gradient (more peaked at the core); a weaker primary with more beacons spreads it flatter. Setting both to 0 effectively disables Norn-home perception.
- **Add more beacons.** Adding extra `new: simp 3 5 <species> "blnk" 2 0 0 / ... / emit 15 <rate>` blocks creates a multi-source gradient for large custom maps or for marking multiple sub-homes (e.g. a nursery sub-home + an adult sub-home with different intensities). The species slot just needs to differ to avoid classifier-ID clashes.
- **Author a receptor from scratch.** Because chem 180 has no existing receptor gene, any biochemistry response requires a new gene. Typical targets: a Comfort/Reward locus for home-induced contentment, a Fear-reducing locus for "safe-at-home" effects, or a Homesick chemical that builds elsewhere and drains at home (combined with a decay/production balance tuned against the home-scent level).
- **Unify home and race scents.** Adding `cacl 3 5 0 12` alongside `cacl 4 1 0 12` would merge Norn-home and Norn-smell onto the same neuron — a creature couldn't distinguish "home area" from "other Norn nearby". Conversely, adding per-species CACL lines `cacl 3 5 1 15` (primary beacon only) and `cacl 3 5 2 18` (secondary on a separate neuron) would give creatures two distinct home-zone signals.
- **Temporary home beacons.** A CAOS gadget running `new: simp ... / emit 15 .02` at runtime can mark a temporary "home" at any location (e.g. a player's chosen spot). Useful for training scripts, relocation scenarios, or "portable home" mechanics in custom agents.
- **Monitor with CAOS.** `outs "norn home = " outv chem TARG 180` in a debug gadget inspects how "home" the creature currently feels, making it easy to verify navigation learning, test relocated beacons, or build homing-behaviour heuristics.

### Practical consequences

- **Chem 180 is a geographic marker, not a population signal.** Unlike CA 12 (which tracks where Norns *are*), CA 15 tracks where the Norn *biome is* — a permanent feature of the map set at bootstrap. A Norn being present in the corridor does *not* raise CA 15 (Norns emit CA 12, not CA 15); only the invisible beacons do.
- **A Norn at home sees high CA 15 and high CA 12.** The combined signal "home biome + lots of Norns" is the characteristic sensory signature of a well-populated Norn corridor. A Norn alone in the corridor sees high CA 15 and near-zero CA 12 (itself subtracted via `-MyContribution`). A Norn in Grendel territory sees low CA 15 and high CA 13. These three-way combinations are the sensory bedrock of C3's biome-awareness.
- **Removing the beacons silences Norn-home perception entirely.** With no receptor in the stock genome, destroying the emitters leaves creatures with no way to "feel" Norn home — they can still learn from other cues (visual, food, social), but the dedicated home-scent signal vanishes. The smell-lobe neuron becomes permanently unstimulated.
- **Flooding chem 180 via `chem 180 255` has zero effect in stock C3.** No receptor reads it, and the smell-lobe neuron does not update from the chemical side because the sensory loop only writes on room-lookup (not on chem-set). The injection is simply overwritten on the next tick by the room value, with no transient biochemical or behavioural consequence.
- **The higher diffusion (0.95) makes home-scent detectable across most of the Ark.** A Norn anywhere in the main corridor, orchard, garden, or adjacent indoor rooms reads a non-zero CA 15. Only the soil biomes (40 % reception), the Grendel jungle and Ettin desert (many rooms away, attenuated by distance), and hard-blocked rooms give near-zero readings. This long-range visibility is what makes CA 15 a *homing* cue rather than just a *home-identification* cue.
- **The beacons are immune to gameplay interactions.** Their `attr 18` (invisible + mouseable) makes them clickable in the debugger but invisible to creatures and invisible in normal play. They have no physics, no movement, no scripts — they cannot be accidentally destroyed by creature behaviour, and their emission rate is fixed until the removal script runs.
- **The setup is race-symmetric but intensity-asymmetric.** Norns get 2 beacons (0.025 + 0.01 = 0.035 total rate), Grendels get 1 (0.01), Ettins get 2 active + 1 inert (0.004 + 0.007 = 0.011 total). Norns thus have the strongest combined home signal of the three races, likely reflecting their status as the player's primary charges — the game expects players to mostly manage Norns and provides them with the most robust homing cue.

### Summary

Chemical 180 — CA smell 15 (Norn home) — is the bloodstream mirror of the **Norn home-territory scent channel** in the Creatures 3 map CA system. Unlike the race-scent channels (CA 12-14) which track live creature populations, CA 15 marks a **fixed geographic zone**: two invisible stationary beacons placed by `Home smell emitters.cos` in the main Ark corridor (primary at `(780, 712)` emitting 0.025, secondary at `(2360, 467)` emitting 0.01) continuously broadcast CA 15 into their rooms, producing a stable equilibrium field that diffuses outward through connected rooms at the channel's **elevated 0.95 diffusion rate** — designed for long-range homing navigation rather than local presence detection. The channel is bound to the smell lobe via `cacl 3 5 0 15` in `z_agent smells.cos:28`, feeding the "Norn Home" neuron (category 30) with the room's unmodified CA 15 value every sensory tick. No `-MyContribution` subtraction applies because the neuron's category (3,5,0) never matches a creature's own category (4,X,X). **Like chem 179 (Ettin) and unlike chem 177/178 (Norn/Grendel race-scents), chem 180 has no receptor gene at all in the stock genome** — the only behavioural pathway is the smell-lobe neuron, and any biochemical response to home-proximity requires a modder to author a receptor from scratch. The practical result is a wide-gradient geographic beacon that Norns can follow from many rooms away to find their home biome — the sensory substrate for C3's homing behaviour, biome-preference learning, and the subtle "safe at home vs uneasy away" phenomenology that shapes where the Norn race spends its time in the Ark.
