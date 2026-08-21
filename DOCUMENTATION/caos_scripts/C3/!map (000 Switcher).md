# !map (000 Switcher)

**Source file:** `Assets/Bootstrap/000 Switcher/!map.cos`

## Overview

This is the map-definition bootstrap for the special **Startup** world — the world that hosts the [World Switcher](world%20switcher.md) UI shown when Creatures 3 launches. It does not create any agents; it only builds the minimal map needed to render the switcher screen.

The script:

1. **Clears any existing map** (`mapk`) so previous map state cannot leak in.
2. **Resets metaroom build parameters** (`brmi 0 0`) — sets the next metaroom to start its room IDs at 0 and use room layout style 0.
3. **Sets the world dimensions** to 10 000 × 10 000 pixels (`mapd 10000 10000`). This matches the standard Creatures 3 world bounds, even though only a tiny region is actually used.
4. **Adds a single metaroom** at the origin sized 800 × 600 pixels with background `c3_splash` (`addm 0 0 800 600 "c3_splash"`). The new metaroom's ID is captured in local variable `va00` (but never read again — the script keeps it just in case future maintenance needs it).
5. **Centres the camera** on metaroom 0 (`meta 0 -1 -1 0`). The two `-1` arguments tell the engine to use the metaroom's natural centre as the camera target, and the trailing `0` disables any transition effect.

The result is a 800×600 backdrop showing the `c3_splash` image — the canvas on which the World Switcher's compound UI agent is drawn. No rooms, doors, or CA are defined here, so there is no environment simulation in the Startup world: it is a pure UI surface.

This script runs once per Startup-world creation, ahead of `world switcher.cos` (which is the only other COS file in `000 Switcher/`).

## Impact on Stimulus / Room CA

None. This world has no rooms defined and contains only the World Switcher UI agent — there are no creatures, stimuli, or CA propagation taking place.
