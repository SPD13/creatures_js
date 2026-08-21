# Expressive Faculty

The **ExpressiveFaculty** translates a creature's internal drive levels into visible facial expressions. It is the creature's face — selecting from six expression types based on genome-defined drive weightings, handling smooth expression transitions through a neutral state, and controlling eye blinking tied to sleepiness.

Unlike most faculties, the ExpressiveFaculty has **no locus system** and no biochemistry binding. Its genome integration is limited to reading `G_EXPRESSION` genes that define how drives map to expressions. The faculty produces two outputs each tick: a facial expression index (0–5) and an eye state (open or closed).

## Position in the Faculty System

ExpressiveFaculty is **faculty index 6** — it updates after the ReproductiveFaculty (index 5) and before the MusicFaculty (index 7).

```
Faculty Update Order:
  0  SensoryFaculty     (perceive)
  1  Brain              (think)
  2  MotorFaculty       (act)
  3  LinguisticFaculty  (speak)
  4  Biochemistry       (metabolise)
  5  ReproductiveFaculty (reproduce)
  6  ExpressiveFaculty  (express)    ◀
  7  MusicFaculty       (music)
  8  LifeFaculty        (age/die)
```

The position after Biochemistry is architecturally relevant: drive levels must be up-to-date before the expression calculation runs, and the ExpressiveFaculty must set the face before the rendering system draws the creature.

## Core Data Structures

### Expression Weightings

Two arrays define the expression system, both populated from the genome:

```
myExpressionWeightings[EXPR_COUNT]                          — overall weight per expression
myDriveWeightingsForExpressions[EXPR_COUNT][NUMDRIVES]      — per-drive weight per expression
```

Both are initialised to 0.0 in the constructor and filled by `ReadFromGenome()`.

The overall weighting acts as a **gain multiplier** — it scales the entire drive calculation for that expression, controlling how "excitable" each expression is relative to others.

### Expression Types

Six expressions are defined, with six more that were defined but cut before release:

| Index | Constant | Description | Ear Set |
|-------|----------|-------------|---------|
| 0 | `EXPR_NORMAL` | Neutral/default face | `EARS_ANGRY` (upright) |
| 1 | `EXPR_HAPPY` | Happy/smiling | `EARS_ANGRY` (upright) |
| 2 | `EXPR_SAD` | Sad/frowning | `EARS_DROOPY` |
| 3 | `EXPR_ANGRY` | Angry/scowling | `EARS_ANGRY` (upright) |
| 4 | `EXPR_SURPRISE` | Surprised/wide-eyed | `EARS_PRICKED` |
| 5 | `EXPR_SLEEPY` | Sleepy/drowsy | `EARS_DROOPY` |

The ear set names are somewhat misleading — `EARS_ANGRY` (index 2) represents upright, alert-looking ears and is the default for most expressions. The ear set is determined by `CreatureHead::SetHeadImage()`, not by the ExpressiveFaculty itself.

### Cut Expressions

Six additional expressions were planned but never implemented:

```text
EXPR_VERY_SLEEPY     // 6
EXPR_VERY_HAPPY      // 7
EXPR_MISCHEVIOUS     // 8  (sic)
EXPR_SCARED          // 9
EXPR_ILL             // 10
EXPR_HUNGRY          // 11
```

The CAOS documentation for `EXPR` still lists all 12 entries (0–11), but only indices 0–5 are functional. Dormant logic in `Update()` would have fired script event 199 (`SCRIPT_ILL_FACE`) when `EXPR_ILL` was selected — this was never activated.

### Ear Sets

Four ear positions are available, selected automatically based on the current expression:

| Index | Constant | Visual |
|-------|----------|--------|
| 0 | `EARS_NORMAL` | Default position |
| 1 | `EARS_DROOPY` | Hanging down (sad, sleepy) |
| 2 | `EARS_ANGRY` | Upright/alert (normal, happy, angry) |
| 3 | `EARS_PRICKED` | Fully forward (surprised) |

