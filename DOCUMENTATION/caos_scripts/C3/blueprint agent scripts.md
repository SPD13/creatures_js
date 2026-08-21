# blueprint agent scripts.cos — Blueprint Save Dialog & Pick-up Setup

**Source**: `Assets/Bootstrap/001 World/blueprint agent scripts.cos`

## Overview

This script wires up the runtime UI and connection-scanning behaviour for the **Blueprint Pick-up** agent (classifier `1 1 100`, created in `agent help.cos`). When the player exports an agent as a "blueprint" from the Agent Help panel, a Blueprint Pick-up is spawned holding a snapshot of that agent's properties. This script provides three things:

1. **A Save Dialog compound (`1 2 33`, `new_agent_help`)** — created on-the-fly by the Blueprint Pick-up's init script (`1 1 100` event 1). It is a centred floating panel with a filename input field, a "Blueprint" label, page navigation buttons, and an OK/cancel mechanism. When the user types a valid filename and confirms, the dialog dispatches event `809` to the Blueprint Pick-up, which is handled by `Blueprint Agent Export As Pray File.cos` to actually serialize and save the `.blueprint` PRAY file.

2. **A connection-scanning routine (`1 1 100` event 1000)** — walks the parts and incoming connections of a source agent (passed via `_p1_`), pulls each connected agent's category text out of the `"Agent Help"` catalogue to build a human-readable summary, and records up to ~32 (family, genus, species, slot) tuples into the Blueprint Pick-up's object variables (`ov50` onward). This is the data the export script later writes into the generated `.cos` install script so that the saved blueprint can recreate its connections at re-install time.

3. **A placeholder loop script (`1 1 100` event 2000)** — an empty `loop … untl` that increments a local variable to 30 and exits. It performs no useful work and looks like leftover scaffolding.

The script also installs the dialog's button handlers (close, next page, previous page) and a page-indicator updater. It uses the `"Blueprint"` catalogue for all UI strings (label text, default filename suffix, separator characters in the connection summary).

A removal block (`rscr`) kills every existing `1 1 100` agent so that re-running the bootstrap leaves no orphaned Blueprint Pick-ups.

