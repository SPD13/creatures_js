# 177 - CA smell 12 (Norn)

Chemical 177 is the thirteenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 12**. The canonical naming table (`biochemistry.json` row 8961) labels it `"CA smell 12 (Norn)"`, and the channel is genuinely dedicated: `z_agent smells.cos:23` wires it to the smell-lobe neuron for agent classifier `(family 4, genus 1, species 0)` — the runtime classifier of every adult Norn creature. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `12`, and writes that float into biochemistry chemical `FIRST_SMELL_CHEMICAL + 12 = 177` (with `FIRST_SMELL_CHEMICAL = 165`).

Unlike CA 11 (eggs), which is seeded by one-shot `emit 11 0.65` pulses at egg creation, **CA 12 is a sustained, per-agent emission**. Norns do not fire a one-off "birth" pulse into the field — instead, every living Norn is configured (via the CAOS `EMIT` command on its own agent handle) to continuously broadcast `0.5` into CA 12 as long as it is alive and inside a room. The field is therefore a real-time density map of where Norns *currently* are, not a trail of where they have been. The bootstrap wires this up at creature creation time: the hatch path in `creatureBreeding.cos:135-142` and the splicer path in `Genetic splicer panel2.cos:293-301` both run

```
setv va91 11
addv va91 gnus
emit va91 0.5
```

immediately after `new: crea 4 …`. With `gnus = 1` for a Norn, `va91 = 12`, so each new Norn calls `emit 12 0.5` on itself and becomes a continuous CA 12 emitter. Grendels (gnus 2) end up on CA 13 and Ettins (gnus 3) on CA 14 by the same formula — the genus-offset trick lets one code path configure the scent of all three races consistently.

Four key properties characterise chem 177:

1. **The channel is bound to adult Norns via CACL.** `z_agent smells.cos:23` contains the single line `cacl 4 1 0 12`. This registers in `AgentManager.ourCategoryIdsForSmellIds[12]` the smell-lobe neuron ID corresponding to the `(family=4, genus=1, species=0)` agent category — i.e. any Norn (species 0 acts as a wildcard at the classifier level so all Norn species collapse onto the same neuron). Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 12 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron — but see property 3 for the self-contribution subtraction.
2. **Norns continuously emit CA 12 at 0.5.** The CAOS `EMIT` command invokes `Agent.SetEmission(caIndex, value)` (the emission setup routine), which stores `myCAIndex=12` and `myCAIncrease=0.5` on the creature's agent. Because CA 12 is non-navigable, `Agent.HandleCA` (the per-agent CA-handling routine) takes the non-nav branch: on each CA tick whose turn is `myCAIndex` (`map.GetCAIndex() == 12`), the Norn calls `map.IncreaseCAInput(roomID, 0.5)`, adding 0.5 to the current room's `caInput` accumulator. During `Map.UpdateCurrentCAProperty` (the room CA update routine), this `caInput` is fed into `UpdateRoomCA` as the fresh emission term for the room and then zeroed. A single Norn in an indoor room therefore contributes 0.5 of "fresh Norn scent" per CA-12 cycle; two Norns in the same room contribute 1.0, etc. The emission is automatic and updates as the Norn moves between rooms (the agent's room-change bookkeeping handles this).
3. **The `-MyContribution` subtraction suppresses self-smell at the brain, but not at the chemical.** Because CA 12 is bound to the creature's *own* category on a Norn, `SensoryFaculty.Update` (the sensory update routine) detects `neuronId == GetCategoryIdOfAgent(myCreature)` and calls `GetRoomPropertyMinusMyContribution` for the *brain* input. This subtracts `caMultiplier * agent.GetCAIncrease() = 10 × 0.5 = 5.0` from the room's CA 12 value and renormalises via `1 − 1/(v+1)` before feeding the smell neuron — so a lone Norn smells "no other Norns" even though its own emission dominates the room. The *chemical* on line 278, however, is always written with the unmodified room value, meaning chem 177 on a Norn still reflects its own contribution.
4. **Chem 177 has a receptor gene, but at an unconnected locus.** `biochemistry.json` receptor row 129 (gene 131, `Baby` switch-on) reads chem 177 at threshold 214, nominal 209, gain 56 into **organ 3 "Reaction", tissue 0, locus 0**. This is a "Reaction" pseudo-organ receptor with `locusName: "Locus 0"` — i.e. an unnamed locus that produces no standard side-effect in the standard genome. An identical pattern exists for chem 178 (Grendel smell, receptor 130). The receptor is therefore effectively inert in vanilla C3, but it confirms the genome authors *intended* each race-smell chemical to be a biochemistry-visible signal that breeders could wire up to drives or emotions via locus edits. The only behaviourally-active pathway in the stock game runs through the smell-lobe neuron.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 12** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 12, smellValue)` → `Biochemistry.SetChemical(177, smellValue)`. The unmodified value is written — no `-MyContribution` adjustment on the chemical side | Per tick — direct assignment (not additive) |
| 2 | **Continuous per-Norn emission** (primary source of the field) | — | All living Norn agents via `Agent.SetEmission(12, 0.5)` | Triggered at creature birth: `creatureBreeding.cos:141-142` (egg hatch) and `Genetic splicer panel2.cos:299-301` (spliced creature) run `setv va91 11 / addv va91 gnus / emit va91 0.5`; for gnus=1 (Norn) this is `emit 12 0.5`. Thereafter `Agent.HandleCA` adds `0.5` to `room.caInput` every time `map.GetCAIndex() == 12` is scheduled | 0.5 per CA-12 cycle, per Norn, per occupied room |
| 3 | **Moving Norns re-emit in their new room** | — | `Agent.HandleCA` non-navigable branch | Each time the CA scheduler reaches index 12, every Norn whose agent has `myCAIndex==12` increments its current room's `caInput` by 0.5. Room transitions are handled transparently: the emission follows the Norn wherever it walks | Same 0.5 per cycle; automatically re-routed on room change |
| 4 | **`CHEM` CAOS injection** | — | — | `chem 177 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 12 value) | Author-defined |
| 5 | **Ingestion of agents containing chem 177** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table lists chem 177 will inject it on bite/eat. Same overwrite caveat as (4) | Author-defined |
| 6 | **Mod-added `emit 12` or `altr room targ 12`** | — | — | Any add-on agent can seed CA 12. In particular, a gadget that issues `emit 12 <x>` on itself would continuously contribute to the Norn field — typically used for decoys or training aids that make a location "smell Norny" | Author-defined |

