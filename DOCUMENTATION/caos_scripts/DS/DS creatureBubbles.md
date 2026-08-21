# DS creatureBubbles.cos — Drowning Bubble Behaviour

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS creatureBubbles.cos`

## Overview

This script defines the behaviour of the **drowning bubble** agent (`1 2 41`) — the short visual effect that rises above a creature's head while it is drowning underwater. It is the Docking Station counterpart of the Creatures 3 [creatureBubbles](../C3/creatureBubbles.md) and behaves identically.

The bubbles are **not created here** — they are spawned by `DS creatureInvoluntary` (the drowning involuntary action) with `new: simp 1 2 41 "bubs" …`, storing the owner creature in `ov00` and an animation counter in `ov01`. This script provides only the timer behaviour that animates, repositions and cleans them up.

## No Created Agents

This script creates no agents. It defines the timer script for the drowning bubble (`1 2 41`), which is created by the involuntary-action scripts.

## Agent 1 2 41: Drowning Bubble

| Variable | Meaning |
|---|---|
| ov00 | Owner creature reference |
| ov01 | Animation tick counter (0–10) |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Reposition and animate the bubble; self-destruct when done |

#### Event 9 — Timer

1. **Lifetime:** if `ov01 ≥ 10` the animation is finished → `kill ownr`.
2. **Owner valid:** if `ov00` is null → `kill ownr`.
3. **Owner state:** target the owner; if it is asleep (`aslp ≠ 0`), dead, unconscious, or no longer drowning (breathing locus `loci 1 1 4 9 ≠ 0.0`) → `kill ownr`.
4. **Positioning:** place the bubble at the creature's right edge minus the bubble width when facing east (`dirn = 2`), else at its left edge; vertically at the creature's top minus 75% of its height (so bubbles appear above the head).
5. **Animation:** on the first tick (`ov01 = 0`), set `frat 2` and start the `anim [0…9 255]` sequence.
6. Increment `ov01`.

### Removal Script

```
rscr
enum 1 2 41
    kill targ
next
scrx 1 2 41 9
```

Kills all drowning bubbles and removes the timer script.

## Impact on Stimulus / Room CA

None. The bubble is a purely visual, short-lived (≤10 ticks), self-cleaning effect; it emits no stimuli and does not affect Room CA.
