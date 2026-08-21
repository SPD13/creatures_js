# Connecting Agent Pointer Change

**Source file:** `Assets/Bootstrap/001 World/connecting agent pointer change.cos`

## Overview

This bootstrap script defines the sound effects and visual feedback for the pointer agent (2 1 1) during the **port connection workflow** — the system by which agents are wired together via input/output ports. It also defines the **connection break** sound effect for Simple agents (2 0 0) and Vehicles (3 0 0), played when an existing port connection is severed.

The script does not create any agents. Instead, it attaches event scripts to the existing Pointer agent (classifier 2 1 1) and to the generic Simple agent (2 0 0) and Vehicle (3 0 0) classifiers. These scripts provide audio-visual cues that guide the player through the process of selecting, connecting, disconnecting, and cancelling port operations.

## Created Agents

This script does not create any agents. It only defines event scripts on existing agent classifiers.

---

## Pointer Agent Port Scripts (2 1 1)

These scripts handle the pointer's visual and audio feedback during port connection operations. The pointer sprite has at least 15 frames; pose 13 shows a "port connection" cursor state, pose 0 is the default cursor, and frames 14 are used for an error animation.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 110 | POINTERPORTSELECT | A port has been selected for connection |
| 111 | POINTERPORTCONNECT | A port connection has been successfully made |
| 112 | POINTERPORTDISCONNECT | A port connection has been disconnected |
| 113 | POINTERPORTCANCEL | A port connection operation has been cancelled |
| 114 | POINTERPORTERROR | A port connection attempt has failed (invalid connection) |

### Event 110 — POINTERPORTSELECT

Fired when the player selects a port on an agent to begin a connection operation. The pointer plays the `pnt1` sound effect and switches to pose 13 (a visual indicator that the player is in "port wiring" mode).

### Event 111 — POINTERPORTCONNECT

Fired when a port connection is successfully established between two agents. The pointer plays the `pnt1` sound effect and returns to pose 0 (default cursor), indicating the connection operation is complete.

### Event 112 — POINTERPORTDISCONNECT

Fired when the player disconnects an existing port connection. The pointer plays the `snap` sound effect and returns to pose 0 (default cursor).

### Event 113 — POINTERPORTCANCEL

Fired when the player cancels a port connection operation without completing it. The pointer plays the `snap` sound effect and returns to pose 0 (default cursor).

### Event 114 — POINTERPORTERROR

Fired when a port connection attempt fails (e.g., incompatible port types). The pointer plays the `buzz` sound effect and runs an animation sequence showing frame 14 repeated 14 times before returning to pose 13 twice — a visual "error shake" that signals the connection was rejected while keeping the pointer in port-wiring mode.

---

## Connection Break Scripts (2 0 0 and 3 0 0)

### Events

| Classifier | Event # | Event Name | Description |
|---|---|---|---|
| 2 0 0 | 118 | CONNECTIONBREAK | A port connection on a Simple agent has been broken |
| 3 0 0 | 118 | CONNECTIONBREAK | A port connection on a Vehicle agent has been broken |

### Event 118 — CONNECTIONBREAK (Simple Agents and Vehicles)

Fired on a Simple agent (family 2) or Vehicle (family 3) when one of its port connections is broken externally (e.g., because the connected agent was removed from the world). Both scripts play the `snap` sound effect to give the player audible feedback that a connection has been severed.
