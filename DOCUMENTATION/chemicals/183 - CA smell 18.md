# 183 - CA smell 18

Chemical 183 is the nineteenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 18**. The canonical naming table (`biochemistry.json` row 8995) labels it simply `"CA smell 18"` (no parenthetical descriptor — unlike chems 177-182 which carry race tags). The channel is reserved for the **"info gadget" / detector / machinery-tool category**: every gizmo in the player's toolbox of detectors, logic gates, sensors, monitoring devices, sprays, launchers and lightboxes — anything classified `(family=3, genus=8, species=*)` — is required by convention to call `emit 18 <rate>` in its install script, broadcasting a low-intensity scent that creatures can learn to associate with the rich library of player-placed and bootstrap-placed gadgets scattered across the Ark. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `18`, and writes that float into biochemistry chemical `FIRST_SMELL_CHEMICAL + 18 = 183` (with `FIRST_SMELL_CHEMICAL = 165`).

CA 18 is the **"info gadget" smell channel** — semantically distinct from the three neighbouring categories:

- **CA 10 (machinery)** marks the heavy fixed machinery of the Ark itself — bridge consoles, teleporters, lifts, the lab equipment baked into the world (family 3, genus 3).
- **CA 11 (Norn eggs)** marks Norn eggs specifically (family 3, genus 4, species 1).
- **CA 17 (Ettin home)** marks the Ettin biome via stationary beacons (family 3, genus 7).
- **CA 18 (info gadgets)** marks the **player-installed and bootstrap-installed "smart" gadgets** — the diagnostic, educational, and interactive toys the player drops into the world. This is genus 8 in family 3, the "info" or "detector" genus.

Unlike CA 17 where three dedicated invisible beacons exist solely to broadcast the channel, CA 18 has **no dedicated emitters**. Instead, every member of the family-3-genus-8 category broadcasts CA 18 as part of its own install script — the gadget *is* the beacon. This is the same model as CA 10 (machinery), CA 12-14 (race scents), and CA 11 (eggs) — the category and the emitter are the same agents, with `emit 18` written into each gadget's install script as a near-universal convention. Surveying `Bootstrap/001 World/`, **at least 23 distinct gadget scripts emit CA 18** with rates ranging from 0.20 (the most common, used by permanent installed devices) to 0.35 (used by portable/spawned items like sprays and detectors).

Five key properties characterise chem 183:

