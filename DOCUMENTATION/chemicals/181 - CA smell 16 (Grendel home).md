# 181 - CA smell 16 (Grendel home)

Chemical 181 is the seventeenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 16**. The canonical naming table (`biochemistry.json` row 8993) labels it `"CA smell 16 (Grendel home)"`, and the channel marks the **Grendel home territory** in the Ark: a single invisible stationary beacon broadcasts CA 16 into its surrounding rooms, producing a slowly-decaying scent gradient that creatures can smell from several rooms away and follow back to (or away from) the Grendel jungle terrarium. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `16`, and writes that float into biochemistry chemical `FIRST_SMELL_CHEMICAL + 16 = 181` (with `FIRST_SMELL_CHEMICAL = 165`).

CA 16 is the **second of the three home/territory smell channels** — CA 15 (Norn home), CA 16 (Grendel home), CA 17 (Ettin home) — that follow a different architecture from the race-scent channels (CA 12-14):

- **Race-scent channels (CA 12-14)** track *where the creatures currently are* — they are emitted by every living Norn/Grendel/Ettin agent and follow those agents around the map. The field is a live population-density map.
- **Home-scent channels (CA 15-17)** track *where each race's home territory is located in the world* — they are emitted by a small number of **invisible, stationary beacon agents** placed once at map-bootstrap time and never moving afterwards. The field is a permanent geographic marker of the home zones, independent of the actual creatures' positions.

For Grendel home specifically, `Home smell emitters.cos:24-28` spawns **one** invisible emitter at a hard-coded position deep in the Grendel jungle terrarium: a single beacon `(family=3, genus=6, species=1)` at `(1948, 2310)` emitting CA 16 at **0.01**. The beacon is a `simp 3 6 1 "blnk" 2 0 0` invisible/mouseable agent running only `attr 18 / pose 0 / mvto 1948 2310 / emit 16 .01` — no event scripts, no physics, no movement. The `emit` call stores `myCAIndex=16` and `myCAIncrease=0.01` on the beacon; thereafter `Agent.HandleCA` (the per-agent CA-handling routine) takes the non-navigable branch on every CA-16 cycle and calls `map.IncreaseCAInput(roomID, 0.01)`, adding 0.01 per cycle to the beacon's room `caInput` accumulator.

Four key properties characterise chem 181:

