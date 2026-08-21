# Organ #12 — Skeletal Muscle (Glycolysis)

## Overview

Organ #12 is the creature's **working muscle** — the place where blood sugar is actually *spent* on movement. It takes incoming glucose and converts it into usable energy (ATP) for every other part of the body to use, while also signalling to the body that it is being exercised and deserves to grow.

In real biology this is the job of **skeletal muscle glycolysis**: the first stage of energy production, where glucose is partially broken down to produce ATP and pyruvate (which the lungs and mitochondria then finish processing).

---

## In-Game Role

### Turning sugar into usable energy

Whenever the creature has **Glucose** in its bloodstream and **ADP** (the "empty battery" form of ATP) to refill, Organ #12 performs the central energy reaction that powers almost every other organ:

- 1 × Glucose + 2 × ADP → 2 × Pyruvate + 2 × ATP

Each unit of glucose spent here produces **two units of ATP** — the creature's universal energy currency — and **two units of pyruvate**, which downstream organs (lungs, mitochondria, heart) then use to produce even more energy.

This is the reaction that powers movement. Every step, every pose change, every bit of voluntary action costs ATP, and this organ is the primary factory that replenishes it. A Norn with a damaged Organ #12 simply **cannot keep up with its own activity** — it may have plenty of food, plenty of reserves, plenty of oxygen, and still collapse into exhaustion because the main ATP-production line has gone silent.

### Protein-sensitive pacing

Organ #12 watches the creature's current **Amino Acid** level. Amino acids are the building blocks that the rest of the body uses to maintain muscle tissue, and their availability is a good proxy for how well-fed and well-supported the muscles are:

- When amino acid levels are high (the creature has been eating protein-rich food), the organ runs more aggressively — the muscles are healthy and can be pushed.
- When amino acid levels are low, the organ slows — an underfed, protein-starved Norn cannot produce energy at the same rate.

In practice this is why a Norn that has eaten well and built up its body is more energetic and active than one that has been living on leftovers. Diet directly shapes performance.

### Building muscle through activity

The organ also emits **Anabolic steroid** toward the creature's muscle tissue whenever it runs. This is the growth signal the rest of the body reacts to:

- Muscle-growth organs (primarily the liver, Organ #2) consume the amino acids and anabolic steroid to turn them into new **Muscle Tissue**.

The consequence is that **active creatures get stronger**. A Norn that runs, climbs, fights and explores produces a steady stream of anabolic steroid, keeps its muscle being rebuilt, and over time looks and performs like a creature in its prime. A sedentary Norn produces almost none, and its muscle tissue slowly yields to turnover reactions that break it back down into amino acids.

Without this organ, not only would the creature not be able to power itself, but its body would also stop being *maintained* — there would be no signal telling the rest of the biochemistry to keep building muscle.

---

## In-Game Effects Summary

- Powers the creature's movement by turning glucose into ATP (two units of ATP per unit of sugar).
- Also produces pyruvate, feeding the downstream energy chain (lungs, heart, mitochondria).
- Paces itself with the creature's amino acid supply — protein-rich diets boost energetic output; underfed Norns are visibly slower.
- Emits anabolic steroid toward muscles, telling the body to rebuild muscle tissue. Active Norns stay strong; sedentary ones weaken.

In short: Organ #12 is the **engine that actually turns food into action**. It is why a Norn has the energy to do anything at all, and why being active makes a creature stronger over time.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #12 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Glucose + ADP → Pyruvate + ATP (glycolysis, primary ATP production). |
| Receptors   | 1     | Reads the current Amino Acid level and paces glycolysis with protein availability. |
| Emitters    | 1     | Emits Anabolic Steroid toward the creature's muscle tissue, driving muscle growth. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #11 — Skeletal Muscle (Fatigue Sensor)](organ-11-muscle-fatigue.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
