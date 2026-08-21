# marine cave water.cos - Marine Cave Water Level System

**Source**: `Assets/Bootstrap/001 World/marine cave water.cos`

## Overview

This script manages the water level animation and room type transitions for the marine cave area in the Marine Terrarium. It creates a hidden reference agent and two animated water surface agents that visually represent the cave flooding and draining. The water level is driven by the state of three marine airlocks (3 3 38 left, 3 3 39 mid, 3 3 40 right): when airlocks are open, water rises in the cave rooms; when closed, water recedes. As the water level changes, the script toggles the room types of the underlying cave rooms between type 3 (dry corridor) and type 9 (underwater), which affects creature navigation, aquatic agent behavior, and Cellular Automata environmental properties throughout those rooms. Ambient cave and water sounds play randomly during water level transitions.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 90 | Cave Room Reference | `blnk` frame 1 | Invisible agent storing room IDs for all cave rooms affected by flooding | [Detail](#cave-room-reference-1-1-90) |
| 1 1 111 | Cave Water Surface (Left) | `aquatic cave water` frame 0 | Animated water surface for the left half of the marine cave | [Detail](#cave-water-surface-left-1-1-111) |
| 1 1 112 | Cave Water Surface (Right) | `aquatic cave water` frame 15 | Animated water surface for the right half of the marine cave | [Detail](#cave-water-surface-right-1-1-112) |

---

## Cave Room Reference (1 1 90)

An invisible agent placed at (4566, 2207) that serves as a data store for room IDs. It uses `grap` to look up the room ID at nine specific coordinate pairs across the marine cave, storing them in `ov60`–`ov68`. These room IDs are later used by the water surface agents to change room types via `rtyp`.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible to creatures |
| `tick` | 1 | Ticks every game tick |

### Stored Room IDs

| Variable | Coordinates | Zone |
|---|---|---|
| `ov60` | (4345, 2240) | Left cave section |
| `ov61` | (4387, 2223) | Left cave section |
| `ov62` | (4488, 2203) | Left cave section |
| `ov63` | (4594, 2124) | Left cave section |
| `ov64` | (4702, 2249) | Right cave section |
| `ov65` | (4796, 2209) | Right cave section |
| `ov66` | (4869, 2204) | Right cave section |
| `ov67` | (4974, 2190) | Right cave section |
| `ov68` | (5059, 2213) | Right cave section |

The left section rooms (`ov60`–`ov63`) are controlled by agent 1 1 111. The right section rooms (`ov64`–`ov68`) are controlled by agent 1 1 112.

---

## Cave Water Surface Left (1 1 111)

Animated water surface overlay for the left portion of the marine cave, positioned at (4352, 2058). Uses a transparent sprite (`aquatic cave water`, starting frame 0) with up to 17 animation frames representing progressive water levels (0 = empty, 17 = fully flooded).

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible to creatures |
| `tran` | 0, 1 | Transparency enabled (pixel value 0 is transparent) |
| `tick` | 1 | Ticks every game tick |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main water level update logic, runs every tick |

### Timer Event (9) Behavior

Each tick, the script checks the open/close state (`ov00`) of all three marine airlocks:

1. **Reads airlock states**: Targets each airlock (3 3 38, 3 3 39, 3 3 40) and reads their `ov00` (0 = closed, 1 = open).
2. **Determines target water direction**:
   - If the mid airlock (3 3 39) AND the right airlock (3 3 40) are both open → water rises (`va77 = 50`)
   - If the left airlock (3 3 38) is open → water rises (`va77 = 50`)
   - If both the mid and right airlocks are closed → water recedes (`va77 = 40`)
3. **Animates water level**:
   - Rising (`va77 = 50`): Increments pose by 1 each tick up to frame 17 (max water level)
   - Receding (`va77 = 40`): Decrements pose by 1 each tick down to frame 0 (empty)
4. **Plays ambient sounds**: During transitions, with a 1-in-6 random chance per tick, plays one of four ambient sounds: `cav1`, `cav2`, `cav3`, or `pod1`
5. **Updates room types**: Targets the cave room reference agent (1 1 90) and sets room types for the left cave rooms:
   - Pose <= 8 (low water): Sets rooms `ov60`–`ov63` to type **3** (dry/corridor)
   - Pose > 8 (high water): Sets rooms `ov60`–`ov63` to type **9** (underwater)

### Impact on Room CA

When rooms transition to type 9 (underwater), their Cellular Automata rates change to aquatic environment parameters, affecting temperature diffusion, nutrient flow, and other environmental properties. When rooms return to type 3 (dry), standard corridor CA rates apply.

---

## Cave Water Surface Right (1 1 112)

Animated water surface overlay for the right portion of the marine cave, positioned at (4701, 2058). Uses the same `aquatic cave water` sprite starting at frame 15 with up to 14 additional frames of animation (poses 0–14).

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 16 | Invisible to creatures |
| `tran` | 0, 1 | Transparency enabled (pixel value 0 is transparent) |
| `tick` | 1 | Ticks every game tick |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Main water level update logic, runs every tick |

### Timer Event (9) Behavior

Operates similarly to agent 1 1 111 but controls the right side of the cave and uses a slightly different airlock priority:

1. **Reads airlock states**: Same three airlocks (3 3 38, 3 3 39, 3 3 40).
2. **Determines target water direction**:
   - If the left airlock (3 3 38) AND the mid airlock (3 3 39) are both open → water rises (`va77 = 50`)
   - If the right airlock (3 3 40) is open → water rises (`va77 = 50`)
   - If both the left and mid airlocks are closed → water recedes (`va77 = 40`)
3. **Animates water level**: Increments/decrements pose between 0 and 14 (max water level for this side).
4. **Plays ambient sounds**: Same 1-in-6 random chance with the same four sound effects (`cav1`, `cav2`, `cav3`, `pod1`).
5. **Updates room types**: Targets the cave room reference agent (1 1 90) and sets room types for the right cave rooms:
   - Pose <= 7 (low water): Sets rooms `ov64`–`ov68` to type **3** (dry/corridor)
   - Pose > 7 (high water): Sets rooms `ov64`–`ov68` to type **9** (underwater)

### Impact on Room CA

Same as left side: room type transitions between 3 and 9 alter Cellular Automata environmental behavior in the right cave rooms.

---

## Removal Script

The removal script (`rscr`) cleans up all created agents and their event scripts:
- Enumerates and kills all 1 1 111 agents
- Enumerates and kills all 1 1 112 agents
- Removes timer scripts for both classifiers (`scrx 1 1 111 1000`, `scrx 1 1 112 1000`)

Note: The removal script does not explicitly remove the 1 1 90 reference agent; it persists independently.

## Dependencies

| Classifier | Agent | Relationship |
|---|---|---|
| 3 3 38 | Marine Airlock Left | Read `ov00` to determine open/closed state |
| 3 3 39 | Marine Airlock Mid | Read `ov00` to determine open/closed state |
| 3 3 40 | Marine Airlock Right | Read `ov00` to determine open/closed state |
| 1 1 90 | Cave Room Reference | Read `ov60`–`ov68` for room IDs, used as `rtyp` target |
