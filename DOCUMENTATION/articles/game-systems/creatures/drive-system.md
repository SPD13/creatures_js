# The Drive System: From Chemical to Decision

Drives are the internal motivations that push a creature to act — hunger, fear, loneliness, sleepiness, and so on. They are not a separate subsystem bolted onto the creature: they are the **wire** that joins biochemistry to the brain. A chemical concentration in the bloodstream becomes a receptor input, which becomes a value in a locus array, which becomes a neuron activation in the drive lobe, which ultimately biases the decision lobe toward a particular action.

This article walks the entire path using a concrete, genome-sourced example: **Hunger for carbohydrate**.

## Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   DRIVE PIPELINE (Hunger for carbohydrate)               │
│                                                                          │
│  1. CHEMICAL IN BLOOD                                                    │
│     chemical[150] = "Hunger for carbohydrate" rises                      │
│          │                                                               │
│          ▼                                                               │
│  2. RECEPTOR SAMPLES THE CHEMICAL                                        │
│     Gene: organ=1 (Creature), tissue=5 (Drives), locus=2, chem=150       │
│     signal = (chem[150] - threshold) * gain                              │
│          │                                                               │
│          ▼                                                               │
│  3. DRIVE LOCUS WRITTEN                                                  │
│     creature.myDriveLoci[2] ← receptor result                            │
│     (array slot 2 = HUNGER_FOR_CARB)                                     │
│          │                                                               │
│          ▼                                                               │
│  4. SENSORY FACULTY FEEDS THE BRAIN                                      │
│     SensoryFaculty.updateDriveLobe() each brain tick:                    │
│       for i in 0..19: brain.setInput('driv', i, getDriveLevel(i))        │
│          │                                                               │
│          ▼                                                               │
│  5. DRIVE LOBE NEURON ACTIVATES                                          │
│     Lobe 0 "driv" (tissueId 5, 20 neurons) — neuron 2 STATE_IN ← value   │
│          │                                                               │
│          ▼                                                               │
│  6. PROPAGATION THROUGH THE BRAIN                                        │
│     driv → (dendrite tracts) → decn, attn, resp, ...                     │
│     Decision lobe eventually picks a winning action (e.g. EAT)           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

The key insight is that **drives live in the `Creature` organ, not in the brain**. The drive lobe is just a consumer — it is re-populated from `myDriveLoci` every brain tick by the `SensoryFaculty`. This lets other faculties (Expressive, Music, Linguistic) read the same drive values without going through the brain.

---

## Step 1: The Chemical

The genome in `Starter Parent 1.family` declares chemical 150 as one of the three hunger chemicals:

| ID  | Name                     |
|-----|--------------------------|
| 132 | Hunger for protein backup |
| 133 | Hunger for carb backup    |
| 149 | Hunger for protein        |
| **150** | **Hunger for carbohydrate** |
| 151 | Hunger for fat            |

Chemical 150 is produced by reactions in the creature's biochemistry — for example, reaction gene 9 converts `Hunger for carb backup [133] → Hunger for carbohydrate [150]` in the very young, which is how the backup slowly leaks into the active hunger chemical over time. It also has a half-life set by a half-life gene, so it slowly decays toward zero when nothing is producing it.

The important thing for the drive system is: chemical 150 is a **float in the bloodstream**. Nothing about it is special — it is an ordinary biochemical quantity. The only thing that makes it a "drive" is the receptor wired on top of it.

---

## Step 2: The Receptor

In the standard genome, the receptor that turns chemical 150 into a drive signal is:

```json
{
  "id": 3,
  "geneId": 3,
  "switchOnAge": 0,
  "switchOnStage": "Baby",
  "organ": 1,          "organName": "Creature",
  "tissue": 5,         "tissueName": "Drives",
  "locus": 2,          "locusName": "Hunger for carbohydrate",
  "chemical": 150,     "chemicalName": "Hunger for carbohydrate",
  "threshold": 0,
  "nominal": 0,
  "gain": 255,
  "flags": 0
}
```

Reading this as a wiring diagram:

- **What to read:** `chemical` — chemical 150 from the creature's bloodstream.
- **How to transform it:** `threshold=0`, `gain=255`, analog (flags=0). Per `Organ.processReceptors()`:
  ```
  signal = chem[150] - threshold
  if signal > 0: signal *= gain
  result = nominal + signal        (averaged across the group)
  ```
  With `nominal=0`, `threshold=0`, and `gain=255`, the result is effectively a saturating map of `chem[150]` onto 0..255.
