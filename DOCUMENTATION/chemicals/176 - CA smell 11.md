# 176 - CA smell 11

Chemical 176 is the twelfth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 11**. The canonical naming table (`biochemistry.json` row 8953) labels it simply `"CA smell 11"` with no parenthetical qualifier, but functionally the channel is the **eggs scent channel**: `z_agent smells.cos:19` wires it to the smell-lobe neuron for agent category `(family 3, genus 4, species 1)` — the classifier used by `new: simp 3 4 1 "eggs" …` for Norn eggs laid by the Norn Egg Layer and by the runtime breeding/laying code in `creatureBreeding.cos`. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `11`, and writes that float directly into biochemistry chemical `FIRST_SMELL_CHEMICAL + 11 = 176` (with `FIRST_SMELL_CHEMICAL = 165`).

Unlike CA 9 (flowers), which is allocated but never populated by any bootstrap emitter, **CA 11 is a fully active smell channel in the standard Creatures 3 bootstrap**. It is the scent-signature exclusively for Norn eggs (family 3 / genus 4 / species 1), and the two places in the bootstrap that spawn such eggs both broadcast a **0.65-intensity `emit 11` pulse** at egg creation — a much stronger pulse than any other CA-smell channel in the vanilla game. This makes "eggs smell" one of the strongest phasic scent cues a creature can experience, and the pulse persists (0.001 per-tick loss) as a long-lived scent landmark wherever a Norn egg has been laid.

Four key properties characterise chem 176:

1. **The channel is bound to Norn eggs via CACL.** `z_agent smells.cos:19` contains the single line `cacl 3 4 1 11`. This registers in `AgentManager.ourCategoryIdsForSmellIds[11]` the smell-lobe neuron ID corresponding to the `(family=3, genus=4, species=1)` agent category — i.e. Norn eggs. Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 11 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron. Norn eggs are therefore a first-class smell category in the default Creatures 3 brain, distinct from adult Norns (CA 12 / chem 177), Grendels (CA 13), Ettins (CA 14), food, water and the other smell channels.
2. **Norn-egg creation emits a strong, species-gated pulse.** Two bootstrap code paths spawn eggs of classifier `3 4 1`: `Norn Egg layer.cos:317-326` (the fixed Norn Egg Layer machine) and `creatureBreeding.cos:575-590` (the runtime laying path used when a pregnant Norn lays an egg). Both fire `emit 11 0.65` *immediately after* `new: simp 3 4 1 "eggs" …`. The creatureBreeding path explicitly gates the emit on `va99 eq 1` (the Norn branch), so Grendel eggs (`new: simp 3 4 2 "greneggmask"`) and Ettin eggs (`new: simp 3 4 3 "greneggmask"`) do **not** emit on CA 11 — consistent with the CACL binding being to species 1 only.
3. **The bloodstream chemical has no biochemistry consumer.** `biochemistry.json` contains chem 176 only in the `halfLives` table (entry 132, decay rate 0.99944177, ~1241-tick half-life). It appears nowhere in `reactions`, `receptors`, `emitters`, `neuroemitters`, or `organs`. The standard C3 genome therefore does not react to chem 176 biochemically at all — the only path from eggs smell to creature behaviour is the smell-lobe neuron.
4. **The engine-level plumbing is fully active.** The SensoryFaculty overwrite runs every tick on every room-bound creature, so chem 176 tracks the room field live. The half-life entry is only relevant in the rare case of a creature outside any room; in practice chem 176 is always a faithful copy of the local CA 11 value.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 11** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 11, smellValue)` → `Biochemistry.SetChemical(176, smellValue)` | Per tick — direct assignment (not additive) |
| 2 | **`Norn Egg layer.cos:326` — egg-layer creation pulse** | — | Norn Egg Layer machine (family 3/3/31); spawns eggs classified `3 4 1` | After `new: simp 3 4 1 "eggs" …`, calls `emit 11 0.65` into the layer's current room; seeds an eggs-smell patch wherever the Norn Egg Layer deposits an egg | Once per egg laid by the machine |
| 3 | **`creatureBreeding.cos:589` — Norn laying pulse** | — | Runtime laying script used when a pregnant Norn lays; gates on `doif va99 eq 1` so only Norn eggs (species 1) emit | After `new: simp 3 4 1 "eggs" …`, calls `emit 11 0.65` into the layer creature's current room | Once per Norn egg laid (Grendel/Ettin eggs skip this emit) |
| 4 | **`CHEM` CAOS injection** | — | — | `chem 176 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 11 value) | Author-defined |
| 5 | **Ingestion of agents containing chem 176** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table lists chem 176 will inject it on bite/eat. Same overwrite caveat as (4) | Author-defined |
| 6 | **Mod-added `emit 11` or `altr room targ 11`** | — | — | Any add-on agent can seed CA 11. The field propagates across rooms via the rate table below | Author-defined |

