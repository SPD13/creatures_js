# 182 - CA smell 17 (Ettin home)

Chemical 182 is the eighteenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 17**. The canonical naming table (`biochemistry.json` row 8994) labels it `"CA smell 17 (Ettin home)"`, and the channel marks the **Ettin home territory** in the Ark: a small fleet of invisible stationary beacons broadcasts CA 17 across the long Ettin desert, producing a slowly-decaying scent gradient that creatures can smell from many rooms away and use to home in on (or avoid) the Ettin biome. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `17`, and writes that float into biochemistry chemical `FIRST_SMELL_CHEMICAL + 17 = 182` (with `FIRST_SMELL_CHEMICAL = 165`).

CA 17 is the **third and final of the three home/territory smell channels** — CA 15 (Norn home), CA 16 (Grendel home), CA 17 (Ettin home) — that follow the beacon-emitter architecture rather than the per-creature emission model used by the race-scent channels (CA 12-14):

- **Race-scent channels (CA 12-14)** track *where the creatures currently are* — they are emitted by every living Norn/Grendel/Ettin agent and follow those agents around the map. The field is a live population-density map.
- **Home-scent channels (CA 15-17)** track *where each race's home territory is located in the world* — they are emitted by a small number of **invisible, stationary beacon agents** placed once at map-bootstrap time and never moving afterwards. The field is a permanent geographic marker of the home zones, independent of the actual creatures' positions.

