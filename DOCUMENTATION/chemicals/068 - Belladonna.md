# 068 - Belladonna

Belladonna is chemical slot 68 in the Creatures 3 chemistry. The in-game chemical library describes it laconically as the **"Weapon of the Deadly Nightshade"** and the *Materia Medica* catalogue lists it in the canonical toxin block alongside Heavy Metals (chem 66), Cyanide (chem 67) and Geddonase (chem 69). The flavour reference is to *Atropa belladonna*, the real-world plant whose tropane alkaloids (atropine, scopolamine) paralyse smooth muscle and slow organ function — and the genome's chemistry models exactly that pharmacology: Belladonna does **not** damage organs the way Heavy Metals do, and it does **not** burn Energy the way Cyanide does. Instead, it attacks the *speed* of the body's machinery. Its receptors throttle the **clock rate of somatic organs** and **inhibit a somatic metabolic reaction**, so a poisoned creature's internal biochemistry keeps running on all the correct pathways but at a drastically reduced tempo — the chemical signature of sluggishness, lethargy and metabolic paralysis.

The standard genome wires **no internal producer** of Belladonna (no emitter, no synthesising reaction) and **no internal clearance reaction**. The only way the chemical ever disappears from a creature's bloodstream is passive decay on its long-but-finite half-life of **3,024 ticks (~100 s of real play time at 30 tps, decay rate 0.99977 — "Long")**. Unlike Cyanide, Belladonna has **no specific antidote potion** in the stock Materia Medica (the *Cyanide Cure*, *Heavy Metal Cure*, *ATP Decoupler Cure* and *Antioxidant Syrup* all target other toxins) and Belladonna is **not among the toxins listed in the General Cure**. The only stock-game recourse for a Belladonna-poisoned creature is to wait out the decay while keeping it fed and rested — or to inject a custom clearance reaction from a third-party agent. The Medical Pod computer (`medical pod and screens.cos`) nevertheless reads Belladonna as one of the canonical detectable toxins and will display its name to the player, giving the chemical a clear diagnostic presence even though no cure potion is shipped for it.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No internal pathway** — no emitter and no producing reaction in the standard genome | — | — | A healthy creature is born with Belladonna = 0 and remains at 0 unless something external injects the chemical. Belladonna shares this property with Heavy Metals, Cyanide and Geddonase — all four of the classic "environmental toxins" have no endogenous source |
| 2 | **Deadly-Nightshade-themed toxic agents** (poisoned foods, stings, nightshade plants) | User-made `.agents` / `.cob` files | Custom scripts that `CHEM TARG 68 <amount>` on bite / touch events | The chemical's literary name (*"Weapon of the Deadly Nightshade"*) strongly implies that Cyberlife intended it as the payload for community nightshade / poisonous-plant agents; the stock Creatures 3 install does not ship any agent that delivers chem 68, but third-party packs commonly use it for "sleepy"/"paralytic" poisoning effects that deliberately contrast with Cyanide's fast-kill profile |
| 3 | **CAOS injection** | — | `CHEM TARG 68 <amount>` from scripts or the debug console | The primary route used during testing and by agent authors. Because the half-life is long but finite, injected doses fade on their own over a few minutes even without treatment |

