# Grendel and Ettin Egg maker.cos - Automatic Egg Production System

**Source**: `Assets/Bootstrap/001 World/Grendel and Ettin Egg maker.cos`

## Overview

This script creates two invisible egg-maker agents that automatically maintain Grendel and Ettin populations aboard the Ark. Each egg maker periodically checks how many living creatures and unhatched eggs of its type exist, and if the combined count falls below 2, it produces a new egg loaded with the appropriate genetics.

The Grendel egg maker includes a delayed-start mechanic: during its first 8 timer cycles, it checks whether any Norns have ventured outside the Norn Terrarium (metarooms 0 and 7). If no Norns are found exploring other areas, the egg maker does nothing. This ensures Grendels only begin appearing once the player's Norns have started exploring the Ark, providing a natural escalation of challenge. After 8 checks, this gate is permanently removed and eggs are produced based on population alone.

The Ettin egg maker has no such gate and begins producing eggs immediately on its timer cycle.

Both egg makers use the `greneggmask` sprite sheet for their appearance and egg animations. Created eggs are given physical properties (gravity, friction, elasticity, permeability), loaded with random genetics, and dropped into the world near their respective egg makers.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 99 | Grendel Egg Maker | `greneggmask` | Invisible agent in the Jungle that periodically spawns Grendel eggs | [Detail](#grendel-egg-maker-1-1-99) |
| 1 1 101 | Ettin Egg Maker | `greneggmask` | Invisible agent in the Desert that periodically spawns Ettin eggs | [Detail](#ettin-egg-maker-1-1-101) |
| 3 4 2 | Grendel Egg | `greneggmask` | A Grendel egg with loaded genetics, produced by the Grendel Egg Maker | [Detail](#grendel-egg-3-4-2) |
| 3 4 3 | Ettin Egg | `greneggmask` | An Ettin egg with loaded genetics, produced by the Ettin Egg Maker | [Detail](#ettin-egg-3-4-3) |

---

## Grendel Egg Maker (1 1 99)

An invisible simple agent placed in the Jungle/Grendel area. It uses a timer to periodically check the Grendel population and produce new eggs when the combined count of living Grendels and unhatched Grendel eggs falls below 2. During its first 8 timer cycles, it additionally requires that at least one Norn has ventured outside the Norn Terrarium before it will produce eggs.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `greneggmask` | Image index 1, first image 0, 1 frame |
| `tick` | 3602 | Timer interval (~3 minutes at 20 ticks/sec) |
| Position | (2253, 2017) | Jungle / Grendel area |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov99` | 0 | Norn exploration check counter (0-8). Once it reaches 8, the Norn presence gate is permanently disabled |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Population check and egg production cycle |

---

#### Event 9 — Timer (Population Check & Egg Production)

This is the core logic that runs every 3602 ticks:

**Phase 1 — Norn Exploration Gate** (only while `ov99 < 8`):

1. Enumerates all Norns (family 4, genus 1).
2. For each Norn, checks its metaroom via `gmap posx posy`.
3. If any Norn is found in a metaroom other than 0 or 7 (i.e., has left the Norn Terrarium/Bridge), sets a flag.
4. Increments `ov99`.
5. If no Norn was found exploring, the script stops — no egg is produced this cycle.
6. After 8 cycles (`ov99 >= 8`), this gate is permanently skipped.

**Phase 2 — Population Count**:

1. Counts all living Grendels (family 4, genus 2) by checking `dead = 0`.
2. Adds the total count of Grendel eggs (family 3, genus 4, species 2) via `totl`.
3. If the combined count is less than 2, calls the `egg_` subroutine.

**Subroutine `egg_` — Egg Production**:

1. Plays the `"egg1"` sound effect.
2. Calculates the spawn position relative to the egg maker (offset -10, +10 from left/top).
3. Creates a new Grendel egg agent (3 4 2) with sprite `greneggmask`, image index 7, first image 1, 10 frames.
4. Sets the egg's physical properties (see Grendel Egg detail below).
5. Loads Grendel genetics via `gene load targ 1 "g*"` (selects a random genome file matching `g*`).
6. Sets `ov01 = 1` on the egg (identifies it as a Grendel egg).
7. Moves the egg to the spawn position and gives it an initial velocity of (-10, -5), launching it up and to the left.
8. Sets the egg's timer to 600 ticks.

---

## Ettin Egg Maker (1 1 101)

An invisible simple agent placed in the Desert/Ettin area. It uses a timer to periodically check the Ettin population and produce new eggs when the combined count of living Ettins and unhatched Ettin eggs falls below 2. Unlike the Grendel Egg Maker, it has no Norn exploration gate and begins producing eggs immediately.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `greneggmask` | Image index 6, first image 15, 1 frame |
| `tick` | 3603 | Timer interval (~3 minutes at 20 ticks/sec) |
| Position | (5941, 656) | Desert / Ettin area |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Population check and egg production cycle |

---

#### Event 9 — Timer (Population Check & Egg Production)

This is the core logic that runs every 3603 ticks:

**Phase 1 — Population Count**:

1. Counts all living Ettins (family 4, genus 3) by checking `dead = 0`.
2. Adds the total count of Ettin eggs (family 3, genus 4, species 3) via `totl`.
3. If the combined count is less than 2, calls the `egg_` subroutine.

**Subroutine `egg_` — Egg Production**:

1. Plays the `"egg1"` sound effect.
2. Plays an animation sequence `[0 1 2 3 4 5]` on the egg maker and waits for it to complete (`over`).
3. Calculates the spawn position relative to the egg maker (offset +46, +65 from left/top).
4. Creates a new Ettin egg agent (3 4 3) with sprite `greneggmask`, image index 7, first image 8, 10 frames.
5. Sets the egg's physical properties (see Ettin Egg detail below).
6. Loads Ettin genetics via `gene load targ 1 "e*"` (selects a random genome file matching `e*`).
7. Sets `ov01 = 2` on the egg (identifies it as an Ettin egg).
8. Moves the egg to the spawn position.
9. Sets the egg's timer to 60 ticks.
10. Resets the egg maker's pose back to 0.

---

## Grendel Egg (3 4 2)

A Grendel egg created by the Grendel Egg Maker. It is a physical object with gravity, friction, and elasticity that will eventually hatch into a Grendel creature.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `greneggmask` | Image index 7, first image 1, 10 frames |
| `elas` | 10 | Slight bounce |
| `fric` | 100 | Maximum friction |
| `attr` | 195 | Carryable + Mouseable + Activatable + Suffers Collisions + Camera Shy |
| `bhvr` | 32 | Creatures can Pick Up |
| `aero` | 10 | Moderate air resistance |
| `accg` | 4 | Light gravity |
| `perm` | 60 | Moderate permeability |
| `tick` | 600 | Timer interval for hatching behavior |
| Initial velocity | (-10, -5) | Launched up and to the left from the egg maker |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov01` | 1 | Creature type identifier (1 = Grendel) |

### Genetics

Loaded via `gene load targ 1 "g*"` — selects a random genome file from the Genetics directory matching the pattern `g*` (Grendel genomes).

---

## Ettin Egg (3 4 3)

An Ettin egg created by the Ettin Egg Maker. It is a physical object with gravity, friction, and elasticity that will eventually hatch into an Ettin creature.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `greneggmask` | Image index 7, first image 8, 10 frames |
| `elas` | 10 | Slight bounce |
| `fric` | 100 | Maximum friction |
| `attr` | 195 | Carryable + Mouseable + Activatable + Suffers Collisions + Camera Shy |
| `bhvr` | 32 | Creatures can Pick Up |
| `aero` | 10 | Moderate air resistance |
| `accg` | 4 | Light gravity |
| `perm` | 60 | Moderate permeability |
| `tick` | 60 | Timer interval for hatching behavior |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov01` | 2 | Creature type identifier (2 = Ettin) |

### Genetics

Loaded via `gene load targ 1 "e*"` — selects a random genome file from the Genetics directory matching the pattern `e*` (Ettin genomes).

---

## Removal Script (rscr)

The removal script cleanly uninstalls both egg makers:

1. Enumerates and kills all Grendel Egg Makers (`enum 1 1 99 → kill targ`).
2. Enumerates and kills all Ettin Egg Makers (`enum 1 1 101 → kill targ`).

Note: Existing eggs (3 4 2 and 3 4 3) are **not** removed by this script — they persist in the world.
