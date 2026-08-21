# chat - chat scripts.cos — Online Chat: Chat Window Behaviour

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/chat - chat scripts.cos`

## Overview

This part of the online chat system defines the behaviour of the **Chat Agent** (`1 1 210`) — the live chat window itself. The window is *created* elsewhere (by [chat - chat module](chat%20-%20chat%20module.md) when initiating a chat, or [chat - chat request indicator](chat%20-%20chat%20request%20indicator.md) when accepting one); this file provides its scripts: sending and displaying messages, tracking who's online, paging, colour, resizing, iconising, and plane management. It also creates the **iconised chat** (`1 1 217`). All on-screen text is in `chat.catalogue`.

Each chat window keeps `name` variables for its `ChatID`, `Plane`, `ChatText` (the accumulated transcript), `Sizing`, `Iconised`, the per-message RGB `Text Colour …`, and a numbered `chatter<N>_Nickname`/`_UserID` list (up to 30 participants).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 210 | Chat Agent | `chat` | The live chat window |
| 1 1 217 | Iconised Chat | `chat` | The minimised/iconised chat token |

## Agent 1 1 210: Chat Window

| Event | Number | Description |
|---|---|---|
| Custom | 1000 | **Send a message** to all chatters and append it to the transcript |
| Timer | 9 | Trigger a contact-list refresh (3000) |
| Network | 138 | A chatter went offline — remove them (and drop the chat if you're offline) |
| Custom | 3000 | Rebuild the on-screen contact list, dropping anyone now offline |
| Custom | 1012 / 1013 | Page the transcript back / forward |
| Custom | 1010 | **Quit** — tell all chatters you're leaving, then kill the window |
| Custom | 1017 | Toggle window **size** (Minimum ↔ Maximum) |
| Custom | 1016 | **Iconise** / restore (spawns or removes `1 1 217`) |
| Custom | 1015 | Insert a focus marker / refocus the input |
| Custom | 1014 | Cycle a **text colour** channel (R/G/B) and update the sample |
| Pickup / Push / Mouse down | 4 / 1 / 76 | Bring the window to the front plane (`chat_plane_highest`), restoring others |
| World Loaded | 128 | Kill self |

### Event 1000 — Send a message

Composes the message (prefixed with the user's chosen `<tint R G B>` colour), clears the input, writes a PRAY **`CHAT`** file (`chat_message.txt`) tagged with the sender's UserID/nickname, the ChatID, and the message, and sends it (`net: make`) to **every** other chatter's UserID. On success it appends the line to `name "ChatText"` and shows the latest page.

### Event 1010 — Quit

Writes a PRAY `CHAT` "Chatter go Bye Bye" update, sends it to all chatters so they remove you, restores default focus, and kills the window.

### Events 1016 / 1017 — Iconise & Resize

**1016** floats the window off-screen and creates an `1 1 217` iconised token (carrying the same `ChatID`) — or, if already iconised, removes the token and restores the window. **1017** rebuilds the window parts at the Minimum or Maximum layout, moving/recreating the text area, colour buttons and chatter list.

## Agent 1 1 217: Iconised Chat

| Event | Number | Description |
|---|---|---|
| Activate | 1 | Maximise — find the matching `1 1 210` (by ChatID) and restore it (message 1016) |
| World Loaded | 128 | Kill self |

## Removal Script

```
rscr
enum 1 1 210
    kill targ
next
enum 1 1 217
    kill targ
next
```

Kills all chat windows and iconised tokens.

## Impact on Stimulus / Room CA

None. This is online chat UI — it exchanges PRAY `CHAT` messages over the network and renders the conversation. It emits no stimuli and does not affect Room CA.