## Genome Integration

### G_EXPRESSION Gene Format

Expression genes are creature genes with type `CREATUREGENE` and subtype `G_EXPRESSION`. Each gene defines the drive-to-expression mapping for one expression:

```
Gene header     — standard gene header (handled by GetGeneType)
expressionId    — GetCodonLessThan(6): which expression (0–5)
spare           — GetByte(): unused byte
overallWeight   — GetFloat(): byte/255, range 0.0–1.0
4× drive pairs:
  driveId       — GetByte(): drive index (0–19, or invalid if ≥ NUMDRIVES)
  driveWeight   — GetSignedFloat(): codon(0,248)/124 - 1.0, range -1.0 to +1.0
```

Each gene specifies **up to 4 drive influences** for one expression. Multiple genes can target the same expression — each overwrites the previous one (the drive weightings are reset to 0.0 before reading each gene's 4 pairs).

### Gene Reading Process

```
1. Reset genome cursor
2. While more G_EXPRESSION genes exist:
   a. Read expressionId (0–5)
   b. Skip spare byte
   c. Read overall weight (0.0–1.0)
   d. Reset ALL drive weights for this expression to 0.0
   e. Read 4 (driveId, driveWeight) pairs:
      - If driveId >= NUMDRIVES (20): skip this pair
      - Otherwise: set myDriveWeightingsForExpressions[expressionId][driveId] = driveWeight
```

### Typical Genome Configuration

A typical Norn genome might define:

- **EXPR_HAPPY** (1): positively weighted to sex drive, negatively to pain and fear
- **EXPR_SAD** (2): positively weighted to loneliness and hunger, negatively to sex drive
- **EXPR_ANGRY** (3): positively weighted to anger and crowdedness
- **EXPR_SURPRISE** (4): positively weighted to fear
- **EXPR_SLEEPY** (5): positively weighted to sleepiness and tiredness

`EXPR_NORMAL` (0) typically has a zero or near-zero overall weight, making it the fallback when no other expression scores higher than its initial -999.0 threshold.

## The Update Cycle

Each creature tick, `update()` performs two tasks: blinking and expression selection.

### Step 1: Blinking System

The blink rate is influenced by sleepiness:

```
iBlinkRate = (BLINKRATE + 1) - FastFloatToInteger(sleepiness / 8.0)
```

Where `BLINKRATE = 32`. Since drive levels are 0.0–1.0, the `sleepiness / 8.0` term is always 0.0–0.125, and after integer truncation the blink rate stays at 33 for all practical sleepiness levels. The design intent may have been for a wider drive range, or the minimal effect may be intentional — sleepy creatures close their eyes entirely (via LifeFaculty state transitions) rather than blinking faster.

Eye state is then determined:

```
if NOT (alert OR zombie):
    eyes = CLOSED              (sleeping, unconscious, or dead)
else if Rnd(iBlinkRate) == 0:
    eyes = CLOSED              (random blink, ~1/34 probability per tick)
else:
    eyes = OPEN
```

The `Rnd(n)` function returns 0 to n **inclusive** (n+1 possible values), giving a blink probability of `1/(iBlinkRate + 1)` ≈ 2.94% per tick at the default rate. At 20 ticks per second, this produces roughly one blink every 1.7 seconds — close to the human average of once every 2–3 seconds.

Zombie creatures keep their eyes open — this is the only state where a non-alert creature can have open eyes, creating the characteristic vacant stare.

### Step 2: Expression Calculation

The winning expression is determined by `calculateExpressionFromDrives()`:

```
bestExpression = EXPR_NORMAL
bestScore = -999.0

for each expression e (0 to 5):
    score = 0.0
    for each drive d (0 to 19):
        score += driveWeight[e][d] * (driveLevel[d] - 0.5)
    score *= overallWeight[e]

    if score > bestScore:
        bestScore = score
        bestExpression = e

return bestExpression
```

#### The 0.5 Centering

The critical detail is `(driveLevel - 0.5)`. By centering drives around 0.5, the system allows **signed drive weights** to work correctly:

- A drive at 0.0 contributes `-0.5 * weight` (low drive pushes opposite to weight sign)
- A drive at 0.5 contributes `0.0` (neutral — no contribution)
- A drive at 1.0 contributes `+0.5 * weight` (high drive pushes in weight direction)

This means a positive weight for fear on the surprise expression will increase the surprise score when fear is high (> 0.5) and decrease it when fear is low (< 0.5). Without the centering, all non-zero drives would always push in the weight's direction.

#### Winner-Takes-All

The expression with the highest score wins. If all scores are below -999.0 (the initial threshold), `EXPR_NORMAL` is returned by default. In practice, this happens when all expression weights are 0.0 (no genome data loaded).

### Step 3: Smooth Transition

Expression changes always pass through `EXPR_NORMAL` as an intermediate state:

```
if newExpression != currentExpression:
    if currentExpression != EXPR_NORMAL:
        set EXPR_NORMAL              (first: return to neutral)
    else:
        set newExpression            (then: transition to target)
```

This means changing from HAPPY to SAD takes **two update ticks**: HAPPY → NORMAL → SAD. The transition through neutral prevents jarring visual jumps between extreme expressions and gives the sprite system a clean frame between expression sprite sets.

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `EXPR_COUNT` | 6 | Number of active expression types |
| `NUMDRIVES` | 20 | Number of drives in the weighting array |
| `BLINKRATE` | 32 | Base blink rate (Rnd range parameter) |
| `SCRIPT_ILL_FACE` | 199 | Unused script event for illness expression (cut content) |

## CAOS Interface

### EXPR (Integer RV)

Returns the current facial expression index (0–5):

```caos
setv va00 expr    * Get current expression of TARG creature
```

### FACE (Command)

Forces a specific facial expression on the target creature, bypassing the drive-based calculation:

```caos
face 1    * Force TARG creature to look happy
```

The forced expression persists until the next `update()` tick, when `calculateExpressionFromDrives()` may override it. To maintain a forced expression, the FACE command must be issued repeatedly (e.g., in a timer script).

### FACE (Integer RV)

Returns the front-facing sprite index for the current facial expression. This is a rendering helper, not the expression index itself:

```text
// calculates sprite offset
index = GetOverlayIndex(REGION_HEAD)
index = index / 16              // which expression set
return (index * 16) + 9         // front-facing frame within that set
```

## Serialisation

### Binary Format (Archive)

The Write/Read methods serialise the faculty state in interleaved order:

```
1. base::Write/Read         (Faculty base class — creature handle reference)
2. For each expression (0 to EXPR_COUNT-1):
   a. myExpressionWeightings[i]                        (float)
   b. myDriveWeightingsForExpressions[i][0..NUMDRIVES-1] (NUMDRIVES floats)
```

Total data per expression: 1 + 20 = 21 floats. Total expression data: 6 × 21 = 126 floats (504 bytes) plus base class overhead.

The interleaved order (expression weight followed immediately by its drive weights) differs from a layout that groups all expression weights first — the serialisation must follow this exact sequence to match the original save files.

### PRAY/CREA Import

When importing a creature from a `.creature` file, the expression and drive weightings are extracted from the serialised CREA block data by the family-parser library and restored via `restoreExpressiveState()`. Restored values are preserved across subsequent `readFromGenome()` calls using a `_wasRestored` flag.

## Source Files

| File | Description |
|------|-------------|
| `Rebuild/Main_Game/src/engine/creature/faculties/ExpressiveFaculty.js` | JS rebuild implementation |
| `Rebuild/Main_Game/src/engine/creature/CreatureConstants.js` | JS — EXPR_COUNT, BLINKRATE, expression enums |
| `Rebuild/Main_Game/src/engine/caos/commands/creatures/EXPR.js` | JS — EXPR CAOS command |
