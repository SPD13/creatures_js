# 033 - Water

Water is the creature's **metabolic solvent and thermoregulation reservoir** — a large, non-decaying pool of "bodily water" that participates in seven different reactions across the respiratory, nitrogen-disposal, thermoregulatory and illness pathways. Unlike [Oxygen (030)](030%20-%20Oxygen.md) (which has one dominant consumer) or [Ammonia (026)](026%20-%20Ammonia.md) (which has one dominant clearance route), Water is a **cross-cutting substrate**: it is produced by waste-processing reactions (CO₂ scrubbing and urea synthesis) and consumed by a set of otherwise unrelated pathways that all happen to need a carrier fluid — oxygen synthesis, Hotness dissipation, Coldness generation, and fever-toxin expression.

Water is initialised to **the maximum possible concentration at birth (255 / 255 = 100 %)** and has an **effectively infinite passive half-life** (decay rate 1.0, ~90 billion ticks). Functionally this makes it behave as a large buffered reservoir: the newborn starts with a full tank, it never leaks on its own, and several of the reactions that consume it are slow enough that the pool can sustain metabolism for a very long time before running low. The few reactions that both *produce* Water (reactions 25 and 30) further mean that a healthy creature runs a near-closed water loop — CO₂ scrubbing and the urea cycle each hand a unit of Water back to the bloodstream as a byproduct, replenishing what Oxygen synthesis and thermoregulation consume.

Water has **no dedicated emitter, no receptor, and no direct environmental coupling**. It is purely an internal biochemical variable — the Norn does not "drink" water in the physiological sense; the in-world concept of drinking is handled by agents and CA smells (`CA smell 3 (water)` and `CA smell 5 (water)` are separate chemicals, IDs 168 and 170, used for scent-following behaviour, not body chemistry). The only way external game events affect the Water reserve is via direct CAOS injection (`CHEM 33 <amount>`) from food, drug or script agents. In practice, Water is the "quiet" chemical that everything else depends on but that almost never needs intervention.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | Gene 4, Baby onwards | Standard (genome-wide) | Bloodstream starts at 255 / 255 = 100 % at birth | One-off at creature instantiation |
| 2 | Chemical reaction (id 25) — CO₂ condensation | Gene 50, Baby onwards | Standard (genome-wide) | `3× Dissolved carbon dioxide [24] → 1× Water [33]` | Short half-life (~19 ticks, decay 0.965) — fires whenever CO₂ accumulates past its own disposal threshold |
| 3 | Chemical reaction (id 30) — urea synthesis byproduct | Gene 46, Baby onwards | Standard (genome-wide) | `2× Ammonia [26] + 1× Dissolved carbon dioxide [24] → 1× Urea [25] + 1× Water [33]` | Short half-life (~24 ticks, decay 0.971) — fires whenever Ammonia is being cleared |

