# 179 - CA smell 14 (Ettin)

Chemical 179 is the fifteenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 14**. The canonical naming table (`biochemistry.json` row 8977) labels it `"CA smell 14 (Ettin)"`, and the channel is genuinely dedicated: `z_agent smells.cos:25` wires it to the smell-lobe neuron for agent classifier `(family 4, genus 3, species 0)` — the runtime classifier of every adult Ettin creature. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `14`, and writes that float into biochemistry chemical `FIRST_SMELL_CHEMICAL + 14 = 179` (with `FIRST_SMELL_CHEMICAL = 165`).

CA 14 completes the three-channel race-scent triad — CA 12 (Norn), CA 13 (Grendel), CA 14 (Ettin) — and shares their **sustained, per-agent emission** architecture. Ettins do not fire one-off pulses into the field; every living Ettin is configured (via the CAOS `EMIT` command on its own agent handle) to continuously broadcast `0.5` into CA 14 as long as it is alive and inside a room. The field is therefore a real-time density map of where Ettins *currently* are, not a trail of where they have been. The bootstrap wires this up at creature creation time: the hatch path in `creatureBreeding.cos:140-142` and the splicer path in `Genetic splicer panel2.cos:293-301` both run

```
setv va91 11
addv va91 gnus
emit va91 0.5
```

immediately after `new: crea 4 …`. With `gnus = 3` for an Ettin, `va91 = 14`, so each new Ettin calls `emit 14 0.5` on itself and becomes a continuous CA 14 emitter. Norns (gnus 1) end up on CA 12 and Grendels (gnus 2) on CA 13 by the same formula — the genus-offset trick lets one code path configure the scent of all three races consistently.

Four key properties characterise chem 179:

