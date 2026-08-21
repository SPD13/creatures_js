# Music Faculty

The **MusicFaculty** is the creature's interface to the dynamic music system. It is the simplest of all nine faculties — completely stateless, with no genome integration, no locus bindings, and an empty `update()`. Its only purpose is to provide four on-demand query methods that calculate **mood**, **threat**, **selectability**, and **hatching** status from other creature systems.

These values feed two consumers: the **situation lobe** in the creature's brain (neurons 7 and 8), and the **MusicManager** which aggregates mood and threat across all visible creatures to drive the procedural MNG soundtrack.

## Position in the Faculty System

MusicFaculty is **faculty index 7** — it updates after the ExpressiveFaculty (index 6) and before the LifeFaculty (index 8). In practice, its `update()` is empty, so its position in the update order has no runtime effect.

```
Faculty Update Order:
  0  SensoryFaculty     (perceive)
  1  Brain              (think)
  2  MotorFaculty       (act)
  3  LinguisticFaculty  (speak)
  4  Biochemistry       (metabolise)
  5  ReproductiveFaculty (reproduce)
  6  ExpressiveFaculty  (express)
  7  MusicFaculty       (music)        ◀
  8  LifeFaculty        (age/die)
```

Despite having an empty update, MusicFaculty's query methods are called by other systems at their own update frequencies — SensoryFaculty calls `mood()` and `threat()` every creature tick when writing brain inputs, and AgentManager calls all four methods periodically to feed the MusicManager.

## Core Design

### Stateless Architecture

MusicFaculty is unique among faculties: it stores **no member variables**. Every method computes its return value on-the-fly from the creature's current state:

- `mood()` reads from the 14 drive levels
- `threat()` reads a single drive level (fear)
- `selectableByUser()` reads a game variable and the creature's genus
- `hatching()` reads the life state and age

This means there is nothing to initialise, nothing to serialise (beyond the base Faculty class), and nothing to keep in sync. The Read/Write methods simply delegate to the base Faculty's `Read()`/`Write()`.

### No Genome Integration

MusicFaculty has no `readFromGenome()` implementation and no corresponding genome gene type. The mood formula uses hardcoded weights — they are not evolvable through genetics.

### No Locus System

MusicFaculty has no `GetLocusAddress()` implementation. It cannot be bound to biochemistry receptors or emitters. The mood calculation reads drive levels directly, bypassing the locus indirection that other faculties use.

## The Four Query Methods

### mood() — Weighted Drive Aggregation

Calculates the creature's overall emotional state as a float in the range 0.0 (very sad) to 1.0 (very happy). Dead creatures always return 0.0.

#### Algorithm

The mood is computed from all 14 drives using a weighted sum with fixed influence constants:

| Drive | Index | Weight | Constant | Effect on Mood |
|-------|-------|--------|----------|----------------|
| Pain | 0 | -4 | `NNN` | Very negative |
| Hunger for Protein | 1 | -1 | `N` | Slightly negative |
| Hunger for Carbohydrate | 2 | -1 | `N` | Slightly negative |
| Hunger for Fat | 3 | -1 | `N` | Slightly negative |
| Coldness | 4 | -1 | `N` | Slightly negative |
| Hotness | 5 | -1 | `N` | Slightly negative |
| Tiredness | 6 | -1 | `N` | Slightly negative |
| Sleepiness | 7 | 0 | `0` | Neutral |
| Loneliness | 8 | -1 | `N` | Slightly negative |
| Crowdedness | 9 | -1 | `N` | Slightly negative |
| Fear | 10 | -2 | `NN` | Negative |
| Boredom | 11 | 0 | `0` | Neutral |
| Anger | 12 | -1 | `N` | Slightly negative |
| Sex Drive | 13 | +4 | `YYY` | Very positive |

The weight constants are defined as:

```
YYY =  4    (very positive)
YY  =  2    (positive)        — not used in mood, reserved
Y   =  1    (slightly positive) — not used in mood, reserved
N   = -1    (slightly negative)
NN  = -2    (negative)
NNN = -4    (very negative)
```

