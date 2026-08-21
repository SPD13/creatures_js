# 018 - Upatrophin

Upatrophin is a **gait-switching signalling chemical** — a short-lived "movement hormone" whose entire job is to tell the creature's skeleton "you are currently ascending a slope, switch to the up-slope walk animation". Together with its sibling **Downatrophin (17)** it forms a two-chemical pair that converts the raw geometric slope underfoot (computed every tick by the walking engine) into an animation-selection signal that the `Skeleton::Walk()` gait picker can read. Despite living in the creature's chemistry like any other hormone, Upatrophin is **not metabolic** — it is never eaten, never digested, never produced or consumed by any chemical reaction, and carries no nutritional value. It is pure nervous-system signalling, piggy-backing on the chemical system because Creatures' biochemistry is also its neural-modulator substrate.

The entire Upatrophin pathway is deliberately simple: the walking engine measures the uphill gradient at the creature's feet, writes it into the `LOC_UPSLOPE` sensorimotor emitter locus, an emitter gene converts that locus reading into pulses of Upatrophin, the chemical then builds up in the creature's bloodstream with a **very short half-life (5 ticks, decay rate 0.879)**, and a receptor gene reads it and drives `LOC_GAIT9` — one of sixteen gait-selection receptors in the sensorimotor tissue. When `LOC_GAIT9`'s reading beats every other gait's reading, `Skeleton::Walk()` plays the gait-9 animation string (defined in the creature's body-data file) instead of the default gait-0 walk cycle. In stock Norns, gait 9 is the "walking uphill" animation — shorter strides, leaning forward, bracing foot placement — which keeps the creature visually grounded when climbing a ramp or hill in a metaroom.

Upatrophin's extreme volatility is the whole point of its design. With a half-life of only five game ticks (about 1/6 of a second at 30 tps) the chemical cannot accumulate — it tracks the creature's immediate slope experience in near real-time. Walk off a climb onto flat ground and Upatrophin evaporates within a dozen ticks, the gait-9 receptor stops firing, and `Skeleton::Walk()` reverts to the default gait. This is exactly opposite to how long-half-life metabolites like Muscle Tissue or Glycogen behave, and is the single reason the genome uses two such chemicals (Downatrophin / Upatrophin) for this job rather than routing the slope value directly from emitter to receptor: the chemical step introduces **hysteresis** (the emitter fires at a ~19 % slope threshold, the receptor reads above ~30 % of the chemical's range, the chemical needs ~2 ticks to reach that range), which **debounces the animation switch** so that tiny irregularities in terrain don't flap the gait back and forth every tick.

## Sources

| # | Mechanism | Gene | Organ / Tissue | Formula / Trigger | Rate |
|---|-----------|------|----------------|-------------------|------|
| 1 | Initial concentration | — | — | Newborn endowment 18 / 256 (~7 %) — below the receptor threshold of ~30 % so gait-9 is **not** active at birth. This small non-zero seed exists only so the chemical passes decay-rate sanity checks (a zero-seeded chemical with no sources would always be zero and the receptor would never fire) |
| 2 | Upslope-sensing emitter | Emitter 18, gene 41, Baby onwards | Creature / Sensorimotor / `LOC_UPSLOPE` (10) | Reads the uphill gradient of the surface under the creature's up-foot, thresholded and clamped to 0/255 | DIGITAL (fixed gain), threshold 48 (~19 % slope), rate 2, gain 255 — while the creature faces an uphill gradient steeper than ~19 %, the emitter pulses 255-strength Upatrophin into the bloodstream every other tick. Below the threshold it is silent |

The `LOC_UPSLOPE` locus itself is populated by the physics engine, not by genes: the skeleton's `Walk()` method calls `GetMap().TestNewUpFootInRoomSystem()` which computes `gradientUphill` (and `gradientDownhill`) for the current foot-placement step, and stores them directly:

```text
myUpslopeLocus   = gradientUphill
myDownslopeLocus = gradientDownhill
```

So every step the creature takes re-reads the slope underfoot and refreshes the emitter's reading. The DIGITAL flag on the emitter means the output is quantised: either full-strength or nothing — there is no "slight incline" intermediate signal on Upatrophin itself, though the underlying `myUpslopeLocus` is a continuous float used elsewhere (e.g. pose direction).

Upatrophin has **no reaction source**, **no dietary input**, **no brain or drive source**. The emitter is its only inflow.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Formula / Locus | Effect |
|---|-----------|------|----------------|-----------------|--------|
| 1 | Passive decay | — | — | Half-life 5 ticks, decay rate 0.87904 | Extremely fast evaporation — the chemical vanishes within ~15 ticks after the emitter stops firing, ensuring the gait signal closely tracks the creature's current terrain |
| 2 | Gait-9 receptor | Receptor 191, gene 191, Baby onwards | Creature / Sensorimotor / `LOC_GAIT9` (17) | DIGITAL (all-or-nothing), threshold 77 (~30 %), nominal 0, gain 255 | When Upatrophin ≥ ~30 %, drives `LOC_GAIT9` to 255. `Skeleton::Walk()` then compares all sixteen `myGaitLoci[]` values and plays the gait-table entry for whichever locus is strongest — so a firing `LOC_GAIT9` switches the creature from the default walk (gait 0) to the uphill-walk animation (gait 9) |

Upatrophin has **no other receptors** — nothing else in the stock genome reads it. It is a single-purpose signal with one sensor and one actuator.

## Role in Game Mechanics

### The slope-to-animation pipeline

The full path from physical terrain to on-screen gait change is a four-stage chain, half physics / half biochemistry:

```
 Skeleton physics step (every tick)
     │
     │  TestNewUpFootInRoomSystem() measures slope under the up-foot
     │  writes gradientUphill → myUpslopeLocus (float 0..1)
     │
     ▼
 Emitter 18  (LOC_UPSLOPE → Upatrophin)
     │  threshold 48, digital fixed-gain at 255, rate every 2 ticks
     │
     ▼
 Upatrophin [18]   (half-life 5 ticks, very short)
     │  accumulates for ~2–3 ticks of sustained emission before crossing threshold
     │  evaporates within ~15 ticks once emission stops
     │
     ▼
 Receptor 191  (Upatrophin → LOC_GAIT9)
     │  threshold 77 (~30 % of range), digital all-or-nothing, output 255
     │
     ▼
 myGaitLoci[9]   (sensorimotor gait-selection locus)
     │
     ▼
 Skeleton::Walk()   picks strongest gait locus, plays myGaitTable[that index]
     │
     ▼
 Animation string   (defined in the creature's ATT / gait table — e.g. gait 9 = "walking uphill")
```

Each arrow is either a physics measurement, a genome-defined emitter/receptor gene, or a float/chemical store. The stage where the chemical mediator is inserted turns what could have been a direct `if (upslope > X) use_gait_9` into a **filtered, genetically-tunable** signal: community genomes can independently adjust the emitter threshold (how steep before the switch starts), the chemical's decay rate (how quickly it evaporates — i.e. how much terrain-history to integrate), the receptor threshold (how confident to be before switching), and even the existence of Upatrophin altogether (breed a Norn with gene 41 or 191 deleted and they just never animate an uphill walk — they'll still physically climb slopes using the default gait).

### Why a chemical mediator instead of a direct locus wire?

The rest of the engine could equally well hard-wire `LOC_UPSLOPE` → `LOC_GAIT9` without a chemical step. The genome's authors chose the chemical path for four reasons:

1. **Debounce / hysteresis.** Emitter fires at ~19 % slope, chemical builds up over ~2 ticks, receptor fires at ~30 % of the chemical's range. This means a brief slope bump (one tick of 20 % gradient as the foot crosses a step) isn't enough to trigger gait-9 — you need a sustained ascent, which is exactly what the animation is meant to depict. A direct wire would flap the gait on every fractional-tick slope wobble.
2. **Tail-off smoothing.** The 5-tick half-life means the chemical lingers for ~15 ticks after the slope ends, giving the animation a brief "crest" window at the top of a hill instead of snapping back to the neutral walk instantly.
3. **Tunability via genome.** Both the emitter threshold and the receptor threshold, plus the chemical's decay rate, are genome-editable. A breeder who wants a Norn that's more laboured on climbs can raise the decay rate (longer after-effect) and/or lower the receptor threshold (trigger on gentler slopes) without touching any engine code.
4. **Uniformity with the chemistry substrate.** All nervous-system modulators in Creatures — drives, emotions, sensor readings — go through the same emitter → chemical → receptor pipeline. Using that same pipeline for gait control keeps the engine homogeneous and allows tools like the chemistry tab of the debug console, the catalogue injector, and mutation machinery to treat gait signals just like any other chemical.

### The Downatrophin / Upatrophin pair

Upatrophin (18) and Downatrophin (17) are **functionally symmetric twins**, sharing identical genome values (seed matching chemical index, half-life 5, decay 0.879), identical emitter settings (threshold 48, rate 2, gain 255, DIGITAL), and identical receptor settings (threshold 77, gain 255, DIGITAL) — only the locus wiring differs:

| Chemical | Emitter reads | Receptor drives | Semantic |
|---|---|---|---|
| Downatrophin (17) | `LOC_DOWNSLOPE` (11) | `LOC_GAIT8` (16) | Descending a slope — play gait 8 |
| Upatrophin (18) | `LOC_UPSLOPE` (10) | `LOC_GAIT9` (17) | Ascending a slope — play gait 9 |

They therefore cover the two directions of slope traversal with two independent chemical channels that can never compete (a creature is either going up or going down a given slope; the one not firing decays away immediately). The stock genome reserves no other chemicals that write to `LOC_GAIT8` or `LOC_GAIT9`, so these two gait-slots are effectively dedicated to the slope-walk animations.

### Gait selection in `Skeleton::Walk()`

The crux of how Upatrophin matters is this gait-selection loop:

```text
Walk():
    Strength = 0
    Choice   = 0                              # default: gait 0
    for i in 0 .. MAX_GAITS-1:
        if myGaitTable[i][0]:                 # gait i has an animation defined
            if myGaitLoci[i] > Strength:      # and is stronger than current best
                Strength = myGaitLoci[i]
                Choice   = i
    SetAnimationString(myGaitTable[Choice])   # play the winning gait's animation
```

Three things follow from this:

- **Gait selection is winner-takes-all.** If both `LOC_GAIT9` (up-slope) and some other gait receptor happen to fire at the same time, whichever has the higher `myGaitLoci[]` value wins. Because Upatrophin drives its receptor at gain 255 (maximum), gait-9 will always beat any partially-firing receptor once the uphill threshold is crossed.
- **Missing gait-table entries disable the feature.** If a creature's body data doesn't define an animation string for gait 9 (`myGaitTable[9][0] == 0`), the `if` guard skips it even when Upatrophin is high — the creature simply keeps walking with the default animation while physically climbing. This is the escape hatch for creatures whose animation sheets don't include an uphill walk.
- **The default gait is gait 0.** With Strength starting at 0 and the loop only replacing Choice when a **strictly greater** locus value is found, gait 0 is the fallback — it plays whenever no gait receptor is above noise. Upatrophin's digital 255-gain therefore cleanly overrides it whenever the creature is actually on an uphill gradient.

### Interaction with the rest of the movement system

Upatrophin is sensory-only — it does not itself move the creature, apply physics forces, or change speed. That work is done by the `Skeleton::Walk()` logic, by the skeleton's pose-direction calculations, and by the foot-placement physics in `Map::TestNewUpFootInRoomSystem()`. Upatrophin's sole effect is on the **animation string** (`SetAnimationString`), which the skeleton frames against in subsequent ticks to produce the visible limb poses. A Norn climbing a slope with Upatrophin firing still moves at the same horizontal speed as one on flat ground; only the foot and body poses change.

### Why the chemical has a small non-zero initial concentration

Most signalling chemicals in Creatures are born at 0. Upatrophin is born at **18 / 256 (~7 %)**, below the receptor threshold of 77 (~30 %), so the initial concentration does **not** trigger gait-9 at birth. The non-zero seed appears to be a compatibility artefact — the genome tooling may have defaulted the initial concentration to match the chemical's own index (Downatrophin 17 seeds at 17, Upatrophin 18 seeds at 18), and because the value is well below the receptor threshold it has no gameplay consequence. A baby Norn lying on flat ground will nevertheless have Upatrophin decay from 18 down toward 0 over the first ~35 ticks of life and stay there until the child first walks up a slope.

### Practical consequences for gameplay

- **The slope-walk animations only trigger when slopes are steep enough.** The emitter threshold of 48/256 corresponds to an uphill gradient of roughly 19 % — slight undulations in the Norn terrarium floor won't trigger gait-9. A creature walking across a gently sloping Shee ship deck will use the default gait; one climbing out of a pit or up a ramp into an upper zone will switch to gait 9.
- **`CHEM TARG 18 255` forces the uphill animation on flat ground.** Because the pathway is purely chemistry-mediated, injecting Upatrophin directly via the CAOS `CHEM` command will make a Norn play the uphill-walk animation regardless of terrain. This is handy for visual debugging of body-data animation sheets without having to set up a slope in the metaroom.
- **`CHEM TARG 18 0` cancels the uphill animation mid-climb.** Similarly, zeroing the chemical while the creature is on a slope will immediately snap it back to the default gait (at least until the emitter refires on the next even-numbered tick, i.e. within ~2 ticks). Useful when testing whether an animation-related bug is caused by Upatrophin or by the physics layer.
- **Genome editing use-cases.** Breeders who want a Norn that animates laboriously on every tiny incline can lower both the emitter's threshold (below 48) and the receptor's threshold (below 77); breeders who want a Norn that only uses the uphill animation on steep climbs can raise them. Raising the chemical's half-life (lowering the decay rate towards 1.0) makes the animation linger noticeably after a slope ends — useful for breeds whose "recovery posture" at the top of a hill should read visually.
- **Turning off the signal entirely.** Deleting gene 41 (the emitter) or gene 191 (the receptor) disables the whole up-slope animation pathway without affecting any other chemical or behaviour. Such a Norn physically climbs slopes identically but visually uses the default walk cycle going uphill — a minor cosmetic difference that is safe to experiment with.
- **The Reference column in the debug console.** Because Upatrophin has `halfLifeInTicks: 5`, the chemistry tab renders it with a near-instantaneous decay graph. Watching the trace while a creature walks over a series of slopes produces a characteristic square-wave pattern — flat-zero on level ground, spiking to ~255 on each climb, decaying back within a handful of ticks at the top. It is one of the cleanest visual diagnostic signatures in the whole chemical panel, and inversely correlates with Downatrophin as the creature traverses rolling terrain.

### Summary

Upatrophin is a **pure-signalling, non-metabolic chemical** whose entire lifecycle is:

```
  Skeleton physics — measures uphill gradient under the up-foot
           │
           ▼  LOC_UPSLOPE
  Emitter 18 (gene 41) — digital pulse at 255 when slope > ~19 %
           │
           ▼
  Upatrophin [18]   • no reactions  • no other receptors
                    • half-life 5 ticks  • newborn seed 18/256
           │
           ▼
  Receptor 191 (gene 191) — fires LOC_GAIT9 at 255 once Upatrophin > ~30 %
           │
           ▼  myGaitLoci[9]
  Skeleton::Walk() — plays gait-9 animation if it's the strongest firing locus
```

Its single role in the creature's life is to answer the question "am I currently climbing a slope steep enough to switch to the uphill walk animation?" — a yes/no signal that the biochemistry system happens to implement with a chemical for hysteresis, tunability and architectural uniformity with the rest of the nervous-system modulators.