1. **The channel is bound to the entire family-3-genus-8 category via CACL.** `z_agent smells.cos:8` contains the single line `cacl 3 8 0 18`. This registers in `AgentManager.ourCategoryIdsForSmellIds[18]` the smell-lobe neuron ID corresponding to the `(family=3, genus=8, species=0)` agent category — a wildcard species value that catches every species number under family-3 / genus-8. Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 18 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron. Because the creature's own classifier is `(family=4, genus=1/2/3, species=X)` — not 3/8/X — the `neuronId == GetCategoryIdOfAgent(myCreature)` check on line 284 **never fires for CA 18 on a creature**; no `-MyContribution` subtraction is applied, and the brain neuron reads the same unmodified CA 18 value that is written to chem 183.
2. **Every family-3-genus-8 gadget self-emits CA 18.** The bootstrap convention (followed by ~23 distinct script files, encompassing dozens of agent classifiers) is that each gadget's install script issues `emit 18 <rate>` immediately after `mvto`-ing into position. Permanent installed devices typically emit at **0.2** (logic gates, switches, NOT gates, count gates, delay gates, radios, output displays, light modules, smell emitters, mediporters, sirens, contact sensors, medical scanners, sludge guns, lightboxes, creature detectors). Portable / on-demand spawned items emit at the higher rate **0.35** (anti-bacterial sprays, antigen detectors, aquatic launchers, aquatic-population monitors, numeric output tools, pregnancy indication devices). A few intermediate cases use **0.25** (count gates, delay gates, aquamite makers). The variance reflects the relative "noisiness" each gadget should have in the scent landscape: heavier, omnipresent installations stay quiet (0.2); discrete spawned items broadcast harder so creatures can find them (0.35).
3. **CA 18 has the standard 0.80 diffusion coefficient.** The `!map.cos` rate table gives CA 18 a diffusion of **0.80** (rates `rate X 18 0.99 0.001 0.80` for room types 0-4, 8-9), the same as the food/eggs/race-scent channels and lower than the home-scent channels (which use 0.95 for wider geographic spread). The 0.80 value produces a localised gradient — creatures can smell a gadget in adjacent connected rooms, but the scent does not flood across the whole Ark. Combined with the typical density of gadgets in the player's environment, this produces a **patchy "smart-tool landscape"** rather than a uniform background field. The gain is 0.99 (nearly full reception) in air/water rooms, dropped to **0.40** in soil rooms (types 5-7), and — uniquely among smell channels — **dropped to 0.00 in room type 10**, the dedicated "indoor" room type. Blocked/cold/barrier rooms (types 11-15) zero everything as usual. The loss is the standard 0.001 per tick.
4. **Room type 10 is a CA-18 dead zone.** This is the channel's defining quirk. In the 16-room-type rate table, every other smell channel gives room type 10 the same gain as room types 0-4 and 8-9 (typically 0.99), but CA 18 zeros it out. The practical effect is that **gadgets installed inside a room of type 10 (the "indoor enclosure" type used for sealed laboratory chambers, certain incubator interiors, and some sub-rooms of the Ark machinery) do not propagate any scent**. This appears to be a deliberate carve-out — sealed indoor spaces should not leak gadget-scent into the rest of the Ark, presumably to keep the laboratory and incubator interiors as scent-quiet zones for breeding/study workflows. The effect is asymmetric: a creature *inside* a type-10 room reads CA 18 = 0 regardless of what gadgets are in there, and a creature *outside* receives no diffused contribution from those gadgets either.
5. **Chem 183 has no receptor at all in the standard genome.** Like chem 179 (Ettin race-scent), chems 180-182 (the three home channels), and unlike chems 177-178 (Norn/Grendel race-scents, which carry inert placeholder receptors at genes 131/132), chem 183 is **absent from the entire receptor list** of the standard biochemistry (`biochemistry.json` has no receptor row with `"chemical": 183`). The only behaviourally-active pathway from chem 183 in vanilla C3 is the smell-lobe neuron for category (3,8,0) — there is no bloodstream-visible response to gadget proximity unless a breeder adds a receptor from scratch. The biochemistry copy exists purely for CAOS inspection, save/load snapshotting, and modder extensibility.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 18** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 18, smellValue)` → `Biochemistry.SetChemical(183, smellValue)`. The unmodified value is written — no `-MyContribution` adjustment applies because the neuron's category (3,8,0) is never the creature's own category | Per tick — direct assignment (not additive) |
| 2 | **Permanent installed gadgets** (most numerous source) | — | Gadgets of classifier `(3,8,*)` whose install scripts include `emit 18 0.2` | Bootstrap install runs `new: comp/simp 3 8 X "..." ... / mvto X Y / emit 18 0.2` and thereafter `Agent.HandleCA` non-navigable branch adds `0.2` to each gadget's room `caInput` every CA-18 cycle. Includes: logic gates `(3,8,6)`, NOT gates `(3,8,7)`, switches `(3,8,3)`, count gates `(3,8,12)`, delay gates `(3,8,13)`, radios `(3,8,5)`, output displays `(3,8,26)`, light modules `(3,8,11)`, smell emitter/detectors `(3,8,14)` & `(3,8,15)`, mediporters `(3,8,9)`, sirens `(3,8,8)`, contact sensors `(3,8,23)`, medical scanners `(3,8,10)`, sludge guns `(3,8,2)`, lightboxes `(3,8,4)`, creature detectors `(3,8,1)` | 0.2 per CA-18 cycle, in each gadget's current room |
| 3 | **Portable / spawned diagnostic items** (high-rate) | — | Gadgets of classifier `(3,8,*)` whose install scripts include `emit 18 0.35` | Same construction with the higher 0.35 rate. Includes: anti-bacterial sprays `(3,8,19)`, antigen detectors `(3,8,20)`, aquatic launchers `(3,8,22)`, aquatic-population monitoring devices `(3,8,16)`, numeric output tools `(3,8,18)`, pregnancy indication devices `(3,8,17)` | 0.35 per CA-18 cycle |
| 4 | **Mid-rate gadgets** | — | Gadgets emitting at 0.25 | Includes count gates (some variants), delay gates (some variants), aquamite makers `(3,8,21)` | 0.25 per CA-18 cycle |
| 5 | **CA diffusion from gadget rooms** | — | `Map.UpdateCurrentCAProperty` (the room CA update routine) with diffusion 0.80 in non-blocked, non-type-10 rooms | No direct emission — the field spreads outward from each gadget's room through every CA-18 tick, decaying at 0.001 per tick and attenuated by each room type's gain. Multiple co-located gadgets sum their emissions, producing local CA-18 hot spots in dense-gadget zones | Emergent — determined by per-room-type rates and gadget density |
| 6 | **`CHEM` CAOS injection** | — | — | `chem 183 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 18 value) | Author-defined |
| 7 | **Ingestion of agents containing chem 183** | — | — | A `FOOD`/drug agent whose PRAY chemistry lists chem 183 will inject it on bite/eat. Same overwrite caveat as (6) | Author-defined |
| 8 | **Mod-added `(3,8,*)` agents or `altr room targ 18`** | — | — | Any add-on agent declared in family 3 / genus 8 should follow the convention and call `emit 18 <rate>` in its install script — failing to do so produces a "stealth gadget" invisible to the smell lobe. Gadget mods can also use `altr room targ 18 <x>` to seed CA 18 at a non-gadget location for special effects (training scenarios, fake-gadget set pieces) | Author-defined |