### Emitters in the standard bootstrap — eggs only

A full-text scan of `Rebuild/Assets/Bootstrap/` for `emit 11` returns exactly two hits, both tied to Norn egg creation:

- **Norn Egg Layer** (`Norn Egg layer.cos:326`): emits 0.65 once per egg, immediately after the `new: simp 3 4 1 "eggs" 8 va60 4` call in the `eggs` spawn script of the layer machine. The layer is the fixed source of bootstrap "starter" Norn eggs and is the primary way the scent field gets populated in a fresh world.
- **Runtime breeding** (`creatureBreeding.cos:589`): emits 0.65 once per egg, inside the `doif va99 eq 1 … endi` Norn-species branch of the generic laying script. Grendel and Ettin egg spawns in the same script (branches `va99 = 2` and `va99 = 3`) do **not** fire `emit 11`.

No bootstrap script uses `altr room targ 11`, no other agent class emits CA 11, and no periodic/maintenance script re-injects the scent. The channel is therefore a **pure "egg-marker" signal**: its presence in the field means "a Norn egg was laid here recently".

### Per-room-type diffusion rates

From `!map.cos` the 16-room-type rate profile for CA 11 is identical to that of CA 10 (machinery) and the food-smell channels (CA 6/7/8):

| Room type | gain | loss | diffusion | Behaviour for CA 11 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion |
| 1-4 (various indoor/tunnel) | 0.99 | 0.001 | 0.80 | Same — passes freely through corridors and indoor rooms |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (40 %) — soil absorbs egg-smell less readily |
| 8 (water) | 0.99 | 0.001 | 0.80 | Full reception in water |
| 9 (deep water) | 0.99 | 0.001 | 0.80 | Full reception |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

A typical `emit 11 0.65` pulse in an indoor room decays with a ~693-tick (~23 s) half-life via the 0.001 loss rate and diffuses outwards at 0.80 per tick, producing a smooth gradient around each laid egg. Because 0.65 is more than three times the `emit 10 0.2` pulse used by most machinery emitters, the eggs-smell peak is substantially higher and remains above a behaviourally-detectable level for much longer after the emit. A creature approaching the egg therefore sees a strong, sustained chem 176 ramp-up.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (the only standard consumer) | — (CAOS-bound, not gene-bound) | `cacl 3 4 1 11` in `z_agent smells.cos:19` | `SensoryFaculty.Update` pushes the room's CA 11 value into `brain.SetInput("smel", neuronId, smellValue)` for the Norn-eggs smell neuron. The `-MyContribution` subtraction does not apply because CA 11 is not bound to the creature's own category | The creature's brain learns to associate the "eggs" smell neuron with whatever reward/punishment structure emerges from interacting with Norn eggs (e.g. approaching eggs to investigate, or encountering them in nursery areas). This is the only standard pathway by which creatures recognise eggs by scent |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 176 is overwritten every sensory tick inside rooms anyway |
| 3 | **No genome-defined reaction or receptor** | — | — | — | Chem 176 has **no entry in `biochemistry.json`'s `reactions`, `receptors`, `emitters`, `neuroemitters`, or `organs` arrays**. Only the `halfLives[132]` decay entry exists — so there is no direct biochemical physiology driven by eggs smell |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 176 | Threshold / gain / locus author-defined | A breeder can add receptors that read chem 176 to produce direct biochemical responses to egg proximity (e.g. broodiness, maternal drive boost, calming). None exist in the standard genome |

**The only standard pathway from chem 176 to behaviour is the smell-lobe neuron for family 3/4/1 (Norn eggs).** No genome-defined reaction, receptor, or emitter in the standard C3 genome touches chemical 176 directly. The brain is the exclusive consumer.

## Role in Game Mechanics

### The eggs smell category

In the Creatures 3 agent classifier, family 3 is the "tool/simple object/gadget" family and genus 4 is its "eggs" genus — reserved for objects that are laid, hatch into creatures, and belong spatially to the breeding system rather than to the creatures themselves (adult creatures live under family 4). Species numbers under genus 4 encode the race: species 1 = Norn, species 2 = Grendel, species 3 = Ettin. The CACL line `cacl 3 4 1 11` reserves CA channel 11 (and therefore chem 176) for **Norn eggs specifically**, making "Norn-egg smell" a distinct perceptual class for the creature brain alongside food (CA 6-8), machinery (CA 10), adult creatures (CA 12-14) and home-area markers (CA 15-17).

