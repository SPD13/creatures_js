# 178 - CA smell 13 (Grendel)

Chemical 178 is the fourteenth of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 13**. The canonical naming table (`biochemistry.json` row 8969) labels it `"CA smell 13 (Grendel)"`, and the channel is genuinely dedicated: `z_agent smells.cos:24` wires it to the smell-lobe neuron for agent classifier `(family 4, genus 2, species 0)` — the runtime classifier of every adult Grendel creature. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `13`, and writes that float into biochemistry chemical `FIRST_SMELL_CHEMICAL + 13 = 178` (with `FIRST_SMELL_CHEMICAL = 165`).

CA 13 is the Grendel analogue of CA 12 (Norn) — and it shares the same **sustained, per-agent emission** architecture. Grendels do not fire one-off pulses into the field; every living Grendel is configured (via the CAOS `EMIT` command on its own agent handle) to continuously broadcast `0.5` into CA 13 as long as it is alive and inside a room. The field is therefore a real-time density map of where Grendels *currently* are, not a trail of where they have been. The bootstrap wires this up at creature creation time: the hatch path in `creatureBreeding.cos:140-142` and the splicer path in `Genetic splicer panel2.cos:293-301` both run

```
setv va91 11
addv va91 gnus
emit va91 0.5
```

immediately after `new: crea 4 …`. With `gnus = 2` for a Grendel, `va91 = 13`, so each new Grendel calls `emit 13 0.5` on itself and becomes a continuous CA 13 emitter. Norns (gnus 1) end up on CA 12 and Ettins (gnus 3) on CA 14 by the same formula — the genus-offset trick lets one code path configure the scent of all three races consistently.

Four key properties characterise chem 178:

