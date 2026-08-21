# Organ #8 — Adipose Tissue (Lipogenesis)

## Overview

Organ #8 is the creature's **fat-storage organ**. It is the point in the body where circulating fat fragments are packed away into long-term **body fat**. If the insulin-producing organ (Organ #3) is a creature's "glucose savings account", Organ #8 is its "fat savings account" — a deeper, denser reserve meant for long-term survival rather than quick fuel.

In real biology this role is performed by **adipose tissue** via **lipogenesis** — the process of synthesising fat cells from circulating triglycerides.

---

## In-Game Role

### Packing fat away

Whenever the creature has leftover **Triglyceride** in its bloodstream (usually after digesting a fatty meal, or after breaking down body fat and not using it all), Organ #8 compacts that triglyceride into **Adipose Tissue** — the creature's stored body fat:

- 8 × Triglyceride → 1 × Adipose Tissue

This is a **very dense storage ratio**: eight units of circulating fat become a single unit of adipose. In return, each unit of stored adipose represents a large amount of potential energy the creature can draw on later. A well-fed Norn with a busy Organ #8 gradually accumulates real reserves that let it survive long fasts, cold spells, or periods of heavy activity.

Without this organ, a creature can *digest* fat (Organ #6) but **cannot build reserves**. Triglycerides would simply float in the bloodstream and decay. A Norn with a damaged Organ #8 eats normally, may look fine in the short term, but has no ability to store anything — the moment food disappears, it collapses.

### Metabolic awareness

Organ #8 watches the creature's current **Pyruvate** level — the main intermediate fuel that every muscle, lung and mitochondrion is churning through. Pyruvate availability tells the organ how energetically active the body is right now:

- If pyruvate is high (the creature has plenty of fresh fuel circulating), Organ #8 runs more readily — there is no reason *not* to put excess fat away when immediate energy needs are already met.
- If pyruvate is low (the creature is running low on fuel), the organ slows down — stocking fat is not a priority when active energy is scarce.

In practice this is what lets a well-fed, resting Norn visibly put on weight over time, while a hungry, active Norn does not even though it may still have triglyceride floating around.

### A small metabolic cost

Building adipose tissue is work. Organ #8 emits a small amount of **Stress** into the circulatory system whenever it fires, contributing to the baseline body-load a creature carries while digesting and storing a meal.

---

## In-Game Effects Summary

- Compacts triglycerides into long-term body fat at an 8-to-1 ratio, giving a Norn a dense energy reserve.
- Is the organ that actually makes a creature "put on weight" after eating well.
- Self-regulates based on how much active fuel (pyruvate) is already available — a resting, well-fed Norn stores fat aggressively; a hungry, active Norn does not.
- Emits a small stress signal while working.

In short: Organ #8 is the reason a Norn can survive a lean stretch. Without it, a creature lives meal to meal with nothing in the bank.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #8 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Triglyceride → Adipose Tissue (fat storage, 8 → 1 compression). |
| Receptors   | 1     | Reads the current Pyruvate level and modulates the storage rate. |
| Emitters    | 1     | Emits Stress into the circulatory system while the organ is active. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #3 — Pancreas (β-cells / Insulin)](organ-03-pancreas-insulin.md)
- [Organ #4 — Pancreas (α-cells / Glucagon)](organ-04-pancreas-glucagon.md)
- [Organ #5 — Pineal Gland](organ-05-pineal-gland.md)
- [Organ #6 — Small Intestine (Lipase)](organ-06-small-intestine.md)
- [Organ #7 — Salivary Glands / Pancreatic Amylase](organ-07-amylase.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