Water has **no emitter** and cannot be replenished from the environment by any intrinsic mechanism. The only genomic sources are the initial 100 % bolus at birth and the two reaction byproducts above. Both of those reactions double as waste-disposal pathways (reaction 25 consumes CO₂, reaction 30 consumes Ammonia), so every unit of Water the body produces is a side-effect of getting rid of something else. This is physiologically elegant: the creature recycles its own metabolic water from the carbon and nitrogen waste it is disposing of, exactly the way real cellular respiration produces metabolic water.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Chemical reaction (id 27) — oxygen synthesis | Gene 47, Baby onwards | Standard (genome-wide) | `1× Water [33] + 1× Air [29] → 3× Oxygen [30]` | Medium half-life (~105 ticks, decay 0.993) — the respiratory-pipeline's substrate; see [030 - Oxygen](030%20-%20Oxygen.md) |
| 2 | Chemical reaction (id 26) — fast cooling (Hotness dissipation) | Gene 52, Baby onwards | Standard (genome-wide) | `1× Water [33] + 4× Hotness [153] → (nothing)` | Short half-life (~24 ticks, decay 0.971) — primary thermoregulatory sink; 1 Water absorbs 4 Hotness |
| 3 | Chemical reaction (id 31) — slow cooling | Gene 53, Baby onwards | Standard (genome-wide) | `2× Water [33] + 4× Hotness [153] → (nothing)` | Medium half-life (~116 ticks, decay 0.994) — a weaker, slower cooling pathway with a 2 : 4 ratio (twice as much water per Hotness unit) |
| 4 | Chemical reaction (id 29) — Pistle-catalysed Coldness generation | Gene 54, Baby onwards | Standard (genome-wide) | `1× Water [33] + 1× Pistle [113] → 3× Coldness [152] + 1× Pistle [113]` | Medium half-life (~116 ticks, decay 0.994) — Pistle acts as a catalyst (output unchanged); converts Water into Coldness when Pistle is present |
| 5 | Chemical reaction (id 80) — fever-toxin expression | Gene 80, Baby onwards | Standard (genome-wide) | `1× Fever toxin [72] + 1× Water [33] → 8× Hotness [153]` | Short half-life (~24 ticks, decay 0.971) — disease mechanism; Fever toxin uses bodily water to generate fever (Hotness) |
| 6 | Passive decay | Gene 62 (half-life table) | Bloodstream | Half-life ≈ 90 billion ticks (decay rate 1.0) — effectively no decay | Negligible |

## Role in Game Mechanics

### Water as a cross-cutting substrate

Water is unusual among the major metabolic chemicals in that it is not dedicated to a single pipeline. Oxygen serves one master (reaction 19, the combustion engine). Ammonia serves one master (reaction 30, the urea cycle). But Water is a shared input to four distinct functional systems:

```
                                         (Initial 100 % at birth)
                                                   │
                     ┌─────────────────────────────┼─────────────────────────────┐
                     │                             │                             │
          Reaction 25 (Gene 50)         Reaction 30 (Gene 46)                    │
          3× CO₂ → 1× Water             2× Ammonia + 1× CO₂ →                    │
          (CO₂ scrubbing)               1× Urea + 1× Water                       │
                     │                  (Urea cycle byproduct)                   │
                     └───────────────────────────┬─┴─────────────────────────────┘
                                                 │
                                                 ▼
                                    ┌─────────────────────────┐
                                    │   Water [33]            │
                                    │   (100 %, no decay)     │
                                    └─────┬───────────────────┘
                                          │
      ┌───────────────┬───────────────────┼──────────────────┬───────────────────┐
      │               │                   │                  │                   │
      ▼               ▼                   ▼                  ▼                   ▼
  Reaction 27    Reaction 26          Reaction 31        Reaction 29         Reaction 80
  (Gene 47)      (Gene 52)            (Gene 53)          (Gene 54)           (Gene 80)
  + Air          + 4× Hotness         + 4× Hotness       + Pistle            + Fever toxin
      ↓               ↓                   ↓                  ↓                   ↓
  3× Oxygen      (nothing)            (nothing)          3× Coldness         8× Hotness
  (respiration)  (cooling)            (slow cooling)     (cold generation)   (fever)
```

The design intent behind this shared role is that Water functions like a **universal carrier fluid** in the simulation: whenever the body needs to move heat, make gases, synthesise a waste product, or let an illness express itself, Water is consumed as the carrier. Because Water's starting reserve is maximal and its passive decay is nil, all five of its consumer reactions can fire freely without the body having to budget its Water reserve carefully — unless something pathological is going on (extreme thermal stress, severe fever, prolonged metabolic demand).

### The closed-loop water balance of a healthy creature

In steady state, a healthy Norn's Water pool is roughly self-sustaining because of the coupling between waste disposal (which *produces* Water) and respiration / thermoregulation (which *consumes* it). Consider a back-of-the-envelope accounting:

- Reaction 19 (glucose combustion) produces **3× Dissolved CO₂** per firing.
- Reaction 25 then converts **3× CO₂ into 1× Water** — so every glucose combustion cycle indirectly regenerates one unit of Water.
- Reaction 27 (oxygen synthesis) consumes **1× Water** per firing to produce 3× Oxygen that in turn feeds reaction 19.

