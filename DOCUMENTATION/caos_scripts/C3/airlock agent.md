# airlock agent.cos - Airlock Hazard System

**Source**: `Assets/Bootstrap/001 World/airlock agent.cos`

## Overview

This script implements the airlock hazard system for the Creatures 3 spaceship. Two invisible airlock agents are placed at key airlock locations on the ship. They act as lethal zones that periodically scan for overlapping agents and destroy them, simulating the vacuum of space outside the airlock doors.

The airlock agents use a timer-based scan (every 250 ticks) to enumerate all touching agents. Agents from family 1 (scenery, tools, GUI) are immune and pass through unharmed. Simple critter agents (family 2, genus 1) are also spared. All other agents — including creatures (family 4) and compound/vehicle agents — are killed on contact. Destroyed creatures trigger both dust cloud and bone particle effects; other destroyed agents produce only dust clouds.

At bootstrap, two airlock agents are created at positions (3320, 3850) and (4630, 4120).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 39 | Airlock Agent | `airlock agent` | Hazard zone that destroys overlapping agents and creatures | [Detail](#airlock-agent-1-1-39) |
| 1 1 46 | Particle Effect | `dust cloud` / `bone` | Temporary visual effects spawned when agents are destroyed | [Detail](#particle-effect-1-1-46) |

---

## Airlock Agent (1 1 39)

The airlock agent is the core hazard. Two instances are created at bootstrap, each positioned at an airlock location on the Ark. Every 250 ticks, each agent scans for overlapping agents and destroys anything that isn't scenery or a simple critter.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `airlock agent` | 2 images, first image 0 |
| Plane | 0 | Background layer |
| Position 1 | (3320, 3850) | First airlock location |
| Position 2 | (4630, 4120) | Second airlock location |
| `tick` | 250 | Timer interval for scanning |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov01` | Counter — incremented each time the timer fires |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Periodic scan for overlapping agents; destroys non-immune targets |

### Timer Script (Event 9) - Behavior

The timer script executes in `inst`/`lock` mode to prevent interruption and performs the following:

1. **Increment counter**: `ov01` is incremented by 1 each tick.
2. **Enumerate touching agents**: Uses `etch 0 0 0` to iterate over all agents overlapping the airlock.
3. **Filter immune agents**:
   - Skips `ownr` (itself) and any agent being carried (`carr = null` check).
   - Skips all family 1 agents (scenery, tools, GUI elements).
   - Skips family 2, genus 1 agents (simple critter/food objects like seeds and weed).
4. **Destroy creatures (family 4)**:
   - Records the creature's position (`posx`, `post`).
   - Calls `dead` to trigger the creature's death state.
   - Calls `kill targ` to remove the creature agent.
   - Sets `va66 = 1` to flag that bone particles should be created.
5. **Destroy other agents (family 2 genus != 1, family 3)**:
   - Records the agent's position.
   - Calls `kill targ` to remove the agent.
   - Sets `va66 = 0` (no bones).
6. **Spawn dust cloud particles**: Creates 10 dust cloud agents (`1 1 46`) at the destroyed agent's last position with randomized velocities, gravity, and animation.
7. **Spawn bone particles** (creatures only): If `va66 = 1`, creates 8 additional bone agents (`1 1 46`) at the same position with no gravity and longer animation.

---

## Particle Effect (1 1 46)

Temporary visual effects created when the airlock destroys an agent. Two variants use the same classifier:

### Dust Cloud Variant

| Property | Value | Notes |
|---|---|---|
| Sprite | `dust cloud` | 4 images, first image 8 |
| Plane | 1000 | Drawn in front of everything |
| `attr` | 192 | Suffers physics + suffers collisions |
| `accg` | 0.1 | Light gravity — particles drift downward |
| `elas` | 100 | Full elasticity — particles bounce off walls |
| `velx` | rand -5 5 | Random horizontal velocity |
| `vely` | rand -5 5 | Random vertical velocity |
| Animation | [0 1 2 3] | 4-frame puff animation |
| `tick` | rand 30 40 | Self-destructs after 30-40 ticks |

### Bone Variant

| Property | Value | Notes |
|---|---|---|
| Sprite | `bone` | 12 images, first image 0 |
| Plane | 1000 | Drawn in front of everything |
| `attr` | 192 | Suffers physics + suffers collisions |
| `accg` | 0 | No gravity — bones float in zero-G |
| `elas` | 100 | Full elasticity |
| `velx` | rand -5 5 | Random horizontal velocity |
| `vely` | rand -5 5 | Random vertical velocity |
| Animation | [0 1 2 3 4 5 6 7 8 9 10 11 255] | 12-frame tumbling animation (255 = stop) |
| `tick` | rand 50 60 | Self-destructs after 50-60 ticks |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Self-destruct — `kill ownr` removes the particle when its timer expires |

---

## Removal Script

The `rscr` block cleans up all airlock agents (`1 1 39`) and all particle effects (`1 1 46`) when the script is unloaded, ensuring no orphaned agents remain in the world.
