# Non-Plastic Dendrites

Open the Dendrites debugger for a live creature and you will find that most tracts in the standard norn genome display **rows and rows of zeros**. `visn→stim`, `noun→stim`, `smel→stim`, `move→stim`, `visn→move`, `comb→attn`, `comb→decn`, `resp→driv` — all of them look dead. No STW, no LTW, no Strength, nothing. Yet the creature clearly *sees* agents, *smells* food, and *acts* on the decisions those pathways produce. If the synapses are all zero, how is the signal getting through?

The answer is that **these tracts are not synapses in the learning sense at all**. They are fixed-function relays. Their dendrite weight slots are simply never used, by design. This article explains what "non-plastic" means precisely, why such a tract exists, and how to read the Debugger's plasticity badge.

## What "Plastic" Means Inside the Brain

A Creatures dendrite carries **eight numeric weight slots** (`weights[0..7]`), conventionally used for STW (short-term weight), LTW (long-term weight), four scratch slots, a sixth slot, and STRENGTH. Whether those slots actually *do* anything is entirely up to the tract's SVRule program — the state-variable rule that runs once per dendrite, per tick, on the source and destination neuron states.

A tract is **plastic** if any of the following is true:

1. **Its SVRule update or init rule reads or writes a dendrite weight.** Any opcode with `operandVariable === 2` (`DENDRITE_CODE`) is a dendrite access. The rule can load a weight into the accumulator, multiply by it, add to it, or store into it. If any line does this, the weight slots carry meaningful state and the tract is learning.
2. **The tract has `reward` or `punishment` reinforcement enabled.** This is a separate, hard-coded path — `Tract.processRewardAndPunishment(dendrite)` at `Tract.js:531` runs after the SVRule and writes `weights[WEIGHT_SHORTTERM_VAR]` directly based on a reward/punishment chemical level. No SVRule opcode is involved. A tract can be plastic via this path even if its SVRule never touches a dendrite weight.
3. **The tract has `dendritesAreRandomlyConnectedAndMigrate` set.** This is structural plasticity — the wiring itself changes. See [Dendrite Migration](dendrite-migration.md).

A tract is **non-plastic** when none of the above apply. Its SVRule reads and writes neuron states only (INPUT_NEURON_CODE for the source, NEURON_CODE for the destination, plus constants), reward/punishment are unsupported, and migration is off. The dendrites still exist as a routing table — "source neuron X feeds destination neuron Y" — but their weight slots are inert memory that stays at zero for the creature's entire life.

## Anatomy of a Non-Plastic Tract: visn→stim

