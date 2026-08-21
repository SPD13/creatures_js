# 005 - Starch

Starch is the creature's **primary dietary carbohydrate** — the chemical that enters the body through the mouth rather than being synthesised internally. Biologically it mirrors real-world starch, the long-chain polysaccharide that herbivores and omnivores break down into simpler sugars during digestion. In the Creatures 3 genome it is the first link in the main carbohydrate chain: food delivers **Starch**, the body digests it into **Glucose**, and excess Glucose is then packed away as **Glycogen** for later use. Every bite of a starchy food — grass, fungi, seeds, pods, cacbana, tendrils — ultimately arrives in the creature as a burst of Starch that is slowly converted to blood sugar and burned through the metabolic pipeline already documented in `003 - Glucose.md` and `004 - Glycogen.md`.

Starch occupies an unusual place in the biochemistry: it is one of the very few metabolic chemicals that the genome does **not** produce itself. There is no emitter, no receptor, no initial concentration, and no reaction that makes it. A newborn creature is born with zero Starch in its body, and the only way for Starch to ever appear in the bloodstream is for an external script — typically a food agent's "eat me" handler — to inject it via `stim writ` (which maps stimulus 77 to a positive Starch delta in the creature's stim table) or via direct CAOS calls (`CHEM 5`, `INJR`). In other words, Starch is the creature's **eating sensor**: its concentration rises if, and only if, the creature has just consumed a starchy food.

Once in the body, Starch has exactly one fate. The single genome-wide reaction that uses it (reaction 2, gene 26) breaks one unit of Starch into **four units of Glucose** at a moderate speed (half-life ~255 ticks, "Medium"). There is no alternative pathway, no receptor-driven regulation, and no decay — Starch simply sits in the creature until the digestion reaction fires and converts it to blood sugar. This makes Starch a **pure throughput substrate**: it enters from food, flows through reaction 2, and disappears into the Glucose pool that the rest of the metabolism then takes over.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | External ingestion via stim 77 | — | Food agent scripts (`stim writ from 77 N`) | Triggered when the creature eats a starchy food item (grass, fungi, cacbana, foxglove seed, tendril, pumperspikel, etc.) | Immediate — the creature's stim table maps stimulus 77 to a positive Starch delta, injecting 1–3 units per bite |
| 2 | Direct CAOS injection | — | — | `CHEM 5 amount` or `INJR`/consumable agents that write chemical 5 | Immediate — used for testing, debugging, or scripted events that simulate feeding without going through a real food agent |

Starch has **no emitter**, **no production reaction**, and **no initial concentration**. A creature is born with zero Starch; every molecule present in the body at any point in its life must have come in through its mouth (or an equivalent CAOS-level injection). This is the defining property of Starch in the biochemistry — it is the canonical "you have just eaten" signal that every other carbohydrate depends on.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Chemical reaction 2 (digestion) | Gene 26, Baby onwards | Standard (genome-wide) | `1× Starch [5] → 4× Glucose [3]` | Medium half-life ~255 ticks (decay 0.9973) — the sole digestion path: each unit of Starch is slowly broken down into four units of Glucose, which then enters the normal carbohydrate cycle (glycolysis, glycogenesis, gluconeogenesis, etc.) |
| 2 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1) | Starch does not decay naturally; any undigested Starch sits in the body indefinitely until reaction 2 consumes it or it is removed externally |

Starch has **no receptors** of any kind. The creature cannot directly "feel" how much Starch it has in its body, cannot modulate its digestion rate based on the current Starch pool, and cannot use Starch as a drive, sensor, or feedback signal. All regulation of the carbohydrate system happens *downstream* of Starch — at the Glucose, Glycogen, and hunger levels.

## Role in Game Mechanics

### The one-way digestion pipe

Reaction 2 is the entire reason Starch exists in the chemistry. Its formula — `1× Starch → 4× Glucose` — mirrors real-world digestion: polysaccharides break down into monosaccharides at a fixed 1:4 stoichiometry, with a moderate half-life that spreads the sugar release across several game minutes rather than dumping it all at once. The "Medium" speed (half-life ~255 ticks, decay 0.9973) is deliberately slower than the downstream reactions that consume Glucose, which means:

