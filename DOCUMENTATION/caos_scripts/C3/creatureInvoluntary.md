# Creature Involuntary Actions

This script defines all **involuntary actions** for creatures — automatic physical responses that are triggered by the creature's biochemistry rather than by deliberate decisions. These include flinching from pain, sneezing, coughing, shivering from cold, falling asleep, fainting, drowning, and dying. Each action plays species-specific animations and sounds, triggers the corresponding biochemical stimulus, and in some cases creates helper visual-effect agents (sleep Z's, drowning bubbles, death clouds).

The script covers all three creature species: **Norns** (4 0 0), **Grendels** (4 2 0), and **Ettins** (4 3 0), with each species having its own animation frames and sound effects where applicable.

## Created Agents

| Classifier | Sprite | Description | Details |
|---|---|---|---|
| 1 2 28 | `zzzz` | [Sleep Z's visual effect](#sleep-zs-agent-1-2-28) | Floating Z's that follow a sleeping creature |
| 1 2 41 | `bubs` | [Drowning bubbles](#drowning-bubbles-agent-1-2-41) | Bubbles emitted by a drowning creature |
| 1 1 56 | `death_cloud` / `death_sludge` | [Death visual effect](#death-visual-effect-agent-1-1-56) | Cloud or sludge effect spawned when a creature dies |

---

## Script Details by Involuntary Event

### Flinch — Event 64 (INVOLUNTARY0)

**Norn (4 0 0)** and **Grendel (4 2 0)** each have a flinch script. The creature briefly adopts a pain pose (frame 75), plays a species-specific sound (`"ow!1"` for Norns, `"gslp"` for Grendels), and waits 10 ticks. A latency of 25–50 ticks prevents rapid re-triggering.

| Property | Value |
|---|---|
| Stimulus | `stim writ ownr 28 1` (INVOL0 — Flinch) |
| Latency | 0–25–50 ticks |

### Sneeze — Event 66 (INVOLUNTARY2)

The creature plays a sneeze animation (frames 071–072) then a sneeze-completion frame (106 for Norns). Species-specific sounds: `"snee"` (Norns), `"gshv"` (Grendels). After the sneeze completes, the creature sends **message 300** to itself to potentially expel bacteria.

| Property | Value |
|---|---|
| Stimulus | `stim writ ownr 30 1` (INVOL2 — Sneeze) |
| Latency | 2–25–35 ticks |
| Side effect | Sends message 300 (expel bacteria) to self |

### Cough — Event 67 (INVOLUNTARY3)

A coughing animation (frames 098–100) with species-specific sounds: `"coug"` (Norns), `"gshv"` (Grendels), `"ecof"` (Ettins). Ettins have a distinct recovery animation (frames 101–100–101). Like sneezing, coughing triggers message 300 to expel bacteria.

| Property | Value |
|---|---|
| Stimulus | `stim writ ownr 31 1` (INVOL3 — Cough) |
| Latency | 3–25–35 ticks |
| Side effect | Sends message 300 (expel bacteria) to self |

### Shiver — Event 68 (INVOLUNTARY4)

A shivering animation loops through frames 046–047 repeatedly. Species-specific sounds: `"shiv"` (Norns), `"gshv"` (Grendels), `"eshv"` (Ettins). After the animation, the creature waits a random 50–150 ticks while holding pose 46.

| Property | Value |
|---|---|
| Stimulus | `stim writ ownr 32 1` (INVOL4 — Shiver) |
| Latency | 4–30–90 ticks |

### Sleep — Event 69 (INVOLUNTARY5)

The most complex involuntary action. The script **locks** execution, sets the creature to sleep pose (57), applies stimulus 21 (sleep trigger), then puts the creature to sleep with `aslp 1`. It creates a **Sleep Z's agent** (1 2 28) to display floating Z's above the creature.

The creature then enters a dream loop (`drea 1`), periodically playing snoring or sleeping sounds (`"gsnr"` for Grendels, `"zzzz"` for others), cycling through pose 58, and applying stimulus 33 (INVOL5) each iteration. The loop continues until both **sleepiness** (drive 7) and **tiredness** (drive 6) drop below 0.10, at which point the creature wakes up (`aslp 0`).

| Property | Value |
|---|---|
| Stimulus (entry) | `stim writ targ 21 1` (Sleep trigger) |
| Stimulus (loop) | `stim writ targ 33 1` (INVOL5 — Sleep) |
| Latency | 5–90–190 ticks |
| Wake condition | `driv 7 < 0.10 AND driv 6 < 0.10` |
| Agent created | 1 2 28 "zzzz" (Sleep Z's) |

### Fainting — Event 70 (INVOLUNTARY6)

The creature adopts pose 58 and plays a death/fainting sound 1–3 times with random delays (40–140 ticks between each). Species-specific sounds: `"dead"` (Norns), `"gdie"` (Grendels), `"edie"` (Ettins). Each repetition applies stimulus 22 (faint trigger).

| Property | Value |
|---|---|
| Stimulus | `stim writ targ 22 1` (Faint trigger) |
| Latency | 6–70–210 ticks |
| Repetitions | Random 1–3 |

### Drowning — Event 71 (INVOLUNTARY7)

Triggered when a creature is submerged in water. The creature adopts a random pose (0–99), applies stimulus 35 (INVOL7), then checks biochemical locus `1 1 4 9`. If the locus equals 0.0 (indicating drowning condition), the creature plays a bubble sound (`"bubf"`) and creates a **Drowning Bubbles agent** (1 2 41). Before creating new bubbles, the script checks that no existing bubble agent is already attached to this creature.

| Property | Value |
|---|---|
| Stimulus | `stim writ targ 35 1` (INVOL7 — Drowning) |
| Latency | 7–10–20 ticks |
| Agent created | 1 2 41 "bubs" (Drowning Bubbles) — conditional |

### Death — Event 72 (DIE)

The death script **locks** execution and performs the full death sequence:

1. Drops any held object (`nohh`)
2. Sets attributes to 192 (non-interactive)
3. Sets death pose (77)
4. Emits smell into the room: increases CA channels 3 and 4 by 0.5 (if in a valid room and not carried)
5. Plays species-specific death sound: `"dead"` (Norn), `"gdie"` (Grendel), `"edie"` (Ettin)
6. If the game variable `"Grettin"` is 1 or the creature is a Norn (genus 1), waits until the creature is visible to the player (or `ov81` is set), then waits 400 ticks
7. Creates a **Death Visual Effect agent** (1 1 56): `"death_cloud"` for Norns/Ettins, `"death_sludge"` for Grendels
8. Sends message 100 to the death effect with the dying creature as a parameter

| Property | Value |
|---|---|
| Room CA impact | Channel 3 +0.5, Channel 4 +0.5 (smell of death) |
| Agent created | 1 1 56 "death_cloud" or "death_sludge" |

---

## Helper Agent Details

### Sleep Z's Agent (1 2 28)

A simple visual-effect agent that displays floating Z's above a sleeping creature. Created during the sleep involuntary action (event 69).

| Property | Value |
|---|---|
| Classifier | 1 2 28 |
| Sprite | `zzzz` |
| Image count | 17 |
| Plane | 6000 |
| Tick rate | 5 |

#### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Periodic position update and lifecycle management |

#### Timer Script Behavior (Event 9)

The timer script keeps the Z's agent positioned near the sleeping creature and manages its lifecycle:

1. **Null check**: If the linked creature (`ov00`) is null, the agent kills itself
2. **Awake check**: If the creature is no longer asleep (`aslp eq 0`), the agent kills itself
3. **Dead check**: If the creature is dead (`dead eq 1`), the agent kills itself
4. **Unconscious check**: If the creature is unconscious (`uncs eq 1`), the agent kills itself
5. **Position tracking**: Tracks whether the creature has moved by comparing `ov02`/`ov03` with the creature's current `posl`/`post`
6. **Animation**: On first tick (`ov01 eq 0`), starts a looping animation cycling through all 17 frames
7. **Position update**: If the creature moved, calculates a new position near the creature's head area (left/right based on creature direction, 75% of creature height above top)

**Agent variables:**
- `ov00`: Reference to the sleeping creature
- `ov01`: Animation started flag (0 = not started, 1 = started)
- `ov02`: Last known creature left position
- `ov03`: Last known creature top position

### Drowning Bubbles Agent (1 2 41)

A bubble visual effect created when a creature is drowning. The agent's behavior is defined in the `creatureBubbles` script. Created conditionally during the drowning involuntary action (event 71) — only if no existing bubble agent is already attached to the creature.

| Property | Value |
|---|---|
| Classifier | 1 2 41 |
| Sprite | `bubs` |
| Image count | 29 |
| Plane | 6000 |
| Tick rate | 4 |

**Agent variables:**
- `ov00`: Reference to the drowning creature
- `ov01`: Animation started flag

### Death Visual Effect Agent (1 1 56)

A visual effect spawned when a creature dies. Uses different sprites based on creature species: `"death_cloud"` for Norns and Ettins (25 frames), `"death_sludge"` for Grendels (24 frames). The effect receives message 100 with the dying creature as a parameter and handles the visual death sequence.

| Property | Value |
|---|---|
| Classifier | 1 1 56 |
| Sprite | `death_cloud` (Norn/Ettin) or `death_sludge` (Grendel) |
| Image count | 25 or 24 |
| Plane | 8450 |

---

## Expel Bacteria — Event 300

A custom event triggered by sneezing (event 66) and coughing (event 67). When a creature sneezes or coughs, it sends message 300 to itself. This script handles the potential expulsion of bacteria from the creature.

The script enumerates all bacteria agents (2 32 23) in the world and counts how many are attached to the current creature (`ov00 eq ownr`). If bacteria are found, one is randomly selected and given a message (101) to detach and launch away from the creature. The launch direction is determined by the creature's facing direction (`dirn`), and the launch position is set at the creature's X position, 30 pixels below the creature's top.

| Property | Value |
|---|---|
| Trigger | Message 300, sent by sneeze (event 66) and cough (event 67) |
| Target agents | 2 32 23 (Bacteria) |
| Effect | Randomly expels one attached bacterium |

---

## Summary of Stimuli Used

| Stimulus # | Name | Triggered By |
|---|---|---|
| 21 | Sleep trigger | Sleep entry (event 69) |
| 22 | Faint trigger | Fainting loop (event 70) |
| 28 | INVOL0 — Flinch | Flinch (event 64) |
| 30 | INVOL2 — Sneeze | Sneeze (event 66) |
| 31 | INVOL3 — Cough | Cough (event 67) |
| 32 | INVOL4 — Shiver | Shiver (event 68) |
| 33 | INVOL5 — Sleep | Sleep loop (event 69) |
| 35 | INVOL7 — Drowning | Drowning (event 71) |
