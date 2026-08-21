# creatureObjectVariables.cos

## Overview

This script is a **developer reference file** that documents the purpose of specific creature object variables (`OVxx`) used across other bootstrap scripts. It does not contain any executable CAOS code — it is purely a comment-based documentation file included in the bootstrap folder for developer convenience.

The file records two key creature object variable conventions used by other systems in the game:

| Variable | Purpose | Used By |
|----------|---------|---------|
| `OV53` | Signal for the Hatchery agent — used to communicate hatching-related state between creatures and the Hatchery machinery | Hatchery scripts |
| `OV81` | Signal to trigger body decomposition — used to indicate that a creature's body should begin the decomposition process after death | Death/decomposition scripts |

## No Created Agents

This script does not create, modify, or install any agents. It contains no executable CAOS instructions — only comment lines (prefixed with `*`) serving as documentation for creature object variable assignments used elsewhere in the bootstrap system.

## Variable Details

### OV53 — Hatchery Signal

This object variable is used as a communication flag between creature agents and the Hatchery agent. When set on a creature, it signals the Hatchery system about the creature's hatching status, enabling the Hatchery to track and manage egg-to-creature transitions.

### OV81 — Body Decomposition Signal

This object variable serves as a trigger for the body decomposition system. When a creature dies, this variable is set to signal that the creature's physical body should begin decomposing and eventually be removed from the world. This ties into the game's lifecycle management where dead creatures don't persist indefinitely.