Note that `YY`, `Y` are defined but not used in the mood formula. Only `YYY`, `N`, `NN`, `NNN`, and `0` appear.

#### Calculation Steps

```
1. For each drive i (0..13):
     weight = InfluenceOnMood[i]
     iMood += (int)(driveLevel[i] * 256.0 * -weight)

     if weight > 0:  minMood += 255 * -weight
     else:           maxMood += 255 * -weight

2. range = maxMood - minMood
3. normalized = iMood - minMood
4. result = 1.0 - (normalized / range)
```

The formula scales drive levels (0.0–1.0) to integer range (0–255) via `* 256.0`, then negates the weight so that negative weights (bad drives like pain) produce positive contributions to `iMood` (moving it toward `maxMood`, which maps to low mood after the inversion in step 4).

The min/max bounds are computed from the weights alone (assuming drives can range 0–255), creating a theoretical range that normalises `iMood` to 0.0–1.0. The final `1.0 -` inversion means that high negative-weight drives produce low mood values.

#### Practical Example

A creature with all drives at 0.0 except pain at 1.0:

```
iMood = (int)(1.0 * 256.0 * 4) = 1024     (only pain contributes, -NNN = 4)

With these weights:
  minMood = 255 * -4 = -1020               (from SEXDRIVE's YYY weight)
  maxMood = 255*4 + 255*1*9 + 255*2 = 3825 (from NNN, all N's, and NN)

range = 3825 - (-1020) = 4845
normalized = 1024 - (-1020) = 2044
result = 1.0 - (2044 / 4845) ≈ 0.578
```

A creature in pain but with nothing else wrong is moderately unhappy (0.578), not maximally so — because only one of thirteen negative-weight drives is active.

#### Integer Truncation

The original code uses an integer cast for the intermediate multiplication, which truncates toward zero. The JS rebuild matches this with `Math.trunc()`:

```javascript
// JS — matches the original integer truncation toward zero
iMood += Math.trunc(driveLevel * 256.0 * -weight);
```

This matters when the weight is positive (SEXDRIVE, `YYY = 4`): the product is negative, and `Math.trunc(-3.7) = -3` while `Math.floor(-3.7) = -4`.

### threat() — Fear Drive Level

Returns the creature's fear drive level directly as a float in 0.0–1.0. This is the simplest method:

```text
Threat():
    return GetDriveLevel(FEAR)
```

```javascript
// JS
threat() {
    return this.myCreature.getDriveLevel(DRIVE_FEAR);  // index 10
}
```

No transformation, no weighting — raw fear.

### selectableByUser() — Norn Gating

Determines whether a creature should contribute to the music system's mood/threat aggregation. Returns `true` if:

1. The game variable `"Grettin"` is set to integer `1` (debug override — all creatures become selectable), **OR**
2. The creature's genus is Norn (`G_NORN = 1`)

The "Grettin" variable is the only known example of a hard-coded game variable name in the creature faculties — an acknowledged hack that the developers apparently never found a cleaner replacement for.

```text
// checks the game variable type before comparing
grettin = GetGameVar("Grettin")
if grettin.type == integer:
    if grettin.value == 1:
        return true
return (Genus() == G_NORN)
```

```javascript
// JS — type check matches the original behaviour
const grettin = creature.world.getGameVar('Grettin');
if (typeof grettin === 'number' && grettin === 1) {
    return true;
}
return classifier.genus === GENUS_NORN;
```

By default, only Norns affect the soundtrack. Grendels and Ettins are silent contributors — their drives do not influence the music system unless the debug override is enabled.

### hatching() — Baby Dreaming Detection

Returns `true` when a creature is both **dreaming** and at **baby age** (age stage 0). This combination indicates the creature is hatching from an egg — triggering special hatching music.

```text
Hatching():
    return (Life.GetWhetherDreaming() and Life.GetAge() == AGE_BABY)
```

