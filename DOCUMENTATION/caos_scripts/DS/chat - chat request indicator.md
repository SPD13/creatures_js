# chat - chat request indicator.cos — Online Chat: Request Popup

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/chat - chat request indicator.cos`

## Overview

This part of the online chat system defines the **Chat Request Indicator** (`1 1 214`) — the popup shown to the **recipient** when someone sends them a chat request (or an invite to join an existing chat). The recipient can **accept** or **decline**, or let it **time out**; the result is sent back to the sender over the network, and on acceptance the live **Chat Agent** (`1 1 210`) is opened. The indicator itself is created by the Chat Request Interpreter (a separate COS file). On-screen text comes from `chat.catalogue`.

`ov81` distinguishes a fresh **chat request** (0) from an **invite** to an existing chat (1).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 214 | Chat Request Indicator | (request popup) | Accept/decline popup on the recipient's side |
| 1 1 210 | Chat Agent | `chat` | The live chat window, opened on accept |

## Agent 1 1 214: Chat Request Indicator

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Count down; on reaching zero set result = timeout / invite_timeout and send |
| Custom | 1000 | Decline → result = decline / invite_decline, send |
| Custom | 1001 | Accept → result = accept / invite_accept, send |
| World Loaded | 128 | Kill self (don't survive a reload) |
| Custom | 1002 | Send the result back to the sender (and open the chat on accept) |

### Event 1002 — Send result

Writes a PRAY **`REQU`** reply file (`chat_request.txt`) carrying the responder's UserID/nickname, date, the original **ChatID**, and a **Request Type** (`Accept` / `Decline` / `Timeout`, or the `Invite ...` equivalents), and sends it (`net: make`) to the sender. Then:

- **Decline / invite_decline** → kill the indicator.
- **Accept** → create the **Chat Agent** (`1 1 210`): allocate a chat plane (from `chat_plane`…`chat_plane_max`), record the ChatID and the two chatters (the initiator as Chatter1, the responder as Chatter2), and build the chat window's parts (text area, input field, quit/invite/page buttons, RGB text-colour buttons + indicators, iconise/size buttons, chatter list). Then kill the indicator.
- **Invite accept** → similar, but it copies **all** the existing chatters from the invitation, adds the responder to the chatter list, and registers each chatter in the "who's wanted" network register (`net: whon`).

## Removal Script

```
rscr
enum 1 1 214
    kill targ
next
```

Kills the request indicator.

## Impact on Stimulus / Room CA

None. This is online chat UI; it exchanges PRAY request messages over the network and opens a chat window. It emits no stimuli and does not affect Room CA.
