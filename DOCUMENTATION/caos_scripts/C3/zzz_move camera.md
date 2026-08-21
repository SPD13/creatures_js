# zzz_move camera.cos - Initial Camera Position

**Source**: `Assets/Bootstrap/001 World/zzz_move camera.cos`

## Overview

This is a one-shot install script executed at the very end of world bootstrap (the `zzz_` filename prefix ensures it runs after every other bootstrap script has had a chance to create and register its agents). Its only job is to reposition the main game camera so the world opens with the Egg Hatchery in view, giving the player an immediate focal point on the primary gameplay machine.

The script picks a random Hatchery Lid agent (classifier `2 22 3`, created by `Hatchery2.cos`) and snaps the main camera to its location. Using the lid rather than the hatchery body is a convenience — the lid's position sits at a visually pleasing vertical offset on the machine. If no hatchery lid exists in the world (for example in a custom bootstrap that omits the hatchery), the camera is left untouched.

This script does not create agents, does not modify the map, and does not set any game variables. It is purely a camera-positioning utility.

## Behaviour

| Step | CAOS | Effect |
|---|---|---|
| 1 | `rtar 2 22 3` | Pick a random agent matching classifier `2 22 3` (Hatchery Lid) and set it as `TARG`. `TARG` becomes `NULL` if no such agent exists. |
| 2 | `doif targ ne null` | Guard against the hatchery being absent from the world. |
| 3 | `cmrt 0` | Move the main camera to centre on `TARG` in snap mode (mode `0` = instantaneous, no panning animation). |
| 4 | `endi` | End the conditional. |

No event scripts are installed and no stimuli, chemicals, or Room CAs are affected.
