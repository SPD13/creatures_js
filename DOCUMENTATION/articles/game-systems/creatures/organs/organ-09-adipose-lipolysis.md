# Organ #9 — Adipose Tissue (Lipolysis)

## Overview

Organ #9 is the **mirror image** of Organ #8. Where the fat-storage organ packs circulating fat into dense body-fat reserves, Organ #9 does the opposite: it **tears those reserves back open** and releases them as circulating fat that the rest of the body can burn. Together, Organ #8 and Organ #9 form the creature's **body-fat turnover loop** — one fills the larder, the other empties it.

In real biology this corresponds to **adipose lipolysis** — the chemical breakdown of stored fat droplets during fasting, exercise or cold exposure.

---

## In-Game Role

### Releasing stored fat

Whenever the creature needs more fuel than its immediate blood sugar can provide, Organ #9 unpacks **Adipose Tissue** (body fat) back into **Triglyceride** — the transportable form of fat that other organs can turn into energy:

- 1 × Adipose Tissue → 8 × Triglyceride

This is a **large release**: a single unit of stored fat yields eight units of circulating triglyceride, which downstream organs then convert into fatty acids, pyruvate and finally ATP. It is the reason a well-padded Norn can keep going through a long stretch without food, and why creatures visibly **lose weight** when they are forced to rely on their reserves for energy.

Without this organ, a Norn could still build up body fat (Organ #8 keeps storing) but **would never be able to spend it**. It would look increasingly healthy while quietly starving — plenty in the bank, no way to withdraw.

### Glucose-driven regulation

Organ #9 watches the creature's current **Glucose** level. Glucose is the body's first-line fuel, so its level tells the organ whether the creature needs to tap its fat reserves at all:

- When glucose is plentiful (the creature has just eaten or has drawn down its glycogen), Organ #9 slows down — there is no need to break open fat reserves when sugar is already flowing.
- When glucose is scarce (the creature has burned through its quick fuel), Organ #9 runs eagerly, pumping triglycerides back into the bloodstream so the body stays fuelled.

In practice this is what turns fasting, activity and cold exposure into **visible weight loss** in-game. A Norn that goes long enough without food exhausts its sugar supply, which in turn triggers this organ to release stored fat — and the creature's body gradually shrinks as the reserves are drained.

### A small metabolic cost

Breaking down body fat is work. Organ #9 emits a small amount of **Stress** into the circulatory system whenever it fires, contributing to the overall body-load a creature carries while running on its reserves — one of the small biochemical signals that make a hungry, lean Norn feel different from a well-fed one.

---

## In-Game Effects Summary

- Turns stored body fat back into circulating triglycerides at an 8-to-1 expansion — a large amount of usable fuel for each unit of reserve.
- Is the reason a hungry Norn can keep moving, and the reason it visibly loses weight while doing so.
- Self-regulates from blood glucose: when sugar is abundant, fat reserves are left alone; when sugar runs out, the reserves start draining.
- Emits a small stress signal while working, signalling the body's metabolic load.
- Together with Organ #8, keeps the creature's fat reserves in steady turnover rather than stuck at one level.

In short: Organ #9 is the creature's **fuel withdrawal valve**. Without it, reserves accumulate and starvation still kills.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #9 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Adipose Tissue → 8× Triglyceride (fat reserve release). |
| Receptors   | 1     | Reads the current Glucose level and modulates the release rate. |
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
- [Organ #8 — Adipose Tissue (Lipogenesis)](organ-08-adipose-storage.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
