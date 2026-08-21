# XBioenergy incrementer.cos - Bioenergy Resource Generator

**Source**: `Assets/Bootstrap/001 World/XBioenergy incrementer.cos`

## Overview

This script creates an invisible background agent that passively recharges the global `"Bioenergy"` game variable over time. Every 100 ticks (~5 seconds at 20 ticks/sec), it increments `"Bioenergy"` by 1, capping it at 1000. After each increment, it sends message 500 to the Creator bioenergy bar (3 3 22) and the Replicator bioenergy bar (3 3 28) so they can update their visual displays.

Bioenergy is a shared energy pool used by several ship systems. The Creator machine consumes Bioenergy to inject new agents into the world, the Replicator consumes it to duplicate creatures, and production machines (cheese machine, medicine maker) draw from it to manufacture items. The Recycler adds energy back when objects are recycled. This incrementer provides a slow, steady passive income so the pool gradually refills even without active recycling.

Starting from zero, the pool reaches its maximum of 1000 after approximately 83 minutes of game time.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 105 | Bioenergy Incrementer | `blnk` frame 0 | Invisible timer agent that passively recharges the global Bioenergy pool | [Detail](#bioenergy-incrementer-1-1-105) |

---

## Bioenergy Incrementer (1 1 105)

An invisible simple agent that runs a timer script to slowly recharge the ship's Bioenergy reserve. It uses the `blnk` (blank) sprite so it has no visual presence in the world.

### Properties

| Property | Value | Notes |
|---|---|---|
| `tick` | 100 | Timer fires every 100 ticks (~5 seconds) |
| Sprite | `blnk` | Blank/invisible sprite |
| Plane | 0 | Default plane (invisible, so irrelevant) |

### Initial Placement

| Instance | Position | Notes |
|---|---|---|
| 1 | (1000, 300) | Off-screen background position |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Increment Bioenergy by 1 (cap 1000), notify Creator and Replicator bars |

---

#### Event 9 -- Timer

Fires every 100 ticks. Performs two functions:

**1. Bioenergy Increment**

Checks if `game "Bioenergy"` is less than 1000. If so, increments it by 1. If it has somehow reached or exceeded 1000, it is clamped back to 1000. This ensures the pool never exceeds its maximum.

**2. UI Bar Notification**

After updating the value, sends `mesg writ targ 500` to:
- A random agent of classifier **3 3 22** (Creator bioenergy bar) -- this bar visually represents the current Bioenergy level on the Creator machine interface.
- A random agent of classifier **3 3 28** (Replicator bioenergy bar) -- this bar visually represents the current Bioenergy level on the Replicator machine interface.

Message 500 is a custom update signal. When the Creator or Replicator bars receive this message, they recalculate their horizontal position based on the current `game "Bioenergy"` value, sliding to reflect the updated energy level.

Note: `rtar` selects a random agent of the given classifier. If no agent of that classifier exists (e.g., the Creator or Replicator hasn't been bootstrapped yet), `targ` will be null and the `mesg writ` will silently fail.

---

## Bioenergy Economy Summary

| System | Role | Bioenergy Effect |
|---|---|---|
| **XBioenergy Incrementer** (1 1 105) | Passive generation | +1 per 100 ticks (this script) |
| **Recycler** | Active generation | Adds energy when objects are recycled |
| **Creator** (3 3 22) | Consumer | Subtracts cost per agent injection |
| **Replicator** (3 3 28) | Consumer | Subtracts 100 per creature duplication |
| **Cheese Machine** | Consumer | Subtracts 30 per cheese item |
| **Medicine Maker** | Consumer | Subtracts energy per medicine created |
| **Maximum** | Cap | 1000 units |
