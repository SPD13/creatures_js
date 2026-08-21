# 011 - Muscle Tissue

Muscle Tissue is the creature's **body-muscle storage chemical** — the protein equivalent of the fat-branch's Adipose Tissue (9). It represents the mass of metabolically-usable muscle the creature carries on its body, built up slowly by physical activity (via the Anabolic steroid signal from the `LOC_MUSCLES` emitter) and broken back down into Amino Acid (13) when the body needs to mobilise protein for growth, repair, or to survive starvation. Just as Adipose is the terminal, compressed tier of the fat pipeline, Muscle Tissue is the terminal, compressed tier of the protein pipeline — the place where the creature's "investment" in structural protein is finally deposited.

A newborn Norn is born with a modest starting Muscle Tissue reserve (amount **32 / concentration ≈12.55 %**), roughly half the starting Adipose pool and far more than any other protein-branch chemical. Unlike Adipose, Muscle Tissue has an **effectively infinite passive half-life** (~9.07 × 10¹⁰ ticks, decay rate 1.0) — it does not leak on its own. The only ways for the body to lose muscle are active catabolism (reaction 13, "wasting") or the latent reaction 12 (which never fires in the stock genome because one of its reactants is the unused placeholder chemical 121). This "build slowly, lose only on demand" design is the biochemical mirror of Adipose: both are long-term reserves, but where Adipose decays passively to punish inactivity, Muscle Tissue decays only when the body actively chooses to tear it down.

Muscle Tissue has **no organ emitter**, **no dietary stim**, **no drive receptor**, and **no brain receptor**. Its one and only readout is receptor **86** on the Creature organ's Circulatory tissue, locus 8 — an inverted digital "muscle too low" alarm that fires hard when Muscle Tissue drops below ≈10.2 % of its range. This receptor pairs with receptor 85 (the Adipose "too skinny" alarm at locus 0 of the same tissue) to form the **twin wasting alarms** of the creature's body-composition signalling: locus 0 screams when you've lost your fat, locus 8 screams when you've lost your muscle. Together they are the lowest-level, body-wide signals of metabolic emergency.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | Gene 1, Baby onwards | Systemic | Newborn endowment | **Amount 32 / concentration 0.1255 (≈12.55 %)** at birth — by far the largest starting pool of any protein-branch chemical, second only to Adipose Tissue (70 / ≈27.45 %) among all core metabolites |
| 2 | Anabolic synthesis (reaction 5) | Gene 55, Baby onwards | Standard | `1× Anabolic steroid [112] + 4× Amino Acid [13] → 1× Muscle Tissue [11]` | Medium, half-life ~621 ticks (decay 0.99888) — the sole synthesis route. Four Amino Acids are condensed into one unit of Muscle Tissue in the presence of one Anabolic steroid. The slow 621-tick half-life and the requirement for two simultaneous reactants make muscle-building a steady, effort-gated process rather than an instantaneous response to eating |

Muscle Tissue has no dietary input and no emitter that writes it directly — every molecule in the body is either born-in (gene 1 endowment) or produced by reaction 5. Because reaction 5 is **gated on Anabolic steroid (112)**, the whole synthesis pathway only runs when the creature's muscle-activity emitter is firing:

- Emitter **43** (gene 34) sits on the Creature organ's Somatic tissue at **locus 0 (`LOC_MUSCLES`)** and emits Anabolic steroid (112) whenever the creature is actively using its muscles (walking, climbing, pushing, carrying). The emitter runs at rate 32, gain 6, DIGITAL, with zero threshold — muscle activity immediately drips Anabolic steroid into the bloodstream.
- Anabolic steroid itself has a **very long half-life** (~13,341 ticks) — a single burst of exercise lingers in the blood for tens of minutes of real-time, letting the slow reaction 5 integrate the effort over a long window.
- Reaction 5 then spends the accumulated Anabolic steroid and Amino Acid pool to lay down new Muscle Tissue.

