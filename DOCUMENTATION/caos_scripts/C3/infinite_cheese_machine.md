# infinite_cheese_machine.cos - Infinite Cheese Machine

**Source**: `Assets/Bootstrap/001 World/infinite_cheese_machine.cos`

## Overview

This script implements the Infinite Cheese Machine ecosystem, a food production system for the Creatures 3 Ark. Five cheese machines are placed throughout the world, each capable of dispensing up to 4 cheese wedges. Creatures activate a machine by pushing it (Activate 1), which triggers an animated dispensing sequence that creates a new cheese wedge near the machine. The machines can also be triggered via their input port (message 6464), allowing integration with the engineering system.

Cheese machines self-replenish over time using the world's Bioenergy reserve: a timer periodically checks whether the cheese population is low and Bioenergy is sufficient, then converts 30 Bioenergy into one new cheese slot (up to the maximum of 4). This creates an economic feedback loop where Bioenergy management directly affects food availability.

Six initial cheese wedges are also placed alongside the machines at bootstrap. Cheese wedges emit CA 8 (Fat smell), making them detectable by creatures navigating by smell. Each wedge can be eaten in two bites, providing a "food eaten" stimulus each time.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 23 1 | Cheese Machine | `infinite_cheese_machine` frames 0-43 | Compound agent that dispenses cheese wedges when activated; refills using Bioenergy | [Detail](#cheese-machine-2-23-1) |
| 2 11 2 | Cheese Wedge | `infinite_cheese_machine` frame 2 | Edible food item that creatures can pick up and eat in two bites | [Detail](#cheese-wedge-2-11-2) |

---

## Cheese Machine (2 23 1)

The Cheese Machine is a compound agent with three parts: the main body (part 0) with an opening/closing animation, a cheese level indicator (part 1) that visually shows remaining stock, and a recharging indicator (part 2). Creatures interact by pushing (Activate 1), which triggers an elaborate dispensing animation with sound effects and creates a new cheese wedge. The machine tracks the last creature that activated it, and if empty, applies a disappointment stimulus to that creature.

Machines also have an input port that listens on message 6464, enabling them to be wired into the Ark's engineering network. When triggered, they send a signal (255) on their output port after dispensing.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 196 | Mouseable + Activatable 1 + Physics + Suffers Collisions |
| `bhvr` | 9 | Activate 1 (1) + Hit (8) |
| `perm` | 100 | Fully solid |
| `elas` | 0 | No bounce |
| `accg` | 30 | Strong gravity |
| `aero` | 25 | Air resistance |
| `fric` | 100 | Maximum friction |
| `ov62` | 4 | Current cheese stock (0-4) |
| `ov16` | null | Reference to last creature that activated it |
| Input Port 0 | "input" | Listens on message 6464, triggers cheese production |
| Output Port 0 | "output" | Sends signal 255 after dispensing cheese |

### Parts

| Part | Type | Sprite | Description |
|---|---|---|---|
| 0 | Main body | `infinite_cheese_machine` frames 0-43 | Animated dispenser with open/close sequence |
| 1 | Cheese indicator | `infinite_cheese_machine` | Pose reflects remaining stock (0-4) |
| 2 | Recharge indicator | `infinite_cheese_machine` frames 0-3 | Animates when Bioenergy refills a slot |

### Initial Placement

| # | Position (x, y) |
|---|---|
| 1 | (8230, 465) |
| 2 | (327, 800) |
| 3 | (4965, 913) |
| 4 | (1820, 3420) |
| 5 | (5370, 3347) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Creature pushes the machine to request cheese |
| 3 | Hit | Creature hits the machine |
| 9 | Timer | Periodic Bioenergy-based refill check |
| 6463 | Custom (internal) | Main cheese dispensing logic |
| 6464 | Input Port | Engineering network trigger |

#### Event 1 — Activate 1 (Push)

When a creature pushes the machine:
1. Stores a reference to the activating creature in `ov16`.
2. Sends internal message 6463 to itself to trigger the dispensing sequence.

#### Event 6464 — Input Port

When the input port receives a signal from the engineering network:
1. Reads the signal value (`_p1_`).
2. If the value is non-zero, sends internal message 6463 to trigger dispensing.
3. Uses `lock` to prevent interruption during evaluation.

#### Event 6463 — Cheese Dispensing (Internal)

This is the core production logic, triggered by either creature activation or input port signal:

**If cheese is available (`ov62 > 0`):**
1. Decrements `ov62` by 1.
2. Updates part 1 pose to reflect new stock level.
3. Plays opening sounds ("copn", "che1").
4. Animates the machine opening (frames 0-22), waits for completion.
5. Plays "dr10" sound, animates dispensing (frames 23-25), waits.
6. Creates a new Cheese Wedge (2 11 2) at the machine's position offset by (27, 27).
7. Sends signal 255 on output port 0 (notifies connected engineering agents).
8. Plays "che2" sound.
9. Animates machine closing (frames 26-43), waits for completion.
10. Plays "ccls" sound, resets pose to 0.

**If empty (`ov62 <= 0`):**
1. Plays "excl" (exclamation/error sound).
2. If a creature reference exists in `ov16`, applies **stimulus 0** (disappointment) with intensity 1 to that creature.
3. Clears the creature reference.

#### Event 9 — Timer (Bioenergy Refill)

Fires every 1250 ticks. Checks three conditions:
- Total cheese wedges in world (`totl 2 11 2`) is at most 100
- World Bioenergy (`game "Bioenergy"`) is at least 30
- Machine stock (`ov62`) is below 4

If all conditions are met:
1. Subtracts 30 from world Bioenergy.
2. Animates the recharge indicator (part 2, frames 0-3 repeated 4 times).
3. Increments `ov62` by 1.
4. Updates part 1 pose to reflect new stock level.

This creates a direct link between the Ark's Bioenergy economy and food production.

#### Event 3 — Hit

When a creature hits the machine:
1. Plays "hit_" sound.
2. Applies upward velocity (random y between -20 and -30) to the creature.
3. Bangs a random port (60-100 intensity).
4. Applies **stimulus 92** (hit/pain) to the creature with intensity 1.

---

## Cheese Wedge (2 11 2)

The cheese wedge is a simple food agent that creatures can pick up and eat. It takes two bites to consume: the first bite changes the pose (showing a bitten wedge), and the second bite destroys it. Each bite provides a food-eaten stimulus to the eating creature. Cheese wedges emit CA 8 (Fat smell), making them detectable by creature navigation.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 195 | Carryable + Mouseable + Activatable 1 + Physics + Suffers Collisions |
| `bhvr` | 48 | Pick Up (32) + Eat (16) |
| `perm` | 64 | Moderate permeability |
| `elas` | 40 | Some bounce |
| `accg` | 10 | Light gravity |
| `aero` | 5 | Low air resistance |
| `fric` | 100 (initial) / 20 (dispensed) | Static cheese has max friction; dispensed cheese slides more |
| `ov61` | 30 | CA smell emission intensity |
| `ov00` | 0 | Bite counter (0 = whole, 1 = bitten) |
| `emit` | CA 8 at 0.35 | Emits Fat smell |

### Initial Placement

Six cheese wedges are placed at bootstrap near the machines:

| # | Position (x, y) |
|---|---|
| 1 | (8590, 465) |
| 2 | (8730, 465) |
| 3 | (467, 909) |
| 4 | (1000, 909) |
| 5 | (800, 709) |
| 6 | (2200, 959) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6 | Collision | Plays sound when landing on ground |
| 12 | Eat | Creature eats the cheese (two-bite system) |

#### Event 12 — Eat

Uses a two-bite consumption system tracked by `ov00`:

**First bite (`ov00 = 0`):**
1. Plays "chwp" (chewing) sound.
2. Applies **stimulus 79** (food eaten) to the eating creature with intensity 1.
3. Changes pose to 1 (bitten cheese appearance).
4. Sets `ov00 = 1`.

**Second bite (`ov00 = 1`):**
1. Plays "chwp" (chewing) sound.
2. Applies **stimulus 79** (food eaten) to the eating creature with intensity 1.
3. Destroys the cheese wedge (`kill ownr`).

#### Event 6 — Collision

When the cheese wedge collides with the ground (`wall = down`):
1. Plays "dr10" (drop/thud) sound.

---

## Removal Script

The removal section (`rscr`) cleans up all cheese machines (2 23 1), cheese wedges (2 11 2), and any agents of classifier 2 21 8 (possibly a legacy or related agent). It also removes all associated event scripts.
