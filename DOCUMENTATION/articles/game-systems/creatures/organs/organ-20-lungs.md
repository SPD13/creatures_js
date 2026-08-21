# Organ #20 — Lungs

## Overview

Organ #20 is the creature's **oxygen-burning engine** — the organ that brings oxygen into the metabolic picture and uses it to extract a huge amount of energy from the pyruvate produced by the rest of the body. It is the biochemical analogue of **breathing**: without oxygen reaching this organ, the Norn's energy chain collapses, and without this organ the creature cannot turn what it has breathed in into anything useful.

In real biology this step corresponds to the **lungs** delivering oxygen for the mitochondrial electron-transport chain, turning pyruvate from glycolysis into energy and CO₂.

Organ #20 is also the source of the creature's baseline **Sleepiness** — the slow, inevitable tiredness that builds up with every hour the Norn is awake.

---

## In-Game Role

### Turning pyruvate and oxygen into energy

The organ's central reaction is the creature's **aerobic respiration step**:

- 1 × Pyruvate + 3 × Oxygen → 6 × Energy + 3 × Dissolved Carbon Dioxide

Every unit of pyruvate the body has produced (either from sugar in the muscles or from fat in the mitochondria) is combined here with three units of oxygen to release **six units of Energy** — the raw chemical quantity that Organ #21 (the heart / ATP synthase) then converts into usable ATP.

This is the largest energy-producing reaction in the creature's entire biochemistry. Sugar glycolysis and fat oxidation prepare the fuel; Organ #20 is where the real payload is extracted. A Norn that can breathe, with plenty of pyruvate flowing, is a Norn that is biochemically *alive* — humming with energy, ready to move and react.

The reaction also consumes oxygen and produces carbon dioxide, which is exactly how respiration works in a real animal: the dissolved CO₂ generated here then flows through the rest of the body and is eventually cleared away by the liver (Organ #2), where it is recombined with water and partially turned back into oxygen.

Without Organ #20, a Norn's energy supply is cut in half or worse. Sugar and fat can still be partially processed, but the big oxygen-driven step is gone, and the creature simply cannot produce enough energy to sustain normal activity. It will feel chronically weak even with a full pantry of food and healthy reserves.

### Oxygen-driven breathing rate

The organ's **clock rate** — how quickly it cycles through its reaction — is directly tied to the current **Oxygen** level in the creature's body:

- When oxygen is plentiful, the organ runs quickly — the creature is effectively breathing deeply, releasing lots of energy per tick.
- When oxygen is scarce (for example if the creature is in water, or in an airless room), the organ runs slowly or stops — the creature is essentially gasping for breath.

This is the in-game mechanism behind **suffocation and drowning**. A Norn whose head goes underwater loses its oxygen supply; Organ #20's clock effectively stalls; its energy output crashes; and the rest of the body begins to fail from lack of ATP. Conversely, a Norn in a well-ventilated room with clean air visibly has more stamina than one in a stuffy or low-oxygen environment, because this organ is running at full speed.

### The slow accumulation of sleepiness

Organ #20's second role is **behavioural** rather than metabolic. It continuously emits a small amount of the **Sleepiness** drive into the sensorimotor system:

- Constant emitter → Sleepiness

The idea is biologically intuitive: simply **being alive and breathing** gradually tires a creature out. Every moment Organ #20 runs — and it runs whenever the Norn is breathing — a little bit of sleepiness is added to the body's reservoir.

The felt sleepiness drive is the balance between this continuous emission and the drains elsewhere (Organ #2, the liver, for instance, moves sleepiness back into its reservoir when the creature is actually sleeping). In practice:

- An awake creature accumulates sleepiness throughout the day, regardless of what else it is doing, because this organ never stops emitting.
- Once the creature sleeps, downstream drains win out, and sleepiness fades.
- A creature in an oxygen-rich environment builds up sleepiness slightly faster than one in a low-oxygen one — another subtle tie between breathing and the creature's overall rhythm.

It is the reason a Norn that stays awake indefinitely eventually *has* to sleep: the signal accumulates biochemically, and there is no way to switch Organ #20 off without also suffocating the creature.

---

## In-Game Effects Summary

- Is the creature's **largest energy producer**. Combines pyruvate and oxygen into a major burst of Energy and CO₂ that powers nearly everything else.
- Completes the respiration chain from food → sugar/fat → pyruvate → energy → ATP.
- Its speed is directly driven by the creature's oxygen level: plenty of air means full stamina, low oxygen means the Norn starts suffocating.
- Is the reason drowning or airless rooms actually kill a creature in the game — without oxygen, this organ cannot produce energy.
- Constantly emits the **Sleepiness** drive, which is why every Norn gradually gets tired and eventually needs to sleep.

In short: Organ #20 is where **breathing becomes power**, and also where the slow build-up toward sleep originates.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #20 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Pyruvate + Oxygen → Energy + CO₂ (aerobic respiration — the creature's largest energy release). |
| Receptors   | 1     | Reads the current Oxygen level and uses it to drive the organ's clock rate (the creature's "breathing rate"). |
| Emitters    | 1     | Constant emission of the Sleepiness drive into the sensorimotor system. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #12 — Skeletal Muscle (Glycolysis)](organ-12-muscle-glycolysis.md)
- [Organ #17 — Mitochondria (β-Oxidation)](organ-17-mitochondria-beta-oxidation.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
- [Air and Breathing: How Creatures Suffocate](../creature-air-and-breathing.md)
