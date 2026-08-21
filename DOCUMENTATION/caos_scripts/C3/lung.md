# lung.cos - Lung Machinery Animation

## Overview

This script creates and manages a decorative lung machine agent on the Creatures 3 spaceship. The lung is a simple animated agent that cycles through a breathing animation loop on a timer, accompanied by a sound effect. It serves as a visual and auditory environmental detail in the ship's biological systems area, contributing to the living-machinery aesthetic of the Ark.

## Created Agents

| Classifier | Name | Description |
|---|---|---|
| [1 1 22](#agent-1-1-22---lung-machine) | Lung Machine | Animated lung machinery with breathing animation and sound |

---

## Agent Details

### Agent 1 1 22 - Lung Machine

A simple decorative agent representing a lung mechanism in the ship's biological machinery area. It is placed at coordinates (6147, 3739) and runs a continuous breathing animation loop on a 12-tick timer cycle.

**Agent Creation Parameters:**
- **Sprite file:** `lung` (11 frames, first image index 0)
- **Plane:** 100
- **Position:** (6147, 3739)
- **Timer interval:** 12 ticks

#### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Plays the breathing animation cycle and lung sound effect |

#### Event Details

**Timer (Event 9):**
The timer fires every 12 ticks and triggers a full breathing animation cycle. The animation plays through all 11 frames (0-10), with each frame displayed twice for a smooth breathing motion: `[0 0 1 1 2 2 3 3 4 4 5 5 6 6 7 7 8 8 9 9 10 10]`. A lung sound effect (`"lung"`) is played at the start of each cycle. The script uses `OVER` to wait for the animation to complete before the timer can fire again.

#### Removal Script

The removal script (`rscr`) enumerates and kills all lung machine agents (1 1 22) and removes the timer event script.
