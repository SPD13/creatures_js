# 116 - Dehydrogenase

Dehydrogenase is an **enzyme chemical** whose sole biological role in the Creatures 3 / Docking Station stock Norn genome is to **detoxify Alcohol**. The chemical table (`Libraries/creatures-chemicals.js:144`) describes it simply as *"Detoxifies alcohol"*, and the genome wires exactly that: a single reaction (gene 81, reaction id 90) consumes two units of Alcohol and one unit of Dehydrogenase and yields one unit of Glucose plus one unit of Pain — the "hangover" side-product. In real biochemistry this mirrors the mammalian alcohol-dehydrogenase / acetaldehyde-dehydrogenase pathway that turns ethanol into usable energy while producing toxic intermediates; the Creatures engine collapses the whole pathway into a single stoichiometric step.

Unlike most enzyme-named chemicals in the game, Dehydrogenase is **genuinely active** — it is not a vestigial reserved slot like Glycolase (115) or Insulin (114). The reaction runs at a "Short" rate (half-life 21 ticks, ≈0.7 s at the 30 Hz world tick), which is fast enough to drain the Alcohol pool very quickly *provided Dehydrogenase is available*. The catch is that **no stock organ emits Dehydrogenase and the creature starts life with zero of it**. Any detoxification therefore depends on external delivery through food, medicine, or scripted agent `CHEM` injections. The chemical is, in effect, a **consumable enzyme pool** — a limited-supply resource the player (or an environmental agent) has to provide, not something the Norn manufactures on its own.

This design makes Dehydrogenase one of the game's few explicit **pharmacological "antidotes"**: the creature has a working detox pathway built into its biochemistry, but only gains access to that pathway when something in the world feeds it the enzyme. It gives modders and food-agent designers a clean hook for medicinal items that "cure drunkenness" without having to touch Alcohol directly.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | *(none — stock genome)* | — | — | Dehydrogenase has **no emitter, no reaction product, and no initial-concentration gene** in the standard Norn genome. Stock concentration at birth and throughout life without external input is **0** | — |
| 2 | Food / medicine agent chemical tables | — | Ingestion | Agents registered as edible with a non-zero Dehydrogenase entry in their PRAY `Chemical 0..3 / Amount 0..3` slots (typical "hangover cure" / "aspirin-style" medicines) deposit chemical 116 into the creature when eaten | One-shot on ingestion; subsequently decays with the chemical's own half-life |
| 3 | External CAOS injection | — | Any | `CHEM 116 <n>` (or `INJR 116 <n>`) on a targeted creature from a script, agent event handler, or the debug console | One-shot; decays over time with half-life 6045 ticks (Long) |
| 4 | Modded / imported genomes | User-added | User-added | A breeder may add an emitter (e.g. on the Reaction or Circulatory organ, keyed to elevated Alcohol) or an initial-concentration gene for chemical 116, giving the creature its own endogenous dehydrogenase supply | Gene-dependent |

Because no stock gene produces Dehydrogenase, a Norn with no exposure to medicinal agents will never have any. Unlike reactive enzymes in a real liver, the game deliberately externalises the supply — the designer's decision is that detoxification is an **intervention**, not a background metabolic function.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Alcohol detoxification | Gene 81 (reaction) | Organ #2 "Reaction" | `2× Alcohol [75] + 1× Dehydrogenase [116] → 1× Glucose [3] + 1× Pain [148]` at rate byte 31, half-life 21 ticks ("Short") | Rapidly clears Alcohol while the enzyme pool lasts; converts the cleared Alcohol into usable Glucose (positive metabolic payoff) but emits a matching dose of Pain (the in-game "hangover" signal) |
| 2 | Passive decay | Gene 64 entry #88 (half-life table) | Bloodstream | `genomeValue: 88`, half-life ≈ 6045 ticks (≈3.4 min at 30 Hz world tick), decay rate `0.99988535` ("Long") | Any residual Dehydrogenase not consumed by reaction decays over minutes rather than persisting indefinitely — an enzyme-realistic lifetime that prevents a single large dose from remaining active for the creature's whole life |
| 3 | No receptors | — | — | Dehydrogenase is **not read by any stock receptor**: no drive, locus, mood, or brain lobe responds to its concentration | The creature has no behavioural awareness of its own enzyme pool — it does not feel "prepared" when Dehydrogenase is high, nor seek more when low |
| 4 | Modded / imported genomes | User-added | User-added | Modders may add receptors on Sensorimotor / Involuntary loci keyed to **low** Dehydrogenase + **high** Alcohol, or add emitters that replenish the pool autonomously | Gene-dependent |

