# contact buttons.cos — Contact Book Import/Export Buttons

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/contact buttons.cos`

## Overview

This script creates the **Contact Book Import/Export buttons** (`1 2 47`), a small companion agent that sits on top of the [Comms Screen](comms%20screen.md) while the Contact Book is open. It positions itself at the Comms Screen's location and, on request, builds its two buttons:

- **Export** — packages every saved contact into a shareable `ContactList.agents` PRAY file
- **Import** — injects a previously-exported contact list, merging its entries into your contact book

It is the companion the Comms Screen talks to via `rtar 1 2 47` / `mesg 1000` (create buttons) and `mesg 1001` (destroy buttons) as the contacts page opens and closes.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 47 | Contact Import/Export Buttons | `blnk` | The Export/Import button pair for the contact book — see [detail](#agent-1-2-47-contact-importexport-buttons) |

## Agent 1 2 47: Contact Import/Export Buttons

A compound agent (`new: comp`) placed at the Comms Screen's position (falling back to fixed coordinates if the screen isn't present).

### Events

| Event | Number | Description |
|---|---|---|
| Custom — create buttons | 1000 | Build the Export (part 1) and Import (part 2) buttons |
| Custom — destroy buttons | 1001 | Kill both button parts (`pat: kill`) |
| Custom — press Export | 1002 | Write all contacts to a PRAY file (`ContactList.agents`) |
| Custom — press Import | 1003 | Inject a `CHUM`-group contact list and merge it in |

### Event 1002 — Export contacts

Trashes any existing in-world "Contact List" PRAY chunk, then opens `contacts.cos` in the journal and, for every `<UserID>_contact` game variable, emits CAOS lines that recreate the contact (`setv game "<UserID>" 1`, `…_contact 1`, `sets game "…_nick" "<nick>"`, `setv game "…_group" <n>`). It then writes an `import_cos.txt` PRAY template (`group CHUM "Contact List"`, sprite `comms.c16`, the contact-list Author Text) and calls `pray make` to build **`ContactList.agents`**. Temp files (`contacts.cos`, `import_cos.txt`) are `file jdel`'d afterward.

> This is the same export routine the Comms Screen carries in its own event 1013, differing only in the PRAY group tag (`CHUM` here vs `DSAG`) and using the `Author Text` tag instead of `Agent Description`.

### Event 1003 — Import contacts

`pray refr`, then finds the first `CHUM` PRAY file (`pray next`) and `pray injt`s it to run its embedded `contacts.cos`, recreating the contact game variables. It then tidies up:

- Deletes obsolete pseudo-entries (`friend_*`, `net: ruso_*`) which are now stored as `!friend` / `!net: ruso` so they sort first alphabetically.
- Deletes your own entry (`<net: user>_contact`) so you don't list yourself.
- Re-registers every imported contact in the network **who's wanted register** (`net: whon`, via the contact-book manager `1 1 157`) so `net: ulin` lookups are fast and friend online-warning icons work.
- Refreshes the Comms Screen contacts display (`1 2 210`, `mesg 1100`) if it's showing.

Imported entries are **merged**, never overwriting existing contacts.

## Removal Script

```
rscr
enum 1 2 47
    kill targ
next
```

Kills the button agent.

## Impact on Stimulus / Room CA

None. This is a UI helper agent. It reads/writes **game variables** (the contact book), reads/writes journal files, and uses PRAY (`make` / `injt` / `refr` / `next` / `kill`) plus the network who's-wanted register. It emits no creature stimuli and writes no Room CA.
