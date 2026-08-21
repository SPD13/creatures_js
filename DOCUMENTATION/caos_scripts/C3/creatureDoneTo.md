# Creature "Done To" Response Scripts

## Overview

This script defines how **all creatures** (classifier `4 0 0` — Norns, Grendels, and Ettins) respond when something is done to them by the player (pointer) or by other creatures. It covers the core interaction responses: being activated (tickled/patted), being hit (slapped), colliding with the environment, and bumping into walls.

These scripts form the foundation of creature social feedback — they determine what sounds creatures make, how they learn to like or dislike whoever interacts with them, and how physical impacts affect their bodies. The scripts also handle the `forf` (friend-or-foe) brain lobe training, ensuring creatures build social memory of who treats them well or poorly.

This script does **not** create any agents. It only installs event scripts on the universal creature classifier `4 0 0`.

**Removal section**: The script includes a removal block (`rscr`) that deletes older versions of events 0, 1, 2, 4, and 6 before reinstalling them, suggesting this script replaces an earlier version of these handlers.

---

## Event Scripts

### Script Event Summary

| Event | Type | Description |
|-------|------|-------------|
| 0 | Deactivate | Creature is deactivated (slapped by pointer or creature) |
| 1 | Activate 1 | Creature is activated (tickled/patted by pointer or creature) |
| 2 | Activate 2 | Secondary activation — blocked with assertion (unused) |
| 3 | Hit | Creature is hit (similar to slap, but from hit event) |
| 4 | Pickup | Creature is picked up by pointer — disables zombie state |
| 6 | Collision | Creature collides with something — impact stimulus and knockback |
| 7 | Bump | Creature bumps into a wall — disappointment stimulus |

---

### Event 4 — Pickup

**Trigger**: Creature is picked up.

**Behavior**:
- If the creature was picked up by the pointer (`from eq pntr`), disables zombie mode (`zomb 0`), restoring normal brain-controlled behavior.
- This allows the player to "unfreeze" a zombified creature by picking it up.

---

### Event 6 — Collision

**Trigger**: Creature collides with another agent or the environment. Parameters `_p1_` and `_p2_` represent collision force values.

**Behavior**:
1. **Impact calculation**: Takes the greater of `_p1_` and `_p2_`, divides by 50, and caps at 10 to determine impact severity (`va00`).
2. **Wake on impact**: If impact severity is >= 1 and the creature is asleep, wakes it up (`aslp 0`).
3. **Pain stimulus**: Applies the **Impact stimulus (39)** repeatedly — once per unit of severity (up to 10 times). This causes proportional pain based on collision force.
4. **Knockback**: If `_p2_` > 10, applies an upward vertical velocity (`vely`) proportional to the force, launching the creature slightly into the air.

**Stimulus impact**: Stimulus 39 (Impact) applied 1-10 times based on collision force.

---

### Event 7 — Bump (Wall Collision)

**Trigger**: Creature bumps into a wall or boundary while moving autonomously.

**Behavior**:
- Only triggers if the creature's movement status is autonomous (`movs = 0`), meaning the creature walked into the wall on its own.
- Applies the **Disappointment stimulus (0)** once, teaching the creature that walking in this direction was unsuccessful.

**Stimulus impact**: Stimulus 0 (Disappoint) x1.

---

### Event 0 — Deactivate (Slap)

**Trigger**: Creature is deactivated (slapped) by the pointer or another creature.

**Behavior**:
1. **Friend-or-foe training**: Calls `forf from` to train the brain's friend/foe lobe to recognize who slapped them.
2. **Death/unconscious check**: If the creature is dead, stops. If unconscious, stops.
3. **Stimulus application**:
   - If slapped by the **pointer**: applies **Pointer Slap stimulus (3)**.
   - If slapped by a **creature**: applies **Creature Slap stimulus (4)**.
4. **Wake up**: If asleep, wakes the creature up.
5. **Pain sounds**: Plays a random pain vocalization:
   - Norns (genus 1) and Ettins (genus 3): randomly plays "ow!1", "ow!2", or "ow!3".
   - Grendels (genus 2): plays "glaf" (Grendel laugh — they enjoy being slapped).