The smell lobe has 40 neurons, each tied to an agent classifier. The CACL mapping wires CA 11 → the smell-lobe neuron whose category ID corresponds to `(3, 4, 1)` (populated at startup from the CACL commands in `AgentManager.ourCategoryIdsForSmellIds[11]`). Every sensory tick, that neuron's input voltage is set directly to the local CA 11 value. A creature approaching a freshly laid Norn egg sees its "eggs" neuron fire strongly as the scent intensifies.

Note that Grendel and Ettin eggs — though *classified* under the same genus — do **not** share the channel. They have no CACL binding and no standard emitter. The eggs-smell network in vanilla C3 is therefore Norn-specific, both on the brain side (CACL) and on the world side (emit gating on `va99 eq 1`).

### Why chem 176 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 176 to produce any physiological response to Norn-egg proximity — e.g. release a maternal/broody chemical, suppress aggression, or boost a caring drive. The standard genome does not use this hook, but it is a natural extension point for breeders interested in brood-behaviour experiments.
2. **CAOS inspection.** A world script can read `chem TARG 176` to query how strongly the creature currently smells Norn eggs, which is useful for diagnostic gadgets, "is this creature near eggs?" checks in tutorial/story scripts, and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so that the bloodstream view shows eggs-smell alongside other smells without special-casing lobe inputs.

### The egg-emitter pattern — a strong, persistent "I was laid here" marker

The 0.65-intensity pulse at egg creation is the largest `emit` value of any CA-smell channel in the vanilla bootstrap. Compare:

- CA 6 (protein), 7 (carbohydrate), 8 (fat): food emitters typically 0.1–0.3.
- CA 10 (machinery): 0.20 (plusminus switch, smell emitter/detector) or 0.35 (chemical graphing gadget).
- **CA 11 (eggs): 0.65 — roughly 2–3× the next largest.**

This is deliberate. Eggs are rare, discrete events (one pulse per egg, no periodic re-emit) and they are intended to be strongly noticed by creatures in the vicinity — both as a navigational landmark ("something meaningful happened here") and as a learning signal that can be associated with maternal or social behaviour. A weak pulse would diffuse to near-invisibility within seconds; a strong 0.65 pulse leaves a detectable gradient in the room for minutes (0.001 loss rate), long enough for a passing creature to register the event and form an association.

Once the pulse is delivered there is no maintenance emit: the egg itself does *not* continue to broadcast CA 11 while it sits on the ground. The scent therefore decays monotonically (modulated by diffusion across adjacent rooms and the 0.001 per-tick loss) until the next egg is laid in the same area.

### Species gating in the laying script

The runtime laying code (`creatureBreeding.cos:567-590`) builds the right egg class from the mother's genus:

```
setv va99 gnus
doif va99 = 2
    new: simp 3 4 2 "greneggmask" 7 1 10           ; Grendel egg
elif va99 = 3
    new: simp 3 4 3 "greneggmask" 7 8 10           ; Ettin egg
else
    new: simp 3 4 1 "eggs" 8 va03 2000             ; Norn egg (va99 = 1)
endi
...
doif va99 eq 1
    emit 11 0.65
endi
```

The emit is explicitly inside the `va99 eq 1` branch. This mirrors the CACL binding exactly: CA 11 is the Norn-egg smell, and only Norn eggs seed it. Grendel and Ettin eggs produce no scent — a creature cannot, via the standard smell lobe, tell that a non-Norn egg was laid anywhere.

This species-specific scenting means that in a mixed breeding colony the eggs-smell field becomes a visible proxy for *Norn* reproductive activity — a map of where Norns have been laying. Grendel and Ettin broods remain scent-invisible (to this channel) until a modder adds their own CACL/emit pair.

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 176 tracks the world or decays in isolation:

- **Inside any room.** Chem 176 is overwritten every sensory tick with the room's live CA 11 value. The 1241-tick half-life is moot — the chemical tracks the field directly and the history is erased on every tick.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 176 follows pure first-order decay at rate 0.99944177 per tick. A creature that took a strong hit of eggs-smell just before falling will retain residual chem 176 for ~23 s (half-life) before the next room-bound overwrite.

### The `-MyContribution` subtraction is a no-op for CA 11

