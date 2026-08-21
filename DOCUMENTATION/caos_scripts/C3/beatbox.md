# beatbox.cos — Beatbox Music Toy

## Overview

This script creates a beatbox — an interactive musical toy that creatures can play with to produce rhythmic beats. The beatbox is a compound agent with a clickable button that cycles through four different beat patterns (mb_1 through mb_4), each with its own tempo. Creatures can activate the beatbox by pushing or pulling it, which triggers a beat animation and starts the automatic beat cycle. The beatbox can also be hit, which produces a percussion sound effect, flings the agent upward, and sends a `PLAYED_WITH_TOY`-adjacent stimulus (92) to the creature.

The beatbox features CAOS port connectivity — it has an input port and an output port, allowing it to be wired into agent communication networks. When a non-zero signal arrives on the input port, it triggers the beat reset (message 0), effectively restarting the beat cycle.

A single instance is created at position (1500, 900).

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| `2 21 12` | Beatbox | A compound music toy with cycling beats, button interaction, and port connectivity | [Details](#agent-2-21-12-beatbox) |

---

## Agent `2 21 12` — Beatbox

A compound agent composed of three parts: a main body (part 0), a clickable button (part 1), and an animated display/speaker element (part 2). The beatbox cycles through four beat sounds at varying tempos when activated, creating a simple rhythmic loop. It supports both creature interaction and port-based signaling.

### Compound Parts

| Part | Type | Sprite | Description |
|---|---|---|---|
| 0 | Body (compound root) | `beatbox` frame 11 | Main body of the beatbox |
| 1 | Button (`pat: butt`) | `beatbox` frames 11–14 | Clickable button that sends message 1000 to owner when clicked |
| 2 | Display (`pat: dull`) | `beatbox` frames 15–45 | Animated speaker/display element |

### Ports

| Port | Type | Name | Position | Description |
|---|---|---|---|---|
| Input | `prt: inew` | "input" | (32, 36) | Receives signals; non-zero values trigger beat reset (message 1002 → message 0) |
| Output | `prt: onew` | "outut" | (47, 36) | Output port for wiring to other agents (note: "outut" is a typo in the original script) |

### Agent Properties

| Property | Value | Description |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseable (2) + Activateable (4) + Greedy Cabin (64) + Suffers Physics (128) |
| `bhvr` | 43 | Activate 1 / Push (1) + Activate 2 / Pull (2) + Hit (8) + Pickup (32) |
| `clac` | 0 | Click action initially enabled (clic message 1000 via button) |
| `elas` | 0 | No elasticity — does not bounce |
| `fric` | 100 | Maximum friction — stops immediately on surfaces |
| `perm` | 60 | Moderate permeability |
| `accg` | 5 | Moderate gravity |
| `ov00` | 0 (default) | Beat cycle counter — cycles 0 through 3 to select which beat sound to play |
| `ov61` | 100 | Smell intensity (strong toy smell) |

### Events

| Event | Script Number | Description |
|---|---|---|
| Push (Activate 1) | 1 | Creature pushes the beatbox — plays beat animation and starts sound cycle |
| Pull (Activate 2) | 2 | Creature pulls the beatbox — identical behavior to push |
| Hit | 3 | Creature hits the beatbox — percussion sound, fling upward, stimulus |
| Timer | 9 | Timer tick — resets all parts to idle pose and stops ticking |
| Button Click | 1000 | Custom: button clicked — advances beat counter and triggers beat reset |
| Play Sound | 1001 | Custom: plays the current beat sound and sets the next timer tick |
| Input Port Signal | 1002 | Custom: input port receives a signal — forwards via output port, triggers beat reset if non-zero |

### Event Details

#### Push (Event 1) — Activate 1

When a creature pushes the beatbox, clicking is disabled (`clac -1`) to prevent overlapping interactions during the animation. All three parts animate:
- **Part 0** (body): Plays a full 11-frame animation (frames 0–10)
- **Part 2** (display): Plays an 8-frame pulsing animation
- **Part 1** (button): Plays a 4-frame press animation

After starting the animations, the script sends message 1001 (Play Sound) to the owner, which initiates the beat sound cycle.

#### Pull (Event 2) — Activate 2

Identical behavior to Push. Both activation types trigger the same animation sequence and sound cycle. This means creatures get the same musical experience regardless of how they interact with the beatbox.

#### Hit (Event 3)

When a creature hits the beatbox:
1. **Percussion Sound**: Plays the `"hit_"` sound effect
2. **Physics Response**: Sets the vertical velocity to a random value between -5 and -10 (upward fling)
3. **Port Signal**: Sends a random force value (60–100) through the output port via `prt: bang`, potentially triggering connected agents
4. **Creature Stimulus**: `stim writ from 92 1` sends stimulus 92 to the hitting creature at intensity 1

**Stimulus impact:**
- `stim writ from 92 1` — Sends stimulus 92 to the creature that hit the beatbox

#### Timer (Event 9)

The timer event acts as a reset/idle handler. When fired:
- Resets part 0 (body) to pose 0
- Resets part 1 (button) to pose 0
- Resets part 2 (display) to pose 0
- Stops the timer (`tick 0`)

This returns the beatbox to its idle visual state after a beat cycle completes without further interaction.

#### Button Click (Event 1000)

Triggered when the player clicks the button part (part 1). Advances the beat counter (`ov00`) through a cycle of 0 → 1 → 2 → 3 → 0. After updating the counter, sends message 0 (Deactivate) to itself, which effectively prepares for the next beat cycle. This allows the player to manually cycle through beat patterns by clicking the button.

#### Play Sound (Event 1001)

This is the core sound-playing event. Based on the current beat counter (`ov00`), it selects and plays one of four beat sounds with corresponding tempos:

| ov00 Value | Sound | Tick Delay | Tempo |
|---|---|---|---|
| 0 | `"mb_1"` | 160 | Slow |
| 1 | `"mb_2"` | 120 | Medium |
| 2 | `"mb_3"` | 220 | Very slow |
| 3 | `"mb_4"` | 120 | Medium |

After playing the sound, clicking is re-enabled (`clac 0`) and the timer is set to the appropriate delay (`tick va00`), which will trigger the Timer event (9) after the specified number of ticks, resetting the beatbox to idle.

#### Input Port Signal (Event 1002)

When a signal arrives on the input port:
1. The signal value (`_p1_`) is forwarded through the output port (`prt: send 0 _p1_`), allowing signal chaining to downstream agents
2. If the signal is non-zero, message 0 (Deactivate) is sent to itself, triggering a beat cycle reset

This allows the beatbox to be integrated into port-based agent networks where signals from other gadgets can trigger beat changes.

### Removal Script

The removal script (`rscr`) enumerates all agents with classifier `2 21 12` and kills them, cleaning up any existing beatbox instances before re-injection.
