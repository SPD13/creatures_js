# Norns, Grendels and Ettins

Creatures 3 ships three playable species — **Norns**, **Grendels** and **Ettins**. They are not
three creature *systems*. They are one system, run three times over three genomes: the same
faculties, the same brain layout, the same 256-chemical bloodstream, the same seven life stages,
the same twenty drives. Everything that makes a grendel a grendel rather than a norn is written in
its DNA — a handful of extra reactions, a different set of birth chemicals, different rewards
attached to the same actions.

This article is the result of parsing the stock genomes shipped in this project's asset packs and
diffing them gene by gene. Where a claim is made here, it is a claim about those files — see
[Caveats](#caveats-and-how-to-reproduce) at the end.

---

## How the engine tells them apart

Species identity travels through five separate channels, all seeded from one genome byte.

| Channel | Where | Values |
|---|---|---|
| **Genome genus gene** | Creature gene, subtype 1 (one per genome) | `0` norn, `1` grendel, `2` ettin |
| **Agent classifier** | `myClassifier.genus`, set from the genome byte **+ 1** | `4 1 x` norn, `4 2 x` grendel, `4 3 x` ettin (`4` = Geat, unused by the stock packs) |
| **Appearance genes** | Creature gene, subtype 2 — five of them, one per body part | species byte `0`/`1`/`2` picks the sprite set; the *variant* byte picks the breed slot within it |
| **Voice** | `Voice.js` builds the voice-file name from the genus name | `Norn`, `Grendel`, `Ettin`, `Geat` |
| **Babble vocabulary** | `Norn.catalogue` arrays | `Default Norn Speak`, `Default Grendel Speak`, `Default Ettin Speak` |

The vocabulary arrays are why the three sound different before they learn any real words. A norn's
default verb/noun/drive words are `goo` / `dis` / `gaa`; a grendel's are `grah` / `narg` /
`graaaah`; an ettin's are `hoo` / `dus` / `gaa`. Each species also has its own word for *me* —
norns say `em`, `me`, `eem`, `bub`; grendels say `grndl`, `beh`, `ung`, `fig`; ettins say `er`,
`me`, `eem`, `etn`.

Species also matters to the **map**, not just the creature. Three cellular-automata channels carry
species scent — 12 (norn), 13 (grendel), 14 (ettin) — and three more mark home territory: 15 (norn
home), 16 (grendel home), 17 (ettin home). Creatures smell these as chemicals 177–182 and navigate
by them. As shown below, each species reacts to a different one of these channels, and grendels
react to the *norns'* channel.

---

## What all three share

Diffing the three genomes, the shared part is much larger than the different part:

- **The same brain, exactly.** All three declare 15 lobes and 29 tracts, with identical names,
  dimensions and winner-takes-all flags: `driv` 20×1, `decn` 1×13, `attn` 40×1, `visn` 40×1,
  `move` 40×1, `comb` 40×11, `stim` 40×1, `noun` 40×1, `verb` 1×13, `detl` 1×16, `situ` 1×16,
  `resp` 20×1, `smel` 40×1, `forf` 12×3, `mood` 1×1. Not one neuron differs. A grendel is not
  built with a smaller or angrier brain — it is built with the same brain, wired to different
  rewards.
- **The same body poses** — 242 pose genes each.
- **The same life cycle** — seven stages driven by the decay of chemical 125 (Life) through seven
  ageing receptors; see [Age and Lifecycle](../age-and-lifecycle.md).
- **The same organ toolkit** — the digestive, respiratory, metabolic and reproductive organs are
  the same organs running the same reactions, with only the numbers tuned.
- **The same drives and the same actions.** Nothing is unlocked for one species and locked for
  another.

### Gene budget

| | Norn (`norn.chichi06.ex47`) | Grendel (`gren.final46g`) | Ettin (`ettn.final46e`) |
|---|---|---|---|
| Total genes | 820 | 745 | 755 |
| Organs | 21 | 21 | **20** |
| Receptors | 199 | 148 | 160 |
| Reactions | 101 | 92 | 90 |
| Emitters | 43 | 39 | 41 |
| Initial concentrations | 25 | 21 | 21 |
| Stimuli | 58 | 56 | 55 |
| Instincts | 33 | 29 | 30 |
| Gaits | 16 | 14 | 13 |
| Expressions | 7 | 8 | 7 |
| Brain lobes / tracts | 15 / 29 | 15 / 29 | 15 / 29 |

The norn genome is the richest of the three. The grendel and ettin genomes read as trimmed
variants of the same design: fewer receptors (less fine regulation), fewer instincts, fewer gaits.

---

## Norns

The baseline species, and the only one whose biology is built around **company**.

**Born with:** Muscle Tissue 32/255, Adipose Tissue 70, Glycogen 34, Boredom 90, hunger for
protein and fat 33 each, hunger for carbohydrate 13, and a full set of eight antibodies (0–7).
A norn starts life lean, well-defended against infection, and mildly bored.

**Social wiring.** Of the three reference genomes, only the norn has:

- an **Opposite Sex Tickle** stimulus (46) that raises Arousal Potential by 0.30 and relieves
  loneliness and crowding — the courtship loop;
- a **norn-scent** stimulus (55 + 12): reaching the peak of the norn smell channel drops
  Loneliness by 0.20 and Boredom by 0.05 — norns are drawn toward each other and *feel better* on
  arrival;
- an **Express Need** stimulus (20) that reduces Anger and Crowdedness — asking for help calms them.

**Instincts.** Their innate set is the most social and the most verbal of the three, and the
categories it fires on say as much as the actions:

| When it feels | It is born knowing to | About |
|---|---|---|
| Lonely | approach | a **norn** |
| Angry | **talk** (−0.20), and from childhood push | a **norn**; a **grendel** |
| Afraid | retreat | a **grendel** |
| Crowded | retreat | a **norn** |
| Bored | activate | a toy, a button, machinery, an elevator, a tool |
| Wants comfort | approach | **norn home** (from adolescence) |

A norn's built-in answer to frustration is to *say something* to another norn. Its fear and its
aggression are both aimed at grendels specifically — not at creatures in general.

**Ageing.** No reaction anywhere in the norn genome consumes chemical 125. Norns age purely on the
Life clock's half-life (byte 99 ≈ 17,950 ticks) — stress does not shorten a norn's life.

---

## Grendels

Everything about the grendel genome points the same way: **more muscle, less immunity, and anger
where a norn would have fear.**

**Born with:** Muscle Tissue **247**/255 (a norn's is 32), Adipose Tissue 128, Glycogen 64,
Boredom 130, hunger for carbohydrate 81 — and **Anger 50 and Grendel nitrate 204 already in the
bloodstream at hatching.** A grendel is born strong, hungry, bored and angry. It also carries only
antibodies 6 and 7; antibodies 0–5 start at zero and their antigens have a half-life of 0, so the
grendel immune system simply does not cover most infections.

**The signature reaction.** One line of grendel DNA explains the entire species:

```text
4 × CA smell 12 (Norn) → 1 × Anger        (from Child onward)
```

Grendels metabolise **the smell of norns into anger**. Nothing perceives, decides or learns here —
it is chemistry. A grendel in a room that norns frequent is angry because norns were there.

**Fight, not flight.** The grendel instinct set drops the norn's *retreat-relieves-Fear* instinct
and replaces it with **push a norn (−1.00 Fear)**:

| When it feels | It is born knowing to | About |
|---|---|---|
| Afraid | **push** | a **norn** |
| Angry | push | a **norn** (from childhood) |
| Crowded | push | a **norn**, and an **ettin** |
| Lonely | approach | a **norn** (from childhood) |
| Bored | push machinery and gadgets, and **get** | a **creature egg** |
| Wants comfort / sleepy | approach | **grendel home** |

Read the first four rows together: a grendel seeks norns out when lonely, and pushes them when
afraid, angry or crowded — while its chemistry is turning their smell into more anger. Add the
Fear ↔ Anger interconversion and the adrenalin amplifier (both shared with norns) and the loop
closes: a frightened grendel pushes, pushing makes it less frightened, and adrenalin makes both
feelings grow.

**Rewards no other species has:**

| Stimulus | Effect | Meaning |
|---|---|---|
| 87 Hit Critter | Boredom −0.04, Anger −0.10 | hitting small animals is *relief* |
| 92 Hit Machine | Boredom −0.15 | so is hitting machinery |
| 93 Got Creature Egg | Boredom −1.00, **Comfort +1.00** | picking up an egg is the single most rewarding thing a grendel can do |
| 34 Involuntary Faint | Hunger for carbohydrate +1.00 | fainting leaves it ravenous |

Grendels also lack stimulus 84 (Friendly Plant) and 90 (Activate Machine) — flowers and gadgets do
nothing for them.

**Shorter, harder life.** The grendel Life clock is faster (half-life byte 97 ≈ 14,730 ticks vs the
norn's 99 ≈ 17,950), and two reactions burn Life outright:

```text
4 × Stress + 8 × Life → 7 × Life          (from Youth)   — chronic stress ages a grendel
8 × Life + 1 × Progesterone → 7 × Life    (from Adult)   — so does pregnancy
```

**Physiology.** Grendels — and ettins — extract more from the same food than norns do
(`1 Protein → 5 Amino Acid` and `1 Starch → 5 Glucose`, where a norn gets 4 of each), and grendels
breathe more cheaply (`1 Air → 3 Oxygen`, while norns and ettins must spend Water:
`1 Water + 1 Air → 3 Oxygen`). Crowdedness fades ~3× faster than in a norn (half-life 172 vs 563
ticks) and their sex-drive reservoir never decays at all (half-life byte 255).

**Two kinds of grendel ship with the game.** The C3 jungle grendel (`gren.final46g`,
`gren.jungle.breedable`) is the genome described above. The Banshee grendel
(`gren.banshee.49`, the one Docking Station ships) is built on the *norn* genome instead — 822
genes, full antibody set, norn-style stimuli including Opposite Sex Tickle — but it is still
genus 1, still starts with Anger 51, and still converts norn-scent into Anger, only from
adulthood rather than childhood. It is a grendel by identity and temperament, a norn by
constitution.

---

## Ettins

If grendels are norns with the fear turned into anger, ettins are norns with **the anger and the
loneliness removed entirely**.

**Twenty organs, not twenty-one.** The ettin genome is missing the organ that norns and grendels
both carry for emotional interconversion. The consequence is visible in the reaction lists:

| Reaction | Norn | Grendel | Ettin |
|---|---|---|---|
| `Fear + Adrenalin → 2 Fear + Adrenalin` | yes | yes | **no** |
| `Anger + Adrenalin → 2 Anger + Adrenalin` | yes | yes | **no** |
| `Fear → Anger` | yes | yes | **no** |
| `Anger → Fear` | yes | yes | **no** |

On top of that, the ettin genome gives **Anger and Loneliness a half-life of 0** — both decay
instantly. An ettin can technically have those chemicals injected, but nothing in its body
produces them and they vanish the moment they arrive. Ettins do not get angry and do not get
lonely, structurally.

**Solitary by reinforcement.** The instinct set makes the point in the opposite direction from the
norn's, and names its targets just as precisely:

| When it feels | It is born knowing to | About |
|---|---|---|
| Afraid | retreat | a **norn**, a **grendel** |
| Crowded | retreat | a **norn**, a **grendel** |
| — | **approach raises Fear (+1.00)** | a **grendel** |
| — | **approach raises Crowdedness (+1.00)** | a **norn** |
| Bored | **get** | a **gadget** |
| Tired | drop | a **gadget** |
| Wants comfort, afraid or tired | approach | **ettin home** |

The two `+1.00` rows are the unusual ones: they are instincts wired to *punish* the action.
Approaching a grendel teaches the ettin fear, approaching a norn teaches it that it is crowded.
Where a norn is born knowing that approaching relieves loneliness, an ettin is born knowing that
approaching costs.

**Machines instead of company.** Ettins are the only species for whom picking up a machine is a
major reward: stimulus 91 (Got Machine) gives Boredom −1.00 and **Comfort +1.00** — the exact
payoff a grendel gets from an egg, and a norn gets from neither. Their home-territory smell is
channel 17, and reaching its peak drops Comfort demand and relieves fear and pain.

**Tougher, colder, quieter.** Ettins shed the feeling of cold about 3.6× faster than norns
(Coldness half-life 172 ticks vs 621). Their pain responses are muted across the board — where an
Impact gives a norn Pain +0.14 and Fear +0.08, an ettin gets Pain +0.02 and Fear +0.02 — and
Play-with-Dangerous-Animal actually *reduces* their pain reading. They have the fewest gaits (13)
and the last of them only switches on at adulthood.

**Ageing.** Like grendels, ettins burn Life under stress, and on harsher terms:

```text
8 × Stress + 2 × Life → 1 × Life          (from Youth)
```

Their Life clock itself runs at the norn rate (half-life byte 99), so a *calm* ettin lives as long
as a norn; a stressed one does not.

---

## Side-by-side

### At birth

| Chemical | Norn | Grendel | Ettin |
|---|---|---|---|
| Muscle Tissue | 32 | **247** | 128 |
| Adipose Tissue | 70 | 128 | 128 |
| Glycogen (health) | 34 | 64 | 64 |
| Hunger for carbohydrate | 13 | **81** | 13 |
| Hunger for protein | 33 | 18 | 33 |
| Boredom | 90 | 130 | 90 |
| Anger | — | **50** | — |
| Antibodies 0–5 | present | **absent** | 0–2 only |
| Species nitrate | — | Grendel nitrate 204 | Ettin nitrate 204 |

### Emotional chemistry

| | Norn | Grendel | Ettin |
|---|---|---|---|
| Fear ↔ Anger conversion | yes | yes | **none** |
| Adrenalin amplifies fear/anger | yes | yes | **none** |
| Anger half-life | 621 ticks | 836 ticks | **0 (instant)** |
| Loneliness half-life | 563 ticks | 563 ticks | **0 (instant)** |
| Crowdedness half-life | 563 ticks | 172 ticks | 563 ticks |
| Smell of norns | — | **→ Anger** | — |

### Innate answers to a feeling

| Feeling | Norn does | Grendel does | Ettin does |
|---|---|---|---|
| Lonely | approach a norn | approach a **norn** | — (cannot feel it) |
| Afraid | retreat from a **grendel** | **push a norn** | retreat from a norn or grendel |
| Crowded | retreat from a norn | **push a norn or ettin** | retreat from a norn or grendel |
| Angry | **talk to a norn**, then push a grendel | push a **norn** | — (cannot feel it) |
| Bored | activate a toy, button, machine | push machinery, **take an egg** | **take a gadget** |
| Wants comfort | go to norn home | go to grendel home | go to ettin home |
| Approaching someone | (neutral) | (neutral) | **fear from grendels, crowding from norns** |

### What each species finds worth doing

| | Norn | Grendel | Ettin |
|---|---|---|---|
| Being tickled by the hand | −Anger −Fear −Loneliness, Reward +0.70 | −Loneliness −Fear, Reward +0.70 | −Fear **+Crowded**, Reward +0.70 |
| Being patted by a creature | −Anger −Loneliness −Fear | −Anger +Crowded | +Crowded −Fear |
| Hitting a critter | (no such stimulus) | **−Anger −Boredom** | (no such stimulus) |
| Picking up an egg | −Boredom 0.10 | **−Boredom 1.00, +Comfort 1.00** | −Boredom 0.05 |
| Picking up a machine | −Boredom 0.10 | −Boredom 0.06 | **−Boredom 1.00, +Comfort 1.00** |
| Own home scent | channel 15 | channel 16 | channel 17 |

### Ageing and death

| | Norn | Grendel | Ettin |
|---|---|---|---|
| Life half-life (per stage clock) | ~17,950 ticks | ~14,730 ticks | ~17,950 ticks |
| Stress consumes Life | no | yes, from Youth | yes, from Youth |
| Pregnancy consumes Life | no | yes, from Adult | no |
| Death receptors | ATP below 0.075, Energy below 0.05, chemical 90 above ~0.93 | same, chemical 90 above ~0.91 | same, chemical 90 above ~0.91 |

(The third death route uses chemical 90, which the catalogue leaves unnamed; the stock genome
treats it as a lethal damage accumulator that pain-causing stimuli feed.)

---

## What this means for a keeper

- **Grendels and norns cannot simply be housed together.** The hostility is not learned behaviour
  that patience can retrain — it is a reaction converting norn scent into Anger, running from
  childhood, in every grendel. Separating them by *smell* (distance, sealed rooms) does more than
  separating them by sight.
- **Slapping a grendel is not the deterrent it is for a norn.** The pain arrives, but so does
  Anger, and the grendel's instincts answer fear and anger with pushing.
- **An ettin that ignores your norns is working as designed.** It is not sick or unhappy: it
  cannot feel loneliness, and its instincts actively punish approaching another creature. Give it
  machinery to carry instead.
- **A bored grendel is a destructive grendel.** Hitting critters and machines are two of its very
  few boredom-relieving options, and both are rewarded chemically.
- **Stress shortens grendel and ettin lives literally, not figuratively.** Chronic high Stress
  consumes chemical 125; the same conditions in a norn cost health but not lifespan.
- **Grendels are the survivors and the plague-carriers.** More muscle, cheaper breathing, better
  food conversion — but almost no antibody coverage, so illness that a norn shrugs off can run
  through a grendel population.

---

## Breeds in the asset packs

Species is the genus; **breed** is the appearance variant plus whatever genetic tuning that breed
carries. The packs ship:

| Species | Genomes |
|---|---|
| Norn | `chichi06.ex47` (variant 3, the starter norn), `astro`, `bondi`, `fallow`, `hardman`, `harlequin`, `magma`, `siamese`, `toxic`, `treehugger`, `zebra`, plus three `expressive` genomes (`bengal`, `bruin`, `civet`) |
| Grendel | `final46g` and `jungle.breedable` (the C3 jungle grendel), `banshee.49` (the Docking Station grendel, norn-derived) |
| Ettin | `final46e` |

The Docking Station pack ships the norn breeds and the Banshee grendel only — no ettin genome.
Every norn breed in the pack shares the same 820-gene genome; the breeds differ in their appearance
variant, not their biology.

---

## Caveats and how to reproduce

- Everything above was read from `Assets/Creatures 3/Genetics/*.gen`, using the norn
  `chichi06.ex47`, the grendel `final46g` and the ettin `final46e` as the reference genome for
  each species. **A custom or hand-bred genome can move any of these numbers** — the species byte
  is the only thing that is fixed.
- Chemical, locus and action names come from the engine's own tables
  (`BiochemistryConstants.js`, `CreatureConstants.js`, `PerceptionConstants.js`) and the chemical
  catalogue; a value shown as a bare id has no name in those tables.
- Instinct inputs address the **noun lobe**, whose neurons are agent-category ids. Those ids are
  named by `ARRAY "Agent Categories" 40` in `Assets/Creatures 3/Catalogue/Creatures 3.catalogue`
  (Docking Station overrides it in `Docking Station.catalogue`), paired one-to-one with
  `ARRAY "Agent Classifiers" 40`; the names used below come from there. Note those catalogue files
  are extended-ASCII, so a plain `grep` skips them as binary unless you pass `-a`.
- Stimulus genes were decoded with the engine's field layout
  (`Stimulus.initFromGenome` → id, nounStim, verb id, verbStim, flags, then four
  chemical/adjustment pairs, with chemical ids mapped through `stimChemToBioChem` and adjustments
  read as signed floats). The generic gene interpreter in `Libraries/creatures-file-formats.js`
  uses an approximate layout and will give different — wrong — chemical ids for these genes.
- To repeat the analysis, parse a `.gen` with
  `CreaturesFileFormats.GenomeFormats.createParser(...).parse()` and group genes by
  `type`/`subtype`: type 0 = brain (lobe/organ/tract), type 1 = biochemistry
  (receptor/emitter/reaction/half-life/initial concentration/neuro-emitter), type 2 = creature
  (stimulus/genus/appearance/pose/gait/instinct/pigment/pigment-bleed/expression), type 3 = organ.
  Biochemistry genes belong to the most recent preceding organ gene.

## Related articles

- [Age and Lifecycle](../age-and-lifecycle.md) — the Life chemical and the seven stages
- [Biochemistry System](../biochemistry-system.md) — chemicals, organs, receptors, reactions
- [Organ to Real-Life Mapping](biochemistry/organ-to-real-life-mapping.md) — what each organ index is
- [Stimulus System](../stimulus-system.md) — how a stimulus reaches the bloodstream
- [Instinct System](../instinct-system.md) — how instincts are wired during REM sleep
- [Drive System](drive-system.md) — from chemical to decision
