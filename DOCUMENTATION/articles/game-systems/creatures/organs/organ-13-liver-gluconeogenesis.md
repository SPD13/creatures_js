# Organ #13 — Liver (Gluconeogenesis)

## Overview

Organ #13 is the creature's **emergency sugar factory**. It sits structurally beside the main liver (Organ #2) but has one highly specialised job: **rebuilding glucose out of the body's intermediate products** when the ordinary supply has run dry. It is also the organ that makes a creature feel hungry specifically for protein when its reserves are being stripped for fuel.

In real biology this role is handled by the **liver via gluconeogenesis** — the metabolic pathway that runs the energy chain *in reverse* to recover glucose from pyruvate, lactate and amino acids during fasting or heavy exertion.

---

## In-Game Role

### Running glycolysis in reverse

Organ #12 breaks glucose down to produce pyruvate and ATP. Organ #13 does the opposite:

- 2 × Pyruvate + 2 × ATP → 1 × Glucose + 2 × ADP

Every two units of pyruvate and two units of ATP are fused back into a fresh unit of glucose, **spending energy in the process** to do it. This is a costly reaction — unlike most of the creature's metabolism, Organ #13 actually *consumes* ATP rather than producing it. The trade-off is that it gives the body a way to generate blood sugar **even when there is nothing left to digest**.

This is the reason a starving Norn does not immediately collapse the moment its food supply runs out. Body fat, amino acids from muscle, and circulating intermediates can all feed back into this organ to keep a thin but vital supply of glucose flowing to the brain, lungs and muscles. It is the creature's **last-resort sugar supply** — and it is what separates a long, slow decline from an instant crash.

A Norn with a damaged Organ #13 looks fine as long as food is plentiful, but **cannot recover from a fast**. The moment it runs out of digestible food and quick reserves, its blood sugar drops sharply and its whole metabolism stalls.

### Amino-acid-driven pacing

Organ #13 watches the creature's current **Amino Acid** level to decide how hard to run. Amino acids are one of the raw materials gluconeogenesis uses (broken-down protein can feed back into the pyruvate pool), so:

- When amino acids are plentiful, Organ #13 runs more aggressively — the creature has protein to spare, and can afford to convert some of it into sugar.
- When amino acids are scarce, the organ slows — the body is already low on protein and cannot cannibalise more of itself.

In practice a protein-rich diet quietly buffers a Norn against starvation by keeping this reaction primed.

### Triggering protein hunger

Organ #13's most visible effect in-game is on the creature's *behaviour*: it constantly broadcasts a small amount of the **Hunger for protein** drive into the circulatory system while it is running. The more the organ is forced to fire (typically because the creature is using its reserves hard), the more the protein-hunger drive climbs.

Downstream, the hypothalamus (Organ #1) turns that signal into a *felt* drive — and the Norn starts actively seeking out protein-rich food like meat, cheese or eggs. A well-fed, resting creature barely triggers this organ and so feels no special craving; a tired, depleted creature triggers it heavily and visibly develops an appetite for protein.

It is why a Norn that has been exerting itself — running, fighting, surviving a fast — often moves directly toward protein food afterwards, even if more food is also available.

---

## In-Game Effects Summary

- Rebuilds blood glucose from pyruvate and ATP so the creature has a last-resort sugar supply during fasts or heavy exertion.
- Actually *spends* energy to do this — it is a costly reaction that trades ATP for usable sugar.
- Is the reason a Norn can survive a long time without food rather than crashing the moment reserves run out.
- Paces itself with the creature's current amino-acid supply — protein-rich diets keep the reaction primed and effective.
- Generates the **Hunger for protein** drive, which is why an exerted or depleted Norn actively seeks out meat, cheese and other protein-rich foods.

In short: Organ #13 is the creature's **survival sugar reserve** and the reason a hard-working Norn specifically craves protein rather than generic food.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #13 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Pyruvate + ATP → Glucose + ADP (gluconeogenesis, reverse glycolysis). |
| Receptors   | 1     | Reads the current Amino Acid level and paces the reaction with protein availability. |
| Emitters    | 1     | Emits Hunger for protein into the circulatory system while the organ is active. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #12 — Skeletal Muscle (Glycolysis)](organ-12-muscle-glycolysis.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