1. **The channel is bound to adult Grendels via CACL.** `z_agent smells.cos:24` contains the single line `cacl 4 2 0 13`. This registers in `AgentManager.ourCategoryIdsForSmellIds[13]` the smell-lobe neuron ID corresponding to the `(family=4, genus=2, species=0)` agent category — i.e. any Grendel (species 0 acts as a wildcard at the classifier level so all Grendel species collapse onto the same neuron). Every sensory tick, `SensoryFaculty.Update` pushes the room's CA 13 value into `brain.SetInput("smel", neuronId, smellValue)` for that neuron — but see property 3 for the self-contribution subtraction that Grendels receive on their own channel.
2. **Grendels continuously emit CA 13 at 0.5.** The CAOS `EMIT` command invokes `Agent.SetEmission(caIndex, value)` (the emission setup routine), which stores `myCAIndex=13` and `myCAIncrease=0.5` on the creature's agent. Because CA 13 is non-navigable, `Agent.HandleCA` (the per-agent CA-handling routine) takes the non-nav branch: on each CA tick whose turn is `myCAIndex` (`map.GetCAIndex() == 13`), the Grendel calls `map.IncreaseCAInput(roomID, 0.5)`, adding 0.5 to the current room's `caInput` accumulator. During `Map.UpdateCurrentCAProperty` (the room CA update routine), this `caInput` is fed into `UpdateRoomCA` as the fresh emission term for the room and then zeroed. A single Grendel in an indoor room therefore contributes 0.5 of "fresh Grendel scent" per CA-13 cycle; two Grendels in the same room contribute 1.0, etc. The emission is automatic and updates as the Grendel moves between rooms (the agent's room-change bookkeeping handles this).
3. **The `-MyContribution` subtraction suppresses self-smell at the Grendel's brain, but not at the chemical.** Because CA 13 is bound to the creature's *own* category on a Grendel, `SensoryFaculty.Update` (the sensory update routine) detects `neuronId == GetCategoryIdOfAgent(myCreature)` and calls `GetRoomPropertyMinusMyContribution` for the *brain* input. This subtracts `caMultiplier * agent.GetCAIncrease() = 10 × 0.5 = 5.0` from the room's CA 13 value and renormalises via `1 − 1/(v+1)` before feeding the smell neuron — so a lone Grendel smells "no other Grendels" even though its own emission dominates the room. The *chemical* on line 278, however, is always written with the unmodified room value, meaning chem 178 on a Grendel still reflects its own contribution. Norns and Ettins reading CA 13 receive the unmodified value (no subtraction) because the neuron is not their own category.
4. **Chem 178 has a receptor gene, but at an unconnected locus.** `biochemistry.json` receptor row 130 (gene 132, `Baby` switch-on) reads chem 178 at threshold 212, nominal 209, gain 56 into **organ 3 "Reaction", tissue 0, locus 0**. This is a "Reaction" pseudo-organ receptor with `locusName: "Locus 0"` — i.e. an unnamed locus that produces no standard side-effect in the standard genome. The parallel Norn receptor (chem 177, row 129) is at threshold 214 with the same nominal/gain; the 2-point threshold difference between the two is cosmetic and not behaviourally meaningful given the rough tolerance of receptor firing. The receptor is therefore effectively inert in vanilla C3, but it confirms the genome authors *intended* each race-smell chemical to be a biochemistry-visible signal that breeders could wire up to drives or emotions via locus edits. The only behaviourally-active pathway in the stock game runs through the smell-lobe neuron.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 13** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 13, smellValue)` → `Biochemistry.SetChemical(178, smellValue)`. The unmodified value is written — no `-MyContribution` adjustment on the chemical side | Per tick — direct assignment (not additive) |
| 2 | **Continuous per-Grendel emission** (primary source of the field) | — | All living Grendel agents via `Agent.SetEmission(13, 0.5)` | Triggered at creature birth: `creatureBreeding.cos:140-142` (egg hatch) and `Genetic splicer panel2.cos:299-301` (spliced creature) run `setv va91 11 / addv va91 gnus / emit va91 0.5`; for gnus=2 (Grendel) this is `emit 13 0.5`. Thereafter `Agent.HandleCA` adds `0.5` to `room.caInput` every time `map.GetCAIndex() == 13` is scheduled | 0.5 per CA-13 cycle, per Grendel, per occupied room |
| 3 | **Aged-egg fallback (also correctly configures Grendels)** | — | `Agent.SetEmission(13, 0.5)` via hard-coded branch | `creatureBreeding.cos:262-266` uses `doif gnus eq 2 / emit 13 0.5 / else / emit 14 0.5 / endi` — the `gnus eq 2` branch correctly assigns CA 13 to Grendels hatched via this fallback path. (Unlike Norns, which the else branch mis-routes onto CA 14 — see CA smell 12 doc) | 0.5 per CA-13 cycle |
| 4 | **Moving Grendels re-emit in their new room** | — | `Agent.HandleCA` non-navigable branch | Each time the CA scheduler reaches index 13, every Grendel whose agent has `myCAIndex==13` increments its current room's `caInput` by 0.5. Room transitions are handled transparently: the emission follows the Grendel wherever it walks | Same 0.5 per cycle; automatically re-routed on room change |
| 5 | **`CHEM` CAOS injection** | — | — | `chem 178 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room (to the local CA 13 value) | Author-defined |
| 6 | **Ingestion of agents containing chem 178** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table lists chem 178 will inject it on bite/eat. Same overwrite caveat as (5) | Author-defined |
| 7 | **Mod-added `emit 13` or `altr room targ 13`** | — | — | Any add-on agent can seed CA 13. A gadget that issues `emit 13 <x>` on itself would continuously contribute to the Grendel field — typically used for decoys, training aids that make a location "smell Grendelly", or cross-race aggression triggers | Author-defined |

### Emitters in the standard bootstrap — living Grendels plus the aged-egg branch

A full-text scan of `Rebuild/Assets/Bootstrap/` for `emit 13` returns **exactly one direct occurrence**: the `creatureBreeding.cos:263` aged-egg fallback. All other CA 13 emission is populated by the indirect `emit va91 0.5` pattern after `new: crea 4`, which resolves to `emit 13 0.5` only when the new creature's genus is 2 (Grendel). The three spawn sites are:

- **Egg-hatch via breeding script** (`creatureBreeding.cos:140-142`): after the egg produces a baby via `new: crea 4 targ 1 ov01 0`, the formula `setv va91 11 / addv va91 gnus / emit va91 0.5` is run on the newborn. This is the dominant source of CA 13 emitters in a populated world — every Grendel hatched from a normal egg is wired in here.
- **Aged-egg fallback** (`creatureBreeding.cos:262-266`): a second, timer-driven path spawns a creature from an unhatched egg that has sat too long. The `doif gnus eq 2 / emit 13 0.5` line correctly assigns CA 13 to Grendel hatchlings from this branch. Grendels produced by this path are therefore fully scent-configured — unlike the corresponding Norn case where the else branch mis-routes Norns onto CA 14.
- **Genetic splicer spawn** (`Genetic splicer panel2.cos:293-301`): the splicer panel produces hybrid creatures via `new: crea 4 pntr 1 va66 0` and then runs the same `emit va91 0.5` formula. Spliced Grendels therefore emit on CA 13 normally.

