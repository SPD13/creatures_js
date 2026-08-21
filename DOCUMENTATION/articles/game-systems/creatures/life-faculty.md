# Life Faculty

The **LifeFaculty** is faculty 8, the last one to update each creature tick, and the one that
decides whether there is still a creature there at all. It owns three things: the creature's
**position in its life cycle**, its **consciousness state**, and the single locus through which the
rest of the body is allowed to **kill it**.

It is deliberately thin. It does not decide when a creature should age, and it does not decide when
a creature should die — the biochemistry does both, and the LifeFaculty only reads the loci that
the biochemistry writes into. That indirection is the whole design: ageing and death are genetic,
tunable per breed, and identical in mechanism to every other way chemistry drives behaviour.

---

## What it holds

| Field | Meaning |
|---|---|
| `myAge` | Life stage, 0–6 (baby … senile) |
| `myNextAge` | The stage a pending ageing request is heading for |
| `myAgeInTicks` | Ticks lived since being properly born |
| `myState` | Consciousness: one `LifeState` enum, not a set of flags |
| `mySex` / `myVariant` | Identity, fixed at conception |
| `myProperlyBorn` | False for an embryo; the tick counter does not run until `BORN` |
| `myAgeingLoci[7]` | Receptor loci — the biochemistry's request to advance a stage |
| `myDeathTriggerLocus` | Receptor locus — the biochemistry's request to kill |
| `myAsleepLocus` | Emitter locus — 1.0 while asleep, so chemistry can react to sleep |

Everything else the faculty does is a consequence of those.

## The update, in order

```text
if dead                         → return; a dead creature runs nothing
if properly born                → myAgeInTicks += 4
myAsleepLocus = asleep ? 1 : 0
if an ageing request is pending  → retry it; if the body isn't ready yet, return
if myAge >= 7                    → die of old age
if myAgeingLoci[myAge] non-zero  → advance a stage
if myDeathTriggerLocus > 0       → die
```

Two details in that order matter. The **tick counter advances by 4** because a creature updates on
one tick in four (see [Creature Faculties](../creature-faculties.md)) — `myAgeInTicks` counts game
ticks, not creature updates. And the faculty checks **only the locus for the age it is currently
at**, which is what guarantees stages are entered in order and exactly once, however many ageing
loci the chemistry happens to have driven high.

---

## The life cycle

Seven stages, `NUMAGES = 7`:

| # | Stage | What changes |
|---|---|---|
| 0 | Baby | Embryological genes; brain and body built |
| 1 | Child | Language instincts switch on |
| 2 | Adolescent | Ovulation begins; response to the opposite sex changes |
| 3 | Youth | Pair-bonding and mating |
| 4 | Adult | Mature relationships |
| 5 | Old | Faculties begin to fail; interest in mating goes |
| 6 | Senile | Degenerative genes; the body starts poisoning itself |

Advancing past senile is not a stage — `myAge >= 7` calls `setWhetherDead(true)` unconditionally,
however healthy the creature is. That is death by old age.

### What actually drives it

The clock is **chemical 125, "Life"**. It is set to full at birth and again at every stage
transition, then decays on the genome's half-life for that chemical. Seven receptor genes watch it
and write to `myAgeingLoci[0..6]` when it falls past their thresholds. The stock norn genome's
thresholds (as fractions of full):

| Locus | Transition | Threshold |
|---|---|---|
| `LOC_AGE0` | Baby → Child | 229/255 ≈ 0.898 |
| `LOC_AGE1` | Child → Adolescent | 194/255 ≈ 0.761 |
| `LOC_AGE2` | Adolescent → Youth | 165/255 ≈ 0.647 |
| `LOC_AGE3` | Youth → Adult | 136/255 ≈ 0.533 |
| `LOC_AGE4` | Adult → Old | 19/255 ≈ 0.075 |
| `LOC_AGE5` | Old → Senile | 10/255 ≈ 0.039 |
| `LOC_AGE6` | Die of old age | 5/255 ≈ 0.020 |

The gap between AGE3 (0.533) and AGE4 (0.075) is why **adulthood is by far the longest stage**: the
Life chemical has to decay across most of its remaining range before a creature grows old. The
early stages are crowded into the top third of the scale and pass quickly.

`LOC_AGE6` is a safety net, documented in the engine as *"if on DIE IMMEDIATELY of old age (only
implement receptor if death needs to be forced to occur)"* — it guarantees a creature cannot outlive
its genome even if the other mechanisms fail.

