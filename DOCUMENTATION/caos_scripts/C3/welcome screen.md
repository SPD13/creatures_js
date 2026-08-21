# welcome screen.cos - Initial Welcome Screen & Starter Creature Import

**Source**: `Assets/Bootstrap/001 World/welcome screen.cos`

## Overview

This script implements the **welcome screen** shown the very first time a fresh Creatures 3 world is started. The screen is a centered GUI panel displaying a title/description text and two large buttons. The left button imports the two **starter family (SFAM)** creatures into the world (via `PRAY IMPO`) using a teleport-in animation and names the imported creatures. The right button triggers an interactive welcome demonstration using creatures already present in the world, making them perform a scripted message sequence (likely the in-game Norn tutorial / "look at this" flow).

The agent is positioned at the center of the game window on creation, and also re-centers itself on a `123` message (window resize handler). Once either button has completed its action, the welcome screen kills itself and all its teleport helpers — it is intentionally a one-shot introduction agent.

The script also ships with a standard removal script (`rscr`) that wipes all welcome-screen agents, any teleport effects, and any family-4 agents before cleaning up.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 2 26 | Welcome Screen Panel | `euro welcome screen` | Full-screen welcome GUI with two buttons and descriptive text; owns the import & demo flows | [Detail](#welcome-screen-panel-1-2-26) |
| 1 1 43 | Teleport Effect | `teleport` | Short-lived visual effect used while materialising each imported starter creature | [Detail](#teleport-effect-1-1-43) |
| 1 2 37 | Creature Nameplate (`blnk`) | `blnk` | Persistent nameplate overlay attached to each newly imported starter creature | [Detail](#creature-nameplate-1-2-37) |

---

## Welcome Screen Panel (1 2 26)

The main welcome panel. Created with a high plane (8950) so it sits on top of the game scene, attribute mask `288` (invisible-to-creatures, floatable) and `clac 0` (click action disabled on the base part — only the two button parts are clickable). It is built from three named parts:

| Part | Type | ID | Role |
|---|---|---|---|
| 0 | Body | — | Base sprite of the welcome panel |
| 1 | `butt` | 1001 | Left "Load Starter Family" button (message 1001) |
| 2 | `butt` | 1002 | Right "Start Demo" button (message 1002) |
| 4 | `fixd` | — | Fixed text part rendering the welcome paragraph in `WhiteOnTransparentChars` font |

The welcome text is assembled at creation from two entries of the `"Welcome Screen"` catalogue plus the current world name (`wnam`):

```
<catalogue[0]><world name><catalogue[1]>
```

It is centred on screen by computing `flto (wndw/2 - 260, wndh/2 - 157)` — i.e. the panel is 520×314 pixels.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1001 | Left button clicked | Import the starter family creatures (`SFAM` pray resources) |
| 1002 | Right button clicked | Run the welcome creature demo (scripted message sequence) |
| 123 | Custom — Re-centre | Re-float the panel to the window centre (e.g. on resize) |

#### Event 1001 — Load Starter Family

Triggered when the left button is clicked. Runs the full starter-family import flow under `lock` so no other part scripts can interrupt.

1. Animates part 1 on frame 0 (pressed state) and locks the animation with `over`.
2. Floats the welcome panel to `(7777, 500)` — effectively parks it off to one side while the teleport sequence plays in the world.
3. Plays the `events.mng\Birth` music track (`strk 40`) — the "birth" stinger for the new world.
4. Calls `pray refr` to refresh the PRAY resource index, then iterates **2 times** (`reps 2`) over all `SFAM` (Starter Family) pray resources via `pray next "SFAM" va00`.
5. For each starter family:
    - Records a history event (`hist evnt va00 0 "" ""`) associating the PRAY resource name with the creature history log.
    - **First iteration** places the teleport effect at world-x `1065, 772`; **second iteration** places it at world-x `800, 772` (same y). The exact teleport coordinate is also centred on the teleport sprite via `wdth/hght` offsets and nudged by `(+10, -35)`.
    - Creates a `1 1 43 "teleport"` effect at that position, points the camera at `(975, 784)` with `cmrp`, waits 1 tick, plays the `tele` sound, and runs the arrival animation `[0 0 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6]` on the teleport.
    - After the animation, imports the creature with `pray impo va00 1 1` (the "1 1" flags request full import including history). Plays the `cmc3` sound on arrival.
    - If the import succeeded (`va99 <= 1`): asserts `va99 = 1` in debug builds, logs history event via `hist evnt gtos 0 100 "" ""` (event type **100** on the imported creature), re-centres the camera on `(va10, va11)`, and if not already on the right-hand teleport spot, sets the creature to a Norn (`norn targ`) and re-aims the camera at `(975, 784)`.
    - Creates a **Creature Nameplate** (`1 2 37 "blnk"`) attached to the new creature, sets `ov00 = creature reference` and `ov01 = creature name` (`gtos 0`). Then issues `tick rand 90 120` on the nameplate to schedule its first timer.
    - Finally plays the reversed teleport animation `[6 6 6 5 5 5 4 4 4 3 3 3 2 2 2 1 1 0 0]` and `kill`s the teleport effect.
6. After both starter creatures are imported, sets the camera focus to the game-global `c3_default_focus` / `c3_default_focus_part` and calls `fcus` to hand input focus back to the world.
7. Kills the welcome panel itself (`kill ownr`) and releases the lock.

#### Event 1002 — Welcome Demo

Triggered when the right button is clicked. Orchestrates a scripted dialogue / gesture demonstration using creatures already present in the world. Runs under `lock`.

1. Animates part 2 on frame 0 (pressed state) and floats the panel off to `(7777, 500)`.
2. Targets a random **Bridge-style agent** (`rtar 2 22 3`) and, if one is found, repositions the camera at the room containing it (`cmrt 0`).
3. Targets a random **creature** (`rtar 3 3 31`) — a specific creature genus/species — to perform the demo on.
4. Randomly picks a path variant (`va02 = rand 0 1`) and iterates twice. On each iteration:
    - Waits 20 ticks on the second pass.
    - Waits in a polling loop (`wait 2` until `code = -1`) — i.e. until the creature's current voice/action has completed.
    - Sends either message **1004** (when `va01 = va02`) or message **1003** (when they differ) to the targeted creature. These are believed to be creature voice-line triggers.
    - Waits again for completion.
    - With 1-in-3 probability sends message **1000** once; with an additional 1-in-3 probability sends it a second time (two consecutive identical voice lines), each followed by a completion wait.
    - Finally sends message **1001** and advances the iteration counter.
5. Restores the `c3_default_focus` / `c3_default_focus_part` focus and calls `fcus` to return input focus to the world.
6. Kills the welcome panel and releases the lock.

#### Event 123 — Re-centre on Window Resize

Recomputes `(wndw/2 - 260, wndh/2 - 157)` and calls `flto` to re-anchor the panel at the new window centre. This is the same centring logic used at creation and allows the panel to follow window size changes before either button has been pressed.

---

## Teleport Effect (1 1 43)

Short-lived purely visual agent (`simp`, plane 5001) used during the starter-family import to give each arriving creature a "beam-in" animation. Created at the target teleport coordinate with a 9-frame sprite (`teleport`, base frame 11).

This agent carries **no event scripts of its own** in this bootstrap file — it is driven entirely externally by the welcome panel, which animates it forward on arrival, reverses the animation on departure, and then `kill`s it. No timer, collision or pickup behaviours are registered. The `rscr` removal block additionally wipes any stragglers via `enum 1 1 43 → kill targ`.

| Property | Value | Notes |
|---|---|---|
| `attr` | — | (default from `new: simp`) |
| `plne` | 5001 | Renders above normal world agents |
| Sprite | `teleport` | Base frame 11, 9 frames total |
| Sound | `tele` | Played once on arrival |

---

## Creature Nameplate (1 2 37)

A `blnk` agent (`simp`, family 1 genus 2 species 37, plane 0) that acts as a persistent nameplate/overlay attached to each freshly imported starter creature. It is created by the left-button flow and immediately configured with:

- `ov00` — reference to the owning creature agent (`seta ov00 va23`)
- `ov01` — owning creature's name (`sets ov01 va24`, from `gtos 0`)
- `tick rand 90 120` — first timer fires 90–120 ticks after creation

This script only creates the nameplate; its recurring behaviour (timer logic rendering the name above the creature) is implemented elsewhere (see other documentation files where `1 2 37` appears as a created agent, e.g. `life event factory`). The `rscr` block in this script does **not** remove `1 2 37` agents — nameplates persist beyond the welcome screen.

---

## Removal Script (rscr)

Invoked during bootstrap re-installation / world cleanup:

1. `enum 1 2 26 → kill targ` — removes every welcome screen panel.
2. `enum 1 1 43 → kill targ` — removes every teleport effect (shared classifier with other scripts — this will also wipe other transient teleport effects).
3. `enum 4 0 0 → kill targ` — removes **all family-4 agents** (creatures' body parts / creature heads are family 4 in C3). This is the standard C3 bootstrap pattern for clearing any partial creature remains left from a previous install.
4. `trck null 0 0 0 0` — detaches the camera tracker.

## External Interactions

| Target | Interaction | Context |
|---|---|---|
| `SFAM` pray resources | `pray next`, `pray impo` | Enumerates and imports starter family creatures |
| `Welcome Screen` catalogue | `read ... 0`, `read ... 1` | Reads the world-name prefix/suffix strings for the displayed paragraph |
| `events.mng\Birth` | `strk 40` | Plays the "birth" music stinger on starter import |
| `tele`, `cmc3` sounds | `snde` | Teleport arrival and creature-landing sounds |
| Creature (3 3 31) | `mesg writ` 1000 / 1001 / 1003 / 1004 | Drives the welcome demo's voice/action sequence |
| Bridge agent (2 22 3) | `rtar`, `cmrt 0` | Used to pick the camera vantage point for the demo |
| `c3_default_focus` / `c3_default_focus_part` game vars | `targ`, `part`, `fcus` | Restores normal input focus when the panel closes |

## History Events Recorded

| Event # | Context | Notes |
|---|---|---|
| 0 | `hist evnt <sfam> 0 "" ""` before import | Generic history marker associating the SFAM resource with the forthcoming creature |
| 100 | `hist evnt gtos 0 100 "" ""` after import | "Starter family / world-creation arrival" marker on the imported creature |
