# 175 - CA smell 10 (machinery)

Chemical 175 is the eleventh of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 10**, which the engine's canonical naming table (`biochemistry.json` row 8945) calls `"machinery"`. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `10`, and writes that float directly into biochemistry chemical `FIRST_SMELL_CHEMICAL + 10 = 175` (with `FIRST_SMELL_CHEMICAL = 165`).

Unlike its sibling CA 9 (flowers), which is allocated but never populated, **CA 10 (machinery) is a fully active smell channel in the standard Creatures 3 bootstrap**. It is the scent-signature for the "machinery" category of agents — family 3, genus 3 (buttons, switches, vendors, launchers and other button-driven gadgets) — and is the only smell channel bound to family 3 via the CACL table in `z_agent smells.cos`. A handful of machines broadcast CA 10 into the room field at creation or on-use, the field propagates across the world using the rate-table profile that is shared with the food-smell channels (gain 0.99, loss 0.001, diffusion 0.80 in most room types), and every creature walking near such a machine sees chem 175 rise and the smell-lobe neuron for family 3/3 fire.

Four key properties characterise chem 175:

1. **The channel is bound to machinery agents via CACL.** `z_agent smells.cos:13` contains the single line `cacl 3 3 0 10`. This registers in `AgentManager.ourCategoryIdsForSmellIds[10]` the smell-lobe neuron ID corresponding to the `(family=3, genus=3, species=0)` agent category. Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 10 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron. Machinery is therefore a first-class smell category in the default Creatures 3 brain.
2. **A small set of machinery agents actively emit CA 10.** Four standard bootstrap files call `emit 10 <amount>`: `plusminus switch.cos:20` (at creation, once per button — there are two), `smell emitter + detector.cos:112, 220` (in click scripts of both the emitter and detector devices), and `single chemical graphing gadget.cos:22` (at creation). Every other family 3/3 agent — Creator, Genetic splicer, egg layers, seed banks, replicator, volcano, camera unit, environmental controls, trapdoor, airlocks, tunnel gates, fish launcher, etc. — is *classified* as machinery but does **not** inject CA 10 into its room. The scent field is therefore sparse: only a few locations in the world actually smell of machinery.
3. **The bloodstream chemical has no biochemistry consumer.** `biochemistry.json` contains chem 175 only in the `halfLives` table (entry 131, decay rate 0.99944177, ~1241-tick half-life). It appears nowhere in `reactions`, `receptors`, `emitters`, `neuroemitters`, or `organs`. The standard C3 genome therefore does not react to chem 175 biochemically at all — the only path from machinery smell to creature behaviour is the smell-lobe neuron.
4. **The engine-level plumbing is fully active.** The SensoryFaculty overwrite runs every tick on every room-bound creature, so chem 175 tracks the room field live. The half-life entry is only relevant in the rare case of a creature outside any room; in practice chem 175 is always a faithful copy of the local CA 10 value.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 10** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 10, smellValue)` → `Biochemistry.SetChemical(175, smellValue)` | Per tick — direct assignment (not additive) |
| 2 | **`plusminus switch.cos:20` — creation pulse** | — | `plusminus switch` agent (family 3/3/14) | `emit 10 0.2` at agent creation, looped twice (one per button); seeds a machinery-smell patch at the plusminus switch site | Once per switch at instantiation |
| 3 | **`smell emitter + detector.cos:112, 220` — toggle pulse** | — | Emitter (family 3/8/14) and Detector (family 3/8/15) agents | `emit 10 0.2` fires inside the toggle-off script (`scrp … 1`) of both devices. Each button press that turns the gadget off broadcasts a machinery-smell pulse into the room | Per button press (de-activation) |
| 4 | **`single chemical graphing gadget.cos:22` — creation pulse** | — | "euro scgg" agent (family 3/3/50) | `emit 10 .35` at agent creation; a larger pulse (0.35) than the other devices (0.20) | Once per graphing gadget at instantiation |
| 5 | **`CHEM` CAOS injection** | — | — | `chem 175 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 10 value) | Author-defined |
| 6 | **Ingestion of agents containing chem 175** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table lists chem 175 will inject it on bite/eat. Same overwrite caveat as (5) | Author-defined |
| 7 | **Mod-added `emit 10` or `altr room targ 10`** | — | — | Any add-on agent can seed CA 10. The field propagates across rooms via the rate table below | Author-defined |