Belladonna therefore joins Heavy Metals, Cyanide and Geddonase as a **chemical with no endogenous production in the standard genome** — every milligram of chemical 68 in a creature's bloodstream came from an external source.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Somatic reaction inhibitor receptor** | 90 | Reaction / Somatic | Locus 0 (reaction-rate modifier) | 16 | 246 | 191 | **REDUCE (invert)** | A receptor wired to a somatic biochemical reaction's rate. Nominal 246 (out of 255) means the reaction runs almost at full speed when Belladonna is absent; as the chemical rises past the threshold of 16/255 (~6 %), the inverted output falls sharply and shuts the reaction down. With gain 191 the suppression is strong but not total, so at saturation (~255) the reaction is throttled to a small residual rate rather than to exactly zero. This is the Belladonna equivalent of Cyanide's gene-164 receptor but wired to a **different** somatic reaction and with a non-zero threshold (so trace amounts of Belladonna are tolerated) |
| 2 | **Organ clock-rate suppressor receptor A** | 91 | Organ / Somatic | `RLOCUS_CLOCKRATE` (Locus 0) | 0 | 128 | 255 | **REDUCE (invert)** | The defining "slowing" action of Belladonna. `RLOCUS_CLOCKRATE` directly sets the number of updates a somatic organ performs per tick (see CAOS `ORGF <n> 0`, documented as *"Clock rate in updates per tick (as locus)"*). With nominal 128, threshold 0 and maximum gain 255, **any** Belladonna present immediately drives the organ's clock rate from its default ~128/255 toward zero. Saturated Belladonna (~255) reduces the clock rate by the full gain (255), effectively halting the organ's metabolic ticks — the biochemical equivalent of putting the organ to sleep |
| 3 | **Organ clock-rate suppressor receptor B** | 48 | Organ / Somatic | `RLOCUS_CLOCKRATE` (Locus 0) | 29 | 120 | 255 | **REDUCE (invert)** | A second clock-rate receptor, wired to a **different** somatic organ (`RLOCUS_CLOCKRATE` is an organ-level locus, so two independent receptor genes produce two independent affected organs). Threshold 29 means this organ tolerates small traces of Belladonna before slowing, but once above ~11 % the full gain of 255 drives its clock rate rapidly toward zero. The pairing of receptors 2 and 3 gives Belladonna a **two-organ** slowing profile — enough to broadly suppress somatic metabolism, not so broad that every organ is hit |
| 4 | **Passive decay** | — | — | Half-life **3,024 ticks** ("Long", decay rate 0.99977) | — | — | — | The only clearance pathway in the standard genome. A creature that escapes the Belladonna source without treatment loses half of its chemical load every ~100 seconds of real play time. Unlike Cyanide, there is no antidote reaction to accelerate this, so the creature must simply wait the chemical out |
| 5 | **No stock antidote reaction** | — | — | — | — | — | — | — | Where Cyanide has the Sodium-thiosulphite reaction (reaction 86) and Heavy Metals has the EDTA reaction (reaction 91), Belladonna has *no* clearance reaction at all in the standard genome. This is a deliberate asymmetry: the Materia Medica ships no Belladonna Cure potion, and the General Cure list (Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin) **does not include Belladonna** |

The usage table shows the design pattern of a **"metabolic sedative"**: no internal production, no stock antidote, a long-but-finite half-life, receptors that slow down the body's machinery rather than damaging it, and a survival strategy built around *waiting it out* rather than *curing it*.

## Role in Game Mechanics

### Clock-rate suppression: how the `RLOCUS_CLOCKRATE` receptors actually work

`RLOCUS_CLOCKRATE` is the **Organ**-level locus at index 0 documented as *"Clock rate in updates per tick (as locus)"* and exposed to scripts via `ORGF <n> 0`. Each somatic organ carries a personal clock rate that controls how many internal update cycles it performs per world tick — high clock rates let the organ run many reactions per tick (fast metabolism) and low rates slow it to a crawl. When a receptor writes into this locus with `REDUCE` flags, the organ's clock rate is driven **below** its nominal value in proportion to the chemical concentration.

With receptor gene 91 (nominal 128, gain 255, threshold 0) the arithmetic for the first affected organ is approximately:

```
 clock_rate = max(0, 128 − (Belladonna × 255 / 255))
            = max(0, 128 − Belladonna)
```

At Belladonna = 128 the organ runs at zero internal updates per tick — its entire metabolism freezes. At Belladonna = 64 it runs at half its normal rate. At Belladonna = 255 it has been driven well below zero and is clamped at zero. Because the gain is 255 (the maximum possible for an 8-bit locus) and the threshold is 0, there is no "safe dose" for this organ: even a small Belladonna concentration produces an immediately measurable slowdown.

Receptor gene 48 has a slightly gentler profile for its target organ (nominal 120, threshold 29, gain 255): that organ tolerates a small residue of Belladonna before any effect appears, but once the chemical exceeds ~11 % it begins losing clock rate just as quickly. The two receptors combined mean that a poisoned creature has two independent somatic organs slowed to near-stasis, while any organ not wired to these receptors continues to run normally.

This is the in-chemistry realisation of the classical "belladonna paralysis": the body is not destroyed and its biochemistry is not rewritten, it is simply **slowed down**.

### The somatic reaction inhibitor (receptor 57)

Receptor 57 (gene 90) targets `Reaction / Somatic / Locus 0` — the locus that modulates the rate of a specific somatic biochemical reaction — with `REDUCE (invert)` flags, nominal 246 and gain 191. The arithmetic at this receptor is:

```
 rate_modulator ≈ max(0, 246 − ((Belladonna − 16) × 191 / 255))
```

Below Belladonna = 16 the receptor output sits at its nominal 246/255, so the affected reaction runs at nearly full speed. Once Belladonna crosses the 16/255 threshold the inverted output falls away quickly and the reaction throttles down; at Belladonna = 255 the output is approximately `246 − 191 = 55/255`, so the reaction is running at roughly a fifth of its normal rate rather than being halted completely. The threshold gives the body a small tolerance band (trace Belladonna from a half-decayed old dose does not affect the reaction at all), but once the chemical is present in meaningful amounts the reaction is throttled for as long as the chemical persists.