1. **The channel is bound to the Grendel-home emitter category via CACL.** `z_agent smells.cos:29` contains the single line `cacl 3 6 0 16`. This registers in `AgentManager.ourCategoryIdsForSmellIds[16]` the smell-lobe neuron ID corresponding to the `(family=3, genus=6, species=0)` agent category — the classifier of **the Grendel-home-smell emitter agents themselves**, not of any creature. Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 16 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron. Because the creature's own classifier is `(family=4, genus=1/2/3, species=X)` — not 3/6/0 — the `neuronId == GetCategoryIdOfAgent(myCreature)` check on line 284 **never fires for CA 16 on a creature**; no `-MyContribution` subtraction is applied, and the brain neuron reads the same unmodified CA 16 value that is written to chem 181.
2. **A single fixed beacon emits CA 16 at a single hard-coded intensity.** The beacon `(3 6 1)` at `(1948, 2310)` emits `0.01` per CA-16 cycle. Unlike the Norn home (which gets two beacons at differing intensities to span the long Norn corridor) and the Ettin home (which gets three beacons at staggered locations across the long desert), the Grendel jungle terrarium is geometrically more compact, so one source suffices to flood the whole jungle with CA 16. The beacon does not move (no movement code, no physics) and has no event scripts: it simply exists and emits. The CA-16 field consequently has one fixed source — a single peak in the centre of the Grendel jungle — with the field falling off through diffusion and room-type loss as distance from the source increases.
3. **CA 16 diffuses more permissively than the race-scent channels.** The `!map.cos` rate table gives CA 16 a diffusion of **0.95** (rates `rate X 16 0.99 0.001 0.95` for room types 0-4, 8-10), compared to **0.80** for CA 12-14 and the food/eggs channels. The higher diffusion means the home-scent gradient spreads more widely through connected rooms per tick, giving creatures a long-range cue they can follow from many screens away. The gain is still 0.99 (nearly full reception) in air/indoor/water rooms, dropped to **0.40** in soil rooms (types 5-7), and zeroed in blocked/cold rooms (types 11-15). The loss is the standard 0.001 per tick — a long memory that, combined with the continuous beacon emission, produces a stable equilibrium field rather than a pulsing one.
4. **Chem 181 has no receptor at all in the standard genome.** Like chem 179 (Ettin), chem 180 (Norn home), and unlike chem 177/178 (Norn/Grendel race-scents, which have inert placeholder receptors at genes 131/132), chem 181 is **absent from the entire receptor list** of the standard biochemistry (`biochemistry.json` has no receptor row with `"chemical": 181`). The only behaviourally-active pathway from chem 181 in vanilla C3 is the smell-lobe neuron for category (3,6,0) — there is no bloodstream-visible response to Grendel-home proximity unless a breeder adds a receptor from scratch. The biochemistry copy exists purely for CAOS inspection, save/load snapshotting, and modder extensibility.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 16** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 16, smellValue)` → `Biochemistry.SetChemical(181, smellValue)`. The unmodified value is written — no `-MyContribution` adjustment applies because the neuron's category (3,6,0) is never the creature's own category | Per tick — direct assignment (not additive) |
| 2 | **Grendel-home beacon** `(3 6 1)` at `(1948, 2310)` | — | Invisible stationary agent spawned by `Home smell emitters.cos:24-28` | Bootstrap runs `new: simp 3 6 1 "blnk" 2 0 0 / attr 18 / pose va00 / mvto 1948 2310 / emit 16 .01`. Thereafter `Agent.HandleCA` non-navigable branch adds `0.01` to the beacon's room `caInput` every CA-16 cycle | 0.01 per CA-16 cycle, in the beacon's single fixed room |
| 3 | **CA diffusion from the beacon room** | — | `Map.UpdateCurrentCAProperty` (the room CA update routine) with diffusion 0.95 in most room types | No direct emission — the field spreads outward from the beacon room through every CA-16 tick, decaying at 0.001 per tick and attenuated by each room type's gain. The equilibrium field provides a multi-room gradient that creatures can follow | Emergent — determined by the per-room-type rate profile |
| 4 | **`CHEM` CAOS injection** | — | — | `chem 181 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 16 value) | Author-defined |
| 5 | **Ingestion of agents containing chem 181** | — | — | A `FOOD`/drug agent whose PRAY chemistry lists chem 181 will inject it on bite/eat. Same overwrite caveat as (4) | Author-defined |
| 6 | **Mod-added emitters or `altr room targ 16`** | — | — | Any add-on agent can issue `emit 16 <x>` on itself or `altr room targ 16 <x>` to seed CA 16 at a new location — typical usage includes creating additional home beacons for custom Grendel territories, adjusting the default beacon strength, or temporarily marking areas as "Grendel home" for behavioural experiments | Author-defined |

### Per-room-type diffusion rates

The 16-room-type rate profile for CA 16, from `!map.cos`, matches the other home-scent channels with the **higher diffusion coefficient (0.95 vs 0.80)**:

| Room type | gain | loss | diffusion | Behaviour for CA 16 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | **0.95** | Nearly full reception, near-permanent retention, very wide diffusion — Grendel-home scent floods outdoor jungle air across many rooms |
| 1-4 (indoor/tunnel variants) | 0.99 | 0.001 | **0.95** | Same — Grendel-home scent propagates freely through corridors and indoor spaces |
| 5-7 (soil variants) | **0.40** | 0.001 | **0.95** | Reduced reception (40 %) — soil attenuates Grendel-home scent, but diffusion remains wide |
| 8-9 (water / deep water) | 0.99 | 0.001 | **0.95** | Full reception in water (relevant for the swampy parts of the Grendel jungle) |
| 10 (indoor) | 0.99 | 0.001 | **0.95** | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