This coupling — `exercise → Anabolic steroid → Muscle Tissue` — is the creature's implicit "physical training" loop. An active Norn slowly grows stronger (more Muscle Tissue) over time, while a sedentary Norn stays stuck at whatever muscle mass it was born with.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Active muscle catabolism (reaction 13) | Gene 44, Baby onwards | Standard | `1× Muscle Tissue [11] → 4× Amino Acid [13]` | Short, half-life ~47 ticks (decay 0.98549) — the primary "burn muscle for parts" pathway. Runs ~13× faster than reaction 5 was to build, giving the body a rapid emergency-catabolism ratchet that mirrors Adipose's reaction 16. One unit of Muscle Tissue unpacks into four Amino Acids (recovering the four consumed during synthesis) |
| 2 | Latent catalysed catabolism (reaction 12) | Gene 48, Baby onwards | Standard | `1× Muscle Tissue [11] + 1× [121] → 4× Amino Acid [13]` | Medium, half-life ~116 ticks (decay 0.99402) — **dormant in the stock genome**: chemical 121 is an unnamed placeholder that no reaction, emitter, or food stim ever produces, so this pathway never fires. The slot appears to be reserved for a catalysed wasting mechanism that was never wired up; community genomes are free to repurpose chemical 121 to activate it |
| 3 | Muscle-low wasting alarm (receptor 86) | Gene 136, Baby onwards | Creature organ, Circulatory tissue, locus 8 | DIGITAL + REDUCE (inverted, all-or-nothing), threshold 26, nominal 0, gain 255 | The body-wide "too weak" alarm. Below a Muscle Tissue concentration of ≈10.2 % (threshold 26/256), the output fires hard (inverted digital, gain 255, nominal 0) — a full-strength systemic signal that muscle reserves are critically low. Above the threshold the output is silent. Pairs with the Adipose low-signal at locus 0 as the twin "wasting" alarms of the creature's body-composition channel |
| 4 | Passive persistence | — | — | Half-life 9.07 × 10¹⁰ ticks (decay rate 1.0) | Muscle Tissue does not decay on its own. Unlike Adipose, which slowly leaks to punish inactivity, Muscle Tissue sits at whatever level the creature last reached until an active catabolism reaction (13 or, in custom genomes, 12) tears it down |

Muscle Tissue has **no drive receptors, no brain receptors, and no muscle or neuron targets**. Its single readout (receptor 86) feeds into a low-level systemic alarm channel rather than a behavioural drive — the creature does not *feel* its Muscle Tissue level the way it feels hunger for food; instead the body simply raises a whole-body distress signal when muscle has been eaten away to dangerous levels, which other genes can couple to life-critical responses.

## Role in Game Mechanics

### The protein pipeline's Adipose-equivalent

Muscle Tissue is the terminal tier of the creature's protein economy. The full chain runs:

```
  Protein (12)         dietary protein input (chem 12, via stim 79)
       │
       │  reaction 4 (HL ~, dietary digestion)
       ▼
  Amino Acid (13)      free, circulating protein currency
       │▲
       ││
       ││  catabolism (reactions 12, 13)
       ││  HL 47 / HL 116
 anabolism (reaction 5)
 HL 621, needs Anabolic steroid
       ▼│
  Muscle Tissue (11)   long-term structural protein store
```

Where the fat branch has a three-tier pipeline (Fat → Triglyceride → Adipose), the protein branch is two-tier (Protein → Amino Acid → Muscle Tissue). Muscle Tissue is therefore the protein analogue of Adipose: both are the deepest, most-compressed reserve; both are built slowly and torn down quickly; both are read by the body-composition "wasting" receptors on the Creature/Circulatory tissue.

### Why muscle-building needs exercise

The most distinctive feature of Muscle Tissue compared to Adipose is that its synthesis is **not** driven purely by nutrient availability. Reaction 10 (Adipose synthesis) runs whenever Triglyceride is present — overeat and you fatten up regardless of activity. Reaction 5 (Muscle synthesis), by contrast, requires both Amino Acid *and* Anabolic steroid, and Anabolic steroid is only emitted by the `LOC_MUSCLES` emitter in response to actual muscle use. The biochemical rule is:

- **Eat protein without exercising** → Amino Acid pool fills, but no Anabolic steroid → reaction 5 idle → muscle does not grow.
- **Exercise without eating protein** → Anabolic steroid rises, but Amino Acid pool is empty → reaction 5 still idle → muscle does not grow.
- **Exercise *and* eat protein** → both reactants present → reaction 5 runs → Muscle Tissue accumulates.

This encodes a simple but effective "training principle" into the biochemistry: a Norn only builds muscle when it is both active and well-fed. A captive, sedentary Norn — no matter how lavishly fed — will not hypertrophy; a wild, roaming Norn that eats reasonably will slowly bulk up over many in-game hours.

### The asymmetric build-up / tear-down kinetics

Reaction 5 runs at half-life ~621 ticks ("Medium"), while reaction 13 runs at half-life ~47 ticks ("Short"). That is an order-of-magnitude asymmetry: **muscle takes ~13× longer to build than to burn**. This matches the Adipose kinetics exactly (reaction 10 synthesis at HL 621 vs reaction 16 mobilisation at HL 47) and produces the same behavioural signature:

- Gaining muscle is a slow, cumulative process. Visible changes in a Norn's Muscle Tissue level take many thousands of ticks of consistent exercise.
- Losing muscle is rapid. If the body enters a state where Amino Acid demand exceeds dietary supply (growth, injury-repair, starvation), reaction 13 quickly tears down Muscle Tissue to top up the Amino Acid pool.

This is the biochemical justification for the wasting alarm: because reaction 13 can deplete the muscle reserve over minutes of game-time, the body needs a fast-firing low-muscle signal so that downstream genes can respond before the creature becomes structurally compromised.

### The "twin wasting alarms" at Creature/Circulatory locus 0 and locus 8

Receptor 85 reads Adipose (9) at locus **0** — the starvation-fat alarm.
Receptor 86 reads Muscle Tissue (11) at locus **8** — the starvation-muscle alarm.

Both use identical flag settings (DIGITAL + REDUCE, gain 255) and both have low thresholds (8/256 ≈ 3.1 % for Adipose, 26/256 ≈ 10.2 % for Muscle Tissue). The two signals are designed to fire at different points along a starvation trajectory:

- Muscle Tissue's higher threshold (~10.2 %) means the **muscle alarm fires first**. As soon as the body starts tearing down muscle to feed Amino Acid demand, receptor 86 trips and the systemic "wasting-muscle" signal goes hot.
- Adipose's much lower threshold (~3.1 %) means the **fat alarm fires much later** — only when the fat reserve has been almost completely consumed.

The biological logic is clean: creatures tear muscle down before they run completely out of fat, because Amino Acid demand (for repair, immune response, growth) often becomes critical before fat stores are fully exhausted. The genome therefore wants to know the *moment* muscle starts wasting, but only needs to be told about fat when it's essentially gone. These two alarms together give downstream signalling circuits a clean two-stage picture of the creature's metabolic state:

1. "Wasting muscle" (loc 8 fires) — early-to-mid starvation warning.
2. "Wasting muscle + wasting fat" (both fire) — terminal starvation, intervene now or the creature dies.

### The mystery of reaction 12 and chemical 121

Reaction 12 — `1× Muscle Tissue + 1× [121] → 4× Amino Acid` — is the odd one out in the stock biochemistry. It appears to be a catalysed-catabolism alternative to reaction 13 (slower, HL 116 instead of HL 47, but requiring a second reactant). The catch is that chemical 121 is labelled as the string `"121"` in `ChemicalNames.catalogue`, which is the convention for **unused/reserved chemical slots**. No reaction emits it, no emitter writes it, and no food stim maps to it. Reaction 12 therefore **never fires** in the stock C3 genome.