That gives a near-balanced respiratory water cycle: one Water in (reaction 27), one Water out (reaction 25 via CO₂). Add in the urea cycle (reaction 30) producing one more Water per firing as a bonus, and the result is that a creature whose only Water demand is respiration actually *gains* Water slowly as the urea cycle runs. This is why, in practice, a healthy unstressed Norn rarely sees its Water reserve drop noticeably — the body is essentially watertight, and the baseline respiratory consumption is approximately offset by the baseline CO₂ scrubbing.

Where Water *does* drop is under thermal or illness stress. Reactions 26, 29, 31 and 80 have no balancing production pathway — when Hotness accumulates and has to be dumped, or when the creature is feverish, the Water reserve is drawn down without being replenished.

### Thermoregulation — Water as the creature's coolant

Three of Water's five consumer reactions are part of the creature's thermoregulation system:

- **Reaction 26** (Gene 52): `1× Water + 4× Hotness → (nothing)` — the creature's primary fast cooling reaction. Fires at a short half-life (~24 ticks) and has a high Hotness-to-Water ratio (4 : 1), making it very efficient per unit of Water consumed. This is the body's "evaporative cooling" analogue: burn a little water to dump a lot of heat.
- **Reaction 31** (Gene 53): `2× Water + 4× Hotness → (nothing)` — a secondary, slower cooling reaction with a worse ratio (2 : 4 = 1 Water per 2 Hotness). Fires at a medium half-life (~116 ticks). This appears to be a backup / redundancy mechanism; because reaction 26 is faster and more efficient, reaction 31 typically contributes only when reaction 26's kinetics can't keep up with a very large Hotness bolus.
- **Reaction 29** (Gene 54): `1× Water + 1× Pistle → 3× Coldness + 1× Pistle` — a Pistle-catalysed Coldness-generation pathway. Pistle (chemical 113) is a signalling chemical tied to the creature's cooling response; when present, it consumes Water to generate Coldness (chemical 152), which then counteracts Hotness via a separate Hotness × Coldness cancellation reaction elsewhere in the biochemistry. Note that Pistle is regenerated (1 in, 1 out), i.e. it acts as a catalyst.

Together these three reactions give the creature a graduated cooling response: reaction 26 dumps heat directly, reaction 29 produces "active cold" via Pistle, and reaction 31 provides slow background cooling. All three draw from the same Water pool, which is why a prolonged thermal-stress event (e.g. a creature sitting in a hot room for many ticks) is one of the few scenarios that can measurably deplete Water.

### Fever and illness — reaction 80

Reaction 80 (`1× Fever toxin + 1× Water → 8× Hotness`) is the mechanism by which certain diseases and toxic agents cause fever. Fever toxin (chemical 72) is typically introduced by disease agents or infection scripts; once it is present in the bloodstream, it begins reacting with Water to *produce* Hotness — the creature heats up. This is doubly taxing on the water balance: the creature both consumes Water to generate Hotness (reaction 80), then consumes more Water to dissipate that same Hotness (reactions 26 and 31). A severe fever can therefore drain the Water reserve significantly, in a way no other physiological process does.

The stoichiometry of reaction 80 (8 Hotness per 1 Water + 1 Fever toxin) is deliberately dramatic: small amounts of Fever toxin produce large Hotness spikes, giving fever its characteristic rapid onset in gameplay. Once Fever toxin is cleared (it has its own decay rate), reaction 80 stops firing and the thermoregulation reactions catch up, bringing the creature back to baseline.

### Respiratory coupling — the Water / Air / Oxygen triangle

Water is Air's silent partner in the respiratory chain. Reaction 27 requires **both** Water and Air to produce Oxygen — either substrate can stall the reaction. In practice Water is very rarely the limiting reagent (starts at 100 %, produced by waste reactions), so the respiratory-stall failure mode is almost always Air starvation (drowning, poor air quality). But genetically it is possible to construct a mutant in which Water runs out before Air — for example, a creature with broken CO₂ scrubbing (reaction 25 disabled) and persistent fever (reaction 80 firing) would bleed Water faster than it can regenerate it, and would eventually suffocate *despite having plenty of Air* because reaction 27 has no Water left to work with.

