# 094 - Prostaglandin

Prostaglandin is chemical slot 94 in the Creatures 3 biochemistry. The stock chemical-library descriptor at `Rebuild/Libraries/creatures-chemicals.js:118` reads "*Fat Soluble vitamin, deficiency can cause infertility*" — this is a **C1/C2 fossil description that does not match the Creatures 3 wiring** (the "fat-soluble vitamin" slot in C3 is Vitamin E at 98, and fertility in C3 is driven by the sex-hormone axis Oestrogen/Progesterone/Testosterone 46/48/53, not by slot 94). In the stock C3 genome, Prostaglandin is the **organ-repair rate-limiter**: it is the chemical that every organ's Somatic `RLOCUS_RATEOFREPAIR` receptor reads to decide how fast its damaged short-term life-force regenerates toward the long-term baseline. Without Prostaglandin in the bloodstream, the body still *accumulates* damage (long-term life-force still drifts down) but *repairs* essentially nothing — Prostaglandin is what turns "injured" organs back into "healthy" organs over time.

Prostaglandin is produced **endogenously** by Reaction 101 (gene 68) `1× Amino Acid [13] + 1× Fatty Acid [6] → 2× Prostaglandin [94]` (half-life 21 ticks, "Short"). A well-fed creature with spare amino-acids and fatty-acids in circulation continuously synthesises Prostaglandin from its digestive pools; a starving creature, or one whose protein/fat chemistry has been depleted, cannot make it. The same two building-blocks are recovered when Prostaglandin decays via Reaction 100 (gene 99) `2× Prostaglandin → 1× Amino Acid + 1× Fatty Acid` (half-life 18 ticks, "Short"), so the chemistry is a near-reversible 2 : 1 : 1 equilibrium between the Prostaglandin pool and the AA/FA pool. Passive (non-reactive) decay adds a further drain at half-life 418 ticks (~14 s, "Medium"), giving the chemical a short-to-medium residence time overall. On top of this steady-state chemistry, Reaction 76 (gene 98) `1× Stress [128] + 1× Prostaglandin [94] → 1× Stress [128] + 1× Fatty Acid [6]` (half-life 16 ticks, "Short") models **stress-induced suppression of healing**: Stress acts as a catalyst (unchanged on each pass) that degrades Prostaglandin into a Fatty Acid, so a chronically stressed creature loses its repair capacity proportional to its stress level even while continuing to produce AA/FA.

