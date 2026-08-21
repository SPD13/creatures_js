# Vision System

The **vision system** is the engine-side pipeline that scans the game world, selects one representative agent per category, and feeds normalized displacement values into the brain's input lobes. It bridges the gap between raw world state (thousands of agents with positions) and the creature's neural perception (40 category slots with direction signals).

The vision system runs inside the **SensoryFaculty** on every creature tick, but only when the creature is alert (not asleep, unconscious, or dead). It processes all 40 categories in two sequential loops — first selecting representatives, then writing brain inputs.

**Key stats**: 40 categories, 512-pixel visual range, 5 selection algorithms, 2 brain lobes written (`visn` + `elvn`).

---

## Architecture

The complete vision pipeline flows from world agents to brain input neurons:

```
                    VISION SYSTEM PIPELINE

  World Agent List
         │
         ▼
  ┌─────────────────────────────────┐
  │   For each category (0..39):    │
  │                                 │
  │   1. Persistence Check          │
  │      noun neuron > 0.20?        │──── YES ──► keep existing agent
  │      + still visible?           │
  │            │ NO                 │
  │            ▼                    │
  │   2. FindBySightAndFGS          │
  │      query by classifier        │
  │            │                    │
  │            ▼                    │
  │   3. filterByVisualRange        │
  │      ≤512px, alive, !self,      │
  │      !attrInvisible             │
  │            │                    │
  │            ▼                    │
  │   4. Algorithm Dispatch         │
  │      (0-4, from catalogue)      │
  │            │                    │
  │            ▼                    │
  │   myKnownAgents[category]       │
  └─────────────────────────────────┘
         │
         ▼
  Carried Object Override
  (always wins its category slot)
         │
         ▼
  ┌─────────────────────────────────┐
  │   For each category (0..39):    │
  │                                 │
  │   dx = agent.x - creature.x    │
  │   dy = agent.y - creature.y    │
  │                                 │
  │   visn[i] = clamp(dx/512, ±1)  │
  │   elvn[i] = clamp(dy/512, ±1)  │
  └─────────────────────────────────┘
         │
         ▼
  Brain Input Lobes (visn, elvn)
         │
         ▼
  Attention Lobe ──► IT Agent ──► Detail Lobe
```

---

## Visibility Rules

Before an agent can be selected as a category representative, it must pass four visibility checks:

| Rule | Description |
|---|---|
| Range | Euclidean distance from creature centre to agent centre must be ≤ 512 pixels |
| Alive | Dead agents are filtered out (`isAlive()` check) |
| Not self | The creature never sees itself |
| Not invisible | Agents with `attrInvisible` (attribute bit 4 / `0x10`) are excluded |

Distance is measured between bounding box centres using `getCentre()`, not top-left positions. The persistence check uses squared distance (no `sqrt`) for efficiency; the candidate filter uses actual Euclidean distance.

```javascript
// Persistence check — squared distance (fast)
const distSq = dx * dx + dy * dy;
return distSq <= visualRange * visualRange;

// Candidate filter — Euclidean distance
const dist = Math.sqrt(dx * dx + dy * dy);
return dist <= this.visualRange;
```

---

## Category Representative Selection

The vision system uses two sequential loops to select representatives. This two-loop structure matches the original engine exactly.

### Loop 1: Find Representatives

For each of the 40 categories, the system attempts to find a single representative agent through a series of steps:

### Persistence Check

Before scanning for new candidates, the system checks whether the *existing* known agent should be kept. Three conditions must all be true:

1. The current known agent is still valid (not destroyed)
2. The creature can still see it (within range, alive, not invisible)
3. The `noun` lobe neuron for this category has state > **0.20**

```javascript
const nounState = brain.getNeuronState('noun', category, 0);
if (currentKnown && canSee(currentKnown) && nounState > 0.20) {
    continue;  // keep tracking this agent
}
```