In combination with the two clock-rate receptors, this gives Belladonna a **three-pronged slowing action**: two organs have their overall update rate reduced, and a specific somatic reaction (which may run in a different organ) is separately throttled. The net effect is a creature whose metabolism is functioning correctly but running significantly below normal speed — the in-chemistry expression of drowsiness and lethargy.

### Why there is no antidote

The absence of a Belladonna antidote in the stock genome is a design choice, not an omission. The other three classical toxins each ship with a specific cure reaction:

| Toxin | Specific antidote reaction | Half-life of reaction |
|-------|----------------------------|-----------------------|
| Heavy Metals (66) | `+ EDTA → nothing` (reaction 91) | ~24 ticks (Short) |
| Cyanide (67) | `+ Sodium thiosulphite → nothing` (reaction 86) | ~4 ticks (Very short) |
| **Belladonna (68)** | **none** | — |
| Geddonase (69) | passive decay only | — |

Belladonna and Geddonase both rely on passive decay for clearance, distinguishing them sharply from the "cureable" toxins. Belladonna's passive half-life of 3,024 ticks (~100 s) is short enough that a creature that escapes the poison source will recover within a few minutes of real play time, and the *mode of action* (slowing rather than damaging) means that the creature's life is unlikely to be in immediate danger during that recovery — its heart will beat more slowly and it will eat and move less, but it will not be burning through its Energy pool the way a Cyanide-poisoned creature would. The lack of an antidote therefore makes Belladonna a **"wait-it-out"** toxin rather than an emergency-response toxin, and the Materia Medica's decision not to include a Belladonna Cure potion reflects that balance.

The **General Cure** potion's toxin list is explicit about this (*"The toxins it can cure are: Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"*) — six toxins, none of them Belladonna. Players who want to treat a Belladonna poisoning must either write their own clearance reaction into a custom genome, inject a negative dose of chem 68 via CAOS, or simply keep the creature fed and comfortable while the passive decay runs.

### Detection on the Medical Pod

The stock game's **Medical Pod** screens (`Assets/C3_Bootstrap_V2/medical pod and screens.cos:123` and `:406`) include Belladonna in the canonical list of detectable toxins, storing the name of the highest-concentration toxin in the creature's bloodstream into the object variable `ov71` (*"Name of Toxin Detected (Belladonna..etc)"*). This means a player who places a Belladonna-poisoned creature on a medical pod will see the chemical named on the pod's readout, alongside a numeric level — the same diagnostic treatment given to Cyanide, Heavy Metals, Histamine and the other named toxins.

The diagnostic presence without a corresponding cure potion is deliberate: the player can see *what* is wrong with the creature and act accordingly (move it away from the poison source, feed it, let it sleep), but cannot simply reach for a bottle. This gives Belladonna a distinctive gameplay texture among the detectable toxins — a chemical whose recognition matters more for prevention and management than for treatment.

### Dose-response and narrative role

Because Belladonna's mode of action is slowing rather than damaging, the relationship between dose and outcome is fundamentally different from the other stock toxins:

| Belladonna dose (0–255) | Expected outcome without intervention |
|--------------------------|----------------------------------------|
| Tiny (< 16) | Below receptor-57 threshold; only the organ clock-rate receptors are active, so affected organs run slightly slower. Creature appears mildly sluggish, recovers in ~30–60 s |
| Small (16 – 64) | All three receptors active. Two somatic organs operating at ~50–75 % of normal clock rate; one somatic reaction throttled. Creature visibly slow and low-appetite for ~2–3 minutes |
| Moderate (64 – 128) | Significant metabolic slowdown. Affected organs near zero clock rate; creature drowsy, eating little, moving rarely. Recovery over ~4–8 minutes as chemical decays |
| Large (> 128) | Receptor-2 organ entirely halted; receptor-3 organ effectively halted. Creature near-immobile and almost metabolically static. Survival depends on whether any of the halted organs are essential to immediate life — typically yes for extended periods, but a large dose still takes ~10 minutes to decay to a safe level |

Crucially, Belladonna does **not** inflict `RLOCUS_INJURY` damage on any organ — there is no permanent residue once the chemical is cleared. A creature that survives a Belladonna poisoning recovers to full metabolic function with no lingering organ damage, unlike Heavy Metals (which permanently scars its three targeted organs) or a severe Cyanide poisoning (which may starve its tissues of Energy to the point of death).

The narrative role in Albia is therefore that of the **"sleeping poison"** or **"paralysing toxin"**: a chemical signature appropriate for enemy plants, stinging insects, third-party "sleepytrap" agents and community nightshade-themed food items. It complements Cyanide's fast-kill role and Heavy Metals' slow-damage role by occupying the *slow-and-survivable* niche — a chemical that makes the creature temporarily helpless but does not threaten to kill it outright and that needs no intervention beyond time.