- **Glucose rises smoothly** after a meal rather than spiking and crashing.
- **Glycogen storage** (`6× Glucose → 1× Glycogen`, reaction 6) has time to pack away excess sugar before it accumulates dangerously.
- **Hunger satiation** is gradual: the Starch Hunger drive (chem 150) falls over many ticks as digestion proceeds, not all at once the instant the creature swallows.

Because Starch is converted 1-to-4 into Glucose, a single bite that injects, say, 3 units of Starch (via `stim writ from 77 3` from pumperspikel or grass) eventually yields ~12 units of Glucose — a meaningful but not overwhelming meal. A hungry creature typically needs several bites of starchy food to fully restore its blood sugar and top up its Glycogen reserves.

### Stim 77 and the eating pipeline

In the standard Norn/Grendel/Ettin genome, the Stim table maps **stimulus 77** to "I have just eaten something starchy" — a positive Starch delta, usually paired with a small negative Starch-Hunger delta so that eating immediately reduces the drive *and* supplies the raw substrate that will eventually refill Glucose / Glycogen. Food agents declare their starch content by firing `stim writ from 77 N` in their "eat me" script (script number 12, BHVR bit 8). Examples from the standard bootstrap:

- `grass.cos`: `stim writ from 77 3` — a meaty bite of starch
- `cacbana.cos`: `stim writ from 77 3` — high-starch fruit
- `fungi.cos`: `stim writ from 77 1` — a small starch dose
- `desert grass.cos`: `stim writ from 77 1` — sparse starch
- `tendril.cos`: `stim writ from 77 1` — minor starch contribution
- `PLANT MODEL - foxglove Seed.cos`: `stim writ from 77 1` — seed starch
- `pumperspikel.cos`: `stim writ targ 77 3` — a large starchy bite

Other stims cover the complementary food categories: stim 75 is the protein version, stim 78 is fat (e.g. `apples.cos: stim writ from 78 1`), stim 79 is another nutrient (cheese/carrot). The `from` variant targets the creature that just ate (`FROM` pointer), which is how plant-type food agents let the eater absorb the nutrition without having to know which creature is chewing them.

### Starch Hunger (chem 150) and Starch Smell (chem 172)

Although Starch itself has no receptors, the biochemistry does not leave the carbohydrate side of eating unregulated — it simply does the regulation at the **drive** level rather than the substrate level:

- **Starch Hunger (chem 150)** is the drive chemical that rises over time when the creature has not eaten starchy food. Its receptors live in the sensorimotor system and feed into the decision-making brain, producing the "I want to eat something starchy" urge. Eating a starchy food directly suppresses this drive via the same stim 77 pathway that injects Starch.
- **Starch Smell (chem 172)** is a CA (cellular automata) scent map. Starchy food agents emit into this chemical map so that the creature's sensory system can localise the nearest starch source. Combined with Starch Hunger, this forms the familiar "smell food → walk toward it → eat it → gain Starch → digest into Glucose" behavioural loop.

Starch therefore participates in the game mechanics indirectly through this decoupled trio:

```
Starch Smell (CA map) ──► creature senses food ──► seeks food
                                                       │
                                                       ▼
                                              eats food (stim 77)
                                                       │
                               ┌───────────────────────┼───────────────────┐
                               ▼                       ▼                   ▼
                    Starch (chem 5) injected     Starch Hunger ↓     Drive response ↓
                               │
                         (reaction 2)
                               ▼
                    4× Glucose (chem 3)  ──────► Glycogen storage (chem 4)
                                               └► Pyruvate / Energy / ATP (chem 2/34/35)
```

### Why Starch has no receptors or regulation

The absence of Starch receptors is deliberate. Because Starch only exists when the creature has just eaten, it carries no useful long-term information: its concentration is a function of when food happened to arrive, not of the creature's internal state. Any regulation based on Starch itself would therefore be erratic — spiking after each meal and dropping to zero between meals — and would add noise to the metabolic feedback loops without providing a real signal.

