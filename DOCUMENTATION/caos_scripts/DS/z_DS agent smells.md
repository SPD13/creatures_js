# z_DS agent smells.cos — Agent Smell CA Associations

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/z_DS agent smells.cos`

## Overview

This script **creates no agents** — it is a Room CA setup that registers the **smell associations** for the whole world. Using the `cacl` command (`cacl <family> <genus> <species> <ca>`, with `0` as a wildcard), it ties each category of agent classifier to the **CA (Cellular Automata) smell index** it emits and that creatures can navigate by. This is the master table that underpins every "emit"/smell reference in the other DS scripts — it's why food, creatures, eggs and home areas each have their own trackable scent.

## CA Smell Associations

| Category | Classifier (wildcard) | CA index | Meaning |
|---|---|---|---|
| Food — protein | 2 8 0 | 6 | Protein smell |
| Food — carbohydrate | 2 3 0 | 7 | Carb/seed smell |
| Food — fat | 2 11 0 | 8 | Fat smell (carrots, cheese) |
| Machinery | 3 3 0 | 10 | Machinery smell |
| Gadgets | 3 8 0 | 18 | Gadget smell |
| Eggs | 3 4 1 | 11 | Egg smell |
| Creatures — Norn | 4 1 0 | 12 | Norn smell |
| Creatures — Grendel | 4 2 0 | 13 | Grendel smell |
| Creatures — Ettin | 4 3 0 | 14 | Ettin smell |
| Home — (3 5) | 3 5 0 | 15 | Home smell |
| Home — (3 6) | 3 6 0 | 16 | Home smell |
| Home — (3 7) | 3 7 0 | 17 | Home smell |

These associations are what let, for example, a Tuba (`2 3 …`) register on the **carb smell (CA 7)** map, a creature register on its species smell map, and a Home smell emitter mark a nesting area — so creatures' brains can follow the relevant scent gradients.

## Impact on Stimulus / Room CA

**Room CA — foundational.** This script writes no CA values and emits no stimuli; instead it **defines the classifier→CA-index mapping** for the entire smell system (`cacl`). It is the canonical reference for the smell CA numbers used throughout the DS scripts: **6 protein**, **7 carb/seed**, **8 fat/food**, **10 machinery**, **11 egg**, **12/13/14 norn/grendel/ettin**, **15/16/17 home**, **18 gadget**.