No bootstrap agent other than Grendels themselves emits CA 13. There is no periodic `altr room targ 13`, no scent-emitter gadget keyed to this channel, and no ambient environmental source. **The CA 13 field is a direct function of Grendel population and distribution** — when there are no Grendels in the world (or all are outside any room), CA 13 drains to zero everywhere.

### Per-room-type diffusion rates

The 16-room-type rate profile for CA 13, from `!map.cos`, is identical to the other creature-smell channels (CA 12 Norn, CA 14 Ettin) and to the food/eggs scents:

| Room type | gain | loss | diffusion | Behaviour for CA 13 |
|-----------|------|------|-----------|---------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion — Grendel scent fills outdoor spaces readily |
| 1-4 (various indoor/tunnel) | 0.99 | 0.001 | 0.80 | Same — passes freely through corridors and indoor rooms |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (40 %) — soil absorbs Grendel scent less readily |
| 8 (water) | 0.99 | 0.001 | 0.80 | Full reception in water |
| 9 (deep water) | 0.99 | 0.001 | 0.80 | Full reception |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold/barrier) | 0.00 | 0.00 | 0.00 | Dead zones — no reception, no diffusion |

The 0.001 per-tick loss means the channel has a long memory: a Grendel that briefly steps into a room and then leaves can leave a detectable residue for roughly a thousand ticks (~33 s game-time at 30 TPS) before the field decays out. During the Grendel's stay, the continuous 0.5-per-cycle emission builds the field up to an equilibrium set by gain/loss/diffusion — typically saturating near 1.0 in the Grendel's own room and trailing off through adjacent connected rooms via the 0.80 diffusion. The soil reduction in room types 5-7 is particularly relevant for C3's underground biomes, where wild Grendels often congregate: their scent decays faster in dirt and cave rooms than in the factory/garden rooms above.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron input** (primary behavioural pathway) | — (CAOS-bound, not gene-bound) | `cacl 4 2 0 13` in `z_agent smells.cos:24` | `SensoryFaculty.Update` pushes the room's CA 13 value into `brain.SetInput("smel", neuronId, smellValue)` for the Grendel smell neuron. **For Grendels specifically**, line 284 detects `neuronId == myCategoryId` and first calls `GetRoomPropertyMinusMyContribution` to subtract the creature's own 0.5 emission (×10 caMultiplier) and renormalise — so a Grendel's own presence does not mask other Grendel scent | Creatures learn to associate "Grendel smell" with the emotional and reward context of encounters with Grendels. Norns typically learn fear/avoidance, Grendels learn pack-recognition, and Ettins learn their cohabitation relationships. The channel is a direct sensory substrate for the classic Norn–Grendel enmity |
| 2 | **Somatic receptor on chem 178** (biochemistry, inert in stock genome) | Gene 132 (`biochemistry.json` receptor id 130) | Organ 3 "Reaction", tissue 0 Somatic, locus 0 | threshold 212/255 ≈ 0.83, nominal 209/255 ≈ 0.82, gain 56 | The receptor is expressed from age 0 (`Baby` switch-on) and would fire only when the room is saturated with Grendel scent (value above ~0.83). Because the locus is `Locus 0` on the "Reaction" pseudo-organ, there is no standard biochemical effect wired up — the receptor exists structurally but does not drive any chemical emission or locus modulation in vanilla C3. It is an extension hook |
| 3 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | Same as every other CA-smell chem. Irrelevant in practice because chem 178 is overwritten every sensory tick inside rooms anyway |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 178 | Threshold / gain / locus author-defined | A breeder can attach chem 178 to any biochemistry locus — e.g. a stress/fear chemical that spikes on Grendel proximity for Norns, a comfort chemical for Grendels near kin, or a drive modulator ("aggression increase" when surrounded by Grendels). This is the natural path for making creatures biochemically react to Grendels |