### Interaction with the other "Long"-decay toxins

Belladonna, Cyanide and Geddonase share the same exact decay profile (half-life 3,024 ticks, decay rate 0.99977, "Long"), which is not a coincidence — chem slots 67, 68 and 69 were evidently designed as a **toxin-triad** with shared clearance timing and deliberately different modes of action:

- Cyanide (67): acute energy destruction, **specific antidote** (sodium thiosulphite)
- **Belladonna (68): metabolic slowing, no antidote, wait-it-out**
- Geddonase (69): [see 069 documentation when written]

The shared 100-second passive half-life means that any untreated dose of any of these three toxins clears on roughly the same timescale, giving the chemistry a consistent "fast toxins decay in a couple of minutes" rule that players can rely on. The three different mechanisms of action give each chemical a distinctive clinical picture — energy starvation, drowsiness, and the Geddonase-specific pattern — so that a player who has learnt to read the Medical Pod readouts can tell them apart at a glance.

## Summary

```
 Chemical 68 — Belladonna  ("Weapon of the Deadly Nightshade")
 -----------------------------------------------------------------
 Producers:   NONE internally — external only (community agents, CAOS injection)
 Consumers:   NONE — no antidote reaction in the standard genome

 Receptors (3):
   - Reaction organ / Locus 0, REDUCE  (gene 90, thr 16, nom 246, gain 191)
       → inhibits a somatic metabolic reaction whenever Belladonna is present
   - Organ / RLOCUS_CLOCKRATE, REDUCE  (gene 91, thr 0,  nom 128, gain 255)
       → drives somatic organ A's update rate toward zero
   - Organ / RLOCUS_CLOCKRATE, REDUCE  (gene 48, thr 29, nom 120, gain 255)
       → drives somatic organ B's update rate toward zero

 Half-life:   3,024 ticks (~100 s at 30 tps, decay rate 0.99977 — "Long")
 Antidote:    NONE — no specific cure potion; not covered by General Cure either
 Detection:   Named on the Medical Pod readout (ov71) alongside Cyanide etc.

 Narrative role: The game's "sleeping poison". A metabolic sedative rather than
                 a destroyer — slows two somatic organs and throttles a somatic
                 reaction, producing drowsiness, low appetite and sluggish
                 movement without inflicting lasting damage. Inflicts no
                 RLOCUS_INJURY, so recovery is clean once the 100-second
                 passive half-life clears the chemical naturally.
```

Belladonna rounds out the classical toxin triad in Creatures 3 with a deliberately distinctive mode of action: where Cyanide burns the body's fuel and Heavy Metals scar its organs, Belladonna simply **slows the machinery down**. This makes it the toxin of choice for community agents that want a "sleepy trap" or "paralysing sting" effect, and it gives Albia a biologically plausible equivalent to the real-world Deadly Nightshade — a chemical that signals its presence clearly on the diagnostic Medical Pod, yet has no cure potion, and relies on the creature's own resilience and the passage of time for recovery.

## Key Source References

- `ChemicalNames.catalogue:118` — slot 68 named "Belladonna"
- `Rebuild/Libraries/creatures-chemicals.js:86` — chemical descriptor *"Weapon of the Deadly Nightshade"*
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:118` — player-visible "Belladonna" name
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:329` — Belladonna listed in the canonical toxin block
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:131-132` — General Cure description *does not* include Belladonna in its toxin list
- `Rebuild/Assets/C3_Bootstrap_V2/medical pod and screens.cos:123` and `:406` — Medical Pod readout enumerates Belladonna among the detectable toxins (*"Name of Toxin Detected (Belladonna..etc)"*)
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - `:4415-4433` — receptor 57 (gene 90): Reaction / Somatic / Locus 0, REDUCE (invert), Belladonna threshold 16, nominal 246, gain 191
  - `:4624-4642` — receptor 68 (gene 91): Organ / Somatic / `RLOCUS_CLOCKRATE` (Locus 0), REDUCE (invert), Belladonna threshold 0, nominal 128, gain 255
  - `:5878-5896` — receptor 134 (gene 48): Organ / Somatic / `RLOCUS_CLOCKRATE` (Locus 0), REDUCE (invert), Belladonna threshold 29, nominal 120, gain 255
  - `:8216-8223` — half-life entry: 3,024 ticks, decay rate 0.99977, "Long"
- CAOS command table — `ORGF <n> 0` documentation identifying organ Locus 0 as *"Clock rate in updates per tick (as locus)"*
- Creature command handler — implementation call `organ->LocusClockRate()` confirming the locus semantics