Instead, the genome pushes *all* carbohydrate regulation one step downstream to Glucose and Glycogen. Those two chemicals are persistent, smoothly varying pools that accurately reflect the creature's overall carbohydrate status, and they carry the full set of receptors needed to control glycolysis, glycogenesis, gluconeogenesis, fainting, and drive satisfaction. Starch is allowed to be simple precisely because the real regulatory work happens further along the pipeline.

### Why Starch has no decay

Like the other metabolic substrates (Glucose, Glycogen, Pyruvate, Fatty Acid, Cholesterol, Triglyceride), Starch has a half-life of 9.07 × 10¹⁰ ticks with decay rate 1.0 — effectively non-decaying. If Starch decayed naturally, a creature that ate a large meal and then did not move for a while would lose some of its nutrition to "spoilage" inside its own stomach, leaking food energy out of the system with no biological justification. By making Starch persistent, the designers guarantee that every bite of food the creature eats is eventually converted into usable Glucose, regardless of how much digestion delay occurs.

### Practical consequences for gameplay

- **Feeding a creature**: the player places or dispenses starchy food (grass, cookies, pods) within reach, the creature walks to it guided by Starch Smell, eats via the BHVR bit 8 eat script, stim 77 fires, Starch rises, and digestion (reaction 2) gradually pumps Glucose into the body over the next few hundred ticks. A single nibble is never enough to satiate a truly hungry creature — the 1:4 conversion ratio and moderate digestion rate force multiple bites for a full meal.
- **Quirky cookie recipes** (see `Assets/Catalogue/quirky cookie recipes.catalogue`) let the player or designer configure custom cookies with tuneable starch content (recipe field "77") — effectively a recipe knob on how large a stim-77 delta the cookie delivers when eaten. This is how bespoke food items set their nutritional value.
- **Starvation dynamics**: because Starch does not accumulate passively and only enters via eating, a creature that stops eating has its Starch pool drop to zero almost immediately (as reaction 2 drains whatever remained from the last meal). From that point on the creature runs purely on its pre-existing Glucose + Glycogen reserves, and starvation timing is governed entirely by the downstream chemicals — Glycogen empties first, then Glucose falls, then the Glucose faint receptor (receptor 74, see `003 - Glucose.md`) fires.
- **CAOS-level feeding**: developers and agent authors can simulate a meal without building a full food agent by calling `CHEM 5 amount` on a target creature, or by firing `stim writ targ 77 N` from a helper agent. This is common in debugging, tutorial worlds, and test harnesses where controlled feeding is required.
- **Poisoning via adulterated food**: because the stim-77 pathway is just a stimulus, nothing prevents a hostile food agent from pairing `stim writ from 77 3` (nutrition) with additional `CHEM toxin amount` calls (poison), producing a "poisoned cookie" that tastes good, reduces Starch Hunger, and delivers a toxin in the same bite. Starch's lack of direct receptors means the creature cannot detect the trick from the Starch side — it only notices once the toxin produces its own downstream effects.

### Summary of the Starch pipeline

```
External food agent
        │
        │  (on eat, via BHVR bit 8 / script 12)
        ▼
stim writ from 77 N   ───►   creature's stim table   ───►   Starch (chem 5) += N
                                                                 │
                                                                 │  no receptors
                                                                 │  no decay
                                                                 │
                                                            (reaction 2: 1:4, ~255-tick half-life)
                                                                 │
                                                                 ▼
                                                        4N × Glucose (chem 3)
                                                                 │
                                           ┌─────────────────────┼────────────────────┐
                                           ▼                     ▼                    ▼
                                     Glycogen (chem 4)     Pyruvate (chem 2)     Glucose receptors
                                     (storage)             (aerobic respiration) (faint, feedback)
```

Starch is therefore a very *thin* chemical by design: it carries a single piece of information ("food has just been eaten"), it performs a single transformation ("one unit becomes four units of Glucose"), and it exits the chemistry entirely once digestion completes. Everything else — hunger, satiation, storage, burning, starvation — is handled by the richer, regulated chemicals that sit on either side of it in the pipeline. Starch is, in the most literal sense, the creature's **meal ticket**: it is created only by eating, consumed only by digestion, and observed only through the Glucose and Glycogen that it produces.