### Per-room-type diffusion rates (the type-10 quirk)

The 16-room-type rate profile for CA 18, from `!map.cos`:

| Room type | gain | loss | diffusion | Behaviour for CA 18 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, standard diffusion — gadget scents propagate normally through outdoor regions |
| 1-4 (indoor/tunnel variants) | 0.99 | 0.001 | 0.80 | Same — gadget scents propagate freely through machinery shafts, the bridge, the engine room, etc. |
| 5-7 (soil variants) | 0.40 | 0.001 | 0.80 | Reduced reception (40 %) — soil attenuates gadget scent |
| 8-9 (water / deep water) | 0.99 | 0.001 | 0.80 | Full reception in water — submerged gadgets (aquatic launchers, aquatic monitors) propagate normally |
| **10 (sealed indoor)** | **0.00** | 0.001 | 0.80 | **Dead zone — type-10 rooms produce zero CA 18 reception even when gadgets are inside them.** This is the channel's signature carve-out, sealing off the dedicated "enclosure" room type from the gadget-scent landscape |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Standard dead zones — no reception, no diffusion |

The type-10 carve-out distinguishes CA 18 from every other smell channel in the same map and is the most consequential per-room-type asymmetry in the C3 smell system. It guarantees that designated "private" indoor enclosures stay scent-quiet for gadget-scent purposes regardless of what the player drops inside them.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (only behavioural pathway in stock C3) | — (CAOS-bound, not gene-bound) | `cacl 3 8 0 18` in `z_agent smells.cos:8` | `SensoryFaculty.Update` pushes the room's CA 18 value into `brain.SetInput("smel", neuronId, smellValue)` for the "info gadget" smell neuron. No `-MyContribution` subtraction — the neuron's category (3,8,0) never matches a creature's own category (4,X,X) | Creatures learn to associate "gadget smell" with whatever experiences happen near gadgets. Most player-toolbox items are interactive learning aids, push-and-pull devices, sprays that improve health, monitors that produce no direct effect, and so on — typically the experiences range from neutral to mildly positive (gadget interactions earn tickle reinforcement, useful drugs improve well-being, and the lab-scientist player-style typically uses gadgets as part of caring for creatures). The smell lobe's plasticity gradually wires "high CA 18" → "interesting place worth exploring", supporting curious approach behaviour to gadget clusters. In poorly-managed worlds where gadgets cause discomfort (sludge guns, sirens, badly-tuned sprays), the association can become aversive |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 183 is overwritten every sensory tick inside rooms anyway |
| 3 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 183 | Threshold / gain / locus author-defined | A breeder can attach chem 183 to any biochemistry locus — e.g. a Curiosity locus that elevates near gadgets, a Fear locus for "machine-shy" Norns who avoid devices, an alertness booster that raises learning rate around gadgets, or an Inventiveness drive for creatures that should be drawn to interactive devices. **No inert placeholder receptor exists** — breeders must add a receptor gene from scratch |