The clearest example in the standard norn brain is `visn→stim` (Tract #0). Here is its update rule, line-by-line, as it appears in `brain-architecture.json`:

```
0 LOAD_ABSOLUTE_VALUE_OF_OPERAND_INTO_ACCUMULATOR  INPUT_NEURON_CODE[0]  ; acc = |src.state[0]|
1 IF_NOT_EQUAL_TO                                  ZERO_CODE             ; skip the rest if acc == 0
2 SUBTRACT_FROM                                    ONE_CODE              ; acc = 1 - acc
3 NO_OPERATION                                     VALUE_CODE 0.1008     ; (inline constant slot)
4 MULTIPLY_BY                                      VALUE_CODE 0.5        ; acc *= 0.5
5 STORE_ACCUMULATOR_INTO                           NEURON_CODE[1]        ; dst.state[1] = acc
6 STOP_IMMEDIATELY
```

Look at the operand column. Every line references either the source neuron (`INPUT_NEURON_CODE`), the destination neuron (`NEURON_CODE`), hard-coded constants (`ZERO_CODE`, `ONE_CODE`, `VALUE_CODE`), or the accumulator. **No line references `DENDRITE_CODE`.** The dendrite's eight weight slots are never read and never written.

What this rule actually computes is: "take the source neuron's saliency, invert it (close agents give a small number, far agents give a near-one number), multiply by 0.5, and write it into the destination neuron's INPUT slot." That's it — a fixed transform with a hardcoded gain. No learning. The mapping from vision categories to stimulus categories is pre-wired one-to-one and will never change over the creature's life.

## Why Non-Plastic Tracts Exist

Every tract in the genome could in principle be a learning tract. The brain designers chose to make most of them fixed-function instead, for three concrete reasons.

**Most of the brain is wiring, not memory.** The standard C3 brain has about 29 tracts and only a handful of them are associations that the creature needs to *learn*. The rest are hard-wired cross-connections: a vision pixel maps to a stimulus-source bucket, a decision winner maps to a response bucket, a drive level maps to a mood input. These mappings are semantic structure, not experience. Making them plastic would let the creature accidentally unlearn the fact that "seeing something" should produce a stimulus, which would be catastrophic — there is no concept of "re-learning how vision works."

**Fixed-function tracts are faster and smaller.** Every dendrite in a plastic tract burns CPU every tick running a full 16-line SVRule program plus the reward/punishment pass, *and* maintains a sorted weak-dendrites list for migration. A non-plastic tract can skip the reward/punishment call entirely (see `Tract.js:532` — `isSupported()` short-circuits the function), skips migration, and its SVRule is typically just 6-7 lines of straightforward arithmetic.

**Hard-wired semantics prevent catastrophic forgetting.** The attention lobe and decision lobe get their final inputs from `comb→attn` and `comb→decn`. Those tracts are non-plastic by design: the combination lobe is where associations live, and the output pipe from `comb` to `attn`/`decn` is a fixed fan-out that implements "whatever the comb neuron is firing, that's the category the creature is paying attention to." Making that fan-out plastic would mean an unlucky reinforcement event could sever the connection between a concept neuron and its attention target, leaving the creature unable to act on its own thoughts. So the learning is confined to the inbound side of `comb` (where it belongs) and the outbound side is fixed.

The rule of thumb from the standard genome: **learning happens at the inputs to the combination lobe and inside friend-or-foe; routing happens everywhere else.**

## Non-Plastic Tracts in the Standard Genome

Scanning the 29 tracts in the standard brain and flagging those with a `DENDRITE_CODE` operand in their update or init rule:

| Tract | Plasticity (via SVRule) |
|---|---|
| `visn→stim` (#0) | Non-plastic |
| `visn→move` (#1) | **Plastic** |
| `move→stim` (#2) | Non-plastic |
| `comb→attn` (#3) | Non-plastic |
| `comb→decn` (#4) | Non-plastic |
| `driv→comb` (#5) | **Plastic** |
| `stim→comb` (#6) | Non-plastic\* |
| `verb→comb` (#7) | Non-plastic\* |
| `noun→stim` (#8) | Non-plastic |
| `resp→driv` (#9) | Non-plastic |
| `verb→decn` (#10) | Non-plastic |
| `decn→resp` (#11) | Non-plastic |
| `forf→comb` (#12–#14) | **Plastic** |
| `driv→forf` (#15–#18) | **Plastic** |
| `driv→mood` (#19–#22) | Non-plastic |
| `mood→forf` (#23) | Non-plastic |
| `smel→stim` (#24) | Non-plastic |
| `driv→driv` (#25, #27) | Non-plastic |
| `visn→smel` (#26) | Non-plastic |
| `smel→visn` (#28) | Non-plastic |

\* **Caveat on `stim→comb` and `verb→comb`:** the SVRule-only detector reports these as non-plastic, but the reinforcement learning pipeline treats `comb`'s inbound tracts as the main sites of reward/punishment-driven learning. If those tracts carry `reward`/`punishment` reinforcement configured via the `Tract` constructor, their STW will be modified by `processRewardAndPunishment()` every tick the destination neuron wins — without the SVRule needing any `DENDRITE_CODE` operand. See [Reinforcement Learning Pipeline](reinforcement-learning-pipeline.md) for how this second plasticity path works. The Debugger's badge currently reflects only the SVRule dimension, so a tract marked "non-plastic" may still learn via reward/punishment — something to keep in mind when interpreting the label.

The genuinely learning-free tracts are the ones that are (a) non-plastic by SVRule *and* (b) have no reward/punishment support *and* (c) have migration off. `visn→stim` is the canonical example — its dendrite weight columns are confirmed to stay at zero for the creature's whole life, because none of the three plasticity paths is active.

## Reading the Debugger Badge

The **Brain → Tracts** and **Brain → Dendrites** panels display a `PLASTIC` / `NON-PLASTIC` badge next to each tract. Implementation-wise, the badge calls `tractIsPlastic(tract)` in `CreaturesDebuggerModule.js`, which scans both the init rule and the update rule for any entry with `operandVariable === 2`. That's the SVRule-based dimension of plasticity.

What the badge **does** tell you:

- **Green "plastic"** — the tract's SVRule explicitly reads or writes dendrite weights. The weight columns in the Dendrites table will fill in over time as the creature experiences things. Sorting by STW or LTW on this tract shows you what the creature has learned.
- **Red "non-plastic"** — the tract's SVRule never touches `DENDRITE_CODE`. The weight columns will remain at zero unless a *different* plasticity path (reward/punishment or migration) is also active.

What the badge **does not** tell you:

- Whether `reward` / `punishment` are configured on the tract. If they are, STW will still change despite the red badge.
- Whether `dendritesAreRandomlyConnectedAndMigrate` is on. If it is, the *wiring* (which src feeds which dst) will change over time even if the weights are always zero.

If you see a red "non-plastic" tract where the `Dendrites` table nonetheless shows evolving STW values, the reward/punishment path is the reason. Conversely, if you see a red tract where the weights are *truly* locked at zero forever, you are looking at a pure routing relay — exactly the kind of structural wiring the C3 designers built most of the brain out of.

## Why This Matters For Modding

If you are authoring a genome and want a given pathway to *learn*, you have three knobs to reach for, in order of increasing invasiveness:

1. **Add reward and punishment chemicals to the tract.** No SVRule changes needed. The existing fixed-function rule keeps running, and `processRewardAndPunishment` will modulate STW whenever the destination neuron wins and the configured chemical rises above the threshold. This is the cheapest way to turn a relay into a learner.
2. **Rewrite the SVRule to read and/or write dendrite weights.** Replace constants in the transform with `DENDRITE_CODE[0]` (STW) or `DENDRITE_CODE[1]` (LTW), and add store-to-dendrite opcodes so the rule itself updates the weight based on signal correlation. This gives you Hebbian-style learning inside the tract update.
3. **Enable `dendritesAreRandomlyConnectedAndMigrate`.** Structural plasticity — the tract will continuously reclaim weak dendrites and migrate them onto whichever destination neurons are requesting new connections via NGF. This is what the friend-or-foe lobe uses. It is powerful but it only helps if the signal you care about is sparse and the destination neurons correctly advertise demand via NGF.

If you are authoring a pathway that should *never* learn — vision-to-category routing, decision-to-motor mapping, drive-to-mood aggregation — leave all three off and write a straight-line SVRule that reads the source neuron, applies a fixed transform, and stores into the destination neuron. The dendrites will stay at zero, the tract will run fast, and the creature will have stable wiring for the lifetime of its brain. That's exactly what `visn→stim` does, and why all those zeros in the debugger are not a bug — they are the brain working as intended.

## Related Articles

- [Dendrite Migration](dendrite-migration.md) — structural plasticity and the NGF-driven rewiring mechanism
- [Reinforcement Learning Pipeline](reinforcement-learning-pipeline.md) — how reward/punishment chemicals drive the second plasticity path
- [Brain Overview](brain-overview.md) — the big-picture architecture of lobes and tracts
- [Combination Lobe Architecture](combination-lobe-architecture.md) — the main learning hub in the standard genome
