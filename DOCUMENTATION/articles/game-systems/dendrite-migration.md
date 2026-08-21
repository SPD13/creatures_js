# Dendrite Migration

Dendrite migration is how the Creatures brain **reuses synaptic capacity**: instead of letting the network grow unbounded, each tract keeps a fixed pool of dendrites, and the weakest ones are continuously unplugged from stale source neurons and replugged into neurons that are actively demanding new connections. This is the mechanism behind per-individual friend-or-foe learning, the fading of old habits, and the brain's ability to keep learning new associations with a bounded synaptic budget.

## Why Migration Exists

A creature's brain has a fixed neuron count per lobe and a fixed dendrite budget per tract — both set at birth from the genome and never grown or shrunk. Without migration, this would be a hard cap on how many distinct associations the creature could ever learn: once every dendrite was committed, no new connection could form even if the old ones were useless.

Migration relaxes that cap by treating dendrites as a **reallocatable resource**. Every brain tick, each migrating tract identifies its weakest dendrites (the ones carrying the least information, measured by a dedicated strength variable), and rewires them onto whichever source neurons are currently signalling "learn about me." That signal is **Nerve Growth Factor (NGF)** — neuron state variable 7, written by other parts of the engine (faculties, SVRules, lobe updates) whenever a concept "wants" more dendrites.

The result is a brain that continuously reclaims dead synapses and moves them toward whatever is currently relevant. An old habit that is no longer being reinforced will have its dendrites taken away and given to a new friend, a new smell, or a new decision concept.

## When Migration Happens

Migration is **per-tract** and gated by a single genome-read boolean, `dendritesAreRandomlyConnectedAndMigrate`, set in `Tract.js:151`:

```js
this.dendritesAreRandomlyConnectedAndMigrate = genome.getBool();
```

When the flag is `false`, the tract's dendrites are wired by a systematic pattern at birth and never move — that's the common case for hard-wired topologies (e.g. drive → reinforcement pathways). When it is `true`, the tract's dendrites start out on random source/destination pairs, and the migration machinery runs every time the tract updates.

The trigger lives inside `Tract.doUpdate()` at `Tract.js:472-516`. On every brain tick that the tract is scheduled to process:

1. **Migrate first**: if the migration flag is on, call `migrateWeakDendrites()` — this drains the "weakest dendrites" list built on the *previous* tick and rewires those dendrites now.
2. **Process dendrites**: run the init rule (optionally), the update rule, and `processRewardAndPunishment` (see [Reinforcement Learning Pipeline](reinforcement-learning-pipeline.md)).
3. **Rebuild the weak list**: for each dendrite processed, `updateWeakDendritesList(dendrite)` considers it for inclusion in the next tick's migration pool.

So migration is **continuous but lagged by one tick**: weakness is detected during tick N's dendrite pass, and the rewiring happens at the start of tick N+1.

## What Counts as "Weak"

The weakness criterion is deliberately **not** STW or LTW. Those weights fluctuate rapidly with reinforcement and would give false positives. Instead, dendrites carry a dedicated strength variable at `DendriteVar.STRENGTH_VAR` (index 7 of the 8-slot weight vector). The tract's SVRules can write whatever they want into that slot — typically it tracks long-term reliability of the source→destination association.

`updateWeakDendritesList` at `Tract.js:567-599` maintains a **bounded, sorted buffer** of the weakest dendrites in the tract. Its key invariants:

- Size is capped at `maxMigrations` (typically 4 — also genome-configurable).
- Entries are kept sorted by strength, weakest first.
- A fast-reject path skips dendrites whose strength is already above the current strongest entry in a full list — this keeps the per-tick cost bounded.
- At the end of each update pass, the list holds the N weakest dendrites seen during this tick; they are consumed next tick.

The list is cleared after `migrateWeakDendrites` runs, whether or not any actual migration happened.

## How the New Source Neuron Is Picked

`migrateWeakDendrites()` at `Tract.js:604-648` is the core routine:

```js
// 1. Find the destination neuron with the highest NGF
let highestDstNGF = -1.0;
let highestDstNGFNeuron = null;
for (const neuron of this.dst.neurons) {
    const ngf = neuron.states[this.dst.ngfIndex];
    if (ngf > highestDstNGF) {
        highestDstNGF = ngf;
        highestDstNGFNeuron = neuron;
    }
}
if (highestDstNGF <= 0.0) { this.weakDendrites = []; return; }
```

The algorithm proceeds in three stages:

1. **Pick one destination target**: scan every destination neuron, keep the one with the highest NGF. If that maximum is `0` or negative, nothing in the destination lobe wants new connections — bail out and clear the weak list without migrating anything.
2. **Pick N source candidates**: `findNNeuronsWithHighestGivenState` at `Tract.js:653-690` walks the source lobe's neurons and returns the top N (where N = number of weak dendrites) ranked by NGF. This is the list of neurons "calling for connection."
3. **Attempt each rewiring**: for each source candidate whose NGF is strictly greater than zero, call `attemptMigration(dst, src, ngfIndex)` to actually move a weak dendrite onto that source.

