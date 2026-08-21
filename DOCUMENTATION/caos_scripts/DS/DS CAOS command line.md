# DS CAOS command line.cos - In-Game CAOS Command Line Console

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS CAOS command line.cos`

## Overview

This script creates Docking Station's in-game **CAOS command line** console — a developer/power-user tool for typing and executing arbitrary CAOS directly in the running world. It is toggled with **Shift+Ctrl+C**. When open, a full-screen text overlay shows a warning header, a scrolling output history, and an editable input line; pressing Enter executes the typed command and appends the result. It behaves identically to the Creatures 3 [CAOS command line](../C3/CAOS%20command%20line.md).

It is a pure development/debug utility — no gameplay effect on creatures, agents or the ecosystem — but provides unrestricted access to the CAOS VM.

## Created Agents

| Classifier | Name | Sprite | Description | Details |
|---|---|---|---|---|
| 1 2 203 | CAOS Command Line | `blnk` | Invisible compound agent capturing keyboard input and providing a text-based CAOS console | [Details](#agent-1-2-203-caos-command-line) |

---

## Agent 1 2 203: CAOS Command Line

An invisible compound agent created with `new: comp 1 2 203 "blnk" 1 0 9000`, floated off-screen until activated.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 288 | Camera-shy (256) + Floatable (32) — not camera-rendered, floats with the viewport |
| `imsk` | 65 | Input mask: Raw Key Down (1) + Translated Char (64) |
| `plne` | 10000 | Renders on top of everything when visible |
| `ov00` | 0 | Console state: 0 = closed, 1 = open |
| `ov01` | "" | Accumulated scrolling output text |
| `ov02` | "" | Last executed command (repeat-on-empty-Enter) |

### Compound Parts (created on open)

| Part | Type | Gallery | Purpose |
|---|---|---|---|
| 1 | Fixed text (`pat: fixd`) | `caos` | Read-only output/history display, fills the window |
| 2 | Editable text (`pat: text`) | `caos` | Single-line CAOS input field |

### Catalogue ("CAOS command line")

| Index | Purpose |
|---|---|
| 0 | Header/warning text shown when the console opens |
| 1 | Command-prompt string appended after each result |
| 2 | Default result text ("OK") when a command returns nothing |

### Events

| Event | Number | Description |
|---|---|---|
| Raw Key Down | 73 | Shift+Ctrl+C toggles the console open/closed |
| Raw Translated Char | 79 | Live-previews typed input in the output area |
| Window Resized | 123 | Reformats the display to the new window size |
| Custom | 1000 | Executes the typed CAOS command and displays the result |
| Custom | 1001 | Trims the output history so it fits one page (scroll management) |

#### Event 73 — Toggle (Shift+Ctrl+C)

Fires on each key press; acts only when `_p1_ = 'C'` with Ctrl (`keyd 17`) and Shift (`keyd 16`) held. **Opening** (`ov00 = 0`): builds parts 1 and 2, floats to (0,0), formats part 1 to fill the window, seeds the output with blank lines + the warning header (catalogue 0) + prompt (catalogue 1), focuses the input (`fcus`), sets `ov00 = 1` and kicks message 1001. **Closing** (`ov00 ≠ 0`): kills the parts, floats off-screen, and restores focus to the default focus agent/part (`game "c3_default_focus"` / `game "c3_default_focus_part"`), setting `ov00 = 0`.

#### Event 1000 — Execute command

Reads the input (part 2) into `va00` and clears it; appends it to the history; if empty, re-uses the last command (`ov02`), otherwise stores it. Executes via `caos 0 0 0 0 va00 0 1 va99` and interprets the return: `"***"` → look up the error text in the `caos` catalogue by code `va99`; `"###"` → the numeric code as a string; empty → the default "OK" (catalogue 2). The result and a fresh prompt are appended, then message 1001 (`_p1_ = 1`) scrolls with a brief delay.

#### Events 79 / 123 / 1001

79 mirrors the in-progress input into the output area while open; 123 reflows part 1 on a window resize; 1001 trims `ov01` from the top (scanning for newlines) until the text fits one page, with an optional `slow`/`wait` visual delay when called from command execution.

### Removal Script

```
rscr
enum 1 2 203
    kill targ
next
scrx 1 2 203 73
scrx 1 2 203 79
scrx 1 2 203 1000
```

Kills all console instances and removes the toggle (73), char-input (79) and execute (1000) scripts. (123 and 1001 are not explicitly removed.)

## Impact on Stimulus / Room CA

None. The console is a developer UI; it emits no stimuli and does not touch Room CA. (Commands typed into it can of course do anything CAOS allows.)
