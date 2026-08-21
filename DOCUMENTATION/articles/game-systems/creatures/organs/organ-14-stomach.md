# Organ #14 — Stomach (Pepsin)

## Overview

Organ #14 is the creature's **protein-digestion organ**. When a Norn eats something rich in protein (meat, cheese, eggs, insects), the raw **Protein** from that food cannot be used by the body directly — it has to be broken down into the simpler building blocks the rest of the biochemistry is designed around. That is this organ's one and only job.

In real biology this corresponds to the **stomach**, where the enzyme **pepsin** begins digesting protein into peptides and amino acids.

Together with Organ #6 (fat digestion) and Organ #7 (carbohydrate digestion), this organ completes the trio of macronutrient digesters that turn a Norn's meals into usable chemistry.

---

## In-Game Role

### Breaking protein into amino acids

Whenever **Protein** appears in the creature's bloodstream after a meal, Organ #14 tears it apart into **Amino Acid** — the universal protein building block the rest of the body uses:

- 1 × Protein → 4 × Amino Acid

Every unit of dietary protein becomes **four units of amino acid**, a generous return that feeds directly into the rest of the metabolism. Amino acids are what the liver (Organ #2) combines with anabolic steroid to build new **Muscle Tissue**, what the muscle glycolysis organ (Organ #12) uses as a pacing signal, what Organ #13 uses to rebuild glucose in emergencies, and what gets recycled back into fuel when food runs out.

Without this organ, Protein in the bloodstream is useless. A Norn with a damaged Organ #14 could eat all the meat and cheese in the world and still waste away — its body simply would not be able to unlock the nutrition from it. Muscle growth would stall, amino-acid-paced reactions across the rest of the body would slow down, and the creature would visibly weaken even on a rich diet.

### Fat-aware pacing

Organ #14 watches the creature's current **Triglyceride** level — the circulating form of fat — and uses it to pace itself. Triglyceride availability tells the organ roughly how *fatty* the current meal is:

- When triglyceride levels are high (the creature has just eaten a fat-rich meal, or is mobilising its body fat), Organ #14 runs more readily — digesting the protein that usually accompanies those fats.
- When triglyceride levels are low, the organ slows — protein digestion eases off when the body is not already handling a meal.

In practice this is a subtle coupling between fat and protein digestion, reflecting the fact that most real foods contain a mix of both. A Norn that has just eaten a balanced, rich meal digests its protein aggressively; one that is running empty does not.

### A small metabolic cost

Digestion is work. Like the other digestive organs, Organ #14 emits a small amount of **Stress** into the circulatory system whenever it is active. It is one of several tiny signals that collectively represent the baseline metabolic load of digesting a meal — a well-fed Norn with all three digestive organs running is quietly, biochemically, a little more stressed than one between meals.

---

## In-Game Effects Summary

- Turns dietary Protein into Amino Acids at a generous 1-to-4 ratio — the reason a meat or cheese meal produces so much usable building material.
- Completes the macronutrient-digestion trio together with Organ #6 (fat) and Organ #7 (carbs).
- Supplies the amino acids that fuel muscle growth, gluconeogenesis, and the pacing of several metabolic organs.
- Paces itself with the creature's current triglyceride level, coupling protein digestion to overall meal richness.
- Emits a small stress signal while working.

In short: Organ #14 is the reason a Norn actually gains something from eating meat or cheese. Without it, protein-rich food is wasted, muscle growth stalls, and the whole body runs lean no matter what the creature eats.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #14 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Protein → 4× Amino Acid (protein digestion). |
| Receptors   | 1     | Reads the current Triglyceride level and modulates the digestion rate. |
| Emitters    | 1     | Emits Stress into the circulatory system while the organ is active. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #6 — Small Intestine (Lipase)](organ-06-small-intestine.md)
- [Organ #7 — Salivary Glands / Pancreatic Amylase](organ-07-amylase.md)
- [Organ #12 — Skeletal Muscle (Glycolysis)](organ-12-muscle-glycolysis.md)
- [Organ #13 — Liver (Gluconeogenesis)](organ-13-liver-gluconeogenesis.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
