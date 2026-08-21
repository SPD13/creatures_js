# waterplant

## Overview

Ambient underwater decoration bootstrap for the Shee ark. Installs three `waterplant` simple agents (family 2, genus 4, species 2) along the ocean floor around coordinates `(3815–3912, 900)`. Each plant loops through an 8-frame swaying animation and, on its timer, spawns a child `bubble` agent (family 2, genus 6, species 3) just above itself. Each parent maintains a population cap of up to 10 bubbles; after the first bubble is spawned, further timer fires only nudge the existing bubble by sending it message 300 (which makes the bubble rise/emit for a while before decrementing the parent's counter).

The removal script (`rscr`) kills every `2 4 2` waterplant instance. The associated bubble agents (`2 6 3`) are not explicitly killed by the bootstrap; they rely on their own lifecycle to terminate.

## Created Agents

| Classifier | Name | High-level function | Details |
|------------|------|---------------------|---------|
| 2 4 2 | waterplant | Animated sea-floor plant that spawns bubbles on a timer | [waterplant](#waterplant-2-4-2) |
| 2 6 3 | bubble | Child bubble agent spawned by a waterplant, tracked by the parent | [bubble](#bubble-2-6-3) |

## waterplant (2 4 2)

Three simple agents created from the `waterplant` sprite file (8 sprites, starting at image 6000 / 500 / 3000). Each has `attr 192` (suffer collisions + suffer physics), `elas 0` (no bounce), and animates through frames 0–7 in a loop. The three instances are placed at `(3848, 900)`, `(3815, 900)`, and `(3912, 900)` with timer intervals of 700, 650, and 600 ticks respectively — staggered so that their bubbling behaviour is not synchronised.

Per-agent state:
- `ov17` — pointer to the child bubble agent (initialised to `null`).
- `ov60` — current number of active bubble emissions counted against the cap.
- `ov61` — maximum bubble emissions before the timer goes quiet (set to `10`).

| Event | Number | Human description |
|-------|--------|-------------------|
| Timer | 9 | Periodic bubble management tick |

**Timer (event 9)** — If the plant has no bubble yet (`ov17 == null`), it creates a bubble child agent just above-right of itself:
- Position: parent `posl + 22`, `post + 76`.
- Plane: parent plane + 1 (rendered in front of the plant).
- Uses `new: simp 2 6 3 "waterplant" 1 16` (1 sprite plane, base image 16 of the same sprite file).
- Cross-links the two agents: the bubble's `ov17` is set to the waterplant, and the waterplant's `ov17` is set to the new bubble.

If a bubble already exists, the script instead emits message 300 to that bubble (telling it to puff again) and increments `ov60`. Once `ov60` reaches `ov61` (10), the timer effectively stops triggering new emissions until the bubble's own tick script decays `ov60` back down.

No stimulus emissions and no direct Room CA changes; the waterplant is a purely visual/ambient element.

## bubble (2 6 3)

Child agent spawned by a `waterplant` parent. Represented by a single sprite (plane = parent plane + 1) drawn from base image 16 of the `waterplant` sprite file. Its lifetime counter `ov51` and activity flag `ov99` are driven by the two event scripts below; the back-pointer `ov17` holds the parent waterplant so the bubble can notify it on completion.

| Event | Number | Human description |
|-------|--------|-------------------|
| Message | 300 | "Puff" message from parent waterplant |
| Timer   | 12  | Bubble lifetime decay tick |

**Message 300** — Increments `ov51` (remaining puff duration) by 1 and sets `ov99 = 1` to mark the bubble as active. This is sent by the parent on each timer tick where a bubble already exists, stacking up bubble "energy" proportional to how long the parent has been active.

**Timer (event 12)** — If `ov99 == 0` the bubble is idle and the script exits immediately. Otherwise it decrements `ov51` by 1; once `ov51` drops to 1 or below, the bubble clears `ov99` to go idle. In both cases, it then targets the parent waterplant (`ov17`) and, if still present, decrements the parent's `ov60` — freeing one slot in the parent's bubble-emission cap so the parent can schedule another puff.

No stimulus emissions and no direct Room CA changes.
