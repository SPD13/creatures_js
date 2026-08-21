# 081 - Muscle toxin

Muscle toxin is chemical slot 81 in the Creatures 3 chemistry and is the **twelfth and final entry in the canonical bacterial-toxin block** (chemicals 70-81) — the contiguous range of chemicals that infectious bacteria can be rolled to inject into their host while actively colonising it. Unlike the preceding drive-injector toxins (Sleep toxin 71 and Fear toxin 80), which cause no organ damage and merely nudge a behavioural drive, Muscle toxin is a **true damage toxin**: it wires directly into the somatic injury system and also funnels into Lactate (chemical 1), which is the genome's long-term "scar" chemical. A creature dosed with Muscle toxin therefore takes **immediate organ injury** via one receptor path *and* accumulates **permanent injury memory** via a second, Lactate-mediated path — making Muscle toxin one of the few bacterial toxins whose damage outlives the infection that delivered it.

The in-fiction thematic role of chemical 81 is the "exertion poisoning" toxin: a bacterium that secretes Muscle toxin is a bacterium that makes its host's muscles feel as if they have been pushed past the point of failure. Real-world lactic-acid buildup from sustained muscular effort contributes to tissue fatigue and soreness, and the genome's chemistry deliberately models this — Muscle toxin converts one-to-one into Lactate, the same chemical that accumulates from real exertion, and Lactate is the Organ/Somatic tissue's canonical damage signal (see `chemicals/001 - Lactate.md`). A Norn infected by a Muscle-toxin-carrying bacterium ends up biochemically indistinguishable from a Norn that has been forced to run itself to exhaustion: the same waste-product signal is laid down in the same injury locus. The bacterium annotation in `bacteria.md` describes the phenotype as "impairs movement", which is the emergent consequence of chronic somatic injury rather than a dedicated sensorimotor pathway — an injured creature is a stiff, slow, unresponsive creature.

Unlike the "classic cureable toxins" (Heavy Metals, Cyanide, Belladonna, Geddonase, Glycotoxin, Alcohol, ATP Decoupler, Carbon monoxide) which each have a dedicated antidote chemical and potion in the Medicine Maker, **Muscle toxin has no antidote reaction and no listed cure in the stock genome**. It is absent from the Medical Pod's "creature is sick" scanner list (`medical scanner.cos:80`, which stops at chem 78 plus chem 30 and the antigen block 82-89). It is absent from the General Cure potion's documented toxin coverage ("*Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin*"). Its passive decay is **the slowest of the entire bacterial-toxin block** at 3,024 ticks (~100 seconds of real play per halving at 30 tps, decay rate 0.99977), more than twice as long-lived as Fear toxin (1,241) or Carbon monoxide (1,370). And critically, Muscle toxin's primary clearance reaction (reaction 81) does not actually destroy its damage potential — it *transfers* it into Lactate, which has an effectively infinite half-life (~9 × 10¹⁰ ticks, decay rate 1.0). The player therefore confronts a toxin that is both slow to clear *and* whose clearance product is a permanent injury marker: there is no natural pharmacological recovery path.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No endogenous production** — no emitter and no synthesising reaction in the standard genome | — | — | A healthy creature is born with Muscle toxin = 0. There is no metabolic pathway that generates chemical 81 from anything the body already makes. Unlike real-world lactate (which is produced by anaerobic glycolysis in exerting muscles), the Creatures 3 genome does *not* model exertion-driven Muscle toxin production — Lactate is downstream of Muscle toxin in this chemistry, not upstream of it, so there is no "run to generate lactate" pathway |
| 2 | **Bacterial infection** (primary stock-game source) | `bacteria.cos` (family/genus/species `2 32 23`), OV16 | Every timer tick while the bacterium is active (not dormant), inject `ov17` (0.005-0.050) units of `ov16` into the host | OV16 is rolled per-bacterium (`setv ov16 rand 70 81`, bacteria.cos:82) and may take any value in 70-81; when OV16 = 81 the bacterium is a Muscle-toxin carrier. The bacterium catalogue entry at `DOCUMENTATION/caos_scripts/bacteria.md:181` annotates slot 81 as "Muscle Toxin — Impairs movement". A chronic infection therefore lays down a monotonically-rising Lactate deposit in addition to elevating instantaneous Muscle toxin, creating both an acute and a permanent injury signal |
| 3 | **Bacterial-toxin themed agents** (hostile foods, strain-gas traps, community disease packs) | User-made `.agents` / `.cob` files | `CHEM TARG 81 <amount>` on bite, touch or spore-emission events | Muscle toxin is an attractive chemical for community authors who want a "fatigue poison" or a "burnout trap" that degrades a creature's physical capability without overtly killing it. Because the toxin's damage compounds via Lactate, repeated exposure produces progressive deterioration — a design lever rarely available through other bacterial-block toxins |
| 4 | **CAOS injection** | — | `CHEM TARG 81 <amount>` from scripts or the debug console | The standard way to test reaction 81's 1:1 Muscle-toxin-to-Lactate stoichiometry, to probe the direct RLOCUS_INJURY receptor at gain 26, or to lay down a controlled Lactate deposit for injury-recovery research |