### Emitters in the standard bootstrap — living Norns only

A full-text scan of `Rebuild/Assets/Bootstrap/` for `emit 12` returns **zero direct occurrences**. The channel is populated exclusively by the indirect `emit va91 0.5` pattern after `new: crea 4`, which resolves to `emit 12 0.5` only when the new creature's genus is 1 (Norn). The three spawn sites are:

- **Egg-hatch via breeding script** (`creatureBreeding.cos:135-142`): after the egg produces a baby via `new: crea 4 targ 1 ov01 0`, the formula `setv va91 11 / addv va91 gnus / emit va91 0.5` is run on the newborn. This is the dominant source of CA 12 emitters in a populated world — every Norn hatched from a normal egg is wired in here.
- **Aged-egg fallback** (`creatureBreeding.cos:253-266`): a second, timer-driven path spawns a creature from an unhatched egg that has sat too long. Note that this branch only issues `emit 13` (Grendel) or `emit 14` (Ettin) — **Norns hatched from this fallback never receive the `emit 12 0.5` call**, a small inconsistency in the vanilla bootstrap that would leave such Norns scent-invisible to other creatures. In practice, almost all Norns hatch via the primary path.
- **Genetic splicer spawn** (`Genetic splicer panel2.cos:293-301`): the splicer panel produces hybrid creatures via `new: crea 4 pntr 1 va66 0` and then runs the same `emit va91 0.5` formula. Spliced Norns therefore emit on CA 12 normally.

No bootstrap agent other than Norns themselves emits CA 12. There is no periodic `altr room targ 12`, no scent-emitter gadget keyed to this channel, and no ambient environmental source. **The CA 12 field is a direct function of Norn population and distribution** — when there are no Norns in the world (or all are outside any room), CA 12 drains to zero everywhere.

### Per-room-type diffusion rates

The 16-room-type rate profile for CA 12, from `!map.cos`, is identical to the other creature-smell channels (CA 13 Grendel, CA 14 Ettin) and to the food/eggs scents:

| Room type | gain | loss | diffusion | Behaviour for CA 12 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion — Norn scent fills outdoor spaces readily |
| 1-4 (various indoor/tunnel) | 0.99 | 0.001 | 0.80 | Same — passes freely through corridors and indoor rooms |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (40 %) — soil absorbs Norn scent less readily |
| 8 (water) | 0.99 | 0.001 | 0.80 | Full reception in water |
| 9 (deep water) | 0.99 | 0.001 | 0.80 | Full reception |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

