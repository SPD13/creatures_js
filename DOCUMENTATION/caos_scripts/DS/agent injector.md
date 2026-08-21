# agent injector.cos — Agent Injector Animation

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/agent injector.cos`

## Overview

This script creates the **agent injector** (`1 1 185`) — a decorative Workshop machine that plays an injection animation (a snout/nozzle extending and retracting) when an agent is injected into the world. It is Docking-Station-specific Workshop equipment and provides visual feedback for the agent-injection process.

At install it creates `1 1 185` (compound `agent injector` sprite) at (6065, 9061) in the Workshop/Comms area and plays its idle animation.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 185 | Agent Injector | `agent injector` | Workshop machine that animates when an agent is injected |

## Agent 1 1 185: Agent Injector

### Events

| Event | Number | Description |
|---|---|---|
| Custom | 1000 | Play the injection animation |

#### Event 1000 — Inject animation

Animates the body and the "snout" part: it fades the snout in, runs the extend animation (frames 0–13), holds briefly, then fades the snout back out and returns the body to its idle animation. It is a pure visual flourish triggered when something is injected at the machine.

## Removal Script

```
rscr
enum 1 1 185
    kill targ
next
```

Kills the agent injector.

## Impact on Stimulus / Room CA

None. The injector is a decorative animated machine; it emits no stimuli and does not affect Room CA.