Prostaglandin is also **externally administrable** as a healing-boost. The Medicine Maker delivers 0.15 units in the "General Cure" potion (`scrp 2 25 19 12`) and 0.15 units in the "Vitamin Potion" (`scrp 2 25 20 12`, bundled with Vitamin E 0.35, Vitamin C 0.35, and Glucose 0.05), and the Anti-bacterial Spray agent (`anti-bacterial spray.cos`) sprays 0.2 units onto every creature it hits (ETCH 4 0 0 — all creatures in range). The *Materia Medica* labels the Vitamin Potion as enriching "*the health of a Creature, helping it maintain strength and vitality*" and the *panatreea.catalogue* plant text calls it "*lots of Vitamin C and Prostaglandin to give immune systems a boost in times of need*" — player-facing language that frames Prostaglandin as a general "health tonic", consistent with its mechanical role as the healing rate.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **Endogenous synthesis** from digestive pools | Gene 68 — Reaction 101 | `1× Amino Acid [13] + 1× Fatty Acid [6] → 2× Prostaglandin [94]`, rate 31, half-life 21 ticks ("Short", ~0.7 s at 30 tps) | The body's own Prostaglandin factory. Each "unit" of AA+FA yields 2 units of Prostaglandin, so the body mass-converts protein/lipid into healing chemistry at a 2 : 1 molar ratio. A well-fed creature with active digestion (carbohydrate ≥ protein ≥ fat turnover) keeps the Prostaglandin pool continuously topped up; a creature whose Amino Acid or Fatty Acid reserves are drained by hunger, low protein/fat intake, or active starvation, loses its repair capacity because this reaction starves of substrate |
| 2 | **Vitamin Potion** (`2 25 20`) | Medicine Maker potion — `scrp 2 25 20 12` (`medicine maker.cos:660–672`) | `chem 94 .15` (0.15 units per bottle), bundled with `chem 98 .35` Vitamin E, `chem 99 .35` Vitamin C, `chem 3 .05` Glucose | The player-visible *Materia Medica* description calls this potion a vitality booster: "*Keep your Creatures happy and healthy with this Vitamin Potion. It contains Vitamins C & D which enrich the health of a Creature, helping it maintain strength and vitality*" (`Materia Medica.catalogue:134–136`). The 0.15-unit Prostaglandin kick gives every organ a short repair-rate boost on top of the Vitamin E / C / Glucose bundle. *Note*: the player text mentions "Vitamins C & D" but the actual potion script delivers Vitamin E (98) and Vitamin C (99); no Vitamin D exists as a separate slot |
| 3 | **General Cure** (`2 25 19`) | Medicine Maker potion — `scrp 2 25 19 12` (`medicine maker.cos:642–658`) | `chem 94 .15` (0.15 units per bottle), alongside 0.15 units each of Antihistamine (100), Arnica (97), EDTA (95), Medicine one (92), Anti-oxidant (93), Sodium thiosulphate (96), plus 0.45 Adrenalin (117) | Included in the broad-spectrum cure at the same 0.15-unit "token" level as the other cure chemicals. The Prostaglandin component does not directly cure a specific toxin — it accelerates organ recovery from any damage the toxins have already caused, complementing the cure chemicals that neutralise the toxins themselves |
| 4 | **Anti-bacterial Spray** (area-of-effect) | `anti-bacterial spray.cos:42, 86` — `scrp 3 8 19 1` (direct activation) and `scrp 3 8 19 2001` (messaged activation) | `etch 4 0 0 … chem 94 .2 … next` — enumerates all type-4 (creature) agents in range and injects 0.2 units of Prostaglandin into each | The spray is the most potent single Prostaglandin vector in the stock world: 0.2 units per creature is ~33% larger than a Vitamin Potion dose, applied to *every* creature caught in the blast. Also raises the `stim writ from 90 1` (pleasure) signal. Functions as a "field first-aid" — rapidly boosts every affected creature's organ repair rate for the ~14 s half-life window |
| 5 | **CAOS injection** | — | `CHEM TARG 94 <amount>` from console, custom agents, or debug scripts | The standard way to introduce Prostaglandin for testing, or the expected extension point for custom healing agents (herbal plants, medical-room effects, injury-recovery potions, etc.) that want to deliver repair acceleration through non-potion vectors |

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Per-organ repair rate — Receptor 21 (organ of gene 81)** | 81 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` (chem 94) | 0 | 0 | 191 | none | Gene-81 organ's short-term healing coefficient: `loc_LongTermRateOfRepair = (gain/255) × chem94 = 0.749 × chem94`. At 0 Prostaglandin → 0 repair. At saturation (chem94=1.0) → 0.749 per-tick fraction of the (long − short) gap repaired |
| 2 | **Per-organ repair rate — Receptor 30 (organ of gene 111)** | 111 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 171 | none | Gain 0.671. Same dynamic: Prostaglandin concentration sets the repair fraction applied each tick to the short-term life-force gap |
| 3 | **Per-organ repair rate — Receptor 40 (organ of gene 146)** | 146 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 171 | none | Gain 0.671 |
| 4 | **Per-organ repair rate — Receptor 50 (organ of gene 169)** | 169 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 193 | none | Gain 0.757 — one of the highest-gain organs (faster-healing tissue) |
| 5 | **Per-organ repair rate — Receptor 63 (organ of gene 171)** | 171 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 170 | none | Gain 0.667 |
| 6 | **Per-organ repair rate — Receptor 66 (organ of gene 172)** | 172 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 175 | none | Gain 0.686 |
| 7 | **Per-organ repair rate — Receptor 80 (organ of gene 174)** | 174 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 155 | none | Gain 0.608 |
| 8 | **Per-organ repair rate — Receptor 89 (organ of gene 176)** | 176 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 159 | none | Gain 0.624 |
| 9 | **Per-organ repair rate — Receptor 94 (organ of gene 178)** | 178 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 139 | none | Gain 0.545 — one of the lowest-gain (slower-healing) organs |
| 10 | **Per-organ repair rate — Receptor 99 (organ of gene 179)** | 179 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 124 | none | Gain 0.486 — the single slowest-healing tissue in the stock genome |
| 11 | **Per-organ repair rate — Receptor 114 (organ of gene 181)** | 181 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 147 | none | Gain 0.576 |
| 12 | **Per-organ repair rate — Receptor 127 (organ of gene 111')** | 111 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 150 | none | Gain 0.588 (second receptor wired to gene-111's organ) |
| 13 | **Per-organ repair rate — Receptor 132 (organ of gene 124)** | 124 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 143 | none | Gain 0.561 — the most common gain value across the receptor battery |
| 14 | **Per-organ repair rate — Receptor 136 (organ of gene 183)** | 183 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 143 | none | Gain 0.561 |
| 15 | **Per-organ repair rate — Receptor 140 (organ of gene 185)** | 185 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 147 | none | Gain 0.576 |
| 16 | **Per-organ repair rate — Receptor 144 (organ of gene 127)** | 127 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | **19** | 143 | none | Gain 0.561. **Nominal 19** means this organ has a small baseline repair rate (~0.074) even without Prostaglandin — it always heals a little |
| 17 | **Per-organ repair rate — Receptor 173 (organ of gene 129)** | 129 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | **19** | 143 | none | Same baseline-plus-gain profile as Receptor 144: always a trickle of repair, accelerated by Prostaglandin |
| 18 | **Per-organ repair rate — Receptor 178 (organ of gene 114)** | 114 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 141 | none | Gain 0.553 |
| 19 | **Per-organ repair rate — Receptor 193 (organ of gene 116)** | 116 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 143 | none | Gain 0.561 |
| 20 | **Per-organ repair rate — Receptor 194 (organ of gene 188)** | 188 | Organ / Somatic | `RLOCUS_RATEOFREPAIR` | 0 | 0 | 143 | none | Gain 0.561 |
| 21 | **Stress-catalysed degradation** (stress suppresses healing) | Gene 98 — Reaction 76 | `1× Stress [128] + 1× Prostaglandin [94] → 1× Stress [128] + 1× Fatty Acid [6]` | — | — | rate 28, half-life **16 ticks** ("Short") | — | Stress acts as a catalyst (unchanged on each pass): it accelerates the destruction of Prostaglandin into a bare Fatty Acid. A chronically stressed creature loses its healing coefficient in proportion to its stress level — the genome's biochemical model of "stress slows wound recovery" |
| 22 | **Self-degradation back to building-blocks** | Gene 99 — Reaction 100 | `2× Prostaglandin [94] → 1× Amino Acid [13] + 1× Fatty Acid [6]` | — | — | rate 29, half-life **18 ticks** ("Short") | — | Reversible pair with Reaction 101: un-used Prostaglandin decomposes back into AA/FA, so the pool can never overshoot far past the AA/FA equilibrium. Ensures the chemistry is self-limiting and an over-dose cannot create permanent super-healing |
| 23 | **Passive decay** | — | — | Half-life **418 ticks** ("Medium", decay rate 0.99834) | — | — | — | Background clearance of residual Prostaglandin that was not consumed by a reaction. ~14 s at 30 tps — intermediate between the fast reaction half-lives (16–21 ticks) and the very-slow antigen/cure timescales. A single potion dose provides ~30–50 s of elevated repair before it fades to baseline |

### Receptor battery summary

Twenty distinct `RLOCUS_RATEOFREPAIR` receptors read chem 94 — one for each organ in the stock Creatures 3 genome plus a couple of duplicate wirings. All use `organ = ORGAN_ORGAN (2)` (which points to the specific organ the receptor gene belongs to), all target `tissue = Somatic (0)`, all use `locus = 1` (`RLOCUS_RATEOFREPAIR`), all have `threshold = 0` (any Prostaglandin concentration triggers repair), all have `flags = 0` (straight linear readout, no digital/invert/reduce). Gains cluster around **143** (the median) with outliers at **124** (slowest-healing organ, gene 179) and **193** (fastest-healing organ, gene 169). Two organs (gene 127 and gene 129) have `nominal = 19` (a small baseline repair rate even at zero Prostaglandin); the other eighteen have `nominal = 0` (absolutely no healing without Prostaglandin).

### Potions delivering Prostaglandin

| Potion | Tag | Script | Prostaglandin delivered | Other ingredients |
|--------|-----|--------|-------------------------|-------------------|
| **Vitamin Potion** | `Agent Help 2 25 20` | `scrp 2 25 20 12` (`medicine maker.cos:660–672`) | `CHEM 94 0.15` (0.15 units) | `CHEM 98 0.35` Vitamin E, `CHEM 99 0.35` Vitamin C, `CHEM 3 0.05` Glucose |
| **General Cure** | `Agent Help 2 25 19` | `scrp 2 25 19 12` (`medicine maker.cos:642–658`) | `CHEM 94 0.15` (0.15 units) | `CHEM 100 0.15` Antihistamine, `CHEM 97 0.15` Arnica, `CHEM 95 0.15` EDTA, `CHEM 92 0.15` Medicine one, `CHEM 93 0.15` Anti-oxidant, `CHEM 96 0.15` Sodium thiosulphate, `CHEM 117 0.45` Adrenalin |
| **Anti-bacterial Spray** (area) | `Agent 3 8 19` | `scrp 3 8 19 1` / `scrp 3 8 19 2001` (`anti-bacterial spray.cos:42, 86`) | `CHEM 94 0.2` (0.2 units per creature hit) | None — Prostaglandin is the sole chemical payload (also stims pleasure via `stim writ from 90 1`) |

## Role in Game Mechanics

### The repair coefficient of every organ

Every organ in the creature's body has a short-term life-force (the current health of the tissue) and a long-term life-force (the undamaged baseline). When an organ takes damage, its short-term value drops below long-term, and on each tick the `Organ.RepairInjury()` routine (`Rebuild/Main_Game/src/engine/creature/biochemistry/Organ.js:397–419`) computes:

```
delta = myLongTermLifeForce − myShortTermLifeForce
repair = delta × loc_LongTermRateOfRepair   // only if energy is available
myShortTermLifeForce += repair
CHEM_INJURY (127) -= LF_TO_LOC(repair)
```

The crucial factor is `loc_LongTermRateOfRepair` — the **locus modifier** whose value is written by the Prostaglandin receptor. Because the receptors have `threshold = 0`, `nominal = 0` (for 18 of 20 organs), and typical `gain ≈ 143/255 ≈ 0.56`, the formula for a typical organ is:

```
loc_LongTermRateOfRepair = (143 / 255) × chem94   ≈ 0.56 × chem94
```

At **chem94 = 0.0**, the coefficient is 0 and the organ heals *nothing* — damage accumulates with no corrective force. At **chem94 = 0.5** (a reasonable steady-state for a fed creature), the coefficient is ~0.28, meaning each tick the gap between long-term and short-term shrinks by ~28%. At **chem94 = 1.0** (saturation, e.g. right after a Vitamin Potion stacked on top of endogenous synthesis), the coefficient is ~0.56, and the gap shrinks by over half *every single tick* — the organ is essentially back to full strength within 5–10 ticks (~0.3 s).

Prostaglandin is therefore the creature's **healing throttle**. Without it, the body is a one-way damage accumulator; with it, the body aggressively restores tissue. This is independent of the CHEM_INJURY pain signal — Prostaglandin's presence is what actually performs the repair; CHEM_INJURY is merely the proprioceptive readout of accumulated damage that drives the pain drive.

### The long-term floor the body cannot restore

A key subtlety of the C3 organ model: Prostaglandin drives the **short-term** repair (`loc_LongTermRateOfRepair` is actually only applied to `myShortTermLifeForce`, despite the name). The **long-term** life-force is separately and permanently eroded by damage — its drift is controlled by `myLongTermRateOfRepair`, a gene-set constant (original engine default 10/255 ≈ 0.039), and it **only moves downward**. Prostaglandin cannot restore long-term damage; it can only restore the gap between the current short-term health and the (already-eroded) long-term baseline.

This means Prostaglandin is a *fast* healer but not a *regenerative* one: a creature whose organs have been permanently damaged by sustained injury / zero-energy starvation / repeated toxin exposure still carries that damage even at maximum Prostaglandin. The Vitamin Potion and the Anti-bacterial Spray both address the *short-term* health the creature is currently losing; neither can un-age a creature or repair old organ scars.

### The AA/FA ↔ Prostaglandin equilibrium

Reactions 100 and 101 form a near-reversible chemistry:

```
Reaction 101 (gene 68):   AA + FA       → 2× Prostaglandin    (HL 21, "Short", rate 31)
Reaction 100 (gene 99):   2× Prostaglandin → AA + FA           (HL 18, "Short", rate 29)
```

The forward (synthesis) reaction is slightly faster (rate 31 vs 29), but both are "Short" speed. At equilibrium the Prostaglandin pool is tightly coupled to the AA/FA pool: a creature that digests protein and fat continuously feeds its Prostaglandin supply; a creature whose digestive chemistry runs dry loses Prostaglandin not only to its own decay but to Reaction 100 converting it back into raw AA/FA.

The net effect is an automatic **nutritional coupling of healing**: hungry creatures don't just feel hungry, they also heal slowly. Feeding a damaged creature restores the AA/FA pools, which cascade into Prostaglandin synthesis, which boosts the repair rate locus on every organ. The player's intuitive response to an injured Norn ("give it food") is mechanically the correct response, not because food is magical but because the digestive chemistry downstream of food is what powers the healing chemistry.

### Stress as the healing brake — Reaction 76

Reaction 76 (gene 98) is the most interesting Prostaglandin wiring:

```
Stress [128] + Prostaglandin [94]  →  Stress [128] + Fatty Acid [6]    (HL 16, "Short", rate 28)
```

Stress is a **catalyst** here (unchanged across the reaction), and it degrades Prostaglandin 1 : 1 into a Fatty Acid. The effect is that stress functions as a Prostaglandin drain: the more stressed the creature, the faster its Prostaglandin pool is consumed, the lower the repair coefficient on every organ.

This is the genome's biochemical model of the psychosomatic phenomenon that "stressed creatures don't heal as well". A Norn that is frightened, pain-stimulated, drive-thrashed or otherwise in high Stress (chem 128) will have chronically depleted Prostaglandin, and therefore chronically slow organ repair, *even if* its AA/FA synthesis chemistry is running normally. The only remedy is to reduce the Stress input (calming, positive stimuli, feeding, satisfaction of drives) or to flood the Prostaglandin pool externally (Vitamin Potion / Anti-bacterial Spray).

The half-life (16 ticks, "Short") is faster than the self-decay (18 ticks) and just a shade slower than Stress's own dynamics, so the reaction is "always on" in a stressed creature and works as an active brake on healing rather than as a slow bleed.

### The half-life ordering around Prostaglandin

```
Reaction 76 (Stress + Prostaglandin → Stress + FA):        HL 16 ticks (Short)
Reaction 100 (2× Prostaglandin → AA + FA):                 HL 18 ticks (Short)
Reaction 101 (AA + FA → 2× Prostaglandin):                 HL 21 ticks (Short)
Passive Prostaglandin decay:                               HL 418 ticks (Medium, ~14 s)
```

All three consuming / producing reactions are clustered at 16–21 ticks (~0.5–0.7 s) — a full order of magnitude faster than the passive decay. This means Prostaglandin concentration is primarily determined by the balance of the three reactions (synthesis from AA/FA, decay to AA/FA, stress-catalysed loss), and only secondarily by the background decay. A Vitamin Potion dose (0.15 units) is mostly consumed within 2–3 seconds by the reactions rather than lingering passively — the potion's effect is a short, sharp "healing burst" rather than a slow, sustained release. The Anti-bacterial Spray's 0.2 unit dose is slightly larger and delivered to multiple creatures simultaneously, but subject to the same fast reactive clearance.

### The Anti-bacterial Spray — Prostaglandin as field first-aid

The Anti-bacterial Spray agent (`anti-bacterial spray.cos`) is a uniquely Prostaglandin-centric object in the bootstrap. Its activation script enumerates every type-4 (creature) agent in range and fires:

```caos
etch 4 0 0
    seta va16 targ
    chem 94 .2       ; inject 0.2 units Prostaglandin into each creature