Because both the half-life and the thresholds are genome data, **lifespan is a breed property**.
Grendels, for instance, run a faster Life clock than norns and also burn Life under stress; see
[Norns, Grendels and Ettins](species-norns-grendels-ettins.md).

### Ageing takes time to happen

`forceAgeing()` cannot complete instantly: the new stage's body sprites and attachment data have to
be loaded first. If they are not ready, the request is queued in
`myNumberOfForceAgeingRequestsPending` and retried every tick — and the update **returns** on a
refused retry, so the death checks below it do not run that tick. When it does succeed, the faculty:

1. increments `myAge`,
2. calls `ExpressGenes()` for the new stage — this is what switches on the genes tagged for it,
3. increments `myNextAge`,
4. records a life-stage event in the creature's history (which fires script 127 and produces the
   in-game life-event icon).

An ageing creature therefore visibly changes twice: its body grows, and its biochemistry gains
whatever the new stage's genes bring.

---

## Consciousness states

One enum, six values — not a set of independent flags. A creature is in exactly one state.

| State | Value | Entered by | What stops |
|---|---|---|---|
| **Zombie** | 0 | `ZOMB 1`, or the engine taking the creature over | The motor faculty is skipped entirely; the brain no longer drives the creature. It stands there. |
| **Alert** | 1 | The default, and the state everything returns to | Nothing — this is a normal, awake creature |
| **Asleep** | 2 | `ASLP 1`, or the brain deciding to sleep | Perception is skipped; voluntary and involuntary actions are blocked; `myAsleepLocus` goes to 1.0 |
| **Dreaming** | 3 | `DREA 1`, only from asleep | As asleep, plus the brain processes instincts — this is when learning is consolidated |
| **Unconscious** | 4 | `UNCS 1` | Motor skipped, script execution stopped, body posed limp (pose 58) |
| **Dead** | 5 | The death paths below | Everything. Permanent. |

### Transition rules

`setState()` is the only way in or out, and it enforces:

- **Dead is terminal.** `setWhetherDead(false)` returns immediately — there is no rejuvenation.
- **Zombie blocks everything else.** While zombie, asleep/dreaming/unconscious/alert setters all
  return early; only `ZOMB 0` (→ alert) gets out.
- **You can only stop doing what you are doing.** Waking works only from asleep or dreaming;
  regaining consciousness only from unconscious; leaving dreaming lands in asleep, not alert.
- **Leaving alert costs the current action**: the motor action is stopped, the creature is set
  introspective, and its animation is reset.
- **Entering unconscious or zombie** stops the creature's script VM and forces pose 58.
- **Dreaming toggles instinct processing** on the way in and off on the way out.

### Reading a state correctly

- `alert` is the **ordinary living state**, not a special one. Almost every healthy creature is
  alert almost all of the time.
- `zombie` is not an illness and not a bug. It means something deliberately took the creature off
  its own brain — a machine, a script, or the player. It will do nothing on its own until released.
  See [Zombie State](../zombie-state.md).
- `dreaming` is not "stuck asleep": it is the productive half of sleep, when instincts are wired.
  A creature that never dreams never consolidates what its instincts should teach it.
- `unconscious` is imposed from outside (`UNCS`), unlike sleep, which the creature can choose.

---

## Death

Three ways in, one way through.

### 1. Old age

`myAge >= NUMAGES` after a stage advance. Unconditional — health is irrelevant.

### 2. The death trigger locus

`myDeathTriggerLocus` is a receptor locus on the **immune tissue** (`LOC_DIE`). Any receptor
writing a value above zero to it kills the creature on the next update. This is the route for
illness, poisoning, starvation and suffocation — the biochemistry decides, the faculty only obeys.

The stock genome wires exactly three receptors to it, all from birth:

| Watches | Fires when | Meaning |
|---|---|---|
| ATP (35) | below 19/255 ≈ 0.075 | organ fuel exhausted — the end state of starvation |
| Energy (34) | below 13/255 ≈ 0.051 | the respiration chain has stopped |
| Chemical 90 | above 232/255 ≈ 0.910 | the genome's lethal-damage accumulator, fed by pain-causing stimuli |

The first two are inverted digital receptors (they fire *below* the threshold); the third fires
above it. Note what is **not** on the list: Glycogen, Injury, and Air do not kill directly. They
kill by driving ATP and Energy down, or chemical 90 up.

### 3. A script

