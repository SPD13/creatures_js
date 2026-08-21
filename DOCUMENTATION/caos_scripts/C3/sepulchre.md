---
title: sepulchre
type: CAOS Script Documentation
---

# sepulchre.cos

**Source**: `Assets/Bootstrap/001 World/sepulchre.cos`

## Overview

This bootstrap script installs the **Sepulchre**, a mouse-activated transport device that moves the player's view to a different meta-room of the world. When the player clicks the sepulchre, it plays an animation, triggers a visual response on a paired destination agent (classifier `2 2 13`), and performs a `META` transition to meta-room `8` via the `c3_meta_transition` game command so the camera/view is centred on the destination agent.

The sepulchre only moves the **camera** (the `pntr`/player view), not any creature. If a creature activates it instead of the pointer (`from ne pntr`), no META transition happens — the creature simply receives a stimulus (`stim writ targ 95 1`) telling it that it has had a "disappointing" or noteworthy experience with the object. This makes the device effectively a one-way player-only teleporter that reacts differently to Norns who try to use it.

The script also handles the reverse/closing animation on both the sepulchre and its paired destination agent so the world remains visually consistent whether the transition occurred or not.

## Created Agents

| Classifier | Name | Role | Detail |
|---|---|---|---|
| 1 1 27 | Sepulchre | Compound agent that plays an animation on click and teleports the player view to meta-room 8 via a paired `2 2 13` destination agent | [Detail](#sepulchre-1-1-27) |

---

## Sepulchre (1 1 27)

A compound agent (`comp`) created with `new: comp 1 1 27 "sepulchre" 2 0 0` — sprite file `sepulchre`, image base 2, first image 0, plane 0. It has `attr 4` (mouse activation, i.e. clickable by the pointer), `clac 0` (click action activates event 1), a single overlay `pat: dull 1 "sepulchre" 2 67 74 1` (part 1 is a dull overlay at offset `(67, 74)`, first image 2, plane 1), and is positioned with `mvto 676 416`.

The sepulchre is tightly coupled to an existing `2 2 13` destination agent: its event 1 uses `rtar 2 2 13` to drive animations on that agent and, if activated by the pointer, calls `META 8 va00 va01 game "c3_meta_transition"` to change the active meta-room to `8` with the camera centred on that destination agent's world position.

### Events

| Event | # | Purpose |
|---|---|---|
| Message | 1 | Activate 1 — mouse click / primary activation; plays animation, fires META transition, then stimulates the activator if it is a creature |
| Message | 2 | Activate 2 / deactivate — plays the closing animation (used on re-entry / reset) |

#### Message 1 — Activate 1 (primary click)

The script immediately calls `lock` so that a second click during the animation cannot re-enter the script, plays the `"cd_1"` sound, and sets `clac -1` to temporarily disable further click activations while the sequence runs.

It then animates the sepulchre visually:

- `part 0` is set to frame `1` (door/portal "open" state).
- `part 1` is stepped through frames `[0..9]` at `frat 3` using `over` to wait for the animation to finish.

Once the sepulchre has opened, `rtar 2 2 13` retargets the paired destination agent. That agent is stepped through frames `[0..5]` at `frat 2` (its matching "open" animation). The destination agent's world position is captured into `va00`/`va01` (and into `va12`/`va13`, kept as a backup) using `posx` / `posy`.

If the activator is the pointer (`doif from eq pntr`) then the script:

1. Computes the top-left of a view centred on the destination by subtracting half the window width/height (`wndw / 2`, `wndh / 2`) from `va00` / `va01`.
2. Calls `meta 8 va00 va01 game "c3_meta_transition"` which switches the active meta-room to `8` and positions the view at `(va00, va01)` via the `c3_meta_transition` game command.
3. Retargets back to the sepulchre (`targ ownr`) and plays the reverse animation — part 1 through `[10 9 8 7 6 5 4 3 2 1 0]`, part 0 back to frame `0` — to visually close the device.

Regardless of whether the transition fired, the destination agent (`rtar 2 2 13`) is animated in reverse (`[5 4 3 2 1 0]`) to close it as well. The sepulchre then restores `clac 0` (re-enables clicks) and calls `inst` to flush the rest of the handler instantly.

Finally, the script retargets the activator via `targ from` and, if that activator exists (`targ ne null`) and belongs to family `4`, emits `stim writ targ 95 1` — writing stimulus `95` with strength `1` to that creature. This is how Norns that touch or activate the sepulchre are given a small reinforcement signal instead of being teleported.

Impact on the world / stimuli:

- **Camera / meta-room**: when activated by the pointer, the active meta-room changes to `8` and the view is re-centred on the paired `2 2 13` destination agent.
- **Stimulus**: creatures (family `4`) that activate it receive `stim writ 95 1` on themselves — a single-target stimulus write with stimulus id `95` and strength `1`.
- **Room CA**: no CA changes.

#### Message 2 — Activate 2 (reset / closing)

A shorter script used to play only the closing animation without running the transition. It disables clicks (`clac -1`), sets part 0 to frame `1`, steps part 1 through `[9 8 7 6 5 4 3 2 1 0]` using `over`, restores part 0 to frame `0` with `pose 0`, and re-enables clicks with `clac 0`. No META transition or stimulus is fired.

### Removal script

```
rscr
enum 1 1 27
    kill targ
next
scrx 1 1 27 1
scrx 1 1 27 2
```

On bootstrap re-run, all existing `1 1 27` agents are killed and the two event handlers are removed so the script can be cleanly re-installed.
