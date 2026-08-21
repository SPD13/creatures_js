# empathic vendor.cos — The Empathic Vendor

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/empathic vendor.cos`

## Overview

This script creates the **Empathic Vendor** (`2 23 3`), the food machine in the Mesa that **listens to what creatures say** and dispenses the food they're hungry for. Its "Ear" (toggleable) hears nearby creature speech, matches the sentence against the hunger phrases in the `Creature Drives` catalogue (Protein / Starch / Fat), and either vends the matching food directly (if it can see the speaker) or tells the corresponding **food pod** to grow some. It dispenses three foods, each emitting a different food smell so creatures can navigate to it:

| Food | Classifier | Drive | Smell emitted | Eaten stim | Nutrient chem |
|---|---|---|---|---|---|
| Star Seed | 2 3 15 | Starch | CA 7 (starch) | 77 | chem 93 +0.25 |
| Yarn Fruit | 2 8 6 | Protein | CA 6 (protein) | 78 | chem 92 +0.15 |
| Peaking Pie | 2 11 7 | Fat | CA 8 (food) | 79 | chem 97 +0.175 |

`ov00` on the vendor is whether the Ear is active (1 = listening). It also notes its metaroom (`ov70`) for finding hungry creatures.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 23 3 | Empathic Vendor | `ds empathic vendor` | The speech-listening food dispenser — see [detail](#agent-2-23-3-empathic-vendor) |
| 2 3 15 | Star Seed | `ds empathic vendor` | Starch food — see [foods](#dispensed-foods-2-3-15--2-8-6--2-11-7) |
| 2 8 6 | Yarn Fruit | `ds empathic vendor` | Protein food |
| 2 11 7 | Peaking Pie | `ds empathic vendor` | Fat food |

It also messages the **food pods** — Carrot Pod (`2 23 4`), Nut Pod (`2 23 5`), Lemon Pod (`2 23 6`) — to grow food when it can't see the hungry creature.

## Agent 2 23 3: Empathic Vendor

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | Reward the pusher (stim 90) and vend a random food |
| Pull | 2 | Same as push |
| Custom — Ear (heard speech) | 126 | A creature within range spoke (`_p1_` sentence, `_p2_` speaker) → vend/grow the food they crave |
| Custom — ear toggle | 1000 | Turn the listening Ear on/off |
| Custom — vend Star Seed | 1001 | Animate the snout and spawn 3 Star Seeds |
| Custom — vend Yarn Fruit | 1002 | Animate the snout and spawn 2 Yarn Fruit |
| Custom — vend Peaking Pie | 1003 | Animate the snout and spawn 2 Peaking Pies |

### Event 126 — The Ear (empathic dispensing)

Only acts when the Ear is on (`ov00 = 1`). With a hearing range of 1000, it checks whether it can **see** the speaker (`seee`). It then scans the spoken sentence (`sins lowa …`) for the Protein / Starch / Fat hunger phrases:

- **Wants Fat** → if it can see the creature, vend a Peaking Pie (1003); otherwise tell the Carrot Pod (`2 23 4`) to make a carrot.
- **Wants Protein** → vend a Yarn Fruit (1002), or tell the Lemon Pod (`2 23 6`) to make a lemon.
- **Wants Starch** → vend Star Seeds (1001), or tell the Nut Pod (`2 23 5`) to make a nut.

This lets the vendor respond to a creature's spoken hunger from across the room, delegating to the nearer food pod when out of sight.

## Dispensed Foods (2 3 15 / 2 8 6 / 2 11 7)

Each food is a small physics object that **emits its smell** (`emit`) so creatures can find it.

| Event | Number | Description |
|---|---|---|
| Eat | 12 | Eaten: play a chew/eat sound, stim the eater (77/78/79), inject the nutrient chemical (`chem`), and bite down / vanish |
| Timer | 9 | Age; after ~10 ticks, if not carried or falling, fade out and self-destruct (litter cleanup) |
| Collision | 6 | Landing sound |

## Removal Script

```
rscr
enum 2 23 3 / 2 3 15 / 2 8 6 / 2 11 7
    kill targ
next
```

Kills the vendor and all dispensed food.

## Impact on Stimulus / Room CA

**Stimuli:** pushing/pulling the vendor stims the creature with **90** (a reward); eating its food stims the eater with **77 (ate seed)**, **78 (ate fruit)** or **79 (ate food)**.

**Room CA:** the dispensed foods continuously `emit` their smell CAs — **6 (protein)**, **7 (starch)** and **8 (food)** — so hungry creatures can smell and navigate toward the appropriate food. Eating injects the matching nutrient chemical (`chem 92/93/97`) into the creature's bloodstream. The vendor itself writes no CA directly; its food carries the ecological effect.
