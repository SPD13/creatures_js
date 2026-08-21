# 171 - CA smell 6 (protein)

Chemical 171 is the seventh of the **twenty "CA smell" chemicals** (chem 165 … chem 184) — the bloodstream mirror of **map cellular-automata channel 6**, which the engine's canonical naming table (`CASystem.js:31-36`, `biochemistry.json` row 8914) calls `"protein"`. Every sensory tick `SensoryFaculty.Update` (the sensory update routine) looks up the creature's current room, reads CA property `6`, and writes that float directly into biochemistry chemical `FIRST_SMELL_CHEMICAL + 6 = 171`. Unlike chem 170 (CA 5, the static hand-placed water beacon), CA 6 is an **emergent food-source signal** driven by live `emit 6 <intensity>` calls from two distinct classes of edible agent: ripe fruit (apples) and aquatic fauna (fish). In short: chem 170 says "a pond exists *that way*"; chem 171 says "there is something nutritious *that way*".

Architecturally, chem 171 differs from chem 170 in three key ways:

1. **Its sources are dynamic** — emission only occurs while a fruit is ripe-on-tree or a fish is alive-and-swimming; a rotting apple drops to emit 0.01 once when it falls, and a dead fish stops emitting entirely. The CA 6 landscape therefore shifts as the ecology runs (as fish are eaten, as apples are picked).
2. **It *is* wired into the smell lobe.** `z_agent smells.cos:4` runs `cacl 2 8 0 6`, mapping CA 6 to the smell-lobe neuron categorised as `(family 2, genus 8, species 0)` — the "fruit" category. So a creature standing near apples or near fish activates the same "fruit-food is nearby" neuron in its brain.
3. **Its per-room rates are tuned for wide, fast-spreading detectability** — gain 0.99 in air/water/indoors, loss only 0.001, diffusion 0.8. CA 6 is intentionally a *long-range* gradient: a creature on the other side of the map can still pick up a faint but non-zero reading from a tree of ripe apples.

At the creature's own chemistry level, chem 171 is — like its cousins chem 168 and chem 170 — a **reserved blank**. No standard genome reaction consumes it, and no receptor in `biochemistry.json` reads it. Its exclusive runtime behaviours are: (a) being overwritten each tick with the current room's CA 6 value while the creature stands inside any valid room, (b) being fed into the smell lobe neuron for fruit-category agents via the `cacl 2 8 0 6` mapping, and (c) decaying at a half-life of **1241 ticks** (~41 s at 30 tps) when the creature is outside all rooms.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **SensoryFaculty overwrite from room CA 6** | — (hard-coded in engine) | `SensoryFaculty.Update` (the sensory update routine) | Every sensory tick, `GetRoomIDForPoint(downFootPosition, roomId)` → `GetRoomProperty(roomId, 6, smellValue)` → `Biochemistry.SetChemical(171, smellValue)` | Per tick — direct assignment (not additive), tracks local room's CA 6 with one-tick lag |
| 2 | **`CHEM` CAOS injection** | — | — | `chem 171 <amount>` writes directly to the biochemistry. Overwritten on the next sensory tick if the creature is inside a room | Author-defined |
| 3 | **Ingestion of agents containing chem 171** | — | — | A `FOOD`/drug agent whose PRAY chemistry or agent-defined chemical table includes chem 171 will inject it on bite/eat. Same overwrite caveat as (2) | Author-defined |

### Emitters of CA 6 — what actually fuels the room field

Unlike CA 5 (which has exactly 10 fixed invisible emitters), CA 6 is fuelled by **living edible agents** running `emit 6 X` directly from their own event scripts. Two agent families contribute:

| Agent | Script location | Classifier | Trigger | Intensity | Meaning |
|-------|-----------------|------------|---------|-----------|---------|
| **Ripe apple** (on tree) | `apples.cos:48-58` (`scrp 2 8 2 4` — activate script) | `2 8 2` (family 2, genus 8 = fruit, species 2) | Once when the apple turns ripe (`ov00 == 0`) | **0.5** (single emission, sustained by the CA field's near-zero loss) | "A ripe apple is here" — the strongest fruit signal |
| **Fallen apple** (on ground) | `apples.cos:61-123` (`scrp 2 8 2 9` — timer script, when the growing apple finally drops) | `2 8 2` | Once when the apple detaches from the tree and lands | **0.01** (50× weaker than on-tree) | "Old fruit has fallen here" — a much weaker signal, rewarding creatures who reach the tree before the fruit drops |
| **Handle fish** | `handlefish.cos` (6 locations: init + several swim/behaviour scripts) | `2 15 16` (family 2, genus 15 = fish) | Every tick during live swimming behaviour | **0.15** (sustained) | "A live fish is here" — moderate continuous signal. One script briefly spikes to **0.25** (line 392) during an attention-grabbing action |
| **Angel fish** | `angel fish.cos:231, 715` | `2 15 14` | Every tick during live swimming behaviour | **0.15** | Same |
| **Clown fish** | `clown fish.cos:24, 231, 719` | `2 15 ?` (clown classifier) | Every tick during live swimming behaviour | **0.15** | Same |
| **Neon fish** | `neon fish.cos:790` | `2 15 ?` | Every tick during live swimming behaviour | **0.15** | Same |

There are **no `altr room targ 6`** calls anywhere in the bootstrap, and no hand-placed invisible emitters for CA 6. The entire CA 6 field is therefore an **ecology-driven** emergent signal: as fish die (eaten by predators, expired from old age, killed by pollution) and as apples are harvested by Norns, the CA 6 field deflates in those regions. Fresh apples ripening and new fish spawning re-energise it.

The asymmetry between on-tree apples (0.5) and fallen apples (0.01) has two biological-designer implications:

1. **The first creature to reach a ripe apple tree detects it from much further away** than a latecomer encountering only rotten windfalls. This models a real food-gathering urgency — ripe fruit is a valuable signal.
2. **Fallen apples are a weak "hint" signal** — creatures that happen to be close may find them, but they do not propagate the smell across the whole map. This prevents a forest-full of expired fruit from permanently saturating the map at a misleading high level.

### Per-room-type diffusion rates

From `!map.cos:1665-1980`, CA 6 has the **same rate profile in all active room types**, in sharp contrast to CA 5's aggressive indoor/soil attenuation:

| Room type | gain | loss | diffusion | Behaviour for CA 6 |
|-----------|------|------|-----------|--------------------|
| 0 (outdoor air) | 0.99 | 0.001 | 0.80 | Nearly full reception, near-permanent retention, wide diffusion — CA 6 spreads freely through open air |
| 1-4 (various indoor) | 0.99 | 0.001 | 0.80 | Same — CA 6 passes through indoor rooms without attenuation |
| 5-7 (soil variants) | **0.40** | 0.001 | 0.80 | Reduced reception (only 40 %): soil rooms accept CA 6 less readily from neighbouring rooms, but retain what they do receive for a long time. This creates a subtle "damping" effect as fruit-smell spreads underground |
| 8-9 (water/ocean) | 0.99 | 0.001 | 0.80 | Full reception — critical because fish are the primary CA 6 emitters inside water bodies; the ocean needs to carry the fish signal |
| 10 (indoor) | 0.99 | 0.001 | 0.80 | Same |
| 11-15 (blocked/cold) | 0.00 | 0.00 | 0.00 | No reception, no diffusion — cold zones are dead regions for protein smell |

The key pattern is **very low loss (0.001) combined with high diffusion (0.8) in every active room type**. This is the opposite of CA 5's design: CA 6 *wants* to spread far. An apple tree's emission accumulates in its room (gain 0.99, loss 0.001 ≈ steady-state ×10⁴ of the emission rate if sustained), bleeds into neighbouring rooms at 80 % rate per tick, and loses almost nothing as it propagates. The result is a **long gradient** reaching across the entire outdoor biome of the Shee ship, with the peak tightly centred on live food sources. Creatures many rooms away from an apple tree still read a faint, usable CA 6 value — ideal for gradient-following "I can smell food in this direction" navigation even in the absence of direct line-of-sight.

The soil-room reception drop to 0.40 is an interesting detail: it means a creature walking through a soil-floor tunnel between two surface rooms experiences a mild dip in the CA 6 gradient, but once it exits back into an air room the signal returns to strength. This prevents the huge connected soil-tunnel network beneath the surface from becoming a high-capacitance reservoir that would flatten gradients to the point of uselessness.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **Smell-lobe neuron write — "fruit" category** | — (hard-coded pipeline; CACL binding in `z_agent smells.cos:4`) | `brain.SetInput("smel", neuronId, smellValue)` where `neuronId = AgentManager.GetCategoryIdFromSmellId(6)` | `cacl 2 8 0 6` maps CA 6 → the smell-lobe neuron whose category is `(family 2, genus 8, species 0)` — the *fruit* category. Any agent of genus 8 (apples, pumperspikel, farmed fungi species 5…) classifies into this neuron | Non-zero chem 171 fires the fruit-smell neuron in the smell lobe (lobe index 14, 40 neurons). This is the creature's brain-level "I smell food" input, drivable into association learning — e.g. learning to push an apple tree when the fruit neuron + hunger drive coincide |
| 2 | **Passive decay** (only when creature is outside any room) | — | — | Half-life **1241 ticks** (decay rate 0.99944177, "Long" speed) | When `GetRoomIDForPoint` fails, the SensoryFaculty overwrite is skipped and chem 171 decays. Inside a room this decay is irrelevant — the value is replaced every tick |
| 3 | **No genome-defined reaction or receptor** | — | — | — | Unlike the staple creature chemicals (glucose, oxygen, ATP), chem 171 has **no entry in `biochemistry.json`'s `reactions` or `receptors` arrays**. The only path from CA 6 to behaviour goes through the brain, not the body |
| 4 | **Author-defined receptors** | — | Any custom receptor gene authored against chem 171 | Threshold / gain / locus author-defined | A breeder can add receptors that read chem 171 to produce "food smell → drool", "food smell → hunger satiation anticipation", or other direct biochemical responses. None exist in the standard genome |

**No genome-defined reaction, receptor, or emitter in the standard C3 genome touches chemical 171 directly.** Its influence on creature behaviour is entirely mediated through the brain's smell lobe via the `cacl 2 8 0 6` CACL mapping.

## Role in Game Mechanics

### CA 6 is the only "CA smell" channel wired into both ecology and creature brain

Among the five lowest CA indices (0 sound, 1 light, 2 heat, 3 water/rot, 4 nutrient, 5 water2/beacon), only CA 3 has active `altr room targ`-driven sources and none are wired into the smell lobe. CA 5 has emitters but no smell-lobe wiring either. **CA 6 is the lowest-numbered CA channel that both has live emitters and maps into the creature's brain**, so it is the first chemical in the `chem 165-184` block that actually does anything perceptible to a Norn.

```
   Ripe apples (emit 6 0.5 once on ripening, retained by 0.001 loss)
   Fallen apples (emit 6 0.01 once on falling)
   Live fish: handlefish, angel, clown, neon (emit 6 0.15 continuously)
          │
          ▼
   Map room CA[6]  ←──── diffuses between rooms at rate 0.8
          │                ───LOW LOSS (0.001) everywhere active
          │                ───REDUCED GAIN in soil (0.40)
          │                ───BLOCKED in cold zones (types 11-15)
          │                ───LONG GRADIENTS across outdoor biome
          │
          ├─────► Fauna AI: (no scripts consume CA 6 directly)
          │
          │  SensoryFaculty.Update() every tick
          │  (the sensory update routine)
          ▼
   chem 171 (creature bloodstream) ──► receptors?  → NONE in default genome
                                   ──► reactions?  → NONE in default genome
          │
          │  (Parallel path, same loop)
          ▼
   brain "smel" neuron[AgentManager.GetCategoryIdFromSmellId(6)]
          → category (2, 8, 0) — "fruit" neuron (bound by cacl 2 8 0 6)
          → FIRES whenever any CA 6 is present in the current room
          → drivable through association lobe into hunger-satisfying behaviours
```

### The fish-smells-like-fruit design decision

A creature standing near live fish in the ocean reads a significant chem 171 value — and this value lights up the **fruit-category** smell-lobe neuron, because CA 6 is mapped to `(2, 8, 0)`. From the creature's brain's perspective, **fish and apples are indistinguishable as smells**: both trigger the same neuron. This is deliberate design on two levels:

1. **Category economy.** The smell lobe has only 40 neurons. Creatures need a "food is nearby" neuron more than they need separate "fruit vs fish" neurons. Grouping all edible-protein sources under one smell-lobe category preserves neuron budget for other categories (Norn-smell, Grendel-smell, etc., which have their own CA indices 12 and 13 respectively).
2. **Learning generalisation.** A creature that learns "pushing the fruit-smell source satisfies hunger" will generalise that behaviour to fish, because they register identically. This shortcuts the otherwise expensive process of learning each food type separately.

The cost is that creatures cannot form fish-specific associations at the smell level. If a fish is toxic and an apple is not, both still smell the same — only post-ingestion taste/stim feedback can distinguish them.

### On-tree vs fallen apple intensities — a gameplay incentive gradient

The ratio `0.5 / 0.01 = 50×` between ripe-apple and fallen-apple emission is deliberate and has meaningful consequences:

- A ripe apple on a tree produces a detectable gradient reaching across most of the Shee ship's garden biome. A hungry Norn anywhere in the garden can smell it and walk toward it.
- A fallen apple produces only a very localised bump — a Norn has to be in the same room or immediately adjacent to notice it.

This encourages Norns to harvest fruit while it is still ripe, rather than waiting for windfall. In biological terms, this matches the real-world ecological pattern where ripe fruit is far more aromatic than fallen fruit (which has begun to ferment but lost its volatile aromatic signal). The 50× ratio is also a gameplay incentive: the player observes Norns migrating to fresh fruit, which is satisfying to watch, and the game's "thriving garden" aesthetic is reinforced.

The on-tree emission happens **once** (`doif ov00 eq 0 / emit 6 0.5 / setv ov00 1`), not per-tick. The CA field retains this single pulse because of the 0.001 loss rate: a single 0.5 emission stays at approximately full strength for hundreds of ticks before decaying. This is efficient — no per-tick overhead for every apple tree in the garden.

### Fish continuously emit — why the difference?

Fish use `emit 6 .15` in their **main tick/behaviour scripts**, meaning the call fires every tick while the fish is alive and executing the behaviour. This gives them a lower-per-tick intensity (0.15 vs the apple's 0.5) but a continuous renewal. The design reason is that fish *move* — a fish swimming from one room to the next needs the CA 6 field to stay with it. Continuous emission means wherever the fish swims, CA 6 builds up locally; when the fish leaves, the old room decays away over hundreds of ticks while the new room accumulates. A single-pulse model (like apples) would leave phantom fish-smells behind in empty rooms.

The brief spike to `emit 6 .25` in `handlefish.cos:392` is during a special "thrashing/displayed" action where the fish is deliberately making itself more conspicuous. This is a little sub-grammar of behaviour: the ecology tells creatures when a fish is doing something worth paying attention to.

### Inside-room vs outside-room behaviour for chem 171

Same architectural rule as for chem 168 and chem 170. The `GetRoomIDForPoint(creature.GetDownFootPosition(), roomId)` check decides whether chem 171 tracks the world or decays in isolation:

- **Inside any room.** Chem 171 is overwritten every sensory tick with the room's live CA 6 value. The 1241-tick half-life is moot.
- **Outside all rooms** (mid-air during a fall, in an unmapped meta-room gap). The SetChemical overwrite is skipped and chem 171 follows pure first-order decay at rate 0.99944177 per tick.

Because CA 6 diffuses widely across the active biomes, chem 171 on a Norn in normal play is **rarely exactly zero** — even in the centre of the Shee ship's corridors, faint traces from distant apple trees will usually be present. The value only drops to 0 deep inside cold zones (room types 11-15), inside unmapped regions, or when the creature is momentarily airborne between rooms.

### The `-MyContribution` subtraction and why CA 6 skips it

For CA indices that are bound to the creature's own category via CACL (e.g. a Norn looking at CA 12 = Norn smell via `cacl 4 1 0 12`), the SensoryFaculty subtracts the creature's own emission from the value written to its smell lobe, using `GetRoomPropertyMinusMyContribution`. This prevents a Norn from being misled by its own smell. For CA 6 this branch is never taken — creatures do not `emit 6` on themselves (Norns are family 4, not family 2 genus 8). The full room value flows into chem 171 and into the fruit-smell neuron.

### Practical consequences

- **`chem TARG 171` is a live "food-in-this-room" indicator.** A CAOS script querying chem 171 reads the current room's CA 6 value (with one-tick lag). A non-zero reading means at least one emitter (apple tree, fallen fruit, or live fish) is currently contributing to the field within diffusion reach. This is useful for scripting creatures or agents that need to "know" whether food exists nearby without inspecting the entire agent list.
- **The "food map" is dynamic.** Unlike CA 5 (static water locations), CA 6 hotspots follow the living ecology. A scripting agent that monitors chem 171 gradients can infer which regions of the map have active food production at a given moment.
- **Harvesting matters.** When a Norn (or the player) takes and eats an apple, the emitter agent is destroyed (`kill ownr` at `apples.cos:119`) — the single emission pulse remains in the CA field and decays over the following minutes, so the "ghost smell" lingers. Creatures arriving right after a harvest still detect the region as "recently food-rich", but the signal gradually fades. This models realistic "food trail" behaviour.
- **The smell-lobe wiring makes chem 171 the primary "hunger satisfier learning" input.** The fruit-category neuron in the smell lobe is one of the most behaviourally relevant smell inputs for a typical Norn. Via the association lobe, creatures commonly learn "push the thing that makes the fruit-smell neuron fire strongly → feel less hungry". This is one of the foundational learning loops of the C3 creature lifecycle.
- **Flooding chem 171 via `chem 171 255` has no direct biochemical effect on a standard creature**, but it *will* strongly activate the fruit-smell neuron on the next brain tick — so the creature will behave as if it is smelling food extremely intensely. The sensory overwrite restores it on the following tick if the creature is in a room, so the effect is transient.
- **A thirst/hunger-relief-from-nearby-food gene is a one-receptor change.** Because no existing receptor uses chem 171, a breeder can add a single receptor locus — e.g. `Drive: Hunger − Chemical 171 (food smell) → reduce Hunger` — to make creatures feel partially sated simply by standing near food. This would be a physiological shortcut bypassing the brain-level learning loop, potentially useful for building tame/well-fed creatures quickly.
- **Breeding out the sensory pathway is not possible.** The SetChemical write in the sensory loop is engine-hard-coded (not a gene), so no genetic mutation can stop chem 171 from tracking room CA 6. The only way to make it "do nothing" is to be immune to the fruit-smell neuron via brain-lobe genetics, which is a much more invasive change than modifying a single receptor.
- **Adding new food agents is straightforward.** A modder creating a new fruit or fish agent need only add `emit 6 0.15` (or whatever intensity matches the design) to the agent's tick script; its food contribution will automatically register in every nearby creature's fruit-smell neuron without any brain-level modification required.
- **CA 6 does not have a `GetRoomPropertyMinusMyContribution` issue for creatures** — but if a creature were modded to `emit 6`, they would perceive their own food smell as ambient. This is a non-issue in the default game because Norns never emit on CA 6.

### CA 3 vs CA 5 vs CA 6 side-by-side

| Aspect | CA 3 (chem 168) | CA 5 (chem 170) | CA 6 (chem 171) |
|--------|-----------------|-----------------|-----------------|
| Naming | `water` / `water` | `water2` / `water` | `protein` / `protein` |
| Source mechanism | Discrete `altr room targ 3 <amount>` pulses | Continuous `emit 5 1` from 10 fixed agents | `emit 6 X` from ripe fruit + live fish |
| Source count | ~30+ scripts | Exactly 10 hand-placed emitters | Every apple tree, every live fish (dozens, dynamic) |
| Source location | Wherever fauna die or fruit rots | Three fixed pond/oasis clusters | Wherever live food exists — *dynamic* |
| Outdoor diffusion | 1.0 (full) | 0.1 (choked — stays local) | 0.8 (wide) |
| Outdoor loss | 0.05/tick | 0.10/tick | 0.001/tick (very persistent) |
| Indoor loss | 0.9/tick (fast evaporation) | 0.5/tick | 0.001/tick (persistent) |
| Soil loss | 0.001-0.01 (pools) | 0.5 (no pooling) | 0.001 (pools) |
| Ocean loss | 0.0001 (near-permanent) | 0.001 (near-permanent) | 0.001 (near-permanent) |
| Behavioural meaning | "Things have died/rotted near here" | "A body of water is *that way*" | "Live food (fruit or fish) exists *that way*" |
| Used by plants / fauna? | Yes — many plants | Yes — mosquitoes, gnats, grazer, gnarler | No direct-reading scripts in bootstrap |
| Used by creatures (smell lobe)? | No (no `cacl … 3`) | No (no `cacl … 5`) | **YES — `cacl 2 8 0 6` maps it to the fruit neuron** |
| Author-modifiability | Add receptor for "rotting smell triggers fear" | Add receptor for "near water relieves thirst" | Add receptor for "food smell pre-satiates hunger" |

### Summary

CA smell 6 (protein) is the bloodstream mirror of map CA index 6, the **living-food beacon channel**. It is fuelled not by invisible hand-placed emitters (like CA 5) nor by discrete death pulses (like CA 3), but by real-time `emit 6` calls from live edible agents: ripe apples broadcast a single strong 0.5 pulse on ripening (decaying slowly due to the field's 0.001 loss rate), fallen apples drop a weak 0.01 landmark, and the four fish species (handle, angel, clown, neon) emit a continuous 0.15 trail wherever they swim. The per-room-type rate table is uniform and permissive — gain 0.99, loss 0.001, diffusion 0.8 in every active room — so CA 6 forms long, smooth gradients reaching across the outdoor biome. Critically, CA 6 is **the only one of the first seven CA smell channels that the default bootstrap wires into the creature brain**: `z_agent smells.cos:4` runs `cacl 2 8 0 6`, mapping CA 6 to the smell-lobe neuron for fruit-category agents `(2, 8, 0)`. Consequently, chem 171 is the foundation of one of the most important learning loops in the Norn lifecycle — the "food smell → hunger satisfaction" association — and every Norn in the world experiences its flavour whenever it stands near apples or fish. At the biochemistry level the chemical itself remains inert (no default reaction or receptor consumes it), so the whole behavioural pathway runs through the brain lobe, leaving chem 171 available as a clean scripting hook for any author who wants to add direct biochemical responses to food proximity.