Hatching creatures are **excluded** from the mood/threat aggregation by the AgentManager, preventing unhatched eggs from influencing the soundtrack.

## Integration Points

### Brain — Situation Lobe (situ)

The SensoryFaculty writes mood and threat into the situation lobe every creature tick during `updateSituationLobe()`:

```
situ neuron 7 (IP_MUSIC_MOOD)   ← creature.Music().mood()
situ neuron 8 (IP_MUSIC_THREAT) ← creature.Music().threat()
```

This allows the creature's neural network to respond to the soundtrack state. A creature hearing threatening music may experience increased fear through reinforcement learning pathways, creating a feedback loop: `fear drives → high threat → threatening music → situ input → brain → more fear`.

The full situation lobe input map:

| Neuron | Input | Source |
|--------|-------|--------|
| 0 | `IP_AGE` | LifeFaculty age stage |
| 1 | `IP_CARRYING_SOMETHING` | Carrier status |
| 2 | `IP_BEING_CARRIED` | Being carried |
| 3 | `IP_FALLING` | Falling state |
| 4 | `IP_NEAR_OPPOSITE_SEX` | Proximity to mates |
| 5 | `IP_MUSIC_MOOD` | **MusicFaculty.mood()** |
| 6 | `IP_MUSIC_THREAT` | **MusicFaculty.threat()** |
| 7 | `IP_SELECTED_CREATURE` | Player selection |

### AgentManager — Mood/Threat Aggregation

The `AgentManager::CalculateMoodAndThreat()` method iterates over all creatures to compute averaged mood and threat values for the MusicManager:

```
For each creature:
  if visible on screen
  AND selectableByUser() == true
  AND hatching() == false:
      sum mood
      sum threat
      count++
      track lowest health

Average = sum / count
```

The averaged values are passed to the MusicManager, which uses them to select and blend music tracks from the MNG soundtrack file.

### MusicManager — Soundtrack Selection

The MusicManager receives averaged mood and threat as **target values** and gradually approaches them with smoothing to avoid sudden musical transitions:

```text
// smooth approach toward target
Approach(currentMood,  targetMood,  0.05)    // slow mood transition
Approach(currentThreat, targetThreat, 0.1)   // faster threat transition
```

Threat transitions are twice as fast as mood transitions (0.1 vs 0.05 step), reflecting the design intent that danger should be communicated more urgently than general happiness. The MNG script system within the soundtrack file uses these values as variables to control track selection, layer volumes, and aleotoric (random) musical elements.

## Unique Design Characteristics

### No Feedback Path

Unlike most faculties, MusicFaculty has no way to *receive* information — it only *provides* it. There are no receptor loci, no genome genes, no message handlers, and no CAOS commands that modify its behaviour. The mood formula's weights are compile-time constants.

### Circular Awareness

The creature is aware of the music system's interpretation of its own state. Through the situation lobe inputs (`IP_MUSIC_MOOD`, `IP_MUSIC_THREAT`), a creature can perceive what mood its own drives are projecting. This creates a subtle self-awareness loop: the creature knows how the music "feels" about it.

### Genus Discrimination

The `selectableByUser()` method creates an interesting asymmetry: Grendels and Ettins live in the same world and have the same 14 drives, but their emotional state is invisible to the music system. The soundtrack responds exclusively to Norn welfare — reflecting the game's design where Norns are the player's primary charges.

## Serialisation

### Binary Format (Save Archive)

MusicFaculty has no state to serialise. The Write/Read methods only handle the base Faculty class data:

```
1. base::Write/Read    (Faculty base class — creature handle reference)
```

The original `Read()` includes a version check (`archive.GetFileVersion() >= 3`) for backward compatibility with very early save file formats. The JS rebuild omits this check as it only supports the final file format.

## Source Files

| File | Description |
|------|-------------|
| `Rebuild/Main_Game/src/engine/creature/faculties/MusicFaculty.js` | JS rebuild implementation |
| `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:251-256` | JS — writes mood/threat to situation lobe |
