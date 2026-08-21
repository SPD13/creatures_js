# Efficiency Indicator

**Source file:** `Assets/Bootstrap/001 World/XEfficiency indicator.cos`

## Overview

The Efficiency Indicator script creates a set of six on-screen text overlays that display the current efficiency percentage of key machines and systems aboard the Ark. Each indicator is a compound agent positioned near its associated machine, showing a label such as "Creator Efficiency : 0%" using white-on-transparent text. The indicators monitor the Creator, Replicator, Recycler, Splicer, and two Seed Banks (Norn and Ettin).

The efficiency value (`ov02`) starts at 0% for the four main machines and 100% for the seed banks. Machines send message 1000 to their indicator to increment the efficiency by 25% (simulating recovery). A temporary status message can be shown via message 1001, which reverts to the normal display after 100 ticks.

Text labels are read from the `"Efficiency"` catalogue tag:
- Index 0: `"Efficiency : "` (common suffix)
- Index 1: `"Creator "`
- Index 2: `"Replicator "`
- Index 3: `"Recycler "`
- Index 4: `"Splicer "`
- Index 5: `"Seed bank "`

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 1 91 | Efficiency Indicator | Text overlay displaying machine efficiency percentage | [Details](#agent-1-1-91-efficiency-indicator) |

---

## Agent 1 1 91: Efficiency Indicator

Six instances of this compound agent are created, each positioned near the machine it monitors. Each instance uses the `"infobar"` sprite with a fixed text part (`pat: fixd`) rendered using the `"WhiteOnTransparentChars"` font. The text part (part 1) is formatted with `frmt 1 1 1 1 1 1 2`.

Each indicator stores a reference to its associated machine in `ov16` (found via `rtar`) and identifies itself via `ov00`.

### Instances

| Instance | ov00 | Position | Monitored Machine | Linked Classifier | Initial ov02 |
|---|---|---|---|---|---|
| 1 | 1 | (5330, 3515) | Creator | 3 3 21 (Creator) | 0% |
| 2 | 2 | (6100, 3515) | Replicator | 3 3 25 (Replicator) | 0% |
| 3 | 3 | (2285, 920) | Recycler | 3 3 38 (Marine Airlock) | 0% |
| 4 | 4 | (5360, 3754) | Splicer | 3 3 38 (Marine Airlock) | 0% |
| 5 | 5 | (1800, 2160) | Norn Seed Bank | 2 5 1 (Seed Bank plant) | 100% |
| 6 | 6 | (5603, 600) | Ettin Seed Bank | 3 3 69 (Ettin Seed Bank) | 100% |

**Note:** Instances 5 and 6 use a null-check (`doif targ ne null`) when linking to their machine, as the seed bank agents may not exist at bootstrap time.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Machine identifier (1=Creator, 2=Replicator, 3=Recycler, 4=Splicer, 5=Norn Seed Bank, 6=Ettin Seed Bank) |
| `ov02` | Current efficiency percentage value |
| `ov16` | Agent reference to the associated machine |

### Events

| Event | Number | Description |
|---|---|---|
| Message | 1000 | Update efficiency display (increment by 25%) |
| Message | 1001 | Show temporary custom text |
| Message | 1002 | Restore normal efficiency display |

### Event 1000 - Update Efficiency

Sent by the associated machine to update the indicator's efficiency display. Increments `ov02` by 25 each time the message is received, simulating gradual efficiency recovery. For the Splicer (`ov00 = 4`), `ov02` is always set directly to 100 instead of incrementing.

Rebuilds the display text from the catalogue as: `"[Machine name] Efficiency : [ov02]%"` and writes it to the text part.

### Event 1001 - Show Custom Text

Receives a string parameter (`_p1_`) and temporarily replaces the efficiency display with this custom text. After waiting 100 ticks, sends message 1002 to itself to restore the normal display. This is used by machines to show status messages (e.g., operation feedback) on the indicator.

### Event 1002 - Restore Display

Restores the normal efficiency display text after a temporary message from event 1001. Rebuilds the string from the catalogue using the current `ov00` and `ov02` values.

### Removal Script

The removal script (`rscr`) enumerates all agents with classifier 1 1 91 and kills them, cleaning up all efficiency indicator instances.

### Impact on Stimulus / Room CA

None. These are purely informational display overlays with no effect on creatures, stimuli, or room chemical atmospheres.
