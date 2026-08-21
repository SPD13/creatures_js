# Brain & Neural Networks

## Overview

The Creatures 3 brain system is a sophisticated artificial neural network that enables creatures to learn, make decisions, and exhibit emergent behaviors. Each creature has a unique brain structure defined by their genome. The standard norn genome defines **15 lobes** connected by **29 tracts**, comprising over 800 neurons.

## Architecture

### Lobes

The brain consists of **lobes** — clusters of neurons that process specific types of information. Lobes are defined in two ways: 11 are registered in the `Brain.catalogue` (engine-aware), and 4 additional lobes exist only in the genome binary (genome-only). The engine also references two additional tokens (`elvn` and `prox`) that have no genome definition — writes to these hit a dummy lobe and are discarded. Each lobe has an **SVRule** (a micro-program) that controls how its neurons process inputs, and **tracts** that wire lobes together.

![Brain architecture map extracted from a creature's genome](images/brain-map.png)

#### Output Lobes

These lobes produce the brain's behavioral decisions. Their winning neuron determines what the creature does and what it focuses on.

| Lobe | Neurons | Description |
|------|---------|-------------|
| [decn — Decision](#/article/decision-lobe-architecture) | 13 (1×13) | The brain's action selector. 13 neurons compete via winner-takes-all to choose one voluntary action (push, pull, eat, approach, etc.). Receives integrated signals from the combination lobe. The original engine defines 14 action constants (NUMACTIONS=14, indices 0-13) but the standard genome allocates only 13 neurons (0-12). |
| [attn — Attention](#/article/attention-lobe-architecture) | 40 (40×1) | The brain's focus selector. 40 neurons (one per agent category) compete to choose what the creature pays attention to. The winning neuron determines the IT agent via MotorFaculty. |

#### Input Lobes — Sensory

These lobes receive data from the engine's sensory systems (SensoryFaculty, LinguisticFaculty) and relay world state into the brain.

| Lobe | Neurons | Description |
|------|---------|-------------|
| [visn — Vision](#/article/vision-lobe-architecture) | 40 (40×1) | Encodes X-displacement to the nearest visible agent in each of the 40 categories. Written by SensoryFaculty every tick. Closer agents produce higher values. |
| [smel — Smell](#/article/smell-lobe-architecture) | 40 (40×1) | Encodes diffused CA (Cellular Automata) chemical presence per category from the creature's current room. Allows creatures to sense agents through walls and around corners. Activates at baby stage (not embryo). |
| [noun — Noun](#/article/noun-lobe-architecture) | 40 (40×1) | Input mirror for the attention lobe. Receives linguistic signals (heard speech), stimulus nudges (URGE/STIM/SWAY), and instinct pre-training. Biases which category of object the creature focuses on. |
| [verb — Verb](#/article/verb-lobe-architecture) | 13 (1×13) | Input mirror for the decision lobe. Receives linguistic signals, stimulus nudges, and instinct pre-training. Biases which action the creature performs. Non-trivial script-offset-to-neuron-ID mapping. |
| [detl — Detail](#/article/detail-lobe-architecture) | 16 (1×16) | Encodes 11 properties of the IT agent: carried status, nearness, is-creature, kinship (sibling/parent/child), opposite sex, size, smell intensity, movement state. Zero tracts in standard genome — latent capacity. |
| [situ — Situation](#/article/situation-lobe-architecture) | 16 (1×16) | Encodes 9 creature state properties: age level, in vehicle, carrying something, being carried, falling, near opposite sex, music mood, music threat, selected by player. Zero tracts in standard genome — latent capacity. |

#### Input Lobes — Internal State

These lobes receive data from the creature's internal systems (drives, reinforcement, proximity).

| Lobe | Neurons | Description |
|------|---------|-------------|
| [driv — Drive](#/article/drive-lobe-architecture) | 20 (20×1) | Encodes 20 biochemical drive levels (hunger for protein/starch/fat, cold, hot, tired, sleepy, lonely, crowded, scared, bored, angry, friendly, etc.). Written by SensoryFaculty from biochemistry. Tissue 5 — biochemically modulated. |
| [resp — Response](#/article/response-lobe-architecture) | 20 (20×1) | Encodes drive-change consequences from the creature's last action. Written by Instinct (REM sleep) and SensoryFaculty (stimulus training). Alert-state routing: awake → resp, asleep → prox (dummy lobe). Pass-through SVRule. |

> **Note**: The engine also writes to a `prox` (proximity) token for asleep reinforcement learning. However, like `elvn`, no genome defines a `prox` lobe — writes go to a dummy lobe and are discarded. The standard genome has **15 lobes** total.

#### Intermediate Processing Lobes

These lobes sit between input and output, performing integration, filtering, and association.

| Lobe | Neurons | Description |
|------|---------|-------------|
| [stim — Stimulus Source](#/article/stimulus-lobe-architecture) | 40 (40×1) | Sensory integration layer. Aggregates signals from vision (proximity inversion), smell (gated scaling), motion (movement detection), and language (noun amplification) into a unified per-category saliency map. Feeds the combination lobe. |
| [comb — Combination](#/article/combination-lobe-architecture) | 440 (40×11) | The central decision matrix. A 2D grid where each neuron represents an (action, object-category) pair. Integrates drives, language, stimulus sources, and social relationships through 6 inbound tracts. Reinforcement learning on dendrite weights. Dual output to attn (column sums) and decn (row sums). Genome-only. |
| [move — Move](#/article/move-lobe-architecture) | 40 (40×1) | Motion detection layer. Leaky integrator SVRule accumulates change-of-vision signals with slow decay, detecting which categories are moving in the visual field. Feeds stim lobe via gated tract. Genome-only. |
| [forf — Friend-or-Foe](#/article/friendorfoe-lobe-architecture) | 36 (12×3) | Tracks individual relationships with up to 36 creatures/pointer agents. Each neuron stores affection (STATE), interaction history (THIRD), stranger flag (FOURTH), visibility (FIFTH). Receives kinship-based initialization and mood broadcasts. Genome-only. |
| [mood — Mood](#/article/mood-lobe-architecture) | 1 (1×1) | Smallest lobe. Computes emotional valence from 4 social/threat drives (scared, angry → negative; lonely, friendly → positive) with temporal smoothing. Broadcasts global mood to all forf neurons when |mood| > 0.5. Genome-only. |

### Neurons

Each neuron contains:
- **State** - Current activation level (0.0-1.0)
- **Input** - Incoming signals from dendrites
- **Output** - Outgoing signal to connected neurons
- **Threshold** - Minimum input needed to fire

### Dendrites

Connections between neurons:
- **Source** - The neuron sending the signal
- **Weight** - Strength of the connection (learned over time)
- **Type** - Excitatory or inhibitory

## Neural Processing

### SVRule Virtual Machine

Neuron behavior is controlled by **SVRules** - small programs that run on a custom virtual machine with 68 opcodes. Each lobe has an SVRule that determines how its neurons process inputs.

```
Common SVRule operations:
- state = input           (copy input to state)
- state += weight × src   (weighted accumulation)
- if state > threshold    (conditional firing)
- state = sigmoid(state)  (activation function)
```

### Winner-Takes-All (WTA)

The output lobes use **winner-takes-all** selection to produce a single behavioral choice:
1. All neurons in the lobe compute their activation via SVRule processing
2. The neuron with the highest state "wins"
3. The winning neuron ID maps to a specific action (decn) or object category (attn)
4. The MotorFaculty reads the winners and translates them into creature behavior

## Decision Making

### Signal Flow Through the Brain

```
┌───────────────────────────────────────────────────────────────────┐
│                    BRAIN SIGNAL FLOW                               │
│                                                                   │
│  ENGINE INPUTS           INTERMEDIATE             OUTPUT          │
│  ─────────────          ────────────             ──────          │
│                                                                   │
│  visn (vision) ──┬──→ move (motion) ──┐                          │
│                  │                     ▼                          │
│  smel (smell) ──┬┤──────────────→ stim (saliency) ──┐           │
│                 ││                     ▲              │           │
│  noun (heard) ──┘│─────────────────────┘              │           │
│                  │                                    ▼           │
│  verb (heard) ──┐│──────────────────────────→ comb (440 grid)    │
│                 ││                              ▲  │   │         │
│  driv (drives)──┘│──────────────────────────────┘  │   │         │
│                  │                                 │   │         │
│  forf (social) ──│─────────────────────────────────┘   │         │
│                  │                                     ▼         │
│  resp (reward) ──│──→ driv (weight learning)     ┌── decn ──→ Action
│                  │                               │   (WTA)       │
│  mood (valence)──│──→ forf (broadcast)           │              │
│                  │                               └── attn ──→ IT
│  detl (IT props) │    (latent — no tracts)           (WTA)       │
│  situ (context)──┘    (latent — no tracts)                       │
└───────────────────────────────────────────────────────────────────┘
```

### Key Processing Stages

1. **Sensory encoding** (time 1–4): Engine writes to input lobes — visn, smel, driv, detl, situ, resp, noun, verb
2. **Cross-modal integration** (time 6–14): visn↔smel mutual reinforcement, motion detection (move), saliency aggregation (stim)
3. **Combination matrix** (time 17–20): driv, stim, verb, forf tracts feed the 40×11 comb grid; dendrite weights encode learned associations
4. **Output competition** (time 21–25): comb column sums → attn (what to focus on), comb row sums → decn (what to do); winner-takes-all selects one neuron in each

## Learning

### Reinforcement Learning

When a creature receives reward or punishment:
1. The brain identifies which decision led to the outcome
2. Dendrite weights are adjusted:
   - Reward: Strengthen connections that led to the decision
   - Punishment: Weaken those connections
3. Future similar situations will produce different decisions

### Instinct Processing

During REM sleep, **instinct genes** pre-train connections:
- Hardwired associations (fire → pain)
- Survival behaviors (hunger → eat food)
- See [Instinct System](#/article/instinct-system) for details

## Integration with Biochemistry

### Inputs from Chemistry

- Drive loci provide motivation signals
- Chemical levels affect neuron thresholds
- Some neurons receive direct chemical input via receptors

### Outputs to Chemistry

- **NeuroEmitters** convert neural activity to chemicals
- Decision neurons can trigger chemical releases
- Creates brain → chemistry → brain feedback loops

## Key Files

| Component | File |
|-----------|------|
| Brain | `Main_Game/src/engine/creature/brain/Brain.js` |
| Lobe | `Main_Game/src/engine/creature/brain/Lobe.js` |
| Neuron | `Main_Game/src/engine/creature/brain/Neuron.js` |
| SVRule VM | `Main_Game/src/engine/creature/brain/SVRule.js` |

## Related Articles

- [Biochemistry System](#/article/biochemistry-system) - Chemical feedback with brain
- [Instinct System](#/article/instinct-system) - Hardwired neural training
- [Creature Faculties](#/article/creature-faculties) - The 9 subsystems including SensoryFaculty and MotorFaculty
- [Creature Perception](#/article/creature-perception) - How sensory data flows into input lobes
