# 039 - Arousal Potential

Arousal Potential is the creature's **internal readiness-to-mate signal** — a reproductive hormone that exists in the bloodstream only when the creature is physiologically fertile (i.e. has a sperm or egg in its `.Gamete` slot). It is the private, introspective half of a two-stage reproductive pipeline: Arousal Potential says "*I* am fertile and could mate right now", and the presence of the complementary **Opposite Sex Pheromone (41)** — inhaled from a nearby opposite-sex creature — then converts it into **Sex Drive (161)**, the public, goal-driving "*go court that creature*" urge that powers the mating behaviour loop. Without Arousal Potential a creature has no libido to contribute to the reaction at all; without an opposite-sex partner in scent range, Arousal Potential simply accumulates and slowly decays with no behavioural effect. It is therefore the gating variable that ensures creatures only feel mating-driven when both their own biology (fertility) and the social context (opposite sex present) line up.

Unlike the long-lived metabolic stores (Glucose, Fat, Protein…) Arousal Potential is a **pure signalling chemical**: it is never eaten, never metabolised for energy, never stored in tissue. Its entire lifecycle is genome-driven — a dedicated fertility emitter charges it, three reactions consume it (one productive, two destructive), one receptor reads it back to throttle further reaction activity, and a medium half-life (105 ticks) lets it build up over a few seconds of sustained fertility rather than flicker on every physics tick. The `LOC_FERTILE` locus that feeds it is in turn driven by the Reproductive faculty's ovulation/spermatogenesis cycle (`ReproductiveFaculty::Update()`), which sets the locus to `1.0` whenever `myGamete == true`. Arousal Potential is therefore a **derived, decaying, tunable proxy** for "creature currently carrying a viable gamete" that can be rate-limited, suppressed (via Libido lowerer) and scaled independently of the ovulation mechanics themselves.

Because Arousal Potential is the universal arousal currency that every other mating-related chemical either produces or consumes, it is also the central knob that breeders and the engine use to tune a creature's libido. Raising the emitter's threshold delays first-mating-age; lowering the receptor's gain speeds up the reaction output; injecting Libido lowerer through the CAOS `CHEM` command temporarily sterilises a creature's *desire* (not its gametes); and injecting Arousal Potential directly makes even an infertile creature immediately aroused if an opposite-sex partner is nearby. Understanding what this chemical does and does not do is therefore the key to understanding the whole libido sub-system.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Trigger / Formula | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | — | — | Newborn endowment **47 / 256 (~18 %)** — non-zero seed so the chemical exists at birth but stays inert (no opposite-sex pheromone around, and no Libido lowerer ever emitted unless a genome explicitly adds one). Decays toward 0 over the first few hundred ticks of life if no fertile state is reached | — |
| 2 | Fertility emitter | **Emitter 22, gene 19**, Youth onwards | Creature / Reproductive / `LOC_FERTILE` (0) | Reads `myFertileLocus` (1.0 when the creature has a gamete, 0.0 otherwise). DIGITAL fixed-gain | Threshold **128** (must be above 0.5 — effectively any gamete present), **rate 2** (every other tick), **gain 14**. While the creature is fertile it receives a steady drip of Arousal Potential every two ticks at moderate strength; while infertile the emitter is silent |

The `LOC_FERTILE` locus itself is set in the Reproductive faculty's tick:

```text
if myGamete and myOvulateLocus < OVULATEOFF:   myGamete = false
else if not myGamete and myOvulateLocus > OVULATEON:   myGamete = true
# If myGamete is present (sperm or egg), then you are fertile
myFertileLocus = 1.0 if myGamete else 0
```

So Arousal Potential is downstream of the **Ovulate locus** (and, ultimately, the Oestrogen/Progesterone cycle in females or the sperm-hormone cycle in males). When a female Norn's oestrogen crosses `OVULATEON`, she lays an egg into `.Gamete`, her `myFertileLocus` switches to 1.0, and from the next even tick onwards she begins accumulating Arousal Potential. When a male donates his sperm in `DonateSperm()` his `myGamete` is cleared, fertility drops to 0, and his Arousal Potential supply stops — he goes through a natural "refractory period" while the chemical decays (half-life 105 ≈ 3.5 seconds at 30 tps) and his sperm regenerates.

Arousal Potential has **no reaction source, no dietary input, no brain or drive source**. The fertility emitter is its sole inflow.

## Usage

