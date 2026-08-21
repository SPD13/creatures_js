# vents

## Overview

Ambient decoration script for the Shee ark world. Creates a single "vents" simple agent at a fixed map location, continuously looping through a 23-frame animation to give the impression of steam/gas vents venting in the background. The agent is non-interactive (attr 0), has no event scripts, and exists purely for visual atmosphere.

The removal script (`rscr`) kills every instance of the 1 1 115 classifier and removes script 9 (the removal script itself) from the scriptorium, allowing the bootstrap to be rerun cleanly.

## Created Agents

| Classifier | Name | High-level function | Details |
|------------|------|---------------------|---------|
| 1 1 115 | vents | Animated background vents decoration | [vents](#vents-1-1-115) |

## vents (1 1 115)

Ambient animated decoration placed at world coordinates (5690, 2194). Created as a simple agent with 1 sprite plane and 1 image, using the "vents" sprite file starting at image 23 with a base plane of 500. Animation frame rate is 2 (every other tick) and it loops indefinitely through frames 0–22 (the trailing `255` in the `anim` list is the loop marker).

| Event | Number | Human description |
|-------|--------|-------------------|

No event scripts are installed for this agent. It behaves as a purely passive visual element: it does not respond to clicks, collisions, timers, stimuli, or messages, and it cannot be picked up or moved (attr 0 means no activatable, mouseable, movable, floatable, or suffer-collisions bits set).

The agent has no stimulus emissions and no effect on Room CA values.
