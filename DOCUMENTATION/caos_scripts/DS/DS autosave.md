# DS autosave

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS autosave.cos`

## Overview

This script creates an invisible background agent that automatically saves the world at regular intervals (~30 minutes), resets its countdown when a world is loaded, and offers a manual save shortcut (Ctrl+R). It is a system-level utility with no visual presence or creature interaction, and behaves identically to the Creatures 3 [Autosave](../C3/autosave.md).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 7 | Autosave Agent | `blnk` | Invisible timer agent that triggers periodic world saves |

## Agent 1 2 7: Autosave Agent

`new: simp 1 2 7 "blnk" 0 1 0`, `attr 16` (invisible), `imsk 1` (keyboard input), `tick 36000` (~30 minutes at 20 ticks/sec).

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Periodic autosave |
| World Loaded | 128 | Reset the autosave timer after a world load |
| Raw Key Down | 73 | Manual save on Ctrl+R |

#### Event 9 — Timer (autosave)

Every 36 000 ticks, runs `save` to write the world to disk.

#### Event 128 — World Loaded (timer reset)

Fires when a world is loaded; `tick tick` re-arms the timer at its current period so an autosave doesn't fire immediately after loading.

#### Event 73 — Manual save (Ctrl+R)

On a raw key press, if the key is `'R'` with Ctrl held (`keyd 17 = 1`) and Shift **not** held (`keyd 16 = 0`), it runs `save` and resets the timer (`tick tick`).

### Removal Script

```
rscr
enum 1 2 7
    kill targ
next
scrx 1 2 7 9
scrx 1 2 7 128
```

Kills the autosave agent and removes its Timer (9) and World-Loaded (128) scripts.

## Impact on Stimulus / Room CA

None. The agent only manages saving; it emits no stimuli and does not affect Room CA.
