# DS welcome screen.cos — New-World Welcome Screen

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS welcome screen.cos`

## Overview

This script defines the **welcome screen** (`1 2 26`) shown to a player starting a fresh Docking Station world, offering three ways to begin: import a **Starter Family**, hatch some **Eggs**, or **Exit** straight into an empty world. It is the Docking Station counterpart of the Creatures 3 [welcome screen](../C3/welcome%20screen.md).

> **Note:** the install block that would `new: comp 1 2 26 …` and build the screen's UI parts is **commented out** in this file — the welcome screen is created on demand by the welcome flow (gated by `game "user_has_been_welcomed"`, cleared in [!DS_game variables](!DS_game%20variables.md)), not at bootstrap. This script only registers the button scripts. Each option sets `game "user_has_been_welcomed" = 1` and removes the screen when done.

## Created / Used Agents

| Classifier | Name | Sprite | Type | Description |
|---|---|---|---|---|
| 1 2 26 | Welcome Screen | `ds welcome screen` | Creation | The new-world start panel (Starter Family / Eggs / Exit) |
| 1 1 43 | Teleport Effect | `teleport` | Creation | Transient teleport flourish shown as each starter creature arrives |

## Agent 1 2 26: Welcome Screen

| Event | Number | Description |
|---|---|---|
| Custom | 1001 | "Starter Family" — import two family creatures |
| Custom | 1002 | "Eggs" — create starter eggs |
| Custom | 1003 | "Exit" — dismiss with no creatures |
| Window Resized | 123 | Re-centre the panel |

### Event 1001 — Starter Family

Fades the panel out, crossfades into `StringsFull` music, pans the camera to the Norn meso, and imports **two** creatures from the `DFAM` PRAY resource (`pray next` / `pray impo`). For each: it "doctors" the imported history so reconciliation fails (forcing a fresh clone), plays a **teleport effect** (`1 1 43`) at the arrival spot, gives the creature a fake birth event (`hist evnt … 100`) and a **birth photo** (spawning a `1 2 37` photographer), and moves it into place. Finally restores focus, sets `user_has_been_welcomed = 1`, and kills the panel.

### Event 1002 — Eggs

Fades out, pans the camera, and drives the creature creator/egg-maker (`3 3 103`) to produce starter eggs — looping twice, each time randomising gender (messages 1003/1004) and breed (message 1000) before laying an egg (message 1001). Then sets `user_has_been_welcomed = 1` and self-destructs.

### Event 1003 — Exit

Fades out, restores focus, sets `user_has_been_welcomed = 1`, and kills the panel — starting the world with no seeded creatures.

## Removal Script

```
rscr
enum 1 2 26
    kill targ
next
enum 1 1 43
    kill targ
next
enum 4 0 0
    kill targ
next
trck null 0 0 0 0
```

Kills the welcome screen, any teleport effects, and **all creatures** (a clean slate), and stops camera tracking.

## Impact on Stimulus / Room CA

None directly. The screen seeds a new world by importing/creating creatures and eggs and plays effects/music; it emits no stimuli and does not write Room CA. (The creatures and eggs it creates have their own effects once in the world.)
