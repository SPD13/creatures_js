# Gaits

A **gait** is a creature's walking animation — the specific sequence of body poses played in a loop while the creature is locomoting. Each creature can store up to **16 different gaits** (normal walk, fast walk, slow walk, limp, shuffle, bounce, etc.), and which one plays at any moment is decided by **biochemistry**, not by code. Chemicals compete across the 16 gait slots; whichever has the strongest receptor signal wins, and its animation plays.

This makes locomotion an *emergent* property of internal state: a hungry creature can shuffle, an excited one can bounce, an injured one can limp — all without any explicit `if (tired) useSlowWalk()` logic anywhere in the engine.

---

## What a Gait Is, Concretely

A gait is two things glued together:

| Part | What it is | Stored in |
|------|-----------|-----------|
| **Animation string** | A string of 3-digit pose indices ending in `R` (e.g. `"013014015016R"`) | `Skeleton.myGaitTable[16][...]` |
| **Strength (locus)** | A float 0.0–1.0 indicating how much "vote" this gait currently has | `Skeleton.myGaitLoci[16]` |

The strings are written once at birth (from the genome). The strengths are rewritten *every biochemistry tick* by the receptor system.

```
Slot   Animation String        Locus Strength
────   ──────────────────      ──────────────
 0     "013014015016R"         0.00   ← normal walk (default)
 1     "014016R"               0.00   ← fast walk
 2     "013013014014R"         0.42   ← slow walk (winning)
 3     ""                      0.00   ← undefined slot
 …
15     ""                      0.00
```

In this snapshot, slot 2 has the strongest signal, so the creature would walk slowly.

---

## Layer 1: Poses — What the 3-Digit Numbers Mean

Each 3-digit chunk inside an animation string (e.g. `013`) is **not** a frame number — it's an index into the creature's **pose table**, `myPoseStringTable[256]`. A pose, in turn, is a 15-character string where each character specifies an angle for one part of the skeleton:

```text
// pose-string positions
_DIRN, _HEAD, _BODY,
_LTHIGH, _LSHIN, _LFOOT,
_RTHIGH, _RSHIN, _RFOOT,
_LHUMERUS, _LRADIUS,
_RHUMERUS, _RRADIUS,
_TAILROOT, _TAILTIP
```

