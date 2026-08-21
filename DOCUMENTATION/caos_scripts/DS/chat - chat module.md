# chat - chat module.cos — Online Chat: Module & Request

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/chat - chat module.cos`

## Overview

This is one part of Docking Station's online **chat system** (deliberately split across several COS files because the whole system is slow to inject in one go). It builds the **Chat Module** (`1 1 211`) — the panel, launched from the **Comms screen** (`1 2 210`), where you pick an online contact, send them a **chat request**, and, if they accept, opens a live **Chat Agent** (`1 1 210`). All on-screen text comes from the `chat.catalogue`. The system relies on the online `net:` and PRAY commands.

## Created / Modified Agents

| Classifier | Name | Type | Description |
|---|---|---|---|
| 1 2 210 | Comms Screen | Modification | Adds the "create chat centre" action (event 1002) |
| 1 1 211 | Chat Module | Creation | The recipient-chooser / chat-request panel |
| 1 1 210 | Chat Agent | Creation | The live chat window, opened when a request is accepted |

## Comms Screen (1 2 210) — Event 1002

Cleans up whatever the comms screen was showing (contact book / options / agent injectors / message centre / WWW), then opens the Chat Module: it either un-hides an existing `1 1 211` or creates a new one with its contact-list parts, defaulting to the **"recipient"** state, and refreshes the contact list (message 4000).

## Agent 1 1 211: Chat Module

A `name "state"` machine: **"recipient"** (choosing who to chat with) and **"initiateCR"** (a chat request has been sent and we await the reply).

| Event | Number | Description |
|---|---|---|
| Custom | 2000 | Tear down old parts and build the parts for the current state |
| Custom | 4000 | Fill/refresh the paged list of online contacts |
| Custom | 1004 | Accept the selected contact → start composing/sending a request |
| Custom | 1009 | Send the chat request and track its progress |
| Custom | 1005 | Cancel the request → back to the recipient chooser |
| Custom | 1006 / 1007 | Page back / forward through contacts |
| Custom | 1008 | Select a recipient from the list |

### Event 4000 — Contact list

If not online, it shows a "go online" prompt and pokes the connect agent (`1 1 224`). Online, it scans the `<userID>_contact` game variables, skipping the random-user/friend specials and anyone marked a **foe** (`_group = 3`), and lists each **online** contact's nickname (`<userID>_nick`), paginated 11 per page, highlighting the currently-chosen recipient.

### Event 1009 — Send chat request

Writes a PRAY **`REQU`** source file (`chat_request.txt`) carrying the sender's UserID/nickname, date, request type, and a randomly-named **ChatID**, compiles and sends it to the recipient (`net: make` to their UserID), and then polls — animating "awaiting reply" — until the recipient **accepts/declines/times out** or goes offline. On **accept** it creates the **Chat Agent** (`1 1 210`): it allocates a free chat plane (from `chat_plane`…`chat_plane_max`), stores the two chatters' nicknames/UserIDs and the ChatID, registers the recipient in the "who's wanted" network register (`net: whon`), and builds the chat window's parts (text area, input field, quit/invite/page buttons, RGB text-colour buttons + level indicators, iconise/size buttons, and the chatter list).

## Removal Script

```
rscr
enum 1 1 211
    kill targ
next
```

Kills the chat module.

## Impact on Stimulus / Room CA

None. This is an online UI; it sends/receives chat requests over the network and opens chat windows. It emits no stimuli and does not affect Room CA.
