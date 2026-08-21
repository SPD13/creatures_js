# medicine maker.cos - Euro Medicine Maker

**Source**: `Assets/Bootstrap/001 World/medicine maker.cos`

## Overview

This script creates the **Euro Medicine Maker**, a compound agent that dispenses a selection of 12 different potions with various biochemical effects. The device has a cycle button that scrolls through the available potion types (displaying a localized name label for each) and a dispense button that spawns one potion of the currently selected type. Each potion is a carryable, edible agent that, when consumed by a creature, injects a specific cocktail of chemicals and then destroys itself.

The machine holds up to 5 charges at a time (visually shown on its pose). A timer slowly refills charges by consuming **40 units of Bioenergy** per refill, but only when the global carrot population is below 100 (to prevent runaway consumption). The potions themselves are tinted in different colors and obey gravity when dropped, falling to plane 550 until picked up again.

The machine is placed at world position 2596, 3659 and runs on a 1250-tick timer for its refill logic.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 23 2 | Euro Medicine Maker | `euro medicine maker` | Compound dispenser with cycle/dispense buttons that produces selected potions | [Detail](#euro-medicine-maker-2-23-2) |
| 2 25 1 | Potion (Sex/Arousal) | `potions` fr.0 | Injects Arousal Potential (39) and Opposite Sex Pheromone (41) | [Detail](#potions-2-25-x) |
| 2 25 2 | Potion (Chem 97) | `potions` fr.0 | Injects chemical 97 at full strength | [Detail](#potions-2-25-x) |
| 2 25 3 | Potion (Chem 95) | `potions` fr.0 | Injects chemical 95 at full strength | [Detail](#potions-2-25-x) |
| 2 25 4 | Potion (Chem 92) | `potions` fr.0 | Injects chemical 92 at full strength | [Detail](#potions-2-25-x) |
| 2 25 5 | Potion (Chem 93) | `potions` fr.0 | Injects chemical 93 at full strength | [Detail](#potions-2-25-x) |
| 2 25 6 | Potion (Chem 96) | `potions` fr.0 | Injects chemical 96 at full strength | [Detail](#potions-2-25-x) |
| 2 25 15 | Potion (Light Alcohol) | `potions` fr.1 | Injects 0.15 units of Alcohol (75) | [Detail](#potions-2-25-x) |
| 2 25 16 | Potion (Strong Alcohol) | `potions` fr.0 | Injects 0.45 units of Alcohol (75) | [Detail](#potions-2-25-x) |
| 2 25 17 | Potion (Chems 155/154/129) | `potions` fr.0 | Injects a mix of chems 155, 154, 129 | [Detail](#potions-2-25-x) |
| 2 25 18 | Potion (Chem 100) | `potions` fr.0 | Injects chemical 100 at full strength | [Detail](#potions-2-25-x) |
| 2 25 19 | Potion (Panacea) | `potions` fr.0 | Injects small amounts of many chemicals (broad-spectrum remedy) | [Detail](#potions-2-25-x) |
| 2 25 20 | Potion (Chems 98/99/94/3) | `potions` fr.0 | Injects chems 98, 99, 94, plus Glucose (3) | [Detail](#potions-2-25-x) |

---

## Euro Medicine Maker (2 23 2)

The Euro Medicine Maker is a compound agent with 6 parts: a charge indicator (part 1), a dispense button (part 2), a potion name label (part 3), a cycle button (part 4), a background decoration (part 5), and a cycle-forward button (part 6). It sources its labels from the external text file `medicine maker potions` (12 entries indexed 0-11).

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 4 | Activatable 1 |
| `bhvr` | 3 | Creatures can Activate1 (1) and Activate2 (2) |
| `accg` | 30 | Heavy gravity |
| `aero` | 25 | Air resistance |
| `elas` | 0 | No bounce |
| `fric` | 100 | Full friction |
| `perm` | 100 | Fully solid |
| `ov70` | 5 | Current charges remaining (max 5) |
| `ov00` | 1 | Currently selected potion type index (1-12) |
| `ov20` | rand 0-3 | Rotating variant frame used when spawning potion sprites |

### Parts

| Part | Type | Function |
|---|---|---|
| 1 | dull | Charge indicator — pose reflects `ov70` |
| 2 | butt (msg 1001) | Dispense button |
| 3 | fixd | Text display of selected potion name |
| 4 | butt (msg 1002) | Cycle-forward button (alt) |
| 5 | dull | Background animation (fluid effect during dispense) |
| 6 | butt (msg 1002) | Cycle-forward button (main) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate1 | Sends message 1001 to self (dispense) |
| 2 | Activate2 | Sends message 1002 to self (cycle) |
| 9 | Timer | Refill charges from Bioenergy when conditions permit |
| 1000 | Message | External dispense request with parameter gating |
| 1001 | Message | Dispense one potion of the currently selected type |
| 1002 | Message | Cycle selected potion type and update label |

#### Event 1 / Event 2 — Activate1 / Activate2

Forward to message 1001 or 1002 respectively.

#### Event 1000 — Message (external dispense request)

If `_p1_ > 0`, relays to message 1001. Allows other agents to request a dispense with a gating parameter.

#### Event 1001 — Dispense a Potion

Locks execution. If charges remain (`ov70 > 0`):
1. Animates the dispense button (part 2).
2. Decrements `ov70` and updates the charge indicator (part 1 pose).
3. Plays `"bep2"` sound.
4. Computes the drop position (24 px right, 78 px below machine origin).
5. Animates the background (part 5) with the fluid-pour animation and plays `"potn"` sound. Calls `over` (wait until animation completes) and broadcasts `prt: send 0 255` to downstream connections.
6. Based on `ov00` (1-12), spawns the corresponding potion agent (see Potions table below) with a cycling variant frame (`ov20` 0-3). Each potion gets its own distinct RGB tint. Placement uses `mvto` if the target position is valid, else `mvsf` (safe placement).
7. Each spawned potion gets `attr 199` (carryable, mouseable, activatable, physics, suffers collisions), `bhvr 48` (pickup + eat), `ov61 40` (CA emission intensity), `tick 20` (short initial timer), and runs `slow` to leave instant mode.
8. Animates part 5 closing and resets part 2.

If no charges remain: plays `"excl"` (exclamation) sound.

#### Event 1002 — Cycle Potion Type

Locks execution. Animates cycle button (part 6), plays `"bep2"`, increments `ov00` (wrapping from 12 back to 1). Updates the text label on part 3 by reading entry `ov00-1` from the `medicine maker potions` catalogue file.

#### Event 9 — Timer (Refill)

Every 1250 ticks:
- Counts total carrot plants (`totl 2 25 3`) — **note this reuses classifier 2 25 3 which overlaps with the Chem-95 potion; in practice this counts any agents of that classifier at the time of tick**.
- Reads global `"Bioenergy"` variable.
- If carrots ≤ 100 AND charges < 5 AND Bioenergy ≥ 40:
  1. Animates dispense and cycle buttons briefly.
  2. Adds 1 charge (`ov70 +1`), updates pose.
  3. Subtracts 40 from global `Bioenergy`.

This couples machine recharging to the world's bioenergy economy.

---

## Potions (2 25 X)

All 12 potion variants share the same physics/behavior scripts and differ only in their `eat` (event 12) chemical payload, sprite frame, and tint color. They are spawned by the medicine maker and are carryable, edible, and subject to gravity.

### Common Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable + Mouseable + Activatable 1 + Physics + Suffers Collisions |
| `bhvr` | 48 | Pickup (32) + Eat (16) |
| `accg` | 0 (set), 10 (applied on events) | Starts gravity-free; event 9 & 4 enable gravity |
| `aero` | 3 | Low air resistance |
| `elas` | 10 | Slight bounce |
| `fric` | 100 | Full friction |
| `perm` | 64 | Moderate permeability |
| `ov61` | 40 | CA emission intensity |

### Common Events (applies to all 12 potions)

| Event # | Event Name | Description |
|---|---|---|
| 4 | Collision | Sets `accg 10` (ensures gravity after bouncing) |
| 6 | Impact | Plays `"dr10"` sound effect on impact |
| 9 | Timer | If not carried: apply gravity (`accg 10`), zero velocity, set plane to 550, disable timer. If carried: re-set short timer. |
| 12 | Eat | Inject potion-specific chemicals into eater, play `"drnk"` sound, destroy self |

#### Event 9 — Timer (physics stabilizer)

After a potion is spawned (or dropped), the `tick 20` timer fires. If not carried, the potion "settles": gravity is re-enabled, its velocity is zeroed, it moves to plane 550 (foreground layer), and the timer stops. If carried, the timer persists (tick=1) but effectively idles.

#### Event 12 — Eat (chemical injection)

Common pattern for all potions:
1. Captures eater agent (`seta va16 from`).
2. Plays `"drnk"` sound.
3. Enters `inst` (atomic mode), targets the eater, injects the potion-specific chemicals listed below.
4. Leaves instant mode (`slow`), targets self, destroys self (`kill ownr`).

### Potion Chemical Payloads

| Classifier | Tint (R G B) | Chemical Injection |
|---|---|---|
| 2 25 1 | 220 100 170 | Chem 39 (Arousal Potential) at 0.4, Chem 41 (Opposite Sex Pheromone) at 0.4 |
| 2 25 2 | 230 180 130 | Chem 97 at 1.0 |
| 2 25 3 | 190 120 120 | Chem 95 at 1.0 |
| 2 25 4 | 255 255 0 | Chem 92 at 1.0 |
| 2 25 5 | 100 100 200 | Chem 93 at 1.0 |
| 2 25 6 | 190 100 200 | Chem 96 at 1.0 |
| 2 25 15 | 240 160 160 | Chem 75 (Alcohol) at 0.15 |
| 2 25 16 | 120 170 120 | Chem 75 (Alcohol) at 0.45 |
| 2 25 17 | 240 210 200 | Chem 155 at 1.0, Chem 154 at 0.5, Chem 129 at 1.0 |
| 2 25 18 | 240 20 20 | Chem 100 at 1.0 |
| 2 25 19 | 170 130 200 | Chems 100, 97, 95, 92, 93, 96, 94 each at 0.15; Chem 117 at 0.45 (broad-spectrum panacea) |
| 2 25 20 | 255 129 17 | Chem 98 at 0.35, Chem 99 at 0.35, Chem 94 at 0.15, Chem 3 (Glucose) at 0.05 |

---

## Removal Script (rscr)

1. `enum 2 23 2 → kill targ` — removes the medicine maker agent.
2. Removes scripts 1001, 1002, and 9 for the medicine maker (dispense, cycle, refill timer).
3. `enum 2 25 0 → kill targ` — attempts to remove all potions of genus 25 (note: `2 25 0` does not match any specific species; enum with species 0 iterates over all species within the genus).
4. Removes scripts 9 and 12 for classifier `2 25 1` (physics timer and eat).

The removal script is incomplete in that it only removes the event scripts for potion classifier `2 25 1`, leaving scripts for the other 11 potion variants installed. This means uninstalling and reinstalling the medicine maker could leave residual event handlers for other potion types.

## Global Variable Impact

| Variable | Effect |
|---|---|
| `"Bioenergy"` | Decremented by 40 per automatic refill tick (when conditions met) |
