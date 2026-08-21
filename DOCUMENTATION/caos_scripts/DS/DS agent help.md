# DS agent help.cos — In-Game Agent Help System

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS agent help.cos`

## Overview

This script implements Docking Station's in-game **agent help** system — an interactive inspector toggled with **F1** (key 112). When active, the pointer becomes a help cursor and clicking agents reveals information:

- **Left-click** an agent → it "shouts" its category name as a speech bubble (via the bubble factory `1 2 10`).
- **Right-click** a non-creature agent → opens a paginated help panel (`1 2 5`) with the agent's title and description from the `"Agent Help"` catalogue.
- **Right-click** a creature (family 4) → opens the Creature History panel (`1 2 23`) instead.

The help panel also has a **Blueprint export** button that spawns a portable blueprint pick-up (`1 1 100`) of the inspected agent. It is the Docking Station counterpart of the Creatures 3 [agent help](../C3/agent%20help.md); the logic is the same, with these DS specifics: the help panel uses the `useful_screen` gallery, the creature-history panel uses `ds_creature_history`, and there is a **warp-portal** special-case (`fmly 3 gnus 9 spcs 1`) that prefixes the help text with the portal's identity (`"portal misc"` / `"portals"` catalogue, plus the portal name in `ov01`).

## Created Agents

| Classifier | Name | Sprite | Description | Details |
|---|---|---|---|---|
| 1 2 4 | Agent Help Watcher | `blnk` | Invisible controller managing help mode and dispatching help requests | [Details](#agent-help-watcher-1-2-4) |
| 1 2 5 | Agent Help Panel | `useful_screen` | Paginated help window (title, description, page nav, blueprint button) | [Details](#agent-help-panel-1-2-5) |
| 1 2 23 | Creature History Panel | `ds_creature_history` | Creature detail/history panel (created on right-clicking a creature) | [Details](#creature-history-panel-1-2-23) |
| 1 1 100 | Blueprint Pick-up | `pick-ups` | Physical blueprint object spawned by the export button (export handler added by [DS Blueprint Agent Export As Pray File](DS%20Blueprint%20Agent%20Export%20As%20Pray%20File.md)) | [Details](#blueprint-pick-up-1-1-100) |

---

## Agent Help Watcher (1 2 4)

`new: simp 1 2 4 "blnk" 0 1 0`, `attr 272` (camera-shy 256 + invisible 16), `imsk 1`, `pure 0`, `ov00 = null` (open panel reference), `ov01 = 0`.

### Events

| Event | Number | Description |
|---|---|---|
| Raw Key Down | 73 | F1 toggles help mode on/off |
| Raw Mouse Down | 76 | Forwards a click to the dispatch handler |
| Custom | 1000 | Identify the clicked agent and show appropriate help |

#### Event 73 — Toggle help mode (F1)

Only on `_p1_ = 112`. If the pointer is holding something (`held ne null`) → `buzz` and stop. **Off** (`pure = 1`): reset pointer pose 0, reset the icons GUI (`1 2 14`), `pure 0`, `imsk 1`, and kill any open panel (`ov00`). **On** (`pure = 0`): release any held creature (`nohh`), set pointer pose 18 (help cursor), light the icons GUI, `pure 1`, `imsk 9` (key + mouse).

#### Event 76 — Forward click

`mesg wrt+ ownr 1000 _p1_ hots 0` — sends button (`_p1_`) and the agent under the pointer (`hots`) to event 1000.

#### Event 1000 — Help dispatch

Acts only if the clicked agent (`_p2_`) is non-null.

**Left-click (`_p1_ = 1`):** reads the agent's category (`cata`/`catx`). Special cases: clicking the icons GUI (`1 2 14`) re-presses F1 to exit; clicking the help panel (`1 2 5`) notifies the pointer (message 2006). Otherwise (category ≠ -1) it messages the bubble factory (`1 2 10`, message 126) and orders the agent to `shou` its category text.

**Right-click (`_p1_ = 2`):** for a **creature** (`fmly = 4`) it creates the Creature History panel (`1 2 23`), messages it (1000), exits help mode, and stops. For a **non-creature**, if no panel is open it builds the help panel (`1 2 5`) centred on screen and stores the inspected agent in the panel's `ov02`. It then loads the title (`wild fmly gnus spcs "Agent Help" 0`) and description (`… 1`), substituting the `"Agent Help Something"` fallback (+ classifier) when no help exists, plus the portal prefix when applicable, writes them to the panel, and triggers the page counter (message 1003).

---

## Agent Help Panel (1 2 5)

`new: comp 1 2 5 "useful_screen" 1 0 9050`, `attr 304` (camera-shy + floatable + invisible). `ov02` = inspected agent.

### Compound Parts

| Part | Type | Purpose |
|---|---|---|
| 1 | Fixed text | Paginated description |
| 2 | Button → 1000 | Close |
| 3 | Fixed text | Title (agent name) |
| 4 | Button → 1001 | Page down |
| 5 | Button → 1002 | Page up |
| 6 | Fixed text | Page counter ("n/total") |
| 7 | Button → 2000 | Blueprint export |

### Events

| Event | Number | Description |
|---|---|---|
| Custom | 1000 | Close & destroy the panel (clears watcher `ov00`) |
| Custom | 1001 | Next page (if not last) |
| Custom | 1002 | Previous page (if not first) |
| Custom | 1003 | Update the page counter and enable/disable the page buttons |
| Custom | 2000 | Blueprint export — create a `1 1 100` pick-up |

#### Event 2000 — Blueprint export

Runs `inst`/`lock`. Counts the inspected agent's connections (`econ`/`next`) and checks whether a blueprint was already made (help text ending in `"-"`). If the agent has more than one connection, isn't already exported, and exists, it creates a Blueprint pick-up (`new: simp 1 1 100 "pick-ups" 0 0 5000`, `attr 199`, `perm 60`, `elas 10`, `fric 90`, `accg 2`) at the agent's position (validated with `tmvt`, nudged up 20px or killed if blocked) and messages it (1000) with the source agent. It then appends the "Blueprint created" / "Blueprint not available" status (Blueprint catalogue 4/5) to the help text.

---

## Creature History Panel (1 2 23)

Created with `new: comp 1 2 23 "ds_creature_history" 32 0 8520` when a creature is right-clicked, then messaged (1000 with the creature reference and 1001). Its detailed behaviour lives in the creature-history scripts; this script only creates and (on removal) cleans it up.

## Blueprint Pick-up (1 1 100)

A carryable physical object (`pick-ups` sprite, `attr 199`, full physics) spawned by the help panel's export button at the inspected agent's position, on plane 5000. `ov98` (blueprint data) starts empty, `ov61 = 1`. Its export-to-PRAY handler (event 809) is installed by [DS Blueprint Agent Export As Pray File](DS%20Blueprint%20Agent%20Export%20As%20Pray%20File.md).

## Removal Script

```
rscr
enum 1 2 4
    kill targ
next
enum 1 2 5
    kill targ
next
enum 1 2 23
    kill targ
next
scrx 1 2 4 76
scrx 1 2 5 1000
```

Kills the watcher, help panel and creature-history panel and removes the mouse-down (1 2 4 / 76) and close (1 2 5 / 1000) scripts (other event scripts are left registered).

## Impact on Stimulus / Room CA

None. This is an inspection/UI system; it shows text, spawns a help panel and an optional blueprint pick-up, and orders agents to `shou` their names. It emits no stimuli and does not affect Room CA.