The noun threshold of 0.20 implements **conversation stability** — if the creature has been "talking about" or attending to an agent (keeping its noun neuron active), the vision system won't switch to a different representative mid-interaction. The original engine comment reads: *"if you can still see last known agent and have been talking about it — keep it"*.

### Algorithm Dispatch

If the persistence check fails, the old known agent is cleared and the system queries the world for all visible agents matching the category's classifier (family, genus, species). The algorithm ID for each category is read from the catalogue tag `"Category Representative Algorithms"` and dispatched accordingly.

### Carried Object Override

After Loop 1 completes, a final override runs: the creature's currently carried object **always** wins its category slot, regardless of what algorithm selected.

```javascript
const carried = creature.getCarried();
if (carried && !(carried.attributes & 0x10)) {  // not invisible
    const categoryId = CategorySystem.getCategoryIdOfAgent(carried);
    if (categoryId >= 0 && categoryId < numCategories) {
        this.setKnownAgent(categoryId, carried);
    }
}
```

This ensures a creature always "sees" what it's holding, even if a closer or more recently encountered agent would otherwise take the slot.

---

## Selection Algorithms

Five algorithms are available, configured per category via the catalogue. Each receives a pre-filtered list of visible agents.

### Algorithm 0: PICK_NEAREST_IN_X_DIRECTION

The **default** algorithm. Selects the agent with the smallest horizontal distance to the creature, completely ignoring Y (elevation).

```javascript
// Picks smallest |agent.x - creature.x|
for (const agent of candidates) {
    const xDist = Math.abs(agent.x - creature.x);
    if (xDist < bestDistance) {
        bestDistance = xDist;
        winner = agent;
    }
}
```

Best for categories where lateral proximity matters most — typical for items on the same floor level.

### Algorithm 1: PICK_A_RANDOM_ONE

Selects a random agent from the visible candidates. Provides variety and exploration behavior, preventing creatures from fixating on the nearest object.

**VM stability**: If the creature's CAOS virtual machine is currently running a script, this algorithm returns the *existing* known agent (if still visible) instead of picking a new random one. This prevents the creature from suddenly interacting with a different object mid-script.

### Algorithm 2: PICK_NEAREST_IN_CURRENT_ROOM

Filters candidates to only those in the **same room** as the creature, then selects the nearest by Euclidean distance. If the creature has no room or no agents share its room, falls back to Algorithm 0 (nearest in X).

```javascript
// Filter to same room, then nearest by Euclidean distance
const creatureRoom = creature.getRoomId();
const sameRoom = candidates.filter(a => a.getRoomId() === creatureRoom);
if (sameRoom.length === 0) return pickNearestInXDirection(candidates);
// ... pick nearest by sqrt(dx² + dy²) from sameRoom
```

Useful for categories where room boundaries should limit perception (e.g., room-specific objects).

### Algorithm 3: PICK_NEAREST_TO_GROUND

Selects the agent with the highest Y coordinate (closest to the ground/floor in screen coordinates where Y increases downward). No distance-to-creature consideration.

Best for finding objects resting on the floor, like food or detritus.

### Algorithm 4: PICK_RANDOM_NEAREST_IN_X_DIRECTION

A two-stage algorithm that balances proximity with variety:

1. **Sort** all candidates by X distance from the creature
2. **Compute threshold**: `closestDistance + visualRange / NEAR_RAND_VISUAL_RANGE` (= closest + 512/200 = closest + 2.56 pixels)
3. **Prune** candidates beyond the threshold (except the nearest, which is always kept)
4. **Cap** at `NO_RANDOM_NEAR_AGENTS` (5) candidates
5. **Pick randomly** from the remaining short list

**VM stability**: Same protection as Algorithm 1 — if the VM is running and the old known agent appears in the candidate list, it is returned instead of picking randomly.

