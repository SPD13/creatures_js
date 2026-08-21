# aquatic_launcher.cos - Aquatic Creature Launcher

## Overview
- **File**: `aquatic_launcher.cos`
- **Category**: Engineering Gadget / Marine Ecosystem
- **Purpose**: An engineering compound agent placed in the marine terrarium that serves as a dispensing machine for aquatic creatures and plants. When activated, the launcher opens a selection panel. It receives creature type codes via its input port and spawns the corresponding aquatic organism — fish, sponges, or aquatic plants — launching them into the water with an initial velocity. The launcher consumes bioenergy (20 per launch) and recharges ammo over time from the global bioenergy pool. It enforces a population cap of 75 per species (combining adult and juvenile/seed forms) to prevent overpopulation.

The launcher is part of the engineering gadget network, with input and output ports for wiring into machine chains. It emits CA 18 (machinery smell) so creatures can detect and navigate to it.

## Created Agents

| Agent | Classifier | Description | Details |
|-------|------------|-------------|---------|
| Aquatic Launcher | 3 8 22 | Engineering gadget that dispenses aquatic creatures | [Aquatic Launcher](#aquatic-launcher-3-8-22) |
| Wysteria Fish | 2 18 16 | Small aquatic fish launched into the water | [Wysteria Fish](#wysteria-fish-2-18-16) |
| Angel Fish | 2 18 14 | Aquatic angel fish launched into the water | [Angel Fish](#angel-fish-2-18-14) |
| Neon Fish | 2 18 17 | Aquatic neon fish launched into the water | [Neon Fish](#neon-fish-2-18-17) |
| Graspit | 2 18 21 | Aquatic graspit creature launched into the water | [Graspit](#graspit-2-18-21) |
| Clown Fish | 2 18 15 | Aquatic clown fish launched into the water | [Clown Fish](#clown-fish-2-18-15) |
| Opal Sponge | 2 3 7 | Sessile aquatic opal sponge | [Opal Sponge](#opal-sponge-2-3-7) |
| Orange Sponge | 2 3 6 | Sessile aquatic orange sponge | [Orange Sponge](#orange-sponge-2-3-6) |
| Gumin Grass | 2 3 8 | Aquatic gumin plant | [Gumin Grass](#gumin-grass-2-3-8) |

---

## Aquatic Launcher (3 8 22)

An engineering compound agent placed at position (4788, 2206) in the marine terrarium. It acts as a vending machine for aquatic life, dispensing fish, sponges, and plants when activated. It has a limited ammo supply (max 5) that recharges from the global bioenergy pool over time.

### Agent Properties

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `launcher` | 31 frames, plane 750 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 41 | Activate1, hit, pickup |
| Permeability | 100 | Full wall permeability |
| Gravity | 10 | Standard gravity |
| Elasticity | 30 | Moderate bounce |
| Air resistance | 20 | Moderate drag |
| Friction | 100 | Full friction |
| Emit | CA 18 at 0.35 | Machinery smell |
| Tick | 1250 | Timer interval for bioenergy recharge |

### Compound Parts

| Part | Type | Sprite | Description |
|------|------|--------|-------------|
| 0 | Body | `launcher` (frame 0) | Main body, 31 frames |
| 1 | Button | `launcher` (frame 18) | Toggle button, 3x5 grid, animated |
| 2 | Dull | `launcher` (frame 0) | Species indicator display, 28 frames |
| 3 | Fixed Text | `launcher` (frame 21) | Ammo counter display ("WhiteOnTransparentChars") |

### Key Variables

| Variable | Initial | Description |
|----------|---------|-------------|
| ov00 | 0 | Open/closed state (0=closed, 1=open) |
| ov01 | 23 | Unknown (possibly sprite offset) |
| ov03 | — | Set to 1 during launch animation sequence |
| ov61 | 100 | Machine charge state |
| ov71 | 5 | Current ammo count (max 5) |
| ov81 | 0 | Creature type selection code received via port |

### Ports

| Port | Direction | ID | Description |
|------|-----------|-----|-------------|
| Input | In | 0 | "activate" — activates launcher via input of 255 (signal type 13, position 27, event 2002) |
| Output | Out | 0 | "passthrough" — passes through any signals received (position 16, 40) |

### Events

| Event | Script | Description |
|-------|--------|-------------|
| Activate1 | scrp 3 8 22 1 | Creature pushes — toggles open/close panel |
| Timer | scrp 3 8 22 9 | Bioenergy recharge tick |
| Port Input (button) | scrp 3 8 22 2000 | Button press — toggles open/close panel |
| Port Input (selection) | scrp 3 8 22 2002 | Creature type selection — launches selected aquatic creature |
| Hit | scrp 3 8 22 3 | Creature hits — knockback response |
| Pickup | scrp 3 8 22 4 | Creature picks up — stimulus to creature |

#### Activate1 (scrp 3 8 22 1) — Toggle Panel

Toggle behavior that opens or closes the launcher panel:

1. **Locks execution** to prevent interruption
2. **Stimulates the activator** with stimulus 90 (ACTIVATE_MACHINE)
3. If **closed** (ov00=0):
   - Plays "bep2" sound
   - Animates button press (part 1 pose 1)
   - Plays opening animation on body (frames 0–5), waits for completion
   - Sets ov00=1 (open state)
   - Displays ammo count on text part (part 3): "Bio\n{ammo}"
4. If **open** (ov00=1):
   - Clears text display
   - Plays "bep2" sound
   - Resets button animation (part 1 looping frames 0–1)
   - Resets indicator to pose 21 (part 2)
   - Plays closing animation on body (frames 5–0), waits for completion
   - Sets ov00=0 (closed state)

**Stimulus impact**: Stimulus 90 to the activating creature (ACTIVATE_MACHINE)

#### Timer (scrp 3 8 22 9) — Bioenergy Recharge

Periodically recharges the launcher's ammo from the global bioenergy pool:

1. Runs in **instant mode** (INST)
2. Checks if ammo (ov71) < 5 AND global bioenergy >= 20
3. If conditions met:
   - Increments ammo by 1
   - Subtracts 20 from game variable "Bioenergy"
   - Updates the ammo display text

#### Port Input — Button (scrp 3 8 22 2000) — Toggle Panel

Identical behavior to Activate1 (scrp 3 8 22 1). Toggles the launcher panel open/closed when triggered via the button port. This allows the launcher to be toggled by connected machines.

#### Port Input — Selection (scrp 3 8 22 2002) — Launch Creature

The main launch logic. Receives a creature type code via the input port parameter `_p1_` and spawns the corresponding aquatic organism:

1. **Locks execution** to prevent interruption
2. Only operates if launcher is **open** (ov00=1)
3. Reads creature type code from `_p1_` into ov81
4. Calculates spawn position: launcher X + 35, launcher Y - 5
5. If **ammo available** (ov71 > 0):
   - Checks population cap: total of adult + juvenile forms must be <= 75
   - If under cap:
     - Updates species indicator (part 2 pose based on type)
     - Plays launch animation (frames 6–15) on body
     - Creates the new aquatic agent with appropriate properties
     - Attempts to place at spawn position (`tmvt` check)
     - If placement succeeds: sets velocity (20, 0) rightward, plays "pop1" sound, decrements ammo
     - If placement fails: kills the created agent, plays "excl" error sound
   - If over population cap: plays "excl" error sound, shows error indicator (pose 31)
6. If **no ammo** (ov71=0): passes signal through output port and shows "Bio 0"
7. Updates the ammo display after launch

**Creature type codes and population pairs:**

| Code (ov81) | Agent Created | Classifier | Population Check (adult + juvenile) |
|-------------|---------------|------------|--------------------------------------|
| 2 | Wysteria Fish | 2 18 16 | totl 2 18 16 + totl 2 15 18 <= 75 |
| 3 | Angel Fish | 2 18 14 | totl 2 18 14 + totl 2 15 14 <= 75 |
| 4 | Neon Fish | 2 18 17 | totl 2 18 17 + totl 2 15 19 <= 75 |
| 5 | Graspit | 2 18 21 | totl 2 18 21 + totl 2 15 16 <= 75 |
| 6 | Clown Fish | 2 18 15 | totl 2 18 15 + totl 2 15 15 <= 75 |
| 8 | Opal Sponge | 2 3 7 | totl 2 3 7 + totl 2 4 8 <= 75 |
| 9 | Orange Sponge | 2 3 6 | totl 2 3 6 + totl 2 4 7 <= 75 |
| 10 | Gumin Grass | 2 3 8 | totl 2 3 8 + totl 2 4 10 <= 75 |

#### Hit (scrp 3 8 22 3) — Impact Response

When a creature hits the launcher:
- Plays "hit_" sound
- Knocked upward with random velocity (vy = random -5 to -10)
- Sends a random bang signal (60–100) through the output port
- **Stimulates the hitter** with stimulus 92 (HIT_MACHINE)

#### Pickup (scrp 3 8 22 4) — Creature Picks Up

When picked up by a creature (family 4):
- **Stimulates the creature** with stimulus 91 (GOT_MACHINE)

### Removal Script

The removal script (`rscr`) cleans up all instances of the launcher (3 8 22) and removes all associated event scripts (2000, 3, 2002, 1).

---

## Launched Aquatic Agents

The following agents are instantiated by the launcher during the launch sequence. Their initial properties are set at creation time. Full behavior scripts for these agents are defined in their respective `.cos` files.

### Wysteria Fish (2 18 16)

A small aquatic fish launched into the marine terrarium water.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `wysts` | 4 frames, 88 images, plane 3000 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 32 | Hit |
| Click action | -1 | No click action |
| Elasticity | 50 | Moderate bounce |
| Gravity | 1 | Very light gravity |
| Air resistance | 7 | Low-moderate drag |
| Permeability | 75 | Moderate wall permeability |
| Friction | 99 | Near-full friction |
| ov60 | 200 | Lifecycle parameter |
| ov61 | 30 | Lifecycle parameter |
| Initial velocity | (20, 0) | Launched rightward |

### Angel Fish (2 18 14)

An aquatic angel fish launched into the marine terrarium. Also created by `angel fish.cos`.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `angel` | 4 frames, 153 images, plane 500 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 48 | Hit, pickup |
| Click action | -1 | No click action |
| Elasticity | 50 | Moderate bounce |
| Gravity | 1 | Very light gravity |
| Air resistance | 7 | Low-moderate drag |
| Permeability | 75 | Moderate wall permeability |
| Friction | 99 | Near-full friction |
| ov60 | 200 | Lifecycle parameter |
| ov61 | 30 | Lifecycle parameter |
| Initial velocity | (20, 0) | Launched rightward |

### Neon Fish (2 18 17)

An aquatic neon fish launched into the marine terrarium.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `neon` | 4 frames, 188 images, plane 4000 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 48 | Hit, pickup |
| Click action | -1 | No click action |
| Elasticity | 50 | Moderate bounce |
| Gravity | 1 | Very light gravity |
| Air resistance | 7 | Low-moderate drag |
| Permeability | 75 | Moderate wall permeability |
| Friction | 99 | Near-full friction |
| ov60 | 200 | Lifecycle parameter |
| ov61 | 30 | Lifecycle parameter |
| Initial velocity | (20, 0) | Launched rightward |

### Graspit (2 18 21)

An aquatic graspit creature launched into the marine terrarium.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `graspit` | 4 frames, 200 images, plane 4000 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 48 | Hit, pickup |
| Click action | -1 | No click action |
| Elasticity | 50 | Moderate bounce |
| Gravity | 1 | Very light gravity |
| Air resistance | 7 | Low-moderate drag |
| Permeability | 75 | Moderate wall permeability |
| Friction | 99 | Near-full friction |
| ov60 | 200 | Lifecycle parameter |
| ov61 | 30 | Lifecycle parameter |
| Initial velocity | (20, 0) | Launched rightward |

### Clown Fish (2 18 15)

An aquatic clown fish launched into the marine terrarium.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `clown` | 4 frames, 150 images, plane 4000 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 48 | Hit, pickup |
| Click action | -1 | No click action |
| Elasticity | 0 | No bounce |
| Gravity | 1 | Very light gravity |
| Air resistance | 7 | Low-moderate drag |
| Permeability | 75 | Moderate wall permeability |
| Friction | 99 | Near-full friction |
| ov60 | 200 | Lifecycle parameter |
| ov61 | 30 | Lifecycle parameter |
| Initial velocity | (20, 0) | Launched rightward |

### Opal Sponge (2 3 7)

A sessile aquatic opal sponge placed in the marine terrarium. Unlike fish, sponges have no gravity or air resistance and are positioned with an offset from the launcher.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `opalsponge` | 4 frames, plane 4201 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 32 | Hit |
| Gravity | 0 | No gravity (sessile) |
| Air resistance | 0 | No drag |
| Permeability | 100 | Full wall permeability |
| Elasticity | 0 | No bounce |
| Friction | 100 | Full friction |
| Pickup point | (-1, 20, 150) | Custom pickup position |
| ov00 | 0 | Initial state |
| ov01 | 0 | Initial state |
| ov61 | 20 | Lifecycle parameter |
| Spawn offset | X-7, Y-80 | Offset from launcher position |
| Initial velocity | random(-1,1), -1 | Slight drift |

### Orange Sponge (2 3 6)

A sessile aquatic orange sponge, similar to the opal sponge but with a different spawn offset.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `oraponge` | 4 frames, plane 4201 |
| Attributes | 199 | Carryable, mouse-clickable, activatable, wall-bound, camera-shy |
| Behaviors | 32 | Hit |
| Gravity | 0 | No gravity (sessile) |
| Air resistance | 0 | No drag |
| Permeability | 100 | Full wall permeability |
| Elasticity | 0 | No bounce |
| Friction | 100 | Full friction |
| Pickup point | (-1, 20, 150) | Custom pickup position |
| ov00 | 0 | Initial state |
| ov01 | 0 | Initial state |
| ov61 | 20 | Lifecycle parameter |
| Spawn offset | X-4, Y-57 | Offset from launcher position |
| Initial velocity | random(-1,1), -1 | Slight drift |

### Gumin Grass (2 3 8)

An aquatic gumin plant placed in the marine terrarium. Unlike other launched agents, it has 9 frames and starts at pose 3.

| Property | Value | Description |
|----------|-------|-------------|
| Sprite | `gumin` | 9 frames, 95 images, plane 4201 |
| Attributes | 197 | Carryable, mouse-clickable, activatable, wall-bound (not camera-shy) |
| Behaviors | 32 | Hit |
| Click action | -1 | No click action |
| Gravity | 0 | No gravity (sessile) |
| Air resistance | 0 | No drag |
| Permeability | 99 | Near-full wall permeability |
| Elasticity | 20 | Low bounce |
| Friction | 100 | Full friction |
| Pickup handle | (-1, 15, 60) | Custom pickup position |
| ov86 | 0 | Initial state |
| ov87 | 0 | Initial state |
| ov01 | 230 | Lifecycle parameter |
| ov61 | 15 | Lifecycle parameter |
| Initial pose | 3 | Starts at frame 3 |
| Spawn offset | X-7, Y-55 | Offset from launcher position |