**The dominant behavioural pathway from chem 178 is the smell-lobe neuron for family 4/2/0 (Grendel adults).** The `biochemistry.json`-declared receptor on organ "Reaction" locus 0 exists but is behaviourally inert in the stock genome; the chemical is otherwise untouched by standard reactions, emitters, neuroemitters, or organs.

## Role in Game Mechanics

### The Grendel-smell category

In the Creatures 3 agent classifier, family 4 is the "creature" family and its three genera correspond to the three playable races: genus 1 = Norn, genus 2 = Grendel, genus 3 = Ettin. Each of these adult-creature categories gets its own CA-smell channel (CA 12/13/14, chem 177/178/179) and its own smell-lobe neuron. Together with the eggs channel (CA 11, Norn-egg specific) this forms a coherent four-channel "who's around" sensory bundle: one for each adult race and one for Norn offspring.

The species slot in the CACL mapping is `0`, which in the agent classifier acts as a wildcard — the neuron fires for any Grendel regardless of their species-level subtype. Banshee, Jungle, and any custom Grendel species all still land under family 4 / genus 2 and so all share the same CA 13 neuron. This is different from CA 11, where species 1 specifically was used to narrow the binding to *Norn* eggs only.

The smell lobe has 40 neurons, each tied to an agent classifier via CACL. The CACL mapping wires CA 13 → the smell-lobe neuron whose category ID corresponds to `(4, 2, 0)` (populated at startup from the CACL commands in `AgentManager.ourCategoryIdsForSmellIds[13]`). Every sensory tick, that neuron's input voltage is set directly to the local CA 13 value (minus self-contribution for Grendels).

### Why chem 178 exists alongside the brain neuron

The engine always duplicates each CA reading into (a) a bloodstream chemical and (b) a smell-lobe neuron input. The chemical copy exists for three reasons:

1. **Biochemical extensibility.** A genome can declare a receptor against chem 178 to drive any physiological response to Grendel proximity — e.g. a fear/stress chemical in Norns when Grendels are near, a bonding chemical in Grendels near their own kind, or a drive modulation that raises aggression in mixed populations. The standard genome expresses the receptor (gene 132) but routes it to an inert locus, so it acts only as a structural placeholder for breeders to override.
2. **CAOS inspection.** A world script can read `chem TARG 178` to query how strongly the creature currently smells Grendels, which is useful for diagnostic gadgets ("is this Norn near a Grendel?"), story scripts that trigger on Grendel encounters, aggression monitors, and debug panels.
3. **Save/load and diagnostic parity.** Storing the smell as a chemical makes it part of the creature's chemistry snapshot so the bloodstream view shows Grendel-smell alongside other smells without special-casing lobe inputs.

Note the asymmetry with the brain: the chemical receives the **unmodified** room CA value, while the brain neuron receives the **minus-my-contribution** value on Grendels. A CAOS script reading `chem TARG 178` on a Grendel therefore sees a saturation that reflects the Grendel itself plus any neighbours — to replicate the brain's view the script must subtract the Grendel's own contribution manually. For Norns and Ettins, the chemical and neuron values agree.

### Per-Grendel emission versus per-event pulse — a density field, not a trail

This is the key architectural difference between CA 13 and pulse-driven channels like CA 11 (eggs):

- **CA 11 (eggs)** is pulse-driven: one `emit 11 0.65` per egg creation, no maintenance. The field decays monotonically and marks "where eggs were recently laid".
- **CA 13 (Grendels)** is agent-driven: every living Grendel continuously contributes `0.5 × caMultiplier` per CA cycle to its current room. The field is a **live density map** of where Grendels are *right now*, with a trailing memory of where they were a few seconds ago (via the 0.001 loss rate).

A Grendel walking through a corridor leaves a scent trail that decays over roughly a thousand ticks. A Grendel standing still in a room pushes the CA 13 value in that room up to an equilibrium set by the emission/gain/loss balance, then the diffusion pushes that equilibrium outwards into adjacent connected rooms. A pack of Grendels in the same room stacks their emissions linearly — CA 13 scales with population density, giving creatures a direct sensory signal for "how many Grendels are here".

Because the emission is attached to the agent, not to the world, **death silently removes the emitter**: when a Grendel dies and its agent is destroyed, `HandleCA` stops contributing, the field drains at the loss rate, and the room's Grendel-scent fades to reflect only the survivors. This makes CA 13 a faithful real-time census channel for the Grendel population.

