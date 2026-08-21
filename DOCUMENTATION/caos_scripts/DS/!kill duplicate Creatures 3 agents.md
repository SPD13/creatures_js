# !kill duplicate Creatures 3 agents.cos - Docking Cleanup

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/!kill duplicate Creatures 3 agents.cos`

## Overview

This is a **teardown / cleanup** bootstrap script, not an agent-creation script. When Docking Station docks with a Creatures 3 world, the C3 world has already installed its own user interface and utility agents. Docking Station then installs *its own* replacements — so this script first removes the leftover C3 instances to stop things like the user interface, tools and indicators appearing twice.

The `!` prefix forces it to run early in the `010 Docking Station` bootstrap folder, before the Docking Station replacements are created by later scripts.

It works purely by enumerating agents by classifier and either:

- **`kill targ`** — destroying every instance of that classifier (used for UI/tool agents that Docking Station re-creates), or
- **`stpt`** — stopping the agent's scripts without destroying it (used where the agent should persist but must stop acting).

It does not create or modify any agents, touches no map geometry, and reads/writes no game variables.

## No Created Agents

This script creates no agents. The classifiers it targets are Creatures 3 agents being removed or halted; their definitions are documented under the Creatures 3 pack. They are listed here only to record what this cleanup affects.

### Agents destroyed (`kill`)

| Classifier | Agent (per source comments) |
|---|---|
| 1 2 200 | GUI / user-interface agent |
| 1 2 11 | UI element |
| 1 2 12 | UI element |
| 1 2 13 | UI element |
| 1 2 14 | UI element |
| 1 2 34 | UI element |
| 1 2 32 | UI element |
| 1 2 35 | UI element |
| 1 2 24 | Life Events agent |
| 1 2 25 | Life Events agent |
| 1 2 26 | Welcome Screen |
| 2 32 23 | Creatures 3 Bacteria |
| 1 2 203 | CAOS command-line tool |
| 1 1 95 | Slap / tickle agent |
| 1 1 123 | Pointer Stimmer |
| 1 2 10 | Speech Bubble Factory |
| 1 2 3 | Text entry |
| 1 2 4 | Agent Help Watcher |
| 1 1 121 | XY Tool |
| 1 2 500 | Magic Profiler |
| 1 2 202 | Wolf Control |
| 1 2 201 | Frame Rater |
| 1 2 7 | Autosave |
| 1 2 2 | "IT" (object-of-attention) Indicator |
| 1 2 1 | Norn Indicator |
| 1 2 6 | Keyboard Handler |

### Agents stopped (`stpt`, not destroyed)

| Classifier | Agent (per source comments) | Why stop instead of kill |
|---|---|---|
| 3 3 31 | Creator | Left in place but prevented from running its scripts. |
| 1 1 114 | Grendel rain maker | Left in place but prevented from running its scripts. |

## Impact on Stimulus / Room CA

None. The script only removes or halts pre-existing agents; it emits no stimuli and does not alter rooms or Room CA. (Indirectly, destroying the C3 UI/tool agents removes whatever those agents would otherwise have done, but this script itself performs no environmental simulation.)
