# speech bubble factory.cos - Speech Bubble Spawner

**Source**: `Assets/Bootstrap/001 World/speech bubble factory.cos`

## Overview

This script installs an invisible **speech bubble factory** singleton that, on request, spawns short-lived on-screen speech bubbles above a speaking agent (typically a creature or the hand/pointer). The factory itself is a single hidden simple agent (`1 2 10 "blnk"`) that sits on plane 1 and receives a message whose parameters are the text to render (`_p1_`) and the speaker agent (`_p2_`). On receipt it creates a compound agent (`1 2 9 "speech_bubbles"`) positioned above the speaker, renders the text into one of four progressively larger bubble sprites (sized so the text fits on a single page), flips the bubble's tail to point left or right depending on which half of the screen the speaker is in, attaches the bubble to the speaker with `frel`, and sets a 20-tick self-destruct timer.

The script is text-rendering plumbing — it does not affect biochemistry, stimuli, or room CAs.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 10 | Speech Bubble Factory | `blnk` frame 0 | Invisible singleton that spawns speech bubbles on demand | [Detail](#speech-bubble-factory-1-2-10) |
| 1 2 9 | Speech Bubble | `speech_bubbles` | Short-lived text bubble rendered above a speaker | [Detail](#speech-bubble-1-2-9) |

---

## Speech Bubble Factory (1 2 10)

An invisible manager agent. It exists solely to receive event **126** (the "say it" request) and translate the request into a visible, positioned, text-rendered compound speech bubble attached to the speaker.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| `new: simp` | 1 2 10 "blnk" 0 1 0 | Simple agent, blank sprite, 1 frame, plane 0 |
| `attr` | 48 | Invisible (16) + Floatable (32) — never drawn, not affected by physics |

No position, tick, click behaviour, or ports — it is a pure message target.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 126 | Say It (speech request) | Spawns a speech bubble above `_p2_` rendering the text `_p1_` |

#### Event 126 — Say It

Called with:
- `_p1_` = text string to display.
- `_p2_` = speaker agent (creature, pointer, or any agent that should appear to "say" something).

Behaviour:
1. If `_p2_` is `null`, stops immediately — no speaker, no bubble.
2. Targets the speaker (`targ _p2_`).
3. Computes the bubble's anchor X (`va90`):
   - If the speaker is **not** the pointer → use the agent's world X (`posx`).
   - If the speaker **is** the pointer → use the agent's left edge (`posl`).
4. Computes the bubble's anchor Y (`va91`) as `post − 30` (30 pixels above the speaker's top).
5. Computes the screen horizontal midpoint (`va92 = (wndl + wndr) / 2`).
6. Chooses bubble pose (`va95`) based on which half of the screen the speaker is in — this flips the bubble's tail:
   - Left half (`va90 < va92`) → pose 0 (tail points right, bubble body on the right).
   - Right half → pose 1 (tail points left, bubble body on the left).
7. Chooses rendering plane (`va10`):
   - If the speaker's plane ≥ 8500 → bubble plane = 10005 (render in front of high-plane speakers such as UI/pointer).
   - Otherwise → bubble plane = 8490 (render above the in-world speaker but below UI).
8. Creates the bubble compound agent: `new: comp 1 2 9 "speech_bubbles" 2 2 va10` (2 images, base image 2, computed plane).
9. Configures the new bubble:
   - `tick 20` — auto self-destruct in 20 ticks (~2/3 second at 30 fps).
   - `attr 48` — invisible to collision / floatable (behaves as a floating overlay, not a physical object).
   - **Part 0**: sized bubble frame; `pose va95` selects left/right tail orientation.
   - **Part 1**: text rendering part. `frmt 12 12 12 5 0 0 0` sets margins/line height/alignment for the text overlay; `ptxt _p1_` loads the caller's string.
10. Progressive sizing — the script tries four increasingly large bubble sprite pairs and picks the smallest one whose text fits on a single page (`npgs = 1`). Each attempt kills and re-creates part 1 with a larger sprite:

    | Attempt | `pat: fixd` sprite offset | X back-off (`va94`) |
    |---|---|---|
    | 1 (default) | `speech_bubbles` 2 | 102 |
    | 2 | `speech_bubbles` 4 | 155 |
    | 3 | `speech_bubbles` 6 | 230 |
    | 4 | `speech_bubbles` 8 | 319 |

    If the text still doesn't fit on a single page after attempt 4, the fourth (largest) bubble is used as-is.
11. Attaches the bubble to the speaker with `frel _p2_` — the bubble follows the speaker as it moves.
12. Adjusts the bubble's X so its tail lands near the speaker: if the speaker is on the right half of the screen (`va90 ≥ va92`), subtract `va94` so the bubble grows leftward into visible space.
13. Moves the bubble to the computed `(va90, va91)`.

This event is the single public entry point of the entire speech-bubble subsystem.

---

## Speech Bubble (1 2 9)

The actual on-screen bubble, a compound agent with a bubble part (part 0) and a text part (part 1). Created dynamically by the factory — there is no bootstrap creation of this family/genus/species. Lives for 20 ticks then removes itself.

### Dynamic Configuration (set by the factory, not bootstrap)

| Property | Value |
|---|---|
| `new: comp` | 1 2 9 "speech_bubbles" 2 images, first image 2, plane 8490 or 10005 |
| `attr` | 48 (Invisible collision / Floatable) |
| `tick` | 20 |
| Part 0 | Bubble sprite (pose 0 = tail right, pose 1 = tail left) |
| Part 1 | Text-rendering part with `frmt 12 12 12 5 0 0 0` and the caller-supplied string |
| Attachment | `frel` to speaker — bubble follows the speaker |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Self-destructs the bubble (`kill ownr`) |

#### Event 9 — Timer

Fires once after the 20-tick lifetime set in the factory. Runs `kill ownr`, removing the bubble from the world. There is no other cleanup — the text part and sprite are released with the agent.

---

## Removal Script (rscr)

Cleanly uninstalls the entire subsystem:

1. `enum 1 2 9` → `kill targ` — destroys any live speech bubbles still on screen.
2. `enum 1 2 10` → `kill targ` — destroys the invisible factory singleton.
3. `scrx 1 2 9 9` — removes the speech bubble timer script.
4. `scrx 1 2 10 126` — removes the factory's "say it" handler.
