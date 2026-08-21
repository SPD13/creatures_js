# heatpan incubator.cos — The Heat Pan Incubator

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/heatpan incubator.cos`

## Overview

This script places three invisible **Heat Pan Incubator** agents (`2 22 4`) across the warm "heat pan" area of the Norn Meso nest. Each one continuously **emits the norn home/nest smell** (CA 15) to mark the spot as a nesting site, and runs a timer that **keeps any eggs resting on it incubating** — jiggling each touching egg's timer so it advances toward hatching. Together they make the heat pan a natural incubator where laid eggs warm up and hatch.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 22 4 | Heat Pan Incubator | `blnk` | Invisible nest-smell emitter that incubates resting eggs — see [detail](#agent-2-22-4-heat-pan-incubator) |

Three instances are created at fixed positions across the heat pan, each with a slightly different timer interval (50 / 60 / 70 ticks) and emitting CA 15 at rate 0.25.

## Agent 2 22 4: Heat Pan Incubator

An invisible (`attr 16`) `new: simp` agent.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | If any eggs exist, nudge the incubation of each egg touching the pan |

### Event 9 — Incubate

If there are any eggs in the world (`totl 3 4 0`), it enumerates the eggs touching it (`etch 3 4 0`); for each egg that is **not being carried** and is **not currently running a script** (`code = -1`), it resets the egg's timer to a random interval (`tick rand 1 100`). This keeps eggs that rest on the heat pan ticking over and incubating (rather than sitting dormant), with randomised timing so a clutch doesn't all hatch at once.

## Removal Script

```
rscr
enum 2 22 4
    kill targ
next
scrx 2 22 4 9
```

Kills the incubators and removes their timer script.

## Impact on Stimulus / Room CA

**Room CA:** each heat pan continuously `emit`s **CA 15 (norn home/nest smell)** at rate 0.25, marking the Meso heat pan as a nesting site that norns are drawn to.

No creature stimuli are emitted. Its other effect is functional rather than chemical: it advances the timers of eggs resting on it, so the heat pan acts as a working incubator.
