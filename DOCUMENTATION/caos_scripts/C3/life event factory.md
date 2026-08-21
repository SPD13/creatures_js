# Life Event Factory

## Overview

This script implements a life event notification system that displays visual banners in the game's UI whenever significant creature life events occur — birth, death, pregnancy, or egg-laying. When a life event is detected, the factory creates an animated banner that slides into a notification bar at the top of the screen. Clicking a banner pans the camera to the creature involved. For birth events, the system also schedules a delayed photograph of the newborn creature and stores it in its history. The notification banners stack horizontally and scroll to accommodate overflow, providing the player with an at-a-glance feed of population activity.

The system also respects the `"Grettin"` game variable: when `Grettin` is `0` (default, Norns-only mode), life event banners are only shown for Norns (genus 1). Death events for non-Norns are silently marked as "don't register" in the creature's history instead of displaying a banner.

Music stingers accompany birth and death events: `"events.mng\Birth"` and `"events.mng\Death"` respectively.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 1 2 24 | [Life Event Factory](#life-event-factory-1-2-24) | Invisible singleton agent that listens for life events and spawns notification banners |
| 1 2 25 | [Life Event Banner](#life-event-banner-1-2-25) | Clickable UI banner displaying a life event icon; pans camera to the creature on click |
| 1 2 37 | [Birth Photo Taker](#birth-photo-taker-1-2-37) | Temporary agent that takes a delayed photograph of a newborn creature |

---

## Life Event Factory (1 2 24)

Invisible singleton agent (`"blnk"` sprite, `attr 16`) that acts as the central dispatcher for creature life events. It receives life event notifications via message 127 and orchestrates the creation of notification banners and, for births, photo-taking agents.

The factory maps history event types to banner poses:

| History Type | Event | Banner Pose |
|---|---|---|
| 7 | Died | 0 |
| 11 | Egg Laid | 1 |
| 3 | Born | 2 |
| 8 | Became Pregnant | 3 |

Any other event type causes the script to stop without creating a banner.

### Events

| Event | Number | Description |
|---|---|---|
| Life Event | 127 | Receives a life event notification with `_p1_` = creature moniker, `_p2_` = history event index |

### Life Event (Event 127) — Main Dispatch Logic

Triggered when a creature life event occurs. Parameters: `_p1_` = moniker of the creature, `_p2_` = index of the history event.

**Event type resolution**: Reads `hist type _p1_ _p2_` to determine the event type and maps it to a banner pose (see table above). Unrecognized event types cause an immediate `stop`.

**Birth photo scheduling**: For birth events (type 3), if the creature exists in the world (`mtoc`), creates a Birth Photo Taker agent (1 2 37) with a random timer delay of 90–120 ticks. This allows the newborn to settle before the photo is taken.

**Grettin filter**: When `game "Grettin"` is `0` (Norns-only mode), checks `hist gnus` to see if the creature is a Norn (genus 1). If not:
- For death events (type 7): writes "don't register" to the creature's history text and stops.
- For other events: stops without creating a banner.

This ensures that in the default game mode, only Norn life events produce UI notifications.

**Music stingers**: Plays themed music tracks:
- Birth (type 3): `"events.mng\Birth"` at priority 30
- Death (type 7): `"events.mng\Death"` at priority 20

**Banner positioning**: Enumerates all existing life event banners (1 2 25) to find the rightmost one. The new banner is placed immediately to the right of the last banner, creating a horizontal notification bar.

**Banner creation**: Creates a new Life Event Banner (1 2 25) with:
- `"life_events"` sprite (4 frames, 8505 first image)
- `clac 1000` — click activation triggers event 1000
- `attr 308` — floating relative to camera, mouse-transparent
- `plne 9000` — rendered on a high UI plane
- Positioned at the calculated horizontal offset, y=90

**Creature tracking**: Looks up the creature by moniker (`mtoc`, falling back to `mtoa`). If found and in a valid room (not in inventory), stores the creature's position in `ov01`/`ov02`. Otherwise stores (0, 0).

**Overflow handling**: If the total banner width exceeds half the viewport width, triggers a scroll animation on all existing banners by setting their `tick` to 1 and marking overflow banners with `ov98 = 1` for removal after scrolling.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov99` | Horizontal offset accumulator (tracks total width of stacked banners) |

---

## Life Event Banner (1 2 25)

Clickable UI banner displayed at the top of the screen showing a life event icon (birth, death, pregnancy, or egg-laying). When clicked, the camera pans to the associated creature. Banners stack horizontally and scroll left when overflow occurs. Uses the `"life_events"` sprite with pose determined by event type.

### Events

| Event | Number | Description |
|---|---|---|
| Click | 1000 | Player clicks on the banner — pans camera to the creature |
| Timer | 9 | Scrolling animation to shift banners left when overflow occurs |

### Click (Event 1000) — Camera Pan and Cleanup

When the player clicks a banner:

1. **Pushes other banners**: Enumerates all other banners (1 2 25) positioned to the right and shifts their offset (`ov99`) by the clicked banner's width, triggering their scroll animation.

2. **Camera pan**: If the associated creature (`ov00`) exists and is in a valid room (not in the inventory agent), uses `cmrt 0` to smoothly pan the camera to the creature. If the creature is of type 7 (creature), also selects it as the active Norn via `norn`. If the creature is not in a valid room or doesn't exist, pans the camera to the stored last-known position (`ov01`, `ov02`) using `cmrp`.

3. **Birth notification**: For birth events (`ov03 = 3`), sets `ov81 = 1` on the newborn creature. This signals to the creature's involuntary scripts that the player has been notified of the birth, allowing the body decomposition/death system to proceed if the creature dies.

4. **Self-removal**: Kills the banner after processing the click.

### Timer (Event 9) — Scroll Animation

Handles smooth leftward scrolling when banners need to shift:

- Moves the banner left by 8 pixels per tick, decrementing `ov99` accordingly.
- When `ov99` reaches 0, the banner has arrived at its target position and the timer stops (`tick 0`).
- If `ov98` is set (marked for removal due to overflow), the banner is killed instead of stopping — this removes the oldest banners when the notification bar becomes too wide.
- On removal, also handles the birth notification (`ov81 = 1`) for birth events, ensuring the signal is sent even if the banner is auto-dismissed.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Reference to the associated creature agent |
| `ov01` | Stored x-coordinate of the creature at event time |
| `ov02` | Stored y-coordinate of the creature at event time |
| `ov03` | History event type (3=born, 7=died, 8=pregnant, 11=egg laid) |
| `ov98` | Overflow removal flag (1 = remove after scroll completes) |
| `ov99` | Remaining scroll distance in pixels |

---

## Birth Photo Taker (1 2 37)

Temporary invisible agent (`"blnk"` sprite) created when a creature is born. After a random delay of 90–120 ticks (to let the newborn settle into the world), it takes a photograph of the creature and records it in the creature's history. The agent then destroys itself.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Takes a photograph of the newborn creature and records it in history |

### Timer (Event 9) — Photograph and Record

When the timer fires:

1. **Snapshot**: If the referenced creature (`ov00`) still exists, generates a unique photo name from the creature's moniker and history event count, then takes a snapshot (`snap`) at the creature's position (119×139 pixels, zoom 100).

2. **History recording**: Adds a "Photographed" event (type 13) to the creature's history via `hist evnt`, then associates the snapshot image with the previous history event (the birth event) via `hist foto`.

3. **Validation**: Uses `dbg: asrt` to verify the most recent history event is indeed type 13 (Photographed), serving as a debug assertion.

4. **Self-removal**: Kills itself after completing the photo.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Reference to the newborn creature agent |
| `ov01` | Moniker string of the creature |

---

## Removal Script

The removal script (`rscr`) cleans up all three agent types when the script is unloaded:
- Kills all Life Event Factory agents (1 2 24)
- Kills all Life Event Banner agents (1 2 25)
- Kills all Birth Photo Taker agents (1 2 37)
