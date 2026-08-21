# Carrot.cos - Carrot Plant Ecosystem

**Source**: `Assets/Bootstrap/001 World/Carrot.cos`

## Overview

This script implements a self-sustaining carrot ecosystem for the Creatures 3 world. It spawns 20 initial carrot plants across the Ark, half of which are active (ticking) and can reproduce by dropping seeds. Seeds grow through several visual stages and, when mature, sprout into new carrot plants — but only if the room has sufficient heat, water, and nutrients. Carrots can be picked up and eaten by creatures, providing a "food eaten" stimulus. When eaten, the carrot is destroyed but leaves behind a seed that can grow into a replacement plant, keeping the food supply renewable.

The carrot ecosystem enriches the environment as it grows: seeds incrementally add water and nutrient CA to their room. Carrots also emit CA 8 (Fat smell), making them detectable by creatures navigating by smell. The system creates a feedback loop where environmental conditions sustain plant growth, and plant growth in turn slightly enriches the environment.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 11 1 | Carrot Plant | `carr` frames 0-6 | Edible carrot that creatures can pick up and eat; reproduces by dropping seeds on a timer | [Detail](#carrot-plant-2-11-1) |
| 2 10 26 | Carrot Seed | `carr` frames 0-3 | Seedling that grows through visual stages and sprouts into a new carrot if conditions are viable | [Detail](#carrot-seed-2-10-26) |

---

## Carrot Plant (2 11 1)

The carrot plant is the primary food agent in the ecosystem. It is a simple agent that creatures can pick up and eat. Active carrots periodically produce seeds via a timer and check environmental conditions for their own survival. Two batches of 10 are created at bootstrap: a background batch (plane 50) with no timer, and a foreground batch (plane 5000) with an active reproduction timer.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable + Mouseable + Activatable 1 + Physics + Suffers Collisions |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `accg` | 5 | Moderate gravity |
| `aero` | 20 | Air resistance |
| `elas` | 0 | No bounce |
| `perm` | 60 | Moderate permeability (set on pickup/active carrots) |
| `ov61` | 60 | CA smell emission intensity |
| `emit` | CA 8 at 0.5 | Emits Fat smell (food detectable by creatures) |

### Initial Placement

| Batch | Count | Plane | Position | Timer |
|---|---|---|---|---|
| Background | 10 | 50 | Random x (500-1200), y=500 | None (static) |
| Foreground | 10 | 5000 | Random x (500-1200), y=500 | `tick 2400` (active) |

Foreground carrots start at a random pose (2 or 6), giving visual variety.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 4 | Pickup | Creature picks up the carrot |
| 5 | Drop | Creature drops the carrot |
| 9 | Timer | Reproduction cycle and environmental viability check |
| 12 | Eat | Creature eats the carrot |

#### Event 4 — Pickup

When a creature picks up the carrot:
1. Sets pose to 1 (picked-up appearance).
2. Sets permeability to 60.

#### Event 5 — Drop

When the carrot is dropped:
1. If the timer was disabled (`tick eq 0`), reactivates it to 2400 — a previously static carrot becomes active once interacted with.
2. Sets a random pose (2 or 6) for visual variety.
3. If not being carried, moves to plane 5000 (foreground layer).

#### Event 9 — Timer (Reproduction & Survival)

Fires every 2400 ticks for active carrots. Only runs if the carrot is not being carried and not falling:

1. **Seed production**: Creates a new Carrot Seed (2 10 26) at the carrot's current position with a random starting pose. The seed has:
   - `ov61 = 20` (lower smell intensity than full carrot)
   - `tick 1200` (seed growth timer)

2. **Environmental viability check**: Tests the room's CA properties to determine if the carrot survives:
   - **CA 2 (Heat) > 0.2** AND **CA 4 (Nutrient) > 0.3**:
     - **CA 3 (Water) > 0.1**: Conditions are good — carrot survives (resets to pose 0, stops velocity, disables timer).
     - Water too low: Carrot dies (`kill ownr`).
   - Heat or nutrients insufficient: Carrot dies (`kill ownr`).

The carrot always drops a seed before checking viability, ensuring reproduction even if the parent dies.

#### Event 12 — Eat

When a creature eats the carrot:
1. Plays the `"chwp"` chewing sound effect.
2. Records current position.
3. Sends **stimulus 79** (`STIM_EATEN_FOOD`) with intensity 1 to the eating creature — provides nutritional biochemical feedback.
4. Waits 10 ticks (chewing animation time).
5. Creates a replacement Carrot Seed (2 10 26) slightly above the carrot's last position (20 pixels higher):
   - Starts at a later pose offset (10-14 range).
   - `ov61 = 10` (minimal smell).
   - `tick 300` (faster timer — seeds from eaten carrots mature more quickly).
6. Destroys itself (`kill ownr`) — the carrot is consumed.

This ensures that eating a carrot is not purely destructive: a seed remains that can grow into a new plant, maintaining the food supply.

---

## Carrot Seed (2 10 26)

The carrot seed is a transitional agent that represents a seedling growing from a dropped or eaten carrot. It progresses through visual growth stages via its timer, enriches the room environment as it grows, and when fully mature either sprouts into a new carrot plant (if conditions permit) or dies.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Carryable + Mouseable + Physics + Suffers Collisions |
| `bhvr` | 48 | Creatures can Pick Up (32) and Eat (16) |
| `accg` | 5 | Moderate gravity |
| `aero` | 20 | Air resistance |
| `elas` | 0 | No bounce |
| `ov61` | 10-20 | CA smell intensity (lower than full carrot) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Growth stages, environmental enrichment, and sprouting |
| 12 | Eat | Creature eats the seed |

#### Event 9 — Timer (Growth & Sprouting)

Only runs if the seed is not being carried and not falling:

**Growing phase** (pose < 3):
1. Increments pose by 1 (visual growth stage).
2. Enriches room environment (if in a valid room and not carried):
   - `altr room targ 4 0.01` — Increases room **CA 4 (Nutrient)** by 0.01.
   - `altr room targ 3 0.01` — Increases room **CA 3 (Water)** by 0.01.

**Mature phase** (pose >= 3):
1. Adds final nutrient/water enrichment (+0.01 each).
2. Records current position.
3. **Environmental viability check** (same conditions as parent carrot):
   - **CA 2 (Heat) > 0.2** AND **CA 4 (Nutrient) > 0.3**:
     - **CA 3 (Water) > 0.1**: Conditions are good — creates a new Carrot Plant (2 11 1) at this position with full properties (`attr 199`, `ov61 60`, `emit 8 0.5`).
     - Water insufficient: No new carrot created.
   - Heat or nutrients insufficient: No new carrot created.
4. Destroys itself (`kill ownr`) regardless of outcome — the seed has served its purpose.

#### Event 12 — Eat (Seed Consumption)

When a creature eats a seed:
1. Locks execution (atomic operation).
2. Sends **stimulus 81** (`STIM_EATEN_DETRITUS`) with intensity 1 to the eating creature.
3. Injects **chemical 75 (Alcohol)** at 0.1 concentration into the eating creature — seeds contain fermented material that causes mild intoxication.
4. Waits 10 ticks.
5. Destroys itself (`kill ownr`).

Seeds provide less nutrition than full carrots (detritus stimulus vs food stimulus) and carry the side effect of alcohol ingestion.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the carrot ecosystem:

1. Kills all existing carrot plants (`enum 2 11 1 → kill targ`).
2. Kills all existing carrot seeds (`enum 2 10 26 → kill targ`).
3. Removes seed scripts: Eat (12) and event 90 for classifier 2 10 26.
4. Removes carrot scripts: Pickup (4), Drop (5), Timer (9), and Eat (12) for classifier 2 11 1.

---

## Ecosystem Diagram

```
              ┌──────────────────────┐
              │   Carrot Plant       │
              │   (2 11 1)           │
              │                      │
              │ Emits CA 8 (Fat)     │
              │ Edible by creatures  │
              └──────┬───────┬───────┘
                     │       │
            Timer    │       │  Eaten by
          (2400 ticks)│       │  creature
                     │       │
                     ▼       ▼
              ┌──────────────────────┐     ┌──────────────────┐
              │   Carrot Seed        │     │   Creature       │
              │   (2 10 26)          │     │                  │
              │                      │     │ Gets STIM 79     │
              │ Grows: pose 0→1→2→3  │     │ (Eaten Food)     │
              │ Enriches room:       │     └──────────────────┘
              │   +0.01 Water (CA3)  │
              │   +0.01 Nutrient(CA4)│
              └──────────┬───────────┘
                         │
              Mature (pose≥3)
              Checks room conditions:
              Heat>0.2, Nutrient>0.3,
              Water>0.1
                         │
               ┌─────────┴─────────┐
               │ Yes               │ No
               ▼                   ▼
     New Carrot Plant        Seed dies
       (2 11 1)           (no replacement)
     Cycle continues
```

## Environmental Requirements

Carrots require specific room conditions to survive and reproduce:

| CA Index | CA Name | Threshold | Role |
|---|---|---|---|
| 2 | Heat | > 0.2 | Warm enough for plant growth |
| 3 | Water | > 0.1 | Sufficient moisture |
| 4 | Nutrient | > 0.3 | Enough soil nutrients |

If any condition is not met, the carrot/seed dies without reproducing. This ties the carrot population to room environmental health and creates natural distribution patterns — carrots thrive in warm, wet, nutrient-rich areas and die off in hostile environments.

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 79 | `STIM_EATEN_FOOD` | Carrot is eaten (event 12) | Creature receives nutritional "eaten food" biochemical feedback |
| 81 | `STIM_EATEN_DETRITUS` | Seed is eaten (event 12) | Creature receives lower-quality "eaten detritus" feedback |

## Chemical Effects

| Chemical # | Name | Source | Amount | Effect |
|---|---|---|---|---|
| 75 | Alcohol | Eating a carrot seed | 0.1 | Causes mild intoxication — drunken gait and possible sickness |

## Room CA Effects

| CA Index | Name | Source | Change | Ecological Role |
|---|---|---|---|---|
| 3 | Water | Seed growth (timer) | +0.01 per growth tick | Growing plants contribute moisture to the environment |
| 4 | Nutrient | Seed growth (timer) | +0.01 per growth tick | Growing plants enrich soil nutrients |
| 8 | Fat | Carrot plant emission | 0.5 (continuous) | Food smell allowing creatures to locate carrots |
