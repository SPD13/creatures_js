# Organ #6 — Small Intestine (Lipase)

## Overview

Organ #6 is the creature's **fat-digestion organ**. When a Norn eats something rich (seeds, fruit, cheese, fish), the raw **Fat** from that food cannot be used by the body directly — it has to be broken down into a form the liver and fat-storage organs can handle. That is what this organ does.

In real biology this role is performed by the **small intestine**, with the help of pancreatic **lipase** and bile. In-game, Organ #6 is the first step in the chain that turns a fatty meal into usable — and eventually storable — energy.

---

## In-Game Role

### Breaking fat down

Whenever **Fat** appears in the creature's bloodstream (because it has just eaten), Organ #6 breaks it apart:

- 1 × Fat → 3 × Triglyceride + 1 × Cholesterol

Each unit of dietary fat is cut into **three triglyceride fragments** (the form the body can actually transport and store) plus a small amount of **cholesterol** (which is then used by other organs to build cell membranes, hormones and other structural chemicals).

Without this organ, Fat would simply sit in the bloodstream and decay — the creature could eat rich food and still not gain any weight or usable reserves. A Norn with a damaged Organ #6 behaves almost like one that is allergic to fat: it eats, feels briefly full, then collapses back to the same state shortly after.

### Self-regulation from fatty acids

The organ watches the level of free **Fatty Acid** in the creature's body and uses it to pace itself. If the bloodstream is already full of fatty acids (because other organs have been breaking down fat reserves), this organ slows down — there is no point generating more triglycerides when the pipeline downstream is already saturated. When fatty acid levels are low, it runs faster.

In practice this means a creature that has been using up its own fat reserves (during fasting or exertion) digests its *next* fatty meal more aggressively and efficiently.

### A small metabolic cost

Running a fat-digestion organ is not free. Organ #6 emits a small amount of the **Stress** chemical into the circulatory system whenever it works, signalling to the rest of the body that metabolic effort is being expended. This is one of several tiny stress signals that contribute to how hard a Norn feels its body is working — a creature on a rich diet is very slightly more stressed, biochemically, than one on a lean diet.

---

## In-Game Effects Summary

- Turns dietary Fat from food into triglycerides and cholesterol the rest of the body can use.
- Produces three units of triglyceride per unit of fat, giving rich food a clear energy return.
- Regulates its own speed based on how much free fatty acid is already available — leaner creatures digest fat more aggressively.
- Broadcasts a small stress signal while working, a baseline metabolic cost of eating rich food.

In short: Organ #6 is the reason a fatty meal actually fills a creature up. Without it, Fat in the bloodstream goes nowhere.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #6 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Fat → Triglycerides + Cholesterol (dietary fat digestion). |
| Receptors   | 1     | Reads the current Fatty Acid level and modulates the digestion reaction's rate. |
| Emitters    | 1     | Emits Stress into the circulatory system while the organ is active. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #3 — Pancreas (β-cells / Insulin)](organ-03-pancreas-insulin.md)
- [Organ #4 — Pancreas (α-cells / Glucagon)](organ-04-pancreas-glucagon.md)
- [Organ #5 — Pineal Gland](organ-05-pineal-gland.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
