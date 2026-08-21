# Knowledge Stones.cos - Knowledge Stones

**Source**: `Assets/Bootstrap/001 World/Knowledge Stones.cos`

## Overview

This script creates three Knowledge Stones placed at different locations around the Creatures 3 world. Knowledge Stones are interactive learning objects that teach vocabulary to nearby creatures when activated. When a creature pushes (activates) a stone, it plays a glowing animation and a "know" sound effect, then scans the area for all creatures within range and teaches them vocabulary using the `vocb` command.

The three stones use the same "knowledge" sprite gallery but each starts at a different frame offset, giving them distinct visual appearances. They are placed in different areas of the ship to ensure creatures encounter them as they explore.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 24 1 | Knowledge Stone 1 | `knowledge` frame 0 | Vocabulary-teaching stone placed in the lower Norn area | [Detail](#knowledge-stone-1-2-24-1) |
| 2 24 2 | Knowledge Stone 2 | `knowledge` frame 6 | Vocabulary-teaching stone placed in the upper-right area | [Detail](#knowledge-stone-2-2-24-2) |
| 2 24 3 | Knowledge Stone 3 | `knowledge` frame 12 | Vocabulary-teaching stone placed in the lower-left area | [Detail](#knowledge-stone-3-2-24-3) |

---

## Knowledge Stone 1 (2 24 1)

A knowledge stone placed in the lower Norn area of the ship. When activated by a creature, it glows and teaches vocabulary to all creatures within sensing range.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `knowledge` | 6 images, first image 0 |
| Plane | 10 | Background layer |
| `attr` | 196 | Carryable + Suffers Physics + Collisions |
| `bhvr` | 1 | Activatable (push) |
| `elas` | 0 | No bounce |
| `clac` | -1 | Default click action |
| `perm` | 60 | Medium permeability |
| `accg` | 10 | Standard gravity |
| `fric` | 100 | Maximum friction |
| Position | (939, 1435) | Lower Norn area |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (Push) | Play animation, teach vocabulary to nearby creatures |

#### Event 1 -- Activate 1 (Push)

When a creature activates the stone:

1. Plays the "know" sound effect (`snde "know"`).
2. Plays a glowing animation cycling through all 6 frames multiple times: `[0 1 2 3 4 5 4 3 2 1 0 1 2 3 4 5 4 3 2 1 0 1 2 3 4 5 4 3 2 1 0 1 2 3 4 5 4 3 2 1 0]`.
3. Sets sensing range to 100 pixels (`rnge 100`).
4. Enumerates all creatures (classifier `4 0 0`) within sensing range using `esee`.
5. For each creature found, calls `vocb` to teach vocabulary words.

This means any creature within 100 pixels of the stone when it is activated will learn vocabulary, not just the creature that pushed it.

---

## Knowledge Stone 2 (2 24 2)

A knowledge stone with a different visual appearance (frame offset 6), placed in the upper-right area of the ship. Behavior is identical to Knowledge Stone 1.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `knowledge` | 6 images, first image 6 |
| Plane | 10 | Background layer |
| `attr` | 196 | Carryable + Suffers Physics + Collisions |
| `bhvr` | 1 | Activatable (push) |
| `elas` | 0 | No bounce |
| `clac` | -1 | Default click action |
| `perm` | 60 | Medium permeability |
| `accg` | 10 | Standard gravity |
| `fric` | 100 | Maximum friction |
| Position | (6512, 228) | Upper-right area |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (Push) | Play animation, teach vocabulary to nearby creatures |

#### Event 1 -- Activate 1 (Push)

Identical behavior to Knowledge Stone 1: plays "know" sound, glowing animation, and teaches vocabulary via `vocb` to all creatures (4 0 0) within 100 pixels.

---

## Knowledge Stone 3 (2 24 3)

A knowledge stone with a third visual appearance (frame offset 12), placed in the lower-left area of the ship. Behavior is identical to the other Knowledge Stones.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `knowledge` | 6 images, first image 12 |
| Plane | 10 | Background layer |
| `attr` | 196 | Carryable + Suffers Physics + Collisions |
| `bhvr` | 1 | Activatable (push) |
| `elas` | 0 | No bounce |
| `clac` | -1 | Default click action |
| `perm` | 60 | Medium permeability |
| `accg` | 10 | Standard gravity |
| `fric` | 100 | Maximum friction |
| Position | (1623, 3256) | Lower-left area |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (Push) | Play animation, teach vocabulary to nearby creatures |

#### Event 1 -- Activate 1 (Push)

Identical behavior to Knowledge Stone 1: plays "know" sound, glowing animation, and teaches vocabulary via `vocb` to all creatures (4 0 0) within 100 pixels.

---

## Remove Script (rscr)

The remove script cleans up all Knowledge Stone instances:
1. Kills all instances of each stone type (`enum 2 24 1`, `2 24 2`, `2 24 3` → `kill targ`)
2. Removes all associated event scripts using `scrx` for each classifier's event 1