1. **The channel is bound to adult Ettins via CACL.** `z_agent smells.cos:25` contains the single line `cacl 4 3 0 14`. This registers in `AgentManager.ourCategoryIdsForSmellIds[14]` the smell-lobe neuron ID corresponding to the `(family=4, genus=3, species=0)` agent category — i.e. any Ettin (species 0 acts as a wildcard at the classifier level so all Ettin species collapse onto the same neuron). Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 14 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron — but see property 3 for the self-contribution subtraction that Ettins receive on their own channel.
2. **Ettins continuously emit CA 14 at 0.5.** The CAOS `EMIT` command invokes `Agent.SetEmission(caIndex, value)` (the emission setup routine), which stores `myCAIndex=14` and `myCAIncrease=0.5` on the creature's agent. Because CA 14 is non-navigable, `Agent.HandleCA` (the per-agent CA-handling routine) takes the non-nav branch: on each CA tick whose turn is `myCAIndex` (`map.GetCAIndex() == 14`), the Ettin calls `map.IncreaseCAInput(roomID, 0.5)`, adding 0.5 to the current room's `caInput` accumulator. During `Map.UpdateCurrentCAProperty` (the room CA update routine), this `caInput` is fed into `UpdateRoomCA` as the fresh emission term for the room and then zeroed. A single Ettin in a room therefore contributes 0.5 of "fresh Ettin scent" per CA-14 cycle; two Ettins in the same room contribute 1.0, etc. The emission is automatic and updates as the Ettin moves between rooms (the agent's room-change bookkeeping handles this).
3. **The `-MyContribution` subtraction suppresses self-smell at the Ettin's brain, but not at the chemical.** Because CA 14 is bound to the creature's *own* category on an Ettin, `SensoryFaculty.Update` (the sensory update routine) detects `neuronId == GetCategoryIdOfAgent(myCreature)` and calls `GetRoomPropertyMinusMyContribution` for the *brain* input. This subtracts `caMultiplier * agent.GetCAIncrease() = 10 × 0.5 = 5.0` from the room's CA 14 value and renormalises via `1 − 1/(v+1)` before feeding the smell neuron — so a lone Ettin smells "no other Ettins" even though its own emission dominates the room. The *chemical* on line 278, however, is always written with the unmodified room value, meaning chem 179 on an Ettin still reflects its own contribution. Norns and Grendels reading CA 14 receive the unmodified value (no subtraction) because the neuron is not their own category.
4. **Chem 179 has no receptor at all in the standard genome.** Unlike chem 177 (Norn, receptor row 129, gene 131) and chem 178 (Grendel, receptor row 130, gene 132) — both of which are wired to an inert "Reaction / Locus 0" extension hook — chem 179 is **absent from the entire receptor list** of the standard biochemistry (no row in `biochemistry.json` has `"chemical": 179`). The Ettin race-smell therefore has no biochemistry-visible pathway at all in vanilla C3: the only behaviourally-active route is the smell-lobe neuron. Genome authors apparently considered Ettin-proximity less interesting as a dramatic chemical signal (the core C3 narrative is Norn–Grendel antagonism, not Ettin-centric), so they did not even lay down the structural receptor placeholder they did for the other two races. A breeder who wants a biochemical response to Ettin scent has to author an entirely new receptor gene rather than re-target an existing inert one.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 14** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 14, smellValue)` → `Biochemistry.SetChemical(179, smellValue)`. The unmodified value is written — no `-MyContribution` adjustment on the chemical side | Per tick — direct assignment (not additive) |
| 2 | **Continuous per-Ettin emission** (primary source of the field) | — | All living Ettin agents via `Agent.SetEmission(14, 0.5)` | Triggered at creature birth: `creatureBreeding.cos:140-142` (egg hatch) and `Genetic splicer panel2.cos:299-301` (spliced creature) run `setv va91 11 / addv va91 gnus / emit va91 0.5`; for gnus=3 (Ettin) this is `emit 14 0.5`. Thereafter `Agent.HandleCA` adds `0.5` to `room.caInput` every time `map.GetCAIndex() == 14` is scheduled | 0.5 per CA-14 cycle, per Ettin, per occupied room |
| 3 | **Aged-egg fallback (correctly configures Ettins via the `else` branch)** | — | `Agent.SetEmission(14, 0.5)` via hard-coded branch | `creatureBreeding.cos:262-266` uses `doif gnus eq 2 / emit 13 0.5 / else / emit 14 0.5 / endi`. Because Ettins have `gnus=3`, they fall through to the `else` branch and receive `emit 14 0.5` correctly. (The same `else` mis-routes Norns (gnus=1) onto CA 14 — see the CA smell 12 doc for that bug; Ettins benefit from the same coincidence that harms Norns) | 0.5 per CA-14 cycle |
| 4 | **Moving Ettins re-emit in their new room** | — | `Agent.HandleCA` non-navigable branch | Each time the CA scheduler reaches index 14, every Ettin whose agent has `myCAIndex==14` increments its current room's `caInput` by 0.5. Room transitions are handled transparently: the emission follows the Ettin wherever it walks | Same 0.5 per cycle; automatically re-routed on room change |
| 5 | **`CHEM` CAOS injection** | — | — | `chem 179 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 14 value) | Author-defined |
| 6 | **Ingestion of agents containing chem 179** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table lists chem 179 will inject it on bite/eat. Same overwrite caveat as (5) | Author-defined |
| 7 | **Mod-added `emit 14` or `altr room targ 14`** | — | — | Any add-on agent can seed CA 14. A gadget that issues `emit 14 <x>` on itself would continuously contribute to the Ettin field — typically used for decoys, training aids that make a location "smell Ettinny", or ambient-Ettin simulation in empty worlds | Author-defined |

### The aged-egg-fallback coincidence

A point worth highlighting: the aged-egg fallback at `creatureBreeding.cos:262-266` is a two-branch `doif gnus eq 2 / else / endi` that checks *only* for Grendel. The `else` branch then emits on CA 14 unconditionally. Norns (gnus=1) falling into this branch are therefore mis-routed onto the Ettin channel (a bug documented in `177 - CA smell 12 (Norn).md`). **Ettins happen to be the intended beneficiary of the `else` branch** — they correctly get `emit 14 0.5` by design — but the price paid by the same code is that Norns hatched via the aged-egg path are silently reclassified as Ettin-scented. The uniformity of Ettin scent-configuration across both the normal hatch path and the aged-egg fallback is therefore accidental: the normal path configures all races consistently via the `emit va91` idiom, and the fallback's hard-coded `else` happens to match the Ettin genus number.

