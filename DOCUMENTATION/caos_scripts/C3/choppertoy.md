# choppertoy.cos — Chopper Toy (Wind-Up Helicopter)

## Overview

This script creates two wind-up helicopter toys in the Creatures 3 world. The chopper toy is a two-phase interactive toy: when a creature pushes or pulls it, the toy launches a small helicopter rotor (a separate agent) upward. The rotor flies up, reaches its peak, deploys a parachute, and drifts back down, exploding in a puff of smoke when it lands. The interaction sends stimulus 97 (`PLAYED_WITH_TOY`) to the creature, satisfying their play drive.

Two instances are created:
- **Chopper Toy 1** at position (1639, 700)
- **Chopper Toy 2** at position (750, 1869)

Both share the same sprite ("choppertoy") and identical physics properties. Each toy has an `ov61` of 100 (toy smell intensity), making it strongly detectable by creatures.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `2 21 7` | Chopper Toy (Base) | The wind-up helicopter toy that creatures interact with to launch a rotor | [Details](#agent-2-21-7-chopper-toy-base) |
| `2 21 8` | Chopper Rotor | The launched helicopter rotor that flies up, deploys a parachute, and explodes on landing | [Details](#agent-2-21-8-chopper-rotor) |
| `1 1 120` | Explosion Effect | A short-lived visual explosion/smoke effect created when the rotor hits the ground | [Details](#agent-1-1-120-explosion-effect) |

---

## Agent `2 21 7` — Chopper Toy (Base)

The chopper toy is the main interactive agent — a small wind-up helicopter sitting on the ground that creatures can push or pull. When activated, it spawns a rotor projectile, plays a sound, and briefly changes to a "launched" pose before resetting.

### Agent Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activateable (4) + Greedy Cabin (64) + Suffers Physics (128) |
| `bhvr` | 35 | Activate 1 / Push (1) + Activate 2 / Pull (2) + Drop (32) |
| `clac` | 0 | Default clik action (no special click behavior) |
| `elas` | 0 | No elasticity — does not bounce |
| `accg` | 2 | Low gravity |
| `fric` | 100 | Maximum friction — stays where placed |
| `perm` | 60 | Moderate permeability |
| `ov61` | 100 | Strong toy smell intensity |

### Events

| Event | Script Number | Description |
|---|---|---|
| Push (Activate 1) | 1 | Creature pushes the toy — launches a rotor upward |
| Pull (Activate 2) | 2 | Creature pulls the toy — launches a rotor upward |
| Timer | 9 | Reset toy to idle state after launch |

### Event Details

#### Push (Event 1) — Activate 1

Only fires if the toy is not being carried by the inventory agent (`carr ne game "c3_inventory"`). The script:

1. Plays the launch sound `"ct_1"`.
2. Sends stimulus 97 (`PLAYED_WITH_TOY`) to the creature at intensity 1.
3. Disables further clicks (`clac -1`) to prevent re-activation during the launch sequence.
4. Calculates a spawn position just to the left of and above the toy (`posl + 1`, `post - 1`).
5. Creates a new Chopper Rotor agent (`2 21 8`) at the spawn point, using frame 23 of the "choppertoy" sprite with 2 frames base and plane 5001.
6. Gives the rotor an upward velocity (`vely -10`) and starts its spinning animation (`[0 1 2]`).
7. Sets a tick of 2 on the rotor for its timer script.
8. Changes the base toy to pose 1 (launched appearance) and sets a tick of 30 to reset via the timer script.

**Stimulus impact:**
- `stim writ from 97 1` — Sends stimulus 97 (`PLAYED_WITH_TOY`) to the activating creature at intensity 1

#### Pull (Event 2) — Activate 2

Identical behavior to Push (Event 1). Both activate actions launch the rotor in the same way.

**Stimulus impact:**
- `stim writ from 97 1` — Sends stimulus 97 (`PLAYED_WITH_TOY`) to the activating creature at intensity 1

#### Timer (Event 9) — Reset

Resets the base toy to its idle state: sets pose back to 0, stops the timer (`tick 0`), and re-enables clicking (`clac 0`) so creatures can activate it again.

---

## Agent `2 21 8` — Chopper Rotor

The launched helicopter rotor is a short-lived projectile agent spawned by the base toy. It spins upward, reaches its peak, deploys a parachute animation, and then drifts sideways until it hits the ground and explodes.

### Agent Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 192 | Greedy Cabin (64) + Suffers Physics (128) |
| `elas` | 0 | No elasticity — does not bounce |
| `perm` | 60 | Moderate permeability |
| `fric` | 100 | Maximum friction |

### Events

| Event | Script Number | Description |
|---|---|---|
| Timer | 9 | Handles flight phases: upward spin and parachute deployment |
| Collision (Bump) | 6 | Rotor hits the ground — triggers explosion and cleanup |

### Event Details

#### Timer (Event 9) — Flight Phases

The rotor uses `ov00` as a state flag to track its flight phase:

**Phase 0 — Ascending (ov00 = 0):**
Checks if the rotor's vertical velocity has become non-negative (`vely >= 0`), meaning it has reached or passed the peak of its arc. When this happens:
- Sets `ov00` to 1 (transition to descent phase).
- Plays the parachute deployment animation (`[3 4 5 6 7 8 9 10 11 12 13 14]`).
- Waits for the animation to complete (`over`).
- Plays the descent sound `"ct_2"`.
- Assigns a random horizontal velocity (2–4 pixels/tick, randomly left or right) to make the rotor drift sideways.
- Starts the drifting/falling animation (`[15 16 17 18 19 20 21 22 255]`).

**Phase 1 — Descending (ov00 = 1):**
While falling, if the rotor is not touching the ground (`fall eq 0` is false, i.e., it's still airborne), applies a slight upward force (`vely -2`) to simulate parachute drag and slow the descent.

#### Collision / Bump (Event 6) — Ground Impact

When the rotor collides with the floor (`wall eq down`):
1. Fades out the rotor (`fade`).
2. Calculates a position 30 pixels left and 20 pixels above the rotor's bottom-left corner.
3. Plays the explosion sound `"ct_4"`.
4. Creates an Explosion Effect agent (`1 1 120`) using frame 7 of the "choppertoy" sprite, with 25 frames and plane 5005.
5. Plays the explosion animation (`[0 1 2 3 4 5 6]`) in slow motion.
6. Waits for the animation to complete (`lock` + `over`), then kills both the explosion effect and the rotor itself (`kill targ` + `kill ownr`).

---

## Agent `1 1 120` — Explosion Effect

A purely visual, short-lived agent that displays a small explosion/smoke puff animation when the chopper rotor hits the ground. It is created, animated once, and immediately destroyed.

### Agent Properties

| Property | Value | Description |
|---|---|---|
| Sprite | "choppertoy" frame 7 | Uses frames from the choppertoy sprite sheet |
| Frames | 25 | Base frame count for the explosion segment |
| Plane | 5005 | High plane value to render on top of other agents |

### Behavior

The explosion plays a 7-frame animation (`[0 1 2 3 4 5 6]`) in slow motion (`slow`), then is immediately killed. It has no interactive properties and cannot be clicked or carried. It exists only for the visual effect of the rotor's ground impact.

---

## Removal Script

The removal script (`rscr`) cleans up all instances:
1. Enumerates and kills all Chopper Toy base agents (`2 21 7`).
2. Enumerates and kills all Chopper Rotor agents (`2 21 8`).
