# hoverdoc.cos — The HoverDoc

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/hoverdoc.cos`

## Overview

This script creates the **HoverDoc** (`3 8 64`), the floating life-form the player drops onto a creature to examine it. The HoverDoc itself is just the flyer; all the medical readouts and treatments live in the separate **Creature Care Kit** (CCK, `1 1 170`), which the HoverDoc **creates and carries** (the CCK floats relative to the HoverDoc and is faded out/in by it). The HoverDoc has two states (`name "state"`): **dormant** (a physics object that can be picked up) and **active** (floating, attached to a "patient" creature with the CCK open).

It also installs a **shortcut watcher** (`1 1 223`) that lets the player press **Ctrl+H** to snap the camera to a HoverDoc (creating one if none exists).

> The CCK's own scripts are installed by [creature care kit scripts](creature%20care%20kit%20scripts.md); this file is what actually instantiates the CCK (`new: comp 1 1 170`) inside the HoverDoc's `cck` subroutine.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 3 8 64 | HoverDoc | `hoverdoc` | The floating diagnostic flyer — see [detail](#agent-3-8-64-hoverdoc) |
| 1 1 170 | Creature Care Kit | `hoverdoc` | The medical panel the HoverDoc carries (behaviour in [creature care kit scripts](creature%20care%20kit%20scripts.md)) |
| 1 1 223 | Shortcut Watcher | `blnk` | Invisible key listener for the Ctrl+H "find HoverDoc" hotkey — see [detail](#agent-1-1-223-shortcut-watcher) |

## Agent 3 8 64: HoverDoc

`ov16` holds the patient creature; `ov70` holds the CCK; `ov71`/`ov72` are the follow velocities.

### Events

| Event | Number | Description |
|---|---|---|
| Push | 1 | While active, toggle the CCK open/closed |
| Pull | 2 | Message self 0 (deactivate) |
| Drop | 5 | If dropped near a creature, attach to it and go **active**; if active, find a new patient or return dormant |
| Timer | 9 | The main behaviour loop — create/follow the CCK, track the patient, handle airlock/death |
| Collision | 6 | Landing sound |

### Event 5 — Drop (attach to a patient)

When a **dormant** HoverDoc is dropped, it looks (`esee 4 0 0`, range 100) for a nearby creature that isn't being carried; if found it stores it as the patient (`ov16`), becomes a floating agent (`attr 16`, picks a free plane to avoid overlaps), animates open, sets `name "state" = "active"`, and starts its fast timer. An already-active HoverDoc instead looks for a new patient, returning to dormant (restoring physics attributes and parking safely) if none is found.

### Event 9 — Timer (the doctor at work)

- **Airlock escape:** if flagged caught in a C3 airlock (`name "airlock"`), fade out the CCK and return to the dormant start position.
- **Active + CCK open:** if no CCK exists yet, the **`cck`** subroutine builds one (`new: comp 1 1 170`), lays out its parts, seeds its name-variables (the drive-icon order and the chemical names 66–89 for the Toxin module), floats it relative to the HoverDoc, and fades it in. Then **`good_bedside_manner`** repositions the HoverDoc to a comfortable spot beside the patient.

### `good_bedside_manner` — patient following

Aims for a framing offset beside the patient. Within range it does a graded **smooth follow** (velocity scaled by distance); if the patient is more than ~350 px away or in a different metaroom, it **fades out the HoverDoc and CCK, teleports to a good vantage, and fades back in**. If the patient dies (`ov16` becomes null), it closes up, drops the CCK, and returns to dormant. (This follow logic is shared with the comms camera units.)

## Agent 1 1 223: Shortcut Watcher

| Event | Number | Description |
|---|---|---|
| Key Down | 73 | On **Ctrl+H**, snap the camera (`cmrt`) to a dormant HoverDoc — creating a new one if none exists |

## Removal Script

```
rscr
enum 3 8 64 / 1 1 170 / 1 1 223
    kill targ
next
scrx … (removes the HoverDoc and watcher scripts)
```

Kills all HoverDocs, any open Creature Care Kits, and the shortcut watcher.

## Impact on Stimulus / Room CA

None directly. The HoverDoc is a flying diagnostic UI: it emits no creature stimuli and writes no Room CA. It attaches to a "patient" creature and carries the Creature Care Kit, which is where the actual medical interventions (chemical injection, fertility, bacteria removal) happen — see [creature care kit scripts](creature%20care%20kit%20scripts.md).
