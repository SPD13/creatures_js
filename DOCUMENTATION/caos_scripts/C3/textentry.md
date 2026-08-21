# textentry.cos - Text Entry / Agent Help Input Field

**Source**: `Assets/Bootstrap/001 World/textentry.cos`

## Overview

This script creates the in-game **text entry input field** (the "agent_help" composite agent) used by the player to type free-form text into the world. Typed text is forwarded to the **speech bubble factory** (1 2 10) so a speech bubble appears, and is also issued as a `shou` (shout) order to the creature currently pointed at — letting the player effectively "speak" sentences to a creature for vocabulary teaching and command issuing.

The agent is created off-screen (`flto -100000 -100000`) and floats relative to the pointer when text is being entered. It maintains a 90-slot rolling history (`ov10`–`ov99`) of the last entries that the player can browse with **Ctrl+Up / Ctrl+Down**, and resubmit with **Ctrl+S**. The agent registers itself as the game's default focus target (`game "c3_default_focus"` / `game "c3_default_focus_part"`), so typed characters flow to it whenever no other input control is focused.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 3 | Text Entry Field | `agent_help` frame 0 | Composite text-input box; captures typed text, stores history, dispatches submitted text to the speech bubble factory and as a shout order to the pointed-at creature | [Detail](#text-entry-field-1-2-3) |

---

## Text Entry Field (1 2 3)

A two-part composite agent that captures typed input from the player and turns it into an in-world utterance. Part 0 carries the background graphic; part 1 is the editable text part holding the typed string.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 48 | Mouseable + Floatable (no collision, no gravity) |
| `imsk` | 65 | Input event mask: enables RAWKEYDOWN (73) and RAWTRANSLATEDCHAR (79) |
| `frel` | null | Not floating relative to anything initially |
| Position | -100000, -100000 | Hidden off-screen until text input begins |
| `base` | 9 | Sprite base frame |
| Plane | 10010 | Renders above almost all world content (UI plane) |
| Part 0 pose | 0 | Background graphic |
| Part 1 | text | Editable text part with font `BlackOnTransparentChars`, size 9, max 2000 chars, dimensions/colors set by `frmt 12 12 12 12 0 0 0` |
| Part 1 focus | `fcus` | Receives keyboard input by default |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Last submitted text (current "buffer") |
| `ov01` | Next history slot to write to (10–99, wraps) |
| `ov02` | History browse index (-1 = no active browse, otherwise current slot being viewed) |
| `ov10`–`ov99` | Rolling history of submitted strings (90 slots) |
| `va90`/`va91` | Working coordinates for repositioning (X / Y) |
| `va92`/`va93` | Window-mid X computed from `wndl`+`wndr`/2 (used to choose left/right pose) |
| `va95` | Pose select: 0 = left-of-pointer layout, 1 = right-of-pointer layout |

### Game Variables Set

| Variable | Value | Purpose |
|---|---|---|
| `game "c3_default_focus"` | this agent (`targ`) | Engine's default keyboard focus agent |
| `game "c3_default_focus_part"` | 1 | Default focus part (the editable text part) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 2000 | Custom — Submit Text | Reads the typed text, stores it in history, dispatches it to the speech bubble factory and as a shout order to the pointed-at creature, then hides the box |
| 73 | RAWKEYDOWN | Keyboard shortcuts: Ctrl+S submits, Ctrl+Up / Ctrl+Down browse history |
| 79 | RAWTRANSLATEDCHAR | Repositions the input box next to the current target/pointer whenever a character is typed (and hides it when the buffer is empty) |
| 1000 | Custom — Programmatic Submit | External agents/scripts can write text into the field by sending message 1000 with the text in `_P1_` |

#### Event 2000 — Submit Text

Triggered when the user confirms input (Ctrl+S, or programmatically via event 1000):

1. Plays the `"text"` sound effect (`snde "text"`).
2. Reads the text part (`part 1` → `va00 = ptxt`).
3. If text is non-empty **and** differs from the most recently stored history entry (`avar ownr ov01`):
   - Saves the text as the current buffer (`ov00 = va00`).
   - Advances the history write slot (`ov01 += 1`); wraps from 99 back to 10.
   - Resets browse index (`ov02 = -1`).
   - Stores the text into the new slot (`avar ownr ov01 = va00`).