The most plausible interpretation is that this is a **design hook** left by the Cyberlife biochemists: a place for a future toxin, hormone, or environmental signal that would selectively tear down muscle (e.g., a "muscle-wasting disease" chemical, or a stress hormone). Community geneticists who want to add such a mechanism can simply assign a name and a synthesis route to chemical 121, and reaction 12 will spring to life without any further wiring — it is pre-wired, pre-rated, and pre-gated, waiting for a genome author to pull the trigger.

### Practical consequences for gameplay

- **A newborn has meaningful muscle already.** Birth-concentration 12.55 % is well above the 10.2 % alarm threshold, so newborn Norns do not start life with the muscle-wasting signal active. This gives a brand-new creature a genuine strength baseline — it does not need to train before it can use its limbs.
- **Exercise builds strength over hours, not minutes.** Because reaction 5 runs at HL 621 and requires a sustained Anabolic steroid concentration, visible Muscle Tissue gains only appear over extended periods of activity. Keepers who want strong Norns should give their creatures reason to move around (physically large metarooms, climbing toys, scattered food) rather than confine them.
- **Protein-rich food is a prerequisite, not a trigger.** Feeding meat or seed mixes alone will not build muscle — it just fills the Amino Acid pool. The creature must *also* be physically active to consume those Amino Acids via reaction 5.
- **Starvation burns muscle fast.** Once Amino Acid demand outstrips supply, reaction 13 can strip the Muscle Tissue pool from full to alarm-triggering in a few minutes of in-game time. Starving Norns visibly weaken quickly in both visual state and biochemical signalling.
- **CAOS debugging.** `CHEM TARG 11` reads the current Muscle Tissue concentration; `CHEM 11 <amount>` injects directly (useful for testing the muscle-wasting alarm by setting a low value, or for creating "body-builder" Norns with artificial muscle reserves). Injecting Anabolic steroid (`CHEM 112 <amount>`) is the canonical way to simulate a recent workout without having to physically move the creature. Watching reaction 13 in action is easy: set `CHEM 11 128`, let the creature run, and the pool will slowly drain as Amino Acid demand pulls from it.
- **Community catalyst hook.** Adding a synthesis route for chemical 121 is the cleanest way to give a custom genome a novel muscle-wasting mechanism (a disease, a stressor, an environmental toxin). Reaction 12 is already present and will start consuming Muscle Tissue the moment chem 121 has a source.

### Summary of the Muscle Tissue pipeline

```
  LOC_MUSCLES emitter (gene 34, rate 32, gain 6)
       │
       │  muscle activity → Anabolic steroid (112)
       ▼
  Anabolic steroid (HL ~13,341 ticks — persists tens of minutes)
       │
       │ + 4× Amino Acid (13)
       │  reaction 5 (gene 55, HL 621, Medium)
       ▼
  Muscle Tissue (11)    [no decay, one receptor, no emitter]
       │
       │  reaction 13 (gene 44, HL 47, Short)  ← active wasting
       ├─────────────────────────────────────►  4× Amino Acid (13)
       │
       │  reaction 12 (gene 48, HL 116, Medium) ← dormant unless chem 121 is activated
       └─────────────────────────────────────►  4× Amino Acid (13)

       │
       │  receptor 86 (gene 136, threshold 26, REDUCE+DIGITAL)
       ▼
  Creature/Circulatory/locus 8: "wasting muscle" systemic alarm
                     (pairs with locus 0 Adipose "wasting fat" alarm)
```

Muscle Tissue is therefore the **protein-pipeline's long-term reserve**: born with a modest endowment, grown only by the combination of exercise and protein intake, torn down fast when Amino Acid demand spikes, and watched by a single body-wide alarm that fires early enough in a starvation trajectory to give the rest of the genome time to respond. It is the biochemical embodiment of the creature's "physical condition" — the chemical that quietly tracks how much body the Norn has built for itself over the course of its life.
