# gene splicer overlay.cos - Gene Splicer Visual Overlay

**Source**: `Assets/Bootstrap/001 World/gene splicer overlay.cos`

## Overview

This script creates a static visual overlay sprite for the Genetic Splicer machine located in the Engineering section of the Ark. The overlay is a purely decorative element with no interactive behavior, no event scripts, and no attributes. It is rendered at a high plane value (8100) so it appears above other elements in the scene, providing a visual layer on top of the splicer hardware.

The overlay works in conjunction with the Genetic Splicer Panel (`Genetic splicer panel2.cos`, classifier 3 3 18) which provides the actual interactive splicing UI.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 124 | Gene Splicer Overlay | `gene splicer overlay` | Static decorative overlay sprite positioned above the gene splicer machine | [Detail](#gene-splicer-overlay-1-1-124) |

---

## Gene Splicer Overlay (1 1 124)

A simple agent that serves as a visual overlay for the gene splicer area. It is created with no attributes (`attr 0`), meaning it is not clickable, not carryable, and does not interact with physics or other agents. It is positioned at coordinates (4842, 3830) in the Engineering section and rendered at plane 8100 to layer above surrounding scenery.

### Events

| Event | Number | Description |
|---|---|---|
| Remove Script | — | Enumerates and destroys all agents with classifier 1 1 124 |

### Remove Script

The remove script (`rscr`) iterates over all instances of classifier 1 1 124 and kills them. This is the standard cleanup pattern used across bootstrap scripts to allow the world to be cleanly reset or the script to be re-injected without leaving duplicate agents.