### The `-MyContribution` renormalisation

For CA indices bound to the creature's *own* category via CACL (CA 12 on a Norn, CA 13 on a Grendel, CA 14 on an Ettin), the SensoryFaculty detects the match and calls `GetRoomPropertyMinusMyContribution` before writing the brain input. The logic is:

```
value = room.caValues[caIndex];
value -= caMultiplier * agent.GetCAIncrease();   // 10 * 0.5 = 5.0
if (value < 0) value = 0;
else value = 1 - 1/(value + 1);                  // normalise to 0..1
```

This ensures a Grendel does not perceive itself as "a Grendel is here" — the neuron only fires in response to *other* Grendels' contributions. Because the raw CA value can reach saturation at 1.0 while the self-contribution in caMultiplier units is 5.0, the subtraction can easily drive the value negative; the clamp-to-zero ensures the Grendel simply reads "no other Grendels" when alone.

This subtraction only applies to the brain input on line 288. **The chemical on line 278 is always written with the unmodified value** — so on a solitary Grendel, chem 178 can still reach 1.0 (reflecting the Grendel's own emission) while the smell-lobe neuron correctly reads 0 ("no other Grendels").

### Inside-room vs outside-room behaviour

Same architectural rule as for all other CA-smell chemicals. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 178 tracks the world or decays in isolation:

- **Inside any room.** Chem 178 is overwritten every sensory tick with the room's live CA 13 value. The 1241-tick half-life is moot — the chemical tracks the field directly and the history is erased on every tick. Importantly, the creature also stops contributing to its previous room's CA 13 in this tick (if it has changed rooms) because `Agent.HandleCA` reroutes the emission on room change.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 178 follows pure first-order decay at rate 0.99944177 per tick. A creature that took a strong hit of Grendel-smell just before falling will retain residual chem 178 for ~23 s (half-life) before the next room-bound overwrite. A Grendel traversing such a gap also stops emitting CA 13 during this period — `Agent.HandleCA` requires a valid room ID to issue `IncreaseCAInput`.

### The Norn–Grendel antagonism pathway

CA 13 is the sensory substrate on which the classic Norn–Grendel antagonism is typically wired by breeders (and partially by the stock brain's learning dynamics, through unconditioned aversive reinforcement from encounters rather than through a hard-coded genome path). The smell-lobe neuron for `(4,2,0)` feeds into the concept/decision lobes alongside every other perceived stimulus, so a Norn that has been hurt by a Grendel develops an association between "Grendel smell present" and "pain/fear". Subsequent CA 13 spikes in any room the Norn enters then pre-activate avoidance drives via learned concept neurons.

Grendels, reading the same channel but with the `-MyContribution` branch, experience CA 13 as "other Grendels nearby" — feeding pack-recognition and social behaviours within their own race. The symmetry with CA 12 (Norns) and CA 14 (Ettins) means all three races have access to the same three race-density signals, with self-contribution filtered only on their own channel. A Norn can therefore simultaneously smell "Norn density (minus self)", "Grendel density (full)", and "Ettin density (full)", giving the brain a complete three-channel picture of who is around.

### What modders can do with CA 13

The channel is fully active and extensible in several directions:

- **Activate the inert receptor.** Re-wiring gene 132 from "Reaction / Locus 0" to a real locus (e.g. a stress chemical like Fear, a drive modulator like AngerIncrease, or an emitter that releases aggression on Grendel saturation) turns chem 178 into a first-class biochemistry input without touching the brain. This is the straightforward path for making Norns biochemically hate Grendels — set gene 132's locus to a locus that spikes Fear/Pain above threshold 212.
- **Change emission intensity.** Editing the `0.5` in the three `emit va91 0.5` lines (and the aged-egg direct `emit 13 0.5`) globally rescales Grendel-scent intensity. Raising it makes Grendels more conspicuous to every other creature's smell lobe; lowering it creates a stealthier Grendel profile.
- **Unify or segregate races.** Adding `cacl 4 2 0 12` alongside `cacl 4 1 0 12` would merge Norns and Grendels onto a single "creature" smell neuron. Conversely, adding per-species CACL lines (e.g. `cacl 4 2 3 <new CA>` for a Banshee Grendel) and re-targeting the emission via modified genus/species arithmetic lets breeders produce sub-races with distinct scents.
- **Seed artificial sources.** A CAOS gadget running `emit 13 <rate>` on itself becomes a "Grendel scent beacon" without any actual Grendel being present — useful for luring real Grendels via their smell-lobe associations, scaring Norns trained to fear the channel, or testing brain wiring without breeding a full Grendel population.
- **Monitor with CAOS.** `outs "grendel smell = " outv chem TARG 178` in a debug gadget inspects live Grendel-scent levels on a creature, making it easy to verify cross-race interactions, territorial dynamics, or migration patterns.

### Practical consequences

- **Chem 178 is a live Grendel population density signal.** Its value at any moment reflects how many Grendels are currently in or adjacent to the reader's room, weighted by diffusion and decay. Unlike CA 11 (eggs), it is not event-driven — it tracks the state of the living Grendel population in real time.
- **Grendels experience "other Grendels" with self filtered out.** Thanks to `GetRoomPropertyMinusMyContribution` on the brain path, a Grendel's smell lobe correctly distinguishes "I am alone" (value 0) from "I am with other Grendels" (value > 0). This is the sensory basis for pack behaviour and kin-recognition within the Grendel race.
- **Norns and Ettins see the full Grendel scent.** Cross-species perception is not filtered — a Norn or Ettin reads the unmodified CA 13 value (including any Grendels emitting nearby). This makes CA 13 a useful predator/rival signal for Norns and a peer/cohabitant signal for Ettins, symmetric with how Grendels perceive CA 12 (Norn) and CA 14 (Ettin).
- **Flooding chem 178 via `chem 178 255` has no biochemical effect in stock C3.** The only expressed receptor routes to an inert locus. The smell-lobe neuron does not update either because the sensory loop only writes on room-lookup (not on chem-set), so a manual injection is simply overwritten on the next tick by the room value.
- **Removing the CACL line blinds the brain but leaves the chemical.** A modder who removes `cacl 4 2 0 13` disconnects the Grendel smell-lobe neuron but still has chem 178 tracking CA 13; the channel becomes purely biochemical (and therefore invisible to the creature's behaviour unless the receptor is also rewired).
- **Dead Grendels stop contributing immediately.** When a Grendel dies and its agent is destroyed, the CA scheduler no longer calls `IncreaseCAInput` for that agent — the scent stops accumulating and drains from the field over ~1000 ticks. Corpses and pick-up-and-carry interactions with dead Grendels do not re-add to CA 13.
- **The aged-egg fallback is consistent for Grendels.** Unlike Norns (where the fallback's `else` branch mis-routes onto CA 14), Grendels hatched via the aged-egg path correctly receive `emit 13 0.5` via the `doif gnus eq 2` branch — so Grendel scent-configuration is uniform across both hatch paths.

### Summary

Chemical 178 — CA smell 13 (Grendel) — is the bloodstream mirror of the **Grendel-adult scent channel** in the Creatures 3 map CA system. Like CA 12 (Norn) and CA 14 (Ettin), CA 13 is powered by a **continuous per-agent emission**: every Grendel calls `emit 13 0.5` on itself at birth (`creatureBreeding.cos:140-142`, `creatureBreeding.cos:262-263` for aged-egg, and `Genetic splicer panel2.cos:293-301` via the `setv va91 11 / addv va91 gnus / emit va91 0.5` idiom) and thereafter continuously contributes to its current room's CA 13 field via `Agent.HandleCA` on every CA-13 cycle. The channel is bound to the smell lobe via `cacl 4 2 0 13` in `z_agent smells.cos`, with the `-MyContribution` branch suppressing self-perception in Grendels' own smell-lobe neuron but not in the chemical copy. Propagation uses the standard creature/food rate profile (gain 0.99, loss 0.001, diffusion 0.80 in air/indoor/water; 0.40 in soil; 0 in blocked/cold rooms). The chemical has a single vestigial receptor (gene 132 → "Reaction / Locus 0") that is structurally expressed but behaviourally inert in the stock genome, making it a natural extension hook for breeders who want to wire fear/aggression responses to Grendel proximity; no reactions, emitters, neuroemitters, or standard-organ genes reference chem 178. The practical result is a real-time Grendel-population-density signal that Norns, Grendels, and Ettins can all sense via their smell lobes — the sensory substrate for the classic Norn–Grendel antagonism, Grendel pack dynamics, and cross-species territorial awareness.