**The only behavioural pathway from chem 183 in the stock genome is the smell-lobe neuron for family 3 / genus 8 / species 0 (info gadget category).** No receptor gene, no reaction, no neuroemitter, and no organ references chem 183 in vanilla C3. The channel is purely brain-layer, with its biochemistry mirror acting as a diagnostic and modder extension point rather than a genomic signalling pathway.

## Role in Game Mechanics

### What "info gadgets" are in C3

The Ark in Creatures 3 is, by design, far more **gadget-rich** than the worlds of Creatures 1 and 2. Where C1 and C2 worlds were primarily natural environments with a small handful of utility devices (incubators, learning machines, kitsch cookers), the C3 Ark deliberately dumps the player into a **science-laboratory aesthetic** stocked with logic gates, signal wires, sensors, detectors, sprays, monitoring screens, mediporters, smell emitters, sirens, lightboxes, switches, output displays, count gates, delay gates, NOT gates, antigen detectors, pregnancy indicators, medical scanners, sludge guns, contact sensors, radios, light modules, and an aquatic-population monitoring rig — all of them belonging to family 3, genus 8 ("info gadgets"). A typical player accumulates dozens to hundreds of these in normal play.

The CA 18 channel exists to give creatures **a single unified sensory category for "the stuff in the gadget toolbox"**. Without it, each gadget-type would need its own CA channel (impossible — only 16 channels exist), or each gadget would be invisible to the smell lobe (creatures would lack any way to learn about the rich gadget landscape). The unified channel solution lets every gadget identify itself as "I am a gadget" via a single emission line, and lets every creature route every gadget-stimulus through a single "info gadget" smell-lobe neuron whose plasticity captures the average value-content of all the gadgets a creature has encountered.

### Why chem 183 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 183 to drive any physiological response to gadget proximity — e.g. a Curiosity locus that elevates near devices, an Alertness boost (more receptive to learning) around the player's tool installations, a Fear locus for "machine-shy" creatures who avoid technological zones, an Inventiveness drive that pulls creatures toward interactive devices, or even a Tickle/Comfort response associating scientific gadgets with the player's caring presence (since the player is the one who installs them). The standard genome does *not* express any receptor at all, so this pathway is entirely latent for breeders to populate.
2. **CAOS inspection.** A world script can read `chem TARG 183` to query how strongly the creature currently smells gadgets, which is useful for diagnostic gadgets ("is this creature in a gadget-rich area?"), behaviour monitors that track exploration patterns, debug panels, and meta-gadgets that themselves react to gadget density.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so the bloodstream view shows gadget-smell alongside other smells without special-casing lobe inputs.

### The two-tier emission rate convention (0.2 vs 0.35)

Surveying the bootstrap, gadgets fall into two main rate buckets:

