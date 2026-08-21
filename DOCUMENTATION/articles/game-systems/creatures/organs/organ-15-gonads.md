# Organ #15 — Gonads (Testes / Ovaries)

## Overview

Organ #15 is the creature's **reproductive hormone factory**. It is the organ that makes a Norn *fertile*, *attractive*, and ultimately capable of mating and producing offspring. It is also one of the more versatile organs in the creature's body: alongside its core role as the gonads, it quietly participates in drive management, responds to pain and fear, and emits several specialised stress signals that colour how the rest of the body behaves under different kinds of pressure.

In real biology this corresponds to the **gonads** — the testes in males and the ovaries in females — with their blended role as hormone producers and reproductive organs.

---

## In-Game Role

### Sex hormones and attraction

The organ's most important role in the game is producing the hormones that define mating behaviour. When the creature is fertile, Organ #15 releases three key chemicals into the bloodstream:

- **Testosterone** — the male-leaning hormone that influences aggression, territoriality and mating pursuit.
- **Oestrogen** — the female-leaning hormone that regulates the reproductive cycle and fertility signalling.
- **Arousal Potential** — the chemical that, together with an opposite-sex pheromone, determines whether a Norn is actually ready to mate.

Together these hormones feed into the liver (Organ #2), which computes the creature's *felt* sex drive and decides whether mating is on. A creature with a healthy, active Organ #15 reaches fertility at the expected life stage and behaves like an adult Norn: interested in mates, aware of its own cycle, and capable of reproduction.

A Norn with a damaged Organ #15 will be **effectively sterile**. Its body may look adult, but its reproductive chemistry is silent — no testosterone, no oestrogen, no arousal. Courtship behaviour simply does not fire, because the chemicals that drive it are never released.

### Rising drives: crowdedness, boredom, sex

Organ #15 is also one of the organs that opens the valve on several **felt drives**. It lets Crowded, Boredom and Sex-drive rise out of their backup reservoirs into the active state where the creature feels them:

- Crowded backup → Crowded
- Boredom backup → Boredom
- Sex drive backup → Sex drive

This is what makes a Norn progressively notice that it is hemmed in by others, bored, or looking for a mate. Without this organ, the corresponding backup reservoirs would exist but the creature would never actually feel the drives.

### Falling drives: hunger for carbs and fat, coldness

On the opposite side, Organ #15 also drains a handful of drives **back** into their backup reservoirs:

- Hunger for carbohydrate → backup
- Hunger for fat → backup
- Coldness → backup

These are the recovery counterparts for some of the nutrition and temperature drives. When the creature eats or warms up, the backup reservoirs fill; Organ #15 is one of the organs that lets the *felt* versions of those drives fade back down afterwards — so a well-fed, warm Norn actually stops feeling hungry or cold rather than carrying the feeling indefinitely.

### Carbohydrate appetite

Organ #15 is also a continuous source of the **Hunger for carbohydrate** drive. A steady trickle of the chemical is emitted into the sensorimotor system, which is what makes a Norn specifically crave starchy food over time. As with the fat-hunger signal from Organ #10, the felt level is the balance between this constant emission and the drains elsewhere: a creature that has been eating plenty of carbs stays suppressed; a creature that has gone without starts actively seeking starchy food.

### Pain and fear regulation

The organ's own **clock rate** — how fast it cycles through its reactions — is modulated by the creature's current Pain and Fear drives. A Norn in pain, or frightened, literally changes how its gonads function. This is the in-game analogue of how acute distress can suppress or disturb reproductive behaviour in real animals: a scared or injured creature becomes less fertile, less reactive, and less interested in mating.

### Stress fingerprints

Finally, Organ #15 is one of the organs that produces *specific* kinds of **Stress** signals rather than a single generic one. It emits:

- Plain Stress — baseline metabolic load.
- Pain-flavoured Stress — a separate channel that marks stress coming from injury.
- Crowded-flavoured Stress — marks stress coming from too many companions.
- Sleep-flavoured Stress — marks stress coming from sleep issues.

These flavours allow downstream organs to react differently to, say, pain-driven distress and crowd-driven distress, rather than treating all stress as the same thing. It is one of the mechanisms that makes a Norn's response to different situations feel distinct.

---

## In-Game Effects Summary

- Produces testosterone, oestrogen and arousal potential — without it, a Norn is effectively sterile and never engages in mating.
- Generates the **Hunger for carbohydrate** drive, pushing creatures toward starchy food when low.
- Lets Crowded, Boredom and Sex drive rise out of their reservoirs so the creature actually feels them.
- Drains the carb-hunger, fat-hunger and coldness drives back to their backups once the need is met.
- Modulated by Pain and Fear: injured or frightened creatures visibly change their reproductive behaviour.
- Emits multiple flavoured Stress signals (pain / crowded / sleep) so the rest of the body can respond differently to different kinds of distress.

In short: Organ #15 is the **reproductive and social driver** of the creature. It makes Norns fertile, makes them crave carbohydrates, and gives their stress response its nuanced texture.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #15 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 7     | Opens Crowded / Boredom / Sex-drive from their backups; drains Hunger for carb, Hunger for fat and Coldness back to their backups; converts Pain into a hunger-for-protein-backup nudge. |
| Receptors   | 8     | Reads amino acid, glucose and triglyceride levels (nutrition); anabolic steroid (muscle state); Pain and Fear (to modulate its own clock rate); Hunger for carbohydrate (circulatory feedback). |
| Emitters    | 8     | Testosterone, Oestrogen and Arousal Potential from the fertile state; Hunger for carbohydrate; and four flavoured Stress channels (plain, pain, crowded, sleep). |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #10 — Jejunum / Fat Appetite Sensor](organ-10-jejunum.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