Muscle toxin thus follows the "no endogenous source, external delivery only" design of the bacterial-toxin block. It is not referenced by any stock Medicine Maker recipe, is not mentioned in the *Materia Medica*'s chemical-by-chemical section beyond the bare slot name, and does not appear in the Medical Pod's scanner thresholds — an indication that it was wired into the genome primarily as a bacterial-infection ingredient rather than as a potion-cureable acute poisoning.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Muscle-toxin → Lactate conversion** | 94 (reaction 81, Baby onwards) | Reaction / Somatic | `1× Muscle toxin [81] → 1× Lactate [1]`, rate 32, half-life 24 ticks ("Short", decay rate 0.9712) | — | — | — | — | The primary sink for Muscle toxin. Each activation consumes one unit of Muscle toxin and produces exactly one unit of Lactate. The fast Short half-life (~0.8 s at 30 tps) means the conversion is efficient and nearly complete — any Muscle toxin the creature is exposed to is rapidly funnelled into Lactate, ahead of the much slower (~100 s) passive decay pathway. The 1:1 stoichiometry is a clean damage-transfer reaction with no amplification or attenuation. Crucially, because Lactate's own half-life is effectively infinite, this reaction does not remove Muscle toxin's damage — it *converts* the damage from a decaying-instantaneous signal into a permanent one |
| 2 | **Direct somatic-injury receptor** | 148 (receptor 183) | Organ / Somatic | `RLOCUS_INJURY` (locus 2), chem 81 | 0 | 0 | 26 | none | Any non-zero Muscle toxin concentration immediately raises the somatic Injury locus in proportion to its concentration. Gain 26 is moderate — about 10% of the maximum possible injury signal per unit of toxin — so Muscle toxin is a *steady* rather than *catastrophic* injury contributor. Because the receptor's threshold is 0, there is no "safe dose" below which the toxin is ignored: every trace of circulating Muscle toxin registers as injury |
| 3 | **Indirect somatic-injury via Lactate** | 149 (receptor 182), paired with reaction 81 | Organ / Somatic | `RLOCUS_INJURY` (locus 2), chem 1 (Lactate) | 0 | 0 | 34 | none | The downstream injury pathway. Each unit of Muscle toxin converted by reaction 81 becomes one unit of Lactate, which drives receptor 182 (higher gain 34) on the same `RLOCUS_INJURY` locus. Because Lactate never decays naturally (half-life ~9 × 10¹⁰ ticks, decay rate 1.0), this receptor sees a *monotonically non-decreasing* input across the creature's lifetime. Gain 34 > 26 means the Lactate signal eventually dominates the direct Muscle-toxin signal: the *permanent scar* ends up larger than the acute injury |
| 4 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | No pharmaceutical neutralisation path exists in the stock genome. Clearance of the toxin itself proceeds via reaction 81 (but only by depositing permanent Lactate) and passive decay (3,024-tick half-life). Clearance of the downstream Lactate requires external intervention — healing drugs with a Lactate-consuming reaction, CAOS scripts that directly zero Lactate, or genetic engineering to add a Lactate decay pathway |
| 5 | **Not listed in Medical Pod scanner** | `medical scanner.cos:80` | — | — | — | — | — | — | The sick-threshold `doif` at `medical scanner.cos:80` watches chem 66, 67, 68, 69, 70, 75, 78, 82-89 and chem 30 < 0.5, but **does not include chem 81**. A Muscle-toxin-infected creature will not trip the Medical Pod's "sick" alert from the toxin alone; the player must diagnose it behaviourally (creature sluggish, unresponsive, apparently old-before-its-time) or chemically (chemistry panel showing Muscle toxin > 0 and accumulating Lactate) |
| 6 | **Not in General Cure** | Materia Medica | — | — | — | — | — | — | The General Cure potion's stated toxin list is "*Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin*" — chem 81 is absent. There is no one-potion pharmaceutical lever on Muscle toxin (nor on its downstream Lactate) in the stock Medicine Maker |
| 7 | **Passive decay** | — | — | Half-life **3,024 ticks** ("Long", decay rate 0.99977083) | — | — | — | — | The fallback clearance pathway, and **the slowest in the entire bacterial-toxin block**. About 100 seconds of real play time per halving at 30 tps — more than twice Fear toxin's 1,241 ticks and substantially longer than Carbon monoxide's 1,370 or Sleep toxin's 1,513. In practice, reaction 81's 24-tick half-life dominates passive decay by two orders of magnitude, so almost all Muscle toxin is converted to Lactate before it decays — meaning passive decay rarely contributes meaningfully to clearance |

