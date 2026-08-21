# 054 - Inhibin

Inhibin is a **reserved-but-unwired hormone slot** in the standard Creatures 3 genome. It sits in the chemical table immediately after the two operating reproductive hormones — Oestrogen (chem 46) and Testosterone (chem 53) — under a name borrowed directly from real-world endocrinology, where inhibin is the peptide hormone secreted by the gonads to **suppress FSH (follicle-stimulating hormone) release from the pituitary**, closing a negative-feedback loop on gametogenesis. In Creatures 3 the slot was clearly intended to play the analogous role — a brake on the ovulation/sperm-production cycle that the genome could wire opposite to Testosterone or Oestrogen — but the production engineers never connected it to anything. The stock genome contains **no emitter, no receptor, no reaction, no initial concentration and no brain wiring** that touches chemical 54. It is reserved by name only.

The half-life entry (`biochemistry.json:8168-8175`) is the standard "unused slot" placeholder used throughout the chemical table: half-life **90,682,980,616 ticks** with a decay rate of exactly **1.0**, meaning the chemical does not decay at all. This is not a deliberate biological choice — it is the catalogue's idiomatic way of saying "this slot exists in the chemical-name table but is otherwise dormant." The same row signature (genomeValue 255, half-life 90,682,980,616, decayRate 1.0, speed "Very long") is shared with the truly anonymous slots 49, 50, 55–60 and others that the catalogue lists only under their numeric IDs. Inhibin's only distinguishing feature is that someone took the trouble to write a real biological name into the catalogue header, leaving a hint of design intent that the rest of the genome never honoured.

Because nothing produces Inhibin and nothing reads it, the chemical has **zero gameplay effect in the unmodified genome**. A `CHEM TARG 54 255` injection will simply sit in the bloodstream forever (decay rate 1.0 → no decay), affecting no locus, no faculty, no brain neuron, and no reaction. The slot is best understood as an open hook for breeders, modders and third-party genome authors who want to add a negative-feedback brake to the reproductive system without colliding with an active chemical name.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | **(none)** — no emitter, no reaction, no initial concentration, no dietary or environmental source in the standard genome | — | — | The chemical is never produced internally by any wired pathway | — |

The only ways Inhibin can appear in a Creatures 3 bloodstream are external:

- **CAOS injection** via the `CHEM` command (e.g. `CHEM TARG 54 128`). With decay rate 1.0 the injected value will persist indefinitely until manually cleared.
- **Ingested or inhaled agents** authored to emit chemical 54 (none exist in the stock game; user-made agents only).
- **Custom genomes** that wire emitters to chemical 54 (e.g. third-party "ChiChi" or "CFE"-style breed packs that activate the dormant slot as part of their own reproductive overhaul).

There is no biological pathway in the stock genome that brings Inhibin into existence.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | **(none)** — no receptor, no reaction consumes Inhibin, no brain wiring | — | — | — | — |
| 2 | Passive decay | — | — | Half-life **90,682,980,616 ticks** (decay rate **1.0**, "Very long") | The "non-decay" placeholder. With a decay rate that rounds to exactly 1.0 in the per-tick multiplier, any concentration injected into the bloodstream remains there forever for all practical purposes (90 billion ticks ≈ 95 years of real time at 30 tps) |

Because the chemical has no consumer of any kind, its only "behaviour" is to sit at whatever concentration it was injected at. Even the universal slow background decay used by ordinary chemicals does not apply — the catalogue explicitly opts this slot out of decay.

## Role in Game Mechanics

### A reserved name from real-world reproductive biology

Real-world inhibin is produced in the gonads (Sertoli cells in males, granulosa cells in females) and acts on the anterior pituitary to selectively suppress FSH while leaving LH largely untouched. In a typical mammalian reproductive axis it forms the negative-feedback loop:

```
 Pituitary ── FSH ──► Gonads ── Inhibin ──► Pituitary (FSH suppression)
                          │
                          └── Gametes (sperm / egg maturation)
```

Translated into Creatures 3 chemistry, the obvious analogue would be a hormone secreted whenever the creature is fertile (i.e. `LOC_FERTILE = 1`) that inhibits the next round of gametogenesis — a counter-signal to Testosterone/Oestrogen that would slow the rebuild phase of the ovulation cycle. The stock genome does not implement this loop; instead Cyberlife's reproductive system uses a much simpler hysteresis on `LOC_OVULATE` driven by an INVERT-flagged emitter on `LOC_FERTILE` (see chems 46 and 53 for full details). The result is that ovulation cycle period is set by the hormone half-life alone, with no hormonal brake — a deliberate simplification that makes the cycle predictable and easy to tune by editing a single half-life value.

The Inhibin slot is therefore best understood as **design vestigia**: a label preserved from an earlier, more elaborate design pass for the reproductive chemistry that was simplified before shipping. The name was retained in the catalogue, presumably so that breeders inspecting the chemical list with the gen-viewer or in CAOS scripts would see a meaningful word rather than a bare numeric ID.

### What it does in practice — nothing

Concretely, in an unmodified Creatures 3 / Docking Station session:

- A creature's blood Inhibin concentration is **0** at birth (no entry in `initialConcentrations`).
- It remains 0 for the creature's entire life (no emitter, no reaction produces it).
- No receptor, locus, brain neuron, drive, faculty or behaviour is sensitive to chemical 54.
- The chemistry display in the genetics tab and CAOS reads of `CHEM TARG 54` will return 0 always, unless an external agent or script has written to it.
- Even if injected, the chemical sits inert — it does not interfere with Oestrogen, Testosterone, Progesterone, the ovulation cycle, libido, or any other system.

The slot is, in the most literal sense, **a name attached to a zero**.

### Practical use-cases for breeders and modders

Because Inhibin is a recognised reproductive-biology name with a free chemical slot and zero decay, it is a natural target for genome modders and CAOS authors who want to add reproductive control without disturbing the existing wiring:

- **Add a true ovulation brake.** A custom emitter could write Inhibin whenever `LOC_FERTILE = 1` (mirroring the real-world feedback loop), and a custom receptor could subtract from `LOC_OVULATE` proportional to Inhibin. This would lengthen the refractory period of the existing ovulation cycle without touching the half-life of Oestrogen/Testosterone — a cleaner, more biologically literate tuning knob.
- **Couple inhibin to a custom contraceptive agent.** Because the slot is empty and labelled, it is a tidy chemical to use as a marker for a long-acting reproductive suppressor injected by a metaroom agent. With decay rate 1.0 it will stay in the system until explicitly cleared, so an agent that wants to deliver a one-shot multi-day contraceptive can inject Inhibin and leave the cleanup to a paired clearing emitter.
- **CAOS script signalling.** With no other system reading or writing chemical 54, it is a safe per-creature scratchpad for CAOS scripts to flag reproductive state, score breeding suitability, or pass information between scripts via the bloodstream. Compare with Locus 5 of the Circulatory tract (the actual scratchpad locus used by Testosterone receptor 117) — Inhibin is even cleaner because it has zero stock traffic.
- **Genetic-engineering courseware.** Because the slot is named after a real hormone whose function is well-documented, it is a useful teaching example for "wire a real biological feedback loop into the genome" exercises with the gen-viewer / Genetics Kit.

In none of these cases does the stock game make any contribution — every interaction with chemical 54 is author-defined.

### Why the slot exists at all

The chemical name table in `ChemicalNames.catalogue` is the master list shown to every CAOS command and every genetics tool. Each of the 256 slots gets either a real name (e.g. "Inhibin", "Testosterone") or a numeric placeholder (e.g. "55"). Real names occupy a slot but do not by themselves wire any chemistry — that wiring is the genome's job. The catalogue exists to give the engine a stable name → ID mapping for display and CAOS resolution; the genome decides whether each named slot does anything.

Cyberlife's pattern across the chemical table is clear: groups of related slots get named together when they share a design theme, even when only some of them end up wired. The reproductive cluster (chems 39–48 plus 53–54 and 161) shows this pattern most clearly:

| ID | Name | Wired in stock genome? |
|----|------|------------------------|
| 39 | Arousal Potential | Yes — emitter 22, reactions 32/34/35/36, brain |
| 40 | Libido lowerer | Yes — emitter 24, reactions 33/34/36 |
| 41 | Opposite Sex Pheromone | Yes — emitter 25, reactions 32/35 |
| 46 | Oestrogen | Yes — emitter 21, receptor 118, reaction 37 |
| 48 | Progesterone | Yes — emitter 23, receptor 120, reaction 37 |
| 53 | Testosterone | Yes — emitter 20, receptors 117/119 |
| **54** | **Inhibin** | **No — slot reserved only** |
| 161 | Sex drive | Yes — reactions 32/33/35 |

Inhibin is the lone unwired entry in this cluster, marking it as the obvious extension point for anyone wishing to enrich the reproductive chemistry without renaming an existing slot.

## Summary

```
 Chemical 54 — Inhibin
 ----------------------
 Producers:    NONE (no emitter, no reaction, no init concentration)
 Consumers:    NONE (no receptor, no reaction, no brain wiring)
 Half-life:    90,682,980,616 ticks (decay rate 1.0 — effectively immortal)
 Stock effect: NONE — purely a reserved name in the chemical table

 Inferred design intent (from the real-world hormone of the same name):
   Negative-feedback inhibitor of gametogenesis — would have braked
   the ovulation / sperm-production cycle had Cyberlife wired it.
   Left as an open hook for breeders, modders and CAOS authors.
```

Inhibin is the textbook example of a **named-but-dormant chemical slot** in the Creatures 3 genome. It carries a real biological name and a hint of design intent from an earlier draft of the reproductive chemistry, but the shipped genome leaves it entirely unconnected. Its most useful property today is exactly that emptiness: a free, well-labelled, non-decaying chemical that custom genomes, contraceptive agents, and CAOS scripts can safely commandeer without risk of colliding with any stock-game machinery.

## Key Source References

- `ChemicalNames.catalogue` — slot 54 named "Inhibin" in the master chemical name table
- `biochemistry.json:8168-8175` — half-life entry for chemical 54 (the "Very long" placeholder used by all unused slots)
- `Libraries/creatures-chemicals.js:70` — chemical descriptor confirming the empty description string
- `Tools/gen-viewer/chemicals.js:58` — same empty descriptor exposed to the genetics tools
- (No engine wiring code references chemical 54 — the slot is purely catalogue-level)