4. Clears the editable text (`ptxt ""`) and hides the box (unfloat + move to -100000,-100000).
5. If text was non-empty:
   - Targets the **speech bubble factory** (`rtar 1 2 10`) and sends **message 126** (`_MAKE_SPEECH_BUBBLE`) with the text in `_P1_` and the pointer in `_P2_` — making a speech bubble pop up at the pointer's location.
   - Targets the pointer (`targ pntr`) and issues `ordr shou va00` — sending the typed string as a **shout** to whatever creature the pointer is pointing at, exactly as if the player had spoken it. This is how typed sentences become speech the creatures hear and learn from.

#### Event 73 — RAWKEYDOWN

Handles modifier-key shortcuts. `_P1_` is the virtual-key code; `keyd 17` reports whether the **Ctrl** key is held.

| Combo | VK | Behavior |
|---|---|---|
| Ctrl + S | 83 | If the buffer (`ov00`) is non-empty, refills the text part with `ov00` and re-fires submit (`mesg writ ownr 2000`) — re-sends the last submitted text |
| Ctrl + Up | 38 | Walks **backward** through history (`ov02--`, wraps 10→99) and previews the entry into the text part, then triggers event 79 to reposition the box |
| Ctrl + Down | 40 | Walks **forward** through history (`ov02++`, wraps 99→10), stops at the latest written entry (`ov01`), and previews the entry into the text part, then triggers event 79 to reposition |

For Ctrl+Up: the first invocation seeds `ov02` from `ov01`; subsequent presses decrement and wrap. If the slot being browsed is empty, the index is rolled back so the browser doesn't get stuck on an empty slot.

For Ctrl+Down: behaves symmetrically; first invocation seeds `ov02` from `ov01`, then increments. Will not wrap past the most recently written slot.

#### Event 79 — RAWTRANSLATEDCHAR

Fires every time a printable character is typed into the focused text part (also self-triggered by the Ctrl+Up/Ctrl+Down history browser). Repositions the input box so it floats near the pointer / focused agent:

1. If the text part is empty, hides the box (unfloat + move off-screen).
2. Otherwise, computes the anchor position:
   - If the pointer is **not** the current target, anchors at `posx` of the targeted agent; otherwise anchors at the pointer's left edge (`posl`).
   - Y position is the target's top (`post`) minus 30 pixels.
3. Computes the window's horizontal midpoint (`(wndl + wndr) / 2`).
4. If the anchor is **left of midpoint**: pose 0 (box opens to the right of the anchor).
5. If the anchor is **right of midpoint**: pose 1 (box opens to the left, anchor X shifted by -230).
6. Floats the box relative to the pointer (`frel pntr`), applies the chosen pose to both parts, and `mvto`'s to the computed coordinates.

This produces a chat-bubble-style input that always pops out toward the open side of the screen so it doesn't run off the edge.

#### Event 1000 — Programmatic Submit

Allows other scripts or agents to inject text into the input as if the player had typed it:

1. Writes `_P1_` (the supplied text) into the text part (`ptxt _p1_`).
2. Sends event 2000 to itself to run the normal submit pipeline.

---

## Removal Script (rscr)

1. Enumerates all 1 2 3 agents and kills them (`enum 1 2 3 → kill targ`).
2. Removes scripts 2000, 79, and 1000 (`scrx 1 2 3 2000`, `scrx 1 2 3 79`, `scrx 1 2 3 1000`).

   *Note: script 73 (RAWKEYDOWN) is not explicitly `scrx`'d — it lives on with the killed agents.*

---

## External Interactions

| Target Classifier | Interaction | Context |
|---|---|---|
| 1 2 10 | Message 126 (`_MAKE_SPEECH_BUBBLE`) with text + pointer | Submitted text is rendered as an in-world speech bubble at the pointer |
| pntr (1 2 1) | `ordr shou <text>` | Submitted text is shouted at the creature the pointer is pointing at — the standard mechanism for the player to speak words/sentences to creatures |

## Sound Effects

| Sound | Trigger |
|---|---|
| `text` | Played on every successful text submission |

## Notes on Focus & Input Mask

- `imsk 65` = bits for events 73 (RAWKEYDOWN) and 79 (RAWTRANSLATEDCHAR), opting the agent into raw keyboard delivery.
- `fcus` on part 1 plus `seta game "c3_default_focus" targ` makes this the default keyboard sink whenever no other UI control is focused — so the player can simply start typing anywhere in the game.
