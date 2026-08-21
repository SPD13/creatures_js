# 165 - CA smell 0 (sound)

Chemical 165 is the first of the **twenty "CA smell" chemicals** (chem 165 … chem 184) that act as the creature's *internal copy* of the environment's cellular-automata channels. Each room in the map carries `CA_PROPERTY_COUNT = 20` scalar values (the "CA properties") that diffuse between rooms through doors; every SensoryFaculty tick the creature looks up its own room, reads CA property `i`, and writes that float directly into biochem chemical `FIRST_SMELL_CHEMICAL + i` (= 165 + i). Chem 165 is therefore the bloodstream mirror of **CA index 0**, which the engine's canonical naming table labels `"sound"` (`CASystem.js:31-36`, matching the original `ChemicalNames.catalogue`).

Despite its name, CA 0 is **not the audio/sound-effects channel** — agent sound playback (`SNDE`, `SNDL`, etc.) goes through the audio subsystem, not the CA grid. CA 0 is a *propagation channel* that happens to be historically tagged "sound" because in the Creatures 2/3 design it was reserved for environmental acoustic-like emissions (things that spread across rooms without being attached to a specific agent family). In the standard C3 bootstrap it has well-defined room rates but **no agent classifier is assigned to it, and no gene in the standard genome reads chemical 165** — it is a *fully reserved* CA channel, wired into the map simulation and the sensory pipeline but otherwise a blank slate for authors and breeders to hook into.

The chemical therefore has the most minimal functional footprint of any biochem chemical in the genome:
- **No emitter gene** writes it (it is written directly by `SensoryFaculty::Update`, not via `Organ::Update`).
- **No receptor gene** reads it (no `CreatureReceptorLocusIDs` locus points at chem 165).
- **No reaction** produces or consumes it.
- **No brain neuron** is wired to it via a receptor.

Its only guaranteed runtime behaviours are: (a) being overwritten each tick with the current room's CA 0 value while the creature stands inside any valid room, and (b) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms (the `GetRoomIDForPoint` guard fails, so the SetChemical overwrite is skipped and only the normal chemical decay runs).

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 0** | — (hard-coded in engine) | `SensoryFaculty::Update` | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 0, smellValue)` → `Biochemistry::SetChemical(165, smellValue)` | Per tick — direct assignment (not additive), so the value tracks the local room's CA 0 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 165 <amount>` writes directly to the biochemistry. Effect is overwritten on the next sensory tick if the creature is inside a room, so it is only persistent when the creature is roomless | Author-defined |
| 3 | **Ingestion of agents containing chem 165** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 165 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

The room-side value that feeds source (1) is itself produced by two mechanisms:
- **Agent emissions via `EMIT`**: any agent that called `EMIT 0 <rate>` continuously adds to CA 0 of the room it currently occupies.
- **`ALTR` CAOS command**: one-shot increase of CA 0 on a specific room (allowed because CA 0 is **not** in the navigable set `{6,7,8,10-18}`).

From there CA 0 diffuses between rooms every two game ticks through the standard tick-based CA update (two-phase algorithm in `CASystem`), governed per room type by the `rate <roomType> 0 <gain> <loss> <diffusion>` entries in `!map.cos`. The default bootstrap configures CA 0 as a **wide-propagation, zero-loss** channel in some room types and an **inert** channel in others:

| Room type | gain | loss | diffusion | Behaviour for CA 0 |
|-----------|------|------|-----------|--------------------|
| 0, 2, 5, 6, 7, 8 | 1.0 | 0.0 | 1.0 | Full reception, no decay, full spread to neighbours — CA 0 flows freely |
| 1, 3, 4, 9–15 | 0.0 | 0.0 | 0.0 | Dead channel — emissions are rejected and do not propagate |