Each character is normally a digit (`0`–`3`) selecting one of four angles for that limb. Position `_DIRN` carries the facing direction (`0`=North, `1`=South, `2`=East, `3`=West). Some characters can be `X` (don't change this limb), and pose strings may use `?` or `!` for dynamic head/body control — but those special chars live in **pose** strings only, never in **animation** strings.

Pose strings are themselves loaded from **POSE genes** during genome expression. So at the deepest level:

```
POSE gene   →   pose string  ("113022113022...")  →  index in pose table
GAIT gene   →   animation string  ("013014015016R")  →  sequence of pose indices
Receptor    →   gait locus value  →  picks which animation string is active
```

---

## Layer 2: The Animation String — Format and Playback

### Format

An animation string is a tightly-packed run of 3-digit pose indices, terminated by `R`:

```
"013014015016R"
 │  │  │  │  └── R = loop back to start
 │  │  │  └───── pose 016
 │  │  └──────── pose 015
 │  └─────────── pose 014
 └────────────── pose 013
```

The animation-string validator only accepts digits `0`–`9` and the single terminator `R`. There is no `S` (stop), no `!`, no branching, no per-frame metadata. The string is a flat repeating loop of pose targets.

If `R` is omitted, playback halts when it walks past the last pose (the pointer hits `\0`). All stock gaits use `R`.

### Playback Is Pose-Target-Driven, Not Frame-Driven

A common misconception: animation strings do **not** advance one pose per tick. Instead, each pose is a *target* that the skeleton interpolates toward. The pointer only advances to the next pose once the current target has been reached:

```text
// Skeleton update — animation pointer advance
if animationPointer is set and HasTargetPoseStringBeenReached():
    if not standStill:
        animationPointer += 3        // advance to next 3-digit pose
    if animationPointer points at 'R':
        animationPointer = animationString   // loop
```

This is why creatures with stiff limbs (low movement speed) appear to walk slowly: the same animation string is playing, but each pose takes longer to reach, so the pointer advances less often. The pacing is emergent from the limb dynamics, not from any frame timer.

---

## Layer 3: The Genome — Where Gaits Come From

### Gait Genes

The genome holds **gait genes** (`G_GAIT`). Each gene specifies one gait slot and up to 8 pose indices:

```text
// gait gene expression
j = GetCodon(0, MAX_GAITS - 1)              // slot 0–15
for i in 0..7:
    c = GetCodon(0, MAX_POSES - 1)          // pose number
    if c == 0: break                        // 0 terminates the gait
    myGaitTable[j][3*i]   = digit (c/100)
    myGaitTable[j][3*i+1] = digit (c/10)%10
    myGaitTable[j][3*i+2] = digit c%10
myGaitTable[j][3*i] = 'R'                    // append loop terminator
```

Three constraints follow from this:

- A gait is at most **8 poses** long.
- Pose number `0` is reserved as the gene-level terminator (so pose 0 cannot appear inside a gait).
- Every gait expressed from genes is automatically looping (`R`).

### Receptor Genes — Wiring Chemicals to Gaits

Separately, **receptor genes** wire chemical concentrations into gait loci. Each gait locus has its own constant in the sensorimotor tissue:

```
LOC_GAIT0   = 8     ← TISSUE_SENSORIMOTOR
LOC_GAIT1   = 9
 …
LOC_GAIT15 = 23
```

A receptor gene declares: *"watch chemical X; when its concentration exceeds threshold T, write `(concentration - T) * gain` into locus `LOC_GAIT_n`"*. That's the same mechanism used by drive receptors, action receptors, and every other biochemistry → behaviour link. Gaits aren't special; they're just one more destination tissue.

### Default Initialization

Before any gene expression, all 16 slots are seeded with the same fallback string:

```
"013014015016R"
```

This guarantees `Walk()` always has *something* to play, even on a creature with no gait genes at all.

---

## Layer 4: Selection — `Skeleton::Walk()`

`Walk()` is the function that picks a gait and starts it playing. It is called explicitly — from the `WALK` CAOS command in creature decision scripts, **not** automatically every tick. The flow is:

1. A creature's decision script (Brain → Decision lobe → MotorFaculty → CAOS action script) reaches a state where it wants to start walking, and emits `WALK`.
2. `Skeleton::Walk()` runs: it scans all 16 gait slots and selects the one with the strongest locus.
3. That gait's animation string is installed as the current animation.
4. From then on, `Skeleton::Update()` ticks the pose pointer along until something else (`STOP`, a new action) replaces the animation.

```text
// Walk
Strength = 0.0
Choice = 0                              // default to slot 0
for i in 0..MAX_GAITS-1:
    if myGaitTable[i] is defined:       // slot defined?
        if myGaitLoci[i] > Strength:    // strongest so far?
            Strength = myGaitLoci[i]
            Choice = i
SetAnimationString(myGaitTable[Choice])
```

Two important consequences:

- **Selection happens at the start of walking, not every tick.** Once a gait is chosen, it plays to completion (or until cancelled). Changing chemistry mid-stride doesn't switch gaits — the next `WALK` invocation will.
- **All-zero loci → slot 0 wins.** Because `Choice` is initialised to 0 and the loop only updates on strictly greater, an unstimulated creature falls back to gait 0. This is the *failsafe*: even with no chemistry at all, walking still works.

---

## Layer 5: Emitter Loci — Reading Gait Back as Chemistry

Each gait locus is also exposed as an **emitter** (`LOC_E_GAIT0`–`LOC_E_GAIT15`), pointing at the same `myGaitLoci[n]` cell. This lets the biochemistry system *read* the current gait strength and convert it into chemical production. A genome engineer can use this to:

- Burn glycogen while a fast gait is active (`LOC_E_GAIT_fast` → emit "tiredness" chemical).
- Produce adrenaline when bouncing (`LOC_E_GAIT_bounce` → emit adrenaline).
- Create homeostatic feedback (an excited gait increases a chemical that, via a receptor on another gait, eventually transitions the creature into a calmer style).

Whether stock genomes actually wire these emitters varies. The mechanism is always present.

---

## The Full Pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│  ONE-TIME (Birth / Gene Expression)                                 │
│                                                                     │
│    POSE genes   ──► myPoseStringTable[0..255]   (limb angle data)   │
│    GAIT genes   ──► myGaitTable[0..15]          (animation strings) │
│    Receptor     ──► binds chemical N → myGaitLoci[k]   (live ref)   │
│    genes                                                            │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│  EVERY BIOCHEMISTRY TICK                                            │
│                                                                     │
│    for each receptor:                                               │
│        signal = clamp((chemicals[chem] - threshold) * gain, 0, 1)   │
│        *(receptor.dest) = signal      ← writes into myGaitLoci[k]   │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│  ON EACH `WALK` (CAOS command from decision script)                 │
│                                                                     │
│    pick i with max(myGaitLoci[i]) where myGaitTable[i] is defined   │
│    SetAnimationString(myGaitTable[i])                               │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│  EVERY SKELETON UPDATE                                              │
│                                                                     │
│    if current pose target reached:                                  │
│        animationPointer += 3                                        │
│        if *animationPointer == 'R': animationPointer = base         │
│    interpolate limbs toward pose at *animationPointer               │
└────────────────────────────────────────────────────────────────────┘
```

---

## Storage Layout

| Field | JS Rebuild | Size |
|-------|-----------|------|
| Pose table | `string[]` (length 256) | 256 poses × 15 chars |
| Gait table | `string[]` (length 16) | 16 slots × 25-char strings |
| Gait loci | `number[]` (length 16) | 16 × float32 |
| Animation pointer | `number` index | — |
| Current animation | `string myAnimationString` | — |

Both `myGaitTable` and `myGaitLoci` live on the **Skeleton**. In the original engine, `Creature` inherits from `Skeleton`, so they're direct members. In the JS rebuild, `Creature` has a `skeleton` property.

### Family-file Serialization

Gait data is serialized as part of the Skeleton block of `.family` files:

| Field | Format | Size |
|-------|--------|------|
| Gait table | 16 fixed-length strings (92 bytes each) | 1,472 bytes |
| Gait loci | 16 × float32 | 64 bytes |

The JS family parser locates this block by pattern-matching on the structure of valid gait strings (digits + `R`) followed by 16 floats.

---

## JavaScript Rebuild Notes

The JS rebuild mirrors the original skeleton closely. Key counterparts:

| Concept | JS Location |
|---------|-------------|
| `Walk` / gait selection | `Rebuild/Main_Game/src/engine/creature/skeleton/Skeleton.js` — `walk()` (~line 2033) |
| `selectGait` (inlined in the original) | `selectGait()` companion |
| `SetAnimationString` | `setAnimationString()` (~line 1852) — same digit + `R` validation |
| Pointer-advance loop | `advanceAnimationIfTargetReached()` (~line 1914) — replicates the original advance logic exactly |
| Gait gene expression | `Creature.js` (~lines 900–934) |
| Locus address binding | `Creature.js` (~lines 227–231) — returns a getter/setter pair that aliases `myGaitLoci[n]` |
| Receptor processing | `Organ.js` (~lines 707–723) |

There is **no frame-counter logic** in the JS rebuild either — playback is pose-target-driven exactly as in the original. The JS comments document the matching logic throughout.

---

## Why You Often See Loci Stuck At Zero

It is common to inspect an imported creature and find every `myGaitLoci[i]` at `0.0`. This is not a bug:

1. **The genome must actually contain receptor genes targeting `LOC_GAIT0–15`.** Many genomes don't bother — they ship one default walk and leave the other 15 slots unused.
2. **The source chemicals must be non-zero.** A receptor watching chemical 73 produces nothing if chemical 73 is at 0.0.
3. **The threshold must be cleared.** `signal = (concentration − threshold) × gain` — below threshold the result is clamped to zero.
4. **The default still works.** Gait 0 always wins when all loci are zero. The system is designed to degrade gracefully.

If you want a creature to limp, shuffle, or bounce, the work happens in the genome — wire a chemical to a non-zero gait slot, define a distinct animation in that slot, and the engine will pick it up automatically.

---

## Key Insights

1. **Gaits are biochemistry-driven, not code-driven.** There is no decision tree mapping creature state to walking style. Chemicals compete via receptors; the strongest signal wins. The selection logic is six lines long.

2. **The 16 slots are a hardware-style design.** They're like 16 GPU registers for animations: cheap to scan, no allocation, no branching, and easy to wire up genetically.

3. **Animation is pose-target-driven, not frame-driven.** This is the single most counter-intuitive thing about the system. There is no animation clock. The pose pointer advances only when the skeleton has finished interpolating toward the current target, so animation speed emerges naturally from limb dynamics.

4. **Gait 0 is a contract.** Slot 0 is the universal fallback: pre-seeded with a valid walk cycle, defaulted to in `Walk()` when all loci are zero, and overwritten by genome expression only if a `G_GAIT` gene chooses index 0. Treat it as the "must always work" slot.

5. **Same mechanism as drives and actions.** Gait loci, drive loci, and involuntary-action loci all share one machinery: receptor genes → tissue loci → consumer subsystem. Once you understand one, you understand them all.

6. **Bidirectional via emitters.** Each gait locus can be read back as chemistry through its emitter twin (`LOC_E_GAIT_n`), enabling feedback loops where the act of walking in a particular style produces chemicals that affect future choices.

---

## Key Files

| Component | JS Rebuild |
|-----------|-----------|
| `Walk` / gait selection | `Skeleton.js` `walk()` |
| Gait gene expression | `Creature.js` (~900) |
| Animation pointer advance | `Skeleton.js` `advanceAnimationIfTargetReached()` |
| `SetAnimationString` validation | `Skeleton.js` `setAnimationString()` |
| Locus address binding | `Creature.js` (~227) |
| Receptor processing | `Organ.js` (~707) |
| Locus constants | `BiochemistryConstants.js` |
| Pose table & enum | `Skeleton.js` (`myPoseStringTable`) |
| Family-file parsing | `Libraries/family-parser.js` |
| CAOS `WALK` callers | corresponding CAOS command modules |
