# Creator.cos - Agent Injector (Creator Machine)

**Source**: `Assets/Bootstrap/001 World/Creator.cos`

## Overview

This script implements the Creator Machine, the primary in-game tool for injecting new agents into the Creatures 3 world. It is a vehicle-type agent featuring an integrated camera preview, a bioenergy economy system, and a PRAY resource browser for selecting and deploying agents from `.agent` files.

The Creator operates on a bioenergy economy: each agent injection costs a specific amount of bioenergy, and the Creator recharges energy over time. Players browse available agents with next/previous buttons, preview them through a built-in camera viewport, and inject them into the world. If the agent specifies camera coordinates in its PRAY metadata, the Creator pans to show the injected agent's location with a teleport visual effect. The Creator also supports removing previously injected agents by executing their PRAY-defined "Remove script".

On bootstrap, the script adds 200 bioenergy to the global `"Bioenergy"` game variable (capped at 1000 during use). The Creator starts fully charged (`ov02 = 19`) and ready for immediate use.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 21 | Creator Machine | `creator` | Main vehicle agent with camera, buttons, energy gauge, and injection mechanism | [Detail](#creator-machine-3-3-21) |
| 3 3 22 | Bioenergy Bar | `creator` frame 16 | Visual indicator showing current bioenergy level | [Detail](#bioenergy-bar-3-3-22) |
| 3 3 23 | Agent Cost Bar | `creator` frame 18 | Visual indicator showing selected agent's bioenergy cost | [Detail](#agent-cost-bar-3-3-23) |
| 3 3 66 | Agent Preview | *(dynamic)* | Temporary preview agent displayed in the Creator's camera viewport | [Detail](#agent-preview-3-3-66) |
| 1 1 47 | Teleport Effect | `teleport` | Short-lived visual effect played at the injection target location | [Detail](#teleport-effect-1-1-47) |

---

## Creator Machine (3 3 21)

The Creator Machine is a vehicle-type agent positioned in the Engineering section of the Ark. It provides a self-contained UI for browsing, previewing, and injecting agents from PRAY resource files. It features a built-in camera part (part 10), interactive buttons, an energy recharge gauge, and status display.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 8 | Activatable by creatures |
| `perm` | 60 | Moderate permeability |
| `bhvr` | 0 | No creature behaviors (cannot be picked up, pushed, etc.) |
| `clac` | -1 | Mouse click does not activate creatures |
| `cabn` | 0 50 150 150 | Cabin bounds for contained agents |
| Position | (5348, 3515) | Engineering section |

### Parts

| Part | Type | Sprite | Position (relative) | Purpose |
|---|---|---|---|---|
| 0 | Body | `creator` frame 0 | Origin | Main body of the Creator |
| 1 | Button | `creator` frames 1-2 | (333, 95) | Main toggle button (open/close) — message 2000 |
| 2 | Button | `creator` frames 3-5 | (484, 32) | Inject button — message 2001 |
| 4 | Button | `creator` frames 12-13 | (459, 10) | Next agent button — message 2002 |
| 5 | Button | `creator` frames 14-15 | (459, 28) | Previous agent button — message 2003 |
| 6 | Dull | `creator` frame 20 | (242, 0) | Energy recharge gauge (pose 0-19) |
| 7 | Dull | `creator` frame 40 | (77, 47) | Status/pipe indicator |
| 8 | Dull | `creator` frame 48 | (-12, 50) plane 7990 | Injection beam animation |
| 10 | Camera | `creator` | (300, 7) viewport 280x160, view 140x80 | Preview camera showing selected agent |
| 11 | Button | `creator_remove_button` frames 0-5 | (492, 7) | Remove agent button — message 2011 |

### OV Variables

| Variable | Purpose |
|---|---|
| `ov00` | Open/closed state: 0 = closed, 1 = open |
| `ov01` | Injection state: 0 = idle, 1 = injection in progress |
| `ov02` | Energy recharge level: 0-19 (19 = fully charged) |
| `ov03` | Camera zoom flag: 1 = camera panned to agent location during injection |
| `ov18` | Agent reference to the Bioenergy Bar (3 3 22) |
| `ov19` | Agent reference to the Agent Cost Bar (3 3 23) |
| `ov77` | Remove button toggle: 0 = hidden, 1 = shown |
| `ov80` | Camera zoom level (negated for zoom/unzoom operations) |
| `ov88` | Currently selected PRAY agent resource name (string) |
| `ov90` | 60 (shared with bars; possibly a styling/layout constant) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Energy recharge tick |
| 255 | Pickup | Disabled (stops immediately) |
| 2000 | Button 1 (UI) | Toggle open/close |
| 2001 | Button 2 (UI) | Inject selected agent |
| 2002 | Button 4 (UI) | Navigate to next agent |
| 2003 | Button 5 (UI) | Navigate to previous agent |
| 2011 | Button 11 (UI) | Toggle/execute remove agent |
| 5000 | Internal message | Update agent preview display |

#### Event 2000 — Toggle Open/Close

Sound: `"bp_1"`, Music: `"cyc1"`

**Opening** (ov00 = 0):
1. Animates the main button (part 1) and flashes the navigation arrows (parts 4, 5).
2. Sends message 500 to the Bioenergy Bar (ov18) with param1=150, param2=1 to show the energy level.
3. Sets `ov00 = 1` (open state).
4. If energy is not fully charged (`ov02 < 19`), starts recharge timer (`tick 2`).
5. Sends message 2002 to self, triggering the "next agent" logic to load and display the first available agent.

**Closing** (ov00 = 1):
1. If the remove button is showing (`ov77 = 1`), hides it first with a closing animation.
2. Plays sound `"bp_1"`.
3. Kills any existing agent preview (3 3 66).
4. Sends message 500 to both bars with param1=0 to reset their positions.
5. Fades part 1 animation and resets state (`ov00 = 0`, `ov01 = 0`).
6. If energy is not full, continues the recharge timer.

#### Event 2001 — Inject Agent

Locked execution. If the Creator is not open (`ov00 = 0`), stops immediately.

Sound: `"sc_2"`. Refreshes PRAY resource cache (`pray refr`).

**Pre-checks:**
1. If the selected agent file no longer exists (`pray test ov88 = 0`): sends `"Agent file does not exist"` to the status bar (1 1 91) and stops.
2. Checks four conditions: not currently injecting (`ov01 = 0`), energy fully charged (`ov02 = 19`), Creator is open (`ov00 = 1`), and bioenergy bar position >= cost bar position (sufficient energy).

**Injection sequence** (all conditions met):
1. If no agent selected, gets the first AGNT resource.
2. Animates inject button (part 2) and energy gauge countdown (part 6: frames 19 down to 0).
3. Sets `ov01 = 1` (injecting), `ov02 = 0` (energy depleted).
4. Plays sound `"crea"`.
5. Reads `"Camera X"` and `"Camera Y"` from the agent's PRAY metadata. If both are non-zero:
   - Sets `ov03 = 1` (camera zoom active).
   - Creates a Teleport Effect (1 1 47) at the camera position.
   - Pans the Creator's camera to the injection location and zooms in.
6. Animates the status indicator (part 7) and injection beam (part 8).
7. Performs a two-phase injection using `pray injt`:
   - Phase 1: `pray injt ov88 0` (inject dependency/inline scripts).
   - Phase 2 (on success): `pray injt ov88 1` (inject agent creation scripts). Subtracts the agent's `"Agent Bioenergy Value"` from the global `"Bioenergy"` game variable.
8. **Error handling** — sends messages to the status bar (1 1 91):
   - Return `-1`: `"Script not found"` — animates part 7 with error pose.
   - Return `-2`: `"Injection failed"` — animates part 7 with failure pose.
   - Return `-3`: `"A required file was not found"` — animates part 7 with missing file pose.
9. Updates both bars (message 500), slows down.
10. Resets injection beam (part 8) and status indicator (part 7).
11. Returns camera to default position (4390, 1430). If zoom was active (`ov03 = 1`), reverses the zoom.

**Insufficient energy** (conditions not met):
1. Sends the current `"Energy"` reading to the status bar (1 1 91).
2. Animates the inject button with a refusal shake (part 2).
3. Resets injection state (`ov01 = 0`), restarts recharge timer (`tick 10`).
4. Fades feedback.

#### Event 2002 — Next Agent

Sound: `"sc_1"`. Only active when Creator is open (`ov00 = 1`).

1. If remove button is showing, hides it first.
2. Refreshes PRAY resource cache.
3. If current agent no longer exists, resets to first AGNT.
4. Advances to the next AGNT resource: `sets ov88 pray next "AGNT" ov88`.
5. Animates the next arrow (part 4) and inject button (part 2).
6. Triggers preview update (message 5000 to self).

#### Event 2003 — Previous Agent

Sound: `"sc_1"`. Only active when Creator is open (`ov00 = 1`).

1. Same setup as Event 2002 (hide remove button, refresh PRAY).
2. Navigates to the previous AGNT resource: `sets ov88 pray prev "AGNT" ov88`.
3. Animates the previous arrow (part 5) and inject button (part 2).
4. Triggers preview update (message 5000 to self).

#### Event 5000 — Preview Display Update

Instant execution. Sets up the Creator's camera to show a preview of the currently selected agent.

1. If no agent selected, gets the first AGNT resource. If none available, stops.
2. Sets camera zoom and kills any existing preview (3 3 66) and residual effects (99 99 99).
3. Sends the agent name to the status bar (1 1 91) for display.
4. Loads the agent's animation file from PRAY metadata (`"Agent Animation File"`). If loading fails, plays `"buzz"` error sound and stops.
5. Creates a temporary Agent Preview (3 3 66) using the agent's gallery sprite and animation string from PRAY metadata (`"Agent Animation Gallery"`, `"Agent Animation String"`).
6. Centers the preview in the Creator's camera viewport (around coordinate 4390, 1430).
7. Calculates and applies zoom level (`ov80`) to fit the preview within the camera view.

#### Event 9 — Timer (Energy Recharge)

Fires every 2 ticks while recharging.

1. Increments `ov02` by 1.
2. If `ov02` is between 0-19: updates the energy gauge display (part 6 pose = ov02).
3. When fully charged (`ov02 >= 20`): resets to 19, stops the timer (`tick 0`), and resets injection state (`ov01 = 0`).

#### Event 255 — Pickup

Immediately stops — the Creator Machine cannot be picked up.

#### Event 2011 — Remove Agent Button

Only active when Creator is open (`ov00 = 1`).

**Toggle on** (`ov77 = 0`):
1. Locks execution, animates the remove button opening (part 11: frames 0-3).
2. Sets `ov77 = 1` (remove mode active).

**Execute removal** (`ov77 = 1`):
1. Locks execution, reads the `"Remove script"` from the selected agent's PRAY metadata.
2. Executes the removal script via `caos` command.
3. Animates the remove button closing (part 11: frames 3-0).
4. Sets `ov77 = 0` (remove mode deactivated).

---

## Bioenergy Bar (3 3 22)

A simple, non-interactive agent that visually represents the current bioenergy level. It slides horizontally to indicate how much bioenergy is available relative to the maximum (1000).

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 0 | Not interactive |
| Sprite | `creator` frame 16, plane 11 | Bar indicator graphic |
| Position | (5620, 3670) | Base position (fully depleted) |
| `ov90` | 60 | Layout constant |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 500 | Message from Creator | Update bar position |

#### Event 500 — Update Position

Instant execution. Receives updates from the Creator machine.

1. Checks if Creator is open (via `avar` on the Creator's `ov00`).
2. If open: reads the status bar agent's (1 1 91) `ov02` to get a percentage factor. Calculates horizontal position as:
   - Base offset (5620) + (150/1000) * `game "Bioenergy"` * percentage factor.
   - Clamps bioenergy to a maximum of 1000.
3. If closed: returns to base position (5620, 3670).

---

## Agent Cost Bar (3 3 23)

A simple, non-interactive agent that visually represents the bioenergy cost of the currently selected agent. It slides horizontally proportional to the cost value.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 0 | Not interactive |
| Sprite | `creator` frame 18, plane 11 | Cost indicator graphic |
| Position | (5620, 3690) | Base position (zero cost) |
| `ov90` | 60 | Layout constant |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 500 | Message from Creator | Update bar position with cost value |

#### Event 500 — Update Position

Receives the agent's bioenergy cost as `_p1_` (message parameter 1).

1. Calculates horizontal position: base offset (5620) + (150/1000) * cost value.
2. Clamps position within the valid range: minimum 5620, maximum 5775.

---

## Agent Preview (3 3 66)

A temporary simple agent created dynamically by the Creator (in event 5000) to display a visual preview of the currently selected agent in the Creator's camera viewport. It is destroyed and recreated each time the user navigates to a different agent.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 7 | Mouseable + Carryable + Activatable (standard interactive) |
| Sprite | *(from PRAY metadata)* | Uses the selected agent's `"Agent Animation Gallery"` and `"Agent Animation String"` |
| Plane | 13 | Displayed within Creator camera |

### Lifecycle

- **Created** by event 5000 when navigating agents.
- **Killed** when the Creator is closed (event 2000), when a new agent is selected (event 5000), or when injection begins (event 2001).

---

## Teleport Effect (1 1 47)

A short-lived visual effect agent created during agent injection when the selected agent specifies camera coordinates in its PRAY metadata. It displays a teleportation animation at the injection target location.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 0 | Not interactive |
| Sprite | `teleport` frames 0-8, plane 9000 | Teleport flash animation |
| `tick` | 10 | Self-destructs after 10 ticks |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Self-destruction |

#### Event 9 — Timer

Kills itself (`kill targ`). The teleport effect is a one-shot visual with no further behavior.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the entire Creator system:

1. Kills all Creator Machine instances (`enum 3 3 21 → kill targ`).
2. Removes Creator scripts: events 1, 2, 9, 1000, 2000, 2001, 2002, 2003, 5000.
3. Kills all Bioenergy Bars (`enum 3 3 22 → kill targ`).
4. Kills all Agent Cost Bars (`enum 3 3 23 → kill targ`).
5. Kills all Agent Previews (`enum 3 3 66 → kill targ`).
6. Kills all Teleport Effects (`enum 1 1 47 → kill targ`).
7. Resets the global `"Bioenergy"` game variable to 50.

---

## Game Variables

| Variable | Initial Value | Capped At | Purpose |
|---|---|---|---|
| `game "Bioenergy"` | +200 (additive at install) | 1000 | Global bioenergy pool for agent injection; agents cost bioenergy to inject |

## External Agent Communication

The Creator sends status messages to the **status bar agent (1 1 91)** via message 1001. This provides user-facing feedback such as the selected agent name, error messages ("Agent file does not exist", "Script not found", "Injection failed", "A required file was not found"), and energy readings.

## PRAY Metadata Used

The Creator reads the following fields from AGNT PRAY resources:

| PRAY Field | Type | Purpose |
|---|---|---|
| `"Agent Bioenergy Value"` | Integer | Bioenergy cost to inject the agent |
| `"Camera X"` | Integer | X coordinate for post-injection camera pan (0 = no pan) |
| `"Camera Y"` | Integer | Y coordinate for post-injection camera pan (0 = no pan) |
| `"Agent Animation Gallery"` | String | Sprite gallery name for preview display |
| `"Agent Animation String"` | String | Animation string for preview display |
| `"Agent Animation File"` | String | Sprite file to load for preview |
| `"Remove script"` | String | CAOS script to execute when removing the agent |