This pattern (free propagation in the "open / airy" room types, hard block in others) is consistent with the channel's historical "sound" semantics: air-filled rooms carry it, water / walls / sealed rooms do not.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails the SensoryFaculty overwrite is skipped, so the chemical simply decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 2 | **Smell-lobe neuron write** (catalytic — reads CA 0, not chem 165) | — (hard-coded) | `brain->SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager::GetCategoryIdFromSmellId(0)` | The smell lobe has 40 neurons (`brain-architecture.json` lobe index 14). For CA index `i` the brain neuron is chosen by the classifier-to-CA mapping set via the `CACL` CAOS command | In the default bootstrap (`z_agent smells.cos`) **no `cacl … 0` line exists**, so `ourCategoryIdsForSmellIds[0]` stays at its initialised `-1` value. `SetInput("smel", -1, …)` is a no-op / out-of-range write, so the sound channel produces no smell-lobe activation by default |
| 3 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 165 | Threshold / gain / locus author-defined | Breeders / genome hackers can add receptors that read chem 165 (e.g. to make a creature "hear"-like flinch when local CA 0 rises). None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter touches chemical 165 in the standard C3 genome.** Searching `biochemistry.json` for references to chemical id 165 returns only the `decays` entry (the half-life table) and coincidental uses of `165` as a different field (`geneId: 165` on gene 59, `threshold: 165` on the Life receptor, and `id: 165` as a gene index) — none of which refer to the chemical itself.

## Role in Game Mechanics

### The 20-channel CA → biochem → smel-lobe pipeline

The block of chemicals 165-184 is not really 20 independent chemicals — it is one mechanism repeated twenty times. The loop in `SensoryFaculty::Update` is:

```
for i in 0..19:
    smellValue = map.GetRoomProperty(creatureRoom, i)
    biochem.SetChemical(165 + i, smellValue)                       // bloodstream mirror
    neuronId = AgentManager.GetCategoryIdFromSmellId(i)            // classifier lookup
    if neuronId == GetCategoryIdOfAgent(creature):                 // own-species filter
        smellValue = GetRoomPropertyMinusMyContribution(creature, smellValue)
    brain.SetInput("smel", neuronId, smellValue)                   // smell lobe write
```

So each CA channel has **three** parallel observable effects each tick:

1. **The room's CA grid** retains the value (for future diffusion and the map debugger).
2. **The creature's bloodstream** gets chem `165+i` set to the local value (a CAOS-queryable sensor — `chem TARG 165` tells a script "what is the sound level where I am standing").
3. **The creature's smell lobe** gets neuron `classifier(i)` set (the brain pathway used for navigation and concept formation).

The trick is that the *biochem* pathway is always populated (all 20 chemicals get written, whether or not the CA has a classifier assigned), but the *brain* pathway is only populated for CAs that have been bound to an agent category via `CACL`. That is why CA 0 has a biochem mirror (chem 165) *even though no creature actually "smells" it at the brain level in the default genome* — the biochem channel is always-on and available for any receptor that wants it, independent of whether the cognitive pathway is wired.

### Why CA 0 is a "reserved blank"

The bootstrap file `z_agent smells.cos` (`Rebuild/Assets/Bootstrap/001 World/z_agent smells.cos`) sets up all of the **active** smell assignments — plants on CA 6/7/8, machinery on CA 10, Norns/Grendels/Ettins on CA 12/13/14, homes on CA 15/16/17, etc. It deliberately does **not** assign CA 0. Combined with the absence of any gene reading chem 165, this means CA 0 functions as a **reserved CA channel** with three distinct uses:

1. **Author / agent-script channel.** An author can `EMIT 0 <rate>` from a custom agent to broadcast a "sound-like" plume through any connected air-type rooms, and then sample it on other agents via `PROP <roomID> 0`. Because CA 0's room rates are already configured (wide propagation in room types 0/2/5–8, blocked in others), emissions propagate realistically without further setup. No creatures will react to it, so it cannot accidentally corrupt the trained genome — it is a *safe* channel for scripted world events.
2. **Genome-modding anchor point.** Breeders building custom genomes can add a receptor against chem 165 to give their creatures a "hearing" sense at no cost to the existing smell wiring: none of the standard receptors / reactions / emitters touch chem 165, so adding one cannot collide with established chemistry. The 1241-tick decay is long enough that a receptor with a short integration window sees a signal tracking live room CA 0; a receptor with a long window sees a value that persists for ~40 s after the creature leaves the emitting area (if the creature is then roomless).
3. **Map-debug channel.** Because CA 0 is the first entry in the CA array and has distinctive room-type rates in the bootstrap, it is often used as a test channel in the map debugger (`MapDebuggerModule.js`) when validating CA diffusion behaviour.

### Inside-room vs outside-room behaviour

The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check is the single line that decides whether the creature's chem 165 tracks the world or decays on its own:

