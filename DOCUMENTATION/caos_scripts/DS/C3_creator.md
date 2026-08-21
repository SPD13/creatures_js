# C3_creator.cos - Hardened Creator "Create" Button

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/C3_creator.cos`

## Overview

This script replaces the **create-button** handler of the Creatures 3 **Creator** machine (classifier `3 3 21`) with a more resilient, "bullet-proofed" version for Docking Station. It installs a single event script — `scrp 3 3 21 2001` — that runs when the Creator's create button is pressed. The script selects the next agent (AGNT) resource from the PRAY system, plays the machine's animation, injects the agent into the world, charges Bioenergy, and reports any failure to the Creator's display panel. It also spawns a short "teleport" visual effect (`1 1 47`) when the created agent specifies a camera target.

The Creator itself is documented under the Creatures 3 pack ([Creator](../C3/Creator.md)); this script only re-points its create action.

## Created / Modified Agents

| Classifier | Name | Type | Description | Details |
|---|---|---|---|---|
| 3 3 21 | Creator (C3) | Modification | Replaces the create-button script (event 2001) with a hardened version | [Details](#agent-3-3-21-creator) |
| 1 1 47 | Teleport Effect | Creation | Transient "teleport" animation spawned at the new agent's camera target | — |

---

## Agent 3 3 21: Creator

### Events

| Event | Number | Description |
|---|---|---|
| Message | 2001 | Create button pressed — select, inject and charge for the next agent |

### Event 2001 — Create button

The handler proceeds as follows:

1. **Setup** — sets the camera target game variables (`CreatorX`/`CreatorY`), plays `sc_2`, and reads the two energy-bar agents (`ov18`, `ov19`) to compare available vs required energy (`va52 >= va53`).
2. **Resource validity** — `pray refr` refreshes the PRAY resource list; if the currently selected resource `ov88` no longer exists (`pray test ov88 = 0`), it sends the error *"Agent file has been moved"* to the display (the `1 1 91` panel) and stops.
3. **Ready check** — proceeds only if the Creator is idle (`ov01 = 0`), its internal tank is full (`ov02 = 19`), power is on (`ov00 = 1`) and there is enough energy. Otherwise it shows the *"Energy"* readout, flashes the button and fades.
4. **Select & animate** — picks the next `AGNT` resource if none is selected (`pray next "AGNT"`), animates the button, drains the internal tank, and sets the busy flag (`ov01 = 1`).
5. **Camera / teleport FX** — reads the agent's `Camera X` / `Camera Y` PRAY tags; if present, spawns the `1 1 47` "teleport" effect there and pans/zooms the camera to it.
6. **Inject** — injects the agent in two phases via `pray injt`: first the files (flag 0), then the scripts (flag 1). The return code is handled explicitly:

| `pray injt` result | Meaning | Action |
|---|---|---|
| 0 | Success | Deduct the agent's `Agent Bioenergy Value` from `game "Bioenergy"` |
| -1 | Script not found | Error animation + *"Script not found"* to the display |
| -2 | Injection failed | Error animation + *"Injection failed"* to the display |
| -3 | Dependency failure | Error animation + *"A required file was not found"* to the display |

7. **Charge & finish** — messages the energy bars (`ov18`/`ov19` message 500, passing the bioenergy value), closes the creator doors, then restores the camera to the Creator (`cmrp 4390 1430`) and re-zooms.

The explicit `-1`/`-2`/`-3` handling (with on-panel error text) is the "bullet-proofing" the header comment refers to: a missing or broken agent file now produces a clear message instead of a silent or broken create.

---

## Agent 1 1 47: Teleport Effect

Spawned with `new: simp 1 1 47 "teleport" 9 11 9000` at the new agent's camera position (offset by −100, −70), it plays a 9-frame animation (`anim [0 1 2 3 4 5 6 7 8]`) and ticks once after 10. It is a purely cosmetic, short-lived flourish marking where the created agent appears. (No event scripts for it are defined in this file.)

## Impact on Stimulus / Room CA

None. The script drives the Creator UI, PRAY injection and Bioenergy accounting; it emits no stimuli and does not alter Room CA. (The agents it injects may, once created, have their own environmental effects.)
