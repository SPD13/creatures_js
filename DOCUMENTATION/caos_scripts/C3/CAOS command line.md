# CAOS command line.cos - In-Game CAOS Command Line Console

**Source**: `Assets/Bootstrap/001 World/CAOS command line.cos`

## Overview

This script creates the in-game CAOS command line console — a developer/power-user tool that allows typing and executing arbitrary CAOS commands directly within the running game world. It is toggled open and closed via the **Shift+Ctrl+C** keyboard shortcut. When opened, a full-screen text overlay appears at the top-left corner showing a warning header, a scrolling output history, and an editable input line. The user can type CAOS commands, press Enter to execute them, and see the results displayed in the console. Pressing Shift+Ctrl+C again closes the console and returns input focus to the game.

The console is a purely developmental/debug utility — it has no gameplay effect on creatures, agents, or the ecosystem, but provides unrestricted access to the CAOS virtual machine for testing, debugging, and world manipulation.

**Catalogue Description**: *"CAOS command line — Enter off the cuff CAOS commands"*

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 203 | CAOS Command Line | `blnk` (blank) | Invisible compound agent that captures keyboard input and provides a text-based CAOS execution console | [Detail](#caos-command-line-1-2-203) |

---

## CAOS Command Line (1 2 203)

The CAOS command line is an invisible compound agent that listens for keyboard events globally. It has no visual presence in the game world until activated. When the user presses **Shift+Ctrl+C**, it constructs a full-screen text overlay with two compound parts: a read-only scrolling output area (part 1) and an editable text input field (part 2). CAOS commands typed into the input field are executed via the `caos` command, and results are appended to the output history. The console handles automatic scrolling to keep the latest output visible.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 288 | Camera-shy (256) + Floatable (32) — not rendered by camera, floats with viewport |
| `imsk` | 65 | Input mask: receives Raw Key Down (1) + Translated Char (64) events |
| `plne` | 10000 | Very high plane — renders on top of everything when visible |
| `ov00` | 0 | Console state: 0 = closed, 1 = open |
| `ov01` | "" | Accumulated output text (scrolling history) |
| `ov02` | "" | Last executed command (for repeat-on-empty-Enter) |

### Compound Parts (Created On Open)

| Part | Type | Gallery | Font | Purpose |
|---|---|---|---|---|
| 1 | Fixed Text (`pat: fixd`) | `caos` | `whiteontransparentchars` | Read-only output/history display, fills the entire window |
| 2 | Editable Text (`pat: text`) | `caos` | `whiteontransparentchars` | Single-line input field for typing CAOS commands |

### Catalogue Entries ("CAOS command line")

| Index | Content | Purpose |
|---|---|---|
| 0 | `"CAOS Command Line\nWarning! You can damage your world with this utility.\nPress Shift+Ctrl+C to close it now."` | Header/warning text displayed when console opens |
| 1 | `"\n> "` | Command prompt string appended after each result |
| 2 | `"OK"` | Default result text shown when a command produces empty output |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 73 | Raw Key Down | Handles Shift+Ctrl+C to toggle the console open/closed |
| 79 | Raw Translated Char | Updates the output display with current input text as the user types |
| 123 | Window Resized | Reformats the text display to fit the new window dimensions |
| 1000 | Custom (Execute Command) | Executes the typed CAOS command and displays the result |
| 1001 | Custom (Scroll Management) | Trims the output history to prevent overflow beyond the visible area |

#### Event 73 — Raw Key Down (Toggle Console)

Triggered on every key press. The handler checks three conditions:

1. **Key is 'C'** (`_p1_ = 'C'`)
2. **Ctrl is held** (`keyd 17 = 1`)
3. **Shift is held** (`keyd 16 = 1`)

If all three conditions are met:

**Opening the console** (when `ov00 = 0`):
1. Creates **part 1** (fixed text) using the `caos` gallery and `whiteontransparentchars` font for the output display area.
2. Creates **part 2** (editable text) using the same font for the input field.
3. Floats the agent to position (0, 0) — top-left corner of the screen.
4. Formats part 1 to fill the entire window dimensions (`2000 - wndw` × `2000 - wndh`).
5. Populates the output area with empty lines (to push content to the bottom) followed by the warning header text (catalogue entry 0) and a command prompt (catalogue entry 1).
6. Formats part 2 with an offset of 16 pixels for input indentation.
7. Sets keyboard focus to part 2 (`fcus`).
8. Sets `ov00 = 1` (console is now open).
9. Sends message 1001 to self to initialize scroll management.

**Closing the console** (when `ov00 != 0`):
1. Destroys parts 1 and 2 (`pat: kill`).
2. Floats the agent off-screen to (-10000, -10000).
3. Restores keyboard focus to the default game focus agent (`game "c3_default_focus"`).
4. Sets `ov00 = 0` (console is now closed).

#### Event 79 — Raw Translated Char (Live Input Preview)

While the console is open (`ov00 = 1`), this event fires as the user types characters. It reads the current text from part 2 (the input field) and appends it to the accumulated output history in part 1, providing a live preview of what the user is typing in the context of the full output.

#### Event 123 — Window Resized

When the game window is resized while the console is open (`ov00 = 1`), this handler reformats part 1 to match the new window dimensions and sends message 1001 to refresh the scroll state.

#### Event 1000 — Execute Command

This is the core command execution handler, triggered when the user submits input (presses Enter):

1. **Captures input**: Reads text from part 2 (input field) into `va00`, then clears part 2.
2. **Updates history**: Appends the typed command to the output text (`ov01`).
3. **Command repeat**: If the input is empty, reuses the last command stored in `ov02`. Otherwise, saves the current command as `ov02` for future repeats.
4. **Executes CAOS**: Runs the command via `caos 0 0 0 0 va00 0 1 va99`, which executes the CAOS string and stores the result. The error code is captured in `va99`.
5. **Result handling**:
   - If result is `"***"` (error marker): Reads the error description from the `"caos"` catalogue using the error code (`va99`).
   - If result is `"###"` (numeric result marker): Converts the numeric error code to a string.
   - If result is empty: Displays the default "OK" text (catalogue entry 2).
6. **Displays result**: Appends the result and a new prompt to the output history.
7. **Triggers scroll**: Sends message 1001 with `_p1_ = 1` to scroll with a visual delay.

#### Event 1001 — Scroll Management

Maintains the output display within visible bounds. This handler runs with `inst` + `lock` to prevent interruption:

1. Checks if the text in part 1 exceeds one page (`npgs > 1`).
2. If overflowing, enters a loop that removes lines from the top of `ov01`:
   - Scans for the first newline character (ASCII 10) in the output string.
   - Truncates everything before and including that newline.
   - Updates the display with the trimmed text.
   - If `_p1_ > 0` (called from command execution), inserts a `slow` + `wait 1` delay between iterations for a visual scrolling effect.
3. Repeats until the text fits within one page.

---

## Removal Script (rscr)

The removal script cleanly uninstalls the CAOS command line:

1. Kills all existing 1 2 203 agents (`enum 1 2 203 → kill targ`).
2. Removes event scripts: Raw Key Down (73), Raw Translated Char (79), and Execute Command (1000) for classifier 1 2 203.

Note: Scripts 123 (Window Resized) and 1001 (Scroll Management) are not explicitly removed by the removal script.

---

## Keyboard Shortcut Summary

| Shortcut | Action |
|---|---|
| **Shift+Ctrl+C** | Toggle console open/closed |
| **Enter** | Execute typed CAOS command |
| **Enter** (empty input) | Re-execute the last command |