See [030 - Oxygen](030%20-%20Oxygen.md) for the full respiratory pipeline context.

### Why Water has no receptor

None of the 200-plus receptors in the C3 biochemistry watches the Water level. This is a deliberate design choice: Water is treated as a reliable, buffered resource whose concentration *shouldn't* need active monitoring in a normally-functioning creature. The engine assumes Water will always be present at high concentration, because:

1. Initial concentration is 100 % — maximum possible.
2. Half-life is infinite — it never leaks.
3. Two of the most common metabolic byproduct reactions (25 and 30) produce Water as a side-effect.
4. The only Water-consuming reactions are either slow (respiration) or episodic (thermal stress, fever).

Because Water is treated as "always there", there is no compensation receptor for low Water, no hypohydration reflex, and no CA sensation tied to the body's Water level. If Water ever *does* crash (typically from pathological mutations or CAOS intervention), the failure mode is quiet and insidious: oxygen synthesis stalls, CO₂ climbs, Ammonia climbs, cooling stops working, and the creature dies of a cluster of apparently unrelated symptoms — but nothing in the body specifically complains about being "thirsty".

### Initial concentration — why 100 %

Gene 4 sets the initial Water concentration to 255 / 255 — the maximum possible. This is the only chemical in the newborn's body that starts completely full (most others start at a fraction of their maximum, e.g. Oxygen at 75 %, Air at 25 %, Ammonia at 0 %). The rationale:

- All five Water-consuming reactions must be able to fire from tick 0 without rate-limiting on Water availability.
- The respiratory chain in particular needs Water immediately so that the very first inhalation of Air can produce Oxygen.
- Thermoregulation must be fully functional from birth so the creature doesn't overheat in a warm environment before its metabolic loops stabilise.

Starting at 100 % also creates a very long buffer period before any external intervention would be needed: even a pathologically Water-draining creature will still be fine for thousands of ticks before the pool is noticeably depleted.

### Mutations and scripter notes

- **Mutations on gene 4 (initial Water concentration).** Lowering the starting value can create newborns that cannot establish respiration immediately — reaction 27 stalls for lack of substrate, Oxygen fails to accumulate, and the creature may die within minutes of birth despite breathing normally. This is a rare and subtle lethal mutation. Raising it is harmless (already maxed).
- **Mutations on gene 50 (reaction 25 — CO₂ → Water).** Breaking this reaction has two effects: CO₂ accumulates dangerously (contributing to acidosis-like symptoms), *and* the creature loses a major Water regeneration pathway. Long-term, Water starts to deplete because respiration keeps consuming it without the CO₂-recycling pathway giving any back.
- **Mutations on gene 46 (reaction 30 — urea synthesis).** Primary effect is Ammonia accumulation (see [026 - Ammonia](026%20-%20Ammonia.md)), but a secondary effect is loss of the second Water regeneration pathway. Combined with gene 50 mutation, a creature can be made to bleed Water steadily with no recovery.
- **Mutations on gene 52 (reaction 26 — fast cooling).** Breaking the primary cooling pathway leaves only reaction 31 (slower, less efficient), so the creature overheats easily. Note that this mutation *saves* Water by preventing reaction 26 from firing, but the resulting Hotness accumulation is usually far more damaging than the water savings are beneficial.
- **Mutations on gene 47 (reaction 27).** Disabling respiration kills the creature quickly (see [030 - Oxygen](030%20-%20Oxygen.md)) — but as a side-effect, it also *stops* the creature's main Water consumer. A gene-47-knockout creature with intact waste pathways would actually accumulate Water monotonically until something else killed it.
- **Mutations on gene 80 (reaction 80 — fever).** Disabling fever expression makes the creature immune to fever-based diseases; enhancing it makes even mild infections cause rapid overheating. Note that enhancing reaction 80 also drains Water faster.
- **Mutations on gene 54 (reaction 29 — Pistle-catalysed Coldness).** Breaking Pistle-based cooling removes one of three cooling pathways. Because Pistle is a catalyst, this mutation does not change the Water balance for unrelated reactions — it only affects whether Water can be turned into Coldness in the presence of Pistle.
- **CAOS-injected Water (`CHEM 33 <amount>`)** is rarely needed in practice because Water is so well-buffered. Injecting large negative Water doses (`CHEM 33 -255`) can be used to test "Water starvation" mutations or to simulate severe dehydration for scripting purposes; the resulting symptoms are a gradual respiratory failure plus thermoregulatory collapse.
- **Agent design.** Food agents that represent "drinks" or "water" (e.g. water bowls, puddles, juice) typically inject Glucose (for hydration-as-nutrition) or use CA smell chemicals (168 and 170) for scent-based attraction, not Water [33] directly. Boosting Water chemically is physiologically equivalent to an IV drip — appropriate for an emergency medical agent, but unusual for a food / drink agent since the body already runs Water at 100 % most of the time.

