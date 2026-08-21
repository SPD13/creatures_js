# DS speech bubble factory.cos — Speech Bubbles

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS speech bubble factory.cos`

## Overview

This script creates the **speech bubble factory** (`1 2 10`) — an invisible service agent that, on request, pops a comic-style **speech bubble** (`1 2 9`) over a speaking agent. Other systems (e.g. [agent help](DS%20agent%20help.md) shouting an agent's name) send it message 126 with the text and the source agent. It is the Docking Station counterpart of the Creatures 3 [speech bubble factory](../C3/speech%20bubble%20factory.md).

At install it creates `1 2 10` (`blnk` sprite, `attr 48`).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 10 | Speech Bubble Factory | `blnk` | Service agent that builds speech bubbles on demand |
| 1 2 9 | Speech Bubble | `speech_bubbles` | The transient bubble shown over the speaker |

## Agent 1 2 10: Speech Bubble Factory

### Event 126 — Make a speech bubble

`_p1_` is the text, `_p2_` the source agent (stop if null). The handler:

1. **Anchor:** reads the source position — from the corner if the source is the pointer (`posl`), else from the centre (`posx`) — and lifts the bubble 30px above.
2. **Side:** compares the anchor against the screen centre to choose which way the bubble's tail points (`va95` → pose 0 or 1).
3. **Plane:** if the speaker is in the GUI (`plne ≥ 8500`) the bubble is drawn at plane 10005 (in front of everything); otherwise at 8505 (front of the world, behind the GUI).
4. **Bubble:** creates a `1 2 9` compound (`speech_bubbles`), sets a 20-tick lifetime, and writes the text into a fixed-text part. It picks progressively larger bubble frames (2 / 4 / 6 / 8) and widths based on how many pages the text needs (`npgs`), so the bubble grows to fit longer speech.
5. Floats the bubble relative to the source (`frel _p2_`) and positions it, nudging left for right-side speakers.

## Agent 1 2 9: Speech Bubble

| Event | Number | Description |
|---|---|---|
| Timer | 9 | `kill ownr` — the bubble self-destructs after its 20-tick lifetime |

## Removal Script

```
rscr
enum 1 2 9
    kill targ
next
enum 1 2 10
    kill targ
next
scrx 1 2 9 9
scrx 1 2 10 126
```

Kills the factory and any live bubbles and removes their scripts.

## Impact on Stimulus / Room CA

None. Speech bubbles are transient visual overlays; they emit no stimuli and do not affect Room CA.
