# waterspouts.cos — The Mesa Waterspouts

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/waterspouts.cos`

## Overview

This script places six invisible **waterspout** emitters (`1 1 167`) around the Norn Mesa that periodically spray **water droplets** (`1 1 168`). Each droplet falls and, when it lands, **waters and fertilises the soil** beneath it — adding water and nutrients to the room's CA. Together the waterspouts keep the Mesa's ground moist and fertile, sustaining the plant ecology (Tubas, Trappers, etc.). The droplets are invisible by default (a debug flag at the top can make them visible).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 167 | Waterspout Emitter | `blnk` | Invisible emitter that sprays water droplets — see [detail](#agent-1-1-167-waterspout-emitter) |
| 1 1 168 | Water Droplet | `blnk` | A falling droplet that irrigates the soil on landing — see [detail](#agent-1-1-168-water-droplet) |

Six emitters are placed across the upper, mid and lower Mesa, each with its own spray interval.

## Agent 1 1 167: Waterspout Emitter

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Spray 2–4 water droplets (`1 1 168`) with random outward/upward velocities |

## Agent 1 1 168: Water Droplet

A small physics droplet that falls under gravity.

| Event | Number | Description |
|---|---|---|
| Collision | 6 | On landing, **add water and nutrients to the room's CA**, then die |
| Timer | 9 | Expire and die |
| Custom | 255 | Die |

### Event 6 — Land

When the droplet hits the ground it reads its room (`grap`) and, if valid, raises that room's **CA 3 (water, +0.275)** and **CA 4 (nutrients, +0.15)** via `altr`, then removes itself.

## Removal Script

```
rscr
enum 1 1 167 / 1 1 168
    kill targ
next
scrx … (removes the emitter and droplet scripts)
```

Kills all waterspouts and droplets.

## Impact on Stimulus / Room CA

**Room CA only.** The waterspouts emit no creature stimuli. Their entire function is to **irrigate and fertilise the Mesa soil**: each landing droplet adds **CA 3 (water, +0.275)** and **CA 4 (nutrients, +0.15)** to the room it falls in (`altr`), keeping the ground moist and fertile so the plant ecology can thrive.
