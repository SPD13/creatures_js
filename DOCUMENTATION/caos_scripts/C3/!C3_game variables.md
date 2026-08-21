# !C3_game variables.cos - Global Game Configuration

**Source**: `Assets/Bootstrap/001 World/!C3_game variables.cos`

## Overview

This bootstrap script initializes all core game variables that configure the Creatures 3 engine at startup. It does not create any agents. Instead, it sets global `game` variables that control engine behavior, time progression, creature defaults, audio settings, rendering parameters, and world limits. These variables are read by various engine subsystems and by other CAOS scripts throughout the game.

The script runs very early in the bootstrap sequence (indicated by the `!` prefix in its filename, which forces alphabetical priority within the `001 World` folder). After setting all variables, it calls `rgam` to force the engine to immediately refresh its internal state from the newly written game variables, ensuring all subsystems pick up the new configuration before any subsequent bootstrap scripts execute.

This script is the central configuration file for the entire Creatures 3 world — it defines the rules of time, creature population caps, physics defaults, learning behavior, compression, and rendering depth.

## No Created Agents

This script does not create any agents. It exclusively sets global game variables using the `setv game` and `sets game` CAOS commands.

---

## Game Variables Reference

### Audio Settings

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_usemidimusicsystem` | Integer | `0` | Controls the music system. When `0`, uses the default MNG (Munged) music system. When non-zero, switches to MIDI music playback. |
| `engine_near_death_track_name` | String | `"events.mng\\NearDeath"` | The music track played when a creature is near death. References the `NearDeath` track inside `events.mng`. Read by the World music system to trigger dramatic audio during life-threatening moments. |

### Time System

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_LengthOfDayInMinutes` | Integer | `20` | Length of a single game day in real-time minutes. The day is divided into periods (dawn, morning, afternoon, evening, night) based on this value. Affects the `TIME` CAOS command return value. |
| `engine_LengthOfSeasonInDays` | Integer | `4` | Number of game days per season. Used by the `DATE` CAOS command to compute the current day within the season (0 to SeasonLength−1). |
| `engine_NumberOfSeasons` | Integer | `4` | Number of seasons per game year. Combined with `engine_LengthOfSeasonInDays`, the total year length = 4 seasons × 4 days = 16 game days. The four seasons map to Spring, Summer, Autumn, and Winter. |

With these settings, a full game year takes 16 days × 20 minutes = **320 real-time minutes (~5.3 hours)**.

### Creature Limits

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_creature_template_size_in_mb` | Integer | `2` | Memory allocation size (in MB) for creature sprite gallery templates. Each life stage's sprite set must fit within this limit. The original engine default is 1 MB; this raises it to 2 MB for safety. |
| `c3_max_norns` | Integer | `10` | Maximum number of Norns allowed in the world simultaneously. Checked by breeding scripts before hatching new Norns. |
| `c3_max_creatures` | Integer | `14` | Maximum total number of all creatures (Norns, Grendels, Ettins, Shee) allowed in the world simultaneously. Must be ≥ `c3_max_norns`. Enforced by breeding scripts. |

### Creature Selectability

| Variable | Type | Value | Description |
|---|---|---|---|
| `Grettin` | Integer | `0` | Controls creature selectability for music and interaction. When `0`, only Norns are selectable. When `1`, all creature types (Grendels, Ettins, etc.) become selectable. Named after an internal developer reference. |

### Default Creature Properties

These variables define the default physical and behavioral properties applied to newly hatched or imported creatures. They are read by the creature breeding/hatching scripts (e.g., `creatureBreeding.cos`, `Hatchery2.cos`).

| Variable | Type | Value | Decoded Value | Description |
|---|---|---|---|---|
| `c3_creature_accg` | Integer | `5` | — | Default gravitational acceleration for creatures. Applied via the `ACCG` CAOS command at birth. |
| `c3_creature_bhvr` | Integer | `15` | Activate1 (1) + Activate2 (2) + Deactivate (4) + Hit (8) | Default creature permissions (behavior). Defines what actions creatures can perform on other agents. Creatures can activate, deactivate, and hit agents, but cannot eat (16) or pick up (32) by default. |
| `c3_creature_attr` | Integer | `198` | Mouseable (2) + Activateable (4) + SufferCollisions (64) + SufferPhysics (128) | Default agent attributes for creatures. Creatures can be picked up by the mouse, activated by clicking, collide with room boundaries, and are subject to physics (gravity, velocity). They are NOT carryable by other agents (1), invisible (16), or floatable (32). |
| `c3_creature_perm` | Integer | `100` | — | Default permeability value (0–100). A value of 100 means creatures can pass through all room boundaries freely. Lower values restrict movement through walls. |

### Metaroom Transition

| Variable | Type | Value | Description |
|---|---|---|---|
| `c3_meta_transition` | Integer | `0` | Controls metaroom camera transition style. Used by the `META` CAOS command when switching between metarooms (e.g., through corridor doors). A value of `0` means no special transition effect. Other scripts (corridor doors, toolbar, etc.) read and write this variable to coordinate smooth camera transitions between areas of the Ark. |

### Engine Behavior

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_synchronous_learning` | Integer | `0` | Controls creature learning mode. When `0` (asynchronous), creatures learn from all stimuli in their environment regardless of source. When `1` (synchronous), creatures only learn from stimuli caused by actions they are currently thinking about, performed by the agent they are paying attention to. Asynchronous mode is the default and more forgiving for gameplay. |
| `engine_zlib_compression` | Integer | `5` | Zlib compression level for saved worlds and archives (0–9). `0` = no compression, `1` = fastest, `9` = best compression. The original engine default is 6; this sets it slightly lower at 5 for a balance of speed and size. |

### Rendering

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_plane_for_lines` | Integer | `8500` | The rendering z-plane at which debug and connector lines are drawn. Higher values render in front of more objects. The original engine default is 9998; this lowers it to 8500 so lines appear behind the topmost UI elements but above most game agents. |

---

## Script Termination

The script ends with `rgam` (**R**efresh **G**ame variables), which forces the engine to immediately re-read all game variables and apply them to the running subsystems. This calls `App::RefreshGameVariables()` internally, which updates:

- **App-level settings**: Audio system, creature template size, line rendering plane, compression, etc.
- **World-level settings**: Day length, season length, year calculation, synchronous learning mode, etc.

Without `rgam`, the engine would not pick up the new variable values until the next full initialization cycle. Since this script runs during bootstrap, `rgam` ensures all subsequent bootstrap scripts operate with the correct configuration.
