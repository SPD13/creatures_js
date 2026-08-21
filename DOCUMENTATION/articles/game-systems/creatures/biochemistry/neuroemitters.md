# Neuroemitters

## Overview

A neuroemitter is the one-way bridge from a creature's **brain** to its **biochemistry**. Organs, reactions and receptors already let chemistry flow *into* the brain — a receptor on the hunger locus turns the Hunger chemical into a neuron the creature "feels", and receptors on the brain's own neurons let drives steer decisions. Neuroemitters close the loop in the opposite direction: they watch a handful of specific brain neurons, and whenever those neurons fire, they inject chemicals straight into the bloodstream.

In plain terms: a neuroemitter is how *thoughts become hormones*. It lets a creature's biochemistry react to what its brain is doing — what it is looking at, what it has decided, what it is paying attention to — rather than just to what its body is doing.

Unlike the hundred-plus reactions and two-hundred-odd receptors that populate a Norn's genome, neuroemitters are deliberately rare. The standard Norn genome defines just **one**.

---

## What a neuroemitter does

Every neuroemitter in the genome is a tiny self-contained unit made of three parts:

1. **Up to three neuronal inputs.** The gene names a specific neuron in a specific brain lobe (for example, "neuron 37 in the move lobe"). The neuroemitter continuously reads that neuron's activity level. Each input returns a value in the 0–1 range, where 0 means the neuron is quiet and 1 means it is fully active. Unused input slots are treated as a neutral `1` so they do not suppress the emitter.
2. **A sampling rate.** Rather than firing every tick, a neuroemitter accumulates an internal timer and only releases its chemicals when the timer rolls over. A fast rate means the emitter reacts almost instantly to a firing neuron; a slow rate means the neuron has to fire consistently for a while before any chemistry is produced. The rate is the difference between a jumpy, reflexive chemical response and a slow, sustained one.
3. **Up to four chemical emissions.** Each slot holds a chemical ID and an amount. Whenever the emitter fires, those chemicals are added to the bloodstream.

### The "all three must agree" rule

The key piece of logic inside a neuroemitter is how the three neuronal inputs combine. They are **multiplied together**, not summed. Only the *product* of the three activity levels decides how much chemistry is released. This has an important consequence:

- If any one of the three watched neurons is silent (activity 0), the product collapses to 0 and **nothing is emitted**, no matter how active the other two are.
- If all three neurons are fully active (activity 1), the product is 1 and the full configured amounts are released.
- If the neurons are partially active, the release is scaled by the product — two half-active neurons and one full one release only `0.5 × 0.5 × 1 = 0.25` of the configured amount.

This turns a neuroemitter into a biological **AND gate**: the body's chemical response only fires when every watched neuron agrees that a condition is met. It is a way for the genome to say *"release this chemical cocktail, but only when these very specific brain conditions are all true at once"* — something ordinary receptors (which watch only one signal each) cannot easily do on their own.

### Release is additive, not replacement

When a neuroemitter fires, its chemicals are *added* to whatever is already in the bloodstream, capped at the chemical's maximum concentration. A neuroemitter never clears or reduces a chemical — it can only push it upward. The normal half-life decay of the chemical is still what brings it back down afterwards. So a neuroemitter produces **spikes** on top of the existing chemistry, shaped by how fast the chemical it emits fades away.

---

## Why neuroemitters exist (and why there are so few)

Most of what a creature "thinks" about its body is already handled by receptors reading chemicals. Biochemistry drives behaviour via the drive lobe: the Hunger chemical creates the hungry drive neuron, which the decision lobe turns into an eating action. The creature's *body* is always well represented in its brain.

Neuroemitters are there for the opposite case: when the *brain* notices something that the body alone could not measure, and the genome wants that brain event to become a chemical state the rest of the body can react to. Examples that the architecture supports include:

- Seeing a specific category of agent in the visual field.
- A particular decision neuron winning the action-selection race.
- An attention neuron locking onto a subject of a given kind.
- A learned stimulus firing during training.

In practice, almost all the "brain → body" feedback that a Norn needs is already handled indirectly — by stimulus chemicals (reward, punishment, disappointment) that the engine injects in response to brain-triggered events, and by the brain's dedicated reinforcement chemicals (brain chemicals 1 through 9). That leaves neuroemitters with a narrow job: **genome-defined, always-on, multiplicative-AND brain watchers**. Everything else is done better by other machinery. That is why the standard Norn genome needs only one of them.

---

## The only neuroemitter in a standard Norn

The default Norn genome (as of the `Starter Parent 1` reference creature) contains exactly one neuroemitter, switched on from birth. Its wiring is concise enough to describe completely:

| Part | Value | Meaning |
| --- | --- | --- |
| Input 1 | `move` lobe, neuron 37 | "I can see a grendel moving in my visual field" |
| Input 2 | *unused* | always 1 |
| Input 3 | *unused* | always 1 |
| Rate | low / slow | a few ticks of sustained signal are needed before it fires |
| Emission 1 | Adrenalin (chem 117), amount 8 | fight-or-flight hormone |
| Emission 2 | Fear (chem 158), amount 5 | the Fear drive |
| Emission 3 | Crowded (chem 157), amount 6 | the "there are too many things here" drive |
| Emission 4 | *unused* | — |

### Reading the input

The `move` lobe is a motion-detection lobe: each of its 40 neurons corresponds to one of the 40 [agent categories](../../brain-system.md) the creature can recognise (plants, food, bugs, weather, norns, grendels, ettins, …). A `move` neuron lights up when an agent of that category is moving somewhere in the Norn's visual field. Neuron 37 is the grendel category.

So this single input is answering one very specific question:

> *"Is there a grendel moving where I can see it?"*

The other two input slots are unused (filled with neutral placeholders), so the AND-gate collapses to "just this one condition".

### Reading the output

Whenever the above is true for long enough — the slow rate ensures the emitter is not triggered by a single transient glimpse — the neuroemitter pushes three chemicals into the creature's bloodstream in a fixed cocktail:

- **Adrenalin** — the general-purpose "stress/action" hormone. It will then be consumed by the hypothalamus to amplify emotions, by the pancreas to mobilise energy from glycogen, and by the brain's reinforcement machinery.
- **Fear** — the Fear drive directly, which is what the creature *feels*. The decision lobe reads this drive via its receptor and biases action selection toward fleeing, retreating, hiding or expressing distress.
- **Crowded** — the "I don't want to be here" drive. This is the same drive that rises when too many creatures are nearby; the emitter reuses it to say "this specific creature really shouldn't be near me either", pushing the Norn to move away from the grendel.

### What this means for the creature

Put together, these three chemicals are the **hard-wired fear response to grendels** that every standard Norn carries from birth, before any learning has happened. A newborn Norn has never seen a grendel, knows nothing about them, and has no learned instinct distinguishing them from other agents — but the moment a grendel *moves* into view, the genome guarantees an immediate spike of adrenalin, fear, and a "get away from here" push, all delivered by a single neuroemitter. The behaviour that follows — the Norn freezing, retreating, expressing distress, sometimes turning on the grendel aggressively once adrenalin escalates fear into anger in the [hypothalamus](../organs/organ-01-hypothalamus.md) — is the downstream consequence of that one chemical event.

This is also why grendels are special in Creatures 3: they are the only species of agent that the Norn biochemistry itself is genetically wired to fear. Every other frightening or threatening situation has to be learned.

---

## Neuroemitters vs neighbouring mechanisms

It is worth distinguishing neuroemitters from three other pieces of biochemistry they are often confused with:

- **Emitters** (organ-resident, not neuron-resident) watch a creature's **body** state — organ damage, life force, fertile locus, asleep locus, pheromone loci, air loci — and release chemicals based on those. A neuroemitter watches a **brain neuron** instead. Emitters live inside an organ; neuroemitters live in the biochemistry as a whole.
- **Receptors** go the other way: they **read a chemical and write into a body or brain locus**. Receptors feed biochemistry into the brain (via drive loci, brain-neuron loci) and into the body (via gait loci, death loci, ageing loci). Neuroemitters do the inverse of a brain-targeting receptor.
- **Stimulus-driven chemical injections** (reward, punishment, disappointment, reinforcement chemicals 1–9) are delivered by the engine itself in response to events the creature experiences — eating, being slapped, winning or losing a decision, hearing a word. They are not genome-configurable in the same way: the hooks and chemicals are engine-level. Neuroemitters are the genome's tool for doing something similar *without* engine support, by watching any neuron and choosing any chemicals.

Neuroemitters are therefore the genome's most general-purpose, but also most narrowly used, way of saying "when this brain state holds, let this chemistry happen".

---

## Summary

A neuroemitter is a small biochemistry unit that:

- Watches up to three specific brain neurons.
- Combines their activity multiplicatively, so **all** watched neurons must be active for the emitter to fire at full strength.
- Releases up to four chemicals into the bloodstream at a configurable rate.

In the default Norn, this mechanism is used exactly once, to implement a single reflex: **when a Norn sees a grendel moving, its body floods with adrenalin, fear and an urge to flee**. Every other brain-to-body coupling a standard Norn needs is delivered through organ emitters, receptors, and engine-level reinforcement chemicals — but the one reflex that has to exist from birth, in every Norn, is the fear of grendels, and it is a neuroemitter that guarantees it.
