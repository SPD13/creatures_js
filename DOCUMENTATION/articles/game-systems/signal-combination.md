# Combining Multiple Input Signals at a Neuron

Open the Inspector panel in the Creature Debugger and pick any neuron downstream of several others — a `comb` cell, an `attn` cell, a `decn` cell. The graph shows half a dozen arrows converging onto the same box. Each arrow is one dendrite, carrying a weighted contribution from some upstream neuron. The obvious question is: **how are those contributions combined into the single scalar that the lobe's SVRule will then read?**

There is no explicit "sum" operator anywhere in the engine. Instead, combination happens in two clearly separated stages, via two specific opcodes, into one specific neuron state slot. Understanding this is the difference between reading the graph as "neural network with weighted sums" and reading it as what it actually is — an ordered, saturating accumulator fed by per-dendrite programs.

## Stage 1 — Tracts Accumulate Into `dst.state[1]`

Every tract has its own `updateRule` (an SVRule program). The brain's main loop walks every tract, and for each tract it runs the rule once per dendrite in that tract. During that per-dendrite pass the rule has access to:

| Operand in the rule | Points at                                     | Source file                        |
|---------------------|-----------------------------------------------|------------------------------------|
| `input[0..7]`       | The **source** neuron's 8 state variables     | `Tract.js` (`dendrite.srcNeuron.states`) |
| `dendrite[0..7]`    | This dendrite's 8 weight slots (STW, LTW, …)  | `Tract.js` (`dendrite.weights`)    |
| `neuron[0..7]`      | The **destination** neuron's 8 state variables| `Tract.js` (`dendrite.dstNeuron.states`) |
| `spare[0..7]`       | The current winner of the **source** lobe     | `Tract.js` (`src.lobe.spareNeuronVariables`) |
| `chemical[i]`       | Biochemistry chemicals                         | `Tract.js` (`pointerToChemicals`)  |

The two opcodes that actually combine signals are `DIVIDE_AND_ADD_TO_NEURON_INPUT` (opcode 50) and `MULTIPLY_AND_ADD_TO_NEURON_INPUT` (opcode 51). Both write into `neuron[1]` — i.e. the **destination neuron's `states[INPUT_VAR]`** (state index 1) — and both clip the result to the `[-1, +1]` range before storing it:

```javascript
// SVRule.js — MULTIPLY_AND_ADD_TO_NEURON_INPUT (opcode 51)
const multiplied = accumulator * operand;
neuronVars[1] = BoundIntoMinusOnePlusOne(neuronVars[1] + multiplied);

// SVRule.js — DIVIDE_AND_ADD_TO_NEURON_INPUT (opcode 50)
if (operand !== 0) {
    const divided = accumulator / operand;
    neuronVars[1] = BoundIntoMinusOnePlusOne(neuronVars[1] + divided);
}
```

A typical dendrite rule therefore looks like this (paraphrased from `comb` inbound tracts in the standard norn genome):

```
LOAD        input[2]         ; acc = src neuron's OUTPUT
MULTIPLY_BY dendrite[0]      ; acc *= STW
MUL_ADD_IN  one              ; dst.state[1] = bound(dst.state[1] + acc * 1)
```

Read slowly: every dendrite ending on the same destination neuron runs this program with a different source neuron, a different weight, and the **same `neuronVars[1]` target**. Contribution *k* reads the state of `neuronVars[1]` *after* contribution *k-1* has already landed there. Each add is clipped to `[-1, +1]` before the next contribution is applied. So the accumulator:

- **is shared** across all incoming dendrites for a given destination neuron,
- **is order-dependent** (tract order × dendrite order — not associative once any intermediate sum pushes past `±1`),
- **saturates** rather than summing freely, and
- **does not distinguish sources** — the destination neuron only sees a single post-combination scalar.

That scalar is what the rest of the brain will interpret as "everything that fed into me this tick."

## Stage 2 — The Destination Lobe's Rule Reads `neuron[1]`

After every tract has finished updating every dendrite, the lobes run. For each neuron in a lobe, `Lobe.doUpdate` calls the lobe's `updateRule` with:

- `input[0]` seeded from `lobe.neuronInput[i]`, which holds the **faculty-side** external input (drive levels, speech categories, smell categories — anything a faculty has called `brain.setInput` on this tick). The engine reads the value, then zeroes the slot.
- `input[1..7]` = zero.
- `neuron[0..7]` = this neuron's own 8 state variables, *including `neuron[1]` which is the aggregated dendrite input that Stage 1 just built up*.
- `spare[0..7]` = the running winner of this lobe (updated on the fly by `DO_WINNER_TAKES_ALL`).

