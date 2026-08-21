# !DS splash map

**Source file:** `Assets/Docking Station/Bootstrap/000 Switcher/!DS splash map.cos`

## Overview

This is the map-definition bootstrap for Docking Station's **splash / switcher** world — the world shown while the game boots and the World Switcher UI is presented. It does **not** create any agents; it only builds the minimal map needed to render the splash screen and assigns its background music.

The script:

1. **Clears any existing map** (`mapk`) so previous map state cannot leak in.
2. **Resets metaroom build parameters** (`brmi 0 0`) — the next metaroom starts its room IDs at 0 and uses room layout style 0.
3. **Sets the world dimensions** to 10 000 × 10 000 pixels (`mapd 10000 10000`). This matches the standard world bounds, even though only a tiny region is actually used.
4. **Adds a single metaroom** at the origin sized 800 × 600 pixels with background `DS_splash` (`addm 0 0 800 600 "DS_splash"`). The new metaroom's ID returned by `addm` is passed to `outv`, which prints it to the output stream (debug visibility only — the value is not stored or reused).
5. **Assigns splash music** for the metaroom containing the point (100, 100) (`mmsc 100 100 "ds_music.mng\StringSolo"`) — the `StringSolo` track from `ds_music.mng` plays while the splash/switcher is on screen. This is the main difference from the equivalent Creatures 3 switcher map, which defines no music.
6. **Centres the camera** on metaroom 0 (`meta 0 -1 -1 0`). The two `-1` arguments tell the engine to use the metaroom's natural centre as the camera target, and the trailing `0` disables any transition effect.

The result is an 800×600 backdrop showing the `DS_splash` image with `StringSolo` playing — the canvas on which the World Switcher's compound UI agent is drawn. No rooms, doors, or CA are defined here, so there is no environment simulation in this world: it is a pure UI surface.

This script runs once per splash-world creation, ahead of the other COS files in `000 Switcher/`.

## Impact on Stimulus / Room CA

None. This world has no rooms defined and contains only the World Switcher UI agent — there are no creatures, stimuli, or CA propagation taking place.
