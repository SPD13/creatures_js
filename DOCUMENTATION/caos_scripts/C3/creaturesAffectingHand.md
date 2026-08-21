# Creatures Affecting Hand

## Overview

This script configures how the hand (pointer) cursor visually reacts when creatures interact with it. It modifies the pointer's behavior flags to allow creatures to push, pull, and hit it, and defines animation sequences that play on the hand cursor in response to each type of creature interaction.

This script does not create any new agents. It modifies the existing pointer agent and defines event scripts for classifier **2 1 1** (the pointer interaction target).

## Mechanism

### Install Script (iscr)

The install script targets the pointer agent and modifies its `BHVR` flags by ORing the current value with `11` (binary `1011`). This enables the following creature interaction permissions on the pointer:

| Bit | Value | Permission |
|-----|-------|------------|
| 0   | 1     | Activate 1 (Push) |
| 1   | 2     | Activate 2 (Pull) |
| 3   | 8     | Hit |

By using `ORRV` rather than a direct `SETV`, the script preserves any existing BHVR flags already set on the pointer while adding these new permissions.

### Event Scripts for Classifier 2 1 1

The script defines three event handlers for agent classifier **2 1 1** (Family: Simple Object, Genus: 1, Species: 1). Each handler targets the pointer and plays a specific animation sequence to provide visual feedback when creatures interact with the hand.

| Event | Number | Description | Animation Frames |
|-------|--------|-------------|-----------------|
| Activate 1 | 1 | Creature pushes the hand | `[0 22 22 23 23 23 22 22 0]` |
| Activate 2 | 2 | Creature pulls the hand | `[0 20 20 21 21 21 20 20 0]` |
| Hit | 3 | Creature hits/slaps the hand | `[0 24 25 24 0]` |

#### Event 1 - Activate 1 (Push)

When a creature pushes the hand, the pointer plays a longer animation sequence cycling through frames 22-23, creating a visual "squeeze" or "grab" effect before returning to the default frame 0.

#### Event 2 - Activate 2 (Pull)

When a creature pulls the hand, the pointer plays a similar animation using frames 20-21. This provides distinct visual feedback from the push action, showing a different hand gesture.

#### Event 3 - Hit (Slap)

When a creature hits the hand, the pointer plays a shorter, snappier animation through frames 24-25, suggesting a quick recoil or flinch reaction.

### Remove Script (rscr)

The remove script section removes the Hit event script (event 3) for classifier 2 1 1 using `SCRX 2 1 1 3`. This cleanup removes the hit reaction handler when the script is uninstalled, while leaving the push and pull reactions intact (they are presumably cleaned up elsewhere or remain persistent).

## Modified Agents

| Classifier | Agent | Modification |
|-----------|-------|-------------|
| Pointer (PNTR) | Hand cursor | BHVR flags updated to allow creature push, pull, and hit |
| 2 1 1 | Pointer interaction target | Event scripts 1, 2, 3 defined for creature interaction animations |