No bootstrap agent other than Ettins themselves emits CA 14. There is no periodic `altr room targ 14`, no scent-emitter gadget keyed to this channel, and no ambient environmental source. **The CA 14 field is a direct function of Ettin population and distribution** — when there are no Ettins in the world (or all are outside any room), CA 14 drains to zero everywhere.

### Per-room-type diffusion rates

The 16-room-type rate profile for CA 14, from `!map.cos`, is identical to the other creature-smell channels (CA 12 Norn, CA 13 Grendel) and to the food/eggs scents:

| Room type | gain | loss | diffusion | Behaviour for CA 14 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion — Ettin scent fills outdoor spaces readily |
| 1-4 (various indoor/tunnel) | 0.99 | 0.001 | 0.80 | Same — passes freely through corridors and indoor rooms |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (40 %) — soil absorbs Ettin scent less readily |
| 8 (water) | 0.99 | 0.001 | 0.80 | Full reception in water |
| 9 (deep water) | 0.99 | 0.001 | 0.80 | Full reception |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

The 0.001 per-tick loss means the channel has a long memory: an Ettin that briefly steps into a room and then leaves can leave a detectable residue for roughly a thousand ticks (~33 s game-time at 30 TPS) before the field decays out. During the Ettin's stay, the continuous 0.5-per-cycle emission builds the field up to an equilibrium set by gain/loss/diffusion — typically saturating near 1.0 in the Ettin's own room and trailing off through adjacent connected rooms via the 0.80 diffusion. The soil reduction in room types 5-7 is particularly relevant for C3's underground biomes: Ettins roaming factory-workshop and cave regions leave faster-decaying trails in dirt than in the gardens and corridors above.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (only behavioural pathway in stock C3) | — (CAOS-bound, not gene-bound) | `cacl 4 3 0 14` in `z_agent smells.cos:25` | `SensoryFaculty.Update` pushes the room's CA 14 value into `brain.SetInput("smel", neuronId, smellValue)` for the Ettin smell neuron. **For Ettins specifically**, line 284 detects `neuronId == myCategoryId` and first calls `GetRoomPropertyMinusMyContribution` to subtract the creature's own 0.5 emission (×10 caMultiplier) and renormalise — so an Ettin's own presence does not mask other Ettin scent | Creatures learn to associate "Ettin smell" with the emotional and reward context of encounters with Ettins. Norns typically learn neutral or wary responses, Grendels may learn their territorial relationships, and Ettins learn their own cohabitation/pack dynamics |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 179 is overwritten every sensory tick inside rooms anyway |
| 3 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 179 | Threshold / gain / locus author-defined | A breeder can attach chem 179 to any biochemistry locus — e.g. a stress/caution chemical that spikes on Ettin proximity for Norns, a bonding/comfort chemical for Ettins near kin, or a drive modulator ("curiosity increase" when surrounded by Ettins). **Unlike chem 177 and chem 178, no inert placeholder receptor exists** — breeders must add a receptor gene from scratch rather than repurpose an existing one |

**The only behavioural pathway from chem 179 in the stock genome is the smell-lobe neuron for family 4/3/0 (Ettin adults).** No receptor gene, no reaction, no emitter, no neuroemitter, and no organ references chem 179 in vanilla C3. This makes it the most "brain-only" of the three race-smell chemicals — its biochemistry copy is purely a diagnostic/CAOS-inspection artefact rather than a trigger for any genomic response.

## Role in Game Mechanics

### The Ettin-smell category

In the Creatures 3 agent classifier, family 4 is the "creature" family and its three genera correspond to the three playable races: genus 1 = Norn, genus 2 = Grendel, genus 3 = Ettin. Each of these adult-creature categories gets its own CA-smell channel (CA 12/13/14, chem 177/178/179) and its own smell-lobe neuron. Together with the eggs channel (CA 11, Norn-egg specific) this forms a coherent four-channel "who's around" sensory bundle: one for each adult race and one for Norn offspring.

The species slot in the CACL mapping is `0`, which in the agent classifier acts as a wildcard — the neuron fires for any Ettin regardless of their species-level subtype. Any custom Ettin species (e.g. the mod-added variants) still land under family 4 / genus 3 and so all share the same CA 14 neuron. This is different from CA 11, where species 1 specifically was used to narrow the binding to *Norn* eggs only.

