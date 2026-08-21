# autorecovery.cos — Key-Agent Watchdog

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/autorecovery.cos`

## Overview

This script creates an invisible **autorecovery** watchdog (`1 1 226`) that periodically checks for the presence of Docking Station's key UI/machine agents and **re-injects their COS files** if any have gone missing. It is a self-healing mechanism that keeps the essential interface and Workshop equipment alive even if something destroys them.

At install it creates `1 1 226` (`blnk` sprite) at (0, 0) with `tick 40` (~2 seconds).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 226 | Autorecovery Watchdog | `blnk` | Invisible timer that re-injects missing key agents |

## Agent 1 1 226: Autorecovery Watchdog

### Event 9 — Timer (every ~2 s)

Runs a series of subroutines, each checking `totl <classifier>` (the count of a key agent) and re-injecting (`ject`) the relevant COS file(s) when the count is zero:

| Subsystem | Watched classifier(s) | Re-injected COS file(s) |
|---|---|---|
| Workshop screen | 1 2 208 | `containment chamber.cos`, `workshop screen.cos` |
| Containment chamber | 1 1 154 | `workshop screen.cos`, `containment chamber.cos` |
| Comms room | 1 2 210 | `contact buttons.cos`, `comms screen.cos` |
| Immigrant checker | 1 1 184 | `immigrant checker.cos` |
| Muco (egg layer) | 1 1 161, 3 3 102, 3 3 103 | `norn egg layer.cos` |
| Message centre | 1 1 206 | `message centre.cos` |
| Chat interpreters | 1 1 213, 1 1 209 | `chat - the interpreters.cos` |
| Holistic learning machine | 1 1 174, 1 1 202, 3 3 100 | `holistic learning machine.cos` |
| GUI | 1 2 13, 1 2 35, 1 2 11, 1 2 12, 1 2 14 | `ds gui - topleft / inventory / options / creaturemenu.cos` |

(Where a subsystem has co-dependent agents, the relevant files are first removed and then re-injected together so the agents rebuild cleanly.)

This table doubles as a map of which DS scripts create which "essential" agents.

## Removal Script

```
rscr
enum 1 1 226
    kill targ
next
```

Kills the watchdog.

## Impact on Stimulus / Room CA

None. The watchdog only monitors and re-injects agents; it emits no stimuli and does not affect Room CA.
