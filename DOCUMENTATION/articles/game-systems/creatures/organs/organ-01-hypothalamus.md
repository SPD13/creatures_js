# Organ #1 — Hypothalamus / Limbic System

## Overview

Organ #1 is the **emotional and drive hub** of a creature. Where every other organ handles a specific physical function (digesting food, storing fat, producing energy), Organ #1 is responsible for **turning raw bodily signals into felt drives** and for managing the creature's emotional state. If a Norn feels hungry, frightened, lonely, cold or aroused, it is because this organ has lit up the corresponding drive.

In human terms, it plays the combined role of the **hypothalamus** (drive and homeostasis regulator) and the **limbic system** (emotional centre, fear/anger, pheromone and sex-hormone signalling).

---

## In-Game Role

### The drive "faucet"

Deep inside a creature, each basic need (pain, hunger, tiredness, cold, heat, loneliness…) is actually stored as two chemicals — a *backup* reservoir and an *active* drive level. Other organs refill the backup reservoir, but the backup on its own does not make the creature want anything.

Organ #1 **slowly drips** the backup reservoirs into the active drives. This is what turns a growing biological need into something the Norn actually feels and reacts to:

- Pain backup → Pain
- Hunger-for-protein backup → Hunger for protein
- Hunger-for-carbohydrate backup → Hunger for carbohydrate
- Hunger-for-fat backup → Hunger for fat
- Coldness backup → Coldness
- Hotness backup → Hotness
- Tiredness backup → Tiredness
- Loneliness backup → Loneliness

Without Organ #1, a creature would have every bodily need measured somewhere in its biochemistry but would never *act* on any of them. This organ is what bridges physiology and behaviour.

### The fear / anger circuit

Organ #1 hosts the emotional mood swing that every Norn keeper has seen in the game:

- **Fear ↔ Anger** — the organ constantly converts a small amount of Fear into Anger and a small amount of Anger into Fear. This is why a scared Norn that is cornered can suddenly flip into an angry one, and vice versa.
- **Adrenalin amplifies both** — in the presence of Adrenalin, Fear and Anger self-amplify (each unit of either drive, together with Adrenalin, produces **two** units of that same drive). Stressful situations therefore escalate emotions rapidly rather than building linearly.

Together, these reactions are what make a creature's temper feel alive: moods are not static levels but a volatile mix that the environment can tip one way or the other.

### Stress broadcasting

When a drive spikes — pain, fear, anger, tiredness, or the hunger triad — Organ #1 broadcasts the corresponding **Stress** chemical into the creature's bloodstream. Other organs (including the adrenal gland and liver) watch for these stress signals and adjust their behaviour: they can boost adrenalin, mobilise glucose, or change their own clock rates. In game this is the reason a highly stressed creature visibly *feels* different — its metabolism changes, not just its drive bar.

### Social and reproductive signalling

Organ #1 is also the creature's **social broadcaster**:

- **Opposite-sex pheromone** — emitted from the brain's sexual-attraction neurons, this is the "scent" that draws Norns of the opposite sex together. It is what powers mate-seeking behaviour in the game.
- **Libido lowerer** — released when the creature is fertile, this regulates sex drive so that a Norn does not stay permanently in a mating mood.
- **Progesterone during pregnancy** — when the reproductive system marks the creature as pregnant, Organ #1 raises progesterone, the pregnancy-maintenance hormone.
- **Pistle** — a special chemical tied to the circulatory system, released here to influence other organs.

### Boredom and air awareness

Two additional low-level sensations come from this organ:

- A constant trickle of **Boredom** — a creature that is not doing anything interesting will slowly start to feel bored, prompting it to wander, explore or interact.
- An **Air** signal tied to air-quality sensing — this couples the organ into the suffocation system described in [Air and Breathing](../creature-air-and-breathing.md).

---

## In-Game Effects Summary

- Pains, hungers, cold, heat, tiredness and loneliness only become *felt* drives because Organ #1 opens the valve between their reservoirs and the active levels.
- A creature's temper (fear vs anger) is a direct product of this organ's internal conversion reactions — which is why moods can change suddenly and unpredictably.
- Stressful events cascade into hormonal stress signals broadcast to the rest of the body.
- Attraction between Norns, pregnancy maintenance, and libido dynamics all originate from this single organ.
- Small constant effects (boredom, air sensing) keep the creature from ever being truly inert.

In short: if a creature feels *anything*, Organ #1 is involved.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #1 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 12    | Drive backup → active drive conversions; Fear ↔ Anger interconversion; Adrenalin-driven Fear/Anger amplification. |
| Receptors   | 13    | Reads every Creature / Drives locus — Pain, Hunger for protein / carb / fat, Coldness, Hotness, Tiredness, Sleepiness, Loneliness, Crowded, Fear, Boredom, Anger, Sex drive. |
| Emitters    | 15    | Boredom, Air, Adrenalin, Pistle, Progesterone, Opposite-sex Pheromone, Libido lowerer, and the full family of Stress signals (Anger / Fear / H4F / H4P / H4C / Tired / generic). |

The sheer number of drive receptors (Organ #1 reads **all** of them) is what tells us this organ is the creature's drive-integration centre.

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Drive System](../drive-system.md)
- [Air and Breathing](../creature-air-and-breathing.md)
