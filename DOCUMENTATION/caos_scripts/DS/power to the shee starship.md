# power to the shee starship.cos — Power the C3 Starship

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/power to the shee starship.cos`

## Overview

When a Docking Station world is **docked with Creatures 3**, this script powers up all the C3 Starship machines and keeps the **Bioenergy** level topped up, so the C3 hardware works without the player having to manage power. It also installs the C3 **pick-up reward** handler — the custom event that fires when a power-up token (`2 24 4`) is collected, granting bioenergy / Grendel-Ettin / population rewards, showing a "Pick-ups" info dialog, and throwing up a celebratory burst of stars.

On a docked world it kills any existing power-up tokens (`2 24 4`), powers each C3 machine (`1 1 91`, by messaging it 1000 with a high power level), and spawns a **Bioenergy keeper** (`1 1 195`) that ticks the `game "Bioenergy"` back up to 1000 whenever it drops.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 195 | Bioenergy Keeper | `blnk` | Invisible agent that keeps `game "Bioenergy"` ≥ 1000 — see [detail](#agent-1-1-195-bioenergy-keeper) |
| 1 1 46 | Star Burst | `andtheworldexplodedintostars` | Celebratory star particles flung out on pick-up (classifier shared with [C3_airlock_scripts](C3_airlock_scripts.md)) |
| 1 2 22 | Pick-ups Dialog | `pick-ups2` | The info box shown when a power-up is collected |

It also installs a **behaviour script on all simple objects** (`2 0 0`, custom event 12345) — the pick-up reward routine.

## Agent 1 1 195: Bioenergy Keeper

| Event | Number | Description |
|---|---|---|
| Timer | 9 | If `game "Bioenergy"` has dropped below 1000, set it back to 1000 and `rgam` |

A simple invisible heartbeat (every 300 ticks) that keeps the docked C3 machines fully powered.

## The Pick-up Reward Script (`2 0 0`, event 12345)

This custom event (carried over from Creatures 3, with the max-norns tweak removed so it doesn't clash with the DS Options population settings) runs when a pick-up token is collected:

- Plays a sound and throws out `_p1_` **star-burst** particles (`1 1 46`) at velocities scaled by `_p2_`.
- If the collected object is a power-up token (`2 24 4`), reads its `ov01` reward type and applies it:
  - **Bioenergy levels (0–4)** — message the matching C3 machine (`1 1 91`) to raise its power, building a "n% powered" message.
  - **Type 7** — set `game "Grettin"` (enable Grendel/Ettin breeding).
  - **Type 9** — set `game "engine_creature_pickup_status"` and `rgam`.
- Builds and shows a **Pick-ups Dialog** (`1 2 22`) describing the reward (a centred, auto-dismissing info box).

## Removal Script

```
rscr
enum 1 1 195
    kill targ
next
```

Kills the Bioenergy keeper.

## Impact on Stimulus / Room CA

None. This script emits no creature stimuli and writes no Room CA. Its effects are on **game state**: powering the C3 machines (`1 1 91`), keeping `game "Bioenergy"` at peak, and applying pick-up rewards that set game variables (`Grettin`, `engine_creature_pickup_status`) — plus the cosmetic star-burst effect when a power-up is collected.