## Role in Game Mechanics

### The single-reaction enzyme

Dehydrogenase is the cleanest example in the Creatures 3 genome of a chemical that exists **solely as the catalyst for one specific reaction**. The reaction is:

```
2× Alcohol [75] + 1× Dehydrogenase [116]  →  1× Glucose [3] + 1× Pain [148]
```

Several things are worth noting about this equation:

1. **The enzyme is consumed, not regenerated.** Unlike a biologically faithful enzyme (which would be regenerated at the end of the catalytic cycle), this reaction *destroys* one unit of Dehydrogenase per two units of Alcohol processed. This turns the "enzyme" into a **consumable reagent** — a fuel, not a catalyst. Game-wise it means the dose limits the detoxification: give the Norn 100 Dehydrogenase and it can neutralise at most 200 Alcohol, after which Alcohol accumulates again until natural half-life decay (chemical 75, `genomeValue: 68`) drains it over much longer timescales.
2. **The reaction is profitable energetically.** The two Alcohol units produce one Glucose, which feeds directly into gene 34's glycolysis step (`Glucose + 2× ADP → 2× Pyruvate + 2× ATP`) to make usable ATP. So detoxification is not purely removal — a sufficiently alcohol-rich Norn that has been given Dehydrogenase effectively burns the ethanol as food.
3. **The Pain product is the "hangover".** Each detox cycle deposits Pain into the creature. Pain drives the Pain receptor at gene 89 of the Sensorimotor faculty and feeds into the brain's negative-reinforcement signals, motivating the Norn to avoid whatever behaviour preceded the alcohol spike. Mechanically this is the game modelling *"drinking makes you sick afterwards"* — the Norn associates the food or agent that delivered Alcohol with the Pain that followed detoxification.
4. **The rate is fast.** With a half-life of 21 ticks, roughly 3.3% of the available reactant mix is converted per tick. Whenever Alcohol and Dehydrogenase are both present, the reaction fires every tick until one runs out.

### Why the stock genome omits an emitter