```
  Candidates sorted by X distance:
  ┌────┬────┬────┬────┬────┬────┬────┐
  │ 10 │ 11 │ 12 │ 14 │ 50 │ 80 │200 │  ◄ X distances
  └────┴────┴────┴────┴────┴────┴────┘
         threshold = 10 + 2.56 = 12.56
         ├── kept ──┤  pruned ──────────┤
         candidates: [10, 11, 12]
         pick random from these 3
```

---

## Brain Input Writing

### Loop 2: Write visn and elvn

After all representatives are selected, a second loop writes displacement values into the brain's input lobes. For each category:

- If **no representative** exists: both `visn` and `elvn` are set to `0.0`
- If a representative exists: compute the displacement from creature centre to agent centre, normalize by visual range, and clamp

```javascript
const dx = agentCentre.x - creatureCentre.x;
const dy = agentCentre.y - creatureCentre.y;

brain.setInput('visn', category, clamp(dx / 512, -1.0, 1.0));
brain.setInput('elvn', category, clamp(dy / 512, -1.0, 1.0));
```

The clamping function matches the original `BoundIntoMinusOnePlusOne()`:

| Value | Meaning |
|---|---|
| `-1.0` | Agent is 512+ pixels to the left (visn) or above (elvn) |
| `0.0` | Agent is at the same position as the creature |
| `+1.0` | Agent is 512+ pixels to the right (visn) or below (elvn) |

Both lobes use `getCentre()` for position — the centre of the bounding box, not the top-left corner.

**Note on elvn**: The `elvn` (elevation vision) lobe is written to faithfully, but no standard genome defines dendrites that read from it. The Y displacement data is effectively unused in vanilla Creatures 3. The JS implementation replicates this behaviour for compatibility with custom genomes that might use it.

### Why visn Values Bounce

The `visn` values are **raw displacement signals** recomputed from scratch every update cycle. They are expected to fluctuate constantly as the creature moves — this is correct behaviour, not a bug.

Because `visn[i] = clamp((agent.x - creature.x) / 512, -1.0, +1.0)`, every pixel of creature movement shifts **all 40 visn values** simultaneously. A creature walking to the right causes every displacement to decrease; turning around flips the sign. The vision lobe has **no internal persistence or smoothing** — it faithfully reports the instantaneous directional signal.

The **winning neuron** of the `visn` lobe (the category with the highest state after SVRule processing) is similarly unstable. When multiple agents sit at similar X-distances — especially on opposite sides of the creature — small movements can flip the winner between categories from one tick to the next.

This instability is by design. The vision lobe provides **raw sensory input**, analogous to retinal signals. **Stability comes from the attention layer, not the vision layer:**

- The **attention lobe** (`attn`) applies its own SVRule with persistence and decay, smoothing the noisy visn input into a stable focus of attention
- The **noun persistence threshold** (> 0.20) in Loop 1 prevents the vision system from replacing the current representative while the creature is still "thinking about" it
- The **VM stability check** in random algorithms (1, 4) prevents mid-script representative switching
- The **detail lobe** (`detl`) enriches only the IT agent (attention winner), providing stable high-level properties regardless of visn fluctuation

In short: `visn` bounces because positions change — the attention system downstream is responsible for turning noisy displacement signals into stable behavioural focus.

---

## Detail Lobe Enrichment