### Comparison with Oxygen and Air

| Property | Air [29] | Oxygen [30] | Water [33] |
|----------|----------|-------------|------------|
| Role | Inhaled gas | Circulating oxidant | Metabolic solvent / coolant |
| Source | Emitter 6 (environmental) | Reaction 27 | Reactions 25 & 30 (waste byproducts) |
| Emitter | Yes (tied to `LOC_AIRQUALITY`) | No | No |
| Consumers | 1 reaction + 1 receptor | 2 reactions + 2 receptors | 5 reactions, 0 receptors |
| Passive half-life | Medium (~343 ticks) | Effectively infinite | Effectively infinite |
| Initial concentration | 64 / 255 ≈ 25 % | 191 / 255 ≈ 75 % | **255 / 255 = 100 %** |
| Environmental coupling | Yes | No | No |
| Active monitoring | Drowning reflex (receptor 76) | Hypoxia compensation (receptors 75, 78) | None |
| Failure mode | Loud (drowning) | Loud (hypoxia compensation) | Silent (cascading metabolic collapse) |

Where Air is the gateway and Oxygen is the working fluid, Water is the **background reservoir** — the chemical the engine assumes will always be there, that nothing watches, and that silently underpins oxygen synthesis, thermoregulation, and fever expression. Its role is most visible when it *isn't* there: a Norn with crippled Water recovery fails in subtle, simultaneous ways across every pathway that needs a carrier fluid.

### Summary of the Water pathway

```
                    ┌───────────────────────────────────┐
                    │   Water [33]  (100 %, no decay)   │
                    └───┬───────────────────────────┬───┘
                        │                           │
        ┌───────────────┴───────────────┐   ┌───────┴──────────┐
        │        PRODUCED BY            │   │   CONSUMED BY    │
        └───────────────┬───────────────┘   └───────┬──────────┘
                        │                           │
       ┌────────────────┼───────────────┐   ┌───────┼──────────┬──────────┬──────────┐
       │                │               │   │       │          │          │          │
  Initial 100 %    Reaction 25      Reaction 30 │  R27      R26/R31     R29        R80
  (Gene 4)         Gene 50          Gene 46    │  Gene 47   Gene 52/53  Gene 54    Gene 80
  "full tank"      3× CO₂           2× NH₃+CO₂ │  + Air     + Hotness   + Pistle   + Fever
                     ↓                  ↓      │    ↓          ↓           ↓          ↓
                  1× Water        1× Urea +    │  3× O₂    (nothing)   3× Cold     8× Hot
                                  1× Water     │ (respire)  (cooling)  (coolgen)   (fever)
```

Water therefore plays the role of the creature's **universal carrier fluid** — a non-decaying, maximally-stocked reservoir that participates in every reaction needing a solvent or a thermal buffer. It is the quiet hinge between the waste-processing pipelines (which produce it) and the respiration / thermoregulation / illness pipelines (which consume it); and it is intentionally designed to be abundant, silent and reliable enough that most scripters and players never have to think about it.
