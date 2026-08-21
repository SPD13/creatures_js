# DS connecting agent pointer change

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS connecting agent pointer change.cos`

## Overview

This bootstrap script defines the sound effects and visual feedback for the pointer agent (`2 1 1`) during the **port connection workflow** — wiring agents together via input/output ports — plus the connection-break sound for Simple agents (`2 0 0`) and Vehicles (`3 0 0`). It creates no agents; it only attaches event scripts to existing classifiers. It is the Docking Station counterpart of the Creatures 3 [Connecting Agent Pointer Change](../C3/connecting%20agent%20pointer%20change.md) and behaves the same way.

## No Created Agents

This script creates no agents. It defines event scripts on the pointer (2 1 1) and the generic Simple/Vehicle classifiers.

## Pointer Port Scripts (2 1 1)

Pointer pose 13 is the "port wiring" cursor, pose 0 the default cursor, frame 14 the error shake.

| Event | Number | Behaviour |
|---|---|---|
| POINTERPORTSELECT | 110 | A port is selected to begin a connection → `pnt1` sound, pose 13 |
| POINTERPORTCONNECT | 111 | A connection is made → `pnt1` sound, pose 0 |
| POINTERPORTDISCONNECT | 112 | A connection is disconnected → `snap` sound, pose 0 |
| POINTERPORTCANCEL | 113 | A connection operation is cancelled → `snap` sound, pose 0 |
| POINTERPORTERROR | 114 | A connection attempt fails → `buzz` sound + error shake anim `[14×12, 13, 13]` (stays in wiring mode) |

## Connection Break Scripts (2 0 0 and 3 0 0)

| Classifier | Event | Behaviour |
|---|---|---|
| 2 0 0 | 118 (CONNECTIONBREAK) | A Simple agent's port connection is broken → `snap` sound |
| 3 0 0 | 118 (CONNECTIONBREAK) | A Vehicle's port connection is broken → `snap` sound |

## Impact on Stimulus / Room CA

None. The script only provides audio-visual feedback for the port-connection mechanic; it emits no stimuli and does not affect Room CA.
