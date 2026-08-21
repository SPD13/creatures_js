# system notification.cos — System Message Notifier

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/system notification.cos`

## Overview

This script displays simple **system messages** from the Babel (online) system as pop-up dialogs. It creates an invisible handler (`1 1 200`) that listens on the network channel `system_message`; when a message arrives it shows a **"Creature Labs System Message"** dialog (`1 1 199`) containing the text. As a security measure it only honours messages that came **from the account holder themself** (`from = net: user`), so other players can't use `net: writ` to fake system messages on your screen.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 200 | System Message Handler | `blnk` | Invisible listener for `system_message` network messages — see [detail](#agent-1-1-200-handler) |
| 1 1 199 | System Message Dialog | `useful_screen` | The pop-up box showing the message — see [detail](#agent-1-1-199-dialog) |

## Agent 1 1 200: Handler

An invisible `new: simp` agent registered to hear the `system_message` channel.

| Event | Number | Description |
|---|---|---|
| Custom — system message | 2469 | On a `system_message` from yourself, pop up the dialog with the message text (`_p1_`) |

## Agent 1 1 199: Dialog

A `useful_screen` pop-up with the message text, a "Creature Labs System Message" title, and a close button.

| Event | Number | Description |
|---|---|---|
| Custom — close | 1000 | Play a sound and dismiss the dialog |

## Removal Script

```
rscr
enum 1 1 200
    kill targ
next
enum 1 1 199
    kill targ
next
```

Kills the handler and any open dialog.

## Impact on Stimulus / Room CA

None. This is an online-notification handler that displays text dialogs. It emits no creature stimuli and writes no Room CA.