### Emitters in the standard bootstrap — a sparse but real set

A full-text scan of `Rebuild/Assets/Bootstrap/` for `emit 10` returns four hits across three source files, covering three machines:

- **Plusminus switch** (`plusminus switch.cos:20`): two instances per installation, each emitting 0.2 at `mvto va50 3300 / va50 += 70`. Creates a persistent low-intensity machinery scent where the player-accessible arithmetic switches live.
- **Smell emitter + detector** (`smell emitter + detector.cos:112, 220`): the toggle-off branch of both the emitter (3/8/14) and detector (3/8/15) emits 0.2 whenever the player clicks the device off. The emitter also periodically emits the *currently-selected* CA channel with `emit ov71 va00` (line 257), meaning that device is a user-controllable source for *any* CA index including 10 — but the distinct `emit 10 0.2` pulse is the device's hard-coded "I am a machine" scent-mark.
- **Single chemical graphing gadget** (`single chemical graphing gadget.cos:22`): one instance emitting 0.35 at creation. The strongest standard machinery-smell pulse.

No bootstrap script uses `altr room targ 10`. The only channel 10 sources are the explicit `emit 10` calls above, plus whatever the smell-emitter gadget is configured to output (which can be any CA channel, not only 10).

### Per-room-type diffusion rates

From `!map.cos` the 16-room-type rate profile for CA 10 matches the food-smell channels (CA 6/7/8) almost exactly:

| Room type | gain | loss | diffusion | Behaviour for CA 10 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion |
| 1-4 (various indoor/tunnel) | 0.99 | 0.001 | 0.80 | Same — passes freely through corridors and indoor rooms |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (40 %) — soil absorbs machinery scent less readily |
| 8 (water) | 0.99 | 0.001 | 0.80 | Full reception in water (unlike CA 19 which is cut off here) |
| 9 (deep water) | 0.99 | 0.001 | 0.80 | Full reception |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

A typical `emit 10 0.2` pulse in an indoor room decays with a ~693-tick (~23 s) half-life via the 0.001 loss rate and diffuses outwards at 0.80 per tick, producing a smooth gradient around each emitting machine. Creatures approaching a machine see chem 175 climb steadily as they enter denser parts of the scent field.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (the only standard consumer) | — (CAOS-bound, not gene-bound) | `cacl 3 3 0 10` in `z_agent smells.cos:13` | `SensoryFaculty.Update` pushes the room's CA 10 value into `brain.SetInput("smel", neuronId, smellValue)` for the family-3/3 smell neuron. The `-MyContribution` subtraction does not apply because CA 10 is not bound to the creature's own category | The creature's brain learns to associate the "machinery" smell neuron with whatever reward/punishment structure emerges from interacting with family 3/3 agents. This is the standard pathway by which creatures recognise vendors, switches, launchers and other buttons-driven objects by scent and learn to approach or avoid them |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 175 is overwritten every sensory tick inside rooms anyway |
| 3 | **No genome-defined reaction or receptor** | — | — | — | Chem 175 has **no entry in `biochemistry.json`'s `reactions`, `receptors`, `emitters`, `neuroemitters`, or `organs` arrays**. Only the `halfLives[131]` decay entry exists — so there is no direct biochemical physiology driven by machinery smell |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 175 | Threshold / gain / locus author-defined | A breeder can add receptors that read chem 175 to produce direct biochemical responses to machinery proximity (e.g. curiosity chemical release on strong machinery smell). None exist in the standard genome |

