# Creature-to-Creature Interaction Scripts

**Source File:** `Bootstrap/001 World/creatureToCreature.cos`

## Overview

This script defines two creature-to-creature interaction behaviors for all creature types (Norns, Grendels, and Ettins). It handles what happens when a creature is idle while focused on another creature (introvert quiescent) and when a creature decides to hit another creature (introvert hit). These are part of the introvert action set (events 32-47), which fire when the brain's decision lobe selects an action and the IT object is another creature.

The script does not create any agents. It registers behavior scripts on the universal creature classifier `4 0 0`.

---

## Scripts Registered

| Classifier | Event | Event Name | Description |
|---|---|---|---|
| `4 0 0` | 32 | Introvert Quiescent | Idle fidgeting animation when focused on another creature |
| `4 0 0` | 45 | Introvert Hit | Creature hits/slaps another creature |

---

## Event 32 — Introvert Quiescent (Idle)

**Behavior:** When a creature's brain selects the "do nothing" action while focused on another creature, this script plays idle fidgeting animations in a continuous loop.

**Animation Logic:**
- 50% chance: plays pose 57, waits 20-40 ticks
- 50% chance: plays pose 59, waits 1-10 ticks, then pose 60, waits 1-10 ticks

This creates a natural-looking idle behavior with occasional fidgets and posture changes.

**Stimulus Impact:**

| Target | Stimulus | Name | Strength | Description |
|---|---|---|---|---|
| `targ` (self) | 12 | Quiescent | 1.0 | Reduces boredom, provides idle feedback each loop iteration |

---

## Event 45 — Introvert Hit

**Behavior:** When a creature's brain selects the "hit" action directed at another creature, this script executes the full slap/punch interaction including approach, contact, animation, sound effects, and biochemical consequences.

### Execution Flow

1. **Approach phase:** The creature approaches (`appr`) and attempts to touch (`touc`) the target creature (`_it_`). If the target becomes null at any point, the creature receives a disappointment stimulus and stops.

2. **Reach check:** If `byit` is 0 (creature cannot reach the target), the creature receives a disappointment stimulus and stops.

3. **Dead check:** If the target creature is dead (`dead ne 0`), the attacking creature receives a disappointment stimulus and stops.

4. **Wake target:** The target creature is woken up. If dreaming (`drea eq 1`), dreaming is stopped with `drea 0`. Otherwise, `aslp 0` is used to wake from sleep.

5. **Release hold:** `nohh` releases any pointer hand-holding on the target creature.

6. **Attack animation and sound:**
   - Plays hit animation sequence `[111 112 113 114 111]`
   - If the target is **not a Grendel** (`gnus ne 2`): plays "spnk" (spank) sound
   - If the target **is a Grendel** (`gnus eq 2`): plays "punc" (punch) sound

7. **Aggression stimulus to attacker:** The attacking creature (`ownr`) receives stimulus 44 (aggression) with strength 1.0.

8. **Pain notification:** Sends message 3 (hit event) to the target creature (`_it_`).

### Pain Calculation (Age-Based)

The pain stimulus sent to the target creature is scaled based on the **attacker's** life stage (`cage`), reflecting that older/larger creatures hit harder:

| Attacker Age Stage | `cage` Value | Base Multiplier |
|---|---|---|
| Baby | 0 | 0.0 |
| Child | 1 | 0.25 |
| Adolescent | 2 | 0.5 |
| Youth | 3 | 0.75 |
| Adult | 4 | 1.0 |
| Old | 5 | 0.5 |
| Senile | 6 | 0.0 |

The base multiplier has 1.0 added to it (range becomes 1.0 to 2.0 for non-zero values). If the attacker and target are the **same genus** (same creature type), the pain is reduced to 25% (`mulv va00 0.25`), reflecting that same-species hits are less severe.

If the final pain value is non-zero, it is applied as stimulus 4 (creature slap) to the target creature.

### Stimulus Impact

| Target | Stimulus | Name | Strength | Description |
|---|---|---|---|---|
| `ownr` (attacker) | 0 | Disappointment | 1.0 | When target is unreachable, null, or dead |
| `ownr` (attacker) | 44 | Aggression | 1.0 | Attacker feels aggressive after hitting |
| `_it_` (victim) | 4 | Creature Slap | 1.0–2.0 (age-scaled) | Pain from being hit, reduced to 25% for same-genus |
