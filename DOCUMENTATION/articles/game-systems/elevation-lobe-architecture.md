# [elvn] Elevation Lobe Architecture

The **elevation lobe** (`elvn`) is a **planned but never completed** brain lobe in the Creatures 3 engine. The SensoryFaculty faithfully computes Y-axis displacement for every category representative and calls `brain.setInput('elvn', category, yDisplacement)` each tick — but no genome ever shipped with a lobe definition for the `"elvn"` token. The data is silently discarded into a dummy lobe.

This article documents the complete evidence trail: the engine-side write logic that exists, the genome-side definition that doesn't, and the dummy lobe mechanism that safely absorbs the orphaned data.

---

## What Would Have Existed

If the elevation lobe had been completed, it would have been the Y-axis counterpart to the vision lobe (`visn`):

| Aspect | visn (exists) | elvn (never shipped) |
|---|---|---|
| Neurons | 40 (one per category) | Would have been 40 |
| Input | X displacement: `(agent.x - creature.x) / 512` | Y displacement: `(agent.y - creature.y) / 512` |
| Range | `[-1.0, +1.0]` (left to right) | `[-1.0, +1.0]` (above to below) |
| Purpose | Horizontal direction to representative | Vertical direction to representative |
| Tracts | 3 outbound (to attn, stim, move) | None (no genome definition) |

Together, `visn` and `elvn` would have given the brain a complete 2D directional awareness for every category — enabling creatures to distinguish "food is above me" from "food is below me".

---

## Engine-Side: The Write Logic Exists

The SensoryFaculty writes to `elvn` in exactly the same code path as `visn`. In `updateVisionLobe()`, Loop 2 computes both X and Y displacements and writes them to their respective lobes:

```text
// SetVisualInput()
xDisplacement = BoundIntoMinusOnePlusOne(
    (knownAgent[i].centre.x - creature.centre.x) / visualRange
)
yDisplacement = BoundIntoMinusOnePlusOne(
    (knownAgent[i].centre.y - creature.centre.y) / visualRange
)
brain.SetInput("visn", i, xDisplacement)
brain.SetInput("elvn", i, yDisplacement)   // ← Written, but goes to dummy lobe
```

When no representative exists for a category, both lobes are explicitly zeroed:

```text
if (knownAgent[i].IsInvalid()) {
    brain.SetInput("visn", i, 0.0)
    brain.SetInput("elvn", i, 0.0)         // ← Also zeroed
}
```

The write logic is complete and correct — it uses `GetCentre()` for both positions, normalizes by visual range (512), and clamps to `[-1.0, +1.0]` via `BoundIntoMinusOnePlusOne()`. The only thing missing is a lobe to receive the data.

---

## Genome-Side: No Lobe Definition

The official lobe token list is defined in `Brain.catalogue` (lines 64–76):

```
ARRAY "Brain Lobe Quads" 12
"attn"     # attention
"decn"     # decision
"verb"     # verb
"noun"     # noun
"visn"     # vision
"smel"     # smell
"driv"     # drive
"sitn"     # situation
"detl"     # detail
"resp"     # response
"prox"     # proximity
"stim"     # stim source
```

**`elvn` is not in this list.** The 12 standard lobe tokens are: `attn`, `decn`, `verb`, `noun`, `visn`, `smel`, `driv`, `sitn`, `detl`, `resp`, `prox`, `stim`.

No shipped genome file (`.gen`) — neither Norn, Grendel, nor Ettin — contains a lobe gene with the `elvn` token. No tract gene references it as a source or destination. The elevation lobe has zero presence in the genome layer.

---

## The Dummy Lobe Mechanism

When `Brain::SetInput("elvn", ...)` is called, the brain searches its lobe list for a matching token and finds nothing. It then returns a **static dummy lobe** — a singleton with zero neurons that safely absorbs all operations:

```text
function GetLobeFromTokenString(lobeTokenString):
    for each l in myLobes:
        if l.GetToken() == Tokenize(lobeTokenString):
            return l
    return ourDummyLobe    // ← "elvn" always ends up here
```

The dummy lobe is constructed with zero neurons and a NULL input array:

```text
function Lobe():
    myWinningNeuronId = 0
    myNeuronInput = NULL    // No input buffer allocated
```