| # | Mechanism | Gene | Reaction / Receptor | Formula / Locus | Effect |
|---|-----------|------|---------------------|-----------------|--------|
| 1 | Passive decay | — | — | Half-life **105 ticks** (decay rate 0.99340), "Medium" speed | With the emitter off, concentration drops by ~50 % every 105 ticks (~3.5 s at 30 tps). A fertile creature's Arousal Potential reaches equilibrium when emitter-inflow balances both the passive decay and the reaction consumption — typically a stable mid-range reading whenever no partner is in range |
| 2 | **Sex-drive synthesis** (productive use) | Reaction 32, gene 76, Youth onwards | 1× Arousal Potential + 1× Opposite Sex Pheromone [41] → 1× **Sex drive [161]** | Half-life **4 ticks** (very short) | The central mating reaction. When the creature inhales Opposite Sex Pheromone (emitted by any nearby fertile opposite-sex creature of the same genus) its arousal pool converts rapidly into Sex Drive, which is then read by the brain's drive neurons and by `LOC_RECEPTIVE` on females. A reaction half-life of 4 ticks means the conversion is almost real-time while both reactants are present |
| 3 | **Libido suppression** (productive consumption) | Reaction 34, gene 84, Youth onwards | 1× Arousal Potential + 1× **Libido lowerer [40]** → (nothing) | Half-life **10 ticks** (very short) | Libido lowerer annihilates Arousal Potential 1:1, consuming both reactants. This is the "chemical castration" pathway — Libido lowerer is itself emitted when the creature is *not* receptive (fertility locus low, flags INVERT on emitter 24), so infertile creatures actively mop up any stray arousal rather than letting it drift up to behaviourally meaningful levels |
| 4 | **Catalytic libido suppression** | Reaction 36, gene 152, Youth onwards | 1× Libido lowerer + 1× Arousal Potential → 1× Libido lowerer | Half-life **6 ticks** (very short) | A second, complementary reaction where Libido lowerer acts as a catalyst: it destroys Arousal Potential but regenerates itself. Combined with reaction 34 (which consumes it 1:1) this lets a small amount of Libido lowerer hold a large arousal supply at bay indefinitely, as long as the lowerer emitter keeps topping it up |
| 5 | **Reaction-organ throttle receptor** | Receptor 121, gene 200, Youth onwards | Reaction / Somatic / Locus 0, REDUCE + DIGITAL | Threshold 3, nominal 228, gain 79 | A very-low-threshold inverted digital receptor in the Reaction organ. While Arousal Potential is near zero it drives its locus high (nominal 228); once Arousal Potential passes the tiny threshold of 3 / 256 the REDUCE flag flips the output low. In practice this acts as a binary "arousal is present / arousal is absent" flag available to the Reaction organ's own modulation loop |

Arousal Potential has **no brain-neuron receptor**, no direct body-tissue receptor, and no gait or animation effect. It is purely an intermediate in the chain `fertility → arousal → sex drive`.

## Role in Game Mechanics

### The full reproductive signal chain

From the moment a Norn reaches sexual maturity, a four-stage chemical cascade translates biological fertility into mating behaviour:

```
 ReproductiveFaculty::Update()   (every tick, Youth onwards)
     │
     │  Oestrogen/Progesterone cycle drives myOvulateLocus
     │  OvulateLocus above OVULATEON → myGamete = true
     │  myFertileLocus = (myGamete) ? 1.0 : 0
     │
     ▼
 Emitter 22  (LOC_FERTILE → Arousal Potential)
     │  threshold 128, rate 2, gain 14, DIGITAL
     │  fires while fertile
     │
     ▼
 Arousal Potential [39]   (half-life 105 ticks)
     │  accumulates to a steady mid-range level while fertile
     │  evaporates over ~10 s once fertility ends
     │
     ├──► Reaction 32 (+ Opposite Sex Pheromone [41]) ──► Sex Drive [161]
     │        (the productive branch — requires partner in scent range)
     │
     ├──► Reaction 34 (+ Libido lowerer [40]) ──► nothing
     │        (destructive 1:1 — active suppression)
     │
     ├──► Reaction 36 (+ Libido lowerer [40]) ──► Libido lowerer
     │        (catalytic — persistent suppression)
     │
     └──► Receptor 121 → Reaction organ / Somatic / Locus 0
              (internal feedback flag — "I am currently aroused")

 Sex Drive [161]
     │
     ├──► Brain drive-neuron inputs (via neuroemitter receptors) → pushes the creature toward MATE-type actions
     └──► LOC_RECEPTIVE on females (receptor 42 in genome) → allows conception when inseminated

 Behavioural outcome:  creature pursues the opposite-sex target, performs courtship,
                       attempts DonateSperm() / AcceptSperm() in the Reproductive faculty
```