- **Where to write it:** `organ=1, tissue=5, locus=2`. This triple is the receptor's `Dest`, computed once at gene switch-on via `getLocusAddress('RECEPTOR', 1, 5, 2)`. It resolves to a reference into `creature.myDriveLoci[2]` — the slot for HUNGER_FOR_CARB (see next step).

Every biochemistry tick, `Organ.processReceptors()` (`Rebuild/Main_Game/src/engine/creature/biochemistry/Organ.js:225`) groups receptors sharing a destination, averages them, and writes the result through the stored reference. For our receptor, the net effect is:

```
creature.myDriveLoci[2] = f(chem[150])
```

Receptors that write to brain lobes directly (`organ=0`) bypass this array and go straight into neuron state variables. Drive receptors are different: they target `organ=1 (Creature), tissue=5 (Drives)`, which is resolved in `Creature.getLocusAddress()` to the `myDriveLoci` array.

---

## Step 3: The Drive Loci Array

`Creature.js` declares a single float array for drive values:

```js
// Rebuild/Main_Game/src/engine/creature/Creature.js:109
this.myDriveLoci = new Float32Array(NUM_DRIVES);   // NUM_DRIVES = 20
```

The twenty slots correspond to the 20 drive offsets declared in `CreatureConstants.js`:

| Index | Drive                 |
|-------|-----------------------|
| 0     | PAIN                  |
| 1     | HUNGER_FOR_PROTEIN    |
| **2** | **HUNGER_FOR_CARB**   |
| 3     | HUNGER_FOR_FAT        |
| 4     | COLDNESS              |
| 5     | HOTNESS               |
| 6     | TIREDNESS             |
| 7     | SLEEPINESS            |
| 8     | LONELINESS            |
| 9     | CROWDEDNESS           |
| 10    | FEAR                  |
| 11    | BOREDOM               |
| 12    | ANGER                 |
| 13    | SEXDRIVE              |
| 14    | COMFORT               |
| 15    | UP                    |
| 16    | DOWN                  |
| 17    | EXIT                  |
| 18    | ENTER                 |
| 19    | WAIT                  |

The locus resolution happens in `Creature.getLocusAddress()`:

```js
// Rebuild/Main_Game/src/engine/creature/Creature.js:236
case TISSUE_DRIVES:
    if (locus >= LOC_DRIVE0 && locus < LOC_DRIVE0 + NUM_DRIVES)
        result = this._createArrayLocusRef(this.myDriveLoci, locus - LOC_DRIVE0);
    break;
```

So the receptor's `locus=2` (encoded as `LOC_DRIVE0 + 2`) becomes an index reference to `myDriveLoci[2]`.

From this moment on, the drive is a plain number sitting in a float array on the `Creature` object. It is readable by anyone with a reference to the creature — `creature.getDriveLevel(2)` is the public accessor.

---

## Step 4: SensoryFaculty Feeds the Drive Lobe

The drive lobe doesn't poll the array; it gets **pushed** into. Every brain tick, `SensoryFaculty.updateDriveLobe()` copies all 20 drive values into the `driv` lobe's neuron inputs:

```js
// Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:350
updateDriveLobe(brain) {
    for (let i = 0; i < this.myNumDrives; i++) {
        if (this.myCreature.getDriveLevel) {
            brain.setInput('driv', i, this.myCreature.getDriveLevel(i));
        }
    }
}
```

For our example, the iteration at `i=2` calls:

```js
brain.setInput('driv', 2, creature.getDriveLevel(2));
//                               └── returns myDriveLoci[2]
```

`Brain.setInput(lobeToken, neuronId, value)` writes `value` into the STATE_IN of the matching neuron in the lobe whose token is `'driv'`.

This push model is important: because the brain's drive lobe is refreshed from `myDriveLoci` at the start of every brain tick, any receptor updates that happened during the intervening biochemistry ticks are instantly reflected in the brain on the next tick — there is no stale cache.

---

## Step 5: The Drive Lobe Receives the Signal

From `brain-architecture.json` (the lobe descriptor as emitted from the genome):

```json
{
  "index": 0,
  "token": "driv",
  "updateAtTime": 4,
  "neurons": 20,
  "dimensions": { "width": 20, "height": 1 },
  "tissueId": 5,
  "runInitRuleAlways": false,
  ...
}
```

A few things to notice:

- **It is lobe 0** — the very first lobe in the architecture. In Creatures 3, drives are treated as the primary input to the brain.
- **20 neurons, arranged 20×1** — one neuron per drive offset, in a flat strip. Neuron index matches the drive index directly, so neuron 2 is "Hunger for carbohydrate".
- **`tissueId: 5`** — the same tissue number the receptor uses. It's not an accident: the lobe advertises itself as the owner of tissue 5, which allows brain-side receptors (`organ=0, tissue=5`) to write directly into neuron state if anyone ever defines such a gene. The standard starter genome does not — it uses the `Creature` organ detour through `myDriveLoci` so that other faculties can read the same values.
- **`updateAtTime: 4`** — the lobe ticks every fourth brain tick. Drives don't need to be re-processed on every single update.