next
```

and simultaneously emits `stim writ from 90 1` (pleasure +1). The player-visible effect is a spray-bottle action that makes nearby creatures briefly happy and accelerates their healing for ~14 s. There are no antibacterial chemicals per se — the "anti-bacterial" framing is narrative. Mechanically, the spray is a healing-acceleration field: every creature caught in the spray gets its repair-rate coefficient boosted for the residence time of the 0.2-unit Prostaglandin dose. For a damaged group of creatures (e.g. after a toxic incident), the spray functions as a field first-aid distribution — one press of the button, every nearby creature gets a healing kick.

### The legacy library descriptor — vitamin / fertility

The stock chemical-library descriptor for slot 94 reads "*Fat Soluble vitamin, deficiency can cause infertility*". This is **inconsistent with the Creatures 3 wiring**:

- **"Fat soluble vitamin"** more accurately describes chemical 98 (Vitamin E) in the C3 slot layout, not 94. Vitamin E in C3 is in fact delivered alongside Prostaglandin by the Vitamin Potion (`chem 98 .35`), which may be the source of the confusion.
- **"Deficiency can cause infertility"** is not wired anywhere for slot 94 — no receptor reads chem 94 into any fertility-related locus (`ELOCUS_GONAD_ESTROGEN`, `ELOCUS_GONAD_TESTOSTERONE`, progesterone loci, etc. are all driven by the sex hormone axis 46 / 48 / 53, not by 94). Infertility in C3 is controlled by the hormone axis's sensitivity to Libido lowerer (40), hunger, stress, and other drivers, not by Prostaglandin.

The library descriptor is most plausibly a fossil from earlier Creatures titles (C1 or C2) whose chemistry tables used different slot assignments, and it was not refreshed when the C3 stock genome was authored. The authoritative sources for slot 94's role in C3 are (i) the stock genome's reaction and receptor wiring, which consistently identify it as the organ-repair coefficient, and (ii) the *panatreea.catalogue* and *Materia Medica.catalogue* 2 25 20 entries, which frame it player-facingly as a "health boost / strength and vitality" chemical.

### Why Prostaglandin is invisible to the creature itself

A striking design choice is that Prostaglandin drives **no** non-organ loci — it does not feed into any drive (no pain / hunger / tiredness locus reads chem 94), any emotion (no fear / anger / love locus), any brain lobe (no neuron activation depends on it), or any behavioural signal. The creature has no direct perception of its own Prostaglandin level. The only observable effect is the downstream one: injured organs heal faster, the CHEM_INJURY signal drops (because `Organ::RepairInjury()` also subtracts from chem 127 by the repaired amount), and the Pain drive fades accordingly.

This is consistent with the "quiet repair chemistry" pattern: Prostaglandin is a *mechanic* rather than a *percept*. The player sees the result (a Norn recovering from illness or injury), but neither the player-facing Science Kit / Graph nor the creature's own behaviour selection changes directly with Prostaglandin level. The signalling is all downstream: CHEM_INJURY (127) falls → Pain drive (148) receptor sees less pain → behaviour tree stops choosing pain-avoidance actions → the creature acts healthily. Prostaglandin is the silent hand behind that arc.

The Medical Pod's diagnostic scanner (`medical scanner.cos:80`) does not scan chem 94 either; the scanner watches `chem 127` (Injury) and organ life-force, both of which are downstream observables of a working Prostaglandin system. A creature with depleted Prostaglandin won't register as "deficient in Prostaglandin" — it will register as "slowly accumulating injury without healing", and the remedy the player applies (Vitamin Potion, Anti-bacterial Spray, or simply feeding the creature protein/fat) re-starts the healing chemistry without needing to name the coefficient.

### The healing lifecycle in full

A complete injury-and-recovery episode for a C3 creature touches Prostaglandin at several stages:

1. **Injury event.** An organ's `Organ::Injure()` routine drops `myShortTermLifeForce` below `myLongTermLifeForce` and emits a CHEM_INJURY pulse (`Organ.js:384`).
2. **Pain drive rises.** Receptor 1 on chem 148 (Pain) signals the pain drive.
3. **Repair attempt each tick.** `Organ::RepairInjury()` runs. The coefficient it uses, `loc_LongTermRateOfRepair`, is read from the Prostaglandin receptor:
   - If the creature has Prostaglandin in circulation (chem 94 > 0), the coefficient is ~0.56 × chem94, and the short-term life-force climbs back toward long-term.
   - If the creature has no Prostaglandin (chem 94 = 0), the coefficient is ~0, and the organ does not heal. CHEM_INJURY stays elevated. Pain persists.
4. **Energy gate.** Healing additionally requires `energyAvailable`. An exhausted creature (chem 34 / Energy low) cannot repair even with Prostaglandin — the chemistry is fuelled as well as catalysed.
5. **Stress depletion.** If the creature is stressed (chem 128 elevated), Reaction 76 drains Prostaglandin at HL 16 ticks. The repair coefficient drops and the repair slows even with ongoing synthesis.
6. **Nutritional coupling.** Reaction 101 continuously regenerates Prostaglandin from Amino Acid + Fatty Acid as long as the creature's digestion provides those substrates. A fed creature with low stress keeps Prostaglandin topped up automatically.
7. **Player intervention.** A Vitamin Potion, General Cure, or Anti-bacterial Spray each provide an acute 0.15–0.20-unit Prostaglandin burst, temporarily overwhelming Stress's depletion and the passive decay, and forcing the repair coefficient to its maximum for ~15–30 seconds while the dose lingers.
8. **Recovery.** Short-term life-force returns to (or close to) long-term; CHEM_INJURY falls; Pain drive fades; the creature exits the pain-avoidance behaviour loop.
9. **Permanent damage remains.** The long-term baseline has itself drifted down by `delta × myLongTermRateOfRepair` each tick of the injury period; Prostaglandin does not restore that. Repeated or prolonged injuries leave permanent scars on organ life-force even though the creature appears recovered.

### Design philosophy — healing as a metabolite

Prostaglandin exemplifies a clean "healing as a metabolite" design:

- **Not a sense** — no brain lobe, drive, or behaviour reads it. The creature has no perceptual access to its own healing chemistry.
- **Not an input** — no neuro-emitter or environmental signal produces it. The only production pathway is metabolic (AA + FA → 2×P) plus external administration.
- **Not a switch** — no digital/reduce/invert flag; it is a linear coefficient proportional to concentration.
- **Tightly coupled to nutrition** — synthesis requires amino-acids and fatty-acids, so well-fed creatures heal well and poorly-fed creatures do not. The "eat to heal" intuition is mechanically true.
- **Tightly coupled to stress** — Reaction 76 gives stress a direct biochemical grip on healing. The "stress impedes recovery" intuition is mechanically true.
- **Administrable** — three in-world potions / sprays give the player levers to boost healing directly, but each has only a 14-second half-life so healing is a *capacity* the player nudges rather than a one-shot repair.
- **One locus, twenty receptors** — every organ reads the same chemical with a different gain, so organs heal at different speeds without needing distinct chemicals per organ.

The result is a chemical whose semantics the player does not need to understand directly — they never see "Prostaglandin low" on a screen — but whose downstream effects (injury accumulating, healing stalling, recovery accelerating under certain conditions) arise naturally from the creature's food, stress, damage and potion history.

## Summary

```
 Chemical 94 — Prostaglandin  (the organ repair-rate coefficient)
 --------------------------------------------------------------------------
 Producers:   Reaction 101 (gene 68, HL 21 "Short"):
                 1× Amino Acid [13] + 1× Fatty Acid [6] → 2× Prostaglandin [94]
              Potions (Medicine Maker):
                 Vitamin Potion (scrp 2 25 20 12) → CHEM 94 0.15
                 General Cure   (scrp 2 25 19 12) → CHEM 94 0.15
              Area spray:
                 Anti-bacterial Spray (scrp 3 8 19 1/2001) → CHEM 94 0.2
                   per creature (ETCH 4 0 0, all type-4 agents in range)
              CAOS/custom: CHEM TARG 94 <amount>
              NO endogenous emitter gene — synthesis is reactive only.

 Consumers:   Reaction 76  (gene 98, HL 16 "Short"):
                 1× Stress [128] + 1× Prostaglandin [94]
                   → 1× Stress [128] + 1× Fatty Acid [6]
                 (stress-catalysed degradation — brake on healing)
              Reaction 100 (gene 99, HL 18 "Short"):
                 2× Prostaglandin → 1× Amino Acid + 1× Fatty Acid
                 (reversible decay back to building blocks)
              Passive decay: HL 418 ticks ("Medium", ~14 s).

 Receptors (20):
   ALL are RLOCUS_RATEOFREPAIR on tissue 0 (Somatic) of organ 2 (ORGAN_ORGAN),
   one per organ in the stock genome. Typical profile:
     threshold = 0, nominal = 0 (18/20) or 19 (2/20),
     gain = 124–193 (median ~143),
     flags = 0 (linear).
   Effect: loc_LongTermRateOfRepair = (gain/255) × chem94
           → each tick the gap (long-term − short-term) life-force shrinks
           by (gain/255 × chem94) × delta; no Prostaglandin ⇒ no healing.

 Role: The organ healing coefficient. Every organ in the body reads chem 94
       to decide how fast its short-term life-force is restored toward the
       long-term baseline each tick. Without Prostaglandin in circulation
       the body accumulates damage but does not repair it; with Prostaglandin
       elevated, damaged organs recover rapidly. Nutrition (AA + FA substrate)
       and stress (Reaction 76 drain) both modulate the steady-state pool,
       providing biochemical grounding for the "food heals, stress harms"
       intuition. Potions and the Anti-bacterial Spray give the player direct
       levers to boost healing acutely.

 Long-term damage: Prostaglandin cannot restore long-term life-force drift
                   (Organ::RepairInjury only writes short-term). Repeated or
                   prolonged injuries leave permanent organ damage even when
                   the creature appears recovered.

 Legacy library descriptor:
   - creatures-chemicals.js:118 says "Fat Soluble vitamin, deficiency can
     cause infertility". This is a C1/C2 fossil description — it does not
     match the C3 wiring (fat-soluble vitamin is slot 98 / Vitamin E in C3,
     and infertility is driven by the sex hormone axis 46/48/53, not 94).
     The authoritative in-game framing is the Vitamin Potion Materia Medica
     entry ("strength and vitality") and the per-organ RLOCUS_RATEOFREPAIR
     wiring.

 Medical Pod scanner threshold: NOT scanned directly (chem 94 does not
                                appear in medical scanner.cos). The scanner
                                watches chem 127 (Injury) and organ life-
                                force — the downstream observables of a
                                working Prostaglandin system. A Prostaglandin-
                                starved creature registers as "slowly
                                accumulating injury", not as "low
                                Prostaglandin".

 Narrative role: The silent healing coefficient. The chemistry that quietly
                 decides whether the creature's body repairs itself or
                 rots — invisible to the creature's own senses, to the
                 brain, and to the diagnostic instruments, but causally
                 upstream of every short-term recovery event in the body.