`DEAD` calls `setWhetherDead(true)` outright.

### The death sequence

Whichever route, the same seven steps run once:

1. drop whatever the creature is carrying,
2. remove it from every other creature's friend/foe lists,
3. `setState(dead)` — which also stops the motor action and resets animation,
4. stop the script VM,
5. run the creature's DIE script (event 72),
6. close its eyes,
7. record a `typeDied` event in its history — which fires script 127 and spawns the tombstone.

After that the faculty's `update()` returns immediately on every tick: a dead creature ages no
further, perceives nothing, and cannot be revived.

---

## Death-risk indicators, and how to read them

These are the numbers the Creature Debugger's Life panel shows, and the chain between them is more
useful than any one of them alone:

```text
food → Starch/Fat/Protein → Glucose ⇄ Glycogen → Pyruvate → (+ Oxygen) → Energy → ATP → organs run
                                  ▲                                         │
                              "health"                                 death receptor
```

| Indicator | What it is | Reading it |
|---|---|---|
| **Glycogen** (chem 4) | The short-term sugar reserve. `Health()` returns exactly this. | Falling = the creature is running down its reserves. It does not kill directly; it starves the ATP that does. |
| **ATP** (chem 35) | Organ fuel. Every organ spends it every tick. | Below ~0.075 the death receptor fires. Below that threshold death is not a risk, it is scheduled. |
| **Injury** (chem 127) | Whole-body organ damage total | Rises as organs are hurt, falls as they repair. High injury means organs are failing to keep up. |
| **Air quality** (`myAirQualityLocus`) | The creature's own locus: 1.0 breathable, 0.0 = head underwater | Below 0.2 the creature is **drowning** — it is physically in the wrong place. |
| **Air** (chem 29) | Its internal reserve of breathable gas | Below 0.302 an inverted digital receptor fires the gasping/drowning reflex. Low Air with good air quality means it needs to *get* to better air. |
| **Death trigger** | `myDeathTriggerLocus` | Anything above 0 means the biochemistry has already decided. This is not a warning; it is a verdict. |

The practical reading order: **death trigger first** (is it already dying?), then **ATP** (how close
is it to the receptor?), then **Glycogen** (is it going to get worse?), then **Air/air quality** (is
the cause environmental?), and **Injury** last (is something damaging it?). A creature with low
Glycogen but healthy ATP is hungry; a creature with low ATP is dying, whatever its Glycogen says.

---

## Loci exposed to the biochemistry

| Locus | Type | Tissue | Purpose |
|---|---|---|---|
| `myAgeingLoci[0..6]` | Receptor | Somatic | Chemistry asks for a stage advance |
| `myDeathTriggerLocus` | Receptor | Immune | Chemistry asks for death |
| Dead flag | Emitter | Immune | 1.0 while dead — lets chemistry keep running post-mortem |
| `myAsleepLocus` | Emitter | Sensorimotor | 1.0 while asleep — lets chemistry react to sleep |

The dead-flag emitter had a notable bug in the original engine: a single shared static, so every
creature read the same value. The rebuild makes it per-instance.

---

## CAOS and serialisation

`ZOMB`, `ASLP`, `DREA`, `UNCS` and `DEAD` map onto the setters above and inherit their rules — a
`DREA 1` on a creature that is not asleep does nothing, and a `DEAD` on a dead creature is a no-op.

The faculty serialises the asleep and death-trigger loci, the seven ageing loci, sex, age, variant,
tick age, state, and the properly-born flag. `myNumberOfForceAgeingRequestsPending` is deliberately
**not** saved: a loaded creature is rebuilt at the right age already, so a pending request would be
meaningless. On read, `myNextAge` is reconstructed as `myAge + 1` and the state is assigned
directly, bypassing `setState()` so none of its side effects fire during load.

---

## Related articles

- [Age and Lifecycle](../age-and-lifecycle.md) — the ageing system in its own right
- [Creature Faculties](../creature-faculties.md) — the nine faculties and the 4-tick gate
- [Zombie State](../zombie-state.md) — what the zombie state is for
- [Creature Sleep](../creature-sleep.md) — how sleep is entered and what it does
- [Biochemistry System](../biochemistry-system.md) — receptors, loci and the chemistry behind all of this
- [Energy and Metabolism](../energy-and-metabolism.md) — the food → ATP chain the death receptors watch
- [Norns, Grendels and Ettins](species-norns-grendels-ettins.md) — how lifespan differs by species
