# norn atmosphere machine.cos - Norn Atmosphere Machine (Rain Generator)

**Source**: `Assets/Bootstrap/001 World/norn atmosphere machine.cos`

## Overview

This script installs the **Norn Atmosphere Machine** (classifier `1 1 23`), a rain-generating device placed in the Norn terrarium at position `(3612, 104)`. The machine periodically emits clouds that drift across the sky, spit rain droplets onto the ground, and drop water into the terrain's cellular automata. It is effectively the weather generator for the Norn area.

The machine operates on a long timer (~1800 ticks by default, reduced based on a remote weather controller at classifier `3 3 55`). When its timer fires, it plays the "atms" sound, spits a short particle-spawn animation on the in-port, and then creates several drifting **rain clouds** (classifier `2 19 1`). Each cloud moves with a small leftward/upward drift, loses lifetime each tick, and when it expires spawns a number of **raindrops** (classifier `2 19 2`) whose count depends on the current season (summer produces fewer drops, winter produces the most). Raindrops fall with randomised gravity, and when they collide with a surface they raise CA channels 3 and 4 in the room they landed in -- adding water/nutrients to the ecosystem.

The script also installs a companion **rain sound agent** (classifier `1 1 17`), a floating window-locked blank agent that monitors for visible raindrops anywhere on screen. Whenever rain particles are visible it plays the looping "rain" ambient sound; when no drops remain visible it fades the sound out. This agent also cleans up any raindrop whose physics has been disabled (`fall eq 0`), so stuck droplets do not accumulate.