The combination of continuous emission (0.01 per cycle), 0.001 loss, and 0.95 diffusion produces a stable equilibrium that **builds up to a steady level in the beacon room** and trails off through adjacent connected rooms in a broad gradient. The single-beacon, low-intensity (0.01) configuration produces a noticeably weaker peak than the Norn-home setup (0.025 + 0.01 across two beacons), but the elevated diffusion still allows the gradient to be detected several rooms away — enough for navigational use within the jungle and at its borders, while keeping the field weak enough that distant Norns or Ettins do not constantly read significant CA 16.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (only behavioural pathway in stock C3) | — (CAOS-bound, not gene-bound) | `cacl 3 6 0 16` in `z_agent smells.cos:29` | `SensoryFaculty.Update` pushes the room's CA 16 value into `brain.SetInput("smel", neuronId, smellValue)` for the "Grendel Home" smell neuron (category 31 in the default 40-neuron smell lobe). No `-MyContribution` subtraction — the neuron's category (3,6,0) never matches a creature's own category (4,X,X) | Creatures learn to associate "Grendel home smell" with whatever experiences happen in the jungle terrarium — for Grendels: positive reinforcement (food, comfort, mates), driving go-to-home navigation when in need; for Norns and Ettins: typically aversive learning (encounters with Grendels, hostile environment), driving avoidance of the jungle. The smell lobe's plasticity builds each creature's mental map of "where Grendel territory is" from repeated exposure to this gradient |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 181 is overwritten every sensory tick inside rooms anyway |
| 3 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 181 | Threshold / gain / locus author-defined | A breeder can attach chem 181 to any biochemistry locus — e.g. a Comfort/Reward locus that spikes for Grendels in their jungle, a Fear locus that triggers in Norns/Ettins reading high CA 16, a homesick chemical for Grendels that builds up when away and drains when home. **No inert placeholder receptor exists** — breeders must add a receptor gene from scratch |

**The only behavioural pathway from chem 181 in the stock genome is the smell-lobe neuron for family 3 / genus 6 / species 0 (Grendel home emitter).** No receptor gene, no reaction, no neuroemitter, and no organ references chem 181 in vanilla C3. The channel is purely brain-layer, with its biochemistry mirror acting as a diagnostic and modder extension point rather than a genomic signalling pathway.

## Role in Game Mechanics

### Marking the Grendel jungle as a navigable scent zone

Creatures 3's Ark is divided into three race-themed biomes: the central **Norn corridor** (main garden, hatchery, nursery, orchard — gentle, food-rich, temperate), the **Grendel jungle terrarium** (hot, wet, dense vegetation, mushrooms, swamps), and the **Ettin desert** (dry, industrial, machinery-dominated). For each race, a dedicated home-scent channel marks the biome via invisible emitters:

- **CA 15 (Norn home)** — two beacons in the Norn corridor at `(780, 712)` and `(2360, 467)` (intensities 0.025 + 0.01)
- **CA 16 (Grendel home)** — one beacon in the Grendel jungle at `(1948, 2310)` (intensity 0.01)
- **CA 17 (Ettin home)** — three beacons in the Ettin desert at `(4872, 704)`, `(6200, 704)`, `(6363, 704)` (intensities 0.004 + 0.007 + 0.000)

The Grendel-home scent system serves two complementary purposes that depend on which race is reading it:

- **For Grendels**, CA 16 is the **homing cue** — a Grendel away from the jungle (visiting the Norn corridor or wandering into the Ettin desert) reads decreasing CA 16 and can climb the gradient back to the jungle when hungry, scared, or in need of mating opportunities. Grendel mothers and adult males spend most of their time in the jungle, and the smell lobe's repeated co-stimulation between CA 16 and the satisfaction of in-jungle drives reinforces the "home = jungle" association.
- **For Norns and Ettins**, CA 16 is an **aversive territorial cue** — a Norn entering the jungle reads rising CA 16 alongside encounters with hostile Grendels. The smell lobe associates the rising CA 16 signal with the negative experience and learns "high Grendel-home smell = bad place to be", driving the Norn back toward the Norn corridor (where CA 16 falls off and CA 15 rises). Ettins typically tolerate the jungle better but still learn weaker avoidance through similar experiential pairings.