Each arrow in the chemistry section is an emitter, reaction, or receptor gene; each horizontal branch is a separate genome-editable knob. The chain deliberately inserts a chemical buffer (Arousal Potential) between the raw fertility bit and the Sex-Drive output, for the same reasons the Downatrophin/Upatrophin pair separate slope from gait (see `018 - Upatrophin.md`): **hysteresis, tunability, and context-gating** by the presence of a second chemical (the pheromone).

### Why a chemical intermediate rather than a direct locus wire?

The genome could in principle wire `LOC_FERTILE` straight to `Sex Drive` through an emitter. The authors chose the Arousal Potential intermediate for four reasons:

1. **AND-gating with external pheromone.** The Sex Drive reaction requires *both* Arousal Potential *and* Opposite Sex Pheromone. This is the chemistry-engine equivalent of a logical AND gate: fertility alone produces no sex drive, nor does the mere scent of a partner — only the conjunction does. An emitter cannot do this; a reaction can.
2. **Active suppression pathway.** By giving arousal its own pool, Libido lowerer can eat it 1:1 (reaction 34) or catalytically (reaction 36), providing a chemically-meaningful antagonist. A direct wire from `LOC_FERTILE` has no such handle — you can suppress fertility itself (via the ovulate locus), but that also shuts off conception, not merely libido.
3. **Decay/hysteresis between gametes.** With a medium half-life of 105 ticks (~3.5 s), a male's arousal lingers briefly after he donates his sperm, and a female's arousal persists after ovulation finishes, preventing the behaviour from snapping on and off as the gamete state flickers at the OVULATEON/OVULATEOFF boundaries. This makes mating feel gradual rather than binary.
4. **Genome-level tunability per generation.** Emitter 22 (fertility → arousal) and receptor/reaction rates for arousal are all independent genes (19, 76, 84, 152, 200). A breeder can produce a highly-libidinous strain (higher emitter gain, lower reaction half-life) or a placid one (raised emitter threshold, stronger libido-lowerer reaction) by editing a small set of genes without ever touching the ovulation cycle or the brain.

### Interaction with Libido lowerer (40)

Libido lowerer is Arousal Potential's natural antagonist and together they form a classic push/pull regulator. In the stock genome Libido lowerer is emitted by Emitter 24 (`LOC_FERTILE` again, but with the **INVERT** flag set) — so it pulses when the creature is *not* fertile. The net effect is:

| Fertility state | `LOC_FERTILE` | Emitter 22 (Arousal) | Emitter 24 (Libido lowerer) | Dominant chemical |
|---|---|---|---|---|
| Gamete present | 1.0 | **Firing** (AP inflow) | Silent (INVERT gates it off) | Arousal Potential rises |
| No gamete | 0.0 | Silent | **Firing** (AP-suppressor inflow) | Libido lowerer rises and eats any residual AP via reactions 34 & 36 |

So the two chemicals form a **mutually exclusive ON/OFF pair** driven by the single underlying fertility bit. Arousal Potential dominates whenever the creature has something to mate with; Libido lowerer dominates whenever it does not, and actively scrubs the bloodstream of leftover arousal rather than passively waiting for it to decay.

### Interaction with Opposite Sex Pheromone (41)

Opposite Sex Pheromone is the **context gate** that decides whether accumulated Arousal Potential ever turns into behaviour. It is not produced internally — it is inhaled from the creature's surroundings (emitted by fertile opposite-sex creatures of the same genus, or by `CHEM` injection for testing). Receptor 23 in the genome also forwards it directly to brain neuron 20, giving the brain an independent "opposite sex is near" signal used for courtship navigation. The pheromone/arousal reaction (32) therefore closes the loop between:

- **biology** (`LOC_FERTILE` → Arousal Potential),
- **environment** (Opposite Sex Pheromone in the air), and
- **behaviour** (Sex Drive → brain drive neurons → MATE actions, and `LOC_RECEPTIVE` on females → conception).

A Norn alone in a room will build up Arousal Potential but never produce Sex Drive; bring a fertile opposite-sex partner in and the conversion reaction (half-life 4 ticks) fires almost instantly on inhalation.