So when `SensoryFaculty.updateDriveLobe()` calls `setInput('driv', 2, value)`, it lands in **neuron 2 of lobe 0**. That neuron is the brain's sole representation of "how hungry this creature is for carbohydrate, right now".

---

## Step 6: Propagation and Decision

Once the drive lobe is loaded, the usual brain cycle takes over. The drive lobe's output feeds the downstream lobes via dendrite tracts defined in the genome:

- **Attention lobe (`attn`)** — a high carb-hunger drive biases attention toward objects tagged as food.
- **Decision lobe (`decn`)** — the 16 decision neurons compete; a hungry creature that also sees food nearby will very likely produce `EAT` as the winner.
- **Response / reinforcement lobe (`resp`)** — used by the learning system to credit or blame actions based on how they changed drive levels (eating food that reduces carb hunger gets reinforced).

The action-selection side of this pipeline is documented in detail in [Creature Action Pipeline](creature-action-pipeline.md) and [Creature Eating: From Action to Biochemistry](creature-eating-biochemistry.md). What matters here is that **all of it starts with the drive lobe neuron being set to the chemically-derived value computed back in step 2**.

---

## The Feedback Loop

When the creature successfully eats a food agent, the eating pipeline injects chemicals into the bloodstream via `STIM WRIT`. Some of those chemicals consume `Hunger for carbohydrate` directly through a reaction:

```
1x Hunger for carbohydrate [150] → 1x Hunger for carb backup [133]
```

(reaction gene 21 and others). As chemical 150 drops, the receptor output drops, `myDriveLoci[2]` drops, and on the next brain tick neuron 2 of the drive lobe drops. The creature stops wanting carbs. That closing of the loop — biochemistry → locus → lobe → decision → action → biochemistry — is what makes a creature appear motivated rather than scripted.

---

## Other Consumers of `myDriveLoci`

The drive array is not exclusively read by the brain. Because it lives on the `Creature` organ, any faculty can sample it directly:

- **ExpressiveFaculty** (`ExpressiveFaculty.js:296, 365`) picks the highest-valued drive each tick and maps it to a facial expression (pout, frown, grin…).
- **MusicFaculty** (`MusicFaculty.js:118`) uses drive levels to choose which musical motifs to hum.
- **LinguisticFaculty** (`LinguisticFaculty.js:483–599`) uses drives to decide which complaint to voice (`"hungry"`, `"angry"`, `"lonely"`…).
- **The debug UI** (`CreaturesDebuggerModule.js`, `GraphModule.js`) samples `myDriveLoci` directly for live graphs and the Drives panel.

Every one of these consumers bypasses the brain entirely. That is the whole reason drives are stored in a neutral array on the `Creature`: they are the canonical state, and the drive lobe is just one of many things that listen to it.

---

## Quick Reference

| Concept | Location |
|---|---|
| Drive offsets (enum) | `Main_Game/src/engine/creature/CreatureConstants.js:39` |
| Drive loci array | `Main_Game/src/engine/creature/Creature.js:109` |
| Locus resolution for `TISSUE_DRIVES` | `Main_Game/src/engine/creature/Creature.js:236` |
| Drive level accessor | `Main_Game/src/engine/creature/Creature.js:1625` (`getDriveLevel`) |
| Receptor processing | `Main_Game/src/engine/creature/biochemistry/Organ.js:225` (`processReceptors`) |
| Drive → brain transfer | `Main_Game/src/engine/creature/faculties/SensoryFaculty.js:350` (`updateDriveLobe`) |
| Drive lobe descriptor | `DOCUMENTATION/CreaturesData/brain-architecture.json` — lobe index 0, token `"driv"` |
| Standard carb-hunger receptor | `DOCUMENTATION/CreaturesData/biochemistry.json` — receptor id 3, gene id 3 |

## Related Articles

- [Drive Lobe Architecture](../drive-lobe-architecture.md) — detailed structure of the `driv` lobe itself
- [Brain Faculty](../brain-faculty.md) — how the brain ticks and how lobes connect
- [Biochemistry System](../biochemistry-system.md) — chemicals, reactions, receptors, emitters
- [Creature Action Pipeline](creature-action-pipeline.md) — how a winning decision becomes a motor action
- [Creature Eating: From Action to Biochemistry](creature-eating-biochemistry.md) — the closing half of the drive feedback loop
