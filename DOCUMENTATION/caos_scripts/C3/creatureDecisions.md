# creatureDecisions.cos

## Overview

This script defines the **creature extrovert decision behaviors** for all creatures (classifier `4 0 0`). It installs event scripts 16-29, which are the outward-facing actions creatures perform when their brain's decision lobe selects an action directed at the world. These scripts control how creatures interact with objects and other agents: standing idle, activating things, picking them up, eating, hitting, sleeping, expressing needs, walking, and dropping items.

Each script validates that the target object exists and supports the intended interaction (via `bhvr` bit checks), applies the appropriate creature stimulus for biochemical feedback, sends activation messages to the target agent, and plays creature pose animations. If the target doesn't support the action, the creature receives a "disappoint" stimulus instead.

The script also creates a **sleep bubble agent** (`1 2 28`) that visually indicates when a creature is sleeping.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `1 2 28` | Sleep Bubble (zzzz) | Visual "zzz" indicator created above a sleeping creature | [Details](#agent-1-2-28-sleep-bubble) |

## Creature Decision Scripts (4 0 0)

### Event 16 - Quiescent (Stand and Watch)

The creature stands idle near its target. Randomly chooses between two idle animations (pose 57 or poses 59-60) with variable wait times. Emits **stimulus 12 (Quiescent)** periodically to provide biochemical feedback for standing still.

### Event 17 - Activate 1

The creature approaches and touches its target. Checks if the target supports **Activate 1** (bhvr bit 1). If supported and the creature is close enough (`byit ne 0`):
- Checks if the target has a script for event 1 (`sorq` with param 1). If no script exists, sets `va99 = 1` (indicating a "novel" interaction).
- Emits **stimulus 13 (Activate1)** with the novelty flag.
- Sends **message 0 (Activate 1)** to the target.
- Plays pose 12 (standing) and waits.

If the target doesn't support Activate 1, emits **stimulus 0 (Disappoint)** and plays a random frustrated pose (39 or 45).

### Event 18 - Activate 2

Same structure as Event 17 but for the **Activate 2** interaction. Checks bhvr bit 2, checks script availability for event 2, emits **stimulus 14 (Activate2)**, and sends **message 1 (Activate 2)** to the target. Disappointment behavior is identical.

### Event 19 - Deactivate

Same structure as Events 17-18 but for **Deactivate**. Checks bhvr bit 4, checks script availability for event 0, emits **stimulus 15 (Deactivate)**, and sends **message 2 (Deactivate)** to the target. Disappointment behavior is identical.

### Event 20 - Seek (Approach and Look)

The creature approaches its target. If it cannot reach the target (`byit eq 0`), emits **stimulus 0 (Disappoint)**. Otherwise waits briefly. This is the simplest interaction - the creature just goes near the object.

### Event 21 - Retreat (Avoid)

The creature performs a retreat/avoidance behavior based on its current drives:
- If **Fear** (drive 10) > 0.25: plays a fear animation (poses 53-56), priority 1
- If **Pain** (drive 0) > 0.5: plays a flinch animation (poses 52-49), priority 2
- If **Crowdedness** (drive 9) > 0.25: plays an avoidance animation (poses 49-52), priority 3
- Otherwise: randomly picks one of the three animations

After the animation, emits **stimulus 17 (Retreat)** and stops the current action.

### Event 22 - Pick Up

The creature approaches and attempts to pick up its target. Checks bhvr bit 32 (pickup permission). If not allowed, emits **stimulus 0 (Disappoint)** and stops.

If pickup is allowed and the creature touches the target:
- Drops any currently held item first (sends **message 5 (Drop)** to held item)
- Checks script availability for event 4 on the target. If no script, sets novelty flag.
- Emits **stimulus 18 (Get)** with the novelty flag.
- Sends **message 4 (Pickup)** to the target.
- Plays pose 12 and loops waiting (creature holds the item indefinitely until another decision).

If the target can't be reached, emits **stimulus 0 (Disappoint)**.

### Event 23 - Drop

The creature attempts to drop whatever it's currently holding. If holding nothing, emits **stimulus 0 (Disappoint)** and stops.

If holding an item:
- Checks script availability for event 5 on the held item. If no script, sets novelty flag.
- Emits **stimulus 19 (Drop)** with the novelty flag.
- Sends **message 5 (Drop)** to the held item.
- Plays poses 0 then 12 with waits.

### Event 24 - Express Need

The creature vocalizes its most pressing need. The script has two branches:

**If sick (any antigen chemical 82-89 > 0.2):** The creature skips need expression and just emits the stimulus. Illness overrides normal need expression.

**If healthy:** Finds the highest drive among drives 0-12 and maps it to a corresponding pose:
| Drive | Name | Pose |
|---|---|---|
| 0 | Pain | 35 |
| 1 | Hunger (Protein) | 89 |
| 2 | Hunger (Carbohydrate) | 47 |
| 3 | Hunger (Fat) | 36 |
| 4 | Coldness | 37 |
| 5 | Hotness | 37 |
| 6 | Tiredness | 12 |
| 7 | Sleepiness | 38 |
| 8 | Loneliness | 42 |
| 9 | Crowdedness | 51 |
| 10 | Fear | anim 40-41 |
| 11 | Boredom | 121 |
| 12 | Anger | anim 42-43 |

If the highest drive is below 0.25 (creature is content), plays pose 33 (happy/content). Otherwise plays pose 34 followed by the drive-specific pose.

The creature then calls **sayn** (vocalizes its need aloud) and emits **stimulus 20 (ExpressNeed)**.

### Event 25 - Rest / Sleep

The creature attempts to rest or sleep based on its **Sleepiness** drive (drive 7):

**If Sleepiness > 0.6 (very sleepy):**
- Locks the script to prevent interruption.
- Sets involuntary action latency (`ltcy 5 90 190`) to prevent repeated sleep triggers.
- Plays drowsy pose 57, waits, then emits **stimulus 21 (Rest)**.
- Puts creature to sleep (`aslp 1`).
- **Creates a Sleep Bubble agent** (`1 2 28`) with sprite "zzzz" to show visual zzz indicator.
- Enters a dream loop:
  - Activates dreaming (`drea 1`) to process instincts.
  - Plays snoring sound ("gsnr" for genus 2/Grendels, "zzzz" for others) every 10 iterations.
  - Emits **stimulus 22 (Sleep)** each cycle.
  - Continues until both Sleepiness (drive 7) and Tiredness (drive 6) drop below 0.10.
- Wakes up (`aslp 0`), unlocks script.

**If Sleepiness <= 0.6 (just tired):**
- Creature rests without fully sleeping.
- Loops emitting **stimulus 21 (Rest)** until Tiredness (drive 6) drops below 0.10.

### Event 26 - Walk West

The creature turns west (`dirn 3`), starts walking, and enters an infinite loop emitting **stimulus 23 (TravelWestEast)** every 20 ticks. The creature will continue walking until the brain makes a new decision.

### Event 27 - Walk East

Identical to Event 26 but facing east (`dirn 2`). Emits **stimulus 23 (TravelWestEast)** continuously while walking.

### Event 28 - Eat

The creature approaches and attempts to eat its target. Checks bhvr bit 16 (eat permission). If not allowed, emits **stimulus 0 (Disappoint)** and stops.

If eating is allowed and the creature touches the target:
- Drops any currently held item first (if holding something different from target).
- Sends **message 4 (Pickup)** to the target (picks it up to eat).
- Plays pose 73 (eating).
- Sends **message 12 (Eat)** to the target.
- Checks script availability for event 12. If no script, sets novelty flag.
- Emits **stimulus 26 (Eat)** with the novelty flag.
- Plays eating animation sequence (poses 73, 74, 12).

If the target can't be reached, emits **stimulus 0 (Disappoint)**.

### Event 29 - Hit

The creature approaches and attempts to hit its target. Checks bhvr bit 8 (hit permission). If the target supports hitting and the creature is close enough:
- Plays hit animation (poses 111-114-111).
- Sends **message 3 (Hit)** to the target.
- Checks script availability for event 3. If no script, sets novelty flag.
- Emits **stimulus 44 (Aggression)** with the novelty flag.

If the target doesn't support hitting, emits **stimulus 0 (Disappoint)**.

---

## Agent Details

### Agent `1 2 28` - Sleep Bubble

A simple visual agent created when a creature falls asleep (Event 25). Displays a "zzzz" sprite floating above the sleeping creature.

**Creation**: `new: simp 1 2 28 "zzzz" 17 0 6000`
- Sprite: "zzzz" (17 frames, plane 6000 to render on top)
- Stores a reference to the sleeping creature in `ov00`
- `ov01` initialized to 0
- Ticks every 5 game ticks

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Tick script (defined elsewhere, presumably animates the zzz and tracks the sleeping creature) |

**Lifecycle**: Created when a creature enters deep sleep. The bubble agent tracks its owner creature via `ov00` and is expected to remove itself when the creature wakes up (handled by the bubble's own timer script).

## Stimulus Summary

| Stimulus # | Name | Used In |
|---|---|---|
| 0 | Disappoint | Events 17, 18, 19, 20, 22, 23, 28, 29 (failed interactions) |
| 12 | Quiescent | Event 16 |
| 13 | Activate1 | Event 17 |
| 14 | Activate2 | Event 18 |
| 15 | Deactivate | Event 19 |
| 17 | Retreat | Event 21 |
| 18 | Get | Event 22 |
| 19 | Drop | Event 23 |
| 20 | ExpressNeed | Event 24 |
| 21 | Rest | Event 25 |
| 22 | Sleep | Event 25 (dream loop) |
| 23 | TravelWestEast | Events 26, 27 |
| 26 | Eat | Event 28 |
| 44 | Aggression | Event 29 |

## Behavioral Notes

- **Novelty detection**: Most interaction scripts use `sorq` to check if the target has a handler script for the corresponding event. If the target lacks the script (novel object), `va99` is set to 1 and passed as a parameter to the stimulus, allowing the creature's biochemistry to reward exploration of new objects.
- **Disappoint feedback**: When a creature attempts an action that the target doesn't support (checked via `bhvr` bits), it receives stimulus 0 (Disappoint) as negative biochemical feedback, teaching it not to repeat fruitless interactions.
- **Null safety**: Every script that involves approaching or touching a target includes multiple null checks (`doif _it_ eq null`) after `appr` and `touc` commands, since the target may be destroyed during movement.
- **Sleep system**: The sleep behavior in Event 25 is the most complex decision, featuring script locking, agent creation, dream processing for instinct learning, species-specific sounds, and dual-drive monitoring for wake conditions.
