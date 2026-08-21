# DS Blueprint Agent Export As Pray File.cos - Blueprint Export Utility

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS Blueprint Agent Export As Pray File.cos`

## Overview

This script installs the **export event handler** (event 809) for the **Blueprint** agent (classifier `1 1 100`). It creates no agents; it serialises the current state of a Blueprint agent into a distributable PRAY agent file (`.blueprint`), so a snapshot of the Blueprint — including all 100 of its object variables — can be packaged, shared and re-installed.

It is the Docking Station counterpart of the Creatures 3 [Blueprint Agent Export As Pray File](../C3/Blueprint%20Agent%20Export%20As%20Pray%20File.md) and behaves the same way. The Blueprint agent itself is created elsewhere (the agent-help flow); this script only adds its export handler.

## Modified Agents

| Classifier | Name | Type | Description | Details |
|---|---|---|---|---|
| 1 1 100 | Blueprint | Modification | Installs the export-to-PRAY event handler (event 809) | [Details](#agent-1-1-100-blueprint--event-809) |

---

## Agent 1 1 100: Blueprint — Event 809

Triggered when the Blueprint UI validates a user-entered filename and sends message 809 to the Blueprint agent; `ov98` then holds the chosen export name. The handler exports in three stages:

### Stage 1 — Generate the COS installation script

Opens `<name>.cos` (`file oope`) and writes a self-contained install script that recreates the agent:

```
* Automatically generated COS for blueprint
new: simp 1 1 100 "pick-ups" 0 0 5000
attr 199
perm 60
elas 10
fric 90
accg 2
```

It then **serialises all 100 object variables** (`ov00`–`ov99`) by looping 0→99 and calling the `write_var` subroutine, and finishes with `mvto 5440 3580` / `velo 30 -10` before closing the file.

### Stage 2 — Generate the PRAY source definition

Opens `<name>.pray_source` and writes an `AGNT` group describing the package: language `en-gb`, `Agent Type` 0, `Dependency Count` 0, `Script Count` 1, `Script 1` referencing the COS file from Stage 1, animation file/gallery `pick-ups(.c16)`, animation string `0`, `Agent Bioenergy Value` 1, and the description `"It's a blueprint dafty!"`.

### Stage 3 — Compile and clean up

Builds `<name>.blueprint`, calls `pray make` to compile the source into the final PRAY agent file (asserting success via `dbg: asrt` and echoing any error in `va03`), deletes the temporary `.cos` and `.pray_source` files (`file jdel`), and calls `pray refr` so the new blueprint appears in agent lists.

### Subroutine: `write_var`

Serialises one object variable to the COS file, choosing the setter by the variable's type (`type avar targ va10`):

| Type | CAOS type | Output |
|---|---|---|
| < 0 or > 2 | Null / agent | `seta avar targ N null` |
| 0 or 1 | Integer / Float | `setv avar targ N <value>` |
| 2 | String | `sets avar targ N <quoted value>` |

## Impact on Stimulus / Room CA

None. This is a file-serialisation utility (writes COS/PRAY files and compiles a `.blueprint`); it has no effect on agents in the world, stimuli, or Room CA.
