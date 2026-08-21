# Organ #19 — Adrenal Gland

## Overview

Organ #19 is the creature's **emergency energy booster** — the organ that kicks in when a Norn is stressed, frightened, angry or climbing hard. It partners with the hypothalamus (Organ #1), which releases **Adrenalin** into the bloodstream during these moments; Organ #19 is the organ that actually *uses* that adrenalin to flood the body with usable sugar.

In real biology this role belongs to the **adrenal gland** — specifically the way adrenalin (epinephrine) drives the rapid release of stored glucose during the fight-or-flight response.

The organ also has a distinct secondary role: it tracks when the creature is **moving uphill** and signals the metabolic cost of that effort.

---

## In-Game Role

### The fight-or-flight sugar dump

The organ's core reaction is the creature's emergency fuel release. When the body is carrying **Glycogen** reserves and **Adrenalin** is circulating, Organ #19 combines them into a sudden burst of **Glucose**:

- 1 × Glycogen + 1 × Adrenalin → 8 × Glucose

That 8-to-1 conversion ratio is the largest emergency energy return in the creature's biochemistry. A single unit of adrenalin, paired with stored glycogen, produces *eight* units of blood sugar — far more than any routine digestion or release reaction. In practice this means the creature's entire body can suddenly light up with available fuel the moment adrenalin starts flowing.

The chain of events looks like this:

1. Something alarming happens — the creature is hurt, scared, angered, cornered, or finds itself in a stressful situation.
2. The hypothalamus amplifies the corresponding drive and releases Adrenalin into the bloodstream (see [Organ #1](organ-01-hypothalamus.md)).
3. Organ #19 sees both Adrenalin and stored Glycogen and fires its reaction.
4. The creature's blood sugar spikes, giving the muscles, lungs and heart the fuel they need to **run, fight or react** immediately.

Without this organ, a Norn's stress and fear responses would still *feel* correct — the drives are still there — but the creature's body would not actually deliver the extra fuel needed to back them up. A frightened Norn without a working Organ #19 looks scared but has no physiological burst to actually escape or fight. In practice such a creature will appear **sluggish under pressure**, unable to translate emotional arousal into physical capability.

It is also why this reaction **burns through glycogen reserves**. A creature that has been scared, pained or angry repeatedly visibly drains its sugar reserves faster than one that has lived a calm life, even if they ate identically. Long-term stress really does eat into stored energy in-game.

### Protein-hunger awareness

Organ #19 watches a circulatory signal tied to the creature's **Hunger for protein**. This gives it a link to the creature's nutritional state: a protein-starved body produces the emergency response slightly differently from a well-fed one. It is one of the small subtleties that make a poorly-kept, underfed Norn behave differently under stress than a well-kept one — the fight-or-flight machinery is still there, but its tuning changes based on what the creature has been eating.

### Climbing and exertion — the upslope signal

The organ's other distinctive job is to **notice when the creature is going uphill**. Whenever the Norn is moving up a slope, Organ #19 emits a chemical called **Upatrophin** into the sensorimotor system.

Upatrophin is the biochemical tag for upward exertion. Downstream reactions use it to register the effort the creature is spending on climbing, so that:

- Heavier climbing costs the body more than casual walking.
- Rooms with steep slopes wear the creature out faster than flat ones.
- The ATP-producing chain (see [Organ #21](organ-21-heart-atp-synthase.md)) couples its rhythm to how much the creature is climbing.

Without this signal, going uphill would feel exactly the same as walking on level ground from the creature's biochemistry perspective — part of what makes the world feel physical in-game would be lost.

---

## In-Game Effects Summary

- Is the creature's **fight-or-flight energy burst**: combines stored glycogen with adrenalin to flood the body with glucose at an 8-to-1 yield.
- Turns the hypothalamus's emotional response into actual physical capability — scared or angry Norns can move and react fast because this organ exists.
- Drains glycogen reserves rapidly during stressful moments, which is why a chronically stressed creature visibly runs low on stored energy.
- Tuned subtly by the creature's protein-hunger state — a protein-starved Norn handles stress differently from a well-fed one.
- Emits **Upatrophin** while the creature is going uphill, so climbing actually costs energy and contributes to fatigue.

In short: Organ #19 is the reason a creature's emotions turn into physical action. Without it, fear and anger are felt but not *delivered*, and slopes in the world become meaningless.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #19 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Glycogen + Adrenalin → 8× Glucose (emergency sugar release). |
| Receptors   | 1     | Reads a circulatory signal tied to Hunger for protein, linking the emergency response to nutritional state. |
| Emitters    | 1     | Emits Upatrophin whenever the creature is moving uphill. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #3 — Pancreas (β-cells / Insulin)](organ-03-pancreas-insulin.md)
- [Organ #4 — Pancreas (α-cells / Glucagon)](organ-04-pancreas-glucagon.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
