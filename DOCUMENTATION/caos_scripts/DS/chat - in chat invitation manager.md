# chat - in chat invitation manager.cos — Online Chat: Invite to Chat

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/chat - in chat invitation manager.cos`

## Overview

This part of the online chat system lets a user already in a chat **invite another online contact** to join it. It adds the **Invite** action (event 1011) to the [Chat Agent](chat%20-%20chat%20scripts.md) (`1 1 210`) and defines the **In-Chat Invitation Manager** (`1 1 215`) panel that picks a contact and sends them a "Join Existing Chat" request. On-screen text is in `chat.catalogue`.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 215 | In-Chat Invitation Manager | `chat` | Panel for choosing and inviting a contact into the current chat |

(It also installs the Chat Agent's Invite handler — `1 1 210` event 1011.)

## Chat Agent (1 1 210) — Event 1011: Invite

Creates the invitation manager (`1 1 215`) floated over the chat window, stores a reference to the parent chat (`name "Chat"`), builds its contact-list and accept/cancel/refresh/page parts, and refreshes the contact display (message 10000).

## Agent 1 1 215: Invitation Manager

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Stay one plane above the parent chat |
| Custom | 10000 | Fill/refresh the paged list of invitable contacts |
| Custom | 1002 | Refresh |
| Custom | 1003 / 1004 | Page back / forward |
| Custom | 1005 | Choose an invitee |
| Custom | 1001 | Accept — send the invitation and update the chat |
| Custom | 1000 | Cancel |
| Custom | 5000 | Compose and send the invitation |
| World Loaded | 128 | Kill self |

### Event 10000 — Invitable contacts

Builds a string of the chat's current chatter UserIDs, then scans the `<userID>_contact` game variables and lists each **online** contact (`<userID>_nick`) who is **not already in the chat** and isn't a random-user/friend special — paginated 11 per page.

### Event 5000 — Send invitation

Writes a PRAY **`REQU`** file (`chat_invitation.txt`) with `Request Type` = "Join Existing Chat", the sender's UserID/nickname, the **ChatID**, and the full current chatter list, and sends it (`net: make`) to the chosen invitee's UserID. On success it records `name "Result" = "Success"`; event 1001 then appends an "invited" line to the chat transcript and closes the manager.

## Removal Script

```
rscr
enum 1 1 215
    kill targ
next
```

Kills any invitation managers.

## Impact on Stimulus / Room CA

None. This is online chat UI; it sends a PRAY invitation over the network. It emits no stimuli and does not affect Room CA.