In addition, the atmosphere machine exposes an input/output port pair (`Atmosphere In-port` / `Atmosphere Out-port`) and a message handler (script 1000) that forwards any port input signal back out through the output port on the next tick -- allowing the machine to be wired into other devices to trigger or react to weather.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 23 | Norn Atmosphere Machine | `nornatmos` frames 0-9 | The physical rain-making machine; periodic timer spawns clouds | [Detail](#norn-atmosphere-machine-1-1-23) |
| 1 1 17 | Rain Sound Agent | `blnk` | Window-locked blank agent that plays/fades the "rain" ambient sound when drops are visible | [Detail](#rain-sound-agent-1-1-17) |
| 2 19 3 | Rain Burst Effect | `nornatmos` frames 10-16 | One-shot animation effect played at cloud spawn location | [Detail](#rain-burst-effect-2-19-3) |
| 2 19 1 | Rain Cloud | `nornatmos` frames 17-20 | Drifting cloud agent that eventually spawns raindrops and dies | [Detail](#rain-cloud-2-19-1) |
| 2 19 2 | Raindrop | `nornatmos` frames 21-25 | Falling particle; on impact it raises room CA 3 (water) and CA 4 | [Detail](#raindrop-2-19-2) |

---

## Norn Atmosphere Machine (1 1 23)

The machine itself. A fixed simple agent with input and output ports and a long periodic timer that drives the Norn-area weather cycle.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `nornatmos` | 10 images, first image 0 |
| Plane | 2 | Background machine layer |
| `anim` | `[0 1 2 3 4 5 6 7 8 9 255]` | Looping idle animation |
| `tick` | 100 | Initial tick (replaced by script 9 calculation) |
| Position | `3612, 104` | Fixed terrarium location |
| `tran` | `0 0` | Transparency disabled |
| Input port 0 | "Atmosphere In-port" | Script 1000 handler, threshold 101/130/1000 |
| Output port 0 | "Atmosphere Out-port" | Signal pass-through (x=85, y=133) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main weather tick -- spawn rain burst + clouds |
| 1000 | Port Message | Forward incoming port signal back out through the output port |

#### Event 9 -- Timer

Runs at a randomised long interval driven by a remote weather controller.

**Tick Recalculation:**
1. Base tick `va00 = 1800` (1800 game ticks between rain events).
2. Remote-target classifier `3 3 55` (assumed to be a weather controller). If it exists, read its `ov03` as a "weather intensity" factor into `va01`; otherwise default `va01 = 3`.
3. Compute `va01 = (va01 + 1)^2 * 50` and subtract it from `va00`. Higher intensity shortens the rain interval.
4. Apply the new interval via `tick va00`.

**Spawn Coordinates:**
- `va00 = posl + 61 - 89` (offset X just in front/left of the machine).
- `va01 = post + 151 - 59` (offset Y below the machine).

**Rain Burst Loop (`reps 5`):**
Repeated five times per timer firing.

1. Send message `255` on output port 0 (external signal pulse to any wired device).
2. Play sound effect `"atms"`.
3. Create a **Rain Burst Effect** (`2 19 3`, 7 images, first image 10, plane 7001) at `(va00, va01)`. Its `slow` + `anim [0..6]` + `over` + `kill targ` sequence makes it a one-shot visual.
4. Create a **Rain Cloud** (`2 19 1`, 4 images, first image 17, plane 7000) with `attr 64` (suffer physics), random pose 0-3, initial velocity `(-3, -1)` (drifts up-left), random tick 5-15, lifetime `ov99 = rand 10 60`, and a `wait rand 50 150` between spawns.

#### Event 1000 -- Port Message

Handler for input port 0.

1. If the incoming parameter `_p1_` is non-zero, set `tick 1` -- forces the timer to fire almost immediately (external trigger for rain).
2. Send `_p1_` as a signal on output port 0 (pass-through).

---

## Rain Sound Agent (1 1 17)

A blank invisible agent locked to the centre of the current viewport that monitors rain particles globally and drives the ambient rain sound.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `blnk` | 1 image, first image 0 |
| Plane | 9000 | Very foreground (above HUD) |
| `attr` | 48 | Invisible + Float relative to window |
| `tick` | 100 | Checks every 100 ticks |
| Position | Window-centered via `flto` | Uses `wndw/2 - wdth/2`, `wndh/2 - hght/2` |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov00` | Rain sound currently playing | 0=no, 1=yes |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Scan for visible rain; start/stop looping sound; clean up stuck drops |

#### Event 9 -- Timer

1. `va00 = 0` (flag: at least one drop visible).
2. `enum 2 19 2` (all raindrops):
   - If `visi 0 eq 1` (the drop is on-screen): set `va00 = 1`.
   - If `fall eq 0` (physics disabled, stuck): `kill targ` -- cleanup.
3. `slow` -- drops priority.
4. State machine:
   - If `va00 == 1` **and** `ov00 == 0`: set `ov00 = 1` and play `sndl "rain"` (looping).
   - Else if `va00 == 0` **and** `ov00 == 1`: call `fade` (fade current sound) and set `ov00 = 0`.

---

## Rain Burst Effect (2 19 3)

A purely decorative one-shot particle animation played at the point where each rain cloud is being released. It has no standing event scripts -- its behaviour is inline in the machine's Timer event.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `nornatmos` | 7 images, first image 10 |
| Plane | 7001 | Foreground particle layer |
| Position | At calculated spawn point | Matches cloud spawn |

### Inline Behaviour (from machine script 9)

- `slow`, `anim [0 1 2 3 4 5 6]`, `over`, `kill targ` -- plays the animation once and self-destructs.

### Events

The rain burst has no persistent event handlers in this script.

---

## Rain Cloud (2 19 1)

The drifting cloud agent. Spawns a few images across the sky on each rain pulse, drifts briefly, and then rains.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `nornatmos` | 4 images, first image 17 |
| Plane | 7000 | Just below rain burst |
| `attr` | 64 | Suffer physics |
| Pose | `rand 0 3` | Random starting frame |
| `velo` | `-3 -1` | Drifts up and to the left |
| `tick` | `rand 5 15` | Fast animation tick |

### Key Variables

| Variable | Purpose | Values |
|---|---|---|
| `ov99` | Cloud lifetime counter | Starts `rand 10 60`; decremented each tick |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Drift, decrement lifetime, release raindrops, self-destruct |

#### Event 9 -- Timer

1. Randomise pose (0-3) and reset velocity to `(-3, -1)` -- continues drifting up-left.
2. Decrement `ov99` by 1.
3. **When `ov99 <= 0` (release rain):**
   - Capture horizontal spawn range: `va01 = posl`, `va02 = posr - 30`. Vertical `va03 = posy`.
   - Choose drop count based on current season (`sean`):
     - `sean == 0` (spring): 8 drops.
     - `sean == 1` (summer): 4 drops.
     - `sean == 2` (autumn): 6 drops.
     - `sean == 3` (winter): 5 drops.
   - Loop `va99` times, each iteration spawning a **Raindrop** (`2 19 2`, 5 images, first image 21, plane 6999) with `attr 192` (mouseclickable + suffer physics), `elas 0` (no bounce), random `accg` 0.2-0.7, random `perm` 0-70, and random X between `va01` and `va02` at height `va03`. If `tmvt` rejects the position the drop is immediately killed.
   - `slow` afterwards.
4. If `ov99 <= -30`: `wait 50` then `kill ownr` -- cloud dissipates.
5. If `obst down <= 300`: `wait 50` then `kill ownr` -- cloud hit the ground and dies.

### Environmental Impact

Rain clouds themselves do not modify room CAs; their effect on the world is indirect via the raindrops they spawn.

---

## Raindrop (2 19 2)

A falling water particle. Physics-driven (gravity + permeability) and collides with solid surfaces; on collision it writes water into the room's cellular automata.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `nornatmos` | 5 images, first image 21 |
| Plane | 6999 | Just below clouds |
| `attr` | 192 | Mouseclickable + Suffer physics |
| `elas` | 0 | No bounce |
| `accg` | `rand 0.2 0.7` | Randomised gravity per drop |
| `perm` | `rand 0 70` | Random permeability (may pass through some walls) |
| Position | Random X within cloud width at cloud Y | Set via `mvto va31 va03` |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 6 | Collision | Animate splash; raise water/CA 4 in the room; self-destruct |

#### Event 6 -- Collision

Fired when the raindrop hits a surface.

1. Play splash animation: `anim [0 1 2 3 4]`.
2. If the drop is inside a valid room (`room targ <> -1`) and not currently carried (`carr = null`):
   - `altr room ownr 3 0.05` -- add 0.05 to CA channel 3 of the current room.
   - `altr room ownr 4 0.001` -- add 0.001 to CA channel 4 of the current room.
3. `over` (wait for the animation to complete), then `kill ownr`.

### Room CA Impact

| CA Channel | Delta per drop | Effect |
|---|---|---|
| 3 | +0.05 | Water / rain moisture (primary) |
| 4 | +0.001 | Secondary (nutrient/humidity channel) |

Each rain pulse therefore deposits between 4 (summer) and 8 (spring) raindrops per cloud × 5 clouds per pulse -- a meaningful but bounded amount of water added to the rooms the drops land in.

---

## Remove Script (rscr)

1. Enumerate and `kill` all agents of classifiers `1 1 23`, `2 19 3`, `2 19 1`, `2 19 2`, and `1 1 17`.
2. Remove event scripts:
   - `scrx 1 1 17 9` (rain sound Timer).
   - `scrx 1 1 23 9` (machine Timer).
   - `scrx 2 19 2 9` (raindrop Timer -- defensive; not actually installed by this script).
   - `scrx 2 19 2 6` (raindrop Collision).

Note: The machine's port message handler (`scrp 1 1 23 1000`), the rain cloud Timer (`scrp 2 19 1 9`), and the burst-effect inline script are **not** explicitly removed via `scrx`; only their live instances are killed.