The smell lobe has 40 neurons, each tied to an agent classifier via CACL. The CACL mapping wires CA 14 → the smell-lobe neuron whose category ID corresponds to `(4, 3, 0)` (populated at startup from the CACL commands in `AgentManager.ourCategoryIdsForSmellIds[14]`). Every sensory tick, that neuron's input voltage is set directly to the local CA 14 value (minus self-contribution for Ettins).

### Why chem 179 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 179 to drive any physiological response to Ettin proximity — e.g. a curiosity chemical in Norns around the industrious Ettin race, a bonding chemical in Ettins near their own kind, or drive modulation tied to cross-race encounters. The standard genome does *not* express any receptor at all, so this pathway is entirely latent for breeders to populate.
2. **CAOS inspection.** A world script can read `chem TARG 179` to query how strongly the creature currently smells Ettins, which is useful for diagnostic gadgets ("is this Norn near an Ettin?"), story scripts that trigger on Ettin encounters, work-coordination monitors (Ettins running machinery), and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so the bloodstream view shows Ettin-smell alongside other smells without special-casing lobe inputs.

Note the asymmetry with the brain: the chemical receives the **unmodified** room CA value, while the brain neuron receives the **minus-my-contribution** value on Ettins. A CAOS script reading `chem TARG 179` on an Ettin therefore sees a saturation that reflects the Ettin itself plus any neighbours — to replicate the brain's view the script must subtract the Ettin's own contribution manually. For Norns and Grendels, the chemical and neuron values agree.

### The "inert placeholder" gap on chem 179

A revealing detail about the standard genome's treatment of race-smells: chem 177 (Norn) and chem 178 (Grendel) each have a dedicated receptor gene (gene 131, gene 132) routing to organ "Reaction" tissue 0 locus 0 — an unnamed, inert locus that produces no behavioural effect but exists as a structural hook for breeders to re-target. Chem 179 has **no such receptor at all**. The genome authors made a deliberate choice: they laid down extension hooks for the two races they expected breeders to care about biochemically (the Norn–Grendel dichotomy is the game's central narrative), and omitted the hook for Ettin scent because Ettins occupy a more neutral, less dramatic position in the game's ecology.

Practical consequences for breeders:
- To make a Norn biochemically afraid of Grendels, one re-targets gene 132 (the existing chem 178 receptor) to point at a Fear-increasing locus. This is a **one-gene edit**.
- To make a Norn biochemically interested in Ettins, one must **add an entirely new receptor gene** from scratch: choose an organ, tissue, locus, threshold, nominal, and gain, and insert it into the genome. This is a heavier intervention, typically done via a genome editor rather than a receptor-tweaker tool.
- The asymmetry means CA 14 remains purely a brain-layer signal in vanilla C3 — no biochemistry experiment will ever perturb chem 179 in a way that affects creature behaviour unless the modder first adds a receptor.

### Per-Ettin emission versus per-event pulse — a density field, not a trail

This is the key architectural difference between CA 14 and pulse-driven channels like CA 11 (eggs):

- **CA 11 (eggs)** is pulse-driven: one `emit 11 0.65` per egg creation, no maintenance. The field decays monotonically and marks "where eggs were recently laid".
- **CA 14 (Ettins)** is agent-driven: every living Ettin continuously contributes `0.5 × caMultiplier` per CA cycle to its current room. The field is a **live density map** of where Ettins are *right now*, with a trailing memory of where they were a few seconds ago (via the 0.001 loss rate).

An Ettin walking through a corridor leaves a scent trail that decays over roughly a thousand ticks. An Ettin standing still in a room pushes the CA 14 value in that room up to an equilibrium set by the emission/gain/loss balance, then the diffusion pushes that equilibrium outwards into adjacent connected rooms. A pack of Ettins in the same room stacks their emissions linearly — CA 14 scales with population density, giving creatures a direct sensory signal for "how many Ettins are here".

Because the emission is attached to the agent, not to the world, **death silently removes the emitter**: when an Ettin dies and its agent is destroyed, `HandleCA` stops contributing, the field drains at the loss rate, and the room's Ettin-scent fades to reflect only the survivors. This makes CA 14 a faithful real-time census channel for the Ettin population.

### The `-MyContribution` renormalisation