The 0.001 per-tick loss means the channel has a long memory: a Norn that briefly steps into a room and then leaves can leave a detectable residue for roughly a thousand ticks (~33 s game-time at 30 TPS) before the field decays out. During the Norn's stay, the continuous 0.5-per-cycle emission builds the field up to an equilibrium set by gain/loss/diffusion — typically saturating near 1.0 in the Norn's own room and trailing off through adjacent connected rooms via the 0.80 diffusion.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (primary behavioural pathway) | — (CAOS-bound, not gene-bound) | `cacl 4 1 0 12` in `z_agent smells.cos:23` | `SensoryFaculty.Update` pushes the room's CA 12 value into `brain.SetInput("smel", neuronId, smellValue)` for the Norn smell neuron. **For Norns specifically**, line 284 detects `neuronId == myCategoryId` and first calls `GetRoomPropertyMinusMyContribution` to subtract the creature's own 0.5 emission (×10 caMultiplier) and renormalise — so a Norn's own presence does not mask other Norn scent | Creatures learn to associate "Norn smell" with the emotional and reward context of encounters with other Norns. Grendels and Ettins receive the unmodified CA 12 value and can learn to react to Norns as prey/rivals/allies, while Norns receive the "other Norns" signal with self-contribution filtered out |
| 2 | **Somatic receptor on chem 177** (biochemistry, inert in stock genome) | Gene 131 (`biochemistry.json` receptor id 129) | Organ 3 "Reaction", tissue 0 Somatic, locus 0 | threshold 214/255 ≈ 0.84, nominal 209/255 ≈ 0.82, gain 56 | The receptor is expressed from age 0 (`Baby` switch-on) and would fire only when the room is saturated with Norn scent (value above ~0.84). Because the locus is `Locus 0` on the "Reaction" pseudo-organ, there is no standard biochemical effect wired up — the receptor exists structurally but does not drive any chemical emission or locus modulation in vanilla C3. It is an extension hook |
| 3 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 177 is overwritten every sensory tick inside rooms anyway |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 177 | Threshold / gain / locus author-defined | A breeder can attach chem 177 to any biochemistry locus — e.g. a drive modulator, an emotion, or a chemical that releases on Norn proximity. This is the natural path for making Norns biochemically respond to being near kin |

**The dominant behavioural pathway from chem 177 is the smell-lobe neuron for family 4/1/0 (Norn adults).** The `biochemistry.json`-declared receptor on organ "Reaction" locus 0 exists but is behaviourally inert in the stock genome; the chemical is otherwise untouched by standard reactions, emitters, neuroemitters, or organs.

## Role in Game Mechanics

### The Norn-smell category

In the Creatures 3 agent classifier, family 4 is the "creature" family and its three genera correspond to the three playable races: genus 1 = Norn, genus 2 = Grendel, genus 3 = Ettin. Each of these adult-creature categories gets its own CA-smell channel (CA 12/13/14, chem 177/178/179) and its own smell-lobe neuron. Together with the eggs channel (CA 11, Norn-egg specific) this forms a coherent four-channel "who's around" sensory bundle: one for each adult race and one for their offspring.

The species slot in the CACL mapping is `0`, which in the agent classifier acts as a wildcard — the neuron fires for any Norn regardless of their species-level subtype. (Different Norn breeds, produced by genetic variation rather than species reassignment, still all land under family 4 / genus 1 and so all share the same CA 12 neuron.) This is different from CA 11, where species 1 specifically was used to narrow the binding to *Norn* eggs only.

The smell lobe has 40 neurons, each tied to an agent classifier via CACL. The CACL mapping wires CA 12 → the smell-lobe neuron whose category ID corresponds to `(4, 1, 0)` (populated at startup from the CACL commands in `AgentManager.ourCategoryIdsForSmellIds[12]`). Every sensory tick, that neuron's input voltage is set directly to the local CA 12 value (minus self-contribution for Norns).

### Why chem 177 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 177 to drive any physiological response to Norn proximity — e.g. comfort release around kin, oestrogen/testosterone modulation in crowds, a stress chemical when overcrowded. The standard genome expresses the receptor (gene 131) but routes it to an inert locus, so it acts only as a structural placeholder for breeders to override.
2. **CAOS inspection.** A world script can read `chem TARG 177` to query how strongly the creature currently smells other Norns, which is useful for diagnostic gadgets ("is this Norn isolated?"), tutorial/story scripts that want to detect crowds, loneliness monitors, and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so the bloodstream view shows Norn-smell alongside other smells without special-casing lobe inputs.

