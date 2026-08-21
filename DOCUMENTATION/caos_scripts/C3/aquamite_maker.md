# aquamite_maker.cos - Aquamite Maker

## Overview
- **File**: `aquamite_maker.cos`
- **Category**: Engineering Gadget / Marine Ecosystem
- **Purpose**: A machine placed in the marine terrarium that produces batches of aquamites — small floating aquatic organisms (2 13 8). When activated by a creature or through a port signal, the maker spawns 7–12 aquamites near itself with random color tints and initial velocities, populating the marine environment. Aquamite behavior and lifecycle are defined separately in `aquamites.cos`.

The maker is part of the engineering gadget network, with input and output ports that allow it to be wired into machine chains. It emits CA 18 (machinery smell) so creatures can detect and navigate to it.

## Created Agents

| Agent | Classifier | Description | Details |
|-------|------------|-------------|---------|
| Aquamite Maker | 3 8 21 | Engineering gadget that spawns aquamites when activated | [Aquamite Maker](#aquamite-maker-3-8-21) |
| Aquamite | 2 13 8 | Small floating aquatic organism spawned by the maker | [Aquamite](#aquamite-2-13-8) |

---

## Aquamite Maker (3 8 21)

An engineering compound agent placed in the marine terrarium at position (4645, 2374). It serves as a biological factory, producing batches of aquamites on demand. It connects to other machines via input/output ports for automated activation.

### Agent Properties

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `aquamite_maker` | 20 frames, plane 3999 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 41 | Activate1, hit, pickup |
| Permeability | 100 | Full wall permeability |
| Gravity | 2 | Light gravity |
| Elasticity | 20 | Low bounce |
| Air resistance | 1 | Low drag |
| Click action | 0 | Activate1 on click |
| Emit | CA 18 at 0.25 | Machinery smell |
| OV61 | 100 | Machine state/charge |

### Ports

| Port | Direction | ID | Description |
|------|-----------|-----|-------------|
| Input | In | 0 | "produces more aquamites when it hears 255" (signal type 37, position 58,64) |
| Output | Out | 0 | "passes 255 if it's been activated" (position 20,58) |

### Events

| Event | Script | Description |
|-------|--------|-------------|
| Activate1 | scrp 3 8 21 1 | Creature pushes — spawns aquamites |
| Hit | scrp 3 8 21 3 | Creature hits — knockback and port bang |
| Pickup | scrp 3 8 21 4 | Creature picks up — stimulus to creature |
| Port Input | scrp 3 8 21 64 | Receives signal 255 — spawns aquamites |

#### Activate1 (scrp 3 8 21 1) — Spawn Aquamites

The primary activation event. When a creature pushes the maker:

1. **Stimulates the activator** with stimulus 90 (ACTIVATE_MACHINE)
2. **Locks execution** to prevent interruption during the spawn sequence
3. **Plays sound** "aqua" and a long animation cycle (frames 0–19 repeated 3 times)
4. **Calculates spawn position**: left edge of maker minus 15px, top edge plus 20px
5. **Determines batch size**: random count between 7 and 12
6. **Sends output signal** 255 through output port 0 to connected machines
7. **Spawns aquamites** in a loop — each aquamite is created with randomized color tints and given a small random initial velocity
8. If the spawn position is invalid (checked via `tmvt`), the failed aquamite is killed
9. After spawning completes, waits for the animation to finish (`over`) and resets to frame 0

#### Hit (scrp 3 8 21 3) — Impact Response

When a creature hits the maker:
- Plays "hit_" sound
- Knocked upward with random velocity (vy = random -5 to -10)
- Sends a random bang signal (60–100) through the output port
- **Stimulates the hitter** with stimulus 92 (HIT_MACHINE)

#### Pickup (scrp 3 8 21 4) — Creature Picks Up

When picked up by a creature (family 4):
- **Stimulates the creature** with stimulus 91 (GOT_MACHINE)

#### Port Input (scrp 3 8 21 64) — Signal-Triggered Spawning

Triggered when the maker receives a signal through its input port:
- Only activates when the input value is exactly 255
- Performs the **same spawn sequence** as Activate1: sound, animation, batch spawn of 7–12 aquamites, output signal
- Allows automated aquamite production when wired to other machines

### Stimulus Summary

| Stimulus | Number | Trigger | Target |
|----------|--------|---------|--------|
| ACTIVATE_MACHINE | 90 | Creature activates maker | The activating creature (`from`) |
| GOT_MACHINE | 91 | Creature picks up maker | The picking creature (`targ` = `from`) |
| HIT_MACHINE | 92 | Creature hits maker | The hitting creature (`from`) |

### CA Emission

| CA Type | Intensity | Description |
|---------|-----------|-------------|
| 18 (Machinery) | 0.25 | Emits machinery smell so creatures can navigate to this device |

---

## Aquamite (2 13 8)

Small floating aquatic organisms spawned by the maker. They are non-interactive to the player (not clickable) and drift through the marine environment. Their full lifecycle behavior (drift, reproduction, population control, water-seeking) is defined in `aquamites.cos`.

### Agent Properties (as created by maker)

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `aquamites` | 10 frames, plane 4000 |
| Attributes | 197 | Carryable, activatable, wall-bound, camera-shy (NOT mouse-clickable) |
| Elasticity | 50 | Medium bounce |
| Gravity | 0 | No gravity — floats freely |
| Air resistance | 7 | High drag — slow movement |
| Permeability | 75 | Moderate wall permeability |
| Friction | 99 | High friction |
| Click action | -1 | Not clickable |
| Tick rate | 10 | Timer fires every 10 ticks |

### OV Variables (as initialized by maker)

| Variable | Value | Purpose |
|----------|-------|---------|
| OV01 | 500 | Lifespan/health counter |
| OV61 | 10 | Decay rate |
| OV99 | 0 | State flag (99 = marked for death) |
| OV86 | 0 | Out-of-water tick counter |
| OV87 | 0 | Accumulated gravity when out of water |
| OV20 | rand 170–240 | Tint red component |
| OV21 | rand 90–120 | Tint green component |
| OV22 | rand 170–240 | Tint blue component |

The random tint values (OV20–OV22) give each aquamite a unique purple/pink coloration, with high red, low green, and high blue channels.

### Spawning Behavior

Each aquamite spawned by the maker:
1. Is created at the maker's position (left edge - 15px, top edge + 20px)
2. Position validity is checked with `tmvt` before placement
3. Receives a looping swim animation (frames 0–9 forward, then 9–0 reverse)
4. Gets a random initial velocity between -2 and 2 in both X and Y axes
5. Timer is set to 10 ticks for the lifecycle behavior (defined in `aquamites.cos`)
6. If placement fails, the aquamite is immediately killed

---

## Removal Script (RSCR)

Cleans up the aquamite maker system:
1. Kills all aquamite maker agents (3 8 21)
2. Removes event scripts: Activate1 (1), Port Input (64), and Hit (3)

Note: The removal script does **not** kill existing aquamites (2 13 8) — those are cleaned up by the removal script in `aquamites.cos`.

## Dependencies

- **aquamites.cos**: Defines the aquamite timer script (scrp 2 13 8 9) with drift, reproduction, population control, and water-seeking behaviors
- **Sprite**: `aquamite_maker.c16` — maker device graphics (20 frames)
- **Sprite**: `aquamites.c16` — aquamite organism graphics (10 frames)
- **Sounds**: `aqua` (activation), `hit_` (impact)
- **Machine port system**: Input/output ports for wiring to other engineering gadgets
- **CA system**: Emits CA 18 (machinery smell) for creature navigation

## Notes

- The maker has a **dual activation model**: direct creature interaction (Activate1) or remote signal via port input (signal 255)
- The Activate1 and Port Input scripts contain **nearly identical spawning logic** — both produce 7–12 aquamites with the same properties
- The `LOCK` command prevents creatures from being interrupted during the spawn animation sequence
- The `INST`/`SLOW` pair around aquamite creation ensures each aquamite is fully initialized atomically before yielding execution
- Aquamites are intentionally **not clickable** (`clac -1`) — they are ambient marine life, not interactive objects
- The maker is positioned in the marine terrarium area of the Ark, consistent with the aquatic ecosystem theme
- Population dynamics (reproduction, overcrowding death) are handled entirely in `aquamites.cos`, not by the maker
