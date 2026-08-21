# chat - the interpreters.cos — Online Chat: Incoming Message Interpreters

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/chat - the interpreters.cos`

## Overview

This part of the online chat system creates the two background agents that **poll for incoming network messages** (PRAY files) and dispatch them: the **Chat Request Interpreter** (`1 1 213`, handles `REQU` request/invite files) and the **Chat Message Interpreter** (`1 1 209`, handles `CHAT` message/update files). Between them they raise chat-request popups, add/remove chatters, and append received messages to open chat windows. Text comes from `chat.catalogue`.

Both share a common front-end: when offline they purge any stale chat PRAY files and idle; when online they scan for files, resolve the sender's UserID (`net: from`), make a new contact for an unknown sender (via `1 1 157`), ignore anyone marked a **foe** (`_group = 3`), and wait until the sender's nickname is known before processing.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 213 | Chat Request Interpreter | `blnk` | Polls `REQU` PRAY files (requests, invites, accept/decline/timeout) |
| 1 1 209 | Chat Message Interpreter | `blnk` | Polls `CHAT` PRAY files (messages, chatter join/leave) |
| 1 1 214 | Chat Request Indicator | `small_useful_screen` | Accept/decline popup (behaviour in [chat - chat request indicator](chat%20-%20chat%20request%20indicator.md)) |
| 1 1 212 | Request Holder | `blnk` | Invisible holder storing a pending request's sender/date details |

## Agent 1 1 213: Chat Request Interpreter (Event 9)

Adapts its tick rate (fast while a chat is open, slow otherwise) and dispatches by the file's `Request Type`:

| Request Type | Action |
|---|---|
| **Request** | Build a **Request Holder** (`1 1 212`) and pop up a **Chat Request Indicator** (`1 1 214`) so the user can accept/decline |
| **Join Existing Chat** | If not already in that chat / showing that invite, pop up an indicator (with `ov81 = 1`, carrying the chat's full chatter list and host) |
| **Accept / Decline / Timeout** | If this is the chat the user is waiting to create (matching ChatID, comms screen in chat state, chat module `initiateCR`), record the result on the chat module (`CR_result`) |
| **Invite Accept** | Add the new chatter to your list and "who's wanted" register, then broadcast a `CHAT` **Update** to all other chatters so they add them too |
| **Invite Decline / Invite Timeout** | Append a "declined/timed out" notice to the matching chat |

Each handled file is deleted (`pray kill`) via the `delete` subroutine.

## Agent 1 1 209: Chat Message Interpreter (Event 9)

Dispatches `CHAT` files by `Chat Message Type`:

| Type | Action |
|---|---|
| **Message** | Append `<nickname>: <message>` to the matching chat window's transcript (warning if minimised, via `1 1 164`) |
| **Update** | Add the named new chatter to the chat's chatter list and "who's wanted" register (skipping duplicates) |
| **Chatter go Bye Bye** | Remove the named exiting chatter from the list and "who's wanted" register |

Each handled file is then killed.

## Removal Script

```
rscr
enum 1 1 209
    kill targ
next
enum 1 1 213
    kill targ
next
```

Kills both interpreters.

## Impact on Stimulus / Room CA

None. These are online message dispatchers; they read PRAY network files and update chat UI. They emit no stimuli and do not affect Room CA.