### The self-limiting receptor

Receptor 121 — Arousal Potential → Reaction organ / Somatic / Locus 0, REDUCE + DIGITAL, threshold 3, nominal 228, gain 79 — is an unusual one. The Reaction organ's own tissue loci modulate reaction rates in some setups, and this receptor uses the REDUCE flag to *invert* its output: while AP is near zero, the locus reads high (nominal 228); the moment AP climbs past the microscopic threshold of 3/256, the locus drops. Functionally this gives the Reaction organ a binary "am I currently aroused?" flag that can be used to gate or scale other reactions (gene 200 is the source, so breeders wanting to further couple arousal into the creature's metabolism can tune it through this one gene). In the stock genome this receptor's downstream effect is subtle — most tangible libido behaviour flows through the Sex Drive pathway — but its presence illustrates how Arousal Potential is also an **internal reporting signal** that the chemistry engine itself can consult.

### Practical gameplay consequences

- **A newborn's ~18 % seed is irrelevant.** Children have `LOC_FERTILE = 0` until puberty (the reproductive genes only switch on at Youth, age 3). The 47/256 birth seed decays to near-zero over the first few hundred ticks and plays no role in behaviour.
- **Arousal is gated twice.** A Norn needs *both* a gamete (internal) *and* an opposite-sex partner in scent range (external) before Sex Drive rises. This is why isolated Norns never behave as if they are "in heat" even when freshly ovulated — their Arousal Potential rises, but with no pheromone partner the conversion reaction starves.
- **`CHEM TARG 39 255` floods a creature with arousal.** Useful for testing mating behaviour in isolation: with Arousal Potential maxed out, any subsequent injection of Opposite Sex Pheromone (41) will rapidly synthesise Sex Drive via reaction 32 and push the creature into mating behaviour even without a real partner present.
- **`CHEM TARG 40 255` suppresses libido independent of fertility.** Injecting Libido lowerer immediately recruits reactions 34 and 36, draining Arousal Potential without affecting the creature's actual gamete state. The creature remains *physically* fertile but feels no sex drive. This is the chemistry-level "chaste Norn" mod — a staple of Creatures 3 breeding experiments.
- **Genome editing knobs.** Raising emitter 22's threshold above 128 delays Arousal inflow until `LOC_FERTILE` is very high (no practical effect — the locus is binary); lowering the half-life (raising the decay rate toward 1.0) makes a creature's refractory period after mating much shorter; raising reaction 32's rate (lowering its half-life toward 1) makes arousal translate to sex drive almost instantly on first scent of a partner.
- **Why males and females behave similarly.** Both sexes use identical emitter/receptor genes for Arousal Potential — the only difference is which reproductive event (egg laying vs. sperm maturation) feeds `LOC_FERTILE`. This symmetric design ensures that libido dynamics don't fork between sexes and that both partners are independently motivated by the same chemistry.
- **Death clears arousal.** When the creature dies, its chemistry continues running briefly (the `LOC_DEAD` immune locus enables post-mortem reactions) but all emitters tied to fertility halt because `myFertileLocus` is no longer updated. Residual Arousal Potential decays away with its standard 105-tick half-life; no Sex Drive is synthesised because no new arousal inflow arrives.

### Summary

Arousal Potential is the **biological half of the libido equation**:

```
  ReproductiveFaculty — gamete present ⇒ LOC_FERTILE = 1.0
           │
           ▼
  Emitter 22 (gene 19) — drips AP into the bloodstream while fertile
           │
           ▼
  Arousal Potential [39]   • half-life 105 ticks (medium)
                           • no metabolic use, no storage
           │
           ├──► + Opposite Sex Pheromone [41] ──► Sex Drive [161]  (productive)
           ├──► + Libido lowerer [40] ──► (nothing)                (destructive)
           ├──► + Libido lowerer [40] ──► Libido lowerer           (catalytic suppression)
           └──► Reaction organ locus 0                             (internal "I am aroused" flag)
```

It carries the information "this creature is physiologically ready to reproduce right now", holds it for a few seconds across the boundaries of the ovulation cycle so behaviour doesn't flicker, and hands it off either to Sex Drive when a partner is present or to Libido lowerer when the creature becomes infertile again. It is the biochemical definition of arousal in Creatures 3 — internal, gated, tunable, and silent until the environment provides the second half of the equation.
