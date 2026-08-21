# DS blueprint agent scripts.cos - Blueprint Agent Behaviour & UI

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS blueprint agent scripts.cos`

## Overview

This script defines the behaviour of the **Blueprint** agent (`1 1 100`) and creates its companion **blueprint UI box** (`1 2 33`). Together with [DS agent help](DS%20agent%20help.md) (which creates the Blueprint pick-up) and [DS Blueprint Agent Export As Pray File](DS%20Blueprint%20Agent%20Export%20As%20Pray%20File.md) (which performs the PRAY export), these form the agent-blueprinting feature: the player captures a wired-up agent as a portable "blueprint" object, names it, and exports it as a `.blueprint` PRAY file.

When a Blueprint pick-up is activated it opens a UI box showing the captured wiring description and a field for the blueprint's name; committing a valid name triggers the export (message 809) on the Blueprint agent.

## Created / Modified Agents

| Classifier | Name | Type | Description | Details |
|---|---|---|---|---|
| 1 1 100 | Blueprint | Modification | Adds the open-UI (1), capture-connections (1000) and debug (2000) scripts | [Details](#agent-1-1-100-blueprint) |
| 1 2 33 | Blueprint UI Box | Creation | `useful_screen` panel for naming/previewing and exporting the blueprint | [Details](#agent-1-2-33-blueprint-ui-box) |

---

## Agent 1 1 100: Blueprint

(Created by [DS agent help](DS%20agent%20help.md); its export handler — event 809 — is added by [DS Blueprint Agent Export As Pray File](DS%20Blueprint%20Agent%20Export%20As%20Pray%20File.md).)

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Open the blueprint UI box |
| Custom | 1000 | Capture the source agent's connections into object variables |
| Custom | 2000 | Debug stub (iterates 0→30; no functional effect) |

#### Event 1 — Open UI

Closes any existing UI box (`1 2 33`), then creates a new one (`new: comp 1 2 33 "useful_screen" …`, `attr 304`) with: the wiring description text (from `ov99`), a name field/label (an editable text part bound to message 808 when `ov98` is empty, or a fixed label showing the existing name otherwise), close/page buttons, and a page counter. The box is centred on screen and stores the Blueprint agent reference in its `ov99`, then triggers the page counter (message 1003).

#### Event 1000 — Capture connections

Runs `inst`/`lock`. Enumerates the connected ports of the clicked source agent (`econ _p1_` + `prt:` queries) and, for each wired connection, appends a human-readable line — *"Connect output of `<agent>` to input of `<agent>`."* (from the `Blueprint` and `Agent Help` catalogues) — into `va77`. It also records the family/genus/species of each connected agent into the Blueprint agent's object variables (`va50` index, up to slot 95) so the exported COS can recreate the wiring. The assembled description is stored in `ov99`.

---

## Agent 1 2 33: Blueprint UI Box

A compound `useful_screen` panel created by event 1 above.

### Compound Parts

| Part | Type | Purpose |
|---|---|---|
| 1 | Fixed text | Wiring description (paginated) |
| 2 | Button → 1000 | Close |
| 3 | Fixed text | "Blueprint" title (killed once a name exists) |
| 5 | Text field → 808 / label | Blueprint name input (or fixed label if already named) |
| 4 | Button → 1001 | Page down |
| 7 | Button → 1002 | Page up |
| 6 | Fixed text | Page counter |

### Events

| Event | Number | Description |
|---|---|---|
| Custom | 808 | Name committed — validate, then trigger export (809) on the Blueprint |
| Custom | 1000 | Close the UI box |
| Custom | 1001 / 1002 | Next / previous page |
| Custom | 1003 | Update page counter and page-button states |

#### Event 808 — Name committed

Reads the entered name (part 5) and rejects illegal filename characters (`< > / \ : * | ?` and quote), showing the `Blueprint` catalogue error text on failure. If the name is empty or already exists (`pray test`), it stops. Otherwise it restores default focus, writes the name into the Blueprint agent's `ov98` (`sets avar ov99 98 va00`), and sends the Blueprint **message 809** — handed off to the export script, which writes the `.blueprint` PRAY file. The UI text is then updated with the "saved" status (`Blueprint` catalogue 3).

#### Event 1000 — Close

Animates the close button, restores default focus, clears the agent-help watcher's reference (`1 2 4` `ov00`), waits, and kills itself.

---

## Removal Script

```
rscr
enum 1 1 100
    kill targ
next
```

Kills all Blueprint pick-ups. (The UI box `1 2 33` is killed when closed.)

## Impact on Stimulus / Room CA

None. This is a UI/serialisation feature — it inspects an agent's wiring, shows a panel and triggers a PRAY export. It emits no stimuli and does not affect Room CA.
