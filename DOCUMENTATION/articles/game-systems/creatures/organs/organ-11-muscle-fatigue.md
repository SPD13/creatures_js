# Organ #11 — Skeletal Muscle (Fatigue Sensor)

## Overview

Organ #11 is the creature's **tiredness-recovery organ**. While Organ #1 (the hypothalamus) slowly fills the tiredness drive from its backup reservoir — making the Norn feel progressively more worn out — Organ #11 does the reverse: it lets the felt tiredness **fade back down** when the creature actually has the energy to recover. In real biology this matches the role of **skeletal muscle** as a fatigue sensor, where the perceived sense of being tired eases off once the body has enough fuel and rest to restore itself.

---

## In-Game Role

### Letting tiredness fade

Whenever the creature is tired, Organ #11 slowly drains the active **Tiredness** drive back into its backup reservoir:

- 1 × Tiredness → 1 × Tiredness backup

This is the counterpart of Organ #1's drip that *generates* felt tiredness. As long as the creature keeps running, playing, fighting and otherwise spending effort, the hypothalamus is filling the tiredness drive faster than this organ can drain it — so the Norn feels increasingly tired. As soon as the creature rests or sleeps, that pressure falls, this organ catches up, and the felt tiredness visibly decreases.

Without Organ #11, tiredness would keep climbing whenever it was filled and **never come back down** — a Norn would stay permanently exhausted no matter how long it rested.

### Energy-gated recovery

Recovery is not automatic. Organ #11 watches the creature's current **Energy** level and only runs properly when there is fuel to work with:

- When Energy is plentiful (the creature is well fed and has ATP to spare), Organ #11 drains tiredness briskly — rest is effective and the Norn bounces back quickly.
- When Energy is low (the creature is starving or exhausted), Organ #11 drains tiredness slowly — rest does not help as much because the body does not have the resources to recover.

This is the reason a well-fed Norn recovers from exertion faster than a hungry one. A starving creature that lies down to rest still stays tired, because without energy there is nothing to spend on repair and recovery.

### A small metabolic cost

Running a recovery organ takes effort of its own. Organ #11 emits a small amount of the **Stress** chemical into the circulatory system while it is active, contributing to the baseline body-load the creature carries whenever it is working to recover from fatigue.

---

## In-Game Effects Summary

- Lets felt tiredness fade back into its reservoir, so a resting Norn actually feels less tired over time.
- Forms the recovery half of the tiredness cycle — paired with Organ #1, which is the "tiredness grows" half.
- Energy-gated: hungry or exhausted creatures recover much more slowly than well-fed ones, even if they rest for the same amount of time.
- Emits a small stress signal while working.

In short: Organ #11 is the reason sleep and rest actually *repair* a Norn. Without it, tiredness only ever climbs.

---

## Reactions, Receptors and Emitters

On the standard Starter Parent 1 genome, Organ #11 contains:

| Subsystem   | Count | Main role |
|-------------|-------|-----------|
| Reactions   | 1     | Tiredness → Tiredness backup (felt-drive recovery). |
| Receptors   | 1     | Reads the current Energy level and gates recovery on it. |
| Emitters    | 1     | Emits Stress into the circulatory system while the organ is active. |

---

## Related Articles

- [Organ #0 — Hidden Body Organ ("Brain")](organ-00-body-brain.md)
- [Organ #1 — Hypothalamus / Limbic System](organ-01-hypothalamus.md)
- [Organ #2 — Liver (with Immune, Kidney and Detox)](organ-02-liver.md)
- [Organ #5 — Pineal Gland](organ-05-pineal-gland.md)
- [Organ to Real-Life Mapping](../biochemistry/organ-to-real-life-mapping.md)
- [Biochemistry System](../biochemistry/biochemistry-system.md)
- [Energy and Metabolism](../biochemistry/energy-and-metabolism.md)