**The only standard pathway from chem 175 to behaviour is the smell-lobe neuron for family 3/3.** No genome-defined reaction, receptor, or emitter in the standard C3 genome touches chemical 175 directly. The brain is the exclusive consumer.

## Role in Game Mechanics

### The machinery smell category

In the Creatures 3 agent classifier, family 3 is the "tool/simple object/gadget" family and genus 3 identifies button-driven machines — the things creatures can "push" to produce an effect. The CACL line `cacl 3 3 0 10` reserves CA channel 10 (and therefore chem 175) for this category, making "machinery smell" a distinct perceptual class for the creature brain alongside protein (CA 6 / chem 171), carbohydrate (CA 7 / chem 172), fat (CA 8 / chem 173), creature smells (CA 11-14 / chem 176-179) and home-area markers (CA 15-17 / chem 180-182).

The smell lobe has 40 neurons, each tied to an agent classifier. The CACL mapping wires CA 10 → the smell-lobe neuron whose category ID corresponds to `(3, 3, 0)` (see `AgentManager.ourCategoryIdsForSmellIds[10]` populated at startup from the CACL commands). Every sensory tick, that neuron's input voltage is set directly to the local CA 10 value. A creature approaching a switch or vendor sees its "machinery" neuron fire more strongly as the scent intensifies.

### Why chem 175 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 175 to produce any physiological response to machinery proximity — e.g. release a "curiosity" chemical, trigger a mild tranquilliser, or boost a drive — without needing to touch the brain. The standard genome does not use this hook, but it is available to breeders.
2. **CAOS inspection.** A world script can read `chem TARG 175` to query how strongly the creature currently smells machinery, which is useful for ad-hoc diagnostics, tutorials, reward gadgets and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so that the bloodstream view shows machinery-smell alongside other smells without special-casing lobe inputs.

### The sparse-emitter pattern

Only three machine types in the standard bootstrap actually emit CA 10:

- The **plusminus switch** emits at creation (a permanent scent-mark where the arithmetic switches sit).
- The **smell emitter/detector gadget** emits only when the player clicks it off (a transient scent-mark from the machine itself) — in addition, the emitter half of this gadget is the player's general-purpose "broadcast any CA index" tool, so it is the mechanism by which a human player typically experiments with machinery-scent gradients.
- The **single chemical graphing gadget** emits once at creation (a stronger 0.35 pulse).

Most other family 3/3 machines — Creator, splicer panel, egg layers, seed banks, replicator, volcano, tunnel gates, airlocks, trapdoors, camera units, environmental controls — do **not** broadcast CA 10. They are *classified* as machinery (so a visual/cognitive encounter is correctly categorised as "machinery"), but they do not seed the scent field. This means a creature exploring Shee Ark's many machines will reliably recognise each one on sight but will only *smell* machinery near the switches, gadgets and graphing tools that deliberately broadcast.

This sparsity is almost certainly deliberate. A scent-heavy world in which every button, door and tunnel gate filled the air with machinery smell would saturate the smell lobe's machinery neuron and prevent creatures from discriminating interesting machines from background structural elements. The designers instead picked a handful of player-facing interactive gadgets as scent sources so that approaching them produces a clear, localised scent cue.

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 175 tracks the world or decays in isolation:

- **Inside any room.** Chem 175 is overwritten every sensory tick with the room's live CA 10 value. The 1241-tick half-life is moot — the chemical tracks the field directly and the history is erased on every tick.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 175 follows pure first-order decay at rate 0.99944177 per tick. A creature that takes a long flight after passing a machine retains residual chem 175 that decays with a ~23 s half-life before the next room-bound overwrite.

### The `-MyContribution` subtraction is a no-op for CA 10

For CA indices bound to the creature's own category via CACL (CA 12 = Norn smell on a Norn, etc.), the SensoryFaculty subtracts the creature's own emission from the value written to its *brain* using `GetRoomPropertyMinusMyContribution` — so a creature does not smell itself. For CA 10 this branch never triggers: the machinery category (family 3/3) is never equal to a creature's own category (family 4, genera 1-3). The full CA 10 value is therefore always fed into the smell lobe.