Note the asymmetry with the brain: the chemical receives the **unmodified** room CA value, while the brain neuron receives the **minus-my-contribution** value on Norns. A CAOS script reading `chem TARG 177` on a Norn therefore sees a saturation that reflects the Norn itself plus any neighbours — to replicate the brain's view the script must subtract the Norn's own contribution manually.

### Per-Norn emission versus per-event pulse — a density field, not a trail

This is the key architectural difference between CA 12 and CA 11:

- **CA 11 (eggs)** is pulse-driven: one `emit 11 0.65` per egg creation, no maintenance. The field decays monotonically and marks "where eggs were recently laid".
- **CA 12 (Norns)** is agent-driven: every living Norn continuously contributes `0.5 × caMultiplier` per CA cycle to its current room. The field is a **live density map** of where Norns are *right now*, with a trailing memory of where they were a few seconds ago (via the 0.001 loss rate).

A Norn walking through a corridor leaves a scent trail that decays over roughly a thousand ticks. A Norn standing still in a room pushes the CA 12 value in that room up to an equilibrium set by the emission/gain/loss balance, then the diffusion pushes that equilibrium outwards into adjacent connected rooms. A pack of Norns in the same room stacks their emissions linearly — CA 12 scales with population density, giving creatures a direct sensory signal for "how many others are here".

Because the emission is attached to the agent, not to the world, **death silently removes the emitter**: when a Norn dies and its agent is destroyed, `HandleCA` stops contributing, the field drains at the loss rate, and the room's Norn-scent fades to reflect only the survivors. This makes CA 12 a faithful real-time census channel.

### The `-MyContribution` renormalisation

For CA indices bound to the creature's *own* category via CACL (CA 12 on a Norn, CA 13 on a Grendel, CA 14 on an Ettin), the SensoryFaculty detects the match and calls `GetRoomPropertyMinusMyContribution` before writing the brain input. The logic is:

```
value = room.caValues[caIndex];
value -= caMultiplier * agent.GetCAIncrease();   // 10 * 0.5 = 5.0
if (value < 0) value = 0;
else value = 1 - 1/(value + 1);                  // normalise to 0..1
```

This ensures a Norn does not perceive itself as "a Norn is here" — the neuron only fires in response to *other* Norns' contributions. Because the raw CA value can reach saturation at 1.0 while the self-contribution in caMultiplier units is 5.0, the subtraction can easily drive the value negative; the clamp-to-zero ensures the Norn simply reads "no other Norns" when alone.