The usage table is the portrait of a **damage-transfer toxin**: one reaction that converts Muscle toxin cleanly to Lactate at a 1:1 ratio, two parallel injury receptors (one direct on the toxin, one indirect on the Lactate product) that between them guarantee every unit of Muscle toxin leaves a permanent somatic-injury signature, no antidote, no diagnostic visibility beyond the chemistry panel, and the longest passive decay of any bacterial-block toxin. Everything that happens to the creature somatically happens through the `RLOCUS_INJURY` locus — there is no behavioural drive being nudged, only a steady accumulation of organ-level damage.

## Role in Game Mechanics

### The two-path injury architecture

Muscle toxin is unique among the bacterial-toxin block in that it wires to the same organ-level injury locus (`RLOCUS_INJURY` on Organ/Somatic) via *two* parallel receptors:

- **Direct path (receptor 183).** Gain 26, threshold 0, reads chem 81 directly. Active only while Muscle toxin is circulating; falls to zero once the toxin is fully converted or decayed.
- **Indirect path (receptor 182, via reaction 81).** Gain 34, threshold 0, reads chem 1 (Lactate). Active *permanently* once any Muscle toxin has been converted, because Lactate does not decay.

This is a deliberate design: the direct path provides **acute** injury during the dose, and the indirect path provides **chronic** injury after the dose. Together they produce a characteristic two-phase clinical profile:

| Phase | Duration | Dominant signal | Injury magnitude |
|-------|----------|-----------------|------------------|
| Acute (during exposure / 0-3 s after) | Short half-life 24 ticks | Muscle toxin via receptor 183 (gain 26) + rising Lactate via receptor 182 (gain 34) | Maximum — both receptors firing |
| Chronic (3 s - lifetime of creature) | Until externally cleared | Lactate alone via receptor 182 (gain 34) | Permanent floor — cannot fall below the Lactate-driven signal |