Note: this subtraction only applies to the brain input on line 288. The chemical on line 278 is always written with the unmodified value — so even for self-category CAs, chem 175 is always the raw field reading, not the "minus me" version.

### What modders can do with CA 10

The channel is fully functional and easily extended:

- **Add a new machinery emitter.** Any new family 3/3 agent script can add `emit 10 <amount>` to its placement or action script to join the machinery-scent network. Creatures will automatically recognise the new machine by scent without any genome changes.
- **Re-classify the category.** A modder who wants a different category (e.g. "elevators") to map into CA 10 can change the CACL line to `cacl <f> <g> <s> 10` and pick a different classifier. The smell-lobe neuron then fires for the new class instead.
- **Add a biochemical receptor.** A genome edit adding a receptor against chem 175 enables direct physiological responses to machinery proximity — useful for experiments like "curiosity-driven approach behaviour" or "machine-phobia".
- **Monitor with CAOS.** `outs "machinery smell = " outv chem TARG 175` in a debug gadget inspects live machinery-scent levels on a creature, which is often more readable than dumping the whole 256-chemical bloodstream.

### Practical consequences

- **Chem 175 is live but narrow.** Only a handful of machines in vanilla C3 produce non-zero readings. A creature standing next to a plusminus switch or a single chemical graphing gadget will have chem 175 in the 0.1-0.3 range; everywhere else it is effectively 0.
- **Machinery-smell learning is gentle.** Because the emitters are sparse and chronic (once-at-creation pulses with 0.001-loss decay), the smell field is a low-frequency, long-lived landmark — good for place recognition but a weak phasic signal. Creatures do not get repeated machinery-smell pulses unless they repeatedly visit the emitting machines or toggle the smell emitter/detector gadget.
- **`chem TARG 175` is a live diagnostic.** A CAOS debug panel reading chem 175 on the nearest creature can verify which rooms the player has seeded with machinery scent and confirm the full SensoryFaculty pipeline is running.
- **Flooding chem 175 via `chem 175 255` has no biochemical effect.** No receptor reads it. The brain neuron still fires because the sensory loop only writes on room-lookup (not on chem-set), so a manual injection is not propagated to the lobe — it is simply overwritten on the next tick by the room value.
- **Removing the CACL line blinds the brain but leaves the chemical.** A modder who removes `cacl 3 3 0 10` disconnects the smell-lobe neuron but still has chem 175 tracking CA 10; the channel becomes purely biochemical (and therefore invisible to the creature without a receptor gene).

### Summary

Chemical 175 — CA smell 10 (machinery) — is the bloodstream mirror of the **machinery scent channel** in the Creatures 3 map CA system. It is one of the fully active CA-smell channels: bound to the smell lobe via `cacl 3 3 0 10` in `z_agent smells.cos`, driven by a handful of in-world emitters (plusminus switch, smell emitter/detector, single chemical graphing gadget), propagated across rooms with the standard food-smell-style rate profile (gain 0.99, loss 0.001, diffusion 0.80 in air/indoor/water; 0.40 in soil; 0 in blocked/cold rooms), and copied every sensory tick into chem 175 so the value is available both to the smell lobe and to CAOS diagnostics. Unlike the food-smell channels it has no biochemistry consumer — the standard genome contains no reaction, receptor, or emitter gene referencing chem 175 — so the only observable behavioural pathway runs through the smell-lobe neuron for family 3/3 agents. This makes the channel a classic "cognitive-only" smell: creatures learn to recognise and navigate toward the gadgets that broadcast it, but their internal physiology is unaffected by the scent level. For modders it is a lightweight extension point: new machinery emitters can be added with a single `emit 10` call, and an optional receptor gene addition unlocks a biochemical response pathway without disturbing any existing behaviour.