This is where the two "kinds" of input split cleanly:

| Slot in the lobe rule | What it carries                                                |
|-----------------------|----------------------------------------------------------------|
| `input[0]`            | **External / faculty** input to this specific neuron (world)   |
| `neuron[1]`           | **Sum of all incoming dendrites**, saturating, computed by tracts |
| `neuron[0]`           | Previous tick's STATE (self-feedback / persistence)            |
| `neuron[2]`           | This tick's OUTPUT — set only if `DO_WINNER_TAKES_ALL` elects this neuron |

A lobe's update rule for a mid-layer neuron therefore does something like:

```
LOAD        input[0]         ; acc = external/faculty input
ADD         neuron[1]        ; + tract-aggregated input
ADD         neuron[0]        ; + previous STATE (persistence)
…                            ; threshold, gain, leakage, rest-state, noise
STORE       neuron[0]        ; new STATE
DO_WINNER_TAKES_ALL          ; if STATE >= spare[0] → OUTPUT = STATE, become the new winner
```

And that is the whole combination pipeline: **tract rules pack all incoming dendrites into a single saturating scalar at `neuron[1]`, and the lobe rule reads that scalar as one of several inputs feeding the new STATE.**

## What This Implies for Reading the Inspector

The Inspector's chain view shows one arrow per dendrite, and it can make the downstream neuron look like it performs a rich multi-way computation. It does not. By the time the lobe rule runs, every arrow shown on the left of a chain neuron has collapsed into a single number in `neuron[1]`. The SVRule tooltip's `neuron[1] = …` line is what the rule actually gets to work with.

A few consequences worth internalising:

- **You cannot recover individual upstream contributions from the neuron's state.** `neuron[1]` is a scalar. If two upstream neurons pushed equal and opposite values, the destination sees zero — and the rule cannot tell that apart from "nothing fed me at all."
- **Order within a tract matters once you saturate.** If five dendrites each add `+0.4`, the first two land cleanly, the third clips at `+1`, and the last two are effectively lost. This is why tract ordering in the genome is a tuning parameter, not a bookkeeping detail.
- **The `+` for external input is in the lobe rule, not in a tract.** `driv`/`noun`/`verb`/`smel` lobes receive their signal via `brain.setInput` → `lobe.neuronInput[i]` → `input[0]`. It never touches `neuron[1]`. A lobe that reads both `input[0]` and `neuron[1]` is explicitly deciding that external input and upstream-brain input are different quantities.
- **`DENDRITE_CODE` is a tract-rule concept only.** The lobe rule's `dendrite[…]` operand reads a zero vector, because the lobe rule is not running in a dendrite context. Use this fact when auditing an SVRule: any non-zero dendrite reference inside a *lobe* rule is a dead read.
- **`spare` is different in the two stages.** In a tract rule, `spare` is the winner of the **source** lobe (useful for "only transmit from the winner"). In a lobe rule, `spare` is the running winner of **this** lobe, mutated as each neuron is processed.

## Writing the Inspector Tooltip

This is also what the "SVRule trace" tooltip in the Inspector reports. For each rule line it resolves the operand against the *current* snapshot of state, input, spare, and chemicals — not by replaying the rule. That means:

- Values shown in parentheses are the operand as it exists **at this instant**, not "the value the accumulator held when the rule ran."
- `accumulator`, `random`, and `dendrite[…]` in a lobe rule are shown as `(—)` because they cannot be resolved without a full simulation; the first two depend on prior lines, and the third is not meaningful in a lobe context.
- `input[0]` in the tooltip for `driv`/`prox`/`resp` neurons is substituted with `creature.getDriveLevel(neuronId)` because `lobe.neuronInput[i]` is zeroed every tick the moment the rule runs. The raw number from the array would always read as 0 — the drive level is what the rule *was* fed.

When you hover a `comb` neuron with five inbound arrows and the tooltip's `neuron[1]` line shows `0.83`, that is the post-combination scalar described above. If you want to know *which* upstream neuron contributed how much, the answer is: the engine does not preserve that. You have to read the tract rules, reconstruct the order, and compute the saturating sum by hand — or change a weight and watch what shifts.

## Summary

> Multiple incoming signals are combined **inside the tract rules**, by repeated bounded-add into the destination neuron's `state[1]` via opcodes 50 and 51. The destination lobe's rule then references that combined signal as `neuron[1]`, separately from faculty/world input which arrives as `input[0]`. `neuron[0]` is STATE, `neuron[2]` is OUTPUT (set by winner-takes-all), `neuron[7]` is NGF. Cross-lobe per-source values are never directly readable — only their pre-summed, saturating contribution in `neuron[1]`.
