# Organ #0 — Hidden Body Organ ("Brain")

## Overview

Organ #0 is the creature's **invisible root organ**. Every other organ in a Norn's body — the liver, the lungs, the heart, the stomach, the gonads — is declared explicitly in the genome. Organ #0 is different: it is created automatically at birth, with no gene of its own, to act as a **catch-all container** that holds the creature's body together at the biochemical level. In the Creature Debugger it is labelled **"Brain"** by convention, but it is not the neural brain (which is a separate system of lobes, neurons and dendrites); it is the body's root, the silent organ that always exists.

For a standard Norn, Organ #0 does almost nothing that a keeper will ever notice directly. It is one of those organs whose absence would be felt far more than its presence.

---

## In-Game Role

### The creature's backbone

Organ #0 is created at the moment a Norn is born and persists for the entirety of its life. It is always the first organ in the creature's body and is the one that guarantees the biochemistry system has a minimum working shape — even before any other organ is declared, the creature has a body to put them in.

A Norn's biochemistry is built like a house with rooms. Each explicit organ (liver, lungs, etc.) is a room with its own furniture and function. Organ #0 is the ground on which those rooms are built — a featureless foundation whose only real job is to *exist* so the rest of the body has something to attach to. In a standard genome that foundation has no furniture of its own; it is empty, but essential.

### A home for homeless chemistry

Organ #0's other role is to act as a **safety net for unusual genomes**. If a creature is built from a custom or experimental genome that declares biochemistry (reactions, receptors, emitters) *before* declaring any organ to put it in, that biochemistry does not vanish — Organ #0 picks it up. For most Norns this never happens; the standard genome puts every piece of biochemistry inside a real organ. But for modified breeds, experimental genomes, or strange hybrids, Organ #0 is what keeps an otherwise malformed body running.

In other words, it ensures that **every piece of genetic biochemistry has a home**, even the ones whose author forgot to assign them one.

### A constant, minimal energy cost

Even with no reactions or signals to run, Organ #0 still **participates in the creature's metabolism**. Like every other organ, it ticks at a regular rhythm, draws a small amount of ATP from the body, and can take damage if the creature runs out of energy. It also ages, repairs, and eventually fails like any other organ. For a standard Norn this cost is small and invisible — just a quiet baseline drain that is part of simply being alive.

That small drain does mean one thing, however: **even an empty body still burns a little fuel**. A creature cannot exist without paying the cost of its own existence, and Organ #0 is one of the organs paying that cost on the creature's behalf.

### Following the creature through life

Like every other organ, Organ #0 goes through the Norn's life stages. It is set up at birth, continues running through childhood, adolescence, adulthood and old age, and only stops when the creature dies. During that life it can accumulate injury, be repaired, and eventually fail — and if it does fail, the creature loses the one organ that all the others implicitly rely on to be present. In practice Organ #0 is so minimal that it rarely fails before other more active organs do; it tends to be one of the last things to go.

---

## In-Game Effects Summary

- Is the creature's **always-there foundation organ**, guaranteeing the biochemistry system has a working shape from the moment of birth.
- On a standard Norn, it has **no direct, visible effect** on the creature's behaviour — no reactions, no drives, no signals.
- Quietly pays a small baseline ATP cost per tick, contributing to the minimum energy the creature needs just to stay alive.
- Acts as a **safety container** for experimental or custom genomes where biochemistry is declared before any other organ, ensuring that nothing genetic is thrown away.
- Is labelled **"Brain"** in the Creature Debugger as a historical convention, but is not the neural brain — it is the body's root, not a thinking organ.

In short: Organ #0 is the creature's structural baseline — the invisible organ every Norn always has, whose existence matters far more than anything it does.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #0 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 0     | No explicit reactions. The organ still consumes a small, steady amount of ATP each tick as its share of being alive. |
| Receptors   | 0     | Does not read any locus — the organ is purely structural. |
| Emitters    | 0     | Does not emit any chemical — the organ is a container, not a broadcaster. |

For standard Norns, Organ #0 is **metabolically minimal**. A custom or experimental genome that puts biochemistry genes before the first explicit organ declaration would populate these counts — that is the scenario in which Organ #0 stops being purely structural.

---

## Related Articles

- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