- **Inside any room.** Chem 165 is overwritten every sensory tick with the room's live CA 0 value. The 1241-tick half-life is moot. A creature standing next to a CA-0 emitter sees chem 165 rise immediately; walking out of a propagating room (type 1/3/4/9+) where CA 0 is blocked, chem 165 drops to the destination room's (possibly zero) value on the next tick.
- **Outside all rooms** (e.g. mid-air during a fall with no room below the down-foot position, or in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 165 follows pure first-order decay at rate 0.99944177 per tick. A creature that briefly leaves all rooms with chem 165 = 1.0 will still have ~0.5 after 1241 ticks, ~0.25 after 2482 ticks, and so on.

This two-regime behaviour is identical for all 20 CA-smell chemicals (165-184); it is the unified property of the `FIRST_SMELL_CHEMICAL` block, not specific to CA 0.

### The `-MyContribution` subtraction and why CA 0 skips it

For CA indices that *are* bound to the creature's own category (e.g. a Norn looking at CA 12 = Norn smell), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. This prevents a Norn from "smelling itself" in the brain and mistakenly perceiving the Norn-smell concept as present wherever it goes. For CA 0 this branch is never taken (CA 0 is not the Norn / Grendel / Ettin channel), so whatever value is in the room — including the creature's own `EMIT 0` contribution if any — is what flows into both chem 165 and (if a cacl were added) the smell lobe. This is a minor subtlety but worth noting for authors who scripting creature-driven CA 0 emissions: creatures *do* smell their own CA 0 output.

### Practical consequences

- **`chem TARG 165` is a live ambient-CA-0 sensor.** A CAOS script querying chem 165 on a creature reads the current room's CA 0 value (with one-tick lag). This is the standard way to sample the sound channel from creature scripts without calling `PROP`.
- **Flooding chem 165 via `chem 165 255` has no behavioural effect on a standard creature.** No receptor reads it, no reaction consumes it, and the SensoryFaculty overwrites it on the next tick if the creature is in a room. The stim-chemical offset (`STIMTOBIOCHEMOFFSET = 148`) maps chem 165 to stim chemical 17, but no stim gene in the standard genome targets stim chemical 17 either.
- **CA 0 is the preferred "environmental event" channel for custom content.** World-wide events (a ringing bell, a storm warning, a custom predator alarm) can be broadcast through CA 0 without risk of overlapping with the trained smell semantics on CAs 6-17. Authors pair `EMIT 0 <rate>` on the emitting agent with `PROP <rid> 0` on listener agents to build a room-graph-aware event bus. Creatures are oblivious to it by default but can be made responsive with a single custom receptor gene.
- **Breeding out the sensory pathway is not possible.** Because the per-tick SetChemical is engine-hard-coded (not a gene), no genetic mutation can stop chem 165 from tracking room CA 0. The only way to make chem 165 "do nothing" is to leave no receptor hooked to it — which is already the default state.
- **Room-type zeros are real zeros, not "unspecified".** In room types where the bootstrap sets `rate … 0 0.0 0.0 0.0`, any `EMIT 0` into that room has its `rates.GetGain()` factor multiplied in as zero by `AlterCAEmission`, so nothing is added. CA 0 cannot be "forced" into a blocking room without also rewriting the rate table. This is the intended design: the blocking room types model "acoustically dead" environments.

### Summary

CA smell 0 (sound) is the bloodstream mirror of map CA index 0, the first of the twenty environmental CA channels:

```
  Map room CA[0] (updated by EMIT/ALTR, diffused by CA tick)
         │
         │  SensoryFaculty.Update() every tick
         ▼
  chem 165 (bloodstream) ──► receptors?  → NONE in default genome
                          ──► reactions? → NONE in default genome

  (Parallel path, same loop)
         │
         ▼
  brain "smel" neuron AgentManager.GetCategoryIdFromSmellId(0)
         → -1 by default (no cacl for CA 0)
         → effectively a no-op until an author runs `cacl ... 0`
```

It is the chemistry-engine's bookkeeping entry for the *sound* CA channel: always populated, never consumed, and deliberately left unwired at the genome level so that authors, agents, and genome-modders can claim it for world-level acoustic-style broadcasts or bespoke "hearing" senses without colliding with the trained smell chemistry on channels 6-17. In a default, unmodified world running a default genome, chem 165 is a **quiet observer** — faithfully copying the room's CA 0 every tick but producing no behaviour whatsoever. Its value becomes meaningful only when something is deliberately wired to produce it (`EMIT 0` on a custom agent, `ALTR <rid> 0`) or to consume it (a custom receptor gene, a script reading `chem TARG 165`).