This subtraction only applies to the brain input on line 288. **The chemical on line 278 is always written with the unmodified value** — so on a solitary Norn, chem 177 can still reach 1.0 (reflecting the Norn's own emission) while the smell-lobe neuron correctly reads 0 ("no other Norns").

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 177 tracks the world or decays in isolation:

- **Inside any room.** Chem 177 is overwritten every sensory tick with the room's live CA 12 value. The 1241-tick half-life is moot — the chemical tracks the field directly and the history is erased on every tick. Importantly, the creature also stops contributing to its previous room's CA 12 in this tick (if it has changed rooms) because `Agent.HandleCA` reroutes the emission on room change.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 177 follows pure first-order decay at rate 0.99944177 per tick. A creature that took a strong hit of Norn-smell just before falling will retain residual chem 177 for ~23 s (half-life) before the next room-bound overwrite. The creature also stops emitting CA 12 during this period — `Agent.HandleCA` requires a valid room ID to issue `IncreaseCAInput`.

### The aged-egg fallback gap

Recall that `creatureBreeding.cos` has two hatch paths:

- The primary path (`creatureBreeding.cos:135-142`) uses `emit va91 0.5` with `va91 = 11 + gnus`, so it correctly configures CA 12 emission for Norns.
- The aged-egg fallback (`creatureBreeding.cos:253-266`) hard-codes `doif gnus eq 2 / emit 13 / else / emit 14`. For Norn hatchlings on this path (`gnus = 1`), the `else` branch runs `emit 14 0.5` — configuring the Norn to emit on the *Ettin* CA channel rather than CA 12.

This is a known bootstrap quirk in vanilla C3. In practice the aged-egg path rarely fires (most eggs hatch via the primary timer), and a mis-emitting Norn would still be visually and behaviourally a Norn — only its scent signature would be confused with an Ettin's, potentially causing subtle mis-learning in nearby creatures. Modders fixing scent semantics in the bootstrap typically replace the else branch with the `setv va91 11 / addv va91 gnus / emit va91 0.5` formula to match the primary path.

### What modders can do with CA 12

The channel is fully active and extensible in several directions:

- **Activate the inert receptor.** Re-wiring gene 131 from "Reaction / Locus 0" to a real locus (e.g. a drive modulator like `BoredomDecrease`, a chemical emitter for a "comfort-near-kin" signal, or a stress chemical for overcrowding) turns chem 177 into a first-class biochemistry input without touching the brain.
- **Change emission intensity.** Editing the `0.5` in the three `emit va91 0.5` lines globally rescales Norn-scent intensity. Raising it makes Norns more visible to each other's smell lobes; lowering it creates a stealthier species profile.
- **Collapse or segregate races.** Adding `cacl 4 1 0 13` alongside `cacl 4 2 0 13` would make Grendels unable to distinguish their own scent from Norns via the smell lobe. Conversely, adding per-species CACL lines (e.g. `cacl 4 1 1 <new CA>` for a particular Norn species) and re-targeting the emission via modified genus arithmetic lets breeders produce sub-races with distinct scents.
- **Seed artificial sources.** A CAOS gadget running `emit 12 <rate>` on itself becomes a "Norn scent beacon" without any actual Norn being present — useful for luring real Norns via their smell-lobe associations, or for testing brain wiring without breeding a full population.
- **Monitor with CAOS.** `outs "norn smell = " outv chem TARG 177` in a debug gadget inspects live Norn-scent levels on a creature, making it easy to verify crowd dynamics, isolation, or migration patterns.

### Practical consequences

- **Chem 177 is a live population density signal.** Its value at any moment reflects how many Norns are currently in or adjacent to the reader's room, weighted by diffusion and decay. Unlike CA 11 (eggs), it is not event-driven — it tracks the state of the living Norn population in real time.
- **Norns experience "other Norns" with self filtered out.** Thanks to `GetRoomPropertyMinusMyContribution` on the brain path, a Norn's smell lobe correctly distinguishes "I am alone" (value 0) from "I am with other Norns" (value > 0). This is the sensory basis for crowding, loneliness, and kin-recognition behaviours the brain can learn.
- **Grendels and Ettins see the full Norn scent.** Cross-species perception is not filtered — a Grendel or Ettin reads the unmodified CA 12 value (including any Norns emitting nearby). This makes CA 12 a useful prey/rival/peer signal in mixed communities, and is symmetric with how Norns perceive CA 13 (Grendel) and CA 14 (Ettin).
- **Flooding chem 177 via `chem 177 255` has no biochemical effect in stock C3.** The only expressed receptor routes to an inert locus. The smell-lobe neuron does not update either because the sensory loop only writes on room-lookup (not on chem-set), so a manual injection is simply overwritten on the next tick by the room value.
- **Removing the CACL line blinds the brain but leaves the chemical.** A modder who removes `cacl 4 1 0 12` disconnects the Norn smell-lobe neuron but still has chem 177 tracking CA 12; the channel becomes purely biochemical (and therefore invisible to the creature's behaviour unless the receptor is also rewired).
- **Dead Norns stop contributing immediately.** When a Norn dies and its agent is destroyed, the `stateStableSettings` loop no longer calls `IncreaseCAInput` for that agent — the scent stops accumulating and drains from the field over ~1000 ticks. Corpses and pick-up-and-carry interactions with dead Norns do not re-add to CA 12.

### Summary

Chemical 177 — CA smell 12 (Norn) — is the bloodstream mirror of the **Norn-adult scent channel** in the Creatures 3 map CA system. Unlike the pulse-driven food and eggs scents, CA 12 is powered by a **continuous per-agent emission**: every Norn calls `emit 12 0.5` on itself at birth (`creatureBreeding.cos:135-142` and `Genetic splicer panel2.cos:293-301` via the `setv va91 11 / addv va91 gnus / emit va91 0.5` idiom) and thereafter continuously contributes to its current room's CA 12 field via `Agent.HandleCA` on every CA-12 cycle. The channel is bound to the smell lobe via `cacl 4 1 0 12` in `z_agent smells.cos`, with the `-MyContribution` branch suppressing self-perception in Norns' own smell-lobe neuron but not in the chemical copy. Propagation uses the standard creature/food rate profile (gain 0.99, loss 0.001, diffusion 0.80 in air/indoor/water; 0.40 in soil; 0 in blocked/cold rooms). The chemical has a single vestigial receptor (gene 131 → "Reaction / Locus 0") that is structurally expressed but behaviourally inert in the stock genome, making it a natural extension hook for breeders; no reactions, emitters, neuroemitters, or standard-organ genes reference chem 177. The practical result is a real-time population-density signal that Norns, Grendels, and Ettins can all sense via their smell lobes — the sensory substrate for crowding, kin-recognition, migration, and cross-species awareness.