Because reaction 81 is so fast (24-tick Short half-life against the toxin's 3,024-tick passive decay), the acute phase is brief — a matter of seconds — while the chronic phase is, functionally, eternal. The relative gains (26 direct, 34 indirect) mean that the *permanent* signature ends up larger than the *acute* signature once conversion is complete. A creature that survives a Muscle-toxin dose is more injured in the long run than it was at the moment of exposure.

### The Lactate permanence trap

The defining feature of Muscle toxin's chemistry is that **its clearance does not actually clear its effect**. This is the direct opposite of how most toxins in the genome work:

- **Cyanide** (chem 67) → Thiosulphate antidote reaction → cleanly destroyed, no downstream damage.
- **Carbon monoxide** (chem 79) → Anti-oxidant (chem 93) reaction → cleanly destroyed, no downstream damage.
- **Fear toxin** (chem 80) → reaction 79 mints Fear drive → Fear drive has its own decay and backup reservoir, returns to baseline.
- **Sleep toxin** (chem 71) → reaction 82 mints Sleepiness → Sleepiness decays into Sleepiness backup, returns to baseline.
- **Muscle toxin** (chem 81) → reaction 81 mints Lactate → **Lactate never decays**, signal persists until externally cleared.

Lactate's half-life in the stock genome is 90,682,980,616 ticks (decay rate 1.0) — in practical terms, infinite. Once a unit of Muscle toxin has been converted into a unit of Lactate, the injury signal produced by that Lactate unit will persist for the entire rest of the creature's life unless the player or a script actively intervenes. This makes Muscle toxin fundamentally different from the other bacterial toxins: the others are **transient insults**, while Muscle toxin is a **scarring insult**.

The design intent is visible in how `chemicals/001 - Lactate.md` describes the pair: *"Lactate is the 'memory' of this exposure. … This makes Lactate a 'scar chemical': it records cumulative damage rather than an instantaneous pain signal."* A creature accumulates a Lactate deposit throughout its life from every Muscle-toxin exposure it experiences, and older / more travelled / more sickly creatures therefore carry progressively higher baseline injury — a form of biochemical ageing overlaid on the genome's explicit ageing system.

### Interaction with the bacterial infection system

Muscle toxin's primary stock-game vector is the bacterium agent family (`bacteria.cos`, class `2 32 23`). Each bacterium, on instantiation, rolls OV16 randomly in the range 70-81 (`setv ov16 rand 70 81`, bacteria.cos:82). When OV16 lands on 81 the bacterium becomes a Muscle-toxin carrier and, while actively infecting a host, injects `ov17` (0.005-0.050) units of chemical 81 into the host's bloodstream on every timer tick.

The 1:1 stoichiometry and fast conversion rate of reaction 81 produce a distinctive infection profile:

- **Toxin concentration stays low.** Because reaction 81 fires at rate 32 with half-life 24 ticks, it consumes Muscle toxin almost as fast as the bacterium injects it. The bloodstream Muscle toxin level reaches a modest steady-state that reflects the injection rate, not an accumulation — the chemistry panel will show a small but persistent Muscle toxin reading rather than a rising one.
- **Lactate accumulates linearly.** Each unit of injected toxin becomes a unit of Lactate that never decays. If the bacterium injects at 0.050/tick for, say, 600 ticks before antibodies suppress it, that is 30 units of Lactate permanently deposited. The direct Muscle-toxin signal fades within seconds of the bacterium going dormant, but the Lactate-driven injury signal does not fade at all.
- **The acute phase is nearly invisible; the chronic phase is nearly invisible too.** Receptor gains of 26 and 34 are moderate, not catastrophic. A creature with a small Lactate deposit is mildly injured but not dying. The symptoms — reduced energy, sluggish response, "impaired movement" — come from the Somatic organ's injury locus feeding back into the creature's metabolic efficiency, not from any dedicated sensorimotor override.

The upshot is that a **Muscle-toxin bacterial infection is an insidious, low-grade, cumulative injury** rather than an acute crisis. The bacterium does not visibly damage the creature during any single infection window, but every infection window it survives adds permanent injury that the creature cannot shed. A creature that suffers multiple Muscle-toxin infections across its lifespan accumulates a Lactate deposit much like biochemical scar tissue, contributing to the way veteran creatures often feel "slower" and "more fragile" than fresh ones.

### Why "impairs movement"

The `bacteria.md` annotation describes Muscle toxin's phenotype as "impairs movement", but there is **no direct sensorimotor receptor on chem 81** in the stock genome. The movement impairment is emergent, mediated through the `RLOCUS_INJURY` locus:

1. Injury on the Somatic organ raises the organ-level injury signal.
2. The injury signal is read by genome wiring on the brain's action-selection and drive-resolution layers as a generic "this body is damaged" input.
3. Damaged bodies move more slowly (via the genome's built-in relationship between organ health and energetic efficiency), are less responsive to stimuli, and exhibit reduced physical drive fulfilment.

This is biologically appropriate — real-world lactic-acid buildup causes muscular fatigue and reduced movement capacity via metabolic rather than neural pathways — and it is also mechanically elegant: Muscle toxin does not need a special "slow the creature down" receptor because the injury locus already has that effect built in. It shares the same generic injury pipeline that Wounded (chemical 90), direct trauma, and other damage sources feed, merely contributing its own chemistry-driven stream of injury signal to the pool.

### Contrast with the other bacterial-toxin-block entries

Muscle toxin's architecture is distinctive within the bacterial-toxin block when placed alongside its neighbours:

| Chemical | Clearance reaction | Reaction product | Product persistence | Receptor(s) on toxin | Effect class |
|----------|-------------------|------------------|---------------------|-----------------------|--------------|
| Sleep toxin (71) | `4× → 3× + 2× Sleepiness` | Sleepiness (155) | Decays → Sleepiness backup; returns to baseline | None direct | Drive injector (behavioural) |
| Fear toxin (80) | `14× → 1× Fear` | Fear (158) | Decays → Fear backup; returns to baseline | None direct | Drive injector (behavioural) |
| **Muscle toxin (81)** | `1× → 1× Lactate` | Lactate (1) | **Never decays; permanent** | Receptor 183 (direct injury, gain 26) | **Damage toxin (permanent)** |
| Cyanide (67) | Thiosulphate antidote | nothing (destroyed) | n/a | Direct toxicity | Damage toxin (reversible) |
| Carbon monoxide (79) | Anti-oxidant | nothing (destroyed) | n/a | Direct toxicity | Damage toxin (reversible) |

Three distinguishing properties:

1. **Only toxin in the block with a persistent clearance product.** Sleep toxin and Fear toxin mint drives that eventually decay. Muscle toxin mints Lactate that never decays. This is the chemistry-level design difference that makes Muscle toxin scar the creature.
2. **Only toxin in the block that damages via injury locus rather than via drive chemistry.** The drive-injector toxins (71, 80) nudge behavioural chemistry; the cureable damage toxins (67, 70, 78, 79) wire into generic toxicity paths. Muscle toxin uniquely wires into `RLOCUS_INJURY` — the same locus physical trauma uses.
3. **Longest passive half-life in the block.** 3,024 ticks versus 1,241-1,670 for the others. Even in the absence of reaction 81, a Muscle-toxin dose would linger longer than any other bacterial toxin — but reaction 81's speed means this mostly matters as a safety margin ensuring nearly complete conversion to Lactate.

### Why there is no antidote — and the design cost

The stock genome follows the same philosophy for Muscle toxin as for the drive-injector toxins: no dedicated antidote reaction. For Sleep toxin and Fear toxin this is defensible — the drive each one mints returns to baseline naturally once the influx stops. For Muscle toxin the same design choice is more consequential, because Lactate does *not* return to baseline: the injury it produces is genuinely permanent in the stock genome.

The practical consequence for players is that **Muscle toxin is the bacterial-block toxin most worth preventing proactively**. Once a creature has been infected, even a successful immune response (antibodies 102-109 against antigen 82-89 suppressing the bacterium) leaves behind a permanent Lactate deposit and a permanent elevation of the creature's somatic injury signal. There is no natural recovery from this deposit; the only cures are:

- **Community healing drugs** whose chemistry includes a Lactate-consuming reaction.
- **CAOS scripts** (medical kits, cheat agents) that directly reduce the creature's Lactate with `CHEM` / `INJR` commands.
- **Genetic engineering** — mutating the creature's genome to add a Lactate decay reaction, shorten Lactate's half-life, or remove receptor 182.

Without one of these interventions, a creature's Lactate deposit is a lifetime commitment, and the injury signal it produces contributes to every subsequent metabolic and behavioural calculation for the rest of the creature's days.

### Strategic / gameplay implications

- **Cumulative lifetime injury.** Muscle toxin is the stock genome's only bacterial toxin that causes irreversible damage in the default chemistry. Multiple exposures across a creature's life add up linearly to a permanent injury floor.
- **Invisible diagnosis.** Neither the Medical Pod scanner nor the General Cure potion acknowledges chemical 81. The player must inspect the chemistry panel directly, or observe the subtle phenotype (sluggish creature with no other obvious illness) to recognise a Muscle-toxin infection.
- **Prevention dominates cure.** Because the Lactate deposit cannot be cleared by the stock Medicine Maker, keeping creatures away from Muscle-toxin-carrying bacteria is the only effective intervention. Once infected, the creature will carry the scar for the rest of its life.
- **Ageing-analogue effect.** Because Lactate accumulates monotonically with every Muscle-toxin exposure and never clears, it contributes a biochemical component to the way veteran creatures feel "worn" — older Creatures tend to have higher Lactate baselines from lifetime bacterial exposure history.
- **Community healing-drug design target.** A "Lactate clearance" potion would be a high-value community addition precisely because the stock genome lacks one. Community gene-edited creatures sometimes include a Lactate-consuming reaction or a shortened Lactate half-life to provide organic recovery from Muscle-toxin damage.
- **Non-obvious breeding pressure.** In populations exposed to Muscle-toxin-carrying bacteria, creatures with genomic variants that clear Lactate (mutation in gene 149 to reduce receptor gain, or added decay reactions) have a measurable fitness advantage over wild-type creatures — a subtle evolutionary pressure invisible to players who do not track Lactate levels across generations.

## Summary

```
 Chemical 81 — Muscle toxin  (bacterial-toxin block, damage-toxin class)
 --------------------------------------------------------------------------
 Producers:   NONE internally — external only
              - Bacterium agents (class 2 32 23, bacteria.cos) rolling
                OV16 = 81 inject 0.005-0.050 units per tick while active
              - User-made agents via CHEM TARG 81 <amount>
              - CAOS console / scripts for testing

 Consumers:   Reaction 81  (1× Muscle toxin [81] → 1× Lactate [1];
                            HL 24 ticks "Short", gene 94, rate 32 —
                            clean 1:1 damage-transfer with no amplification,
                            but Lactate never decays so the conversion
                            turns a decaying signal into a permanent one)

 Receptors:
   - Receptor 183 (gene 148): Organ/Somatic/RLOCUS_INJURY, chem 81,
                              threshold 0, gain 26 — direct acute injury
                              while the toxin is circulating
   - Receptor 182 (gene 149): Organ/Somatic/RLOCUS_INJURY, chem 1 (Lactate),
                              threshold 0, gain 34 — permanent chronic
                              injury once conversion has occurred

 Half-life:   3,024 ticks (~100 s at 30 tps, decay 0.99977 — "Long")
              THE LONGEST OF ANY BACTERIAL-TOXIN-BLOCK MEMBER

 Antidote:    NONE in stock genome. Not in General Cure. Not in any
              Medicine Maker recipe. Not listed in Medical Pod scanner.
              Lactate (downstream) also has no stock clearance path —
              its half-life is effectively infinite.

 Cure:        Stock genome has no natural recovery from Lactate deposit.
              Requires community healing drugs with Lactate-consuming
              chemistry, CAOS scripts to zero Lactate directly, or genetic
              engineering. Stopping the source (kill the bacterium) stops
              further Lactate deposition but does not remove the deposit
              already laid down.

 Narrative role: The "exertion poisoning" bacterial toxin. A true damage
                 toxin — the only bacterial-block member whose clearance
                 product (Lactate) is permanent. Wires into the same
                 somatic injury locus used by physical trauma, via two
                 parallel receptor paths (direct gain 26, indirect via
                 Lactate gain 34). Phenotype: sluggish, unresponsive,
                 "impaired movement" emergent from chronic somatic injury
                 rather than any dedicated sensorimotor pathway. Damage
                 accumulates monotonically across a creature's lifetime
                 from every exposure; there is no natural recovery.
```

Muscle toxin is the bacterial-toxin block's **permanent-scar chemical**. Where Sleep toxin (71) sedates and Fear toxin (80) panics — both transient effects that fade once the bacterium is suppressed — Muscle toxin lays down an injury signature via Lactate that the creature carries for the rest of its life. Its 1:1 stoichiometry to Lactate, its direct Organ/Somatic injury receptor at gain 26, and its indirect Lactate-mediated receptor at gain 34 together form a two-path damage architecture in which every unit of toxin contributes both acute and chronic somatic injury. The block-record-long passive half-life (3,024 ticks) is ultimately irrelevant because reaction 81 converts nearly all the toxin to Lactate within seconds — but Lactate's own effectively-infinite half-life is what defines the toxin's true phenotype. The practical lesson for players is that Muscle-toxin infections must be **prevented**, not **cured**: by the time the creature's immune system has suppressed the carrying bacterium, the Lactate deposit is already deposited and permanent.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:103` — chemical descriptor slot 81 "Muscle toxin" (empty description)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:135` — player-visible slot name "Muscle toxin"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:346` — chemical 81 lexicon entry "Muscle Toxin" (no dedicated potion / no Materia Medica prose — Muscle toxin has no Medicine Maker cure in the stock catalogue)
- `Rebuild/Assets/Bootstrap/001 World/bacteria.cos:82` — `setv ov16 rand 70 81`: per-bacterium random toxin selection. OV16 = 81 makes the bacterium a Muscle-toxin carrier
- `Rebuild/Assets/Bootstrap/001 World/bacteria.cos:702` — re-roll OV16 on bacterium re-initialisation (same 70-81 range)
- `Rebuild/Assets/Bootstrap/001 World/medical scanner.cos:80` — Medical Pod "sick" scanner threshold battery. **Note that chem 81 is NOT in the list** (the list stops at chem 78 plus chem 30 and the antigen block 82-89) — Muscle toxin infections do not trigger the scanner's generic sick alert
- `Rebuild/DOCUMENTATION/caos_scripts/bacteria.md:181` — bacterium toxin table entry: `81 | Muscle Toxin | Impairs movement`
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - Reaction 81 (gene 94, Baby onwards): `1× Muscle toxin [81] → 1× Lactate [1]`, rate 32, HL 24 ticks ("Short"), decay 0.9712
  - Receptor 183 (gene 148): Organ/Somatic/RLOCUS_INJURY, chem 81, threshold 0, gain 26 — direct acute injury
  - Receptor 182 (gene 149): Organ/Somatic/RLOCUS_INJURY, chem 1 (Lactate), threshold 0, gain 34 — chronic injury via Lactate
  - Half-life entry chem 81: 3,024 ticks, decay rate 0.99977083, "Long" (longest in the bacterial-toxin block)
  - Half-life entry chem 1 (Lactate): 90,682,980,616 ticks, decay rate 1.0, "Very long" (effectively infinite — the key to Muscle toxin's permanent-scar phenotype)
- `Rebuild/DOCUMENTATION/chemicals/001 - Lactate.md` — companion analysis of Muscle toxin's clearance product. Lactate is described as the genome's canonical "scar chemical" whose one-way accumulation records cumulative damage across a creature's lifetime
- `Rebuild/DOCUMENTATION/chemicals/071 - Sleep toxin.md` — companion analysis of a drive-injector bacterial toxin, illustrating the architectural contrast between Muscle toxin's damage-toxin wiring and Sleep toxin's behavioural-drive wiring
- `Rebuild/DOCUMENTATION/chemicals/080 - Fear toxin.md` — companion analysis of the immediately preceding bacterial-toxin-block entry; also a drive-injector toxin with no organ injury, contrasting sharply with Muscle toxin's direct injury receptor and permanent Lactate deposit
- `Rebuild/DOCUMENTATION/chemicals/079 - Carbon monoxide.md` — companion analysis of a classic cureable damage toxin with a fully-wired antidote path. Illustrates what Muscle toxin does *not* have: a clean reversible clearance pathway