**Catalogue Entries Used**: `"Blueprint"` (UI labels and connection-summary punctuation), `"Agent Help <family> <genus> <species>"` (per-agent name strings, looked up via `wild fmly gnus spcs "Agent Help" 0` while iterating connections).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 33 | Blueprint Save Dialog | `new_agent_help` | Floating compound panel that lets the user name and save a Blueprint Pick-up as a `.blueprint` PRAY file | [Detail](#blueprint-save-dialog-1-2-33) |

The script also attaches additional scripts (init, message 1000, message 2000) to the **Blueprint Pick-up (`1 1 100`)** which is created elsewhere (`agent help.cos`). Those scripts are documented in the [Blueprint Pick-up Additional Scripts](#blueprint-pick-up-additional-scripts-1-1-100) section below.

---

## Blueprint Save Dialog (1 2 33)

A modal-style floating panel created by the Blueprint Pick-up's init script. It is built as a compound agent with the `new_agent_help` sprite gallery and the following parts:

- **Part 1** — fixed text part: title bar showing the source agent's name (passed via `va66 ← ov99` of the Blueprint Pick-up).
- **Part 2** — close button.
- **Part 3** — fixed text: the literal "Blueprint" label (catalogue entry 0).
- **Part 4** — next page button.
- **Part 5** — filename input field. Initially an editable `text` part if `va67 = ""` (no previous filename), or a fixed `fixd` part displaying the previously chosen name otherwise.
- **Part 6** — page indicator text ("X/Y").
- **Part 7** — previous page button.

On creation the dialog is centred on screen using `wndw/wndh` minus `wdth/hght` divided by 2, given attribute `304` (floatable + suffer collisions + suffer physics off, etc.), and the input part is given keyboard focus via `fcus`.

| Event | Number | Description |
|---|---|---|
| Message | 808 | Text input committed — validate filename and trigger export |
| Message | 1000 | Close button pressed |
| Message | 1001 | Next page button pressed |
| Message | 1002 | Previous page button pressed |
| Message | 1003 | Refresh page indicator and arrow button states |

### Event 808 — Filename Committed

Reads the new text from part 5 (`ptxt`) and walks the string character by character. If any of the disallowed filesystem characters (`< > / \ : * | ?` or `"`) appears, it appends catalogue entry 6 (an error suffix) to the title bar text and aborts via `stop` — the input is rejected.

If the name is empty or `pray test va00 <> 0` (a file with that name already exists in PRAY), the script also returns silently without proceeding.

Otherwise the script:
1. Refocuses the global default focus part (`game "c3_default_focus"` / `game "c3_default_focus_part"`) so the input loses keyboard focus cleanly.
2. Stores the filename into `avar ov99 98` of the Blueprint Pick-up — i.e. into the source agent's variable slot 98, which is where the export script (`Blueprint Agent Export As Pray File.cos`, event 809) will later read it from.
3. Sends event `809` to the Blueprint Pick-up via `mesg writ ov99 809`, kicking off the actual PRAY export.
4. Updates the dialog's filename label (part 5) to show the saved filename plus catalogue entry 3 (a confirmation suffix).

No stimulus or Room CA impact.

### Event 1000 — Close Button

Animates part 2 (the close button) with frames `[0 1]`, returns keyboard focus to the global default focus part, then performs `rtar 1 2 4` (retargets to a sibling agent of class 1 2 4 — the Agent Help Controller), nulls out its `ov00`, waits 10 ticks, and finally `kill ownr` to destroy the dialog itself. This severs the Agent Help Controller's reference to the dialog before tearing it down.

No stimulus or Room CA impact.

### Event 1001 — Next Page

Reads `page` and `npgs` of part 1, increments the page number, and if the new value is still less than `npgs`:
- Animates the next-page button (part 4) with `[2 2 2]` then `over` waits for the animation to finish.
- Switches part 1 to the new page via `page va99`.

Then sends message `1003` to itself to refresh the page indicator and arrow button states.

No stimulus or Room CA impact.

### Event 1002 — Previous Page

Mirror of event 1001: if the current page is greater than 0, animates the prev-page button (part 7), decrements the page number on part 1, and sends message `1003` to itself.

No stimulus or Room CA impact.

### Event 1003 — Refresh Page Indicator

Builds a string of the form `"<current+1>/<total>"` from the current `page` and `npgs` of part 1 and writes it to part 6 (`ptxt va08`). It then conditionally animates parts 7 and 4 to show enabled/disabled states for the previous and next page buttons:

- Part 7 (prev): frame `[0]` if on page 1, else `[1]`.
- Part 4 (next): frame `[0]` if on the last page, else `[1]`.

This is called both on dialog creation (end of init script) and after every page navigation. No stimulus or Room CA impact.

---

## Blueprint Pick-up Additional Scripts (1 1 100)

These three scripts are attached by this file to the Blueprint Pick-up agent class. The Blueprint Pick-up itself is created in `agent help.cos` and serialised by `Blueprint Agent Export As Pray File.cos`; this section only documents the events added here.

| Event | Number | Description |
|---|---|---|
| Init | 1 | Spawn the Blueprint Save Dialog when a Blueprint Pick-up is created |
| Message | 1000 | Scan a source agent's connections and store them into object variables |
| Message | 2000 | Placeholder/empty loop |

### Event 1 — Init

Stashes `ov99` (source agent name) into `va66` and `ov98` (last-used filename) into `va67`, then kills any pre-existing `1 2 33` agents (`enum 1 2 33 / kill targ / next`) so only one Blueprint dialog can ever exist at a time.

It then creates the new compound dialog (see [Blueprint Save Dialog](#blueprint-save-dialog-1-2-33) above), assembles its parts, sets `seta ov99 ownr` on the dialog so the dialog knows which Blueprint Pick-up spawned it, computes a centred screen position from `wndw/wndh/wdth/hght`, calls `flto` to float the dialog there, and finally sends itself message `1003` to refresh the page indicator.

No stimulus or Room CA impact.

### Event 1000 — Scan Source Agent Connections

This is the routine that builds the Blueprint Pick-up's recorded snapshot of its source agent. It is called from `agent help.cos` after the user clicks the Blueprint button on the Agent Help panel.

`_p1_` is expected to be the source agent. The script does the following:

1. `econ va88 …` — enters an `econ` loop over every agent connected (in either direction) to the source.
2. For each connected agent, iterates its parts via `reps prt: itot`.
3. For each part, queries `prt: from N` to find an incoming connection. If one exists, calls `prt: frma N` to retrieve the connecting partner agent and stores it into `va02`.
4. If a partner was found, looks up its category name with `wild fmly gnus spcs "Agent Help" 0` and concatenates a description sentence using catalogue entries 1 and 2 from `"Blueprint"` (which provide opening/closing punctuation). The completed sentence is appended to `va77` along with `".\n"` to build a multi-line summary.
5. Records the partner agent's `fmly`, `gnus`, `spcs`, and `ov61` (a per-agent slot identifier) into the Blueprint Pick-up's object variables starting at `ov50`, four slots per recorded connection. `va50` (the write cursor) advances by 4 each time. The loop bails out once `va50 >= 95` so at most ~11 connections (44 slots) are stored — the cursor must remain within `ov50..ov97`.
6. After the `econ` finishes, copies the assembled summary string `va77` into `ov99` so the dialog (and the export script) can later display and serialize it.

This data is what makes a saved blueprint reinstall its connections: when the export script writes the `.cos` install file, it walks `ov50..ov97` and emits `conn` commands accordingly.

No stimulus or Room CA impact.

### Event 2000 — Placeholder Loop

Empty `loop / addv va00 1 / untl va00 = 30 / endm`. Does nothing observable. Likely leftover scaffolding from development; no callers exist in the bootstrap scripts.

No stimulus or Room CA impact.

---

## Removal Script

```
rscr
enum 1 1 100
    kill targ
next
```

When the bootstrap is re-run, every existing Blueprint Pick-up (`1 1 100`) is destroyed so that this script and `agent help.cos` can re-create them cleanly. Note that this also kills any in-progress Blueprint dialogs indirectly — when the source pick-up is destroyed, no agent will be left holding a reference to the `1 2 33` dialog.