- **0.2 (permanent installed gadgets).** Devices that the bootstrap places once at world generation and that typically remain in fixed positions for the world's lifetime — logic gates, switches, NOT gates, count gates, delay gates, radios, output displays, light modules, smell emitter/detectors, mediporters, sirens, contact sensors, medical scanners, sludge guns, lightboxes, creature detectors. These tend to be "infrastructure" — the player builds with them but they accumulate quietly in the background.
- **0.35 (portable / on-demand items).** Devices that the player typically spawns from inventory or that appear as discrete diagnostic implements — anti-bacterial sprays, antigen detectors, aquatic launchers, aquatic-population monitors, numeric output tools, pregnancy indication devices. These need to be **easier to find** for both the player and the creatures, hence the elevated emission rate.

The ~75 % rate gap (0.35 vs 0.2) is meaningful: in a room containing only a 0.35 emitter, the equilibrium CA 18 will be roughly 75 % higher than in a room containing only a 0.2 emitter, after diffusion and decay reach steady state. This produces a subtle but real hierarchy in the gadget-scent landscape: portable diagnostic implements stand out from the background hum of permanent installations.

A small intermediate group emits at **0.25** (some count/delay-gate variants, aquamite makers) — these straddle the boundary between "background infrastructure" and "interactive implement".

### The type-10 carve-out — why sealed indoor rooms are scent-quiet

The single most distinctive feature of CA 18's per-room-type rate profile is the **gain of 0.00 in room type 10**. No other smell channel zeros out room type 10. To understand why, recall that the C3 Ark uses room types semantically: type 0 is outdoor open air, types 1-4 are various indoor/corridor variants, types 5-7 are soil layers, types 8-9 are water bodies, and **type 10 is the dedicated "sealed indoor enclosure" type** used for laboratory chambers, incubator interiors, certain hatcheries, and quiet observation cells.

By zeroing CA 18 in type-10 rooms specifically, the engine guarantees that:

1. **Gadgets installed in a type-10 chamber do not "leak" their scent.** Place a logic gate or detector inside a sealed lab — the room-internal CA 18 is forced to 0, so neither the room itself nor any room sharing a CA boundary with it accumulates gadget-scent from that gadget. The lab stays scent-quiet for gadget-purposes.
2. **A creature inside a type-10 chamber reads CA 18 = 0 regardless.** Even if the chamber is wall-to-wall with gadgets, the chamber's CA 18 is forced to 0, so the creature's smell-lobe neuron receives no gadget-stimulus. This is useful for breeding/study workflows: the player can isolate a creature in a sealed observation chamber filled with diagnostic equipment and the creature will not be distracted by an overwhelming gadget-scent.
3. **The "sealed" semantics of type 10 are honoured for gadget-scent.** Where a regular indoor type (types 1-4) lets scent leak in and out, type 10 is completely opaque to gadget-scent — consistent with the room type's broader use as a "private workspace" zone in the Ark layout.