After the vision system establishes category representatives, the **IT agent** (the creature's current focus of attention, selected by the attention lobe) receives additional processing through the **detail lobe** (`detl`). This runs in a separate method (`updateDetailLobe`) but depends on the vision system's output.

The detail lobe writes 11 neurons describing properties of the IT agent:

| Neuron | Name | Value |
|---|---|---|
| 0 | IT_IS_BEING_CARRIED_BY_ME | `1.0` if creature is carrying IT |
| 1 | IT_IS_BEING_CARRIED_BY_SOMEONE_ELSE | `1.0` if another agent carries IT |
| 2 | IT_NEARNESS | `(255 - 2 * distance) / 255` when distance < 128px (X only) |
| 3 | IT_IS_CREATURE | `1.0` if IT is a creature |
| 4 | IT_IS_MYSIBLING | `1.0` if shares mother or father moniker |
| 5 | IT_IS_MYPARENT | `1.0` if IT's moniker matches creature's mother/father |
| 6 | IT_IS_MYCHILD | `1.0` if IT's mother/father matches creature's moniker |
| 7 | IT_IS_OPPOSITESEX | `1.0` if same family+genus, different sex |
| 8 | IT_IS_OF_THIS_SIZE | `(width + height) / 500.0` |
| 9 | IT_IS_SMELLING_THIS_MUCH | CA emission value from `getCAIncrease()` |
| 10 | IT_IS_FALLING | `1.0` if IT is not stopped |

**Nearness** (neuron 2) uses X distance only and only fires when the IT agent is within 128 pixels. At 0 pixels it outputs `1.0`; at 127 pixels it outputs `~0.003`.

**Kinship neurons** (4-7) are creature-specific — they only fire when IT is a creature, enabling social behaviour like recognising siblings, parents, children, and potential mates.

---

## VM Stability

Algorithms 1 (`PICK_A_RANDOM_ONE`) and 4 (`PICK_RANDOM_NEAREST_IN_X_DIRECTION`) include a critical safety check: they query whether the creature's CAOS virtual machine is currently executing a script via `isRunning()`.

**Why this matters**: When a creature is running a script like "approach food" or "eat object", the script's `TARG` refers to the IT agent, which derives from the category representative. If the vision system randomly switched the representative mid-script, the creature would suddenly be approaching or eating a *different* object — breaking behaviour coherence.

```javascript
_isVMRunning() {
    const vm = this.myCreature.getVirtualMachine();
    return vm && vm.isRunning ? vm.isRunning() : false;
}
```

When the VM *is* running, these algorithms skip random selection and return the existing known agent if it's still among the visible candidates. Deterministic algorithms (0, 2, 3) don't need this protection since they always select the same agent given the same world state.

---

## Constants Reference

| Constant | Value | Purpose |
|---|---|---|
| `VISUAL_RANGE` | 512 | Maximum sight distance (pixels) and normalization divisor |
| `NUMCATEGORIES` | 40 | Default number of perception categories |
| `NO_RANDOM_NEAR_AGENTS` | 5 | Max candidates kept in Algorithm 4's sorted list |
| `NEAR_RAND_VISUAL_RANGE` | 200 | Divisor for Algorithm 4's proximity threshold |
| Noun persistence threshold | 0.20 | Minimum noun neuron state to keep existing representative |
| Nearness max distance | 128 | Detail lobe nearness neuron cutoff (pixels) |
| `attrInvisible` | bit 4 (0x10) | Agent attribute flag for vision exclusion |

---

## Key Files

| File | Purpose |
|---|---|
| `SensoryFaculty.js` (2,148 lines) | Main vision pipeline — `updateVisionLobe()`, all 5 algorithms, visibility filtering |
| `PerceptionConstants.js` (57 lines) | `VISUAL_RANGE`, algorithm enum, detail/situation lobe offsets |
| `CategorySystem.js` | Category classifier lookup and algorithm ID retrieval |

---

## Related Articles

- [Creature Perception](#/article/creature-perception) - Broad overview of all perception channels (vision, smell, hearing, touch)
- [Vision Lobe Architecture](#/article/vision-lobe-architecture) - Neural architecture of the visn/elvn lobes and their tract connections
- [Sensory Faculty](#/article/sensory-faculty) - Complete faculty reference including stimulus processing, smell, and social memory
- [Brain & Neural Networks](#/article/brain-system) - How perception inputs flow through the neural network
- [Attention Lobe Architecture](#/article/attention-lobe-architecture) - How the brain selects IT from category representatives
- [Brain-to-IT Pipeline](#/article/brain-to-it-pipeline) - End-to-end flow from brain output to IT agent selection
