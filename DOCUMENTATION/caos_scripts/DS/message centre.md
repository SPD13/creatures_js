# message centre.cos — The Message Centre

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/message centre.cos`

## Overview

This script implements the **Message Centre**, Docking Station's online person-to-person mail system. It lets the player read received messages, compose new ones to a contact, and reply/delete — sending each message as a **MESG** PRAY file over the network. It comprises a background **Message Interpreter** that polls for incoming mail, the **Message Centre window** itself (opened from the Comms Screen), an invisible **message holder** agent per received message, and a **minimised window** placeholder.

The script also contains the Comms Screen's **Message Centre button** event (`scrp 1 2 210 1001`) — pressing it tears down whatever mode the Comms Screen is in and creates the Message Centre window (`1 1 205`), so this file is a **Modification** of the Comms Screen (`1 2 210`).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 205 | Message Centre Window | `chat window` | The inbox/compose/read window — see [detail](#agent-1-1-205-message-centre-window) |
| 1 1 206 | Message Interpreter | `blnk` | Background poller for incoming MESG mail — see [detail](#agent-1-1-206-message-interpreter) |
| 1 1 207 | Message Holder | `blnk` | Invisible agent storing one received message in name-vars |
| 1 1 216 | Minimised Window | `chat window` | The minimised-state placeholder for the message window |

## Agent 1 1 205: Message Centre Window

A `new: comp` window with four states tracked in `name "state"`: **inbox** (list received messages), **recipient** (pick a contact to write to), **compose** (write subject + message), and **view** (read a message). State transitions rebuild the parts via event 2000.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — compose | 1000 | Switch to the recipient-chooser state |
| Custom — reply | 1001 | Reply to the viewed message (→ compose) |
| Custom — delete | 1002 | Delete the viewed message and return to inbox |
| Custom — page back/forward | 1005 / 1006 | Page the recipient contact list |
| Custom — choose recipient | 1007 | Highlight/select a contact as the recipient |
| Custom — accept recipient | 1008 | Confirm the recipient and go to compose |
| Custom — cancel recipient | 1009 | Abandon recipient choice, return to inbox |
| Custom — select message | 1010 | Highlight a message in the inbox (double-select → view) |
| Custom — update recipient list | 1012 | Fill the recipient page from the contact book (skipping foes) |
| Custom — subject entered | 1300 | Validate the subject text field |
| Custom — send | 1101 | Build and send the MESG PRAY file to the recipient |
| Custom — exit compose | 1102 | Abandon composing, return to inbox |
| Custom — view message | 1500 | Open the selected message (decodes subject/sender/date/body) |
| Custom — rebuild parts | 2000 | Kill the old state's parts and build the new state's |
| Custom — dock/undock | 4000 | Dock to the Comms Screen or float free |
| Custom — minimise/maximise | 4001 | Minimise to a `1 1 216` placeholder or restore |
| Custom — message check | 5000 | Refresh the inbox list from the message holders (`1 1 207`) |

### Event 1101 — Send

Validates that a subject and message exist, then writes a `message.txt` PRAY source (`group MESG`, with the sender's UserID, subject, body, timestamp, and nickname), `net: make`s it to the recipient's UserID, and runs `pray garb`. On success it confirms, clears the recipient, and returns to the inbox.

### Event 5000 — Message check

Enumerates the message holders (`1 1 207`), shows up to ~8 in the inbox with subject/sender/date, and either shows the unread count or, if empty, clears the matching message warning icon (`1 2 46`).

## Agent 1 1 206: Message Interpreter

| Event | Number | Description |
|---|---|---|
| Timer | 9 | While online, poll for and ingest incoming MESG mail |

### Event 9

If online and a `MESG` PRAY file is waiting: resolves the sender (`net: from`), makes a new contact (`1 1 157`) for unknown senders, **ignores foes** (`_group = 3`, killing their mail), waits for the sender's nickname, archives the message to the per-user message log (journal file), creates a **message holder** (`1 1 207`) carrying the subject/sender/date/body/nickname, deletes the PRAY file, refreshes the inbox (`1 1 205`, event 5000), and raises a **message warning icon** via the warning controller (`1 1 164`).

## Agents 1 1 207 / 1 1 216

- **1 1 207 (Message Holder)** — an invisible agent with no events; it just stores one received message in name-variables for the inbox to read.
- **1 1 216 (Minimised Window)** — events 1000 (maximise) and 1001 (dock), which restore or re-dock the message window and kill the placeholder.

## Removal Script

```
rscr
enum 1 1 205 / 1 1 206 / 1 1 216
    kill targ
next
```

Kills the window, interpreter and any minimised placeholder. (Message holders `1 1 207` persist as the stored inbox.)

## Impact on Stimulus / Room CA

None. The Message Centre is a networking/UI system: it emits no creature stimuli and writes no Room CA. Its effects are sending/receiving **MESG** PRAY mail over the network, archiving messages to the journal, managing contacts (`1 1 157`), and raising message warning icons (`1 1 164` / `1 2 46`).