6. **Social learning**: 20% chance (`rand 1 5 eq 5`) the creature evaluates its opinion of the slapper via `like from`.

**Stimulus impact**:
- Pointer slap: Stimulus 3 (Pointer Slap) x1
- Creature slap: Stimulus 4 (Creature Slap) x1

---

### Event 1 — Activate 1 (Tickle/Pat)

**Trigger**: Creature is activated (tickled/patted) by the pointer or another creature.

**Behavior**:
1. **Friend-or-foe training**: Calls `forf from` to train the brain.
2. **Death check**: If the creature is dead, stops.
3. **Stimulus application**:
   - If tickled by the **pointer**: applies **Pointer Pat stimulus (1)**.
   - If tickled by a **creature**: applies **Creature Pat stimulus (2)**.
4. **Wake up**: If asleep or unconscious, wakes the creature up.
5. **Mating signal detection** (INST block for atomicity):
   - If the activator (`from`) is another creature, checks if it is the same family and genus.
   - If different species: applies **Opposite Sex Tickle stimulus (46)** — a mating signal.
   - If same species: applies **Same Sex Tickle stimulus (47)** — social grooming.
6. **Happy reaction**: If the creature has low Pain (drive 0 < 0.1) AND low Anger (drive 12 < 0.1):
   - Faces south (`dirn 1`), resets pose (`pose 0`), sets happy face expression (`face 4`).
   - Plays a happy vocalization after a short wait:
     - Norns (genus 1): randomly plays "gig1", "gig2", or "gig3" (giggle).
     - Grendels (genus 2): plays "glaf" (Grendel laugh).
     - Ettins (genus 3): plays "elaf" (Ettin laugh).
7. **Social learning**: 20% chance the creature evaluates its opinion of the tickler via `like from`.

**Stimulus impact**:
- Pointer pat: Stimulus 1 (Pointer Pat) x1
- Creature pat: Stimulus 2 (Creature Pat) x1
- Opposite sex tickle: Stimulus 46 (Opposite Sex Tickle) x1
- Same sex tickle: Stimulus 47 (Same Sex Tickle) x1

---

### Event 2 — Activate 2 (Blocked)

**Trigger**: Secondary activation event.

**Behavior**:
- Contains only `dbg: asrt 0 = 1` — a debug assertion that always fails.
- This effectively means this event should never be triggered in normal gameplay. It exists as a debugging safeguard.

---

### Event 3 — Hit

**Trigger**: Creature is hit by another agent.

**Behavior**:
Identical to Event 0 (Deactivate/Slap) with one difference:
- If hit by the **pointer**: applies **Pointer Slap stimulus (3)**.
- If hit by a **creature**: no stimulus is applied (the `else` branch is empty).
- Otherwise, same pain sounds, friend-or-foe training, wake-up logic, and 20% social learning.

**Stimulus impact**:
- Pointer hit: Stimulus 3 (Pointer Slap) x1

---

## Stimulus Summary

| Stimulus # | Name | Applied In | Context |
|-----------|------|-----------|---------|
| 0 | Disappoint | Event 7 (Bump) | Creature walks into wall |
| 1 | Pointer Pat | Event 1 (Activate 1) | Player tickles creature |
| 2 | Creature Pat | Event 1 (Activate 1) | Another creature tickles |
| 3 | Pointer Slap | Event 0, 3 (Deactivate, Hit) | Player slaps/hits creature |
| 4 | Creature Slap | Event 0 (Deactivate) | Another creature slaps |
| 39 | Impact | Event 6 (Collision) | Physical collision, 1-10x based on force |
| 46 | Opposite Sex Tickle | Event 1 (Activate 1) | Different species creature tickles |
| 47 | Same Sex Tickle | Event 1 (Activate 1) | Same species creature tickles |

---

## Removal Section

The `rscr` block removes older versions of scripts for events 0, 1, 2, 4, and 6 on classifier `4 0 0` using `scrx`, then reinstalls the updated versions defined in this file. Events 3 and 7 are not removed, suggesting they were newly added in this version.