This three-way territorial cross-perception is the sensory bedrock of C3's biome-segregation phenomenology: each race comes to favour its own biome and avoid the others, not through hard-coded behaviours but through learned associations between the dedicated home-scent channels and the experiences that occur in each biome.

### Why chem 181 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 181 to drive any physiological response to Grendel-home proximity — e.g. a Comfort locus for Grendels that produces contentment in the jungle, a Fear-elevating locus for Norns that triggers anxiety in Grendel territory, or a homesickness chemical for Grendels that builds up when far from the jungle. The standard genome does *not* express any receptor at all, so this pathway is entirely latent for breeders to populate.
2. **CAOS inspection.** A world script can read `chem TARG 181` to query how strongly the creature currently smells Grendel home, which is useful for diagnostic gadgets ("is this Grendel far from home?", "is this Norn in danger of meeting a Grendel?"), story scripts that trigger on biome entry/exit, behaviour monitors, and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so the bloodstream view shows Grendel-home smell alongside other smells without special-casing lobe inputs.

### The single-beacon architecture for Grendels

Grendels uniquely get **one** home beacon (Norns get two, Ettins get three including one inert). The single-beacon Grendel setup reflects a simple geometric reality: the Grendel jungle terrarium is **physically more compact** than the Norn corridor and the Ettin desert. The Norn corridor stretches roughly 0 → 4100 px in x along the main horizontal axis, and the Ettin desert spans the eastern third of the Ark — both wide enough that a single CA source's diffusion would not reach the far ends with a usefully detectable strength. The Grendel jungle, by contrast, is a denser cluster of rooms centred around `(1948, 2310)` (note the high y-coordinate placing it in the southern half of the Ark), and one beacon's 0.95-diffusion field can reasonably saturate it.

