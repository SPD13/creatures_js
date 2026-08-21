# z_agent smells.cos - Global Agent Smell Classifier Mapping

**Source**: `Assets/Bootstrap/001 World/z_agent smells.cos`

## Overview

This script establishes the global **CA-to-classifier mapping** used by the smell system of the Ark. It does **not create any agents** and does **not build any part of the map or define game variables**. Instead, it runs a series of `CACL` commands that tell the engine "agents matching this family/genus/species emit this CA into the room they occupy". This is the backbone of every creature's smell lobe: the twelve CACL calls are what let a creature's nose actually pick up protein, machinery, eggs, norns, grendels, ettins, gadgets, and the three species home smells.

At runtime, whenever an agent matching one of these classifiers exists in a room, the engine adds that agent's contribution to the matching CA (Cellular Automaton) channel of the room. The CA then diffuses through the map according to each CA's diffusion/loss parameters (configured elsewhere, e.g. `!map.cos`), and creatures sample those CA values via their smell lobe (`smel[0..39]`) and the CA→category mapping documented in `DOCUMENTATION/articles/game-systems/smell-lobe-architecture.md`.

Because the script name starts with `z_`, it runs after the rest of the `001 World` bootstrap, ensuring that all the CA channels and category neurons it relies on have been configured by earlier scripts (`!map.cos`, genome/brain setup, etc.) before the classifier-to-CA links are established.

### CACL command semantics

`CACL family genus species ca_index` — registers that any agent whose classifier matches the given `family/genus/species` tuple (with `0` meaning "wildcard" for that component) should emit into CA channel `ca_index` of its room. The mapping is stored globally in the engine's classification table and remains active for the lifetime of the world.

### Mappings configured

| # | CACL Arguments | Classifier Scope | CA Index | CA Name | Intuitive Meaning |
|---|---|---|---|---|---|
| 1 | `2 8 0 6` | family 2 (simple) genus 8, any species | 6 | Protein | Any simple protein-food agent smells of protein |
| 2 | `2 3 0 7` | family 2 (simple) genus 3, any species | 7 | Carbohydrate | Any simple carbohydrate-food agent smells of carbs |
| 3 | `2 11 0 8` | family 2 (simple) genus 11, any species | 8 | Fat | Any simple fat-food agent smells of fat |
| 4 | `3 3 0 10` | family 3 (compound) genus 3, any species | 10 | Machinery | Compound machines broadcast the machinery smell |
| 5 | `3 8 0 18` | family 3 (compound) genus 8, any species | 18 | Gadget | Compound gadgets broadcast the gadget smell |
| 6 | `3 4 1 11` | family 3 (compound) genus 4 species 1 | 11 | Eggs | Creature eggs (only species 1) smell of eggs |
| 7 | `4 1 0 12` | family 4 (vehicle/creature) genus 1, any | 12 | Norn | Norns (of any species) smell like norns |
| 8 | `4 2 0 13` | family 4 genus 2, any species | 13 | Grendel | Grendels smell like grendels |
| 9 | `4 3 0 14` | family 4 genus 3, any species | 14 | Ettin | Ettins smell like ettins |
| 10 | `3 5 0 15` | family 3 genus 5, any species | 15 | Norn Home | Norn home-smell emitters broadcast CA 15 |
| 11 | `3 6 0 16` | family 3 genus 6, any species | 16 | Grendel Home | Grendel home-smell emitters broadcast CA 16 |
| 12 | `3 7 0 17` | family 3 genus 7, any species | 17 | Ettin Home | Ettin home-smell emitters broadcast CA 17 |

### Related systems

- **Home smell emitters** (`Home smell emitters.cos`): Creates the actual 3-5-x / 3-6-1 / 3-7-1 agents that rely on the last three CACL entries to broadcast their home CA.
- **CA map** (`!map.cos`): Defines the CA channels, their diffusion rate, loss, and whether they cross doors.
- **Smell lobe** (`DOCUMENTATION/articles/game-systems/smell-lobe-architecture.md`): Describes how the creature brain consumes these CA values via the smel[0..39] lobe and maps them back to category neurons.

## Created Agents

This script does not create any agents. It only configures classifier → CA smell-emission mappings.

## Impact on Room CAs

The script has an indirect but fundamental impact on every room's CAs: for each mapping listed above, once the corresponding agents exist (food, machinery, eggs, creatures, home emitters), their presence contributes to the CA value of the room they occupy. Without this script, creatures would be functionally anosmic for those twelve CA channels — they would still have working smell neurons, but nothing in the world would be mapped to the CA inputs, so the `smel` lobe values would remain at zero.