Note that each tract independently reads its own **`src.ngfIndex`** and **`dst.ngfIndex`** from the genome at construction time (`Tract.js:155-156`). Different tracts can watch different neuron state variables for migration signals — it doesn't have to be literal NGF in index 7. This is why a single genome can have several overlapping migration systems targeted at different brain regions.

## Rewiring a Dendrite

`attemptMigration` at `Tract.js:695-730` is where a dendrite is actually moved from one `(src, dst)` pair to another:

```js
// Skip if this connection already exists
if (this.getDendriteIfExistingFromTo(sourceNeuron, destNeuron)) return true;

for (let i = 0; i < this.weakDendrites.length; i++) {
    const dendrite = this.weakDendrites[i];
    const dendriteStrength = dendrite.weights[this.dendriteStrengthSVIndex];
    const sourceNGF = sourceNeuron.states[sourceStateIndex];
    if (dendriteStrength < sourceNGF) {
        dendrite.srcNeuron = sourceNeuron;
        dendrite.dstNeuron = destNeuron;
        this.weakDendrites.splice(i, 1);
        if (this.runInitRuleAlways) dendrite.clearWeights();
        else dendrite.initByRule(this.initRule, this);
        return true;
    }
}
```

Two important details:

- **A dendrite only migrates if its strength is strictly less than the source's NGF.** This is the "auction" rule: a neuron that loudly demands connections (high NGF) can only bid successfully against dendrites that are weaker than its demand. A strong dendrite can't be stolen away by a weak NGF signal.
- **After rewiring, the weights are reset**. If the tract has `runInitRuleAlways` set, `clearWeights()` zeros the entire 8-slot weight vector. Otherwise, the tract's `initRule` SVRule is re-run with the new source/destination state variables, giving the genome control over the initial weight configuration of a freshly migrated dendrite. Either way, **the history of the old connection is discarded** — LTW, STW, and every other weight slot are wiped. The migrated dendrite is effectively a brand new connection.

## NGF: The Growth Signal

NGF is a loan-word from biological neuroscience, borrowed in name only — here it's just a neuron state variable (slot 7) that other engine code writes to when it wants more dendrites to flow toward a particular neuron. Some concrete writers:

- **LobeFaculty / Tract SVRules**: lobe update rules can set NGF on any neuron during `Lobe.doUpdate()` based on activity, surprise, reinforcement, or genome-defined conditions.
- **SensoryFaculty** (friend-or-foe case): when a new individual is encountered, the sensory faculty writes `NGF_VAR = 1.0` onto the corresponding `forf` slot and then flags concept-lobe neurons to do the same, so tracts connecting concepts to the `forf` lobe will migrate dendrites onto the new individual's slot.
- **Instinct processing**: during dream sleep, instinct replay can elevate NGF on the neurons involved in the instinct so that migrating tracts wire them up correctly.

NGF is read during migration and nowhere else in the weight-update path. It is not itself an input to the decision lobe; it is purely a "build me some wiring" signal.

## Friend-or-Foe: The Canonical Example

The friend-or-foe lobe (`forf`) is the most visible user of migration and is worth walking in full. See the [Friend-or-Foe Lobe Architecture](friendorfoe-lobe-architecture.md) article for the complete flow.

When a creature meets a new Norn it has never seen before:

1. `SensoryFaculty.addFriendOrFoe` allocates a free slot in the `forf` lobe to that individual and seeds affection based on kinship.
2. `brain.setNeuronState('forf', slot, NGF_VAR, 1.0)` — the new slot requests wiring.
3. `flagConceptNeuronsForMigration(slot, agent)` — concept-lobe neurons representing "action categories with this individual" (e.g. "hit Norn," "kiss Norn") also get their NGF raised.
4. On the next brain tick, any tract with `dendritesAreRandomlyConnectedAndMigrate = true` that connects `concept → forf` (or similar) sees the NGF demand, picks its weakest dendrites, and rewires them to connect to the new individual's slot.
5. Going forward, reinforcement learning on those freshly rewired dendrites can build **individual-specific opinions**: "hitting *Alice* is bad" as distinct from "hitting random Norns is bad."

Without migration, the `forf` lobe's fixed 40 slots would have fixed wiring and the creature could only hold one global "norn is bad" weight, not per-individual distinctions. Migration is what makes the relationship lobe feel responsive and personal.

## Interaction with STW and LTW

Migration and short-term/long-term reinforcement are **orthogonal mechanisms that sometimes compete**:

- **Reinforcement** (via `processRewardAndPunishment`, see [Reinforcement Learning Pipeline](reinforcement-learning-pipeline.md)) writes STW directly in response to reward/punishment chemicals. LTW follows STW slowly via the STW↔LTW consolidation rule in `SVRule.js:1298-1309`.
- **Migration** ignores STW and LTW entirely; it watches the STRENGTH_VAR (slot 7), which is typically set by an SVRule that reflects *consolidated* learning over time, not instantaneous reinforcement.
- **When a dendrite migrates, STW and LTW are erased.** A dendrite that was recently reinforced but has low long-term strength (because the reinforcement hadn't had time to consolidate) is vulnerable to being migrated away and losing that learning.

The practical consequence is that **short-term, fleeting associations are fragile**, while **consolidated, long-term associations are migration-proof**. This is intentional: it matches the creature's capacity budget to concepts that have proven useful over time, and recycles the rest.

A few other interactions to be aware of:

- **`clearActivity()`** at `Tract.js:521-525` resets STW to LTW for every dendrite but does not move them. This is called at birth, on load, and at some lifecycle transitions — it doesn't interact with migration directly.
- **The init rule** runs on a freshly migrated dendrite. If the init rule is written to seed STW and LTW based on source/destination state variables, a migrated dendrite starts with a "best guess" weight rather than zero.
- **`updateRule`** runs on every dendrite every tick, including freshly migrated ones. So the very next tick after a migration, the dendrite participates normally in Hebbian plasticity.

## Observable Gameplay Effects

Migration is silent from the player's point of view — there's no visual indication — but it shapes several behaviours that players do notice:

- **Old habits decay if not maintained.** A creature that was reliably trained to pick up balls will eventually "forget" if you stop rewarding ball-pickups, because the dendrites encoding that association will have their strength decay, enter the weak list, and get migrated away to whatever is currently active.
- **New friends and enemies are learnt quickly.** Meeting a new Norn sets off a cascade of NGF in the `forf` lobe and its upstream concept tracts, and within a few ticks the creature has dedicated synapses for that individual. This is why creatures can form "personal" relationships instead of treating everyone the same.
- **Selective attention focusing.** Tracts that connect perception to attention migrate dendrites toward whatever has been highlighted by NGF, so the creature's attention can re-prioritise over time.
- **Unused concepts fade.** A smell the creature hasn't encountered in a long time will stop winning NGF bids and its dendrites will be taken by more relevant inputs. This frees the brain from carrying around dead weights.
- **Bounded learning capacity.** No matter how long a creature lives, it cannot accumulate infinite dendrites — the pool is fixed, and the oldest-least-reinforced connections are always the ones paying the cost of new learning.

A subtle implication: if you train a creature heavily early in its life, and then stop, the behaviours will eventually be replaced. Deep training that lasts requires **repeated reinforcement** so that the consolidated STRENGTH_VAR keeps the dendrites out of the weak list.

## Engine Alignment

The JS implementation is a line-for-line port of the original engine's `Tract` migration methods:

| Function | JS |
|---|---|
| `MigrateWeakDendrites` | `Tract.js:604-648` |
| `UpdateWeakDendriteList` | `Tract.js:567-599` |
| `FindNNeuronsWithHighestGivenState` | `Tract.js:653-690` |
| `AttemptMigration` | `Tract.js:695-730` |
| NGF > 0 threshold | `Tract.js:641` |
| Strength < NGF rule | `Tract.js:710` |
| Weight reset after migration | `Tract.js:719-723` |

No divergences have been identified. Behaviour is expected to match the original C3 engine exactly for any tract configured with the migration flag.

---

## Key File References

### JS Rebuild

- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:151` — `dendritesAreRandomlyConnectedAndMigrate` flag read
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:155-156` — `src.ngfIndex` / `dst.ngfIndex` read
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:472-516` — `doUpdate` orchestrating migration and dendrite processing
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:567-599` — `updateWeakDendritesList`
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:604-648` — `migrateWeakDendrites`
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:653-690` — `findNNeuronsWithHighestGivenState`
- `Rebuild/Main_Game/src/engine/creature/brain/Tract.js:695-730` — `attemptMigration`
- `Rebuild/Main_Game/src/engine/creature/brain/Dendrite.js:7-46` — `Dendrite` class with `srcNeuron`, `dstNeuron`, `weights`, `clearWeights`, `initByRule`
- `Rebuild/Main_Game/src/engine/creature/brain/BrainConstants.js` — `NeuronVar.NGF_VAR = 7`, `DendriteVar.STRENGTH_VAR = 7`

## See Also

- [Reinforcement Learning Pipeline](reinforcement-learning-pipeline.md) — how STW and LTW are modified by reward/punishment chemicals; complementary mechanism to migration.
- [Friend-or-Foe Lobe Architecture](friendorfoe-lobe-architecture.md) — the primary consumer of migration, using NGF to build per-individual relationship wiring.
- [Brain Overview](brain-overview.md) — high-level introduction to the lobe/tract/dendrite model.
- [Decision Lobe Architecture](decision-lobe-architecture.md) — the downstream consumer whose concept-to-action mappings are shaped by migrated dendrites.
