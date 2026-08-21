# Autosave

**Source File:** `Assets/Bootstrap/001 World/autosave.cos`

## Overview

This script creates an invisible background agent responsible for automatically saving the game world at regular intervals. It implements a 36,000-tick timer (~30 minutes at 20 ticks/second) that periodically triggers a world save. The timer resets when the world is loaded, ensuring a fresh countdown after each load. The script also provides a manual save shortcut via Ctrl+R.

This is a system-level utility agent with no visual presence or creature interaction. It exists solely to protect the player's progress through periodic autosaves.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| 1 2 7 | [Autosave Agent](#autosave-agent-1-2-7) | Invisible timer-based agent that triggers periodic world saves |

## Agent Details

### Autosave Agent (1 2 7)

An invisible simple agent using the "blnk" (blank) sprite. It has attribute 16 (invisible) and input event mask 1 (accepts keyboard input). Its sole purpose is to manage the autosave timer and respond to manual save requests.

**Agent Properties:**
- **Sprite:** `blnk` (blank/invisible)
- **Attributes:** 16 (invisible)
- **Input Mask:** 1 (keyboard input enabled)
- **Tick Rate:** 36,000 ticks (~30 minutes)

#### Events

| Event Number | Event Type | Description |
|---|---|---|
| 9 | TIMER | Periodic autosave trigger |
| 128 | _WORLD_LOADED | Reset autosave timer after world load |
| 73 | RAWKEYDOWN | Manual save on Ctrl+R |

#### Event 9 — TIMER (Autosave Trigger)

Fires every 36,000 ticks. Executes the `save` command to write the current world state to disk. This is the core autosave mechanism.

#### Event 128 — _WORLD_LOADED (Timer Reset)

Fires when the world is loaded (e.g., after a save is restored). Resets the tick timer to its current value (`tick tick`), which restarts the autosave countdown from zero. This prevents an immediate autosave right after loading a world.

#### Event 73 — RAWKEYDOWN (Manual Save)

Fires on any raw keyboard key press (enabled by `imsk 1`). The script checks:
1. Whether the pressed key (`_p1_`) is 'R'
2. Whether Ctrl is held (`keyd 17 = 1`)
3. Whether Shift is NOT held (`keyd 16 = 0`)

If all conditions are met (Ctrl+R without Shift), the script:
- Executes `save` to save the world immediately
- Resets the tick timer (`tick tick`) to restart the autosave countdown

This provides a manual save keyboard shortcut for the player.

#### Remove Script

The remove script (`rscr`) cleans up by:
- Killing all agents with classifier 1 2 7
- Removing the TIMER (9) and _WORLD_LOADED (128) event scripts
