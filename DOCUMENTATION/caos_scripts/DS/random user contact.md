# random user contact.cos — Special Pseudo-Contacts

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/random user contact.cos`

## Overview

This script **creates no agents** — it only sets up game variables. It seeds the contact book with two special **pseudo-contacts** used by the online systems (Comms Screen, Contact Book, Immigrant Checker) as wildcard targets:

- **`!net: ruso`** — "any on-line user" (a random online user). It is marked as a contact, given a nickname (from `catalogue "contact book"` entry 5), and set to **receive** into the containment chamber (`_containmentreceive = 1`).
- **`!friend`** — "any friend". Marked as a contact with a nickname (catalogue entry 6).

Both keys begin with `!` so they sort to the top of the contact list, appearing first wherever contacts are enumerated. They let the player address warps/messages to "any random user" or "any friend" rather than a specific UserID.

The game variables created are:

| Variable | Value |
|---|---|
| `game "!net: ruso"` | 1 |
| `game "!net: ruso_contact"` | 1 |
| `game "!net: ruso_nick"` | "any on-line user" text (catalogue) |
| `game "!net: ruso_containmentreceive"` | 1 |
| `game "!friend"` | 1 |
| `game "!friend_contact"` | 1 |
| `game "!friend_nick"` | "any friend" text (catalogue) |

## Impact on Stimulus / Room CA

None. This script creates no agents and only writes contact-book game variables. It emits no creature stimuli and writes no Room CA.
