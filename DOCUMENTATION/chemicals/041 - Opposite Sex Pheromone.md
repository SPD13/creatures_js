# 041 - Opposite Sex Pheromone

Opposite Sex Pheromone is the **external trigger half of the mating-chemistry cascade**. Where **Arousal Potential (39)** is the body's *internal* "I am physiologically ready to reproduce" signal — emitted whenever the creature carries a gamete — Opposite Sex Pheromone is the *external* "a viable mate is in sensory range" signal. The two are deliberately gated together: neither chemical alone produces mating motivation, but when both are present in the bloodstream simultaneously, **reaction 32** combines them 1:1 into **Sex Drive (161)**, the chemical that actually drives courtship behaviour.

This chemical is unique among reproductive chemicals in that it is **not produced by any emitter gene at all**. It has no internal source: no locus reads back into it, no faculty writes to it, no reaction synthesises it. It is purely an *input* chemical, injected into the bloodstream from outside the closed-loop biochemistry — by stimulus genes when the creature perceives an opposite-sex peer, by ingested foods/drugs (e.g. the Medicine Maker's love potion which doses chem 39 + chem 41 together), by inhaled emissions from author-defined agents, or by direct CAOS injection. Its presence is therefore a faithful chemical record of *recent perception*, not of internal physiological state.

It also has a direct line to the brain: receptor 23 maps it onto **stim lobe neuron 20**, so the moment chem 41 enters the bloodstream the brain receives a discrete "opposite sex perceived" stimulus that flows into the concept and decision lobes via the normal stim-lobe wiring. This is the classical Creatures pattern of using a chemical both as a reaction reagent (to gate behaviour-producing chemistry) and as a brain stimulus (to bias concept formation) from the same pool — a single chemical signal driving two parallel pathways at once.

The very-short 7-tick half-life (~230 ms at 30 tps) ensures the signal is *fresh*: the pheromone effectively decays back to baseline within a second of leaving sensory range, so Sex Drive only synthesises while the mate is currently perceivable, not from stale memory of a past encounter.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **Stimulus-gene injection** | Stimulus genes (genome-defined, not in `biochemistry.json`) | Stimuli inject *stim chemicals* mapped to biochem chem 41 via `STIMTOBIOCHEMOFFSET = 148` — biochem 41 ↔ stim chemical 148 | When the SensoryFaculty fires opposite-sex perception (`IP_NEAR_OPPOSITE_SEX` situation input, `IP_IT_IS_OPPOSITESEX` detail input), the linked stim gene injects chem 41 into the bloodstream | Per stim event — magnitude controlled by the stim gene's amount field |
| 2 | **CAOS `CHEM` injection** | — | — | `chem 41 <amount>` writes directly to the chemical pool. Used by the **Medicine Maker** love potion (`Bootstrap/001 World/medicine maker.cos`): `chem 39 .4` + `chem 41 .4` simultaneously primes both reactants of reaction 32 | Author-defined |
| 3 | **Ingestion / inhalation** | — | — | Foods, drugs, or `EMIT`-style agent emissions authored to contain chemical 41. Common in user-made aphrodisiac agents | Author-defined |

There is **no emitter, no reaction product, no locus source, and no initial-concentration endowment** for this chemical. It is one of the few "pure input" chemicals in the standard genome — it appears in the bloodstream *only* as a result of perceiving an opposite-sex creature (or an author-scripted shortcut to that signal), and never from any closed-loop body process.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | Passive decay | — | — | Half-life **7 ticks** (decay rate 0.90864), "Very short" speed | With no inflow, concentration halves every ~230 ms. The signal effectively vanishes within ~50 ticks (~1.6 s) of leaving sensory range, ensuring Sex Drive synthesis tracks current perception rather than stale memory |
| 2 | **Sex Drive synthesis** (consumed, both reactants) | Reaction 32, gene 76, Youth onwards | 1× **Arousal Potential [39]** + 1× Opposite Sex Pheromone → 1× **Sex Drive [161]** | Half-life **4 ticks** (very short — "Very short" speed) | The single reaction that consumes chem 41. Both reactants are destroyed 1:1 to produce Sex Drive at unit yield. This is the mating-chemistry **AND gate**: it requires *both* internal fertility (AP from emitter 22 reading `LOC_FERTILE`) *and* external mate perception (chem 41 from the stimulus gene) to fire. With AP alone the creature feels generic readiness but has no mating partner to drive toward; with chem 41 alone the creature perceives a mate but is physiologically infertile and uninterested |
| 3 | **Brain stimulus** (catalytic — receptor only reads) | Receptor 23, gene 1, Youth onwards | Brain / Tissue 6 (stim lobe) / locus 20 → stim neuron 20 | Threshold **0**, rate 3, gain 14, **DIGITAL (fixed gain)** | The moment chem 41 is non-zero the receptor fires stim lobe neuron 20 with a fixed-gain digital signal. Threshold 0 means *any* trace of the chemical activates the stimulus. The stim lobe (40 neurons, lobe index 6 — `brain-architecture.json:1660-1668`) is one of the brain's primary sensory inputs, feeding the concept and decision lobes. Receptor flag is read-only — the chemical is **not consumed** by the receptor, so the brain stimulus and reaction 32 share the same pool independently |

The chemical has **no other receptors anywhere in the genome** — no body locus reads it, no other brain neuron is wired to it, and only one reaction consumes it. The dual-pathway design (one reaction + one brain receptor) is the entirety of its functional footprint.

## Role in Game Mechanics

### The reproductive AND gate

Reaction 32 is the architectural keystone of the entire mating system. Its formula `AP + OSP → Sex Drive` is the chemistry-engine's way of expressing the design rule "a creature should pursue mating only when it is *both* fertile *and* near a viable mate":

```
  ReproductiveFaculty                   SensoryFaculty / Stimulus genes
       │                                          │
       │  myFertileLocus = (myGamete) ? 1 : 0     │  IT_IS_OPPOSITESEX → stim event
       ▼                                          ▼
  LOC_FERTILE                               (stim chemical 148)
       │                                          │
       │ Emitter 22 (gene 19, DIGITAL,            │
       │   threshold 128, rate 3, gain 14)        │
       ▼                                          ▼
  Arousal Potential [39]   ────────►  Reaction 32   ◄────────  Opposite Sex Pheromone [41]
        ▲                              (gene 76)                       │
        │                                  │                           │
        │                                  ▼                           │
        │                          Sex Drive [161]                     │
        │                                  │                           │
        │                                  ▼                           │
        │                       Drive lobe → behaviour                 │
        │                                                              │
        └────────── Libido lowerer [40] (infertile half) ──────────────┘
                  destroys AP (reactions 34, 36) when no gamete
```

Notice the asymmetry: AP has its own active suppressor (Libido lowerer, fired by emitter 24 with the INVERT flag on the same `LOC_FERTILE` bit), but chem 41 has **no suppressor** — its 7-tick passive decay is the only thing that removes it. This is a deliberate design: the body needs to actively cancel its *internal* readiness signal during refractory periods (otherwise AP's 105-tick half-life would let arousal leak for several seconds after losing fertility), but the *external* perception signal cancels itself naturally just by the creature looking away or the mate walking out of range.

### Reaction 32 is fast — but speed-limited by the rarer reactant

Reaction 32 has a half-life of just 4 ticks (~130 ms), one of the fastest non-instant reactions in the genome. This means whenever both reactants are present, Sex Drive is synthesised almost as fast as the rate-limiting reactant is supplied. In practice:

- **Fertile creature, no mate visible.** AP accumulates from emitter 22 (gain 14, rate every 3rd tick) and waits — the 105-tick half-life lets it build to substantial levels. No chem 41 means no Sex Drive synthesis. The creature feels physiologically ready but has no behavioural target.
- **Infertile creature, mate visible.** Stim genes inject chem 41 at every perception tick, but Libido lowerer (emitter 24, INVERT) is actively destroying AP via reactions 34/36. AP stays near zero, so reaction 32 has nothing to combine chem 41 with. Chem 41 then decays unused via its 7-tick half-life, and the brain receives a transient "opposite sex" stimulus on stim neuron 20 but no Sex Drive. The creature notices the potential mate but feels no urge to pursue.
- **Fertile creature, mate visible.** AP is high (no Libido lowerer to destroy it), chem 41 is being injected by the stim gene each tick. Reaction 32 fires at maximum speed, both reactants are consumed, and Sex Drive accumulates rapidly. The drive lobe sees the rising drive and the decision lobe selects courtship behaviour. **This is the only state in which a normal creature actively pursues mating.**

### The dual brain pathway (stim neuron 20)

Receptor 23's mapping of chem 41 onto stim lobe neuron 20 means the brain receives a *direct, fast* notification of opposite-sex perception, parallel to the slower chemistry route through Sex Drive. The two pathways serve different time-scales:

- **Stim neuron 20** fires within a single tick of chem 41 entering the bloodstream (DIGITAL fixed-gain receptor, threshold 0, gain 14). It feeds the concept and decision lobes immediately, so the creature can form *associative learning* about the mate (linking the visual/smell category to the perception event) within the same tick.
- **Sex Drive** takes a few reaction ticks to accumulate via reaction 32 (and only if AP is also present), and then drives behaviour selection through the drive lobe.

This separation is important for learning: a young or infertile creature still has the brain stimulus when it sees the opposite sex, so it can *learn the concept* of "mate" (build category associations in the visual/concept lobes) long before the chemistry can produce mating behaviour. By the time the creature reaches Youth (when emitter 22 and reaction 32 switch on), the concept circuitry is already trained and the creature has the cognitive infrastructure to act on its newly-functional reproductive chemistry.

### Why no internal source?

The deliberate absence of any emitter, reaction product, or initial endowment for chem 41 is the chemistry-engine's way of enforcing **"perception drives mating, not biology alone"**. A creature in solitary confinement cannot self-stimulate — without external mate perception (or external CAOS/agent injection), chem 41 stays at zero forever, no matter how fertile the creature is. This matches the design intent: mating in Creatures is a *social* event, not a hormonal one.

It also means the chemical is a clean diagnostic signal: sampling `CHEM TARG 41` on a creature is essentially asking "has this creature perceived an opposite-sex peer in the last second?". A non-zero reading proves recent perception; zero proves either no perception or that the creature has been alone for >50 ticks. There is no possibility of a false positive from internal chemistry, because no internal source exists.

### Practical gameplay consequences

- **`CHEM TARG 41 255` does not by itself induce mating** — it floods the perception signal but, without simultaneous Arousal Potential, reaction 32 has no second reactant. Sex Drive remains at zero. The creature receives a strong stim lobe neuron 20 firing (so it may show transient interest or a learning event) but does not pursue any partner.
- **The Medicine Maker love potion injects both at once.** `Bootstrap/001 World/medicine maker.cos` doses `chem 39 .4` *and* `chem 41 .4` together — bypassing both the fertility check (AP) and the perception check (chem 41) simultaneously. Reaction 32 then runs and Sex Drive accumulates. This is the standard "aphrodisiac" recipe: hit reactant 1 *and* reactant 2 in the same injection, never just one.
- **Infertile creatures still see and learn the opposite sex.** Because chem 41 is injected by stim genes regardless of fertility, and stim neuron 20 fires regardless of AP availability, an infertile creature still develops normal opposite-sex concept formation and friend/foe associations. Only the *behavioural* pursuit is gated by the AP gate; cognitive recognition runs independently.
- **The 7-tick half-life prevents stale-perception mating.** A creature that briefly catches sight of a mate but then loses sight (mate walks away, vision blocked) will see chem 41 decay to ~zero within ~50 ticks. Reaction 32 then stops, AP returns to its base accumulation, and Sex Drive synthesis halts. This naturally prevents creatures from chasing mates they can no longer perceive — an important behavioural realism feature.
- **The chemical mediates only opposite-sex attraction.** Note that the SensoryFaculty's perception logic explicitly checks that the perceived creature has the same family and the same genus but the opposite sex before firing the stimulus — so chem 41 is only injected for same-genus, opposite-sex creatures. Same-sex peers, different-species peers, and own-species same-sex peers all fail the check and do not produce the chemical. The stim gene therefore implements species-correct heterosexual attraction at the perception layer, and the chemistry inherits that filtering for free.
- **Breeding out reaction 32 produces "perceives but never mates" creatures.** Removing gene 76 breaks the AND gate: chem 41 still floods on perception, AP still accumulates on fertility, but the two never combine into Sex Drive. Such a creature courts no one, regardless of fertility or social environment.
- **Breeding out receptor 23 produces "mates but never learns" creatures.** Removing gene 1 (the receptor) leaves reaction 32 functional but cuts the stim lobe pathway. The creature still synthesises Sex Drive when fertile-and-near-mate, and still pursues partners, but never receives the brain-level perception stimulus that drives concept learning. Such a creature mates correctly but does not form rich associative memories about its partners.

### Summary

Opposite Sex Pheromone is the **external-perception input** of the mating chemistry, the partner reactant to internal Arousal Potential in the synthesis of Sex Drive:

```
  External world: opposite-sex creature in sensory range
           │
           │  SensoryFaculty update  →  stim gene fires
           ▼
  Opposite Sex Pheromone [41]   • half-life 7 ticks (very short)
                                • NO emitter, NO reaction source, NO endowment
                                • injected ONLY by stims, ingestion, EMIT, or CHEM
           │
           ├──► Receptor 23 (gene 1, DIGITAL, threshold 0)
           │         → Brain / stim lobe / neuron 20 (perception → concept learning)
           │
           └──► Reaction 32 (gene 76, HL 4)
                     + Arousal Potential [39]  →  Sex Drive [161]
                          │
                          ▼
                     Drive lobe → courtship behaviour
```

It is the chemistry-engine's expression of the design rule that mating in Creatures is a social act: a creature that never perceives a mate has zero chem 41 forever, reaction 32 cannot fire, and Sex Drive remains at zero — no matter how fertile, healthy, or hormone-saturated the creature is. Conversely, perception alone is not enough: without internal Arousal Potential (gated by the gamete state), the perception signal flows into the brain (stim neuron 20) for cognitive learning but never converts into behavioural drive. The two-reactant AND gate that combines this external signal with the body's internal fertility signal is the central mechanism by which Creatures 3 enforces the rule that reproduction requires *both* a willing body *and* a perceived partner — and Opposite Sex Pheromone is the chemical that carries the second half of that requirement.