The carve-out is asymmetric: scent does not flow into or out of type-10 rooms via CA 18. Scent from gadgets in adjacent (non-type-10) rooms cannot diffuse *into* the type-10 chamber (because the chamber's gain is 0). And scent from gadgets *inside* the type-10 chamber doesn't accumulate (same reason), so cannot flow outward.

The other smell channels do not have this carve-out — a Norn egg in a type-10 room still emits CA 11 normally, food in a type-10 room still emits CA 6/7/8 normally, and so on. The carve-out is **specific to gadget-scent**, reflecting a design intention that "lab tools should not pollute the lab's scent landscape" while letting natural objects (food, eggs, creatures themselves) propagate normally.

### The category-wildcard CACL and why species doesn't matter

The CACL line is `cacl 3 8 0 18` — note the **species value of 0**, which is the wildcard match for "any species in family 3 / genus 8". This means every distinct gadget species (logic gates are species 6, NOT gates species 7, switches species 3, sprays species 19, detectors species 1, and so on through the dozens of gadget species defined) maps to the **same single smell-lobe neuron**. From the creature's brain's perspective, "logic gate", "switch", "spray", "siren", and "antigen detector" are all the same stimulus — "info gadget".

This is a deliberate simplification: with only 40 smell-lobe neurons available and many dozens of gadget species in the Ark, giving each gadget species its own neuron would consume the entire smell lobe many times over. The unified-category approach concentrates all gadget perception into one neuron, freeing the other 39 neurons for other smell categories (food types, races, eggs, machinery, home zones, etc.) and treating gadget-perception as a single coarse "smart-stuff is nearby" signal rather than a fine-grained discrimination.

### The bootstrap convention and what happens when it's broken

Every gadget-author is expected to include `emit 18 <rate>` in the install script. This is a **convention, not an engine-enforced rule** — nothing about the `(3,8,X)` classifier automatically broadcasts CA 18. A gadget author who forgets the `emit 18` line creates a **"stealth gadget"** that is invisible to the smell lobe: creatures will not learn it exists from scent, and any approach behaviour must rely on visual or contact cues alone.

This convention is followed pretty universally in the C3 vanilla bootstrap, but mod-authored gadgets occasionally miss it (especially when ported from the Creatures-2 era, which had a different smell-lobe architecture). Such gadgets effectively don't exist for the smell-lobe-driven exploration heuristic — they're still tangible and scriptable, but creatures will not actively seek them out unless they happen to wander into visual range.

### How CA 18 differs from the other gadget-related channels

The Ark has multiple "smart object" categories with overlapping conceptual scope but distinct CA channels:

- **CA 10 (machinery, family 3 genus 3)** marks the heavy fixed installations of the Ark itself — the bridge, lifts, teleporters, the lab equipment baked in by the world author, ovens, vendors. These are large, often multi-room, and scripted with their own complex behaviours. They emit independently from CA 18.
- **CA 18 (info gadgets, family 3 genus 8)** marks the **player-installed and bootstrap-installed "smart tools"** — the toolbox of detectors, logic gates, and diagnostic implements that the player drops into the world or builds with.
- **CA 17, 16, 15** mark race-home territories via dedicated invisible beacons (also family 3, but genuses 7/6/5 respectively).
- **CA 11** marks Norn eggs (family 3, genus 4, species 1).

A creature inside the Ark thus reads a layered family-3 scent picture: "machinery here", "gadgets here", "eggs here", "Norn home here", "Grendel home here", "Ettin home here". Each channel has its own neuron, its own learnt valence, and its own diffusion behaviour. The combined picture lets a creature distinguish "I'm in the machinery hall of the Norn corridor with several detectors nearby and an egg in the next room" from "I'm in a quiet Ettin desert chamber with no gadgets and no eggs".

### No `-MyContribution` subtraction applies

Unlike CA 12-14 (which are bound to the creature's own-race category and trigger the self-emission suppression branch in `SensoryFaculty.Update`), CA 18 is bound to the gadget category (3,8,0) — creatures are family 4, so the neuron-category/creature-category match check on line 284 **never fires for CA 18**. Consequences:

- The chemical (line 278) and the brain neuron (line 288) always receive the **same** unmodified value.
- A creature never "subtracts itself" from CA 18 because the creature never contributed to it in the first place.
- The smell lobe receives the full gadget-plus-diffusion intensity at all times.

This is the same architecture as CA 6/7/8 (food types), CA 9 (flowers), CA 10 (machinery), CA 11 (eggs), and CA 15-17 (home channels) — smell channels keyed to *agents in the world* rather than to the creatures themselves.

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 183 tracks the world or decays in isolation:

- **Inside any room.** Chem 183 is overwritten every sensory tick with the room's live CA 18 value. The 1241-tick half-life is moot — the chemical tracks the field directly.
- **Inside a type-10 room.** Chem 183 is overwritten with **0** every tick (because room type 10 has gain 0.00 for CA 18) — a hard zero regardless of nearby gadgets.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 183 follows pure first-order decay at rate 0.99944177 per tick. A creature that was in a gadget-rich area just before falling retains residual chem 183 for roughly 23 s (half-life) before the next room-bound overwrite.

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
| 15 | `3 5 0 15` | Norn home beacons |
| 16 | `3 6 0 16` | Grendel home beacon |
| 17 | `3 7 0 17` | Ettin home beacons |
| **18** | **`3 8 0 18`** | **Info gadgets (detectors, logic gates, monitoring devices)** |

CA 18 sits adjacent to CA 17 in both the CA index space and the smell-lobe neuron layout, completing the family-3 sensory cluster. Brain connectivity in the default genome routes the gadget neuron into general-purpose decision/exploration centres — gadgets are not given a dedicated drive (unlike food, mating, or home), but the smell-lobe plasticity will accumulate associations between gadget proximity and whatever positive or negative reinforcements occur there.

### What modders can do with CA 18

The channel is fully active and extensible in several directions:

- **Boost or quiet specific gadget classes.** A mod that re-installs the bootstrap gadgets with different `emit 18` rates can amplify or mute their scent presence. For example: turn down logic-gate emissions to keep the rich-logic-circuit player's gadget-scent landscape from saturating, or boost siren emissions to ensure creatures actively avoid noisy devices.
- **Add new gadgets in the (3,8,*) classifier.** Any custom gadget should follow the convention and call `emit 18 <rate>` in its install script — typically 0.2 for static installations and 0.35 for portable/diagnostic items. Without this line, the new gadget will not be smell-lobe-detectable.
- **Alter the type-10 carve-out for special worlds.** A custom `!map.cos` can re-enable type-10 reception by changing `rate 10 18 0.000000 0.001000 0.800000` to `rate 10 18 0.990000 0.001000 0.800000`, removing the lab-quiet semantics. Useful for worlds where the type-10 designation has been repurposed.
- **Author a receptor from scratch.** Because chem 183 has no existing receptor gene, any biochemistry response requires a new gene. Typical targets: a Curiosity locus that elevates near gadgets, a Fear locus for machine-shy creatures, an Alertness boost (increased learning rate) around the player's installations, or an Inventiveness drive for creatures that should be drawn to interactive devices.
- **Per-race genome differences.** Modders authoring distinct race genomes can give each race a different receptor for chem 183 — strong curiosity for tinker-prone Ettins, mild fear for shy/skittish Norn lines — to bake gadget-affinity into biochemistry rather than relying purely on learned smell-lobe associations. (Lore-wise, Ettins are conventionally "the machinist race", so a positive Ettin receptor for gadget-scent reinforces their canonical personality.)
- **Temporary gadget-zone markers.** A CAOS gadget running `new: simp ... / emit 18 .25` at runtime marks a temporary "gadget region" at any location — useful for guided exploration scenarios, training agents, or "fake gadget cluster" set pieces in custom adventures.
- **Monitor with CAOS.** `outs "gadgets = " outv chem TARG 183` in a debug gadget inspects how strongly the creature currently smells gadgets, making it easy to verify gadget-scent propagation, test new gadget classes, or build gadget-density visualisation tools.
- **Suppress gadget-scent for stealth toys.** A custom gadget that *deliberately* skips the `emit 18` convention becomes invisible to the smell lobe — useful for "spy cameras" or "hidden monitors" that the player wants the creature not to learn about.

### Practical consequences

- **Chem 183 is a "tools-nearby" indicator, not a specific-tool identifier.** The smell-lobe neuron cannot distinguish a logic gate from a spray from a siren — they all collapse into the same "info gadget" stimulus. The creature must use other senses (vision, BHVR/script category, contact) to identify which specific gadget is producing the scent.
- **Dense gadget regions produce strong CA 18 plateaus.** A player who installs many gadgets in the same area (e.g. a wired-up logic-gate playground or a bank of detectors at the bridge) creates an additive CA-18 hot spot whose intensity is roughly the sum of individual emissions, attenuated by diffusion. A creature wandering into such a region experiences a noticeable CA-18 spike that the smell lobe will encode as "lots of smart stuff here".
- **Lab chambers (type 10) are scent-quiet.** A creature inside a lab full of gadgets reads CA 18 = 0 for the duration of its stay, producing no learning signal from those gadgets at all. The creature must leave the lab (entering type-0 air or type-1 indoor) before any gadget-scent learning resumes.
- **Soil rooms attenuate gadget scent.** A creature in an underground tunnel (room types 5-7) reads gadget scent at 40 % of its surface intensity — buried gadgets are detectable but muted.
- **Removing all family-3-genus-8 agents silences gadget perception.** A "stripped" world with no gadgets installed produces CA 18 = 0 everywhere. The smell-lobe neuron becomes permanently unstimulated, and creatures lack any "smart-stuff is nearby" signal — relying on vision and direct interaction to discover the few gadgets that do exist.
- **Flooding chem 183 via `chem 183 255` has zero effect in stock C3.** No receptor reads it, and the smell-lobe neuron does not update from the chemical side because the sensory loop only writes on room-lookup (not on chem-set). The injection is simply overwritten on the next tick by the room value, with no transient biochemical or behavioural consequence.
- **Standard 0.80 diffusion produces local gradients.** Unlike CA 15-17 (home channels at 0.95) which spread broadly across the map, CA 18 stays relatively local — a creature must be in an adjacent or same room as the gadget to smell it strongly. This gives the gadget-scent landscape a **patchy / clustered** character rather than a smooth-gradient one.
- **The 0.2/0.35 emission split is a useful design lever.** The ~75 % intensity differential between fixed installations and portable items means a creature in a room containing a mix of both will receive a CA 18 reading dominated by the portable items — a subtle nudge that may steer learnt associations toward the more interactive (and arguably more interesting-to-creatures) gadget classes.

### Summary

Chemical 183 — CA smell 18 — is the bloodstream mirror of the Ark's **"info gadget" scent channel**, broadcasting the presence of every device classified `(family=3, genus=8, species=*)` — the entire toolbox of player-installed and bootstrap-installed detectors, logic gates, switches, sensors, sprays, monitoring devices, and diagnostic implements scattered through the world. Each gadget self-emits CA 18 at a conventional install-script rate of **0.2** (permanent installations like logic gates and switches) or **0.35** (portable items like sprays and detectors), with a few intermediate cases at 0.25. The channel diffuses at the standard **0.80** rate (lower than the 0.95 used by home-scent channels — gadget scent stays local rather than flooding the map), with a **uniquely zeroed gain in room type 10** that creates a "lab-quiet" carve-out: gadgets installed inside a sealed indoor laboratory chamber produce no scent at all, leaving the chamber as a private workspace. The channel is bound to the smell lobe via `cacl 3 8 0 18` in `z_agent smells.cos:8`, with the species-0 wildcard collapsing every distinct gadget species into a single "info gadget" neuron — a deliberate simplification that keeps the 40-neuron smell lobe from being saturated by the dozens of distinct gadget types in the Ark. No `-MyContribution` subtraction applies because the neuron's category (3,8,0) never matches a creature's own category (4,X,X). **Like chem 179 and chems 180-182, chem 183 has no receptor gene at all in the stock genome** — the only behavioural pathway is the smell-lobe neuron, and any biochemical response to gadget proximity requires a modder to author a receptor from scratch. The unified-category architecture makes CA 18 the quiet workhorse of the Ark's "smart environment" sensory layer: every detector, gate, monitor, and spray drops into the same scent picture, every creature's smell lobe accumulates one coarse "smart stuff nearby" association from cumulative experience, and the lab-quiet carve-out preserves type-10 chambers as private observation spaces uncluttered by the chatter of the player's growing gadget collection.
