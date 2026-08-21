# apples.cos - Apple Fruit Ecosystem

**Source**: `Assets/Bootstrap/001 World/apples.cos`

## Overview

This script implements a self-sustaining apple fruit ecosystem for the Creatures 3 world. It creates an invisible spawner agent that maintains the apple population, and spawns 10 initial apple fruits in the Norn Terrarium area. Apples go through a full lifecycle — ripening through 13 visual stages, becoming ripe and carryable, and eventually decaying if not eaten. When an apple decays, it automatically spawns a replacement to keep the population stable. The spawner agent also performs a periodic check and replenishes apples if the fresh count drops below 5.

Creatures can eat apples, which provides a `STIM_EATEN_FRUIT` (stimulus 78) biochemical response. Eating an apple produces an Apple Core (2 10 27) — a smaller detritus item that can also be eaten for a weaker `STIM_EATEN_DETRITUS` (stimulus 81) response. Both apples and apple cores decompose over time, contributing small amounts of Nutrient (CA 4) and Water (CA 3) back to the room environment.

Apples emit CA 6 (Fruit smell) when picked up, making them detectable by creatures navigating by smell. The overall system creates a renewable food supply with ecological feedback — decaying organic matter enriches the environment.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 129 | Apple Spawner | `blnk` | Invisible timer agent that monitors apple population and spawns replacements when fresh apple count drops below 5 | [Detail](#apple-spawner-1-1-129) |
| 2 8 2 | Apple | `apple` frames 0-14 | Edible fruit with full ripening lifecycle; creatures can pick up and eat it | [Detail](#apple-2-8-2) |
| 2 10 27 | Apple Core | `apple` frame 14 | Remains left after an apple is eaten; a detritus item that decomposes or can be eaten for minimal nutrition | [Detail](#apple-core-2-10-27) |

---

## Apple Spawner (1 1 129)

An invisible agent using the blank sprite ("blnk") positioned at (2160, 100) in the Norn Terrarium area. Its sole purpose is to maintain a minimum population of fresh apples. It fires on a long timer (3600 ticks) and counts existing fresh apples — if fewer than 5 remain, it spawns a new one.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `blnk` | Invisible (blank sprite) |
| `tick` | 3600 | Long-interval population check timer |
| Position | (2160, 100) | Norn Terrarium area |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Population maintenance check |

#### Event 9 — Timer (Population Maintenance)

Fires every 3600 ticks. Enumerates all Apple agents (2 8 2) and counts those that are fresh (`ov00 == 0`). If fewer than 5 fresh apples exist, spawns a new Apple with standard properties:
- `attr 64`, `bhvr 48`, `elas 30`, `accg 5`, `fric 100`
- Random timer (`tick rand 50 300`)
- Random position in x (2160–2500), y (100–320)
- `ov61 25` (smell intensity)

This ensures the Norn Terrarium always has a minimum baseline of fresh apples available.

---

## Apple (2 8 2)

The apple is the primary fruit food agent in the ecosystem. It progresses through a visual ripening lifecycle of 13 pose stages. Fresh apples start with minimal physical attributes (collisions only) and gain carryable/mouseable properties as they ripen. Ripe apples eventually decay if not eaten, spawning a replacement apple before disappearing. When eaten by a creature, the apple is destroyed and replaced by a smaller Apple Core detritus item.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `apple` | 15 frames (poses 0–14 for ripening stages) |
| `attr` | 64 (initial) | Suffers Collisions only — not carryable/mouseable when fresh |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `elas` | 30 | 30% elasticity (bounces slightly) |
| `accg` | 5 | Moderate gravity |
| `fric` | 100 | Maximum friction |
| `tick` | rand 50–300 | Random ripening timer interval |
| `ov61` | 25 | CA smell emission intensity |
| `ov00` | 0 (initial) | Lifecycle state: 0 = fresh, 1 = eaten/decaying |
| `ov99` | 0 (initial) | Counter used for decay timing |

### Initial Placement

| Count | Position | Notes |
|---|---|---|
| 10 | Random x (2160–2500), y (100–320) | Norn Terrarium area, plane 10 |

### Attribute Lifecycle

The apple's `attr` value changes as it progresses through its lifecycle:

| Stage | ATTR | Meaning |
|---|---|---|
| Fresh (pose 0–12) | 64 | Suffers Collisions only |
| Ripe (pose 13+) | 67 | Carryable + Mouseable + Suffers Collisions |
| Decaying / Picked | 195 | Carryable + Mouseable + Suffers Collisions + Suffers Physics |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 4 | Pickup | Creature or hand picks up the apple |
| 6 | Drop | Apple is dropped |
| 9 | Timer | Ripening, decay, and reproduction lifecycle |
| 12 | Eat | Creature eats the apple |

#### Event 4 — Pickup

When the apple is picked up:
1. If the apple is fresh (`ov00 == 0`):
   - Emits **CA 6 (Fruit smell)** at 0.5 intensity.
   - Marks the apple as picked/eaten (`ov00 = 1`), stopping the ripening lifecycle.
2. If the apple is ripe (`attr == 67`):
   - Upgrades to `attr 195` (adds Suffers Physics), so the apple falls realistically when dropped.
3. Sets permeability to 60.

#### Event 6 — Drop

When the apple is dropped and not being carried:
1. Sets plane to 4000 (foreground rendering layer).

#### Event 9 — Timer (Ripening & Decay Lifecycle)

The apple's timer drives a two-phase lifecycle:

**Phase 1 — Fresh apple (`ov00 == 0`):**

Only proceeds if the apple is not being carried:

1. **Ripening** (pose < 13): Advances pose by 1 each tick, visually progressing through 13 ripening stages.
2. **Ripe** (pose >= 13):
   - If `attr == 64`: changes to `attr 67` (becomes Carryable + Mouseable — the player can now interact with it).
   - Increments the decay counter (`ov99`).
3. **Decay** (`ov99 >= 20`): After 20 timer ticks at full ripeness:
   - Resets counter (`ov99 = 0`).
   - Changes `attr` to 195 (fully physical).
   - Marks as decaying (`ov00 = 1`).
   - Reduces CA 6 emission to 0.01 (very faint fruit smell).
   - **Spawns a replacement apple** with full fresh properties (`attr 64`, `bhvr 48`, random timer and position, `ov61 25`). The new apple has a 25% chance of `perm 60`.

**Phase 2 — Decaying apple (`ov00 == 1`):**

1. Increments decay counter (`ov99`).
2. When `ov99 >= 50` and not carried:
   - Enriches the room environment:
     - `altr room targ 4 0.01` — Increases **CA 4 (Nutrient)** by 0.01.
     - `altr room targ 3 0.01` — Increases **CA 3 (Water)** by 0.01.
   - Destroys itself (`kill ownr`) — the apple has fully decomposed.

#### Event 12 — Eat

When a creature eats the apple:
1. Records the apple's current position (left edge and top).
2. Sends **stimulus 78** (`STIM_EATEN_FRUIT`) with intensity 1 to the eating creature — provides nutritional biochemical feedback.
3. Waits 10 ticks (eating animation time).
4. Plays the `"eat1"` sound effect.
5. Creates an **Apple Core** (2 10 27) at the recorded position:
   - Sprite "apple" showing frame 14 (core appearance), plane 20.
   - `attr 195` (Carryable + Mouseable + Physics + Collisions).
   - `bhvr 48` (creatures can pick up and eat).
   - `elas 0`, `accg 5`, `fric 100`.
   - `ov61 10` (lower smell intensity than fresh apple).
   - `tick 1200` (decomposition timer).
   - If the target position is invalid (`tmvt` check fails), the core is killed immediately.
6. Destroys the original apple (`kill ownr`) — the apple is consumed.

---

## Apple Core (2 10 27)

The apple core is a detritus item created when a creature eats an apple. It represents the remains of the fruit and provides a lower-quality food option. Apple cores decompose on a timer, contributing nutrients to the room environment, or can be eaten by creatures for minimal nutrition with a detritus stimulus rather than a fruit stimulus.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `apple` frame 14 | Single frame showing apple core appearance |
| `attr` | 195 | Carryable + Mouseable + Suffers Collisions + Suffers Physics |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `elas` | 0 | No bounce |
| `accg` | 5 | Moderate gravity |
| `fric` | 100 | Maximum friction |
| `tick` | 1200 | Decomposition timer |
| `ov61` | 10 | Lower CA smell emission intensity than fresh apple |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Decomposition |
| 12 | Eat | Creature eats the apple core |

#### Event 9 — Timer (Decomposition)

When the timer fires:
1. If the core is in a valid room and not being carried:
   - Enriches the room environment:
     - `altr room targ 4 0.01` — Increases **CA 4 (Nutrient)** by 0.01.
     - `altr room targ 3 0.01` — Increases **CA 3 (Water)** by 0.01.
   - Destroys itself (`kill targ`) — the core has decomposed.
2. If the core is not in a valid room and not being carried:
   - Destroys itself (`kill ownr`) — cleanup for cores that fell out of bounds.

#### Event 12 — Eat (Core Consumption)

When a creature eats the apple core:
1. Sends **stimulus 81** (`STIM_EATEN_DETRITUS`) with intensity 1 to the eating creature — provides lower-quality nutritional feedback compared to a fresh apple.
2. Waits 1 tick.
3. Destroys itself (`kill ownr`).

Apple cores provide less nutrition than fresh apples (detritus stimulus vs fruit stimulus) and are a secondary food source.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the apple ecosystem:

1. Kills all existing Apple agents (`enum 2 8 2 → kill targ`).
2. Removes Apple scripts: Timer (9) and Eat (12) for classifier 2 8 2.

Note: The removal script does not explicitly clean up the Apple Spawner (1 1 129) or Apple Cores (2 10 27). Apple cores will self-destruct on their next timer tick.

---

## Ecosystem Diagram

```
     ┌────────────────────────┐
     │   Apple Spawner        │
     │   (1 1 129)            │
     │                        │
     │ Timer: 3600 ticks      │
     │ Counts fresh apples    │
     │ Spawns if count < 5    │
     └───────────┬────────────┘
                 │ Spawns
                 ▼
     ┌────────────────────────┐
     │   Apple                │
     │   (2 8 2)              │
     │                        │
     │ Ripens: pose 0→13      │
     │ Emits CA 6 (Fruit)     │
     │ Edible by creatures    │
     └──────┬───────┬─────────┘
            │       │
  Decays    │       │  Eaten by
  (ov99≥20) │       │  creature
            │       │
            ▼       ▼
  New fresh apple   ┌──────────────────┐
  (2 8 2)           │   Apple Core     │
  + old apple       │   (2 10 27)      │
  decomposes        │                  │
  (+CA 3, +CA 4)    │ Decomposes:      │
                    │   +CA 3 (Water)  │
                    │   +CA 4 (Nutri.) │
                    │                  │
                    │ Edible: STIM 81  │
                    │ (Detritus)       │
                    └──────────────────┘
```

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 78 | `STIM_EATEN_FRUIT` | Apple is eaten (event 12) | Creature receives nutritional "eaten fruit" biochemical feedback |
| 81 | `STIM_EATEN_DETRITUS` | Apple core is eaten (event 12) | Creature receives lower-quality "eaten detritus" biochemical feedback |

## Room CA Effects

| CA Index | Name | Source | Change | Ecological Role |
|---|---|---|---|---|
| 3 | Water | Apple/core decomposition | +0.01 | Decaying organic matter releases moisture |
| 4 | Nutrient | Apple/core decomposition | +0.01 | Decaying organic matter enriches soil nutrients |
| 6 | Fruit smell | Apple pickup (event 4) | 0.5 (on pickup) / 0.01 (decaying) | Smell allowing creatures to detect fruit |