When `SetNeuronInput()` is called on the dummy, the bounds check immediately rejects because `myNeurons.size()` is 0:

```text
function SetNeuronInput(whichNeuron, toWhat):
    if whichNeuron < 0 or whichNeuron >= myNeurons.size():
        return                  // ← Always exits here for dummy lobe
    myNeuronInput[whichNeuron] += toWhat
```

The Y displacement data is computed, normalized, clamped — and then silently discarded. No crash, no error, no warning. The engine's dummy lobe pattern makes orphaned `SetInput` calls completely safe.

```
    SensoryFaculty
         │
         ├── SetInput("visn", i, xDisp) ──► visn lobe ──► neurons ──► tracts
         │
         └── SetInput("elvn", i, yDisp) ──► GetLobeFromTokenString("elvn")
                                                │
                                                └── no match found
                                                    │
                                                    ▼
                                               ourDummyLobe
                                                    │
                                                    ▼
                                            SetNeuronInput(i, yDisp)
                                                    │
                                                    └── bounds check fails
                                                        (0 neurons)
                                                        │
                                                        ▼
                                                    return; // data discarded
```

---

## The JS Rebuild Replicates This Exactly

The JavaScript implementation mirrors the original behavior. `Brain.getLobeFromTokenString("elvn")` returns a dummy lobe object with no-op methods:

```javascript
// Brain.js constructor
this.dummyLobe = {
    getToken: () => '****',
    getTokenString: () => '****',
    getNoOfNeurons: () => 0,
    setNeuronInput: () => {},      // No-op — data discarded
    setLobeWideInput: () => {},
    getNeuronState: () => 0.0,
    // ... other stubs
};
```

The SensoryFaculty writes both `visn` and `elvn` identically, preserving the original engine's behavior for forward compatibility with custom genomes.

---

## Why It Was Likely Cut

The elevation lobe was probably planned during early development when the brain architecture was being designed, then cut before shipping. Possible reasons:

- **Redundant information**: The detail lobe's `IT_NEARNESS` neuron (neuron 2) already provides proximity information for the attended object, and the vision lobe's X displacement was sufficient for navigation decisions in the Ark's predominantly horizontal layout
- **Neuron budget**: Adding 40 more neurons would have increased the brain's computational cost, and Creatures 3 was already pushing the performance limits of 1999 hardware
- **Genome complexity**: Wiring an elevation lobe into the tract network would require additional genome genes for tracts and SVRules, adding genome bloat without clear behavioral benefit
- **Horizontal world design**: The Creatures 3 Ark is structured as a series of horizontally-connected rooms, making lateral direction (visn) far more behaviorally relevant than vertical direction (elvn)

The engine developers left the `SetInput` calls in place rather than removing them — either as a future extension point or simply because the dummy lobe mechanism made the orphaned writes harmless.

---

## Modding Potential

A modder could theoretically enable the elevation lobe by defining it in a custom genome:

1. Add a **lobe gene** with token `"elvn"`, 40 neurons, and an appropriate SVRule
2. Add **tract genes** connecting `elvn` to downstream lobes (e.g., `stim`, `attn`, `comb`)
3. The SensoryFaculty's existing `SetInput("elvn", ...)` calls would automatically populate the lobe — no engine code changes needed

This would give creatures awareness of vertical positioning — useful for multi-level environments where creatures need to distinguish "food is above" from "food is below".

---

## Key Files

| File | Purpose |
|---|---|
| `Brain.catalogue` (lines 64–76) | Official lobe token list — `elvn` absent |
| `SensoryFaculty.js` (lines 457, 472) | JS equivalent `setInput('elvn', ...)` calls |
| `Brain.js` (lines 46–67) | JS dummy lobe with no-op stubs |

---

## Related Articles

- [Vision Lobe Architecture](#/article/vision-lobe-architecture) - The X-axis counterpart that actually ships and works
- [Vision System](#/article/vision-system) - The full vision pipeline that computes both visn and elvn values
- [Sensory Faculty](#/article/sensory-faculty) - The faculty that drives all brain input writing
- [Brain & Neural Networks](#/article/brain-system) - Lobe architecture, dummy lobe pattern, and token lookup
- [Detail Lobe Architecture](#/article/detail-lobe-architecture) - Alternative source of IT agent proximity data
