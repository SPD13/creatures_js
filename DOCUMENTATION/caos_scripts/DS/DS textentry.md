# DS textentry.cos — Talk-to-Creatures Text Entry

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS textentry.cos`

## Overview

This script creates the **text-entry** agent (`1 2 3`) — the box the player types into to "speak" words to creatures. When a line is committed it is shouted to every creature (so they hear it as a word, the basis of vocabulary teaching) and shown as a speech bubble. The agent also serves as the world's **default keyboard focus** and keeps a history of previously-said words for quick repeat/cycling. It is the Docking Station counterpart of the Creatures 3 [textentry](../C3/textentry.md).

At install it creates `1 2 3` (`agent_help` sprite, `attr 48`, `imsk 65`, plane 10010), focuses its text part, clears its word history (object variables 10–99), and registers itself as the default focus:

```
seta game "c3_default_focus" targ
setv game "c3_default_focus_part" 1
```

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 3 | Text Entry | `agent_help` | The "talk to creatures" input box / default keyboard focus |

## Agent 1 2 3: Text Entry

| Variable | Meaning |
|---|---|
| ov00 | Last spoken word |
| ov01 | Write index into the word-history ring (10–99) |
| ov02 | Cycling cursor for Ctrl+Up/Down recall |

### Events

| Event | Number | Description |
|---|---|---|
| Custom | 2000 | Line committed — speak it (shout + bubble), record in history |
| Raw Key Down | 73 | Ctrl+S repeat last; Ctrl+Up/Down cycle history |
| Translated Char | 79 | Live preview of the typed text as a bubble near the pointer |
| Custom | 1000 | Say a specific string (used by the keyboard handler's F-key shortcuts) |

#### Event 2000 — Speak

Plays the `text` sound, reads the typed text, and (if non-empty and not a duplicate of the last) stores it in the history ring and `ov00`. It clears the field, then sends the text to the **speech bubble factory** (`1 2 10`, message 126) and orders the pointer to `shou` the word so all nearby creatures hear it.

#### Event 73 — History shortcuts

- **Ctrl+S:** re-say the last word (`ov00`).
- **Ctrl+Up / Ctrl+Down:** cycle backward/forward through the stored word history into the input field (previewing via event 79).

#### Event 79 — Live preview

While typing, floats the entry box (as a bubble) relative to the pointer, choosing the bubble side based on screen position; hides it when the field is empty.

#### Event 1000 — Say a string

Sets the field to `_p1_` and fires event 2000 — used by the [keyboard handler](DS%20keyboard%20handler.md) to speak F-key shortcut phrases.

## Removal Script

```
rscr
enum 1 2 3
    kill targ
next
scrx 1 2 3 2000
scrx 1 2 3 79
scrx 1 2 3 1000
```

Kills the text-entry agent and removes its scripts.

## Impact on Stimulus / Room CA

It drives **creature hearing/vocabulary**: committed words are shouted (`ordr shou`) to nearby creatures, which is how the player teaches creatures words. It emits no room stimuli and does not affect Room CA.
