# comms screen.cos — The Comms Screen (Communications Console)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/comms screen.cos`

## Overview

This script builds the **Comms Screen** (`1 2 210`), the large multi-function communications console in the Docking Station Comms room. A column of six buttons switches it between modes, each of which dynamically builds and tears down its own set of compound parts:

1. **Contact Book** — your saved online contacts (nickname, friend/foe group, online light)
2. **Message Centre** — handled in `message centre.cos` (this script only opens/closes it)
3. **Chat System** — handled in `chat - chat module.cos` (this script only opens/closes it)
4. **W3 Display** — a web-links page (creates the separate `1 2 219` agent)
5. **DS Agent Injector** — browse/inject Docking Station agent files (and switch to the C3 list)
6. **Options / Info** — toggle the four warning categories and set the warning / life-event display limits

It also creates a second agent, the **WWW Links list** (`1 2 219`), while in W3 mode.

State is held in object variables on `1 2 210`:

| Var | Meaning |
|---|---|
| `ov00` | Current mode: 0 blank, 1 contacts, 2 options, 3 DS injector, 4 C3 injector, 5 messaging, 6 chat, 7 WWW |
| `ov01` | Current highest part number (parts are built programmatically; event 1011 kills back down to a given part) |
| `ov02` | Options bitflag of enabled warnings: +1 containment, +2 portal, +4 messaging, +8 contact (default 15 = all on) |
| `ov03` | Current page of the agent-injector list |
| `ov04`/`ov05` | First / currently-selected agent name in the injector list |
| `ov07` | Current page of the contacts list |
| `ov10`–`ov19` | PRAY names of the agent files in the current injector page |

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 210 | Comms Screen | `comms` | The main communications console with six mode buttons — see [detail](#agent-1-2-210-comms-screen) |
| 1 2 219 | WWW Links list | `blnk` | The web-links sub-page shown in W3 mode — see [detail](#agent-1-2-219-www-links-list) |

It also spawns two **transient helper agents** that are created and killed within events (not persistent UI): a dummy display agent `3 3 66` (event 1046, to render an agent's preview in the camera console) and a dummy injector `1 1 204` (event 1043, which performs the actual `pray injt` install and is auto-killed).

## Agent 1 2 210: Comms Screen

The console hub. On creation it lays out the six mode buttons (parts 1–6, each firing custom events 1000–1005), positions itself, initialises the state variables, and immediately messages itself 1000 to open the Contact Book.

### Events

| Event | Number | Description |
|---|---|---|
| World Loaded | 128 | If in contacts mode, refresh; if in an injector mode, wake the camera console (`3 3 104`) |
| Custom — gone online | 135 | In contacts page 1, light up online user/friend icons (subroutine `friend`) |
| Custom — gone offline | 136 | In contacts page 1, clear the online icons |
| Custom — WWR user online | 137 | A "who's wanted" user came online → find their nickname box and set its light on |
| Custom — WWR user offline | 138 | A "who's wanted" user went offline → set their light off |
| Custom — Contact Book button | 1000 | Close whatever mode is open, then open the Contact Book (state 1) |
| Custom — W3 button | 1003 | Close current mode, open W3 mode (state 7) and create the `1 2 219` web-links list |
| Custom — DS Injector button | 1004 | Close current mode, open DS agent-injector mode (state 3); `pray refr`, build list parts, tell camera console creator-mode |
| Custom — Options button | 1005 | Close current mode, open the Options page (state 2) with the four warning toggles + two number boxes |
| Custom — C3 Injector button | 1006 | Toggle/open the C3 agent-injector mode (state 4); same layout as DS but lists `AGNT` files |
| Custom — page back | 1007 | Contacts: go to previous page (event 1010) |
| Custom — page forward | 1008 | Contacts: go to next page (event 1010) |
| Custom — agent Web URL | 1009 | Open the selected agent's `Web URL` tag in the browser (`webb`) |
| Custom — fill contacts | 1010 | Build the contacts list for page `_p1_` (see below) |
| Custom — kill parts | 1011 | Destroy compound parts from `ov01` down to `_p1_` (mode teardown) |
| Custom — confirm nickname | 1012 | Tidy parts and re-open the contact book |
| Custom — export contacts | 1013 | Write contacts to a `.cos` and `pray make` a **Contact List** `.agents` file (see below) |
| Custom — set life-event limit | 1016 | Clamp text-entry 0–20 → `game "ds_number_of_life_events"` |
| Custom — set warning limit | 1017 | Clamp text-entry 0–20 → `game "ds_number_of_warnings"`; trims any excess on-screen warnings (`1 2 46`) |
| Custom — friend/foe button | 1020 | Cycle a contact's group (casual/friend/foe) → `<userID>_group`; plays bep/kiss/spank sounds |
| Custom — toggle containment warning | 1030 | Flip bit 1 of `ov02` |
| Custom — toggle portal warning | 1031 | Flip bit 2 of `ov02` |
| Custom — toggle message warning | 1032 | Flip bit 4 of `ov02` |
| Custom — toggle contact warning | 1033 | Flip bit 8 of `ov02` |
| Custom — highlight injector entry | 1040 | Select a list entry, clear/refresh highlights, trigger the camera preview (1046) |
| Custom — injector page back | 1041 | Previous page of the agent list (re-fires 1045/1047 by mode) |
| Custom — injector page forward | 1042 | Next page of the agent list |
| Custom — inject agent | 1043 | Validate & `pray injt` the selected agent; report success/script-not-found/dependency errors from `catalogue "agent injector"` |
| Custom — remove agent | 1044 | Run the selected agent's `Remove script` tag via `caos` |
| Custom — display DS agents | 1045 | Page the `DSAG` PRAY list into the 10 text slots (`ov10`–`ov19`) |
| Custom — camera preview | 1046 | Spawn dummy `3 3 66`, load the highlighted agent's sprite, point the camera console at it, show its description / Web URL |
| Custom — display C3 agents | 1047 | Page the `AGNT` (Creatures 3) PRAY list, with undocked-mode warning text |
| Custom — refresh contacts | 1100 | Rebuild the contacts list |

> Event 1001 (Message Centre) and event 1002 (Chat System) are intentionally **not** in this file — the Message Centre script lives in `message centre.cos` and the Chat module in `chat - chat module.cos` (which also registers `1 2 210` as a Modification target). The buttons for those modes just toggle state and `enum`/`kill`/`mvby` the relevant helper agents (`1 1 205` messaging, `1 1 211` chat).

### Mode teardown pattern

Every mode button first closes the currently-open mode: it calls event 1011 to kill that mode's parts, stops the mode button flashing, resets `ov00` to 0, clears `ov04`/`ov05`, and tells companion agents to clean up — the contact book companion (`1 2 47`, `mesg 1001`), the camera console (`3 3 104`, normal-mode message 1011), or kills the WWW list (`1 2 219`). Only then does it build the newly-selected mode.

### Event 1010 — Contacts list

Scans every game variable for the `_contact` marker to enumerate saved contacts (`<userID>_contact`, `<userID>_nick`, `<userID>_group`). For each it registers the user in the network "who's wanted" register (`net: whon`), creates a nickname box, a friend/foe pose button (event 1020), and an online-status light (resolved via `net: ulin` / `net: line`, with special handling for the `!net: ruso` random-user and `!friend` pseudo-contacts). 20 entries fit per page in two columns; page arrows (parts 8/9) appear as needed. The `friend` subroutine pre-scans whether any of your friends are currently online.

### Event 1013 — Export contacts

Writes a `contacts.cos` install script (one `setv game …` block per contact) into the journal, builds an `import_cos.txt` PRAY template, then `pray make`s a **`ContactList.agents`** DSAG file (sprite `comms.c16`) so contacts can be shared with another world; temp files are then `file jdel`'d.

### Agent-injector mode (states 3 / 4)

Builds 10 text slots + 10 cover buttons, page up/down, inject (green tick) and remove (red cross) buttons, a description box (part 31) and a Web URL button (part 33). Event 1045 pages the `DSAG` PRAY index (Docking Station agents), event 1047 the `AGNT` index (Creatures 3 agents). Selecting an entry (1040) previews it via a dummy `3 3 66` agent rendered on the camera console (`3 3 104`). Injection (1043) uses `pray injt` and surfaces `pray deps` dependency diagnostics; removal (1044) runs the agent's own `Remove script`. The injector messages the camera console (`3 3 104`) into/out of creator-camera mode.

## Agent 1 2 219: WWW Links list

Created by event 1003 when entering W3 mode. It shows the four built-in Docking Station web links (DS Central, DS Support, C3 Info, World Link — read from `catalogue` entries) plus up to six third-party links harvested from injected agents' `Web URL` PRAY tags.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — press web button | 1000 | Open one of the four built-in links (`webb`); the World Link appends `wuid`, `wnam`, and the split `net: user` world UID/HID as query params |
| Custom — build link list | 1001 | Page through `DSAG` PRAY files (6 per page), de-duplicate by URL, and fill the icon buttons / labels from each agent's `Web Icon` / `Web Label` / `Web URL` tags |
| Custom — page back | 1002 | Previous page of third-party links |
| Custom — page forward | 1003 | Next page of third-party links |
| Custom — press 3rd-party link | 1004 | Open the stored URL for the pressed button (`webb`) |

## Removal Script

```
rscr
enum 1 2 210
    kill targ
next
enum 1 2 219
    kill targ
next
```

Kills the console and the web-links list.

## Impact on Stimulus / Room CA

None. The Comms Screen is a UI console: it plays interface sounds, reads/writes **game variables** (the contact book `<userID>_*` entries, `ds_number_of_warnings`, `ds_number_of_life_events`, the `ov02` warning bitflags), injects/removes agents via PRAY, and opens web pages (`webb`). It emits no creature stimuli and writes no Room CA.