For CA indices bound to the creature's *own* category via CACL (CA 12 on a Norn, CA 13 on a Grendel, CA 14 on an Ettin), the SensoryFaculty detects the match and calls `GetRoomPropertyMinusMyContribution` before writing the brain input. The logic is:

```
value = room.caValues[caIndex];
value -= caMultiplier * agent.GetCAIncrease();   // 10 * 0.5 = 5.0
if (value < 0) value = 0;
else value = 1 - 1/(value + 1);                  // normalise to 0..1
```

This ensures an Ettin does not perceive itself as "an Ettin is here" — the neuron only fires in response to *other* Ettins' contributions. Because the raw CA value can reach saturation at 1.0 while the self-contribution in caMultiplier units is 5.0, the subtraction can easily drive the value negative; the clamp-to-zero ensures the Ettin simply reads "no other Ettins" when alone.

This subtraction only applies to the brain input on line 288. **The chemical on line 278 is always written with the unmodified value** — so on a solitary Ettin, chem 179 can still reach 1.0 (reflecting the Ettin's own emission) while the smell-lobe neuron correctly reads 0 ("no other Ettins").

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 179 tracks the world or decays in isolation:

- **Inside any room.** Chem 179 is overwritten every sensory tick with the room's live CA 14 value. The 1241-tick half-life is moot — the chemical tracks the field directly and the history is erased on every tick. Importantly, the creature also stops contributing to its previous room's CA 14 in this tick (if it has changed rooms) because `Agent.HandleCA` reroutes the emission on room change.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 179 follows pure first-order decay at rate 0.99944177 per tick. A creature that took a strong hit of Ettin-smell just before falling will retain residual chem 179 for ~23 s (half-life) before the next room-bound overwrite. An Ettin traversing such a gap also stops emitting CA 14 during this period — `Agent.HandleCA` requires a valid room ID to issue `IncreaseCAInput`.

### Ettins in the C3 ecology

Ettins are the industrious, tool-using, machinery-operating race in C3 — less aggressive than Grendels, less pampered than Norns, often found around the factory/workshop rooms and the deeper cave biomes. Their CA 14 field correspondingly tends to concentrate around the mechanical regions of the world: press machinery, steam-valve rooms, workshop corridors. A Norn that enters these regions gets a strong chem 179 reading alongside CA 15+ machinery-smell signals, creating a distinctive sensory signature for "Ettin-worked industrial zones".

For breeders building cross-race ecosystems, chem 179 is the sensory axis on which to build:
- **Ettin-affinity genomes**: receptors that spike comfort/bonding on chem 179 (make a creature happier around Ettins).
- **Ettin-avoidance genomes**: receptors that raise caution/fear on chem 179 (make a creature nervous around Ettin-dominated areas).
- **Race-neutral social genomes**: receptors that sum chem 177 + chem 178 + chem 179 via reactions into a single "any creature nearby" bloodstream signal, giving the creature a race-agnostic social-proximity sense.

### What modders can do with CA 14

The channel is fully active and extensible in several directions:

- **Add a receptor from scratch.** Because chem 179 has no existing receptor gene in the standard genome, any biochemistry response requires authoring a new receptor. Typical targets: a Fear or Boredom locus for Ettin-wariness, a Comfort or Reward locus for Ettin-affinity, or a drive-modulator locus for task-oriented behaviour around Ettin work sites.
- **Change emission intensity.** Editing the `0.5` in the three `emit va91 0.5` lines (plus the aged-egg `else` branch) globally rescales Ettin-scent intensity. Raising it makes Ettins more conspicuous to every other creature's smell lobe; lowering it creates a stealthier Ettin profile.
- **Unify or segregate races.** Adding `cacl 4 3 0 12` alongside `cacl 4 1 0 12` would merge Norns and Ettins onto a single "creature" smell neuron. Conversely, adding per-species CACL lines and re-targeting the emission via modified genus/species arithmetic lets breeders produce sub-races with distinct scents.
- **Seed artificial sources.** A CAOS gadget running `emit 14 <rate>` on itself becomes an "Ettin scent beacon" without any actual Ettin being present — useful for luring real Ettins via their smell-lobe associations, populating work-zones with ambient Ettin-ness for training, or testing brain wiring without breeding a full Ettin population.
- **Monitor with CAOS.** `outs "ettin smell = " outv chem TARG 179` in a debug gadget inspects live Ettin-scent levels on a creature, making it easy to verify cross-race interactions, factory-zone dynamics, or migration patterns.

### Practical consequences

- **Chem 179 is a live Ettin population density signal.** Its value at any moment reflects how many Ettins are currently in or adjacent to the reader's room, weighted by diffusion and decay. Unlike CA 11 (eggs), it is not event-driven — it tracks the state of the living Ettin population in real time.
- **Ettins experience "other Ettins" with self filtered out.** Thanks to `GetRoomPropertyMinusMyContribution` on the brain path, an Ettin's smell lobe correctly distinguishes "I am alone" (value 0) from "I am with other Ettins" (value > 0). This is the sensory basis for pack and cohabitation behaviour within the Ettin race.
- **Norns and Grendels see the full Ettin scent.** Cross-species perception is not filtered — a Norn or Grendel reads the unmodified CA 14 value (including any Ettins emitting nearby). This makes CA 14 a useful neighbour/cohabitant signal for Norns and a rival/peer signal for Grendels, symmetric with how Ettins perceive CA 12 (Norn) and CA 13 (Grendel).
- **Flooding chem 179 via `chem 179 255` has zero effect in stock C3.** No receptor reads it, and the smell-lobe neuron does not update from the chemical side because the sensory loop only writes on room-lookup (not on chem-set). The injection is simply overwritten on the next tick by the room value, with no transient biochemical consequence.
- **Removing the CACL line silences the brain entirely.** A modder who removes `cacl 4 3 0 14` disconnects the Ettin smell-lobe neuron and — because no receptor exists in the stock genome either — leaves chem 179 as a completely inert bloodstream signal. The channel becomes observable only via CAOS inspection.
- **Dead Ettins stop contributing immediately.** When an Ettin dies and its agent is destroyed, the CA scheduler no longer calls `IncreaseCAInput` for that agent — the scent stops accumulating and drains from the field over ~1000 ticks. Corpses and pick-up-and-carry interactions with dead Ettins do not re-add to CA 14.
- **The aged-egg fallback happens to be correct for Ettins.** The `else` branch of `doif gnus eq 2 / emit 13 0.5 / else / emit 14 0.5` correctly assigns Ettins (gnus=3) to CA 14 — but the same `else` also mis-routes Norns (gnus=1) to CA 14, giving Ettins a coincidental share of "Norn fallback scent" in rare aged-egg scenarios. See the CA smell 12 doc for the Norn-side bug.

### Summary

Chemical 179 — CA smell 14 (Ettin) — is the bloodstream mirror of the **Ettin-adult scent channel** in the Creatures 3 map CA system. Like CA 12 (Norn) and CA 13 (Grendel), CA 14 is powered by a **continuous per-agent emission**: every Ettin calls `emit 14 0.5` on itself at birth (`creatureBreeding.cos:140-142`, `creatureBreeding.cos:262-265` via the `else` branch, and `Genetic splicer panel2.cos:293-301` via the `setv va91 11 / addv va91 gnus / emit va91 0.5` idiom) and thereafter continuously contributes to its current room's CA 14 field via `Agent.HandleCA` on every CA-14 cycle. The channel is bound to the smell lobe via `cacl 4 3 0 14` in `z_agent smells.cos`, with the `-MyContribution` branch suppressing self-perception in Ettins' own smell-lobe neuron but not in the chemical copy. Propagation uses the standard creature/food rate profile (gain 0.99, loss 0.001, diffusion 0.80 in air/indoor/water; 0.40 in soil; 0 in blocked/cold rooms). **Uniquely among the three race-smell chemicals, chem 179 has no receptor gene at all in the stock genome** — chem 177 and chem 178 have inert "Reaction / Locus 0" placeholders, but chem 179 was omitted, making the Ettin channel the only one that is purely brain-layer in vanilla C3. The practical result is a real-time Ettin-population-density signal that Norns, Grendels, and Ettins can all sense via their smell lobes — the sensory substrate for Ettin pack dynamics, cross-species cohabitation awareness, and the workshop/factory-zone navigation that shapes the Ettin race's role in the C3 ecology.
