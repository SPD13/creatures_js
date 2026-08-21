# 184 - CA smell 19

Chemical 184 is the **last and twentieth** of the "CA smell" chemicals (chems 165 … 184) — the bloodstream mirror of **map cellular-automata channel 19**, the final slot in the 20-channel CA grid (`CA_PROPERTY_COUNT = 20`). The canonical naming table (`biochemistry.json` row 9017) labels it bluntly `"CA smell 19"` with no parenthetical descriptor — the only smell channel besides chems 176 and 183 to lack one. Unlike every other CA channel from 6 through 18 — each of which carries an explicit semantic role (food types, machinery, eggs, race scents, home zones, info gadgets) — **CA 19 has no semantic role assigned in vanilla C3**. It is the engine's reserved/scratch smell channel: a fully-functional CA cellular-automata field with its own per-room-type rate table, its own engine-managed bloodstream chemical row, and its own genome speed-class entry, but with **no smell-lobe neuron binding, no agent-category emitters, and no receptor gene** anywhere in the stock data files. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) still loops over all 20 CA indices and writes the CA-19 value into chem `FIRST_SMELL_CHEMICAL + 19 = 184` — the chemical exists and is faithfully updated — but in a default world the value being written is identically zero everywhere, because no agent emits into channel 19.

Five key properties characterise chem 184:

1. **CA 19 has no `cacl` line in `z_agent smells.cos`.** The bootstrap smell-binding script defines bindings only for CA 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18 (`z_agent smells.cos` — 12 explicit `cacl` lines). CA 19 is conspicuously absent. This means `AgentManager.ourCategoryIdsForSmellIds[19]` is initialised to a default value (`-1`, "no category bound to this smell") for the entire game lifetime in stock C3. Inside `SensoryFaculty.Update`, when `i==19`, the line `int neuronId = theAgentManager.GetCategoryIdFromSmellId(19)` returns `-1`, and the subsequent `brain.SetInput("smel", -1, smellValue)` either silently no-ops or writes to a sentinel slot — either way **no learning, no behavioural pathway, and no smell-lobe response is produced from CA 19**. The CA channel is "live" in the map but "dead" in the brain.
2. **No agent in the bootstrap emits CA 19.** Exhaustive grep of `Assets/Bootstrap/001 World/` and `Assets/C3_Bootstrap_V2/` returns **zero `emit 19` lines and zero `altr room targ 19` lines**. The only place CA 19 appears in bootstrap source is the per-room-type rate table in `!map.cos` (which initialises the diffusion field's parameters but contributes no signal). With no emitters, the CA-19 field stays at its initial state of zero forever, the diffusion equation has nothing to spread, and chem 184 reads exactly 0.0 in every room of every world unless a mod or a world script intervenes.
3. **The rate profile has a uniquely tight diffusion footprint.** CA 19 is the **only** smell channel whose 16-room-type rate profile uses **diffusion = 0.010** (rather than the 0.80 / 0.95 used by every active smell channel) for soil rooms (types 5-7) **and** water rooms (types 8-9). The full profile is: outdoor air & indoor types (0-4) at 0.99/0.001/0.80 (full reception, near-permanent retention, standard diffusion); soil types (5-7) at 0.40/0.001/**0.010** (reduced gain, almost no diffusion — soil is opaque to CA 19 spreading); water types (8-9) also at 0.40/0.001/**0.010** (reduced gain, almost no diffusion — water also blocks CA 19 spreading); and types 10-15 at 0.00/0.00/0.00 (dead zones). The 80× diffusion reduction in soil and water (0.010 vs 0.80) is the channel's signature design feature: any signal injected by a mod into CA 19 diffuses freely through the air-and-indoor regions but is **effectively trapped in soil pockets and water bodies** as a localised hot spot that decays in place rather than spreading. This is consistent with reserving the channel for a future "surface-only" or "air-borne" scent marker — perhaps an unimplemented "fire/smoke" or "alarm" channel that the developers stubbed-out at `!map.cos` authoring time but never wired up to the engine or bootstrap.
4. **Chem 184 has no receptor and no reaction gene.** Searching the entire `biochemistry.json` for `"chemical": 184` returns exactly one hit — the `chemicals` row that names the chemical and assigns its decay rate. **Zero receptor rows, zero reaction rows, zero emitter rows reference chem 184.** The chemical is essentially a write-only mirror: the engine writes to it every sensory tick (with the value 0.0 in stock worlds), no gene reads it, no biochemistry response of any kind is produced. The chemical row exists purely so that (a) the standard smell-loop writes do not crash on an undefined chemical index, (b) the CAOS `chem TARG 184` query works for diagnostic purposes, and (c) modders extending the channel have a pre-allocated bloodstream slot to attach receptors/reactions to.
5. **The channel honours the standard smell-loop architecture but is invisible behaviourally.** Like every other CA-smell chemical, chem 184 is overwritten every sensory tick (every 8 game ticks by default) with the room's live CA-19 value when the creature is inside any room, and decays at the standard "Long" speed (half-life **1241 ticks**, decay rate 0.99944177 — `biochemistry.json:9020`) when the creature is outside any room. The decay is academic: chem 184 is identically zero in stock C3 anyway, so the half-life parameter is purely structural — paying its share of the engine's per-tick decay budget without ever holding any meaningful concentration to decay.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 19** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 19, smellValue)` → `Biochemistry.SetChemical(184, smellValue)`. The unmodified value is written. In stock C3 worlds this value is identically 0.0 because no agent emits CA 19 | Per tick — direct assignment (not additive). Always 0.0 in stock C3 |
| 2 | **No agent emitters in vanilla C3** | — | — | The bootstrap contains zero `emit 19 <rate>` lines across all `Bootstrap/001 World/` and `C3_Bootstrap_V2/` script files. No agent classifier and no installed-script convention writes to CA 19 | None — the channel has no native emitters |
| 3 | **No CA seed in `!map.cos`** | — | — | Unlike the gain/loss/diffusion rate-table entries (which exist for CA 19 in all 16 room types), there is no initial `altr room` seeding of CA 19 anywhere in bootstrap. The field starts at zero and remains there | None |
| 4 | **`CHEM` CAOS injection** | — | — | `chem 184 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick to the local CA-19 value (which is normally 0.0 in stock C3) | Author-defined |
| 5 | **Mod-added emitters** (the intended modder use case) | — | Any custom agent's install script can include `emit 19 <rate>`, or any CAOS script can call `altr room targ 19 <value>` to seed the field | Once a mod injects signal, the standard CA diffusion equation propagates it through the per-room-type rate table — full diffusion 0.80 in air/indoor (0-4), suppressed 0.010 in soil and water (5-9), dead in 10-15 | Author-defined |
| 6 | **Ingestion of agents containing chem 184** | — | — | A `FOOD`/drug agent whose PRAY chemistry lists chem 184 will inject it on bite/eat. Same overwrite caveat — replaced on the next sensory tick by the room's CA-19 value (0.0 in stock C3) | Author-defined |

### Per-room-type diffusion rates (the CA-19 signature)

The 16-room-type rate profile for CA 19, from `!map.cos:1678-1993`:

| Room type | gain | loss | diffusion | Behaviour for CA 19 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Full reception, near-permanent retention, standard diffusion — modder-injected scent propagates normally through outdoor regions |
| 1-4 (indoor / corridor variants) | 0.99 | 0.001 | 0.80 | Same as outdoor — full propagation through machinery shafts, the bridge, the engine room, etc. |
| **5-7 (soil variants)** | **0.40** | **0.001** | **0.010** | **Heavily suppressed.** Reduced gain (40 %) AND drastically reduced diffusion (80× lower than air). Modder-injected scent in a soil room stays localised to that room as a slowly-decaying hot spot — soil pockets are effectively scent-traps for CA 19 |
| **8-9 (water / deep water)** | **0.40** | **0.001** | **0.010** | **Same suppression as soil.** Unlike CA 18 (which uses 0.99/0.80 in water — full propagation), CA 19 explicitly damps its diffusion in water bodies. Water rooms are also CA-19 traps |
| 10-15 (sealed indoor / blocked / cold / barrier) | 0.00 | 0.00 | 0.00 | Standard dead zones — no reception, no decay, no diffusion |

The combined effect — full diffusion in air and indoor regions, near-zero diffusion in soil and water — is unique to CA 19 among all 20 CA channels. Every other smell channel uses 0.80 (or 0.95 for the home-scent channels) uniformly across all non-dead room types. This pattern strongly suggests CA 19 was reserved for a **surface-/air-only signal** — something that propagates through the open atmosphere of the Ark but does not spread underwater or into the soil layer. Plausible authorial intents for the reserved slot include a smoke / fire / alarm channel, a generic "danger" beacon, or an unimplemented player-attention-marker that respects the natural "surface-only" propagation of airborne stimuli.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **No smell-lobe neuron binding** | — (no `cacl` line in vanilla C3) | — | `AgentManager.ourCategoryIdsForSmellIds[19] = -1` — never set by bootstrap. `SensoryFaculty.Update` writes `brain.SetInput("smel", -1, smellValue)` which routes to a sentinel/null neuron and produces no behavioural response | **No effect.** The smell lobe never receives a CA-19 stimulus in vanilla C3 |
| 2 | **No receptor gene** | — | — | `biochemistry.json` contains no receptor row with `"chemical": 184`. No locus reads the chemical | **No biochemical response** to CA-19 levels in the stock genome |
| 3 | **No reaction gene** | — | — | `biochemistry.json` contains no reaction row consuming or producing chem 184 | **No metabolic involvement** |
| 4 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chemical. Irrelevant in practice because chem 184 is overwritten every sensory tick inside rooms anyway, and the value being overwritten is normally 0.0 |
| 5 | **CAOS query for diagnostic / mod purposes** | — | — | `chem TARG 184` returns the current CA-19 value at the creature's location | Useful for mods that inject CA 19 — the chemical is the bloodstream-visible readout of the signal level |
| 6 | **Modder-authored receptor** | — | Any custom receptor gene against chem 184 | Author-defined threshold / gain / locus | Any biochemical response to a mod-introduced CA-19 signal requires a new receptor gene — no inert placeholder exists |
| 7 | **Modder-authored `cacl`** | — | A custom `cacl <family> <genus> <species> 19` line in a custom version of `z_agent smells.cos` | Binds CA 19 to a new agent category for smell-lobe perception | Activates the smell-lobe pathway for a chosen agent category — combined with custom emitters and a custom receptor, a mod can promote CA 19 from "reserved/unused" to a fully-active scent channel |

**The stock genome makes no use of chem 184 whatsoever.** No receptor, no reaction, no emitter, no neuroemitter, no organ references it. The channel is purely engine-allocated infrastructure — a placeholder for future or modder-driven extension.

## Role in Game Mechanics

### The "reserved channel" in a 20-CA grid

The C3 engine declares `CA_PROPERTY_COUNT = 20`, giving the cellular-automata grid 20 independent diffusion fields per room. The `SensoryFaculty.Update` smell loop iterates `for (i=0; i<CA_PROPERTY_COUNT; i++)`, writing the same set of bookkeeping for every channel — biochemistry chemical at index `FIRST_SMELL_CHEMICAL + i = 165 + i`, and smell-lobe neuron at the bound category id. The first 6 channels (0-5) are reserved by the engine's biochemistry constants for the structural sound/light/heat/water/nutrient/secondary-water trio; channels 6-18 carry the explicit semantic roles of food types, machinery, eggs, race scents, home zones, and info gadgets. **Channel 19 is the leftover** — the slot that completes the 20-channel grid but was never assigned a semantic role in the shipping build.

The engineering rationale appears to be reserve-for-extensibility: the bootstrap and genome architecture is fully shipped with 20 chemical rows (165-184), 20 rate-table entries in `!map.cos`, and a 20-iteration sensory loop. Adding a new smell category in a future patch or mod requires no engine recompilation — a modder simply has to (a) add a `cacl <family> <genus> <species> 19` line, (b) emit signal from agents at install time, and (c) optionally author a receptor gene against chem 184. The infrastructure is already in place; only the data is missing.

### Why CA 19 has a non-trivial rate profile

Even though no agent emits CA 19 in stock C3, the channel still has a **carefully-authored rate table** in `!map.cos` — distinct from any other channel. The author of the map script (presumably the same hand that authored the rate tables for channels 0-18) deliberately set:

- **Air and indoor rooms (0-4):** standard 0.99/0.001/0.80 — same as every other smell channel. CA 19 propagates normally through above-ground space.
- **Soil rooms (5-7):** 0.40/0.001/**0.010** — same gain reduction as for many other smell channels, but the diffusion is reduced from the standard 0.80 to a near-zero 0.010. Soil rooms are 80× less permeable to CA 19 spreading than to other smells.
- **Water rooms (8-9):** 0.40/0.001/**0.010** — the same dramatic diffusion suppression. Water bodies are likewise near-impermeable to CA 19.
- **Sealed/blocked/cold/barrier (10-15):** all zero, as for every smell channel.

This profile is **distinct from all 19 other smell channels**. CA 6/7/8 (food) use 0.99/0.80 in air, 0.99/0.80 in water, 0.40/0.80 in soil. CA 10 (machinery) uses 0.99/0.80 in air, 0.99/0.80 in water, 0.40/0.80 in soil. CA 18 (gadgets) uses 0.99/0.80 in air, 0.99/0.80 in water, 0.40/0.80 in soil — except for the type-10 carve-out. **None of them suppress water-and-soil diffusion to 0.010.**

The strongest interpretation of this pattern is that CA 19 was earmarked for a **surface-/air-only stimulus** — a signal whose meaning is "above-ground only" and that should not penetrate or spread through soil pockets or water bodies. Candidate reserved meanings:

- **Smoke / fire alarm.** Smoke disperses through open air but does not penetrate soil or water — the rate profile fits perfectly. A fire-event mod could `emit 19` from burning agents, the smoke-scent would spread through above-ground rooms, creatures could learn an avoidance association, and water/soil rooms would naturally be safe havens (they trap scent in place rather than spreading it). The 0.40 gain in water/soil reflects the residual scent that does cross the boundary, decaying in place.
- **Player-attention beacon.** A "the player is here" signal that the player-pointer agent emits — surface-only because the player typically interacts with above-ground objects. Creatures could learn a "summon" response.
- **Generic alarm / danger beacon.** A "watch out" channel that broadcasts above-ground, leaving water and soil as relative safe zones.
- **Atmospheric scent.** A weather / air-quality / wind-borne particulate channel — spreads with airflow patterns, doesn't penetrate barriers.

None of these were implemented. The rate profile is the only shipping evidence that the channel was conceived for a specific purpose. The actual implementation was either deferred, scoped-out, or saved for a future expansion that did not ship.

### The smell-lobe is missed silently

Inside `SensoryFaculty.Update`, the smell loop on line 280 calls `theAgentManager.GetCategoryIdFromSmellId(i)` for each CA index. For `i=19`, with no `cacl` ever having been issued, this returns `-1` (the standard "no binding" sentinel). The next line writes `brain.SetInput("smel", -1, smellValue)`. The smell lobe has 40 neurons indexed 0-39; the `-1` neuron index lies outside this range, so the brain's `SetInput` either:

- **Silently no-ops.** The brain implementation likely range-checks and discards out-of-range neuron-id requests (this is the safe interpretation).
- **Writes to a sentinel slot.** A pre-allocated "junk drawer" neuron exists at `-1` and accumulates all unbound smell-channel signals into a single combined input — but in stock C3 this would be perpetually zero.

Either way, **CA 19 produces no learning signal in the smell lobe.** Plasticity in the smell-lobe-to-decision pathway never updates from CA 19 stimuli, no neuroemitter response is generated, and no behavioural pull / push is exerted. The brain-side of the channel is completely dormant.

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 184 tracks the world or decays in isolation:

- **Inside any room.** Chem 184 is overwritten every sensory tick with the room's live CA-19 value (which is identically 0.0 everywhere in stock C3). The 1241-tick half-life is moot — the chemical tracks the field directly, and the field is zero.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 184 follows pure first-order decay at rate 0.99944177 per tick. In stock C3 this is also moot — chem 184 was zero before the creature went off-map.

The only context in which the inside/outside distinction becomes observable is if a CAOS script has injected chem 184 directly via `chem 184 <amount>` — in that case, going inside any room overwrites the injection back to 0.0 on the next sensory tick, while staying off-map preserves the injection through ~1241 ticks of half-life decay.

### How CA 19 differs from the other "reserved" smell channels

The other smell channels with no obvious behavioural pathway in stock C3 fall into a few categories:

- **Chems 165, 166, 167, 168, 169, 170 (CA smell 0-5).** These are the "structural" channels — sound, light, heat, water, nutrient, water again. They have engine-driven roles (the room's environmental state writes into them via mechanisms other than `emit`). Behavioural effects via brain-input or via dedicated receptors (CA 0-3 have very specific receptor genes for environmental homeostasis).
- **Chems 175, 176 (CA smell 10, 11).** Machinery and Norn-eggs respectively. Active.
- **Chems 177-179 (Norn / Grendel / Ettin race scents).** Active. 
- **Chem 179 (Ettin race), 180-182 (home channels).** Active emitters and smell-lobe bindings, but chem-side carries no receptor genes — same "no biochemistry pathway, only smell-lobe pathway" pattern.
- **Chem 183 (info gadgets).** Active. Same brain-only pattern.
- **Chem 184 (CA smell 19).** **The only completely unbound smell channel in stock C3** — no smell-lobe binding, no emitters, no receptor. The pure "reserved slot" entry.

CA 19 is therefore unique: it is the single CA index that was allocated, given a rate profile, given a chemical row and a genome speed-class, but never wired up to any agent or any neuron. Every other smell channel either (a) has full active emitter+neuron+chemical wiring, or (b) at least has a smell-lobe neuron and an empty-receptor placeholder. CA 19 has neither.

### What modders can do with CA 19

The channel is a clean canvas for any custom scent system. Steps to activate it:

1. **Bind a smell-lobe neuron (optional but recommended).** Add a `cacl <family> <genus> <species> 19` line to a customised version of `z_agent smells.cos` (or run it from a CAOS console). After this line executes, CA 19 routes to a real smell-lobe neuron, and creatures will be able to learn associations with the channel.
2. **Add emitters.** Either (a) add `emit 19 <rate>` to a custom agent's install script, (b) call `altr room targ 19 <value>` to seed the field at any location, or (c) emit from a moving agent for a "trail" effect. The rate profile means that emissions from soil and water rooms stay localised (the 0.010 diffusion makes them slow-leaking pockets), while emissions from air/indoor rooms propagate normally.
3. **Author receptors.** Add a custom receptor gene against chem 184 to drive any biochemistry response (a curiosity locus, fear locus, alertness boost, drug-response, drive injection) to elevated CA-19 levels.

Plausible mod use-cases:

- **Smoke/fire scent.** A fire-event mod (e.g. a "burning food" agent or an "engine fault" agent) could `emit 19 0.5` while the fire is active. The above-ground spread + soil/water localisation is exactly the realistic propagation pattern for smoke. A "smoke-fear" receptor gene could drive avoidance.
- **Player-attention beacon.** Have the pointer agent emit CA 19 every few ticks, giving creatures a learnt "summon" association with the player's position.
- **Custom alarm channel.** A siren agent (or an angry-creature broadcast) could emit CA 19; receptors in other creatures could trigger alertness, fear, or flight responses.
- **Music / ambient mood scent.** A slow CA-19 emission tied to the playing music track — creatures would experience an elevated CA-19 readout during exciting/scary musical passages, with a custom receptor mapping it to mood chemicals.
- **Pheromone channel for breeders.** A breeder-controlled "interest" chemical that selectively boosts mating drives — CA 19 emissions from "attractive" creatures could elevate sex drive in receptors, opening a new selective-breeding signal.
- **Any unique gameplay-mod scent.** Because CA 19 is completely unbound in stock C3, a mod can claim the channel for any new sensory modality without conflicting with any existing system — a guaranteed-clean signal slot, unlike all the active channels (whose modification risks breaking established creature-to-environment behaviours).

### Practical consequences

- **Chem 184 reads zero everywhere in stock C3.** A vanilla creature inspected via `chem TARG 184` will always show `0.0`, regardless of location, surrounding agents, or activity. The chemical is structurally allocated but functionally inert.
- **Removing the chemical row breaks the engine.** The 20-iteration sensory loop unconditionally writes to chem `FIRST_SMELL_CHEMICAL + 19 = 184` every tick — removing the chemical row from the genome would cause the bloodstream `SetChemical(184, 0.0)` call to either (a) fail silently, (b) crash, or (c) write to an out-of-range chemical index. The row must remain even though it is unused.
- **The rate profile is invisible until activated.** The carefully-authored 0.99/0.40/0.010 per-room-type rates have no observable effect in stock C3 because the input signal is identically zero — diffusion of zero is still zero. The profile becomes visible only when a mod injects signal, at which point the surface-only-spread character of CA 19 emerges.
- **Flooding chem 184 via `chem 184 255` has zero effect in stock C3.** No receptor reads it, the smell-lobe neuron is unbound (the brain input goes to neuron `-1`, which is silently discarded), and the injection is overwritten on the next tick by the room value (0.0). The injection is the most effect-free CAOS chem-injection in vanilla C3 — a perfect "do nothing" command that confirms the chemical exists without disturbing any state.
- **The reserved slot is a stable platform for community mods.** Because vanilla C3 makes no use of CA 19 at all, third-party mods can claim the channel as a private shared signal layer — multiple mods that all emit CA 19 will sum into a combined signal, but as long as the receiving genomes know what to make of it, conflicts with stock behaviour are impossible.
- **No race-scent suppression branch fires.** Like CA 18 (info gadgets), CA 19 is unbound to any creature category in stock C3, so the `neuronId == GetCategoryIdOfAgent(myCreature)` check never succeeds for `i=19`, and no `-MyContribution` subtraction is applied. The chemical (line 278) and the brain neuron (line 288) both receive the same unmodified zero value.
- **Modders activating the channel inherit the surface-only diffusion profile by default.** A naïve mod that issues `emit 19 0.5` from a soil-bound or water-bound agent will produce a localised hot spot rather than a wide-area broadcast, because the per-room-type diffusion is 0.010 in those rooms. To get full-Ark spread, the mod would need to either (a) emit from air/indoor rooms only, or (b) override the rate table via `mapk` / custom `!map.cos` directives.

### Summary

Chemical 184 — CA smell 19 — is the **bloodstream mirror of the engine's reserved 20th cellular-automata channel**, a fully-allocated but unused smell slot in the otherwise-fully-utilised CA 6-18 grid. Vanilla C3 ships with **no `cacl` binding** (no smell-lobe neuron is wired to CA 19), **no agent emitters** (no bootstrap script writes signal into the channel), and **no receptor gene** (no biochemistry locus reads chem 184) — making chem 184 the only "completely dormant" entry in the entire smell-chemical block. The channel does, however, carry a carefully-authored per-room-type rate profile in `!map.cos` that is **unique among smell channels**: full diffusion 0.80 in air and indoor rooms (types 0-4), but a dramatically suppressed diffusion of **0.010** in both soil (types 5-7) and water (types 8-9) — an 80× reduction that effectively traps any CA-19 signal in those room types as slow-decaying localised pockets. This "surface-only" diffusion footprint strongly suggests an unimplemented design intent — most plausibly a smoke / fire / alarm / atmospheric-scent channel that propagates above-ground but does not penetrate or spread underwater or into the soil layer. The 1241-tick half-life, the standard "Long" decay class, and the standard sensory-loop overwrite architecture are all in place; the channel is fully functional from the engine's perspective and merely awaits data. As such, CA 19 is the **cleanest extension point in the entire C3 smell system** — modders can claim the channel for any custom sensory modality (a smoke-fear signal, a player-attention beacon, an alarm channel, a custom pheromone, a breeder's selective-interest signal, an ambient-mood scent) without conflicting with any vanilla-game behaviour, simply by adding a `cacl` line, emit calls in custom agents, and a receptor gene against chem 184. In stock C3 the chemical reads identically `0.0` everywhere, behaves indistinguishably from a static zero, and has no biochemical or behavioural effect of any kind — it is the one entry in the entire bloodstream chemistry that exists purely as engine plumbing and reserved infrastructure, the placeholder for a feature that was conceived in the rate table but never shipped in the data.