Every other *active* enzyme-style chemical in the Norn biochemistry is paired with an emitter somewhere in the body: the Pancreas (organ #3) emits Insulin-like signals in response to Glucose, the Sex organ emits hormones in response to gonadal loci, and so on. Dehydrogenase is unique among *used* enzymes in having **no endogenous source**. This is a deliberate design decision, and the evidence is in gene 81's structure: the reaction is switched on at Baby (age 0), runs on the generic Organ #2 (Reaction), and has full-speed coefficients — the authors wanted the biochemistry ready-and-waiting from birth, while leaving the **supply of the enzyme itself to the player**.

The player-facing consequence is that medicinal agents (hangover cures, detox berries, alcohol-counteract serums) become genuine gameplay items with a measurable in-body effect. When the player feeds a "cure" to a drunk Norn:

- The food agent's `Chemical 0..3` table injects chemical 116 (Dehydrogenase) into the Norn's bloodstream.
- The reaction fires on the next tick, consuming the Dehydrogenase against whatever Alcohol is present.
- Alcohol crashes toward zero; Glucose ticks up; a dose of Pain is delivered (the "cure hurts a little").
- Within a few in-game seconds the Norn's gait recovers (the Alcohol receptor at `LOC_GAIT7`, threshold 16, drops below threshold and the drunk-walk gait disengages).

If the genome *did* include an emitter, the Norn would sober up on its own without intervention, and the medicinal agents would be cosmetic. By keeping Dehydrogenase externally-sourced, the designers make the *treatment* the interesting gameplay loop.

### The Alcohol → Gait coupling

The practical reason Dehydrogenase matters for gameplay is the receptor that reads Alcohol:

```
Organ: Creature
Tissue: Sensorimotor
Locus: 15  (LOC_GAIT7)
Chemical: 75 (Alcohol)
Threshold: 16, Gain: ...
```

At Alcohol ≥ threshold 16, the Sensorimotor gait-7 locus flips on, which selects the "drunk walk" gait animation. The Norn visibly staggers. The only way to bring this locus back below threshold quickly is to either (a) wait for Alcohol's own half-life (chemical 75 has `genomeValue: 68` → hundreds of ticks, visibly slow) or (b) fire the detox reaction by supplying Dehydrogenase. In practice option (b) is the only responsive way for a caretaker to help a drunk Norn — option (a) means the Norn may stumble through a whole feeding cycle before sobering up.

So Dehydrogenase is the **antidote chemical** in the most literal sense: the game has a stop-and-stagger behaviour with an elevated threshold, and hands the player a single specific chemical lever to clear it.

### Enzyme half-life and dosing

The chemical half-life is **6045 ticks (≈3.4 minutes of real time at the 30 Hz world tick)**, classified as "Long" in the decay-speed table. This is an order of magnitude shorter than the "Very long" half-life used for inert reserved chemicals (like Glycolase, which has `genomeValue: 255` and half-life ~10¹⁰ ticks), and it is **chosen to be similar to the Alcohol half-life**. The practical consequence is:

- A dose of Dehydrogenase given when there is *no* Alcohol present gradually decays and disappears. There is no way to "pre-dose" the Norn for the next drinking session half an hour from now — the enzyme will be largely gone by then.
- A dose given with Alcohol already in the bloodstream is consumed almost entirely by the reaction (rate half-life 21 ticks ≪ decay half-life 6045 ticks), so enzyme decay is a negligible loss during active detoxification.
- Repeated small doses work as well as one large dose: the reaction is stoichiometric, not rate-limited by enzyme saturation, so there is no pharmacokinetic penalty for feeding multiple cure items in succession.

A breeder who wants a Norn with "natural tolerance" can add an emitter that trickles Dehydrogenase into the bloodstream at a low steady rate; the "Long" half-life then acts as a smoothing reservoir, absorbing small Alcohol spikes before they ever trip the gait receptor. This is a common modification in experimental drinking-Norn genomes.

### Relationship to other detox pathways

Dehydrogenase is part of a small family of **toxin-clearing reactions** in the stock genome, each with a different enzyme or antidote chemical:

| Toxin chemical | Antidote / clearing reaction | Notes |
|----------------|------------------------------|-------|
| 75 Alcohol | `2× Alcohol + 1× Dehydrogenase → 1× Glucose + 1× Pain` (gene 81) | Exogenous enzyme; the canonical "hangover cure" pathway |
| 66 Heavy Metals | `1× Heavy Metals + 1× EDTA [95] → (nothing)` (gene 82) | Exogenous chelator; analogous design — neither chemical is emitted endogenously |
| Generic Antigens | Antibody-antigen reactions (genes 83+) | Endogenous — the creature's immune system produces the antibodies |
| Histamine-A/B | `Histamine + Antihistamine → (nothing)` | Exogenous antihistamine; same pattern as alcohol/EDTA |

The architectural pattern is clear: the Creatures biochemistry distinguishes between **toxins the body can clear on its own** (via endogenous antibodies, steroid-driven immune loci, etc.) and **toxins the player must treat** (via EDTA, Dehydrogenase, Antihistamine). Dehydrogenase falls firmly into the "needs external treatment" bucket, alongside EDTA and Antihistamine, and its `Exogenous-only` supply is the design signal of that choice.

### What happens if a Norn never gets Dehydrogenase

A Norn that is never fed a Dehydrogenase-bearing agent but does ingest alcoholic food (fermented fruit, alcohol-spiked berries, or a modded drinking agent) will experience the following:

1. **Alcohol accumulates** with each ingestion, since no reaction fires (the enzyme reactant is at 0).
2. **The drunk-gait locus trips** as soon as Alcohol crosses 16/255, and stays tripped until Alcohol decays naturally.
3. **No Glucose payoff and no Pain side-product.** Because the reaction never runs, the Alcohol is neither productively metabolised nor punitively associated with after-effects. The Norn simply stumbles until the ethanol decays.
4. **Alcohol decays over the "Long" half-life** (chemical 75, `genomeValue: 68`, ≈hundreds of ticks). The Norn will sober up eventually — this is the safety net that prevents permanent intoxication — but the recovery takes visibly longer than a dose of Dehydrogenase would achieve.

In gameplay terms: without intervention, Alcohol is a **slow-recovery handicap**; with Dehydrogenase, it is a **rapid-recovery trade** (Alcohol gone, Glucose gained, Pain paid).

### How modders can wire Dehydrogenase differently

Several common modifications are seen in community genomes and agents:

1. **Endogenous production via the liver-like organ.** Add an emitter on Organ #2 (Reaction) with a positive threshold on Alcohol, so that the creature begins manufacturing its own Dehydrogenase whenever Alcohol rises. Combined with a shorter enzyme half-life, this yields a self-healing drinker who no longer needs medicinal intervention.
2. **Enzyme-as-catalyst.** Rewrite gene 81 so that Dehydrogenase is regenerated at the end of the cycle (`2× Alcohol + 1× Dehydrogenase → 1× Glucose + 1× Pain + 1× Dehydrogenase`). A one-time dose then lasts until chemical half-life decays it. This is the biologically faithful version and turns Dehydrogenase from a consumable into a true catalyst.
3. **Removing the Pain by-product.** Change the reaction to `2× Alcohol + 1× Dehydrogenase → 1× Glucose` (no Pain) for a "clean detox" creature that does not hate alcohol after drinking. Useful for creatures intended to enjoy fermented food as a cultural or dietary theme.
4. **Tolerance breeding.** Add a receptor on Organ #2 that reads Dehydrogenase concentration and boosts the reaction Rate when the enzyme is plentiful. This models induction of hepatic enzymes in heavy drinkers — the more Dehydrogenase the Norn has been exposed to, the faster it detoxifies.
5. **A consumable "enzyme pill" agent.** Define a consumable with a large `CHEM 116` payload; this becomes the genome-compatible "anti-drunk pill". The reaction will run as soon as Alcohol appears, making the pill a pre-emptive treatment.

Each of these mods is a minor edit (one gene or one agent script) because the hard work — the stoichiometry, the rate, the half-life, the chemical table name — is already in place. This is the advantage of having the enzyme active-but-externally-sourced: the machinery is ready, and any external supplier (agent, organ, or player) can plug into it.

### Practical consequences for gameplay

- **Stock Norns accumulate Alcohol but cannot detox it without intervention.** A drunk Norn left alone will recover slowly via Alcohol's own half-life; recovery is much faster if fed a Dehydrogenase-bearing agent.
- **Medicinal agents that list chemical 116 in their chemical table are genuine antidotes**, not flavour text. They measurably clear Alcohol and shorten the drunk-gait episode. A consumable agent without Dehydrogenase that claims to "sober up" a Norn is either targeting Alcohol directly (`CHEM 75 -n`, which does work) or is a no-op.
- **Dehydrogenase cannot be stockpiled long-term.** The "Long" half-life means pre-dosing hours ahead of exposure does not work. Administer at or shortly before the alcohol event.
- **Every detox cycle delivers Pain.** A player who repeatedly force-feeds alcoholic items and then cures them with Dehydrogenase is training a strong negative association with whatever the delivery vehicle was — useful for behavioural conditioning experiments, but ethically questionable in normal play.
- **The reaction is invisible in the chemistry UI** until both reactants are present. Dehydrogenase alone sits as a harmless value on the chemical list; Alcohol alone trips the gait and nothing else; only the combination produces the Glucose-up / Pain-up / Alcohol-down signature that flags the detox step.

### Summary

```
  External supply only:                       Stock reaction (gene 81):
  (food agents / medicines /                  Organ #2 "Reaction"
   CAOS CHEM 116 / modded emitter)            2× Alcohol + 1× Dehydrogenase
                │                                    │         (half-life 21 ticks, "Short")
                ▼                                    ▼
  Dehydrogenase [116] ───────────────▶  1× Glucose  +  1× Pain
      • half-life 6045 ticks ("Long")           ▲              ▲
      • initial 0 / 256                         │              │
      • no emitter, no receptor              feeds          drives
      • no initial concentration            glycolysis     aversion
                                            (gene 34)      learning

  No Dehydrogenase supply → Alcohol persists at its own
  long half-life; gait-7 locus stays tripped; no Glucose
  reward; no Pain punishment. Reaction requires external
  enzyme to fire.
```

Dehydrogenase thus occupies a distinctive niche in the stock biochemistry: **an active, fast, useful enzyme whose entire supply chain lives outside the creature**. The Norn is born with the catalytic machinery ready and waiting, but no way to run it on its own — the enzyme comes from the environment, through food or agent intervention. This makes the chemical a natural hook for medicinal items, a training lever for aversion learning, and a clear gameplay signal that some physiological functions in Creatures are **caretaker-assisted** rather than autonomous. Of the ~130 actually-wired chemicals in the Norn genome, only a small handful (Dehydrogenase, EDTA, Antihistamine) follow this "player-supplied antidote" pattern, and together they form the game's explicit pharmacological toolkit.
