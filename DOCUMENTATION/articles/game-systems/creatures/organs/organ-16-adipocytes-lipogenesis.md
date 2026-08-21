# Organ #16 — Adipocytes (de novo Lipogenesis)

## Overview

Organ #16 is the creature's **"turn extra sugar into fat"** organ. Where the earlier fat-handling organs deal with dietary fat (digesting it, storing it, releasing it), Organ #16 does something different: it **manufactures fat from scratch** out of the intermediate products of sugar metabolism. It is what lets a Norn that eats a lot of carbohydrate but little fat still build up body-fat reserves over time.

In real biology this role is performed by **adipocytes** carrying out **de novo lipogenesis** — the synthesis of new fatty acids from surplus glucose-derived carbon.

It is also the source of one of the creature's most important appetite signals: the constant nudge toward protein.

---

## In-Game Role

### Making fat out of sugar

Whenever the creature has lots of **Pyruvate** (the intermediate the muscles and lungs produce from burning sugar) and lots of **ATP** (the creature's energy currency), Organ #16 fuses them into fresh **Fatty Acid**, paying a substantial ATP cost to do so:

- 8 × Pyruvate + 6 × ATP → 1 × Fatty Acid + 6 × ADP

Each new unit of fatty acid the organ builds can then be picked up by other organs: repackaged into triglycerides, stored in adipose tissue, or later burned for energy. The chain runs exactly as a real-world metabolism would — **excess sugar, over time, becomes body fat**.

This is the organ that lets a Norn on a carb-heavy diet still survive lean stretches. Without it, carbohydrates could fuel the creature moment to moment, but would never translate into durable reserves. A Norn that has a damaged Organ #16 essentially **can only store fat when it eats fatty food directly** — any excess sugar simply burns off or decays, and the creature stays lean and fragile.

### An energy-costly conversion

Unlike most reactions in the body, Organ #16 *spends* ATP rather than producing it. Turning sugar into fat is work, and work costs energy. In practice this means:

- A **well-fed, energetic Norn** (plenty of ATP) runs this reaction enthusiastically and builds up reserves.
- A **hungry, depleted Norn** (low ATP) cannot afford to run it, and stops making fat from scratch — the body prioritises immediate energy over long-term savings.

Organ #16 also watches the creature's current **ATP** level directly and uses it to pace itself, reinforcing this behaviour: the organ only truly fires when there is energy to spare.

### The protein appetite signal

Organ #16's most visible in-game effect is behavioural rather than metabolic. It continuously emits a small amount of the **Hunger for protein** drive into the sensorimotor system:

- Constant emitter → Hunger for protein

This trickle combines with the protein-hunger signal from Organ #13 (the liver's gluconeogenesis step) to produce the creature's overall desire for protein-rich food. It is what quietly pushes a Norn toward meat, cheese or eggs even when it otherwise seems well-fed.

The felt level of the drive is the balance between this steady emission and the drains elsewhere (the liver, in particular, constantly moves felt protein-hunger back into its reservoir). A creature that has been eating plenty of protein stays suppressed; a creature on a purely carbohydrate or fat diet quickly feels a strong pull toward protein food, because this organ's emission has nothing to counter it.

---

## In-Game Effects Summary

- Converts leftover sugar-derived intermediates into fresh body fat — a Norn on carbohydrates eventually puts on weight because of this organ.
- Spends ATP to do so — only well-fed, energetic creatures actually build fat this way; hungry ones do not.
- Completes the picture of how a creature stores energy: directly from fatty food (Organs #6 and #8) and indirectly from carbohydrate via this organ.
- Continuously emits the **Hunger for protein** drive, pushing a Norn toward protein-rich food even when it is otherwise well fed.

In short: Organ #16 is what lets a creature **build reserves from any food** and is one of the two sources that make a Norn actively seek out protein.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #16 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Pyruvate + ATP → Fatty Acid + ADP (de novo lipogenesis, ATP-spending). |
| Receptors   | 1     | Reads the current ATP level and paces the reaction with available energy. |
| Emitters    | 1     | Constant emission of the Hunger for protein drive into the sensorimotor system. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #6 — Small Intestine (Lipase)](organ-06-small-intestine.md)
- [Organ #8 — Adipose Tissue (Lipogenesis)](organ-08-adipose-storage.md)
- [Organ #9 — Adipose Tissue (Lipolysis)](organ-09-adipose-lipolysis.md)
- [Organ #10 — Jejunum / Fat Appetite Sensor](organ-10-jejunum.md)
- [Organ #12 — Skeletal Muscle (Glycolysis)](organ-12-muscle-glycolysis.md)
- [Organ #13 — Liver (Gluconeogenesis)](organ-13-liver-gluconeogenesis.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
