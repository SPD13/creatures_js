# Organ #7 — Salivary Glands / Pancreatic Amylase

## Overview

Organ #7 is the creature's **carbohydrate-digestion organ**. When a Norn eats something starchy (bread, fruit, seeds, vegetation), the raw **Starch** from that food is too complex to be used by the body directly. It has to be broken down into simple sugar first. That is this organ's only job.

In real biology this role is shared between the **salivary glands** and the **pancreas**, both of which secrete the enzyme **amylase** that cuts starch into glucose. In-game, Organ #7 is the first step in turning a carbohydrate meal into fuel the rest of the body can actually burn.

---

## In-Game Role

### Turning starch into sugar

Whenever **Starch** appears in the creature's bloodstream after a meal, Organ #7 breaks it apart into **Glucose** — the universal fuel the rest of the creature's organs run on:

- 1 × Starch → 4 × Glucose

This is a **highly rewarding** reaction: every unit of starch yields four units of glucose. Starchy food is therefore one of the most efficient energy sources in the game — eat a carrot or a piece of grain and a Norn's blood sugar climbs quickly, which its muscles and lungs can immediately convert into ATP.

Without this organ, Starch would sit in the bloodstream and slowly decay. The creature could eat piles of carbohydrate-rich food and still feel hungry and weak, because the food would never turn into anything usable. A Norn with a damaged Organ #7 effectively becomes **carbohydrate-intolerant** — it has to rely entirely on protein and fat from its diet to survive.

### Self-regulation from fatty acids

The organ watches the creature's current **Fatty Acid** level and paces itself accordingly. When the body already has plenty of fatty acids circulating (because fat reserves are being burned), this organ slows down — glucose is less urgent when alternative fuel is already available. When fatty acid levels are low, it runs faster, pushing more sugar into the blood.

In practice this is a light form of the real-life glucose/fat preference balance: a Norn that has been relying on its fat reserves digests its *next* starchy meal a little more slowly, while a lean, fat-depleted Norn digests the same meal aggressively.

### A small metabolic cost

Digestion is not free. Like the fat-digestion organ, Organ #7 emits a small amount of the **Stress** chemical into the circulatory system whenever it works. This is part of the baseline "I am digesting a meal" metabolic load the creature carries — it is small, but it adds up when every digestive organ is active at once after a large feed.

---

## In-Game Effects Summary

- Turns dietary Starch into Glucose at a generous 4-for-1 ratio — starchy food is one of the best fuels in the game.
- Pairs with Organ #6 (fat digestion) and Organ #14 (protein digestion) to cover all three macronutrients.
- Regulates its own rate based on how much fat the creature is already burning — lean Norns process carbs more eagerly.
- Emits a small stress signal while working, contributing to the body's post-meal metabolic load.

In short: Organ #7 is the reason a bowl of carbs gives a Norn fast, usable energy. Without it, carbohydrates are wasted.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #7 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Starch → 4× Glucose (carbohydrate digestion). |
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
- [Organ #6 — Small Intestine (Lipase)](organ-06-small-intestine.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
