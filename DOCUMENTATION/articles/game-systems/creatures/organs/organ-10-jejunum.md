# Organ #10 — Jejunum / Fat Appetite Sensor

## Overview

Organ #10 sits at the end of the creature's fat-digestion chain and is the one responsible for turning circulating fat fragments into **usable fuel**. It is also the organ that generates the **Hunger-for-fat drive** — the felt need that pushes a Norn toward fatty food when its supplies are running low.

In real biology this role sits with the **jejunum** (the middle section of the small intestine, where fatty acids are finally absorbed) combined with the hypothalamic fat-appetite signal.

---

## In-Game Role

### Finishing fat digestion

Whenever **Triglyceride** is available in the bloodstream — either because the creature has just digested a fatty meal or because its body-fat reserves have been released — Organ #10 breaks the triglycerides down into their usable form, **Fatty Acid**:

- 1 × Triglyceride → 3 × Fatty Acid

Fatty acid is the form of fat that downstream organs (the liver, the mitochondria, the muscles) can actually burn for energy. Without this organ, triglycerides would pile up in circulation without ever becoming fuel — a Norn would eat, digest, store and release fat perfectly well, but never reach the point of **getting energy out of it**.

The 1:3 ratio means one triglyceride yields three fatty acids, so even a small amount of fat in the bloodstream delivers a meaningful amount of burnable fuel.

### Metabolic pacing

Organ #10 listens to the creature's current **Pyruvate** level — the intermediate fuel everything else is running on. It uses pyruvate as a proxy for how energetically active the body is:

- When pyruvate is high, the organ runs eagerly — there is clear demand for fuel.
- When pyruvate is low, the organ slows — no point preparing fatty acids the body is not ready to spend.

In practice this keeps the creature's fat-burning rate tied to its overall activity. A resting Norn processes fat calmly; an active or stressed Norn processes it faster.

### The hunger-for-fat signal

Organ #10's most important in-game role is not chemical but *behavioural*. It constantly emits a steady trickle of the **Hunger for fat** drive into the sensorimotor system:

- Constant emitter → Hunger for fat

This steady drip is what makes a creature actually **feel hungry for fat** over time, nudging it toward eating the fatty foods in its environment. Elsewhere in the body (the liver, mainly) the active fat-hunger drive is gradually drained back into its reservoir — so the felt level depends on a balance between this organ's continuous emission and the drains downstream.

In practice:

- A creature that has been eating plenty of fatty food keeps its fat hunger suppressed by the downstream drains faster than this organ can emit, so it does not feel especially hungry for fat.
- A creature that has gone without fat builds up the hunger-for-fat signal until it becomes a dominant drive — pushing the Norn to go hunt for fatty food.

Without this organ, a Norn would simply never feel hungry for fat specifically, and would have no reason to seek out rich foods when its reserves were depleted.

---

## In-Game Effects Summary

- Breaks circulating triglycerides down into fatty acids — the last step before fat becomes actual burnable fuel.
- Each triglyceride yields three fatty acids, giving a healthy fuel return.
- Paces itself with the body's overall fuel demand (via pyruvate), so active Norns burn fat faster than resting ones.
- Continuously emits the **Hunger for fat** drive, which is what makes a Norn actively seek out fatty foods when its fat supply is low.

In short: Organ #10 is where **fat becomes fuel**, and it is the reason Norns go looking for cheese, fish or fruit on their own — the drive is built here.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #10 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Triglyceride → 3× Fatty Acid (final step of fat digestion). |
| Receptors   | 1     | Reads the current Pyruvate level and modulates the reaction's rate. |
| Emitters    | 1     | Constant emission of the Hunger for fat drive into the sensorimotor system. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #6 — Small Intestine (Lipase)](organ-06-small-intestine.md)
- [Organ #8 — Adipose Tissue (Lipogenesis)](organ-08-adipose-storage.md)
- [Organ #9 — Adipose Tissue (Lipolysis)](organ-09-adipose-lipolysis.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
