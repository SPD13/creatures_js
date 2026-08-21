# Organ #17 — Mitochondria (β-Oxidation)

## Overview

Organ #17 is the creature's **fat-burning engine**. Where the muscle glycolysis organ (Organ #12) turns sugar into energy, Organ #17 does the same job using **fat** as the fuel. It is what lets a Norn keep moving on body-fat reserves during a fast, during heavy exertion, or when its sugar supply is running low — a second, deeper energy pipeline sitting alongside the sugar one.

In real biology this maps to the **mitochondrial β-oxidation** pathway: the cellular machinery that breaks fatty acids down, rung by rung, to feed the same ATP-producing chain that sugar does.

Organ #17 also does a little extra: it helps a creature **cool off after overheating**, and it is one of the organs that makes a Norn actively feel crowded when there are too many others nearby.

---

## In-Game Role

### Burning fat for energy

The main reaction of Organ #17 is the big one — turning fatty acids into usable energy:

- 1 × Fatty Acid + 6 × ADP → 8 × Pyruvate + 6 × ATP

Each unit of fatty acid sent through this organ yields **eight units of pyruvate and six units of ATP**. That is a very generous return: fat is the densest fuel in the creature's biochemistry, and this organ is where that density actually gets unlocked. The pyruvate produced here then feeds into the lungs and the heart, closing the loop on the creature's respiration chain.

This is why a Norn running low on sugar does not immediately collapse. As long as its body is releasing fatty acids (either from a fatty meal or from its adipose reserves being broken down), this organ keeps the ATP flowing.

A creature with a damaged Organ #17 effectively cannot use its fat reserves. Sugar-derived energy still works, but the moment sugar runs out the Norn crashes — there is no secondary fuel line to fall back on. Such a creature will visibly **crash hard after exertion** or during a fast, even if its body fat levels look perfectly healthy.

### Repackaging free fatty acids

The organ also runs a smaller, quiet reaction in the opposite direction:

- 3 × Fatty Acid → 1 × Triglyceride

When there is more fatty acid circulating than the body currently needs to burn, Organ #17 pulls some of it back into triglyceride form. That triglyceride can then be stored (by Organ #8) or simply stay in circulation for later use. It is a small flywheel that keeps the fatty-acid pool from becoming too wild — preventing sudden spikes of free fat from overwhelming the rest of the metabolism.

### Cooling down after overheating

Organ #17 also slowly drains the **Hotness** drive back into its backup reservoir:

- 1 × Hotness → 1 × Hotness backup

Together with the liver's thermoregulation reactions, this is part of what lets a Norn that has just been warm actually feel cool again. Without it, the sensation of being hot would fade much more slowly, and creatures that ran through warm parts of the world would stay flushed and uncomfortable for far too long.

### Glucose- and pistle-aware pacing

Organ #17 watches the creature's current **Glucose** level and its **Pistle** (circulatory) level, and uses both to regulate its reactions:

- A creature that still has sugar to burn (high glucose) runs the fat-burning side less urgently — there is no need to draw on fat when sugar is plentiful.
- When pistle and glucose patterns indicate the creature is between fuel sources, the organ shifts to its heavier fat-burning mode.

In practice this is why a hungry Norn burns fat most intensively, while a well-fed one uses the fat pathway more as an assist than as the main engine.

### The "feeling crowded" signal

The organ is also a source of the creature's **Crowded** drive. Whenever the creature is surrounded by other Norns, Organ #17 converts that environmental crowdedness into a real, felt Crowded signal. This is what makes a Norn in a full room actually notice the press of bodies and eventually move to find space.

Without this signal, a creature could share a world with any number of companions and never feel especially cramped — it would miss one of the social cues that normally shape creature behaviour.

### Stress broadcasting

Finally, Organ #17 also emits two additional **Stress** channels into the circulatory system. Fat-burning is expensive, and a creature that is relying heavily on its reserves is biochemically stressed — these signals feed downstream organs that respond to different flavours of stress, tuning their behaviour to the creature's current metabolic state.

---

## In-Game Effects Summary

- Turns body fat (and dietary fat) into a flood of ATP and pyruvate, keeping the creature fuelled when sugar is unavailable.
- Acts as the creature's secondary engine — paired with Organ #12, it covers both sugar-burning and fat-burning.
- Also repackages surplus free fatty acids into triglycerides to keep the fuel pool stable.
- Drains the felt Hotness drive back to its reservoir, letting a warm creature cool down.
- Generates the **Crowded** drive based on how many other Norns are nearby.
- Broadcasts two extra stress signals — the metabolic cost of relying on fat for fuel.

In short: Organ #17 is what makes **body fat actually useful**. Without it, fat reserves exist but never turn into energy, and a Norn that runs out of sugar runs out of everything.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #17 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 3     | Fatty Acid + ADP → Pyruvate + ATP (main fat-burning); Fatty Acid → Triglyceride (repackaging surplus free fat); Hotness → Hotness backup (cooling recovery). |
| Receptors   | 3     | Reads the current Glucose and Pistle levels to pace its reactions between sugar-rich and sugar-poor states. |
| Emitters    | 3     | Emits the Crowded drive based on crowdedness sensing; emits two flavours of Stress while the organ is active. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #8 — Adipose Tissue (Lipogenesis)](organ-08-adipose-storage.md)
- [Organ #9 — Adipose Tissue (Lipolysis)](organ-09-adipose-lipolysis.md)
- [Organ #10 — Jejunum / Fat Appetite Sensor](organ-10-jejunum.md)
- [Organ #12 — Skeletal Muscle (Glycolysis)](organ-12-muscle-glycolysis.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
