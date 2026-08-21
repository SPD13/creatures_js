# musicola.cos — The Musicola

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/musicola.cos`

## Overview

The **Musicola** (`2 21 17`) is a musical toy in the Norn Meso — a one-agent band with four instruments (drums, keyboard, horns, high-hat). Creatures and the hand can play it by pushing, pulling, hitting or deactivating it, and a built-in four-way button triggers a random instrument. Each interaction plays the instrument's animation and sound and stims the player with **97 (fun/play)**, making it a source of entertainment for bored norns.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 2 21 17 | Musicola | `musicola` | The four-instrument musical toy — see [detail](#agent-2-21-17-musicola) |

## Agent 2 21 17: Musicola

A single compound agent with the four instrument parts plus a four-way trigger button.

### Events

| Event | Number | Description |
|---|---|---|
| Custom — high-hat | 0 | Play the high-hat (cymbal loop), stim **97** |
| Custom — keyboard | 1 | Play the keyboard, stim **97** |
| Custom — horns | 2 | Play a random horn note, stim **97** |
| Custom — drums | 3 | Play a random drum loop, stim **97** |
| Timer | 9 | Stop the looping sounds (fade) and reset the high-hat/drum parts |
| Custom — button | 1000 | Pick a random instrument (0–3) and play it |

Each instrument event flashes the four-way button, animates its instrument part, stims the interacting creature/hand with **97 (fun)**, and plays the relevant sound (the drums and high-hat use looping sounds that the timer later fades out). The button (event 1000) simply forwards a random message 0–3, so a single press plays one of the four instruments at random.

## Removal Script

```
rscr
enum 2 21 17
    kill targ
next
```

Kills the Musicola.

## Impact on Stimulus / Room CA

**Stimuli:** every interaction with the Musicola stims the player with **97 (fun/play)** — its whole purpose is entertainment. It emits no other stimuli and writes no Room CA; the rest of its effect is audio/visual (instrument sounds and animations).