```

Prostaglandin occupies an unusual niche in the C3 chemistry: it is the **master repair coefficient** of the entire body, yet it is perceptually invisible and diagnostically silent. Twenty organ receptors all read it with the same locus (`RLOCUS_RATEOFREPAIR`) and similar gains; three reactions together (synthesis from AA/FA, decay back to AA/FA, stress-catalysed destruction) set its steady-state concentration; three external vectors (Vitamin Potion, General Cure, Anti-bacterial Spray) let the player inject acute doses to accelerate recovery. The chemical's invisibility is the design's virtue — the player works with the *phenomena* (injury, healing, stress, food) and the Prostaglandin axis manages the conversion between them without ever surfacing as an independent dial.

## Key Source References

- `Rebuild/Libraries/creatures-chemicals.js:118` — chemical descriptor slot 94 "Prostaglandin" (*note: the text "Fat Soluble vitamin, deficiency can cause infertility" is a legacy C1/C2 description and does NOT match C3 wiring; the "fat-soluble vitamin" slot in C3 is 98 / Vitamin E, and fertility is driven by 46 / 48 / 53, not 94*)
- `Rebuild/Assets/Catalogue/ChemicalNames.catalogue:150` — player-visible slot name "Prostaglandin"
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:134–136` — "Vitamin Potion" help text: "*Keep your Creatures happy and healthy with this Vitamin Potion. It contains Vitamins C & D which enrich the health of a Creature, helping it maintain strength and vitality.*" (player-facing framing of Prostaglandin + vitamins as a vitality booster; note: the script actually delivers Vitamin E + Vitamin C, not Vitamin D)
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:130–132` — "General Cure" help text: "*This extremely useful potion can cure many different illnesses, all from the one bottle…*" — Prostaglandin is a silent healing-acceleration component of this potion
- `Rebuild/Assets/Catalogue/Materia Medica.catalogue:361` — *Materia Medica* index listing "Prostaglandin" (slot 94)
- `Rebuild/Assets/Catalogue/panatreea.catalogue:3` — plant lore: "*If your Norns are feeling a bit fragile, get them to drink some of the magical Panatreea Potion. It contains lots of Vitamin C and Prostaglandin to give immune systems a boost in times of need.*" (narrative framing as an "immune-system boost")
- `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json` — chemistry wiring:
  - Reaction 76 (gene 98): `1× Stress [128] + 1× Prostaglandin [94] → 1× Stress [128] + 1× Fatty Acid [6]`, rate 28, half-life 16 ticks ("Short")
  - Reaction 100 (gene 99): `2× Prostaglandin [94] → 1× Amino Acid [13] + 1× Fatty Acid [6]`, rate 29, half-life 18 ticks ("Short")
  - Reaction 101 (gene 68): `1× Amino Acid [13] + 1× Fatty Acid [6] → 2× Prostaglandin [94]`, rate 31, half-life 21 ticks ("Short")
  - Receptors 21, 30, 40, 50, 63, 66, 80, 89, 94, 99, 114, 127, 132, 136, 140, 144, 173, 178, 193, 194 — all `RLOCUS_RATEOFREPAIR` on organ 2 / tissue 0, reading chem 94 with gains 124–193 (median 143)
  - Half-life entry (slot 94): 418 ticks, decay rate 0.99834, "Medium"
  - No emitter — no gene emits chem 94 into the bloodstream directly
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:660–672` — `scrp 2 25 20 12`: "Vitamin Potion" drink script, injects `chem 94 .15` + Vitamin E 0.35 + Vitamin C 0.35 + Glucose 0.05
- `Rebuild/Assets/Bootstrap/001 World/medicine maker.cos:642–658` — `scrp 2 25 19 12`: "General Cure" drink script, injects `chem 94 .15` alongside six other cure chemicals at 0.15 and Adrenalin at 0.45
- `Rebuild/Assets/Bootstrap/001 World/anti-bacterial spray.cos:35–47, 78–95` — `scrp 3 8 19 1` and `scrp 3 8 19 2001`: Anti-bacterial Spray activation scripts, iterate every type-4 agent in range (ETCH 4 0 0) and inject `chem 94 .2` per creature plus `stim writ from 90 1` (pleasure)
- `Rebuild/Main_Game/src/engine/creature/biochemistry/Organ.js:397–419` — `Organ.RepairInjury()`: the routine where Prostaglandin's effect materialises. `loc_LongTermRateOfRepair` (the Prostaglandin receptor's output) multiplies the (long-term − short-term) life-force gap to produce the per-tick repair. Also subtracts the same amount from CHEM_INJURY (127)
- `Rebuild/Main_Game/src/engine/creature/biochemistry/Organ.js:801–805` — the `RLOCUS_RATEOFREPAIR` receptor accessor: reads/writes `loc_LongTermRateOfRepair`, which is the single float that Prostaglandin drives on each organ
- `Rebuild/Main_Game/src/engine/creature/biochemistry/BiochemistryConstants.js:67` — `RLOCUS_RATEOFREPAIR: 1` — the locus ID that all 20 Prostaglandin receptors target
- `Rebuild/DOCUMENTATION/chemicals/128 - Stress.md` (if present) — companion analysis of Stress, the catalyst that drives Reaction 76 against Prostaglandin
- `Rebuild/DOCUMENTATION/chemicals/013 - Amino Acid.md` and `Rebuild/DOCUMENTATION/chemicals/006 - Fatty Acid.md` — companion analyses of the two building-blocks for Reaction 101 (synthesis)
- `Rebuild/DOCUMENTATION/chemicals/127 - Injury.md` (if present) — companion analysis of the Injury chemical, the downstream observable that Prostaglandin-driven repair reduces