The intensity choice (0.01) is also lower than the Norn primary (0.025) — about 40 % of Norn-home strength. This produces a **lower equilibrium peak** than the Norn corridor: a Grendel reading "very strongly home" sees a smaller absolute CA 16 value than a Norn reading "very strongly home" sees CA 15. The asymmetry is intentional: Grendels are designed as the secondary race in C3 (the player's primary attention is on Norns), and the weaker home cue means slightly less reliable homing — Grendels wander further afield and rely more on visual/proximate cues than Norns do.

### Higher diffusion coefficient (0.95) — wider navigational gradient

The three home-scent channels (CA 15-17) get a diffusion rate of **0.95** in all non-blocked room types, compared to the **0.80** used by CA 11 (eggs), CA 12-14 (race scents), and most other smell channels. This is a **deliberate design choice** for home-beacons: the smell must spread further to give creatures a long-range homing cue, not just a local presence indicator. The tradeoff is that with higher diffusion, the gradient is smoother/shallower — a creature climbing toward the beacon gets steady small increases per step rather than a sharp spike near the source.

For the single-beacon Grendel setup, the wide diffusion is even more important than for Norns or Ettins, because there is no second beacon to back-fill the gradient at the jungle's edges. The 0.95 diffusion is the only mechanism by which the beacon's signal reaches the perimeter rooms of the jungle — without it, only the central beacon room would have detectable CA 16. The practical effect: a Grendel walking south through the central Ark vertical shaft will start detecting CA 16 several rooms before reaching the jungle entrance, with the reading rising steadily as it descends.

### No `-MyContribution` subtraction applies

Unlike CA 12-14 (which are bound to the creature's own-race category and trigger the self-emission suppression branch in `SensoryFaculty.Update`), CA 16 is bound to a completely different category — `(family=3, genus=6, species=0)` — the invisible beacon agent. Creatures are family 4, so the neuron-category/creature-category match check on line 284 **never fires for CA 16**. Consequences:

- The chemical (line 278) and the brain neuron (line 288) always receive the **same** unmodified value.
- A creature never "subtracts itself" from CA 16 because the creature never contributed to it in the first place.
- The smell lobe receives the full beacon-plus-diffusion intensity at all times.

This is the same architecture as CA 15 (Norn home), CA 17 (Ettin home), CA 9 (flowers) or CA 10 (machinery) — smell channels keyed to *agents in the world* rather than to the creatures themselves.

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 181 tracks the world or decays in isolation:

- **Inside any room.** Chem 181 is overwritten every sensory tick with the room's live CA 16 value. The 1241-tick half-life is moot — the chemical tracks the field directly.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 181 follows pure first-order decay at rate 0.99944177 per tick. A creature that was in the jungle just before falling retains residual chem 181 for roughly 23 s (half-life) before the next room-bound overwrite.

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
| **16** | **`3 6 0 16`** | **Grendel home beacon** |
| 17 | `3 7 0 17` | Ettin home beacons |
| 18 | `3 8 0 18` | Home-smell category 8 (unused/reserved) |

Brain connectivity in the default genome wires the three home neurons (15-17) into decision/drive centres that can modulate go-to-home or avoid-home behaviour based on each creature's race, drive state, and accumulated experiential learning.

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
The middle `enum 3 6 1` catches the single Grendel beacon (it's the only `(3,6,1)` in the world). When the script is uninstalled, the beacon is destroyed; `Agent.HandleCA` stops contributing to its room's `caInput`, and the CA 16 field drains at the 0.001 loss rate over roughly 1000 ticks. Any ongoing creature behaviour that depends on CA 16 learning will gradually decouple as the field fades.

### What modders can do with CA 16

The channel is fully active and extensible in several directions:

- **Relocate the Grendel home zone.** Editing the `mvto 1948 2310` line in `Home smell emitters.cos` moves the Grendel home territory to a different part of the map. Creatures will learn the new location over time via their smell-lobe plasticity. Useful for custom worlds where the Grendel jungle has been relocated, expanded, or reshaped.
- **Change the beacon intensity.** Editing the `emit 16 .01` line rescales the home-scent strength. A stronger beacon (e.g. `0.025` to match Norn primary) tightens and saturates the gradient, making the Grendel jungle a more dominant scent zone. Setting it to 0 effectively disables Grendel-home perception entirely.
- **Add more beacons.** Adding extra `new: simp 3 6 <species> "blnk" 2 0 0 / ... / emit 16 <rate>` blocks (with different species numbers to avoid classifier-ID clashes — but all caught by the species-0 wildcard in CACL) creates a multi-source gradient. Useful for extended jungle biomes, sub-zones (a "deep jungle" core plus a "jungle border"), or outposts.
- **Author a receptor from scratch.** Because chem 181 has no existing receptor gene, any biochemistry response requires a new gene. Typical targets: a Grendel-specific Comfort locus for jungle contentment, a Norn/Ettin-specific Fear locus for jungle anxiety, a hybrid genome's neutral curiosity locus, or a Homesick chemical that builds elsewhere and drains in the jungle.
- **Per-race genome differences.** Modders authoring distinct Norn vs Grendel vs Ettin genomes can give each race a different receptor for chem 181 — strong reward for Grendels, mild fear for Norns, neutral for Ettins — to bake biome-preference directly into biochemistry rather than relying purely on learned smell-lobe associations.
- **Temporary jungle markers.** A CAOS gadget running `new: simp ... / emit 16 .01` at runtime can mark a temporary "Grendel home" at any location — useful for relocation scenarios, training agents that need to exhibit Grendel-territorial behaviour, or "fake jungle" set pieces in custom adventures.
- **Monitor with CAOS.** `outs "grendel home = " outv chem TARG 181` in a debug gadget inspects how strongly the creature currently smells Grendel home, making it easy to verify navigation learning, test relocated beacons, or build territorial-behaviour heuristics.

### Practical consequences

- **Chem 181 is a geographic marker, not a population signal.** Unlike CA 13 (which tracks where Grendels *are*), CA 16 tracks where the Grendel *biome is* — a permanent feature of the map set at bootstrap. A Grendel being present in the jungle does *not* raise CA 16 (Grendels emit CA 13, not CA 16); only the invisible beacon does.
- **A Grendel at home sees high CA 16 and high CA 13.** The combined signal "home biome + lots of other Grendels" is the characteristic sensory signature of a well-populated jungle. A Grendel alone in the jungle sees high CA 16 and near-zero CA 13 (itself subtracted via `-MyContribution`). A Grendel in the Norn corridor sees low CA 16 and high CA 12. These three-way combinations are the sensory bedrock of C3's biome-awareness.
- **A Norn in the jungle sees rising CA 16 + rising CA 13** — the canonical "you are in Grendel territory" sensory signature. Repeated exposure (and the typically negative experiences that follow) trains the smell lobe to associate this signature with avoidance, reinforcing the Norn's preference for the home corridor.
- **Removing the beacon silences Grendel-home perception entirely.** With no receptor in the stock genome, destroying the emitter leaves creatures with no way to "feel" Grendel home — Grendels can still home via other cues (visual, food, social), but the dedicated home-scent signal vanishes. The smell-lobe neuron becomes permanently unstimulated.
- **Flooding chem 181 via `chem 181 255` has zero effect in stock C3.** No receptor reads it, and the smell-lobe neuron does not update from the chemical side because the sensory loop only writes on room-lookup (not on chem-set). The injection is simply overwritten on the next tick by the room value, with no transient biochemical or behavioural consequence.
- **The single beacon at (1948, 2310) is the entire source of CA 16.** A modder who deletes that one agent permanently removes Grendel-home scent from the world (until it regenerates at next bootstrap or is replaced). This makes the system fragile compared to the multi-beacon Norn and Ettin setups but also easier to mod.
- **The lower intensity (0.01) makes Grendel home less dominant than Norn home.** A creature standing exactly between a Norn and a Grendel home beacon — both at their published intensities — would smell more Norn home than Grendel home. This intensity asymmetry plays into the game's narrative weighting toward Norns as the central race.
- **The beacon is immune to gameplay interactions.** Its `attr 18` (invisible + mouseable) makes it clickable in the debugger but invisible to creatures and invisible in normal play. It has no physics, no movement, no scripts — it cannot be accidentally destroyed by creature behaviour, and its emission rate is fixed until the removal script runs.
- **The setup is race-symmetric in mechanism but intensity-asymmetric.** Norns get 2 beacons (0.025 + 0.01 = 0.035 total rate), Grendels get 1 (0.01), Ettins get 2 active + 1 inert (0.004 + 0.007 = 0.011 total). Grendels thus have the **weakest single-source home signal** of the three races in absolute terms, though comparable to Ettins in total rate. This relative weakness encourages Grendels to wander a bit more than Norns, contributing to their reputation as the more roving, opportunistic species.

### Summary

Chemical 181 — CA smell 16 (Grendel home) — is the bloodstream mirror of the **Grendel home-territory scent channel** in the Creatures 3 map CA system. Unlike the race-scent channels (CA 12-14) which track live creature populations, CA 16 marks a **fixed geographic zone**: a single invisible stationary beacon placed by `Home smell emitters.cos` deep in the Grendel jungle terrarium at `(1948, 2310)` continuously broadcasts CA 16 at intensity **0.01**, producing a stable equilibrium field that diffuses outward through connected jungle rooms at the channel's **elevated 0.95 diffusion rate** — designed for long-range homing navigation rather than local presence detection. The channel is bound to the smell lobe via `cacl 3 6 0 16` in `z_agent smells.cos:29`, feeding the "Grendel Home" neuron (category 31) with the room's unmodified CA 16 value every sensory tick. No `-MyContribution` subtraction applies because the neuron's category (3,6,0) never matches a creature's own category (4,X,X). **Like chem 179 (Ettin), chem 180 (Norn home), and unlike chem 177/178 (Norn/Grendel race-scents), chem 181 has no receptor gene at all in the stock genome** — the only behavioural pathway is the smell-lobe neuron, and any biochemical response to Grendel-home proximity requires a modder to author a receptor from scratch. The single-beacon, low-intensity (0.01) configuration reflects the geometric compactness of the jungle biome and the design choice to make Grendel home a noticeably weaker signal than Norn home — Grendels home reliably from within the jungle and its borders but wander further than Norns do. The practical result is a wide-gradient geographic beacon that Grendels follow back to the jungle, that Norns and Ettins learn to associate with hostile encounters and avoid, and that together with CA 15 and CA 17 builds the three-way territorial sensory map underpinning C3's biome-segregated society.