For CA indices bound to the creature's own category via CACL (CA 12 = Norn-adult smell on a Norn, etc.), the SensoryFaculty subtracts the creature's own emission from the value written to its *brain* using `GetRoomPropertyMinusMyContribution` — so a creature does not smell itself. For CA 11 this branch never triggers: the eggs category (family 3/4/1) is never equal to a creature's own category (family 4, genera 1-3 for Norn/Grendel/Ettin adults). The full CA 11 value is therefore always fed into the smell lobe.

Note: this subtraction only applies to the brain input on line 288. The chemical on line 278 is always written with the unmodified value — so even for self-category CAs, chem 176 is always the raw field reading, not the "minus me" version.

### What modders can do with CA 11

The channel is fully functional and easily extended:

- **Make Grendel/Ettin eggs scented too.** Add `cacl 3 4 2 <new CA>` and `cacl 3 4 3 <new CA>` plus matching `emit` calls in the existing `creatureBreeding.cos` branches — or reuse CA 11 with additional CACL lines so all three species converge on the same scent channel. (Note that multiple CACLs on the same CA will share the smell-lobe neuron, collapsing the three races into one perceptual class.)
- **Add a maternal/broody biochemistry.** A genome edit adding a receptor against chem 176 enables direct physiological responses to Norn-egg proximity — useful for "attracted to eggs" drive boosts, broody-chemical release, or Norn-specific care behaviour without touching the brain.
- **Change emit intensity or duration.** Editing the 0.65 pulse in `Norn Egg layer.cos:326` and `creatureBreeding.cos:589` changes how far and how long the eggs-smell persists. Adding a periodic `emit 11` inside the egg agent's own script (with a `tick`-based heartbeat) would turn eggs into continuous emitters instead of one-shot markers.
- **Monitor with CAOS.** `outs "eggs smell = " outv chem TARG 176` in a debug gadget inspects live eggs-scent levels on a creature, making it easy to verify where Norn broods have been laid.

### Practical consequences

- **Chem 176 is a strong, sparse, event-driven signal.** A Norn-egg pulse of 0.65 produces a peak in chem 176 of up to 0.65 (less after diffusion/distance) that decays slowly (~23 s half-life). Between egg-laying events the channel is effectively zero. This makes it a great phasic learning signal.
- **Norn creatures learn "eggs are here" by scent.** The smell-lobe neuron for (3,4,1) receives the full 0.65 peak in the room where an egg was laid. Repeated associations between high chem 176 and the visual/reward context of finding eggs build up a brain response to egg smell; adult Norns can therefore learn to seek out or avoid egg-rich areas.
- **Grendel/Ettin eggs are invisible to this channel.** A vanilla breeder observing only eggs-smell gradients sees a map of Norn-laying activity, not total brood activity. The other species are scent-silent.
- **Flooding chem 176 via `chem 176 255` has no biochemical effect.** No receptor reads it. The brain neuron does not update either because the sensory loop only writes on room-lookup (not on chem-set), so a manual injection is simply overwritten on the next tick by the room value.
- **Removing the CACL line blinds the brain but leaves the chemical.** A modder who removes `cacl 3 4 1 11` disconnects the smell-lobe neuron but still has chem 176 tracking CA 11; the channel becomes purely biochemical (and therefore invisible to the creature without a receptor gene).

### Summary

Chemical 176 — CA smell 11 — is the bloodstream mirror of the **Norn-eggs scent channel** in the Creatures 3 map CA system. It is one of the fully active CA-smell channels: bound to the smell lobe via `cacl 3 4 1 11` in `z_agent smells.cos`, seeded by strong 0.65-intensity `emit 11` pulses at every Norn-egg creation (from both the Norn Egg Layer machine and the runtime breeding script), propagated across rooms with the standard food-smell-style rate profile (gain 0.99, loss 0.001, diffusion 0.80 in air/indoor/water; 0.40 in soil; 0 in blocked/cold rooms), and copied every sensory tick into chem 176 so the value is available both to the smell lobe and to CAOS diagnostics. Unlike the food-smell channels it has no biochemistry consumer — the standard genome contains no reaction, receptor, or emitter gene referencing chem 176 — so the only observable behavioural pathway runs through the smell-lobe neuron for (3,4,1). The channel is Norn-specific: Grendel and Ettin eggs share the genus 4 classifier but are explicitly gated out of the emit and unbound from the CACL, so their broods remain scent-invisible. For modders it is a lightweight extension point: stronger/weaker pulses, extra species bindings, or a new maternal-physiology receptor can all be added with surgical changes to `z_agent smells.cos`, `Norn Egg layer.cos`, `creatureBreeding.cos` and the genome.
