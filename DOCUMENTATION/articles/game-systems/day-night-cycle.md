# Day/Night Cycle, Seasons, and Time System

## Overview

Creatures 3 uses a tick-based time system where all temporal values -- time of day, season, day within season, and years elapsed -- are derived on-the-fly from a single counter: the **world tick** (`myWorldTick` in the original engine, `currentTick` in JS). There are no separate hour, minute, or day member variables. Every time a CAOS script or engine system needs to know the time, it is computed from the current tick using the world's time configuration.

This design comes directly from the original engine.

## World Tick

The world tick is an unsigned 32-bit integer that increments by 1 each game tick, as long as the world is not paused. The default tick interval is **50ms**, giving **20 ticks per second**.

```
Tick increment: World::TaskSwitcher() increments myWorldTick++ each tick (when !myPausedWorldTick)
Overflow: resets to 0 at 0xFFFFFFFF (~6 years of continuous play)
Persistence: saved and loaded with the world file
```

The world tick is the single source of truth for all time calculations.

## Time Configuration

Four configurable values control the time system. They are set to defaults in the World constructor and can be changed at runtime via GAME variables and the RGAM command.

| Variable | Engine Name | Default | Description |
|----------|----------|---------|-------------|
| `dayLengthInMinutes` | `myDayLengthInMinutes` | **20** | Real-world minutes per game day |
| `seasonLengthInDays` | `mySeasonLengthInDays` | **3** | Game days per season |
| `seasonCount` | `mySeasonCount` | **4** | Number of seasons per year |
| `yearLengthInDays` | `myYearLengthInDays` | **12** | Computed: `seasonCount * seasonLengthInDays` |

The corresponding GAME variables are:
- `engine_LengthOfDayInMinutes`
- `engine_LengthOfSeasonInDays`
- `engine_NumberOfSeasons`

These can be set by bootstrap scripts and take effect when `RGAM` is called.

## Tick-to-Time Conversions

All time calculations start from a common formula for ticks per day:

```
ticksPerSecond = 1000 / tickInterval          = 20
ticksPerMinute = ticksPerSecond * 60           = 1,200
ticksPerDay    = ticksPerMinute * dayLength    = 1,200 * 20 = 24,000
ticksPerSeason = ticksPerDay * seasonLength    = 24,000 * 3 = 72,000
ticksPerYear   = ticksPerDay * yearLengthInDays = 24,000 * 12 = 288,000
```

With defaults, one game day = **20 real minutes**, one season = **60 real minutes**, one year = **4 real hours**.

## Time of Day

The day is divided into **5 equal periods** (the `NUMBER_OF_TIMES_OF_DAY` constant):

| Value | Period | Tick Range (default) |
|-------|--------|---------------------|
| 0 | Dawn | 0 -- 4,799 |
| 1 | Morning | 4,800 -- 9,599 |
| 2 | Afternoon | 9,600 -- 14,399 |
| 3 | Evening | 14,400 -- 19,199 |
| 4 | Night | 19,200 -- 23,999 |

Each period lasts `ticksPerDay / 5` = 4,800 ticks = **4 real minutes** with default settings.

### Algorithm

The original `GetTimeOfDay()` algorithm iterates backwards from Night to Dawn:

```
interval = worldTick % ticksPerDay

for x = 5 down to 1:
    if interval >= (x-1) * ticksPerDay/5  AND  interval < x * ticksPerDay/5:
        return x - 1

fallback: return 0 (Dawn)
```

The JS implementation in `World.getTimeOfDay(worldTick)` replicates this exactly.

## Seasons

The year is divided into `seasonCount` equal seasons (default 4):

| Value | Season | Day Range | Tick Range (default) |
|-------|--------|-----------|---------------------|
| 0 | Spring | Days 0-2 | 0 -- 71,999 |
| 1 | Summer | Days 3-5 | 72,000 -- 143,999 |
| 2 | Autumn | Days 6-8 | 144,000 -- 215,999 |
| 3 | Winter | Days 9-11 | 216,000 -- 287,999 |

### Algorithm

The original `GetSeason()` algorithm uses the same backward-iteration pattern:

```
ticksPerYear = ticksPerDay * yearLengthInDays
interval = worldTick % ticksPerYear

for x = seasonCount down to 1:
    if interval >= (x-1) * ticksPerYear/seasonCount  AND  interval < x * ticksPerYear/seasonCount:
        return x - 1

fallback: return 0 (Spring)
```

## Day Within Season

`GetDayInSeason()` returns which day of the current season it is (0 to `seasonLengthInDays - 1`):

```
ticksPerSeason = ticksPerDay * seasonLengthInDays
interval = worldTick % ticksPerSeason
dayInSeason = floor(interval / ticksPerDay)
```

With defaults, this returns 0, 1, or 2.

## Years Elapsed

`GetYearsElapsed()` returns the total number of complete game years since world creation:

```
ticksPerYear = ticksPerDay * yearLengthInDays
yearsElapsed = floor(worldTick / ticksPerYear)
```

## CAOS Commands

### Time Query Commands

| Command | Returns | Example Value |
|---------|---------|---------------|
| `TIME` | Time of day (0-4) | 2 (Afternoon) |
| `SEAN` | Season (0-3) | 1 (Summer) |
| `DATE` | Day within current season (0 to seasonLengthInDays-1) | 2 |
| `YEAR` | Years elapsed since world creation | 0 |
| `WTIK` | Current world tick (saved with world) | 48000 |
| `ETIK` | Engine tick (NOT saved, resets on restart) | 120000 |
| `DAYT` | Real-world day of month (system clock) | 15 |
| `MONT` | Real-world month (system clock) | 7 |

### Time Control

| Command | Usage | Description |
|---------|-------|-------------|
| `WPAU 1` | Command | Pause world ticks (days, seasons, delayed messages all stop) |
| `WPAU 0` | Command | Resume world ticks |
| `WPAU` | RV | Returns 1 if paused, 0 if running |

### Historical Time Queries

These return what the time was at a specific past tick, using the same algorithms with an explicit tick value:

| Command | Usage | Returns |
|---------|-------|---------|
| `HIST SEAN tick` | Query past season | Season at that tick |
| `HIST DATE tick` | Query past day-in-season | Day at that tick |
| `HIST YEAR tick` | Query past year | Year at that tick |

## Environmental Effects

The time of day drives room environmental properties updated each tick in `updateRoomEnvironment()`:

### Light Levels

| Time of Day | Light Level |
|-------------|-------------|
| Dawn | 0.5 |
| Morning | 0.9 |
| Afternoon | 1.0 |
| Evening | 0.6 |
| Night | 0.2 |

### Temperature

Temperature varies around a base of 0.5, offset by time of day:

| Time of Day | Offset | Temperature |
|-------------|--------|-------------|
| Dawn | +0.00 | 0.50 |
| Morning | +0.10 | 0.60 |
| Afternoon | +0.20 | 0.70 |
| Evening | +0.05 | 0.55 |
| Night | -0.15 | 0.35 |

These values feed into the CA (Cellular Automata) system, which diffuses them between connected rooms.

## Implementation Files

| File | Purpose |
|------|---------|
| `World.js` | `getTimeOfDay()`, `getSeason()`, `getYearsElapsed()`, `getDayInSeason()`, `getTicksPerDay()`, `updateRoomEnvironment()` |
| `commands/time/TIME.js` | CAOS TIME command |
| `commands/time/SEAN.js` | CAOS SEAN command |
| `commands/time/DATE.js` | CAOS DATE command |
| `commands/time/YEAR.js` | CAOS YEAR command |
| `commands/time/WPAU.js` | CAOS WPAU command |
| `commands/time/WTIK.js` | CAOS WTIK command |
| `commands/time/ETIK.js` | CAOS ETIK command |
| `commands/history/HIST_SEAN.js` | Historical season query |
| `commands/history/HIST_DATE.js` | Historical day-in-season query |
| `commands/history/HIST_YEAR.js` | Historical year query |

## Quick Reference

With default settings (20-min day, 3-day season, 4 seasons):

| Unit | Duration (real time) | Duration (ticks) |
|------|---------------------|-------------------|
| 1 time-of-day period | 4 minutes | 4,800 |
| 1 game day | 20 minutes | 24,000 |
| 1 season | 60 minutes | 72,000 |
| 1 year | 4 hours | 288,000 |
