# contact book.cos — Contact Book Manager (Heart & Soul)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/contact book.cos`

## Overview

This script creates the **Contact Book Manager** (`1 1 157`), an invisible background agent that is the "heart and soul" of the online contact system. It owns the **game variables** that store every saved contact and provides the single, security-checked entry point for adding contacts — whether the request comes from the portals, the [Comms Screen](comms%20screen.md), the chat interpreters, or a remote machine over the network. It registers a network listener (`net: hear "add_to_contact_book"`) so other players can ask to be added to your book, and it keeps contact nicknames fresh and friend/foe warning icons up to date.

For each contact (keyed by **UserID**) it maintains these game variables:

| Variable | Type | Meaning |
|---|---|---|
| `game <UserID>` | INT | 1 = this user is known to you |
| `game <UserID>_contact` | INT | 1 = appears in the contact book |
| `game <UserID>_nick` | STRING | Nickname fetched from the server (`net: unik`) |
| `game <UserID>_portalNsend` / `_portalNreceive` | INT | 1 = this contact is wired to portal N (0–9) for send/receive |
| `game <UserID>_containmentsend` / `_containmentreceive` | INT | 1 = wired to the containment chamber |

(`<UserID>_group` — 1 casual / 2 friend / 3 foe — is written by the Comms Screen's friend/foe button, and read here for the warning icons.)

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 157 | Contact Book Manager | `blnk` | Invisible manager of all contact-book game variables — see [detail](#agent-1-1-157-contact-book-manager) |

## Agent 1 1 157: Contact Book Manager

A single invisible agent created with `new: simp`, moved to (0,0), that listens on the network channel `add_to_contact_book`.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — Add user | 1000 | Add the UserID `_p1_` to the contact book; `_p2_` optionally records a portal/containment send/receive link |
| Custom — gone online | 135 | Re-fetch any contact whose nickname is still the "no name available" placeholder |
| Custom — WWR user online | 137 | A registered user came online → if they're a **friend**, raise an online warning icon |
| Custom — WWR user offline | 138 | A registered user went offline → if they're a **friend** (and you're online), raise an offline warning icon |
| Custom — add from web | 2468 | Network handler for `add_to_contact_book`: only honours the request if it came **from the user themself** |

### Event 1000 — Add user

The core routine. `_p1_` is the UserID (must be a string); `_p2_` is an optional integer describing a portal/containment wiring (`+N` = send, `−N` = receive; 1–10 = portals 0–9, 11 = containment chamber).

1. Registers the user in the network "who's wanted" register (`net: whon`) so `net: ulin` lookups are fast and the warning-icon event fires.
2. If the user is **new** (`game <UserID>` is 0): creates `<UserID>`, `<UserID>_contact`, and fetches the nickname via `net: unik` into `<UserID>_nick` (falling back to the `catalogue "contact book"` "no name available" string when offline).
3. If the UserID is **you** (`net: user`), deletes the `_contact` entry and stops — you don't contact yourself.
4. If `_p2_` is a portal index (1–10), finds the matching portal agent (`3 9 1`, by its `ov00`) and messages it 1005 to set up its own who's-wanted register; then writes the `<UserID>_portalNsend/receive` (or `_containment…`) flag.
5. If `_p2_` is 0 (a plain add) and the Comms Screen (`1 2 210`) is currently showing the contacts page, messages it 1100 to refresh.

### Events 137 / 138 — Friend warning icons

Both first check `net: stat` time-online (> 5000) to avoid firing during the initial sign-on burst. If the user's `<UserID>_group` is **2 (friend)**, they message the **warning-icon controller** (`1 1 164`) — event 1000 with code 4 (friend came online) or 6 (friend went offline) — so the player gets a heads-up about friends arriving/leaving.

### Event 2468 — Add from web / network

Triggered by an incoming `add_to_contact_book` network message. It **only proceeds if `from` equals `net: user`** — i.e. the request was sent by the account holder to their own world. This guards against other players using `net: writ` to inject unwanted entries into someone else's contact book. On a valid request it calls event 1000 and refreshes the Comms Screen if it's on the contacts page.

## Removal Script

```
rscr
enum 1 1 157
    kill targ
next
```

Kills the contact-book manager.

## Impact on Stimulus / Room CA

None. This is an invisible bookkeeping/network agent. It reads and writes **game variables** (the per-UserID contact entries), talks to the network layer (`net: hear/whon/unik/user/stat/line`), drives the warning-icon controller (`1 1 164`) and portals (`3 9 1`), and refreshes the Comms Screen. It emits no creature stimuli and writes no Room CA.