For Ettin home specifically, `Home smell emitters.cos:32-48` spawns **three** invisible emitters strung across the Ettin desert at the eastern end of the Ark, all at y ≈ 704 (the desert's main ground level) and at staggered x-coordinates spanning roughly 4872 → 6363 px:

```
new: simp 3 7 1 "blnk" 2 0 0 / mvto 4872 704 / emit 17 .004
new: simp 3 7 1 "blnk" 2 0 0 / mvto 6200 704 / emit 17 .007
new: simp 3 7 1 "blnk" 2 0 0 / mvto 6363 704 / emit 17 .000
```

All three share the same classifier `(family=3, genus=7, species=1)` — the engine permits multiple agents with identical classifiers to coexist (the `simp` command does not enforce uniqueness). Two of the three are **active** emitters with non-zero rates (0.004 at the western edge, 0.007 at the desert core), while the third at `(6363, 704)` is **inert** — it emits 0.000 and contributes nothing to the field. The inert beacon's purpose is documented in *Role in Game Mechanics* below.

Four key properties characterise chem 182:

1. **The channel is bound to the Ettin-home emitter category via CACL.** `z_agent smells.cos:30` contains the single line `cacl 3 7 0 17`. This registers in `AgentManager.ourCategoryIdsForSmellIds[17]` the smell-lobe neuron ID corresponding to the `(family=3, genus=7, species=0)` agent category — the classifier of **the Ettin-home-smell emitter agents themselves**, not of any creature. Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 17 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron. Because the creature's own classifier is `(family=4, genus=1/2/3, species=X)` — not 3/7/0 — the `neuronId == GetCategoryIdOfAgent(myCreature)` check on line 284 **never fires for CA 17 on a creature**; no `-MyContribution` subtraction is applied, and the brain neuron reads the same unmodified CA 17 value that is written to chem 182. The species-0 wildcard in the CACL classifier matches every species of `(3,7,*)`, so all three emitter species (all happen to be species=1, but this is incidental) feed the same neuron.
2. **Three beacons emit CA 17 at staggered locations and intensities.** The two active beacons (`(4872, 704)` at 0.004 and `(6200, 704)` at 0.007) plus one inert beacon (`(6363, 704)` at 0.000) define the Ettin desert's long horizontal scent profile. The 0.007 core beacon sits roughly at the desert centre, with the 0.004 beacon ~1300 px to the west marking the desert's western entrance. The two together span ~1330 px of beacon-source coverage along x, supplemented by the 0.95 diffusion that floods adjacent rooms. None of the beacons move, none have event scripts, none have physics — they simply exist and emit on every CA-17 cycle.
3. **CA 17 diffuses more permissively than the race-scent channels.** The `!map.cos` rate table gives CA 17 a diffusion of **0.95** (rates `rate X 17 0.99 0.001 0.95` for room types 0-4, 8-10), compared to **0.80** for CA 12-14 and the food/eggs channels. The higher diffusion means the home-scent gradient spreads more widely through connected rooms per tick, giving creatures a long-range cue they can follow from many screens away. The gain is still 0.99 (nearly full reception) in air/indoor/water rooms, dropped to **0.40** in soil rooms (types 5-7), and zeroed in blocked/cold rooms (types 11-15). The loss is the standard 0.001 per tick — a long memory that, combined with the continuous beacon emission, produces a stable equilibrium field rather than a pulsing one.
4. **Chem 182 has no receptor at all in the standard genome.** Like chem 179 (Ettin race-scent), chem 180 (Norn home), chem 181 (Grendel home), and unlike chem 177/178 (Norn/Grendel race-scents, which carry inert placeholder receptors at genes 131/132), chem 182 is **absent from the entire receptor list** of the standard biochemistry (`biochemistry.json` has no receptor row with `"chemical": 182`). The only behaviourally-active pathway from chem 182 in vanilla C3 is the smell-lobe neuron for category (3,7,0) — there is no bloodstream-visible response to Ettin-home proximity unless a breeder adds a receptor from scratch. The biochemistry copy exists purely for CAOS inspection, save/load snapshotting, and modder extensibility.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 17** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 17, smellValue)` → `Biochemistry.SetChemical(182, smellValue)`. The unmodified value is written — no `-MyContribution` adjustment applies because the neuron's category (3,7,0) is never the creature's own category | Per tick — direct assignment (not additive) |
| 2 | **Ettin-home western beacon** `(3 7 1)` at `(4872, 704)` | — | Invisible stationary agent spawned by `Home smell emitters.cos:32-36` | Bootstrap runs `new: simp 3 7 1 "blnk" 2 0 0 / attr 18 / pose va00 / mvto 4872 704 / emit 17 .004`. Thereafter `Agent.HandleCA` non-navigable branch adds `0.004` to the beacon's room `caInput` every CA-17 cycle | 0.004 per CA-17 cycle, in this beacon's single fixed room |
| 3 | **Ettin-home core beacon** `(3 7 1)` at `(6200, 704)` | — | Invisible stationary agent spawned by `Home smell emitters.cos:38-42` | Same construction, with `mvto 6200 704 / emit 17 .007` — placed at the desert core | 0.007 per CA-17 cycle (the strongest of the three) |
| 4 | **Ettin-home inert beacon** `(3 7 1)` at `(6363, 704)` | — | Invisible stationary agent spawned by `Home smell emitters.cos:44-48` | Same construction, with `mvto 6363 704 / emit 17 .000`. Stored as `myCAIndex=17`, `myCAIncrease=0.0` | **0.000 — no contribution.** The agent exists in the world but adds nothing to the CA 17 field. See *The inert third beacon* below for the design rationale |
| 5 | **CA diffusion from the beacon rooms** | — | `Map.UpdateCurrentCAProperty` (the room CA update routine) with diffusion 0.95 in most room types | No direct emission — the field spreads outward from the active beacon rooms through every CA-17 tick, decaying at 0.001 per tick and attenuated by each room type's gain. The two active sources combine into a smooth east-leaning equilibrium field across the Ettin desert | Emergent — determined by the per-room-type rate profile |
| 6 | **`CHEM` CAOS injection** | — | — | `chem 182 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 17 value) | Author-defined |
| 7 | **Ingestion of agents containing chem 182** | — | — | A `FOOD`/drug agent whose PRAY chemistry lists chem 182 will inject it on bite/eat. Same overwrite caveat as (6) | Author-defined |
| 8 | **Mod-added emitters or `altr room targ 17`** | — | — | Any add-on agent can issue `emit 17 <x>` on itself or `altr room targ 17 <x>` to seed CA 17 at a new location — typical usage includes adding extra desert beacons, "activating" the inert third beacon by editing its emission rate, or temporarily marking areas as "Ettin home" for behavioural experiments | Author-defined |

### Per-room-type diffusion rates

The 16-room-type rate profile for CA 17, from `!map.cos`, matches the other home-scent channels with the **higher diffusion coefficient (0.95 vs 0.80)**:

| Room type | gain | loss | diffusion | Behaviour for CA 17 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | **0.95** | Nearly full reception, near-permanent retention, very wide diffusion — Ettin-home scent floods the desert air across many rooms |
| 1-4 (indoor/tunnel variants) | 0.99 | 0.001 | **0.95** | Same — Ettin-home scent propagates freely through machinery shafts, tunnels, and indoor rooms |
| 5-7 (soil variants) | **0.40** | 0.001 | **0.95** | Reduced reception (40 %) — soil attenuates Ettin-home scent, but diffusion remains wide |
| 8-9 (water / deep water) | 0.99 | 0.001 | **0.95** | Full reception in water (rare in the Ettin desert but occurs at the underground aquifer) |
| 10 (indoor) | 0.99 | 0.001 | **0.95** | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

The combination of two active emission sources (0.004 + 0.007 = 0.011 per cycle), 0.001 loss, and 0.95 diffusion produces a stable equilibrium that **builds up to a steady level in each beacon room** and trails off through adjacent connected rooms in a broad gradient. Because the two active beacons sit at different x-positions (4872 vs 6200), the field has **two overlapping peaks**: a smaller one at the desert's western entrance and a larger one in its core. The combined coverage spans the entire Ettin desert width, producing a CA 17 field that any creature in the desert detects strongly and any creature at the desert's perimeter detects faintly.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (only behavioural pathway in stock C3) | — (CAOS-bound, not gene-bound) | `cacl 3 7 0 17` in `z_agent smells.cos:30` | `SensoryFaculty.Update` pushes the room's CA 17 value into `brain.SetInput("smel", neuronId, smellValue)` for the "Ettin Home" smell neuron (category 31 in the default 40-neuron smell lobe slot reserved for CA 17). No `-MyContribution` subtraction — the neuron's category (3,7,0) never matches a creature's own category (4,X,X) | Creatures learn to associate "Ettin home smell" with whatever experiences happen in the desert biome — for Ettins: positive reinforcement (machinery interaction, mates), driving go-to-home navigation when in need; for Norns and Grendels: typically neutral-to-mild aversive learning (the Ettin desert is dry, sparse, and lacks food/water, so visiting Norns associate the rising CA 17 with discomfort). The smell lobe's plasticity builds each creature's mental map of "where Ettin territory is" from repeated exposure to this gradient |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 182 is overwritten every sensory tick inside rooms anyway |
| 3 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 182 | Threshold / gain / locus author-defined | A breeder can attach chem 182 to any biochemistry locus — e.g. a Comfort/Reward locus that spikes for Ettins in the desert, a Fear locus that triggers in Norns/Grendels reading high CA 17, a homesick chemical for Ettins that builds up when away and drains when home, or a reward locus tied to machinery activity. **No inert placeholder receptor exists** — breeders must add a receptor gene from scratch |

**The only behavioural pathway from chem 182 in the stock genome is the smell-lobe neuron for family 3 / genus 7 / species 0 (Ettin home emitter).** No receptor gene, no reaction, no neuroemitter, and no organ references chem 182 in vanilla C3. The channel is purely brain-layer, with its biochemistry mirror acting as a diagnostic and modder extension point rather than a genomic signalling pathway.

## Role in Game Mechanics

### Marking the Ettin desert as a navigable scent zone

Creatures 3's Ark is divided into three race-themed biomes: the central **Norn corridor** (main garden, hatchery, nursery, orchard — gentle, food-rich, temperate), the **Grendel jungle terrarium** (hot, wet, dense vegetation, mushrooms, swamps), and the **Ettin desert** at the eastern end (dry, industrial, machinery-dominated, sparser food). For each race, a dedicated home-scent channel marks the biome via invisible emitters:

- **CA 15 (Norn home)** — two beacons in the Norn corridor at `(780, 712)` and `(2360, 467)` (intensities 0.025 + 0.01)
- **CA 16 (Grendel home)** — one beacon in the Grendel jungle at `(1948, 2310)` (intensity 0.01)
- **CA 17 (Ettin home)** — three beacons in the Ettin desert at `(4872, 704)`, `(6200, 704)`, `(6363, 704)` (intensities 0.004 + 0.007 + 0.000)

The Ettin-home scent system serves two complementary purposes that depend on which race is reading it:

- **For Ettins**, CA 17 is the **homing cue** — an Ettin away from the desert (visiting the Norn corridor or wandering into the Grendel jungle) reads decreasing CA 17 and can climb the gradient back to the desert when hungry, scared, or in need of mating opportunities. Ettin males in particular are known for their roving tendencies (they're the species that spends the most time tinkering with machinery scattered throughout the Ark), and CA 17 provides the navigational anchor that pulls them back to the desert when needed. The smell lobe's repeated co-stimulation between CA 17 and the satisfaction of in-desert drives reinforces the "home = desert" association.
- **For Norns and Grendels**, CA 17 is a **mild aversive territorial cue** — a Norn entering the desert reads rising CA 17 alongside discomfort signals (heat, dryness, sparse food). Unlike the Grendel jungle, which is overtly hostile (live Grendels attack visitors), the Ettin desert is more passively unpleasant: Ettins are not particularly aggressive toward visitors, but the environmental harshness and food scarcity teach Norns and Grendels to associate rising CA 17 with biological discomfort. The aversive learning is therefore weaker than for CA 16 (Grendel home, paired with active hostility) but still present.

This three-way territorial cross-perception is the sensory bedrock of C3's biome-segregation phenomenology: each race comes to favour its own biome and avoid the others, not through hard-coded behaviours but through learned associations between the dedicated home-scent channels and the experiences that occur in each biome.

### Why chem 182 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 182 to drive any physiological response to Ettin-home proximity — e.g. a Comfort locus for Ettins that produces contentment in the desert, a Fear-elevating locus for Grendels that triggers anxiety in machinery-rich territory, a homesickness chemical for Ettins that builds up when far from the desert, or even an alertness boost that makes Ettins more receptive to learning when in their home biome. The standard genome does *not* express any receptor at all, so this pathway is entirely latent for breeders to populate.
2. **CAOS inspection.** A world script can read `chem TARG 182` to query how strongly the creature currently smells Ettin home, which is useful for diagnostic gadgets ("is this Ettin far from home?", "is this Norn straying into the desert?"), story scripts that trigger on biome entry/exit, behaviour monitors, and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so the bloodstream view shows Ettin-home smell alongside other smells without special-casing lobe inputs.

### The three-beacon architecture for Ettins

Ettins uniquely get **three** home beacons (Norns get two, Grendels get one). This reflects the **horizontal length of the Ettin desert** along the eastern edge of the Ark — geometrically, the desert spans roughly the rightmost ~2000 px of the map (x ≈ 4500 → 6500), longer than the Grendel jungle's compact ~1000 px footprint and roughly comparable to the Norn corridor's ~3000-px stretch. A single beacon's diffusion field — even at the elevated 0.95 rate — would not reach the desert's extremes with usefully detectable intensity. By placing two beacons spread ~1300 px apart (4872 and 6200), the Ettin home setup builds a **two-source overlapping field** that maintains a roughly uniform CA 17 reading across the entire desert's interior, with falloff toward the perimeter.

The intensity profile is also distinctive: 0.004 + 0.007 = 0.011 total active emission per CA-17 cycle, the **lowest total intensity of any home channel** (Norn: 0.035, Grendel: 0.010, Ettin: 0.011 — the Ettin desert is in the same intensity range as the Grendel jungle despite being geometrically larger). This lower per-source intensity is compensated by the multi-beacon coverage: each individual beacon contributes less, but the spread of sources covers more ground. The practical effect is that an Ettin in its home desert sees a **lower peak CA 17** than a Norn in its home corridor sees CA 15, but the *spatial extent* of the detectable home zone is broader. The asymmetric peak intensity also reinforces the Ettin's reputation as the "wandering" race — a weaker home pull means less urgent homing behaviour and more tolerance for being far from base.

### The inert third beacon at (6363, 704)

The third Ettin-home beacon at `(6363, 704)` is configured with `emit 17 .000` — it is **inert**. This is unusual and warrants explanation. Several plausible reasons (not mutually exclusive) account for its presence:

1. **Placeholder for tuning.** The bootstrap author may have intended the third beacon as a hook for adjusting the desert's eastern-edge intensity post-hoc. Setting it to 0.000 leaves the agent in the world but contributes nothing to the field; a balance pass could later raise it to a non-zero value to fine-tune the gradient at the desert's far east. This is a common pattern in C3 bootstrap files: agents are pre-instantiated with neutral parameters so that future tuning requires only an `altr` or re-`emit` rather than a fresh agent spawn.
2. **Symmetry with the Norn-corridor design intention.** Norns get two beacons, Ettins get three, Grendels get one — having three beacons spans the full intensity-asymmetry palette (high primary, mid secondary, zero tertiary) and may have served as a template for future expansion of the home-beacon system.
3. **Removal-script consistency.** The `rscr` block for the home emitters uses `enum 3 7 1 / kill targ` to clean up Ettin-home beacons. By declaring three agents at the bootstrap stage, the cleanup loop removes all of them uniformly without needing to know in advance which were active and which inert. If the inert beacon were absent, the cleanup would still work (only the two active beacons would exist), so this is a weak motivation by itself.
4. **Modder-friendly extensibility.** Leaving an inert beacon in the world makes it trivially easy for a modder or runtime-CAOS gadget to "activate" it by issuing `enum 3 7 1` and re-emitting at a chosen rate — no need to spawn a new agent, just re-task the existing one. This is consistent with C3's general philosophy of leaving extension hooks visible in the bootstrap source.

Whatever the original intent, the practical effect is that the Ettin desert has **two active sources** in the field calculation and **one stub agent** that participates in the agent enumeration but contributes nothing to scent. The CA 17 gradient is determined entirely by the 0.004 and 0.007 beacons.

### Higher diffusion coefficient (0.95) — wider navigational gradient

The three home-scent channels (CA 15-17) get a diffusion rate of **0.95** in all non-blocked room types, compared to the **0.80** used by CA 11 (eggs), CA 12-14 (race scents), and most other smell channels. This is a **deliberate design choice** for home-beacons: the smell must spread further to give creatures a long-range homing cue, not just a local presence indicator. The tradeoff is that with higher diffusion, the gradient is smoother/shallower — a creature climbing toward a beacon gets steady small increases per step rather than a sharp spike near the source.

For the spread-out Ettin setup, the wide diffusion combines with the multi-beacon configuration to produce a **plateau-shaped field**: between the two active beacons (~4872 and ~6200) the field is roughly uniform (the two sources back-fill each other), while outside this span the field drops off toward the desert's extremities. This shape is well-suited to the Ettin's wider-ranging behaviour: rather than producing a single sharp homing peak that would pull Ettins toward one specific point, the desert presents a broad "you are home" zone within which Ettins can freely wander among machinery installations without their home-smell signal swinging dramatically with each step.

### No `-MyContribution` subtraction applies

Unlike CA 12-14 (which are bound to the creature's own-race category and trigger the self-emission suppression branch in `SensoryFaculty.Update`), CA 17 is bound to a completely different category — `(family=3, genus=7, species=0)` — the invisible beacon agents. Creatures are family 4, so the neuron-category/creature-category match check on line 284 **never fires for CA 17**. Consequences:

- The chemical (line 278) and the brain neuron (line 288) always receive the **same** unmodified value.
- A creature never "subtracts itself" from CA 17 because the creature never contributed to it in the first place.
- The smell lobe receives the full beacon-plus-diffusion intensity at all times.

This is the same architecture as CA 15 (Norn home), CA 16 (Grendel home), CA 9 (flowers) or CA 10 (machinery) — smell channels keyed to *agents in the world* rather than to the creatures themselves.

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 182 tracks the world or decays in isolation:

- **Inside any room.** Chem 182 is overwritten every sensory tick with the room's live CA 17 value. The 1241-tick half-life is moot — the chemical tracks the field directly.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 182 follows pure first-order decay at rate 0.99944177 per tick. A creature that was in the desert just before falling retains residual chem 182 for roughly 23 s (half-life) before the next room-bound overwrite.

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
| **17** | **`3 7 0 17`** | **Ettin home beacons** |
| 18 | `3 8 0 18` | Home-smell category 8 (unused/reserved) |

Brain connectivity in the default genome wires the three home neurons (15-17) into decision/drive centres that can modulate go-to-home or avoid-home behaviour based on each creature's race, drive state, and accumulated experiential learning. CA 17 closes the home-channel triplet — without it, Ettins would lack a dedicated homing cue for their biome.

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

The third `enum 3 7 1` block iterates over all three Ettin-home beacons (the two active + one inert all share classifier `(3,7,1)`) and destroys each in turn. When the script is uninstalled, all three beacons disappear; `Agent.HandleCA` stops contributing to their rooms' `caInput`, and the CA 17 field drains at the 0.001 loss rate over roughly 1000 ticks. Any ongoing creature behaviour that depends on CA 17 learning will gradually decouple as the field fades.

### What modders can do with CA 17

The channel is fully active and extensible in several directions:

- **Relocate the Ettin home zone.** Editing the `mvto` lines for the three beacons in `Home smell emitters.cos` moves the Ettin home territory to a different part of the map. Creatures will learn the new location over time via their smell-lobe plasticity. Useful for custom worlds where the Ettin desert has been relocated, expanded, or reshaped.
- **Activate the inert third beacon.** Editing `emit 17 .000` to a non-zero rate (e.g. `0.005`) at `(6363, 704)` adds a third active source, extending the desert's high-CA-17 zone further east. Trivial to do at runtime via `enum 3 7 1` (with discrimination by position) or by editing the bootstrap directly.
- **Change beacon intensities.** Rebalancing the three beacons rescales the desert's home-scent strength. A stronger setup (e.g. matching Norn home's 0.035 total) produces a tighter, more dominant gradient comparable to the Norn corridor; weaker setups make Ettins wander even further from base. Setting all three to 0 effectively disables Ettin-home perception entirely.
- **Add more beacons.** Adding extra `new: simp 3 7 <species> "blnk" 2 0 0 / ... / emit 17 <rate>` blocks (with different species numbers if classifier-uniqueness matters elsewhere — but all caught by the species-0 wildcard in CACL) creates an even denser multi-source gradient. Useful for sub-zoned deserts (a "main desert" core plus separate "outpost" and "border" zones).
- **Author a receptor from scratch.** Because chem 182 has no existing receptor gene, any biochemistry response requires a new gene. Typical targets: an Ettin-specific Comfort locus for desert contentment, a Norn/Grendel-specific Fear locus for desert anxiety, a hybrid genome's neutral curiosity locus, a Homesick chemical that builds elsewhere and drains in the desert, or an alertness boost for Ettins around machinery.
- **Per-race genome differences.** Modders authoring distinct Norn vs Grendel vs Ettin genomes can give each race a different receptor for chem 182 — strong reward for Ettins, mild discomfort for Norns/Grendels — to bake biome-preference directly into biochemistry rather than relying purely on learned smell-lobe associations.
- **Temporary desert markers.** A CAOS gadget running `new: simp ... / emit 17 .01` at runtime can mark a temporary "Ettin home" at any location — useful for relocation scenarios, training agents that need to exhibit Ettin-territorial behaviour, or "fake desert" set pieces in custom adventures.
- **Monitor with CAOS.** `outs "ettin home = " outv chem TARG 182` in a debug gadget inspects how strongly the creature currently smells Ettin home, making it easy to verify navigation learning, test relocated beacons, or build territorial-behaviour heuristics.

### Practical consequences

- **Chem 182 is a geographic marker, not a population signal.** Unlike CA 14 (which tracks where Ettins *are*), CA 17 tracks where the Ettin *biome is* — a permanent feature of the map set at bootstrap. An Ettin being present in the desert does *not* raise CA 17 (Ettins emit CA 14, not CA 17); only the invisible beacons do.
- **An Ettin at home sees high CA 17 and high CA 14.** The combined signal "home biome + lots of other Ettins" is the characteristic sensory signature of a well-populated desert. An Ettin alone in the desert sees high CA 17 and near-zero CA 14 (itself subtracted via `-MyContribution`). An Ettin in the Norn corridor sees low CA 17 and high CA 12. These three-way combinations are the sensory bedrock of C3's biome-awareness.
- **A Norn in the desert sees rising CA 17 + rising CA 14** — the canonical "you are in Ettin territory" sensory signature. Repeated exposure (and the typically uncomfortable experiences that follow — heat, dryness, sparse food) trains the smell lobe to associate this signature with mild avoidance, reinforcing the Norn's preference for the home corridor.
- **Removing the beacons silences Ettin-home perception entirely.** With no receptor in the stock genome, destroying the emitters leaves creatures with no way to "feel" Ettin home — Ettins can still home via other cues (visual, machinery proximity, social), but the dedicated home-scent signal vanishes. The smell-lobe neuron becomes permanently unstimulated.
- **Flooding chem 182 via `chem 182 255` has zero effect in stock C3.** No receptor reads it, and the smell-lobe neuron does not update from the chemical side because the sensory loop only writes on room-lookup (not on chem-set). The injection is simply overwritten on the next tick by the room value, with no transient biochemical or behavioural consequence.
- **The two active beacons combine into a plateau, not a spike.** Because the 0.004 and 0.007 beacons sit ~1300 px apart and both diffuse at 0.95, their fields overlap heavily in the middle of the desert, producing a roughly uniform CA 17 reading there. The peak intensity is in the 0.007 beacon's room, but the difference between the desert's interior rooms is small — Ettins in the desert do not get sharp directional cues from CA 17, only a clear "here is home" plateau.
- **The intensity asymmetry across home channels reflects narrative weighting.** Norn home (0.035 total) is the most dominant signal — the Ark is centred on Norns. Ettin home (0.011 total) and Grendel home (0.010 total) are roughly comparable to each other and clearly weaker than the Norn home. This asymmetry encourages Norns to stay in their corridor, Grendels and Ettins to wander a bit more, and the player's attention to gravitate toward the Norn-centric experience while still leaving the other races viable.
- **The beacons are immune to gameplay interactions.** Their `attr 18` (invisible + mouseable) makes them clickable in the debugger but invisible to creatures and invisible in normal play. They have no physics, no movement, no scripts — they cannot be accidentally destroyed by creature behaviour, and their emission rates are fixed until the removal script runs.
- **The setup is race-symmetric in mechanism but asymmetric in implementation.** Norns get 2 beacons (both active), Grendels get 1 beacon (active), Ettins get 3 beacons (2 active + 1 inert). The Ettin trio is the most complex, mirroring the geometric extent of the desert biome and providing the most modder-friendly extension surface (the inert beacon being the most explicit invitation to extend or rebalance).

### Summary

Chemical 182 — CA smell 17 (Ettin home) — is the bloodstream mirror of the **Ettin home-territory scent channel** in the Creatures 3 map CA system. Unlike the race-scent channels (CA 12-14) which track live creature populations, CA 17 marks a **fixed geographic zone**: three invisible stationary beacons placed by `Home smell emitters.cos` across the Ettin desert at the eastern end of the Ark — at `(4872, 704)` emitting **0.004**, at `(6200, 704)` emitting **0.007**, and an **inert** beacon at `(6363, 704)` emitting **0.000** — broadcast a stable equilibrium field that diffuses outward through the desert at the channel's **elevated 0.95 diffusion rate**. The two active sources combine into an overlapping plateau covering the entire desert width, designed for biome-wide presence detection rather than precise homing. The channel is bound to the smell lobe via `cacl 3 7 0 17` in `z_agent smells.cos:30`, feeding the "Ettin Home" neuron with the room's unmodified CA 17 value every sensory tick. No `-MyContribution` subtraction applies because the neuron's category (3,7,0) never matches a creature's own category (4,X,X). **Like chem 179 (Ettin race-scent), chem 180 (Norn home), chem 181 (Grendel home), and unlike chem 177/178 (Norn/Grendel race-scents), chem 182 has no receptor gene at all in the stock genome** — the only behavioural pathway is the smell-lobe neuron, and any biochemical response to Ettin-home proximity requires a modder to author a receptor from scratch. The three-beacon setup with one inert beacon reflects the Ettin desert's horizontal extent and provides a clear modder-extension hook, while the lower total intensity (0.011, comparable to Grendel home and well below Norn home) underwrites the Ettins' reputation as the most roving race. Together with CA 15 and CA 16, chem 182 closes the three-way territorial sensory map underpinning C3's biome-segregated society — a permanent geographic backbone of "where each race belongs", learned through smell-lobe plasticity rather than hard-coded behaviour.
